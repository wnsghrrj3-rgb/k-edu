/* src/g5k2_u3_dialect_card.js — 표준어 알아맞히기 (5학년 2학기 국어 3단원 「표준어와 방언을 알아봐요」 2·3차시 · 4·5 · 6·7 · 8·9차시 · 마무리)
 * 장르: duel_quiz(stream) · 생성기: g5_2_dialect_card — 「매체 대 매체」와 같은 스트림 엔진에 방언 카드 무대를 올렸다.
 * 교과서판(2026-11-09): 『국어』 117쪽 4번 「표준어 알아맞히기 놀이」 — 붙임 13 방언 카드(방언 + 쓰는 지역)를 보여 주면
 *   방언과 뜻이 같은 표준어를 말한다. 여기서는 보기 셋 가운데 고른다. 「초성 도움」을 켜면 카드 아래에 표준어 초성이 뜬다
 *   (117쪽 날개 「표준어의 첫 글자나 초성으로 도움을 줘도 좋아요」). 맞히면 카드가 뒤집혀 표준어가 보인다(판정 전엔 표준어 0 — 답 미노출).
 * 범위(upto): l02 = 3차시까지(만화·「안동 고구마」·다섯 고개·온라인 사전) · l04 = 5차시까지(「할머니 댁에서 보낸 추석」)
 *   · l06 = 7차시까지(지역별 방언 사례) · all = 단원 전체(「멋져 부러, 세발자전거!」) — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「k2」, map.semester 2.
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="dc">' +
      '<div id="dc-card"><b>방언 카드</b><span id="dc-word"></span><span id="dc-region"></span><span id="dc-cho"></span>' +
        '<span id="dc-std"></span></div>' +
      '<div id="dc-tag"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g5k2_u3_dialect_card',
    title: '🗺️ 표준어 알아맞히기',
    subtitle: '방언 카드에 쓰인 말 — 뜻이 같은 표준어는 무엇일까요?',
    defaults: { upto: 'all', hint: 0, n: 8 },
    settings: [
      { key: 'upto', label: '범위', options: [{ v: 'l02', label: '3차시까지' }, { v: 'l04', label: '5차시까지' }, { v: 'l06', label: '7차시까지' }, { v: 'all', label: '단원 전체' }] },
      { key: 'hint', label: '초성 도움', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g5_2_dialect_card'], gen = G.create({ upto: app.settings.upto, hint: app.settings.hint }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#dc-word').textContent = q.word;
          app.el('#dc-region').textContent = q.region;
          app.el('#dc-cho').textContent = q.hint ? '초성 도움: ' + q.cho : '';
        },
        reset: function (app) {
          app.el('#dc-card').classList.remove('open'); app.el('#dc-std').textContent = '';
          var t = app.el('#dc-tag'); t.textContent = ''; t.classList.remove('show');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#dc-std').textContent = '표준어 「' + q.answer + '」';
          app.el('#dc-card').classList.add('open');
          var t = app.el('#dc-tag'); t.textContent = G.KIND_NAME[q.kind] + ' · ' + q.region; t.classList.add('show');
        }
      });
    }
  });
})();
