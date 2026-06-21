/* Fleetsurf — ecosystem "connect everything" slide.
   SVG layer: routed lines, data pulses, glowing hub, goggled mascot.
   HTML layer: node chips with locally served optimized logo assets. */
(function () {
  // Windsurf removed (too close to "fleetsurf"); added Grok, Higgsfield, OpenCode, Custom adapters.
  const NODES = [
    { name: 'Claude Code', id: 'eco-claude',  logo: 'assets/logos/claude-code.svg',    c: '#d97757' },
    { name: 'Codex',       id: 'eco-codex',   logo: 'assets/logos/codex-openai.svg',   c: '#eaf6f6' },
    { name: 'Cursor',      id: 'eco-cursor',  logo: 'assets/logos/cursor.svg',         c: '#eaf6f6' },
    { name: 'Copilot',     id: 'eco-copilot', logo: 'assets/logos/github-copilot.svg', c: '#ffd166' },
    { name: 'Gemini',      id: 'eco-gemini',  logo: 'assets/logos/google-gemini.svg',  c: '#8e75b2' },
    { name: 'Grok',        id: 'eco-grok',    logo: 'assets/logos/grok.svg',           c: '#bdfcfc', darkTile: true },
    { name: 'Higgsfield',  id: 'eco-higgs',   logo: 'assets/logos/higgsfield.webp',    c: '#ff7a59', image: true },
    { name: 'OpenCode',    id: 'eco-opencode',logo: 'assets/logos/opencode.svg',       c: '#19c2c2' },
    { name: 'Aider',       id: 'eco-aider',   logo: 'assets/logos/aider.svg',          c: '#14b014', wide: true, darkTile: true },
    { name: 'Custom adapters', id: null,      c: '#8aa6bc', custom: true },
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
      const logoClasses = [
        'logo-tile',
        n.darkTile ? 'logo-tile-dark' : '',
        n.wide ? 'logo-tile-wide' : '',
        n.image ? 'logo-tile-image' : '',
      ].filter(Boolean).join(' ');
      const slot = n.custom
        ? `<div class="ph">+</div>`
        : `<span class="${logoClasses}"><img src="${n.logo}" alt="${n.name} logo" loading="lazy" decoding="async"></span>`;
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
