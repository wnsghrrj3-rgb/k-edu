// 포즈 히어로 · 둘이 대결 — 엔진 0.7.2 duo(두 사람 동시 추적) + 포즈 히어로 판정(poses.js·evaluator.js) 재사용
// 먼저 하기: 같은 포즈, 먼저 유지한 팀이 1점(마지막 판 2점, 동점이면 연장전). 제한 시간은 판마다 줄어든다.
// 따라 하기: 화면이 포즈를 내면 둘 다 제한 시간 안에 따라 하기 — 정확할수록 점수(PERFECT 3·GREAT 2·GOOD 1), 판마다 시간 줄어듦, 동점이면 연장.
// ?dev=1 : 1·2 키 = 청팀·홍팀 강제 성공(카메라 없이 흐름 확인). ?mouse=1 과 같이 쓰면 가짜 몸 둘.
import { POSES, PASS, gradeOf } from '../js/poses.js';
import { PoseEvaluator } from '../js/evaluator.js';
import { AudioManager } from '../js/audio.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search), DEV = Q.has('dev');
const TEAM = [{ name: '청팀', cls: 'blue', rgb: '47,111,228' }, { name: '홍팀', cls: 'red', rgb: '226,64,59' }];
const DIFF = { easy: { race: 8000, copy: 7000, max: 2 }, normal: { race: 6000, copy: 5500, max: 3 }, hard: { race: 4600, copy: 4200, max: 3 } };
const LEN = { short: { race: 5, copy: 5 }, mid: { race: 7, copy: 8 }, long: { race: 10, copy: 12 } };
const BONES = [[11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28]];

const audio = new AudioManager();
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['pose'], duo: true, numPoses: 3, activity: 'pose-hero-duo' });
const ev = [new PoseEvaluator(), new PoseEvaluator()];
let duo = [null, null], started = false;

const S = { scr: 'menu', mode: 'race', diff: 'normal', len: 'mid', score: [0, 0], phase: '', t0: 0, limit: 0, pose: null, last: null, round: 0, rounds: 0, overtime: false,
  ready: [null, null], done: [null, null], winner: -1, pops: [], timers: [] };

// ── 메뉴
document.querySelectorAll('.mode').forEach(b => b.onclick = () => { document.querySelectorAll('.mode').forEach(x => x.classList.toggle('on', x === b)); S.mode = b.dataset.m; });
for (const [id, key] of [['diff', 'diff'], ['len', 'len']]) $(id).querySelectorAll('button').forEach(b => b.onclick = () => { $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S[key] = b.dataset.v; });
$('btnGo').onclick = () => begin();
$('btnAgain').onclick = () => begin();
$('btnMenu').onclick = () => toMenu();
addEventListener('keydown', e => { if (e.key === 'Escape' && S.scr !== 'menu') toMenu();
  if (DEV && S.scr === 'play' && (e.key === '1' || e.key === '2')) devForce(+e.key - 1); });

function show(id, on){ $(id).classList.toggle('hidden', !on); }
function clearTimers(){ S.timers.forEach(clearTimeout); S.timers = []; }
const later = (ms, fn) => S.timers.push(setTimeout(fn, ms));
function toMenu(){ clearTimers(); audio.stopMusic(); S.scr = 'menu'; show('scrMenu', 1); show('scrEnd', 0); show('board', 0); show('meters', 0); banner(''); }

async function begin(){
  audio.ensure(); clearTimers(); show('scrMenu', 0); show('scrEnd', 0);
  if (!started) { try { await km.start(); started = true; } catch (e) { banner('카메라를 켤 수 없어요', '', '주소창의 카메라 권한을 허용해 주세요'); later(2500, toMenu); return; } }
  km.resetDuo(); S.score = [0, 0]; S.round = 0; S.overtime = false; S.last = null;
  S.rounds = LEN[S.len][S.mode]; S.ready = [null, null]; S.scr = 'ready'; S.phase = 'ready';
  show('board', 1); show('meters', 1); setScore(); setCard('🧍', '자리에 서요'); $('round').textContent = S.mode === 'race' ? '먼저 하기' : '따라 하기'; setTimer(1);
}

