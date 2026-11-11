/* 셈 자리 넣기 — 먹보가 오기 전에! (1학년 수학 · 덧셈과 뺄셈 복습)
 * 식(7 + 5 = □□ / 13 − 6 = □□)을 보고 0~9 숫자 카드를 집어 「십의 자리·일의 자리」에 넣는다.
 * 답이 한 자리 수면 일의 자리에만 넣는다(십의 자리에 넣으면 틀림 — 자릿값 복습).
 * 문제: 한 자리 + 한 자리 / 십몇(10~19) − 한 자리, 단계 「받아올림·받아내림만」.
 * 긴장 층(칠교와 같음): 먹보가 걸어온다(= 남은 시간). 맞는 숫자를 넣을 때마다 밀려나고,
 *   끝까지 오면 하트 1 감소 + 답을 보여 주고 다음 문제. 문제가 넘어갈수록 빨라진다.
 * 한 판 = 20문제. 끝 화면 = 맞힌 수·점수·가장 빠른 풀이·놓친 문제 다시 보기.
 * 입력: 화면 터치(여러 손가락 동시) / 카메라 손(주먹 = 잡기, 활짝 0.3초 = 놓기 — 칠교 v1.0.2 규칙).
 * 영상은 기기 안에서만 처리. 저장 없음.
 */
