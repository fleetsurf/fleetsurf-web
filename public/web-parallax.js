/* Fleetsurf website v2 — scroll parallax engine. Vanilla, rAF-throttled.
   Drives: atmosphere pools, figure glows, and ocean wave layers (each layer
   parallaxes at a depth-scaled rate, so wave spacing separates as you scroll). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight;
  var nav = document.querySelector('.nav');
  var ticking = false;

  var pEls = [];     // generic [data-parallax] elements (pools, glows)
  var oceans = [];   // { el, layers:[{el, depth}] }

  function collect() {
    pEls = [].slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
      return { el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 60, base: baseTransform(el) };
    });
    oceans = [].slice.call(document.querySelectorAll('.ocean[data-ocean]')).map(function (el) {
      var layers = [].slice.call(el.querySelectorAll('.wv-layer')).map(function (l) {
        return { el: l, depth: parseFloat(l.getAttribute('data-depth')) || 1 };
      });
      return { el: el, layers: layers };
    });
  }

  function baseTransform(el) {
    // preserve a centering transform like translateX(-50%) authored inline
    var t = el.style.transform || '';
    return t.replace(/translateY\([^)]*\)/g, '').trim();
  }

  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    document.body.classList.toggle('scrolled-past', y > vh * 0.5);
    if (reduce) return;

    for (var i = 0; i < pEls.length; i++) {
      var p = pEls[i];
      var r = p.el.getBoundingClientRect();
      var f = (r.top + r.height / 2 - vh / 2) / vh;
      p.el.style.transform = (p.base + ' translateY(' + (-f * p.speed).toFixed(1) + 'px)').trim();
    }

    for (var o = 0; o < oceans.length; o++) {
      var oc = oceans[o];
      var br = oc.el.getBoundingClientRect();
      if (br.bottom < -260 || br.top > vh + 260) continue;
      // progress: 1 when band first enters from below → 0 as it exits top
      var prog = (vh - br.top) / (vh + br.height);
      prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;
      var s = (prog - 0.5);                       // -0.5 .. 0.5
      for (var k = 0; k < oc.layers.length; k++) {
        var L = oc.layers[k];
        // back layers (high depth) ride further → the layers fan apart as you scroll
        var dy = s * L.depth * 22;
        L.el.style.transform = 'translateY(' + dy.toFixed(1) + 'px)';
      }
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function init() {
    collect();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { vh = window.innerHeight; collect(); frame(); }, { passive: true });
    frame();
  }

  window.fleetParallax = { refresh: function () { collect(); frame(); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
