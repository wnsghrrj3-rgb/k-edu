// 규칙 찾기 · 둘이 대결 (1학년 2학기 「규칙 찾기」) — 엔진 0.7.2 duo + 포즈 히어로 판정 재사용
//  다음은 뭘까? : 아래 규칙 줄의 빈칸에 올 것을, 내 몸 옆·머리 위에 뜬 보기 풍선에 손을 대서 고름. 먼저 맞히면 2점, 뒤에 맞혀도 1점, 틀리면 하트 −1.
//                 두 문제마다 단계가 오름(문제는 gen.js).
//  몸으로 규칙  : 동작 규칙 8칸을 차례대로 둘 다 따라 함. 단계가 오르면 뒤 칸이 「?」로 가려져 규칙을 찾아 이어 가야 함(가린 칸은 2점). 못 하면 하트 −1.
//  한 판 90초 · 하트 3개. 손이 안 잡힐 때 글쇠: 청팀 A·S·D / 홍팀 J·K·L (왼쪽·위·오른쪽). ?dev=1 이면 1·2 = 지금 동작 강제 성공.
import { POSE_BY_ID, gradeOf, PASS } from '../pose-hero/js/poses.js';
import { PoseNormalizer, similarity } from '../pose-hero/js/evaluator.js';
import { AudioManager } from '../pose-hero/js/audio.js';
import { makeQuestion, makeRow } from './gen.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search), DEV = Q.has('dev');
const TEAM = [{ name: '청팀', cls: 'blue', rgb: '47,111,228' }, { name: '홍팀', cls: 'red', rgb: '226,64,59' }];
const GAME_MS = 90000, LIVES = 3, TOUCH_MS = 450;
const BONES = [[11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28]];
const MODE_NAME = { next: '다음은 뭘까?', body: '몸으로 규칙' };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ── 동작(1학년 말로). 차렷은 팔이 화면 밖으로 나가도 「내림」으로 봄
const restSim = f => { if (!f) return { sim: 0, missing: ['body'] }; let e = 0;
  for (const s of ['L', 'R']) { const a = f['arm' + s]; let x = a === undefined ? 0 : clamp((Math.abs(a) - 30) / 50, 0, 1);
    if (f.vis['wr' + s] && f['wy' + s] > -.2) x = Math.max(x, clamp((f['wy' + s] + .2) / .6, 0, 1)); e += x; }
  return { sim: 1 - e / 2, missing: [] }; };
const P = { rest: { id: 'rest', hold: 400, custom: restSim }, ...POSE_BY_ID };
const NAME = { rest: '차렷', arms_up: '만세', arms_side: '비행기', raise_right: '한 손 번쩍', raise_left: '한 손 번쩍', hands_top: '머리 위 세모', cross: '엑스' };
// 막대 사람 그림(거울: 아이의 오른팔 = 그림 오른쪽). 팔 = [팔꿈치, 손]
const ARM = { down: s => [[30 + s * 9, 37], [30 + s * 11, 48]], up: s => [[30 + s * 10, 15], [30 + s * 14, 3]], side: s => [[30 + s * 14, 27], [30 + s * 26, 27]],
  top: s => [[30 + s * 13, 15], [30 + s * 1.5, 3]], cross: s => [[30 + s * 9, 36], [30 - s * 9, 29]] };
const FIG = { rest: ['down', 'down'], arms_up: ['up', 'up'], arms_side: ['side', 'side'], raise_right: ['down', 'up'], raise_left: ['up', 'down'], hands_top: ['top', 'top'], cross: ['cross', 'cross'] };
function figure(id){ const [l, r] = FIG[id]; const arm = (k, s) => { const [e, w] = ARM[k](s); return `<polyline points="${30 + s * 5},26 ${e} ${w}"/>`; };
  return `<svg viewBox="1 -2 58 72" fill="none" stroke="#f4f1e2" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="13" r="7.5" fill="#f4f1e2" stroke="none"/><path d="M30 22V46M30 46L21 66M30 46L39 66"/><g stroke="#ffd84a">${arm(l, -1)}${arm(r, 1)}</g></svg>`; }

