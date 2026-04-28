import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/" }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => navigate(to)}
      className="back-button"
      style={{
        position: "absolute",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "44px",
        height: "44px",
        borderRadius: "8px",
        border: isHovered
          ? "1px solid rgba(255,255,255,0.7)"
          : "1px solid rgba(255,255,255,0.25)",
        background: isHovered
          ? "rgba(255,255,255,0.18)"
          : "rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontSize: "20px",
        color: "#FFFFFF",
        zIndex: 10
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Volver"
    >
      ←
    </button>
  );
}
