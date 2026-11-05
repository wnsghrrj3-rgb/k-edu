/* 풍선 터뜨리기 · 십몇 빼기 몇 (1학년 2학기 받아내림)
 * 화면: 10개 묶음 풍선(5×2 열 틀) + 낱개 풍선. 손가락 끝(검지)이 풍선에 닿으면 터진다.
 * 묶음은 끈이 묶여 있어 바로 못 터뜨린다 — 매듭 위에 손을 0.5초 대면 끈이 풀려 10개가 흩어진다(= 받아내림).
 * 전략은 아이가 고른다: 낱개부터 → 「빼서 10 만들기」 / 묶음부터 → 「10에서 빼기」. 끝나면 쓴 전략을 식으로 보여 준다.
 * 시킨 만큼 터뜨리면 더 못 터뜨리고, 남은 풍선이 한 줄로 와서 1·2·3… 세어진다 = 답.
 * 마우스 모드 ?mouse=1: 큰 화면 위의 마우스 = 손가락.
 */
const $ = id => document.getElementById(id);
const stage = $('stage'), ctx = stage.getContext('2d'); const W = stage.width, H = stage.height;
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['hands'], numHands: 2, activity: 'balloon', inferEvery: 1 });
const CW = $('c').width, CH = $('c').height;

// ── 소리(합성)
let ac = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
function pop(){ if (!ac) return; const t = ac.currentTime; const n = ac.createBufferSource(); const b = ac.createBuffer(1, 2200, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); n.buffer = b; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 600; f.Q.value = .7; const g = ac.createGain(); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t); }
function tone(freq, dur = .25, type = 'triangle', vol = .2, at = 0){ if (!ac) return; const t = ac.currentTime + at; const o = ac.createOscillator(); o.type = type; o.frequency.value = freq; const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .05); }
function untieSound(){ tone(200, .4, 'sawtooth', .15); tone(400, .4, 'sawtooth', .1, .08); tone(800, .5, 'sine', .15, .16); }
function fanfare(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, .5, 'triangle', .2, i * .11)); }

// ── 문제
function makeProblems(n){ const all = []; for (let a = 11; a <= 18; a++) for (let b = 2; b <= 9; b++) if (a % 10 < b) all.push([a, b]); for (let i = all.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [all[i], all[j]] = [all[j], all[i]]; } return all.slice(0, n); }

// ── 상태
const COLORS = ['#ff5c7a', '#ffd35c', '#5cf2a4', '#4de1ff', '#c58bff', '#ff9d5c'];
const R = 36;
const S = { on: false, phase: 'idle', probs: [], pi: 0, a: 0, b: 0, score: 0, balloons: [], knot: null, tied: true, popped: 0, popLoose: 0, popBundle: 0, hands: [], bits: [], msgT: 0, countI: 0, countT: 0, nextT: 0, hover: { t: 0, hand: -1 }, mouse: { x: -999, y: -999 } };
const BX = 180, BY = 170, GAP = 84;   // 묶음 틀 왼쪽 위
function newBalloon(x, y, kind, i){ return { x, y, tx: x, ty: y, kind, col: COLORS[(kind === 'loose' ? 3 + i : i) % COLORS.length], alive: true, phase: Math.random() * 6.28, r: R, idx: i, pt: 0 }; }
function setProblem(){ const [a, b] = S.probs[S.pi]; S.a = a; S.b = b; S.balloons = []; S.tied = true; S.popped = 0; S.popLoose = 0; S.popBundle = 0; S.bits = []; S.phase = 'play'; S.hover = { t: 0, hand: -1 }; S.countI = 0;
  for (let i = 0; i < 10; i++) S.balloons.push(newBalloon(BX + (i % 5) * GAP, BY + (i / 5 | 0) * GAP, 'bundle', i));
  S.knot = { x: BX + 2 * GAP, y: BY + GAP + 150 };
  const ones = a - 10; for (let i = 0; i < ones; i++) { const x = 760 + (i % 4) * 110, y = 200 + (i / 4 | 0) * 120 + (i % 2) * 20; S.balloons.push(newBalloon(x, y, 'loose', i)); }
  $('hNo').textContent = `${S.pi + 1} / ${S.probs.length}`; S.msgT = performance.now(); }
