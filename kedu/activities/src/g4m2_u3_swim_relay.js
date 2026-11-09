/* src/g4m2_u3_swim_relay.js — 혼계영 계산 릴레이 (4학년 2학기 수학 3단원 「소수의 덧셈과 뺄셈」 · l06·l07·l08·l09·l10·l11)
 * 장르: relay(반 전체 바통 · 혼자 바통 10개 — D58) · 생성기: g4_2_swim_relay
 * 『수학』 78~79쪽 「내가 수영 감독이라면!」 — 혼계영처럼 배영 → 평영 → 접영 → 자유형 구간을 반이 한 팀으로 이어 헤엄친다.
 * 바통마다 교과서·익힘의 소수 덧셈·뺄셈 하나(교과서 자리 글과 함께). 보기 = 정답 + 학습지와 같은 오류 모형의 결과.
 * 범위는 차시마다 누적 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 무대 = g2m_u3_relay 그대로 + #relay.swim 덩이.
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ACore.create({
    activityId: 'g4m2_u3_swim_relay',
    title: '🏊 혼계영 계산 릴레이',
    subtitle: '배영 → 평영 → 접영 → 자유형 — 소수점을 맞추어 바통을 이어요!',
    defaults: { runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'runners', label: '바통 수', options: [{ v: 5, label: '5개' }, { v: 10, label: '10개' }, { v: 15, label: '15개' }, { v: 20, label: '20개' }] },
      { key: 'upto', label: '범위', options: [
        { v: 'l06', label: '6차시 — 소수 한 자리 수의 덧셈' },
        { v: 'l07', label: '7차시 — 소수 두 자리 수의 덧셈' },
        { v: 'l08', label: '8차시 — 소수 한 자리 수의 뺄셈' },
        { v: 'l09', label: '9차시 — 소수 두 자리 수의 뺄셈' },
        { v: 'l10', label: '10차시 — 수영 기록의 합과 차' },
        { v: 'all', label: '단원 전체' }] }
    ],
    stageHtml:
      '<div id="relay" class="swim">' +
        '<div id="relay-top">' +
          '<div id="baton">🏊</div>' +
          '<div id="runner-box"><div class="rl">다음 주자</div><div id="runner">?</div></div>' +
        '</div>' +
        '<div id="track"><div id="track-fill"></div></div>' +
        '<div id="relay-meta"><span id="relay-left"></span><span id="relay-best"></span></div>' +
        '<div id="q-card"><div id="q-leg"></div><div id="q-text">?</div><div id="q-tag"></div></div>' +
        '<div id="relay-result"></div>' +
      '</div>',
    onConfig: function (app, cfg) { Relay.soloDefault(app, cfg); },   // D58 혼자 기본 10 바통
    onStart: function (app) {
      var gen = GENS['g4_2_swim_relay'].create({ upto: app.settings.upto }, app.rng);
      Relay.run(app, gen, {
        render: function (app, q) {
          app.el('#q-leg').textContent = q.leg + ' 구간';
          app.el('#q-text').textContent = q.prompt;
          app.el('#q-tag').innerHTML = esc(q.src);
        },
        reset: function (app) { app.el('#q-card').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) { app.el('#q-card').classList.add('ok'); app.el('#q-text').textContent = q.a + ' ' + q.op + ' ' + q.b + ' = ' + q.answer; }
      });
    }
  });
})();
