/* src/g1m_u3_relay.js — 우리 반 계산 릴레이 (1학년 수학 3단원)
 * 장르: relay(class 전용) · 생성기: split_gather (기존 생성기 재사용 — 릴레이는 문제를 새로 만들지 않는다)
 * 상대는 옆 팀이 아니라 우리 반의 지난 기록. 아무도 지지 않는 유일한 대결.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g1m_u3_relay',
    title: '🏃 우리 반 계산 릴레이',
    subtitle: '한 명씩 바통을 이어요 — 상대는 우리 반의 지난 기록!',
    defaults: { runners: 20, shuffle: 0, qmode: 'mix', max: 9 },
    settings: [
      { key: 'runners', label: '주자 수', options: [{ v: 15, label: '15명' }, { v: 20, label: '20명' }, { v: 25, label: '25명' }, { v: 30, label: '30명' }] },
      { key: 'shuffle', label: '주자 순서', options: [{ v: 0, label: '번호순' }, { v: 1, label: '무작위' }] },
      { key: 'qmode', label: '문제 종류', options: [{ v: 'gather', label: '모으기' }, { v: 'split', label: '가르기' }, { v: 'mix', label: '섞기' }] }
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
    onStart: function (app) {
      var gen = GENS['split_gather'].create({ max: app.settings.max, qmode: app.settings.qmode }, app.rng);
      Relay.run(app, gen, {
        render: function (app, q) { app.el('#q-text').textContent = q.prompt; },
        reset: function (app) { app.el('#q-card').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app) { app.el('#q-card').classList.add('ok'); }
      });
    }
  });
})();
