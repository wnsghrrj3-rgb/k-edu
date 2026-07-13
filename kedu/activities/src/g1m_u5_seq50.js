/* src/g1m_u5_seq50.js — 50까지 줄 세우기 (1학년 수학 5단원, 수128-129)
 * 장르: sequence(무대형) · 생성기: number_line
 * 무대 = 흩어진 수 카드. 순서대로 짚으면 번호가 켜진다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1m_u5_seq50',
    title: '🪜 50까지 줄 세우기',
    subtitle: '뛰어 세기도 해봐요 — 십의 자리가 바뀌는 곳을 조심!',
    defaults: { n: 5, count: 6, step: 1, desc: 0 },
    settings: [
      { key: 'step', label: '뛰어 세기', options: [{ v: 1, label: '1씩' }, { v: 2, label: '2씩' }, { v: 5, label: '5씩' }, { v: 10, label: '10씩' }] },
      { key: 'desc', label: '순서', options: [{ v: 0, label: '작은 수부터' }, { v: 1, label: '큰 수부터' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="line"><div id="hint"></div><div id="cards"></div></div>',
    onStart: function (app) {
      var gen = GENS['number_line'].create({
        from: 1, to: 50, step: app.settings.step || 1,
        count: app.settings.count || 6, desc: app.settings.desc || 0
      }, app.rng);
      Sequence.run(app, gen, {});
    }
  });
})();
