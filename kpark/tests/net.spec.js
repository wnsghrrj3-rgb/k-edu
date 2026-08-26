/* 케이파크 친구랑 놀기 — 락스텝 뼈대 검사
   핵심 전제 하나만 본다: 같은 시드 + 같은 입력이면 서로 다른 크롬북에서도 같은 판이 된다.
   실행: node kpark/tests/net.spec.js                                          */
'use strict';
const path = require('path');

let pass = 0, fail = 0;
function ok(name, cond) { cond ? (pass++, console.log('  ✅ ' + name)) : (fail++, console.log('  ❌ ' + name)); }
function eq(name, a, b) { ok(name + (a === b ? '' : ' — ' + a + ' ≠ ' + b), a === b); }

/* kpark_net.js 를 브라우저 흉내 안에서 읽어 온다 */
const win = { addEventListener() { } };
global.window = win;
require(path.join(__dirname, '..', 'kpark_net.js'));
const N = win.KParkNet;

console.log('\n[1] 시드 난수 — 같은 시드는 같은 수열');
{
  const a = N.useSeed(12345), A = [];
  for (let i = 0; i < 50; i++) A.push(a());
  const b = N.useSeed(12345), B = [];
  for (let i = 0; i < 50; i++) B.push(b());
  ok('50개 수열이 그대로 겹친다', A.every((v, i) => v === B[i]));
  const c = N.useSeed(12346);
  ok('시드가 다르면 달라진다', c() !== A[0]);
  ok('0 이상 1 미만', A.every(v => v >= 0 && v < 1));
}

console.log('\n[2] 난수 위치 저장/복원 — 재동기화 뒤에도 안 어긋난다');
{
  const r = N.useSeed(777);
  for (let i = 0; i < 13; i++) r();
  const at = r.get();
  const after = [r(), r(), r()];
  r.set(at);
  const again = [r(), r(), r()];
  ok('되돌린 지점부터 같은 수가 나온다', after.every((v, i) => v === again[i]));
}

console.log('\n[3] 상태 지문 — 키 순서가 달라도 같은 값');
{
  const x = { b: 1, a: [1, 2, { z: 3, y: 4 }] };
  const y = { a: [1, 2, { y: 4, z: 3 }], b: 1 };
  eq('같은 내용 → 같은 지문', N.hash(x), N.hash(y));
  ok('내용이 바뀌면 지문도 바뀐다', N.hash(x) !== N.hash({ b: 2, a: [] }));
}

console.log('\n[4] 케이마블 — 두 크롬북이 같은 판을 만든다');
{
  const C = require(path.join(__dirname, '..', 'kmarble', 'core.js'));
  ok('core 로드', !!C && !!C.newGame);

  /* 두 피어가 같은 시드로 판을 열고, 같은 입력을 같은 순서로 넣는다 */
  function playAs(seed, inputs) {
    const rnd = N.useSeed(seed);
    const S = C.newGame([
      { name: '가', em: '🦊', ai: false }, { name: '나', em: '🐼', ai: false }, { name: '다', em: '🐯', ai: false }
    ], rnd);
    let k = 0;
    for (let step = 0; step < 60 && !S.winner; step++) {
      const pid = S.turn, pl = S.players[pid];
      if (!pl.alive) { C.nextTurn(S); continue; }
      if (pl.island > 0 || pl.fly) { C.nextTurn(S); continue; }
      const d1 = C.rollDie(rnd), d2 = C.rollDie(rnd);
      const w = C.walk(pl.pos, d1 + d2);
      pl.pos = w.path[w.path.length - 1];
      if (w.passStart) C.gain(S, pid, C.SALARY_PASS);
      const r = C.land(S, pid, {});
      if (r.choice) {
        const v = inputs[k++ % inputs.length];
        if (r.choice.type === 'festival' || r.choice.type === 'freeUpgrade') C.applyChoice(S, pid, r.choice, true, r.choice.options[0]);
        else C.applyChoice(S, pid, r.choice, v);
      }
      C.nextTurn(S);
    }
    return S;
  }
  const inputs = [true, false, true, true, false];
  const A = playAs(4242, inputs), B = playAs(4242, inputs);
  eq('두 판의 지문이 같다', N.hash(A), N.hash(B));
  const D = playAs(4243, inputs);
  ok('시드가 다르면 판도 다르다', N.hash(A) !== N.hash(D));

  /* 입력이 하나만 달라도 갈라진다 = 입력이 실제로 판을 바꾼다 */
  const E = playAs(4242, [false, false, false, false, false]);
  ok('입력이 달라지면 판이 갈라진다', N.hash(A) !== N.hash(E));
}

console.log('\n[5] 방코드 — 헷갈리는 글자를 안 쓴다');
{
  let bad = 0;
  for (let i = 0; i < 400; i++) { const c = N.makeCode(4); if (/[0O1I]/.test(c) || c.length !== 4) bad++; }
  eq('400개 모두 4글자·0O1I 없음', bad, 0);
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
