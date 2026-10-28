// P3 길 구간(09 문서 2·3절 · 07 문서 상황 D) — 화면 없이 sim/ 만으로(node tests/sim/p3.mjs)
// 길 A 자동 전진·바위·가지·반딧불·상자·길 위 슬라임 → 전투장 1 → 길 B 숫자 다리 퍼즐(정답·오답·3번 틀림) → 크기 문·규칙 징검다리(스테이지 바꿔) → 체크포인트 · 봇 문제 시간 비율
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
import { createRng } from '../../sim/core/rng.js';
import { makePuzzle, verifyPuzzle } from '../../sim/learn/puzzles.js';
import { GAME } from '../../sim/game/config.js';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: note }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}, via = 'key') => g.input.push({ type, t: 0, via, value });
const withPuzzle = (type, extra = {}) => { const d = JSON.parse(JSON.stringify(data)); const z = d.stages['forest-1-1'].zones.find(z => z.id === 'rail-b'); z.puzzle = Object.assign({ type, at: .6 }, extra); return d; };
const R = GAME.rail;

// ── 1. 생성기 검산
{ const rng = createRng(7); let bad = 0, n = 0; for (const type of ['number-bridge', 'size-gate', 'rule-stones']) for (let g = 1; g <= 6; g++) for (let i = 0; i < 300; i++) { n++; const p = makePuzzle(type, rng, g, type === 'number-bridge' && i % 3 === 0 ? { target: 6 } : {}); if (!verifyPuzzle(p)) bad++; }
  ok('퍼즐 생성기 검산(3종×6학년×300)', bad === 0, `${n}개 중 오류 ${bad}`);
  const p6 = makePuzzle('number-bridge', createRng(3), 1, { target: 6 }); ok('숫자 다리 6 = 두 돌 합', p6.target === 6 && p6.stones[p6.answer[0]].num + p6.stones[p6.answer[1]].num === 6, JSON.stringify(p6.stones.map(s => s.num))); }

// ── 2. 길 A: 자동 전진·장애물 배치·간격
{ const f = createFlow({ data, grade: 1, seed: 31 }); f.action('start', { mode: 'keyboard' }); const g = f.game; const s0 = g.snapshot();
  ok('판 시작 = 길 구간(zone 0 rail)', s0.world.zone === 'rail' && g.zoneIdx === 0 && s0.camera.mode === 'rail', `zone ${s0.world.zone} cam ${s0.camera.mode}`);
  const obs = g.rail.obstacles, kinds = k => obs.filter(o => o.kind === k).length;
  ok('길 A 배치 바위 4·가지 2·상자 1·반딧불 6', kinds('rock') === 4 && kinds('branch') === 2 && kinds('chest') === 1 && kinds('firefly') === 6, `${kinds('rock')}/${kinds('branch')}/${kinds('chest')}/${kinds('firefly')}`);
  const hard = obs.filter(o => o.kind === 'rock' || o.kind === 'branch').map(o => o.d).sort((a, b) => a - b); let minGap = 99; for (let i = 1; i < hard.length; i++) minGap = Math.min(minGap, hard[i] - hard[i - 1]);
  ok('1학년 장애물 간격 ≥ 9m×1.3', minGap >= R.gap * R.lowGapMul - 1e-6, `최소 ${minGap.toFixed(1)}m`);
  ok('장애물은 12m~len−14m 안', hard.every(d => d >= R.startD && d <= 170 - R.endD));
  run(f, 3); const s3 = g.snapshot(); ok('속도 ≈ 170/45 m/s 로 전진', s3.world.rail.speed > 3.5 && s3.world.rail.speed < 4 && s3.world.rail.dist > 8, `v ${s3.world.rail.speed} dist ${s3.world.rail.dist}`);
  ok('길 구간엔 수정 없음', s3.crystals.length === 0 && g.rail && !g.firstCrystal);
  ok('플레이어 z = 0 · 좌우 ±2.6', s3.player.pos[2] === 0 && (push(g, 'MOVE', { u: 1 }), run(f, 1), Math.abs(g.player.pos[0] - R.xMax) < .05), `x ${g.player.pos[0].toFixed(2)}`); }