class Ev { // 포즈 히어로 판정기와 같은 방식 + custom(차렷)
  constructor(){ this.norm = new PoseNormalizer(); this.target = null; this.sim = 0; this.hold = 0; this.holdMs = 400; this.lastT = 0; this.locked = false; this.force = false; }
  setTarget(p, ms){ this.target = p; this.holdMs = ms || 400; this.sim = 0; this.hold = 0; this.locked = false; this.force = false; }
  update(p33, t){ const dt = this.lastT ? Math.min(100, t - this.lastT) : 0; this.lastT = t; const f = this.norm.read(p33); if (!this.target || this.locked) return null;
    if (this.force) { this.locked = true; return { sim: .95 }; }
    const r = this.target.custom ? this.target.custom(f) : similarity(this.target, f); if (r.missing.length) { this.sim *= .97; return null; }
    this.sim += (r.sim - this.sim) * .4; if (this.sim >= PASS) this.hold += dt; else this.hold = Math.max(0, this.hold - dt * 2);
    if (this.hold >= this.holdMs) { this.locked = true; return { sim: this.sim }; } return null; }
  get progress(){ return Math.min(1, this.hold / this.holdMs); }
}

const audio = new AudioManager();
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['pose'], duo: true, numPoses: 3, activity: 'pattern-duo' });
const ev = [new Ev(), new Ev()];
let duo = [null, null], started = false;
const S = { solo: Q.has('solo'), scr: 'menu', mode: 'next', start: 1, score: [0, 0], lives: [LIVES, LIVES], out: [false, false], phase: '', t0: 0, limit: 0, gameT0: 0, stage: 1,
  q: null, qn: 0, ans: [null, null], picked: [-1, -1], first: -1, hov: [{ k: -1, ms: 0 }, { k: -1, ms: 0 }], spots: [[], []], key: [-1, -1],
  row: null, rown: 0, cell: -1, done: [null, null], ready: [null, null], pops: [], timers: [] };

// ── 메뉴
document.querySelectorAll('.mode').forEach(b => b.onclick = () => { document.querySelectorAll('.mode').forEach(x => x.classList.toggle('on', x === b)); S.mode = b.dataset.m; });
$('start').querySelectorAll('button').forEach(b => b.onclick = () => { $('start').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.start = +b.dataset.v; });
$('who').querySelectorAll('button').forEach(b => { b.classList.toggle('on', (b.dataset.v === 'solo') === S.solo); b.onclick = () => { $('who').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.solo = b.dataset.v === 'solo'; }; });
$('btnGo').onclick = () => begin(); $('btnAgain').onclick = () => begin(); $('btnMenu').onclick = () => toMenu();
const KEYS = { a: [0, 'L'], s: [0, 'T'], d: [0, 'R'], j: [1, 'L'], k: [1, 'T'], l: [1, 'R'] };
addEventListener('keydown', e => { if (e.key === 'Escape' && S.scr !== 'menu') return toMenu();
  const k = KEYS[e.key.toLowerCase()]; if (k && S.phase === 'ask') { const idx = S.spots[k[0]].findIndex(s => s.pos === k[1]); if (idx >= 0) S.key[k[0]] = idx; }
  if (DEV && S.phase === 'body' && (e.key === '1' || e.key === '2')) ev[+e.key - 1].force = true; });

function show(id, on){ $(id).classList.toggle('hidden', !on); }
function clearTimers(){ S.timers.forEach(clearTimeout); S.timers = []; }
const later = (ms, fn) => S.timers.push(setTimeout(fn, ms));
function toMenu(){ clearTimers(); audio.stopMusic(); S.scr = 'menu'; S.phase = ''; show('scrMenu', 1); show('scrEnd', 0); show('board', 0); show('strip', 0); banner(''); }

async function begin(){
  audio.ensure(); clearTimers(); show('scrMenu', 0); show('scrEnd', 0);
  if (!started) { try { await km.start(); started = true; } catch (e) { banner('카메라를 켤 수 없어요', '', '주소창의 카메라 권한을 허용해 주세요'); later(2500, toMenu); return; } }
  km.resetDuo(); S.score = [0, 0]; S.lives = [LIVES, LIVES]; S.out = [false, false]; S.qn = 0; S.rown = 0; S.stage = S.start; S.q = null; S.row = null;
  S.ready = [null, null]; S.scr = 'ready'; S.phase = 'ready'; ev.forEach(e => e.setTarget(null));
  show('board', 1); show('strip', 1); $('board').classList.toggle('solo', S.solo); $('tn0').firstChild.textContent = S.solo ? '나' : '청팀'; setScore(); setLives(); setTimer(0); $('round').textContent = MODE_NAME[S.mode]; $('cells').innerHTML = ''; $('rule').textContent = S.solo ? '자리에 서서 양팔이 보이게 해요' : '둘 다 자리에 서서 양팔이 보이게 해요';
}

