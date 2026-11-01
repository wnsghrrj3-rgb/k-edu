/* src/g3m2_u3_circle_rd.js — 반지름 지름 배달부 (3학년 2학기 수학 3단원 「원」 l04~l07)
 * 장르: duel_quiz(stream) · 생성기: circle_rd
 *
 * 「큰 수 곱셈 배달부」·「나눗셈 배달부」 다음 판. 원 단원에서 아이가 잃는 것은 **2배와 반의 방향**이다 —
 * 정본 「이런 생각을 조심해요」가 모두 그 이야기(반지름이 지름의 2배 · 지름만큼 컴퍼스를 벌림 · 반지름만 보고 무늬를 이음 ·
 * 반지름 4 와 지름 6 을 수만 견줌). 그 값이 그대로 선택지다.
 * 무대 = 식 한 장 + (반지름·지름 판엔) 원 그림 한 장 — 주어진 선분만 그어 두고, 정답을 열면 묻던 선분이 초록으로 그어진다.
 * 정답을 열면 덩이 줄(정본 말 「지름은 반지름의 2배 · 반지름은 지름의 반 · 컴퍼스는 반지름만큼」)이 펴진다.
 * 범위(upto)는 4차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m2_u3_circle_rd',
    title: '⭕ 반지름 지름 배달부',
    subtitle: '지름은 반지름의 2배 · 컴퍼스는 반지름만큼 — 거꾸로 가지 않게!',
    defaults: { upto: 'all', n: 10 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="mb">' +
        '<div id="mb-tag"></div>' +
        '<div id="mb-row">' +
          '<svg id="mb-fig" viewBox="0 0 120 120" aria-hidden="true"></svg>' +
          '<div id="mb-q"></div>' +
        '</div>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['circle_rd'].create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        r_to_d: '반지름 → 지름', d_to_r: '지름 → 반지름', two_pads: '방석 나란히',
        compass_d: '컴퍼스 — 지름이 주어졌어요', compass_r: '컴퍼스 — 반지름이 주어졌어요', compass_back: '벌린 길이로 그린 원',
        pat_r: '반지름의 규칙', pat_center: '중심의 규칙', compare_big: '크기 견주기', stage_line: '무대 나란히'
      };
      var NS = 'http://www.w3.org/2000/svg';
      function el(tag, at, txt) {
        var e = document.createElementNS(NS, tag);
        for (var k in at) e.setAttribute(k, at[k]);
        if (txt != null) e.textContent = txt;
        return e;
      }
      /* 원 그림 — 주어진 선분(반지름·지름·벌린 길이)만 긋고 그 길이를 적는다. 묻는 선분은 정답 뒤에 초록으로. */
      function seg(kind, cls, label) {
        var g = el('g', { 'class': cls });
        if (kind === 'd') {
          g.appendChild(el('line', { x1: 14, y1: 60, x2: 106, y2: 60 }));
          g.appendChild(el('text', { x: 36, y: cls === 'ask' ? 77 : 53, 'text-anchor': 'middle' }, label));
        } else {
          g.appendChild(el('line', { x1: 60, y1: 60, x2: 92.5, y2: 27.5 }));
          g.appendChild(el('text', { x: 80, y: 50, 'text-anchor': 'start' }, label));
        }
        return g;
      }
      function drawFig(q, open) {
        var F = app.el('#mb-fig');
        F.innerHTML = '';
        if (!q.give) { F.style.display = 'none'; return; }
        F.style.display = '';
        F.appendChild(el('circle', { cx: 60, cy: 60, r: 46, 'class': 'rim' }));
        var giveV = q.r || q.d || q.c, giveK = q.give === 'd' ? 'd' : 'r';
        var askK = (q.type === 'r_to_d' || q.type === 'compass_back') ? 'd' : 'r';
        F.appendChild(seg(giveK, 'giv', giveV));
        if (open && askK !== giveK) F.appendChild(seg(askK, 'ask', q.ans));
        F.appendChild(el('circle', { cx: 60, cy: 60, r: 3.2, 'class': 'ctr' }));
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = q.wordy ? 'word' : (q.cmp ? 'cmp' : 'calc');
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          drawFig(q, false);
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { app.el('#mb').classList.remove('ok'); },
        // 견주기 답(「반지름 9 cm」)은 폰 세로에서 「반지름 / 9 cm」 두 덩이로 쌓는다(css) — 넷이 한 줄
        options: function (q) { return q.options.map(function (o) {
          if (!q.cmp) return { pick: o, label: o };
          var i = o.indexOf(' ');
          return { pick: o, label: '<span class="r1">' + o.slice(0, i) + '</span><span class="r2"> ' + o.slice(i + 1) + '</span>' };
        }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          drawFig(q, true);
          var P = app.el('#mb-parts');
          P.innerHTML = '';
          (q.parts || []).forEach(function (line, i, arr) {
            var d = document.createElement('div');
            d.className = 'prow' + (i === arr.length - 1 ? ' sum' : '');
            d.textContent = line;
            P.appendChild(d);
          });
          P.style.display = 'flex';
        }
      });
    }
  });
})();
