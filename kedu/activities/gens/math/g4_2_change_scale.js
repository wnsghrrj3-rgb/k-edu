/* gens/math/g4_2_change_scale.js — 더 많이 변한 쪽은? (4학년 2학기 수학 5단원 「꺾은선그래프」 l02 · l05 · l06 · l08 · l09 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). 저울 견주기(balance · stream) — compare999·mcm_compare 와 같은 계약(answer L/E/R + type + explain + whyAns).
 *
 * params: { upto: 'l02'|'l05'|'l06'|'l08'|'all' }
 *   upto  그 차시까지 배운 그래프·갈래만 섞는다(단원 처음부터 누적). 이번 차시 틀이 덱 앞머리. 'all' = l09 마무리(고르게).
 *
 * 그래프는 모두 교과서·『수학익힘』·지도서의 꺾은선그래프 자료 그대로다(아래 D — 학습지 tb_g4_2_math_u5 의 자료 43벌과 같은 수).
 *   무대가 자료로 꺾은선그래프를 직접 그린다(눈금 사이 점도 그 자리에 — 교과서 나무 85·145 cm, 국제선 53·17·13만 회).
 * 견주기는 저울의 두 접시에 올린다: 두 때의 값(점의 높이) · 두 구간의 변화(선분이 기울어진 정도) · 두 자료.
 *
 * type (§21-3 · 교과서 차시 그대로 — D22):
 *   val    l02  두 때의 값 견주기 — 점의 높이를 세로 눈금으로 읽어 견줌(같은 값이면 「같아요」 — 물 사용량 2018~2020 · 태풍 2018·2019 · 강아지 8·9월)
 *   inc    l05  늘어난 양 견주기 — 두 구간 모두 오른쪽 위(『수학』 118 「전월과 비교하여 가장 많이 늘어난 때」 · 익힘 70 방문자·자외선)
 *   chg    l05  변한 양 견주기 — 늘어난 구간과 줄어든 구간을 함께(지도서 378 오류 1 「변화량이 가장 클 때 = 가장 많이 증가한 때」 · 393 건우 · 『수학』 127 국제선)
 *   trap   l05  높이에 속지 않기 — 점이 더 높은 구간이 덜 변했다(학습지 오개념 X12 「높이와 기울기를 섞음」 · 『수학』 118 「가장 많이 늘어난 때는 7월이 아니라 5월」)
 *   two    l08  두 자료 견주기 — 하나의 그래프에 나타낸 두 자료(『수학』 124~125 유소년층·노년층 · 익힘 76 폭염·한파): 두 자료의 변한 양 · 두 해의 차
 * whyAns: 'h' 점의 높이(값)를 견줌 · 'd' 두 때의 차(선분이 기울어진 정도)를 견줌 · 'g' 두 자료의 차(두 선 사이)를 견줌.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_change_scale'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l05', 'l06', 'l08', 'l09'];
  var TYPES = ['val', 'inc', 'chg', 'trap', 'two'];
  var TYPE_L = { val: 'l02', inc: 'l05', chg: 'l05', trap: 'l05', two: 'l08' };
  var TAG = { val: '어느 때가 더?', inc: '더 많이 늘어난 쪽은?', chg: '줄어든 것도 변한 거예요', trap: '높이 말고 기울기', two: '두 자료 견주기' };

  function Y(xs) { return xs.map(function (x) { return x + '년'; }); }
  function M(xs) { return xs.map(function (x) { return x + '월'; }); }
  function Dd(xs) { return xs.map(function (x) { return x + '일'; }); }
  function AM(xs) { return xs.map(function (x) { return '오전 ' + x + '시'; }); }
  function PM(xs) { return xs.map(function (x) { return '오후 ' + x + '시'; }); }
  /* 교과서 자료 — l: 그 그래프가 나오는 차시(단원 안 차시 키) · src: 쪽 · adj: 「값이 더 ○○ 때」 */
  function G(l, src, title, vh, u, xu, xs, nm, v, step, y0, ymax, every, adj, two) {
    return { l: l, src: src, title: title, vh: vh, u: u, xu: xu, xs: xs.map(String), nm: nm, v: v, step: step, y0: y0 || 0, ymax: ymax, every: every || 5, adj: adj, two: two || null };
  }
  var D = {
    tree_tb:  G('l02', '『수학』 110', '월별 나무의 키', '나무의 키', 'cm', '월', [3, 5, 7, 9, 11], M([3, 5, 7, 9, 11]), [85, 100, 120, 145, 170], 10, 0, 180, 5, '더 큰'),
    tree_ik:  G('l02', '익힘 66', '월별 나무의 키', '나무의 키', 'cm', '월', [3, 5, 7, 9, 11], M([3, 5, 7, 9, 11]), [50, 80, 110, 130, 170], 10, 0, 180, 5, '더 큰'),
    cactus:   G('l02', '익힘 66', '월별 선인장의 키', '선인장의 키', 'cm', '월', [5, 6, 7, 8], M([5, 6, 7, 8]), [7, 10, 12, 16], 1, 0, 17, 5, '더 큰'),
    lamp:     G('l02', '익힘 67', '시각별 가로등의 그림자 길이', '그림자 길이', 'cm', '시', [1, 2, 3, 4], PM([1, 2, 3, 4]), [40, 50, 90, 100], 10, 0, 100, 5, '더 긴'),
    vase:     G('l02', '지도서 385', '날짜별 꽃병의 물 높이', '물 높이', 'cm', '일', [1, 2, 3, 4, 5], Dd([1, 2, 3, 4, 5]), [17, 15, 13, 10, 8], 1, 0, 18, 5, '더 높은'),
    green:    G('l02', '『수학』 111', '시각별 온실 안의 온도', '온도', '°C', '시', [7, 8, 9, 10, 11], AM([7, 8, 9, 10, 11]), [20, 20.5, 21, 22, 20.5], 0.1, 20, 22.2, 5, '더 높은'),
    dust_y:   G('l02', '『수학』 113', '연도별 미세 먼지 나쁨 일수', '일수', '일', '년', [2017, 2018, 2019, 2020, 2021], Y([2017, 2018, 2019, 2020, 2021]), [20, 21, 25, 5, 18], 1, 0, 25, 5, '더 많은'),
    stem:     G('l02', '『수학』 115', '월별 선인장 줄기의 길이', '길이', 'cm', '월', [7, 8, 9, 10, 11], M([7, 8, 9, 10, 11]), [10, 18, 26, 30, 32], 2, 0, 34, 5, '더 긴'),
    dust_m:   G('l02', '익힘 68', '월별 미세 먼지 나쁨 일수', '일수', '일', '월', [1, 2, 3, 4, 5], M([1, 2, 3, 4, 5]), [2, 4, 9, 2, 2], 1, 0, 10, 5, '더 많은'),
    pop:      G('l02', '『수학』 116', '연도별 인구수', '인구수', '만 명', '년', [2018, 2019, 2020, 2021, 2022], Y([2018, 2019, 2020, 2021, 2022]), [31, 34, 36, 37, 38], 1, 30, 40, 5, '더 많은'),
    sunf:     G('l02', '익힘 69', '월별 해바라기의 키', '키', 'cm', '월', [6, 7, 8, 9, 10], M([6, 7, 8, 9, 10]), [180, 183, 186, 190, 193], 1, 180, 194, 5, '더 큰'),
    uv:       G('l05', '『수학』 118', '월별 자외선 지수 매우 높음 일수', '일수', '일', '월', [4, 5, 6, 7, 8], M([4, 5, 6, 7, 8]), [4, 17, 18, 22, 17], 1, 0, 23, 5, '더 많은'),
    water:    G('l05', '『수학』 119', '연도별 1인당 하루 물 사용량', '사용량', 'L', '년', [2017, 2018, 2019, 2020, 2021], Y([2017, 2018, 2019, 2020, 2021]), [289, 295, 295, 295, 302], 1, 285, 303, 5, '더 많은'),
    milk:     G('l05', '『수학』 119', '연도별 우리나라의 우유 생산량', '생산량', '만 톤', '년', [2018, 2019, 2020, 2021, 2022], Y([2018, 2019, 2020, 2021, 2022]), [204, 205, 209, 203, 198], 1, 195, 211, 5, '더 많은'),
    inst:     G('l05', '지도서 393', '지유의 날짜별 악기 연습 시간', '연습 시간', '분', '일', [1, 2, 3, 4, 5], Dd([1, 2, 3, 4, 5]), [50, 60, 60, 40, 70], 2, 40, 72, 5, '더 긴'),
    uv_ik:    G('l05', '익힘 70', '월별 자외선 지수 높음 일수', '일수', '일', '월', [5, 6, 7, 8, 9], M([5, 6, 7, 8, 9]), [12, 5, 6, 7, 14], 1, 0, 15, 5, '더 많은'),
    visit:    G('l05', '익힘 70', '시각별 방문자 수', '방문자 수', '명', '시', [4, 5, 6, 7, 8], PM([4, 5, 6, 7, 8]), [8, 9, 17, 20, 12], 1, 0, 21, 5, '더 많은'),
    snow:     G('l05', '익힘 71', '시각별 마당에 쌓인 눈의 높이', '눈의 높이', 'mm', '시', [11, 12, 1, 2, 3], ['오전 11시', '낮 12시', '오후 1시', '오후 2시', '오후 3시'], [2, 7, 9, 14, 17], 1, 0, 18, 5, '더 높은'),
    rice:     G('l05', '익힘 71', '연도별 1인당 쌀 소비량', '소비량', 'kg', '년', [2018, 2019, 2020, 2021, 2022], Y([2018, 2019, 2020, 2021, 2022]), [61, 59, 58, 57, 57], 1, 55, 62, 5, '더 많은'),
    cup:      G('l05', '익힘 71', '시각별 컵의 무게', '무게', 'g', '분', [5, 10, 15, 20, 25], ['오전 10시 5분', '오전 10시 10분', '오전 10시 15분', '오전 10시 20분', '오전 10시 25분'], [221.5, 221.9, 222.2, 222.5, 222.5], 0.1, 221.5, 222.6, 5, '더 무거운'),
    exer:     G('l05', '지도서 395', '서준이의 날짜별 운동 시간', '운동 시간', '분', '일', [1, 2, 3, 4, 5], Dd([1, 2, 3, 4, 5]), [30, 38, 46, 34, 54], 2, 30, 56, 5, '더 긴'),
    hot:      G('l05', '지도서 378', '월별 최고 온도', '최고 온도', '°C', '월', [6, 7, 8, 9, 10], M([6, 7, 8, 9, 10]), [30, 34, 36, 30, 25], 1, 20, 37, 5, '더 높은'),
    heat:     G('l06', '『수학』 121', '연도별 폭염 일수', '일수', '일', '년', [2019, 2020, 2021, 2022, 2023], Y([2019, 2020, 2021, 2022, 2023]), [15, 4, 18, 10, 19], 1, 0, 20, 5, '더 많은'),
    typh:     G('l06', '익힘 73', '연도별 태풍 발생 횟수', '발생 횟수', '회', '년', [2018, 2019, 2020, 2021, 2022], Y([2018, 2019, 2020, 2021, 2022]), [29, 29, 23, 22, 25], 1, 20, 30, 5, '더 많은'),
    dog:      G('l06', '익힘 74', '월별 강아지의 몸무게', '몸무게', 'kg', '월', [7, 8, 9, 10, 11], M([7, 8, 9, 10, 11]), [4, 5, 5, 6, 7], 1, 0, 8, 5, '더 무거운'),
    age:      G('l08', '『수학』 125', '연도별 유소년층과 노년층 인구수', '인구수', '만 명', '년', [2018, 2019, 2020, 2021, 2022], Y([2018, 2019, 2020, 2021, 2022]), [650, 640, 630, 610, 590], 10, 590, 900, 5, '더 많은',
                { names: ['유소년층', '노년층'], v2: [750, 780, 830, 870, 900] }),
    heatcold: G('l08', '익힘 76', '연도별 폭염 일수와 한파 일수', '일수', '일', '년', [2019, 2020, 2021, 2022], Y([2019, 2020, 2021, 2022]), [16, 10, 22, 13], 1, 0, 32, 10, '더 많은',
                { names: ['폭염 일수', '한파 일수'], v2: [11, 9, 19, 31] }),
    plant:    G('l09', '『수학』 126', '월별 식물의 키', '키', 'cm', '월', [4, 5, 6, 7], M([4, 5, 6, 7]), [4, 9, 17, 21], 1, 0, 22, 5, '더 큰'),
    book:     G('l09', '『수학』 126', '월별 책 판매량', '판매량', '권', '월', [5, 6, 7, 8], M([5, 6, 7, 8]), [20, 40, 35, 50], 5, 0, 50, 5, '더 많은'),
    flight:   G('l09', '『수학』 127', '연도별 국제선 운항 횟수', '횟수', '만 회', '년', [2017, 2018, 2019, 2020, 2021], Y([2017, 2018, 2019, 2020, 2021]), [46, 50, 53, 17, 13], 2, 0, 56, 5, '더 많은'),
    temp:     G('l09', '『수학』 128', '시각별 서준이의 체온', '체온', '°C', '시', [7, 8, 9, 10, 11], AM([7, 8, 9, 10, 11]), [36.7, 36.5, 36.6, 36.3, 36.4], 0.1, 36, 36.8, 5, '더 높은'),
    onion:    G('l09', '지도서 409', '날짜별 양파 싹의 길이', '길이', 'cm', '일', [1, 7, 13, 19, 25], Dd([1, 7, 13, 19, 25]), [0, 3, 7, 15, 24], 1, 0, 25, 5, '더 긴')
  };
  var KEYS = Object.keys(D);

  function r1(v) { return Math.round(v * 10) / 10; }
  function num(v) { return String(r1(v)); }
  function vu(v, u) { return num(v) + (/^[A-Za-z°]/.test(u) ? ' ' : '') + u; }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function diff(d, i) { return r1(d.v[i + 1] - d.v[i]); }
  function upOrDown(x) { return x > 0 ? '늘어남' : (x < 0 ? '줄어듦' : '변하지 않음'); }
  function lvl(l) { return ORDER.indexOf(l); }

  /* 그래프 판(무대가 그린다) — 값은 자료 그대로, 강조는 두 접시 색(왼쪽 파랑 · 오른쪽 주황) */
  function graph(d, hl, seriesBoth) {
    var s = [{ name: d.two ? d.two.names[0] : '', v: d.v.slice() }];
    if (d.two && seriesBoth) s.push({ name: d.two.names[1], v: d.two.v2.slice() });
    return { title: d.title, xs: d.xs.slice(), series: s, step: d.step, y0: d.y0, ymax: d.ymax, every: d.every, unit: d.u, xu: d.xu, hl: hl };
  }

  /* 한 그래프 안의 구간 고르기 — 구간 i = (i → i+1) */
  function intervals(d) { var out = []; for (var i = 0; i + 1 < d.v.length; i++) out.push(i); return out; }
  function pairsOf(d, pred) {
    var I = intervals(d), out = [];
    for (var a = 0; a < I.length; a++) for (var b = 0; b < I.length; b++) if (a !== b && pred(I[a], I[b])) out.push([I[a], I[b]]);
    return out;
  }
  function midH(d, i) { return (d.v[i] + d.v[i + 1]) / 2; }
  var MAKE = {
    val: function (d, rng) {
      var n = d.v.length, ps = [];
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) if (a !== b) ps.push([a, b]);
      var eq = ps.filter(function (p) { return d.v[p[0]] === d.v[p[1]]; });
      var p = (eq.length && rng() < 0.3) ? eq[Math.floor(rng() * eq.length)] : ps[Math.floor(rng() * ps.length)];
      var va = d.v[p[0]], vb = d.v[p[1]], ans = va === vb ? 'E' : (va > vb ? 'L' : 'R');
      var big = ans === 'L' ? p[0] : p[1];
      return {
        prompt: '「' + d.title + '」 — ' + KO.j(d.nm[p[0]], '와/과') + ' ' + d.nm[p[1]] + ' 가운데 ' + KO.j(d.vh, '이/가') + ' ' + d.adj + ' 때는?',
        sa: [d.nm[p[0]], ''], sb: [d.nm[p[1]], ''], ra: vu(va, d.u), rb: vu(vb, d.u),
        g: graph(d, [['p', 0, p[0], 'L'], ['p', 0, p[1], 'R']], true), answer: ans, whyAns: 'h', pair: p,
        explain: '세로 눈금 한 칸은 ' + vu(d.step, d.u) + ' — ' + d.nm[p[0]] + ' ' + vu(va, d.u) + ', ' + d.nm[p[1]] + ' ' + vu(vb, d.u) + '. ' +
          (ans === 'E' ? '두 점의 높이가 같아요 — 같아요!' : d.nm[big] + '의 점이 더 높이 있어요.')
      };
    },
    inc: function (d, rng) { return chgQ(d, rng, 'inc', pairsOf(d, function (a, b) { return diff(d, a) > 0 && diff(d, b) > 0; })); },
    chg: function (d, rng) { return chgQ(d, rng, 'chg', pairsOf(d, function (a, b) { return (diff(d, a) > 0) !== (diff(d, b) > 0) && (diff(d, a) !== 0 || diff(d, b) !== 0); })); },
    trap: function (d, rng) { return chgQ(d, rng, 'trap', pairsOf(d, function (a, b) { return midH(d, a) > midH(d, b) && Math.abs(diff(d, a)) < Math.abs(diff(d, b)); })); },
    two: function (d, rng, sub) {
      var A = d.v, B = d.two.v2, nm = d.two.names, n = A.length, ps = [];
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) ps.push([i, j]);
      var p = ps[Math.floor(rng() * ps.length)], i0 = p[0], j0 = p[1];
      if (sub === 'c') {                                                     // 두 자료의 변한 양
        var ca = r1(A[j0] - A[i0]), cb = r1(B[j0] - B[i0]), sw = rng() < 0.5;
        var L = sw ? 1 : 0, ma = Math.abs(sw ? cb : ca), mb = Math.abs(sw ? ca : cb), ans = ma === mb ? 'E' : (ma > mb ? 'L' : 'R');
        var dl = sw ? cb : ca, dr = sw ? ca : cb, nl = nm[L], nr = nm[1 - L];
        return {
          prompt: '「' + d.title + '」 — ' + d.nm[i0] + '부터 ' + d.nm[j0] + '까지 더 많이 변한 쪽은?',
          sa: [nl, ''], sb: [nr, ''], ra: (dl > 0 ? '+' : (dl < 0 ? '−' : '±')) + vu(Math.abs(dl), d.u), rb: (dr > 0 ? '+' : (dr < 0 ? '−' : '±')) + vu(Math.abs(dr), d.u),
          g: graph(d, [['s', L, i0, j0, 'L'], ['s', 1 - L, i0, j0, 'R']], true), answer: ans, whyAns: 'd', pair: [i0, j0], sides: [L, 1 - L], kind: 'two_chg',
          explain: nl + ' ' + vu((L ? B : A)[i0], d.u) + ' → ' + vu((L ? B : A)[j0], d.u) + ' (' + vu(Math.abs(dl), d.u) + ' ' + upOrDown(dl) + ') · ' +
            nr + ' ' + vu((L ? A : B)[i0], d.u) + ' → ' + vu((L ? A : B)[j0], d.u) + ' (' + vu(Math.abs(dr), d.u) + ' ' + upOrDown(dr) + ') — ' +
            (ans === 'E' ? '변한 양이 같아요!' : (ans === 'L' ? nl : nr) + KO.only(ans === 'L' ? nl : nr, '이/가') + ' 더 많이 변했어요.')
        };
      }
      var ga = r1(Math.abs(B[i0] - A[i0])), gb = r1(Math.abs(B[j0] - A[j0])), sw2 = rng() < 0.5;   // 두 해의 차(두 선 사이)
      var a2 = sw2 ? j0 : i0, b2 = sw2 ? i0 : j0, xa = sw2 ? gb : ga, xb = sw2 ? ga : gb, ans2 = xa === xb ? 'E' : (xa > xb ? 'L' : 'R');
      return {
        prompt: '「' + d.title + '」 — ' + KO.j(nm[0], '와/과') + ' ' + nm[1] + '의 차가 더 큰 해는?',
        sa: [d.nm[a2], '두 자료의 차'], sb: [d.nm[b2], '두 자료의 차'], ra: vu(xa, d.u), rb: vu(xb, d.u),
        g: graph(d, [['g', a2, 'L'], ['g', b2, 'R']], true), answer: ans2, whyAns: 'g', pair: [a2, b2], kind: 'two_gap',
        explain: d.nm[a2] + ' ' + vu(Math.max(A[a2], B[a2]), d.u) + ' − ' + vu(Math.min(A[a2], B[a2]), d.u) + ' = ' + vu(xa, d.u) + ' · ' +
          d.nm[b2] + ' ' + vu(Math.max(A[b2], B[b2]), d.u) + ' − ' + vu(Math.min(A[b2], B[b2]), d.u) + ' = ' + vu(xb, d.u) + ' — ' +
          (ans2 === 'E' ? '차가 같아요!' : '두 선 사이가 더 벌어진 ' + KO.ida(d.nm[ans2 === 'L' ? a2 : b2]) + '.')
      };
    }
  };
  function chgQ(d, rng, type, ps) {
    if (!ps.length) return null;
    var eq = ps.filter(function (p) { return Math.abs(diff(d, p[0])) === Math.abs(diff(d, p[1])); });
    var p = (eq.length && rng() < 0.3) ? eq[Math.floor(rng() * eq.length)] : ps[Math.floor(rng() * ps.length)];
    if (rng() < 0.5) p = [p[1], p[0]];                                       // 접시 자리는 반반
    var a = p[0], b = p[1], da = diff(d, a), db = diff(d, b), ma = Math.abs(da), mb = Math.abs(db);
    var ans = ma === mb ? 'E' : (ma > mb ? 'L' : 'R');
    var line = function (i, x) { return vu(d.v[i], d.u) + ' → ' + vu(d.v[i + 1], d.u) + ' (' + vu(Math.abs(x), d.u) + ' ' + upOrDown(x) + ')'; };
    var ask = type === 'inc' ? '어느 쪽이 더 많이 늘어났을까요?' : '어느 쪽이 더 많이 변했을까요?';
    var tail = ans === 'E' ? '변한 양이 같아요 — 같아요!' : (num(Math.max(ma, mb)) + ' > ' + num(Math.min(ma, mb)) + ' — ' + (ans === 'L' ? '왼쪽' : '오른쪽') + '이 더 많이 ' + (type === 'inc' ? '늘어났어요.' : '변했어요.'));
    if (type === 'trap') tail += ' 점이 높다고 더 많이 변한 건 아니에요.';
    if (type === 'chg' && ans !== 'E' && (ans === 'L' ? da : db) < 0) tail += ' 줄어든 것도 변한 거예요.';
    return {
      prompt: '「' + d.title + '」 — ' + ask,
      sa: [d.nm[a], '→ ' + d.nm[a + 1]], sb: [d.nm[b], '→ ' + d.nm[b + 1]], ra: (da > 0 ? '+' : (da < 0 ? '−' : '±')) + vu(ma, d.u), rb: (db > 0 ? '+' : (db < 0 ? '−' : '±')) + vu(mb, d.u),
      g: graph(d, [['s', 0, a, a + 1, 'L'], ['s', 0, b, b + 1, 'R']], false), answer: ans, whyAns: 'd', pair: [a, b],
      explain: '왼쪽 ' + line(a, da) + ' · 오른쪽 ' + line(b, db) + ' — ' + tail
    };
  }

  /* 틀 = (그래프, 갈래) — 갈래가 그 그래프에서 실제로 나올 수 있을 때만 */
  var FRAMES = [];
  KEYS.forEach(function (k) {
    var d = D[k];
    TYPES.forEach(function (t) {
      if (t === 'two' ? !d.two : !!d.two) return;                     // 두 자료 그래프는 두 자료 견주기만(한 자료 물음은 어느 선인지 헷갈림)
      if (t !== 'val' && t !== 'two') { var probe = MAKE[t](d, function () { return 0; }); if (!probe) return; }
      var l = lvl(d.l) > lvl(TYPE_L[t]) ? d.l : TYPE_L[t];
      if (t === 'two') ['c', 'g'].forEach(function (sb) { FRAMES.push({ id: k + ':two_' + sb, key: k, type: t, sub: sb, l: l }); });   // 변한 양 · 두 해의 차
      else FRAMES.push({ id: k + ':' + t, key: k, type: t, l: l });
    });
  });

  function create(params, rng) {
    var upto = params && params.upto, ui = ORDER.indexOf(upto);
    if (upto === 'all' || ui < 0) ui = ORDER.length - 1;
    var cur = upto === 'all' || ORDER.indexOf(upto) < 0 ? null : ORDER[ui];
    var pool = FRAMES.filter(function (f) { return lvl(f.l) <= ui; });
    function deck() {
      var now = cur ? shuffle(rng, pool.filter(function (f) { return f.l === cur; })) : [];
      var rest = shuffle(rng, pool.filter(function (f) { return !cur || f.l !== cur; }));
      [now, rest].forEach(function (seg) {                           // 같은 그래프 연달아 피하기(묶음 안에서 자리 바꿈)
        for (var i = 1; i < seg.length; i++) if (seg[i].key === seg[i - 1].key) {
          for (var j = i + 1; j < seg.length; j++) if (seg[j].key !== seg[i - 1].key && (j + 1 >= seg.length || seg[j + 1].key !== seg[i].key)) { var x = seg[i]; seg[i] = seg[j]; seg[j] = x; break; }
        }
      });
      if (now.length && rest.length && now[now.length - 1].key === rest[0].key) { var k = 1; while (k < rest.length && rest[k].key === rest[0].key) k++; if (k < rest.length) { var y = rest[0]; rest[0] = rest[k]; rest[k] = y; } }
      return now.concat(rest);
    }
    var Q = deck(), qi = 0, last = null;
    return {
      size: pool.length,
      next: function () {
        if (qi >= Q.length) { Q = deck(); qi = 0; if (last && Q[0].key === last) Q.push(Q.shift()); }
        var f = Q[qi++]; last = f.key;
        var q = MAKE[f.type](D[f.key], rng, f.sub);
        q.id = f.id; q.l = f.l; q.type = f.type; q.key = f.key; q.src = D[f.key].src; q.tag = TAG[f.type];
        return q;
      },
      check: function (pick, q) { return pick === q.answer; }
    };
  }

  return {
    id: 'g4_2_change_scale',
    title: '더 많이 변한 쪽은?',
    ORDER: ORDER, TYPES: TYPES, TYPE_L: TYPE_L, D: D, FRAMES: FRAMES,
    create: create,
    printRender: function (q) {
      return '<div class="w-q">' + q.prompt + '</div><span class="w-num">' + q.sa.join(' ') + '</span><span class="w-box">◯</span><span class="w-num">' + q.sb.join(' ') + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '그래프를 보고 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
