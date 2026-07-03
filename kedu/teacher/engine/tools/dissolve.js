/* ============================================================================
   케이랩 도구 모듈 — 용해와 용액 (dissolve) v2  [과학 7호 · 탐구 표준 v2]
   5학년 용해와 용액. KLab.ui 4모드(자유탐구/미션/퀴즈/만약에) 표준.
   변수 → 현상 → 발견:
     ▸ 🍬 각설탕(황설탕) 넣기 → 덩어리가 입자로 풀려 물속에 골고루 퍼짐.
        물 색이 전체적으로 균일하게 변함 → "사라진 게 아니라 골고루 섞인 것".
     ▸ ⚖️ 저울 상시 표시 — 물 100g + 설탕 Ng = 용액 (100+N)g. 녹아도 무게 그대로
        (무게 보존, 대표 오개념 직격).
     ▸ 🥄 젓기 → 훨씬 빨리 녹음. 🌡️ 온도 → 높을수록 더 많이·더 빨리 녹음(용해도).
     ▸ 한계(포화)를 넘으면 다 안 녹고 가라앉음 → 온도를 올리면 마저 녹음.
        온도를 내리면 도로 가라앉음(석출).
   v2 (탐구 표준 v2 4층):
     1층 변수 개방 — 용질 3종 버튼(고 — 원본 D칸 미이행분: 🍬설탕 18+0.6t 가파름 ·
       🧂소금 35+0.02t 거의 평평(5학년 심화 핵심) · ⚗️붕산 5+0.35t 낮고 가파름.
       용해도 게이지가 곡선 차이를 실시간 반영, 용질 교체 = 새 물). 온도 첫 조작 = 🔮.
     2층 만약에 — 🥄 저으면 무한히?(포화는 저어도 딱 멈춤 = C② 직격, 원본 G칸) ·
       🧂 소금물 가열(한계 35→36 거의 그대로, 고) · ☀️ 증발(수면이 내려가며 도로
       나오다 전량 석출 = 천일염). 중=🥄☀️, 고=3종.
     3층 예측 노트 — 온도·용질 첫 조작 = 🔮 무장 → 해소·칩·5칩 토스트.
       기존 재결정 와우(예측 빗나감형 12호)는 3층 특수 사례로 그대로 보존.
     4층 — 3D 미전환·SVG 유지. 용질별 입자·물빛 색 분화 + 증발 수면 하강 연출.
   미션 4종(다 녹이기/저어 빨리/포화 만들기/온도 올려 마저 녹이기) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz", temp(기본20) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('dissolve', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, t0 = Date.now();
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', hot:'#E8590C', cold:'#1971C2', vio:'#7048E8', sugar:'#B5651D' };
    var btn = 'font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function clamp(v,a,b){ return Math.max(a,Math.min(v,b)); }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n); }
    /* 재결정 와우(예측 빗나감형): 다 녹아 맑은 따뜻한 용액을 차게 식히면 녹았던 설탕이 도로 나옴(석출).
       라이브 update()의 석출 로직을 예측→확인 2단으로 연출만 얹음(헌법 6장: 비주얼 대수술 X). */
    var coolArmed=false, coolRevealing=false, coolTimer=null;

    /* ───────────── 상태 ───────────── */
    var B = { x:230, y:100, w:430, h:300 };          // 비커 내부(물)
    var DOTS_PER_CUBE = 10, GRAM_PER_DOT = 1;
    /* ── v2 1층 변수 — 용질 3종(용해도 곡선이 물질의 지문) + 증발 수위. 기본값(설탕·수위1) = 기존 거동 ── */
    var SOLUTE={
      sugar:{ nm:'설탕', ic:'🍬', col:'#B5651D', rgb:'181,101,29',  lim:function(t){ return Math.round(18+t*0.6); } },
      salt: { nm:'소금', ic:'🧂', col:'#7C93A8', rgb:'124,147,168', lim:function(t){ return Math.round(35+t*0.02); } },
      boric:{ nm:'붕산', ic:'⚗️', col:'#4F9E8A', rgb:'79,158,138',  lim:function(t){ return Math.round(5+t*0.35); } }
    };
    var sol='sugar', wl=1, evapFast=false;           // wl = 물 높이 비율(만약에 ☀️ 증발)
    function v2reset(){ sol='sugar'; wl=1; evapFast=false; }
    function colOf(){ return SOLUTE[sol].col; }
    function wTop(){ return B.y+B.h*(1-wl); }
    var st;
    function reset(){
      st = { temp:(config.temp!=null)?config.temp:20, stir:false, stirT:0,
             total:0,            // 넣은 용질 총량(점 단위)
             dots:[],            // 녹아 있는 입자
             erode:0,            // 용해 누적기
             satEver:false,      // 한 번이라도 포화(가라앉음) 경험
             sand:0,             // 넣은 모래 총량(점 단위) — 안 녹고 바닥에 쌓임(저학년 닻)
             sandSeed:[] };      // 모래 알갱이 흩뿌림 좌표(시각용)
    }
    reset();
    function limit(t){ return SOLUTE[sol].lim(t); }                   // 용해도(점) — v2: 용질별 곡선
    function limEff(){ return Math.round(limit(st.temp)*wl); }        // 증발 시 물이 줄면 한계도 비례해 줆
    function pending(){ return st.total - st.dots.length; }           // 안 녹고 가라앉은 양
    function newDot(x,y){ return { x:x, y:y, vx:(Math.random()-0.5), vy:-(0.5+Math.random()), el:null }; }
    function prefillN(n){                                             // 이미 녹아 있는 맑은 용액 셋업(만약에·와우)
      st.dots=[];
      for(var i=0;i<n;i++){
        var d=newDot(B.x+B.w/2+(Math.random()-0.5)*Math.min(150,40+n*2), wTop()+18+Math.random()*(B.h*wl-36));
        st.dots.push(d);
      }
      st.erode=0; st.satEver=false;
    }

    /* ───────────── 미션 (고학년 = 기존 v1) ───────────── */
    var MISSIONS = [
      { text:'🍬 각설탕을 <b style="color:#7048E8;">2개</b> 넣고 <b style="color:#7048E8;">모두 녹여</b> 봐요! (저울 숫자도 지켜봐요)',
        keep:false, check:function(){ return st.total>=2*DOTS_PER_CUBE && pending()===0 && st.dots.length>0; } },
      { text:'🥄 설탕을 넣고 <b style="color:#7048E8;">저으면서</b> 녹여 봐요 — 훨씬 빨리 녹는 게 보일 거예요!',
        keep:false, check:function(){ return st.stir && pending()>0 && st.dots.length>0; } },
      { text:'🍬 설탕을 <b style="color:#7048E8;">계속</b> 넣어 봐요. 더 못 녹고 <b style="color:#7048E8;">가라앉을 때까지</b>! (포화)',
        keep:false, check:function(){ return pending()>0 && st.dots.length>=limit(st.temp); } },
      { text:'🌡️ 이제 <b style="color:#7048E8;">온도를 올려서</b> 가라앉은 설탕을 <b style="color:#7048E8;">마저 녹여</b> 봐요!',
        keep:true,  check:function(){ return st.satEver && st.temp>=40 && pending()===0 && st.total>limit(20); } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=녹는다 vs 안 녹는다(설탕↔모래, 일상어) / 중=용해 전후 무게 같음·입자(혼합) / 고=용해도·포화·온도·재결정(기존 유지).
       ※ 모래(안 녹는 가루)는 저학년 닻 기능 — 라이브에 없어 신규 구현(magnet 철찾기와 동일 원칙). */
    var LOW_MISSIONS = [
      { text:'🍬 <b style="color:#7048E8;">각설탕</b>을 넣고 다 녹여 봐요 — 어? <b style="color:#7048E8;">사라진 듯 숨었어요!</b>',
        keep:false, check:function(){ return st.total>=DOTS_PER_CUBE && pending()===0 && st.dots.length>0; } },
      { text:'🪨 이번엔 <b style="color:#7048E8;">모래</b>를 넣어 봐요 — 모래는 <b style="color:#7048E8;">안 녹고 바닥에 그대로!</b>',
        keep:true,  check:function(){ return st.sand>=DOTS_PER_CUBE; } },
      { text:'🥄 설탕을 넣고 <b style="color:#7048E8;">저어 봐요</b> — 저으면 훨씬 <b style="color:#7048E8;">빨리</b> 녹아요!',
        keep:false, check:function(){ return st.stir && pending()>0 && st.dots.length>0; } }
    ];
    var MID_MISSIONS = [
      { text:'🍬 각설탕 <b style="color:#7048E8;">2개</b>를 모두 녹여 봐요 — 사라진 게 아니라 <b style="color:#7048E8;">입자로 골고루</b> 섞인 거예요!',
        keep:false, check:function(){ return st.total>=2*DOTS_PER_CUBE && pending()===0 && st.dots.length>0; } },
      { text:'⚖️ 저울을 보며 설탕을 <b style="color:#7048E8;">더 넣어</b> 봐요 — 녹아도 <b style="color:#7048E8;">물+설탕 무게 그대로!</b> (무게 보존)',
        keep:false, check:function(){ return st.total>=4*DOTS_PER_CUBE && pending()===0 && st.dots.length>0; } },
      { text:'🥄 <b style="color:#7048E8;">저으면서</b> 녹여 봐요 — 젓기는 더 빨리 녹게 도와줘요!',
        keep:false, check:function(){ return st.stir && pending()>0 && st.dots.length>0; } }
    ];
    var GRADES = {
      low:  { modes:['free','mission'],                 missions:LOW_MISSIONS, sand:true,  temp:false, scale:false, gauge:false, showWow:false, v2:false, wif:[] },
      mid:  { modes:['free','mission','quiz','whatif'], missions:MID_MISSIONS, sand:false, temp:true,  scale:true,  gauge:false, showWow:false, v2:false, wif:['stirmore','evapo'] },
      high: { modes:['free','mission','quiz','whatif'], missions:MISSIONS,     sand:false, temp:true,  scale:true,  gauge:true,  showWow:true,  v2:true,  wif:['stirmore','saltheat','evapo'] }
    };
    var grade = (['low','mid','high'].indexOf(config.grade)>=0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return G().missions; }
    var bands = ui.gradeBands({ grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false;
      coolArmed=false; coolRevealing=false; if(coolTimer){clearTimeout(coolTimer);coolTimer=null;}
      var t=st?st.temp:20; reset(); v2reset(); if(!G().temp)st.temp=20; else st.temp=t;
      if(wif)wif.reset(); makeWif();
      build();
    }});

    /* ───────────── 🌀 만약에 (v2 2층 — 원본 G칸 오개념 반증 이행) ───────────── */
    var WHATIF={
      stirmore:{ icon:'🥄', title:'계속 저으면 무한히 녹을까?',
        q:'설탕이 안 녹고 가라앉았어요. 더 세게, 계속 저으면 어떻게 될까요?',
        ch:['저으면 결국 다 녹아요','아무리 저어도 한계에서 딱 멈춰요','저으면 오히려 도로 나와요'], a:1,
        reveal:'젓기는 빠르기만 바꿔요! 녹을 수 있는 양은 온도가 정해요 — 포화 용액은 아무리 저어도 한계에서 딱 멈춘 채 바닥에 쌓여요. 마저 녹이고 싶다면 온도를 올려야 해요.',
        tip:'🥄 젓고 🍬 더 넣어 봐요 — 녹은 양 숫자를 잘 보면서!' },
      saltheat:{ icon:'🧂', title:'소금물을 뜨겁게 하면 훨씬 더 녹을까?',
        q:'설탕은 뜨거우면 쑥쑥 녹죠. 소금도 온도를 올리면 훨씬 더 녹을까요?',
        ch:['설탕처럼 훨씬 더 녹아요','거의 그대로예요','오히려 덜 녹아요'], a:1,
        reveal:'소금의 용해도는 20℃에서 35점, 80℃에서 36점 — 거의 평평해요! 용해도 곡선은 물질마다 다른 지문이에요. 설탕은 가파르고, 소금은 평평하고, 붕산은 낮고 가팔라요.',
        tip:'🌡️ 온도를 80℃까지 쭉 올려 봐요 — 가라앉은 소금이 녹나?' },
      evapo:{ icon:'☀️', title:'물이 다 날아가 버린다면?',
        q:'맑은 설탕물의 물이 햇볕에 다 날아가면, 녹았던 설탕은 어떻게 될까요?',
        ch:['물과 함께 사라져요','바닥에 설탕만 소복이 남아요','공기 중으로 날아가요'], a:1,
        reveal:'물이 줄수록 녹아 있을 자리가 좁아져 도로 나오다가, 다 날아가면 바닥에 설탕만 소복! 사라진 게 아니었다는 최종 증명이에요. 바닷물을 증발시켜 소금을 얻는 천일염이 바로 이 원리랍니다.',
        tip:'☀️ 증발시키기를 계속 눌러 봐요 — 수면이 내려가면서…!' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ build(); },
        footEl:function(){ return el.querySelector('.dv-foot'); },
        onSelect:function(k){ reset(); v2reset(); st.temp=20; },
        onPlay:function(k){
          if(k==='stirmore'){ reset(); v2reset(); sol='sugar'; st.temp=20; st.total=40; prefillN(30); }
          else if(k==='saltheat'){ reset(); v2reset(); sol='salt'; st.temp=20; st.total=45; prefillN(35); }
          else { reset(); v2reset(); sol='sugar'; st.temp=40; st.total=30; prefillN(30); }
        },
        onExit:function(){ reset(); v2reset(); st.temp=20; }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 온도·용질 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ temp:{asked:false,ch:-1,done:false}, sub:{asked:false,ch:-1,done:false} };
    var PRED={
      temp:{ q:'🔮 예측 먼저! 온도를 올리면 설탕은 어떻게 될까요?',
        ch:['빨리 녹기만 해요','더 많이 녹을 수 있어요','아무 변화 없어요'],
        tip:'가라앉을 때까지 🍬 넣고, 🌡️ 온도를 쭉 올려 봐요!' },
      sub:{ q:'🔮 예측 먼저! 소금도 설탕처럼 온도를 올리면 훨씬 더 녹을까요?',
        ch:['설탕처럼 훨씬 더 녹는다','거의 그대로다','오히려 덜 녹는다'],
        tip:'🧂 소금을 가라앉을 때까지 넣고 온도를 끝까지 올려 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.dv-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="dv-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="dv-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.dv-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='temp') msg=hit?'✔ 예측 적중 — 온도가 높을수록 더 많이 녹아요! 젓기는 빠르기만, 양은 온도가 정해요.'
                               :'✘ 예측 빗나감 — 온도를 올리면 더 많이 녹을 수 있어요! 가라앉았던 설탕이 마저 녹았죠?';
      else msg=hit?'✔ 예측 적중 — 소금은 거의 그대로! 용해도 곡선은 물질마다 다른 지문이에요.'
                  :'✘ 예측 빗나감 — 소금은 온도를 올려도 거의 그대로예요! 설탕의 가파른 곡선과 전혀 달라요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.dv-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.temp.ch>=0&&!pred.temp.done&&sol==='sugar'&&st.temp>=50&&st.satEver&&pending()===0&&st.dots.length>0)predResolve('temp');
      if(pred.sub.ch>=0&&!pred.sub.done&&sol==='salt'&&st.temp>=60&&pending()>0)predResolve('sub');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={stirmore:'🥄 젓기실험',saltheat:'🧂 소금용해도',evapo:'☀️ 증발실험',temp:'🌡️ 온도예측',sub:'⚗️ 물질예측'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'⚗️ 꼬마 용액학자 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.dv-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="dv-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }

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
    var QUIZ = [
      { q:'물에 녹아 보이지 않는 설탕은 어디에 있을까요?',
        ch:['물속에 골고루 섞여 있어요','정말로 사라졌어요','전부 바닥에 있어요'], a:0 },
      { q:'물 100g에 설탕 10g을 녹이면 설탕물의 무게는?',
        ch:['110g — 무게는 그대로!','100g — 녹으면 가벼워져요','105g — 절반만 남아요'], a:0 },
      { q:'설탕을 더 빨리 녹이려면?',
        ch:['젓거나 따뜻한 물에 녹여요','차가운 물에 가만히 둬요','물을 얼려요'], a:0 },
      { q:'설탕이 더 녹지 않고 가라앉을 때 마저 녹이려면?',
        ch:['물의 온도를 올려요','물의 온도를 내려요','설탕을 더 넣어요'], a:0 },
      { q:'설탕물의 위쪽과 아래쪽, 단맛은 어떨까요?',
        ch:['골고루 섞여 똑같이 달아요','아래쪽만 달아요','위쪽만 달아요'], a:0 }
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
      var g=G();
      function bt2(act,lab,style){ return '<button class="dv-btn" data-act="'+act+'" style="'+btn+style+'">'+lab+'</button>'; }
      var open='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">';
      /* ── v2 만약에 집중 무대 — 실험별 필요한 조작만 ── */
      if(mode==='whatif'){
        var k=wif.state.key, s2=open;
        if(k==='stirmore'){
          s2+=bt2('add',SOLUTE[sol].ic+' '+SOLUTE[sol].nm+' 넣기','background:'+colOf()+';color:#fff;border-color:'+colOf()+';')
            +bt2('stir','🥄 젓기 '+(st.stir?'중!':''),(st.stir?'background:'+C.vio+';color:#fff;border-color:'+C.vio:'background:#fff;color:'+C.vio+';border-color:'+C.vio)+';');
        } else if(k==='saltheat'){
          s2+='<span style="font-size:19px;font-weight:800;color:'+C.sub+';">🌡️</span>'
            +'<input class="dv-range" type="range" min="0" max="80" value="'+st.temp+'" style="width:min(34vw,220px);">'
            +'<span class="dv-temp" style="font-size:22px;font-weight:800;color:'+C.ink+';min-width:58px;">'+st.temp+'℃</span>';
        } else {
          s2+=bt2('evap','☀️ 물 증발시키기','background:#fff;color:'+C.hot+';border-color:'+C.hot+';');
        }
        return s2+'</div>';
      }
      var s=open
        +bt2('add',SOLUTE[sol].ic+' '+(sol==='sugar'?'각설탕':SOLUTE[sol].nm)+' 넣기','background:'+colOf()+';color:#fff;border-color:'+colOf()+';');
      if(g.sand) s+=bt2('sand','🪨 모래 넣기','background:#A1887F;color:#fff;border-color:#8D6E63;');
      s+=bt2('stir','🥄 젓기 '+(st.stir?'중!':''),(st.stir?'background:'+C.vio+';color:#fff;border-color:'+C.vio:'background:#fff;color:'+C.vio+';border-color:'+C.vio)+';');
      if(g.temp) s+='<span style="font-size:19px;font-weight:800;color:'+C.sub+';">🌡️</span>'
        +'<input class="dv-range" type="range" min="0" max="80" value="'+st.temp+'" style="width:min(34vw,220px);">'
        +'<span class="dv-temp" style="font-size:22px;font-weight:800;color:'+C.ink+';min-width:58px;">'+st.temp+'℃</span>';
      s+=bt2('reset','↺ 새 물','background:#fff;color:#666;border-color:#9aa;')
        +'</div>';
      /* ── v2 1층 — 용질 3종 (고학년·자유탐구, 교체 = 새 물) ── */
      if(mode==='free'&&g.v2){
        s+='<div class="dv-v2" style="display:flex;gap:8px;justify-content:center;align-items:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<span style="font-size:15px;font-weight:800;color:'+C.sub+';font-family:inherit;">녹일 것</span>'
          +Object.keys(SOLUTE).map(function(k2){ var on=(sol===k2);
            return '<button class="dv-sub" data-s="'+k2+'" style="font-size:17px;padding:9px 13px;border-radius:12px;border:2.5px solid '+SOLUTE[k2].col+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +(on?('background:'+SOLUTE[k2].col+';color:#fff;'):('background:#fff;color:'+SOLUTE[k2].col+';'))+'">'+SOLUTE[k2].ic+' '+SOLUTE[k2].nm+'</button>'; }).join('')
          +'</div>';
      }
      return s;
    }
    function build(){
      var M=curMissions();
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode,{whatif:'🌀 만약에'}), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); body=(wif.active()?ctrlRow():''); }
      else body=ctrlRow()+(G().showWow?wowRow():'');
      /* ── v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.dv-btn:active,.dv-sub:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}'
        +'.dv-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#4DABF7,#FFD43B,#FF6B6B);outline:none;}'
        +'.dv-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.dv-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.dv-wow:active{transform:translateY(2px);}'
        +'.dv-flash,.dv-flash-magic,.dv-nudge{position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:88%;padding:13px 20px;border-radius:16px;font-weight:800;font-size:20px;line-height:1.42;text-align:center;z-index:5;box-shadow:0 6px 22px rgba(0,0,0,0.16);animation:dvPop .35s ease;}'
        +'.dv-flash{background:#E7F1FF;color:#1862C6;border:3px solid #4DABF7;}'
        +'.dv-flash-magic{background:#F3EDFF;color:#6A36D9;border:3px solid #9775FA;}'
        +'.dv-nudge{background:#FFF4E0;color:#B5651D;border:3px solid #FFC078;}'
        +'@keyframes dvPop{from{opacity:0;transform:translateX(-50%) translateY(-8px) scale(.96);}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}}'
        +'.dv-hold{font-size:18px;color:#6A36D9;margin-top:6px;animation:dvHold 1.1s ease-in-out infinite;}'
        +'@keyframes dvHold{0%,100%{opacity:.5;}50%{opacity:1;}}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="dv-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="dv-foot">'+foot+'</div>'
        +'<div class="dv-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="dv-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0; mDone=false; mLock=false; reset(); v2reset(); if(!G().temp)st.temp=20;
        coolArmed=false; coolRevealing=false; if(coolTimer){clearTimeout(coolTimer);coolTimer=null;}
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); bands.bind(el); renderChips(); renderStatus();
      if(mode==='whatif')wif.bind(el);
    }

    /* ───────────── 무대 ───────────── */
    var stage, dyn={};
    function drawStage(){
      stage=el.querySelector('.dv-stage'); stage.innerHTML=''; dyn={};
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      // 물(농도 색) — v2: ☀️ 증발 시 수면이 실제로 내려감
      dyn.water=svgEl('rect',{x:B.x,y:wTop(),width:B.w,height:B.h*wl,rx:6,fill:'rgba(120,180,230,0.30)'});
      svg.appendChild(dyn.water);
      // 비커 윤곽
      svg.appendChild(svgEl('path',{d:'M '+(B.x-14)+' '+(B.y-8)+' L '+(B.x-14)+' '+(B.y+B.h+10)+' Q '+(B.x-14)+' '+(B.y+B.h+24)+' '+B.x+' '+(B.y+B.h+24)+' L '+(B.x+B.w)+' '+(B.y+B.h+24)+' Q '+(B.x+B.w+14)+' '+(B.y+B.h+24)+' '+(B.x+B.w+14)+' '+(B.y+B.h+10)+' L '+(B.x+B.w+14)+' '+(B.y-8),fill:'none',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      // 젓기 숟가락(젓는 동안 회전)
      dyn.spoon=svgEl('g',{opacity:0});
      dyn.spoon.appendChild(svgEl('line',{x1:B.x+B.w/2,y1:B.y-26,x2:B.x+B.w/2,y2:B.y+B.h*0.55,stroke:'#9C7B4F','stroke-width':9,'stroke-linecap':'round'}));
      dyn.spoon.appendChild(svgEl('ellipse',{cx:B.x+B.w/2,cy:B.y+B.h*0.58,rx:24,ry:14,fill:'#C9A26B',stroke:'#9C7B4F','stroke-width':3}));
      svg.appendChild(dyn.spoon);
      // 가라앉은 용질 더미
      dyn.pile=svgEl('path',{d:'',fill:'#E0B27A',stroke:colOf(),'stroke-width':2.5}); svg.appendChild(dyn.pile);
      // 안 녹는 모래 더미 (저학년 닻 — 넣으면 그대로 바닥에 쌓임)
      dyn.sand=svgEl('g',{}); svg.appendChild(dyn.sand); drawSand();
      // 녹은 입자
      dyn.parts=svgEl('g',{}); svg.appendChild(dyn.parts);
      st.dots.forEach(function(p){ p.el=svgEl('circle',{cx:p.x,cy:p.y,r:6.5,fill:colOf(),'fill-opacity':0.85}); dyn.parts.appendChild(p.el); });
      // 저울 패널(오른쪽) — 중·고학년만 (무게 보존 닻)
      if(G().scale){
        var SX=720, SY=150;
        svg.appendChild(svgEl('rect',{x:SX-22,y:SY-38,width:190,height:170,rx:18,fill:'#fff',stroke:'#C9D7E6','stroke-width':3}));
        var t1=svgEl('text',{x:SX+73,y:SY-10,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink}); t1.textContent='⚖️ 저울'; svg.appendChild(t1);
        dyn.sW=svgEl('text',{x:SX-6,y:SY+26,'font-family':'Jua,sans-serif','font-size':19,fill:C.sub,'font-weight':800}); svg.appendChild(dyn.sW);
        dyn.sS=svgEl('text',{x:SX-6,y:SY+56,'font-family':'Jua,sans-serif','font-size':19,fill:C.sugar,'font-weight':800}); svg.appendChild(dyn.sS);
        svg.appendChild(svgEl('line',{x1:SX-6,y1:SY+72,x2:SX+152,y2:SY+72,stroke:'#C9D7E6','stroke-width':3}));
        dyn.sT=svgEl('text',{x:SX-6,y:SY+104,'font-family':'Jua,sans-serif','font-size':22,fill:C.ink,'font-weight':800}); svg.appendChild(dyn.sT);
      }
      // 용해도 게이지(왼쪽): 지금 온도에서 녹을 수 있는 양 — 고학년만 (포화·온도 닻)
      if(G().gauge){
        dyn.gT=svgEl('text',{x:120,y:130,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:C.sub}); dyn.gT.textContent='녹을 수 있는 양'; svg.appendChild(dyn.gT);
        svg.appendChild(svgEl('rect',{x:96,y:145,width:48,height:240,rx:12,fill:'#fff',stroke:'#C9D7E6','stroke-width':3}));
        dyn.gFill=svgEl('rect',{x:102,y:385,width:36,height:0,rx:9,fill:'#FFD8A8'}); svg.appendChild(dyn.gFill);
        dyn.gNow=svgEl('rect',{x:102,y:385,width:36,height:0,rx:9,fill:C.sugar,'fill-opacity':0.85}); svg.appendChild(dyn.gNow);
      }
      stage.appendChild(svg);
    }
    // 모래 알갱이 렌더 (안 녹음 — 정적). st.sand 양만큼 바닥 더미+알갱이.
    function drawSand(){
      if(!dyn.sand)return; dyn.sand.innerHTML='';
      if(st.sand<=0)return;
      var n=st.sand, pd=Math.min(60, n);
      // 바닥 더미 (칙칙한 모래색)
      dyn.sand.appendChild(svgEl('path',{d:'M '+(B.x+12)+' '+(B.y+B.h)+' Q '+(B.x+B.w*0.32)+' '+(B.y+B.h-10-pd*1.4)+' '+(B.x+B.w*0.5)+' '+(B.y+B.h-12-pd*1.7)+' Q '+(B.x+B.w*0.68)+' '+(B.y+B.h-10-pd*1.4)+' '+(B.x+B.w-12)+' '+(B.y+B.h)+' Z',fill:'#B59A78',stroke:'#8D6E63','stroke-width':2}));
      // 알갱이 (시드 좌표)
      for(var i=0;i<st.sandSeed.length;i++){ var g=st.sandSeed[i];
        dyn.sand.appendChild(svgEl('circle',{cx:g.x,cy:g.y,r:g.r,fill:'#8D6E63','fill-opacity':0.9}));
      }
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ update(); raf=requestAnimationFrame(loop); }
    var frame=0;
    function update(){
      frame++;
      if(mode!=='quiz'){
        var lim=limEff(), sp=st.stir?3.2:1;
        // 용해: 가라앉은 게 있고 한계 미만이면 입자로 풀려남
        if(pending()>0 && st.dots.length<lim && wl>0){
          st.erode += 0.05*(1+st.temp/40)*sp;
          while(st.erode>=1 && pending()>0 && st.dots.length<lim){
            st.erode-=1;
            var px=B.x+B.w/2+(Math.random()-0.5)*Math.min(140,30+pending()*4);
            var d2=newDot(px,B.y+B.h-16);
            d2.el=svgEl('circle',{cx:d2.x,cy:d2.y,r:6.5,fill:colOf(),'fill-opacity':0.85});
            if(dyn.parts)dyn.parts.appendChild(d2.el);
            st.dots.push(d2);
          }
        }
        // 석출: 온도를 내리거나(재결정) 물이 줄어(증발) 한계를 넘으면 도로 가라앉음
        if(st.dots.length>lim && frame%((coolRevealing||evapFast)?4:18)===0){
          var rm=st.dots.pop(); if(rm.el)rm.el.remove();
        }
        if(pending()>0 && st.dots.length>=lim) st.satEver=true;
        // 입자 운동(골고루 퍼짐) — v2: 수면 아래에서만
        var mv=(0.5+st.temp/60)*(st.stir?2.6:1), topB=wTop()+10;
        for(var i=0;i<st.dots.length;i++){ var p=st.dots[i];
          p.vx+=(Math.random()-0.5)*0.3; p.vy+=(Math.random()-0.5)*0.3;
          if(st.stir){ var cx=B.x+B.w/2, cy=wTop()+B.h*wl/2, dx=p.x-cx, dy=p.y-cy, L=Math.sqrt(dx*dx+dy*dy)||1;
            p.vx+=(-dy/L)*0.9; p.vy+=(dx/L)*0.9; }                 // 소용돌이
          p.vx=clamp(p.vx,-2.2,2.2)*0.96; p.vy=clamp(p.vy,-2.2,2.2)*0.96;
          p.x+=p.vx*mv; p.y+=p.vy*mv;
          if(p.x<B.x+10){p.x=B.x+10;p.vx=Math.abs(p.vx);} if(p.x>B.x+B.w-10){p.x=B.x+B.w-10;p.vx=-Math.abs(p.vx);}
          if(p.y<topB){p.y=topB;p.vy=Math.abs(p.vy);} if(p.y>B.y+B.h-10){p.y=B.y+B.h-10;p.vy=-Math.abs(p.vy);}
          if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));}
        }
        // 젓기 자동 종료(4초)
        if(st.stir){ st.stirT++; if(st.stirT>240){ st.stir=false; st.stirT=0; build(); } }
        // 화면 연동 — v2: 용질별 물빛·수면 높이
        if(dyn.water){
          dyn.water.setAttribute('fill','rgba('+SOLUTE[sol].rgb+','+(0.06+clamp(st.dots.length/70,0,1)*0.30).toFixed(3)+')');
          dyn.water.setAttribute('y',wTop().toFixed(1)); dyn.water.setAttribute('height',(B.h*wl).toFixed(1));
        }
        if(dyn.spoon)dyn.spoon.setAttribute('opacity',st.stir?1:0);
        if(dyn.spoon&&st.stir)dyn.spoon.setAttribute('transform','translate('+(Math.sin(frame*0.18)*46)+',0)');
        if(dyn.pile){ var pd=pending();
          dyn.pile.setAttribute('d', pd>0 ? ('M '+(B.x+B.w/2-30-pd*3)+' '+(B.y+B.h)+' Q '+(B.x+B.w/2)+' '+(B.y+B.h-14-pd*1.6)+' '+(B.x+B.w/2+30+pd*3)+' '+(B.y+B.h)+' Z') : ''); }
        if(dyn.sW)dyn.sW.textContent='물          '+Math.round(100*wl)+'g';
        if(dyn.sS)dyn.sS.textContent=SOLUTE[sol].nm+(sol==='sugar'?'        ':'    ')+(st.total*GRAM_PER_DOT)+'g';
        if(dyn.sT)dyn.sT.textContent='전체   '+(Math.round(100*wl)+st.total*GRAM_PER_DOT)+'g';
        if(dyn.gFill){ var gh=clamp(limEff()/66,0,1)*240; dyn.gFill.setAttribute('y',385-gh); dyn.gFill.setAttribute('height',gh); }
        if(dyn.gNow){ var nh=clamp(st.dots.length/66,0,1)*240; dyn.gNow.setAttribute('y',385-nh); dyn.gNow.setAttribute('height',nh); }
        if(frame%30===0){ renderStatus(); checkPred(); }
      }
      checkMission();
    }

    function renderStatus(){
      var s=el.querySelector('.dv-status'); if(!s)return;
      var pd=pending(), n=st.dots.length, lim=limEff(), h;
      function fin(html){
        s.innerHTML=html;
        /* ── v2 검증 관측점 — jsdom에서 상태를 단언할 수 있게 dataset 기록 ── */
        var stg=el.querySelector('.dv-stage');
        if(stg){
          stg.dataset.total=String(st.total); stg.dataset.dots=String(n); stg.dataset.pend=String(pd);
          stg.dataset.lim=String(lim); stg.dataset.temp=String(st.temp); stg.dataset.sol=sol;
          stg.dataset.wl=wl.toFixed(2); stg.dataset.sand=String(st.sand);
        }
      }
      if(mode==='quiz'){ fin('<div style="font-size:18px;color:'+C.sub+';">실험을 떠올리며 답을 골라요</div>'); return; }
      /* ── v2 만약에 상태줄 ── */
      if(mode==='whatif'&&wif.active()){
        var k=wif.state.key;
        if(k==='stirmore'){
          fin('<div style="font-size:24px;color:'+C.vio+';">'+(st.stir?'🥄 열심히 젓는 중… ':'')+'녹은 양 <b>'+n+'점</b> / 한계 '+lim+'점'+(pd>0?' · 가라앉음 '+pd+'점':'')+'</div>'
            +'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(pd>0?'아무리 저어도 한계에서 딱 멈춰요 — 젓기는 빠르기만!':'아직 여유가 있어요 — 🍬 더 넣어 봐요!')+'</div>');
          return;
        }
        if(k==='saltheat'){
          fin('<div style="font-size:24px;color:#5B7C99;">🧂 '+st.temp+'℃ — 한계 <b>'+lim+'점</b>'+(pd>0?' · 가라앉음 '+pd+'점':'')+'</div>'
            +'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(st.temp>=60?'온도를 잔뜩 올렸는데도 거의 그대로죠? 소금의 용해도 곡선은 평평해요!':'🌡️ 온도를 쭉 올려 봐요 — 설탕이라면 쑥쑥 늘 텐데…')+'</div>');
          return;
        }
        fin('<div style="font-size:24px;color:'+C.hot+';">☀️ 물 '+Math.round(wl*100)+'g'+(wl<=0?' — 다 날아갔어요!':'')+'</div>'
          +'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(wl<=0?'바닥에 '+SOLUTE[sol].nm+'만 소복이 '+st.total+'g — 사라진 게 아니었죠! (천일염의 원리)':(n>lim?'물이 줄어 넘친 만큼 도로 나오는 중…':'수면이 내려가고 있어요 — 계속 증발시켜 봐요!'))+'</div>');
        return;
      }
      if(grade==='low'){
        var sandMsg='<div style="font-size:18px;color:#8D6E63;margin-top:5px;">🪨 모래는 안 녹고 바닥에 그대로 있죠? <b>녹는 것</b>과 <b>안 녹는 것</b>이 있어요!</div>';
        if(st.total===0&&st.sand===0)h='<div style="font-size:24px;color:'+C.ink+';">🍬 설탕과 🪨 모래를 넣어 봐요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">물에 넣으면 어떻게 되는지 잘 살펴봐요.</div>';
        else if(st.total===0&&st.sand>0)h='<div style="font-size:24px;color:#8D6E63;">🪨 모래는 바닥에 그대로 가라앉았어요 — 안 녹아요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">이번엔 🍬 설탕도 넣어 비교해 봐요.</div>';
        else if(pd>0)h='<div style="font-size:24px;color:'+C.sugar+';">설탕이 물속으로 사르르 풀리는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🥄 저으면 더 빨리 녹아요!</div>'+(st.sand>0?sandMsg:'');
        else h='<div style="font-size:24px;color:'+C.good+';">설탕이 사라진 듯 숨었어요 — 물에 <b>녹은</b> 거예요!</div>'+(st.sand>0?sandMsg:'<div style="font-size:18px;color:'+C.sub+';margin-top:5px;">정말 사라진 게 아니라 물속에 골고루 숨어 있어요.</div>');
        fin(h); return;
      }
      var NM=SOLUTE[sol].nm, IC=SOLUTE[sol].ic;
      if(st.total===0)h='<div style="font-size:24px;color:'+C.ink+';">'+IC+' '+NM+'을(를) 넣어 보세요 — 입자가 어떻게 되는지, 저울 숫자는 어떻게 되는지!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">물은 100g이에요. '+NM+'을(를) 넣으면서 전체 무게를 지켜봐요.</div>';
      else if(pd>0&&n>=lim)h='<div style="font-size:24px;color:'+colOf()+';">더 못 녹고 가라앉았어요 — 포화!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">지금 온도('+st.temp+'℃)에서 '+NM+'이(가) 녹을 수 있는 양이 꽉 찼어요.'+(sol==='salt'?' 소금은 온도를 올려도 거의 안 늘어요!':' 🌡️ 온도를 올리면 마저 녹일 수 있어요.')+' 그래도 무게는 전체 '+(100+st.total)+'g 그대로!</div>';
      else if(pd>0)h='<div style="font-size:24px;color:'+colOf()+';">'+NM+'이(가) 입자로 풀려 물속으로 퍼지는 중…</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">🥄 저으면 훨씬 빨리 녹아요. 온도가 높아도 빨리 녹아요.</div>';
      else h='<div style="font-size:24px;color:'+C.good+';">다 녹아서 안 보여요 — 하지만 사라진 게 아니에요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">입자가 물속에 <b>골고루</b> 섞여 있어요. 그래서 저울도 물 100g + '+NM+' '+st.total+'g = <b>'+(100+st.total)+'g 그대로</b>. 어디를 마셔도 똑같아요.</div>';
      if(coolArmed&&mode==='free') h+='<div class="dv-hold">🧊 녹을 수 있는 양은 온도가 낮을수록 줄어들어요 — 넘치면 도로 나와요</div>';
      fin(h);
    }

    /* ───────────── 재결정 와우 ───────────── */
    function wowRow(){
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin:2px 0 10px;">'
        +'<button class="dv-wow" data-wow="arm" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">🔮 다 녹은 설탕물, 식히면?</button>'
        +'<button class="dv-wow" data-wow="reveal" style="'+btn+'background:'+C.cold+';color:#fff;border-color:'+C.cold+';">❄️ 차갑게 식히기</button>'
        +'</div>';
    }
    function host(){ return el.querySelector('.kl-stage-host'); }
    function clearDvFlash(){ var h=host(); if(!h)return; h.querySelectorAll('.dv-flash,.dv-flash-magic,.dv-nudge').forEach(function(n){ n.remove(); }); }
    function dvFlash(cls,msg,ms){ var h=host(); if(!h)return; clearDvFlash(); var d=document.createElement('div'); d.className=cls; d.innerHTML=msg; h.appendChild(d); setTimeout(function(){ if(d.parentNode)d.remove(); },ms); }
    // 따뜻한 물에 설탕이 다 녹은(맑은) 상태를 즉시 구성 — 예측 셋업
    function prefillDissolved(){
      st.dots=[];
      for(var i=0;i<st.total;i++){
        var d=newDot(B.x+B.w/2+(Math.random()-0.5)*Math.min(150,40+st.total*2), B.y+18+Math.random()*(B.h-36));
        st.dots.push(d);
      }
      st.erode=0; st.satEver=false;
    }
    function wowArm(){
      if(coolTimer){ clearTimeout(coolTimer); coolTimer=null; } coolRevealing=false;
      reset(); v2reset(); sol='sugar'; st.temp=70; st.total=54;   // limit(70)=60 → 54점 전부 녹는 따뜻한 맑은 용액
      prefillDissolved();
      coolArmed=true;
      build();
      snd('charge');
      dvFlash('dv-flash','🔮 따뜻한 물에 설탕이 <b>다 녹아 맑아요</b>. 이대로 차게 <b>식히면</b> — 그대로 맑을까요, 아니면 설탕이 <b>도로 나올까요</b>? 예상해 봐요!',3000);
    }
    function wowReveal(){
      if(!coolArmed){ snd('select'); dvFlash('dv-nudge','먼저 <b>🔮</b> 버튼으로 식히면 어떻게 될지 <b>예상</b>부터 해 봐요!',2600); return; }
      if(coolTimer){ clearTimeout(coolTimer); coolTimer=null; }
      clearDvFlash();
      snd('whoosh'); snd('success');
      dvFlash('dv-flash-magic','❄️ 맑던 설탕물에서 <b>설탕이 도로 나왔어요!</b> 차가운 물은 녹일 수 있는 양이 <b>적어서</b> — 넘친 만큼 다시 알갱이로 (<b>재결정</b>)',3400);
      coolRevealing=true;
      var seq=[55,40,28,16,5], k=0;
      (function tick(){
        if(k<seq.length){
          st.temp=seq[k++];
          var tEl=el.querySelector('.dv-temp'); if(tEl)tEl.textContent=st.temp+'℃';
          var rEl=el.querySelector('.dv-range'); if(rEl)rEl.value=st.temp;
          snd('tap');
          coolTimer=setTimeout(tick,440);
        } else { coolTimer=setTimeout(function(){ coolRevealing=false; coolTimer=null; },1400); }
      })();
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      var H={
        add:function(){ st.total+=DOTS_PER_CUBE; snd('tap'); renderStatus(); },
        sand:function(){
          for(var i=0;i<DOTS_PER_CUBE;i++){
            var pd=Math.min(60, st.sand+1), spread=Math.min(170, 36+st.sand*2);
            st.sandSeed.push({ x:B.x+B.w/2+(Math.random()-0.5)*spread, y:B.y+B.h-8-Math.random()*(10+pd*0.55), r:3+Math.random()*2 });
            st.sand++;
          }
          snd('tap'); drawSand(); renderStatus();
        },
        stir:function(){ st.stir=!st.stir; st.stirT=0; snd('select'); build(); },
        evap:function(){ /* v2 만약에 ☀️ — 수면이 실제로 내려가며 넘친 만큼 도로 나옴 */
          if(wl<=0){ snd('select'); renderStatus(); return; }
          wl=Math.max(0, +(wl-0.25).toFixed(2)); evapFast=true; snd('tap');
          if(wl<=0){ st.dots.forEach(function(p){ if(p.el)p.el.remove(); }); st.dots=[]; snd('pop'); }
          renderStatus();
        },
        reset:function(){ var t=st.temp; coolArmed=false; coolRevealing=false; if(coolTimer){clearTimeout(coolTimer);coolTimer=null;} reset(); if(G().temp)st.temp=t; snd('select'); build(); }
      };
      el.querySelectorAll('.dv-btn').forEach(function(b){ b.addEventListener('click',function(){ var f=H[b.dataset.act]; if(f)f(); }); });
      /* ── v2 1층 — 용질 교체 = 새 물(온도 유지), 첫 교체 = 🔮 예측 무장 ── */
      el.querySelectorAll('.dv-sub').forEach(function(b){
        b.addEventListener('click',function(){
          if(sol===b.dataset.s)return;
          sol=b.dataset.s; var t=st.temp; reset(); st.temp=t; snd('select');
          build(); predArm('sub'); checkPred();
        });
      });
      el.querySelectorAll('.dv-wow').forEach(function(b){ b.addEventListener('click',function(){ if(b.dataset.wow==='arm')wowArm(); else wowReveal(); }); });
      var r=el.querySelector('.dv-range');
      if(r)r.addEventListener('input',function(e){ st.temp=clamp(Math.round(+e.target.value),0,80);
        if(coolArmed){ coolArmed=false; clearDvFlash(); }   // 직접 온도 조작 시 예측 무장 해제
        if(mode==='free')predArm('temp');                    // v2 3층 — 온도 첫 조작 = 🔮
        var t=el.querySelector('.dv-temp'); if(t)t.textContent=st.temp+'℃'; renderStatus(); checkPred(); });
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
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); if(coolTimer)clearTimeout(coolTimer); };
  });
})();
