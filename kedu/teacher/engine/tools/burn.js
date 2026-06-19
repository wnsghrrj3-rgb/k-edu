/* ============================================================================
   케이랩 도구 모듈 — 연소와 소화 (burn) v1  [과학 14호 · 에너지·물질 영역]
   6학년 연소와 소화. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 불 실험을 안전하게 — 컵 속 산소량을 게이지로 직접 보며
   "왜 꺼지는지"를 눈으로 확인.
   변수 → 현상 → 발견:
     ▸ 🕯️ 연소의 조건 — 촛불 2개에 🥛작은 컵 / 🫙큰 컵을 덮으면
       산소 게이지가 줄다가 0이 되면 꺼짐. 작은 컵이 먼저! (산소 양 차이)
       조건 칩 3개(탈 물질·산소·발화점 이상 온도) 클릭 확인.
     ▸ 🧯 소화 — 💧물 뿌리기(온도↓) / 🪣덮기(산소 차단) / ✂️탈 물질 치우기.
       각 방법이 세 조건 중 무엇을 없앴는지 라벨로 발견.
   미션 4종(조건 확인/컵 비교/물 끄기/3방법 완성) + 퀴즈 5문(+화재 안전).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('burn', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, lastTs = null;
    var C = { ink:'#1B3A57', sub:'#5a7894', hot:'#FA5252', org:'#FF8A3D', yel:'#FFD43B',
              good:'#12B886', vio:'#7048E8', blue:'#1565C0', glass:'#A5D8FF' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }

    /* ───────────── 상태 ───────────── */
    var exp; // 'cond' | 'ext'
    var cd, ex;
    function cdReset(){ cd={ lit:false, cup:[false,false], oxy:[100,100], out:[false,false], candleH:[1,1], chips:{fuel:false,oxy:false,temp:false} }; stopRaf(); }
    function exReset(){ ex={ burning:true, used:{water:false,cover:false,remove:false}, why:'' }; }
    function resetAll(){ exp='cond'; cdReset(); exReset(); }
    function stopRaf(){ if(raf){cancelAnimationFrame(raf);raf=null;} lastTs=null; }
    resetAll();

    var RATE=[30,12]; // %/초 — 작은 컵 / 큰 컵
    function light(){
      if(cd.lit){ ui.toast(el,false,'이미 타고 있어요!'); return; }
      cd.lit=true; ensureRaf(); renderScene(); renderStatus(); checkMission();
    }
    function cover(i){
      if(!cd.lit){ ui.toast(el,false,'먼저 🔥 불을 붙여야 해요!'); return; }
      if(cd.cup[i]){ ui.toast(el,false,'이미 덮여 있어요!'); return; }
      cd.cup[i]=true; ensureRaf(); renderScene(); renderStatus();
    }
    function chip(k){
      if(!cd.lit){ ui.toast(el,false,'불을 붙인 뒤 조건을 확인해 봐요!'); return; }
      cd.chips[k]=true;
      var M={ fuel:'🕯️ 탈 물질 — 초가 있어야 타요!', oxy:'💨 산소 — 공기 속 산소가 필요!', temp:'🌡️ 발화점 이상의 온도 — 뜨거워야 불이 붙어요!' };
      ui.toast(el,true,M[k]); renderScene(); renderStatus(); checkMission();
    }
    function ensureRaf(){ if(!raf){ lastTs=null; raf=requestAnimationFrame(tick); } }
    function tick(ts){
      raf=null;
      var dt=0;
      if(lastTs!=null)dt=Math.max(0,Math.min(0.12,(ts-lastTs)/1000));
      lastTs=ts;
      var active=false;
      if(exp==='cond'&&cd.lit){
        if(G().burndown){
          for(var j=0;j<2;j++){
            if(!cd.out[j]){
              cd.candleH[j]=Math.max(0,cd.candleH[j]-0.12*dt);
              if(cd.candleH[j]<=0){ cd.out[j]=true; ui.toast(el,true,'초가 다 타서 꺼졌어요 — 탈 것이 없어졌거든요!'); }
              else active=true;
            }
          }
        } else {
          for(var i=0;i<2;i++){
            if(cd.cup[i]&&!cd.out[i]){
              cd.oxy[i]=Math.max(0,cd.oxy[i]-RATE[i]*dt);
              if(cd.oxy[i]<=0){ cd.out[i]=true; ui.toast(el,true,(i===0?'🥛 작은 컵':'🫙 큰 컵')+' 촛불이 꺼졌어요 — 산소를 다 썼거든요!'); }
              else active=true;
            }
          }
        }
        renderScene(); renderStatus(); checkMission();
      }
      if(active)raf=requestAnimationFrame(tick); else lastTs=null;
    }
    function douse(k){
      if(!ex.burning){ ui.toast(el,false,'불이 이미 꺼졌어요 — 🔥 다시 피워서 다른 방법도!'); return; }
      ex.burning=false; ex.used[k]=true;
      var M={ water:{why:'온도를 발화점보다 낮췄어요!', t:'💧 치익— 물이 온도를 낮춰서 꺼졌어요'},
              cover:{why:'산소를 차단했어요!', t:'🪣 덮으니 산소가 못 들어와 꺼졌어요'},
              remove:{why:'탈 물질을 없앴어요!', t:'✂️ 탈 것이 없으니 꺼졌어요'} };
      ex.why=M[k].why; ui.toast(el,true,M[k].t);
      renderScene(); renderStatus(); checkMission();
    }
    function relight(){ ex.burning=true; ex.why=''; renderScene(); renderStatus(); }

    /* ───────────── 미션 (고학년 = 기존 v1) ───────────── */
    var MISSIONS=[
      { exp:'cond', text:'🔥 불을 붙이고, <b style="color:#7048E8;">연소의 세 조건</b> 칩을 모두 눌러 확인해 봐요!',
        check:function(){ return exp==='cond' && cd.lit && cd.chips.fuel && cd.chips.oxy && cd.chips.temp; } },
      { exp:'cond', text:'🥛 작은 컵과 🫙 큰 컵을 덮고 <b style="color:#7048E8;">어느 쪽이 먼저 꺼지는지</b> 지켜봐요!',
        check:function(){ return exp==='cond' && cd.out[0] && cd.out[1]; } },
      { exp:'ext', text:'💧 <b style="color:#7048E8;">물을 뿌려</b> 불을 꺼 봐요 — 무엇을 없애서 꺼지는 걸까요?',
        check:function(){ return exp==='ext' && ex.used.water; } },
      { exp:'ext', text:'🔥 다시 피워서 🪣 <b style="color:#7048E8;">덮기</b>와 ✂️ <b style="color:#7048E8;">치우기</b>로도 꺼 봐요 — 3가지 방법 완성!',
        check:function(){ return exp==='ext' && ex.used.water && ex.used.cover && ex.used.remove; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=탈 것 있어야 탐·다 타면 꺼짐(★초가 타들어가 소진=신규 구현, 저학년 닻) / 중=컵 덮으면 꺼짐(산소)·큰 컵 오래 탐 / 고=연소 3요소·소화 원리(기존 유지).
       ※ 산소 100%·우주 만약에 + 발화점은 후속 분리. */
    var LOW_MISSIONS=[
      { exp:'cond', text:'🔥 <b style="color:#7048E8;">촛불을 켜</b> 봐요 — 초(탈 것)가 있으니 불이 붙어요!',
        check:function(){ return exp==='cond' && cd.lit; } },
      { exp:'cond', text:'⏳ 그대로 두고 지켜봐요 — 초가 <b style="color:#7048E8;">다 타면 저절로 꺼져요!</b>',
        check:function(){ return exp==='cond' && (cd.out[0]||cd.out[1]); } }
    ];
    var MID_MISSIONS=[
      { exp:'cond', text:'🔥 촛불을 켜고 🥛 <b style="color:#7048E8;">작은 컵</b>을 덮어 봐요 — 잠시 뒤 꺼져요! (산소가 떨어져서)',
        check:function(){ return exp==='cond' && cd.out[0]; } },
      { exp:'cond', text:'🫙 <b style="color:#7048E8;">큰 컵</b>도 덮어, 어느 쪽이 <b style="color:#7048E8;">더 오래 타는지</b> 비교해 봐요!',
        check:function(){ return exp==='cond' && cd.out[0] && cd.out[1]; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],        missions:LOW_MISSIONS, exps:['cond'],       chips:false, cups:false, burndown:true  },
      mid:  { modes:['free','mission','quiz'], missions:MID_MISSIONS, exps:['cond'],       chips:false, cups:true,  burndown:false },
      high: { modes:['free','mission','quiz'], missions:MISSIONS,     exps:['cond','ext'], chips:true,  cups:true,  burndown:false }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return G().missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false; resetAll(); build();
    }});

    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1){
            mStep++;
            var keep=(M[mStep].exp===exp);
            exp=M[mStep].exp;
            if(!keep){ cdReset(); exReset(); }
          } else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { pic:'cond', q:'연소에 꼭 필요한 세 가지가 아닌 것은?', ch:['이산화탄소','탈 물질','산소'], a:0 },
      { pic:'cond', q:'타는 초에 컵을 덮으면 불이 꺼지는 까닭은?', ch:['산소가 부족해져서','초가 사라져서','컵이 무거워서'], a:0 },
      { pic:'ext', q:'물을 뿌려 불을 끄는 것은 무엇을 없앤 것일까요?', ch:['발화점 이상의 온도','탈 물질','이산화탄소'], a:0 },
      { pic:'cond', q:'초가 탈 때 생겨서 석회수를 뿌옇게 만드는 기체는?', ch:['이산화탄소','산소','수소'], a:0 },
      { pic:'ext', q:'불이 났을 때 올바른 대피 방법은?', ch:['젖은 수건으로 코·입 막고 낮은 자세로','엘리베이터로 빨리 내려가기','연기 쪽으로 뛰기'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function expTabs(){
      if(G().exps.length<=1) return '';
      var L=[['cond','🕯️ 연소의 조건'],['ext','🧯 소화']];
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + L.map(function(x){ var on=(exp===x[0]);
            return '<button class="bn-exp" data-e="'+x[0]+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.hot+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.hot:'#fff')+';color:'+(on?'#fff':C.hot)+';">'+x[1]+'</button>'; }).join('')
        + '</div>';
    }
    function ctrlRow(){
      if(exp==='cond'){
        var g=G();
        var s='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="bn-btn" data-act="light" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 '+(g.cups?'두 촛불 켜기':'촛불 켜기')+'</button>';
        if(g.cups) s+='<button class="bn-btn" data-act="cup0" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">🥛 작은 컵 덮기</button>'
          +'<button class="bn-btn" data-act="cup1" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">🫙 큰 컵 덮기</button>';
        s+='<button class="bn-btn" data-act="cdReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 초</button></div>';
        return s;
      }
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        +'<button class="bn-btn" data-act="water" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">💧 물 뿌리기</button>'
        +'<button class="bn-btn" data-act="cover" style="'+btn+'background:#fff;color:'+C.org+';border-color:'+C.org+';">🪣 덮기</button>'
        +'<button class="bn-btn" data-act="remove" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">✂️ 탈 물질 치우기</button>'
        +'<button class="bn-btn" data-act="relight" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 다시 피우기</button></div>';
    }

    function build(){
      var M=curMissions();
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=expTabs()+ctrlRow();
      el.innerHTML='<style>.bn-btn:active,.bn-exp:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 18px !important;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="bn-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="bn-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; resetAll();
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      renderScene(); bind(); bands.bind(el); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    function renderScene(){
      var stage=el.querySelector('.bn-stage'); if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='cond')drawCond(svg); else drawExt(svg);
      stage.appendChild(svg);
    }

    function flame(x,y,big){
      return '<ellipse cx="'+x+'" cy="'+(y-26)+'" rx="'+(big?15:11)+'" ry="'+(big?26:19)+'" fill="'+C.org+'"/>'
        +'<ellipse cx="'+x+'" cy="'+(y-21)+'" rx="'+(big?8:6)+'" ry="'+(big?15:11)+'" fill="'+C.yel+'"/>';
    }
    function candle(x,y,lit,outSmoke,hPct){
      hPct=(hPct==null?1:hPct);
      var H=110, h0=Math.max(6,H*hPct), top=y+(H-h0);
      var h='<rect x="'+(x-22)+'" y="'+top+'" width="44" height="'+h0+'" rx="9" fill="#FFF3BF" stroke="#E9C46A" stroke-width="3"/>'
        +'<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top-12)+'" stroke="#5a4632" stroke-width="4"/>';
      if(lit)h+=flame(x,top-10,true);
      else if(outSmoke)h+='<path d="M '+x+' '+(top-16)+' q -8 -16 2 -30 q 9 -13 1 -26" stroke="#ADB5BD" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>';
      return h;
    }
    function drawCond(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var h='<rect x="60" y="372" width="780" height="22" rx="10" fill="#C8B6A6"/>';
      var POS=[290,610], CUP=[{w:120,hh:170,nm:'작은 컵'},{w:170,hh:240,nm:'큰 컵'}];
      for(var i=0;i<2;i++){
        var x=POS[i];
        h+=candle(x,262,cd.lit&&!cd.out[i],cd.out[i], G().burndown?cd.candleH[i]:1);
        if(cd.cup[i]){
          var c=CUP[i];
          h+='<rect x="'+(x-c.w/2)+'" y="'+(372-c.hh)+'" width="'+c.w+'" height="'+c.hh+'" rx="14" fill="'+C.glass+'" opacity="0.34" stroke="'+C.blue+'" stroke-width="3"/>';
          // 산소 게이지
          h+='<rect x="'+(x-52)+'" y="96" width="104" height="22" rx="9" fill="#fff" stroke="'+C.good+'" stroke-width="3"/>'
            +'<rect x="'+(x-49)+'" y="99" width="'+(98*cd.oxy[i]/100)+'" height="16" rx="7" fill="'+C.good+'"/>'
            +'<text x="'+x+'" y="88" text-anchor="middle" font-size="16" font-weight="800" fill="'+C.good+'" font-family="inherit">산소 '+Math.round(cd.oxy[i])+'%</text>';
        }
        if(G().cups) h+='<text x="'+x+'" y="425" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'" font-family="inherit">'+CUP[i].nm+(cd.out[i]?' — 꺼짐!':'')+'</text>';
        else h+='<text x="'+x+'" y="425" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'" font-family="inherit">'+(cd.out[i]?'다 탔어요!':'촛불')+'</text>';
      }
      // 조건 칩 3개 — 고학년만 (연소 3요소 과학 개념)
      if(G().chips){
        var CH=[['fuel','🕯️ 탈 물질'],['oxy','💨 산소'],['temp','🌡️ 발화점 이상 온도']];
        CH.forEach(function(c,i){
          var on=cd.chips[c[0]], x=90, y=40+i*52, wdt=c[1].length*15+44;
          h+='<g class="bn-chip" data-k="'+c[0]+'" style="cursor:pointer;">'
            +'<rect x="'+x+'" y="'+y+'" width="'+wdt+'" height="40" rx="13" fill="'+(on?C.good:'#fff')+'" stroke="'+(on?C.good:C.vio)+'" stroke-width="3"/>'
            +'<text x="'+(x+wdt/2)+'" y="'+(y+27)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+(on?'#fff':C.vio)+'" font-family="inherit">'+c[1]+(on?' ✓':'')+'</text></g>';
        });
        h+='<text x="710" y="50" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.sub+'" font-family="inherit">조건 칩을 눌러 보세요 →</text>';
      }
      g.innerHTML=h;
    }
    function drawExt(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var h='<rect x="60" y="372" width="780" height="22" rx="10" fill="#C8B6A6"/>'
        // 모닥불 장작
        +'<g'+(ex.burning?'':' opacity="0.55"')+'><line x1="380" y1="370" x2="520" y2="320" stroke="#8D6E63" stroke-width="16" stroke-linecap="round"/>'
        +'<line x1="520" y1="370" x2="380" y2="320" stroke="#6E4226" stroke-width="16" stroke-linecap="round"/></g>';
      if(ex.burning){
        h+='<ellipse cx="450" cy="282" rx="52" ry="74" fill="'+C.org+'"/>'
          +'<ellipse cx="450" cy="298" rx="30" ry="46" fill="'+C.yel+'"/>'
          +'<text x="450" y="180" text-anchor="middle" font-size="22" font-weight="800" fill="'+C.hot+'" font-family="inherit">🔥 활활 타는 중 — 어떻게 끌까요?</text>';
      } else {
        h+='<path d="M 450 330 q -12 -26 4 -48 q 14 -22 2 -44" stroke="#ADB5BD" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85"/>'
          +'<text x="450" y="150" text-anchor="middle" font-size="24" font-weight="800" fill="'+C.good+'" font-family="inherit">불이 꺼졌어요!</text>'
          +'<text x="450" y="188" text-anchor="middle" font-size="20" font-weight="800" fill="'+C.vio+'" font-family="inherit">'+ex.why+'</text>';
      }
      // 체험 배지
      var BD=[['water','💧 온도 낮추기'],['cover','🪣 산소 차단'],['remove','✂️ 탈 물질 없애기']];
      BD.forEach(function(b,i){
        var on=ex.used[b[0]], x=70, y=40+i*52, wdt=b[1].length*15+44;
        h+='<rect x="'+x+'" y="'+y+'" width="'+wdt+'" height="40" rx="13" fill="'+(on?C.good:'#fff')+'" stroke="'+(on?C.good:'#CBD5E1')+'" stroke-width="3"/>'
          +'<text x="'+(x+wdt/2)+'" y="'+(y+27)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+(on?'#fff':'#94A3B8')+'" font-family="inherit">'+b[1]+(on?' ✓':'')+'</text>';
      });
      g.innerHTML=h;
    }

    /* ───────────── 상태줄 ───────────── */
    function renderStatus(){
      var s=el.querySelector('.bn-status'); if(!s)return;
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp, msg;
      if(pic==='cond'){
        if(grade==='low'){
          if(cd.out[0]||cd.out[1]) msg='<span style="color:'+C.good+';font-size:19px;">초가 다 타서 꺼졌어요 — 탈 것(초)이 없어졌거든요!</span>';
          else if(cd.lit) msg='<span style="color:'+C.ink+';font-size:19px;">초가 조금씩 타들어가는 중… 다 타면 어떻게 될까요?</span>';
          else msg='<span style="color:'+C.sub+';font-size:19px;">🔥 촛불을 켜 봐요 — 초(탈 것)가 있으면 불이 붙어요!</span>';
        }
        else if(cd.out[0]&&cd.out[1]) msg='<span style="color:'+C.good+';font-size:19px;">큰 컵이 더 오래 탔죠? 산소가 더 많았으니까요!</span>';
        else if(cd.out[0]) msg='<span style="color:'+C.ink+';font-size:19px;">작은 컵이 먼저 꺼졌어요 — 큰 컵은 아직!</span>';
        else if(cd.cup[0]||cd.cup[1]) msg='<span style="color:'+C.ink+';font-size:19px;">컵 속 산소가 점점 줄어요…</span>';
        else if(cd.lit) msg='<span style="color:'+C.ink+';font-size:19px;">'+(G().chips?'조건 칩을 확인하고, 컵을 덮어 봐요!':'🥛 컵을 덮어 어떻게 되는지 봐요!')+'</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">🔥 촛불을 켜고 연소의 조건을 알아봐요</span>';
      } else {
        var n=(ex.used.water?1:0)+(ex.used.cover?1:0)+(ex.used.remove?1:0);
        msg='<span style="color:'+(n===3?C.good:C.sub)+';font-size:19px;">'+(n===3?'세 조건 중 하나만 없애도 불은 꺼져요 — 이게 소화!':'소화 방법 체험 '+n+'/3 — 조건 하나를 없애면 꺼져요')+'</span>';
      }
      s.innerHTML=msg;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.bn-exp').forEach(function(b){
        b.addEventListener('click',function(){ exp=b.dataset.e; stopRaf(); build(); });
      });
      el.querySelectorAll('.bn-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var a=b.dataset.act;
          if(a==='light')light();
          else if(a==='cup0')cover(0);
          else if(a==='cup1')cover(1);
          else if(a==='cdReset'){ cdReset(); build(); }
          else if(a==='water')douse('water');
          else if(a==='cover')douse('cover');
          else if(a==='remove')douse('remove');
          else if(a==='relight')relight();
        });
      });
      el.addEventListener('click',function(ev){
        var c=ev.target.closest?ev.target.closest('.bn-chip'):null;
        if(c)chip(c.dataset.k);
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    build();
    return { destroy:function(){ stopRaf(); } };
  });
})();
