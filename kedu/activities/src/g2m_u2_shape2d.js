/* src/g2m_u2_shape2d.js — 도형 탐정 (2학년 수학 2단원, 여러 가지 도형)
 * 장르: duel_quiz(stream) · 생성기: shape2d
 * 무대 = 도형 한 개(SVG). 일부러 돌려서 낸다 — 삼각형은 뒤집혀도 삼각형이다.
 */
(function () {
  'use strict';

  function poly(n, r, cx, cy) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  ACore.create({
    activityId: 'g2m_u2_shape2d',
    title: '📐 도형 탐정',
    subtitle: '변과 꼭짓점을 세어 봐요 — 돌아가 있어도 같은 도형!',
    defaults: { qmode: 'mix', n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [
        { v: 'name', label: '도형 이름' }, { v: 'sides', label: '변' },
        { v: 'vertex', label: '꼭짓점' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="fig">' +
        '<svg id="sv" viewBox="0 0 240 240"><g id="sg"></g></svg>' +
        '<div id="qq"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['shape2d'].create({ qmode: app.settings.qmode }, app.rng);
      var KO = {};
      GENS['shape2d'].shapes.forEach(function (s) { KO[s.k] = s.ko; });

      Stream.run(app, gen, {
        render: function (app, q) {
          var s = q.shape, g = app.el('#sg');
          g.innerHTML = (s.k === 'circle')
            ? '<circle cx="120" cy="120" r="86" fill="#fde68a" stroke="#d97706" stroke-width="6"/>'
            : '<polygon points="' + poly(s.sides, 92, 120, 120) + '" fill="#fde68a" stroke="#d97706" stroke-width="6" stroke-linejoin="round"/>';
          g.setAttribute('transform', 'rotate(' + q.rot + ' 120 120)');
          app.el('#qq').textContent = q.prompt;
          app.el('#sg').classList.remove('mark');
        },
        reset: function (app) { app.el('#fig').classList.remove('ok'); },
        options: function (q) {
          return q.options.map(function (o) {
            return { pick: o, label: (q.kind === 'name') ? KO[o] : o };
          });
        },
        reveal: function (app, q) {
          app.el('#fig').classList.add('ok');
          // 정답 공개 = 꼭짓점에 점을 찍어 준다 (세는 행위를 눈으로 되짚기)
          if (q.shape.vtx > 0) {
            var pts = poly(q.shape.vtx, 92, 120, 120).split(' ');
            var dots = pts.map(function (p) {
              var xy = p.split(',');
              return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="9" fill="#22c55e"/>';
            }).join('');
            app.el('#sg').insertAdjacentHTML('beforeend', dots);
          }
        }
      });
    }
  });
})();
