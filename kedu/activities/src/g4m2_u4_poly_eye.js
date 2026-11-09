/* src/g4m2_u4_poly_eye.js — 다각형 탐정 (4학년 2학기 수학 4단원 「다각형」 l02~l05 · l09 마무리) — 교과서판 2학기 대표 활동
 * 장르: duel_quiz(stream) · 생성기: g4_2_poly_eye · 무대 = g3m2_u3_circle_rd(반지름 지름 배달부) 틀 그대로 + 다각형 그림
 *
 * 교과서 도형 한 장(가옥·그릇·조각보·표지판)을 보고 「다각형일까 · 이름은 · 정다각형일까 · 대각선일까 · 몇 개일까」를 고른다.
 * 그림 = 판 좌표 그대로(곡선·열림·같은 변/각 표시·빨간 선). 정답을 열면 덩이 줄이 펴지고, 대각선 수 판은 대각선이 초록으로 그어진다.
 * 범위(upto)는 2차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g4m2_u4_poly_eye',
    title: '🔍 다각형 탐정',
    subtitle: '선분으로만 둘러싸였나 · 변과 각이 모두 같나 · 이웃하지 않는 두 꼭짓점인가',
    defaults: { upto: 'all', n: 10 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="mb">' +
        '<div id="mb-tag"></div>' +
        '<div id="mb-row">' +
          '<svg id="mb-fig" viewBox="-8 -8 136 116" aria-hidden="true"></svg>' +
          '<div id="mb-q" class="word"></div>' +
        '</div>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var GEN = GENS['g4_2_poly_eye'];
      var gen = GEN.create({ upto: app.settings.upto }, app.rng);
      var NS = 'http://www.w3.org/2000/svg';
      function el(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
      function pts(P) { return P.map(function (p) { return p[0] + ',' + p[1]; }).join(' '); }
      function qpath(a) { return 'M' + a[0][0] + ' ' + a[0][1] + ' Q' + a[2][0] + ' ' + a[2][1] + ' ' + a[1][0] + ' ' + a[1][1]; }
      function cen(P) { var x = 0, y = 0; P.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / P.length, y / P.length]; }
      /* 같은 변 표시(눈금) · 같은 각 표시(호 · 직각은 ㄱ자) */
      function ticks(F, P, t) {
        t.forEach(function (k, i) { var a = P[i], b = P[(i + 1) % P.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
          for (var j = 0; j < k; j++) { var o = (j - (k - 1) / 2) * 4, cx = mx + ux * o, cy = my + uy * o; F.appendChild(el('line', { x1: cx - uy * 5, y1: cy + ux * 5, x2: cx + uy * 5, y2: cy - ux * 5, 'class': 'tick' })); } });
      }
      function arcs(F, P, a) {
        a.forEach(function (k, i) { var b = P[i], p = P[(i + P.length - 1) % P.length], c = P[(i + 1) % P.length];
          var u = [p[0] - b[0], p[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]], lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]); u = [u[0] / lu, u[1] / lu]; v = [v[0] / lv, v[1] / lv];
          if (k === 'r') { var r = 7; F.appendChild(el('polyline', { points: (b[0] + u[0] * r) + ',' + (b[1] + u[1] * r) + ' ' + (b[0] + u[0] * r + v[0] * r) + ',' + (b[1] + u[1] * r + v[1] * r) + ' ' + (b[0] + v[0] * r) + ',' + (b[1] + v[1] * r), 'class': 'ang' })); return; }
          for (var j = 0; j < k; j++) { var rr = 8 + j * 3.5, cr = u[0] * v[1] - u[1] * v[0];
            F.appendChild(el('path', { d: 'M' + (b[0] + u[0] * rr) + ' ' + (b[1] + u[1] * rr) + ' A' + rr + ' ' + rr + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + (b[0] + v[0] * rr) + ' ' + (b[1] + v[1] * rr), 'class': 'ang' })); } });
      }
      function label(F, p, c, txt) { var dx = p[0] - c[0], dy = p[1] - c[1], n = Math.hypot(dx, dy) || 1; F.appendChild(el('text', { x: p[0] + dx / n * 9, y: p[1] + dy / n * 9 + 4, 'text-anchor': 'middle', 'class': 'nm' }, txt)); }
      function drawFig(q, open) {
        var F = app.el('#mb-fig'), f = q.fig; F.innerHTML = '';
        if (f.P) F.appendChild(el('polygon', { points: pts(f.P), 'class': 'poly' }));
        (f.C || []).forEach(function (c) { F.appendChild(el('circle', { cx: c[0], cy: c[1], r: c[2], 'class': 'shape' })); });
        (f.E || []).forEach(function (c) { F.appendChild(el('ellipse', { cx: c[0], cy: c[1], rx: c[2], ry: c[3], 'class': 'shape' })); });
        (f.L || []).forEach(function (s) { F.appendChild(el('line', { x1: s[0][0], y1: s[0][1], x2: s[1][0], y2: s[1][1], 'class': 'edge' })); });
        (f.Q || []).forEach(function (s) { F.appendChild(el('path', { d: qpath(s), 'class': 'edge' })); });
        if (f.t) ticks(F, f.P, f.t);
        if (f.a) arcs(F, f.P, f.a);
        if (f.M) F.appendChild(el('line', { x1: f.M[0][0], y1: f.M[0][1], x2: f.M[1][0], y2: f.M[1][1], 'class': 'mark' }));
        if (f.MQ) F.appendChild(el('path', { d: qpath(f.MQ), 'class': 'mark' }));
        if (open && q.type === 'diag_cnt') {
          var n = f.P.length, g = el('g', { 'class': 'ask' });
          for (var i = 0; i < n; i++) for (var j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (q.one && i !== (f.v || 0) && j !== (f.v || 0)) continue;
            g.appendChild(el('line', { x1: f.P[i][0], y1: f.P[i][1], x2: f.P[j][0], y2: f.P[j][1] })); }
          F.appendChild(g);
        }
        if (f.P) f.P.forEach(function (p) { F.appendChild(el('circle', { cx: p[0], cy: p[1], r: 2.2, 'class': 'vx' })); });
        if (f.dot) F.appendChild(el('circle', { cx: f.dot[0], cy: f.dot[1], r: 2.6, 'class': 'dot' }));
        if (f.names) { var c0 = cen(f.P); f.names.forEach(function (nm, i) { label(F, f.P[i], c0, nm); }); if (f.dot && f.dotName) label(F, f.dot, c0, f.dotName); }
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#mb-q').textContent = q.prompt;
          app.el('#mb-tag').textContent = q.tag || '';
          drawFig(q, false);
          var P = app.el('#mb-parts'); P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { app.el('#mb').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          drawFig(q, true);
          var P = app.el('#mb-parts'); P.innerHTML = '';
          (q.parts || []).forEach(function (line, i, arr) { var d = document.createElement('div'); d.className = 'prow' + (i === arr.length - 1 ? ' sum' : ''); d.textContent = line; P.appendChild(d); });
          P.style.display = 'flex';
        }
      });
    }
  });
})();
