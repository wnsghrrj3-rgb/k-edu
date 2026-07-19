/* 수학 땅따먹기 — core 테스트. 실행: node kpark/board/land/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[조각]');
{
  ok(C.PIECES.length === 10, '조각 10종');
  const total = C.PIECES.reduce((a, p) => a + p.cells.length, 0);
  ok(total === 33, '조각 칸 합 33 (한 팀 몫)');
  ok(C.uniqueOrients('p1').length === 1, '한 칸: 방향 1개');
  ok(C.uniqueOrients('o4').length === 1, '네모4: 방향 1개');
  ok(C.uniqueOrients('i4').length === 2, '막대4: 방향 2개');
  ok(C.uniqueOrients('l4').length === 8, '기역4: 방향 8개');
  ok(C.uniqueOrients('s4').length === 4, '에스4: 방향 4개(뒤집기 포함)');
}

console.log('[놓기 규칙]');
{
  const b = C.newBoard();
  const one = C.PIECE_MAP.p1.cells;
  ok(!C.canPlace(b, 1, one, 4, 4), '첫 조각: 별자리 밖은 불가');
  ok(C.canPlace(b, 1, one, 0, 0), '첫 조각: 별자리(0,0) 덮으면 가능');
  C.place(b, 1, one, 0, 0);
  ok(C.canPlace(b, 1, one, 1, 0), '둘째: 내 땅 옆이면 가능');
  ok(!C.canPlace(b, 1, one, 5, 5), '둘째: 떨어진 곳은 불가');
  ok(!C.canPlace(b, 1, one, 0, 0), '겹치기 불가');
  // 대각선만 닿는 건 불가 (변으로 이어야 함)
  ok(!C.canPlace(b, 1, one, 1, 1), '대각선만 닿으면 불가');
  // 상대 첫 조각
  ok(C.canPlace(b, 2, one, 8, 8), '달팀 첫 조각: (8,8)');
  // 판 밖
  const i4 = C.orient(C.PIECE_MAP.i4.cells, 0, 0);
  ok(!C.canPlace(b, 1, i4, 7, 0), '판 밖으로 나가면 불가');
}

console.log('[수 목록·점수]');
{
  const b = C.newBoard();
  const h = C.newHand();
  const m1 = C.allMoves(b, 1, h);
  ok(m1.length > 0, '첫 수 존재');
  ok(m1.every(m => m.cells.some(([dx, dy]) => m.ox + dx === 0 && m.oy + dy === 0)), '첫 수는 모두 별자리를 덮음');
  C.place(b, 1, C.PIECE_MAP.o4.cells, 0, 0);
  ok(C.count(b, 1) === 4, '칸 수 세기 4');
  ok(C.frontier(b, 1) === 4, '2×2 모서리 땅의 확장 여지 4칸');
}

console.log('[AI]');
{
  // 그리디는 첫 수에 큰 조각을 고른다
  const b = C.newBoard();
  const m = C.aiPick(b, 1, C.newHand(), 2, () => 0.5);
  ok(m.cells.length === 4, '레벨2: 첫 수는 4칸 조각');
  // 전 레벨 완주 자가 대국 (막힘 없이 종료·칸 합계 정상)
  for (const lv of [1, 2, 3]) {
    let s = 99 + lv;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const bb = C.newBoard();
    const hands = { 1: C.newHand(), 2: C.newHand() };
    let turn = 1, guard = 0;
    while (guard++ < 40) {
      if (!C.canMove(bb, 1, hands[1]) && !C.canMove(bb, 2, hands[2])) break;
      if (C.canMove(bb, turn, hands[turn])) {
        const mv = C.aiPick(bb, turn, hands[turn], lv, rnd);
        C.place(bb, turn, mv.cells, mv.ox, mv.oy);
        hands[turn].splice(hands[turn].indexOf(mv.pid), 1);
      }
      turn = 3 - turn;
    }
    const a = C.count(bb, 1), z = C.count(bb, 2);
    ok(a + z <= 66 && a >= 1 && z >= 1 && guard < 40, '레벨' + lv + ' 자가 대국 정상 종료 (' + a + ':' + z + ')');
  }
  // 레벨3 vs 레벨1 — 10판 승수 비교 (선공 교대)
  function duel(games) {
    let w3 = 0, w1 = 0;
    for (let g = 0; g < games; g++) {
      let s = g * 7919 + 13;
      const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      const bb = C.newBoard();
      const hands = { 1: C.newHand(), 2: C.newHand() };
      const lvOf = g % 2 === 0 ? { 1: 3, 2: 1 } : { 1: 1, 2: 3 };
      let turn = 1, guard = 0;
      while (guard++ < 40) {
        if (!C.canMove(bb, 1, hands[1]) && !C.canMove(bb, 2, hands[2])) break;
        if (C.canMove(bb, turn, hands[turn])) {
          const mv = C.aiPick(bb, turn, hands[turn], lvOf[turn], rnd);
          C.place(bb, turn, mv.cells, mv.ox, mv.oy);
          hands[turn].splice(hands[turn].indexOf(mv.pid), 1);
        }
        turn = 3 - turn;
      }
      const a = C.count(bb, 1), z = C.count(bb, 2);
      const sc3 = lvOf[1] === 3 ? a : z, sc1 = lvOf[1] === 3 ? z : a;
      if (sc3 > sc1) w3++; else if (sc1 > sc3) w1++;
    }
    return [w3, w1];
  }
  const [w3, w1] = duel(10);
  ok(w3 > w1, '땅부자가 아장아장을 이긴다 (' + w3 + ':' + w1 + ')');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
