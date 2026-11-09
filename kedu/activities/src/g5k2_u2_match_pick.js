/* src/g5k2_u2_match_pick.js — 어울리는 말에 ○ (5학년 2학기 국어 2단원 「올바른 문장으로 글을 써요」 3·4차시 · 5·6차시 · 마무리)
 * 장르: duel_quiz(stream) · 생성기: g5_2_match_pick — 「매체 대 매체」와 같은 스트림 엔진에 문장 카드 무대를 올렸다.
 * 교과서판(2026-11-09): 『국어』 78~83쪽 「문장 성분의 호응 관계 알아보기」 — 문장을 읽고 알맞은 말에 ○ 표(80쪽 2의 (1)번),
 *   주어·목적어에 어울리는 서술어(78쪽 1번 · 79쪽 문장 탐구 놀이), 「장미꽃 피우기」 일기와 「형섭이의 하루」 고쳐 쓰기(81~83쪽).
 *   보기 둘 가운데 고르면 빈칸이 채워져 문장이 완성되고 호응 갈래가 뜬다(판정 전엔 빈칸·갈래 표시 0 — 답 미노출).
 *   「왜 그럴까」 보너스(혼자·과제) = 「무엇과 무엇이 어울려야 했어?」 — 꾸며 주는 말과 뒤따르는 말 · 주어와 서술어 · 목적어와 서술어 · 높이는 말.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「k2」, map.semester 2.
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="mp">' +
      '<div id="mp-card"><b>알맞은 말에 ○</b><p id="mp-sent"><span class="pre"></span><span class="blank">＿＿＿</span><span class="post"></span></p></div>' +
      '<div id="mp-tag"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g5k2_u2_match_pick',
    title: '⭕ 어울리는 말에 ○',
    subtitle: '앞에 오는 말과 잘 어울리는 말이 뒤따라야 해요 — 빈칸에 들어갈 말은?',
    defaults: { book: 1, n: 8, why: 0 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 문장으로 시작' }, { v: 0, label: '바로 섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g5_2_match_pick'], gen = G.create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#mp-sent .pre').textContent = q.sent[0];
          app.el('#mp-sent .post').textContent = q.sent[1];
        },
        reset: function (app) {
          var b = app.el('#mp-sent .blank'); b.textContent = '＿＿＿'; b.classList.remove('fill');
          var t = app.el('#mp-tag'); t.textContent = ''; t.classList.remove('show');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var b = app.el('#mp-sent .blank'); b.textContent = q.answer; b.classList.add('fill');
          var t = app.el('#mp-tag'); t.textContent = '호응 — ' + G.KIND_NAME[q.kind]; t.classList.add('show');
        },
        why: {
          question: '🦉 무엇과 무엇이 어울려야 했어?',
          options: [
            { v: 'word', label: '🔗 꾸며 주는 말과 뒷말' },
            { v: 'subj', label: '👤 주어와 서술어' },
            { v: 'obj', label: '🎯 목적어와 서술어' },
            { v: 'honor', label: '🙇 높이는 말끼리' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
