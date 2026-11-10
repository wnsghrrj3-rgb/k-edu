/* ============================================================
 * 영어 놀이터 — 배경 숨결(ambient) 그리기
 *   <body> 맨 앞에 .amb 한 겹을 넣는다(화면 뒤, 누를 수 없음). 색은 ambient.css 의 토큰.
 *   첫 화면(data-ambient="world")은 언덕·해·구름 다섯·빛 알갱이 열넷, 무대는 구름 셋·알갱이 여섯.
 *   손가락·마우스·기울기·스크롤에 따라 언덕과 구름이 조금씩 따로 움직여 깊이가 생긴다.
 * ============================================================ */
(function(){
  if (window.__playAmbient) return; window.__playAmbient = 1;
  var CLOUD = '<svg viewBox="0 0 120 56" aria-hidden="true"><path d="M18 52a16 16 0 0 1-2-31 20 20 0 0 1 37-10 24 24 0 0 1 42 4 18 18 0 0 1 9 37z"/></svg>';
  var HILL = [
    'M0 150 C 180 90 330 120 480 110 C 650 98 760 60 940 80 C 1110 98 1260 70 1440 92 L1440 320 L0 320Z',
    'M0 210 C 160 160 300 170 450 182 C 610 196 720 140 900 150 C 1080 160 1230 196 1440 170 L1440 320 L0 320Z',
    'M0 268 C 200 230 380 250 560 244 C 760 238 880 214 1060 226 C 1230 238 1330 252 1440 240 L1440 320 L0 320Z'
  ];
  function el(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function build(){
    var world = document.body.getAttribute('data-ambient') === 'world';
    var amb = el('div', 'amb'); amb.setAttribute('aria-hidden', 'true');
    if (world) amb.appendChild(el('div', 'sun'));
    var nC = world ? 5 : 3, clouds = [];
    for (var i = 0; i < nC; i++) {
      var c = el('div', 'cl', CLOUD), w = rnd(110, 260), dur = rnd(70, 150);
      c.style.width = w + 'px'; c.style.top = rnd(3, world ? 42 : 30) + 'vh';
      c.style.opacity = rnd(.55, .95).toFixed(2);
      c.style.animationDuration = dur + 's'; c.style.animationDelay = (-rnd(0, dur)) + 's';   /* 처음부터 화면 곳곳에 */
      amb.appendChild(c); clouds.push({ el: c, d: w / 260 });
    }
    var layers = [];
    if (world) {
      var hills = el('div', 'hills');
      HILL.forEach(function(p, k){
        var L = el('div', 'layer', '<svg viewBox="0 0 1440 320" preserveAspectRatio="none"><path class="h' + (k + 1) + '" d="' + p + '"/></svg>');
        hills.appendChild(L); layers.push({ el: L, d: (k + 1) * 6 });
      });
      amb.appendChild(hills);
    }
    var nM = world ? 14 : 6;
    for (var m = 0; m < nM; m++) {
      var mo = el('div', 'mote'), s = rnd(4, 9), dm = rnd(14, 26);
      mo.style.left = rnd(2, 98) + 'vw'; mo.style.width = mo.style.height = s + 'px';
      mo.style.setProperty('--dx', rnd(-40, 40).toFixed(0) + 'px');
      mo.style.animationDuration = dm + 's'; mo.style.animationDelay = (-rnd(0, dm)) + 's';
      amb.appendChild(mo);
    }
    document.body.insertBefore(amb, document.body.firstChild);

    /* 깊이 — 앞 겹일수록 많이 움직인다 */
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var px = 0, py = 0, sy = 0, raf = 0;
    function paint(){ raf = 0;
      layers.forEach(function(L){ L.el.style.transform = 'translate(' + (px * L.d) + 'px,' + (py * L.d * .5 + sy * L.d * .02) + 'px)'; });
      clouds.forEach(function(C){ C.el.style.marginLeft = (px * C.d * 10) + 'px'; C.el.style.marginTop = (sy * -.04 * C.d) + 'px'; });
    }
    function ask(){ if (!raf) raf = requestAnimationFrame(paint); }
    addEventListener('pointermove', function(e){ px = (e.clientX / innerWidth - .5) * -2; py = (e.clientY / innerHeight - .5) * -2; ask(); }, { passive: true });
    addEventListener('deviceorientation', function(e){ if (e.gamma == null) return; px = Math.max(-1, Math.min(1, e.gamma / 30)) * -1; py = Math.max(-1, Math.min(1, (e.beta - 40) / 30)) * -1; ask(); }, { passive: true });
    addEventListener('scroll', function(){ sy = scrollY; ask(); }, { passive: true });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
