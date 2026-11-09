/* gens/math/g6_2_div_balance.js — 몫 저울 (6학년 2학기 수학 3단원 「소수의 나눗셈」 l03 · l04 · l05 · l06 · l07 · l10 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). 저울 견주기(balance · stream) — compare999·g4_2_change_scale 과 같은 계약(answer L/E/R + type + explain + whyAns).
 *
 * params: { upto: 'l03'|'l04'|'l05'|'l06'|'l07'|'all' }
 *   upto  그 차시까지 배운 견주기만 섞는다(3차시부터 누적). 이번 차시 줄이 덱 앞머리. 'all' = l10 문제로 마무리(고르게).
 *
 * 저울의 두 접시에 올리는 것은 모두 교과서·『수학익힘』·지도서(수업 전 확인 문제·형성 평가·단원 평가)의 나눗셈·수 그대로다(아래 BANK — 쪽 표시).
 *   『수학』 60쪽 ⑤ 「9.3÷1.5 ○ 6」 · 형성 평가 411 「9.8÷0.7 ○ 6.4÷0.4」 · 414 「61÷1.22 ○ 40÷1.25」 · 415 「17÷4.6의 몫을 반올림하여 소수 첫째 자리까지 나타낸 수 ○ 17÷4.6」 처럼
 *   교과서가 직접 「○ 안에 >, =, <」로 견주게 하는 활동을 저울로 옮겼다. 수는 BigInt 유리수로 정확히 셈(부동소수 금지).
 *
 * type (§21-3 · 교과서 차시 그대로):
 *   num    l03  몫과 수 견주기 — 『수학』 60 ⑤(9.3÷1.5 ○ 6 · 7 ○ 28.8÷4.5)
 *   two    l03~l10  두 몫 견주기 — 형성 평가·수업 전 확인 문제·익힘 컵 수·문제로 마무리·단원 평가
 *   same   l05·l10  두 수에 같은 수를 곱한 나눗셈 — 몫이 같아요(익힘 47 혜리·선재 · 『수학』 64~65 · 74 「192÷4 = 48 → 19.2÷0.4」), 한 수만 바꾸면 달라요
 *   small  l06  1보다 작은 수로 나누면 몫이 나누어지는 수보다 커져요(지도서 236 주안점 · 『수학』 67 0.6)36 · 16÷0.25)
 *   round  l07  반올림한 수와 원래 몫 — 형성 평가 415 · 단원 평가 458 · 『수학』 68~69
 * whyAns: 'calc' 두 몫을 계산해 견줌 · 'same' 두 수에 같은 수를 곱한 사이 · 'small' 나누는 수가 1보다 작은가 · 'round' 반올림해 올렸는가 버렸는가.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g6_2_div_balance'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l03', 'l04', 'l05', 'l06', 'l07', 'l10'];
  var TYPES = ['num', 'two', 'same', 'small', 'round'];
  var TAG = { num: '몫과 수', two: '몫이 더 큰 쪽은?', same: '두 수에 같은 수를 곱하면?', small: '1보다 작은 수로 나누면', round: '반올림한 수와 몫' };
  var ASK = { num: '몫과 수 — 어느 쪽이 더 클까요?', two: '두 나눗셈 — 몫이 더 큰 쪽은?', same: '두 나눗셈의 몫을 견주어 보아요', small: '몫과 나누어지는 수 — 어느 쪽이 더 클까요?', round: '반올림한 수와 원래 몫 — 어느 쪽이 더 클까요?' };
  var PL = ['일의 자리', '소수 첫째 자리', '소수 둘째 자리', '소수 셋째 자리'];
  /* 은행 — [차시, 갈래, 왼쪽, 오른쪽, 쪽]  · 접시 글: 'a÷b' 나눗셈 · '6' 수 · '~p:a÷b' a÷b 의 몫을 반올림해 소수 p 자리까지 */
  var BANK = [
    ['l03', 'num', '9.3÷1.5', '6', '『수학』 60'],
    ['l03', 'num', '7', '28.8÷4.5', '『수학』 60'],
    ['l03', 'two', '9.8÷0.7', '6.4÷0.4', '형성 평가 411'],
    ['l03', 'two', '20.8÷2.6', '25.5÷3.4', '형성 평가 411'],
    ['l03', 'two', '2.7÷0.3', '2.8÷0.4', '익힘 43'],
    ['l04', 'two', '0.77÷0.14', '4.94÷0.76', '『수학』 63'],
    ['l04', 'two', '0.54÷0.05', '0.78÷0.12', '『수학』 63 · 형성 평가 412'],
    ['l04', 'two', '4.94÷0.76', '0.78÷0.12', '『수학』 63 · 형성 평가 412'],
    ['l04', 'two', '3.36÷0.28', '0.72÷0.09', '형성 평가 412'],
    ['l04', 'two', '20.8÷2.6', '13.3÷1.9', '지도서 229 수업 전 확인'],
    ['l04', 'two', '6.8÷0.4', '11.2÷0.8', '지도서 229 수업 전 확인'],
    ['l05', 'same', '3.51÷0.9', '35.1÷9', '익힘 47'],
    ['l05', 'same', '3.51÷0.9', '351÷9', '익힘 47'],
    ['l05', 'same', '8.64÷2.4', '86.4÷24', '『수학』 65'],
    ['l05', 'same', '5.4÷0.45', '540÷45', '『수학』 64'],
    ['l05', 'two', '5.22÷3.6', '8.84÷1.7', '익힘 47'],
    ['l05', 'two', '3.6÷0.09', '7.5÷0.25', '익힘 47'],
    ['l05', 'two', '4.8÷0.08', '4.2÷0.06', '형성 평가 413'],
    ['l06', 'small', '36÷0.6', '36', '『수학』 67'],
    ['l06', 'small', '39÷1.5', '39', '『수학』 67'],
    ['l06', 'small', '16÷0.25', '16', '『수학』 67'],
    ['l06', 'small', '5÷0.4', '5', '『수학』 67'],
    ['l06', 'small', '8÷1.6', '8', '『수학』 66'],
    ['l06', 'two', '61÷1.22', '40÷1.25', '형성 평가 414'],
    ['l06', 'two', '33÷6.6', '14÷2.8', '형성 평가 414'],
    ['l06', 'two', '7÷1.75', '8÷1.6', '『수학』 66~67'],
    ['l07', 'round', '~1:17÷4.6', '17÷4.6', '형성 평가 415'],
    ['l07', 'round', '~1:5÷1.2', '5÷1.2', '단원 평가 458'],
    ['l07', 'round', '~2:1÷6', '1÷6', '『수학』 68'],
    ['l07', 'round', '~0:3.7÷0.7', '3.7÷0.7', '『수학』 69'],
    ['l07', 'round', '~2:3.38÷0.9', '3.38÷0.9', '『수학』 69'],
    ['l07', 'round', '~2:8.3÷3', '8.3÷3', '『수학』 69'],
    ['l07', 'round', '~2:5÷6.3', '5÷6.3', '『수학』 69'],
    ['l07', 'round', '~2:6.2÷1.3', '6.2÷1.3', '『수학』 69'],
    ['l10', 'same', '192÷4', '19.2÷0.4', '『수학』 74'],
    ['l10', 'same', '486÷6', '4.86÷0.06', '『수학』 74'],
    ['l10', 'two', '9.8÷1.4', '1.19÷0.14', '『수학』 74'],
    ['l10', 'two', '18.3÷0.3', '91÷3.5', '『수학』 74~75'],
    ['l10', 'two', '7.3÷3.65', '1.71÷0.45', '단원 평가 458'],
    ['l10', 'two', '19.2÷0.4', '4.86÷0.06', '『수학』 74'],
    ['l10', 'two', '1.18÷0.2', '19.8÷3.6', '『수학』 75'],
    ['l10', 'two', '6.3÷0.42', '91÷3.5', '『수학』 74']
  ];

  /* ── 유리수 셈 (BigInt) ── */
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function R(n, d) { var g = gcd(n, d) || 1n; return [n / g, d / g]; }
  function num(s) { s = String(s); var i = s.indexOf('.'); return i < 0 ? R(BigInt(s), 1n) : R(BigInt(s.replace('.', '')), BigInt('1' + '0'.repeat(s.length - i - 1))); }
  function div(a, b) { return R(a[0] * b[1], a[1] * b[0]); }
  function cmp(a, b) { var x = a[0] * b[1], y = b[0] * a[1]; return x > y ? 1 : x < y ? -1 : 0; }
  function cut(r, k) { var v = r[0] * BigInt('1' + '0'.repeat(k)) / r[1], s = v.toString(); if (!k) return s; while (s.length <= k) s = '0' + s; return s.slice(0, s.length - k) + '.' + s.slice(s.length - k); }
  function exact(r) { for (var k = 0; k <= 6; k++) { if ((r[0] * BigInt('1' + '0'.repeat(k))) % r[1] === 0n) return cut(r, k).replace(/\.?0+$/, function (m) { return m.indexOf('.') >= 0 ? '' : m; }); } return null; }
  function show(r) { var e = exact(r); return e !== null ? e : cut(r, 3) + '…'; }
  function rnd(r, p) { var v = r[0] * BigInt('1' + '0'.repeat(p + 1)) / r[1], q = v / 10n; if (v % 10n >= 5n) q += 1n; var s = q.toString(); if (!p) return s; while (s.length <= p) s = '0' + s; return s.slice(0, s.length - p) + '.' + s.slice(s.length - p); }
  function sp(e) { return e.replace('÷', ' ÷ '); }

  /* 접시 하나 읽기 → { val(유리수), line1, line2, res(정답 뒤 접시 결과), say(풀이 글) } */
  function side(t, type) {
    var m = t.match(/^~(\d):(.+)$/);
    if (m) {
      var p = +m[1], ab = m[2].split('÷'), q = div(num(ab[0]), num(ab[1])), v = rnd(q, p);
      return { val: num(v), line1: sp(m[2]), line2: PL[p] + '까지 반올림', res: v, say: sp(m[2]) + ' = ' + cut(q, p + 2) + '… → ' + PL[p + 1] + ' 숫자 ' + KO.j(cut(q, p + 1).slice(-1), '을/를') + ' 보고 ' + (+cut(q, p + 1).slice(-1) >= 5 ? '올려' : '버려') + ' ' + v, raw: q, p: p };
    }
    if (t.indexOf('÷') >= 0) { var x = t.split('÷'), qq = div(num(x[0]), num(x[1])); return { val: qq, line1: sp(t), line2: '', res: show(qq), say: sp(t) + ' = ' + show(qq), a: x[0], b: x[1] }; }
    return { val: num(t), line1: t, line2: type === 'small' ? '나누어지는 수' : '', res: t, say: t };
  }
  function times(x, y) { // y 는 x 를 10의 거듭제곱 배 한 수인가 — { k: '10'|'100'…, up: 곱했나(true)·나눴나(false) } · 아니면 null
    var r = div(num(y), num(x)), up = r[1] === 1n, s = (up ? r[0] : r[1]).toString(); if (!up && r[0] !== 1n) return null; return /^10+$/.test(s) ? { k: s, up: up } : null;
  }
  function tw(t) { return t ? t.k + (t.up ? '배' : '분의 1배') : '그대로'; }
  function make(row) {
    var type = row[1], L = side(row[2], type), Rr = side(row[3], type), c = cmp(L.val, Rr.val), ans = c === 0 ? 'E' : c > 0 ? 'L' : 'R';
    var sym = c === 0 ? '=' : c > 0 ? '>' : '<', ex;
    var more = function (a, b) { return KO.j(a, '이/가') + ' ' + b + '보다 커요'; };   // 근거 글은 부등호 대신 말로(소수 부등식은 공용 근거 검사가 자연수만 읽음)
    if (type === 'same') {
      var ka = times(L.a, Rr.a), kb = times(L.b, Rr.b);
      ex = ka && kb && ka.k === kb.k && ka.up === kb.up ? KO.j(sp(row[3]), '은/는') + ' ' + sp(row[2]) + '의 두 수에 똑같이 ' + (ka.up ? KO.j(ka.k, '을/를') + ' 곱한' : KO.ro(ka.k) + ' 나눈') + ' 식 — 몫은 그대로 ' + KO.ida(L.res) + '.'
        : sp(row[3]) + '에서는 두 수를 똑같이 바꾸지 않았어요(나누어지는 수 ' + tw(ka) + ' · 나누는 수 ' + tw(kb) + ') — ' + L.say + ', ' + Rr.say + ' → 몫이 달라요.';
    } else if (type === 'small') {
      var b = L.b, lt1 = cmp(num(b), num('1')) < 0;
      ex = KO.j(b, '은/는') + ' 1보다 ' + (lt1 ? '작아서 ' + Rr.res + ' 안에 ' + Rr.res + '번보다 더 여러 번 들어가요' : '커서 몫이 나누어지는 수보다 작아져요') + ' — ' + L.say + ', ' + (c > 0 ? more(L.res, Rr.res) : more(Rr.res, L.res)) + '.';
    } else if (type === 'round') {
      ex = L.say + ' · 원래 몫 ' + show(L.raw) + ' — ' + (cmp(num(L.res), L.raw) > 0 ? '올렸으니 반올림한 수가 더 커요.' : '버렸으니 반올림한 수가 더 작아요.');
    } else {
      ex = '왼쪽 ' + L.say + ' · 오른쪽 ' + Rr.say + ' — ' + (c === 0 ? '몫이 같아요!' : (c > 0 ? more(L.res, Rr.res) : more(Rr.res, L.res)) + '.');
    }
    var why = type === 'same' ? 'same' : type === 'small' ? 'small' : type === 'round' ? 'round' : 'calc';
    return { prompt: ASK[type], sa: [L.line1, L.line2], sb: [Rr.line1, Rr.line2], ra: L.res, rb: Rr.res, answer: ans, sym: sym, whyAns: why, explain: ex };
  }
  var FRAMES = BANK.map(function (r, i) { return { id: r[0] + ':' + i, i: i, l: r[0], type: r[1], src: r[4] }; });

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function create(params, rng) {
    var upto = params && params.upto, ui = ORDER.indexOf(upto);
    var cur = (ui < 0 || upto === 'all' || upto === 'l10') ? null : upto; if (ui < 0) ui = ORDER.length - 1;
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
    id: 'g6_2_div_balance',
    title: '몫 저울',
    ORDER: ORDER, TYPES: TYPES, BANK: BANK, FRAMES: FRAMES,
    create: create,
    printRender: function (q) {
      return '<div class="w-q">' + q.prompt + '</div><span class="w-num">' + q.sa.join(' ') + '</span><span class="w-box">◯</span><span class="w-num">' + q.sb.join(' ') + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '두 접시를 견주어 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
