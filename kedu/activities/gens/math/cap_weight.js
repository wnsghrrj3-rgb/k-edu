/* gens/math/cap_weight.js — 들이와 무게 (3학년 2학기 수학 5단원 「들이와 무게」 l02~l10)
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기·활동지 공유.
 *
 * params: { upto: 'l02'|'l03'|'l04'|'l06'|'l07'|'l08'|'l09'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반.
 *         'all' = l09(남김없이 나누어 담기)까지 전부 고르게 (l10 단원 정리).
 *
 * l01 · l05 는 이 판에 넣지 않는다 — 옮겨 담기·양팔저울·바둑돌로 견주는 뜻 차시라 수 판이 서지 않는다.
 *
 * type (§21-3 · 정본 data/g3s2_math_u5.js 차시 그대로 — D22 차시 순서를 뒤집지 않는다):
 *   cap_to_ml   l02  몇 L 몇 mL → mL (정본 s09 3 L 150 mL → 3150 · s11 7 L 50 mL → 7050)
 *   ml_to_cap   l02  mL → 몇 L 몇 mL 의 빈칸 (정본 s10 4800 → 4 · s12 6050 → 6 L 50 mL)
 *   cmp_cap     l02  들이가 가장 많은 것 (정본 s15 1 L 200 mL · 1300 mL · 900 mL)
 *   scale_cap   l03  비커 눈금 읽기 (정본 s05 한 칸 100 mL · 세 번째 눈금 → 300 mL)
 *   est_cap     l03  들이 어림 — 알맞은 단위와 「약」 (정본 s07·s09 어항 약 25 L · s10 약 200 mL)
 *   cap_add     l04  들이의 덧셈 (정본 s04·s08 1 L 300 mL + 2 L 500 mL = 3 L 800 mL)
 *   cap_sub     l04  들이의 뺄셈 (정본 s06 5 L 900 mL − 3 L 300 mL · s07 차 100 mL · s15 받아내림 950 mL)
 *   kg_to_g     l06  몇 kg 몇 g → g (정본 s09 3 kg 600 g → 3600 · s08 3 kg 40 g → 3040)
 *   g_to_kg     l06  g → 몇 kg 몇 g 의 빈칸 (정본 s10 4900 → 4 · s12 6040 → 6 kg 40 g)
 *   t_to_kg     l06  t → kg (정본 s07·s11 1 t = 1000 kg · 4 t → 4000 kg)
 *   scale_wt    l07  저울 눈금 읽기 (정본 l06 s06 한 칸 200 g · l07 s05 한 칸 1 kg → 5 kg)
 *   est_wt      l07  무게 어림 — 알맞은 단위 (정본 s07 자동차 약 1 t · 강아지 약 10 kg · 김치 반 포기 약 500 g · s08 책상)
 *   wt_add      l08  무게의 덧셈 (정본 s04 1 kg 500 g + 2 kg 300 g · s08 1 kg 200 g + 1050 g = 2 kg 250 g)
 *   wt_sub      l08  무게의 뺄셈 (정본 s05 3 kg 800 g − 1 kg 400 g · s15 10 kg − 7 kg 700 g = 2 kg 300 g)
 *   fill_rest   l09  남김없이 나누어 담기 (정본 s10 90 L · 10 L 통 7개 → 5 L 통 4개 · s07 사료 50 kg)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」·watch 가 실명으로 적은 오류값 (#11 오류값 규약):
 *   l02 s11 mL 자리의 0 을 빠뜨림(7 L 50 mL → 750) · watch 1 L 와 1 mL 를 같은 양으로(3 L 150 mL → 153)
 *       watch 6050 mL 를 6 L 500 mL 로 읽음 · s15 watch 1 L 200 mL 를 200 mL 로 읽어 가장 적다고 함
 *   l03 watch 칸 수 3 을 그대로 3 mL 로 · 도구마다 한 칸의 크기가 같다고 여김 · 어항을 25 mL 로 · s10 「약」 자리
 *   l04 s08 1 L 300 mL + 2 L 500 mL = 803 · watch 자리 가리지 않고 빼 50 mL · 차를 1 L 100 mL 로 씀
 *   l06 s08 3 kg 40 g = 3400 g · watch 3 과 40 을 붙여 씀(340) · 6040 g 을 6 kg 400 g 으로 · 1 t 을 1000 g 으로
 *   l07 s08 책상 약 15 g · watch 강아지 약 10 g · 한 칸을 100 g 으로 읽음 · 바늘이 가리키는 칸 수와 무게를 다르게 읽음
 *   l08 s08 1050 g 을 1 kg 500 g 으로 · watch 자리 가리지 않고 빼는 경우 · 10 kg 에서 700 g 을 못 뺌
 *   l09 watch 남은 양을 구하지 않고 통 수를 더함 · 앞에 담은 통을 잊음
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['cap_weight'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l04', 'l06', 'l07', 'l08', 'l09'];
  var POOL = {
    l02: ['cap_to_ml', 'ml_to_cap', 'cmp_cap'],
    l03: ['scale_cap', 'est_cap'],
    l04: ['cap_add', 'cap_sub'],
    l06: ['kg_to_g', 'g_to_kg', 't_to_kg'],
    l07: ['scale_wt', 'est_wt'],
    l08: ['wt_add', 'wt_sub'],
    l09: ['fill_rest']
  };
  var TYPES = ['cap_to_ml', 'ml_to_cap', 'cmp_cap', 'scale_cap', 'est_cap', 'cap_add', 'cap_sub',
               'kg_to_g', 'g_to_kg', 't_to_kg', 'scale_wt', 'est_wt', 'wt_add', 'wt_sub', 'fill_rest'];
  var WORDY = { cmp_cap: 1, scale_cap: 1, est_cap: 1, scale_wt: 1, est_wt: 1, fill_rest: 1 };
  var CMP = { cmp_cap: 1, est_cap: 1, est_wt: 1, t_to_kg: 1 };

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  /* ── 단위 ── 들이 L·mL / 무게 kg·g (정본 표기 그대로 — 수와 단위 사이 한 칸) */
  var CAP = { big: 'L', small: 'mL', name: '들이' }, WT = { big: 'kg', small: 'g', name: '무게' };
  function C(u, a, b) {                     // 몇 L 몇 mL · 몇 kg 몇 g
    if (a > 0 && b > 0) return a + ' ' + u.big + ' ' + b + ' ' + u.small;
    if (a > 0) return a + ' ' + u.big;
    return b + ' ' + u.small;
  }
  // 조사 — 끝 단위의 읽기로 고른다(리터·밀리리터 무받침 · 그램·킬로그램 ㅁ · 톤 ㄴ). 「t」은 ko.js 단위표 밖이라 여기서
  function B(t) { t = String(t); return /\bt$/.test(t) ? true : KO.batchim(t); }
  function J(t, pair) { var s = { '은/는': ['은', '는'], '이/가': ['이', '가'], '을/를': ['을', '를'], '와/과': ['과', '와'] }[pair]; return t + (B(t) ? s[0] : s[1]); }
  function IDA(t) { return t + (B(t) ? '이에요.' : '예요.'); }
  function RA(t) { return t + (B(t) ? '이라서' : '라서'); }
  function RO(t) { t = String(t); return /\bt$/.test(t) ? t + '으로' : KO.ro(t); }
  function NIKKA(t) { return t + (B(t) ? '이니까' : '니까'); }
  function RAGO(t) { return t + (B(t) ? '이라고' : '라고'); }

  /* ── 후보 표를 미리 깐다 (재시도 루프는 유형 격리를 보장하지 못한다 — mul_2x1 규약) ── */
  var T = { to_small: [], to_big: [], add: [], sub: [], borrow: [], whole: [], mixed: [], fill: [] };
  (function build() {
    var a, b, a2, b2;
    for (a = 1; a <= 9; a++) {
      for (b = 5; b <= 95; b += 5) T.to_small.push([a, b]);                       // 정본 7 L 50 mL · 3 kg 40 g (자리에 0)
      for (b = 100; b <= 950; b += 50) T.to_small.push([a, b]);                    // 정본 3 L 150 mL · 3 kg 600 g
    }
    for (a = 1; a <= 9; a++) for (b = 10; b <= 990; b += 10) if (b % 100 !== 0 || b <= 900) T.to_big.push([a, b]);   // 정본 4800 · 6050 · 6040
    for (a = 1; a <= 6; a++) for (a2 = 1; a2 <= 6; a2++) if (a + a2 <= 9)
      for (b = 100; b <= 800; b += 50) for (b2 = 100; b2 <= 800; b2 += 50) if (b + b2 < 1000) T.add.push([a, b, a2, b2]);   // 정본 1 L 300 mL + 2 L 500 mL
    for (a = 1; a <= 9; a++) for (a2 = 1; a2 <= a; a2++)
      for (b = 200; b <= 950; b += 50) for (b2 = 100; b2 < b; b2 += 50) T.sub.push([a, b, a2, b2]);   // 정본 5 L 900 mL − 3 L 300 mL · 1 L 400 mL − 1 L 300 mL
    for (a = 2; a <= 9; a++) for (a2 = 1; a2 < a; a2++)
      for (b = 100; b <= 800; b += 50) for (b2 = b + 50; b2 <= 950; b2 += 50) T.borrow.push([a, b, a2, b2]);   // 정본 2 L 350 mL − 1 L 400 mL
    for (a = 5; a <= 10; a++) for (a2 = 1; a2 <= a - 2; a2++) for (b2 = 100; b2 <= 900; b2 += 100) T.whole.push([a, a2, b2]);   // 정본 l08 s15 10 kg − 7 kg 700 g
    for (a = 1; a <= 5; a++) for (b = 100; b <= 600; b += 100) for (b2 = 10; b2 <= 90; b2 += 10)
      if (b + b2 * 10 < 1000) T.mixed.push([a, b, 1, b2]);                          // 정본 1 kg 200 g + 1050 g
    // 남김없이 나누어 담기 — [전체, 큰 통, 큰 통 수, 가운데 통, 가운데 통 수, 작은 통, 단위] (정본 s04~s07 · s10)
    [50, 60, 70, 80, 90].forEach(function (tot) {
      for (var p = 1; p <= 7; p++) for (var q = 0; q <= 5; q += 5) {
        var r = tot - 10 * p - 6 * q;
        if (r > 0 && r % 5 === 0 && r / 5 <= 7) T.fill.push([tot, 10, p, 6, q, 5, 'L']);
      }
    });
    [40, 50, 60].forEach(function (tot) {
      for (var p = 1; p <= 6; p++) for (var q = 0; q <= 6; q++) {
        var r = tot - 5 * p - 4 * q;
        if (r > 0 && r % 2 === 0 && r / 2 <= 6 && q > 0) T.fill.push([tot, 5, p, 4, q, 2, 'kg']);
      }
    });
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
  function N(x) { return (x == null || x <= 0 || Math.floor(x) !== x) ? null : String(x); }
  function numFill(ans, step) {
    return function (rng) { var c = ans + (Math.floor(rng() * 7) - 3) * step; return c > 0 && c !== ans ? String(c) : null; };
  }
  function cFill(u, a, b) {
    return function (rng) {
      var r = rng();
      if (r < 0.5) { var bb = b + (rng() < 0.5 ? -100 : 100); return bb > 0 && bb < 1000 ? C(u, a, bb) : null; }
      var aa = a + (rng() < 0.5 ? -1 : 1); return aa >= 0 && (aa > 0 || b > 0) ? C(u, aa, b) : null;
    };
  }

  /* ── 바꾸기 (l02 들이 · l06 무게) ── */
  function makeToSmall(rng, u, type) {
    var c = pick(rng, T.to_small);
    var small = T.to_small.filter(function (x) { return x[1] < 100; });
    if (rng() < 0.5 && small.length) c = pick(rng, small);
    var a = c[0], b = c[1], ans = a * 1000 + b;
    var q = { type: type, a: a, b: b, ans: ans };
    q.prompt = C(u, a, b) + ' = □ ' + u.small;
    q.answer = String(ans);
    q.options = build4(q.answer, [
      b < 100 ? N(a * 1000 + b * 10) : null,                 // l06 s08 3 kg 40 g = 3400 · l02 watch 6050 ↔ 6500
      b < 100 ? String(a) + String(b) : null,                // l06 watch 3 과 40 을 붙여 씀 · l02 s11 자리의 0 빠뜨림
      N(a + b),                                              // l02 watch 1 L 와 1 mL 를 같은 양으로
      N(a * 1000)
    ], numFill(ans, b < 100 ? 10 : 100), rng);
    q.parts = (a > 1 ? ['1 ' + u.big + ' = 1000 ' + u.small] : []).concat([a + ' ' + u.big + ' = ' + (a * 1000) + ' ' + u.small,
               (a * 1000) + ' + ' + b + ' = ' + ans, C(u, a, b) + ' = ' + ans + ' ' + u.small]);
    q.explain = (a > 1 ? NIKKA('1 ' + u.big + ' = 1000 ' + u.small) + ' ' + IDA(a + ' ' + u.big + ' = ' + (a * 1000) + ' ' + u.small) : IDA('1 ' + u.big + ' = 1000 ' + u.small)) + ' ' +
                b + ' ' + J(u.small, '을/를') + ' 더하면 ' + ans + ' ' + IDA(u.small) +
                (b < 100 ? ' ' + (a * 1000) + ' + ' + b + ' = ' + ans + ' — ' + String(a) + String(b) + (B(String(b)) ? '이나 ' : '나 ') + (a * 1000 + b * 10) + (B(String(a * 1000 + b * 10)) ? '이' : '가') + ' 아니에요.' : '');
    return q;
  }
  function makeToBig(rng, u, type) {
    var c = pick(rng, T.to_big);
    var small = T.to_big.filter(function (x) { return x[1] < 100; });
    if (rng() < 0.45 && small.length) c = pick(rng, small);
    var a = c[0], b = c[1], n = a * 1000 + b, q = { type: type, a: a, b: b, n: n };
    if (rng() < 0.5) {                                                      // 앞 칸 — 정본 s10 「L 앞에 올 수」
      q.blank = 'big';
      q.prompt = n + ' ' + u.small + ' = □ ' + u.big + ' ' + b + ' ' + u.small;
      q.answer = String(a);
      q.options = build4(q.answer, [N(Math.floor(n / 100)), N(Math.floor(n / 10)), N(a + 1)], numFill(a, 1), rng);
    } else {                                                                // 뒤 칸 — 정본 s12 6050 → 6 L 50 mL
      q.blank = 'small';
      q.prompt = n + ' ' + u.small + ' = ' + a + ' ' + u.big + ' □ ' + u.small;
      q.answer = String(b);
      q.options = build4(q.answer, [
        b < 100 ? N(b * 10) : null,                          // l02 watch 6050 → 6 L 500 mL · l06 watch 6040 → 6 kg 400 g
        N(n), N(n - 1000), b % 10 === 0 ? N(b / 10) : null
      ], numFill(b, b < 100 ? 10 : 100), rng);
    }
    q.parts = ['1000 ' + u.small + ' = 1 ' + u.big, n + ' = ' + (a * 1000) + ' + ' + b, n + ' ' + u.small + ' = ' + C(u, a, b),
               '□ = ' + q.answer];
    q.explain = n + ' ' + u.small + ' = ' + (a * 1000) + ' ' + u.small + ' + ' + b + ' ' + u.small + '이고 1000 ' + J(u.small, '이/가') +
                ' 1 ' + IDA(u.big) + ' 그래서 ' + IDA(C(u, a, b)) +
                (b < 100 ? ' 0 을 빼고 읽으면 ' + RO(C(u, a, b * 10)) + ' 잘못 읽게 돼요.' : '');
    return q;
  }

  /* ── l02 들이 견주기 ── 단위를 mL 로 맞추어 견준다 (정본 s15) */
  function capItem(v, plain) { return { v: v, s: plain ? v + ' mL' : C(CAP, Math.floor(v / 1000), v % 1000), plain: plain, last: plain ? v : v % 1000 }; }
  function makeCmpCap(rng) {
    var items, best, raw, guard = 0;
    do {
      items = []; var used = {}, tries = 0;
      while (items.length < 4 && tries++ < 80) {
        var v = (5 + Math.floor(rng() * 36)) * 50;              // 250 ~ 2000 mL
        var plain = items.length < 2 ? (v < 1000 || rng() < 0.6) : (v >= 1000 && rng() < 0.3);
        if (used[v] || (!plain && (v < 1000 || v % 1000 === 0))) continue;
        used[v] = 1; items.push(capItem(v, plain));
      }
      if (items.length < 4) continue;
      var byV = items.slice().sort(function (p, q) { return p.v - q.v; });
      var byL = items.slice().sort(function (p, q) { return p.last - q.last; });
      best = byV[3]; raw = byL[3];
      // 덫이 서는 판만: 끝 수(mL 앞 수)만 보면 다른 그릇(정본 s15 watch 1 L 200 mL 를 200 mL 로)
      if (!best.plain && raw !== best && byL[2].last !== raw.last) break;
    } while (guard++ < 400);
    shuffle(rng, items);
    var q = { type: 'cmp_cap', items: items, best: best, raw: raw };
    q.prompt = '들이가 가장 많은 것은 어느 것일까요?';
    q.answer = best.s;
    q.options = items.map(function (o) { return o.s; });
    q.parts = items.map(function (o) { return o.plain ? o.s : o.s + ' = ' + o.v + ' mL'; }).concat(['가장 많은 것 ' + best.s]);
    q.explain = '단위를 mL로 맞추어 견주어요 → ' + J(best.s, '이/가') + ' ' + best.v + ' mL로 가장 많아요. ' +
                'L 앞의 수를 빼고 mL 앞의 수만 보면 ' + J(raw.s, '을/를') + ' 고르게 돼요.';
    q.shown = items.map(function (o) { return o.v; });
    return q;
  }

  /* ── 눈금 읽기 (l03 비커 · l07 저울) ── 그림은 눈금만, 수는 묻는 글에 */
  function makeScale(rng, kind) {
    var cap = kind === 'cap';
    var step = cap ? pick(rng, [50, 100, 200]) : pick(rng, [50, 100, 200, 500]);
    var ticks = cap ? (step === 200 ? 5 : 10) : (step === 500 ? 8 : (step === 200 ? 10 : 10));
    var n = 2 + Math.floor(rng() * (ticks - 2));            // 2 ~ ticks-1
    var unit = cap ? 'mL' : 'g', ans = n * step;
    var q = { type: cap ? 'scale_cap' : 'scale_wt', step: step, ticks: ticks, n: n, unit: unit };
    q.prompt = cap ? '이 비커는 눈금 한 칸이 ' + step + ' mL예요. 물의 들이는 몇 mL일까요?'
                   : '이 저울은 눈금 한 칸이 ' + step + ' g이에요. 바늘이 가리키는 무게는 몇 g일까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [
      String(n),                                              // l03 watch 칸 수 3 을 그대로 3 mL 로 · l07 watch 칸 수와 무게를 다르게
      step !== 100 ? String(n * 100) : String(n * 200),      // l03 watch 한 칸의 크기가 같다고 · l06 watch 한 칸을 100 g 으로
      N((n + 1) * step), N((n - 1) * step)
    ], numFill(ans, step), rng);
    q.scale = { kind: kind, ticks: ticks, n: n };
    q.parts = ['한 칸 ' + step + ' ' + unit, (cap ? '물 높이 ' : '바늘 ') + n + '칸', step + ' × ' + n + ' = ' + ans,
               (cap ? '들이 ' : '무게 ') + ans + ' ' + unit];
    q.explain = '먼저 눈금 한 칸의 크기를 봐요. 한 칸이 ' + step + ' ' + unit + '이고 ' + n + '칸이라서 ' + ans + ' ' + IDA(unit) +
                ' 칸 수 ' + J(String(n), '을/를') + ' 그대로 읽으면 안 돼요.';
    return q;
  }

  /* ── 어림 (l03 들이 · l07 무게) ── 정본에 나온 물건과 어림값만 */
  var EST_CAP = [['요구르트병', 65, 'mL'], ['어항', 25, 'L'], ['양치 컵', 200, 'mL'], ['욕조', 200, 'L'], ['양동이', 5, 'L']];
  var EST_WT = [['자동차', 1, 't'], ['코끼리', 3, 't'], ['하마', 2, 't'], ['강아지', 10, 'kg'], ['책상', 15, 'kg'], ['가방', 5, 'kg'],
                ['김치 반 포기', 500, 'g'], ['필통', 400, 'g'], ['사과', 300, 'g'], ['클립', 1, 'g']];
  function makeEst(rng, kind) {
    var cap = kind === 'cap', it = pick(rng, cap ? EST_CAP : EST_WT), v = it[1], u = it[2];
    var units = cap ? ['mL', 'L'] : ['g', 'kg', 't'];
    var others = units.filter(function (x) { return x !== u; });
    var q = { type: cap ? 'est_cap' : 'est_wt', thing: it[0], v: v, unit: u };
    q.prompt = it[0] + '의 ' + (cap ? '들이' : '무게') + '를 어림하여 바르게 나타낸 것은 어느 것일까요?';
    q.answer = '약 ' + v + ' ' + u;
    var wrongs = others.map(function (x) { return '약 ' + v + ' ' + x; });    // l03 watch 어항을 25 mL 로 · l07 s08 책상 약 15 g
    wrongs.push(v + ' ' + u + ' 약', '딱 ' + v + ' ' + u);                       // l03 s10 「약」 자리
    q.options = shuffle(rng, [q.answer].concat(wrongs.slice(0, 3)));
    var why = cap ? (u === 'L' ? '들이가 많아서 큰 단위 L' : '들이가 적어서 작은 단위 mL')
                  : (u === 't' ? '아주 무거워서 t' : u === 'kg' ? '혼자 들 만한 무게라 kg' : '가벼워서 g');
    q.parts = [it[0] + ' — ' + why, '어림한 값 앞에는 「약」', q.answer];
    q.explain = J(it[0], '은/는') + ' ' + RO(why) + ' 나타내요. 어림한 값 앞에는 「약」을 붙여서 ' + IDA(q.answer);
    return q;
  }

  /* ── 덧셈·뺄셈 (l04 들이 · l08 무게) ── 같은 단위끼리 */
  function makeAdd(rng, u, type) {
    var q, c, a1, b1, a2, b2;
    if (type === 'wt_add' && rng() < 0.4) {                                  // 정본 l08 s08 1 kg 200 g + 1050 g
      c = pick(rng, T.mixed); a1 = c[0]; b1 = c[1]; a2 = c[2]; b2 = c[3];
      var g2 = 1000 * a2 + b2, ans = C(u, a1 + a2, b1 + b2);
      q = { type: type, mixed: true, a1: a1, b1: b1, g2: g2 };
      q.prompt = C(u, a1, b1) + ' + ' + g2 + ' ' + u.small + ' = □';
      q.answer = ans;
      q.options = build4(ans, [C(u, a1 + a2, b1 + b2 * 10),                     // l08 s08 1050 g 을 1 kg 500 g 으로
                               N(a1 + b1 + g2) ? (a1 + b1 + g2) + ' ' + u.small : null], cFill(u, a1 + a2, b1 + b2), rng);
      q.parts = [g2 + ' ' + u.small + ' = ' + C(u, a2, b2), u.small + '끼리 ' + b1 + ' + ' + b2 + ' = ' + (b1 + b2),
                 u.big + '끼리 ' + a1 + ' + ' + a2 + ' = ' + (a1 + a2), ans];
      q.explain = RA(g2 + ' ' + u.small + ' = 1000 ' + u.small + ' + ' + b2 + ' ' + u.small) + ' ' + IDA(C(u, a2, b2)) +
                  ' 같은 단위끼리 더하면 ' + IDA(ans) + ' 0 을 빼고 읽으면 ' + RO(C(u, a2, b2 * 10)) + ' 잘못 바꾸게 돼요.';
      return q;
    }
    c = pick(rng, T.add); a1 = c[0]; b1 = c[1]; a2 = c[2]; b2 = c[3];
    var A = C(u, a1 + a2, b1 + b2);
    q = { type: type, a1: a1, b1: b1, a2: a2, b2: b2 };
    q.prompt = C(u, a1, b1) + ' + ' + C(u, a2, b2) + ' = □';
    q.answer = A;
    q.options = build4(A, [String(a1 + a2 + b1 + b2),                             // l04 s08 1 L 300 mL + 2 L 500 mL = 803
                           C(u, a1 + a2, b1 + b2 + (b1 + b2 + 100 < 1000 ? 100 : -100))], cFill(u, a1 + a2, b1 + b2), rng);
    q.parts = [u.small + '끼리 ' + b1 + ' + ' + b2 + ' = ' + (b1 + b2), u.big + '끼리 ' + a1 + ' + ' + a2 + ' = ' + (a1 + a2), A];
    q.explain = J(u.big, '은/는') + ' ' + u.big + '끼리, ' + J(u.small, '은/는') + ' ' + u.small + '끼리 더해요 → ' + IDA(A) +
                ' 수를 모두 더해 ' + RAGO(String(a1 + a2 + b1 + b2)) + ' 하면 단위가 섞여요.';
    return q;
  }
  function makeSub(rng, u, type) {
    var q, c, a1, b1, a2, b2, r = rng();
    if (type === 'wt_sub' && r < 0.2) {                                       // 정본 l08 s15 10 kg − 7 kg 700 g
      c = pick(rng, T.whole); a1 = c[0]; a2 = c[1]; b2 = c[2];
      var A0 = C(u, a1 - a2 - 1, 1000 - b2);
      q = { type: type, whole: true, a1: a1, a2: a2, b2: b2 };
      q.prompt = a1 + ' ' + u.big + ' − ' + C(u, a2, b2) + ' = □';
      q.answer = A0;
      q.options = build4(A0, [C(u, a1 - a2, b2),                               // 자리 가리지 않고 거꾸로 뺌
                              C(u, a1 - a2, 1000 - b2)], cFill(u, a1 - a2 - 1, 1000 - b2), rng);   // 받아내리고 kg 을 안 줄임
      q.parts = [a1 + ' ' + u.big + ' = ' + (a1 - 1) + ' ' + u.big + ' 1000 ' + u.small,
                 u.small + '끼리 1000 − ' + b2 + ' = ' + (1000 - b2), u.big + '끼리 ' + (a1 - 1) + ' − ' + a2 + ' = ' + (a1 - a2 - 1), A0];
      q.explain = a1 + ' ' + u.big + '에서 ' + b2 + ' ' + J(u.small, '을/를') + ' 바로 뺄 수 없으니 ' + a1 + ' ' + J(u.big, '을/를') + ' ' +
                  RO((a1 - 1) + ' ' + u.big + ' 1000 ' + u.small) + ' 바꾸어요 → ' + IDA(A0);
      return q;
    }
    if (r < 0.55) {                                                           // 받아내림 — 정본 l04 s15 2 L 350 mL − 1 L 400 mL
      c = pick(rng, T.borrow); a1 = c[0]; b1 = c[1]; a2 = c[2]; b2 = c[3];
      var A1 = C(u, a1 - a2 - 1, 1000 + b1 - b2);
      q = { type: type, borrow: true, a1: a1, b1: b1, a2: a2, b2: b2 };
      q.prompt = C(u, a1, b1) + ' − ' + C(u, a2, b2) + ' = □';
      q.answer = A1;
      q.options = build4(A1, [C(u, a1 - a2, b2 - b1),                          // l04 watch 자리 가리지 않고 빼 50 mL
                              C(u, a1 - a2, 1000 + b1 - b2)], cFill(u, a1 - a2 - 1, 1000 + b1 - b2), rng);
      q.parts = [b1 + ' − ' + b2 + ' → 1 ' + u.big + ' = 1000 ' + u.small, u.small + '끼리 ' + (1000 + b1) + ' − ' + b2 + ' = ' + (1000 + b1 - b2),
                 u.big + '끼리 ' + (a1 - 1) + ' − ' + a2 + ' = ' + (a1 - a2 - 1), A1];
      q.explain = b1 + ' ' + u.small + '에서 ' + b2 + ' ' + J(u.small, '을/를') + ' 뺄 수 없으니 1 ' + J(u.big, '을/를') + ' ' + RO('1000 ' + u.small) +
                  ' 바꾸어 ' + (1000 + b1) + ' − ' + b2 + ' = ' + (1000 + b1 - b2) + ' → ' + IDA(A1) +
                  ' 아래 수에서 위 수를 거꾸로 빼면 ' + J(C(u, a1 - a2, b2 - b1), '이/가') + ' 돼요.';
      return q;
    }
    c = pick(rng, T.sub); a1 = c[0]; b1 = c[1]; a2 = c[2]; b2 = c[3];
    var A2 = C(u, a1 - a2, b1 - b2);
    q = { type: type, a1: a1, b1: b1, a2: a2, b2: b2 };
    q.prompt = C(u, a1, b1) + ' − ' + C(u, a2, b2) + ' = □';
    q.answer = A2;
    q.options = build4(A2, [a1 === a2 ? C(u, a1, b1 - b2) : null,               // l04 watch 차를 1 L 100 mL 로
                            String((a1 - a2) + (b1 - b2))], cFill(u, a1 - a2, b1 - b2), rng);
    q.parts = [u.small + '끼리 ' + b1 + ' − ' + b2 + ' = ' + (b1 - b2), u.big + '끼리 ' + a1 + ' − ' + a2 + ' = ' + (a1 - a2), A2];
    q.explain = J(u.small, '은/는') + ' ' + u.small + '끼리, ' + J(u.big, '은/는') + ' ' + u.big + '끼리 빼요 → ' + IDA(A2) +
                (a1 === a2 ? ' ' + u.big + '끼리 빼면 0 이라서 ' + J(u.big, '은/는') + ' 쓰지 않아요.' : '');
    return q;
  }

  /* ── t (l06 s07·s11) ── */
  function makeT(rng) {
    var k = 2 + Math.floor(rng() * 8);
    var q = { type: 't_to_kg', k: k };
    q.prompt = J(k + ' t', '은/는') + ' 몇 kg일까요?';
    q.answer = (k * 1000) + ' kg';
    q.options = shuffle(rng, [q.answer, (k * 1000) + ' g', (k * 100) + ' kg', (k * 10) + ' kg']);   // l06 watch 1 t 을 1000 g 으로
    q.parts = ['1 t = 1000 kg', '1000 kg이 ' + k + '번', q.answer];
    q.explain = '1 t = 1000 kg이에요. ' + k + ' t은 1000 kg이 ' + k + '번이라서 ' + IDA(q.answer) + ' 1000 g이 아니라 1000 kg이에요.';
    return q;
  }

  /* ── l09 남김없이 나누어 담기 ── */
  function makeFill(rng) {
    var c = pick(rng, T.fill), tot = c[0], s1 = c[1], p = c[2], s2 = c[3], q2 = c[4], s3 = c[5], u = c[6];
    var used = s1 * p + s2 * q2, rest = tot - used, ans = rest / s3;
    var box = u === 'L' ? '통' : '봉지', what = u === 'L' ? '우유' : '사료';
    var q = { type: 'fill_rest', tot: tot, p: p, q: q2, rest: rest, unit: u };
    q.prompt = what + ' ' + J(tot + ' ' + u, '을/를') + ' ' + s1 + ' ' + u + ' ' + box + ' ' + p + '개' +
               (q2 ? ', ' + s2 + ' ' + u + ' ' + box + ' ' + q2 + '개' : '') + '에 담았어요. 남은 ' + what + '를 ' + s3 + ' ' + u + ' ' + box +
               '에 남김없이 담으려면 몇 개가 필요할까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [
      N(rest),                                                 // 남은 양을 그대로 답
      N(p + q2),                                               // l09 watch 통 수를 더함
      N(tot / s3), q2 ? N((tot - s1 * p) / s3) : null          // 앞에 담은 통을 잊음
    ], numFill(ans, 1), rng);
    q.parts = [s1 + ' × ' + p + (q2 ? ' + ' + s2 + ' × ' + q2 : '') + ' = ' + used + ' ' + u, tot + ' − ' + used + ' = ' + rest + ' ' + u,
               rest + ' ÷ ' + s3 + ' = ' + ans, s3 + ' ' + u + ' ' + box + ' ' + ans + '개'];
    q.explain = '먼저 담은 양 ' + used + ' ' + J(u, '을/를') + ' 빼면 ' + rest + ' ' + J(u, '이/가') + ' 남아요. ' + rest + ' ' + J(u, '을/를') + ' ' +
                s3 + ' ' + u + '씩 담으면 ' + ans + '개 → 더해 보면 ' + used + ' + ' + rest + ' = ' + tot + ' ' + IDA(u);
    return q;
  }

  return {
    id: 'cap_weight',
    title: '들이와 무게',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, T: T, EST_CAP: EST_CAP, EST_WT: EST_WT, CAP: CAP, WT: WT, C: C,
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
        cap_to_ml: function (r) { return makeToSmall(r, CAP, 'cap_to_ml'); },
        ml_to_cap: function (r) { return makeToBig(r, CAP, 'ml_to_cap'); },
        cmp_cap: makeCmpCap,
        scale_cap: function (r) { return makeScale(r, 'cap'); },
        est_cap: function (r) { return makeEst(r, 'cap'); },
        cap_add: function (r) { return makeAdd(r, CAP, 'cap_add'); },
        cap_sub: function (r) { return makeSub(r, CAP, 'cap_sub'); },
        kg_to_g: function (r) { return makeToSmall(r, WT, 'kg_to_g'); },
        g_to_kg: function (r) { return makeToBig(r, WT, 'g_to_kg'); },
        t_to_kg: makeT,
        scale_wt: function (r) { return makeScale(r, 'wt'); },
        est_wt: function (r) { return makeEst(r, 'wt'); },
        wt_add: function (r) { return makeAdd(r, WT, 'wt_add'); },
        wt_sub: function (r) { return makeSub(r, WT, 'wt_sub'); },
        fill_rest: makeFill
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
    printHead: '□ 안에 알맞은 수나 말을 쓰세요. 들이는 「3 L 800 mL」, 무게는 「2 kg 250 g」처럼 쓰세요.'
  };
}));
