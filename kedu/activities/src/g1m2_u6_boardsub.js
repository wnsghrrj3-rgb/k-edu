/* src/g1m2_u6_boardsub.js — 말판 뺄셈 놀이 (1학년 2학기 수학 6단원 4·5차시 「뺄셈을 알아볼까요」)
 * 장르: duel_quiz(stream) · 생성기: board_sub — 스트림 엔진에 교과서 137쪽 말판(출발·도착 둘레 18칸)을 그대로 올렸다.
 * 교과서판(2026-11-09): 『수학』 137쪽 「뺄셈 놀이」 — 주사위를 굴려 나온 수만큼 말을 옮기고, 멈춘 칸의 뺄셈식을 계산한다
 *   (틀리면 원래 자리로 · 한 칸 앞으로·뒤로 · 한 번 쉬기 · 자리 이동하기 · 도착하면 이김). 나(🐻)와 짝(🐧) 두 말이 같이 돈다.
 *   맞히면 칸 밑 빈칸에 답이 들어간다(교과서 말판의 파란 칸). 도착하면 새 식을 놓은 말판으로 한 바퀴 더(지도서 303쪽).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58) — 혼자 해도 짝 말은 스스로 움직인다.
 */
(function () {
  'use strict';
  /* 길 칸 자리 → 판의 [줄, 칸] — 교과서 말판: 출발(오른쪽 아래) → 오른쪽 위로 → 위 줄 왼쪽으로 → 왼쪽 아래로 → 아래 줄 오른쪽으로 → 도착 */
  var GRID = { 0: [6, 5], 1: [5, 5], 2: [4, 5], 3: [3, 5], 4: [2, 5], 5: [1, 5], 6: [1, 4], 7: [1, 3], 8: [1, 2], 9: [1, 1],
               10: [2, 1], 11: [3, 1], 12: [4, 1], 13: [5, 1], 14: [6, 1], 15: [6, 2], 16: [6, 3], 17: [6, 4] };
  var SP = { fwd: '한 칸<br>앞으로', back: '한 칸<br>뒤로', rest: '한 번<br>쉬기', swap: '자리<br>이동하기' };
  var STAGE =
    '<div id="bs">' +
      '<div id="mboard"></div>' +
    '</div>';

  function boardHtml(q) {
    var h = '';
    q.board.forEach(function (c, p) {
      var g = GRID[p], cls = 'cell c-' + c.k, inner;
      if (c.k === 'start') inner = '<span class="st">출발<br>도착</span>';
      else if (c.k === 'sub') inner = '<span class="ex">' + c.a + '<br>−&#8239;' + c.b + '</span><span class="ans">' + (q.done.indexOf(p) >= 0 ? (c.a - c.b) : '') + '</span>';
      else inner = '<span class="sp">' + SP[c.k] + '</span>';
      h += '<div class="' + cls + '" data-p="' + p + '" style="grid-row:' + g[0] + ';grid-column:' + g[1] + '">' + inner +
        (p === q.palTo ? '<i class="tok pal">🐧</i>' : '') + (p === q.to ? '<i class="tok me">🐻</i>' : '') + '</div>';
    });
    var ev = q.events.map(function (e) { return e.kind === 'roll' ? '<span class="die">' + e.v + '</span>' : '<span class="evt">' + e.text + '</span>'; }).join('');
    h += '<div id="mid" style="grid-row:2 / 6;grid-column:2 / 5">' +
      '<div id="evs">' + (q.fresh && q.lap === 1 ? '<span class="evt">🐻 나 · 🐧 짝 — 출발!</span>' : '') + ev + '</div>' +
      '<div id="qexpr"><span id="qa">' + q.a + '</span> − <span id="qb">' + q.b + '</span> = <span id="qr">?</span></div>' +
      '<div id="lap">' + q.lap + '바퀴째 말판</div>' +
    '</div>';
    return h;
  }

  ACore.create({
    activityId: 'g1m2_u6_boardsub',
    title: '🎲 말판 뺄셈 놀이',
    subtitle: '주사위만큼 가서 멈춘 칸의 뺄셈 — 십 모형끼리, 일 모형끼리',
    defaults: { book: 1, n: 10 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 말판으로 시작' }, { v: 0, label: '바로 새 말판' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['board_sub'], gen = G.create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) { app.el('#mboard').innerHTML = boardHtml(q); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var c = app.el('#mboard').querySelector('.cell[data-p="' + q.to + '"]');
          if (c) { c.querySelector('.ans').textContent = q.answer; c.classList.add('solved'); }
          app.el('#qr').textContent = q.answer;
        }
      });
    }
  });
})();
