/* ============================================================================
   케이랩 도구 모듈 — 소수 모형 (decimal) v2 · 3모드
   초점 (4학년 소수) = 전체(1)를 100칸 모눈으로 보아 소수 자릿값을 눈으로.
     · 10×10 모눈 = 1. 한 칸 = 0.01, 한 줄(10칸) = 0.1.
     · ＋0.1 / ＋0.01 또는 칸 클릭으로 채우기 → 소수·분수 동시 표시.
       "0.37 = 37/100" (소수 ⇄ 분수 연결).
   v2: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 모눈을 보고 소수·분수 읽기.
   - 의존: window.KLab (THREE 불필요)
   - config: { value(기본0.37), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('decimal', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var startH=Math.max(0,Math.min(Math.round((config.value!=null?config.value:0.37)*100),100));
    var hund=startH; // 채운 칸 수 0~100
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'＋0.1 버튼으로 <b style="color:#7048E8;">0.3</b>을 만들어 봐요! (한 줄 = 0.1)',
        check:function(){ return hund===30; } },
      { text:'이제 ＋0.01로 <b style="color:#7048E8;">0.34</b>까지! (한 칸 = 0.01)',
        check:function(){ return hund===34; } },
      { text:'모눈 칸을 직접 눌러 <b style="color:#7048E8;">0.5</b>(절반)를 만들어 봐요!',
        check:function(){ return hund===50; } },
      { text:'모눈을 꽉 채워 <b style="color:#7048E8;">1</b>을 만들어요 — 0.01이 100개면 1!',
        check:function(){ return hund===100; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ mLock=false; mStep++;
          if(mStep>=MISSIONS.length)mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (모눈을 보고 읽기) ───────────── */
    var QUIZ_POOL=[
      { hund:37, q:'색칠한 모눈이 나타내는 소수는?', answer:'0.37', choices:['0.37','3.7','0.07'] },
      { hund:50, q:'모눈의 절반이 색칠됐어요. 소수로 나타내면?', answer:'0.5', choices:['0.5','0.05','5'] },
      { hund:3,  q:'세 칸만 색칠됐어요. 소수로 나타내면?', answer:'0.03', choices:['0.03','0.3','3'] },
      { hund:70, q:'색칠한 부분을 분수로 나타내면?', answer:'70/100', choices:['70/100','7/100','70/10'] },
      { hund:25, q:'0.1이 2개, 0.01이 5개인 수는?', answer:'0.25', choices:['0.25','0.52','2.5'] }
    ];
    var qList=[],qIdx=0,qScore=0,qCount=0,qLock=false;
    function shuffleQuiz(){
      qList=QUIZ_POOL.slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=qList[i];qList[i]=qList[j];qList[j]=t;}
      qIdx=0;qScore=0;qCount=0;
    }
    function shuffled(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      var ctrl='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
        +'<button class="dc-btn" data-act="m10" style="'+btn+'background:#fff;color:#1565C0;">－0.1</button>'
        +'<button class="dc-btn" data-act="p10" style="'+btn+'background:#1565C0;color:#fff;">＋0.1</button>'
        +'<span style="width:8px;"></span>'
        +'<button class="dc-btn" data-act="m1" style="'+btn+'background:#fff;color:#0CA678;border-color:#0CA678;">－0.01</button>'
        +'<button class="dc-btn" data-act="p1" style="'+btn+'background:#0CA678;color:#fff;border-color:#0CA678;">＋0.01</button>'
        +'<span style="width:8px;"></span>'
        +'<button class="dc-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      +'</div>';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); }
      else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        hund=q.hund; ctrl='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      el.innerHTML='<style>.dc-btn:active{transform:translateY(2px);}.dc-btn[disabled]{opacity:.35;cursor:not-allowed;}.dc-cell{cursor:pointer;transition:fill .12s;}.kl-choice{min-width:120px !important;}</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="dc-stage" style="width:100%;height:'+(mode==='quiz'?'40vh':'50vh')+';min-height:'+(mode==='quiz'?'300':'350')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        + foot
        +'<div class="dc-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m2){
        mode=m2; mStep=0;mDone=false;mLock=false;
        hund=(m2==='mission')?0:startH;
        if(m2==='quiz')shuffleQuiz();
        build();
      });
      var H={p10:function(){hund=Math.min(100,hund+10);render();},m10:function(){hund=Math.max(0,hund-10);render();},
        p1:function(){hund=Math.min(100,hund+1);render();},m1:function(){hund=Math.max(0,hund-1);render();},
        reset:function(){hund=(mode==='mission')?0:startH;render();}};
      el.querySelectorAll('.dc-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f){f();if(mode==='mission')checkMission();}});});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true; qCount++;
          var q=qList[qIdx], ok=(b.dataset.v===String(q.answer));
          if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ qIdx++; if(qIdx>=qList.length)shuffleQuiz(); qLock=false; build(); },1400);
        });
      });
      render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=820,VBH=400;
    function render(){
      var stage=el.querySelector('.dc-stage'), statusEl=el.querySelector('.dc-status');
      if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="dcSh" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#13315C" flood-opacity="0.16"/></filter>';svg.appendChild(d);
      var grid=Math.min(VBH-60,360), cell=grid/10, x0=(VBW-grid)/2-60, y0=(VBH-grid)/2;
      var g=svgEl('g',{filter:'url(#dcSh)'});
      // 채우기: 줄(0.1)은 진한 청록, 낱칸(0.01)은 연한. 왼쪽 위→오른쪽, 줄 단위.
      var k=0;
      for(var r=0;r<10;r++)for(var c=0;c<10;c++){
        var on=k<hund;
        // 완성된 줄(10칸 다 참)은 진하게
        var rowFull=(Math.floor(hund/10)>r);
        var fill=on?(rowFull?'#1565C0':'#63E6BE'):'#F4F9FF';
        g.appendChild(svgEl('rect',{x:x0+c*cell,y:y0+r*cell,width:cell,height:cell,fill:fill,stroke:'#9AB7D4','stroke-width':1.5,'data-k':k,class:'dc-cell'}));
        k++;
      }
      g.appendChild(svgEl('rect',{x:x0,y:y0,width:grid,height:grid,fill:'none',stroke:'#0B447C','stroke-width':5,'pointer-events':'none'}));
      // 0.1 줄 구분 (굵은 가로선)
      for(var rr=1;rr<10;rr++) g.appendChild(svgEl('line',{x1:x0,y1:y0+rr*cell,x2:x0+grid,y2:y0+rr*cell,stroke:'#5a7894','stroke-width':rr%1===0?2:1,'pointer-events':'none'}));
      svg.appendChild(g);
      stage.appendChild(svg);
      if(mode!=='quiz'){
        stage.querySelectorAll('.dc-cell').forEach(function(p){p.addEventListener('click',function(){hund=(+p.dataset.k)+1;if(hund>100)hund=100;render();if(mode==='mission')checkMission();});});
      }
      if(mode==='quiz'){
        statusEl.innerHTML='<div style="font-size:19px;color:#8aa0b6;">한 줄(10칸)=0.1, 한 칸=0.01! 색칠된 칸을 세어 답을 골라요.</div>';
        return;
      }
      var val=(hund/100).toFixed(2), tenths=Math.floor(hund/10), ones=hund%10;
      statusEl.innerHTML='<span style="font-size:50px;color:#1565C0;">'+val+'</span>'
        +'<span style="font-size:28px;color:#1B3A57;"> ＝ </span>'
        +'<span style="display:inline-block;vertical-align:middle;text-align:center;line-height:1;">'
          +'<span style="display:block;font-size:34px;color:#0CA678;">'+hund+'</span>'
          +'<span style="display:block;height:4px;background:#1B3A57;border-radius:2px;margin:2px 0;"></span>'
          +'<span style="display:block;font-size:34px;color:#1565C0;">100</span></span>'
        +'<span style="font-size:22px;color:#5a7894;">    (0.1이 '+tenths+'개, 0.01이 '+ones+'개)</span>';
      var q10=el.querySelector('[data-act="p10"]');
      if(q10){
        q10.disabled=hund>90; el.querySelector('[data-act="m10"]').disabled=hund<10;
        el.querySelector('[data-act="p1"]').disabled=hund>=100; el.querySelector('[data-act="m1"]').disabled=hund<=0;
      }
    }
    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
