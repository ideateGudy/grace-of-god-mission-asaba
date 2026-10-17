import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import {
  type FlyerTemplateId,
  type FlyerAspectRatio,
  FLYER_TEMPLATES,
  FLYER_DIMENSIONS,
} from "@/lib/flyer/flyer-types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const templateId = (searchParams.get("template") || "royal-gold") as FlyerTemplateId;
    const ratio = (searchParams.get("ratio") || "square") as FlyerAspectRatio;

    const churchName = searchParams.get("church") || "GRACE OF GOD MISSION ASABA";
    const category = searchParams.get("category") || "SUNDAY CELEBRATION SERVICE";
    const title = searchParams.get("title") || "SUPERNATURAL BREAKTHROUGH & UNSTOPPABLE FAVOUR";
    const subtitle =
      searchParams.get("subtitle") ||
      "Come experience the tangible presence of God and step into your ordained season of victory.";
    const scriptureRef = searchParams.get("scriptureRef") || "ISAIAH 60:1";
    const scriptureText =
      searchParams.get("scriptureText") ||
      "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.";
    const date = searchParams.get("date") || "SUNDAY, 25TH OCTOBER 2026";
    const time = searchParams.get("time") || "8:00 AM & 10:00 AM";
    const venue = searchParams.get("venue") || "Auditorium of Grace, 12 Jesus Saves Road, Asaba";
    const minister = searchParams.get("minister") || "HOST: PASTOR CHUKWUDI EZE";
    const badgeText = searchParams.get("badge") || "ANOINTING & MIRACLE BANQUET";

    const template = FLYER_TEMPLATES[templateId] || FLYER_TEMPLATES["royal-gold"];
    const dimensions = FLYER_DIMENSIONS[ratio] || FLYER_DIMENSIONS["square"];

    const logoUrl = `${req.nextUrl.origin}/ggm_logo.png`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: template.bgDark,
            padding: ratio === "story" ? "80px 60px" : "56px 64px",
            position: "relative",
            overflow: "hidden",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#FFFFFF",
          }}
        >
          {/* Ambient Lighting Gradients */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-100px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${template.primaryAccent}44 0%, rgba(6,7,20,0) 70%)`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-150px",
              left: "-100px",
              width: "550px",
              height: "550px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${template.secondaryAccent}33 0%, rgba(6,7,20,0) 70%)`,
              display: "flex",
            }}
          />

          {/* Outer Border */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              right: "24px",
              bottom: "24px",
              border: `1px solid ${template.borderColor}`,
              borderRadius: "24px",
              display: "flex",
            }}
          />

          {/* Top Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src={logoUrl}
                width="48"
                height="48"
                style={{
                  borderRadius: "50%",
                  border: `2px solid ${template.primaryAccent}`,
                  backgroundColor: template.badgeBg,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: "2px",
                    color: "#FFFFFF",
                  }}
                >
                  {churchName}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "1px",
                    color: template.mutedColor,
                    opacity: 0.8,
                  }}
                >
                  SANCTUARY OF GRACE & TRUTH · ASABA
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "999px",
                backgroundColor: template.badgeBg,
                border: `1px solid ${template.borderColor}`,
                color: template.badgeText,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "1.5px",
              }}
            >
              {category.toUpperCase()}
            </div>
          </div>

          {/* Central Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "100%",
            }}
          >
            {badgeText && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: `1px solid ${template.borderColor}`,
                  color: template.secondaryAccent,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "2px",
                  width: "fit-content",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: template.secondaryAccent,
                    display: "flex",
                  }}
                />
                {badgeText.toUpperCase()}
              </div>
            )}

            <div
              style={{
                fontSize: ratio === "story" ? 64 : 58,
                fontWeight: 900,
                lineHeight: 1.05,
                color: "#FFF2D6",
                letterSpacing: "-0.5px",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: template.mutedColor,
                  lineHeight: 1.4,
                  opacity: 0.9,
                  display: "flex",
                }}
              >
                {subtitle}
              </div>
            )}

            {scriptureText && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  backgroundColor: template.badgeBg,
                  border: `1px solid ${template.borderColor}`,
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "1px",
                    color: template.primaryAccent,
                  }}
                >
                  {scriptureRef}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontStyle: "italic",
                    color: "#FFFFFF",
                  }}
                >
                  &ldquo;{scriptureText}&rdquo;
                </span>
              </div>
            )}
          </div>

          {/* Bottom Logistics Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: "24px",
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  color: "#FFFFFF",
                }}
              >
                {date} · {time}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: template.mutedColor,
                }}
              >
                {venue}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "1px",
                  color: template.primaryAccent,
                }}
              >
                {minister}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: template.secondaryAccent,
                  letterSpacing: "0.5px",
                }}
              >
                GRACE OF GOD MISSION
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: dimensions.width,
        height: dimensions.height,
      }
    );
  } catch (err: unknown) {
    return new Response(
      err instanceof Error ? err.message : "Error generating flyer image",
      { status: 500 }
    );
  }
}
