/* ============================================================================
   케이랩 도구 모듈 — 지층과 화석 (strata) v2  [과학 9호 · 지구 영역 · 탐구 표준 v2]
   4학년 지층과 화석. KLab.ui 4모드(자유탐구/미션/퀴즈/만약에) 표준.
   디지털 우위: 수만 년 걸리는 쌓임·굳음·융기를 시간 압축, 단면을 직접 봄.
   변수 → 현상 → 발견:
     ▸ 바다 밑에 🪨자갈·🟡모래·🟤진흙을 골라 차곡차곡 쌓기 → 줄무늬 지층.
     ▸ 층을 클릭하면 쌓인 순서 번호 — "아래에 있을수록 먼저 쌓인(오래된) 층".
     ▸ 🐚조개·🌿고사리·🐟물고기를 두고 위에 퇴적물을 빨리 덮으면 화석!
       (안 덮고 융기하면 사라짐 — 화석이 되기 어려운 까닭)
     ▸ ⛰️ 융기 → 물이 빠지고 지층이 땅 위로 — "산에서 조개 화석 = 옛날엔 바다".
   v2 (탐구 표준 v2 4층 — 3D 미전환·SVG 유지: 이 도구의 원리는 단면 그 자체):
     1층 변수 개방 — 🌊 물살 세기 슬라이더(고 — 강 하구 모형: 거셀수록 무거운 자갈만
       가까이 남고 모래는 먼바다로, 진흙은 떠내려감 = 입자 크기별 퇴적 위치) +
       ⏳ 쌓는 시간 슬라이더(중·고 — 층 두께 = 시간, 줄무늬 굵기가 기록임을 변수로).
     2층 만약에 — 🏜️ 침식(위부터 깎여 옛 층이 드러남 = 그랜드캐니언) ·
       ↔️ 습곡·단층(굳은 지층도 밀면 휘고 끊어짐, 고) · 🌊 거센 바다(줄무늬는
       잔잔한 물의 선물). 중=🏜️🌊, 고=3종.
     3층 예측 노트 — 물살·시간 첫 조작 = 🔮 예측 무장 → 해소·칩 누적·5칩 토스트.
     4층 표현 승급 — SVG 안에서: 물살 흐름선 rAF 애니 + 습곡 path 휨 + 단층 어긋남.
   미션 4종(줄무늬/가장 오래된 층/화석 만들기/융기) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('strata', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, frame = 0;
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', vio:'#7048E8', water:'#339AF0',
              gravel:'#B0BEC5', gravelDot:'#78909C', sand:'#F2D388', sandDot:'#D9B45B',
              mud:'#A1887F', mudLine:'#8D6E63', rock:'#6E4226' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n); }
    /* ── 와우 배너 머신 (지구과학군 공통 — .kl-stage-host 위 absolute 오버레이 + 자동 제거) ── */
    var stFlashT=null;
    function clearStFlash(){ if(stFlashT){clearTimeout(stFlashT);stFlashT=null;}
      var h=el&&el.querySelector('.kl-stage-host'); if(!h)return;
      var f=h.querySelector('.st-flash,.st-flash-magic,.st-nudge'); if(f)f.remove();
      var hd=el.querySelector('.st-hold'); if(hd)hd.classList.remove('st-hold'); }
    function stBanner(cls,html,ms){
      var h=el&&el.querySelector('.kl-stage-host'); if(!h)return;
      var old=h.querySelector('.st-flash,.st-flash-magic,.st-nudge'); if(old)old.remove();
      if(stFlashT){clearTimeout(stFlashT);stFlashT=null;}
      var col=(cls==='st-flash-magic')?'#7048E8':(cls==='st-nudge'?'#E8590C':'#1565C0');
      var bg=(cls==='st-flash-magic')?'#F3F0FF':(cls==='st-nudge'?'#FFF4E6':'#E7F5FF');
      var d=document.createElement('div'); d.className=cls;
      d.style.cssText='position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:9;max-width:88%;'
        +'background:'+bg+';border:3px solid '+col+';border-radius:16px;padding:12px 18px;'
        +'font-family:inherit;font-weight:800;font-size:17.5px;line-height:1.5;color:'+col+';'
        +'box-shadow:0 6px 22px rgba(21,101,192,0.18);text-align:center;';
      d.innerHTML=html; h.appendChild(d);
      if(ms)stFlashT=setTimeout(function(){ if(d&&d.parentNode)d.remove(); stFlashT=null; },ms);
    }

    /* ───────────── 상태 ───────────── */
    var TYPES = { gravel:{nm:'자갈',fill:C.gravel}, sand:{nm:'모래',fill:C.sand}, mud:{nm:'진흙',fill:C.mud} };
    var FOSSILS = { shell:{nm:'조개',ic:'🐚',env:'바다'}, fern:{nm:'고사리',ic:'🌿',env:'따뜻하고 습한 곳'}, fish:{nm:'물고기',ic:'🐟',env:'물속'} };
    var GX=150, GW=600, GY=400, LH=34, MAXL=7;
    var FX=610, FW=140;                    // v2 먼바다 칸 (물살 켜짐일 때)
    var layers, farLayers, pending, up, uplifting, sel, clickedOldest;
    function reset(){ layers=[]; farLayers=[]; pending=null; up=0; uplifting=false; sel=-1; clickedOldest=false; clearMix(); }
    reset();
    /* ── 와우(27호): 「몽땅 섞어 부으면?」 = 분급(graded bedding) ──
       학생 직관 「자갈·모래·진흙을 섞어 한꺼번에 부으면 뒤죽박죽 덩어리」 → 실제론 무거운
       자갈이 먼저 가라앉고 그 위 모래·맨 위 고운 진흙 = 저절로 아래굵고 위고운 줄무늬.
       라이브는 '한 종류씩 차례로 쌓기'만(줄무늬=여러 번 나눠 쌓아야) + flow 예측은 수평
       거리 → '섞어 붓기·수직 자동 분급'은 아예 없던 묻힌 반직관. 4학년 지층 생성 실험
       (흙 섞어 흔든 뒤 가라앉히기)의 정확한 짝. mid/high·free 전용. */
    var mixArmed=false, mixSettled=false, mixParticles=null;
    var GRAV={gravel:0.052, sand:0.030, mud:0.014}; // 무게(가라앉는 빠르기) — 자갈>모래>진흙
    var MIXY={gravel:GY-24, sand:GY-58, mud:GY-84};  // 분리 후 바닥부터 자갈→모래→진흙 목표대
    function makeMixParticles(){
      var arr=[], seq=['gravel','sand','mud'], id=0;
      for(var t=0;t<seq.length;t++){ var ty=seq[t], n=(ty==='gravel'?9:(ty==='sand'?12:14));
        for(var i=0;i<n;i++){
          var s=Math.sin((id+1)*12.9898)*43758.5453; s-=Math.floor(s);
          var s2=Math.sin((id+7)*78.233)*43758.5453; s2-=Math.floor(s2);
          arr.push({ type:ty, x:GX+40+s*(GW-80), y:150+s2*180, tx:0, id:id++ }); }
      }
      return arr;
    }
    function clearMix(){ if(!mixArmed&&!mixSettled)return;
      mixArmed=false; mixSettled=false; mixParticles=null; clearStFlash(); }
    function wowArm(){
      reset(); v2reset(); mode='free';
      mixArmed=true; mixSettled=false; mixParticles=makeMixParticles(); snd('charge');
      stBanner('st-flash','🌀 자갈·모래·진흙을 <b>몽땅 섞어</b> 잔잔한 물에 부었어요.<br>이대로 가라앉으면 — <b>뒤죽박죽 섞인 덩어리</b>가 될까요, <b>줄무늬</b>가 생길까요? 예상해 봐요!',4600);
      renderScene(); renderStatus();
    }
    function wowReveal(){
      if(!mixArmed){ snd('select'); stBanner('st-nudge','먼저 🔮 <b>몽땅 섞어 부으면?</b> 버튼으로 예상부터 해 봐요!',2600); return; }
      snd('whoosh'); snd('success'); mixSettled=true;
      stBanner('st-flash-magic','✨ 한꺼번에 부었는데 <b>저절로 줄무늬</b>가 생겼어요!<br>무거운 <b>자갈이 먼저</b> 가라앉고, 그 위에 <b>모래</b>, 맨 위에 고운 <b>진흙</b> — 알갱이 크기가 다르면 가라앉는 빠르기가 달라 <b>아래는 굵고 위는 고운</b> 층이 저절로 나뉘어요!',7200);
      renderScene(); renderStatus();
    }
    function renderMix(){
      if(!svg)return; svg.innerHTML='';
      svg.appendChild(svgEl('circle',{cx:790,cy:74,r:26,fill:'#F59F00','fill-opacity':0.55}));
      svg.appendChild(svgEl('rect',{x:100,y:118,width:700,height:GY-118+40,rx:14,fill:C.water,'fill-opacity':0.32}));
      for(var wv=0;wv<3;wv++){ var wx=140+wv*240+Math.sin(frame/22+wv)*14;
        svg.appendChild(svgEl('path',{d:'M '+wx+' 126 q 22 -9 44 0 q 22 9 44 0',fill:'none',stroke:'#fff','stroke-width':3,'stroke-opacity':0.5})); }
      svg.appendChild(svgEl('rect',{x:GX-14,y:GY,width:GW+28,height:46,rx:8,fill:C.rock}));
      if(mixParticles)mixParticles.forEach(function(pt){
        var col=(pt.type==='gravel'?C.gravelDot:(pt.type==='sand'?C.sandDot:C.mudLine));
        var r=(pt.type==='gravel'?6:(pt.type==='sand'?3.4:2.2));
        svg.appendChild(svgEl('circle',{cx:pt.x,cy:pt.y,r:r,fill:col,stroke:'rgba(0,0,0,0.18)','stroke-width':1,'data-mixtype':pt.type}));
      });
      if(mixSettled){
        var lb=svgEl('text',{x:GX+GW/2,y:150,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.vio});
        lb.textContent='⬇ 무거운 자갈부터 가라앉아 아래 · 고운 진흙은 맨 위'; svg.appendChild(lb);
      } else {
        var lb2=svgEl('text',{x:GX+GW/2,y:150,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:'#1565C0'});
        lb2.textContent='🌀 섞인 흙탕물 — 🌀 한꺼번에 쏟기를 눌러 봐요!'; svg.appendChild(lb2);
      }
    }
    function embeddedFossils(){ var r=[]; for(var i=0;i<layers.length;i++)if(layers[i].fossil)r.push(layers[i].fossil); return r; }
    /* ── v2 1층 변수 — 물살 세기·쌓는 시간. 기본값 = 기존 라이브와 동일 거동 ── */
    var flow=0.2, dur=0.5;                 // 잔잔·보통 = 전부 하구·두께 ×1.0(기존)
    var erodeN=0, foldN=0;                 // 만약에 카운터(침식·습곡단층)
    function v2reset(){ flow=0.2; dur=0.5; erodeN=0; foldN=0; }
    function thOf(){ return 0.4+dur*1.2; } // 층 두께 배수: 짧게 0.4 · 보통 1.0(기존) · 오래 1.6
    function zoneOf(type){                 // 강 하구 모형: 입자 무게 × 물살 = 가라앉는 자리
      if(flow<0.35)return 'near';
      if(flow<0.7)return type==='mud'?'far':'near';
      return type==='gravel'?'near':(type==='sand'?'far':'away');
    }
    function flowName(){ return (flow>=0.7?'🌊 거셈':(flow<0.35?'🫧 잔잔':'중간')); }
    function durName(){ return (dur>=0.8?'오래':(dur<0.25?'짧게':'보통'))+' · 두께 ×'+thOf().toFixed(1); }
    function sumTh(list){ var s=0; for(var i=0;i<list.length;i++)s+=list[i].th; return s; }
    function flowOn(){ return (mode==='free'&&G().v2&&G().v2.flow) || (mode==='whatif'&&wif&&wif.active()&&wif.state.key==='storm'); }

    function deposit(type){ clearMix();
      if(up>0){ ui.toast(el,false,'🌊 지층은 물속에서 쌓여요 — ↺ 처음부터!'); return; }
      var zone=flowOn()?zoneOf(type):'near';
      if(zone==='away'){
        ui.toast(el,false,'🌊 가벼운 '+TYPES[type].nm+'은(는) 거센 물살에 떠내려가 여기엔 못 쌓여요!');
        checkPred(zone); renderScene(); renderStatus(); return;
      }
      var list=(zone==='far')?farLayers:layers;
      if(list.length>=MAXL||sumTh(list)+thOf()>8){ ui.toast(el,false,'층이 가득! 이만하면 멋진 지층이에요'); return; }
      var f=null;
      if(zone==='near'&&pending){ f=pending; pending=null; }   // 위에 덮이면 화석으로!
      list.push({ type:type, fossil:f, prog:0, th:thOf() });
      sel=-1; checkPred(zone); renderScene(); renderStatus(); checkMission();
    }
    function placeFossil(kind){ clearMix();
      if(up>0){ ui.toast(el,false,'물이 빠진 뒤엔 생물이 가라앉지 못해요 — ↺ 처음부터!'); return; }
      if(layers.length>=MAXL){ ui.toast(el,false,'덮을 자리가 없어요!'); return; }
      pending=kind; renderScene(); renderStatus();
    }
    function doUplift(){ clearMix();
      if(up>0)return;
      if(layers.length===0){ ui.toast(el,false,'먼저 지층을 쌓아야 들어 올리죠!'); return; }
      if(pending){ pending=null; ui.toast(el,false,'덮이지 못한 생물은 화석이 못 돼요…'); }
      uplifting=true; renderStatus(); checkMission();
    }
    function clickLayer(i){ clearMix();
      sel=i; renderScene(); renderStatus();
      if(mode==='mission'&&mStep===1&&!mLock&&layers.length>=3&&i!==0)ui.toast(el,false);
      if(layers.length>=3&&i===0)clickedOldest=true;
      checkMission();
    }
    /* ── v2 2층 액션 — 침식(위부터 깎기)·습곡단층(양옆에서 밀기) ── */
    function erode(){ clearMix();
      if(layers.length<=1){ ui.toast(el,false,layers.length?'🏜️ 가장 오래된 층까지 다 드러났어요!':'깎을 층이 없어요'); return; }
      layers.pop(); erodeN++; sel=-1;
      ui.toast(el,true, layers.length===1?'🏜️ 맨 아래 — 가장 오래된 층이 드러났어요!':'🌬 위층이 깎여 나갔어요 — 더 옛날 층이 보여요!');
      renderScene(); renderStatus();
    }
    function pushFold(){ clearMix();
      if(foldN>=3){ ui.toast(el,false,'이미 끊어졌어요 — 🔁 더 가지고 놀기로 새 지층!'); return; }
      foldN++;
      if(foldN===1)ui.toast(el,true,'으으… 딱딱한 지층이 휘기 시작해요 (습곡)');
      else if(foldN===2)ui.toast(el,true,'더 크게 휘어요 — 엿가락처럼!');
      else ui.toast(el,true,'우지끈! 끊어져 어긋났어요 (단층)!','rumble');
      renderScene(); renderStatus();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'퇴적물을 <b style="color:#7048E8;">서로 다른 종류로 3층 이상</b> 쌓아 줄무늬 지층을 만들어요!',
        keep:false, check:function(){ var t={}; layers.forEach(function(l){t[l.type]=1;});
          return layers.length>=3 && Object.keys(t).length>=2; } },
      { text:'<b style="color:#7048E8;">가장 먼저 쌓인(가장 오래된) 층</b>을 클릭해 찾아요!',
        keep:true, check:function(){ return clickedOldest; } },
      { text:'🐚 <b style="color:#7048E8;">조개를 두고 위에 퇴적물을 덮어</b> 화석을 만들어요!',
        keep:true, check:function(){ return embeddedFossils().length>0; } },
      { text:'⛰️ <b style="color:#7048E8;">융기!</b> 화석이 든 지층을 땅 위로 — 산에서 조개가 나오는 까닭을 확인해요!',
        keep:true, check:function(){ return up>=1 && embeddedFossils().length>0; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=줄무늬 지층 쌓기·화석 만들기(일상어, 오래된 층 추론·융기·퀴즈 숨김) /
       중=가장 오래된 층·화석·융기 전부+퀴즈(4학년 본 과정)+쌓는 시간·만약에(🏜️🌊) /
       고=중+물살 세기·만약에 3종(지층은 4학년 과정 — 풀세트 유지). */
    var LOW_MISSIONS=[
      { text:'🪨🟡🟤 <b style="color:#7048E8;">서로 다른 퇴적물을 3층 이상</b> 차곡차곡 쌓아 줄무늬를 만들어요!',
        keep:false, check:function(){ var t={}; layers.forEach(function(l){t[l.type]=1;});
          return layers.length>=3 && Object.keys(t).length>=2; } },
      { text:'🐚 <b style="color:#7048E8;">조개를 두고 위에 퇴적물을 덮어</b> 화석을 만들어요!',
        keep:true, check:function(){ return embeddedFossils().length>0; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],                 missions:LOW_MISSIONS, low:true,  v2:null,                      wif:[], wow:false },
      mid:  { modes:['free','mission','quiz','whatif'], missions:MISSIONS,     low:false, v2:{dur:true},                wif:['erosion','storm'], wow:true },
      high: { modes:['free','mission','quiz','whatif'], missions:MISSIONS,     low:false, v2:{flow:true,dur:true},      wif:['erosion','fold','storm'], wow:true }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return G().missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false; reset(); v2reset();
      if(wif)wif.reset(); makeWif(); build();
    }});
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false; var M=curMissions();
          if(mStep<M.length-1){ mStep++; if(!M[mStep].keep)reset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 🌀 만약에 (v2 2층 — 라이브에 만약에 모드 자체가 없었음) ───────────── */
    function preLayers(n){
      return ['gravel','sand','mud','sand','gravel'].slice(0,n).map(function(t){ return {type:t,fossil:null,prog:1,th:1}; });
    }
    var WHATIF={
      erosion:{ icon:'🏜️', title:'융기한 뒤 비바람이 아주 오래 깎는다면?',
        q:'땅 위로 올라온 지층 — 맨 아래(가장 오래된) 층은 영영 못 볼까요?',
        ch:['맨 아래층은 영영 못 봐요','위부터 깎여 옛 층이 드러나요','지층이 통째로 사라져요'], a:1,
        reveal:'위층부터 깎여 나가며 깊은 옛 층이 오히려 드러나요! 계곡 절벽의 줄무늬(그랜드캐니언)가 바로 그 모습 — 쌓임의 기록을 침식이 펼쳐 보여 주는 거예요.',
        tip:'🌬 비바람 깎기를 계속 눌러 봐요 — 위층부터 사라지면…!' },
      fold:{ icon:'↔️', title:'굳은 지층을 양옆에서 계속 민다면?',
        q:'돌처럼 딱딱하게 굳은 지층을 아주 오래 밀면 어떻게 될까요?',
        ch:['와장창 부서져 가루가 돼요','엿가락처럼 휘거나 우지끈 끊어져요','아무 일도 없어요'], a:1,
        reveal:'오랜 시간 큰 힘을 받으면 딱딱한 지층도 엿가락처럼 휘고(습곡), 더 밀면 우지끈 끊어져 어긋나요(단층)! 교과서의 휘어진 지층·끊어진 지층 사진이 이렇게 생겼어요 — 지진(끊어짐)과 같은 힘 이야기예요.',
        tip:'↔️ 밀기를 계속 눌러 봐요 — 휘다가… 결국!' },
      storm:{ icon:'🌊', title:'물살이 늘 거세기만 한 바다라면?',
        q:'물살이 늘 거센 곳에서도 줄무늬 지층이 잘 쌓일까요?',
        ch:['어디서나 잘 쌓여요','가벼운 알갱이가 못 가라앉아 줄무늬가 잘 안 생겨요','오히려 더 빨리 쌓여요'], a:1,
        reveal:'거센 물살에선 진흙·모래가 가라앉지 못하고 떠내려가요 — 무거운 자갈만 남죠. 고운 줄무늬 지층은 잔잔한 물속이 주는 선물이에요!',
        tip:'거센 물살이에요. 🟤 진흙과 🟡 모래를 부어 봐요 — 어라?' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ build(); },
        footEl:function(){ return el.querySelector('.st-foot'); },
        onSelect:function(k){ reset(); v2reset(); },
        onPlay:function(k){
          if(k==='erosion'){ reset(); v2reset(); layers=preLayers(5); up=1; }
          else if(k==='fold'){ reset(); v2reset(); layers=preLayers(4); up=1; }
          else { reset(); v2reset(); flow=1; }
        },
        onExit:function(){ reset(); v2reset(); }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 물살·시간 슬라이더 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ flow:{asked:false,ch:-1,done:false}, dur:{asked:false,ch:-1,done:false} };
    var PRED={
      flow:{ q:'🔮 예측 먼저! 물살이 거세지면 퇴적물은 어디에 쌓일까요?',
        ch:['어디든 똑같이 쌓인다','무거운 것부터 가까이 가라앉는다','가벼운 것부터 가까이 가라앉는다'],
        tip:'물살을 🌊 거셈까지 올리고 자갈·모래·진흙을 하나씩 부어 봐요!' },
      dur:{ q:'🔮 예측 먼저! 오래오래 쌓으면 층은 어떻게 될까요?',
        ch:['두께는 그대로다','층이 더 두꺼워진다','층 개수만 늘어난다'],
        tip:'쌓는 시간을 오래 끝까지 올리고 한 층 부어 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.st-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="st-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="st-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.st-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; if(window.KLab.sound)window.KLab.sound.play('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='flow') msg=hit?'✔ 예측 적중 — 무거운 자갈은 가까이, 가벼운 진흙은 멀리 가거나 떠내려가요! 알갱이 크기가 가라앉는 자리를 정해요.'
                               :'✘ 예측 빗나감 — 무거운 것부터 가까이 가라앉아요! 가벼운 진흙은 멀리 떠가거나 아예 못 가라앉죠.';
      else msg=hit?'✔ 예측 적중 — 오래 쌓일수록 층이 두꺼워요! 줄무늬의 굵기는 시간의 기록이에요.'
                  :'✘ 예측 빗나감 — 오래 쌓으면 층이 두꺼워져요! 줄무늬의 굵기가 곧 시간의 기록이거든요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast();
      if(window.KLab.sound)window.KLab.sound.play(hit?'success':'pop');
      var fc=el.querySelector('.st-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(zone){
      if(mode!=='free')return;
      if(pred.flow.ch>=0&&!pred.flow.done&&flow>=0.7&&zone!=='near')predResolve('flow');
      if(pred.dur.ch>=0&&!pred.dur.done&&dur>=0.8&&zone!=='away')predResolve('dur');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 (지구과학군 규약 공유) ── */
    var CHIPNM={erosion:'🏜️ 침식',fold:'↔️ 습곡단층',storm:'🌊 거센바다',flow:'🌀 물살실험',dur:'⏳ 시간실험'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🪨 꼬마 지질학자 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.st-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="st-chip" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { q:'지층에서 가장 먼저 쌓인 층은 어디에 있을까요?',
        ch:['맨 아래','맨 위','가운데'], a:0 },
      { q:'지층은 주로 어디에서 만들어질까요?',
        ch:['바다나 호수의 물 밑','뜨거운 사막 위','구름 속'], a:0 },
      { q:'죽은 생물이 화석이 되려면 어떻게 되어야 할까요?',
        ch:['퇴적물이 빨리 덮어야 해요','햇빛에 오래 말라야 해요','바람에 날려가야 해요'], a:0 },
      { q:'산에서 조개 화석이 발견되면 알 수 있는 것은?',
        ch:['옛날에 그곳이 바다였다','조개가 산을 좋아했다','누가 조개를 버렸다'], a:0 },
      { q:'지층에 줄무늬가 생기는 까닭은?',
        ch:['종류가 다른 퇴적물이 차례로 쌓여서','누가 줄을 그어서','비가 많이 와서'], a:0 }
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
    function ctrlRow(){
      function bt(act,lab,col,extra){ return '<button class="st-btn" data-act="'+act+'" style="'+btn+'border-color:'+col+';background:#fff;color:'+col+';'+(extra||'')+'">'+lab+'</button>'; }
      var open='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">';
      if(mode==='whatif'){
        var k=wif.state.key;
        if(k==='erosion') return open+bt('erode','🌬 비바람 깎기','#E8590C')+'</div>';
        if(k==='fold')    return open+bt('fold','↔️ 밀기',C.vio)+'</div>';
        return open
          +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';">붓기</span>'
          + bt('d-gravel','🪨 자갈','#607D8B') + bt('d-sand','🟡 모래','#C9971C') + bt('d-mud','🟤 진흙','#8D6E63')
          +'</div>';
      }
      return open
        +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';">쌓기</span>'
        + bt('d-gravel','🪨 자갈','#607D8B') + bt('d-sand','🟡 모래','#C9971C') + bt('d-mud','🟤 진흙','#8D6E63')
        +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';margin-left:8px;">생물 두기</span>'
        + bt('f-shell','🐚','#1565C0') + bt('f-fern','🌿','#2F9E44') + bt('f-fish','🐟','#1098AD')
        + (G().low?'':bt('uplift','⛰️ 융기!',C.vio,'margin-left:8px;'+(up>0?'opacity:.45;':'')))
        + bt('reset','↺ 처음부터','#889')
        +'</div>';
    }
    /* ── 와우 헤드라인 버튼 (free·mid/high 전용) — 2단 예측→확인 ── */
    function wowRow(){
      if(mode!=='free'||!G().wow) return '';
      return '<div class="st-wow" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
        +'<button class="st-wowbtn" data-wow="arm" style="'+btn+'border-color:#7048E8;background:#F3F0FF;color:#5F3DC4;">🔮 몽땅 섞어 부으면?</button>'
        +'<button class="st-wowbtn" data-wow="reveal" style="'+btn+'border-color:#12B886;background:#fff;color:#0B7A5C;">🌀 한꺼번에 쏟기</button>'
        +'</div>';
    }
    /* ── v2 변수 행 (1층 — 자유탐구 전용, 학년 게이팅) ── */
    function v2Row(){
      if(mode!=='free'||!G().v2) return '';
      var g2=G().v2, sl='font-size:15px;font-weight:800;color:#5a7894;font-family:inherit;';
      return '<div class="st-v2" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
        +(g2.flow?('<span style="'+sl+'">🫧 잔잔</span>'
          +'<input class="st-flow" type="range" min="0" max="1" step="0.01" value="'+flow+'" style="width:140px;">'
          +'<span style="'+sl+'">🌊 거셈</span>'
          +'<span class="st-flowlab" style="font-size:15px;font-weight:800;color:#1565C0;min-width:78px;font-family:inherit;">'+flowName()+'</span>'):'')
        +(g2.dur?('<span style="'+sl+'">'+(g2.flow?'&nbsp;&nbsp;':'')+'⏳ 짧게</span>'
          +'<input class="st-dur" type="range" min="0" max="1" step="0.01" value="'+dur+'" style="width:140px;">'
          +'<span style="'+sl+'">오래</span>'
          +'<span class="st-durlab" style="font-size:15px;font-weight:800;color:#E8590C;min-width:118px;font-family:inherit;">'+durName()+'</span>'):'')
        +'</div>';
    }
    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode,{whatif:'🌀 만약에'}), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(curMissions()[mStep].text,mStep,curMissions().length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); body=(wif.active()?ctrlRow():''); }
      else body=wowRow()+v2Row()+ctrlRow();
      /* ── v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); if(window.KLab.sound)window.KLab.sound.play(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.st-btn:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.st-layer{cursor:pointer;}.st-hold{animation:st_pulse 1s ease-in-out infinite;}@keyframes st_pulse{0%,100%{opacity:1;}50%{opacity:.48;}}.st-wowbtn:active{transform:translateY(2px);}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="st-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:linear-gradient(180deg,#D0EBFF 0%,#E7F5FF 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="st-foot">'+foot+'</div>'
        +'<div class="st-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="st-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0; mDone=false; mLock=false; reset(); v2reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); bindV2(); bands.bind(el); renderChips(); renderScene(); renderStatus();
      if(mode==='whatif')wif.bind(el);
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage(){
      stage=el.querySelector('.st-stage'); stage.innerHTML='';
      svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      stage.appendChild(svg);
    }
    function texture(g,type,x,y,w,h,seed){
      var i,n;
      function rnd(k){ var v=Math.sin(seed*91.7+k*47.3)*10000; return v-Math.floor(v); }
      if(type==='gravel'){ n=Math.max(2,Math.floor(w/46));
        for(i=0;i<n;i++)g.appendChild(svgEl('circle',{cx:x+18+rnd(i)*(w-36),cy:y+h*0.3+rnd(i+30)*h*0.45,r:4.5+rnd(i+60)*3,fill:C.gravelDot}));
      } else if(type==='sand'){ n=Math.max(3,Math.floor(w/26));
        for(i=0;i<n;i++)g.appendChild(svgEl('circle',{cx:x+10+rnd(i)*(w-20),cy:y+5+rnd(i+30)*(h-10),r:1.7,fill:C.sandDot}));
      } else { for(i=1;i<=2;i++)g.appendChild(svgEl('line',{x1:x+14,y1:y+h*i/3,x2:x+w-14,y2:y+h*i/3,stroke:C.mudLine,'stroke-width':2,'stroke-opacity':0.55})); }
    }
    /* 층 하나 그리기 — 습곡(foldN 1~2)=path 휨 / 단층(foldN 3)=끊어져 어긋남 / 평소=rect */
    function layerShape(g,L,x,w,y,h,i){
      if(foldN>=3){                                   // 단층: 반으로 끊어져 오른쪽이 내려앉음
        var mid=x+w/2, off=20;
        g.setAttribute('class','st-layer st-fault'); g.setAttribute('data-i',i);
        g.appendChild(svgEl('rect',{x:x,y:y,width:w/2-3,height:h,fill:TYPES[L.type].fill,stroke:'#5D4037','stroke-width':3}));
        g.appendChild(svgEl('rect',{x:mid+3,y:y+off,width:w/2-3,height:h,fill:TYPES[L.type].fill,stroke:'#5D4037','stroke-width':3}));
        return;
      }
      if(foldN>0){                                    // 습곡: 위·아래 변이 나란히 휜 path
        var A=foldN===1?14:26, mx=x+w/2;
        g.setAttribute('class','st-layer st-fold'); g.setAttribute('data-i',i);
        g.appendChild(svgEl('path',{d:'M '+x+' '+y+' Q '+mx+' '+(y-2*A)+' '+(x+w)+' '+y
          +' L '+(x+w)+' '+(y+h)+' Q '+mx+' '+(y+h-2*A)+' '+x+' '+(y+h)+' Z',
          fill:TYPES[L.type].fill,stroke:'#5D4037','stroke-width':3}));
        return;
      }
      g.setAttribute('class','st-layer'); g.setAttribute('data-i',i);
      g.appendChild(svgEl('rect',{x:x,y:y,width:w,height:h,fill:TYPES[L.type].fill,
        stroke:(sel===i?C.vio:(up>0.5?'#5D4037':'#90785F')),'stroke-width':(sel===i?5:2.5+up*1)}));
      if(L.prog>=1&&h>10)texture(g,L.type,x,y,w,h,i+1);
    }
    function renderScene(){
      if(!svg)return;
      if(mixArmed||mixSettled){ renderMix(); return; }
      svg.innerHTML='';
      var fOn=flowOn(), NW=fOn?430:GW;                // 물살 켜짐 = 하구 폭 축소 + 먼바다 칸
      var acc=0, hcur=[], i;
      for(i=0;i<layers.length;i++){ hcur[i]=LH*layers[i].th*Math.min(layers[i].prog,1); }
      var totalH=0; for(i=0;i<layers.length;i++)totalH+=hcur[i];
      var topY=GY-totalH;
      // 해 (융기 후 더 크고 밝게)
      svg.appendChild(svgEl('circle',{cx:790,cy:74,r:26+up*8,fill:'#F59F00','fill-opacity':0.55+up*0.45}));
      // 바닷물 — 융기하면 빠짐
      if(up<1){
        var wy=118+up*(GY-118);
        svg.appendChild(svgEl('rect',{x:100,y:wy,width:700,height:GY-wy+40,rx:14,fill:C.water,'fill-opacity':0.32*(1-up*0.5)}));
        for(var wv=0;wv<3;wv++){ var wx=140+wv*240+Math.sin(frame/22+wv)*14;
          svg.appendChild(svgEl('path',{d:'M '+wx+' '+(wy+8)+' q 22 -9 44 0 q 22 9 44 0',fill:'none',stroke:'#fff','stroke-width':3,'stroke-opacity':0.5*(1-up)})); }
        // v2 4층: 물살 흐름선 애니 — 세기에 비례해 빨라지고 진해짐
        if(fOn&&flow>0.05){
          var spd=2+flow*9;
          for(var fl=0;fl<3;fl++){
            var fx2=110+((frame*spd+fl*230)%680), fy=150+fl*36;
            svg.appendChild(svgEl('path',{d:'M '+fx2+' '+fy+' h '+(26+flow*40),stroke:'#fff','stroke-width':3.5,'stroke-linecap':'round','stroke-opacity':0.25+flow*0.5}));
            svg.appendChild(svgEl('path',{d:'M '+(fx2+26+flow*40)+' '+fy+' l -9 -6 M '+(fx2+26+flow*40)+' '+fy+' l -9 6',stroke:'#fff','stroke-width':3,'stroke-linecap':'round','stroke-opacity':0.25+flow*0.5}));
          }
        }
      }
      // 기반암
      svg.appendChild(svgEl('rect',{x:GX-14,y:GY,width:GW+28,height:46,rx:8,fill:C.rock}));
      // v2 1층: 하구~먼바다 축 (물살 켜짐일 때)
      if(fOn){
        svg.appendChild(svgEl('line',{x1:595,y1:150,x2:595,y2:GY+8,stroke:'#1565C0','stroke-width':2.5,'stroke-dasharray':'8 7','stroke-opacity':0.5}));
        var t1=svgEl('text',{x:GX+NW/2,y:GY+34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':17,'font-weight':800,fill:'#fff'}); t1.textContent='⬅ 하구 (강이 흘러드는 곳)'; svg.appendChild(t1);
        var t2=svgEl('text',{x:FX+FW/2,y:GY+34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':17,'font-weight':800,fill:'#fff'}); t2.textContent='먼바다 ➡'; svg.appendChild(t2);
      }
      // 지층 (하구) — 층 두께 = th, 누적 높이로 배치
      acc=0;
      for(i=0;i<layers.length;i++){
        var L=layers[i], h=hcur[i], y=GY-acc-h;
        var g=svgEl('g',{}); svg.appendChild(g);
        layerShape(g,L,GX,NW,y,h,i);
        // 쌓이는 중 낙하 알갱이
        if(L.prog<1)for(var p2=0;p2<5;p2++){ var px=GX+60+p2*(NW/6)+((i*37)%50), py=130+((frame*5+p2*55)%(y-140>40?y-140:40));
          g.appendChild(svgEl('circle',{cx:px,cy:130+py%((y-130)>0?(y-130):1),r:3.5,fill:TYPES[L.type].fill,stroke:'#888','stroke-width':1})); }
        // 화석 (층 위 경계에 묻힘)
        if(L.fossil&&L.prog>=0.6){
          var fx=GX+NW*0.5+((i%2)?90:-90);
          g.appendChild(svgEl('circle',{cx:fx,cy:y+h*0.52,r:17,fill:'#fff','fill-opacity':0.55,stroke:'#fff','stroke-width':2}));
          var ft=svgEl('text',{x:fx,y:y+h*0.52+8,'text-anchor':'middle','font-size':24,'data-fossil':L.fossil}); ft.textContent=FOSSILS[L.fossil].ic; g.appendChild(ft);
        }
        // 순서 번호 (층 선택 시 전체 표시)
        if(sel>=0&&L.prog>=1){
          var nb=svgEl('text',{x:GX-34,y:y+h-Math.min(10,h*0.3),'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:(i===sel?C.vio:C.sub)});
          nb.textContent=(i+1)+'번째'; svg.appendChild(nb);
        }
        acc+=h;
      }
      // v2 1층: 먼바다 층 (가벼운 알갱이가 멀리 가라앉음)
      if(fOn||farLayers.length){
        var fa=0;
        for(i=0;i<farLayers.length;i++){
          var FL=farLayers[i], fh=LH*FL.th*Math.min(FL.prog,1), fy2=GY-fa-fh;
          var fg=svgEl('g',{'class':'st-farlayer'}); svg.appendChild(fg);
          fg.appendChild(svgEl('rect',{x:FX,y:fy2,width:FW,height:fh,fill:TYPES[FL.type].fill,stroke:'#90785F','stroke-width':2.5}));
          if(FL.prog>=1&&fh>10)texture(fg,FL.type,FX,fy2,FW,fh,i+11);
          fa+=fh;
        }
      }
      // 기다리는 생물 (아직 안 덮임)
      if(pending){
        var pt=svgEl('text',{x:GX+NW*0.5,y:topY-8,'text-anchor':'middle','font-size':30,'data-pending':pending}); pt.textContent=FOSSILS[pending].ic; svg.appendChild(pt);
      }
      // 융기 후 풀·나무·새
      if(up>0.65&&layers.length>0&&foldN===0&&mode!=='whatif'){
        for(var gr=0;gr<7;gr++){ var gx2=GX+30+gr*(NW/7);
          svg.appendChild(svgEl('path',{d:'M '+gx2+' '+topY+' q 4 -16 8 0 M '+(gx2+9)+' '+topY+' q 4 -13 8 0',fill:'none',stroke:'#2F9E44','stroke-width':3,'stroke-linecap':'round','stroke-opacity':(up-0.65)/0.35})); }
        var bd=svgEl('text',{x:240+Math.sin(frame/30)*30,y:90,'font-size':22,opacity:(up-0.65)/0.35}); bd.textContent='🐦'; svg.appendChild(bd);
        var lb2=svgEl('text',{x:GX+NW*0.5,y:topY-34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':23,'font-weight':800,fill:C.good,opacity:(up-0.65)/0.35});
        lb2.textContent='⛰️ 땅 위로 드러난 지층!'; svg.appendChild(lb2);
      }
      // 만약에 침식 — 비바람 연출
      if(mode==='whatif'&&wif.active()&&wif.state.key==='erosion'&&erodeN>0){
        for(var rn=0;rn<6;rn++){ var rx=GX+40+((frame*7+rn*97)%(NW-60)), ry=topY-70+((frame*9+rn*53)%60);
          svg.appendChild(svgEl('line',{x1:rx,y1:ry,x2:rx-8,y2:ry+13,stroke:'#74C0FC','stroke-width':2.5,'stroke-linecap':'round','stroke-opacity':0.7})); }
      }
      // 레이어 클릭 바인딩
      svg.querySelectorAll('.st-layer').forEach(function(g2){
        g2.addEventListener('click',function(){ clickLayer(+g2.getAttribute('data-i')); });
      });
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ frame++;
      var busy=false;
      layers.forEach(function(L){ if(L.prog<1){ L.prog=Math.min(1,L.prog+0.06); busy=true; } });
      farLayers.forEach(function(L){ if(L.prog<1){ L.prog=Math.min(1,L.prog+0.06); busy=true; } });
      if(uplifting){ up=Math.min(1,up+0.018); busy=true;
        if(up>=1){ uplifting=false; renderStatus(); checkMission(); } }
      if((mixArmed||mixSettled)&&mixParticles){
        mixParticles.forEach(function(pt){
          if(mixSettled){ var ty=MIXY[pt.type], g=GRAV[pt.type]*300;
            if(pt.y<ty)pt.y=Math.min(ty,pt.y+g); }
          else pt.y+=Math.sin(frame/12+pt.id)*0.5;
        });
        busy=true;
      }
      if(mode!=='quiz'&&(busy||frame%3===0||flowOn()))renderScene();
      raf=requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.st-status'); if(!s)return;
      var fos=embeddedFossils(), h;
      if(mixArmed&&!mixSettled){
        h='<div class="st-hold" style="font-size:23px;color:#7048E8;">🌀 흙탕물이 가라앉는 중… 뒤죽박죽일까요, 줄무늬일까요?</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">무거운 알갱이와 가벼운 알갱이는 <b>가라앉는 빠르기</b>가 다를까요?</div>';
        s.innerHTML=h; setMixData(); return;
      }
      if(mixSettled){
        h='<div style="font-size:24px;color:'+C.good+';">✨ 저절로 줄무늬! 아래는 굵은 자갈, 위는 고운 진흙</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">한 종류씩 안 쌓았는데도 — 알갱이 크기가 다르면 <b>가라앉는 빠르기</b>가 달라 <b>저절로 층</b>이 나뉘어요.</div>';
        s.innerHTML=h; setMixData(); return;
      }
      if(mode==='quiz'){ h='<div style="font-size:18px;color:'+C.sub+';">지층을 쌓아 본 걸 떠올리며 답을 골라요</div>'; }
      else if(mode==='whatif'&&wif.active()&&wif.state.key==='erosion'){
        h=layers.length===1
          ?'<div style="font-size:24px;color:'+C.good+';">🏜️ 가장 오래된 맨 아래층이 드러났어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">깎여 나간 층 '+erodeN+'개 — 침식이 쌓임의 기록을 펼쳐 보여 줘요. 💡 정리 보기!</div>'
          :'<div style="font-size:24px;color:'+C.vio+';">🌬 비바람이 위층부터 깎아 내요 (깎인 층 '+erodeN+'개)</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">지금 맨 위 = '+layers.length+'번째 층 — 깎을수록 더 옛날 층이 나와요</div>';
      }
      else if(mode==='whatif'&&wif.active()&&wif.state.key==='fold'){
        h=foldN>=3?'<div style="font-size:24px;color:'+C.vio+';">우지끈! 끊어져 어긋났어요 — <b>단층</b></div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">volcano의 지진과 같은 힘 이야기예요. 💡 정리 보기!</div>'
          :foldN>0?'<div style="font-size:24px;color:'+C.vio+';">엿가락처럼 휘어요 — <b>습곡</b> (밀기 '+foldN+'번)</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">더 밀면…?</div>'
          :'<div style="font-size:24px;color:'+C.ink+';">돌처럼 굳은 지층이에요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">↔️ 밀기로 양옆에서 큰 힘을 가해 봐요!</div>';
      }
      else if(mode==='whatif'&&wif.active()&&wif.state.key==='storm'){
        h='<div style="font-size:24px;color:#1565C0;">🌊 물살이 아주 거센 바다예요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">무엇이 가라앉고 무엇이 떠내려갈까요? 자갈·모래·진흙을 부어 봐요! (하구 '+layers.length+'층 · 먼바다 '+farLayers.length+'층)</div>';
      }
      else if(up>=1){
        h='<div style="font-size:24px;color:'+C.good+';">⛰️ 융기 — 물속 지층이 땅 위로 솟아올랐어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'
          +(fos.length?('산에서 '+FOSSILS[fos[0]].nm+' 화석이 — <b>옛날에 이곳이 '+FOSSILS[fos[0]].env+'였다는 증거</b>예요!')
          :'오랜 시간 눌려 굳은 줄무늬가 그대로 보여요. ↺로 새 바다에서 다시!')+'</div>';
      } else if(uplifting){
        h='<div style="font-size:24px;color:'+C.vio+';">땅이 솟아오르는 중… (실제로는 아주아주 오랜 시간!)</div>';
      } else if(pending){
        h='<div style="font-size:24px;color:'+C.vio+';">'+FOSSILS[pending].ic+' '+FOSSILS[pending].nm+'가 바닥에 가라앉았어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">썩기 전에 <b>퇴적물이 빨리 덮어야</b> 화석이 돼요 — 위에 한 층 쌓아 봐요!</div>';
      } else if(layers.length===0&&farLayers.length===0){
        h='<div style="font-size:24px;color:'+C.ink+';">🌊 여기는 바다 밑 — 퇴적물 단추로 차곡차곡 쌓아 봐요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">자갈·모래·진흙이 물에 실려 와 가라앉아요. 생물을 두고 덮으면 화석도!</div>';
      } else if(sel>=0&&layers[sel]){
        var i=sel,extra=(i===0?' — <b>가장 먼저 쌓인, 가장 오래된 층!</b>':(i===layers.length-1?' — <b>가장 나중에 쌓인, 가장 새로운 층!</b>':''));
        h='<div style="font-size:24px;color:'+C.vio+';">'+(i+1)+'번째로 쌓인 '+TYPES[layers[i].type].nm+' 층'+extra+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">아래에 있을수록 먼저 쌓인 층이에요 — 지층의 순서로 옛날을 알 수 있어요.</div>';
      } else if(flowOn()&&mode==='free'){
        h='<div style="font-size:24px;color:'+C.ink+';">하구 '+layers.length+'층 · 먼바다 '+farLayers.length+'층 ('+flowName()+')</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">물살이 거셀수록 <b>무거운 알갱이만 가까이</b> 가라앉아요 — 종류를 바꿔 부어 봐요!</div>';
      } else {
        h='<div style="font-size:24px;color:'+C.ink+';">'+layers.length+'층 지층'+(fos.length?' · 화석 '+fos.length+'개':'')+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">종류가 다른 퇴적물이 차례로 쌓여 <b>줄무늬</b>가 생겨요. 층을 클릭해 순서를 확인해 봐요!</div>';
      }
      s.innerHTML=h;
      /* ── v2 검증 관측점 — jsdom에서 상태를 단언할 수 있게 dataset 기록 ── */
      var stg=el.querySelector('.st-stage');
      if(stg){
        stg.dataset.near=String(layers.length); stg.dataset.far=String(farLayers.length);
        stg.dataset.flow=flow.toFixed(2); stg.dataset.dur=dur.toFixed(2);
        stg.dataset.up=up.toFixed(2); stg.dataset.erode=String(erodeN); stg.dataset.fold=String(foldN);
        stg.dataset.pend=pending?'1':'0'; stg.dataset.fossils=String(embeddedFossils().length);
        stg.dataset.lastth=layers.length?layers[layers.length-1].th.toFixed(1):'0';
        stg.dataset.mixarmed=mixArmed?'1':'0'; stg.dataset.mixsettled=mixSettled?'1':'0';
      }
    }
    function setMixData(){ var stg=el.querySelector('.st-stage');
      if(stg){ stg.dataset.mixarmed=mixArmed?'1':'0'; stg.dataset.mixsettled=mixSettled?'1':'0'; } }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.st-wowbtn').forEach(function(b){ b.addEventListener('click',function(){
        if(b.dataset.wow==='arm')wowArm(); else wowReveal();
      }); });
      el.querySelectorAll('.st-btn').forEach(function(b){ b.addEventListener('click',function(){
        var a=b.dataset.act;
        if(a.indexOf('d-')===0)deposit(a.slice(2));
        else if(a.indexOf('f-')===0)placeFossil(a.slice(2));
        else if(a==='uplift')doUplift();
        else if(a==='erode')erode();
        else if(a==='fold')pushFold();
        else if(a==='reset'){ reset(); build(); }
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
    /* ── v2 변수 행 바인딩 (1층) — 첫 조작 = 🔮 예측 무장 ── */
    function bindV2(){
      var fs=el.querySelector('.st-flow'); if(fs)fs.addEventListener('input',function(){
        flow=+fs.value; clearMix(); predArm('flow');
        var lb=el.querySelector('.st-flowlab'); if(lb)lb.textContent=flowName();
        renderScene(); renderStatus();
      });
      var ds=el.querySelector('.st-dur'); if(ds)ds.addEventListener('input',function(){
        dur=+ds.value; clearMix(); predArm('dur');
        var lb=el.querySelector('.st-durlab'); if(lb)lb.textContent=durName();
        renderStatus();
      });
    }

    if(mode==='quiz')newQuiz();
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