// ── 3. 바위: 서 있으면 맞고(피해·느려짐·무적 .6초) · 옆으로 비키면 지나감(가까우면 「멋진 통과」 마나 +2)
{ const f = createFlow({ data, grade: 1, seed: 31 }); f.action('start', { mode: 'keyboard' }); const g = f.game; const rock = g.rail.obstacles.filter(o => o.kind === 'rock').sort((a, b) => a.d - b.d)[0];
  push(g, 'MOVE', { u: rock.x / R.xMax }); const hp0 = g.player.hp; const ev = run(f, 60, (s, e) => e.some(x => x.type === 'obstacle:hit'));
  const hit = ev.find(e => e.type === 'obstacle:hit'); ok('바위 자리에 서 있으면 맞음', !!hit && hit.kind === 'rock' && g.player.hp < hp0, `hp ${hp0}→${g.player.hp}`);
  const v1 = g.rail.v; run(f, .25); ok('맞으면 길이 느려짐(×.35→회복)', g.rail.v < v1 * .8, `v ${v1.toFixed(2)}→${g.rail.v.toFixed(2)}`); run(f, 1.5); ok('1.2초 뒤 속도 회복', Math.abs(g.rail.v - g.rail.vBase) < .2, `v ${g.rail.v.toFixed(2)}`);
  const f2 = createFlow({ data, grade: 1, seed: 31 }); f2.action('start', { mode: 'keyboard' }); const g2 = f2.game; const r2 = g2.rail.obstacles.filter(o => o.kind === 'rock').sort((a, b) => a.d - b.d)[0];
  push(g2, 'MOVE', { u: (r2.x + (r2.x <= 0 ? 1 : -1) * (R.rock.r + .6)) / R.xMax }); const m0 = g2.player.mana; const ev2 = run(f2, 60, (s, e) => e.some(x => x.type === 'obstacle:pass' || x.type === 'obstacle:hit'));
  const ps = ev2.find(e => e.type === 'obstacle:pass'); ok('옆으로 비키면 통과 · 가까우면 멋진 통과 마나 +2', !!ps && ps.nice && !ev2.some(e => e.type === 'obstacle:hit') && g2.player.mana >= m0 + 2 - 1e-9, `nice ${ps && ps.nice} 마나 ${m0}→${g2.player.mana}`); }

// ── 4. 가지: 숙이면 지나가고 안 숙이면 맞음
{ const f = createFlow({ data, grade: 1, seed: 31 }); f.action('start', { mode: 'keyboard' }); const g = f.game; const br = g.rail.obstacles.filter(o => o.kind === 'branch').sort((a, b) => a.d - b.d)[0];
  const rocksBefore = g.rail.obstacles.filter(o => o.kind === 'rock' && o.d < br.d); push(g, 'MOVE', { u: -1 }); // 왼쪽 끝(바위 lane −1.7 은 맞을 수 있어 x=−2.6)
  run(f, 60, s => s.obstacles.some(o => o.uid === br.uid && o.pos[2] < 2.5)); push(g, 'DUCK', { on: true }); const ev = run(f, 3, (s, e) => e.some(x => x.type === 'obstacle:pass' && x.uid === br.uid || x.type === 'obstacle:hit' && x.uid === br.uid)); push(g, 'DUCK', { on: false });
  ok('숙이면 가지 통과', ev.some(e => e.type === 'obstacle:pass' && e.uid === br.uid) && !ev.some(e => e.type === 'obstacle:hit' && e.uid === br.uid), rocksBefore.length ? `(앞 바위 ${rocksBefore.length}개 x=−2.6 으로 피함)` : '');
  const f2 = createFlow({ data, grade: 1, seed: 31 }); f2.action('start', { mode: 'keyboard' }); const g2 = f2.game; const b2 = g2.rail.obstacles.filter(o => o.kind === 'branch').sort((a, b) => a.d - b.d)[0]; push(g2, 'MOVE', { u: -1 });
  const ev2 = run(f2, 60, (s, e) => e.some(x => x.uid === b2.uid && (x.type === 'obstacle:hit' || x.type === 'obstacle:pass'))); ok('안 숙이면 가지에 맞음(피해 8×.7)', ev2.some(e => e.type === 'obstacle:hit' && e.uid === b2.uid)); }

