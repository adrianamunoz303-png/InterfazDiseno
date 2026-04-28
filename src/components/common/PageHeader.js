import React from "react";
import BackButton from "./BackButton";

export default function PageHeader({
  icon = "📦",
  title,
  subtitle,
  userLevel = "OPERADOR",
  userLevelNumber = "1",
  time,
  status,
  statusColor = "#1A9E5A"
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 30px",
      background: "#003366",
      position: "relative",
      minHeight: "72px"
    }}>
      {/* Botón volver */}
      <BackButton to="/" />

      {/* Título izquierda */}
      <div style={{ display: "flex", alignItems: "center", paddingLeft: "56px" }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 600,
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            {icon} {title}
          </h2>
          {subtitle && (
            <p style={{
              margin: "2px 0 0 0",
              color: "#DADADA",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif"
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Info derecha */}
      <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#DADADA", marginBottom: "2px", fontFamily: "Inter, sans-serif" }}>
            Nivel de Acceso
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <strong style={{ fontSize: "13px", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>
              {userLevel}
            </strong>
            <span style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#FFFFFF",
              color: "#003366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700"
            }}>
              {userLevelNumber}
            </span>
          </div>
        </div>

        {(time || status) && (
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "4px" }}>
            {time && (
              <>
                <div style={{ fontSize: "11px", color: "#DADADA", marginBottom: "2px", fontFamily: "Inter, sans-serif" }}>
                  Hora
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ fontSize: "15px", color: "#FFFFFF", fontFamily: "'Roboto Mono', monospace" }}>
                    {time}
                  </strong>
                  {status && (
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: "10px",
                      background: statusColor,
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                      fontFamily: "Inter, sans-serif"
                    }}>
                      ● {status}
                    </span>
                  )}
                </div>
              </>
            )}
            {!time && status && (
              <span style={{
                padding: "3px 10px",
                borderRadius: "10px",
                background: statusColor,
                color: "white",
                fontSize: "12px",
                fontWeight: "600",
                fontFamily: "Inter, sans-serif"
              }}>
                ● {status}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