function untie(){ S.tied = false; untieSound(); const bundle = S.balloons.filter(b => b.kind === 'bundle');
  // 10개를 왼쪽 넓은 자리에 흩뿌린다(손에서 먼 쪽 우선)
  const spots = []; for (let i = 0; i < 10; i++) spots.push({ x: 110 + (i % 5) * 120 + (Math.random() - .5) * 30, y: 150 + (i / 5 | 0) * 200 + (Math.random() - .5) * 50 });
  bundle.forEach((b, i) => { b.tx = spots[i].x; b.ty = spots[i].y; b.vx = (Math.random() - .5) * 900; b.vy = -300 - Math.random() * 400; b.free = true; });
  S.bits.push({ kind: 'text', x: S.knot.x, y: S.knot.y - 40, txt: '10이 풀렸다!', a: 1.6, c: '#ffd35c' }); }
function popBalloon(b){ b.alive = false; pop(); S.popped++; if (b.kind === 'loose') S.popLoose++; else S.popBundle++;
  for (let i = 0; i < 14; i++) { const an = Math.random() * 6.28, sp = 200 + Math.random() * 400; S.bits.push({ kind: 'dot', x: b.x, y: b.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, a: 1, c: b.col }); }
  S.bits.push({ kind: 'text', x: b.x, y: b.y - 50, txt: `${S.popped}`, a: 1.2, c: '#fff' });
  if (S.popped >= S.b) { S.phase = 'count'; S.countT = performance.now() + 700; S.countI = 0; const left = S.balloons.filter(x => x.alive); left.forEach((x, i) => { x.tx = W / 2 - (left.length - 1) * 48 + i * 96; x.ty = 300; x.free = false; }); } }

// ── 손 → 손가락 끝
function readHands(f){ S.hands = []; f.hands.forEach((h, i) => { const a = f.actions.hands[i]; if (!a) return; S.hands.push({ x: a.pointer.x / CW * W, y: a.pointer.y / CH * H, i }); });
  if (km.mouse) S.hands = [{ x: S.mouse.x, y: S.mouse.y, i: 0 }]; }
stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); S.mouse.x = (e.clientX - r.left) / r.width * W; S.mouse.y = (e.clientY - r.top) / r.height * H; });

// ── 진행
function update(dt, t){
  for (const b of S.balloons) { if (!b.alive) continue;
    if (b.free) { b.vx = (b.vx || 0) * .9; b.vy = (b.vy || 0) * .9 + 300 * dt; b.x += b.vx * dt + (b.tx - b.x) * 4 * dt; b.y += b.vy * dt + (b.ty - b.y) * 4 * dt; if (Math.abs(b.vx) < 20 && Math.abs(b.vy) < 20) b.free = false; }
    else { b.x += (b.tx - b.x) * 6 * dt; b.y += (b.ty - b.y) * 6 * dt; }
    b.phase += dt * 1.6; }
  if (S.phase === 'play') {
    let hovering = false;
    for (const h of S.hands) {
      // 매듭 풀기(0.5초 대기)
      if (S.tied && Math.hypot(h.x - S.knot.x, h.y - S.knot.y) < 60) { hovering = true; S.hover.t += dt; if (S.hover.t >= .5) untie(); }
      // 풍선 터뜨리기
      for (const b of S.balloons) { if (!b.alive || (b.kind === 'bundle' && S.tied)) continue; const bob = Math.sin(b.phase) * 6; if (Math.hypot(h.x - b.x, h.y - (b.y + bob)) < b.r + 6) { popBalloon(b); if (S.phase !== 'play') break; } }
      if (S.phase !== 'play') break; }
    if (!hovering) S.hover.t = 0;
  } else if (S.phase === 'count') {
    const left = S.balloons.filter(x => x.alive);
    if (t >= S.countT && S.countI < left.length) { S.countI++; tone(440 + S.countI * 60, .25, 'sine', .25); S.countT = t + 420; if (S.countI === left.length) { S.phase = 'done'; S.score++; $('hScore').textContent = S.score; fanfare(); S.nextT = t + 3200; for (let i = 0; i < 40; i++) S.bits.push({ kind: 'dot', x: W / 2 + (Math.random() - .5) * 600, y: 120, vx: (Math.random() - .5) * 300, vy: Math.random() * 200, a: 2, c: COLORS[i % COLORS.length] }); } }
  } else if (S.phase === 'done') { if (t >= S.nextT) { S.pi++; if (S.pi >= S.probs.length) end(); else setProblem(); } }
  for (const p of S.bits) { if (p.kind === 'dot') { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.a -= dt * 1.4; } else { p.y -= 40 * dt; p.a -= dt; } } S.bits = S.bits.filter(p => p.a > 0);
}

