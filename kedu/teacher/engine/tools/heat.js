/* ============================================================================
   케이랩 도구 모듈 — 열의 이동 (heat) v2  [과학 6호 · 물리현상군]
   5학년 온도와 열. KLab.ui 3모드(자유탐구/미션/퀴즈) + 학년칸(헌법 3장).
   ── 학년 칸 (카드 D칸 닻대로) ──
     저(🌱): 따뜻함이 옮아간다 — 전도만, 일상어("따뜻함이 옆으로 번져요").
     중(🌿): 고체 전도(차례차례) — 재질 비교(구리>철>유리), 전도만.
     고(🌳): 액체·기체 대류(위/아래) — 전도+대류 전부, 마법모먼트(위/아래 가열).
   탐구 표준 v2 (4층):
     1층 변수 개방 — 🔥 불 세기 슬라이더(×0.4~2.2 — 세게 해도 순서 불변 = 재질과 불의
       분리) + ⏺ 가열 위치 토글(끝/가운데 — 원본 D칸 "가열점" 상환: 가운데 가열 =
       양쪽 대칭 확산·2배 도달). 고학년 자유탐구·전도 전용.
     2층 만약에 — 🍳 쇠 손잡이(잡아 보기 = 앗 뜨거, 원본 G칸) · 🔥 천장 난로(cell=0
       층 형성 — 바닥은 차가운 채) · 🧤 완벽 단열(맨 얼음만 녹음 = 보온병 원리).
       중=🍳🔥, 고=3종. ※ "위 가열" 반전은 라이브가 이미 교습 → 재탕 금지(strata 원칙).
     3층 예측 노트 — 불 세기·가열점 첫 조작 = 🔮 무장 → 해소·칩·5칩 = ♨️ 꼬마 열탐정.
     4층 — 3D 미전환·SVG 유지(열색·유동장 2D가 원리 그 자체). 신규 자산 0.
   실험 3종 (변수 → 현상 → 발견):
     ▸ 🥄 고체(전도) — 구리·철·유리 막대 한쪽 끝 가열 → 열이 이웃으로 차례로
        퍼지는 빠르기 차이. 끝의 버터가 떨어지는 순서로 비교 (구리>철≫유리).
     ▸ 💧 액체(대류) — 비커 물을 [아래/위]에서 가열. 아래 가열=뜨거운 물이
        올라가 빙글빙글 돌며 전체가 데워짐 / 위 가열=아래는 차가운 채 남음(발견).
     ▸ 🌬️ 기체(대류) — 방 단면. 난로(바닥)·에어컨(천장) 토글 → 따뜻한 공기는
        위로·차가운 공기는 아래로. "난로는 아래, 에어컨은 위" 까닭 발견.
   미션 4종 + 퀴즈 5문(랜덤 출제, 선택지).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", exp:"conduct"|"liquid"|"gas" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('heat', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var exp  = (['conduct','liquid','gas'].indexOf(config.exp) >= 0) ? config.exp : 'conduct';
    var raf = null, t0 = Date.now();
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', cold:'#1971C2', hot:'#E8590C', vio:'#7048E8' };
    var btn = 'font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function clamp(v,a,b){ return Math.max(a,Math.min(v,b)); }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n); }
    function heatColor(t){ // 0(차가움 파랑) → 1(뜨거움 빨강)
      t=clamp(t,0,1);
      var c1=[25,113,194], c2=[250,82,82], m=[];
      for(var i=0;i<3;i++)m.push(Math.round(c1[i]+(c2[i]-c1[i])*t));
      return 'rgb('+m.join(',')+')';
    }
    /* ── v2 1층 변수 — 불 세기·가열 위치(원본 D칸 "가열점" 미이행분). 기본값(×1·왼쪽) = 기존 거동 ── */
    var power=1, pos='left';
    /* ── v2 2층 만약에 미니 무대 상태 — 🍳 프라이팬 / 🧤 단열 얼음 ── */
    var pn, ic;
    function pnReset(){ pn={ t:0, tried:{steel:false,wood:false} }; }
    function icReset(){ ic={ t:0, ff:0 }; }
    pnReset(); icReset();
    function v2reset(){ power=1; pos='left'; pnReset(); icReset(); }
    function wifKey(){ return (mode==='whatif'&&wif&&wif.active())?wif.state.key:null; }

    /* ──────────────────────────── ① 전도 (고체) ──────────────────────────── */
    var RODS = [
      { name:'구리', base:'#C77B3F', k:1.0  },
      { name:'철',   base:'#868E96', k:0.42 },
      { name:'유리', base:'#9FC6E8', k:0.05 }
    ];
    var cd; // 전도 상태
    function cdReset(){ cd={ heating:false, hf:[0,0,0], drop:[0,0,0], order:[] }; } // hf=열 도달 비율 0~1, drop=버터 낙하 진행
    cdReset();
    var ROD_X=300, ROD_W=420, ROD_H=26, ROD_Y=[140,240,340];

    /* ──────────────────────── ②③ 대류 (액체/기체 공통 입자) ─────────────────── */
    function makeConv(box, n){
      var ps=[];
      for(var i=0;i<n;i++)ps.push({
        x:box.x+10+Math.random()*(box.w-20), y:box.y+10+Math.random()*(box.h-20),
        vx:0, vy:0, t:0.12, el:null });
      return ps;
    }
    // 대류 셀 유동장(교과서형): 열원 기둥에서 위로 → 위에서 옆으로 → 벽에서 아래로 → 바닥에서 열원 쪽으로.
    // 냉원(에어컨)은 반대 방향(cell=-1). cell=0이면 유동 없음(위 가열=층 형성).
    function stepConv(ps, box, sources){
      var i,j,p,A=1.5;
      for(i=0;i<ps.length;i++){ p=ps[i];
        var vx=0, vy=0;
        for(j=0;j<sources.length;j++){ var s=sources[j]; if(!s.on||!s.cell)continue;
          var xi=(p.x-box.x)/box.w, eta=(p.y-box.y)/box.h, xc=(s.x-box.x)/box.w;
          var d=xi-xc, sc=(d>=0)?Math.max(1-xc,0.18):Math.max(xc,0.18);
          var a=Math.PI*d/sc;                            // 벽이 정확히 ±π(하강 기둥)가 되도록
          vy += -s.cell*A*Math.cos(a)*Math.sin(Math.PI*eta);
          vx +=  s.cell*A*0.8*Math.sin(a)*Math.cos(Math.PI*eta);
        }
        p.x += vx + (Math.random()-0.5)*0.6;
        p.y += vy + (Math.random()-0.5)*0.6;
        if(p.x<box.x+8)p.x=box.x+8; if(p.x>box.x+box.w-8)p.x=box.x+box.w-8;
        if(p.y<box.y+8)p.y=box.y+8; if(p.y>box.y+box.h-8)p.y=box.y+box.h-8;
        for(j=0;j<sources.length;j++){ var q=sources[j]; if(!q.on)continue;
          var dx=p.x-q.x, dy=p.y-q.y;
          if(dx*dx+dy*dy < q.r*q.r) p.t=clamp(p.t+q.dT,0,1);
        }
        p.t += (0.12-p.t)*0.0015;                        // 천천히 주변 온도(상온)로
      }
    }
    function regionTemp(ps, box, top){ // top=true 위쪽 1/3, false 아래쪽 1/3
      var sum=0, n=0, lim=top?(box.y+box.h/3):(box.y+box.h*2/3);
      for(var i=0;i<ps.length;i++){ var p=ps[i];
        if(top?(p.y<lim):(p.y>lim)){ sum+=p.t; n++; } }
      return n?sum/n:0.12;
    }
    function degC(t){ return Math.round(10+t*70); }      // 표시용 ℃ (10~80)

    var LQ_BOX={x:250,y:110,w:430,h:290};
    var lq; function lqReset(){ lq={ pos:'off', ps:makeConv(LQ_BOX,44) }; } lqReset();
    var GS_BOX={x:170,y:80,w:580,h:330};
    var gs; function gsReset(){ gs={ heater:false, ac:false, ps:makeConv(GS_BOX,50) }; } gsReset();

    /* ─────────────────────────────── 미션 ─────────────────────────────── */
    var MISSIONS=[
      { exp:'conduct', text:'🥄 <b style="color:#7048E8;">가열</b>해서 <b style="color:#7048E8;">구리 막대의 버터</b>를 가장 먼저 떨어뜨려 봐요!',
        check:function(){ return exp==='conduct' && cd.order.length>0 && cd.order[0]===0; } },
      { exp:'liquid', text:'💧 비커 <b style="color:#7048E8;">아래</b>에서 가열해 <b style="color:#7048E8;">위쪽 물까지</b> 따뜻하게(50℃↑) 만들어 봐요!',
        check:function(){ return exp==='liquid' && lq.pos==='bottom' && degC(regionTemp(lq.ps,LQ_BOX,true))>=50; } },
      { exp:'liquid', text:'🧊 이번엔 <b style="color:#7048E8;">위</b>에서 가열해 봐요. 위는 뜨거운데 <b style="color:#7048E8;">아래 물은 차가운 채</b>로 남는 걸 확인!',
        check:function(){ return exp==='liquid' && lq.pos==='top' && degC(regionTemp(lq.ps,LQ_BOX,true))>=45 && degC(regionTemp(lq.ps,LQ_BOX,false))<=28; } },
      { exp:'gas', text:'🌬️ <b style="color:#7048E8;">난로</b>를 켜서 따뜻한 공기가 <b style="color:#7048E8;">천장</b>에 모이는 걸 확인해 봐요! (천장 45℃↑)',
        check:function(){ return exp==='gas' && gs.heater && degC(regionTemp(gs.ps,GS_BOX,true))>=45; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=따뜻함이 옮아간다(전도만, 일상어) / 중=고체 전도·재질 비교 / 고=액체·기체 대류(위·아래). */
    var LOW_MISSIONS=[
      { exp:'conduct', text:'🔥 <b style="color:#7048E8;">가열 시작</b>을 눌러 막대가 따뜻해지는 걸 봐요 — 따뜻함이 옆으로 <b style="color:#7048E8;">번져요</b>!',
        check:function(){ return exp==='conduct' && cd.heating && Math.max.apply(null,cd.hf)>0.25; } },
      { exp:'conduct', text:'조금 기다리면 막대 끝 <b style="color:#7048E8;">버터가 떨어져요</b> — 따뜻함이 끝까지 옮아간 거예요!',
        check:function(){ return exp==='conduct' && cd.order.length>=1; } }
    ];
    var MID_MISSIONS=[
      { exp:'conduct', text:'🥄 <b style="color:#7048E8;">가열</b>해서 <b style="color:#7048E8;">구리 막대의 버터</b>를 가장 먼저 떨어뜨려 봐요!',
        check:function(){ return exp==='conduct' && cd.order.length>0 && cd.order[0]===0; } },
      { exp:'conduct', text:'셋 다 떨어뜨려 순서를 확인! <b style="color:#7048E8;">구리 → 철 → 유리</b> — 재질마다 열 전달 빠르기가 달라요.',
        check:function(){ return exp==='conduct' && cd.order.length===3; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],                 missions:LOW_MISSIONS, exps:['conduct'],                v2:false, wif:[] },
      mid:  { modes:['free','mission','quiz','whatif'], missions:MID_MISSIONS, exps:['conduct'],                v2:false, wif:['pan','ceil'] },
      high: { modes:['free','mission','quiz','whatif'], missions:MISSIONS,     exps:['conduct','liquid','gas'], v2:true,  wif:['pan','ceil','insul'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return GRADES[grade].missions; }
    function curExps(){ return GRADES[grade].exps; }
    if(curExps().indexOf(exp)<0)exp=curExps()[0];
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false;
      cdReset(); lqReset(); gsReset(); v2reset(); exp=curExps()[0];
      if(wif)wif.reset(); makeWif(); build();
    }});

    /* ───────────── 🌀 만약에 (v2 2층 — 라이브에 만약에·와우 둘 다 없던 도구) ─────────────
       ※ "위에서 가열" 반전은 라이브 자유탐구·미션3이 이미 전면 교습 → 재탕 금지(strata 원칙).
          대신 신선한 반사실 3종: 🍳 손잡이 재질(원본 G칸) · 🔥 천장 난로 · 🧤 완벽 단열. */
    var WHATIF={
      pan:{ icon:'🍳', title:'프라이팬 손잡이가 쇠라면?',
        q:'프라이팬 몸통을 달구면, 쇠로 만든 손잡이는 어떻게 될까요?',
        ch:['손잡이는 안 뜨거워져요','금방 뜨거워져 잡을 수 없어요','손잡이만 차가워져요'], a:1,
        reveal:'쇠는 열을 잘 전달해서(전도) 손잡이까지 금방 뜨거워져요 — 앗 뜨거! 그래서 냄비 몸통은 잘 전달되는 금속, 손잡이는 잘 안 되는 나무·플라스틱으로 만들어요. 생활 속 재질 설계랍니다.',
        tip:'🖐 쇠 손잡이와 나무 손잡이를 번갈아 잡아 봐요!' },
      ceil:{ icon:'🔥', title:'난로를 천장에 단다면?',
        q:'난로를 높은 천장에 달면 방 전체가 더 골고루 따뜻해질까요?',
        ch:['높은 곳에서 내려와 골고루 따뜻해요','천장만 뜨겁고 바닥은 차가운 채예요','방이 오히려 추워져요'], a:1,
        reveal:'따뜻한 공기는 위로만 가려 해요! 천장 난로의 더운 공기는 천장에 머물기만 하고 아래로 내려오지 않아 바닥은 차가운 채 — 대류가 멈춰요. 그래서 난로는 바닥에, 에어컨은 천장에 다는 거예요.',
        tip:'천장 난로를 켜 뒀어요 — 천장·바닥 온도를 지켜봐요!' },
      insul:{ icon:'🧤', title:'열이 전혀 안 통하는 통이라면?',
        q:'얼음 하나는 맨 접시에, 하나는 열이 전혀 안 통하는 통(완벽한 단열)에 — 시간이 지나면?',
        ch:['둘 다 똑같이 녹아요','맨 얼음만 녹고 단열통 얼음은 그대로예요','단열통 얼음이 먼저 녹아요'], a:1,
        reveal:'열의 이동(전도·대류)을 끊으면 변화도 멈춰요! 단열통 속 얼음엔 바깥의 열이 들어가지 못해 녹지 않아요. 보온병·아이스박스·소방복·우주복이 모두 이 원리 — 열을 "막는 법"도 과학이에요.',
        tip:'⏩ 시간을 빨리 돌려 봐요 — 두 얼음의 차이!' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ build(); },
        footEl:function(){ return el.querySelector('.ht-foot'); },
        onSelect:function(k){ cdReset(); lqReset(); gsReset(); v2reset(); },
        onPlay:function(k){
          if(k==='pan'){ pnReset(); }
          else if(k==='ceil'){ gsReset(); }
          else { icReset(); }
        },
        onExit:function(){ cdReset(); lqReset(); gsReset(); v2reset(); exp=curExps()[0]; }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 불 세기·가열 위치 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ power:{asked:false,ch:-1,done:false}, pos:{asked:false,ch:-1,done:false} };
    var PRED={
      power:{ q:'🔮 예측 먼저! 불을 훨씬 세게 하면 버터 떨어지는 순서는?',
        ch:['순서가 뒤바뀐다','순서는 그대로, 빨라질 뿐이다','구리만 빨라진다'],
        tip:'불 세기를 끝까지 올리고 🔥 가열해 순서를 확인해 봐요!' },
      pos:{ q:'🔮 예측 먼저! 막대 가운데를 가열하면 열은 어떻게 퍼질까요?',
        ch:['한쪽으로만 간다','가열점에서 양쪽으로 퍼진다','퍼지지 않는다'],
        tip:'⏺ 가운데 가열로 바꾸고 🔥 가열해 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.ht-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="ht-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="ht-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.ht-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='power') msg=hit?'✔ 예측 적중 — 순서는 구리→철→유리 그대로! 빠르기는 불이, 순서는 재질이 정해요.'
                                :'✘ 예측 빗나감 — 불을 세게 해도 순서는 그대로예요! 순서를 정하는 건 재질(전도율)이거든요.';
      else msg=hit?'✔ 예측 적중 — 열은 가열점에서 양쪽으로 퍼져요! 그래서 끝까지 절반 거리라 두 배 빨리 닿아요.'
                  :'✘ 예측 빗나감 — 열은 가열한 곳에서 사방(양쪽)으로 퍼져요! 이웃 입자를 차례로 흔들어 깨우는 거예요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.ht-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.power.ch>=0&&!pred.power.done&&power>=1.6&&cd.order.length>=2&&cd.order[0]===0)predResolve('power');
      if(pred.pos.ch>=0&&!pred.pos.done&&pos==='mid'&&cd.hf[0]>0.3)predResolve('pos');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={pan:'🍳 쇠손잡이',ceil:'🔥 천장난로',insul:'🧤 완벽단열',power:'🔥 불세기예측',pos:'⏺ 가열점예측'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'♨️ 꼬마 열탐정 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.ht-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="ht-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }
    /* ── v2 만약에 액션 — 🍳 손잡이 잡기 · 🧤 시간 빨리 돌리기 ── */
    function grabHandle(which){
      pn.tried[which]=true;
      var steelT=pn.t, woodT=pn.t*0.06;
      if(which==='steel'){
        if(steelT>0.45){ snd('pop'); ui.toast(el,false,'🔥 앗 뜨거!! 쇠 손잡이가 '+Math.round(20+steelT*160)+'℃ — 잡을 수 없어요!'); }
        else { snd('tap'); ui.toast(el,true,'아직은 미지근… 조금 더 달궈지면?'); }
      } else {
        snd('tap'); ui.toast(el,true,'🖐 나무 손잡이는 '+Math.round(20+woodT*160)+'℃ — 끄떡없어요! (열이 잘 안 전달됨)');
      }
      renderStatus();
    }
    function iceFF(){
      ic.ff++; ic.t=clamp(ic.t+0.34,0,1); snd('tap');
      if(ic.t>=1)ui.toast(el,true,'맨 얼음은 다 녹아 물이… 🧤 단열통 얼음은 그대로!');
      drawStage(); renderStatus();
    }

    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1){ mStep++; exp=M[mStep].exp; cdReset(); lqReset(); gsReset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ─────────────────────────────── 퀴즈 ─────────────────────────────── */
    var QUIZ=[
      { pic:'conduct', q:'열은 온도가 어떤 곳에서 어떤 곳으로 이동할까요?',
        ch:['높은 곳 → 낮은 곳','낮은 곳 → 높은 곳','이동하지 않아요'], a:0 },
      { pic:'conduct', q:'고체에서 열이 이웃한 부분으로 차례차례 전달되는 것을 무엇이라고 할까요?',
        ch:['전도','대류','단열'], a:0 },
      { pic:'conduct', q:'구리·철·유리 중 열이 가장 빨리 전달되는 것은?',
        ch:['구리','철','유리'], a:0 },
      { pic:'liquid', q:'물을 끓일 때 아래만 데워도 전체가 뜨거워지는 까닭은?',
        ch:['뜨거운 물이 위로 올라가며 돌아서','물이 열을 전도로만 전해서','열이 아래로만 가서'], a:0 },
      { pic:'gas', q:'에어컨을 방 위쪽에 다는 까닭은?',
        ch:['차가운 공기는 아래로 내려와서','차가운 공기는 위로 올라가서','전기를 아껴서'], a:0 }
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

    /* ─────────────────────────────── UI ─────────────────────────────── */
    function expTabs(){
      var EXPS=curExps(); if(EXPS.length<=1)return '<div style="height:2px;"></div>';
      var LAB={conduct:'🥄 고체 — 전도', liquid:'💧 액체 — 대류', gas:'🌬️ 기체 — 대류'};
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + EXPS.map(function(e){ var on=(exp===e);
            return '<button class="ht-exp" data-e="'+e+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.hot+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.hot:'#fff')+';color:'+(on?'#fff':C.hot)+';">'+LAB[e]+'</button>'; }).join('')
        + '</div>';
    }
    function ctrlRow(){
      /* ── v2 만약에 집중 무대 ── */
      if(mode==='whatif'){
        var k=wifKey(), s0='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">';
        if(k==='pan')
          return s0+'<button class="ht-btn" data-act="grabSteel" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🖐 쇠 손잡이 잡기</button>'
            +'<button class="ht-btn" data-act="grabWood" style="'+btn+'background:#fff;color:#8D6E63;border-color:#8D6E63;">🖐 나무 손잡이 잡기</button></div>';
        if(k==='insul')
          return s0+'<button class="ht-btn" data-act="iceFF" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">⏩ 시간 빨리 돌리기</button></div>';
        return ''; // ceil = 관찰형(천장 난로 자동 가동)
      }
      if(exp==='conduct'){
        var s='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="ht-btn" data-act="cdHeat" style="'+btn+(cd.heating?'background:'+C.hot+';color:#fff;border-color:'+C.hot:'background:#fff;color:'+C.hot+';border-color:'+C.hot)+';">'+(cd.heating?'⏹ 가열 멈추기':'🔥 가열 시작')+'</button>'
          +'<button class="ht-btn" data-act="cdReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 처음부터</button></div>';
        /* ── v2 1층 — 불 세기 슬라이더 + 가열 위치 토글 (고학년·자유탐구) ── */
        if(mode==='free'&&G().v2){
          var sl='font-size:15px;font-weight:800;color:'+C.sub+';font-family:inherit;';
          s+='<div class="ht-v2" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
            +'<span style="'+sl+'">🕯 약한 불</span>'
            +'<input class="ht-pow" type="range" min="0.4" max="2.2" step="0.05" value="'+power+'" style="width:130px;">'
            +'<span style="'+sl+'">🔥 센 불</span>'
            +'<span class="ht-powlab" style="font-size:15px;font-weight:800;color:'+C.hot+';min-width:56px;font-family:inherit;">×'+power.toFixed(1)+'</span>'
            +'<button class="ht-pos" data-p="left" style="font-size:15px;padding:8px 11px;border-radius:11px;border:2.5px solid '+C.vio+';cursor:pointer;font-weight:800;font-family:inherit;margin-left:8px;'+(pos==='left'?'background:'+C.vio+';color:#fff;':'background:#fff;color:'+C.vio+';')+'">⬅ 끝 가열</button>'
            +'<button class="ht-pos" data-p="mid" style="font-size:15px;padding:8px 11px;border-radius:11px;border:2.5px solid '+C.vio+';cursor:pointer;font-weight:800;font-family:inherit;'+(pos==='mid'?'background:'+C.vio+';color:#fff;':'background:#fff;color:'+C.vio+';')+'">⏺ 가운데 가열</button>'
            +'</div>';
        }
        return s;
      }
      if(exp==='liquid'){
        function b(act,lab,on){ return '<button class="ht-btn" data-act="'+act+'" style="'+btn+(on?'background:'+C.hot+';color:#fff;border-color:'+C.hot:'background:#fff;color:'+C.hot+';border-color:'+C.hot)+';">'+lab+'</button>'; }
        return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          + b('lqBottom','🔥 아래에서 가열',lq.pos==='bottom') + b('lqTop','🔥 위에서 가열',lq.pos==='top')
          +'<button class="ht-btn" data-act="lqOff" style="'+btn+(lq.pos==='off'?'background:#666;color:#fff;border-color:#666':'background:#fff;color:#666;border-color:#9aa')+';">⏹ 끄기</button>'
          +'<button class="ht-btn" data-act="lqReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 물</button></div>';
      }
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        +'<button class="ht-btn" data-act="gsHeater" style="'+btn+(gs.heater?'background:'+C.hot+';color:#fff;border-color:'+C.hot:'background:#fff;color:'+C.hot+';border-color:'+C.hot)+';">🔥 난로 (바닥) '+(gs.heater?'켜짐':'꺼짐')+'</button>'
        +'<button class="ht-btn" data-act="gsAc" style="'+btn+(gs.ac?'background:'+C.cold+';color:#fff;border-color:'+C.cold:'background:#fff;color:'+C.cold+';border-color:'+C.cold)+';">❄️ 에어컨 (천장) '+(gs.ac?'켜짐':'꺼짐')+'</button>'
        +'<button class="ht-btn" data-act="gsReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 공기</button></div>';
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode,{whatif:'🌀 만약에'}), bar='', body='', foot='';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); body=(wif.active()?ctrlRow():''); }
      else body=expTabs()+ctrlRow();
      /* ── v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.ht-btn:active,.ht-exp:active,.ht-pos:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="ht-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="ht-foot">'+foot+'</div>'
        +'<div class="ht-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="ht-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0; mDone=false; mLock=false; cdReset(); lqReset(); gsReset(); v2reset();
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); bindV2(); bands.bind(el); renderChips(); renderStatus();
      if(mode==='whatif')wif.bind(el);
    }

    /* ─────────────────────────────── 무대 ─────────────────────────────── */
    var stage, dyn={};
    function drawStage(){
      stage=el.querySelector('.ht-stage'); stage.innerHTML=''; dyn={};
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var d=svgEl('defs',{}); d.innerHTML=
         '<linearGradient id="htFront" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FA5252"/><stop offset="70%" stop-color="#FF8A3D"/><stop offset="100%" stop-color="#FF8A3D" stop-opacity="0"/></linearGradient>'
        +'<radialGradient id="htFlame" cx="50%" cy="65%" r="60%"><stop offset="0" stop-color="#FFD43B"/><stop offset="100%" stop-color="#FA5252"/></radialGradient>';
      svg.appendChild(d);
      /* ── v2 만약에 미니 무대 라우팅 ── */
      var wk=wifKey();
      if(wk==='pan'){ drawPan(svg); stage.appendChild(svg); dyn.svg=svg; return; }
      if(wk==='insul'){ drawIce(svg); stage.appendChild(svg); dyn.svg=svg; return; }
      if(wk==='ceil'){ drawGas(svg,true); stage.appendChild(svg); dyn.svg=svg; return; }
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='conduct')drawConduct(svg);
      else if(pic==='liquid')drawLiquid(svg);
      else drawGas(svg);
      stage.appendChild(svg);
      dyn.svg=svg;
    }

    /* ── v2 만약에 🍳 — 쇠 손잡이 vs 나무 손잡이 프라이팬 ── */
    function drawPan(svg){
      var PANS=[{cx:265,nm:'쇠 손잡이',steel:true},{cx:640,nm:'나무 손잡이',steel:false}];
      dyn.pan=[];
      for(var i=0;i<2;i++){ var P=PANS[i], cx=P.cx, py=300;
        // 불꽃
        svg.appendChild(svgEl('path',{d:'M '+cx+' '+(py+86)+' q -20 -20 0 -44 q 6 12 12 15 q 9 -12 7 -25 q 17 21 2 49 q -10 10 -21 5 z',fill:'url(#htFlame)'}));
        // 팬 몸통(쇠)
        svg.appendChild(svgEl('path',{d:'M '+(cx-95)+' '+py+' L '+(cx-80)+' '+(py+34)+' L '+(cx+80)+' '+(py+34)+' L '+(cx+95)+' '+py+' Z',fill:'#495057',stroke:'#343A40','stroke-width':3}));
        // 손잡이 — 오른쪽 위로
        var hd=svgEl('rect',{x:cx+92,y:py-14,width:118,height:17,rx:8,fill:P.steel?'#868E96':'#A9744F',stroke:P.steel?'#495057':'#7C4F2C','stroke-width':3,transform:'rotate(-14 '+(cx+92)+' '+(py-6)+')'});
        svg.appendChild(hd); dyn.pan.push({handle:hd});
        // 손잡이 온도 게이지
        svg.appendChild(svgEl('rect',{x:cx-52,y:py-118,width:104,height:22,rx:9,fill:'#fff',stroke:'#C9D7E6','stroke-width':3}));
        var gg=svgEl('rect',{x:cx-49,y:py-115,width:0,height:16,rx:7,fill:heatColor(0)}); svg.appendChild(gg); dyn.pan[i].gauge=gg;
        var gt=svgEl('text',{x:cx,y:py-128,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':17,'font-weight':800,fill:C.ink}); gt.textContent='손잡이 온도'; svg.appendChild(gt);
        var gv=svgEl('text',{x:cx,y:py-82,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:C.hot}); svg.appendChild(gv); dyn.pan[i].tval=gv;
        var nm=svgEl('text',{x:cx,y:py+72,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:C.ink}); nm.textContent=(P.steel?'🔩 ':'🪵 ')+P.nm; svg.appendChild(nm);
      }
    }

    /* ── v2 만약에 🧤 — 맨 얼음 vs 완벽 단열통 얼음 ── */
    function drawIce(svg){
      var t=ic.t;
      // 왼쪽: 맨 얼음(녹아 감)
      svg.appendChild(svgEl('ellipse',{cx:265,cy:352,rx:120,ry:14,fill:'#E7F1F8',stroke:'#C9D7E6','stroke-width':3}));
      if(t<1){
        var sz=1-t*0.82;
        svg.appendChild(svgEl('rect',{x:265-60*sz,y:340-96*sz,width:120*sz,height:96*sz,rx:16*sz,fill:'#D0EBFF',stroke:'#74C0FC','stroke-width':3.5,opacity:0.95}));
      }
      if(t>0.15)svg.appendChild(svgEl('ellipse',{cx:265,cy:349,rx:34+t*76,ry:5+t*6,fill:'#A5D8FF',opacity:0.8}));
      var l1=svgEl('text',{x:265,y:410,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:C.ink}); l1.textContent='🧊 맨 얼음'+(t>=1?' — 다 녹았어요!':''); svg.appendChild(l1);
      // 오른쪽: 단열통 속 얼음(그대로)
      svg.appendChild(svgEl('rect',{x:540,y:222,width:200,height:146,rx:20,fill:'#F1F3F5',stroke:'#868E96','stroke-width':7}));
      svg.appendChild(svgEl('rect',{x:552,y:234,width:176,height:122,rx:14,fill:'#FFF9DB',stroke:'#E9C46A','stroke-width':3,'stroke-dasharray':'7 5'}));
      svg.appendChild(svgEl('rect',{x:580,y:252,width:120,height:96,rx:16,fill:'#D0EBFF',stroke:'#74C0FC','stroke-width':3.5}));
      var l2=svgEl('text',{x:640,y:410,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:C.ink}); l2.textContent='🧤 단열통 얼음 — 그대로!'; svg.appendChild(l2);
      var tl=svgEl('text',{x:450,y:70,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:C.vio}); tl.textContent='⏱ 시간 '+Math.round(t*100)+'% 흐름'; svg.appendChild(tl);
    }

    function drawConduct(svg){
      dyn.rod=[];
      for(var i=0;i<3;i++){ var y=ROD_Y[i], r=RODS[i];
        var nm=svgEl('text',{x:ROD_X-70,y:y+ROD_H/2+8,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':24,fill:C.ink,'font-weight':800}); nm.textContent=r.name; svg.appendChild(nm);
        // 불꽃 (왼쪽 끝 아래)
        var fl=svgEl('path',{d:'M '+(ROD_X+8)+' '+(y+ROD_H+34)+' q -16 -18 0 -38 q 5 10 10 13 q 8 -10 6 -22 q 14 18 2 42 q -9 9 -18 5 z',fill:'url(#htFlame)',opacity:cd.heating?1:0.18}); svg.appendChild(fl); dyn.rod.push({flame:fl});
        // 막대 본체
        svg.appendChild(svgEl('rect',{x:ROD_X,y:y,width:ROD_W,height:ROD_H,rx:13,fill:r.base,stroke:'#fff','stroke-width':3}));
        // 열 퍼짐 오버레이
        var ov=svgEl('rect',{x:ROD_X,y:y,width:0,height:ROD_H,rx:13,fill:'url(#htFront)',opacity:0.9}); svg.appendChild(ov); dyn.rod[i].ov=ov;
        // 입자 점(진동 시각화)
        dyn.rod[i].dots=[];
        for(var k2=0;k2<8;k2++){ var dx2=ROD_X+28+k2*((ROD_W-56)/7);
          var dot=svgEl('circle',{cx:dx2,cy:y+ROD_H/2,r:4.5,fill:'#fff','fill-opacity':0.75}); svg.appendChild(dot);
          dyn.rod[i].dots.push({el:dot,x:dx2,y:y+ROD_H/2,ph:Math.random()*6.28}); }
        // 버터
        var bt=svgEl('g',{}); var bx=ROD_X+ROD_W-6;
        bt.appendChild(svgEl('rect',{x:bx-16,y:y-22,width:32,height:20,rx:6,fill:'#FFE066',stroke:'#F59F00','stroke-width':2.5}));
        var bl=svgEl('text',{x:bx,y:y-34,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':15,fill:C.sub}); bl.textContent='버터'; bt.appendChild(bl);
        svg.appendChild(bt); dyn.rod[i].butter=bt; dyn.rod[i].by=y;
      }
    }

    function drawLiquid(svg){
      var B=LQ_BOX;
      // 비커
      svg.appendChild(svgEl('path',{d:'M '+(B.x-14)+' '+(B.y-8)+' L '+(B.x-14)+' '+(B.y+B.h+10)+' Q '+(B.x-14)+' '+(B.y+B.h+24)+' '+B.x+' '+(B.y+B.h+24)+' L '+(B.x+B.w)+' '+(B.y+B.h+24)+' Q '+(B.x+B.w+14)+' '+(B.y+B.h+24)+' '+(B.x+B.w+14)+' '+(B.y+B.h+10)+' L '+(B.x+B.w+14)+' '+(B.y-8),fill:'rgba(214,234,248,0.45)',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      // 아래 불꽃 / 위 가열 램프
      dyn.lqFlame=svgEl('path',{d:'M '+(B.x+B.w/2)+' '+(B.y+B.h+60)+' q -20 -20 0 -44 q 6 12 12 15 q 9 -12 7 -25 q 17 21 2 49 q -10 10 -21 5 z',fill:'url(#htFlame)'}); svg.appendChild(dyn.lqFlame);
      dyn.lqLamp=svgEl('g',{});
      dyn.lqLamp.appendChild(svgEl('rect',{x:B.x+B.w/2-46,y:B.y-34,width:92,height:18,rx:9,fill:'#FA5252'}));
      var lt=svgEl('text',{x:B.x+B.w/2,y:B.y-42,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':16,fill:C.hot,'font-weight':800}); lt.textContent='가열 막대'; dyn.lqLamp.appendChild(lt);
      svg.appendChild(dyn.lqLamp);
      // 입자
      dyn.lqParts=svgEl('g',{}); svg.appendChild(dyn.lqParts);
      lq.ps.forEach(function(p){ p.el=svgEl('circle',{cx:p.x,cy:p.y,r:9,fill:heatColor(p.t)}); dyn.lqParts.appendChild(p.el); });
      // 위/아래 온도 표시
      dyn.lqTop=svgEl('text',{x:B.x+B.w+40,y:B.y+40,'font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.lqTop);
      dyn.lqBot=svgEl('text',{x:B.x+B.w+40,y:B.y+B.h-10,'font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.lqBot);
    }

    function drawGas(svg,ceil){
      var B=GS_BOX;
      // 방 단면
      svg.appendChild(svgEl('rect',{x:B.x-10,y:B.y-10,width:B.w+20,height:B.h+20,rx:18,fill:'rgba(233,240,248,0.5)',stroke:'#74A4C9','stroke-width':4}));
      var rl=svgEl('text',{x:B.x+10,y:B.y-20,'font-family':'Gowun Dodum,sans-serif','font-size':18,fill:C.sub,'font-weight':800}); rl.textContent='교실 옆모습'; svg.appendChild(rl);
      if(ceil){
        /* ── v2 만약에 🔥 — 난로를 천장에! (기존 난로·에어컨 자리는 비움) ── */
        var cg=svgEl('g',{});
        cg.appendChild(svgEl('rect',{x:B.x+B.w/2-55,y:B.y,width:110,height:36,rx:10,fill:'#FF8A3D',stroke:'#E8590C','stroke-width':3}));
        var ct=svgEl('text',{x:B.x+B.w/2,y:B.y+25,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':18,fill:'#fff','font-weight':800}); ct.textContent='난로(천장?!)'; cg.appendChild(ct);
        svg.appendChild(cg);
      } else {
        // 난로(바닥 왼쪽)
        dyn.gsHeater=svgEl('g',{});
        dyn.gsHeater.appendChild(svgEl('rect',{x:B.x+30,y:B.y+B.h-46,width:80,height:46,rx:10,fill:'#FF8A3D',stroke:'#E8590C','stroke-width':3}));
        var ht2=svgEl('text',{x:B.x+70,y:B.y+B.h-16,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':19,fill:'#fff','font-weight':800}); ht2.textContent='난로'; dyn.gsHeater.appendChild(ht2);
        svg.appendChild(dyn.gsHeater);
        // 에어컨(천장 오른쪽)
        dyn.gsAc=svgEl('g',{});
        dyn.gsAc.appendChild(svgEl('rect',{x:B.x+B.w-130,y:B.y,width:100,height:34,rx:10,fill:'#4DABF7',stroke:'#1971C2','stroke-width':3}));
        var at=svgEl('text',{x:B.x+B.w-80,y:B.y+24,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':18,fill:'#fff','font-weight':800}); at.textContent='에어컨'; dyn.gsAc.appendChild(at);
        svg.appendChild(dyn.gsAc);
      }
      dyn.gsParts=svgEl('g',{}); svg.appendChild(dyn.gsParts);
      gs.ps.forEach(function(p){ p.el=svgEl('circle',{cx:p.x,cy:p.y,r:8,fill:heatColor(p.t)}); dyn.gsParts.appendChild(p.el); });
      dyn.gsTop=svgEl('text',{x:B.x+14,y:B.y+34,'font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.gsTop);
      dyn.gsBot=svgEl('text',{x:B.x+B.w-180,y:B.y+B.h-58,'font-family':'Gowun Dodum,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); svg.appendChild(dyn.gsBot);
    }

    /* ─────────────────────────────── 갱신 ─────────────────────────────── */
    function loop(){ update(); raf=requestAnimationFrame(loop); }
    function update(){
      var wk=wifKey(), now=(Date.now()-t0)/300;
      /* ── v2 만약에 무대 갱신 ── */
      if(wk==='pan'){
        pn.t=clamp(pn.t+0.004,0,1);
        if(dyn.pan){
          for(var pi=0;pi<2;pi++){ var ht3=(pi===0)?pn.t:pn.t*0.06;
            if(dyn.pan[pi].gauge){ dyn.pan[pi].gauge.setAttribute('width',(98*ht3).toFixed(1)); dyn.pan[pi].gauge.setAttribute('fill',heatColor(ht3)); }
            if(dyn.pan[pi].tval)dyn.pan[pi].tval.textContent=Math.round(20+ht3*160)+'℃';
          }
        }
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
        checkMission(); return;
      }
      if(wk==='insul'){
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
        checkMission(); return;
      }
      if(wk==='ceil'){
        var B3=GS_BOX;
        stepConv(gs.ps,B3,[{on:true,x:B3.x+B3.w/2,y:B3.y+17,r:150,dT:0.06,cell:0}]);  // cell=0 = 대류 정지·층 형성
        gs.ps.forEach(function(p){ if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));p.el.setAttribute('fill',heatColor(p.t));} });
        if(dyn.gsTop)dyn.gsTop.textContent='천장 '+degC(regionTemp(gs.ps,B3,true))+'℃';
        if(dyn.gsBot)dyn.gsBot.textContent='바닥 '+degC(regionTemp(gs.ps,B3,false))+'℃';
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
        checkMission(); return;
      }
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='conduct'&&dyn.rod){
        var changed=false;
        for(var i=0;i<3;i++){ var r=dyn.rod[i];
          /* v2 1층 — 불 세기 배수 + 가운데 가열 = 양쪽 퍼짐(끝까지 절반 거리 → 2배) */
          if(cd.heating&&cd.hf[i]<1){ cd.hf[i]=clamp(cd.hf[i]+RODS[i].k*0.0035*power*(pos==='mid'?2:1),0,1); changed=true; }
          if(r.ov){
            if(pos==='mid'){
              r.ov.setAttribute('x',(ROD_X+ROD_W/2-ROD_W*cd.hf[i]/2).toFixed(1));
              r.ov.setAttribute('width',(ROD_W*cd.hf[i]).toFixed(1));
              r.ov.setAttribute('fill','#FA5252'); r.ov.setAttribute('opacity',0.55);
            } else {
              r.ov.setAttribute('x',ROD_X);
              r.ov.setAttribute('width',(ROD_W*cd.hf[i]).toFixed(1));
              r.ov.setAttribute('fill','url(#htFront)'); r.ov.setAttribute('opacity',0.9);
            }
          }
          if(r.flame){ r.flame.setAttribute('opacity',cd.heating?1:0.18);
            r.flame.setAttribute('transform',pos==='mid'?('translate('+(ROD_W/2-8)+',0)'):''); }
          for(var k2=0;k2<r.dots.length;k2++){ var dd=r.dots[k2];
            var reach=(pos==='mid')?clamp(1-(Math.abs(dd.x-(ROD_X+ROD_W/2))-cd.hf[i]*ROD_W/2)/60,0.12,1)
                                   :clamp((cd.hf[i]*ROD_W-(dd.x-ROD_X))/60+0.15,0.12,1);   // 열 도달부일수록 크게 진동
            var amp=reach*4.2;
            dd.el.setAttribute('cx',(dd.x+Math.sin(now*2+dd.ph)*amp).toFixed(1));
            dd.el.setAttribute('cy',(dd.y+Math.cos(now*2.3+dd.ph)*amp).toFixed(1)); }
          if(cd.hf[i]>=1&&!cd.drop[i]){ cd.drop[i]=0.001; cd.order.push(i); changed=true; }
          if(cd.drop[i]>0&&cd.drop[i]<1){ cd.drop[i]=clamp(cd.drop[i]+0.02,0,1); }
          if(r.butter)r.butter.setAttribute('transform','translate(0,'+(cd.drop[i]*95)+') '+(cd.drop[i]>0?'rotate('+(cd.drop[i]*22)+' '+(ROD_X+ROD_W)+' '+dyn.rod[i].by+')':''));
        }
        if(changed){ renderStatus(); checkPred(); }
      }
      else if(pic==='liquid'&&dyn.lqParts){
        var B=LQ_BOX, src=[];
        if(lq.pos==='bottom')src.push({on:true,x:B.x+B.w/2,y:B.y+B.h-6,r:105,dT:0.03,cell:1});
        if(lq.pos==='top')src.push({on:true,x:B.x+B.w/2,y:B.y+8,r:110,dT:0.03,cell:0});
        stepConv(lq.ps,B,src);
        lq.ps.forEach(function(p){ if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));p.el.setAttribute('fill',heatColor(p.t));} });
        if(dyn.lqFlame)dyn.lqFlame.setAttribute('opacity',lq.pos==='bottom'?1:0.15);
        if(dyn.lqLamp)dyn.lqLamp.setAttribute('opacity',lq.pos==='top'?1:0.15);
        if(dyn.lqTop)dyn.lqTop.textContent='위 '+degC(regionTemp(lq.ps,B,true))+'℃';
        if(dyn.lqBot)dyn.lqBot.textContent='아래 '+degC(regionTemp(lq.ps,B,false))+'℃';
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
      }
      else if(pic==='gas'&&dyn.gsParts){
        var B2=GS_BOX, src2=[
          {on:gs.heater,x:B2.x+70,y:B2.y+B2.h-23,r:150,dT:0.06,cell:1},
          {on:gs.ac,x:B2.x+B2.w-80,y:B2.y+17,r:150,dT:-0.06,cell:-1}
        ];
        stepConv(gs.ps,B2,src2);
        gs.ps.forEach(function(p){ if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));p.el.setAttribute('fill',heatColor(p.t));} });
        if(dyn.gsHeater)dyn.gsHeater.setAttribute('opacity',gs.heater?1:0.35);
        if(dyn.gsAc)dyn.gsAc.setAttribute('opacity',gs.ac?1:0.35);
        if(dyn.gsTop)dyn.gsTop.textContent='천장 '+degC(regionTemp(gs.ps,B2,true))+'℃';
        if(dyn.gsBot)dyn.gsBot.textContent='바닥 '+degC(regionTemp(gs.ps,B2,false))+'℃';
        if((window.__klFrame=(window.__klFrame||0)+1)%30===0)renderStatus();
      }
      checkMission();
    }

    function renderStatus(){
      var s=el.querySelector('.ht-status'); if(!s)return;
      function fin(html){
        s.innerHTML=html;
        /* ── v2 검증 관측점 — jsdom에서 물리 상태를 단언할 수 있게 dataset 기록 ── */
        var stg=el.querySelector('.ht-stage');
        if(stg){
          stg.dataset.hf0=cd.hf[0].toFixed(2); stg.dataset.hf1=cd.hf[1].toFixed(2); stg.dataset.hf2=cd.hf[2].toFixed(2);
          stg.dataset.order=cd.order.join(','); stg.dataset.heating=cd.heating?'1':'0';
          stg.dataset.power=power.toFixed(1); stg.dataset.pos=pos;
          stg.dataset.pant=pn.t.toFixed(2); stg.dataset.icet=ic.t.toFixed(2);
          stg.dataset.gstop=String(degC(regionTemp(gs.ps,GS_BOX,true))); stg.dataset.gsbot=String(degC(regionTemp(gs.ps,GS_BOX,false)));
          stg.dataset.lqtop=String(degC(regionTemp(lq.ps,LQ_BOX,true))); stg.dataset.lqbot=String(degC(regionTemp(lq.ps,LQ_BOX,false)));
        }
      }
      if(mode==='quiz'){ fin('<div style="font-size:18px;color:'+C.sub+';">그림을 떠올리며 답을 골라요</div>'); return; }
      /* ── v2 만약에 상태줄 ── */
      var wk=wifKey();
      if(wk==='pan'){
        var st2=Math.round(20+pn.t*160), wd2=Math.round(20+pn.t*0.06*160);
        fin('<div style="font-size:24px;color:'+C.hot+';">🔩 쇠 손잡이 '+st2+'℃ · 🪵 나무 손잡이 '+wd2+'℃</div>'
          +'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(pn.t>0.45?'쇠는 열을 잘 전달해 손잡이까지 뜨거워요 — 🖐 잡아 보면?':'팬이 달궈지는 중… 두 손잡이 온도를 지켜봐요!')+'</div>');
        return;
      }
      if(wk==='insul'){
        fin('<div style="font-size:24px;color:'+C.vio+';">'+(ic.t>=1?'맨 얼음은 다 녹았는데 단열통 얼음은 그대로!':'🧊 맨 얼음 '+Math.round(ic.t*100)+'% 녹음 · 🧤 단열통 얼음 0% — 그대로!')+'</div>'
          +'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(ic.t>=1?'열의 이동을 끊으면 변화도 멈춰요 — 보온병·아이스박스의 원리!':'⏩ 시간을 빨리 돌려 두 얼음을 비교해 봐요.')+'</div>');
        return;
      }
      if(wk==='ceil'){
        var ctp=degC(regionTemp(gs.ps,GS_BOX,true)), cbp=degC(regionTemp(gs.ps,GS_BOX,false));
        fin('<div style="font-size:24px;color:'+C.hot+';">천장 '+ctp+'℃ · 바닥 '+cbp+'℃'+(ctp-cbp>=10?' — 층이 생겼어요!':'')+'</div>'
          +'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(ctp-cbp>=10?'더운 공기가 천장에 머물기만 하고 내려오지 않아요 — 바닥은 차가운 채!':'천장 난로가 켜졌어요 — 두 온도를 지켜봐요.')+'</div>');
        return;
      }
      var h='';
      if(exp==='conduct'){
        if(grade==='low'){
          if(!cd.heating&&cd.order.length===0)h='<div style="font-size:24px;color:'+C.ink+';">🥄 뜨거운 것에 닿으면 <b style="color:'+C.hot+';">따뜻함이 옆으로 옆으로</b> 옮아가요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🔥 가열 시작을 눌러 막대가 따뜻해지는 걸 지켜봐요!</div>';
          else if(cd.order.length>=1)h='<div style="font-size:24px;color:'+C.good+';">버터가 떨어졌어요 — 따뜻함이 막대 끝까지 갔어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">가열한 곳에서 시작해 점점 옆으로 따뜻해진 거예요.</div>';
          else h='<div style="font-size:24px;color:'+C.hot+';">막대가 점점 따뜻해지는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">가열한 끝부터 색이 번지죠? 따뜻함이 옆으로 옮아가고 있어요.</div>';
        }
        else if(!cd.heating&&cd.order.length===0)h='<div style="font-size:24px;color:'+C.ink+';">🥄 고체에서 열은 가열한 곳부터 <b style="color:'+C.hot+';">이웃으로 차례차례</b> 전달돼요 — 전도</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🔥 가열 시작을 눌러 어떤 막대의 버터가 먼저 떨어지는지 지켜봐요!</div>';
        else if(cd.order.length===3)h='<div style="font-size:24px;color:'+C.good+';">버터가 떨어진 순서: '+cd.order.map(function(i){return RODS[i].name;}).join(' → ')+'!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">같은 불인데 빠르기가 달라요. 열이 잘 전달되는 구리 같은 금속과 잘 안 되는 유리 — 그래서 냄비는 금속, 손잡이는 플라스틱!</div>';
        else if(cd.order.length>0)h='<div style="font-size:24px;color:'+C.hot+';">'+RODS[cd.order[cd.order.length-1]].name+' 막대의 버터가 떨어졌어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">열이 막대를 타고 끝까지 전달된 거예요. 다른 막대도 지켜봐요.</div>';
        else h='<div style="font-size:24px;color:'+C.hot+';">열이 막대를 타고 퍼지는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">입자가 이웃 입자를 흔들어 깨우듯, 열이 가열한 끝에서부터 차례로 이동해요.</div>';
      }
      else if(exp==='liquid'){
        var tt=degC(regionTemp(lq.ps,LQ_BOX,true)), bb=degC(regionTemp(lq.ps,LQ_BOX,false));
        if(lq.pos==='bottom')h='<div style="font-size:24px;color:'+C.hot+';">아래에서 데워진 물이 <b>위로</b> 올라가요 — 대류</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">뜨거워진 물(빨강)은 가벼워져 올라가고, 차가운 물(파랑)이 내려와 그 자리를 채우며 빙글빙글 — 그래서 전체가 골고루 데워져요.</div>';
        else if(lq.pos==='top')h='<div style="font-size:24px;color:'+C.cold+';">위에서 데우면? 위 '+tt+'℃인데 아래는 '+bb+'℃!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">뜨거운 물은 위로만 가려 해서 아래로 내려가지 않아요. 그래서 물은 꼭 <b>아래</b>에서 데워요.</div>';
        else h='<div style="font-size:24px;color:'+C.ink+';">💧 액체에서 열은 <b style="color:'+C.hot+';">물이 직접 돌면서</b> 이동해요 — 대류</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">아래에서 가열할 때와 위에서 가열할 때, 무엇이 다른지 비교해 봐요!</div>';
      }
      else {
        if(gs.heater&&gs.ac)h='<div style="font-size:24px;color:'+C.vio+';">따뜻한 공기는 위로, 차가운 공기는 아래로!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">난로의 더운 공기는 올라가고 에어컨의 찬 공기는 내려와 방 전체가 골고루 섞여요.</div>';
        else if(gs.heater)h='<div style="font-size:24px;color:'+C.hot+';">난로의 따뜻한 공기가 <b>천장</b>으로 모여요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">따뜻한 공기는 가벼워서 위로! 그래서 난로는 <b>바닥</b>에 두어야 방 전체가 따뜻해져요.</div>';
        else if(gs.ac)h='<div style="font-size:24px;color:'+C.cold+';">에어컨의 차가운 공기가 <b>바닥</b>으로 내려와요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">차가운 공기는 무거워서 아래로! 그래서 에어컨은 <b>위쪽</b>에 달아야 방 전체가 시원해져요.</div>';
        else h='<div style="font-size:24px;color:'+C.ink+';">🌬️ 공기도 물처럼 <b style="color:'+C.hot+';">돌면서</b> 열을 옮겨요 — 대류</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">난로와 에어컨을 켜 보고, 공기가 어느 쪽으로 움직이는지 살펴봐요!</div>';
      }
      fin(h);
    }

    /* ─────────────────────────────── 바인딩 ─────────────────────────────── */
    function bind(){
      el.querySelectorAll('.ht-exp').forEach(function(b){ b.addEventListener('click',function(){
        exp=b.dataset.e; cdReset(); lqReset(); gsReset(); build(); }); });
      var H={
        cdHeat:function(){ cd.heating=!cd.heating; snd('tap'); build(); },
        cdReset:function(){ cdReset(); snd('select'); build(); },
        lqBottom:function(){ lq.pos='bottom'; build(); },
        lqTop:function(){ lq.pos='top'; build(); },
        lqOff:function(){ lq.pos='off'; build(); },
        lqReset:function(){ lqReset(); build(); },
        gsHeater:function(){ gs.heater=!gs.heater; build(); },
        gsAc:function(){ gs.ac=!gs.ac; build(); },
        gsReset:function(){ gsReset(); build(); },
        grabSteel:function(){ grabHandle('steel'); },
        grabWood:function(){ grabHandle('wood'); },
        iceFF:function(){ iceFF(); }
      };
      el.querySelectorAll('.ht-btn').forEach(function(b){ b.addEventListener('click',function(){ var f=H[b.dataset.act]; if(f)f(); }); });
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

    /* ── v2 변수 바인딩 (1층) — 첫 조작 = 🔮 예측 무장 ── */
    function bindV2(){
      var pw=el.querySelector('.ht-pow'); if(pw)pw.addEventListener('input',function(){
        power=+pw.value; predArm('power');
        var lb=el.querySelector('.ht-powlab'); if(lb)lb.textContent='×'+power.toFixed(1);
        renderStatus(); checkPred();
      });
      el.querySelectorAll('.ht-pos').forEach(function(b){
        b.addEventListener('click',function(){
          if(pos===b.dataset.p)return;
          pos=b.dataset.p; snd('select'); cdReset();
          build(); predArm('pos');
        });
      });
    }

    if(mode==='quiz')newQuiz();
    if(mode==='mission')exp=curMissions()[0].exp;
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
