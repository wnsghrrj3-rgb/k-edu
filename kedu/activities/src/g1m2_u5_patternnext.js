/* src/g1m2_u5_patternnext.js — 규칙 만들기 놀이 (1학년 2학기 수학 5단원 2·3·4·5·6차시)
 * 장르: duel_quiz(stream) · 생성기: pattern_next — 스트림 엔진에 「친구가 늘어놓은 규칙」 줄 무대를 올렸다.
 * 교과서판(2026-11-09): 『수학』 113쪽 「규칙 만들기 놀이」 — 짝이 자연물로 규칙을 만들면 친구가 「다음 순서로 놓았어」.
 *   112쪽 「친구의 규칙처럼」 · 116~117쪽 수 배열 · 118~119쪽 수 배열표까지 같은 판으로: 줄의 빈칸(다음 순서 또는 가운데)에
 *   놓을 것을 고르면 빈칸이 채워지고 반복되는 부분(또는 몇씩 커지는지)이 빛난다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="pt">' +
      '<div id="ptask"><span class="who">🧒 친구</span><span class="bub" id="ask"></span></div>' +
      '<div id="row"></div>' +
      '<div id="say"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g1m2_u5_patternnext',
    title: '🧩 규칙 만들기 놀이',
    subtitle: '친구가 늘어놓은 규칙 — 빈칸에는 무엇을 놓을까?',
    defaults: { kind: 'mix', book: 1, n: 10 },
    settings: [
      { key: 'kind', label: '규칙', options: [{ v: 'shape', label: '물건·색' }, { v: 'number', label: '수 배열' }, { v: 'mix', label: '섞어서' }] },
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 규칙으로 시작' }, { v: 0, label: '바로 새 규칙' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['pattern_next'], gen = G.create({ kind: app.settings.kind, book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#ask').textContent = q.blank === q.seq.length - 1 ? '내 규칙대로 다음 순서에 놓을 것은?' : '내 규칙에서 빈칸에 들어갈 것은?';
          app.el('#row').innerHTML = q.seq.map(function (t) { return G.tokenHtml(t); }).join('');
        },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: G.tokenHtml(o) }; }); },
        reveal: function (app, q) {
          var row = app.el('#row'), b = row.querySelector('.pn-blank');
          if (b) b.outerHTML = G.tokenHtml(q.answer).replace('class="pn ', 'class="pn pn-got ');
          var all = row.querySelectorAll('.pn'), L = q.unit ? q.unit.length : 0;
          for (var i = 0; i < L && i < all.length; i++) all[i].classList.add('unit');
          var s = app.el('#say');
          s.textContent = q.unit ? '🔁 되풀이되는 부분: ' + q.unit.map(G.nameOf).join(', ') : '➡️ ' + Math.abs(q.step) + '씩 ' + (q.step > 0 ? '커져요' : '작아져요');
          s.classList.add('show');
        }
      });
    }
  });
})();
