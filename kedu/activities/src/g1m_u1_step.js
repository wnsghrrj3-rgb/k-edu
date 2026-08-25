/* src/g1m_u1_step.js — 한 칸 옆은 1만큼 (1학년 수학 1단원 후반, l07·l08·l09)
 * 장르: duel_quiz(stream) · 생성기: number_step
 * 무대 = 나란한 수 칸. 칸 위에 물건이 그 수만큼 쌓이고 아래에 수가 적힌다.
 * 「옆 칸은 1만큼 차이」(l08)가 교과서의 문장이고, 이 무대는 그 문장을 그림으로 만든다 —
 * 물건 더미의 높이 차이가 곧 1이라는 것이 눈에 보여야 한다.
 * gone 유형은 수를 감춘다 (l09 「풀을 하나씩 가져가요」 — 세어 보고 0을 만나는 자리).
 */
(function () {
  'use strict';

  var app = ACore.create({
    activityId: 'g1m_u1_step',
    title: '🐸 한 칸 옆은 얼마?',
    subtitle: '한 걸음 가면 1만큼 커지고, 한 걸음 오면 1만큼 작아져요',
    defaults: { max: 9, kind: 'mix', n: 10 },
    settings: [
      { key: 'max', label: '수 범위', options: [{ v: 5, label: '5까지' }, { v: 9, label: '9까지' }] },
      { key: 'kind', label: '무엇을 볼까', options: [
        { v: 'step', label: '1만큼 큰·작은 수' }, { v: 'zero', label: '0' }, { v: 'mix', label: '섞기' } ] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: '<div id="lane"><div id="cells"></div></div>',
    onStart: function (app) {
      var gen = GENS['number_step'].create({ max: app.settings.max, kind: app.settings.kind }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          var box = app.el('#cells');
          var html = '';
          for (var i = 0; i < q.cells.length; i++) {
            var c = q.cells[i];
            var ask = (i === q.askIdx);
            var piles = '';
            if (!ask && c) {
              for (var k = 0; k < c.items; k++) piles += '<span class="dot"></span>';
              if (c.items === 0) piles = '<span class="empty">텅</span>';
            }
            html += '<div class="cell' + (ask ? ' ask' : '') + '">' +
                      '<div class="pile">' + (ask ? '<span class="qm">?</span>' : piles) + '</div>' +
                      '<div class="num">' + (ask ? '?' : (q.showNum && c ? c.n : '')) + '</div>' +
                    '</div>';
            if (i < q.cells.length - 1) html += '<div class="arrow">→</div>';
          }
          box.innerHTML = html;
        },
        options: function (q) {
          return q.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, q, ok) {
          // 정답 공개 = 물음표 칸이 실제 더미로 채워진다 (수와 양이 같은 것임을 눈으로 잇는다)
          var cell = app.el('#cells .cell.ask');
          if (!cell) return;
          var n = +q.answer, piles = '';
          for (var k = 0; k < n; k++) piles += '<span class="dot show"></span>';
          if (n === 0) piles = '<span class="empty">텅</span>';
          cell.querySelector('.pile').innerHTML = piles;
          cell.querySelector('.num').textContent = q.answer;
          cell.classList.add(ok ? 'good' : 'miss');
        },
        reset: function (app) {
          var box = app.el('#cells');
          if (box) box.innerHTML = '';
        }
      });
    }
  });
})();
