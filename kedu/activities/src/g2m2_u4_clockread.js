/* src/g2m2_u4_clockread.js — 시각 읽기 놀이 (2학년 2학기 수학 4단원 3·4차시)
 * 장르: duel_quiz(stream) · 생성기: clock_read — 2단원 「곱셈표 수 찾기 놀이」와 같은 스트림 엔진에 바늘 시계 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 89쪽 「시각 읽기 놀이」 — 모형 시계를 가진 친구가 시각을 나타내고 시계 방향 다음 친구에게 물으면
 *   그 친구가 읽는다(잘못 읽으면 친구들이 도와줌) + 91쪽·『수학익힘』 59쪽 「몇 시 몇 분 전」으로 읽기.
 *   맞히면 시계 밑에 바르게 읽은 말이 뜨고, 「몇 분 전」 판은 곧 될 정각까지 긴바늘이 갈 길을 보여 준다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="cr">' +
      '<div id="crask"><span class="who">🙋 시계 방향 다음 친구에게</span><span class="bub" id="ask"></span></div>' +
      '<div id="clk"></div>' +
      '<div id="say"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g2m2_u4_clockread',
    title: '🕰️ 시각 읽기 놀이',
    subtitle: '짧은바늘이 지나온 숫자가 시, 긴바늘은 숫자에서 작은 눈금을 세어 분',
    defaults: { book: 1, n: 10 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 시각으로 시작' }, { v: 0, label: '바로 새 시각' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['clock_read'], gen = G.create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#ask').textContent = q.ask;
          app.el('#clk').innerHTML = G.clockSvg(q.h, q.m);
        },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var s = app.el('#say');
          s.textContent = q.type === 'before' ? '⏳ ' + q.answer + ' — 긴바늘이 12까지 ' + (60 - q.m) + '분 더 가면 정각' : '🕰️ ' + q.answer;
          s.classList.add('show');
        }
      });
    }
  });
})();
