/* src/g2m2_u6_nextpat.js — 다음에 올 무늬 맞히기 (2학년 2학기 수학 6단원 2·3·8차시)
 * 장르: duel_quiz(stream) · 생성기: rule_next — 2단원 「곱셈표 수 찾기 놀이」와 같은 스트림 엔진에 무늬 줄·돌아가는 판 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 132~135쪽 「규칙에 따라 빈칸에 알맞은 모양」 · 144~145쪽 확인해요 · 146~147쪽 동작과 소리 규칙.
 *   무늬 줄(또는 돌아가는 판) 끝이나 가운데의 ? 에 올 것을 보기 셋에서 고른다 — 맞히면 ? 칸에 답이 채워지고 규칙 한 줄이 뜬다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="rnk">' +
      '<div id="pwrap"></div>' +
      '<div id="ask"></div>' +
      '<div id="say"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g2m2_u6_nextpat',
    title: '🔁 다음에 올 무늬 맞히기',
    subtitle: '무늬에서 되풀이·돌기·늘기를 찾아 ? 에 올 것을 골라요',
    defaults: { book: 1, n: 10 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 빈칸으로 시작' }, { v: 0, label: '바로 새 무늬' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['rule_next'], gen = G.create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) { app.el('#pwrap').innerHTML = G.patHtml(q); app.el('#ask').textContent = q.ask; },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) { return q.options.map(function (o, i) { return { pick: o, label: q.labels[i] }; }); },
        reveal: function (app, q) {
          var s = app.el('#say'); s.textContent = '✅ ' + q.answerText + ' — 규칙대로예요'; s.classList.add('show');
          var holes = app.el('#pwrap').querySelectorAll('[data-q]');
          if (holes.length) holes[holes.length - 1].classList.add('lit');
        }
      });
    }
  });
})();
