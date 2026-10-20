/* src/g3k2_u3_src_hunt.js — 출처 찾기 (3학년 2학기 국어 3단원 「정확하게 글을 써요」 l02 · l03 · l05 · l14)
 * 장르: text_hunt(글 속 찾기 · 덩이 토큰) · 생성기: src_hunt
 * 학급 신문·안내 글을 읽고 자료를 가져온 곳과 자료 이름(출처)이 든 덩이를 모두 누른다.
 * 덫 = 정본 l02 s08 「글쓴이·신문 이름도 출처」 · l03 「어떤 형에게 들으니」 · l05 아래가 빈 그림. 판정 전엔 모든 덩이가 같은 모습(답 미노출).
 * 줄 바꿈은 sep 토큰(이 활동 css 에서만 줄 끝) · 덩이는 길어도 칸 안에서 꺾임(이 활동 css).
 * 범위(upto)는 단원 처음부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3k2_u3_src_hunt',
    title: '🔍 출처 찾기',
    subtitle: '글을 읽고 자료를 어디에서 가져왔는지 알려 주는 곳을 모두 눌러요!',
    defaults: { n: 6, upto: 'all' },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '4차시까지' },
        { v: 'l05', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }] }
    ],
    stageHtml: '<div id="hunt" class="src"><div id="hunt-prompt"></div><div id="hunt-text"></div></div>',
    onStart: function (app) {
      var gen = GENS['src_hunt'].create({ upto: app.settings.upto }, app.rng);
      TextHunt.run(app, gen, {});
    }
  });
})();
