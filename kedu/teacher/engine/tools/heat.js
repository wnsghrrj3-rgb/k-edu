/* ============================================================================
   케이랩 도구 모듈 — 열의 이동 (heat) v2  [과학 6호 · 물리현상군]
   5학년 온도와 열. KLab.ui 3모드(자유탐구/미션/퀴즈) + 학년칸(헌법 3장).
   ── 학년 칸 (카드 D칸 닻대로) ──
     저(🌱): 따뜻함이 옮아간다 — 전도만, 일상어("따뜻함이 옆으로 번져요").
     중(🌿): 고체 전도(차례차례) — 재질 비교(구리>철>유리), 전도만.
     고(🌳): 액체·기체 대류(위/아래) — 전도+대류 전부, 마법모먼트(위/아래 가열).
   실험 3종 (변수 → 현상 → 발견):
     ▸ 🥄 고체(전도) — 구리·철·유리 막대 한쪽 끝 가열 → 열이 이웃으로 차례로
        퍼지는 빠르기 차이. 끝의 버터가 떨어지는 순서로 비교 (구리>철≫유리).
     ▸ 💧 액체(대류) — 비커 물을 [아래/위]에서 가열. 아래 가열=뜨거운 물이
        올라가 빙글빙글 돌며 전체가 데워짐 / 위 가열=아래는 차가운 채 남음(발견).
     ▸ 🌬️ 기체(대류) — 방 단면. 난로(바닥)·에어컨(천장) 토글 → 따뜻한 공기는
        위로·차가운 공기는 아래로. "난로는 아래, 에어컨은 위" 까닭 발견.
   미션 4종 + 퀴즈 5문(랜덤 출제, 선택지).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", exp:"conduct"|"liquid"|"gas" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('heat', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var exp  = (['conduct','liquid','gas'].indexOf(config.exp) >= 0) ? config.exp : 'conduct';
    var raf = null, t0 = Date.now();
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', cold:'#1971C2', hot:'#E8590C', vio:'#7048E8' };
    var btn = 'font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function clamp(v,a,b){ return Math.max(a,Math.min(v,b)); }
    function heatColor(t){ // 0(차가움 파랑) → 1(뜨거움 빨강)
      t=clamp(t,0,1);
      var c1=[25,113,194], c2=[250,82,82], m=[];
      for(var i=0;i<3;i++)m.push(Math.round(c1[i]+(c2[i]-c1[i])*t));
      return 'rgb('+m.join(',')+')';
    }

    /* ──────────────────────────── ① 전도 (고체) ──────────────────────────── */
    var RODS = [
      { name:'구리', base:'#C77B3F', k:1.0  },
      { name:'철',   base:'#868E96', k:0.42 },
      { name:'유리', base:'#9FC6E8', k:0.05 }
    ];
    var cd; // 전도 상태
    function cdReset(){ cd={ heating:false, hf:[0,0,0], drop:[0,0,0], order:[] }; } // hf=열 도달 비율 0~1, drop=버터 낙하 진행
    cdReset();
    var ROD_X=300, ROD_W=420, ROD_H=26, ROD_Y=[140,240,340];

    /* ──────────────────────── ②③ 대류 (액체/기체 공통 입자) ─────────────────── */
    function makeConv(box, n){
      var ps=[];
      for(var i=0;i<n;i++)ps.push({
        x:box.x+10+Math.random()*(box.w-20), y:box.y+10+Math.random()*(box.h-20),
        vx:0, vy:0, t:0.12, el:null });
      return ps;
    }
    // 대류 셀 유동장(교과서형): 열원 기둥에서 위로 → 위에서 옆으로 → 벽에서 아래로 → 바닥에서 열원 쪽으로.
    // 냉원(에어컨)은 반대 방향(cell=-1). cell=0이면 유동 없음(위 가열=층 형성).
    function stepConv(ps, box, sources){
      var i,j,p,A=1.5;
      for(i=0;i<ps.length;i++){ p=ps[i];
        var vx=0, vy=0;
        for(j=0;j<sources.length;j++){ var s=sources[j]; if(!s.on||!s.cell)continue;
          var xi=(p.x-box.x)/box.w, eta=(p.y-box.y)/box.h, xc=(s.x-box.x)/box.w;
          var d=xi-xc, sc=(d>=0)?Math.max(1-xc,0.18):Math.max(xc,0.18);
          var a=Math.PI*d/sc;                            // 벽이 정확히 ±π(하강 기둥)가 되도록
          vy += -s.cell*A*Math.cos(a)*Math.sin(Math.PI*eta);
          vx +=  s.cell*A*0.8*Math.sin(a)*Math.cos(Math.PI*eta);
        }
        p.x += vx + (Math.random()-0.5)*0.6;
        p.y += vy + (Math.random()-0.5)*0.6;
        if(p.x<box.x+8)p.x=box.x+8; if(p.x>box.x+box.w-8)p.x=box.x+box.w-8;
        if(p.y<box.y+8)p.y=box.y+8; if(p.y>box.y+box.h-8)p.y=box.y+box.h-8;
        for(j=0;j<sources.length;j++){ var q=sources[j]; if(!q.on)continue;
          var dx=p.x-q.x, dy=p.y-q.y;
          if(dx*dx+dy*dy < q.r*q.r) p.t=clamp(p.t+q.dT,0,1);
        }
        p.t += (0.12-p.t)*0.0015;                        // 천천히 주변 온도(상온)로
      }
    }
    function regionTemp(ps, box, top){ // top=true 위쪽 1/3, false 아래쪽 1/3
      var sum=0, n=0, lim=top?(box.y+box.h/3):(box.y+box.h*2/3);
      for(var i=0;i<ps.length;i++){ var p=ps[i];
        if(top?(p.y<lim):(p.y>lim)){ sum+=p.t; n++; } }
      return n?sum/n:0.12;
    }
    function degC(t){ return Math.round(10+t*70); }      // 표시용 ℃ (10~80)

    var LQ_BOX={x:250,y:110,w:430,h:290};
    var lq; function lqReset(){ lq={ pos:'off', ps:makeConv(LQ_BOX,44) }; } lqReset();
    var GS_BOX={x:170,y:80,w:580,h:330};
    var gs; function gsReset(){ gs={ heater:false, ac:false, ps:makeConv(GS_BOX,50) }; } gsReset();

    /* ─────────────────────────────── 미션 ─────────────────────────────── */
    var MISSIONS=[
      { exp:'conduct', text:'🥄 <b style="color:#7048E8;">가열</b>해서 <b style="color:#7048E8;">구리 막대의 버터</b>를 가장 먼저 떨어뜨려 봐요!',
        check:function(){ return exp==='conduct' && cd.order.length>0 && cd.order[0]===0; } },
      { exp:'liquid', text:'💧 비커 <b style="color:#7048E8;">아래</b>에서 가열해 <b style="color:#7048E8;">위쪽 물까지</b> 따뜻하게(50℃↑) 만들어 봐요!',
        check:function(){ return exp==='liquid' && lq.pos==='bottom' && degC(regionTemp(lq.ps,LQ_BOX,true))>=50; } },
      { exp:'liquid', text:'🧊 이번엔 <b style="color:#7048E8;">위</b>에서 가열해 봐요. 위는 뜨거운데 <b style="color:#7048E8;">아래 물은 차가운 채</b>로 남는 걸 확인!',
        check:function(){ return exp==='liquid' && lq.pos==='top' && degC(regionTemp(lq.ps,LQ_BOX,true))>=45 && degC(regionTemp(lq.ps,LQ_BOX,false))<=28; } },
      { exp:'gas', text:'🌬️ <b style="color:#7048E8;">난로</b>를 켜서 따뜻한 공기가 <b style="color:#7048E8;">천장</b>에 모이는 걸 확인해 봐요! (천장 45℃↑)',
        check:function(){ return exp==='gas' && gs.heater && degC(regionTemp(gs.ps,GS_BOX,true))>=45; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=따뜻함이 옮아간다(전도만, 일상어) / 중=고체 전도·재질 비교 / 고=액체·기체 대류(위·아래). */
    var LOW_MISSIONS=[
      { exp:'conduct', text:'🔥 <b style="color:#7048E8;">가열 시작</b>을 눌러 막대가 따뜻해지는 걸 봐요 — 따뜻함이 옆으로 <b style="color:#7048E8;">번져요</b>!',
        check:function(){ return exp==='conduct' && cd.heating && Math.max.apply(null,cd.hf)>0.25; } },
      { exp:'conduct', text:'조금 기다리면 막대 끝 <b style="color:#7048E8;">버터가 떨어져요</b> — 따뜻함이 끝까지 옮아간 거예요!',
        check:function(){ return exp==='conduct' && cd.order.length>=1; } }
    ];
    var MID_MISSIONS=[
      { exp:'conduct', text:'🥄 <b style="color:#7048E8;">가열</b>해서 <b style="color:#7048E8;">구리 막대의 버터</b>를 가장 먼저 떨어뜨려 봐요!',
        check:function(){ return exp==='conduct' && cd.order.length>0 && cd.order[0]===0; } },
      { exp:'conduct', text:'셋 다 떨어뜨려 순서를 확인! <b style="color:#7048E8;">구리 → 철 → 유리</b> — 재질마다 열 전달 빠르기가 달라요.',
        check:function(){ return exp==='conduct' && cd.order.length===3; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],        missions:LOW_MISSIONS, exps:['conduct'] },
      mid:  { modes:['free','mission','quiz'], missions:MID_MISSIONS, exps:['conduct'] },
      high: { modes:['free','mission','quiz'], missions:MISSIONS,     exps:['conduct','liquid','gas'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].missions; }
    function curExps(){ return GRADES[grade].exps; }
    if(curExps().indexOf(exp)<0)exp=curExps()[0];
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false;
      cdReset(); lqReset(); gsReset(); exp=curExps()[0]; build();
    }});

    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1){ mStep++; exp=M[mStep].exp; cdReset(); lqReset(); gsReset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ─────────────────────────────── 퀴즈 ─────────────────────────────── */
    var QUIZ=[
      { pic:'conduct', q:'열은 온도가 어떤 곳에서 어떤 곳으로 이동할까요?',
        ch:['높은 곳 → 낮은 곳','낮은 곳 → 높은 곳','이동하지 않아요'], a:0 },
      { pic:'conduct', q:'고체에서 열이 이웃한 부분으로 차례차례 전달되는 것을 무엇이라고 할까요?',
        ch:['전도','대류','단열'], a:0 },
      { pic:'conduct', q:'구리·철·유리 중 열이 가장 빨리 전달되는 것은?',
        ch:['구리','철','유리'], a:0 },
      { pic:'liquid', q:'물을 끓일 때 아래만 데워도 전체가 뜨거워지는 까닭은?',
        ch:['뜨거운 물이 위로 올라가며 돌아서','물이 열을 전도로만 전해서','열이 아래로만 가서'], a:0 },
      { pic:'gas', q:'에어컨을 방 위쪽에 다는 까닭은?',
        ch:['차가운 공기는 아래로 내려와서','차가운 공기는 위로 올라가서','전기를 아껴서'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    /* ─────────────────────────────── UI ─────────────────────────────── */
    function expTabs(){
      var EXPS=curExps(); if(EXPS.length<=1)return '<div style="height:2px;"></div>';
      var LAB={conduct:'🥄 고체 — 전도', liquid:'💧 액체 — 대류', gas:'🌬️ 기체 — 대류'};
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + EXPS.map(function(e){ var on=(exp===e);
            return '<button class="ht-exp" data-e="'+e+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.hot+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.hot:'#fff')+';color:'+(on?'#fff':C.hot)+';">'+LAB[e]+'</button>'; }).join('')
        + '</div>';
    }
    function ctrlRow(){
      if(exp==='conduct'){
        return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="ht-btn" data-act="cdHeat" style="'+btn+(cd.heating?'background:'+C.hot+';color:#fff;border-color:'+C.hot:'background:#fff;color:'+C.hot+';border-color:'+C.hot)+';">'+(cd.heating?'⏹ 가열 멈추기':'🔥 가열 시작')+'</button>'
          +'<button class="ht-btn" data-act="cdReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 처음부터</button></div>';
      }
      if(exp==='liquid'){
        function b(act,lab,on){ return '<button class="ht-btn" data-act="'+act+'" style="'+btn+(on?'background:'+C.hot+';color:#fff;border-color:'+C.hot:'background:#fff;color:'+C.hot+';border-color:'+C.hot)+';">'+lab+'</button>'; }
        return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          + b('lqBottom','🔥 아래에서 가열',lq.pos==='bottom') + b('lqTop','🔥 위에서 가열',lq.pos==='top')
          +'<button class="ht-btn" data-act="lqOff" style="'+btn+(lq.pos==='off'?'background:#666;color:#fff;border-color:#666':'background:#fff;color:#666;border-color:#9aa')+';">⏹ 끄기</button>'
          +'<button class="ht-btn" data-act="lqReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 물</button></div>';
      }
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        +'<button class="ht-btn" data-act="gsHeater" style="'+btn+(gs.heater?'background:'+C.hot+';color:#fff;border-color:'+C.hot:'background:#fff;color:'+C.hot+';border-color:'+C.hot)+';">🔥 난로 (바닥) '+(gs.heater?'켜짐':'꺼짐')+'</button>'
        +'<button class="ht-btn" data-act="gsAc" style="'+btn+(gs.ac?'background:'+C.cold+';color:#fff;border-color:'+C.cold:'background:#fff;color:'+C.cold+';border-color:'+C.cold)+';">❄️ 에어컨 (천장) '+(gs.ac?'켜짐':'꺼짐')+'</button>'
        +'<button class="ht-btn" data-act="gsReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 공기</button></div>';
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode), bar='', body='', foot='';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=expTabs()+ctrlRow();
      el.innerHTML='<style>.ht-btn:active,.ht-exp:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="ht-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="ht-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; cdReset(); lqReset(); gsReset();
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); bands.bind(el); renderStatus();
    }

    /* ─────────────────────────────── 무대 ─────────────────────────────── */
    var stage, dyn={};
    function drawStage(){
      stage=el.querySelector('.ht-stage'); stage.innerHTML=''; dyn={};
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var d=svgEl('defs',{}); d.innerHTML=
         '<linearGradient id="htFront" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FA5252"/><stop offset="70%" stop-color="#FF8A3D"/><stop offset="100%" stop-color="#FF8A3D" stop-opacity="0"/></linearGradient>'
        +'<radialGradient id="htFlame" cx="50%" cy="65%" r="60%"><stop offset="0" stop-color="#FFD43B"/><stop offset="100%" stop-color="#FA5252"/></radialGradient>';
      svg.appendChild(d);
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='conduct')drawConduct(svg);
      else if(pic==='liquid')drawLiquid(svg);
      else drawGas(svg);
      stage.appendChild(svg);
      dyn.svg=svg;
    }

    function drawConduct(svg){
      dyn.rod=[];
      for(var i=0;i<3;i++){ var y=ROD_Y[i], r=RODS[i];
        var nm=svgEl('text',{x:ROD_X-70,y:y+ROD_H/2+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,fill:C.ink,'font-weight':800}); nm.textContent=r.name; svg.appendChild(nm);
        // 불꽃 (왼쪽 끝 아래)
        var fl=svgEl('path',{d:'M '+(ROD_X+8)+' '+(y+ROD_H+34)+' q -16 -18 0 -38 q 5 10 10 13 q 8 -10 6 -22 q 14 18 2 42 q -9 9 -18 5 z',fill:'url(#htFlame)',opacity:cd.heating?1:0.18}); svg.appendChild(fl); dyn.rod.push({flame:fl});
        // 막대 본체
        svg.appendChild(svgEl('rect',{x:ROD_X,y:y,width:ROD_W,height:ROD_H,rx:13,fill:r.base,stroke:'#fff','stroke-width':3}));
        // 열 퍼짐 오버레이
        var ov=svgEl('rect',{x:ROD_X,y:y,width:0,height:ROD_H,rx:13,fill:'url(#htFront)',opacity:0.9}); svg.appendChild(ov); dyn.rod[i].ov=ov;
        // 입자 점(진동 시각화)
        dyn.rod[i].dots=[];
        for(var k2=0;k2<8;k2++){ var dx2=ROD_X+28+k2*((ROD_W-56)/7);
          var dot=svgEl('circle',{cx:dx2,cy:y+ROD_H/2,r:4.5,fill:'#fff','fill-opacity':0.75}); svg.appendChild(dot);
          dyn.rod[i].dots.push({el:dot,x:dx2,y:y+ROD_H/2,ph:Math.random()*6.28}); }
        // 버터
        var bt=svgEl('g',{}); var bx=ROD_X+ROD_W-6;
        bt.appendChild(svgEl('rect',{x:bx-16,y:y-22,width:32,height:20,rx:6,fill:'#FFE066',stroke:'#F59F00','stroke-width':2.5}));
        var bl=svgEl('text',{x:bx,y:y-34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':15,fill:C.sub}); bl.textContent='버터'; bt.appendChild(bl);
        svg.appendChild(bt); dyn.rod[i].butter=bt; dyn.rod[i].by=y;
      }
    }

    function drawLiquid(svg){
      var B=LQ_BOX;
      // 비커
      svg.appendChild(svgEl('path',{d:'M '+(B.x-14)+' '+(B.y-8)+' L '+(B.x-14)+' '+(B.y+B.h+10)+' Q '+(B.x-14)+' '+(B.y+B.h+24)+' '+B.x+' '+(B.y+B.h+24)+' L '+(B.x+B.w)+' '+(B.y+B.h+24)+' Q '+(B.x+B.w+14)+' '+(B.y+B.h+24)+' '+(B.x+B.w+14)+' '+(B.y+B.h+10)+' L '+(B.x+B.w+14)+' '+(B.y-8),fill:'rgba(214,234,248,0.45)',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      // 아래 불꽃 / 위 가열 램프
      dyn.lqFlame=svgEl('path',{d:'M '+(B.x+B.w/2)+' '+(B.y+B.h+60)+' q -20 -20 0 -44 q 6 12 12 15 q 9 -12 7 -25 q 17 21 2 49 q -10 10 -21 5 z',fill:'url(#htFlame)'}); svg.appendChild(dyn.lqFlame);
      dyn.lqLamp=svgEl('g',{});
      dyn.lqLamp.appendChild(svgEl('rect',{x:B.x+B.w/2-46,y:B.y-34,width:92,height:18,rx:9,fill:'#FA5252'}));
      var lt=svgEl('text',{x:B.x+B.w/2,y:B.y-42,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':16,fill:C.hot,'font-weight':800}); lt.textContent='가열 막대'; dyn.lqLamp.appendChild(lt);
      svg.appendChild(dyn.lqLamp);
      // 입자
      dyn.lqParts=svgEl('g',{}); svg.appendChild(dyn.lqParts);
      lq.ps.forEach(function(p){ p.el=svgEl('circle',{cx:p.x,cy:p.y,r:9,fill:heatColor(p.t)}); dyn.lqParts.appendChild(p.el); });
      // 위/아래 온도 표시
      dyn.lqTop=svgEl('text',{x:B.x+B.w+40,y:B.y+40,'font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.lqTop);
      dyn.lqBot=svgEl('text',{x:B.x+B.w+40,y:B.y+B.h-10,'font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.lqBot);
    }

    function drawGas(svg){
      var B=GS_BOX;
      // 방 단면
      svg.appendChild(svgEl('rect',{x:B.x-10,y:B.y-10,width:B.w+20,height:B.h+20,rx:18,fill:'rgba(233,240,248,0.5)',stroke:'#74A4C9','stroke-width':4}));
      var rl=svgEl('text',{x:B.x+10,y:B.y-20,'font-family':'Jua,sans-serif','font-size':18,fill:C.sub,'font-weight':800}); rl.textContent='교실 옆모습'; svg.appendChild(rl);
      // 난로(바닥 왼쪽)
      dyn.gsHeater=svgEl('g',{});
      dyn.gsHeater.appendChild(svgEl('rect',{x:B.x+30,y:B.y+B.h-46,width:80,height:46,rx:10,fill:'#FF8A3D',stroke:'#E8590C','stroke-width':3}));
      var ht2=svgEl('text',{x:B.x+70,y:B.y+B.h-16,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':19,fill:'#fff','font-weight':800}); ht2.textContent='난로'; dyn.gsHeater.appendChild(ht2);
      svg.appendChild(dyn.gsHeater);
      // 에어컨(천장 오른쪽)
      dyn.gsAc=svgEl('g',{});
      dyn.gsAc.appendChild(svgEl('rect',{x:B.x+B.w-130,y:B.y,width:100,height:34,rx:10,fill:'#4DABF7',stroke:'#1971C2','stroke-width':3}));
      var at=svgEl('text',{x:B.x+B.w-80,y:B.y+24,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':18,fill:'#fff','font-weight':800}); at.textContent='에어컨'; dyn.gsAc.appendChild(at);
      svg.appendChild(dyn.gsAc);
      dyn.gsParts=svgEl('g',{}); svg.appendChild(dyn.gsParts);
      gs.ps.forEach(function(p){ p.el=svgEl('circle',{cx:p.x,cy:p.y,r:8,fill:heatColor(p.t)}); dyn.gsParts.appendChild(p.el); });
      dyn.gsTop=svgEl('text',{x:B.x+14,y:B.y+34,'font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.gsTop);
      dyn.gsBot=svgEl('text',{x:B.x+B.w-180,y:B.y+B.h-58,'font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.gsBot);
    }

    /* ─────────────────────────────── 갱신 ─────────────────────────────── */
    function loop(){ update(); raf=requestAnimationFrame(loop); }
    function update(){
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp, now=(Date.now()-t0)/300;
      if(pic==='conduct'&&dyn.rod){
        var changed=false;
        for(var i=0;i<3;i++){ var r=dyn.rod[i];
          if(cd.heating&&cd.hf[i]<1){ cd.hf[i]=clamp(cd.hf[i]+RODS[i].k*0.0035,0,1); changed=true; }
          if(r.ov)r.ov.setAttribute('width',(ROD_W*cd.hf[i]).toFixed(1));
          if(r.flame)r.flame.setAttribute('opacity',cd.heating?1:0.18);
          for(var k2=0;k2<r.dots.length;k2++){ var dd=r.dots[k2];
            var local=clamp((cd.hf[i]*ROD_W-(dd.x-ROD_X))/60+0.15,0.12,1);   // 열 도달부일수록 크게 진동
            var amp=local*4.2;
            dd.el.setAttribute('cx',(dd.x+Math.sin(now*2+dd.ph)*amp).toFixed(1));
            dd.el.setAttribute('cy',(dd.y+Math.cos(now*2.3+dd.ph)*amp).toFixed(1)); }
          if(cd.hf[i]>=1&&!cd.drop[i]){ cd.drop[i]=0.001; cd.order.push(i); changed=true; }
          if(cd.drop[i]>0&&cd.drop[i]<1){ cd.drop[i]=clamp(cd.drop[i]+0.02,0,1); }
          if(r.butter)r.butter.setAttribute('transform','translate(0,'+(cd.drop[i]*95)+') '+(cd.drop[i]>0?'rotate('+(cd.drop[i]*22)+' '+(ROD_X+ROD_W)+' '+dyn.rod[i].by+')':''));
        }
        if(changed)renderStatus();
      }
      else if(pic==='liquid'&&dyn.lqParts){
        var B=LQ_BOX, src=[];
        if(lq.pos==='bottom')src.push({on:true,x:B.x+B.w/2,y:B.y+B.h-6,r:105,dT:0.03,cell:1});
        if(lq.pos==='top')src.push({on:true,x:B.x+B.w/2,y:B.y+8,r:110,dT:0.03,cell:0});
        stepConv(lq.ps,B,src);
        lq.ps.forEach(function(p){ if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));p.el.setAttribute('fill',heatColor(p.t));} });
        if(dyn.lqFlame)dyn.lqFlame.setAttribute('opacity',lq.pos==='bottom'?1:0.15);
        if(dyn.lqLamp)dyn.lqLamp.setAttribute('opacity',lq.pos==='top'?1:0.15);
        if(dyn.lqTop)dyn.lqTop.textContent='위 '+degC(regionTemp(lq.ps,B,true))+'℃';
        if(dyn.lqBot)dyn.lqBot.textContent='아래 '+degC(regionTemp(lq.ps,B,false))+'℃';
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
      }
      else if(pic==='gas'&&dyn.gsParts){
        var B2=GS_BOX, src2=[
          {on:gs.heater,x:B2.x+70,y:B2.y+B2.h-23,r:150,dT:0.06,cell:1},
          {on:gs.ac,x:B2.x+B2.w-80,y:B2.y+17,r:150,dT:-0.06,cell:-1}
        ];
        stepConv(gs.ps,B2,src2);
        gs.ps.forEach(function(p){ if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));p.el.setAttribute('fill',heatColor(p.t));} });
        if(dyn.gsHeater)dyn.gsHeater.setAttribute('opacity',gs.heater?1:0.35);
        if(dyn.gsAc)dyn.gsAc.setAttribute('opacity',gs.ac?1:0.35);
        if(dyn.gsTop)dyn.gsTop.textContent='천장 '+degC(regionTemp(gs.ps,B2,true))+'℃';
        if(dyn.gsBot)dyn.gsBot.textContent='바닥 '+degC(regionTemp(gs.ps,B2,false))+'℃';
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
      }
      checkMission();
    }

    function renderStatus(){
      var s=el.querySelector('.ht-status'); if(!s)return;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">그림을 떠올리며 답을 골라요</div>'; return; }
      var h='';
      if(exp==='conduct'){
        if(grade==='low'){
          if(!cd.heating&&cd.order.length===0)h='<div style="font-size:24px;color:'+C.ink+';">🥄 뜨거운 것에 닿으면 <b style="color:'+C.hot+';">따뜻함이 옆으로 옆으로</b> 옮아가요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🔥 가열 시작을 눌러 막대가 따뜻해지는 걸 지켜봐요!</div>';
          else if(cd.order.length>=1)h='<div style="font-size:24px;color:'+C.good+';">버터가 떨어졌어요 — 따뜻함이 막대 끝까지 갔어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">가열한 곳에서 시작해 점점 옆으로 따뜻해진 거예요.</div>';
          else h='<div style="font-size:24px;color:'+C.hot+';">막대가 점점 따뜻해지는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">가열한 끝부터 색이 번지죠? 따뜻함이 옆으로 옮아가고 있어요.</div>';
        }
        else if(!cd.heating&&cd.order.length===0)h='<div style="font-size:24px;color:'+C.ink+';">🥄 고체에서 열은 가열한 곳부터 <b style="color:'+C.hot+';">이웃으로 차례차례</b> 전달돼요 — 전도</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🔥 가열 시작을 눌러 어떤 막대의 버터가 먼저 떨어지는지 지켜봐요!</div>';
        else if(cd.order.length===3)h='<div style="font-size:24px;color:'+C.good+';">버터가 떨어진 순서: '+cd.order.map(function(i){return RODS[i].name;}).join(' → ')+'!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">같은 불인데 빠르기가 달라요. 열이 잘 전달되는 구리 같은 금속과 잘 안 되는 유리 — 그래서 냄비는 금속, 손잡이는 플라스틱!</div>';
        else if(cd.order.length>0)h='<div style="font-size:24px;color:'+C.hot+';">'+RODS[cd.order[cd.order.length-1]].name+' 막대의 버터가 떨어졌어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">열이 막대를 타고 끝까지 전달된 거예요. 다른 막대도 지켜봐요.</div>';
        else h='<div style="font-size:24px;color:'+C.hot+';">열이 막대를 타고 퍼지는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">입자가 이웃 입자를 흔들어 깨우듯, 열이 가열한 끝에서부터 차례로 이동해요.</div>';
      }
      else if(exp==='liquid'){
        var tt=degC(regionTemp(lq.ps,LQ_BOX,true)), bb=degC(regionTemp(lq.ps,LQ_BOX,false));
        if(lq.pos==='bottom')h='<div style="font-size:24px;color:'+C.hot+';">아래에서 데워진 물이 <b>위로</b> 올라가요 — 대류</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">뜨거워진 물(빨강)은 가벼워져 올라가고, 차가운 물(파랑)이 내려와 그 자리를 채우며 빙글빙글 — 그래서 전체가 골고루 데워져요.</div>';
        else if(lq.pos==='top')h='<div style="font-size:24px;color:'+C.cold+';">위에서 데우면? 위 '+tt+'℃인데 아래는 '+bb+'℃!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">뜨거운 물은 위로만 가려 해서 아래로 내려가지 않아요. 그래서 물은 꼭 <b>아래</b>에서 데워요.</div>';
        else h='<div style="font-size:24px;color:'+C.ink+';">💧 액체에서 열은 <b style="color:'+C.hot+';">물이 직접 돌면서</b> 이동해요 — 대류</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">아래에서 가열할 때와 위에서 가열할 때, 무엇이 다른지 비교해 봐요!</div>';
      }
      else {
        if(gs.heater&&gs.ac)h='<div style="font-size:24px;color:'+C.vio+';">따뜻한 공기는 위로, 차가운 공기는 아래로!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">난로의 더운 공기는 올라가고 에어컨의 찬 공기는 내려와 방 전체가 골고루 섞여요.</div>';
        else if(gs.heater)h='<div style="font-size:24px;color:'+C.hot+';">난로의 따뜻한 공기가 <b>천장</b>으로 모여요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">따뜻한 공기는 가벼워서 위로! 그래서 난로는 <b>바닥</b>에 두어야 방 전체가 따뜻해져요.</div>';
        else if(gs.ac)h='<div style="font-size:24px;color:'+C.cold+';">에어컨의 차가운 공기가 <b>바닥</b>으로 내려와요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">차가운 공기는 무거워서 아래로! 그래서 에어컨은 <b>위쪽</b>에 달아야 방 전체가 시원해져요.</div>';
        else h='<div style="font-size:24px;color:'+C.ink+';">🌬️ 공기도 물처럼 <b style="color:'+C.hot+';">돌면서</b> 열을 옮겨요 — 대류</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">난로와 에어컨을 켜 보고, 공기가 어느 쪽으로 움직이는지 살펴봐요!</div>';
      }
      s.innerHTML=h;
    }

    /* ─────────────────────────────── 바인딩 ─────────────────────────────── */
    function bind(){
      el.querySelectorAll('.ht-exp').forEach(function(b){ b.addEventListener('click',function(){
        exp=b.dataset.e; cdReset(); lqReset(); gsReset(); build(); }); });
      var H={
        cdHeat:function(){ cd.heating=!cd.heating; build(); },
        cdReset:function(){ cdReset(); build(); },
        lqBottom:function(){ lq.pos='bottom'; build(); },
        lqTop:function(){ lq.pos='top'; build(); },
        lqOff:function(){ lq.pos='off'; build(); },
        lqReset:function(){ lqReset(); build(); },
        gsHeater:function(){ gs.heater=!gs.heater; build(); },
        gsAc:function(){ gs.ac=!gs.ac; build(); },
        gsReset:function(){ gsReset(); build(); }
      };
      el.querySelectorAll('.ht-btn').forEach(function(b){ b.addEventListener('click',function(){ var f=H[b.dataset.act]; if(f)f(); }); });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok,ok?null:('🤔 정답은 "'+q.ch[q.a]+'"!'));
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    if(mode==='mission')exp=curMissions()[0].exp;
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
