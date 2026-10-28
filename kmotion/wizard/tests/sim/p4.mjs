// v1.6 1-2 「버섯 마을 길」(09 문서 4-2) — 화면 없이 sim/ 만으로(node tests/sim/p4.mjs)
// 스테이지 고르기·잠김·보상(ICE STORM)·깬 기록 → 고블린 방패병(정면 방패·옆·회복 중·마법·수학으로 깨기) → 버섯 점 더하기 퍼즐 → 버섯 튕김 발판 → 빈칸 식 생성기 → 봇 완주
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
import { createRng } from '../../sim/core/rng.js';
import { makePuzzle, verifyPuzzle } from '../../sim/learn/puzzles.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { GAME } from '../../sim/game/config.js';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: note }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}, via = 'key') => g.input.push({ type, t: 0, via, value });
const S2 = 'forest-1-2';
// 시험용 데이터: 전투장 1 첫 파를 방패병 1마리만으로(방패 검사)
const withShield = () => { const d = JSON.parse(JSON.stringify(data)); const z = d.stages[S2].zones.find(z => z.id === 'arena-1'); z.waves = [{ at: .5, spawn: [{ kind: 'shield-goblin', x: 0, z: 6.0 }] }]; return d; };
const flowAt = (d, zone, seed = 11, extra = {}) => { const f = createFlow(Object.assign({ data: d, grade: 1, seed, stage: S2, forceStage: true, startZone: zone }, extra)); f.action('start', { mode: 'keyboard' }); f.action('enter'); return f; };

// ── 1. 생성기: 빈칸 식 「□+b=c」 + fixed · 버섯 점 더하기 퍼즐
{ const rng = createRng(5); let bad = 0; for (let i = 0; i < 3000; i++) { const q = GENERATORS['g1.missing.add9'].gen(rng, rng.next()); if (!GENERATORS['g1.missing.add9'].verify(q) || q.answer !== q.c - q.b || q.c > 9 || q.answer < 1) bad++; }
  ok('빈칸 식 생성기 3000 검산', bad === 0, `오류 ${bad}`);
  const qe = new QuestionEngine({ rng: createRng(9), concepts: ['g1.add.expr9'] }); const q = qe.next({ fixed: { concept: 'g1.missing.add9', b: 4, c: 7 } });
  ok('fixed 문제 = 「□+4=7」 정답 3 · 보기 3개 중 정답 자리 1', q.answer === 3 && q.prompt.args.b === 4 && q.prompt.args.c === 7 && q.choices.filter(c => c.num === 3).length === 1 && q.verified, `${q.prompt.key} ${JSON.stringify(q.choices.map(c => c.num))}`);
  ok('오개념 「=」 답 쓰기(7 고름) 오답 태그 equals-answer', q.choices.some(c => c.num === 7 && c.tag === 'equals-answer') || !q.choices.some(c => c.num === 7), JSON.stringify(q.choices.map(c => c.tag)));
  let pb = 0, n = 0; for (let g = 1; g <= 6; g++) for (let i = 0; i < 300; i++) { n++; const p = makePuzzle('mushroom-add', rng, g); if (!verifyPuzzle(p) || p.mush.a + p.mush.b !== p.target || p.target > 9 || p.stones.length !== 3 || p.need !== 1) pb++; }
  ok('버섯 점 더하기 생성기 6학년×300 검산', pb === 0, `${n}개 중 오류 ${pb}`); }

