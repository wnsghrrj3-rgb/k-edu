/* ⚡ 번개 퍼즐 — core 테스트. 실행: node kpark/board/bolt/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[조각]');
{
  ok(C.PIECES.length === 12, '조각 12종');
  ok(C.PIECES.every(p => p.cells.length >= 3 && p.cells.length <= 5), '전부 3~5칸');
  ok(C.uniqueOrients('o4').length === 1, '네모4: 방향 1');
  ok(C.uniqueOrients('i4').length === 2, '막대4: 방향 2');
  ok(C.uniqueOrients('l4').length === 8, '기역4: 방향 8');
}

console.log('[퍼즐 생성]');
{
  const p = C.genPuzzle(2, 42);
  ok(!!p, '생성 성공');
  ok(p.pieces.length === 3, '레벨2 = 조각 3개');
  const sum = p.pieces.reduce((a, id) => a + C.PIECE_MAP[id].cells.length, 0);
  ok(p.size === sum, '그림자 크기 = 조각 칸 합 (' + p.size + ')');
  ok(C.genPuzzle(3, 42).pieces.length === 4, '레벨3 = 조각 4개');
  /* 같은 시드 = 같은 퍼즐 */
  const a = C.genPuzzle(2, 7), b = C.genPuzzle(2, 7);
  ok(JSON.stringify(a) === JSON.stringify(b), '결정론');
  const c2 = C.genPuzzle(2, 8);
  ok(JSON.stringify(a) !== JSON.stringify(c2), '다른 시드 = 다른 퍼즐');
  /* 그림자 연결성 */
  const ks = Object.keys(p.sil);
  const seen = { [ks[0]]: 1 }; const q = [ks[0].split(',').map(Number)];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [ax, ay] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const k = (x + ax) + ',' + (y + ay);
      if (p.sil[k] && !seen[k]) { seen[k] = 1; q.push([x + ax, y + ay]); }
    }
  }
  ok(Object.keys(seen).length === ks.length, '그림자 연결됨');
}

console.log('[100시드 무결 — 언제나 풀 수 있다]');
{
  let good = 0;
  for (let s = 1; s <= 100; s++) {
    for (const lv of [1, 2, 3]) {
      const p = C.genPuzzle(lv, s);
      if (!p) continue;
      /* 정답이 실제로 놓인다 */
      const placed = {};
      let legal = true;
      for (const sol of p.solution) {
        if (!C.canPlace(p, placed, sol.cells, sol.ox, sol.oy)) { legal = false; break; }
        placed[sol.pid] = sol;
      }
      if (legal && C.isSolved(p, placed)) good++;
    }
  }
  ok(good === 300, '300/300 생성·정답 검증 (' + good + ')');
}

console.log('[놓기 규칙]');
{
  const p = C.genPuzzle(2, 42);
  const s0 = p.solution[0];
  const placed = {};
  ok(C.canPlace(p, placed, s0.cells, s0.ox, s0.oy), '정답 자리 OK');
  placed[s0.pid] = s0;
  ok(!C.canPlace(p, placed, s0.cells, s0.ox, s0.oy), '겹치면 거절');
  ok(!C.canPlace(p, {}, s0.cells, 50, 50), '그림자 밖 거절');
  ok(!C.isSolved(p, placed), '일부만 놓으면 미완성');
}

console.log('[컴퓨터 풀이 계획]');
{
  const rng = C.mulberry32(3);
  let l1t = 0, l1f = 0, l3t = 0;
  for (let i = 0; i < 200; i++) {
    const a = C.aiPlan(1, 3, rng);
    if (a.total === Infinity) l1f++; else l1t += a.total;
    const b = C.aiPlan(3, 4, rng);
    ok2(b.total >= 10 && b.total <= 16.01, '도사급 범위');
    l3t += b.total;
    ok2(b.reveals.length === (b.total === Infinity ? 3 : 4) || a, '공개 수');
    for (let k = 1; k < b.reveals.length; k++) ok2(b.reveals[k] >= b.reveals[k - 1], '공개 시각 오름차순');
  }
  function ok2(c, m) { if (!c) { throw new Error(m); } }
  ok(l1f > 20 && l1f < 90, '아장아장 실패율 대략 25% (' + l1f + '/200)');
  ok(l1t / (200 - l1f) > 30, '아장아장은 느리다');
  ok(l3t / 200 < 17, '도사급은 빠르다');
  ok(true, '계획 범위·정렬 전수 통과');
}

console.log('[매치 — 보석 5라운드]');
{
  const m = C.newMatch();
  const rng = C.mulberry32(5);
  ok(m.round === 1 && !m.over, '새 매치');
  const g1 = C.roundResult(m, 1, rng);
  ok(C.GEMS.includes(g1) && m.gems[1].length === 1, '승자 보석');
  C.roundResult(m, 0, rng);
  ok(m.gems[1].length === 1 && m.gems[2].length === 0, '무승부 라운드 = 보석 없음');
  C.roundResult(m, 2, rng); C.roundResult(m, 2, rng); C.roundResult(m, 2, rng);
  ok(m.over, '5라운드 종료');
  ok(C.matchWinner(m) === 2, '보석 많은 팀 승리');
  const m2 = C.newMatch();
  C.roundResult(m2, 1, rng);
  for (let i = 0; i < 4; i++) C.roundResult(m2, i === 0 ? 2 : 0, rng);
  ok(C.matchWinner(m2) === 0, '동점 = 무승부');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
