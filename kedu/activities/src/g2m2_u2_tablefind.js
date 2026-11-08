/* src/g2m2_u2_tablefind.js — 곱셈표 수 찾기 놀이 (2학년 2학기 수학 2단원 9·11차시)
 * 장르: duel_quiz(stream) · 생성기: gugu_clue — 1학기 「묶음의 비밀」과 같은 스트림 엔진에 곱셈표 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 55쪽 「곱셈표에서 수 찾기 놀이」 — 세 친구가 곱셈구구로 수를 설명하면 곱셈표에서 그 수를 찾는다.
 *   맞히면 곱셈표에서 그 수가 있는 칸이 모두 켜진다(곱이 같은 곱셈구구가 여럿 — 9차시 「곱이 같은 곱셈구구」).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  function tableHtml() {
    var h = '<tr><th class="gx">×</th>';
    for (var c = 1; c <= 9; c++) h += '<th>' + c + '</th>';
    h += '</tr>';
    for (var r = 1; r <= 9; r++) {
      h += '<tr><th>' + r + '</th>';
      for (var c2 = 1; c2 <= 9; c2++) h += '<td data-r="' + r + '" data-c="' + c2 + '">' + (r * c2) + '</td>';
      h += '</tr>';
    }
    return '<table id="gtab" aria-label="곱셈표">' + h + '</table>';
  }
  var STAGE =
    '<div id="tf">' +
      '<div id="clues"></div>' +
      '<div id="tabwrap">' + tableHtml() + '</div>' +
    '</div>';

  ACore.create({
    activityId: 'g2m2_u2_tablefind',
    title: '🔎 곱셈표 수 찾기 놀이',
    subtitle: '세 친구의 단서를 모두 지키는 수는? 곱셈표에서 찾아요',
    defaults: { book: 1, n: 10 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 수로 시작' }, { v: 0, label: '바로 새 단서' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['gugu_clue'].create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#clues').innerHTML = q.clues.map(function (c, i) {
            return '<div class="clue"><span class="who">' + c.who + '</span><span class="bub"><b>' + '①②③'[i] + '</b> ' + c.text + '</span></div>';
          }).join('');
        },
        reset: function (app) {
          var tds = app.el('#gtab').querySelectorAll('td.hit');
          for (var i = 0; i < tds.length; i++) tds[i].classList.remove('hit');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          q.cells.forEach(function (rc) {
            var td = app.el('#gtab').querySelector('td[data-r="' + rc[0] + '"][data-c="' + rc[1] + '"]');
            if (td) td.classList.add('hit');
          });
        }
      });
    }
  });
})();
