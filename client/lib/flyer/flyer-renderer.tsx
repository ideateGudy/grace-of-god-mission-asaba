import React from "react";
import {
  type FlyerData,
  FLYER_TEMPLATES,
  FLYER_DIMENSIONS,
} from "./flyer-types";

interface FlyerRendererProps {
  data: FlyerData;
  svgRef?: React.Ref<SVGSVGElement>;
  scale?: number;
  className?: string;
}

/**
 * Splits long titles into balanced lines for visual impact.
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + " " + word).length <= maxCharsPerLine) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export function FlyerRenderer({
  data,
  svgRef,
  className = "",
}: FlyerRendererProps) {
  const { width, height } = FLYER_DIMENSIONS[data.aspectRatio];
  const template = FLYER_TEMPLATES[data.templateId] || FLYER_TEMPLATES["royal-gold"];

  // Layout calculations based on aspect ratio
  const isStory = data.aspectRatio === "story";
  const isLandscape = data.aspectRatio === "landscape";

  const paddingX = isLandscape ? 80 : 64;
  const paddingY = isStory ? 96 : isLandscape ? 60 : 70;
  const contentWidth = width - paddingX * 2;

  // Title wrapping & sizing
  const titleLines = wrapText(
    data.title || "UNTITLED PROGRAM",
    isLandscape ? 30 : isStory ? 20 : 22
  );
  const titleFontSize =
    titleLines.length > 3
      ? isLandscape
        ? 52
        : 48
      : titleLines.length > 2
      ? isLandscape
        ? 62
        : 58
      : isLandscape
      ? 74
      : isStory
      ? 68
      : 72;

  const subtitleLines = wrapText(data.subtitle || "", isLandscape ? 70 : 45);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: template.bgDark,
        fontFamily: template.titleFont === "serif" ? "Georgia, 'Times New Roman', serif" : "system-ui, -apple-system, sans-serif",
      }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="35" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="shadow-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.7" />
        </filter>

        {/* Gradients */}
        <radialGradient id="ambient-radial-1" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={template.secondaryAccent} stopOpacity="0.32" />
          <stop offset="50%" stopColor={template.primaryAccent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ambient-radial-2" cx="80%" cy="85%" r="50%">
          <stop offset="0%" stopColor={template.primaryAccent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D6" />
          <stop offset="30%" stopColor={template.primaryAccent} />
          <stop offset="65%" stopColor={template.secondaryAccent} />
          <stop offset="100%" stopColor="#FFFDF7" />
        </linearGradient>

        <linearGradient id="card-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
        </linearGradient>

        {/* Clip path for speaker photo */}
        <clipPath id="speaker-clip">
          <circle cx="160" cy="160" r="140" />
        </clipPath>
      </defs>

      {/* 1. Ambient Background Layer */}
      <rect width={width} height={height} fill={template.bgDark} />
      <rect width={width} height={height} fill="url(#ambient-radial-1)" />
      <rect width={width} height={height} fill="url(#ambient-radial-2)" />

      {/* 2. Visual Pattern Layer based on Template */}
      {template.patternType === "radial-rays" && (
        <g opacity="0.08" stroke={template.primaryAccent} strokeWidth="1">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x2 = width / 2 + Math.cos(rad) * Math.max(width, height);
            const y2 = height / 2 + Math.sin(rad) * Math.max(width, height);
            return <line key={i} x1={width / 2} y1={height / 2} x2={x2} y2={y2} />;
          })}
        </g>
      )}

      {template.patternType === "fire-burst" && (
        <g opacity="0.12">
          <circle cx={width / 2} cy={height * 0.45} r={width * 0.45} fill="url(#ambient-radial-1)" filter="url(#glow-gold)" />
          <circle cx={width * 0.2} cy={height * 0.2} r="250" fill={template.primaryAccent} filter="url(#glow-gold)" opacity="0.25" />
          <circle cx={width * 0.8} cy={height * 0.7} r="300" fill={template.secondaryAccent} filter="url(#glow-gold)" opacity="0.2" />
        </g>
      )}

      {template.patternType === "aurora" && (
        <g opacity="0.15">
          <path
            d={`M 0,${height * 0.4} Q ${width * 0.3},${height * 0.2} ${width * 0.6},${height * 0.45} T ${width},${height * 0.3} L ${width},${height} L 0,${height} Z`}
            fill="url(#ambient-radial-1)"
          />
          <path
            d={`M 0,${height * 0.55} Q ${width * 0.4},${height * 0.75} ${width * 0.7},${height * 0.5} T ${width},${height * 0.7} L ${width},${height} L 0,${height} Z`}
            fill="url(#ambient-radial-2)"
          />
        </g>
      )}

      {/* 3. Outer Sacred Border Framing */}
      <rect
        x={28}
        y={28}
        width={width - 56}
        height={height - 56}
        fill="none"
        stroke={template.borderColor}
        strokeWidth="1.5"
        rx="24"
      />
      <rect
        x={36}
        y={36}
        width={width - 72}
        height={height - 72}
        fill="none"
        stroke={template.borderColor}
        strokeWidth="0.5"
        strokeDasharray="8 6"
        rx="20"
        opacity="0.6"
      />

      {/* Corner Cross Ornaments */}
      {[
        { x: 36, y: 36 },
        { x: width - 36, y: 36 },
        { x: 36, y: height - 36 },
        { x: width - 36, y: height - 36 },
      ].map((pt, idx) => (
        <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
          <circle cx="0" cy="0" r="5" fill={template.primaryAccent} opacity="0.8" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke={template.primaryAccent} strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke={template.primaryAccent} strokeWidth="1" opacity="0.5" />
        </g>
      ))}

      {/* 4. Top Header Row: Church Branding & Category */}
      <g transform={`translate(${paddingX}, ${paddingY})`}>
        {/* Church Name & Crest */}
        <g>
          {data.showChurchLogo && (
            <g transform="translate(0, 0)">
              <circle cx="20" cy="20" r="20" fill={template.badgeBg} stroke={template.borderColor} strokeWidth="1" />
              {/* Sacred Cross Icon */}
              <line x1="20" y1="9" x2="20" y2="31" stroke={template.primaryAccent} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="16" x2="28" y2="16" stroke={template.primaryAccent} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          <text
            x={data.showChurchLogo ? 52 : 0}
            y="17"
            fill={template.textColor}
            fontSize="18"
            fontWeight="800"
            letterSpacing="2.5"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {data.churchName || "GRACE OF GOD MISSION ASABA"}
          </text>
          <text
            x={data.showChurchLogo ? 52 : 0}
            y="35"
            fill={template.mutedColor}
            fontSize="12"
            fontWeight="600"
            letterSpacing="1.2"
            opacity="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            SANCTUARY OF GRACE & TRUTH · ASABA, DELTA STATE
          </text>
        </g>

        {/* Program Category Pill */}
        {data.category && (
          <g transform={`translate(${contentWidth - 280}, 0)`}>
            <rect
              width="280"
              height="36"
              rx="18"
              fill={template.badgeBg}
              stroke={template.borderColor}
              strokeWidth="1"
            />
            <text
              x="140"
              y="23"
              fill={template.badgeText}
              fontSize="12"
              fontWeight="800"
              letterSpacing="1.5"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.category.toUpperCase()}
            </text>
          </g>
        )}
      </g>

      {/* 5. Center Presentation Core */}
      {/* Dynamic Vertical Layout depending on aspect ratio */}
      {(() => {
        const topMargin = isStory ? paddingY + 120 : isLandscape ? paddingY + 65 : paddingY + 80;
        let currentY = topMargin;

        return (
          <g transform={`translate(${paddingX}, ${currentY})`}>
            {/* Special Feature / Broadcast Pill */}
            {data.badgeText && (
              <g transform="translate(0, 0)">
                <rect
                  x="0"
                  y="0"
                  width={Math.min(contentWidth, data.badgeText.length * 11 + 44)}
                  height="34"
                  rx="17"
                  fill="url(#card-glass)"
                  stroke={template.borderColor}
                  strokeWidth="1"
                />
                <circle cx="17" cy="17" r="4" fill={template.secondaryAccent} />
                <text
                  x="30"
                  y="22"
                  fill={template.secondaryAccent}
                  fontSize="12"
                  fontWeight="800"
                  letterSpacing="2"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {data.badgeText.toUpperCase()}
                </text>
              </g>
            )}

            {/* Main Theme / Title */}
            <g transform={`translate(0, ${data.badgeText ? 48 : 10})`}>
              {titleLines.map((line, idx) => (
                <text
                  key={idx}
                  x="0"
                  y={idx * (titleFontSize * 1.08) + titleFontSize * 0.9}
                  fill="url(#gold-metallic)"
                  fontSize={titleFontSize}
                  fontWeight="900"
                  letterSpacing={template.titleFont === "serif" ? "0.5" : "1"}
                  filter="url(#shadow-drop)"
                >
                  {line}
                </text>
              ))}
            </g>

            {/* Subtitle / Expansion */}
            {data.subtitle && (
              <g
                transform={`translate(0, ${
                  (data.badgeText ? 48 : 10) +
                  titleLines.length * (titleFontSize * 1.08) +
                  16
                })`}
              >
                {subtitleLines.slice(0, 3).map((subLine, idx) => (
                  <text
                    key={idx}
                    x="0"
                    y={idx * 26 + 18}
                    fill={template.mutedColor}
                    fontSize={isLandscape ? 17 : 19}
                    fontWeight="500"
                    opacity="0.95"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {subLine}
                  </text>
                ))}
              </g>
            )}

            {/* Theme Scripture Callout Box */}
            {data.scriptureText && (
              <g
                transform={`translate(0, ${
                  (data.badgeText ? 48 : 10) +
                  titleLines.length * (titleFontSize * 1.08) +
                  (data.subtitle ? subtitleLines.slice(0, 3).length * 26 + 28 : 20)
                })`}
              >
                <rect
                  x="0"
                  y="0"
                  width={isLandscape ? contentWidth * 0.65 : contentWidth}
                  height={isStory ? 100 : 84}
                  rx="16"
                  fill={template.badgeBg}
                  stroke={template.borderColor}
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="12"
                  x2="0"
                  y2={isStory ? 88 : 72}
                  stroke={template.primaryAccent}
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                <text
                  x="24"
                  y="26"
                  fill={template.primaryAccent}
                  fontSize="12"
                  fontWeight="800"
                  letterSpacing="1.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {data.scriptureRef || "SCRIPTURE FOCUS"}
                </text>
                <text
                  x="24"
                  y="52"
                  fill={template.textColor}
                  fontSize={isStory ? 15 : 14}
                  fontWeight="500"
                  fontStyle="italic"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  &ldquo;{data.scriptureText.length > 120 ? data.scriptureText.slice(0, 117) + "..." : data.scriptureText}&rdquo;
                </text>
              </g>
            )}
          </g>
        );
      })()}

      {/* 6. Speaker Photo / Ministration Feature (if Story or Landscape mode) */}
      {data.speakerPhotoUrl && !isLandscape && (
        <g transform={`translate(${width - paddingX - 220}, ${height * 0.42})`}>
          <circle cx="100" cy="100" r="95" fill="none" stroke={template.primaryAccent} strokeWidth="3" filter="url(#glow-gold)" />
          <image
            href={data.speakerPhotoUrl}
            x="5"
            y="5"
            width="190"
            height="190"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#speaker-clip)"
          />
        </g>
      )}

      {/* 7. Bottom Logistics: Date, Time, Venue, Ministers & Streaming Badge */}
      <g transform={`translate(${paddingX}, ${height - paddingY - (isStory ? 240 : 160)})`}>
        {/* Logistics Cards Row */}
        <g>
          {/* Date & Time Glass Card */}
          <g>
            <rect
              x="0"
              y="0"
              width={isLandscape ? contentWidth * 0.38 : contentWidth * 0.48}
              height="84"
              rx="16"
              fill="url(#card-glass)"
              stroke={template.borderColor}
              strokeWidth="1"
            />
            {/* Calendar Icon */}
            <g transform="translate(18, 18)">
              <rect x="0" y="0" width="22" height="22" rx="4" fill="none" stroke={template.primaryAccent} strokeWidth="2" />
              <line x1="0" y1="7" x2="22" y2="7" stroke={template.primaryAccent} strokeWidth="1.5" />
            </g>
            <text
              x="50"
              y="28"
              fill={template.textColor}
              fontSize="14"
              fontWeight="800"
              letterSpacing="0.8"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.date || "DATE TBA"}
            </text>
            <text
              x="50"
              y="54"
              fill={template.secondaryAccent}
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.time || "TIME TBA"}
            </text>
          </g>

          {/* Venue Glass Card */}
          <g transform={`translate(${isLandscape ? contentWidth * 0.4 : contentWidth * 0.52}, 0)`}>
            <rect
              x="0"
              y="0"
              width={isLandscape ? contentWidth * 0.58 : contentWidth * 0.48}
              height="84"
              rx="16"
              fill="url(#card-glass)"
              stroke={template.borderColor}
              strokeWidth="1"
            />
            {/* Location Pin Icon */}
            <g transform="translate(18, 18)">
              <path
                d="M 11,2 C 6,2 2,6 2,11 C 2,17 11,24 11,24 C 11,24 20,17 20,11 C 20,6 16,2 11,2 Z"
                fill="none"
                stroke={template.primaryAccent}
                strokeWidth="2"
              />
              <circle cx="11" cy="11" r="3" fill={template.primaryAccent} />
            </g>
            <text
              x="46"
              y="28"
              fill={template.textColor}
              fontSize="13"
              fontWeight="800"
              letterSpacing="0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              LOCATION / VENUE
            </text>
            <text
              x="46"
              y="52"
              fill={template.mutedColor}
              fontSize="12"
              fontWeight="500"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.venue && data.venue.length > 40 ? data.venue.slice(0, 37) + "..." : data.venue || "Grace of God Mission Auditorium, Asaba"}
            </text>
          </g>
        </g>

        {/* Ministers & Broadcast Footer */}
        <g transform={`translate(0, ${isStory ? 104 : 96})`}>
          {/* Minister Names */}
          <g>
            <text
              x="0"
              y="20"
              fill={template.primaryAccent}
              fontSize="14"
              fontWeight="800"
              letterSpacing="1"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.minister || "HOST: PASTOR CHUKWUDI EZE"}
            </text>
            {data.guestMinister && (
              <text
                x="0"
                y="42"
                fill={template.secondaryAccent}
                fontSize="13"
                fontWeight="700"
                letterSpacing="0.8"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {data.guestMinister}
              </text>
            )}
          </g>

          {/* Broadcast / Online Link Pill */}
          {data.broadcastBadge && (
            <g transform={`translate(${contentWidth - 360}, 6)`}>
              <rect
                x="0"
                y="0"
                width="360"
                height="32"
                rx="16"
                fill={template.badgeBg}
                stroke={template.borderColor}
                strokeWidth="1"
              />
              <circle cx="16" cy="16" r="4" fill="#EF4444" />
              <text
                x="28"
                y="21"
                fill={template.textColor}
                fontSize="10"
                fontWeight="800"
                letterSpacing="1.2"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {data.broadcastBadge.toUpperCase()}
              </text>
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}
