/* src/g3m2_u2_div_big.js — 나눗셈 배달부 (3학년 2학기 수학 2단원 「나눗셈」 l02~l11)
 * 장르: duel_quiz(stream) · 생성기: div_big
 *
 * 1학기 「묶음을 찾아라」(g3m_u3_quotient)의 다음 판. 수가 커지면 아이가 잃는 것은 **남은 수와 자리**다 —
 * 정본 「이런 생각을 조심해요」가 모두 그 이야기(몫의 0 을 빠뜨림 · 남은 10 카드를 뺌 · 몫을 일의 자리부터 앞에 ·
 * 남은 1 을 버림 · 나머지가 나누는 수보다 큼 · 나머지와 몫을 곱함 · 0 을 하나만). 그 값이 그대로 선택지다.
 * 무대 = 식 한 장 + 정답을 열 때 펴지는 **덩이 줄**(정본 세로셈 말 「높은 자리부터 · 남은 수를 내려」).
 * 범위(upto)는 2차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m2_u2_div_big',
    title: '➗ 나눗셈 배달부',
    subtitle: '남은 수는 내려서 · 몫의 0 은 그 자리에 — 똑같이 나눠요!',
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
        { v: 'l09', label: '9차시까지' },
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
      var gen = GENS['div_big'].create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        tens_plain: '(몇십) ÷ (몇)', tens_trade: '남은 10 카드를 바꿔요', td_plain: '높은 자리부터',
        estimate: '먼저 어림해요', td_carry: '남은 수를 내려요', rem: '나머지가 있어요',
        rem_carry: '내리고 남아요', check: '확인해요', h3_plain: '세 자리 ÷ 한 자리',
        h3_zero: '몫에 0 이 서요', h3_carry: '백의 자리를 나눌 수 없어요', key_word: '열쇠고리 공방'
      };

      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = q.wordy ? 'word' : (q.est ? 'est' : '');
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { app.el('#mb').classList.remove('ok'); },
        // 어림 답(「10~15」)·나머지 답(「13 … 2」)은 폰 세로에서 두 덩이로 쌓는다(css)
        options: function (q) { return q.options.map(function (o) {
          var r = q.est ? o.split('~') : (o.indexOf(' … ') > 0 ? o.split(' … ') : null);
          if (!r) return { pick: o, label: o };
          return { pick: o, label: '<span class="r1">' + r[0] + '</span><span class="r2">' + (q.est ? '~' : '… ') + r[1] + '</span>' };
        }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          if (!q.est && !q.wordy) app.el('#mb-q').textContent = q.reveal;
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
