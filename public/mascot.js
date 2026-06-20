// Fleetsurf geometric mascot — a bird on a surfboard, built from simple primitives.
// Returns an SVG string so it works in plain HTML and React (via innerHTML).
// opts: { size, board, body, belly, beak, wave(false to hide), eye, id,
//         acc: 'goggles'|'heli'|'jetpack'|'telescope'|'flag'|'antenna'|'headset'|'scuba',
//         flag (color), noBoard(bool) }
window.fleetMascot = function (opts) {
  opts = opts || {};
  const size = opts.size || 220;
  const board = opts.board || '#ffd166';
  const boardDark = opts.boardDark || '#f4b73e';
  const body = opts.body || '#19c2c2';
  const bodyDark = opts.bodyDark || '#12a3a3';
  const belly = opts.belly || '#bdfcfc';
  const beak = opts.beak || '#ff7a59';
  const wave = opts.wave || '#0f7d8c';
  const eye = opts.eye || '#0a1628';
  const metal = opts.metal || '#9fb3c4';
  const metalDark = opts.metalDark || '#5d7286';
  const teal = '#19c2c2';
  const gold = '#ffd166';
  const coral = '#ff7a59';
  const glass = 'rgba(189,252,252,.55)';
  const id = opts.id || ('m' + Math.random().toString(36).slice(2, 8));
  const showWave = opts.wave !== false;
  const showBoard = opts.noBoard !== true;
  const acc = opts.acc || '';

  // ---- accessory layers ----
  let back = '', top = '', front = '';

  if (acc === 'jetpack') {
    back = `
      <rect x="58" y="92" width="24" height="50" rx="10" fill="${metal}" stroke="${metalDark}" stroke-width="2.5"/>
      <rect x="63" y="98" width="14" height="22" rx="5" fill="${beak}"/>
      <g class="fs-flame" style="transform-box:fill-box;transform-origin:center top">
        <path d="M62 142 q8 20 16 0 q4 18 -8 30 q-12 -10 -8 -30 z" fill="${gold}"/>
        <path d="M66 142 q4 12 8 0 q2 10 -4 16 q-6 -6 -4 -16 z" fill="${coral}"/>
      </g>`;
    front = `<path d="M96 100 q22 6 30 30" fill="none" stroke="${metal}" stroke-width="5" opacity="0.9"/>`;
  } else if (acc === 'heli') {
    back = `<rect x="60" y="96" width="22" height="42" rx="9" fill="${metal}" stroke="${metalDark}" stroke-width="2.5"/>`;
    top = `
      <line x1="120" y1="42" x2="120" y2="18" stroke="${metalDark}" stroke-width="5"/>
      <ellipse class="fs-rotor" cx="120" cy="15" rx="46" ry="5" fill="${metal}" style="transform-box:fill-box;transform-origin:center"/>
      <circle cx="120" cy="15" r="6" fill="${beak}"/>`;
    front = `<path d="M98 102 q24 8 30 32" fill="none" stroke="${metal}" stroke-width="5"/>`;
  } else if (acc === 'goggles') {
    front = `
      <path d="M94 50 q26 -12 52 0" fill="none" stroke="${beak}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="108" cy="54" r="13" fill="${glass}" stroke="${metalDark}" stroke-width="4"/>
      <circle cx="135" cy="54" r="13" fill="${glass}" stroke="${metalDark}" stroke-width="4"/>
      <line x1="121" y1="55" x2="122" y2="55" stroke="${metalDark}" stroke-width="6"/>
      <ellipse cx="103" cy="49" rx="4" ry="5" fill="#fff" opacity=".8"/>
      <ellipse cx="130" cy="49" rx="4" ry="5" fill="#fff" opacity=".8"/>`;
  } else if (acc === 'telescope') {
    front = `
      <g transform="rotate(-20 150 58)">
        <rect x="148" y="50" width="44" height="16" rx="5" fill="${metal}" stroke="${metalDark}" stroke-width="2"/>
        <rect x="186" y="46" width="11" height="24" rx="3" fill="${beak}"/>
        <circle cx="150" cy="58" r="9" fill="#16263a"/>
      </g>`;
  } else if (acc === 'flag') {
    const fc = opts.flag || coral;
    top = `
      <line x1="172" y1="34" x2="172" y2="128" stroke="${metalDark}" stroke-width="4"/>
      <path class="fs-wave-flag" style="transform-box:fill-box;transform-origin:left center" d="M172 38 q18 6 36 0 q-6 9 0 18 q-18 6 -36 0 z" fill="${fc}"/>`;
    front = `<path d="M140 120 q24 6 32 -2" fill="none" stroke="${bodyDark}" stroke-width="6" stroke-linecap="round"/>`;
  } else if (acc === 'antenna') {
    top = `
      <line x1="118" y1="42" x2="110" y2="20" stroke="${metalDark}" stroke-width="4"/>
      <circle cx="108" cy="16" r="6" fill="${beak}"/>
      <g class="fs-signal" fill="none" stroke="${teal}" stroke-width="3" stroke-linecap="round">
        <path d="M118 12 q9 -7 17 0"/>
        <path d="M114 6 q14 -11 26 0"/>
      </g>`;
  } else if (acc === 'headset') {
    front = `
      <path d="M92 54 q28 -30 56 0" fill="none" stroke="${metalDark}" stroke-width="6"/>
      <rect x="86" y="56" width="13" height="22" rx="6" fill="${beak}"/>
      <path d="M99 76 q26 16 40 4" fill="none" stroke="${metalDark}" stroke-width="4"/>
      <circle cx="141" cy="82" r="5" fill="${coral}"/>`;
  } else if (acc === 'scuba') {
    front = `
      <rect x="98" y="52" width="44" height="26" rx="11" fill="${glass}" stroke="${metalDark}" stroke-width="3"/>
      <path d="M140 58 q16 -2 16 16 l0 26" fill="none" stroke="${beak}" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="110" cy="60" rx="4" ry="5" fill="#fff" opacity=".7"/>`;
  }

  return `
<svg class="fs-mascot" style="overflow:visible" viewBox="0 0 240 240" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fleetsurf bird mascot">
  <defs>
    <clipPath id="${id}-board"><ellipse cx="120" cy="178" rx="92" ry="20"/></clipPath>
  </defs>
  ${showWave ? `<path d="M2 206 q34 6 64 -6 q40 -16 78 -8 q34 7 52 -10 q14 -13 -2 -22 q-16 -9 -30 4 q12 -2 16 8 q4 12 -16 14 q-30 3 -64 -6 q-44 -12 -78 6 q-30 15 -60 8 z" fill="${wave}"/>
  <path d="M150 168 q22 -16 38 -4" fill="none" stroke="${belly}" stroke-width="3.5" stroke-linecap="round" opacity="0.75"/>
  <path d="M14 200 q40 -14 80 -4" fill="none" stroke="${belly}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>` : ''}
  <g class="fs-mascot-rider">
    ${back}
    ${showBoard ? `<g transform="rotate(-9 120 178)">
      <ellipse cx="120" cy="178" rx="92" ry="20" fill="${board}"/>
      <ellipse cx="120" cy="172" rx="92" ry="14" fill="${boardDark}" clip-path="url(#${id}-board)" opacity="0.55"/>
      <line x1="44" y1="178" x2="196" y2="178" stroke="${boardDark}" stroke-width="3" opacity="0.7"/>
    </g>` : ''}
    <line x1="104" y1="150" x2="100" y2="168" stroke="${beak}" stroke-width="6" stroke-linecap="round"/>
    <line x1="132" y1="150" x2="138" y2="168" stroke="${beak}" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="118" cy="112" rx="46" ry="50" fill="${body}"/>
    <ellipse cx="126" cy="124" rx="30" ry="34" fill="${belly}" opacity="0.95"/>
    <path d="M84 104 q-22 16 -8 40 q18 -6 26 -26 z" fill="${bodyDark}"/>
    <circle cx="120" cy="74" r="34" fill="${body}"/>
    <line x1="120" y1="44" x2="120" y2="26" stroke="${beak}" stroke-width="5" stroke-linecap="round"/>
    <line x1="132" y1="46" x2="142" y2="32" stroke="${beak}" stroke-width="5" stroke-linecap="round"/>
    <line x1="108" y1="46" x2="98" y2="32" stroke="${beak}" stroke-width="5" stroke-linecap="round"/>
    ${top}
    <path d="M150 74 l26 8 l-24 12 z" fill="${beak}"/>
    <circle cx="132" cy="68" r="9" fill="#ffffff"/>
    <circle cx="135" cy="69" r="5" fill="${eye}"/>
    <circle cx="137" cy="67" r="1.6" fill="#ffffff"/>
    ${front}
  </g>
</svg>`;
};
