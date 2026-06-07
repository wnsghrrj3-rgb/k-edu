/* ============================================================================
   케이랩 도구 모듈 — 분수 모형 (fraction) v1
   초점 = "전체를 똑같이 N으로 나눈 것 중 M개가 분수 M/N" 을 눈으로.
     · 모양: 막대(띠) / 원(피자) 토글 — 같은 분수를 두 표상으로.
     · [등분 +/-] 로 분모(나누는 수)를 바꾸면 전체가 즉시 똑같이 다시 나뉜다.
       (← 디지털 우위 핵심. 실물 분수막대는 분모마다 다른 막대를 꺼내야 함.)
     · 조각을 손으로 누르면 색칠/지움. 색칠한 조각 수 = 분자.
     · 항상 큰 분수로 "똑같이 N으로 나눈 것 중 M개 ＝ M/N" 표시.
   교구화 기준("디지털이 실물보다 결정적으로 나은 것만") 만족:
     등분이 즉각·정확(완전 등분)·가역, 색칠 토글이 깨끗·반복 가능.

   - 의존: window.KLab (THREE 불필요, 순수 SVG+DOM)
   - config 예시:
       3학년 분수 도입:   { shape:"bar", denom:4 }
       원으로 등분 보기:   { shape:"circle", denom:6, numer:2 }
       shape   : "bar"(기본) | "circle"  — 시작 모양 (버튼으로 전환 가능)
       denom   : 시작 분모(나누는 수), 기본 4
       numer   : 시작 분자(색칠 수), 기본 0
       maxDenom: 분모 최댓값, 기본 12
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  // 색 (전자칠판에서 또렷하게) — place_value 와 통일된 톤, 채움색만 분수 정체성(청록)
  var C = {
    fill:    '#12B886',   // 색칠한 조각
    fillEdge:'#099268',   // 색칠 조각 외곽
    empty:   'rgba(255,255,255,0.55)', // 빈 조각
    edge:    '#1B6F8C',   // 조각/외곽 구분선
    guide:   '#9AB7D4'    // 등분 안내선
  };

  window.KLab.register('fraction', function (el, config) {
    var maxDenom = (typeof config.maxDenom === 'number' && config.maxDenom >= 2) ? config.maxDenom : 12;
    var denom = (typeof config.denom === 'number' && config.denom >= 1) ? Math.min(config.denom, maxDenom) : 4;
    var shape = (config.shape === 'circle') ? 'circle' : 'bar';

    // 색칠 상태: 길이 denom 의 boolean 배열 (조각별 칠함 여부)
    var filled = makeFilled(denom, (typeof config.numer === 'number') ? config.numer : 0);

    function makeFilled(n, m) {
      var a = [];
      m = Math.max(0, Math.min(m, n));
      for (var i = 0; i < n; i++) a.push(i < m);
      return a;
    }
    function numerCount() {
      var c = 0;
      for (var i = 0; i < filled.length; i++) if (filled[i]) c++;
      return c;
    }

    // ---------- UI 골격 (place_value/shape3d 와 통일: 큰 버튼·Jua·연파랑 스테이지) ----------
    var btnBase = 'font-size:28px;padding:16px 30px;border-radius:16px;border:3px solid #1565C0;'
                + 'cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
                + 'transition:transform .08s,opacity .15s;';

    el.innerHTML =
      '<style>'
      + '.fr-btn:active{transform:translateY(2px);}'
      + '.fr-btn[disabled]{opacity:.4;cursor:not-allowed;}'
      + '.fr-piece{cursor:pointer;transition:fill .18s ease, transform .15s ease;transform-origin:center;}'
      + '.fr-piece:hover{filter:brightness(1.05);}'
      + '.fr-pop{animation:frPop .28s cubic-bezier(.2,1.5,.4,1) both;}'
      + '@keyframes frPop{0%{transform:scale(.82);}100%{transform:scale(1);}}'
      + '</style>'
      + '<div class="fr-controls" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
        + '<button class="fr-btn" data-act="dminus" style="' + btnBase + 'background:#fff;color:#1565C0;">－ 등분</button>'
        + '<button class="fr-btn" data-act="dplus"  style="' + btnBase + 'background:#1565C0;color:#fff;">＋ 등분</button>'
        + '<button class="fr-btn" data-act="shape"  style="' + btnBase + 'background:#fff;color:#0B7285;border-color:#0B7285;">⬭ 모양 바꾸기</button>'
        + '<button class="fr-btn" data-act="reset"  style="font-size:28px;padding:16px 30px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
      + '</div>'
      + '<div class="fr-stage" style="width:100%;height:50vh;min-height:340px;'
        + 'background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);'
        + 'border-radius:20px;overflow:hidden;'
        + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
      + '<div class="fr-status" style="text-align:center;margin-top:14px;font-weight:800;line-height:1.2;'
        + 'font-family:inherit;color:#1B3A57;"></div>';

    var stage    = el.querySelector('.fr-stage');
    var statusEl = el.querySelector('.fr-status');
    var btns = {};
    el.querySelectorAll('.fr-btn').forEach(function (b) { btns[b.dataset.act] = b; });

    // ---------- SVG 헬퍼 ----------
    var VBW = 720, VBH = 380;
    function svgEl(tag, attrs) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }
    // 원 위 각도(deg, 12시=0) → 좌표
    function pt(cx, cy, r, deg) {
      var a = (deg - 90) * Math.PI / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }

    // ---------- 그리기 ----------
    function render(opts) {
      opts = opts || {};
      stage.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });

      if (shape === 'bar') drawBar(svg, opts);
      else drawCircle(svg, opts);

      stage.appendChild(svg);
      bindPieces();
      updateStatus();
      updateButtons();
    }

    function drawBar(svg, opts) {
      var W = 600, H = 150, x0 = (VBW - W) / 2, y0 = (VBH - H) / 2;
      var w = W / denom;
      // 바깥 테두리
      svg.appendChild(svgEl('rect', {
        x: x0, y: y0, width: W, height: H, rx: 12,
        fill: 'none', stroke: C.edge, 'stroke-width': 5
      }));
      for (var i = 0; i < denom; i++) {
        var px = x0 + i * w;
        svg.appendChild(svgEl('rect', {
          x: px, y: y0, width: w, height: H,
          rx: (denom === 1 ? 12 : 0),
          fill: filled[i] ? C.fill : C.empty,
          stroke: C.edge, 'stroke-width': 2.5,
          'data-i': i,
          class: 'fr-piece' + (opts.popIdx === i ? ' fr-pop' : '')
        }));
      }
    }

    function drawCircle(svg, opts) {
      var cx = VBW / 2, cy = VBH / 2, r = 145;
      if (denom === 1) {
        svg.appendChild(svgEl('circle', {
          cx: cx, cy: cy, r: r,
          fill: filled[0] ? C.fill : C.empty,
          stroke: C.edge, 'stroke-width': 5,
          'data-i': 0,
          class: 'fr-piece' + (opts.popIdx === 0 ? ' fr-pop' : '')
        }));
        return;
      }
      var step = 360 / denom;
      for (var i = 0; i < denom; i++) {
        var a0 = i * step, a1 = (i + 1) * step;
        var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
        var large = (step > 180) ? 1 : 0;
        var d = 'M ' + cx + ' ' + cy
              + ' L ' + p0[0] + ' ' + p0[1]
              + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0] + ' ' + p1[1]
              + ' Z';
        svg.appendChild(svgEl('path', {
          d: d,
          fill: filled[i] ? C.fill : C.empty,
          stroke: C.edge, 'stroke-width': 3,
          'data-i': i,
          class: 'fr-piece' + (opts.popIdx === i ? ' fr-pop' : '')
        }));
      }
    }

    // 조각 클릭 = 색칠/지움 토글
    function bindPieces() {
      stage.querySelectorAll('.fr-piece').forEach(function (p) {
        p.addEventListener('click', function () {
          var i = parseInt(p.getAttribute('data-i'), 10);
          filled[i] = !filled[i];
          render({ popIdx: i });
        });
      });
    }

    // ---------- 상태 / 버튼 ----------
    function updateStatus() {
      var m = numerCount(), n = denom;
      // 큰 분수 표기 (분자 / 가로선 / 분모)
      statusEl.innerHTML =
        '<span style="font-size:30px;">똑같이 </span>'
        + '<span style="font-size:40px;color:#1565C0;">' + n + '</span>'
        + '<span style="font-size:30px;">으로 나눈 것 중 </span>'
        + '<span style="font-size:40px;color:#0CA678;">' + m + '</span>'
        + '<span style="font-size:30px;">개 ＝ </span>'
        + '<span style="display:inline-block;vertical-align:middle;text-align:center;line-height:1;">'
          + '<span style="display:block;font-size:44px;color:#0CA678;">' + m + '</span>'
          + '<span style="display:block;height:4px;background:#1B3A57;border-radius:2px;margin:2px 0;"></span>'
          + '<span style="display:block;font-size:44px;color:#1565C0;">' + n + '</span>'
        + '</span>';
    }

    function updateButtons() {
      btns.dplus.disabled  = denom >= maxDenom;
      btns.dminus.disabled = denom <= 1;
    }

    // ---------- 동작 ----------
    // 분모 변경 = 전체를 다시 똑같이 나눔 → 색칠 초기화(개수 매핑이 깨지므로)
    function setDenom(n) {
      n = Math.max(1, Math.min(n, maxDenom));
      if (n === denom) return;
      denom = n;
      filled = makeFilled(denom, 0);
      render({});
    }
    function toggleShape() {
      shape = (shape === 'bar') ? 'circle' : 'bar';
      render({});
    }
    function reset() {
      denom = (typeof config.denom === 'number' && config.denom >= 1) ? Math.min(config.denom, maxDenom) : 4;
      shape = (config.shape === 'circle') ? 'circle' : 'bar';
      filled = makeFilled(denom, (typeof config.numer === 'number') ? config.numer : 0);
      render({});
    }

    btns.dplus.addEventListener('click', function () { setDenom(denom + 1); });
    btns.dminus.addEventListener('click', function () { setDenom(denom - 1); });
    btns.shape.addEventListener('click', toggleShape);
    btns.reset.addEventListener('click', reset);

    render({});

    // ---------- cleanup ----------
    return function cleanup() {
      // 리스너는 stage/el 내부 요소에 붙어 innerHTML 교체 시 함께 제거됨.
      // window 리스너 없음 → 별도 정리 불필요.
    };
  });
})();
