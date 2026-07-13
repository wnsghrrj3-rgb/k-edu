/* src/g1m_u3_compose10.js — 10을 만들어라! (1학년 수학 3단원, 수111쪽)
 * 장르: duel_quiz(stream) · 생성기: compose10
 * 무대 = 숫자 카드 한 장. 이것이 새 활동 1개의 전부다 (§17 Phase 3 DoD).
 */
(function () {
  'use strict';
  var app = ACore.create({
    activityId: 'g1m_u3_compose10',
    title: '🖐️ 10을 만들어라!',
    subtitle: '빈칸에 들어갈 수는? 10의 단짝을 찾아요',
    defaults: { qmode: 'mix', n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [{ v: 'compose', label: '모으기' }, { v: 'split', label: '가르기' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: '<div id="card"><div id="q">?</div><div id="hands">🖐️🖐️</div></div>',
    onStart: function (app) {
      var gen = GENS['compose10'].create({ qmode: app.settings.qmode }, app.rng);
      Stream.run(app, gen, {
        render: function (app, p) { app.el('#q').textContent = p.prompt; },
        options: function (p) {
          return p.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, p, ok) {
          app.el('#card').classList.add(ok ? 'ok' : 'no');
        },
        reset: function (app) { app.el('#card').classList.remove('ok', 'no'); }
      });
    }
  });
})();
