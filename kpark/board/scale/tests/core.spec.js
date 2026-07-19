/* 무게 배틀 — core 테스트. 실행: node kpark/board/scale/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[돌림힘]');
{
  const st = C.newState();
  ok(C.tilt(st) === 0, '처음엔 수평');
  C.apply(st, 1, { w: 3, side: 'L', d: 2 });
  ok(C.torque(st.L) === 6, '왼쪽 힘 = 3×2 = 6');
  ok(C.tilt(st) === -6, '왼쪽으로 6 기욺');
  ok(!C.crashed(st), '차이 6은 아직 버팀');
  C.apply(st, 2, { w: 1, side: 'L', d: 1 });
  ok(C.crashed(st), '차이 7이면 와장창');
}

console.log('[안전 판정]');
{
  const st = C.newState();
  C.apply(st, 1, { w: 6, side: 'L', d: 1 }); // 왼쪽 6
  ok(C.isSafe(st, { w: 1, side: 'R', d: 1 }), '반대쪽 1×1 → 차이 5, 안전');
  ok(!C.isSafe(st, { w: 6, side: 'L', d: 6 }), '같은 쪽 6×6 → 와장창');
  ok(C.isSafe(st, { w: 6, side: 'R', d: 2 }), '반대쪽 6×2 → 차이 6, 아슬아슬 안전');
  ok(!C.isSafe(st, { w: 6, side: 'R', d: 3 }), '반대쪽 6×3 → 차이 12, 와장창');
  const st2 = C.newState();
  ok(C.allMoves(st2, 1).length === 6 * 12, '첫 수: 추 6 × 자리 12 = 72수');
  ok(C.safeMoves(st2, 1).length > 0, '첫 수 중 안전한 수 존재');
  ok(!C.safeMoves(st2, 1).some(m => m.w * m.d > C.LIMIT), '첫 수: 무게×거리 6 초과는 전부 위험');
}

console.log('[AI]');
{
  // 안전한 수가 있으면 절대 와장창 안 냄 (전 레벨)
  for (const lv of [1, 2, 3]) {
    let s = 5 + lv;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const st = C.newState();
    const r = C.aiMove(st, 1, lv, rnd);
    ok(!r.crash && C.isSafe(st, r.move), '레벨' + lv + ': 첫 수 안전');
  }
  // 자가 대국: 게임이 항상 끝난다 (와장창 또는 12개 완주)
  for (const lv of [1, 2, 3]) {
    let s = 77 + lv;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const st = C.newState();
    let turn = 1, ended = '', guard = 0;
    while (guard++ < 13) {
      if (C.done(st)) { ended = 'draw'; break; }
      const r = C.aiMove(C.clone(st), turn, lv, rnd);
      C.apply(st, turn, r.move);
      if (C.crashed(st)) { ended = 'crash:' + turn; break; }
      turn = 3 - turn;
    }
    ok(ended !== '', '레벨' + lv + ' 자가 대국 종료 (' + ended + ')');
  }
  // 저울 도사 vs 아장아장 — 12판 (선공 교대) 승수 비교. 무승부 제외
  function duel(games) {
    let wSmart = 0, wBaby = 0;
    for (let g = 0; g < games; g++) {
      let s = g * 104729 + 7;
      const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      const st = C.newState();
      const lvOf = g % 2 === 0 ? { 1: 3, 2: 1 } : { 1: 1, 2: 3 };
      let turn = 1, guard = 0;
      while (guard++ < 13) {
        if (C.done(st)) break;
        const r = C.aiMove(C.clone(st), turn, lvOf[turn], rnd);
        C.apply(st, turn, r.move);
        if (C.crashed(st)) { // turn이 짐
          const winner = 3 - turn;
          if (lvOf[winner] === 3) wSmart++; else wBaby++;
          break;
        }
        turn = 3 - turn;
      }
    }
    return [wSmart, wBaby];
  }
  const [ws, wb] = duel(12);
  ok(ws >= wb, '저울 도사 ≥ 아장아장 (' + ws + ':' + wb + ')');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
