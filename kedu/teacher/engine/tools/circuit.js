/* ============================================================================
   케이랩 도구 모듈 — 전기 회로 (circuit) v5  [과학 1호 · 직렬/병렬 + 전지 방향 + 3모드]
   v4 추가 (준호 "남은 자세한 컨트롤까지"):
     ▸ [직렬]/[병렬] 작업판 토글 — 병렬 가지에 전구를 독립으로.
     ▸ 전지 방향(극): '전지' 도구로 전지를 탭하면 ＋－ 방향이 바뀜.
        직렬에서 전지를 거꾸로 섞으면 상쇄(netB)되어 약해지거나 꺼짐.
   v5: KLab.ui 3모드(자유탐구/미션4/퀴즈5) 증축 — 퀴즈는 켜진 회로를 보고 예측형.
   v3 자유 배치(팔레트로 놓기/빼기, 스위치 여닫기) 유지. config.circ='parallel'로 병렬 진입.
   물리:
     직렬: netB=|Σ전지방향|, 전구≥1, 열린 스위치 없음 → 흐름. 밝기 netB/전구수. 전구0=합선.
     병렬: 본선 전지·스위치 → 흐르면 각 가지 전구 독립 점등(밝기 netB). 가지 전구0=합선.
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wire:'#7C93AD',wireOn:'#FF9500',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',warn:'#E03131'};
  var TOOLS=[{k:'battery',l:'🔋 전지'},{k:'bulb',l:'💡 전구'},{k:'switch',l:'⏻ 스위치'},{k:'erase',l:'✖ 지우기'}];

  window.KLab.register('circuit', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var circ=(config.mode==='parallel'||config.circ==='parallel')?'parallel':'series';
    function defS(){return [{t:'battery',dir:1},{t:'wire'},{t:'bulb'},{t:'wire'},{t:'switch',open:false},{t:'wire'},{t:'bulb'},{t:'wire'}];}
    function defP(){return [{t:'battery',dir:1},{t:'switch',open:false},{t:'bulb'},{t:'bulb'},{t:'wire'}];} // 0본선전지,1본선스위치,2~4가지
    var sSlots=defS(), pSlots=defP(), tool='bulb';

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=470, lft=130,rgt=770,top=140,bot=360, midx=(lft+rgt)/2, midy=(top+bot)/2;
    var SSLOT=[[midx-185,top],[midx,top],[midx+185,top],[rgt,midy],[midx+185,bot],[midx,bot],[midx-185,bot],[lft,midy]];
    function pslot(i){ if(i===0)return [lft,midy-52]; if(i===1)return [lft,midy+52];
      var n=pSlots.length-2, k=i-2; return [lft+180+(rgt-lft-220)*(n<=1?0.5:k/(n-1)), midy]; }
    var btn='font-size:21px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function slots(){return circ==='series'?sSlots:pSlots;}
    // ── 해석
    function calc(){
      if(circ==='series'){
        var net=0,L=0,openSw=false;
        sSlots.forEach(function(s){if(s.t==='battery')net+=(s.dir||1);else if(s.t==='bulb')L++;else if(s.t==='switch'&&s.open)openSw=true;});
        net=Math.abs(net);
        var flow=net>=1&&L>=1&&!openSw;
        return {net:net,L:L,openSw:openSw,flow:flow,short:net>=1&&L===0&&!openSw,bright:flow?net/L:0};
      } else {
        var net=0,openSw=false,bb=0;
        if(pSlots[0].t==='battery')net+=(pSlots[0].dir||1);
        if(pSlots[1].t==='switch'&&pSlots[1].open)openSw=true;
        if(pSlots[0].t==='switch'&&pSlots[0].open)openSw=true;   // 본선 어느 자리든 스위치 열림
        if(pSlots[1].t==='battery')net+=(pSlots[1].dir||1);
        net=Math.abs(net);
        for(var i=2;i<pSlots.length;i++)if(pSlots[i].t==='bulb')bb++;
        var mainFlow=net>=1&&!openSw;
        return {net:net,openSw:openSw,mainFlow:mainFlow,bb:bb,bright:mainFlow?net:0,short:net>=1&&!openSw&&bb===0};
      }
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { circ:'series', text:'🔋 <b style="color:#7048E8;">전지를 한 개 더</b> 놓아 전구를 더 밝게 만들어 봐요!',
        check:function(r){ return circ==='series' && r.flow && r.net>=2; } },
      { circ:'series', text:'전지 하나를 <b style="color:#7048E8;">거꾸로(＋－ 바꾸기)</b> 끼우면 어떻게 되는지 봐요!',
        check:function(r){ if(circ!=='series')return false; var nb=0; sSlots.forEach(function(s){if(s.t==='battery')nb++;}); return nb>=2 && r.net===0; } },
      { circ:'parallel', text:'🔀 병렬 — <b style="color:#7048E8;">세 가지 모두 전구</b>를 놓아 다 켜 봐요!',
        check:function(r){ return circ==='parallel' && r.mainFlow && r.bb>=3; } },
      { circ:'parallel', text:'✖ 가지 전구 <b style="color:#7048E8;">하나를 빼도</b> 나머지가 켜져 있는지 확인해 봐요!',
        check:function(r){ return circ==='parallel' && r.mainFlow && r.bb===2; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function checkMission(r){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check(r)){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1){
            mStep++;
            if(MISSIONS[mStep].circ!==circ){ circ=MISSIONS[mStep].circ; sSlots=defS(); pSlots=defP(); }
          } else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (켜져 있는 회로를 보고 예측) ───────────── */
    var QUIZ=[
      { circ:'series',   q:'켜져 있는 이 스위치를 열면 어떻게 될까요?', ch:['모든 전구가 꺼져요','전구 하나만 꺼져요','더 밝아져요'], a:0 },
      { circ:'series',   q:'이 직렬 회로에 전구를 더 놓으면 밝기는?', ch:['어두워져요','밝아져요','변화 없어요'], a:0 },
      { circ:'parallel', q:'가지 전구 한 개를 빼면 나머지 전구는?', ch:['그대로 켜져 있어요','모두 꺼져요','더 어두워져요'], a:0 },
      { circ:'series',   q:'전지를 한 개 더 같은 방향으로 놓으면?', ch:['전구가 더 밝아져요','전구가 꺼져요','어두워져요'], a:0 },
      { circ:'series',   q:'전구를 모두 빼고 전지만 한 줄로 이으면?', ch:['합선되어 위험해요','더 밝아져요','아무 일 없어요'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      circ=QUIZ[qIdx].circ; sSlots=defS(); pSlots=defP();
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var pal=TOOLS.map(function(t){return '<button class="cir-tool'+(t.k===tool?' on':'')+'" data-tool="'+t.k+'" style="'+btn+(t.k===tool?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+t.l+'</button>';}).join('');
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', mid='', foot='';
      var circRow='<div style="display:flex;gap:8px;justify-content:center;margin-bottom:7px;">'
          +'<button class="cir-mode'+(circ==='series'?' on':'')+'" data-mode="series" style="'+mbtn+'">직렬</button>'
          +'<button class="cir-mode'+(circ==='parallel'?' on':'')+'" data-mode="parallel" style="'+mbtn+'">병렬</button>'
        +'</div>';
      var palRow='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:5px;">'+pal
          +'<button class="cir-tool" data-tool="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 처음</button></div>';
      var hint='<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">부품을 골라 빈 자리를 탭해 놓아요. \'스위치\'로 탭=여닫기, \'전지\'로 전지 탭=＋－ 방향 바꾸기.</div>';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); mid=palRow+hint; }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else mid=circRow+palRow+hint;
      el.innerHTML='<style>'
        +'.cir-tool:active,.cir-mode:active,.kl-choice:active{transform:translateY(2px);}'
        +'.cir-tool.on{background:#1565C0 !important;color:#fff !important;}.cir-mode.on{background:#7048E8 !important;color:#fff !important;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.cir-hit{cursor:pointer;}@keyframes cirFlow{to{stroke-dashoffset:-30;}}.cir-flow{stroke-dasharray:3 13;stroke-linecap:round;animation:cirFlow .55s linear infinite;}'
        +'</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="cir-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'250':'320')+'px;background:radial-gradient(120% 120% at 50% 30%,#FCFDFF 0%,#EAF1FA 70%,#DCE8F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="cir-status" style="text-align:center;margin-top:9px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; sSlots=defS();pSlots=defP(); tool='bulb';
        if(m==='mission')circ=MISSIONS[0].circ;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      bind(); render();
    }

    function defs(svg){var d=svgEl('defs',{});d.innerHTML=
      '<radialGradient id="cGlassOn" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FFFEF2"/><stop offset="45%" stop-color="#FFE98A"/><stop offset="100%" stop-color="#FFC53D"/></radialGradient>'
     +'<radialGradient id="cGlassOff" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FBFDFF"/><stop offset="100%" stop-color="#C9D7E6"/></radialGradient>'
     +'<radialGradient id="cHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE066" stop-opacity="0.95"/><stop offset="55%" stop-color="#FFD43B" stop-opacity="0.4"/><stop offset="100%" stop-color="#FFD43B" stop-opacity="0"/></radialGradient>'
     +'<linearGradient id="cBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7DEE7"/><stop offset="50%" stop-color="#A9B8C8"/><stop offset="100%" stop-color="#8497AA"/></linearGradient>';
      svg.appendChild(d);}

    function bulb(svg,x,y,br){
      var on=br>0,r=34;
      if(on){var ro=Math.min(0.4+br*0.25,1);for(var a=0;a<360;a+=45){var rad=a*Math.PI/180,r1=r+12,r2=r+12+16*Math.min(br,2);svg.appendChild(svgEl('line',{x1:x+r1*Math.cos(rad),y1:y+r1*Math.sin(rad),x2:x+r2*Math.cos(rad),y2:y+r2*Math.sin(rad),stroke:'#FFD43B','stroke-width':4,'stroke-linecap':'round','stroke-opacity':ro}));}svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r+26+br*9,fill:'url(#cHalo)'}));}
      var by=y+r-5;
      svg.appendChild(svgEl('path',{d:'M '+(x-14)+' '+by+' L '+(x+14)+' '+by+' L '+(x+11)+' '+(by+26)+' L '+(x-11)+' '+(by+26)+' Z',fill:'url(#cBase)',stroke:'#7E909F','stroke-width':1.5}));
      for(var s=0;s<3;s++)svg.appendChild(svgEl('line',{x1:x-13+s,y1:by+6+s*8,x2:x+13-s,y2:by+6+s*8,stroke:'#7E909F','stroke-width':2,'stroke-opacity':0.7}));
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r,fill:on?'url(#cGlassOn)':'url(#cGlassOff)',stroke:on?'#F0A500':'#A9BACB','stroke-width':3}));
      var fil='M '+(x-8)+' '+(by-2)+' L '+(x-8)+' '+(y+2);for(var c=0;c<5;c++){var fx=x-8+c*4;fil+=' Q '+(fx+2)+' '+(y-11)+' '+(fx+4)+' '+(y+2);}fil+=' L '+(x+8)+' '+(by-2);
      svg.appendChild(svgEl('path',{d:fil,fill:'none',stroke:on?'#FF7A00':'#9AB0C5','stroke-width':on?3.5:2.5,'stroke-linecap':'round','stroke-linejoin':'round'}));
      svg.appendChild(svgEl('ellipse',{cx:x-11,cy:y-12,rx:6,ry:10,fill:'#fff','fill-opacity':on?0.55:0.4,transform:'rotate(-25 '+(x-11)+' '+(y-12)+')'}));
    }
    function batteryUnit(svg,x,y,dir){
      dir=dir||1; var w=66,h=42;
      svg.appendChild(svgEl('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:6,fill:'#3A4A5C',stroke:'#15202B','stroke-width':3}));
      var redX=dir>0?(x-w/2):(x+w/2-15);
      svg.appendChild(svgEl('rect',{x:redX,y:y-h/2,width:15,height:h,rx:6,fill:'#C0392B'}));
      svg.appendChild(svgEl('rect',{x:x-w/2,y:y-5,width:w,height:10,fill:'#FFD43B'}));
      var plusX=dir>0?(x+w/2-2):(x-w/2-5);
      svg.appendChild(svgEl('rect',{x:plusX,y:y-9,width:7,height:18,rx:2,fill:'#D7DEE7',stroke:'#8497AA','stroke-width':1}));
      var tx=dir>0?(x+w/2-13):(x-w/2+13);
      var t=svgEl('text',{x:tx,y:y+7,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':20,'font-weight':800,fill:'#fff'});t.textContent='＋';svg.appendChild(t);
    }
    function leverSwitch(svg,x,y,open){
      svg.appendChild(svgEl('rect',{x:x-32,y:y-7,width:64,height:14,rx:7,fill:'#E3EAF2',stroke:'#A9BACB','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x-23,cy:y,r:8,fill:'#C2CEDB',stroke:'#7E909F','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x+23,cy:y,r:8,fill:'#C2CEDB',stroke:'#7E909F','stroke-width':2}));
      var ex=open?x+11:x+23, ey=open?y-28:y;
      svg.appendChild(svgEl('line',{x1:x-23,y1:y,x2:ex,y2:ey,stroke:open?'#7E909F':C.wireOn,'stroke-width':9,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('circle',{cx:x-23,cy:y,r:4,fill:C.ink}));
    }
    function part(svg,s,x,y,br){
      if(s.t==='bulb')bulb(svg,x,y,br);
      else if(s.t==='battery')batteryUnit(svg,x,y,s.dir);
      else if(s.t==='switch')leverSwitch(svg,x,y,s.open);
    }
    function hit(svg,x,y,i){svg.appendChild(svgEl('circle',{cx:x,cy:y,r:46,fill:'transparent',class:'cir-hit','data-slot':i}));}
    function emptyDot(svg,x,y){svg.appendChild(svgEl('circle',{cx:x,cy:y,r:7,fill:'#fff',stroke:'#9AB7D4','stroke-width':2,'stroke-dasharray':'3 3'}));}

    function render(){
      var stage=el.querySelector('.cir-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'}); defs(svg);
      var r=calc();
      if(circ==='series'){
        var flow=r.flow, rr=26;
        var d='M '+(lft+rr)+' '+top+' L '+(rgt-rr)+' '+top+' Q '+rgt+' '+top+' '+rgt+' '+(top+rr)+' L '+rgt+' '+(bot-rr)+' Q '+rgt+' '+bot+' '+(rgt-rr)+' '+bot+' L '+(lft+rr)+' '+bot+' Q '+lft+' '+bot+' '+lft+' '+(bot-rr)+' L '+lft+' '+(top+rr)+' Q '+lft+' '+top+' '+(lft+rr)+' '+top+' Z';
        svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#415062','stroke-width':12,'stroke-opacity':0.16,'stroke-linejoin':'round'}));
        svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:flow?C.wireOn:C.wire,'stroke-width':7,'stroke-linejoin':'round'}));
        if(flow)svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));
        sSlots.forEach(function(s,i){var x=SSLOT[i][0],y=SSLOT[i][1];part(svg,s,x,y,r.bright);});
        sSlots.forEach(function(s,i){var x=SSLOT[i][0],y=SSLOT[i][1];if(s.t==='wire')emptyDot(svg,x,y);hit(svg,x,y,i);});
        if(r.short)svg.appendChild(svgEl('text',{x:midx,y:midy,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':26,'font-weight':800,fill:C.warn})).textContent='⚠ 합선! 전구를 넣어요';
      } else {
        var mf=r.mainFlow;
        // 위·아래 버스
        svg.appendChild(svgEl('line',{x1:lft,y1:top,x2:rgt,y2:top,stroke:mf?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round'}));
        svg.appendChild(svgEl('line',{x1:lft,y1:bot,x2:rgt,y2:bot,stroke:mf?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round'}));
        if(mf){svg.appendChild(svgEl('line',{x1:lft,y1:top,x2:rgt,y2:top,stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));svg.appendChild(svgEl('line',{x1:lft,y1:bot,x2:rgt,y2:bot,stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));}
        // 본선 왼쪽 세로 (전지·스위치 자리)
        svg.appendChild(svgEl('line',{x1:lft,y1:top,x2:lft,y2:bot,stroke:mf?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round'}));
        // 가지 세로선 (각 전구 자리)
        for(var i=2;i<pSlots.length;i++){var px=pslot(i)[0], bon=(pSlots[i].t==='bulb'&&mf);
          svg.appendChild(svgEl('line',{x1:px,y1:top,x2:px,y2:bot,stroke:bon?C.wireOn:C.wire,'stroke-width':6,'stroke-linecap':'round'}));
          if(bon)svg.appendChild(svgEl('line',{x1:px,y1:top,x2:px,y2:bot,stroke:'#FFF7E0','stroke-width':4,class:'cir-flow'}));
        }
        // 부품
        pSlots.forEach(function(s,i){var p=pslot(i);part(svg,s,p[0],p[1],r.bright);});
        pSlots.forEach(function(s,i){var p=pslot(i);if(s.t==='wire')emptyDot(svg,p[0],p[1]);hit(svg,p[0],p[1],i);});
        if(r.short)svg.appendChild(svgEl('text',{x:midx+120,y:midy,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:C.warn})).textContent='⚠ 가지에 전구를 넣어요';
      }
      stage.appendChild(svg);
      renderStatus(r);
      checkMission(r);
    }
    function renderStatus(r){
      var s=el.querySelector('.cir-status'), msg, sub;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;color:'+C.sub+';">그림 속 회로를 보고 답을 골라요!</div>'; return; }
      if(circ==='series'){
        if(r.short){msg='합선됐어요';sub='전구 없이 전지만 이으면 위험해요.';}
        else if(r.net===0){msg='전류가 안 흘러요';sub='전지를 놓거나, 거꾸로 끼운 전지의 방향을 맞춰 보세요.';}
        else if(r.openSw){msg='스위치가 열렸어요';sub='직렬은 한 줄이라 스위치 하나만 열려도 전부 꺼져요.';}
        else if(r.L===0){msg='전구가 없어요';sub='전구를 놓아 보세요.';}
        else{msg='<span style="color:'+C.good+';">불이 들어왔어요 ✨</span>';sub='직렬 — 전지 '+r.net+'칸·전구 '+r.L+'개. 전지가 많으면 밝고, 전구가 많으면 나눠 써서 어두워요.';}
      } else {
        if(r.short){msg='합선됐어요';sub='가지에 전구를 넣어요.';}
        else if(r.net===0){msg='전류가 안 흘러요';sub='본선에 전지를 놓거나 방향을 맞춰 보세요.';}
        else if(r.openSw){msg='본선 스위치가 열렸어요';sub='본선이 끊기면 모든 가지가 함께 꺼져요.';}
        else if(r.bb===0){msg='가지에 전구가 없어요';sub='가지 자리에 전구를 놓아 보세요.';}
        else{msg='<span style="color:'+C.good+';">가지마다 따로 켜짐 ✨</span>';sub='병렬 — 가지가 독립이라 한 가지 전구를 빼도 나머지는 그대로 켜지고, 전구가 많아도 밝기가 유지돼요.';}
      }
      if(msg.indexOf('span')<0)msg='<span style="color:'+(r.short?C.warn:C.sub)+';">'+msg+'</span>';
      s.innerHTML='<div style="font-size:25px;">'+msg+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:5px;line-height:1.4;">'+sub+'</div>';
    }

    function bind(){
      el.querySelectorAll('.cir-mode').forEach(function(b){b.addEventListener('click',function(){if(circ!==b.dataset.mode){circ=b.dataset.mode;buildUI();}});});
      el.querySelectorAll('.cir-tool').forEach(function(b){b.addEventListener('click',function(){
        var k=b.dataset.tool;
        if(k==='reset'){sSlots=defS();pSlots=defP();tool='bulb';buildUI();return;}
        tool=k; el.querySelectorAll('.cir-tool').forEach(function(x){x.classList.toggle('on',x.dataset.tool===tool);});
      });});
      el.querySelector('.cir-stage').addEventListener('click',function(e){
        if(mode==='quiz')return;
        var h=e.target.closest?e.target.closest('.cir-hit'):null; if(!h)return;
        var i=+h.getAttribute('data-slot'), arr=slots(), s=arr[i];
        if(tool==='erase') {s.t='wire'; delete s.open; delete s.dir;}
        else if(tool==='switch'){ if(s.t==='switch') s.open=!s.open; else {s.t='switch';s.open=false;} }
        else if(tool==='battery'){ if(s.t==='battery') s.dir=(s.dir||1)*-1; else {s.t='battery';s.dir=1;} }
        else { s.t='bulb'; }
        render();
      });
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
    buildUI();
    return function cleanup(){};
  });
})();
