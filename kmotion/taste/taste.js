/* MATH WIZARD 놀이 맛보기 — 준호가 먼저 해 보고 재미있는 것만 깊게 만든다(핸드오프 19 문서 6절 ②).
 * 놀이 여섯(각 1장만, 60~90초): 갈림길 달리기 · 슬라임 가르기 · 구슬 모으기 · 등불 창고 · 성문 지키기 · 시계탑 고치기
 * 구조: 놀이(games/*.js)는 학년을 모른다 → 내용 팩(packs.js)이 학년·학기별 문제를 문제 모양으로 넘긴다.
 * 입력: 화면 터치·마우스(기본) / 카메라 손(쥐기 = 잡기, 활짝 펴기 0.3초 = 놓기 — 칠교 v1.0.2 규칙) · 달리기는 몸 기울이기(어깨) 또는 손 위치
 * 저장 0(기록·설정 어디에도 안 남김). 주소: ?g=1&s=2&game=split&input=cam&speed=slow */
import { TERMS, makePack } from './packs.js';
import { W, H, txt, circle } from './ui.js';
import { fx } from './fx.js';
import run from './games/run.js'; import split from './games/split.js'; import merge from './games/merge.js';
import lamp from './games/lamp.js'; import gate from './games/gate.js'; import clock from './games/clock.js';

const $ = id => document.getElementById(id);
const stage = $('stage'), ctx = stage.getContext('2d');
const qs = new URLSearchParams(location.search);
const OPT = { term: qs.get('g') && qs.get('s') ? `${qs.get('g')}-${qs.get('s')}` : '1-2', input: qs.get('input') === 'cam' || qs.get('mouse') ? 'cam' : 'touch', speed: qs.get('speed') || 'slow', steer: qs.get('steer') || 'lean', sound: 'on', mode: qs.get('mode') === 'time' ? 'time' : 'endless' };
if (!TERMS.some(t => t.id === OPT.term)) OPT.term = '1-2';
const SPEED = { off: 0, slow: 1.6, normal: 1 };
const CAM_GAIN = 1.6, HEARTS = 3, TIME_LIMIT = 90, PER_LEVEL = 4, RAMP = .12;      // 맞힌 4개마다 레벨 +1, 레벨마다 위협이 12% 빨라짐
const BEST = new Map();          // 이번에 켜 둔 동안의 최고 점수(어디에도 저장 안 함)

const S = { state: 'menu', game: null, pack: null, score: { ok: 0, no: 0 }, pts: 0, combo: 0, maxCombo: 0, level: 1, left: 0, timed: false, pulse: 0, hearts: HEARTS, rescued: false, flash: null, ft: 0, lane: 0, sound: true, intro: 0, beat: 0 };
const threat = { v: 0 };
const cursors = new Map();          // id → {id,x,y,grab,prev,jg,jr,cam,seen,offT,gone,pendingUp}

// ── 소리
let ac = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
function tone(f, d = .15, type = 'triangle', g = .15, delay = 0, to){ if (!ac || !S.sound) return; try { const t = ac.currentTime + delay, o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(a); a.connect(ac.destination); o.start(t); o.stop(t + d + .02); } catch (_) {} }
const SFX = { ok(){ tone(660, .12); tone(990, .2, 'triangle', .15, .09); }, no(){ tone(220, .25, 'sawtooth', .1, 0, 140); }, grab(){ tone(520, .06, 'square', .06); }, drop(){ tone(380, .08, 'sine', .12); }, block(){ tone(300, .1, 'square', .1, 0, 700); },
  hit(){ tone(110, .4, 'sawtooth', .18, 0, 60); }, dash(){ tone(500, .5, 'sine', .12, 0, 1400); }, bell(){ tone(784, .9, 'sine', .2); tone(1175, .9, 'sine', .1); }, heart(){ tone(180, .5, 'sawtooth', .2, 0, 70); }, win(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'triangle', .16, i * .11)); } };
function say(text){ try { if (!S.sound || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text)); u.lang = 'ko-KR'; u.rate = 1.05; u.pitch = 1.2; speechSynthesis.speak(u); } catch (_) {} }

