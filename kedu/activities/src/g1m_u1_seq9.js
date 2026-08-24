/* src/g1m_u1_seq9.js — 수 카드 줄 세우기 (1학년 수학 1단원, 9까지의 수)
 * 장르: sequence(무대형) · 생성기: number_line
 * 무대 = 흩어진 수 카드. 순서대로 짚으면 번호가 켜진다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1m_u1_seq9',
    title: '🔢 수 카드 줄 세우기',
    subtitle: '흩어진 수 카드를 작은 수부터 순서대로 짚어요',
    defaults: { n: 5, count: 6, desc: 0 },
    settings: [
      { key: 'count', label: '카드 수', options: [{ v: 5, label: '5장' }, { v: 6, label: '6장' }, { v: 9, label: '9장' }] },
      { key: 'desc', label: '순서', options: [{ v: 0, label: '작은 수부터' }, { v: 1, label: '큰 수부터' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="line"><div id="hint"></div><div id="cards"></div></div>',
    onStart: function (app) {
      var gen = GENS['number_line'].create({
        from: 1, to: 9, step: app.settings.step || 1,
        count: app.settings.count || 6, desc: app.settings.desc || 0
      }, app.rng);
      Sequence.run(app, gen, {});
    }
  });
})();
