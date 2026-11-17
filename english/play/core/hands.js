/* ============================================================
 * 영어 놀이터 — 손짓 부품 상자(PlayHands) (WD0 · 다름 설계 v1 §2 ⑨ · §6)
 *   손짓 하나 = 손 움직임을 읽어 「골랐다 · 놓았다」 를 판정 뼈대(core/frames.js)에 넘기는 부품. 놀이 = 뼈대 하나 + 손짓 하나 + 그릇.
 *   손짓은 무엇이 맞는지 모른다 — 「이것에 손짓을 했다(choose)」 · 「이것을 저기에 놓았다(put)」 만 알린다. 맞고 틀림 · 증거는 뼈대의 일.
 *   이번에 지은 다섯(A01~A05):
 *     shake 흔들기          물건 위에서 손을 좌우(위아래)로 흔든다 → choose
 *     drag  끌어 놓기        물건을 잡아 자리에 끌어다 놓는다 → put   (물건을 누르고 자리를 눌러도 된다)
 *     hold  꾹 눌렀다 놓기   물건을 꾹 누르고 있다가(차오른다) 놓는다 → choose
 *     throw 던지기          물건을 잡아 자리 쪽으로 튕겨 던진다 → put(자리 위에 놓아도 된다)
 *     rub   문지르기        물건 위를 이리저리 문지른다 → choose
 *   const h = PlayHands.create(kind, { items: () => [{ id, x, y, r }], zones: () => [{ id, x, y, r }], on: e => … })
 *     h.down(x, y, t) · h.move(x, y, t) · h.up(x, y, t) · h.tick(t) · h.cancel()      좌표는 어느 판이든 그 판의 화면 점(입체 판 · 2D 판이 같은 부품을 쓴다)
 *     알리는 것(on): grab(id) · drag(id, x, y) · progress(id, k 0~1) · choose(id, by) · put(id, zone, by) · fly(id, zone, from, to) · back(id) · hint(id, n)
 *       by = 'gesture'(그 손짓으로) | 'tap'(손짓이 어려운 아이 — 그냥 누르기가 CONF.assist 번 이어지면 시범(hint) 뒤 받아 준다 · 끌어 놓기는 눌러 고르고 눌러 놓기)
 *   PlayHands.bind(el, h)                 포인터를 손짓에 잇는다(손가락 · 펜 · 마우스) → 푸는 함수
 *   PlayHands.cell(box, kind, spec)       2D 판의 한 칸 — 물건과 자리를 그리고 손짓이 보이게 움직인다(시험판 · 2D 걸음 화면이 쓴다)
 *   PlayHands.CARRY[kind]                 물건을 자리로 옮기는 손짓인가(끌어 놓기 · 던지기) — 뼈대가 choose 와 put 중 무엇을 기다릴지 안다
 *   문턱 값은 CONF 한 곳 — 준호가 태블릿에서 아이 손으로 맞춘다.
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    tapPx: 12,                                      /* 이보다 덜 움직이고 뗀 것은 그냥 누르기 */
    grab: 1.25,                                     /* 물건을 잡는 거리(물건 반지름의 몫) */
    assist: 3,                                      /* 그냥 누르기가 이만큼 이어지면 받아 준다(그 전에는 시범) */
    shake: { minPx: 16, maxGapMs: 650, need: 5 },   /* 방향이 바뀌기까지 움직인 폭 · 바뀜 사이의 시간 · 필요한 바뀜 수 */
    drag:  { drop: 1.3 },                           /* 놓는 자리의 넉넉함(자리 반지름의 몫) */
    hold:  { ms: 850, slipPx: 30 },                 /* 꾹 누르는 시간 · 이만큼 벗어나면 풀린다 */
    'throw': { minSpeed: 0.4, sampleMs: 110, cone: 0.75, drop: 1.3 },   /* 던진 빠르기(점/ms) · 빠르기를 재는 끝 구간 · 자리 쪽으로 본 각의 너그러움(라디안) */
    rub:   { needPx: 460, maxGapMs: 900, reach: 1.35 }                  /* 물건 위에서 문지른 길이 · 쉬면 풀리는 시간 · 물건 둘레의 넉넉함 */
  };
  var KINDS = ['shake', 'drag', 'hold', 'throw', 'rub'], CARRY = { drag: true, 'throw': true };
  var NAME = { shake: '흔들기', drag: '끌어 놓기', hold: '꾹 눌렀다 놓기', 'throw': '던지기', rub: '문지르기' };
  function near(list, x, y, k) { var best = null, bd = 1e9; (list || []).forEach(function (o) { var d = Math.hypot(o.x - x, o.y - y); if (d <= (o.r || 30) * k && d < bd) { bd = d; best = o; } }); return best; }

  function create(kind, env) {
    if (KINDS.indexOf(kind) < 0) throw new Error('아직 짓지 않은 손짓 ' + kind);
    var C = CONF[kind] || {}, on = env.on || function () {}, items = env.items || function () { return []; }, zones = env.zones || function () { return []; };
    var st = null, taps = {}, picked = null;           /* st = 지금 누르고 있는 손 · picked = 눌러서 골라 둔 물건(끌어 놓기 · 던지기의 누르기 길) */
    function emit(type, o) { o = o || {}; o.type = type; o.hand = kind; on(o); }
    function tapOn(it) { taps[it.id] = (taps[it.id] || 0) + 1; if (taps[it.id] >= CONF.assist) { taps[it.id] = 0; emit('choose', { id: it.id, by: 'tap' }); } else emit('hint', { id: it.id, n: taps[it.id] }); }
    function down(x, y, t) {
      var it = near(items(), x, y, kind === 'rub' ? C.reach : CONF.grab);
      st = { x0: x, y0: y, x: x, y: y, t0: t, t: t, it: it, moved: 0, path: [[x, y, t]], turns: 0, dir: 0, run: 0, lastTurn: t, rubbed: 0, charged: false, slipped: false, done: false };
      if (it && CARRY[kind]) emit('grab', { id: it.id });
      if (it && kind === 'hold') emit('progress', { id: it.id, k: 0 });
    }
    function move(x, y, t) {
      if (!st || st.done) return; var dx = x - st.x, dy = y - st.y, d = Math.hypot(dx, dy); st.moved += d; st.path.push([x, y, t]); if (st.path.length > 40) st.path.shift();
      if (kind === 'shake' && st.it) {                                            /* 방향 바뀜을 센다(가로든 세로든 더 크게 움직인 쪽) */
        var v = Math.abs(dx) >= Math.abs(dy) ? dx : dy, s = v > 0 ? 1 : v < 0 ? -1 : 0;
        if (s && s === st.dir) st.run += Math.abs(v); else if (s) { if (st.dir && st.run >= C.minPx) { st.turns = t - st.lastTurn <= C.maxGapMs ? st.turns + 1 : 1; st.lastTurn = t; emit('progress', { id: st.it.id, k: Math.min(1, st.turns / C.need) }); } st.dir = s; st.run = Math.abs(v); }
        if (st.turns >= C.need) { st.done = true; emit('choose', { id: st.it.id, by: 'gesture' }); }
      } else if (kind === 'rub') {                                                /* 물건 위에서 움직인 길이를 모은다 */
        var it = st.it && Math.hypot(st.it.x - x, st.it.y - y) <= (st.it.r || 30) * C.reach ? st.it : near(items(), x, y, C.reach);
        if (it) { if (!st.it || it.id !== st.it.id) { st.it = it; st.rubbed = 0; } st.rubbed += d; emit('progress', { id: it.id, k: Math.min(1, st.rubbed / C.needPx) }); if (st.rubbed >= C.needPx) { st.done = true; emit('choose', { id: it.id, by: 'gesture' }); } }
      } else if (kind === 'hold' && st.it) { if (Math.hypot(x - st.x0, y - st.y0) > C.slipPx && !st.slipped) { st.slipped = true; emit('progress', { id: st.it.id, k: 0 }); } }
      else if (CARRY[kind] && st.it) emit('drag', { id: st.it.id, x: x, y: y });
      st.x = x; st.y = y; st.t = t;
    }
    function tick(t) { if (!st || st.done || kind !== 'hold' || !st.it || st.slipped) return; var k = Math.min(1, (t - st.t0) / C.ms); emit('progress', { id: st.it.id, k: k }); st.charged = k >= 1; }
    function up(x, y, t) {
      if (!st) return; var s = st; st = null; if (s.done) return;
      var isTap = s.moved < CONF.tapPx;
      if (CARRY[kind]) {
        if (!s.it) { var z0 = picked && isTap ? near(zones(), x, y, C.drop) : null; if (z0) { var p0 = picked; picked = null; emit('put', { id: p0, zone: z0.id, by: 'tap' }); } return; }
        if (isTap) { picked = s.it.id; emit('grab', { id: s.it.id, by: 'tap' }); emit('hint', { id: s.it.id, n: 1 }); return; }      /* 눌러서 고르고 → 자리를 눌러 놓는다 */
        picked = null; var z = near(zones(), x, y, C.drop);
        if (!z && kind === 'throw') {                                             /* 던진 쪽의 자리 — 빠르기와 방향으로 */
          var a = s.path[s.path.length - 1], b = a; for (var i = s.path.length - 1; i >= 0; i--) { b = s.path[i]; if (a[2] - b[2] >= C.sampleMs) break; }
          var dt = Math.max(1, a[2] - b[2]), vx = (a[0] - b[0]) / dt, vy = (a[1] - b[1]) / dt, sp = Math.hypot(vx, vy);
          if (sp >= C.minSpeed) { var best = null, ba = C.cone; zones().forEach(function (q) { var ang = Math.abs(Math.atan2(vx * (q.y - y) - vy * (q.x - x), vx * (q.x - x) + vy * (q.y - y))); if (ang < ba) { ba = ang; best = q; } });
            if (best) { emit('fly', { id: s.it.id, zone: best.id, from: [x, y], to: [best.x, best.y] }); emit('put', { id: s.it.id, zone: best.id, by: 'gesture' }); return; } }
        }
        if (z) emit('put', { id: s.it.id, zone: z.id, by: 'gesture' }); else emit('back', { id: s.it.id });
        return;
      }
      if (!s.it) return;
      if (kind === 'hold') { if ((s.charged || t - s.t0 >= C.ms) && !s.slipped) emit('choose', { id: s.it.id, by: 'gesture' });      /* 놓는 순간의 시간으로 본다 — 화면이 느려 차오름을 덜 그렸어도 꾹 누른 것은 꾹 누른 것 */ else { emit('progress', { id: s.it.id, k: 0 }); if (isTap && t - s.t0 < C.ms * 0.5) tapOn(s.it); } return; }
      if (kind === 'shake') { emit('progress', { id: s.it.id, k: 0 }); if (isTap) tapOn(s.it); return; }
      if (kind === 'rub') { if (isTap) tapOn(s.it); return; }
    }
    function cancel() { if (st && st.it) emit('back', { id: st.it.id }); st = null; }
    return { kind: kind, carry: !!CARRY[kind], down: down, move: move, up: up, tick: tick, cancel: cancel, get active() { return !!st; }, get picked() { return picked; }, reset: function () { st = null; taps = {}; picked = null; } };
  }

  /* 포인터를 손짓에 잇는다 — 한 번에 한 손가락. opt.capture 면 다른 것보다 먼저 받는다(입체 판 — 화면 돌리기보다 손짓이 먼저) */
  function bind(el, h, opt) {
    opt = opt || {}; var id = null, raf = 0, cap = !!opt.capture, W = el.defaultView || (el.ownerDocument && el.ownerDocument.defaultView) || g, now = function () { return (W.performance || Date).now(); };      /* W = 그 판의 창(2D 칸은 제 문서의 창) */
    function loop() { if (id == null) { raf = 0; return; } h.tick(now()); raf = W.requestAnimationFrame(loop); }
    function dn(e) { if (id != null || (opt.accept && !opt.accept(e))) return; id = e.pointerId == null ? 0 : e.pointerId; h.down(e.clientX, e.clientY, now()); if (h.active && opt.stop) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); } if (!raf && g.requestAnimationFrame) raf = W.requestAnimationFrame(loop); }
    function mv(e) { if (id == null || (e.pointerId != null && e.pointerId !== id)) return; h.move(e.clientX, e.clientY, now()); }
    function upf(e) { if (id == null || (e.pointerId != null && e.pointerId !== id)) return; id = null; h.up(e.clientX, e.clientY, now()); }
    function cn() { if (id == null) return; id = null; h.cancel(); }
    el.addEventListener('pointerdown', dn, cap); W.addEventListener('pointermove', mv, cap); W.addEventListener('pointerup', upf, cap); W.addEventListener('pointercancel', cn, cap);
    return function () { el.removeEventListener('pointerdown', dn, cap); W.removeEventListener('pointermove', mv, cap); W.removeEventListener('pointerup', upf, cap); W.removeEventListener('pointercancel', cn, cap); if (raf && W.cancelAnimationFrame) W.cancelAnimationFrame(raf); id = null; };
  }

  /* 2D 판의 한 칸 — spec = { items: [{ id, html }], zones: [{ id, html }], on(e) }. 물건은 위쪽 줄, 자리는 아래쪽 줄. 손짓이 보이게 움직인다 */
  function cell(box, kind, spec) {
    var doc = box.ownerDocument, root = doc.createElement('div'); root.className = 'ph-cell ph-' + kind; root.setAttribute('data-hand', kind);
    var row = doc.createElement('div'); row.className = 'ph-items'; var zr = doc.createElement('div'); zr.className = 'ph-zones'; root.appendChild(row); root.appendChild(zr); box.appendChild(root);
    var els = {}, zels = {};
    (spec.items || []).forEach(function (it) { var b = doc.createElement('div'); b.className = 'ph-item'; b.setAttribute('data-id', it.id); b.innerHTML = '<span class="ph-pic">' + (it.html || '') + '</span><i class="ph-ring"></i>'; row.appendChild(b); els[it.id] = b; });
    (spec.zones || []).forEach(function (z) { var b = doc.createElement('div'); b.className = 'ph-zone'; b.setAttribute('data-id', z.id); b.innerHTML = z.html || ''; zr.appendChild(b); zels[z.id] = b; });
    var mid = function (e) { var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(r.width, r.height) / 2 }; };
    var listOf = function (m) { return Object.keys(m).filter(function (k) { return !m[k].classList.contains('gone'); }).map(function (k) { var c = mid(m[k]); c.id = k; return c; }); };
    function home(b) { b.style.transform = ''; b.classList.remove('held', 'fly'); }
    var h = create(kind, { items: function () { return listOf(els); }, zones: function () { return listOf(zels); }, on: function (e) {
      var b = els[e.id];
      if (e.type === 'grab' && b) b.classList.add('held');
      else if (e.type === 'drag' && b) { var c = mid(b), t = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(b.style.transform) || [0, 0, 0]; b.style.transform = 'translate(' + (+t[1] + e.x - c.x) + 'px, ' + (+t[2] + e.y - c.y) + 'px)'; }
      else if (e.type === 'progress' && b) { b.style.setProperty('--k', e.k); if (kind === 'shake') b.style.transform = 'translateX(' + (e.k ? (Math.round(e.k * 10) % 2 ? 6 : -6) : 0) + 'px)'; }
      else if (e.type === 'back' && b) home(b);
      else if (e.type === 'fly' && b) { b.classList.add('fly'); b.style.transform = 'translate(' + (e.to[0] - mid(b).x) + 'px, ' + (e.to[1] - mid(b).y) + 'px) scale(.7)'; }
      else if (e.type === 'hint' && b) { b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint'); }
      if (spec.on) spec.on(e, api);
    } });
    var off = bind(root, h, {});
    var api = { el: root, hand: h, items: els, zones: zels, home: function (id) { if (els[id]) home(els[id]); }, lit: function (id, on) { if (els[id]) els[id].classList.toggle('lit', on !== false); }, gone: function (id) { if (els[id]) els[id].classList.add('gone'); },
      reset: function () { Object.keys(els).forEach(function (k) { home(els[k]); els[k].classList.remove('gone', 'lit', 'hint'); els[k].style.removeProperty('--k'); }); h.reset(); }, destroy: function () { off(); if (root.parentNode) root.parentNode.removeChild(root); } };
    return api;
  }

  g.PlayHands = { CONF: CONF, KINDS: KINDS, CARRY: CARRY, NAME: NAME, create: create, bind: bind, cell: cell, has: function (k) { return KINDS.indexOf(k) >= 0; } };
})(typeof window !== 'undefined' ? window : globalThis);
