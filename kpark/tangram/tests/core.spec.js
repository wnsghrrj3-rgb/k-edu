/* 케이파크 · 칠교놀이 — core 테스트
 * 실행: node kpark/tangram/tests/core.spec.js */
'use strict';
const T = require('../core.js');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.error('  ✗ ' + msg); }
}
function near(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }

console.log('[조각]');
{
  const sum = ['L','L','M','S','S','Q','P'].reduce((a, s) => a + T.SHAPES[s].area, 0);
  ok(sum === 64, '7조각 넓이 합 = 64');
  for (const sh of Object.keys(T.SHAPES))
    ok(near(T.polyArea(T.SHAPES[sh].poly), T.SHAPES[sh].area, 1e-9), sh + ' 선언 넓이 = 실제 넓이');
  ok(T.PIECE_SET.length === 7, '조각 세트 7개');
}

console.log('[변환·합동]');
{
  // 정사각형 90° 회전 대칭: r과 r+2는 같은 자리(중심 정렬 시 합동)
  const a = T.xform('Q', 0, 0, 1, 0), b = T.xform('Q', 3, 3, 3, 0);
  ok(T.shapeMatch(a, b, 1e-6), '정사각형 r1 ≡ r3 (90° 대칭 흡수)');
  // 삼각형은 45° 어긋나면 다른 도형
  const c = T.xform('S', 0, 0, 0, 0), d = T.xform('S', 0, 0, 1, 0);
  ok(!T.shapeMatch(c, d, 0.3), '작은 삼각형 r0 ≢ r1');
  // 평행사변형 180° 대칭
  ok(T.shapeMatch(T.xform('P', 0, 0, 0, 0), T.xform('P', 5, 1, 4, 0), 1e-6), '평행사변형 r0 ≡ r4');
  // 평행사변형 뒤집기는 회전으로 못 만든다
  let anyRot = false;
  for (let r = 0; r < 8; r++) if (T.shapeMatch(T.xform('P', 0, 0, 0, 1), T.xform('P', 0, 0, r, 0), 0.2)) anyRot = true;
  ok(!anyRot, '평행사변형 뒤집기 ≢ 모든 회전');
  // 중심 기준 연속 변환 = 앵커 변환과 합동 (같은 r·f)
  for (const sh of ['L','M','S','Q','P']) {
    const slot = T.xform(sh, 2.5, 1.75, 3, 0);
    const cc = T.centroid(slot);
    const pw = T.pieceWorldPoly(sh, cc[0], cc[1], 3 * 45, 0);
    ok(T.shapeMatch(pw, slot, 1e-6), sh + ': pieceWorldPoly(r3) ≡ xform(r3)');
  }
  const slotF = T.xform('P', 1, 1, 5, 1), ccF = T.centroid(slotF);
  ok(T.shapeMatch(T.pieceWorldPoly('P', ccF[0], ccF[1], 225, 1), slotF, 1e-6), 'P 뒤집기+회전 일치');
}

console.log('[스냅 판정]');
{
  const slot = T.xform('M', 4, 4, 2, 0);
  const cs = T.centroid(slot);
  ok(T.slotMatch(T.pieceWorldPoly('M', cs[0] + 0.6, cs[1] - 0.4, 90, 0), slot, 0.9, 0.35), '근처 + 올바른 회전 → 스냅');
  ok(!T.slotMatch(T.pieceWorldPoly('M', cs[0], cs[1], 45, 0), slot, 0.9, 0.35), '제자리라도 회전 틀림 → 스냅 안 됨');
  ok(!T.slotMatch(T.pieceWorldPoly('M', cs[0] + 2.5, cs[1], 90, 0), slot, 0.9, 0.35), '회전 맞아도 멀면 → 스냅 안 됨');
}

console.log('[퍼즐 22종 무결성]');
{
  ok(T.PUZZLES.length === 22, '퍼즐 22종');
  ok(T.PUZZLES.filter(function(p){return p.stars===4;}).length === 12, '🧭 스스로 찾기 12종');
  for (const pz of T.PUZZLES) {
    const slots = T.puzzleSlots(pz);
    const set = slots.map(s => s.sh).sort().join('');
    ok(set === 'LLMPQSS', pz.id + ': 조각 구성 L·L·M·S·S·Q·P');
    const area = slots.reduce((a, s) => a + T.polyArea(s.poly), 0);
    ok(near(area, 64, 1e-6), pz.id + ': 총 넓이 64');
    let overlap = 0;
    for (let i = 0; i < 7; i++)
      for (let j = i + 1; j < 7; j++)
        overlap += T.overlapSamples(slots[i].poly, slots[j].poly);
    ok(overlap === 0, pz.id + ': 조각 간 겹침 0');
    const bb = T.bbox(slots.map(s => s.poly));
    ok(bb[2] - bb[0] <= pz.w + 0.05 && bb[3] - bb[1] <= pz.h + 0.05, pz.id + ': 선언 크기(w·h) 안에 수납');
    // 모든 슬롯이 자기 자신과 스냅 가능 (게임에서 풀 수 있음 보장)
    let solvable = slots.every(s => {
      const cc = T.centroid(s.poly);
      for (let r = 0; r < 8; r++) for (const f of (T.SHAPES[s.sh].flip ? [0, 1] : [0]))
        if (T.slotMatch(T.pieceWorldPoly(s.sh, cc[0], cc[1], r * 45, f), s.poly, 0.9, 0.35)) return true;
      return false;
    });
    ok(solvable, pz.id + ': 모든 슬롯 도달 가능(45° 격자 회전으로 스냅)');
  }
}

console.log('[대칭 슬롯 중복 스냅 방어]');
{
  // 같은 모양 슬롯 2개(L·L)에 같은 조각이 둘 다 매칭될 수 있어도, 게임은 미점유 슬롯만 검사한다는 계약 확인용:
  const pz = T.PUZZLES.find(p => p.id === 'square');
  const slots = T.puzzleSlots(pz).filter(s => s.sh === 'L');
  ok(slots.length === 2, 'square: L 슬롯 2개');
  const c0 = T.centroid(slots[0].poly);
  // 슬롯0 자리에 놓인 조각은 슬롯1에는 위치 조건으로 매칭되지 않는다
  let alsoOther = false;
  for (let r = 0; r < 8; r++)
    if (T.slotMatch(T.pieceWorldPoly('L', c0[0], c0[1], r * 45, 0), slots[1].poly, 0.9, 0.35)) alsoOther = true;
  ok(!alsoOther, '슬롯0 자리 조각이 슬롯1과 교차 매칭되지 않음');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
