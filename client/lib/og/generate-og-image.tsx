import { ImageResponse } from "next/og";

export interface OgImageOptions {
  title: string;
  subtitle?: string;
  category?: string;
  eyebrow?: string;
  badge?: string;
  scripture?: {
    text: string;
    reference: string;
  };
  accentColor?: string; // e.g. '#D9A441' (gold), '#6366F1' (indigo), '#10B981' (emerald)
}

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export function generateOgImage({
  title,
  subtitle,
  category = "GRACE OF GOD MISSION ASABA",
  eyebrow,
  badge,
  scripture,
  accentColor = "#D9A441",
}: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0C1D",
          padding: "56px 64px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#FFFFFF",
        }}
      >
        {/* Ambient Sacred Lighting Gradients */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}33 0%, rgba(10,12,29,0) 70%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(10,12,29,0) 70%)",
            display: "flex",
          }}
        />

        {/* Outer Fine Framing Border */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            bottom: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            pointerEvents: "none",
            display: "flex",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Church Branding Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Golden Flame Icon Badge */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${accentColor}, #B45309)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${accentColor}40`,
              }}
            >
              {/* Flame SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0A0C1D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  letterSpacing: "2.5px",
                  color: accentColor,
                  textTransform: "uppercase",
                }}
              >
                GRACE OF GOD MISSION
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.6)",
                  letterSpacing: "1px",
                }}
              >
                ASABA · DELTA STATE
              </span>
            </div>
          </div>

          {/* Right Category Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${accentColor}60`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "2px",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Center Main Stage */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "1020px",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Eyebrow or Text Pill */}
          {eyebrow && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  padding: "5px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "#A5B4FC",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {eyebrow}
              </div>
            </div>
          )}

          {/* Big Majestic Title */}
          <h1
            style={{
              fontSize: title.length > 40 ? "46px" : "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              color: "#FFFFFF",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </h1>

          {/* Scripture Box (If provided, e.g. for devotions) */}
          {scripture ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 22px",
                borderRadius: "16px",
                backgroundColor: "rgba(217, 164, 65, 0.08)",
                borderLeft: `4px solid ${accentColor}`,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  color: "rgba(255, 255, 255, 0.95)",
                }}
              >
                "{scripture.text.length > 150 ? scripture.text.substring(0, 147) + "..." : scripture.text}"
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  color: accentColor,
                  textTransform: "uppercase",
                }}
              >
                — {scripture.reference}
              </span>
            </div>
          ) : subtitle ? (
            <p
              style={{
                fontSize: "21px",
                lineHeight: 1.45,
                color: "rgba(255, 255, 255, 0.75)",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          ) : null}

          {/* Optional Highlights / Badges */}
          {badge && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: accentColor,
                  letterSpacing: "1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill={accentColor}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{badge}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "18px",
          }}
        >
          {/* Location details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 500,
            }}
          >
            <span>No. 33 Arthur Richard Street, Akwuebulu, Asaba</span>
          </div>

          {/* Fellowship Service Times */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Sunday Sanctuary <strong style={{ color: "#FFFFFF" }}>7:00 AM</strong>
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
            <span style={{ color: accentColor }}>
              ggmasaba.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
    }
  );
}
