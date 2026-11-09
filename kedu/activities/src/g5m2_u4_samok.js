/* src/g5m2_u4_samok.js — 사각사각 사목 놀이 (5학년 2학기 수학 4단원 「소수의 곱셈」 9차시 함께하는 수학 · 『수학』 96~97쪽)
 * 장르: duel_quiz(stream) · 생성기: g5_2_samok — 스트림 엔진에 놀이판(4줄 × 6칸) 무대를 올렸다(형제 g1m2_u4_bingo 의 빙고판 무대 꼴).
 * 교과서판(2026-11-10): 놀이판 9줄 × 6칸의 소수의 곱셈 칸을 골라 풀고, 맞히면 내 색으로 표시 — 가로, 세로, 대각선으로 4칸이
 *   나란히 표시되면 「완성!」 → 다음 판(놀이판의 다른 4줄). 처음 판은 교과서 놀이판 맨 위 4줄.
 *   칸에는 식만 보이고(곱은 가림) 지금 푸는 칸이 반짝인다. 노리는 네 칸에는 점선 테두리 — 「색이 나란히 칠해지도록」(301쪽 핵심 질문).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="sk">' +
      '<div id="call"></div>' +
      '<div id="bwrap"><div id="board"></div><div id="wan">완성!</div></div>' +
      '<div id="sline"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g5m2_u4_samok',
    title: '🟪 사각사각 사목 놀이',
    subtitle: '놀이판의 소수의 곱셈을 풀어 내 색으로 — 4칸 나란히면 완성!',
    defaults: { book: 1, n: 8 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 놀이판 맨 위 4줄' }, { v: 0, label: '놀이판 아무 4줄' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g5_2_samok'], gen = G.create({ book: app.settings.book }, app.rng);
      function drawLine(q, n) {
        app.el('#sline').innerHTML = '놀이판 ' + (q.rows[0] + 1) + '~' + (q.rows[3] + 1) + '줄 · 나란히 ' +
          [0, 1, 2, 3].map(function (i) { return i < n ? '🟪' : '⬜'; }).join('');
      }
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#call').innerHTML = '<span class="ex">' + q.a + ' × ' + q.b + '</span><span class="op">=</span><span class="qm">?</span>';
          app.el('#board').innerHTML = q.cells.map(function (c, i) {
            var cls = 'sc' + (q.marked.indexOf(i) >= 0 ? ' mk' : '') + (q.line.indexOf(i) >= 0 ? ' aim' : '') + (i === q.cell ? ' cur' : '');
            return '<span class="' + cls + '" data-i="' + i + '"><b>' + c[0] + '</b><b>× ' + c[1] + '</b></span>';
          }).join('');
          app.el('#wan').classList.remove('show');
          drawLine(q, q.line.filter(function (i) { return q.marked.indexOf(i) >= 0; }).length);
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var qm = app.el('#call .qm'); if (qm) qm.textContent = q.answer;
          var c = app.el('#board').querySelector('.sc[data-i="' + q.cell + '"]');
          if (c) { c.classList.add('mk', 'now'); c.classList.remove('cur'); c.innerHTML += '<i>' + q.answer + '</i>'; }
          drawLine(q, q.line.filter(function (i) { return i === q.cell || q.marked.indexOf(i) >= 0; }).length);
          if (q.done) {
            q.line.forEach(function (i) { var e = app.el('#board').querySelector('.sc[data-i="' + i + '"]'); if (e) e.classList.add('ln'); });
            app.el('#wan').classList.add('show');
          }
        }
      });
    }
  });
})();
