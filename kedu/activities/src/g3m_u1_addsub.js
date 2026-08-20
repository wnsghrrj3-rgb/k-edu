/* src/g3m_u1_addsub.js — 자리를 지켜라! (3학년 수학 1단원 덧셈과 뺄셈)
 * 장르: duel_quiz(stream) · 생성기: add_sub_3digit
 *
 * 무대 = 세 자리 세로셈 판. 2학년 판(g2m_u3_addsub)의 계승인데 두 가지가 다르다.
 *  ① 자리가 세 칸이라 **받아올림·받아내림이 어느 자리에서 일어났는지**를 그 자리 위에 띄운다.
 *     3학년의 고비는 "올렸다/빌렸다"가 아니라 "어느 자리에서 그랬는지"를 놓치는 것이다.
 *  ② 어림 문제(estimate)는 세로셈이 아니라 **어림 판**으로 갈아낀다 — 교과서가 매 차시
 *     어림 절을 따로 두는 이유가 계산과 다른 종류의 사고이기 때문이다.
 *
 * 오답 선택지는 생성기가 전형적 오류값으로 만든다(받아올림 빠뜨림, 빌리고 안 줄임,
 * 자리마다 큰 수−작은 수). 그래서 오답을 고르는 것 자체가 어디서 무너졌는지를 말해준다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m_u1_addsub',
    title: '🔢 자리를 지켜라!',
    subtitle: '올린 1, 빌려온 10 — 어느 자리에서 일어났을까?',
    defaults: { qmode: 'mix', level: 3, est: 1, n: 10 },
    settings: [
      { key: 'qmode', label: '문제 종류', options: [{ v: 'add', label: '덧셈' }, { v: 'sub', label: '뺄셈' }, { v: 'mix', label: '섞기' }] },
      { key: 'level', label: '받아올림·내림', options: [{ v: 0, label: '없이' }, { v: 1, label: '한 번' }, { v: 2, label: '여러 번' }, { v: 3, label: '섞기' }] },
      { key: 'est', label: '어림 문제', options: [{ v: 0, label: '빼기' }, { v: 1, label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="board">' +
        '<div id="vert">' +
          '<div class="row marks"><span class="op"></span>' +
            '<span class="mk" id="mH"></span><span class="mk" id="mT"></span><span class="mk" id="mO"></span></div>' +
          '<div class="row"><span class="op"></span>' +
            '<span class="d" id="a2"></span><span class="d" id="a1"></span><span class="d" id="a0"></span></div>' +
          '<div class="row"><span class="op" id="vop">+</span>' +
            '<span class="d" id="b2"></span><span class="d" id="b1"></span><span class="d" id="b0"></span></div>' +
          '<div class="bar"></div>' +
          '<div class="row res"><span class="op"></span>' +
            '<span class="d" id="r3"></span><span class="d" id="r2"></span>' +
            '<span class="d" id="r1"></span><span class="d" id="r0"></span></div>' +
        '</div>' +
        '<div id="estb">' +
          '<div class="erow"><span class="en" id="ea"></span><span class="ar">→</span><span class="ev" id="eav">약 ?</span></div>' +
          '<div class="erow"><span class="eop" id="eop">+</span><span class="en" id="eb"></span><span class="ar">→</span><span class="ev" id="ebv">약 ?</span></div>' +
          '<div class="ebar"></div>' +
          '<div class="erow last"><span class="et">약</span><span class="ev big" id="erv">?</span><span class="et">쯤</span></div>' +
        '</div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['add_sub_3digit'].create({
        qmode: app.settings.qmode, level: app.settings.level, est: app.settings.est
      }, app.rng);

      function setDigits(pre, v) {                       // 세 자리를 칸에 흘려 넣는다
        var s = String(v);
        for (var i = 0; i < 3; i++) {
          var idx = s.length - 3 + i;
          app.el('#' + pre + (2 - i)).textContent = (idx >= 0) ? s[idx] : '';
        }
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          var est = !!q.est;
          app.el('#vert').style.display = est ? 'none' : 'inline-flex';
          app.el('#estb').style.display = est ? 'flex' : 'none';
          if (est) {
            app.el('#ea').textContent = q.a;
            app.el('#eb').textContent = q.b;
            app.el('#eop').textContent = (q.kind === 'add' ? '+' : '−');
            app.el('#eav').textContent = '약 ?';       // 어림값은 숨긴다 — 스스로 어림해야 한다
            app.el('#ebv').textContent = '약 ?';
            app.el('#erv').textContent = '?';
            return;
          }
          setDigits('a', q.a);
          setDigits('b', q.b);
          app.el('#vop').textContent = (q.kind === 'add' ? '+' : '−');
          ['#r3', '#r2', '#r1', '#r0'].forEach(function (s) { app.el(s).textContent = ''; });
          app.el('#r0').textContent = '?';
          ['#mH', '#mT', '#mO'].forEach(function (s) {
            app.el(s).textContent = ''; app.el(s).className = 'mk';
          });
        },
        reset: function (app) {
          app.el('#board').classList.remove('ok');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#board').classList.add('ok');
          if (q.est) {
            var r10 = function (n) { return Math.round(n / 10) * 10; };
            app.el('#eav').textContent = '약 ' + r10(q.a);
            app.el('#ebv').textContent = '약 ' + r10(q.b);
            app.el('#erv').textContent = q.answer;
            return;
          }
          // 답을 자리에 채운다 (네 자리가 되는 덧셈 포함 — l04)
          var s = String(q.answer);
          var cells = ['#r3', '#r2', '#r1', '#r0'];
          for (var i = 0; i < 4; i++) {
            var idx = s.length - 4 + i;
            app.el(cells[i]).textContent = (idx >= 0) ? s[idx] : '';
          }
          // 사건이 일어난 자리에 표를 세운다 — 이게 이 활동이 가르치려는 전부다
          if (q.carry) {
            if (q.carry.ones) { app.el('#mT').textContent = '1'; app.el('#mT').className = 'mk up'; }
            if (q.carry.tens) { app.el('#mH').textContent = '1'; app.el('#mH').className = 'mk up'; }
          } else if (q.borrow) {
            var A = String(q.a);
            if (q.borrow.ones) {
              var t = +A[1] - 1;
              app.el('#mT').textContent = (t < 0 ? 9 : t);
              app.el('#mT').className = 'mk down';
            }
            if (q.borrow.tens) {
              app.el('#mH').textContent = (+A[0] - 1);
              app.el('#mH').className = 'mk down';
            }
          }
        }
      });
    }
  });
})();
