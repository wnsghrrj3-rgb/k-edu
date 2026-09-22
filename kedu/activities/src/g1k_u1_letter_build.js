/* src/g1k_u1_letter_build.js — 글자 짜임 만들기 (1학년 국어 1단원 · l04·l05·l12)
 * 장르: map_pin(자리에 놓기) · 생성기: letter_build
 * 판 = 짜임 틀(첫소리 자리 · 가운뎃소리 자리). 자모 타일을 골라 제자리에 놓으면 글자가 된다.
 */
(function () {
  'use strict';
  function board(q) {
    var lay = q.layout === 'wrap' ? 'under' : q.layout;   // ㅘ·ㅟ 같은 모음은 아래+옆 — 1학년 판에서는 아래 자리로 그린다
    return '<div class="frame ' + lay + '">' +
      '<div class="pslot" data-slot="cho"><span class="plabel">첫소리</span></div>' +
      '<div class="pslot" data-slot="jung"><span class="plabel">가운뎃소리</span></div>' +
      '</div><div id="pin-made"></div>';
  }
  ACore.create({
    activityId: 'g1k_u1_letter_build',
    title: '🧩 글자 짜임 만들기',
    subtitle: '자음자와 모음자를 제자리에 놓아 글자를 만들어요',
    defaults: { n: 5, vowels: 'basic' },
    settings: [
      { key: 'vowels', label: '모음자', options: [{ v: 'basic', label: '기본' }, { v: 'more', label: '여러 가지' }, { v: 'mix', label: '섞어서' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="pin"><div id="pin-prompt"></div><div id="pin-board"></div><div id="pin-tiles"></div></div>',
    onStart: function (app) {
      var gen = GENS['letter_build'].create({ vowels: app.settings.vowels }, app.rng);
      MapPin.run(app, gen, {
        board: board,
        reveal: function (a, q) { a.el('#pin-made').textContent = q.target; a.el('#pin-made').classList.add('show'); }
      });
    }
  });
})();