// ── 화면 조각
function banner(text, cls = '', sub = ''){ const b = $('banner'); if (!text) { b.classList.add('hidden'); return; } b.className = 'banner ' + cls; b.innerHTML = text + (sub ? `<small>${sub}</small>` : ''); }
function setScore(bump){ $('sB').textContent = S.score[0]; $('sR').textContent = S.score[1];
  if (bump != null) { const el = $(bump ? 'sR' : 'sB'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
function setLives(){ for (let i = 0; i < 2; i++) $(i ? 'hR' : 'hB').textContent = S.out[i] ? '탈락' : '❤'.repeat(S.lives[i]) + '♡'.repeat(LIVES - S.lives[i]); }
function setTimer(k){ const i = $('tFill'); i.style.transform = `scaleX(${clamp(k, 0, 1)})`; i.classList.toggle('low', k < .3); }
function pop(i, text){ S.pops.push({ i, text, t: performance.now() }); }
const left = () => Math.max(0, GAME_MS - (performance.now() - S.gameT0));
const alive = i => !S.out[i] && !(S.solo && i === 1);
const midX = i => S.solo ? km.W / 2 : km.W * (i ? .75 : .25);
function label(){ $('round').textContent = `${MODE_NAME[S.mode]} · ${S.stage}단계 · 남은 ${Math.ceil(left() / 1000)}초`; }
function add(i, pts, text){ S.score[i] += pts; setScore(i); pop(i, text); }
function miss(i, why){ if (S.out[i]) return; S.lives[i]--; audio.hurt(); pop(i, why || '놓쳤어요 −❤'); if (S.lives[i] <= 0) { S.out[i] = true; ev[i].setTarget(null); } setLives(); }
function overCheck(){ if (S.out[0] || S.out[1]) { S.phase = 'gap'; later(900, finish); return true; } if (left() <= 0) { S.phase = 'gap'; banner('시간 끝!'); later(1200, finish); return true; } return false; }
let ticked = false; function tickLow(k){ if (k < .3 && !ticked) { ticked = true; audio.tick(); } if (k >= .3) ticked = false; }

// ── 자리 잡기(겸 보정): 둘 다 어깨·양팔이 1.5초 보이면 각자 기준(어깨 높이·폭) 저장
function stepReady(dt){
  for (let i = 0; i < 2; i++) { const p = duo[i]; const r = S.ready[i] || (S.ready[i] = { acc: 0, y: 0, w: 0, n: 0 });
    const ok = p && p[11].v > .5 && p[12].v > .5 && p[15].v > .4 && p[16].v > .4;
    if (ok) { r.acc += dt; r.y += (p[11].y + p[12].y) / 2; r.w += Math.abs(p[11].x - p[12].x); r.n++; } else { r.acc = Math.max(0, r.acc - dt); if (!r.acc) { r.y = r.w = r.n = 0; } } if (S.solo && i === 1) r.acc = 1500; }
  setTimer(Math.min(S.ready[0].acc, S.ready[1].acc) / 1500);
  if (S.ready[0].acc >= 1500 && S.ready[1].acc >= 1500) {
    S.ready.forEach((r, i) => { if (r.n) ev[i].norm.base = { cx: 0, shY: r.y / r.n, sw: r.w / r.n }; });
    S.phase = 'count'; $('rule').textContent = S.mode === 'next' ? '빈칸에 올 것을 찾아 풍선에 손을 대요' : '노란 칸의 동작을 차례대로 따라 해요';
    let n = 3; const tick = () => { if (n) { banner(String(n)); audio.count(false); n--; later(700, tick); } else { banner('시작!'); audio.count(true); audio.startMusic('party', 112);
      later(600, () => { banner(''); S.scr = 'play'; S.gameT0 = performance.now(); S.mode === 'next' ? nextQ() : bodyRow(); }); } };
    tick(); }
}

// ══ 다음은 뭘까?
function cellHTML(x, kind){ return x == null ? `<div class="cell hole">?</div>` : `<div class="cell${kind === 'num' ? ' num' : ''}">${x}</div>`; }
function nextQ(){
  if (overCheck()) return; S.qn++; S.stage = S.start + Math.floor((S.qn - 1) / 2);
  const q = S.q = makeQuestion(S.stage); S.ans = [null, null]; S.picked = [-1, -1]; S.first = -1; S.key = [-1, -1]; S.hov = [{ k: -1, ms: 0 }, { k: -1, ms: 0 }];
  $('cells').className = 'cells'; $('cells').innerHTML = q.cells.map(x => cellHTML(x, q.kind)).join(''); $('rule').textContent = '빈칸에 올 것은?'; audio.appear(); setTimer(1); label();
  // 보기 자리: 문제마다 각자 몸 기준으로 고정(왼쪽·머리 위·오른쪽). 보기 2개면 왼쪽·오른쪽
  const W = km.W, H = km.H, pos = q.choices.length === 2 ? ['L', 'R'] : ['L', 'T', 'R'];
  for (let i = 0; i < 2; i++) { const p = duo[i], b = ev[i].norm.base || { shY: H * .5, sw: 90 }; const sw = clamp(b.sw, 46, 150), r = clamp(sw * .55, 34, 62);
    const ok = p && p[11].v > .5 && p[12].v > .5, cx = ok ? (p[11].x + p[12].x) / 2 : midX(i), cy = ok ? (p[11].y + p[12].y) / 2 : b.shY;
    S.spots[i] = pos.map(k => ({ pos: k, r, x: clamp(cx + (k === 'L' ? -1.6 : k === 'R' ? 1.6 : 0) * sw, (S.solo ? 0 : i * W / 2) + r + 4, (S.solo ? W : (i + 1) * W / 2) - r - 4),
      y: clamp(cy - (k === 'T' ? 1.8 : .55) * sw, H * .17 + r, H * .68) })); }
  S.limit = Math.max(7000, 13000 - S.qn * 350); S.phase = 'show'; later(700, () => { S.phase = 'ask'; S.t0 = performance.now(); });
}
function nextStep(t, dt){
  const k = 1 - (t - S.t0) / S.limit; setTimer(k); label(); tickLow(k);
  for (let i = 0; i < 2; i++) { if (!alive(i) || S.ans[i]) continue; const p = duo[i], h = S.hov[i]; let on = -1;
    if (p) S.spots[i].forEach((s, n) => { for (const j of [15, 16, 19, 20]) if (p[j] && p[j].v > .4 && Math.hypot(p[j].x - s.x, p[j].y - s.y) < s.r * 1.15) on = n; });
    if (on >= 0 && on === h.k) h.ms += dt; else { h.k = on; h.ms = 0; }
    if (S.key[i] >= 0) { choose(i, S.key[i], t); S.key[i] = -1; } else if (on >= 0 && h.ms >= TOUCH_MS) choose(i, on, t); }
  if ([0, 1].every(i => !alive(i) || S.ans[i]) || k <= 0) reveal(k <= 0);
}
function choose(i, n, t){
  S.picked[i] = n; S.hov[i] = { k: -1, ms: 0 };
  if (S.q.choices[n] === S.q.answer) { S.ans[i] = 'ok'; audio.success('GREAT');
    if (S.first < 0) { S.first = i; add(i, 2, S.solo ? '정답! +2' : '먼저! +2'); const rest = S.limit - (t - S.t0); if (rest > 3500) S.limit -= rest - 3500; } else add(i, 1, '+1'); }
  else { S.ans[i] = 'bad'; miss(i, '아쉬워요 −❤'); }
}
function reveal(timeout){
  S.phase = 'gap'; const q = S.q, c = $('cells').children[q.hole]; c.className = 'cell filled' + (q.kind === 'num' ? ' num' : ''); c.textContent = q.answer;
  $('rule').textContent = '규칙: ' + q.rule; if (timeout && S.first < 0) audio.fail();
  later(1900, nextQ);
}
function drawSpots(ctx, t){
  if (!S.q || !(S.phase === 'show' || S.phase === 'ask' || S.phase === 'gap') || S.mode !== 'next' || S.scr !== 'play') return;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 2; i++) { if (!alive(i)) continue;
    S.spots[i].forEach((s, n) => { const v = S.q.choices[n], right = v === S.q.answer, picked = S.picked[i] === n;
      const gone = (S.ans[i] && !picked && !(S.phase === 'gap' && right)); ctx.globalAlpha = gone ? .25 : S.phase === 'show' ? .6 : 1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = picked ? (right ? '#c9f7d3' : '#ffc9c6') : (S.phase === 'gap' && right) ? '#c9f7d3' : 'rgba(255,255,255,.93)'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = picked ? (right ? '#1f9d4d' : '#d43b36') : `rgb(${TEAM[i].rgb})`; ctx.stroke();
      if (S.q.kind === 'num') { ctx.font = `400 ${s.r * 1.05}px "Black Han Sans", sans-serif`; ctx.fillStyle = '#14251b'; } else { ctx.font = `${s.r * 1.15}px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`; ctx.fillStyle = '#000'; }
      ctx.fillText(String(v), s.x, s.y + s.r * .06);
      const h = S.hov[i]; if (S.phase === 'ask' && !S.ans[i] && h.k === n && h.ms > 0) { ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h.ms / TOUCH_MS)); ctx.stroke(); }
      ctx.globalAlpha = 1; }); }
  ctx.textBaseline = 'alphabetic';
}

