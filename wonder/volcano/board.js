/* 케이원더 · 화산 속 — 묶음 ㄱ 손잡이 판(회색 도형). 그림·지형은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 산을 잘라 본 단면: 마그마 방, 올라오는 길, 꼭대기, 왼쪽 숲, 오른쪽 바다, 끌어 옮기는 무인기.
 * 오른쪽(아래) = 조종판: 끈적임 레버 · 기체 밸브(돌리는 바퀴) · 밀어 올리는 펌프 손잡이 · 압력 바늘.
 */
import { createVolcano, beginMission, setHandles, stepVolcano, sayFor, fastForward, droneLook, pushMax, MISSIONS, WHY, FOREST, SEA, FOOT, CLOUD, START } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = { mi: 0, free: false, V: stepVolcano(createVolcano({ seed: 7 }), 3), drag: null, drone: null, droneMsg: null, judgeAt: 0, lastSay: '', lastTell: '', anim: 0, done: false };
  let W = 0, H = 0, dpr = 1, SEC = null, PAN = null, barsAt = '', CELLS = [];
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', rock: '#2a2f39', rock2: '#353b47', lava: '#d8b48a', lavaHot: '#f0d2a8', crust: '#4a505c', sea: '#1f2834', tree: '#6f7784', green: '#7d8f78' };

  // ── 자리 셈
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12, h = H - top - bottom;
    if (W >= H * 1.15) { SEC = { x: 8, y: top, w: W * 0.64 - 12, h }; PAN = { x: W * 0.64 + 4, y: top, w: W * 0.36 - 12, h }; }
    else { SEC = { x: 8, y: top, w: W - 16, h: h * 0.52 }; PAN = { x: 8, y: top + h * 0.52 + 6, w: W - 16, h: h * 0.48 - 6 }; }
    CELLS = cells({ x: PAN.x + 4, y: PAN.y + 24, w: PAN.w - 8, h: PAN.h - 28 }, 4);
    if (!S.drone || S.drone.parked) S.drone = { ...parkAt(), parked: true };
  }
  function cells(r, n) {      // 칸 나누기: 가장 작은 변이 가장 크도록
    let best = null;
    for (let cols = 1; cols <= n; cols++) { const rows = Math.ceil(n / cols), w = r.w / cols, h = r.h / rows, s = Math.min(w, h * 1.1); if (!best || s > best.s) best = { cols, rows, w, h, s }; }
    return Array.from({ length: n }, (_, i) => ({ x: r.x + (i % best.cols) * best.w, y: r.y + Math.floor(i / best.cols) * best.h, w: best.w, h: best.h }));
  }
  const parkAt = () => ({ x: SEC.x + SEC.w - 46, y: SEC.y + 52 });
  const ground = () => SEC.y + SEC.h * 0.7;
  const skyTop = () => SEC.y + 26;
  const cx = () => SEC.x + SEC.w * 0.5;
  const U = () => SEC.w * 0.47;                                          // 거리 1 = 몇 px
  const peakH = () => SEC.h * 0.34 * S.V.cone.h;
  const foot = () => FOOT * S.V.cone.w;
  /** 비탈 위 거리 d 의 땅 높이(y) */
  const yAt = d => { const f = foot(); return d < f ? ground() - peakH() * (1 - d / f) : ground(); };
  const xAt = (d, side) => cx() + side * d * U();
  const summitY = () => ground() - peakH() - (S.V.bulge * 8);

  // ── 손잡이(조종판 위의 물건)
  // 칸 하나 = 제목(위) + 작은 글(제목 밑) + 물건 자리(그 아래)
  const room = c => ({ x0: c.x + 6, x1: c.x + c.w - 6, y0: c.y + 36, y1: c.y + c.h - 6, cx: c.x + c.w / 2, w: c.w - 12, h: c.h - 42 });
  const leverG = c => { const r = room(c), L = Math.max(24, Math.min(r.w * 0.42, r.h * 0.78)); return { px: r.cx, py: r.y1 - 16, L }; };
  const valveG = c => { const r = room(c); return { x: r.cx, y: (r.y0 + r.y1) / 2, R: Math.max(14, Math.min(r.w, r.h) / 2 - 10) }; };
  const pumpG = c => { const r = room(c), y0 = r.y0, y1 = r.y1; return { x: r.cx - Math.min(14, r.w * 0.08), y0, y1, top: y0 + 12, bot: y0 + (y1 - y0) * 0.6 }; };
  const gaugeG = c => { const r = room(c); return { x: r.cx, y: (r.y0 + r.y1) / 2 + 4, R: Math.max(16, Math.min(r.w, r.h) / 2 - 4) }; };
  const LEVER_A = 55 * Math.PI / 180, VALVE_MAX = Math.PI * 1.5;
  const HANDLES = {
    visc: { cell: 0, label: '끈적임 레버' },
    gas:  { cell: 1, label: '기체 밸브' },
    push: { cell: 2, label: '밀어 올리는 힘' },
  };
  /** 손잡이를 값 v 로 옮기려면 어디를 짚어 어디로 끌까(시험·도움말용) */
  function where(name, v) {
    const c = CELLS[HANDLES[name].cell];
    if (name === 'visc') { const G = leverG(c), a0 = (S.V.visc * 2 - 1) * LEVER_A, a1 = (v * 2 - 1) * LEVER_A; return { from: [G.px + Math.sin(a0) * G.L, G.py - Math.cos(a0) * G.L], to: [G.px + Math.sin(a1) * G.L, G.py - Math.cos(a1) * G.L] }; }
    if (name === 'gas') { const G = valveG(c), r = G.R * 0.8, a0 = -Math.PI / 2 + S.V.gas * VALVE_MAX, steps = [];
      const a1 = -Math.PI / 2 + v * VALVE_MAX, n = 12; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; steps.push([G.x + Math.cos(a) * r, G.y + Math.sin(a) * r]); }
      return { from: steps[0], to: steps[n], path: steps }; }
    const G = pumpG(c), m = pushMax(S.V), yOf = p => G.top + (G.bot - G.top) * (p / m);
    return { from: [G.x, yOf(S.V.push) - 6], to: [G.x, yOf(Math.min(v, m)) - 6] };
  }
  function grabHandle(x, y) {
    for (const [name, h] of Object.entries(HANDLES)) {
      const c = CELLS[h.cell];
      if (x < c.x || x > c.x + c.w || y < c.y || y > c.y + c.h) continue;
      if (name === 'gas') { const G = valveG(c); return { name, last: Math.atan2(y - G.y, x - G.x) }; }
      return { name };
    }
    return null;
  }
  function moveHandle(d, x, y) {
    const c = CELLS[HANDLES[d.name].cell];
    if (d.name === 'visc') { const G = leverG(c), a = Math.max(-LEVER_A, Math.min(LEVER_A, Math.atan2(x - G.px, G.py - y))); setHandles(S.V, { visc: (a / LEVER_A + 1) / 2 }); }
    else if (d.name === 'gas') {
      const G = valveG(c), a = Math.atan2(y - G.y, x - G.x); let da = a - d.last; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; d.last = a;
      setHandles(S.V, { gas: S.V.gas + da / VALVE_MAX });
    } else { const G = pumpG(c), f = (y + 6 - G.top) / (G.bot - G.top); setHandles(S.V, { push: Math.max(0, Math.min(1, f)) * pushMax(S.V) }); }
  }

  // ── 의뢰
  function showMission() {
    if (S.mi < MISSIONS.length) { beginMission(S.V, S.mi); ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say); }   // 귀띔은 해 본 뒤에만
    else ui.note('자유롭게 해 보세요', '밀어 올리는 힘이 두 배까지 풀렸어요');
    S.lastTell = ''; S.judgeAt = 0;
    ui.freeMode(S.free);
  }
  function succeed(i) {
    S.mi = i + 1; S.done = true; if (S.mi >= MISSIONS.length) { S.free = true; S.V.free = true; }
    ui.note('성공! ⭐', ['용암 강이 바다까지 갔어요.', '불 분수가 솟았어요.', '산꼭대기가 날아갔어요. 끈적한 용암에 갇힌 기체가 한꺼번에 터졌어요.'][i]);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    setTimeout(() => { S.done = false; showMission(); }, 8000);
  }
  function judge() {
    if (S.mi >= MISSIONS.length || S.done) return;
    const m = MISSIONS[S.mi];
    if (m.ok(S.V)) return succeed(S.mi);
    if (S.judgeAt && S.V.t >= S.judgeAt) {
      S.judgeAt = S.V.t + 2;
      const tell = m.tell(S.V);
      if (tell !== S.lastTell) { S.lastTell = tell; ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, tell + ' · 귀띔: ' + m.hint); }
    }
  }

  // ── 무인기
  function droneSpot(x, y) {
    const sy = summitY();
    if (Math.abs(x - cx()) < 42 && y < sy + 6 && y > sy - 130) return 'crater';
    const f = S.V.flow;
    const far = Math.max(f.front, f.cover);
    for (const side of [-1, 1]) {
      const d = (x - cx()) / (side * U());
      if (d > 0.03 && d <= far + 0.02) { const gy = yAt(d); if (y < gy + 8 && y > gy - 70) return 'flow'; }
    }
    return 'air';
  }
  function droneSays() {
    const spot = droneSpot(S.drone.x, S.drone.y), d = droneLook(S.V, spot);
    S.droneMsg = { text: d.text, at: S.V.t, spot };
  }

  // ── 손
  const cap = e => { try { cv.setPointerCapture(e.pointerId); } catch {} };
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    const [x, y] = P(e);
    if (S.drag) return;                                                    // 두 번째 손가락은 무시
    if (S.drone && Math.hypot(x - S.drone.x, y - S.drone.y) < 32) { S.drag = { name: 'drone', id: e.pointerId, dx: S.drone.x - x, dy: S.drone.y - y }; cap(e); return; }
    const h = grabHandle(x, y); if (h) { h.id = e.pointerId; S.drag = h; moveHandle(h, x, y); cap(e); }
  });
  cv.addEventListener('pointermove', e => {
    if (!S.drag || e.pointerId !== S.drag.id) return; const [x, y] = P(e);
    if (S.drag.name === 'drone') { S.drone = { x: Math.max(SEC.x + 14, Math.min(SEC.x + SEC.w - 14, x + S.drag.dx)), y: Math.max(SEC.y + 30, Math.min(SEC.y + SEC.h - 10, y + S.drag.dy)), parked: false }; droneSays(); }
    else moveHandle(S.drag, x, y);
  });
  const up = e => { if (!S.drag || e.pointerId !== S.drag.id) return; if (S.drag.name === 'drone') droneSays(); else S.judgeAt = S.V.t + 1.5; S.drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  // ── 돌리기
  function text() {
    if (S.droneMsg && S.V.t - S.droneMsg.at < 3) {
      if (S.droneMsg.spot !== 'air') { const d = droneLook(S.V, S.droneMsg.spot); S.droneMsg.text = d.text; }
      return S.droneMsg.text;
    }
    return sayFor(S.V);
  }
  function step(dt) {
    S.anim += dt; stepVolcano(S.V, dt);
    if (S.drone && !S.drone.parked && S.droneMsg && S.V.t - S.droneMsg.at > 2.5) { const spot = droneSpot(S.drone.x, S.drone.y); if (spot !== 'air') droneSays(); }
    const t = text(); if (t !== S.lastSay) { S.lastSay = t; ui.say(t); }
    judge();
  }
  function ffwd() { fastForward(S.V); S.droneMsg = null; const t = sayFor(S.V); S.lastSay = t; ui.say(t); }
  function reset() { S.V = createVolcano({ seed: 7, free: S.free }); S.drone = { ...parkAt(), parked: true }; S.droneMsg = null; S.lastSay = ''; }

  // ── 그리기(회색 도형)
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawSection(); drawPanel();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(label, r.x + 10, r.y + 18); }
  const blob = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, 7); g.fill(); };
  function drawSection() {
    const V = S.V;
    frame(SEC, '산을 잘라 본 단면 — 무인기는 끌어 옮겨요');
    g.save(); g.beginPath(); g.rect(SEC.x, SEC.y, SEC.w, SEC.h); g.clip();
    const shake = V.tremor ? Math.sin(S.anim * 60) * 1.6 : 0;
    g.translate(shake, 0);
    const gy = ground(), X = cx(), sy = summitY(), f = foot(), top = skyTop(), skyH = gy - top;
    // 구름 높이
    const cloudY = gy - CLOUD * skyH;
    g.setLineDash([4, 6]); g.strokeStyle = C.soft; g.lineWidth = 1; g.beginPath(); g.moveTo(SEC.x, cloudY); g.lineTo(SEC.x + SEC.w, cloudY); g.stroke(); g.setLineDash([]);
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText('구름 높이', SEC.x + 10, cloudY - 5);
    // 땅속
    g.fillStyle = '#14171e'; g.fillRect(SEC.x, gy, SEC.w, SEC.y + SEC.h - gy);
    // 바다(오른쪽)
    const seaX = xAt(0.9, 1);
    g.fillStyle = C.sea; g.fillRect(seaX, gy + 2, SEC.x + SEC.w - seaX, SEC.y + SEC.h - gy);
    g.strokeStyle = '#3a4656'; g.lineWidth = 1.5; g.beginPath();
    for (let x = seaX; x <= SEC.x + SEC.w; x += 4) { const y = gy + 2 + Math.sin(x / 9 + S.anim * 2) * 1.5; x === seaX ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    g.fillStyle = C.dim; g.fillText('바다', Math.min(SEC.x + SEC.w - 34, seaX + 10), gy + 18);
    for (let i = 0; i < Math.min(14, Math.floor(V.sea.pillows)); i++) { g.fillStyle = '#3c3f46'; g.beginPath(); g.ellipse(seaX + 6 + (i % 7) * 11, gy + 26 + Math.floor(i / 7) * 9, 6, 4, 0, 0, 7); g.fill(); }
    if (V.sea.steam > 0) for (let i = 0; i < 6; i++) blob(seaX + 4 + i * 8, gy - 10 - ((S.anim * 18 + i * 13) % 50), 6 + i % 3 * 2, `rgba(200,205,214,${0.35 * V.sea.steam})`);
    // 숲(왼쪽)
    for (let i = 0; i < 7; i++) {
      const d = 0.4 + i * 0.035, x = xAt(d, -1);
      if (V.forest.burnt) { g.fillStyle = '#26292f'; g.fillRect(x - 1.5, gy - 6, 3, 6); if (i < V.forest.molds) { g.strokeStyle = C.dim; g.lineWidth = 1; g.beginPath(); g.ellipse(x, gy + 6, 2.5, 5, 0, 0, 7); g.stroke(); } }
      else { g.fillStyle = V.regrow ? C.green : C.tree; g.beginPath(); g.moveTo(x, gy - 22); g.lineTo(x - 7, gy); g.lineTo(x + 7, gy); g.closePath(); g.fill(); }
    }
    g.fillStyle = C.dim; g.fillText('숲', xAt(0.62, -1) - 6, gy + 26);
    // 마그마 방 · 올라오는 길
    const chY = gy + (SEC.y + SEC.h - gy) * 0.6, p = V.pressure;
    const magma = `rgb(${Math.round(120 + 100 * p)},${Math.round(100 + 40 * p)},${Math.round(80 + 10 * p)})`;
    g.fillStyle = magma; g.beginPath(); g.ellipse(X, chY, Math.min(80, SEC.w * 0.12), Math.max(10, (SEC.y + SEC.h - gy) * 0.22), 0, 0, 7); g.fill();
    g.fillStyle = C.dim; g.fillText('마그마 방', X + Math.min(80, SEC.w * 0.12) + 6, chY + 4);
    // 산
    g.fillStyle = C.rock; g.strokeStyle = C.line; g.lineWidth = 1.5; g.beginPath();
    g.moveTo(xAt(f, -1), gy); g.lineTo(X - 10, sy); g.lineTo(X + 10, sy); g.lineTo(xAt(f, 1), gy); g.closePath(); g.fill(); g.stroke();
    if (V.summitLost) { g.fillStyle = C.bg; g.beginPath(); g.moveTo(X - 26, sy - 1); g.lineTo(X, sy + 12); g.lineTo(X + 26, sy - 1); g.closePath(); g.fill(); }
    g.fillStyle = magma; g.fillRect(X - 4, sy + 2, 8, chY - sy - 6);
    // 재 덮인 땅 · 다시 돋는 풀
    if (V.ash > 0) { g.fillStyle = '#5b5f68'; g.fillRect(SEC.x, gy - 2, seaX - SEC.x, 3); }
    if (V.regrow) for (let x = SEC.x + 6; x < seaX; x += 9) { g.strokeStyle = C.green; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, gy); g.lineTo(x - 2, gy - 5); g.moveTo(x, gy); g.lineTo(x + 2, gy - 5); g.stroke(); }
    // 굳은 용암(지난 흐름) · 흐르는 용암
    const lavaLine = (to, col, w) => { for (const side of [-1, 1]) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); for (let d = 0.02; d <= to + 1e-6; d += 0.01) { const x = xAt(d, side), y = yAt(d) - w / 2; d < 0.025 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.lineCap = 'butt'; } };
    if (V.flow.cover > 0.03) lavaLine(Math.min(V.flow.cover, 1), '#3d4049', 5);
    if (V.mode === 'flow' && V.flow.front > 0.03) {
      if (V.flow.tube) { lavaLine(V.flow.front, C.crust, 8); lavaLine(V.flow.front, C.lava, 2.5); }
      else lavaLine(V.flow.front, C.lava, 6);
      // 용암 호수(꼭대기 구멍)
      g.fillStyle = V.lake.open ? C.lavaHot : '#2c2f36'; g.beginPath(); g.ellipse(X, sy + 1, 11, 3.5, 0, 0, 7); g.fill();
      if (!V.lake.open) { g.strokeStyle = C.lava; g.lineWidth = 1; g.beginPath(); g.moveTo(X - 6, sy); g.lineTo(X + 1, sy + 2); g.lineTo(X + 7, sy); g.stroke(); }
    }
    // 용암 혹
    if (V.dome > 0.01) { g.fillStyle = '#4b4f58'; g.strokeStyle = C.lava; g.lineWidth = 1; g.beginPath(); g.arc(X, sy + 2, 6 + V.dome * 22, Math.PI, 0); g.fill(); g.stroke(); }
    // 불 분수
    if (V.fountainH > 0.02) {
      const hh = V.fountainH * SEC.h * 0.32;
      for (let i = 0; i < 40; i++) { const ph = (S.anim * 1.4 + i / 40) % 1, side = (i % 2 ? 1 : -1) * (0.2 + (i * 37 % 10) / 14), x = X + side * ph * 26, y = sy - (4 * ph * (1 - ph)) * hh; blob(x, y, 2.2, i % 3 ? C.lava : C.lavaHot); }
    }
    // 재 기둥 · 번개 · 무너져 내리는 잿빛 구름
    if (V.column) {
      const Cn = V.column, hh = Cn.h * skyH * (Cn.collapsed ? Math.max(0.3, 1 - Cn.slide * 0.6) : 1);
      for (let i = 0; i < 16; i++) { const f2 = i / 15, y = sy - f2 * hh; blob(X + Math.sin(i * 1.7 + S.anim) * 4 * f2, y, 10 + f2 * 34, `rgba(150,154,162,${0.55 - f2 * 0.15})`); }
      if (Cn.flash > 0) { g.strokeStyle = C.hi; g.lineWidth = 2; g.beginPath(); let x = X + 20, y = sy - hh * 0.85; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (k % 2 ? -1 : 1) * 12; y += hh * 0.08; g.lineTo(x, y); } g.stroke(); }
      if (Cn.collapsed) for (const side of [-1, 1]) for (let i = 0; i < 9; i++) { const d = (i / 8) * (0.15 + Cn.slide * 0.55), x = xAt(d, side); blob(x, yAt(d) - 10, 12 - i * 0.6, 'rgba(120,124,132,.75)'); }
      g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('번개 ' + V.bolts + '번', X + 50, Math.max(SEC.y + 40, sy - hh * 0.8));
    }
    // 무인기
    if (S.drone) {
      const { x, y } = S.drone;
      g.fillStyle = S.drag?.name === 'drone' ? C.hi : '#aeb4bf'; g.fillRect(x - 10, y - 4, 20, 8);
      g.strokeStyle = '#aeb4bf'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 10, y - 4); g.lineTo(x - 16, y - 9); g.moveTo(x + 10, y - 4); g.lineTo(x + 16, y - 9); g.stroke();
      g.beginPath(); g.ellipse(x - 16, y - 10, 7, 2, 0, 0, 7); g.ellipse(x + 16, y - 10, 7, 2, 0, 0, 7); g.stroke();
      if (S.drone.parked) { g.strokeStyle = 'rgba(242,244,248,' + (0.3 + 0.25 * Math.sin(S.anim * 3)) + ')'; g.beginPath(); g.arc(x, y - 3, 24, 0, 7); g.stroke(); }
      g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('무인기', x, y + 18); g.textAlign = 'left';
    }
    g.restore();
  }
  function label(c, t, sub) { g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText(t, c.x + c.w / 2, c.y + 14); if (sub) { g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText(sub, c.x + c.w / 2, c.y + 29); } g.textAlign = 'left'; }
  function drawPanel() {
    frame(PAN, '조종판');
    const V = S.V, on = n => S.drag?.name === n;
    // 1 끈적임 레버
    let c = CELLS[0], G = leverG(c), a = (V.visc * 2 - 1) * LEVER_A;
    label(c, '끈적임 레버');
    g.strokeStyle = C.soft; g.lineWidth = 3; g.beginPath(); g.arc(G.px, G.py, G.L * 0.55, -Math.PI / 2 - LEVER_A, -Math.PI / 2 + LEVER_A); g.stroke();
    g.fillStyle = '#272c35'; g.fillRect(G.px - 22, G.py - 6, 44, 14);
    g.strokeStyle = '#9aa1ae'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(G.px, G.py); g.lineTo(G.px + Math.sin(a) * G.L, G.py - Math.cos(a) * G.L); g.stroke(); g.lineCap = 'butt';
    blob(G.px + Math.sin(a) * G.L, G.py - Math.cos(a) * G.L, 11, on('visc') ? C.hi : '#c3c8d2');
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center';
    g.textAlign = 'left'; g.fillText('묽게', c.x + 8, G.py + 14); g.textAlign = 'right'; g.fillText('끈적하게', c.x + c.w - 8, G.py + 14); g.textAlign = 'left';
    // 2 기체 밸브(돌리는 바퀴)
    c = CELLS[1]; const Vg = valveG(c), rot = V.gas * VALVE_MAX;
    label(c, '기체 밸브', V.gas < 0.5 ? '조금 열림' : '많이 열림');
    g.strokeStyle = C.soft; g.lineWidth = 4; g.beginPath(); g.arc(Vg.x, Vg.y, Vg.R + 8, -Math.PI / 2, -Math.PI / 2 + VALVE_MAX); g.stroke();
    g.strokeStyle = '#c3c8d2'; g.lineWidth = 4; g.beginPath(); g.arc(Vg.x, Vg.y, Vg.R + 8, -Math.PI / 2, -Math.PI / 2 + rot); g.stroke();
    g.strokeStyle = on('gas') ? C.hi : '#9aa1ae'; g.lineWidth = 5; g.beginPath(); g.arc(Vg.x, Vg.y, Vg.R, 0, 7); g.stroke();
    g.lineWidth = 3; for (let k = 0; k < 5; k++) { const b = rot + k * Math.PI * 2 / 5 - Math.PI / 2; g.beginPath(); g.moveTo(Vg.x, Vg.y); g.lineTo(Vg.x + Math.cos(b) * Vg.R, Vg.y + Math.sin(b) * Vg.R); g.stroke(); }
    blob(Vg.x, Vg.y, 6, '#c3c8d2'); blob(Vg.x + Math.cos(rot - Math.PI / 2) * Vg.R, Vg.y + Math.sin(rot - Math.PI / 2) * Vg.R, 6, on('gas') ? C.hi : '#d9dde6');
    // 3 펌프 손잡이(눌러 내릴수록 세게)
    c = CELLS[2]; const Pg = pumpG(c), m = pushMax(V), hy = Pg.top + (Pg.bot - Pg.top) * (V.push / m);
    label(c, '밀어 올리는 힘', S.free ? '자유: 두 배까지' : '');
    g.fillStyle = '#272c35'; g.strokeStyle = C.line; g.lineWidth = 1.5; g.beginPath(); g.roundRect(Pg.x - 14, Pg.bot - 4, 28, Pg.y1 - Pg.bot, 4); g.fill(); g.stroke();
    g.strokeStyle = '#9aa1ae'; g.lineWidth = 5; g.beginPath(); g.moveTo(Pg.x, hy); g.lineTo(Pg.x, Pg.bot); g.stroke();
    g.fillStyle = on('push') ? C.hi : '#c3c8d2'; g.beginPath(); g.roundRect(Pg.x - 26, hy - 12, 52, 12, 5); g.fill();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'left';
    g.fillText('약하게', Pg.x + 30, Pg.top + 2); g.fillText('세게', Pg.x + 30, Pg.bot + 2);
    // 4 압력 바늘
    c = CELLS[3]; const GG = gaugeG(c), gx = GG.x, gyy = GG.y, R = GG.R;
    label(c, '압력', V.pressure > 0.75 ? '위험!' : V.pressure > 0.4 ? '오르는 중' : '낮음');
    g.fillStyle = '#12151c'; g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.arc(gx, gyy, R, 0, 7); g.fill(); g.stroke();
    const A0 = Math.PI * 0.75, A1 = Math.PI * 2.25;
    g.strokeStyle = '#e6e9ef'; g.lineWidth = 5; g.beginPath(); g.arc(gx, gyy, R - 6, A0 + (A1 - A0) * 0.8, A1); g.stroke();
    g.strokeStyle = C.soft; g.lineWidth = 2; for (let k = 0; k <= 10; k++) { const b = A0 + (A1 - A0) * k / 10; g.beginPath(); g.moveTo(gx + Math.cos(b) * (R - 3), gyy + Math.sin(b) * (R - 3)); g.lineTo(gx + Math.cos(b) * (R - 9), gyy + Math.sin(b) * (R - 9)); g.stroke(); }
    const nb = A0 + (A1 - A0) * Math.min(1, V.pressure) + (V.tremor ? Math.sin(S.anim * 40) * 0.03 : 0);
    g.strokeStyle = C.hi; g.lineWidth = 3; g.beginPath(); g.moveTo(gx, gyy); g.lineTo(gx + Math.cos(nb) * (R - 8), gyy + Math.sin(nb) * (R - 8)); g.stroke(); blob(gx, gyy, 4, C.hi);
  }

  addEventListener('resize', layout); layout();
  return { S, step, draw, showMission, layout, where, ffwd, reset, droneSpot,
    get V() { return S.V; },
    set(h) { setHandles(S.V, h); S.judgeAt = S.V.t + 1.5; },
    /** 무인기를 'crater'(꼭대기 구멍) · 'flow'(흐르는 용암) 위로 옮긴 자리 */
    droneTo(spot) {
      const p = spot === 'crater' ? [cx(), summitY() - 40] : spot === 'flow' ? (() => { const d = Math.min(0.2, Math.max(S.V.flow.front, 0.1) * 0.6); return [xAt(d, 1), yAt(d) - 24]; })() : [parkAt().x, parkAt().y];
      return p;
    },
  };
}
