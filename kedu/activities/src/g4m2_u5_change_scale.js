/* src/g4m2_u5_change_scale.js — 더 많이 변한 쪽은? (4학년 2학기 수학 5단원 「꺾은선그래프」 l02 · l05 · l06 · l08 · l09 마무리) — 교과서판 2학기 대표 활동
 * 장르: balance(stream) · 생성기: g4_2_change_scale · 무대 = g2m2_u3_throwfar(멀리 던지기 기록 대결) 저울 그대로 + 위에 교과서 꺾은선그래프
 *
 * 교과서 꺾은선그래프 한 장을 보고, 저울의 두 접시에 올린 「두 때의 값」 「두 구간의 변화」 「두 자료」를 견준다.
 * 왼쪽 접시 = 파랑, 오른쪽 접시 = 주황 — 그래프에서 같은 색으로 짚는다(점 고리 · 굵은 선분 · 두 선 사이 점선). 판정 전 저울은 수평(답을 흘리지 않음).
 * 정답을 열면 접시에 값·변한 양(+ 늘어남 · − 줄어듦)이 뜨고 큰 쪽으로 기운다 — 「줄어든 것도 변한 거예요」(지도서 378 오류 1).
 * 범위(upto)는 2차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
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
      '<svg id="cs-graph" aria-label="꺾은선그래프"></svg>' +
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
  function fmt(v) { return String(Math.round(v * 1000) / 1000); }
  /* 교과서 꺾은선그래프 — 자료 그대로(눈금 사이 점도 그 자리에) · 물결선 · 두 자료는 실선/점선 + 이름표 */
  function drawGraph(svg, g) {
    svg.innerHTML = '';
    var n = g.xs.length, cells = Math.round((g.ymax - g.y0) / g.step), gx = 64, L = 58, T = 34 + (g.series.length > 1 ? 22 : 0);
    var cp = Math.max(4, Math.min(16, Math.floor(170 / cells))), H = cells * cp, wave = g.y0 > 0, yB = T + H + (wave ? 18 : 0), W = L + gx * n + 30, HH = yB + 30;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + HH);
    var Y = function (v) { return T + H - (v - g.y0) / g.step * cp; }, X = function (i) { return L + gx * (i + 0.5); };
    svg.appendChild(el('text', { x: (L + W - 30) / 2 + 15, y: 20, 'text-anchor': 'middle', 'class': 'g-title' }, g.title));
    for (var k = 0; k <= cells; k++) {
      var y = T + H - k * cp, five = k % g.every === 0;
      svg.appendChild(el('line', { x1: L, y1: y, x2: W - 30, y2: y, 'class': five ? 'g-grid5' : 'g-grid' }));
      if (five) svg.appendChild(el('text', { x: L - 6, y: y + 4, 'text-anchor': 'end', 'class': 'g-lab' }, fmt(g.y0 + k * g.step)));
    }
    for (var i = 0; i < n; i++) {
      svg.appendChild(el('line', { x1: X(i), y1: T, x2: X(i), y2: T + H, 'class': 'g-grid' }));
      svg.appendChild(el('text', { x: X(i), y: yB + 18, 'text-anchor': 'middle', 'class': 'g-lab', id: 'gx' + i }, g.xs[i]));
    }
    svg.appendChild(el('path', { d: 'M' + L + ' ' + (T - 6) + ' L' + L + ' ' + yB + ' L' + (W - 22) + ' ' + yB, 'class': 'g-axis' }));
    if (wave) {
      var m = T + H + 9;
      svg.appendChild(el('rect', { x: L - 10, y: m - 6, width: 24, height: 12, fill: '#fff' }));
      svg.appendChild(el('path', { d: 'M' + (L - 9) + ' ' + (m - 3) + ' q4 -5 8 0 t8 0 t8 0 M' + (L - 9) + ' ' + (m + 3) + ' q4 -5 8 0 t8 0 t8 0', 'class': 'g-wave' }));
      svg.appendChild(el('text', { x: L - 6, y: yB + 4, 'text-anchor': 'end', 'class': 'g-lab' }, '0'));
    }
    svg.appendChild(el('text', { x: L - 4, y: T - 12, 'text-anchor': 'end', 'class': 'g-unit' }, '(' + g.unit + ')'));
    svg.appendChild(el('text', { x: W - 4, y: yB + 18, 'text-anchor': 'end', 'class': 'g-unit' }, '(' + g.xu + ')'));
    g.series.forEach(function (s, si) {
      svg.appendChild(el('path', { d: s.v.map(function (v, j) { return (j ? 'L' : 'M') + X(j) + ' ' + Y(v); }).join(' '), 'class': 'g-line' + (si ? ' s2' : '') }));
      s.v.forEach(function (v, j) { svg.appendChild(el(si ? 'rect' : 'circle', si ? { x: X(j) - 3.5, y: Y(v) - 3.5, width: 7, height: 7, 'class': 'g-pt' } : { cx: X(j), cy: Y(v), r: 3.6, 'class': 'g-pt' })); });
      if (g.series.length > 1) {
        var lx = L + 6 + si * 150;
        svg.appendChild(el('line', { x1: lx, y1: 38, x2: lx + 24, y2: 38, 'class': 'g-line' + (si ? ' s2' : '') }));
        svg.appendChild(el('text', { x: lx + 30, y: 42, 'class': 'g-lab' }, s.name));
      }
    });
    (g.hl || []).forEach(function (h) {
      var side = h[h.length - 1], c = COL[side];
      if (h[0] === 'p') { var v = g.series[h[1]].v[h[2]]; svg.appendChild(el('circle', { cx: X(h[2]), cy: Y(v), r: 8, fill: 'none', stroke: c, 'stroke-width': 3.4, 'class': 'g-hl' })); var t = svg.querySelector('#gx' + h[2]); if (t) t.setAttribute('fill', c); }
      if (h[0] === 's') { var sv = g.series[h[1]].v; svg.appendChild(el('path', { d: 'M' + X(h[2]) + ' ' + Y(sv[h[2]]) + ' L' + X(h[3]) + ' ' + Y(sv[h[3]]), stroke: c, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none', 'class': 'g-hl', opacity: 0.85 }));
        [h[2], h[3]].forEach(function (j) { var tt = svg.querySelector('#gx' + j); if (tt) tt.setAttribute('fill', c); }); }
      if (h[0] === 'g') { var a = g.series[0].v[h[1]], b = g.series[1].v[h[1]]; svg.appendChild(el('path', { d: 'M' + X(h[1]) + ' ' + Y(a) + ' L' + X(h[1]) + ' ' + Y(b), stroke: c, 'stroke-width': 4, 'stroke-dasharray': '5 4', fill: 'none', 'class': 'g-hl' })); var t2 = svg.querySelector('#gx' + h[1]); if (t2) t2.setAttribute('fill', c); }
    });
  }

  ACore.create({
    activityId: 'g4m2_u5_change_scale',
    title: '⚖️ 더 많이 변한 쪽은?',
    subtitle: '늘어난 것도 줄어든 것도 변한 거예요 — 점의 높이 말고 선분이 기울어진 정도를 견줘요',
    defaults: { upto: 'all', n: 10, why: 0 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['g4_2_change_scale'].create({ upto: app.settings.upto }, app.rng);
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
            { v: 'h', label: '점의 높이(값)를 읽고 견주었어요' },
            { v: 'd', label: '두 때의 차(선분이 기울어진 정도)를 견주었어요' },
            { v: 'g', label: '두 선 사이(두 자료의 차)를 견주었어요' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