// ══ 몸으로 규칙
function bodyRow(){
  if (overCheck()) return; S.rown++; S.stage = S.start + S.rown - 1; const row = S.row = makeRow(S.stage); S.cell = -1; label();
  $('cells').className = 'cells body'; $('cells').innerHTML = row.seq.map((id, n) => n < row.show ? `<div class="cell">${figure(id)}</div>` : `<div class="cell hole">?</div>`).join('');
  $('rule').textContent = row.show < 8 ? '「?」 칸은 규칙을 찾아서 이어 가요' : '노란 칸의 동작을 차례대로!'; banner(`${S.stage}단계`); audio.appear(); S.phase = 'gap';
  later(1000, () => { banner(''); bodyCell(); });
}
function bodyCell(){
  if (overCheck()) return; const row = S.row, cs = $('cells').children; if (S.cell >= 0) { cs[S.cell].classList.remove('now'); cs[S.cell].classList.add('past'); }
  S.cell++;
  if (S.cell >= 8) { S.phase = 'gap'; banner('규칙 완성!'); audio.success('PERFECT'); $('rule').textContent = '규칙: ' + row.unit.map(id => NAME[id]).join(' → ') + ' 되풀이'; later(1500, () => { banner(''); bodyRow(); }); return; }
  const hidden = S.cell >= row.show, p = P[row.seq[S.cell]]; cs[S.cell].classList.add('now'); S.done = [null, null];
  $('rule').textContent = hidden ? '다음 동작은 뭘까? 규칙을 생각해요!' : NAME[p.id];
  S.limit = Math.max(2400, 5000 * Math.pow(.93, S.rown - 1)) + (hidden ? 1200 : 0);
  ev.forEach((e, i) => alive(i) ? e.setTarget(p, 380) : e.setTarget(null)); S.phase = 'body'; S.t0 = performance.now(); setTimer(1);
}
function bodyStep(t){
  const k = 1 - (t - S.t0) / S.limit; setTimer(k); label(); tickLow(k); const hidden = S.cell >= S.row.show;
  for (let i = 0; i < 2; i++) if (alive(i) && !S.done[i]) { const r = ev[i].update(duo[i], t);
    if (r) { S.done[i] = 'ok'; ev[i].setTarget(null); audio.success(gradeOf(r.sim).id); add(i, hidden ? 2 : 1, hidden ? '규칙 발견! +2' : '+1'); } }
  const all = [0, 1].every(i => !alive(i) || S.done[i]);
  if (all || k <= 0) { S.phase = 'gap'; const c = $('cells').children[S.cell];
    if (hidden) { c.className = 'cell filled now'; c.innerHTML = figure(S.row.seq[S.cell]); }
    c.insertAdjacentHTML('beforeend', `<span class="who">${S.done[0] ? '<i class="b"></i>' : ''}${S.done[1] ? '<i class="r"></i>' : ''}</span>`);
    for (let i = 0; i < 2; i++) if (alive(i) && !S.done[i]) miss(i); ev.forEach(e => e.setTarget(null)); later(all ? 280 : hidden ? 1100 : 600, bodyCell); }
}

