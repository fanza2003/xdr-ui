export default function RightPanel({ threats = [] }) {
    // Group by country, count per country
    const countryCount = {};
    threats.forEach((t) => {
      if (!t.country || t.country === "unknown") return;
      countryCount[t.country] = (countryCount[t.country] || 0) + 1;
    });
  
    // Sort by count, ambil top 5
    const topAttackers = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* TOP ATTACKER */}
        <section>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🌍 Top Attackers
          </h3>
  
          {topAttackers.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Belum ada data. Cek IP di halaman CTI dulu.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {topAttackers.map((a) => (
                <div
                  key={a.country}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "#0f172a",
                    borderRadius: "8px",
                    border: "1px solid #1e293b",
                    fontSize: "13px",
                  }}
                >
                  <span>{a.country}</span>
                  <span
                    style={{
                      color: "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    {a.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
  
        {/* RECENT THREATS */}
        <section>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 12px 0",
            }}
          >
            🚨 Recent Threats
          </h3>
  
          {threats.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Belum ada threat tercatat.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {threats.slice(0, 5).map((t, i) => {
                const color =
                  t.threat === "malicious"
                    ? "#ef4444"
                    : t.threat === "suspicious"
                    ? "#f59e0b"
                    : "#22c55e";
  
                return (
                  <div
                    key={i}
                    style={{
                      padding: "8px 10px",
                      background: "#0f172a",
                      borderRadius: "6px",
                      border: "1px solid #1e293b",
                      borderLeft: `3px solid ${color}`,
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                      {t.ip}
                    </div>
                    <div style={{ color: "#94a3b8" }}>
                      {t.country} ·{" "}
                      <span style={{ color }}>{t.threat}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }