/* ============================================================================
   케이랩 도구 모듈 — 가능성 (probability) v3 + 학년칸
   초점 (6학년 가능성) = 직접 여러 번 시행해 가능성을 눈으로.
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 동전만·한 번/여러 번(20) 굴리기·"앞이 더 많이 나왔어요/비슷해요" 일상어 닻
            ·주사위·백분율(%)·가능성 어휘 퀴즈 숨김.
     · 중 = 동전+주사위·백분율·가능성 어휘 퀴즈(불가능/반반/확실).
     · 고 = 기존 전부 유지(100번·짝수 등 복합 퀴즈 5문).
   - 의존: window.KLab (THREE 불필요)
   - config: { type:"coin"|"dice", batch, grade:"low|mid|high", mode }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('probability', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    /* showWow = F칸 와우(도박사 오류). 고학년·동전·자유탐구 전용(저·중·주사위·미션·퀴즈에선 숨김). */
    var GRADES={
      low:  { modes:['free','mission'],        dice:false, percent:false, quiz:false, batch:20, showWow:false },
      mid:  { modes:['free','mission','quiz'], dice:true,  percent:true,  quiz:true,  batch:50, showWow:false },
      high: { modes:['free','mission','quiz'], dice:true,  percent:true,  quiz:true,  batch:50, showWow:true }
    };
    var gamblerArmed=false; /* 와우 예측 무장 상태(5연속 셋업 → 100번 반증) */
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curBatch(){ return config.batch || G().batch; }

    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var type=(G().dice&&config.type==='dice')?'dice':'coin';
    var batch=curBatch();
    var faces=(type==='dice')?[1,2,3,4,5,6]:['앞','뒤'];
    var COL=['#1565C0','#0CA678','#F59F00','#E64980','#7048E8','#FF8A3D'];
    var counts={}; faces.forEach(function(f){counts[f]=0;});
    var total=0, last=null;
    var btn='font-size:25px;padding:13px 24px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:22px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function setType(t){
      type=(G().dice||t==='coin')?t:'coin';
      faces=(type==='dice')?[1,2,3,4,5,6]:['앞','뒤'];
      counts={}; faces.forEach(function(f){counts[f]=0;});
      total=0; last=null;
      gamblerArmed=false; /* 토글·학년·모드 전환 시 와우 무장 해제 */
    }

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; batch=curBatch();
      if(G().modes.indexOf(mode)<0) mode='free';
      setType('coin'); mStep=0; mDone=false; mLock=false;
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS=[
      { text:'🪙 동전을 <b style="color:#7048E8;">한 번</b> 굴려 봐요! 앞일까 뒤일까?',
        check:function(){ return type==='coin'&&total>=1; } },
      { text:'🪙 <b style="color:#7048E8;">'+batch+'번 굴리기</b>로 한꺼번에! 앞·뒤 막대가 비슷해지나요?',
        check:function(){ return type==='coin'&&total>=batch; } }
    ];
    var MID_MISSIONS=[
      { text:'🪙 동전을 <b style="color:#7048E8;">한 번</b> 굴려 봐요! 앞일까 뒤일까?',
        check:function(){ return type==='coin'&&total>=1; } },
      { text:'🪙 <b style="color:#7048E8;">'+batch+'번 굴리기</b>로 한꺼번에! 앞·뒤 막대가 비슷해지나요?',
        check:function(){ return type==='coin'&&total>=batch; } },
      { text:'🎲 <b style="color:#7048E8;">주사위</b>로 바꿔 한 번 굴려 봐요!',
        check:function(){ return type==='dice'&&total>=1; } }
    ];
    var HIGH_MISSIONS=[
      { text:'🪙 동전을 <b style="color:#7048E8;">한 번</b> 굴려 봐요! 앞일까 뒤일까?',
        check:function(){ return type==='coin'&&total>=1; } },
      { text:'🪙 <b style="color:#7048E8;">'+batch+'번 굴리기</b>로 한꺼번에! 앞·뒤 막대가 비슷해지나요?',
        check:function(){ return type==='coin'&&total>=batch; } },
      { text:'🎲 <b style="color:#7048E8;">주사위</b>로 바꿔 한 번 굴려 봐요!',
        check:function(){ return type==='dice'&&total>=1; } },
      { text:'🎲 주사위를 <b style="color:#7048E8;">100번 넘게</b> 굴려 여섯 눈이 고르게 나오는지 봐요!',
        check:function(){ return type==='dice'&&total>=100; } }
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ mLock=false; mStep++;
          if(mStep>=M.length){ mDone=true; }
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (중·고만) ───────────── */
    var MID_QUIZ=[
      { type:'coin', preset:{'앞':1}, q:'동전을 한 번 던질 때 앞면이 나올 가능성은?', answer:'반반이에요', choices:['반반이에요','항상 나와요','절대 안 나와요'] },
      { type:'dice', preset:{1:1,3:1,6:1}, q:'주사위에서 눈 7이 나올 가능성은?', answer:'불가능해요', choices:['불가능해요','반반이에요','확실해요'] },
      { type:'dice', preset:{2:1,4:1,5:1}, q:'주사위에서 6 이하의 눈이 나올 가능성은?', answer:'확실해요', choices:['확실해요','불가능해요','반반이에요'] }
    ];
    var HIGH_QUIZ=[
      { type:'coin', preset:{'앞':1}, q:'동전을 한 번 던질 때 앞면이 나올 가능성은?', answer:'반반이에요', choices:['반반이에요','항상 나와요','절대 안 나와요'] },
      { type:'dice', preset:{1:1,3:1,6:1}, q:'주사위에서 눈 7이 나올 가능성은?', answer:'불가능해요', choices:['불가능해요','반반이에요','확실해요'] },
      { type:'dice', preset:{2:1,4:1,5:1}, q:'주사위에서 6 이하의 눈이 나올 가능성은?', answer:'확실해요', choices:['확실해요','불가능해요','반반이에요'] },
      { type:'coin', preset:{'앞':48,'뒤':52}, q:'동전을 아주 여러 번 던지면 앞면의 비율은 어디에 가까워질까요?', answer:'절반 (50%)', choices:['절반 (50%)','100%','0%'] },
      { type:'dice', preset:{1:2,2:3,3:2,4:3,5:2,6:3}, q:'주사위에서 짝수 눈이 나올 가능성은?', answer:'반반이에요', choices:['반반이에요','확실해요','불가능해요'] }
    ];
    function quizPool(){ return (grade==='mid')?MID_QUIZ:HIGH_QUIZ; }
    var qList=[],qIdx=0,qScore=0,qCount=0,qLock=false;
    function shuffleQuiz(){
      qList=quizPool().slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=qList[i];qList[i]=qList[j];qList[j]=t;}
      qIdx=0;qScore=0;qCount=0;
    }
    function shuffled(arr){var c=arr.slice();for(var i=c.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=c[i];c[i]=c[j];c[j]=t;}return c;}
    function applyQuizState(q){
      setType(q.type);
      total=0;
      for(var k in q.preset){ counts[k]=q.preset[k]; total+=q.preset[k]; }
      last=null;
    }

    /* ───────────── 와우 F칸: 도박사 오류(예측 빗나감형) ─────────────
       고학년·동전·자유탐구 전용. ① 앞면 5연속 무장 → ② 다음 100번 독립 시행은
       과거와 무관하게 ≈반반 = "이제 뒷면 나올 차례" 직관 반증. */
    function wowOn(){ return G().showWow && type==='coin' && mode==='free'; }
    function clearPbFlash(){
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      host.querySelectorAll('.pb-flash,.pb-flash-magic,.pb-nudge').forEach(function(n){ n.remove(); });
    }
    function pbFlash(cls,html,ms){
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      clearPbFlash();
      var bg=(cls==='pb-flash-magic')?'background:#7048E8;color:#fff;'
            :(cls==='pb-flash')?'background:#1565C0;color:#fff;'
            :'background:#FFF3CD;color:#7a5b00;border:2px solid #F3C969;';
      var d=document.createElement('div');
      d.className=cls;
      d.setAttribute('style','position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:6;'
        +'max-width:92%;text-align:center;padding:13px 20px;border-radius:18px;font-family:inherit;'
        +'font-weight:800;font-size:21px;line-height:1.4;box-shadow:0 10px 28px rgba(0,0,0,0.20);'
        +'animation:pbPop .26s ease-out;'+bg);
      d.innerHTML=html;
      host.appendChild(d);
      setTimeout(function(){ if(d.parentNode)d.parentNode.removeChild(d); }, ms);
    }
    function wowArm(){
      if(!wowOn())return;
      counts={'앞':5,'뒤':0}; total=5; last='앞';
      gamblerArmed=true;
      snd('charge'); render();
      pbFlash('pb-flash','🔮 앞면이 <b>5번 연속!</b> 이제 뒷면 나올 차례일까요? 다음을 예상해 봐요',2600);
    }
    function wowReveal(){
      if(!wowOn())return;
      if(!gamblerArmed){
        snd('select');
        pbFlash('pb-nudge','먼저 <b>🔮 앞면 5번 연속</b>으로 예상부터 해 봐요!',2600);
        return;
      }
      var h=0,t=0;
      for(var i=0;i<100;i++){ if(Math.random()<0.5){h++;last='앞';} else {t++;last='뒤';} }
      counts={'앞':h,'뒤':t}; total=100;
      snd('whoosh'); snd('success'); render();
      pbFlash('pb-flash-magic','앞 5연속 뒤에도 다음 100번 중 <b>앞 '+h+'</b> · <b>뒤 '+t
        +'</b>, 거의 반반! 🪙 동전은 과거를 기억 못 해요',3000);
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', foot='';
      var typeRow=G().dice
        ?'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="pb-tg" data-type="coin" style="'+tg+'">동전</button>'
          +'<button class="pb-tg" data-type="dice" style="'+tg+'">주사위</button>'
        +'</div>':'';
      var ctrl=typeRow
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
          +'<button class="pb-btn" data-act="one" style="'+btn+'background:#1565C0;color:#fff;">한 번 굴리기</button>'
          +'<button class="pb-btn" data-act="many" style="'+btn+'background:#fff;color:#1565C0;">'+batch+'번 굴리기</button>'
          +'<button class="pb-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); }
      else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        applyQuizState(q); ctrl='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      var wowRow = wowOn()
        ? '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
          +'<button class="pb-wow" data-wow="arm" style="font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🔮 앞면 5번 연속! 다음은?</button>'
          +'<button class="pb-wow" data-wow="reveal" style="font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #7048E8;background:#7048E8;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🎯 다음 100번 던지기</button>'
          +'</div>'
        : '';
      el.innerHTML='<style>.pb-btn:active,.pb-tg:active,.pb-wow:active{transform:translateY(2px);}.pb-tg.on{background:#7048E8 !important;color:#fff !important;}.kl-choice{min-width:130px !important;}'
        +'@keyframes pbPop{from{opacity:0;transform:translate(-50%,-9px) scale(.95);}to{opacity:1;transform:translate(-50%,0) scale(1);}}'
        +'.pb-hold{display:inline-block;animation:pbHold 1.1s ease-in-out infinite;}@keyframes pbHold{0%,100%{opacity:1;}50%{opacity:.5;}}</style>'
        + top + bar + ctrl + wowRow
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="pb-stage" style="width:100%;height:'+(mode==='quiz'?'32vh':'46vh')+';min-height:'+(mode==='quiz'?'220':'320')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        + foot
        +'<div class="pb-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      el.querySelectorAll('.pb-tg').forEach(function(b){b.classList.toggle('on',b.dataset.type===type);});
      ui.bindModeTabs(el,function(m2){
        mode=m2; mStep=0;mDone=false;mLock=false;
        setType('coin');
        if(m2==='quiz')shuffleQuiz();
        build();
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true; qCount++;
          var q=qList[qIdx], ok=(b.dataset.v===String(q.answer));
          if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ qIdx++; if(qIdx>=qList.length)shuffleQuiz(); qLock=false; build(); },1400);
        });
      });
      bind(); render(); bands.bind(el);
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,f,an){var t=svgEl('text',{x:x,y:y,'text-anchor':an||'middle','font-family':'Gowun Dodum,sans-serif','font-size':sz,'font-weight':800,fill:f});t.textContent=s;svg.appendChild(t);}
    var VBW=820,VBH=360;
    function roll(n){for(var i=0;i<n;i++){var f=faces[Math.floor(Math.random()*faces.length)];counts[f]++;total++;last=f;}snd('tap');render();}
    function render(){
      var stage=el.querySelector('.pb-stage'); if(!stage)return; stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var n=faces.length, padB=70, padT=40, plotH=VBH-padB-padT, slot=(VBW-80)/n;
      var mx=1; faces.forEach(function(f){if(counts[f]>mx)mx=counts[f];});
      faces.forEach(function(f,i){
        var cx=40+slot*(i+0.5), h=counts[f]/mx*plotH, by=padT+plotH-h;
        svg.appendChild(svgEl('rect',{x:cx-slot*0.32,y:by,width:slot*0.64,height:h,rx:8,fill:COL[i%6],stroke:'#fff','stroke-width':2}));
        txt(svg,cx,by-10,counts[f],22,COL[i%6]);
        txt(svg,cx,padT+plotH+30,(type==='dice'?'⚂ ':'')+f,22,'#1B3A57');
        if(G().percent){ var pct=total?Math.round(counts[f]/total*100):0; txt(svg,cx,padT+plotH+54,pct+'%',18,'#5a7894'); }
      });
      stage.appendChild(svg);
      var st=el.querySelector('.pb-status');
      if(mode==='quiz'){
        st.innerHTML='<div style="font-size:19px;color:#8aa0b6;">'+(type==='dice'?'주사위 눈은 1~6, 여섯 가지!':'동전은 앞 아니면 뒤, 두 가지!')+' 잘 생각하고 답을 골라요.</div>';
        return;
      }
      if(!G().percent && type==='coin'){
        // 저학년 닻: 앞·뒤 개수 비교 일상어
        var fr=counts['앞']||0, bk=counts['뒤']||0;
        var cmp=(total===0)?'동전을 굴려 봐요!':(fr>bk?'앞이 더 많이 나왔어요!':(bk>fr?'뒤가 더 많이 나왔어요!':'딱 같아요!'));
        st.innerHTML='<span style="font-size:24px;color:#1B3A57;">앞 </span><span style="font-size:34px;color:#1565C0;">'+fr+'</span><span style="font-size:24px;color:#1B3A57;">번, 뒤 </span><span style="font-size:34px;color:#0CA678;">'+bk+'</span><span style="font-size:24px;color:#1B3A57;">번</span>'
          +'<br><span style="font-size:22px;color:#5a7894;">'+cmp+(total>=batch?' (여러 번 하니 비슷해지죠?)':'')+'</span>';
        return;
      }
      st.innerHTML='<span style="font-size:26px;color:#1B3A57;">모두 </span><span style="font-size:36px;color:#1565C0;">'+total+'</span><span style="font-size:26px;color:#1B3A57;">번</span>'
        +(last!=null?'<span style="font-size:22px;color:#5a7894;">   (방금: '+last+')</span>':'');
      if(gamblerArmed && type==='coin' && mode==='free'){
        st.innerHTML+='<div style="margin-top:8px;"><span class="pb-hold" style="font-size:21px;color:#7048E8;">🎲 한 번 한 번은 서로 무관 — 연속과 상관없이 늘 반반</span></div>';
      }
    }
    function bind(){
      el.querySelectorAll('.pb-tg').forEach(function(b){b.addEventListener('click',function(){if(type!==b.dataset.type){snd('select');setType(b.dataset.type);build();}});});
      var H={one:function(){roll(1);},many:function(){roll(batch);},reset:function(){faces.forEach(function(f){counts[f]=0;});total=0;last=null;gamblerArmed=false;clearPbFlash();snd('select');render();}};
      el.querySelectorAll('.pb-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f){f();if(mode==='mission')checkMission();}});});
      el.querySelectorAll('.pb-wow').forEach(function(b){b.addEventListener('click',function(){ if(b.dataset.wow==='arm')wowArm(); else wowReveal(); });});
    }
    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
