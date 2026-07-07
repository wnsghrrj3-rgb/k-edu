/* ============================================================================
   케이랩 도구 모듈 — 시장 놀이 (market) v1 · 3모드   [사회 · 경제생활]
   초점 = 보드게임처럼 라운드를 돌리며 "시장"을 손으로 이해.
     · 학생 = 과일 가게 상인. 매 라운드 상황 카드가 뜨고(수요·공급 변동),
       가격을 직접 정해 팔고, 이익(동전)을 모은다.
     · 수요(손님)·공급(물건)을 곡선이 아니라 아이콘 수로 보여 줘 초등 직관 우선.
     · 가격을 올리면 손님이 줄고, 내리면 몰리되 이익이 얇아진다 — 직접 체감.
     · 물가 상승(인플레이션) = "용돈이 풀림" 카드가 누적되면 적정가가 위로.
   실물 시장 놀이는 준비물·시간이 큰데 여기선 즉시 여러 판 — 교구화 기준.
   3모드: 자유탐구(직접 조작·상황 뽑기) / 미션4(생각형 가격 판단) / 퀴즈5(경제 어휘).
   - 의존: window.KLab (THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('market', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes:['free','mission'],        infl:false, quiz:false, missionN:2 },
      mid:  { modes:['free','mission','quiz'], infl:true,  quiz:true,  missionN:3 },
      high: { modes:['free','mission','quiz'], infl:true,  quiz:true,  missionN:4 }
    };
    var grade = (['low','mid','high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';

    var bands = ui.gradeBands({grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false;
      demand=5; supply=5; infl=1.0; price=100; last=null; sit=null; sold0=false; coins=0;
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    /* ── 경제 모델 (초등 직관용 단순화) ──
       적정가 fair = BASE × (손님/물건) × 물가
       팔리는 손님 want = 손님 × (fair / 가격)   → 가격↑이면 손님↓, 가격↓이면 손님↑
       판매량 sold = min(물건, want)              → 손님이 물건보다 많으면 품절
       이익 profit = 판매량 × (가격 − 원가)        → 너무 싸면 많이 팔려도 이익 얇음 */
    var BASE = 100, COST = 40, PMIN = 10, PMAX = 320, PSTEP = 10;
    var demand = 5, supply = 5, infl = 1.0, price = 100;
    var coins = 0, round = 1, last = null, sit = null, sold0 = false;

    function fairPrice() {
      var f = BASE * (demand / supply) * infl;
      return Math.max(PMIN, Math.round(f / PSTEP) * PSTEP);
    }
    function wantAt(p) { return demand * (fairPrice() / p); }
    function soldAt(p) { return Math.max(0, Math.min(supply, Math.round(wantAt(p)))); }
    function profitAt(p) { return soldAt(p) * (p - COST); }

    /* ── 상황 카드 (수요·공급·물가 변동) ── */
    var SITS = [
      { ic: '☀️', t: '사과 풍년!', ds: '햇빛이 좋아 사과가 잔뜩 열렸어요.', dd: 0, dsup: 3, di: 0, why: '물건이 많아졌어요 (공급 늘어남)' },
      { ic: '🌧️', t: '가뭄 흉작', ds: '비가 안 와서 사과가 적게 열렸어요.', dd: 0, dsup: -3, di: 0, why: '물건이 귀해졌어요 (공급 줄어듦)' },
      { ic: '🎉', t: '마을 축제!', ds: '축제라서 사람들이 북적북적 모였어요.', dd: 3, dsup: 0, di: 0, why: '손님이 많아졌어요 (수요 늘어남)' },
      { ic: '🥶', t: '추운 날', ds: '날이 추워 거리에 손님이 뜸해요.', dd: -3, dsup: 0, di: 0, why: '손님이 줄었어요 (수요 줄어듦)' },
      { ic: '🏪', t: '옆 가게 등장', ds: '옆 가게도 사과를 잔뜩 들여왔어요.', dd: 0, dsup: 3, di: 0, why: '경쟁! 사과가 흔해졌어요' },
      { ic: '💰', t: '용돈이 풀렸어요', ds: '마을에 돈이 많이 풀려 다들 지갑이 두둑!', dd: 2, dsup: 0, di: 0.15, why: '물가가 슬슬 올라요 (인플레이션)' }
    ];
    function drawSit(s) {
      sit = s;
      demand = Math.max(1, Math.min(10, 5 + s.dd));
      supply = Math.max(1, Math.min(10, 5 + s.dsup));
      infl = Math.round((infl + s.di) * 100) / 100;
      price = fairPrice(); last = null; sold0 = false;
    }
    function randomSit() { var pool = availSits(); return pool[Math.floor(Math.random() * pool.length)]; }
    function availSits() { return G().infl ? SITS : SITS.filter(function (s) { return s.di === 0; }); } // 인플레이션(물가) 카드는 중·고만

    /* ───────────── 미션 (생각형 — 가격 판단) ───────────── */
    // 각 미션 = 상황을 깔고, "가격을 어떻게?" 3선택지(올린다/내린다/그대로) 중 고르기
    var MTASK = [
      { setup: SITS[2], q: '🎉 축제라 손님이 북적여요! 사과는 그대로인데 사려는 사람이 많아요. 가격을 어떻게 할까요?',
        ch: ['값을 올린다', '값을 내린다', '그대로 둔다'], a: 0, why: '손님이 물건보다 많으면 올려도 다 팔려요. 비싸게 팔수록 이익이 커져요!' },
      { setup: SITS[0], q: '☀️ 풍년이라 사과가 넘쳐요! 손님은 그대로인데 물건이 많아요. 가격을 어떻게 할까요?',
        ch: ['값을 올린다', '값을 내린다', '그대로 둔다'], a: 1, why: '물건이 흔하면 값을 내려야 손님이 많이 사 가요. 안 그러면 사과가 남아요!' },
      { setup: SITS[1], q: '🌧️ 가뭄으로 사과가 귀해졌어요! 손님은 많은데 물건이 적어요. 가격을 어떻게 할까요?',
        ch: ['값을 올린다', '값을 내린다', '그대로 둔다'], a: 0, why: '귀한 물건은 값이 올라가요. 적은 물건을 비싸게 팔면 이익이 커져요!' },
      { setup: SITS[5], q: '💰 마을에 용돈이 잔뜩 풀려 다들 지갑이 두둑해요! 가격을 어떻게 할까요?',
        ch: ['값을 올린다', '값을 내린다', '그대로 둔다'], a: 0, why: '돈이 많이 풀리면 물가가 올라요. 올려도 손님이 척척 사 가죠 — 이게 인플레이션!' }
    ];
    function curMissions() { return MTASK.slice(0, G().missionN); }
    var mStep = 0, mDone = false;

    /* ───────────── 퀴즈 (경제 어휘·상황 판단) ───────────── */
    var QUIZ_POOL = [
      { q: '손님이 많아지고 물건은 그대로면, 가격은 어떻게 될까요?', a: '올라가요', ch: ['올라가요', '내려가요', '그대로예요'] },
      { q: '물건이 흔해지고 손님은 그대로면, 가격은 어떻게 될까요?', a: '내려가요', ch: ['내려가요', '올라가요', '그대로예요'] },
      { q: '흉년이 들어 물건이 귀해지면, 가격은 어떻게 될까요?', a: '올라가요', ch: ['올라가요', '내려가요', '그대로예요'] },
      { q: '마을에 돈이 아주 많이 풀리면, 물가는 어떻게 될까요?', a: '올라가요', ch: ['올라가요', '내려가요', '그대로예요'] },
      { q: '물건은 그대로인데 손님이 줄어들면, 가격은 어떻게 될까요?', a: '내려가요', ch: ['내려가요', '올라가요', '그대로예요'] }
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffle(a) { var c = a.slice(); for (var i = c.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = c[i]; c[i] = c[j]; c[j] = t; } return c; }
    // 중학년 = 기본 3문(손님↑·물건↑·손님↓), 고학년 = 전체 5문(흉년·물가 포함)
    function quizPool() { return (grade === 'mid') ? [QUIZ_POOL[0], QUIZ_POOL[1], QUIZ_POOL[4]] : QUIZ_POOL; }
    function shuffleQuiz() { qList = shuffle(quizPool()); qIdx = 0; qScore = 0; qCount = 0; }

    /* ───────────── 빌드 ───────────── */
    var btn = 'font-size:23px;padding:12px 22px;border-radius:16px;border:3px solid #12B886;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var cardBtn = 'font-size:18px;padding:11px 15px;border-radius:14px;border:3px solid #F59F00;background:#fff;color:#B25E00;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.25;';

    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode), bar = '', ctrl = '', foot = '';

      if (mode === 'mission') {
        var M = curMissions();
        if (!mDone) { drawSit(M[mStep].setup); }
        bar = mDone ? ui.doneBar() : ui.missionBar(M[mStep].q, mStep, M.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(shuffle(q.ch).map(function (v) { return { v: v, label: v }; }));
      } else {
        // 자유탐구: 상황 카드 뽑기 줄 (인플레이션 카드는 학년칸으로 게이팅)
        ctrl = '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          + availSits().map(function (s) { var i = SITS.indexOf(s); return '<button class="mk-sit" data-i="' + i + '" style="' + cardBtn + '">' + s.ic + ' ' + s.t + '</button>'; }).join('')
          + '</div>';
      }

      // 가격 슬라이더 + 팔기 버튼 (자유탐구 전용 — 미션은 생각 선택지로만 판단)
      if (mode === 'free') {
        ctrl += '<div class="mk-pricebox" style="background:#F8FbF8;border:3px solid #12B886;border-radius:18px;padding:13px 16px;margin-bottom:10px;">'
          + '<div style="text-align:center;margin-bottom:6px;"><span style="font-size:19px;font-weight:800;color:#0B7A5C;">💲 가격을 정해요</span></div>'
          + '<div class="mk-track" style="position:relative;height:18px;border-radius:10px;margin:6px 8px 2px;"></div>'
          + '<input class="mk-price" type="range" min="' + PMIN + '" max="' + PMAX + '" step="' + PSTEP + '" value="' + price + '" '
          + 'style="width:100%;height:30px;cursor:pointer;accent-color:#12B886;">'
          + '<div class="mk-preview" style="text-align:center;margin-top:4px;font-weight:800;font-family:inherit;"></div>'
          + '<div style="text-align:center;margin-top:8px;">'
          + '<button class="mk-sell" style="' + btn + 'background:#12B886;color:#fff;">🛒 팔기!</button>'
          + (mode === 'free' ? '<button class="mk-next" style="' + btn + 'background:#fff;color:#12B886;margin-left:8px;">다음 손님 ▶</button>' : '')
          + '</div></div>';
      }

      el.innerHTML = '<style>.mk-sit:active,.mk-sell:active,.mk-next:active{transform:translateY(2px);}.kl-choice{min-width:150px !important;}</style>'
        + top + bar + ctrl
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="mk-stage" style="width:100%;height:' + (mode === 'quiz' ? '30vh' : '40vh') + ';min-height:' + (mode === 'quiz' ? '210' : '300') + 'px;'
        + 'background:radial-gradient(120% 120% at 30% 0%,#FFFDF6 0%,#FFF3D6 70%,#FFE9B8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(245,159,0,0.14);"></div>'
        + '</div>' + foot;

      // 모드 탭
      ui.bindModeTabs(el, function (m2) {
        mode = m2; mStep = 0; mDone = false;
        demand = 5; supply = 5; infl = 1.0; price = 100; last = null; sit = null; sold0 = false;
        if (m2 === 'quiz') shuffleQuiz();
        if (m2 === 'free') coins = 0;
        build();
      });
      bands.bind(el);

      // 상황 카드
      el.querySelectorAll('.mk-sit').forEach(function (b) {
        b.addEventListener('click', function () { drawSit(SITS[+b.dataset.i]); rebuildPrice(); render(); });
      });
      // 슬라이더
      var pr = el.querySelector('.mk-price');
      if (pr) pr.addEventListener('input', function () { price = +pr.value; render(); });
      // 팔기
      var sb = el.querySelector('.mk-sell');
      if (sb) sb.addEventListener('click', sell);
      // 다음 손님 (자유탐구)
      var nb = el.querySelector('.mk-next');
      if (nb) nb.addEventListener('click', function () { round++; drawSit(randomSit()); rebuildPrice(); render(); ui.toast(el, true, '새 손님이 왔어요! 👀'); });
      // 퀴즈 선택지
      el.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (qLock) return; qLock = true; qCount++;
          var q = qList[qIdx], ok = (b.dataset.v === q.a); if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function () { qIdx++; if (qIdx >= qList.length) shuffleQuiz(); qLock = false; build(); }, 1400);
        });
      });

      render();
    }

    // 슬라이더 value만 갱신(상황 바뀐 뒤 적정가로 리셋용)
    function rebuildPrice() { var pr = el.querySelector('.mk-price'); if (pr) pr.value = price; }

    /* ───────────── 팔기 (정산) ───────────── */
    function sell() {
      var s = soldAt(price), p = profitAt(price);
      last = { sold: s, profit: p, price: price, left: supply - s };
      coins += p; sold0 = true;
      ui.toast(el, p > 0, p > 0 ? '🪙 ' + p + '원 벌었어요!' : (p < 0 ? '앗, 원가보다 싸게 팔았어요…' : '한 개도 못 팔았어요 😢'));
      render();
    }

    /* ───────────── 미션 생각 선택지 (정답 시 다음 단계) ───────────── */
    function mountThink() {
      if (mode !== 'mission' || mDone) return;
      var MS = curMissions();
      var m = MS[mStep];
      var box = document.createElement('div');
      box.className = 'mk-think';
      box.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:12px 10px 4px;';
      var idx = shuffle([0, 1, 2]);
      box.innerHTML = ui.choices(idx.map(function (i) { return { v: i, label: m.ch[i] }; }));
      el.appendChild(box);
      var lock = false;
      box.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (lock) return;
          if (+b.dataset.v !== m.a) { ui.toast(el, false); return; }
          lock = true;
          box.innerHTML = '<div style="background:#E6FCF5;border:3px solid #12B886;border-radius:16px;padding:13px 16px;text-align:center;">'
            + '<span style="font-size:19px;font-weight:800;color:#0B7A5C;">✅ 정답! ' + m.why + '</span></div>';
          setTimeout(function () {
            mStep++;
            if (mStep >= MS.length) mDone = true;
            build();
          }, 2600);
        });
      });
    }

    /* ───────────── 렌더 (SVG 가게) ───────────── */
    function svgEl(t, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function txt(svg, x, y, s, sz, f, an) { var t = svgEl('text', { x: x, y: y, 'text-anchor': an || 'middle', 'font-family': 'Gowun Dodum,sans-serif', 'font-size': sz, 'font-weight': 800, fill: f }); t.textContent = s; svg.appendChild(t); }
    function emo(svg, x, y, ch, sz) { var t = svgEl('text', { x: x, y: y, 'text-anchor': 'middle', 'font-size': sz }); t.textContent = ch; svg.appendChild(t); }
    var VBW = 820, VBH = 380;

    function render() {
      var stage = el.querySelector('.mk-stage'); if (!stage) return; stage.innerHTML = '';

      // 퀴즈 모드: 간단한 안내 일러스트
      if (mode === 'quiz') {
        var svgq = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });
        emo(svgq, VBW / 2 - 120, 200, '👥', 80); emo(svgq, VBW / 2 + 120, 200, '🍎', 80);
        txt(svgq, VBW / 2, 120, '손님과 물건을 떠올려 봐요', 24, '#B25E00');
        txt(svgq, VBW / 2, 300, '많아지면? 적어지면? 가격은 어떻게 움직일까요?', 20, '#C79A4A');
        stage.appendChild(svgq);
        return;
      }

      var svg = svgEl('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, width: '100%', height: '100%' });

      // 좌판 배경
      svg.appendChild(svgEl('rect', { x: 40, y: 250, width: VBW - 80, height: 26, rx: 8, fill: '#C98A3C' }));
      svg.appendChild(svgEl('rect', { x: 40, y: 276, width: VBW - 80, height: 60, rx: 6, fill: '#A86B28' }));

      // 상황 카드 표시
      if (sit) {
        svg.appendChild(svgEl('rect', { x: 40, y: 16, width: VBW - 80, height: 56, rx: 14, fill: '#FFF4D6', stroke: '#F59F00', 'stroke-width': 3 }));
        emo(svg, 78, 58, sit.ic, 34);
        txt(svg, 110, 42, sit.t, 22, '#B25E00', 'start');
        txt(svg, 110, 64, sit.why, 17, '#9A7B3A', 'start');
      } else {
        txt(svg, VBW / 2, 48, '🍎 사과 가게에 오신 걸 환영해요! 상황 카드를 뽑아 시작해요', 20, '#B25E00');
      }

      // 손님(수요) 줄 — 왼쪽
      var cy = 150;
      txt(svg, 150, 100, '손님 (사려는 사람)', 19, '#1565C0');
      for (var i = 0; i < demand; i++) emo(svg, 70 + (i % 5) * 36, cy + Math.floor(i / 5) * 44, '🧑', 30);
      txt(svg, 150, 238, '수요 ' + demand, 22, '#1565C0');

      // 물건(공급) 줄 — 오른쪽
      txt(svg, VBW - 150, 100, '사과 (파는 물건)', 19, '#E8590C');
      for (var j = 0; j < supply; j++) emo(svg, VBW - 230 + (j % 5) * 36, cy + Math.floor(j / 5) * 44, '🍎', 30);
      txt(svg, VBW - 150, 238, '공급 ' + supply, 22, '#E8590C');

      var fair = fairPrice();
      if (mode === 'free') {
        // 가운데 가격표 + 적정가
        svg.appendChild(svgEl('rect', { x: VBW / 2 - 95, y: 96, width: 190, height: 96, rx: 16, fill: '#fff', stroke: '#12B886', 'stroke-width': 4 }));
        txt(svg, VBW / 2, 126, '내 가격', 18, '#0B7A5C');
        txt(svg, VBW / 2, 168, price + '원', 38, '#0B7A5C');
        // 물가 배지 (중·고만)
        if (G().infl && infl > 1.001) {
          svg.appendChild(svgEl('rect', { x: VBW / 2 - 70, y: 198, width: 140, height: 30, rx: 12, fill: '#FFE3E3', stroke: '#E64980', 'stroke-width': 2.5 }));
          txt(svg, VBW / 2, 219, '🎈 물가 ×' + infl.toFixed(2), 17, '#C2255C');
        }
        // 동전 더미
        txt(svg, VBW / 2, 300, '🪙 모은 돈', 18, '#9A6700');
        txt(svg, VBW / 2, 328, coins + '원', 26, '#B8860B');
      } else {
        // 미션: 가운데에 "어떻게 할까?" 판단 안내
        emo(svg, VBW / 2, 168, '🤔', 56);
        txt(svg, VBW / 2, 300, '손님과 사과를 보고 가격을 어떻게 할지 골라요', 18, '#9A7B3A');
      }

      stage.appendChild(svg);

      // 슬라이더 트랙 색 띠(적정가 안내) + 미리보기 (자유탐구만)
      if (mode === 'free') { paintTrack(fair); paintPreview(fair); }

      // 미션 모드면 생각 선택지 띄우기
      if (mode === 'mission' && !mDone) mountThink();
    }

    // 슬라이더 트랙: 너무 싼 구간(노랑·이익얇음)→적정(초록)→너무 비싼 구간(빨강·안팔림)
    function paintTrack(fair) {
      var tr = el.querySelector('.mk-track'); if (!tr) return;
      var lo = ((Math.max(PMIN, fair * 0.7) - PMIN) / (PMAX - PMIN)) * 100;
      var hi = ((Math.min(PMAX, fair * 1.15) - PMIN) / (PMAX - PMIN)) * 100;
      var fp = ((fair - PMIN) / (PMAX - PMIN)) * 100;
      tr.style.background = 'linear-gradient(90deg,#FFE066 0%,#FFE066 ' + lo + '%,#B2F2BB ' + lo + '%,#B2F2BB ' + hi + '%,#FFC9C9 ' + hi + '%,#FFC9C9 100%)';
      tr.innerHTML = '<div style="position:absolute;left:' + fp + '%;top:-3px;transform:translateX(-50%);font-size:15px;font-weight:800;color:#0B7A5C;">▼적정</div>';
    }

    function paintPreview(fair) {
      var pv = el.querySelector('.mk-preview'); if (!pv) return;
      var w = Math.round(wantAt(price)), s = soldAt(price), p = profitAt(price);
      var tip;
      if (price > fair * 1.15) tip = '<span style="color:#E03131;">너무 비싸요! 손님이 발길을 돌려요</span>';
      else if (price < fair * 0.7) tip = '<span style="color:#F08C00;">너무 싸요! 다 팔려도 이익이 얇아요</span>';
      else tip = '<span style="color:#0B7A5C;">알맞은 가격이에요! 👍</span>';
      pv.innerHTML = '<span style="font-size:17px;color:#5a7894;">사려는 손님 약 ' + w + '명 · 팔릴 사과 ' + s + '개 · 예상 이익 '
        + '<b style="color:' + (p > 0 ? '#0B7A5C' : '#E03131') + ';">' + p + '원</b></span><br>' + tip;
    }

    // 시작
    if (mode === 'quiz') shuffleQuiz();
    else if (mode === 'free') { coins = 0; }
    build();
    return function cleanup() { el.innerHTML = ''; };
  });
})();
