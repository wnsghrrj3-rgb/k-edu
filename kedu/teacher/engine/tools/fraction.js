/* ============================================================================
   케이랩 도구 모듈 — 분수 모형 (fraction) v7 · KLab.ui 3모드 통일
   v6 초점 = 다양한 사고. "면적 한 칸"에 갇혔던 분수를 네 가지 표상으로 자유롭게.
     같은 Sn/Sd 분수를 표상 버튼으로 즉시 갈아끼우며 본다(이렇게도·저렇게도):
       ▸ 면적(area)     — 전체를 나눈 조각 (막대/원/격자) … v4~v5 자산
       ▸ 수직선(line)   — 0~N 위의 '위치/길이'로. "1/2은 절반 지점"
       ▸ 묶음(set)      — 셀 수 있는 개수의 분수. "12개의 1/4 = 3개"
       ▸ 몫(quotient)   — 나눗셈으로서. "3개를 4명이 나누면 한 명 3/4"
     + 양방향 퀴즈: [만들기](목표→그림) ↔ [맞히기](그림→분수 알아맞히기)
   깊이 3축(통분+오개념가드 / 동치 발견 / 자기점검)은 v5에서 유지.
   모두 config 토글 → 기존 차시 동작 불변. 표상 1호 표준 = 다른 도구로 복제.

   v7: 겉 셸을 KLab.ui 3모드(자유탐구/미션/퀴즈)로 통일. 자유탐구 = 기존
       한 개 보기/두 개 비교, 퀴즈 = 기존 양방향(만들기/맞히기) + 표준 점수·토스트.
       옛 config.mode='single'|'compare'|'quiz'는 그대로 호환.
   - 의존: window.KLab
   - config: { mode:"free"|"mission"|"quiz"(신) 또는 "single"|"compare"|"quiz"(구),
               model:"area"|"line"|"set"|"quotient",
               models:[...](노출 표상, 기본 4종), shape:"bar"|"circle"|"grid",
               denom, numer, maxDenom, maxWholes(기본3), notation, setPer(기본2),
               a:{}, b:{}, equiv(true), commonize(true), showQuiz(false), quizDir:"make"|"guess" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={aTop:'#38D9A9',a:'#12B886',aEdge:'#0B7A5C',bTop:'#FFB066',b:'#FF8A3D',bEdge:'#C24E0E',
         empty:'#E7F1FB',emptyEdge:'#B8CFE8',seam:'#FFFFFF',num:'#0CA678',den:'#1565C0',whole:'#7048E8',
         warn:'#E8590C',good:'#12B886',hint:'#1565C0',line:'#8FA9C4',mark:'#7048E8'};
  function bestCols(n){var x=1,t=Math.sqrt(n);for(var c=1;c<=n;c++)if(n%c===0&&Math.abs(c-t)<Math.abs(x-t))x=c;return x;}
  function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
  function lcm(a,b){return a/gcd(a,b)*b;}
  var ALLM=['area','line','set','quotient'], MLABEL={area:'▭ 면적',line:'┼ 수직선',set:'⦿ 묶음',quotient:'➗ 나눗셈'};

  window.KLab.register('fraction', function (el, config) {
    var ui=window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 표상/난이도 사다리 ── */
    var GRADES={
      low:  { modes:['free','mission'],        models:['area'],                       notation:false, equiv:false, compare:false, maxDenom:6,  quizDirs:[] },
      mid:  { modes:['free','mission','quiz'], models:['area','line'],                notation:true,  equiv:true,  compare:true,  maxDenom:12, quizDirs:['make'] },
      high: { modes:['free','mission','quiz'], models:['area','line','set','quotient'], notation:true, equiv:true,  compare:true,  maxDenom:12, quizDirs:['make','guess'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    var maxDenom=(typeof config.maxDenom==='number'&&config.maxDenom>=2)?Math.min(config.maxDenom,G().maxDenom):G().maxDenom;
    var maxWholes=(typeof config.maxWholes==='number'&&config.maxWholes>=1)?config.maxWholes:3;
    var klMode;                                   // 겉 셸: free | mission | quiz
    if(config.mode==='mission')klMode='mission';
    else if(config.mode==='quiz'&&G().modes.indexOf('quiz')>=0)klMode='quiz';
    else klMode='free';                           // free·single·compare·미지정 → 자유탐구
    if(G().modes.indexOf(klMode)<0)klMode='free';
    var mode=(['single','compare'].indexOf(config.mode)>=0)?config.mode:'single';
    if(mode==='compare'&&!G().compare)mode='single';
    if(klMode==='quiz')mode='quiz';
    var shape=(['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';
    var notation=(G().notation&&config.notation==='mixed')?'mixed':'improper';
    var models=(Array.isArray(config.models)&&config.models.length)?config.models.filter(function(m){return ALLM.indexOf(m)>=0;}):ALLM.slice();
    models=models.filter(function(m){return G().models.indexOf(m)>=0;});
    if(!models.length)models=[G().models[0]];
    var model=(models.indexOf(config.model)>=0)?config.model:models[0];
    var setPer=(typeof config.setPer==='number'&&config.setPer>=1)?Math.min(config.setPer,6):2;
    var equivOn=(config.equiv!==false)&&G().equiv, commonOn=(config.commonize!==false)&&G().compare, showQuiz=(config.showQuiz===true)&&(G().modes.indexOf('quiz')>=0);
    if(mode==='quiz') showQuiz=true;
    var Sd=(typeof config.denom==='number'&&config.denom>=1)?Math.min(config.denom,maxDenom):4;
    var Sn=(typeof config.numer==='number')?Math.max(0,Math.min(config.numer,Sd*maxWholes)):0;
    var ca=config.a||{},cb=config.b||{};
    var Ad=Math.min(ca.denom||4,maxDenom),An=(ca.numer!=null?ca.numer:3);
    var Bd=Math.min(cb.denom||3,maxDenom),Bn=(cb.numer!=null?cb.numer:2);
    var commonized=false;
    var qN=0,qD=2,qPhase='try',qDir=(G().quizDirs.indexOf('guess')>=0&&config.quizDir==='guess')?'guess':(G().quizDirs[0]||'make'),gN=1,gD=2; // 맞히기: 사용자 답 gN/gD

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      maxDenom=(typeof config.maxDenom==='number'&&config.maxDenom>=2)?Math.min(config.maxDenom,G().maxDenom):G().maxDenom;
      models=ALLM.slice().filter(function(m){return G().models.indexOf(m)>=0;}); if(!models.length)models=[G().models[0]];
      model=models[0]; equivOn=(config.equiv!==false)&&G().equiv; commonOn=(config.commonize!==false)&&G().compare;
      if(G().modes.indexOf(klMode)<0)klMode='free';
      mode='single'; shape='bar'; notation='improper'; Sd=4; Sn=0; commonized=false;
      mStep=0; mDone=false; mLock=false;
      if(klMode==='quiz'){ qDir=G().quizDirs[0]||'make'; mode='quiz'; qScore=0; qCount=0; newQuiz(); }
      buildUI();
    }});

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function pt(cx,cy,r,d){var x=(d-90)*Math.PI/180;return[cx+r*Math.cos(x),cy+r*Math.sin(x)];}
    var VBW=940,VBH=480;

    var btn='font-size:24px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var modeBtn='font-size:24px;padding:12px 22px;border-radius:18px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mdlBtn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:22px;padding:11px 16px;border-radius:16px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var nbtn='font-size:22px;padding:11px 16px;border-radius:16px;border:3px solid #C24E0E;background:#fff;color:#C24E0E;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var cmnBtn='font-size:23px;padding:12px 20px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var okBtn='font-size:24px;padding:12px 24px;border-radius:16px;border:3px solid #12B886;background:#12B886;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var nextBtn='font-size:24px;padding:12px 22px;border-radius:16px;border:3px solid #7048E8;background:#7048E8;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var dirBtn='font-size:22px;padding:11px 18px;border-radius:14px;border:3px solid #C24E0E;background:#fff;color:#C24E0E;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS=[
      { text:'＋조각 버튼으로 <b style="color:#7048E8;">3/4</b>을 만들어 봐요! (4조각 중 3조각)',
        check:function(){ return mode==='single'&&Sn===3&&Sd===4; } },
      { text:'등분을 바꿔 <b style="color:#7048E8;">절반(1/2)</b>을 만들어 봐요!',
        check:function(){ return mode==='single'&&Sn===1&&Sd===2; } }
    ];
    var MID_MISSIONS=[
      { text:'＋조각 버튼으로 <b style="color:#7048E8;">3/4</b>을 만들어 봐요!',
        check:function(){ return mode==='single'&&Sn===3&&Sd===4; } },
      { text:'등분·조각을 바꿔 3/4과 <b style="color:#7048E8;">같은 양인 6/8</b>을 만들어 봐요! (동치분수)',
        check:function(){ return mode==='single'&&Sn===6&&Sd===8; } },
      { text:'표상을 <b style="color:#7048E8;">┼ 수직선</b>으로 바꾸고, <b style="color:#7048E8;">절반(1/2) 지점</b>에 점을 놓아 봐요!',
        check:function(){ return mode==='single'&&model==='line'&&Sd>0&&Sn*2===Sd&&Sn>0; } }
    ];
    var HIGH_MISSIONS=[
      { text:'＋조각 버튼으로 <b style="color:#7048E8;">3/4</b>을 만들어 봐요!',
        check:function(){ return mode==='single'&&Sn===3&&Sd===4; } },
      { text:'등분·조각을 바꿔 3/4과 <b style="color:#7048E8;">같은 양인 6/8</b>을 만들어 봐요! (동치분수)',
        check:function(){ return mode==='single'&&Sn===6&&Sd===8; } },
      { text:'표상을 <b style="color:#7048E8;">┼ 수직선</b>으로 바꾸고, <b style="color:#7048E8;">절반(1/2) 지점</b>에 점을 놓아 봐요!',
        check:function(){ return mode==='single'&&model==='line'&&Sd>0&&Sn*2===Sd&&Sn>0; } },
      { text:'<b style="color:#7048E8;">두 개 비교</b>로 가서 <b style="color:#7048E8;">⚖ 같은 크기로 맞추기</b>(통분)를 눌러 봐요!',
        check:function(){ return mode==='compare'&&commonized===true; } }
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(klMode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ mLock=false; mStep++;
          if(mStep>=M.length)mDone=true;
          updateShellBar();
        },1500);
      }
    }
    var qScore=0,qCount=0,qCounted=false;
    function updateShellBar(){
      var host=el.querySelector('.fr-bars'); if(!host)return;
      var M=curMissions();
      if(klMode==='mission')host.innerHTML=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length);
      else if(klMode==='quiz')host.innerHTML=ui.quizBar(qDir==='make'?'🎯 목표 분수만큼 색칠하고 ✓ 확인을 눌러요!':'🔍 그림이 나타내는 분수를 맞히고 ✓ 확인을 눌러요!',qScore,qCount);
      else host.innerHTML='';
    }

    function newQuiz(){var topD=Math.max(2,Math.min(6,maxDenom));qD=2+Math.floor(Math.random()*(topD-1));qN=1+Math.floor(Math.random()*qD);qPhase='try';qCounted=false;
      if(qDir==='make'){Sd=qD;Sn=0;} else {gD=2;gN=1;}}

    function nctl(act,label,fg,bg){return '<button class="fr-btn" data-act="'+act+'" style="'+btn+'background:'+(bg||'#fff')+';color:'+(fg)+';border-color:'+fg+';">'+label+'</button>';}

    function buildUI(){
      var ctrl='', modelRow='';
      if(mode==='single'){
        if(models.length>1){ modelRow='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
            +models.map(function(m){return '<button class="fr-mdl'+(m===model?' fr-on':'')+'" data-model="'+m+'" style="'+mdlBtn+'">'+MLABEL[m]+'</button>';}).join('')+'</div>'; }
        ctrl=nctl('nminus','－ 조각',C.num)+'<button class="fr-btn" data-act="nplus" style="'+btn+'background:'+C.num+';color:#fff;border-color:'+C.num+';">＋ 조각</button>'
            +'<span style="width:8px;"></span>'
            +'<button class="fr-btn" data-act="dminus" style="'+btn+'background:#fff;color:#1565C0;">－ '+(model==='quotient'?'사람':'등분')+'</button>'
            +'<button class="fr-btn" data-act="dplus" style="'+btn+'background:#1565C0;color:#fff;">＋ '+(model==='quotient'?'사람':'등분')+'</button>';
        if(model==='area'){
          ctrl+='<span style="width:8px;"></span>'
            +'<button class="fr-sbtn fr-btn" data-shape="bar" style="'+sbtn+'">▭</button>'
            +'<button class="fr-sbtn fr-btn" data-shape="circle" style="'+sbtn+'">◔</button>'
            +'<button class="fr-sbtn fr-btn" data-shape="grid" style="'+sbtn+'">▦</button>'
            +(G().notation?('<span style="width:8px;"></span>'
              +'<button class="fr-nbtn fr-btn" data-notation="improper" style="'+nbtn+'">가분수</button>'
              +'<button class="fr-nbtn fr-btn" data-notation="mixed" style="'+nbtn+'">대분수</button>'):'');
        } else if(model==='set'){
          ctrl+='<span style="width:8px;"></span>'
            +'<button class="fr-btn" data-act="perminus" style="'+sbtn+'">－ 묶음개수</button>'
            +'<button class="fr-btn" data-act="perplus" style="'+sbtn+'">＋ 묶음개수</button>';
        }
      } else if(mode==='compare') {
        ctrl='<span style="font-size:21px;font-weight:800;color:'+C.a+';align-self:center;">A</span>'
            +'<button class="fr-btn" data-set="A" data-k="n" data-d="-1" style="'+btn+'background:#fff;color:'+C.a+';border-color:'+C.a+';">－조각</button>'
            +'<button class="fr-btn" data-set="A" data-k="n" data-d="1" style="'+btn+'background:'+C.a+';color:#fff;border-color:'+C.a+';">＋조각</button>'
            +'<button class="fr-btn" data-set="A" data-k="d" data-d="-1" style="'+btn+'background:#fff;color:'+C.a+';border-color:'+C.a+';">－등분</button>'
            +'<button class="fr-btn" data-set="A" data-k="d" data-d="1" style="'+btn+'background:'+C.a+';color:#fff;border-color:'+C.a+';">＋등분</button>'
            +'<span style="width:12px;"></span>'
            +'<span style="font-size:21px;font-weight:800;color:'+C.b+';align-self:center;">B</span>'
            +'<button class="fr-btn" data-set="B" data-k="n" data-d="-1" style="'+btn+'background:#fff;color:'+C.b+';border-color:'+C.b+';">－조각</button>'
            +'<button class="fr-btn" data-set="B" data-k="n" data-d="1" style="'+btn+'background:'+C.b+';color:#fff;border-color:'+C.b+';">＋조각</button>'
            +'<button class="fr-btn" data-set="B" data-k="d" data-d="-1" style="'+btn+'background:#fff;color:'+C.b+';border-color:'+C.b+';">－등분</button>'
            +'<button class="fr-btn" data-set="B" data-k="d" data-d="1" style="'+btn+'background:'+C.b+';color:#fff;border-color:'+C.b+';">＋등분</button>';
        if(commonOn) ctrl+='<span style="width:10px;"></span><button class="fr-cmn fr-btn'+(commonized?' fr-on':'')+'" style="'+cmnBtn+'">⚖ 같은 크기로 맞추기</button>';
      } else { // quiz
        var dirBtns=G().quizDirs.map(function(dir){
          var lab=(dir==='make')?'🎯 만들기':'🔍 맞히기';
          return '<button class="fr-dir'+(qDir===dir?' fr-on':'')+'" data-dir="'+dir+'" style="'+dirBtn+'">'+lab+'</button>';
        }).join('');
        modelRow=(G().quizDirs.length>1)?('<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'+dirBtns+'</div>'):'';
        if(qDir==='make'){
          ctrl='<button class="fr-btn" data-act="nminus" style="'+btn+'background:#fff;color:'+C.num+';border-color:'+C.num+';">－ 조각</button>'
            +'<button class="fr-btn" data-act="nplus" style="'+btn+'background:'+C.num+';color:#fff;border-color:'+C.num+';">＋ 조각</button>'
            +'<span style="width:8px;"></span>'
            +'<button class="fr-btn" data-act="dminus" style="'+btn+'background:#fff;color:#1565C0;">－ 등분</button>'
            +'<button class="fr-btn" data-act="dplus" style="'+btn+'background:#1565C0;color:#fff;">＋ 등분</button>';
        } else {
          ctrl='<span style="font-size:20px;font-weight:800;align-self:center;color:#5a7894;">내 답:</span>'
            +'<button class="fr-btn" data-act="gnminus" style="'+btn+'background:#fff;color:'+C.num+';border-color:'+C.num+';">－ 분자</button>'
            +'<button class="fr-btn" data-act="gnplus" style="'+btn+'background:'+C.num+';color:#fff;border-color:'+C.num+';">＋ 분자</button>'
            +'<button class="fr-btn" data-act="gdminus" style="'+btn+'background:#fff;color:#1565C0;">－ 분모</button>'
            +'<button class="fr-btn" data-act="gdplus" style="'+btn+'background:#1565C0;color:#fff;">＋ 분모</button>';
        }
        ctrl+='<span style="width:10px;"></span><button class="fr-chk fr-btn" style="'+okBtn+'">✓ 확인</button>'
            +'<button class="fr-next fr-btn" style="'+nextBtn+'">↻ 다음 문제</button>';
      }
      var modeButtons=(klMode==='quiz')?'':('<button class="fr-mbtn'+(mode==='single'?' fr-on':'')+'" data-mode="single" style="'+modeBtn+'">한 개 보기</button>'
          +(G().compare?('<button class="fr-mbtn'+(mode==='compare'?' fr-on':'')+'" data-mode="compare" style="'+modeBtn+'">두 개 비교</button>'):''));
      var resetBtn=(mode==='quiz')?'':'<span style="width:8px;"></span><button class="fr-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      el.innerHTML='<style>'
        +'.fr-btn:active,.fr-sbtn:active,.fr-mbtn:active,.fr-nbtn:active,.fr-cmn:active,.fr-chk:active,.fr-next:active,.fr-mdl:active,.fr-dir:active{transform:translateY(2px);}'
        +'.fr-btn[disabled]{opacity:.32;cursor:not-allowed;}'
        +'.fr-sbtn.fr-on{background:#0B7285 !important;color:#fff !important;}'
        +'.fr-nbtn.fr-on{background:#C24E0E !important;color:#fff !important;}'
        +'.fr-mbtn.fr-on{background:#7048E8 !important;color:#fff !important;}'
        +'.fr-mdl.fr-on{background:#0B7285 !important;color:#fff !important;}'
        +'.fr-dir.fr-on{background:#C24E0E !important;color:#fff !important;}'
        +'.fr-cmn.fr-on{background:#7048E8 !important;color:#fff !important;}'
        +'.fr-piece{cursor:pointer;transition:fill-opacity .25s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
        +'.fr-piece:hover{transform:scale(1.04);}'
        +'</style>'
        + bands.selectorHTML() + ui.modeTabs(G().modes,klMode)
        +'<div class="fr-bars"></div>'
        +(modeButtons?('<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'+modeButtons+'</div>'):'')
        +modelRow
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'+ctrl+resetBtn+'</div>'
        +'<div class="kl-stage-host" style="position:relative;"><div class="fr-stage" style="width:100%;height:'+(klMode==='quiz'?'48vh':'52vh')+';min-height:'+(klMode==='quiz'?'340':'370')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>';
      ui.bindModeTabs(el,function(m2){
        klMode=m2; mStep=0;mDone=false;mLock=false; commonized=false;
        if(m2==='quiz'){ mode='quiz'; qDir=G().quizDirs[0]||'make'; qScore=0;qCount=0; newQuiz(); }
        else if(m2==='mission'){ mode='single'; model='area'; shape='bar'; notation='improper'; Sd=4; Sn=0; }
        else { mode='single'; model=(models.indexOf(config.model)>=0)?config.model:models[0];
               Sd=(typeof config.denom==='number')?Math.min(config.denom,maxDenom):4;
               Sn=(typeof config.numer==='number')?Math.max(0,config.numer):0; }
        buildUI();
      });
      bindUI(); updateShellBar(); render(); bands.bind(el);
    }

    function defs(svg){var d=svgEl('defs',{});d.innerHTML=
      '<filter id="frSh" x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#13315C" flood-opacity="0.20"/></filter>'
      +'<linearGradient id="frA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.aTop+'"/><stop offset="1" stop-color="'+C.a+'"/></linearGradient>'
      +'<linearGradient id="frB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.bTop+'"/><stop offset="1" stop-color="'+C.b+'"/></linearGradient>';
      svg.appendChild(d);}
    function fillOf(on,set){return on?('url(#fr'+(set==='B'?'B':'A')+')'):C.empty;}

    function barsAt(svg,x0,y0,W,H,denom,numer,set){
      var wholes=Math.max(1,Math.min(Math.ceil(numer/denom)||1,maxWholes)); if(numer===0)wholes=1;
      var gap=18, ww=(W-gap*(wholes-1))/wholes, edge=(set==='B')?C.bEdge:C.aEdge, gk=0;
      for(var w=0;w<wholes;w++){
        var wx=x0+w*(ww+gap), cw=ww/denom, g=svgEl('g',{filter:'url(#frSh)'});
        for(var i=0;i<denom;i++){
          var on=gk<numer;
          g.appendChild(svgEl('rect',{x:wx+i*cw,y:y0,width:cw,height:H,rx:(denom===1?14:4),fill:fillOf(on,set),stroke:C.seam,'stroke-width':4,'data-gk':gk,'data-set':set,class:'fr-piece'}));
          if(on)g.appendChild(svgEl('rect',{x:wx+i*cw+5,y:y0+5,width:cw-10,height:10,rx:5,fill:'#fff','fill-opacity':0.28,'pointer-events':'none'}));
          gk++;
        }
        g.appendChild(svgEl('rect',{x:wx,y:y0,width:ww,height:H,rx:13,fill:'none',stroke:edge,'stroke-width':4,'pointer-events':'none'}));
        svg.appendChild(g);
      }
    }
    function circlesAt(svg,cxC,cy,rBase,denom,numer,set){
      var wholes=Math.max(1,Math.min(Math.ceil(numer/denom)||1,maxWholes)); if(numer===0)wholes=1;
      var r=Math.min(rBase,(580/wholes-30)/2), gap=24, total=wholes*(2*r)+gap*(wholes-1), startx=cxC-total/2+r, gk=0, edge=(set==='B')?C.bEdge:C.aEdge;
      for(var w=0;w<wholes;w++){
        var cx=startx+w*(2*r+gap), g=svgEl('g',{filter:'url(#frSh)'});
        if(denom===1){g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:fillOf(gk<numer,set),stroke:C.seam,'stroke-width':5,'data-gk':gk,'data-set':set,class:'fr-piece'}));gk++;}
        else{var st=360/denom;for(var i=0;i<denom;i++){var p0=pt(cx,cy,r,i*st),p1=pt(cx,cy,r,(i+1)*st),lg=(st>180)?1:0;g.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+p0[0]+' '+p0[1]+' A '+r+' '+r+' 0 '+lg+' 1 '+p1[0]+' '+p1[1]+' Z',fill:fillOf(gk<numer,set),stroke:C.seam,'stroke-width':4,'data-gk':gk,'data-set':set,class:'fr-piece'}));gk++;}}
        g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:edge,'stroke-width':4,'pointer-events':'none'}));
        svg.appendChild(g);
      }
    }
    function txt(svg,x,y,s,size,fill,anchor){var t=svgEl('text',{x:x,y:y,'text-anchor':anchor||'middle','font-family':'Gowun Dodum,sans-serif','font-size':size,'font-weight':800,fill:fill});t.textContent=s;svg.appendChild(t);}
    function notate(m,n,style){var W=Math.floor(m/n),r=m%n;if(style==='mixed'){if(r===0)return{whole:String(W),m:null,n:null};return{whole:(W>0?String(W):''),m:String(r),n:String(n)};}return{whole:'',m:String(m),n:String(n)};}
    function drawFrac(svg,cx,cy,m,n,style,big){
      var o=notate(m,n,style), s=big?86:48, gap=big?20:12, lw=big?130:74, fx=cx;
      if(o.whole){txt(svg,cx-(o.m?(big?95:55):0),cy+(o.m?(big?30:18):0),o.whole,big?108:60,C.whole);fx=cx+(o.m?(big?45:28):0);}
      if(o.m!==null){txt(svg,fx,cy-gap,o.m,s,C.num);svg.appendChild(svgEl('rect',{x:fx-lw/2,y:cy+(big?-28:-16),width:lw,height:big?8:6,rx:4,fill:'#1B3A57'}));txt(svg,fx,cy+s-(big?4:0),o.n,s,C.den);}
    }

    function render(){
      var stage=el.querySelector('.fr-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'}); defs(svg);
      if(mode==='single'){ if(model==='line')renderLine(svg); else if(model==='set')renderSet(svg); else if(model==='quotient')renderQuotient(svg); else renderArea(svg); }
      else if(mode==='compare') renderCompare(svg);
      else renderQuiz(svg);
      stage.appendChild(svg);
      stage.querySelectorAll('.fr-piece').forEach(function(p){p.addEventListener('click',function(){
        var gk=+p.getAttribute('data-gk'), set=p.getAttribute('data-set');
        if(set==='A'){An=(An===gk+1)?gk:gk+1;} else if(set==='B'){Bn=(Bn===gk+1)?gk:gk+1;}
        else {Sn=(Sn===gk+1)?gk:gk+1; if(mode==='quiz'&&qPhase!=='try')qPhase='try';}
        render();
      });});
      // 수직선 클릭(선 위 아무 데나 → 가까운 등분점)
      var hot=svg.querySelector('.fr-linehot');
      if(hot) hot.addEventListener('click',function(ev){
        var box=svg.getBoundingClientRect(), lx=+hot.getAttribute('data-x0'), lw=+hot.getAttribute('data-w'), wn=+hot.getAttribute('data-wholes');
        var rel=(ev.clientX-box.left)*(VBW/box.width)-lx; var frac=Math.max(0,Math.min(1,rel/lw));
        Sn=Math.round(frac*wn*Sd); render();
      });
      updateButtons();
      if(klMode==='mission')checkMission();
    }

    function renderArea(svg){
      var SX=40,SW=600, g=gcd(Sn,Sd), reduced=(Sn>0&&g>1&&Sn%Sd!==0), isWhole=(Sn>0&&Sn%Sd===0);
      if(shape==='bar') barsAt(svg,SX,(reduced?70:(VBH-200)/2-10),SW,(reduced?150:200),Sd,Sn,'S');
      else if(shape==='circle') circlesAt(svg,SX+SW/2,VBH/2-10,150,Sd,Sn,'S');
      else {
        var wholes=Math.max(1,Math.min(Math.ceil(Sn/Sd)||1,maxWholes)); if(Sn===0)wholes=1;
        var cols=bestCols(Sd),rows=Math.ceil(Sd/cols),gap=20,bw=(SW-gap*(wholes-1))/wholes,cell=Math.min(bw/cols,260/rows,90)-6,gk=0;
        for(var w=0;w<wholes;w++){
          var gw=cell*cols+6*(cols-1),gh=cell*rows+6*(rows-1),bx=SX+w*(bw+gap)+(bw-gw)/2,by=(VBH-gh)/2-10,gg=svgEl('g',{filter:'url(#frSh)'});
          for(var i=0;i<Sd;i++){var c=i%cols,r2=Math.floor(i/cols),on=gk<Sn;gg.appendChild(svgEl('rect',{x:bx+c*(cell+6),y:by+r2*(cell+6),width:cell,height:cell,rx:9,fill:fillOf(on,'S'),stroke:(on?C.aEdge:C.emptyEdge),'stroke-width':3,'data-gk':gk,'data-set':'S',class:'fr-piece'}));gk++;}
          svg.appendChild(gg);
        }
      }
      if(equivOn && reduced && shape==='bar'){var rn=Sn/g,rd=Sd/g;barsAt(svg,SX,300,SW,120,rd,rn,'S');txt(svg,SX,290,'↓ 같은 양을 더 적은 조각으로 (약분)',22,C.whole,'start');drawFrac(svg,SX+SW+95,360,rn,rd,'improper',false);}
      var px=750, other=(notation==='improper')?'mixed':'improper';
      drawFrac(svg,px,140,Sn,Sd,notation,true);
      if(!G().equiv){
        // 저학년: 약분/대분수 없이 "○분의 △ 읽기" 일상어 닻
        txt(svg,px,300,'전체를 똑같이 '+Sd+'로 나눈 한 조각',22,'#5a7894');
        txt(svg,px,346,Sd+'분의 '+Sn+' 이라고 읽어요',24,C.whole);
        txt(svg,px,392,'색칠한 조각 '+Sn+'개 = '+Sn+'/'+Sd,21,C.good);
        return;
      }
      var o2=notate(Sn,Sd,other), sub=(other==='mixed')?(o2.m!==null?(o2.whole?o2.whole+'과 ':'')+o2.m+'/'+o2.n:o2.whole):(o2.m+'/'+o2.n);
      txt(svg,px,300,'＝ '+sub,30,'#5a7894');
      txt(svg,px,360,'전체 1을 '+Sd+'로 나눈 조각 '+Sn+'개',23,'#1B3A57');
      if(equivOn && reduced) txt(svg,px,400,'＝ '+(Sn/g)+'/'+(Sd/g)+' 로 약분돼요!',23,C.good);
      else if(equivOn && Sn>0 && !isWhole && g===1) txt(svg,px,400,'더 약분 못 해요 (기약분수)',22,'#5a7894');
      else if(equivOn && isWhole) txt(svg,px,400,'＝ '+(Sn/Sd)+' (자연수가 됐어요!)',23,C.whole);
      else txt(svg,px,400,'한 조각 = 1/'+Sd,21,'#5a7894');
    }

    // 수직선: 0~N 위의 위치/길이
    function renderLine(svg){
      var wn=Math.max(1,Math.min(Math.ceil(Sn/Sd)||1,maxWholes)); if(Sn===0)wn=1;
      var x0=70,x1=870,W=x1-x0,y=250;
      // 투명 핫존(선 클릭)
      svg.appendChild(svgEl('rect',{x:x0,y:y-60,width:W,height:120,fill:'transparent',class:'fr-linehot','data-x0':x0,'data-w':W,'data-wholes':wn,style:'cursor:pointer;'}));
      // 채워진 길이 0~분수
      var fx=x0+W*(Sn/Sd)/wn;
      svg.appendChild(svgEl('line',{x1:x0,y1:y,x2:fx,y2:y,stroke:C.a,'stroke-width':12,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('line',{x1:fx,y1:y,x2:x1,y2:y,stroke:C.line,'stroke-width':8,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('polygon',{points:(x1+4)+','+y+' '+(x1-14)+','+(y-9)+' '+(x1-14)+','+(y+9),fill:C.line}));
      // 분수 눈금(작은) + 정수 눈금(큰)
      for(var i=0;i<=wn*Sd;i++){
        var gx=x0+W*i/(wn*Sd), big=(i%Sd===0);
        svg.appendChild(svgEl('line',{x1:gx,y1:y-(big?22:11),x2:gx,y2:y+(big?22:11),stroke:(big?'#1B3A57':C.line),'stroke-width':big?4:2}));
        if(big) txt(svg,gx,y+50,String(i/Sd),26,'#1B3A57');
      }
      // 마커
      svg.appendChild(svgEl('line',{x1:fx,y1:y-70,x2:fx,y2:y+24,stroke:C.mark,'stroke-width':4,'stroke-dasharray':'5 5'}));
      svg.appendChild(svgEl('circle',{cx:fx,cy:y,r:13,fill:C.mark,stroke:'#fff','stroke-width':4}));
      drawFrac(svg,fx,y-95,Sn,Sd,'improper',false);
      txt(svg,VBW/2,y+105,(Sn===0?'0 위치':(Sn+'/'+Sd+' 은 0에서 '+(Sn)+'칸 (한 칸 = 1/'+Sd+')')),24,'#1B3A57');
      txt(svg,VBW/2,y+140,'선 위를 누르거나 ＋조각/＋등분으로 옮겨 봐요',20,'#5a7894');
    }

    // 묶음: 셀 수 있는 개수의 분수
    function renderSet(svg){
      var wn=Math.max(1,Math.min(Math.ceil(Sn/Sd)||1,maxWholes)); if(Sn===0)wn=1;
      var groups=Sd*wn, perRow=Math.min(groups,Math.max(2,Math.ceil(Math.sqrt(groups)))), rows=Math.ceil(groups/perRow);
      var gw=Math.min(150,820/perRow), gh=Math.min(120,360/rows), startx=(VBW-perRow*gw)/2, starty=70, gk=0;
      for(var r=0;r<rows;r++)for(var c=0;c<perRow;c++){
        if(gk>=groups)break;
        var bx=startx+c*gw, by=starty+r*gh, on=gk<Sn;
        // 묶음 테두리
        svg.appendChild(svgEl('rect',{x:bx+6,y:by+6,width:gw-12,height:gh-12,rx:14,fill:(on?'#E6FCF5':'#F1F6FC'),stroke:(on?C.a:C.emptyEdge),'stroke-width':3,'data-gk':gk,'data-set':'S',class:'fr-piece'}));
        // 묶음 안 동그라미 setPer개
        var pc=Math.min(setPer,4), pcols=Math.min(pc,2), prows=Math.ceil(pc/pcols), dr=Math.min((gw-30)/pcols,(gh-30)/prows,26)/2;
        for(var p=0;p<setPer;p++){
          var pcl=p%pcols, prw=Math.floor(p/pcols), ox=bx+gw/2+(pcl-(pcols-1)/2)*(dr*2+6), oy=by+gh/2+(prw-(Math.ceil(setPer/pcols)-1)/2)*(dr*2+6);
          svg.appendChild(svgEl('circle',{cx:ox,cy:oy,r:dr,fill:(on?C.a:'#D7E5F4'),stroke:(on?C.aEdge:C.emptyEdge),'stroke-width':2,'pointer-events':'none'}));
        }
        gk++;
      }
      txt(svg,VBW/2,VBH-70,'한 묶음 '+setPer+'개 × '+groups+'묶음 = '+(groups*setPer)+'개',24,'#1B3A57');
      txt(svg,VBW/2,VBH-34,'색칠한 '+Sn+'묶음 = '+(Sn*setPer)+'개  ⟶  '+Sn+'/'+Sd+(wn>1?'':' (전체의 '+Sn+'/'+Sd+')'),26,C.good);
    }

    // 몫: 나눗셈으로서의 분수
    function renderQuotient(svg){
      var nPies=Math.max(1,Sn), people=Math.max(1,Sd);
      var r=Math.min(70,(820/Math.min(nPies,6))/2-8), gap=18, rowN=Math.min(nPies,Math.floor(820/(2*r+gap))||1), startx=(VBW-(rowN*(2*r+gap)-gap))/2+r, y=160;
      for(var k=0;k<nPies;k++){
        var col=k%rowN, row=Math.floor(k/rowN), cx=startx+col*(2*r+gap), cy=y+row*(2*r+gap);
        var st=360/people;
        for(var i=0;i<people;i++){
          var p0=pt(cx,cy,r,i*st),p1=pt(cx,cy,r,(i+1)*st),lg=(st>180)?1:0, mine=(i===0);
          svg.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+p0[0]+' '+p0[1]+' A '+r+' '+r+' 0 '+lg+' 1 '+p1[0]+' '+p1[1]+' Z',fill:(mine?'url(#frA)':C.empty),stroke:C.seam,'stroke-width':3}));
        }
        svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:C.aEdge,'stroke-width':3}));
      }
      var isInt=(Sn%Sd===0);
      txt(svg,VBW/2,VBH-92,'🍪 '+nPies+'개를 '+people+'명이 똑같이 나누면',25,'#1B3A57');
      txt(svg,VBW/2,VBH-52,Sn+' ÷ '+Sd+' = '+Sn+'/'+Sd+(isInt?' = '+(Sn/Sd):''),30,C.good);
      txt(svg,VBW/2,VBH-18,'한 명 몫(초록) = '+(isInt?(Sn/Sd)+'개':Sn+'/'+Sd+'개'),22,'#5a7894');
    }

    function renderCompare(svg){
      var x0=50,W=540,H=110, dA=Ad,nA=An,dB=Bd,nB=Bn, showCommon=(commonOn&&commonized&&Ad!==Bd);
      if(showCommon){var L=lcm(Ad,Bd);nA=An*(L/Ad);nB=Bn*(L/Bd);dA=L;dB=L;}
      barsAt(svg,x0,75,W,H,dA,nA,'A'); barsAt(svg,x0,275,W,H,dB,nB,'B');
      drawFrac(svg,x0+W+75,128,nA,dA,'improper',false); drawFrac(svg,x0+W+75,328,nB,dB,'improper',false);
      var va=An/Ad,vb=Bn/Bd,eq=Math.abs(va-vb)<1e-9,sign=eq?'＝':(va>vb?'＞':'＜');
      txt(svg,VBW/2,238,sign,eq?86:78,eq?C.whole:'#1B3A57');
      if(commonOn && Ad!==Bd){ if(!commonized)txt(svg,VBW/2,455,'분모가 달라요 — 조각 수로 바로 못 비교해요. ⚖ 를 눌러봐요',22,C.warn); else txt(svg,VBW/2,455,'분모를 '+lcm(Ad,Bd)+'로 같게! 이제 조각 수로 바로 비교돼요',23,C.good);}
      else if(eq && An!==Bn) txt(svg,VBW/2,455,'크기가 같아요 — 동치분수!',25,C.whole);
    }

    function renderQuiz(svg){
      var SX=40,SW=600,px=770;
      if(qDir==='make'){
        txt(svg,px,90,'이만큼 색칠해 봐요',26,'#1B3A57');
        drawFrac(svg,px,210,qN,qD,'improper',true);
        barsAt(svg,SX,(VBH-200)/2-30,SW,200,Sd,Sn,'S');
        txt(svg,SX+SW/2,VBH-80,'지금: '+Sn+'/'+Sd,28,'#5a7894');
        if(qPhase==='right'){var same=(Sn!==qN||Sd!==qD);txt(svg,px,320,'⭕ 정답!',46,C.good);if(same)txt(svg,px,372,Sn+'/'+Sd+' = '+qN+'/'+qD+' 같은 양!',22,C.whole);txt(svg,px,(same?412:372),'↻ 다음 문제',22,'#5a7894');}
        else if(qPhase==='wrong'){txt(svg,px,320,'다시 해 볼까요?',34,C.warn);txt(svg,px,366,'목표 '+qN+'/'+qD+', 지금 '+Sn+'/'+Sd,23,'#5a7894');}
        else txt(svg,px,320,'다 만들면 ✓ 확인',24,'#5a7894');
      } else { // guess: 그림 보고 분수 알아맞히기
        txt(svg,SX+SW/2,70,'이 그림은 얼마일까요?',26,'#1B3A57');
        var g=svgEl('g',{}); // 그림은 클릭 불가(조작 X) — fr-piece 안 씀
        var wholes=Math.max(1,Math.ceil(qN/qD)), gap=18, ww=(SW-gap*(wholes-1))/wholes, gk=0;
        for(var w=0;w<wholes;w++){var wx=SX+w*(ww+gap),cw=ww/qD,y0=140;for(var i=0;i<qD;i++){var on=gk<qN;svg.appendChild(svgEl('rect',{x:wx+i*cw,y:y0,width:cw,height:170,rx:4,fill:on?'url(#frA)':C.empty,stroke:C.seam,'stroke-width':4}));gk++;}svg.appendChild(svgEl('rect',{x:wx,y:y0,width:ww,height:170,rx:13,fill:'none',stroke:C.aEdge,'stroke-width':4}));}
        txt(svg,px,90,'내 답',24,'#5a7894');
        drawFrac(svg,px,200,gN,gD,'improper',true);
        if(qPhase==='right'){txt(svg,px,320,'⭕ 정답!',46,C.good);txt(svg,px,372,'↻ 다음 문제',22,'#5a7894');}
        else if(qPhase==='wrong'){txt(svg,px,320,'다시 해 볼까요?',34,C.warn);txt(svg,px,366,'그림을 잘 세어 봐요',22,'#5a7894');}
        else txt(svg,px,320,'분자·분모 맞추고 ✓',23,'#5a7894');
      }
    }

    function updateButtons(){
      function set(sel,dis){var b=el.querySelector(sel);if(b)b.disabled=dis;}
      if(mode==='single'||(mode==='quiz'&&qDir==='make')){
        set('[data-act="nplus"]',Sn>=Sd*maxWholes); set('[data-act="nminus"]',Sn<=0);
        set('[data-act="dplus"]',Sd>=maxDenom); set('[data-act="dminus"]',Sd<=1);
        set('[data-act="perplus"]',setPer>=6); set('[data-act="perminus"]',setPer<=1);
      } else if(mode==='quiz'&&qDir==='guess'){
        set('[data-act="gnplus"]',gN>=gD*maxWholes); set('[data-act="gnminus"]',gN<=0);
        set('[data-act="gdplus"]',gD>=maxDenom); set('[data-act="gdminus"]',gD<=1);
      } else if(mode==='compare'){
        el.querySelectorAll('.fr-btn[data-set]').forEach(function(b){var s=b.dataset.set,k=b.dataset.k,d=+b.dataset.d,dn=(s==='A')?Ad:Bd,nm=(s==='A')?An:Bn;if(k==='n')b.disabled=(d>0)?nm>=dn*maxWholes:nm<=0;else b.disabled=(d>0)?dn>=maxDenom:dn<=1;});
      }
    }

    function bindUI(){
      el.querySelectorAll('.fr-mbtn').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;commonized=false;buildUI();}});});
      el.querySelectorAll('.fr-mdl').forEach(function(b){b.addEventListener('click',function(){if(model!==b.dataset.model){model=b.dataset.model;buildUI();}});});
      el.querySelectorAll('.fr-dir').forEach(function(b){b.addEventListener('click',function(){if(qDir!==b.dataset.dir){qDir=b.dataset.dir;newQuiz();buildUI();}});});
      function clampN(){Sn=Math.max(0,Math.min(Sn,Sd*maxWholes));}
      var h={
        nplus:function(){if(Sn<Sd*maxWholes){Sn++;if(mode==='quiz'&&qPhase!=='try')qPhase='try';render();}},
        nminus:function(){if(Sn>0){Sn--;if(mode==='quiz'&&qPhase!=='try')qPhase='try';render();}},
        dplus:function(){if(Sd<maxDenom){Sd++;clampN();if(mode==='quiz'&&qPhase!=='try')qPhase='try';render();}},
        dminus:function(){if(Sd>1){Sd--;clampN();if(mode==='quiz'&&qPhase!=='try')qPhase='try';render();}},
        perplus:function(){if(setPer<6){setPer++;render();}},
        perminus:function(){if(setPer>1){setPer--;render();}},
        gnplus:function(){if(gN<gD*maxWholes){gN++;qPhase='try';render();}},
        gnminus:function(){if(gN>0){gN--;qPhase='try';render();}},
        gdplus:function(){if(gD<maxDenom){gD++;qPhase='try';render();}},
        gdminus:function(){if(gD>1){gD--;qPhase='try';render();}},
        reset:function(){
          if(mode==='single'){Sd=(typeof config.denom==='number')?Math.min(config.denom,maxDenom):4;Sn=(typeof config.numer==='number')?config.numer:0;notation=(config.notation==='mixed')?'mixed':'improper';shape=(['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';model=(models.indexOf(config.model)>=0)?config.model:models[0];}
          else{Ad=Math.min(ca.denom||4,maxDenom);An=(ca.numer!=null?ca.numer:3);Bd=Math.min(cb.denom||3,maxDenom);Bn=(cb.numer!=null?cb.numer:2);commonized=false;}
          buildUI();
        }
      };
      el.querySelectorAll('.fr-btn[data-act]').forEach(function(b){b.addEventListener('click',function(){var f=h[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.fr-sbtn[data-shape]').forEach(function(b){b.addEventListener('click',function(){shape=b.dataset.shape;el.querySelectorAll('.fr-sbtn[data-shape]').forEach(function(x){x.classList.toggle('fr-on',x.dataset.shape===shape);});render();});});
      el.querySelectorAll('.fr-nbtn').forEach(function(b){b.addEventListener('click',function(){notation=b.dataset.notation;el.querySelectorAll('.fr-nbtn').forEach(function(x){x.classList.toggle('fr-on',x.dataset.notation===notation);});render();});});
      el.querySelectorAll('.fr-btn[data-set]').forEach(function(b){b.addEventListener('click',function(){
        var s=b.dataset.set,k=b.dataset.k,d=+b.dataset.d;
        if(s==='A'){if(k==='n'){An=Math.max(0,Math.min(An+d,Ad*maxWholes));}else{var nd=Ad+d;if(nd>=1&&nd<=maxDenom){Ad=nd;An=Math.min(An,Ad*maxWholes);}}}
        else{if(k==='n'){Bn=Math.max(0,Math.min(Bn+d,Bd*maxWholes));}else{var nd2=Bd+d;if(nd2>=1&&nd2<=maxDenom){Bd=nd2;Bn=Math.min(Bn,Bd*maxWholes);}}}
        render();
      });});
      var cmn=el.querySelector('.fr-cmn'); if(cmn)cmn.addEventListener('click',function(){commonized=!commonized;cmn.classList.toggle('fr-on',commonized);render();});
      var chk=el.querySelector('.fr-chk'); if(chk)chk.addEventListener('click',function(){
        if(qDir==='make'){ if(Sn===0){qPhase='wrong';}else{qPhase=(Math.abs(Sn/Sd-qN/qD)<1e-9)?'right':'wrong';} }
        else { qPhase=(Math.abs(gN/gD-qN/qD)<1e-9)?'right':'wrong'; }
        if(!qCounted){ qCount++; if(qPhase==='right')qScore++; qCounted=true; updateShellBar(); }
        ui.toast(el,qPhase==='right');
        render();
      });
      var nx=el.querySelector('.fr-next'); if(nx)nx.addEventListener('click',function(){newQuiz();updateShellBar();render();});
      el.querySelectorAll('.fr-sbtn[data-shape]').forEach(function(b){b.classList.toggle('fr-on',b.dataset.shape===shape);});
      el.querySelectorAll('.fr-nbtn').forEach(function(b){b.classList.toggle('fr-on',b.dataset.notation===notation);});
    }

    if(klMode==='quiz') newQuiz();
    buildUI();
    return function cleanup(){};
  });
})();
