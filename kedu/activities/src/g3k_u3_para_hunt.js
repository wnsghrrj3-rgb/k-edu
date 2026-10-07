/* src/g3k_u3_para_hunt.js — 문단 속 문장 찾기 (3학년 1학기 국어 3단원 「짜임새 있는 글, 재미와 감동이 있는 글」)
 * 장르: text_hunt(글 속 찾기 · 문장 토큰) · 생성기: para_hunt
 * 문단 하나가 문장 줄로 놓이고, 물음에 맞는 문장 하나를 누른다(중심 문장 · 어울리지 않는 문장 · 느낀 부분).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k_u3_para_hunt',
    title: '🔎 문단 속 문장 찾기',
    subtitle: '문단을 읽고 중심 문장, 어울리지 않는 문장을 찾아 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l04', label: '5차시까지' },
        { v: 'l08', label: '10차시까지' },
        { v: 'l11', label: '12차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="para"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['para_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
