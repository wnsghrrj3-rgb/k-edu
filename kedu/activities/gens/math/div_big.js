/* gens/math/div_big.js — 나눗셈 (3학년 2학기 수학 2단원 「나눗셈」 l02~l10)
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기·활동지 공유.
 *
 * params: { upto: 'l02'|'l03'|'l04'|'l05'|'l06'|'l07'|'l08'|'l09'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반.
 *         'all' = l10(열쇠고리)까지 전부 고르게 (l10·l11 단원 정리).
 *
 * type (§21-3 · 정본 data/g3s2_math_u2.js 차시 그대로 — D22 차시 순서를 뒤집지 않는다):
 *   tens_plain  l02  (몇십) ÷ (몇) — 10 카드째로 나눔 (60 ÷ 3 · 70 ÷ 7)
 *   tens_trade  l03  (몇십) ÷ (몇) — 남은 10 카드를 1 카드 10장으로 바꿈 (30 ÷ 2 · 70 ÷ 5)
 *   td_plain    l04  (몇십몇) ÷ (몇) — 내림 없이 높은 자리부터 (26 ÷ 2 · 93 ÷ 3)
 *   estimate    l04  몫은 어느 사이에? (정본 l04 s06 「10개와 15개 사이」)
 *   td_carry    l05  (몇십몇) ÷ (몇) — 십의 자리에서 남은 수를 내림 (45 ÷ 3 · 87 ÷ 3)
 *   rem         l06  나머지가 있는 나눗셈 — 몫이 한 자리 (25 ÷ 4 = 6 … 1)
 *   rem_carry   l07  내림과 나머지가 있는 나눗셈 (67 ÷ 5 = 13 … 2)
 *   check       l07  확인 식 — 나누는 수 × 몫 + 나머지 = 나누어지는 수 (정본 s16 「어떤 수 ÷ 3 = 21 … 2」)
 *   h3_plain    l08  (세 자리) ÷ (한 자리) — 자리마다 나누어떨어짐 (963 ÷ 3)
 *   h3_zero     l08  몫에 0 이 서는 세 자리 나눗셈 (307 ÷ 3 · 902 ÷ 3) — 몫만 묻는다(정본 「의 몫은」)
 *   h3_carry    l09  백의 자리를 나눌 수 없어 몫이 두 자리 + 나머지 (257 ÷ 4 = 64 … 1)
 *   key_word    l10  열쇠고리 — 몫 = 한 개에 쓰는 수 · 나머지 = 남는 수 (정본 블록 색깔 그대로)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」가 실명으로 적은 오류값 (#11 add_sub_3digit 규약):
 *   l02 60 ÷ 3 → 2 (몫의 0 을 빠뜨림) · s11 80 ÷ 2 → 400 (10배를 두 번)
 *   l03 30 ÷ 2 → 10 (남은 10 카드를 뺌) · s07 watch 70 ÷ 5 → 12 (남은 2 를 일의 자리 몫으로)
 *   l04 26 ÷ 2 → 31 (몫을 일의 자리부터 앞에 적음)
 *   l05 45 ÷ 3 → 11 (남은 1 을 빼고 일의 자리만 나눔)
 *   l06 42 ÷ 5 → 7 … 7 (나머지가 나누는 수보다 큼)
 *   l07 67 ÷ 5 확인을 2 × 13 + 5 로 (나머지와 몫을 곱함) · l11 s05 watch 나머지 빠뜨림 5 × 13
 *   l08 307 ÷ 3 → 12 (몫의 0 을 건너뜀) · l09 s07 615 ÷ 6 → 120 (0 을 끝에) · l11 902 ÷ 3 → 30 (0 을 하나만)
 *   l09 257 ÷ 4 → 63 … 5 (한 번 더 나눌 수 있는데 멈춤)
 *   l10 나머지도 한 개에 더 넣음 → 몫 + 1
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 *
 * 나머지 표기 = 정본 「25 ÷ 4 = 6 … 1」 그대로(… 앞뒤 한 칸).
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['div_big'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09', 'l10'];
  var POOL = {
    l02: ['tens_plain'],
    l03: ['tens_trade'],
    l04: ['td_plain', 'estimate'],
    l05: ['td_carry'],
    l06: ['rem'],
    l07: ['rem_carry', 'check'],
    l08: ['h3_plain', 'h3_zero'],
    l09: ['h3_carry'],
    l10: ['key_word']
  };
  var TYPES = ['tens_plain', 'tens_trade', 'td_plain', 'estimate', 'td_carry', 'rem',
               'rem_carry', 'check', 'h3_plain', 'h3_zero', 'h3_carry', 'key_word'];
  var WORDY = { check: 1, key_word: 1 };

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function R(q, r) { return r ? q + ' … ' + r : String(q); }   // 정본 표기 「6 … 1」
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  /* ── 후보 표를 미리 깐다 (재시도 루프는 유형 격리를 보장하지 못한다 — mul_2x1 규약) ── */
  var T = { tens_plain: [], tens_trade: [], td_plain: [], td_carry: [], rem: [], rem_carry: [],
            check: [], h3_plain: [], h3_zero: [], h3_carry: [], est: [] };
  (function build() {
    var a, d, t, o, h, q, r;
    for (t = 1; t <= 9; t++) for (d = 2; d <= 9; d++) {
      a = t * 10;
      if (t >= d && t % d === 0) T.tens_plain.push([a, d]);
      if (t >= d && t % d !== 0 && a % d === 0) T.tens_trade.push([a, d]);
    }
    for (a = 11; a <= 99; a++) {
      t = Math.floor(a / 10); o = a % 10;
      for (d = 2; d <= 9; d++) {
        q = Math.floor(a / d); r = a % d;
        if (o && t >= d && t % d === 0 && o % d === 0 && r === 0) T.td_plain.push([a, d]);
        if (o && t >= d && t % d !== 0 && r === 0) T.td_carry.push([a, d]);
        if (d >= 3 && q >= 2 && q <= 9 && r > 0) T.rem.push([a, d]);
        // l07 — 십의 자리에서 남는 수가 있거나(내림), 일의 자리 몫이 0 (정본 s11 91 ÷ 9)
        if (t >= d && r > 0 && (t % d !== 0 || o < d)) T.rem_carry.push([a, d]);
        // l04 어림 — 나누는 수로 나누어떨어지는 몇십 둘 사이(정본 s06 20 → 10 · 30 → 15 · l04 s12 60 → 20 · 90 → 30)
        if (r === 0 && t >= d && a % 10) {
          var step = 10 * d / gcd(10, d), lo = Math.floor(a / step) * step, hi = lo + step;
          if (lo > 0 && hi <= 100 && lo < a && a < hi) T.est.push([a, d, lo / d, hi / d]);
        }
      }
    }
    for (d = 3; d <= 9; d++) for (q = 11; q <= 25; q++) for (r = 1; r < d; r++) {
      if (d * q + r <= 99) T.check.push([d, q, r]);
    }
    for (a = 100; a <= 999; a++) {
      h = Math.floor(a / 100); t = Math.floor(a / 10) % 10; o = a % 10;
      for (d = 2; d <= 9; d++) {
        q = Math.floor(a / d); r = a % d;
        var qs = String(q);
        if (t && o && h >= d && h % d === 0 && t % d === 0 && o % d === 0) T.h3_plain.push([a, d]);
        // l08 — 몫이 세 자리이고 몫에 0 이 선다(가운데 · 끝 둘 다 — 정본 307 ÷ 3 = 102 · 902 ÷ 3 = 300)
        if (h >= d && q >= 100 && qs.slice(1).indexOf('0') >= 0) T.h3_zero.push([a, d]);
        // l09 — 백의 자리를 나눌 수 없어 몫이 두 자리, 나머지 있음
        if (h < d && q >= 10 && r > 0) T.h3_carry.push([a, d]);
      }
    }
  }());

  /* ── 오류값 ── */
  function dropCarry(a, d) {         // 자리마다 따로 나누고 남은 수를 버림 (45 ÷ 3 → 11 · 30 ÷ 2 → 10)
    return String(a).split('').map(function (x) { return Math.floor(+x / d); }).join('').replace(/^0+(?=\d)/, '');
  }
  function remAsDigit(a, d) {        // 남은 수를 일의 자리 몫으로 적음 (70 ÷ 5 → 12)
    var t = Math.floor(a / 10);
    return Math.floor(t / d) * 10 + (t % d);
  }
  function noZero(q) { return +String(q).replace(/0/g, '') || null; }          // 307 ÷ 3 → 12
  function zeroEnd(q) {                                                         // 615 ÷ 6 → 120
    var s = String(q), z = s.replace(/[^0]/g, ''), n = s.replace(/0/g, '');
    return n ? +(n + z) : null;
  }
  function oneZero(q) {                                                         // 902 ÷ 3 → 30 (0 을 하나만)
    var s = String(q);
    return /00/.test(s) ? +s.replace('00', '0') : null;
  }

  function numWrongs(q) {
    var a = q.a, d = q.d, ans = q.q, w = [];
    switch (q.type) {
      case 'tens_plain':
        w.push(ans / 10, ans * 10, a / 10);                 // 0 빠뜨림 · 10배 두 번 · 10 카드 장 수
        w.push(ans + 10, ans - 10);
        break;
      case 'tens_trade':
        w.push(Math.floor(a / 10 / d) * 10);                // 남은 10 카드를 뺌 (30 ÷ 2 → 10)
        w.push(remAsDigit(a, d));                           // 남은 수를 일의 자리 몫으로 (70 ÷ 5 → 12)
        w.push(ans % 10, ans + 10, ans - 5, ans + 5);       // 바꾼 뒤 한 곳에 5 만 (s04 watch)
        break;
      case 'td_plain':
      case 'h3_plain':
        w.push(+String(ans).split('').reverse().join(''));  // 몫을 일의 자리부터 앞에 (26 ÷ 2 → 31)
        w.push(Math.floor(ans / 10), ans + 10, ans - 10, ans + 1);
        break;
      case 'td_carry':
        w.push(+dropCarry(a, d));                           // 남은 1 을 빼고 (45 ÷ 3 → 11)
        w.push(remAsDigit(a, d));                           // 남은 수를 몫에 적음 (s05 watch)
        w.push(ans + 10, ans - 1, ans + 1);
        break;
      case 'h3_zero':
        w.push(noZero(ans), zeroEnd(ans), oneZero(ans));
        w.push(ans + 10, ans - 1, ans + 1);
        break;
      case 'check':
        w.push(q.r * q.q + q.d);                            // 나머지와 몫을 곱함 (2 × 13 + 5)
        w.push(q.d * q.q);                                  // 나머지를 빠뜨림 (l11 s05 watch)
        w.push(q.d * q.q - q.r, q.d * q.r + q.q, ans + q.d);
        break;
      case 'key_word':
        if (q.ask === 'per') { w.push(q.q + 1, q.r, q.q - 1, q.q + 10); }   // 나머지도 넣음 (정본 l10)
        else { w.push(0, q.q, q.r + 1, q.d - q.r); }                        // 남는 게 없다고 · 몫과 헷갈림
        break;
    }
    return w;
  }
  function remWrongs(q) {            // 「몫 … 나머지」 오답 — 정본 실명 오류를 앞에
    var a = q.a, d = q.d, k = q.q, r = q.r, w = [];
    w.push([k - 1, r + d]);                                 // 한 묶음을 덜 만듦 (42 ÷ 5 → 7 … 7 · 257 ÷ 4 → 63 … 5)
    if (q.type === 'rem') {
      w.push([k + 1, 0]);                                   // 남은 것을 다발에 끼워 넣음 (l06 s03 watch)
      w.push([k, r + 1], [k - 1, r]);
    } else {
      w.push([+dropCarry(a, d), (a % 10) % d]);              // 남은 수를 내리지 않고 자리마다 따로 (l09 s15 watch)
      if (k % 10 === 0) w.push([k / 10, r]);                // 일의 자리 몫 0 을 빠뜨림 (91 ÷ 9 → 1)
      w.push([k + 1, r], [k, (r + 1) % d || d - 1], [k - 10, r]);
    }
    return w;
  }

  function buildNum(ans, wrongs, rng, zeroOk) {
    var opts = [String(ans)];
    wrongs.forEach(function (x) {
      if (x == null) return;
      var s = String(x);
      if ((x > 0 || (zeroOk && x === 0)) && Math.floor(x) === x && x !== ans && opts.indexOf(s) < 0 && opts.length < 4) opts.push(s);
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 60) {
      var dlt = (Math.floor(rng() * 5) - 2) * 10 + (Math.floor(rng() * 5) - 2);
      var c = ans + dlt;
      if (c > 0 && c !== ans && opts.indexOf(String(c)) < 0) opts.push(String(c));
    }
    return shuffle(rng, opts);
  }
  function buildRem(q, rng) {
    var right = R(q.q, q.r), opts = [right];
    remWrongs(q).forEach(function (p) {
      if (p[0] >= 1 && p[1] >= 0 && opts.length < 4) { var s = R(p[0], p[1]); if (opts.indexOf(s) < 0) opts.push(s); }
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 60) {
      var k = q.q + Math.floor(rng() * 5) - 2, r = Math.floor(rng() * q.d);
      var s = R(k, r);
      if (k >= 1 && opts.indexOf(s) < 0) opts.push(s);
    }
    return shuffle(rng, opts);
  }

  /* ── 덩이 줄 — 정본 세로셈 말 그대로 「높은 자리부터 · 남은 수를 내려」 ── */
  function stepsFor(a, d) {
    var ds = String(a).split('').map(Number), cur = 0, lines = [], started = false, qd = '';
    for (var i = 0; i < ds.length; i++) {
      cur = cur * 10 + ds[i];
      if (!started && cur < d && i < ds.length - 1) continue;      // 백의 자리를 나눌 수 없으면 다음 자리까지 함께 본다
      var k = Math.floor(cur / d), r = cur % d;
      if (started && cur < d) lines.push(cur === 0 ? '0 ÷ ' + d + ' → 몫 0' : KO.j(cur, '은/는') + ' ' + KO.ro(d) + ' 나눌 수 없어요 → 몫에 0');
      else lines.push(cur + ' ÷ ' + d + ' → 몫 ' + k + (r ? ', ' + r + ' 남아요' : ''));
      started = true; qd += k; cur = r;
    }
    return lines;
  }

  function D(x) { return KO.ida(x) + '.'; }
  function explainFor(q) {
    var a = q.a, d = q.d, k = q.q, r = q.r, t = Math.floor(a / 10);
    switch (q.type) {
      case 'tens_plain':
        return KO.j(a, '은/는') + ' 10이 ' + t + '개 — ' + t + ' ÷ ' + d + ' = ' + KO.ida(t / d) + '. 나누어지는 수가 10배면 몫도 10배라서 ' + D(k);
      case 'tens_trade':
        return t + ' ÷ ' + d + ' → 몫 ' + Math.floor(t / d) + ', 10 카드 ' + (t % d) + '장이 남아요. 남은 10 카드는 1 카드 ' + (t % d) * 10 +
               '장으로 바꾸어 다시 나누면 ' + ((t % d) * 10 / d) + ' — 몫은 ' + D(k);
      case 'td_plain':
      case 'h3_plain':
        return '나눗셈은 높은 자리부터 나누고 몫도 그 자리 위에 적어요. ' + stepsFor(a, d).map(function (s) { return s.split(' → 몫 ')[1]; }).join(', ') +
               ' → ' + D(k) + ' 일의 자리부터 앞에 적으면 자리가 뒤바뀌어요.';
      case 'td_carry':
        return t + ' ÷ ' + d + ' → 몫 ' + Math.floor(t / d) + ', ' + (t % d) + ' 남아요. 남은 ' + KO.j(t % d, '을/를') + ' 일의 자리로 내려 ' +
               KO.ro((t % d) * 10 + a % 10) + ' 보고 다시 나누면 ' + ((t % d) * 10 + a % 10) / d + ' — 몫은 ' + D(k);
      case 'rem':
      case 'rem_carry':
      case 'h3_carry':
        return d + ' × ' + k + ' = ' + (d * k) + ', ' + a + ' − ' + (d * k) + ' = ' + KO.ida(r) + '. 나머지 ' + KO.j(r, '은/는') + ' 나누는 수 ' + d +
               '보다 작아야 해요 — 더 크면 한 묶음을 더 만들 수 있어요. ' + a + ' ÷ ' + d + ' = ' + R(k, r) + '.';
      case 'h3_zero':
        return '나눌 수 없는 자리에는 몫에 0을 적어요. ' + stepsFor(a, d).join(' · ') + ' → 몫은 ' + D(k) + ' 0을 빼면 자리가 내려앉아요.';
      case 'check':
        return '확인 식은 나누는 수 × 몫 + 나머지 — ' + d + ' × ' + k + ' = ' + (d * k) + ', ' + (d * k) + ' + ' + r + ' = ' + D(q.n) +
               ' 나머지와 몫을 곱하면 엉뚱한 수가 돼요.';
      case 'key_word':
        return q.n + ' ÷ ' + d + ' = ' + R(k, r) + ' — 몫 ' + KO.j(k, '은/는') + ' 한 개에 쓰는 수, 나머지 ' + KO.j(r, '은/는') + ' 남는 블록이에요. ' +
               '열쇠고리 ' + d + '개에 똑같이 넣을 수 없어 쓰지 못하고 남아요.';
    }
    return '';
  }

  /* ── 문항 만들기 ── */
  function makeCalc(rng, type) {
    var c = pick(rng, T[type]), a = c[0], d = c[1];
    var q = { type: type, a: a, d: d, q: Math.floor(a / d), r: a % d };
    var withRem = type === 'rem' || type === 'rem_carry' || type === 'h3_carry';
    q.prompt = type === 'h3_zero' ? a + ' ÷ ' + d + '의 몫은?' : a + ' ÷ ' + d + ' = ?';
    q.answer = withRem ? R(q.q, q.r) : String(q.q);
    q.options = withRem ? buildRem(q, rng) : buildNum(q.q, numWrongs(q), rng);
    q.parts = stepsFor(a, d).concat(type === 'h3_zero' ? ['몫 ' + q.q] : [a + ' ÷ ' + d + ' = ' + R(q.q, q.r)]);
    q.reveal = a + ' ÷ ' + d + ' = ' + R(q.q, q.r);
    q.explain = explainFor(q);
    return q;
  }
  function makeCheck(rng) {
    var c = pick(rng, T.check), d = c[0], k = c[1], r = c[2], n = d * k + r;
    var q = { type: 'check', a: n, d: d, q: k, r: r, n: n };
    q.prompt = '어떤 수를 ' + KO.ro(d) + ' 나누었더니 몫이 ' + k + ', 나머지가 ' + KO.ida(r) + '. 어떤 수는 얼마일까요?';
    q.answer = String(n);
    q.options = buildNum(n, numWrongs({ type: 'check', a: n, d: d, q: k, r: r }), rng);
    q.parts = ['확인: ' + d + ' × ' + k + ' = ' + (d * k), (d * k) + ' + ' + r + ' = ' + n, n + ' ÷ ' + d + ' = ' + R(k, r)];
    q.explain = explainFor(q);
    return q;
  }
  /* l10 열쇠고리 — 정본 블록 색깔 낱말 그대로 (빨강·검정·흰·주황·초록·노랑·분홍·회색·갈색) */
  var COLOR = ['빨간색', '검은색', '흰색', '주황색', '초록색', '노란색', '분홍색', '회색', '갈색'];
  function makeKey(rng) {
    var d = 3 + Math.floor(rng() * 4), k, r, n, guard = 0;   // 열쇠고리 3~6개 (정본 s13 주사위)
    do {
      k = 11 + Math.floor(rng() * 150); r = 1 + Math.floor(rng() * (d - 1)); n = d * k + r;
    } while ((n > 999 || n < 40) && guard++ < 50);
    var col = pick(rng, COLOR), ask = rng() < 0.6 ? 'per' : 'left';
    var q = { type: 'key_word', a: n, n: n, d: d, q: k, r: r, ask: ask, color: col };
    var head = col + ' 블록 ' + n + '개로 똑같은 열쇠고리 ' + d + '개를 만들어요. ';
    q.prompt = head + (ask === 'per' ? '한 개에 몇 개씩 쓸 수 있을까요?' : '몇 개가 남을까요?');
    q.answer = String(ask === 'per' ? k : r);
    q.options = buildNum(ask === 'per' ? k : r, numWrongs(q), rng, ask === 'left');   // 「0」 = 나머지도 다 넣었다는 생각
    if (ask === 'left' && q.options.length < 4) {                 // 남는 수는 작아서 후보가 모자랄 수 있다
      for (var x = 1; q.options.length < 4 && x < 20; x++) if (q.options.indexOf(String(x)) < 0 && x !== r) q.options.push(String(x));
      shuffle(rng, q.options);
    }
    q.parts = ['식: ' + n + ' ÷ ' + d].concat(stepsFor(n, d)).concat(['한 개에 ' + k + '개씩 · ' + r + '개 남음']);
    q.explain = explainFor(q);
    return q;
  }
  function makeEst(rng) {
    var c = pick(rng, T.est), a = c[0], d = c[1], lo = c[2], hi = c[3], step = hi - lo;
    var right = lo + '~' + hi, cand = [];
    function add(l, h) { var s = l + '~' + h; if (l > 0 && s.length <= 9 && cand.indexOf(s) < 0) cand.push(s); }
    add(lo * 10, hi * 10);                                        // 10배를 잃은 쪽으로 (0 하나 더)
    add(hi, hi + step);
    if (lo - step > 0) add(lo - step, lo);
    add(hi + step, hi + 2 * step);
    add(lo + Math.ceil(step / 2), hi + Math.ceil(step / 2));
    var opts = [right];
    cand.forEach(function (s) { if (opts.indexOf(s) < 0 && opts.length < 4) opts.push(s); });
    var L = lo * d, H = hi * d;
    return {
      type: 'estimate', est: true, a: a, d: d, q: a / d, r: 0, lo: lo, hi: hi,
      prompt: a + ' ÷ ' + d + '의 몫은 어느 사이에 있을까요?',
      answer: right, options: shuffle(rng, opts),
      parts: [lo + ' < ' + (a / d) + ' < ' + hi],
      explain: KO.j(a, '은/는') + ' ' + KO.j(L, '와/과') + ' ' + H + ' 사이 → ' + L + ' ÷ ' + d + ' = ' + KO.j(lo, '와/과') + ' ' + H + ' ÷ ' + d + ' = ' +
               hi + ' 사이에 몫이 있어요(계산하면 ' + (a / d) + '). 어림은 몫이 엉뚱한 곳에 있지 않은지 미리 가늠하는 거예요.'
    };
  }

  return {
    id: 'div_big',
    title: '나눗셈',
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
      var curCalc = cur.filter(function (t) { return t !== 'estimate'; });
      var count = 0, seen = {};

      function one(type) {
        if (type === 'estimate') return makeEst(rng);
        if (type === 'check') return makeCheck(rng);
        if (type === 'key_word') return makeKey(rng);
        return makeCalc(rng, type);
      }

      return {
        next: function () {
          var type;
          if (count < 2 && curCalc.length) type = pick(rng, curCalc);         // 이번 차시 먼저(어림은 뒤에)
          else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
          else type = pick(rng, all);
          count++;
          var q, guard = 0;
          do { q = one(type); } while (seen[q.prompt] && guard++ < 20);
          seen[q.prompt] = 1;
          q.wordy = !!WORDY[q.type];
          q.shown = [q.a, q.d];   // §6-9-7 판에 보이는 수 — 문제 식의 두 수
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) {
      if (q.est) return '<span class="w-num">' + q.a + ' ÷ ' + q.d + ' 의 몫은</span><span class="w-box"> </span><span class="w-num">사이</span>';
      if (q.wordy) return '<span class="w-txt">' + q.prompt + '</span><span class="w-box"> </span>';
      return '<span class="w-num">' + q.a + ' ÷ ' + q.d + ' =</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '계산해 □ 안에 알맞은 수를 쓰세요. 나머지는 「몫 … 나머지」처럼, 어림은 「○~○」처럼 쓰세요.'
  };
}));
