import React from "react";
import {
  type FlyerData,
  FLYER_TEMPLATES,
  FLYER_DIMENSIONS,
} from "./flyer-types";
import { CHURCH_LOGO_PATH } from "./church-logo";

interface FlyerRendererProps {
  data: FlyerData;
  svgRef?: React.Ref<SVGSVGElement>;
  logoDataUrl?: string;
  className?: string;
}

/**
 * Splits text into balanced lines for visual layout.
 */
function wrapText(text: string, maxCharsPerLine: number, maxLines = 5): string[] {
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
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.slice(0, maxLines);
}

export function FlyerRenderer({
  data,
  svgRef,
  logoDataUrl,
  className = "",
}: FlyerRendererProps) {
  const { width, height } = FLYER_DIMENSIONS[data.aspectRatio];
  const template = FLYER_TEMPLATES[data.templateId] || FLYER_TEMPLATES["royal-gold"];

  const effectiveLogoUrl = logoDataUrl || CHURCH_LOGO_PATH;
  const isStory = data.aspectRatio === "story";
  const isLandscape = data.aspectRatio === "landscape";

  // Margins
  const paddingX = isLandscape ? 72 : 56;
  const paddingY = isStory ? 84 : isLandscape ? 52 : 52;
  const contentWidth = width - paddingX * 2;

  // -------------------------------------------------------------
  // DYNAMIC ADAPTIVE TYPOGRAPHY SCALING (Prevents text clipping)
  // -------------------------------------------------------------
  const titleChars = (data.title || "").length;
  let titleFontSize = 64;
  let charsPerLine = 24;

  if (isLandscape) {
    // In landscape, left column is ~1040px
    if (titleChars > 90) {
      titleFontSize = 40;
      charsPerLine = 34;
    } else if (titleChars > 60) {
      titleFontSize = 48;
      charsPerLine = 28;
    } else if (titleChars > 35) {
      titleFontSize = 58;
      charsPerLine = 24;
    } else {
      titleFontSize = 68;
      charsPerLine = 20;
    }
  } else if (isStory) {
    // In story mode, height is 1920px (generous)
    if (titleChars > 90) {
      titleFontSize = 48;
      charsPerLine = 26;
    } else if (titleChars > 60) {
      titleFontSize = 56;
      charsPerLine = 22;
    } else if (titleChars > 35) {
      titleFontSize = 66;
      charsPerLine = 18;
    } else {
      titleFontSize = 76;
      charsPerLine = 16;
    }
  } else {
    // Square mode (1080x1080) - tighter vertical space
    if (titleChars > 90) {
      titleFontSize = 38;
      charsPerLine = 32;
    } else if (titleChars > 60) {
      titleFontSize = 46;
      charsPerLine = 26;
    } else if (titleChars > 35) {
      titleFontSize = 54;
      charsPerLine = 22;
    } else {
      titleFontSize = 64;
      charsPerLine = 18;
    }
  }

  const titleLines = wrapText(data.title || "UNTITLED PROGRAM", charsPerLine, 4);
  const subtitleCharsPerLine = isLandscape ? 60 : isStory ? 38 : 42;
  const subtitleLines = wrapText(data.subtitle || "", subtitleCharsPerLine, 3);
  const scriptureLines = wrapText(data.scriptureText || "", subtitleCharsPerLine, 3);

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
        fontFamily:
          template.titleFont === "serif"
            ? "Georgia, 'Times New Roman', serif"
            : "system-ui, -apple-system, sans-serif",
      }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="35" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="shadow-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#000000" floodOpacity="0.75" />
        </filter>

        {/* Gradients */}
        <radialGradient id="ambient-radial-1" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stopColor={template.secondaryAccent} stopOpacity="0.32" />
          <stop offset="50%" stopColor={template.primaryAccent} stopOpacity="0.14" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ambient-radial-2" cx="80%" cy="85%" r="50%">
          <stop offset="0%" stopColor={template.primaryAccent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D6" />
          <stop offset="35%" stopColor={template.primaryAccent} />
          <stop offset="70%" stopColor={template.secondaryAccent} />
          <stop offset="100%" stopColor="#FFFDF7" />
        </linearGradient>

        <linearGradient id="card-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
        </linearGradient>

        {/* Clip path for circular logos and photos */}
        <clipPath id="logo-circle-clip">
          <circle cx="26" cy="26" r="24" />
        </clipPath>

        <clipPath id="feature-circle-clip">
          <circle cx="100" cy="100" r="95" />
        </clipPath>
      </defs>

      {/* 1. Base Ambient Background */}
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
        <g opacity="0.14">
          <circle cx={width / 2} cy={height * 0.4} r={width * 0.45} fill="url(#ambient-radial-1)" filter="url(#glow-gold)" />
          <circle cx={width * 0.2} cy={height * 0.2} r="250" fill={template.primaryAccent} filter="url(#glow-gold)" opacity="0.25" />
          <circle cx={width * 0.8} cy={height * 0.7} r="300" fill={template.secondaryAccent} filter="url(#glow-gold)" opacity="0.2" />
        </g>
      )}

      {template.patternType === "aurora" && (
        <g opacity="0.16">
          <path
            d={`M 0,${height * 0.35} Q ${width * 0.3},${height * 0.15} ${width * 0.6},${height * 0.4} T ${width},${height * 0.25} L ${width},${height} L 0,${height} Z`}
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
        x={22}
        y={22}
        width={width - 44}
        height={height - 44}
        fill="none"
        stroke={template.borderColor}
        strokeWidth="1.5"
        rx="22"
      />
      <rect
        x={30}
        y={30}
        width={width - 60}
        height={height - 60}
        fill="none"
        stroke={template.borderColor}
        strokeWidth="0.5"
        strokeDasharray="8 6"
        rx="18"
        opacity="0.55"
      />

      {/* Corner Ornaments */}
      {[
        { x: 30, y: 30 },
        { x: width - 30, y: 30 },
        { x: 30, y: height - 30 },
        { x: width - 30, y: height - 30 },
      ].map((pt, idx) => (
        <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
          <circle cx="0" cy="0" r="4.5" fill={template.primaryAccent} opacity="0.8" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke={template.primaryAccent} strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke={template.primaryAccent} strokeWidth="1" opacity="0.5" />
        </g>
      ))}

      {/* ============================================================== */}
      {/* LAYOUT A: LANDSCAPE 16:9 MODE (Two-Column Balanced Composition) */}
      {/* ============================================================== */}
      {isLandscape && (
        <g transform={`translate(${paddingX}, ${paddingY})`}>
          {/* Header Bar Across Full Width */}
          <g>
            {/* Church Logo */}
            <g transform="translate(0, 0)">
              <circle cx="26" cy="26" r="26" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="2" />
              <image
                href={effectiveLogoUrl}
                x="2"
                y="2"
                width="48"
                height="48"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#logo-circle-clip)"
              />
            </g>

            {/* Church Name & Title */}
            <text
              x="64"
              y="22"
              fill={template.textColor}
              fontSize="20"
              fontWeight="900"
              letterSpacing="2.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.churchName || "GRACE OF GOD MISSION ASABA"}
            </text>
            <text
              x="64"
              y="42"
              fill={template.mutedColor}
              fontSize="12"
              fontWeight="600"
              letterSpacing="1.2"
              opacity="0.8"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              SANCTUARY OF GRACE & TRUTH · ASABA, DELTA STATE
            </text>

            {/* Category Tag on the far right */}
            {data.category && (
              <g transform={`translate(${contentWidth - 320}, 4)`}>
                <rect width="320" height="38" rx="19" fill={template.badgeBg} stroke={template.borderColor} strokeWidth="1" />
                <text
                  x="160"
                  y="24"
                  fill={template.badgeText}
                  fontSize="12"
                  fontWeight="800"
                  letterSpacing="1.8"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {data.category.toUpperCase()}
                </text>
              </g>
            )}
          </g>

          {/* Left Column (Width: 1040px) -> Main Theme, Subtitle, Scripture */}
          <g transform="translate(0, 84)">
            {/* Badge */}
            {data.badgeText && (
              <g transform="translate(0, 0)">
                <rect
                  x="0"
                  y="0"
                  width={Math.min(500, data.badgeText.length * 11 + 44)}
                  height="34"
                  rx="17"
                  fill="url(#card-glass)"
                  stroke={template.borderColor}
                  strokeWidth="1"
                />
                <circle cx="16" cy="17" r="4" fill={template.secondaryAccent} />
                <text
                  x="28"
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

            {/* Title */}
            <g transform={`translate(0, ${data.badgeText ? 44 : 8})`}>
              {titleLines.map((line, idx) => (
                <text
                  key={idx}
                  x="0"
                  y={idx * (titleFontSize * 1.08) + titleFontSize * 0.9}
                  fill="url(#gold-metallic)"
                  fontSize={titleFontSize}
                  fontWeight="900"
                  letterSpacing="0.5"
                  filter="url(#shadow-drop)"
                >
                  {line}
                </text>
              ))}
            </g>

            {/* Subtitle */}
            {data.subtitle && (
              <g
                transform={`translate(0, ${
                  (data.badgeText ? 44 : 8) + titleLines.length * (titleFontSize * 1.08) + 16
                })`}
              >
                {subtitleLines.slice(0, 3).map((subLine, idx) => (
                  <text
                    key={idx}
                    x="0"
                    y={idx * 26 + 18}
                    fill={template.mutedColor}
                    fontSize={18}
                    fontWeight="500"
                    opacity="0.95"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {subLine}
                  </text>
                ))}
              </g>
            )}

            {/* Scripture Box */}
            {data.scriptureText && (
              <g
                transform={`translate(0, ${
                  (data.badgeText ? 44 : 8) +
                  titleLines.length * (titleFontSize * 1.08) +
                  (data.subtitle ? subtitleLines.slice(0, 3).length * 26 + 28 : 20)
                })`}
              >
                <rect
                  x="0"
                  y="0"
                  width="1020"
                  height={scriptureLines.length > 1 ? 92 : 76}
                  rx="16"
                  fill={template.badgeBg}
                  stroke={template.borderColor}
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="10"
                  x2="0"
                  y2={scriptureLines.length > 1 ? 82 : 66}
                  stroke={template.primaryAccent}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <text
                  x="20"
                  y="24"
                  fill={template.primaryAccent}
                  fontSize="12"
                  fontWeight="800"
                  letterSpacing="1.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {data.scriptureRef || "SCRIPTURE FOCUS"}
                </text>
                {scriptureLines.map((sLine, idx) => (
                  <text
                    key={idx}
                    x="20"
                    y={idx * 20 + 48}
                    fill={template.textColor}
                    fontSize={14}
                    fontStyle="italic"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {idx === 0 ? `“${sLine}` : sLine}
                    {idx === scriptureLines.length - 1 ? "”" : ""}
                  </text>
                ))}
              </g>
            )}
          </g>

          {/* Right Column (Width: 680px) -> Logistics, Ministers, Broadcast Badge, Crest */}
          <g transform={`translate(${contentWidth - 680}, 84)`}>
            {/* Feature Halo Crest or Speaker Photo */}
            <g transform="translate(240, 0)">
              <circle cx="100" cy="100" r="100" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="3" filter="url(#glow-gold)" />
              <image
                href={data.speakerPhotoUrl || effectiveLogoUrl}
                x="5"
                y="5"
                width="190"
                height="190"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#feature-circle-clip)"
              />
            </g>

            {/* Date & Time Card */}
            <g transform="translate(0, 226)">
              <rect width="680" height="88" rx="16" fill="url(#card-glass)" stroke={template.borderColor} strokeWidth="1" />
              <g transform="translate(20, 22)">
                <rect width="24" height="24" rx="4" fill="none" stroke={template.primaryAccent} strokeWidth="2" />
                <line x1="0" y1="8" x2="24" y2="8" stroke={template.primaryAccent} strokeWidth="1.5" />
              </g>
              <text x="56" y="32" fill={template.textColor} fontSize="16" fontWeight="800" letterSpacing="0.8">
                {data.date || "DATE TBA"}
              </text>
              <text x="56" y="58" fill={template.secondaryAccent} fontSize="14" fontWeight="700">
                {data.time || "TIME TBA"}
              </text>
            </g>

            {/* Venue Card */}
            <g transform="translate(0, 326)">
              <rect width="680" height="88" rx="16" fill="url(#card-glass)" stroke={template.borderColor} strokeWidth="1" />
              <g transform="translate(20, 22)">
                <path d="M 12,2 C 7,2 3,6 3,11 C 3,18 12,26 12,26 C 12,26 21,18 21,11 C 21,6 17,2 12,2 Z" fill="none" stroke={template.primaryAccent} strokeWidth="2" />
                <circle cx="12" cy="11" r="3" fill={template.primaryAccent} />
              </g>
              <text x="56" y="32" fill={template.textColor} fontSize="14" fontWeight="800" letterSpacing="0.5">
                LOCATION / SANCTUARY
              </text>
              <text x="56" y="58" fill={template.mutedColor} fontSize="13" fontWeight="500">
                {data.venue && data.venue.length > 55 ? data.venue.slice(0, 52) + "..." : data.venue || "Auditorium of Grace, 12 Jesus Saves Road, Asaba"}
              </text>
            </g>

            {/* Ministers & Broadcast */}
            <g transform="translate(0, 426)">
              <text x="0" y="24" fill={template.primaryAccent} fontSize="16" fontWeight="800" letterSpacing="1">
                {data.minister || "HOST: PASTOR CHUKWUDI EZE"}
              </text>
              {data.guestMinister && (
                <text x="0" y="48" fill={template.secondaryAccent} fontSize="14" fontWeight="700">
                  {data.guestMinister}
                </text>
              )}

              {data.broadcastBadge && (
                <g transform="translate(0, 68)">
                  <rect width="680" height="36" rx="18" fill={template.badgeBg} stroke={template.borderColor} strokeWidth="1" />
                  <circle cx="18" cy="18" r="4.5" fill="#EF4444" />
                  <text x="32" y="23" fill={template.textColor} fontSize="11" fontWeight="800" letterSpacing="1.2">
                    {data.broadcastBadge.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          </g>
        </g>
      )}

      {/* ============================================================== */}
      {/* LAYOUT B: SQUARE (1:1) & STORY (9:16) (Vertical Dynamic Flow)  */}
      {/* ============================================================== */}
      {!isLandscape && (
        <g transform={`translate(${paddingX}, ${paddingY})`}>
          {/* Top Row: Church Emblem & Name */}
          <g>
            <g transform="translate(0, 0)">
              <circle cx="26" cy="26" r="26" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="2" />
              <image
                href={effectiveLogoUrl}
                x="2"
                y="2"
                width="48"
                height="48"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#logo-circle-clip)"
              />
            </g>

            <text
              x="62"
              y="22"
              fill={template.textColor}
              fontSize={isStory ? 20 : 18}
              fontWeight="900"
              letterSpacing="2.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {data.churchName || "GRACE OF GOD MISSION ASABA"}
            </text>
            <text
              x="62"
              y="41"
              fill={template.mutedColor}
              fontSize="11"
              fontWeight="600"
              letterSpacing="1.2"
              opacity="0.8"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              SANCTUARY OF GRACE & TRUTH · ASABA, DELTA STATE
            </text>

            {data.category && (
              <g transform={`translate(${contentWidth - (isStory ? 280 : 250)}, 6)`}>
                <rect width={isStory ? 280 : 250} height="36" rx="18" fill={template.badgeBg} stroke={template.borderColor} strokeWidth="1" />
                <text
                  x={isStory ? 140 : 125}
                  y="23"
                  fill={template.badgeText}
                  fontSize="11"
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

          {/* DYNAMIC MIDDLE CONTENT STACK */}
          {(() => {
            const startY = isStory ? 100 : 76;
            let currentY = startY;

            const badgeY = currentY;
            if (data.badgeText) currentY += 44;

            const titleY = currentY;
            currentY += titleLines.length * (titleFontSize * 1.08) + 14;

            const subtitleY = currentY;
            if (data.subtitle) currentY += subtitleLines.length * 24 + 18;

            const scriptureY = currentY;
            if (data.scriptureText) currentY += (scriptureLines.length > 1 ? 84 : 70) + 20;

            return (
              <g>
                {/* Badge */}
                {data.badgeText && (
                  <g transform={`translate(0, ${badgeY})`}>
                    <rect
                      x="0"
                      y="0"
                      width={Math.min(contentWidth, data.badgeText.length * 11 + 44)}
                      height="32"
                      rx="16"
                      fill="url(#card-glass)"
                      stroke={template.borderColor}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="16" r="4" fill={template.secondaryAccent} />
                    <text
                      x="28"
                      y="21"
                      fill={template.secondaryAccent}
                      fontSize="11"
                      fontWeight="800"
                      letterSpacing="2"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {data.badgeText.toUpperCase()}
                    </text>
                  </g>
                )}

                {/* Title */}
                <g transform={`translate(0, ${titleY})`}>
                  {titleLines.map((line, idx) => (
                    <text
                      key={idx}
                      x="0"
                      y={idx * (titleFontSize * 1.08) + titleFontSize * 0.9}
                      fill="url(#gold-metallic)"
                      fontSize={titleFontSize}
                      fontWeight="900"
                      letterSpacing="0.5"
                      filter="url(#shadow-drop)"
                    >
                      {line}
                    </text>
                  ))}
                </g>

                {/* Subtitle */}
                {data.subtitle && (
                  <g transform={`translate(0, ${subtitleY})`}>
                    {subtitleLines.map((subLine, idx) => (
                      <text
                        key={idx}
                        x="0"
                        y={idx * 24 + 16}
                        fill={template.mutedColor}
                        fontSize={isStory ? 20 : 17}
                        fontWeight="500"
                        opacity="0.95"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {subLine}
                      </text>
                    ))}
                  </g>
                )}

                {/* Scripture Box */}
                {data.scriptureText && (
                  <g transform={`translate(0, ${scriptureY})`}>
                    <rect
                      x="0"
                      y="0"
                      width={contentWidth}
                      height={scriptureLines.length > 1 ? 84 : 70}
                      rx="16"
                      fill={template.badgeBg}
                      stroke={template.borderColor}
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="8"
                      x2="0"
                      y2={scriptureLines.length > 1 ? 76 : 62}
                      stroke={template.primaryAccent}
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <text
                      x="20"
                      y="24"
                      fill={template.primaryAccent}
                      fontSize="12"
                      fontWeight="800"
                      letterSpacing="1.5"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {data.scriptureRef || "SCRIPTURE FOCUS"}
                    </text>
                    {scriptureLines.map((sLine, idx) => (
                      <text
                        key={idx}
                        x="20"
                        y={idx * 20 + 46}
                        fill={template.textColor}
                        fontSize={14}
                        fontStyle="italic"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {idx === 0 ? `“${sLine}` : sLine}
                        {idx === scriptureLines.length - 1 ? "”" : ""}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })()}

          {/* Speaker Photo / Church Emblem in Story Mode */}
          {isStory && (
            <g transform={`translate(${contentWidth / 2 - 100}, 840)`}>
              <circle cx="100" cy="100" r="100" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="3" filter="url(#glow-gold)" />
              <image
                href={data.speakerPhotoUrl || effectiveLogoUrl}
                x="5"
                y="5"
                width="190"
                height="190"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#feature-circle-clip)"
              />
            </g>
          )}

          {/* BOTTOM LOGISTICS ROW */}
          <g transform={`translate(0, ${height - paddingY * 2 - (isStory ? 290 : 170)})`}>
            {/* Date & Time Card */}
            <g>
              <rect
                x="0"
                y="0"
                width={contentWidth * 0.48}
                height="78"
                rx="16"
                fill="url(#card-glass)"
                stroke={template.borderColor}
                strokeWidth="1"
              />
              <g transform="translate(16, 16)">
                <rect width="20" height="20" rx="4" fill="none" stroke={template.primaryAccent} strokeWidth="2" />
                <line x1="0" y1="7" x2="20" y2="7" stroke={template.primaryAccent} strokeWidth="1.5" />
              </g>
              <text x="46" y="27" fill={template.textColor} fontSize="13" fontWeight="800" letterSpacing="0.8">
                {data.date || "DATE TBA"}
              </text>
              <text x="46" y="52" fill={template.secondaryAccent} fontSize="12" fontWeight="700">
                {data.time || "TIME TBA"}
              </text>
            </g>

            {/* Venue Card */}
            <g transform={`translate(${contentWidth * 0.52}, 0)`}>
              <rect
                x="0"
                y="0"
                width={contentWidth * 0.48}
                height="78"
                rx="16"
                fill="url(#card-glass)"
                stroke={template.borderColor}
                strokeWidth="1"
              />
              <g transform="translate(16, 16)">
                <path d="M 10,2 C 6,2 2,6 2,10 C 2,16 10,23 10,23 C 10,23 18,16 18,10 C 18,6 14,2 10,2 Z" fill="none" stroke={template.primaryAccent} strokeWidth="2" />
                <circle cx="10" cy="10" r="2.5" fill={template.primaryAccent} />
              </g>
              <text x="44" y="27" fill={template.textColor} fontSize="12" fontWeight="800" letterSpacing="0.5">
                LOCATION / SANCTUARY
              </text>
              <text x="44" y="52" fill={template.mutedColor} fontSize="11" fontWeight="500">
                {data.venue && data.venue.length > 38 ? data.venue.slice(0, 35) + "..." : data.venue || "12 Jesus Saves Road, Asaba"}
              </text>
            </g>

            {/* Ministers & Broadcast Footer */}
            <g transform="translate(0, 92)">
              <text x="0" y="16" fill={template.primaryAccent} fontSize="13" fontWeight="800" letterSpacing="1">
                {data.minister || "HOST: PASTOR CHUKWUDI EZE"}
              </text>
              {data.guestMinister && (
                <text x="0" y="36" fill={template.secondaryAccent} fontSize="12" fontWeight="700">
                  {data.guestMinister}
                </text>
              )}

              {data.broadcastBadge && (
                <g transform={`translate(${contentWidth - (isStory ? 420 : 360)}, 2)`}>
                  <rect
                    width={isStory ? 420 : 360}
                    height="30"
                    rx="15"
                    fill={template.badgeBg}
                    stroke={template.borderColor}
                    strokeWidth="1"
                  />
                  <circle cx="15" cy="15" r="4" fill="#EF4444" />
                  <text x="26" y="20" fill={template.textColor} fontSize="9.5" fontWeight="800" letterSpacing="1.2">
                    {data.broadcastBadge.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}
