// v1.7 1-3 「반딧불 동굴」(09 문서 4-2) — 화면 없이 sim/ 만으로(node tests/sim/p5.mjs)
// 잠김(1-2 뒤)·보상 LIGHTNING → 어두운 길(지팡이 빛 15m, 반딧불은 늘 보임) → 수정 묶음 세기 퍼즐 → 수정 골렘(DEF 10, 안 갈라지면 마법탄 ×.4, 수학 정답마다 DEF −8 최대 −16) → 규칙 징검다리 → 봇 완주
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
import { createRng } from '../../sim/core/rng.js';
import { makePuzzle, verifyPuzzle } from '../../sim/learn/puzzles.js';
import { GAME } from '../../sim/game/config.js';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: note }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}) => g.input.push({ type, t: 0, via: 'key', value });
const S3 = 'forest-1-3';
const withGolem = () => { const d = JSON.parse(JSON.stringify(data)); const z = d.stages[S3].zones.find(z => z.id === 'arena-1'); z.waves = [{ at: .5, spawn: [{ kind: 'crystal-golem', x: 0, z: 6.0 }] }]; return d; };
const flowAt = (d, zone, seed = 11, extra = {}) => { const f = createFlow(Object.assign({ data: d, grade: 1, seed, stage: S3, forceStage: true, startZone: zone }, extra)); f.action('start', { mode: 'keyboard' }); return f; };
const openQ = (f, g) => { run(f, 12, s => s.crystals.length > 0); const c = g.crystals[0]; if (!c) return null; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 3, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, 2, s => s.screen === 'S08Q'); return g.q; };

// ── 1. 수정 묶음 세기 생성기(6학년 × 400) · 1학년 범위 10~49 · 오답에 자리 바꿈
{ const rng = createRng(3); let bad = 0, n = 0, swap = 0, g1max = 0, g1min = 99;
  for (let gr = 1; gr <= 6; gr++) for (let i = 0; i < 400; i++) { n++; const p = makePuzzle('crystal-count', rng, gr); const b = p.bundle;
    if (!verifyPuzzle(p) || p.stones.length !== 3 || p.need !== 1 || new Set(p.stones.map(s => s.num)).size !== 3 || p.stones.some(s => s.num <= 0)) bad++;
    if (gr === 1) { g1max = Math.max(g1max, p.target); g1min = Math.min(g1min, p.target); if (b.hund) bad++; }
    if (gr >= 3 && !b.hund) bad++;
    if (b.ones && b.ones !== b.tens && p.stones.some(s => s.num === b.hund * 100 + b.ones * 10 + b.tens)) swap++; }
  ok('수정 묶음 세기 생성기 6학년×400 검산', bad === 0, `${n}개 중 오류 ${bad}`);
  ok('1학년 범위 11~49(50까지의 수)', g1min >= 11 && g1max <= 49, `${g1min}~${g1max}`);
  ok('오답에 「자리 바꿈」 오개념이 자주 섞임', swap > n * .2, `${swap}/${n}`); }

// ── 2. 스테이지 목록: 1-3 은 1-2 뒤 · 보상 lightning · 3단계 순서
{ const f = createFlow({ data, grade: 1, seed: 1, progress: { xp: 0, level: 1, cleared: { 'forest-1-1': 3 } } }); const t = f.snapshot().title;
  ok('시작 화면 스테이지 3개 · 1-3 잠김(1-2 안 깸) · 보상 lightning', t.stages.length === 3 && t.stages[2].id === S3 && t.stages[2].locked && t.stages[2].requires === 'forest-1-2' && t.stages[2].reward === 'lightning', JSON.stringify(t.stages.map(s => [s.id, s.locked])));
  const f2 = createFlow({ data, grade: 1, seed: 1, progress: { xp: 0, level: 2, cleared: { 'forest-1-1': 3, 'forest-1-2': 2 }, unlocked: ['shield', 'ice'] } }); const t2 = f2.snapshot().title;
  ok('1-2 깬 기록이 있으면 1-3 열림', !t2.stages[2].locked); f2.action('start', { mode: 'keyboard', stage: S3 });
  ok('1-3 시작 · 이름 「반딧불 동굴」 · 얼음 장착 가능', f2.game.stageId === S3 && f2.game.snapshot().world.stageName === '반딧불 동굴' && f2.game.spellList().includes('ice'));
  ok('1-3 구역 6개 · 전투장 3 · 보스 없음', data.stages[S3].zones.length === 6 && f2.game.snapshot().world.arenas === 3 && !data.stages[S3].zones.some(z => z.type === 'boss')); }

