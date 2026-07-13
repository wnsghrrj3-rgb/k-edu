/* src/g1m_u2_shape.js — 이건 무슨 모양? (1학년 수학 2단원)
 * 장르: duel_quiz(stream) · 생성기: shape3d
 * 무대 = 물건 한 개를 크게. 모양은 쓰임이 아니라 생김새라는 것이 이 단원의 전부다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1m_u2_shape',
    title: '📦 이건 무슨 모양?',
    subtitle: '상자 모양? 둥근기둥 모양? 공 모양?',
    defaults: { n: 10 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: '<div id="show"><div id="ico">?</div><div id="nm"></div></div>',
    onStart: function (app) {
      var gen = GENS['shape3d'].create({}, app.rng);
      var KO = GENS['shape3d'].shapes;
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#ico').textContent = q.thing.i;
          app.el('#nm').textContent = q.thing.n;
        },
        reset: function (app) { app.el('#show').classList.remove('ok'); },
        options: function (q) {
          return q.options.map(function (s) { return { pick: s, label: KO[s] }; });
        },
        reveal: function (app) { app.el('#show').classList.add('ok'); }
      });
    }
  });
})();
