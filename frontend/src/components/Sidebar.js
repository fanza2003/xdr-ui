import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "CTI", path: "/cti", icon: "🎯" },
    { name: "AI Analysis", path: "/ai", icon: "🤖" },
  ];

  return (
    <div style={styles.container}>
      {/* LOGO */}
      <div style={styles.logo}>
        <span style={{ fontSize: "24px" }}>🛡️</span>
        <span style={{ fontSize: "18px", fontWeight: 700 }}>XDR</span>
      </div>
      {/* MENU */}
      <nav style={styles.nav}>
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                background: isActive ? "#1e293b" : "transparent",
                color: isActive ? "#22d3ee" : "#cbd5e1",
                borderLeft: isActive
                  ? "3px solid #22d3ee"
                  : "3px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

const styles = {
  container: {
    height: "100%",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    background: "#0a0f1c",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.15s ease",
  },
};