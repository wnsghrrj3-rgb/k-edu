/* src/g2m_u6_skip.js — 뛰어 세기 사다리 (2학년 수학 6단원, 곱셈)
 * 장르: sequence(무대형) · 생성기: number_line — **1학년 순서 잇기와 같은 엔진·같은 생성기**
 * 곱셈의 뿌리는 뛰어 세기다. 2씩·3씩·4씩·5씩 뛰며 카드를 짚으면 곱셈구구가 몸에 남는다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2m_u6_skip',
    title: '🪜 뛰어 세기 사다리',
    subtitle: '2씩·3씩·4씩·5씩 — 뛰어 세면 곱셈이 보여요',
    defaults: { n: 5, count: 6, step: 2, desc: 0 },
    settings: [
      { key: 'step', label: '뛰어 세기', options: [{ v: 2, label: '2씩' }, { v: 3, label: '3씩' }, { v: 4, label: '4씩' }, { v: 5, label: '5씩' }] },
      { key: 'desc', label: '순서', options: [{ v: 0, label: '작은 수부터' }, { v: 1, label: '큰 수부터' }] },
      { key: 'count', label: '카드 수', options: [{ v: 5, label: '5장' }, { v: 6, label: '6장' }, { v: 8, label: '8장' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="line"><div id="hint"></div><div id="cards"></div></div>',
    onStart: function (app) {
      var gen = GENS['number_line'].create({
        from: 2, to: 90, step: app.settings.step || 2,
        count: app.settings.count || 6, desc: app.settings.desc || 0
      }, app.rng);
      Sequence.run(app, gen, {});
    }
  });
})();
