/* src/g3k2_u4_word_rel.js — 두 낱말은 어떤 관계일까? (3학년 2학기 국어 4단원 「서로 존중하며 대화해요」 · l05(5·6차시)·l14)
 * 장르: category_race(분류 릴레이) · 생성기: word_rel
 * 반 전체가 번호 순서로 나와 낱말 짝 하나씩, 뜻을 포함하는지·반대인지·비슷한지 칸에 넣는다(혼자 하기 = n 문항).
 * 범위는 l05 하나라 범위 칩이 없다.
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g3k2_u4_word_rel',
    title: '🫙 두 낱말은 어떤 관계일까?',
    subtitle: '뜻을 포함할까, 반대일까, 비슷할까? 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="rel"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['word_rel'].create({}, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['word_rel'].categories,
        renderItem: function (q) { return '<span class="ctx"><span class="w">' + esc(q.a) + '</span> — <span class="w">' + esc(q.b) + '</span></span>'; }
      });
    }
  });
})();
