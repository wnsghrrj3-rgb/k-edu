/* src/g1m_u1_count9.js — 몇 개일까? (1학년 수학 1단원, 9까지의 수)
 * 장르: duel_quiz(stream) · 생성기: count9
 * 무대 = 마당에 흩어진 물건들. 줄지어 있을 때와 흩어져 있을 때 세기 난도가 다르다 —
 * 그 차이가 곧 수 세기 학습의 핵심이라 layout을 생성기가 결정한다.
 */
(function () {
  'use strict';

  var app = ACore.create({
    activityId: 'g1m_u1_count9',
    title: '🍎 모두 몇 개일까?',
    subtitle: '하나, 둘, 셋… 세어 보고 맞혀요',
    defaults: { max: 9, arrange: 'mix', n: 10 },
    settings: [
      { key: 'max', label: '수 범위', options: [{ v: 5, label: '5까지' }, { v: 9, label: '9까지' }] },
      { key: 'arrange', label: '놓는 방법', options: [{ v: 'line', label: '줄 세우기' }, { v: 'random', label: '흩어 놓기' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: '<div id="yard"><div id="things"></div></div>',
    onStart: function (app) {
      var gen = GENS['count9'].create({ max: app.settings.max, arrange: app.settings.arrange }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          var box = app.el('#things');
          box.className = q.layout;                 // line | random
          var html = '';
          for (var i = 0; i < q.total; i++) {
            var st = (q.layout === 'random')
              ? ' style="left:' + q.points[i].x + '%;top:' + q.points[i].y + '%"'
              : '';
            html += '<span class="thing"' + st + '>' + q.thing + '</span>';
          }
          box.innerHTML = html;
        },
        options: function (q) {
          return q.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, q, ok) {
          // 정답 공개 = 하나씩 번호가 켜진다 (센다는 행위를 눈으로 되짚어 준다)
          var ths = app.els('#things .thing');
          ths.forEach(function (t, i) {
            setTimeout(function () {
              t.classList.add('counted');
              t.setAttribute('data-i', i + 1);
            }, i * 130);
          });
          if (!ok) app.el('#things').classList.add('miss');
        },
        reset: function (app) { app.el('#things').classList.remove('miss'); }
      });
    }
  });
})();
