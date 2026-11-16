/* ============================================================
 * 영어 놀이터 — 흔들고 받기 로직(PlayShakeCatch) (모션 사건 설계 v1 §3 · WM1)
 *   몸 장면 「사과 흔들기」의 놀이 로직만 — 보이는 판(입체 · 2D)은 이것을 부르고 알림을 받아 그린다(설계 v2 — 로직과 판을 나눈다).
 *   좌표는 나무 앞 세로 판의 자리(x 오른쪽 · y 위, 단위 = 장면 단위). 판이 손의 화면 자리를 이 판으로 옮겨 넣는다.
 *   사과 하나의 차례: tree(가지) → fall(떨어짐) → ground(풀밭) → held(손에) → in(바구니)
 *     · 흔들기 세기를 시간으로 쌓아 CONF.power 가 되면 사과가 하나 떨어진다 — 한 번에 하나(떨어지는 중이거나 손에 든 사과가 있으면 안 떨어진다)
 *     · 손이 사과에 겹쳐 CONF.holdMs 이어지면 잡힌다(오므리기 없음 · 너그럽게) · 거의 겹치면 near 알림(판은 빛 테)
 *     · 잡은 사과는 손을 따라온다 · 바구니에 닿으면 저절로 놓인다
 *     · 손이 안 보여도 잠깐(CONF.graceMs)은 그 자리에 떠서 기다린다(손 추적이 깜박여도 안 놓치게) — 더 길어지면 그 자리에서 떨어진다(다시 주우면 된다)
 *     · 시간은 실제 시간으로 센다 — 화면이 느린 기기에서도 같은 만큼 흔들면 떨어진다(떨어지는 움직임은 잘게 나누어 계산)
 *     · 놓친 사과는 풀밭에 그대로 — 주워도 되고 다시 흔들어도 된다. 실패 알림 0
 *   PlayShakeCatch.create({ apples:[{x,y}], ground, basket:{x,y}, n }) → game
 *     game.hand(x, y, seen) · game.shake(level) · game.step(dt) · game.pause(on) · game.scale(ppu) · game.on(type, fn) · game.next()(다음에 떨어질 사과) · game.ready()(쌓인 정도 0~1)
 *     알림: drop(i) land(i) near(i, on) catch(i) release(i) basketNear(on) put(i, slot) done()
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 해 보고 바꾼다 ── */
  var CONF = {
    power: 0.7,            /* 흔들기 세기 × 초 — 세게 흔들면 1초 안에 사과 하나(11-16 속도감 · 전에는 1.1) */
    gravity: 4.2,          /* 떨어지는 빠르기(장면 단위/초²) — 실제의 절반쯤 · 받을 틈은 남게(11-16 · 전에는 3.0) */
    sway: 0.18,            /* 떨어질 때 좌우로 흔들리는 너비 */
    bounce: 0.38,          /* 풀밭에 닿으면 이만큼 튄다(통) */
    rest: 0.7,             /* 이보다 느리게 닿으면 멈춘다 */
    catchR: 0.75,          /* 손과 사과가 이만큼 가까우면 겹친 것(장면 단위) */
    catchPx: 52,           /* 작은 화면에서도 이만큼(화면 점)은 — 1학년 손가락 */
    nearK: 1.8,            /* 잡힘 거리의 이 배 안이면 「잡힐 듯」(빛 테) */
    holdMs: 110,           /* 겹친 채 이만큼 이어지면 잡힌다 */
    graceMs: 900,          /* 든 채 손이 안 보여도 이만큼은 기다린다(손 추적 깜박임) — 넘으면 그 자리에서 떨어진다 */
    maxDt: 0.3, sub: 0.04, /* 한 장면에 흐르는 시간의 끝 · 떨어지는 움직임을 나누는 조각 */
    basketR: 0.95,         /* 들고 온 사과가 바구니에 이만큼 가까우면 놓인다 */
    basketPx: 64,
    follow: 18             /* 든 사과가 손을 따라가는 빠르기(클수록 바로) */
  };

  function create(o) {
    var C = Object.assign({}, CONF, o.conf || {});
    var subs = {}, ppu = 0, paused = false, power = 0, filled = 0, n = o.n || o.apples.length, finished = false;
    var hand = { x: 0, y: 0, seen: false }, overT = 0, overI = -1, nearI = -1, bNear = false, goneT = 0;
    var A = o.apples.map(function (p, i) { return { i: i, s: 'tree', x: p.x, y: p.y, hx: p.x, hy: p.y, vy: 0, t: 0, slot: -1 }; });
    var groundY = o.ground != null ? o.ground : 0.3, B = o.basket;
    function emit(t, a, b) { (subs[t] || []).slice().forEach(function (f) { try { f(a, b); } catch (e) {} }); }
    function r(units, px) { return ppu > 0 ? Math.max(units, px / ppu) : units; }
    function held() { for (var i = 0; i < A.length; i++) if (A[i].s === 'held') return A[i]; return null; }
    function falling() { for (var i = 0; i < A.length; i++) if (A[i].s === 'fall') return A[i]; return null; }
    function onTree() { for (var i = 0; i < A.length; i++) if (A[i].s === 'tree') return A[i]; return null; }
    function canDrop() { return !paused && !finished && !held() && !falling() && !!onTree(); }
    function setNear(i) { if (i === nearI) return; if (nearI >= 0) emit('near', nearI, false); nearI = i; if (i >= 0) emit('near', i, true); }
    function setBNear(on) { if (on === bNear) return; bNear = on; emit('basketNear', on); }
    function drop(a) { a.s = 'fall'; a.vy = 0; a.t = 0; a.x0 = a.x; emit('drop', a.i); }

    var game = {
      CONF: C, apples: A,
      on: function (t, fn) { (subs[t] = subs[t] || []).push(fn); return game; },
      scale: function (v) { ppu = v || 0; return game; },
      pause: function (on) { paused = !!on; if (paused) { overI = -1; setNear(-1); } return game; },
      paused: function () { return paused; },
      filled: function () { return filled; },
      done: function () { return finished; },
      power: function () { return power; },
      ready: function () { return canDrop() ? Math.min(1, power / C.power) : 0; },
      next: function () { var a = onTree(); return a && canDrop() ? a.i : -1; },
      canDrop: canDrop,
      hand: function (x, y, seen) {
        hand.seen = seen !== false; if (hand.seen) { hand.x = x; hand.y = y; }
        if (hand.seen) goneT = 0; else { overI = -1; setNear(-1); }                 /* 든 사과는 바로 놓지 않는다 — step 이 graceMs 를 센다 */
        return game;
      },
      shake: function (level) { game.level = Math.max(0, Math.min(1, level || 0)); return game; },
      level: 0,
      step: function (dt) {
        dt = Math.max(0, Math.min(C.maxDt, dt || 0));
        /* 흔들기 → 사과 하나 */
        if (canDrop() && game.level > 0) { power += game.level * dt; if (power >= C.power) { power = 0; drop(onTree()); } }
        else if (!canDrop()) power = 0;
        /* 떨어지는 사과 · 풀밭에서 통 */
        for (var left = dt; left > 1e-6; left -= C.sub) { var d = Math.min(C.sub, left);
          A.forEach(function (a) {
            if (a.s !== 'fall') return;
            a.t += d; a.vy -= C.gravity * d; a.y += a.vy * d; a.x = a.x0 + Math.sin(a.t * 3.1) * C.sway * Math.min(1, a.t * 1.5);
            if (a.y <= groundY) { a.y = groundY; if (-a.vy > C.rest) { a.vy = -a.vy * C.bounce; a.x0 = a.x; a.t = 0; emit('land', a.i, true); } else { a.vy = 0; a.s = 'ground'; a.x0 = a.x; emit('land', a.i, false); } }
          }); }
        if (paused || finished) return game;
        var h = held(), cr = r(C.catchR, C.catchPx);
        if (h) {
          if (hand.seen) { var k = 1 - Math.exp(-C.follow * dt); h.x += (hand.x - h.x) * k; h.y += (hand.y - h.y) * k; }
          else { goneT += dt * 1000; if (goneT >= C.graceMs) { goneT = 0; h.s = 'fall'; h.vy = 0; h.t = 0; h.x0 = h.x; emit('release', h.i); setBNear(false); return game; } }
          var dB = Math.hypot(h.x - B.x, h.y - B.y), br = r(C.basketR, C.basketPx);
          setBNear(dB < br * 2);
          if (dB < br) {
            h.s = 'in'; h.slot = filled; filled++; setBNear(false); emit('put', h.i, h.slot);
            if (filled >= n) { finished = true; emit('done'); }
          }
          return game;
        }
        if (!hand.seen) { overI = -1; setNear(-1); return game; }
        /* 손에 가장 가까운 사과(떨어지는 중 · 풀밭) */
        var best = -1, bd = 1e9;
        A.forEach(function (a) { if (a.s !== 'fall' && a.s !== 'ground') return; var d = Math.hypot(a.x - hand.x, a.y - hand.y); if (d < bd) { bd = d; best = a.i; } });
        setNear(best >= 0 && bd < cr * C.nearK ? best : -1);
        if (best >= 0 && bd < cr) {
          if (overI !== best) { overI = best; overT = 0; }
          overT += dt * 1000;
          if (overT >= C.holdMs) { var a = A[best]; a.s = 'held'; a.vy = 0; overI = -1; setNear(-1); emit('catch', a.i); }
        } else overI = -1;
        return game;
      },
      /* 다시 하기 — 처음 상태로 */
      reset: function () {
        A.forEach(function (a) { a.s = 'tree'; a.x = a.hx; a.y = a.hy; a.vy = 0; a.t = 0; a.slot = -1; });
        power = 0; filled = 0; finished = false; paused = false; goneT = 0; overI = -1; nearI = -1; bNear = false; game.level = 0; hand.seen = false;
        return game;
      }
    };
    return game;
  }
  g.PlayShakeCatch = { CONF: CONF, create: create };
})(window);
