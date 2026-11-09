/* gens/math/g6_2_ratio_sort.js — 비율이 같은 비끼리 (6학년 2학기 수학 4단원 「비례식과 비례배분」 l02 · l03 · l04 · l05 · l10 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). sort 장르 계약(g4_2_move_sort·plane_shape 와 같음): deal() → round, binOf(item, by) → bin key, reasonOf(item, by, wantKo).
 *
 * params: { by: 'same'|'simple'|'prop'|'mix', per: 4|6 }
 *   한 판(round) = 한 유형 — 「어느 성질에서 흔들리는지」가 byType 으로 남는다(move_sort 와 같은 원칙).
 *
 * 카드 = 교과서·『수학익힘』·지도서(수업 전 확인 문제·풀이·읽기 자료)에 있는 비와 비례식만(아래 표 · 줄마다 쪽).
 *   바구니(same·simple) = 가장 간단한 자연수의 비. 카드가 들어갈 바구니는 **생성기가 분수 셈으로** 정한다(비율 = 전항 ÷ 후항을 기약분수로) —
 *   지도서 273 「가장 간단하지 않아도 정답」: 바구니는 비율이 같은 비를 모으는 곳이라 덜 나눈 비(21：56)도 3：8 바구니에 들어간다.
 *   비례식(prop) 바구니 = 「비례식이에요」/「비례식이 아니에요」 — 외항의 곱과 내항의 곱을 분수로 셈해 정한다(지도서 281: 아닌 이유는 성질로).
 *
 * type (§21-3 · 교과서 차시 그대로):
 *   same    l02  비의 성질 — 전항과 후항에 0이 아닌 같은 수를 곱하거나 나누어도 비율은 같다(『수학』 80~81 · 익힘 57 · 84~85)
 *   simple  l03  소수·분수의 비 → 간단한 자연수의 비(『수학』 82~83 · 익힘 59 · 96 마무리 2 · 지도서 수업 전·풀이)
 *   prop    l04·l05  비례식일까 — 비율이 같은 두 비를 등호로 이은 식 · 외항의 곱 = 내항의 곱(『수학』 84~87 · 익힘 61·63 · 96 마무리 3 · 지도서 수업 전·277 오류 유형)
 * 한 판 안에서 바구니는 서로 다른 비 — 카드마다 들어갈 바구니는 정확히 하나.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g6_2_ratio_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ── 분수 셈(정수 쌍 [분자, 분모]) ──
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function Q(n, d) { if (d === undefined) d = 1; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return [n / g, d / g]; }
  function parse(s) {   // '12' · '2.1' · '3/40' · '1 1/5'
    s = String(s).trim(); var m;
    if ((m = s.match(/^(\d+) (\d+)\/(\d+)$/))) return Q(+m[1] * +m[3] + +m[2], +m[3]);
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return Q(+m[1], +m[2]);
    if ((m = s.match(/^(\d+)\.(\d+)$/))) return Q(+(m[1] + m[2]), Math.pow(10, m[2].length));
    if (/^\d+$/.test(s)) return Q(+s, 1);
    throw new Error('수 모름: ' + s);
  }
  function mul(a, b) { return Q(a[0] * b[0], a[1] * b[1]); }
  function div(a, b) { return Q(a[0] * b[1], a[1] * b[0]); }
  function eq(a, b) { return a[0] === b[0] && a[1] === b[1]; }
  function fstr(a) {   // 값 → 글(자연수 · 유한소수는 소수 · 아니면 분수)
    if (a[1] === 1) return String(a[0]);
    var t = a[1]; while (t % 2 === 0) t /= 2; while (t % 5 === 0) t /= 5;
    if (t === 1) { var k = 0, n = a[0], d = a[1]; while ((n * Math.pow(10, k)) % d !== 0) k++; return (n * Math.pow(10, k) / d / Math.pow(10, k)).toFixed(k); }
    return a[0] + '/' + a[1];
  }
  function dp(s) { s = String(s); return /^\d+\.\d+$/.test(s) ? s.split('.')[1].length : 0; }
  function isFr(s) { return /\//.test(String(s)); }
  // 조사 — 수의 끝소리(끝 자리 · 0 끝 = 십·백·천 받침)로
  function endK(n) { var t = String(n), m = t.match(/(\d+)\/\d+$/), d = (m ? m[1] : t).slice(-1);   // 분수는 분자 소리(3/4 = 사분의 삼)
    return '2459'.indexOf(d) >= 0 ? 'v' : '178'.indexOf(d) >= 0 ? 'r' : 'b'; }
  function ro(n) { return n + (endK(n) === 'b' ? '으로' : '로'); }
  function eul(n) { return n + (endK(n) === 'v' ? '를' : '을'); }
  function gwa(n) { return n + (endK(n) === 'v' ? '와' : '과'); }
  function ira(n) { return n + (endK(n) === 'v' ? '라' : '이라'); }
  function simpOf(a, b) { var r = div(parse(a), parse(b)); return r[0] + '：' + r[1]; }   // 가장 간단한 자연수의 비

  // ── 교과서 카드 ──
  // same: 자연수의 비(교과서가 적은 대로) — 바구니 = 가장 간단한 자연수의 비
  var SAME = [
    ['4', '6', '『수학』 80쪽 꽃다발 2개'], ['6', '9', '『수학』 80쪽 꽃다발 3개'], ['14', '21', '지도서 279 수업 전'],
    ['35', '10', '『수학』 81쪽 문제 2'], ['12', '20', '『수학』 81쪽 문제 2'], ['45', '18', '『수학』 81쪽 문제 3'], ['90', '36', '『수학』 81쪽 문제 3'],
    ['35', '14', '『수학』 96쪽 마무리 1'], ['10', '4', '『수학』 87쪽 퀴즈 3'],
    ['6', '4', '『수학익힘』 57쪽 5번'], ['12', '8', '『수학익힘』 57쪽 5번'], ['48', '32', '『수학』 84쪽 문제 2'],
    ['32', '18', '『수학익힘』 57쪽 6번'], ['4', '2', '『수학』 79쪽 비눗방울 용액'], ['6', '3', '『수학익힘』 61쪽 6번'], ['24', '12', '『수학익힘』 61쪽 6번'],
    ['16', '10', '『수학』 84쪽 철새 사진'], ['14', '18', '『수학』 84쪽 문제 2'], ['56', '21', '『수학』 85쪽 문제 3'],
    ['6', '8', '『수학』 85쪽 퀴즈 4'], ['9', '12', '『수학익힘』 61쪽 5번'], ['20', '15', '『수학익힘』 57쪽 6번 나 화면'], ['12', '9', '『수학』 86쪽 8：6 = 12：9'],
    ['10', '14', '『수학』 86쪽 태양 고도'], ['9', '33', '『수학』 96쪽 마무리 1'], ['18', '22', '지도서 279 수업 전']
  ];
  // simple: 소수·분수·섞인 비와 덜 나눈 자연수의 비 — 바구니 = 가장 간단한 자연수의 비
  var SIMPLE = [
    ['2.1', '5.6', '『수학』 82쪽 해바라기씨'], ['21', '56', '『수학』 82쪽'], ['1/6', '1/4', '『수학』 82쪽'],
    ['28', '63', '『수학』 83쪽 문제 3'], ['0.8', '0.4', '『수학』 83쪽 문제 3'], ['2.5', '3', '『수학』 83쪽 문제 3'], ['25', '30', '『수학』 83쪽 문제 3 풀이'], ['2/3', '3/7', '『수학』 83쪽 문제 3'],
    ['0.7', '2/5', '『수학』 83쪽 문제 4'], ['0.7', '0.4', '『수학』 83쪽 문제 4'], ['7/10', '2/5', '『수학』 83쪽 문제 4'],
    ['1.4', '1 1/5', '『수학익힘』 59쪽 5번'], ['1.4', '1.2', '지도서 273 풀이'], ['14', '12', '지도서 273 풀이'],
    ['0.1', '0.8', '『수학익힘』 59쪽 6번 희우'], ['3/40', '3/5', '『수학익힘』 59쪽 6번 준기'], ['3', '24', '지도서 273 풀이'],
    ['0.8', '1.6', '지도서 275 수업 전'], ['0.5', '15/8', '지도서 275 수업 전'],
    ['54', '27', '『수학』 96쪽 마무리 2'], ['3.5', '4.9', '『수학』 96쪽 마무리 2'], ['1/3', '3/11', '『수학』 96쪽 마무리 2'],
    ['3/4', '0.8', '『수학』 96쪽 마무리 2'], ['0.75', '0.8', '지도서 295 풀이'], ['75', '80', '지도서 295 풀이'],
    ['12000', '8000', '『수학』 94쪽 사용료'], ['1500', '600', '『수학』 98쪽 마무리 7'], ['2.5', '15', '『수학』 89쪽 첨성대 사진']
  ];
  // prop: [전항, 후항, 전항, 후항] — 교과서·익힘·지도서에 있는 식 그대로(비례식이 아닌 것도 교과서가 낸 식)
  var PROP = [
    ['8', '5', '16', '10', '『수학』 84쪽 철새 사진'], ['7', '9', '14', '18', '『수학』 84쪽 문제 2'], ['48', '32', '3', '2', '『수학』 84쪽 문제 2'], ['56', '21', '8', '3', '『수학』 85쪽 문제 3'],
    ['4', '3', '1/9', '1/12', '『수학』 85쪽 퀴즈 4'], ['2', '5', '1.4', '3.5', '『수학』 85쪽 퀴즈 4'], ['6', '8', '9', '12', '『수학익힘』 61쪽 5번'],
    ['5', '7', '10', '14', '『수학』 86쪽 태양 고도'], ['8', '6', '12', '9', '『수학』 86쪽'], ['5', '2', '10', '4', '『수학』 87쪽 퀴즈 3'], ['9', '12', '3', '4', '『수학』 87쪽 퀴즈 3'],
    ['9', '11', '18', '22', '지도서 279 수업 전'], ['4', '7', '2.8', '4.9', '지도서 279 수업 전'], ['500', '40', '150', '12', '지도서 283 수업 전'], ['8', '7', '2.4', '2.1', '『수학』 96쪽 마무리 3'],
    ['2', '5', '4', '15', '『수학익힘』 61쪽 6번'], ['7', '14', '6', '13', '『수학』 87쪽 퀴즈 3'], ['13', '8', '5', '3', '『수학』 87쪽 퀴즈 3'],
    ['21', '28', '3', '7', '『수학익힘』 63쪽 6번'], ['7', '22', '3', '11', '지도서 283 수업 전'], ['2', '5', '6', '9', '지도서 277 오류 유형']
  ];

  var ROUNDS = {
    same: { ko: '비율이 같은 비', l: 'l02', prompt: '비율이 같은 비끼리 바구니에 담아요',
            hint: '비의 전항과 후항에 **0이 아닌 같은 수를 곱하거나 나누어도** 비율은 같아요. 같은 수를 더하면 비율이 달라져요.' },
    simple: { ko: '간단한 자연수의 비', l: 'l03', prompt: '간단한 자연수의 비가 같은 것끼리 담아요',
              hint: '소수의 비는 **10, 100**을 곱하고, 분수의 비는 **두 분모의 공배수**를 곱해요. 그다음 **공약수**로 나눠요.' },
    prop: { ko: '비례식일까', l: 'l04', prompt: '비례식인 것과 아닌 것으로 나눠요',
            hint: '비율이 같은 두 비를 등호로 이은 식이 비례식이에요. **외항의 곱과 내항의 곱**이 같은지 셈해 봐요.' }
  };
  var TYPES = ['same', 'simple', 'prop'];
  var ORDER = ['l02', 'l03', 'l04', 'l05', 'l10'];
  var PROP_BINS = [{ k: 'yes', ko: '비례식이에요' }, { k: 'no', ko: '비례식이 아니에요' }];

  function ratioItem(type, r) { return { type: type, a: r[0], b: r[1], text: r[0] + '：' + r[1], src: r[2], bin: simpOf(r[0], r[1]) }; }
  function propItem(r) {
    var v = r.slice(0, 4).map(parse), out = mul(v[0], v[3]), inn = mul(v[1], v[2]);
    return { type: 'prop', t: r.slice(0, 4), text: r[0] + '：' + r[1] + ' = ' + r[2] + '：' + r[3], src: r[4], outer: fstr(out), inner: fstr(inn), bin: eq(out, inn) ? 'yes' : 'no' };
  }
  var POOL = { same: SAME.map(function (r) { return ratioItem('same', r); }), simple: SIMPLE.map(function (r) { return ratioItem('simple', r); }), prop: PROP.map(propItem) };
  function groups(type) { var G = {}; POOL[type].forEach(function (it) { (G[it.bin] = G[it.bin] || []).push(it); }); return G; }
  var GROUPS = { same: groups('same'), simple: groups('simple') };

  function binOf(it) { return it.bin; }

  // ── 근거 글(틀렸을 때) ──
  function howSimple(it) {
    var a = it.a, b = it.b, A, B, steps = [];
    if (isFr(a) && isFr(b) && !/ /.test(a + b)) {
      var da = parse(a)[1], db = parse(b)[1], L = da * db / gcd(da, db); A = mul(parse(a), [L, 1]); B = mul(parse(b), [L, 1]);
      steps.push('두 분모 ' + gwa(da) + ' ' + db + '의 공배수 ' + eul(L) + ' 곱하면 ' + fstr(A) + '：' + fstr(B));
    } else {
      var x = a, y = b;
      if (isFr(x) || isFr(y)) {   // 섞인 비 — 분수를 소수로(소수 두 자리까지) · 아니면 소수를 분수로
        var fx = isFr(x), fv = parse(fx ? x : y), fd = fstr(fv);
        if (/\//.test(fd) || dp(fd) > 2) {
          var other = parse(fx ? y : x), o = fstr(other), on = other[0] + '/' + other[1];
          var X = fx ? fv : other, Y = fx ? other : fv, L2 = X[1] * Y[1] / gcd(X[1], Y[1]); A = mul(X, [L2, 1]); B = mul(Y, [L2, 1]);
          steps.push((fx ? '후항' : '전항') + ' ' + eul(o) + ' 분수 ' + ro(on) + ' 바꾸고 두 분모의 공배수 ' + eul(L2) + ' 곱하면 ' + fstr(A) + '：' + fstr(B));
          x = null;
        } else { steps.push((fx ? '전항' : '후항') + ' ' + eul(fx ? x : y) + ' 소수 ' + ro(fd) + ' 바꾸면 ' + (fx ? fd + '：' + y : x + '：' + fd)); if (fx) x = fd; else y = fd; }
      }
      if (x !== null) {
        var k = Math.pow(10, Math.max(dp(x), dp(y)));
        A = mul(parse(x), [k, 1]); B = mul(parse(y), [k, 1]);
        if (k > 1) steps.push('두 항에 ' + eul(k) + ' 곱하면 ' + fstr(A) + '：' + fstr(B));
      }
    }
    var g = gcd(A[0], B[0]);
    if (g > 1) steps.push('두 항을 ' + ro(g) + ' 나누면 ' + (A[0] / g) + '：' + (B[0] / g));
    return steps;
  }
  function reasonOf(it, by, wantKo) {
    if (by === 'same') {
      var p = it.bin.split('：'), k = +it.a / +p[0];
      return it.text + '의 두 항을 ' + ro(k) + ' 나누면 ' + it.bin + ' — 비율이 같은 비라 「' + wantKo + '」 바구니예요.';
    }
    if (by === 'simple') {
      var st = howSimple(it);
      return (st.length ? st.join(', ') + ' — ' : '') + '가장 간단한 자연수의 비가 ' + ira(it.bin) + ' 「' + wantKo + '」 바구니예요.';
    }
    var t = it.t;
    return '외항의 곱 ' + t[0] + ' × ' + t[3] + ' = ' + it.outer + ', 내항의 곱 ' + t[1] + ' × ' + t[2] + ' = ' + it.inner +
      (it.bin === 'yes' ? ' — 두 곱이 같아요. **비례식이에요.**' : ' — 두 곱이 달라요. **비례식이 아니에요.**');
  }

  function binsOf(type, keys) { return type === 'prop' ? PROP_BINS.slice() : keys.map(function (k) { return { k: k, ko: k }; }); }
  var DIRKO = { same: '이 비와 비율이 같은 비는 어느 것인가요?', simple: '간단한 자연수의 비로 나타내면 어느 것인가요?', prop: '비례식인가요?' };

  return {
    TYPES: TYPES, ORDER: ORDER, ROUNDS: ROUNDS, POOL: POOL, GROUPS: GROUPS, parse: parse, simpOf: simpOf, fstr: fstr,
    printHead: '비 카드를 보고 알맞은 것에 ○표 하세요.',
    printRender: function (p) { return '<div class="rs-card">' + p.item.text + '</div><div class="rs-q">' + p.prompt + '</div><div class="rs-bins">( ' + p.bins.map(function (b) { return b.ko; }).join(' · ') + ' )</div>'; },
    printAnswer: function (p) { return p.answer; },
    create: function (params, rng) {
      params = params || {};
      var by = TYPES.indexOf(params.by) >= 0 ? params.by : 'mix';
      var per = [4, 6].indexOf(+params.per) >= 0 ? +params.per : 6;
      var qi = 0;
      function dealRatio(type) {   // 바구니 셋 — 카드가 모자라지 않게 · 바구니마다 카드 하나 이상
        var G = GROUPS[type], keys = Object.keys(G);
        for (var tries = 0; tries < 200; tries++) {
          var pick = shuffle(rng, keys.slice()).slice(0, 3), tot = pick.reduce(function (s, k) { return s + G[k].length; }, 0);
          if (tot < per) continue;
          var items = pick.map(function (k) { return shuffle(rng, G[k].slice())[0]; });
          var rest = shuffle(rng, [].concat.apply([], pick.map(function (k) { return G[k]; })).filter(function (it) { return items.indexOf(it) < 0; }));
          items = shuffle(rng, items.concat(rest.slice(0, per - 3)));
          return { keys: pick.slice().sort(function (x, y) { return keys.indexOf(x) - keys.indexOf(y); }), items: items };
        }
        throw new Error('판을 못 만듦: ' + type);
      }
      function dealProp() {
        var yes = shuffle(rng, POOL.prop.filter(function (it) { return it.bin === 'yes'; })), no = shuffle(rng, POOL.prop.filter(function (it) { return it.bin === 'no'; }));
        var ny = 1 + Math.floor(rng() * (per - 1)), nn = per - ny;
        if (nn > no.length) { nn = no.length; ny = per - nn; }
        return shuffle(rng, yes.slice(0, ny).concat(no.slice(0, nn)));
      }
      function dealOne(type) {
        var R = ROUNDS[type], d = type === 'prop' ? { keys: null, items: dealProp() } : dealRatio(type);
        return { by: type, byKo: R.ko, bins: binsOf(type, d.keys), items: d.items.map(function (it) { return JSON.parse(JSON.stringify(it)); }), prompt: R.prompt, hint: R.hint, type: type, l: R.l };
      }
      var printDeck = {};
      return {
        deal: function () { return dealOne(by === 'mix' ? TYPES[qi++ % TYPES.length] : by); },
        next: function () {   // 🖨 활동지 — 카드 한 장 = 한 문제(보기 = 그 카드의 판 바구니)
          var type = by === 'mix' ? TYPES[qi++ % TYPES.length] : by;
          if (!printDeck[type] || !printDeck[type].length) printDeck[type] = shuffle(rng, POOL[type].slice());
          var it = JSON.parse(JSON.stringify(printDeck[type].pop())), bins;
          if (type === 'prop') bins = PROP_BINS.slice();
          else { var others = shuffle(rng, Object.keys(GROUPS[type]).filter(function (k) { return k !== it.bin; })).slice(0, 2); bins = binsOf(type, shuffle(rng, others.concat([it.bin]))); }
          return { item: it, type: type, bins: bins, prompt: DIRKO[type], answer: type === 'prop' ? PROP_BINS.filter(function (b) { return b.k === it.bin; })[0].ko : it.bin };
        },
        binOf: binOf,
        reasonOf: reasonOf
      };
    }
  };
}));
