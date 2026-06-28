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

    function poles(){var ps=[];mags.forEach(function(m){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
      ps.push({x:m.x+dx,y:m.y+dy,q:1}); ps.push({x:m.x-dx,y:m.y-dy,q:-1});});return ps;}
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
      mags.forEach(function(m){
        var nx=m.x+Math.cos(m.ang)*ML, ny=m.y+Math.sin(m.ang)*ML;   // 이 자석 N극
        for(var a=0;a<360;a+=45){var rad=a*Math.PI/180;
          var sx=nx+Math.cos(rad)*16, sy=ny+Math.sin(rad)*16;
          svg.appendChild(svgEl('polyline',{points:trace(sx,sy),fill:'none',stroke:C.line,'stroke-width':2,'stroke-opacity':0.5,'stroke-linecap':'round'}));
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
      low:  { modes:['free','mission'],         missions:LOW_MISSIONS,             showView:false, showCnt:false, showCut:false, startCnt:1, hint:'물건을 탭해 자석에 붙는지 확인해 봐요. 쇠붙이만 붙어요!' },
      mid:  { modes:['free','mission','quiz'], missions:[MISSIONS[1],MISSIONS[2]], showView:false, showCnt:true,  showCut:true,  startCnt:2, hint:'자석 2개의 극을 마주 보게 옮겨, 끌리는지 밀어내는지 봐요. (돌리기로 극 방향 바꾸기)' },
      high: { modes:['free','mission','quiz'], missions:MISSIONS,                  showView:true,  showCnt:true,  showCut:true,  startCnt:1, hint:'자기력선·나침반으로 눈에 안 보이는 자기장을 살펴봐요. 자석을 돌리면 자기장도 따라 돌아요.' }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].missions; }
    function applyGradeStage(){ // 칸에 맞는 무대 초기 상태
      if(grade==='low'){ mags=oneMag(); OBJECTS=defObjects(); triedNon=false; view='lines'; }
      else { mags=(GRADES[grade].startCnt===2)?twoMag():oneMag(); view='lines'; }
    }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; rotCount=0; rotInCompass=false; cutPieces=null; cutGap=0; applyGradeStage(); buildUI();
    }});
    applyGradeStage();
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

    function buildUI(){
      var rot=mags.map(function(m,i){return '<button class="mg-btn" data-rot="'+i+'" style="'+btn+'background:#fff;color:#7048E8;border-color:#7048E8;">↻ 자석'+(mags.length>1?(i+1):'')+' 돌리기</button>';}).join('');
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode), bar='', foot='';
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
        : (viewRow+cntRow+cutRow+hint);
      if(mode==='mission'){ var CMB=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); mid=''; foot=ui.choices(quizChoices()); }
      el.innerHTML='<style>.mg-btn:active,.kl-choice:active{transform:translateY(2px);}.mg-stage{cursor:default;touch-action:none;}.mg-mag{cursor:grab;}.mg-stage.drag .mg-mag{cursor:grabbing;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.mg-view.on{background:#7048E8 !important;color:#fff !important;}'
        +'.mg-flash{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:#7048E8;color:#fff;padding:11px 18px;border-radius:14px;font-family:Jua,sans-serif;font-size:16px;font-weight:800;line-height:1.45;box-shadow:0 6px 18px rgba(112,72,232,0.4);max-width:88%;text-align:center;z-index:5;animation:mgPop .4s ease;}'
        +'@keyframes mgPop{from{opacity:0;transform:translate(-50%,-10px);}to{opacity:1;transform:translate(-50%,0);}}'
        +'.mg-hold{display:inline-block;animation:mgHold 1s ease 2;}@keyframes mgHold{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}'
        +'.mg-spark{animation:mgSpark 1.1s ease infinite;}@keyframes mgSpark{0%,100%{opacity:.4;}50%{opacity:1;}}'
        +'.mg-newpole{animation:mgGlow 1.2s ease infinite;}@keyframes mgGlow{0%,100%{stroke-opacity:.4;}50%{stroke-opacity:1;}}</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="mg-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'42vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 50% 25%,#FCFEFF 0%,#EFF4F9 75%,#E2EAF3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="mg-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; rotCount=0; rotInCompass=false; cutPieces=null; cutGap=0;
        applyGradeStage();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      bind(); render();
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
      var tS=svgEl('text',{x:m.x-ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tS.textContent='S';g.appendChild(tS);
      var tN=svgEl('text',{x:m.x+ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tN.textContent='N';g.appendChild(tN);
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
      var tS=svgEl('text',{x:cx-PML/2,y:cy+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:'#fff'});tS.textContent='S';g.appendChild(tS);
      var tN=svgEl('text',{x:cx+PML/2,y:cy+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:'#fff'});tN.textContent='N';g.appendChild(tN);
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
      var lab=svgEl('text',{x:cx0,y:cy+MW+40,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':19,fill:C.line});
      lab.textContent='✨ 자른 곳에 새 극이 생겼어요 — 조각마다 N극·S극 한 쌍씩'; svg.appendChild(lab);
    }
    function render(){
      stage=el.querySelector('.mg-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      if(grade==='low'){ renderAttract(svg); stage.appendChild(svg); renderStatus(); checkMission(); return; }
      if(cutPieces){ renderCut(svg); stage.appendChild(svg); renderStatus(); checkMission(); return; }
      if(view==='lines'){ fieldLines(svg); }
      else { var cols=11, rows=6, mx=70, my=60;
        for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var x=mx+(VBW-2*mx)*c/(cols-1), y=my+(VBH-2*my)*r/(rows-1); compass(svg,x,y);} }
      mags.forEach(function(m,i){magnet(svg,m,i);});
      stage.appendChild(svg);
      renderStatus();
      checkMission();
    }
    function renderStatus(){
      var s=el.querySelector('.mg-status');
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;">그림 속 자석과 자기장을 보고 답을 골라요!</div>'; return; }
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
    function down(e){if(mode==='quiz')return;var g=e.target.closest?e.target.closest('.mg-mag'):null;if(!g)return;var i=+g.getAttribute('data-mag');var P=pt(e);drag={i:i,ox:P[0]-mags[i].x,oy:P[1]-mags[i].y};stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
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
      el.querySelectorAll('[data-rot]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.rot;mags[i].ang+=Math.PI/6;rotCount++;snd('tap');if(view==='compass')rotInCompass=true;render();});});
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
