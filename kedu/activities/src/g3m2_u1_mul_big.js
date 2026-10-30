/* src/g3m2_u1_mul_big.js — 큰 수 곱셈 배달부 (3학년 2학기 수학 1단원 「곱셈」 l02~l10)
 * 장르: duel_quiz(stream) · 생성기: mul_big
 *
 * 1학기 「올림 배달부」(g3m_u4_mul)의 다음 판. 수가 커지면 아이가 잃는 것은 계산이 아니라 **자리**다 —
 * 정본 「이런 생각을 조심해요」 열 장이 모두 자리를 잃는 이야기(숫자만 곱해 더함 · 올린 수를 안 더함 ·
 * 먼저 더하고 곱함 · 0 을 하나만 · 밀어 적지 않음 · 두 덩이만 · 「배」를 「더」로). 그 값이 그대로 선택지다.
 * 무대 = 식 한 장 + 정답을 열 때 펴지는 **덩이 줄**(정본 「자리마다 곱한 값을 줄로」·「곱하는 수를 갈라요」 표기).
 * 범위(upto)는 2차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m2_u1_mul_big',
    title: '✖️ 큰 수 곱셈 배달부',
    subtitle: '올린 수·밀어 적기·10배 — 자리를 지켜 곱해요!',
    defaults: { upto: 'all', n: 10 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="mb">' +
        '<div id="mb-tag"></div>' +
        '<div id="mb-q"></div>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['mul_big'].create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        m3_plain: '세 자리 × 한 자리', m3_carry: '올림이 있어요', m3_chain: '올림이 이어져요',
        tens_tens: '곱하는 수가 몇십', one_x_2d: '곱하는 수를 갈라요', d2_small: '두 자리 × 두 자리',
        d2_big: '두 자리 × 두 자리', times_word: '몇 배일까요?', estimate: '먼저 어림해요'
      };

      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = q.type === 'times_word' ? 'word' : (q.est ? 'est' : '');
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { app.el('#mb').classList.remove('ok'); },
        // 어림 답(「2700~3600」 넷)은 폰 세로 한 줄에 안 들어간다 — 두 덩이로 그려 두고 좁은 화면에서만 위아래로 쌓는다(css)
        options: function (q) { return q.options.map(function (o) {
          var r = q.est ? o.split('~') : null;
          return { pick: o, label: r ? '<span class="r1">' + r[0] + '</span><span class="r2">~' + r[1] + '</span>' : o };
        }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          if (!q.est && q.type !== 'times_word') app.el('#mb-q').textContent = q.a + ' × ' + q.b + ' = ' + q.answer;
          var P = app.el('#mb-parts');
          P.innerHTML = '';
          (q.parts || []).forEach(function (line, i, arr) {
            var d = document.createElement('div');
            d.className = 'prow' + (i === arr.length - 1 && !q.est ? ' sum' : '');
            d.textContent = line;
            P.appendChild(d);
          });
          P.style.display = 'flex';
        }
      });
    }
  });
})();
