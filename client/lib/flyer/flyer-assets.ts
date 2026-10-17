/**
 * Curated Sacred Graphic Assets for Flyer Blending & Design Tools
 * Lightweight SVG Data URLs for instant 1-click addition and blending.
 */

export interface CuratedAsset {
  id: string;
  name: string;
  category: string;
  defaultBlendMode: "screen" | "color-dodge" | "overlay" | "normal" | "soft-light";
  defaultMaskShape: "feathered" | "circle" | "rounded" | "rect";
  defaultWidth: number;
  defaultHeight: number;
  defaultOpacity: number;
  url: string;
}

// 1. Golden Volumetric Light Flare (Screen blend)
const LIGHT_FLARE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="15%" stop-color="#FFF0BA" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.5" />
      <stop offset="75%" stop-color="#D97706" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#sun)" />
  <g stroke="#FFFFFF" stroke-width="1.5" opacity="0.4">
    <line x1="0" y1="300" x2="600" y2="300" />
    <line x1="300" y1="0" x2="300" y2="600" />
    <line x1="100" y1="100" x2="500" y2="500" stroke-width="0.8" />
    <line x1="100" y1="500" x2="500" y2="100" stroke-width="0.8" />
  </g>
</svg>
`)}`;

// 2. Pentecost Fire & Sacred Ember (Color Dodge)
const PENTECOST_EMBER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="fire-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFED4A" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#FF5722" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#7C0000" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#fire-glow)" />
  <circle cx="280" cy="240" r="12" fill="#FFFFFF" opacity="0.8" filter="blur(2px)" />
  <circle cx="340" cy="270" r="8" fill="#FFC107" opacity="0.9" />
  <circle cx="220" cy="330" r="14" fill="#FF9800" opacity="0.7" />
  <circle cx="390" cy="340" r="10" fill="#FF5722" opacity="0.8" />
  <circle cx="310" cy="380" r="16" fill="#FFEB3B" opacity="0.6" />
  <circle cx="260" cy="180" r="6" fill="#FFFFFF" opacity="0.9" />
</svg>
`)}`;

// 3. Ethereal Cloud & Holy Spirit Mist (Screen blend)
const SACRED_MIST_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <defs>
    <radialGradient id="mist" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.5" />
      <stop offset="35%" stop-color="#C7D2FE" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#818CF8" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="700" height="700" fill="url(#mist)" />
</svg>
`)}`;

// 4. Sacred Cross Geometric Stamp (Overlay or Normal)
const SACRED_STAMP_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <g stroke="#D9A441" stroke-width="4" fill="none" opacity="0.85">
    <circle cx="250" cy="250" r="230" stroke-width="3" />
    <circle cx="250" cy="250" r="215" stroke-width="1.5" stroke-dasharray="8 6" />
    <line x1="250" y1="80" x2="250" y2="420" stroke-width="8" stroke-linecap="round" />
    <line x1="130" y1="180" x2="370" y2="180" stroke-width="8" stroke-linecap="round" />
    <circle cx="250" cy="180" r="16" fill="#D9A441" />
  </g>
</svg>
`)}`;

// 5. Holy Spirit Dove & Radial Halo Rays (Reference 1 - Koinonia Style)
const HOLY_DOVE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="dove-sun" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="25%" stop-color="#FEF08A" stop-opacity="0.8" />
      <stop offset="55%" stop-color="#EAB308" stop-opacity="0.4" />
      <stop offset="85%" stop-color="#CA8A04" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="dove-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  {/* Radial Halo Glow */}
  <rect width="600" height="600" fill="url(#dove-sun)" />
  {/* Sunburst Rays */}
  <g stroke="#FEF08A" stroke-width="1.5" opacity="0.6">
    <line x1="300" y1="270" x2="300" y2="50" />
    <line x1="300" y1="270" x2="480" y2="90" />
    <line x1="300" y1="270" x2="520" y2="200" />
    <line x1="300" y1="270" x2="520" y2="340" />
    <line x1="300" y1="270" x2="450" y2="450" />
    <line x1="300" y1="270" x2="150" y2="450" />
    <line x1="300" y1="270" x2="80" y2="340" />
    <line x1="300" y1="270" x2="80" y2="200" />
    <line x1="300" y1="270" x2="120" y2="90" />
  </g>
  {/* Concentric Divine Rings */}
  <circle cx="300" cy="270" r="140" fill="none" stroke="#FEF08A" stroke-width="1.2" opacity="0.4" stroke-dasharray="6 6" />
  <circle cx="300" cy="270" r="170" fill="none" stroke="#CA8A04" stroke-width="1" opacity="0.3" />
  {/* Descending Holy Spirit Dove */}
  <g filter="url(#dove-glow)" fill="#FFFFFF">
    {/* Dove Body & Head descending */}
    <path d="M 300,340 C 290,305 285,270 295,245 C 298,238 300,230 300,225 C 300,230 302,238 305,245 C 315,270 310,305 300,340 Z" />
    <circle cx="300" cy="222" r="9" />
    {/* Left Wing spreading upwards */}
    <path d="M 295,250 C 270,230 220,200 170,195 C 190,218 220,240 250,262 C 220,255 190,250 160,250 C 180,270 215,285 270,285 C 285,285 292,275 295,250 Z" />
    {/* Right Wing spreading upwards */}
    <path d="M 305,250 C 330,230 380,200 430,195 C 410,218 380,240 350,262 C 380,255 410,250 440,250 C 420,270 385,285 330,285 C 315,285 308,275 305,250 Z" />
    {/* Tail feathers descending */}
    <path d="M 296,335 L 285,380 L 297,370 L 300,385 L 303,370 L 315,380 L 304,335 Z" opacity="0.95" />
    {/* Olive Leaf in Beak */}
    <path d="M 300,216 Q 308,206 316,210 Q 308,216 300,216 Z" fill="#86EFAC" />
  </g>
