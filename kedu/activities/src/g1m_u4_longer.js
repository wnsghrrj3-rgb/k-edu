/* src/g1m_u4_longer.js — 어느 것이 더 클까? (1학년 수학 4단원, 비교하기)
 * 장르: duel_quiz(stream) · 생성기: compare_size
 * 무대 = 좌우 비교판. 길이(막대) · 넓이(색종이) · 들이(컵 물높이)를 한 화면에서 바꿔 낸다.
 * 비슷한 길이(close)를 일부러 섞는다 — "대어 보기"가 필요해지는 순간이 곧 학습이다.
 */
(function () {
  'use strict';

  ACore.create({
    activityId: 'g1m_u4_longer',
    title: '📏 어느 것이 더 클까?',
    subtitle: '길이·넓이·담을 수 있는 양을 비교해요',
    defaults: { aspect: 'mix', n: 10 },
    settings: [
      { key: 'aspect', label: '무엇을 비교할까', options: [
        { v: 'length', label: '길이' }, { v: 'area', label: '넓이' },
        { v: 'volume', label: '담는 양' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="cmp">' +
        '<div class="side" id="sideL"><div class="shape" id="shL"></div><div class="tag">왼쪽</div></div>' +
        '<div class="vs" id="ask">?</div>' +
        '<div class="side" id="sideR"><div class="shape" id="shR"></div><div class="tag">오른쪽</div></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['compare_size'].create({ aspect: app.settings.aspect }, app.rng);

      function paint(el, aspect, size) {
        el.className = 'shape ' + aspect;
        if (aspect === 'length') {
          el.style.width = size + '%'; el.style.height = '';
          el.innerHTML = '';
        } else if (aspect === 'area') {
          el.style.width = size + '%'; el.style.height = size + '%';
          el.innerHTML = '';
        } else {                                  // volume — 컵의 물 높이
          el.style.width = ''; el.style.height = '';
          el.innerHTML = '<div class="water" style="height:' + size + '%"></div>';
        }
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#ask').textContent = q.prompt;
          paint(app.el('#shL'), q.aspect, q.L.size);
          paint(app.el('#shR'), q.aspect, q.R.size);
        },
        reset: function (app) {
          app.el('#sideL').classList.remove('win');
          app.el('#sideR').classList.remove('win');
          app.el('#cmp').classList.remove('measure');
        },
        options: function () {
          return [{ pick: 'L', label: '⬅ 왼쪽' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '오른쪽 ➡' }];
        },
        reveal: function (app, q) {
          // 정답 공개 = 두 물건을 나란히 맞대어 준다 (직접 비교의 시범)
          app.el('#cmp').classList.add('measure');
          if (q.answer !== 'E') app.el(q.answer === 'L' ? '#sideL' : '#sideR').classList.add('win');
        }
      });
    }
  });
})();