// ── 2. 스테이지 목록·잠김·?stage 강제
{ const f = createFlow({ data, grade: 1, seed: 1 }); const t = f.snapshot().title;
  ok('시작 화면 스테이지 2개 이상(1-1 열림 · 1-2 잠김)', t.stages.length >= 2 && t.stages[0].id === 'forest-1-1' && !t.stages[0].locked && t.stages[1].id === S2 && t.stages[1].locked && t.stages[1].reward === 'ice', JSON.stringify(t.stages.map(s => [s.id, s.locked])));
  f.action('start', { mode: 'keyboard', stage: S2 }); f.action('enter'); ok('잠긴 스테이지를 고르면 1-1 로 시작', f.game.stageId === 'forest-1-1', f.game.stageId);
  const f2 = createFlow({ data, grade: 1, seed: 1, progress: { xp: 0, level: 1, cleared: { 'forest-1-1': 2 }, unlocked: ['shield'] } }); const t2 = f2.snapshot().title;
  ok('1-1 깬 기록이 있으면 1-2 열림 · 별 2', !t2.stages[1].locked && t2.stages[0].stars === 2, JSON.stringify(t2.stages));
  f2.action('start', { mode: 'keyboard', stage: S2 }); f2.action('enter'); ok('1-2 시작 · 이름 「버섯 마을 길」 · 방패 마법 해금 유지', f2.game.stageId === S2 && f2.game.snapshot().world.stageName === '버섯 마을 길' && f2.game.unlocked.has('shield'), f2.game.snapshot().world.stageName);
  const f3 = createFlow({ data, grade: 1, seed: 1, stage: S2, forceStage: true }); f3.action('start', { mode: 'keyboard' }); f3.action('enter'); ok('?stage= 강제 = 잠김 무시', f3.game.stageId === S2);
  const z = f3.game.snapshot().world; ok('1-2 구역 6개(길·전투장 교대, 보스 없음) · 전투장 3', data.stages[S2].zones.length === 6 && z.arenas === 3 && !data.stages[S2].zones.some(x => x.type === 'boss'), `arenas ${z.arenas}`); }

// ── 3. 길 A: 버섯 발판 배치 · 밟으면 폴짝(피해 0 · 마나 +2 · 공중 무적)
{ const f = flowAt(data, 0, 21); const g = f.game; const ms = g.rail.obstacles.filter(o => o.kind === 'mushroom'); ok('길 A 버섯 발판 4', ms.length === 4, String(ms.length));
  const m = ms.sort((a, b) => a.d - b.d)[0]; push(g, 'MOVE', { u: m.x / GAME.rail.xMax }); const hp0 = g.player.hp, mp0 = g.player.mana; const ev = run(f, 60, (s, e) => e.some(x => x.type === 'bounce'));
  const b = ev.find(e => e.type === 'bounce'); ok('버섯을 밟으면 bounce 이벤트 · 피해 0 · 마나 +2', !!b && g.player.hp === hp0 && g.player.mana >= mp0 + 2 - 1e-9 && b.n === 1, `hp ${hp0}→${g.player.hp} 마나 ${mp0}→${g.player.mana}`);
  ok('밟은 순간 hopping · 무적', g.snapshot().player.hopping && g.gameT < g.player.invulnUntil); run(f, .7); ok('.5초 뒤 내려옴', !g.snapshot().player.hopping);
  const s = g.snapshot(); ok('스냅샷 obstacles 에 mushroom kind · 상태 bounced', s.obstacles.some(o => o.kind === 'mushroom') && g.rail.obstacles.find(o => o.uid === b.uid).state === 'bounced'); }

