/* src/g2m_u3_relay.js — 2학년 계산 릴레이 (2학년 수학 3단원)
 * 장르: relay(class + solo — D58 혼자 릴레이: 바통 10개 기본, 시간·반 기록 없음) · 생성기: addsub2 (기존 생성기 재사용)
 * 릴레이 엔진·무대는 1학년판과 동일. 문제만 두 자리 덧셈·뺄셈으로 바뀐다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g2m_u3_relay',
    title: '🏃 우리 반 계산 릴레이 (2학년)',
    subtitle: '받아올림도 함께 — 상대는 우리 반의 지난 기록!',
    defaults: { runners: 20, shuffle: 0, qmode: 'mix', carry: 1 },
    settings: [
      { key: 'runners', label: '바통 수', options: [{ v: 5, label: '5개' }, { v: 10, label: '10개' }, { v: 15, label: '15개' }, { v: 20, label: '20개' }] },   // 설정 칩은 solo 에만 보인다(§3-2) — 혼자 기준 이름표
      { key: 'qmode', label: '문제 종류', options: [{ v: 'add', label: '덧셈' }, { v: 'sub', label: '뺄셈' }, { v: 'mix', label: '섞기' }] }
    ],
    stageHtml:
      '<div id="relay">' +
        '<div id="relay-top">' +
          '<div id="baton">🏃</div>' +
          '<div id="runner-box"><div class="rl">다음 주자</div><div id="runner">?</div></div>' +
        '</div>' +
        '<div id="track"><div id="track-fill"></div></div>' +
        '<div id="relay-meta"><span id="relay-left"></span><span id="relay-best"></span></div>' +
        '<div id="q-card"><div id="q-text">?</div></div>' +
        '<div id="relay-result"></div>' +
      '</div>',
    onConfig: function (app, cfg) { Relay.soloDefault(app, cfg); },   // D58 혼자 기본 10 바통
    onStart: function (app) {
      var gen = GENS['addsub2'].create({ qmode: app.settings.qmode, carry: app.settings.carry }, app.rng);
      Relay.run(app, gen, {
        render: function (app, q) { app.el('#q-text').textContent = q.prompt; },
        reset: function (app) { app.el('#q-card').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app) { app.el('#q-card').classList.add('ok'); }
      });
    }
  });
})();