</svg>
`)}`;

// 6. Volumetric Dual Corner Stage Spotlights (References 1 & 4)
const STAGE_SPOTLIGHT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="beam-left" x1="0%" y1="0%" x2="65%" y2="85%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="20%" stop-color="#FDE047" stop-opacity="0.65" />
      <stop offset="60%" stop-color="#EA580C" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="beam-right" x1="100%" y1="0%" x2="35%" y2="85%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="20%" stop-color="#FDE047" stop-opacity="0.65" />
      <stop offset="60%" stop-color="#EA580C" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <filter id="beam-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" />
    </filter>
  </defs>
  {/* Left Spotlight Beam */}
  <path d="M 0,-20 L 70,0 L 580,820 L 220,820 Z" fill="url(#beam-left)" filter="url(#beam-soft)" />
  {/* Right Spotlight Beam */}
  <path d="M 800,-20 L 730,0 L 220,820 L 580,820 Z" fill="url(#beam-right)" filter="url(#beam-soft)" />
  {/* Intense corner origin flares */}
  <circle cx="20" cy="10" r="30" fill="#FFFFFF" opacity="0.9" filter="url(#beam-soft)" />
  <circle cx="780" cy="10" r="30" fill="#FFFFFF" opacity="0.9" filter="url(#beam-soft)" />
  {/* Ambient Stage Floor Flare */}
  <ellipse cx="400" cy="720" rx="320" ry="80" fill="#FBBF24" opacity="0.18" filter="url(#beam-soft)" />
</svg>
`)}`;

// 7. Mountain of Encounter & Divine God Rays (References 3 & 6)
const MOUNTAIN_PEAK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
  <defs>
    <linearGradient id="sky-god-rays" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
      <stop offset="40%" stop-color="#BAE6FD" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="ridge-front" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.98" />
    </linearGradient>
    <linearGradient id="mist-base" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
      <stop offset="60%" stop-color="#E2E8F0" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.75" />
    </linearGradient>
  </defs>
  {/* Descending God Rays from Heaven */}
  <g fill="url(#sky-god-rays)" opacity="0.7">
    <polygon points="450,0 350,600 400,600" />
    <polygon points="450,0 470,600 520,600" />
    <polygon points="450,0 220,600 280,600" opacity="0.5" />
    <polygon points="450,0 590,600 660,600" opacity="0.5" />
    <polygon points="450,0 100,600 170,600" opacity="0.3" />
    <polygon points="450,0 720,600 800,600" opacity="0.3" />
  </g>
  {/* Background Mountain Ridge */}
  <path d="M 0,420 L 160,330 L 320,380 L 480,260 L 640,350 L 780,290 L 900,370 L 900,600 L 0,600 Z" fill="#334155" opacity="0.6" />
  {/* Foreground Sharp Mountain Peak of Encounter */}
  <path d="M 0,510 L 220,380 L 450,220 L 680,410 L 900,470 L 900,600 L 0,600 Z" fill="url(#ridge-front)" />
  {/* Golden Peak Highlight */}
  <polygon points="450,220 420,280 480,280" fill="#FBBF24" opacity="0.4" />
  {/* Valley Mist Wash */}
  <rect x="0" y="440" width="900" height="160" fill="url(#mist-base)" />
</svg>
`)}`;

// 8. Praying & Worship Hands with Heavenly Radiance (References 5 & 6)
const CELESTIAL_HANDS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="hands-glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="30%" stop-color="#A7F3D0" stop-opacity="0.5" />
      <stop offset="70%" stop-color="#047857" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#hands-glow)" />
  {/* Uplifted Praying Hands Silhouette */}
  <g fill="#FFFFFF" opacity="0.85">
    {/* Left Hand reaching up */}
    <path d="M 230,520 C 230,460 215,390 235,320 C 240,305 250,270 260,250 C 265,240 273,243 272,255 C 270,275 264,305 264,330 L 275,270 C 278,255 287,257 286,270 C 283,295 277,325 277,345 L 290,290 C 293,275 301,278 300,292 C 298,315 292,345 292,365 C 298,380 305,420 300,520 Z" />
    {/* Right Hand mirrored */}
    <path d="M 370,520 C 370,460 385,390 365,320 C 360,305 350,270 340,250 C 335,240 327,243 328,255 C 330,275 336,305 336,330 L 325,270 C 322,255 313,257 314,270 C 317,295 323,325 323,345 L 310,290 C 307,275 299,278 300,292 C 302,315 308,345 308,365 C 302,380 295,420 300,520 Z" />
  </g>
  {/* Light Flare in palm center */}
  <circle cx="300" cy="270" r="18" fill="#FFFFFF" opacity="0.9" />
  <circle cx="300" cy="270" r="42" fill="#34D399" opacity="0.4" />
