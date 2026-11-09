/* src/g2k2_u7_idea_hunt.js — 글쓴이의 생각 찾기 (2학년 2학기 국어 7단원 「내 생각은 이래요」) · 교과서판 2학기
 * 장르: text_hunt(글 속 찾기 · 문장 토큰) · 생성기: g2_2_idea_hunt
 * 맨 위에 글 이름(누를 수 없는 줄), 그 아래 글이 문장 줄로 놓인다 — 물음에 맞는 문장(중심 생각 · 생각 글의 한 부분 · 생각을 나타낸 문장)을 누른다.
 * 「생각을 나타낸 문장 모두」 판(교과서 225쪽 ○표 판)만 문장이 칸처럼 나란히 놓인다 — 생성기가 준 type 으로 무대 class 만 바꾼다(엔진 무개변).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 2학기 활동 — id 의 「k2」, map.semester 2.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2k2_u7_idea_hunt',
    title: '🔎 글쓴이의 생각 찾기',
    subtitle: '글 이름을 보고 짐작한 뒤, 중심 생각 · 까닭 · 생각을 나타낸 문장을 찾아 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'l07', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="idea"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['g2_2_idea_hunt'].create({ upto: app.settings.upto }, app.rng);
      var next0 = gen.next;
      gen.next = function () {                 // 판 모양만 바꾼다 — 칸 판(idea_say)이면 문장이 나란히
        var q = next0.call(gen);
        app.el('#hunt').className = 'idea' + (q.type === 'idea_say' ? ' say' : '');
        return q;
      };
      TextHunt.run(app, gen, {});
    }
  });
})();
