/* ============================================================================
   케이랩 도구 모듈 — 자릿값 수모형 (place_value) v2
   초점 = "10이 되면 한 자리 올라간다"(십진법)를 눈으로 보게 하는 것.
     · 낱개를 텐프레임(2×5)에 하나씩 채운다.
     · 낱개 10칸이 다 차면 [10개 묶기] 버튼이 살아나고(반짝), 누르면
       낱개 10개가 십묶음 막대 하나로 스르륵 변신한다. (← 디지털 우위 핵심)
     · 십묶음을 [묶음 풀기]로 도로 낱개 10개로 풀 수 있다(가역).
     · 항상 큰 글씨로 "10개씩 묶음 N개와 낱개 M개 = 값" 표시.
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 미션 — "10개 채워 묶기", "13 만들기", "묶음 풀어 보기" 등 단계 과제.
     · 퀴즈 — 수모형을 보여 주고 "이 수는 얼마?" 선택지 출제.

   - 의존: window.KLab (THREE 불필요)
   - config 예시:
       4차시 십몇:       { start:12, max:19 }
       5단원 50까지:     { start:24, max:50 }
       start : 처음 보여줄 수 (기본 0)
       max   : 다룰 수 있는 최댓값 (기본 50, 묶음 5개까지)
       mode  : "free" | "mission" | "quiz" (기본 free)
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  var C = {
    tenBar:    '#2B8A3E',
    tenLine:   '#1B5E20',
    one:       '#FF8A3D',
    oneLine:   '#E8590C',
    frame:     '#9AB7D4',
    glow:      '#FFD43B'
  };

  window.KLab.register('place_value', function (el, config) {
    var ui = window.KLab.ui;
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 사다리(표상 전환) ──
       저=묶음 구체물·십 묶기(일상어 닻, 퀴즈 숨김, 두 자리 작게) /
       중=묶음↔숫자 자리값 분해(20+3)·퀴즈 /
       고=10:1 교환=받아올림·내림 강조(자리마다 10배)·퀴즈.
       ※ 12진법 '만약에' 신규 모드는 후속 분리(과학 골든샘플 동일 정책). */
    var GRADES = {
      low:  { modes: ['free', 'mission'],         cap: 29, decompose: false, exchange: false },
      mid:  { modes: ['free', 'mission', 'quiz'], cap: 50, decompose: true,  exchange: false },
      high: { modes: ['free', 'mission', 'quiz'], cap: 99, decompose: true,  exchange: true  }
    };
    var grade = (['low', 'mid', 'high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G() { return GRADES[grade]; }
    function capFor() { return (typeof config.max === 'number' && config.max > 0) ? config.max : G().cap; }

    var max = capFor();
    var start = (typeof config.start === 'number' && config.start >= 0) ? config.start : 0;
    if (start > max) start = max;

    var tens = Math.floor(start / 10);
    var ones = start - tens * 10;
    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';

    var bands = ui.gradeBands({ grade: grade, locked: !!config.grade, onChange: function (g) {
      grade = g;
      max = capFor();
      if (start > max) start = max;
      if (G().modes.indexOf(mode) < 0) mode = 'free';
      mStep = 0; mDone = false; mLock = false; busy = false;
      tens = (mode === 'mission') ? 0 : Math.floor(start / 10);
      ones = (mode === 'mission') ? 0 : start - Math.floor(start / 10) * 10;
      build();
    } });

    // ---------- 미션 (학년칸별 · max에 맞는 것만) ----------
    var LOW_MISSIONS = [
      { need: 10, text: '낱개를 <b style="color:#7048E8;">10개</b> 모아 <b style="color:#2B8A3E;">📦 10개 묶기</b>로 한 묶음(십)을 만들어요!',
        check: function (act) { return act === 'bundle'; } },
      { need: 10, text: '이번엔 <b style="color:#2B8A3E;">묶음 풀기</b>로 묶음을 도로 낱개 10개로 풀어 봐요!',
        check: function (act) { return act === 'unbundle'; } },
      { need: 16, text: '<b style="color:#7048E8;">16</b>을 만들어요 — 십 <b>1묶음</b>과 낱개 <b>6개</b>!',
        check: function () { return tens === 1 && ones === 6; } }
    ];
    var MID_MISSIONS = [
      { need: 13, text: '<b style="color:#7048E8;">13</b>을 만들어 봐요 — 묶음 1개와 낱개 3개! (13 = 10 + 3)',
        check: function () { return tens === 1 && ones === 3; } },
      { need: 24, text: '<b style="color:#7048E8;">24</b>를 만들어요 — 자리값으로 펼치면 20 + 4!',
        check: function () { return tens === 2 && ones === 4; } },
      { need: 30, text: '<b style="color:#7048E8;">30</b>을 만들어요 — 같은 3이지만 여긴 십의 자리, 값은 30!',
        check: function () { return tens === 3 && ones === 0; } }
    ];
    var HIGH_MISSIONS = [
      { need: 10, text: '낱개 <b style="color:#7048E8;">10개</b>를 묶는 순간 = 십 한 묶음으로 <b style="color:#E8590C;">10:1 교환</b>! 직접 묶어 봐요!',
        check: function (act) { return act === 'bundle'; } },
      { need: 31, text: '<b style="color:#7048E8;">31</b>을 만들어 봐요!',
        check: function () { return tens === 3 && ones === 1; } },
      { need: 47, text: '<b style="color:#7048E8;">47</b>을 만들어요 — 십 몇 묶음, 낱개 몇 개? 자리마다 10배인 까닭을 떠올리며!',
        check: function () { return tens === 4 && ones === 7; } }
    ];
    function curMissions() {
      var pool = (grade === 'low') ? LOW_MISSIONS : (grade === 'mid') ? MID_MISSIONS : HIGH_MISSIONS;
      var f = pool.filter(function (m) { return m.need <= max; });
      return f.length ? f : pool.slice(0, 1);
    }
    var mStep = 0, mDone = false, mLock = false;

    // ---------- 퀴즈 ----------
    var qT = 1, qO = 2, qKind = 'value', qScore = 0, qCount = 0, qLock = false;
    function newQuiz() {
      var maxT = Math.min(Math.floor(max / 10), 5);
      qT = (maxT > 0) ? Math.floor(Math.random() * (maxT + 1)) : 0;
      qO = Math.floor(Math.random() * 10);
      if (qT * 10 + qO > max) { qT = Math.max(0, qT - 1); }
      if (qT === 0 && qO < 3) qO = 3 + Math.floor(Math.random() * 7);
      qKind = (Math.random() < 0.6) ? 'value' : 'tens';
      qLock = false;
    }
    function qAnswer() { return qKind === 'value' ? (qT * 10 + qO) : qT; }
    function quizChoices() {
      var ans = qAnswer(), set = {}, out = [ans]; set[ans] = 1;
      var step = (qKind === 'value') ? [10, -10, 1, -1, 9, 11] : [1, -1, 2, -2, 3];
      for (var i = 0; i < step.length && out.length < 4; i++) {
        var d = ans + step[i];
        if (d >= 0 && d <= Math.max(max, 9) && !set[d]) { set[d] = 1; out.push(d); }
      }
      while (out.length < 4) { var r = ans + 1 + Math.floor(Math.random() * 5); if (!set[r]) { set[r] = 1; out.push(r); } }
      out.sort(function (a, b) { return a - b; });
      return out.map(function (v) { return { v: v }; });
    }

    var btnBase = 'font-size:28px;padding:16px 34px;border-radius:16px;border:3px solid #1565C0;'
                + 'cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s,box-shadow .15s,opacity .15s;';
    var stage, statusEl, btns = {}, busy = false;

    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode), bar = '', ctrlRow = '', foot = '';
      var controls =
        '<div class="pv-controls" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
        + '<button class="pv-btn" data-act="plus"  style="' + btnBase + 'background:#1565C0;color:#fff;">＋ 낱개</button>'
        + '<button class="pv-btn" data-act="minus" style="' + btnBase + 'background:#fff;color:#1565C0;">－ 낱개</button>'
        + '<button class="pv-btn" data-act="bundle" style="' + btnBase + 'background:#2B8A3E;color:#fff;border-color:#2B8A3E;">📦 10개 묶기</button>'
        + '<button class="pv-btn" data-act="unbundle" style="' + btnBase + 'background:#fff;color:#2B8A3E;border-color:#2B8A3E;">묶음 풀기</button>'
        + '<button class="pv-btn" data-act="reset" style="font-size:28px;padding:16px 34px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
        + '</div>';
      if (mode === 'mission') { var _M = curMissions(); bar = mDone ? ui.doneBar() : ui.missionBar(_M[mStep].text, mStep, _M.length); ctrlRow = controls; }
      else if (mode === 'quiz') {
        bar = ui.quizBar(qKind === 'value' ? '이 수모형이 나타내는 수는 얼마일까요?' : '10개씩 묶음은 몇 개일까요?', qScore, qCount);
        foot = ui.choices(quizChoices());
      }
      else ctrlRow = controls;

      el.innerHTML =
        '<style>'
        + '.pv-btn:active,.kl-choice:active{transform:translateY(2px);}'
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
        + '.kl-choice:hover{background:#1565C0 !important;color:#fff !important;}'
        + '</style>'
        + top + bar + ctrlRow
        + '<div class="kl-stage-host" style="position:relative;"><div class="pv-stage" style="width:100%;height:' + (mode === 'quiz' ? '44vh' : '50vh') + ';min-height:320px;'
          + 'background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);'
          + 'border-radius:20px;overflow:hidden;'
          + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div></div>'
        + foot
        + '<div class="pv-status" style="text-align:center;margin-top:14px;font-weight:800;line-height:1.3;'
          + 'font-family:inherit;color:#1B3A57;"></div>';

      stage = el.querySelector('.pv-stage');
      statusEl = el.querySelector('.pv-status');
      btns = {};
      el.querySelectorAll('.pv-btn').forEach(function (b) { btns[b.dataset.act] = b; });
      ui.bindModeTabs(el, function (m) {
        mode = m; mStep = 0; mDone = false; busy = false;
        if (m === 'quiz') { qScore = 0; qCount = 0; newQuiz(); }
        else if (m === 'mission') { tens = 0; ones = 0; }
        else { tens = Math.floor(start / 10); ones = start - tens * 10; }
        build();
      });
      bindActions(); bindChoices(); bands.bind(el);
      render({ glow: ones >= 10 });
    }

    // ---------- SVG 그리기 ----------
    var VBW = 860, VBH = 380;
    function svgEl(tag, attrs) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function render(opts) {
      opts = opts || {};
      stage.innerHTML = '';
      var T = (mode === 'quiz') ? qT : tens;
      var O = (mode === 'quiz') ? qO : ones;
      var svg = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });

      var barW = 50, barGap = 14, barH = 280, barTop = 50;
      var barAreaX = 40;
      for (var t = 0; t < T; t++) {
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
        var lbl = svgEl('text', {
          x: bx + barW / 2, y: barTop - 14, 'text-anchor': 'middle',
          'font-family': 'Jua, "Apple SD Gothic Neo", sans-serif',
          'font-size': 30, 'font-weight': 800, fill: C.tenLine
        });
        lbl.textContent = '10';
        g.appendChild(lbl);
        svg.appendChild(g);
      }

      var oneAreaX = barAreaX + Math.max(T, 0) * (barW + barGap) + 30;
      if (T > 0) {
        var divX = oneAreaX - 22;
        svg.appendChild(svgEl('line', {
          x1: divX, y1: barTop - 10, x2: divX, y2: barTop + barH + 10,
          stroke: '#9AB7D4', 'stroke-width': 3, 'stroke-dasharray': '8 8'
        }));
      }

      var framesNeeded = Math.max(1, Math.ceil(O / 10));
      var cell = 50, cellGap = 8;
      var frameW = cell * 2 + cellGap;
      var frameH = cell * 5 + cellGap * 4;
      var frameGap = 26;
      var fTop = barTop + (barH - frameH) / 2;

      for (var f = 0; f < framesNeeded; f++) {
        var fx = oneAreaX + f * (frameW + frameGap);
        var inThisFrame = Math.min(10, O - f * 10);
        var fg = svgEl('g', { class: 'pv-frame' + (inThisFrame === 10 && opts.glow ? ' pv-frameglow' : '') });
        for (var r = 0; r < 5; r++) {
          for (var c = 0; c < 2; c++) {
            var idxInFrame = r * 2 + c;
            var cx = fx + c * (cell + cellGap);
            var cy = fTop + r * (cell + cellGap);
            fg.appendChild(svgEl('rect', {
              x: cx, y: cy, width: cell, height: cell, rx: 9,
              fill: 'rgba(255,255,255,0.45)', stroke: C.frame,
              'stroke-width': 2.5, 'stroke-dasharray': '5 5',
              class: 'pv-fcell'
            }));
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
      checkMission(opts.act);
    }

    function value() { return tens * 10 + ones; }

    function updateStatus() {
      if (mode === 'quiz') {
        statusEl.innerHTML = '<span style="font-size:26px;color:#5a7894;">아래에서 답을 골라 누르세요</span>';
        return;
      }
      var v = value();
      var html =
        '<span style="font-size:30px;">10개씩 묶음 </span>'
        + '<span style="font-size:40px;color:#2B8A3E;">' + tens + '개</span>'
        + '<span style="font-size:30px;"> 와 낱개 </span>'
        + '<span style="font-size:40px;color:#E8590C;">' + ones + '개</span>'
        + '<span style="font-size:30px;"> ＝ </span>'
        + '<span style="font-size:52px;color:#1565C0;">' + v + '</span>';
      // 중·고: 자리값 분해 표현(20 + 3)
      if (G().decompose && tens > 0) {
        html += '<div style="font-size:27px;margin-top:6px;color:#5a7894;font-weight:800;">'
          + '<span style="color:#2B8A3E;">' + (tens * 10) + '</span> ＋ '
          + '<span style="color:#E8590C;">' + ones + '</span> ＝ '
          + '<span style="color:#1565C0;">' + v + '</span></div>';
      }
      // 고: 10:1 교환(받아올림) 강조
      if (G().exchange && ones >= 10) {
        html += '<div style="font-size:24px;margin-top:4px;color:#7048E8;font-weight:800;">'
          + '🔁 낱개 10개 = 십 1묶음 — <span style="color:#1565C0;">10 : 1</span>로 바꿔요!</div>';
      }
      statusEl.innerHTML = html;
    }

    function updateButtons() {
      if (!btns.plus) return;
      var v = value();
      btns.plus.disabled = busy || v >= max;
      btns.minus.disabled = busy || ones <= 0;
      btns.bundle.disabled = busy || ones < 10;
      btns.unbundle.disabled = busy || tens < 1;
      btns.reset.disabled = busy;
      if (!busy && ones >= 10) btns.bundle.classList.add('pv-ready');
      else btns.bundle.classList.remove('pv-ready');
    }

    function checkMission(act) {
      if (mode !== 'mission' || mDone || mLock) return;
      var _M = curMissions();
      if (_M[mStep].check(act)) {
        mLock = true;
        ui.toast(el, true);
        setTimeout(function () {
          mLock = false;
          if (mStep < curMissions().length - 1) { mStep++; tens = 0; ones = 0; }
          else mDone = true;
          build();
        }, 1500);
      }
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
      render({ suckFrame: 0, glow: false });
      setTimeout(function () {
        tens += 1;
        ones -= 10;
        busy = false;
        render({ newBar: tens - 1, glow: ones >= 10, act: 'bundle' });
      }, 430);
    }
    function unbundle() {
      if (busy || tens < 1) return;
      busy = true;
      updateButtons();
      tens -= 1;
      ones += 10;
      render({ glow: ones >= 10, act: 'unbundle' });
      busy = false;
      updateButtons();
    }
    function reset() {
      if (busy) return;
      tens = (mode === 'mission') ? 0 : Math.floor(start / 10);
      ones = (mode === 'mission') ? 0 : start - Math.floor(start / 10) * 10;
      render({ glow: ones >= 10 });
    }

    function bindActions() {
      if (!btns.plus) return;
      btns.plus.addEventListener('click', plus);
      btns.minus.addEventListener('click', minus);
      btns.bundle.addEventListener('click', bundle);
      btns.unbundle.addEventListener('click', unbundle);
      btns.reset.addEventListener('click', reset);
    }

    function bindChoices() {
      el.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (qLock) return; qLock = true;
          var ok = (+b.dataset.v === qAnswer());
          qCount++; if (ok) qScore++;
          ui.toast(el, ok, ok ? null : ('🤔 정답은 ' + qAnswer() + '!'));
          b.style.background = ok ? '#12B886' : '#FF8A3D'; b.style.color = '#fff'; b.style.borderColor = ok ? '#12B886' : '#FF8A3D';
          setTimeout(function () { newQuiz(); build(); }, 1500);
        });
      });
    }

    if (mode === 'quiz') newQuiz();
    if (mode === 'mission') { tens = 0; ones = 0; }
    build();

    return function cleanup() {};
  });
})();
