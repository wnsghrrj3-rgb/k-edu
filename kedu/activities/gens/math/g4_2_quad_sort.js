/* gens/math/g4_2_quad_sort.js — 사각형 분류 경주 (4학년 2학기 수학 2단원 「사각형」 l05 · l06 · l07 · l08 · l10)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 사각형은 교과서·익힘·확인 문제 분류 판 그대로
 * (모눈 좌표 = 교과서 판의 평행한 변·변의 길이·직각 관계 · 정답은 아래 셈으로 좌표에서 직접 — 사람 손 정답 없음).
 * 칸(차시마다 교과서 표 머리 그대로):
 *   l05  『수학』 38쪽 1번 표 — 평행한 변이 있는 사각형 / 평행한 변이 없는 사각형
 *   l06  『수학』 40쪽 1번 표 — 평행한 변이 없는 사각형 / 평행한 변이 한 쌍인 사각형 / 평행한 변이 두 쌍인 사각형
 *   l07  『수학』 42쪽 1번 표 — 네 변의 길이가 모두 같은 사각형 / 길이가 다른 변이 있는 사각형
 *   all  (l08 · l10) 『수학』 51쪽 만화 「평행한 변이 한 쌍인 사각형과 두 쌍인 사각형으로 분류할 수 있어!」 — 40쪽 세 칸으로 단원의 모든 판
 * 판 출처(지도서 4-2 수학 2단원 198~255쪽):
 *   l05  『수학』 38쪽 책장과 사다리 가~바 · 『수학익힘』 26쪽 책장과 사다리 가~마 · 26쪽 1번 가~라 · 사다리꼴 확인 문제 가~라
 *   l06  『수학』 40쪽 벽과 난간 가~바 · 『수학익힘』 28쪽 1번 가~라 · 평행사변형 확인 문제 가~라
 *   l07  『수학』 42쪽 학교 정문 가~바 · 『수학익힘』 30쪽 1번 가~라 · 마름모 확인 문제 가~라
 *   l08  『수학』 45쪽 보도블록 가~마 · 『수학익힘』 32쪽 2번 가~라 · 여러 가지 사각형 확인 문제 가~다   l10  『수학』 49쪽 스스로 마무리하기 4번 가~마
 * 진단 축(type = 사각형 갈래 · 학습지 오개념): 직사각형·정사각형도 평행한 변이 두 쌍(X11) · 두 쌍이어도 평행한 변이 있음(X09) · 기울어진 사다리꼴(X10)
 *   · 정사각형도 네 변이 같음(X17) · 연 모양은 이웃한 변끼리만 같음 · 평행사변형은 길이가 다른 변(X14)
 * 풀이 = 「판 이름 글자 — 칸 이름이에요. 까닭」(좌표에서 센 평행한 변 쌍·변의 길이).
 * params: { upto: 'l05'|'l06'|'l07'|'all' } — 칸은 upto 로 정해진다(categoriesFor) · 판은 그 차시까지 누적(이번 차시 판이 덱 앞머리)
 * next() → { item, tag, letter, pts, cat, type, l, explain }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_quad_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05', 'l06', 'l07', 'l08', 'l10'];
  var AXES = {
    l05: [{ key: 'par_yes', label: '평행한 변이 있는 사각형' }, { key: 'par_no', label: '평행한 변이 없는 사각형' }],
    l06: [{ key: 'p0', label: '평행한 변이 없는 사각형' }, { key: 'p1', label: '평행한 변이 한 쌍인 사각형' }, { key: 'p2', label: '평행한 변이 두 쌍인 사각형' }],
    l07: [{ key: 'eq4', label: '네 변의 길이가 모두 같은 사각형' }, { key: 'neq', label: '길이가 다른 변이 있는 사각형' }]
  };
  AXES.all = AXES.l06;
  var CNAME = {};
  Object.keys(AXES).forEach(function (a) { AXES[a].forEach(function (c) { CNAME[c.key] = c.label; }); });

  /* 사각형 모양(모눈 칸, 7 × 6 칸 안) — 교과서 판의 관계 그대로 */
  var SH = {
    tA: [[2, 1.5], [5, 1.5], [6.5, 5], [0.5, 5]], tB: [[1, 1.5], [4, 1.5], [6, 5], [1, 5]], tC: [[0.5, 1.5], [6.5, 1.5], [4.5, 5], [2.5, 5]],
    tD: [[0.5, 3.5], [4.5, 1.5], [6.5, 3.5], [3.5, 5]], tE: [[1, 1.5], [6, 1.5], [6, 5], [2.5, 5]], tF: [[1.5, 1.5], [4, 1.5], [6.5, 5], [1.5, 5]],
    pA: [[2, 1.5], [6.5, 1.5], [5, 5], [0.5, 5]], pB: [[0.5, 4], [3.5, 1.5], [6.5, 2.5], [3.5, 5]], pC: [[2, 1.3], [4.5, 1.3], [5, 5.4], [2.5, 5.4]],
    pD: [[0.5, 1.5], [4.5, 1.5], [6.5, 5], [2.5, 5]],
    rA: [[0.5, 3.5], [3.5, 2], [6.5, 3.5], [3.5, 5]], rB: [[3.5, 1.2], [5, 3.4], [3.5, 5.6], [2, 3.4]],
    sA: [[1.5, 1.5], [5.5, 1.5], [5.5, 5.5], [1.5, 5.5]], sB: [[3.5, 1.2], [5.7, 3.4], [3.5, 5.6], [1.3, 3.4]], sC: [[2, 2], [5, 2], [5, 5], [2, 5]],
    eA: [[0.5, 2], [6.5, 2], [6.5, 5], [0.5, 5]], eB: [[2, 1.2], [5, 1.2], [5, 5.6], [2, 5.6]], eC: [[1, 1.5], [6, 1.5], [6, 5], [1, 5]],
    qA: [[1, 2], [5, 1.5], [6.5, 5], [2, 4.5]], qB: [[0.5, 4], [3, 1.5], [6.5, 2.5], [5, 5.5]], qC: [[3.5, 1.2], [5.5, 2.8], [3.5, 5.6], [1.5, 2.8]],
    qD: [[0.5, 3.5], [5.5, 2.2], [6.5, 3.5], [5.5, 4.8]], qE: [[1, 1.5], [5.5, 2.5], [6.5, 5], [0.5, 4.5]]
  };
  /* [차시, 판 이름, 모양 차례(가·나·다…)] */
  var BOARDS = [
    ['l05', '『수학』 38쪽 책장과 사다리', ['tB', 'qA', 'qB', 'eC', 'pA', 'tC']],
    ['l05', '『수학익힘』 26쪽 책장과 사다리', ['tA', 'tD', 'qE', 'qB', 'tC']],
    ['l05', '『수학익힘』 26쪽 1번', ['qE', 'tA', 'tD', 'qB']],
    ['l05', '사다리꼴 확인 문제', ['tC', 'eA', 'tF', 'qA']],
    ['l06', '『수학』 40쪽 벽과 난간', ['tA', 'qA', 'pA', 'qB', 'pB', 'eA']],
    ['l06', '『수학익힘』 28쪽 1번', ['pA', 'qC', 'tE', 'eC']],
    ['l06', '평행사변형 확인 문제', ['tF', 'eB', 'tC', 'pD']],
    ['l07', '『수학』 42쪽 학교 정문', ['rA', 'pA', 'pC', 'qD', 'tA', 'sC']],
    ['l07', '『수학익힘』 30쪽 1번', ['sB', 'rA', 'eB', 'pC']],
    ['l07', '마름모 확인 문제', ['rB', 'sA', 'eB', 'pA']],
    ['l08', '『수학』 45쪽 보도블록', ['tA', 'pA', 'eA', 'rA', 'sA']],
    ['l08', '『수학익힘』 32쪽 2번', ['sC', 'sB', 'eB', 'rA']],
    ['l08', '여러 가지 사각형 확인 문제', ['eA', 'pA', 'sA']],
    ['l10', '『수학』 49쪽 스스로 마무리하기', ['tC', 'pD', 'sB', 'rB', 'eB']]
  ];
  var LET = '가나다라마바';

  /* ── 좌표 셈 — 평행한 변 쌍 · 네 변이 같은지 · 직각 수 ── */
  function v(a, b) { return [b[0] - a[0], b[1] - a[1]]; }
  function crs(u, w) { return u[0] * w[1] - u[1] * w[0]; }
  function dot(u, w) { return u[0] * w[0] + u[1] * w[1]; }
  function len2(u) { return u[0] * u[0] + u[1] * u[1]; }
  function sides(P) { return [0, 1, 2, 3].map(function (i) { return v(P[i], P[(i + 1) % 4]); }); }
  function parPairs(P) { var S = sides(P); return (Math.abs(crs(S[0], S[2])) < 1e-9 ? 1 : 0) + (Math.abs(crs(S[1], S[3])) < 1e-9 ? 1 : 0); }
  function eq4(P) { var L = sides(P).map(len2); return Math.max.apply(null, L) - Math.min.apply(null, L) < 1e-9; }
  function rights(P) { var S = sides(P), n = 0; for (var i = 0; i < 4; i++) if (Math.abs(dot(S[i], S[(i + 3) % 4])) < 1e-9) n++; return n; }
  function kite(P) { var L = sides(P).map(len2); return !eq4(P) && ((Math.abs(L[0] - L[1]) < 1e-9 && Math.abs(L[2] - L[3]) < 1e-9) || (Math.abs(L[1] - L[2]) < 1e-9 && Math.abs(L[3] - L[0]) < 1e-9)); }
  function kind(P) {
    var pp = parPairs(P), e = eq4(P), r = rights(P);
    if (pp === 2 && e && r === 4) return 'sq';
    if (pp === 2 && r === 4) return 'rect';
    if (e) return 'rh';
    if (pp === 2) return 'para';
    if (pp === 1) return 'trap';
    return kite(P) ? 'kite' : 'quad';
  }
  function catOf(axis, P) {
    if (axis === 'l05') return parPairs(P) ? 'par_yes' : 'par_no';
    if (axis === 'l07') return eq4(P) ? 'eq4' : 'neq';
    return 'p' + parPairs(P);
  }
  /* 까닭(좌표에서 센 관계) + 덫 풀이 */
  var WHY = {
    par_yes: { trap: '마주 보는 한 쌍의 변이 평행해요.', tilt: '평행한 변이 비스듬히 놓였어도 평행해요.', two: '평행한 변이 두 쌍 있어요 — 한 쌍이라도 있으면 「있는」 칸이에요.' },
    par_no: '어느 마주 보는 두 변을 늘여도 만나요 — 평행한 변이 없어요.',
    p0: '어느 마주 보는 두 변을 늘여도 만나요 — 평행한 변이 없어요.',
    p1: '마주 보는 변 가운데 한 쌍만 평행해요.',
    p2: { para: '마주 보는 두 쌍의 변이 모두 평행해요.', rect: '네 각이 직각이라 비스듬하지 않아도 마주 보는 두 쌍의 변이 모두 평행해요.', rh: '네 변의 길이가 같고, 마주 보는 두 쌍의 변이 모두 평행해요.' },
    eq4: { rh: '네 변의 길이가 모두 같아요.', sq: '정사각형도 네 변의 길이가 모두 같아요 — 직각이어도 이 칸이에요.' },
    neq: { para: '마주 보는 두 변끼리는 같지만 이웃한 두 변의 길이가 달라요.', kite: '이웃한 두 변끼리만 같아요 — 네 변이 모두 같지는 않아요.', rect: '마주 보는 두 변끼리는 같지만 이웃한 두 변의 길이가 달라요.', other: '길이가 다른 변이 있어요.' }
  };
  function why(cat, P) {
    var k = kind(P);
    if (cat === 'par_yes') return parPairs(P) === 2 ? WHY.par_yes.two : (Math.abs(sides(P)[0][1]) < 1e-9 || Math.abs(sides(P)[1][1]) < 1e-9 ? WHY.par_yes.trap : WHY.par_yes.tilt);
    if (cat === 'p2') return WHY.p2[k === 'sq' || k === 'rect' ? 'rect' : (k === 'rh' ? 'rh' : 'para')];
    if (cat === 'eq4') return WHY.eq4[k === 'sq' ? 'sq' : 'rh'];
    if (cat === 'neq') return WHY.neq[k === 'para' ? 'para' : k === 'kite' ? 'kite' : k === 'rect' ? 'rect' : 'other'];
    return WHY[cat];
  }
  var ITEMS = [];
  BOARDS.forEach(function (b) { b[2].forEach(function (key, i) { ITEMS.push({ l: b[0], board: b[1], letter: LET[i], key: key, pts: SH[key] }); }); });

  function svg(P) {
    var s = '<svg class="qs" viewBox="-0.3 0.6 7.6 5.6" role="img" aria-label="모눈 위의 사각형">';
    for (var x = 0; x <= 7; x++) s += '<line x1="' + x + '" y1="0.6" x2="' + x + '" y2="6.2" class="g"/>';
    for (var y = 1; y <= 6; y++) s += '<line x1="-0.3" y1="' + y + '" x2="7.3" y2="' + y + '" class="g"/>';
    return s + '<polygon points="' + P.map(function (p) { return p.join(','); }).join(' ') + '" class="q"/></svg>';
  }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function axisOf(upto) { return upto === 'l05' || upto === 'l06' || upto === 'l07' ? upto : 'all'; }
  function build(it, axis) {
    var c = catOf(axis, it.pts), tag = it.board + ' ' + it.letter;
    return { l: it.l, axis: axis, tag: tag, letter: it.letter, pts: it.pts, cat: c, type: kind(it.pts), item: tag, svg: svg(it.pts),
             explain: tag + ' — ' + CNAME[c] + '이에요. ' + why(c, it.pts) };
  }

  return {
    id: 'g4_2_quad_sort',
    title: '사각형 분류 경주',
    ORDER: ORDER, AXES: AXES, SH: SH, BOARDS: BOARDS, ITEMS: ITEMS, CNAME: CNAME,
    categories: AXES.all,
    categoriesFor: function (upto) { return AXES[axisOf(upto)]; },
    kind: kind, parPairs: parPairs, eq4: eq4, catOf: catOf, svg: svg,
    create: function (params, rng) {
      var p = params || {};
      var axis = axisOf(p.upto), lim = axis === 'all' ? ORDER.length - 1 : ORDER.indexOf(axis);
      var idx = [], focus = [];
      ITEMS.forEach(function (it, k) { var li = ORDER.indexOf(it.l); if (li <= lim) { idx.push(k); if (axis !== 'all' && li === lim) focus.push(k); } });
      var rest = idx.filter(function (k) { return focus.indexOf(k) < 0; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, rest));
      var lastBoard = '', lastCat = '', run = 0, nf = focus.length;
      function find(d) {
        for (var t = 0; t < d.length; t++) { var it = ITEMS[d[t]], c = catOf(axis, it.pts); if (it.board === lastBoard) continue; if (run >= 1 && c === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length, axis: axis,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); nf = 0; }
          var at = find(nf ? deck.slice(0, nf) : deck);                 // 이번 차시 판이 덱 앞머리 — 다 나올 때까지 그 안에서 고름
          if (at < 0 && nf) at = 0;
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(deck); if (at < 0) at = 0; }
          if (at < nf) nf--;
          var k = deck.splice(at, 1)[0], it = ITEMS[k], c = catOf(axis, it.pts);
          run = c === lastCat ? run + 1 : 0; lastCat = c; lastBoard = it.board;
          return build(it, axis);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.item + ' (모눈 위 사각형) → □ ' + AXES[q.axis].map(function (c) { return c.label; }).join(' □ '); },
    printAnswer: function (q) { return q.item + ' → ' + CNAME[q.cat]; },
    printHead: '모눈 위 사각형을 보고 평행한 변의 수나 변의 길이에 따라 알맞은 칸에 ✓ 하세요.'
  };
}));
