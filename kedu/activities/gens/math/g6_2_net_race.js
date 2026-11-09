/* gens/math/g6_2_net_race.js — 원기둥 전개도 가려내기 경주 (6학년 2학기 수학 6단원 「원기둥, 원뿔, 구」 l05 · l11)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 판의 그림은 교과서·익힘·평가 부록 판 그대로
 * (그림 = 옆면 사각형의 네 꼭짓점과 두 원의 자리·크기 · 정답은 아래 셈으로 그림에서 직접 — 사람 손 정답 없음).
 * 판 출처(지도서 6-2 수학 6단원 360~365 · 378~380 · 평가 부록 428 · 493):
 *   l05  『수학』 129쪽 4번 가~라 · 『수학익힘』 89쪽 3번 가~다(종이 상자 분리배출) · 형성 평가 428쪽 2번 가~다
 *   l11  『수학』 141쪽 마무리 4번 가~다 · 단원 평가(기본) 10번 가~다
 * 칸(지도서 361·363·379 — 전개도가 될 수 없는 까닭 세 갈래 그대로):
 *   yn   원기둥의 전개도가 되는 그림 / 원기둥의 전개도가 안 되는 그림
 *   l05·all  원기둥의 전개도 / 옆면이 직사각형이 아닌 그림 / 두 원이 겹치는 그림 / 두 원이 합동이 아닌 그림
 * 판정(지도서 363 · 364 「옆면은 직사각형으로, 밑면은 옆면을 기준으로 마주 보는 위치에 합동인 모양으로」):
 *   옆면의 네 각이 모두 직각이 아니면 → 옆면이 직사각형이 아님 · 두 원이 옆면의 같은 쪽 → 겹침 · 두 원의 반지름이 다름 → 합동이 아님 · 셋 다 아니면 전개도
 * 진단 축(type = 학습지 오개념): 원이 위아래·왼쪽오른쪽·비껴 마주 봐도 전개도(X23) · 사다리꼴 옆면(X11) · 같은 쪽 두 원(X12) · 크기 다른 두 원(X02)
 * 풀이 = 「판 이름 글자 — 칸 이름이에요. 까닭」.
 * params: { upto: 'yn'|'l05'|'all' } — yn·l05 = 5차시 판, all = 단원 전체(이번 차시 판이 덱 앞머리)
 * next() → { item, tag, letter, net, cat, type, l, explain, svg }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g6_2_net_race'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05', 'l11'];
  var AXES = {
    yn: [{ key: 'net', label: '원기둥의 전개도가 되는 그림' }, { key: 'no', label: '원기둥의 전개도가 안 되는 그림' }],
    why: [{ key: 'ok', label: '원기둥의 전개도' }, { key: 'skew', label: '옆면이 직사각형이 아닌 그림' }, { key: 'same', label: '두 원이 겹치는 그림' }, { key: 'diff', label: '두 원이 합동이 아닌 그림' }]
  };
  var CNAME = {};
  Object.keys(AXES).forEach(function (a) { AXES[a].forEach(function (c) { CNAME[c.key] = c.label; }); });

  /* 그림 — 옆면 사각형(꼭짓점 넷, 칸 단위) + 두 원 [옆면의 변(t·b·l·r), 그 변 위 자리(0~1), 반지름].
     전개도인 그림은 원의 둘레 = 맞닿는 옆면의 변(2 × 3.14 × 반지름) 이 되게 그렸다(지도서 362 가로 = 밑면의 둘레). */
  var R0 = 1, LEN = 6.28;   // 반지름 1 · 둘레 6.28
  function rectH(w, h) { return [[0, 0], [w, 0], [w, h], [0, h]]; }
  function rectV(w, h) { return [[0, 0], [w, 0], [w, h], [0, h]]; }
  var NETS = {
    okH: { side: rectH(LEN, 2.5), c: [['t', 0.5, R0], ['b', 0.5, R0]], type: 'ok_tb' },
    okHl: { side: rectH(LEN, 2), c: [['t', 0.3, R0], ['b', 0.3, R0]], type: 'ok_tb' },
    okV: { side: rectV(2.2, LEN), c: [['l', 0.5, R0], ['r', 0.5, R0]], type: 'ok_lr' },
    okOff: { side: rectH(LEN, 2.2), c: [['t', 0.25, R0], ['b', 0.75, R0]], type: 'ok_off' },
    okVOff: { side: rectV(1.4, LEN), c: [['l', 0.3, R0], ['r', 0.7, R0]], type: 'ok_off' },
    skewT: { side: [[1.4, 0], [LEN - 1.4, 0], [LEN, 2.4], [0, 2.4]], c: [['t', 0.5, R0], ['b', 0.5, R0]], type: 'skew' },
    sameT: { side: rectH(LEN, 2.4), c: [['t', 0.25, R0], ['t', 0.75, R0]], type: 'same' },
    sameL: { side: rectV(2.4, LEN), c: [['l', 0.25, R0], ['l', 0.75, R0]], type: 'same' },
    diffTB: { side: rectH(LEN, 2.4), c: [['t', 0.5, 0.6], ['b', 0.5, R0]], type: 'diff' },
    diffV: { side: rectV(2.2, LEN), c: [['r', 0.2, 0.6], ['l', 0.8, R0]], type: 'diff' },
    diffOff: { side: rectH(LEN, 2.2), c: [['t', 0.2, 0.6], ['b', 0.8, R0]], type: 'diff' }
  };
  /* [차시, 판 이름, 그림 차례(가·나·다…)] — 지도서 정답: 129 가 · 89 가 · 428 다 · 141 다 · 기본 10 안 되는 것 다 */
  var BOARDS = [
    ['l05', '『수학』 129쪽 4번', ['okH', 'skewT', 'sameT', 'diffV']],
    ['l05', '『수학익힘』 89쪽 종이 상자', ['okHl', 'sameL', 'diffTB']],
    ['l05', '형성 평가 2번', ['sameT', 'diffTB', 'okV']],
    ['l11', '『수학』 141쪽 마무리 4번', ['sameT', 'skewT', 'okV']],
    ['l11', '단원 평가 10번', ['okOff', 'okVOff', 'diffOff']]
  ];
  var LET = '가나다라';

  /* ── 그림 셈 — 옆면의 직각 수 · 두 원이 붙은 변 · 반지름 ── */
  function v(a, b) { return [b[0] - a[0], b[1] - a[1]]; }
  function dot(u, w) { return u[0] * w[0] + u[1] * w[1]; }
  function rights(P) { var n = 0; for (var i = 0; i < 4; i++) if (Math.abs(dot(v(P[i], P[(i + 1) % 4]), v(P[i], P[(i + 3) % 4]))) < 1e-9) n++; return n; }
  var OPP = { t: 'b', b: 't', l: 'r', r: 'l' };
  function catOf(n) {
    if (rights(n.side) !== 4) return 'skew';
    if (n.c[0][0] === n.c[1][0] || OPP[n.c[0][0]] !== n.c[1][0]) return 'same';
    if (Math.abs(n.c[0][2] - n.c[1][2]) > 1e-9) return 'diff';
    return 'ok';
  }
  function ynOf(cat) { return cat === 'ok' ? 'net' : 'no'; }
  var WHY = {
    ok: { ok_tb: '옆면이 직사각형이고, 합동인 두 원이 옆면의 위와 아래에 마주 보고 있어요.', ok_lr: '옆면이 직사각형이고, 합동인 두 원이 옆면의 왼쪽과 오른쪽에 마주 보고 있어요.', ok_off: '두 원이 한가운데가 아니어도 옆면을 사이에 두고 마주 보고, 서로 합동이에요.' },
    skew: '옆면이 사다리꼴 모양이에요 — 감아 붙이면 위아래 테두리가 어긋나요.',
    same: '두 원이 옆면의 같은 쪽에 있어요 — 접으면 두 원이 한자리에 겹치고 반대쪽은 뚫려요.',
    diff: '두 원의 크기가 달라요 — 원기둥의 두 밑면은 서로 합동이어야 해요.'
  };
  function JE(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return w + (c >= 0 && c % 28 ? '이에요' : '예요'); }
  var ITEMS = [];
  BOARDS.forEach(function (b) { b[2].forEach(function (key, i) { ITEMS.push({ l: b[0], board: b[1], letter: LET[i], key: key, net: NETS[key] }); }); });

  function circleAt(P, c) {   // 변 위 자리 → 원의 중심(변 바깥쪽에 맞닿게)
    var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; });
    var top = [P[0], P[1]], bot = [P[3], P[2]], lft = [P[0], P[3]], rgt = [P[1], P[2]];
    var e = { t: top, b: bot, l: lft, r: rgt }[c[0]], t = c[1], r = c[2];
    var px = e[0][0] + (e[1][0] - e[0][0]) * t, py = e[0][1] + (e[1][1] - e[0][1]) * t;
    if (c[0] === 't') return [px, Math.min.apply(null, ys) - r];
    if (c[0] === 'b') return [px, Math.max.apply(null, ys) + r];
    if (c[0] === 'l') return [Math.min.apply(null, xs) - r, py];
    return [Math.max.apply(null, xs) + r, py];
  }
  function f(n) { return String(Math.round(n * 100) / 100); }
  function svg(n) {
    var P = n.side, C = n.c.map(function (c) { return circleAt(P, c).concat([c[2]]); });
    var xs = [], ys = [];
    P.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); });
    C.forEach(function (c) { xs.push(c[0] - c[2], c[0] + c[2]); ys.push(c[1] - c[2], c[1] + c[2]); });
    var x0 = Math.min.apply(null, xs) - 0.3, y0 = Math.min.apply(null, ys) - 0.3, w = Math.max.apply(null, xs) - x0 + 0.3, h = Math.max.apply(null, ys) - y0 + 0.3;
    var s = '<svg class="nt" viewBox="' + f(x0) + ' ' + f(y0) + ' ' + f(w) + ' ' + f(h) + '" role="img" aria-label="원기둥의 전개도인지 알아볼 그림">';
    s += '<polygon points="' + P.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' ') + '" class="sd"/>';
    C.forEach(function (c) { s += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(c[2]) + '" class="bs"/>'; });
    return s + '</svg>';
  }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function axisOf(upto) { return upto === 'yn' ? 'yn' : 'why'; }
  function limOf(upto) { return upto === 'yn' || upto === 'l05' ? 0 : ORDER.length - 1; }
  function build(it, axis) {
    var c4 = catOf(it.net), c = axis === 'yn' ? ynOf(c4) : c4, tag = it.board + ' ' + it.letter;
    var why = c4 === 'ok' ? WHY.ok[it.net.type] : WHY[c4];
    return { l: it.l, axis: axis, tag: tag, letter: it.letter, net: it.net, cat: c, cat4: c4, type: it.net.type, item: tag, svg: svg(it.net),
             explain: tag + ' — ' + JE(CNAME[c]) + '. ' + why };
  }

  return {
    id: 'g6_2_net_race',
    title: '원기둥 전개도 가려내기 경주',
    ORDER: ORDER, AXES: AXES, NETS: NETS, BOARDS: BOARDS, ITEMS: ITEMS, CNAME: CNAME,
    categories: AXES.why,
    categoriesFor: function (upto) { return AXES[axisOf(upto)]; },
    catOf: catOf, rights: rights, svg: svg, circleAt: circleAt,
    create: function (params, rng) {
      var p = params || {};
      var axis = axisOf(p.upto), lim = limOf(p.upto), all = lim === ORDER.length - 1;
      var idx = [], focus = [];
      ITEMS.forEach(function (it, k) { var li = ORDER.indexOf(it.l); if (li <= lim) { idx.push(k); if (all && li === lim) focus.push(k); } });
      var rest = idx.filter(function (k) { return focus.indexOf(k) < 0; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, rest));
      var lastBoard = '', lastCat = '', run = 0, nf = focus.length;
      function cOf(it) { var c = catOf(it.net); return axis === 'yn' ? ynOf(c) : c; }
      function find(d) {
        for (var t = 0; t < d.length; t++) { var it = ITEMS[d[t]]; if (it.board === lastBoard) continue; if (run >= 1 && cOf(it) === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length, axis: axis,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); nf = 0; }
          var at = find(nf ? deck.slice(0, nf) : deck);
          if (at < 0 && nf) at = 0;
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(deck); if (at < 0) at = 0; }
          if (at < nf) nf--;
          var k = deck.splice(at, 1)[0], it = ITEMS[k], c = cOf(it);
          run = c === lastCat ? run + 1 : 0; lastCat = c; lastBoard = it.board;
          return build(it, axis);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return q.item + ' (옆면과 두 원 그림) → □ ' + AXES[q.axis].map(function (c) { return c.label; }).join(' □ '); },
    printAnswer: function (q) { return q.item + ' → ' + CNAME[q.cat]; },
    printHead: '그림이 원기둥의 전개도가 되는지 보고, 안 되면 그 까닭(옆면 · 두 원의 자리 · 두 원의 크기)에 맞는 칸에 ✓ 하세요.'
  };
}));
