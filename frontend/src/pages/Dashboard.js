import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Globe from "../components/Globe";
import StatsCard from "../components/StatsCard";
import RightPanel from "../components/RightPanel";

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    malicious: 0,
    suspicious: 0,
    clean: 0,
  });
  const [threats, setThreats] = useState([]);

  // Fetch stats + threats
  useEffect(() => {
    const fetchData = () => {
      // STATS
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Stats error:", err));

      // THREATS (buat Top Attacker di right panel)
      fetch("/api/threats")
        .then((res) => res.json())
        .then((data) => setThreats(data))
        .catch((err) => console.error("Threats error:", err));
    };

    fetchData();
    // Auto refresh tiap 10 detik
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#020617",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          borderRight: "1px solid #1e293b",
        }}
      >
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px 32px",
          gap: "20px",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
            🔥 XDR Dashboard
          </h1>

          <button
            onClick={() => {
              if (!window.confirm("Yakin mau hapus semua data threat?")) return;
              fetch("/api/clear-logs", { method: "DELETE" })
                .then((res) => res.json())
                .then(() => {
                  alert("✅ Data cleared!");
                  window.location.reload();
                })
                .catch((err) => {
                  console.error(err);
                  alert("❌ Gagal clear data");
                });
            }}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid #ef4444",
              borderRadius: "6px",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#ef4444";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#ef4444";
            }}
          >
            🗑️ Clear Data
          </button>
        </div>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <StatsCard title="Total Checks" value={stats.total} color="#22d3ee" />
          <StatsCard title="Malicious" value={stats.malicious} color="#ef4444" />
          <StatsCard title="Suspicious" value={stats.suspicious} color="#f59e0b" />
          <StatsCard title="Clean" value={stats.clean} color="#22c55e" />
        </div>

        {/* GLOBE CARD */}
        <section
          style={{
            flex: 1,
            minHeight: 0,
            background: "#0f172a",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid #1e293b",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
              🌍 Global Threat Activity
            </h3>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {threats.length} active threats
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "500px",
                maxHeight: "500px",
                aspectRatio: "1 / 1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Globe />
            </div>
          </div>
        </section>
      </main>

      {/* RIGHT PANEL */}
      <aside
        style={{
          width: "260px",
          flexShrink: 0,
          borderLeft: "1px solid #1e293b",
          padding: "24px 20px",
          overflow: "auto",
        }}
      >
        <RightPanel threats={threats} />
      </aside>
    </div>
  );
}

export default Dashboard;