/* ============================================================================
   케이랩 도구 모듈 — 입자/상태변화 (states) v4  [과학 2호 · 물질변화군]
   3학년 물질의 상태 / 4학년 물의 상태변화. KLab.ui 3모드 + 학년칸(헌법 3장).
   ── 학년 칸 (카드 D칸 닻대로) ──
     저(🌱): 고체·액체·기체 구분 — 쥐어져/흘러/퍼져(일상어, 전환용어·정밀온도 회피).
     중(🌿): 물의 상태 변화·양 보존 — 융해·기화·액화, "사라진 게 아니라 상태만 바뀜".
     고(🌳): 입자 모델·녹는점·끓는점 (기존 v3 유지).
   ※ 압력·잠열 마법모먼트 + 만약에(whatif) 모드는 후속 분리(물리군 방침).
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 상태 전환 시각화 — 0℃ 부근(녹는·어는 중)·100℃ 부근(끓는·식는 중)에서
        입자가 한꺼번에 안 바뀌고 비율로 섞이며 전환. 끓을 땐 기포처럼 떠오름.
     ▸ 전환 용어 — 데우는 중이면 융해·기화, 식히는 중이면 응고·액화로 표시.
     ▸ 탐구 미션 3종 — 🧊 얼음·💧 물·☁️ 수증기 만들기. 달성하면 ✓.
   변수 → 현상 → 발견:
     온도 슬라이더(가열🔥/냉각❄️) → 입자 운동·배열 → "상태는 눈에 안 보이는
     입자의 배열·운동 차이" (물 기준 0℃·100℃ 경계).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 미션 = 고체→융해→기체→액화 한 사이클.
     퀴즈 = 움직이는 입자 장면을 보고 상태·전환 용어 답하기 (장면이 곧 문제).
   - config: { temp(기본25), count(기본28), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('states', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var temp=(config.temp!=null)?config.temp:25, N=config.count||28;
    var lastDir=1;                 // +1 데우는 중 / -1 식히는 중 (전환 용어용)
    var BX=250, BY=95, BW=470, BH=300;           // 비커 내부 영역
    var raf=null, t0=Date.now();
    var C={ink:'#1B3A57',sub:'#5a7894',good:'#12B886',cold:'#1971C2',hot:'#E8590C'};
    var btn='font-size:23px;padding:12px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function clamp(v,a,b){return Math.max(a,Math.min(v,b));}

    // ── 물리: 온도 → 자유도(고체→액체)·기화비율(액체→기체)·속도
    function liqFrac(t){ if(t<=-3)return 0; if(t>=3)return 1; return (t+3)/6; }      // 0℃ 부근 녹음
    function gasFrac(t){ if(t<=97)return 0; if(t>=103)return 1; return (t-97)/6; }   // 100℃ 부근 끓음
    function speed(t){return 0.22+(clamp(t,-20,120)+20)/140*3.3;}
    function phase(t){ if(t<-3)return 'solid'; if(t<3)return 'melt'; if(t<97)return 'liquid'; if(t<103)return 'boil'; return 'gas'; }

    // 입자 초기화 (격자 평형 위치 + 전환 임계값)
    var cols=7, rows=Math.ceil(N/cols), gx=BW/(cols+1), gy=Math.min(40,BH/(rows+1)), ps=[];
    for(var i=0;i<N;i++){var c=i%cols, r=Math.floor(i/cols);
      var ex=BX+gx*(c+1), ey=BY+BH-gy*(r+1)-10;
      ps.push({eqx:ex,eqy:ey,x:ex,y:ey,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,
               ph:Math.random()*6.28, thr:Math.random(), thrG:Math.random(), el:null});}

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'🧊 <b style="color:#7048E8;">0℃보다 낮게</b> 식혀서 얼음(고체)을 만들어 봐요!',
        check:function(p){ return p==='solid'; } },
      { text:'💧 다시 데워서 <b style="color:#7048E8;">물(액체)</b>로 만들어 봐요 — 녹는 것이 융해!',
        check:function(p){ return p==='liquid' && lastDir>=0; } },
      { text:'☁️ <b style="color:#7048E8;">100℃ 넘게</b> 끓여서 수증기(기체)를 만들어 봐요!',
        check:function(p){ return p==='gas'; } },
      { text:'❄️ 살살 식혀서 <b style="color:#7048E8;">100℃ 부근 \'액화(식는 중)\'</b> 순간을 잡아 봐요!',
        check:function(p){ return p==='boil' && lastDir<0; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=3가지 상태 구분(쥐어져/흘러/퍼져, 일상어) / 중=물의 상태 변화·양 보존 / 고=입자 모델·녹는점·끓는점(기존 유지).
       ※ 압력·잠열 마법모먼트 + 만약에 모드는 후속 분리(물리군 방침). */
    var LOW_MISSIONS=[
      { text:'❄️ <b style="color:#7048E8;">식혀서</b> 꽁꽁 언 <b style="color:#7048E8;">얼음(고체)</b>을 만들어 봐요 — 단단해서 쥐어져요!',
        check:function(p){ return p==='solid'; } },
      { text:'🔥 <b style="color:#7048E8;">데워서</b> <b style="color:#7048E8;">물(액체)</b>로 만들어 봐요 — 줄줄 흘러요!',
        check:function(p){ return p==='liquid'; } },
      { text:'🔥 더 뜨겁게 <b style="color:#7048E8;">끓여서</b> <b style="color:#7048E8;">수증기(기체)</b>를 만들어 봐요 — 사방으로 퍼져요!',
        check:function(p){ return p==='gas'; } }
    ];
    var MID_MISSIONS=[
      { text:'🧊 <b style="color:#7048E8;">0℃보다 낮게</b> 식혀 얼음(고체)을 만들어요. 물이 사라진 게 아니라 <b style="color:#7048E8;">상태만</b> 바뀐 거예요!',
        check:function(p){ return p==='solid'; } },
      { text:'💧 데워서 <b style="color:#7048E8;">물(액체)</b>로 — 얼음이 녹는 변화 = <b style="color:#7048E8;">융해</b>!',
        check:function(p){ return p==='liquid' && lastDir>=0; } },
      { text:'☁️ <b style="color:#7048E8;">100℃ 넘게</b> 끓여 수증기(기체)로 — 물이 사라진 게 아니라 <b style="color:#7048E8;">눈에 안 보이는 입자</b>로 흩어진 거예요!',
        check:function(p){ return p==='gas'; } },
      { text:'❄️ 살살 식혀 <b style="color:#7048E8;">100℃ 부근 \'액화\'</b> 순간을 잡아 봐요 — 수증기가 다시 물로!',
        check:function(p){ return p==='boil' && lastDir<0; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],        missions:LOW_MISSIONS },
      mid:  { modes:['free','mission','quiz'], missions:MID_MISSIONS },
      high: { modes:['free','mission','quiz'], missions:MISSIONS }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; lastDir=1; temp=25; buildUI();
    }});

    var mStep=0,mDone=false,mLock=false;
    function checkMission(p){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check(p)){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1)mStep++; else mDone=true;
          var bar=el.querySelector('.kl-mission'); if(bar&&!mDone){ var t=bar.querySelector('.kl-mission-text'); if(t)t.innerHTML=M[mStep].text; var n=bar.querySelector('span'); if(n)n.textContent='미션 '+(mStep+1)+'/'+M.length; }
          if(mDone)buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (입자 장면이 곧 문제) ───────────── */
    var QUIZ=[
      { temp:-15, q:'입자가 제자리에서 진동만 하는 지금 상태는?', ch:['고체','액체','기체'], a:0 },
      { temp:50,  q:'입자가 붙은 채 미끄러지듯 움직이는 지금 상태는?', ch:['액체','고체','기체'], a:0 },
      { temp:115, q:'입자가 멀리 흩어져 날아다니는 지금 상태는?', ch:['기체','액체','고체'], a:0 },
      { temp:0,   q:'얼음이 녹아 물이 되는 변화를 무엇이라 할까요?', ch:['융해','응고','기화'], a:0 },
      { temp:100, q:'물이 끓어 수증기가 되는 변화는?', ch:['기화','액화','응고'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      lastDir=1; temp=QUIZ[qIdx].temp;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode), bar='', foot='';
      var ctrl='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
          +'<button class="st-btn" data-act="cool" style="'+btn+'background:#fff;color:'+C.cold+';border-color:'+C.cold+';">❄️ 식히기</button>'
          +'<input class="st-range" type="range" min="-20" max="120" value="'+temp+'" style="width:min(44vw,300px);">'
          +'<button class="st-btn" data-act="heat" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 데우기</button>'
        +'</div>';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); ctrl=''; foot=ui.choices(quizChoices()); }
      el.innerHTML='<style>.st-btn:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 22px !important;}'
        +'.st-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#4DABF7,#FFD43B,#FF6B6B);outline:none;}'
        +'.st-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.st-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;"><div class="st-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="st-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; lastDir=1; temp=25;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      drawStage(); bind(); bands.bind(el); renderStatus(); if(!raf)loop();
    }

    var stage, mercuryEl, partsLayer, bubbleLayer;
    function drawStage(){
      stage=el.querySelector('.st-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML=
         '<radialGradient id="stSol" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1864AB"/></radialGradient>'
        +'<radialGradient id="stLiq" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1C7ED6"/></radialGradient>'
        +'<radialGradient id="stGas" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#E9ECEF"/><stop offset="100%" stop-color="#ADB5BD"/></radialGradient>';
      svg.appendChild(d);
      // 온도계
      var TX=140, TT=70, TB=380;
      svg.appendChild(svgEl('rect',{x:TX-13,y:TT,width:26,height:TB-TT,rx:13,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:24,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      mercuryEl=svgEl('rect',{x:TX-7,y:TT,width:14,height:0,rx:7,fill:'#FA5252'}); svg.appendChild(mercuryEl);
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:15,fill:'#FA5252'}));
      [[0,'0℃ 어는점','#1971C2'],[100,'100℃ 끓는점','#E8590C']].forEach(function(m){var yy=TB-((m[0]+20)/140)*(TB-TT);
        svg.appendChild(svgEl('line',{x1:TX-16,y1:yy,x2:TX+30,y2:yy,stroke:m[2],'stroke-width':2.5,'stroke-dasharray':'5 4'}));
        var tx=svgEl('text',{x:TX+34,y:yy+6,'font-family':'Jua,sans-serif','font-size':16,fill:m[2],'font-weight':800});tx.textContent=m[1];svg.appendChild(tx);});
      mercuryEl._tt=TT; mercuryEl._tb=TB;
      // 비커
      svg.appendChild(svgEl('path',{d:'M '+(BX-14)+' '+(BY-8)+' L '+(BX-14)+' '+(BY+BH+16)+' Q '+(BX-14)+' '+(BY+BH+30)+' '+BX+' '+(BY+BH+30)+' L '+(BX+BW)+' '+(BY+BH+30)+' Q '+(BX+BW+14)+' '+(BY+BH+30)+' '+(BX+BW+14)+' '+(BY+BH+16)+' L '+(BX+BW+14)+' '+(BY-8),fill:'rgba(214,234,248,0.4)',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      bubbleLayer=svgEl('g',{}); svg.appendChild(bubbleLayer);
      partsLayer=svgEl('g',{}); svg.appendChild(partsLayer);
      ps.forEach(function(p){p.el=svgEl('circle',{cx:p.x,cy:p.y,r:12,fill:'url(#stLiq)',stroke:'#1864AB','stroke-width':1.5}); partsLayer.appendChild(p.el);});
      stage.appendChild(svg);
    }

    function loop(){ update(); raf=requestAnimationFrame(loop); }
    function update(){
      var lf=liqFrac(temp), gf=gasFrac(temp), sp=speed(temp), now=(Date.now()-t0)/300;
      var amp=2.0+Math.max(0,(temp+20))/140*2.0;     // 격자 진동 폭(온도↑ 조금 커짐)
      for(var i=0;i<ps.length;i++){var p=ps[i];
        var free=(lf>p.thr), gas=(gf>p.thrG);
        if(!free){ // 고체 — 격자 진동
          p.x=p.eqx+Math.sin(now+p.ph)*amp; p.y=p.eqy+Math.cos(now*1.1+p.ph)*amp;
          p.vx=(Math.random()-0.5)*2; p.vy=(Math.random()-0.5)*2;
        } else {   // 액체/기체 — 자유 운동
          p.x+=p.vx*sp; p.y+=p.vy*sp;
          var top=gas?(BY+6):(BY+BH*0.34);
          if(p.x<BX+12){p.x=BX+12;p.vx=Math.abs(p.vx);} if(p.x>BX+BW-12){p.x=BX+BW-12;p.vx=-Math.abs(p.vx);}
          if(p.y<top){p.y=top;p.vy=Math.abs(p.vy);} if(p.y>BY+BH-12){p.y=BY+BH-12;p.vy=-Math.abs(p.vy);}
          if(gas){ p.vy-=0.05; if(p.vy<-2.6)p.vy=-2.6; }   // 기체 부력(위로)
          else { p.vy+=0.045; }                            // 액체 약한 중력(아래 고임)
        }
        if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));
          p.el.setAttribute('fill', gas?'url(#stGas)':(free?'url(#stLiq)':'url(#stSol)'));}
      }
      // 끓는 중 기포 (바닥에서 솟는 작은 거품)
      if(bubbleLayer){ bubbleLayer.innerHTML='';
        if(phase(temp)==='boil'||phase(temp)==='gas'){
          var nb=phase(temp)==='gas'?5:3;
          for(var b=0;b<nb;b++){var tt=((now*0.6+b*1.7)%1);
            var bx=BX+60+((b*137)%(BW-120)), by=BY+BH-10-tt*(BH-40), rr=4+tt*5;
            bubbleLayer.appendChild(svgEl('circle',{cx:bx,cy:by,r:rr,fill:'none',stroke:'#A5D8FF','stroke-width':2,'stroke-opacity':(1-tt)*0.8}));}
        }
      }
      if(mercuryEl){var f=(clamp(temp,-20,120)+20)/140, h=(mercuryEl._tb-mercuryEl._tt)*f;
        mercuryEl.setAttribute('y',(mercuryEl._tb-h).toFixed(1)); mercuryEl.setAttribute('height',h.toFixed(1));}
    }

    function renderStatus(){
      var p=phase(temp), s=el.querySelector('.st-status'), nm,col,sub;
      if(mode==='quiz'){ if(s)s.innerHTML='<div style="font-size:19px;color:'+C.sub+';">움직이는 입자를 잘 보고 답을 골라요!</div>'; return; }
      if(grade==='low'){
        if(p==='solid'){nm='고체 (얼음)';col=C.cold;sub='꽁꽁 얼어서 단단해요 — 손으로 쥘 수 있고 모양이 변하지 않아요.';}
        else if(p==='melt'){nm='고체에서 액체로';col=C.cold;sub='얼음이 녹아 물이 되는 중이에요.';}
        else if(p==='liquid'){nm='액체 (물)';col='#1C7ED6';sub='줄줄 흘러요 — 담는 그릇 모양대로 바뀌어요.';}
        else if(p==='boil'){nm='액체에서 기체로';col=C.hot;sub='물이 끓어서 수증기가 되는 중이에요.';}
        else{nm='기체 (수증기)';col='#868E96';sub='사방으로 퍼져 날아다녀요 — 공간을 가득 채워요.';}
        if(s)s.innerHTML='<div style="font-size:29px;color:'+col+';">'+nm+'</div>'
          +'<div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>';
        checkMission(p); return;
      }
      if(p==='solid'){nm='고체 (얼음)';col=C.cold;sub='입자가 제자리에서 규칙적으로 정렬해 진동만 해요. 모양도 부피도 일정해요.';}
      else if(p==='melt'){
        if(lastDir>=0){nm='융해 — 녹는 중';sub='0℃ 부근에서 얼음(고체) 입자가 하나둘 풀려나 물(액체)이 돼요. 고체와 액체가 섞여 있어요.';}
        else{nm='응고 — 어는 중';sub='0℃ 부근에서 물(액체) 입자가 하나둘 제자리를 잡아 얼음(고체)이 돼요.';}
        col=C.cold;
      }
      else if(p==='liquid'){nm='액체 (물)';col='#1C7ED6';sub='입자가 서로 붙어 있지만 자유롭게 미끄러져요. 부피는 그대로, 모양은 그릇에 따라 변해요.';}
      else if(p==='boil'){
        if(lastDir>=0){nm='기화 — 끓는 중';sub='100℃ 부근에서 물(액체) 입자가 빠르게 튀어 올라 수증기(기체)가 돼요. 거품이 올라와요.';}
        else{nm='액화 — 식는 중';sub='100℃ 부근에서 수증기(기체) 입자가 다시 모여 물(액체)이 돼요.';}
        col=C.hot;
      }
      else{nm='기체 (수증기)';col='#868E96';sub='입자가 멀리 흩어져 빠르게 날아다녀요. 공간을 가득 채워요.';}
      s.innerHTML='<div style="font-size:29px;color:'+col+';">'+temp+'℃ — '+nm+'</div>'
        +'<div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>';
      checkMission(p);
    }

    function setTemp(v){ var prev=temp; temp=clamp(Math.round(v),-20,120);
      if(temp>prev)lastDir=1; else if(temp<prev)lastDir=-1;
      var r=el.querySelector('.st-range'); if(r&&+r.value!==temp)r.value=temp; renderStatus(); checkMission(phase(temp)); }

    function bind(){
      var rg=el.querySelector('.st-range');
      if(rg)rg.addEventListener('input',function(e){setTemp(+e.target.value);});
      var hb=el.querySelector('[data-act="heat"]'), cb=el.querySelector('[data-act="cool"]');
      if(hb)hb.addEventListener('click',function(){setTemp(temp+15);});
      if(cb)cb.addEventListener('click',function(){setTemp(temp-15);});
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
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