// ── 놀이에 넘기는 것
const mult = () => Math.min(5, 1 + Math.floor(S.combo / 3));      // 콤보 3마다 배수 +1 (최대 ×5)
function addPts(p){ S.pts += p; S.pulse = 1; fx.text(W - 120, 176, '+' + p, '#ffe27a', 34); }
const api = { W, H, threat, fx, level: () => S.level, pack: null, rnd: Math.random, say, sfx: n => SFX[n] && SFX[n](), lane: () => S.lane, cursors: () => [...cursors.values()], cursor: id => cursors.get(id),
  flash(m){ S.flash = m; S.ft = 1; },
  correct(bonus = 0){ S.score.ok++; S.combo++; S.maxCombo = Math.max(S.maxCombo, S.combo); threat.v = Math.max(0, threat.v - (S.game.pushBack || 0)); SFX.ok(); if (S.combo > 1) tone(520 + Math.min(12, S.combo) * 60, .1, 'triangle', .1, .16);
    addPts((10 + bonus + (S.level - 1) * 2) * mult());
    const L = 1 + Math.floor(S.score.ok / PER_LEVEL); if (L > S.level) { S.level = L; api.flash(`레벨 ${L}!`); SFX.dash(); fx.flash('255,230,140', .28); } },
  bonus(p){ addPts(p); },
  wrong(){ S.score.no++; if (S.combo >= 3) fx.text(W - 120, 140, '콤보 끊김', '#ffb3b3', 30); S.combo = 0; SFX.no(); },
  finish(){ end(false); } };
const GAMES = [run, split, merge, lamp, gate, clock].map(f => f(api));

// ── 입력 ①: 화면 터치·마우스 (누르는 동안 = 쥠)
function toStage(e){ const r = stage.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2; return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s }; }
stage.addEventListener('pointerdown', e => { audio(); const p = toStage(e), id = 'p' + e.pointerId; const c = cursors.get(id) || { id, prev: false }; Object.assign(c, p, { grab: true, cam: false, gone: false, pendingUp: false, mouse: e.pointerType === 'mouse' }); cursors.set(id, c); try { stage.setPointerCapture(e.pointerId); } catch (_) {} });
stage.addEventListener('pointermove', e => { const id = 'p' + e.pointerId, c = cursors.get(id); if (c) Object.assign(c, toStage(e)); else if (e.pointerType === 'mouse') cursors.set(id, Object.assign({ id, grab: false, prev: false, cam: false, mouse: true }, toStage(e))); });
const pUp = e => { const c = cursors.get('p' + e.pointerId); if (!c) return; if (c.grab && !c.prev) c.pendingUp = true; else c.grab = false; if (!c.mouse) c.gone = true; };
stage.addEventListener('pointerup', pUp); stage.addEventListener('pointercancel', pUp);
window.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') S.lane = Math.max(-1, S.lane - 1); if (e.key === 'ArrowRight') S.lane = Math.min(1, S.lane + 1); if (e.key === 'Escape' && S.state === 'play') end(true); });

