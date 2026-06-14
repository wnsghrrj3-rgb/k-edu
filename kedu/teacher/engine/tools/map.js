/* ============================================================================
   케이랩 도구 모듈 — 지도 읽기 (map) v1  [사회 · 3학년 · 지리 인식 · 3모드]
   3학년 우리 고장의 모습. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 같은 고장을 [🏙 실제 모습] ↔ [🗺 지도(기호)]로 한 번에 토글 —
                "지도는 실제 모습을 약속된 기호로 간단·정확히 나타낸 것"을 눈으로 체감.
     ▸ 방위표(나침반) 상시 표시 — 위쪽 = 북. 8방위.
     ▸ 건물을 누르면 이름·기호·"학교에서 보면 어느 쪽" 방위까지 한 번에.
     ▸ 실제 모습엔 그림(이모지)·결이 있는 땅, 지도엔 깔끔한 격자·기호 마커.
   미션 4단계(방위 찾기 · 기호 읽기 · 방위 찾기 · 실제↔지도 잇기) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", view:"real"|"map" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('map', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free', 'mission', 'quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var C = { ink: '#1B3A57', sub: '#5a7894', blue: '#1565C0', vio: '#7048E8', good: '#12B886', red: '#E03131', land: '#EAF6E6' };
    var btn = 'font-size:21px;padding:11px 17px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', t); for (var k in a) e.setAttribute(k, a[k]); return e; }

    // 방위 8개 — 학교 기준. 한글 라벨/반대 방위.
    var DIR = { N: '북', S: '남', E: '동', W: '서', NE: '북동', NW: '북서', SE: '남동', SW: '남서' };

    // 건물 — viewBox 700x460. 학교를 한가운데(C) 두고 8방위에 하나씩.
    // emo = 실제 모습 그림, mk = 지도 마커 색, role = 기호 종류
    var PLACE = {
      school:   { nm: '학교',   emo: '🏫', x: 350, y: 232, dir: 'C',  col: '#1565C0', desc: '함께 공부하고 뛰노는 곳' },
      hospital: { nm: '병원',   emo: '🏥', x: 350, y: 96,  dir: 'N',  col: '#E03131', desc: '아픈 사람을 치료해 주는 곳', cross: true },
      market:   { nm: '시장',   emo: '🏪', x: 606, y: 232, dir: 'E',  col: '#F08C00', desc: '여러 가지 물건을 사고파는 곳' },
      park:     { nm: '공원',   emo: '🌳', x: 350, y: 372, dir: 'S',  col: '#37B24D', desc: '나무와 쉴 곳이 있는 곳' },
      library:  { nm: '도서관', emo: '📚', x: 96,  y: 232, dir: 'W',  col: '#7048E8', desc: '책을 읽고 빌리는 곳' },
      fire:     { nm: '소방서', emo: '🚒', x: 566, y: 116, dir: 'NE', col: '#F03E3E', desc: '불을 끄고 사람을 구하는 곳' },
      police:   { nm: '경찰서', emo: '🚓', x: 134, y: 116, dir: 'NW', col: '#1971C2', desc: '안전을 지켜 주는 곳' },
      post:     { nm: '우체국', emo: '🏤', x: 566, y: 350, dir: 'SE', col: '#E8590C', desc: '편지와 택배를 보내는 곳' },
      station:  { nm: '기차역', emo: '🚉', x: 134, y: 350, dir: 'SW', col: '#0B7285', desc: '기차를 타고 내리는 곳' }
    };
    function placeKeys() { return ['school', 'hospital', 'market', 'park', 'library', 'fire', 'police', 'post', 'station']; }

    var view, sel, showLeg;
    function reset() { view = (config.view === 'map') ? 'map' : 'real'; sel = ''; showLeg = true; }
    reset();

    function setView(v) { view = v; renderScene(); renderStatus(); if (mode === 'mission') checkMission(); }
    function pickPlace(k) { sel = k; renderScene(); renderStatus(); if (mode === 'mission') checkMission(); }

    /* ───────────── 미션 ───────────── */
    var MISSIONS = [
      { text: '🧭 지도에서 <b>위쪽은 북쪽</b>이에요. 학교에서 <b style="color:#7048E8;">남쪽</b>에 있는 곳을 찾아 눌러요!',
        check: function () { return sel && PLACE[sel].dir === 'S'; } },
      { text: '🗺 <b>지도</b>로 바꾼 뒤, 병원을 나타내는 기호 <b style="color:#E03131;">✚</b>를 찾아 눌러요!',
        check: function () { return view === 'map' && sel === 'hospital'; } },
      { text: '➡️ 학교에서 <b style="color:#7048E8;">동쪽</b>에 있는 곳을 찾아 눌러요!',
        check: function () { return sel && PLACE[sel].dir === 'E'; } },
      { text: '🏙 <b>실제 모습</b>으로 바꿔 봐요 — 지도와 똑같은 곳을 가리켜요! <b style="color:#7048E8;">도서관</b>을 찾아 눌러요.',
        check: function () { return view === 'real' && sel === 'library'; } }
    ];
    var mStep = 0, mDone = false, mLock = false;
    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      if (MISSIONS[mStep].check()) {
        mLock = true; ui.toast(el, true);
        setTimeout(function () {
          mLock = false;
          if (mStep < MISSIONS.length - 1) {
            mStep++; sel = '';
            if (mStep === 1) { view = 'map'; }    // 기호 읽기 단계로 — 지도 보기 유도
            if (mStep === 3) { view = 'map'; }    // 실제로 '바꾸는' 동작을 경험하도록 지도에서 출발
          } else mDone = true;
          build();
        }, 1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ = [
      { q: '지도에서 <b>위쪽</b>은 어느 방위일까요?', ch: ['북쪽', '남쪽', '동쪽'], a: 0 },
      { q: '병원을 나타내는 지도 기호는 무엇일까요?', ch: ['✚ (빨간 십자)', '▲ (세모)', '〰 (물결)'], a: 0 },
      { q: '지도는 실제 모습을 무엇으로 간단하게 나타낸 것일까요?', ch: ['약속된 기호', '사진 그대로', '글로 길게'], a: 0 },
      { q: '학교에서 시장이 <b>동쪽</b>에 있어요. 그러면 시장에서 보면 학교는 어느 쪽일까요?', ch: ['서쪽', '동쪽', '남쪽'], a: 0 },
      { q: '지도에서 <b>▲</b> 기호는 무엇을 나타낼까요?', ch: ['산', '강', '학교'], a: 0 }
    ];
    var qIdx = 0, qScore = 0, qCount = 0, qLock = false, qUsed = [];
    function newQuiz() {
      if (qUsed.length >= QUIZ.length) qUsed = [];
      var cand = []; for (var i = 0; i < QUIZ.length; i++) if (qUsed.indexOf(i) < 0) cand.push(i);
      qIdx = cand[Math.floor(Math.random() * cand.length)]; qUsed.push(qIdx); qLock = false;
    }
    function quizChoices() {
      var q = QUIZ[qIdx], idx = [0, 1, 2].sort(function () { return Math.random() - 0.5; });
      return idx.map(function (i) { return { v: i, label: '<span style="font-size:19px;">' + q.ch[i] + '</span>' }; });
    }

    /* ───────────── UI ───────────── */
    function viewTabs() {
      return '<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + '<button class="mp-view" data-view="real" style="' + btn + (view === 'real' ? 'background:#1565C0;color:#fff;' : 'background:#fff;color:#1565C0;') + '">🏙 실제 모습</button>'
        + '<button class="mp-view" data-view="map" style="' + btn + (view === 'map' ? 'background:#1565C0;color:#fff;' : 'background:#fff;color:#1565C0;') + '">🗺 지도(기호)</button>'
        + '<span style="width:8px;"></span>'
        + '<button class="mp-btn" data-act="leg" style="' + btn + (showLeg ? 'background:#F1F3F5;color:#444;border-color:#aab;' : 'background:#fff;color:#888;border-color:#cbd5e1;') + '">🏷 범례</button>'
        + '</div>';
    }
    function build() {
      var top = ui.modeTabs(['free', 'mission', 'quiz'], mode), bar = '', body = '', foot = '';
      if (mode === 'mission') { bar = mDone ? ui.doneBar() : ui.missionBar(MISSIONS[mStep].text, mStep, MISSIONS.length); body = viewTabs(); }
      else if (mode === 'quiz') { bar = ui.quizBar(QUIZ[qIdx].q, qScore, qCount); foot = ui.choices(quizChoices()); }
      else body = viewTabs();
      el.innerHTML = '<style>.mp-btn:active,.mp-view:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.mp-place{cursor:pointer;}</style>'
        + top + bar + body
        + '<div class="kl-stage-host" style="position:relative;"><div class="mp-stage" style="width:100%;height:' + (mode === 'quiz' ? '36vh' : '46vh') + ';min-height:' + (mode === 'quiz' ? '260' : '330') + 'px;border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        + '<div class="mp-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el, function (m) {
        mode = m; mStep = 0; mDone = false; mLock = false; reset();
        if (m === 'quiz') { qScore = 0; qCount = 0; qUsed = []; newQuiz(); }
        build();
      });
      drawStage(); bind(); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage() {
      stage = el.querySelector('.mp-stage'); stage.innerHTML = '';
      svg = svgEl('svg', { viewBox: '0 0 700 460', width: '100%', height: '100%', style: 'max-height:46vh;display:block;margin:0 auto;' });
      stage.appendChild(svg);
    }
    // 방위표(나침반) — 위쪽=북. 항상 표시.
    function compass(g) {
      var cx = 648, cy = 60, r = 34;
      g.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r, fill: '#ffffff', stroke: '#1B3A57', 'stroke-width': 3, opacity: 0.96 }));
      // 북쪽 화살표
      var ar = svgEl('path', { d: 'M ' + cx + ' ' + (cy - r + 5) + ' L ' + (cx - 7) + ' ' + (cy + 2) + ' L ' + (cx + 7) + ' ' + (cy + 2) + ' z', fill: '#E03131' });
      g.appendChild(ar);
      g.appendChild(svgEl('path', { d: 'M ' + cx + ' ' + (cy + r - 5) + ' L ' + (cx - 7) + ' ' + (cy - 2) + ' L ' + (cx + 7) + ' ' + (cy - 2) + ' z', fill: '#C9D7E6' }));
      var lab = [['북', cx, cy - r - 3, '#E03131'], ['남', cx, cy + r + 14, '#5a7894'], ['동', cx + r + 11, cy + 5, '#5a7894'], ['서', cx - r - 11, cy + 5, '#5a7894']];
      lab.forEach(function (L) {
        var t = svgEl('text', { x: L[1], y: L[2], 'text-anchor': 'middle', 'font-family': 'Jua,sans-serif', 'font-size': 17, 'font-weight': 800, fill: L[3] });
        t.textContent = L[0]; g.appendChild(t);
      });
    }
    // 길(도로) — 가운데 +자 + 모서리로 가는 길
    function roads(g, mapView) {
      var col = mapView ? '#CED4DA' : '#D7C9A8', w = mapView ? 16 : 22;
      [['M 350 30 L 350 430'], ['M 60 232 L 640 232'],
       ['M 350 232 L 134 116'], ['M 350 232 L 566 116'], ['M 350 232 L 134 350'], ['M 350 232 L 566 350']
      ].forEach(function (d) { g.appendChild(svgEl('path', { d: d[0], stroke: col, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' })); });
      if (mapView) {
        [['M 350 30 L 350 430'], ['M 60 232 L 640 232']].forEach(function (d) {
          g.appendChild(svgEl('path', { d: d[0], stroke: '#fff', 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '10 12' }));
        });
      }
    }
    // 산·강 — 실제/지도 기호 대비
    function terrain(g, mapView) {
      // 강(하천): 왼쪽 아래 → 오른쪽 아래로 흐름
      var dRiver = 'M -10 440 Q 150 400 260 440 T 520 432 T 720 446';
      g.appendChild(svgEl('path', { d: dRiver, stroke: mapView ? '#74C0FC' : '#4DABF7', 'stroke-width': mapView ? 9 : 20, fill: 'none', 'stroke-linecap': 'round', opacity: mapView ? 1 : 0.85 }));
      // 산: 왼쪽 위 모서리
      if (mapView) {
        [[58, 70], [92, 70]].forEach(function (p) {
          g.appendChild(svgEl('path', { d: 'M ' + p[0] + ' ' + p[1] + ' l -16 26 l 32 0 z', fill: '#A98467', stroke: '#7F5539', 'stroke-width': 2 }));
        });
        var ts = svgEl('text', { x: 75, y: 112, 'text-anchor': 'middle', 'font-family': 'Jua,sans-serif', 'font-size': 14, 'font-weight': 800, fill: '#7F5539' }); ts.textContent = '산'; g.appendChild(ts);
        var tr = svgEl('text', { x: 130, y: 432, 'text-anchor': 'middle', 'font-family': 'Jua,sans-serif', 'font-size': 14, 'font-weight': 800, fill: '#1971C2' }); tr.textContent = '강'; g.appendChild(tr);
      } else {
        var mt = svgEl('text', { x: 75, y: 92, 'text-anchor': 'middle', 'font-size': 46 }); mt.textContent = '🏔'; g.appendChild(mt);
      }
    }
    function renderScene() {
      if (!svg) return;
      svg.innerHTML = '';
      var mapView = (view === 'map');
      // 바탕
      svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 700, height: 460, fill: mapView ? '#F1F3F5' : '#EAF6E6' }));
      var g = svgEl('g', {});
      if (mapView) {
        // 격자
        for (var gx = 0; gx <= 700; gx += 50) g.appendChild(svgEl('line', { x1: gx, y1: 0, x2: gx, y2: 460, stroke: '#E3E8EE', 'stroke-width': 1 }));
        for (var gy = 0; gy <= 460; gy += 50) g.appendChild(svgEl('line', { x1: 0, y1: gy, x2: 700, y2: gy, stroke: '#E3E8EE', 'stroke-width': 1 }));
      } else {
        // 땅 무늬(연한 점)
        for (var i = 0; i < 5; i++) g.appendChild(svgEl('circle', { cx: 70 + i * 150, cy: 200, r: 3, fill: '#CDEBC5' }));
      }
      terrain(g, mapView);
      roads(g, mapView);

      // 건물
      placeKeys().forEach(function (k) {
        var p = PLACE[k], on = (sel === k);
        if (mapView) {
          // 지도 = 약속된 기호(마커)
          g.appendChild(svgEl('circle', { cx: p.x, cy: p.y, r: 24, fill: on ? '#fff' : p.col, stroke: p.col, 'stroke-width': on ? 5 : 3, class: 'mp-place', 'data-k': k }));
          if (p.cross) {
            // 병원 ✚ 기호
            g.appendChild(svgEl('rect', { x: p.x - 3.5, y: p.y - 12, width: 7, height: 24, fill: on ? p.col : '#fff', 'pointer-events': 'none' }));
            g.appendChild(svgEl('rect', { x: p.x - 12, y: p.y - 3.5, width: 24, height: 7, fill: on ? p.col : '#fff', 'pointer-events': 'none' }));
          } else {
            var sy = svgEl('text', { x: p.x, y: p.y + 7, 'text-anchor': 'middle', 'font-size': 22, 'pointer-events': 'none' });
            sy.textContent = p.emo; g.appendChild(sy);
          }
          var lab = svgEl('text', { x: p.x, y: p.y + 42, 'text-anchor': 'middle', 'font-family': 'Jua,sans-serif', 'font-size': 16, 'font-weight': 800, fill: on ? p.col : '#1B3A57', 'pointer-events': 'none' });
          lab.textContent = p.nm; g.appendChild(lab);
        } else {
          // 실제 모습 = 그림
          if (on) g.appendChild(svgEl('circle', { cx: p.x, cy: p.y, r: 30, fill: 'none', stroke: '#FF8A3D', 'stroke-width': 4 }));
          var em = svgEl('text', { x: p.x, y: p.y + 14, 'text-anchor': 'middle', 'font-size': 40, class: 'mp-place', 'data-k': k });
          em.textContent = p.emo; g.appendChild(em);
          var lab2 = svgEl('text', { x: p.x, y: p.y + 42, 'text-anchor': 'middle', 'font-family': 'Jua,sans-serif', 'font-size': 15, 'font-weight': 800, fill: '#2B6A3E', 'pointer-events': 'none' });
          lab2.textContent = p.nm; g.appendChild(lab2);
        }
      });

      compass(g);
      if (showLeg) legend(g, mapView);
      svg.appendChild(g);
      svg.querySelectorAll('.mp-place').forEach(function (n) { n.addEventListener('click', function () { pickPlace(n.dataset.k); }); });
    }
    function legend(g, mapView) {
      var items = mapView
        ? [['✚', '병원', '#E03131'], ['▲', '산', '#7F5539'], ['〰', '강', '#1971C2'], ['🗺', '기호로 간단히', '#1565C0']]
        : [['🏙', '실제 모습', '#2B6A3E'], ['🏔', '산', '#7F5539'], ['💧', '강', '#1971C2'], ['🧭', '위=북쪽', '#E03131']];
      var bx = 14, by = 312, bw = 168, bh = 132;
      g.appendChild(svgEl('rect', { x: bx, y: by, width: bw, height: bh, rx: 14, fill: '#ffffff', stroke: '#C9D7E6', 'stroke-width': 2, opacity: 0.95 }));
      var ti = svgEl('text', { x: bx + 12, y: by + 24, 'font-family': 'Jua,sans-serif', 'font-size': 15, 'font-weight': 800, fill: '#1B3A57' }); ti.textContent = '🏷 범례'; g.appendChild(ti);
      items.forEach(function (it, i) {
        var yy = by + 48 + i * 21;
        var s = svgEl('text', { x: bx + 16, y: yy, 'text-anchor': 'middle', 'font-size': 16, fill: it[2], 'font-family': 'Jua,sans-serif', 'font-weight': 800 }); s.textContent = it[0]; g.appendChild(s);
        var t = svgEl('text', { x: bx + 34, y: yy, 'font-family': 'Jua,sans-serif', 'font-size': 14, 'font-weight': 800, fill: '#3a516a' }); t.textContent = it[1]; g.appendChild(t);
      });
    }
    function renderStatus() {
      var st = el.querySelector('.mp-status'); if (!st) return;
      if (mode === 'quiz') { st.innerHTML = '<div style="font-size:19px;color:#8aa0b6;">방위표(위=북)와 기호를 떠올리며 답을 골라요!</div>'; return; }
      if (sel) {
        var p = PLACE[sel];
        var dirTxt = (p.dir === 'C') ? '고장의 한가운데에 있어요' : '학교에서 보면 <b>' + DIR[p.dir] + '쪽</b>에 있어요';
        var symTxt = p.cross ? '✚' : (view === 'map' ? p.emo : p.emo);
        st.innerHTML = '<div style="font-size:23px;color:' + p.col + ';">' + p.emo + ' ' + p.nm + '</div>'
          + '<div style="font-size:17px;color:' + C.sub + ';margin-top:4px;">' + p.desc + '</div>'
          + '<div style="font-size:16px;color:' + C.ink + ';margin-top:4px;">지도 기호 ' + symTxt + ' · ' + dirTxt + '</div>';
        return;
      }
      st.innerHTML = '<div style="font-size:20px;color:' + C.ink + ';">' + (view === 'real' ? '🏙 우리 고장의 실제 모습' : '🗺 우리 고장 지도') + '</div>'
        + '<div style="font-size:17px;color:' + C.sub + ';margin-top:4px;">건물을 눌러 이름·기호·방위를 봐요. <b>🏙 실제 모습</b>과 <b>🗺 지도</b>를 번갈아 보면, 지도는 실제를 <b>약속된 기호</b>로 간단·정확히 나타낸 거예요. 오른쪽 위 방위표에서 <b style="color:#E03131;">위쪽이 북</b>!</div>';
    }

    function bind() {
      el.querySelectorAll('.mp-view').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
      var lb = el.querySelector('[data-act="leg"]');
      if (lb) lb.addEventListener('click', function () { showLeg = !showLeg; build(); });
      el.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (qLock) return; qLock = true;
          var q = QUIZ[qIdx], ok = (+b.dataset.v === q.a);
          qCount++; if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function () { newQuiz(); build(); }, 1500);
        });
      });
    }

    newQuiz();
    build();
    return function cleanup() {};
  });
})();