// ── 화면 조각
function banner(text, cls = '', sub = ''){ const b = $('banner'); if (!text) { b.classList.add('hidden'); return; } b.className = 'banner ' + cls; b.innerHTML = text + (sub ? `<small>${sub}</small>` : ''); }
function setScore(bump){ $('sB').textContent = S.score[0]; $('sR').textContent = S.score[1];
  if (bump != null) { const el = $(bump ? 'sR' : 'sB'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
function setCard(em, nm){ $('cEm').textContent = em; $('cNm').textContent = nm; }
function setTimer(k){ const i = $('tFill'); i.style.transform = `scaleX(${Math.max(0, k)})`; i.classList.toggle('low', k < .3); }
function pop(i, text){ S.pops.push({ i, text, t: performance.now() }); }
function pickPose(exclude){ const max = DIFF[S.diff].max; const pool = POSES.filter(p => p.difficulty <= max && p.id !== (S.last && S.last.id) && !(exclude && exclude.has(p.id))); return pool[Math.random() * pool.length | 0] || POSES[0]; }
const poolIds = () => POSES.filter(p => p.difficulty <= DIFF[S.diff].max).map(p => p.id);

// ── 자리 잡기(겸 보정): 둘 다 어깨·양팔이 1.5초 보이면 각자 기준(어깨 높이·폭) 저장
function stepReady(t, dt){
  for (let i = 0; i < 2; i++) { const p = duo[i]; const r = S.ready[i] || (S.ready[i] = { acc: 0, y: 0, w: 0, n: 0 });
    const ok = p && p[11].v > .5 && p[12].v > .5 && p[15].v > .4 && p[16].v > .4;
    if (ok) { r.acc += dt; r.y += (p[11].y + p[12].y) / 2; r.w += Math.abs(p[11].x - p[12].x); r.n++; } else { r.acc = Math.max(0, r.acc - dt); if (!r.acc) { r.y = r.w = r.n = 0; } } }
  const k = Math.min(S.ready[0].acc, S.ready[1].acc) / 1500; setTimer(k);
  $('mBt').textContent = S.ready[0].acc >= 1500 ? '청팀 준비 완료' : duo[0] ? '청팀 그대로!' : '청팀 자리에 서요';
  $('mRt').textContent = S.ready[1].acc >= 1500 ? '홍팀 준비 완료' : duo[1] ? '홍팀 그대로!' : '홍팀 자리에 서요';
  $('mB').style.width = Math.min(100, S.ready[0].acc / 15) + '%'; $('mR').style.width = Math.min(100, S.ready[1].acc / 15) + '%';
  if (S.ready[0].acc >= 1500 && S.ready[1].acc >= 1500) {
    S.ready.forEach((r, i) => { ev[i].norm.base = { cx: 0, shY: r.y / r.n, sw: r.w / r.n }; });
    S.phase = 'count'; $('mBt').textContent = '청팀'; $('mRt').textContent = '홍팀';
    let n = 3; const tick = () => { if (n) { banner(String(n)); audio.count(false); n--; later(700, tick); } else { banner('시작!'); audio.count(true); audio.startMusic('party', 118); later(600, () => { banner(''); S.scr = 'play'; S.mode === 'race' ? raceRound() : copyRound(); }); } };
    tick(); }
}

// ── 먼저 하기
function raceRound(){
  S.round++; const last = !S.overtime && S.round === S.rounds;
  $('round').textContent = S.overtime ? '연장전 · 먼저 맞추면 승리' : `${S.round}판 / ${S.rounds}판` + (last ? ' · 마지막 판 2점' : '');
  const p = pickPose(); S.last = p; S.pose = p; S.winner = -1; ev.forEach(e => e.setTarget(null));
  setCard(p.emoji, p.name); audio.appear(); S.phase = 'show'; setTimer(1);
  S.limit = Math.max(2600, DIFF[S.diff].race * Math.pow(.96, S.round - 1));
  later(700, () => { ev.forEach(e => e.setTarget(p, Math.min(p.hold, 450))); S.phase = 'race'; S.t0 = performance.now(); });
}
function raceStep(t){
  const k = 1 - (t - S.t0) / S.limit; setTimer(k);
  if (k < .3 && !S._ticked) { S._ticked = true; audio.tick(); } if (k >= .3) S._ticked = false;
  for (let i = 0; i < 2; i++) { const r = ev[i].update(duo[i], t); if (r && S.winner < 0) return raceWin(i, r); }
  if (k <= 0) { S.phase = 'gap'; ev.forEach(e => e.setTarget(null)); audio.fail(); banner('아무도 못 했어요'); later(1300, nextRace); }
}
function raceWin(i, r){
  S.winner = i; S.phase = 'gap'; ev.forEach(e => e.setTarget(null));
  const pts = S.overtime ? 1 : (S.round === S.rounds ? 2 : 1); S.score[i] += pts; setScore(i);
  const g = gradeOf(r.sim); audio.success(g.id); pop(i, `+${pts} ${g.label}`);
  banner(`${TEAM[i].name} 먼저!`, TEAM[i].cls, `${Math.round((performance.now() - S.t0) / 100) / 10}초`);
  later(1400, nextRace);
}
function nextRace(){ banner('');
  if (S.overtime) return finish();
  if (S.round < S.rounds) return raceRound();
  if (S.score[0] === S.score[1]) { S.overtime = true; banner('동점! 연장전', '', '먼저 맞추는 팀이 이겨요'); audio.bossRoar(); later(1600, () => { banner(''); raceRound(); }); return; }
  finish(); }

// ── 따라 하기: 화면이 포즈를 내면 둘 다 제한 시간 안에 따라 하기. 둘 다 점수 가능, 정확할수록 많이(PERFECT 3 · GREAT 2 · GOOD 1)
const PTS = { PERFECT: 3, GREAT: 2, GOOD: 1 };
function copyRound(){
  S.round++; $('round').textContent = (S.overtime ? '연장전' : `${S.round}번 / ${S.rounds}번`);
  const p = pickPose(); S.last = p; S.pose = p; S.done = [null, null]; ev.forEach(e => e.setTarget(null));
  setCard(p.emoji, p.name); audio.appear(); S.phase = 'show'; setTimer(1);
  S.limit = Math.max(2600, DIFF[S.diff].copy * Math.pow(.96, S.round - 1));
  later(700, () => { ev.forEach(e => e.setTarget(p)); S.phase = 'copy'; S.t0 = performance.now(); });
}
function copyStep(t){
  const k = 1 - (t - S.t0) / S.limit; setTimer(k);
  if (k < .3 && !S._ticked) { S._ticked = true; audio.tick(); } if (k >= .3) S._ticked = false;
  for (let i = 0; i < 2; i++) if (!S.done[i]) { const r = ev[i].update(duo[i], t); if (r) copyHit(i, r.sim); }
  if (S.phase === 'copy' && (k <= 0 || (S.done[0] && S.done[1]))) copyEnd();
}
function copyHit(i, sim){ const g = gradeOf(sim); const pts = PTS[g.id] || 1; S.done[i] = g; ev[i].setTarget(null); S.score[i] += pts; setScore(i); audio.success(g.id); pop(i, `+${pts} ${g.label}`); }
function copyEnd(){
  S.phase = 'gap'; ev.forEach(e => e.setTarget(null)); const [x, y] = S.done;
  if (!x && !y) { audio.fail(); banner('둘 다 못 했어요'); }
  else if (x && y) banner('둘 다 성공!', '', `${TEAM[0].name} ${x.label} · ${TEAM[1].name} ${y.label}`);
  else { const i = x ? 0 : 1; banner(`${TEAM[i].name}만 성공!`, TEAM[i].cls); }
  later(1400, nextCopy);
}
function nextCopy(){ banner('');
  if (S.round < S.rounds) return copyRound();
  if (S.score[0] === S.score[1] && !S.overtime) { S.overtime = true; S.rounds++; banner('동점! 연장전', '', '한 번 더'); audio.bossRoar(); later(1600, () => { banner(''); copyRound(); }); return; }
  finish(); }

// ── 개발용 강제 성공
function devForce(i){
  if (S.phase === 'race' && S.winner < 0) raceWin(i, { sim: .95 });
  else if (S.phase === 'copy' && !S.done[i]) { copyHit(i, .95); if (S.done[0] && S.done[1]) copyEnd(); }
}

function finish(){
  S.scr = 'end'; S.phase = ''; clearTimers(); audio.stopMusic(); banner(''); show('meters', 0);
  const [b, r] = S.score, w = b === r ? -1 : b > r ? 0 : 1;
  $('wTeam').textContent = w < 0 ? '비겼어요' : `${TEAM[w].name} 승리`; $('wTeam').className = 'win ' + (w < 0 ? '' : TEAM[w].cls);
  $('fB').textContent = b; $('fR').textContent = r; $('wNote').textContent = DEV ? '개발용 모드 결과예요' : '둘 다 수고했어요. 자리를 바꿔서 한 판 더 해 볼까요?';
  w < 0 ? audio.appear() : audio.win(); show('scrEnd', 1);
}

// ── 프레임: 그리기 + 단계 진행
let lastT = 0;
km.onFrame = f => {
  const t = f.t, dt = lastT ? Math.min(100, t - lastT) : 0; lastT = t; duo = f.duo || [null, null];
  const ctx = f.ctx, W = f.W, H = f.H;
  km.drawCamera();
  for (let i = 0; i < 2; i++) { ctx.fillStyle = `rgba(${TEAM[i].rgb},.12)`; ctx.fillRect(i * W / 2, 0, W / 2, H); }
  ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = 'rgba(244,241,226,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 2; i++) {
    const p = duo[i]; const cx = W * (i ? .75 : .25);
    if (!p) { ctx.font = '900 34px "Black Han Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText(`${TEAM[i].name} 자리에 서요`, cx, H * .62); continue; }
    km.drawSkeleton(p, BONES, `rgba(${TEAM[i].rgb},.95)`, 5);
    // 머리 위 유지 고리
    let prog = 0; if (S.phase === 'race' || S.phase === 'copy') prog = S.phase === 'copy' && S.done[i] ? 1 : ev[i].progress;
    const hx = p[0].v > .5 ? p[0].x : (p[11].x + p[12].x) / 2, hy = (p[0].v > .5 ? p[0].y : p[11].y) - Math.abs(p[11].x - p[12].x) * .9;
    ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(hx, hy, 26, 0, Math.PI * 2); ctx.stroke();
    if (prog > 0) { ctx.strokeStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(hx, hy, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, prog)); ctx.stroke(); }
    if (S.phase === 'copy' && S.done[i]) { ctx.font = '900 26px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd84a'; ctx.fillText('✓', hx, hy + 9); }
  }
  // 떠오르는 점수
  S.pops = S.pops.filter(q => t - q.t < 1200);
  for (const q of S.pops) { const k = (t - q.t) / 1200; ctx.globalAlpha = 1 - k; ctx.font = '900 46px "Black Han Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd84a';
    ctx.strokeStyle = `rgb(${TEAM[q.i].rgb})`; ctx.lineWidth = 6; const x = W * (q.i ? .75 : .25), y = H * .45 - k * 80; ctx.strokeText(q.text, x, y); ctx.fillText(q.text, x, y); ctx.globalAlpha = 1; }
  // 정확도 막대
  if (S.scr === 'play') for (let i = 0; i < 2; i++) { const judged = S.phase === 'race' || (S.phase === 'copy' && !S.done[i]); $(i ? 'mR' : 'mB').style.width = (judged ? Math.round(ev[i].sim * 100) : 0) + '%'; }
  if (S.phase === 'ready') stepReady(t, dt);
  else if (S.phase === 'race') raceStep(t);
  else if (S.phase === 'copy') copyStep(t);
};
if (DEV) document.title += ' (개발용: 1·2 키 강제 성공)';
if (DEV) window.__duo = S;
