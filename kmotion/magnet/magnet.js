/* 자석 핀볼 · 맛보기 — 손 두 개 = 자석 두 개. 손바닥 = N극, 주먹·손등 = S극.
 * 쇠구슬(회색)은 어느 극에나 끌리고, 자석구슬(빨간 N 머리)은 S극엔 끌리고 N극엔 밀린다. 거리 제곱에 반비례(상한 있음).
 * 카메라 좌표(480×360, 거울) → 무대(1280×720)로 바로 늘린다. 마우스 모드 ?mouse=1: 마우스 = 손, F 키 = 주먹(S극).
 */
const $ = id => document.getElementById(id);
const stage = $('stage'), ctx = stage.getContext('2d'); const W = stage.width, H = stage.height;
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['hands'], activity: 'magnet', inferEvery: 1 });
const CW = $('c').width, CH = $('c').height;

// ── 소리(합성)
let ac = null, hum = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); if (!hum) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 55; const g = ac.createGain(); g.gain.value = 0; o.connect(g); g.connect(ac.destination); o.start(); hum = { o, g }; } } catch (_) {} }
function ping(n = 1){ if (!ac) return; const t = ac.currentTime; [660, 880, 1320].slice(0, n + 1).forEach((f, i) => { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const g = ac.createGain(); g.gain.setValueAtTime(.18, t + i * .08); g.gain.exponentialRampToValueAtTime(.001, t + i * .08 + .5); o.connect(g); g.connect(ac.destination); o.start(t + i * .08); o.stop(t + i * .08 + .55); }); }
function tick(v){ if (!ac) return; const t = ac.currentTime; const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 180 + v * 20; const g = ac.createGain(); g.gain.setValueAtTime(Math.min(.2, v * .02), t); g.gain.exponentialRampToValueAtTime(.001, t + .06); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .07); }

// ── 상태
const S = { on: false, t0: 0, score: 0, maxV: 0, hands: [], balls: [], holes: [], rings: [], trail: [], shake: 0 };
const K = 3.6e7, RMIN = 70, VMAX = 1100, DRAG = .992, R = 22;
function newBall(kind, x, y){ return { kind, x: x ?? W * (.3 + Math.random() * .4), y: y ?? H * (.3 + Math.random() * .4), vx: 0, vy: 0, r: R, spin: 0 }; }
function newHole(){ const side = Math.random() < .5 ? -1 : 1; return { x: W / 2 + side * W * (.25 + Math.random() * .15), y: H * (.2 + Math.random() * .6), r: 40, pulse: 0 }; }
function reset(){ S.score = 0; S.maxV = 0; S.balls = [newBall('iron'), newBall('magnet')]; S.holes = [newHole()]; S.rings = []; S.trail = []; S.t0 = performance.now(); }

// ── 손 → 자석
function readHands(f){ S.hands = [];
  f.hands.forEach((h, i) => { const a = f.actions.hands[i]; if (!a) return;
    const pole = (a.pose === 'fist' || a.facing === 'back') ? 'S' : 'N';          // 손바닥 N · 주먹/손등 S
    const x = a.center.x / CW * W, y = a.center.y / CH * H;
    S.hands.push({ x, y, pole, dir: a.dir, span: a.span / CW * W, side: a.side || (i ? 'right' : 'left'), open: a.pose === 'open' || a.pose === 'other' || a.pose === 'point' }); });
}

