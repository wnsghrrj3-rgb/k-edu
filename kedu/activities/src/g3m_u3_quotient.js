/* src/g3m_u3_quotient.js — 몫을 찾아라 (3학년 수학 3단원 나눗셈, l04·l05·l06)
 * 장르: duel_quiz(stream) · 생성기: div_intro (나눔 마당과 공유 — D23)
 *
 * 무대 = 나눗셈 판. 세 얼굴을 가진다:
 *  expr    상황 카드 → 알맞은 나눗셈식 고르기 (l04 — 식은 언제나 「전체 ÷ 나누는 수」)
 *  family  곱셈식 카드 → 나눗셈식으로 바꾸기 (l05 — 곱셈식 1개가 나눗셈식 2개를 낳는다)
 *  gugu    나눗셈식 → 몫 (l06 — 정답을 열 때 곱셈구구 다리가 놓인다: per × □ = total)
 *
 * 공개 연출의 핵심은 gugu의 구구 다리다. 이 단원이 가르치려는 건 "나눗셈의 몫은
 * 곱셈구구에서 찾는다"이고, 다리 한 줄이 그걸 매 문항 말한다 (l06 도입 발문 그대로).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m_u3_quotient',
    title: '🔎 몫을 찾아라',
    subtitle: '나눗셈식을 세우고, 곱셈구구로 몫을 구해요',
    defaults: { qmode: 'mix', n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [
        { v: 'expr', label: '식 세우기' }, { v: 'family', label: '식 바꾸기' },
        { v: 'gugu', label: '몫 구하기' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="board">' +
        '<div id="scene" class="card"></div>' +
        '<div id="ask"></div>' +
        '<div id="bridge"><span class="bt">곱셈구구 다리</span><span class="bx num" id="bx"></span></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['div_intro'].create({ qmode: app.settings.qmode }, app.rng);

      Stream.run(app, gen, {
        render: function (app, q) {
          var sc = app.el('#scene');
          sc.classList.remove('expr', 'family', 'gugu');
          sc.classList.add(q.kind);
          sc.textContent = q.task;
          app.el('#ask').textContent = q.prompt;
          app.el('#bridge').classList.remove('show');
          app.el('#bx').textContent = '';
        },
        reset: function (app) {
          app.el('#board').classList.remove('ok');
        },
        options: function (q) {
          return q.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, q) {
          app.el('#board').classList.add('ok');
          // 구구 다리 — 몫이 어디서 왔는지를 한 줄이 말한다
          if (q.kind === 'gugu') {
            app.el('#bx').textContent = q.gugu;
            app.el('#bridge').classList.add('show');
          } else if (q.kind === 'family') {
            app.el('#bx').textContent = q.total + ' ÷ ' + q.a + ' = ' + q.b +
                                        '  ·  ' + q.total + ' ÷ ' + q.b + ' = ' + q.a;
            app.el('#bridge').classList.add('show');
          } else {
            app.el('#bx').textContent = q.total + ' ÷ ' + q.per + ' = ' + q.quot;
            app.el('#bridge').classList.add('show');
          }
        }
      });
    }
  });
})();
