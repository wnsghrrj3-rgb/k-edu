/* src/g3m_u5_lt.js — 단위 정거장 (3학년 수학 5단원 길이와 시간)
 * 장르: duel_quiz(stream) · 생성기: length_time
 *
 * 무대가 셋이다. 억지로 하나로 합치지 않았다 — 이 단원이 실제로 두 덩어리이기 때문이다.
 *  ① 변환대(conv)  — 「원래 표기 → ? 」 사이에 **환산 관계**를 띠로 건다(1cm=10mm, 1km=1000m,
 *     1분=60초). 이 띠가 이 활동의 전부다: 아이가 틀리는 건 계산이 아니라 **몇씩 묶이는지**다.
 *     길이 띠는 10칸(십진), 시간 띠는 60칸으로 그려 **띠 모양 자체가 다르게** 보이게 했다.
 *  ② 세로셈(vert) — 시·분·초를 자리 맞춰 세운다. g3m_u1_addsub·g3m_u4_mul의 판을 물려받되
 *     자리 이름이 숫자가 아니라 단위다. 받아올림·받아내림 표는 60을 명시한다(10이 아니라).
 *  ③ 시각 띠(span) — 시작·끝을 띠 위에 찍고, 물음이 **점**(시각)인지 **구간**(시간)인지를
 *     띠에서 눈으로 갈라 보여준다. 이 단원 최대 오개념이라 은유가 아니라 판독 장치다.
 *  ④ 단위 고르기(unit) — 어림. 수만 주고 단위 칸을 비운다.
 *
 * §6-3: 은유가 판독을 방해하면 판독이 이긴다. 그래서 시계 그림을 쓰지 않았다 —
 *   3학년 시간 계산의 고비는 바늘 읽기가 아니라 60진법 자리 맞춤이고,
 *   시계를 그리면 아이 눈이 바늘로 가서 자리가 안 보인다.
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m_u5_lt',
    title: '🚉 단위 정거장',
    subtitle: '길이는 10씩, 시간은 60씩 — 갈아타는 자리를 지켜요',
    defaults: { qmode: 'mix', est: 1, n: 10 },
    settings: [
      { key: 'qmode', label: '무엇을', options: [
        { v: 'len', label: '길이' }, { v: 'time', label: '시간' }, { v: 'mix', label: '섞기' }] },
      { key: 'est', label: '어림 문제', options: [{ v: 0, label: '빼기' }, { v: 1, label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="board">' +
        // ① 변환대
        '<div id="conv">' +
          '<div class="crow">' +
            '<span class="cbox" id="cL"></span>' +
            '<span class="car">→</span>' +
            '<span class="cbox q" id="cR">?</span>' +
          '</div>' +
          '<div class="cband" id="cBand"></div>' +
          '<div class="crel" id="cRel"></div>' +
        '</div>' +
        // ② 세로셈
        '<div id="vert">' +
          '<div class="vhead"><span class="vh" id="vh0"></span><span class="vh" id="vh1"></span></div>' +
          '<div class="vrow marks"><span class="vop"></span>' +
            '<span class="vmk" id="vm0"></span><span class="vmk" id="vm1"></span></div>' +
          '<div class="vrow"><span class="vop"></span>' +
            '<span class="vd" id="va0"></span><span class="vd" id="va1"></span></div>' +
          '<div class="vrow"><span class="vop" id="vop">+</span>' +
            '<span class="vd" id="vb0"></span><span class="vd" id="vb1"></span></div>' +
          '<div class="vbar"></div>' +
          '<div class="vrow res"><span class="vop"></span>' +
            '<span class="vd" id="vr0"></span><span class="vd" id="vr1"></span></div>' +
          '<div class="vnote" id="vNote"></div>' +
        '</div>' +
        // ③ 시각 띠
        '<div id="span">' +
          '<div class="sask" id="sAsk"></div>' +
          '<div class="sline">' +
            '<div class="sfill" id="sFill"></div>' +
            '<span class="spt start" id="sS"><b id="sSv"></b></span>' +
            '<span class="spt end" id="sE"><b id="sEv"></b></span>' +
            '<span class="sdur" id="sD"></span>' +
          '</div>' +
          '<div class="slegend"><span class="lg pt">● 시각 = 언제</span>' +
            '<span class="lg sp">▭ 시간 = 얼마 동안</span></div>' +
        '</div>' +
        // ④ 단위 고르기
        '<div id="unit">' +
          '<div class="uthing" id="uT"></div>' +
          '<div class="urow"><span class="unum" id="uN"></span><span class="ubox q" id="uU">?</span></div>' +
          '<div class="uhint">약 얼마쯤일까요?</div>' +
        '</div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['length_time'].create({
        qmode: app.settings.qmode, est: app.settings.est
      }, app.rng);

      var PANES = ['#conv', '#vert', '#span', '#unit'];
      function show(which) {
        PANES.forEach(function (s) {
          app.el(s).style.display = (s === which) ? 'flex' : 'none';
        });
      }

      // 환산 관계 띠 — 길이는 10칸, 시간은 60칸. 칸 수가 곧 이 단원의 요점이다.
      function band(n) {
        var cells = (n === 60) ? 60 : 10;
        var html = '';
        for (var i = 0; i < cells; i++) html += '<i></i>';
        return '<div class="bcells ' + (n === 60 ? 'sixty' : 'ten') + '">' + html + '</div>';
      }
      function bandFor(rel) {
        if (/1000/.test(rel)) return '<div class="bcells thousand"><i></i><i></i><i></i>' +
          '<span class="bx">1000칸</span></div>';
        if (/60/.test(rel)) return band(60);
        return band(10);
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          if (q.kind === 'conv') {
            show('#conv');
            app.el('#cL').textContent = q.left;
            app.el('#cR').textContent = '?';
            app.el('#cR').className = 'cbox q';
            app.el('#cBand').innerHTML = bandFor(q.rel);
            app.el('#cRel').textContent = q.rel;
            app.el('#cRel').className = 'crel' + (/60/.test(q.rel) ? ' time' : ' len');
            return;
          }
          if (q.kind === 'unit') {
            show('#unit');
            app.el('#uT').textContent = q.left;
            app.el('#uN').textContent = q.num;
            app.el('#uU').textContent = '?';
            app.el('#uU').className = 'ubox q';
            return;
          }
          if (q.kind === 'vert') {
            show('#vert');
            var big = q.unitH ? '시간' : '분', small = q.unitH ? '분' : '초';
            app.el('#vh0').textContent = big;
            app.el('#vh1').textContent = small;
            app.el('#va0').textContent = q.unitH ? q.a.h : q.a.m;
            app.el('#va1').textContent = q.unitH ? q.a.m : q.a.s;
            app.el('#vb0').textContent = q.unitH ? q.b.h : q.b.m;
            app.el('#vb1').textContent = q.unitH ? q.b.m : q.b.s;
            app.el('#vop').textContent = q.op;
            app.el('#vr0').textContent = '';
            app.el('#vr1').textContent = '?';
            app.el('#vm0').textContent = ''; app.el('#vm0').className = 'vmk';
            app.el('#vm1').textContent = ''; app.el('#vm1').className = 'vmk';
            app.el('#vNote').textContent = '';
            return;
          }
          // span
          show('#span');
          var askDur = (q.ask === 'dur');
          app.el('#sAsk').innerHTML = askDur
            ? '얼마 <b class="hi sp">동안</b> 했을까요? <span class="tag sp">시간</span>'
            : '<b class="hi pt">언제</b> 끝났을까요? <span class="tag pt">시각</span>';
          app.el('#sSv').textContent = fmtClock(q.start);
          app.el('#sEv').textContent = askDur ? fmtClock(q.end) : '?';
          app.el('#sE').className = 'spt end' + (askDur ? '' : ' q');
          app.el('#sD').textContent = askDur ? '?' : fmtTime(q.dur);
          app.el('#sD').className = 'sdur' + (askDur ? ' q' : '');
          app.el('#sFill').className = 'sfill' + (askDur ? ' hi' : '');
        },
        reset: function (app) { app.el('#board').classList.remove('ok'); },
        options: function (q) {
          return q.options.map(function (o) { return { pick: o, label: o }; });
        },
        reveal: function (app, q) {
          app.el('#board').classList.add('ok');
          if (q.kind === 'conv') {
            app.el('#cR').textContent = q.answer;
            app.el('#cR').className = 'cbox done';
            return;
          }
          if (q.kind === 'unit') {
            app.el('#uU').textContent = q.answer;
            app.el('#uU').className = 'ubox done';
            return;
          }
          if (q.kind === 'vert') {
            var r = q.res;
            app.el('#vr0').textContent = q.unitH ? r.h : r.m;
            app.el('#vr1').textContent = q.unitH ? r.m : r.s;
            // 60을 넘겨 갈아탄 자리 / 60을 빌려 온 자리 — 여기가 이 차시의 전부다
            var big = q.unitH ? '시간' : '분', small = q.unitH ? '분' : '초';
            var av = q.unitH ? q.a.m : q.a.s, bv = q.unitH ? q.b.m : q.b.s;
            if (q.op === '+' && av + bv >= 60) {
              app.el('#vm0').textContent = '+1'; app.el('#vm0').className = 'vmk up';
              app.el('#vNote').textContent = small + '끼리 더하니 ' + (av + bv) +
                ' — 60이 넘었어요. 60' + small + '을 1' + big + '으로 갈아타요.';
            } else if (q.op === '−' && av < bv) {
              app.el('#vm0').textContent = '−1'; app.el('#vm0').className = 'vmk down';
              app.el('#vm1').textContent = '+60'; app.el('#vm1').className = 'vmk up';
              app.el('#vNote').textContent = av + small + '에서 ' + bv + small +
                '을 뺄 수 없어요. 1' + big + '을 60' + small + '으로 빌려 오고, ' +
                big + ' 자리는 1 줄어요.';
            } else {
              app.el('#vNote').textContent = '같은 단위끼리 자리를 맞춰 계산해요.';
            }
            return;
          }
          // span — 물음이 점이었는지 구간이었는지를 띠에서 확정해 준다
          if (q.ask === 'dur') {
            app.el('#sD').textContent = fmtTime(q.dur);
            app.el('#sD').className = 'sdur done';
          } else {
            app.el('#sEv').textContent = fmtClock(q.end);
            app.el('#sE').className = 'spt end done';
          }
        }
      });

      function fmtTime(t) {
        var o = [];
        if (t.h) o.push(t.h + '시간');
        if (t.m) o.push(t.m + '분');
        if (t.s) o.push(t.s + '초');
        return o.length ? o.join(' ') : '0초';
      }
      function fmtClock(t) {
        var o = [t.h + '시'];
        if (t.m) o.push(t.m + '분');
        if (t.s) o.push(t.s + '초');
        return o.join(' ');
      }
    }
  });
})();
