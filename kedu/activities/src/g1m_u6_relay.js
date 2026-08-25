/* src/g1m_u6_relay.js — 수학 보물 탐험 릴레이 (1학년 수학 6단원 「두근두근 수학 보물 탐험」)
 * 장르: relay(class 전용) · 생성기: treasure_mix — 1학기 5단원 부품 7종에 위임 (문제를 새로 만들지 않는다)
 * 한 바퀴 = 1단원 → 2단원 → 3단원 → 4단원 → 5단원 순환. 반 전체가 바통을 이어 1학기를 되짚는다.
 * byType = 단원 키 5개 (D31): 수첩은 "어느 단원을 되짚을까"를 답한다.
 * D6: 개인 번호별 시간은 어디에도 없다. 기록은 반의 것.
 */
(function () {
  'use strict';
  var KO = window.KEDU_KO;

  ACore.create({
    activityId: 'g1m_u6_relay',
    title: '💎 수학 보물 탐험 릴레이',
    subtitle: '1학기에 배운 다섯 보물 — 한 명씩 바통을 이어 찾아요',
    defaults: { runners: 20, shuffle: 0 },
    settings: [
      { key: 'runners', label: '주자 수', options: [{ v: 15, label: '15명' }, { v: 20, label: '20명' }, { v: 25, label: '25명' }, { v: 30, label: '30명' }] },
      { key: 'shuffle', label: '주자 순서', options: [{ v: 0, label: '번호순' }, { v: 1, label: '무작위' }] }
    ],
    stageHtml:
      '<div id="relay">' +
        '<div id="relay-top">' +
          '<div id="baton">🏃</div>' +
          '<div id="runner-box"><div class="rl">다음 주자</div><div id="runner">?</div></div>' +
        '</div>' +
        '<div id="track"><div id="track-fill"></div></div>' +
        '<div id="relay-meta"><span id="relay-left"></span><span id="relay-best"></span></div>' +
        '<div id="tmap"></div>' +
        '<div id="q-card">' +
          '<div id="q-unit"></div>' +
          '<div id="q-text">?</div>' +
          '<div id="q-things" class="hide"></div>' +
          '<div id="q-show" class="hide"><div id="q-ico"></div><div id="q-nm"></div></div>' +
          '<div id="q-pair" class="hide"><div class="side"><div class="ico" id="pL"></div><div class="nm" id="nL"></div></div>' +
            '<div class="vs">vs</div><div class="side"><div class="ico" id="pR"></div><div class="nm" id="nR"></div></div></div>' +
        '</div>' +
        '<div id="relay-result"></div>' +
      '</div>',
    onStart: function (app) {
      var MIX = GENS['treasure_mix'];
      var SHAPE = GENS['shape3d'].shapes;
      var gen = MIX.create({}, app.rng);

      // 보물 지도 — 다섯 상자. 지금 찾는 상자만 열린다.
      var map = app.el('#tmap');
      map.innerHTML = MIX.route.map(function (r) {
        return '<div class="chest" data-unit="' + r.unit + '"><span class="ci">🎁</span><span class="cl">' + r.unit + '단원 ' + r.label + '</span></div>';
      }).join('');

      function show(id, on) { app.el(id).classList.toggle('hide', !on); }

      Relay.run(app, gen, {
        reset: function (app) {
          app.el('#q-card').classList.remove('ok');
          show('#q-things', false); show('#q-show', false); show('#q-pair', false);
          app.el('#q-text').textContent = '';
        },
        render: function (app, q) {
          app.els('#tmap .chest').forEach(function (c) {
            var on = +c.getAttribute('data-unit') === q.unit;
            c.classList.toggle('open', on);
            c.querySelector('.ci').textContent = on ? '💎' : '🎁';
          });
          app.el('#q-unit').textContent = '보물 ' + q.unit + ' · ' + q.unitLabel;
          var qt = app.el('#q-text');
          qt.className = '';
          if (q.src === 'count9') {
            qt.textContent = q.prompt; qt.className = 'ask';
            var box = app.el('#q-things'); box.className = q.layout;
            var html = '';
            for (var i = 0; i < q.total; i++) {
              var st = (q.layout === 'random') ? ' style="left:' + q.points[i].x + '%;top:' + q.points[i].y + '%"' : '';
              html += '<span class="thing"' + st + '>' + q.thing + '</span>';
            }
            box.innerHTML = html;
            show('#q-things', true);
          } else if (q.src === 'shape3d') {
            qt.textContent = q.prompt; qt.className = 'ask';
            app.el('#q-ico').textContent = q.thing.i;
            app.el('#q-nm').textContent = q.thing.n;
            show('#q-show', true);
          } else if (q.src === 'compare_weight') {
            qt.textContent = '어느 것이 더 무거울까요?'; qt.className = 'ask';
            app.el('#pL').textContent = q.L.i; app.el('#nL').textContent = q.L.n;
            app.el('#pR').textContent = q.R.i; app.el('#nR').textContent = q.R.n;
            show('#q-pair', true);
          } else if (q.src === 'count_bundle') {
            qt.textContent = q.prompt; qt.className = 'ask';
          } else if (q.src === 'compare50') {
            qt.textContent = q.a + '  ◯  ' + q.b;
          } else {                                   // split_gather · compose10 — 식 그대로
            qt.textContent = q.prompt;
          }
        },
        options: function (q) {
          if (q.src === 'shape3d') return q.options.map(function (s) { return { pick: s, label: SHAPE[s] }; });
          if (q.src === 'compare_weight') return [{ pick: 'L', label: q.L.i + ' ' + q.L.n }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: q.R.i + ' ' + q.R.n }];
          if (q.src === 'compare50') return [{ pick: 'L', label: KO.j(q.a, '이/가') + ' 더 커요' }, { pick: 'E', label: '같아요' }, { pick: 'R', label: KO.j(q.b, '이/가') + ' 더 커요' }];
          if (q.src === 'count_bundle') return q.options.map(function (o) {
            var t = o.split('-'); return { pick: o, label: t[0] + '묶음 ' + t[1] + '개' };
          });
          return q.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, q) {
          app.el('#q-card').classList.add('ok');
          if (q.src === 'count9') {                  // 하나씩 번호가 켜진다 — 센다는 행위를 되짚어 준다
            app.els('#q-things .thing').forEach(function (t, i) {
              setTimeout(function () { t.classList.add('counted'); t.setAttribute('data-i', i + 1); }, i * 110);
            });
          }
        }
      });
    }
  });
})();
