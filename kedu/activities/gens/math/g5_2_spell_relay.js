/* gens/math/g5_2_spell_relay.js — 「뾰로롱 방 탈출 주문 릴레이」 수의 범위 바통 (5학년 2학기 수학 1단원 「수의 범위와 어림하기」 l02~l04 · l10 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 relay(반 전체 바통 · 혼자 바통 10개)가 쓴다.
 * 근거 = 지도서(수학 5-2 공통자료) 113~162쪽 + 평가 부록 420~422·458~469 — 교과서 수·장면 그대로(handoff kedu/textbook2/g5_2_math_u1/활동목록.md):
 *   『수학』 24~25쪽 함께하는 수학 「뾰로롱 방 탈출」 12문제(약병 글자 알·쏭·달·쏭·떼·구·루·루·두·둥·실·뿅 → 주문 「알쏭달쏭떼구루루두둥실뿅」) ·
 *   10~11쪽 사과주스·세탁 세제·30 이상/24 이하 · 12~13쪽 공항 가방·반려동물·40 초과/32 미만 · 14쪽 5 초과 10 미만 · 수업 전 확인 문제 ·
 *   『수학익힘』 8~13쪽(달리기·투표·해저 터널) · 형성 평가 420~422 · 단원 평가 458~469 · 『수학』 28쪽 문제로 마무리 1·3.
 * 바통 하나 = 수의 범위 문제 하나. 뾰로롱 약병 문제를 맞히면 그 답이 쓰인 구슬에 약병 글자가 들어간다(무대가 주문 판에 채움).
 *   지도서 157쪽 「활동의 변형」(답이 한 개가 되는 문제를 만들어 짝과 바꾸어 풀기)을 반 전체 바통으로.
 * 보기 = 정답 + 학습지(tb_g5_2_math_u1)와 같은 오류 모형의 결과:
 *   lo 아래 끝의 포함을 거꾸로(이상↔초과 — X01·X02) · hi 위 끝의 포함을 거꾸로(이하↔미만) · both 양 끝 모두 거꾸로(X05)
 *   — 모자라면 정답 ± 1(하나 많거나 적게 셈 X06 · 모자라면 + 2·+ 3). 정답과 같은 값 0.
 * 힌트(explain) = 방법만 — 수는 말하지 않는다(오답 뒤에도 그대로 보이므로).
 * type(문항 단위 · 진단 축 = 학습지 개념 C1~C3): incl 이상·이하(한쪽 · 경곗값 포함) · excl 초과·미만(한쪽 · 경곗값 빠짐) · between 두 조건(사이의 범위)
 * params: { upto: 'l02'|'l03'|'l04'|'all' } — 그 차시까지 누적, 이번 차시 문제가 덱 앞머리. all = 단원 전체(앞머리 = 마무리 l10)
 * next() → { id, l, src, prompt, html, answer, options, type, explain, leg, spell }  (spell = [약병 글자, 구슬 번호] 또는 null)
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_spell_relay'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l03', 'l04', 'l10'];
  var SPELL = '알쏭달쏭떼구루루두둥실뿅';
  var T = true, F = false, N = null;
  /* [차시, 교과서 자리, 발문, [아래 끝, 포함?, 위 끝, 포함?], 물음, 수 목록(없으면 null), 약병 글자(뾰로롱만)]
     물음: count 목록에서 범위에 드는 수의 개수 · pick 목록에서 범위에 드는 수 · ncount 범위의 자연수 개수 · nmin/nmax 가장 작은/큰 자연수 · nsum 자연수의 합 · nprod 자연수의 곱 */
  var BANK = [
    ['l02', '『수학』 24쪽 뾰로롱 방 탈출 — 약병 「알」', '1 이상 9 이하인 수 중에서 가장 작은 수는 얼마일까요?', [1, T, 9, T], 'nmin', N, '알'],
    ['l02', '『수학』 25쪽 뾰로롱 방 탈출 — 약병 「떼」', '5와 6 중에서 5 이하인 수는 무엇일까요?', [N, F, 5, T], 'pick', ['5', '6'], '떼'],
    ['l02', '『수학』 25쪽 뾰로롱 방 탈출 — 약병 「구」', '25 이상 30 이하인 자연수의 개수는 몇 개일까요?', [25, T, 30, T], 'ncount', N, '구'],
    ['l02', '『수학』 24쪽 뾰로롱 방 탈출 — 약병 「둥」', '4 이하인 자연수의 합은 얼마일까요?', [N, F, 4, T], 'nsum', N, '둥'],
    ['l02', '『수학』 10쪽 사과주스', '사과주스 1.2 L, 2 L, 1.9 L, 2.8 L, 2.1 L, 3 L 중에서 2 L 이상인 것은 몇 개일까요?', [2, T, N, F], 'count', ['1.2', '2', '1.9', '2.8', '2.1', '3'], N],
    ['l02', '『수학』 11쪽 세탁 세제', '세탁 세제 2.7 L, 4 L, 3 L, 2.5 L, 3.7 L, 3.2 L 중에서 3 L 이하인 것은 몇 개일까요?', [N, F, 3, T], 'count', ['2.7', '4', '3', '2.5', '3.7', '3.2'], N],
    ['l02', '『수학』 11쪽 ○표 하기', '14.2, 24, 29.7, 33.8, 27, 40, 30, 20.5 중에서 30 이상인 수는 몇 개일까요?', [30, T, N, F], 'count', ['14.2', '24', '29.7', '33.8', '27', '40', '30', '20.5'], N],
    ['l02', '『수학』 11쪽 △표 하기', '14.2, 24, 29.7, 33.8, 27, 40, 30, 20.5 중에서 24 이하인 수는 몇 개일까요?', [N, F, 24, T], 'count', ['14.2', '24', '29.7', '33.8', '27', '40', '30', '20.5'], N],
    ['l02', '『수학익힘』 9쪽 50 m 달리기', '기록 11.2초, 13초, 9.5초, 8.7초, 12.4초, 9초 중에서 9초 이하인 기록은 몇 개일까요?', [N, F, 9, T], 'count', ['11.2', '13', '9.5', '8.7', '12.4', '9'], N],
    ['l02', '『수학익힘』 9쪽 선거일 투표', '아버지 46세, 어머니 45세, 언니 18세, 연주 12세 중에서 18세 이상은 몇 명일까요?', [18, T, N, F], 'count', ['46', '45', '18', '12'], N],
    ['l02', '형성 평가 420쪽', '33, 21, 19.8, 25, 25.4, 8.52, 29 1/2 중에서 25 이상인 수는 몇 개일까요?', [25, T, N, F], 'count', ['33', '21', '19.8', '25', '25.4', '8.52', '29 1/2'], N],
    ['l02', '형성 평가 420쪽 제자리멀리뛰기', '기록 141 cm, 105.6 cm, 99.4 cm, 122 cm, 175 cm 중에서 122 cm 이하인 기록은 몇 개일까요?', [N, F, 122, T], 'count', ['141', '105.6', '99.4', '122', '175'], N],
    ['l02', '단원 평가 466쪽 금메달 수', '금메달 13개, 12개, 15개, 4개, 20개, 9개 중에서 15개 이상은 몇 나라일까요?', [15, T, N, F], 'count', ['13', '12', '15', '4', '20', '9'], N],
    ['l03', '『수학』 25쪽 뾰로롱 방 탈출 — 약병 「달」', '15 초과 19 미만인 자연수의 개수는 몇 개일까요?', [15, F, 19, F], 'ncount', N, '달'],
    ['l03', '『수학』 25쪽 뾰로롱 방 탈출 — 약병 「루」', '7 초과 9 미만인 자연수는 무엇일까요?', [7, F, 9, F], 'nmin', N, '루'],
    ['l03', '『수학』 25쪽 뾰로롱 방 탈출 — 약병 「실」', '12 미만인 수 중에서 가장 큰 자연수는 무엇일까요?', [N, F, 12, F], 'nmax', N, '실'],
    ['l03', '『수학』 12쪽 공항 가방', '가방 8.9 kg, 10.5 kg, 13 kg, 9.5 kg, 12 kg, 10 kg 중에서 10 kg 초과인 가방은 몇 개일까요?', [10, F, N, F], 'count', ['8.9', '10.5', '13', '9.5', '12', '10'], N],
    ['l03', '『수학』 13쪽 반려동물 탑승', '8 kg, 6.4 kg, 8.5 kg, 9 kg, 7.9 kg 중에서 8 kg 미만인 것은 몇 개일까요?', [N, F, 8, F], 'count', ['8', '6.4', '8.5', '9', '7.9'], N],
    ['l03', '『수학』 13쪽 ○표 하기', '42, 40, 39.5, 7, 32, 15.8, 31.9, 45.8 중에서 40 초과인 수는 몇 개일까요?', [40, F, N, F], 'count', ['42', '40', '39.5', '7', '32', '15.8', '31.9', '45.8'], N],
    ['l03', '『수학』 13쪽 △표 하기', '42, 40, 39.5, 7, 32, 15.8, 31.9, 45.8 중에서 32 미만인 수는 몇 개일까요?', [N, F, 32, F], 'count', ['42', '40', '39.5', '7', '32', '15.8', '31.9', '45.8'], N],
    ['l03', '『수학익힘』 11쪽 해저 터널', '높이 4 m, 5.1 m, 4.9 m, 4.4 m 중에서 4.4 m 초과인 높이는 몇 개일까요?', [4.4, F, N, F], 'count', ['4', '5.1', '4.9', '4.4'], N],
    ['l03', '형성 평가 421쪽', '12.7, 15.1, 12 7/8, 15, 30, 14.78, 19 중에서 15 초과인 수는 몇 개일까요?', [15, F, N, F], 'count', ['12.7', '15.1', '12 7/8', '15', '30', '14.78', '19'], N],
    ['l03', '형성 평가 421쪽 딸기', '딸기 21 g, 32 g, 29.9 g, 30.9 g, 17 g 중에서 30 g 초과인 딸기는 몇 개일까요?', [30, F, N, F], 'count', ['21', '32', '29.9', '30.9', '17'], N],
    ['l03', '단원 평가 459쪽 터널', '높이 3.45 m, 3.8 m, 3.5 m, 3.2 m 중에서 3.5 m 미만인 높이는 몇 개일까요?', [N, F, 3.5, F], 'count', ['3.45', '3.8', '3.5', '3.2'], N],
    ['l03', '『수학』 14쪽 수업 전 확인', '4 미만인 자연수는 몇 개일까요?', [N, F, 4, F], 'ncount', N, N],
    ['l03', '『수학』 12쪽 초과 알아보기', '10 초과인 자연수 중에서 가장 작은 수는 무엇일까요?', [10, F, N, F], 'nmin', N, N],
    ['l03', '『수학』 13쪽 미만 알아보기', '8 미만인 자연수 중에서 가장 큰 수는 무엇일까요?', [N, F, 8, F], 'nmax', N, N],
    ['l04', '『수학』 24쪽 뾰로롱 방 탈출 — 약병 「쏭」', '2.4, 5.1, 3.7 중에서 1 이상 4 미만인 수의 개수는 몇 개일까요?', [1, T, 4, F], 'count', ['2.4', '5.1', '3.7'], '쏭'],
    ['l04', '『수학』 25쪽 뾰로롱 방 탈출 — 약병 「쏭」', '3 초과 5 이하인 수 중에서 가장 작은 자연수는 무엇일까요?', [3, F, 5, T], 'nmin', N, '쏭'],
    ['l04', '『수학』 24쪽 뾰로롱 방 탈출 — 약병 「루」', '2 초과 4 이하인 자연수의 합은 얼마일까요?', [2, F, 4, T], 'nsum', N, '루'],
    ['l04', '『수학』 24쪽 뾰로롱 방 탈출 — 약병 「두」', '2 이상 5 미만인 자연수의 합은 얼마일까요?', [2, T, 5, F], 'nsum', N, '두'],
    ['l04', '『수학』 24쪽 뾰로롱 방 탈출 — 약병 「뿅」', '3 이상 5 미만인 자연수의 곱은 얼마일까요?', [3, T, 5, F], 'nprod', N, '뿅'],
    ['l04', '『수학』 14쪽 수의 범위', '5, 7, 8.5, 10 중에서 5 초과 10 미만인 수는 몇 개일까요?', [5, F, 10, F], 'count', ['5', '7', '8.5', '10'], N],
    ['l04', '『수학』 16쪽 수업 전 확인', '10 초과 15 이하인 자연수는 몇 개일까요?', [10, F, 15, T], 'ncount', N, N],
    ['l04', '형성 평가 422쪽', '27, 17, 30, 21, 50, 12, 29 중에서 21 초과 30 이하인 수는 몇 개일까요?', [21, F, 30, T], 'count', ['27', '17', '30', '21', '50', '12', '29'], N],
    ['l04', '단원 평가 460쪽', '29, 38.2, 45.1, 36, 42.7, 43, 40, 35.9 중에서 36 이상 43 미만인 수는 몇 개일까요?', [36, T, 43, F], 'count', ['29', '38.2', '45.1', '36', '42.7', '43', '40', '35.9'], N],
    ['l04', '단원 평가 465쪽', '20, 17.8, 25, 21.3, 18.6, 16, 19.1, 30 중에서 19 초과 25 미만인 수는 몇 개일까요?', [19, F, 25, F], 'count', ['20', '17.8', '25', '21.3', '18.6', '16', '19.1', '30'], N],
    ['l04', '단원 평가 468쪽', '167 이상 175 미만인 자연수는 몇 개일까요?', [167, T, 175, F], 'ncount', N, N],
    ['l10', '『수학』 28쪽 문제로 마무리 1', '45, 35, 30, 25, 50 중에서 35 이상인 수는 몇 개일까요?', [35, T, N, F], 'count', ['45', '35', '30', '25', '50'], N],
    ['l10', '『수학』 28쪽 문제로 마무리 1', '26, 49, 40, 37, 30 중에서 40 미만인 수는 몇 개일까요?', [N, F, 40, F], 'count', ['26', '49', '40', '37', '30'], N],
    ['l10', '『수학』 28쪽 문제로 마무리 3', '24, 14.6, 24.5, 17, 12, 20.7, 22, 10.1 중에서 12 초과 24 미만인 수는 몇 개일까요?', [12, F, 24, F], 'count', ['24', '14.6', '24.5', '17', '12', '20.7', '22', '10.1'], N],
    ['l10', '단원 평가 458쪽', '84, 55, 49, 60, 63, 72, 52, 77 중에서 77 이상인 수는 몇 개일까요?', [77, T, N, F], 'count', ['84', '55', '49', '60', '63', '72', '52', '77'], N],
    ['l10', '단원 평가 458쪽', '84, 55, 49, 60, 63, 72, 52, 77 중에서 52 이하인 수는 몇 개일까요?', [N, F, 52, T], 'count', ['84', '55', '49', '60', '63', '72', '52', '77'], N],
    ['l10', '단원 평가 462쪽', '49, 61, 56, 38, 52 중에서 52 미만인 수는 몇 개일까요?', [N, F, 52, F], 'count', ['49', '61', '56', '38', '52'], N],
    ['l10', '단원 평가 466쪽', '55, 39, 59, 41, 43, 62 중에서 59 이상인 수는 몇 개일까요?', [59, T, N, F], 'count', ['55', '39', '59', '41', '43', '62'], N]
  ];

  /* ── 수 = [분자, 분모] 정수(부동소수 없이) — 「29 1/2」「12 7/8」「4.4」 ── */
  function parse(s) {
    s = String(s); var m = s.match(/^(\d+) (\d+)\/(\d+)$/); if (m) return [+m[1] * +m[3] + +m[2], +m[3]];
    m = s.match(/^(\d+)\.(\d+)$/); if (m) { var d = Math.pow(10, m[2].length); return [+m[1] * d + +m[2], d]; }
    return [parseInt(s, 10), 1];
  }
  function cmp(a, b) { var x = parse(a), y = parse(b); return x[0] * y[1] - y[0] * x[1]; }
  function inR(v, r) {
    if (r[0] !== null) { var c = cmp(v, r[0]); if (r[1] ? c < 0 : c <= 0) return false; }
    if (r[2] !== null) { var c2 = cmp(v, r[2]); if (r[3] ? c2 > 0 : c2 >= 0) return false; }
    return true;
  }
  function nats(r) { var lo = r[0] === null ? 1 : Math.floor(r[0]), hi = r[2] === null ? lo + 60 : Math.ceil(r[2]), out = []; for (var k = Math.max(1, lo); k <= hi; k++) if (inR(String(k), r)) out.push(k); return out; }
  function solve(r, ask, xs) {
    var ns;
    if (ask === 'count') return String(xs.filter(function (x) { return inR(x, r); }).length);
    if (ask === 'pick') { var p = xs.filter(function (x) { return inR(x, r); }); return p.length === 1 ? p[0] : null; }
    ns = nats(r); if (!ns.length) return null;
    if (ask === 'ncount') return String(ns.length);
    if (ask === 'nmin') return String(ns[0]);
    if (ask === 'nmax') return r[2] === null ? null : String(ns[ns.length - 1]);
    if (ask === 'nsum') return String(ns.reduce(function (a, b) { return a + b; }, 0));
    if (ask === 'nprod') return String(ns.reduce(function (a, b) { return a * b; }, 1));
    return null;
  }
  /* 오류 모형 — 학습지 생성기(gen_tb.py)의 오개념과 같은 정의 */
  var MODELS = {
    lo: function (r) { return r[0] === null ? null : [r[0], !r[1], r[2], r[3]]; },
    hi: function (r) { return r[2] === null ? null : [r[0], r[1], r[2], !r[3]]; },
    both: function (r) { return (r[0] === null || r[2] === null) ? null : [r[0], !r[1], r[2], !r[3]]; }
  };
  var MODEL_ORDER = ['lo', 'hi', 'both'];
  function kindOf(r) { if (r[0] !== null && r[2] !== null) return 'between'; return (r[0] !== null ? r[1] : r[3]) ? 'incl' : 'excl'; }
  var HINT = {
    incl: '이상·이하는 「같거나」 — 경곗값도 들어가요. 경곗값부터 하나씩 확인해요.',
    excl: '초과·미만은 경곗값이 빠져요. 경곗값은 세지 않고 하나씩 확인해요.',
    between: '두 조건을 함께 봐요 — 아래 끝과 위 끝이 들어가는지를 따로따로 확인해요.'
  };
  function optionsFor(r, ask, xs, ans) {
    var out = [ans], seen = {}; seen[ans] = 1;
    MODEL_ORDER.forEach(function (m) { var r2 = MODELS[m](r); var v = r2 && solve(r2, ask, xs); if (v !== null && v !== undefined && !seen[v] && out.length < 4) { seen[v] = 1; out.push(v); } });
    if (ask === 'pick') xs.forEach(function (x) { if (!seen[x] && out.length < 4) { seen[x] = 1; out.push(x); } });
    var a = parseInt(ans, 10);
    [a + 1, a - 1, a + 2, a + 3].forEach(function (v) { var s = String(v); if (v >= 1 && !seen[s] && out.length < 4) { seen[s] = 1; out.push(s); } });
    return out;
  }
  /* 화면 글 — 대분수는 자연수 + 세로 분수 덩이(.fr) */
  function html(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; })
      .replace(/(\d+) (\d+)\/(\d+)/g, '<span class="w-n">$1</span><span class="fr"><span class="fn">$2</span><span class="fd">$3</span></span>');
  }
  function read(s) { return String(s).replace(/(\d+) (\d+)\/(\d+)/g, '$1과 $3분의 $2'); }
  var ITEMS = BANK.map(function (it, k) {
    var r = it[3], ans = solve(r, it[4], it[5]), ty = kindOf(r);
    return { id: 's' + (k + 1), l: it[0], src: it[1], prompt: it[2], range: r, ask: it[4], xs: it[5], answer: ans, type: ty,
             opts: optionsFor(r, it[4], it[5], ans), explain: HINT[ty], spell: it[6] ? [it[6], +ans] : null };
  });

  function shuffle(arr, rng) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function pool(upto) {
    var li = ORDER.indexOf(upto === 'all' ? 'l10' : upto); if (li < 0) li = ORDER.length - 1;
    return { items: ITEMS.filter(function (it) { return ORDER.indexOf(it.l) <= li; }), focus: ORDER[li] };
  }

  return {
    id: 'g5_2_spell_relay',
    title: '뾰로롱 방 탈출 주문 릴레이',
    ORDER: ORDER, SPELL: SPELL, BANK: BANK, ITEMS: ITEMS, MODELS: MODELS, HINT: HINT,
    parse: parse, inR: inR, solve: solve, html: html, read: read,
    create: function (params, rng) {
      var P = pool((params || {}).upto || 'all'), deck = [], first = true, last = null;
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
          return { id: it.id, l: it.l, src: it.src, prompt: it.prompt, html: html(it.prompt), answer: it.answer, options: shuffle(it.opts.slice(), rng),
                   type: it.type, explain: it.explain, leg: it.spell ? '약병 문제 「' + it.spell[0] + '」' : '교과서 문제', spell: it.spell ? it.spell.slice() : null };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-num">' + html(q.prompt) + '</span><span class="w-box"> </span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '수의 범위를 생각하여 □ 안에 알맞은 수를 쓰세요.'
  };
}));