// ── 4. 방패병: 등장·방패 스냅샷·정면 마법탄은 방패가 받음(몸 0) → 4발이면 깨짐 → 몸
{ const f = flowAt(withShield(), 1, 3); const g = f.game; run(f, 2); const e = g.enemies.find(x => x.kind === 'shield-goblin'); ok('전투장 1 방패병 등장 · 첫 토스트', !!e && g.toast && g.toast.key === 'toast.shieldGoblin', g.toast && g.toast.key);
  const sn = g.snapshot().enemies.find(x => x.kind === 'shield-goblin'); ok('스냅샷 shield {hp 28, up, eq 「□ + b = c」}', sn && sn.shield && sn.shield.hpMax === 28 && sn.shield.up && /^□ \+ \d = \d$/.test(sn.shield.eq), sn && JSON.stringify(sn.shield));
  run(f, 6, s => s.enemies[0] && s.enemies[0].state === 'chase' && s.enemies[0].pos[2] < 3); const hp0 = e.hp; let shots = 0, bodyHit = 0, shieldHits = 0, broke = null;
  for (let i = 0; i < 12 && !broke; i++) { push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); shots++; const ev = run(f, 1.0, (s, ev) => ev.some(x => x.type === 'enemy:shieldBreak' || x.type === 'hit' && x.target === e.uid)); shieldHits += ev.filter(x => x.type === 'enemy:shieldHit').length; bodyHit += ev.filter(x => x.type === 'hit' && x.target === e.uid && !x.shielded).length; broke = ev.find(x => x.type === 'enemy:shieldBreak') || null; if (e.state === 'recover') run(f, 1.1); }
  ok('정면 마법탄은 방패가 받음(몸 피해 0) · 3발(치명타면 2)이면 방패 깨짐(byMath 0)', e.hp === hp0 && shieldHits >= 2 && shieldHits <= 3 && !!broke && !broke.byMath && e.shield.broken, `방패 ${shieldHits}발 몸 ${bodyHit} hp ${hp0}→${e.hp}`);
  ok('깨지면 비틀(hurt .6초) · 스냅샷 broken', e.state === 'hurt' && g.snapshot().enemies[0].shield.broken && !g.snapshot().enemies[0].shield.up);
  run(f, 1); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, .8, (s, ev) => ev.some(x => x.type === 'hit' && x.target === e.uid)); ok('깨진 뒤엔 몸에 들어감', e.hp < hp0, `hp ${hp0}→${e.hp}`); }

// ── 5. 방패병: 공격 뒤 회복(recover) 동안 방패를 내림 → 정면도 몸 · 마법(불꽃탄)은 방패를 지나 몸에
{ const f = flowAt(withShield(), 1, 3, { unlock: 'all' }); const g = f.game; g.player.invulnUntil = 999; run(f, 12, s => s.enemies[0] && s.enemies[0].state === 'recover'); run(f, 1 / 60); const e = g.enemies[0];
  ok('회복 중 방패 up=false', e.state === 'recover' && !e.shield.up && !e.shield.broken, e.state);
  const hp0 = e.hp; push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, .6, (s, ev) => ev.some(x => x.type === 'hit' && x.target === e.uid)); ok('회복 중 정면 마법탄 = 몸 피해', e.hp < hp0 && e.shield.hp === 28, `hp ${hp0}→${e.hp} 방패 ${e.shield.hp}`);
  run(f, 3, s => s.enemies[0].state === 'chase'); run(f, 1 / 60); ok('다시 쫓으면 방패 올림', e.shield.up, e.state);
  const f2 = flowAt(withShield(), 1, 3, { unlock: 'all' }); const g2 = f2.game; run(f2, 6, s => s.enemies[0] && s.enemies[0].state === 'chase' && s.enemies[0].pos[2] < 3); const e2 = g2.enemies[0]; const h0 = e2.hp; g2.player.mana = 100;
  push(g2, 'CHARGE', { p: 0, start: true }); run(f2, .6); push(g2, 'CAST', { aim: 'auto' }); run(f2, 2, (s, ev) => ev.some(x => x.type === 'spell:impact'));
  ok('불꽃탄은 방패를 지나 몸에(spellBypass)', e2.hp < h0 && e2.shield.hp === 28 && !e2.shield.broken, `hp ${h0}→${e2.hp} 방패 ${e2.shield.hp}`); }

