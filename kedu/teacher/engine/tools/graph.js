/* ============================================================================
   케이랩 도구 모듈 — 그래프 메이커 (graph) v2 · 3모드
   초점 (2~6학년 자료와 가능성) = 종이로 못 하는 두 가지:
     ① 그래프 종류 토글 — 똑같은 자료를 막대·꺾은선·그림·원그래프로 즉시 바꿔 본다.
        ("어떤 그래프가 이 자료에 어울릴까"를 눈으로 비교 = 6학년 핵심 학습)
     ② 값 즉시 반영 — 항목 값을 ＋/－로 바꾸면 그래프가 바로 다시 그려진다.
        (실물 모눈종이는 한 칸 틀리면 다시 그려야 함)
   교구화 기준("디지털이 실물보다 결정적으로 나은 것만") 만족.

   v2: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 그래프를 보고 읽기·그래프 고르기.
   - 의존: window.KLab (THREE 불필요, 순수 SVG+DOM)
   - config 예시:
       3학년 막대:   { title:"좋아하는 과일", unit:"명", types:["bar","picto"] }
       6학년 비교:   { types:["bar","line","pie","band"], max:20 }
       자료 지정:    { data:[{label:"봄",value:5},{label:"여름",value:9}], unit:"명" }
       types : 허용 그래프 ["bar"막대 "line"꺾은선 "picto"그림 "pie"원 "band"띠] (기본 bar/line/picto/pie)
       data  : [{label, value, color?}] (기본 = 좋아하는 과일 예시)
       max   : 세로축 최댓값 (기본 10)
       unit  : 값 단위 (기본 "명")
       title : 그래프 제목
       editable : 값 ＋/－ 조절 허용 (기본 true)
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  var PALETTE = ['#1565C0', '#0CA678', '#FF8A3D', '#E64980', '#7048E8', '#F59F00', '#2B8A3E', '#15AABF'];
  var TYPE_LABEL = { bar: '막대그래프', line: '꺾은선그래프', picto: '그림그래프', pie: '원그래프', band: '띠그래프' };

  var DEFAULT_DATA = [
    { label: '사과', value: 6 }, { label: '바나나', value: 4 },
    { label: '포도', value: 8 }, { label: '딸기', value: 3 }
  ];

  window.KLab.register('graph', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var types = (config.types && config.types.length) ? config.types.filter(function (t) { return TYPE_LABEL[t]; }) : ['bar', 'line', 'picto', 'pie'];
    if (!types.length) types = ['bar'];
    var type = types[0];
    var unit = (typeof config.unit === 'string') ? config.unit : '명';
    var title = (typeof config.title === 'string') ? config.title : '';
    var editable = (config.editable === false) ? false : true;
    var max = (typeof config.max === 'number' && config.max > 0) ? config.max : 10;

    function freshData() {
      return (Array.isArray(config.data) && config.data.length ? config.data : DEFAULT_DATA).map(function (d, i) {
        return { label: d.label, value: Math.max(0, Math.min(d.value || 0, max)), color: d.color || PALETTE[i % PALETTE.length] };
      });
    }
    var data = freshData();

    /* ───────────── 미션 ───────────── */
    var MISSIONS = [
      { text: '＋ 버튼으로 <b style="color:#7048E8;">' + (DEFAULT_DATA[0].label) + '</b>를 <b style="color:#7048E8;">10</b>까지 키워 봐요 — 막대가 쑥쑥!',
        check: function () { return type === 'bar' && data[0].value === 10; } },
      { text: '<b style="color:#7048E8;">꺾은선그래프</b>로 바꿔 봐요 — 같은 자료가 다르게 보여요!',
        check: function () { return type === 'line'; } },
      { text: '<b style="color:#7048E8;">' + (DEFAULT_DATA[3].label) + '</b>를 <b style="color:#7048E8;">0</b>으로 줄여 봐요 — 그래프에서 어떻게 보일까요?',
        check: function () { return data[3] && data[3].value === 0; } },
      { text: '<b style="color:#7048E8;">원그래프</b>로 바꿔 전체에 대한 비율을 봐요!',
        check: function () { return type === 'pie'; } }
    ];
    var mStep = 0, mDone = false, mLock = false;
    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      if (MISSIONS[mStep].check()) {
        mLock = true; ui.toast(el, true);
        setTimeout(function () {
          mLock = false; mStep++;
          if (mStep >= MISSIONS.length) mDone = true;
          build();
        }, 1500);
      }
    }

    /* ───────────── 퀴즈 (그래프를 보고 읽기) ───────────── */
    var QUIZ_POOL = [
      { type: 'bar', preset: [6, 4, 8, 3], q: '막대그래프에서 가장 많은 항목은?', answer: '포도', choices: ['포도', '사과', '딸기'] },
      { type: 'bar', preset: [6, 4, 8, 3], q: '사과는 바나나보다 몇 ' + '명' + ' 더 많을까요?', answer: '2명', choices: ['2명', '4명', '6명'] },
      { type: 'pie', preset: [5, 5, 5, 5], q: '원그래프에서 한 항목이 차지하는 비율은?', answer: '25%', choices: ['25%', '50%', '10%'] },
      { type: 'line', preset: [2, 4, 7, 9], q: '시간에 따라 변하는 모습을 보기 좋은 그래프는?', answer: '꺾은선그래프', choices: ['꺾은선그래프', '원그래프', '그림그래프'] },
      { type: 'band', preset: [6, 4, 8, 3], q: '전체에 대한 비율을 가로 띠로 나타낸 이 그래프의 이름은?', answer: '띠그래프', choices: ['띠그래프', '막대그래프', '꺾은선그래프'] }
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = QUIZ_POOL.slice();
      for (var i = qList.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = qList[i]; qList[i] = qList[j]; qList[j] = t; }
      qIdx = 0; qScore = 0; qCount = 0;
    }
    function shuffled(arr) { var c = arr.slice(); for (var i = c.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = c[i]; c[i] = c[j]; c[j] = t; } return c; }
    function applyQuizState(q) {
      data = freshData();
      q.preset.forEach(function (v, i) { if (data[i]) data[i].value = Math.min(v, max); });
      type = q.type;
    }

    // ---------- UI 골격 ----------
    var typeBtn = 'font-size:23px;padding:12px 20px;border-radius:14px;border:3px solid #1565C0;'
                + 'background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    var stage = null, ctrls = null;

    function build() {
      var top = ui.modeTabs(['free', 'mission', 'quiz'], mode), bar = '', foot = '';
      if (mode === 'mission') { bar = mDone ? ui.doneBar() : ui.missionBar(MISSIONS[mStep].text, mStep, MISSIONS.length); }
      else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        applyQuizState(q);
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(shuffled(q.choices).map(function (v) { return { v: v, label: v }; }));
      }
      el.innerHTML =
        '<style>'
        + '.gr-tbtn:active{transform:translateY(2px);}'
        + '.gr-tbtn.gr-on{background:#1565C0 !important;color:#fff !important;}'
        + '.gr-vbtn{font-size:24px;width:46px;height:46px;border-radius:12px;border:3px solid #1565C0;'
          + 'background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;}'
        + '.gr-vbtn:active{transform:translateY(2px);}'
        + '.gr-bar,.gr-slice,.gr-dot{transition:all .25s ease;}'
        + '.kl-choice{min-width:130px !important;}'
        + '</style>'
        + top + bar
        + (mode === 'quiz' ? '' : '<div class="gr-types" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;"></div>')
        + (title && mode !== 'quiz' ? '<div style="text-align:center;font-size:24px;font-weight:800;color:#1B3A57;font-family:inherit;margin-bottom:6px;">' + title + '</div>' : '')
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="gr-stage" style="width:100%;height:' + (mode === 'quiz' ? '38vh' : '46vh') + ';min-height:' + (mode === 'quiz' ? '260' : '300') + 'px;'
          + 'background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);'
          + 'border-radius:20px;overflow:hidden;'
          + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
        + '</div>'
        + foot
        + (editable && mode !== 'quiz' ? '<div class="gr-ctrls" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px;"></div>' : '');

      var typesRow = el.querySelector('.gr-types');
      if (typesRow) {
        typesRow.innerHTML = types.map(function (t) {
          return '<button class="gr-tbtn' + (t === type ? ' gr-on' : '') + '" data-type="' + t + '" style="' + typeBtn + '">' + TYPE_LABEL[t] + '</button>';
        }).join('');
      }

      stage = el.querySelector('.gr-stage');
      ctrls = el.querySelector('.gr-ctrls');

      if (editable && ctrls) {
        ctrls.innerHTML = data.map(function (d, i) {
          return '<div style="display:flex;align-items:center;gap:6px;background:#fff;border-radius:14px;'
            + 'padding:8px 12px;border:2px solid ' + d.color + '55;">'
            + '<span style="width:16px;height:16px;border-radius:5px;background:' + d.color + ';display:inline-block;"></span>'
            + '<span style="font-size:18px;font-weight:800;color:#1B3A57;font-family:inherit;min-width:42px;text-align:center;">' + d.label + '</span>'
            + '<button class="gr-vbtn" data-i="' + i + '" data-d="-1">－</button>'
            + '<span class="gr-val" data-i="' + i + '" style="font-size:24px;font-weight:800;color:' + d.color + ';font-family:inherit;min-width:30px;text-align:center;">' + d.value + '</span>'
            + '<button class="gr-vbtn" data-i="' + i + '" data-d="1">＋</button>'
            + '</div>';
        }).join('');
      }

      ui.bindModeTabs(el, function (m2) {
        mode = m2; mStep = 0; mDone = false; mLock = false;
        data = freshData(); type = types[0];
        if (m2 === 'quiz') shuffleQuiz();
        build();
      });
      bind();
      render();
    }

    // ---------- SVG 헬퍼 ----------
    function svgEl(tag, attrs) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }
    function pt(cx, cy, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function txt(svg, x, y, s, opts) {
      opts = opts || {};
      var t = svgEl('text', {
        x: x, y: y, 'text-anchor': opts.anchor || 'middle',
        'font-family': 'Jua, "Apple SD Gothic Neo", sans-serif',
        'font-size': opts.size || 18, 'font-weight': 800,
        fill: opts.fill || '#1B3A57'
      });
      t.textContent = s; svg.appendChild(t);
    }

    var VBW = 720, VBH = 360;

    // ---------- 그리기 ----------
    function render() {
      if (!stage) return;
      stage.innerHTML = '';
      var svg = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });
      if (type === 'bar') drawAxisGraph(svg, 'bar');
      else if (type === 'line') drawAxisGraph(svg, 'line');
      else if (type === 'picto') drawPicto(svg);
      else if (type === 'pie') drawPie(svg);
      else if (type === 'band') drawBand(svg);
      stage.appendChild(svg);
      // 값 라벨 갱신
      if (ctrls) el.querySelectorAll('.gr-val').forEach(function (s) { s.textContent = data[+s.dataset.i].value; });
    }

    // 막대 / 꺾은선 (공통 축)
    function drawAxisGraph(svg, kind) {
      var padL = 60, padR = 30, padT = 30, padB = 60;
      var plotW = VBW - padL - padR, plotH = VBH - padT - padB;
      var x0 = padL, y0 = padT, yBase = padT + plotH;
      // 세로축 눈금
      var step = max <= 10 ? 1 : (max <= 20 ? 2 : 5);
      for (var v = 0; v <= max; v += step) {
        var gy = yBase - (v / max) * plotH;
        svg.appendChild(svgEl('line', { x1: x0, y1: gy, x2: x0 + plotW, y2: gy, stroke: '#B8CFE8', 'stroke-width': v === 0 ? 3 : 1.5, 'stroke-dasharray': v === 0 ? '' : '4 5' }));
        txt(svg, x0 - 12, gy + 6, v, { anchor: 'end', size: 16, fill: '#5a7894' });
      }
      // 세로축선
      svg.appendChild(svgEl('line', { x1: x0, y1: y0 - 6, x2: x0, y2: yBase, stroke: '#5a7894', 'stroke-width': 3 }));

      var n = data.length, slot = plotW / n;
      var pts = [];
      data.forEach(function (d, i) {
        var cx = x0 + slot * (i + 0.5);
        var h = (d.value / max) * plotH;
        var topY = yBase - h;
        pts.push([cx, topY]);
        if (kind === 'bar') {
          var bw = Math.min(slot * 0.6, 70);
          svg.appendChild(svgEl('rect', { x: cx - bw / 2, y: topY, width: bw, height: h, rx: 7, fill: d.color, stroke: '#ffffff', 'stroke-width': 2, class: 'gr-bar' }));
          if (d.value > 0) txt(svg, cx, topY - 8, d.value, { size: 19, fill: d.color });
        }
        txt(svg, cx, yBase + 26, d.label, { size: 18 });
      });
      if (kind === 'line') {
        // 선
        var dpath = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
        svg.appendChild(svgEl('path', { d: dpath, fill: 'none', stroke: '#1565C0', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
        pts.forEach(function (p, i) {
          svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 8, fill: data[i].color, stroke: '#fff', 'stroke-width': 3, class: 'gr-dot' }));
          if (data[i].value > 0) txt(svg, p[0], p[1] - 16, data[i].value, { size: 18, fill: data[i].color });
        });
      }
    }

    // 그림그래프 (항목별 아이콘 반복, 1개=1)
    function drawPicto(svg) {
      var padL = 90, padT = 30, rowH = (VBH - padT - 20) / data.length;
      var icon = Math.min(rowH * 0.55, 34);
      data.forEach(function (d, i) {
        var cy = padT + rowH * (i + 0.5);
        txt(svg, padL - 14, cy + 6, d.label, { anchor: 'end', size: 18 });
        for (var j = 0; j < d.value; j++) {
          var cx = padL + 8 + j * (icon + 8) + icon / 2;
          svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: icon / 2, fill: d.color, stroke: '#fff', 'stroke-width': 2, class: 'gr-dot' }));
        }
        txt(svg, VBW - 16, cy + 6, d.value + unit, { anchor: 'end', size: 17, fill: d.color });
      });
    }

    // 원그래프
    function drawPie(svg) {
      var cx = VBW / 2 - 70, cy = VBH / 2, r = 130;
      var total = data.reduce(function (s, d) { return s + d.value; }, 0);
      if (total === 0) { txt(svg, cx, cy, '값을 넣어 주세요', { size: 22, fill: '#7a93ac' }); drawLegend(svg, total); return; }
      var acc = 0;
      data.forEach(function (d) {
        if (d.value <= 0) return;
        var a0 = (acc / total) * 360, a1 = ((acc + d.value) / total) * 360;
        acc += d.value;
        var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
        var large = (a1 - a0 > 180) ? 1 : 0;
        if (Math.abs(a1 - a0 - 360) < 0.001) {  // 한 항목이 전체
          svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r, fill: d.color, stroke: '#fff', 'stroke-width': 3, class: 'gr-slice' }));
        } else {
          var dd = 'M ' + cx + ' ' + cy + ' L ' + p0[0] + ' ' + p0[1] + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0] + ' ' + p1[1] + ' Z';
          svg.appendChild(svgEl('path', { d: dd, fill: d.color, stroke: '#fff', 'stroke-width': 3, class: 'gr-slice' }));
        }
        // 퍼센트 라벨
        var mid = pt(cx, cy, r * 0.62, (a0 + a1) / 2);
        var pct = Math.round((d.value / total) * 100);
        if (pct >= 6) txt(svg, mid[0], mid[1] + 6, pct + '%', { size: 18, fill: '#fff' });
      });
      drawLegend(svg, total);
    }
    function drawLegend(svg, total) {
      var lx = VBW - 150, ly = 50;
      data.forEach(function (d, i) {
        var y = ly + i * 36;
        svg.appendChild(svgEl('rect', { x: lx, y: y - 14, width: 22, height: 22, rx: 5, fill: d.color }));
        txt(svg, lx + 32, y + 3, d.label + ' ' + d.value + unit, { anchor: 'start', size: 17 });
      });
    }

    // 띠그래프 (가로 비율 분할)
    function drawBand(svg) {
      var x0 = 50, w = VBW - 100, y0 = VBH / 2 - 40, h = 80;
      var total = data.reduce(function (s, d) { return s + d.value; }, 0);
      svg.appendChild(svgEl('rect', { x: x0, y: y0, width: w, height: h, rx: 8, fill: '#fff', stroke: '#5a7894', 'stroke-width': 2 }));
      if (total === 0) { txt(svg, VBW / 2, y0 + h / 2 + 6, '값을 넣어 주세요', { size: 22, fill: '#7a93ac' }); return; }
      var acc = 0;
      data.forEach(function (d) {
        if (d.value <= 0) return;
        var bx = x0 + (acc / total) * w, bw = (d.value / total) * w;
        acc += d.value;
        svg.appendChild(svgEl('rect', { x: bx, y: y0, width: bw, height: h, fill: d.color, stroke: '#fff', 'stroke-width': 2, class: 'gr-bar' }));
        var pct = Math.round((d.value / total) * 100);
        if (bw > 44) { txt(svg, bx + bw / 2, y0 + h / 2 - 4, d.label, { size: 16, fill: '#fff' }); txt(svg, bx + bw / 2, y0 + h / 2 + 18, pct + '%', { size: 16, fill: '#fff' }); }
      });
    }

    // ---------- 이벤트 ----------
    function bind() {
      el.querySelectorAll('.gr-tbtn').forEach(function (b) {
        b.addEventListener('click', function () {
          type = b.dataset.type;
          el.querySelectorAll('.gr-tbtn').forEach(function (x) { x.classList.toggle('gr-on', x.dataset.type === type); });
          render();
          if (mode === 'mission') checkMission();
        });
      });
      if (ctrls) {
        ctrls.querySelectorAll('.gr-vbtn').forEach(function (b) {
          b.addEventListener('click', function () {
            var i = +b.dataset.i, d = +b.dataset.d;
            data[i].value = Math.max(0, Math.min(data[i].value + d, max));
            render();
            if (mode === 'mission') checkMission();
          });
        });
      }
      el.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (qLock) return; qLock = true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function () {
            qIdx++; if (qIdx >= qList.length) shuffleQuiz();
            qLock = false; build();
          }, 1400);
        });
      });
    }

    shuffleQuiz();
    build();

    return function cleanup() { /* el 내부 리스너만 — innerHTML 교체 시 자동 제거 */ };
  });
})();
