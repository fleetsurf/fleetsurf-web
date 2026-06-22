// Regenerates the full Fleetsurf favicon / app-icon set from ONE master:
// the "Surfy" bird-head mark. Run: `cd tools && npm install && npm run icons`.
//
// Outputs into ../public:
//   favicon.svg                 rounded-tile master (scalable, modern browsers)
//   favicon-16/32/48.png        tab favicons
//   favicon.ico                 16+32+48 packed
//   apple-touch-icon.png        180, full-bleed (iOS rounds it)
//   android-chrome-192/512.png  full-bleed
//   maskable-icon-512.png       full-bleed, logo inside the adaptive safe zone
//   mstile-150x150.png          full-bleed (Windows tile colour set separately)
//   safari-pinned-tab.svg       single-colour silhouette (Safari tints it)
//
// One mark, every size — no more drift between SVG and PNG.

import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PUB = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const C = {
  teal: '#19c2c2',
  coral: '#ff7a59',
  eye: '#0a1628',
  foam: '#bdfcfc',
  white: '#ffffff',
};

const BG = `<defs><linearGradient id="bg" x1="8" y1="5" x2="56" y2="60" gradientUnits="userSpaceOnUse">
  <stop stop-color="#102744"/><stop offset=".56" stop-color="#0a1628"/><stop offset="1" stop-color="#05080f"/>
</linearGradient></defs>`;

// The Surfy head, authored in a 0..64 box. Faces right; coral crest + beak,
// teal head, white eye. `mono` → flat single-colour silhouette (no eye), for the
// Safari pinned-tab mask.
function head(mono) {
  if (mono) {
    return `<g fill="${mono}" stroke="${mono}" stroke-linecap="round">
      <line x1="30" y1="15" x2="30" y2="6" stroke-width="3.6"/>
      <line x1="36.5" y1="16" x2="42" y2="7.5" stroke-width="3.6"/>
      <line x1="23.5" y1="16" x2="18" y2="7.5" stroke-width="3.6"/>
      <circle cx="30" cy="33" r="19" stroke="none"/>
      <path d="M46 30 L60 34 L46 39 Z" stroke="none"/>
    </g>`;
  }
  return `<g>
    <line x1="30" y1="15" x2="30" y2="6" stroke="${C.coral}" stroke-width="3.6" stroke-linecap="round"/>
    <line x1="36.5" y1="16" x2="42" y2="7.5" stroke="${C.coral}" stroke-width="3.6" stroke-linecap="round"/>
    <line x1="23.5" y1="16" x2="18" y2="7.5" stroke="${C.coral}" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="30" cy="33" r="19" fill="${C.teal}"/>
    <path d="M16 28 a17 17 0 0 1 12 -9" fill="none" stroke="${C.foam}" stroke-width="2.4" stroke-linecap="round" opacity=".4"/>
    <path d="M46 30 L60 34 L46 39 Z" fill="${C.coral}"/>
    <circle cx="35" cy="29" r="6.2" fill="${C.white}"/>
    <circle cx="37" cy="30" r="3.4" fill="${C.eye}"/>
    <circle cx="38.4" cy="28.4" r="1.2" fill="${C.white}"/>
  </g>`;
}

const tileSVG = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Fleetsurf">
<title>Fleetsurf</title>
${BG}
<rect width="64" height="64" rx="14" fill="url(#bg)"/>
${head()}
</svg>`;

const fullSVG = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
${BG}
<rect width="64" height="64" fill="url(#bg)"/>
${head()}
</svg>`;

// Maskable: full-bleed, logo scaled into the central safe zone (Android crops to
// a platform shape; keep the mark inside the inner ~80%).
const maskableSVG = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
${BG}
<rect width="64" height="64" fill="url(#bg)"/>
<g transform="translate(32 34) scale(0.72) translate(-31 -33)">${head()}</g>
</svg>`;

// Safari pinned tab: monochrome silhouette on transparent; Safari recolours it
// via the link's color attribute.
const monoSVG = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
${head('#000000')}
</svg>`;

const png = (svg, size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

async function main() {
  const tile = tileSVG();
  const full = fullSVG();

  // scalable masters
  writeFileSync(join(PUB, 'favicon.svg'), tileSVG());
  writeFileSync(join(PUB, 'safari-pinned-tab.svg'), monoSVG());

  // tab favicons (rounded tile)
  for (const s of [16, 32, 48]) writeFileSync(join(PUB, `favicon-${s}.png`), png(tile, s));

  // app icons (full-bleed)
  writeFileSync(join(PUB, 'apple-touch-icon.png'), png(full, 180));
  writeFileSync(join(PUB, 'android-chrome-192x192.png'), png(full, 192));
  writeFileSync(join(PUB, 'android-chrome-512x512.png'), png(full, 512));
  writeFileSync(join(PUB, 'mstile-150x150.png'), png(full, 150));
  writeFileSync(join(PUB, 'maskable-icon-512x512.png'), png(maskableSVG(), 512));

  // packed .ico (16 + 32 + 48)
  const ico = await pngToIco([png(tile, 16), png(tile, 32), png(tile, 48)]);
  writeFileSync(join(PUB, 'favicon.ico'), ico);

  console.log('✓ Regenerated favicon/app-icon set in public/ from the Surfy-head master.');
}

main().catch((e) => { console.error(e); process.exit(1); });
