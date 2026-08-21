/* src/g3m_u4_mul.js — 올림 배달부 (3학년 수학 4단원 곱셈)
 * 장르: duel_quiz(stream) · 생성기: mul_2x1
 *
 * 무대 = 세로셈 판. g3m_u1_addsub(자리를 지켜라!)의 판을 그대로 물려받는다 —
 * 자리 칸·올림 표·어림 판의 골격이 같다. 곱셈이라서 달라지는 건 두 가지뿐이다.
 *  ① 곱하는 수가 한 자리라 아래 줄은 일의 자리에만 선다. 그래서 아이가
 *     "3을 4에도 곱한다"를 놓치기 쉽다 — 정답을 열 때 **곱하는 화살표**가 두 자리로 뻗는다.
 *  ② 정답 아래에 **부분 곱**을 편다(40×3=120, 3×3=9). 교과서가 매 차시 쓰는 표기이고,
 *     세로셈의 답이 어디서 왔는지를 이 두 줄이 다 말한다.
 *
 * 올림 표는 덧셈과 같은 자리에 뜨지만 뜻이 다르다. 덧셈의 올림 1은 "더해서 넘친 1"이고,
 * 곱셈의 올림은 "곱해서 넘친 몇"이다 — 2도 5도 8도 될 수 있다. 그래서 표에 숫자를 크게 쓴다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m_u4_mul',
    title: '🚚 올림 배달부',
    subtitle: '올린 수는 다음 자리로! 제자리에 배달했나요?',
    defaults: { qmode: 'mix', level: 3, est: 1, n: 10 },
    settings: [
      { key: 'qmode', label: '곱셈 종류', options: [
        { v: 'tens', label: '몇십×몇' }, { v: 'std', label: '몇십몇×몇' }, { v: 'mix', label: '섞기' }] },
      { key: 'level', label: '올림', options: [
        { v: 0, label: '없이' }, { v: 1, label: '한 번' }, { v: 2, label: '두 번' }, { v: 3, label: '섞기' }] },
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
          '<div class="row"><span class="op" id="vop">×</span>' +
            '<span class="d"></span><span class="d"></span><span class="d" id="b0"></span></div>' +
          '<div class="bar"></div>' +
          '<div class="row res"><span class="op"></span>' +
            '<span class="d" id="r2"></span><span class="d" id="r1"></span><span class="d" id="r0"></span></div>' +
        '</div>' +
        '<div id="parts">' +
          '<div class="prow" id="p1"></div>' +
          '<div class="prow" id="p2"></div>' +
        '</div>' +
        '<div id="estb">' +
          '<div class="erow"><span class="en" id="ea"></span><span class="ar">→</span><span class="ev" id="eav">약 ?</span></div>' +
          '<div class="erow"><span class="eop">×</span><span class="en" id="eb"></span></div>' +
          '<div class="ebar"></div>' +
          '<div class="erow last"><span class="et">약</span><span class="ev big" id="erv">?</span><span class="et">쯤</span></div>' +
        '</div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['mul_2x1'].create({
        qmode: app.settings.qmode, level: app.settings.level, est: app.settings.est
      }, app.rng);

      function setDigits(pre, v, w) {              // 오른쪽 정렬로 자리 칸에 흘려 넣는다
        var s = String(v);
        for (var i = 0; i < w; i++) {
          var idx = s.length - w + i;
          var cell = app.el('#' + pre + (w - 1 - i));
          if (cell) cell.textContent = (idx >= 0) ? s[idx] : '';
        }
      }
      function clearMarks() {
        ['#mH', '#mT', '#mO'].forEach(function (s) {
          app.el(s).textContent = ''; app.el(s).className = 'mk';
        });
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          var est = !!q.est;
          app.el('#vert').style.display = est ? 'none' : 'inline-flex';
          app.el('#parts').style.display = 'none';
          app.el('#estb').style.display = est ? 'flex' : 'none';
          app.el('#p1').textContent = '';
          app.el('#p2').textContent = '';
          if (est) {
            app.el('#ea').textContent = q.a;
            app.el('#eb').textContent = q.m;
            app.el('#eav').textContent = '약 ?';    // 어림값은 숨긴다 — 스스로 어림해야 한다
            app.el('#erv').textContent = '?';
            return;
          }
          setDigits('a', q.a, 3);
          app.el('#b0').textContent = q.m;
          ['#r2', '#r1', '#r0'].forEach(function (s) { app.el(s).textContent = ''; });
          app.el('#r0').textContent = '?';
          clearMarks();
        },
        reset: function (app) {
          app.el('#board').classList.remove('ok');
        },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#board').classList.add('ok');
          if (q.est) {
            app.el('#eav').textContent = '약 ' + q.round;
            app.el('#erv').textContent = q.answer;
            return;
          }
          setDigits('r', q.answer, 3);

          // 올림이 어느 자리에서 어느 자리로 갔는지 — 이 활동이 가르치려는 전부다
          if (q.carry.ones) { app.el('#mT').textContent = q.carry.ones; app.el('#mT').className = 'mk up'; }
          if (q.carry.tens) { app.el('#mH').textContent = q.carry.tens; app.el('#mH').className = 'mk up'; }

          // 부분 곱 — 답이 어디서 왔는지를 두 줄이 말한다 (교과서 표기 그대로)
          var P = app.el('#parts');
          P.style.display = 'flex';
          if (q.type === 'tens_mul') {
            app.el('#p1').textContent = q.t + ' × ' + q.m + ' = ' + (q.t * q.m);
            app.el('#p2').textContent = '10배 →  ' + q.a + ' × ' + q.m + ' = ' + q.answer;
          } else {
            app.el('#p1').textContent = (q.t * 10) + ' × ' + q.m + ' = ' + q.part.tens;
            app.el('#p2').textContent = '+ ' + q.o + ' × ' + q.m + ' = ' + q.part.ones +
                                        '  →  ' + q.answer;
          }
        }
      });
    }
  });
})();
