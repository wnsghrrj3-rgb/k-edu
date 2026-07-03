/* ============================================================================
   케이랩 도구 모듈 — 입자/상태변화 (states) v5  [과학 2호 · 물질변화군 · 탐구 표준 v2]
   3학년 물질의 상태 / 4학년 물의 상태변화. KLab.ui 4모드 + 학년칸(헌법 3장).
   ── 학년 칸 (카드 D칸 닻대로) ──
     저(🌱): 고체·액체·기체 구분 — 쥐어져/흘러/퍼져(일상어, 전환용어·정밀온도 회피).
     중(🌿): 물의 상태 변화·양 보존 — 융해·기화·액화, "사라진 게 아니라 상태만 바뀜".
     고(🌳): 입자 모델·녹는점·끓는점 (기존 v3 유지).
   ※ 압력·잠열 마법모먼트 + 만약에 모드 = 탐구 표준 v2 4층으로 이행 완료 (v5):
     1층 변수 개방 — 🎚 압력 슬라이더(고 — 끓는점이 압력의 함수: 0.3기압=70℃·2기압=120℃,
       온도계 끓는점 마커 실시간 이동) + 물질 선택 3종(중·고 — 💧물 0/100 · 🍫초콜릿 36/—
       · 🔩철 1538/— = 녹는점이 물질마다 다름).
     2층 만약에 — ⛰️ 산 위 끓이기(70℃ 비등, 원본 G칸 예측빗나감) · 🌡️ 잠열(끓는점에서
       온도계 정지+입자만 흩어짐, 원본 F칸 마법모먼트) · 🌌 우주 진공(조작 없이 상온 비등).
       중=🌌만, 고=3종.
     3층 예측 노트 — 압력·물질 첫 조작 = 🔮 무장 → 해소·칩·5칩 토스트.
       기존 질량 보존 와우(예측 빗나감형 11호)는 3층 특수 사례로 그대로 보존.
     4층 — 3D 미전환·SVG 유지(입자 2D 무대가 원리 그 자체). 신규 자산 0.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 상태 전환 시각화 — 녹는점 부근(녹는·어는 중)·끓는점 부근(끓는·식는 중)에서
        입자가 한꺼번에 안 바뀌고 비율로 섞이며 전환. 끓을 땐 기포처럼 떠오름.
     ▸ 전환 용어 — 데우는 중이면 융해·기화, 식히는 중이면 응고·액화로 표시.
     ▸ 탐구 미션 3종 — 🧊 얼음·💧 물·☁️ 수증기 만들기. 달성하면 ✓.
   변수 → 현상 → 발견:
     온도 슬라이더(가열🔥/냉각❄️) → 입자 운동·배열 → "상태는 눈에 안 보이는
     입자의 배열·운동 차이" (물 기준 0℃·100℃ 경계).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 미션 = 고체→융해→기체→액화 한 사이클.
     퀴즈 = 움직이는 입자 장면을 보고 상태·전환 용어 답하기 (장면이 곧 문제).
   - config: { temp(기본25), count(기본28), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('states', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var temp=(config.temp!=null)?config.temp:25, N=config.count||28;
    var lastDir=1;                 // +1 데우는 중 / -1 식히는 중 (전환 용어용)
    var BX=250, BY=95, BW=470, BH=300;           // 비커 내부 영역
    var raf=null, t0=Date.now();
    var C={ink:'#1B3A57',sub:'#5a7894',good:'#12B886',cold:'#1971C2',hot:'#E8590C'};
    var btn='font-size:23px;padding:12px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function clamp(v,a,b){return Math.max(a,Math.min(v,b));}
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n); }
    /* ── 입자 비주얼: 실사 분자 스프라이트(입체 구슬) ── 헌법 6장: 로직 불변, 연출만 교체.
       이미지 로드 성공 시 입자를 <circle>→<image>로 승급. 실패하면 기존 SVG 그라디언트 원으로 폴백(안 깨짐). */
    var MOL_SPRITE='/kedu/teacher/engine/tools/assets/states/molecule.png';
    var useSprite=false, _molImg=new Image();
    _molImg.onload=function(){ useSprite=true; if(stage&&partsLayer)drawStage(); };
    _molImg.onerror=function(){ useSprite=false; };
    _molImg.src=MOL_SPRITE;
    /* ── 와우(F칸) 질량 보존 — 예측 빗나감형 11호 ──
       「상태가 바뀌면(끓으면/녹으면) 무게가 변한다/사라진다」 오개념을 정면 반증.
       밀폐 통 + 저울: 얼음을 데워 물·수증기로 다 바꿔도 입자 개수가 그대로라 무게도 그대로.
       중·고·free 전용(저학년은 양 보존 개념 과함 → 숨김). 2단 예측→확인. */
    var MASS_G=200;            // 밀폐 통 전체 무게(입자 개수에 비례 → 상태 변화와 무관하게 일정)
    var massArmed=false;       // 와우 예측 무장
    var rampTimer=null;        // 드러냄 가열 연출 타이머
    function wowWeight(){ return MASS_G; }   // temp와 무관하게 항상 같은 값 = 질량 보존의 핵심

    /* ── v2 1층 변수 — 물질·압력. 기본값(물·1기압) = 기존 라이브와 동일 거동 ── */
    var SUBST={ water:{nm:'물',ic:'💧',mp:0,bp:100}, choc:{nm:'초콜릿',ic:'🍫',mp:36,bp:999}, iron:{nm:'철',ic:'🔩',mp:1538,bp:9999} };
    var subst='water', prs=1;
    var latentOn=false, latent=0;          // 만약에 🌡️ 잠열: 끓는점에서 온도 정지 카운터(0~5)
    function v2reset(){ subst='water'; prs=1; latentOn=false; latent=0; }
    function mpOf(){ return SUBST[subst].mp; }
    function bpOf(){                        // 끓는점 = 압력의 함수 (물만 — 0.3기압 70℃ · 1기압 100℃ · 2기압 120℃ · 진공 23℃)
      var b=SUBST[subst].bp; if(subst!=='water')return b;
      if(prs>=1)return 100+(prs-1)*20;
      if(prs>=0.3)return 70+(prs-0.3)/0.7*30;
      return 70-(0.3-prs)*188;
    }
    // ── 물리: 온도 → 자유도(고체→액체)·기화비율(액체→기체)·속도 — 녹는점·끓는점 일반화(v2)
    function liqFrac(t){ var m=mpOf(); if(t<=m-3)return 0; if(t>=m+3)return 1; return (t-m+3)/6; }
    function gasFrac(t){
      if(latentOn&&t>=bpOf()-3)return clamp(latent/5,0,1);   // 잠열: 열이 결합 풀기에 쓰이는 비율
      var b=bpOf(); if(b>150)return 0;                        // 초콜릿·철 = 이 온도계 범위에서 안 끓음
      if(t<=b-3)return 0; if(t>=b+3)return 1; return (t-b+3)/6;
    }
    function speed(t){return 0.22+(clamp(t,-20,120)+20)/140*3.3;}
    function phase(t){ var m=mpOf(), b=bpOf();
      if(t<m-3)return 'solid'; if(t<m+3)return 'melt';
      if(b>150)return 'liquid';                               // 끓는점이 범위 밖 = 액체까지만
      if(t<b-3)return 'liquid'; if(t<b+3)return 'boil'; return 'gas'; }

    // 입자 초기화 (격자 평형 위치 + 전환 임계값)
    var cols=7, rows=Math.ceil(N/cols), gx=BW/(cols+1), gy=Math.min(40,BH/(rows+1)), ps=[];
    for(var i=0;i<N;i++){var c=i%cols, r=Math.floor(i/cols);
      var ex=BX+gx*(c+1), ey=BY+BH-gy*(r+1)-10;
      ps.push({eqx:ex,eqy:ey,x:ex,y:ey,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,
               ph:Math.random()*6.28, thr:Math.random(), thrG:Math.random(), el:null});}

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'🧊 <b style="color:#7048E8;">0℃보다 낮게</b> 식혀서 얼음(고체)을 만들어 봐요!',
        check:function(p){ return p==='solid'; } },
      { text:'💧 다시 데워서 <b style="color:#7048E8;">물(액체)</b>로 만들어 봐요 — 녹는 것이 융해!',
        check:function(p){ return p==='liquid' && lastDir>=0; } },
      { text:'☁️ <b style="color:#7048E8;">100℃ 넘게</b> 끓여서 수증기(기체)를 만들어 봐요!',
        check:function(p){ return p==='gas'; } },
      { text:'❄️ 살살 식혀서 <b style="color:#7048E8;">100℃ 부근 \'액화(식는 중)\'</b> 순간을 잡아 봐요!',
        check:function(p){ return p==='boil' && lastDir<0; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=3가지 상태 구분(쥐어져/흘러/퍼져, 일상어) / 중=물의 상태 변화·양 보존 / 고=입자 모델·녹는점·끓는점(기존 유지).
       ※ 압력·잠열 마법모먼트 + 만약에 모드는 후속 분리(물리군 방침). */
    var LOW_MISSIONS=[
      { text:'❄️ <b style="color:#7048E8;">식혀서</b> 꽁꽁 언 <b style="color:#7048E8;">얼음(고체)</b>을 만들어 봐요 — 단단해서 쥐어져요!',
        check:function(p){ return p==='solid'; } },
      { text:'🔥 <b style="color:#7048E8;">데워서</b> <b style="color:#7048E8;">물(액체)</b>로 만들어 봐요 — 줄줄 흘러요!',
        check:function(p){ return p==='liquid'; } },
      { text:'🔥 더 뜨겁게 <b style="color:#7048E8;">끓여서</b> <b style="color:#7048E8;">수증기(기체)</b>를 만들어 봐요 — 사방으로 퍼져요!',
        check:function(p){ return p==='gas'; } }
    ];
    var MID_MISSIONS=[
      { text:'🧊 <b style="color:#7048E8;">0℃보다 낮게</b> 식혀 얼음(고체)을 만들어요. 물이 사라진 게 아니라 <b style="color:#7048E8;">상태만</b> 바뀐 거예요!',
        check:function(p){ return p==='solid'; } },
      { text:'💧 데워서 <b style="color:#7048E8;">물(액체)</b>로 — 얼음이 녹는 변화 = <b style="color:#7048E8;">융해</b>!',
        check:function(p){ return p==='liquid' && lastDir>=0; } },
      { text:'☁️ <b style="color:#7048E8;">100℃ 넘게</b> 끓여 수증기(기체)로 — 물이 사라진 게 아니라 <b style="color:#7048E8;">눈에 안 보이는 입자</b>로 흩어진 거예요!',
        check:function(p){ return p==='gas'; } },
      { text:'❄️ 살살 식혀 <b style="color:#7048E8;">100℃ 부근 \'액화\'</b> 순간을 잡아 봐요 — 수증기가 다시 물로!',
        check:function(p){ return p==='boil' && lastDir<0; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],                 missions:LOW_MISSIONS, showWow:false, v2:null,                     wif:[] },
      mid:  { modes:['free','mission','quiz','whatif'], missions:MID_MISSIONS, showWow:true,  v2:{sub:true},               wif:['vacuum'] },
      high: { modes:['free','mission','quiz','whatif'], missions:MISSIONS,     showWow:true,  v2:{sub:true,prs:true},      wif:['mountain','latent','vacuum'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return GRADES[grade].missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; lastDir=1; temp=25; massArmed=false; v2reset();
      if(wif)wif.reset(); makeWif(); buildUI();
    }});

    /* ───────────── 🌀 만약에 (v2 2층 — 원본 F/G칸 마법모먼트·압력 만약에 이행) ───────────── */
    var WHATIF={
      mountain:{ icon:'⛰️', title:'아주 높은 산 위에서 끓인다면?',
        q:'공기가 희박한 높은 산 위 — 물은 몇 도에서 끓을까요?',
        ch:['100℃보다 더 뜨거워야 끓어요','100℃가 안 돼도 벌써 끓어요','산 위에선 안 끓어요'], a:1,
        reveal:'공기가 적으면 물을 누르는 힘(압력)이 약해져 입자가 쉽게 탈출해요 — 70℃ 부근에서 벌써 부글부글! 그래서 높은 산에서 라면을 끓이면 설익어요.',
        tip:'🔥 데워 봐요 — 온도계가 100℃가 되기 전에…!' },
      latent:{ icon:'🌡️', title:'끓는데 계속계속 가열한다면?',
        q:'펄펄 끓는 물을 계속 가열하면 온도는 어떻게 될까요?',
        ch:['온도가 끝없이 올라가요','끓는 동안 온도가 멈춰 있어요','오히려 내려가요'], a:1,
        reveal:'끓는점에선 들어온 열이 온도를 올리는 대신 입자 사이 결합을 푸는 데 다 쓰여요! 그래서 온도계는 딱 멈춘 채 입자만 와르르 날아가요 — 물이 다 날아가야 온도가 다시 올라요.',
        tip:'🔥 데우기를 계속 눌러 봐요 — 온도계를 잘 보면서!' },
      vacuum:{ icon:'🌌', title:'우주(진공)에 물을 둔다면?',
        q:'공기가 하나도 없는 우주에 물을 두면 어떻게 될까요?',
        ch:['꽁꽁 얼기만 해요','차가운데도 부글부글 끓어 버려요','아무 일도 없어요'], a:1,
        reveal:'진공에선 누르는 압력이 거의 0이라 미지근한 물도 저절로 끓어 버려요! 끓음은 온도만의 이야기가 아니라 압력의 이야기이기도 해요. (실제 우주에선 끓으면서 얼기도 한답니다!)',
        tip:'슬라이더를 안 건드렸는데… 벌써 부글부글?!' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ buildUI(); },
        footEl:function(){ return el.querySelector('.st-foot'); },
        onSelect:function(k){ v2reset(); temp=25; lastDir=1; massArmed=false; },
        onPlay:function(k){
          if(k==='mountain'){ subst='water'; prs=0.3; latentOn=false; latent=0; temp=25; lastDir=1; }
          else if(k==='latent'){ subst='water'; prs=1; latentOn=true; latent=0; temp=90; lastDir=1; }
          else { subst='water'; prs=0.05; latentOn=false; latent=0; temp=25; lastDir=1; }
        },
        onExit:function(){ v2reset(); temp=25; lastDir=1; }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 압력·물질 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ prs:{asked:false,ch:-1,done:false}, sub:{asked:false,ch:-1,done:false} };
    var PRED={
      prs:{ q:'🔮 예측 먼저! 압력을 낮추면 끓는점은 어떻게 될까요?',
        ch:['더 뜨거워야 끓는다','더 낮은 온도에서 끓는다','끓는점은 변하지 않는다'],
        tip:'압력을 ⛰ 끝까지 낮추고 🔥 데워 봐요 — 온도계 마커를 보면서!' },
      sub:{ q:'🔮 예측 먼저! 물질이 다르면 녹는점은 어떨까요?',
        ch:['모든 물질은 0℃에서 녹는다','물질마다 녹는점이 다르다','고체는 아무리 데워도 안 녹는다'],
        tip:'🍫 초콜릿을 데워 보고, 🔩 철도 끝까지 데워 봐요!' }
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
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='prs') msg=hit?'✔ 예측 적중 — 압력이 낮으면 더 낮은 온도에서 끓어요! 누르는 힘이 약하면 입자가 쉽게 탈출하거든요.'
                              :'✘ 예측 빗나감 — 압력을 낮추면 더 낮은 온도에서 끓어요! 산 위 라면이 설익는 까닭이에요.';
      else msg=hit?'✔ 예측 적중 — 물질마다 녹는점이 달라요! 초콜릿은 36℃(손에서 녹는 이유), 철은 무려 1538℃예요.'
                  :'✘ 예측 빗나감 — 물질마다 녹는점이 달라요! 초콜릿 36℃, 철은 1538℃ — 0℃는 물의 녹는점일 뿐이에요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.st-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      var p=phase(temp);
      if(pred.prs.ch>=0&&!pred.prs.done&&prs<=0.5&&(p==='boil'||p==='gas'))predResolve('prs');
      if(pred.sub.ch>=0&&!pred.sub.done){
        if(subst==='choc'&&(p==='melt'||p==='liquid'))predResolve('sub');
        else if(subst==='iron'&&temp>=115)predResolve('sub');
      }
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={mountain:'⛰️ 산위끓음',latent:'🌡️ 온도멈춤',vacuum:'🌌 우주비등',prs:'🎚 압력실험',sub:'🍫 물질실험'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🧪 꼬마 물질학자 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.st-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="st-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }

    var mStep=0,mDone=false,mLock=false;
    function checkMission(p){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check(p)){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1)mStep++; else mDone=true;
          var bar=el.querySelector('.kl-mission'); if(bar&&!mDone){ var t=bar.querySelector('.kl-mission-text'); if(t)t.innerHTML=M[mStep].text; var n=bar.querySelector('span'); if(n)n.textContent='미션 '+(mStep+1)+'/'+M.length; }
          if(mDone)buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (입자 장면이 곧 문제) ───────────── */
    var QUIZ=[
      { temp:-15, q:'입자가 제자리에서 진동만 하는 지금 상태는?', ch:['고체','액체','기체'], a:0 },
      { temp:50,  q:'입자가 붙은 채 미끄러지듯 움직이는 지금 상태는?', ch:['액체','고체','기체'], a:0 },
      { temp:115, q:'입자가 멀리 흩어져 날아다니는 지금 상태는?', ch:['기체','액체','고체'], a:0 },
      { temp:0,   q:'얼음이 녹아 물이 되는 변화를 무엇이라 할까요?', ch:['융해','응고','기화'], a:0 },
      { temp:100, q:'물이 끓어 수증기가 되는 변화는?', ch:['기화','액화','응고'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      lastDir=1; temp=QUIZ[qIdx].temp;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var ctrl='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
          +'<button class="st-btn" data-act="cool" style="'+btn+'background:#fff;color:'+C.cold+';border-color:'+C.cold+';">❄️ 식히기</button>'
          +'<input class="st-range" type="range" min="-20" max="120" value="'+temp+'" style="width:min(44vw,300px);">'
          +'<button class="st-btn" data-act="heat" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 데우기</button>'
        +'</div>';
      /* ── v2 변수 행 (1층 — 자유탐구 전용, 학년 게이팅: 중=물질 / 고=물질+압력) ── */
      var v2row='';
      if(mode==='free'&&G().v2){
        var g2=G().v2, sl='font-size:15px;font-weight:800;color:#5a7894;font-family:inherit;';
        v2row='<div class="st-v2" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +(g2.sub?Object.keys(SUBST).map(function(k){ var on=(subst===k);
              return '<button class="st-sub" data-s="'+k+'" style="font-size:17px;padding:9px 13px;border-radius:12px;border:2.5px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
                +(on?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+SUBST[k].ic+' '+SUBST[k].nm+'</button>'; }).join(''):'')
          +(g2.prs?('<span style="'+sl+'margin-left:8px;">⛰ 낮게</span>'
            +'<input class="st-prs" type="range" min="0.3" max="2" step="0.01" value="'+prs+'" style="width:130px;">'
            +'<span style="'+sl+'">🫙 높게</span>'
            +'<span class="st-prslab" style="font-size:15px;font-weight:800;color:#7048E8;min-width:150px;font-family:inherit;">'+prs.toFixed(1)+'기압 · 끓는점 '+Math.round(bpOf())+'℃</span>'):'')
          +'</div>';
      }
      var wowRow='';
      if(mode==='free' && GRADES[grade].showWow){
        wowRow='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="st-wow" data-wow="arm" style="'+btn+'background:#fff;color:#7048E8;border-color:#7048E8;">🔮 녹으면·끓으면 무게는?</button>'
          +'<button class="st-wow" data-wow="reveal" style="'+btn+'background:#7048E8;color:#fff;border-color:#7048E8;">🔥 끝까지 데우기</button>'
          +'</div>';
      }
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); ctrl=''; foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); if(!wif.active())ctrl=''; }
      /* ── v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.st-btn:active,.st-wow:active,.st-sub:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 22px !important;}'
        +'@keyframes stHold{0%,100%{opacity:1;}50%{opacity:0.45;}}'
        +'.st-hold{animation:stHold 1.1s ease-in-out infinite;}'
        +'.st-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#4DABF7,#FFD43B,#FF6B6B);outline:none;}'
        +'.st-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.st-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'</style>'
        + top + bar + v2row + ctrl + wowRow
        +'<div class="kl-stage-host" style="position:relative;"><div class="st-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="st-foot">'+foot+'</div>'
        +'<div class="st-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="st-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; lastDir=1; temp=25; massArmed=false; v2reset();
        if(rampTimer){clearTimeout(rampTimer);rampTimer=null;}
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      drawStage(); bind(); bindV2(); bands.bind(el); renderChips(); renderStatus(); if(!raf)loop();
      if(mode==='whatif')wif.bind(el);
    }

    var stage, mercuryEl, partsLayer, bubbleLayer;
    function drawStage(){
      stage=el.querySelector('.st-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML=
         '<radialGradient id="stSol" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1864AB"/></radialGradient>'
        +'<radialGradient id="stLiq" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1C7ED6"/></radialGradient>'
        +'<radialGradient id="stGas" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#E9ECEF"/><stop offset="100%" stop-color="#ADB5BD"/></radialGradient>';
      svg.appendChild(d);
      // 온도계 — v2: 녹는점·끓는점 마커가 물질·압력 따라 이동 (보이지 않는 변수를 눈으로)
      var TX=140, TT=70, TB=380;
      svg.appendChild(svgEl('rect',{x:TX-13,y:TT,width:26,height:TB-TT,rx:13,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:24,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      mercuryEl=svgEl('rect',{x:TX-7,y:TT,width:14,height:0,rx:7,fill:'#FA5252'}); svg.appendChild(mercuryEl);
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:15,fill:'#FA5252'}));
      var marks=[], mpv=mpOf(), bpv=Math.round(bpOf());
      if(mpv>=-20&&mpv<=120)marks.push([mpv,mpv+'℃ '+(subst==='water'?'어는점':'녹는점'),'#1971C2','st-mark-mp']);
      if(bpv>=-20&&bpv<=120)marks.push([bpv,bpv+'℃ 끓는점','#E8590C','st-mark-bp']);
      marks.forEach(function(m){var yy=TB-((m[0]+20)/140)*(TB-TT);
        svg.appendChild(svgEl('line',{x1:TX-16,y1:yy,x2:TX+30,y2:yy,stroke:m[2],'stroke-width':2.5,'stroke-dasharray':'5 4','class':m[3]}));
        var tx=svgEl('text',{x:TX+34,y:yy+6,'font-family':'Jua,sans-serif','font-size':16,fill:m[2],'font-weight':800,'class':m[3]});tx.textContent=m[1];svg.appendChild(tx);});
      if(mpv>120){ var im=svgEl('text',{x:TX+34,y:TT+16,'font-family':'Jua,sans-serif','font-size':15,fill:'#868E96','font-weight':800,'class':'st-mark-out'}); im.textContent='녹는점 '+mpv+'℃ — 저 위에!'; svg.appendChild(im); }
      mercuryEl._tt=TT; mercuryEl._tb=TB;
      // 비커
      svg.appendChild(svgEl('path',{d:'M '+(BX-14)+' '+(BY-8)+' L '+(BX-14)+' '+(BY+BH+16)+' Q '+(BX-14)+' '+(BY+BH+30)+' '+BX+' '+(BY+BH+30)+' L '+(BX+BW)+' '+(BY+BH+30)+' Q '+(BX+BW+14)+' '+(BY+BH+30)+' '+(BX+BW+14)+' '+(BY+BH+16)+' L '+(BX+BW+14)+' '+(BY-8),fill:'rgba(214,234,248,0.4)',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      bubbleLayer=svgEl('g',{}); svg.appendChild(bubbleLayer);
      partsLayer=svgEl('g',{}); svg.appendChild(partsLayer);
      ps.forEach(function(p){
        if(useSprite){
          p.isImg=true;
          p.el=svgEl('image',{x:(p.x-13).toFixed(1),y:(p.y-13).toFixed(1),width:26,height:26});
          p.el.setAttributeNS('http://www.w3.org/1999/xlink','href',MOL_SPRITE);
          p.el.setAttribute('href',MOL_SPRITE);
        } else {
          p.isImg=false;
          p.el=svgEl('circle',{cx:p.x,cy:p.y,r:12,fill:'url(#stLiq)',stroke:'#1864AB','stroke-width':1.5});
        }
        partsLayer.appendChild(p.el);
      });
      if(massArmed){
        // 밀폐 뚜껑 — 닫힌 통(수증기가 빠져나가지 못함 → 무게 보존이 성립)
        svg.appendChild(svgEl('rect',{x:BX-22,y:BY-30,width:BW+44,height:22,rx:10,fill:'#CED4DA',stroke:'#868E96','stroke-width':3}));
        var lt=svgEl('text',{x:BX+BW/2,y:BY-13,'font-family':'Jua,sans-serif','font-size':15,fill:'#495057','font-weight':800,'text-anchor':'middle'}); lt.textContent='🔒 뚜껑 닫음'; svg.appendChild(lt);
        // 저울 — 통 전체 무게(상태가 바뀌어도 입자 개수가 그대로라 그대로)
        var sg=svgEl('g',{'class':'st-scale'});
        sg.appendChild(svgEl('rect',{x:702,y:78,width:178,height:80,rx:15,fill:'#fff',stroke:'#7048E8','stroke-width':3}));
        var s1=svgEl('text',{x:791,y:106,'font-family':'Jua,sans-serif','font-size':16,fill:'#7048E8','font-weight':800,'text-anchor':'middle'}); s1.textContent='⚖️ 통 전체 무게'; sg.appendChild(s1);
        var s2=svgEl('text',{x:791,y:144,'font-family':'Jua,sans-serif','font-size':32,fill:'#1B3A57','font-weight':800,'text-anchor':'middle','class':'st-weight'}); s2.textContent=wowWeight()+' g'; sg.appendChild(s2);
        svg.appendChild(sg);
      }
      stage.appendChild(svg);
    }

    function loop(){ update(); raf=requestAnimationFrame(loop); }
    function update(){
      var lf=liqFrac(temp), gf=gasFrac(temp), sp=speed(temp), now=(Date.now()-t0)/300;
      var amp=2.0+Math.max(0,(temp+20))/140*2.0;     // 격자 진동 폭(온도↑ 조금 커짐)
      for(var i=0;i<ps.length;i++){var p=ps[i];
        var free=(lf>p.thr), gas=(gf>p.thrG);
        if(!free){ // 고체 — 격자 진동
          p.x=p.eqx+Math.sin(now+p.ph)*amp; p.y=p.eqy+Math.cos(now*1.1+p.ph)*amp;
          p.vx=(Math.random()-0.5)*2; p.vy=(Math.random()-0.5)*2;
        } else {   // 액체/기체 — 자유 운동
          p.x+=p.vx*sp; p.y+=p.vy*sp;
          var top=gas?(BY+6):(BY+BH*0.34);
          if(p.x<BX+12){p.x=BX+12;p.vx=Math.abs(p.vx);} if(p.x>BX+BW-12){p.x=BX+BW-12;p.vx=-Math.abs(p.vx);}
          if(p.y<top){p.y=top;p.vy=Math.abs(p.vy);} if(p.y>BY+BH-12){p.y=BY+BH-12;p.vy=-Math.abs(p.vy);}
          if(gas){ p.vy-=0.05; if(p.vy<-2.6)p.vy=-2.6; }   // 기체 부력(위로)
          else { p.vy+=0.045; }                            // 액체 약한 중력(아래 고임)
        }
        if(p.el){
          if(p.isImg){ p.el.setAttribute('x',(p.x-13).toFixed(1)); p.el.setAttribute('y',(p.y-13).toFixed(1)); }
          else { p.el.setAttribute('cx',p.x.toFixed(1)); p.el.setAttribute('cy',p.y.toFixed(1));
            p.el.setAttribute('fill', gas?'url(#stGas)':(free?'url(#stLiq)':'url(#stSol)')); }
        }
      }
      // 끓는 중 기포 (바닥에서 솟는 작은 거품)
      if(bubbleLayer){ bubbleLayer.innerHTML='';
        if(phase(temp)==='boil'||phase(temp)==='gas'){
          var nb=phase(temp)==='gas'?5:3;
          for(var b=0;b<nb;b++){var tt=((now*0.6+b*1.7)%1);
            var bx=BX+60+((b*137)%(BW-120)), by=BY+BH-10-tt*(BH-40), rr=4+tt*5;
            bubbleLayer.appendChild(svgEl('circle',{cx:bx,cy:by,r:rr,fill:'none',stroke:'#A5D8FF','stroke-width':2,'stroke-opacity':(1-tt)*0.8}));}
        }
      }
      if(mercuryEl){var f=(clamp(temp,-20,120)+20)/140, h=(mercuryEl._tb-mercuryEl._tt)*f;
        mercuryEl.setAttribute('y',(mercuryEl._tb-h).toFixed(1)); mercuryEl.setAttribute('height',h.toFixed(1));}
    }

    function renderStatus(){
      var p=phase(temp), s=el.querySelector('.st-status'), nm,col,sub;
      function fin(html){
        if(s)s.innerHTML=html;
        /* ── v2 검증 관측점 — jsdom에서 물리 상태를 단언할 수 있게 dataset 기록 ── */
        var stg=el.querySelector('.st-stage');
        if(stg){
          stg.dataset.temp=String(temp); stg.dataset.phase=p;
          stg.dataset.prs=prs.toFixed(2); stg.dataset.sub=subst;
          stg.dataset.bp=String(Math.round(bpOf())); stg.dataset.mp=String(mpOf());
          stg.dataset.latent=String(latent);
        }
      }
      if(mode==='quiz'){ fin('<div style="font-size:19px;color:'+C.sub+';">움직이는 입자를 잘 보고 답을 골라요!</div>'); return; }
      if(grade==='low'){
        if(p==='solid'){nm='고체 (얼음)';col=C.cold;sub='꽁꽁 얼어서 단단해요 — 손으로 쥘 수 있고 모양이 변하지 않아요.';}
        else if(p==='melt'){nm='고체에서 액체로';col=C.cold;sub='얼음이 녹아 물이 되는 중이에요.';}
        else if(p==='liquid'){nm='액체 (물)';col='#1C7ED6';sub='줄줄 흘러요 — 담는 그릇 모양대로 바뀌어요.';}
        else if(p==='boil'){nm='액체에서 기체로';col=C.hot;sub='물이 끓어서 수증기가 되는 중이에요.';}
        else{nm='기체 (수증기)';col='#868E96';sub='사방으로 퍼져 날아다녀요 — 공간을 가득 채워요.';}
        fin('<div style="font-size:29px;color:'+col+';">'+nm+'</div>'
          +'<div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>');
        checkMission(p); return;
      }
      var SN=SUBST[subst].nm, bpR=Math.round(bpOf()), mpR=mpOf();
      if(p==='solid'){nm='고체 ('+(subst==='water'?'얼음':SN)+')';col=C.cold;
        sub=(subst==='iron'&&temp>=115)?'120℃ 최대로 데워도 꿈쩍 안 해요! 철의 녹는점은 무려 1538℃ — 물질마다 녹는점이 달라요.'
           :'입자가 제자리에서 규칙적으로 정렬해 진동만 해요. 모양도 부피도 일정해요.'+(subst!=='water'?' ('+SN+'의 녹는점 = '+mpR+'℃)':'');}
      else if(p==='melt'){
        if(lastDir>=0){nm='융해 — 녹는 중';sub=mpR+'℃ 부근에서 '+(subst==='water'?'얼음':SN)+'(고체) 입자가 하나둘 풀려나 액체가 돼요. 고체와 액체가 섞여 있어요.'+(subst==='choc'?' 초콜릿이 손에서 녹는 이유예요!':'');}
        else{nm='응고 — 어는 중';sub=mpR+'℃ 부근에서 액체 입자가 하나둘 제자리를 잡아 고체가 돼요.';}
        col=C.cold;
      }
      else if(p==='liquid'){nm='액체 ('+(subst==='water'?'물':'녹은 '+SN)+')';col='#1C7ED6';
        sub='입자가 서로 붙어 있지만 자유롭게 미끄러져요. 부피는 그대로, 모양은 그릇에 따라 변해요.'
          +(subst==='water'&&prs!==1?' (지금 압력 '+prs.toFixed(1)+'기압 — 끓는점 '+bpR+'℃!)':'')
          +(SUBST[subst].bp>150?' ('+SN+'은 이 온도계 범위에선 안 끓어요)':'');}
      else if(p==='boil'){
        if(latentOn&&latent<5&&lastDir>=0){nm='기화 — 끓는 중 (온도계가 멈췄어요!)';sub='들어온 열이 온도를 올리는 대신 입자 결합을 푸는 중이에요… (증발 '+(latent*20)+'%) 계속 데워 봐요!';}
        else if(lastDir>=0){nm='기화 — 끓는 중';sub=bpR+'℃ 부근에서 물(액체) 입자가 빠르게 튀어 올라 수증기(기체)가 돼요. 거품이 올라와요.'+(prs<0.9?' 압력이 낮아 '+bpR+'℃에서 벌써 끓어요!':'');}
        else{nm='액화 — 식는 중';sub=bpR+'℃ 부근에서 수증기(기체) 입자가 다시 모여 물(액체)이 돼요.';}
        col=C.hot;
      }
      else{nm='기체 (수증기)';col='#868E96';sub='입자가 멀리 흩어져 빠르게 날아다녀요. 공간을 가득 채워요.'+(prs<0.9?' 낮은 압력에선 이렇게 쉽게 기체가 돼요!':'');}
      var html='<div style="font-size:29px;color:'+col+';">'+temp+'℃ — '+nm+'</div>'
        +'<div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>';
      if(massArmed && mode==='free') html+='<div class="st-hold" style="font-size:18px;color:#7048E8;margin-top:8px;font-weight:800;">상태가 바뀌어도 입자 개수는 그대로 — 무게도 그대로예요.</div>';
      fin(html);
      checkMission(p);
    }

    /* ── 와우 배너/연출 헬퍼 ── */
    function host(){ return el.querySelector('.kl-stage-host'); }
    function clearStFlash(){ var h=host(); if(!h)return;
      ['.st-flash','.st-flash-magic','.st-nudge'].forEach(function(sel){ var n=h.querySelector(sel); if(n&&n.parentNode)n.parentNode.removeChild(n); }); }
    function stFlash(cls,html,ms){ var h=host(); if(!h)return; clearStFlash();
      var bg=cls==='st-flash-magic'?'#F3F0FF':(cls==='st-nudge'?'#FFF4E6':'#E7F5FF');
      var bd=cls==='st-flash-magic'?'#7048E8':(cls==='st-nudge'?'#FF8A3D':'#1565C0');
      var fg=cls==='st-flash-magic'?'#5f3dc4':(cls==='st-nudge'?'#E8590C':'#1565C0');
      var d=document.createElement('div'); d.className=cls;
      d.style.cssText='position:absolute;left:50%;top:12px;transform:translateX(-50%);max-width:90%;'
        +'background:'+bg+';border:3px solid '+bd+';color:'+fg+';border-radius:16px;padding:11px 18px;'
        +'font-family:inherit;font-weight:800;font-size:18px;line-height:1.4;text-align:center;z-index:6;'
        +'box-shadow:0 6px 18px rgba(0,0,0,0.12);';
      d.innerHTML=html; h.appendChild(d);
      setTimeout(function(){ if(d.parentNode)d.parentNode.removeChild(d); }, ms||2800); }

    function wowArm(){
      massArmed=true;
      if(rampTimer){clearTimeout(rampTimer);rampTimer=null;}
      drawStage();                 // 뚜껑+저울 표시
      setTemp(-15);                // 얼음(고체) 셋업 — renderStatus가 .st-hold 추가
      snd('charge');
      stFlash('st-flash','지금은 꽁꽁 언 <b>얼음(고체)</b>이에요. 데워서 물로, 수증기로 다 바꾸면 무게가 <b>늘까요? 줄까요? 그대로일까요?</b> 예상해 봐요.',2600);
    }
    function wowReveal(){
      if(!massArmed){ snd('select'); stFlash('st-nudge','먼저 🔮 버튼으로 무게가 어떻게 될지 <b>예상부터</b> 해 봐요.',2600); return; }
      snd('whoosh'); snd('success');
      // 얼음 → 물 → 수증기까지 가열 연출 (저울 무게는 내내 그대로)
      if(rampTimer){clearTimeout(rampTimer);rampTimer=null;}
      setTemp(-15);
      var seq=[5,40,75,100,115], k=0;
      (function tick(){ if(k<seq.length){ setTemp(seq[k]); k++; rampTimer=setTimeout(tick,260); } else rampTimer=null; })();
      stFlash('st-flash-magic','고체→액체→기체로 다 바뀌었는데 무게는 <b>'+wowWeight()+' g 그대로!</b> 입자 개수가 변하지 않아서 — 뚜껑 닫은 통에선 <b>상태가 바뀌어도 무게는 그대로</b>예요.',3000);
    }

    function setTemp(v){ var prev=temp; v=clamp(Math.round(v),-20,120);
      /* v2 만약에 🌡️ 잠열 — 끓는점에서 온도계가 딱 멈추고 열은 결합 풀기에 쓰임(5눈금) */
      if(latentOn&&latent<5){
        var b=Math.round(bpOf());
        if(v>b){ if(prev>=b){ latent++; snd('bubble'); } v=b; }
      }
      temp=v;
      if(temp>prev)lastDir=1; else if(temp<prev)lastDir=-1;
      var r=el.querySelector('.st-range'); if(r&&+r.value!==temp)r.value=temp;
      renderStatus(); checkPred(); checkMission(phase(temp)); }

    /* ── v2 변수 행 바인딩 (1층) — 첫 조작 = 🔮 예측 무장, 마커 즉시 갱신 ── */
    function bindV2(){
      el.querySelectorAll('.st-sub').forEach(function(b){
        b.addEventListener('click',function(){
          if(subst===b.dataset.s)return;
          subst=b.dataset.s; snd('select');
          buildUI(); predArm('sub'); checkPred();
        });
      });
      var pr=el.querySelector('.st-prs'); if(pr)pr.addEventListener('input',function(){
        prs=+pr.value; predArm('prs');
        var lb=el.querySelector('.st-prslab'); if(lb)lb.textContent=prs.toFixed(1)+'기압 · 끓는점 '+Math.round(bpOf())+'℃';
        drawStage(); renderStatus(); checkPred();
      });
    }

    function bind(){
      var rg=el.querySelector('.st-range');
      if(rg)rg.addEventListener('input',function(e){setTemp(+e.target.value);});
      var hb=el.querySelector('[data-act="heat"]'), cb=el.querySelector('[data-act="cool"]');
      if(hb)hb.addEventListener('click',function(){snd('tap');setTemp(temp+15);});
      if(cb)cb.addEventListener('click',function(){snd('tap');setTemp(temp-15);});
      el.querySelectorAll('.st-wow').forEach(function(b){
        b.addEventListener('click',function(){ if(b.dataset.wow==='arm')wowArm(); else wowReveal(); });
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); buildUI(); },1500);
        });
      });
    }
    buildUI();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); if(rampTimer)clearTimeout(rampTimer); };
  });
})();
