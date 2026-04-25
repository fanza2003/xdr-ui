const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// 🔎 ELASTIC
const client = new Client({
  node: process.env.ELASTIC_URL || "http://localhost:9200",
});

// 🔑 API KEY ABUSEIPDB
const ABUSE_API_KEY = process.env.ABUSE_API_KEY;

// 🤖 N8N WEBHOOK (AI Threat Analysis)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// 🤖 Helper: trigger n8n workflow (fire-and-forget, non-blocking)
function triggerN8N(payload) {
  if (!N8N_WEBHOOK_URL) {
    console.log("⚠️ N8N_WEBHOOK_URL not set, skip AI analysis");
    return;
  }

  axios.post(N8N_WEBHOOK_URL, payload, {
    timeout: 5000,
  })
    .then(() => {
      console.log(`🤖 AI analysis triggered for ${payload.ip}`);
    })
    .catch((err) => {
      console.error(`❌ n8n webhook failed: ${err.message}`);
    });
}

// 🔥 FUNCTION CTI + GEO
async function checkIP(ip) {
  try {
    const abuseRes = await axios.get(
      "https://api.abuseipdb.com/api/v2/check",
      {
        params: {
          ipAddress: ip,
          maxAgeInDays: 90,
        },
        headers: {
          Key: ABUSE_API_KEY,
          Accept: "application/json",
        },
      }
    );

    const abuse = abuseRes.data.data;

    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const geo = geoRes.data;

    let threat = "clean";
    if (abuse.abuseConfidenceScore > 70) {
      threat = "malicious";
    } else if (abuse.abuseConfidenceScore > 30) {
      threat = "suspicious";
    }

    let reason = [];
    if (abuse.totalReports > 0) {
      reason.push(`Reported ${abuse.totalReports} times`);
    }
    if (abuse.abuseConfidenceScore > 70) {
      reason.push("High abuse confidence");
    }
    if (geo.proxy) {
      reason.push("Proxy/VPN detected");
    }
    if (reason.length === 0) {
      reason.push("No significant threat");
    }

    return {
      ip,
      threat,
      score: abuse.abuseConfidenceScore,
      reports: abuse.totalReports,
      country: geo.country,
      city: geo.city,
      isp: geo.isp,
      lat: geo.lat,
      lng: geo.lon,
      reason,
    };

  } catch (err) {
    console.error("CTI ERROR:", err.message);

    return {
      ip,
      threat: "unknown",
      score: 0,
      country: "unknown",
      city: "-",
      isp: "-",
      lat: null,
      lng: null,
      reason: ["fallback mode"],
    };
  }
}

// 🔵 LOG ACTION
app.post("/log", async (req, res) => {
  try {
    const data = req.body;
    await client.index({
      index: "logs",
      document: {
        ...data,
        timestamp: new Date(),
      },
    });
    res.json({ status: "ok" });
  } catch (err) {
    console.error("LOG ERROR:", err);
    res.json({ status: "ok" });
  }
});

// 🟢 CHECK IP (🔥 CORE)
app.post("/check-ip", async (req, res) => {
  try {
    const { ip } = req.body;
    const result = await checkIP(ip);

    try {
      await client.index({
        index: "logs",
        document: {
          action: "check_ip",
          ip: result.ip,
          threat: result.threat,
          score: result.score,
          country: result.country,
          city: result.city,
          isp: result.isp,
          lat: result.lat,
          lng: result.lng,
          timestamp: new Date(),
        },
      });
    } catch (e) {
      console.log("⚠️ Elastic skip (optional)");
    }

    triggerN8N({
      ip: result.ip,
      country: result.country,
      isp: result.isp,
      abuseScore: result.score,
      action: result.threat,
    });

    console.log("CEK IP RESULT:", result);
    res.json(result);

  } catch (err) {
    console.error("CHECK IP ERROR:", err);
    res.status(500).send("error");
  }
});

// 🌍 THREATS - buat globe + right panel
app.get("/threats", async (req, res) => {
  try {
    const result = await client.search({
      index: "logs",
      size: 100,
      sort: [{ timestamp: { order: "desc" } }],
      query: {
        bool: {
          must: [
            { term: { action: "check_ip" } }
          ],
          must_not: [
            { term: { threat: "unknown" } }
          ]
        }
      }
    });

    const threats = result.hits.hits
      .map(h => h._source)
      .filter(t => t.lat && t.lng);

    res.json(threats);
  } catch (err) {
    console.error("THREATS ERROR:", err);
    res.json([]);
  }
});

// 🤖 AI THREATS - data dengan AI verdict (dari n8n workflow)
app.get("/ai-threats", async (req, res) => {
  try {
    const result = await client.search({
      index: "logs",
      size: 100,
      sort: [{ ai_analyzed_at: { order: "desc" } }],
      query: {
        exists: {
          field: "ai_risk_level"
        }
      }
    });

    const aiThreats = result.hits.hits.map(h => h._source);
    res.json(aiThreats);
  } catch (err) {
    console.error("AI THREATS ERROR:", err);
    res.json([]);
  }
});

// 📊 AI STATS
app.get("/ai-stats", async (req, res) => {
  try {
    const result = await client.search({
      index: "logs",
      size: 1000,
      query: {
        exists: { field: "ai_risk_level" }
      }
    });

    const items = result.hits.hits.map(h => h._source);

    const stats = {
      total: items.length,
      critical: items.filter(i => i.ai_risk_level === "CRITICAL").length,
      high: items.filter(i => i.ai_risk_level === "HIGH").length,
      medium: items.filter(i => i.ai_risk_level === "MEDIUM").length,
      low: items.filter(i => i.ai_risk_level === "LOW").length,
      block: items.filter(i => i.ai_recommended_action === "BLOCK").length,
      monitor: items.filter(i => i.ai_recommended_action === "MONITOR").length,
      allow: items.filter(i => i.ai_recommended_action === "ALLOW").length,
    };

    res.json(stats);
  } catch (err) {
    console.error("AI STATS ERROR:", err);
    res.json({});
  }
});

// 🔥 CLEAR LOGS
app.delete("/clear-logs", async (req, res) => {
  try {
    await client.deleteByQuery({
      index: "logs",
      query: {
        match_all: {}
      }
    });
    res.json({ status: "cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

// 📊 STATS
app.get("/stats", async (req, res) => {
  try {
    const result = await client.search({
      index: "logs",
      size: 1000
    });

    const logs = result.hits.hits.map(h => h._source);

    let success = 0;
    let failed = 0;
    let malicious = 0;
    let suspicious = 0;
    let clean = 0;

    logs.forEach(log => {
      if (log.status === "success") success++;
      if (log.status === "failed") failed++;
      if (log.threat === "malicious") malicious++;
      else if (log.threat === "suspicious") suspicious++;
      else if (log.threat === "clean") clean++;
    });

    res.json({
      total: logs.length,
      success,
      failed,
      malicious,
      suspicious,
      clean
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

// 🚀 RUN SERVER
app.listen(5000, () => {
  console.log("🔥 Backend jalan di http://localhost:5000");
  if (N8N_WEBHOOK_URL) {
    console.log(`🤖 n8n AI workflow: ${N8N_WEBHOOK_URL}`);
  }
});