/* ============================================================================
   케이랩 도구 모듈 — 용해와 용액 (dissolve) v1  [과학 7호]
   5학년 용해와 용액. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   변수 → 현상 → 발견:
     ▸ 🍬 각설탕(황설탕) 넣기 → 덩어리가 입자로 풀려 물속에 골고루 퍼짐.
        물 색이 전체적으로 균일하게 변함 → "사라진 게 아니라 골고루 섞인 것".
     ▸ ⚖️ 저울 상시 표시 — 물 100g + 설탕 Ng = 용액 (100+N)g. 녹아도 무게 그대로
        (무게 보존, 대표 오개념 직격).
     ▸ 🥄 젓기 → 훨씬 빨리 녹음. 🌡️ 온도 → 높을수록 더 많이·더 빨리 녹음(용해도).
     ▸ 한계(포화)를 넘으면 다 안 녹고 가라앉음 → 온도를 올리면 마저 녹음.
        온도를 내리면 도로 가라앉음(석출).
   미션 4종(다 녹이기/저어 빨리/포화 만들기/온도 올려 마저 녹이기) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", temp(기본20) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('dissolve', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, t0 = Date.now();
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', hot:'#E8590C', cold:'#1971C2', vio:'#7048E8', sugar:'#B5651D' };
    var btn = 'font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function clamp(v,a,b){ return Math.max(a,Math.min(v,b)); }

    /* ───────────── 상태 ───────────── */
    var B = { x:230, y:100, w:430, h:300 };          // 비커 내부(물)
    var DOTS_PER_CUBE = 10, GRAM_PER_DOT = 1;
    var st;
    function reset(){
      st = { temp:(config.temp!=null)?config.temp:20, stir:false, stirT:0,
             total:0,            // 넣은 설탕 총량(점 단위)
             dots:[],            // 녹아 있는 입자
             erode:0,            // 용해 누적기
             satEver:false };    // 한 번이라도 포화(가라앉음) 경험
    }
    reset();
    function limit(t){ return Math.round(18 + t*0.6); }              // 용해도(점): 0℃=18, 20℃=30, 80℃=66
    function pending(){ return st.total - st.dots.length; }          // 안 녹고 가라앉은 양
    function newDot(x,y){ return { x:x, y:y, vx:(Math.random()-0.5), vy:-(0.5+Math.random()), el:null }; }

    /* ───────────── 미션 ───────────── */
    var MISSIONS = [
      { text:'🍬 각설탕을 <b style="color:#7048E8;">2개</b> 넣고 <b style="color:#7048E8;">모두 녹여</b> 봐요! (저울 숫자도 지켜봐요)',
        keep:false, check:function(){ return st.total>=2*DOTS_PER_CUBE && pending()===0 && st.dots.length>0; } },
      { text:'🥄 설탕을 넣고 <b style="color:#7048E8;">저으면서</b> 녹여 봐요 — 훨씬 빨리 녹는 게 보일 거예요!',
        keep:false, check:function(){ return st.stir && pending()>0 && st.dots.length>0; } },
      { text:'🍬 설탕을 <b style="color:#7048E8;">계속</b> 넣어 봐요. 더 못 녹고 <b style="color:#7048E8;">가라앉을 때까지</b>! (포화)',
        keep:false, check:function(){ return pending()>0 && st.dots.length>=limit(st.temp); } },
      { text:'🌡️ 이제 <b style="color:#7048E8;">온도를 올려서</b> 가라앉은 설탕을 <b style="color:#7048E8;">마저 녹여</b> 봐요!',
        keep:true,  check:function(){ return st.satEver && st.temp>=40 && pending()===0 && st.total>limit(20); } }
    ];
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1){ mStep++; if(!MISSIONS[mStep].keep)reset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ = [
      { q:'물에 녹아 보이지 않는 설탕은 어디에 있을까요?',
        ch:['물속에 골고루 섞여 있어요','정말로 사라졌어요','전부 바닥에 있어요'], a:0 },
      { q:'물 100g에 설탕 10g을 녹이면 설탕물의 무게는?',
        ch:['110g — 무게는 그대로!','100g — 녹으면 가벼워져요','105g — 절반만 남아요'], a:0 },
      { q:'설탕을 더 빨리 녹이려면?',
        ch:['젓거나 따뜻한 물에 녹여요','차가운 물에 가만히 둬요','물을 얼려요'], a:0 },
      { q:'설탕이 더 녹지 않고 가라앉을 때 마저 녹이려면?',
        ch:['물의 온도를 올려요','물의 온도를 내려요','설탕을 더 넣어요'], a:0 },
      { q:'설탕물의 위쪽과 아래쪽, 단맛은 어떨까요?',
        ch:['골고루 섞여 똑같이 달아요','아래쪽만 달아요','위쪽만 달아요'], a:0 }
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

    /* ───────────── UI ───────────── */
    function ctrlRow(){
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">'
        +'<button class="dv-btn" data-act="add" style="'+btn+'background:'+C.sugar+';color:#fff;border-color:'+C.sugar+';">🍬 각설탕 넣기</button>'
        +'<button class="dv-btn" data-act="stir" style="'+btn+(st.stir?'background:'+C.vio+';color:#fff;border-color:'+C.vio:'background:#fff;color:'+C.vio+';border-color:'+C.vio)+';">🥄 젓기 '+(st.stir?'중!':'')+'</button>'
        +'<span style="font-size:19px;font-weight:800;color:'+C.sub+';">🌡️</span>'
        +'<input class="dv-range" type="range" min="0" max="80" value="'+st.temp+'" style="width:min(34vw,220px);">'
        +'<span class="dv-temp" style="font-size:22px;font-weight:800;color:'+C.ink+';min-width:58px;">'+st.temp+'℃</span>'
        +'<button class="dv-btn" data-act="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 물</button>'
        +'</div>';
    }
    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=ctrlRow();
      el.innerHTML='<style>.dv-btn:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}'
        +'.dv-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#4DABF7,#FFD43B,#FF6B6B);outline:none;}'
        +'.dv-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.dv-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="dv-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="dv-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, dyn={};
    function drawStage(){
      stage=el.querySelector('.dv-stage'); stage.innerHTML=''; dyn={};
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      // 물(농도 색)
      dyn.water=svgEl('rect',{x:B.x,y:B.y,width:B.w,height:B.h,rx:6,fill:'rgba(120,180,230,0.30)'});
      svg.appendChild(dyn.water);
      // 비커 윤곽
      svg.appendChild(svgEl('path',{d:'M '+(B.x-14)+' '+(B.y-8)+' L '+(B.x-14)+' '+(B.y+B.h+10)+' Q '+(B.x-14)+' '+(B.y+B.h+24)+' '+B.x+' '+(B.y+B.h+24)+' L '+(B.x+B.w)+' '+(B.y+B.h+24)+' Q '+(B.x+B.w+14)+' '+(B.y+B.h+24)+' '+(B.x+B.w+14)+' '+(B.y+B.h+10)+' L '+(B.x+B.w+14)+' '+(B.y-8),fill:'none',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      // 젓기 숟가락(젓는 동안 회전)
      dyn.spoon=svgEl('g',{opacity:0});
      dyn.spoon.appendChild(svgEl('line',{x1:B.x+B.w/2,y1:B.y-26,x2:B.x+B.w/2,y2:B.y+B.h*0.55,stroke:'#9C7B4F','stroke-width':9,'stroke-linecap':'round'}));
      dyn.spoon.appendChild(svgEl('ellipse',{cx:B.x+B.w/2,cy:B.y+B.h*0.58,rx:24,ry:14,fill:'#C9A26B',stroke:'#9C7B4F','stroke-width':3}));
      svg.appendChild(dyn.spoon);
      // 가라앉은 설탕 더미
      dyn.pile=svgEl('path',{d:'',fill:'#E0B27A',stroke:C.sugar,'stroke-width':2.5}); svg.appendChild(dyn.pile);
      // 녹은 입자
      dyn.parts=svgEl('g',{}); svg.appendChild(dyn.parts);
      st.dots.forEach(function(p){ p.el=svgEl('circle',{cx:p.x,cy:p.y,r:6.5,fill:C.sugar,'fill-opacity':0.85}); dyn.parts.appendChild(p.el); });
      // 저울 패널(오른쪽)
      var SX=720, SY=150;
      svg.appendChild(svgEl('rect',{x:SX-22,y:SY-38,width:190,height:170,rx:18,fill:'#fff',stroke:'#C9D7E6','stroke-width':3}));
      var t1=svgEl('text',{x:SX+73,y:SY-10,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); t1.textContent='⚖️ 저울'; svg.appendChild(t1);
      dyn.sW=svgEl('text',{x:SX-6,y:SY+26,'font-family':'Jua,sans-serif','font-size':19,fill:C.sub,'font-weight':800}); svg.appendChild(dyn.sW);
      dyn.sS=svgEl('text',{x:SX-6,y:SY+56,'font-family':'Jua,sans-serif','font-size':19,fill:C.sugar,'font-weight':800}); svg.appendChild(dyn.sS);
      svg.appendChild(svgEl('line',{x1:SX-6,y1:SY+72,x2:SX+152,y2:SY+72,stroke:'#C9D7E6','stroke-width':3}));
      dyn.sT=svgEl('text',{x:SX-6,y:SY+104,'font-family':'Jua,sans-serif','font-size':22,fill:C.ink,'font-weight':800}); svg.appendChild(dyn.sT);
      // 용해도 게이지(왼쪽): 지금 온도에서 녹을 수 있는 양
      dyn.gT=svgEl('text',{x:120,y:130,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:C.sub}); dyn.gT.textContent='녹을 수 있는 양'; svg.appendChild(dyn.gT);
      svg.appendChild(svgEl('rect',{x:96,y:145,width:48,height:240,rx:12,fill:'#fff',stroke:'#C9D7E6','stroke-width':3}));
      dyn.gFill=svgEl('rect',{x:102,y:385,width:36,height:0,rx:9,fill:'#FFD8A8'}); svg.appendChild(dyn.gFill);
      dyn.gNow=svgEl('rect',{x:102,y:385,width:36,height:0,rx:9,fill:C.sugar,'fill-opacity':0.85}); svg.appendChild(dyn.gNow);
      stage.appendChild(svg);
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ update(); raf=requestAnimationFrame(loop); }
    var frame=0;
    function update(){
      frame++;
      if(mode!=='quiz'){
        var lim=limit(st.temp), sp=st.stir?3.2:1;
        // 용해: 가라앉은 게 있고 한계 미만이면 입자로 풀려남
        if(pending()>0 && st.dots.length<lim){
          st.erode += 0.05*(1+st.temp/40)*sp;
          while(st.erode>=1 && pending()>0 && st.dots.length<lim){
            st.erode-=1;
            var px=B.x+B.w/2+(Math.random()-0.5)*Math.min(140,30+pending()*4);
            var d2=newDot(px,B.y+B.h-16);
            d2.el=svgEl('circle',{cx:d2.x,cy:d2.y,r:6.5,fill:C.sugar,'fill-opacity':0.85});
            if(dyn.parts)dyn.parts.appendChild(d2.el);
            st.dots.push(d2);
          }
        }
        // 석출: 온도를 내려 한계를 넘으면 도로 가라앉음
        if(st.dots.length>lim && frame%18===0){
          var rm=st.dots.pop(); if(rm.el)rm.el.remove();
        }
        if(pending()>0 && st.dots.length>=lim) st.satEver=true;
        // 입자 운동(골고루 퍼짐)
        var mv=(0.5+st.temp/60)*(st.stir?2.6:1);
        for(var i=0;i<st.dots.length;i++){ var p=st.dots[i];
          p.vx+=(Math.random()-0.5)*0.3; p.vy+=(Math.random()-0.5)*0.3;
          if(st.stir){ var cx=B.x+B.w/2, cy=B.y+B.h/2, dx=p.x-cx, dy=p.y-cy, L=Math.sqrt(dx*dx+dy*dy)||1;
            p.vx+=(-dy/L)*0.9; p.vy+=(dx/L)*0.9; }                 // 소용돌이
          p.vx=clamp(p.vx,-2.2,2.2)*0.96; p.vy=clamp(p.vy,-2.2,2.2)*0.96;
          p.x+=p.vx*mv; p.y+=p.vy*mv;
          if(p.x<B.x+10){p.x=B.x+10;p.vx=Math.abs(p.vx);} if(p.x>B.x+B.w-10){p.x=B.x+B.w-10;p.vx=-Math.abs(p.vx);}
          if(p.y<B.y+10){p.y=B.y+10;p.vy=Math.abs(p.vy);} if(p.y>B.y+B.h-10){p.y=B.y+B.h-10;p.vy=-Math.abs(p.vy);}
          if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));}
        }
        // 젓기 자동 종료(4초)
        if(st.stir){ st.stirT++; if(st.stirT>240){ st.stir=false; st.stirT=0; build(); } }
        // 화면 연동
        if(dyn.water)dyn.water.setAttribute('fill','rgba(181,101,29,'+(0.06+clamp(st.dots.length/70,0,1)*0.30).toFixed(3)+')');
        if(dyn.spoon)dyn.spoon.setAttribute('opacity',st.stir?1:0);
        if(dyn.spoon&&st.stir)dyn.spoon.setAttribute('transform','translate('+(Math.sin(frame*0.18)*46)+',0)');
        if(dyn.pile){ var pd=pending();
          dyn.pile.setAttribute('d', pd>0 ? ('M '+(B.x+B.w/2-30-pd*3)+' '+(B.y+B.h)+' Q '+(B.x+B.w/2)+' '+(B.y+B.h-14-pd*1.6)+' '+(B.x+B.w/2+30+pd*3)+' '+(B.y+B.h)+' Z') : ''); }
        if(dyn.sW)dyn.sW.textContent='물          100g';
        if(dyn.sS)dyn.sS.textContent='설탕        '+(st.total*GRAM_PER_DOT)+'g';
        if(dyn.sT)dyn.sT.textContent='전체   '+(100+st.total*GRAM_PER_DOT)+'g';
        if(dyn.gFill){ var gh=clamp(limit(st.temp)/66,0,1)*240; dyn.gFill.setAttribute('y',385-gh); dyn.gFill.setAttribute('height',gh); }
        if(dyn.gNow){ var nh=clamp(st.dots.length/66,0,1)*240; dyn.gNow.setAttribute('y',385-nh); dyn.gNow.setAttribute('height',nh); }
        if(frame%30===0)renderStatus();
      }
      checkMission();
    }

    function renderStatus(){
      var s=el.querySelector('.dv-status'); if(!s)return;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">실험을 떠올리며 답을 골라요</div>'; return; }
      var pd=pending(), n=st.dots.length, lim=limit(st.temp), h;
      if(st.total===0)h='<div style="font-size:24px;color:'+C.ink+';">🍬 각설탕을 넣어 보세요 — 입자가 어떻게 되는지, 저울 숫자는 어떻게 되는지!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">물은 100g이에요. 설탕을 넣으면서 전체 무게를 지켜봐요.</div>';
      else if(pd>0&&n>=lim)h='<div style="font-size:24px;color:'+C.sugar+';">더 못 녹고 가라앉았어요 — 포화!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">지금 온도('+st.temp+'℃)에서 녹을 수 있는 양이 꽉 찼어요. 🌡️ 온도를 올리면 마저 녹일 수 있어요. 그래도 무게는 전체 '+(100+st.total)+'g 그대로!</div>';
      else if(pd>0)h='<div style="font-size:24px;color:'+C.sugar+';">설탕이 입자로 풀려 물속으로 퍼지는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🥄 저으면 훨씬 빨리 녹아요. 온도가 높아도 빨리, 더 많이 녹아요.</div>';
      else h='<div style="font-size:24px;color:'+C.good+';">다 녹아서 안 보여요 — 하지만 사라진 게 아니에요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">입자가 물속에 <b>골고루</b> 섞여 있어요. 그래서 저울도 물 100g + 설탕 '+st.total+'g = <b>'+(100+st.total)+'g 그대로</b>. 어디를 마셔도 똑같이 달아요.</div>';
      s.innerHTML=h;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      var H={
        add:function(){ st.total+=DOTS_PER_CUBE; renderStatus(); },
        stir:function(){ st.stir=!st.stir; st.stirT=0; build(); },
        reset:function(){ var t=st.temp; reset(); st.temp=t; build(); }
      };
      el.querySelectorAll('.dv-btn').forEach(function(b){ b.addEventListener('click',function(){ var f=H[b.dataset.act]; if(f)f(); }); });
      var r=el.querySelector('.dv-range');
      if(r)r.addEventListener('input',function(e){ st.temp=clamp(Math.round(+e.target.value),0,80);
        var t=el.querySelector('.dv-temp'); if(t)t.textContent=st.temp+'℃'; renderStatus(); });
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
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
