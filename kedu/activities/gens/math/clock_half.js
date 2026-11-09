/* gens/math/clock_half.js — 「시계를 돌려라」 놀이 (1학년 2학기 수학 3단원 「모양과 시각」 5·6·7차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + mode(set: 카드 → 모형 시계 고르기 / read: 시계 → 시각 읽기) · h·m(카드의 시각, m 은 0 또는 30) · card(카드 글 「1:30」)
 *   · clocks(set 판 보기 시계 셋 — 바늘 각도 hd·md) · clockSvg(hd, md) — 무대와 활동지가 같은 시계 그림을 쓴다.
 * 교과서판(2026-11-09): 『수학』 77쪽 「‘시계를 돌려라’ 놀이」(꾸러미 7 — 뒤집힌 카드를 골라 적힌 시각을 모형 시계에 나타내면
 *   카드를 가져감) + 지도서 223쪽 「‘몇 시’ 카드를 추가하여」 + 76쪽 토끼 이야기(4시 30분·5시 30분 읽기).
 *   처음 두 판은 교과서 시각(카드 1:30 · 10:30 · 익힘 47쪽 점심시간 12:30 / 75쪽·지도서 220쪽 8시 · 9시 · 5시 · 3시 / 76쪽 4시 30분 · 5시 30분).
 * 보기의 다른 시계·시각 = 지도서 오답 유형(220·222·223쪽):
 *   짧은바늘과 긴바늘이 가리키는 수를 반대로 나타냄 · 4시 30분을 5시 30분으로(짧은바늘이 다가가는 다음 숫자를 시로)
 *   · 몇 시 30분인데 짧은바늘을 숫자에 딱 맞춤(두 숫자의 가운데가 아님) · 3시를 3시 12분처럼(긴바늘 12를 분으로) → 「몇 시」 판 덫.
 * type: set_hour(「몇 시」 카드를 시계로) · set_half(「몇 시 30분」 카드를 시계로) · read_half(시계를 보고 몇 시 30분 읽기)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['clock_half'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function nx(h) { return h === 12 ? 1 : h + 1; }
  function pv(h) { return h === 1 ? 12 : h - 1; }
  function HM(h, m) { return m ? h + '시 30분' : h + '시'; }
  function deg(x) { return ((x % 360) + 360) % 360; }

  /* 교과서 판 */
  var BOOK = {
    set_half: [[1, 30], [10, 30], [12, 30], [4, 30], [5, 30]],
    set_hour: [[8, 0], [9, 0], [5, 0], [3, 0]],
    read_half: [[4, 30], [5, 30], [1, 30]]
  };

  /* 시계 그림 — 바늘은 각도(12시 방향 0°, 시계 방향)로만 그린다: 틀린 보기(바늘이 뒤바뀐 시계)도 같은 그림으로 */
  function clockSvg(hd, md, size) {
    var C = 100, R = 92, s = '';
    function P(d, len) { var t = (d - 90) * Math.PI / 180; return [(C + Math.cos(t) * len).toFixed(1), (C + Math.sin(t) * len).toFixed(1)]; }
    s += '<circle cx="100" cy="100" r="' + R + '" fill="#FFF6D5" stroke="#3b2f2f" stroke-width="5"/>';
    for (var i = 0; i < 60; i++) { var big = i % 5 === 0, a = P(i * 6, big ? R - 12 : R - 7), b = P(i * 6, R - 2);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#3b2f2f" stroke-width="' + (big ? 3 : 1.2) + '"/>'; }
    for (var n = 1; n <= 12; n++) { var p = P(n * 30, R - 27); s += '<text x="' + p[0] + '" y="' + (+p[1] + 8).toFixed(1) + '" text-anchor="middle" class="ck-n">' + n + '</text>'; }
    var ph = P(hd, 44), pm = P(md, 72);
    s += '<line class="ck-h" x1="100" y1="100" x2="' + ph[0] + '" y2="' + ph[1] + '" stroke="#15803d" stroke-width="10" stroke-linecap="round"/>';
    s += '<line class="ck-m" x1="100" y1="100" x2="' + pm[0] + '" y2="' + pm[1] + '" stroke="#db2777" stroke-width="6" stroke-linecap="round"/>';
    s += '<circle cx="100" cy="100" r="7" fill="#3b2f2f"/>';
    return '<svg class="ck" viewBox="0 0 200 200"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' role="img" aria-label="모형 시계">' + s + '</svg>';
  }
  function right(h, m) { return { hd: deg(h * 30 + (m ? 15 : 0)), md: m ? 180 : 0 }; }
  function idOf(c) { return 'k' + c.hd + '_' + c.md; }

  function build(rng, type, h, m) {
    var card = h + ':' + (m ? '30' : '00'), ans, opts, ex, clocks = null;
    var hw = m ? '짧은바늘은 ' + KO.j(h, '와/과') + ' ' + nx(h) + '의 가운데, 긴바늘은 6을' : '짧은바늘은 ' + h + ', 긴바늘은 12를';
    if (type === 'read_half') {
      ans = HM(h, 30);
      var w2 = pick(rng, ['6시', h + '시', pv(h) + '시 30분']);
      opts = shuffle(rng, [ans, nx(h) + '시 30분', w2]);
      ex = hw + ' 가리켜요 — ' + ans + '. 짧은바늘이 ' + nx(h) + '에 다가가고 있지만 아직 ' + h + '시예요.';
    } else {
      var c0 = right(h, m), wrong = [];
      if (m) {
        wrong.push({ hd: deg(nx(h) * 30 + 15), md: 180, why: 'next' });           // 5시 30분으로
        wrong.push(pick(rng, [{ hd: 180, md: deg(h * 30), why: 'swap' },           // 두 바늘을 반대로
                              { hd: deg(h * 30), md: 180, why: 'on' }]));          // 짧은바늘을 숫자에 딱
      } else {
        wrong.push({ hd: 0, md: deg(h * 30), why: 'swap' });                       // 짧은바늘 12, 긴바늘 h
        wrong.push(pick(rng, [{ hd: deg(h * 30 + 15), md: 180, why: 'half' },      // 몇 시 30분으로
                              { hd: deg(nx(h) * 30), md: 0, why: 'near' }]));       // 한 시간 뒤
      }
      var seen = {}; seen[idOf(c0)] = 1;
      wrong = wrong.filter(function (c) { if (seen[idOf(c)]) return false; seen[idOf(c)] = 1; return true; });
      if (wrong.length < 2) wrong.push({ hd: deg(pv(h) * 30 + (m ? 15 : 0)), md: m ? 180 : 0, why: 'prev' });
      clocks = shuffle(rng, [{ hd: c0.hd, md: c0.md, why: 'ok' }].concat(wrong.slice(0, 2)));
      ans = idOf(c0);
      opts = clocks.map(idOf);
      ex = '카드 「' + card + '」 = ' + HM(h, m) + ' — ' + hw + ' 가리키는 시계예요.' + (m ? '' : ' 긴바늘이 12를 가리키면 「몇 시」예요.');
    }
    return {
      mode: type === 'read_half' ? 'read' : 'set', h: h, m: m, card: card, clocks: clocks,
      prompt: (type === 'read_half' ? '시계 → ' : '카드 ' + card + ' → 시계 ') + HM(h, m),
      options: opts, answer: ans, type: type, explain: ex
    };
  }

  return {
    id: 'clock_half',
    title: '시계를 돌려라',
    clockSvg: clockSvg, idOf: idOf, right: right,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var only = params && params.kind;                 // hour(몇 시만, 5차시) · half(몇 시 30분만) · mix
      var types = only === 'hour' ? ['set_hour'] : only === 'half' ? ['set_half', 'read_half'] : ['set_hour', 'set_half', 'read_half'];
      var qi = 0, bag = [];
      var bookList = shuffle(rng, [].concat.apply([], types.map(function (t) { return BOOK[t].map(function (x) { return [t, x[0], x[1]]; }); })));
      return {
        next: function () {
          var t, h, m;
          if (book && qi < 2) { t = bookList[qi][0]; h = bookList[qi][1]; m = bookList[qi][2]; }
          else {
            if (!bag.length) bag = shuffle(rng, types.concat(types.length === 3 ? ['set_half'] : []));
            t = bag.pop(); h = ri(rng, 1, 12); m = t === 'set_hour' ? 0 : 30;
          }
          qi++;
          return build(rng, t, h, m);
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) {
      if (q.mode === 'read') { var c = right(q.h, q.m); return clockSvg(c.hd, c.md, 96) + '<span class="w-box">(　)시 (　)분</span>'; }
      return '<span class="w-num">' + q.card + '</span> → ' + clockSvg(0, 0, 96).replace(/<line class="ck-[hm]"[^>]*\/>/g, '') + ' <span class="w-box">바늘을 그려 넣으세요</span>';
    },
    printAnswer: function (q) { return HM(q.h, q.m); },
    printHead: '카드의 시각은 시계에 바늘을 그리고, 시계는 시각을 읽어 쓰세요.'
  };
}));
