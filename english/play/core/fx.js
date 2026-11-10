/* ============================================================
 * 영어 놀이터 — 공통 연출(PlayFx) (게임설계 v1 §7)
 *   콤보 불꽃 : 깔끔하게 3·5·8번 이어지면 불꽃이 1·2·3단으로 커진다(화면에 숫자 없음)
 *   평판 불빛 : 손님이 만족할수록 간판(무대마다 다른 대상)이 0→1 로 밝아진다
 *   웃음 축 연출 3종 : 거대화 giant · 색 바꿈 tint · 부풀기 puff
 *   기본 반응 : 색종이 confetti · 흔들 shake · 통 pop (점심 가게에 있던 것을 이리로 옮김)
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
    comboAt: [3, 5, 8],            /* 깔끔하게 몇 번 이어지면 불꽃(1·2·3단) */
    comboEvery: 3,                 /* 8번 뒤로는 이만큼마다 3단 */
    comboDelay: 180,               /* 성공 소리 뒤 콤보 반응까지(ms) — 0.3초 안 */
    sparks: [0, 14, 22, 34],       /* 단계별 불꽃 조각 수 */
    sparkSize: [0, 10, 14, 18],    /* 단계별 조각 크기(px) */
    sparkReach: [0, 90, 130, 180], /* 단계별 퍼지는 거리(px) */
    sparkMs: 900,
    confetti: 40, confettiMs: 2300,
    giant: { scale: 3.2, ms: 900 },
    puff: { scale: 1.5, ms: 700 },
    tintMs: 500,
    colors: ['#FF8A3D', '#12B886', '#1565C0', '#F59F00', '#F06595'],
    /* 색 바꿈 — 그림(이모지)을 그 색 쪽으로 물들이는 각도(세피아 기준). 색 이름은 사다리에 나온 것만(Lv1 색 칸 = red·blue) — 칸이 늘면 여기에 더한다 */
    hue: { red: -40, blue: 175 },
    glowFrom: [160, 174, 192], glowTo: [255, 255, 255]   /* 간판 글자색: 꺼짐 → 켜짐 */
  };

  function comboLevel(n) {
    var at = CONF.comboAt, i = at.indexOf(n), last = at[at.length - 1];
    if (i >= 0) return i + 1;
    if (n > last && (n - last) % CONF.comboEvery === 0) return at.length;
    return 0;
  }
  /* 연속 세기 — hit() 이 그 순간의 불꽃 단계(0 이면 없음)를 돌려준다 */
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

  var PlayFx = {
    CONF: CONF,
    comboLevel: comboLevel, streak: streak, meter: meter,
    /* 콤보 불꽃 — at(요소) 둘레에서 터진다. 만든 조각 수를 돌려준다 */
    burst: function (level, at) {
      level = Math.max(0, Math.min(3, level | 0)); if (!level) return 0;
      var fx = layer(), c = center(at), n = CONF.sparks[level];
      for (var i = 0; i < n; i++) {
        var p = g.document.createElement('i'), a = (Math.PI * 2 * i) / n + Math.random() * 0.4, reach = CONF.sparkReach[level] * (0.55 + Math.random() * 0.45), size = CONF.sparkSize[level] * (0.6 + Math.random() * 0.4);
        p.className = 'spark';
        p.style.left = (c.x - size / 2) + 'px'; p.style.top = (c.y - size / 2) + 'px';
        p.style.width = p.style.height = size + 'px';
        p.style.background = CONF.colors[i % CONF.colors.length];
        p.style.setProperty('--dx', Math.round(Math.cos(a) * reach) + 'px');
        p.style.setProperty('--dy', Math.round(Math.sin(a) * reach) + 'px');
        p.style.setProperty('--ms', CONF.sparkMs + 'ms');
        fx.appendChild(p);
        setTimeout(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }.bind(null, p), CONF.sparkMs + 80);
      }
      return n;
    },
    confetti: function (n) {
      var fx = layer(); n = n || CONF.confetti;
      for (var i = 0; i < n; i++) {
        var p = g.document.createElement('i'); p.className = 'cf';
        p.style.left = Math.random() * 100 + 'vw'; p.style.background = CONF.colors[i % CONF.colors.length];
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        fx.appendChild(p);
        setTimeout(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }.bind(null, p), CONF.confettiMs);
      }
      return n;
    },
    shake: function (el) { if (el) restart(el, 'fx-shake'); },
    pop: function (el) { if (el) restart(el, 'fx-pop'); },
    /* 평판 불빛 — el 은 .fx-glow 를 가진 대상(간판·칠판 별·깃발…) */
    glow: function (el, v) {
      if (!el) return 0;
      v = Math.max(0, Math.min(1, +v || 0));
      el.classList.add('fx-glow');
      el.style.setProperty('--glow', String(Math.round(v * 100) / 100));
      el.setAttribute('data-glow', v.toFixed(2));
      var a = CONF.glowFrom, b = CONF.glowTo;
      el.style.color = 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * v); }).join(',') + ')';
      return v;
    },
    /* 거대화 — 커진 채로 둔다(opt.back 이면 ms 뒤 제자리) */
    giant: function (el, opt) {
      opt = opt || {};
      el.style.setProperty('--fx-scale', String(opt.scale || CONF.giant.scale)); el.style.setProperty('--fx-ms', (opt.ms || CONF.giant.ms) + 'ms');
      restart(el, 'fx-giant');
      return new Promise(function (r) { setTimeout(function () { if (opt.back) el.classList.remove('fx-giant'); r(el); }, opt.ms || CONF.giant.ms); });
    },
    /* 부풀기 — 부풀었다 돌아온다 */
    puff: function (el, opt) {
      opt = opt || {};
      el.style.setProperty('--fx-scale', String(opt.scale || CONF.puff.scale)); el.style.setProperty('--fx-ms', (opt.ms || CONF.puff.ms) + 'ms');
      restart(el, 'fx-puff');
      return new Promise(function (r) { setTimeout(function () { el.classList.remove('fx-puff'); r(el); }, opt.ms || CONF.puff.ms); });
    },
    /* 색 바꿈 — color 는 CONF.hue 의 이름. 없는 이름·빈 값이면 원래 색으로 */
    tint: function (el, color) {
      var deg = CONF.hue[color];
      el.classList.add('fx-tint');
      if (deg == null) { el.style.filter = ''; el.removeAttribute('data-tint'); }
      else { el.style.filter = 'grayscale(1) sepia(1) saturate(5) hue-rotate(' + deg + 'deg)'; el.setAttribute('data-tint', color); }
      return new Promise(function (r) { setTimeout(function () { r(el); }, CONF.tintMs); });
    },
    reset: function (el) { ['fx-giant', 'fx-puff', 'fx-shake', 'fx-pop'].forEach(function (c) { el.classList.remove(c); }); el.style.filter = ''; el.removeAttribute('data-tint'); }
  };
  g.PlayFx = PlayFx;
})(window);
