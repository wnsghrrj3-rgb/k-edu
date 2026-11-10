/* 모양 친구가 살아나요 (1학년 수학 · 여러 가지 모양 · 상상 수업)
 * 허공(카메라: 검지 하나 = 연필, 손바닥 쫙 = 끝) 또는 화면(터치·마우스)에 ○△□를 그리면
 * 알아보고 → 눈·팔다리가 생겨 살아난다.
 *   동글이(○) 데굴데굴 굴러다니며 통통 튐 · 뾰족이(△) 콕콕 깡충 뜀 · 네모네모(□) 뚜벅뚜벅 걷다가 차곡차곡 쌓임
 * 만지면 간지러워하고, 「다 같이 춤춰!」, 「집 찾아 주기」(손으로 잡아 ○△□ 집에 넣기)
 * 영상은 기기 안에서만 처리(케이모션 공통).
 */
(function(){
const $ = id => document.getElementById(id);
const stage = $('stage'), ctx = stage.getContext('2d'); const W = stage.width, H = stage.height;
const GROUND = H - 64;
const CW = $('c').width, CH = $('c').height;
let km = null, INPUT = 'touch';

// ── 소리
let ac = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
function tone(f, dur = .2, type = 'triangle', vol = .18, at = 0, f2){ if (!ac) return; const t = ac.currentTime + at; const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .05); }
const SND = {
  magic(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .35, 'sine', .15, i * .07)); },
  boing(){ tone(220, .25, 'sine', .22, 0, 520); },
  ting(){ tone(1200, .12, 'triangle', .14); tone(1600, .1, 'triangle', .1, .05); },
  tock(){ tone(180, .1, 'square', .1); },
  giggle(){ [700, 900, 760, 980].forEach((f, i) => tone(f, .08, 'sine', .12, i * .07)); },
  nope(){ tone(300, .18, 'sawtooth', .1, 0, 200); },
  home(){ [784, 988, 1175].forEach((f, i) => tone(f, .2, 'triangle', .16, i * .08)); },
  pen(){ tone(900 + Math.random() * 300, .03, 'sine', .03); }
};
function say(txt){ try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'ko-KR'; u.rate = 1.05; u.pitch = 1.5; speechSynthesis.speak(u); } catch (_) {} }

// ── 친구들
const KIND = {
  circle:   { name: '동글이',   cols: ['#ff6b8b', '#ff9d5c', '#ffb3c7', '#f06292'], hello: ['나는 동글이! 데굴데굴~', '뾰족한 곳이 없어서 잘 굴러가!', '동글동글 굴러간다~'] },
  triangle: { name: '뾰족이',   cols: ['#2bb673', '#8bd450', '#26c6a6', '#5cc96b'], hello: ['나는 뾰족이! 콕콕!', '뾰족한 곳이 세 개야!', '깡충깡충 콕!'] },
  square:   { name: '네모네모', cols: ['#3a7bd5', '#7a6cf0', '#29a8e0', '#5c8dff'], hello: ['나는 네모네모! 차곡차곡~', '뾰족한 곳이 네 개야!', '나는 잘 쌓여!'] }
};
const TICKLE = ['간지러워!', '히히히!', '앗, 깜짝이야!', '또 해 줘!', '나 잡아 봐라~'];
const S = { on: false, friends: [], stroke: [], drawing: false, pens: [], bits: [], cursor: null, homes: false, grab: null, msg: null, lastPen: 0, stillT: 0 };
let uid = 1;
function makeFriend(r){
  const k = KIND[r.kind]; const col = k.cols[Math.random() * k.cols.length | 0];
  const size = Math.max(42, Math.min(92, r.size / 2.4));        // 반지름 비슷한 크기
  const sc = size / (r.size / 2);
  let local;
  if (r.kind === 'circle') local = null;
  else { local = r.verts.map(v => ({ x: (v.x - r.cx) * sc, y: (v.y - r.cy) * sc }));
    // 아이가 그린 꼭짓점을 살리되 너무 찌그러지면 반만 반듯하게
    const n = local.length, ideal = local.map((_, i) => { const a = (r.kind === 'triangle' ? -Math.PI / 2 : -Math.PI * 3 / 4) + i * 2 * Math.PI / n; const rr = r.kind === 'triangle' ? size * 1.15 : size * 1.2; return { x: Math.cos(a) * rr, y: Math.sin(a) * rr }; });
    // 각도 순서 맞추기
    local.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
    let best = 0, bd = 1e9; for (let s = 0; s < n; s++) { let d = 0; for (let i = 0; i < n; i++) { const p = local[(i + s) % n], q = ideal[i]; d += Math.hypot(p.x - q.x, p.y - q.y); } if (d < bd) { bd = d; best = s; } }
    local = ideal.map((q, i) => { const p = local[(i + best) % n]; return { x: p.x * .55 + q.x * .45, y: p.y * .55 + q.y * .45 }; }); }
  const f = { id: uid++, kind: r.kind, col, size, local, x: r.cx, y: r.cy, vx: 0, vy: -250, rot: 0, spin: 0, face: 1, blink: 0, born: performance.now(), squash: 1, hopT: .6 + Math.random(), talk: null, talkT: 0, tickleT: 0, dance: 0, stacked: false, home: false, walkDir: Math.random() < .5 ? -1 : 1, legT: 0 };
  f.bottom = r.kind === 'circle' ? size : Math.max(...local.map(p => p.y));
  f.halfW = r.kind === 'circle' ? size : Math.max(...local.map(p => Math.abs(p.x)));
  f.top = r.kind === 'circle' ? -size : Math.min(...local.map(p => p.y));
  return f;
}
function count(){ const c = { circle: 0, triangle: 0, square: 0 }; S.friends.forEach(f => c[f.kind]++); $('nC').textContent = c.circle; $('nT').textContent = c.triangle; $('nS').textContent = c.square; }
function talk(f, txt, speak){ f.talk = txt; f.talkT = 2.4; if (speak) say(txt); }
function burst(x, y, col, n = 26){ for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = 150 + Math.random() * 450; S.bits.push({ kind: Math.random() < .4 ? 'star' : 'dot', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 150, a: 1.3, c: Math.random() < .5 ? col : ['#ffd35c', '#fff', '#ff6b8b', '#4de1ff'][i % 4], r: 4 + Math.random() * 6 }); } }

