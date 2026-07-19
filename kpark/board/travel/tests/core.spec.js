/* 계산 여행 — core 테스트. 실행: node kpark/board/travel/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[말판]');
{
  ok(C.TILES.length === 24, '24칸 순환 말판');
  ok(C.TILES[0].t === 'start', '0번은 출발점');
  let bridgesOk = true;
  for (let i = 0; i < C.N; i++) {
    const t = C.TILES[i];
    if (t.t === 'bridge') {
      if (t.to <= i || t.to >= C.N) bridgesOk = false;          // 앞으로만, 출발점 안 넘음
      if (C.TILES[t.to].t !== 'coin') bridgesOk = false;         // 다리 도착은 코인칸 (연쇄 단순)
    }
  }
  ok(bridgesOk, '다리는 앞쪽 코인칸으로만 이어짐');
  const r1 = C.step(22, 4);
  ok(r1.pos === 2 && r1.passed === 1, '한 바퀴 돌면 출발점 통과 1회');
  const r2 = C.step(0, 5);
  ok(r2.pos === 5 && r2.passed === 0, '통과 없으면 passed 0');
  const r3 = C.step(20, 12 + 24);
  ok(r3.passed === 2, '두 바퀴면 통과 2회');
}

console.log('[기댓값]');
{
  ok(C.tileEV(1) === 2, '사탕 가게 EV +2');
  ok(C.tileEV(2) === 2.5, '마블런 EV 2.5 (짝 +4 / 홀 +1)');
  ok(C.tileEV(5) === C.tileEV(11), '다리 EV = 도착칸 EV');
  // 출발점 통과 보너스 포함
  ok(C.moveEV(22, 4) === C.tileEV(2) + C.PASS_BONUS, '통과 보너스 포함 계산');
  // rerollEV = 여섯 눈 평균
  let s = 0; for (let d = 1; d <= 6; d++) s += C.moveEV(0, 3 + d);
  ok(Math.abs(C.rerollEV(0, 3) - s / 6) < 1e-9, '재굴림 EV = 평균');
}

console.log('[AI 결정]');
{
  // 코인 부족하면 못 굴림
  ok(C.aiDecide(0, 3, 4, 1, 3) === 'keep', '코인 1개면 재굴림 불가');
  // 레벨1은 절대 안 굴림
  ok(C.aiDecide(0, 3, 4, 20, 1) === 'keep', '레벨1: 항상 그대로');
  // 레벨3: 명백히 나쁜 착지(동전 구멍 −3)에서 재굴림 이득이 크면 굴린다
  // pos 0에서 합 7 → 7번 동전 구멍(−3). 재굴림 EV가 −3−(−2)보다 좋게 나옴
  const dec = C.aiDecide(0, 3, 4, 20, 3, () => 0.5);
  ok(dec !== 'keep', '레벨3: 동전 구멍 앞에서 재굴림 (' + dec + ')');
  // 레벨3: 좋은 착지(관람차 +4)면 그대로 간다
  // pos 0에서 합 8 → 8번 관람차 +4. 재굴림 EV−2는 이보다 낮음
  ok(C.aiDecide(0, 4, 4, 20, 3, () => 0.5) === 'keep', '레벨3: 관람차 +4는 그대로');
}

console.log('[자가 대국]');
{
  for (const lv of [1, 2, 3]) {
    let s = 400 + lv;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const st = C.newState();
    let turn = 1, done = false, guard = 0;
    while (guard++ < 200) {
      const r = C.playTurn(st, turn, lv, rnd);
      if (r.done) { done = true; break; }
      turn = 3 - turn;
    }
    ok(done && st.coins[1] >= 0 && st.coins[2] >= 0,
      '레벨' + lv + ' 완주 (⭐' + st.coins[1] + ' vs 🌙' + st.coins[2] + ', ' + guard + '턴)');
  }
  // 계산왕 vs 아장아장 — 40판 평균 코인 우위 (운 게임이라 승수 대신 평균으로)
  let sum3 = 0, sum1 = 0;
  for (let g = 0; g < 40; g++) {
    let s = g * 6151 + 3;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const st = C.newState();
    const lvOf = g % 2 === 0 ? { 1: 3, 2: 1 } : { 1: 1, 2: 3 };
    let turn = 1, guard = 0;
    while (guard++ < 200) {
      const r = C.playTurn(st, turn, lvOf[turn], rnd);
      if (r.done) break;
      turn = 3 - turn;
    }
    sum3 += lvOf[1] === 3 ? st.coins[1] : st.coins[2];
    sum1 += lvOf[1] === 3 ? st.coins[2] : st.coins[1];
  }
  ok(sum3 > sum1, '계산왕 평균 코인 > 아장아장 (' + (sum3 / 40).toFixed(1) + ' vs ' + (sum1 / 40).toFixed(1) + ')');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
