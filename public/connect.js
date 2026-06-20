/* Fleetsurf — ecosystem "connect everything" slide.
   SVG layer: routed lines, data pulses, glowing hub, goggled mascot.
   HTML layer: node chips, each with a drop-in <image-slot> for the REAL logo
   (original monogram shown until the user drops the official mark). */
(function () {
  // original monogram placeholder (NOT a brand logo) shown until a real logo is dropped in
  function mono(letters, color) {
    const fs = letters.length > 1 ? 22 : 30;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='54' height='54' viewBox='0 0 54 54'>`
      + `<text x='27' y='28' dy='.34em' text-anchor='middle' font-family='Space Grotesk, sans-serif' font-weight='700' font-size='${fs}' fill='${color}'>${letters}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Windsurf removed (too close to "fleetsurf"); added Grok, Higgsfield, OpenCode, Custom adapters.
  const NODES = [
    { name: 'Claude Code', id: 'eco-claude',  m: 'CC', c: '#ff7a59' },
    { name: 'Codex',       id: 'eco-codex',   m: 'Cx', c: '#bdfcfc' },
    { name: 'Cursor',      id: 'eco-cursor',  m: 'Cu', c: '#eaf6f6' },
    { name: 'Copilot',     id: 'eco-copilot', m: 'Co', c: '#ffd166' },
    { name: 'Gemini',      id: 'eco-gemini',  m: 'G',  c: '#a78bfa' },
    { name: 'Grok',        id: 'eco-grok',    m: 'Gr', c: '#bdfcfc' },
    { name: 'Higgsfield',  id: 'eco-higgs',   m: 'H',  c: '#ff7a59' },
    { name: 'OpenCode',    id: 'eco-opencode',m: 'OC', c: '#19c2c2' },
    { name: 'Aider',       id: 'eco-aider',   m: 'Ai', c: '#ffd166' },
    { name: 'Custom adapters', id: null,      m: '+',  c: '#8aa6bc', custom: true },
  ];

  function build() {
    const host = document.getElementById('connect');
    if (!host || host.getAttribute('data-built')) return;

    const W = 1840, H = 780, cx = W / 2, cy = H / 2;
    const rx = 720, ry = 300;
    let lines = '', pulses = '', chips = '';

    NODES.forEach((n, i) => {
      const a = (-90 + i * (360 / NODES.length)) * Math.PI / 180;
      const x = cx + rx * Math.cos(a);
      const y = cy + ry * Math.sin(a);
      const mx = cx + (x - cx) * 0.5, my = cy + (y - cy) * 0.5 - (y < cy ? 22 : -22);
      const d = `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${cx} ${cy}`;
      lines += `<path d="${d}" fill="none" stroke="${n.c}" stroke-width="2" opacity="0.2"/>`;
      lines += `<path class="fs-dash" d="${d}" fill="none" stroke="${n.c}" stroke-width="2.5" opacity="0.7" style="animation:fs-flow ${(1.1 + i * 0.07).toFixed(2)}s linear infinite ${(i % 2 ? '' : 'reverse')}"/>`;
      const dur = (2.6 + (i % 5) * 0.4).toFixed(2);
      const dir = i % 2 ? d : `M${cx} ${cy} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      pulses += `<circle r="4.5" fill="${n.c}" opacity="0"><animateMotion dur="${dur}s" repeatCount="indefinite" begin="${(i * 0.25).toFixed(2)}s" path="${dir}"/><animate attributeName="opacity" values="0;1;1;0" dur="${dur}s" repeatCount="indefinite" begin="${(i * 0.25).toFixed(2)}s"/></circle>`;

      const left = (x / W * 100).toFixed(2), top = (y / H * 100).toFixed(2);
      const slot = n.custom
        ? `<div class="ph">+</div>`
        : `<image-slot id="${n.id}" shape="rounded" radius="12" fit="contain" src="${mono(n.m, n.c)}" placeholder="logo"></image-slot>`;
      chips += `<div class="eco-chip${n.custom ? ' custom' : ''}" style="left:${left}%;top:${top}%;border-color:${n.custom ? '' : n.c}">
          ${slot}<span class="nm">${n.name}</span>
        </div>`;
    });

    const hub = `
      <circle cx="${cx}" cy="${cy}" r="120" fill="url(#hubGlow)"/>
      <circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#19c2c2" stroke-width="1.5" opacity="0.5"/>
      <circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#19c2c2" stroke-width="2">
        <animate attributeName="r" values="92;152" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0" dur="3s" repeatCount="indefinite"/>
      </circle>`;

    let m = window.fleetMascot({ size: 200, wave: false, acc: 'goggles' });
    m = m.replace('<svg class="fs-mascot"', `<svg class="fs-mascot bob" x="${cx - 100}" y="${cy - 108}"`);

    host.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;z-index:1">
        <defs><radialGradient id="hubGlow"><stop offset="0" stop-color="#19c2c2" stop-opacity="0.5"/><stop offset="1" stop-color="#19c2c2" stop-opacity="0"/></radialGradient></defs>
        ${lines}${hub}${pulses}${m}
      </svg>
      ${chips}`;
    host.setAttribute('data-built', '1');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
  document.addEventListener('slidechange', build);
})();
