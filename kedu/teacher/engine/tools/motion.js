/* ============================================================================
   케이랩 도구 모듈 — 물체의 운동과 속력 (motion) v2+탐구표준v2  [과학 13호 · 에너지 영역]
   5학년 물체의 운동. KLab.ui 3모드(자유탐구/미션/퀴즈)+🌀만약에 + 학년칸(헌법 3장).
   디지털 우위: 시간을 1초씩 멈춰 가며 위치 변화를 점으로 남겨 비교 —
   실제 운동장에선 불가능한 "시간 정지 + 자취 보기".
   ── 학년 칸 (카드 D칸 닻대로) ──
     저(🌱): 빠르다·느리다 — 누가 더 빠를까. race만, 일상어, 속력식·가속 숨김.
     중(🌿): 거리·시간 함께 보기 — 멀리 간 게 빠른 걸까. race 중심. 🌀 2종.
     고(🌳): 속력 계산 + 등속/가속 구분. race + calc + accel + 🌀 3종 + v2 변수.
   ── 탐구 표준 v2 (2026-07-04 증축 · redesigns/motion.md) ──
     1층 변수: 🚗 자동차 속력 슬라이더(3~20m/s — 자취 점 간격 = 속력) +
               ⏱ 출발 지연 슬라이더(0~5초 — 늦게 출발해도 따라잡는 역전).
               고학년 자유탐구·race 전용. 기본값(10m/s·0초) = 기존 거동 완전 동일.
     2층 만약에: 🚴 멀리 간 자전거 vs 가까이 간 자동차(원본 G칸 상환·오개념①) /
               🧊 마찰이 없다면(원본 D칸 고 만약에 상환 — 얼음 공은 안 멈춤) /
               🐘 무거우면 빨리 떨어질까(오개념③ — 진공 동시 낙하·아폴로 15호).
               중=🚴🐘, 고=3종.
     3층 예측: 속력·지연 첫 조작 = 🔮 무장 → 관찰 해소·칩. 만약에 정리 자동 칩.
               5칩 = 🏎 꼬마 속력탐정 토스트.
     4층: SVG 유지(트랙 2D 자취가 원리 그 자체). 신규 자산 0.
   변수 → 현상 → 발견:
     ▸ 🏁 빠르기 비교 — 🚶(2)·🚲(5)·🚗(10~변수)이 100m 트랙 경주, 1초마다 자취 점.
     ▸ 🧮 속력 계산(고) — 카드 클릭, 속력 = 거리 ÷ 시간 식 펼침.
     ▸ 🚀 등속/가속(고) — 등속차 vs 가속로켓, 자취 점 간격으로 가속 발견.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   - config: { mode:"free"|"mission"|"quiz", grade:"low"|"mid"|"high" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('motion', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, lastTs = null, wraf = null;
    var C = { ink:'#1B3A57', sub:'#5a7894', blue:'#1565C0', org:'#FF8A3D', good:'#12B886', vio:'#7048E8', track:'#E7F0F9', rocket:'#E8590C' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function snd(n){ try{ window.KLab.sound.play(n); }catch(e){} }

    /* ───────────── 상태 ───────────── */
    var OBJ = [ {k:'walk', ic:'🚶', nm:'사람',   v:2,  col:'#12B886'},
                {k:'bike', ic:'🚲', nm:'자전거', v:5,  col:'#1565C0'},
                {k:'car',  ic:'🚗', nm:'자동차', v:10, col:'#FF8A3D'} ];
    var DIST = 100;                       // 결승선(m)
    var ACC_A = 1.3;                      // 가속 로켓 가속도 (s = 0.5·a·t²)
    var exp;                              // 'race' | 'calc' | 'accel'
    var mo, sp, ac;
    /* ── v2 1층 변수 (고·free·race 전용 — 기본값 = 기존 거동) ── */
    var carV=10, carDelay=0;
    function v2reset(){ carV=10; carDelay=0; }
    function vOf(o){ return (o.k==='car')?carV:o.v; }
    function elapsedOf(o,t){ return (o.k==='car')?Math.max(0,t-carDelay):t; }
    function dOf(o,t){ return Math.min(DIST, vOf(o)*elapsedOf(o,t)); }
    function finT(o){ var f=DIST/vOf(o)+((o.k==='car')?carDelay:0); return Math.round(f*10)/10; }
    function moReset(){ mo={ t:0, auto:false, fin:{walk:null,bike:null,car:null}, clickedFastest:false }; if(raf){cancelAnimationFrame(raf);raf=null;} }
    function spReset(){ sp={ seen:{walk:false,bike:false,car:false} }; }
    function acReset(){ ac={ t:0, auto:false, finC:null, finR:null }; if(raf){cancelAnimationFrame(raf);raf=null;} }
    function resetAll(){ exp=GRADES?GRADES[grade].exps[0]:'race'; moReset(); spReset(); acReset(); v2reset(); wifStageReset(); }

    /* ───────────── 미션 (학년칸별) ───────────── */
    // 고(🌳) — 운동 확인 / 같은 시간 비교 / 결승 기록 / 속력 계산 / 등속·가속
    var HIGH_MISSIONS=[
      { exp:'race', text:'⏭ <b style="color:#7048E8;">1초 지나기</b>를 눌러 봐요 — 시간이 가면 <b style="color:#7048E8;">위치가 변하죠</b>? 이게 운동!',
        check:function(){ return exp==='race' && mo.t>=2; } },
      { exp:'race', text:'<b style="color:#7048E8;">5초</b>가 넘었을 때, <b style="color:#7048E8;">같은 시간</b> 동안 가장 멀리 간 물체를 클릭!',
        check:function(){ return exp==='race' && mo.clickedFastest; } },
      { exp:'race', text:'시간을 계속 보내 셋 모두 <b style="color:#7048E8;">100m 결승선</b>을 통과시키고 기록을 비교해 봐요!',
        check:function(){ return exp==='race' && mo.fin.walk!==null && mo.fin.bike!==null && mo.fin.car!==null; } },
      { exp:'calc', text:'🧮 카드 셋을 모두 눌러 <b style="color:#7048E8;">속력 = 거리 ÷ 시간</b> 계산을 확인해 봐요!',
        check:function(){ return exp==='calc' && sp.seen.walk && sp.seen.bike && sp.seen.car; } },
      { exp:'accel', text:'🚀 시간을 보내며 <b style="color:#7048E8;">자취 점 간격</b>을 봐요 — 점점 벌어지는 쪽이 <b style="color:#7048E8;">점점 빨라지는(가속)</b> 거예요!',
        check:function(){ return exp==='accel' && ac.t>=8; } }
    ];
    // 중(🌿) — 운동 / 같은 시간 거리 비교 / 결승 기록(거리·시간 함께)
    var MID_MISSIONS=[
      { exp:'race', text:'⏭ <b style="color:#7048E8;">1초 지나기</b>로 시간을 보내 봐요 — 위치가 변하죠? 이게 <b style="color:#7048E8;">운동</b>이에요!',
        check:function(){ return exp==='race' && mo.t>=2; } },
      { exp:'race', text:'<b style="color:#7048E8;">같은 시간</b> 동안 가장 <b style="color:#7048E8;">멀리</b> 간 물체를 클릭! 멀리 갔다 = 빠르다.',
        check:function(){ return exp==='race' && mo.clickedFastest; } },
      { exp:'race', text:'셋 다 <b style="color:#7048E8;">100m 결승선</b>을 통과시켜 봐요 — 같은 거리면 <b style="color:#7048E8;">시간이 짧은</b> 쪽이 빠른 거예요!',
        check:function(){ return exp==='race' && mo.fin.walk!==null && mo.fin.bike!==null && mo.fin.car!==null; } }
    ];
    // 저(🌱) — 빠르다·느리다, 누가 빠를까
    var LOW_MISSIONS=[
      { exp:'race', text:'⏭ <b style="color:#7048E8;">1초 지나기</b>를 눌러 봐요 — 셋이 함께 출발해요! 누가 가장 빠른가요?',
        check:function(){ return exp==='race' && mo.t>=3; } },
      { exp:'race', text:'가장 <b style="color:#7048E8;">빠른 🚗 자동차</b>를 콕 눌러 봐요! 제일 멀리 가 있죠?',
        check:function(){ return exp==='race' && mo.clickedFastest; } }
    ];

    /* ── GRADES 테이블 (헌법 3장 + v2 만약에 게이팅) ── */
    var GRADES={
      low:  { modes:['free','mission'],                  missions:LOW_MISSIONS, exps:['race'],               wif:[] },
      mid:  { modes:['free','mission','quiz','whatif'],  missions:MID_MISSIONS, exps:['race'],               wif:['farbike','drop'] },
      high: { modes:['free','mission','quiz','whatif'],  missions:HIGH_MISSIONS,exps:['race','calc','accel'],wif:['farbike','nofric','drop'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].missions; }
    function curExps(){ return GRADES[grade].exps; }

    /* ───────────── v2 2층 — 🌀 만약에 3종 ───────────── */
    var WHATIF={
      farbike:{ icon:'🚴', title:'멀리 간 자전거 vs 가까이 간 자동차',
        q:'자전거는 30m, 자동차는 16m를 갔어요. 누가 더 빠를까요?',
        ch:['멀리 간 자전거가 빠르다','시간까지 봐야 안다 — 자동차가 빠를 수도','간 거리가 다르니 비교할 수 없다'], a:1,
        reveal:'자전거는 6초 동안 30m(1초에 5m), 자동차는 2초 동안 16m(1초에 8m)! 멀리 갔다고 빠른 게 아니에요 — 거리와 시간을 함께 봐야 진짜 빠르기가 보여요.',
        tip:'▶ 둘 다 출발시키고, 끝나면 🧮 속력 재보기로 1초 거리를 비교해요!' },
      nofric:{ icon:'🧊', title:'마찰이 없다면?',
        q:'마찰이 하나도 없는 얼음 세상에서 공을 한 번 밀면 어떻게 될까요?',
        ch:['조금 가다가 저절로 멈춘다','멈추지 않고 같은 빠르기로 계속 간다','점점 빨라진다'], a:1,
        reveal:'공이 멈추는 건 마찰이 붙잡아서예요! 마찰이 없으면 한 번 민 공은 영원히 같은 빠르기로 가요. 우주 탐사선이 엔진을 꺼도 계속 날아가는 이유죠.',
        tip:'🖐 공 밀기 — 잔디 공과 얼음 공의 자취를 비교해요!' },
      drop:{ icon:'🐘', title:'무거우면 빨리 떨어질까?',
        q:'무거운 볼링공과 가벼운 깃털을 같은 높이에서 동시에 떨어뜨리면?',
        ch:['무거운 볼링공이 먼저 떨어진다','공기가 없으면 둘이 똑같이 떨어진다','가벼운 깃털이 먼저 떨어진다'], a:1,
        reveal:'떨어지는 빠르기는 무게와 상관없어요! 깃털이 늦는 건 공기가 방해해서예요. 공기가 없는 달에서 망치와 깃털은 동시에 떨어졌답니다(아폴로 15호 실험).',
        tip:'🪂 떨어뜨려 보고, 🌌 진공으로 바꿔 다시 떨어뜨려 봐요!' }
    };
    var fb, nf, dr;
    function wifStageReset(){
      fb={ run:false, t:0, calc:false };
      nf={ run:false, gx:0, ix:0, gv:0, laps:0 };
      dr={ run:false, air:true, t:0, fl:null, bl:null };
      if(wraf){ cancelAnimationFrame(wraf); wraf=null; }
    }
    var wif;
    function makeWif(){
      var scen={}; GRADES[grade].wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ build(); },
        footEl:function(){ return el.querySelector('.mt-foot'); },
        onSelect:function(k){ wifStageReset(); },
        onPlay:function(k){ wifStageReset(); },
        onExit:function(){ wifStageReset(); }
      });
    }
    function wifKey(){ return (mode==='whatif'&&wif&&wif.active())?wif.state.key:null; }
    /* 만약에 애니 — 프레임 고정 dt=0.05s(결정적) */
    var WDT=0.05;
    function wifStep(){
      wraf=null;
      var k=wifKey(); if(!k)return;
      var go=false;
      if(k==='farbike'&&fb.run){
        fb.t=Math.min(6, Math.round((fb.t+WDT)*100)/100);
        if(fb.t>=6){ fb.run=false; build(); return; }   // 종료 = 재빌드(🧮 버튼 노출)
        go=fb.run;
      } else if(k==='nofric'&&nf.run){
        nf.gv=Math.max(0, Math.round((nf.gv-0.06)*100)/100);           // 잔디: 마찰 감속 1.2m/s²
        nf.gx=Math.round((nf.gx+nf.gv*WDT)*100)/100;
        nf.ix=Math.round((nf.ix+6*WDT)*100)/100;                        // 얼음: 등속 6m/s — 영원히
        if(nf.ix>=60){ nf.ix=Math.round((nf.ix-60)*100)/100; nf.laps++; }
        go=true;
      } else if(k==='drop'&&dr.run){
        dr.t=Math.round((dr.t+WDT)*100)/100;
        var H=8;
        var by=0.5*10*dr.t*dr.t;                                        // 볼링공: 자유낙하 g=10
        var fy=dr.air?(2*dr.t):by;                                      // 깃털: 공기=종단 2m/s · 진공=동일
        if(dr.bl===null&&by>=H)dr.bl=dr.t;
        if(dr.fl===null&&fy>=H)dr.fl=dr.t;
        if(dr.bl!==null&&dr.fl!==null)dr.run=false;
        go=dr.run;
      }
      renderScene(); renderStatus(); checkPredV2();
      if(go)wraf=requestAnimationFrame(wifStep);
    }
    function wifGo(){ if(!wraf)wraf=requestAnimationFrame(wifStep); }

    /* ───────────── v2 3층 — 🔮 예측 노트 (free·고) ───────────── */
    var chips=[], chipDone=false;
    var pred={ spd:{asked:false,ch:-1,done:false}, delay:{asked:false,ch:-1,done:false} };
    var PRED={
      spd:{ q:'🔮 예측 먼저! 자동차를 훨씬 빠르게 하면 자취 점 간격은?',
        ch:['더 촘촘해진다','그대로다','더 넓어진다'], a:2,
        tip:'속력을 16 이상으로 올리고 ⏭ 시간을 보내며 점 간격을 봐요!' },
      delay:{ q:'🔮 예측 먼저! 몇 초 늦게 출발한 자동차, 자전거보다 먼저 도착할까요?',
        ch:['늦게 출발했으니 늦게 도착한다','속력이 빠르면 따라잡아 먼저 도착한다','반드시 동시에 도착한다'], a:1,
        tip:'지연을 2초 이상으로 두고 셋 다 결승선까지 보내 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||grade!=='high'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.mt-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="mt-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="mt-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.mt-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
          checkPredV2();
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===PRED[kind].a), msg;
      if(kind==='spd') msg=hit?'✔ 예측 적중 — 빠를수록 1초 동안 더 멀리 가니 점 간격이 넓어져요! 자취 점 간격이 곧 속력이에요.'
                              :'✘ 예측 빗나감 — 점 간격이 확 넓어졌죠? 1초마다 찍히는 점이니, 빠를수록 간격이 넓어요. 간격 = 속력!';
      else msg=hit?'✔ 예측 적중 — 늦게 출발해도 속력이 빠르면 따라잡아요! "먼저 도착 = 항상 더 빠름"이 아니에요 — 출발 시각까지 봐야죠.'
                  :'✘ 예측 빗나감 — 자동차가 따라잡아 먼저 도착했어요! 도착 순서만으로 빠르기를 판단하면 안 돼요. 출발이 달랐으니까요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.mt-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:660px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPredV2(){
      if(mode!=='free')return;
      if(pred.spd.ch>=0&&!pred.spd.done&&exp==='race'&&carV>=16&&mo.t>=3)predResolve('spd');
      if(pred.delay.ch>=0&&!pred.delay.done&&exp==='race'&&carDelay>=2&&mo.fin.car!==null&&mo.fin.bike!==null&&mo.fin.car<mo.fin.bike)predResolve('delay');
    }
    var CHIPNM={farbike:'🚴 멀리간자전거',nofric:'🧊 마찰제로',drop:'🐘 낙하실험',spd:'🚗 속력예측',delay:'⏱ 지각출발'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🏎 꼬마 속력탐정 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.mt-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="mt-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +CHIPNM[c.k]+' · '+tag+'</span>';
      }).join('');
    }

    resetAll();
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false; resetAll(); makeWif(); build();
    }});
    makeWif();

    function distOf(o){ return dOf(o,mo.t); }
    function stepTime(dt){
      if(mo.fin.walk!==null&&mo.fin.bike!==null&&mo.fin.car!==null){ mo.auto=false; return; }
      mo.t=Math.round((mo.t+dt)*10)/10;
      OBJ.forEach(function(o){ if(mo.fin[o.k]===null && dOf(o,mo.t)>=DIST) mo.fin[o.k]=finT(o); });
      renderScene(); renderStatus(); checkMission(); checkPredV2();
    }
    /* 가속 무대: 등속차(v=8) vs 가속로켓(s=0.5·a·t²) */
    function accDistCar(t){ return Math.min(DIST, 8*t); }
    function accDistRocket(t){ return Math.min(DIST, 0.5*ACC_A*t*t); }
    function stepAccel(dt){
      if(ac.finC!==null&&ac.finR!==null){ ac.auto=false; return; }
      ac.t=Math.round((ac.t+dt)*10)/10;
      if(ac.finC===null && 8*ac.t>=DIST) ac.finC=Math.ceil(DIST/8);
      if(ac.finR===null && 0.5*ACC_A*ac.t*ac.t>=DIST) ac.finR=Math.round(Math.sqrt(DIST*2/ACC_A)*10)/10;
      renderScene(); renderStatus(); checkMission();
    }
    function curStep(dt){ if(exp==='accel')stepAccel(dt); else stepTime(dt); }
    function toggleAuto(){
      var st=(exp==='accel')?ac:mo;
      st.auto=!st.auto;
      if(st.auto){ lastTs=null; raf=requestAnimationFrame(tick); }
      else if(raf){ cancelAnimationFrame(raf); raf=null; }
      renderCtrl();
    }
    function tick(ts){
      var st=(exp==='accel')?ac:mo;
      if(!st.auto)return;
      if(lastTs!=null){ curStep(Math.min(0.1,(ts-lastTs)/1000*2)); } // 실제 1초 = 시뮬 2초
      lastTs=ts;
      if(st.auto)raf=requestAnimationFrame(tick);
    }
    function clickObj(k){
      if(exp==='race'){
        if(mo.t<=0){ ui.toast(el,false,'아직 출발 전이에요 — ⏭ 시간을 보내 봐요!'); return; }
        var o=OBJ.filter(function(x){return x.k===k;})[0];
        var d=distOf(o), ela=(mo.fin[k]!==null)?(mo.fin[k]-((k==='car')?carDelay:0)):elapsedOf(o,mo.t);
        if(k==='car'&&ela<=0){ ui.toast(el,false,'🚗 아직 출발을 기다리는 중이에요!'); return; }
        if(grade==='low') ui.toast(el,true,o.ic+' 지금 '+Math.round(d)+'m 갔어요!');
        else ui.toast(el,true,o.ic+' 지금까지 '+Math.round(d)+'m — '+(Math.round(d/Math.max(0.1,ela)*10)/10)+' m/s');
        var thr=(grade==='low')?3:5;
        if(k==='car'&&mo.t>=thr)mo.clickedFastest=true;
        else if(mode==='mission'&&mStep===1&&mo.t>=thr&&!mLock)ui.toast(el,false,'가장 멀리 간 물체를 찾아 봐요!');
        checkMission();
      } else if(exp==='calc') {
        sp.seen[k]=true; renderScene(); renderStatus(); checkMission();
      }
    }

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
            if(!keep){ moReset(); spReset(); acReset(); }
          } else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (중·고) ───────────── */
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
      var EXPS=curExps(); if(EXPS.length<=1)return '<div style="height:2px;"></div>';
      var LAB={race:'🏁 빠르기 비교', calc:'🧮 속력 계산', accel:'🚀 등속·가속'};
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + EXPS.map(function(e){ var on=(exp===e);
            return '<button class="mt-exp" data-e="'+e+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.blue+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.blue:'#fff')+';color:'+(on?'#fff':C.blue)+';">'+LAB[e]+'</button>'; }).join('')
        + '</div>';
    }
    /* v2 1층 — 자동차 속력·출발 지연 슬라이더 (고·free·race 전용) */
    function v2Row(){
      if(mode!=='free'||grade!=='high'||exp!=='race')return '';
      var sl='font-size:16px;font-weight:800;color:#5a3fb8;font-family:inherit;';
      return '<div class="mt-v2" style="display:flex;gap:14px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
        +'<span style="'+sl+'">🚗 자동차 속력</span><input class="mt-carv" type="range" min="3" max="20" step="1" value="'+carV+'" style="width:min(26vw,160px);"><span class="mt-carvlab" style="'+sl+'color:#E8590C;min-width:56px;display:inline-block;text-align:center;">'+carV+' m/s</span>'
        +'<span style="'+sl+'">⏱ 출발 지연</span><input class="mt-cdel" type="range" min="0" max="5" step="1" value="'+carDelay+'" style="width:min(20vw,120px);"><span class="mt-cdellab" style="'+sl+'color:#E8590C;min-width:40px;display:inline-block;text-align:center;">'+carDelay+'초</span>'
        +'</div>';
    }
    function ctrlRow(){
      if(exp==='calc')return '<div style="height:4px;"></div>';
      return '<div class="mt-ctrl" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrlBtns()+'</div>';
    }
    function ctrlBtns(){
      var st=(exp==='accel')?ac:mo;
      return '<button class="mt-btn" data-act="step" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">⏭ 1초 지나기</button>'
        +'<button class="mt-btn" data-act="auto" style="'+btn+(st.auto?'background:'+C.org+';color:#fff;border-color:'+C.org:'background:#fff;color:'+C.org+';border-color:'+C.org)+';">'+(st.auto?'⏸ 멈추기':'▶ 자동 재생')+'</button>'
        +'<button class="mt-btn" data-act="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 다시 출발선</button>';
    }
    function renderCtrl(){ var c=el.querySelector('.mt-ctrl'); if(c){ c.innerHTML=ctrlBtns(); bindBtns(); } }
    /* v2 2층 — 만약에별 조작 줄 */
    function wifCtrl(){
      var k=wifKey(); if(!k)return '';
      var sl='font-size:16px;font-weight:800;color:#5a3fb8;font-family:inherit;';
      if(k==='farbike'){
        return '<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="mt-btn" data-act="fbgo" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">▶ 둘 다 출발</button>'
          +(fb.t>=6?'<button class="mt-btn" data-act="fbcalc" style="'+btn+(fb.calc?'background:'+C.vio+';color:#fff;':'background:#fff;color:'+C.vio+';')+'border-color:'+C.vio+';">🧮 속력 재보기</button>':'')
          +'<button class="mt-btn" data-act="wreset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 다시</button>'
          +'</div>';
      }
      if(k==='nofric'){
        return '<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="mt-btn" data-act="nfgo" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">🖐 공 밀기</button>'
          +'<button class="mt-btn" data-act="wreset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 다시</button>'
          +'</div>';
      }
      return '<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
        +'<button class="mt-btn" data-act="drgo" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">🪂 떨어뜨리기</button>'
        +'<button class="mt-drair" data-air="1" style="font-size:18px;padding:9px 12px;border-radius:13px;border:3px solid #15803D;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(dr.air?'background:#15803D;color:#fff;':'background:#fff;color:#15803D;')+'">🌬 공기 있는 세상</button>'
        +'<button class="mt-drair" data-air="0" style="font-size:18px;padding:9px 12px;border-radius:13px;border:3px solid #1E40AF;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(!dr.air?'background:#1E40AF;color:#fff;':'background:#fff;color:#1E40AF;')+'">🌌 진공(달)</button>'
        +'</div>';
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode,{whatif:'🌀 만약에'}), bar='', body='', foot='';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); body=wifCtrl(); }
      else body=expTabs()+v2Row()+ctrlRow();
      /* v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.mt-btn:active,.mt-exp:active,.mt-drair:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}'
        +'.mt-carv,.mt-cdel{-webkit-appearance:none;appearance:none;height:12px;border-radius:7px;background:#D0BFFF;outline:none;}'
        +'.mt-carv::-webkit-slider-thumb,.mt-cdel::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.mt-carv::-moz-range-thumb,.mt-cdel::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="mt-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="mt-foot">'+foot+'</div>'
        +'<div class="mt-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="mt-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0; mDone=false; mLock=false; resetAll();
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      renderScene(); bindBtns(); bindStage(); bands.bind(el); renderStatus(); renderChips();
      if(mode==='whatif')wif.bind(el);
    }

    /* ───────────── 무대 ───────────── */
    var X0=90, XW=700; // 0m→x=90, 100m→x=790
    function xOf(d){ return X0+XW*d/DIST; }
    function renderScene(){
      var stage=el.querySelector('.mt-stage'); if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var wk=wifKey();
      /* 관측점(dataset) — jsdom 스모크용 */
      stage.dataset.exp=exp; stage.dataset.t=mo.t; stage.dataset.carv=carV; stage.dataset.cdel=carDelay;
      stage.dataset.card=dOf(OBJ[2],mo.t).toFixed(1); stage.dataset.biked=dOf(OBJ[1],mo.t).toFixed(1);
      stage.dataset.finc=(mo.fin.car===null?'':mo.fin.car); stage.dataset.finb=(mo.fin.bike===null?'':mo.fin.bike);
      stage.dataset.wif=wk||'';
      if(wk==='farbike'){ stage.dataset.fbt=fb.t.toFixed(2); stage.dataset.fbb=Math.min(30,5*fb.t).toFixed(1); stage.dataset.fbc=Math.min(16,8*Math.min(2,fb.t)).toFixed(1); stage.dataset.fbcalc=fb.calc?'1':'0'; drawFarbike(svg); }
      else if(wk==='nofric'){ stage.dataset.nfgx=nf.gx.toFixed(1); stage.dataset.nfix=nf.ix.toFixed(1); stage.dataset.nfgv=nf.gv.toFixed(2); stage.dataset.nflaps=nf.laps; drawNofric(svg); }
      else if(wk==='drop'){ stage.dataset.drair=dr.air?'1':'0'; stage.dataset.drt=dr.t.toFixed(2); stage.dataset.drfl=(dr.fl===null?'':dr.fl); stage.dataset.drbl=(dr.bl===null?'':dr.bl); drawDrop(svg); }
      else {
        var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
        if(pic==='race')drawRace(svg);
        else if(pic==='accel')drawAccel(svg);
        else drawCalc(svg);
      }
      stage.appendChild(svg);
    }

    function drawRace(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var h='';
      h+='<rect x="370" y="14" width="160" height="44" rx="14" fill="#fff" stroke="'+C.ink+'" stroke-width="3"/>'
        +'<text x="450" y="45" text-anchor="middle" font-size="24" font-weight="800" fill="'+C.ink+'" font-family="inherit">⏱ '+Math.floor(mo.t)+'초</text>';
      for(var d=0;d<=DIST;d+=20){
        h+='<line x1="'+xOf(d)+'" y1="80" x2="'+xOf(d)+'" y2="430" stroke="#C6D8EA" stroke-width="2" stroke-dasharray="4 7"/>'
          +'<text x="'+xOf(d)+'" y="76" text-anchor="middle" font-size="15" font-weight="800" fill="'+C.sub+'" font-family="inherit">'+d+'m</text>';
      }
      h+='<line x1="'+xOf(DIST)+'" y1="80" x2="'+xOf(DIST)+'" y2="430" stroke="'+C.ink+'" stroke-width="5"/>'
        +'<text x="'+xOf(DIST)+'" y="450" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.ink+'" font-family="inherit">🏁 결승</text>';
      OBJ.forEach(function(o,i){
        var y=120+i*110, d=distOf(o);
        h+='<rect x="'+(X0-60)+'" y="'+(y-34)+'" width="'+(XW+90)+'" height="72" rx="18" fill="'+C.track+'"/>';
        for(var k=1;k<=Math.floor(mo.t);k++){
          var ek=(o.k==='car')?(k-carDelay):k;
          if(ek<=0)continue;
          var dk=Math.min(DIST,vOf(o)*ek);
          h+='<circle cx="'+xOf(dk)+'" cy="'+(y+24)+'" r="4.5" fill="'+o.col+'" opacity="0.55"/>';
          if(dk>=DIST)break;
        }
        var waiting=(o.k==='car'&&carDelay>0&&mo.t<carDelay);
        h+='<text x="'+xOf(d)+'" y="'+(y+12)+'" text-anchor="middle" font-size="46" font-family="inherit" class="mt-obj" data-k="'+o.k+'" style="cursor:pointer;">'+o.ic+(waiting?'':'')+'</text>'
          +(waiting?'<text x="'+(xOf(d)+38)+'" y="'+(y+2)+'" font-size="22" font-family="inherit">⏳</text>':'')
          +'<text x="'+(X0-58)+'" y="'+(y+8)+'" font-size="17" font-weight="800" fill="'+o.col+'" font-family="inherit">'+o.nm+(o.k==='car'&&(carV!==10||carDelay>0)?' '+carV+'m/s'+(carDelay>0?'·'+carDelay+'초 지연':''):'')+'</text>';
        if(mo.fin[o.k]!==null){
          h+='<rect x="'+(xOf(DIST)+8)+'" y="'+(y-18)+'" width="92" height="40" rx="11" fill="#fff" stroke="'+o.col+'" stroke-width="3"/>'
            +'<text x="'+(xOf(DIST)+54)+'" y="'+(y+9)+'" text-anchor="middle" font-size="18" font-weight="800" fill="'+o.col+'" font-family="inherit">'+mo.fin[o.k]+'초!</text>';
        }
      });
      g.innerHTML=h;
    }

    /* 등속/가속 무대 (고학년) */
    function drawAccel(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var h='';
      h+='<rect x="370" y="14" width="160" height="44" rx="14" fill="#fff" stroke="'+C.ink+'" stroke-width="3"/>'
        +'<text x="450" y="45" text-anchor="middle" font-size="24" font-weight="800" fill="'+C.ink+'" font-family="inherit">⏱ '+Math.floor(ac.t)+'초</text>';
      for(var d=0;d<=DIST;d+=20){
        h+='<line x1="'+xOf(d)+'" y1="80" x2="'+xOf(d)+'" y2="430" stroke="#C6D8EA" stroke-width="2" stroke-dasharray="4 7"/>'
          +'<text x="'+xOf(d)+'" y="76" text-anchor="middle" font-size="15" font-weight="800" fill="'+C.sub+'" font-family="inherit">'+d+'m</text>';
      }
      h+='<line x1="'+xOf(DIST)+'" y1="80" x2="'+xOf(DIST)+'" y2="430" stroke="'+C.ink+'" stroke-width="5"/>'
        +'<text x="'+xOf(DIST)+'" y="450" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.ink+'" font-family="inherit">🏁 결승</text>';
      var LANES=[
        {ic:'🚗', nm:'등속 자동차', col:C.org,    dist:accDistCar,    fin:ac.finC, tag:'간격 일정'},
        {ic:'🚀', nm:'가속 로켓',   col:C.rocket, dist:accDistRocket, fin:ac.finR, tag:'점점 벌어짐'}
      ];
      LANES.forEach(function(o,i){
        var y=150+i*150, d=o.dist(ac.t);
        h+='<rect x="'+(X0-60)+'" y="'+(y-40)+'" width="'+(XW+90)+'" height="84" rx="18" fill="'+C.track+'"/>';
        for(var k=1;k<=Math.floor(ac.t);k++){
          var dk=o.dist(k);
          h+='<circle cx="'+xOf(dk)+'" cy="'+(y+28)+'" r="5" fill="'+o.col+'" opacity="0.6"/>';
          if(dk>=DIST)break;
        }
        h+='<text x="'+xOf(d)+'" y="'+(y+12)+'" text-anchor="middle" font-size="46" font-family="inherit">'+o.ic+'</text>'
          +'<text x="'+(X0-58)+'" y="'+(y-2)+'" font-size="16" font-weight="800" fill="'+o.col+'" font-family="inherit">'+o.nm+'</text>'
          +'<text x="'+(X0-58)+'" y="'+(y+18)+'" font-size="13" font-weight="800" fill="'+C.sub+'" font-family="inherit">자취 '+o.tag+'</text>';
        if(o.fin!==null){
          h+='<rect x="'+(xOf(DIST)+8)+'" y="'+(y-18)+'" width="96" height="40" rx="11" fill="#fff" stroke="'+o.col+'" stroke-width="3"/>'
            +'<text x="'+(xOf(DIST)+56)+'" y="'+(y+9)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+o.col+'" font-family="inherit">'+o.fin+'초!</text>';
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

    /* ── v2 만약에 무대 3종 ── */
    /* 🚴 멀리 간 자전거 vs 가까이 간 자동차 — 30m/6초 vs 16m/2초 */
    function drawFarbike(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var MAXD=40, x0=110, xw=680;
      function fx(d){ return x0+xw*d/MAXD; }
      var bd=Math.min(30,5*fb.t), cd=Math.min(16,8*Math.min(2,fb.t));
      var bt=Math.min(6,fb.t), ct=Math.min(2,fb.t);
      var h='<rect x="330" y="12" width="240" height="42" rx="14" fill="#fff" stroke="'+C.ink+'" stroke-width="3"/>'
        +'<text x="450" y="41" text-anchor="middle" font-size="21" font-weight="800" fill="'+C.ink+'" font-family="inherit">⏱ '+bt.toFixed(1)+'초</text>';
      for(var d=0;d<=MAXD;d+=10){
        h+='<line x1="'+fx(d)+'" y1="70" x2="'+fx(d)+'" y2="300" stroke="#C6D8EA" stroke-width="2" stroke-dasharray="4 7"/>'
          +'<text x="'+fx(d)+'" y="66" text-anchor="middle" font-size="14" font-weight="800" fill="'+C.sub+'" font-family="inherit">'+d+'m</text>';
      }
      var LN=[ {ic:'🚲',nm:'자전거',col:C.blue,d:bd,tt:bt,vv:5,stop:6},
               {ic:'🚗',nm:'자동차',col:C.org, d:cd,tt:ct,vv:8,stop:2} ];
      LN.forEach(function(o,i){
        var y=110+i*100;
        h+='<rect x="'+(x0-70)+'" y="'+(y-32)+'" width="'+(xw+120)+'" height="68" rx="16" fill="'+C.track+'"/>';
        for(var k=1;k<=Math.floor(Math.min(o.stop,fb.t));k++){
          h+='<circle cx="'+fx(o.vv*k)+'" cy="'+(y+22)+'" r="4.5" fill="'+o.col+'" opacity="0.55"/>';
        }
        h+='<text x="'+fx(o.d)+'" y="'+(y+10)+'" text-anchor="middle" font-size="42" font-family="inherit">'+o.ic+'</text>'
          +'<text x="'+(x0-66)+'" y="'+(y+6)+'" font-size="16" font-weight="800" fill="'+o.col+'" font-family="inherit">'+o.nm+'</text>';
        if(fb.t>=o.stop)h+='<rect x="'+(fx(o.d)+26)+'" y="'+(y-16)+'" width="128" height="36" rx="10" fill="#fff" stroke="'+o.col+'" stroke-width="3"/>'
          +'<text x="'+(fx(o.d)+90)+'" y="'+(y+9)+'" text-anchor="middle" font-size="15" font-weight="800" fill="'+o.col+'" font-family="inherit">'+o.d.toFixed(0)+'m · '+o.stop+'초</text>';
      });
      if(fb.calc){
        h+='<text x="450" y="345" text-anchor="middle" font-size="20" font-weight="800" fill="'+C.vio+'" font-family="inherit">🧮 똑같이 1초 동안 간 거리로 비교하면?</text>'
          +'<rect x="180" y="365" width="'+(5*24)+'" height="30" rx="9" fill="'+C.blue+'"/><text x="'+(190+5*24)+'" y="387" font-size="17" font-weight="800" fill="'+C.blue+'" font-family="inherit">🚲 30÷6 = 5 m/s</text>'
          +'<rect x="180" y="405" width="'+(8*24)+'" height="30" rx="9" fill="'+C.org+'"/><text x="'+(190+8*24)+'" y="427" font-size="17" font-weight="800" fill="'+C.org+'" font-family="inherit">🚗 16÷2 = 8 m/s — 자동차 승!</text>';
      } else if(fb.t>=6){
        h+='<text x="450" y="360" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.sub+'" font-family="inherit">🚲가 멀리 갔네요… 그런데 걸린 시간이 달라요! 🧮 속력 재보기를 눌러 봐요.</text>';
      }
      g.innerHTML=h;
    }
    /* 🧊 마찰이 없다면 — 잔디(감속·정지) vs 얼음(등속·무한) */
    function drawNofric(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var MAXD=60, x0=110, xw=680;
      function fx(d){ return x0+xw*d/MAXD; }
      var h='';
      // 잔디 트랙
      h+='<rect x="'+(x0-70)+'" y="88" width="'+(xw+120)+'" height="96" rx="18" fill="#D3F9D8"/>'
        +'<text x="'+(x0-62)+'" y="80" font-size="17" font-weight="800" fill="#2B8A3E" font-family="inherit">🌿 잔디 (마찰 O)</text>'
        +'<circle cx="'+fx(Math.min(MAXD,nf.gx))+'" cy="136" r="20" fill="#2B8A3E"/>'
        +(nf.gv<=0&&nf.gx>0?'<text x="'+(fx(Math.min(MAXD,nf.gx))+30)+'" y="142" font-size="17" font-weight="800" fill="#2B8A3E" font-family="inherit">멈춤! ('+nf.gx.toFixed(0)+'m)</text>':'');
      // 얼음 트랙
      h+='<rect x="'+(x0-70)+'" y="230" width="'+(xw+120)+'" height="96" rx="18" fill="#D0EBFF"/>'
        +'<text x="'+(x0-62)+'" y="222" font-size="17" font-weight="800" fill="#1971C2" font-family="inherit">🧊 얼음 (마찰 0)</text>'
        +'<circle cx="'+fx(nf.ix)+'" cy="278" r="20" fill="#1971C2"/>'
        +(nf.laps>0?'<text x="'+(x0-62)+'" y="352" font-size="17" font-weight="800" fill="#1971C2" font-family="inherit">🔁 트랙 '+nf.laps+'바퀴째 — 아직도 같은 빠르기!</text>':'');
      // 자취 점(최근)
      for(var d=6;d<Math.min(MAXD,nf.gx);d+=6)h+='<circle cx="'+fx(d)+'" cy="160" r="4" fill="#2B8A3E" opacity="0.4"/>';
      for(var d2=6;d2<nf.ix;d2+=6)h+='<circle cx="'+fx(d2)+'" cy="302" r="4" fill="#1971C2" opacity="0.4"/>';
      h+='<text x="450" y="410" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.sub+'" font-family="inherit">같은 힘으로 밀었는데 — 잔디 공은 왜 멈추고, 얼음 공은 왜 계속 갈까요?</text>';
      g.innerHTML=h;
    }
    /* 🐘 무거우면 빨리 떨어질까 — 볼링공 vs 깃털, 공기/진공 */
    function drawDrop(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var H=8, yTop=90, yBot=400;
      function fy(m){ return yTop+(yBot-yTop)*Math.min(H,m)/H; }
      var by=0.5*10*dr.t*dr.t, fyv=dr.air?(2*dr.t):by;
      if(dr.bl!==null)by=H; if(dr.fl!==null)fyv=H;
      var h='<rect x="140" y="'+(yTop-40)+'" width="620" height="8" rx="4" fill="'+C.ink+'"/>'
        +'<text x="450" y="'+(yTop-52)+'" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">'+(dr.air?'🌬 공기 있는 세상':'🌌 진공 — 달 표면')+'</text>'
        +'<line x1="140" y1="'+yBot+'" x2="760" y2="'+yBot+'" stroke="'+C.ink+'" stroke-width="5"/>'
        +'<text x="300" y="'+(yTop-14)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.sub+'" font-family="inherit">🎳 볼링공(무거움)</text>'
        +'<text x="600" y="'+(yTop-14)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.sub+'" font-family="inherit">🪶 깃털(가벼움)</text>'
        +'<text x="300" y="'+(fy(by)+14)+'" text-anchor="middle" font-size="40" font-family="inherit">🎳</text>'
        +'<text x="600" y="'+(fy(fyv)+14)+'" text-anchor="middle" font-size="36" font-family="inherit">🪶</text>';
      if(dr.bl!==null)h+='<text x="300" y="'+(yBot+34)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.good+'" font-family="inherit">착지 '+dr.bl.toFixed(2)+'초</text>';
      if(dr.fl!==null)h+='<text x="600" y="'+(yBot+34)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.good+'" font-family="inherit">착지 '+dr.fl.toFixed(2)+'초</text>';
      if(dr.bl!==null&&dr.fl!==null){
        var same=Math.abs(dr.bl-dr.fl)<0.001;
        h+='<text x="450" y="'+(yBot+34)+'" text-anchor="middle" font-size="21" font-weight="800" fill="'+(same?C.good:C.org)+'" font-family="inherit">'+(same?'🌟 완전히 동시!':'⏱ 깃털이 늦었어요 — 공기 때문!')+'</text>';
      }
      g.innerHTML=h;
    }

    /* ───────────── 상태줄 ───────────── */
    function renderStatus(){
      var s=el.querySelector('.mt-status'); if(!s)return;
      var wk=wifKey(), msg;
      if(wk==='farbike'){
        if(fb.calc) msg='<span style="color:'+C.good+';font-size:19px;">1초 거리로 비교하니 자동차(8m)가 자전거(5m)보다 빨라요 — 거리와 시간을 함께!</span>';
        else if(fb.t>=6) msg='<span style="color:'+C.ink+';font-size:19px;">둘 다 도착 — 자전거 30m·6초, 자동차 16m·2초. 누가 빠른 걸까요?</span>';
        else if(fb.t>0) msg='<span style="color:'+C.ink+';font-size:19px;">자동차는 2초 만에 멈추고, 자전거는 계속 가요 — 걸린 시간이 달라요!</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">▶ 둘 다 출발을 눌러 봐요 — 멀리 간 쪽이 정말 빠른 걸까요?</span>';
      } else if(wk==='nofric'){
        if(nf.laps>0) msg='<span style="color:'+C.good+';font-size:19px;">얼음 공은 '+nf.laps+'바퀴째 등속으로! 밀어 주지 않아도 멈추지 않아요 — 멈추게 하는 건 마찰이었어요.</span>';
        else if(nf.gv<=0&&nf.gx>0) msg='<span style="color:'+C.ink+';font-size:19px;">잔디 공은 '+nf.gx.toFixed(0)+'m에서 멈췄는데, 얼음 공은 아직도 같은 빠르기예요!</span>';
        else if(nf.gx>0) msg='<span style="color:'+C.ink+';font-size:19px;">잔디 공은 점점 느려지고(자취 촘촘), 얼음 공은 간격이 일정해요!</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">🖐 공 밀기 — 두 공을 같은 빠르기로 밀어요!</span>';
      } else if(wk==='drop'){
        if(dr.bl!==null&&dr.fl!==null){
          msg=(Math.abs(dr.bl-dr.fl)<0.001)
            ?'<span style="color:'+C.good+';font-size:19px;">진공에선 완전히 동시! 떨어지는 빠르기는 무게와 상관없어요 — 아폴로 15호가 달에서 증명했죠.</span>'
            :'<span style="color:'+C.ink+';font-size:19px;">깃털이 늦은 건 무거움이 아니라 공기의 방해 때문 — 🌌 진공으로 바꿔 다시 떨어뜨려 봐요!</span>';
        } else if(dr.run) msg='<span style="color:'+C.ink+';font-size:19px;">떨어지는 중… 누가 먼저 닿을까요?</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">🪂 떨어뜨리기 — '+(dr.air?'공기 있는 세상에서':'진공에서')+' 실험해요!</span>';
      } else if(mode==='whatif'){
        msg='<span style="color:'+C.sub+';font-size:19px;">🌀 만약에 카드를 골라 예측하고, 직접 확인해 봐요!</span>';
      } else {
        var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
        if(pic==='accel'){
          if(ac.finC!==null&&ac.finR!==null) msg='<span style="color:'+C.good+';font-size:19px;">🚀 가속 로켓이 역전! <b>등속</b>은 자취 점 간격이 일정, <b>가속</b>은 점점 벌어져요 — 점점 빨라진다는 뜻!</span>';
          else if(ac.t>0) msg='<span style="color:'+C.ink+';font-size:19px;">'+Math.floor(ac.t)+'초 — 자취 점을 봐요! 🚗는 간격 일정, 🚀는 점점 벌어지죠?</span>';
          else msg='<span style="color:'+C.sub+';font-size:19px;">⏭ 시간을 보내며 두 자취의 <b>점 간격</b>을 비교해 봐요 — 일정 vs 벌어짐!</span>';
        } else if(pic==='race'){
          var fin=OBJ.filter(function(o){return mo.fin[o.k]!==null;}).length;
          if(grade==='low'){
            if(fin===3) msg='<span style="color:'+C.good+';font-size:19px;">🚗 자동차가 가장 빨라요 — 가장 멀리, 가장 빨리 도착했죠?</span>';
            else if(mo.t>0) msg='<span style="color:'+C.ink+';font-size:19px;">'+Math.floor(mo.t)+'초 — 🚗 자동차가 제일 앞서가요! 가장 빠른 거예요.</span>';
            else msg='<span style="color:'+C.sub+';font-size:19px;">⏭ 시간을 보내면 셋이 달려요 — 누가 빠를까요?</span>';
          } else {
            if(fin===3) msg='<span style="color:'+C.good+';font-size:19px;">기록 비교 — 같은 거리(100m), 시간이 짧을수록 빠른 거예요!</span>';
            else if(mo.t>0) msg='<span style="color:'+C.ink+';font-size:19px;">'+Math.floor(mo.t)+'초 — 같은 시간인데 간 거리가 다르죠? 거리와 시간을 함께 봐요!</span>';
            else msg='<span style="color:'+C.sub+';font-size:19px;">⏭ 시간을 보내면 위치가 변해요 — 이게 바로 운동!</span>';
          }
        } else {
          var n=(sp.seen.walk?1:0)+(sp.seen.bike?1:0)+(sp.seen.car?1:0);
          msg='<span style="color:'+(n===3?C.good:C.sub)+';font-size:19px;">'+(n===3?'같은 시간(5초)이면 거리만 비교해도 빠르기를 알 수 있어요!':'카드를 눌러 속력을 계산해 봐요 ('+n+'/3)')+'</span>';
        }
      }
      s.innerHTML=msg;
    }

    /* ───────────── 바인딩 ───────────── */
    function bindBtns(){
      el.querySelectorAll('.mt-exp').forEach(function(b){
        b.addEventListener('click',function(){ exp=b.dataset.e; moReset(); spReset(); acReset(); build(); });
      });
      el.querySelectorAll('.mt-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var a=b.dataset.act;
          if(a==='step')curStep(1);
          else if(a==='auto')toggleAuto();
          else if(a==='reset'){ if(exp==='accel')acReset(); else moReset(); build(); }
          else if(a==='fbgo'){ fb.run=true; fb.t=0; fb.calc=false; snd('select'); wifGo(); }
          else if(a==='fbcalc'){ fb.calc=!fb.calc; renderScene(); renderStatus(); build(); }
          else if(a==='nfgo'){ nf.run=true; nf.gx=0; nf.ix=0; nf.gv=6; nf.laps=0; snd('select'); wifGo(); }
          else if(a==='drgo'){ dr.run=true; dr.t=0; dr.fl=null; dr.bl=null; snd('select'); wifGo(); }
          else if(a==='wreset'){ var k=wifKey(); wifStageReset(); build(); }
        });
      });
      /* v2 1층 슬라이더 — 첫 조작 = 🔮 무장 */
      var cv=el.querySelector('.mt-carv');
      if(cv)cv.addEventListener('input',function(){
        carV=+cv.value; var l=el.querySelector('.mt-carvlab'); if(l)l.textContent=carV+' m/s';
        predArm('spd'); renderScene(); renderStatus(); checkPredV2();
      });
      var cd=el.querySelector('.mt-cdel');
      if(cd)cd.addEventListener('input',function(){
        carDelay=+cd.value; var l=el.querySelector('.mt-cdellab'); if(l)l.textContent=carDelay+'초';
        predArm('delay'); renderScene(); renderStatus(); checkPredV2();
      });
      el.querySelectorAll('.mt-drair').forEach(function(b){
        b.addEventListener('click',function(){
          dr.air=(b.dataset.air==='1'); dr.run=false; dr.t=0; dr.fl=null; dr.bl=null;
          build();
        });
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(mode!=='quiz')return;
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
    return { destroy:function(){ if(raf)cancelAnimationFrame(raf); if(wraf)cancelAnimationFrame(wraf); } };
  });
})();
