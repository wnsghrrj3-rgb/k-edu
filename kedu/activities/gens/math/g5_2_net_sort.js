/* gens/math/g5_2_net_sort.js — 전개도가 될까? (5학년 2학기 수학 5단원 「직육면체」 l06 전개도를 알아봐요 · l07 전개도를 그려요(+ 8차시 짜잔! 나만의 전개도) · l09 문제로 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). sort 장르 계약(g4_2_move_sort·plane_shape 와 같음): deal() → round, binOf(item, by) → bin key, reasonOf(item, by, wantKo).
 *
 * params: { by: 'book'|'cube'|'box'|'mix', per: 4|6 }
 *   한 판(round) = 한 유형 — 「어느 그림에서 흔들리는지」가 byType 으로 남는다.
 *
 * 카드 = 교과서·평가지의 펼친 그림 그대로(아래 S — 학습지 tb_g5_2_math_u5 전개도와 같은 칸 좌표 · 면 = [x, y, 가로, 세로] 칸).
 *   바구니 = 『수학』 117쪽 ⑤ ㄴ의 까닭 그대로: 전개도가 돼요 / 겹치는 면이 있어요(나) / 면이 모자라요(마) / 맞닿는 선분 길이가 달라요(라).
 *   판정은 **생성기가 칸 좌표를 실제로 접어서** 셈한다(fold — 첫 면을 바닥에 두고 이웃 면을 90°씩 접는 정수 사상 · 학습지 생성기 gen_tb.py 의 fold 와 같은 셈).
 *   아이가 보는 그림(잘린 모서리 실선 · 접는 선 점선)과 채점 기준이 같은 칸 좌표에서 나온다.
 *
 * type (§21-3 · 교과서 차시 그대로):
 *   book  l06  『수학』 117쪽 ⑤ 가~바 여섯 장 그대로(가·다·바 전개도 · 나 겹침 · 라 선분 길이 · 마 면 모자람)
 *   cube  l06·l07·l09  정육면체의 전개도 — 116쪽 ③④ · 117쪽 ⑤ 나·마·바 · 122쪽 주사위 · 형성 449-02·03 · 단원 평가 기본 17·보충 12·심화 14 · 마무리 10
 *   box   l06·l07·l09  직육면체의 전개도 — 115쪽 · 117쪽 ⑤ 가·다·라·마 · 124~125쪽 마무리 5~7 · 형성 449-01 · 단원 평가 기본 10~11·보충 17~18
 *   지도서 342: 정육면체의 전개도도 직육면체의 전개도 — 「전개도가 돼요」 바구니 하나에 담는다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_net_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ── 교과서·평가지 펼친 그림 (칸 좌표 — 학습지 tb_g5_2_math_u5 와 같은 수 · 길이 글이 없는 그림은 비율만) ──
  var S = {
    b117a: { f: [[6, 0, 2, 4], [0, 4, 2, 3], [2, 4, 4, 3], [6, 4, 2, 3], [8, 4, 4, 3], [6, 7, 2, 4]], src: '『수학』 117쪽 ⑤ 가', set: 'box' },
    c117b: { f: [[0, 0, 1, 1], [3, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1]], src: '『수학』 117쪽 ⑤ 나 · 형성 평가 449쪽', set: 'cube' },
    b117c: { f: [[6, 0, 4, 2], [0, 2, 4, 3], [4, 2, 2, 3], [6, 2, 4, 3], [10, 2, 2, 3], [4, 5, 2, 4]], src: '『수학』 117쪽 ⑤ 다 · 124~125쪽 문제로 마무리', set: 'box' },
    b117d: { f: [[5, 0, 3, 3], [0, 3, 5, 3], [5, 3, 3, 3], [8, 3, 5, 3], [13, 3, 3, 3], [13, 6, 3, 3]], src: '『수학』 117쪽 ⑤ 라', set: 'box' },
    c117e: { f: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1], [3, 0, 1, 1], [0, 1, 1, 1]], src: '『수학』 117쪽 ⑤ 마', set: 'both' },
    c117f: { f: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1], [4, 1, 1, 1]], src: '『수학』 117쪽 ⑤ 바 · 형성 평가 449쪽', set: 'cube' },
    b115: { f: [[8, 0, 4, 2], [0, 2, 2, 5], [2, 2, 4, 5], [6, 2, 2, 5], [8, 2, 4, 5], [8, 7, 4, 2]], src: '『수학』 115쪽', set: 'box' },
    c116: { f: [[0, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1], [1, 2, 1, 1]], src: '『수학』 116쪽 ③', set: 'cube' },
    c116b: { f: [[1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1], [3, 2, 1, 1]], src: '『수학』 116쪽 ④ · 단원 평가 506~513쪽', set: 'cube' },
    b449: { f: [[9, 0, 5, 2], [0, 2, 2, 3], [2, 2, 5, 3], [7, 2, 2, 3], [9, 2, 5, 3], [7, 5, 2, 5]], src: '형성 평가 449쪽', set: 'box' },
    c449c: { f: [[1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1], [2, 2, 1, 1]], src: '형성 평가 449쪽 · 『수학』 126쪽 문제로 마무리 10', set: 'cube' },
    c449b: { f: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1], [3, 0, 1, 1], [4, 0, 1, 1], [1, 1, 1, 1]], src: '형성 평가 449쪽', set: 'cube' },
    b507: { f: [[9, 0, 5, 2], [0, 2, 2, 4], [2, 2, 5, 4], [7, 2, 2, 4], [9, 2, 5, 4], [2, 6, 5, 2]], src: '단원 평가 507쪽', set: 'box' },
    b513: { f: [[0, 0, 4, 2], [4, 0, 3, 2], [4, 2, 3, 4], [7, 2, 2, 4], [9, 2, 3, 4], [4, 6, 3, 2]], src: '단원 평가 513쪽', set: 'box' },
    c509b: { f: [[1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1], [1, 2, 1, 1]], src: '단원 평가 509쪽', set: 'cube' },
    c509c: { f: [[1, 0, 1, 1], [1, 1, 1, 1], [0, 2, 1, 1], [1, 2, 1, 1], [2, 2, 1, 1], [3, 2, 1, 1]], src: '단원 평가 509쪽', set: 'cube' },
    c509d: { f: [[2, 0, 1, 1], [3, 0, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [0, 2, 1, 1], [1, 2, 1, 1]], src: '단원 평가 509·516쪽 · 『수학』 126쪽 문제로 마무리 10', set: 'cube' },
    c126a: { f: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1], [3, 0, 1, 1], [3, 1, 1, 1], [4, 1, 1, 1]], src: '『수학』 126쪽 문제로 마무리 10', set: 'cube' },
    c122: { f: [[0, 0, 1, 1], [0, 1, 1, 1], [0, 2, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1]], src: '『수학』 122쪽 주사위', set: 'cube' }
  };
  var BOOK = ['b117a', 'c117b', 'b117c', 'b117d', 'c117e', 'c117f'];   // 117쪽 ⑤ 가~바 차례

  // ── 접기 (칸 좌표 → 3차원) ──
  function add(p, q) { return [p[0] + q[0], p[1] + q[1], p[2] + q[2]]; }
  function sub(p, q) { return [p[0] - q[0], p[1] - q[1], p[2] - q[2]]; }
  function mulv(p, k) { return [p[0] * k, p[1] * k, p[2] * k]; }
  function dot(p, q) { return p[0] * q[0] + p[1] * q[1] + p[2] * q[2]; }
  function corners(f) { return [[f[0], f[1]], [f[0] + f[2], f[1]], [f[0] + f[2], f[1] + f[3]], [f[0], f[1] + f[3]]]; }
  function shared(f, g) {
    var x1 = f[0], y1 = f[1], w1 = f[2], h1 = f[3], x2 = g[0], y2 = g[1], w2 = g[2], h2 = g[3], lo, hi;
    if (x1 + w1 === x2 || x2 + w2 === x1) { var xx = (x1 + w1 === x2) ? x2 : x1; lo = Math.max(y1, y2); hi = Math.min(y1 + h1, y2 + h2); if (hi > lo) return [[xx, lo], [xx, hi]]; }
    if (y1 + h1 === y2 || y2 + h2 === y1) { var yy = (y1 + h1 === y2) ? y2 : y1; lo = Math.max(x1, x2); hi = Math.min(x1 + w1, x2 + w2); if (hi > lo) return [[lo, yy], [hi, yy]]; }
    return null;
  }
  function fold(faces) {
    var n = faces.length;
    if (n !== 6) return { why: 'count' };
    var maps = { 0: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]] }, order = [0];
    while (order.length) {
      var i = order.shift(), O = maps[i][0], ex = maps[i][1], ey = maps[i][2], nn = maps[i][3];
      for (var j = 0; j < n; j++) {
        if (maps[j]) continue;
        var sh = shared(faces[i], faces[j]); if (!sh) continue;
        var p = sh[0], q = sh[1], d2 = [q[0] > p[0] ? 1 : 0, q[1] > p[1] ? 1 : 0];
        var cx = faces[j][0] + faces[j][2] / 2, cy = faces[j][1] + faces[j][3] / 2;
        var e2 = d2[0] ? [0, cy > p[1] ? 1 : -1] : [cx > p[0] ? 1 : -1, 0];
        var A = add(add(O, mulv(ex, p[0])), mulv(ey, p[1])), u = add(mulv(ex, d2[0]), mulv(ey, d2[1])), e = add(mulv(ex, e2[0]), mulv(ey, e2[1]));
        var L = (function (u, e, nn) { return function (v) { return add(mulv(u, dot(v, u)), mulv(nn, dot(v, e))); }; })(u, e, nn);
        maps[j] = [add(A, L(sub(O, A))), L(ex), L(ey), mulv(e, -1)]; order.push(j);
      }
    }
    if (Object.keys(maps).length !== n) return { why: 'count' };
    function M3(i, P) { var m = maps[i]; return add(add(m[0], mulv(m[1], P[0])), mulv(m[2], P[1])); }
    var p3 = {}, k, i2;
    for (i2 = 0; i2 < n; i2++) {
      var cs = corners(faces[i2]);
      for (k = 0; k < 4; k++) { var key = cs[k].join(','), v = M3(i2, cs[k]).join(','); if (p3[key] && p3[key] !== v) return { why: 'mismatch' }; p3[key] = v; }
    }
    var all = []; for (i2 = 0; i2 < n; i2++) corners(faces[i2]).forEach(function (P) { all.push(M3(i2, P)); });
    var lo = [0, 1, 2].map(function (a) { return Math.min.apply(null, all.map(function (v) { return v[a]; })); }), hi = [0, 1, 2].map(function (a) { return Math.max.apply(null, all.map(function (v) { return v[a]; })); });
    var planes = [];
    for (i2 = 0; i2 < n; i2++) {
      var c3 = corners(faces[i2]).map(function (P) { return M3(i2, P); });
      var ax = [0, 1, 2].filter(function (a) { return c3.every(function (v) { return v[a] === c3[0][a]; }); })[0];
      planes.push(ax + ':' + c3[0][ax]);
    }
    if (planes.filter(function (x, i) { return planes.indexOf(x) === i; }).length < 6) return { why: 'overlap' };
    for (i2 = 0; i2 < n; i2++) {
      var ax2 = +planes[i2].split(':')[0], val = +planes[i2].split(':')[1];
      if (val !== lo[ax2] && val !== hi[ax2]) return { why: 'mismatch' };
      var got = corners(faces[i2]).map(function (P) { return M3(i2, P).join(','); }).sort().join('|');
      var o = [0, 1, 2].filter(function (a) { return a !== ax2; }), want = [];
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (s) { var v = [0, 0, 0]; v[ax2] = val; v[o[0]] = s[0] ? hi[o[0]] : lo[o[0]]; v[o[1]] = s[1] ? hi[o[1]] : lo[o[1]]; want.push(v.join(',')); });
      if (got !== want.sort().join('|')) return { why: 'mismatch' };
    }
    return { why: 'ok', dims: [0, 1, 2].map(function (a) { return hi[a] - lo[a]; }) };
  }

  // ── 판 정의 ──
  var BINS = [{ k: 'ok', ko: '전개도가 돼요' }, { k: 'overlap', ko: '겹치는 면이 있어요' }, { k: 'count', ko: '면이 모자라요' }, { k: 'mismatch', ko: '맞닿는 선분 길이가 달라요' }];
  var ROUNDS = {
    book: { ko: '117쪽 ⑤ 여섯 장', l: 'l06', prompt: '교과서 117쪽 ⑤의 가~바를 나눠요', hint: '머릿속으로 접어 봐요. **겹치는 면**·**모자란 면**·**길이가 다른 맞닿는 선분**이 없어야 전개도예요.' },
    cube: { ko: '정육면체의 전개도', l: 'l06', prompt: '정육면체의 전개도가 될지 나눠요', hint: '한 줄로 이어진 네 면은 둥글게 감겨요. 같은 쪽에 붙은 두 면은 **같은 자리에서 겹쳐요**.' },
    box: { ko: '직육면체의 전개도', l: 'l07', prompt: '직육면체의 전개도가 될지 나눠요', hint: '접었을 때 맞닿는 두 선분은 **길이가 같아야** 해요. 마주 보는 면은 모양과 크기가 같아요.' }
  };
  var TYPES = ['book', 'cube', 'box'];
  var ORDER = ['l06', 'l07', 'l09'];
  var V = {}; Object.keys(S).forEach(function (k) { V[k] = fold(S[k].f).why; });
  function card(k) { return { shape: k, faces: JSON.parse(JSON.stringify(S[k].f)), src: S[k].src, why: V[k], tag: '' }; }
  var POOL = {
    book: BOOK.map(card).map(function (c, i) { c.tag = '가나다라마바'.charAt(i); return c; }),
    cube: Object.keys(S).filter(function (k) { return S[k].set === 'cube' || S[k].set === 'both'; }).map(card),
    box: Object.keys(S).filter(function (k) { return S[k].set === 'box' || S[k].set === 'both'; }).map(card)
  };
  function binOf(it) { return it.why; }

  // ── 카드 그림(문자열 SVG · DOM 무관) — 무대와 🖨 활동지가 같이 쓴다. 잘린 모서리 실선 · 잘리지 않은 모서리(접는 선) 점선 ──
  var INK = '#2f2a3f', FILL = '#e7f1ff';
  function svgOf(it) {
    var F = it.faces, x0 = Math.min.apply(null, F.map(function (f) { return f[0]; })), y0 = Math.min.apply(null, F.map(function (f) { return f[1]; }));
    var W = Math.max.apply(null, F.map(function (f) { return f[0] + f[2]; })) - x0, H = Math.max.apply(null, F.map(function (f) { return f[1] + f[3]; })) - y0;
    var u = Math.min(110 / W, 78 / H), cnt = {}, ln = '';
    function unit(a, b) { var key = a.join(',') + '|' + b.join(','); cnt[key] = (cnt[key] || 0) + 1; }
    F.forEach(function (f) {
      for (var i = 0; i < f[2]; i++) { unit([f[0] + i, f[1]], [f[0] + i + 1, f[1]]); unit([f[0] + i, f[1] + f[3]], [f[0] + i + 1, f[1] + f[3]]); }
      for (var j = 0; j < f[3]; j++) { unit([f[0], f[1] + j], [f[0], f[1] + j + 1]); unit([f[0] + f[2], f[1] + j], [f[0] + f[2], f[1] + j + 1]); }
    });
    var X = function (v) { return ((v - x0) * u + 2).toFixed(1); }, Y = function (v) { return ((v - y0) * u + 2).toFixed(1); };
    var rects = F.map(function (f) { return '<rect class="nf" x="' + X(f[0]) + '" y="' + Y(f[1]) + '" width="' + (f[2] * u).toFixed(1) + '" height="' + (f[3] * u).toFixed(1) + '" fill="' + FILL + '" stroke="none"/>'; }).join('');
    Object.keys(cnt).forEach(function (key) {
      var ab = key.split('|').map(function (s) { return s.split(',').map(Number); }), cut = cnt[key] === 1;
      ln += '<line class="' + (cut ? 'cut' : 'fold') + '" x1="' + X(ab[0][0]) + '" y1="' + Y(ab[0][1]) + '" x2="' + X(ab[1][0]) + '" y2="' + Y(ab[1][1]) + '" stroke="' + INK + '" stroke-width="' + (cut ? 2.2 : 1.4) + '"' + (cut ? ' stroke-linecap="round"' : ' stroke-dasharray="3 3"') + '/>';
    });
    var tw = W * u + 4, th = H * u + 4;
    return '<svg viewBox="0 0 ' + tw.toFixed(1) + ' ' + th.toFixed(1) + '" width="' + Math.round(tw) + '" height="' + Math.round(th) + '" role="img" aria-label="펼친 그림 — 면 ' + F.length + '개">' + rects + ln +
      (it.tag ? '<text x="4" y="13" font-size="12" fill="#1d4ed8">' + it.tag + '</text>' : '') + '</svg>';
  }

  var WHYKO = {
    ok: '접으면 여섯 면이 겹치지 않고 빈 곳 없이 둘러싸여요 — 「전개도가 돼요」.',
    overlap: '접으면 두 면이 같은 자리로 와서 **겹치고**, 반대쪽 한 자리는 비어요 — 「겹치는 면이 있어요」.',
    count: '면이 **5개**뿐이라 접어도 한 자리가 비어 둘러싸이지 않아요 — 「면이 모자라요」.',
    mismatch: '접었을 때 맞닿는 두 선분의 **길이가 달라** 모서리가 맞붙지 않아요 — 「맞닿는 선분 길이가 달라요」.'
  };
  function binKo(k) { return BINS.filter(function (b) { return b.k === k; })[0].ko; }

  return {
    TYPES: TYPES, ORDER: ORDER, ROUNDS: ROUNDS, BINS: BINS, S: S, BOOK: BOOK, POOL: POOL, fold: fold, svgOf: svgOf,
    printHead: '펼친 그림을 보고 알맞은 것에 ○표 하세요.',
    printRender: function (p) { return svgOf(p.item) + '<div class="ns-q">' + p.prompt + '</div><div class="ns-bins">( ' + p.bins.map(function (b) { return b.ko; }).join(' · ') + ' )</div>'; },
    printAnswer: function (p) { return p.answer; },
    create: function (params, rng) {
      params = params || {};
      var by = TYPES.indexOf(params.by) >= 0 ? params.by : 'mix';
      var per = [4, 6].indexOf(+params.per) >= 0 ? +params.per : 6;
      var qi = 0, decks = {};
      function take(type) {   // 섞은 덱에서 per 장 — 한 판 안에 같은 그림 0 · 「전개도가 돼요」와 아닌 것이 함께
        var pool = POOL[type];
        for (var tries = 0; tries < 50; tries++) {
          var out = shuffle(rng, pool.slice()).slice(0, Math.min(per, pool.length));
          var oks = out.filter(function (c) { return c.why === 'ok'; }).length;
          if (oks >= 1 && oks < out.length) return JSON.parse(JSON.stringify(out));
        }
        return JSON.parse(JSON.stringify(pool.slice(0, per)));
      }
      function dealOne(type) {
        var R = ROUNDS[type], items = type === 'book' ? JSON.parse(JSON.stringify(POOL.book)) : take(type);
        return { by: type, byKo: R.ko, bins: BINS.slice(), items: items, prompt: R.prompt, hint: R.hint, type: type, l: R.l };
      }
      return {
        deal: function () { return dealOne(by === 'mix' ? TYPES[qi++ % TYPES.length] : by); },
        next: function () {   // 🖨 활동지 — 카드 한 장 = 한 문제
          var type = by === 'mix' ? TYPES[qi++ % TYPES.length] : by;
          if (!decks[type] || !decks[type].length) decks[type] = shuffle(rng, POOL[type].slice());
          var it = JSON.parse(JSON.stringify(decks[type].pop()));
          return { item: it, type: type, bins: BINS.slice(), prompt: '이 그림은 직육면체의 전개도가 될까요?', answer: binKo(binOf(it)) };
        },
        binOf: binOf,
        reasonOf: function (it, type, wantKo) { return WHYKO[it.why] + (it.src ? ' (' + it.src + ')' : ''); }
      };
    }
  };
}));
