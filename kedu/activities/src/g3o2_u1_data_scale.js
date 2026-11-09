/* src/g3o2_u1_data_scale.js — 어느 해가 더 많을까? (3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 l02 · l03 · l08 · l12 마무리) — 교과서판 2학기 대표 활동
 * 장르: balance(stream) · 생성기: g3_2_data_scale · 무대 = g4m2_u5_change_scale 저울 그대로 + 위에 교과서 막대그래프 / 100칸 점 마을
 *
 * 교과서 자료 한 장(태어나는 아이의 수 · 생산 가능 인구 · 100명 마을 · 외국인 이주민 수)을 보고, 저울의 두 접시에 올린 「두 해」 「두 동안」을 견준다.
 * 왼쪽 접시 = 파랑, 오른쪽 접시 = 주황 — 그래프에서 같은 색으로 짚는다(막대 테두리 · 마을 테두리). 판정 전 저울은 수평(답을 흘리지 않음).
 * 막대 위 수는 교과서처럼 보인다 — 「단위가 만 명」 「거의 같아 보여도 수로」를 읽는 연습(학습지 X05).
 * 범위(upto)는 3차시(l02)부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var COL = { L: '#1F5FA8', R: '#D35400' };
  function pan(side, x) {
    return '<g id="pan-' + side + '">' +
      '<line x1="' + x + '" y1="90" x2="' + (x - 40) + '" y2="186" stroke="#92400e" stroke-width="5"/>' +
      '<line x1="' + x + '" y1="90" x2="' + (x + 40) + '" y2="186" stroke="#92400e" stroke-width="5"/>' +
      '<rect x="' + (x - 70) + '" y="186" width="140" height="14" rx="7" fill="#f59e0b"/>' +
      '<rect x="' + (x - 82) + '" y="100" width="164" height="82" rx="16" fill="#ffffff" stroke="' + COL[side] + '" stroke-width="5"/>' +
      '<text x="' + x + '" y="134" text-anchor="middle" class="pan-a" id="t' + side + '1">?</text>' +
      '<text x="' + x + '" y="166" text-anchor="middle" class="pan-b" id="t' + side + '2"></text>' +
      '<text x="' + x + '" y="236" text-anchor="middle" class="pan-res" id="r' + side + '"></text>' +
    '</g>';
  }
  var STAGE =
    '<div id="cs">' +
      '<div id="cs-tag"></div>' +
      '<div id="cs-ask"></div>' +
      '<svg id="cs-graph" aria-label="교과서 자료 그래프"></svg>' +
      '<svg id="scale" viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" aria-label="저울">' +
        '<rect x="304" y="84" width="32" height="150" rx="10" fill="#b45309"/>' +
        '<rect x="225" y="228" width="190" height="24" rx="12" fill="#92400e"/>' +
        '<g id="beam-g">' +
          '<rect x="90" y="76" width="460" height="16" rx="8" fill="#d97706"/>' +
          '<circle cx="320" cy="84" r="15" fill="#78350f"/>' +
          pan('L', 110) + pan('R', 530) +
        '</g>' +
      '</svg>' +
    '</div>';

  function fit(t, s, big) { t.textContent = s; t.style.fontSize = Math.min(big, Math.floor(152 / Math.max(1, String(s).length) * 1.15)) + 'px'; }   /* 접시 폭(164)에 글 맞추기 */
  function el(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  function comma(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function sideOf(g, i) { var s = null; (g.hl || []).forEach(function (h) { if (h[0] === i) s = h[1]; }); return s; }
  /* 교과서 막대그래프 — 막대 위에 수 · 가로 = 해 · 세로 = 수(단위) */
  function drawBars(svg, g) {
    var n = g.xs.length, gx = 76, L = 60, T = 40, H = 170, W = L + gx * n + 24, yB = T + H, HH = yB + 34;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + HH);
    var Y = function (v) { return yB - v / g.ymax * H; }, X = function (i) { return L + gx * (i + 0.5); };
    svg.appendChild(el('text', { x: W / 2, y: 20, 'text-anchor': 'middle', 'class': 'g-title' }, g.title));
    for (var v = 0; v <= g.ymax; v += g.tick) {
      svg.appendChild(el('line', { x1: L, y1: Y(v), x2: W - 20, y2: Y(v), 'class': 'g-grid' }));
      svg.appendChild(el('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', 'class': 'g-lab' }, comma(v)));
    }
    svg.appendChild(el('text', { x: L - 4, y: T - 12, 'text-anchor': 'end', 'class': 'g-unit' }, '(' + g.u + ')'));
    g.v.forEach(function (val, i) {
      var s = sideOf(g, i), bw = 40;
      svg.appendChild(el('rect', { x: X(i) - bw / 2, y: Y(val), width: bw, height: yB - Y(val), 'class': 'g-bar' + (s ? ' on' : ''), stroke: s ? COL[s] : 'none', 'stroke-width': s ? 4 : 0 }));
      svg.appendChild(el('text', { x: X(i), y: Y(val) - 6, 'text-anchor': 'middle', 'class': 'g-val' }, comma(val)));
      svg.appendChild(el('text', { x: X(i), y: yB + 20, 'text-anchor': 'middle', 'class': 'g-lab', fill: s ? COL[s] : '' }, g.xs[i]));
    });
    svg.appendChild(el('path', { d: 'M' + L + ' ' + (T - 6) + ' L' + L + ' ' + yB + ' L' + (W - 14) + ' ' + yB, 'class': 'g-axis' }));
  }
  /* 100칸 점 마을 — 마을마다 10 × 10, 노인 = 색칠 점 */
  function drawDots(svg, g) {
    var n = g.xs.length, cw = 150, W = cw * n + 20, T = 40, HH = T + 150 + 34;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + HH);
    svg.appendChild(el('text', { x: W / 2, y: 20, 'text-anchor': 'middle', 'class': 'g-title' }, g.title));
    g.v.forEach(function (val, i) {
      var s = sideOf(g, i), x0 = 10 + cw * i + 12;
      svg.appendChild(el('rect', { x: x0 - 6, y: T - 6, width: cw - 12, height: 140, rx: 10, fill: '#fff', stroke: s ? COL[s] : '#d8cdb8', 'stroke-width': s ? 4 : 1.5, 'class': 'g-town' }));
      for (var k = 0; k < 100; k++) {
        var r = Math.floor(k / 10), c = k % 10;
        svg.appendChild(el('circle', { cx: x0 + 7 + c * 12.4, cy: T + 7 + r * 12.4, r: 4.4, 'class': k < val ? 'g-old' : 'g-man' }));
      }
      svg.appendChild(el('text', { x: x0 + cw / 2 - 6, y: T + 154, 'text-anchor': 'middle', 'class': 'g-lab', fill: s ? COL[s] : '' }, g.xs[i]));
    });
  }
  function drawGraph(svg, g) { svg.innerHTML = ''; if (g.kind === 'dots') drawDots(svg, g); else drawBars(svg, g); }

  ACore.create({
    activityId: 'g3o2_u1_data_scale',
    title: '⚖️ 어느 해가 더 많을까?',
    subtitle: '교과서 그래프 속 두 해를 저울에 올려요 — 단위를 보고, 거의 같아 보여도 수로 견줘요',
    defaults: { upto: 'all', n: 10, why: 0 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '3차시까지' },
        { v: 'l03', label: '4차시까지' },
        { v: 'l08', label: '10·11차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['g3_2_data_scale'].create({ upto: app.settings.upto }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#cs-tag').textContent = q.tag || '';
          app.el('#cs-ask').textContent = q.prompt;
          drawGraph(app.el('#cs-graph'), q.g);
          fit(app.el('#tL1'), q.sa[0], 24); fit(app.el('#tL2'), q.sa[1], 21);
          fit(app.el('#tR1'), q.sb[0], 24); fit(app.el('#tR2'), q.sb[1], 21);
          app.el('#rL').textContent = ''; app.el('#rR').textContent = '';
        },
        reset: function (app) { app.el('#beam-g').style.transform = 'rotate(0deg)'; app.el('#cs').classList.remove('ok'); },   // 판정 전엔 수평
        options: function () {
          return [{ pick: 'L', label: '⬅ 왼쪽이 더' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '오른쪽이 더 ➡' }];
        },
        reveal: function (app, q) {
          var deg = q.answer === 'E' ? 0 : (q.answer === 'L' ? -8 : 8);   // 큰 쪽이 내려간다
          app.el('#beam-g').style.transform = 'rotate(' + deg + 'deg)';
          fit(app.el('#rL'), q.ra, 26); fit(app.el('#rR'), q.rb, 26);
          app.el('#cs').classList.add('ok');
        },
        why: {
          question: '🦉 무엇을 견주었어?',
          options: [
            { v: 'h', label: '두 해의 수(막대 길이)를 읽고 견주었어요' },
            { v: 'd', label: '두 해 사이에 변한 양을 견주었어요' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
