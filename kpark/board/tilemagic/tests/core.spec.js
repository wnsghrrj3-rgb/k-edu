/* 🎩 타일 마술사 — core 테스트. 실행: node kpark/board/tilemagic/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }
const T = (c, n, id) => ({ id: id === undefined ? c * 100 + n : id, c, n });
const J = id => ({ id, j: true });

console.log('[타일·시작]');
{
  ok(C.allTiles().length === 106, '전체 106장 (4색×13×2 + 조커2)');
  const g = C.newGame(1);
  ok(g.hands[1].length === 14 && g.hands[2].length === 14, '각자 14장');
  ok(g.pool.length === 106 - 28, '더미 78장');
  ok(g.target === 30, '기본 첫 등록 30점');
  ok(C.newGame(1, { target: 20 }).target === 20, '쉬움 20점 옵션');
}

console.log('[묶음 검증]');
{
  ok(C.validMeld([T(0, 5), T(1, 5), T(2, 5)]).type === 'group', '모둠 3장');
  ok(C.validMeld([T(0, 5), T(1, 5), T(2, 5), T(3, 5)]).value === 20, '모둠 4장 = 20점');
  ok(!C.validMeld([T(0, 5), T(0, 5, 999), T(1, 5)]), '모둠 색 중복 금지');
  ok(C.validMeld([T(0, 3), T(0, 4), T(0, 5)]).type === 'run', '계단 3장');
  ok(C.validMeld([T(0, 3), T(0, 4), T(0, 5)]).value === 12, '계단 3+4+5 = 12점');
  ok(!C.validMeld([T(0, 3), T(1, 4), T(0, 5)]), '계단 색 섞임 금지');
  ok(!C.validMeld([T(0, 3), T(0, 5)]), '2장은 묶음 아님');
  ok(C.validMeld([T(0, 3), J(900), T(0, 5)]).value === 12, '조커가 빈칸(4) 대신 → 12점');
  ok(C.validMeld([T(0, 12), T(0, 13), J(900)]).value === 36, '끝 조커는 아래로(11+12+13)');
  ok(C.validMeld([T(0, 5), T(1, 5), J(900)]).value === 15, '모둠 조커 = 그 수로 계산');
  ok(!C.validMeld([J(900), J(901), T(0, 5)]) === false || C.validMeld([J(900), J(901), T(0, 5)]), '조커 2 + 실물 1도 판정 가능');
  ok(!C.validMeld([J(900), J(901)]), '조커만으론 불가(2장)');
}

console.log('[첫 등록 규칙]');
{
  const g = C.newGame(2);
  g.hands[1] = [T(0, 1, 1), T(0, 2, 2), T(0, 3, 3), T(1, 9, 4), T(2, 9, 5), T(3, 9, 6), T(0, 13, 7)];
  /* 1+2+3=6점 → 부족 */
  let r = C.tryEndTurn(g, 1, [[T(0, 1, 1), T(0, 2, 2), T(0, 3, 3)]]);
  ok(r.error && r.error.includes('30'), '30점 미만 첫 등록 거부');
  /* 6 + 27 = 33 ≥ 30 → 성공 */
  r = C.tryEndTurn(g, 1, [[T(0, 1, 1), T(0, 2, 2), T(0, 3, 3)], [T(1, 9, 4), T(2, 9, 5), T(3, 9, 6)]]);
  ok(!r.error && g.opened[1] && g.table.length === 2, '33점 첫 등록 성공');
  ok(g.hands[1].length === 1 && g.turn === 2, '손에서 빠지고 차례 넘김');
  /* 상대(미등록)가 판 타일로 등록 시도 → 거부 */
  g.hands[2] = [T(1, 1, 11), T(1, 2, 12), T(1, 3, 13), T(0, 4, 14)];
  const stolen = [[T(0, 1, 1), T(0, 2, 2), T(0, 3, 3), T(0, 4, 14)], [T(1, 9, 4), T(2, 9, 5), T(3, 9, 6)]];
  r = C.tryEndTurn(g, 2, stolen);
  ok(r.error, '첫 등록 전 판 타일 사용 거부');
}