// ── 물리
function physics(dt){
  let hv = 0;
  for (const b of S.balls) {
    let fx = 0, fy = 0;
    for (const m of S.hands) { const dx = m.x - b.x, dy = m.y - b.y; const r2 = Math.max(RMIN * RMIN, dx * dx + dy * dy); const r = Math.sqrt(r2);
      let sign = 1; if (b.kind === 'magnet') sign = m.pole === 'S' ? 1 : -1.3;   // 자석구슬: S 끌림, N 밀림(밀림이 조금 더 셈 — 손맛)
      const F = K * sign / r2; fx += F * dx / r; fy += F * dy / r; hv += Math.min(1, K / r2 / 40); }
    b.vx = (b.vx + fx * dt) * DRAG; b.vy = (b.vy + fy * dt) * DRAG; const v = Math.hypot(b.vx, b.vy); if (v > VMAX) { b.vx *= VMAX / v; b.vy *= VMAX / v; }
    b.x += b.vx * dt; b.y += b.vy * dt; b.spin += v * dt / b.r;
    if (b.x < b.r) { b.x = b.r; b.vx = -b.vx * .72; tick(v / 100); S.shake = Math.min(8, v / 120); } if (b.x > W - b.r) { b.x = W - b.r; b.vx = -b.vx * .72; tick(v / 100); S.shake = Math.min(8, v / 120); }
    if (b.y < b.r) { b.y = b.r; b.vy = -b.vy * .72; tick(v / 100); } if (b.y > H - b.r) { b.y = H - b.r; b.vy = -b.vy * .72; tick(v / 100); }
    S.maxV = Math.max(S.maxV, v);
    S.trail.push({ x: b.x, y: b.y, kind: b.kind, a: 1 }); if (S.trail.length > 90) S.trail.shift();
    for (const hole of S.holes) { if (Math.hypot(hole.x - b.x, hole.y - b.y) < hole.r - 6 && Math.hypot(b.vx, b.vy) < 700) { S.score++; $('hScore').textContent = S.score; ping(2); S.rings.push({ x: hole.x, y: hole.y, r: 10, a: 1, c: '#ffd35c' }); Object.assign(hole, newHole()); Object.assign(b, newBall(b.kind)); } }
  }
  // 구슬끼리 충돌
  const [a, c] = S.balls; const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy); if (d < a.r + c.r && d > 0) { const nx = dx / d, ny = dy / d; const p = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny; if (p > 0) { a.vx -= p * nx; a.vy -= p * ny; c.vx += p * nx; c.vy += p * ny; tick(p / 80); } const ov = (a.r + c.r - d) / 2; a.x -= nx * ov; a.y -= ny * ov; c.x += nx * ov; c.y += ny * ov; }
  for (const t of S.trail) t.a -= dt * 1.8; S.trail = S.trail.filter(t => t.a > 0);
  for (const r of S.rings) { r.r += dt * 320; r.a -= dt * 1.6; } S.rings = S.rings.filter(r => r.a > 0);
  if (hum) hum.g.gain.setTargetAtTime(Math.min(.08, hv * .03), ac.currentTime, .05);
  S.shake *= .85;
}

