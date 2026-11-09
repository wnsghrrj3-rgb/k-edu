/* src/g5m2_u1_spell_relay.js — 뾰로롱 방 탈출 주문 릴레이 (5학년 2학기 수학 1단원 「수의 범위와 어림하기」 · l02~l04·l10)
 * 장르: relay(반 전체 바통 · 혼자 바통 10개 — D58) · 생성기: g5_2_spell_relay
 * 『수학』 24~25쪽 함께하는 수학 「뾰로롱 방 탈출」 — 문제를 찾아서 풀고 답이 쓰인 구슬에 약병 속 글자를 써넣어 주문을 완성하면 숨겨진 문을 찾아 탈출한다.
 * 바통마다 교과서·익힘·형성·단원 평가의 수의 범위 문제 하나(교과서 자리 글과 함께). 약병 문제를 맞히면 그 답의 구슬(1~12)에 글자가 들어간다.
 * 열두 구슬이 다 차면 주문 「알쏭달쏭떼구루루두둥실뿅」 완성. 보기 = 정답 + 학습지와 같은 오류 모형(경곗값 넣고 빼기)의 결과.
 * 지도서 157쪽 「활동의 변형」 — 답이 한 개가 되는 문제를 만들어 짝과 바꾸어 풀기를 반 전체 바통으로.
 * 범위는 차시마다 누적 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 무대 = g2m_u3_relay 그대로 + #relay.spell 덩이(주문 구슬 줄).
 * 2학기 활동 — id 의 「m2」 = 수학·2학기, 카탈로그 map.semester 2 (D66).
 */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var got = {};
  function paintBeads(app, G) {
    var box = app.el('#beads'); if (!box) return;
    var html = '';
    for (var k = 1; k <= 12; k++) html += '<span class="bead' + (got[k] ? ' on' : '') + '" data-n="' + k + '"><i>' + k + '</i><b>' + (got[k] ? esc(got[k]) : '') + '</b></span>';
    box.innerHTML = html;
    var n = Object.keys(got).length;
    app.el('#spell-msg').textContent = n === 12 ? '🚪 주문 완성! 「' + G.SPELL + '」 — 벽시계 뒤 숨겨진 문이 열려요!' : '약병 문제를 맞히면 구슬에 글자가 들어가요 (' + n + ' / 12)';
  }
  ACore.create({
    activityId: 'g5m2_u1_spell_relay',
    title: '🔮 뾰로롱 방 탈출 주문 릴레이',
    subtitle: '수의 범위 문제를 이어 풀어 구슬에 글자를 채우고 주문을 완성해요!',
    defaults: { runners: 20, shuffle: 0, upto: 'all' },
    settings: [
      { key: 'runners', label: '바통 수', options: [{ v: 5, label: '5개' }, { v: 10, label: '10개' }, { v: 15, label: '15개' }, { v: 20, label: '20개' }] },
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시 · 이상과 이하' },
        { v: 'l03', label: '3차시 · 초과와 미만' },
        { v: 'l04', label: '4차시 · 수의 범위 활용' },
        { v: 'all', label: '단원 전체' }] }
    ],
    stageHtml:
      '<div id="relay" class="spell">' +
        '<div id="relay-top">' +
          '<div id="baton">🔮</div>' +
          '<div id="runner-box"><div class="rl">다음 주자</div><div id="runner">?</div></div>' +
        '</div>' +
        '<div id="track"><div id="track-fill"></div></div>' +
        '<div id="relay-meta"><span id="relay-left"></span><span id="relay-best"></span></div>' +
        '<div id="q-card"><div id="q-leg"></div><div id="q-text">?</div><div id="q-tag"></div></div>' +
        '<div id="spell-box"><div id="beads"></div><div id="spell-msg"></div></div>' +
        '<div id="relay-result"></div>' +
      '</div>',
    onConfig: function (app, cfg) { Relay.soloDefault(app, cfg); },   // D58 혼자 기본 10 바통
    onStart: function (app) {
      var G = GENS['g5_2_spell_relay'];
      var gen = G.create({ upto: app.settings.upto }, app.rng);
      got = {}; paintBeads(app, G);
      Relay.run(app, gen, {
        render: function (app, q) {
          app.el('#q-leg').textContent = q.leg;
          app.el('#q-leg').classList.toggle('vial', !!q.spell);
          app.el('#q-text').innerHTML = q.html;
          app.el('#q-text').setAttribute('aria-label', G.read(q.prompt));
          app.el('#q-tag').innerHTML = esc(q.src);
        },
        reset: function (app) { app.el('#q-card').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: esc(o) }; }); },
        reveal: function (app, q) {
          app.el('#q-card').classList.add('ok');
          app.el('#q-tag').innerHTML = '정답 <b>' + esc(q.answer) + '</b>' + (q.spell ? ' — 구슬 ' + q.spell[1] + '에 「' + esc(q.spell[0]) + '」' : '') + ' · ' + esc(q.src);
          if (q.spell) { got[q.spell[1]] = q.spell[0]; paintBeads(app, G); }
        }
      });
    }
  });
})();
