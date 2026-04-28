export default function Card({
  icon,
  title,
  value,
  progress,
  footer,
  iconColor = "#003366",
  barColor = "#003366"
}) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ color: iconColor, fontSize: 18 }}>{icon}</span>
        <span style={styles.title}>{title}</span>
      </div>
      <div style={styles.value}>{value}</div>
      <div style={styles.barBackground}>
        <div style={{ ...styles.barFill, width: `${progress}%`, backgroundColor: barColor }} />
      </div>
      <div style={styles.footer}>{footer}</div>
    </div>
  );
}

const styles = {
  card: {
    background: "#FFFFFF",
    borderRadius: "12px",
    padding: "20px",
    minWidth: "160px",
    flex: "1 1 160px",
    boxShadow: "0 2px 8px rgba(0,51,102,0.07)",
    border: "1px solid #DADADA",
    margin: "4px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  title: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#555555",
    fontFamily: "Inter, sans-serif",
    lineHeight: 1.4
  },
  value: {
    marginTop: "14px",
    fontSize: "22px",
    fontWeight: "500",
    color: "#003366",
    fontFamily: "'Roboto Mono', monospace"
  },
  barBackground: {
    marginTop: "10px",
    height: "4px",
    width: "100%",
    background: "#DADADA",
    borderRadius: "2px"
  },
  barFill: {
    height: "4px",
    borderRadius: "2px"
  },
  footer: {
    marginTop: "8px",
    color: "#777777",
    fontSize: "12px",
    fontFamily: "Inter, sans-serif"
  }
};
