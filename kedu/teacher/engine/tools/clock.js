/* ============================================================================
   케이랩 도구 모듈 — 시계 읽기 (clock) v1  [수학 · 1~2학년 · 3모드]
   초점 = 아날로그 시계를 직접 움직여 '몇 시 / 몇 시 30분 / 5분·1분 단위' 읽기.
     · 분침을 움직이면 시침이 비례해 따라간다 (핵심 오개념 직격:
       "7시 30분의 짧은바늘은 7과 8 사이!")
     · ＋1시간/＋5분/＋1분 버튼 → 시계와 디지털 읽기 즉시 연동.
     · 미션 4단계(정각→30분→5분→55분=N시 5분 전), 퀴즈 5문(바늘 보고 읽기).
   - 의존: window.KLab (THREE 불필요)
   - config: { h(기본 12), m(기본 0), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('clock', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var startM = (((config.h != null ? config.h : 12) % 12) * 60 + (config.m != null ? config.m : 0)) % 720;
    var tm = startM;                       // 0~719 (12시간), 시침·분침 모두 이 값으로 계산
    function hh(){ var h = Math.floor(tm/60)%12; return h===0?12:h; }
    function mm(){ return tm%60; }
    function timeStr(){ return hh()+'시'+(mm()===0?' 정각':' '+mm()+'분'); }

    var btn='font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'🕒 바늘을 움직여 <b style="color:#7048E8;">3시 정각</b>을 만들어 봐요!',
        check:function(){ return tm===180; } },
      { text:'🕢 이번엔 <b style="color:#7048E8;">7시 30분</b>! 짧은바늘이 7과 8 <b style="color:#7048E8;">사이</b>로 가는지 봐요!',
        check:function(){ return tm===450; } },
      { text:'⏱ <b style="color:#7048E8;">9시 5분</b> — 긴바늘이 숫자 1을 가리키면 5분이에요!',
        check:function(){ return tm===545; } },
      { text:'🕦 <b style="color:#7048E8;">11시 55분</b>을 만들어 봐요 — "12시 5분 전"이라고도 해요!',
        check:function(){ return tm===715; } }
    ];
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false; mStep++;
          if(mStep>=MISSIONS.length){ mDone=true; }
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

    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      var ctrl='<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        +'<button class="ck-btn" data-d="-60" style="'+btn+'background:#fff;color:#1565C0;">－1시간</button>'
        +'<button class="ck-btn" data-d="60" style="'+btn+'background:#1565C0;color:#fff;">＋1시간</button>'
        +'<span style="width:6px;"></span>'
        +'<button class="ck-btn" data-d="-5" style="'+btn+'background:#fff;color:#FF8A3D;border-color:#FF8A3D;">－5분</button>'
        +'<button class="ck-btn" data-d="5" style="'+btn+'background:#FF8A3D;color:#fff;border-color:#FF8A3D;">＋5분</button>'
        +'<span style="width:6px;"></span>'
        +'<button class="ck-btn" data-d="-1" style="'+btn+'background:#fff;color:#0CA678;border-color:#0CA678;">－1분</button>'
        +'<button class="ck-btn" data-d="1" style="'+btn+'background:#0CA678;color:#fff;border-color:#0CA678;">＋1분</button>'
        +'<span style="width:6px;"></span>'
        +'<button class="ck-btn" data-d="reset" style="font-size:23px;padding:12px 16px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>';
      if(mode==='mission'){
        bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      } else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        tm=q.tm; ctrl='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      el.innerHTML='<style>.ck-btn:active{transform:translateY(2px);}.kl-choice{min-width:130px !important;}</style>'
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
      el.querySelectorAll('.ck-btn').forEach(function(b){
        b.addEventListener('click',function(){
          if(b.dataset.d==='reset'){ tm=(mode==='mission')?0:startM; }
          else { tm=((tm + (+b.dataset.d))%720+720)%720; }
          render();
          if(mode==='mission')checkMission();
        });
      });
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

    function render(){
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
      // 시침(짧고 굵은 파랑)
      svg.appendChild(svgEl('line',{x1:cx-18*Math.sin(ha),y1:cy+18*Math.cos(ha),
        x2:cx+(R-105)*Math.sin(ha),y2:cy-(R-105)*Math.cos(ha),
        stroke:'#1565C0','stroke-width':14,'stroke-linecap':'round'}));
      // 분침(길고 가는 주황)
      svg.appendChild(svgEl('line',{x1:cx-22*Math.sin(ma),y1:cy+22*Math.cos(ma),
        x2:cx+(R-42)*Math.sin(ma),y2:cy-(R-42)*Math.cos(ma),
        stroke:'#FF8A3D','stroke-width':9,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:11,fill:'#1B3A57'}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:4.5,fill:'#fff'}));
      stage.appendChild(svg);

      var st=el.querySelector('.ck-status'); if(!st)return;
      if(mode==='quiz'){
        st.innerHTML='<div style="font-size:19px;color:#8aa0b6;">짧은바늘(파랑)=시, 긴바늘(주황)=분! 잘 보고 답을 골라요.</div>';
        return;
      }
      st.innerHTML='<span style="font-size:44px;color:#1565C0;">'+timeStr()+'</span>'
        +'<div style="font-size:17px;color:#5a7894;margin-top:5px;">짧은바늘(파랑)이 <b>시</b>, 긴바늘(주황)이 <b>분</b>이에요. 긴바늘이 한 바퀴(60분) 돌면 짧은바늘이 숫자 한 칸 움직여요.</div>';
    }

    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
