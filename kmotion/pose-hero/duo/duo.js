// 포즈 히어로 · 둘이 대결 — 엔진 0.7.2 duo(두 사람 동시 추적) + 포즈 히어로 판정(poses.js·evaluator.js) 재사용
// 모든 판 60초 안에 끝남 · 팀마다 하트 3개, 세 번 못 하면 탈락(먼저 탈락한 팀이 짐).
//  먼저 하기 : 같은 포즈, 먼저 유지한 팀 1점. 시간 안에 못 한 팀은 하트 −1. 판마다 시간이 줄어듦.
//  빨라지기 : 포즈가 줄줄이 나오고 둘 다 따라 하기. 한 포즈마다 주어지는 시간이 점점 짧아짐. 못 하면 하트 −1.
//  외워서   : 포즈 순서를 보여주고 가린 뒤 기억해서 차례대로. 판마다 하나씩 늘어남(1→2→3…). 중간에 틀리거나 늦으면 하트 −1.
// 60초가 다 되면 하트 많은 팀 → 점수 많은 팀 순으로 승리. ?dev=1 : 1·2 키 = 청팀·홍팀 지금 포즈 강제 성공.
import { POSES, gradeOf } from '../js/poses.js';
import { PoseEvaluator } from '../js/evaluator.js';
import { AudioManager } from '../js/audio.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search), DEV = Q.has('dev');
const TEAM = [{ name: '청팀', cls: 'blue', rgb: '47,111,228' }, { name: '홍팀', cls: 'red', rgb: '226,64,59' }];
const GAME_MS = 60000, LIVES = 3;
const DIFF = {
  easy:   { max: 2, race: 7000, speed0: 5000, speedMin: 2000, step: 4000, show: 1100 },
  normal: { max: 3, race: 5500, speed0: 4000, speedMin: 1700, step: 3200, show: 900 },
  hard:   { max: 3, race: 4200, speed0: 3200, speedMin: 1400, step: 2600, show: 720 } };
const BONES = [[11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28]];

const audio = new AudioManager();
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['pose'], duo: true, numPoses: 3, activity: 'pose-hero-duo' });
const ev = [new PoseEvaluator(), new PoseEvaluator()];
let duo = [null, null], started = false;

const S = { scr: 'menu', mode: 'speed', diff: 'normal', score: [0, 0], lives: [LIVES, LIVES], out: [false, false], phase: '', t0: 0, limit: 0, gameT0: 0,
  pose: null, last: null, round: 0, ready: [null, null], winner: -1, done: [null, null], seq: [], step: [0, 0], pops: [], timers: [], n: 0 };

// ── 메뉴
document.querySelectorAll('.mode').forEach(b => b.onclick = () => { document.querySelectorAll('.mode').forEach(x => x.classList.toggle('on', x === b)); S.mode = b.dataset.m; });
$('diff').querySelectorAll('button').forEach(b => b.onclick = () => { $('diff').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.diff = b.dataset.v; });
$('btnGo').onclick = () => begin();
$('btnAgain').onclick = () => begin();
$('btnMenu').onclick = () => toMenu();
addEventListener('keydown', e => { if (e.key === 'Escape' && S.scr !== 'menu') toMenu();
  if (DEV && S.scr === 'play' && (e.key === '1' || e.key === '2')) devForce(+e.key - 1); });

function show(id, on){ $(id).classList.toggle('hidden', !on); }
function clearTimers(){ S.timers.forEach(clearTimeout); S.timers = []; }
const later = (ms, fn) => S.timers.push(setTimeout(fn, ms));
function toMenu(){ clearTimers(); audio.stopMusic(); S.scr = 'menu'; S.phase = ''; show('scrMenu', 1); show('scrEnd', 0); show('board', 0); show('meters', 0); banner(''); }
const MODE_NAME = { race: '먼저 하기', speed: '빨라지기', memory: '외워서 따라 하기' };

