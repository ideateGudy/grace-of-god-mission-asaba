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
  selectedLayerId?: string | null;
  onSelectLayer?: (layerId: string) => void;
  onLayerPointerDown?: (e: React.PointerEvent, layerId: string) => void;
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

/**
 * Parses day number and month from date string for 2026 Bento date card.
 * e.g. "SUNDAY, 25TH OCTOBER 2026" -> { day: "25", month: "OCT 2026", weekday: "SUNDAY" }
 */
function parseBentoDate(dateStr: string): { day: string; month: string; weekday: string } {
  if (!dateStr) return { day: "25", month: "OCT 2026", weekday: "SUNDAY" };

  const dayMatch = dateStr.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/i);
  const day = dayMatch ? dayMatch[1].padStart(2, "0") : "25";

  const monthMatch = dateStr.match(
    /\b(JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUN(?:E)?|JUL(?:Y)?|AUG(?:UST)?|SEP(?:TEMBER)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?)\b/i
  );
  const monthName = monthMatch ? monthMatch[1].slice(0, 3).toUpperCase() : "OCT";

  const yearMatch = dateStr.match(/\b(202\d)\b/);
  const year = yearMatch ? yearMatch[1] : "2026";

  const weekdayMatch = dateStr.match(
    /\b(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUN|MON|TUE|WED|THU|FRI|SAT)\b/i
  );
  const weekday = weekdayMatch ? weekdayMatch[1].toUpperCase() : "SUNDAY";

  return {
    day,
    month: `${monthName} ${year}`,
    weekday,
  };
}

