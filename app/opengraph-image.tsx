import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Elbilskompassen – Våga välja elbil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 40%, #2563eb 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "linear-gradient(135deg, #34d399, #0ea5e9)",
            marginBottom: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 40, color: "white" }}>⚡</span>
        </div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Elbilskompassen
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "#bae6fd",
            margin: "16px 0 0 0",
            maxWidth: 700,
            textAlign: "center",
          }}
        >
          Hitta rätt elbil, räkna på ekonomin och ta nästa steg – utan säljtryck
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Elbilskompassen", "Kalkyl", "Leasing", "Modeller"].map((t) => (
            <span
              key={t}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: "8px 20px",
                fontSize: 18,
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