// ── 그리기
function drawBalloon(b, dim){ const bob = Math.sin(b.phase) * 6; const x = b.x, y = b.y + bob; ctx.save(); ctx.globalAlpha = dim ? .85 : 1;
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + b.r); ctx.quadraticCurveTo(x + 6, y + b.r + 30, x - 4, y + b.r + 60); ctx.stroke();
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
  const g = ctx.createRadialGradient(x - b.r * .35, y - b.r * .4, 4, x, y, b.r * 1.1); g.addColorStop(0, '#fff'); g.addColorStop(.25, b.col); g.addColorStop(1, shade(b.col)); ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, b.r * .9, b.r, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = b.col; ctx.beginPath(); ctx.moveTo(x - 6, y + b.r - 2); ctx.lineTo(x + 6, y + b.r - 2); ctx.lineTo(x, y + b.r + 8); ctx.closePath(); ctx.fill();
  ctx.restore(); }
function shade(hex){ const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * .55 | 0, g = ((n >> 8) & 255) * .55 | 0, b = (n & 255) * .55 | 0; return `rgb(${r},${g},${b})`; }
function draw(t){
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1b3a7a'); sky.addColorStop(1, '#0a1430'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { const x = (i * 173) % W, y = (i * 97 + t / 60) % H; ctx.fillStyle = `rgba(255,255,255,${.15 + (i % 3) * .1})`; ctx.fillRect(x, y, 2, 2); }
  // 문제
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (S.phase === 'play' || S.phase === 'count') { ctx.fillStyle = '#fff'; ctx.font = '900 64px sans-serif'; ctx.fillText(`${S.a} − ${S.b}`, W / 2, 90);
    ctx.font = '800 30px sans-serif'; ctx.fillStyle = '#ffd35c'; ctx.fillText(S.phase === 'play' ? `풍선을 ${S.b}개 터뜨려요  (${S.popped}개 터뜨림)` : '남은 풍선을 세어 봐요', W / 2, 145); }
  if (S.phase === 'play' && S.tied) {
    // 묶음 틀·끈·매듭
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.strokeRect(BX - GAP / 2, BY - GAP / 2, GAP * 5, GAP * 2);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '800 22px sans-serif'; ctx.fillText('10개 묶음', BX + 2 * GAP, BY - GAP / 2 - 18);
    for (const b of S.balloons) if (b.kind === 'bundle') { ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y + R); ctx.lineTo(S.knot.x, S.knot.y); ctx.stroke(); }
    const k = S.knot, p = S.hover.t / .5; ctx.fillStyle = '#ffd35c'; ctx.beginPath(); ctx.arc(k.x, k.y, 22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2a1a00'; ctx.font = '900 20px sans-serif'; ctx.fillText('끈', k.x, k.y);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(k.x, k.y, 40, 0, Math.PI * 2); ctx.stroke(); if (p > 0) { ctx.strokeStyle = '#5cf2a4'; ctx.beginPath(); ctx.arc(k.x, k.y, 40, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '700 20px sans-serif'; ctx.fillText('손을 대면 10이 풀려요', k.x, k.y + 72); }
  if (S.phase === 'play') { const ones = S.a - 10; if (ones) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '800 22px sans-serif'; ctx.fillText(`낱개 ${ones}개`, 760 + Math.min(ones, 4) * 55 - 55, 130); } }
  for (const b of S.balloons) if (b.alive) drawBalloon(b, b.kind === 'bundle' && S.tied);
  // 세기·답
  if (S.phase === 'count' || S.phase === 'done') { const left = S.balloons.filter(x => x.alive);
    for (let i = 0; i < S.countI && i < left.length; i++) { ctx.fillStyle = '#fff'; ctx.font = '900 44px sans-serif'; ctx.fillText(i + 1, left[i].x, left[i].y + 100); }
    if (S.phase === 'done') { ctx.fillStyle = '#ffd35c'; ctx.font = '900 80px sans-serif'; ctx.fillText(`${S.a} − ${S.b} = ${S.a - S.b}`, W / 2, 500);
      const a = S.a, b = S.b, o = a - 10; let how = '';
      if (S.popBundle === 0) how = `빼서 10 만들기 · ${a} − ${o} = 10, 10 − ${b - o} = ${a - b}`;
      else if (S.popLoose === 0) how = `10에서 빼기 · 10 − ${b} = ${10 - b}, ${10 - b} + ${o} = ${a - b}`;
      else how = `낱개 ${S.popLoose}개 + 묶음에서 ${S.popBundle}개 = ${b}개 터뜨렸어요`;
      ctx.fillStyle = '#5cf2a4'; ctx.font = '800 32px sans-serif'; ctx.fillText(how, W / 2, 580); } }
  for (const p of S.bits) { ctx.globalAlpha = Math.min(1, p.a); if (p.kind === 'dot') { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); } else { ctx.fillStyle = p.c; ctx.font = '900 40px sans-serif'; ctx.fillText(p.txt, p.x, p.y); } ctx.globalAlpha = 1; }
  // 손가락 = 바늘
  for (const h of S.hands) { ctx.save(); ctx.translate(h.x, h.y); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 34); ctx.stroke(); ctx.fillStyle = '#4de1ff'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(77,225,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  if (!S.hands.length && !km.mouse) { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '900 30px sans-serif'; ctx.fillText('손을 카메라에 보여 주세요', W / 2, H - 60); }
}

