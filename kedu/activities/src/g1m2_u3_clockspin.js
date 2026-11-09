/* src/g1m2_u3_clockspin.js — 「시계를 돌려라」 놀이 (1학년 2학기 수학 3단원 5·6·7차시)
 * 장르: duel_quiz(stream) · 생성기: clock_half — 2학년 2학기 「시각 읽기 놀이」와 같은 스트림 엔진, 보기 버튼에 모형 시계를 올렸다.
 * 교과서판(2026-11-09): 『수학』 77쪽 「‘시계를 돌려라’ 놀이」 — 뒤집힌 카드를 하나 골라 적힌 시각(1:30 · 10:30 …)을
 *   모형 시계에 나타내면 카드를 가져간다. 무대에 카드가 뒤집히고, 그 시각을 알맞게 나타낸 모형 시계 셋 가운데 하나를 고른다
 *   (지도서 223쪽 「‘몇 시’ 카드를 추가하여」 몇 시 카드도 섞음). 76쪽처럼 시계를 보고 몇 시 30분을 읽는 판도 끼운다.
 *   맞히면 가져간 카드 수가 하나 늘고 시계 밑에 짧은바늘·긴바늘 자리가 뜬다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58).
 */
(function () {
  'use strict';
  var STAGE =
    '<div id="cs">' +
      '<div id="csask"><span class="who">🕰️</span><span class="bub" id="ask"></span></div>' +
      '<div id="cview"></div>' +
      '<div id="say"></div>' +
      '<div id="got">가져간 카드 <b id="gotn">0</b>장</div>' +
    '</div>';

  ACore.create({
    activityId: 'g1m2_u3_clockspin',
    title: '⏰ 시계를 돌려라',
    subtitle: '카드의 시각을 모형 시계에 — 짧은바늘은 시, 긴바늘은 12 또는 6',
    defaults: { kind: 'mix', book: 1, n: 10 },
    settings: [
      { key: 'kind', label: '카드', options: [{ v: 'hour', label: '몇 시' }, { v: 'half', label: '몇 시 30분' }, { v: 'mix', label: '섞어서' }] },
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 시각으로 시작' }, { v: 0, label: '바로 새 카드' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var G = GENS['clock_half'], gen = G.create({ kind: app.settings.kind, book: app.settings.book }, app.rng), got = 0;
      Stream.run(app, gen, {
        render: function (app, q) {
          if (q.mode === 'set') {
            app.el('#ask').textContent = '카드에 적힌 시각을 알맞게 나타낸 모형 시계는?';
            app.el('#cview').innerHTML = '<span class="tcard" id="tcard">' + q.card + '</span>';
          } else {
            var c = G.right(q.h, q.m);
            app.el('#ask').textContent = '친구가 모형 시계에 나타낸 시각은 몇 시 몇 분일까요?';
            app.el('#cview').innerHTML = '<span class="bigck">' + G.clockSvg(c.hd, c.md) + '</span>';
          }
        },
        reset: function (app) { var s = app.el('#say'); s.textContent = ''; s.classList.remove('show'); },
        options: function (q) {
          if (q.mode === 'read') return q.options.map(function (o) { return { pick: o, label: o }; });
          return q.clocks.map(function (c) { return { pick: G.idOf(c), label: '<span class="optck">' + G.clockSvg(c.hd, c.md) + '</span>' }; });
        },
        reveal: function (app, q, ok) {
          var s = app.el('#say'), when = q.m ? q.h + '시 30분' : q.h + '시';
          s.textContent = q.mode === 'set' ? '🃏 ' + q.card + ' = ' + when + (q.m ? ' — 짧은바늘은 두 숫자의 가운데, 긴바늘은 6' : ' — 긴바늘은 12') : '🕰️ ' + when;
          s.classList.add('show');
          if (q.mode === 'set') {
            var c = G.right(q.h, q.m);
            app.el('#cview').innerHTML = '<span class="tcard got">' + q.card + '</span><span class="midck">' + G.clockSvg(c.hd, c.md) + '</span>';
          }
          if (ok) { got++; app.el('#gotn').textContent = got; }
        }
      });
    }
  });
})();