// ── 6. 방패병 + 수학 수정: 문제 = 방패의 빈칸 식 · 정답 → 방패 깨짐(byMath) · 오답 → 그대로
{ const f = flowAt(withShield(), 1, 3); const g = f.game; run(f, 4, s => s.crystals.length > 0); const e = g.enemies[0]; ok('방패병이 있는 전투장에 수정 등장', g.crystals.length > 0 && e && !e.shield.broken);
  const c = g.crystals[0]; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 3, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, 2, s => s.screen === 'S08Q');
  const q = g.snapshot().question; ok('문제 kind shield · 식 = 방패의 식 · shieldUid', q && q.kind === 'shield' && q.prompt.key === 'q.missing' && `□ + ${q.prompt.args.b} = ${q.prompt.args.c}` === g.snapshot().enemies[0].shield.eq && q.shieldUid === e.uid, q && `${q.kind} ${JSON.stringify(q.prompt.args)}`);
  run(f, 2.5); const wrong = (g.q.v.correctSlot + 1) % 3; push(g, 'SELECT', { slot: wrong }); run(f, 4, s => s.screen === 'S08'); ok('오답 → 방패 그대로', !e.shield.broken && e.shield.hp === 28);
  run(f, 20, s => s.crystals.length > 0); const c2 = g.crystals[0]; ok('다시 수정', !!c2); push(g, 'MOVE', { u: c2.pos[0] / 4 }); run(f, 3, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R', power: 1 }); run(f, 2, s => s.screen === 'S08Q');
  ok('재도전 문제도 방패 식(쉬운 재도전 예약보다 방패가 우선)', g.q && g.q.kind === 'shield', g.q && g.q.kind); run(f, 2.5); push(g, 'SELECT', { slot: g.q.v.correctSlot }); const ev = run(f, 4, s => s.screen === 'S08');
  const br = ev.find(x => x.type === 'enemy:shieldBreak'); ok('정답 → 방패 깨짐(byMath) · 토스트', !!br && br.byMath && e.shield.broken && e.shield.byMath && ev.some(x => x.type === 'q:right'), g.toast && g.toast.key);
  ok('기록 log 에 missing 개념', g.stats.log.some(l => l.concept === 'g1.missing.add9'));
  ok('결과 통계 shields 1', g.stats.shields === 1); }

// ── 7. 길 B 버섯 점 더하기 퍼즐: 멈춤 → 돌(문) 3개 중 1 · 정답 마나 +20 · 오답 다시+힌트 · mush 스냅샷
{ const f = flowAt(data, 2, 4); const g = f.game; const ev = run(f, 120, s => s.screen === 'S08P'); ok('길 B 퍼즐 자리에서 멈추고 S08P', g.screen === 'S08P' && g.puzzle && g.puzzle.cur.type === 'mushroom-add', g.puzzle && g.puzzle.cur.type);
  const pz = g.snapshot().puzzle; ok('스냅샷 mush {a,b} · 돌 3 · need 1 · prompt pz.mush', pz.mush && pz.mush.a >= 1 && pz.stones.length === 3 && pz.need === 1 && pz.prompt.key === 'pz.mush', JSON.stringify(pz.mush));
  ok('targets kind puzzle 3개(choices3 rect)', g.snapshot().targets.filter(t => t.kind === 'puzzle').length === 3);
  const ans = g.puzzle.cur.answer[0]; const mp0 = g.player.mana; push(g, 'SELECT', { slot: (ans + 1) % 3 }); run(f, .2); ok('오답 → wrong · 힌트 1', g.puzzle.state === 'wrong' && g.puzzle.hint === 1 && g.puzzle.wrong === 1);
  run(f, 2, s => s.puzzle && s.puzzle.state === 'open'); ok('다른 수로 다시(mushroom-add 유지)', g.puzzle.state === 'open' && g.puzzle.cur.type === 'mushroom-add' && g.snapshot().puzzle.hint && g.snapshot().puzzle.hint.key === 'pz.mush.hint');
  push(g, 'SELECT', { slot: g.puzzle.cur.answer[0] }); const ev2 = run(f, .2); ok('정답 → right · 마나 +20', g.puzzle.state === 'right' && ev2.some(x => x.type === 'puzzle:right') && g.player.mana >= Math.min(100, mp0 + 20) - 1e-9, `마나 ${mp0}→${g.player.mana}`);
  run(f, 3, s => s.screen === 'S08'); ok('길 다시 출발 · 기록 puzzle:mushroom-add', g.screen === 'S08' && g.rail.phase === 'go' && g.stats.log.some(l => l.type === 'puzzle:mushroom-add' && l.correct)); }

