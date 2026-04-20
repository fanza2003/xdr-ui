export default function StatsCard({ title, value, color }) {
    return (
      <div style={{
        background: "#0f172a",
        padding: "20px 24px",
        borderRadius: "12px",
        border: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "border-color 0.15s ease"
      }}>
        <h4 style={{
          margin: 0,
          fontSize: "13px",
          fontWeight: 500,
          color: "#94a3b8", // abu-abu lembut, bukan putih terang
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {title}
        </h4>
  
        <div style={{
          fontSize: "32px",
          fontWeight: 700,
          color: color,
          lineHeight: 1.1
        }}>
          {value}
        </div>
      </div>
    );
  }