(function(){
const $ = id => document.getElementById(id);
const stage = $('stage'), ctx = stage.getContext('2d'); const W = stage.width, H = stage.height;
const CW = $('c').width, CH = $('c').height;
let km = null;
const OPT = { input: 'touch', prob: 'mix', level: 'all', speed: 'normal' };
const QN = 20, HEARTS = 3, CAM_GAIN = 1.6;
const TRACK = { x0: 250, x1: 1010, y: 84 };
// 식·자리·카드 배치(1280×720)
const EQ = { cx: 430, cy: 280 };
const SLOT_W = 130, SLOT_H = 160;
const SLOTS0 = [{ k: 't', name: '십', cx: 790, cy: 280 }, { k: 'o', name: '일', cx: 940, cy: 280 }];
const CARD_W = 104, CARD_H = 112, CARD_Y = 620;
const CARDS = Array.from({ length: 10 }, (_, d) => ({ d, x: 82 + d * 124, y: CARD_Y }));
const DCOL = ['#7a6cf0', '#ff6b8b', '#ff9d5c', '#e0a400', '#2bb673', '#26c6a6', '#29a8e0', '#3a7bd5', '#b05ce0', '#e8475f'];

const S = { state: 'menu', round: 0, q: null, slots: [], grabs: new Map(), cursors: new Map(), T: 0, left: 0, hearts: HEARTS, score: 0, combo: 0, solved: 0, wrong: 0, best: 1e9, missed: [], bits: [], msg: null, stT: 0, tickT: 0, stepT: 0, sound: true, banner: null, monFly: 0, close: false, last: [], qT: 0 };
const timed = () => OPT.speed !== 'off';
const isCam = () => OPT.input === 'cam';

// ── 소리
let ac = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
function tone(f, dur = .2, type = 'triangle', vol = .18, at = 0, f2){ if (!ac || !S.sound) return; const t = ac.currentTime + at; const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .05); }
const SND = {
  grab(){ tone(520, .06, 'triangle', .1); },
  put(){ tone(760, .1, 'triangle', .18); tone(1140, .12, 'sine', .12, .06); },
  nope(){ tone(300, .18, 'sawtooth', .09, 0, 200); },
  done(n){ [523, 659, 784, 1047].forEach((f, i) => tone(f + Math.min(6, n) * 30, .22, 'sine', .16, i * .06)); },
  tick(){ tone(1100, .035, 'square', .07); },
  step(){ tone(120, .06, 'sine', .1); },
  eat(){ tone(400, .5, 'sawtooth', .16, 0, 90); tone(140, .3, 'square', .12, .45); },
  whoosh(){ tone(900, .45, 'sine', .12, 0, 180); },
  close(){ [880, 1175, 1568].forEach((f, i) => tone(f, .16, 'triangle', .16, i * .06)); }
};
function say(txt){ try { if (!S.sound || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'ko-KR'; u.rate = 1.15; u.pitch = 1.3; speechSynthesis.speak(u); } catch (_) {} }
const KNUM = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이', '십삼', '십사', '십오', '십육', '십칠', '십팔', '십구'];
const qText = q => `${q.a} ${q.op} ${q.b}`;
const qSay = q => `${KNUM[q.a]} ${q.op === '+' ? '더하기' : '빼기'} ${KNUM[q.b]}`;

// ── 문제 만들기
function makeQ(){
  const ri = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const kind = OPT.prob === 'mix' ? (Math.random() < .5 ? '+' : '−') : OPT.prob === 'add' ? '+' : '−';
  for (let tries = 0; tries < 200; tries++) {
    let a, b, ans;
    if (kind === '+') { a = ri(1, 9); b = ri(1, 9); ans = a + b; if (OPT.level === 'carry' && ans < 10) continue; }
    else { a = ri(10, 19); b = ri(1, 9); ans = a - b; if (OPT.level === 'carry' && a % 10 >= b) continue; }
    const key = `${a}${kind}${b}`; if (S.last.includes(key)) continue;
    S.last.push(key); if (S.last.length > 8) S.last.shift();
    return { a, b, op: kind, ans, t: Math.floor(ans / 10), o: ans % 10, key };
  }
  return { a: 7, b: 5, op: '+', ans: 12, t: 1, o: 2, key: '7+5' };
}

// ── 판 흐름
function startGame(){ Object.assign(S, { round: 0, hearts: HEARTS, score: 0, combo: 0, solved: 0, wrong: 0, best: 1e9, missed: [], bits: [], last: [] }); $('ovEnd').classList.add('hidden'); loadQ(); }
function loadQ(){
  if (S.round >= QN) return endGame(true);
  S.q = makeQ(); S.slots = SLOTS0.map(s => ({ ...s, val: null, flash: 0, glow: 0 })); S.grabs.clear(); S.msg = null; S.banner = null; S.close = false; S.monFly = 0; S.qWrong = 0; S.qT = 0;
  const base = isCam() ? 15 : 8.5; const mul = { slow: 1.6, normal: 1, fast: .7, off: 1 }[OPT.speed];
  S.T = base * mul * Math.max(.6, Math.pow(.96, S.round)); S.left = S.T;
  S.state = 'intro'; S.stT = 0; say(qSay(S.q));
}
const need = q => q.ans >= 10 ? ['t', 'o'] : ['o'];
function solvedNow(){ const q = S.q; return need(q).every(k => S.slots.find(s => s.k === k).val !== null); }
function put(slot, d){
  const q = S.q; const want = slot.k === 't' ? (q.ans >= 10 ? q.t : null) : q.o;
  if (slot.val !== null) return false;
  if (want === d) {
    slot.val = d; slot.flash = 1; SND.put(); burst(slot.cx, slot.cy, DCOL[d], 12);
    if (timed()) S.left = Math.min(S.T, S.left + (isCam() ? 1.8 : 1));
    if (solvedNow()) complete();
    return true;
  }
  S.qWrong++; S.wrong++; S.combo = 0; SND.nope(); slot.shake = 1;
  let m;
  if (slot.k === 't' && q.ans < 10) m = '답이 한 자리 수예요 — 일의 자리에 넣어요';
  else if (slot.k === 't') m = '십의 자리를 다시 생각해 봐요';
  else m = '일의 자리를 다시 생각해 봐요';
  if (S.qWrong >= 2) m += ' · 아래 그림을 봐요';
  S.msg = { txt: m, t: 2.2 };
  return false;
}
function complete(){
  S.state = 'done'; S.stT = 0; S.solved++; if (S.qWrong === 0) S.combo++; else S.combo = 0;
  S.best = Math.min(S.best, S.qT);
  let pts = 10 + Math.min(10, S.combo) * 2, bonus = 0;
  if (timed()) { bonus = Math.round(S.left * 3); S.close = S.left / S.T < .15; if (S.close) bonus += 20; S.monFly = .001; SND.whoosh(); }
  S.score += pts + bonus;
  S.banner = { txt: `${qText(S.q)} = ${S.q.ans} 정답!`, sub: S.qT < 4 ? `⚡ ${S.qT.toFixed(1)}초 만에!` : `${S.qT.toFixed(1)}초`, bonus };
  if (S.close) SND.close(); SND.done(S.combo); say(S.close ? '아슬아슬! ' + KNUM[S.q.ans] : KNUM[S.q.ans] + '! 정답');
  burst(870, 280, '#ffd35c', 24);
}
function eaten(){
  S.state = 'eaten'; S.stT = 0; S.hearts--; S.combo = 0; S.grabs.clear(); SND.eat();
  S.missed.push(S.q); say(`${qSay(S.q)}는 ${KNUM[S.q.ans]}`);
  S.banner = { txt: `😋 먹보가 먹어 버렸어! 답은 ${S.q.ans}`, sub: S.hearts > 0 ? `${qText(S.q)} = ${S.q.ans}` : '', bonus: 0, bad: true };
}
function nextQ(){ S.round++; loadQ(); }
function endGame(all){
  S.state = 'end'; S.grabs.clear(); const el = $('ovEnd'); $('tools').style.display = 'none';
  const miss = S.missed.length ? `<p>다시 보기 — 먹보에게 놓친 문제</p><div class="res">${S.missed.map(q => `<span>${qText(q)} = <b style="color:#e8475f">${q.ans}</b></span>`).join('')}</div>` : '<p>놓친 문제 없음! 👏</p>';
  el.innerHTML = `<span class="k">K-MOTION · 셈 자리 넣기</span><h1>${all ? '🏆 20문제 끝!' : '끝! 잘했어요'}</h1>
    <div class="res"><span>맞힌 문제 ${S.solved}개</span>${timed() ? `<span>점수 ${S.score}</span>` : ''}${S.best < 1e9 ? `<span>⚡ 가장 빨리 ${S.best.toFixed(1)}초</span>` : ''}</div>
    ${miss}
    <div class="row"><button class="big" id="bAgain">다시 하기</button><button class="big" id="bHome" style="background:#fff;border:3px solid #ffd35c">처음으로</button></div>`;
  el.classList.remove('hidden'); $('bAgain').onclick = () => { audio(); $('tools').style.display = 'flex'; startGame(); }; $('bHome').onclick = toMenu;
  if (all) SND.done(5);
}
function toMenu(){ S.state = 'menu'; $('ovEnd').classList.add('hidden'); $('ov').classList.remove('hidden'); $('tools').style.display = 'none'; if (km && km.running) km.stop(); $('camBox').classList.add('off'); S.cursors.clear(); S.grabs.clear(); }
function burst(x, y, col, n){ for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = 120 + Math.random() * 380; S.bits.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, a: 1.1, c: Math.random() < .6 ? col : '#fff', r: 3 + Math.random() * 5 }); } }

