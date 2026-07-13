/* src/g1m_u3_duel_sg.js — 가르기·모으기 대결 (1학년 수학 3단원, 수116-119)
 * 장르: duel_quiz(stream) · 생성기: split_gather
 * 무대 = 도토리 접시 두 개. 수를 낱개로 보여줘야 1학년이 "모은다/가른다"를 몸으로 안다.
 */
(function () {
  'use strict';

  function dots(n, cls) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<span class="dot ' + cls + '">🌰</span>';
    return s;
  }

  var app = ACore.create({
    activityId: 'g1m_u3_duel_sg',
    title: '🌰 가르기·모으기 대결',
    subtitle: '모으면 몇 개? 가르면 몇 개? 도토리로 확인해요',
    defaults: { qmode: 'mix', max: 9, n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [{ v: 'gather', label: '모으기' }, { v: 'split', label: '가르기' }, { v: 'mix', label: '섞기' }] },
      { key: 'max', label: '수 범위', options: [{ v: 5, label: '5까지' }, { v: 9, label: '9까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="board">' +
        '<div class="plate" id="pL"><div class="dots" id="dL"></div><div class="cap num" id="cL">?</div></div>' +
        '<div class="op" id="op">＋</div>' +
        '<div class="plate" id="pR"><div class="dots" id="dR"></div><div class="cap num" id="cR">?</div></div>' +
        '<div class="op">＝</div>' +
        '<div class="plate result" id="pS"><div class="dots" id="dS"></div><div class="cap num" id="cS">?</div></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['split_gather'].create({ max: app.settings.max, qmode: app.settings.qmode }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          if (q.kind === 'gather') {
            // 모으기: 두 접시가 보이고 합이 비어 있다
            app.el('#op').textContent = '＋';
            app.el('#dL').innerHTML = dots(q.a, 'on');
            app.el('#dR').innerHTML = dots(q.b, 'on');
            app.el('#dS').innerHTML = dots(q.sum, 'ghost');
            app.el('#cL').textContent = q.a;
            app.el('#cR').textContent = q.b;
            app.el('#cS').textContent = '?';
          } else {
            // 가르기: 전체가 보이고 한쪽이 비어 있다
            app.el('#op').textContent = '→';
            app.el('#dL').innerHTML = dots(q.a, 'on');
            app.el('#dR').innerHTML = dots(q.b, 'ghost');
            app.el('#dS').innerHTML = dots(q.sum, 'on');
            app.el('#cL').textContent = q.a;
            app.el('#cR').textContent = '?';
            app.el('#cS').textContent = q.sum;
          }
          app.el('#board').classList.toggle('split', q.kind === 'split');
        },
        options: function (q) {
          return q.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, q) {
          // 정답 공개 = 빈칸이 도토리로 채워진다 (수가 아니라 물건이 채워지는 걸 본다)
          if (q.kind === 'gather') {
            app.el('#dS').innerHTML = dots(q.sum, 'on pop');
            app.el('#cS').textContent = q.sum;
          } else {
            app.el('#dR').innerHTML = dots(q.b, 'on pop');
            app.el('#cR').textContent = q.b;
          }
        }
      });
    }
  });
})();
