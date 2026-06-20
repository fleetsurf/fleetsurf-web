/* Fleetsurf — ocean engine.
   Builds layered, horizontally-drifting, bobbing waves inside any <div class="ocean">.
   Structure per layer (so idle motion + scroll parallax never fight for `transform`):
     .wv-layer  ← JS scroll parallax  (translateY)
       .wv-bob  ← CSS idle bob        (translateY)
         .wv-drift ← CSS idle drift   (translateX, seamless loop)
           <svg> two identical periods, preserveAspectRatio=none
   Seamless loop: svg viewBox width 1920 holds an EVEN number of periods, so its two
   halves are identical; drifting by translateX(-50%) shifts exactly one half → no seam. */
(function () {
  var VBW = 1920;

  // smooth periodic wave path across the full viewBox, closed to the floor
  function wavePath(h, wavelength, amp, baseFrac, phase) {
    var base = baseFrac * h;
    function y(x) { return base + Math.sin((x / wavelength) * Math.PI * 2 + phase) * amp; }
    var step = wavelength / 14;
    var pts = [];
    for (var x = 0; x <= VBW + 0.001; x += step) pts.push([x, y(x)]);
    var d = 'M0 ' + y(0).toFixed(1) + ' L' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var xc = (pts[i][0] + pts[i + 1][0]) / 2, yc = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ' Q' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1) + ' ' + xc.toFixed(1) + ' ' + yc.toFixed(1);
    }
    var last = pts[pts.length - 1];
    d += ' T' + last[0].toFixed(1) + ' ' + last[1].toFixed(1);
    d += ' L' + VBW + ' ' + (h + 60) + ' L0 ' + (h + 60) + ' Z';
    return d;
  }

  // wavelengths that divide 960 (= half the viewBox) → guarantees identical halves
  var WAVELENGTHS = [960, 480, 320, 240, 192];

  function build(el) {
    var h = +el.getAttribute('data-h') || 260;
    var cols = (el.getAttribute('data-colors') || '#0b5566,#0f8f8f,#19c2c2').split(',');
    var foam = el.getAttribute('data-foam') || '#bdfcfc';
    var n = cols.length;
    el.style.height = h + 'px';

    var html = '';
    // solid floor so scroll-parallax can never open a gap below the waves
    html += '<div class="wv-floor" style="background:' + cols[n - 1] + '"></div>';

    for (var i = 0; i < n; i++) {
      var baseFrac = 0.30 + (0.46 * i) / Math.max(1, n - 1);     // back high → front low
      var amp = (0.05 + 0.035 * i) * h;
      var wl = WAVELENGTHS[Math.min(i, WAVELENGTHS.length - 1)];
      var op = Math.min(1, 0.46 + 0.16 * i);
      var driftDur = 48 - 7.5 * i;                                // back slow → front fast
      var rev = i % 2 === 1;
      var bobDur = 5.5 + (i % 3) * 1.1;
      var bobDelay = -(i * 1.3);
      var depth = (n - i);                                        // back layers travel most
      var phase = i * 1.7;

      var d = wavePath(h, wl, amp, baseFrac, phase);
      var foamPath = '';
      if (i === n - 1) {
        // crest line on the front wave (open stroke, no fill close)
        var base = baseFrac * h;
        var crest = 'M0 ' + (base).toFixed(1);
        var step = wl / 14, prev = [0, base];
        for (var x = step; x <= VBW + 0.001; x += step) {
          var yy = base + Math.sin((x / wl) * Math.PI * 2 + phase) * amp;
          var xc = (prev[0] + x) / 2, yc = (prev[1] + yy) / 2;
          crest += ' Q' + prev[0].toFixed(1) + ' ' + prev[1].toFixed(1) + ' ' + xc.toFixed(1) + ' ' + yc.toFixed(1);
          prev = [x, yy];
        }
        foamPath = '<path d="' + crest + '" fill="none" stroke="' + foam + '" stroke-width="3" opacity="0.45"/>';
      }

      html +=
        '<div class="wv-layer" data-depth="' + depth + '" style="z-index:' + (i + 1) + '">' +
          '<div class="wv-bob" style="animation-duration:' + bobDur.toFixed(1) + 's;animation-delay:' + bobDelay.toFixed(1) + 's">' +
            '<div class="wv-drift" style="animation-duration:' + driftDur.toFixed(1) + 's;animation-direction:' + (rev ? 'reverse' : 'normal') + '">' +
              '<svg viewBox="0 0 ' + VBW + ' ' + (h + 60) + '" preserveAspectRatio="none">' +
                '<path d="' + d + '" fill="' + cols[i] + '" opacity="' + op.toFixed(2) + '"/>' +
                foamPath +
              '</svg>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    el.innerHTML = html;
    el.setAttribute('data-ocean', '1');
  }

  function fill() {
    document.querySelectorAll('.ocean:not([data-ocean])').forEach(build);
    if (window.fleetParallax) window.fleetParallax.refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
  else fill();
  window.fleetOcean = fill;
})();
