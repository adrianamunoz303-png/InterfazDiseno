import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Boton({ texto, emoji, destino }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => navigate(destino)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "24px 20px",
        minWidth: "120px",
        minHeight: "120px",
        backgroundColor: "#FFFFFF",
        border: isHovered ? "2px solid #003366" : "1px solid #DADADA",
        borderRadius: "12px",
        boxShadow: isHovered
          ? "0 6px 20px rgba(0,51,102,0.12)"
          : "0 2px 6px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ fontSize: "40px", lineHeight: 1 }}>{emoji}</span>
      <span style={{
        fontSize: "13px",
        fontWeight: "500",
        color: isHovered ? "#003366" : "#222222",
        fontFamily: "Inter, sans-serif"
      }}>
        {texto}
      </span>
    </button>
  );
}