function finish(){
  if (S.scr === 'end') return; S.scr = 'end'; S.phase = ''; clearTimers(); audio.stopMusic(); banner(''); show('strip', 0);
  let w; if (S.out[0] !== S.out[1]) w = S.out[0] ? 1 : 0; else if (S.score[0] !== S.score[1]) w = S.score[0] > S.score[1] ? 0 : 1; else if (S.lives[0] !== S.lives[1]) w = S.lives[0] > S.lives[1] ? 0 : 1; else w = -1;
  $('wTeam').textContent = w < 0 ? '비겼어요' : `${TEAM[w].name} 승리`; $('wTeam').className = 'win ' + (w < 0 ? '' : TEAM[w].cls);
  document.querySelector('.final').classList.toggle('hidden', S.solo); let best = 0;
  if (S.solo) { const key = 'kmotion.pattern.best.' + S.mode; try { best = +localStorage.getItem(key) || 0; if (S.score[0] > best) localStorage.setItem(key, S.score[0]); } catch (_) {}
    $('wTeam').textContent = `${S.score[0]}점`; $('wTeam').className = 'win blue'; }
  $('fB').textContent = S.score[0]; $('fR').textContent = S.score[1];
  const why = S.solo ? (S.out[0] ? '하트를 다 썼어요' : '90초 끝') + (S.score[0] > best && best ? ' · 새 기록!' : best ? ` · 내 최고 ${best}점` : '') : S.out[0] && S.out[1] ? '둘 다 하트를 다 썼어요' : S.out[0] || S.out[1] ? `${TEAM[S.out[0] ? 0 : 1].name}이 하트를 다 썼어요` : '90초 끝 · 점수가 많은 팀이 이겨요';
  $('wNote').textContent = `${why} · ${S.stage}단계까지 갔어요`; w < 0 && !S.solo ? audio.appear() : audio.win(); show('scrEnd', 1);
}