</svg>
`)}`;

// 9. Golden Revival & Prophetic Seal Emblem (References 2 & 3)
const REVIVAL_SEAL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="seal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#A16207" />
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#seal-gold)" stroke-width="3">
    {/* Outer Sunburst Teethed Ring */}
    <circle cx="250" cy="250" r="235" stroke-dasharray="8 6" stroke-width="4" />
    <circle cx="250" cy="250" r="218" stroke-width="2" />
    <circle cx="250" cy="250" r="185" stroke-width="3" />
    {/* Inner Star / Cross of Glory */}
    <polygon points="250,95 264,195 350,150 295,236 395,250 295,264 350,350 264,305 250,405 236,305 150,350 205,264 105,250 205,236 150,150 236,195" fill="url(#seal-gold)" fill-opacity="0.18" stroke="url(#seal-gold)" stroke-width="2" />
    {/* Core Sacred Cross */}
    <line x1="250" y1="180" x2="250" y2="320" stroke-width="6" stroke-linecap="round" />
    <line x1="190" y1="230" x2="310" y2="230" stroke-width="6" stroke-linecap="round" />
    <circle cx="250" cy="250" r="14" fill="url(#seal-gold)" />
  </g>
</svg>
`)}`;

export const CURATED_ASSETS: CuratedAsset[] = [
  {
    id: "asset-light-flare",
    name: "Sunburst Light Flare",
    category: "Lighting",
    defaultBlendMode: "screen",
    defaultMaskShape: "feathered",
    defaultWidth: 640,
    defaultHeight: 640,
    defaultOpacity: 0.85,
    url: LIGHT_FLARE_SVG,
  },
  {
    id: "asset-holy-dove",
    name: "Holy Spirit Dove & Rays",
    category: "Spiritual",
    defaultBlendMode: "screen",
    defaultMaskShape: "feathered",
    defaultWidth: 540,
    defaultHeight: 540,
    defaultOpacity: 0.9,
    url: HOLY_DOVE_SVG,
  },
  {
    id: "asset-stage-spotlight",
    name: "Dual Stage Spotlights",
    category: "Lighting",
    defaultBlendMode: "screen",
    defaultMaskShape: "rect",
    defaultWidth: 800,
    defaultHeight: 800,
    defaultOpacity: 0.85,
    url: STAGE_SPOTLIGHT_SVG,
  },
  {
    id: "asset-mountain-peak",
    name: "Mountain of Encounter",
    category: "Atmosphere",
    defaultBlendMode: "screen",
    defaultMaskShape: "feathered",
    defaultWidth: 850,
    defaultHeight: 560,
    defaultOpacity: 0.8,
    url: MOUNTAIN_PEAK_SVG,
  },
  {
    id: "asset-celestial-hands",
    name: "Worship & Praying Hands",
    category: "Spiritual",
    defaultBlendMode: "screen",
    defaultMaskShape: "feathered",
    defaultWidth: 580,
    defaultHeight: 580,
    defaultOpacity: 0.85,
    url: CELESTIAL_HANDS_SVG,
  },
  {
    id: "asset-pentecost-fire",
    name: "Pentecost Fire & Embers",
    category: "Spiritual",
    defaultBlendMode: "color-dodge",
    defaultMaskShape: "feathered",
    defaultWidth: 550,
    defaultHeight: 550,
    defaultOpacity: 0.9,
    url: PENTECOST_EMBER_SVG,
  },
  {
    id: "asset-sacred-mist",
    name: "Ethereal Glory Mist",
    category: "Atmosphere",
    defaultBlendMode: "screen",
    defaultMaskShape: "feathered",
    defaultWidth: 700,
    defaultHeight: 700,
    defaultOpacity: 0.75,
    url: SACRED_MIST_SVG,
  },
  {
    id: "asset-revival-seal",
    name: "Golden Revival Seal",
    category: "Symbols",
    defaultBlendMode: "overlay",
    defaultMaskShape: "rect",
    defaultWidth: 380,
    defaultHeight: 380,
    defaultOpacity: 0.85,
    url: REVIVAL_SEAL_SVG,
  },
  {
    id: "asset-church-stamp",
    name: "Sacred Cross Stamp",
    category: "Symbols",
    defaultBlendMode: "overlay",
    defaultMaskShape: "rect",
    defaultWidth: 420,
    defaultHeight: 420,
    defaultOpacity: 0.8,
    url: SACRED_STAMP_SVG,
  },
];

