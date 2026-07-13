/* src/g2m_u6_multiply.js — 묶음의 비밀 (2학년 수학 6단원, 곱셈)
 * 장르: duel_quiz(stream) · 생성기: multiply
 * 무대 = 묶음판. "3씩 4묶음"이 실제 도토리 묶음으로 보인다 —
 * 곱셈은 규칙이 아니라 같은 수의 되풀이라는 것을 눈으로 먼저.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2m_u6_multiply',
    title: '✖️ 묶음의 비밀',
    subtitle: '몇씩 몇 묶음? 곱셈은 같은 수의 되풀이예요',
    defaults: { qmode: 'mix', max: 9, n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [
        { v: 'group', label: '몇씩 몇 묶음' }, { v: 'times', label: '곱셈식' }, { v: 'mix', label: '섞기' }] },
      { key: 'max', label: '수 범위', options: [{ v: 5, label: '5까지' }, { v: 9, label: '9까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: '<div id="mul"><div id="groups"></div><div id="mq"></div></div>',
    onStart: function (app) {
      var gen = GENS['multiply'].create({ qmode: app.settings.qmode, max: app.settings.max }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          var html = '';
          for (var g = 0; g < q.b; g++) {
            var dots = '';
            for (var i = 0; i < q.a; i++) dots += '<span class="md">🌰</span>';
            html += '<div class="grp">' + dots + '</div>';
          }
          app.el('#groups').innerHTML = html;
          app.el('#mq').textContent = q.prompt;
        },
        reset: function (app) { app.el('#mul').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app) { app.el('#mul').classList.add('ok'); }
      });
    }
  });
})();
