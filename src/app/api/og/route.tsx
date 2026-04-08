import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const nicheColors: Record<string, string> = {
  faith:      "#c97a2e",
  finance:    "#637f52",
  psychology: "#7c6ab0",
  philosophy: "#4a7ab0",
  science:    "#3a9da0",
};

const nicheLabels: Record<string, string> = {
  faith:      "Faith",
  finance:    "Finance",
  psychology: "Psychology",
  philosophy: "Philosophy",
  science:    "Science & Tech",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Good Soil Harvest";
  const niche = searchParams.get("niche") ?? "";
  const accent = nicheColors[niche] ?? "#637f52";
  const nicheLabel = nicheLabels[niche] ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#faf7f0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: accent }} />

        {/* Niche label */}
        {nicheLabel && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "3px",
                color: accent,
              }}
            >
              {nicheLabel}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? "44px" : "56px",
            fontWeight: 800,
            color: "#2e1a0a",
            lineHeight: 1.2,
            maxWidth: "960px",
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>🌱</span>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#2e1a0a" }}>
              Good Soil Harvest
            </span>
          </div>
          <span style={{ fontSize: "16px", color: "#9a7a5a" }}>
            goodsoilharvest.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
