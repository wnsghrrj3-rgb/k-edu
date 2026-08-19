/* =============================================================
 * test_math_morning_types.js — 아침수학 유형 섞기(shortRatio)
 *   ① 합성 세트 대조: shortRatio 없는 세트는 전부 객관식(기존 동작 그대로),
 *      shortRatio:1 세트는 정수 답 문항이 전부 단답으로 뒤집힘
 *   ② 실제 c키 전수: 학년마다 choice 와 short 가 둘 다 나오는가,
 *      short 답은 예외 없이 숫자 키패드로 칠 수 있는 형태(정수·소수)인가
 *   ③ 결정론: 같은 seed 두 번 → 유형 배열까지 완전 동일
 *   ④ 채점: short 문항에 정답/오답 넣어 gradeOne 이 맞게 가르는가
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_math_morning_types.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..', '..');
var catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'kedu', 'quiz', 'catalog.json'), 'utf8'));

var fail = 0, pass = 0;
function T(c, m) { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } }

var CORE = require('./kquiz-core.js');
(catalog.units || catalog.list || []).filter(function (u) { return u.subject === 'math'; })
  .forEach(function (u) {
    var mod = require(path.join(ROOT, 'kedu', 'quiz', 'templates', u.key + '.js'));
    if (typeof mod === 'function') mod(CORE);
  });
require(path.join(ROOT, 'kedu', 'quiz', 'templates', 'math_morning.js'))(CORE);

/* ① 합성 세트 대조 — 정수 답 param 템플릿 하나로 유무 대조 */
var tpl = {
  id: 't_syn', type: 'param', difficulty: 1,
  gen: function (rng) { return { a: rng.int(2, 9), b: rng.int(2, 9) }; },
  render: function (p) { return p.a + ' + ' + p.b + ' = ?'; },
  answer: function (p) { return p.a + p.b; }
};
CORE.register('__syn_plain', { source: '검사', fixed: [], templates: [tpl] });
CORE.register('__syn_short', { source: '검사', fixed: [], templates: [tpl], shortRatio: 1 });
var plain = CORE.generate({ lesson: '__syn_plain', n: 10, seed: 7 }).items;
var short1 = CORE.generate({ lesson: '__syn_short', n: 10, seed: 7 }).items;
T(plain.every(function (it) { return it.type === 'choice'; }), 'shortRatio 없는 세트에 단답이 섞임 — 기존 세트 오염');
T(short1.every(function (it) { return it.type === 'short'; }), 'shortRatio:1 인데 객관식이 남음');
T(short1.every(function (it) { return /^\d+$/.test(it.answer); }), '합성 단답 답이 정수 문자열이 아님');

/* ②③ 실제 c키 전수 */
[1, 2, 3, 4, 5, 6].forEach(function (g) {
  var order = CORE.mathMorningOrder(g);
  var sawChoice = false, sawShort = false;
  order.forEach(function (_, idx) {
    var key = 'g' + g + '_math_c' + ('00' + (idx + 1)).slice(-3);
    if (!CORE.has(key)) return;
    [11, 42].forEach(function (seed) {
      var items = CORE.generate({ lesson: key, n: 10, seed: seed }).items;
      var again = CORE.generate({ lesson: key, n: 10, seed: seed }).items;
      T(items.map(function (it) { return it.type; }).join() ===
        again.map(function (it) { return it.type; }).join(),
        key + ' seed' + seed + ' 유형 배열이 재현되지 않음');
      items.forEach(function (it) {
        if (it.type === 'choice') sawChoice = true;
        if (it.type === 'short') {
          sawShort = true;
          /* 뒤집힌 단답(shortRatio)은 정수만 허용. 템플릿이 직접 단답을 선언한
             경우(소수 나눗셈 등)는 소수까지 허용 — 그건 작성자가 의도한 유형이다. */
          T(/^\d+(\.\d+)?$/.test(it.answer),
            key + ' 단답 답을 숫자 키패드로 못 침: ' + JSON.stringify(it.answer) + ' — ' + it.q.slice(0, 30));
        }
      });
    });
  });
  T(sawChoice, 'g' + g + ' 에 객관식이 하나도 없음');
  T(sawShort, 'g' + g + ' 에 단답이 하나도 없음 — 섞기가 안 먹음');
});

/* ④ 단답 채점 */
var sample = null;
CORE.mathMorningOrder(3).some(function (_, idx) {
  var key = 'g3_math_c' + ('00' + (idx + 1)).slice(-3);
  if (!CORE.has(key)) return false;
  var items = CORE.generate({ lesson: key, n: 10, seed: 11 }).items;
  sample = items.filter(function (it) { return it.type === 'short'; })[0];
  return !!sample;
});
T(!!sample, 'g3 에서 단답 표본을 못 얻음');
if (sample) {
  T(CORE.gradeOne(sample, ' ' + sample.answer + ' ').correct === true, '단답 정답(공백 포함)이 오답 처리됨');
  T(CORE.gradeOne(sample, sample.answer + '1').correct === false, '단답 오답이 정답 처리됨');
}

console.log('\ntest_math_morning_types: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
