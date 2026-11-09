/* src/g6m2_u1_div_relay.js — 동굴 문 나눗셈 릴레이 (6학년 2학기 수학 1단원 「분수의 나눗셈」 · l02~l09·l11)
 * 장르: relay(반 전체 바통 · 혼자 바통 10개 — D58) · 생성기: g6_2_div_relay
 * 『수학』 24~25쪽 「알쏭달쏭 가로세로 나눗셈」 — 「분수의 나눗셈을 하여 동굴 문을 열어 보세요.」 가로·세로 열쇠 칸을 반이 한 팀으로 차례로 푼다.
 * 바통마다 교과서·익힘·형성 평가의 분수의 나눗셈 하나(교과서 자리 글과 함께). 보기 = 정답 + 학습지와 같은 오류 모형의 결과.
 * 지도서 157쪽 「활동의 변형」 — 답을 이어 받아 다음 사람이 문제를 푸는 릴레이를 반 전체 바통으로.
 * 범위는 차시마다 누적 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 무대 = g2m_u3_relay 그대로 + #relay.cave 덩이(세로 분수).
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g6m2_u1_div_relay',
    title: '🗝️ 동굴 문 나눗셈 릴레이',
    subtitle: '가로 열쇠 → 세로 열쇠 — 분수의 나눗셈 바통을 이어 동굴 문을 열어요!',
    defaults: { runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'runners', label: '바통 수', options: [{ v: 5, label: '5개' }, { v: 10, label: '10개' }, { v: 15, label: '15개' }, { v: 20, label: '20개' }] },
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시 · 분모 같음 ⑴' },
        { v: 'l03', label: '3차시 · 분모 같음 ⑵' },
        { v: 'l04', label: '4차시 · 분모 다름' },
        { v: 'l05', label: '5차시 · ÷ 단위분수' },
        { v: 'l06', label: '6차시 · ÷ 진분수' },
        { v: 'l07', label: '7차시 · 곱셈으로' },
        { v: 'l08', label: '8차시 · 대분수' },
        { v: 'l09', label: '9차시 · 가로세로' },
        { v: 'all', label: '단원 전체' }] }
    ],
    stageHtml:
      '<div id="relay" class="cave">' +
        '<div id="relay-top">' +
          '<div id="baton">🗝️</div>' +
          '<div id="runner-box"><div class="rl">다음 주자</div><div id="runner">?</div></div>' +
        '</div>' +
        '<div id="track"><div id="track-fill"></div></div>' +
        '<div id="relay-meta"><span id="relay-left"></span><span id="relay-best"></span></div>' +
        '<div id="q-card"><div id="q-leg"></div><div id="q-text">?</div><div id="q-tag"></div></div>' +
        '<div id="relay-result"></div>' +
      '</div>',
    onConfig: function (app, cfg) { Relay.soloDefault(app, cfg); },   // D58 혼자 기본 10 바통
    onStart: function (app) {
      var G = GENS['g6_2_div_relay'];
      var gen = G.create({ upto: app.settings.upto }, app.rng);
      Relay.run(app, gen, {
        render: function (app, q) {
          app.el('#q-leg').textContent = q.leg;
          app.el('#q-text').innerHTML = q.html;
          app.el('#q-text').setAttribute('aria-label', G.frRead(q.a) + ' 나누기 ' + G.frRead(q.b) + '은 얼마일까요');
          app.el('#q-tag').innerHTML = esc(q.src);
        },
        reset: function (app) { app.el('#q-card').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: G.frHtml(o) }; }); },
        reveal: function (app, q) {
          app.el('#q-card').classList.add('ok');
          app.el('#q-text').innerHTML = G.frHtml(q.a) + ' <span class="op">÷</span> ' + G.frHtml(q.b) + ' <span class="op">=</span> ' + G.frHtml(q.answer);
        }
      });
    }
  });
})();