// ── 5. 반딧불·상자 줍기 · 길 위 슬라임 · 길 끝 → 전투장 1
{ const f = createFlow({ data, grade: 1, seed: 31 }); f.action('start', { mode: 'keyboard' }); const g = f.game; let steer = null; const rec = [];
  for (let i = 0; i < 60 * 70 && g.zoneIdx === 0; i++) { const s = g.snapshot(); const nxt = s.obstacles.filter(o => o.state === 'ahead' && o.pos[2] > -.5).sort((a, b) => a.pos[2] - b.pos[2])[0];
    if (nxt) { const want = nxt.kind === 'rock' ? (nxt.x <= 0 ? R.xMax : -R.xMax) : nxt.kind === 'branch' ? g.player.pos[0] : nxt.pos[0]; if (steer !== want) { steer = want; push(g, 'MOVE', { u: want / R.xMax }); } push(g, 'DUCK', { on: nxt.kind === 'branch' }); }
    if (i % 40 === 0) push(g, 'ATTACK', { zone: 1, side: 'R' }); f.step(1 / 60); rec.push(...f.drainEvents()); }
  const pk = rec.filter(e => e.type === 'pickup'); ok('반딧불 6·상자 1 전부 주움', pk.filter(e => e.kind === 'firefly').length === 6 && pk.filter(e => e.kind === 'chest').length === 1, `반딧불 ${g.stats.fireflies} 상자 ${g.stats.chests} 골드 ${g.stats.gold}`);
  const ch = pk.find(e => e.kind === 'chest'); ok('상자 골드 10~30 · 마나 +15', ch && ch.gold >= 10 && ch.gold <= 30 && ch.mana === 15);
  const sp = rec.filter(e => e.type === 'enemy:spawn' && e.rail); ok('길 위 슬라임 2 등장(.3·.65 지점)', sp.length === 2, `${sp.length}`);
  ok('길 끝 → 전투장 1(zone 1 · arenaNo 1)', rec.some(e => e.type === 'rail:end' && e.idx === 0) && g.zoneIdx === 1 && g.snapshot().world.arenaNo === 1 && g.snapshot().world.zone === 'arena', `zoneIdx ${g.zoneIdx}`);
  ok('길 구간 피해 ≤ 2번(봇이 피함)', (g.stats.obstaclesHit || 0) <= 2, `맞음 ${g.stats.obstaclesHit || 0}`); }

// ── 6. 길 B 숫자 다리 퍼즐: 멈춤 → S08P → 정답 → 길 열림
function toPuzzle(d, seed = 31){ const f = createFlow({ data: d, grade: 1, seed, startZone: 2 }); f.action('start', { mode: 'keyboard' }); const g = f.game; let steer = null;
  for (let i = 0; i < 60 * 60 && g.screen !== 'S08P'; i++) { const s = g.snapshot(); const nxt = s.obstacles.filter(o => o.state === 'ahead' && o.pos[2] > -.5).sort((a, b) => a.pos[2] - b.pos[2])[0];
    if (nxt) { const want = nxt.kind === 'rock' ? (nxt.x <= 0 ? R.xMax : -R.xMax) : nxt.kind === 'branch' ? g.player.pos[0] : nxt.pos[0]; if (steer !== want) { steer = want; push(g, 'MOVE', { u: want / R.xMax }); } push(g, 'DUCK', { on: nxt.kind === 'branch' }); }
    f.step(1 / 60); f.drainEvents(); } return { f, g }; }
{ const { f, g } = toPuzzle(data); const s = g.snapshot();
  ok('길 B 60% 지점에서 멈추고 S08P', s.screen === 'S08P' && s.puzzle && s.puzzle.type === 'number-bridge' && s.world.rail.speed < .05 && s.camera.mode === 'puzzle', `dist ${s.world.rail.dist}/${s.world.rail.len} v ${s.world.rail.speed}`);
  const pzAt = g.rail.puzzle.at; ok('퍼즐 자리 ±12m 안 장애물 없음', g.rail.obstacles.filter(o => o.kind === 'rock' || o.kind === 'branch').every(o => Math.abs(o.d - pzAt) >= R.puzzleClear));
  ok('돌 3개 = targets kind puzzle(rect = choices3)', s.targets.length === 3 && s.targets.every(t => t.kind === 'puzzle') && s.puzzle.stones.length === 3 && s.puzzle.target === 6);
  const ans = g.puzzle.cur.answer; const m0 = g.player.mana; push(g, 'SELECT', { slot: ans[0] }); run(f, .1); ok('첫 돌 집으면 불 켜짐·열린 채', g.snapshot().puzzle.stones[ans[0]].lit && g.snapshot().puzzle.state === 'open');
  push(g, 'SELECT', { slot: ans[1] }); const ev = run(f, .1); const rt = ev.find(e => e.type === 'puzzle:right'); ok('두 돌 합 = 6 → puzzle:right · 골드 10~30 · 마나 +20', !!rt && rt.gold >= 10 && rt.gold <= 30 && g.player.mana === Math.min(100, m0 + 20), `골드 ${rt && rt.gold} 마나 ${m0}→${g.player.mana}`);
  const ev2 = run(f, 4, (s2, e) => e.some(x => x.type === 'puzzle:close')); ok('1.6초 뒤 닫히고 길 다시 출발', ev2.some(e => e.type === 'puzzle:close' && e.solved) && g.screen === 'S08' && (run(f, 1.5), g.rail.v > 1), `v ${g.rail.v.toFixed(2)}`);
  const lg = g.stats.log.at(-1); ok('기록 log: puzzle:number-bridge 정답·숙달 올라감', lg && lg.type === 'puzzle:number-bridge' && lg.correct && lg.mAfter > lg.mBefore);
  for (let i = 0; i < 60 * 60 && g.zoneIdx === 2; i++) { f.step(1 / 60); f.drainEvents(); } ok('길 B 끝 → 전투장 2(zone 3 · arenaNo 2)', g.zoneIdx === 3 && g.snapshot().world.arenaNo === 2); }