// ── 그리기 끝 → 알아보기
function finishStroke(){
  const pts = S.stroke; S.stroke = []; S.drawing = false;
  if (pts.length < 6) return;
  const r = ShapeRecog.classify(pts);
  if (!r) { S.pens.push({ pts, a: 1, bad: true }); SND.nope(); S.msg = { txt: '음… 끝을 처음 자리까지 이어서 다시 그려 볼까?', t: 2.4 }; return; }
  S.pens.push({ pts, a: 1, kind: r.kind });
  if (S.friends.length >= 28) { const old = S.friends.shift(); burst(old.x, old.y, old.col, 10); }
  const f = makeFriend(r); S.friends.push(f);
  SND.magic(); burst(r.cx, r.cy, f.col, 40);
  const k = KIND[r.kind]; talk(f, k.hello[Math.random() * k.hello.length | 0], true);
  S.msg = { txt: { circle: '동그라미가 살아났다!', triangle: '세모가 살아났다!', square: '네모가 살아났다!' }[r.kind], t: 1.8 };
  count();
}

// ── 입력: 터치·마우스
function toStage(e){ const r = stage.getBoundingClientRect(); const s = Math.min(r.width / W, r.height / H); const ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2; return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s }; }
let ptrDown = false;
stage.addEventListener('pointerdown', e => { if (!S.on) return; audio(); const p = toStage(e); ptrDown = true; stage.setPointerCapture(e.pointerId);
  const hit = hitFriend(p, S.homes ? 28 : 10); if (hit) { if (S.homes) { S.grab = hit; SND.tock(); } else tickle(hit); return; }
  if (S.homes) return;
  S.drawing = true; S.stroke = [p]; });
stage.addEventListener('pointermove', e => { const p = toStage(e); if (INPUT === 'touch') S.cursor = { x: p.x, y: p.y, pen: ptrDown && S.drawing };
  if (!ptrDown) return; if (S.grab) { S.grab.x = p.x; S.grab.y = p.y; S.grab.vx = S.grab.vy = 0; return; }
  if (S.drawing) addPoint(p); });