// ── 3. 어두운 길: world.dark · rail.dark/light · 15m 밖 물건 lit false · 반딧불은 늘 lit · 길 C 는 밝음
{ const f = flowAt(data, 0, 21); const g = f.game; run(f, .1); const s = g.snapshot();
  ok('길 A world.dark · light 15', s.world.dark && s.world.light === GAME.rail.dark.light && s.world.rail.dark && s.world.rail.light === 15, JSON.stringify({ d: s.world.dark, l: s.world.light }));
  const far = s.obstacles.filter(o => o.pos[2] > 15 && o.kind !== 'firefly'), near = s.obstacles.filter(o => o.pos[2] <= 15);
  ok('15m 밖 바위·가지·상자 = lit false', far.length > 0 && far.every(o => !o.lit), `먼 물건 ${far.length}`);
  run(f, 6); const s1 = f.game.snapshot(); const near1 = s1.obstacles.filter(o => o.pos[2] <= 15 && o.pos[2] > -8 && o.state === 'ahead');
  ok('15m 안 = lit true · 반딧불은 멀어도 lit', near1.length > 0 && near1.every(o => o.lit) && s.obstacles.filter(o => o.kind === 'firefly').every(o => o.lit), `가까운 ${near1.length}`);
  const fa = g.rail.obstacles.filter(o => o.kind === 'firefly').length; ok('길 A 반딧불 7 · 바위 4 · 가지 2 · 상자 1', fa === 7 && g.rail.obstacles.filter(o => o.kind === 'rock').length === 4 && g.rail.obstacles.filter(o => o.kind === 'branch').length === 2 && g.rail.obstacles.filter(o => o.kind === 'chest').length === 1);
  const f2 = flowAt(data, 4, 21); run(f2, .1); const s2 = f2.game.snapshot(); ok('길 C(규칙 징검다리)는 밝음(동굴 밖)', !s2.world.dark && !s2.world.rail.dark && s2.obstacles.every(o => o.lit));
  const f3 = flowAt(data, 3, 21); run(f3, .1); ok('전투장 2(골렘 방)는 어두움 · rail null', f3.game.snapshot().world.dark && !f3.game.rail); }

// ── 4. 길 B 수정 묶음 세기 퍼즐: 멈춤 → bundle 스냅샷 · 오답 → 다시+힌트 pz.count.hint · 정답 → 기록
{ const f = flowAt(data, 2, 4); const g = f.game; run(f, 120, s => s.screen === 'S08P'); ok('길 B 에서 멈추고 S08P crystal-count', g.screen === 'S08P' && g.puzzle && g.puzzle.cur.type === 'crystal-count', g.puzzle && g.puzzle.cur.type);
  const pz = g.snapshot().puzzle; ok('스냅샷 bundle {hund 0, tens, ones} · prompt pz.count · 돌 3', pz.bundle && pz.bundle.hund === 0 && pz.bundle.tens >= 1 && pz.prompt.key === 'pz.count' && pz.stones.length === 3, JSON.stringify(pz.bundle));
  const ans = g.puzzle.cur.answer[0]; push(g, 'SELECT', { slot: (ans + 1) % 3 }); run(f, .2); ok('오답 → wrong · 힌트 1', g.puzzle.state === 'wrong' && g.puzzle.hint === 1);
  run(f, 2, s => s.puzzle && s.puzzle.state === 'open'); const pz2 = g.snapshot().puzzle; ok('다른 수로 다시 · 힌트 pz.count.hint {tt = 묶음×10}', pz2.hint && pz2.hint.key === 'pz.count.hint' && pz2.hint.args.tt === pz2.bundle.tens * 10, JSON.stringify(pz2.hint));
  push(g, 'SELECT', { slot: g.puzzle.cur.answer[0] }); run(f, 3, s => s.screen === 'S08'); ok('정답 → 길 다시 출발 · 기록 puzzle:crystal-count · 개념 g1.count.tens', g.screen === 'S08' && g.stats.log.some(l => l.type === 'puzzle:crystal-count' && l.correct && l.concept === 'g1.count.tens')); }

