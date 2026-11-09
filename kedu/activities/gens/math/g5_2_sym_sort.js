/* gens/math/g5_2_sym_sort.js — 대칭 네 갈래 분류 (5학년 2학기 수학 3단원 「합동과 대칭」 l04 · l07 · l08 · l11)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 도형은 교과서·익힘·평가 분류 판 그대로
 * (칸 좌표 = 케이학습지 교과서판 tb_g5_2_math_u3 의 geo 그림 좌표와 같은 것 — handoff kedu/textbook2/g5_2_math_u3/gen_tb.py ·
 *  정답은 아래 셈으로 좌표에서 직접: 대칭축 = 무게중심을 지나 꼭짓점·변의 가운데를 향하는 직선마다 접어 보기 · 점대칭 = 무게중심으로 180° 돌려 보기
 *  · 꼭짓점 차례(변)까지 같아야 겹친 것 — 사람 손 정답 없음).
 * 칸(차시마다 교과서 말 그대로):
 *   l04  『수학』 60쪽 1 「반으로 접었을 때 완전히 겹치는 도형」 — 선대칭도형 / 선대칭도형이 아닌 도형
 *   l07  『수학』 67쪽 2 「점대칭도형을 모두 찾아 ○표」 — 점대칭도형 / 점대칭도형이 아닌 도형
 *   all  (l08 · l11) 『수학』 76쪽 문제로 마무리 2(선대칭도형·점대칭도형을 모두 찾기) · 지도서 242 펜토미노 「점대칭도형이면서 선대칭도형인 것도 찾아 분류」
 *        — 선대칭도형만 / 점대칭도형만 / 둘 다 / 둘 다 아님
 * 판 출처(지도서 5-2 공통자료 207~256 · 평가 부록):
 *   l04  『수학』 60쪽 1 가~라 · 61쪽 2 가~마 · 형성 평가 434쪽 01 · 단원 평가 기본 06 가~라 · 보충 11·12 가~바
 *   l07  『수학』 66쪽 1 · 67쪽 2 · 형성 평가 436쪽 02
 *   l08  『수학』 63쪽 모빌 · 65쪽 5 · 69쪽 2 · 71쪽 5 · 형성 평가 434쪽 03
 *   l11  『수학』 76쪽 2 가~바 · 77쪽 4 · 78쪽 7 · 단원 평가 심화 07·08 가~바
 * 진단 축(type = 도형의 대칭 갈래 · 학습지 오개념): line 선대칭도형만 · point 점대칭도형만(평행사변형처럼 대칭축이 없어도 — X09·X15)
 *   · both 둘 다(X20 「선대칭이면 점대칭일 수 없다」) · none 둘 다 아님(X14 「가운데 점이 있으면 점대칭」) · curve 원(X19 곡선이라 대칭 아님)
 * params: { upto: 'l04'|'l07'|'all' } — 칸은 upto 로 정해진다(categoriesFor) · 판은 그 차시까지 누적(이번 차시 판이 덱 앞머리)
 * next() → { item, tag, letter, pts|r, cat, type, l, svg, explain }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_sym_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l04', 'l07', 'l08', 'l11'];
  var AXES = {
    l04: [{ key: 'ls_yes', label: '선대칭도형' }, { key: 'ls_no', label: '선대칭도형이 아닌 도형' }],
    l07: [{ key: 'ps_yes', label: '점대칭도형' }, { key: 'ps_no', label: '점대칭도형이 아닌 도형' }],
    all: [{ key: 'line', label: '선대칭도형만' }, { key: 'point', label: '점대칭도형만' }, { key: 'both', label: '둘 다' }, { key: 'none', label: '둘 다 아님' }]
  };
  var CNAME = {};
  Object.keys(AXES).forEach(function (a) { AXES[a].forEach(function (c) { CNAME[c.key] = c.label; }); });

  /* 정오각형(심화 07 가 · 기본 06 나) · 오각별(형성 434 01) — 학습지 그림과 같은 셈 */
  var PENT = [0, 1, 2, 3, 4].map(function (i) { var a = (-90 + 72 * i) * Math.PI / 180; return [2 + 2 * Math.cos(a), 2.1 + 2 * Math.sin(a)]; });
  var STAR = [];
  for (var si = 0; si < 10; si++) { var sa = (-90 + 36 * si) * Math.PI / 180, sr = si % 2 ? 0.95 : 2.3; STAR.push([Math.round((2.2 + sr * Math.cos(sa)) * 1e4) / 1e4, Math.round((2.3 + sr * Math.sin(sa)) * 1e4) / 1e4]); }
  /* 도형(칸 좌표 — tb_g5_2_math_u3 geo 그림과 같은 좌표) · 원은 { r } */
  var SH = {
    s60a: [[2, 0], [4, 5], [0, 5]], s60b: [[0, 0], [3, 0], [4.3, 4.5], [1.3, 4.5]], s60c: [[0, 0], [0, 5], [5, 5]], s60d: [[0, 2.5], [5, 0], [7, 0], [7, 5], [5, 5]],
    s61a: [[2, 0], [4, 1], [4, 3], [2, 4], [0, 3], [0, 1]], s61b: [[1, 0], [3, 0], [2, 2], [3, 4], [1, 4], [0, 2]], s61c: [[3, 0], [3, 4], [0, 4], [0, 3]],
    s61d: [[0, 0], [4, 0], [4, 4], [0, 4]], s61e: { r: 2 },
    f434a: [[4, 0], [4, 4.2], [0, 4.2]], f434b: STAR, f434c: [[1.5, 0], [6, 0], [4.5, 4], [0, 4]],
    b06a: [[0, 0], [0, 3], [2.2, 3]], b06b: PENT, b06c: [[0.4, 0], [3, 0.2], [2.6, 3], [0, 2.8]], b06d: [[1, 0], [2.8, 0], [3.4, 2.6], [0, 2.6]],
    p11a: [[0, 1.5], [2, 0], [4, 1.5], [2, 3]], p11b: [[0, 0], [2, 0], [2, 1], [3, 1], [3, 2.6], [1, 2.6], [1, 1.6], [0, 1.6]], p11c: [[0, 1.5], [1.4, 0], [2.8, 1.5], [1.4, 3.6]],
    p11d: [[1, 0], [3.5, 0], [2.5, 2.5], [0, 2.5]], p11e: [[1, 0], [2.5, 0], [4, 2.5], [0, 2.5]], p11f: [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [3, 2], [3, 3], [0, 3]],
    h66: [[0, 0], [5, 0], [5, 2], [7, 4.5], [2, 4.5], [2, 2.5]],
    s67a: [[0, 0], [4, 0], [4, 4], [0, 4]], s67b: [[2, 0], [4, 4], [0, 4]], s67c: [[1, 0], [3, 0], [4, 2], [3, 4], [1, 4], [0, 2]], s67d: [[0, 1], [4, 0], [4, 4], [0, 3]], s67e: [[1, 0], [4, 0], [3, 4], [0, 4]],
    f436a: [[0, 0], [4, 0], [4, 4], [1, 4]], f436b: [[0, 1], [2, 0], [4, 1], [2, 4]], f436c: [[1, 0], [3, 0], [4, 2], [3, 4], [1, 4], [0, 2]], f436d: [[0, 0], [4, 0], [2, 4]],
    h62: [[5, 0], [0, 5], [2, 9], [5, 8], [8, 9], [10, 5]], p65: [[0, 0], [-3, 5.196], [-1.632, 8.955], [1.632, 8.955], [3, 5.196]],
    h69: [[4, 0], [0, 5], [0, 10], [4, 10], [8, 5], [8, 0]], z71: [[2, -4.58], [-3.2, 0.66], [-1.2, 0.66], [-2, 4.58], [3.2, -0.66], [1.2, -0.66]],
    h434: [[0, 0], [6, 0], [5, 2], [6, 4], [0, 4], [1, 2]],
    m2a: [[0, 0], [4, 0], [6, 4], [2, 4]], m2b: [[2, 0], [4, 2], [4, 4], [2, 6], [0, 4], [0, 2]], m2c: { r: 3 }, m2d: [[0, 0], [6, 0], [3, 5]],
    m2e: [[0, 0], [4, 0], [4, 2], [3, 2], [3, 5], [1, 5], [1, 2], [0, 2]], m2f: [[0, 1], [3, 1], [6, 0], [6, 5], [3, 5], [0, 6]],
    m4n: [[0, 0], [1, 0], [3, 2], [3, 0], [4, 0], [4, 4], [3, 4], [1, 2], [1, 4], [0, 4]], m4a: [[0, 1], [2, 2], [2, 0], [4, 0], [6, 3], [4, 6], [2, 6], [2, 4], [0, 5]],
    m7: [[0, 1], [0, 6], [3, 6], [3, 5], [6, 5], [6, 0], [3, 0], [3, 1]],
    q07a: PENT, q07b: [[1, 0], [3.5, 0], [2.5, 2.4], [0, 2.4]], q07c: [[0, 2.6], [3.6, 2.2], [2.4, 0]], q07d: [[0, 0], [2, 1], [4, 0], [4, 3], [2, 2], [0, 3]],
    q07e: [[1, 0], [3, 0], [4, 2.4], [0, 2.4]], q07f: [[1, 0], [3, 0], [3, 2], [2, 2], [2, 3.2], [0, 3.2], [0, 1.2], [1, 1.2]]
  };
  /* [차시, 판 이름, 모양 차례(가·나·다…)] */
  var BOARDS = [
    ['l04', '『수학』 60쪽 1', ['s60a', 's60b', 's60c', 's60d']],
    ['l04', '『수학』 61쪽 2', ['s61a', 's61b', 's61c', 's61d', 's61e']],
    ['l04', '형성 평가 434쪽 01', ['f434a', 'f434b', 'f434c']],
    ['l04', '단원 평가 기본 06', ['b06a', 'b06b', 'b06c', 'b06d']],
    ['l04', '단원 평가 보충 11·12', ['p11a', 'p11b', 'p11c', 'p11d', 'p11e', 'p11f']],
    ['l07', '『수학』 66쪽 1', ['h66']],
    ['l07', '『수학』 67쪽 2', ['s67a', 's67b', 's67c', 's67d', 's67e']],
    ['l07', '형성 평가 436쪽 02', ['f436a', 'f436b', 'f436c', 'f436d']],
    ['l08', '『수학』 63쪽 모빌', ['h62']],
    ['l08', '『수학』 65쪽 5', ['p65']],
    ['l08', '『수학』 69쪽 2', ['h69']],
    ['l08', '『수학』 71쪽 5', ['z71']],
    ['l08', '형성 평가 434쪽 03', ['h434']],
    ['l11', '『수학』 76쪽 2', ['m2a', 'm2b', 'm2c', 'm2d', 'm2e', 'm2f']],
    ['l11', '『수학』 77쪽 4', ['m4n', 'm4a']],
    ['l11', '『수학』 78쪽 7', ['m7']],
    ['l11', '단원 평가 심화 07·08', ['q07a', 'q07b', 'q07c', 'q07d', 'q07e', 'q07f']]
  ];
  var LET = '가나다라마바';

  /* ── 좌표 셈 — 대칭축 수 · 점대칭(꼭짓점 차례까지 같아야 겹친 것) ── */
  var EPS = 1e-4;
  function poly(S) { if (S.r) { var P = []; for (var i = 0; i < 72; i++) { var a = i * 5 * Math.PI / 180; P.push([S.r * Math.cos(a), S.r * Math.sin(a)]); } return P; } return S; }
  function cen(P) { var x = 0, y = 0; P.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / P.length, y / P.length]; }
  function same(A, B) {
    if (A.length !== B.length) return false; var n = A.length;
    for (var s = 0; s < n; s++) for (var sg = -1; sg <= 1; sg += 2) {
      var ok = true;
      for (var i = 0; i < n && ok; i++) { var b = B[((s + sg * i) % n + n) % n]; if (Math.abs(A[i][0] - b[0]) > EPS || Math.abs(A[i][1] - b[1]) > EPS) ok = false; }
      if (ok) return true;
    }
    return false;
  }
  function pointSym(S) { var P = poly(S), c = cen(P); return same(P, P.map(function (p) { return [2 * c[0] - p[0], 2 * c[1] - p[1]]; })); }
  function axes(S) {
    var P = poly(S), c = cen(P), n = P.length, dirs = [], k = 0;
    for (var i = 0; i < n; i++) {
      [P[i], [(P[i][0] + P[(i + 1) % n][0]) / 2, (P[i][1] + P[(i + 1) % n][1]) / 2]].forEach(function (q) {
        var dx = q[0] - c[0], dy = q[1] - c[1]; if (Math.hypot(dx, dy) < 1e-9) return;
        var a = ((Math.atan2(dy, dx) * 180 / Math.PI) % 180 + 180) % 180;
        if (dirs.every(function (b) { return Math.abs(a - b) > 1e-3 && Math.abs(Math.abs(a - b) - 180) > 1e-3; })) dirs.push(a);
      });
    }
    dirs.forEach(function (a) {
      var u = [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)];
      var R = P.map(function (p) { var dx = p[0] - c[0], dy = p[1] - c[1], t = dx * u[0] + dy * u[1]; return [c[0] + 2 * t * u[0] - dx, c[1] + 2 * t * u[1] - dy]; });
      if (same(P, R)) k++;
    });
    return k;
  }
  function kind(S) { var l = axes(S) > 0, p = pointSym(S); return l && p ? 'both' : l ? 'line' : p ? 'point' : 'none'; }
  function type(S) { return S.r ? 'curve' : kind(S); }
  function catOf(axis, S) {
    var k = kind(S);
    if (axis === 'l04') return k === 'line' || k === 'both' ? 'ls_yes' : 'ls_no';
    if (axis === 'l07') return k === 'point' || k === 'both' ? 'ps_yes' : 'ps_no';
    return k;
  }
  /* 까닭(좌표에서 센 대칭축 수 · 180° 돌리기) */
  function why(S) {
    if (S.r) return '원은 지름을 따라 접어도, 가운데 점을 중심으로 180° 돌려도 완전히 겹쳐요 — 곧은 변이 없어도 대칭축은 셀 수 없이 많아요.';
    var n = axes(S), p = pointSym(S);
    if (n && p) return '접으면 겹치는 대칭축이 ' + n + '개 있고, 가운데 점을 중심으로 180° 돌려도 겹쳐요 — 선대칭도형이면서 점대칭도형이에요.';
    if (n) return '접으면 겹치는 대칭축이 ' + n + '개 있지만, 180° 돌리면 겹치지 않아요.';
    if (p) return '어느 직선으로 접어도 겹치지 않지만, 가운데 점을 중심으로 180° 돌리면 완전히 겹쳐요.';
    return '어느 직선으로 접어도, 어느 점을 중심으로 180° 돌려도 겹치지 않아요.';
  }
  var SAY = { ls_yes: '선대칭도형이에요.', ls_no: '선대칭도형이 아니에요.', ps_yes: '점대칭도형이에요.', ps_no: '점대칭도형이 아니에요.',
              line: '선대칭도형만이에요.', point: '점대칭도형만이에요.', both: '둘 다예요.', none: '둘 다 아니에요.' };
  var ITEMS = [];
  BOARDS.forEach(function (b) { b[2].forEach(function (key, i) { ITEMS.push({ l: b[0], board: b[1], letter: b[2].length > 1 ? LET[i] : '', key: key, shape: SH[key] }); }); });

  function svg(S) {
    var P = S.r ? null : S, xs, ys;
    if (P) { xs = P.map(function (p) { return p[0]; }); ys = P.map(function (p) { return p[1]; }); }
    else { xs = [-S.r, S.r]; ys = [-S.r, S.r]; }
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var pad = 0.08 * Math.max(x1 - x0, y1 - y0, 1), w = x1 - x0 + 2 * pad, h = y1 - y0 + 2 * pad, sw = 0.025 * Math.max(w, h);
    var f = function (v) { return Math.round(v * 1000) / 1000; };
    var s = '<svg class="sy" viewBox="' + [f(x0 - pad), f(y0 - pad), f(w), f(h)].join(' ') + '" role="img" aria-label="교과서 판의 도형">';
    if (P) s += '<polygon points="' + P.map(function (p) { return p.join(','); }).join(' ') + '" class="q" stroke-width="' + f(sw) + '"/>';
    else s += '<circle cx="0" cy="0" r="' + S.r + '" class="q" stroke-width="' + f(sw) + '"/>';
    return s + '</svg>';
  }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function axisOf(upto) { return upto === 'l04' || upto === 'l07' ? upto : 'all'; }
  function build(it, axis) {
    var c = catOf(axis, it.shape), tag = it.board + (it.letter ? (/\d$/.test(it.board) ? '번 ' : ' ') + it.letter : '');   // 판 이름이 번호로 끝나면 「06번 가」 — 「06 가」를 수 뒤 조사로 읽지 않게(smoke_korean 2항)
    return { l: it.l, axis: axis, tag: tag, letter: it.letter, pts: it.shape.r ? null : it.shape, r: it.shape.r || null, cat: c, type: type(it.shape), item: tag, svg: svg(it.shape),
             explain: tag + ' — ' + SAY[c] + ' ' + why(it.shape) };
  }

  return {
    id: 'g5_2_sym_sort',
    title: '대칭 네 갈래 분류',
    ORDER: ORDER, AXES: AXES, SH: SH, BOARDS: BOARDS, ITEMS: ITEMS, CNAME: CNAME,
    categories: AXES.all,
    categoriesFor: function (upto) { return AXES[axisOf(upto)]; },
    axes: axes, pointSym: pointSym, kind: kind, type: type, catOf: catOf, svg: svg,
    create: function (params, rng) {
      var p = params || {};
      var axis = axisOf(p.upto), lim = axis === 'all' ? ORDER.length - 1 : ORDER.indexOf(axis);
      var idx = [], focus = [];
      ITEMS.forEach(function (it, k) { var li = ORDER.indexOf(it.l); if (li <= lim) { idx.push(k); if (axis !== 'all' && li === lim) focus.push(k); } });
      var rest = idx.filter(function (k) { return focus.indexOf(k) < 0; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, rest));
      var lastBoard = '', lastCat = '', run = 0, nf = focus.length;
      function find(d) {
        for (var t = 0; t < d.length; t++) { var it = ITEMS[d[t]], c = catOf(axis, it.shape); if (it.board === lastBoard) continue; if (run >= 1 && c === lastCat) continue; return t; }
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
          var k = deck.splice(at, 1)[0], it = ITEMS[k], c = catOf(axis, it.shape);
          run = c === lastCat ? run + 1 : 0; lastCat = c; lastBoard = it.board;
          return build(it, axis);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.item + ' (교과서 판의 도형) → □ ' + AXES[q.axis].map(function (c) { return c.label; }).join(' □ '); },
    printAnswer: function (q) { return q.item + ' → ' + CNAME[q.cat]; },
    printHead: '도형을 접어 보고 180° 돌려 보아 선대칭도형인지, 점대칭도형인지 알맞은 칸에 ✓ 하세요.'
  };
}));