export function FlyerRenderer({
  data,
  svgRef,
  logoDataUrl,
  className = "",
  selectedLayerId,
  onSelectLayer,
  onLayerPointerDown,
}: FlyerRendererProps) {
  const { width, height } = FLYER_DIMENSIONS[data.aspectRatio];
  const template = FLYER_TEMPLATES[data.templateId] || FLYER_TEMPLATES["royal-gold"];

  const effectiveLogoUrl = logoDataUrl || CHURCH_LOGO_PATH;
  const isStory = data.aspectRatio === "story";
  const isLandscape = data.aspectRatio === "landscape";

  // Modern 2026 Architectural Margins
  const paddingX = isLandscape ? 72 : 56;
  const paddingY = isStory ? 80 : isLandscape ? 48 : 50;
  const contentWidth = width - paddingX * 2;

  // -------------------------------------------------------------
  // DYNAMIC ADAPTIVE 2026 TYPOGRAPHY SCALING (Prevents text clipping)
  // -------------------------------------------------------------
  const titleChars = (data.title || "").length;
  let titleFontSize = 64;
  let charsPerLine = 22;

  if (isLandscape) {
    if (titleChars > 90) {
      titleFontSize = 38;
      charsPerLine = 34;
    } else if (titleChars > 60) {
      titleFontSize = 46;
      charsPerLine = 28;
    } else if (titleChars > 35) {
      titleFontSize = 56;
      charsPerLine = 24;
    } else {
      titleFontSize = 66;
      charsPerLine = 20;
    }
  } else if (isStory) {
    if (titleChars > 90) {
      titleFontSize = 46;
      charsPerLine = 24;
    } else if (titleChars > 60) {
      titleFontSize = 56;
      charsPerLine = 20;
    } else if (titleChars > 35) {
      titleFontSize = 68;
      charsPerLine = 17;
    } else {
      titleFontSize = 80;
      charsPerLine = 15;
    }
  } else {
    // Square mode (1080x1080)
    if (titleChars > 90) {
      titleFontSize = 38;
      charsPerLine = 30;
    } else if (titleChars > 60) {
      titleFontSize = 46;
      charsPerLine = 24;
    } else if (titleChars > 35) {
      titleFontSize = 54;
      charsPerLine = 20;
    } else {
      titleFontSize = 64;
      charsPerLine = 17;
    }
  }

  const titleLines = wrapText(data.title || "UNTITLED PROGRAM", charsPerLine, 4);
  const subtitleCharsPerLine = isLandscape ? 58 : isStory ? 36 : 40;
  const subtitleLines = wrapText(data.subtitle || "", subtitleCharsPerLine, 3);
  const scriptureLines = wrapText(data.scriptureText || "", subtitleCharsPerLine, 3);

  const bentoDate = parseBentoDate(data.date);

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
            ? "Playfair Display, 'Times New Roman', Georgia, serif"
            : "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="glow-volumetric" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="50" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="shadow-deep" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#000000" floodOpacity="0.85" />
        </filter>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        {/* 2026 Multi-Point Mesh Gradients */}
        <radialGradient id="mesh-orb-1" cx="20%" cy="15%" r="70%">
          <stop offset="0%" stopColor={template.primaryAccent} stopOpacity="0.35" />
          <stop offset="45%" stopColor={template.secondaryAccent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="mesh-orb-2" cx="80%" cy="40%" r="65%">
          <stop offset="0%" stopColor={template.secondaryAccent} stopOpacity="0.3" />
          <stop offset="60%" stopColor={template.primaryAccent} stopOpacity="0.08" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="mesh-orb-3" cx="50%" cy="85%" r="55%">
          <stop offset="0%" stopColor={template.primaryAccent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={template.bgDark} stopOpacity="0" />
        </radialGradient>

        {/* 2026 Liquid Chrome & Metallic Gold Gradients */}
        <linearGradient id="liquid-metallic" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFF4D4" />
          <stop offset="55%" stopColor={template.primaryAccent} />
          <stop offset="85%" stopColor={template.secondaryAccent} />
          <stop offset="100%" stopColor="#FFFDF5" />
        </linearGradient>

        <linearGradient id="glass-card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.015" />
        </linearGradient>

        <linearGradient id="glass-card-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="50%" stopColor={template.primaryAccent} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>

        {/* Clip Paths */}
        <clipPath id="logo-circle-clip">
          <circle cx="28" cy="28" r="26" />
        </clipPath>

        <clipPath id="speaker-halo-clip">
          <circle cx="110" cy="110" r="102" />
        </clipPath>

        {/* Dynamic Custom Layer Masks & Clips */}
        {data.layers?.map((layer) => (
          <React.Fragment key={layer.id}>
            {layer.maskShape === "circle" && (
              <clipPath id={`clip-circle-${layer.id}`}>
                <circle
                  cx={layer.width / 2}
                  cy={layer.height / 2}
                  r={Math.min(layer.width, layer.height) / 2}
                />
              </clipPath>
            )}
            {layer.maskShape === "rounded" && (
              <clipPath id={`clip-round-${layer.id}`}>
                <rect
                  x="0"
                  y="0"
                  width={layer.width}
                  height={layer.height}
                  rx={Math.min(layer.width, layer.height) * 0.12}
                />
              </clipPath>
            )}
            {layer.maskShape === "feathered" && (
              <mask id={`mask-feather-${layer.id}`}>
                <radialGradient id={`feather-grad-${layer.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="35%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.75" />
                  <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                <rect
                  x="0"
                  y="0"
                  width={layer.width}
                  height={layer.height}
                  fill={`url(#feather-grad-${layer.id})`}
                />
              </mask>
            )}
          </React.Fragment>
        ))}
      </defs>

      {/* 1. Base Dark & Mesh Layer */}
      <rect width={width} height={height} fill={template.bgDark} />
      <rect width={width} height={height} fill="url(#mesh-orb-1)" />
      <rect width={width} height={height} fill="url(#mesh-orb-2)" />
      <rect width={width} height={height} fill="url(#mesh-orb-3)" />

      {/* 2. 2026 Sacred Geometry & Subtle Grid Overlay */}
      <g opacity="0.04" stroke="#FFFFFF" strokeWidth="1">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v-${i}`} x1={(width / 12) * i} y1="0" x2={(width / 12) * i} y2={height} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={(height / 12) * i} x2={width} y2={(height / 12) * i} />
        ))}
      </g>

      {/* Dynamic Template Lighting Accents */}
      {template.patternType === "radial-rays" && (
        <g opacity="0.07" stroke={template.primaryAccent} strokeWidth="1.2">
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i * 360) / 32;
            const rad = (angle * Math.PI) / 180;
            const x2 = width / 2 + Math.cos(rad) * Math.max(width, height);
            const y2 = height * 0.35 + Math.sin(rad) * Math.max(width, height);
            return <line key={i} x1={width / 2} y1={height * 0.35} x2={x2} y2={y2} />;
          })}
        </g>
      )}

      {template.patternType === "fire-burst" && (
        <g opacity="0.15">
          <circle cx={width * 0.5} cy={height * 0.35} r={width * 0.4} fill="url(#mesh-orb-1)" filter="url(#glow-volumetric)" />
          <circle cx={width * 0.15} cy={height * 0.2} r="280" fill={template.primaryAccent} filter="url(#glow-volumetric)" opacity="0.3" />
        </g>
      )}

      {template.patternType === "aurora" && (
        <g opacity="0.2">
          <path
            d={`M 0,${height * 0.3} Q ${width * 0.35},${height * 0.1} ${width * 0.7},${height * 0.35} T ${width},${height * 0.2} L ${width},${height} L 0,${height} Z`}
            fill="url(#mesh-orb-1)"
          />
        </g>
      )}

      {template.patternType === "prophetic-stars" && (
        <g opacity="0.25">
          {/* Concentric Prophetic Covenant Rings */}
          <circle cx={width / 2} cy={height * 0.38} r={width * 0.38} fill="none" stroke={template.primaryAccent} strokeWidth="1" strokeDasharray="6 6" />
          <circle cx={width / 2} cy={height * 0.38} r={width * 0.28} fill="none" stroke={template.secondaryAccent} strokeWidth="1.5" opacity="0.6" />
          <circle cx={width / 2} cy={height * 0.38} r={width * 0.18} fill="none" stroke={template.primaryAccent} strokeWidth="2" strokeDasharray="12 8" />
          {/* Multi-point Prophetic Star Rays */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const rad = (angle * Math.PI) / 180;
            const x2 = width / 2 + Math.cos(rad) * (width * 0.45);
            const y2 = height * 0.38 + Math.sin(rad) * (width * 0.45);
            return (
              <line
                key={i}
                x1={width / 2}
                y1={height * 0.38}
                x2={x2}
                y2={y2}
                stroke={template.primaryAccent}
                strokeWidth={i % 2 === 0 ? "1.5" : "0.75"}
                opacity={i % 2 === 0 ? "0.4" : "0.2"}
              />
            );
          })}
        </g>
      )}

      {template.patternType === "crown-rays" && (
        <g opacity="0.22">
          {/* Radiant Dawn Prophetic Fan / Crown */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = -160 + (i * 140) / 23;
            const rad = (angle * Math.PI) / 180;
            const x2 = width / 2 + Math.cos(rad) * Math.max(width, height);
            const y2 = height * 0.75 + Math.sin(rad) * Math.max(width, height);
            return (
              <line
                key={i}
                x1={width / 2}
                y1={height * 0.75}
                x2={x2}
                y2={y2}
                stroke={template.primaryAccent}
                strokeWidth={i % 3 === 0 ? "2" : "1"}
                opacity={0.35}
              />
            );
          })}
        </g>
      )}

      {/* 3. 2026 Architectural Framing & Corner Crosshairs */}
      <rect
        x={20}
        y={20}
        width={width - 40}
        height={height - 40}
        fill="none"
        stroke="url(#glass-card-border)"
        strokeWidth="1.5"
        rx="26"
      />

      {/* Modern Editorial Crosshairs `+` in 4 corners */}
      {[
        { x: 38, y: 38 },
        { x: width - 38, y: 38 },
        { x: 38, y: height - 38 },
        { x: width - 38, y: height - 38 },
      ].map((pt, idx) => (
        <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
          <line x1="-8" y1="0" x2="8" y2="0" stroke={template.primaryAccent} strokeWidth="1.5" opacity="0.75" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke={template.primaryAccent} strokeWidth="1.5" opacity="0.75" />
        </g>
      ))}

      {/* Micro-Editorial Technical Tags */}
      <g opacity="0.55" fontSize="10" fontWeight="700" letterSpacing="2.5" fill="#FFFFFF" fontFamily="monospace">
        <text x="56" y="32">GGM ASABA // 2026.SEASON</text>
        <text x={width - 56} y="32" textAnchor="end">06°11&apos;N · 06°44&apos;E</text>
      </g>

      {/* ============================================================== */}
      {/* 2026 ARCHITECTURE A: WIDESCREEN LANDSCAPE (16:9 · 1920 × 1080) */}
      {/* ============================================================== */}
      {isLandscape && (
        <g transform={`translate(${paddingX}, ${paddingY})`}>
          {/* Header Row: Official Logo Glass Pill + Category Badge */}
          <g>
            <g transform="translate(0, 0)">
              {/* Logo Pill Container */}
              <rect
                width="420"
                height="62"
                rx="31"
                fill="url(#glass-card-bg)"
                stroke="url(#glass-card-border)"
                strokeWidth="1.2"
                filter="url(#card-shadow)"
              />
              {/* Official Church Logo */}
              <g transform="translate(4, 3)">
                <circle cx="28" cy="28" r="28" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="2" />
                <image
                  href={effectiveLogoUrl}
                  x="2"
                  y="2"
                  width="52"
                  height="52"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#logo-circle-clip)"
                />
              </g>

              {/* Church Typography in Pill */}
              <text x="72" y="27" fill="#FFFFFF" fontSize="15" fontWeight="900" letterSpacing="2">
                GRACE OF GOD MISSION
              </text>
              <text x="72" y="46" fill={template.primaryAccent} fontSize="11" fontWeight="700" letterSpacing="1.2">
                ASABA · SANCTUARY OF GRACE & TRUTH
              </text>
            </g>

            {/* Category Tag on the far right */}
            {data.category && (
              <g transform={`translate(${contentWidth - 340}, 10)`}>
                <rect width="340" height="42" rx="21" fill={template.badgeBg} stroke="url(#glass-card-border)" strokeWidth="1" />
                <circle cx="20" cy="21" r="5" fill="#22C55E" />
                <text
                  x="180"
                  y="26"
                  fill={template.badgeText}
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="2.2"
                  textAnchor="middle"
                >
                  {data.category.toUpperCase()}
                </text>
              </g>
            )}
          </g>

          {/* Left Column (Width: 1040px) -> Dynamic Headline Stack */}
          <g transform="translate(0, 96)">
            {/* Feature Highlight Pill */}
            {data.badgeText && (
              <g transform="translate(0, 0)">
                <rect
                  width={Math.min(500, data.badgeText.length * 11 + 44)}
                  height="34"
                  rx="17"
                  fill="url(#glass-card-bg)"
                  stroke={template.borderColor}
                  strokeWidth="1"
                />
                <circle cx="16" cy="17" r="4.5" fill={template.secondaryAccent} />
                <text
                  x="28"
                  y="22"
                  fill={template.secondaryAccent}
                  fontSize="11.5"
                  fontWeight="900"
                  letterSpacing="2.5"
                >
                  {data.badgeText.toUpperCase()}
                </text>
              </g>
            )}

            {/* Main Theme Headline */}
            <g transform={`translate(0, ${data.badgeText ? 44 : 8})`}>
              {titleLines.map((line, idx) => (
                <text
                  key={idx}
                  x="0"
                  y={idx * (titleFontSize * 1.08) + titleFontSize * 0.9}
                  fill="url(#liquid-metallic)"
                  fontSize={titleFontSize}
                  fontWeight="900"
                  letterSpacing="0.8"
                  filter="url(#shadow-deep)"
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
                    fontSize={17}
                    fontWeight="500"
                    opacity="0.95"
                  >
                    {subLine}
                  </text>
                ))}
              </g>
            )}

            {/* Scripture Bento Card */}
            {data.scriptureText && (
              <g
                transform={`translate(0, ${
                  (data.badgeText ? 44 : 8) +
                  titleLines.length * (titleFontSize * 1.08) +
                  (data.subtitle ? subtitleLines.slice(0, 3).length * 26 + 28 : 20)
                })`}
              >
                <rect
                  width="1000"
                  height={scriptureLines.length > 1 ? 92 : 76}
                  rx="18"
                  fill="url(#glass-card-bg)"
                  stroke="url(#glass-card-border)"
                  strokeWidth="1"
                  filter="url(#card-shadow)"
                />
                <line x1="0" y1="12" x2="0" y2={scriptureLines.length > 1 ? 80 : 64} stroke={template.primaryAccent} strokeWidth="5" strokeLinecap="round" />
                <text x="24" y="26" fill={template.primaryAccent} fontSize="12" fontWeight="900" letterSpacing="2">
                  // {data.scriptureRef || "SCRIPTURE FOCUS"}
                </text>
                {scriptureLines.map((sLine, idx) => (
                  <text key={idx} x="24" y={idx * 20 + 50} fill="#FFFFFF" fontSize="14" fontStyle="italic">
                    {idx === 0 ? `“${sLine}` : sLine}
                    {idx === scriptureLines.length - 1 ? "”" : ""}
                  </text>
                ))}
              </g>
            )}
          </g>

          {/* Right Column (Width: 680px) -> 2026 Bento Logistics Modules */}
          <g transform={`translate(${contentWidth - 680}, 96)`}>
            {/* Bento Module 1: 2026 Bold Date Module */}
            <g>
              <rect width="680" height="120" rx="20" fill="url(#glass-card-bg)" stroke="url(#glass-card-border)" strokeWidth="1.2" filter="url(#card-shadow)" />
              {/* Massive Day Number */}
              <text x="28" y="88" fill="url(#liquid-metallic)" fontSize="72" fontWeight="900" letterSpacing="-1">
                {bentoDate.day}
              </text>
              <g transform="translate(140, 28)">
                <text x="0" y="22" fill={template.primaryAccent} fontSize="13" fontWeight="900" letterSpacing="2">
                  {bentoDate.weekday}
                </text>
                <text x="0" y="44" fill="#FFFFFF" fontSize="18" fontWeight="800" letterSpacing="0.8">
                  {bentoDate.month}
                </text>
                <text x="0" y="66" fill={template.secondaryAccent} fontSize="13" fontWeight="700">
                  {data.time || "TIME TBA"}
                </text>
              </g>
            </g>

            {/* Bento Module 2: Venue & Location */}
            <g transform="translate(0, 134)">
              <rect width="680" height="96" rx="20" fill="url(#glass-card-bg)" stroke="url(#glass-card-border)" strokeWidth="1.2" filter="url(#card-shadow)" />
              <g transform="translate(24, 26)">
                <circle cx="22" cy="22" r="22" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="1" />
                <path d="M 22,12 C 18,12 15,15 15,19 C 15,24 22,30 22,30 C 22,30 29,24 29,19 C 29,15 26,12 22,12 Z" fill="none" stroke={template.primaryAccent} strokeWidth="2" />
                <circle cx="22" cy="19" r="2.5" fill={template.primaryAccent} />
              </g>
              <text x="82" y="38" fill={template.primaryAccent} fontSize="11.5" fontWeight="900" letterSpacing="1.8">
                SANCTUARY LOCATION
              </text>
              <text x="82" y="62" fill="#FFFFFF" fontSize="14" fontWeight="600">
                {data.venue && data.venue.length > 50 ? data.venue.slice(0, 47) + "..." : data.venue || "Auditorium of Grace, 12 Jesus Saves Road, Asaba"}
              </text>
            </g>

            {/* Bento Module 3: Minister Leadership */}
            <g transform="translate(0, 244)">
              <rect width="680" height="88" rx="20" fill="url(#glass-card-bg)" stroke="url(#glass-card-border)" strokeWidth="1.2" filter="url(#card-shadow)" />
              <g transform="translate(24, 20)">
                <circle cx="24" cy="24" r="24" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="1.5" />
                <image
                  href={data.speakerPhotoUrl || effectiveLogoUrl}
                  x="2"
                  y="2"
                  width="44"
                  height="44"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#logo-circle-clip)"
                />
              </g>
              <text x="86" y="36" fill={template.primaryAccent} fontSize="11.5" fontWeight="900" letterSpacing="1.5">
                MINISTERING
              </text>
              <text x="86" y="58" fill="#FFFFFF" fontSize="15" fontWeight="800">
                {data.minister || "HOST: PASTOR CHUKWUDI EZE"}
              </text>
              {data.guestMinister && (
                <text x="86" y="78" fill={template.secondaryAccent} fontSize="13" fontWeight="700">
                  {data.guestMinister}
                </text>
              )}
            </g>

            {/* Bento Module 4: Broadcast Banner */}
            {data.broadcastBadge && (
              <g transform="translate(0, 344)">
                <rect width="680" height="42" rx="21" fill={template.badgeBg} stroke="url(#glass-card-border)" strokeWidth="1.2" />
                <circle cx="22" cy="21" r="5" fill="#EF4444" />
                <text x="36" y="26" fill="#FFFFFF" fontSize="11" fontWeight="900" letterSpacing="1.8">
                  {data.broadcastBadge.toUpperCase()}
                </text>
              </g>
            )}
          </g>
        </g>
      )}

      {/* ============================================================== */}
      {/* 2026 ARCHITECTURE B: SQUARE (1:1) & STORY (9:16) (Bento Stack) */}
      {/* ============================================================== */}
      {!isLandscape && (
        <g transform={`translate(${paddingX}, ${paddingY})`}>
          {/* Header Bar: Official Logo Glass Pill + Category Badge */}
          <g>
            <g transform="translate(0, 0)">
              <rect
                width={isStory ? 440 : 390}
                height="58"
                rx="29"
                fill="url(#glass-card-bg)"
                stroke="url(#glass-card-border)"
                strokeWidth="1.2"
                filter="url(#card-shadow)"
              />
              <g transform="translate(4, 3)">
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

              <text x="68" y="25" fill="#FFFFFF" fontSize="13.5" fontWeight="900" letterSpacing="1.8">
                GRACE OF GOD MISSION
              </text>
              <text x="68" y="44" fill={template.primaryAccent} fontSize="10" fontWeight="700" letterSpacing="1">
                ASABA · SANCTUARY OF GRACE
              </text>
            </g>

            {data.category && (
              <g transform={`translate(${contentWidth - (isStory ? 290 : 250)}, 8)`}>
                <rect width={isStory ? 290 : 250} height="40" rx="20" fill={template.badgeBg} stroke="url(#glass-card-border)" strokeWidth="1" />
                <circle cx="16" cy="20" r="4.5" fill="#22C55E" />
                <text
                  x={isStory ? 152 : 132}
                  y="25"
                  fill={template.badgeText}
                  fontSize="10.5"
                  fontWeight="900"
                  letterSpacing="1.8"
                  textAnchor="middle"
                >
                  {data.category.toUpperCase()}
                </text>
              </g>
            )}
          </g>

          {/* DYNAMIC MIDDLE CONTENT STACK */}
          {(() => {
            const startY = isStory ? 104 : 78;
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
                {/* Highlight Badge */}
                {data.badgeText && (
                  <g transform={`translate(0, ${badgeY})`}>
                    <rect
                      width={Math.min(contentWidth, data.badgeText.length * 11 + 44)}
                      height="32"
                      rx="16"
                      fill="url(#glass-card-bg)"
                      stroke={template.borderColor}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="16" r="4.5" fill={template.secondaryAccent} />
                    <text
                      x="28"
                      y="21"
                      fill={template.secondaryAccent}
                      fontSize="11"
                      fontWeight="900"
                      letterSpacing="2.2"
                    >
                      {data.badgeText.toUpperCase()}
                    </text>
                  </g>
                )}

                {/* Main Theme Headline */}
                <g transform={`translate(0, ${titleY})`}>
                  {titleLines.map((line, idx) => (
                    <text
                      key={idx}
                      x="0"
                      y={idx * (titleFontSize * 1.08) + titleFontSize * 0.9}
                      fill="url(#liquid-metallic)"
                      fontSize={titleFontSize}
                      fontWeight="900"
                      letterSpacing="0.5"
                      filter="url(#shadow-deep)"
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
                      >
                        {subLine}
                      </text>
                    ))}
                  </g>
                )}

                {/* Scripture Bento Card */}
                {data.scriptureText && (
                  <g transform={`translate(0, ${scriptureY})`}>
                    <rect
                      width={contentWidth}
                      height={scriptureLines.length > 1 ? 84 : 70}
                      rx="18"
                      fill="url(#glass-card-bg)"
                      stroke="url(#glass-card-border)"
                      strokeWidth="1"
                      filter="url(#card-shadow)"
                    />
                    <line x1="0" y1="8" x2="0" y2={scriptureLines.length > 1 ? 76 : 62} stroke={template.primaryAccent} strokeWidth="5" strokeLinecap="round" />
                    <text x="22" y="24" fill={template.primaryAccent} fontSize="11" fontWeight="900" letterSpacing="1.8">
                      // {data.scriptureRef || "SCRIPTURE FOCUS"}
                    </text>
                    {scriptureLines.map((sLine, idx) => (
                      <text key={idx} x="22" y={idx * 20 + 46} fill="#FFFFFF" fontSize="13.5" fontStyle="italic">
                        {idx === 0 ? `“${sLine}` : sLine}
                        {idx === scriptureLines.length - 1 ? "”" : ""}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })()}

          {/* Featured Speaker Halo in Story Mode */}
          {isStory && (
            <g transform={`translate(${contentWidth / 2 - 110}, 840)`}>
              <circle cx="110" cy="110" r="110" fill={template.badgeBg} stroke="url(#glass-card-border)" strokeWidth="3" filter="url(#glow-volumetric)" />
              <image
                href={data.speakerPhotoUrl || effectiveLogoUrl}
                x="8"
                y="8"
                width="204"
                height="204"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#speaker-halo-clip)"
              />
            </g>
          )}

          {/* 2026 BENTO LOGISTICS DOCK (At Bottom) */}
          <g transform={`translate(0, ${height - paddingY * 2 - (isStory ? 300 : 185)})`}>
            {/* Bento Row 1: Big Date Card & Location Card */}
            <g>
              {/* Bento Card: Date */}
              <g>
                <rect
                  width={contentWidth * 0.48}
                  height="88"
                  rx="18"
                  fill="url(#glass-card-bg)"
                  stroke="url(#glass-card-border)"
                  strokeWidth="1.2"
                  filter="url(#card-shadow)"
                />
                <text x="18" y="60" fill="url(#liquid-metallic)" fontSize="48" fontWeight="900">
                  {bentoDate.day}
                </text>
                <g transform="translate(84, 18)">
                  <text x="0" y="16" fill={template.primaryAccent} fontSize="11" fontWeight="900" letterSpacing="1.5">
                    {bentoDate.weekday}
                  </text>
                  <text x="0" y="34" fill="#FFFFFF" fontSize="13" fontWeight="800">
                    {bentoDate.month}
                  </text>
                  <text x="0" y="52" fill={template.secondaryAccent} fontSize="11.5" fontWeight="700">
                    {data.time || "TIME TBA"}
                  </text>
                </g>
              </g>

              {/* Bento Card: Location */}
              <g transform={`translate(${contentWidth * 0.52}, 0)`}>
                <rect
                  width={contentWidth * 0.48}
                  height="88"
                  rx="18"
                  fill="url(#glass-card-bg)"
                  stroke="url(#glass-card-border)"
                  strokeWidth="1.2"
                  filter="url(#card-shadow)"
                />
                <g transform="translate(18, 18)">
                  <circle cx="16" cy="16" r="16" fill={template.badgeBg} stroke={template.primaryAccent} strokeWidth="1" />
                  <path d="M 16,9 C 13,9 11,11 11,14 C 11,18 16,23 16,23 C 16,23 21,18 21,14 C 21,11 19,9 16,9 Z" fill="none" stroke={template.primaryAccent} strokeWidth="1.8" />
                </g>
                <text x="60" y="34" fill={template.primaryAccent} fontSize="11" fontWeight="900" letterSpacing="1.5">
                  SANCTUARY
                </text>
                <text x="60" y="56" fill="#FFFFFF" fontSize="12" fontWeight="600">
                  {data.venue && data.venue.length > 36 ? data.venue.slice(0, 33) + "..." : data.venue || "12 Jesus Saves Road, Asaba"}
                </text>
              </g>
            </g>

            {/* Bento Row 2: Minister & Broadcast Pill */}
            <g transform="translate(0, 102)">
              <text x="0" y="18" fill={template.primaryAccent} fontSize="13.5" fontWeight="900" letterSpacing="1.2">
                {data.minister || "HOST: PASTOR CHUKWUDI EZE"}
              </text>
              {data.guestMinister && (
                <text x="0" y="38" fill={template.secondaryAccent} fontSize="12.5" fontWeight="700">
                  {data.guestMinister}
                </text>
              )}

              {data.broadcastBadge && (
                <g transform={`translate(${contentWidth - (isStory ? 440 : 380)}, 2)`}>
                  <rect
                    width={isStory ? 440 : 380}
                    height="32"
                    rx="16"
                    fill={template.badgeBg}
                    stroke="url(#glass-card-border)"
                    strokeWidth="1"
                  />
                  <circle cx="16" cy="16" r="4.5" fill="#EF4444" />
                  <text x="28" y="21" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="1.8">
                    {data.broadcastBadge.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          </g>
        </g>
      )}

      {/* ============================================================== */}
      {/* 2026 CUSTOM DRAG-AND-DROP IMAGE LAYERS & BLEND ENGINE          */}
      {/* ============================================================== */}
      {data.layers && data.layers.length > 0 && (
        <g id="custom-image-layers">
          {data.layers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            return (
              <g
                key={layer.id}
                id={`layer-${layer.id}`}
                transform={`translate(${layer.x + layer.width / 2}, ${layer.y + layer.height / 2}) rotate(${layer.rotation}) translate(${-layer.width / 2}, ${-layer.height / 2})`}
                style={{
                  mixBlendMode: layer.blendMode,
                  opacity: layer.opacity,
                  cursor: onLayerPointerDown ? "grab" : "default",
                }}
                onPointerDown={(e) => {
                  if (onLayerPointerDown) {
                    onLayerPointerDown(e, layer.id);
                  }
                }}
                onClick={(e) => {
                  if (onSelectLayer) {
                    e.stopPropagation();
                    onSelectLayer(layer.id);
                  }
                }}
              >
                <image
                  href={layer.url}
                  x="0"
                  y="0"
                  width={layer.width}
                  height={layer.height}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={
                    layer.maskShape === "circle"
                      ? `url(#clip-circle-${layer.id})`
                      : layer.maskShape === "rounded"
                      ? `url(#clip-round-${layer.id})`
                      : undefined
                  }
                  mask={
                    layer.maskShape === "feathered"
                      ? `url(#mask-feather-${layer.id})`
                      : undefined
                  }
                />
                {isSelected && (
                  <g pointerEvents="none">
                    <rect
                      x="0"
                      y="0"
                      width={layer.width}
                      height={layer.height}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3.5"
                      strokeDasharray="12 8"
                      rx={layer.maskShape === "circle" ? layer.width / 2 : 14}
                    />
                    <circle cx="0" cy="0" r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx={layer.width} cy="0" r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="0" cy={layer.height} r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx={layer.width} cy={layer.height} r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
