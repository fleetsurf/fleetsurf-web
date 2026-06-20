/* Fleetsurf website — scroll reveal + sticky nav. Vanilla. */
(function () {
  // sticky nav state
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // scroll reveal
  function run() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