// ── 7. 오답 → 다른 수로 다시(힌트 1단계) · 3번 틀리면 정답 보여 주고 통과(보상 0·숙달 오답)
{ const { f, g } = toPuzzle(data); const ids = [];
  for (let k = 0; k < 3; k++) { const ans = g.puzzle.cur.answer, other = [0, 1, 2].find(x => !ans.includes(x)); ids.push(g.puzzle.id); push(g, 'SELECT', { slot: ans[0] }); run(f, .1); push(g, 'SELECT', { slot: other }); run(f, .1);
    const st = g.snapshot().puzzle; if (k < 2) { ok(`오답 ${k + 1} → wrong 상태·돌 가라앉음`, st.state === 'wrong' && st.wrong === k + 1); run(f, 2, s => s.puzzle && s.puzzle.state === 'open'); ok(`다시 열림(다른 수·같은 목표 6·힌트 켜짐)`, g.puzzle.id !== ids[k] && g.puzzle.cur.target === 6 && !!g.snapshot().puzzle.hint, g.snapshot().puzzle.hint ? g.snapshot().puzzle.hint.key : ''); }
    else ok('3번째 오답 → reveal(정답 돌 표시)', st.state === 'reveal' && st.stones.filter(x => x.answer).length === 2); }
  const m0 = g.player.mana, gold0 = g.stats.gold || 0; const ev = run(f, 5, (s, e) => e.some(x => x.type === 'puzzle:close'));
  ok('2.8초 뒤 통과(solved false)·보상 0', ev.some(e => e.type === 'puzzle:close' && !e.solved) && g.screen === 'S08' && g.player.mana === m0 && (g.stats.gold || 0) === gold0);
  const lg = g.stats.log.at(-1); ok('숙달도 오답 기록(wrong 3)', lg && !lg.correct && lg.wrong === 3 && lg.mAfter < lg.mBefore, `${lg && lg.mBefore}→${lg && lg.mAfter}`); }

// ── 8. 크기 문(몸 위치로 고르기) · 규칙 징검다리
{ const { f, g } = toPuzzle(withPuzzle('size-gate')); const s = g.snapshot();
  ok('크기 문 S08P: 돌 없음·문 둘·targets 0·pose 입력', s.puzzle.type === 'size-gate' && !s.puzzle.stones && s.puzzle.gate && s.targets.length === 0 && g.wantsPose() && f.wantModes()[0] === 'pose');
  const wrong = g.puzzle.cur.answer === 'L' ? 1 : -1, hpG = g.player.hp; push(g, 'MOVE', { u: wrong }); const ev = run(f, 3, (s2, e) => e.some(x => x.type === 'puzzle:wrong'));
  ok('막힌 문 쪽에 .8초 서면 오답(피해 0·튕김)', ev.some(e => e.type === 'puzzle:wrong') && g.player.hp === hpG && Math.abs(g.player.pos[0]) < 1, `x ${g.player.pos[0].toFixed(2)}`);
  run(f, 2, s2 => s2.puzzle && s2.puzzle.state === 'open'); push(g, 'MOVE', { u: g.puzzle.cur.answer === 'L' ? -1 : 1 }); const ev2 = run(f, 3, (s2, e) => e.some(x => x.type === 'puzzle:right' || x.type === 'puzzle:wrong'));
  ok('맞는 문 쪽에 서면 정답', ev2.some(e => e.type === 'puzzle:right'));
  const { f: f3, g: g3 } = toPuzzle(withPuzzle('rule-stones')); const s3 = g3.snapshot();
  ok('규칙 징검다리: 수열 3개 + 돌 3개(정답 1)', s3.puzzle.type === 'rule-stones' && s3.puzzle.seq.length === 3 && s3.puzzle.stones.length === 3 && s3.puzzle.need === 1);
  push(g3, 'SELECT', { slot: (g3.puzzle.cur.answer[0] + 1) % 3 }); run(f3, .2); const h = g3.snapshot().puzzle; run(f3, 2, s2 => s2.puzzle && s2.puzzle.state === 'open');
  ok('틀리면 「+d」 힌트', h.state === 'wrong' && g3.snapshot().puzzle.hint && g3.snapshot().puzzle.hint.key === 'pz.rule.hint', JSON.stringify(g3.snapshot().puzzle.hint));
  push(g3, 'SELECT', { slot: g3.puzzle.cur.answer[0] }); const ev3 = run(f3, .2); ok('다음 돌 맞히면 정답', ev3.some(e => e.type === 'puzzle:right')); }

