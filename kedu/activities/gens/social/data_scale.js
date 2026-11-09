/* gens/social/data_scale.js — 어느 해가 더 많을까? (3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 l02 · l03 · l08 · l12 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). 저울 견주기(balance · stream) — compare999·g4_2_change_scale 와 같은 계약(answer L/E/R + type + explain + whyAns).
 *
 * params: { upto: 'l02'|'l03'|'l08'|'all' }
 *   upto  그 차시까지 나온 교과서 자료만 섞는다(단원 처음부터 누적). 이번 차시 자료가 덱 앞머리. 'all' = l12 단원 마무리(고르게).
 *
 * 자료는 모두 교과서 그대로다(학습지 tb_g3_2_soc_u1 의 그래프 줄글과 같은 수 — 스모크가 대조):
 *   birth   l02  『사회』 15쪽 우리나라에서 연도별 태어나는 아이의 수(만 명) — 1970 101 · 1980 86 · 1990 65 · 2000 64 · 2010 47 · 2020 27
 *   work    l02  『사회』 16쪽 생산 가능 인구(15~64세)의 변화 예상(만 명) — 2020 3,738 · 2030 3,416 · 2040 2,902 · 2050 2,444
 *   village l03  『사회』 18쪽 우리나라가 100명이 사는 마을이라면 — 노인(65세 이상) 1980 4명 · 2020 16명 · 2050(예상) 40명 정도
 *   migrant l08  『사회』 40쪽 우리나라의 외국인 이주민 수(만 명) — 2009 111 · 2012 141 · 2015 171 · 2018 205 · 2021 213
 * 무대가 자료로 막대그래프(birth·work·migrant)와 100칸 점 마을(village)을 직접 그린다(교과서처럼 막대 위에 수).
 *
 * type (§21-3 · 교과서 차시 그대로 — D22):
 *   val   두 해 견주기 — 두 해의 수(막대 길이 · 노인 점 수)를 읽고 견줌. 1990년 65만 명 · 2000년 64만 명처럼 거의 같아 보여도 수로 견줌(학습지 X05)
 *   gap   변한 양 견주기 — 두 동안(바로 옆 해끼리) 줄어든 양·늘어난 양을 견줌. 외국인 이주민 2009→2012 · 2012→2015 는 30만 명씩 — 같아요
 * whyAns: 'h' 두 해의 수(막대 길이)를 읽고 견줌 · 'd' 두 해 사이에 변한 양을 견줌.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g3_2_data_scale'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l08', 'l12'];
  var TYPES = ['val', 'gap'];
  var TAG = { val: '어느 해가 더?', gap: '더 많이 변한 동안은?' };
  function Y(xs) { return xs.map(function (x) { return x + '년'; }); }
  /* 교과서 자료 — l: 그 자료가 나오는 차시(케이티처 차시 키) · src: 쪽 · u: 단위 · vh: 무엇의 수 · kind: bars(막대) · dots(100칸 마을) */
  var D = {
    birth:   { l: 'l02', src: '『사회』 15', title: '우리나라에서 연도별 태어나는 아이의 수', kind: 'bars', vh: '태어나는 아이의 수', u: '만 명', xs: Y([1970, 1980, 1990, 2000, 2010, 2020]), v: [101, 86, 65, 64, 47, 27], ymax: 120, tick: 20 },
    work:    { l: 'l02', src: '『사회』 16', title: '생산 가능 인구(15~64세)의 변화 예상', kind: 'bars', vh: '일할 수 있는 사람의 수', u: '만 명', xs: Y([2020, 2030, 2040, 2050]), v: [3738, 3416, 2902, 2444], ymax: 4000, tick: 1000 },
    village: { l: 'l03', src: '『사회』 18', title: '우리나라가 100명이 사는 마을이라면', kind: 'dots', vh: '노인의 수', u: '명', xs: ['1980년', '2020년', '2050년(예상)'], v: [4, 16, 40] },
    migrant: { l: 'l08', src: '『사회』 40', title: '우리나라의 외국인 이주민 수', kind: 'bars', vh: '외국인 이주민 수', u: '만 명', xs: Y([2009, 2012, 2015, 2018, 2021]), v: [111, 141, 171, 205, 213], ymax: 250, tick: 50 }
  };
  var KEYS = Object.keys(D);

  /* 「2050년(예상)」처럼 괄호로 끝나면 괄호 안 말(예상)로 조사를 고른다 — 읽는 소리 그대로 */
  function J(w, pair) { var m = String(w).match(/\(([^)]*)\)$/); return m ? w + KO.only(m[1], pair) : KO.j(w, pair); }
  function comma(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function vu(v, u) { return comma(v) + u; }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function lvl(l) { return ORDER.indexOf(l); }
  function board(d, hl) { return { title: d.title, kind: d.kind, xs: d.xs.slice(), v: d.v.slice(), u: d.u, ymax: d.ymax || 0, tick: d.tick || 0, hl: hl }; }
  function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }

  var MAKE = {
    val: function (d, rng) {
      var n = d.v.length, ps = [];
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) if (a !== b) ps.push([a, b]);
      var near = ps.filter(function (p) { return Math.abs(d.v[p[0]] - d.v[p[1]]) <= 2; });
      var p = (near.length && rng() < 0.25) ? pick(rng, near) : pick(rng, ps);
      var va = d.v[p[0]], vb = d.v[p[1]], ans = va === vb ? 'E' : (va > vb ? 'L' : 'R'), big = ans === 'L' ? p[0] : p[1];
      var dots = d.kind === 'dots';
      var tail = ans === 'E' ? '두 수가 같아요 — 같아요!'
        : (dots ? d.xs[big] + '의 마을에 노인이 더 많아요.' : J(d.xs[big] + '의 막대', '이/가') + ' 더 길어요.');
      if (ans !== 'E' && Math.abs(va - vb) <= 2) tail += ' 막대가 거의 같아 보여도 ' + vu(Math.abs(va - vb), d.u) + ' 차이가 나요.';
      return {
        prompt: '「' + d.title + '」 — ' + J(d.xs[p[0]], '와/과') + ' ' + d.xs[p[1]] + ' 가운데 ' + KO.j(d.vh, '이/가') + ' 더 많은 때는?',
        sa: [d.xs[p[0]], ''], sb: [d.xs[p[1]], ''], ra: vu(va, d.u), rb: vu(vb, d.u),
        g: board(d, [[p[0], 'L'], [p[1], 'R']]), answer: ans, whyAns: 'h', pair: p,
        explain: (dots ? '100명 가운데 노인 — ' : '') + d.xs[p[0]] + ' ' + vu(va, d.u) + ', ' + d.xs[p[1]] + ' ' + vu(vb, d.u) + ' — ' + tail
      };
    },
    gap: function (d, rng) {
      var n = d.v.length, I = [], ps = [];
      for (var i = 0; i + 1 < n; i++) I.push(i);
      I.forEach(function (a) { I.forEach(function (b) { if (a !== b) ps.push([a, b]); }); });
      var df = function (i) { return d.v[i + 1] - d.v[i]; };
      var eq = ps.filter(function (p) { return Math.abs(df(p[0])) === Math.abs(df(p[1])); });
      var p = (eq.length && rng() < 0.3) ? pick(rng, eq) : pick(rng, ps);
      var a = p[0], b = p[1], da = df(a), db = df(b), ma = Math.abs(da), mb = Math.abs(db);
      var ans = ma === mb ? 'E' : (ma > mb ? 'L' : 'R');
      var up = da > 0;                                                      // 한 자료 안에서는 모두 줄거나 모두 늘어남(교과서 자료)
      var verb = up ? '늘어났' : '줄어들었';
      var line = function (i, x) { return d.xs[i] + ' ' + vu(d.v[i], d.u) + ' → ' + d.xs[i + 1] + ' ' + vu(d.v[i + 1], d.u) + ' (' + vu(Math.abs(x), d.u) + ' ' + (x > 0 ? '늘어남' : '줄어듦') + ')'; };
      return {
        prompt: '「' + d.title + '」 — 어느 동안 ' + KO.j(d.vh, '이/가') + ' 더 많이 ' + verb + '을까요?',
        sa: [d.xs[a], '→ ' + d.xs[a + 1]], sb: [d.xs[b], '→ ' + d.xs[b + 1]],
        ra: (da > 0 ? '+' : '−') + vu(ma, d.u), rb: (db > 0 ? '+' : '−') + vu(mb, d.u),
        g: board(d, [[a, 'L'], [a + 1, 'L'], [b, 'R'], [b + 1, 'R']]), answer: ans, whyAns: 'd', pair: p,
        explain: '왼쪽 ' + line(a, da) + ' · 오른쪽 ' + line(b, db) + ' — ' +
          (ans === 'E' ? '변한 양이 같아요 — 같아요!' : comma(Math.max(ma, mb)) + ' > ' + comma(Math.min(ma, mb)) + ' — ' + (ans === 'L' ? '왼쪽' : '오른쪽') + ' 동안 더 많이 ' + verb + '어요.')
      };
    }
  };
  /* 100칸 마을은 두 동안만 있어 변한 양 견주기도 한 쌍뿐 — 그래도 틀로 둔다(노인이 12명 → 24명 늘어남) */
  var FRAMES = [];
  KEYS.forEach(function (k) { TYPES.forEach(function (t) { FRAMES.push({ id: k + ':' + t, key: k, type: t, l: D[k].l }); }); });

  function create(params, rng) {
    var upto = params && params.upto, ui = ORDER.indexOf(upto);
    if (upto === 'all' || upto === 'l12' || ui < 0) ui = ORDER.length - 1;
    var cur = (upto === 'all' || upto === 'l12' || ORDER.indexOf(upto) < 0) ? null : ORDER[ui];
    var pool = FRAMES.filter(function (f) { return lvl(f.l) <= ui; });
    var size = pool.length * 3;
    function deck() {
      var now = cur ? shuffle(rng, pool.filter(function (f) { return f.l === cur; })) : [];
      var rest = shuffle(rng, pool.filter(function (f) { return !cur || f.l !== cur; }));
      var out = now.concat(rest), more = shuffle(rng, pool).concat(shuffle(rng, pool));   // 틀이 적어 세 바퀴(바퀴마다 다른 해 짝)
      return out.concat(more);
    }
    var Q = deck(), qi = 0, lastQ = '';
    return {
      size: size,
      next: function () {
        if (qi >= Q.length) { Q = shuffle(rng, pool).concat(shuffle(rng, pool)); qi = 0; }
        var f = Q[qi++], q = null;
        for (var t = 0; t < 6; t++) { q = MAKE[f.type](D[f.key], rng); if (q.prompt + q.pair !== lastQ) break; }   // 바로 앞과 같은 짝은 다시 뽑기
        lastQ = q.prompt + q.pair;
        q.id = f.id; q.l = f.l; q.type = f.type; q.key = f.key; q.src = D[f.key].src; q.tag = TAG[f.type];
        return q;
      },
      check: function (pick2, q) { return pick2 === q.answer; }
    };
  }

  return {
    id: 'g3_2_data_scale',
    title: '어느 해가 더 많을까?',
    ORDER: ORDER, TYPES: TYPES, D: D, FRAMES: FRAMES,
    create: create,
    printRender: function (q) {
      return '<div class="w-q">' + q.prompt + '</div><span class="w-num">' + q.sa.join(' ') + '</span><span class="w-box">◯</span><span class="w-num">' + q.sb.join(' ') + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '교과서 그래프를 보고 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
