/* src/g1m_u3_explore.js — 가르기 탐험 (1학년 수학 3단원, 도입 차시)
 * 장르: explore — 무대형(자체 루프). 점수도 시간도 오답도 없다.
 *
 * 이 활동에는 틀림이 없다. 아이가 도토리를 옮길 때마다 조합이 하나 태어나고,
 * 새 조합이면 수집첩에 카드가 꽂힌다. 다 찾으면 카드가 계단으로 정렬되면서
 * "한쪽이 하나 늘면 다른 쪽이 하나 준다"는 보수 관계가 눈앞에서 드러난다.
 * 발문 "다 찾은 걸까?"는 처음부터 끝까지 화면에 남아 있는다 — 답을 주지 않기 위해서.
 *
 * D7 게이트: 이 파일럿이 준호 학급에서 2회 이상 실사용을 통과하기 전까지
 *            두 번째 explore를 만들지 않는다. 실증 없는 장르의 선양산 금지.
 */
(function () {
  'use strict';

  ACore.create({
    activityId: 'g1m_u3_explore',
    title: '🔍 가르기 탐험대',
    subtitle: '오늘의 수를 두 집에 나눠 봐요 — 몇 가지 방법이 있을까?',
    defaults: { num: 7 },
    settings: [
      { key: 'num', label: '오늘의 수', options: [{ v: 5, label: '5' }, { v: 6, label: '6' }, { v: 7, label: '7' }, { v: 8, label: '8' }] }
    ],
    stageHtml:
      '<div id="ex">' +
        '<div id="ask">다 찾은 걸까?</div>' +
        '<div id="houses">' +
          '<div class="house" id="hL"><div class="roof">🏠</div><div class="yard" id="yL"></div><div class="cnt num" id="nL">0</div></div>' +
          '<div class="house" id="hR"><div class="roof">🏡</div><div class="yard" id="yR"></div><div class="cnt num" id="nR">0</div></div>' +
        '</div>' +
        '<div id="book"><div class="bl">수집첩</div><div id="cards"></div></div>' +
      '</div>',
    onConfig: function (app) {
      app.el('#teams').style.display = 'none';      // 탐험에는 편이 없다
      app.el('#score-pill').style.display = 'none'; // 점수도 없다
    },
    onStart: function (app) {
      var N = app.settings.num;
      var ALL = N - 1;                              // (1,N-1) … (N-1,1)
      var left = N, right = 0;
      var found = {};                                // "a-b" → true
      var closed = false;

      function draw() {
        var mk = function (n, side) {
          var s = '';
          for (var i = 0; i < n; i++) s += '<button class="ac" data-side="' + side + '">🌰</button>';
          return s;
        };
        app.el('#yL').innerHTML = mk(left, 'L');
        app.el('#yR').innerHTML = mk(right, 'R');
        app.el('#nL').textContent = left;
        app.el('#nR').textContent = right;
        app.els('#ex .ac').forEach(function (b) {
          b.addEventListener('click', function () { move(b.dataset.side); });
        });
      }

      function move(side) {
        if (closed) return;
        if (side === 'L' && left > 0) { left--; right++; }
        else if (side === 'R' && right > 0) { right--; left++; }
        else return;
        app.sfx.tick();
        draw();
        record();
      }

      function record() {
        if (left === 0 || right === 0) return;       // 한쪽이 비면 가르기가 아니다
        var key = left + '-' + right;
        if (found[key]) return;
        found[key] = true;
        app.markJudged();                            // 발견 = 한 걸음 (오답이 아니라 걸음이다)
        app.sfx.good();
        var n = Object.keys(found).length;
        app.setProg(n, ALL);
        var card = document.createElement('div');
        card.className = 'card pop';
        card.setAttribute('data-a', left);
        card.innerHTML = '<span class="num">' + left + '</span><span class="dot">·</span><span class="num">' + right + '</span>';
        app.el('#cards').appendChild(card);
        if (n >= ALL) setTimeout(complete, 700);
      }

      function complete() {
        closed = true;
        app.sfx.win();
        // 계단 정렬 — 한쪽이 하나 늘면 다른 쪽이 하나 준다 (보수 관계가 눈에 보이는 순간)
        var cards = app.els('#cards .card').sort(function (x, y) {
          return +x.getAttribute('data-a') - +y.getAttribute('data-a');
        });
        var host = app.el('#cards');
        host.classList.add('stair');
        cards.forEach(function (c, i) {
          host.appendChild(c);
          c.style.setProperty('--i', i);
        });
        app.el('#ask').textContent = '다 찾았어요! ' + N + '은(는) ' + ALL + '가지로 가를 수 있어요';
        app.el('#ask').classList.add('done');
        setTimeout(function () { app.finish({ score: ALL, total: ALL }); }, 2600);
      }

      app.hideAnswers();
      app.setProg(0, ALL);
      draw();
    }
  });
})();
