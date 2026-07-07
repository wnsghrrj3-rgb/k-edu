/* ============================================================================
   케이랩 도구 모듈 — 소수 모형 (decimal) v3 · 3모드 + 학년칸
   초점 (4학년 소수) = 전체(1)를 100칸 모눈으로 보아 소수 자릿값을 눈으로.
     · 10×10 모눈 = 1. 한 칸 = 0.01, 한 줄(10칸) = 0.1.
     · ＋0.1 / ＋0.01 또는 칸 클릭으로 채우기 → 소수·분수 동시 표시.
       "0.37 = 37/100" (소수 ⇄ 분수 연결).
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 0.1 단위만(한 줄=0.1)·★칸 클릭이 줄 전체를 채우는 0.1 스냅 신규 닻
            ·0.01 버튼·분수 표시·퀴즈 숨김 (일상어 "한 줄이 0.1").
     · 중 = 0.01 등장·소수⇄분수 연결·퀴즈(분수 포함 4문).
     · 고 = 기존 전부 유지(0.1·0.01·칸 클릭·분수·퀴즈 5문).
   - 의존: window.KLab (THREE 불필요)
   - config: { value(기본0.37), grade:"low|mid|high", mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('decimal', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음

    // 와우 ②④: hund(채운 칸) 변경 공통 진입 — 모눈이 꽉 차 1.0이 되면 10:1 교환 마법
    //   (0.1이 10개면 1 — 소수점 아래도 한 자리 위로 올라감, place_value와 같은 원리).
    function applyHund(newHund){
      var old=hund;
      hund=Math.max(0,Math.min(100,newHund));
      if(hund===old){ render({}); }
      else if(hund===100 && old<100){ snd('whoosh'); render({flash:true}); } // 자리 올림(슬라이드)
      else { snd('tap'); render({}); }                                       // 채우기 똑딱
      if(mode==='mission')checkMission();
    }

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ──
       저=0.1 단위·줄 스냅 닻(0.01·분수·퀴즈 숨김) / 중=0.01+분수+퀴즈 / 고=기존 유지. */
    var GRADES={
      low:  { modes:['free','mission'],        steps:[10],   frac:false, snap:true  },
      mid:  { modes:['free','mission','quiz'], steps:[10,1], frac:true,  snap:false },
      high: { modes:['free','mission','quiz'], steps:[10,1], frac:true,  snap:false }
    };
    var STEP_STYLE={ 10:{c:'#1565C0',label:'0.1'}, 1:{c:'#0CA678',label:'0.01'} };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var startH=Math.max(0,Math.min(Math.round((config.value!=null?config.value:0.37)*100),100));
    // 저학년 시작값은 0.1 단위로 스냅
    function snap01(v){ return Math.round(v/10)*10; }
    var hund=(grade==='low')?snap01(startH):startH; // 채운 칸 수 0~100
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false;
      hund=(mode==='mission')?0:((grade==='low')?snap01(startH):startH);
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS=[
      { text:'＋0.1 버튼으로 <b style="color:#7048E8;">0.3</b>을 만들어 봐요! (한 줄이 0.1 — 세 줄!)',
        check:function(){ return hund===30; } },
      { text:'한 줄씩 더 채워 <b style="color:#7048E8;">0.5</b>(절반)을 만들어요! (다섯 줄!)',
        check:function(){ return hund===50; } },
      { text:'모눈을 꽉 채워 <b style="color:#7048E8;">1</b>을 만들어요 — 0.1짜리 줄이 10개면 1!',
        check:function(){ return hund===100; } }
    ];
    var MID_MISSIONS=[
      { text:'＋0.1 버튼으로 <b style="color:#7048E8;">0.3</b>을 만들어 봐요! (한 줄 = 0.1)',
        check:function(){ return hund===30; } },
      { text:'이제 ＋0.01로 <b style="color:#7048E8;">0.34</b>까지! (한 칸 = 0.01)',
        check:function(){ return hund===34; } },
      { text:'모눈 칸을 직접 눌러 <b style="color:#7048E8;">0.5</b>(절반)를 만들어 봐요!',
        check:function(){ return hund===50; } },
      { text:'모눈을 꽉 채워 <b style="color:#7048E8;">1</b>을 만들어요 — 0.01이 100개면 1!',
        check:function(){ return hund===100; } }
    ];
    var HIGH_MISSIONS=MID_MISSIONS; // 고학년은 기존 4미션 유지
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ mLock=false; mStep++;
          if(mStep>=curMissions().length)mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (모눈을 보고 읽기) — g:'mid'=중·고 공통, 'high'=고학년만 ───────────── */
    var QUIZ_POOL=[
      { hund:37, q:'색칠한 모눈이 나타내는 소수는?', answer:'0.37', choices:['0.37','3.7','0.07'], g:'mid' },
      { hund:50, q:'모눈의 절반이 색칠됐어요. 소수로 나타내면?', answer:'0.5', choices:['0.5','0.05','5'], g:'mid' },
      { hund:3,  q:'세 칸만 색칠됐어요. 소수로 나타내면?', answer:'0.03', choices:['0.03','0.3','3'], g:'mid' },
      { hund:70, q:'색칠한 부분을 분수로 나타내면?', answer:'70/100', choices:['70/100','7/100','70/10'], g:'mid' },
      { hund:25, q:'0.1이 2개, 0.01이 5개인 수는?', answer:'0.25', choices:['0.25','0.52','2.5'], g:'high' }
    ];
    function curQuiz(){ return (grade==='high')?QUIZ_POOL.slice():QUIZ_POOL.filter(function(q){return q.g==='mid';}); }
    var qList=[],qIdx=0,qScore=0,qCount=0,qLock=false;
    function shuffleQuiz(){
      qList=curQuiz();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=qList[i];qList[i]=qList[j];qList[j]=t;}
      qIdx=0;qScore=0;qCount=0;
    }
    function shuffled(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

    function ctrlHTML(){
      var s='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">';
      G().steps.forEach(function(d){
        var sty=STEP_STYLE[d];
        s+='<button class="dc-btn" data-d="-'+d+'" style="'+btn+'background:#fff;color:'+sty.c+';border-color:'+sty.c+';">－'+sty.label+'</button>'
          +'<button class="dc-btn" data-d="'+d+'" style="'+btn+'background:'+sty.c+';color:#fff;border-color:'+sty.c+';">＋'+sty.label+'</button>'
          +'<span style="width:8px;"></span>';
      });
      s+='<button class="dc-btn" data-d="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button></div>';
      return s;
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', foot='';
      var ctrl=ctrlHTML();
      if(mode==='mission'){
        var _M=curMissions();
        bar=mDone?ui.doneBar():ui.missionBar(_M[mStep].text,mStep,_M.length);
      } else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        hund=q.hund; ctrl='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      el.innerHTML='<style>.dc-btn:active{transform:translateY(2px);}.dc-btn[disabled]{opacity:.35;cursor:not-allowed;}.dc-cell{cursor:pointer;transition:fill .12s;}.kl-choice{min-width:120px !important;}'
        +'.dc-fillable:hover{fill:rgba(112,72,232,0.16) !important;}'   /* 와우 ① 빈 칸 직접 채우기 어포던스 */
        +'.dc-flash{animation:dcFlashKf 1.6s ease both;}@keyframes dcFlashKf{0%{opacity:0;}15%{opacity:1;}80%{opacity:1;}100%{opacity:0;}}'   /* 와우 ④ 교환 배너 */
        +'.dc-merge{animation:dcMergeKf .8s ease both;}@keyframes dcMergeKf{0%{opacity:0;stroke-width:5;}40%{opacity:1;stroke-width:13;}100%{opacity:0;stroke-width:5;}}'   /* 와우 ④ 한 판=1 글로우 */
        +'</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="dc-stage" style="width:100%;height:'+(mode==='quiz'?'40vh':'50vh')+';min-height:'+(mode==='quiz'?'300':'350')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        + foot
        +'<div class="dc-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m2){
        mode=m2; mStep=0;mDone=false;mLock=false;
        hund=(m2==='mission')?0:((grade==='low')?snap01(startH):startH);
        if(m2==='quiz')shuffleQuiz();
        build();
      });
      bands.bind(el);
      var H={};
      G().steps.forEach(function(d){
        H[d]=function(){ applyHund(hund+d); };
        H[-d]=function(){ applyHund(hund-d); };
      });
      H.reset=function(){ hund=(mode==='mission')?0:((grade==='low')?snap01(startH):startH); render({}); if(mode==='mission')checkMission(); };
      el.querySelectorAll('.dc-btn').forEach(function(b){b.addEventListener('click',function(){
        var key=(b.dataset.d==='reset')?'reset':(+b.dataset.d);
        var f=H[key];if(f){f();}
      });});
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
    function render(opts){
      opts=opts||{};
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
        g.appendChild(svgEl('rect',{x:x0+c*cell,y:y0+r*cell,width:cell,height:cell,fill:fill,stroke:'#9AB7D4','stroke-width':1.5,'data-k':k,class:'dc-cell'+(!on&&mode!=='quiz'?' dc-fillable':'')}));
        k++;
      }
      g.appendChild(svgEl('rect',{x:x0,y:y0,width:grid,height:grid,fill:'none',stroke:'#0B447C','stroke-width':5,'pointer-events':'none'}));
      // 0.1 줄 구분 (굵은 가로선)
      for(var rr=1;rr<10;rr++) g.appendChild(svgEl('line',{x1:x0,y1:y0+rr*cell,x2:x0+grid,y2:y0+rr*cell,stroke:'#5a7894','stroke-width':rr%1===0?2:1,'pointer-events':'none'}));
      svg.appendChild(g);
      // ★저학년 닻: 채워진 0.1 줄마다 오른쪽에 "0.1" 막대 칩을 쌓아 "0.1을 세는" 표상
      if(grade==='low'){
        var rows=Math.floor(hund/10), cx=x0+grid+26, cw=66, ch=cell*0.74, gap=cell*0.26;
        for(var ri=0;ri<rows;ri++){
          var cy=y0+ri*cell+(cell-ch)/2;
          g.appendChild(svgEl('rect',{x:cx,y:cy,width:cw,height:ch,rx:8,fill:'#1565C0','pointer-events':'none'}));
          var lt=svgEl('text',{x:cx+cw/2,y:cy+ch/2,'text-anchor':'middle','dominant-baseline':'central','font-family':'Gowun Dodum,sans-serif','font-size':23,'font-weight':800,fill:'#fff'});
          lt.textContent='0.1'; g.appendChild(lt);
        }
      }
      stage.appendChild(svg);
      // 와우 ④ 마법모먼트 — 모눈이 꽉 차 1.0: 황금 글로우(한 판=1) + 10:1 교환 배너. 1회성(다음 render 자동 해제).
      if(opts.flash){
        svg.appendChild(svgEl('rect',{x:x0-5,y:y0-5,width:grid+10,height:grid+10,rx:7,fill:'none',stroke:'#F59F00','stroke-width':6,'pointer-events':'none',class:'dc-merge'}));
        var fg=svgEl('g',{class:'dc-flash','pointer-events':'none'});
        fg.appendChild(svgEl('rect',{x:VBW/2-292,y:2,width:584,height:34,rx:17,fill:'#7048E8',opacity:'0.96',filter:'url(#dcSh)'}));
        var fl=svgEl('text',{x:VBW/2,y:20,'text-anchor':'middle','dominant-baseline':'central','font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:'#fff'});
        fl.textContent='🔁 0.1이 10개 = 1! 소수점 아래도 10칸이 차면 1로 합쳐져요 (10 : 1 교환)';
        fg.appendChild(fl); svg.appendChild(fg);
      }
      if(mode!=='quiz'){
        stage.querySelectorAll('.dc-cell').forEach(function(p){p.addEventListener('click',function(){
          var nv=(grade==='low')?(Math.floor((+p.dataset.k)/10)+1)*10  // ★저학년: 줄 전체 채움(0.1 스냅)
                                :(+p.dataset.k)+1;
          applyHund(nv);
        });});
      }
      if(mode==='quiz'){
        statusEl.innerHTML='<div style="font-size:19px;color:#8aa0b6;">한 줄(10칸)=0.1, 한 칸=0.01! 색칠된 칸을 세어 답을 골라요.</div>';
        return;
      }
      var val, tenths=Math.floor(hund/10), ones=hund%10;
      if(grade==='low'){
        // 저학년: 0.1 단위 — 분수 숨김, "0.1이 N개"만
        val=(hund/100).toFixed(1);
        statusEl.innerHTML='<span style="font-size:50px;color:#1565C0;">'+val+'</span>'
          +'<span style="font-size:24px;color:#5a7894;">    (0.1짜리 줄이 '+tenths+'개!)</span>';
      } else {
        // 중·고: 소수 ⇄ 분수 연결
        val=(hund/100).toFixed(2);
        statusEl.innerHTML='<span style="font-size:50px;color:#1565C0;">'+val+'</span>'
          +'<span style="font-size:28px;color:#1B3A57;"> ＝ </span>'
          +'<span style="display:inline-block;vertical-align:middle;text-align:center;line-height:1;">'
            +'<span style="display:block;font-size:34px;color:#0CA678;">'+hund+'</span>'
            +'<span style="display:block;height:4px;background:#1B3A57;border-radius:2px;margin:2px 0;"></span>'
            +'<span style="display:block;font-size:34px;color:#1565C0;">100</span></span>'
          +'<span style="font-size:22px;color:#5a7894;">    (0.1이 '+tenths+'개, 0.01이 '+ones+'개)</span>';
      }
      // 버튼 비활성 가드 (현재 학년의 step만)
      G().steps.forEach(function(dd){
        var p=el.querySelector('[data-d="'+dd+'"]'), m=el.querySelector('[data-d="-'+dd+'"]');
        if(p)p.disabled=hund+dd>100; if(m)m.disabled=hund-dd<0;
      });
    }
    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
