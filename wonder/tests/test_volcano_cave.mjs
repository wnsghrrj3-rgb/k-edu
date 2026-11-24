/* 케이원더 화산 탐방 ① 용암 동굴 — 다이얼 논리 시험   node wonder/tests/test_volcano_cave.mjs */
import assert from 'node:assert/strict';
import { caveState, snap, says, stageOf, STOPS, OUT_AT, CAVE } from '../volcano/cave/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('✓', name); };

t('지금: 용암 없음 · 햇빛 듦 · 천장 뚫림 · 눈높이 2m', () => { const s = caveState(0); assert.ok(s.lava < 0); assert.equal(s.heat, 0); assert.equal(s.day, 1); assert.equal(s.hole, true); assert.equal(s.eye, 2); assert.equal(s.view, 'in'); });
t('조금 전: 용암 면이 아래 가로줄(무릎 높이)에 딱 맞는다', () => { const s = caveState(STOPS[1]); assert.ok(Math.abs(s.lava - CAVE.h1) < 1e-9); assert.equal(s.heat, 1); assert.equal(s.hole, false); assert.equal(s.day, 0); });
t('더 옛날: 용암 면이 위 가로줄(굴의 반)에 딱 맞고 방울이 떨어진다', () => { const s = caveState(STOPS[2]); assert.ok(Math.abs(s.lava - CAVE.h2) < 1e-9); assert.equal(s.drip, 1); assert.ok(s.grow < 1); });
t('처음: 굴 밖 · 지붕이 거의 없다', () => { const s = caveState(1); assert.equal(s.view, 'out'); assert.ok(s.crust < 0.1); });
t('되감을수록 용암이 내려가지 않는다(굴 안)', () => { let p = -1; for (let x = 0; x <= OUT_AT; x += 0.005) { const l = caveState(x).lava; assert.ok(l >= p - 1e-9, `t=${x}`); p = l; } });
t('눈은 늘 용암보다 1m 넘게 위에 있다', () => { for (let x = 0; x <= OUT_AT; x += 0.005) { const s = caveState(x); assert.ok(s.eye - s.lava > 1, `t=${x}`); assert.ok(s.eye <= 5); } });
t('땅 위에서는 옛날일수록 지붕이 덜 덮였다', () => { let p = 2; for (let x = OUT_AT + 0.001; x <= 1; x += 0.01) { const c = caveState(x).crust; assert.ok(c <= p + 1e-9); p = c; } });
t('손을 놓으면 멈춤 자리에 붙는다', () => { assert.equal(snap(0.31), STOPS[1]); assert.equal(snap(0.96), 1); assert.equal(snap(0.5), 0.5); assert.equal(snap(-1), 0); assert.equal(stageOf(0.7), 2); });
t('글: 멈춤 자리마다 다르고, 등불을 끄면 바뀐다', () => { const a = STOPS.map(x => says(x)[0]); assert.equal(new Set(a).size, 4); assert.notEqual(says(0, false)[0], says(0, true)[0]); for (const x of [0, .1, .2, .33, .5, .66, .75, .8, 1]) for (const line of says(x)) assert.ok(!/[A-Za-z]/.test(line), line); });
console.log(`\n${n} 통과`);
