/* 케이원더 · 폭풍 만들기 — 묶음 ㄱ 손잡이 판(회색 도형). 구름·번개 그림은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽 위(세로 화면이면 맨 위) = 관측 차량에서 본 하늘(비스듬히 본 옆모습, 높이 km)
 * 왼쪽 아래(가운데) = 위에서 본 땅: 폭풍 자리, 농가, 풍차, 차량, 토네이도 길
 * 오른쪽(아래) = 조종판: 땅 데우기 손잡이(돌리는 꼭지) · 물기 밸브(돌리는 바퀴) · 위 바람 나침반
 */
import { createStorm, beginMission, setHandles, stepStorm, sayFor, shearOf, steerOf, handleMax, hailName, MISSIONS, WHY, FARM, MILL, CAR, PASS_R } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const fresh = (free = false) => stepStorm(setHandles(createStorm({ seed: 11, free }), { heat: 0.7, moist: 0.5, shear: 0 }), 8);
  const S = { mi: 0, free: false, W: fresh(), cell: { x: 0, y: 0 }, drag: null, judgeAt: 0, lastSay: '', lastTell: '', anim: 0, done: false };
  let W = 0, H = 0, dpr = 1, SKY = null, MAP = null, PAN = null, barsAt = '', CELLS = [];
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', ground: '#1c2027', cloud: '#9aa1ae', dark: '#4a505c', knob: '#c3c8d2' };

  // ── 자리 셈
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12, h = H - top - bottom;
    if (W >= H * 1.15) {
      const lw = W * 0.62 - 12;
      SKY = { x: 8, y: top, w: lw, h: h * 0.6 }; MAP = { x: 8, y: top + h * 0.6 + 6, w: lw, h: h * 0.4 - 6 }; PAN = { x: W * 0.62 + 4, y: top, w: W * 0.38 - 12, h };
    } else {
      SKY = { x: 8, y: top, w: W - 16, h: h * 0.4 }; MAP = { x: 8, y: top + h * 0.4 + 6, w: W - 16, h: h * 0.24 - 6 }; PAN = { x: 8, y: top + h * 0.64 + 6, w: W - 16, h: h * 0.36 - 6 };
    }
    CELLS = cells({ x: PAN.x + 4, y: PAN.y + 24, w: PAN.w - 8, h: PAN.h - 28 }, 3);
  }
  function cells(r, n) {
    let best = null;
    for (let cols = 1; cols <= n; cols++) { const rows = Math.ceil(n / cols), w = r.w / cols, h = r.h / rows, s = Math.min(w, h * 1.1); if (!best || s > best.s) best = { cols, rows, w, h, s }; }
    return Array.from({ length: n }, (_, i) => ({ x: r.x + (i % best.cols) * best.w, y: r.y + Math.floor(i / best.cols) * best.h, w: best.w, h: best.h }));
  }
  const room = c => ({ cx: c.x + c.w / 2, cy: c.y + 36 + (c.h - 42) / 2, R: Math.max(16, Math.min(c.w - 12, c.h - 42) / 2 - 10) });
  // 하늘(비스듬히): 화면 x = 동쪽 x + 북쪽 y × 0.35
  const KM_TOP = 20;
  const gY = () => SKY.y + SKY.h - 18;
  const altY = km => gY() - Math.sqrt(Math.max(0, km) / KM_TOP) * (SKY.h - 44);   // 낮은 하늘을 넓게(구름 바닥·토네이도가 보이게) — 눈금은 km 그대로
  const skyX = (x, y = 0) => SKY.x + 34 + ((x + y * 0.35) + 3) / 13 * (SKY.w - 44);
  // 땅(위에서): 북쪽 위
  const mapK = () => Math.min((MAP.h / 2 - 12) / 5.2, (MAP.w - 30) / 13);
  const mapP = (x, y) => [MAP.x + (MAP.w - 13 * mapK()) / 2 + (x + 2.5) * mapK(), MAP.y + MAP.h / 2 + 4 - y * mapK()];

  // ── 손잡이
  const KNOB_A = 135 * Math.PI / 180, VALVE_MAX = Math.PI * 1.5;
  const HANDLES = { heat: 0, moist: 1, shear: 2 };
  function where(name, v) {
    const c = CELLS[HANDLES[name]], r = room(c);
    if (name === 'heat') { const tip = val => { const a = -KNOB_A + (val / handleMax(S.W)) * 2 * KNOB_A; return [r.cx + Math.sin(a) * r.R * 0.8, r.cy - Math.cos(a) * r.R * 0.8]; };
      const n = 8, a0 = S.W.heat, path = []; for (let i = 0; i <= n; i++) path.push(tip(a0 + (Math.min(v, handleMax(S.W)) - a0) * i / n)); return { from: path[0], to: path[n], path }; }
    if (name === 'moist') { const rr = r.R * 0.8, a0 = -Math.PI / 2 + (S.W.moist / handleMax(S.W)) * VALVE_MAX, a1 = -Math.PI / 2 + (Math.min(v, handleMax(S.W)) / handleMax(S.W)) * VALVE_MAX, n = 12, path = [];
      for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; path.push([r.cx + Math.cos(a) * rr, r.cy + Math.sin(a) * rr]); } return { from: path[0], to: path[n], path }; }
    const tip = th => [r.cx + Math.cos(th) * r.R * 0.85, r.cy - Math.sin(th) * r.R * 0.85];
    let d = v - S.W.shear; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const n = 8, path = []; for (let i = 0; i <= n; i++) path.push(tip(S.W.shear + d * i / n)); return { from: path[0], to: path[n], path };
  }
  function grabHandle(x, y) {
    for (const [name, i] of Object.entries(HANDLES)) {
      const c = CELLS[i]; if (x < c.x || x > c.x + c.w || y < c.y || y > c.y + c.h) continue;
      const r = room(c); return { name, last: Math.atan2(y - r.cy, x - r.cx) };
    }
    return null;
  }
  function moveHandle(d, x, y) {
    const r = room(CELLS[HANDLES[d.name]]), M = handleMax(S.W);
    if (d.name === 'heat') { const a = Math.max(-KNOB_A, Math.min(KNOB_A, Math.atan2(x - r.cx, r.cy - y))); setHandles(S.W, { heat: (a + KNOB_A) / (2 * KNOB_A) * M }); }
    else if (d.name === 'moist') { const a = Math.atan2(y - r.cy, x - r.cx); let da = a - d.last; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; d.last = a; setHandles(S.W, { moist: S.W.moist + da / VALVE_MAX * M }); }
    else if (Math.hypot(x - r.cx, y - r.cy) > 6) setHandles(S.W, { shear: Math.atan2(-(y - r.cy), x - r.cx) });
  }

  // ── 의뢰
  function showMission() {
    if (S.mi < MISSIONS.length) {                                       // 귀띔은 해 본 뒤에만
      beginMission(S.W, S.mi); if (S.mi === 1) { S.cell = { x: 0, y: 0 }; S.lastSay = ''; }
      ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say, S.mi === 1 ? '새 날이에요. 맑은 하늘에서 다시 키워요.' : '');
    } else { S.W.farmChase = false; ui.note('자유롭게 폭풍을 키워 보세요', '데우기와 물기가 더 세게 풀렸어요'); }
    S.lastTell = ''; S.judgeAt = 0; ui.freeMode(S.free);
  }
  function succeed(i) {
    S.mi = i + 1; S.done = true; if (S.mi >= MISSIONS.length) { S.free = true; S.W.free = true; }
    ui.note('성공! ⭐', [`번개 ${S.W.strikes}번! 구름이 높을수록 전기가 많이 쌓여요.`, `${hailName(S.W.hailMax)}만 한 우박(${S.W.hailMax.toFixed(1)}cm)!`, '토네이도가 농가를 비켜 갔어요. 모는 게 더 어렵지요?'][i]);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    setTimeout(() => { S.done = false; showMission(); }, 8000);
  }
  function judge() {
    if (S.mi >= MISSIONS.length || S.done) return;
    const m = MISSIONS[S.mi];
    if (m.ok(S.W)) return succeed(S.mi);
    if (S.judgeAt && S.W.t >= S.judgeAt) {
      S.judgeAt = S.W.t + 2;
      const tell = m.tell(S.W);
      if (tell !== S.lastTell) { S.lastTell = tell; ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, tell + ' · 귀띔: ' + m.hint); }
    }
  }

  // ── 손
  const cap = e => { try { cv.setPointerCapture(e.pointerId); } catch {} };
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { if (S.drag) return; const [x, y] = P(e), h = grabHandle(x, y); if (h) { h.id = e.pointerId; S.drag = h; if (h.name !== 'moist') moveHandle(h, x, y); cap(e); } });
  cv.addEventListener('pointermove', e => { if (S.drag && e.pointerId === S.drag.id) { const [x, y] = P(e); moveHandle(S.drag, x, y); } });
  const up = e => { if (S.drag && e.pointerId === S.drag.id) { S.drag = null; S.judgeAt = S.W.t + 1.5; } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  // ── 돌리기
  function step(dt) {
    S.anim += dt; stepStorm(S.W, dt);
    // 그림 속 폭풍 세포는 토네이도와 함께 움직이고, 토네이도가 끝나면 제자리에서 다시 자란 것처럼 돌아온다
    const T = S.W.tornado, k = Math.min(1, dt / (T ? 0.3 : 1.5)); S.cell.x += ((T ? T.x : 0) - S.cell.x) * k; S.cell.y += ((T ? T.y : 0) - S.cell.y) * k;
    const t = sayFor(S.W); if (t !== S.lastSay) { S.lastSay = t; ui.say(t); }
    judge();
  }
  function reset() { S.cell = { x: 0, y: 0 }; S.W = setHandles(createStorm({ seed: 11, free: S.free }), { heat: 0, moist: 0, shear: 0 }); S.lastSay = ''; if (S.mi < MISSIONS.length && !S.done) showMission(); }

  // ── 그리기
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawSky(); drawMap(); drawPanel();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(label, r.x + 10, r.y + 18); }
  const blob = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, 7); g.fill(); };
  function windmill(x, y, s, standing) {
    g.strokeStyle = '#aeb4bf'; g.lineWidth = 2;
    if (!standing) { g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 6, y - 3); g.stroke(); return; }
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - s); g.stroke();
    for (let k = 0; k < 4; k++) { const a = S.anim * 2 + k * Math.PI / 2; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + Math.cos(a) * s * 0.5, y - s + Math.sin(a) * s * 0.5); g.stroke(); }
  }
  function house(x, y, s, hit) {
    g.fillStyle = hit ? '#6b7280' : '#aeb4bf'; g.fillRect(x - s / 2, y - s * 0.6, s, s * 0.6);
    if (!hit) { g.beginPath(); g.moveTo(x - s * 0.62, y - s * 0.6); g.lineTo(x, y - s * 1.05); g.lineTo(x + s * 0.62, y - s * 0.6); g.closePath(); g.fill(); }
  }
  function drawSky() {
    const Wd = S.W;
    frame(SKY, '관측 차량에서 본 하늘');
    g.save(); g.beginPath(); g.rect(SKY.x, SKY.y, SKY.w, SKY.h); g.clip();
    const dark = Math.min(1, Math.max(0, (Wd.top - 6) / 8));
    g.fillStyle = `rgba(${40 + dark * 6},${48 + dark * 14},${44 + dark * 4},${0.25 + dark * 0.35})`; g.fillRect(SKY.x, SKY.y + 24, SKY.w, gY() - SKY.y - 24);
    // 높이 눈금
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.strokeStyle = C.grid; g.lineWidth = 1;
    for (const km of [1, 5, 10, 15, 20]) { const y = altY(km); g.beginPath(); g.moveTo(SKY.x + 30, y); g.lineTo(SKY.x + SKY.w, y); g.stroke(); g.fillText(km + 'km', SKY.x + 4, y + 3); }
    // 땅
    const gy = gY(); g.fillStyle = C.ground; g.fillRect(SKY.x, gy, SKY.w, SKY.y + SKY.h - gy);
    // 아지랑이 · 먼지 회오리
    if (Wd.haze) { g.strokeStyle = 'rgba(190,196,206,.35)'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = SKY.x + 30; x < SKY.x + SKY.w; x += 6) { const y = gy - 6 - k * 6 + Math.sin(x / 11 + S.anim * 3 + k) * 2 * Wd.heat; x === SKY.x + 30 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } }
    if (Wd.dust > 0.05) { const x0 = skyX(1.5), hh = 20 + Wd.dust * 45; for (let i = 0; i < 18; i++) { const f = i / 17, a = S.anim * 6 + i; blob(x0 + Math.cos(a) * (3 + f * 10), gy - f * hh, 2, 'rgba(170,160,140,.6)'); } }
    // 땅 위 물건: 차량 · 풍차 · 농가
    g.fillStyle = '#aeb4bf'; const cx0 = skyX(CAR.x, CAR.y); g.fillRect(cx0 - 12, gy - 9, 24, 9); blob(cx0 - 7, gy, 3, '#6b7280'); blob(cx0 + 7, gy, 3, '#6b7280');
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText('차량', cx0, gy + 14);
    windmill(skyX(MILL.x, MILL.y), gy, 26, Wd.mill.standing); g.fillStyle = C.dim; g.fillText('풍차', skyX(MILL.x, MILL.y), gy + 14);
    house(skyX(Wd.farm.x, Wd.farm.y), gy - 2, 18, Wd.farmHit); g.fillStyle = C.dim; g.fillText('농가', skyX(Wd.farm.x, Wd.farm.y), gy + 14); g.textAlign = 'left';
    // 구름
    const X = skyX(S.cell.x, S.cell.y), base = altY(1.5), topY = altY(Wd.top), lit = Wd.icFlash > 0;
    if (Wd.top >= 1) {
      const rot = Wd.rot, col = lit ? '#e6e9ef' : C.cloud;
      if (Wd.top < 8) { const n = Math.max(1, Math.min(5, Math.round(Wd.top / 1.6))); for (let i = 0; i < n; i++) { const x = X + (i - (n - 1) / 2) * 36, r = 8 + (Wd.top - 1) * 2.2; blob(x, base - r * 0.6, r, col); blob(x + r * 0.6, base - r * 0.3, r * 0.7, col); } }
      else {
        const sk = Math.min(1, SKY.w / 600), bw = (30 + (Wd.top - 8) * 3) * sk;
        for (let i = 0; i <= 12; i++) { const f = i / 12, y = base - (base - topY) * f, r = bw * (0.9 - f * 0.3); blob(X + Math.sin(f * 6 + S.anim * rot * 2) * 4, y, r, col); }
        // 모루
        const aw = (30 + (Wd.top - 8) * 14) * sk; g.fillStyle = col; g.beginPath(); g.ellipse(X + aw * 0.3, topY + 4, aw, 9, 0, 0, 7); g.fill();
        // 시커먼 바닥
        g.fillStyle = lit ? '#b9bfca' : '#3a3f48'; g.beginPath(); g.ellipse(X, base, bw * 1.05, 9, 0, 0, 7); g.fill();
        // 비 기둥 · 우박
        if (Wd.rained) { g.strokeStyle = 'rgba(150,158,170,.45)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const x = X - bw * 0.8 + i * bw * 0.12 + 4, off = (S.anim * 300 + i * 23) % 20; g.beginPath(); g.moveTo(x, base + 6 + off); g.lineTo(x - 3, gy); g.stroke(); } }
        if (Wd.hailNow > 0) for (let i = 0; i < 16; i++) { const f = ((S.anim * 0.9 + i / 16) % 1), x = X - bw * 0.6 + (i * 37 % 100) / 100 * bw * 1.2; blob(x, base + 8 + f * (gy - base - 8), 1 + Wd.hailNow * 0.5, '#e6e9ef'); }
        // 도는 구름 · 벽 구름 · 깔때기
        if (rot > 0.05) { g.strokeStyle = 'rgba(230,233,239,' + Math.min(0.9, rot) + ')'; g.lineWidth = 2; const a = S.anim * (0.6 + rot) * Math.sign(Wd.shear || 1); g.beginPath(); g.ellipse(X, base - 6, bw * 1.2, 10, 0, a, a + 2.2); g.stroke(); }
        if (Wd.wall) { g.fillStyle = '#4d535e'; g.fillRect(X - bw * 0.35, base, bw * 0.7, 14 + Wd.rot * 8); }
        if (Wd.funnel > 0 && !Wd.tornado) { const L = (gy - base - 14) * Wd.funnel; g.fillStyle = '#6b7280'; g.beginPath(); g.moveTo(X - 10, base + 14); g.lineTo(X + 10, base + 14); g.lineTo(X + 1, base + 14 + L); g.lineTo(X - 1, base + 14 + L); g.closePath(); g.fill(); }
      }
    }
    // 토네이도(밧줄처럼 휜 깔때기)
    if (Wd.tornado) {
      const T = Wd.tornado, tx = skyX(T.x, T.y), y0 = base + 14;
      g.strokeStyle = '#c9ced8'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath();
      for (let k = 0; k <= 12; k++) { const f = k / 12, x = X + (tx - X) * f + Math.sin(f * 4 + S.anim * 3) * 6 * f, y = y0 + (gy - y0) * f; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.lineCap = 'butt';
      for (let i = 0; i < 10; i++) blob(tx + Math.cos(S.anim * 5 + i) * (6 + i * 1.5), gy - 4 - (i % 4) * 4, 4, 'rgba(160,150,130,.6)');
    }
    // 번개
    if (Wd.bolt && Wd.t - Wd.bolt.t < 0.25) {
      const bx = skyX(Wd.bolt.x, Wd.bolt.y); g.strokeStyle = C.hi; g.lineWidth = 2.5; g.beginPath(); let x = X + (bx - X) * 0.2, y = base;
      g.moveTo(x, y); for (let k = 1; k <= 7; k++) { const f = k / 7; x = X + (bx - X) * (0.2 + 0.8 * f) + (k % 2 ? 7 : -7) * (k < 7); y = base + (gy - base) * f; g.lineTo(x, y); } g.stroke();
    }
    // 무지개
    if (Wd.rainbow && Wd.t - Wd.rainbow < 8) { const a = Math.min(1, (8 - (Wd.t - Wd.rainbow)) / 3); for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(${[220, 200, 170][k]},${[200, 210, 190][k]},${[170, 200, 220][k]},${0.5 * a})`; g.lineWidth = 3; g.beginPath(); g.arc(skyX(3), gy, SKY.h * 0.42 - k * 4, Math.PI, 0); g.stroke(); } }
    // 계기 글자
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'right';
    const info = [`구름 꼭대기 ${Wd.top.toFixed(1)}km`, `번개 ${Wd.strikes}번`]; if (Wd.hailNow > 0 || Wd.hailMax > 0) info.push(`우박 ${Wd.hailNow.toFixed(1)}cm`);
    const tag = (t, x, y, align) => { g.textAlign = align; const w = g.measureText(t).width; g.fillStyle = 'rgba(11,13,18,.72)'; g.fillRect(align === 'right' ? x - w - 4 : x - 4, y - 12, w + 8, 16); g.fillStyle = C.ink; g.fillText(t, x, y); };
    info.forEach((s, i) => tag(s, SKY.x + SKY.w - 10, SKY.y + 18 + i * 16, 'right'));
    g.font = '700 12px system-ui'; tag('관측 차량에서 본 하늘', SKY.x + 10, SKY.y + 18, 'left'); g.textAlign = 'left';
    // 하얀 번쩍
    if (Wd.whiteout > 0) { g.fillStyle = `rgba(255,255,255,${Math.min(0.85, Wd.whiteout * 1.6)})`; g.fillRect(SKY.x, SKY.y, SKY.w, SKY.h); }
    g.restore();
  }
  function drawMap() {
    const Wd = S.W;
    frame(MAP, '위에서 본 땅');
    g.save(); g.beginPath(); g.rect(MAP.x, MAP.y, MAP.w, MAP.h); g.clip();
    const k = mapK(), [ox, oy] = mapP(0, 0);
    // 농가를 지나간 것으로 치는 선
    g.setLineDash([2, 5]); g.strokeStyle = C.soft; g.beginPath(); g.arc(ox, oy, PASS_R * k, -1.2, 1.2); g.stroke(); g.setLineDash([]);
    // 가려는 방향(두 바람의 가운데)
    const st = steerOf(Wd); g.setLineDash([5, 5]); g.strokeStyle = C.line; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(st) * 9 * k, oy - Math.sin(st) * 9 * k); g.stroke(); g.setLineDash([]);
    // 폭풍 자리(구름이 덮은 곳)
    const [sx, sy] = mapP(S.cell.x, S.cell.y);
    g.strokeStyle = Wd.top >= 8 ? C.ink : C.soft; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, Math.max(4, Wd.top * 0.12 * k), 0, 7); g.stroke();
    // 차량 · 풍차 · 농가
    let [x, y] = mapP(CAR.x, CAR.y); g.fillStyle = '#aeb4bf'; g.fillRect(x - 6, y - 3, 12, 6);
    [x, y] = mapP(MILL.x, MILL.y); windmill(x, y + 7, 12, Wd.mill.standing);
    [x, y] = mapP(Wd.farm.x, Wd.farm.y); house(x, y + 5, 12, Wd.farmHit);
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.fillText('농가', x + 10, y + 4); [x, y] = mapP(MILL.x, MILL.y); g.fillText('풍차', x + 10, y + 4); [x, y] = mapP(CAR.x, CAR.y); g.fillText('차량', x - 8, y + 14);
    // 토네이도 길
    const T = Wd.tornado || Wd.lastTornado;
    if (T) {
      g.strokeStyle = Wd.tornado ? C.hi : C.soft; g.lineWidth = 2; g.beginPath(); T.path.forEach(([px, py], i) => { const [a, b] = mapP(px, py); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke();
      if (Wd.tornado) { const [a, b] = mapP(T.x, T.y); blob(a, b, 5, C.hi); }
    }
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'right'; g.fillText('북 ↑  동 →', MAP.x + MAP.w - 8, MAP.y + 18); g.textAlign = 'left';
    g.restore();
  }
  function label(c, t, sub) { g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText(t, c.x + c.w / 2, c.y + 14); if (sub) { g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText(sub, c.x + c.w / 2, c.y + 29); } g.textAlign = 'left'; }
  function arrow(x, y, a, len, col, w) { const ex = x + Math.cos(a) * len, ey = y - Math.sin(a) * len; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(a - 0.45) * 9, ey + Math.sin(a - 0.45) * 9); g.lineTo(ex - Math.cos(a + 0.45) * 9, ey + Math.sin(a + 0.45) * 9); g.closePath(); g.fill(); }
  function drawPanel() {
    const Wd = S.W, M = handleMax(Wd), on = n => S.drag?.name === n;
    frame(PAN, '조종판');
    // 1 땅 데우기 꼭지
    let c = CELLS[0], r = room(c);
    label(c, '땅 데우기(햇볕)', Wd.heat < 0.05 ? '꺼짐' : Wd.heat < 0.5 * M ? '조금' : '세게');
    g.strokeStyle = C.soft; g.lineWidth = 2;
    for (let i = 0; i <= 9; i++) { const a = -KNOB_A + i / 9 * 2 * KNOB_A; g.beginPath(); g.moveTo(r.cx + Math.sin(a) * (r.R + 3), r.cy - Math.cos(a) * (r.R + 3)); g.lineTo(r.cx + Math.sin(a) * (r.R + 3 + i * 0.8), r.cy - Math.cos(a) * (r.R + 3 + i * 0.8)); g.stroke(); }
    blob(r.cx, r.cy, r.R, '#272c35'); g.strokeStyle = on('heat') ? C.hi : '#9aa1ae'; g.lineWidth = 3; g.beginPath(); g.arc(r.cx, r.cy, r.R, 0, 7); g.stroke();
    const ka = -KNOB_A + (Wd.heat / M) * 2 * KNOB_A; g.strokeStyle = on('heat') ? C.hi : C.knob; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(r.cx - Math.sin(ka) * r.R * 0.5, r.cy + Math.cos(ka) * r.R * 0.5); g.lineTo(r.cx + Math.sin(ka) * r.R * 0.8, r.cy - Math.cos(ka) * r.R * 0.8); g.stroke(); g.lineCap = 'butt';
    // 2 물기 밸브
    c = CELLS[1]; r = room(c); const rot = (Wd.moist / M) * VALVE_MAX;
    label(c, '물기 밸브', Wd.moist < 0.15 ? '잠김' : Wd.moist < 0.55 * M ? '조금' : '많이');
    g.strokeStyle = C.soft; g.lineWidth = 4; g.beginPath(); g.arc(r.cx, r.cy, r.R + 7, -Math.PI / 2, -Math.PI / 2 + VALVE_MAX); g.stroke();
    g.strokeStyle = C.knob; g.beginPath(); g.arc(r.cx, r.cy, r.R + 7, -Math.PI / 2, -Math.PI / 2 + rot); g.stroke();
    g.strokeStyle = on('moist') ? C.hi : '#9aa1ae'; g.lineWidth = 5; g.beginPath(); g.arc(r.cx, r.cy, r.R, 0, 7); g.stroke();
    g.lineWidth = 3; for (let k = 0; k < 5; k++) { const b = rot + k * Math.PI * 2 / 5 - Math.PI / 2; g.beginPath(); g.moveTo(r.cx, r.cy); g.lineTo(r.cx + Math.cos(b) * r.R, r.cy + Math.sin(b) * r.R); g.stroke(); }
    blob(r.cx, r.cy, 5, C.knob); blob(r.cx + Math.cos(rot - Math.PI / 2) * r.R, r.cy + Math.sin(rot - Math.PI / 2) * r.R, 6, on('moist') ? C.hi : '#d9dde6');
    // 3 위 바람 나침반
    c = CELLS[2]; r = room(c); const s = shearOf(Wd);
    label(c, '엇갈린 바람', s < 0.15 ? '같은 쪽' : s < 0.6 ? '조금 엇갈림' : '많이 엇갈림');
    blob(r.cx, r.cy, r.R, '#12151c'); g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.arc(r.cx, r.cy, r.R, 0, 7); g.stroke();
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText('북', r.cx, r.cy - r.R + 11); g.textAlign = 'left';
    arrow(r.cx, r.cy, 0, r.R * 0.55, '#6b7280', 4);
    arrow(r.cx, r.cy, Wd.shear, r.R * 0.85, on('shear') ? C.hi : C.knob, 3);
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText('흰 화살 = 위 바람', r.cx, Math.min(c.y + c.h - 2, r.cy + r.R + 14)); g.textAlign = 'left';
  }

  addEventListener('resize', layout); layout();
  return { S, step, draw, showMission, layout, where, reset,
    get W() { return S.W; },
    set(h) { setHandles(S.W, h); S.judgeAt = S.W.t + 1.5; },
  };
}
