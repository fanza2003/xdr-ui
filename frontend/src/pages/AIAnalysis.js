import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

function AIAnalysis() {
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  const fetchData = () => {
    fetch("/api/ai-threats")
      .then((res) => res.json())
      .then((data) => setThreats(data))
      .catch((err) => console.error(err));

    fetch("/api/ai-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = (level) => {
    if (level === "CRITICAL") return "#dc2626";
    if (level === "HIGH") return "#ef4444";
    if (level === "MEDIUM") return "#f59e0b";
    if (level === "LOW") return "#22c55e";
    return "#94a3b8";
  };

  const actionColor = (action) => {
    if (action === "BLOCK") return "#ef4444";
    if (action === "MONITOR") return "#f59e0b";
    if (action === "ALLOW") return "#22c55e";
    return "#94a3b8";
  };

  const filtered = filter === "ALL"
    ? threats
    : threats.filter(t => t.ai_risk_level === filter);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#020617", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: "220px", flexShrink: 0, borderRight: "1px solid #1e293b" }}>
        <Sidebar />
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 32px", gap: "20px", overflow: "auto", minWidth: 0 }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          🤖 AI Threat Analysis <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>· Powered by Gemini</span>
        </h1>

        {/* STATS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <StatCard label="CRITICAL" value={stats.critical || 0} color="#dc2626" />
          <StatCard label="HIGH" value={stats.high || 0} color="#ef4444" />
          <StatCard label="MEDIUM" value={stats.medium || 0} color="#f59e0b" />
          <StatCard label="LOW" value={stats.low || 0} color="#22c55e" />
        </div>

        {/* RECOMMENDATIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <StatCard label="🚫 BLOCK" value={stats.block || 0} color="#ef4444" small />
          <StatCard label="👁️ MONITOR" value={stats.monitor || 0} color="#f59e0b" small />
          <StatCard label="✅ ALLOW" value={stats.allow || 0} color="#22c55e" small />
        </div>

        {/* FILTER */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                background: filter === f ? "#22d3ee" : "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: filter === f ? "#020617" : "white",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* THREAT LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              Belum ada AI verdict. Coba check IP di tab CTI dulu.
            </p>
          ) : (
            filtered.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#0f172a",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "1px solid #1e293b",
                  borderLeft: `4px solid ${riskColor(t.ai_risk_level)}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700 }}>{t.ip}</span>
                      <Badge text={t.ai_risk_level} color={riskColor(t.ai_risk_level)} />
                      <Badge text={t.ai_recommended_action} color={actionColor(t.ai_recommended_action)} />
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <span>📍 {t.country}</span>
                      <span>🧠 {t.isp}</span>
                      <span>🎯 {t.ai_threat_type}</span>
                      <span>📊 AbuseIPDB: {t.abuseScore}/100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{
                      padding: "6px 12px",
                      background: "transparent",
                      border: "1px solid #1e293b",
                      borderRadius: "6px",
                      color: "#94a3b8",
                      fontSize: "11px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {expanded === i ? "▲" : "▼"} Details
                  </button>
                </div>

                {expanded === i && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1e293b" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                      🤖 AI EXPLANATION
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: 1.7, marginBottom: "12px" }}>
                      {t.ai_explanation}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Analyzed at: {new Date(t.ai_analyzed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color, small }) {
  return (
    <div style={{
      background: "#0f172a",
      padding: small ? "14px 18px" : "20px 24px",
      borderRadius: "12px",
      border: "1px solid #1e293b",
    }}>
      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px", letterSpacing: "1px" }}>
        {label}
      </div>
      <div style={{ fontSize: small ? "20px" : "28px", fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{
      padding: "2px 10px",
      background: `${color}20`,
      color,
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "1px",
    }}>
      {text}
    </span>
  );
}

export default AIAnalysis;