// ── 8. 길 C 크기 문 · 전투장 3 · 끝 → 클리어(보스 없음) · 보상 ICE STORM · progress cleared
{ const prog = { xp: 0, level: 1, cleared: { 'forest-1-1': 3 }, unlocked: ['shield'] }; const r = playOne({ data, seed: 77, acc: .9, react: .3, stage: S2, progress: prog });
  ok('봇 1-2 완주(전투장 3 뒤 보스 없이 클리어)', r.win && r.zone === 5, `zone ${r.zone} t ${r.t}`);
  ok('퍼즐 2(버섯 문·크기 문)', r.puzzles === 2, `${r.pzRight}/${r.puzzles}`);
  ok('보상 ICE STORM · progress.unlocked 에 ice · cleared[1-2] 별 수', r.reward === 'ice' && prog.unlocked.includes('ice') && prog.cleared[S2] >= 1, JSON.stringify({ r: r.reward, u: prog.unlocked, c: prog.cleared }));
  const f = createFlow({ data, grade: 1, seed: 2, progress: prog }); f.action('start', { mode: 'keyboard', stage: S2 }); f.action('enter'); ok('다음 판: 얼음 폭풍 장착 가능', f.game.spellList().includes('ice') && f.game.setSpell('ice'), f.game.spellList().join());
  const f2 = createFlow({ data, grade: 1, seed: 2, progress: prog }); f2.action('start', { mode: 'keyboard', stage: S2 }); f2.action('enter'); const r2 = playOne({ data, seed: 78, acc: .9, react: .3, stage: S2, progress: prog }); ok('두 번째 클리어 = 보상 다시 안 줌', r2.win && r2.reward === null && prog.unlocked.filter(x => x === 'ice').length === 1); }

// ── 9. 봇 6판: 전부 완주 · 문제 수 10~13(수정 + 퍼즐 2) · 방패 깸 · 발판
{ const rs = []; for (let i = 0; i < 6; i++) rs.push(playOne({ data, seed: 500 + i, acc: .75, react: .4, stage: S2 }));
  const qn = rs.map(r => r.q + r.puzzles); ok('봇 6판 전부 완주', rs.every(r => r.win), rs.map(r => r.zone).join());
  ok('문제 수(수정+퍼즐) 8~14 (09 문서 「10~12」 근처)', qn.every(n => n >= 8 && n <= 14), qn.join());
  ok('방패 깬 횟수 ≥ 2/판 평균', rs.reduce((a, r) => a + r.shields, 0) / rs.length >= 2, rs.map(r => r.shields).join());
  ok('문제 시간 비율 15~40%', rs.every(r => r.qShare >= 15 && r.qShare <= 40), rs.map(r => r.qShare + '%').join()); }

// ── 10. 1-1 은 그대로(회귀): 봇 완주 · 보스 뒤 shield 보상 → cleared 기록
{ const prog = { xp: 0, level: 1 }; const r = playOne({ data, seed: 1001, acc: .9, react: .3, progress: prog }); ok('1-1 회귀: 완주 · cleared[1-1] · unlocked shield', r.win && prog.cleared['forest-1-1'] >= 1 && prog.unlocked.includes('shield') && r.reward === 'shield', JSON.stringify({ c: prog.cleared, u: prog.unlocked, r: r.reward })); }

console.table(out); if (fail) { console.log(`✗ ${fail}개 실패`); process.exit(1); } console.log('전부 통과');