async function begin(){
  audio.ensure(); clearTimers(); show('scrMenu', 0); show('scrEnd', 0);
  if (!started) { try { await km.start(); started = true; } catch (e) { banner('카메라를 켤 수 없어요', '', '주소창의 카메라 권한을 허용해 주세요'); later(2500, toMenu); return; } }
  km.resetDuo(); S.score = [0, 0]; S.lives = [LIVES, LIVES]; S.out = [false, false]; S.round = 0; S.n = 0; S.last = null; S.seq = [];
  S.ready = [null, null]; S.scr = 'ready'; S.phase = 'ready';
  show('board', 1); show('meters', 1); setScore(); setLives(); setCard('🧍', '자리에 서요'); $('round').textContent = MODE_NAME[S.mode]; setTimer(1);
}

// ── 화면 조각
function banner(text, cls = '', sub = ''){ const b = $('banner'); if (!text) { b.classList.add('hidden'); return; } b.className = 'banner ' + cls; b.innerHTML = text + (sub ? `<small>${sub}</small>` : ''); }
function setScore(bump){ $('sB').textContent = S.score[0]; $('sR').textContent = S.score[1];
  if (bump != null) { const el = $(bump ? 'sR' : 'sB'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
function setLives(){ for (let i = 0; i < 2; i++) $(i ? 'hR' : 'hB').textContent = S.out[i] ? '탈락' : '❤'.repeat(S.lives[i]) + '♡'.repeat(LIVES - S.lives[i]); }
function setCard(em, nm){ $('cEm').textContent = em; $('cNm').textContent = nm; }
function setTimer(k){ const i = $('tFill'); i.style.transform = `scaleX(${Math.max(0, Math.min(1, k))})`; i.classList.toggle('low', k < .3); }
function pop(i, text){ S.pops.push({ i, text, t: performance.now() }); }
function pickPose(not){ const pool = POSES.filter(p => p.difficulty <= DIFF[S.diff].max && p.id !== (not && not.id)); return pool[Math.random() * pool.length | 0] || POSES[0]; }
const left = () => Math.max(0, GAME_MS - (performance.now() - S.gameT0));
const alive = i => !S.out[i];
function label(extra){ $('round').textContent = `${MODE_NAME[S.mode]} · 남은 ${Math.ceil(left() / 1000)}초` + (extra ? ' · ' + extra : ''); }

// 하트 −1. 탈락하면 true. 둘 중 하나라도 탈락하면 게임 끝(남은 팀 승리)
function miss(i, why){ if (S.out[i]) return false; S.lives[i]--; audio.hurt(); pop(i, why || '놓쳤어요 −❤');
  if (S.lives[i] <= 0) { S.out[i] = true; ev[i].setTarget(null); } setLives(); return S.out[i]; }
function overCheck(){ if (S.out[0] || S.out[1]) { later(900, finish); S.phase = 'gap'; return true; } if (left() <= 0) { S.phase = 'gap'; banner('시간 끝!'); later(1200, finish); return true; } return false; }

// ── 자리 잡기(겸 보정): 둘 다 어깨·양팔이 1.5초 보이면 각자 기준(어깨 높이·폭) 저장
function stepReady(t, dt){
  for (let i = 0; i < 2; i++) { const p = duo[i]; const r = S.ready[i] || (S.ready[i] = { acc: 0, y: 0, w: 0, n: 0 });
    const ok = p && p[11].v > .5 && p[12].v > .5 && p[15].v > .4 && p[16].v > .4;
    if (ok) { r.acc += dt; r.y += (p[11].y + p[12].y) / 2; r.w += Math.abs(p[11].x - p[12].x); r.n++; } else { r.acc = Math.max(0, r.acc - dt); if (!r.acc) { r.y = r.w = r.n = 0; } } }
  setTimer(Math.min(S.ready[0].acc, S.ready[1].acc) / 1500);
  $('mBt').textContent = S.ready[0].acc >= 1500 ? '청팀 준비 완료' : duo[0] ? '청팀 그대로!' : '청팀 자리에 서요';
  $('mRt').textContent = S.ready[1].acc >= 1500 ? '홍팀 준비 완료' : duo[1] ? '홍팀 그대로!' : '홍팀 자리에 서요';
  $('mB').style.width = Math.min(100, S.ready[0].acc / 15) + '%'; $('mR').style.width = Math.min(100, S.ready[1].acc / 15) + '%';
  if (S.ready[0].acc >= 1500 && S.ready[1].acc >= 1500) {
    S.ready.forEach((r, i) => { ev[i].norm.base = { cx: 0, shY: r.y / r.n, sw: r.w / r.n }; });
    S.phase = 'count'; $('mBt').textContent = '청팀'; $('mRt').textContent = '홍팀';
    let n = 3; const tick = () => { if (n) { banner(String(n)); audio.count(false); n--; later(700, tick); } else { banner('시작!'); audio.count(true); audio.startMusic('party', S.mode === 'speed' ? 128 : 116); later(600, () => { banner(''); S.scr = 'play'; S.gameT0 = performance.now(); ({ race: raceRound, speed: speedNext, memory: memRound })[S.mode](); }); } };
    tick(); }
}

// ── 먼저 하기
function raceRound(){
  if (overCheck()) return; S.round++;
  const p = pickPose(S.last); S.last = p; S.pose = p; S.winner = -1; ev.forEach(e => e.setTarget(null));
  setCard(p.emoji, p.name); audio.appear(); S.phase = 'show'; setTimer(1); label(`${S.round}판`);
  S.limit = Math.max(2400, DIFF[S.diff].race * Math.pow(.93, S.round - 1));
  later(600, () => { ev.forEach((e, i) => alive(i) && e.setTarget(p, Math.min(p.hold, 450))); S.phase = 'race'; S.t0 = performance.now(); });
}
function raceStep(t){
  const k = 1 - (t - S.t0) / S.limit; setTimer(k); label(`${S.round}판`); tickLow(k);
  for (let i = 0; i < 2; i++) if (alive(i)) { const r = ev[i].update(duo[i], t); if (r && S.winner < 0) return raceWin(i, r); }
  if (k <= 0) { S.phase = 'gap'; ev.forEach(e => e.setTarget(null)); banner('둘 다 놓쳤어요'); [0, 1].forEach(i => miss(i)); later(1200, () => { banner(''); raceRound(); }); }
}
function raceWin(i, r){
  S.winner = i; S.phase = 'gap'; ev.forEach(e => e.setTarget(null)); S.score[i]++; setScore(i);
  const g = gradeOf(r.sim); audio.success(g.id); pop(i, `+1 ${g.label}`);
  banner(`${TEAM[i].name} 먼저!`, TEAM[i].cls, `${TEAM[1 - i].name} −❤`); miss(1 - i, '늦었어요 −❤');
  later(1300, () => { banner(''); raceRound(); });
}

// ── 빨라지기: 포즈가 줄줄이, 한 포즈 시간이 점점 짧아짐. 둘 다 따라 하기
function speedNext(){
  if (overCheck()) return; S.n++;
  const D = DIFF[S.diff]; const p = pickPose(S.last); S.last = p; S.pose = p; S.done = [null, null];
  S.limit = Math.max(D.speedMin, D.speed0 * Math.pow(.9, S.n - 1));
  setCard(p.emoji, p.name); audio.appear(); setTimer(1);
  ev.forEach((e, i) => alive(i) ? e.setTarget(p, Math.min(p.hold, 380)) : e.setTarget(null));
  S.phase = 'speed'; S.t0 = performance.now(); label(`${S.n}번째 · ${(S.limit / 1000).toFixed(1)}초`);
}
function speedStep(t){
  const k = 1 - (t - S.t0) / S.limit; setTimer(k); label(`${S.n}번째 · ${(S.limit / 1000).toFixed(1)}초`); tickLow(k);
  for (let i = 0; i < 2; i++) if (alive(i) && !S.done[i]) { const r = ev[i].update(duo[i], t); if (r) hit(i, r.sim); }
  const allDone = [0, 1].every(i => !alive(i) || S.done[i]);
  if (allDone || k <= 0) { S.phase = 'gap'; for (let i = 0; i < 2; i++) if (alive(i) && !S.done[i]) miss(i); ev.forEach(e => e.setTarget(null)); later(allDone ? 250 : 500, speedNext); }
}
function hit(i, sim){ const g = gradeOf(sim); S.done[i] = g; ev[i].setTarget(null); S.score[i]++; setScore(i); audio.success(g.id); pop(i, `+1 ${g.label}`); }

// ── 외워서 따라 하기: 순서 보여주기 → 가리기 → 각자 차례대로. 판마다 1개씩 늘어남
function memRound(){
  if (overCheck()) return; S.round++;
  S.seq.push(pickPose(S.seq[S.seq.length - 1])); S.step = [0, 0]; S.done = [null, null]; ev.forEach(e => e.setTarget(null));
  S.phase = 'memshow'; label(`${S.seq.length}개 외우기`); banner(`${S.seq.length}개 외워요!`); audio.bossRoar();
  const D = DIFF[S.diff], showMs = Math.max(500, D.show - S.round * 30); let k = 0;
  const next = () => { if (k < S.seq.length) { const p = S.seq[k]; setCard(p.emoji, `${k + 1}. ${p.name}`); banner(''); audio.appear(); setTimer(1 - k / S.seq.length); k++; later(showMs, next); }
    else { setCard('🤔', '기억해서 차례대로!'); banner('이제 해 봐요!'); audio.count(true); later(600, () => banner('')); memStart(); } };
  later(900, next);
}
function memStart(){ S.phase = 'mem'; S.limit = DIFF[S.diff].step; S.stepT = [performance.now(), performance.now()];
  for (let i = 0; i < 2; i++) if (alive(i)) ev[i].setTarget(S.seq[0], Math.min(S.seq[0].hold, 420)); }
function memStep(t){
  label(`${S.seq.length}개 외우기`);
  if (left() <= 0) { S.phase = 'gap'; ev.forEach(e => e.setTarget(null)); banner('시간 끝!'); later(1200, finish); return; }
  let worst = 1;
  for (let i = 0; i < 2; i++) { if (!alive(i) || S.done[i]) continue;
    const k = 1 - (t - S.stepT[i]) / S.limit; worst = Math.min(worst, k);
    const r = ev[i].update(duo[i], t);
    if (r) { S.score[i]++; setScore(i); audio.success(gradeOf(r.sim).id); S.step[i]++;
      if (S.step[i] >= S.seq.length) { S.done[i] = 'ok'; ev[i].setTarget(null); pop(i, '다 맞혔어요!'); }
      else { pop(i, `${S.step[i]}/${S.seq.length}`); const p = S.seq[S.step[i]]; ev[i].setTarget(p, Math.min(p.hold, 420)); S.stepT[i] = t; } }
    else if (k <= 0) { S.done[i] = 'miss'; ev[i].setTarget(null); miss(i, `${S.step[i] + 1}번째 놓침 −❤`); } }
  setTimer(worst); tickLow(worst);
  if ([0, 1].every(i => !alive(i) || S.done[i])) { S.phase = 'gap'; const ans = S.seq.map(p => p.emoji).join(' ');
    setCard('✅', ans); later(1500, memRound); }
}

function tickLow(k){ if (k < .3 && !S._ticked) { S._ticked = true; audio.tick(); } if (k >= .3) S._ticked = false; }

// ── 개발용 강제 성공
function devForce(i){
  if (S.phase === 'race' && S.winner < 0 && alive(i)) raceWin(i, { sim: .95 });
  else if (S.phase === 'speed' && alive(i) && !S.done[i]) hit(i, .95);
  else if (S.phase === 'mem' && alive(i) && !S.done[i]) { ev[i].locked = false; ev[i].hold = 1e9; }
}

function finish(){
  if (S.scr === 'end') return;
  S.scr = 'end'; S.phase = ''; clearTimers(); audio.stopMusic(); banner(''); show('meters', 0);
  let w; if (S.out[0] !== S.out[1]) w = S.out[0] ? 1 : 0; else if (S.lives[0] !== S.lives[1]) w = S.lives[0] > S.lives[1] ? 0 : 1; else if (S.score[0] !== S.score[1]) w = S.score[0] > S.score[1] ? 0 : 1; else w = -1;
  $('wTeam').textContent = w < 0 ? '비겼어요' : `${TEAM[w].name} 승리`; $('wTeam').className = 'win ' + (w < 0 ? '' : TEAM[w].cls);
  $('fB').textContent = S.score[0]; $('fR').textContent = S.score[1];
  const why = S.out[0] && S.out[1] ? '둘 다 하트를 다 썼어요' : S.out[0] || S.out[1] ? `${TEAM[S.out[0] ? 0 : 1].name}이 하트를 다 썼어요` : '60초 끝 · 하트가 많은 팀, 같으면 점수가 많은 팀이 이겨요';
  $('wNote').textContent = (DEV ? '[개발용] ' : '') + why + (S.mode === 'memory' ? ` · ${S.seq.length}개까지 갔어요` : '');
  w < 0 ? audio.appear() : audio.win(); show('scrEnd', 1);
}

// ── 프레임: 그리기 + 단계 진행
let lastT = 0;
km.onFrame = f => {
  const t = f.t, dt = lastT ? Math.min(100, t - lastT) : 0; lastT = t; duo = f.duo || [null, null];
  const ctx = f.ctx, W = f.W, H = f.H;
  km.drawCamera();
  for (let i = 0; i < 2; i++) { ctx.fillStyle = S.out[i] ? 'rgba(20,20,20,.6)' : `rgba(${TEAM[i].rgb},.12)`; ctx.fillRect(i * W / 2, 0, W / 2, H); }
  ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = 'rgba(244,241,226,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.restore();
  ctx.textAlign = 'center';
  for (let i = 0; i < 2; i++) {
    const p = duo[i]; const cx = W * (i ? .75 : .25);
    if (S.out[i]) { ctx.font = '400 64px "Black Han Sans", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText('탈락', cx, H * .55); continue; }
    if (!p) { ctx.font = '400 34px "Black Han Sans", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText(`${TEAM[i].name} 자리에 서요`, cx, H * .62); continue; }
    km.drawSkeleton(p, BONES, `rgba(${TEAM[i].rgb},.95)`, 5);
    const judging = (S.phase === 'race' || S.phase === 'speed' || S.phase === 'mem') && !S.done[i];
    const prog = S.done[i] === 'ok' || (S.done[i] && S.done[i].id) ? 1 : judging ? ev[i].progress : 0;
    const hx = p[0].v > .5 ? p[0].x : (p[11].x + p[12].x) / 2, hy = (p[0].v > .5 ? p[0].y : p[11].y) - Math.abs(p[11].x - p[12].x) * .9;
    ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(hx, hy, 26, 0, Math.PI * 2); ctx.stroke();
    if (prog > 0) { ctx.strokeStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(hx, hy, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, prog)); ctx.stroke(); }
    if (S.phase === 'mem' || (S.phase === 'gap' && S.mode === 'memory')) { ctx.font = '900 22px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(S.done[i] === 'ok' ? '✓' : S.done[i] === 'miss' ? '✗' : `${S.step[i] + 1}`, hx, hy + 8); }
    else if (S.done[i]) { ctx.font = '900 26px sans-serif'; ctx.fillStyle = '#ffd84a'; ctx.fillText('✓', hx, hy + 9); }
  }
  S.pops = S.pops.filter(q => t - q.t < 1200);
  for (const q of S.pops) { const k = (t - q.t) / 1200; ctx.globalAlpha = 1 - k; ctx.font = '400 44px "Black Han Sans", sans-serif'; ctx.fillStyle = '#ffd84a';
    ctx.strokeStyle = `rgb(${TEAM[q.i].rgb})`; ctx.lineWidth = 6; const x = W * (q.i ? .75 : .25), y = H * .45 - k * 80; ctx.strokeText(q.text, x, y); ctx.fillText(q.text, x, y); ctx.globalAlpha = 1; }
  if (S.scr === 'play') for (let i = 0; i < 2; i++) { const judged = (S.phase === 'race' || S.phase === 'speed' || S.phase === 'mem') && alive(i) && !S.done[i]; $(i ? 'mR' : 'mB').style.width = (judged ? Math.round(ev[i].sim * 100) : 0) + '%'; }
  if (S.phase === 'ready') stepReady(t, dt);
  else if (S.phase === 'race') raceStep(t);
  else if (S.phase === 'speed') speedStep(t);
  else if (S.phase === 'mem') memStep(t);
};
if (DEV) { document.title += ' (개발용: 1·2 키 강제 성공)'; window.__duo = S; }
