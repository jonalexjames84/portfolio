import { ImageResponse } from "next/og";

export const alt = "Jonny Martin — Senior Product Manager";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
            }}
          >
            Senior Product Manager
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.1,
            }}
          >
            Jonny Martin
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            15+ years shipping games and products at Zynga, Jam City, Genies,
            Mythical Games, and more.
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            fontSize: 20,
            color: "#52525b",
          }}
        >
          jonnymartin.blog
        </div>
      </div>
    ),
    { ...size }
  );
}