// ── 5. 수정 골렘: 등장 토스트 · 스냅샷 crack · 안 갈라진 몸엔 마법탄 ×.4(deflect)
{ const f = flowAt(withGolem(), 1, 3); const g = f.game; run(f, 2); const e = g.enemies.find(x => x.kind === 'crystal-golem');
  ok('골렘 등장 · 첫 토스트 toast.golem', !!e && g.toast && g.toast.key === 'toast.golem', g.toast && g.toast.key);
  const sn = g.snapshot().enemies.find(x => x.kind === 'crystal-golem'); ok('스냅샷 crack {down 0, max 16, def 10}', sn && sn.crack && sn.crack.down === 0 && sn.crack.max === 16 && sn.crack.def === 10 && sn.hpMax === 120, sn && JSON.stringify(sn.crack));
  run(f, 6, s => s.enemies[0] && s.enemies[0].state === 'chase' && s.enemies[0].pos[2] < 3.5); const hp0 = e.hp; push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); const ev = run(f, 1, (s, ev) => ev.some(x => x.type === 'hit' && x.target === e.uid));
  const h = ev.find(x => x.type === 'hit' && x.target === e.uid); ok('안 갈라진 몸 = 「팅」 deflect · 피해 작음(≤ 4)', h && h.deflect && h.amount <= 4 && e.hp === hp0 - h.amount, h && `${h.amount} deflect ${h.deflect}`); }

// ── 6. 골렘 + 수학 수정: 문제 kind golem · 오답 = 그대로 · 정답 = DEF −8 · 두 번 = −16 · 그 뒤 수정 문제는 보통(crystal)
{ const f = flowAt(withGolem(), 1, 3); const g = f.game; g.player.invulnUntil = 1e9; const e = () => g.enemies.find(x => x.kind === 'crystal-golem');
  let q = openQ(f, g); ok('골렘 전투장 수정 → 문제 kind golem · golemUid', q && q.kind === 'golem' && q.golemUid === e().uid && g.snapshot().question.golemUid === e().uid, q && q.kind);
  run(f, 2.5); push(g, 'SELECT', { slot: (g.q.v.correctSlot + 1) % 3 }); run(f, 4, s => s.screen === 'S08'); ok('오답 → 골렘 그대로(down 0)', e().crack.down === 0);
  q = openQ(f, g); ok('5초 뒤 수정이 또 나옴(골렘이 덜 갈라짐)', q && q.kind === 'golem', q && q.kind); run(f, 2.5); push(g, 'SELECT', { slot: g.q.v.correctSlot }); const ev = run(f, 4, s => s.screen === 'S08');
  const ck = ev.find(x => x.type === 'enemy:crack'); ok('정답 → enemy:crack down 8 · def 2 · 토스트 golemCrack', ck && ck.down === 8 && ck.def === 2 && e().crack.down === 8 && g.snapshot().enemies[0].crack.ratio === .5, ck && JSON.stringify({ d: ck.down, def: ck.def }));
  const hp0 = e().hp; run(f, .8); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); const ev2 = run(f, 1.2, (s, ev) => ev.some(x => x.type === 'hit' && x.target === e().uid)); const h = ev2.find(x => x.type === 'hit' && x.target === e().uid);
  ok('갈라진 뒤 마법탄 = 튕김 없음 · 피해 ≥ 8', h && !h.deflect && h.amount >= 8, h && String(h.amount));
  q = openQ(f, g); run(f, 2.5); push(g, 'SELECT', { slot: g.q.v.correctSlot }); const ev3 = run(f, 4, s => s.screen === 'S08'); const ck2 = ev3.find(x => x.type === 'enemy:crack');
  ok('두 번째 정답 → down 16(최대) · def −6 · 토스트 golemOpen', ck2 && ck2.down === 16 && ck2.def === -6 && ev3.length && g.stats.cracks === 2, ck2 && JSON.stringify({ d: ck2.down, def: ck2.def }));
  q = openQ(f, g); ok('다 갈라진 뒤 수정 문제 = 보통(crystal)', !q || q.kind === 'crystal', q && q.kind); }

