/* 🌈 무지개 육각길 — core 테스트. 실행: node kpark/board/rainbow/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[판]');
{
  ok(C.cells().length === 61, '육각판 61칸');
  const g = C.newGame(1);
  ok(Object.keys(g.board).length === 61, '보드 키 61');
  const corners = C.CORNERS.map(([q, r]) => g.board[C.K(q, r)]);
  ok(corners.slice().sort().join(',') === '0,1,2,3,4,5', '모서리에 여섯 그림');
  ok(g.bag.length === 63 - 12, '주머니 63 − 손패 12');
  ok(g.hands[1].length === 6 && g.hands[2].length === 6, '손패 6장씩');
  /* 주머니 구성: 조합별 3장 */
  const cnt = {};
  const all = g.bag.concat(g.hands[1], g.hands[2]);
  for (const [a, b] of all) cnt[a + '-' + b] = (cnt[a + '-' + b] || 0) + 1;
  ok(Object.keys(cnt).length === 21 && Object.values(cnt).every(n => n === 3), '21조합 × 3장');
  /* 결정론 */
  ok(JSON.stringify(C.newGame(9).bag) === JSON.stringify(C.newGame(9).bag), '같은 시드 = 같은 주머니');
}

console.log('[점수 줄 세기]');
{
  const g = C.newGame(1);
  /* 시나리오: (1,0)(2,0)에 ⭐⭐를 손으로 깔고, (3,0)(3,-1)에 [⭐,🌙] 놓기
     → (3,0)의 ⭐는 (-1,0) 방향으로 ⭐ 2개 + 모서리(4,0)=0(⭐) 쪽 (1,0) 방향 1개 */
  g.board[C.K(1, 0)] = 0; g.board[C.K(2, 0)] = 0;
  const gains = C.scoreMove(g, [0, 1], [3, 0], [3, -1]);
  ok(gains[0] === 3, '⭐ 줄 = 왼쪽 2 + 오른쪽 모서리 1 (' + gains[0] + ')');
  /* 🌙 반쪽 (3,-1): 이웃에 🌙 없음... 단 (4,-4) 모서리는 멀다 */
  ok(gains[1] === 0, '🌙 줄 없음');
  /* 자기 타일의 다른 반쪽 방향은 제외 */
  g.board[C.K(3, -1)] = -1; g.board[C.K(3, 0)] = -1;
  const gains2 = C.scoreMove(g, [0, 0], [3, 0], [3, -1]);
  /* A반쪽 3(왼2+모서리1) + B반쪽 1(대각의 (2,0)) = 4. 서로(파트너 방향)는 세지 않음 */
  ok(gains2[0] === 4, '같은 그림 쌍: 서로는 안 세고 다른 줄만 (' + gains2[0] + ')');
}

console.log('[수 적용·보너스·반전 승부]');
{
  const g = C.newGame(2);
  g.hands[1][0] = [0, 1];
  const r = C.applyMove(g, 0, [3, 0], [3, -1], false);
  ok(!!r, '수 적용');
  ok(g.board[C.K(3, 0)] === 0 && g.board[C.K(3, -1)] === 1, '보드 반영');
  ok(g.tracks[1][0] === r.gains[0], '트랙 가산');
  ok(g.hands[1].length === 6, '뽑아서 다시 6장');
  ok(g.turn === 2 || r.genius, '차례 넘김');
  /* 이미 놓인 칸 거절 */
  ok(C.applyMove(g, 0, [3, 0], [2, 0], false) === null, '점유 칸 거절');
  /* 안 붙은 두 칸 거절 */
  ok(C.applyMove(g, 0, [0, 0], [2, 0], false) === null, '떨어진 칸 거절');
  /* flip */
  const g2 = C.newGame(3);
  g2.hands[1][0] = [2, 5];
  C.applyMove(g2, 0, [1, 1], [1, 2], true);
  ok(g2.board[C.K(1, 1)] === 5 && g2.board[C.K(1, 2)] === 2, '뒤집어 놓기');
  /* 12 도달 = 무지개 완성 보너스(한 번 더) + 캡 */
  const g3 = C.newGame(4);
  g3.tracks[1][0] = 11;
  g3.board[C.K(1, 0)] = 0;
  g3.hands[1][0] = [0, 0];
  const r3 = C.applyMove(g3, 0, [2, 0], [2, -1], false);
  ok(r3.genius, '무지개 완성 보너스');
  ok(g3.turn === 1, '보너스 = 한 번 더');
  ok(g3.tracks[1][0] === 12, '트랙 캡 12');
}

console.log('[반전 규칙 비교]');
{
  ok(C.compareTracks([12, 12, 12, 12, 12, 1], [2, 2, 2, 2, 2, 2]) === -1, '반전: 최저 1 < 최저 2 → 낮은 쪽 패배');
  ok(C.compareTracks([3, 3, 3, 3, 3, 3], [3, 3, 3, 3, 3, 2]) === 1, '최저 같으면 다음 낮은 색 비교');
  ok(C.compareTracks([5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5]) === 0, '완전 동일(정렬 후) = 무승부');
}

console.log('[AI]');
{
  const g = C.newGame(5);
  const rng = C.mulberry32(6);
  for (let lv = 1; lv <= 3; lv++) {
    const m = C.aiPick(g, lv, rng);
    ok(m && g.board[C.K(m.ca[0], m.ca[1])] === -1 && g.board[C.K(m.cb[0], m.cb[1])] === -1, '레벨' + lv + ' 합법 수');
  }
}

console.log('[한 판 완주 — AI vs AI]');
{
  const g = C.newGame(7);
  const rng = C.mulberry32(8);
  let guard = 500;
  while (!g.over && guard--) {
    if (g.hands[g.turn].length === 0) { C.pass(g); continue; }
    const m = C.aiPick(g, 2, rng);
    if (!m) { C.pass(g); continue; }
    C.applyMove(g, m.h, m.ca, m.cb, m.flip);
  }
  ok(g.over, '게임 종료');
  ok(guard > 0, '무한 루프 없음');
  const filled = Object.values(g.board).filter(v => v !== -1).length;
  ok(filled > 40, '판이 채워짐 (' + filled + '/61)');
  ok([0, 1, 2].includes(g.winner), '승자 판정');
}

console.log('[실력차 — 도사급 vs 아장아장]');
{
  let w3 = 0, N = 30;
  for (let s = 0; s < N; s++) {
    const g = C.newGame(100 + s);
    const rng = C.mulberry32(200 + s);
    let guard = 500;
    while (!g.over && guard--) {
      if (g.hands[g.turn].length === 0) { C.pass(g); continue; }
      const m = C.aiPick(g, g.turn === 1 ? 3 : 1, rng);
      if (!m) { C.pass(g); continue; }
      C.applyMove(g, m.h, m.ca, m.cb, m.flip);
    }
    if (g.winner === 1) w3++;
  }
  ok(w3 >= N * 0.7, '도사급 승률 ≥70% (' + w3 + '/' + N + ')');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