// ── 잡기·놓기(터치·카메라 공통). 카드 줄의 카드는 그대로 있고, 잡으면 같은 숫자 카드가 하나 떠오른다.
function pickCard(pt, pad){ let best = null, bd = 1e9; for (const c of CARDS) { if (Math.abs(pt.x - c.x) < CARD_W / 2 + pad && Math.abs(pt.y - c.y) < CARD_H / 2 + pad) { const d = Math.hypot(pt.x - c.x, pt.y - c.y); if (d < bd) { bd = d; best = c; } } } return best; }
function grab(id, pt, pad){ if (S.state !== 'play' || S.grabs.has(id)) return false; const c = pickCard(pt, pad); if (!c) return false; S.grabs.set(id, { d: c.d, x: c.x, y: c.y, ox: c.x - pt.x, oy: c.y - pt.y, pop: .6 }); SND.grab(); return true; }
function drag(id, pt){ const g = S.grabs.get(id); if (!g || S.state !== 'play') return; g.x = Math.max(40, Math.min(W - 40, pt.x + g.ox)); g.y = Math.max(140, Math.min(H - 40, pt.y + g.oy)); }
function slotAt(g, pad){ let best = null, bd = 1e9; for (const s of S.slots) { if (s.val !== null) continue; if (Math.abs(g.x - s.cx) < SLOT_W / 2 + pad && Math.abs(g.y - s.cy) < SLOT_H / 2 + pad) { const d = Math.hypot(g.x - s.cx, g.y - s.cy); if (d < bd) { bd = d; best = s; } } } return best; }
function release(id){ const g = S.grabs.get(id); if (!g) return; S.grabs.delete(id); if (S.state !== 'play') return; const s = slotAt(g, isCam() ? 50 : 24); if (s) put(s, g.d); }

