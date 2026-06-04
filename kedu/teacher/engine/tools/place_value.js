/* ============================================================================
   케이랩 도구 모듈 — 자릿값 수모형 (place_value) v1
   초점 = "10이 되면 한 자리 올라간다"(십진법)를 눈으로 보게 하는 것.
     · 낱개를 텐프레임(2×5)에 하나씩 채운다.
     · 낱개 10칸이 다 차면 [10개 묶기] 버튼이 살아나고(반짝), 누르면
       낱개 10개가 십묶음 막대 하나로 스르륵 변신한다. (← 디지털 우위 핵심)
     · 십묶음을 [묶음 풀기]로 도로 낱개 10개로 풀 수 있다(가역).
     · 항상 큰 글씨로 "10개씩 묶음 N개와 낱개 M개 = 값" 표시.
   실물 연결모형은 손으로 끼우고 빼야 하지만, 여기선 묶고 푸는 게
   즉각·깨끗·반복 가능 — 그래서 교구화 기준("디지털이 실물보다 결정적으로
   나은 것만")을 만족한다.

   - 의존: window.KLab (THREE 불필요)
   - config 예시:
       4차시 십몇:       { start:12, max:19 }
       5단원 50까지:     { start:24, max:50 }
       start : 처음 보여줄 수 (기본 0)
       max   : 다룰 수 있는 최댓값 (기본 50, 묶음 5개까지)
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  // 색 (전자칠판에서 또렷하게)
  var C = {
    tenBar:    '#2B8A3E',   // 십묶음 막대 채움
    tenLine:   '#1B5E20',   // 막대 칸 구분선/외곽
    one:       '#FF8A3D',   // 낱개 큐브
    oneLine:   '#E8590C',   // 낱개 외곽
    frame:     '#9AB7D4',   // 텐프레임 칸 점선
    glow:      '#FFD43B'    // 10칸 다 찼을 때 강조
  };

  window.KLab.register('place_value', function (el, config) {
    var max   = (typeof config.max === 'number' && config.max > 0) ? config.max : 50;
    var start = (typeof config.start === 'number' && config.start >= 0) ? config.start : 0;
    if (start > max) start = max;

    var tens = Math.floor(start / 10);
    var ones = start - tens * 10;

    // ---------- UI 골격 (shape3d와 통일된 큰 버튼·큰 글씨) ----------
    var btnBase = 'font-size:28px;padding:16px 34px;border-radius:16px;border:3px solid #1565C0;'
                + 'cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s,box-shadow .15s,opacity .15s;';

    el.innerHTML =
      '<style>'
      + '.pv-btn:active{transform:translateY(2px);}'
      + '.pv-btn[disabled]{opacity:.4;cursor:not-allowed;}'
      + '.pv-btn.pv-ready{animation:pvPulse 1s ease-in-out infinite;box-shadow:0 0 0 0 rgba(255,212,59,.7);}'
      + '@keyframes pvPulse{0%{box-shadow:0 0 0 0 rgba(255,212,59,.75);}70%{box-shadow:0 0 0 16px rgba(255,212,59,0);}100%{box-shadow:0 0 0 0 rgba(255,212,59,0);}}'
      + '.pv-cell{transition:transform .25s ease, opacity .25s ease;transform-origin:center;}'
      + '.pv-pop{animation:pvPop .32s cubic-bezier(.2,1.5,.4,1) both;}'
      + '@keyframes pvPop{0%{transform:scale(0);}100%{transform:scale(1);}}'
      + '.pv-bar{transition:opacity .3s ease;}'
      + '.pv-bar-pop{animation:pvBarPop .4s cubic-bezier(.2,1.4,.4,1) both;transform-origin:bottom center;}'
      + '@keyframes pvBarPop{0%{transform:scaleY(0);opacity:0;}100%{transform:scaleY(1);opacity:1;}}'
      + '.pv-suck{animation:pvSuck .42s ease-in both;}'
      + '@keyframes pvSuck{0%{transform:scale(1);opacity:1;}100%{transform:scale(.2) translateY(-30px);opacity:0;}}'
      + '.pv-frameglow rect.pv-fcell{stroke:' + C.glow + ';stroke-width:4;}'
      + '</style>'
      + '<div class="pv-controls" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
        + '<button class="pv-btn" data-act="plus"  style="' + btnBase + 'background:#1565C0;color:#fff;">＋ 낱개</button>'
        + '<button class="pv-btn" data-act="minus" style="' + btnBase + 'background:#fff;color:#1565C0;">－ 낱개</button>'
        + '<button class="pv-btn" data-act="bundle" style="' + btnBase + 'background:#2B8A3E;color:#fff;border-color:#2B8A3E;">📦 10개 묶기</button>'
        + '<button class="pv-btn" data-act="unbundle" style="' + btnBase + 'background:#fff;color:#2B8A3E;border-color:#2B8A3E;">묶음 풀기</button>'
        + '<button class="pv-btn" data-act="reset" style="font-size:28px;padding:16px 34px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
      + '</div>'
      + '<div class="pv-stage" style="width:100%;height:50vh;min-height:340px;'
        + 'background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);'
        + 'border-radius:20px;overflow:hidden;'
        + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
      + '<div class="pv-status" style="text-align:center;margin-top:14px;font-weight:800;line-height:1.3;'
        + 'font-family:inherit;color:#1B3A57;"></div>';

    var stage  = el.querySelector('.pv-stage');
    var statusEl = el.querySelector('.pv-status');
    var btns = {};
    el.querySelectorAll('.pv-btn').forEach(function (b) { btns[b.dataset.act] = b; });

    var busy = false;   // 애니메이션 중 입력 잠금

    // ---------- SVG 그리기 ----------
    // 레이아웃: [십묶음 막대들] + [＝ 또는 묶음/낱개 구분] + [낱개 텐프레임들]
    var VBW = 860, VBH = 380;

    function svgEl(tag, attrs) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function render(opts) {
      opts = opts || {};
      stage.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });

      // ----- 십묶음 막대 영역 -----
      var barW = 50, barGap = 14, barH = 280, barTop = 50;
      var barAreaX = 40;
      // 막대: 세로 직사각형 + 내부 10칸 가로 구분선 + 위 "10" 라벨
      for (var t = 0; t < tens; t++) {
        var bx = barAreaX + t * (barW + barGap);
        var g = svgEl('g', { class: 'pv-bar' + (opts.newBar === t ? ' pv-bar-pop' : '') });
        g.appendChild(svgEl('rect', {
          x: bx, y: barTop, width: barW, height: barH, rx: 8,
          fill: C.tenBar, stroke: C.tenLine, 'stroke-width': 4
        }));
        for (var seg = 1; seg < 10; seg++) {
          var ly = barTop + (barH / 10) * seg;
          g.appendChild(svgEl('line', {
            x1: bx, y1: ly, x2: bx + barW, y2: ly,
            stroke: C.tenLine, 'stroke-width': 2, 'stroke-opacity': 0.55
          }));
        }
        // "10" 라벨
        var lbl = svgEl('text', {
          x: bx + barW / 2, y: barTop - 14, 'text-anchor': 'middle',
          'font-family': 'Jua, "Apple SD Gothic Neo", sans-serif',
          'font-size': 30, 'font-weight': 800, fill: C.tenLine
        });
        lbl.textContent = '10';
        g.appendChild(lbl);
        svg.appendChild(g);
      }

      // 막대가 하나라도 있으면 막대영역과 낱개영역 사이 구분 점선 + 라벨
      var oneAreaX = barAreaX + Math.max(tens, 0) * (barW + barGap) + 30;
      if (tens > 0) {
        var divX = oneAreaX - 22;
        svg.appendChild(svgEl('line', {
          x1: divX, y1: barTop - 10, x2: divX, y2: barTop + barH + 10,
          stroke: '#9AB7D4', 'stroke-width': 3, 'stroke-dasharray': '8 8'
        }));
      }

      // ----- 낱개 텐프레임 영역 -----
      // 필요한 프레임 수 = 최소 1개, ones가 10 넘으면 추가
      var framesNeeded = Math.max(1, Math.ceil(ones / 10));
      var cell = 50, cellGap = 8;
      var frameW = cell * 2 + cellGap;        // 2열
      var frameH = cell * 5 + cellGap * 4;     // 5행
      var frameGap = 26;
      var fTop = barTop + (barH - frameH) / 2;  // 막대와 세로 중앙 맞춤

      var oneIdx = 0;  // 채워진 낱개 카운트
      for (var f = 0; f < framesNeeded; f++) {
        var fx = oneAreaX + f * (frameW + frameGap);
        var inThisFrame = Math.min(10, ones - f * 10);
        var fg = svgEl('g', { class: 'pv-frame' + (inThisFrame === 10 && opts.glow ? ' pv-frameglow' : '') });
        // 10칸 (2열 × 5행)
        for (var r = 0; r < 5; r++) {
          for (var c = 0; c < 2; c++) {
            var idxInFrame = r * 2 + c;
            var cx = fx + c * (cell + cellGap);
            var cy = fTop + r * (cell + cellGap);
            // 빈 칸 (점선 테두리)
            fg.appendChild(svgEl('rect', {
              x: cx, y: cy, width: cell, height: cell, rx: 9,
              fill: 'rgba(255,255,255,0.45)', stroke: C.frame,
              'stroke-width': 2.5, 'stroke-dasharray': '5 5',
              class: 'pv-fcell'
            }));
            // 채워진 낱개 큐브
            if (idxInFrame < inThisFrame) {
              var filled = (f * 10 + idxInFrame);
              var isNew = (opts.newOne != null && filled === opts.newOne);
              var isSuck = (opts.suckFrame === f);
              var cubeCls = 'pv-cell' + (isNew ? ' pv-pop' : '') + (isSuck ? ' pv-suck' : '');
              fg.appendChild(svgEl('rect', {
                x: cx + 4, y: cy + 4, width: cell - 8, height: cell - 8, rx: 7,
                fill: C.one, stroke: C.oneLine, 'stroke-width': 3,
                class: cubeCls
              }));
            }
          }
        }
        svg.appendChild(fg);
      }

      stage.appendChild(svg);
      updateStatus();
      updateButtons();
    }

    function value() { return tens * 10 + ones; }

    function updateStatus() {
      var v = value();
      statusEl.innerHTML =
        '<span style="font-size:30px;">10개씩 묶음 </span>'
        + '<span style="font-size:40px;color:#2B8A3E;">' + tens + '개</span>'
        + '<span style="font-size:30px;"> 와 낱개 </span>'
        + '<span style="font-size:40px;color:#E8590C;">' + ones + '개</span>'
        + '<span style="font-size:30px;"> ＝ </span>'
        + '<span style="font-size:52px;color:#1565C0;">' + v + '</span>';
    }

    function updateButtons() {
      var v = value();
      btns.plus.disabled = busy || v >= max;
      btns.minus.disabled = busy || ones <= 0;
      btns.bundle.disabled = busy || ones < 10;
      btns.unbundle.disabled = busy || tens < 1;
      btns.reset.disabled = busy;
      // 10칸 다 찼으면 묶기 버튼 반짝
      if (!busy && ones >= 10) btns.bundle.classList.add('pv-ready');
      else btns.bundle.classList.remove('pv-ready');
    }

    // ---------- 동작 ----------
    function plus() {
      if (busy || value() >= max) return;
      ones += 1;
      render({ newOne: ones - 1, glow: ones >= 10 });
    }
    function minus() {
      if (busy || ones <= 0) return;
      ones -= 1;
      render({ glow: ones >= 10 });
    }
    function bundle() {
      if (busy || ones < 10) return;
      busy = true;
      updateButtons();
      // 첫 프레임의 낱개 10개가 막대로 빨려들어가는 연출
      render({ suckFrame: 0, glow: false });
      setTimeout(function () {
        tens += 1;
        ones -= 10;
        busy = false;
        render({ newBar: tens - 1, glow: ones >= 10 });
      }, 430);
    }
    function unbundle() {
      if (busy || tens < 1) return;
      busy = true;
      updateButtons();
      tens -= 1;
      ones += 10;
      // 새로 생긴 낱개 10개를 pop으로 (마지막 프레임)
      render({ glow: ones >= 10 });
      // 살짝 pop 강조: 방금 푼 낱개 10칸에 pop
      busy = false;
      updateButtons();
    }
    function reset() {
      if (busy) return;
      tens = Math.floor(start / 10);
      ones = start - tens * 10;
      render({ glow: ones >= 10 });
    }

    btns.plus.addEventListener('click', plus);
    btns.minus.addEventListener('click', minus);
    btns.bundle.addEventListener('click', bundle);
    btns.unbundle.addEventListener('click', unbundle);
    btns.reset.addEventListener('click', reset);

    render({ glow: ones >= 10 });

    // ---------- cleanup ----------
    return function cleanup() {
      // 리스너는 el 내부 요소에 붙어 있어 innerHTML 교체 시 함께 제거됨.
      // window 리스너 없음. 별도 정리 불필요.
    };
  });
})();
