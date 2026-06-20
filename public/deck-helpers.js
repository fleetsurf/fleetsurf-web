/* Fleetsurf deck helpers — vanilla. Depends on mascot.js (window.fleetMascot). */
(function () {
  function fill() {
    // mascot slots: <div class="mascot-slot" data-opts='{"size":300}'></div>
    document.querySelectorAll('.mascot-slot:not([data-filled])').forEach(function (el) {
      var opts = {};
      try { opts = JSON.parse(el.getAttribute('data-opts') || '{}'); } catch (e) {}
      el.innerHTML = window.fleetMascot(opts);
      el.setAttribute('data-filled', '1');
    });

    // wave bands: <div class="waveband" data-h="280" data-colors="#0f8f8f,#12a3a3,#19c2c2"></div>
    document.querySelectorAll('.waveband:not([data-filled])').forEach(function (el) {
      var h = +el.getAttribute('data-h') || 240;
      var cols = (el.getAttribute('data-colors') || '#0f8f8f,#12a3a3,#19c2c2').split(',');
      var foam = el.getAttribute('data-foam') || '#bdfcfc';
      el.style.height = h + 'px';
      el.innerHTML =
        '<svg viewBox="0 0 1920 ' + h + '" preserveAspectRatio="none" style="width:100%;height:100%;display:block">' +
          '<path class="swell" d="M0 ' + (h*0.36) + ' q240 -' + (h*0.26) + ' 480 -' + (h*0.05) + ' q240 ' + (h*0.2) + ' 480 -' + (h*0.03) + ' q240 -' + (h*0.24) + ' 480 -' + (h*0.02) + ' q180 ' + (h*0.16) + ' 480 -' + (h*0.08) + ' L1920 ' + h + ' L0 ' + h + ' Z" fill="' + cols[0] + '" opacity="0.5"/>' +
          '<path class="swell s2" d="M0 ' + (h*0.54) + ' q240 -' + (h*0.2) + ' 480 -' + (h*0.03) + ' q255 ' + (h*0.18) + ' 480 -' + (h*0.02) + ' q240 -' + (h*0.2) + ' 480 -' + (h*0.01) + ' q210 ' + (h*0.15) + ' 480 -' + (h*0.06) + ' L1920 ' + h + ' L0 ' + h + ' Z" fill="' + cols[1] + '" opacity="0.6"/>' +
          '<path d="M0 ' + (h*0.72) + ' q240 -' + (h*0.17) + ' 480 -' + (h*0.02) + ' q255 ' + (h*0.15) + ' 480 -' + (h*0.01) + ' q240 -' + (h*0.16) + ' 480 0 q225 ' + (h*0.13) + ' 480 -' + (h*0.05) + ' L1920 ' + h + ' L0 ' + h + ' Z" fill="' + cols[2] + '"/>' +
          '<path d="M0 ' + (h*0.72) + ' q240 -' + (h*0.17) + ' 480 -' + (h*0.02) + ' q255 ' + (h*0.15) + ' 480 -' + (h*0.01) + ' q240 -' + (h*0.16) + ' 480 0 q225 ' + (h*0.13) + ' 480 -' + (h*0.05) + '" fill="none" stroke="' + foam + '" stroke-width="2.5" opacity="0.4"/>' +
        '</svg>';
      el.setAttribute('data-filled', '1');
    });

    // flocks: <div class="flock" data-count="9"></div>
    document.querySelectorAll('.flock:not([data-filled])').forEach(function (el) {
      var n = +el.getAttribute('data-count') || 7;
      var color = el.getAttribute('data-color') || '#bdfcfc';
      var op = el.getAttribute('data-op') || '0.5';
      var birds = '';
      for (var i = 0; i < n; i++) {
        var x = (i * 137) % 560 + 20;
        var y = 10 + ((i * 53) % 60);
        var s = 0.6 + ((i * 7) % 5) / 10;
        birds += '<path d="M' + x + ' ' + y + ' q' + (8*s) + ' ' + (-7*s) + ' ' + (16*s) + ' 0 q' + (8*s) + ' ' + (-7*s) + ' ' + (16*s) + ' 0" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" opacity="' + op + '"/>';
      }
      el.innerHTML = '<svg viewBox="0 0 600 90" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">' + birds + '</svg>';
      el.setAttribute('data-filled', '1');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
  else fill();
  // re-run after deck-stage clones thumbnails / late nav
  document.addEventListener('slidechange', fill);
  window.fleetFill = fill;
})();
