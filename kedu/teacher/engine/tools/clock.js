/* ============================================================================
   케이랩 도구 모듈 — 시계 읽기 (clock) v2  [수학 · 1~2학년 · 3모드]
   초점 = 아날로그 시계를 직접 움직여 '몇 시 / 몇 시 30분 / 5분·1분 단위' 읽기.
     · 분침을 움직이면 시침이 비례해 따라간다 (핵심 오개념 직격).
   v2: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 정각·30분(½시간)만·★±30분 버튼 신규 닻(5분/1분 숨김)·퀴즈 숨김.
     · 중 = 5분 단위(±5분)·퀴즈.
     · 고 = 기존 전부 유지(1분 단위·"몇 분 전"·퀴즈 5문).
   - 의존: window.KLab (THREE 불필요)
   - config: { h(기본 12), m(기본 0), grade:"low|mid|high", mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('clock', function (el, config) {
    var ui = window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음
    var dragging=false, dragHour=0, lastMin=0; // 와우 ① 분침 직접 드래그

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ──
       저=정각·30분 닻(±30분, 퀴즈 숨김) / 중=5분 단위·퀴즈 / 고=기존 유지(1분·분 전). */
    var GRADES={
      low:  { modes:['free','mission'],        steps:[60,30]   },
      mid:  { modes:['free','mission','quiz'], steps:[60,5]    },
      high: { modes:['free','mission','quiz'], steps:[60,5,1]  }
    };
    var STEP_STYLE={ 60:{c:'#1565C0',label:'1시간'}, 30:{c:'#7048E8',label:'30분'}, 5:{c:'#FF8A3D',label:'5분'}, 1:{c:'#0CA678',label:'1분'} };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var startM = (((config.h != null ? config.h : 12) % 12) * 60 + (config.m != null ? config.m : 0)) % 720;
    var tm = startM;                       // 0~719 (12시간), 시침·분침 모두 이 값으로 계산
    function hh(){ var h = Math.floor(tm/60)%12; return h===0?12:h; }
    function mm(){ return tm%60; }
    function timeStr(){ return hh()+'시'+(mm()===0?' 정각':' '+mm()+'분'); }

    // 와우 ②④: tm 변경 공통 진입 — 분침이 한 바퀴 돌아 시(時)가 바뀌면 마법모먼트(톱니 연동).
    function applyTm(newTm, viaMinute){
      var oldH=Math.floor(tm/60), oldMin=tm%60;
      tm=((newTm%720)+720)%720;
      var newH=Math.floor(tm/60), newMin=tm%60;
      // 분침 한 바퀴 = 시가 바뀌었고, 그게 분침 회전(분값 변화) 때문일 때만
      var revolved=(newH!==oldH) && (newMin!==oldMin);
      if(revolved){ snd('select'); render({flash:true}); }   // 정시 도달 포함(분침 한 바퀴→시침 한 칸)
      else if(newMin!==oldMin || (viaMinute&&newTm!==oldH*60+oldMin)){ snd('tap'); render({}); } // 똑딱
      else { snd('tap'); render({}); }   // +1시간 등 순수 시 변경(분침 안 돔) — 피드백만, flash 금지
      if(mode==='mission')checkMission();
    }
    function step(delta){ applyTm(tm+delta, false); }

    var btn='font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false;
      tm=(mode==='mission')?0:startM;
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS=[
      { text:'🕒 바늘을 움직여 <b style="color:#7048E8;">3시 정각</b>을 만들어 봐요! (긴바늘이 12 위에!)',
        check:function(){ return tm===180; } },
      { text:'🕢 이번엔 <b style="color:#7048E8;">7시 30분</b>! 긴바늘이 6 아래로, 짧은바늘은 7과 8 <b>사이</b>!',
        check:function(){ return tm===450; } },
      { text:'🕘 <b style="color:#7048E8;">9시 정각</b>을 만들어 봐요!',
        check:function(){ return tm===540; } }
    ];
    var MID_MISSIONS=[
      { text:'🕒 바늘을 움직여 <b style="color:#7048E8;">3시 정각</b>을 만들어 봐요!',
        check:function(){ return tm===180; } },
      { text:'🕢 이번엔 <b style="color:#7048E8;">7시 30분</b>! 짧은바늘이 7과 8 <b>사이</b>로 가는지 봐요!',
        check:function(){ return tm===450; } },
      { text:'⏱ <b style="color:#7048E8;">9시 5분</b> — 긴바늘이 숫자 1을 가리키면 5분이에요!',
        check:function(){ return tm===545; } }
    ];
    var HIGH_MISSIONS=[
      { text:'🕒 바늘을 움직여 <b style="color:#7048E8;">3시 정각</b>을 만들어 봐요!',
        check:function(){ return tm===180; } },
      { text:'🕢 이번엔 <b style="color:#7048E8;">7시 30분</b>! 짧은바늘이 7과 8 <b style="color:#7048E8;">사이</b>로 가는지 봐요!',
        check:function(){ return tm===450; } },
      { text:'⏱ <b style="color:#7048E8;">9시 5분</b> — 긴바늘이 숫자 1을 가리키면 5분이에요!',
        check:function(){ return tm===545; } },
      { text:'🕦 <b style="color:#7048E8;">11시 55분</b>을 만들어 봐요 — "12시 5분 전"이라고도 해요!',
        check:function(){ return tm===715; } }
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false; mStep++;
          if(mStep>=curMissions().length){ mDone=true; }
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (시곗바늘을 보고 읽기) ───────────── */
    var QUIZ_POOL=[
      { tm:180, q:'시계가 가리키는 시각은 몇 시일까요?', answer:'3시',
        choices:['3시','12시 15분','9시'] },
      { tm:450, q:'짧은바늘이 7과 8 사이에 있어요. 지금 시각은?', answer:'7시 30분',
        choices:['7시 30분','8시 30분','7시 6분'] },
      { tm:545, q:'긴바늘이 숫자 1을 가리켜요. 지금 시각은?', answer:'9시 5분',
        choices:['9시 5분','9시 1분','1시 45분'] },
      { tm:0,   q:'긴바늘(분침)이 시계를 한 바퀴 돌면 시간이 얼마나 지날까요?', answer:'1시간 (60분)',
        choices:['1시간 (60분)','1분','12시간'] },
      { tm:255, q:'지금 시계가 가리키는 시각은?', answer:'4시 15분',
        choices:['4시 15분','4시 3분','3시 15분'] }
    ];
    var qList=[], qIdx=0, qScore=0, qCount=0, qLock=false;
    function shuffleQuiz(){
      qList=QUIZ_POOL.slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=qList[i];qList[i]=qList[j];qList[j]=t;}
      qIdx=0;qScore=0;qCount=0;
    }
    function shuffled(arr){
      var a=arr.slice();
      for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
      return a;
    }

    function ctrlHTML(){
      var s='<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">';
      G().steps.forEach(function(d){
        var sty=STEP_STYLE[d];
        s+='<button class="ck-btn" data-d="-'+d+'" style="'+btn+'background:#fff;color:'+sty.c+';border-color:'+sty.c+';">－'+sty.label+'</button>'
          +'<button class="ck-btn" data-d="'+d+'" style="'+btn+'background:'+sty.c+';color:#fff;border-color:'+sty.c+';">＋'+sty.label+'</button>'
          +'<span style="width:6px;"></span>';
      });
      s+='<button class="ck-btn" data-d="reset" style="font-size:23px;padding:12px 16px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button></div>';
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
        tm=q.tm; ctrl='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      el.innerHTML='<style>.ck-btn:active{transform:translateY(2px);}.kl-choice{min-width:130px !important;}'
        +'.ck-mhand{cursor:grab;}.ck-mhand:active{cursor:grabbing;}'   /* 와우 ① 분침 드래그 표식 */
        +'.ck-flash{animation:ckFlashKf 1.7s ease both;}@keyframes ckFlashKf{0%{opacity:0;}14%{opacity:1;}80%{opacity:1;}100%{opacity:0;}}'   /* 와우 ④ 마법 배너 */
        +'.ck-gear{animation:ckGearKf .8s ease both;}@keyframes ckGearKf{0%{stroke-width:14;}45%{stroke-width:22;stroke:#7048E8;}100%{stroke-width:14;}}'   /* 와우 ④ 시침 톱니 펄스 */
        +'</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="ck-stage" style="width:100%;height:'+(mode==='quiz'?'42vh':'48vh')+';min-height:'+(mode==='quiz'?'300':'330')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        + foot
        +'<div class="ck-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';

      ui.bindModeTabs(el,function(m2){
        mode=m2; mStep=0;mDone=false;mLock=false;
        tm=(m2==='mission')?0:startM;     // 미션은 12시 정각에서 시작
        if(m2==='quiz')shuffleQuiz();
        build();
      });
      bands.bind(el);
      el.querySelectorAll('.ck-btn').forEach(function(b){
        b.addEventListener('click',function(){
          if(b.dataset.d==='reset'){ tm=(mode==='mission')?0:startM; render({}); if(mode==='mission')checkMission(); }
          else step(+b.dataset.d);
        });
      });
      bindDrag();
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true; qCount++;
          var q=qList[qIdx], ok=(b.dataset.v===String(q.answer));
          if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){
            qIdx++; if(qIdx>=qList.length)shuffleQuiz();
            qLock=false; build();
          },1400);
        });
      });
      render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,f){var t=svgEl('text',{x:x,y:y,'text-anchor':'middle','dominant-baseline':'central','font-family':'Jua,sans-serif','font-size':sz,'font-weight':800,fill:f});t.textContent=s;svg.appendChild(t);}

    /* 와우 ① 분침 직접 드래그 — 스테이지 중심 기준 각도로 분(分) 산출, 한 바퀴 넘으면 시(時) 칸 이동 */
    function minuteFromEvent(e){
      var stage=el.querySelector('.ck-stage'); if(!stage)return null;
      var r=stage.getBoundingClientRect();
      var px=(e.clientX!=null)?e.clientX:(e.touches&&e.touches[0]?e.touches[0].clientX:null);
      var py=(e.clientY!=null)?e.clientY:(e.touches&&e.touches[0]?e.touches[0].clientY:null);
      if(px==null||py==null||!r.width)return null;
      var dx=px-(r.left+r.width/2), dy=py-(r.top+r.height/2);
      var ang=Math.atan2(dx,-dy); if(ang<0)ang+=2*Math.PI;
      return Math.round(ang/(2*Math.PI)*60)%60;
    }
    function dragStart(e){ if(mode==='quiz')return; dragging=true; dragHour=Math.floor(tm/60); lastMin=tm%60; if(e.preventDefault)e.preventDefault(); }
    function dragMove(e){
      if(!dragging)return;
      var minute=minuteFromEvent(e); if(minute==null)return;
      if(lastMin>=45 && minute<=15) dragHour=(dragHour+1)%12;        // 앞으로 한 바퀴
      else if(lastMin<=15 && minute>=45) dragHour=(dragHour+11)%12;  // 뒤로 한 바퀴
      lastMin=minute;
      applyTm(dragHour*60+minute, true);
      if(e.preventDefault)e.preventDefault();
    }
    function dragEnd(){ dragging=false; }
    function bindDrag(){
      var stage=el.querySelector('.ck-stage'); if(!stage)return;
      stage.addEventListener('pointerdown',dragStart);
      stage.addEventListener('pointermove',dragMove);
      stage.addEventListener('pointerup',dragEnd);
      stage.addEventListener('pointerleave',dragEnd);
      stage.addEventListener('touchstart',dragStart,{passive:false});
      stage.addEventListener('touchmove',dragMove,{passive:false});
      stage.addEventListener('touchend',dragEnd);
    }

    function render(opts){
      opts=opts||{};
      var stage=el.querySelector('.ck-stage'); if(!stage)return;
      stage.innerHTML='';
      var VB=440, cx=VB/2, cy=VB/2, R=185;
      var svg=svgEl('svg',{viewBox:'0 0 '+VB+' '+VB,width:'100%',height:'100%',style:'max-height:46vh;display:block;margin:0 auto;'});
      var d=svgEl('defs',{});
      d.innerHTML='<filter id="ckSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#13315C" flood-opacity="0.18"/></filter>'
        +'<radialGradient id="ckFace" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF3FC"/></radialGradient>';
      svg.appendChild(d);
      // 시계 몸통
      var g=svgEl('g',{filter:'url(#ckSh)'});
      g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:R+14,fill:'#1565C0'}));
      g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:R,fill:'url(#ckFace)',stroke:'#0B447C','stroke-width':3}));
      svg.appendChild(g);
      // 분 눈금 60개 (5분 단위 굵게)
      for(var i=0;i<60;i++){
        var a=i*6*Math.PI/180, big=(i%5===0);
        var r1=R-(big?20:11), r2=R-4;
        svg.appendChild(svgEl('line',{
          x1:cx+r1*Math.sin(a), y1:cy-r1*Math.cos(a),
          x2:cx+r2*Math.sin(a), y2:cy-r2*Math.cos(a),
          stroke:big?'#1B3A57':'#9DB2C8','stroke-width':big?4:2,'stroke-linecap':'round'}));
      }
      // 숫자 1~12 (큼직하게)
      for(var n=1;n<=12;n++){
        var an=n*30*Math.PI/180, nr=R-44;
        txt(svg, cx+nr*Math.sin(an), cy-nr*Math.cos(an), n, 34, '#1B3A57');
      }
      // 분(작은 글씨) 5·10·…·55 보조 표기 — 자유탐구/미션에서만 (퀴즈는 스스로 읽기)
      if(mode!=='quiz'){
        for(var n3=1;n3<=12;n3++){
          var a3=n3*30*Math.PI/180;
          txt(svg, cx+(R-78)*Math.sin(a3), cy-(R-78)*Math.cos(a3), (n3*5)%60, 15, '#FF8A3D');
        }
      }
      // 바늘 — 시침: tm 비례(분까지 반영), 분침: mm
      var ha=(tm/720)*2*Math.PI, ma=(mm()/60)*2*Math.PI;
      // 시침(짧고 굵은 파랑) — 마법모먼트엔 톱니 펄스(ck-gear)
      svg.appendChild(svgEl('line',{x1:cx-18*Math.sin(ha),y1:cy+18*Math.cos(ha),
        x2:cx+(R-105)*Math.sin(ha),y2:cy-(R-105)*Math.cos(ha),
        stroke:'#1565C0','stroke-width':14,'stroke-linecap':'round',class:(opts.flash?'ck-gear':'')}));
      // 분침(길고 가는 주황) — 비퀴즈 모드에선 잡고 돌리는 드래그 대상(ck-mhand)
      var mhClass=(mode!=='quiz')?'ck-mhand':'', mhStyle=(mode!=='quiz')?'cursor:grab;':'';
      svg.appendChild(svgEl('line',{x1:cx-22*Math.sin(ma),y1:cy+22*Math.cos(ma),
        x2:cx+(R-42)*Math.sin(ma),y2:cy-(R-42)*Math.cos(ma),
        stroke:'#FF8A3D','stroke-width':9,'stroke-linecap':'round',class:mhClass,style:mhStyle}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:11,fill:'#1B3A57'}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:4.5,fill:'#fff'}));
      // 와우 ④ 마법모먼트 배너 — 분침이 12를 지나 시침이 정확히 한 칸(톱니 연동). 1회성(다음 render 자동 해제).
      if(opts.flash){
        var fg=svgEl('g',{class:'ck-flash'});
        fg.appendChild(svgEl('rect',{x:14,y:4,width:VB-28,height:38,rx:19,fill:'#7048E8',opacity:'0.96',filter:'url(#ckSh)'}));
        var ft=svgEl('text',{x:cx,y:24,'text-anchor':'middle','dominant-baseline':'central','font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:'#fff'});
        ft.textContent='🔗 분침이 12를 지나 시침이 한 칸! 두 바늘이 톱니처럼 연동돼요';
        fg.appendChild(ft);
        svg.appendChild(fg);
      }
      stage.appendChild(svg);

      var st=el.querySelector('.ck-status'); if(!st)return;
      if(mode==='quiz'){
        st.innerHTML='<div style="font-size:19px;color:#8aa0b6;">짧은바늘(파랑)=시, 긴바늘(주황)=분! 잘 보고 답을 골라요.</div>';
        return;
      }
      var hint = (grade==='low')
        ? '긴바늘(주황)이 <b>12 위</b>면 정각, <b>6 아래</b>면 30분이에요!'
        : '짧은바늘(파랑)이 <b>시</b>, 긴바늘(주황)이 <b>분</b>이에요. 긴바늘이 한 바퀴(60분) 돌면 짧은바늘이 숫자 한 칸 움직여요.';
      st.innerHTML='<span style="font-size:44px;color:#1565C0;">'+timeStr()+'</span>'
        +'<div style="font-size:17px;color:#5a7894;margin-top:5px;">'+hint+'</div>'
        +'<div style="font-size:15px;color:#FF8A3D;margin-top:3px;font-weight:800;">✋ 긴바늘(주황)을 잡고 돌려 보세요 — 시침이 톱니처럼 따라와요</div>';
    }

    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
