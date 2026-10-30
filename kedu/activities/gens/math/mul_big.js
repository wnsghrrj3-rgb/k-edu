/* gens/math/mul_big.js — 큰 수의 곱셈 (3학년 2학기 수학 1단원 「곱셈」 l02~l10)
 * 순수 함수·DOM 무관 (§9-3). 선다 대결·활동지 공유.
 *
 * params: { upto: 'l02'|'l03'|'l04'|'l05'|'l06'|'l07'|'l08'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반.
 *         'all' = l09(몇 배 문제)까지 전부 고르게 (l09·l10 단원 정리).
 *
 * type (§21-3 · 정본 data/g3s2_math_u1.js 차시 그대로 — D22 차시 순서를 뒤집지 않는다):
 *   m3_plain   l02  (세 자리) × (한 자리) — 올림 없음 (0 이 있는 자리 포함)
 *   m3_carry   l03  올림이 한 번 (일 → 십 또는 십 → 백)
 *   m3_chain   l04  올림이 이어서 (두 번 · 답이 네 자리)
 *   tens_tens  l05  곱하는 수가 몇십 (30 × 30 · 14 × 20)
 *   one_x_2d   l06  (몇) × (몇십몇) — 곱하는 수를 갈라요
 *   d2_small   l07  (몇십몇) × (몇십몇) — 답이 1000 보다 작음 (네 덩이 · 두 덩이)
 *   d2_big     l08  (몇십몇) × (몇십몇) — 답이 1000 이상 (밀어 적기)
 *   times_word l09  「몇 배」 문장 → 곱셈식 (걸리버)
 *   estimate   l03·l07·l08  답은 어느 사이에? (정본 l03 s06 · l08 s04 의 「사이」 어림)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」가 실명으로 적은 오류값 (#11 add_sub_3digit 규약):
 *   l02 143 × 2 → 16 (자리값을 떼고 숫자 곱만 더함) · 200 × 4 → 8 (0 이 있는 자리를 비움)
 *   l03 217 × 2 → 424 (올린 1 을 적기만 하고 안 더함)
 *   l04 426 × 3 → 1298 (올린 수를 먼저 더하고 곱함) · 1200 → 120 (자리를 잃음)
 *   l05 30 × 30 → 90 (0 을 하나만) · 14 × 20 → 28 (10배를 잊음)
 *   l06 7 × 16 → 49 (둘째 줄을 밀지 않음)
 *   l07 24 × 13 → 212 (두 덩이만 — 십은 십끼리, 일은 일끼리) · l10 12 × 37 → 314 같은 병
 *   l08 39 × 26 → 312 (39 × 2 = 78 을 밀지 않음)
 *   l09 31 장의 20배 → 51 (「배」를 「더」로 읽음)
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['mul_big'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'];
  var POOL = {
    l02: ['m3_plain'],
    l03: ['m3_carry', 'estimate'],
    l04: ['m3_chain'],
    l05: ['tens_tens'],
    l06: ['one_x_2d'],
    l07: ['d2_small', 'estimate'],
    l08: ['d2_big', 'estimate'],
    l09: ['times_word']
  };
  var TYPES = ['m3_plain', 'm3_carry', 'm3_chain', 'tens_tens', 'one_x_2d',
               'd2_small', 'd2_big', 'times_word', 'estimate'];

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  /* ── 후보 표를 미리 깐다 (재시도 루프는 유형 격리를 보장하지 못한다 — mul_2x1 규약) ── */
  var T = { m3_plain: [], m3_carry: [], m3_chain: [], tens_tens: [], one_x_2d: [],
            d2_small: [], d2_big: [], est3: [], est2: [] };
  function carries(a, m) {
    var h = Math.floor(a / 100), t = Math.floor(a / 10) % 10, o = a % 10;
    var c1 = Math.floor(o * m / 10), c2 = Math.floor((t * m + c1) / 10);
    return { h: h, t: t, o: o, c1: c1, c2: c2, top: h * m + c2 };
  }
  (function build() {
    var a, m, b;
    for (a = 100; a <= 999; a++) {
      for (m = 2; m <= 9; m++) {
        var c = carries(a, m);
        if (!c.c1 && !c.c2 && c.top < 10) T.m3_plain.push([a, m]);
        else if ((c.c1 ? 1 : 0) + (c.c2 ? 1 : 0) === 1 && c.top < 10) T.m3_carry.push([a, m]);
        else if ((c.c1 && c.c2) || c.top >= 10) T.m3_chain.push([a, m]);
        if (a % 100 !== 0) T.est3.push([a, m]);
      }
    }
    for (a = 11; a <= 99; a++) {
      for (b = 20; b <= 90; b += 10) {
        if (a * b <= 3000) T.tens_tens.push([a, b]);
      }
    }
    for (m = 2; m <= 9; m++) for (b = 11; b <= 99; b++) if (b % 10) T.one_x_2d.push([m, b]);
    for (a = 11; a <= 99; a++) {
      if (!(a % 10)) continue;
      for (b = 11; b <= 99; b++) {
        if (!(b % 10)) continue;
        if (a <= 29 && b <= 29 && a * b < 1000) T.d2_small.push([a, b]);
        if (a * b >= 1000) T.d2_big.push([a, b]);
        // 정본 l08 s04 어림: 곱해지는 수는 가까운 몇십, 곱하는 수는 아래·위 몇십 → 답이 그 사이에
        var o = a % 10;
        if (o !== 5 && b >= 21 && a >= 21 && a <= 94) {
          var ra = Math.round(a / 10) * 10, bf = Math.floor(b / 10) * 10, bc = bf + 10;
          if (ra * bf < a * b && a * b < ra * bc) T.est2.push([a, b]);
        }
      }
    }
  }());

  /* ── 오류값 ── */
  function placeLess(a, m) {        // 143 × 2 → 2 + 8 + 6
    return String(a).split('').reduce(function (s, d) { return s + (+d) * m; }, 0);
  }
  function zeroGap(a, m) {          // 302 × 3 → 「96」, 200 × 4 → 「8」 (0 자리를 비움)
    var s = String(a);
    if (s.indexOf('0') < 0) return null;
    var out = s.split('').filter(function (d) { return d !== '0'; }).map(function (d) { return (+d) * m; }).join('');
    return +out;
  }
  function addFirst(a, m) {         // 426 × 3 → 1298 (올린 수를 먼저 더하고 곱함)
    var ds = String(a).split('').map(Number).reverse(), c = 0, out = [];
    for (var i = 0; i < ds.length; i++) {
      var v = (ds[i] + c) * m;
      if (i === ds.length - 1) { out.unshift(String(v)); break; }
      out.unshift(String(v % 10)); c = Math.floor(v / 10);
    }
    return +out.join('');
  }

  function wrongsFor(q) {
    var a = q.a, b = q.b, ans = q.ans, w = [];
    var at, ao, bt, bo;
    switch (q.type) {
      case 'm3_plain':
        if (zeroGap(a, b) != null) w.push(zeroGap(a, b));
        w.push(placeLess(a, b));
        w.push(ans + 100, ans - 100, ans + 10);
        break;
      case 'm3_carry':
        if (q.c1) w.push(ans - q.c1 * 10);           // 올린 수를 안 더함 (십의 자리)
        if (q.c2) w.push(ans - q.c2 * 100);          // 올린 수를 안 더함 (백의 자리)
        w.push(placeLess(a, b), ans + 100, ans - 10);
        break;
      case 'm3_chain':
        w.push(addFirst(a, b));                      // 먼저 더하고 곱함
        if (q.c1) w.push(ans - q.c1 * 10);
        if (q.c2) w.push(ans - q.c2 * 100);
        if (q.c1 > 1) w.push(ans - (q.c1 - 1) * 10); // 올림 수를 1 로만 적음
        w.push(ans - 100, ans + 10);
        break;
      case 'tens_tens':
        w.push(ans / 10, ans * 10);                  // 0 을 하나만 · 10배를 잊음 / 0 을 하나 더
        w.push(ans + b, ans - b, ans + 100);
        break;
      case 'one_x_2d':
        bt = Math.floor(b / 10); bo = b % 10;
        w.push(a * bo + a * bt);                     // 둘째 줄을 밀지 않음 (7 × 16 → 49)
        w.push(a * bo, ans + a * 10, ans - 10, ans + 10);
        break;
      case 'd2_small':
      case 'd2_big':
        at = Math.floor(a / 10); ao = a % 10; bt = Math.floor(b / 10); bo = b % 10;
        if (q.type === 'd2_small') {
          w.push(at * bt * 100 + ao * bo);           // 두 덩이만 (24 × 13 → 212)
          w.push(a * bo + a * bt);                   // 밀지 않음
        } else {
          w.push(a * bo + a * bt);                   // 밀지 않음 (39 × 26 → 312)
          w.push(at * bt * 100 + ao * bo);           // 두 덩이만
        }
        w.push(ans + 100, ans - 10, ans + 10);
        break;
      case 'times_word':
        w.push(q.n + q.k);                           // 「배」를 「더」로
        w = w.concat(wrongsFor({ type: q.base, a: q.a, b: q.b, ans: ans, c1: q.c1, c2: q.c2 }));
        break;
    }
    return w;
  }

  function buildOptions(ans, wrongs, rng) {
    var opts = [String(ans)];
    wrongs.forEach(function (x) {
      var s = String(x);
      if (x > 0 && Math.floor(x) === x && x !== ans && opts.indexOf(s) < 0 && opts.length < 4) opts.push(s);
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 60) {
      var d = ans + (Math.floor(rng() * 7) - 3) * 10 + (Math.floor(rng() * 5) - 2);
      if (d > 0 && d !== ans && opts.indexOf(String(d)) < 0) opts.push(String(d));
    }
    return shuffle(rng, opts);
  }

  /* ── 덩이 줄 (정본 「자리마다 곱한 값을 줄로」 · 「곱하는 수를 갈라요」 표기) ── */
  function partsFor(type, a, b, ans) {
    var p = [];
    if (type === 'm3_plain' || type === 'm3_carry' || type === 'm3_chain') {
      var h = Math.floor(a / 100) * 100, t = (Math.floor(a / 10) % 10) * 10, o = a % 10;
      p.push(h + ' × ' + b + ' = ' + h * b);
      p.push(t + ' × ' + b + ' = ' + t * b);
      p.push(o + ' × ' + b + ' = ' + o * b);
    } else if (type === 'tens_tens') {
      var bt = b / 10;
      p.push(a + ' × ' + bt + ' = ' + a * bt);
      p.push('10배 → ' + a + ' × ' + b + ' = ' + ans);
      return p;
    } else if (type === 'one_x_2d') {
      var t1 = Math.floor(b / 10) * 10, o1 = b % 10;
      p.push(a + ' × ' + t1 + ' = ' + a * t1);
      p.push(a + ' × ' + o1 + ' = ' + a * o1);
    } else {
      var t2 = Math.floor(b / 10) * 10, o2 = b % 10;
      p.push(a + ' × ' + t2 + ' = ' + a * t2);
      p.push(a + ' × ' + o2 + ' = ' + a * o2);
    }
    p.push('모두 더하면 ' + ans);
    return p;
  }

  function D(x) { return KO.ida(x) + '.'; }   // 「…이에요.」 — 문장 끝은 늘 마침표
  function explainFor(q) {
    var a = q.a, b = q.b, ans = q.ans;
    var h, t, o, at, ao, bt, bo;
    switch (q.type) {
      case 'm3_plain':
        h = Math.floor(a / 100) * 100; t = (Math.floor(a / 10) % 10) * 10; o = a % 10;
        if (a % 100 === 0) {
          return KO.j(a, '은/는') + ' 100이 ' + (a / 100) + '개 — ' + (a / 100) + ' × ' + b + ' = ' + KO.ida(a / 100 * b) +
                 '. 0이 있는 자리에는 0을 그대로 써서 ' + D(ans);
        }
        return KO.j(a, '은/는') + ' ' + h + ' + ' + t + ' + ' + D(o) + ' 자리마다 곱하면 ' +
               h * b + ', ' + t * b + ', ' + KO.j(o * b, '이/가') + ' 되고, 더하면 ' + D(ans) +
               (String(a).indexOf('0') >= 0 ? ' 0이 있는 자리에는 0을 그대로 써요.' : ' 숫자만 곱해 더하면 자리값을 잃어요.');
      case 'm3_carry':
        h = Math.floor(a / 100) * 100; t = (Math.floor(a / 10) % 10) * 10; o = a % 10;
        if (q.c1) {
          return o + ' × ' + b + ' = ' + (o * b) + ' → ' + KO.j((o * b) % 10, '을/를') + ' 쓰고 ' + KO.j(q.c1, '을/를') +
                 ' 올려요. 다음 자리 ' + (t / 10) + ' × ' + b + ' = ' + (t / 10 * b) + '에 올린 ' + KO.j(q.c1, '을/를') +
                 ' 꼭 더해야 ' + KO.j(ans, '이/가') + ' 돼요.';
        }
        return o + ' × ' + b + ' = ' + KO.j(o * b, '이라/라') + ' 올림이 없어요. ' + t + ' × ' + b + ' = ' + (t * b) +
               ' — 100이 ' + q.c2 + '개 생겨 ' + KO.j(q.c2, '을/를') + ' 다음 자리로 올려요. ' + h + ' × ' + b + ' = ' + (h * b) + '에 더하면 ' + D(ans);
      case 'm3_chain':
        return '올린 수는 그 자리를 곱한 뒤에 더해요(곱하고 → 더하고). ' + partsFor('m3_chain', a, b, ans).slice(0, 3).map(function (s) {
                 return s.split(' = ')[1]; }).join(' + ') + ' = ' + D(ans) + ' 먼저 더하고 곱하면 ' + KO.j(addFirst(a, b), '이/가') + ' 돼요.';
      case 'tens_tens':
        bt = b / 10;
        return a + ' × ' + bt + ' = ' + D(a * bt) + ' 곱하는 수가 ' + bt + '에서 ' + KO.ro(b) +
               ' 10배가 되었으니 답도 10배 — ' + D(ans) + ' 0 개수만 세지 말고 「몇 배가 되었나」를 봐요.';
      case 'one_x_2d':
        bt = Math.floor(b / 10) * 10; bo = b % 10;
        return KO.j(b, '을/를') + ' ' + KO.j(bt, '와/과') + ' ' + KO.ro(bo) + ' 갈라요. ' + a + ' × ' + bt + ' = ' + KO.j(a * bt, '와/과') + ' ' +
               a + ' × ' + bo + ' = ' + KO.j(a * bo, '을/를') + ' 더하면 ' + D(ans) + ' ' + KO.j(a * bt, '은/는') +
               ' 몇십을 곱한 값이라 한 자리 밀어 적어요.';
      case 'd2_small':
        at = Math.floor(a / 10) * 10; ao = a % 10; bt = Math.floor(b / 10) * 10; bo = b % 10;
        return '덩이가 넷이에요: ' + at + ' × ' + bt + ' = ' + (at * bt) + ', ' + at + ' × ' + bo + ' = ' + (at * bo) + ', ' +
               ao + ' × ' + bt + ' = ' + (ao * bt) + ', ' + ao + ' × ' + bo + ' = ' + (ao * bo) + ' → 모두 더하면 ' + D(ans) +
               ' 큰 덩이와 작은 덩이만 곱하면 가운데 두 덩이가 빠져요.';
      case 'd2_big':
        bt = Math.floor(b / 10) * 10; bo = b % 10;
        return KO.j(b, '을/를') + ' ' + KO.j(bt, '와/과') + ' ' + KO.ro(bo) + ' 갈라요. ' + a + ' × ' + bo + ' = ' + (a * bo) + ', ' +
               a + ' × ' + bt + ' = ' + (a * bt) + ' → ' + (a * bo) + ' + ' + (a * bt) + ' = ' + D(ans) +
               ' 둘째 줄은 ' + KO.j(bt, '을/를') + ' 곱한 값이라 한 자리 밀어 적어요.';
    }
    return '';
  }

  /* ── 문항 만들기 ── */
  function makeCalc(rng, type) {
    var c = pick(rng, T[type]), a = c[0], b = c[1], ans = a * b;
    var q = { type: type, a: a, b: b, ans: ans, c1: 0, c2: 0 };
    if (type.indexOf('m3_') === 0) { var cc = carries(a, b); q.c1 = cc.c1; q.c2 = cc.c2; }
    q.prompt = a + ' × ' + b + ' = ?';
    q.parts = partsFor(type, a, b, ans);
    q.explain = explainFor(q);
    return q;
  }

  /* l09 걸리버 — 정본 s04~s06·s12 낱말 그대로 (가죽·천 장 · 물 잔 · 물고기 마리 · 사과 개) */
  var WORD = [
    { noun: '가죽', unit: '장', ask: function (n, k) { return '가죽이 ' + n + '장 필요한데 걸리버에게는 ' + k + '배가 필요해요. 가죽은 몇 장 필요할까요?'; } },
    { noun: '천', unit: '장', ask: function (n, k) { return '천이 ' + n + '장 필요한데 걸리버에게는 ' + k + '배가 필요해요. 천은 몇 장 필요할까요?'; } },
    { noun: '물', unit: '잔', ask: function (n, k) { return '우리는 물을 하루에 ' + n + '잔 마시는데 걸리버는 ' + k + '배를 마셔요. 걸리버는 물을 몇 잔 마실까요?'; } },
    { noun: '물고기', unit: '마리', ask: function (n, k) { return '우리는 물고기를 ' + n + '마리 먹는데 걸리버는 ' + k + '배를 먹어요. 걸리버는 물고기를 몇 마리 먹을까요?'; } },
    { noun: '사과', unit: '개', ask: function (n, k) { return '우리는 사과를 ' + n + '개 먹는데 걸리버는 ' + k + '배를 먹어요. 걸리버는 사과를 몇 개 먹을까요?'; } }
  ];
  var WORD_BASE = ['m3_carry', 'm3_chain', 'tens_tens', 'one_x_2d', 'd2_small', 'd2_big'];
  function makeWord(rng) {
    var base = pick(rng, WORD_BASE), q = makeCalc(rng, base), w = pick(rng, WORD);
    var n = q.a, k = q.b;                                // 필요한 것 × 몇 배 (정본 s07 「필요한 것 × 몇 배」)
    return {
      type: 'times_word', base: base, a: q.a, b: q.b, n: n, k: k, ans: q.ans, c1: q.c1, c2: q.c2,
      unit: w.unit, noun: w.noun,
      prompt: w.ask(n, k), parts: ['식: ' + n + ' × ' + k].concat(q.parts),
      explain: '「' + k + '배」는 ' + KO.j(n + w.unit, '을/를') + ' ' + k + '번 모으는 것 — 더하기가 아니라 곱셈이에요. ' +
               n + ' × ' + k + ' = ' + q.ans + '(' + w.unit + ').'
    };
  }

  function makeEst(rng, kinds) {
    var kind = pick(rng, kinds), c, a, b, lo, hi, ex;
    if (kind === 'est3') {
      c = pick(rng, T.est3); a = c[0]; b = c[1];
      var hf = Math.floor(a / 100) * 100;
      lo = hf * b; hi = (hf + 100) * b;
      ex = KO.j(a, '은/는') + ' ' + KO.j(hf, '와/과') + ' ' + (hf + 100) + ' 사이 → ' + hf + ' × ' + b + ' = ' + KO.j(lo, '와/과') + ' ' +
           (hf + 100) + ' × ' + b + ' = ' + hi + ' 사이에 답이 있어요(계산하면 ' + (a * b) + ').';
    } else {
      c = pick(rng, T.est2); a = c[0]; b = c[1];
      var ra = Math.round(a / 10) * 10, bf = Math.floor(b / 10) * 10;
      lo = ra * bf; hi = ra * (bf + 10);
      ex = KO.j(a, '을/를') + ' ' + KO.ro(ra) + ', ' + KO.j(b, '을/를') + ' ' + KO.j(bf, '와/과') + ' ' + KO.ro(bf + 10) + ' 보면 ' +
           ra + ' × ' + bf + ' = ' + KO.j(lo, '와/과') + ' ' + ra + ' × ' + (bf + 10) + ' = ' + hi + ' 사이(계산하면 ' + (a * b) + ').';
    }
    var right = lo + '~' + hi, step = hi - lo;
    var cand = [];
    function rng2(l, h) { var t = l + '~' + h; if (l > 0 && t.length <= 9) cand.push(t); }   // 답 버튼 한 줄(§6-2·D38) — 9자 이내
    if (lo % 10 === 0 && hi % 10 === 0) rng2(lo / 10, hi / 10);   // 10배를 잃은 어림
    rng2(lo * 10, hi * 10);                                        // 0 을 하나 더
    rng2(hi, hi + step);
    rng2(lo - step, lo);
    rng2(hi + step, hi + 2 * step);
    rng2(lo - 2 * step, lo - step);
    rng2(lo + step / 2, hi + step / 2);
    var opts = [right];
    cand.forEach(function (t) { if (opts.indexOf(t) < 0 && opts.length < 4) opts.push(t); });
    return {
      type: 'estimate', est: true, a: a, b: b, ans: a * b, lo: lo, hi: hi,
      prompt: a + ' × ' + b + '의 답은 어느 사이에 있을까요?',
      answer: right, options: shuffle(rng, opts),
      parts: [lo + ' < ' + (a * b) + ' < ' + hi],
      explain: ex + ' 어림은 계산하기 전에 답이 놓일 곳을 가늠하는 거예요.'
    };
  }

  return {
    id: 'mul_big',
    title: '큰 수의 곱셈',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, T: T,
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
      var estKinds = [];
      if (all.indexOf('m3_carry') >= 0) estKinds.push('est3');
      if (all.indexOf('d2_small') >= 0) estKinds.push('est2');
      var curCalc = cur.filter(function (t) { return t !== 'estimate'; });
      var count = 0, seen = {};

      function one(type) {
        if (type === 'estimate') return makeEst(rng, estKinds);
        if (type === 'times_word') return makeWord(rng);
        return makeCalc(rng, type);
      }

      return {
        next: function () {
          var type;
          if (count < 2 && curCalc.length) type = pick(rng, curCalc);            // 이번 차시 먼저
          else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
          else type = pick(rng, all);
          count++;
          var q, guard = 0;
          do { q = one(type); } while (seen[q.prompt] && guard++ < 20);
          seen[q.prompt] = 1;
          if (!q.est) {
            q.answer = String(q.ans);
            q.options = buildOptions(q.ans, wrongsFor(q), rng);
          }
          q.shown = [q.a, q.b, q.ans];   // §6-9-7 판에 보이는 수 — 문제 식의 두 수와 공개되는 답
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) {
      if (q.est) return '<span class="w-num">' + q.a + ' × ' + q.b + ' 의 답은</span><span class="w-box"> </span><span class="w-num">사이</span>';
      if (q.type === 'times_word') return '<span class="w-txt">' + q.prompt + '</span><span class="w-box"> </span>';
      return '<span class="w-num">' + q.a + ' × ' + q.b + ' =</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '계산해 □ 안에 알맞은 수를 쓰세요. 어림은 「○~○」처럼 사이를 쓰세요.'
  };
}));