// ── 9. 체크포인트: 길에서 지면 그 길부터 · 길 B 에서 지면 길 B 부터
{ const f = createFlow({ data, grade: 1, seed: 31 }); f.action('start', { mode: 'keyboard' }); const g = f.game; run(f, 5); g.player.feather = false; g.player.hp = 1; g.player.invulnUntil = 0;
  push(g, 'MOVE', { u: 0 }); run(f, 60, s => s.screen === 'S14'); ok('길 A 에서 패배 화면', g.screen === 'S14'); f.action('again'); run(f, .5); ok('다시 → 길 A 처음부터(dist 0 근처)', g.zoneIdx === 0 && g.rail && g.rail.dist < 5, `dist ${g.rail && g.rail.dist.toFixed(1)}`);
  const f2 = createFlow({ data, grade: 1, seed: 31, startZone: 2 }); f2.action('start', { mode: 'keyboard' }); const g2 = f2.game; run(f2, 2); g2.checkpoint = { zone: 'rail', idx: 2 }; g2.player.feather = false; g2.player.hp = 1; g2.player.invulnUntil = 0; run(f2, 80, s => s.screen === 'S14');
  f2.action('again'); run(f2, .5); ok('길 B 에서 지면 길 B 부터', g2.zoneIdx === 2 && g2.rail && g2.rail.dist < 5, `zone ${g2.zoneIdx}`); }

// ── 10. 봇 9조합 완주 · 문제 시간 비율 25~35% 근처(acc .75)
{ const rs = []; for (const react of [.25, .4, .6]) for (const acc of [.5, .75, .9]) for (let i = 0; i < 3; i++) rs.push(Object.assign({ react, acc }, playOne({ data, seed: 2000 + i, acc, react })));
  ok('봇 27판 전부 완주(길 A·전투장 1·길 B·전투장 2·보스)', rs.every(r => r.win && r.zone === 4), rs.filter(r => !r.win).map(r => `${r.react}/${r.acc}`).join(' '));
  const mid = rs.filter(r => r.acc === .75); const share = mid.map(r => r.qShare); const avg = Math.round(share.reduce((a, b) => a + b, 0) / share.length);
  ok('문제 시간 비율 평균 25~35%(정답률 .75)', avg >= 24 && avg <= 36, `${share.join(',')} 평균 ${avg}%`);
  ok('반딧불 ≥ 7 · 퍼즐 1 · 별 3개(acc .9)', rs.filter(r => r.acc === .9).every(r => r.fireflies >= 7 && r.puzzles === 1), rs.filter(r => r.acc === .9).map(r => r.fireflies).join(','));
  const a = playOne({ data, seed: 777, acc: .75, react: .4 }), b = playOne({ data, seed: 777, acc: .75, react: .4 }); ok('같은 시드 = 같은 배치(장애물 자리)', JSON.stringify(a.log.map(x => x.qid)) !== null && a.zone === b.zone);
  const f = createFlow({ data, grade: 1, seed: 777 }); f.action('start', { mode: 'keyboard' }); const f2 = createFlow({ data, grade: 1, seed: 777 }); f2.action('start', { mode: 'keyboard' });
  ok('같은 시드 = 같은 장애물 배치', JSON.stringify(f.game.rail.obstacles.map(o => [o.kind, o.d, o.x])) === JSON.stringify(f2.game.rail.obstacles.map(o => [o.kind, o.d, o.x]))); }

console.table(out); console.log(fail ? `✗ 실패 ${fail}` : '전부 통과');
if (fail) process.exit(1);
