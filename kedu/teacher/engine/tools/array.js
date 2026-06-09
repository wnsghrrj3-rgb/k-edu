/* ============================================================================
   케이랩 도구 모듈 — 곱셈 배열판 (array) v2
   초점 (2~4학년 곱셈) = 곱셈을 "몇 줄(행) × 한 줄에 몇 개(열)"의 배열로.
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 자유탐구 — 행·열 ＋/－, ⇄ 가로세로(교환법칙), 곱 자동 계산.
     · 미션 — "곱이 12가 되는 배열", "같은 곱 다른 배열 찾기", "⇄로 교환법칙
       확인" 등 단계 과제, 달성 자동 감지.
     · 퀴즈 — 배열을 보여 주고 "몇 × 몇? 곱은?" 선택지 출제 (수식은 가림).
   - 의존: window.KLab (THREE 불필요)
   - config: { rows(기본3), cols(기본4), maxR(기본10), maxC(기본10),
               shape:"dot"|"square", mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={topD:'#4DABF7',dot:'#1565C0',dotEdge:'#0B447C',empty:'#E7F1FB'};
  window.KLab.register('array', function (el, config) {
    var ui=window.KLab.ui;
    var maxR=(config.maxR>=1)?config.maxR:10, maxC=(config.maxC>=1)?config.maxC:10;
    var rows=Math.min(config.rows||3,maxR), cols=Math.min(config.cols||4,maxC);
    var shape=(config.shape==='square')?'square':'dot';
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    // ---- 미션 ----
    var mFound={}; // 미션2에서 찾은 (r,c) 기록
    var MISSIONS=[
      {text:'곱이 <b style="color:#7048E8;">12</b>가 되는 배열을 만들어 봐요!',
        check:function(){ if(rows*cols===12){mFound[rows+'x'+cols]=1;mFound[cols+'x'+rows]=1;return true;} return false;}},
      {text:'곱이 12가 되는 <b style="color:#7048E8;">다른 배열</b>도 찾아 봐요! (아까와 줄 수가 달라야 해요)',
        check:function(){ return rows*cols===12 && !mFound[rows+'x'+cols]; }},
      {text:'<b style="color:#0B7285;">⇄ 가로세로</b> 버튼을 눌러 보세요 — 곱이 그대로인가요? (교환법칙)',
        check:function(act){ return act==='swap'; }},
      {text:'곱이 <b style="color:#7048E8;">18</b>이 되는 배열을 만들어 봐요!',
        check:function(){ return rows*cols===18; }}
    ];
    var mStep=0, mDone=false, mLock=false;

    // ---- 퀴즈 ----
    var qR=3,qC=4,qScore=0,qCount=0,qLock=false;
    function newQuiz(){ qR=2+Math.floor(Math.random()*Math.min(maxR-1,5)); qC=2+Math.floor(Math.random()*Math.min(maxC-1,5)); qLock=false; }
    function quizChoices(){
      var ans=qR*qC,set={},out=[ans];set[ans]=1;
      var near=[ans+qR,ans-qR,ans+qC,ans-qC,ans+1,ans-1,ans+2];
      for(var i=0;i<near.length&&out.length<4;i++){var d=near[i];if(d>1&&!set[d]){set[d]=1;out.push(d);}}
      out.sort(function(a,b){return a-b;});
      return out.map(function(v){return {v:v};});
    }

    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', ctrl='', foot='';
      var ctlHtml='<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">줄(행)</span>'
        +'<button class="ar-btn" data-act="rm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="ar-btn" data-act="rp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">한 줄 개수(열)</span>'
        +'<button class="ar-btn" data-act="cm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="ar-btn" data-act="cp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<button class="ar-btn" data-act="swap" style="'+btn+'background:#fff;color:#0B7285;border-color:#0B7285;">⇄ 가로세로</button>'
        +'<button class="ar-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); ctrl=ctlHtml; }
      else if(mode==='quiz'){ bar=ui.quizBar('이 배열의 곱은 얼마일까요?',qScore,qCount); foot=ui.choices(quizChoices()); }
      else ctrl=ctlHtml;
      el.innerHTML='<style>.ar-btn:active,.kl-choice:active{transform:translateY(2px);}.ar-btn[disabled]{opacity:.35;cursor:not-allowed;}'
        +'.ar-cell{transition:transform .2s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}.kl-choice:hover{background:#1565C0 !important;color:#fff !important;}</style>'
        +top+bar
        +(ctrl?'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'+ctrl+'</div>':'')
        +'<div class="kl-stage-host" style="position:relative;"><div class="ar-stage" style="width:100%;height:'+(mode==='quiz'?'42vh':'50vh')+';min-height:330px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +foot
        +'<div class="ar-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){mode=m;mStep=0;mDone=false;mFound={};
        if(m==='quiz'){qScore=0;qCount=0;newQuiz();}
        build();});
      bind(); render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=440;
    function render(){
      var stage=el.querySelector('.ar-stage'); stage.innerHTML='';
      var R=(mode==='quiz')?qR:rows, Co=(mode==='quiz')?qC:cols;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="arSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.22"/></filter>'
        +'<linearGradient id="arG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.topD+'"/><stop offset="1" stop-color="'+C.dot+'"/></linearGradient>';svg.appendChild(d);
      var padX=80,padY=50,areaW=VBW-padX*2,areaH=VBH-padY*2;
      var cw=areaW/Co, ch=areaH/R, s=Math.min(cw,ch,86), size=s*0.66;
      var gridW=s*Co, gridH=s*R, x0=(VBW-gridW)/2, y0=(VBH-gridH)/2;
      var g=svgEl('g',{filter:'url(#arSh)'});
      for(var r=0;r<R;r++)for(var c=0;c<Co;c++){
        var cx=x0+c*s+s/2, cy=y0+r*s+s/2;
        if(shape==='square') g.appendChild(svgEl('rect',{x:cx-size/2,y:cy-size/2,width:size,height:size,rx:8,fill:'url(#arG)',stroke:'#fff','stroke-width':3,class:'ar-cell'}));
        else g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:size/2,fill:'url(#arG)',stroke:C.dotEdge,'stroke-width':3,class:'ar-cell'}));
      }
      svg.appendChild(g);
      stage.appendChild(svg);
      var st=el.querySelector('.ar-status');
      if(mode==='quiz'){
        st.innerHTML='<span style="font-size:34px;color:#1565C0;">'+qR+'</span><span style="font-size:26px;color:#1B3A57;"> 줄 × 한 줄 </span><span style="font-size:34px;color:#1565C0;">'+qC+'</span><span style="font-size:26px;color:#1B3A57;">개 ＝ </span><span style="font-size:40px;color:#F59F00;">?</span>';
      } else {
        st.innerHTML='<span style="font-size:38px;color:#1565C0;">'+rows+'</span>'
          +'<span style="font-size:28px;color:#1B3A57;"> 줄 × 한 줄 </span>'
          +'<span style="font-size:38px;color:#1565C0;">'+cols+'</span>'
          +'<span style="font-size:28px;color:#1B3A57;">개 ＝ </span>'
          +'<span style="font-size:30px;color:#0CA678;">'+rows+' × '+cols+' ＝ </span>'
          +'<span style="font-size:52px;color:#0CA678;">'+(rows*cols)+'</span>';
        var bp=el.querySelector('[data-act="rp"]');if(bp)bp.disabled=rows>=maxR;
        var bm=el.querySelector('[data-act="rm"]');if(bm)bm.disabled=rows<=1;
        var cp=el.querySelector('[data-act="cp"]');if(cp)cp.disabled=cols>=maxC;
        var cm=el.querySelector('[data-act="cm"]');if(cm)cm.disabled=cols<=1;
      }
    }

    function checkMission(act){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check(act)){
        mLock=true;
        window.KLab.ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1)mStep++; else mDone=true;
          build();
        },1500);
      }
    }

    function bind(){
      var H={rp:function(){if(rows<maxR){rows++;render();checkMission();}},rm:function(){if(rows>1){rows--;render();checkMission();}},
        cp:function(){if(cols<maxC){cols++;render();checkMission();}},cm:function(){if(cols>1){cols--;render();checkMission();}},
        swap:function(){var t=rows;rows=Math.min(cols,maxR);cols=Math.min(t,maxC);render();checkMission('swap');},
        reset:function(){rows=Math.min(config.rows||3,maxR);cols=Math.min(config.cols||4,maxC);render();}};
      el.querySelectorAll('.ar-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return;qLock=true;
          var ok=(+b.dataset.v===qR*qC);
          qCount++;if(ok)qScore++;
          window.KLab.ui.toast(el,ok,ok?null:('🤔 정답은 '+qR+'×'+qC+'='+(qR*qC)+'!'));
          b.style.background=ok?'#12B886':'#FF8A3D';b.style.color='#fff';b.style.borderColor=ok?'#12B886':'#FF8A3D';
          setTimeout(function(){newQuiz();build();},1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build();
    return function cleanup(){};
  });
})();
