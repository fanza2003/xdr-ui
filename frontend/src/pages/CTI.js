import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

function CTI() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = () => {
    fetch("http://localhost:5000/threats")
      .then((res) => res.json())
      .then((data) => setHistory(data.slice(0, 10)))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const checkIP = () => {
    if (!ip.trim()) return;
    setLoading(true);
    fetch("http://localhost:5000/check-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    })
      .then((res) => res.json())
      .then((res) => {
        setResult(res);
        setLoading(false);
        fetchHistory();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const threatColor = (threat) => {
    if (threat === "malicious") return "#ef4444";
    if (threat === "suspicious") return "#f59e0b";
    if (threat === "clean") return "#22c55e";
    return "#94a3b8";
  };

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
      {/* SIDEBAR — sama kayak Dashboard */}
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
          overflow: "auto",
          minWidth: 0,
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          🔍 CTI — IP Intelligence
        </h1>

        {/* SEARCH BAR */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            background: "#0f172a",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #1e293b",
          }}
        >
          <input
            placeholder="Masukin IP address (contoh: 8.8.8.8)"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkIP()}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #1e293b",
              background: "#020617",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            onClick={checkIP}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: loading ? "#475569" : "#22d3ee",
              border: "none",
              borderRadius: "8px",
              color: "#020617",
              fontWeight: 600,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Checking..." : "Check IP"}
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div
            style={{
              background: "#0f172a",
              padding: "20px 24px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  THREAT STATUS
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: threatColor(result.threat),
                    textTransform: "uppercase",
                  }}
                >
                  {result.threat}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  ABUSE SCORE
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: threatColor(result.threat),
                  }}
                >
                  {result.score}/100
                </div>
              </div>
            </div>

            <div style={{ height: "1px", background: "#1e293b" }} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              <InfoRow label="🌐 IP" value={result.ip} />
              <InfoRow label="📍 Country" value={result.country} />
              <InfoRow label="🏙️ City" value={result.city} />
              <InfoRow label="🧠 ISP" value={result.isp} />
            </div>

            {result.reason?.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "8px",
                  }}
                >
                  ⚠️ REASONS
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    fontSize: "13px",
                    lineHeight: 1.8,
                  }}
                >
                  {result.reason.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      {/* RIGHT PANEL — History */}
      <aside
        style={{
          width: "280px",
          flexShrink: 0,
          borderLeft: "1px solid #1e293b",
          padding: "24px 20px",
          overflow: "auto",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 600,
            margin: "0 0 16px 0",
          }}
        >
          📜 Recent Checks
        </h3>

        {history.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Belum ada data. Coba cek IP dulu.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  background: "#0f172a",
                  borderRadius: "8px",
                  border: "1px solid #1e293b",
                  borderLeft: `3px solid ${threatColor(h.threat)}`,
                  fontSize: "12px",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                  {h.ip}
                </div>
                <div style={{ color: "#94a3b8" }}>
                  {h.country} ·{" "}
                  <span style={{ color: threatColor(h.threat) }}>
                    {h.threat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 500 }}>{value || "-"}</div>
    </div>
  );
}

export default CTI;