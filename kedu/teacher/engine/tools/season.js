/* ============================================================================
   케이랩 도구 모듈 — 계절의 변화 (season) v3  [과학 9호 · 천체 4호 · 3층]
   6학년 계절의 변화 — 자전축 기울기와 공전.
   하이브리드:
     ▸ 3D 공전 — 태양 중심, 지구가 궤도를 공전. 자전축은 우주 공간에서
        방향이 일정하게 기울어진 채 돈다(항상 같은 쪽). 그래서 공전 위치에 따라
        북반구가 태양 쪽(여름)·반대쪽(겨울)이 자동으로 생긴다.
     ▸ 2D '우리나라에서 본 태양' 패널 — 그 계절 정오의 남중고도(태양 높이) 옆모습.
   변수 → 현상 → 발견:
     공전 위치(봄·여름·가을·겨울) + 자전축 기울기 슬라이더 →
       ▸ 여름: 북반구가 태양 쪽 → 남중고도 높고 낮이 길다
       ▸ 겨울: 북반구가 반대쪽 → 남중고도 낮고 낮이 짧다
       ▸ 기울기를 0으로 → 남중고도·낮 길이가 사철 똑같아 계절이 사라진다 (오개념 직격)
     "계절은 지구-태양 거리 때문이 아니라, 자전축이 기울어진 채 공전하기 때문."
   - 의존: THREE (전역, preview의 vendor/three.min.js), window.KLab
   v3 · 3층: 미션 6단계(만들기↔생각형) + 🌀 만약에(기울기 90°=진짜 천왕성!,
       남반구 호주=크리스마스가 한여름, 공전 멈춤=영원한 한 계절).
   - config: { orb(0~360, 0=춘분·90=하지·180=추분·270=동지, 기본 90),
               tilt(0~35, 기본 23.5), lat(기본 37.5), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  // ── 순수 계산(THREE 불필요)
  // 태양 적위 δ = ε·sin(공전각). 공전각 0=춘분·90=하지·180=추분·270=동지.
  function decl(orb, tilt){ return tilt * Math.sin(orb*Math.PI/180); }   // °
  // 남중고도 = 90 − |위도 − δ|
  function noonAlt(orb, tilt, lat){ return 90 - Math.abs(lat - decl(orb,tilt)); }
  // 낮 길이(시간): cosH = −tan(위도)·tan(δ), 낮길이 = 2·H(deg)/15
  function dayHours(orb, tilt, lat){
    var d = decl(orb,tilt)*Math.PI/180, la = lat*Math.PI/180;
    var c = -Math.tan(la)*Math.tan(d);
    c = Math.max(-1, Math.min(1, c));                 // 위도37.5에선 안 넘지만 안전장치
    var H = Math.acos(c)*180/Math.PI;                 // 반일주각(°)
    return 2*H/15;
  }
  // 계절 판정 — 기울기 0이면 계절이 없다.
  function seasonOf(orb, tilt){
    if(tilt <= 1) return {k:'none', nm:'계절 없음', emo:'⚪', col:'#9DB2C8'};
    orb = ((orb%360)+360)%360;
    if(orb>=45 && orb<135)  return {k:'summer', nm:'여름', emo:'☀️', col:'#FF922B'};
    if(orb>=225 && orb<315) return {k:'winter', nm:'겨울', emo:'❄️', col:'#4DABF7'};
    if(orb>=135 && orb<225) return {k:'fall',   nm:'가을', emo:'🍂', col:'#E8590C'};
    return                         {k:'spring', nm:'봄',   emo:'🌸', col:'#F06595'};
  }

  window.KLab.register('season', function (el, config) {
    var orb  = (config.orb!=null)?config.orb:90;
    var tilt = (config.tilt!=null)?config.tilt:23.5;
    var lat  = (config.lat!=null)?config.lat:37.5;
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    /* ── 학년 칸 (헌법 3장) — 같은 기울기 무대 공유, 노출(슬라이더)·미션·만약에·모드탭만 칸별 스왑 ──
       저=사계절 통합(계절 버튼만) / 중=계절과 태양높이(재생+공전) / 고=자전축 기울기 원리(기울기 슬라이더 풀버전). */
    var GRADES={
      low:  { modes:['free','mission','quiz'],          showPlay:false, showOrb:false, showTilt:false, mIdx:[0,1,2],       wif:[],                       hint:'계절 버튼을 눌러 봄·여름·가을·겨울 해의 높이를 비교해 봐요.' },
      mid:  { modes:['free','mission','quiz','whatif'],  showPlay:true,  showOrb:true,  showTilt:false, mIdx:[0,1,2],       wif:['south'],                hint:'▶ 1년 재생으로 계절마다 해 높이·낮 길이가 달라지는 걸 봐요.' },
      high: { modes:['free','mission','quiz','whatif'],  showPlay:true,  showOrb:true,  showTilt:true,  mIdx:[0,1,2,3,4,5], wif:['ura','south','stops'],  hint:'🌐 자전축 기울기를 0으로 내려 보세요 — 계절이 사라질까요?' }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; wif.reset(); mode='free'; mStep=0;mDone=false;mLock=false; playing=false; orb=90; tilt=23.5; dayCnt=0; southOn=false;
      makeWif(); buildUI();
    }});
    function curMissions(){ return GRADES[grade].mIdx.map(function(i){return MISSIONS[i];}); }
    var playing=false, alive=true, last=0, spin=0;
    var C={ink:'#1B3A57',sub:'#5a7894',mute:'#8aa0b6',good:'#12B886'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var SEASONS=[ {k:'spring',o:0,l:'🌸 봄(춘분)'},{k:'summer',o:90,l:'☀️ 여름(하지)'},
                  {k:'fall',o:180,l:'🍂 가을(추분)'},{k:'winter',o:270,l:'❄️ 겨울(동지)'} ];

    /* ───────────── 미션 6단계 (만들기 ↔ 생각형) ───────────── */
    var MISSIONS=[
      { type:'make', text:'☀️ <b style="color:#7048E8;">여름(하지)</b> 위치로! 남중고도가 가장 높아지는 곳을 찾아요!',
        check:function(){ return tilt>5 && decl(orb,tilt) >= tilt*0.93; } },
      { type:'think', text:'🤔 여름이 더 <b style="color:#7048E8;">더운 까닭</b>은 무엇일까요?',
        ch:['남중고도가 높아 햇빛이 곧게(세게) 들어와서','지구가 태양에 더 가까워져서','여름엔 바람이 안 불어서'], a:0,
        why:'거리가 아니라 각도! 햇빛이 높이서 곧게 내리쬐면 같은 땅에 더 많은 열이 모여요. 손전등을 바닥에 똑바로 vs 비스듬히 비춰 보면 알 수 있죠.' },
      { type:'make', text:'❄️ 이번엔 <b style="color:#7048E8;">겨울(동지)</b> — 남중고도가 가장 낮아져요!',
        check:function(){ return tilt>5 && decl(orb,tilt) <= -tilt*0.93; } },
      { type:'make', text:'🔭 자전축 <b style="color:#7048E8;">기울기를 0°</b>으로! 계절이 사라지는지 확인해요!',
        check:function(){ return tilt <= 1; } },
      { type:'think', text:'🤔 기울기가 0°이 되니 계절이 사라졌어요. <b style="color:#7048E8;">왜</b>일까요?',
        ch:['공전해도 햇빛 받는 각도가 일 년 내내 똑같아져서','태양이 멀어져서','지구가 자전을 멈춰서'], a:0,
        why:'계절의 진짜 원인 = 기울어진 채 공전! 축이 똑바로 서면 어디를 돌아도 남중고도와 낮 길이가 그대로예요.' },
      { type:'make', text:'🌐 기울기를 다시 <b style="color:#7048E8;">20° 넘게</b> 올려 계절을 되살려 봐요!',
        check:function(){ return tilt >= 20; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function advanceMission(){
      mLock=false;
      var CM=curMissions(); if(mStep<CM.length-1){ mStep++; if(CM[mStep].set)CM[mStep].set(); }
      else mDone=true;
      updateBars(); missionFoot(); render(); renderStatus();
    }
    function missionFoot(){
      var CM=curMissions(); ui.thinkFoot(el,{foot:'.se-foot',bar:'.se-bars'},(mode==='mission'&&!mDone&&CM[mStep]&&CM[mStep].type==='think')?CM[mStep]:null,advanceMission);
    }
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var m=curMissions()[mStep]; if(!m||m.type!=='make')return;
      if(m.check()){
        mLock=true; ui.toast(el,true);
        setTimeout(advanceMission,1500);
      }
    }
    function updateBars(){
      var host=el.querySelector('.se-bars'); if(!host)return;
      if(mode==='mission'){var CM=curMissions();host.innerHTML=mDone?ui.doneBar():ui.missionBar(CM[mStep].text,mStep,CM.length);}
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else if(mode==='whatif')host.innerHTML=wif.barHTML();
      else host.innerHTML='';
    }

    /* ───────────── 🌀 만약에 (계절의 규칙을 바꿔 보기) ───────────── */
    var dayCnt=0, southOn=false;
    var WHATIF={
      ura:{ icon:'🪐', title:'기울기가 90°라면? (진짜 천왕성!)',
        q:'자전축이 아예 옆으로 누우면(90°), 계절은 어떻게 될까요?',
        ch:['반년 낮·반년 밤의 어마어마한 계절이 돼요','계절이 사라져요','지금과 비슷해요'], a:0,
        reveal:'이건 상상이 아니라 진짜 천왕성 이야기! 옆으로 누워 도는 천왕성은 한쪽 극이 42년 낮, 42년 밤이에요. 기울기가 클수록 계절도 극단이 돼요.',
        tip:'공전 위치를 돌려 봐요 — 남중고도가 0°에서 꼭대기까지 널뛰어요!' },
      south:{ icon:'🦘', title:'남반구(호주)에 산다면?',
        q:'호주의 12월 크리스마스는 어떤 계절일까요?',
        ch:['한여름이에요!','한겨울이에요','봄이에요'], a:0,
        reveal:'북반구가 태양 반대로 기울 때, 남반구는 태양 쪽으로 기울어요! 그래서 계절이 정반대 — 호주의 산타는 서핑보드를 타요. 🏄',
        tip:'☀️ 여름 / ❄️ 겨울 버튼을 눌러 봐요 — 호주 기준으로는 계절이 뒤집혀 나와요!' },
      stops:{ icon:'⏸', title:'공전을 멈춘다면?',
        q:'지구가 공전을 딱 멈추면, 계절은 어떻게 될까요?',
        ch:['한 계절이 영원히 계속돼요','지금처럼 돌아요','계절이 더 빨라져요'], a:0,
        reveal:'계절이 바뀌는 건 기울어진 채 공전하기 때문! 멈추면 그 위치의 계절이 영원히 — 여름에서 멈췄다면 끝나지 않는 여름이에요.',
        tip:'▶ 시간 흐르기 — 날짜가 흘러도 남중고도·계절이 그대로!' }
    };
    var wif;
    function makeWif(){
      var keys=GRADES[grade].wif, scen={};
      keys.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){buildUI();},
        footEl:function(){return el.querySelector('.se-foot');},
        onSelect:function(k){ playing=false; dayCnt=0; southOn=(k==='south');
          tilt=(k==='ura')?90:23.5; orb=90; },
        onPlay:function(){ dayCnt=0; },
        onExit:function(){ playing=false; dayCnt=0; southOn=false; tilt=23.5; orb=90; }
      });
    }
    makeWif();

    /* ───────────── 퀴즈 (기울어진 지구 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { orb:90,  tilt:23.5, q:'북반구(북극 쪽)가 태양 쪽으로 기울어 있어요. 우리나라는 어떤 계절일까요?', ch:['여름','겨울','가을'], a:0 },
      { orb:270, tilt:23.5, q:'북반구가 태양 반대쪽으로 기울었어요. 지금 우리나라는?', ch:['겨울','여름','봄'], a:0 },
      { orb:90,  tilt:23.5, q:'계절이 생기는 진짜 까닭은 무엇일까요?', ch:['자전축이 기울어진 채 공전해서','태양과의 거리가 변해서','달이 지구를 끌어당겨서'], a:0 },
      { orb:90,  tilt:0,    q:'자전축 기울기가 0°이 되면 어떻게 될까요?', ch:['계절이 사라져요','여름만 계속돼요','겨울만 계속돼요'], a:0 },
      { orb:90,  tilt:23.5, q:'여름에 낮이 더 긴 까닭은?', ch:['남중고도가 높아 태양이 오래 떠 있어서','지구가 태양에 가까워져서','달이 늦게 떠서'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      orb=QUIZ[qIdx].orb; tilt=QUIZ[qIdx].tilt;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }
    function bindChoices(){
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); updateBars();
            var fc=el.querySelector('.se-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }
    function seasonBtns(){return SEASONS.map(function(s){return '<button class="se-sea" data-o="'+s.o+'" style="'+sbtn+'">'+s.l+'</button>';}).join('');}

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var frozen=(wif.active()&&wif.state.key==='stops');
      var uraOn=(wif.active()&&wif.state.key==='ura');
      if(mode==='mission'){var CMB=curMissions();bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length);}
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); }
      el.innerHTML='<style>.se-btn:active,.se-sea:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.se-sea.on{background:#1565C0 !important;border-color:#1565C0 !important;color:#fff !important;}'
        +'.se-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#10183A,#5C7CFA,#FFD43B);outline:none;}'
        +'.se-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.se-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.se-tilt{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#9DB2C8,#FF922B);outline:none;}'
        +'.se-tilt::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #E8590C;cursor:pointer;}'
        +'.se-tilt::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #E8590C;cursor:pointer;}</style>'
        + top + '<div class="se-bars">'+bar+'</div>'
        +((mode==='quiz'||(mode==='whatif'&&!wif.active()))?'<div style="display:none;">':'<div>')
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'+seasonBtns()+'</div>'
        +(GRADES[grade].showOrb?('<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="se-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':(frozen?'▶ 시간 흐르기':'▶ 1년 재생'))+'</button>'
          +'<span style="font-size:15px;color:#5a7894;font-weight:800;">공전 위치</span>'
          +'<input class="se-range" type="range" min="0" max="360" step="1" value="'+orb+'" '+(frozen?'disabled':'')+' style="width:min(40vw,280px);'+(frozen?'opacity:.4;':'')+'">'
        +'</div>'):'')
        +(GRADES[grade].showTilt?('<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<span style="font-size:15px;color:#E8590C;font-weight:800;">🌐 자전축 기울기</span>'
          +'<input class="se-tilt" type="range" min="0" max="35" step="0.5" value="'+Math.min(tilt,35)+'" '+((frozen||uraOn)?'disabled':'')+' style="width:min(40vw,280px);'+((frozen||uraOn)?'opacity:.4;':'')+'">'
          +'<span class="se-tval" style="font-size:18px;font-weight:800;color:#E8590C;min-width:54px;text-align:center;font-family:inherit;"></span>'
        +'</div>'):'')
        +'</div>'
        +'<div class="kl-stage-host" style="position:relative;"><div class="se-stage" style="position:relative;width:100%;height:'+(mode==='quiz'?'36vh':'42vh')+';min-height:'+(mode==='quiz'?'260':'320')+'px;background:radial-gradient(120% 120% at 60% 35%,#0D1430 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +'<div class="se-sunpath" style="position:absolute;bottom:12px;left:12px;width:226px;text-align:center;pointer-events:none;background:rgba(8,12,26,0.62);border-radius:14px;padding:7px 6px 5px;">'
            +'<svg class="se-spsvg" viewBox="-84 -50 168 92" width="218" height="118">'
              +'<defs><linearGradient id="seSp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2a52"/><stop offset="1" stop-color="#314a86"/></linearGradient></defs>'
              +'<rect x="-84" y="-50" width="168" height="84" fill="url(#seSp)" rx="6"/>'
              +'<g class="se-spg"></g>'
              +'<line x1="-80" y1="26" x2="80" y2="26" stroke="#6b8a4a" stroke-width="3"/>'
              +'<rect x="-80" y="26" width="160" height="8" fill="#3f5a28"/>'
              +'<text x="-72" y="23" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">동</text>'
              +'<text x="0" y="-40" text-anchor="middle" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">남</text>'
              +'<text x="72" y="23" text-anchor="end" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">서</text>'
            +'</svg>'
            +'<div class="se-spcap" style="font-size:12px;color:#cdd6e6;font-weight:800;margin-top:1px;">하루 동안 태양의 길과 막대 그림자</div>'
          +'</div>'
          +'<div class="se-panel" style="position:absolute;top:12px;right:12px;width:150px;text-align:center;pointer-events:none;background:rgba(8,12,26,0.55);border-radius:14px;padding:7px 6px 5px;">'
            +'<svg class="se-sky" viewBox="-65 -52 130 78" width="142" height="85">'
              +'<defs><linearGradient id="seSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2e54"/><stop offset="1" stop-color="#4a6aa0"/></linearGradient></defs>'
              +'<rect x="-65" y="-52" width="130" height="76" fill="url(#seSky)" rx="6"/>'
              +'<path class="se-arc" d="" fill="none" stroke="#FFE08A" stroke-width="2" stroke-dasharray="3 3" opacity="0.7"/>'
              +'<line x1="-60" y1="22" x2="60" y2="22" stroke="#6b8a4a" stroke-width="3"/>'
              +'<rect x="-60" y="22" width="120" height="6" fill="#3f5a28"/>'
              +'<line class="se-pole" x1="0" y1="22" x2="0" y2="11" stroke="#cdd6e6" stroke-width="2.5"/>'
              +'<circle class="se-sun2d" cx="0" cy="0" r="6" fill="#FFD43B"/>'
              +'<text class="se-alt" x="0" y="-44" text-anchor="middle" fill="#FFF3BF" font-size="11" font-weight="800" font-family="inherit"></text>'
            +'</svg>'
            +'<div style="font-size:12px;color:#cdd6e6;font-weight:800;margin-top:1px;">우리나라 정오의 태양</div>'
          +'</div>'
        +'</div></div>'
        +'<div class="se-foot">'+foot+'</div>'
        +'<div class="se-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; playing=false; orb=(m==='mission')?0:90; tilt=23.5;
        dayCnt=0; southOn=false;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindChoices(); bands.bind(el);
      if(mode==='whatif')wif.bind(el);
      if(mode==='mission')missionFoot();
      render(); renderStatus();
    }

    var stage,scene,camera,renderer,earthPivot,earthSphere,pin,orbitR=5;
    function earthTex(){
      var c=document.createElement('canvas'); c.width=256; c.height=128; var x=c.getContext('2d');
      x.fillStyle='#1565C0'; x.fillRect(0,0,256,128);
      x.fillStyle='#2F9E44';
      [[40,42,34,26],[95,38,42,30],[150,72,40,24],[200,46,34,28]].forEach(function(b){x.beginPath();x.ellipse(b[0],b[1],b[2],b[3],0,0,7);x.fill();});
      x.strokeStyle='rgba(255,255,255,0.16)'; x.lineWidth=1;
      for(var la=0;la<=128;la+=21){x.beginPath();x.moveTo(0,la);x.lineTo(256,la);x.stroke();}
      return new T.CanvasTexture(c);
    }
    function initThree(){
      if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
      stage=el.querySelector('.se-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||340;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(42, W/H, 0.1, 100);
      renderer=new T.WebGLRenderer({antialias:true, alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff,0.18));
      var sunLight=new T.PointLight(0xffffff,2.1,0); sunLight.position.set(0,0,0); scene.add(sunLight);  // 태양=원점
      // 태양(중심 표식)
      var sc=document.createElement('canvas'); sc.width=128; sc.height=128; var sx=sc.getContext('2d');
      var g=sx.createRadialGradient(64,64,6,64,64,62); g.addColorStop(0,'#FFFBEA'); g.addColorStop(0.45,'#FFD43B'); g.addColorStop(1,'rgba(255,170,40,0)');
      sx.fillStyle=g; sx.fillRect(0,0,128,128);
      var sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc),transparent:true,depthTest:false}));
      sunSpr.position.set(0,0,0); sunSpr.scale.set(2.6,2.6,1); scene.add(sunSpr);
      // 궤도 링
      var ring=new T.Mesh(new T.RingGeometry(orbitR-0.025,orbitR+0.025,80), new T.MeshBasicMaterial({color:0x3a4a6a,side:T.DoubleSide,transparent:true,opacity:0.55}));
      ring.rotation.x=Math.PI/2; scene.add(ring);
      // 4계절 위치 마커(궤도 위, 고정)
      SEASONS.forEach(function(s){ var p=earthPos(s.o);
        var m=new T.Mesh(new T.SphereGeometry(0.1,12,8), new T.MeshBasicMaterial({color:0x6b7da0}));
        m.position.set(p.x,0,p.z); scene.add(m); });
      // 지구 pivot(공전 위치) — 자전축 기울기는 pivot.rotation.z로 '월드 고정 방향'
      earthPivot=new T.Group(); scene.add(earthPivot);
      earthSphere=new T.Mesh(new T.SphereGeometry(0.62,40,28), new T.MeshStandardMaterial({map:earthTex(),roughness:1,metalness:0}));
      earthPivot.add(earthSphere);
      // 우리나라 핀(자전 따라감 → earthSphere 자식, 위도 lat·경도 0)
      var latr=lat*Math.PI/180, pr=0.64;
      pin=new T.Mesh(new T.SphereGeometry(0.07,14,10), new T.MeshBasicMaterial({color:0xE03131}));
      pin.position.set(Math.cos(latr)*pr, Math.sin(latr)*pr, 0); earthSphere.add(pin);
      // 자전축 선(기울기만, 자전 안 함 → pivot 직속)
      var axis=new T.Mesh(new T.CylinderGeometry(0.022,0.022,2.0,8), new T.MeshBasicMaterial({color:0xFFD43B}));
      earthPivot.add(axis);
      var npole=new T.Mesh(new T.SphereGeometry(0.08,12,8), new T.MeshBasicMaterial({color:0xFFE08A}));
      npole.position.set(0,1.0,0); earthPivot.add(npole);   // 북극 표식
      theta=0.78; phi=0.72; camPos();
    }
    var theta=0.78, phi=0.72, radius=11.5;
    function camPos(){ if(!camera)return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }

    // 지구 궤도 위치: φ=(orb+90)° → orb=90(하지) 때 지구 -X(북극이 태양 쪽), orb=270(동지) 때 +X
    function earthPos(o){ var ph=(o+90)*Math.PI/180; return {x:orbitR*Math.cos(ph), z:orbitR*Math.sin(ph)}; }

    function renderSunPath(){
      var g=el.querySelector('.se-spg'); if(!g)return;
      g.innerHTML='';
      function S(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
      var alt=Math.max(0,noonAlt(orb,tilt,lat)), dh=Math.max(0.5,dayHours(orb,tilt,lat));
      var half=Math.min(76, dh/24*152/2+18);          // 낮 길이 → 경로 폭
      var peak=26-(alt/90)*62;                        // 남중고도 → 꼭대기 높이
      // 참조: 기울기 0°(계절 없음)의 경로 — 점선
      var alt0=90-Math.abs(lat), peak0=26-(alt0/90)*62, half0=Math.min(76,12/24*152/2+18);
      g.appendChild(S('path',{d:'M '+(-half0)+' 26 Q 0 '+peak0.toFixed(1)+' '+half0+' 26',stroke:'#7d8db5','stroke-width':1.4,fill:'none','stroke-dasharray':'4 4',opacity:0.65}));
      // 현재 경로
      g.appendChild(S('path',{d:'M '+(-half)+' 26 Q 0 '+peak.toFixed(1)+' '+half+' 26',stroke:'#FFD43B','stroke-width':2.6,fill:'none',class:'se-sparc'}));
      // 남중 태양
      var sy=26-(26-peak)*0.99;
      g.appendChild(S('circle',{cx:0,cy:Math.max(sy,peak).toFixed(1),r:5,fill:'#FFD43B',class:'se-spsun'}));
      // 해 뜨고 지는 시각
      var rise=12-dh/2, set=12+dh/2;
      function hm(h){ var H=Math.floor(h), M=Math.round((h-H)*60); if(M===60){H++;M=0;} return H+'시'+(M?(' '+M+'분'):''); }
      var tr=S('text',{x:-half,y:14,'text-anchor':'middle',fill:'#FFE08A','font-size':8,'font-weight':800,'font-family':'inherit'}); tr.textContent='↑'+hm(rise); g.appendChild(tr);
      var ts=S('text',{x:half,y:14,'text-anchor':'middle',fill:'#FFE08A','font-size':8,'font-weight':800,'font-family':'inherit'}); ts.textContent='↓'+hm(set); g.appendChild(ts);
      // 막대와 그림자 (정오 기준): 그림자 길이 = 막대÷tan(남중고도)
      var sx=44, h2=13;
      var shadow=(alt>2)?Math.min(h2/Math.tan(alt*Math.PI/180),52):52;
      g.appendChild(S('line',{x1:sx,y1:30,x2:sx-shadow,y2:30,stroke:'#0e1426','stroke-width':5,'stroke-linecap':'round',opacity:0.85,class:'se-shadow'}));
      g.appendChild(S('line',{x1:sx,y1:30,x2:sx,y2:30-h2,stroke:'#D9A066','stroke-width':3.2,'stroke-linecap':'round'}));
      var cap=el.querySelector('.se-spcap');
      if(cap)cap.textContent=(tilt<=1)?'기울기 0° — 일 년 내내 같은 길, 같은 그림자':('남중고도 '+Math.round(alt)+'° → 그림자가 '+(alt>=60?'짧아요':(alt<=35?'길어요':'중간이에요'))+' · 낮 '+dh.toFixed(1)+'시간');
    }
    function render(){
      if(earthPivot){
        var p=earthPos(orb); earthPivot.position.set(p.x,0,p.z);
        earthPivot.rotation.z = tilt*Math.PI/180;     // 월드 고정 방향(+X쪽)으로 기울기
      }
      if(earthSphere) earthSphere.rotation.y = spin;   // 자전(시각 디테일)
      // 2D 패널: 남중고도 호
      var alt=Math.max(0,noonAlt(orb,tilt,lat));
      var altH = alt/90*60;                            // 정점 높이(픽셀)
      var arc=el.querySelector('.se-arc'), sun2d=el.querySelector('.se-sun2d');
      if(arc) arc.setAttribute('d','M -55 22 Q 0 '+(22-2*altH).toFixed(1)+' 55 22');
      if(sun2d) sun2d.setAttribute('cy', (22-altH).toFixed(1));
      var altT=el.querySelector('.se-alt'); if(altT) altT.textContent='남중고도 '+Math.round(alt)+'°';
      renderSunPath();
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
      spin += dt*0.9;                                  // 지구 자전 항상 살짝
      if(playing&&wif.active()&&wif.state.key==='stops'){ if(!last)last=now; var dtf=Math.min((now-last)/1000,0.05); last=now; dayCnt+=dtf*8; renderStatus(); render(); requestAnimationFrame(loop); return; }
      if(playing){ orb=(orb+dt*36)%360;                // 약 10초에 1년
        var r=el.querySelector('.se-range'); if(r)r.value=orb; renderStatus(); }
      render();
      requestAnimationFrame(loop);
    }

    function renderStatus(){
      var tv=el.querySelector('.se-tval'); if(tv)tv.textContent=tilt.toFixed(1)+'°';
      if(mode==='quiz'){ var sq=el.querySelector('.se-status'); if(sq)sq.innerHTML='<div style="font-size:19px;color:#8aa0b6;">기울어진 지구와 \'우리나라 정오의 태양\' 패널을 보고 답을 골라요!</div>'; return; }
      if(mode==='whatif'){
        var sw=el.querySelector('.se-status'); if(!sw)return;
        if(wif.state.phase==='pick'){ sw.innerHTML='<div style="font-size:19px;color:#8aa0b6;">카드를 골라 계절의 규칙을 바꿔 봐요 — 상상이 곧 실험!</div>'; return; }
        if(wif.state.phase==='predict'){ sw.innerHTML='<div style="font-size:19px;color:#8aa0b6;">정답 걱정 없이 네 생각을 먼저! 그게 과학자의 첫걸음이에요.</div>'; return; }
        var seaW=seasonOf(orb,tilt);
        if(wif.state.key==='stops'){ sw.innerHTML='<div style="font-size:32px;color:#0B7285;">📅 +'+Math.floor(dayCnt)+'일</div><div style="font-size:18px;color:#5a7894;margin-top:3px;">날짜가 흘러도 '+seaW.emo+' '+seaW.nm+' 그대로 — 계절은 공전이 만들어요!</div>'; return; }
        if(wif.state.key==='south'){
          var FLIP={summer:['❄️','겨울'],winter:['☀️','여름'],spring:['🍂','가을'],fall:['🌸','봄'],none:['⚪','계절 없음']};
          var f=FLIP[seaW.k]||FLIP.none;
          sw.innerHTML='<div style="font-size:22px;color:#0B7285;">🦘 호주 기준: 지금은 '+f[0]+' <b>'+f[1]+'</b>! (우리나라는 '+seaW.emo+' '+seaW.nm+')</div>'
            +'<div style="font-size:17px;color:#5a7894;margin-top:4px;">북반구와 남반구는 기우는 방향이 반대 — 계절도 정반대예요.</div>'; return; }
        sw.innerHTML='<div style="font-size:22px;color:#0B7285;">🪐 기울기 90° — 진짜 천왕성처럼! 남중고도 '+Math.round(noonAlt(orb,tilt,lat))+'°</div>'
          +'<div style="font-size:17px;color:#5a7894;margin-top:4px;">공전 위치에 따라 해가 안 뜨거나, 종일 떠 있는 극단의 계절이에요.</div>'; return;
      }
      var alt=noonAlt(orb,tilt,lat), dh=dayHours(orb,tilt,lat), sea=seasonOf(orb,tilt);
      var s=el.querySelector('.se-status'), sub;
      if(sea.k==='none')
        sub='자전축이 똑바로 서 있어요(기울기 0°). 공전 위치를 아무리 바꿔도 남중고도 52°·낮 12시간 그대로 — 계절이 생기지 않아요.';
      else if(sea.k==='summer')
        sub='북반구가 태양 쪽으로 기울어 태양을 정면에 가깝게 받아요. 그래서 남중고도가 높고 낮이 길어 더워요.';
      else if(sea.k==='winter')
        sub='북반구가 태양 반대쪽으로 기울어 태양을 비스듬히 받아요. 그래서 남중고도가 낮고 낮이 짧아 추워요.';
      else
        sub='북반구가 태양 쪽도 반대쪽도 아니에요. 남중고도와 낮 길이가 여름·겨울의 중간이에요.';
      s.innerHTML='<div style="font-size:25px;color:'+sea.col+';">'+sea.emo+' '+sea.nm
          +(sea.k!=='none'?' · 남중고도 '+Math.round(alt)+'° · 낮 '+dh.toFixed(1)+'시간':'')+'</div>'
        +'<div style="font-size:17px;color:'+C.sub+';margin-top:5px;">'+sub+'</div>'
        +'<div style="font-size:15px;color:'+C.mute+';margin-top:4px;">계절이 생기는 건 지구-태양 거리 때문이 아니라, 자전축이 기울어진 채 공전하기 때문이에요.</div>';
      // 계절 버튼 활성 표시
      el.querySelectorAll('.se-sea').forEach(function(b){ var on=Math.abs(((orb-(+b.dataset.o))%360+360)%360)<8 || Math.abs(((orb-(+b.dataset.o))%360+360)%360-360)<8;
        b.classList.toggle('on', on); });
      checkMission();
    }
    function setOrb(v){ if(wif.active()&&wif.state.key==='stops')return; orb=((v%360)+360)%360; var r=el.querySelector('.se-range'); if(r&&+r.value!==orb)r.value=orb; render(); renderStatus(); }
    function setTilt(v){ if(wif.active()&&(wif.state.key==='stops'||wif.state.key==='ura'))return; tilt=Math.max(0,Math.min(35,v)); var r=el.querySelector('.se-tilt'); if(r&&+r.value!==tilt)r.value=tilt; render(); renderStatus(); }
    var _mv,_up;
    function bind(){
      var rg=el.querySelector('.se-range'); if(rg)rg.addEventListener('input',function(e){ if(playing)togglePlay(); setOrb(+e.target.value); });
      var tg=el.querySelector('.se-tilt'); if(tg)tg.addEventListener('input',function(e){ setTilt(+e.target.value); });
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',togglePlay);
      el.querySelectorAll('.se-sea').forEach(function(b){b.addEventListener('click',function(){ if(playing)togglePlay(); setOrb(+b.dataset.o); });});
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.25,Math.min(1.45,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
      function up(){drag=false;if(stage)stage.style.cursor='grab';}
      stage.addEventListener('mousedown',dn); stage.addEventListener('touchstart',dn,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){mv(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      _mv=mv;_up=up; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    }
    function togglePlay(){ playing=!playing; last=0;
      var b=el.querySelector('[data-act="play"]'); if(!b)return;
      b.textContent=playing?'■ 멈춤':'▶ 1년 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
