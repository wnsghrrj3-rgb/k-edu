/* gens/math/g6_2_circle_duel.js — 원의 둘레와 넓이 (6학년 2학기 수학 5단원 l02~l10 · 교과서판 2학기 트랙 2026-11-09)
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기·활동지 공유.
 *
 * params: { upto: 'l02'|'l03'|'l04'|'l05'|'l06'|'l07'|'l08'|'l09'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반. 'all' = l10 문제로 마무리(전부 고르게).
 *
 * 수는 모두 교과서·『수학익힘』·지도서(수업 전 확인 · 형성 평가 · 단원 평가) 수 — 지어낸 수 0(smoke 가 학습지 tb_g6_2_math_u5 · 케이티처 정본 g6s2_math_u5 와 대조).
 * 원주율 = 3.14(교과서). 셈은 정수(자릿수 표시) — 부동소수 0.
 *
 * type (§21-3 · 정본 data/g6s2_math_u5.js 차시 그대로):
 *   hex      l02  지름 → 원 안에 꼭 맞는 정육각형의 둘레(지름의 3배 · 『수학』 103 · 형성 422)
 *   sq       l02  지름 → 원 밖에 꼭 맞는 정사각형의 둘레(지름의 4배)
 *   ratio    l03  원주 · 지름 → (원주) ÷ (지름)(『수학』 105 · 익힘 73 · 단원 평가)
 *   circ_d   l04  지름 → 원주(『수학』 106 자전거 바퀴 80 cm)
 *   circ_r   l04  반지름 → 원주(『수학』 106 반지름 6 cm · 118 반지름 5.5 cm)
 *   dia      l04  원주 → 지름(『수학』 107 호수 157 m · 119 종이띠 78.5 cm)
 *   est_in   l05  반지름 → 원 안 마름모(정사각형)의 넓이 = (반지름)×(반지름)×2(익힘 77 · 보충·심화)
 *   est_out  l05  반지름 → 원 밖 정사각형의 넓이 = (반지름)×(반지름)×4
 *   area_r   l06  반지름 → 원의 넓이(『수학』 111 반지름 3 cm · 118 반지름 11 cm · 117 방석)
 *   area_d   l06  지름 → 원의 넓이(『수학』 111 지름 12 cm · 118 지름 8 cm)
 *   ring     l07  겹원 고리 — 큰 원 − 작은 원(『수학』 112 반지름 1·4·7·10 cm)
 *   poly     l08  원 안쪽에 맞닿는 정다각형 (둘레) ÷ (지름)(『수학』 115 — 반지름 5 cm)
 *   kk       l09  반지름 k배 → 넓이 몇 배(『수학』 116~117 방석 10·20·30 cm · 12·24·36 cm · 심화 17)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」·지도서 오답 유형이 적은 오류값 — 반지름에 바로 원주율(지도서 320·339) · 넓이를 원주 식으로 ·
 *   지름을 두 번 곱함(339) · 반지름을 한 번만 · 고리를 반지름의 차로(정본 l07) · 반지름 3배 → 6배 예상(지도서 336~337) · 원 안 다각형 값 = 3.14(X23) ·
 *   정육각형·정사각형 배를 바꿈 · 지름을 반지름으로(줄의 길이 — 지도서 321). 아이가 자기 실수와 똑같은 값을 집으면 그건 진단 정보다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g6_2_circle_duel'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'];
  var POOL = {
    l02: ['hex', 'sq'], l03: ['ratio'], l04: ['circ_d', 'circ_r', 'dia'], l05: ['est_in', 'est_out'],
    l06: ['area_r', 'area_d'], l07: ['ring'], l08: ['poly'], l09: ['kk']
  };
  var TYPES = ['hex', 'sq', 'ratio', 'circ_d', 'circ_r', 'dia', 'est_in', 'est_out', 'area_r', 'area_d', 'ring', 'poly', 'kk'];
  var WORDY = { ring: 1, poly: 1, kk: 1, dia: 1 };

  /* ── 교과서 수 표(쪽 표시) ── */
  var T = {
    hex: [[6, '형성 평가 422'], [4, '『수학익힘』 72'], [10, '『수학』 103']],
    sq: [[6, '형성 평가 422'], [4, '『수학익힘』 72'], [10, '『수학』 103']],
    ratio: [['31.4', '10', '단원 평가 480'], ['62.8', '20', '단원 평가 484'], ['47.1', '15', '단원 평가 484'], ['21.98', '7', '단원 평가 481'],
            ['25.12', '8', '『수학익힘』 73'], ['43.96', '14', '단원 평가 489'], ['6.28', '2', '『수학익힘』 73'], ['12.56', '4', '『수학익힘』 73']],
    circ_d: [['80', '『수학』 106'], ['20', '『수학』 106'], ['6', '『수학』 118'], ['4', '형성 평가 423'], ['8', '형성 평가 423'], ['14', '단원 평가 488'], ['7', '단원 평가 485']],
    circ_r: [['6', '『수학』 106'], ['5.5', '『수학』 118'], ['9', '단원 평가 481']],
    dia: [['157', 'm', '『수학』 107'], ['31.4', 'cm', '『수학』 107'], ['62.8', 'cm', '『수학』 107'], ['78.5', 'cm', '『수학』 119'], ['15.7', 'cm', '형성 평가 423'],
          ['28.26', 'cm', '형성 평가 423'], ['25.12', 'cm', '단원 평가 486'], ['43.96', 'cm', '단원 평가 481'], ['34.54', 'cm', '단원 평가 488']],
    est_in: [[5, '『수학』 109'], [10, '『수학익힘』 77'], [7, '단원 평가 485'], [6, '단원 평가 488']],
    est_out: [[5, '『수학』 109'], [10, '『수학익힘』 77'], [7, '단원 평가 485'], [6, '단원 평가 488']],
    area_r: [['3', '『수학』 111'], ['5', '지도서 331'], ['11', '『수학』 118'], ['9', '단원 평가 489'], ['10', '『수학』 116'], ['2', '형성 평가 425'], ['30', '『수학』 117'], ['20', '『수학』 116'], ['12', '『수학』 117']],
    area_d: [['12', '『수학』 111'], ['8', '『수학』 118'], ['20', '단원 평가 486'], ['32', '단원 평가 482']],
    ring: [['4', '1', '『수학』 112'], ['7', '4', '『수학』 112'], ['10', '7', '『수학』 112']],
    poly: [['정사각형', '28.28'], ['정육각형', '30'], ['정십이각형', '31.08'], ['정이십이각형', '31.24']],
    kk: [['10', '20', '방석'], ['10', '30', '방석'], ['12', '24', '원'], ['12', '36', '원'], ['3', '9', '원']]
  };

  /* ── 정수 소수 셈(자릿수 표시) ── */
  function dn(s) { s = String(s); var i = s.indexOf('.'); return i < 0 ? [parseInt(s, 10), 0] : [parseInt(s.replace('.', ''), 10), s.length - i - 1]; }
  function p10(k) { var v = 1; for (var i = 0; i < k; i++) v *= 10; return v; }
  function mul() { var r = [1, 0]; for (var i = 0; i < arguments.length; i++) { var x = dn(arguments[i]); r = [r[0] * x[0], r[1] + x[1]]; } return r; }
  function al(a, k) { return a[0] * p10(k - a[1]); }
  function sub(a, b) { var k = Math.max(a[1], b[1]); return [al(a, k) - al(b, k), k]; }
  function add(a, b) { var k = Math.max(a[1], b[1]); return [al(a, k) + al(b, k), k]; }
  function fmt(a) { var n = a[0], k = a[1], s = String(Math.abs(n)); if (k > 0) { while (s.length <= k) s = '0' + s; s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); s = s.replace(/0+$/, '').replace(/\.$/, ''); } return (n < 0 ? '-' : '') + s; }
  function quo(a, b) {          // a ÷ b — 끝나는 소수만(교과서 수는 늘 끝남)
    var A = dn(a), B = dn(b), k = Math.max(A[1], B[1]), N = al(A, k), D = al(B, k);
    for (var s = 0; s <= 6; s++) { var num = N * p10(s); if (num % D === 0) return fmt([num / D, s]); }
    throw new Error('[g6_2_circle_duel] 나누어떨어지지 않음 ' + a + ' ÷ ' + b);
  }
  var PI = '3.14';
  function M() { return fmt(mul.apply(null, arguments)); }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function opts(rng, ans, wrongs) {
    var o = [ans];
    wrongs.forEach(function (w) { if (w != null && w !== ans && o.indexOf(w) < 0 && o.length < 4 && !/^-|^0$/.test(w)) o.push(w); });
    if (o.length < 4) throw new Error('[g6_2_circle_duel] 선택지 모자람 ' + ans + ' ' + wrongs.join(','));
    return shuffle(rng, o);
  }
  function D(x) { return KO.ida(x) + '.'; }

  function make(rng, type) {
    var c = pick(rng, T[type]), q = { type: type, src: c[c.length - 1] };
    var d, r, C, R, k, a, A;
    switch (type) {
      case 'hex':
        d = c[0]; q.ans = String(d * 3);
        q.prompt = '지름이 ' + d + ' cm인 원 안에 꼭 맞는 정육각형의 둘레는 몇 cm일까요?';
        q.options = opts(rng, q.ans, [String(d * 4), String(d * 6), String(d * 3 / 2), String(d * 2)]);
        q.parts = ['정육각형의 한 변 = 반지름 ' + (d / 2) + ' cm', (d / 2) + ' × 6 = ' + q.ans, '지름의 3배 · ' + q.ans + ' cm'];
        q.explain = '정육각형의 한 변은 원의 반지름과 같아요. ' + (d / 2) + ' × 6 = ' + D(q.ans) + ' 한 변을 지름으로 보면 6배가 돼 버려요.';
        break;
      case 'sq':
        d = c[0]; q.ans = String(d * 4);
        q.prompt = '지름이 ' + d + ' cm인 원 밖에 꼭 맞는 정사각형의 둘레는 몇 cm일까요?';
        q.options = opts(rng, q.ans, [String(d * 3), String(d * 2), String(d * 8), String(d * 4 + 4)]);
        q.parts = ['정사각형의 한 변 = 지름 ' + d + ' cm', d + ' × 4 = ' + q.ans, '지름의 4배 · ' + q.ans + ' cm'];
        q.explain = '원 밖에 꼭 맞는 정사각형의 한 변은 원의 지름과 같아요. ' + d + ' × 4 = ' + D(q.ans) + ' 한 변을 반지름으로 보면 2배밖에 안 돼요.';
        break;
      case 'ratio':
        C = c[0]; d = c[1]; q.ans = quo(C, d);
        q.prompt = '원주가 ' + C + ' cm, 지름이 ' + d + ' cm인 원이에요. (원주) ÷ (지름)은 얼마일까요?';
        q.options = opts(rng, q.ans, [quo(C, quo(d, '2')), '3', '4', fmt(add(dn(q.ans), [1, 2]))]);
        q.parts = ['(원주율) = (원주) ÷ (지름)', C + ' ÷ ' + d + ' = ' + q.ans, '원주율 ' + q.ans];
        q.explain = '원주율은 지름에 대한 원주의 비율이라 지름으로 나눠요. ' + C + ' ÷ ' + d + ' = ' + D(q.ans) + ' 반지름으로 나누면 ' + quo(C, quo(d, '2')) + '이 나와요.';
        break;
      case 'circ_d':
        d = c[0]; q.ans = M(d, PI);
        q.prompt = '지름이 ' + d + ' cm인 원의 원주는 몇 cm일까요?';
        q.options = opts(rng, q.ans, [M(quo(d, '2'), PI), M(d, '2', PI), M(quo(d, '2'), quo(d, '2'), PI), fmt(add(dn(d), dn(PI)))]);
        q.parts = ['(원주) = (지름) × (원주율)', d + ' × 3.14 = ' + q.ans, q.ans + ' cm'];
        q.explain = '원주는 지름에 원주율을 곱해요. ' + d + ' × 3.14 = ' + D(q.ans) + ' 지름을 반으로 나누거나 2를 또 곱하면 안 돼요.';
        break;
      case 'circ_r':
        r = c[0]; q.ans = M(r, '2', PI);
        q.prompt = '반지름이 ' + r + ' cm인 원의 원주는 몇 cm일까요?';
        q.options = opts(rng, q.ans, [M(r, PI), M(r, r, PI), M(r, '4', PI), fmt(add(dn(M(r, '2')), dn(PI)))]);
        q.parts = ['지름 = ' + r + ' × 2 = ' + M(r, '2'), M(r, '2') + ' × 3.14 = ' + q.ans, q.ans + ' cm'];
        q.explain = '반지름에 바로 원주율을 곱하면 안 돼요. 2를 먼저 곱해 지름 ' + M(r, '2') + ' cm를 만들고 ' + M(r, '2') + ' × 3.14 = ' + D(q.ans);
        break;
      case 'dia':
        C = c[0]; var u = c[1]; q.ans = quo(C, PI);
        q.prompt = '원주가 ' + C + ' ' + u + '인 원의 지름은 몇 ' + u + '일까요?';
        q.options = opts(rng, q.ans, [M(C, PI), quo(q.ans, '2'), M(q.ans, '2'), fmt(sub(dn(C), dn(PI)))]);
        q.parts = ['(지름) = (원주) ÷ (원주율)', C + ' ÷ 3.14 = ' + q.ans, q.ans + ' ' + u];
        q.explain = '원주는 지름에 3.14를 곱한 값이니 거꾸로 3.14로 나눠요. ' + C + ' ÷ 3.14 = ' + D(q.ans) + ' 반지름을 물을 때만 2로 한 번 더 나눠요.';
        break;
      case 'est_in':
        r = c[0]; q.ans = String(r * r * 2);
        q.prompt = '반지름이 ' + r + ' cm인 원 안에 꼭 맞는 마름모(정사각형)의 넓이는 몇 cm²일까요?';
        q.options = opts(rng, q.ans, [String(r * r * 4), String(r * r), String(r * r * 3), String(r * 2 * 2)]);
        q.parts = ['두 대각선 = 지름 ' + (r * 2) + ' cm', (r * 2) + ' × ' + (r * 2) + ' ÷ 2 = ' + q.ans, '(반지름) × (반지름)의 2배'];
        q.explain = '원 안 마름모의 두 대각선은 지름과 같아요. ' + (r * 2) + ' × ' + (r * 2) + ' ÷ 2 = ' + D(q.ans) + ' 반지름을 한 변으로 하는 정사각형 2개와 같아요.';
        break;
      case 'est_out':
        r = c[0]; q.ans = String(r * r * 4);
        q.prompt = '반지름이 ' + r + ' cm인 원 밖에 꼭 맞는 정사각형의 넓이는 몇 cm²일까요?';
        q.options = opts(rng, q.ans, [String(r * r * 2), String(r * r), String(r * r * 8), String(r * 4)]);
        q.parts = ['한 변 = 지름 ' + (r * 2) + ' cm', (r * 2) + ' × ' + (r * 2) + ' = ' + q.ans, '(반지름) × (반지름)의 4배'];
        q.explain = '원 밖 정사각형의 한 변은 지름이에요. ' + (r * 2) + ' × ' + (r * 2) + ' = ' + D(q.ans) + ' 반지름을 한 변으로 하는 정사각형 4개와 같아요.';
        break;
      case 'area_r':
        r = c[0]; q.ans = M(r, r, PI);
        q.prompt = '반지름이 ' + r + ' cm인 원의 넓이는 몇 cm²일까요?';
        q.options = opts(rng, q.ans, [M(r, '2', PI), M(r, PI), M(r, '2', r, '2', PI), M(r, r)]);
        q.parts = ['(반지름) × (반지름) × (원주율)', r + ' × ' + r + ' × 3.14 = ' + q.ans, q.ans + ' cm²'];
        q.explain = '넓이는 반지름을 두 번 곱하고 원주율을 곱해요. ' + r + ' × ' + r + ' × 3.14 = ' + D(q.ans) + ' (지름) × (원주율)은 원주를 구하는 식이에요.';
        break;
      case 'area_d':
        d = c[0]; r = quo(d, '2'); q.ans = M(r, r, PI);
        q.prompt = '지름이 ' + d + ' cm인 원의 넓이는 몇 cm²일까요?';
        q.options = opts(rng, q.ans, [M(d, d, PI), M(d, PI), M(r, PI), M(d, r, PI)]);
        q.parts = ['반지름 = ' + d + ' ÷ 2 = ' + r, r + ' × ' + r + ' × 3.14 = ' + q.ans, q.ans + ' cm²'];
        q.explain = '넓이는 반지름으로 구해요. 반지름 ' + r + ' cm — ' + r + ' × ' + r + ' × 3.14 = ' + D(q.ans) + ' 지름을 두 번 곱하면 4배가 돼 버려요.';
        break;
      case 'ring':
        R = c[0]; r = c[1]; q.ans = fmt(sub(mul(R, R, PI), mul(r, r, PI)));
        q.prompt = '중심이 같은 원으로 만든 작품이에요. 반지름이 ' + R + ' cm인 원에서 반지름이 ' + r + ' cm인 원을 뺀 고리 모양의 넓이는 몇 cm²일까요?';
        k = fmt(sub(dn(R), dn(r)));
        q.options = opts(rng, q.ans, [M(k, k, PI), M(R, R, PI), fmt(add(mul(R, R, PI), mul(r, r, PI))), M(k, '2', PI)]);
        q.parts = ['큰 원 ' + R + ' × ' + R + ' × 3.14 = ' + M(R, R, PI), '작은 원 ' + r + ' × ' + r + ' × 3.14 = ' + M(r, r, PI), M(R, R, PI) + ' − ' + M(r, r, PI) + ' = ' + q.ans];
        q.explain = '고리는 큰 원의 넓이에서 작은 원의 넓이를 빼요. ' + M(R, R, PI) + ' − ' + M(r, r, PI) + ' = ' + D(q.ans) + ' 반지름의 차 ' + k + ' cm로 원을 그리면 넓이가 달라요.';
        break;
      case 'poly':
        a = c[0]; C = c[1]; q.ans = quo(C, '10'); q.src = '『수학』 115';
        q.prompt = '반지름이 5 cm인 원 안쪽에 맞닿는 ' + KO.j(a, '을/를') + ' 그렸더니 둘레가 ' + C + ' cm였어요. (둘레) ÷ (지름)은 얼마일까요?';
        q.options = opts(rng, q.ans, [quo(C, '5'), PI, quo(C, '100'), M(C, '10')]);
        q.parts = ['지름 = 5 × 2 = 10', C + ' ÷ 10 = ' + q.ans, '원주율 3.14보다 조금 작아요'];
        q.explain = '원의 지름은 10 cm예요. ' + C + ' ÷ 10 = ' + D(q.ans) + ' 원 안쪽 다각형의 둘레는 원주보다 짧아서 3.14보다 작아요.';
        break;
      case 'kk':
        a = c[0]; A = c[1]; k = quo(A, a); var kk = String(+k * +k), thing = c[2];
        q.prompt = '반지름이 ' + A + ' cm인 ' + thing + '의 넓이는 반지름이 ' + a + ' cm인 ' + thing + '의 넓이의 몇 배일까요?';
        q.ans = kk + '배';
        q.options = opts(rng, q.ans, [k + '배', (+k * 2) + '배', (+k * +k * 2) + '배', (+k + 2) + '배', (+k * +k * +k) + '배', (+k * 3) + '배']);
        q.parts = ['반지름 ' + A + ' ÷ ' + a + ' = ' + k + '배', '넓이는 반지름을 두 번 곱해요', k + ' × ' + k + ' = ' + kk + '배'];
        q.explain = '반지름이 ' + k + '배면 넓이는 반지름을 두 번 곱하니 ' + k + ' × ' + k + ' = ' + kk + '배예요. 반지름의 배수 그대로 늘어난다고 예상하면 틀려요.';
        q.src = thing === '방석' ? '『수학』 116~117' : (a === '3' ? '단원 평가 491' : '『수학』 117');
        break;
    }
    q.answer = q.ans;
    return q;
  }

  return {
    id: 'g6_2_circle_duel',
    title: '원의 둘레와 넓이',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, T: T,
    calc: { mul: M, quo: quo, sub: function (a, b) { return fmt(sub(dn(a), dn(b))); } },
    typesUpto: function (upto) {
      var end = (upto === 'all' || ORDER.indexOf(upto) < 0) ? ORDER.length - 1 : ORDER.indexOf(upto);
      var out = [];
      for (var i = 0; i <= end; i++) POOL[ORDER[i]].forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); });
      return out;
    },
    make: make,
    create: function (params, rng) {
      var p = params || {};
      var upto = (p.upto && (p.upto === 'all' || ORDER.indexOf(p.upto) >= 0)) ? p.upto : 'all';
      var all = this.typesUpto(upto);
      var cur = upto === 'all' ? all : POOL[upto];
      var count = 0, seen = {};
      return {
        next: function () {
          var type;
          if (count < 2) type = pick(rng, cur);
          else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
          else type = pick(rng, all);
          count++;
          var q, guard = 0;
          do { q = make(rng, type); } while (seen[q.prompt] && guard++ < 20);
          seen[q.prompt] = 1;
          q.wordy = !!WORDY[q.type];
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-txt">' + q.prompt + '</span><span class="w-box"> </span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '□ 안에 알맞은 수를 쓰세요. 원주율은 3.14로 해요.'
  };
}));