// ── 입력: 터치·마우스(여러 손가락 동시)
function toStage(e){ const r = stage.getBoundingClientRect(); const s = Math.min(r.width / W, r.height / H); const ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2; return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s }; }
stage.addEventListener('pointerdown', e => { if (isCam()) return; audio(); if (grab('p' + e.pointerId, toStage(e), 10)) { try { stage.setPointerCapture(e.pointerId); } catch (_) {} } });
stage.addEventListener('pointermove', e => { if (isCam()) return; drag('p' + e.pointerId, toStage(e)); });
const pUp = e => { if (isCam()) return; release('p' + e.pointerId); };
stage.addEventListener('pointerup', pUp); stage.addEventListener('pointercancel', pUp);

// ── 입력: 카메라 손(칠교 v1.0.2 규칙 그대로 — 활짝 편 손 0.3초에만 놓음, 사라지면 1.5초 대기, 가까운 커서에 이어 붙임)
let camSeq = 0;
function readCam(f){
  const now = performance.now(); const free = new Set(S.cursors.keys());
  const hands = ((f.actions && f.actions.hands) || []).map(a => { const src = a.center || a.pointer; if (!src) return null;
    return { a, id: null, tx: Math.max(10, Math.min(W - 10, ((src.x / CW - .5) * CAM_GAIN + .5) * W)), ty: Math.max(10, Math.min(H - 10, ((src.y / CH - .5) * CAM_GAIN + .5) * H)) }; }).filter(Boolean);
  const pairs = []; hands.forEach(h => { for (const k of free) { const q = S.cursors.get(k); const d = Math.hypot(q.tx - h.tx, q.ty - h.ty); if (d < 340) pairs.push({ h, k, d }); } });
  pairs.sort((x, y) => x.d - y.d).forEach(pr => { if (pr.h.id === null && free.has(pr.k)) { pr.h.id = pr.k; free.delete(pr.k); } });
  hands.forEach(h => { if (h.id !== null) return; let hd = 1e9, pickId = null; for (const k of free) if (S.grabs.has(k)) { const q = S.cursors.get(k); const d = Math.hypot(q.tx - h.tx, q.ty - h.ty); if (d < hd) { hd = d; pickId = k; } }
    if (pickId !== null) { h.id = pickId; free.delete(pickId); } else { h.id = 'h' + (++camSeq); S.cursors.set(h.id, { x: h.tx, y: h.ty, tx: h.tx, ty: h.ty, grab: false, offT: 0 }); } });
  hands.forEach(h => { const a = h.a, id = h.id, c = S.cursors.get(id); c.tx = h.tx; c.ty = h.ty; c.x += (h.tx - c.x) * .5; c.y += (h.ty - c.y) * .5; c.seen = now; c.lost = false;
    const g = !!(a.pinched || a.pose === 'fist' || a.pose === 'pinch');
    if (g) { c.offT = 0; c.grab = true; if (!S.grabs.has(id)) grab(id, c, 30); drag(id, c); }
    else if (S.grabs.has(id)) { drag(id, c); if (a.pose === 'open') { if (!c.offT) c.offT = now; if (now - c.offT > 300) { c.grab = false; c.offT = 0; release(id); } } else c.offT = 0; }
    else c.grab = false;
  });
  for (const id of free) { const c = S.cursors.get(id); c.lost = true; if (now - c.seen > 1500 || !S.grabs.has(id) && now - c.seen > 350) { if (S.grabs.has(id)) S.grabs.delete(id); S.cursors.delete(id); } }
}