// ── 입력 ②: 카메라
let km = null, camSeq = 0; const CW = 480, CH = 360;
const lean = { c0: 0, sw0: 0, n: 0, t0: 0, lane: 0, ok: false };
function readCam(f){
  const now = performance.now(); const free = new Set([...cursors.values()].filter(c => c.cam).map(c => c.id));
  const hands = ((f.actions && f.actions.hands) || []).map(a => { const src = a.center || a.pointer; if (!src) return null; return { a, id: null, x: Math.max(10, Math.min(W - 10, ((src.x / CW - .5) * CAM_GAIN + .5) * W)), y: Math.max(10, Math.min(H - 10, ((src.y / CH - .5) * CAM_GAIN + .5) * H)) }; }).filter(Boolean);
  const pairs = []; hands.forEach(h => { for (const k of free) { const q = cursors.get(k); pairs.push({ h, k, d: Math.hypot(q.x - h.x, q.y - h.y) }); } });
  pairs.sort((x, y) => x.d - y.d).forEach(pr => { if (pr.h.id === null && free.has(pr.k) && pr.d < 420) { pr.h.id = pr.k; free.delete(pr.k); } });
  hands.forEach(h => { if (h.id === null) { h.id = 'h' + (++camSeq); cursors.set(h.id, { id: h.id, cam: true, grab: false, prev: false, offT: 0 }); }
    const c = cursors.get(h.id), a = h.a; c.x = h.x; c.y = h.y; c.seen = now; c.gone = false;
    const g = a.pinched || a.pose === 'fist' || a.pose === 'pinch';
    if (g) { c.grab = true; c.offT = 0; } else if (c.grab) { if (a.pose === 'open') { if (!c.offT) c.offT = now; if (now - c.offT > 300) { c.grab = false; c.offT = 0; } } else c.offT = 0; } });
  for (const id of free) { const c = cursors.get(id); if (now - c.seen > (c.grab ? 1500 : 350)) { c.grab = false; c.gone = true; } }
  // 몸 기울이기(어깨 중심) — 달리기에서만
  if (f.pose && f.pose[11] && f.pose[12]) { const a = f.pose[11], b = f.pose[12]; if ((a.v == null || a.v > .4) && (b.v == null || b.v > .4)) { const cx = (a.x + b.x) / 2, sw = Math.abs(a.x - b.x);
      if (now - lean.t0 < 1300 || !lean.ok) { lean.c0 = (lean.c0 * lean.n + cx) / (lean.n + 1); lean.sw0 = (lean.sw0 * lean.n + sw) / (lean.n + 1); lean.n++; if (lean.n > 8) lean.ok = true; }
      else if (lean.sw0 > 5) { const u = (cx - lean.c0) / lean.sw0; if (u < -.22) lean.lane = -1; else if (u > .22) lean.lane = 1; else if (Math.abs(u) < .12) lean.lane = 0; } } }
}
async function startCam(wantPose){
  $('camBox').classList.remove('off');
  if (!km) { km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['hands', 'pose'], active: ['hands'], numHands: 2, activity: 'math-taste', inferEvery: 1 });
    km.onFrame = f => { km.drawCamera(); f.hands.forEach(h => km.drawSkeleton(h, km.HAND_BONES, 'rgba(255,211,92,.9)', 3)); if (S.state === 'play') readCam(f); };
    km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); }; }
  if (!km.running) await km.start();
  km.setActive('pose', !!wantPose); km.setActive('hands', !wantPose || OPT.steer === 'hand');
  Object.assign(lean, { c0: 0, sw0: 0, n: 0, t0: performance.now(), lane: 0, ok: false });
}
function stopCam(){ $('camBox').classList.add('off'); try { if (km && km.running) km.stop(); } catch (_) {} for (const [id, c] of cursors) if (c.cam) cursors.delete(id); }

// ── 흐름
function setOn(rowId, v){ $(rowId).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); }
function show(id){ ['menu', 'brief', 'end'].forEach(k => $(k).classList.toggle('hidden', k !== id)); $('quit').style.display = id ? 'none' : 'block'; }
function openBrief(g){ S.game = g; $('bTerm').textContent = TERMS.find(t => t.id === OPT.term).label + ' 내용'; $('bTitle').textContent = `${g.icon} ${g.title}`; $('bHow').textContent = OPT.input === 'cam' ? g.how : g.touch; $('bMsg').textContent = ''; S.state = 'brief'; show('brief'); }
async function begin(){ audio(); const g = S.game;
  if (OPT.input === 'cam') { $('bMsg').textContent = '카메라 여는 중…'; try { await startCam(g.needs === 'lane' && OPT.steer === 'lean'); } catch (e) { $('bMsg').textContent = '카메라를 열 수 없어요(' + e.message + ') — 조작을 「화면 터치」로 바꿔 보세요.'; $('camBox').classList.add('off'); return; } } else stopCam();
  api.pack = S.pack = makePack(OPT.term); S.score = { ok: 0, no: 0 }; S.pts = 0; S.combo = 0; S.maxCombo = 0; S.level = 1; S.timed = OPT.mode === 'time' || !SPEED[OPT.speed]; S.left = TIME_LIMIT; S.hearts = HEARTS; S.rescued = false; threat.v = 0; S.lane = 0; S.flash = null; S.intro = 1.7; S.beat = 0; S.sound = OPT.sound !== 'off'; fx.clear();
  for (const [id, c] of cursors) if (!c.mouse) cursors.delete(id);
  g.start(); S.state = 'play'; show(null);
}
function end(quit){ if (S.state !== 'play') return; S.state = 'end'; try { speechSynthesis.cancel(); } catch (_) {}
  if (quit) { S.state = 'menu'; show('menu'); return; }
  const key = S.game.id + '|' + S.pack.id, prev = BEST.get(key) || 0, rec = S.pts > prev && S.pts > 0; if (rec) BEST.set(key, S.pts);
  $('eTerm').textContent = `${S.game.title} · ${S.pack.label}`; $('eStars').textContent = S.pts.toLocaleString('ko-KR') + '점';
  $('eTitle').textContent = rec && prev ? '최고 기록을 넘었어!' : S.left <= 0 && S.timed ? '시간 끝!' : S.hearts <= 0 ? '여기까지!' : '끝!';
  $('eLine').textContent = `레벨 ${S.level} · 최고 콤보 ${S.maxCombo} · 맞힘 ${S.score.ok} · 틀림 ${S.score.no}` + (prev ? ` · 지난 최고 ${prev.toLocaleString('ko-KR')}점` : ''); SFX.win(); show('end'); }