// ── 루프
let last = 0;
km.onFrame = f => { km.drawCamera(); f.hands.forEach(h => km.drawSkeleton(h, km.HAND_BONES, 'rgba(77,225,255,.8)', 3)); if (S.on) readHands(f); };
km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); };
function loop(t){ requestAnimationFrame(loop); const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; if (!S.on) return; update(dt, t); draw(t); }
let N = 10; $('optN').onclick = e => { const b = e.target.closest('button'); if (!b) return; N = +b.dataset.n; [...$('optN').children].forEach(x => x.classList.toggle('on', x === b)); };
async function start(){ audio(); $('msg').textContent = '카메라 여는 중…'; try { if (!km.running) await km.start(); } catch (e) { $('msg').textContent = '카메라를 열 수 없어요: ' + e.message; return; }
  S.probs = makeProblems(N); S.pi = 0; S.score = 0; $('hScore').textContent = 0; setProblem(); S.on = true; $('ov').classList.add('hidden'); }
function end(){ S.on = false; $('ov').classList.remove('hidden'); $('ov').querySelector('h1').textContent = `🎈 ${S.score}문제 해결!`; $('msg').textContent = S.score ? '풍선 다 터뜨렸어요 — 한 번 더 할까요?' : ''; $('btnStart').textContent = '다시'; }
$('btnStart').onclick = start; $('btnQuit').onclick = end;
requestAnimationFrame(loop);
