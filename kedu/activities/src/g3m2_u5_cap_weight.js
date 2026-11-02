/* src/g3m2_u5_cap_weight.js — 들이 무게 배달부 (3학년 2학기 수학 5단원 「들이와 무게」 l02~l10)
 * 장르: duel_quiz(stream) · 생성기: cap_weight
 *
 * 「분수 소수 배달부」 다음 판. 이 단원에서 아이가 잃는 것은 **단위**다 —
 * 정본 「이런 생각을 조심해요」가 모두 그 이야기(1 L 300 mL + 2 L 500 mL = 803 · 3 kg 40 g = 3400 g · 7 L 50 mL → 750 ·
 * 6050 mL → 6 L 500 mL · 1050 g → 1 kg 500 g · 칸 수 3 을 3 mL 로 · 책상 약 15 g · 1 t = 1000 g · 자리 가리지 않고 빼 50 mL).
 * 그 값이 그대로 선택지다.
 * 무대 = 식 한 장 + (눈금 판엔) 비커·저울 한 장 — 눈금만 그어 두고 수는 묻는 글에. 정답을 열면 물·바늘이 초록이 된다.
 * 정답을 열면 덩이 줄(정본 말 「같은 단위끼리 · 1 L = 1000 mL · 한 칸의 크기부터」)이 펴진다.
 * 몇 L 몇 mL · 몇 kg 몇 g 답은 「3 L / 800 mL」, 단위 붙은 답은 「약 200 / mL」 두 덩이로 그린다(폰 세로·두 팀 줄에서 위아래로).
 * 범위(upto)는 2차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m2_u5_cap_weight',
    title: '🥛 들이 무게 배달부',
    subtitle: '같은 단위끼리 · 1 L는 1000 mL · 한 칸의 크기부터!',
    defaults: { upto: 'all', n: 10 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'l09', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="mb">' +
        '<div id="mb-tag"></div>' +
        '<div id="mb-q"></div>' +
        '<svg id="mb-fig" viewBox="0 0 240 120" aria-hidden="true"></svg>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['cap_weight'].create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        cap_to_ml: '몇 L 몇 mL → mL', ml_to_cap: 'mL → 몇 L 몇 mL', cmp_cap: '들이 견주기', scale_cap: '비커 눈금 읽기',
        est_cap: '들이 어림하기', cap_add: '들이의 덧셈', cap_sub: '들이의 뺄셈',
        kg_to_g: '몇 kg 몇 g → g', g_to_kg: 'g → 몇 kg 몇 g', t_to_kg: '1 t = 1000 kg', scale_wt: '저울 눈금 읽기',
        est_wt: '무게 어림하기', wt_add: '무게의 덧셈', wt_sub: '무게의 뺄셈', fill_rest: '남김없이 나누어 담기'
      };
      var NS = 'http://www.w3.org/2000/svg';
      function el(tag, at) {
        var e = document.createElementNS(NS, tag);
        for (var k in at) e.setAttribute(k, at[k]);
        return e;
      }
      /* 눈금 그림 — 비커(세로)·저울(가로). 눈금만 긋고 수는 쓰지 않는다. 정답을 열면 물·바늘이 초록 */
      function drawScale(q, open) {
        var F = app.el('#mb-fig');
        F.innerHTML = '';
        if (!q.scale) { F.style.display = 'none'; return; }
        F.style.display = '';
        var s = q.scale, i;
        if (s.kind === 'cap') {
          F.setAttribute('viewBox', '0 0 240 120');
          var x0 = 86, w = 68, top = 8, bot = 112, h = (bot - top) / s.ticks;
          F.appendChild(el('rect', { x: x0, y: bot - h * s.n, width: w, height: h * s.n, 'class': open ? 'water ok' : 'water' }));
          for (i = 1; i <= s.ticks; i++) F.appendChild(el('line', { x1: x0, x2: x0 + (i % 5 === 0 ? 26 : 16), y1: bot - h * i, y2: bot - h * i, 'class': 'tick' }));
          F.appendChild(el('path', { d: 'M' + x0 + ' ' + (top - 4) + ' V' + bot + ' H' + (x0 + w) + ' V' + (top - 4), 'class': 'rim' }));
        } else {
          F.setAttribute('viewBox', '0 0 240 70');
          var L = 14, R = 226, y = 40, g = (R - L) / s.ticks;
          F.appendChild(el('line', { x1: L, x2: R, y1: y, y2: y, 'class': 'rim' }));
          for (i = 0; i <= s.ticks; i++) F.appendChild(el('line', { x1: L + g * i, x2: L + g * i, y1: y, y2: y - (i % 5 === 0 ? 16 : 10), 'class': 'tick' }));
          var px = L + g * s.n;
          F.appendChild(el('path', { d: 'M' + px + ' ' + (y + 2) + ' l-9 22 h18 z', 'class': open ? 'needle ok' : 'needle' }));
        }
      }
      // 몇 L 몇 mL · 몇 kg 몇 g = 두 덩이(넓은 화면 한 줄 · 폰 세로와 두 팀 줄은 위아래)
      var TWO = /^(\d+ (?:L|kg)) (\d+ (?:mL|g))$/;

      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = q.wordy ? 'word' : (q.cmp ? 'cmp' : 'calc');
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          drawScale(q, false);
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { var M = app.el('#mb'); if (M) M.classList.remove('ok'); },
        // 몇 L 몇 mL 는 L 앞뒤로, 「약 200 mL」·「950 mL」는 끝 낱말 앞에서 — 폰 세로에서 넷이 한 줄
        options: function (q) { return q.options.map(function (o) {
          var m = o.match(TWO), i = o.lastIndexOf(' ');
          if (m) return { pick: o, label: '<span class="r1">' + m[1] + '</span><span class="r2"> ' + m[2] + '</span>' };
          if (i < 0) return { pick: o, label: o };
          return { pick: o, label: '<span class="r1">' + o.slice(0, i) + '</span><span class="r2"> ' + o.slice(i + 1) + '</span>' };
        }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          drawScale(q, true);
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
