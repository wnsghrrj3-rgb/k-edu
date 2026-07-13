/* src/g2m_u3_addsub.js — 받아올림 대결 (2학년 수학 3단원)
 * 장르: duel_quiz(stream) · 생성기: addsub2
 * 무대 = 세로셈 판. 받아올림·받아내림이 일어나는 자리에 불이 들어온다 —
 * 2학년 최대 고비를 눈으로 보게 한다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2m_u3_addsub',
    title: '➕ 받아올림 대결',
    subtitle: '십의 자리로 올리고, 십의 자리에서 빌려오고!',
    defaults: { qmode: 'mix', carry: 1, n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [{ v: 'add', label: '덧셈' }, { v: 'sub', label: '뺄셈' }, { v: 'mix', label: '섞기' }] },
      { key: 'carry', label: '받아올림·내림', options: [{ v: 0, label: '없이' }, { v: 1, label: '포함' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="vert">' +
        '<div class="row"><span class="carry" id="cmark"></span><span class="n num" id="va"></span></div>' +
        '<div class="row"><span class="op" id="vop">+</span><span class="n num" id="vb"></span></div>' +
        '<div class="bar"></div>' +
        '<div class="row"><span class="carry"></span><span class="n num" id="vr">?</span></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['addsub2'].create({ qmode: app.settings.qmode, carry: app.settings.carry }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#va').textContent = q.a;
          app.el('#vb').textContent = q.b;
          app.el('#vop').textContent = (q.kind === 'add' ? '+' : '−');
          app.el('#vr').textContent = '?';
          app.el('#cmark').textContent = '';
        },
        reset: function (app) { app.el('#vert').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#vr').textContent = q.answer;
          app.el('#vert').classList.add('ok');
          // 받아올림·받아내림 표시 — 규칙이 아니라 사건으로 보이게
          if (q.type === 'add_carry') app.el('#cmark').textContent = '¹';
          else if (q.type === 'sub_borrow') app.el('#cmark').textContent = '↘';
        }
      });
    }
  });
})();
