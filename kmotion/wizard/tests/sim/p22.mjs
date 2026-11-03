// v3.4 월드 3 「측정의 협곡」 시간 정령 「시계 보호막」(17 문서 2차 ⑤ · 09 문서 5절 W3 6행) — node tests/sim/p22.mjs
// 학년 줄(1 정각·30분 / 2 5분·1분 / 3 초) 시각 글자 판 정답 하나 · 오답 = 오개념 · 보호막 → 수정 문제 → 정답 깨짐·약점 → 다른 단계 시계로 다시 / 봇 1~4학년 협곡 완주 · 깬 수 > 0 / 숲·신전 시간 정령 0
import { GAME } from '../../sim/game/config.js';
import { createFlow } from '../../sim/flow/screens.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { pickSpiritShape } from '../../sim/learn/spirit.js';
import { TIME_SETS, timeSet, encodeTime, decodeTime, timePic, parseClock, genTime, timeWrongs } from '../../sim/learn/clock.js';
import { picHtml, svgMarkup } from '../../skins/proto/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['canyon-3-1'];
const BAN = /오전|오후|몇 분 전|경과|걸린 시간|24시간|달력/;

// ── 1. 데이터·문구
{ const D = data.enemies['time-spirit'], S = data.enemies['shape-spirit']; ok('enemies time-spirit: spirit "time" · 도형 정령과 같은 수치(HP·ATK·DEF·조각 shard)', D && D.spirit === 'time' && D.ranged && D.attack.proj === 'shard' && D.hp === S.hp && D.atk === S.atk && D.def === S.def && D.kind === 'time-spirit');
  const a2 = ST.zones.find(z => z.id === 'arena-2'), kinds = a2.waves.flatMap(w => w.spawn.map(s => s.kind));
  ok('canyon-3-1 전투장 2: 시간 정령 2 · 계산 고블린 1', kinds.filter(k => k === 'time-spirit').length === 2 && kinds.filter(k => k === 'calc-goblin').length === 1, kinds.join());
  ok('숲 4판·신전·협곡 전투장 1·길 = 시간 정령 0', ['forest-1-1', 'forest-1-2', 'forest-1-3', 'forest-1-boss', 'temple-2-1', 'temple-2-boss'].every(id => JSON.stringify(data.stages[id]).indexOf('time-spirit') < 0) && JSON.stringify(ST.zones.filter(z => z.id !== 'arena-2')).indexOf('time-spirit') < 0);
  const fams = ['hour', 'half', 'five', 'one', 'sec'], keys = ['q.spirit.time', 'toast.timeSpirit', 'learn.g1.clock.read', 'learn.g2.clock.read', 'learn.g3.clock.read', ...fams.map(f => 'hint.spirit.' + f), ...['hour-next', 'hour-prev', 'half-as-hour', 'swap', 'min-num', 'min-one', 'round-five', 'sec-num', 'sec-five'].map(t => 'why.clock-' + t)];
  ok(`문구 키 ${keys.length}`, keys.every(k => typeof T[k] === 'string' && T[k].length > 0), keys.filter(k => !T[k]).join());
  ok('2차 낱말 0(오전·오후·몇 분 전·경과·달력)', !BAN.test(keys.map(k => T[k]).join('\n')));
  ok('부호화 왕복: 7시 30분 = 730 · 7시 30분 15초 = 73015 · tm: 글자 판', encodeTime(7, 30) === 730 && encodeTime(7, 30, 15) === 73015 && JSON.stringify(decodeTime(730)) === JSON.stringify({ h: 7, m: 30, s: null }) && decodeTime(73015).s === 15 && timePic(730) === 'tm:7,30' && timePic(73015) === 'tm:7,30,15' && parseClock('clock:12,5,10').s === 10);
  ok('proto 그림: clock: 12 숫자·바늘 · 초침은 s 있을 때만 · tm: 글자 「7시 30분」·「7시」(정각은 분 없음) · svgMarkup 이미지용 CSS 변수 0', /<text[^>]*>12</.test(picHtml('clock:7,30')) && !/d9534f/.test(picHtml('clock:7,30')) && /d9534f/.test(picHtml('clock:7,30,15')) && picHtml('tm:7,30').includes('7시 30분') && picHtml('tm:7,0').includes('>7시<') && picHtml('tm:7,30,15').includes('15초') && /^<svg xmlns/.test(svgMarkup('clock:3,15')) && svgMarkup('clock:3,15').indexOf('var(') < 0); }

