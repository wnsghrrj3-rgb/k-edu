/* src/g1m2_u4_bingo.js — 덧셈 빙고·뺄셈 빙고 놀이 (1학년 2학기 수학 4단원 3·4차시 · 7·8차시)
 * 장르: duel_quiz(stream) · 생성기: bingo_calc — 스트림 엔진에 3×3 빙고판 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 91쪽 「덧셈 빙고 놀이」 — 「하나, 둘, 셋」 하며 고른 수 카드 두 장의 합을 구해 빙고판(10~18)에
 *   있으면 색칠 · 『수학』 99쪽 「뺄셈 빙고 놀이」 — 선생님이 불러 주는 두 수의 차를 구해 빙고판(2~10)에 색칠. 두 줄이면 「빙고!」.
 *   맞히면 그 칸에 도장이 찍히고, 두 줄이 되면 빙고 — 다음 판은 새 빙고판. 합이 10보다 작으면 색칠할 수 없다(지도서 245쪽).
 *   7·8차시는 차시 설정으로 뺄셈 빙고가 열린다(paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="bg">' +
      '<div id="call"></div>' +
      '<div id="bwrap"><div id="board"></div><div id="bingo">빙고!</div></div>' +
      '<div id="blines"></div>' +
    '</div>';
  function dots(n) {                               // 꾸러미 8·9 수 카드 — 10칸 틀에 점
    var h = '<span class="tf">';
    for (var i = 0; i < 10; i++) h += '<i' + (i < n ? ' class="on"' : '') + '></i>';
    return h + '</span>';
  }
  function ncard(n) { return '<span class="nc"><b>' + n + '</b>' + dots(n) + '</span>'; }

  ACore.create({
    activityId: 'g1m2_u4_bingo',
    title: '🎯 덧셈 빙고·뺄셈 빙고',
    subtitle: '두 수의 합이나 차를 구해 빙고판에 색칠 — 두 줄이면 빙고!',
    defaults: { op: 'add', book: 1, n: 10 },
    settings: [
      { key: 'op', label: '놀이', options: [{ v: 'add', label: '덧셈 빙고' }, { v: 'sub', label: '뺄셈 빙고' }] },
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 빙고판으로 시작' }, { v: 0, label: '바로 새 빙고판' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['bingo_calc'], gen = G.create({ op: app.settings.op, book: app.settings.book }, app.rng);
      function drawLines(n) { app.el('#blines').innerHTML = '빙고 줄 ' + (n >= 1 ? '🟣' : '⚪') + (n >= 2 ? '🟣' : '⚪'); }
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#call').innerHTML = q.op === 'add'
            ? '<span class="who">🙋 하나, 둘, 셋!</span>' + ncard(q.a) + '<span class="op">+</span>' + ncard(q.b) + '<span class="op">=</span><span class="qm">?</span>'
            : '<span class="who">🧑‍🏫</span><span class="tbub">「' + q.a + ', ' + q.b + '.」 — 두 수의 차는?</span>';
          app.el('#board').innerHTML = q.board.map(function (v, i) {
            return '<span class="bc' + (q.marked.indexOf(i) >= 0 ? ' mk' : '') + '" data-i="' + i + '">' + v + '</span>';
          }).join('');
          app.el('#bingo').classList.remove('show');
          drawLines(G.linesOf(q.marked).length);
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var qm = app.el('#call .qm'); if (qm) qm.textContent = q.answer;
          if (q.cell >= 0) { var c = app.el('#board').querySelector('.bc[data-i="' + q.cell + '"]'); if (c) c.classList.add('mk', 'now'); }
          q.lines.forEach(function (L) { L.forEach(function (i) { var c = app.el('#board').querySelector('.bc[data-i="' + i + '"]'); if (c) c.classList.add('ln'); }); });
          drawLines(q.lines.length);
          if (q.bingo) app.el('#bingo').classList.add('show');
        }
      });
    }
  });
})();