function heart(c, x, y, s, on){ c.save(); c.translate(x, y); c.beginPath(); c.moveTo(0, s * .8); c.bezierCurveTo(-s * 1.5, -s * .2, -s * .7, -s * 1.2, 0, -s * .4); c.bezierCurveTo(s * .7, -s * 1.2, s * 1.5, -s * .2, 0, s * .8); c.closePath(); c.fillStyle = on ? '#ff4d6a' : 'rgba(255,255,255,.15)'; c.fill(); c.strokeStyle = on ? '#fff' : 'rgba(255,255,255,.4)'; c.lineWidth = 3; c.stroke(); c.restore(); }

// ── 한 프레임
let last = 0;
function tick(t){ requestAnimationFrame(tick); const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; if (S.state !== 'play') return;
  const g = S.game, cur = [...cursors.values()];
  for (const c of cur) { c.jg = c.grab && !c.prev; c.jr = !c.grab && c.prev; }
  // 길 고르기: 누르고 있는 터치 > 카메라(기울이기 또는 손 위치) · ← → 키는 한 칸씩
  const press = cur.find(c => !c.cam && c.grab); const hand = cur.find(c => c.cam);
  if (press) S.lane = press.x < W / 3 ? -1 : press.x > W * 2 / 3 ? 1 : 0;
  else if (OPT.input === 'cam' && g.needs === 'lane') { if (OPT.steer === 'lean') S.lane = lean.lane; else if (hand) { const x = hand.x / W; if (x < .36) S.lane = -1; else if (x > .64) S.lane = 1; else if (x > .42 && x < .58) S.lane = 0; } }
  // 위협 (처음 1.7초는 「준비 — 시작」: 그동안은 멈춰 있다)
  const mul = SPEED[OPT.speed], intro = S.intro > 0; if (intro) { S.intro -= dt; if (S.intro <= 0) SFX.dash(); }
  if (!intro) { if (!mul) threat.v = 0; else if (g.threatSec) threat.v += dt / (g.threatSec * mul) * (1 + RAMP * (S.level - 1));
    if (S.timed) { const b = Math.ceil(S.left); S.left -= dt; if (S.left <= 10 && Math.ceil(S.left) < b && S.left > 0) tone(880, .07, 'square', .08); }
    g.update(dt, cur, t);
    if (S.state === 'play' && threat.v >= 1) { S.hearts--; threat.v = .12; SFX.heart(); api.flash('앗!'); fx.shake(34); fx.flash('255,50,50', .5); if (S.hearts <= 0) { S.rescued = true; end(false); } }
    if (S.state === 'play' && S.timed && S.left <= 0) end(false);
    // 긴장 박동: 위협이 찰수록 빨라지는 북소리
    if (mul) { S.beat += dt * (1.5 + threat.v * 3); if (S.beat >= 1) { S.beat -= 1; tone(threat.v > .7 ? 104 : 78, .11, 'sine', .1 + threat.v * .14); if (threat.v > .7) tone(208, .05, 'square', .04, .12); } } }
  fx.update(dt);
  for (const c of cur) { if (c.pendingUp) { c.pendingUp = false; c.prev = true; c.grab = false; } else c.prev = c.grab; if (c.gone && !c.grab && !c.prev) cursors.delete(c.id); }
  // 그리기
  const o = fx.offset(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); ctx.setTransform(1, 0, 0, 1, o.x, o.y); g.draw(ctx, t); fx.draw(ctx); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < HEARTS; i++) heart(ctx, W - 64 - i * 54, 44, 22, i < S.hearts);
  if (intro) { ctx.fillStyle = 'rgba(5,8,16,.45)'; ctx.fillRect(0, 0, W, H); const go = S.intro < .6, k = go ? S.intro / .6 : (S.intro - .6) / 1.1; ctx.globalAlpha = Math.min(1, k * 3); txt(ctx, go ? '시작!' : '준비', W / 2, H / 2, go ? 170 : 130 + (1 - k) * 30, go ? '#ffd35c' : '#fff'); ctx.globalAlpha = 1; }
  S.pulse = Math.max(0, S.pulse - dt * 4); const m = mult();
  ctx.textAlign = 'right'; txt(ctx, S.pts.toLocaleString('ko-KR'), W - 34, 92, 42 + S.pulse * 10, '#ffe27a', 'right');
  txt(ctx, `레벨 ${S.level}` + (S.combo >= 2 ? `  ·  콤보 ${S.combo}` : ''), W - 34 - (m > 1 ? 62 : 0), 130, 24, '#dfe9ff', 'right', 700);
  if (m > 1) { ctx.fillStyle = ['', '', '#6dffb0', '#ffd35c', '#ff9f43', '#ff5d6c'][m]; ctx.beginPath(); ctx.arc(W - 58, 130, 22 + S.pulse * 4, 0, 7); ctx.fill(); txt(ctx, '×' + m, W - 58, 131, 24, '#1a1206'); }
  if (S.timed) { const k = Math.max(0, S.left / TIME_LIMIT); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = S.left <= 10 ? '#ff5d6c' : '#4de1ff'; ctx.fillRect(0, 0, W * k, 12); txt(ctx, Math.ceil(Math.max(0, S.left)) + '초', W - 250, 44, S.left <= 10 ? 40 : 30, S.left <= 10 ? '#ff8f9a' : '#fff', 'right'); }
  if (g.id !== 'gate') for (const c of cursors.values()) { if (!c.cam && !c.mouse) continue; circle(ctx, c.x, c.y, c.grab ? 20 : 30, c.grab ? 'rgba(255,211,92,.85)' : 'rgba(255,255,255,.12)', c.grab ? '#fff' : 'rgba(255,255,255,.9)', 5); }
  if (S.flash && S.ft > 0) { S.ft -= dt; ctx.globalAlpha = Math.min(1, S.ft * 2); txt(ctx, S.flash, W / 2, H / 2 - 40, 84, '#fff'); ctx.globalAlpha = 1; }
}

