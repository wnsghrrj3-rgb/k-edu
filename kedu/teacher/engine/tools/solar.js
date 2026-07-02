/* ============================================================================
   케이랩 도구 모듈 — 태양계 (solar) v4  [과학 8호 · 천체 3호 · 탐구 표준 v2]
   5학년 태양계와 별 — 태양계 구성·행성 크기와 거리.
     변수 → 현상 → 발견:
       ▸ 8행성 공전(▶) · 공전 속도 0.5×~8× · 행성 선택(수~해)
       ▸ 🔭 비율 연속 슬라이더(보기 좋게 0 ↔ 실제 1): 스르륵 당길수록
         행성이 점이 되고 우주가 비어 가는 과정을 체감.
       ▸ 🌍 지구 잡기 — 궤도째 드래그(0.39~30.1AU) + 🟢 골디락스 띠.
       ▸ 👁 지구에서 보기 — 안쪽 행성(금성=샛별)은 태양 근처에만.
       ▸ "태양계는 거의 텅 비어 있고, 행성마다 크기·태양까지 거리가 크게 다르다."
   - 의존: THREE (전역), window.KLab
   v4 · 탐구 표준 v2 4층: 1층 변수 개방(속도·비율 연속·지구 궤도 드래그·시점) /
     2층 만약에 5종(☀️ 태양 소멸=관성 직선 신규) / 3층 예측 노트(비율 무장·칩·5칩 토스트) /
     4층 텍스처 승급(assets/textures/solar/ sun·jupiter·saturn·saturn_ring + earth 재사용,
     로드 실패 시 단색·그림 폴백 = 절대 안 깨짐).
   기존 보존: 미션 6단계(만들기↔생각형) · 퀴즈 5문 · 학년칸 · 만약에 4종(수성/해왕성
     자리·공전멈춤=추락·저학년 자전멈춤) · 저학년 낮과 밤 닻.
   - config: { play(기본 false), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  var PL=[
    {k:'mer',nm:'수성',au:0.39,r:0.38,col:0x9c8a7a,yr:0.24,desc:'태양에서 가장 가깝고 가장 작은 행성'},
    {k:'ven',nm:'금성',au:0.72,r:0.95,col:0xe6c47a,yr:0.62,desc:'두꺼운 구름에 싸인 가장 뜨거운 행성'},
    {k:'ear',nm:'지구',au:1.00,r:1.00,col:0x2b6cb0,yr:1.00,desc:'생명이 사는 우리 행성'},
    {k:'mar',nm:'화성',au:1.52,r:0.53,col:0xc1440e,yr:1.88,desc:'붉게 보이는 행성'},
    {k:'jup',nm:'목성',au:5.20,r:11.2,col:0xc99039,yr:11.9,desc:'태양계에서 가장 큰 행성'},
    {k:'sat',nm:'토성',au:9.50,r:9.40,col:0xe0c884,yr:29.5,desc:'아름다운 고리를 가진 행성'},
    {k:'ura',nm:'천왕성',au:19.2,r:4.00,col:0x9fd8e0,yr:84,desc:'옆으로 누워 자전하는 행성'},
    {k:'nep',nm:'해왕성',au:30.1,r:3.90,col:0x3b5bdb,yr:165,desc:'태양에서 가장 먼 행성'}
  ];
  /* 스케일 — v2 1층: 보기 좋게(t=0) ↔ 실제 비율(t=1) 연속 보간 */
  function auIdx(au){                    // 임의 AU → '보기 좋게' 간격의 가상 순번(조각별 선형)
    if(au<=PL[0].au)return 0;
    for(var i=0;i<PL.length-1;i++){ if(au<=PL[i+1].au)return i+(au-PL[i].au)/(PL[i+1].au-PL[i].au); }
    return PL.length-1;
  }
  function auToDist(au,t){ var p=3.4+auIdx(au)*2.0, r=3+au*3.4; return p+(r-p)*t; }
  function dist(i,t){ return auToDist(PL[i].au,t); }
  function prad(i,t){ var p=0.34+Math.log(PL[i].r+1)*0.42, r=Math.max(0.08,PL[i].r*0.28); return p+(r-p)*t; }

  window.KLab.register('solar', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var playing=!!config.play, real=false, alive=true, last=0, sel=null;
    var ang=PL.map(function(_,i){return i*0.7;});
    function snd(n){ if(window.KLab&&window.KLab.sound) window.KLab.sound.play(n); }
    /* ── v2 자유탐구 변수 (탐구 표준 v2 1층) ── */
    var grabOrb=false, auV=1.00, ratioT=0, spdV=1, viewE=false;
    /* ── v2 만약에 신규(태양 소멸) 상태 ── */
    var sunGone=false, escT=0, escBase=null;
    /* ── v2 예측 노트 (3층) — 세션 메모리 칩 ── */
    var chips=[], chipDone=false;
    function v2reset(){ grabOrb=false; auV=1.00; ratioT=0; spdV=1; viewE=false; sunGone=false; escT=0; escBase=null; }
    function G2(){ return GRADES[grade].v2||{}; }
    function effT(){ return (mode==='free'&&G2().ratio)?ratioT:(real?1:0); }
    function band(au){ return au<0.85?'hot':(au>1.4?'cold':'ok'); }
    /* ── 학년 칸 (헌법 3장) — 무대(태양계)는 공유, 노출 변수·미션·만약에·용어만 칸별 스왑 ──
       1차: 저=태양+행성 공전 관찰 / 중=행성 위치 관계+지구 궤도 드래그 / 고=연속 비율·속도·시점·태양소멸 풀버전.
       ※ 후속: 저학년 교과 닻 '낮과 밤'(지구 자전 클로즈업) 전용 장면은 정교화 대기. */
    var GRADES={
      low:  { showReal:false, mIdx:[],              wif:['stopspin'],                  v2:{},                                        hint:'🌞 하루 돌리기로 지구를 돌려, 낮과 밤이 어떻게 생기는지 봐요.' },
      mid:  { showReal:false, mIdx:[0,1,2,5],       wif:['mer','nep'],                 v2:{grab:true},                               hint:'행성을 골라 보고, 🌍 지구 잡기로 궤도를 옮기면 어떻게 될지 봐요.' },
      high: { showReal:true,  mIdx:[0,1,2,3,4,5],   wif:['mer','nep','stopo','sunoff'],v2:{grab:true,ratio:true,spd:true,view:true}, hint:'🔭 비율 슬라이더를 스르륵 당겨 진짜 거리·크기를 봐요.' }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; wif.reset(); mode='free'; mStep=0;mDone=false;mLock=false; sel=null; real=false; playing=false; fallF=1; v2reset();
      makeWif(); buildUI();
    }});
    function curMissions(){ return (grade==='low') ? LOW_MISSIONS : GRADES[grade].mIdx.map(function(i){return MISSIONS[i];}); }
    var C={ink:'#1B3A57',sub:'#8aa0b6',good:'#12B886'};
    var btn='font-size:20px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    /* ───────────── 미션 6단계 (만들기 ↔ 생각형) ───────────── */
    var MISSIONS=[
      { type:'make', text:'🌍 행성 버튼에서 <b style="color:#7048E8;">우리가 사는 지구</b>를 찾아 골라 봐요!',
        check:function(){ return sel==='ear'; } },
      { type:'think', text:'🤔 태양에서 <b style="color:#7048E8;">멀리 있는 행성일수록</b> 어떻게 될까요?',
        ch:['더 춥고, 공전도 더 느려요','더 뜨겁고 빨라요','거리와 상관없이 똑같아요'], a:0,
        why:'태양에서 멀수록 받는 빛과 열이 적어 춥고, 한 바퀴 도는 길도 길어 공전이 오래 걸려요. 해왕성의 1년은 지구의 165년!' },
      { type:'make', text:'🪐 태양계에서 <b style="color:#7048E8;">가장 큰 행성</b>은 누구일까요? 골라 봐요!',
        check:function(){ return sel==='jup'; } },
      { type:'make', text:'🔭 <b style="color:#7048E8;">실제 비율</b> 버튼을 눌러 진짜 거리·크기를 봐요!',
        check:function(){ return real===true; } },
      { type:'think', text:'🤔 실제 비율에서 행성들이 <b style="color:#7048E8;">점처럼 작아 보인</b> 까닭은?',
        ch:['우주가 그만큼 어마어마하게 텅 비어 있어서','화면이 고장 나서','행성이 진짜로 줄어들어서'], a:0,
        why:'태양계는 거의 다 빈 공간! 태양을 농구공이라 하면 지구는 30m쯤 떨어진 콩알이에요.' },
      { type:'make', text:'🌀 <b style="color:#7048E8;">태양에서 가장 먼 행성</b>을 찾아 골라 봐요!',
        check:function(){ return sel==='nep'; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function advanceMission(){
      mLock=false;
      var CM=curMissions(); if(mStep<CM.length-1){ mStep++; if(CM[mStep].set)CM[mStep].set(); }
      else mDone=true;
      updateBars(); missionFoot(); render(); renderStatus();
    }
    function missionFoot(){
      var CM=curMissions(); ui.thinkFoot(el,{foot:'.so-foot',bar:'.so-bars'},(mode==='mission'&&!mDone&&CM[mStep]&&CM[mStep].type==='think')?CM[mStep]:null,advanceMission);
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
      var host=el.querySelector('.so-bars'); if(!host)return;
      if(mode==='mission'){var CM=curMissions();host.innerHTML=mDone?ui.doneBar():ui.missionBar(CM[mStep].text,mStep,CM.length);}
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else if(mode==='whatif')host.innerHTML=wif.barHTML();
      else host.innerHTML='';
    }

    /* ───────────── 🌀 만약에 (지구의 자리를 바꿔 보기 + ☀️ 태양 소멸) ───────────── */
    var fallF=1;   // 공전 멈춤: 1→0.12 나선 추락 계수
    var WHATIF={
      mer:{ icon:'🔥', title:'지구가 수성 자리에 있다면?',
        q:'지구를 태양 바로 옆(수성 자리)으로 옮기면 어떻게 될까요?',
        ch:['너무 뜨거워 바다가 펄펄 끓어요','지금과 똑같아요','오히려 추워져요'], a:0,
        reveal:'수성 자리는 햇빛이 지구의 7배! 바다는 끓어 사라지고 낮 기온은 400°C — 생명이 살 수 없어요. 지구가 지금 자리에 있는 건 큰 행운이에요.',
        tip:'▶ 공전 재생 — 태양 바로 옆을 도는 지구를 봐요. 너무 가깝죠?' },
      nep:{ icon:'🧊', title:'지구가 해왕성 자리라면?',
        q:'지구를 가장 먼 해왕성 자리로 옮기면?',
        ch:['햇빛이 약해 모든 게 꽁꽁 얼어요','따뜻해져요','지금과 비슷해요'], a:0,
        reveal:'해왕성 자리의 햇빛은 지구의 1/900! 바다도 공기도 꽁꽁 — 영하 200°C의 얼음 세상이에요. 태양과의 거리가 행성의 운명을 정해요.',
        tip:'▶ 공전 재생 — 까마득히 먼 궤도를 천천히 도는 지구를 봐요.' },
      stopo:{ icon:'🕳', title:'지구가 공전을 멈춘다면?',
        q:'지구가 도는 걸 딱 멈추면 어떻게 될까요?',
        ch:['태양 쪽으로 끌려 들어가요','그 자리에 가만히 떠 있어요','우주 밖으로 날아가요'], a:0,
        reveal:'공전은 태양이 당기는 힘과 균형을 이루는 운동이에요! 멈추는 순간 태양의 중력에 끌려 떨어져요. 빙글빙글 도는 것이 곧 떠 있는 비결!',
        tip:'지구가 태양으로 끌려가는 걸 봐요…! 🔁 더 가지고 놀기로 다시 궤도에 올려요.' },
      sunoff:{ icon:'☀️', title:'태양이 갑자기 사라진다면?',
        q:'태양이 뿅 사라지면, 돌고 있던 행성들은 어떻게 될까요?',
        ch:['그 자리에 딱 멈춰요','태양이 있던 곳으로 떨어져요','돌던 방향 그대로 직선으로 날아가요'], a:2,
        reveal:'행성은 원래 곧게 가려는 성질(관성)이 있는데, 태양이 당겨서 휘어 도는 거예요! 당기는 힘이 사라지면 돌던 방향 그대로 곧게 날아가요 — 공전 궤도 = 당기는 힘과 도는 운동의 균형!',
        tip:'행성들이 궤도를 벗어나 곧게 날아가는 걸 봐요! 🔁 더 가지고 놀기로 태양을 되돌려요.' }
    };
    /* 저학년 전용 — 낮과 밤(지구 자전) 닻 */
    var LOW_MISSIONS=[
      { type:'make', text:'🌞 <b style="color:#7048E8;">하루 돌리기</b>를 눌러 지구를 빙글 돌려 봐요!',
        check:function(){ return playing===true; } },
      { type:'think', text:'🤔 내가 사는 곳(<b style="color:#E8590C;">빨간 점</b>)이 <b style="color:#7048E8;">밝은 쪽</b>에 오면 지금은?',
        ch:['낮','밤','겨울'], a:0,
        why:'태양 빛을 받는 쪽이 낮이에요! 지구가 돌면서 빨간 점이 밝은 쪽으로 오면 낮이 돼요.' },
      { type:'think', text:'🤔 빨간 점이 <b style="color:#7048E8;">어두운 쪽</b>으로 넘어가면?',
        ch:['밤이 돼요','낮이 그대로예요','계절이 바뀌어요'], a:0,
        why:'태양 빛을 못 받는 쪽이 밤! 지구가 하루에 한 바퀴 돌며 낮과 밤이 번갈아 와요.' }
    ];
    var LOW_WHATIF={
      stopspin:{ icon:'🛑', title:'지구가 자전을 멈추면?',
        q:'지구가 도는 걸 멈추면 내가 사는 곳은 어떻게 될까요?',
        ch:['한쪽은 끝없는 낮, 반대쪽은 끝없는 밤','아무 일도 없어요','계속 낮이에요'], a:0,
        reveal:'지구가 멈추면 태양을 향한 쪽은 영원한 낮, 반대쪽은 영원한 밤이 돼요! 지구가 빙글빙글 돌기 때문에 낮과 밤이 번갈아 찾아오는 거예요.',
        tip:'자전을 멈춰 봐요 — 빨간 점이 낮(또는 밤)에 딱 멈춰 더는 바뀌지 않아요.' }
    };
    var wif;
    function armEscape(){   // ☀️ 태양 소멸 — 현재 위치·접선 방향 벡터를 굳혀 두고 직선 이탈
      var t=effT();
      escBase=PL.map(function(p,i){
        var d=(i===2)?auToDist(earAu(),t):dist(i,t), a=ang[i], v=(0.9/Math.sqrt(p.au))*d;
        return {x:Math.cos(a)*d, z:Math.sin(a)*d, tx:-Math.sin(a)*v, tz:Math.cos(a)*v};
      });
    }
    function makeWif(){
      var src=(grade==='low')?LOW_WHATIF:WHATIF;
      var keys=(grade==='low')?Object.keys(LOW_WHATIF):GRADES[grade].wif, scen={};
      keys.forEach(function(k){ scen[k]=src[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){buildUI();},
        footEl:function(){return el.querySelector('.so-foot');},
        onSelect:function(k){ playing=false; real=false; sel=null; fallF=1; grabOrb=false; viewE=false; sunGone=false; escT=0; escBase=null; auV=1.00; layout(); },
        onPlay:function(k){ fallF=1;
          if(k==='stopspin'){ playing=false; dayAngle=Math.PI; }
          else if(k==='sunoff'){ playing=false; armEscape(); sunGone=true; escT=0.55; snd('whoosh'); layout(); render(); }
          else if(k!=='stopo'){ playing=true; } },
        onExit:function(){ playing=false; fallF=1; sel=null; sunGone=false; escT=0; escBase=null; layout(); }
      });
    }
    makeWif();
    function earAu(){ // 지구의 유효 AU: 만약에(수성·해왕성 자리) > v2 드래그 auV > 기본 1
      if(wif.active()&&wif.state.key==='mer')return 0.39;
      if(wif.active()&&wif.state.key==='nep')return 30.1;
      return auV;
    }

    /* ── v2 예측 무장 (3층) — 비율 슬라이더 첫 조작 = 🔮 예측 → 실제 도달 = 해소·칩 ── */
    var pred={ ratio:{asked:false,ch:-1,done:false} };
    var PRED={
      ratio:{ q:'🔮 예측 먼저! 진짜 비율이 되면 행성들은 어떻게 퍼져 있을까요?',
        ch:['다들 고르게 늘어서 있다','안쪽은 다닥, 바깥은 까마득하다','다 비슷한 거리다'],
        tip:'슬라이더를 끝(실제 1)까지 스르륵 당겨 확인해 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.so-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="so-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="so-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.so-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1),
        msg=hit?'✔ 예측 적중 — 안쪽 4행성은 태양 옆에 다닥, 바깥 행성은 까마득! 태양계는 거의 텅 비어 있어요.'
           :'✘ 예측 빗나감 — 고르게 있지 않아요! 안쪽 4행성은 태양 옆에 다닥 붙고, 바깥 행성은 까마득히 멀어 그 사이는 거의 텅 비어 있어요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.so-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.ratio.ch>=0&&!pred.ratio.done&&ratioT>=0.999)predResolve('ratio');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 (earth·season·moon 규약) ── */
    var CHIPNM={mer:'🔥 수성자리',nep:'🧊 해왕성자리',stopo:'🕳 공전멈춤',stopspin:'🛑 자전멈춤',sunoff:'☀️ 태양소멸',ratio:'🔭 실제비율'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🔭 꼬마 과학자 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.so-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="so-chip" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { q:'태양에서 가장 가까운 행성은?', ch:['수성','금성','지구'], a:0 },
      { q:'태양계에서 가장 큰 행성은?', ch:['목성','토성','지구'], a:0 },
      { q:'우리가 사는 지구는 태양에서 몇 번째 행성일까요?', ch:['세 번째','첫 번째','다섯 번째'], a:0 },
      { q:'아름다운 고리를 가진 행성은?', ch:['토성','화성','수성'], a:0 },
      { q:'태양에서 가장 먼 행성은?', ch:['해왕성','천왕성','목성'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      sel=null;
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
            var fc=el.querySelector('.so-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }
    function planetBtns(){return PL.map(function(p){return '<button class="so-pl'+(sel===p.k?' on':'')+'" data-k="'+p.k+'" style="font-size:16px;padding:7px 12px;border-radius:12px;border:2.5px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(sel===p.k?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+p.nm+'</button>';}).join('');}

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(['free','mission','quiz','whatif'],mode,{whatif:'🌀 만약에'}), bar='', foot='';
      if(mode==='mission'){var CMB=curMissions();bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length);}
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); }
      /* ── v2 예측 노트 (3층) — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=(grade==='low'?LOW_WHATIF:WHATIF)[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      var g2=G2(), sbt='font-size:16px;padding:9px 13px;border-radius:12px;border:2.5px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
      var realBtn=(GRADES[grade].showReal&&!(mode==='free'&&g2.ratio))
        ? ('<button class="so-btn so-real'+(real?' on':'')+'" data-act="real" style="'+btn+'border-color:#7048E8;'+(real?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🔭 '+(real?'보기 좋게':'실제 비율')+'</button>')
        : '';
      /* ── v2 변수 행 (탐구 표준 v2 1층 — 자유탐구 전용, 학년 게이팅) ── */
      var v2row='';
      if(mode==='free'&&(g2.grab||g2.ratio||g2.spd||g2.view)){
        v2row='<div class="so-v2" style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +(g2.grab?('<button class="so-grab" style="'+sbt+'border-color:#0B7285;'+(grabOrb?'background:#0B7285;color:#fff;':'background:#fff;color:#0B7285;')+'">'+(grabOrb?'✅ 지구 놓기':'🌍 지구 잡기')+'</button>'):'')
          +(g2.ratio?('<span style="font-size:15px;font-weight:800;color:#5a7894;font-family:inherit;">보기 좋게</span>'
            +'<input class="so-ratio" type="range" min="0" max="1" step="0.01" value="'+ratioT+'" style="width:128px;">'
            +'<span class="so-ratlab" style="font-size:15px;font-weight:800;color:#7048E8;min-width:66px;font-family:inherit;">🔭 실제 '+Math.round(ratioT*100)+'%</span>'):'')
          +(g2.spd?('<span style="font-size:15px;font-weight:800;color:#5a7894;font-family:inherit;">공전 속도</span>'
            +'<input class="so-spd" type="range" min="0.5" max="8" step="0.5" value="'+spdV+'" style="width:104px;">'
            +'<span class="so-spdlab" style="font-size:15px;font-weight:800;color:#0B7285;min-width:40px;font-family:inherit;">'+spdV+'×</span>'):'')
          +(g2.view?('<button class="so-view" style="'+sbt+'border-color:#845EF7;'+(viewE?'background:#845EF7;color:#fff;':'background:#fff;color:#5F3DC4;')+'">'+(viewE?'🛰 위에서 보기':'👁 지구에서 보기')+'</button>'):'')
        +'</div>';
      }
      var ctrl='<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="so-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':(grade==='low'?'🌞 하루 돌리기':'▶ 공전 재생'))+'</button>'
          + realBtn
        +'</div>';
      var plRow='<div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap;">'+planetBtns()+'</div>';
      if(mode==='quiz'){ ctrl=''; plRow=''; v2row=''; }
      if(grade==='low'){ plRow=''; }
      if(mode==='whatif'){ plRow=''; if(!wif.active())ctrl=''; if(wif.active()&&(wif.state.key==='stopo'||wif.state.key==='sunoff'))ctrl=''; }
      el.innerHTML='<style>.so-btn:active,.so-pl:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.so-real.on{background:#7048E8 !important;color:#fff !important;border-color:#7048E8 !important;}</style>'
        + top + '<div class="so-bars">'+bar+'</div>' + v2row + ctrl
        +'<div class="kl-stage-host" style="position:relative;"><div class="so-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'42vh')+';min-height:'+(mode==='quiz'?'250':'320')+'px;background:radial-gradient(120% 120% at 50% 45%,#0E1330 0%,#070B1E 60%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +(mode==='quiz'?'':'<div class="so-texlab" style="position:absolute;top:12px;left:12px;font-size:12px;font-weight:800;color:#9fb6e6;background:rgba(8,12,26,0.55);padding:4px 9px;border-radius:9px;pointer-events:none;z-index:3;font-family:inherit;"></div>')
        +'</div></div>'
        + plRow
        +'<div class="so-foot">'+foot+'</div>'
        +'<div class="so-status" style="text-align:center;margin-top:9px;font-weight:800;font-family:inherit;line-height:1.4;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="so-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; sel=null; real=false; playing=false; fallF=1; v2reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindV2(); bindChoices(); bands.bind(el); renderChips(); texLabel();
      if(mode==='whatif')wif.bind(el);
      if(mode==='mission')missionFoot();
      layout(); render(); renderStatus();
    }

    var stage,scene,camera,renderer,sunMesh,planetGrp=[],orbitRings=[],goldRing=null,satRing=null,marker,dayAngle=0.6,wasDay=null;
    /* ── v2 4층: 실사 텍스처 승급 로더 — 없으면 단색·그림 폴백(절대 안 깨짐) ──
       1차 자산: solar/{sun,jupiter,saturn,saturn_ring}.png + earth/earth_day.png 재사용.
       2차(수·금·화·천·해)는 미출력 = 단색 유지가 정상. */
    var TEXDEF=[
      {key:'sun', src:'/kedu/teacher/engine/tools/assets/textures/solar/sun.png'},
      {key:'ear', src:'/kedu/teacher/engine/tools/assets/textures/earth/earth_day.png'},
      {key:'jup', src:'/kedu/teacher/engine/tools/assets/textures/solar/jupiter.png'},
      {key:'sat', src:'/kedu/teacher/engine/tools/assets/textures/solar/saturn.png'},
      {key:'ring',src:'/kedu/teacher/engine/tools/assets/textures/solar/saturn_ring.png'}
    ];
    var texImg={}, texTried=false;
    function loadTex(){
      if(texTried)return; texTried=true;
      TEXDEF.forEach(function(d){
        try{
          var im=new Image();
          im.onload=function(){ texImg[d.key]=im; applyTex(d.key); texLabel(); render(); };
          im.onerror=function(){ texLabel(); };
          im.src=d.src;
        }catch(e){}
      });
    }
    function toTex(im){
      var c=document.createElement('canvas'); c.width=im.naturalWidth||1024; c.height=im.naturalHeight||512;
      var x=c.getContext('2d'); if(!x||!x.drawImage)return null;
      x.drawImage(im,0,0);
      return new T.CanvasTexture(c);
    }
    function applyTex(key){
      try{
        var im=texImg[key]; if(!im)return;
        var tx=toTex(im); if(!tx)return;
        if(key==='sun'&&sunMesh){ sunMesh.material.map=tx; sunMesh.material.needsUpdate=true; }
        if(key==='ear'&&planetGrp[2]){ planetGrp[2].material.map=tx; planetGrp[2].material.color.setHex(0xffffff); planetGrp[2].material.needsUpdate=true; }
        if(key==='jup'&&planetGrp[4]){ planetGrp[4].material.map=tx; planetGrp[4].material.color.setHex(0xffffff); planetGrp[4].material.needsUpdate=true; }
        if(key==='sat'&&planetGrp[5]){ planetGrp[5].material.map=tx; planetGrp[5].material.color.setHex(0xffffff); planetGrp[5].material.needsUpdate=true; }
        if(key==='ring'&&satRing){ satRing.material.map=tx; satRing.material.color.setHex(0xffffff); satRing.material.needsUpdate=true; }
      }catch(e){}
    }
    function texLabel(){
      var lb=el.querySelector('.so-texlab'); if(!lb)return;
      var n=['sun','ear','jup','sat'].filter(function(k){return !!texImg[k];}).length;
      lb.textContent=n>0?('🖼️ 실사 텍스처 '+n+'종'):'🎨 기본 그림';
    }
    function ringFallbackTex(){   // 토성 고리 캔버스 폴백 — 옅은 금빛 동심 띠
      var c=document.createElement('canvas'); c.width=256; c.height=256; var x=c.getContext('2d');
      try{
        var cols=['#E7D9A8','#D9C58C','#EFE6C2','#CBB57A'];
        for(var r=127;r>72;r-=7){
          x.beginPath(); x.arc(128,128,r,0,7);
          x.strokeStyle=cols[(127-r)/7%cols.length|0]; x.lineWidth=6; x.globalAlpha=0.9; x.stroke();
        }
      }catch(e){}
      return new T.CanvasTexture(c);
    }
    function initThree(){
      if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
      planetGrp=[]; orbitRings=[]; satRing=null; goldRing=null;
      stage=el.querySelector('.so-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||360;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(45,W/H,0.1,2000);
      renderer=new T.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff,0.55));
      var pt=new T.PointLight(0xffffff,2.2,0); pt.position.set(0,0,0); scene.add(pt);
      // 태양 — v2 4층: sun.png 승급(로드 성공 시)
      sunMesh=new T.Mesh(new T.SphereGeometry(1.5,40,28), new T.MeshBasicMaterial({color:0xFFD43B}));
      scene.add(sunMesh);
      // 행성 + 궤도
      PL.forEach(function(p,i){
        var m=new T.Mesh(new T.SphereGeometry(1,28,20), new T.MeshStandardMaterial({color:p.col,roughness:1,metalness:0}));
        scene.add(m); planetGrp.push(m);
        var ring=new T.Mesh(new T.RingGeometry(1,1.01,96), new T.MeshBasicMaterial({color:0x33415e,side:T.DoubleSide,transparent:true,opacity:0.45}));
        ring.rotation.x=Math.PI/2; scene.add(ring); orbitRings.push(ring);
      });
      // 토성 고리 — v2 4층: 자식 메시라 크기 보간을 함께 탐 (saturn_ring.png 승급, 폴백=캔버스 금빛 띠)
      satRing=new T.Mesh(new T.RingGeometry(1.28,2.25,72),
        new T.MeshBasicMaterial({map:ringFallbackTex(),color:0xE0C884,side:T.DoubleSide,transparent:true,opacity:0.92,depthWrite:false}));
      satRing.rotation.x=Math.PI/2+0.42;
      if(planetGrp[5])planetGrp[5].add(satRing);
      // 골디락스 띠 — v2 1층: 지구 궤도 드래그의 배경 안내(0.85~1.4AU, 자유탐구 전용)
      goldRing=new T.Mesh(new T.RingGeometry(auToDist(0.85,0),auToDist(1.4,0),96),
        new T.MeshBasicMaterial({color:0x12B886,side:T.DoubleSide,transparent:true,opacity:0.13,depthWrite:false}));
      goldRing.rotation.x=Math.PI/2; scene.add(goldRing);
      // 저학년 낮밤 — 내 위치 마커(지구 자식, 자전 따라 돔)
      marker=new T.Mesh(new T.SphereGeometry(0.16,12,10), new T.MeshBasicMaterial({color:0xff5252}));
      marker.position.set(1,0.18,0); if(planetGrp[2])planetGrp[2].add(marker); marker.visible=false;
      loadTex(); Object.keys(texImg).forEach(function(k){ applyTex(k); });
      theta=0.7; phi=0.5; camPos();
    }
    var theta=0.7, phi=0.5, radius=22;
    function camPos(){ if(!camera)return;
      if(grade==='low'){ camera.position.set(3.6,2.0,4.8); camera.lookAt(8,0,0); return; }
      if(viewE&&mode==='free'){   // v2 1층: 지구에서 보기 — 지구 등 뒤에서 태양 쪽을 바라봄
        var t=effT(), d=auToDist(earAu(),t), a=ang[2];
        camera.position.set(Math.cos(a)*(d+0.9),0.5,Math.sin(a)*(d+0.9));
        camera.lookAt(0,0,0); return;
      }
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }

    function layout(){    // 스케일 모드에 맞춰 크기·궤도 반경·카메라 거리 재설정
      if(grade==='low'){   // 저학년 낮밤 — 지구만 크게(원점 태양이 한쪽 반구를 비춤=낮/밤), 자전
        planetGrp.forEach(function(m,i){ m.visible=(i===2); m.scale.setScalar(i===2?2.4:0.001); });
        orbitRings.forEach(function(r){ r.visible=false; });
        if(satRing)satRing.visible=false;
        if(goldRing)goldRing.visible=false;
        if(planetGrp[2])planetGrp[2].position.set(8,0,0);
        if(sunMesh){ sunMesh.visible=true; sunMesh.scale.setScalar(1.4); sunMesh.position.set(0,0,0); }
        if(marker)marker.visible=true;
        camPos(); return;
      }
      var t=effT();
      planetGrp.forEach(function(m){ m.visible=true; });
      orbitRings.forEach(function(r){ r.visible=true; });
      if(satRing)satRing.visible=true;
      if(marker)marker.visible=false;
      if(sunMesh)sunMesh.visible=!sunGone;
      var far=dist(PL.length-1, t);
      radius = far*(1.15+0.40*t);
      if(sunMesh)sunMesh.scale.setScalar(1.0);
      planetGrp.forEach(function(m,i){ m.scale.setScalar(prad(i,t)); });
      orbitRings.forEach(function(ring,i){ var d=dist(i,t); ring.scale.set(d,d,1); });
      if(goldRing){   // 골디락스 띠 — t에 따라 폭 자체가 변하니 지오메트리 갱신
        try{ if(goldRing.geometry&&goldRing.geometry.dispose)goldRing.geometry.dispose(); }catch(e){}
        goldRing.geometry=new T.RingGeometry(auToDist(0.85,t),auToDist(1.4,t),96);
        goldRing.visible=(mode==='free'&&!!G2().grab&&!sunGone);
      }
      camPos();
    }
    function earthTint(){   // v2 1층: 골디락스 이탈 연출 — 끓음(주황)/얼음(하늘)
      var m=planetGrp[2]&&planetGrp[2].material; if(!m||!m.color||!m.color.setHex)return;
      var b=band(earAu());
      if(b==='hot')m.color.setHex(0xFF8A50);
      else if(b==='cold')m.color.setHex(0x9AD9FF);
      else m.color.setHex(texImg.ear?0xffffff:0x2b6cb0);
    }
    function render(){
      if(grade==='low'){
        if(planetGrp[2]){ planetGrp[2].position.set(8,0,0); planetGrp[2].rotation.y=dayAngle; }
        if(renderer&&scene&&camera) renderer.render(scene,camera);
        return;
      }
      var t=effT(), ex=0, ez=0;
      planetGrp.forEach(function(m,i){
        var x,z;
        if(sunGone&&escBase){   // ☀️ 태양 소멸 — 접선 방향 직선 이탈(관성)
          x=escBase[i].x+escBase[i].tx*escT; z=escBase[i].z+escBase[i].tz*escT;
        } else {
          var d=(i===2)?auToDist(earAu(),t):dist(i,t);
          if(i===2&&wif.active()&&wif.state.key==='stopo')d=Math.max(d*fallF,0.9);
          x=Math.cos(ang[i])*d; z=Math.sin(ang[i])*d;
        }
        if(i===2){ ex=x; ez=z; }
        m.position.set(x,0,z);
      });
      earthTint();
      if(viewE&&mode==='free')camPos();
      if(stage){   // jsdom 검증·디버그 관측점 (THREE 목에서도 물리 검증 가능)
        stage.dataset.t=t.toFixed(3); stage.dataset.au=earAu().toFixed(2);
        stage.dataset.band=band(earAu()); stage.dataset.epos=ex.toFixed(3)+','+ez.toFixed(3);
      }
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
      if(grade==='low'){
        if(playing){ dayAngle=(dayAngle+dt*0.7)%(2*Math.PI); render();
          var nd=(Math.cos(dayAngle)<0); if(nd!==wasDay){ wasDay=nd; renderStatus(); } }
        requestAnimationFrame(loop); return;
      }
      var falling=(wif.active()&&wif.state.key==='stopo'&&wif.state.phase==='play');
      var escaping=(wif.active()&&wif.state.key==='sunoff'&&wif.state.phase==='play');
      if(falling&&fallF>0.13){ fallF=Math.max(fallF-dt*0.22,0.12); ang[2]+=dt*0.25; render();
        if(fallF<=0.13)renderStatus(); }
      if(escaping){ escT+=dt*1.6; render(); }
      if(playing&&!escaping){
        PL.forEach(function(p,i){ if(falling&&i===2)return; ang[i]=(ang[i]+dt*spdV*(0.9/Math.sqrt(p.au)))%(2*Math.PI); });
        render();
      }
      requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.so-status');
      if(grade==='low'){
        if(!s)return;
        if(mode==='whatif'){
          if(wif.active()&&wif.state.key==='stopspin'&&(wif.state.phase==='play'||wif.state.phase==='reveal'))
            { s.innerHTML='<div style="font-size:22px;color:#FFE066;">🛑 자전이 멈춘 지구 — 태양 쪽은 끝없는 낮, 반대쪽은 끝없는 밤!</div>'; return; }
          if(wif.state.phase==='pick'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">카드를 골라 상상해 봐요 — 지구가 멈추면?</div>'; return; }
          if(wif.state.phase==='predict'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">네 생각을 먼저 골라요! 그게 첫걸음이에요.</div>'; return; }
        }
        var day=(Math.cos(dayAngle)<0);
        s.innerHTML='<div style="font-size:23px;color:'+(day?'#FFE066':'#74C0FC')+';">'+(day?'☀️ 지금 빨간 점이 있는 곳은 낮!':'🌙 지금 빨간 점이 있는 곳은 밤!')+'</div>'
          +'<div style="font-size:16px;color:#8aa0b6;margin-top:4px;">'+GRADES.low.hint+'</div>'; return;
      }
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">태양계 그림을 보면서 답을 골라요! (화면을 끌어 돌려볼 수 있어요)</div>'; return; }
      if(mode==='whatif'){
        if(!s)return;
        if(wif.state.phase==='pick'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">카드를 골라 지구의 자리를 바꿔 봐요 — 상상이 곧 실험!</div>'; return; }
        if(wif.state.phase==='predict'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">정답 걱정 없이 네 생각을 먼저! 그게 과학자의 첫걸음이에요.</div>'; return; }
        if(wif.state.key==='mer'){ s.innerHTML='<div style="font-size:20px;color:#FFB066;">🔥 수성 자리의 지구 — 햇빛 7배, 낮 400°C! 바다가 남아날까요?</div>'; return; }
        if(wif.state.key==='nep'){ s.innerHTML='<div style="font-size:20px;color:#A9C4FF;">🧊 해왕성 자리의 지구 — 햇빛 1/900, 영하 200°C 얼음 세상!</div>'; return; }
        if(wif.state.key==='sunoff'){ s.innerHTML='<div style="font-size:22px;color:#FFE066;">☀️ 태양이 사라졌다! 행성들이 돌던 방향 그대로 곧게 날아가요</div><div style="font-size:17px;color:#8aa0b6;margin-top:3px;">멈추지도, 가운데로 떨어지지도 않아요 — 곧게 가려는 성질(관성)!</div>'; return; }
        s.innerHTML=(fallF<=0.13)
          ?'<div style="font-size:24px;color:#FF8A3D;">🕳 풍덩! 공전이 멈추면 태양의 중력에 끌려 들어가요</div><div style="font-size:17px;color:#8aa0b6;margin-top:3px;">빙글빙글 도는 것이 곧 떠 있는 비결! 🔁 더 가지고 놀기로 다시 궤도에 올려요.</div>'
          :'<div style="font-size:20px;color:#0B7285;">🕳 공전을 멈춘 지구가… 어디로 가는지 지켜봐요!</div>'; return;
      }
      /* v2 자유탐구 상태줄 — 잡기·시점·비율 과정 안내 우선 */
      if(mode==='free'&&grabOrb){
        var b=band(auV), au2=auV.toFixed(2);
        var bm=(b==='hot')?'<div style="font-size:18px;color:#FF8A50;margin-top:3px;">🔥 태양이 너무 가까워 바다가 펄펄 끓어요!</div>'
             :(b==='cold')?'<div style="font-size:18px;color:#9AD9FF;margin-top:3px;">🧊 햇빛이 약해 온 세상이 꽁꽁 얼어요!</div>'
             :'<div style="font-size:18px;color:#12B886;margin-top:3px;">🟢 골디락스 띠 안 — 물이 얼지도 끓지도 않는 자리!</div>';
        s.innerHTML='<div style="font-size:20px;color:#0B7285;">🌍 지구 잡는 중 — 무대를 좌우로 끌어 궤도를 옮겨요 (지금 '+au2+'AU)</div>'+bm; return;
      }
      if(mode==='free'&&viewE){
        s.innerHTML='<div style="font-size:20px;color:#B197FC;">👁 지구에서 본 하늘 — 수성·금성은 태양 근처에서만 보여요</div><div style="font-size:16px;color:#8aa0b6;margin-top:4px;">그래서 금성은 해 뜰 녘·해 질 녘에만 반짝 — 샛별이라 불려요!</div>'; return;
      }
      if(mode==='free'&&G2().ratio&&ratioT>0.12&&ratioT<0.88){
        s.innerHTML='<div style="font-size:20px;color:#A9C4FF;">스르륵… 행성들이 점이 되고 우주가 비어 가요 🔭 (실제 '+Math.round(ratioT*100)+'%)</div><div style="font-size:16px;color:#8aa0b6;margin-top:4px;">끝까지 당기면 진짜 태양계 — 얼마나 텅 비어 있을까요?</div>'; return;
      }
      if(sel){ var p=PL.filter(function(x){return x.k===sel;})[0], idx=PL.map(function(x){return x.k;}).indexOf(sel);
        s.innerHTML='<div style="font-size:23px;color:#FFF3BF;">'+p.nm+' — 태양에서 '+(idx+1)+'번째</div>'
          +'<div style="font-size:17px;color:#cdd6e6;margin-top:4px;">'+p.desc+'</div>'
          +'<div style="font-size:15px;color:#8aa0b6;margin-top:4px;">태양까지 거리 약 '+p.au+'AU · 크기(지구=1) 약 '+p.r+'배</div>';
      } else if(effT()>=0.999){
        s.innerHTML='<div style="font-size:21px;color:#A9C4FF;">실제 비율로 보는 중 🔭</div><div style="font-size:16px;color:#8aa0b6;margin-top:4px;">안쪽 4행성은 태양 가까이 다닥, 바깥 행성은 까마득히 멀어요. 행성 사이는 거의 텅 비어 있어요.</div>';
      } else {
        s.innerHTML='<div style="font-size:21px;color:#FFF3BF;">☀️ 태양계</div><div style="font-size:16px;color:#8aa0b6;margin-top:4px;">'+GRADES[grade].hint+'</div>';
      }
    }

    var _mv,_up;
    function bind(){
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',function(){ playing=!playing; last=0;
        pb.textContent=playing?'■ 멈춤':(grade==='low'?'🌞 하루 돌리기':'▶ 공전 재생');
        pb.style.background=playing?'#1565C0':'#fff'; pb.style.color=playing?'#fff':'#1565C0'; });
      var rb=el.querySelector('[data-act="real"]'); if(rb)rb.addEventListener('click',function(){ real=!real;
        layout(); render(); buildUIKeepState(); checkMission(); });
      el.querySelectorAll('.so-pl').forEach(function(b){b.addEventListener('click',function(){
        sel=b.dataset.k;
        el.querySelectorAll('.so-pl').forEach(function(x){var on=x.dataset.k===sel;x.classList.toggle('on',on);x.style.background=on?'#1565C0':'#fff';x.style.color=on?'#fff':'#1565C0';});
        renderStatus(); checkMission(); });});
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;
        if(grabOrb&&mode==='free'){   // v2 1층: 지구 잡기 — 가로 드래그 = 궤도 반지름(지수 스케일, 0.39~30.1AU)
          auV=Math.min(30.1,Math.max(0.39,auV*Math.exp((p.clientX-px)*0.004)));
          px=p.clientX;py=p.clientY; render(); renderStatus();
          if(e.touches)e.preventDefault(); return;
        }
        theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.15,Math.min(1.45,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
      function up(){drag=false;if(stage)stage.style.cursor='grab';}
      stage.addEventListener('mousedown',dn); stage.addEventListener('touchstart',dn,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){mv(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      _mv=mv;_up=up; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    }
    /* ── v2 변수 행 바인딩 (1층) ── */
    function bindV2(){
      var gb=el.querySelector('.so-grab'); if(gb)gb.addEventListener('click',function(){
        grabOrb=!grabOrb; snd('select');
        gb.textContent=grabOrb?'✅ 지구 놓기':'🌍 지구 잡기';
        gb.style.background=grabOrb?'#0B7285':'#fff'; gb.style.color=grabOrb?'#fff':'#0B7285';
        layout(); render(); renderStatus();
      });
      var rs=el.querySelector('.so-ratio'); if(rs)rs.addEventListener('input',function(){
        ratioT=+rs.value; predArm('ratio');
        var lb=el.querySelector('.so-ratlab'); if(lb)lb.textContent='🔭 실제 '+Math.round(ratioT*100)+'%';
        layout(); render(); renderStatus(); checkPred();
      });
      var sp=el.querySelector('.so-spd'); if(sp)sp.addEventListener('input',function(){
        spdV=+sp.value;
        var lb=el.querySelector('.so-spdlab'); if(lb)lb.textContent=spdV+'×';
      });
      var vb=el.querySelector('.so-view'); if(vb)vb.addEventListener('click',function(){
        viewE=!viewE; snd('select');
        vb.textContent=viewE?'🛰 위에서 보기':'👁 지구에서 보기';
        vb.style.background=viewE?'#845EF7':'#fff'; vb.style.color=viewE?'#fff':'#5F3DC4';
        camPos(); render(); renderStatus();
      });
    }
    // 토글 시 버튼 라벨/미션칩만 다시 그리되 three 씬은 유지
    function buildUIKeepState(){
      var rb=el.querySelector('[data-act="real"]'); if(!rb){renderStatus();return;}
      rb.textContent='🔭 '+(real?'보기 좋게':'실제 비율');
      rb.classList.toggle('on',real); rb.style.background=real?'#7048E8':'#fff'; rb.style.color=real?'#fff':'#7048E8';
      renderStatus();
    }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