// ── 프레임
let lastT = 0;
km.onFrame = f => {
  const t = f.t, dt = lastT ? Math.min(100, t - lastT) : 0; lastT = t; duo = f.duo || [null, null]; if (S.solo) duo = [duo[0] || duo[1], null];
  const ctx = f.ctx, W = f.W, H = f.H; km.drawCamera();
  if (!S.solo) { for (let i = 0; i < 2; i++) { ctx.fillStyle = S.out[i] ? 'rgba(20,20,20,.6)' : `rgba(${TEAM[i].rgb},.12)`; ctx.fillRect(i * W / 2, 0, W / 2, H); }
  ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = 'rgba(244,241,226,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.restore(); }
  ctx.textAlign = 'center';
  for (let i = 0; i < 2; i++) { if (S.solo && i) continue; const p = duo[i], cx = midX(i);
    if (S.out[i]) { ctx.font = '400 64px "Black Han Sans", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText('탈락', cx, H * .5); continue; }
    if (!p) { if (S.scr !== 'menu' && S.scr !== 'end') { ctx.font = '400 32px "Black Han Sans", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText(S.solo ? '자리에 서요' : `${TEAM[i].name} 자리에 서요`, cx, H * .5); } continue; }
    km.drawSkeleton(p, BONES, `rgba(${TEAM[i].rgb},.95)`, 5);
    if (S.phase === 'ready') { const a = S.ready[i] ? S.ready[i].acc / 1500 : 0; ctx.font = '400 30px "Black Han Sans", sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(a >= 1 ? '준비 완료!' : '그대로!', cx, H * .2); }
    if (S.mode === 'body' && (S.phase === 'body' || S.done[i]) && S.scr === 'play') { const prog = S.done[i] ? 1 : ev[i].progress;
      const hx = p[0].v > .5 ? p[0].x : (p[11].x + p[12].x) / 2, hy = Math.max(H * .2, (p[0].v > .5 ? p[0].y : p[11].y) - Math.abs(p[11].x - p[12].x) * .9);
      ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(hx, hy, 26, 0, Math.PI * 2); ctx.stroke();
      if (prog > 0) { ctx.strokeStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(hx, hy, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke(); }
      if (S.done[i]) { ctx.font = '900 26px sans-serif'; ctx.fillStyle = '#ffd84a'; ctx.fillText('✓', hx, hy + 9); } } }
  drawSpots(ctx, t);
  S.pops = S.pops.filter(q => t - q.t < 1200);
  for (const q of S.pops) { const k = (t - q.t) / 1200; ctx.globalAlpha = 1 - k; ctx.font = '400 40px "Black Han Sans", sans-serif'; ctx.fillStyle = '#ffd84a';
    ctx.strokeStyle = `rgb(${TEAM[q.i].rgb})`; ctx.lineWidth = 6; const x = midX(q.i), y = H * .45 - k * 70; ctx.strokeText(q.text, x, y); ctx.fillText(q.text, x, y); ctx.globalAlpha = 1; }
  if (S.phase === 'ready') stepReady(dt); else if (S.phase === 'ask') nextStep(t, dt); else if (S.phase === 'body') bodyStep(t);
};
if (DEV) window.__pt = S;
