/* gens/math/g4_2_move_sort.js — 어떻게 움직였을까? (4학년 2학기 수학 6단원 「평면도형의 이동」 l03 · l04 · l05 · l07 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). sort 장르 계약(plane_shape·classify 와 같음): deal() → round, binOf(item, by) → bin key, reasonOf(item, by, wantKo).
 *
 * params: { by: 'slide'|'flip'|'turn'|'kind'|'mix', per: 4|6 }
 *   한 판(round) = 한 유형 — 「어느 이동에서 흔들리는지」가 byType 으로 남는다(plane_shape 와 같은 원칙).
 *
 * 카드 = 교과서·『수학익힘』의 이동 전·후 도형 한 쌍(아래 S — 학습지 tb_g4_2_math_u6 와 같은 칸 좌표).
 *   무대가 칸 좌표로 직접 그린다. 이동 후 도형은 **생성기가 칸 좌표를 변환해** 만든다 — 아이가 보는 그림과 채점 기준이 같은 수에서 나온다.
 *   변환(칸 좌표 · y 아래로): LR 좌우 뒤집기 (x,y)→(−x,y) · UD 위아래 뒤집기 (x,−y) · C90 시계 방향 90° (−y,x) · C180 (−x,−y) · C270 시계 반대 방향 90° (y,−x)
 *
 * type (§21-3 · 교과서 차시 그대로):
 *   slide  l03  어느 쪽으로 밀었나 — 위쪽·아래쪽·왼쪽·오른쪽(『수학』 138쪽 삼각형 7칸 · 익힘 80쪽 3 왼쪽 4칸 · 151쪽 2 오른쪽 3칸 · 익힘 81쪽 알지오매스 5 cm)
 *   flip   l04  어떻게 뒤집었나 — 위아래가 바뀜 / 좌우가 바뀜 / 둘 다 바뀜(143쪽 3 「위쪽으로 뒤집고 오른쪽으로 뒤집었습니다」)
 *   turn   l05  몇 도 돌렸나 — 시계 방향 90° / 180° / 시계 반대 방향 90°(= 시계 방향 270°, 147쪽 2)
 *   kind   l07  밀기·뒤집기·돌리기 가리기 — 스스로 마무리하기 4·5·7, 지도서 424 오류 1(뒤집기 ≠ 돌리기)
 * 카드마다 「다른 칸에도 들어갈 수 있는지」를 좌표로 따져, 한 칸에만 들어가는 카드만 쓴다(대칭인 도형은 그 판에서 빠짐 — 예: 좌우가 같은 꺾쇠는 kind 판 제외).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_move_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ── 칸 좌표 도형 — 교과서·익힘 그림을 칸으로 센 것(학습지 tb_g4_2_math_u6 와 같은 수) ──
  function cells(cs) {   // 칸 모음 → 바깥 테두리 다각형
    var E = {}, k;
    cs.forEach(function (c) {
      var x = c[0], y = c[1], sides = [[[x, y], [x + 1, y]], [[x + 1, y], [x + 1, y + 1]], [[x + 1, y + 1], [x, y + 1]], [[x, y + 1], [x, y]]];
      sides.forEach(function (s) { k = [s[0].join(','), s[1].join(',')].sort().join('|'); if (E[k]) delete E[k]; else E[k] = s; });
    });
    var nxt = {}; Object.keys(E).forEach(function (kk) { nxt[E[kk][0].join(',')] = E[kk][1]; });
    var keys = Object.keys(nxt).sort(), start = keys[0], P = [start.split(',').map(Number)], cur = nxt[start];
    while (cur.join(',') !== start) { P.push(cur); cur = nxt[cur.join(',')]; }
    return simplify(P);
  }
  var S = {
    tri138: { p: [[1, 0], [4, 4], [0, 4]], name: '삼각형', src: '『수학』 138쪽' },
    sq80_3: { p: [[0, 0], [3, 0], [1, 3], [0, 3]], name: '사각형', src: '『수학익힘』 80쪽' },
    para151: { p: [[0, 3], [1, 0], [2, 0], [1, 3]], name: '평행사변형', src: '『수학』 151쪽' },
    tri81: { p: [[0, 4], [4, 4], [2, 1]], name: '삼각형', src: '『수학익힘』 81쪽 알지오매스' },
    q142: { p: [[0, 1], [3, 0], [3, 3], [0, 3]], name: '사각형', src: '『수학』 142쪽' },
    tri143: { p: [[0, 3], [3, 3], [3, 0]], name: '삼각형', src: '『수학』 143쪽' },
    chev82: { p: [[0, 0], [1.5, 1.5], [3, 0], [3, 1.5], [1.5, 3], [0, 1.5]], name: '꺾쇠 모양', src: '『수학익힘』 82쪽' },
    l83: { p: [[0, 0], [1, 0], [1, 2], [3, 2], [3, 3], [0, 3]], name: '도형', src: '『수학익힘』 83쪽' },
    pent83: { p: [[0, 0], [2, 0], [3, 1], [1, 3], [0, 3]], name: '도형', src: '『수학익힘』 83쪽' },
    trap152: { p: [[0, 4], [2, 0], [4, 0], [4, 4]], name: '사각형', src: '『수학』 152쪽' },
    flag141: { p: [[0, 0], [3, 1], [1, 2], [1, 4], [0, 4]], name: '깃발 모양', src: '『수학』 141쪽' },
    tri146: { p: [[0, 0], [0, 3], [3, 3]], name: '삼각형', src: '『수학』 146쪽' },
    trap147: { p: [[1, 0], [2, 0], [3, 3], [0, 3]], name: '사각형', src: '『수학』 147쪽' },
    arrow84: { p: [[1.5, 0], [3, 1.5], [2, 1.5], [2, 3], [1, 3], [1, 1.5], [0, 1.5]], name: '화살표', src: '『수학익힘』 84쪽' },
    q84_2: { p: [[0, 0], [2, 0], [3, 3], [0, 3]], name: '사각형', src: '『수학익힘』 84쪽' },
    notch84: { p: [[0, 0], [3, 0], [3, 3], [0, 3], [0, 2], [1, 2], [1, 1], [0, 1]], name: '도형', src: '『수학익힘』 84쪽' },
    tri85: { p: [[0, 2], [2, 0], [4, 4]], name: '삼각형', src: '『수학익힘』 85쪽' },
    oct151: { p: [[1, 0], [3, 0], [3, 2], [1, 2], [1, 3], [0, 3], [0, 1], [1, 1]], name: '도형', src: '『수학』 151쪽' },
    piece85: { p: cells([[1, 0], [0, 1], [1, 1], [2, 1], [0, 2]]), name: '조각', src: '『수학익힘』 85쪽' },
    house145: { p: [[1, 0], [3, 0], [4, 1.5], [3.5, 1.5], [3.5, 4], [0.5, 4], [0.5, 1.5], [0, 1.5]], name: '집 모양', src: '『수학』 145쪽' },
    house152: { p: [[1, 0], [3, 0], [3, 2], [4, 4], [0, 4], [1, 2]], name: '도형', src: '『수학』 152쪽' }
  };

  // ── 변환·모양 열쇠 ──
  var OPF = { I: function (x, y) { return [x, y]; }, LR: function (x, y) { return [-x, y]; }, UD: function (x, y) { return [x, -y]; },
              C90: function (x, y) { return [-y, x]; }, C180: function (x, y) { return [-x, -y]; }, C270: function (x, y) { return [y, -x]; } };
  function ap(P, ops) { (Array.isArray(ops) ? ops : [ops]).forEach(function (o) { P = P.map(function (q) { return OPF[o](q[0], q[1]); }); }); return P; }
  function norm(P) {
    var mx = Math.min.apply(null, P.map(function (q) { return q[0]; })), my = Math.min.apply(null, P.map(function (q) { return q[1]; }));
    return P.map(function (q) { return [Math.round((q[0] - mx) * 1e6) / 1e6 + 0, Math.round((q[1] - my) * 1e6) / 1e6 + 0]; });
  }
  function simplify(P) {
    P = P.map(function (q) { return [q[0], q[1]]; });
    var ch = true;
    while (ch && P.length > 3) {
      ch = false;
      for (var i = 0; i < P.length; i++) {
        var a = P[(i - 1 + P.length) % P.length], b = P[i], c = P[(i + 1) % P.length];
        if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-9) { P.splice(i, 1); ch = true; break; }
      }
    }
    return P;
  }
  function area2(P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s; }
  function canon(P) {   // 자리·감는 방향·시작 꼭짓점과 상관없는 모양 열쇠
    P = simplify(norm(P)); if (area2(P) < 0) P = P.slice().reverse();
    var k = 0; P.forEach(function (q, i) { if (q[0] < P[k][0] || (q[0] === P[k][0] && q[1] < P[k][1])) k = i; });
    return JSON.stringify(P.slice(k).concat(P.slice(0, k)));
  }
  function same(P, Q) { return canon(P) === canon(Q); }

  // ── 판 정의 ──
  var DN = { R: '오른쪽', L: '왼쪽', U: '위쪽', D: '아래쪽' }, DV = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
  var ROUNDS = {
    slide: { ko: '어느 쪽으로 밀었나', l: 'l03', bins: [{ k: 'U', ko: '위쪽으로 밀기' }, { k: 'D', ko: '아래쪽으로 밀기' }, { k: 'L', ko: '왼쪽으로 밀기' }, { k: 'R', ko: '오른쪽으로 밀기' }],
             prompt: '어느 쪽으로 밀었는지 나눠요', hint: '점선이 밀기 전, 색칠한 도형이 민 후예요. **모양은 그대로, 위치만** 바뀌어요.' },
    flip: { ko: '어떻게 뒤집었나', l: 'l04', bins: [{ k: 'ud', ko: '위쪽이나 아래쪽으로 뒤집기' }, { k: 'lr', ko: '왼쪽이나 오른쪽으로 뒤집기' }, { k: 'both', ko: '위아래로 한 번, 좌우로 한 번' }],
            prompt: '어떻게 뒤집었는지 나눠요', hint: '위쪽·아래쪽으로 뒤집으면 **위아래가**, 왼쪽·오른쪽으로 뒤집으면 **좌우가** 서로 바뀌어요.' },
    turn: { ko: '몇 도 돌렸나', l: 'l05', bins: [{ k: 'C90', ko: '시계 방향 90°' }, { k: 'C180', ko: '180°' }, { k: 'C270', ko: '시계 반대 방향 90°' }],
            prompt: '어떻게 돌렸는지 나눠요', hint: '위쪽 부분이 어디로 갔는지 따라가요. 시계 반대 방향 90°는 **시계 방향 270°**와 같아요.' },
    kind: { ko: '밀기·뒤집기·돌리기', l: 'l07', bins: [{ k: 'slide', ko: '밀기' }, { k: 'flip', ko: '뒤집기' }, { k: 'turn', ko: '돌리기' }],
            prompt: '어떻게 움직였는지 나눠요', hint: '방향까지 그대로면 **밀기**, 위아래나 좌우가 거울처럼 바뀌면 **뒤집기**, 빙 돌아가 있으면 **돌리기**예요.' }
  };
  var TYPES = ['slide', 'flip', 'turn', 'kind'];
  var ORDER = ['l03', 'l04', 'l05', 'l07'];

  // 교과서 카드 — [도형, 이동] (밀기는 [방향, 칸])
  var SLIDE = [['tri138', 'D', 7], ['tri138', 'L', 7], ['tri138', 'U', 7], ['tri138', 'R', 7], ['sq80_3', 'L', 4], ['para151', 'R', 3], ['tri81', 'R', 5]];
  var FLIP = [['q142', 'UD'], ['q142', 'LR'], ['tri143', 'both'], ['l83', 'LR'], ['l83', 'UD'], ['pent83', 'UD'], ['pent83', 'LR'], ['trap152', 'UD'], ['trap152', 'LR'],
              ['flag141', 'UD'], ['flag141', 'LR'], ['chev82', 'UD'], ['house152', 'UD']];
  var TURN = [['tri146', 'C270'], ['tri146', 'C90'], ['tri146', 'C180'], ['trap147', 'C90'], ['arrow84', 'C90'], ['q84_2', 'C90'], ['notch84', 'C90'], ['tri85', 'C180'],
              ['oct151', 'C270'], ['piece85', 'C90'], ['house145', 'C270'], ['house145', 'C90'], ['house145', 'C180'], ['house152', 'C180']];
  var FOPS = { ud: ['UD'], lr: ['LR'], both: ['UD', 'LR'] }, FK = { UD: 'ud', LR: 'lr', both: 'both' };

  function item(type, sk, mv, n) {
    var P = S[sk].p, it = { type: type, shape: sk, name: S[sk].name, src: S[sk].src, before: norm(P) };
    if (type === 'slide') { it.dir = mv; it.n = n; it.after = norm(P); it.dx = DV[mv][0] * n; it.dy = DV[mv][1] * n; }
    else if (type === 'flip') { it.fk = FK[mv]; it.after = norm(ap(P, FOPS[it.fk])); }
    else { it.op = mv; it.after = norm(ap(P, mv)); }
    return it;
  }
  // 한 칸에만 들어가는가 — 그 판의 다른 칸 이동으로도 같은 모양이 나오면 뺀다
  function unique(it, type) {
    var P = S[it.shape].p;
    if (type === 'slide') return true;
    if (type === 'flip') return ['ud', 'lr', 'both'].filter(function (k) { return same(ap(P, FOPS[k]), it.after); }).length === 1 && !same(P, it.after);
    if (type === 'turn') return ['C90', 'C180', 'C270'].filter(function (o) { return same(ap(P, o), it.after); }).length === 1 && !same(P, it.after);
    // kind
    var cat = { slide: [['I']], flip: [['UD'], ['LR']], turn: [['C90'], ['C180'], ['C270']] }, hit = [];
    Object.keys(cat).forEach(function (c) { if (cat[c].some(function (ops) { return same(ap(P, ops), it.after); })) hit.push(c); });
    return hit.length === 1;
  }
  function kindOf(it) { return it.type === 'slide' ? 'slide' : it.type === 'flip' ? 'flip' : 'turn'; }
  var POOL = {
    slide: SLIDE.map(function (c) { return item('slide', c[0], c[1], c[2]); }),
    flip: FLIP.map(function (c) { return item('flip', c[0], c[1]); }).filter(function (it) { return unique(it, 'flip'); }),
    turn: TURN.map(function (c) { return item('turn', c[0], c[1]); }).filter(function (it) { return unique(it, 'turn'); })
  };
  POOL.kind = POOL.slide.concat(POOL.flip.filter(function (it) { return it.fk !== 'both'; }), POOL.turn).filter(function (it) { return unique(it, 'kind'); })
    .map(function (it) { var c = JSON.parse(JSON.stringify(it)); c.kind = kindOf(it); c.type = 'kind'; c.mv = it.type; return c; });

  function binOf(it, type) {
    if (type === 'slide') return it.dir;
    if (type === 'flip') return it.fk;
    if (type === 'turn') return it.op;
    return it.kind;
  }

  // ── 카드 그림(문자열 SVG · DOM 무관) — 무대와 🖨 활동지가 같이 쓴다 ──
  var INK = '#2f2a3f', FILL = '#efe9ff', GRID = '#d9d2ea';

  function pts(P, ox, oy, u) { return P.map(function (q) { return ((ox + q[0]) * u).toFixed(1) + ',' + ((oy + q[1]) * u).toFixed(1); }).join(' '); }
  function ext(P) { return [Math.max.apply(null, P.map(function (q) { return q[0]; })), Math.max.apply(null, P.map(function (q) { return q[1]; }))]; }
  function grid(x0, y0, W, H, u) {
    var s = '';
    for (var i = 0; i <= W; i++) s += '<line x1="' + (x0 + i * u) + '" y1="' + y0 + '" x2="' + (x0 + i * u) + '" y2="' + (y0 + H * u) + '" stroke="' + GRID + '" stroke-width="1"/>';
    for (var j = 0; j <= H; j++) s += '<line x1="' + x0 + '" y1="' + (y0 + j * u) + '" x2="' + (x0 + W * u) + '" y2="' + (y0 + j * u) + '" stroke="' + GRID + '" stroke-width="1"/>';
    return s;
  }

  function svgSlide(it) {
    var e = ext(it.before), x0 = 1 + Math.max(0, -it.dx), y0 = 1 + Math.max(0, -it.dy);
    var W = Math.ceil(e[0]) + Math.abs(it.dx) + 2, H = Math.ceil(e[1]) + Math.abs(it.dy) + 2, u = Math.min(118 / W, 86 / H);
    return '<svg viewBox="0 0 ' + (W * u).toFixed(1) + ' ' + (H * u).toFixed(1) + '" width="' + Math.round(W * u) + '" height="' + Math.round(H * u) + '" role="img" aria-label="밀기 전과 민 후">' +
      grid(0, 0, W, H, u) +
      '<polygon class="mv-before" points="' + pts(it.before, x0, y0, u) + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<polygon class="mv-after" points="' + pts(it.after, x0 + it.dx, y0 + it.dy, u) + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }

  function svgPair(it) {
    var a = ext(it.before), b = ext(it.after), W = Math.ceil(Math.max(a[0], b[0])) + 2, H = Math.ceil(Math.max(a[1], b[1])) + 2;
    var u = Math.min(9, 54 / Math.max(W, H)), pw = W * u, gap = 22, top = 15;
    function panel(P, x, lab, cls) {
      var e2 = ext(P), ox = (W - e2[0]) / 2, oy = (H - e2[1]) / 2;
      return '<text x="' + (x + pw / 2).toFixed(1) + '" y="11" font-size="11" text-anchor="middle" fill="#5b4a86">' + lab + '</text>' +
        '<g transform="translate(' + x.toFixed(1) + ' ' + top + ')">' + grid(0, 0, W, H, u) +
        '<polygon class="' + cls + '" points="' + pts(P, ox, oy, u) + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/></g>';
    }
    var tw = pw * 2 + gap, th = H * u + top + 2;
    return '<svg viewBox="0 0 ' + tw.toFixed(1) + ' ' + th.toFixed(1) + '" width="' + Math.round(tw) + '" height="' + Math.round(th) + '" role="img" aria-label="움직이기 전과 후">' +
      panel(it.before, 0, '전', 'mv-before') +
      '<text x="' + (pw + gap / 2).toFixed(1) + '" y="' + (top + H * u / 2 + 5).toFixed(1) + '" font-size="15" text-anchor="middle" fill="' + INK + '">→</text>' +
      panel(it.after, pw + gap, '후', 'mv-after') + '</svg>';
  }

  function svgOf(it, type) { return (type === 'slide') ? svgSlide(it) : svgPair(it); }

  var DIRKO = { slide: '어느 쪽으로 밀었나요?', flip: '어떻게 뒤집었나요?', turn: '어떻게 돌렸나요?', kind: '어떻게 움직였나요?' };
  function binKo(type, k) { return ROUNDS[type].bins.filter(function (b) { return b.k === k; })[0].ko; }

  return {
    TYPES: TYPES, ORDER: ORDER, ROUNDS: ROUNDS, S: S, POOL: POOL, same: same, canon: canon, ap: ap, svgOf: svgOf,
    printHead: '이동 전과 후를 보고 어떻게 움직였는지 알맞은 것에 ○표 하세요.',
    printRender: function (p) { return svgOf(p.item, p.type) + '<div class="ms-q">' + p.prompt + '</div><div class="ms-bins">( ' + p.bins.map(function (b) { return b.ko; }).join(' · ') + ' )</div>'; },
    printAnswer: function (p) { return p.answer; },
    create: function (params, rng) {
      params = params || {};
      var by = TYPES.indexOf(params.by) >= 0 ? params.by : 'mix';
      var per = [4, 6].indexOf(+params.per) >= 0 ? +params.per : 6;
      var qi = 0, decks = {};
      function take(type) {   // 유형마다 섞은 덱을 돌려 쓴다 — 한 판 안에서는 같은 카드가 겹치지 않음
        var out = [], seen = {};
        while (out.length < per) {
          if (!decks[type] || !decks[type].length) decks[type] = shuffle(rng, POOL[type].slice());
          var it = decks[type].pop(), key = it.shape + '|' + (it.dir || it.fk || it.op || '') + '|' + (it.n || '');
          if (seen[key] && POOL[type].length >= per) continue;
          seen[key] = 1; out.push(JSON.parse(JSON.stringify(it)));
        }
        return out;
      }
      function dealOne(type) {
        var R = ROUNDS[type], items = take(type);
        return { by: type, byKo: R.ko, bins: R.bins.slice(), items: items, prompt: R.prompt, hint: R.hint, type: type, l: R.l };
      }
      return {
        deal: function () { return dealOne(by === 'mix' ? TYPES[qi++ % TYPES.length] : by); },
        next: function () {   // 🖨 활동지 — 카드 한 장 = 한 문제(판과 같은 덱)
          var type = by === 'mix' ? TYPES[qi++ % TYPES.length] : by;
          if (!decks[type] || !decks[type].length) decks[type] = shuffle(rng, POOL[type].slice());
          var it = JSON.parse(JSON.stringify(decks[type].pop()));
          return { item: it, type: type, bins: ROUNDS[type].bins.slice(), prompt: DIRKO[type], answer: binKo(type, binOf(it, type)) };
        },
        binOf: binOf,
        reasonOf: function (it, type, wantKo) {
          if (type === 'slide') return '같은 꼭짓점을 따라가 보면 ' + DN[it.dir] + '으로 ' + it.n + '칸 옮겨졌어요 — 「' + wantKo + '」예요.';
          if (type === 'flip') return it.fk === 'both' ? '위아래와 좌우가 **모두** 바뀌었어요 — 한 번 뒤집으면 한쪽만 바뀌니 두 번 뒤집은 거예요.'
                                    : (it.fk === 'ud' ? '위쪽과 아래쪽이 서로 바뀌었어요' : '왼쪽과 오른쪽이 서로 바뀌었어요') + ' — 「' + wantKo + '」예요.';
          if (type === 'turn') return { C90: '위쪽에 있던 부분이 **오른쪽**으로 갔어요 — 시계 방향 90°예요.', C180: '위쪽에 있던 부분이 **아래쪽**으로 갔어요 — 반 바퀴, 180°예요.', C270: '위쪽에 있던 부분이 **왼쪽**으로 갔어요 — 시계 반대 방향 90°(시계 방향 270°)예요.' }[it.op];
          return { slide: '모양도 방향도 그대로예요 — **밀기**예요.', flip: '거울에 비친 것처럼 ' + (it.fk === 'ud' ? '위아래가' : '좌우가') + ' 바뀌었어요 — **뒤집기**예요(돌려서는 이 모양이 나오지 않아요).', turn: '빙 돌아가 있어요 — **돌리기**예요(뒤집어서는 이 모양이 나오지 않아요).' }[it.kind];
        }
      };
    }
  };
}));
