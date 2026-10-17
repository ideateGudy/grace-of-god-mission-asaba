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
