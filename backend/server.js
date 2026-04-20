const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// 🔎 ELASTIC
const client = new Client({
  node: "http://localhost:9200",
});

// 🔑 API KEY ABUSEIPDB
const ABUSE_API_KEY = "3dc4c1bfab205a576718158518a75ee9279be3c578a0894d1e4a8cf0bd434a7db113f5c8aa585cf5";

// 🔥 FUNCTION CTI + GEO
async function checkIP(ip) {
  try {
    // 🛡️ CTI - AbuseIPDB
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

    // 🌍 GEO - ip-api
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const geo = geoRes.data;

    // 🧠 THREAT LOGIC
    let threat = "clean";
    if (abuse.abuseConfidenceScore > 70) {
      threat = "malicious";
    } else if (abuse.abuseConfidenceScore > 30) {
      threat = "suspicious";
    }

    // 🔍 REASON
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
      lat: geo.lat,     // 🔥 BARU
      lng: geo.lon,     // 🔥 BARU (ip-api pake `lon` bukan `lng`)
      reason,
    };

  } catch (err) {
    console.error("CTI ERROR:", err.message);

    // 🧪 fallback biar ga crash
    return {
      ip,
      threat: "unknown",
      score: 0,
      country: "unknown",
      city: "-",
      isp: "-",
      lat: null,        // 🔥 BARU
      lng: null,        // 🔥 BARU
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

// 🟢 CHECK IP (🔥 CORE) - UPDATED
app.post("/check-ip", async (req, res) => {
  try {
    const { ip } = req.body;
    const result = await checkIP(ip);

    // 🔥 SIMPAN KE ELASTIC (tambahin lat/lng + field baru)
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

    console.log("CEK IP RESULT:", result);
    res.json(result);

  } catch (err) {
    console.error("CHECK IP ERROR:", err);
    res.status(500).send("error");
  }
});

// 🌍 THREATS - buat globe + right panel (ENDPOINT BARU)
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
});