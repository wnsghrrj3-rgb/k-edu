/* gens/math/g5_2_mul_balance.js — 곱 저울 (5학년 2학기 수학 2단원 「분수의 곱셈」 l03 · l04 · l05 · l06 · l07 · l08 · l09 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). 저울 견주기(balance · stream) — g6_2_div_balance·g4_2_change_scale 과 같은 계약(answer L/E/R + type + explain + whyAns).
 *
 * params: { upto: 'l03'|'l04'|'l05'|'l06'|'l07'|'l08'|'all' }
 *   upto  그 차시까지 배운 견주기만 섞는다(3차시부터 누적). 이번 차시 줄이 덱 앞머리. 'all'(= l09 문제로 마무리) = 고르게.
 *
 * 저울의 두 접시에 올리는 것은 모두 교과서·『수학익힘』·지도서(수업 전 확인 문제·형성 평가·단원 평가)의 곱셈·수 그대로다(아래 BANK — 쪽 표시).
 *   『수학』 41쪽 ③ 「계산 결과가 5보다 큰 것을 찾아 ○표 — 곱하는 수를 살펴보면 계산하지 않아도 알 수 있어요」 · 지도서 183 수업 전 확인 「3/5 × 4 ○ 3/4 × 5」 ·
 *   단원 평가 「8 × 3/4 ○ 8 × 1 1/10」「2 1/3 × 2 ○ 5」「2 × 3/8 ○ 1」 · 문제로 마무리 ④ 「계산 결과가 같은 것끼리」 처럼 교과서가 직접 견주게 하는 활동을 저울로 옮겼다.
 *   지도서 165 단원 지도 유의 사항 ③ 「분수의 곱셈은 자연수의 곱셈과 달리 계산 결과가 곱해지는 수보다 작아질 수도 있다」 — 곱하는 수를 1과 견주는 어림이 이 활동의 중심.
 *   수는 BigInt 유리수로 정확히 셈(부동소수 금지). 접시 글의 대분수는 「1 3/4」(은행에서는 「1_3/4」).
 *
 * type (§21-3 · 교과서 차시 그대로):
 *   one    l03·l04·l05  곱과 수 — 곱하는 수가 1보다 작으면 곱해지는 수보다 작고, 1이면 그대로, 1보다 크면 커요(『수학』 41 ③ · 수업 전 확인 · 형성 평가 430 · 단원 평가)
 *   two    l03~l09  두 곱(두 식의 값) 견주기 — 수업 전 확인 · 단원 평가 · 흙 6 kg · 와글와글 두 마을
 *   same   l03~l09  계산한 값이 같은 두 식 — 곱하는 순서만 바꾼 식(『수학』 39 3/5 × 2 · 2 × 3/5) · 문제로 마무리 ④ · 단원 평가(같지 않은 짝도 섞음)
 *   times  l05·l07  처음 양과 그 몇 배 — 1보다 큰 배이면 더 많아요(윤재·수아 · 이서·시하 · 재영·하은 · 고양이·강아지 · 지오·이수 · 관람료 · 철사)
 *   small  l06  진분수를 곱하면 곱해지는 분수보다 작아져요(지도서 165 ③ · 『수학』 42~43)
 * whyAns: 'calc' 두 값을 계산해 견줌 · 'one' 곱하는 수가 1보다 큰지 작은지 봄 · 'swap' 곱하는 순서만 바꾼 식인지 봄.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_mul_balance'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'];
  var TYPES = ['one', 'two', 'same', 'times', 'small'];
  var TAG = { one: '곱과 수', two: '어느 쪽이 더 클까?', same: '같은 값일까?', times: '몇 배 한 양', small: '진분수를 곱하면' };
  var ASK = { one: '곱과 수 — 어느 쪽이 더 클까요?', two: '두 식의 값 — 어느 쪽이 더 클까요?', same: '두 식의 값을 견주어 보아요', times: '처음 양과 몇 배 한 양 — 어느 쪽이 더 많을까요?', small: '곱과 곱해지는 분수 — 어느 쪽이 더 클까요?' };
  /* 은행 — [차시, 갈래, 왼쪽, 오른쪽, 쪽, 왼쪽 둘째 줄, 오른쪽 둘째 줄] · 접시 글: '5×2/3' 곱 · '1_3/4' 대분수 · '2+5/7×2' 덧셈 섞인 식 · '270×2/3−158' */
  var BANK = [
    ['l03', 'two', '3/5×4', '3/4×5', '지도서 183 수업 전 확인'],
    ['l03', 'one', '2_1/3×2', '5', '단원 평가 심화 479'],
    ['l03', 'same', '2_5/7×2', '2×2+5/7×2', '단원 평가 보충 476'],
    ['l03', 'same', '2_5/7×2', '2+5/7×2', '단원 평가 보충 476'],
    ['l03', 'same', '1_3/4×2', '7/4×2', '단원 평가 심화 479'],
    ['l03', 'same', '1_3/4×2', '1_3/4+1_3/4+1_3/4', '단원 평가 심화 479'],
    ['l03', 'same', '1_1/3×2', '1×2+1/3×2', '단원 평가 보충 474'],
    ['l04', 'same', '3/5×2', '2×3/5', '『수학』 39'],
    ['l04', 'two', '6×1/3', '6×2/3', '『수학』 38 흙', '누나가 쓴 흙(kg)', '내가 쓴 흙(kg)'],
    ['l04', 'same', '12×2/9', '4×2/3', '형성 평가 429'],
    ['l04', 'two', '9×5/6', '12×2/9', '형성 평가 429'],
    ['l04', 'one', '2×3/8', '1', '단원 평가 보충 475'],
    ['l05', 'one', '5×2/3', '5', '『수학』 41'],
    ['l05', 'one', '5×1', '5', '『수학』 41'],
    ['l05', 'one', '5×1_1/9', '5', '『수학』 41'],
    ['l05', 'one', '5×19/20', '5', '『수학』 41'],
    ['l05', 'one', '3×2/5', '3', '지도서 191 수업 전 확인'],
    ['l05', 'one', '7/8×3', '3', '지도서 191 수업 전 확인'],
    ['l05', 'one', '2_1/2×3', '3', '지도서 191 수업 전 확인'],
    ['l05', 'one', '6×3/4', '6', '형성 평가 430'],
    ['l05', 'one', '6×1_8/9', '6', '형성 평가 430'],
    ['l05', 'one', '6×2_1/3', '6', '형성 평가 430'],
    ['l05', 'one', '5×1/2', '5', '단원 평가 보충 477'],
    ['l05', 'one', '5×2_1/5', '5', '단원 평가 보충 477'],
    ['l05', 'one', '5×9/10', '5', '단원 평가 보충 477'],
    ['l05', 'two', '8×3/4', '8×1_1/10', '단원 평가 기본 471'],
    ['l05', 'times', '2', '2×1_3/4', '『수학』 41 쓰레기', '처음 양(kg)', '1 3/4배'],
    ['l05', 'times', '4', '4×1_5/8', '익힘 33 밤', '처음 양(kg)', '1 5/8배'],
    ['l05', 'times', '8000', '8000×1_1/5', '단원 평가 기본 472 관람료', '어린이(원)', '어른 1 1/5배'],
    ['l05', 'times', '24', '24×1_3/8', '단원 평가 보충 477 철사', '처음 양(m)', '1 3/8배'],
    ['l06', 'small', '4/5×2/3', '4/5', '지도서 165 · 『수학』 43'],
    ['l06', 'small', '9/10×5/6', '9/10', '지도서 165 · 『수학』 43'],
    ['l06', 'same', '1/6×1/5', '1/2×1/15', '단원 평가 기본 472'],
    ['l06', 'same', '1/10×1/4', '1/8×1/5', '단원 평가 기본 472'],
    ['l06', 'two', '1/5×1/7', '1/9×1/3', '단원 평가 기본 473'],
    ['l06', 'two', '1/6×1/6', '1/11×1/2', '단원 평가 기본 473'],
    ['l06', 'two', '1/5×1/7', '1/6×1/6', '단원 평가 기본 473'],
    ['l06', 'two', '2/3×1/9', '4/9×1/2', '단원 평가 심화 480'],
    ['l06', 'same', '4/9×1/2', '5/6×4/15', '단원 평가 심화 480'],
    ['l07', 'times', '1_3/4', '1_3/4×1_3/7', '『수학』 44 공원', '처음 거리(km)', '1 3/7배'],
    ['l07', 'times', '4', '4×1_1/6', '지도서 195 수업 전 확인', '처음 무게(kg)', '1 1/6배'],
    ['l07', 'times', '2_4/5', '2_4/5×1_5/7', '형성 평가 431', '처음 무게(kg)', '1 5/7배'],
    ['l07', 'two', '5/18×24', '16×1_1/2', '단원 평가 심화 480'],
    ['l07', 'two', '3_1/2×1_4/5', '2_2/5×1_3/4', '『수학』 44~45'],
    ['l08', 'two', '270×2/3', '430×3/5', '『수학』 48~49', '서연이네 마을', '준기네 마을'],
    ['l08', 'two', '270×2/3−158', '430×3/5−195', '『수학』 48~49', '서연이네 마을', '준기네 마을'],
    ['l09', 'same', '6×1_3/8', '11×3/4', '『수학』 51'],
    ['l09', 'same', '5/36×3', '15/16×4/9', '『수학』 51'],
    ['l09', 'same', '1/2×1/3×3/10', '1/4×1/5', '『수학』 51'],
    ['l09', 'two', '6×1_3/8', '5/36×3', '『수학』 51'],
    ['l09', 'two', '15/16×4/9', '1/4×1/5', '『수학』 51']
  ];

  /* ── 유리수 셈 (BigInt) ── */
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function R(n, d) { var g = gcd(n, d) || 1n; return [n / g, d / g]; }
  function one(s) { var m = String(s).match(/^(\d+)_(\d+)\/(\d+)$/); if (m) { var d = BigInt(m[3]); return R(BigInt(m[1]) * d + BigInt(m[2]), d); }
    m = String(s).match(/^(\d+)\/(\d+)$/); if (m) return R(BigInt(m[1]), BigInt(m[2])); return R(BigInt(s), 1n); }
  function mul(a, b) { return R(a[0] * b[0], a[1] * b[1]); }
  function add(a, b, sg) { return R(a[0] * b[1] + (sg < 0 ? -1n : 1n) * b[0] * a[1], a[1] * b[1]); }
  function cmp(a, b) { var x = a[0] * b[1], y = b[0] * a[1]; return x > y ? 1 : x < y ? -1 : 0; }
  function term(t) { return t.split('×').map(one).reduce(mul); }
  function value(s) { var parts = s.split(/([+−])/), v = term(parts[0]); for (var i = 1; i < parts.length; i += 2) v = add(v, term(parts[i + 1]), parts[i] === '−' ? -1 : 1); return v; }
  function show(r) { var n = r[0], d = r[1]; if (d === 1n) return n.toString(); var w = n / d, a = n % d; return (w ? w.toString() + ' ' : '') + a.toString() + '/' + d.toString(); }
  function sp(e) { return e.replace(/_/g, ' ').replace(/×/g, ' × ').replace(/([+−])/g, ' $1 '); }

  function side(t) { var v = value(t); return { val: v, line1: sp(t), res: show(v), say: /[×+−]/.test(t) ? sp(t) + ' = ' + show(v) : show(v), factors: /[+−]/.test(t) ? null : t.split('×') }; }
  function make(row) {
    var type = row[1], L = side(row[2]), Rr = side(row[3]), c = cmp(L.val, Rr.val), ans = c === 0 ? 'E' : c > 0 ? 'L' : 'R';
    var big = c > 0 ? '왼쪽' : '오른쪽', ex, why = 'calc';
    var fs = L.factors, rest = null;
    if ((type === 'one' || type === 'small') && fs && fs.length === 2) {
      var k = fs.findIndex(function (f) { return cmp(one(f), Rr.val) === 0; });
      if (k >= 0) rest = fs[1 - k];
    }
    if (rest !== null) {   // 곱해지는 수와 곱 — 곱하는 수를 1과 견줌
      var m = one(rest), c1 = cmp(m, [1n, 1n]); why = 'one';
      ex = (c1 === 0 ? '1을 곱하면 그대로예요' : '곱하는 수(' + sp(rest) + ')가 1보다 ' + (c1 < 0 ? '작아서 곱해지는 수보다 작아져요' : '커서 곱해지는 수보다 커져요')) + ' — ' + L.say + '.';
    } else if (type === 'times') {
      why = 'one';
      var kk = Rr.factors[1];
      ex = sp(kk) + '배는 1보다 커서 몇 배 한 쪽이 더 많아요 — ' + Rr.say + '.';
    } else if (type === 'same' && L.factors && Rr.factors && L.factors.length === Rr.factors.length && L.factors.slice().sort().join() === Rr.factors.slice().sort().join()) {
      why = 'swap';
      ex = '곱하는 순서만 바꾸었어요 — 두 식 모두 ' + L.res + '.';
    } else {
      ex = '왼쪽 ' + L.say + ' · 오른쪽 ' + Rr.say + ' — ' + (c === 0 ? '두 값이 같아요!' : big + '이 더 커요.');
    }
    return { prompt: ASK[type], sa: [L.line1, row[5] || ''], sb: [Rr.line1, row[6] || ''], ra: L.res, rb: Rr.res, answer: ans, sym: c === 0 ? '=' : c > 0 ? '>' : '<', whyAns: why, explain: ex };
  }
  var FRAMES = BANK.map(function (r, i) { return { id: r[0] + ':' + i, i: i, l: r[0], type: r[1], src: r[4] }; });

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function create(params, rng) {
    var upto = params && params.upto, ui = ORDER.indexOf(upto);
    var cur = (ui < 0 || upto === 'all' || upto === 'l09') ? null : upto; if (ui < 0) ui = ORDER.length - 1;
    var pool = FRAMES.filter(function (f) { return ORDER.indexOf(f.l) <= ui; });
    function deck() {
      var now = cur ? shuffle(rng, pool.filter(function (f) { return f.l === cur; })) : [];
      return now.concat(shuffle(rng, pool.filter(function (f) { return !cur || f.l !== cur; })));
    }
    var Q = deck(), qi = 0, last = null;
    return {
      size: pool.length,
      next: function () {
        if (qi >= Q.length) { Q = deck(); qi = 0; if (last !== null && Q[0].i === last) Q.push(Q.shift()); }
        var f = Q[qi++]; last = f.i;
        var q = make(BANK[f.i]);
        q.id = f.id; q.l = f.l; q.type = f.type; q.src = f.src; q.tag = TAG[f.type];
        return q;
      },
      check: function (pick, q) { return pick === q.answer; }
    };
  }

  return {
    id: 'g5_2_mul_balance',
    title: '곱 저울',
    ORDER: ORDER, TYPES: TYPES, BANK: BANK, FRAMES: FRAMES,
    create: create,
    printRender: function (q) {
      return '<div class="w-q">' + q.prompt + '</div><span class="w-num">' + q.sa.join(' ') + '</span><span class="w-box">◯</span><span class="w-num">' + q.sb.join(' ') + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '두 접시를 견주어 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
