/* src/g2k2_u4_sent_type.js — 어떤 문장일까? (2학년 2학기 국어 4단원 「마음을 전해요」 · l03·l05·l13)
 * 장르: category_race(분류 릴레이) · 생성기: g2_2_sent_type
 * 반 전체가 번호 순서로 나와 교과서 문장 하나씩, 설명하는 문장 · 묻는 문장 · 감탄하는 문장 · 셋 가운데 없어요 칸에 넣는다(혼자 하기 = n 문항).
 * 『국어』 108~109쪽 「열 문장을 문장의 종류에 따라 나누기」를 반 릴레이로 — 넷째 칸은 정본 l03 s13 네 칸 분류 판 그대로.
 * 부호 가림 판 = 끝 부호 자리에 (   ) — 『국어』 126~127쪽 마무리 놀이판 꼴(지도서 169쪽 「부호로만 파악하는 데 그치지 않도록」).
 * 범위(upto): l03 = 3·4차시 문장 · all = 편지·마무리 놀이판까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 * 2학기 활동 — id 의 「k2」 = 국어·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g2k2_u4_sent_type',
    title: '💬 어떤 문장일까?',
    subtitle: '문장을 읽고 설명하는 문장·묻는 문장·감탄하는 문장 칸에 넣어요. 셋 다 아니면 넷째 칸!',
    defaults: { n: 8, runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml:
      '<div id="cr" class="sk"><div id="cr-top"><span id="cr-runner"></span><span id="cr-left"></span></div>' +
      '<div id="cr-track"><div id="cr-fill"></div></div>' +
      '<div id="cr-item"></div><div id="cats"></div></div>',
    onStart: function (app) {
      var gen = GENS['g2_2_sent_type'].create({ upto: app.settings.upto }, app.rng);
      CategoryRace.run(app, gen, {
        categories: GENS['g2_2_sent_type'].categories,
        renderItem: function (q) {
          return '<span class="ctx">' + (q.hide ? esc(q.s.slice(0, -1)) + '<span class="blank">(   )</span>' : esc(q.s)) + '</span>';
        }
      });
    }
  });
})();
