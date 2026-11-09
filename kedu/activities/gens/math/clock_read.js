/* gens/math/clock_read.js — 시각 읽기 놀이 (2학년 2학기 수학 4단원 「시각과 시간」 3·4차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + h·m(시계가 나타내는 시각) · ask(묻는 말) · clockSvg(h, m) — 무대와 활동지가 같은 시계 그림을 쓴다.
 * 교과서판(2026-11-09): 『수학』 89쪽 「시각 읽기 놀이」(모형 시계로 시각을 나타내고 시계 방향 다음 친구에게 묻기) +
 *   91쪽·『수학익힘』 59쪽 「몇 시 몇 분 전」. 처음 두 판은 교과서 시각(7시 22분 · 3시 39분 · 1시 13분 · 11시 43분 · 3시 37분 ·
 *   2시 20분 · 7시 25분 · 7시 10분 · 11시 55분 · 9시 55분 · 3시 55분 · 8시 55분 · 3시 50분 · 5시 55분 · 7시 50분 · 2시 50분 가운데 둘).
 * 보기의 다른 시각 = 지도서 오답 유형(249·251·253·264쪽):
 *   두 바늘을 바꾸어 읽음(2시 20분 → 4시 10분) · 긴바늘 숫자를 그대로 분으로(2시 4분 · 7시 6분 · 9시 11분)
 *   · 가까운 숫자만 보고 작은 눈금을 안 셈(7시 20분) · 더 간 칸을 덜 간 칸으로(7시 18분)
 *   · 짧은바늘이 다가간 다음 숫자를 시로(9시 55분 → 10시 55분 · 확인해요 12시 55분)
 *   · 「몇 시 전」의 시를 지금 시로(3시 50분 → 3시 10분 전) · 정각까지 남은 분 대신 지난 분(9시 55분 전).
 * type: five(5분 단위 — 긴바늘이 숫자를 가리킴) · one(1분 단위 — 숫자 사이) · near_hour(짧은바늘이 다음 숫자 가까이)
 *       · before(「몇 시 몇 분 전」으로 읽기 — 5분 전·10분 전만, 지도서 238·253)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['clock_read'] = g;
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
  function HM(h, m) { return m ? h + '시 ' + m + '분' : h + '시'; }

  /* 교과서 판 — 『수학』 87·88·89·90·91쪽 · 『수학익힘』 57·59쪽 · 확인해요 1번 */
  var BOOK = [
    { h: 7, m: 22, type: 'one' }, { h: 3, m: 39, type: 'one' }, { h: 1, m: 13, type: 'one' }, { h: 11, m: 43, type: 'one' }, { h: 3, m: 37, type: 'one' },
    { h: 2, m: 20, type: 'five' }, { h: 7, m: 25, type: 'five' }, { h: 7, m: 10, type: 'five' },
    { h: 11, m: 55, type: 'near_hour' }, { h: 9, m: 55, type: 'near_hour' }, { h: 3, m: 55, type: 'near_hour' },
    { h: 8, m: 55, type: 'before' }, { h: 3, m: 50, type: 'before' }, { h: 5, m: 55, type: 'before' }, { h: 7, m: 50, type: 'before' }, { h: 2, m: 50, type: 'before' }
  ];

  /* 시계 그림 — 바늘 끝 자리는 (h, m) 에서만 셈한다(짧은바늘은 분만큼 다음 숫자 쪽으로 간다) */
  function clockSvg(h, m, size) {
    var C = 100, R = 92, s = '';
    function P(deg, len) { var t = (deg - 90) * Math.PI / 180; return [(C + Math.cos(t) * len).toFixed(1), (C + Math.sin(t) * len).toFixed(1)]; }
    s += '<circle cx="100" cy="100" r="' + R + '" fill="#FFFDF7" stroke="#3b2f2f" stroke-width="4"/>';
    for (var i = 0; i < 60; i++) { var big = i % 5 === 0, a = P(i * 6, big ? R - 13 : R - 7), b = P(i * 6, R - 2);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#3b2f2f" stroke-width="' + (big ? 3 : 1.4) + '"/>'; }
    for (var n = 1; n <= 12; n++) { var p = P(n * 30, R - 28); s += '<text x="' + p[0] + '" y="' + (+p[1] + 7).toFixed(1) + '" text-anchor="middle" class="ck-n">' + n + '</text>'; }
    var ph = P(((h % 12) + m / 60) * 30, 46), pm = P(m * 6, 74);
    s += '<line class="ck-h" x1="100" y1="100" x2="' + ph[0] + '" y2="' + ph[1] + '" stroke="#3b2f2f" stroke-width="9" stroke-linecap="round"/>';
    s += '<line class="ck-m" x1="100" y1="100" x2="' + pm[0] + '" y2="' + pm[1] + '" stroke="#C0392B" stroke-width="5" stroke-linecap="round"/>';
    s += '<circle cx="100" cy="100" r="6" fill="#3b2f2f"/>';
    return '<svg class="ck" viewBox="0 0 200 200"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' role="img" aria-label="바늘 시계">' + s + '</svg>';
  }

  /* 한 판 — 정답 말과 오답(오답 유형마다 하나)을 만든다 */
  function build(rng, it) {
    var h = it.h, m = it.m, k = Math.floor(m / 5), d = m % 5, ans, wrong = [], ask, ex;
    var hw = KO.j(h, '와/과') + ' ' + nx(h) + ' 사이';
    if (it.type === 'before') {
      ans = nx(h) + '시 ' + (60 - m) + '분 전';
      wrong = [h + '시 ' + (60 - m) + '분 전', nx(h) + '시 ' + m + '분 전', nx(h) + '시 ' + (60 - m) + '분'];
      ask = '이 시각을 「몇 시 몇 분 전」으로 읽어 보세요.';
      ex = HM(h, m) + '에서 ' + (60 - m) + '분이 지나면 ' + nx(h) + '시예요. 「몇 시 전」의 시는 곧 될 정각 — ' + ans + '이에요.';
    } else {
      ans = HM(h, m);
      var swap = (k >= 1 && k <= 12 && k !== h && (h * 5) < 60) ? HM(k === 0 ? 12 : k, h * 5) : null;
      if (it.type === 'five') wrong = [h + '시 ' + k + '분', swap, h + '시 ' + (m + 5 < 60 ? m + 5 : m - 5) + '분'];
      else if (it.type === 'one') wrong = [h + '시 ' + (5 * k) + '분', h + '시 ' + (k + d) + '분', h + '시 ' + (5 * k - d) + '분', h + '시 ' + (5 * k + 5) + '분'];
      else wrong = [nx(h) + '시 ' + m + '분', h + '시 ' + k + '분', swap];
      ask = '친구가 모형 시계에 나타낸 시각이에요. 몇 시 몇 분인가요?';
      ex = '짧은바늘은 ' + hw + ' — ' + h + '시예요. ';
      if (d) ex += '긴바늘은 숫자 ' + k + '(' + (5 * k) + '분)에서 작은 눈금 ' + d + '칸 더 — ' + m + '분이에요.';
      else ex += '긴바늘은 숫자 ' + k + ' — 5분씩 ' + k + '번, ' + m + '분이에요.';
      if (it.type === 'near_hour') ex += ' 짧은바늘이 ' + nx(h) + '에 가까워도 아직 닿지 않았어요.';
    }
    var seen = {}; seen[ans] = 1;
    wrong = shuffle(rng, wrong.filter(function (w) { if (!w || seen[w] || /시 0분|시 -|시 6\d분/.test(w)) return false; seen[w] = 1; return true; })).slice(0, 2);
    return { h: h, m: m, ask: ask, prompt: HM(h, m) + ' — ' + ask, options: shuffle(rng, [ans].concat(wrong)), answer: ans, type: it.type, explain: ex };
  }
  function makeRandom(rng) {
    var type = pick(rng, ['five', 'one', 'near_hour', 'before']), h = ri(rng, 1, 12), m;
    if (type === 'five') m = 5 * ri(rng, 1, 8);
    else if (type === 'one') m = 5 * ri(rng, 1, 8) + ri(rng, 1, 4);
    else if (type === 'near_hour') m = pick(rng, [45, 50, 55]);
    else m = pick(rng, [50, 55]);
    return { h: h, m: m, type: type };
  }

  return {
    id: 'clock_read',
    title: '시각 읽기',
    clockSvg: clockSvg,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var order = shuffle(rng, BOOK.slice()), qi = 0;
      return {
        next: function () {
          var it = (book && qi < 2) ? order[qi] : makeRandom(rng);
          qi++;
          return build(rng, it);
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) {
      return clockSvg(q.h, q.m, 96) + '<span class="w-box">' + (q.type === 'before' ? '(　)시 (　)분 전' : '(　)시 (　)분') + '</span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '시계를 보고 시각을 쓰세요. (「전」이 붙은 칸은 「몇 시 몇 분 전」으로)'
  };
}));