// ── 2. 학년 줄 생성 300 · 오답 규칙 · 엔진 통과
for (const [gk, S] of Object.entries(TIME_SETS)) { const qe = new QuestionEngine({ rng: createRng(7), concepts: [] }); let bad = 0, fams = new Set(), note = '';
  for (let i = 0; i < 300; i++) { const sh = pickSpiritShape(qe.rng, +gk[1], null, 'time'); const b = qe.next({ fixed: { concept: sh.concept, fam: sh.fam, code: sh.code } }); fams.add(sh.fam);
    const t = parseClock(sh.code), nums = b.choices.map(c => c.num);
    const good = sh.type === 'time' && b.concept === S.concept && b.verified && b.choicePic && b.pic === sh.code && nums[b.correctSlot] === encodeTime(t.h, t.m, t.s) && new Set(nums).size === 3 && b.choices.every(c => c.pic === timePic(c.num)) && b.choices.every(c => { const d = decodeTime(c.num); return d.h >= 1 && d.h <= 12 && d.m >= 0 && d.m <= 59 && (d.s == null || d.s <= 59); })
      && (sh.fam !== 'hour' || t.m === 0) && (sh.fam !== 'half' || t.m === 30) && (sh.fam !== 'five' || (t.m % 5 === 0 && t.m > 0)) && (sh.fam !== 'one' || t.m % 5 !== 0) && (sh.fam !== 'sec' || (t.s != null && t.s % 5 === 0));
    if (!good) { bad++; note = note || JSON.stringify({ sh, nums, pic: b.pic }); } }
  ok(`${gk} 300: 문제 그림 = 보호막 시계 · 보기 시각 판 3(tm:) · 정답 = 그 시각 · 묶음 규칙(정각/30분/5분/1분/초) · 단계 ${S.fams.length} 다 나옴`, bad === 0 && fams.size === S.fams.length, bad ? note : `단계 ${[...fams]}`); }
{ const rng = createRng(3); let same = 0, badW = 0; for (let g = 1; g <= 4; g++) { let prev = null; for (let i = 0; i < 200; i++) { const s = pickSpiritShape(rng, g, prev, 'time'); if (s.fam === prev) same++; prev = s.fam; const t = genTime(rng, s.fam); const ws = timeWrongs(t), ans = encodeTime(t.h, t.m, t.s); if (ws.length < 2 || ws.some(([v]) => v === ans) || new Set(ws.map(w => w[0])).size !== ws.length) badW++; } }
  ok('다시 켜지는 보호막은 늘 다른 단계(1~4학년 200번씩) · 오답 늘 2개↑·정답과 다름·중복 0 · 4학년 = 3학년 줄', same === 0 && badW === 0 && timeSet(4) === TIME_SETS.g3, `같음 ${same} 오답 불량 ${badW}`);
  ok('fixedOnly: 시계 읽기 3종은 보통 풀에 안 들어감', ['g1.clock.read', 'g2.clock.read', 'g3.clock.read'].every(k => GENERATORS[k].fixedOnly) && !ST.concepts.some(k => GENERATORS[k].fixedOnly) && !data.gradeTable['canyon-3-1'].g2.concepts.some(k => GENERATORS[k].fixedOnly));
  // 오개념 오답 하나씩 눈으로: 7시 25분(five) → 7시 5분(min-num)·8시 25분(hour-next)·5시 35분(swap)
  const ws = timeWrongs({ fam: 'five', h: 7, m: 25, s: null }); ok('5분 단위 7시 25분 오답 = 7시 5분(긴바늘 숫자 그대로)·8시 25분(다음 숫자)·5시 35분(바늘 바꿈)', JSON.stringify(ws) === JSON.stringify([[705, 'clock-min-num'], [825, 'clock-hour-next'], [535, 'clock-swap']]), JSON.stringify(ws));
  const w2 = timeWrongs({ fam: 'half', h: 6, m: 30, s: null }); ok('6시 30분 오답에 정답 없음(바늘 바꿈이 같아지는 경우 빠짐)', w2.every(([v]) => v !== 630) && w2.length >= 2, JSON.stringify(w2)); }

