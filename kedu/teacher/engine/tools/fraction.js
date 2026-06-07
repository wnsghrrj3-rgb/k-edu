/* ============================================================================
   케이랩 도구 모듈 — 분수 모형 (fraction) v2
   v2 초점 = 완성도(근사함). 전자칠판에 띄웠을 때 또렷하고 크고 깔끔하게.
     · 큰 도형 + 시원한 여백 + 부드러운 그림자(입체감) + 또렷한 흰 경계.
     · 표현 3종 토글: 막대(띠) / 원(피자) / 격자(초콜릿) — 같은 분수를 세 표상으로.
     · [등분 ＋/－]로 분모를 바꾸면 전체가 즉시 똑같이 다시 나뉜다(← 디지털 우위).
     · 조각을 누르면 부드럽게 색칠/지움. 색칠 수 = 분자.
     · 우측 큰 분수 표기 패널 + "한 조각 = 단위분수" 안내.
   v1 대비: 크기·입체감·디테일·표현 다양성 전면 강화. 로직(등분/색칠)은 동일.

   - 의존: window.KLab (THREE 불필요, 순수 SVG+DOM)
   - config: { shape:"bar"|"circle"|"grid", denom(기본4), numer(기본0), maxDenom(기본12) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  var C = {
    fillTop: '#38D9A9',  // 채운 조각 (밝은 청록 — 위)
    fill:    '#12B886',  // 채운 조각 (아래)
    fillEdge:'#0B7A5C',
    empty:   '#E7F1FB',  // 빈 조각
    emptyEdge:'#B8CFE8',
    seam:    '#FFFFFF',  // 조각 사이 흰 경계
    num:     '#0CA678',  // 분자 색
    den:     '#1565C0'   // 분모 색
  };

  function bestCols(n) {          // 격자: sqrt(n)에 가장 가까운 약수 → 완전 직사각형
    var best = 1, t = Math.sqrt(n);
    for (var c = 1; c <= n; c++) if (n % c === 0 && Math.abs(c - t) < Math.abs(best - t)) best = c;
    return best;
  }

  window.KLab.register('fraction', function (el, config) {
    var maxDenom = (typeof config.maxDenom === 'number' && config.maxDenom >= 2) ? config.maxDenom : 12;
    var denom = (typeof config.denom === 'number' && config.denom >= 1) ? Math.min(config.denom, maxDenom) : 4;
    var shape = (['bar','circle','grid'].indexOf(config.shape) >= 0) ? config.shape : 'bar';
    var filled = makeFilled(denom, (typeof config.numer === 'number') ? config.numer : 0);

    function makeFilled(n, m) { var a = []; m = Math.max(0, Math.min(m, n)); for (var i = 0; i < n; i++) a.push(i < m); return a; }
    function numerCount() { var c = 0; for (var i = 0; i < filled.length; i++) if (filled[i]) c++; return c; }

    var btnBase = 'font-size:27px;padding:15px 28px;border-radius:18px;border:3px solid #1565C0;'
                + 'cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s,opacity .15s;';
    var shapeBtn = 'font-size:25px;padding:14px 20px;border-radius:18px;border:3px solid #0B7285;'
                + 'background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    el.innerHTML =
      '<style>'
      + '.fr-btn:active,.fr-sbtn:active{transform:translateY(2px);}'
      + '.fr-btn[disabled]{opacity:.35;cursor:not-allowed;}'
      + '.fr-sbtn.fr-on{background:#0B7285 !important;color:#fff !important;}'
      + '.fr-piece{cursor:pointer;transition:fill-opacity .25s ease, transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
      + '.fr-piece:hover{transform:scale(1.04);}'
      + '.fr-pop{animation:frPop .32s cubic-bezier(.2,1.6,.4,1) both;}'
      + '@keyframes frPop{0%{transform:scale(.7);}60%{transform:scale(1.08);}100%{transform:scale(1);}}'
      + '</style>'
      + '<div style="display:flex;gap:11px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + '<button class="fr-btn" data-act="dminus" style="' + btnBase + 'background:#fff;color:#1565C0;">－ 등분</button>'
        + '<button class="fr-btn" data-act="dplus"  style="' + btnBase + 'background:#1565C0;color:#fff;">＋ 등분</button>'
        + '<span style="width:14px;"></span>'
        + '<button class="fr-sbtn fr-btn" data-shape="bar"    style="' + shapeBtn + '">▭ 막대</button>'
        + '<button class="fr-sbtn fr-btn" data-shape="circle" style="' + shapeBtn + '">◔ 원</button>'
        + '<button class="fr-sbtn fr-btn" data-shape="grid"   style="' + shapeBtn + '">▦ 격자</button>'
        + '<span style="width:14px;"></span>'
        + '<button class="fr-btn" data-act="reset" style="font-size:27px;padding:15px 24px;border-radius:18px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      + '</div>'
      + '<div class="fr-stage" style="width:100%;height:58vh;min-height:400px;'
        + 'background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);'
        + 'border-radius:26px;overflow:hidden;'
        + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>';

    var stage = el.querySelector('.fr-stage');
    el.querySelectorAll('.fr-sbtn').forEach(function (b) { b.classList.toggle('fr-on', b.dataset.shape === shape); });

    function svgEl(tag, attrs) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
    function pt(cx, cy, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }

    var VBW = 940, VBH = 480;
    var SHAPE_X = 40, SHAPE_W = 580;          // 도형 영역(좌)
    var PANEL_X = 660;                          // 분수 패널(우)

    function defs(svg) {
      var d = svgEl('defs', {});
      d.innerHTML =
        '<filter id="frSh" x="-25%" y="-25%" width="150%" height="160%">'
        + '<feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#13315C" flood-opacity="0.20"/></filter>'
        + '<linearGradient id="frFill" x1="0" y1="0" x2="0" y2="1">'
        + '<stop offset="0" stop-color="' + C.fillTop + '"/><stop offset="1" stop-color="' + C.fill + '"/></linearGradient>';
      svg.appendChild(d);
    }
    function pieceFill(on) { return on ? 'url(#frFill)' : C.empty; }
    function pieceEdge(on) { return on ? C.fillEdge : C.emptyEdge; }

    function render(opts) {
      opts = opts || {};
      stage.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });
      defs(svg);
      if (shape === 'bar') drawBar(svg, opts);
      else if (shape === 'circle') drawCircle(svg, opts);
      else drawGrid(svg, opts);
      drawPanel(svg);
      stage.appendChild(svg);
      bindPieces();
      updateButtons();
    }

    function drawBar(svg, opts) {
      var W = SHAPE_W, H = 230, x0 = SHAPE_X + 20, y0 = (VBH - H) / 2;
      var w = W / denom;
      var group = svgEl('g', { filter: 'url(#frSh)' });
      for (var i = 0; i < denom; i++) {
        group.appendChild(svgEl('rect', {
          x: x0 + i * w, y: y0, width: w, height: H,
          rx: (denom === 1 ? 22 : 6),
          fill: pieceFill(filled[i]), stroke: C.seam, 'stroke-width': 6,
          'data-i': i, class: 'fr-piece' + (opts.popIdx === i ? ' fr-pop' : '')
        }));
        // 채운 칸 윗면 하이라이트
        if (filled[i]) group.appendChild(svgEl('rect', { x: x0 + i * w + 8, y: y0 + 7, width: w - 16, height: 16, rx: 7, fill: '#FFFFFF', 'fill-opacity': 0.28, 'pointer-events': 'none' }));
      }
      group.appendChild(svgEl('rect', { x: x0, y: y0, width: W, height: H, rx: 22, fill: 'none', stroke: C.fillEdge, 'stroke-width': 5, 'pointer-events': 'none' }));
      svg.appendChild(group);
    }

    function drawCircle(svg, opts) {
      var cx = SHAPE_X + SHAPE_W / 2, cy = VBH / 2, r = 175;
      var group = svgEl('g', { filter: 'url(#frSh)' });
      if (denom === 1) {
        group.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r, fill: pieceFill(filled[0]), stroke: C.seam, 'stroke-width': 6, 'data-i': 0, class: 'fr-piece' + (opts.popIdx === 0 ? ' fr-pop' : '') }));
      } else {
        var step = 360 / denom;
        for (var i = 0; i < denom; i++) {
          var p0 = pt(cx, cy, r, i * step), p1 = pt(cx, cy, r, (i + 1) * step);
          var large = (step > 180) ? 1 : 0;
          var d = 'M ' + cx + ' ' + cy + ' L ' + p0[0] + ' ' + p0[1] + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0] + ' ' + p1[1] + ' Z';
          group.appendChild(svgEl('path', { d: d, fill: pieceFill(filled[i]), stroke: C.seam, 'stroke-width': 5, 'data-i': i, class: 'fr-piece' + (opts.popIdx === i ? ' fr-pop' : '') }));
        }
      }
      group.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: C.fillEdge, 'stroke-width': 5, 'pointer-events': 'none' }));
      svg.appendChild(group);
    }

    function drawGrid(svg, opts) {
      var cols = bestCols(denom), rows = Math.ceil(denom / cols);
      var maxW = SHAPE_W, maxH = 300, gap = 8;
      var cw = (maxW - gap * (cols - 1)) / cols, ch = (maxH - gap * (rows - 1)) / rows;
      var cell = Math.min(cw, ch, 120);
      var gw = cell * cols + gap * (cols - 1), gh = cell * rows + gap * (rows - 1);
      var x0 = SHAPE_X + (SHAPE_W - gw) / 2, y0 = (VBH - gh) / 2;
      var group = svgEl('g', { filter: 'url(#frSh)' });
      for (var i = 0; i < denom; i++) {
        var r = Math.floor(i / cols), c = i % cols;
        group.appendChild(svgEl('rect', {
          x: x0 + c * (cell + gap), y: y0 + r * (cell + gap), width: cell, height: cell, rx: 12,
          fill: pieceFill(filled[i]), stroke: pieceEdge(filled[i]), 'stroke-width': 4,
          'data-i': i, class: 'fr-piece' + (opts.popIdx === i ? ' fr-pop' : '')
        }));
        if (filled[i]) group.appendChild(svgEl('rect', { x: x0 + c * (cell + gap) + 9, y: y0 + r * (cell + gap) + 8, width: cell - 18, height: 13, rx: 6, fill: '#fff', 'fill-opacity': 0.3, 'pointer-events': 'none' }));
      }
      svg.appendChild(group);
    }

    function drawPanel(svg) {
      var m = numerCount(), n = denom, cx = PANEL_X + 120;
      // 큰 분수 (분자 / 가로선 / 분모)
      var t1 = svgEl('text', { x: cx, y: 150, 'text-anchor': 'middle', 'font-family': 'Jua, sans-serif', 'font-size': 130, 'font-weight': 800, fill: C.num }); t1.textContent = m; svg.appendChild(t1);
      svg.appendChild(svgEl('rect', { x: cx - 95, y: 175, width: 190, height: 11, rx: 5, fill: '#1B3A57' }));
      var t2 = svgEl('text', { x: cx, y: 320, 'text-anchor': 'middle', 'font-family': 'Jua, sans-serif', 'font-size': 130, 'font-weight': 800, fill: C.den }); t2.textContent = n; svg.appendChild(t2);
      // 설명
      function line(y, s, size, fill) { var t = svgEl('text', { x: cx, y: y, 'text-anchor': 'middle', 'font-family': 'Jua, sans-serif', 'font-size': size, 'font-weight': 800, fill: fill }); t.textContent = s; svg.appendChild(t); }
      line(375, '똑같이 ' + n + '로 나눈 것 중 ' + m + '개', 26, '#1B3A57');
      line(415, '한 조각 = 1/' + n + ' (단위분수)', 22, '#5a7894');
    }

    function bindPieces() {
      stage.querySelectorAll('.fr-piece').forEach(function (p) {
        p.addEventListener('click', function () { var i = +p.getAttribute('data-i'); filled[i] = !filled[i]; render({ popIdx: i }); });
      });
    }
    function updateButtons() {
      el.querySelector('[data-act="dplus"]').disabled = denom >= maxDenom;
      el.querySelector('[data-act="dminus"]').disabled = denom <= 1;
    }
    function setDenom(n) { n = Math.max(1, Math.min(n, maxDenom)); if (n === denom) return; denom = n; filled = makeFilled(denom, 0); render({}); }
    function setShape(s) { shape = s; el.querySelectorAll('.fr-sbtn').forEach(function (b) { b.classList.toggle('fr-on', b.dataset.shape === s); }); render({}); }
    function reset() {
      denom = (typeof config.denom === 'number' && config.denom >= 1) ? Math.min(config.denom, maxDenom) : 4;
      shape = (['bar','circle','grid'].indexOf(config.shape) >= 0) ? config.shape : 'bar';
      filled = makeFilled(denom, (typeof config.numer === 'number') ? config.numer : 0);
      el.querySelectorAll('.fr-sbtn').forEach(function (b) { b.classList.toggle('fr-on', b.dataset.shape === shape); });
      render({});
    }

    el.querySelector('[data-act="dplus"]').addEventListener('click', function () { setDenom(denom + 1); });
    el.querySelector('[data-act="dminus"]').addEventListener('click', function () { setDenom(denom - 1); });
    el.querySelector('[data-act="reset"]').addEventListener('click', reset);
    el.querySelectorAll('.fr-sbtn').forEach(function (b) { b.addEventListener('click', function () { setShape(b.dataset.shape); }); });

    render({});
    return function cleanup() { /* el 내부 리스너만 — innerHTML 교체 시 자동 제거 */ };
  });
})();