// ── 7. 방패병과 골렘이 같이 있으면 방패 식이 먼저(방패 > 골렘)
{ const d = JSON.parse(JSON.stringify(data)); d.stages[S3].zones.find(z => z.id === 'arena-1').waves = [{ at: .5, spawn: [{ kind: 'crystal-golem', x: -1, z: 6 }, { kind: 'shield-goblin', x: 1.5, z: 6 }] }];
  const f = flowAt(d, 1, 5); const g = f.game; g.player.invulnUntil = 1e9; const q = openQ(f, g); ok('방패병 + 골렘 → 수정 문제 = 방패 식', q && q.kind === 'shield', q && q.kind); }

// ── 8. 봇 완주 · 보상 LIGHTNING · progress · 두 번째 클리어 보상 없음
{ const prog = { xp: 0, level: 2, cleared: { 'forest-1-1': 3, 'forest-1-2': 3 }, unlocked: ['shield', 'ice'] }; const r = playOne({ data, seed: 91, acc: .9, react: .3, stage: S3, progress: prog });
  ok('봇 1-3 완주(전투장 3 뒤 클리어)', r.win && r.zone === 5, `zone ${r.zone} t ${r.t}`); ok('퍼즐 2(수정 묶음·규칙 징검다리)', r.puzzles === 2, `${r.pzRight}/${r.puzzles}`);
  ok('보상 LIGHTNING · unlocked · cleared[1-3]', r.reward === 'lightning' && prog.unlocked.includes('lightning') && prog.cleared[S3] >= 1, JSON.stringify({ r: r.reward, u: prog.unlocked }));
  const f = createFlow({ data, grade: 1, seed: 2, progress: prog }); f.action('start', { mode: 'keyboard', stage: S3 }); ok('다음 판: 번개 사슬 장착 가능', f.game.spellList().includes('lightning') && f.game.setSpell('lightning'));
  const r2 = playOne({ data, seed: 92, acc: .9, react: .3, stage: S3, progress: prog }); ok('두 번째 클리어 = 보상 다시 안 줌', r2.win && r2.reward === null && prog.unlocked.filter(x => x === 'lightning').length === 1); }

// ── 9. 봇 6판: 완주 · 문제 수 8~14 · 골렘 깨기 ≥ 1.5/판 · 반딧불 별 조건(10) 달성 가능 · 문제 시간 비율
{ const rs = []; for (let i = 0; i < 6; i++) rs.push(playOne({ data, seed: 600 + i, acc: .75, react: .4, stage: S3 }));
  ok('봇 6판 전부 완주', rs.every(r => r.win), rs.map(r => r.zone).join()); const qn = rs.map(r => r.q + r.puzzles); ok('문제 수(수정+퍼즐) 8~14', qn.every(n => n >= 8 && n <= 14), qn.join());
  const cr = rs.map(r => r.cracks); ok('골렘 깨기 평균 ≥ 1.5/판', cr.reduce((a, b) => a + b, 0) / cr.length >= 1.5, cr.join());
  ok('반딧불 10↑(별 조건) 봇 전부 달성', rs.every(r => r.fireflies >= 10), rs.map(r => r.fireflies).join());
  ok('문제 시간 비율 15~40%', rs.every(r => r.qShare >= 15 && r.qShare <= 40), rs.map(r => r.qShare + '%').join()); }

// ── 10. 회귀: 1-1·1-2 봇 완주
{ const r1 = playOne({ data, seed: 1001, acc: .9, react: .3 }), r2 = playOne({ data, seed: 501, acc: .9, react: .3, stage: 'forest-1-2' }); ok('1-1·1-2 회귀 완주', r1.win && r2.win, `${r1.zone} ${r2.zone}`); }

console.table(out); if (fail) { console.log(`✗ ${fail}개 실패`); process.exit(1); } console.log('전부 통과');