// ── 갱신
function update(dt){
  for (const s of S.slots) { s.flash = Math.max(0, s.flash - dt * 2); s.shake = Math.max(0, (s.shake || 0) - dt * 3); }
  for (const g of S.grabs.values()) g.pop = Math.max(0, g.pop - dt * 3);
  S.stT += dt;
  if (S.state === 'intro' && S.stT > .9) { S.state = 'play'; S.stT = 0; }
  else if (S.state === 'play') { S.qT += dt;
    if (timed()) { S.left -= dt; const pr = 1 - S.left / S.T;
      S.stepT -= dt; if (S.stepT <= 0) { S.stepT = .5; SND.step(); }
      if (pr > .7) { S.tickT -= dt; if (S.tickT <= 0) { S.tickT = .55 - (pr - .7) / .3 * .4; SND.tick(); } }
      if (S.left <= 0) eaten(); } }
  else if (S.state === 'done') { if (S.monFly) S.monFly += dt; if (S.stT > 1.5) nextQ(); }
  else if (S.state === 'eaten' && S.stT > 2.6) { if (S.hearts <= 0) endGame(false); else nextQ(); }
  for (const b of S.bits) { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 700 * dt; b.a -= dt * 1.3; } S.bits = S.bits.filter(b => b.a > 0);
  if (S.msg) { S.msg.t -= dt; if (S.msg.t <= 0) S.msg = null; }
}
function prog(){ return timed() ? Math.max(0, Math.min(1, 1 - S.left / S.T)) : 0; }
function monPos(){ if (S.state === 'eaten') { const k = Math.min(1, S.stT / .5); return { x: TRACK.x1 + (870 - TRACK.x1) * k, y: TRACK.y + (230 - TRACK.y) * k - Math.sin(k * Math.PI) * 60 }; } return { x: TRACK.x0 + (TRACK.x1 - TRACK.x0) * prog(), y: TRACK.y }; }