// ── 3. 판 안: 협곡 전투장 2 시간 정령 — 수정 → 시각 문제 → 정답 깨짐·약점 → 다른 단계 시계
const push = (g, type, value = {}) => g.input.push({ type, t: g.t * 1000, via: 'key', value });
function toSpirit(grade, seed){ const f = createFlow({ data, grade, seed, startZone: 3, stage: 'canyon-3-1', forceStage: true }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game; const evs = [];
  for (let i = 0; i < 60 * 8; i++) { f.step(1 / 60); evs.push(...f.drainEvents()); const sp = g.enemies.find(e => e.spirit && e.state !== 'spawn' && e.state !== 'dead'); if (sp) return { f, g, sp, evs }; } return { f, g, sp: null, evs }; }
function run(f, g, sec, evs, until = null){ for (let i = 0; i < 60 * sec; i++) { f.step(1 / 60); evs.push(...f.drainEvents()); if (until && until()) return true; } return false; }
function openSpiritQ(f, g, evs){ return run(f, g, 25, evs, () => { if (g.q) return true; const c = g.crystals.find(x => x.kind === 'math'); if (c) { push(g, 'MOVE', { u: c.pos[0] / GAME.player.xMax }); if (Math.abs(c.pos[0] - g.player.pos[0]) <= GAME.crystal.reach) push(g, 'ATTACK', { zone: 1, side: 'R' }); } g.player.hp = g.player.hpMax; return false; }); }
for (const grade of [1, 2, 3]) {
  const { f, g, sp, evs } = toSpirit(grade, 60 + grade); const S0 = sp && g.snapshot().enemies.find(e => e.uid === sp.uid);
  ok(`${grade}학년 시간 정령 등장: 스냅샷 spirit {type time · pic clock: · up} · 단계 = 학년 줄 · kind time-spirit`, !!(S0 && S0.kind === 'time-spirit' && S0.spirit && S0.spirit.type === 'time' && S0.spirit.up && !S0.spirit.weak && /^clock:/.test(S0.spirit.pic) && timeSet(grade).fams.includes(S0.spirit.fam) && evs.some(e => e.type === 'enemy:spawn' && e.kind === 'time-spirit')), S0 ? JSON.stringify(S0.spirit) : '정령 없음');
  if (!sp) continue;
  g.input.length = 0; const opened = openSpiritQ(f, g, evs); const s1 = g.snapshot(), Q = s1.question;
  ok(`${grade}학년 수정 → 문제 kind spirit · 그림 = 보호막 시계 · 보기 tm: 3 · 문구 q.spirit.time`, opened && Q && Q.kind === 'spirit' && Q.spiritUid === sp.uid && Q.pic === sp.spirit.code && Q.choices.every(c => /^tm:/.test(c.pic)) && Q.prompt.key === 'q.spirit.time', Q ? Q.kind + ' ' + Q.pic : '안 열림');
  if (!opened || !Q || Q.kind !== 'spirit') continue;
  if (grade === 2) { run(f, g, 2.2, evs, () => g.t >= g.q.readUntil); const w = [0, 1, 2].find(x => x !== g.q.v.correctSlot); push(g, 'SELECT', { slot: w }); run(f, g, 6, evs, () => !g.q);
    ok('2학년 오답: 보호막 그대로 · 「why.clock-*」 · 재도전 예약 0', sp.spirit.up && !evs.some(e => e.type === 'enemy:spiritBreak') && evs.some(e => e.type === 'q:wrong' && /^clock-/.test(e.tag)) && g.qe.retry.length === 0, `retry ${g.qe.retry.length}`);
    openSpiritQ(f, g, evs); if (!g.q || g.q.kind !== 'spirit') { ok('2학년 두 번째 정령 문제', false); continue; } }
  run(f, g, 2.2, evs, () => g.t >= g.q.readUntil); const fam0 = sp.spirit.fam; push(g, 'SELECT', { slot: g.q.v.correctSlot }); run(f, g, .2, evs);
  const brk = evs.find(e => e.type === 'enemy:spiritBreak' && e.uid === sp.uid), s2 = g.snapshot().enemies.find(e => e.uid === sp.uid);
  ok(`${grade}학년 정답 → enemy:spiritBreak · up false · weak true · 토스트`, !!brk && s2 && !s2.spirit.up && s2.spirit.weak && g.toast && g.toast.key === 'toast.spiritBroke');
  run(f, g, 1.5, evs, () => !g.q); push(g, 'MOVE', { u: sp.pos[0] / GAME.player.xMax }); for (let i = 0; i < 3 && sp.state !== 'dead'; i++) { push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, g, .35, evs); }
  if (sp.state === 'dead') { ok(`${grade}학년 약점 시간에 처치`, true); continue; }
  const re = run(f, g, GAME.spirit.weakT + 1, evs, () => sp.spirit.up || sp.state === 'dead'); const sh = evs.find(e => e.type === 'enemy:spiritShield' && e.uid === sp.uid);
  if (sp.state === 'dead') { ok(`${grade}학년 약점 시간에 처치(날아가던 탄)`, true); continue; }
  ok(`${grade}학년 약점 뒤 → enemy:spiritShield · 다른 단계 · pic clock:`, re && !!sh && sh.fam !== fam0 && /^clock:/.test(sh.pic) && timeSet(grade).fams.includes(sh.fam), sh ? fam0 + '→' + sh.fam : '안 켜짐');
}
// 도형 정령은 그대로(신전): type shape · pic 은 PIC 코드 id
{ const f = createFlow({ data, grade: 1, seed: 5, startZone: 3, stage: 'temple-2-1', forceStage: true }); f.action('start', { mode: 'keyboard' }); f.action('enter'); let sp = null; for (let i = 0; i < 60 * 8 && !sp; i++) { f.step(1 / 60); f.drainEvents(); sp = f.game.snapshot().enemies.find(e => e.spirit); }
  ok('신전 도형 정령 그대로: type shape · pic = 모양 id', !!(sp && sp.spirit.type === 'shape' && !/:/.test(sp.spirit.pic)), sp ? JSON.stringify(sp.spirit) : '없음'); }

// ── 4. 봇 완주 1~4학년
for (const grade of [1, 2, 3, 4]) { let wins = 0, brk = 0, note = []; for (let i = 0; i < 3; i++) { const r = playOne({ data, seed: 950 + grade * 10 + i, acc: .85, react: .35, grade, stage: 'canyon-3-1', maxT: 900, rand: (() => { let x = 7 + i; return () => (x = (x * 16807) % 2147483647) / 2147483647; })() });
    if (r.win) wins++; brk += r.spiritBreaks || 0; note.push(`${r.win ? '승' : '패'}${r.q}`); }
  ok(`${grade}학년 canyon-3-1 봇 3판 완주 · 보호막 깬 수 > 0`, wins === 3 && brk > 0, note.join(' ') + ` 깸 ${brk}`); }

console.table(out); console.log(fail ? `✗ ${fail}개 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
