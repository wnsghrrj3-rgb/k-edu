/* ============================================================
 * 영어 놀이터 — 공통 연출(PlayFx) (게임설계 v1 §7 · §15 움직임 규범)
 *   §15: 200~350ms·ease-out · 떨림·펑 대신 들어 올리기·미끄러짐·커짐 1.06 · 콤보는 빛 번짐 · 폭죽 금지 · 색 값은 토큰만.
 *   콤보 빛   : 깔끔하게 3·5·8번 이어지면 빛 고리가 1·2·3겹으로 번진다(화면에 숫자 없음)
 *   평판 불빛 : 손님이 만족할수록 간판(무대마다 다른 대상)이 0→1 로 밝아진다(--glow)
 *   웃음 축 연출 3종 : 거대화 giant · 색 바꿈 tint(그림의 --art-main 을 바꿈) · 부풀기 puff
 *   기본 반응 : 빛 번짐 bloom(예전 색종이 자리) · 살짝 내려앉기 shake · 들어 올리기 pop
 *   소리는 내지 않는다(core/audio.js 몫) — 여기는 화면만.
 *
 *   PlayFx.comboLevel(streak) → 0|1|2|3        PlayFx.streak() → { hit() → 단계, miss(), count() }
 *   PlayFx.burst(level, el)                    PlayFx.meter(total) → { add(), value(), set(v) }
 *   PlayFx.glow(el, 0~1)                       PlayFx.giant(el) · PlayFx.tint(el,'red') · PlayFx.puff(el) → Promise
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 보고 바꾼다 ── */
  var CONF = {
    comboAt: [3, 5, 8],            /* 깔끔하게 몇 번 이어지면 빛(1·2·3단) */
    comboEvery: 3,                 /* 8번 뒤로는 이만큼마다 3단 */
    comboDelay: 180,               /* 성공 소리 뒤 콤보 반응까지(ms) — 0.3초 안 */
    rings: [0, 1, 2, 3],           /* 단계별 빛 고리 수 */
    ringSize: [0, 120, 170, 230],  /* 단계별 고리가 번지는 크기(px) */
    ringMs: 700,
    bloomMs: 1200,                 /* 빛 번짐(축하) */
    giant: { scale: 3.2, ms: 350 },
    puff: { scale: 1.06, ms: 350 },
    tintMs: 300,
    /* 색 바꿈 — 그림의 큰 면(--art-main)을 이 토큰으로. 색 이름은 사다리에 나온 것만(Lv1 색 칸 = red·blue) — 칸이 늘면 여기에 더한다 */
    hue: { red: 'var(--word-red)', blue: 'var(--word-blue)' }
  };

  function comboLevel(n) {
    var at = CONF.comboAt, i = at.indexOf(n), last = at[at.length - 1];
    if (i >= 0) return i + 1;
    if (n > last && (n - last) % CONF.comboEvery === 0) return at.length;
    return 0;
  }
  /* 연속 세기 — hit() 이 그 순간의 단계(0 이면 없음)를 돌려준다 */
  function streak() {
    var n = 0;
    return { hit: function () { n++; return comboLevel(n); }, miss: function () { n = 0; return 0; }, count: function () { return n; } };
  }
  /* 0~1 로 차오르는 값(평판) — total 번 만족하면 1 */
  function meter(total) {
    var n = 0; total = Math.max(1, total || 1);
    return {
      add: function (k) { n = Math.min(total, n + (k == null ? 1 : k)); return n / total; },
      set: function (v) { n = Math.max(0, Math.min(1, v)) * total; return n / total; },
      value: function () { return n / total; }
    };
  }

  function layer() {
    var d = g.document, fx = d.getElementById('fx');
    if (!fx) { fx = d.createElement('div'); fx.id = 'fx'; fx.className = 'fx'; d.body.appendChild(fx); }
    return fx;
  }
  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function center(el) {
    var r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    if (r && (r.width || r.height)) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    return { x: (g.innerWidth || 360) / 2, y: (g.innerHeight || 640) / 3 };
  }
  function drop(el, ms) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms); }

  var PlayFx = {
    CONF: CONF,
    comboLevel: comboLevel, streak: streak, meter: meter,
    /* 콤보 빛 — at(요소) 둘레에서 고리가 번진다. 만든 고리 수를 돌려준다 */
    burst: function (level, at) {
      level = Math.max(0, Math.min(3, level | 0)); if (!level) return 0;
      var fx = layer(), c = center(at), n = CONF.rings[level], size = CONF.ringSize[level];
      for (var i = 0; i < n; i++) {
        var r = g.document.createElement('i');
        r.className = 'ring';
        r.style.left = (c.x - size / 2) + 'px'; r.style.top = (c.y - size / 2) + 'px';
        r.style.width = r.style.height = size + 'px';
        r.style.setProperty('--ms', CONF.ringMs + 'ms');
        r.style.animationDelay = (i * 120) + 'ms';
        fx.appendChild(r); drop(r, CONF.ringMs + i * 120 + 80);
      }
      return n;
    },
    /* 빛 번짐 — 큰 일(가게 열림·하루 끝)에. 폭죽 대신 화면 가운데가 따뜻하게 밝아졌다 가라앉는다 */
    bloom: function () {
      var fx = layer(), b = g.document.createElement('i'); b.className = 'bloom';
      b.style.setProperty('--ms', CONF.bloomMs + 'ms');
      fx.appendChild(b); drop(b, CONF.bloomMs + 60);
      return 1;
    },
    confetti: function () { return this.bloom(); },     /* 예전 이름 — 이제 빛 번짐 */
    shake: function (el) { if (el) restart(el, 'fx-shake'); },
    pop: function (el) { if (el) restart(el, 'fx-pop'); },
    /* 평판 불빛 — el 은 .fx-glow 를 가진 대상(간판·칠판 별·깃발…). 밝기는 CSS 가 --glow 로 그린다 */
    glow: function (el, v) {
      if (!el) return 0;
      v = Math.max(0, Math.min(1, +v || 0));
      el.classList.add('fx-glow');
      el.style.setProperty('--glow', String(Math.round(v * 100) / 100));
      el.setAttribute('data-glow', v.toFixed(2));
      el.classList.toggle('lit', v >= 0.5);
      return v;
    },
    /* 거대화 — 커진 채로 둔다(opt.back 이면 ms 뒤 제자리) */
    giant: function (el, opt) {
      opt = opt || {};
      el.style.setProperty('--fx-scale', String(opt.scale || CONF.giant.scale)); el.style.setProperty('--fx-ms', (opt.ms || CONF.giant.ms) + 'ms');
      restart(el, 'fx-giant');
      return new Promise(function (r) { setTimeout(function () { if (opt.back) el.classList.remove('fx-giant'); r(el); }, opt.ms || CONF.giant.ms); });
    },
    /* 부풀기 — 살짝 커졌다(1.06) 돌아온다 */
    puff: function (el, opt) {
      opt = opt || {};
      el.style.setProperty('--fx-scale', String(opt.scale || CONF.puff.scale)); el.style.setProperty('--fx-ms', (opt.ms || CONF.puff.ms) + 'ms');
      restart(el, 'fx-puff');
      return new Promise(function (r) { setTimeout(function () { el.classList.remove('fx-puff'); r(el); }, opt.ms || CONF.puff.ms); });
    },
    /* 색 바꿈 — color 는 CONF.hue 의 이름. 없는 이름·빈 값이면 원래 색으로 */
    tint: function (el, color) {
      var v = CONF.hue[color];
      el.classList.add('fx-tint');
      if (v == null) { el.style.removeProperty('--art-main'); el.removeAttribute('data-tint'); }
      else { el.style.setProperty('--art-main', v); el.setAttribute('data-tint', color); }
      return new Promise(function (r) { setTimeout(function () { r(el); }, CONF.tintMs); });
    },
    reset: function (el) { ['fx-giant', 'fx-puff', 'fx-shake', 'fx-pop'].forEach(function (c) { el.classList.remove(c); }); el.style.removeProperty('--art-main'); el.removeAttribute('data-tint'); }
  };
  g.PlayFx = PlayFx;
})(window);
