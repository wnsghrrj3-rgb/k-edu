/* ============================================================================
   케이랩 도구 모듈 — 십 배열판 (tenframe) v2
   초점 (1학년 수 감각·가르기모으기) = 10을 한눈에, 가르고 모으기.
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 자유탐구 — 점 ＋/－, 점 클릭으로 파랑↔주황 가르기, 10의 보수 안내.
     · 미션 — "10 꽉 채우기", "8을 5와 3으로 가르기", "13 만들기" 등 단계 과제,
       달성 자동 감지 → 다음 미션.
     · 퀴즈 — 점을 보여 주고 "모두 몇 개?", "10이 되려면 몇 개 더?" 선택지 출제.
   - 의존: window.KLab (THREE 불필요)
   - config: { num(기본7), frames(기본2), max(기본20), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('tenframe', function (el, config) {
    var ui=window.KLab.ui;
    var frames=Math.max(1,Math.min(config.frames||2,3));
    var max=Math.min(config.max||(frames*10),frames*10);
    var num=Math.max(0,Math.min(config.num!=null?config.num:7,max));
    var blue={};
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var btn='font-size:27px;padding:15px 30px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    // ---- 미션 정의: check(num, orangeCount) → true면 달성 ----
    var MISSIONS=[
      {text:'점을 정확히 <b style="color:#7048E8;">10개</b> 채워 봐요!', check:function(n,o){return n===10;}},
      {text:'<b style="color:#7048E8;">8</b>을 만들고, 점을 눌러 <b style="color:#FF8A3D;">주황 3개</b>로 갈라 봐요 (8 = 5와 3)', check:function(n,o){return n===8&&o===3;}},
      {text:'<b style="color:#7048E8;">13</b>을 만들어 봐요 — 한 판을 꽉 채우면 10이에요!', check:function(n,o){return n===13;}},
      {text:'<b style="color:#7048E8;">6</b>을 만들고 <b style="color:#FF8A3D;">반(3개)</b>을 주황으로 갈라 봐요 (6 = 3과 3)', check:function(n,o){return n===6&&o===3;}}
    ].filter(function(m,i){ return (i===2)?(max>=13):true; });
    var mStep=0, mDone=false, mLock=false;

    // ---- 퀴즈 상태 ----
    var qNum=0, qKind='count', qScore=0, qCount=0, qLock=false;
    function newQuiz(){
      qKind=(Math.random()<0.5)?'count':'toTen';
      if(qKind==='toTen'){ qNum=1+Math.floor(Math.random()*9); }       // 1~9
      else { qNum=3+Math.floor(Math.random()*Math.min(max,17)); }      // 3~max
      blue={}; qLock=false;
    }
    function quizAnswer(){ return qKind==='count'?qNum:(10-qNum); }
    function quizChoices(){
      var ans=quizAnswer(), set={}, out=[ans];set[ans]=1;
      while(out.length<4){ var d=ans+(Math.floor(Math.random()*7)-3); if(d>=0&&d<=20&&!set[d]){set[d]=1;out.push(d);} }
      out.sort(function(a,b){return a-b;});
      return out.map(function(v){return {v:v};});
    }

    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', ctrl='', foot='';
      if(mode==='mission'){
        bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
        ctrl='<button class="tf-btn" data-act="minus" style="'+btn+'background:#fff;color:#1565C0;">－ 점</button>'
            +'<button class="tf-btn" data-act="plus" style="'+btn+'background:#1565C0;color:#fff;">＋ 점</button>'
            +'<button class="tf-btn" data-act="reset" style="font-size:27px;padding:15px 22px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      } else if(mode==='quiz'){
        bar=ui.quizBar(qKind==='count'?'점이 모두 몇 개일까요?':'10이 되려면 몇 개 더 필요할까요?',qScore,qCount);
        foot=ui.choices(quizChoices());
      } else {
        ctrl='<button class="tf-btn" data-act="minus" style="'+btn+'background:#fff;color:#1565C0;">－ 점</button>'
            +'<button class="tf-btn" data-act="plus" style="'+btn+'background:#1565C0;color:#fff;">＋ 점</button>'
            +'<button class="tf-btn" data-act="reset" style="font-size:27px;padding:15px 22px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      }
      el.innerHTML='<style>.tf-btn:active,.kl-choice:active{transform:translateY(2px);}.tf-btn[disabled]{opacity:.35;cursor:not-allowed;}.tf-dot{cursor:pointer;transition:fill .15s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}.tf-dot:hover{transform:scale(1.08);}.kl-choice:hover{background:#1565C0 !important;color:#fff !important;}</style>'
        +top+bar
        +(ctrl?'<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'+ctrl+'</div>':'')
        +'<div class="kl-stage-host" style="position:relative;"><div class="tf-stage" style="width:100%;height:'+(mode==='quiz'?'40vh':'46vh')+';min-height:300px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +foot
        +'<div class="tf-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){mode=m;blue={};mStep=0;mDone=false;
        if(m==='quiz'){qScore=0;qCount=0;newQuiz();} else {num=Math.max(0,Math.min(config.num!=null?config.num:7,max));}
        build();});
      bind(); render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=860,VBH=360;
    function render(){
      var stage=el.querySelector('.tf-stage'); stage.innerHTML='';
      var shownNum=(mode==='quiz')?qNum:num;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="tfSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var shown=Math.max(1,Math.min(Math.ceil(shownNum/10)||1,frames)); if(shownNum===0)shown=1;
      if(mode==='quiz'&&qKind==='toTen')shown=1;
      var cell=56, fw=cell*5, fh=cell*2, gap=40;
      var totalW=fw*shown+gap*(shown-1), x0=(VBW-totalW)/2, y0=(VBH-fh)/2-10, gk=0;
      for(var f=0;f<shown;f++){
        var fx=x0+f*(fw+gap);
        for(var r=0;r<2;r++)for(var c=0;c<5;c++){
          var cxp=fx+c*cell, cyp=y0+r*cell;
          svg.appendChild(svgEl('rect',{x:cxp,y:cyp,width:cell,height:cell,fill:'rgba(255,255,255,0.4)',stroke:'#9AB7D4','stroke-width':2,'stroke-dasharray':'5 5'}));
          if(gk<shownNum){var orange=!!blue[gk];svg.appendChild(svgEl('circle',{cx:cxp+cell/2,cy:cyp+cell/2,r:cell*0.36,fill:orange?'#FF8A3D':'#1565C0',stroke:orange?'#C24E0E':'#0B447C','stroke-width':3,'data-gk':gk,class:'tf-dot',filter:'url(#tfSh)'}));}
          gk++;
        }
        svg.appendChild(svgEl('rect',{x:fx,y:y0,width:fw,height:fh,fill:'none',stroke:'#5a7894','stroke-width':3,rx:8}));
      }
      stage.appendChild(svg);
      if(mode!=='quiz'){
        stage.querySelectorAll('.tf-dot').forEach(function(p){p.addEventListener('click',function(){var k=+p.dataset.gk;blue[k]=!blue[k];render();});});
      }
      var oc=0;for(var k in blue)if(blue[k]&&k<shownNum)oc++;var bc=shownNum-oc;
      var st=el.querySelector('.tf-status');
      if(mode==='quiz'){ st.innerHTML='<span style="font-size:22px;color:#5a7894;">아래에서 답을 골라 누르세요</span>'; }
      else{
        var toTen=(shownNum<10)?(10-shownNum):(shownNum<20?20-shownNum:0);
        st.innerHTML='<span style="font-size:46px;color:#1565C0;">'+shownNum+'</span>'
          +(oc>0?'<span style="font-size:26px;color:#1B3A57;"> ＝ </span><span style="font-size:36px;color:#1565C0;">'+bc+'</span><span style="font-size:26px;color:#1B3A57;">(파랑) 와 </span><span style="font-size:36px;color:#FF8A3D;">'+oc+'</span><span style="font-size:26px;color:#1B3A57;">(주황)</span>':'')
          +(toTen>0?'<span style="font-size:22px;color:#5a7894;">    10까지 '+toTen+'개 더</span>':(shownNum%10===0&&shownNum>0?'<span style="font-size:22px;color:#0CA678;">    꽉 찼어요!</span>':''));
        var p=el.querySelector('[data-act="plus"]'), m=el.querySelector('[data-act="minus"]');
        if(p)p.disabled=num>=max; if(m)m.disabled=num<=0;
      }
      checkMission(oc);
    }

    function checkMission(orangeCount){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check(num,orangeCount)){
        mLock=true;
        window.KLab.ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1){mStep++;num=0;blue={};}
          else mDone=true;
          build();
        },1500);
      }
    }

    function bind(){
      var p=el.querySelector('[data-act="plus"]'), m=el.querySelector('[data-act="minus"]'), r=el.querySelector('[data-act="reset"]');
      if(p)p.addEventListener('click',function(){if(num<max){num++;render();}});
      if(m)m.addEventListener('click',function(){if(num>0){delete blue[num-1];num--;render();}});
      if(r)r.addEventListener('click',function(){num=(mode==='mission')?0:(config.num!=null?config.num:7);blue={};render();});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var ok=(+b.dataset.v===quizAnswer());
          qCount++; if(ok)qScore++;
          window.KLab.ui.toast(el,ok,ok?null:('🤔 정답은 '+quizAnswer()+'! 다음 문제 가요'));
          b.style.background=ok?'#12B886':'#FF8A3D'; b.style.color='#fff'; b.style.borderColor=ok?'#12B886':'#FF8A3D';
          setTimeout(function(){newQuiz();build();},1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build();
    return function cleanup(){};
  });
})();
