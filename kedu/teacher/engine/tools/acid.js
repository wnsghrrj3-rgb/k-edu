/* ============================================================================
   케이랩 도구 모듈 — 산과 염기 (acid) v2  [과학 10호 · 물질 영역]
   5학년 산과 염기. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   ★와우(F칸·고학년·free·mix 전용) = 중화점 급반전: 라이브 선형 게이지가 가린 "끝까지 빨강→딱 한 방울에 확 파랑"을
     2단 예측(🔮 어디서 확 변할까?)→확인(💧 결정적 한 방울)으로 드러냄. "비례해 조금씩 변한다" 오개념 반증. 기존 render 보존(헌법 6장).
   디지털 우위: 약품·유리 기구 없이 안전하게, 몇 번이고 즉시 지시약 검사.
   변수 → 현상 → 발견:
     ▸ 🧪 지시약 검사 — 용액 6종(식초·레몬즙·사이다 / 비눗물·석회수·유리세정제)
       × 지시약 4종(푸른·붉은 리트머스, 페놀프탈레인, 양배추 지시약).
       푸른 리트머스→산성에서 붉게 / 붉은→염기성에서 푸르게 /
       페놀프탈레인→염기성에서만 붉게 / 양배추→산성 붉은 계열·염기성 푸른 계열.
     ▸ ⚗️ 섞어 보기 — 식초+양배추 지시약(붉음)에 염기성 용액을 한 방울씩 →
       붉음→보라→푸름. "섞을수록 성질이 약해지고 변한다" 직접 체험.
   미션 4종 + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('acid', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, frame = 0;
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', vio:'#7048E8', acid:'#E03131', base:'#1971C2' };
    var btn = 'font-size:19px;padding:10px 14px;border-radius:13px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function mix(a,b,k){ var pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16),o='#';
      for(var s=16;s>=0;s-=8){ var va=(pa>>s)&255,vb=(pb>>s)&255,v=Math.round(va+(vb-va)*k); o+=('0'+v.toString(16)).slice(-2);} return o; }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }
    /* 와우 배너 — .kl-stage-host(relative)에 absolute 주입 + 자동 제거 (헌법 6장: 연출만 얹기) */
    var bnFlashTo=null;
    function bnFlash(cls,html,ms){
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      host.querySelectorAll('.bn-flash,.bn-flash-magic,.bn-nudge,.bn-solve').forEach(function(n){n.remove();});
      var col=(cls==='bn-flash-magic')?{bg:'#F3F0FF',bd:C.vio,tx:C.vio}
             :(cls==='bn-solve')?{bg:'#E6FCF5',bd:C.good,tx:'#0B7285'}
             :(cls==='bn-nudge')?{bg:'#FFF9DB',bd:'#F59F00',tx:'#B8860B'}
             :{bg:'#E7F5FF',bd:C.base,tx:C.base};
      var d=document.createElement('div'); d.className=cls;
      d.setAttribute('style','position:absolute;left:50%;top:12px;transform:translateX(-50%);max-width:92%;z-index:9;'
        +'background:'+col.bg+';border:3px solid '+col.bd+';color:'+col.tx+';border-radius:16px;'
        +'padding:12px 18px;font-size:18px;font-weight:800;font-family:inherit;line-height:1.35;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,0.10);');
      d.innerHTML=html; host.appendChild(d);
      if(bnFlashTo)clearTimeout(bnFlashTo);
      bnFlashTo=setTimeout(function(){ if(d&&d.parentNode)d.parentNode.removeChild(d); bnFlashTo=null; },ms||2800);
    }

    /* ───────────── 데이터 ───────────── */
    var SOLS=[
      {id:'vinegar', nm:'식초',       kind:'acid', col:'#F5E6C8'},
      {id:'lemon',   nm:'레몬즙',     kind:'acid', col:'#FFF3BF'},
      {id:'cider',   nm:'사이다',     kind:'acid', col:'#EDF7FA'},
      {id:'soap',    nm:'비눗물',     kind:'base', col:'#EDEFF2'},
      {id:'lime',    nm:'석회수',     kind:'base', col:'#F3F4F6'},
      {id:'cleaner', nm:'유리 세정제', kind:'base', col:'#D4F1F9'}
    ];
    var INDS=[
      {id:'litB', nm:'푸른 리트머스', short:'푸른 종이'},
      {id:'litR', nm:'붉은 리트머스', short:'붉은 종이'},
      {id:'phen', nm:'페놀프탈레인'},
      {id:'cab',  nm:'양배추 지시약'}
    ];
    // 결과: 지시약 × 산/염기 → {col(보이는 색), txt(말)}
    function result(ind,kind){
      if(ind==='litB')return kind==='acid'?{col:'#E03131',txt:'푸른 종이가 붉게! → <b>산성</b>'}:{col:'#1971C2',txt:'푸른 그대로 — 붉게 안 변하면 산성이 아니에요'};
      if(ind==='litR')return kind==='base'?{col:'#1971C2',txt:'붉은 종이가 푸르게! → <b>염기성</b>'}:{col:'#E03131',txt:'붉은 그대로 — 푸르게 안 변하면 염기성이 아니에요'};
      if(ind==='phen')return kind==='base'?{col:'#E64980',txt:'무색이던 페놀프탈레인이 붉게! → <b>염기성</b>'}:{col:null,txt:'아무 변화 없음(무색) → 염기성이 아니에요'};
      return kind==='acid'?{col:'#E8590C',txt:'양배추 지시약이 <b>붉은 계열</b>로! → 산성'}:{col:'#15AABF',txt:'양배추 지시약이 <b>푸른 계열</b>로! → 염기성'};
    }

    /* ───────────── 상태 ───────────── */
    var exp, selSol, selInd, tested, mixN, lowAdd; // mixN: 섞기 실험 염기 방울 수(0=새빨강) / lowAdd: 저학년 마법물에 넣은 것 null|'acid'|'base'
    var wowArmed=false, wowFlipped=false, wowOverride=null, wowDrops=0; // 중화점 급반전 와우(고학년·free·mix 전용)
    function reset(){ exp='test'; selSol=-1; selInd=null; tested={}; mixN=0; lowAdd=null; wowArmed=false; wowFlipped=false; wowOverride=null; wowDrops=0; }
    reset();
    function addLow(kind){ lowAdd=kind; renderScene(); renderStatus(); checkMission(); }
    function applyInd(ind){
      if(selSol<0){ ui.toast(el,false,'먼저 검사할 용액(비커)을 골라요!'); return; }
      selInd=ind; tested[SOLS[selSol].id+'_'+ind]=1;
      renderScene(); renderStatus(); checkMission();
    }
    function pickSol(i){ selSol=i; selInd=null; renderScene(); renderStatus(); }
    function drop(kind){
      if(wowOverride!=null){ wowOverride=null; wowArmed=false; wowFlipped=false; } // 와우 데모에서 빠져나와 보통(선형) 섞기로
      if(kind==='base')mixN=Math.min(10,mixN+1); else mixN=Math.max(0,mixN-1);
      renderScene(); renderStatus(); checkMission();
    }
    function mixCol(){ // 0..10: 붉음→보라→푸름
      var k=mixN/10;
      return k<0.5?mix('#E03131','#9C36B5',k*2):mix('#9C36B5','#1971C2',(k-0.5)*2);
    }

    /* ── 와우(F칸) — 중화점 급반전 ──
       ★예측 빗나감형: 라이브 mix 게이지는 10방울에 걸쳐 매끄럽게(선형) 붉음→보라→푸름 →
       "방울 수에 비례해 조금씩 변한다"는 인상. 실제 적정은 끝까지 거의 빨강이다가 *중화점에서 딱 한 방울에 확 뒤집힘*.
       도구가 이미 가르치는 "섞으면 약해진다(중화)"가 아니라, 게이지가 가린 *급반전*을 정조준(★dissolve/burn 교훈).
       기존 선형 render 보존 — wowOverride!=null일 때만 색을 비선형으로 덮어씀(헌법 6장). 고학년·free·mix 전용 2단. */
    function wowArm(){
      wowArmed=true; wowFlipped=false; wowOverride='#E03131'; wowDrops=0; mixN=0; // 무대를 새빨간 산성에서 출발(기존 render 재사용)
      snd('charge');
      renderScene(); renderStatus();
      bnFlash('bn-flash','🔴 새빨간 산성 용액이에요. 염기를 한 방울씩 넣으면 — <b>조금씩 매끄럽게 변할까요, 아니면 어느 순간 확 뒤집힐까요?</b> 예상해 봐요!',3200);
    }
    function wowReveal(){
      if(!wowArmed){ snd('select'); bnFlash('bn-nudge','먼저 🔮 버튼으로 <b>어디서 확 변할지</b> 예상부터 해 봐요!',2600); return; }
      wowFlipped=true; wowOverride='#1971C2'; wowDrops=9; // 결정적 한 방울 = 빨강→파랑 즉시 스냅(매끄러운 ramp는 "급반전"을 오히려 약화)
      snd('whoosh'); snd('success');
      renderScene(); renderStatus();
      bnFlash('bn-flash-magic','딱 한 방울에 <b>확 뒤집혔어요!</b> 🔵 여태 거의 빨강 그대로였는데 <b>결정적 한 방울(중화점)</b>에서 단번에 파랑으로 — 산+염기는 비례해 조금씩이 아니라 <b>한 점에서 확</b> 바뀌어요.',4400);
      wowArmed=false;
    }

    /* ───────────── 미션 ───────────── */
    function cabClassified(){
      var a=0,b=0; SOLS.forEach(function(s){ if(tested[s.id+'_cab'])(s.kind==='acid')?a++:b++; });
      return a>=2&&b>=2;
    }
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=색 변하는 마법 물(★중앙 비커 1개에 식초/비눗물 투입=신규 구현, 저학년 닻·용어 없는 일상어) /
       중=산성·염기성 분류(지시약 색, 양배추+페놀프탈레인) / 고=중화 반응·pH·적정(기존 v1 유지).
       ※ 중화점 색 급반전 마법모먼트는 후속 분리(burn/dissolve 패턴과 동일). */
    var LOW_MISSIONS=[
      { text:'🍋 <b style="color:#7048E8;">식초</b>를 넣어 봐요 — 보라색 마법 물이 무슨 색으로 변할까요?',
        keep:true, check:function(){ return lowAdd==='acid'; } },
      { text:'🧼 <b style="color:#7048E8;">비눗물</b>도 넣어 봐요 — 이번엔 또 다른 색으로 변해요!',
        keep:true, check:function(){ return lowAdd==='base'; } }
    ];
    var MID_MISSIONS=[
      { text:'🍋 <b style="color:#7048E8;">식초</b>에 🥬 양배추 지시약 — <b style="color:#E03131;">붉은 계열</b>이면 <b>산성</b>이에요!',
        keep:false, check:function(){ return exp==='test'&&selSol>=0&&SOLS[selSol].kind==='acid'&&selInd==='cab'; } },
      { text:'🧼 <b style="color:#7048E8;">비눗물</b>에 🥬 양배추 지시약 — <b style="color:#1971C2;">푸른 계열</b>이면 <b>염기성</b>이에요!',
        keep:false, check:function(){ return exp==='test'&&selSol>=0&&SOLS[selSol].kind==='base'&&selInd==='cab'; } },
      { text:'🥬 양배추 지시약으로 여러 용액을 검사해 <b style="color:#7048E8;">산성 2개·염기성 2개</b> 이상 분류해요!',
        keep:true, check:function(){ return cabClassified(); } }
    ];
    var MISSIONS=[
      { text:'<b style="color:#7048E8;">식초</b>에 <b style="color:#7048E8;">푸른 리트머스 종이</b>를 — 어떻게 변하는지 확인해요!',
        keep:false, check:function(){ return exp==='test'&&selSol>=0&&SOLS[selSol].id==='vinegar'&&selInd==='litB'; } },
      { text:'<b style="color:#7048E8;">페놀프탈레인</b>을 붉게 만드는 <b style="color:#7048E8;">염기성 용액</b>을 찾아요!',
        keep:true, check:function(){ return exp==='test'&&selSol>=0&&SOLS[selSol].kind==='base'&&selInd==='phen'; } },
      { text:'🥬 <b style="color:#7048E8;">양배추 지시약</b>으로 여러 용액을 검사해 <b style="color:#7048E8;">산성 2개·염기성 2개</b> 이상 분류해요!',
        keep:true, check:function(){ return cabClassified(); } },
      { text:'⚗️ <b style="color:#7048E8;">섞어 보기</b>에서 붉은 용액에 염기를 넣어 <b style="color:#7048E8;">푸른색</b>까지 바꿔요 — 성질이 변해요!',
        keep:true, check:function(){ return exp==='mix'&&mixN>=8; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],        missions:LOW_MISSIONS, exps:['test'],       inds:['cab'],        low:true,  showWow:false },
      mid:  { modes:['free','mission','quiz'], missions:MID_MISSIONS, exps:['test'],       inds:['cab','phen'], low:false, showWow:false },
      high: { modes:['free','mission','quiz'], missions:MISSIONS,     exps:['test','mix'], inds:'all',          low:false, showWow:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return G().missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false; reset(); build();
    }});

    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1){ mStep++; if(!M[mStep].keep)reset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { q:'푸른 리트머스 종이를 붉게 변하게 하는 용액은?',
        ch:['산성 용액','염기성 용액','아무 용액이나'], a:0 },
      { q:'페놀프탈레인 용액을 붉게 변하게 하는 용액은?',
        ch:['염기성 용액','산성 용액','차가운 용액'], a:0 },
      { q:'식초는 어떤 성질의 용액일까요?',
        ch:['산성','염기성','아무 성질도 없음'], a:0 },
      { q:'산성 용액에 염기성 용액을 계속 넣으면?',
        ch:['산성이 점점 약해져요','산성이 점점 강해져요','아무 변화 없어요'], a:0 },
      { q:'양배추 지시약이 붉은 계열로 변했다면 그 용액은?',
        ch:['산성','염기성','지시약이 고장'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function expTabs(){
      if(G().exps.length<=1) return ''; // 저·중 = 지시약 검사만 (섞기/중화는 고학년)
      function t(id,lab){ var on=(exp===id);
        return '<button class="ac-btn" data-act="exp-'+id+'" style="'+btn+'border-color:#1565C0;background:'+(on?'#1565C0':'#fff')+';color:'+(on?'#fff':'#1565C0')+';">'+lab+'</button>'; }
      return '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">'+t('test','🧪 지시약 검사')+t('mix','⚗️ 섞어 보기')+'</div>';
    }
    function indRow(){
      if(G().low) // 저학년 = 마법 물에 식초/비눗물 직접 투입
        return '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">'
          +'<button class="ac-btn" data-act="low-acid" style="'+btn+'border-color:'+C.acid+';background:#fff;color:'+C.acid+';">🍋 식초 넣기</button>'
          +'<button class="ac-btn" data-act="low-base" style="'+btn+'border-color:'+C.base+';background:#fff;color:'+C.base+';">🧼 비눗물 넣기</button>'
          +'<button class="ac-btn" data-act="reset" style="'+btn+'border-color:#9aa;background:#fff;color:#667;">↺ 새 마법 물</button></div>';
      if(exp!=='test'){
        var wow='';
        if(G().showWow && mode==='free'){
          wow='<button class="ac-btn" data-act="wow-arm" style="'+btn+'border-color:'+C.vio+';background:#fff;color:'+C.vio+';">🔮 어디서 확 변할까?</button>'
             +'<button class="ac-btn" data-act="wow-reveal" style="'+btn+'border-color:'+C.base+';background:#fff;color:'+C.base+';">💧 결정적 한 방울</button>';
        }
        return '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">'
        + wow
        +'<button class="ac-btn" data-act="drop-base" style="'+btn+'border-color:'+C.base+';background:#fff;color:'+C.base+';">💧 염기 한 방울</button>'
        +'<button class="ac-btn" data-act="drop-acid" style="'+btn+'border-color:'+C.acid+';background:#fff;color:'+C.acid+';">💧 산 한 방울</button>'
        +'<button class="ac-btn" data-act="reset" style="'+btn+'border-color:#9aa;background:#fff;color:#667;">↺ 처음부터</button></div>';
      }
      var inds=(G().inds==='all')?INDS:INDS.filter(function(d){return G().inds.indexOf(d.id)>=0;});
      return '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;align-items:center;margin-bottom:8px;">'
        +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';">지시약</span>'
        + inds.map(function(d){ var on=(selInd===d.id);
            return '<button class="ac-btn" data-act="ind-'+d.id+'" style="'+btn+'border-color:'+C.vio+';background:'+(on?C.vio:'#fff')+';color:'+(on?'#fff':C.vio)+';">'+d.nm+'</button>'; }).join('')
        +'<button class="ac-btn" data-act="reset" style="'+btn+'border-color:#9aa;background:#fff;color:#667;">↺</button></div>';
    }
    function build(){
      var M=curMissions();
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=expTabs()+indRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=expTabs()+indRow();
      el.innerHTML='<style>.ac-btn:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.ac-sol{cursor:pointer;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="ac-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'42vh')+';min-height:'+(mode==='quiz'?'240':'300')+'px;background:linear-gradient(180deg,#F8F9FA 0%,#EAF2FB 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="ac-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); bands.bind(el); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage(){
      stage=el.querySelector('.ac-stage'); stage.innerHTML='';
      svg=svgEl('svg',{viewBox:'0 0 900 430',width:'100%',height:'100%'});
      stage.appendChild(svg);
    }
    function beaker(g,cx,by,w,h,liqCol,liqH,strokeCol,strokeW){
      g.appendChild(svgEl('path',{d:'M '+(cx-w/2)+' '+(by-h)+' L '+(cx-w/2)+' '+(by-8)+' Q '+(cx-w/2)+' '+by+' '+(cx-w/2+8)+' '+by
        +' L '+(cx+w/2-8)+' '+by+' Q '+(cx+w/2)+' '+by+' '+(cx+w/2)+' '+(by-8)+' L '+(cx+w/2)+' '+(by-h),
        fill:'#fff','fill-opacity':0.5,stroke:strokeCol||'#90A4AE','stroke-width':strokeW||3}));
      g.appendChild(svgEl('rect',{x:cx-w/2+4,y:by-liqH,width:w-8,height:liqH-4,rx:5,fill:liqCol}));
    }
    function renderLowScene(){
      // 저학년 닻 — 색이 변하는 마법 물(양배추 지시약) 비커 1개
      var col=(lowAdd==='acid')?'#E03131':(lowAdd==='base')?'#15AABF':'#9C36B5';
      var g=svgEl('g',{}); svg.appendChild(g);
      beaker(g,450,365,210,250,col,185,'#78909C',4);
      for(var b=0;b<4;b++){ var by=352-((frame*1.1+b*42)%150);
        g.appendChild(svgEl('circle',{cx:402+b*32,cy:by,r:4,fill:'#fff','fill-opacity':0.5})); }
      var t=svgEl('text',{x:450,y:120,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':23,'font-weight':800,fill:C.ink});
      t.textContent='🥬 색이 변하는 마법 물'; svg.appendChild(t);
      var sub=svgEl('text',{x:450,y:158,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,
        fill:(lowAdd==='acid')?C.acid:(lowAdd==='base')?C.base:C.sub,'data-lowadd':(lowAdd||'none')});
      sub.textContent=(lowAdd==='acid')?'붉은색으로 변했어요!':(lowAdd==='base')?'푸른색으로 변했어요!':'무얼 넣으면 색이 변할까요? 👇';
      svg.appendChild(sub);
    }
    function renderScene(){
      if(!svg)return;
      svg.innerHTML='';
      if(G().low){ renderLowScene(); return; }
      if(exp==='mix'){
        // 큰 비커: 식초+양배추 지시약
        var col=wowOverride||mixCol();
        var markN=(wowOverride!=null)?(wowFlipped?10:0):mixN; // 게이지 마커: 와우 땐 빨강(0)↔파랑(10) 급반전 따라감
        var g0=svgEl('g',{}); svg.appendChild(g0);
        beaker(g0,450,360,220,250,col,180,'#78909C',4);
        // 거품/방울 애니
        for(var b2=0;b2<4;b2++){ var byy=350-((frame*1.2+b2*40)%160);
          g0.appendChild(svgEl('circle',{cx:400+b2*32,cy:byy,r:4,fill:'#fff','fill-opacity':0.5})); }
        var t0=svgEl('text',{x:450,y:140,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':22,'font-weight':800,fill:C.ink});
        t0.textContent='식초 + 양배추 지시약'; svg.appendChild(t0);
        // 색 띠 게이지 (산←→염기)
        for(var s2=0;s2<=10;s2++){ var k=s2/10, gc=k<0.5?mix('#E03131','#9C36B5',k*2):mix('#9C36B5','#1971C2',(k-0.5)*2);
          svg.appendChild(svgEl('rect',{x:640+0,y:120+s2*22,width:34,height:20,rx:4,fill:gc,'fill-opacity':(s2===markN?1:0.45),
            stroke:(s2===markN?C.ink:'none'),'stroke-width':3})); }
        var ta=svgEl('text',{x:700,y:135,'font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:C.acid}); ta.textContent='← 산성'; svg.appendChild(ta);
        var tb=svgEl('text',{x:700,y:345,'font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:C.base}); tb.textContent='← 염기성'; svg.appendChild(tb);
        var tn=svgEl('text',{x:450,y:402,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':19,'font-weight':800,fill:C.sub,'data-mixn':(wowOverride!=null?wowDrops:mixN)});
        tn.textContent='넣은 염기: '+(wowOverride!=null?wowDrops:mixN)+'방울'; svg.appendChild(tn);
        return;
      }
      // 지시약 검사: 비커 6개
      for(var i=0;i<SOLS.length;i++){
        var s=SOLS[i], cx=110+i*136, by=330;
        var g=svgEl('g',{'class':'ac-sol','data-i':i}); svg.appendChild(g);
        var r=(selSol===i&&selInd)?result(selInd,s.kind):null;
        var liq=(r&&r.col&&selInd!=='litB'&&selInd!=='litR')?r.col:s.col; // 리트머스는 종이만 변함
        beaker(g,cx,by,104,150,liq,108,(selSol===i?C.vio:'#90A4AE'),(selSol===i?5:3));
        // 리트머스 종이 (선택+리트머스일 때 비커에 꽂힘)
        if(selSol===i&&(selInd==='litB'||selInd==='litR')){
          var pc=r.col;
          g.appendChild(svgEl('rect',{x:cx-9,y:by-176,width:18,height:104,rx:4,fill:selInd==='litB'?'#1971C2':'#E03131'}));
          g.appendChild(svgEl('rect',{x:cx-9,y:by-122,width:18,height:50,rx:4,fill:pc,'data-paper':selInd}));
        }
        // 페놀프탈레인/양배추 방울 표시
        if(selSol===i&&(selInd==='phen'||selInd==='cab')){
          var dy=by-160+((frame*3)%18);
          g.appendChild(svgEl('circle',{cx:cx,cy:dy,r:5,fill:selInd==='cab'?'#9C36B5':'#CED4DA',stroke:'#888','stroke-width':1}));
        }
        var lb=svgEl('text',{x:cx,y:by+34,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':19,'font-weight':800,fill:(selSol===i?C.vio:C.ink)});
        lb.textContent=s.nm; svg.appendChild(lb);
        // 양배추 검사 완료 분류 라벨
        if(tested[s.id+'_cab']){
          var cl=svgEl('text',{x:cx,y:by+60,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':17,'font-weight':800,
            fill:(s.kind==='acid'?C.acid:C.base),'data-class':s.kind});
          cl.textContent=(s.kind==='acid'?'산성':'염기성'); svg.appendChild(cl);
        }
      }
      var tip=svgEl('text',{x:450,y:60,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:C.sub});
      tip.textContent=(selSol<0?'먼저 비커를 골라요 👇':'지시약을 골라 검사해 봐요 👆'); svg.appendChild(tip);
      svg.querySelectorAll('.ac-sol').forEach(function(g2){
        g2.addEventListener('click',function(){ pickSol(+g2.getAttribute('data-i')); });
      });
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ frame++;
      if(mode!=='quiz'&&frame%4===0)renderScene();
      raf=requestAnimationFrame(loop);
    }
    function renderStatus(){
      var s=el.querySelector('.ac-status'); if(!s)return;
      var h;
      if(G().low){
        if(lowAdd==='acid')h='<div style="font-size:24px;color:'+C.acid+';">우와, 붉은색! 🍋</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">식초(신 것)를 넣으니 마법 물이 붉게 변했어요. 🧼 비눗물도 넣어 볼까요?</div>';
        else if(lowAdd==='base')h='<div style="font-size:24px;color:'+C.base+';">우와, 푸른색! 🧼</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">비눗물(미끌한 것)을 넣으니 푸르게 변했어요. 넣는 것에 따라 색이 달라져요!</div>';
        else h='<div style="font-size:24px;color:'+C.ink+';">🥬 보라색 마법 물이에요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">무얼 넣으면 색이 변하는지 알려 주는 <b>마법 물(지시약)</b>! 🍋 식초나 🧼 비눗물을 넣어 봐요.</div>';
        s.innerHTML=h; return;
      }
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">검사해 본 걸 떠올리며 답을 골라요</div>'; return; }
      if(exp==='mix'){
        if(wowOverride!=null){
          if(wowFlipped)h='<div style="font-size:24px;color:'+C.base+';">중화점! 결정적 한 방울에 확 뒤집혔어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">여태 거의 빨강 그대로였는데 <b>딱 한 방울</b>에서 단번에 파랑으로 — 매끄럽게가 아니라 <b>한 점에서 확</b> 바뀌어요.</div>';
          else h='<div style="font-size:24px;color:'+C.acid+';">🔴 새빨간 산성 — 어디서 확 변할까요?</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">염기를 한 방울씩 넣으면 조금씩일까요, 어느 순간 확일까요? <b>예상</b>하고 💧 결정적 한 방울을 눌러 봐요.</div>';
          s.innerHTML=h; return;
        }
        if(mixN===0)h='<div style="font-size:24px;color:'+C.acid+';">새빨간 산성 용액이에요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">💧 염기를 한 방울씩 넣으며 색을 지켜봐요 — 무슨 일이 일어날까요?</div>';
        else if(mixN<5)h='<div style="font-size:24px;color:#C2255C;">색이 변하기 시작했어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">염기를 넣을수록 <b>산성이 점점 약해져요</b>.</div>';
        else if(mixN<8)h='<div style="font-size:24px;color:#9C36B5;">보라색 — 산성도 염기성도 아닌 중간쯤!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">계속 넣으면 어떻게 될까요?</div>';
        else h='<div style="font-size:24px;color:'+C.base+';">푸른색 — 이제 염기성이 되었어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">산성+염기성을 섞으면 <b>서로의 성질이 약해지고, 더 넣으면 성질이 바뀌어요</b>. 💧 산을 넣어 되돌릴 수도!</div>';
      } else if(selSol<0){
        h='<div style="font-size:24px;color:'+C.ink+';">🧪 용액 6개 — 눈으로는 산성·염기성을 알 수 없어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">비커를 고르고 지시약으로 검사해요. <b>지시약 = 색으로 성질을 알려 주는 약</b>!</div>';
      } else if(!selInd){
        h='<div style="font-size:24px;color:'+C.vio+';">'+SOLS[selSol].nm+'를 골랐어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">위에서 지시약을 골라 검사해 봐요!</div>';
      } else {
        var r=result(selInd,SOLS[selSol].kind);
        h='<div style="font-size:24px;color:'+(SOLS[selSol].kind==='acid'?C.acid:C.base)+';">'+SOLS[selSol].nm+' + '+INDS.filter(function(d){return d.id===selInd;})[0].nm+'</div>'
          +'<div class="ac-result" style="font-size:19px;color:'+C.ink+';margin-top:5px;">'+r.txt+'</div>';
      }
      s.innerHTML=h;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.ac-btn').forEach(function(b){ b.addEventListener('click',function(){
        var a=b.dataset.act;
        if(a.indexOf('exp-')===0){ exp=a.slice(4); selSol=-1; selInd=null; build(); }
        else if(a.indexOf('ind-')===0)applyInd(a.slice(4));
        else if(a==='low-acid')addLow('acid');
        else if(a==='low-base')addLow('base');
        else if(a==='drop-base')drop('base');
        else if(a==='drop-acid')drop('acid');
        else if(a==='wow-arm')wowArm();
        else if(a==='wow-reveal')wowReveal();
        else if(a==='reset'){ var e0=exp; reset(); exp=e0; build(); }
      }); });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok,ok?null:('🤔 정답은 "'+q.ch[q.a]+'"!'));
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); if(bnFlashTo)clearTimeout(bnFlashTo); };
  });
})();
