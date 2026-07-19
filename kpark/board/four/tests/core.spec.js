/* 사목 배틀 — core 테스트. 실행: node kpark/board/four/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[보드]');
{
  const b = C.newBoard();
  ok(b.length === 7 && b[0].length === 6, '7×6 보드');
  ok(C.legalMoves(b).length === 7, '처음엔 7수 가능');
  const r = C.drop(b, 3, 1);
  ok(r === 0, '첫 돌은 바닥(행 0)');
  ok(C.drop(b, 3, 2) === 1, '같은 열은 위로 쌓임');
  for (let i = 0; i < 4; i++) C.drop(b, 3, 1);
  ok(!C.canDrop(b, 3), '6개 차면 그 열 마감');
  ok(C.legalMoves(b).length === 6, '남은 수 6열');
}

console.log('[승리 판정]');
{
  const b = C.newBoard();
  for (const c of [0, 1, 2]) C.drop(b, c, 1);
  const r = C.drop(b, 3, 1);
  const w = C.winAt(b, 3, r);
  ok(!!w && w.length === 4, '가로 4목');
  const b2 = C.newBoard();
  for (let i = 0; i < 3; i++) C.drop(b2, 5, 2);
  const r2 = C.drop(b2, 5, 2);
  ok(!!C.winAt(b2, 5, r2), '세로 4목');
  const b3 = C.newBoard();
  // 대각선 ↗: (0,0)(1,1)(2,2)(3,3)
  C.drop(b3, 0, 1);
  C.drop(b3, 1, 2); C.drop(b3, 1, 1);
  C.drop(b3, 2, 2); C.drop(b3, 2, 2); C.drop(b3, 2, 1);
  C.drop(b3, 3, 2); C.drop(b3, 3, 2); C.drop(b3, 3, 2);
  const r3 = C.drop(b3, 3, 1);
  ok(!!C.winAt(b3, 3, r3), '대각선 4목');
  const b4 = C.newBoard();
  C.drop(b4, 0, 1); C.drop(b4, 1, 1); C.drop(b4, 2, 1);
  ok(!C.winAt(b4, 2, 0), '3개는 승리 아님');
}

console.log('[AI]');
{
  // 즉시 승리 수를 잡는가 (전 레벨)
  for (const lv of [1, 2, 3]) {
    const b = C.newBoard();
    for (const c of [0, 1, 2]) C.drop(b, c, 2);
    ok(C.aiMove(b, 2, lv, () => 0.99) === 3, '레벨' + lv + ': 즉승 수 착수');
  }
  // 상대 즉승 방어 (레벨 2·3)
  for (const lv of [2, 3]) {
    const b = C.newBoard();
    for (const c of [0, 1, 2]) C.drop(b, c, 1);
    ok(C.aiMove(b, 2, lv) === 3, '레벨' + lv + ': 상대 4목 방어');
  }
  // 레벨3 > 레벨1: 자가 대국 20판 승률
  function selfPlay(lvA, lvB, games) {
    let winA = 0, winB = 0;
    for (let g = 0; g < games; g++) {
      let s = g * 2654435761 % 2147483647;
      const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      const b = C.newBoard();
      // 홀짝 판마다 선공 교대
      let p = (g % 2) + 1;
      for (let mv = 0; mv < 42; mv++) {
        const lv = p === 1 ? lvA : lvB;
        const c = C.aiMove(C.clone(b), p, lv, rnd);
        if (c < 0) break;
        const r = C.drop(b, c, p);
        if (C.winAt(b, c, r)) { if (p === 1) winA++; else winB++; break; }
        if (C.full(b)) break;
        p = 3 - p;
      }
    }
    return [winA, winB];
  }
  const [w3, w1] = selfPlay(3, 1, 10);
  ok(w3 > w1, '사목 도사가 아장아장을 이긴다 (' + w3 + ':' + w1 + ')');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
