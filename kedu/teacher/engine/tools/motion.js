/* ============================================================================
   케이랩 도구 모듈 — 물체의 운동과 속력 (motion) v1  [과학 13호 · 에너지 영역]
   5학년 물체의 운동. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 시간을 1초씩 멈춰 가며 위치 변화를 점으로 남겨 비교 —
   실제 운동장에선 불가능한 "시간 정지 + 자취 보기".
   변수 → 현상 → 발견:
     ▸ 🏁 빠르기 비교 — 🚶(2m/s)·🚲(5m/s)·🚗(10m/s)가 100m 트랙 경주.
       ⏭ 1초 지나기로 시간이 갈수록 위치가 변함(=운동), 1초마다 자취 점.
       같은 시간 → 멀리 간 쪽이 빠름 / 같은 거리(결승선) → 짧은 시간이 빠름.
     ▸ 🧮 속력 계산 — 카드 클릭하면 속력 = 거리 ÷ 시간 계산식 펼침.
   미션 4종(운동 확인/같은 시간 비교/결승 기록/속력 계산) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('motion', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, lastTs = null;
    var C = { ink:'#1B3A57', sub:'#5a7894', blue:'#1565C0', org:'#FF8A3D', good:'#12B886', vio:'#7048E8', track:'#E7F0F9' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }

    /* ───────────── 상태 ───────────── */
    var OBJ = [ {k:'walk', ic:'🚶', nm:'사람',   v:2,  col:'#12B886'},
                {k:'bike', ic:'🚲', nm:'자전거', v:5,  col:'#1565C0'},
                {k:'car',  ic:'🚗', nm:'자동차', v:10, col:'#FF8A3D'} ];
    var DIST = 100;                       // 결승선(m)
    var exp;                              // 'race' | 'calc'
    var mo, sp;
    function moReset(){ mo={ t:0, auto:false, fin:{walk:null,bike:null,car:null}, clickedFastest:false }; if(raf){cancelAnimationFrame(raf);raf=null;} }
    function spReset(){ sp={ seen:{walk:false,bike:false,car:false} }; }
    function resetAll(){ exp='race'; moReset(); spReset(); }
    resetAll();

    function distOf(o){ return Math.min(DIST, o.v*mo.t); }
    function stepTime(dt){
      if(mo.fin.walk!==null&&mo.fin.bike!==null&&mo.fin.car!==null){ mo.auto=false; return; }
      mo.t=Math.round((mo.t+dt)*10)/10;
      OBJ.forEach(function(o){ if(mo.fin[o.k]===null && o.v*mo.t>=DIST) mo.fin[o.k]=Math.ceil(DIST/o.v); });
      renderScene(); renderStatus(); checkMission();
    }
    function toggleAuto(){
      mo.auto=!mo.auto;
      if(mo.auto){ lastTs=null; raf=requestAnimationFrame(tick); }
      else if(raf){ cancelAnimationFrame(raf); raf=null; }
      renderCtrl();
    }
    function tick(ts){
      if(!mo.auto)return;
      if(lastTs!=null){ stepTime(Math.min(0.1,(ts-lastTs)/1000*2)); } // 실제 1초 = 시뮬 2초
      lastTs=ts;
      if(mo.auto)raf=requestAnimationFrame(tick);
    }
    function clickObj(k){
      if(exp==='race'){
        if(mo.t<=0){ ui.toast(el,false,'아직 출발 전이에요 — ⏭ 시간을 보내 봐요!'); return; }
        var o=OBJ.filter(function(x){return x.k===k;})[0];
        var d=distOf(o), tt=(mo.fin[k]!==null)?mo.fin[k]:mo.t;
        ui.toast(el,true,o.ic+' 지금까지 '+Math.round(d)+'m — '+(Math.round(d/tt*10)/10)+' m/s');
        if(k==='car'&&mo.t>=5)mo.clickedFastest=true;
        else if(mode==='mission'&&mStep===1&&mo.t>=5&&!mLock)ui.toast(el,false,'가장 멀리 간 물체를 찾아 봐요!');
        checkMission();
      } else {
        sp.seen[k]=true; renderScene(); renderStatus(); checkMission();
      }
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { exp:'race', text:'⏭ <b style="color:#7048E8;">1초 지나기</b>를 눌러 봐요 — 시간이 가면 <b style="color:#7048E8;">위치가 변하죠</b>? 이게 운동!',
        check:function(){ return exp==='race' && mo.t>=2; } },
      { exp:'race', text:'<b style="color:#7048E8;">5초</b>가 넘었을 때, <b style="color:#7048E8;">같은 시간</b> 동안 가장 멀리 간 물체를 클릭!',
        check:function(){ return exp==='race' && mo.clickedFastest; } },
      { exp:'race', text:'시간을 계속 보내 셋 모두 <b style="color:#7048E8;">100m 결승선</b>을 통과시키고 기록을 비교해 봐요!',
        check:function(){ return exp==='race' && mo.fin.walk!==null && mo.fin.bike!==null && mo.fin.car!==null; } },
      { exp:'calc', text:'🧮 카드 셋을 모두 눌러 <b style="color:#7048E8;">속력 = 거리 ÷ 시간</b> 계산을 확인해 봐요!',
        check:function(){ return exp==='calc' && sp.seen.walk && sp.seen.bike && sp.seen.car; } }
    ];
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<mISSlen()-1){
            mStep++;
            var keep=(MISSIONS[mStep].exp===exp); // 1→2→3은 같은 경주 이어서
            exp=MISSIONS[mStep].exp;
            if(!keep){ moReset(); spReset(); }
          } else mDone=true;
          build();
        },1500);
      }
    }
    function mISSlen(){ return MISSIONS.length; }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { pic:'race', q:'시간이 지남에 따라 물체의 위치가 변하는 것을 무엇이라고 할까요?', ch:['운동','정지','속력'], a:0 },
      { pic:'race', q:'같은 거리를 이동했을 때 더 빠른 물체는?', ch:['걸린 시간이 짧은 물체','걸린 시간이 긴 물체','늦게 출발한 물체'], a:0 },
      { pic:'race', q:'같은 시간 동안 더 빠른 물체는?', ch:['더 긴 거리를 간 물체','더 짧은 거리를 간 물체','제자리에 있던 물체'], a:0 },
      { pic:'calc', q:'30m를 5초 동안 이동한 물체의 속력은?', ch:['6 m/s','25 m/s','35 m/s'], a:0 },
      { pic:'race', q:'속력이 빠른 차가 다니는 도로 주변에서 올바른 행동은?', ch:['공놀이를 하지 않아요','도로에서 술래잡기를 해요','차 사이로 뛰어가요'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:20px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function expTabs(){
      var L=[['race','🏁 빠르기 비교'],['calc','🧮 속력 계산']];
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + L.map(function(x){ var on=(exp===x[0]);
            return '<button class="mt-exp" data-e="'+x[0]+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.blue+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.blue:'#fff')+';color:'+(on?'#fff':C.blue)+';">'+x[1]+'</button>'; }).join('')
        + '</div>';
    }
    function ctrlRow(){
      if(exp!=='race')return '<div style="height:4px;"></div>';
      return '<div class="mt-ctrl" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrlBtns()+'</div>';
    }
    function ctrlBtns(){
      return '<button class="mt-btn" data-act="step" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">⏭ 1초 지나기</button>'
        +'<button class="mt-btn" data-act="auto" style="'+btn+(mo.auto?'background:'+C.org+';color:#fff;border-color:'+C.org:'background:#fff;color:'+C.org+';border-color:'+C.org)+';">'+(mo.auto?'⏸ 멈추기':'▶ 자동 재생')+'</button>'
        +'<button class="mt-btn" data-act="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 다시 출발선</button>';
    }
    function renderCtrl(){ var c=el.querySelector('.mt-ctrl'); if(c){ c.innerHTML=ctrlBtns(); bindBtns(); } }

    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=expTabs()+ctrlRow();
      el.innerHTML='<style>.mt-btn:active,.mt-exp:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="mt-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="mt-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; resetAll();
        if(m==='mission')exp=MISSIONS[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      renderScene(); bindBtns(); bindStage(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var X0=90, XW=700; // 0m→x=90, 100m→x=790
    function xOf(d){ return X0+XW*d/DIST; }
    function renderScene(){
      var stage=el.querySelector('.mt-stage'); if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='race')drawRace(svg); else drawCalc(svg);
      stage.appendChild(svg);
    }

    function drawRace(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var h='';
      // 시계
      h+='<rect x="370" y="14" width="160" height="44" rx="14" fill="#fff" stroke="'+C.ink+'" stroke-width="3"/>'
        +'<text x="450" y="45" text-anchor="middle" font-size="24" font-weight="800" fill="'+C.ink+'" font-family="inherit">⏱ '+Math.floor(mo.t)+'초</text>';
      // 거리 눈금
      for(var d=0;d<=DIST;d+=20){
        h+='<line x1="'+xOf(d)+'" y1="80" x2="'+xOf(d)+'" y2="430" stroke="#C6D8EA" stroke-width="2" stroke-dasharray="4 7"/>'
          +'<text x="'+xOf(d)+'" y="76" text-anchor="middle" font-size="15" font-weight="800" fill="'+C.sub+'" font-family="inherit">'+d+'m</text>';
      }
      // 결승선
      h+='<line x1="'+xOf(DIST)+'" y1="80" x2="'+xOf(DIST)+'" y2="430" stroke="'+C.ink+'" stroke-width="5"/>'
        +'<text x="'+xOf(DIST)+'" y="450" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.ink+'" font-family="inherit">🏁 결승</text>';
      // 레인
      OBJ.forEach(function(o,i){
        var y=120+i*110, d=distOf(o);
        h+='<rect x="'+(X0-60)+'" y="'+(y-34)+'" width="'+(XW+90)+'" height="72" rx="18" fill="'+C.track+'"/>';
        // 자취 점(1초마다 위치)
        for(var k=1;k<=Math.floor(mo.t);k++){
          var dk=Math.min(DIST,o.v*k);
          h+='<circle cx="'+xOf(dk)+'" cy="'+(y+24)+'" r="4.5" fill="'+o.col+'" opacity="0.55"/>';
          if(dk>=DIST)break;
        }
        h+='<text x="'+xOf(d)+'" y="'+(y+12)+'" text-anchor="middle" font-size="46" font-family="inherit" class="mt-obj" data-k="'+o.k+'" style="cursor:pointer;">'+o.ic+'</text>'
          +'<text x="'+(X0-58)+'" y="'+(y+8)+'" font-size="17" font-weight="800" fill="'+o.col+'" font-family="inherit">'+o.nm+'</text>';
        // 기록
        if(mo.fin[o.k]!==null){
          h+='<rect x="'+(xOf(DIST)+8)+'" y="'+(y-18)+'" width="92" height="40" rx="11" fill="#fff" stroke="'+o.col+'" stroke-width="3"/>'
            +'<text x="'+(xOf(DIST)+54)+'" y="'+(y+9)+'" text-anchor="middle" font-size="18" font-weight="800" fill="'+o.col+'" font-family="inherit">'+mo.fin[o.k]+'초!</text>';
        }
      });
      g.innerHTML=h;
    }

    function drawCalc(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var EX={ walk:{d:10,t:5}, bike:{d:25,t:5}, car:{d:50,t:5} };
      var h='<text x="450" y="48" text-anchor="middle" font-size="26" font-weight="800" fill="'+C.vio+'" font-family="inherit">속력 = 이동 거리 ÷ 걸린 시간</text>';
      OBJ.forEach(function(o,i){
        var e=EX[o.k], x=60+i*270, y=90, seen=sp.seen[o.k];
        h+='<g class="mt-card" data-k="'+o.k+'" style="cursor:pointer;">'
          +'<rect x="'+x+'" y="'+y+'" width="240" height="300" rx="22" fill="#fff" stroke="'+(seen?C.good:o.col)+'" stroke-width="4"/>'
          +'<text x="'+(x+120)+'" y="'+(y+82)+'" text-anchor="middle" font-size="62" font-family="inherit">'+o.ic+'</text>'
          +'<text x="'+(x+120)+'" y="'+(y+136)+'" text-anchor="middle" font-size="21" font-weight="800" fill="'+C.ink+'" font-family="inherit">'+e.d+'m를 '+e.t+'초에!</text>'
          +(seen
            ? '<rect x="'+(x+22)+'" y="'+(y+162)+'" width="196" height="92" rx="14" fill="#E6FCF5"/>'
              +'<text x="'+(x+120)+'" y="'+(y+200)+'" text-anchor="middle" font-size="23" font-weight="800" fill="'+C.ink+'" font-family="inherit">'+e.d+' ÷ '+e.t+' = '+(e.d/e.t)+'</text>'
              +'<text x="'+(x+120)+'" y="'+(y+236)+'" text-anchor="middle" font-size="24" font-weight="800" fill="'+C.good+'" font-family="inherit">속력 '+(e.d/e.t)+' m/s</text>'
            : '<text x="'+(x+120)+'" y="'+(y+212)+'" text-anchor="middle" font-size="20" font-weight="800" fill="'+C.sub+'" font-family="inherit">눌러서 계산!</text>')
          +'</g>';
      });
      g.innerHTML=h;
    }

    /* ───────────── 상태줄 ───────────── */
    function renderStatus(){
      var s=el.querySelector('.mt-status'); if(!s)return;
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp, msg;
      if(pic==='race'){
        var fin=OBJ.filter(function(o){return mo.fin[o.k]!==null;}).length;
        if(fin===3) msg='<span style="color:'+C.good+';font-size:19px;">기록 비교 — 같은 거리(100m), 시간이 짧을수록 빠른 거예요!</span>';
        else if(mo.t>0) msg='<span style="color:'+C.ink+';font-size:19px;">'+Math.floor(mo.t)+'초 — 같은 시간인데 간 거리가 다르죠? 물체를 눌러 확인!</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">⏭ 시간을 보내면 위치가 변해요 — 이게 바로 운동!</span>';
      } else {
        var n=(sp.seen.walk?1:0)+(sp.seen.bike?1:0)+(sp.seen.car?1:0);
        msg='<span style="color:'+(n===3?C.good:C.sub)+';font-size:19px;">'+(n===3?'같은 시간(5초)이면 거리만 비교해도 빠르기를 알 수 있어요!':'카드를 눌러 속력을 계산해 봐요 ('+n+'/3)')+'</span>';
      }
      s.innerHTML=msg;
    }

    /* ───────────── 바인딩 ───────────── */
    function bindBtns(){
      el.querySelectorAll('.mt-exp').forEach(function(b){
        b.addEventListener('click',function(){ exp=b.dataset.e; moReset(); build(); });
      });
      el.querySelectorAll('.mt-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var a=b.dataset.act;
          if(a==='step')stepTime(1);
          else if(a==='auto')toggleAuto();
          else if(a==='reset'){ moReset(); build(); }
        });
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
    function bindStage(){
      el.addEventListener('click',function(ev){
        var t=ev.target.closest?(ev.target.closest('.mt-obj')||ev.target.closest('.mt-card')):null;
        if(t)clickObj(t.dataset.k);
      });
    }

    build();
    return { destroy:function(){ if(raf)cancelAnimationFrame(raf); } };
  });
})();
