/* src/g6m2_u6_net_race.js — 원기둥 전개도 가려내기 경주 (6학년 2학기 수학 6단원 「원기둥, 원뿔, 구」 · l05·l11)
 * 장르: category_race(분류 릴레이) · 생성기: g6_2_net_race
 * 반 전체가 번호 순서로 나와 교과서 판(『수학』 129쪽 · 『수학익힘』 89쪽 · 형성 평가 · 141쪽 마무리 4 · 단원 평가)의 그림 하나씩을 칸에 넣는다(혼자 하기 = n 문항).
 * 칸 = 전개도가 되는지(5차시 앞) 또는 원기둥의 전개도 · 옆면이 직사각형이 아닌 · 두 원이 겹치는 · 두 원이 합동이 아닌 그림(지도서 361·363·379 까닭 세 갈래).
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g6m2_u6_net_race',
    title: '🥫 원기둥 전개도 가려내기 경주',
    subtitle: '그림이 원기둥의 전개도가 되는지 보고, 안 되면 까닭에 맞는 칸에 넣어요',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'yn', label: '5차시 — 전개도가 될까, 안 될까' },
        { v: 'l05', label: '5차시 — 안 되는 까닭까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="nt"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var G = GENS['g6_2_net_race'];
      var gen = G.create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: G.categoriesFor(app.settings.upto),
        renderItem: function (q) { return '<span class="ctx"><span class="tag">' + esc(q.tag) + '</span>' + q.svg + '</span>'; }
      });
    }
  });
})();
