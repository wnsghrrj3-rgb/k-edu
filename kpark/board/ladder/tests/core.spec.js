/* 숫자 사다리 원정 — core 테스트. 실행: node kpark/board/ladder/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

console.log('[판 배치]');
{
  ok(String(C.tileXY(1)) === '0,0', '1번 = 왼쪽 아래');
  ok(String(C.tileXY(10)) === '9,0', '10번 = 오른쪽 아래');
  ok(String(C.tileXY(11)) === '9,1', '11번 = 지그재그로 꺾임');
  ok(String(C.tileXY(20)) === '0,1', '20번 = 둘째 줄 왼쪽 끝');
  ok(String(C.tileXY(100)) === '0,9', '100번 = 왼쪽 위');
}

console.log('[특수칸 검증]');
{
  const roles = {};
  let dup = false, range = true, dir = true;
  function reg(n) { if (roles[n]) dup = true; roles[n] = 1; if (n < 2 || n > 99) range = false; }
  for (const [f, t] of Object.entries(C.LADDERS)) { reg(+f); if (t <= +f) dir = false; if (t > 100) range = false; }
  for (const [f, t] of Object.entries(C.SLIDES)) { reg(+f); if (t >= +f) dir = false; if (t < 1) range = false; }
  C.ROCKETS.forEach(reg); C.STARS.forEach(reg); C.SPARKS.forEach(reg);
  ok(!dup, '역할 겹치는 칸 없음');
  ok(range, '특수칸은 전부 2~99 안');
  ok(dir, '사다리는 위로, 미끄럼틀은 아래로');
  // 특수칸의 도착 지점이 또 다른 출발 특수칸이어도 연쇄 해소가 멈추는지
  let chainOk = true;
  for (let n = 1; n <= 99; n++) {
    const r = C.move(n - 1, 1); // n칸으로 이동
    if (r.pos < 1 || r.pos > 100 || r.events.length > 12) chainOk = false;
  }
  ok(chainOk, '어느 칸에서든 연쇄가 안전하게 끝남');
}

console.log('[이동]');
{
  const r1 = C.move(0, 4); // 4번 = 사다리 → 24
  ok(r1.pos === 24, '4번 사다리 → 24');
  const r2 = C.move(25, 2); // 27번 = 미끄럼틀 → 9
  ok(r2.pos === 9, '27번 미끄럼틀 → 9');
  const r3 = C.move(15, 2); // 17번 = 로켓 → 22 = 별!
  ok(r3.pos === 22 && r3.extraRoll, '로켓 +5 → 별칸 연쇄, 한 번 더');
  const r4 = C.move(30, 1); // 31 = 반짝
  ok(r4.spark && r4.pos === 31, '반짝칸에서 문제 대기');
  const r5 = C.move(97, 6); // 100 초과 → 100 캡
  ok(r5.pos === 100, '골인은 100에서 캡');
  const b = C.sparkBonus(31); // 31+3=34
  ok(b.pos === 34, '반짝 정답 보너스 +3');
  const b2 = C.sparkBonus(45); // 45+3=48은 반짝칸이지만 재발동 없음
  ok(b2.pos === 48 && !b2.spark, '보너스로 간 반짝칸은 재발동 없음');
}

console.log('[문제 생성]');
{
  let okAll = true;
  for (let i = 0; i < 300; i++) {
    let s = i * 31 + 7;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const q = C.genQuestion(rnd);
    if (q.choices.length !== 3) okAll = false;
    if (q.choices.indexOf(q.answer) < 0) okAll = false;
    if (new Set(q.choices).size !== 3) okAll = false;
    if (q.choices.some(v => v <= 0)) okAll = false;
    // 식 계산 검증
    const norm = q.q.replace('−', '-').replace('×', '*');
    if (eval(norm) !== q.answer) okAll = false;
  }
  ok(okAll, '문제 300개: 정답 포함·보기 3개 유일·계산 일치');
  // 주사위
  let dOk = true;
  for (let i = 0; i < 100; i++) { const d = C.rollDie(); if (d < 1 || d > 6) dOk = false; }
  ok(dOk, '주사위는 1~6');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
