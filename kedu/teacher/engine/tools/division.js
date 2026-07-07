/* ============================================================================
   케이랩 도구 모듈 — 나눗셈 모형 (division) v3 + 학년칸
   초점 (3학년 나눗셈) = 똑같이 나누어 담기를 눈으로.
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 등분제(몇 묶음으로)만·작은 수·"한 묶음에 N개씩!" 일상어 닻
            ·÷ 기호식·포함제·나머지·퀴즈 숨김.
     · 중 = 포함제(몇 개씩) 추가·나머지·÷ 식·퀴즈(몫).
     · 고 = 기존 전부 유지(나머지 퀴즈·큰 수 30).
   - 의존: window.KLab (THREE 불필요)
   - config: { total(기본12), groups(기본3), size(기본4),
               mode, divMode:"partition"|"quotition", grade:"low|mid|high" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('division', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음
    var prevRem=-1; // 나머지 등장 감지(마법모먼트 1회 플래시)

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES={
      low:  { modes:['free','mission'],        maxTotal:12, quotition:false, eqSign:false, quiz:false, askRem:false },
      mid:  { modes:['free','mission','quiz'], maxTotal:20, quotition:true,  eqSign:true,  quiz:true,  askRem:false },
      high: { modes:['free','mission','quiz'], maxTotal:30, quotition:true,  eqSign:true,  quiz:true,  askRem:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function maxTotal(){ return G().maxTotal; }

    var total=Math.min(config.total||12,maxTotal());
    var groups=Math.max(1,config.groups||3);
    var size=Math.max(1,config.size||4);
    var dMode=(G().quotition&&(config.divMode==='quotition'||config.mode==='quotition'))?'quotition':'partition';
    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var btn='font-size:24px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:22px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      if(!G().quotition) dMode='partition';
      total=Math.min(config.total||12,maxTotal()); groups=config.groups||3; size=config.size||4;
      mStep=0; mDone=false; mLock=false;
      if(mode==='quiz'){qScore=0;qCount=0;newQuiz();}
      build();
    }});

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS=[
      {text:'<b style="color:#7048E8;">12</b>개를 <b style="color:#7048E8;">3묶음</b>으로 똑같이 나눠 봐요! 한 묶음에 몇 개?',
        check:function(){return total===12&&groups===3;}},
      {text:'<b style="color:#7048E8;">8</b>개를 <b style="color:#7048E8;">4묶음</b>으로 똑같이 나눠 봐요!',
        check:function(){return total===8&&groups===4;}}
    ];
    var MID_MISSIONS=[
      {text:'<b style="color:#7048E8;">12</b>개를 <b style="color:#7048E8;">3묶음</b>으로 똑같이 나눠 봐요! (12 ÷ 3)',
        check:function(){return dMode==='partition'&&total===12&&groups===3;}},
      {text:'<b style="color:#C24E0E;">나머지</b>가 생기게 만들어 봐요! (똑 떨어지지 않게)',
        check:function(){var per=Math.floor(total/groups);return dMode==='partition'?(total-per*groups)>0:(total-size*Math.floor(total/size))>0;}},
      {text:'<b style="color:#7048E8;">[몇 개씩]</b>으로 바꾸고, <b style="color:#7048E8;">13</b>개를 <b style="color:#7048E8;">4개씩</b> 묶어 봐요!',
        check:function(){return dMode==='quotition'&&total===13&&size===4;}}
    ];
    var HIGH_MISSIONS=[
      {text:'<b style="color:#7048E8;">12</b>개를 <b style="color:#7048E8;">3묶음</b>으로 똑같이 나눠 봐요! (12 ÷ 3)',
        check:function(){return dMode==='partition'&&total===12&&groups===3;}},
      {text:'<b style="color:#C24E0E;">나머지</b>가 생기게 만들어 봐요! (똑 떨어지지 않게)',
        check:function(){var per=Math.floor(total/groups);return dMode==='partition'?(total-per*groups)>0:(total-size*Math.floor(total/size))>0;}},
      {text:'<b style="color:#7048E8;">[몇 개씩]</b>으로 바꾸고, <b style="color:#7048E8;">13</b>개를 <b style="color:#7048E8;">4개씩</b> 묶어 봐요 — 몇 묶음에 몇 개가 남나요?',
        check:function(){return dMode==='quotition'&&total===13&&size===4;}},
      {text:'나머지가 <b style="color:#0CA678;">0</b>이 되게 (똑 떨어지게) 만들어 봐요!',
        check:function(){var per=Math.floor(total/groups);var rem=dMode==='partition'?(total-per*groups):(total-size*Math.floor(total/size));return rem===0&&total>1;}}
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0, mDone=false, mLock=false;

    // ---- 퀴즈 (중·고만) ----
    var qT=12,qG=3,qAsk='quot',qScore=0,qCount=0,qLock=false;
    function newQuiz(){
      qG=2+Math.floor(Math.random()*4);                  // 2~5
      var quot=2+Math.floor(Math.random()*4);            // 2~5
      var rem=Math.floor(Math.random()*qG);              // 0~qG-1
      qT=qG*quot+rem;
      qAsk=(G().askRem&&rem>0&&Math.random()<0.45)?'rem':'quot';
      qLock=false;
    }
    function qAnswer(){return qAsk==='quot'?Math.floor(qT/qG):(qT%qG);}
    function quizChoices(){
      var ans=qAnswer(),set={},out=[ans];set[ans]=1;
      while(out.length<4){var d=ans+(Math.floor(Math.random()*5)-2);if(d>=0&&d<=12&&!set[d]){set[d]=1;out.push(d);}}
      out.sort(function(a,b){return a-b;});
      return out.map(function(v){return {v:v};});
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      var ctrl='<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">전체</span>'
        +'<button class="dv-btn" data-act="tm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="dv-btn" data-act="tp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +(dMode==='partition'
          ?'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">묶음 수</span><button class="dv-btn" data-act="gm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="dv-btn" data-act="gp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
          :'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">한 묶음 개수</span><button class="dv-btn" data-act="sm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="dv-btn" data-act="sp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>')
        +'<span style="width:8px;"></span><button class="dv-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      var tgs=G().quotition
        ?'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="dv-tg" data-mode="partition" style="'+tg+'">몇 묶음으로</button>'
          +'<button class="dv-tg" data-mode="quotition" style="'+tg+'">몇 개씩</button></div>':'';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=tgs+'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrl+'</div>'; }
      else if(mode==='quiz'){
        bar=ui.quizBar(qAsk==='quot'
          ?(qT+'개를 '+qG+'묶음으로 똑같이 나누면 한 묶음에 몇 개?')
          :(qT+'개를 '+qG+'묶음으로 나누면 나머지는 몇 개?'),qScore,qCount);
        foot=ui.choices(quizChoices());
      }
      else body=tgs+'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrl+'</div>';
      el.innerHTML='<style>.dv-btn:active,.dv-tg:active,.kl-choice:active{transform:translateY(2px);}.dv-btn[disabled]{opacity:.35;cursor:not-allowed;}.dv-tg.on{background:#7048E8 !important;color:#fff !important;}'
        +'.dv-rem-pop{animation:dvRemPop .6s cubic-bezier(.2,1.5,.4,1) both;transform-origin:center;transform-box:fill-box;}@keyframes dvRemPop{0%{transform:scale(0) translateY(-16px);opacity:0;}60%{transform:scale(1.3);opacity:1;}100%{transform:scale(1);opacity:1;}}'
        +'.dv-flash{animation:dvFlashKf 1.7s ease both;}@keyframes dvFlashKf{0%{opacity:0;}14%{opacity:1;}80%{opacity:1;}100%{opacity:0;}}'
        +'.kl-choice:hover{background:#1565C0 !important;color:#fff !important;}</style>'
        +top+bar+body
        +'<div class="kl-stage-host" style="position:relative;"><div class="dv-stage" style="width:100%;height:'+(mode==='quiz'?'42vh':'48vh')+';min-height:310px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +foot
        +'<div class="dv-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      el.querySelectorAll('.dv-tg').forEach(function(b){b.classList.toggle('on',b.dataset.mode===dMode);});
      ui.bindModeTabs(el,function(m){mode=m;mStep=0;mDone=false;
        if(!G().quotition)dMode='partition';
        if(m==='quiz'){qScore=0;qCount=0;newQuiz();}
        build();});
      bind(); render(); bands.bind(el);
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=880,VBH=380;
    function render(opts){
      opts=opts||{};
      var stage=el.querySelector('.dv-stage'); stage.innerHTML='';
      var T,G2,S,isQuiz=(mode==='quiz');
      if(isQuiz){T=qT;G2=qG;S=null;}
      else{T=total;G2=groups;S=size;}
      var useMode=isQuiz?'partition':dMode;
      var g=(useMode==='partition')?G2:Math.max(1,Math.ceil(T/S));
      var per=(useMode==='partition')?Math.floor(T/G2):S;
      var rem=(useMode==='partition')?(T-per*G2):(T-S*(Math.floor(T/S)));
      var nb=(useMode==='partition')?G2:Math.floor(T/S);
      if(useMode==='quotition'){g=nb+(rem>0?1:0); if(g<1)g=1;}
      // 와우 ③④: 분배 drop / 나머지 tick + 나머지 새로 생기면 마법모먼트 플래시
      var doFlash=false;
      if(!isQuiz && opts.act==='dist'){
        snd('pop');                                   // 분배(drop)
        if(rem>0){ snd('tap'); if(rem!==prevRem) doFlash=true; }  // 나머지(tick) + 등장 플래시
      }
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="dvSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var cols=Math.min(g,5), rows=Math.ceil(g/cols);
      var bw=Math.min((VBW-80)/cols-16, 240), bh=Math.min((VBH-60)/rows-16, 150);
      var x0=(VBW-(bw+16)*cols+16)/2, y0=(VBH-(bh+16)*rows+16)/2;
      var hide=(isQuiz&&qAsk==='quot');
      for(var gi=0;gi<g;gi++){
        var col=gi%cols, row=Math.floor(gi/cols), bx=x0+col*(bw+16), by=y0+row*(bh+16);
        svg.appendChild(svgEl('rect',{x:bx,y:by,width:bw,height:bh,rx:14,fill:'rgba(255,255,255,0.5)',stroke:'#1565C0','stroke-width':3,filter:'url(#dvSh)'}));
        if(hide){
          var tq=svgEl('text',{x:bx+bw/2,y:by+bh/2+12,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':40,'font-weight':800,fill:'#F59F00'});tq.textContent='?';svg.appendChild(tq);
          continue;
        }
        var inThis=(useMode==='partition')?per:(gi<nb?S:rem);
        for(var b=0;b<inThis;b++){
          var pc=b%5, pr=Math.floor(b/5);
          var dotR=Math.min(bw/12,bh/8,15);
          var dx=bx+18+pc*(dotR*2+6)+dotR, dy=by+18+pr*(dotR*2+6)+dotR;
          svg.appendChild(svgEl('circle',{cx:dx,cy:dy,r:dotR,fill:'#12B886',stroke:'#0B7A5C','stroke-width':2}));
        }
      }
      if(useMode==='partition'&&rem>0&&!hide){
        for(var rr=0;rr<rem;rr++){var dotR2=13,dx2=VBW-50,dy2=40+rr*(dotR2*2+6)+dotR2;svg.appendChild(svgEl('circle',{cx:dx2,cy:dy2,r:dotR2,fill:'#FF8A3D',stroke:'#C24E0E','stroke-width':2,class:(doFlash?'dv-rem-pop':'')}));}
        var tl=svgEl('text',{x:VBW-50,y:30,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:'#C24E0E'});tl.textContent=(G().eqSign?'나머지':'남은 것');svg.appendChild(tl);
      }
      if(doFlash){
        var fx=svgEl('text',{x:VBW/2,y:24,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':23,'font-weight':800,fill:'#C24E0E',class:'dv-flash'});
        fx.textContent='어! '+rem+'개가 어디에도 못 들어가 따로 남았어요 (나머지 '+rem+')';
        svg.appendChild(fx);
      }
      if(!isQuiz) prevRem=rem;
      if(isQuiz){
        for(var i=0;i<qT;i++){var ddR=11,ddx=VBW/2-(qT*(ddR*2+5)-5)/2+i*(ddR*2+5)+ddR, ddy=8+ddR;
          svg.appendChild(svgEl('circle',{cx:ddx,cy:ddy,r:ddR,fill:'#1565C0',stroke:'#0B447C','stroke-width':2}));}
      }
      stage.appendChild(svg);
      var st=el.querySelector('.dv-status');
      if(isQuiz){ st.innerHTML='<span style="font-size:34px;color:#1565C0;">'+qT+'</span><span style="font-size:26px;"> ÷ </span><span style="font-size:34px;color:#1565C0;">'+qG+'</span><span style="font-size:26px;"> ＝ </span><span style="font-size:40px;color:#F59F00;">?</span>'+(qAsk==='rem'?'<span style="font-size:26px;color:#C24E0E;"> … 나머지 <b style="font-size:36px;">?</b></span>':''); }
      else if(!G().eqSign){
        // 저학년: ÷ 식 대신 일상어
        st.innerHTML='<span style="font-size:28px;color:#1B3A57;">한 묶음에 </span><span style="font-size:48px;color:#0CA678;">'+per+'</span><span style="font-size:28px;color:#1B3A57;">개씩!</span>'+(rem>0?'<span style="font-size:24px;color:#C24E0E;"> (남은 '+rem+'개)</span>':'<span style="font-size:24px;color:#0CA678;"> 똑같이 나눠졌어요!</span>');
      }
      else if(useMode==='partition'){
        st.innerHTML='<span style="font-size:40px;color:#1565C0;">'+T+'</span><span style="font-size:28px;"> ÷ </span><span style="font-size:40px;color:#1565C0;">'+G2+'</span><span style="font-size:28px;"> ＝ </span><span style="font-size:48px;color:#0CA678;">'+per+'</span>'+(rem>0?'<span style="font-size:26px;color:#C24E0E;"> … 나머지 '+rem+'</span>':'');
      } else {
        st.innerHTML='<span style="font-size:40px;color:#1565C0;">'+T+'</span><span style="font-size:28px;"> 을 </span><span style="font-size:40px;color:#1565C0;">'+S+'</span><span style="font-size:28px;">개씩 ＝ </span><span style="font-size:48px;color:#0CA678;">'+nb+'</span><span style="font-size:28px;">묶음</span>'+(rem>0?'<span style="font-size:26px;color:#C24E0E;"> … 나머지 '+rem+'</span>':'');
      }
      checkMission();
    }

    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true;
        window.KLab.ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1){mStep++;
            total=7;groups=3;size=4;
          }
          else mDone=true;
          build();
        },1500);
      }
    }

    function bind(){
      el.querySelectorAll('.dv-tg').forEach(function(b){b.addEventListener('click',function(){if(dMode!==b.dataset.mode){dMode=b.dataset.mode;build();}});});
      var H={tp:function(){if(total<maxTotal()){total++;render({act:'dist'});}},tm:function(){if(total>1){total--;render({act:'dist'});}},
        gp:function(){if(groups<10){groups++;render({act:'dist'});}},gm:function(){if(groups>1){groups--;render({act:'dist'});}},
        sp:function(){if(size<maxTotal()){size++;render({act:'dist'});}},sm:function(){if(size>1){size--;render({act:'dist'});}},
        reset:function(){total=Math.min(config.total||12,maxTotal());groups=config.groups||3;size=config.size||4;render();}};
      el.querySelectorAll('.dv-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return;qLock=true;
          var ok=(+b.dataset.v===qAnswer());
          qCount++;if(ok)qScore++;
          var full=Math.floor(qT/qG), rm=qT%qG;
          window.KLab.ui.toast(el,ok,ok?null:('🤔 '+qT+'÷'+qG+'='+full+(rm>0?' … '+rm:'')+'!'));
          b.style.background=ok?'#12B886':'#FF8A3D';b.style.color='#fff';b.style.borderColor=ok?'#12B886':'#FF8A3D';
          setTimeout(function(){newQuiz();build();},1600);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build();
    return function cleanup(){};
  });
})();
