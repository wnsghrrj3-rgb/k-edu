/* ============================================================================
   케이랩 도구 모듈 — 자석·자기장 (magnet) v3  [과학 3호 · 3모드]
   3학년 자석의 이용.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 자기력선(field line) 실제 곡선 — N극에서 나와 S극으로 휘어 들어가는
        눈에 안 보이는 자기장을 그려서 보여줌. (v1은 나침반 격자뿐)
     ▸ 보기 토글 — [자기력선]/[나침반]. 두 방식으로 같은 자기장을 봄.
     ▸ 끌림·밀림 — 두 자석이 마주본 극을 판정해 끌리는지 미는지 설명.
     ▸ 탐구 미션 2종 — 끌리게(다른 극 마주) / 밀리게(같은 극 마주) 만들기.
   변수 → 현상 → 발견:
     자석을 옮기고 돌리고 1·2개 전환 → 자기장 모양 변화 →
     "자석 둘레엔 눈에 안 보이는 자기장이 있고, 다른 극은 당기고 같은 극은 민다."
   - 의존: window.KLab (순수 SVG)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 자기력선/나침반 장면을 보고 답하기.
   v4 (탐구 표준 v2 — redesigns/magnet.md):
     1층 변수: 🧲 자석1 세기 슬라이더(×0.5~×3 — 2개 조합 자기장 기하 변형) +
              ↻ 각도 슬라이더(0~360° 연속 — 기존 30° 점프의 연속 승급). 고·free 전용.
     2층 만약에: 🤜 같은 극 억지로 붙이기(원본 D칸 중 만약에 상환·역제곱 체감) /
               🔥 뜨거운 자석(퀴리 온도 770℃ — "자석은 영원하다" 오개념 직격) /
               🌍 지구가 자석이 아니라면(나침반 길잃음 + 지리 북극=자기 S극 반전). 중=🤜🌍, 고=3종.
     3층 예측: 세기·각도 첫 조작 = 🔮 무장 → 해소·칩. 만약에 정리 자동 칩. 5칩 = 🧲 꼬마 자석탐정.
     4층: SVG 유지(자기력선 2D가 원리 그 자체). 기본값(×1·0°) = 기존 거동 완전 동일.
   - config: { count(자석 1|2, 기본1), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={N:'#E03131',S:'#1C7ED6',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',line:'#7048E8'};
  window.KLab.register('magnet', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var cutPieces=null, cutGap=0;   // 와우: 반으로 자르기 상태(null=안 자름 · 양수 gap=벌어짐)
    function oneMag(){ return [{x:450,y:250,ang:0}]; }
    function twoMag(){ return [{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]; }
    var mags = (config.count===2)?twoMag():oneMag();
    var view='lines';                 // 'lines' | 'compass'
    var rotCount=0, rotInCompass=false;
    /* v2 1층 — 자석1 세기·각도 스캔 상태 */
    var strV=1, angSpan={min:null,max:null};
    function v2reset(){ strV=1; angSpan={min:null,max:null}; }
    /* v2 2층 — 만약에 무대 상태 */
    var wf={gap:260,pushed:0,released:false,temp:20,magz:true,cooled:false,eon:true};
    function wifStageReset(){ wf={gap:260,pushed:0,released:false,temp:20,magz:true,cooled:false,eon:true}; }
    /* 저학년 '철 찾기' — 자석에 붙는 것/안 붙는 것 탐구 (신규 기능) */
    function defObjects(){ return [
      {emoji:'📎',name:'클립',  iron:true,  x:240,y:330,attached:false,shake:0},
      {emoji:'🔩',name:'나사',  iron:true,  x:660,y:330,attached:false,shake:0},
      {emoji:'📌',name:'압정',  iron:true,  x:450,y:375,attached:false,shake:0},
      {emoji:'🧽',name:'스펀지',iron:false, x:330,y:365,attached:false,shake:0},
      {emoji:'🪵',name:'나무',  iron:false, x:570,y:365,attached:false,shake:0},
      {emoji:'🪙',name:'동전',  iron:false, x:450,y:300,attached:false,shake:0}
    ]; }
    var OBJECTS=defObjects(), triedNon=false;
    var btn='font-size:21px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, ML=80, MW=42; // 자석 반길이/폭

    function poles(){var ps=[];mags.forEach(function(m,i){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
      var q=(i===0)?strV:1;   // v2: 자석1 세기 — 2개 조합에서 합성 자기장 기하가 실제로 변형
      ps.push({x:m.x+dx,y:m.y+dy,q:q}); ps.push({x:m.x-dx,y:m.y-dy,q:-q});});return ps;}
    function field(px,py){var bx=0,by=0,P=poles();for(var i=0;i<P.length;i++){var p=P[i],rx=px-p.x,ry=py-p.y,r2=rx*rx+ry*ry,r=Math.sqrt(r2);if(r<14)r=14;var inv=p.q/(r2*r);bx+=rx*inv;by+=ry*inv;}return [bx,by];}

    // 자기력선: N극 둘레 시작점에서 필드 방향을 따라 적분하며 S극으로 추적
    function trace(sx,sy){
      var pts=[sx+','+sy], x=sx, y=sy, step=5, P=poles();
      for(var k=0;k<260;k++){
        var f=field(x,y), m=Math.sqrt(f[0]*f[0]+f[1]*f[1]); if(m<1e-9)break;
        x+=f[0]/m*step; y+=f[1]/m*step;
        if(x<-40||x>VBW+40||y<-40||y>VBH+40)break;
        pts.push(x.toFixed(1)+','+y.toFixed(1));
        var stop=false;                       // S극에 충분히 가까우면 멈춤
        for(var j=0;j<P.length;j++){if(P[j].q<0&&Math.hypot(x-P[j].x,y-P[j].y)<14){stop=true;break;}}
        if(stop)break;
      }
      return pts.join(' ');
    }
    function fieldLines(svg){
      mags.forEach(function(m,i){
        var nx=m.x+Math.cos(m.ang)*ML, ny=m.y+Math.sin(m.ang)*ML;   // 이 자석 N극
        var step=(i===0&&strV>=1.7)?30:45;                          // v2: 센 자석 = 가닥 8→12
        var wdt=(i===0)?(2*Math.min(Math.max(strV,0.6),2)):2;       // v2: 세기 비례 굵기
        for(var a=0;a<360;a+=step){var rad=a*Math.PI/180;
          var sx=nx+Math.cos(rad)*16, sy=ny+Math.sin(rad)*16;
          svg.appendChild(svgEl('polyline',{points:trace(sx,sy),fill:'none',stroke:C.line,'stroke-width':wdt,'stroke-opacity':0.5,'stroke-linecap':'round'}));
        }
      });
    }

    function facing(){
      if(mags.length<2)return null;
      function near(m,t){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
        return Math.hypot(m.x+dx-t.x,m.y+dy-t.y) < Math.hypot(m.x-dx-t.x,m.y-dy-t.y) ? 'N':'S';}
      var pa=near(mags[0],mags[1]), pb=near(mags[1],mags[0]);
      var dist=Math.hypot(mags[0].x-mags[1].x,mags[0].y-mags[1].y);
      return {kind:(pa===pb?'repel':'attract'), pa:pa, pb:pb, near:dist<320};
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'↻ <b style="color:#7048E8;">돌리기를 두 번</b> 눌러 자기력선이 자석을 따라 도는지 봐요!',
        check:function(){ return rotCount>=2; } },
      { text:'🧲 자석 2개로 바꿔, <b style="color:#7048E8;">다른 극(N–S)을 마주</b>해 가까이 — 서로 끌리게!',
        check:function(){ var f=facing(); return !!f && f.near && f.kind==='attract'; } },
      { text:'💢 이번엔 <b style="color:#7048E8;">같은 극을 마주</b>해 봐요 — 서로 밀어내게!',
        check:function(){ var f=facing(); return !!f && f.near && f.kind==='repel'; } },
      { text:'🧭 <b style="color:#7048E8;">나침반 보기</b>로 바꿔서 자석을 돌려 봐요 — 바늘이 따라 돌아요!',
        check:function(){ return view==='compass' && rotInCompass; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=무엇이 붙을까(철 찾기, 신규 무대) / 중=극·끌림·밀림(자석 2개) / 고=자기장·나침반(자기력선·나침반 풀). */
    var LOW_MISSIONS=[
      { text:'🧲 자석에 <b style="color:#7048E8;">붙는 물건</b>을 찾아 탭해 봐요! (쇠붙이가 자석에 붙어요)',
        check:function(){ return OBJECTS.some(function(o){return o.iron&&o.attached;}); } },
      { text:'🤔 이번엔 자석에 <b style="color:#7048E8;">안 붙는 물건</b>을 탭해서 확인해 봐요 — 다 붙는 건 아니에요!',
        check:function(){ return triedNon; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],                 missions:LOW_MISSIONS,             showView:false, showCnt:false, showCut:false, startCnt:1, wif:[], hint:'물건을 탭해 자석에 붙는지 확인해 봐요. 쇠붙이만 붙어요!' },
      mid:  { modes:['free','mission','quiz','whatif'], missions:[MISSIONS[1],MISSIONS[2]], showView:false, showCnt:true,  showCut:true,  startCnt:2, wif:['push','earthmag'], hint:'자석 2개의 극을 마주 보게 옮겨, 끌리는지 밀어내는지 봐요. (돌리기로 극 방향 바꾸기)' },
      high: { modes:['free','mission','quiz','whatif'], missions:MISSIONS,                  showView:true,  showCnt:true,  showCut:true,  startCnt:1, wif:['push','curie','earthmag'], hint:'자기력선·나침반으로 눈에 안 보이는 자기장을 살펴봐요. 자석을 돌리면 자기장도 따라 돌아요.' }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].missions; }
    function applyGradeStage(){ // 칸에 맞는 무대 초기 상태
      if(grade==='low'){ mags=oneMag(); OBJECTS=defObjects(); triedNon=false; view='lines'; }
      else { mags=(GRADES[grade].startCnt===2)?twoMag():oneMag(); view='lines'; }
    }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; rotCount=0; rotInCompass=false; cutPieces=null; cutGap=0;
      v2reset(); wifStageReset(); if(wif)wif.reset(); makeWif();
      applyGradeStage(); buildUI();
    }});
    applyGradeStage();

    /* ───────────── 🌀 만약에 (v2 2층 — 원본 D칸 중 만약에 상환 + 오개념 확장 2종) ───────────── */
    var WHATIF={
      push:{ icon:'🤜', title:'같은 극을 억지로 붙이면?',
        q:'같은 극(N–N)끼리 계속 밀어붙이면 어떻게 될까요?',
        ch:['계속 밀다가 결국 착 붙어요','가까울수록 점점 더 세게 밀어내요','어느 순간부터는 밀지 않아요'], a:1,
        reveal:'가까워질수록 밀어내는 힘이 확 커져요 — 거리가 절반이 되면 힘은 네 배! 그래서 아무리 눌러도 붙일 수 없고, 손을 떼는 순간 팅— 하고 튕겨 나가요. 자기부상열차가 떠서 달리는 것도 이 미는 힘 덕분이에요.',
        tip:'🤜 밀기를 반복해 힘 게이지를 봐요 — 그리고 🖐 손을 떼면?' },
      curie:{ icon:'🔥', title:'자석을 뜨겁게 달구면?',
        q:'자석을 아주 뜨겁게(770℃까지) 달구면 어떻게 될까요?',
        ch:['더 센 자석이 돼요','자석의 힘을 잃어버려요','아무 일도 없어요'], a:1,
        reveal:'자석의 힘은 철 속 아주 작은 자석들이 한 방향으로 줄 서 있는 거예요. 열이 그 줄서기를 마구 흩뜨려서, 770℃(퀴리 온도)를 넘는 순간 자석이기를 멈춰요 — 식혀도 흐트러진 줄은 저절로 돌아오지 않아요. 자석은 영원하지 않답니다!',
        tip:'🔥 달구기를 반복해 온도를 올려 봐요 — 클립이 언제까지 버틸까?' },
      earthmag:{ icon:'🌍', title:'지구가 자석이 아니라면?',
        q:'지구가 커다란 자석이 아니라면, 나침반 바늘은 어떻게 될까요?',
        ch:['그래도 북쪽을 가리켜요','아무 방향이나 제각각 가리켜요','남쪽을 가리켜요'], a:1,
        reveal:'나침반이 북쪽을 찾는 건 지구 속 거대한 자석 덕분이에요! 지구 자석이 없으면 바늘은 갈 곳을 잃어요. 그리고 반전 하나 — N바늘이 끌려가는 지리상 북극은 사실 지구 자석의 S극이에요. 철새와 바다거북도 이 자기장으로 길을 찾아요.',
        tip:'🌍 지구 자석을 껐다 켜 봐요 — 나침반들이 어떻게 되나!' }
    };
    var wif;
    function makeWif(){
      var scen={}; GRADES[grade].wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ buildUI(); },
        footEl:function(){ return el.querySelector('.mg-foot'); },
        onSelect:function(k){ wifStageReset(); },
        onPlay:function(k){ },
        onExit:function(){ wifStageReset(); }
      });
    }
    makeWif();
    function wifKey(){ return (mode==='whatif'&&wif&&wif.state.key)?wif.state.key:null; }

    /* ── v2 예측 무장 (3층) — 세기·각도 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ str:{asked:false,ch:-1,done:false}, rot:{asked:false,ch:-1,done:false} };
    var PRED={
      str:{ q:'🔮 예측 먼저! 한쪽 자석이 훨씬 세지면 자기장은 어떻게 될까요?',
        ch:['아무 변화 없다','센 자석의 자기력선이 더 멀리 뻗는다','약한 자석의 자기장이 사라진다'],
        tip:'🧲 슬라이더를 끝(×3)까지 올려 자기력선을 지켜봐요!' },
      rot:{ q:'🔮 예측 먼저! 자석을 빙 돌리면 자기장은 어떻게 될까요?',
        ch:['자기장은 제자리에 남는다','자기장도 자석을 따라 통째로 돈다','자기장이 사라진다'],
        tip:'↻ 슬라이더로 반 바퀴 넘게 돌려 봐요 — 자기력선이 어떻게 되나!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.mg-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="mg-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="mg-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.mg-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
          checkPred();
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='str') msg=hit?'✔ 예측 적중 — 센 자석의 자기력선이 더 굵고 촘촘하게 멀리 뻗어요! 자석 2개면 센 쪽 자기장이 약한 쪽까지 밀고 들어가요.'
                              :'✘ 예측 빗나감 — 자석이 세지면 자기력선이 더 굵고 촘촘하게 멀리 뻗어요! 세기도 자기장의 모양을 바꾸는 변수랍니다.';
      else msg=hit?'✔ 예측 적중 — 자기장은 자석에 붙어 있어요! 자석이 도는 만큼 자기력선도 통째로 따라 돌아요.'
                  :'✘ 예측 빗나감 — 자기장은 제자리에 남지 않아요! 자석을 돌리면 자기력선 전체가 자석을 따라 통째로 돌아요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.mg-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.str.ch>=0&&!pred.str.done&&strV>=2.5)predResolve('str');
      if(pred.rot.ch>=0&&!pred.rot.done&&angSpan.min!=null&&(angSpan.max-angSpan.min)>=180)predResolve('rot');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={push:'🤜 밀어붙이기',curie:'🔥 뜨거운자석',earthmag:'🌍 지구자석',str:'🧲 세기예측',rot:'↻ 회전예측'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🧲 꼬마 자석탐정 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.mg-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="mg-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(curMissions()[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<curMissions().length-1)mStep++; else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (자기장 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { q:'마주본 극이 N–S인 이 두 자석은 어떻게 될까요?', ch:['서로 끌려요','서로 밀어내요','아무 일 없어요'], a:0,
        scn:function(){ view='lines'; mags=[{x:340,y:230,ang:0},{x:560,y:230,ang:0}]; } },
      { q:'마주본 극이 같은 이 두 자석은 어떻게 될까요?', ch:['서로 밀어내요','서로 끌려요','달라붙어요'], a:0,
        scn:function(){ view='lines'; mags=[{x:340,y:230,ang:0},{x:560,y:230,ang:Math.PI}]; } },
      { q:'보라색 자기력선은 어느 쪽으로 갈까요?', ch:['N극에서 나와 S극으로','S극에서 나와 N극으로','극과 상관없어요'], a:0,
        scn:function(){ view='lines'; mags=oneMag(); } },
      { q:'나침반 바늘이 가리키는 것은 무엇일까요?', ch:['자석이 만든 자기장의 방향','바람이 부는 방향','해가 뜨는 방향'], a:0,
        scn:function(){ view='compass'; mags=oneMag(); } },
      { q:'철 클립이 자석에 잘 붙는 까닭은?', ch:['철로 만들어져서','플라스틱이라서','아주 가벼워서'], a:0,
        scn:function(){ view='lines'; mags=oneMag(); } }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      QUIZ[qIdx].scn();
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── 와우 ④ 마법모먼트 — 반으로 자르기(예측 빗나감형) ─────────────
       오개념: "자석을 반으로 자르면 N극 조각·S극 조각으로 나뉜다."
       반증: 각 조각이 다시 N극과 S극을 가진 작은 자석이 됨 — 자른 곳에 새 극 한 쌍이 생김. */
    function clearFlash(){ var f=el.querySelector('.mg-flash'); if(f&&f.parentNode)f.parentNode.removeChild(f); }
    function mgFlash(html){
      clearFlash();
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      var d=document.createElement('div'); d.className='mg-flash'; d.innerHTML=html; host.appendChild(d);
      setTimeout(function(){ var f=el.querySelector('.mg-flash'); if(f===d&&f.parentNode)f.parentNode.removeChild(f); },2800);
    }
    function animateGap(){
      var target=80, steps=9, i=0;
      (function step(){ i++; cutGap=target*i/steps; if(cutPieces)render(); if(i<steps)requestAnimationFrame(step); })();
    }
    function doCut(){
      if(cutPieces||mode!=='free'||!GRADES[grade].showCut||mags.length!==1)return;
      cutPieces=true; cutGap=0; snd('whoosh'); snd('success'); buildUI();
      mgFlash('✂️ 반으로 잘랐는데 <b>양쪽 다 다시 N극과 S극</b>이 생겼어요! 자석은 아무리 잘라도 한 극만 떼어낼 수 없어요 — 자른 곳에 새 극이 생겨요.');
      animateGap();
    }
    function unCut(){ cutPieces=null; cutGap=0; clearFlash(); snd('select'); buildUI(); }

    /* v2 2층 — 만약에별 조작 줄 (play·reveal 단계에서만) */
    function wifCtrl(){
      var k=wifKey(); if(!k||wif.state.phase==='predict'||wif.state.phase==='pick')return '';
      if(k==='push'){
        var F=pushForce();
        return '<div class="mg-wifctl" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
          +'<button class="mg-push" style="'+btn+'background:#E03131;color:#fff;border-color:#E03131;">🤜 밀어붙이기</button>'
          +'<button class="mg-rel" style="'+btn+'background:#fff;color:#1565C0;border-color:#1565C0;"'+(wf.pushed<1?' disabled':'')+'>🖐 손 떼기</button>'
          +'<span style="font-size:16px;font-weight:800;color:#C2255C;font-family:inherit;">미는 힘 '+F+'%</span>'
        +'</div>';
      }
      if(k==='curie'){
        return '<div class="mg-wifctl" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
          +'<button class="mg-heat" style="'+btn+'background:#E8590C;color:#fff;border-color:#E8590C;">🔥 달구기 (+150℃)</button>'
          +'<button class="mg-cool" style="'+btn+'background:#fff;color:#1C7ED6;border-color:#1C7ED6;">↩️ 식히기</button>'
          +'<span style="font-size:16px;font-weight:800;color:'+(wf.magz?'#E8590C':'#868E96')+';font-family:inherit;">'+wf.temp+'℃ / 퀴리 온도 770℃</span>'
        +'</div>';
      }
      return '<div class="mg-wifctl" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
        +'<button class="mg-eon" style="'+btn+(wf.eon?'background:#12B886;color:#fff;border-color:#12B886;':'background:#fff;color:#868E96;border-color:#868E96;')+'">🌍 지구 자석 '+(wf.eon?'켜짐 → 꺼 보기':'꺼짐 → 켜 보기')+'</button>'
      +'</div>';
    }
    function pushForce(){ var r=260/wf.gap; return Math.round(r*r*10); }

    function buildUI(){
      var rot=mags.map(function(m,i){return '<button class="mg-btn" data-rot="'+i+'" style="'+btn+'background:#fff;color:#7048E8;border-color:#7048E8;">↻ 자석'+(mags.length>1?(i+1):'')+' 돌리기</button>';}).join('');
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode,{whatif:'🌀 만약에'}), bar='', foot='';
      /* v2 1층 행 — 고학년·자유탐구 전용 (기본값 = 기존 거동 동일) */
      var angDeg=Math.round(((mags[0].ang*180/Math.PI)%360+360)%360);
      var v2row=(mode==='free'&&grade==='high'&&!cutPieces)?('<div class="mg-v2" style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
          +'<label style="display:flex;align-items:center;gap:6px;font-size:15.5px;font-weight:800;color:#5F3DC4;font-family:inherit;">🧲 자석1 세기 <input type="range" class="mg-str" min="0.5" max="3" step="0.1" value="'+strV+'" style="width:130px;"> <span class="mg-strlb" style="min-width:38px;">×'+strV.toFixed(1)+'</span></label>'
          +'<label style="display:flex;align-items:center;gap:6px;font-size:15.5px;font-weight:800;color:#5F3DC4;font-family:inherit;">↻ 자석1 각도 <input type="range" class="mg-ang" min="0" max="360" step="2" value="'+angDeg+'" style="width:130px;"> <span class="mg-anglb" style="min-width:40px;">'+angDeg+'°</span></label>'
        +'</div>'):'';
      var viewRow=GRADES[grade].showView?('<div style="display:flex;gap:7px;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-view'+(view==='lines'?' on':'')+'" data-view="lines" style="'+btn+'border-color:#7048E8;'+(view==='lines'?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🧲 자기력선</button>'
          +'<button class="mg-view'+(view==='compass'?' on':'')+'" data-view="compass" style="'+btn+'border-color:#7048E8;'+(view==='compass'?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🧭 나침반</button>'
        +'</div>'):'';
      var cntRow=GRADES[grade].showCnt?('<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-btn" data-cnt="1" style="'+btn+(mags.length===1?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 1개</button>'
          +'<button class="mg-btn" data-cnt="2" style="'+btn+(mags.length===2?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 2개</button>'
          +'<span style="width:6px;"></span>'+rot
        +'</div>'):'';
      var hint='<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">'+GRADES[grade].hint+'</div>';
      var canCut=(mode==='free'&&GRADES[grade].showCut&&mags.length===1&&!cutPieces);
      var cutRow = cutPieces
        ? '<div style="display:flex;justify-content:center;margin-bottom:6px;"><button class="mg-uncut" style="'+btn+'background:#fff;color:#12B886;border-color:#12B886;">↩️ 도로 붙이기</button></div>'
        : (canCut ? '<div style="display:flex;justify-content:center;margin-bottom:6px;"><button class="mg-cut" style="'+btn+'background:#7048E8;color:#fff;border-color:#7048E8;">✂️ 반으로 잘라보기</button></div>' : '');
      var mid = cutPieces
        ? (cutRow+'<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">자석을 반으로 잘라도 각 조각이 다시 N극과 S극을 가진 작은 자석이 돼요.</div>')
        : (v2row+viewRow+cntRow+cutRow+hint);
      if(mode==='mission'){ var CMB=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); mid=''; foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); mid=wifCtrl(); }
      /* v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.mg-btn:active,.kl-choice:active{transform:translateY(2px);}.mg-stage{cursor:default;touch-action:none;}.mg-mag{cursor:grab;}.mg-stage.drag .mg-mag{cursor:grabbing;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.mg-view.on{background:#7048E8 !important;color:#fff !important;}'
        +'.mg-flash{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:#7048E8;color:#fff;padding:11px 18px;border-radius:14px;font-family:Gowun Dodum,sans-serif;font-size:16px;font-weight:800;line-height:1.45;box-shadow:0 6px 18px rgba(112,72,232,0.4);max-width:88%;text-align:center;z-index:5;animation:mgPop .4s ease;}'
        +'@keyframes mgPop{from{opacity:0;transform:translate(-50%,-10px);}to{opacity:1;transform:translate(-50%,0);}}'
        +'.mg-hold{display:inline-block;animation:mgHold 1s ease 2;}@keyframes mgHold{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}'
        +'.mg-spark{animation:mgSpark 1.1s ease infinite;}@keyframes mgSpark{0%,100%{opacity:.4;}50%{opacity:1;}}'
        +'.mg-newpole{animation:mgGlow 1.2s ease infinite;}@keyframes mgGlow{0%,100%{stroke-opacity:.4;}50%{stroke-opacity:1;}}</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="mg-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'42vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 50% 25%,#FCFEFF 0%,#EFF4F9 75%,#E2EAF3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +((mode==='free'||mode==='whatif')?'<div class="mg-foot"></div>':'')
        +'<div class="mg-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;line-height:1.4;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="mg-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; rotCount=0; rotInCompass=false; cutPieces=null; cutGap=0;
        v2reset(); wifStageReset(); if(wif)wif.reset();
        applyGradeStage();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      bind(); if(mode==='whatif')wif.bind(el); renderChips(); render();
    }

    var stage;
    function compass(svg,x,y){
      var f=field(x,y), ang=Math.atan2(f[1],f[0]), L=15;
      var nx=x+Math.cos(ang)*L, ny=y+Math.sin(ang)*L, sx=x-Math.cos(ang)*L, sy=y-Math.sin(ang)*L;
      var px=Math.cos(ang+Math.PI/2)*4, py=Math.sin(ang+Math.PI/2)*4;
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:17,fill:'#fff','fill-opacity':0.5,stroke:'#C7D4E0','stroke-width':1}));
      svg.appendChild(svgEl('path',{d:'M '+nx+' '+ny+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:C.N}));
      svg.appendChild(svgEl('path',{d:'M '+sx+' '+sy+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:'#ADB5BD'}));
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:2.5,fill:C.ink}));
    }
    function magnet(svg,m,i){
      var g=svgEl('g',{class:'mg-mag','data-mag':i,transform:'rotate('+(m.ang*180/Math.PI)+' '+m.x+' '+m.y+')'});
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2+4,width:ML*2,height:MW,rx:8,fill:'#1A3357','fill-opacity':0.16}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML,height:MW,rx:8,fill:C.S}));
      g.appendChild(svgEl('rect',{x:m.x,y:m.y-MW/2,width:ML,height:MW,rx:8,fill:C.N}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML*2,height:MW,rx:8,fill:'none',stroke:'#fff','stroke-width':2,'stroke-opacity':0.5}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML*2,height:MW*0.4,rx:8,fill:'#fff','fill-opacity':0.18}));
      var tS=svgEl('text',{x:m.x-ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tS.textContent='S';g.appendChild(tS);
      var tN=svgEl('text',{x:m.x+ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tN.textContent='N';g.appendChild(tN);
      svg.appendChild(g);
    }
    function renderAttract(svg){
      var mx=450,my=150; mags=[{x:mx,y:my,ang:0}];
      magnet(svg,mags[0],0);
      var nAtt=0;
      OBJECTS.forEach(function(o){
        var x=o.x,y=o.y;
        if(o.attached){ x=mx-62+nAtt*62; y=my+54; nAtt++; }
        var g=svgEl('g',{class:'mg-obj','data-obj':o.name});
        g.appendChild(svgEl('circle',{cx:x,cy:y,r:33,fill:'#fff','fill-opacity':0.01,style:'cursor:pointer;'}));
        var t=svgEl('text',{x:x,y:y,'text-anchor':'middle','dominant-baseline':'central','font-size':46,style:'pointer-events:none;'}); t.textContent=o.emoji; g.appendChild(t);
        if(o.attached){ var c=svgEl('text',{x:x+22,y:y-22,'font-size':22,style:'pointer-events:none;'}); c.textContent='✨'; g.appendChild(c); }
        svg.appendChild(g);
      });
    }
    function piece(svg,cx,cy,newLeft){
      // 잘린 작은 자석 [S | N], 반길이 PML. newLeft=true 면 왼쪽(S)이 새 극, false 면 오른쪽(N)이 새 극.
      var PML=ML/2, h=MW, g=svgEl('g',{class:'mg-piece'});
      g.appendChild(svgEl('rect',{x:cx-PML,y:cy-h/2+4,width:PML*2,height:h,rx:8,fill:'#1A3357','fill-opacity':0.16}));
      g.appendChild(svgEl('rect',{x:cx-PML,y:cy-h/2,width:PML,height:h,rx:8,fill:C.S}));
      g.appendChild(svgEl('rect',{x:cx,y:cy-h/2,width:PML,height:h,rx:8,fill:C.N}));
      g.appendChild(svgEl('rect',{x:cx-PML,y:cy-h/2,width:PML*2,height:h,rx:8,fill:'none',stroke:'#fff','stroke-width':2,'stroke-opacity':0.5}));
      var tS=svgEl('text',{x:cx-PML/2,y:cy+8,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':22,'font-weight':800,fill:'#fff'});tS.textContent='S';g.appendChild(tS);
      var tN=svgEl('text',{x:cx+PML/2,y:cy+8,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':22,'font-weight':800,fill:'#fff'});tN.textContent='N';g.appendChild(tN);
      var npx=newLeft?cx-PML:cx+PML;   // 새로 생긴 극(잘린 면) 강조
      g.appendChild(svgEl('circle',{class:'mg-newpole',cx:npx,cy:cy,r:17,fill:'none',stroke:C.line,'stroke-width':3,'stroke-opacity':0.9}));
      var sp=svgEl('text',{class:'mg-spark',x:npx,y:cy-h/2-7,'text-anchor':'middle','font-size':22});sp.textContent='✨';g.appendChild(sp);
      svg.appendChild(g);
    }
    function renderCut(svg){
      var cx0=450, cy=215, PML=ML/2, gap=cutGap;
      var leftCx=cx0-gap/2-PML, rightCx=cx0+gap/2+PML;
      if(gap>8){ var sc=svgEl('text',{x:cx0,y:cy-MW/2-20,'text-anchor':'middle','font-size':26});sc.textContent='✂️';svg.appendChild(sc); }
      piece(svg,leftCx,cy,false);   // 왼쪽 조각: 잘린 면(오른쪽 N)이 새 극
      piece(svg,rightCx,cy,true);   // 오른쪽 조각: 잘린 면(왼쪽 S)이 새 극
      var lab=svgEl('text',{x:cx0,y:cy+MW+40,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':19,fill:C.line});
      lab.textContent='✨ 자른 곳에 새 극이 생겼어요 — 조각마다 N극·S극 한 쌍씩'; svg.appendChild(lab);
    }
    /* ── v2 만약에 무대 3종 ── */
    function renderPush(svg){
      var gap=wf.released?360:wf.gap;
      var c1=450-gap/2-ML, c2=450+gap/2+ML, cy=235;
      var m1={x:c1,y:cy,ang:0}, m2={x:c2,y:cy,ang:Math.PI};   // N–N 마주
      magnet(svg,m1,0); magnet(svg,m2,1);
      // 미는 힘 게이지 (역제곱 체감)
      var F=Math.min(pushForce(),200), gw=380;
      svg.appendChild(svgEl('rect',{x:450-gw/2,y:380,width:gw,height:20,rx:10,fill:'#E9EEF5'}));
      svg.appendChild(svgEl('rect',{x:450-gw/2,y:380,width:gw*Math.min(F/200,1),height:20,rx:10,fill:'#E03131','fill-opacity':0.85}));
      var fl=svgEl('text',{x:450,y:370,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:'#C2255C'});
      fl.textContent=wf.released?'팅— 튕겨 나갔어요! 💨':('미는 힘 '+pushForce()+'%  (가까울수록 확 커져요)'); svg.appendChild(fl);
      if(wf.released){
        var w1=svgEl('text',{x:c1-ML-26,y:cy+8,'font-size':30}); w1.textContent='💨'; svg.appendChild(w1);
        var w2=svgEl('text',{x:c2+ML+2,y:cy+8,'font-size':30}); w2.textContent='💨'; svg.appendChild(w2);
      } else {
        // 마주 선 두 N극 사이 반발 표식
        var sp=svgEl('text',{x:450,y:cy+8,'text-anchor':'middle','font-size':26,class:'mg-spark'}); sp.textContent='⚡'; svg.appendChild(sp);
      }
      stage.dataset.gap=gap; stage.dataset.force=pushForce(); stage.dataset.rel=wf.released?1:0;
    }
    function renderCurie(svg){
      var m={x:450,y:180,ang:0};
      if(wf.magz){ var save=mags; mags=[m]; fieldLines(svg); mags=save; }
      magnet(svg,m,0);
      // 클립 — 자성 있으면 N극에 붙음, 잃으면 뚝 떨어짐
      var cx=m.x+ML+16, cyv=wf.magz?m.y:396;
      var clip=svgEl('text',{x:cx,y:cyv,'text-anchor':'middle','dominant-baseline':'central','font-size':40}); clip.textContent='📎'; svg.appendChild(clip);
      if(!wf.magz){ var dl=svgEl('text',{x:cx+34,y:396,'font-size':19,'font-family':'Gowun Dodum,sans-serif','font-weight':800,fill:'#868E96'}); dl.textContent='뚝!'; svg.appendChild(dl); }
      // 온도 게이지 (20~920, 770 퀴리 마커)
      var gx=140,gw=620,gy=330, frac=Math.min((wf.temp-20)/900,1), cf=(770-20)/900;
      svg.appendChild(svgEl('rect',{x:gx,y:gy,width:gw,height:20,rx:10,fill:'#E9EEF5'}));
      svg.appendChild(svgEl('rect',{x:gx,y:gy,width:gw*frac,height:20,rx:10,fill:wf.magz?'#E8590C':'#868E96','fill-opacity':0.9}));
      svg.appendChild(svgEl('line',{x1:gx+gw*cf,y1:gy-10,x2:gx+gw*cf,y2:gy+30,stroke:'#C2255C','stroke-width':3,'stroke-dasharray':'5 4'}));
      var cm=svgEl('text',{x:gx+gw*cf,y:gy-16,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':16,'font-weight':800,fill:'#C2255C'}); cm.textContent='퀴리 온도 770℃'; svg.appendChild(cm);
      var tl=svgEl('text',{x:gx,y:gy+46,'font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:'#5a7894'});
      tl.textContent=wf.temp+'℃'+(wf.magz?'':' — 자석의 힘을 잃었어요'+(wf.cooled?' (식혀도 안 돌아와요!)':'')); svg.appendChild(tl);
      stage.dataset.temp=wf.temp; stage.dataset.magz=wf.magz?1:0;
    }
    function renderEarth(svg){
      var ex=450,ey=245,R=140;
      svg.appendChild(svgEl('circle',{cx:ex,cy:ey,r:R,fill:'#74C0FC','fill-opacity':0.5,stroke:'#1C7ED6','stroke-width':3}));
      var gl=svgEl('text',{x:ex,y:ey+R+28,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':17,'font-weight':800,fill:'#1C7ED6'}); gl.textContent='🌍 지구'; svg.appendChild(gl);
      var pS={x:ex,y:ey-64}, pN={x:ex,y:ey+64};   // 지구 속 막대자석: 위(지리 북극 쪽)=자기 S극!
      if(wf.eon){
        svg.appendChild(svgEl('rect',{x:ex-20,y:ey-70,width:40,height:70,rx:8,fill:C.S}));
        svg.appendChild(svgEl('rect',{x:ex-20,y:ey,width:40,height:70,rx:8,fill:C.N}));
        var tS=svgEl('text',{x:ex,y:ey-36,'text-anchor':'middle','font-size':22,'font-weight':800,fill:'#fff','font-family':'Gowun Dodum,sans-serif'}); tS.textContent='S'; svg.appendChild(tS);
        var tN=svgEl('text',{x:ex,y:ey+44,'text-anchor':'middle','font-size':22,'font-weight':800,fill:'#fff','font-family':'Gowun Dodum,sans-serif'}); tN.textContent='N'; svg.appendChild(tN);
        var lb=svgEl('text',{x:ex,y:ey-R-14,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':16.5,'font-weight':800,fill:'#C2255C'});
        lb.textContent='⬆ 지리상 북극 = 지구 자석의 S극!'; svg.appendChild(lb);
      } else {
        var q=svgEl('text',{x:ex,y:ey+10,'text-anchor':'middle','font-size':44}); q.textContent='❓'; svg.appendChild(q);
      }
      var topang=0;
      for(var i=0;i<8;i++){
        var a=-Math.PI/2+i*Math.PI/4, cx2=ex+Math.cos(a)*(R+62), cy2=ey+Math.sin(a)*(R+62), nang;
        if(wf.eon){
          var bx=0,by=0,PP=[{x:pS.x,y:pS.y,q:-1},{x:pN.x,y:pN.y,q:1}];
          for(var j=0;j<2;j++){var rx=cx2-PP[j].x,ry=cy2-PP[j].y,r2=rx*rx+ry*ry,r=Math.sqrt(r2);var inv=PP[j].q/(r2*r);bx+=rx*inv;by+=ry*inv;}
          nang=Math.atan2(by,bx);
        } else { nang=((i*137+53)%360)*Math.PI/180; }   // 결정적 '제각각'
        if(i===0)topang=Math.round(nang*180/Math.PI);
        var L=17, nx2=cx2+Math.cos(nang)*L, ny2=cy2+Math.sin(nang)*L, sx2=cx2-Math.cos(nang)*L, sy2=cy2-Math.sin(nang)*L;
        var px2=Math.cos(nang+Math.PI/2)*4.5, py2=Math.sin(nang+Math.PI/2)*4.5;
        svg.appendChild(svgEl('circle',{cx:cx2,cy:cy2,r:20,fill:'#fff','fill-opacity':0.85,stroke:'#C7D4E0','stroke-width':1.5}));
        svg.appendChild(svgEl('path',{class:'mg-needle',d:'M '+nx2+' '+ny2+' L '+(cx2+px2)+' '+(cy2+py2)+' L '+(cx2-px2)+' '+(cy2-py2)+' Z',fill:C.N}));
        svg.appendChild(svgEl('path',{d:'M '+sx2+' '+sy2+' L '+(cx2+px2)+' '+(cy2+py2)+' L '+(cx2-px2)+' '+(cy2-py2)+' Z',fill:'#ADB5BD'}));
      }
      stage.dataset.eon=wf.eon?1:0; stage.dataset.topang=topang;
    }
    function render(){
      stage=el.querySelector('.mg-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var wk=wifKey();
      if(wk){
        if(wk==='push')renderPush(svg); else if(wk==='curie')renderCurie(svg); else renderEarth(svg);
        stage.appendChild(svg); renderStatus(); return;
      }
      if(grade==='low'){ renderAttract(svg); stage.appendChild(svg); renderStatus(); checkMission(); return; }
      if(cutPieces){ renderCut(svg); stage.appendChild(svg); renderStatus(); checkMission(); return; }
      if(view==='lines'){ fieldLines(svg); }
      else { var cols=11, rows=6, mx=70, my=60;
        for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var x=mx+(VBW-2*mx)*c/(cols-1), y=my+(VBH-2*my)*r/(rows-1); compass(svg,x,y);} }
      mags.forEach(function(m,i){magnet(svg,m,i);});
      stage.appendChild(svg);
      /* v2 관측점 */
      stage.dataset.str=strV.toFixed(1);
      stage.dataset.ang0=Math.round(((mags[0].ang*180/Math.PI)%360+360)%360);
      stage.dataset.lines=svg.querySelectorAll('polyline').length;
      if(mags.length===2){ var mf=field((mags[0].x+mags[1].x)/2,(mags[0].y+mags[1].y)/2-70); stage.dataset.midfx=mf[0].toExponential(2); }
      renderStatus();
      checkMission();
    }
    function renderStatus(){
      var s=el.querySelector('.mg-status');
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;">그림 속 자석과 자기장을 보고 답을 골라요!</div>'; return; }
      var wk=wifKey();
      if(wk){
        var wmsg;
        if(wk==='push') wmsg=wf.released?'같은 극은 아무리 밀어도 붙지 않아요 — 손을 떼면 미는 힘이 자석을 튕겨 보내요!'
                                        :'거리가 절반이 되면 미는 힘은 네 배! 가까울수록 미는 힘이 확 커져요.';
        else if(wk==='curie') wmsg=wf.magz?'자석의 힘 = 철 속 작은 자석들의 줄서기. 열이 그 줄을 흩뜨려요 — 770℃가 고비예요.'
                                          :'퀴리 온도를 넘어 줄서기가 무너졌어요. 식혀도 흐트러진 줄은 저절로 돌아오지 않아요.';
        else wmsg=wf.eon?'나침반이 모두 지구 자석의 극을 향해요 — N바늘이 끌려가는 지리상 북극은 사실 자석의 S극!'
                        :'지구 자석이 없으면 나침반은 갈 곳을 잃어요 — 바늘이 제각각이에요.';
        s.innerHTML='<div style="font-size:19px;">'+wmsg+'</div>'; return;
      }
      if(cutPieces){
        s.innerHTML='<div style="font-size:20px;"><span class="mg-hold" style="color:'+C.line+';">자석은 잘라도 한 극만 따로 떼어낼 수 없어요.</span> 자른 곳마다 N극과 S극이 새로 한 쌍씩 생겨요.</div>';
        return;
      }
      if(grade==='low'){
        var att=OBJECTS.filter(function(o){return o.attached;}).length;
        s.innerHTML='<div style="font-size:19px;">🧲 쇠붙이(철)로 만든 물건만 자석에 붙어요! '+(att>0?('지금까지 '+att+'개 붙였어요 ✨'):'물건을 탭해 확인해 봐요.')+'</div>';
        return;
      }
      if(mags.length===1){
        s.textContent='자기력선이 자석을 빙 둘러 N극에서 나와 S극으로 들어가요 — 이게 눈에 안 보이는 자기장이에요. 자석을 돌려도 자기장이 함께 따라 돌아요.';
        return;
      }
      var f=facing(), msg, sub, col=C.sub;
      if(!f.near){ msg='두 자석이 멀어요'; sub='가까이 옮기면 두 자석 사이 자기장이 서로 영향을 줘요.'; }
      else if(f.kind==='attract'){ msg='<span style="color:'+C.good+';">서로 끌려요 🧲</span>'; sub='마주본 극이 다르면(N–S) 자기력선이 한 자석에서 다른 자석으로 이어져 서로 당겨요.'; }
      else { msg='<span style="color:'+C.N+';">서로 밀어내요 💢</span>'; sub='마주본 극이 같으면(N–N 또는 S–S) 자기력선이 부딪쳐 갈라지고 서로 밀어내요.'; }
      s.innerHTML='<div style="font-size:21px;">'+msg+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:4px;">'+sub+'</div>';
    }
    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){if(mode==='quiz'||wifKey())return;var g=e.target.closest?e.target.closest('.mg-mag'):null;if(!g)return;var i=+g.getAttribute('data-mag');var P=pt(e);drag={i:i,ox:P[0]-mags[i].x,oy:P[1]-mags[i].y};stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
    function move(e){if(!drag)return;var P=pt(e);mags[drag.i].x=Math.max(ML,Math.min(P[0]-drag.ox,VBW-ML));mags[drag.i].y=Math.max(MW,Math.min(P[1]-drag.oy,VBH-MW));render();}
    function up(){drag=null;if(stage)stage.classList.remove('drag');}
    function bind(){
      stage=el.querySelector('.mg-stage');
      stage.addEventListener('mousedown',down); stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){move(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      if(grade==='low'){
        el.querySelectorAll('.mg-obj').forEach(function(g){
          g.addEventListener('click',function(){
            if(mode==='quiz')return;
            var nm=g.getAttribute('data-obj'), o=null;
            OBJECTS.forEach(function(x){if(x.name===nm)o=x;});
            if(!o||o.attached)return;
            if(o.iron){ o.attached=true; if(window.KLab.sound)window.KLab.sound.play('success'); }
            else { triedNon=true; if(window.KLab.sound)window.KLab.sound.play('tap'); ui.toast(el,false,'🙅 '+o.name+'은(는) 자석에 안 붙어요!'); }
            render();
          });
        });
      }
      bands.bind(el);
      var cb=el.querySelector('.mg-cut'); if(cb)cb.addEventListener('click',doCut);
      var ub=el.querySelector('.mg-uncut'); if(ub)ub.addEventListener('click',unCut);
      el.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){if(view!==b.dataset.view){clearFlash();snd('select');view=b.dataset.view;buildUI();}});});
      el.querySelectorAll('[data-cnt]').forEach(function(b){b.addEventListener('click',function(){var n=+b.dataset.cnt;if(n!==mags.length){clearFlash();snd('select');cutPieces=null;cutGap=0;mags=(n===2)?[{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]:[{x:450,y:250,ang:0}];buildUI();}});});
      el.querySelectorAll('[data-rot]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.rot;mags[i].ang+=Math.PI/6;rotCount++;snd('tap');if(view==='compass')rotInCompass=true;
        if(i===0){var ag0=el.querySelector('.mg-ang'),al0=el.querySelector('.mg-anglb');var dg=Math.round(((mags[0].ang*180/Math.PI)%360+360)%360);if(ag0)ag0.value=dg;if(al0)al0.textContent=dg+'°';}
        render();});});
      /* ── v2 1층 슬라이더 (고·free 전용) ── */
      var st2=el.querySelector('.mg-str');
      if(st2)st2.addEventListener('input',function(){
        strV=+st2.value; var lb=el.querySelector('.mg-strlb'); if(lb)lb.textContent='×'+strV.toFixed(1);
        predArm('str'); render(); checkPred();
      });
      var ag2=el.querySelector('.mg-ang');
      if(ag2)ag2.addEventListener('input',function(){
        var dg=+ag2.value; mags[0].ang=dg*Math.PI/180;
        var al=el.querySelector('.mg-anglb'); if(al)al.textContent=dg+'°';
        if(angSpan.min==null||dg<angSpan.min)angSpan.min=dg;
        if(angSpan.max==null||dg>angSpan.max)angSpan.max=dg;
        predArm('rot'); render(); checkPred();
      });
      /* ── v2 2층 만약에 조작 ── */
      var pb=el.querySelector('.mg-push');
      if(pb)pb.addEventListener('click',function(){ if(wf.released){wf.released=false;wf.gap=260;wf.pushed=0;} wf.gap=Math.max(60,wf.gap-40); wf.pushed++; snd('tap'); buildUI(); });
      var rb=el.querySelector('.mg-rel');
      if(rb)rb.addEventListener('click',function(){ if(wf.pushed<1)return; wf.released=true; snd('whoosh'); buildUI(); });
      var hb=el.querySelector('.mg-heat');
      if(hb)hb.addEventListener('click',function(){ wf.temp=Math.min(920,wf.temp+150); if(wf.temp>=770&&wf.magz){wf.magz=false;snd('pop');} else snd('tap'); buildUI(); });
      var cb2=el.querySelector('.mg-cool');
      if(cb2)cb2.addEventListener('click',function(){ if(!wf.magz)wf.cooled=true; wf.temp=20; snd('select'); buildUI(); });
      var eb=el.querySelector('.mg-eon');
      if(eb)eb.addEventListener('click',function(){ wf.eon=!wf.eon; snd(wf.eon?'success':'pop'); buildUI(); });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); buildUI(); },1500);
        });
      });
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
