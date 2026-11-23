/* 케이원더 · 태양 가까이 — 묶음 ㄱ 손잡이 판(회색 도형). 그림은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 탐사선 창: 멀리(태양과 점 같은 지구) / 가장자리(태양 전체) / 표면 위(흑점 곁).
 * 오른쪽(아래) = 조종판: 거리 레버 · 색유리 다이얼 · 지구 받침(끌어다 창에 놓기).
 */
import { describe, lineUp, lightSeconds, cutOf, SPOTS, PROMS, LOOPS, SURFACE_VIEW, EARTH_R, EARTHS_ACROSS, SUN_DIAM, SUN_EARTH, FILTERS, FILTER_ORDER, SURFACE_TEMP, SPOT_TEMP, km2r, MISSIONS, WHY } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = { waiting: false, pid: null, filter: 'visible', dist: 0.5, mode: 'one', earth: null, line: null, watch: 0, light: null, mi: 0, free: false,
    grab: null, drag: null, lineDrag: null, flash: 0, t: 0, res: null, lastSay: '' };
  let W = 0, H = 0, dpr = 1, VIEW = null, PANEL = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', metal: '#aeb4bf' };
  const GLASS = { none: '#3a404c', visible: '#b9b39a', red: '#a8706a', uv: '#7d7fb0' };
  const LIGHT_SPEEDUP = 60;                                                          // 빛 시계는 60배 빠르게(8분 20초 → 8.3초)

  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    const h = H - top - bottom;
    if (W >= H * 1.15) { VIEW = { x: 8, y: top, w: W * 0.62 - 12, h }; PANEL = { x: W * 0.62 + 4, y: top, w: W * 0.38 - 12, h }; }
    else { VIEW = { x: 8, y: top, w: W - 16, h: h * 0.6 }; PANEL = { x: 8, y: top + h * 0.6 + 6, w: W - 16, h: h * 0.4 - 6 }; }
  }
  const relayout = () => { if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout(); };
  const cut = () => cutOf(S.dist);

  // ── 창 안의 자리(태양 반지름 단위 ↔ 화면)
  function frameOf(c = cut()) {
    const V = VIEW, cy = V.y + V.h / 2 + 10;
    if (c === 'far') { const R = Math.max(10, Math.min(V.w * 0.13, V.h * 0.28)); return { cx: V.x + V.w * 0.2, cy, k: R, ox: 0, oy: 0 }; }
    if (c === 'limb') return { cx: V.x + V.w / 2, cy, k: Math.min(V.w, V.h - 40) * 0.36, ox: 0, oy: 0 };
    return { cx: V.x + V.w / 2, cy, k: Math.min(V.w, V.h - 40) / 2 / SURFACE_VIEW.half, ox: SURFACE_VIEW.cx, oy: SURFACE_VIEW.cy };
  }
  const toS = (x, y, F = frameOf()) => [F.cx + (x - F.ox) * F.k, F.cy - (y - F.oy) * F.k];
  const fromS = (sx, sy, F = frameOf()) => ({ x: (sx - F.cx) / F.k + F.ox, y: -(sy - F.cy) / F.k + F.oy });
  const inView = (x, y) => x > VIEW.x && x < VIEW.x + VIEW.w && y > VIEW.y && y < VIEW.y + VIEW.h;
  const earthFar = () => ({ x: VIEW.x + VIEW.w * 0.88, y: VIEW.y + VIEW.h / 2 + 10 });

  // ── 조종판 손잡이 자리
  const DET = [-90, -30, 30, 90].map(d => d * Math.PI / 180);                          // 색유리 다이얼 멈춤 넷(12시 기준)
  function handles() {
    relayout();
    const P = PANEL, wide = P.w >= P.h * 1.05;
    let lever, dial, tray;
    if (wide) {
      const cw = P.w / 3, top = P.y + 30, bot = P.y + P.h - 22;
      lever = { x: P.x + cw * 0.42, y0: top + 12, y1: bot - 16 };
      dial = { x: P.x + cw * 1.5, y: (top + bot) / 2 + 6, r: Math.max(20, Math.min(cw * 0.28, (bot - top) * 0.28)) };
      tray = { x: P.x + cw * 2.5, y: (top + bot) / 2, r: Math.max(18, Math.min(cw * 0.26, 34)) };
    } else {
      const top = P.y + 34, bot = P.y + P.h - 24, cx2 = P.x + P.w * 0.68, mid = top + (bot - top) * 0.5;
      lever = { x: P.x + P.w * 0.22, y0: top + 12, y1: bot - 16 };
      dial = { x: cx2, y: top + (mid - top) / 2 + 14, r: Math.max(22, Math.min(P.w * 0.2, (mid - top) * 0.3)) };
      tray = { x: cx2, y: mid + (bot - mid) / 2 + 4, r: Math.max(20, Math.min(P.w * 0.16, 36)) };
    }
    lever.ky = lever.y0 + (lever.y1 - lever.y0) * S.dist;                              // 위 = 멀리, 아래 = 가까이
    dial.a = DET[FILTER_ORDER.indexOf(S.filter)];
    return { lever, dial, tray };
  }

  // ── 상태 → 말·판정
  function update() {
    S.res = describe({ filter: S.filter, dist: S.dist, earth: S.earth, line: S.line, watch: S.watch, light: S.light });
    if (S.res.says !== S.lastSay) { S.lastSay = S.res.says; ui.say(S.res.says); }
    return S.res;
  }
  let nextT = null, whyT = null;
  function showMission() {
    if (S.waiting) { S.earth = null; S.line = null; update(); }                          // 쉬는 동안 놓은 지구·줄은 새 의뢰에 넘기지 않는다
    S.waiting = false; clearTimeout(nextT); nextT = null;                               // 성공 뒤 쉬는 때가 끝남 → 다음 의뢰를 보여 주고 나서야 판정
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 살펴보세요', '멀리서 태양을 누르면 빛 한 줄기를 쏴요');
    ui.freeMode(S.free);
  }
  function succeed(i, sub) {
    S.waiting = true;
    S.mi = i + 1; if (S.mi >= MISSIONS.length) { S.free = true; ui.freeMode(true); }
    S.earth = null; S.line = null; S.lineDrag = null; update();                          // 다음 의뢰가 남은 지구·줄로 저절로 풀리지 않게
    ui.note('성공! ⭐', sub);
    clearTimeout(whyT); whyT = setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    clearTimeout(nextT); nextT = setTimeout(showMission, 8000);
  }
  const SUBS = ['흑점 하나에 지구가 쏙 — 흑점도 엄청 커요.', '폭발의 순간! 이 알갱이 구름이 지구에 닿으면 오로라가 떠요.', `태양 지름에 지구 ${Math.floor(EARTHS_ACROSS)}개.`];
  function judge(which, state = S.res) {
    if (S.waiting || S.mi >= MISSIONS.length || S.mi !== which) return;
    const m = MISSIONS[S.mi];
    if (m.ok(state)) succeed(S.mi, SUBS[S.mi]);
    else ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, m.tell(state) + ' · 귀띔: ' + m.hint);
  }
  const judgeHandles = () => { update(); judge(0); if (S.line) judge(2); };
  function set(o = {}, judgeNow = true) {
    const before = cut();
    if (o.filter && FILTERS[o.filter]) S.filter = o.filter;
    if (o.dist != null) S.dist = Math.max(0, Math.min(1, o.dist));
    if (o.mode) S.mode = o.mode;
    if (cut() !== before) { S.earth = null; S.line = null; if (cut() !== 'far') S.light = null; }
    update(); if (judgeNow) judgeHandles();
    return S.res;
  }
  function putEarth(p) { S.earth = p; S.line = null; update(); judge(0); return S.res; }
  function putLine(p0, p1) { S.line = lineUp(p0, p1); S.earth = null; update(); judge(2); return S.res; }
  function photo() {
    update(); const shot = S.res; S.flash = 0.35;
    if (S.mi === 1 && !S.waiting) judge(1, shot); else ui.say('찰칵! ' + shot.says);
    return shot;
  }
  function shoot() { if (cut() !== 'far' || S.res.glare) return false; S.light = 0; update(); return true; }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    if (S.grab) return;                                                                  // 한 손가락이 쥐고 있는 동안 다른 손가락은 무시
    const [x, y] = P(e), h = handles(), c = cut(), F = frameOf();
    const onEarth = S.earth && c !== 'far' && (() => { const [ex, ey] = toS(S.earth.x, S.earth.y); return Math.hypot(x - ex, y - ey) < 18; })();
    if (Math.abs(x - h.lever.x) < 34 && y > h.lever.y0 - 26 && y < h.lever.y1 + 26) { S.grab = 'lever'; moveLever(y, h); }
    else if (Math.hypot(x - h.dial.x, y - h.dial.y) < h.dial.r + 24) { S.grab = 'dial'; moveDial(x, y, h); }
    else if (Math.hypot(x - h.tray.x, y - h.tray.y) < h.tray.r + 14 || onEarth) { S.grab = 'earth'; S.drag = { x, y }; }
    else if (inView(x, y) && c !== 'far' && S.mode === 'line') { S.grab = 'line'; const p = fromS(x, y); S.lineDrag = { p0: p, p1: p }; }
    else if (inView(x, y) && c === 'far' && Math.hypot(x - F.cx, y - F.cy) < F.k * 1.1) { shoot(); return; }
    else return;
    S.pid = e.pointerId; if (S.grab !== 'earth') S.drag = null;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  });
  cv.addEventListener('pointermove', e => {
    if (!S.grab || e.pointerId !== S.pid) return; const [x, y] = P(e), h = handles();
    if (S.grab === 'lever') moveLever(y, h);
    else if (S.grab === 'dial') moveDial(x, y, h);
    else if (S.grab === 'earth') S.drag = { x, y };
    else if (S.grab === 'line') S.lineDrag.p1 = fromS(x, y);
  });
  cv.addEventListener('pointerup', e => {
    const gr = S.grab; if (!gr || e.pointerId !== S.pid) return; S.grab = null; const [x, y] = P(e);
    if (gr === 'earth') {
      S.drag = null;
      if (inView(x, y) && cut() !== 'far') {
        let p = fromS(x, y);
        for (const s of SPOTS) { const [sx, sy] = toS(s.x, s.y); if (Math.hypot(x - sx, y - sy) < 12) p = { x: s.x, y: s.y }; }   // 손가락 굵기만큼 흑점에 붙음
        putEarth(p);
      } else { S.earth = null; update(); if (inView(x, y)) ui.say('너무 멀어요. 가까이 가서 대 보세요.'); }
    } else if (gr === 'line') { const L = S.lineDrag; S.lineDrag = null; putLine(L.p0, fromS(x, y)); }
    else judgeHandles();
  });
  cv.addEventListener('pointercancel', e => { if (e.pointerId !== S.pid) return; S.grab = null; S.drag = null; S.lineDrag = null; });
  function moveLever(y, h) { set({ dist: (y - h.lever.y0) / (h.lever.y1 - h.lever.y0) }, false); }
  function moveDial(x, y, h) {
    const a = Math.atan2(x - h.dial.x, -(y - h.dial.y));
    let best = 0; DET.forEach((d, i) => { if (Math.abs(d - a) < Math.abs(DET[best] - a)) best = i; });
    if (y > h.dial.y + h.dial.r * 0.3 && Math.abs(x - h.dial.x) < h.dial.r * 0.5) return;   // 아래쪽(멈춤 없는 곳)은 그대로
    set({ filter: FILTER_ORDER[best] }, false);
  }

  // ── 돌리기
  function step(dt) {
    S.t += dt;
    if (S.res && S.res.shows.loops) S.watch += dt; else S.watch = 0;
    if (S.light != null) S.light += dt * LIGHT_SPEEDUP;
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt);
    update();
  }

  // ── 그리기
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const STARS = Array.from({ length: 90 }, () => [rnd(), rnd(), 0.5 + rnd()]);
  const GRAN = Array.from({ length: 900 }, () => [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 6.28]);
  function draw() {
    relayout(); if (!S.res) update();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawView(); drawPanel();
    if (S.drag) drawEarthAt(S.drag.x, S.drag.y, cut() === 'far' ? 3 : Math.max(2, EARTH_R * frameOf().k), true);
  }
  function frame(R, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(R.x + .5, R.y + .5, R.w - 1, R.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(label, R.x + 10, R.y + 18); }
  function drawEarthAt(x, y, r, ring) {
    g.fillStyle = '#7f9cc4'; g.beginPath(); g.arc(x, y, Math.max(1.5, r), 0, 7); g.fill();
    if (ring) { g.strokeStyle = 'rgba(242,244,248,.7)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, Math.max(1.5, r) + 9, 0, 7); g.stroke(); g.fillStyle = C.hi; g.font = '700 11px system-ui'; g.textAlign = 'left'; g.fillText('지구', x + Math.max(1.5, r) + 12, y + 4); }
  }
  function drawView() {
    const c = cut(), r = S.res, F = frameOf();
    frame(VIEW, '탐사선 창 — ' + { far: '멀리', limb: '가장자리(태양 전체)', surface: '표면 위' }[c]);
    g.save(); g.beginPath(); g.rect(VIEW.x, VIEW.y, VIEW.w, VIEW.h); g.clip();
    g.fillStyle = '#c9ced8'; for (const [a, b, m] of STARS) { g.globalAlpha = 0.35; g.fillRect(VIEW.x + a * VIEW.w, VIEW.y + b * VIEW.h, m, m); } g.globalAlpha = 1;
    const [cx, cy] = toS(0, 0, F), R = F.k;
    // 원판(가장자리로 갈수록 살짝 어둡게)
    const base = r.glare ? '#f4f3ee' : GLASS[S.filter];
    const gr = g.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
    gr.addColorStop(0, base); gr.addColorStop(0.85, base); gr.addColorStop(1, r.glare ? base : 'rgba(40,40,40,1)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    if (!r.glare) {
      g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
      if (r.shows.granules) {                                                            // 꿈틀거리는 쌀알 무늬(실제 쌀알보다 크게 그림)
        const near = c === 'surface', n = near ? GRAN.length : 420, sz = near ? 0.007 : 0.018, span = near ? SURFACE_VIEW.half * 1.25 : 1;
        g.strokeStyle = 'rgba(60,30,28,.35)'; g.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          const [gx, gy, ph] = GRAN[i], x = gx * span + (near ? SURFACE_VIEW.cx : 0), y = gy * span + (near ? SURFACE_VIEW.cy : 0);
          const [px, py] = toS(x + Math.sin(S.t * 0.9 + ph) * sz * 0.2, y + Math.cos(S.t * 0.7 + ph) * sz * 0.2, F);
          g.beginPath(); g.arc(px, py, sz * R * (0.8 + 0.25 * Math.sin(S.t * 1.3 + ph)), 0, 7); g.stroke();
        }
      }
      if (r.shows.spots) for (const s of SPOTS) {                                          // 흑점: 가운데 짙고 둘레 옅음
        const [sx, sy] = toS(s.x, s.y, F), rr = Math.max(1.5, km2r(s.km) / 2 * R);
        g.fillStyle = 'rgba(70,64,52,.85)'; g.beginPath(); g.arc(sx, sy, rr, 0, 7); g.fill();
        g.fillStyle = 'rgba(20,18,15,.95)'; g.beginPath(); g.arc(sx, sy, rr * 0.55, 0, 7); g.fill();
      }
      if (r.shows.loops) for (const L of LOOPS) drawLoop(L, F, r);
      g.restore();
      if (r.shows.proms) for (const p of PROMS) drawProm(p, F);
    } else {
      g.fillStyle = 'rgba(244,243,238,.92)'; g.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
      g.fillStyle = '#5b6270'; g.font = '800 18px system-ui'; g.textAlign = 'center'; g.fillText('눈부셔요! 색유리를 끼워요', VIEW.x + VIEW.w / 2, VIEW.y + VIEW.h / 2); g.textAlign = 'left';
    }
    if (c === 'far') drawFar(F, r);
    // 지구 · 지구 줄
    if (c !== 'far' && S.earth && !S.drag) { const [ex, ey] = toS(S.earth.x, S.earth.y, F); drawEarthAt(ex, ey, EARTH_R * R, true); }
    const L = S.lineDrag ? lineUp(S.lineDrag.p0, S.lineDrag.p1) : S.line;
    if (c !== 'far' && L && L.from) {
      const n = L.diameter ? Math.floor(EARTHS_ACROSS) : L.count, dx = (L.to.x - L.from.x), dy = (L.to.y - L.from.y), len = Math.hypot(dx, dy) || 1, step = 2 * EARTH_R;
      g.fillStyle = '#7f9cc4';
      for (let i = 0; i < n; i++) { const f = (EARTH_R + i * step) / len, [px, py] = toS(L.from.x + dx * f, L.from.y + dy * f, F); g.beginPath(); g.arc(px, py, Math.max(1, EARTH_R * R), 0, 7); g.fill(); }
      const [tx, ty] = toS(L.to.x, L.to.y, F); g.fillStyle = C.hi; g.font = '800 13px system-ui'; g.textAlign = 'left';
      g.fillText('지구 ' + n + '개', Math.min(tx + 8, VIEW.x + VIEW.w - 70), Math.max(VIEW.y + 34, ty - 8));
    }
    if (S.lineDrag && S.lineDrag.p0) { const [ax, ay] = toS(S.lineDrag.p0.x, S.lineDrag.p0.y, F), [bx, by] = toS(S.lineDrag.p1.x, S.lineDrag.p1.y, F); g.strokeStyle = 'rgba(242,244,248,.35)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.setLineDash([]); }
    if (r.temps) drawThermo();
    if (S.flash > 0) { g.fillStyle = `rgba(255,255,255,${S.flash * 2})`; g.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h); }
    g.restore();
  }
  function drawLoop(L, F, r) {
    const [x0, y0] = toS(L.x - L.span / 2, L.y, F), [x1] = toS(L.x + L.span / 2, L.y, F), w = x1 - x0, hh = w * 0.9;
    const tw = L.twisted && r.flare ? r.flare : null;
    if (tw && tw.phase === 'flare') {                                                     // 폭발: 번쩍 + 알갱이 구름
      const k = tw.cloud, mx = x0 + w / 2;
      g.fillStyle = `rgba(242,244,248,${0.9 - 0.6 * k})`; g.beginPath(); g.arc(mx, y0 - hh * 0.5, w * (0.4 + 0.6 * k), 0, 7); g.fill();
      g.fillStyle = 'rgba(220,224,232,.8)';
      for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 + (i / 40 - 0.5) * 2.2, d = w * (0.5 + 4 * k) * (0.6 + 0.4 * Math.sin(i * 7)); g.fillRect(mx + Math.cos(a) * d * 1.6, y0 - hh * 0.5 + Math.sin(a) * d, 2, 2); }
      g.fillStyle = C.hi; g.font = '800 13px system-ui'; g.textAlign = 'center'; g.fillText('폭발!', mx, y0 - hh - 14); g.textAlign = 'left';
      return;
    }
    g.strokeStyle = L.twisted ? 'rgba(242,244,248,.95)' : 'rgba(210,214,224,.7)'; g.lineWidth = L.twisted ? 2.5 : 2;
    for (let j = 0; j < 3; j++) {
      g.beginPath();
      for (let i = 0; i <= 30; i++) {
        const f = i / 30, a = Math.PI * f, wig = tw ? Math.sin(f * 18 + S.t * 4 + j) * w * 0.06 * tw.twist * 2 : 0;
        const px = x0 + w * (0.5 - 0.5 * Math.cos(a)) + wig, py = y0 - Math.sin(a) * hh * (1 - j * 0.18);
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    }
    if (tw) { g.fillStyle = C.hi; g.font = '700 11px system-ui'; g.textAlign = 'center'; g.fillText('꼬인 다리 ' + Math.round(tw.twist * 100) + '%', x0 + w / 2, y0 - hh - 10); g.textAlign = 'left'; }
  }
  function drawProm(p, F) {
    const h = km2r(p.km), ux = Math.cos(p.angle), uy = Math.sin(p.angle), vx = -uy, vy = ux;
    const pt = (al, side) => toS(ux * al + vx * side, uy * al + vy * side, F);
    g.fillStyle = 'rgba(186,112,104,.75)';
    g.beginPath();
    const [ax, ay] = pt(0.99, -0.06); g.moveTo(ax, ay);
    for (let i = 0; i <= 20; i++) { const f = i / 20, al = 1 + h * Math.sin(Math.PI * f) * (1 + 0.06 * Math.sin(S.t * 0.6 + f * 5)), side = -0.06 + 0.12 * f; const [x, y] = pt(al, side); g.lineTo(x, y); }
    for (let i = 20; i >= 0; i--) { const f = i / 20, al = 1 + h * 0.6 * Math.sin(Math.PI * f), side = -0.04 + 0.08 * f; const [x, y] = pt(al, side); g.lineTo(x, y); }
    g.closePath(); g.fill();
    const [lx, ly] = pt(1 + h + 0.05, 0); g.fillStyle = C.ink; g.font = '700 11px system-ui'; g.textAlign = 'center'; g.fillText('불기둥', lx, ly); g.textAlign = 'left';
  }
  function drawFar(F, r) {
    const E = earthFar(), [sx, sy] = [F.cx, F.cy];
    g.setLineDash([2, 6]); g.strokeStyle = C.soft; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + F.k + 6, sy); g.lineTo(E.x - 6, E.y); g.stroke(); g.setLineDash([]);
    drawEarthAt(E.x, E.y, F.k * EARTH_R, false);
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText('지구(점)', E.x, E.y + 22);
    g.fillStyle = C.dim; g.font = '600 11px system-ui';
    g.fillText(`실제로는 태양 ${Math.round(SUN_EARTH / SUN_DIAM)}개만큼 떨어져 있어요`, (sx + E.x) / 2, sy - 14);
    if (!r.glare) g.fillText('태양을 누르면 빛 한 줄기를 쏴요', sx, sy + F.k + 22);
    if (S.light != null) {
      const T = lightSeconds(), f = Math.min(1, S.light / T), x = sx + F.k + (E.x - sx - F.k) * f;
      g.fillStyle = C.hi; g.beginPath(); g.arc(x, sy, 4, 0, 7); g.fill();
      g.strokeStyle = 'rgba(242,244,248,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + F.k, sy); g.lineTo(x, sy); g.stroke();
      const s = Math.round(Math.min(T, S.light)), m = Math.floor(s / 60);
      g.fillStyle = C.hi; g.font = '800 14px system-ui'; g.fillText(`${m}분 ${s - m * 60}초`, (sx + E.x) / 2, sy + 26);
    }
    g.textAlign = 'left';
  }
  function drawThermo() {
    const x = VIEW.x + VIEW.w - 132, y = VIEW.y + 30;
    g.fillStyle = 'rgba(11,13,18,.85)'; g.fillRect(x - 6, y - 4, 128, 52);
    g.strokeStyle = C.line; g.lineWidth = 2; g.strokeRect(x, y + 4, 8, 34); g.fillStyle = C.hi; g.fillRect(x + 2, y + 12, 4, 26);
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'left';
    g.fillText(`주변 ${SURFACE_TEMP.toLocaleString('ko-KR')}도`, x + 16, y + 18); g.fillText(`흑점 ${SPOT_TEMP.toLocaleString('ko-KR')}도쯤`, x + 16, y + 36);
  }
  function drawPanel() {
    frame(PANEL, '조종판');
    const h = handles(), L = h.lever, D = h.dial, T = h.tray, c = cut();
    // 거리 레버
    g.fillStyle = '#12151c'; g.beginPath(); g.roundRect(L.x - 7, L.y0 - 6, 14, L.y1 - L.y0 + 12, 7); g.fill(); g.strokeStyle = C.soft; g.lineWidth = 1; g.stroke();
    g.font = '600 11px system-ui'; g.textAlign = 'left';
    [['멀리', 1 / 6, 'far'], ['가장자리', 0.5, 'limb'], ['표면 위', 5 / 6, 'surface']].forEach(([t, f, id]) => { g.fillStyle = c === id ? C.hi : C.dim; g.fillText(t, L.x + 27, L.y0 + (L.y1 - L.y0) * f + 4); });
    for (const f of [1 / 3, 2 / 3]) { g.strokeStyle = C.soft; g.beginPath(); g.moveTo(L.x + 9, L.y0 + (L.y1 - L.y0) * f); g.lineTo(L.x + 16, L.y0 + (L.y1 - L.y0) * f); g.stroke(); }
    g.fillStyle = '#6b7280'; g.fillRect(L.x - 3, L.y0 - 4, 6, L.ky - L.y0 + 4);
    g.fillStyle = S.grab === 'lever' ? C.hi : C.metal; g.beginPath(); g.roundRect(L.x - 20, L.ky - 8, 40, 16, 6); g.fill();
    g.fillStyle = C.dim; g.textAlign = 'center'; g.fillText('거리', L.x, L.y1 + 22);
    // 색유리 다이얼: 멈춤 넷에 색유리 조각
    FILTER_ORDER.forEach((f, i) => {
      const a = DET[i], gx = D.x + Math.sin(a) * (D.r + 14), gy = D.y - Math.cos(a) * (D.r + 14);
      g.fillStyle = GLASS[f]; g.strokeStyle = S.filter === f ? C.hi : C.soft; g.lineWidth = 2; g.beginPath(); g.arc(gx, gy, 7, 0, 7); g.fill(); g.stroke();
      g.fillStyle = S.filter === f ? C.hi : C.dim; g.font = '600 10px system-ui';
      const lx = D.x + Math.sin(a) * (D.r + 30), ly = D.y - Math.cos(a) * (D.r + 30) + (Math.abs(a) > 1.2 ? 18 : 0);
      g.fillText(FILTERS[f].name.replace('색유리 ', ''), lx, ly);
    });
    const dg = g.createRadialGradient(D.x - D.r * 0.3, D.y - D.r * 0.3, 2, D.x, D.y, D.r);
    dg.addColorStop(0, S.grab === 'dial' ? '#e4e7ec' : '#bfc4cd'); dg.addColorStop(1, '#5b6270');
    g.fillStyle = dg; g.beginPath(); g.arc(D.x, D.y, D.r, 0, 7); g.fill();
    g.strokeStyle = '#111'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(D.x, D.y); g.lineTo(D.x + Math.sin(D.a) * D.r * 0.8, D.y - Math.cos(D.a) * D.r * 0.8); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText('색유리', D.x, D.y + D.r + 20);
    // 지구 받침
    g.fillStyle = '#12151c'; g.beginPath(); g.arc(T.x, T.y, T.r + 8, 0, 7); g.fill(); g.strokeStyle = C.soft; g.lineWidth = 1; g.stroke();
    if (!(S.grab === 'earth' && !S.earth)) { g.fillStyle = '#7f9cc4'; g.beginPath(); g.arc(T.x, T.y, T.r * 0.62, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(T.x - T.r * 0.2, T.y - T.r * 0.2, T.r * 0.22, 0, 7); g.fill(); }
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText(S.mode === 'line' ? '지구 줄 — 창 위를 끌기' : '지구 — 끌어다 놓기', T.x, T.y + T.r + 24);
    g.textAlign = 'left';
  }

  addEventListener('resize', layout); layout(); update();
  return { S, step, draw, showMission, set, update, handles, frameOf, toS: (x, y) => toS(x, y), putEarth, putLine, photo, shoot, layout, res: () => S.res };
}
