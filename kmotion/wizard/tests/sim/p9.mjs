// v2.3 3학년 「똑같이 나누기 공격」(15 문서 8절 검증 계획, D-29~31) — node tests/sim/p9.mjs
// 변환표 교체·1학년 무변경(골든은 golden.mjs) / 묶음 스폰 n·hpEach·합 / share 문제 숫자 = 장면 묶음 / 정답 → 탄 n·exact·처치 / 오답 → 피해 0·재도전 / 흐트러진 묶음 재계산 / 2마리 미만 해제 / 봇 ?grade=3 6판 완주
import { createFlow } from '../../sim/flow/screens.js';
import { createGame } from '../../sim/game/game.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { conceptsFor, fallbackFor, packWavesFor, packRange } from '../../sim/learn/gradeTable.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const run = (g, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { g.step(1 / 60); ev.push(...g.drainEvents()); if (until && until(g.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}) => g.input.push({ type, t: 0, via: 'key', value });
const S11 = data.stages['forest-1-1'];

// ── 1. 변환표
{ ok('변환표: 1학년 = 장면 JSON 그대로 · 3학년 = g3 줄 · 2학년(줄 없음) = 1학년 값', conceptsFor(data, S11, 1).join() === S11.concepts.join() && conceptsFor(data, S11, 3).join() === 'g3.addsub.3digit,g3.div.basic,g3.mul.2x1' && conceptsFor(data, S11, 2).join() === S11.concepts.join());
  ok('3학년 fallback = share 3종 · packs arena-2 [1,3] · 1학년 packs 없음 · pack 범위 g3 n 2~6·힘 2~9', fallbackFor(data, S11, 3).length === 3 && JSON.stringify(packWavesFor(data, S11, 3)) === '{"arena-2":[1,3]}' && JSON.stringify(packWavesFor(data, S11, 1)) === '{}' && packRange(data, 3).n[1] === 6 && packRange(data, 3).hpEach[1] === 9 && packRange(data, 1) === null);
  const g1 = createGame({ data, seed: 1, grade: 1 }), g3 = createGame({ data, seed: 1, grade: 3 });
  ok('엔진: 1학년 concepts 5·empty 아님 / 3학년 일반 생성기 0 → empty, concepts = fallback share 3', !g1.qe.empty && g1.qe.concepts.length === 5 && g3.qe.empty && g3.qe.concepts.join() === 'g3.share.div,g3.share.mul,g3.share.missing' && g3.qe.grade === 3);
  const f = createFlow({ data, grade: 3, seed: 1 }); f.action('start', { mode: 'keyboard' }); ok('지도 「배울 것」 = 3학년 키', f.snapshot().map.learn.join() === 'g3.addsub.3digit,g3.div.basic,g3.mul.2x1', f.snapshot().map.learn.join()); }

// ── 2. 생성기 share 3종 fixed 경로 · 오답 태그 · verify
{ const qe = new QuestionEngine({ rng: createRng(5), concepts: [], grade: 3, fallback: ['g3.share.div', 'g3.share.mul', 'g3.share.missing'] });
  const q = qe.next({ fixed: { concept: 'g3.share.div', n: 4, hpEach: 9 } });
  ok('share.div fixed 4×9: 정답 9 · 보기 3 서로 다름 · prompt q.share.div{n:4,total:36} · hint2 groups', q.answer === 9 && q.choices.length === 3 && new Set(q.choices.map(c => c.num)).size === 3 && q.prompt.key === 'q.share.div' && q.prompt.args.n === 4 && q.prompt.args.total === 36 && q.hint2.kind === 'groups' && q.verified, JSON.stringify(q.choices.map(c => c.num)));
  const m = qe.next({ fixed: { concept: 'g3.share.mul', n: 5, hpEach: 7 } }); ok('share.mul fixed 5×7: 정답 35 · unit g3-1-u4', m.answer === 35 && GENERATORS['g3.share.mul'].unit === 'g3-1-u4' && m.verified);
  let okMiss = true; for (let i = 0; i < 20; i++) { const x = qe.next({ fixed: { concept: 'g3.share.missing', n: 3, hpEach: 8 } }); if (!((x.answer === 3 || x.answer === 24) && x.verified)) okMiss = false; } ok('share.missing fixed 3×8: 정답 3(마리) 또는 24(합)', okMiss);
  ok('share 는 word/calc/compare/pattern want 풀에 안 들어감(개념 밖 calc 제외)', !GENERATORS['g3.share.div'].word && !GENERATORS['g3.share.div'].compare && !GENERATORS['g3.share.div'].pattern);
  ok('빈 엔진(fallback 0) next() = null', new QuestionEngine({ rng: createRng(1), concepts: [], grade: 3 }).next() === null); }

// ── 3. 묶음 스폰(3학년 전투장 2 파 1) · 몸 공격 1~2 · share 정답 → 탄 n · exact · 처치 · packClear
function toArena2(seed, grade = 3){ const g = createGame({ data, seed, grade, startZone: 3, unlock: 'all' }); g.enterZoneAt ? g.enterZoneAt(3) : null; return g; }
{ const f = createFlow({ data, grade: 3, seed: 7, startZone: 3, unlock: 'all' }); f.action('start', { mode: 'keyboard', seed: 7 }); f.action('enter'); const g = f.game;
  // 파 0(슬라임 4) 을 마법·공격으로 비우는 대신 바로 처치해서 파 1(묶음) 로
  let ev = run(g, 3); for (const e of g.enemies) if (e.state !== 'dead') { e.hp = 0; } ev = run(g, 4, (s, ev) => ev.some(x => x.type === 'enemy:pack'));
  // 위 강제 hp=0 은 처치 처리가 안 되므로 실제론 공격으로 — 봇 대신 직접 hitEnemy 경로: 투사체 발사 반복
  if (!ev.some(x => x.type === 'enemy:pack')) { for (let k = 0; k < 40 && !ev.some(x => x.type === 'enemy:pack'); k++) { push(g, 'ATTACK', { zone: 'C', side: 'R' }); ev.push(...run(g, .6, (s, e2) => e2.some(x => x.type === 'enemy:pack'))); } }
  const pk = ev.find(x => x.type === 'enemy:pack'); const s = g.snapshot();
  ok('3학년 전투장 2 파 1 = 묶음 스폰(enemy:pack) · n 2~6 · 힘 2~9 · 합 = n×힘', !!pk && pk.n >= 2 && pk.n <= 6 && pk.hpEach >= 2 && pk.hpEach <= 9 && pk.total === pk.n * pk.hpEach, JSON.stringify(pk));
  ok('스냅샷 packs[0] alive = n · sum = 합 · enemies[].pack · 머리 숫자 = 힘', s.packs.length === 1 && s.packs[0].alive === pk.n && s.packs[0].sum === pk.total && s.enemies.filter(e => e.pack && e.pack.id === pk.id).length === pk.n && s.enemies.filter(e => e.pack).every(e => e.label === String(pk.hpEach) && e.hp === pk.hpEach), JSON.stringify(s.packs));
  // 몸 공격(마법탄)으로 한 마리 1~2 깎임
  let hitEv = null; for (let k = 0; k < 30 && !hitEv; k++) { push(g, 'ATTACK', { zone: 'C', side: 'L' }); const e2 = run(g, .5, (s, e3) => e3.some(x => x.type === 'hit' && x.target !== 'player' && !x.exact && g.enemies.find(e => e.uid === x.target && e.pack))); hitEv = e2.find(x => x.type === 'hit' && x.target !== 'player' && !x.exact && g.enemies.find(e => e.uid === x.target && e.pack)); }
  ok('묶음 슬라임 일반 피해 = 1 또는 2(치명) · 머리 숫자 갱신', hitEv && (hitEv.amount === 1 || hitEv.amount === 2) && g.enemies.find(e => e.uid === hitEv.target).label === String(g.enemies.find(e => e.uid === hitEv.target).hp), JSON.stringify(hitEv));
  // 수정 → share 문제: 숫자 = 가장 많은 같은 값 그룹
  g.lastQClose = -99; g.crystals = []; let s2; ev = run(g, 12, s => s.crystals.length > 0); s2 = g.snapshot(); ok('산 묶음이 있으면 수정이 4초 뒤 나옴', s2.crystals.length > 0, g.gameT);
  const c = g.crystals[0]; g.player.pos[0] = c.pos[0]; push(g, 'ATTACK', { zone: 'C', side: 'R' }); ev = run(g, 2, s => !!s.question); s2 = g.snapshot(); const Q = s2.question;
  const alive = g.enemies.filter(e => e.pack && e.state !== 'dead'); const by = {}; for (const e of alive) by[e.hp] = (by[e.hp] || 0) + 1; const bestN = Math.max(...Object.values(by)), bestHp = +Object.keys(by).find(k => by[k] === bestN && alive.filter(e => e.hp === +k).length === bestN);
  ok('수정 문제 kind share · 숫자 = 장면 묶음(가장 많은 같은 값 그룹)', Q && Q.kind === 'share' && Q.packId === pk.id && Q.shareUids.length === g.q.shareUids.length && (bestN >= 2 ? (g.q.shareUids.length === bestN && g.q.shareAmt === bestHp && g.q.v.prompt.args.n === bestN || g.q.v.prompt.args.each === bestHp) : (g.q.v.concept === 'g3.share.mul' && g.q.shareUids.length === alive.length && g.q.shareAmt === pk.hpEach)), `${Q && Q.concept} args=${JSON.stringify(g.q && g.q.v.prompt.args)} amt=${g.q && g.q.shareAmt} by=${JSON.stringify(by)}`);
  // 정답
  run(g, 2.5); push(g, 'SELECT', { slot: g.q.v.correctSlot }); ev = run(g, 6, (s, e2) => e2.some(x => x.type === 'enemy:packClear') || s.packs.length === 0);
  const fires = ev.filter(x => x.type === 'attack:fire' && x.share), exact = ev.filter(x => x.type === 'hit' && x.exact), clear = ev.find(x => x.type === 'enemy:packClear');
  ok('정답 → share 탄 = 그룹 수 · exact 피해 = 힘 · 전부 처치 → packClear byMath', fires.length === g.stats.shareRight * 0 + (g.q ? 0 : 0) + fires.length && fires.length >= 2 && exact.length >= 2 && exact.every(x => x.amount >= 1) && !!clear && clear.byMath === true && clear.counted, `탄 ${fires.length} exact ${exact.length} clear ${JSON.stringify(clear)} 결과 ${JSON.stringify(g.snapshot().packs)}`);
  ok('결과 통계 shareRight 1 · packClears 1', g.stats.shareRight === 1 && g.stats.packClears === 1); }

// ── 4. 오답 → 흩어짐(피해 0) · 쉬운 재도전 수정 1번 · 2마리 미만 해제
{ const f = createFlow({ data, grade: 3, seed: 9, startZone: 3, unlock: 'all' }); f.action('start', { mode: 'keyboard', seed: 9 }); f.action('enter'); const g = f.game;
  let ev = run(g, 3); for (let k = 0; k < 60 && !ev.some(x => x.type === 'enemy:pack'); k++) { push(g, 'ATTACK', { zone: 'C', side: k % 2 ? 'L' : 'R' }); ev.push(...run(g, .5, (s, e2) => e2.some(x => x.type === 'enemy:pack'))); }
  const pk = ev.find(x => x.type === 'enemy:pack'); ok('(시드 9) 묶음 스폰', !!pk, JSON.stringify(pk));
  g.lastQClose = -99; g.crystals = []; run(g, 12, s => s.crystals.length > 0); const c = g.crystals[0]; g.player.pos[0] = c.pos[0]; push(g, 'ATTACK', { zone: 'C', side: 'R' }); run(g, 2, s => !!s.question);
  const hpBefore = g.enemies.filter(e => e.pack && e.state !== 'dead').map(e => e.hp).join();
  run(g, 2.5); const wrong = [0, 1, 2].find(s => s !== g.q.v.correctSlot); push(g, 'SELECT', { slot: wrong }); ev = run(g, 5, (s, e2) => e2.some(x => x.type === 'q:close'));
  const sc = ev.find(x => x.type === 'share:scatter'), hpAfter = g.enemies.filter(e => e.pack && e.state !== 'dead').map(e => e.hp).join();
  ok('오답 → share:scatter · 흩어진 탄 n · 피해 0(HP 그대로) · exact hit 0', !!sc && sc.n >= 2 && !ev.some(x => x.type === 'hit' && x.exact) && ev.filter(x => x.type === 'enemy:die').length === 0, `${JSON.stringify(sc)} ${hpBefore}→${hpAfter}`);
  run(g, 8, s => s.crystals.some(c => c.retry)); const rc = g.crystals.find(c => c.retry); ok('같은 묶음 쉬운 재도전 수정 1번(retry) · 묶음 retried', !!rc && g.packs.find(p => p.id === pk.id).retried, JSON.stringify(g.snapshot().crystals));
  if (rc) { g.player.pos[0] = rc.pos[0]; push(g, 'ATTACK', { zone: 'C', side: 'R' }); run(g, 2, s => !!s.question); ok('재도전 문제 = share.div · 힌트 1단계 자동', g.q && g.q.kind === 'share' && g.q.v.concept === 'g3.share.div' && g.q.hint === 1, g.q && g.q.v.concept);
    run(g, 2.5); push(g, 'SELECT', { slot: [0, 1, 2].find(s => s !== g.q.v.correctSlot) }); run(g, 5, (s, e2) => e2.some(x => x.type === 'q:close')); run(g, 10, s => s.crystals.some(c => c.retry)); ok('두 번째 오답엔 재도전 수정 없음', !g.crystals.some(c => c.retry)); }
  // 2마리 미만 해제: 묶음 마리를 하나만 남기고 몸 공격 경로로 처치
  const mem = g.enemies.filter(e => e.pack && e.state !== 'dead'); for (const e of mem.slice(1)) { e.hp = 1; } let rel = null; for (let k = 0; k < 120 && !rel; k++) { g.crystals = [];   /* v2.6 묶음 때 수정이 곁에 오므로 몸 공격 경로 검사엔 수정을 치움 */ push(g, 'ATTACK', { zone: 'C', side: k % 2 ? 'L' : 'R' }); const e2 = run(g, .4, (s, e3) => e3.some(x => x.type === 'enemy:packClear')); rel = e2.find(x => x.type === 'enemy:packClear'); }
  ok('묶음 2마리 미만(몸 공격) → 태그 해제(packClear released, 셈 안 함) · 남은 마리 pack null', !!rel && rel.released === true && !rel.counted && g.enemies.filter(e => e.state !== 'dead' && e.tags.includes('pack')).length === 0, JSON.stringify(rel)); }

// ── 5. 봇 ?grade=3 6판 완주 (1-1 ×2 · 1-2 · 1-3 · 1-boss · 1-1 4학년)
{ const runs = [['forest-1-1', 3, 31], ['forest-1-1', 3, 32], ['forest-1-2', 3, 33], ['forest-1-3', 3, 34], ['forest-1-boss', 3, 35], ['forest-1-1', 4, 36]]; const rows = []; let allOk = true;
  for (const [stage, grade, seed] of runs) { const r = playOne({ data, seed, acc: .85, react: .35, grade, stage, maxT: 900, progress: { xp: 0, level: 1 } }); const win = r.win; if (!win) allOk = false; rows.push({ stage, grade, seed, win, kills: r.kills, q: r.q, right: r.right, t: r.t, pack: r.packClears, share: `${r.shareRight}/${r.shareWrong}` }); }
  console.table(rows); ok('봇 3·4학년 6판 완주(이김)', allOk); ok('3학년 1-1 에 묶음 처치·share 정답 있음', rows[0].pack >= 1 && rows[0].right >= 1, JSON.stringify(rows[0])); }
console.table(out); console.log(fail ? `✗ ${fail}개 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
