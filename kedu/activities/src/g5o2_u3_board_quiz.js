/* src/g5o2_u3_board_quiz.js — 말판 놀이 (5학년 2학기 사회 3단원 「식민 통치와 저항, 전쟁이 바꾼 사회와 생활」 5차시 · 8·9차시 · 10·11차시 · 단원 마무리)
 * 장르: duel_quiz(stream) · 생성기: g5_2_board_quiz — 「그림으로 기억하기」와 같은 스트림 엔진에 말판 칸 무대를 올렸다.
 * 교과서판(2026-11-09): 『사회』 156~159쪽 단원 마무리 「말판 놀이」 — 도착한 칸의 문제를 맞히면 그대로, 못 맞히면 한 칸 뒤로.
 *   말판 두 길(가 · 나)의 칸 문제를 보기 셋으로. 칸 번호는 무대에, 주제 띠는 판정 뒤에만(답 미노출).
 * 범위(upto): l05 = 5차시까지 · l09 = 9차시까지 · all = 단원 전체 — 케이티처가 차시마다 넣어 준다(map.paramsByLesson).
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58). 2학기 활동 — id 의 「o2」 = 사회·2학기, map.semester 2.
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="bq">' +
      '<div id="bq-cell"><b id="bq-num"></b><p id="bq-q"></p></div>' +
      '<div id="bq-tag"></div>' +
    '</div>';

  ACore.create({
    activityId: 'g5o2_u3_board_quiz',
    title: '🎲 말판 놀이',
    subtitle: '도착한 칸의 문제 — 맞히면 그대로, 못 맞히면 한 칸 뒤로!',
    defaults: { upto: 'all', n: 8 },
    settings: [
      { key: 'upto', label: '범위', options: [{ v: 'l05', label: '5차시까지' }, { v: 'l09', label: '9차시까지' }, { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 8, label: '8' }, { v: 12, label: '12' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['g5_2_board_quiz'], gen = G.create({ upto: app.settings.upto }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#bq-num').textContent = '말판 ' + q.path + ' 길 · ' + q.cell + '번 칸';
          app.el('#bq-q').textContent = q.q;
        },
        reset: function (app) {
          app.el('#bq-cell').classList.remove('open');
          var t = app.el('#bq-tag'); t.textContent = ''; t.classList.remove('show');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#bq-cell').classList.add('open');
          var t = app.el('#bq-tag'); t.textContent = '🏁 ' + G.KIND_NAME[q.kind] + ' — 맞히면 그대로!'; t.classList.add('show');
        }
      });
    }
  });
})();
