/* ============================================================================
   케이랩 도구 모듈 — 먹이사슬·먹이그물 (foodchain) v1  [과학 · 5학년 · 생명 · 3모드]
   5학년 생물과 환경. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 화살표 방향(먹히는 쪽→먹는 쪽)을 직접 잇고, 한 사슬에서 얽힌
                먹이그물로 전환해 보고, 한 생물이 사라지면 어떻게 되는지 시뮬레이션.
     ▸ [먹이사슬] — 벼→메뚜기→개구리→뱀→매 한 줄 사슬. 화살표 = 에너지 이동.
     ▸ [먹이그물] — 여러 사슬이 얽힌 그물. 같은 먹이를 두고 경쟁/여러 먹이.
     ▸ 생물 분류 짚기: 생산자(🌱)·소비자(🐾)·분해자(🍄).
     ▸ '사라지면?' — 한 생물을 빼면 그 위/아래가 어떻게 영향받는지 색으로 표시.
   미션 4단계 + 퀴즈 5문(화살표 방향·분류·영향).
   - 의존: window.KLab (순수 SVG, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", view:"chain"|"web" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('foodchain', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes:['free','mission'],        web:false, roles:false, remove:false, quiz:false, missionN:2 },
      mid:  { modes:['free','mission','quiz'], web:true,  roles:true,  remove:false, quiz:true,  missionN:3 },
      high: { modes:['free','mission','quiz'], web:true,  roles:true,  remove:true,  quiz:true,  missionN:4 }
    };
    var grade = (['low','mid','high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var C = { ink: '#1B3A57', sub: '#5a7894', good: '#12B886', vio: '#7048E8', arrow: '#FF8A3D' };
    var btn = 'font-size:21px;padding:11px 17px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }

    // 생물 정의: 종류 role(prod 생산자 / cons 소비자 / dec 분해자), 화면 좌표(viewBox 700x440)
    var ORG = {
      rice:    { nm: '벼',     emo: '🌾', role: 'prod', x: 90,  y: 230 },
      grass:   { nm: '풀',     emo: '🌱', role: 'prod', x: 90,  y: 110 },
      hopper:  { nm: '메뚜기', emo: '🦗', role: 'cons', x: 240, y: 170 },
      rabbit:  { nm: '토끼',   emo: '🐰', role: 'cons', x: 240, y: 320 },
      frog:    { nm: '개구리', emo: '🐸', role: 'cons', x: 390, y: 170 },
      snake:   { nm: '뱀',     emo: '🐍', role: 'cons', x: 540, y: 230 },
      hawk:    { nm: '매',     emo: '🦅', role: 'cons', x: 650, y: 150 },
      fox:     { nm: '여우',   emo: '🦊', role: 'cons', x: 540, y: 360 },
      mush:    { nm: '곰팡이', emo: '🍄', role: 'dec',  x: 360, y: 400 }
    };
    var ROLE = { prod: { nm: '생산자', col: '#37B24D', desc: '햇빛으로 스스로 양분을 만들어요' },
                 cons: { nm: '소비자', col: '#1565C0', desc: '다른 생물을 먹어 양분을 얻어요' },
                 dec:  { nm: '분해자', col: '#9C6ADE', desc: '죽은 생물·배설물을 분해해 흙으로 돌려보내요' } };

    // 먹이 관계 (먹히는 쪽 → 먹는 쪽). chain=한 줄, web=얽힘
    var CHAIN = [['rice', 'hopper'], ['hopper', 'frog'], ['frog', 'snake'], ['snake', 'hawk']];
    var WEB = [
      ['rice', 'hopper'], ['grass', 'hopper'], ['grass', 'rabbit'],
      ['hopper', 'frog'], ['frog', 'snake'], ['snake', 'hawk'],
      ['rabbit', 'fox'], ['rabbit', 'hawk'], ['frog', 'fox']
    ];
    function chainOrgs() { return ['rice', 'hopper', 'frog', 'snake', 'hawk']; }
    function webOrgs() { return ['rice', 'grass', 'hopper', 'rabbit', 'frog', 'snake', 'hawk', 'fox', 'mush']; }

    var view, sel, removed;
    // ── 와우(연쇄 효과) 상태 ── 최상위 포식자를 없애면 아래 생물이 다 잘 살 것 같지만,
    //    피식자 폭증 → 그 아래 먹이 초토화 → 결국 모두 굶음(trophic cascade).
    //    라이브 affected()는 removed를 '먹던'(위쪽) 생물만 잡음 → 아래 방향 연쇄는 라이브에 없던 반직관.
    var cascadeArmed = false, cascadeRevealed = false, cascadeSeq = null;
    var pop = {};            // 생물별 개체수 배율(1=보통, >1 폭증, 0=바닥)
    // 연쇄 단계: 매 제거 후 사슬을 시차를 두고 타고 내려감(먹히던 쪽부터 폭증 → 그 먹이 고갈)
    // 각 단계 = { up:폭증할 생물들, down:줄어들 생물들, msg }
    var CASCADE_STEPS = [
      { up:['snake','frog'],           down:[],                  msg:'매가 없어지니 뱀·개구리가 마음 놓고 불어나요…' },
      { up:['snake','frog','hopper'],  down:[],                  msg:'그 뱀·개구리가 메뚜기를 마구 잡아먹어… 처음엔 메뚜기도 잠깐 늘고' },
      { up:['snake','frog'],           down:['hopper'],          msg:'곧 메뚜기가 싹쓸이돼 확 줄어들어요' },
      { up:['snake','frog'],           down:['hopper','rice'],   msg:'메뚜기가 없어지자 이번엔 벼(생산자)까지… 먹이가 바닥나요' },
      { up:[],                         down:['hopper','rice','frog','snake'], msg:'결국 먹이가 다 떨어져 뱀·개구리도 굶어요 — 모두 무너졌어요!' }
    ];
    function clearCascade(){ cascadeArmed=false; cascadeRevealed=false; pop={}; if(cascadeSeq){clearTimeout(cascadeSeq);cascadeSeq=null;} clearFcFlash(); }
    function reset() { view = (G().web && config.view === 'web') ? 'web' : 'chain'; sel = ''; removed = ''; cascadeArmed=false; cascadeRevealed=false; pop={}; if(cascadeSeq){clearTimeout(cascadeSeq);cascadeSeq=null;} }
    reset();

    var bands = ui.gradeBands({grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false; reset();
      if(mode==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
      build();
    }});

    /* ── 와우 배너 머신 (.kl-stage-host에 absolute 주입 + 자동 제거) ── */
    var fcFlashTimer = null;
    function clearFcFlash() {
      var host = el.querySelector('.kl-stage-host'); if (!host) return;
      var f = host.querySelectorAll('.fc-flash,.fc-flash-magic,.fc-nudge'); f.forEach(function(n){ n.parentNode && n.parentNode.removeChild(n); });
      if (fcFlashTimer) { clearTimeout(fcFlashTimer); fcFlashTimer = null; }
    }
    function fcFlash(kind, html, ms) {
      var host = el.querySelector('.kl-stage-host'); if (!host) return;
      clearFcFlash();
      var cls = (kind === 'magic') ? 'fc-flash-magic' : (kind === 'nudge' ? 'fc-nudge' : 'fc-flash');
      var bg = (kind === 'magic') ? 'rgba(112,72,232,0.96)' : (kind === 'nudge' ? 'rgba(90,120,148,0.95)' : 'rgba(21,101,192,0.96)');
      var d = document.createElement('div');
      d.className = cls;
      d.style.cssText = 'position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:20;max-width:92%;'
        + 'background:' + bg + ';color:#fff;padding:12px 18px;border-radius:16px;font-family:Jua,sans-serif;'
        + 'font-size:18px;font-weight:800;line-height:1.45;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,0.22);';
      d.innerHTML = html;
      host.appendChild(d);
      if (ms) fcFlashTimer = setTimeout(function(){ clearFcFlash(); }, ms);
    }

    /* ── 와우: 최상위 포식자 제거 → 연쇄 효과 ── */
    function cascadeArm() {
      if (mode !== 'free') return;
      clearCascade();
      view = 'chain'; sel = ''; removed = 'hawk';      // 사슬에서 매 제거 셋업(라이브 removed 재사용)
      cascadeArmed = true; pop = {};
      snd('charge');
      renderScene(); renderStatus();
      fcFlash('arm', '🦅 <b>매</b>가 사라졌어요. 매에게 잡아먹히던 뱀·개구리는<br>이제 마음 놓고 <b>잘 살까요?</b> 시간이 흐르면 어떻게 될지 예상해 봐요!', 4200);
      updateStatusHold('🦅 최상위 포식자가 사라지면 아래 생물들은 늘기만 할까요?');
    }
    function cascadeReveal() {
      if (mode !== 'free') return;
      if (!cascadeArmed) {   // 무장 없이 누르면 넛지만(마법음 차단)
        snd('select');
        fcFlash('nudge', '먼저 🔮 <b>매를 없애면?</b> 버튼으로 예상부터 해 봐요.', 2600);
        return;
      }
      cascadeRevealed = true;
      snd('whoosh');
      var i = 0;
      function stepOne() {
        if (i >= CASCADE_STEPS.length) {
          snd('erupt');
          fcFlash('magic', '💥 매가 없어지자 뱀·개구리가 불어나 <b>메뚜기를 싹쓸이</b>하고,<br>메뚜기가 사라지자 <b>벼(생산자)까지 초토화</b> — 결국 먹이가 바닥나 <b>모두 굶어요!</b><br>최상위 포식자는 아래 생물의 수를 조절해 <b>먹이그물의 균형</b>을 지켜요(연쇄 효과).', 7200);
          updateStatusHold('💥 최상위 포식자를 없애면 → 피식자 폭증 → 그 먹이 초토화 → 모두 붕괴');
          cascadeSeq = null;
          return;
        }
        var s = CASCADE_STEPS[i];
        pop = {};
        s.up.forEach(function(k){ pop[k] = 2; });
        s.down.forEach(function(k){ pop[k] = 0; });
        snd(i === CASCADE_STEPS.length - 1 ? 'rumble' : 'pop');
        renderScene();
        var st = el.querySelector('.fc-status');
        if (st) st.innerHTML = '<div style="font-size:21px;color:#E8590C;">⏩ 시간이 흐르면…</div>'
          + '<div style="font-size:18px;color:' + C.sub + ';margin-top:5px;">' + s.msg + '</div>';
        i++;
        cascadeSeq = setTimeout(stepOne, 1150);
      }
      stepOne();
    }
    function updateStatusHold(txt) {
      var st = el.querySelector('.fc-status'); if (!st) return;
      st.innerHTML = '<div class="fc-hold" style="font-size:19px;color:' + C.vio + ';font-weight:800;">' + txt + '</div>';
    }

    function setView(v) { view = v; sel = ''; removed = ''; clearCascade(); renderScene(); renderStatus(); if (mode === 'mission') checkMission(); }
    function pickOrg(k) {
      if (mode === 'mission' && mStep === 3) {
        // 미션4: 사라지면? — 클릭으로 제거 토글
        removed = (removed === k) ? '' : k;
      } else {
        if (cascadeArmed || cascadeRevealed) clearCascade();  // 손으로 만지면 무장 해제
        sel = k;
      }
      renderScene(); renderStatus();
      if (mode === 'mission') checkMission();
    }

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS = [
      { text: '🌾 화살표를 따라가요 — <b style="color:#7048E8;">벼를 먹는 동물</b>을 찾아 눌러요! (메뚜기)',
        check: function () { return view === 'chain' && sel === 'hopper'; } },
      { text: '🐍 이번엔 <b style="color:#7048E8;">개구리를 먹는 동물</b>을 찾아 눌러요! (화살표가 개구리에서 나가는 쪽)',
        check: function () { return view === 'chain' && sel === 'snake'; } }
    ];
    var BASE_MISSIONS = [
      { text: '🌱 먹이사슬에서 <b style="color:#7048E8;">스스로 양분을 만드는 생산자</b>를 찾아 눌러요!',
        check: function () { return view === 'chain' && sel && ORG[sel].role === 'prod'; } },
      { text: '🐍 <b style="color:#7048E8;">개구리를 먹는 동물</b>을 찾아 눌러요! (화살표가 개구리에서 나가는 쪽)',
        check: function () { return view === 'chain' && sel === 'snake'; } },
      { text: '🕸 <b style="color:#7048E8;">먹이그물</b>로 바꿔 봐요 — 여러 사슬이 얽혀 있어요!',
        check: function () { return view === 'web'; } },
      { text: '❓ 먹이그물에서 <b style="color:#7048E8;">메뚜기를 눌러 사라지게</b> 해봐요 — 누가 먹이를 잃을까요?',
        check: function () { return view === 'web' && removed === 'hopper'; } }
    ];
    function curMissions() { return (grade==='low') ? LOW_MISSIONS : BASE_MISSIONS.slice(0, G().missionN); }
    var mStep = 0, mDone = false, mLock = false;
    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      var M = curMissions();
      if (M[mStep].check()) {
        mLock = true; ui.toast(el, true);
        setTimeout(function () {
          mLock = false;
          if (mStep < M.length - 1) {
            mStep++;
            if (grade !== 'low' && mStep === 2) { sel = ''; }
            if (grade !== 'low' && mStep === 3) { view = 'web'; sel = ''; removed = ''; }
          } else mDone = true;
          build();
        }, 1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ = [
      { q: '먹이사슬 화살표(→)는 무엇을 나타낼까요?', ch: ['먹히는 생물 → 먹는 생물(에너지 이동)', '먹는 생물 → 먹히는 생물', '사는 곳의 방향'], a: 0 },
      { q: '햇빛으로 스스로 양분을 만드는 생물을 무엇이라 할까요?', ch: ['생산자', '소비자', '분해자'], a: 0 },
      { q: '죽은 생물을 분해해 흙으로 돌려보내는 곰팡이·세균은?', ch: ['분해자', '생산자', '소비자'], a: 0 },
      { q: '여러 먹이사슬이 얽혀 그물처럼 이어진 것을 무엇이라 할까요?', ch: ['먹이그물', '먹이사슬', '먹이피라미드'], a: 0 },
      { q: '먹이그물에서 메뚜기가 갑자기 사라지면 가장 먼저 곤란해지는 동물은?', ch: ['메뚜기를 먹던 개구리', '풀', '곰팡이'], a: 0 }
    ];
    var qIdx = 0, qScore = 0, qCount = 0, qLock = false, qUsed = [];
    // 중학년 = 기본 3문(화살표 방향·생산자·먹이그물), 고학년 = 전체 5문(분해자·사라지면 영향 포함)
    function quizIdxPool(){ return (grade==='mid') ? [0,1,3] : [0,1,2,3,4]; }
    function newQuiz() {
      var pool=quizIdxPool();
      if (qUsed.length >= pool.length) qUsed = [];
      var cand = []; for (var i = 0; i < pool.length; i++) if (qUsed.indexOf(pool[i]) < 0) cand.push(pool[i]);
      qIdx = cand[Math.floor(Math.random() * cand.length)]; qUsed.push(qIdx); qLock = false;
    }
    function quizChoices() {
      var q = QUIZ[qIdx], idx = [0, 1, 2].sort(function () { return Math.random() - 0.5; });
      return idx.map(function (i) { return { v: i, label: '<span style="font-size:19px;">' + q.ch[i] + '</span>' }; });
    }

    /* ───────────── UI ───────────── */
    // 와우 버튼: 고학년·자유탐구 전용(remove=high, 생태 평형/연쇄는 5학년 고학년 칸 개념)
    function showWow() { return G().remove && mode === 'free'; }
    function viewTabs() {
      var wowRow = '';
      if (showWow()) {
        wowRow = '<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
          + '<button class="fc-btn" data-act="wowArm" style="' + btn + 'background:#fff;color:#7048E8;border-color:#7048E8;">🔮 매를 없애면?</button>'
          + '<button class="fc-btn" data-act="wowReveal" style="' + btn + 'background:#7048E8;color:#fff;border-color:#7048E8;">⏩ 시간이 흐르면?</button>'
          + '</div>';
      }
      return '<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + '<button class="fc-view" data-view="chain" style="' + btn + (view === 'chain' ? 'background:#1565C0;color:#fff;' : 'background:#fff;color:#1565C0;') + '">🔗 먹이사슬</button>'
        + (G().web ? '<button class="fc-view" data-view="web" style="' + btn + (view === 'web' ? 'background:#1565C0;color:#fff;' : 'background:#fff;color:#1565C0;') + '">🕸 먹이그물</button>' : '')
        + '<span style="width:8px;"></span>'
        + '<button class="fc-btn" data-act="reset" style="' + btn + 'background:#fff;color:#666;border-color:#9aa;">↺ 처음으로</button>'
        + '</div>' + wowRow;
    }
    function legend() {
      if (!G().roles) return '';
      return '<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:6px;">'
        + Object.keys(ROLE).map(function (r) {
          return '<span style="font-size:16px;font-weight:800;color:' + ROLE[r].col + ';">● ' + ROLE[r].nm + '</span>';
        }).join('') + '</div>';
    }
    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode), bar = '', body = '', foot = '';
      if (mode === 'mission') { var M = curMissions(); bar = mDone ? ui.doneBar() : ui.missionBar(M[mStep].text, mStep, M.length); body = viewTabs() + legend(); }
      else if (mode === 'quiz') { bar = ui.quizBar(QUIZ[qIdx].q, qScore, qCount); foot = ui.choices(quizChoices()); }
      else body = viewTabs() + legend();
      el.innerHTML = '<style>.fc-btn:active,.fc-view:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.fc-org{cursor:pointer;}</style>'
        + top + bar + body
        + '<div class="kl-stage-host" style="position:relative;"><div class="fc-stage" style="width:100%;height:' + (mode === 'quiz' ? '36vh' : '46vh') + ';min-height:' + (mode === 'quiz' ? '260' : '330') + 'px;background:linear-gradient(180deg,#F4FCE3 0%,#E7F5FF 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        + '<div class="fc-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el, function (m) {
        mode = m; mStep = 0; mDone = false; mLock = false; reset();
        if (m === 'quiz') { qScore = 0; qCount = 0; qUsed = []; newQuiz(); }
        build();
      });
      bands.bind(el);
      drawStage(); bind(); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage() {
      stage = el.querySelector('.fc-stage'); stage.innerHTML = '';
      svg = svgEl('svg', { viewBox: '0 0 700 440', width: '100%', height: '100%', style: 'max-height:46vh;display:block;margin:0 auto;' });
      var defs = svgEl('defs', {});
      var mk = svgEl('marker', { id: 'fcArrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      mk.appendChild(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: C.arrow }));
      defs.appendChild(mk);
      var mkD = svgEl('marker', { id: 'fcArrowDim', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      mkD.appendChild(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#C9D7E6' }));
      defs.appendChild(mkD);
      svg.appendChild(defs);
      stage.appendChild(svg);
    }
    function affected(rel) {
      // removed가 있으면, removed를 먹던(=화살표가 removed에서 나가는 대상) 생물 집합
      var out = {};
      if (!removed) return out;
      rel.forEach(function (e) { if (e[0] === removed) out[e[1]] = true; });
      return out;
    }
    function renderScene() {
      if (!svg) return;
      // defs 유지, 나머지 비우기
      var defs = svg.querySelector('defs');
      svg.innerHTML = ''; if (defs) svg.appendChild(defs);
      var g = svgEl('g', {});
      var rel = (view === 'chain') ? CHAIN : WEB;
      var orgs = (view === 'chain') ? chainOrgs() : webOrgs();
      var aff = affected(rel);

      // 화살표(먹히는→먹는)
      rel.forEach(function (e) {
        var a = ORG[e[0]], b = ORG[e[1]];
        var dim = (removed && (e[0] === removed || e[1] === removed));
        // 길이 줄여 노드에 안 겹치게
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / len, uy = dy / len, pad = 30;
        g.appendChild(svgEl('line', {
          x1: a.x + ux * pad, y1: a.y + uy * pad, x2: b.x - ux * pad, y2: b.y - uy * pad,
          stroke: dim ? '#C9D7E6' : C.arrow, 'stroke-width': dim ? 2.5 : 4,
          'marker-end': dim ? 'url(#fcArrowDim)' : 'url(#fcArrow)', opacity: dim ? 0.6 : 1
        }));
      });
      // 생물 노드
      orgs.forEach(function (k) {
        var o = ORG[k], role = ROLE[o.role];
        var isRemoved = (removed === k);
        var isAff = aff[k];
        var pv = pop[k];                            // 와우 개체수 배율(undefined=보통)
        var boom = (pv > 1), gone = (pv === 0);
        var rr = boom ? 40 : (gone ? 18 : 30);      // 폭증=크게, 바닥=작게
        g.appendChild(svgEl('circle', {
          cx: o.x, cy: o.y, r: rr,
          fill: isRemoved ? '#E9ECEF' : (gone ? '#F1F3F5' : (boom ? '#FFE8CC' : (sel === k ? '#fff' : role.col))),
          stroke: boom ? '#E8590C' : (gone ? '#ADB5BD' : (isAff ? '#E8590C' : role.col)), 'stroke-width': (boom || isAff) ? 5 : 4,
          opacity: isRemoved ? 0.4 : (gone ? 0.5 : 1), class: 'fc-org', 'data-k': k
        }));
        var emo = svgEl('text', { x: o.x, y: o.y + (boom ? 12 : (gone ? 6 : 9)), 'text-anchor': 'middle', 'font-size': boom ? 34 : (gone ? 16 : 26), 'pointer-events': 'none', opacity: isRemoved ? 0.4 : (gone ? 0.5 : 1) });
        emo.textContent = o.emo; g.appendChild(emo);
        // 개체수 변화 화살표(폭증 ↑↑ / 바닥 ↓)
        if (boom) { var up = svgEl('text', { x: o.x + rr - 4, y: o.y - rr + 12, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: '#E8590C', 'pointer-events': 'none' }); up.textContent = '⬆⬆'; g.appendChild(up); }
        else if (gone) { var dn = svgEl('text', { x: o.x + rr, y: o.y - rr + 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#868E96', 'pointer-events': 'none' }); dn.textContent = '⬇'; g.appendChild(dn); }
        var lab = svgEl('text', { x: o.x, y: o.y + (boom ? 58 : 48), 'text-anchor': 'middle', 'font-family': 'Jua,sans-serif', 'font-size': 16, 'font-weight': 800, fill: boom ? '#E8590C' : (gone ? '#868E96' : (isAff ? '#E8590C' : C.ink)), 'pointer-events': 'none' });
        lab.textContent = o.nm + (isRemoved ? ' (사라짐)' : (boom ? ' 폭증!' : (gone ? ' 바닥' : (isAff ? ' ⚠' : ''))));
        g.appendChild(lab);
      });
      svg.appendChild(g);
      svg.querySelectorAll('.fc-org').forEach(function (c) { c.addEventListener('click', function () { pickOrg(c.dataset.k); }); });
    }
    function renderStatus() {
      var st = el.querySelector('.fc-status'); if (!st) return;
      if (mode === 'quiz') { st.innerHTML = '<div style="font-size:19px;color:#8aa0b6;">화살표 방향(먹히는 쪽→먹는 쪽)과 생물의 역할을 떠올리며 답을 골라요!</div>'; return; }
      if (removed) {
        var aff = affected((view === 'chain') ? CHAIN : WEB);
        var names = Object.keys(aff).map(function (k) { return ORG[k].nm; });
        st.innerHTML = '<div style="font-size:22px;color:#E8590C;">' + ORG[removed].nm + '이(가) 사라졌어요!</div>'
          + '<div style="font-size:18px;color:' + C.sub + ';margin-top:5px;">' + (names.length ? '<b>' + names.join('·') + '</b>이(가) 먹이를 잃어 어려워져요. 먹이그물에선 한 생물이 사라지면 이렇게 여러 생물이 영향을 받아요.' : '이 생물을 직접 먹던 동물이 사슬에서 영향을 받아요.') + '</div>';
        return;
      }
      if (sel) {
        var o = ORG[sel], role = ROLE[o.role];
        var eats = [], eaten = [];
        var rel = (view === 'chain') ? CHAIN : WEB;
        rel.forEach(function (e) { if (e[1] === sel) eats.push(ORG[e[0]].nm); if (e[0] === sel) eaten.push(ORG[e[1]].nm); });
        if (!G().roles) {
          // 저학년: 분류 용어 없이 누가 먹고 먹히는지 일상어
          st.innerHTML = '<div style="font-size:23px;color:' + C.ink + ';">' + o.emo + ' ' + o.nm + '</div>'
            + '<div style="font-size:17px;color:' + C.ink + ';margin-top:6px;">'
            + (eats.length ? '🍽️ ' + o.nm + '은(는) <b>' + eats.join('·') + '</b>을(를) 먹어요.   ' : (o.role === 'prod' ? '🌞 햇빛을 받아 스스로 자라요.   ' : ''))
            + (eaten.length ? '⚠️ <b>' + eaten.join('·') + '</b>에게 먹혀요.' : '') + '</div>';
          return;
        }
        st.innerHTML = '<div style="font-size:23px;color:' + role.col + ';">' + o.emo + ' ' + o.nm + ' — ' + role.nm + '</div>'
          + '<div style="font-size:17px;color:' + C.sub + ';margin-top:4px;">' + role.desc + '</div>'
          + '<div style="font-size:16px;color:' + C.ink + ';margin-top:4px;">'
          + (eats.length ? '먹이: ' + eats.join('·') + '   ' : '')
          + (eaten.length ? '천적: ' + eaten.join('·') : (o.role === 'prod' ? '햇빛으로 스스로 양분을 만들어요' : '')) + '</div>';
        return;
      }
      st.innerHTML = '<div style="font-size:20px;color:' + C.ink + ';">' + (view === 'chain' ? '🔗 먹이사슬' : '🕸 먹이그물') + '</div>'
        + '<div style="font-size:17px;color:' + C.sub + ';margin-top:4px;">생물을 눌러' + (G().roles ? ' 역할과' : '') + ' 먹이 관계를 봐요. 화살표는 <b>먹히는 생물 → 먹는 생물</b>로, ' + (G().roles ? '에너지가 옮겨가는 방향이에요.' : '누가 누구를 먹는지 알려줘요.') + '</div>';
    }

    function bind() {
      el.querySelectorAll('.fc-view').forEach(function (b) { b.addEventListener('click', function () { snd('select'); setView(b.dataset.view); }); });
      var rb = el.querySelector('[data-act="reset"]');
      if (rb) rb.addEventListener('click', function () { snd('select'); sel = ''; removed = ''; clearCascade(); renderScene(); renderStatus(); });
      var aw = el.querySelector('[data-act="wowArm"]');
      if (aw) aw.addEventListener('click', function () { cascadeArm(); });
      var rv = el.querySelector('[data-act="wowReveal"]');
      if (rv) rv.addEventListener('click', function () { cascadeReveal(); });
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