// ── 메뉴
TERMS.forEach(t => { const b = document.createElement('button'); b.dataset.v = t.id; b.textContent = t.label; $('rTerm').appendChild(b); });
[['rTerm', 'term'], ['rMode', 'mode'], ['rInput', 'input'], ['rSpeed', 'speed'], ['rSteer', 'steer'], ['rSound', 'sound']].forEach(([row, key]) => { setOn(row, OPT[key]); $(row).querySelectorAll('button').forEach(b => b.onclick = () => { OPT[key] = b.dataset.v; setOn(row, OPT[key]); }); });
GAMES.forEach(g => { const b = document.createElement('button'); b.className = 'card'; b.innerHTML = `<i>${g.icon}</i>${g.title}`; b.onclick = () => openBrief(g); $('cards').appendChild(b); });
$('bStart').onclick = begin; $('bBack').onclick = () => { S.state = 'menu'; show('menu'); }; $('eAgain').onclick = () => openBrief(S.game); $('eMenu').onclick = () => { S.state = 'menu'; show('menu'); }; $('quit').onclick = () => end(true);
const pre = GAMES.find(g => g.id === qs.get('game')); if (pre) openBrief(pre);
requestAnimationFrame(tick);
window.__taste = { S, OPT, GAMES, cursors, threat, api, readCam, lean };     // 점검용