const up = () => { if (!ptrDown) return; ptrDown = false; if (S.grab) { dropGrab(); return; } if (S.drawing) finishStroke(); };
stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
function addPoint(p){ const last = S.stroke[S.stroke.length - 1]; if (last && Math.hypot(p.x - last.x, p.y - last.y) < 3) return; S.stroke.push(p); const now = performance.now(); if (now - S.lastPen > 60) { SND.pen(); S.lastPen = now; }
  // 처음 자리로 돌아오면 저절로 끝(한 바퀴)
  if (S.stroke.length > 30) { const s0 = S.stroke[0]; let L = 0; for (let i = 1; i < S.stroke.length; i++) L += Math.hypot(S.stroke[i].x - S.stroke[i-1].x, S.stroke[i].y - S.stroke[i-1].y); if (L > 350 && Math.hypot(p.x - s0.x, p.y - s0.y) < 34) { if (INPUT === 'cam') finishStroke(); } } }

// ── 입력: 카메라(검지 = 연필)
let handPrev = 'none';
function readCam(f){
  if (!S.on) return;
  const a = f.actions && f.actions.hands && f.actions.hands[0];
  if (!a) { S.cursor = null; if (S.drawing && S.stroke.length > 10) finishStroke(); else if (S.drawing) { S.drawing = false; S.stroke = []; } handPrev = 'none'; return; }
  const p = { x: a.pointer.x / CW * W, y: a.pointer.y / CH * H };
  const pose = a.pose; const pen = pose === 'point';
  const grabPt = { x: a.center.x / CW * W, y: a.center.y / CH * H };
  S.cursor = { x: pen ? p.x : grabPt.x, y: pen ? p.y : grabPt.y, pen, fist: pose === 'fist' || pose === 'pinch' };
  if (S.homes) {   // 집 찾아 주기: 주먹(또는 집게)으로 잡아 옮기기
    if (S.cursor.fist) { if (!S.grab) { const h = hitFriend(S.cursor, 30); if (h) { S.grab = h; SND.tock(); } } if (S.grab) { S.grab.x = S.cursor.x; S.grab.y = S.cursor.y; S.grab.vx = S.grab.vy = 0; } }
    else if (S.grab) dropGrab();
    handPrev = pose; return; }
  if (pen) { if (!S.drawing) { S.drawing = true; S.stroke = []; } addPoint(p); }
  else if (S.drawing) { if (pose === 'open' || pose === 'fist' || handPrev === 'point') finishStroke(); }
  else { const h = hitFriend(S.cursor); if (h && h.tickleT <= 0) tickle(h); }
  handPrev = pose;
}

// ── 친구와 놀기
function hitFriend(p, pad = 10){ for (let i = S.friends.length - 1; i >= 0; i--) { const f = S.friends[i]; if (Math.abs(p.x - f.x) < f.halfW + pad && p.y > f.y + f.top - pad && p.y < f.y + f.bottom + pad) return f; } return null; }
function tickle(f){ if (f.tickleT > 0) return; f.tickleT = 1.2; f.vy = -520; f.spin = (Math.random() - .5) * 8; f.squash = .7; SND.giggle(); talk(f, TICKLE[Math.random() * TICKLE.length | 0], false); burst(f.x, f.y + f.top, '#ffd35c', 10); }
function dance(){ SND.magic(); S.friends.forEach((f, i) => { f.dance = 3.2; f.stacked = false; setTimeout(() => { f.vy = -420 - Math.random() * 200; f.squash = .7; }, i * 60); }); say('다 같이 춤춰요!'); S.msg = { txt: '🎵 다 같이 춤춰요!', t: 2.5 };
  // 박자
  [0, .4, .8, 1.2, 1.6, 2.0, 2.4].forEach((d, i) => tone([523, 659, 784, 659, 523, 784, 1047][i], .25, 'triangle', .14, d)); }
// 집: 화면 아래 세 칸
const HOMES = [{ kind: 'circle', x: W * .2 }, { kind: 'triangle', x: W * .5 }, { kind: 'square', x: W * .8 }];
const HOME_W = 330, HOME_TOP = GROUND - 190;
function toggleHomes(){ S.homes = !S.homes; S.grab = null; S.friends.forEach(f => { f.home = false; f.stacked = false; f.vy = -300; });
  $('bHome').textContent = S.homes ? '↩ 마을로 돌아가기' : '🏠 집 찾아 주기';
  if (S.homes) { say('모양 친구를 잡아서 자기 집에 데려다줘요'); S.msg = { txt: INPUT === 'cam' ? '주먹을 쥐어 친구를 잡고, 자기 집 위에서 손을 펴요!' : '친구를 눌러 끌어서 자기 집에 넣어 줘요!', t: 3.5 }; } }