console.log('[재배열·수비 규칙]');
{
  const g = C.newGame(3);
  g.opened[1] = true; g.opened[2] = true;
  g.table = [[T(0, 5, 1), T(0, 6, 2), T(0, 7, 3), T(0, 8, 4)]];
  g.hands[1] = [T(1, 5, 10), T(2, 5, 11), T(0, 9, 12)];
  g.turn = 1;
  /* 계단에서 5를 떼어 모둠 만들고, 계단은 6·7·8·9로 유지 */
  const nm = [[T(0, 6, 2), T(0, 7, 3), T(0, 8, 4), T(0, 9, 12)], [T(0, 5, 1), T(1, 5, 10), T(2, 5, 11)]];
  let r = C.tryEndTurn(g, 1, nm);
  ok(!r.error && g.table.length === 2, '등록 후 재배열 성공');
  ok(g.hands[1].length === 0 && r.win && g.over.winner === 1, '손 비움 → 매직 승리');
  /* 판 타일 손으로 회수 금지 */
  const h = C.newGame(4);
  h.opened[1] = true; h.turn = 1;
  h.table = [[T(0, 5, 1), T(0, 6, 2), T(0, 7, 3)]];
  h.hands[1] = [T(3, 1, 20), T(3, 2, 21), T(3, 3, 22)];
  r = C.tryEndTurn(h, 1, [[T(3, 1, 20), T(3, 2, 21), T(3, 3, 22)]]);
  ok(r.error && r.error.includes('손으로'), '판 타일 회수 거부');
  /* 미완성 묶음 거부 */
  r = C.tryEndTurn(h, 1, [[T(0, 5, 1), T(0, 6, 2), T(0, 7, 3)], [T(3, 1, 20), T(3, 2, 21)]]);
  ok(r.error, '2장 묶음 거부');
  /* 0장 내려놓기 거부 */
  r = C.tryEndTurn(h, 1, [[T(0, 5, 1), T(0, 6, 2), T(0, 7, 3)]]);
  ok(r.error && r.error.includes('1장'), '한 장도 안 내면 거부');
}

console.log('[뽑기·막힌 게임]');
{
  const g = C.newGame(5);
  const before = g.hands[1].length;
  const r = C.drawPass(g, 1);
  ok(r.drawn && g.hands[1].length === before + 1 && g.turn === 2, '뽑고 차례 넘김');
  g.pool = [];
  C.drawPass(g, 2); const r2 = C.drawPass(g, 1);
  ok(r2.over && g.over && g.over.magic === false, '더미 없이 둘 다 패스 → 종료');
  ok(g.over.winner === (C.handSum(g.hands[1]) < C.handSum(g.hands[2]) ? 1 : (C.handSum(g.hands[1]) > C.handSum(g.hands[2]) ? 2 : 0)), '손 합계 적은 쪽 승');
  ok(C.handSum([J(900), T(0, 5)]) === 35, '조커는 30점 벌점');
}

console.log('[AI]');
{
  const g = C.newGame(6);
  g.hands[2] = [T(0, 10, 50), T(1, 10, 51), T(2, 10, 52), T(3, 2, 53)];
  g.turn = 2;
  const r = C.aiTurn(g);
  ok(r.action === 'meld' && g.opened[2] && g.table.length === 1, 'AI 첫 등록(모둠 30점)');
  /* AI 확장: 판의 계단에 이어 붙이기 */
  const h = C.newGame(7);
  h.opened[2] = true; h.turn = 2;
  h.table = [[T(0, 5, 1), T(0, 6, 2), T(0, 7, 3)]];
  h.hands[2] = [T(0, 8, 60), T(1, 1, 61), T(2, 3, 62)];
  const r2 = C.aiTurn(h);
  ok(r2.action === 'meld' && r2.extended === 1 && h.table[0].length === 4, 'AI 계단 확장');
  /* AI 못 내면 뽑기 */
  const k = C.newGame(8);
  k.hands[2] = [T(0, 1, 70), T(1, 3, 71), T(2, 5, 72)];
  k.turn = 2;
  const r3 = C.aiTurn(k);
  ok(r3.action === 'draw' && k.hands[2].length === 4, 'AI 못 내면 뽑기');
  /* AI 자동 대국 완주 (양쪽 AI) */
  let done = 0;
  for (let s = 1; s <= 3; s++) {
    const m = C.newGame(s * 31);
    let guard = 400;
    while (!m.over && guard--) C.aiTurn(m);
    if (m.over) done++;
  }
  ok(done === 3, 'AI 자동 대국 3판 완주');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