// ── 그리기
function drawMagnet(m, t){ const L = Math.max(90, m.span * 1.6), Wd = L * .34; const rad = m.dir * Math.PI / 180;
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(rad);
  // 자기장 고리(펄스)
  const col = m.pole === 'N' ? '255,77,90' : '59,123,255'; for (let i = 0; i < 3; i++) { const ph = ((t / 900) + i / 3) % 1; ctx.strokeStyle = `rgba(${col},${(1 - ph) * .45})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 40 + ph * 170, 0, Math.PI * 2); ctx.stroke(); }
  // 막대: 위쪽 반은 보이는 극(사용자 쪽 극), 아래 반은 반대 극
  const top = m.pole, bot = m.pole === 'N' ? 'S' : 'N';
  ctx.shadowColor = `rgba(${col},.8)`; ctx.shadowBlur = 24;
  ctx.fillStyle = top === 'N' ? '#ff4d5a' : '#3b7bff'; rr(-Wd / 2, -L / 2, Wd, L / 2, 10, true, false); ctx.fill();
  ctx.fillStyle = bot === 'N' ? '#ff4d5a' : '#3b7bff'; rr(-Wd / 2, 0, Wd, L / 2, 10, false, true); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.font = `900 ${Wd * .8 | 0}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(top, 0, -L / 4); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText(bot, 0, L / 4);
  ctx.restore();
  // 큰 극 표시(손 위)
  ctx.save(); ctx.font = '900 34px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = `rgb(${col})`; ctx.shadowColor = `rgba(${col},.9)`; ctx.shadowBlur = 16; ctx.fillText(m.pole === 'N' ? 'N극 · 손바닥' : 'S극 · 주먹', m.x, m.y - L / 2 - 26); ctx.restore();
}
function rr(x, y, w, h, r, top, bottom){ ctx.beginPath(); const tr = top ? r : 0, br = bottom ? r : 0; ctx.moveTo(x + tr, y); ctx.lineTo(x + w - tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + tr); ctx.lineTo(x + w, y + h - br); ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h); ctx.lineTo(x + br, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - br); ctx.lineTo(x, y + tr); ctx.quadraticCurveTo(x, y, x + tr, y); ctx.closePath(); }
function drawBall(b){ ctx.save(); ctx.translate(b.x, b.y);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  if (b.kind === 'iron') { const g = ctx.createRadialGradient(-b.r * .35, -b.r * .35, 2, 0, 0, b.r); g.addColorStop(0, '#f4f6fa'); g.addColorStop(.5, '#9aa3b4'); g.addColorStop(1, '#3d4453'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.rotate(b.spin); const g = ctx.createRadialGradient(-b.r * .35, -b.r * .35, 2, 0, 0, b.r); g.addColorStop(0, '#fff'); g.addColorStop(.5, '#e8e8ee'); g.addColorStop(1, '#8a8a99'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, b.r, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fillStyle = '#ff4d5a'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI); ctx.closePath(); ctx.fillStyle = '#3b7bff'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 ${b.r * .9 | 0}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', 0, -b.r * .45); ctx.fillText('S', 0, b.r * .5); }
  ctx.restore(); }
function draw(t){
  ctx.save(); if (S.shake > .3) ctx.translate((Math.random() - .5) * S.shake, (Math.random() - .5) * S.shake);
  // 작업대
  const g = ctx.createRadialGradient(W / 2, H * .4, 60, W / 2, H * .4, H); g.addColorStop(0, '#182540'); g.addColorStop(1, '#070a12'); ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, H + 20);
  ctx.strokeStyle = 'rgba(77,225,255,.07)'; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y <= H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // 구멍
  for (const h of S.holes) { h.pulse = (h.pulse + .02) % 1; const gg = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, h.r * 2.2); gg.addColorStop(0, 'rgba(255,211,92,.9)'); gg.addColorStop(.4, 'rgba(255,211,92,.25)'); gg.addColorStop(1, 'rgba(255,211,92,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(255,211,92,${.6 + Math.sin(t / 200) * .3})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(h.x, h.y, h.r + 6 + h.pulse * 14, 0, Math.PI * 2); ctx.stroke(); }
  for (const r of S.rings) { ctx.strokeStyle = r.c; ctx.globalAlpha = r.a; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  for (const tr of S.trail) { ctx.fillStyle = tr.kind === 'iron' ? `rgba(180,190,210,${tr.a * .35})` : `rgba(255,120,130,${tr.a * .35})`; ctx.beginPath(); ctx.arc(tr.x, tr.y, 6 * tr.a + 2, 0, Math.PI * 2); ctx.fill(); }
  // 힘 선: 손 → 구슬
  for (const m of S.hands) for (const b of S.balls) { const d = Math.hypot(m.x - b.x, m.y - b.y); if (d > 420) continue; const rep = b.kind === 'magnet' && m.pole === 'N'; ctx.strokeStyle = rep ? `rgba(255,77,90,${(1 - d / 420) * .8})` : `rgba(77,225,255,${(1 - d / 420) * .8})`; ctx.lineWidth = 2 + (1 - d / 420) * 5; ctx.setLineDash(rep ? [6, 10] : [14, 8]); ctx.lineDashOffset = rep ? t / 20 : -t / 20; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); }
  for (const b of S.balls) drawBall(b);
  for (const m of S.hands) drawMagnet(m, t);
  if (!S.hands.length) { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '900 34px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('손을 카메라에 보여 주세요', W / 2, H * .12); }
  ctx.restore();
}

// ── 루프
let last = 0;
km.onFrame = f => { km.drawCamera(); f.hands.forEach(h => km.drawSkeleton(h, km.HAND_BONES, 'rgba(77,225,255,.8)', 3)); if (S.on) readHands(f); };
km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드 (F = 주먹)' : '카메라 연결됨'); };
function loop(t){ requestAnimationFrame(loop); const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; if (!S.on) return;
  physics(dt); draw(t); const left = Math.max(0, 60 - (t - S.t0) / 1000); $('hTime').textContent = Math.ceil(left); $('hSpd').textContent = Math.round(S.maxV / 10) + '';
  if (left <= 0) end(); }
async function start(){ audio(); $('msg').textContent = '카메라 여는 중…'; try { if (!km.running) await km.start(); } catch (e) { $('msg').textContent = '카메라를 열 수 없어요: ' + e.message; return; }
  reset(); S.on = true; $('ov').classList.add('hidden'); }
function end(){ S.on = false; $('ov').classList.remove('hidden'); $('ov').querySelector('h1').textContent = `구슬 ${S.score}개!`; $('msg').textContent = `최고 속도 ${Math.round(S.maxV / 10)} — 다시 해 볼까요?`; $('btnStart').textContent = '다시'; }
$('btnStart').onclick = start; $('btnQuit').onclick = end;
requestAnimationFrame(loop);
