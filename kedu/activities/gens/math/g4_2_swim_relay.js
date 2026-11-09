/* gens/math/g4_2_swim_relay.js — 「혼계영 계산 릴레이」 소수의 덧셈과 뺄셈 바통 (4학년 2학기 수학 3단원 「소수의 덧셈과 뺄셈」 l06~l10 · l11 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 relay(반 전체 바통 · 혼자 바통 10개)가 쓴다.
 * 근거 = 지도서(수학 4-2) 256~315쪽 — 교과서 수·장면 그대로(handoff kedu/textbook2/g4_2_math_u3/활동목록.md):
 *   『수학』 70~71쪽 사료 0.3 + 0.5 · 수직선 1.7 + 0.6 · 집→서점→은행 · 72~73쪽 수조 0.73 + 0.24 · 0.84 + 0.3 · 잘못 계산한 곳(바르게 계산하기) ·
 *   74~75쪽 소독약 1.3 − 0.2 · 2.4 − 1.8 · 참외 · 76~77쪽 참수리 0.95 − 0.43 · 1.2 − 0.36 · 잘못 계산한 곳 · 『수학익힘』 44~51쪽 ·
 *   78~79쪽 「내가 수영 감독이라면!」 혼계영 200 m(돌고래 · 아기 상어 · 서준·지유·채원·건우 기록 · 예선 기준 150초) · 익힘 52쪽 개인 혼영 · 80~83쪽 마무리 ③·⑦·만화.
 * 바통 하나 = 혼계영 한 구간(배영 → 평영 → 접영 → 자유형이 차례로 돈다) — 반이 한 팀이 되어 소수 셈 바통을 잇는다.
 * 보기 = 정답 + 학습지와 같은 오류 모형의 결과(받아올림 안 함 X11 · 같은 자리 합을 그대로 X10 · 오른쪽 끝 맞춤 X12 · 거꾸로 뺌 X13 ·
 *   받아내림 뒤 1 안 뺌 X14 · 빈 자리 내려 씀 X15) — 모자라면 자리를 한 칸 잘못 놓은 값(X01). 정답과 같은 값·소수 넷째 자리 0.
 * 힌트(explain) = 방법만 — 정답 수는 말하지 않는다(오답 뒤에도 그대로 보이므로).
 * type(문항 단위 · 진단 축 = 학습지 개념):
 *   add1 소수 한 자리 수의 덧셈 · add2 소수 두 자리 수의 덧셈(자릿수가 다른 덧셈 포함) · sub1 소수 한 자리 수의 뺄셈 ·
 *   sub2 소수 두 자리 수의 뺄셈(빈 자리 0 포함) · swim 수영 기록의 합과 차(78~79쪽 · 익힘 52쪽)
 * params: { upto: 'l06'|'l07'|'l08'|'l09'|'l10'|'all' }  — 그 차시까지 누적, 이번 차시 셈이 덱 앞머리. all = 단원 전체(앞머리 = 마무리)
 * next() → { id, l, src, a, op, b, prompt, answer, options, type, explain, leg }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_swim_relay'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l06', 'l07', 'l08', 'l09', 'l10', 'l11'];
  var STROKES = ['배영', '평영', '접영', '자유형'];
  var M = '−';
  /* [차시, 교과서 자리, a, op, b] — 모두 교과서·익힘·지도서의 셈 */
  var BANK = [
    ['l06', '『수학』 70쪽 고양이 사료', '0.3', '+', '0.5'], ['l06', '『수학』 71쪽 수직선', '1.7', '+', '0.6'], ['l06', '『수학』 71쪽 계산해 봅시다', '0.6', '+', '0.1'],
    ['l06', '『수학』 71쪽 계산해 봅시다', '0.5', '+', '2.3'], ['l06', '『수학』 71쪽 계산해 봅시다', '3.8', '+', '4.9'], ['l06', '『수학』 71쪽 집에서 서점을 지나 은행까지(km)', '1.9', '+', '0.7'],
    ['l06', '『수학익힘』 44쪽 고양이 사료', '0.2', '+', '0.3'], ['l06', '『수학익힘』 44쪽 계산해 보세요', '5.8', '+', '0.4'], ['l06', '『수학익힘』 44쪽 계산해 보세요', '2.4', '+', '7.9'],
    ['l06', '『수학익힘』 45쪽 계산 결과 견주기', '1.6', '+', '3.6'], ['l06', '『수학익힘』 45쪽 은비의 가방(kg)', '1.5', '+', '0.7'], ['l06', '『수학익힘』 45쪽 학교에서 공원을 지나 시장까지(km)', '3.4', '+', '6.2'],
    ['l07', '『수학』 72쪽 수조의 물(L)', '0.73', '+', '0.24'], ['l07', '『수학』 73쪽 수직선', '0.84', '+', '0.3'], ['l07', '『수학』 73쪽 계산해 봅시다', '0.28', '+', '0.5'],
    ['l07', '『수학』 73쪽 계산해 봅시다', '1.07', '+', '0.38'], ['l07', '『수학』 73쪽 계산해 봅시다', '7.6', '+', '2.41'], ['l07', '『수학』 73쪽 바르게 계산하기', '5.1', '+', '4.26'],
    ['l07', '『수학』 73쪽 바르게 계산하기', '2.53', '+', '0.69'], ['l07', '『수학』 73쪽 바르게 계산하기', '3.09', '+', '1.07'], ['l07', '『수학익힘』 46쪽 수조의 물(L)', '0.61', '+', '0.32'],
    ['l07', '『수학익힘』 46쪽 수직선', '0.5', '+', '0.48'], ['l07', '『수학익힘』 46쪽 계산해 보세요', '5.13', '+', '1.24'], ['l07', '『수학익힘』 46쪽 계산해 보세요', '4.9', '+', '0.56'],
    ['l07', '『수학익힘』 46쪽 계산해 보세요', '6.19', '+', '2.82'], ['l07', '『수학익힘』 47쪽 재활용 종이(kg)', '2.16', '+', '4.82'], ['l07', '『수학익힘』 47쪽 수학에 퐁당', '1.59', '+', '2.89'],
    ['l08', '『수학』 74쪽 남은 소독약(L)', '1.3', M, '0.2'], ['l08', '『수학』 75쪽 수직선', '2.4', M, '1.8'], ['l08', '『수학』 75쪽 계산해 봅시다', '0.8', M, '0.6'],
    ['l08', '『수학』 75쪽 계산해 봅시다', '6.5', M, '5.1'], ['l08', '『수학』 75쪽 계산해 봅시다', '7.4', M, '1.9'], ['l08', '『수학』 75쪽 참외의 무게(kg)', '3.2', M, '0.3'],
    ['l08', '『수학익힘』 48쪽 남은 소독약(L)', '1.5', M, '0.3'], ['l08', '『수학익힘』 48쪽 그림을 보고', '1.2', M, '0.7'], ['l08', '『수학익힘』 48쪽 계산해 보세요', '0.8', M, '0.4'],
    ['l08', '『수학익힘』 48쪽 계산해 보세요', '4.7', M, '0.5'], ['l08', '『수학익힘』 48쪽 계산해 보세요', '8.1', M, '2.9'], ['l08', '『수학익힘』 49쪽 50 m 달리기(초)', '11.2', M, '10.5'],
    ['l08', '『수학익힘』 49쪽 남는 끈(m)', '1.4', M, '0.8'], ['l08', '『수학익힘』 49쪽 차가 가장 큰 뺄셈식', '5.4', M, '1.2'],
    ['l09', '『수학』 76쪽 참수리(m)', '0.95', M, '0.43'], ['l09', '『수학』 77쪽 수직선', '1.2', M, '0.36'], ['l09', '『수학』 77쪽 계산해 봅시다', '0.87', M, '0.41'],
    ['l09', '『수학』 77쪽 계산해 봅시다', '4.23', M, '1.6'], ['l09', '『수학』 77쪽 계산해 봅시다', '9.28', M, '5.79'], ['l09', '『수학』 77쪽 바르게 계산하기', '1.05', M, '0.34'],
    ['l09', '『수학』 77쪽 바르게 계산하기', '6.9', M, '0.13'], ['l09', '『수학』 77쪽 바르게 계산하기', '8.1', M, '0.52'], ['l09', '『수학익힘』 50쪽 참수리(m)', '0.98', M, '0.56'],
    ['l09', '『수학익힘』 50쪽 수직선', '0.69', M, '0.47'], ['l09', '『수학익힘』 50쪽 계산해 보세요', '8.6', M, '5.31'], ['l09', '『수학익힘』 50쪽 계산해 보세요', '9.27', M, '6.59'],
    ['l09', '『수학익힘』 51쪽 바르게 계산하기', '26.5', M, '1.47'], ['l09', '『수학익힘』 51쪽 리본(m)', '2.63', M, '1.95'], ['l09', '『수학익힘』 51쪽 ㉠과 ㉡의 차', '4.39', M, '2.83'],
    ['l10', '『수학』 78쪽 돌고래 팀 배영 + 평영(초)', '39.28', '+', '42.43'], ['l10', '『수학』 78쪽 아기 상어 팀 배영 + 평영(초)', '40.24', '+', '42.53'],
    ['l10', '『수학』 78쪽 두 팀의 기록 차(초)', '150.21', M, '148.89'], ['l10', '『수학』 79쪽 배영 서준 + 평영 채원(초)', '39.32', '+', '41.33'],
    ['l10', '『수학』 79쪽 배영 채원 + 평영 서준(초)', '38.96', '+', '41.93'], ['l10', '『수학』 79쪽 예선 통과 기준 150초와의 차(초)', '150', M, '147.13'],
    ['l10', '지도서 309쪽 두 명단의 기록 차(초)', '147.37', M, '147.13'], ['l10', '『수학익힘』 52쪽 은비와 건우의 기록 차(초)', '176.89', M, '175.69'],
    ['l10', '『수학익힘』 52쪽 배영 기록 차(초)', '45.28', M, '44.99'], ['l10', '『수학익힘』 52쪽 자유형 기록 차(초)', '41.23', M, '40.92'],
    ['l10', '『수학익힘』 52쪽 접영 기록 차(초)', '42.71', M, '41.45'], ['l10', '『수학익힘』 52쪽 평영 기록 차(초)', '48.27', M, '47.73'],
    ['l10', '『수학익힘』 52쪽 은비가 더 빠른 만큼(초)', '0.29', '+', '0.31'], ['l10', '『수학익힘』 52쪽 건우가 더 빠른 만큼(초)', '1.26', '+', '0.54'],
    ['l10', '『수학익힘』 52쪽 두 사람이 빠른 만큼의 차(초)', '1.8', M, '0.6'],
    ['l11', '『수학』 81쪽 스스로 마무리하기', '2.9', '+', '0.4'], ['l11', '『수학』 81쪽 스스로 마무리하기', '3.82', '+', '5.19'], ['l11', '『수학』 81쪽 스스로 마무리하기', '9.5', M, '1.8'],
    ['l11', '『수학』 81쪽 스스로 마무리하기', '1.55', '+', '4.7'], ['l11', '『수학』 81쪽 스스로 마무리하기', '3.7', M, '0.17'], ['l11', '『수학』 81쪽 스스로 마무리하기', '8.31', M, '5.94'],
    ['l11', '『수학』 82쪽 나무의 키(m)', '1.6', '+', '0.52'], ['l11', '『수학』 83쪽 다람쥐의 몸무게(kg)', '0.63', '+', '0.02'],
    ['l11', '『수학』 83쪽 곰이 줄어든 몸무게(kg)', '135.12', M, '130.32'], ['l11', '『수학』 83쪽 원숭이가 늘어난 몸무게(kg)', '17.2', M, '16.3']
  ];

  /* ── 소수 = 정수 × 10^-p (부동소수 없이) ── */
  function np(s) { var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function toI(s, p) { var f = s.indexOf('.') < 0 ? '' : s.split('.')[1]; var ip = s.split('.')[0]; while (f.length < p) f += '0'; return parseInt(ip + f, 10); }
  function fmt(n, p) {
    if (n < 0) return null; var s = String(n); while (s.length <= p) s = '0' + s;
    var r = p ? s.slice(0, s.length - p) + '.' + s.slice(s.length - p) : s;
    if (r.indexOf('.') >= 0) r = r.replace(/0+$/, '').replace(/\.$/, '');
    return r;
  }
  function digits(n) { var d = []; for (var i = 0; i < 9; i++) { d.push(n % 10); n = Math.floor(n / 10); } return d; }
  function undg(d) { var n = 0; for (var i = d.length - 1; i >= 0; i--) n = n * 10 + d[i]; return n; }
  function calc(a, op, b) { var p = Math.max(np(a), np(b)); var A = toI(a, p), B = toI(b, p); return fmt(op === '+' ? A + B : A - B, p); }
  /* 오류 모형 — 학습지 생성기(gen_tb.py)와 같은 정의 */
  var MODELS = {
    nocarry: function (a, b) { var p = Math.max(np(a), np(b)), A = digits(toI(a, p)), B = digits(toI(b, p)), top = 0, i; for (i = 0; i < 9; i++) if (A[i] || B[i]) top = i;
      var r = 0; for (i = 0; i < top; i++) r += ((A[i] + B[i]) % 10) * Math.pow(10, i); r += (A[top] + B[top]) * Math.pow(10, top); return fmt(r, p); },
    ptleft: function (a, b) { var p = Math.max(np(a), np(b)), A = digits(toI(a, p)), B = digits(toI(b, p)), fr = '', big = false, ip = 0, i;
      for (i = 0; i < p; i++) { var s = A[i] + B[i]; if (s >= 10) big = true; fr = s + fr; }
      if (!big || fr.length > 3) return null; for (i = p; i < 9; i++) ip += (A[i] + B[i]) * Math.pow(10, i - p); return fmt(toI(ip + '.' + fr, fr.length), fr.length); },
    misal: function (a, b, op) { if (np(a) === np(b)) return null; var ia = parseInt(a.replace('.', ''), 10), ib = parseInt(b.replace('.', ''), 10), v = op === '+' ? ia + ib : ia - ib;
      return v > 0 ? fmt(v, Math.max(np(a), np(b))) : null; },
    revsub: function (a, b) { var p = Math.max(np(a), np(b)), A = digits(toI(a, p)), B = digits(toI(b, p)); return fmt(undg(A.map(function (x, i) { return Math.abs(x - B[i]); })), p); },
    nodec: function (a, b) { var p = Math.max(np(a), np(b)), A = digits(toI(a, p)), B = digits(toI(b, p)); return fmt(undg(A.map(function (x, i) { return x >= B[i] ? x - B[i] : 10 + x - B[i]; })), p); },
    cpempty: function (a, b) { var pa = np(a), pb = np(b); if (pb <= pa) return null; var tb = b.slice(0, b.indexOf('.') + 1 + pa).replace(/\.$/, '');
      var p = pb, A = toI(a, p), T = toI(tb, p), B = toI(b, p); return A > T ? fmt(A - T + (B - T), p) : null; }
  };
  var ADDM = ['nocarry', 'ptleft', 'misal'], SUBM = ['revsub', 'nodec', 'cpempty', 'misal'];
  var PN = { '-3': '소수 셋째 자리', '-2': '소수 둘째 자리', '-1': '소수 첫째 자리', '0': '일의 자리', '1': '십의 자리' };
  function eul(d) { return '2459'.indexOf(String(d).slice(-1)) >= 0 ? '를' : '을'; }

  function typeOf(it) { if (it[0] === 'l10') return 'swim'; var two = Math.max(np(it[2]), np(it[4])) >= 2; return (it[3] === '+' ? 'add' : 'sub') + (two ? '2' : '1'); }
  function hint(a, op, b) {
    var p = Math.max(np(a), np(b)), A = digits(toI(a, p)), B = digits(toI(b, p)), i, head = '소수점을 맞추어 같은 자리끼리 세로로 써요';
    if (np(a) !== np(b)) head += ' — 빈 자리는 0으로 보아요(' + (np(a) < np(b) ? a : b) + '0…)';
    if (op === '+') {
      var c = 0;
      for (i = 0; i < 9; i++) { var s = A[i] + B[i] + c; if (s >= 10 && i - p < 1) return head + '. ' + PN[i - p] + ': ' + A[i] + ' + ' + B[i] + (c ? ' + 1' : '') + ' = ' + s + ' — 10이 넘으니 윗자리로 1을 받아올려요.'; c = s >= 10 ? 1 : 0; }
      return head + '. 받아올림 없이 ' + (p ? fmt(1, p) + '의 개수끼리 더해요.' : '더해요.');
    }
    var bor = 0;
    for (i = 0; i < 9; i++) { var x = A[i] - bor; if (x < B[i]) return head + '. ' + PN[i - p] + ': ' + x + '에서 ' + B[i] + eul(B[i]) + ' 뺄 수 없어요 — 윗자리에서 받아내려(1 = 아랫자리 10) 빼요.'; bor = 0; }
    return head + '. 받아내림 없이 ' + (p ? fmt(1, p) + '의 개수끼리 빼요.' : '빼요.');
  }
  function optionsFor(it) {
    var a = it[2], op = it[3], b = it[4], ans = calc(a, op, b), out = [ans], seen = {}; seen[ans] = 1;
    (op === '+' ? ADDM : SUBM).forEach(function (m) { var v = MODELS[m](a, b, op === '+' ? '+' : '-'); if (v && !seen[v] && np(v) <= 3 && out.length < 4) { seen[v] = 1; out.push(v); } });
    var p = Math.max(np(a), np(b), 1), A = toI(ans, p);
    [fmt(A * 10, p), fmt(A, p + 1)].forEach(function (v) { if (v && !seen[v] && np(v) <= 3 && out.length < 4) { seen[v] = 1; out.push(v); } });
    return out;
  }
  var ITEMS = BANK.map(function (it, k) { return { id: 'r' + (k + 1), l: it[0], src: it[1], a: it[2], op: it[3], b: it[4], answer: calc(it[2], it[3], it[4]), type: typeOf(it), opts: optionsFor(it), explain: hint(it[2], it[3], it[4]) }; });

  function shuffle(arr, rng) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function pool(upto) {
    var li = ORDER.indexOf(upto === 'all' ? 'l11' : upto); if (li < 0) li = ORDER.length - 1;
    return { items: ITEMS.filter(function (it) { return ORDER.indexOf(it.l) <= li; }), focus: ORDER[li] };
  }

  return {
    id: 'g4_2_swim_relay',
    title: '혼계영 계산 릴레이',
    ORDER: ORDER, STROKES: STROKES, BANK: BANK, ITEMS: ITEMS, MODELS: MODELS, calc: calc,
    create: function (params, rng) {
      var P = pool((params || {}).upto || 'all'), deck = [], first = true, last = null, n = 0;
      function refill() {
        var f = P.items.filter(function (it) { return it.l === P.focus; }), rest = P.items.filter(function (it) { return it.l !== P.focus; });
        var d = first ? shuffle(f.slice(), rng).concat(shuffle(rest.slice(), rng)) : shuffle(P.items.slice(), rng);
        if (last && d.length > 1 && d[0].id === last.id) { var t = d[0]; d[0] = d[1]; d[1] = t; }
        first = false; deck = d;
      }
      return {
        size: P.items.length,
        next: function () {
          if (!deck.length) refill();
          var it = deck.shift(); last = it;
          var opts = shuffle(it.opts.slice(), rng), leg = STROKES[n % 4]; n++;
          return { id: it.id, l: it.l, src: it.src, a: it.a, op: it.op, b: it.b, prompt: it.a + ' ' + it.op + ' ' + it.b + ' = ?', answer: it.answer, options: opts, type: it.type, explain: it.explain, leg: leg };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-num">' + q.a + ' ' + q.op + ' ' + q.b + ' =</span><span class="w-box"> </span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '소수점을 맞추어 계산해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
