/* src/g2m_u1_place.js — 자릿값 탐정 (2학년 수학 1단원, 세 자리 수)
 * 장르: duel_quiz(stream) · 생성기: place3
 * 무대 = 자릿값 판. 백·십·일 칸에 숫자가 놓이고, 묻는 자리에만 불이 켜진다.
 * 305를 35로 읽는 아이는 "빈 자리"를 안 세는 것 — zero_trap 유형이 그걸 잡는다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2m_u1_place',
    title: '🔍 자릿값 탐정',
    subtitle: '백의 자리? 십의 자리? 숫자가 앉은 자리를 찾아요',
    defaults: { qmode: 'mix', n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [
        { v: 'digit', label: '자리의 숫자' }, { v: 'value', label: '나타내는 값' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="pv">' +
        '<div class="col" data-s="h"><div class="lb">백의 자리</div><div class="dg num" id="dh">0</div></div>' +
        '<div class="col" data-s="t"><div class="lb">십의 자리</div><div class="dg num" id="dt">0</div></div>' +
        '<div class="col" data-s="o"><div class="lb">일의 자리</div><div class="dg num" id="do">0</div></div>' +
        '<div id="q2"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['place3'].create({ qmode: app.settings.qmode }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#dh').textContent = q.h;
          app.el('#dt').textContent = q.t;
          app.el('#do').textContent = q.o;
          app.el('#q2').textContent = q.prompt;
          app.els('#pv .col').forEach(function (c) {
            c.classList.toggle('ask', c.dataset.s === q.slot);
          });
        },
        reset: function (app) { app.els('#pv .col').forEach(function (c) { c.classList.remove('ok'); }); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          var col = app.el('#pv .col[data-s="' + q.slot + '"]');
          if (col) col.classList.add('ok');
        }
      });
    }
  });
})();
