/* ============================================================================
   케이랩 도구 모듈 — 우리 몸 기관계 (bodysys) v1  [과학 · 5학년 · 생명 · 3모드]
   5학년 우리 몸의 구조와 기능. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 몸속을 들여다볼 수 없는 걸, 기관계별로 켜고/짚어보며 길을 따라간다.
     ▸ 4개 기관계 토글: 소화(🍚)·호흡(💨)·순환(❤️)·배설(💧)
     ▸ 각 기관계의 주요 기관을 사람 실루엣 위에 배치 — 기관을 누르면 이름·하는 일 설명.
     ▸ '길 따라가기' 애니메이션: 음식/공기/피/노폐물이 기관을 차례로 지나간다.
   미션 4단계(소화 길 끝까지→호흡 켜고 폐 짚기→순환 길→배설에서 콩팥 찾기)
   + 퀴즈 5문(기관-기능 연결).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", system:"digest"|"breath"|"blood"|"excrete" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('bodysys', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes:['free','mission'],        systems:['digest','breath'],                    quiz:false, missionN:2, showWow:false },
      mid:  { modes:['free','mission','quiz'], systems:['digest','breath','blood','excrete'], quiz:true,  missionN:3, showWow:false },
      high: { modes:['free','mission','quiz'], systems:['digest','breath','blood','excrete'], quiz:true,  missionN:4, showWow:true }
    };
    var grade = (['low','mid','high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null;
    var C = { ink: '#1B3A57', sub: '#5a7894', good: '#12B886', vio: '#7048E8' };
    var btn = 'font-size:21px;padding:11px 17px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', t); for (var k in a) e.setAttribute(k, a[k]); return e; }

    // ── 기관계 정의: 색·이름·기관 목록(좌표는 사람 실루엣 viewBox 360x520 기준)
    var SYS = {
      digest:  { nm: '소화 기관계', emo: '🍚', col: '#F59F00', flow: '음식',   path: ['mouth', 'esoph', 'stomach', 'sintest', 'lintest'] },
      breath:  { nm: '호흡 기관계', emo: '💨', col: '#4DABF7', flow: '공기',   path: ['nose', 'trachea', 'lungL', 'lungR'] },
      blood:   { nm: '순환 기관계', emo: '❤️', col: '#FA5252', flow: '피',     path: ['heart', 'vesselU', 'vesselD', 'heart2'] },
      excrete: { nm: '배설 기관계', emo: '💧', col: '#22B8CF', flow: '노폐물', path: ['kidneyL', 'kidneyR', 'bladder'] }
    };
    var ORGAN = {
      mouth:   { nm: '입',      x: 180, y: 70,  job: '음식을 이로 잘게 부수고 침과 섞어요.' },
      esoph:   { nm: '식도',    x: 180, y: 120, job: '입에서 받은 음식을 위로 내려보내요.' },
      stomach: { nm: '위',      x: 150, y: 175, job: '음식을 잘게 으깨고 소화액과 섞어요.' },
      sintest: { nm: '작은창자', x: 185, y: 250, job: '영양분을 흡수해 몸으로 보내요.' },
      lintest: { nm: '큰창자',  x: 185, y: 320, job: '남은 찌꺼기에서 물을 흡수하고 똥을 만들어요.' },
      nose:    { nm: '코',      x: 180, y: 55,  job: '공기가 드나드는 곳. 먼지를 걸러요.' },
      trachea: { nm: '기관',    x: 180, y: 115, job: '코에서 받은 공기를 폐로 보내는 길이에요.' },
      lungL:   { nm: '폐(왼쪽)', x: 145, y: 165, job: '공기 속 산소를 받아 피로 보내요.' },
      lungR:   { nm: '폐(오른쪽)', x: 215, y: 165, job: '공기 속 산소를 받아 피로 보내요.' },
      heart:   { nm: '심장',    x: 175, y: 175, job: '쉬지 않고 뛰며 온몸으로 피를 보내요(펌프).' },
      heart2:  { nm: '심장',    x: 175, y: 175, job: '온몸을 돈 피가 다시 심장으로 돌아와요.' },
      vesselU: { nm: '혈관(위)', x: 180, y: 95,  job: '피가 흐르는 길. 산소·영양분을 실어 날라요.' },
      vesselD: { nm: '혈관(아래)', x: 180, y: 300, job: '피가 흐르는 길. 온몸 구석구석까지 이어져요.' },
      kidneyL: { nm: '콩팥(왼쪽)', x: 145, y: 255, job: '피 속 노폐물을 걸러 오줌을 만들어요.' },
      kidneyR: { nm: '콩팥(오른쪽)', x: 215, y: 255, job: '피 속 노폐물을 걸러 오줌을 만들어요.' },
      bladder: { nm: '방광',    x: 180, y: 340, job: '오줌을 모아 두었다가 몸 밖으로 내보내요.' }
    };

    var sys, sel, flowIdx, playing;
    function reset() { sys = (SYS[config.system] && G().systems.indexOf(config.system)>=0) ? config.system : G().systems[0]; sel = ''; flowIdx = -1; playing = false; }
    reset();

    /* ── 효과음 헬퍼 (라이브 bodysys는 snd 미보유였음) ── */
    function snd(n){ if(window.KLab.sound && window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── 와우: 「각 기관계는 따로 논다」 반증 = 4기관계가 심장(피)을 허브로 하나로 이어짐 ──
       ★교훈: 도구가 이미 가르치는 것(기관계 구분·각 기관 기능·한 기관계 내 흐름)이 아니라,
       도구가 구조적으로 오히려 심는 오개념(4개를 완전히 따로 토글=따로 논다)을 정조준.
       5학년 성취기준 「여러 기관계가 관련을 맺으며 생명 활동 유지」 + foodchain 연쇄와 유사. */
    var CROSS_STEPS = [
      { organ:'sintest', col:SYS.digest.col,  label:'🍚 영양분', msg:'소화 기관계 — 작은창자가 얻은 <b>영양분</b>을 피(순환)로 넘겨요.' },
      { organ:'lungL',   col:SYS.breath.col,  label:'💨 산소',   msg:'호흡 기관계 — 폐가 받은 <b>산소</b>도 피(순환)로 넘겨요.' },
      { organ:'heart',   col:SYS.blood.col,   label:'❤️ 피',     msg:'순환 기관계 — 피가 영양분과 산소를 <b>온몸 구석구석</b> 실어 날라요.' },
      { organ:'kidneyL', col:SYS.excrete.col, label:'💧 노폐물', msg:'배설 기관계 — 몸에서 생긴 <b>노폐물</b>을 피가 콩팥으로 보내 오줌으로 걸러요.' }
    ];
    var linkArmed = false, linkActive = false, linkRevealed = false, linkStep = -1, linkTimer = null;
    var holdMsg = '';
    function clearLinkTimers(){ if(linkTimer){ clearTimeout(linkTimer); linkTimer = null; } }
    function clearLink(){ clearLinkTimers(); linkArmed = false; linkActive = false; linkRevealed = false; linkStep = -1; holdMsg = ''; clearBsFlash(); }

    var bands = ui.gradeBands({grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false;
      if(raf){ clearTimeout(raf); raf=null; }
      clearLink();
      reset();
      if(mode==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
      build();
    }});

    function setSys(s) { if(linkArmed||linkActive||linkRevealed){clearLink();} snd('select'); sys = s; sel = ''; flowIdx = -1; playing = false; renderScene(); renderStatus(); if (mode === 'mission') checkMission(); }
    function pickOrgan(k) {
      if(linkArmed||linkActive||linkRevealed){ clearLink(); build(); return; }
      snd('tap'); sel = k; renderScene(); renderStatus();
      if (mode === 'mission') checkMission();
    }
    function tickFlow() {
      var p = SYS[sys].path;
      flowIdx = (flowIdx + 1) % (p.length + 1);
      renderScene(); renderStatus();
      if (flowIdx === p.length && mode === 'mission') checkMission();
    }

    /* ───────────── 와우 (예측→확인 2단) ───────────── */
    var flashTimer = null;
    function clearBsFlash(){
      if(flashTimer){ clearTimeout(flashTimer); flashTimer = null; }
      var host = el.querySelector('.kl-stage-host'); if(!host) return;
      host.querySelectorAll('.bs-flash,.bs-flash-magic,.bs-nudge').forEach(function(n){ n.remove(); });
    }
    function bsFlash(kind, msg){
      var host = el.querySelector('.kl-stage-host'); if(!host) return;
      clearBsFlash();
      var cls = kind==='magic' ? 'bs-flash-magic' : (kind==='nudge' ? 'bs-nudge' : 'bs-flash');
      var bg  = kind==='magic' ? C.vio : (kind==='nudge' ? '#8a97a6' : '#1565C0');
      var d = document.createElement('div');
      d.className = cls;
      d.style.cssText = 'position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:20;max-width:92%;background:'+bg+';color:#fff;padding:12px 18px;border-radius:16px;font-family:Gowun Dodum,sans-serif;font-size:18px;font-weight:800;line-height:1.42;box-shadow:0 6px 20px rgba(0,0,0,0.18);text-align:center;';
      d.innerHTML = msg;
      host.appendChild(d);
      var dur = kind==='magic' ? 6800 : (kind==='nudge' ? 2600 : 4200);
      flashTimer = setTimeout(function(){ if(d.parentNode) d.remove(); flashTimer = null; }, dur);
    }
    function wowArm(){
      clearLinkTimers();
      linkArmed = true; linkActive = false; linkRevealed = false; linkStep = -1;
      sys = 'digest'; sel = ''; flowIdx = -1; playing = false;
      snd('charge');
      renderScene(); renderStatus();
      bsFlash('arm', '지금 켜진 건 <b>소화 기관계</b> 하나예요. 소화·호흡·순환·배설은 서로 <b>상관없이 따로따로</b> 일할까요? 예상해 봐요!');
      holdMsg = '한 기관계만 멈춰도 온몸이 괜찮을까요?';
      renderStatus();
    }
    function wowReveal(){
      if(!linkArmed){ snd('select'); bsFlash('nudge', '먼저 🔮 버튼으로 예상부터 해 봐요.'); return; }
      clearLinkTimers();
      linkActive = true; linkRevealed = false; linkStep = -1;
      snd('whoosh');
      var advance = function(){
        linkStep++;
        if(linkStep < CROSS_STEPS.length){
          snd('pop');
          renderScene(); renderStatus();
          linkTimer = setTimeout(advance, 1250);
        } else {
          clearLinkTimers();
          linkActive = false; linkRevealed = true; linkArmed = false; holdMsg = '';
          snd('success');
          renderScene(); renderStatus();
          bsFlash('magic', '4개 기관계는 따로 노는 게 아니라 <b>하나로 이어져</b> 있어요! 소화가 얻은 영양분과 호흡이 얻은 산소를 <b>순환(피)</b>이 온몸에 실어 나르고, 생긴 노폐물을 다시 순환이 콩팥으로 보내 배설해요 — 한 곳이 멈추면 온몸이 멈춰요.');
        }
      };
      advance();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS = [
      { text: '🍚 <b style="color:#7048E8;">소화 기관계</b>에서 ▶ 길 따라가기로 음식이 <b style="color:#7048E8;">큰창자까지</b> 가게 해봐요!',
        check: function () { return sys === 'digest' && flowIdx >= SYS.digest.path.length; } },
      { text: '💨 <b style="color:#7048E8;">호흡 기관계</b>로 바꾸고 <b style="color:#7048E8;">폐</b>를 눌러 하는 일을 봐요!',
        check: function () { return sys === 'breath' && (sel === 'lungL' || sel === 'lungR'); } },
      { text: '❤️ <b style="color:#7048E8;">순환 기관계</b>에서 ▶ 길 따라가기로 피가 한 바퀴 돌게 해봐요!',
        check: function () { return sys === 'blood' && flowIdx >= SYS.blood.path.length; } },
      { text: '💧 <b style="color:#7048E8;">배설 기관계</b>에서 노폐물을 걸러 오줌을 만드는 <b style="color:#7048E8;">콩팥</b>을 찾아 눌러요!',
        check: function () { return sys === 'excrete' && (sel === 'kidneyL' || sel === 'kidneyR'); } }
    ];
    function curMissions() { return MISSIONS.slice(0, G().missionN); }
    var mStep = 0, mDone = false, mLock = false;
    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      var M = curMissions();
      if (M[mStep].check()) {
        mLock = true; playing = false;
        ui.toast(el, true);
        setTimeout(function () {
          mLock = false;
          if (mStep < M.length - 1) {
            mStep++;
            var order = ['digest', 'breath', 'blood', 'excrete'];
            var nextSys = order[mStep];
            if (G().systems.indexOf(nextSys) < 0) nextSys = G().systems[0];
            sys = nextSys; sel = ''; flowIdx = -1; playing = false;
          } else mDone = true;
          build();
        }, 1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ = [
      { q: '음식의 영양분을 흡수하는 기관은?', ch: ['작은창자', '폐', '콩팥'], a: 0 },
      { q: '온몸으로 피를 보내는 펌프 역할을 하는 기관은?', ch: ['심장', '위', '코'], a: 0 },
      { q: '공기 속 산소를 받아들이는 기관은?', ch: ['폐', '큰창자', '방광'], a: 0 },
      { q: '피 속 노폐물을 걸러 오줌을 만드는 기관은?', ch: ['콩팥', '심장', '식도'], a: 0 },
      { q: '음식이 지나가는 순서로 맞는 것은?', ch: ['입→식도→위→작은창자', '입→위→식도→폐', '코→위→큰창자'], a: 0 }
    ];
    var qIdx = 0, qScore = 0, qCount = 0, qLock = false, qUsed = [];
    // 중학년 = 기본 3문(작은창자·심장·폐), 고학년 = 전체 5문(콩팥·소화 순서 포함)
    function quizIdxPool() { return (grade === 'mid') ? [0, 1, 2] : [0, 1, 2, 3, 4]; }
    function newQuiz() {
      var pool = quizIdxPool();
      if (qUsed.length >= pool.length) qUsed = [];
      var cand = []; for (var i = 0; i < pool.length; i++) if (qUsed.indexOf(pool[i]) < 0) cand.push(pool[i]);
      qIdx = cand[Math.floor(Math.random() * cand.length)]; qUsed.push(qIdx); qLock = false;
    }
    function quizChoices() {
      var q = QUIZ[qIdx], idx = [0, 1, 2].sort(function () { return Math.random() - 0.5; });
      return idx.map(function (i) { return { v: i, label: '<span style="font-size:20px;">' + q.ch[i] + '</span>' }; });
    }

    /* ───────────── UI ───────────── */
    function sysTabs() {
      return '<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + G().systems.map(function (k) {
          var on = (k === sys);
          return '<button class="bs-sys" data-sys="' + k + '" style="' + btn + 'border-color:' + SYS[k].col + ';'
            + (on ? 'background:' + SYS[k].col + ';color:#fff;' : 'background:#fff;color:' + SYS[k].col + ';') + '">' + SYS[k].emo + ' ' + SYS[k].nm + '</button>';
        }).join('') + '</div>';
    }
    function ctrlRow() {
      return '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:8px;">'
        + '<button class="bs-btn" data-act="flow" style="' + btn + 'background:' + C.vio + ';color:#fff;border-color:' + C.vio + ';">▶ ' + SYS[sys].flow + ' 길 따라가기</button>'
        + '<button class="bs-btn" data-act="reset" style="' + btn + 'background:#fff;color:#666;border-color:#9aa;">↺ 처음으로</button>'
        + '</div>';
    }
    function wowBtns() {
      if (!G().showWow || mode !== 'free') return '';
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
        + '<button class="bs-wow" data-wow="arm" style="' + btn + 'background:#fff;color:' + C.vio + ';border-color:' + C.vio + ';">🔮 소화·호흡은 서로 상관없다?</button>'
        + '<button class="bs-wow" data-wow="reveal" style="' + btn + 'background:' + C.vio + ';color:#fff;border-color:' + C.vio + ';">🔗 몸속을 이어보기</button>'
        + '</div>';
    }
    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode), bar = '', body = '', foot = '';
      if (mode === 'mission') { var M = curMissions(); bar = mDone ? ui.doneBar() : ui.missionBar(M[mStep].text, mStep, M.length); body = sysTabs() + ctrlRow(); }
      else if (mode === 'quiz') { bar = ui.quizBar(QUIZ[qIdx].q, qScore, qCount); foot = ui.choices(quizChoices()); }
      else body = sysTabs() + wowBtns() + ctrlRow();
      el.innerHTML = '<style>.bs-btn:active,.bs-sys:active,.bs-wow:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.bs-organ{cursor:pointer;}@keyframes bsHoldPulse{0%,100%{opacity:1;}50%{opacity:.45;}}.bs-hold{animation:bsHoldPulse 1.1s ease-in-out infinite;}</style>'
        + top + bar + body
        + '<div class="kl-stage-host" style="position:relative;"><div class="bs-stage" style="width:100%;height:' + (mode === 'quiz' ? '36vh' : '46vh') + ';min-height:' + (mode === 'quiz' ? '260' : '330') + 'px;background:linear-gradient(180deg,#EAF4FF 0%,#F3FBFF 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        + '<div class="bs-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el, function (m) {
        mode = m; mStep = 0; mDone = false; mLock = false;
        if (raf) { clearTimeout(raf); raf = null; }
        clearLink();
        reset();
        if (m === 'quiz') { qScore = 0; qCount = 0; qUsed = []; newQuiz(); }
        build();
      });
      bands.bind(el);
      drawStage(); bind(); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage() {
      stage = el.querySelector('.bs-stage'); stage.innerHTML = '';
      svg = svgEl('svg', { viewBox: '0 0 360 520', width: '100%', height: '100%', style: 'max-height:46vh;display:block;margin:0 auto;' });
      stage.appendChild(svg);
    }
    function bodyOutline(g) {
      // 단순 사람 실루엣 (머리+몸통)
      g.appendChild(svgEl('ellipse', { cx: 180, cy: 48, rx: 38, ry: 42, fill: '#FCEEE3', stroke: '#D9B79C', 'stroke-width': 3 }));
      g.appendChild(svgEl('path', {
        d: 'M 130 95 Q 180 78 230 95 L 250 200 Q 252 300 235 400 L 215 470 L 145 470 L 125 400 Q 108 300 110 200 Z',
        fill: '#FCEEE3', stroke: '#D9B79C', 'stroke-width': 3
      }));
    }
    function bindOrganClicks() {
      svg.querySelectorAll('.bs-organ').forEach(function (c) {
        c.addEventListener('click', function () { pickOrgan(c.dataset.k); });
      });
    }
    function renderLink(g) {
      var HUB = ORGAN.heart;
      // 심장(허브) ↔ 각 기관계 대표 기관 연결선 (진행 단계까지만 진하게)
      var spokes = [
        { k:'sintest', col:SYS.digest.col,  step:0 },
        { k:'lungL',   col:SYS.breath.col,  step:1 },
        { k:'kidneyL', col:SYS.excrete.col, step:3 }
      ];
      spokes.forEach(function (n) {
        var o = ORGAN[n.k];
        var on = (linkRevealed || linkStep >= n.step);
        g.appendChild(svgEl('line', { x1:o.x, y1:o.y, x2:HUB.x, y2:HUB.y, stroke:n.col, 'stroke-width':(on?6:3), 'stroke-linecap':'round', opacity:(on?0.85:0.22) }));
      });
      // 순환이 온몸으로 배달(step2) — 심장에서 몸통 아래로
      var bodyOn = (linkRevealed || linkStep >= 2);
      g.appendChild(svgEl('line', { x1:HUB.x, y1:HUB.y, x2:HUB.x, y2:345, stroke:SYS.blood.col, 'stroke-width':(bodyOn?6:3), 'stroke-linecap':'round', opacity:(bodyOn?0.7:0.18) }));
      // 노드 원 (심장=허브 크게)
      var drawn = {};
      function node(k, col, big) {
        var o = ORGAN[k]; if (drawn[o.nm]) return; drawn[o.nm] = true;
        var r = big ? 24 : 18;
        g.appendChild(svgEl('circle', { cx:o.x, cy:o.y, r:r, fill:col, stroke:'#fff', 'stroke-width':3, class:'bs-organ', 'data-k':k }));
        var t = svgEl('text', { x:o.x, y:o.y+5, 'text-anchor':'middle', 'font-family':'Gowun Dodum,sans-serif', 'font-size':12, 'font-weight':800, fill:'#fff', 'pointer-events':'none' });
        t.textContent = o.nm.replace(/\(.*\)/, ''); g.appendChild(t);
      }
      node('sintest', SYS.digest.col, false);
      node('lungL',   SYS.breath.col, false);
      node('kidneyL', SYS.excrete.col, false);
      node('bladder', SYS.excrete.col, false);
      node('heart',   SYS.blood.col, true); // 허브
      // 현재 이동 중인 물질 라벨
      if (linkActive && linkStep >= 0 && linkStep < CROSS_STEPS.length) {
        var s = CROSS_STEPS[linkStep], hd = ORGAN[s.organ];
        g.appendChild(svgEl('circle', { cx:hd.x, cy:hd.y, r:29, fill:'none', stroke:C.vio, 'stroke-width':3, 'stroke-dasharray':'5 5', opacity:0.85 }));
        var lbl = svgEl('text', { x:180, y:502, 'text-anchor':'middle', 'font-family':'Gowun Dodum,sans-serif', 'font-size':22, 'font-weight':800, fill:C.vio });
        lbl.textContent = s.label + ' 이동!';
        g.appendChild(lbl);
      }
    }
    function renderScene() {
      if (!svg) return;
      svg.innerHTML = '';
      var g = svgEl('g', {});
      bodyOutline(g);
      if (linkActive || linkRevealed) { renderLink(g); svg.appendChild(g); bindOrganClicks(); return; }
      var s = SYS[sys], path = s.path;
      // 기관계 연결선(경로) 먼저
      var prev = null;
      path.forEach(function (k) {
        var o = ORGAN[k];
        if (prev) g.appendChild(svgEl('line', { x1: prev.x, y1: prev.y, x2: o.x, y2: o.y, stroke: s.col, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.45 }));
        prev = o;
      });
      // 기관(원) — 중복(heart2 등) 제거해 표시
      var seen = {};
      path.forEach(function (k, i) {
        var o = ORGAN[k]; var key = o.nm;
        var isFlowHead = (i === flowIdx);
        var passed = (flowIdx >= 0 && i < flowIdx);
        var rr = isFlowHead ? 22 : 17;
        if (!seen[key]) {
          seen[key] = true;
          g.appendChild(svgEl('circle', {
            cx: o.x, cy: o.y, r: rr, fill: (sel === k ? '#fff' : s.col),
            stroke: s.col, 'stroke-width': 4,
            opacity: (flowIdx < 0 || isFlowHead || passed) ? 1 : 0.85,
            class: 'bs-organ', 'data-k': k
          }));
          var lab = svgEl('text', { x: o.x, y: o.y + 5, 'text-anchor': 'middle', 'font-family': 'Gowun Dodum,sans-serif', 'font-size': 12, 'font-weight': 800, fill: (sel === k ? s.col : '#fff'), 'pointer-events': 'none' });
          lab.textContent = o.nm.replace(/\(.*\)/, '');
          g.appendChild(lab);
        }
      });
      // 흐르는 입자(현재 위치 강조 라벨)
      if (flowIdx >= 0 && flowIdx < path.length) {
        var head = ORGAN[path[flowIdx]];
        g.appendChild(svgEl('circle', { cx: head.x, cy: head.y, r: 28, fill: 'none', stroke: s.col, 'stroke-width': 3, 'stroke-dasharray': '5 5', opacity: 0.8 }));
      }
      svg.appendChild(g);
      bindOrganClicks();
    }
    function renderStatus() {
      var st = el.querySelector('.bs-status'); if (!st) return;
      if (mode === 'quiz') { st.innerHTML = '<div style="font-size:19px;color:#8aa0b6;">사람 그림 속 기관과 하는 일을 떠올리며 답을 골라요!</div>'; return; }
      if (linkActive || linkRevealed) {
        var lh = '<div style="font-size:23px;color:' + C.vio + ';">🔗 몸속은 하나로 이어져요</div>';
        var ls;
        if (linkActive && linkStep >= 0 && linkStep < CROSS_STEPS.length) ls = '<div style="font-size:18px;color:' + C.ink + ';margin-top:5px;">' + CROSS_STEPS[linkStep].msg + '</div>';
        else if (linkRevealed) ls = '<div style="font-size:18px;color:' + C.good + ';margin-top:5px;">소화·호흡·순환·배설이 <b>심장(피)</b>을 통해 하나로 이어졌어요! ✨</div>';
        else ls = '';
        st.innerHTML = lh + ls; return;
      }
      var s = SYS[sys];
      var head = '<div style="font-size:24px;color:' + s.col + ';">' + s.emo + ' ' + s.nm + '</div>';
      var sub;
      if (sel) sub = '<div style="font-size:20px;color:' + C.ink + ';margin-top:5px;"><b>' + ORGAN[sel].nm + '</b> — ' + ORGAN[sel].job + '</div>';
      else if (flowIdx >= 0 && flowIdx < s.path.length) sub = '<div style="font-size:19px;color:' + C.sub + ';margin-top:5px;">' + s.flow + '이(가) <b>' + ORGAN[s.path[flowIdx]].nm + '</b>을(를) 지나가요.</div>';
      else if (flowIdx >= s.path.length) sub = '<div style="font-size:19px;color:' + C.good + ';margin-top:5px;">' + s.flow + '이(가) ' + s.nm + '을(를) 끝까지 지나갔어요! ✨</div>';
      else sub = '<div style="font-size:17px;color:' + C.sub + ';margin-top:5px;">기관을 눌러 하는 일을 보고, ▶ 길 따라가기로 ' + s.flow + '의 길을 따라가 봐요.</div>';
      if (holdMsg) sub += '<div class="bs-hold" style="font-size:17px;color:' + C.vio + ';margin-top:7px;font-weight:800;">💡 ' + holdMsg + '</div>';
      st.innerHTML = head + sub;
    }

    function bind() {
      el.querySelectorAll('.bs-sys').forEach(function (b) { b.addEventListener('click', function () { setSys(b.dataset.sys); }); });
      el.querySelectorAll('.bs-wow').forEach(function (b) {
        b.addEventListener('click', function () { if (b.dataset.wow === 'arm') wowArm(); else wowReveal(); });
      });
      var pb = el.querySelector('[data-act="flow"]');
      if (pb) pb.addEventListener('click', function () {
        if (raf) return;
        if (linkArmed || linkActive || linkRevealed) { clearLink(); build(); return; }
        snd('select');
        var p = SYS[sys].path; flowIdx = -1;
        var step = function () {
          flowIdx++; snd('pop');
          renderScene(); renderStatus();
          if (flowIdx >= p.length) { raf = null; if (mode === 'mission') checkMission(); return; }
          raf = setTimeout(step, 750);
        };
        step();
      });
      var rb = el.querySelector('[data-act="reset"]');
      if (rb) rb.addEventListener('click', function () { if (raf) { clearTimeout(raf); raf = null; } if (linkArmed || linkActive || linkRevealed) { clearLink(); build(); return; } snd('select'); sel = ''; flowIdx = -1; renderScene(); renderStatus(); });
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
    return function cleanup() { if (raf) { clearTimeout(raf); raf = null; } clearLinkTimers(); if(flashTimer){clearTimeout(flashTimer);flashTimer=null;} };
  });
})();
