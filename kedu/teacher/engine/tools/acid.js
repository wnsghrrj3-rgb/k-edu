/* ============================================================================
   케이랩 도구 모듈 — 산과 염기 (acid) v1  [과학 10호 · 물질 영역]
   5학년 산과 염기. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
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
    var exp, selSol, selInd, tested, mixN; // mixN: 섞기 실험 염기 방울 수(0=새빨강)
    function reset(){ exp='test'; selSol=-1; selInd=null; tested={}; mixN=0; }
    reset();
    function applyInd(ind){
      if(selSol<0){ ui.toast(el,false,'먼저 검사할 용액(비커)을 골라요!'); return; }
      selInd=ind; tested[SOLS[selSol].id+'_'+ind]=1;
      renderScene(); renderStatus(); checkMission();
    }
    function pickSol(i){ selSol=i; selInd=null; renderScene(); renderStatus(); }
    function drop(kind){
      if(kind==='base')mixN=Math.min(10,mixN+1); else mixN=Math.max(0,mixN-1);
      renderScene(); renderStatus(); checkMission();
    }
    function mixCol(){ // 0..10: 붉음→보라→푸름
      var k=mixN/10;
      return k<0.5?mix('#E03131','#9C36B5',k*2):mix('#9C36B5','#1971C2',(k-0.5)*2);
    }

    /* ───────────── 미션 ───────────── */
    function cabClassified(){
      var a=0,b=0; SOLS.forEach(function(s){ if(tested[s.id+'_cab'])(s.kind==='acid')?a++:b++; });
      return a>=2&&b>=2;
    }
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
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1){ mStep++; if(!MISSIONS[mStep].keep)reset(); }
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
      function t(id,lab){ var on=(exp===id);
        return '<button class="ac-btn" data-act="exp-'+id+'" style="'+btn+'border-color:#1565C0;background:'+(on?'#1565C0':'#fff')+';color:'+(on?'#fff':'#1565C0')+';">'+lab+'</button>'; }
      return '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">'+t('test','🧪 지시약 검사')+t('mix','⚗️ 섞어 보기')+'</div>';
    }
    function indRow(){
      if(exp!=='test')return '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">'
        +'<button class="ac-btn" data-act="drop-base" style="'+btn+'border-color:'+C.base+';background:#fff;color:'+C.base+';">💧 염기 한 방울</button>'
        +'<button class="ac-btn" data-act="drop-acid" style="'+btn+'border-color:'+C.acid+';background:#fff;color:'+C.acid+';">💧 산 한 방울</button>'
        +'<button class="ac-btn" data-act="reset" style="'+btn+'border-color:#9aa;background:#fff;color:#667;">↺ 처음부터</button></div>';
      return '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;align-items:center;margin-bottom:8px;">'
        +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';">지시약</span>'
        + INDS.map(function(d){ var on=(selInd===d.id);
            return '<button class="ac-btn" data-act="ind-'+d.id+'" style="'+btn+'border-color:'+C.vio+';background:'+(on?C.vio:'#fff')+';color:'+(on?'#fff':C.vio)+';">'+d.nm+'</button>'; }).join('')
        +'<button class="ac-btn" data-act="reset" style="'+btn+'border-color:#9aa;background:#fff;color:#667;">↺</button></div>';
    }
    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); body=expTabs()+indRow(); }
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
      drawStage(); bind(); renderScene(); renderStatus();
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
    function renderScene(){
      if(!svg)return;
      svg.innerHTML='';
      if(exp==='mix'){
        // 큰 비커: 식초+양배추 지시약
        var col=mixCol();
        var g0=svgEl('g',{}); svg.appendChild(g0);
        beaker(g0,450,360,220,250,col,180,'#78909C',4);
        // 거품/방울 애니
        for(var b2=0;b2<4;b2++){ var byy=350-((frame*1.2+b2*40)%160);
          g0.appendChild(svgEl('circle',{cx:400+b2*32,cy:byy,r:4,fill:'#fff','fill-opacity':0.5})); }
        var t0=svgEl('text',{x:450,y:140,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:C.ink});
        t0.textContent='식초 + 양배추 지시약'; svg.appendChild(t0);
        // 색 띠 게이지 (산←→염기)
        for(var s2=0;s2<=10;s2++){ var k=s2/10, gc=k<0.5?mix('#E03131','#9C36B5',k*2):mix('#9C36B5','#1971C2',(k-0.5)*2);
          svg.appendChild(svgEl('rect',{x:640+0,y:120+s2*22,width:34,height:20,rx:4,fill:gc,'fill-opacity':(s2===mixN?1:0.45),
            stroke:(s2===mixN?C.ink:'none'),'stroke-width':3})); }
        var ta=svgEl('text',{x:700,y:135,'font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:C.acid}); ta.textContent='← 산성'; svg.appendChild(ta);
        var tb=svgEl('text',{x:700,y:345,'font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:C.base}); tb.textContent='← 염기성'; svg.appendChild(tb);
        var tn=svgEl('text',{x:450,y:402,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':19,'font-weight':800,fill:C.sub,'data-mixn':mixN});
        tn.textContent='넣은 염기: '+mixN+'방울'; svg.appendChild(tn);
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
        var lb=svgEl('text',{x:cx,y:by+34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':19,'font-weight':800,fill:(selSol===i?C.vio:C.ink)});
        lb.textContent=s.nm; svg.appendChild(lb);
        // 양배추 검사 완료 분류 라벨
        if(tested[s.id+'_cab']){
          var cl=svgEl('text',{x:cx,y:by+60,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':17,'font-weight':800,
            fill:(s.kind==='acid'?C.acid:C.base),'data-class':s.kind});
          cl.textContent=(s.kind==='acid'?'산성':'염기성'); svg.appendChild(cl);
        }
      }
      var tip=svgEl('text',{x:450,y:60,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.sub});
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
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">검사해 본 걸 떠올리며 답을 골라요</div>'; return; }
      if(exp==='mix'){
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
        else if(a==='drop-base')drop('base');
        else if(a==='drop-acid')drop('acid');
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
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