// ── 그리기
function rr(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawCard(d, x, y, sc, lift){
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.shadowColor = lift ? 'rgba(20,40,90,.35)' : 'rgba(20,40,90,.16)'; ctx.shadowBlur = lift ? 22 : 8; ctx.shadowOffsetY = lift ? 10 : 4;
  rr(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5; ctx.strokeStyle = DCOL[d]; ctx.stroke();
  ctx.font = '900 76px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = DCOL[d]; ctx.fillText(String(d), 0, 5);
  ctx.restore();
}
function drawMonster(t){
  const y = TRACK.y; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(29,42,68,.25)'; ctx.lineWidth = 6; ctx.setLineDash([2, 16]); ctx.beginPath(); ctx.moveTo(TRACK.x0, y + 30); ctx.lineTo(TRACK.x1, y + 30); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(TRACK.x1 + 6, y + 30, 40, 9, 0, 0, 6.2832); ctx.fill(); ctx.strokeStyle = '#c9d8ea'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = '900 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ff6b8b'; ctx.fillText('1', TRACK.x1 - 12, y + 15); ctx.fillStyle = '#2bb673'; ctx.fillText('2', TRACK.x1 + 6, y + 13); ctx.fillStyle = '#3a7bd5'; ctx.fillText('3', TRACK.x1 + 24, y + 15);
  if (!timed()) return;
  const pr = prog(); let m = monPos(), rot = 0, s = 1;
  if (S.monFly) { const k = Math.min(1, S.monFly / .9); m = { x: m.x - k * 520, y: m.y - Math.sin(k * Math.PI) * 90 }; rot = -k * 9; s = 1 - k * .4; if (k >= 1) return; }
  const walk = S.state === 'play'; const bob = walk ? Math.abs(Math.sin(t / 130)) * 5 : 0; const ang = pr > .7 && walk;
  if (S.state === 'eaten') s = 1 + Math.min(1, S.stT / .5) * .9;
  ctx.save(); ctx.translate(m.x, m.y - bob); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#4a2c8a'; ctx.lineWidth = 7; const lg = walk ? Math.sin(t / 130) * 9 : 0; ctx.beginPath(); ctx.moveTo(-10, 20); ctx.lineTo(-10 + lg, 32 + bob); ctx.moveTo(10, 20); ctx.lineTo(10 - lg, 32 + bob); ctx.stroke();
  ctx.fillStyle = ang ? '#b0306e' : '#7a4fd6'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 27, 0, 0, 6.2832); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#3d2278'; ctx.stroke();
  ctx.fillStyle = '#ffd35c'; ctx.beginPath(); ctx.moveTo(-18, -20); ctx.lineTo(-12, -36); ctx.lineTo(-6, -24); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(18, -20); ctx.lineTo(12, -36); ctx.lineTo(6, -24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4, -8, 8, 0, 6.2832); ctx.arc(20, -6, 7, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#1d2a44'; ctx.beginPath(); ctx.arc(7, -7, 3.5, 0, 6.2832); ctx.arc(23, -5, 3, 0, 6.2832); ctx.fill();
  const mo = S.state === 'eaten' ? 14 : 3 + pr * 9 + (walk ? Math.abs(Math.sin(t / 160)) * 3 : 0); ctx.fillStyle = '#2a0d3d'; ctx.beginPath(); ctx.ellipse(10, 10, 14, mo, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(1 + i * 7, 10 - mo + 1); ctx.lineTo(4.5 + i * 7, 10 - mo + 7); ctx.lineTo(8 + i * 7, 10 - mo + 1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  if (S.monFly) { ctx.font = '900 24px sans-serif'; ctx.fillStyle = '#7a4fd6'; ctx.fillText('으악~!', m.x, m.y - 48); }
  else if (ang) { ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#e8475f'; ctx.fillText('냠냠… 거의 다 왔다!', Math.min(m.x, TRACK.x1 - 150), y - 46); }
}
// 도움 그림(두 번 틀리면): 10칸 상자 두 개. 덧셈 = 앞 수(분홍) 채우고 뒤 수(파랑)를 이어 채움 → 10칸이 차면 다음 상자로(받아올림).
// 뺄셈 = 십몇을 채우고, 빼는 수만큼 뒤에서부터 × 표시(받아내림이면 10칸 상자에서 지움).
function drawHint(){
  const q = S.q; const C = 30, gx = 430 - (5 * C * 2 + 24) / 2, gy = 418;
  const dots = [];
  if (q.op === '+') { for (let i = 0; i < q.a; i++) dots.push({ c: '#ff6b8b' }); for (let i = 0; i < q.b; i++) dots.push({ c: '#3a7bd5' }); }
  else { for (let i = 0; i < q.a; i++) dots.push({ c: '#2bb673', x: i >= q.a - q.b }); }
  ctx.font = '800 16px sans-serif'; ctx.fillStyle = '#8a97b3'; ctx.textAlign = 'center'; ctx.fillText(q.op === '+' ? '10칸이 차면 십이 하나!' : '× 한 것을 빼요', 430, gy - 16);
  for (let f = 0; f < 2; f++) { const ox = gx + f * (5 * C + 24);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const i = f * 10 + r * 5 + c; const x = ox + c * C, y = gy + r * C;
      ctx.strokeStyle = '#c9d8ea'; ctx.lineWidth = 2; ctx.strokeRect(x, y, C, C);
      const d = dots[i]; if (!d) continue; ctx.beginPath(); ctx.arc(x + C / 2, y + C / 2, C * .36, 0, 6.2832); ctx.fillStyle = d.c; ctx.fill();
      if (d.x) { ctx.strokeStyle = '#1d2a44'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 7, y + 7); ctx.lineTo(x + C - 7, y + C - 7); ctx.moveTo(x + C - 7, y + 7); ctx.lineTo(x + 7, y + C - 7); ctx.stroke(); } } }
}
function draw(t){
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#bfe8ff'); g.addColorStop(1, '#e3f5ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // 판
  ctx.save(); ctx.shadowColor = 'rgba(30,60,120,.2)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(150, 150, 980, 380, 34); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.restore();
  // 카드 줄 받침
  rr(20, CARD_Y - CARD_H / 2 - 12, W - 40, CARD_H + 24, 26); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fill();
  if (S.q && S.state !== 'end') { const q = S.q; const done = S.state === 'done';
    // 식
    const k = S.state === 'intro' ? Math.min(1, S.stT / .25) : 1; ctx.save(); ctx.translate(EQ.cx, EQ.cy); ctx.scale(.6 + .4 * k, .6 + .4 * k);
    ctx.font = '900 118px sans-serif'; ctx.fillStyle = '#1d2a44'; ctx.fillText(`${q.a} ${q.op} ${q.b} =`, 0, 6); ctx.restore();
    // 자리
    for (const s of S.slots) { const sh = (s.shake || 0) * Math.sin(t / 18) * 10; const x = s.cx - SLOT_W / 2 + sh, y = s.cy - SLOT_H / 2;
      const off = s.k === 't' && q.ans < 10 && s.val === null;
      ctx.font = '900 22px sans-serif'; ctx.fillStyle = off ? '#b8c3d6' : '#3b4a66'; ctx.fillText(`${s.name}의 자리`, s.cx, y - 22);
      rr(x, y, SLOT_W, SLOT_H, 22);
      if (s.val !== null) { ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = done ? '#ffd35c' : DCOL[s.val]; ctx.stroke(); ctx.font = `900 ${Math.round(110 * (1 + s.flash * .2))}px sans-serif`; ctx.fillStyle = DCOL[s.val]; ctx.fillText(String(s.val), s.cx, s.cy + 6); }
      else if (S.state === 'eaten') { ctx.fillStyle = '#efe9ff'; ctx.fill(); const v = s.k === 't' ? (q.ans >= 10 ? q.t : '') : q.o; ctx.font = '900 110px sans-serif'; ctx.fillStyle = '#7a4fd6'; ctx.fillText(String(v), s.cx, s.cy + 6); }
      else { ctx.fillStyle = off ? 'rgba(220,228,240,.35)' : 'rgba(58,123,213,.08)'; ctx.fill(); ctx.setLineDash([12, 10]); ctx.lineWidth = 4; ctx.strokeStyle = off ? '#d3dbe8' : '#3a7bd5'; ctx.stroke(); ctx.setLineDash([]);
        // 카드를 들고 위에 오면 빛
        let over = false; for (const gg of S.grabs.values()) if (slotAt(gg, isCam() ? 50 : 24) === s) over = true;
        if (over) { rr(x, y, SLOT_W, SLOT_H, 22); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,179,0,.9)'; ctx.stroke(); } } }
    if (S.qWrong >= 2 && S.state === 'play') drawHint();
    ctx.font = '800 16px sans-serif'; ctx.fillStyle = '#8a97b3'; ctx.textAlign = 'left'; ctx.fillText(`문제 ${S.round + 1} / ${QN}`, 180, 178); ctx.textAlign = 'center';
  }
  drawMonster(t);
  if (timed()) { ctx.font = '30px sans-serif'; for (let i = 0; i < HEARTS; i++) { ctx.globalAlpha = i < S.hearts ? 1 : .2; ctx.fillText('❤️', 1090 + i * 40, 56); } ctx.globalAlpha = 1;
    ctx.font = '900 30px sans-serif'; ctx.fillStyle = '#1d2a44'; ctx.fillText(S.score + '점', 1130, 104); if (S.combo > 1) { ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#e8475f'; ctx.fillText(`${S.combo}연속!`, 1215, 104); } }
  else { ctx.font = '900 22px sans-serif'; ctx.fillStyle = '#3b4a66'; ctx.fillText('연습 — 천천히 해요', 1130, 80); }
  // 카드 줄 → 든 카드
  CARDS.forEach(c => drawCard(c.d, c.x, c.y, 1, false));
  for (const gg of S.grabs.values()) drawCard(gg.d, gg.x, gg.y, 1.08 + gg.pop * .15, true);
  if (isCam()) { for (const [, c] of S.cursors) { ctx.globalAlpha = c.lost ? .35 : 1; ctx.beginPath(); ctx.arc(c.x, c.y, c.grab ? 18 : 24, 0, 6.2832); ctx.fillStyle = c.grab ? 'rgba(255,179,0,.9)' : 'rgba(255,255,255,.55)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = c.grab ? '#fff' : '#ffb300'; ctx.stroke(); ctx.font = '26px sans-serif'; ctx.fillText(c.grab ? '✊' : '🖐', c.x, c.y + 1); } ctx.globalAlpha = 1;
    if (!S.cursors.size && S.state === 'play') { ctx.font = '800 22px sans-serif'; ctx.fillStyle = 'rgba(29,42,68,.7)'; ctx.fillText('손을 카메라에 보여 주세요 — 주먹을 쥐면 잡아요', W / 2, 516); } }
  for (const b of S.bits) { ctx.globalAlpha = Math.min(1, b.a); ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.fill(); } ctx.globalAlpha = 1;
  if (S.banner && (S.state === 'done' || S.state === 'eaten')) { const b = S.banner; const k = Math.min(1, S.stT / .3); const bh = 62 + (b.sub ? 34 : 0) + (b.bonus ? 26 : 0), by = 12 - 20 * (1 - k);
    ctx.globalAlpha = k; rr(W / 2 - 330, by, 660, bh, 26); ctx.fillStyle = b.bad ? 'rgba(74,44,138,.95)' : 'rgba(255,255,255,.97)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = b.bad ? '#7a4fd6' : '#ffd35c'; ctx.stroke();
    ctx.font = '900 34px sans-serif'; ctx.fillStyle = b.bad ? '#fff' : '#1d2a44'; ctx.fillText(b.txt, W / 2, by + 34); let yy = by + 62;
    if (b.sub) { ctx.font = '800 22px sans-serif'; ctx.fillStyle = b.bad ? '#e6dcff' : '#3b4a66'; ctx.fillText(b.sub, W / 2, yy + 8); yy += 34; }
    if (b.bonus) { ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#e8475f'; ctx.fillText((S.close ? '아슬아슬! ' : '') + `남은 시간 +${b.bonus}점`, W / 2, yy + 4); } ctx.globalAlpha = 1; }
  if (S.msg) { ctx.font = '900 24px sans-serif'; const w = ctx.measureText(S.msg.txt).width + 50; rr(W / 2 - w / 2, 494, w, 44, 22); ctx.fillStyle = 'rgba(29,42,68,.88)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(S.msg.txt, W / 2, 516); }
  if (S.state === 'play' && timed()) { const pr = prog(); if (pr > .7) { const a = (pr - .7) / .3 * (.22 + .14 * Math.sin(t / (160 - (pr - .7) * 250))); const vg = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .8); vg.addColorStop(0, 'rgba(232,71,95,0)'); vg.addColorStop(1, `rgba(232,71,95,${Math.max(0, a)})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); } }
}

// ── 돌리기
let last = 0;
function loop(t){ requestAnimationFrame(loop); const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; if (S.state === 'menu') return; if (S.state !== 'end') update(dt); draw(t); }
async function start(){
  audio(); $('msg').textContent = '';
  if (isCam()) { $('camBox').classList.remove('off'); $('msg').textContent = '카메라 여는 중…';
    try { if (!km) { km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['hands'], numHands: 2, activity: 'numslot', inferEvery: 1 });
        km.onFrame = f => { km.drawCamera(); f.hands.forEach(h => km.drawSkeleton(h, km.HAND_BONES, 'rgba(255,211,92,.9)', 3)); if (S.state !== 'menu') readCam(f); };
        km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); }; }
      if (!km.running) await km.start(); }
    catch (e) { $('camBox').classList.add('off'); $('msg').textContent = '카메라를 열 수 없어요(' + e.message + ') — 「화면 터치」로 해 보세요.'; return; }
  } else { $('camBox').classList.add('off'); if (km && km.running) km.stop(); S.cursors.clear(); }
  $('ov').classList.add('hidden'); $('tools').style.display = 'flex'; startGame();
}
function opt(rowId, key){ const row = $(rowId); row.querySelectorAll('button').forEach(b => b.onclick = () => { OPT[key] = b.dataset.v; row.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }); }
opt('optI', 'input'); opt('optP', 'prob'); opt('optL', 'level'); opt('optS', 'speed');
$('bStart').onclick = start;
$('bSkip').onclick = () => { if (S.state === 'play' || S.state === 'intro') nextQ(); };
$('bSnd').onclick = () => { S.sound = !S.sound; $('bSnd').textContent = S.sound ? '🔊 소리' : '🔇 소리'; if (!S.sound && window.speechSynthesis) speechSynthesis.cancel(); };
$('bFs').onclick = () => { const el = $('app'); document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen(); };
$('bMenu').onclick = toMenu;
window.__numslot = { S, OPT, makeQ, startGame, loadQ, put, grab, drag, release, update, draw, readCam, eaten, CARDS, SLOTS0 };
requestAnimationFrame(loop);
})();
