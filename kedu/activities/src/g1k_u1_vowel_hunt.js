/* src/g1k_u1_vowel_hunt.js — 낱말 속 모음자 찾기 (1학년 국어 1단원 · l09~l11·l14)
 * 장르: text_hunt(글 속 찾기) · 생성기: vowel_hunt
 * 낱말 몇 개가 판에 놓이고, 부른 모음자가 든 글자를 모두 짚는다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1k_u1_vowel_hunt',
    title: '🔍 낱말 속 모음자 찾기',
    subtitle: '부른 모음자가 숨어 있는 글자를 모두 짚어요',
    defaults: { n: 5, pool: 'basic', words: 4 },
    settings: [
      { key: 'pool', label: '모음자', options: [{ v: 'basic', label: '기본' }, { v: 'more', label: '여러 가지' }, { v: 'mix', label: '섞어서' }] },
      { key: 'words', label: '낱말 수', options: [{ v: 3, label: '3개' }, { v: 4, label: '4개' }, { v: 5, label: '5개' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['vowel_hunt'].create({ pool: app.settings.pool, words: app.settings.words }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