function dropGrab(){ const f = S.grab; S.grab = null; if (!f) return; f.vy = 0;
  if (S.homes) { const h = HOMES.find(h => Math.abs(f.x - h.x) < HOME_W / 2 && f.y > HOME_TOP - 40);
    if (h) { if (h.kind === f.kind) { f.home = true; f.x = h.x + (Math.random() - .5) * 180; SND.home(); burst(f.x, f.y, f.col, 30); talk(f, '고마워! 여기가 우리 집이야!', true); checkAllHome(); }
      else { SND.nope(); f.vy = -600; f.vx = (f.x < h.x ? -1 : 1) * 300; talk(f, '여긴 내 집이 아니야!', true); } } } }
function checkAllHome(){ if (S.friends.length && S.friends.every(f => f.home)) { setTimeout(() => { SND.magic(); say('모두 집을 찾았어요! 최고!'); S.msg = { txt: '🎉 모두 집을 찾았어요!', t: 3 }; S.friends.forEach(f => { f.vy = -500; f.dance = 2; }); }, 600); } }

// ── 움직임
function update(dt, t){
  for (const f of S.friends) {
    if (f === S.grab) { f.blink -= dt; continue; }
    if (S.homes && !f.home) {   // 집 찾기: 아직 집이 없는 친구는 위쪽 구름 줄에 둥실둥실 줄 서서 기다린다
      const wait = S.friends.filter(x => S.homes && !x.home); const i = wait.indexOf(f), n = wait.length;
      const tx = W / 2 + (i - (n - 1) / 2) * Math.min(150, (W - 160) / Math.max(1, n)), ty = 250 + Math.sin(t / 500 + f.id) * 10 - f.bottom * .3;
      f.x += (tx - f.x) * Math.min(1, dt * 3); f.y += (ty - f.y) * Math.min(1, dt * 3); f.vx = f.vy = 0; f.rot *= .9; f.legT += dt; f.blink -= dt; if (f.blink < -3 - Math.random() * 3) f.blink = .15; f.talkT -= dt; f.squash += (1 - f.squash) * Math.min(1, dt * 8); continue; }
    f.tickleT -= dt; f.talkT -= dt; f.dance -= dt; f.squash += (1 - f.squash) * Math.min(1, dt * 8); f.legT += dt;
    // 눈 깜빡
    f.blink -= dt; if (f.blink < -3 - Math.random() * 3) f.blink = .15;
    const onGround = f.y + f.bottom >= GROUND - .5;
    // 받침(네모 위에 쌓기)
    let floor = GROUND;
    if (f.kind === 'square' || f.dance > 0 || true) { for (const o of S.friends) { if (o === f || o.kind !== 'square' || o === S.grab) continue; if (Math.abs(o.x - f.x) < (o.halfW + f.halfW) * .7 && o.y < f.y + 400 && o.y + o.top > f.y + f.bottom - 18) { const top = o.y + o.top; if (top < floor && f.kind === 'square') floor = top; } } }
    f.vy += 1300 * dt; f.y += f.vy * dt; f.x += f.vx * dt;
    if (f.y + f.bottom > floor) { f.y = floor - f.bottom; if (f.vy > 300) { f.squash = .75; if (f.kind === 'circle') SND.boing(); else if (f.kind === 'triangle') SND.ting(); else SND.tock(); }
      f.vy = f.kind === 'circle' && Math.abs(f.vy) > 260 ? -f.vy * .45 : 0;
      if (f.kind === 'square' && floor < GROUND && !f.stacked) { f.stacked = true; f.vx = 0; if (Math.random() < .6) talk(f, '차곡차곡!', false); } }
    else if (f.kind === 'square' && floor === GROUND && f.stacked && f.y + f.bottom < GROUND - 2) f.stacked = false;
    const grounded = f.y + f.bottom >= floor - 1;
    if (S.homes && f.home) { const h = HOMES.find(h => h.kind === f.kind); f.x += ((h.x + ((f.id * 53) % 160 - 80)) - f.x) * dt * 2; f.vx = 0; if (grounded && f.dance > 0) f.vy = -380; continue; }
    if (f.dance > 0) { if (grounded) { f.vy = -380 - Math.random() * 160; f.vx = (Math.random() - .5) * 200; } f.rot = Math.sin(t / 120 + f.id) * .25; }
    else if (f.kind === 'circle') { if (grounded) f.vx += f.walkDir * 220 * dt; f.vx = Math.max(-260, Math.min(260, f.vx)); f.rot += f.vx * dt / f.size; if (grounded && Math.random() < dt * .25) f.vy = -420; }
    else if (f.kind === 'triangle') { f.vx *= Math.pow(.2, dt); if (grounded) { f.hopT -= dt; if (f.hopT <= 0) { f.hopT = .7 + Math.random() * .8; f.vy = -560 - Math.random() * 220; f.vx = f.walkDir * (180 + Math.random() * 160); f.squash = .7; } } f.rot = grounded ? f.rot * .8 : Math.sin(t / 90) * .15; }
    else { if (f.stacked) { f.vx = 0; } else if (grounded) { f.vx = f.walkDir * 70; } f.rot = f.stacked ? 0 : Math.sin(f.legT * 8) * .05; }
    if (f.spin) { f.rot += f.spin * dt; f.spin *= Math.pow(.05, dt); if (Math.abs(f.spin) < .2 && f.kind !== 'circle') { f.spin = 0; } }
    if (f.kind !== 'circle' && f.dance <= 0 && !f.spin) f.rot *= Math.pow(.02, dt);
    // 벽
    const minX = f.halfW, maxX = W - f.halfW; if (f.x < minX) { f.x = minX; f.walkDir = 1; f.vx = Math.abs(f.vx); } if (f.x > maxX) { f.x = maxX; f.walkDir = -1; f.vx = -Math.abs(f.vx); }
    if (f.y + f.top < 0 && f.vy < 0) { f.vy = 0; }
    // 집 놀이: 집 안이 아닌 친구는 위쪽 마당에서 논다
    if (S.homes && !f.home && f.y + f.bottom > HOME_TOP - 10 && grounded && f.kind !== 'square') f.vy = -500;
  }
  // 네모끼리 가끔 쌓이러 가기
  if (!S.homes) { const sq = S.friends.filter(f => f.kind === 'square' && !f.stacked && f.dance <= 0 && f !== S.grab); if (sq.length >= 2 && Math.random() < dt * .4) { const a = sq[Math.random() * sq.length | 0], b = sq.find(x => x !== a && Math.abs(x.x - a.x) < 140); if (b && a.y + a.bottom >= GROUND - 1) { a.vy = -680; a.vx = (b.x - a.x) * 1.6; } } }
  for (const p of S.bits) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; p.a -= dt * 1.1; } S.bits = S.bits.filter(p => p.a > 0);
  for (const p of S.pens) p.a -= dt * (p.bad ? .8 : 1.6); S.pens = S.pens.filter(p => p.a > 0);
  if (S.msg) { S.msg.t -= dt; if (S.msg.t <= 0) S.msg = null; }
}

