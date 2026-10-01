/* ms-loopar.js — Matstrumpors UGC-loopar (matstrumpor/ugc-loopar). En loop laddas och spelas
   först när den syns, pausas när den lämnar skärmen, och spelas aldrig för den som stängt av
   rörelse (då står bildrutan kvar). Laddas av flera sektioner: körs bara en gång. */
(function () {
  if (window.msLoopar) return;
  window.msLoopar = true;
  var stilla = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function spela(v) {
    if (!v.getAttribute('src') && v.dataset.src) v.setAttribute('src', v.dataset.src);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function start() {
    if (stilla) return;
    var vs = document.querySelectorAll('video.ms-loop__v');
    if (!('IntersectionObserver' in window)) { for (var i = 0; i < vs.length; i++) spela(vs[i]); return; }
    var io = new IntersectionObserver(function (poster) {
      poster.forEach(function (p) {
        if (p.isIntersecting) spela(p.target);
        else if (!p.target.paused) p.target.pause();
      });
    }, { rootMargin: '200px 0px' });
    for (var j = 0; j < vs.length; j++) io.observe(vs[j]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
