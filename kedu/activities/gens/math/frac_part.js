/* gens/math/frac_part.js — 분수와 소수 (3학년 2학기 수학 4단원 「분수와 소수」 l02~l10)
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기·활동지 공유.
 *
 * params: { upto: 'l02'|…|'l09'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반.
 *         'all' = l10(분수와 소수 견주기)까지 전부 고르게 (l10 · l11 단원 마무리).
 *
 * l01 은 이 판에 넣지 않는다 — 1학기 분수·소수 되짚기 차시라 3-1 「분수 소수 저울」(g3m_u6_frac_balance)의 자리다.
 *
 * type (§21-3 · 정본 data/g3s2_math_u4.js 차시 그대로 — D22 차시 순서를 뒤집지 않는다):
 *   part_whole     l02  부분은 전체의 얼마 (정본 s07·s08 검은 돌 3 · 흰 돌 4 → 3/7)
 *   group_frac     l02  묶어서 분수로 (정본 s04 8을 2씩 · s06 15를 3씩 9 → 3/5 · s10 12를 2씩 2 → 1/6)
 *   of_count       l03  개수의 분수만큼 (정본 s06·s08·s11 12의 3/4 → 9 · s04 10의 3/5 → 6)
 *   of_len         l04  길이·시간의 분수만큼 (정본 s08 80 cm의 3/4 → 60 · s06 하루 24시간 · s12 30 cm의 1/3)
 *   whole_frac     l05  자연수를 분모가 정해진 분수로 (정본 s09 1 → 6/6 · s12 3 → 15/5)
 *   improper_pick  l05  진분수·가분수 가리기 (정본 s07 8/8 은 가분수 · s11 진분수끼리)
 *   mix_to_imp     l06  대분수 → 가분수 (정본 s05·s08 2·3/4 → 11/4 · s09 2·1/4 → 9/4 · s12 3·2/5 → 17/5)
 *   imp_to_mix     l06  가분수 → 대분수 (정본 s06·s11 5/2 → 2·1/2 · s10 13/8 · s15 15/4 → 3·3/4)
 *   cmp_frac       l07  분모가 같은 분수 가운데 가장 큰(작은) 수 (정본 s05·s08 2·1/5 > 1·4/5 · s06 8/3 > 2·1/3)
 *   dec_count      l08  소수는 0.1이 몇 개 (정본 s08·s09 2.9 → 29 · s12 3.6 → 36 · s15 12.4 → 124)
 *   cm_mm          l08  cm와 mm (정본 s06 4 cm 7 mm = 4.7 cm · s10 4.6 cm → 46 mm)
 *   cmp_dec        l09  소수 가운데 가장 큰 수 · 달리기 가장 빠른 기록 (정본 s04·s08 1.8 < 2.3 · s07 9.8 < 10.1)
 *   cmp_fd         l10  분모가 10인 분수와 소수 견주기 (정본 s08 3·1/10 > 2.8 · s11 3.6 이 가장 큼)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」·watch 가 실명으로 적은 오류값 (#11 오류값 규약):
 *   l02 s08 부분끼리 견줌 3/4 · s04·s15 watch 분모에 낱개 수(8·16) · s06 watch 분자에 낱개 수(9 → 9/5)
 *   l03 s08 분자를 그대로 답(12의 3/4 → 3) · s08 watch 단위분수만큼에서 멈춤 · s04 watch 분자 수만큼 묶음(10을 3묶음)
 *   l04 s08 분모·분자 구실을 바꿈(80을 3부분 중 4부분) · s04 watch 띠를 분자 수만큼 나눔
 *   l05 s08 「분수는 모두 1보다 작다」 · s07 watch 8/8 을 진분수로
 *   l06 s08 2·3/4 → 7/4 · watch 자연수를 분자에 그대로 더함(5/4) · s05 watch 분모까지 바꿈
 *       s06 watch 5/2 → 2와 1/5 · s07 5/2 → 1과 3/2(분수 부분이 진분수 아님)
 *   l07 s08 분수 부분부터 견줌(1·4/5 가 크다)
 *   l08 s08 2.9 → 0.1이 9개 · s05 watch 0.7 cm 를 7 cm 로 · s07 watch 1.4 → 0.1이 4개
 *   l09 s08 소수점 오른쪽 숫자만 견줌(1.8 이 크다) · s15 watch 기록이 큰 사람을 1등
 *   l10 s08 「분수와 소수라 견줄 수 없다」 · s05 watch 분수 부분만 보고 2·5/10 이 크다
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['frac_part'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09', 'l10'];
  var POOL = {
    l02: ['part_whole', 'group_frac'],
    l03: ['of_count'],
    l04: ['of_len'],
    l05: ['whole_frac', 'improper_pick'],
    l06: ['mix_to_imp', 'imp_to_mix'],
    l07: ['cmp_frac'],
    l08: ['dec_count', 'cm_mm'],
    l09: ['cmp_dec'],
    l10: ['cmp_fd']
  };
  var TYPES = ['part_whole', 'group_frac', 'of_count', 'of_len', 'whole_frac', 'improper_pick',
               'mix_to_imp', 'imp_to_mix', 'cmp_frac', 'dec_count', 'cm_mm', 'cmp_dec', 'cmp_fd'];
  var WORDY = { part_whole: 1, group_frac: 1, of_count: 1, of_len: 1, whole_frac: 1, cmp_dec: 0 };
  var CMP = { improper_pick: 1, cmp_frac: 1, cmp_dec: 1, cmp_fd: 1 };

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  /* ── 수 이름표 ── 분수 a/b · 대분수 c·a/b · 소수 x.y (정본 표기 그대로) */
  function F(a, b) { return a + '/' + b; }
  function M(c, a, b) { return c + '·' + a + '/' + b; }
  function Dc(t) { return Math.floor(t / 10) + '.' + (t % 10); }          // 0.1이 t개인 소수
  // 조사는 읽는 끝소리로 고른다 — 분수는 분자(사분의 「삼」), 소수는 끝자리(영 점 「칠」)
  function tail(t) {
    t = String(t);
    if (t.indexOf('/') >= 0) return t.split('/')[0].split('·').pop();
    if (/^\d+\.\d$/.test(t)) return t.slice(-1);
    return t;
  }
  // 분수 뒤 조사는 분자 읽기로 고르되 「」로 감싼다 — 「3/4」은 (빗금 뒤 분모 숫자에 조사가 붙어 보이지 않게, §6-10)
  function Q(t) { return String(t).indexOf('/') >= 0 ? '「' + t + '」' : String(t); }
  function J(t, pair) { return Q(t) + KO.only(tail(t), pair); }
  function IDA(t) { return Q(t) + (KO.batchim(tail(t)) ? '이에요.' : '예요.'); }

  /* ── 후보 표를 미리 깐다 (재시도 루프는 유형 격리를 보장하지 못한다 — mul_2x1 규약) ── */
  var T = { part_whole: [], group_frac: [], of_count: [], of_len: [], whole_frac: [], mix_to_imp: [], imp_to_mix: [],
            dec_count: [], cm_mm: [] };
  var PAIRS = [['검은 돌', '흰 돌'], ['빨간 구슬', '파란 구슬'], ['노란 깃발', '파란 깃발'], ['딸기 사탕', '포도 사탕']];
  var THINGS = [['사탕', '개'], ['구슬', '개'], ['풍선', '개'], ['쿠키', '개'], ['초대장', '장'], ['색종이', '장']];
  (function build() {
    var a, b, c, k, g, h, u, r, x, y;
    for (a = 1; a <= 8; a++) for (b = 1; b <= 8; b++) if (a !== b && a + b <= 12) T.part_whole.push([a, b]);   // 정본 3 · 4
    for (k = 2; k <= 5; k++) for (g = 3; g <= 8; g++) if (k * g <= 30) for (h = 1; h < g; h++) T.group_frac.push([k * g, k, k * h]);
    for (b = 3; b <= 8; b++) for (u = 2; u <= 6; u++) for (a = 2; a < b; a++) T.of_count.push([b * u, a, b]);   // 정본 12 · 3 · 4
    [[2, 'cm'], [3, 'cm'], [4, 'cm'], [5, 'cm'], [6, 'cm'], [4, 'm'], [5, 'm'], [6, 'm']].forEach(function (bu) {
      for (u = 2; u <= 20; u++) {
        var L = bu[0] * u;
        if (L > 100 || (bu[1] === 'm' && L > 40)) continue;
        for (a = 1; a < bu[0]; a++) T.of_len.push([L, a, bu[0], bu[1]]);          // 정본 80 cm · 3/4 · 30 cm · 1/3
      }
    });
    [2, 3, 4, 6, 8, 12].forEach(function (bb) { for (a = 1; a < bb; a++) T.of_len.push([24, a, bb, '시간']); });   // 하루 24시간 (정본 s06 · s12)
    for (k = 1; k <= 4; k++) for (b = 2; b <= 9; b++) T.whole_frac.push([k, b]);   // 정본 1 · 6 / 3 · 5
    for (c = 1; c <= 4; c++) for (b = 2; b <= 9; b++) for (a = 1; a < b; a++) T.mix_to_imp.push([c, a, b]);   // 정본 2·3/4
    for (c = 1; c <= 4; c++) for (b = 2; b <= 9; b++) for (r = 1; r < b; r++) T.imp_to_mix.push([c * b + r, b]);   // 정본 5/2 · 13/8 · 15/4
    for (x = 1; x <= 12; x++) for (y = 1; y <= 9; y++) T.dec_count.push([x, y]);   // 정본 2.9 · 3.6 · 12.4
    for (x = 1; x <= 15; x++) for (y = 1; y <= 9; y++) T.cm_mm.push([x, y]);       // 정본 4 cm 7 mm · 4.6 cm
  }());

  /* ── 선택지 ── 정답 + 오류값(정본 실명 먼저) + 곁 값 채움 */
  function build4(ans, wrongs, fill, rng) {
    var opts = [ans];
    wrongs.forEach(function (w) { if (w != null && w !== ans && opts.indexOf(w) < 0 && opts.length < 4) opts.push(w); });
    var guard = 0;
    while (opts.length < 4 && guard++ < 80) {
      var w = fill(rng);
      if (w != null && w !== ans && opts.indexOf(w) < 0) opts.push(w);
    }
    return shuffle(rng, opts);
  }
  function numFill(ans) {
    return function (rng) { var c = ans + Math.floor(rng() * 9) - 4; return c > 0 ? String(c) : null; };
  }
  function N(x) { return (x == null || x <= 0 || Math.floor(x) !== x) ? null : String(x); }

  /* ── l02 ── */
  function makePart(rng) {
    var c = pick(rng, T.part_whole), a = c[0], b = c[1], P = pick(rng, PAIRS), n = a + b;
    var q = { type: 'part_whole', a: a, b: b, ans: F(a, n) };
    q.prompt = P[0] + ' ' + a + '개와 ' + P[1] + ' ' + b + '개가 있어요. ' + P[0] + '은 전체의 얼마일까요?';
    q.answer = q.ans;
    q.options = build4(q.ans, [F(a, b), F(b, n), F(a, n + 1)], function (r) {
      var t = 1 + Math.floor(r() * (n - 1)); return F(t, n);
    }, rng);
    q.parts = ['전체 ' + a + ' + ' + b + ' = ' + n + '개', P[0] + ' ' + a + '개', '전체의 ' + q.ans];
    q.explain = P[0] + '은 ' + P[1] + '이 아니라 전체 ' + n + '개와 견주어요. 전체 ' + n + '개 중 ' + a + '개라서 ' + IDA(q.ans) +
                ' ' + J(F(a, b), '은/는') + ' 부분끼리 견준 수예요.';
    q.shown = [a, b];
    return q;
  }
  function makeGroup(rng) {
    var c = pick(rng, T.group_frac), tot = c[0], k = c[1], m = c[2], g = tot / k, h = m / k;
    var q = { type: 'group_frac', tot: tot, k: k, m: m, ans: F(h, g) };
    q.prompt = KO.j(tot, '을/를') + ' ' + k + '씩 묶었어요. ' + KO.j(m, '은/는') + ' ' + tot + '의 얼마일까요?';
    q.answer = q.ans;
    q.options = build4(q.ans, [F(m, g), F(h, tot), F(m, tot), F(g - h, g)], function (r) {
      var t = 1 + Math.floor(r() * (g - 1)); return F(t, g);
    }, rng);
    q.parts = [KO.j(tot, '을/를') + ' ' + k + '씩 → ' + g + '묶음', KO.j(m, '은/는') + ' ' + h + '묶음', tot + '의 ' + q.ans];
    q.explain = KO.j(tot, '을/를') + ' ' + k + '씩 묶으면 ' + g + '묶음, ' + KO.j(m, '은/는') + ' 그중 ' + h + '묶음이라 ' + IDA(q.ans) +
                ' 분모와 분자에는 낱개 수가 아니라 묶음 수를 써요.';
    q.shown = [tot, k, m];
    return q;
  }

  /* ── l03 ── */
  function makeOfCount(rng) {
    var c = pick(rng, T.of_count), tot = c[0], a = c[1], b = c[2], u = tot / b, th = pick(rng, THINGS);
    var q = { type: 'of_count', tot: tot, a: a, b: b, ans: u * a, strip: { b: b, a: a, per: u, unit: th[1], tot: tot } };
    q.prompt = th[0] + ' ' + tot + th[1] + '의 ' + J(F(a, b), '은/는') + ' 몇 ' + th[1] + '일까요?';
    q.answer = String(q.ans);
    q.options = build4(q.answer, [N(a), N(u), N(tot / a), N(tot - u * a), N(u + a)], numFill(q.ans), rng);
    q.parts = [tot + ' ÷ ' + b + ' = ' + u + ' (한 묶음)', u + ' × ' + a + ' = ' + q.ans, q.ans + th[1]];
    q.explain = '분모 ' + b + '만큼 묶으면 한 묶음에 ' + u + th[1] + ', 분자 ' + a + '만큼 세면 ' + u + ' × ' + a + ' = ' + IDA(q.ans + th[1]) +
                ' 분자 ' + KO.j(a, '은/는') + ' ' + KO.j(a + th[1], '이/가') + ' 아니라 ' + a + '묶음이에요.';
    q.shown = [tot, a, b];
    return q;
  }

  /* ── l04 ── */
  function makeOfLen(rng) {
    var c = pick(rng, T.of_len), L = c[0], a = c[1], b = c[2], un = c[3], u = L / b;
    var q = { type: 'of_len', L: L, a: a, b: b, unit: un, ans: u * a, strip: { b: b, a: a, per: u, unit: un, tot: L } };
    var sp = un === '시간' ? '' : ' ';
    if (un === '시간') q.prompt = '하루 24시간의 ' + F(a, b) + ' 동안 잠을 잤어요. 몇 시간 잤을까요?';
    else q.prompt = '색 테이프 ' + L + ' ' + un + '의 ' + J(F(a, b), '은/는') + ' 몇 ' + un + '일까요?';
    q.answer = String(q.ans);
    q.options = build4(q.answer, [a > 1 ? N(L / a * b) : null, N(u), N(L - u * a), N(a), a > 1 ? N(L / a) : N(L)], numFill(q.ans), rng);
    q.parts = [L + ' ÷ ' + b + ' = ' + u + ' (한 부분)', u + ' × ' + a + ' = ' + q.ans, q.ans + sp + un];
    q.explain = '분모 ' + b + '만큼 똑같이 ' + b + '부분으로 나누면 한 부분이 ' + u + sp + un + ', 분자 ' + a + '만큼 모으면 ' + IDA(q.ans + sp + un) +
                (a > 1 ? ' ' + a + '부분으로 나누면 분모와 분자의 구실이 바뀌어요.' : '');
    q.shown = [L, a, b];
    return q;
  }

  /* ── l05 ── */
  function makeWhole(rng) {
    var c = pick(rng, T.whole_frac), k = c[0], b = c[1];
    var q = { type: 'whole_frac', k: k, b: b, ans: k * b };
    q.prompt = KO.j(k, '을/를') + ' 분모가 ' + b + '인 분수로 나타내면 분자는 몇일까요?';
    q.answer = String(q.ans);
    q.options = build4(q.answer, [N(k), N(b), N(k + b), N(k * b + 1)], numFill(q.ans), rng);
    q.parts = ['1 = ' + F(b, b), k + ' × ' + b + ' = ' + q.ans, k + ' = ' + F(q.ans, b)];
    q.explain = '1은 ' + J('1/' + b, '이/가') + ' ' + b + '개라서 ' + IDA(F(b, b)) + ' ' + KO.j(k, '은/는') + ' ' + J('1/' + b, '이/가') + ' ' + k + ' × ' + b + ' = ' + q.ans + '개 → ' + IDA(F(q.ans, b));
    q.shown = [k, b];
    return q;
  }
  function makeImproper(rng) {
    var want = rng() < 0.5 ? 'imp' : 'prop', items = [], used = {}, guard = 0;
    function add(a, b) { var t = F(a, b); if (used[t]) return false; used[t] = 1; items.push({ a: a, b: b, t: t, imp: a >= b }); return true; }
    var b0 = 3 + Math.floor(rng() * 7);
    if (want === 'imp') {
      var n0 = rng() < 0.35 ? b0 : b0 + 1 + Math.floor(rng() * 6);       // 정본 s07 8/8 = 가분수
      add(n0, b0);
      while (items.length < 4 && guard++ < 80) { var b = 3 + Math.floor(rng() * 10); add(1 + Math.floor(rng() * (b - 1)), b); }
    } else {
      add(1 + Math.floor(rng() * (b0 - 1)), b0);
      add(b0, b0);                                                         // 덫 — 분자와 분모가 같은 분수(정본 s07 watch)
      while (items.length < 4 && guard++ < 80) { var bb = 2 + Math.floor(rng() * 8); add(bb + 1 + Math.floor(rng() * 6), bb); }
    }
    var best = items[0];
    shuffle(rng, items);
    var q = { type: 'improper_pick', want: want, items: items, best: best };
    q.prompt = (want === 'imp' ? '가분수' : '진분수') + '는 어느 것일까요?';
    q.answer = best.t;
    q.options = items.map(function (o) { return o.t; });
    q.parts = items.map(function (o) { return o.t + (o.imp ? ' → 가분수' : ' → 진분수'); })
      .concat([(want === 'imp' ? '가분수 ' : '진분수 ') + best.t]);
    q.explain = want === 'imp'
      ? '분자가 분모와 같거나 분모보다 큰 분수가 가분수예요. ' + J(best.t, '은/는') + ' 1과 같거나 1보다 커요. 분수가 모두 1보다 작은 것은 아니에요.'
      : '분자가 분모보다 작은 분수가 진분수예요. ' + J(best.t, '이/가') + ' 진분수예요. 분자와 분모가 같은 ' + J(F(b0, b0), '은/는') + ' 1과 같아서 가분수예요.';
    q.shown = items.map(function (o) { return o.a; });
    return q;
  }

  /* ── l06 ── */
  function makeM2I(rng) {
    var c = pick(rng, T.mix_to_imp), w = c[0], a = c[1], b = c[2], n = w * b + a;
    var q = { type: 'mix_to_imp', w: w, a: a, b: b, ans: F(n, b) };
    q.prompt = J(M(w, a, b), '을/를') + ' 가분수로 나타내면?';
    q.answer = q.ans;
    q.options = build4(q.ans, [F(b + a, b), F(w + a, b), w > 1 ? F(n, w * b) : F(n, b + 1), F(n + 1, b)], function (r) {
      var t = n + Math.floor(r() * 7) - 3; return t > b ? F(t, b) : null;
    }, rng);
    q.parts = [w + ' = ' + F(w * b, b), w * b + ' + ' + a + ' = ' + n, M(w, a, b) + ' = ' + q.ans];
    q.explain = '자연수 ' + w + '도 「1/' + b + '」로 바꾸어요. ' + KO.j(w, '은/는') + ' ' + J('1/' + b, '이/가') + ' ' + w * b + '개, ' + J(F(a, b), '은/는') + ' ' + a + '개 → 모두 ' + n + '개라서 ' + IDA(q.ans);
    q.shown = [w, a, b];
    return q;
  }
  function makeI2M(rng) {
    var c = pick(rng, T.imp_to_mix), n = c[0], b = c[1], w = Math.floor(n / b), r = n % b;
    var q = { type: 'imp_to_mix', n: n, b: b, ans: M(w, r, b) };
    q.prompt = J(F(n, b), '을/를') + ' 대분수로 나타내면?';
    q.answer = q.ans;
    q.options = build4(q.ans, [w > 1 ? M(w - 1, r + b, b) : null, M(w, r, n), M(w + 1, r, b), r + 1 < b ? M(w, r + 1, b) : null,
                               r > 1 ? M(w, r - 1, b) : null, M(w + 2, r, b), M(w, r, b + 1)], function (rr) {
      var ww = Math.max(1, w + Math.floor(rr() * 3) - 1), aa = 1 + Math.floor(rr() * (b - 1)); return M(ww, aa, b);
    }, rng);
    q.parts = ['1 = ' + F(b, b), n + ' ÷ ' + b + ' → ' + w + ' 남는 ' + r, F(n, b) + ' = ' + q.ans];
    q.explain = J('1/' + b, '이/가') + ' ' + b + '개씩 모이면 1이에요. ' + n + '개를 ' + b + '개씩 모으면 ' + KO.j(w, '이/가') + ' 되고 ' + J('1/' + b, '이/가') + ' ' + r + '개 남아요 → ' + IDA(q.ans) +
                ' 대분수의 분수 부분은 반드시 진분수예요.';
    q.shown = [n, b];
    return q;
  }

  /* ── l07 ── */
  function makeCmpFrac(rng) {
    var guard = 0, items, want, best, raw, b;
    do {
      b = 3 + Math.floor(rng() * 7); want = rng() < 0.7 ? 'big' : 'small';
      items = []; var used = {};
      var tries = 0;
      while (items.length < 4 && tries++ < 60) {
        var v = b + 1 + Math.floor(rng() * (b * 3 - 2));                  // 1보다 크고 4보다 작은 값(1/b 이 v개)
        if (v % b === 0 || used[v]) continue;
        used[v] = 1;
        var mixed = items.filter(function (o) { return o.mixed; }).length < 2 || rng() < 0.5;
        items.push({ v: v, mixed: mixed, w: Math.floor(v / b), a: v % b, t: mixed ? M(Math.floor(v / b), v % b, b) : F(v, b) });
      }
      if (items.length < 4) continue;
      var byV = items.slice().sort(function (p, q) { return p.v - q.v; });
      best = want === 'big' ? byV[3] : byV[0];
      var mx = items.filter(function (o) { return o.mixed; });
      if (mx.length < 2) continue;
      var byA = mx.slice().sort(function (p, q) { return p.a - q.a; });
      raw = want === 'big' ? byA[byA.length - 1] : byA[0];
      var tie = want === 'big' ? byA[byA.length - 2].a === raw.a : byA[1].a === raw.a;
      // 덫이 서는 판만: 분수 부분부터 견주면 다른 수를 집게 된다(정본 l07 s08 1·4/5 > 2·1/5)
      if (raw !== best && !tie && raw.w !== best.w) break;
    } while (guard++ < 300);
    shuffle(rng, items);
    var q = { type: 'cmp_frac', items: items, want: want, best: best, raw: raw, b: b };
    q.prompt = '분모가 같은 수예요. ' + (want === 'big' ? '가장 큰' : '가장 작은') + ' 수는?';
    q.answer = best.t;
    q.options = items.map(function (o) { return o.t; });
    q.parts = items.map(function (o) { return o.mixed ? o.t + ' = ' + F(o.v, b) : o.t + ' = ' + (o.a ? M(o.w, o.a, b) : o.w); })
      .concat([(want === 'big' ? '가장 큰 수 ' : '가장 작은 수 ') + best.t]);
    q.explain = '대분수는 자연수 부분부터 견주어요. 가분수는 대분수로(또는 대분수를 가분수로) 바꾸어 한 모양으로 맞추면 ' +
                J(best.t, '이/가') + ' ' + (want === 'big' ? '가장 커요.' : '가장 작아요.') + ' 분수 부분만 보면 ' + J(raw.t, '을/를') + ' 고르게 돼요.';
    q.shown = items.map(function (o) { return o.v; });
    return q;
  }

  /* ── l08 ── */
  function makeDecCount(rng) {
    var c = pick(rng, T.dec_count), x = c[0], y = c[1], t = x * 10 + y;
    var q = { type: 'dec_count', x: x, y: y, ans: t };
    q.answer = String(t);
    q.options = build4(q.answer, [N(y), N(x + y), N(x * 10), N(t + 10)], numFill(t), rng);
    q.parts = ['', '', x * 10 + ' + ' + y + ' = ' + t + '개'];
    q.prompt = J(Dc(t), '은/는') + ' 0.1이 몇 개일까요?';
    q.parts[0] = KO.j(x, '은/는') + ' 0.1이 ' + x * 10 + '개';
    q.parts[1] = J('0.' + y, '은/는') + ' 0.1이 ' + y + '개';
    q.explain = '1은 0.1이 10개예요. ' + KO.j(x, '은/는') + ' 0.1이 ' + x * 10 + '개, ' + J('0.' + y, '은/는') + ' ' + y + '개 → 모두 ' + t + '개예요. 소수점 오른쪽 수만 세면 ' + y + '개가 돼 버려요.';
    q.shown = [x, y];
    return q;
  }
  function makeCmMm(rng) {
    var c = pick(rng, T.cm_mm), x = c[0], y = c[1], t = x * 10 + y, toCm = rng() < 0.5;
    var q = { type: 'cm_mm', x: x, y: y, dir: toCm ? 'cm' : 'mm' };
    if (toCm) {
      q.prompt = x + ' cm ' + y + ' mm는 몇 cm일까요?';
      q.answer = Dc(t);
      q.options = build4(q.answer, [String(x) + String(y), y + '.' + x, (x + 1) + '.' + y, x + '.' + (y < 9 ? y + 1 : y - 1)], function (r) {
        var d = Math.max(1, t + Math.floor(r() * 9) - 4); return Dc(d);
      }, rng);
      q.parts = ['1 mm = 0.1 cm', y + ' mm = 0.' + y + ' cm', x + ' cm ' + y + ' mm = ' + q.answer + ' cm'];
      q.explain = '1 mm는 1 cm를 똑같이 10칸으로 나눈 한 칸이라 0.1 cm예요. ' + y + ' mm = 0.' + y + ' cm → ' + IDA(q.answer + ' cm') +
                  ' 소수점을 빼고 ' + String(x) + String(y) + ' cm라고 쓰면 아주 긴 길이가 돼요.';
    } else {
      q.prompt = Dc(t) + ' cm는 몇 mm일까요?';
      q.answer = String(t);
      q.options = build4(q.answer, [N(y), N(x + y), N(x * 100 + y), N(x * 10)], numFill(t), rng);
      q.parts = [x + ' cm = ' + x * 10 + ' mm', '0.' + y + ' cm = ' + y + ' mm', x * 10 + ' + ' + y + ' = ' + t + ' mm'];
      q.explain = '1 cm는 10 mm예요. ' + x + ' cm = ' + x * 10 + ' mm, 0.' + y + ' cm = ' + y + ' mm → ' + IDA(t + ' mm');
    }
    q.shown = [x, y];
    return q;
  }

  /* ── l09 ── */
  function makeCmpDec(rng) {
    var guard = 0, items, run, best, raw;
    do {
      run = rng() < 0.3;                                                   // 달리기 기록 — 작은 수가 빠르다(정본 s07 · s15)
      items = []; var used = {}, tries = 0;
      while (items.length < 4 && tries++ < 60) {
        var x = run ? 8 + Math.floor(rng() * 4) : 1 + Math.floor(rng() * 8), y = Math.floor(rng() * 10), t = x * 10 + y;
        if (y === 0 || used[t]) continue;
        used[t] = 1; items.push({ t: t, x: x, y: y, s: Dc(t) });
      }
      if (items.length < 4) continue;
      var byT = items.slice().sort(function (p, q) { return p.t - q.t; });
      var byY = items.slice().sort(function (p, q) { return p.y - q.y; });
      best = run ? byT[0] : byT[3];
      raw = run ? byY[0] : byY[3];
      var tie = run ? byY[1].y === raw.y : byY[2].y === raw.y;
      // 덫이 서는 판만: 소수점 오른쪽 숫자만 견주면 다른 수(정본 l09 s08 1.8 > 2.3)
      if (raw !== best && !tie && raw.x !== best.x) break;
    } while (guard++ < 300);
    shuffle(rng, items);
    var q = { type: 'cmp_dec', items: items, run: run, best: best, raw: raw, worst: null };
    q.prompt = run ? '50 m 달리기 기록(초)이에요. 가장 빠른 기록은?' : '가장 큰 소수는?';
    q.answer = best.s;
    q.options = items.map(function (o) { return o.s; });
    q.parts = items.map(function (o) { return o.s + ' = 0.1이 ' + o.t + '개'; })
      .concat([(run ? '가장 빠른 기록 ' : '가장 큰 소수 ') + best.s]);
    q.explain = '자연수 부분부터 견주어요. 0.1이 몇 개인지로 보아도 같아요 → ' + J(best.s, '이/가') + ' ' + (run ? '가장 작아요. 걸린 시간이 짧을수록 빨라요.' : '가장 커요.') +
                ' 소수점 오른쪽 숫자만 보면 ' + J(raw.s, '을/를') + ' 고르게 돼요.';
    q.shown = items.map(function (o) { return o.t; });
    return q;
  }

  /* ── l10 ── */
  var SAME = '두 수가 같아요', CANT = '견줄 수 없어요';
  function fdItem(t, asFrac) { var x = Math.floor(t / 10), y = t % 10; return { t: t, x: x, y: y, fr: asFrac, s: asFrac ? M(x, y, 10) : Dc(t) }; }
  function makeCmpFD(rng) {
    var q, guard = 0;
    if (rng() < 0.4) {                                                   // 두 수 — 정본 s08 「분수와 소수라 견줄 수 없다」
      var f, d;
      do {
        f = fdItem(10 + Math.floor(rng() * 80), true); d = fdItem(10 + Math.floor(rng() * 80), false);
      } while ((f.y === 0 || d.y === 0 || f.t === d.t) && guard++ < 100);
      var hi = f.t > d.t ? f : d;
      q = { type: 'cmp_fd', pair: true, items: [f, d], best: hi };
      q.prompt = J(f.s, '와/과') + ' ' + d.s + ' 중 더 큰 수는?';
      q.answer = hi.s;
      q.options = shuffle(rng, [f.s, d.s]).concat([SAME, CANT]);
      q.parts = [f.s + ' = ' + Dc(f.t), Dc(f.t) + (f.t > d.t ? ' > ' : ' < ') + d.s, '더 큰 수 ' + hi.s];
      q.explain = '분모가 10인 분수는 소수로 바꿀 수 있어요. ' + f.s + ' = ' + Dc(f.t) + ' → ' + J(hi.s, '이/가') + ' 더 커요. 분수와 소수도 한쪽 모양으로 바꾸면 견줄 수 있어요.';
      q.shown = [f.t, d.t];
      return q;
    }
    var items, best, raw;
    do {
      items = []; var used = {}, tries = 0;
      while (items.length < 4 && tries++ < 60) {
        var t = 11 + Math.floor(rng() * 78);
        if (t % 10 === 0 || used[t]) continue;
        used[t] = 1; items.push(fdItem(t, items.length < 2));
      }
      if (items.length < 4) continue;
      var byT = items.slice().sort(function (p, q) { return p.t - q.t; });
      var byY = items.slice().sort(function (p, q) { return p.y - q.y; });
      best = byT[3]; raw = byY[3];
      // 덫이 서는 판만: 분수 부분(소수점 오른쪽)만 견주면 다른 수(정본 l10 s05 2·5/10 · s11)
      if (raw !== best && byY[2].y !== raw.y && raw.x !== best.x) break;
    } while (guard++ < 300);
    shuffle(rng, items);
    q = { type: 'cmp_fd', pair: false, items: items, best: best, raw: raw };
    q.prompt = '분수와 소수가 섞여 있어요. 가장 큰 수는?';
    q.answer = best.s;
    q.options = items.map(function (o) { return o.s; });
    q.parts = items.map(function (o) { return o.fr ? o.s + ' = ' + Dc(o.t) : o.s; }).concat(['가장 큰 수 ' + best.s]);
    q.explain = '분모가 10인 분수를 소수로 바꾸어 한 모양으로 맞추고, 자연수 부분부터 견주어요 → ' + J(best.s, '이/가') + ' 가장 커요.' +
                ' 소수점 오른쪽 숫자나 분자만 보면 ' + J(raw.s, '을/를') + ' 고르게 돼요.';
    q.shown = items.map(function (o) { return o.t; });
    return q;
  }

  return {
    id: 'frac_part',
    title: '분수와 소수',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, T: T, SAME: SAME, CANT: CANT,
    typesUpto: function (upto) {
      var end = (upto === 'all' || ORDER.indexOf(upto) < 0) ? ORDER.length - 1 : ORDER.indexOf(upto);
      var out = [];
      for (var i = 0; i <= end; i++) POOL[ORDER[i]].forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); });
      return out;
    },
    create: function (params, rng) {
      var p = params || {};
      var upto = (p.upto && (p.upto === 'all' || ORDER.indexOf(p.upto) >= 0)) ? p.upto : 'all';
      var all = this.typesUpto(upto);
      var cur = upto === 'all' ? all : POOL[upto];
      var count = 0, seen = {};
      var MAKE = {
        part_whole: makePart, group_frac: makeGroup, of_count: makeOfCount, of_len: makeOfLen,
        whole_frac: makeWhole, improper_pick: makeImproper, mix_to_imp: makeM2I, imp_to_mix: makeI2M,
        cmp_frac: makeCmpFrac, dec_count: makeDecCount, cm_mm: makeCmMm, cmp_dec: makeCmpDec, cmp_fd: makeCmpFD
      };
      return {
        next: function () {
          var type;
          if (count < 2) type = pick(rng, cur);                               // 이번 차시 먼저
          else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
          else type = pick(rng, all);
          count++;
          var q, guard = 0;
          do { q = MAKE[type](rng); } while (seen[q.prompt + q.answer] && guard++ < 20);
          seen[q.prompt + q.answer] = 1;
          q.wordy = !!WORDY[q.type];
          q.cmp = !!CMP[q.type];
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) {
      if (q.cmp) return '<span class="w-txt">' + q.prompt + ' (' + q.options.join(' · ') + ')</span><span class="w-box"> </span>';
      return '<span class="w-txt">' + q.prompt + '</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '□ 안에 알맞은 수를 쓰세요. 분수는 「3/4」, 대분수는 「2·3/4」, 소수는 「2.9」처럼 쓰세요.'
  };
}));