// ── 그리기
function bg(t){
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8fd3ff'); sky.addColorStop(1, '#e3f6ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // 해
  ctx.save(); ctx.translate(1140, 95); ctx.rotate(t / 4000); ctx.fillStyle = '#ffe066'; for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillRect(48, -5, 26, 10); } ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#5a3d00'; ctx.beginPath(); ctx.arc(1126, 88, 4, 0, 7); ctx.arc(1154, 88, 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#5a3d00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1140, 100, 12, .2, Math.PI - .2); ctx.stroke();
  // 구름
  for (let i = 0; i < 4; i++) { const x = ((t / 40 * (i + 1) * .4 + i * 360) % (W + 300)) - 150, y = 70 + i * 45 + (i % 2) * 30; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.arc(x + 34, y - 14, 36, 0, 7); ctx.arc(x + 70, y, 28, 0, 7); ctx.fill(); }
  // 언덕·땅
  ctx.fillStyle = '#a8e6a1'; ctx.beginPath(); ctx.moveTo(0, GROUND - 40); ctx.quadraticCurveTo(300, GROUND - 150, 640, GROUND - 50); ctx.quadraticCurveTo(950, GROUND - 160, W, GROUND - 60); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = '#6cc65f'; ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = '#5ab14e'; for (let x = 10; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x, GROUND + 2); ctx.lineTo(x + 6, GROUND - 10); ctx.lineTo(x + 12, GROUND + 2); ctx.fill(); }
}
function drawHomes(){
  const ic = { circle: '●', triangle: '▲', square: '■' }, col = { circle: '#ff6b8b', triangle: '#2bb673', square: '#3a7bd5' };
  for (const h of HOMES) { const x0 = h.x - HOME_W / 2; ctx.save(); ctx.globalAlpha = .92;
    ctx.fillStyle = '#fff8e6'; ctx.strokeStyle = col[h.kind]; ctx.lineWidth = 6; roundRect(x0, HOME_TOP, HOME_W, GROUND - HOME_TOP, 18); ctx.fill(); ctx.stroke();
    // 지붕 = 그 모양
    ctx.fillStyle = col[h.kind]; ctx.beginPath(); const rx = h.x, ry = HOME_TOP - 46;
    if (h.kind === 'circle') ctx.arc(rx, ry, 40, 0, 7); else if (h.kind === 'triangle') { ctx.moveTo(rx, ry - 44); ctx.lineTo(rx + 52, ry + 36); ctx.lineTo(rx - 52, ry + 36); ctx.closePath(); } else ctx.rect(rx - 40, ry - 36, 80, 76);
    ctx.fill(); ctx.font = '900 26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = col[h.kind]; ctx.fillText(KIND[h.kind].name + ' 집', h.x, HOME_TOP + 28);
    ctx.restore(); }
}
function roundRect(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function shade(hex, k){ const n = parseInt(hex.slice(1), 16); const r = Math.min(255, (n >> 16) * k) | 0, g = Math.min(255, ((n >> 8) & 255) * k) | 0, b = Math.min(255, (n & 255) * k) | 0; return `rgb(${r},${g},${b})`; }
function bodyPath(f){ ctx.beginPath(); if (f.kind === 'circle') ctx.arc(0, 0, f.size, 0, Math.PI * 2); else { const L = f.local; const rr = 14; // 모서리 살짝 둥글게(그래도 뾰족!)
    for (let i = 0; i < L.length; i++) { const a = L[(i - 1 + L.length) % L.length], b = L[i], c = L[(i + 1) % L.length]; const d1 = Math.hypot(b.x - a.x, b.y - a.y), d2 = Math.hypot(c.x - b.x, c.y - b.y); const p1 = { x: b.x + (a.x - b.x) * rr / d1, y: b.y + (a.y - b.y) * rr / d1 }, p2 = { x: b.x + (c.x - b.x) * rr / d2, y: b.y + (c.y - b.y) * rr / d2 }; if (i === 0) ctx.moveTo(p1.x, p1.y); else ctx.lineTo(p1.x, p1.y); ctx.quadraticCurveTo(b.x, b.y, p2.x, p2.y); } ctx.closePath(); } }
function drawFriend(f, t){
  const age = (performance.now() - f.born) / 1000, pop = age < .45 ? .3 + .7 * easeOut(age / .45) * (1 + .25 * Math.sin(age / .45 * Math.PI)) : 1;
  const grounded = f.y + f.bottom >= GROUND - 2;
  ctx.save(); ctx.translate(f.x, f.y + f.bottom);
  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(0, Math.max(0, GROUND - (f.y + f.bottom)) , f.halfW * .8, 10, 0, 0, 7); ctx.fill();
  const sq = f.squash; ctx.scale(pop * (2 - sq), pop * sq); ctx.translate(0, -f.bottom);
  // 다리(바닥 쪽 두 개)
  const walk = (Math.abs(f.vx) > 20 || f.dance > 0) ? Math.sin(f.legT * 14) : 0;
  ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  [-1, 1].forEach((s, i) => { const lx = s * f.halfW * .35, ly = f.bottom - 4; const sw = (i ? walk : -walk) * 10; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + sw, ly + 22); ctx.lineTo(lx + sw + s * 10, ly + 22); ctx.stroke(); });
  // 팔
  const wave = f.dance > 0 || f.tickleT > 0 ? Math.sin(t / 80) : Math.sin(t / 400 + f.id);
  [-1, 1].forEach(s => { const ax = s * f.halfW * (f.kind === 'triangle' ? .45 : .92), ay = f.kind === 'triangle' ? f.bottom * .25 : 0; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(ax + s * 22, ay - 10 - wave * 18, ax + s * 34, ay - 26 - wave * 22); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ax + s * 36, ay - 28 - wave * 22, 7, 0, 7); ctx.fill(); ctx.stroke(); });
  // 몸
  ctx.save(); ctx.rotate(f.kind === 'circle' ? 0 : f.rot);
  const g = ctx.createLinearGradient(0, f.top, 0, f.bottom); g.addColorStop(0, shade(f.col, 1.25)); g.addColorStop(1, shade(f.col, .85));
  bodyPath(f); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = shade(f.col, .6); ctx.stroke();
  // 동글이 무늬(굴러가는 게 보이게)
  if (f.kind === 'circle') { ctx.save(); bodyPath(f); ctx.clip(); ctx.rotate(f.rot); ctx.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 3; i++) { const a = i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * f.size * .62, Math.sin(a) * f.size * .62, f.size * .16, 0, 7); ctx.fill(); } ctx.restore(); }
  // 뾰족한 곳 반짝(세모·네모: 꼭짓점 세기 도움)
  if (f.local) f.local.forEach((p, i) => { const tw = .5 + .5 * Math.sin(t / 200 + i * 1.7 + f.id); ctx.fillStyle = `rgba(255,255,255,${.35 + tw * .5})`; drawStar(p.x * .86, p.y * .86, 7 + tw * 4); });
  // 얼굴
  const fy = f.kind === 'triangle' ? f.bottom * .2 : 0, es = Math.max(10, f.size * .16);
  const look = S.cursor ? Math.max(-1, Math.min(1, (S.cursor.x - f.x) / 300)) : Math.sin(t / 900 + f.id) * .6;
  [-1, 1].forEach(s => { const ex = s * f.size * .3, ey = fy - f.size * .12; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, es, f.blink > 0 ? 2 : es * 1.15, 0, 0, 7); ctx.fill(); if (f.blink <= 0) { ctx.fillStyle = '#1d2a44'; ctx.beginPath(); ctx.arc(ex + look * es * .4, ey + 2, es * .55, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look * es * .4 - 3, ey - 2, es * .2, 0, 7); ctx.fill(); } });
  // 볼
  ctx.fillStyle = 'rgba(255,120,150,.45)'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * f.size * .48, fy + f.size * .12, es * .8, es * .5, 0, 0, 7); ctx.fill(); });
  // 입
  ctx.strokeStyle = '#1d2a44'; ctx.lineWidth = 4; ctx.beginPath();
  if (f.tickleT > 0 || f.dance > 0 || f.talkT > 0) { ctx.fillStyle = '#7a1f3a'; ctx.ellipse(0, fy + f.size * .2, es * .9, es * (.6 + .3 * Math.abs(Math.sin(t / 90))), 0, 0, 7); ctx.fill(); }
  else { ctx.arc(0, fy + f.size * .08, es * .9, .25, Math.PI - .25); ctx.stroke(); }
  ctx.restore(); ctx.restore();
  // 말풍선
  if (f.talk && f.talkT > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, f.talkT * 2); ctx.font = '900 24px sans-serif'; const tw = ctx.measureText(f.talk).width + 30; const bx = Math.max(10, Math.min(W - tw - 10, f.x - tw / 2)), by = f.y + f.top - 80;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = shade(f.col, .7); ctx.lineWidth = 4; roundRect(bx, by, tw, 46, 22); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(f.x - 10, by + 44); ctx.lineTo(f.x, by + 62); ctx.lineTo(f.x + 10, by + 44); ctx.fill();
    ctx.fillStyle = '#1d2a44'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.talk, bx + tw / 2, by + 24); ctx.restore(); }
}
function easeOut(x){ return 1 - Math.pow(1 - Math.min(1, x), 3); }
function drawStar(x, y, r){ ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .4 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function drawStroke(pts, a, col, w){ if (pts.length < 2) return; ctx.save(); ctx.globalAlpha = a; ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = w + 8; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.restore(); }
function draw(t){
  bg(t);
  if (S.homes) drawHomes();
  for (const p of S.pens) drawStroke(p.pts, p.a, p.bad ? '#b0b8c8' : '#ffb000', 10);
  for (const f of S.friends) if (f !== S.grab) drawFriend(f, t);
  if (S.grab) drawFriend(S.grab, t);
  if (S.stroke.length) { drawStroke(S.stroke, 1, '#ff5c7a', 12); const s0 = S.stroke[0]; ctx.strokeStyle = 'rgba(255,92,122,.7)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(s0.x, s0.y, 30, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  for (const p of S.bits) { ctx.globalAlpha = Math.min(1, p.a); ctx.fillStyle = p.c; if (p.kind === 'star') drawStar(p.x, p.y, p.r * 1.6); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  // 커서(카메라 손)
  if (S.cursor && INPUT === 'cam') { const c = S.cursor; ctx.save(); ctx.translate(c.x, c.y);
    if (c.pen) { ctx.rotate(-.6); ctx.fillStyle = '#ffd35c'; ctx.fillRect(-7, -60, 14, 48); ctx.fillStyle = '#ffb3a7'; ctx.fillRect(-7, -68, 14, 10); ctx.fillStyle = '#f2c79a'; ctx.beginPath(); ctx.moveTo(-7, -12); ctx.lineTo(7, -12); ctx.lineTo(0, 0); ctx.fill(); ctx.fillStyle = '#1d2a44'; ctx.beginPath(); ctx.moveTo(-2.5, -4); ctx.lineTo(2.5, -4); ctx.lineTo(0, 0); ctx.fill(); }
    else { ctx.fillStyle = c.fist ? 'rgba(255,211,92,.85)' : 'rgba(255,255,255,.8)'; ctx.strokeStyle = '#3a7bd5'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, c.fist ? 22 : 18, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3a7bd5'; ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(c.fist ? '✊' : '🖐', 0, 6); }
    ctx.restore(); }
  // 안내
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const hint = S.msg ? S.msg.txt : !S.friends.length ? (INPUT === 'cam' ? '☝ 검지 하나만 펴고 허공에 동그라미·세모·네모를 그려요!' : '👆 손가락으로 동그라미·세모·네모를 그려요!') : null;
  if (hint) { ctx.font = '900 32px sans-serif'; const tw = ctx.measureText(hint).width + 50; ctx.fillStyle = 'rgba(255,255,255,.88)'; roundRect(W / 2 - tw / 2, 78, tw, 56, 28); ctx.fill(); ctx.fillStyle = '#1d2a44'; ctx.fillText(hint, W / 2, 107); }
  if (INPUT === 'cam' && !S.cursor && !S.homes) { ctx.font = '800 22px sans-serif'; ctx.fillStyle = 'rgba(29,42,68,.7)'; ctx.fillText('손을 카메라에 보여 주세요', W / 2, H - 28); }
}

// ── 시작·루프
let last = 0;
function loop(t){ requestAnimationFrame(loop); const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; if (!S.on) return; update(dt, t); draw(t); }
async function start(mode){ audio(); INPUT = mode; S.on = true; $('ov').classList.add('hidden'); $('tools').style.display = 'flex';
  if (mode === 'cam') { $('camBox').classList.remove('off'); $('msg').textContent = '카메라 여는 중…';
    try { if (!km) { km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['hands'], numHands: 1, activity: 'shapes', inferEvery: 1 });
        km.onFrame = f => { km.drawCamera(); f.hands.forEach(h => km.drawSkeleton(h, km.HAND_BONES, 'rgba(255,211,92,.9)', 3)); readCam(f); };
        km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); }; }
      if (!km.running) await km.start(); }
    catch (e) { S.on = false; $('ov').classList.remove('hidden'); $('tools').style.display = 'none'; $('camBox').classList.add('off'); $('msg').textContent = '카메라를 열 수 없어요(' + e.message + ') — 「화면에 직접 그리기」로 해 보세요.'; return; }
  } else { $('camBox').classList.add('off'); if (km && km.running) km.stop(); }
  say(mode === 'cam' ? '검지 하나만 펴고 허공에 모양을 그려 봐요!' : '손가락으로 모양을 그려 봐요!'); }
$('bCam').onclick = () => start('cam');
$('bTouch').onclick = () => start('touch');
$('bDance').onclick = () => { audio(); if (S.friends.length) dance(); else S.msg = { txt: '먼저 모양 친구를 그려 줘요!', t: 2 }; };
$('bHome').onclick = () => { audio(); if (!S.friends.length && !S.homes) { S.msg = { txt: '먼저 모양 친구를 그려 줘요!', t: 2 }; return; } toggleHomes(); };
$('bClear').onclick = () => { S.friends.forEach(f => burst(f.x, f.y, f.col, 8)); S.friends = []; S.pens = []; if (S.homes) toggleHomes(); count(); S.msg = { txt: '새 마을! 다시 그려 봐요', t: 2 }; };
$('bMenu').onclick = () => { S.on = false; $('ov').classList.remove('hidden'); $('tools').style.display = 'none'; if (km && km.running) km.stop(); $('camBox').classList.add('off'); };
// 테스트용 훅
window.__shapes = { S, finishStroke, makeFriend, dance, toggleHomes, start };
requestAnimationFrame(loop);
})();
