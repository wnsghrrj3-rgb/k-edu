/* ============================================================================
   케이랩 도구 모듈 — 비와 비율 (ratio) v3 + 학년칸
   초점 (6학년 비와 비율) = 두 양의 비를 막대·띠로, 비율·백분율로.
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 두 양 비교(초록 N칸·주황 M칸 세기)·"더 많아요/똑같아요" 일상어 닻
            ·비 기호(A:B)·기약비·비율·백분율·퀴즈 숨김.
     · 중 = 비 A:B 표기·동치비(같은 비)·백분율·퀴즈(비 읽기).
     · 고 = 기존 전부 유지(비율 소수 A/B·퀴즈 5문).
   - 의존: window.KLab (THREE 불필요)
   - config: { a(기본2), b(기본3), max(기본12), grade:"low|mid|high", mode }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  function gcd(x,y){return y?gcd(y,x%y):x;}
  window.KLab.register('ratio', function (el, config) {
    var ui=window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES={
      low:  { modes:['free','mission'],        ratioSign:false, percent:false, ratioVal:false, quiz:false },
      mid:  { modes:['free','mission','quiz'], ratioSign:true,  percent:true,  ratioVal:false, quiz:true  },
      high: { modes:['free','mission','quiz'], ratioSign:true,  percent:true,  ratioVal:true,  quiz:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var max=config.max||12;
    var sa=Math.max(1,Math.min(config.a||2,max)), sb=Math.max(1,Math.min(config.b||3,max));
    var a=sa, b=sb;
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      a=sa; b=sb; mStep=0; mDone=false; mLock=false;
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS=[
      { text:'초록(A)을 주황(B)보다 <b style="color:#12B886;">많게</b> 만들어 봐요!',
        check:function(){ return a>b; } },
      { text:'초록과 주황을 <b style="color:#7048E8;">똑같이</b> 만들어 봐요!',
        check:function(){ return a===b; } }
    ];
    var MID_MISSIONS=[
      { text:'＋/－ 버튼으로 비 <b style="color:#7048E8;">2 : 3</b>을 만들어 봐요!',
        check:function(){ return a===2&&b===3; } },
      { text:'이번엔 <b style="color:#7048E8;">4 : 6</b>! 2:3과 <b style="color:#7048E8;">같은 비</b>예요 (둘 다 2배)',
        check:function(){ return a===4&&b===6; } },
      { text:'A와 B를 <b style="color:#7048E8;">똑같이</b> 만들어 봐요 — A가 전체의 50%!',
        check:function(){ return a===b; } }
    ];
    var HIGH_MISSIONS=[
      { text:'＋/－ 버튼으로 비 <b style="color:#7048E8;">2 : 3</b>을 만들어 봐요!',
        check:function(){ return a===2&&b===3; } },
      { text:'이번엔 <b style="color:#7048E8;">4 : 6</b>! 2:3과 <b style="color:#7048E8;">같은 비</b>예요 (둘 다 2배)',
        check:function(){ return a===4&&b===6; } },
      { text:'A와 B를 <b style="color:#7048E8;">똑같이</b> 만들어 봐요 — A가 전체의 50%!',
        check:function(){ return a===b; } },
      { text:'A가 전체의 <b style="color:#7048E8;">25%</b>가 되게 만들어 봐요! (B가 A의 3배)',
        check:function(){ return b===3*a; } }
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ mLock=false; mStep++;
          if(mStep>=M.length)mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (중·고만) ───────────── */
    var MID_QUIZ=[
      { a:2,b:3, q:'띠가 나타내는 비 A : B는?', answer:'2 : 3', choices:['2 : 3','3 : 2','2 : 5'] },
      { a:4,b:6, q:'이 비(4:6)를 가장 간단히 나타내면?', answer:'2 : 3', choices:['2 : 3','4 : 6','1 : 2'] },
      { a:5,b:5, q:'A(초록)는 전체의 몇 %일까요?', answer:'50%', choices:['50%','25%','100%'] },
      { a:3,b:3, q:'비 3 : 3과 같은 비는 무엇일까요?', answer:'1 : 1', choices:['1 : 1','3 : 1','1 : 3'] }
    ];
    var HIGH_QUIZ=[
      { a:2,b:3, q:'띠가 나타내는 비 A : B는?', answer:'2 : 3', choices:['2 : 3','3 : 2','2 : 5'] },
      { a:4,b:6, q:'이 비(4:6)를 가장 간단히 나타내면?', answer:'2 : 3', choices:['2 : 3','4 : 6','1 : 2'] },
      { a:5,b:5, q:'A(초록)는 전체의 몇 %일까요?', answer:'50%', choices:['50%','25%','100%'] },
      { a:1,b:3, q:'A(초록)는 전체의 몇 %일까요?', answer:'25%', choices:['25%','33%','75%'] },
      { a:3,b:3, q:'비 3 : 3과 같은 비는 무엇일까요?', answer:'1 : 1', choices:['1 : 1','3 : 1','1 : 3'] }
    ];
    function quizPool(){ return (grade==='mid')?MID_QUIZ:HIGH_QUIZ; }
    var qList=[],qIdx=0,qScore=0,qCount=0,qLock=false;
    function shuffleQuiz(){
      qList=quizPool().slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=qList[i];qList[i]=qList[j];qList[j]=t;}
      qIdx=0;qScore=0;qCount=0;
    }
    function shuffled(arr){var c=arr.slice();for(var i=c.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=c[i];c[i]=c[j];c[j]=t;}return c;}

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', foot='';
      var ctrl='<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        +'<span style="font-size:21px;font-weight:800;color:#12B886;align-self:center;">A(초록)</span>'
        +'<button class="rt-btn" data-act="am" style="'+btn+'background:#fff;color:#12B886;border-color:#12B886;">－</button>'
        +'<button class="rt-btn" data-act="ap" style="'+btn+'background:#12B886;color:#fff;border-color:#12B886;">＋</button>'
        +'<span style="width:10px;"></span>'
        +'<span style="font-size:21px;font-weight:800;color:#FF8A3D;align-self:center;">B(주황)</span>'
        +'<button class="rt-btn" data-act="bm" style="'+btn+'background:#fff;color:#FF8A3D;border-color:#FF8A3D;">－</button>'
        +'<button class="rt-btn" data-act="bp" style="'+btn+'background:#FF8A3D;color:#fff;border-color:#FF8A3D;">＋</button>'
        +'<span style="width:8px;"></span><button class="rt-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      +'</div>';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); }
      else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        a=q.a; b=q.b; ctrl='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      el.innerHTML='<style>.rt-btn:active{transform:translateY(2px);}.rt-btn[disabled]{opacity:.35;cursor:not-allowed;}.kl-choice{min-width:120px !important;}</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="rt-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'46vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        + foot
        +'<div class="rt-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m2){
        mode=m2; mStep=0;mDone=false;mLock=false;
        a=(m2==='mission')?1:sa; b=(m2==='mission')?1:sb;
        if(m2==='quiz')shuffleQuiz();
        build();
      });
      var H={ap:function(){if(a<max){a++;render();}},am:function(){if(a>1){a--;render();}},
        bp:function(){if(b<max){b++;render();}},bm:function(){if(b>1){b--;render();}},
        reset:function(){a=(mode==='mission')?1:sa;b=(mode==='mission')?1:sb;render();}};
      el.querySelectorAll('.rt-btn').forEach(function(bt){bt.addEventListener('click',function(){var f=H[bt.dataset.act];if(f){f();if(mode==='mission')checkMission();}});});
      el.querySelectorAll('.kl-choice').forEach(function(bt){
        bt.addEventListener('click',function(){
          if(qLock)return; qLock=true; qCount++;
          var q=qList[qIdx], ok=(bt.dataset.v===String(q.answer));
          if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ qIdx++; if(qIdx>=qList.length)shuffleQuiz(); qLock=false; build(); },1400);
        });
      });
      render(); bands.bind(el);
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,f,an){var t=svgEl('text',{x:x,y:y,'text-anchor':an||'middle','font-family':'Jua,sans-serif','font-size':sz,'font-weight':800,fill:f});t.textContent=s;svg.appendChild(t);}
    var VBW=860,VBH=320;
    function render(){
      var stage=el.querySelector('.rt-stage'), statusEl=el.querySelector('.rt-status');
      if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="rtSh" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.16"/></filter>';svg.appendChild(d);
      var unit=Math.min(56,(VBW-160)/(a+b)), x0=(VBW-unit*(a+b))/2;
      var g=svgEl('g',{filter:'url(#rtSh)'});
      for(var i=0;i<a;i++) g.appendChild(svgEl('rect',{x:x0+i*unit,y:100,width:unit,height:90,fill:'#12B886',stroke:'#fff','stroke-width':3}));
      for(var j=0;j<b;j++) g.appendChild(svgEl('rect',{x:x0+(a+j)*unit,y:100,width:unit,height:90,fill:'#FF8A3D',stroke:'#fff','stroke-width':3}));
      svg.appendChild(g);
      txt(svg,x0+unit*a/2,90,'A '+a,20,'#0B7A5C');
      txt(svg,x0+unit*a+unit*b/2,90,'B '+b,20,'#C24E0E');
      // 저학년 닻: 더 많은 쪽 위에 👑
      if(!G().ratioSign && mode!=='quiz' && a!==b){
        var more=a>b, mx=more?(x0+unit*a/2):(x0+unit*a+unit*b/2);
        txt(svg,mx,75,'더 많아요!',18,more?'#0B7A5C':'#C24E0E');
      }
      stage.appendChild(svg);
      if(mode==='quiz'){
        statusEl.innerHTML='<div style="font-size:19px;color:#8aa0b6;">초록 칸과 주황 칸을 세어 보고 답을 골라요!</div>';
        return;
      }
      if(!G().ratioSign){
        // 저학년: 비 기호 없이 개수 비교 일상어
        var cmp=(a>b)?'초록이 더 많아요!':((a<b)?'주황이 더 많아요!':'똑같아요!');
        statusEl.innerHTML='<span style="font-size:26px;color:#1B3A57;">초록 </span><span style="font-size:40px;color:#12B886;">'+a+'</span><span style="font-size:26px;color:#1B3A57;">칸, 주황 </span><span style="font-size:40px;color:#FF8A3D;">'+b+'</span><span style="font-size:26px;color:#1B3A57;">칸</span>'
          +'<br><span style="font-size:24px;color:#5a7894;">'+cmp+'</span>';
        return;
      }
      var g2=gcd(a,b), ra=a/g2, rb=b/g2, pa=Math.round(a/(a+b)*100);
      statusEl.innerHTML='<span style="font-size:30px;color:#1B3A57;">비 </span><span style="font-size:42px;color:#12B886;">'+a+'</span><span style="font-size:34px;color:#1B3A57;"> : </span><span style="font-size:42px;color:#FF8A3D;">'+b+'</span>'
        +(g2>1?'<span style="font-size:24px;color:#5a7894;">  (가장 간단히 '+ra+':'+rb+')</span>':'')
        +(G().percent?'<br><span style="font-size:22px;color:#5a7894;">A는 전체의 '+pa+'%'+(G().ratioVal?' · 비율 A/B = '+(a/b).toFixed(2):'')+'</span>':'');
    }
    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
