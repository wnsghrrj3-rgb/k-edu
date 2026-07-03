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
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }
    /* 와우 배너 — .kl-stage-host(relative)에 absolute 주입 + 자동 제거 (헌법 6장: 연출만 얹기) */
    var bnFlashTo=null;
    function clearBnFlash(){ if(bnFlashTo){clearTimeout(bnFlashTo);bnFlashTo=null;} var host=el.querySelector('.kl-stage-host'); if(host){ host.querySelectorAll('.bn-flash,.bn-flash-magic,.bn-nudge,.bn-solve').forEach(function(n){n.remove();}); } }
    function bnFlash(cls,html,ms){
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      host.querySelectorAll('.bn-flash,.bn-flash-magic,.bn-nudge,.bn-solve').forEach(function(n){n.remove();});
      var col=(cls==='bn-flash-magic')?{bg:'#F3F0FF',bd:C.vio,tx:C.vio}
             :(cls==='bn-solve')?{bg:'#E6FCF5',bd:C.good,tx:'#0B7285'}
             :(cls==='bn-nudge')?{bg:'#FFF9DB',bd:'#F59F00',tx:'#B8860B'}
             :{bg:'#E7F5FF',bd:C.blue,tx:C.blue};
      var d=document.createElement('div'); d.className=cls;
      d.setAttribute('style','position:absolute;left:50%;top:12px;transform:translateX(-50%);max-width:92%;z-index:9;'
        +'background:'+col.bg+';border:3px solid '+col.bd+';color:'+col.tx+';border-radius:16px;'
        +'padding:12px 18px;font-size:18px;font-weight:800;font-family:inherit;line-height:1.35;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,0.10);');
      d.innerHTML=html; host.appendChild(d);
      if(bnFlashTo)clearTimeout(bnFlashTo);
      bnFlashTo=setTimeout(function(){ if(d&&d.parentNode)d.parentNode.removeChild(d); bnFlashTo=null; },ms||2800);
    }

    /* ───────────── 상태 ───────────── */
    var exp; // 'cond' | 'ext'
    var cd, ex;
    var oilFire=false, oilArmed=false, oilFlare=0, oilOut=false; // 와우: 기름(유류) 화재
    function oilReset(){ oilFire=false; oilArmed=false; oilFlare=0; oilOut=false; }
    /* ── v2 1층 변수 — 산소 농도·탈 물질(원본 D칸 미이행분). 기본값(21%·초) = 기존 거동 ── */
    var FUELS={ candle:{nm:'초',ic:'🕯️'}, paper:{nm:'종이',ic:'📄'}, nail:{nm:'쇠못',ic:'🔩'} };
    var oxyPct=21, fuel='candle', nailTried=false, sparked=false;
    var wd={ out:false, flare:0, blown:0 };                     // 만약에 💨 바람 무대(촛불·모닥불)
    function v2reset(){ oxyPct=21; fuel='candle'; nailTried=false; sparked=false; wd={out:false,flare:0,blown:0}; }
    function fsMul(){ return oxyPct>=60?1.8:(oxyPct>=30?1.25:(oxyPct>=16?1:0.7)); }   // 불꽃 크기 배수
    function rateMul(){ return Math.max(0.5, oxyPct/21); }                             // 컵 산소 소모 배수(격렬할수록 빨리)
    function cdReset(){ cd={ lit:false, cup:[false,false], oxy:[100,100], out:[false,false], candleH:[1,1], chips:{fuel:false,oxy:false,temp:false} }; sparked=false; stopRaf(); }
    function exReset(){ ex={ burning:true, used:{water:false,cover:false,remove:false}, why:'' }; oilReset(); }
    function resetAll(){ exp='cond'; cdReset(); exReset(); clearBnFlash(); }
    function stopRaf(){ if(raf){cancelAnimationFrame(raf);raf=null;} lastTs=null; }
    resetAll();

    var RATE=[30,12]; // %/초 — 작은 컵 / 큰 컵
    function light(){
      if(fuel==='nail'){                                       // v2: 발화점 반례 — 성냥불로는 안 붙음
        nailTried=true; snd('pop');
        ui.toast(el,false,'🔩 쇠못은 발화점이 아주 높아 성냥불로는 안 붙어요!');
        checkPred(); renderScene(); renderStatus(); return;
      }
      if(oxyPct<16){                                           // v2: 산소 부족(질식 한계) — 불이 못 붙음
        sparked=true; snd('pop');
        ui.toast(el,false,'칙— 반짝하곤 끝… 산소가 '+oxyPct+'%뿐이라 불이 못 붙어요! (16% 아래 = 연소 불가)');
        checkPred(); renderScene(); renderStatus(); return;
      }
      if(cd.lit){ ui.toast(el,false,'이미 타고 있어요!'); return; }
      cd.lit=true; snd('tap'); checkPred(); ensureRaf(); renderScene(); renderStatus(); checkMission();
    }
    function cover(i){
      if(!cd.lit){ ui.toast(el,false,'먼저 🔥 불을 붙여야 해요!'); return; }
      if(cd.cup[i]){ ui.toast(el,false,'이미 덮여 있어요!'); return; }
      cd.cup[i]=true; snd('select'); ensureRaf(); renderScene(); renderStatus();
    }
    function chip(k){
      if(!cd.lit){ ui.toast(el,false,'불을 붙인 뒤 조건을 확인해 봐요!'); return; }
      cd.chips[k]=true; snd('tap');
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
        if(G().burndown||fuel==='paper'){                     // 저학년 타들어감 + v2 📄 종이 = 빨리 다 탐
          var burnRate=(fuel==='paper')?0.45:0.12;
          for(var j=0;j<2;j++){
            if(!cd.out[j]){
              cd.candleH[j]=Math.max(0,cd.candleH[j]-burnRate*dt);
              if(cd.candleH[j]<=0){ cd.out[j]=true; ui.toast(el,true,(fuel==='paper'?'📄 종이가 순식간에 다 탔어요':'초가 다 타서 꺼졌어요')+' — 탈 것이 없어졌거든요!'); }
              else active=true;
            }
          }
        } else {
          for(var i=0;i<2;i++){
            if(cd.cup[i]&&!cd.out[i]){
              cd.oxy[i]=Math.max(0,cd.oxy[i]-RATE[i]*rateMul()*dt);   // v2: 산소 농도 높을수록 격렬 = 빨리 소모
              if(cd.oxy[i]<=0){ cd.out[i]=true; ui.toast(el,true,(i===0?'🥛 작은 컵':'🫙 큰 컵')+' 촛불이 꺼졌어요 — 산소를 다 썼거든요!'); }
              else active=true;
            }
          }
        }
        renderScene(); renderStatus(); checkMission();
      }
      if(active)raf=requestAnimationFrame(tick); else lastTs=null;
    }

    /* ───────── 와우 F칸 — 「물은 만능 소화제」 오개념 반증 (유류 화재, 예측 빗나감형) ─────────
       라이브 소화(ext)는 물=항상 꺼짐만 보여줌 → 기름 불에 물을 뿌리면 *꺼지긴커녕 확 번짐*은 빠져 있던 반직관.
       물이 기름보다 무거워 가라앉았다 순식간에 끓어오르며 기름을 사방으로 튀김. 카드 C②(기름불엔 물 금지) 정조준.
       고학년·자유탐구·소화(ext) 전용(ext는 고학년만), 2단 예측(🔮 무장)→확인(💧 그래도 물). */
    function wowArm(){
      exReset();             // ex.burning=true, 기존 배지 초기화
      oilFire=true; oilArmed=true; oilFlare=0; oilOut=false;
      snd('charge');
      renderScene(); renderStatus();
      bnFlash('bn-flash','지글지글 — 튀김 기름에 불이 붙었어요. 물을 뿌리면 <b>꺼질까요, 더 커질까요?</b> 예상해 봐요!',2700);
    }
    function wowReveal(){    // 「그래도 물 뿌리기」 = 기름 불에 물
      if(!oilArmed){
        snd('select');
        bnFlash('bn-nudge','먼저 🔮 버튼으로 <b>꺼질지·더 커질지</b> 예상부터 해 봐요!',2600);
        return;
      }
      snd('whoosh'); snd('erupt');
      oilFlare=0.34; renderScene();
      var steps=[0.6,0.85,1], i=0;
      (function ramp(){
        if(i>=steps.length)return;
        oilFlare=steps[i++]; renderScene();
        setTimeout(ramp,150);
      })();
      bnFlash('bn-flash-magic','물을 뿌렸더니 불이 <b>확 커졌어요!</b> 🔥 기름은 물보다 가벼워 물 위로 떠서 타고, 가라앉은 물이 갑자기 끓어 기름을 사방으로 튀겨요 — <b>기름 불엔 물을 쓰면 안 돼요!</b>',3600);
      renderStatus(); checkMission();
    }
    function oilExtinguish(method){  // 기름 불 = 덮어서 산소 차단(또는 탈 물질 치우기)으로 끄기
      ex.burning=false; oilOut=true; oilFlare=0;
      if(method==='remove'){ ex.used.remove=true; ex.why='탈 물질(기름)을 치웠어요!'; }
      else { ex.used.cover=true; ex.why='덮어서 산소를 막았어요!'; }
      snd('success');
      renderScene(); renderStatus(); checkMission();
      bnFlash('bn-solve',(method==='remove'?'✂️ 탈 물질(기름)을 치우니 꺼졌어요!':'🫙 덮어 산소를 막으니 꺼졌어요!')+' 기름 불은 <b>물 말고 덮거나 소화기</b>로 꺼야 안전해요.',3200);
    }
    function douse(k){
      if(oilFire && ex.burning){           // 와우: 기름 불 진행 중이면 분기
        if(k==='water'){ wowReveal(); return; }
        if(k==='cover'){ oilExtinguish('cover'); return; }
        if(k==='remove'){ oilExtinguish('remove'); return; }
      }
      if(!ex.burning){ ui.toast(el,false,'불이 이미 꺼졌어요 — 🔥 다시 피워서 다른 방법도!'); return; }
      ex.burning=false; ex.used[k]=true;
      var M={ water:{why:'온도를 발화점보다 낮췄어요!', t:'💧 치익— 물이 온도를 낮춰서 꺼졌어요', s:'whoosh'},
              cover:{why:'산소를 차단했어요!', t:'🪣 덮으니 산소가 못 들어와 꺼졌어요', s:'select'},
              remove:{why:'탈 물질을 없앴어요!', t:'✂️ 탈 것이 없으니 꺼졌어요', s:'select'} };
      ex.why=M[k].why; snd(M[k].s); ui.toast(el,true,M[k].t);
      renderScene(); renderStatus(); checkMission();
    }
    function relight(){ ex.burning=true; ex.why=''; oilOut=false; oilFlare=0; clearBnFlash(); snd('tap'); renderScene(); renderStatus(); }

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
       ※ 산소 100%·우주 만약에 + 발화점 = 탐구 표준 v2 1·2층으로 이행 완료. */
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
      low:  { modes:['free','mission'],                 missions:LOW_MISSIONS, exps:['cond'],       chips:false, cups:false, burndown:true,  showWow:false, v2:false, wif:[] },
      mid:  { modes:['free','mission','quiz','whatif'], missions:MID_MISSIONS, exps:['cond'],       chips:false, cups:true,  burndown:false, showWow:false, v2:false, wif:['vacuum','wind'] },
      high: { modes:['free','mission','quiz','whatif'], missions:MISSIONS,     exps:['cond','ext'], chips:true,  cups:true,  burndown:false, showWow:true,  v2:true,  wif:['oxy100','vacuum','wind'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return G().missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false; resetAll(); v2reset();
      if(wif)wif.reset(); makeWif(); build();
    }});

    /* ───────────── 🌀 만약에 (v2 2층 — 168행이 미뤄둔 산소 100%·우주 상환) ───────────── */
    var WHATIF={
      oxy100:{ icon:'💯', title:'산소 100% 방이라면?',
        q:'공기의 산소는 21%예요. 산소가 100%인 방에서 불을 켜면 어떻게 될까요?',
        ch:['지금과 똑같이 타요','폭발하듯 훨씬 격렬하게 타요','산소가 너무 많아 오히려 꺼져요'], a:1,
        reveal:'산소가 많을수록 연소는 격렬해져요! 불꽃이 훨씬 크고, 컵 속 산소도 순식간에 먹어치워요. 병원 산소통 근처에서 화기 엄금인 까닭이 바로 이거예요.',
        tip:'🔥 불을 켜고 🥛 컵을 덮어 봐요 — 게이지가…!' },
      vacuum:{ icon:'🌌', title:'우주(산소 0)에서 성냥을 켜면?',
        q:'공기가 하나도 없는 우주에서 성냥을 그으면 어떻게 될까요?',
        ch:['평소처럼 켜져요','반짝하곤 불이 안 붙어요','더 크게 타올라요'], a:1,
        reveal:'연소의 세 조건 — 탈 물질·산소·발화점 이상의 온도 — 중 산소가 없으니 불이 못 붙어요! 하나만 빠져도 연소는 불가능해요. (성냥 머리 속 산소로 아주 잠깐 반짝일 뿐이에요.)',
        tip:'🔥 켜 봐요 — 칙… 어라?' },
      wind:{ icon:'💨', title:'불에 바람을 불면?',
        q:'생일초는 후— 불면 꺼지죠. 그럼 모든 불은 바람을 불면 꺼질까요?',
        ch:['모든 불이 꺼져요','작은 불은 꺼지고 큰 불은 오히려 활활!','아무 일도 없어요'], a:1,
        reveal:'약한 불꽃은 바람에 날아가 꺼지지만, 큰 불엔 바람이 산소를 부어주는 셈이라 오히려 활활 타올라요(부채질)! 그래서 불이 난 곳에 부채질하면 절대 안 돼요.',
        tip:'💨 바람 불기 — 촛불과 모닥불을 동시에 지켜봐요!' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ build(); },
        footEl:function(){ return el.querySelector('.bn-foot'); },
        onSelect:function(k){ resetAll(); v2reset(); },
        onPlay:function(k){
          if(k==='oxy100'){ exp='cond'; cdReset(); fuel='candle'; oxyPct=100; }
          else if(k==='vacuum'){ exp='cond'; cdReset(); fuel='candle'; oxyPct=0; }
          else { exp='cond'; cdReset(); wd={out:false,flare:0,blown:0}; }
        },
        onExit:function(){ resetAll(); v2reset(); }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 산소·연료 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ oxy:{asked:false,ch:-1,done:false}, fuel:{asked:false,ch:-1,done:false} };
    var PRED={
      oxy:{ q:'🔮 예측 먼저! 산소를 잔뜩 늘리면 불은 어떻게 될까요?',
        ch:['지금과 똑같다','훨씬 격렬하게 탄다','오히려 꺼진다'],
        tip:'산소를 60% 넘게 올리고 🔥 불을 켜 봐요!' },
      fuel:{ q:'🔮 예측 먼저! 쇠못에도 촛불처럼 불이 붙을까요?',
        ch:['똑같이 붙는다','발화점이 높아 안 붙는다','녹아서 사라진다'],
        tip:'🔩 쇠못을 고르고 🔥 불을 붙여 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.bn-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="bn-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="bn-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.bn-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='oxy') msg=hit?'✔ 예측 적중 — 산소가 많을수록 훨씬 격렬하게 타요! 불꽃도 크고 산소도 금방 먹어치워요.'
                              :'✘ 예측 빗나감 — 산소가 많으면 폭발하듯 격렬하게 타요! 산소통 근처 화기 엄금인 까닭이에요.';
      else msg=hit?'✔ 예측 적중 — 쇠못은 발화점이 아주 높아 성냥불로는 안 붙어요! 물질마다 불붙는 온도가 달라요.'
                  :'✘ 예측 빗나감 — 쇠못은 발화점이 높아 성냥불로는 안 붙어요! 발화점 이상의 온도가 연소의 세 번째 조건이에요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.bn-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.oxy.ch>=0&&!pred.oxy.done&&oxyPct>=60&&cd.lit)predResolve('oxy');
      if(pred.fuel.ch>=0&&!pred.fuel.done&&fuel==='nail'&&nailTried)predResolve('fuel');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={oxy100:'💯 산소백퍼',vacuum:'🌌 우주점화',wind:'💨 부채질',oxy:'🎚 산소예측',fuel:'🔩 발화점예측'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🧯 꼬마 소방과학자 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.bn-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="bn-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }
    /* ── v2 💨 바람 무대 액션 ── */
    function blowWind(){
      wd.blown++;
      if(!wd.out){ wd.out=true; snd('pop'); }
      wd.flare=Math.min(1, wd.flare+0.5);
      snd('whoosh');
      ui.toast(el,true, wd.blown===1?'💨 촛불은 훅 꺼지고… 모닥불은 커졌어요!':'💨 모닥불이 더 활활 타올라요!');
      renderScene(); renderStatus();
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
      /* ── v2 만약에 집중 무대 ── */
      if(mode==='whatif'){
        var k=wif.state.key, s0='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">';
        if(k==='wind')
          return s0+'<button class="bn-btn" data-act="blow" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">💨 바람 불기</button></div>';
        return s0+'<button class="bn-btn" data-act="light" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 촛불 켜기</button>'
          +(k==='oxy100'?'<button class="bn-btn" data-act="cup0" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">🥛 작은 컵 덮기</button>':'')
          +'<button class="bn-btn" data-act="cdReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 초</button></div>';
      }
      if(exp==='cond'){
        var g=G();
        var s='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="bn-btn" data-act="light" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 '+(g.cups&&fuel==='candle'?'두 촛불 켜기':FUELS[fuel].ic+' 불 붙이기')+'</button>';
        if(g.cups&&fuel==='candle') s+='<button class="bn-btn" data-act="cup0" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">🥛 작은 컵 덮기</button>'
          +'<button class="bn-btn" data-act="cup1" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">🫙 큰 컵 덮기</button>';
        s+='<button class="bn-btn" data-act="cdReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 초</button></div>';
        /* ── v2 1층 — 산소 농도 슬라이더 + 탈 물질 3종 (고학년·자유탐구) ── */
        if(mode==='free'&&g.v2){
          var sl='font-size:15px;font-weight:800;color:'+C.sub+';font-family:inherit;';
          s+='<div class="bn-v2" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
            +Object.keys(FUELS).map(function(k2){ var on=(fuel===k2);
              return '<button class="bn-fuel" data-f="'+k2+'" style="font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid '+C.hot+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
                +(on?('background:'+C.hot+';color:#fff;'):('background:#fff;color:'+C.hot+';'))+'">'+FUELS[k2].ic+' '+FUELS[k2].nm+'</button>'; }).join('')
            +'<span style="'+sl+'margin-left:8px;">💨 산소</span>'
            +'<input class="bn-oxy" type="range" min="0" max="100" step="1" value="'+oxyPct+'" style="width:140px;">'
            +'<span class="bn-oxylab" style="font-size:15px;font-weight:800;color:'+(oxyPct<16?'#868E96':(oxyPct>=60?C.hot:C.good))+';min-width:120px;font-family:inherit;">'+oxyPct+'% '+(oxyPct<16?'(불이 못 붙음)':(oxyPct>=60?'(격렬!)':'(공기 21%)'))+'</span>'
            +'</div>';
        }
        return s;
      }
      var er='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">';
      if(G().showWow && mode==='free'){
        er+='<button class="bn-wow" data-wow="arm" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">🔮 기름 불에도 물?</button>'
          +'<button class="bn-wow" data-wow="reveal" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">💧 그래도 물 뿌리기</button>';
      }
      er+='<button class="bn-btn" data-act="water" style="'+btn+'background:#fff;color:'+C.blue+';border-color:'+C.blue+';">💧 물 뿌리기</button>'
        +'<button class="bn-btn" data-act="cover" style="'+btn+'background:#fff;color:'+C.org+';border-color:'+C.org+';">🪣 덮기</button>'
        +'<button class="bn-btn" data-act="remove" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">✂️ 탈 물질 치우기</button>'
        +'<button class="bn-btn" data-act="relight" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 다시 피우기</button></div>';
      return er;
    }

    function build(){
      var M=curMissions();
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode,{whatif:'🌀 만약에'}), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
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
      el.innerHTML='<style>.bn-btn:active,.bn-exp:active,.bn-fuel:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 18px !important;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="bn-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="bn-foot">'+foot+'</div>'
        +'<div class="bn-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="bn-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0; mDone=false; mLock=false; resetAll(); v2reset();
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      renderScene(); bind(); bindV2(); bands.bind(el); renderChips(); renderStatus();
      if(mode==='whatif')wif.bind(el);
    }

    /* ───────────── 무대 ───────────── */
    function renderScene(){
      var stage=el.querySelector('.bn-stage'); if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      if(mode==='whatif'&&wif.active()&&wif.state.key==='wind'){ drawWind(svg); stage.appendChild(svg); return; }
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='cond')drawCond(svg); else drawExt(svg);
      stage.appendChild(svg);
    }

    function flame(x,y,big){
      var m=fsMul();
      return '<ellipse cx="'+x+'" cy="'+(y-26*m)+'" rx="'+((big?15:11)*m)+'" ry="'+((big?26:19)*m)+'" fill="'+(m>=1.8?C.hot:C.org)+'"/>'
        +'<ellipse cx="'+x+'" cy="'+(y-21*m)+'" rx="'+((big?8:6)*m)+'" ry="'+((big?15:11)*m)+'" fill="'+(m<1?'#74C0FC':C.yel)+'"/>';
    }
    function candle(x,y,lit,outSmoke,hPct){
      hPct=(hPct==null?1:hPct);
      var H=110, h0=Math.max(6,H*hPct), top=y+(H-h0);
      var h;
      if(fuel==='paper'&&mode!=='quiz'&&(mode==='free'||mode==='whatif')){
        h='<rect x="'+(x-30)+'" y="'+top+'" width="60" height="'+h0+'" rx="4" fill="#F5E6C8" stroke="#D9B45B" stroke-width="3"/>'
          +'<line x1="'+(x-18)+'" y1="'+(top+h0*0.3)+'" x2="'+(x+18)+'" y2="'+(top+h0*0.3)+'" stroke="#C9A97C" stroke-width="2"/>'
          +'<line x1="'+(x-18)+'" y1="'+(top+h0*0.6)+'" x2="'+(x+18)+'" y2="'+(top+h0*0.6)+'" stroke="#C9A97C" stroke-width="2"/>';
      } else if(fuel==='nail'&&mode!=='quiz'&&(mode==='free'||mode==='whatif')){
        h='<rect x="'+(x-9)+'" y="'+(y+18)+'" width="18" height="'+(H-18)+'" rx="5" fill="#ADB5BD" stroke="#868E96" stroke-width="3"/>'
          +'<rect x="'+(x-20)+'" y="'+(y+10)+'" width="40" height="12" rx="5" fill="#868E96"/>';
        if(nailTried)h+='<text x="'+x+'" y="'+(y-8)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.sub+'" font-family="inherit">안 붙어요!</text>';
        return h;
      } else {
        h='<rect x="'+(x-22)+'" y="'+top+'" width="44" height="'+h0+'" rx="9" fill="#FFF3BF" stroke="#E9C46A" stroke-width="3"/>'
          +'<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top-12)+'" stroke="#5a4632" stroke-width="4"/>';
      }
      if(lit)h+=flame(x,top-10,true);
      else if(outSmoke)h+='<path d="M '+x+' '+(top-16)+' q -8 -16 2 -30 q 9 -13 1 -26" stroke="#ADB5BD" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>';
      return h;
    }
    /* v2 만약에 💨 — 촛불·모닥불 병렬 무대 */
    function drawWind(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var h='<rect x="60" y="372" width="780" height="22" rx="10" fill="#C8B6A6"/>';
      // 왼쪽: 촛불
      h+='<rect x="228" y="262" width="44" height="110" rx="9" fill="#FFF3BF" stroke="#E9C46A" stroke-width="3"/>'
        +'<line x1="250" y1="262" x2="250" y2="250" stroke="#5a4632" stroke-width="4"/>';
      if(!wd.out)h+='<ellipse cx="250" cy="236" rx="15" ry="26" fill="'+C.org+'"/><ellipse cx="250" cy="241" rx="8" ry="15" fill="'+C.yel+'"/>';
      else h+='<path d="M 250 246 q -8 -16 2 -30 q 9 -13 1 -26" stroke="#ADB5BD" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>';
      h+='<text x="250" y="425" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'" font-family="inherit">🕯️ 촛불'+(wd.out?' — 꺼짐!':'')+'</text>';
      // 오른쪽: 모닥불
      var fl=wd.flare, rx=52*(1+fl*0.6), ry=74*(1+fl*0.8);
      h+='<g><line x1="580" y1="370" x2="720" y2="320" stroke="#8D6E63" stroke-width="16" stroke-linecap="round"/>'
        +'<line x1="720" y1="370" x2="580" y2="320" stroke="#6E4226" stroke-width="16" stroke-linecap="round"/></g>'
        +'<ellipse cx="650" cy="'+(282-fl*24)+'" rx="'+rx+'" ry="'+ry+'" fill="'+(fl>0?C.hot:C.org)+'"/>'
        +'<ellipse cx="650" cy="'+(298-fl*20)+'" rx="'+(30*(1+fl*0.5))+'" ry="'+(46*(1+fl*0.6))+'" fill="'+C.yel+'"/>'
        +'<text x="650" y="425" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'" font-family="inherit">🔥 모닥불'+(fl>0?' — 더 활활!':'')+'</text>';
      if(wd.blown>0)h+='<text x="450" y="120" text-anchor="middle" font-size="34" font-weight="800" fill="'+C.blue+'" font-family="inherit">💨💨</text>';
      g.innerHTML=h;
    }
    function drawCond(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      var vac=(mode==='whatif'&&wif.active()&&wif.state.key==='vacuum');
      var h='';
      if(vac){ // v2 🌌 우주 배경
        h+='<rect x="0" y="0" width="900" height="460" fill="#0B1026"/>';
        for(var s2=0;s2<26;s2++){ h+='<circle cx="'+((s2*137+40)%880)+'" cy="'+((s2*89+22)%330)+'" r="'+(1.2+(s2%3))+'" fill="#fff" opacity="'+(0.4+(s2%5)*0.12)+'"/>'; }
        h+='<circle cx="800" cy="80" r="34" fill="#5C7CFA" opacity="0.85"/><circle cx="788" cy="72" r="10" fill="#91A7FF" opacity="0.8"/>';
      }
      h+='<rect x="60" y="372" width="780" height="22" rx="10" fill="'+(vac?'#495057':'#C8B6A6')+'"/>';
      var POS=[290,610], CUP=[{w:120,hh:170,nm:'작은 컵'},{w:170,hh:240,nm:'큰 컵'}];
      for(var i=0;i<2;i++){
        var x=POS[i];
        h+=candle(x,262,cd.lit&&!cd.out[i],cd.out[i]||sparked, (G().burndown||fuel==='paper')?cd.candleH[i]:1);
        if(cd.cup[i]){
          var c=CUP[i];
          h+='<rect x="'+(x-c.w/2)+'" y="'+(372-c.hh)+'" width="'+c.w+'" height="'+c.hh+'" rx="14" fill="'+C.glass+'" opacity="0.34" stroke="'+C.blue+'" stroke-width="3"/>';
          // 산소 게이지
          h+='<rect x="'+(x-52)+'" y="96" width="104" height="22" rx="9" fill="#fff" stroke="'+C.good+'" stroke-width="3"/>'
            +'<rect x="'+(x-49)+'" y="99" width="'+(98*cd.oxy[i]/100)+'" height="16" rx="7" fill="'+C.good+'"/>'
            +'<text x="'+x+'" y="88" text-anchor="middle" font-size="16" font-weight="800" fill="'+C.good+'" font-family="inherit">산소 '+Math.round(cd.oxy[i])+'%</text>';
        }
        var lblCol=vac?'#DEE2E6':C.ink;
        if(G().cups&&fuel==='candle') h+='<text x="'+x+'" y="425" text-anchor="middle" font-size="18" font-weight="800" fill="'+lblCol+'" font-family="inherit">'+CUP[i].nm+(cd.out[i]?' — 꺼짐!':'')+'</text>';
        else h+='<text x="'+x+'" y="425" text-anchor="middle" font-size="18" font-weight="800" fill="'+lblCol+'" font-family="inherit">'+(cd.out[i]?'다 탔어요!':FUELS[fuel].ic+' '+FUELS[fuel].nm)+'</text>';
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
      var h='<rect x="60" y="372" width="780" height="22" rx="10" fill="#C8B6A6"/>';
      if(oilFire){
        h+=oilSceneHtml();
      } else {
        // 모닥불 장작
        h+='<g'+(ex.burning?'':' opacity="0.55"')+'><line x1="380" y1="370" x2="520" y2="320" stroke="#8D6E63" stroke-width="16" stroke-linecap="round"/>'
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
    function oilSceneHtml(){
      var burning=ex.burning, fl=oilFlare, cx=450, panY=344, panW=212, panH=28;
      var h='<rect x="'+(cx-panW/2)+'" y="'+panY+'" width="'+panW+'" height="'+panH+'" rx="12" fill="#495057"/>'
        +'<rect x="'+(cx-panW/2+8)+'" y="'+(panY+5)+'" width="'+(panW-16)+'" height="13" rx="6" fill="#FFA94D" opacity="0.92"/>'   // 기름
        +'<rect x="'+(cx+panW/2-2)+'" y="'+(panY+8)+'" width="84" height="10" rx="5" fill="#343A40"/>'                            // 손잡이
        +'<text x="'+cx+'" y="425" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.ink+'" font-family="inherit">🍳 튀김 기름</text>';
      if(burning){
        var baseY=panY+5, ry=72*(1+fl*0.95), rx=50*(1+fl*0.55);
        h+='<ellipse cx="'+cx+'" cy="'+(baseY-ry*0.52)+'" rx="'+rx+'" ry="'+ry+'" fill="'+(fl>0?C.hot:C.org)+'"/>'
          +'<ellipse cx="'+cx+'" cy="'+(baseY-ry*0.44)+'" rx="'+(rx*0.55)+'" ry="'+(ry*0.6)+'" fill="'+C.yel+'"/>';
        if(fl>0){
          var sp=[[-128,250],[150,240],[-86,205],[120,295],[6,162],[-30,300]];
          for(var i=0;i<sp.length;i++){ var dx=sp[i][0]*(0.5+fl*0.6); h+='<circle cx="'+(cx+dx)+'" cy="'+(sp[i][1]-fl*28)+'" r="'+(5+fl*4)+'" fill="'+C.org+'"/>'; }
          h+='<text x="'+cx+'" y="150" text-anchor="middle" font-size="23" font-weight="800" fill="'+C.hot+'" font-family="inherit">🔥 불이 확 번졌어요!</text>';
        } else {
          h+='<text x="'+cx+'" y="168" text-anchor="middle" font-size="21" font-weight="800" fill="'+C.hot+'" font-family="inherit">🍳 기름에 불이 붙었어요 — 물을 뿌리면?</text>';
        }
      } else {
        h+='<path d="M '+cx+' '+(panY-12)+' q -12 -26 4 -48 q 14 -22 2 -44" stroke="#ADB5BD" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85"/>'
          +'<text x="'+cx+'" y="150" text-anchor="middle" font-size="24" font-weight="800" fill="'+C.good+'" font-family="inherit">불이 꺼졌어요!</text>'
          +'<text x="'+cx+'" y="188" text-anchor="middle" font-size="20" font-weight="800" fill="'+C.vio+'" font-family="inherit">'+ex.why+'</text>';
      }
      return h;
    }

    /* ───────────── 상태줄 ───────────── */
    function renderStatus(){
      var s=el.querySelector('.bn-status'); if(!s)return;
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp, msg;
      function fin(m){
        s.innerHTML=m;
        /* ── v2 검증 관측점 ── */
        var stg=el.querySelector('.bn-stage');
        if(stg){
          stg.dataset.lit=cd.lit?'1':'0'; stg.dataset.oxyp=String(oxyPct); stg.dataset.fuel=fuel;
          stg.dataset.o0=String(Math.round(cd.oxy[0])); stg.dataset.o1=String(Math.round(cd.oxy[1]));
          stg.dataset.out0=cd.out[0]?'1':'0'; stg.dataset.out1=cd.out[1]?'1':'0';
          stg.dataset.spark=sparked?'1':'0'; stg.dataset.nailtry=nailTried?'1':'0';
          stg.dataset.wout=wd.out?'1':'0'; stg.dataset.wflare=wd.flare.toFixed(2);
          stg.dataset.flare=oilFlare.toFixed(2);
        }
      }
      if(mode==='whatif'&&wif.active()&&wif.state.key==='wind'){
        fin('<span style="color:'+(wd.blown>0?C.hot:C.sub)+';font-size:19px;">'+(wd.blown>0?'촛불은 꺼지고 모닥불은 더 커졌어요 — 불난 곳에 부채질은 절대 금지!':'💨 바람을 불면 두 불은 어떻게 될까요?')+'</span>');
        return;
      }
      if(mode==='whatif'&&wif.active()&&wif.state.key==='vacuum'){
        fin('<span style="color:'+(sparked?'#91A7FF':C.sub)+';font-size:19px;">'+(sparked?'칙— 반짝하곤 끝. 산소가 없으면 불은 못 붙어요 (연소 3조건 중 하나 부재)':'🌌 여긴 산소 0%의 우주 — 🔥 성냥을 켜 봐요!')+'</span>');
        return;
      }
      if(mode==='whatif'&&wif.active()&&wif.state.key==='oxy100'){
        fin('<span style="color:'+C.hot+';font-size:19px;">'+(cd.out[0]?'순식간에 산소를 다 먹고 꺼졌어요 — 산소가 많으면 이렇게 격렬!':(cd.lit?'💯 산소 100% — 불꽃이 훨씬 크죠? 🥛 컵을 덮어 봐요!':'💯 산소 100% 방이에요 — 🔥 불을 켜 봐요!'))+'</span>');
        return;
      }
      if(pic==='cond'){
        if(grade==='low'){
          if(cd.out[0]||cd.out[1]) msg='<span style="color:'+C.good+';font-size:19px;">초가 다 타서 꺼졌어요 — 탈 것(초)이 없어졌거든요!</span>';
          else if(cd.lit) msg='<span style="color:'+C.ink+';font-size:19px;">초가 조금씩 타들어가는 중… 다 타면 어떻게 될까요?</span>';
          else msg='<span style="color:'+C.sub+';font-size:19px;">🔥 촛불을 켜 봐요 — 초(탈 것)가 있으면 불이 붙어요!</span>';
        }
        else if(fuel==='nail') msg='<span style="color:'+C.sub+';font-size:19px;">'+(nailTried?'🔩 쇠못은 발화점이 아주 높아 성냥불로는 안 붙어요 — 물질마다 불붙는 온도가 달라요!':'🔩 쇠못에 불을 붙여 봐요 — 붙을까요?')+'</span>';
        else if(fuel==='paper'&&(cd.out[0]||cd.out[1])) msg='<span style="color:'+C.good+';font-size:19px;">📄 종이는 순식간에 다 탔어요 — 탈 물질에 따라 타는 시간이 달라요!</span>';
        else if(sparked) msg='<span style="color:'+C.sub+';font-size:19px;">산소 '+oxyPct+'% — 16% 아래에선 불이 못 붙어요! 슬라이더를 올려 봐요.</span>';
        else if(cd.out[0]&&cd.out[1]) msg='<span style="color:'+C.good+';font-size:19px;">큰 컵이 더 오래 탔죠? 산소가 더 많았으니까요!</span>';
        else if(cd.out[0]) msg='<span style="color:'+C.ink+';font-size:19px;">작은 컵이 먼저 꺼졌어요 — 큰 컵은 아직!</span>';
        else if(cd.cup[0]||cd.cup[1]) msg='<span style="color:'+C.ink+';font-size:19px;">컵 속 산소가 점점 줄어요…'+(oxyPct>=60?' (산소가 많아 훨씬 빨리!)':'')+'</span>';
        else if(cd.lit) msg='<span style="color:'+C.ink+';font-size:19px;">'+(oxyPct>=60?'🔥 불꽃이 훨씬 크고 격렬해요 — 산소 '+oxyPct+'%!':(G().chips?'조건 칩을 확인하고, 컵을 덮어 봐요!':'🥛 컵을 덮어 어떻게 되는지 봐요!'))+'</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">🔥 촛불을 켜고 연소의 조건을 알아봐요</span>';
      } else if(oilFire){
        if(oilOut) msg='<span style="color:'+C.good+';font-size:19px;">기름 불은 <b>물 말고 덮거나 소화기</b>로 꺼야 안전해요!</span>';
        else if(oilFlare>0) msg='<span style="color:'+C.hot+';font-size:19px;">불이 더 번졌어요! 기름 불에 물은 위험 — 🪣 덮기로 꺼 봐요</span>';
        else if(oilArmed) msg='<span class="bn-hold" style="color:'+C.vio+';font-size:19px;">물이 만능 소화제일까요? 기름 불은 다를 수 있어요 — 먼저 예상부터!</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">🍳 기름에 붙은 불 — 어떻게 꺼야 할까요?</span>';
      } else {
        var n=(ex.used.water?1:0)+(ex.used.cover?1:0)+(ex.used.remove?1:0);
        msg='<span style="color:'+(n===3?C.good:C.sub)+';font-size:19px;">'+(n===3?'세 조건 중 하나만 없애도 불은 꺼져요 — 이게 소화!':'소화 방법 체험 '+n+'/3 — 조건 하나를 없애면 꺼져요')+'</span>';
      }
      fin(msg);
    }

    /* ── v2 변수 바인딩 (1층) — 첫 조작 = 🔮 예측 무장 ── */
    function bindV2(){
      var ox=el.querySelector('.bn-oxy'); if(ox)ox.addEventListener('input',function(){
        oxyPct=Math.round(+ox.value); predArm('oxy');
        var lb=el.querySelector('.bn-oxylab');
        if(lb){ lb.textContent=oxyPct+'% '+(oxyPct<16?'(불이 못 붙음)':(oxyPct>=60?'(격렬!)':'(공기 21%)'));
          lb.style.color=oxyPct<16?'#868E96':(oxyPct>=60?C.hot:C.good); }
        renderScene(); renderStatus(); checkPred();
      });
      el.querySelectorAll('.bn-fuel').forEach(function(b){
        b.addEventListener('click',function(){
          if(fuel===b.dataset.f)return;
          fuel=b.dataset.f; nailTried=false; cdReset(); snd('select');
          build(); predArm('fuel');
        });
      });
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.bn-exp').forEach(function(b){
        b.addEventListener('click',function(){ exp=b.dataset.e; snd('select'); clearBnFlash(); stopRaf(); build(); });
      });
      el.querySelectorAll('.bn-wow').forEach(function(b){
        b.addEventListener('click',function(){
          var w=b.dataset.wow;
          if(w==='arm')wowArm();
          else if(w==='reveal')wowReveal();
        });
      });
      el.querySelectorAll('.bn-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var a=b.dataset.act;
          if(a==='light')light();
          else if(a==='cup0')cover(0);
          else if(a==='cup1')cover(1);
          else if(a==='blow')blowWind();
          else if(a==='cdReset'){ snd('select'); cdReset(); sparked=false; nailTried=false; build(); }
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
          snd(ok?'success':'fail');
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    build();
    return { destroy:function(){ stopRaf(); } };
  });
})();
