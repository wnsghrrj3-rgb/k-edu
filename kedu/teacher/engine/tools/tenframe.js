/* ============================================================================
   케이랩 도구 모듈 — 십 배열판 (tenframe) v4
   초점 (1학년 수 감각·가르기모으기) = 10을 한눈에, 가르고 모으기.
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
   v4: 와우 F칸 (설계 카드) — ①직접 탭 채우기 ②10 완성→한 묶음으로 합쳐져
       십의 자리로 톡 올라감(받아올림 마법모먼트) ③채우기 tap·묶음 pop+whoosh.
       (기존 로직 전부 보존 — 위에 얹는 레이어. "비주얼 대수술 X" 헌법 6장 준수.)
   - 의존: window.KLab (THREE 불필요)
   - config: { num(기본7), frames(기본2), max, grade:"low|mid|high",
               mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('tenframe', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ──
       저=한 판 보수 닻(유령 점)·퀴즈 숨김 / 중=두 판·가르기 명시·퀴즈 /
       고=기존 유지(config 우선·count/toTen 퀴즈). */
    var GRADES={
      low:  { modes:['free','mission'],        frames:1,   cap:10,   ghost:true,  toTenQuiz:false },
      mid:  { modes:['free','mission','quiz'], frames:2,   cap:20,   ghost:false, toTenQuiz:true  },
      high: { modes:['free','mission','quiz'], frames:null, cap:null, ghost:false, toTenQuiz:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function framesFor(){
      if(typeof config.frames==='number') return Math.max(1,Math.min(config.frames,3));
      return G().frames||2;
    }
    function capFor(){
      var fr=framesFor();
      if(typeof config.max==='number'&&config.max>0) return Math.min(config.max,fr*10);
      return (G().cap!=null)?Math.min(G().cap,fr*10):fr*10;
    }

    var frames=framesFor();
    var max=capFor();
    var num=Math.max(0,Math.min(config.num!=null?config.num:7,max));
    var blue={};
    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var bundleFx=false;   // 와우: 직전 조작에서 10묶음이 막 올라갔는가(1회 애니)

    // 와우: 점 수 변경의 단일 진입 — 효과음 + 10묶음(받아올림) 감지
    function setNum(nv){
      nv=Math.max(0,Math.min(nv,max));
      var oldT=Math.floor(num/10), nt=Math.floor(nv/10), up=nv>num;
      num=nv; bundleFx=false;
      if(nt>oldT){ bundleFx=true; snd('pop'); snd('whoosh'); }   // clamp(묶음) + 올라감
      else if(up){ snd('tap'); }                                  // tick(채우기)
      render();
    }

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      frames=framesFor(); max=capFor();
      if(G().modes.indexOf(mode)<0) mode='free';
      num=(mode==='mission')?0:Math.max(0,Math.min(config.num!=null?config.num:7,max));
      blue={}; mStep=0; mDone=false; mLock=false; bundleFx=false;
      if(mode==='quiz'){ qScore=0; qCount=0; newQuiz(); }
      build();
    }});

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS=[
      {text:'점을 정확히 <b style="color:#7048E8;">10개</b> 채워 한 판을 꽉 채워 봐요!', check:function(n,o){return n===10;}},
      {text:'점을 <b style="color:#7048E8;">7개</b>만 채워 봐요 — 빈 자리를 보면 <b style="color:#12B886;">3개</b>만 더 모으면 10!', check:function(n,o){return n===7;}},
      {text:'점 <b style="color:#7048E8;">5개</b>를 만들고, 점을 눌러 <b style="color:#FF8A3D;">주황 2개</b>로 갈라 봐요 (5 = 3과 2)', check:function(n,o){return n===5&&o===2;}}
    ];
    var MID_MISSIONS=[
      {text:'<b style="color:#7048E8;">8</b>을 만들고, 점을 눌러 <b style="color:#FF8A3D;">주황 3개</b>로 갈라 봐요 (8 = 5와 3)', check:function(n,o){return n===8&&o===3;}},
      {text:'<b style="color:#7048E8;">13</b>을 만들어 봐요 — 한 판을 꽉 채우면 10, 다음 판에 3개! (13 = 10과 3)', check:function(n,o){return n===13;}},
      {text:'<b style="color:#7048E8;">6</b>을 만들고 <b style="color:#FF8A3D;">반(3개)</b>을 주황으로 갈라 봐요 (6 = 3과 3)', check:function(n,o){return n===6&&o===3;}}
    ];
    var HIGH_MISSIONS=[
      {text:'점을 정확히 <b style="color:#7048E8;">10개</b> 채워 봐요!', check:function(n,o){return n===10;}},
      {text:'<b style="color:#7048E8;">8</b>을 만들고, 점을 눌러 <b style="color:#FF8A3D;">주황 3개</b>로 갈라 봐요 (8 = 5와 3)', check:function(n,o){return n===8&&o===3;}},
      {text:'<b style="color:#7048E8;">13</b>을 만들어 봐요 — 한 판을 꽉 채우면 10이에요!', check:function(n,o){return n===13;}},
      {text:'<b style="color:#7048E8;">6</b>을 만들고 <b style="color:#FF8A3D;">반(3개)</b>을 주황으로 갈라 봐요 (6 = 3과 3)', check:function(n,o){return n===6&&o===3;}}
    ];
    function curMissions(){
      var pool=(grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS;
      var f=pool.filter(function(m){
        // 13 미션은 두 판(max>=13) 필요
        if(/>13<|>13 /.test(m.text)||m.text.indexOf('13')>=0) return max>=13;
        return true;
      });
      return f.length?f:pool.slice(0,1);
    }
    var mStep=0, mDone=false, mLock=false;

    // ---- 퀴즈 상태 ----
    var qNum=0, qKind='count', qScore=0, qCount=0, qLock=false;
    function newQuiz(){
      var allowToTen=G().toTenQuiz;
      qKind=(allowToTen&&Math.random()<0.5)?'toTen':'count';
      if(qKind==='toTen'){ qNum=1+Math.floor(Math.random()*9); }          // 1~9
      else { qNum=3+Math.floor(Math.random()*Math.min(max,17)); }          // 3~max
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
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', ctrl='', foot='';
      /* 케이랩 2.0 — 조작 버튼은 하단 독 한 곳 (pri 1개, 나머지 중립) */
      var ctrlBtns=ui.dock([
        {act:'minus', label:'－ 점', cls:'tf-btn'},
        {act:'plus',  label:'＋ 점', cls:'tf-btn', kind:'pri'},
        {act:'reset', label:'↺',    cls:'tf-btn', kind:'ghost'}
      ]);
      if(mode==='mission'){
        var _M=curMissions();
        bar=mDone?ui.doneBar():ui.missionBar(_M[mStep].text,mStep,_M.length);
        ctrl=ctrlBtns;
      } else if(mode==='quiz'){
        bar=ui.quizBar(qKind==='count'?'점이 모두 몇 개일까요?':'10이 되려면 몇 개 더 필요할까요?',qScore,qCount);
        foot=ui.choices(quizChoices());
      } else {
        ctrl=ctrlBtns;
      }
      el.innerHTML='<style>.tf-btn:active,.kl-choice:active{transform:translateY(2px);}.tf-btn[disabled]{opacity:.35;cursor:not-allowed;}.tf-dot{cursor:pointer;transition:fill .15s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}.tf-dot:hover{transform:scale(1.08);}.tf-cell.tf-fillable{cursor:pointer;}.tf-cell.tf-fillable:hover{fill:rgba(112,72,232,0.12);}.kl-choice:hover{border-color:var(--kl-accent);color:var(--kl-accent);}'
        +'@keyframes tfRise{0%{transform:translateY(78px) scale(.55);opacity:0;}55%{opacity:1;}100%{transform:translateY(0) scale(1);opacity:1;}}'
        +'.tf-rise{animation:tfRise .6s cubic-bezier(.2,1.5,.35,1) both;transform-origin:center;transform-box:fill-box;}'
        +'@keyframes tfFlash{0%{opacity:0;transform:translateY(8px);}18%{opacity:1;transform:translateY(0);}78%{opacity:1;}100%{opacity:0;}}'
        +'.tf-flash{animation:tfFlash 1.5s ease both;}</style>'
        +top+bar
        +'<div class="kl-stage-host" style="position:relative;"><div class="tf-stage" style="width:100%;height:'+(mode==='quiz'?'40vh':'46vh')+';min-height:300px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +(ctrl||'')
        +foot
        +'<div class="tf-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){mode=m;blue={};mStep=0;mDone=false;bundleFx=false;
        if(m==='quiz'){qScore=0;qCount=0;newQuiz();} else {num=(m==='mission')?0:Math.max(0,Math.min(config.num!=null?config.num:7,max));}
        build();});
      bind(); bands.bind(el); render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=860,VBH=360;

    // 와우: 십의 자리 선반 — 완성된 10묶음 칩(받아올림의 결과)
    function drawShelf(svg,shownNum){
      var tens=Math.floor(shownNum/10);
      if(tens<=0) return;
      tens=Math.min(tens,frames);
      var cw=84, gap=18, totalW=cw*tens+gap*(tens-1), sx=(VBW-totalW)/2, sy=14;
      for(var t=0;t<tens;t++){
        var bx=sx+t*(cw+gap);
        var newest=(t===tens-1);
        var g=svgEl('g',{class:'tf-chip'+(bundleFx&&newest?' tf-rise':'')});
        g.appendChild(svgEl('rect',{x:bx,y:sy,width:cw,height:54,rx:13,fill:'#F3EFFE',stroke:'#7048E8','stroke-width':3}));
        // 미니 십틀(5×2 점) — "이게 10이다"
        for(var i=0;i<10;i++){
          var mc=bx+14+(i%5)*12.4, mr=sy+18+Math.floor(i/5)*16;
          g.appendChild(svgEl('circle',{cx:mc,cy:mr,r:4.2,fill:'#7048E8'}));
        }
        g.appendChild(svgEl('text',{x:bx+cw-16,y:sy+36,'font-size':26,'font-weight':800,fill:'#7048E8','text-anchor':'middle','font-family':'inherit'}));
        g.lastChild.textContent='10';
        svg.appendChild(g);
      }
      // 받아올림 안내 플래시(1회)
      if(bundleFx){
        var fl=svgEl('text',{x:VBW/2,y:96,'font-size':24,'font-weight':800,fill:'#7048E8','text-anchor':'middle','font-family':'inherit',class:'tf-flash'});
        fl.textContent='받아올림! 10이 한 묶음으로 올라갔어요 ↑';
        svg.appendChild(fl);
      }
    }

    function render(){
      var stage=el.querySelector('.tf-stage'); stage.innerHTML='';
      var shownNum=(mode==='quiz')?qNum:num;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="tfSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var shown=Math.max(1,Math.min(Math.ceil(shownNum/10)||1,frames)); if(shownNum===0)shown=1;
      if(mode==='quiz'&&qKind==='toTen')shown=1;
      // 저학년 보수 닻: 한 판(10)에서 빈 칸 유령 점 표시 → 첫 판은 항상 펼쳐 보임
      var ghost=(G().ghost && mode!=='quiz');
      if(ghost) shown=Math.max(shown,1);
      var fillable=(mode!=='quiz');   // 와우: 빈 칸 직접 탭 채우기 가능 여부
      var cell=56, fw=cell*5, fh=cell*2, gap=40;
      var totalW=fw*shown+gap*(shown-1), x0=(VBW-totalW)/2, y0=(VBH-fh)/2-10+18, gk=0;
      // 십의 자리 선반(완성된 10묶음) — 받아올림 마법모먼트의 결과
      if(mode!=='quiz') drawShelf(svg,shownNum);
      for(var f=0;f<shown;f++){
        var fx=x0+f*(fw+gap);
        for(var r=0;r<2;r++)for(var c=0;c<5;c++){
          var cxp=fx+c*cell, cyp=y0+r*cell;
          var empty=(gk>=shownNum);
          svg.appendChild(svgEl('rect',{x:cxp,y:cyp,width:cell,height:cell,fill:'rgba(255,255,255,0.4)',stroke:'#9AB7D4','stroke-width':2,'stroke-dasharray':'5 5',class:'tf-cell'+(fillable&&empty?' tf-fillable':''),'data-cell':gk}));
          if(gk<shownNum){var orange=!!blue[gk];svg.appendChild(svgEl('circle',{cx:cxp+cell/2,cy:cyp+cell/2,r:cell*0.36,fill:orange?'#FF8A3D':'#1565C0',stroke:orange?'#C24E0E':'#0B447C','stroke-width':3,'data-gk':gk,class:'tf-dot',filter:'url(#tfSh)'}));}
          else if(ghost&&f===0&&gk<10){svg.appendChild(svgEl('circle',{cx:cxp+cell/2,cy:cyp+cell/2,r:cell*0.30,fill:'none',stroke:'#BFD4EA','stroke-width':3,'stroke-dasharray':'4 5','data-ghost':gk,'pointer-events':'none'}));}
          gk++;
        }
        svg.appendChild(svgEl('rect',{x:fx,y:y0,width:fw,height:fh,fill:'none',stroke:'#5a7894','stroke-width':3,rx:8,'pointer-events':'none'}));
      }
      stage.appendChild(svg);
      if(mode!=='quiz'){
        // 점 탭 = 파랑↔주황 가르기 (기존)
        stage.querySelectorAll('.tf-dot').forEach(function(p){p.addEventListener('click',function(){var k=+p.dataset.gk;blue[k]=!blue[k];render();});});
        // 와우 ①직접조작: 빈 칸 탭 = 그 자리까지 점 채우기
        stage.querySelectorAll('.tf-cell.tf-fillable').forEach(function(rc){rc.addEventListener('click',function(){var k=+rc.dataset.cell; if(k>=shownNum) setNum(k+1);});});
      }
      var oc=0;for(var k in blue)if(blue[k]&&k<shownNum)oc++;var bc=shownNum-oc;
      var st=el.querySelector('.tf-status');
      if(mode==='quiz'){ st.innerHTML='<span style="font-size:22px;color:#5a7894;">아래에서 답을 골라 누르세요</span>'; }
      else{
        var toTen=(shownNum<10)?(10-shownNum):(shownNum<20?20-shownNum:0);
        if(G().ghost){
          // 저학년 일상어 닻: 빈 자리(보수)를 초록으로 또렷이
          st.innerHTML='<span style="font-size:46px;color:#1565C0;">'+shownNum+'</span>'
            +'<span style="font-size:26px;color:#1B3A57;">개</span>'
            +(oc>0?'<span style="font-size:24px;color:#1B3A57;">  ＝ </span><span style="font-size:34px;color:#1565C0;">'+bc+'</span><span style="font-size:24px;color:#1B3A57;">과 </span><span style="font-size:34px;color:#FF8A3D;">'+oc+'</span><span style="font-size:24px;color:#1B3A57;">을 모으면 '+shownNum+'</span>':'')
            +(shownNum<10?'<div style="font-size:26px;margin-top:6px;color:#12B886;">빈 칸을 눌러 채워 봐요 — '+toTen+'개만 더 모으면 <b>10</b>!</div>':(shownNum===10?'<div style="font-size:26px;margin-top:6px;color:#0CA678;">한 판 꽉 찼어요 — 10이 한 묶음!</div>':''));
        } else {
          st.innerHTML='<span style="font-size:46px;color:#1565C0;">'+shownNum+'</span>'
            +(oc>0?'<span style="font-size:26px;color:#1B3A57;"> ＝ </span><span style="font-size:36px;color:#1565C0;">'+bc+'</span><span style="font-size:26px;color:#1B3A57;">(파랑) 와 </span><span style="font-size:36px;color:#FF8A3D;">'+oc+'</span><span style="font-size:26px;color:#1B3A57;">(주황)</span>':'')
            +(toTen>0?'<span style="font-size:22px;color:#5a7894;">    10까지 '+toTen+'개 더</span>':(shownNum%10===0&&shownNum>0?'<span style="font-size:22px;color:#0CA678;">    꽉 찼어요 — 윗자리로 한 묶음!</span>':''));
        }
        var p=el.querySelector('[data-act="plus"]'), m=el.querySelector('[data-act="minus"]');
        if(p)p.disabled=num>=max; if(m)m.disabled=num<=0;
      }
      checkMission(oc);
    }

    function checkMission(orangeCount){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check(num,orangeCount)){
        mLock=true;
        window.KLab.ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<curMissions().length-1){mStep++;num=0;blue={};bundleFx=false;}
          else mDone=true;
          build();
        },1500);
      }
    }

    function bind(){
      var p=el.querySelector('[data-act="plus"]'), m=el.querySelector('[data-act="minus"]'), r=el.querySelector('[data-act="reset"]');
      if(p)p.addEventListener('click',function(){if(num<max){setNum(num+1);}});
      if(m)m.addEventListener('click',function(){if(num>0){delete blue[num-1];setNum(num-1);}});
      if(r)r.addEventListener('click',function(){num=(mode==='mission')?0:(config.num!=null?config.num:7);blue={};bundleFx=false;render();});
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
    if(mode==='mission'){num=0;blue={};}
    build();
    return function cleanup(){};
  });
})();
