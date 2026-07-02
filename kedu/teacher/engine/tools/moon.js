/* ============================================================================
   케이랩 도구 모듈 — 달의 위상 (moon) v4  [과학 7호 · 천체 2호 · 탐구 표준 v2 3호]
   6학년 지구와 달의 운동 — 달의 위상 변화.
   하이브리드:
     ▸ 3D 공전 배치(위에서 본 시점) — 지구 중심, 달이 궤도 공전, 태양 평행광.
        달의 절반은 늘 태양 쪽이 밝음. 위치가 바뀔 뿐.
     ▸ 2D '지구에서 본 달' 패널 — 그 위치에서 보이는 위상(명암 경계=타원호).
   변수 → 현상 → 발견:
     위상 슬라이더(0~360°=달의 나이 0~29.5일)·▶공전 재생 → 달 공전 위치 →
     지구에서 보이는 달 모양 연동 →
     "달 모양이 변하는 건 달이 차고 이지러지는 게 아니라, 태양 빛 받는 면을
      지구에서 보는 각도가 달라지기 때문."
   - 의존: THREE (전역), window.KLab
   v3 · 3층: 미션 6단계(만들기↔생각형) + 🌀 만약에(스스로빛·공전멈춤·2배공전).
   v4 · 탐구 표준 v2 (redesigns/moon.md 카드 구현 — 미션·퀴즈·학년칸 100% 보존, 자유탐구만 증축):
       ▸ 1층 변수 개방: 🌙 달 잡기(무대 가로 드래그=궤도 위 달 이동, 중·고) ·
         공전 속도 0.5×~4× 슬라이더(고) · 💡 스스로 빛 토글(고, 만약에 glow의 상시 변수 승격) ·
         🕖 관측 시각 18시~새벽 6시 슬라이더(고, 저녁 하늘 패널의 '저녁 7시' 고정 해제 —
         남중 시각 = 12h + 위상/360×24h 기반 물리 배치)
       ▸ 2층 만약에 4종째: 🌗 달 궤도가 지구 궤도와 같은 평면이라면 — 매달 삭=일식·망=월식!
         (실제는 약 5° 기울어 대부분 비껴감 · 고학년 전용)
       ▸ 3층 예측 노트: 달 잡기·스스로 빛 첫 조작 = 🔮 예측 무장 → 확인 조건 도달 = 해소·칩.
         만약에 정리 = 자동 칩. 세션 칩 5개 = 꼬마 과학자 토스트 (earth·season 규약 공유).
       ▸ 4층 표현력: assets/textures/moon/moon.png 로드 성공 시 실사 달 텍스처 승급
         (+ earth/earth_day.png 재사용으로 지구도 승급) — 없으면 캔버스 그림 폴백(절대 안 깨짐).
   - config: { phase(0~360, 기본 180=보름), mode:"free"|"mission"|"quiz", grade }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  // ── 순수 계산(THREE 불필요)
  function illum(phi){ return (1-Math.cos(phi*Math.PI/180))/2; }   // 밝은 면적 비율 0~1
  function phaseInfo(phi){
    phi=((phi%360)+360)%360;
    if(phi<11||phi>349) return {k:'new',     nm:'삭 (신월)',   emo:'🌑'};
    if(phi<79)          return {k:'wax_cre', nm:'초승달',       emo:'🌒'};
    if(phi<101)         return {k:'first',   nm:'상현달',       emo:'🌓'};
    if(phi<169)         return {k:'wax_gib', nm:'상현~보름',    emo:'🌔'};
    if(phi<191)         return {k:'full',    nm:'보름달 (망)',  emo:'🌕'};
    if(phi<259)         return {k:'wan_gib', nm:'보름~하현',    emo:'🌖'};
    if(phi<281)         return {k:'last',    nm:'하현달',       emo:'🌗'};
    return                     {k:'wan_cre', nm:'그믐달',       emo:'🌘'};
  }
  // 2D 위상 path (중심 0,0 기준). limb 반원 + terminator 타원 합성으로 밝은 영역.
  function litPath(R, phi){
    phi=((phi%360)+360)%360;
    var rx=Math.abs(R*Math.cos(phi*Math.PI/180)).toFixed(2);
    var limbSweep = (phi<180)?1:0;     // 차오름=오른쪽 limb / 이지러짐=왼쪽 limb
    var termSweep;                      // 케이스별 terminator 볼록 방향
    if(phi<90)termSweep=1; else if(phi<180)termSweep=0; else if(phi<270)termSweep=1; else termSweep=0;
    return 'M 0 '+(-R)+' A '+R+' '+R+' 0 0 '+limbSweep+' 0 '+R+' A '+rx+' '+R+' 0 0 '+termSweep+' 0 '+(-R)+' Z';
  }

  window.KLab.register('moon', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var phase=(config.phase!=null)?config.phase:180;
    var playing=false, alive=true, last=0;
    /* ── v2 자유탐구 변수 (탐구 표준 v2 1층) ── */
    var grabMoon=false, spdV=1, glowV=false, hourV=19;
    /* ── v2 예측 노트 (3층) — 세션 메모리 칩, localStorage 불요 ── */
    var chips=[], chipDone=false;
    function snd(n){ if(window.KLab&&window.KLab.sound) window.KLab.sound.play(n); }
    function v2reset(){ grabMoon=false; spdV=1; glowV=false; hourV=19; eclState=''; }
    function effGlow(){ return glowV || (wif&&wif.active()&&wif.state.key==='glow'); }
    function planeOn(){ return wif&&wif.active()&&wif.state.key==='plane'; }
    function hourLabel(h){ h=+h; if(h<=20)return '저녁 '+(h-12)+'시'; if(h<24)return '밤 '+(h-12)+'시'; if(h===24)return '자정'; return '새벽 '+(h-24)+'시'; }
    /* ── 학년 칸 (헌법 3장) — 같은 위상 무대 공유, 노출·미션·만약에·모드탭만 칸별 스왑 ──
       저=모양이 바뀐다(관찰, 슬라이더만) / 중=규칙적 변화(재생+2배공전) / 고=위상 원리(스스로빛·삭의 비밀 풀버전). */
    var GRADES={
      low:  { modes:['free','mission','quiz'],           showPlay:false, mIdx:[0,2,3],        wif:[],                                v2:{},                                      hint:'슬라이더를 움직여 날마다 달 모양이 어떻게 바뀌는지 봐요.' },
      mid:  { modes:['free','mission','quiz','whatif'],   showPlay:true,  mIdx:[0,1,2,3,5],    wif:['fastm'],                         v2:{grab:true},                             hint:'▶ 공전 재생으로 달 모양이 규칙적으로 돌아오는 걸 봐요.' },
      high: { modes:['free','mission','quiz','whatif'],   showPlay:true,  mIdx:[0,1,2,3,4,5],  wif:['glow','stopm','fastm','plane'],  v2:{grab:true,spd:true,glow:true,hour:true}, hint:'💡 만약에로 위상의 비밀(반사광)을 파헤쳐 봐요.' }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; wif.reset(); mode='free'; mStep=0;mDone=false;mLock=false; playing=false; phase=180; dayCnt=0; v2reset();
      makeWif(); buildUI();
    }});
    function curMissions(){ return GRADES[grade].mIdx.map(function(i){return MISSIONS[i];}); }
    var C={ink:'#1B3A57',sub:'#8aa0b6',good:'#12B886'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    /* ───────────── 미션 6단계 (만들기 ↔ 생각형) ───────────── */
    var MISSIONS=[
      { type:'make', text:'🌒 달을 움직여 <b style="color:#7048E8;">초승달</b>(오른쪽 가는 낫)을 만들어 봐요 — 삭 직후예요!',
        check:function(){ return phaseInfo(phase).k==='wax_cre'; } },
      { type:'think', text:'🤔 방금 만든 초승달의 밝은 부분 — 저 빛은 <b style="color:#7048E8;">무엇 때문에</b> 빛날까요?',
        ch:['태양 빛을 반사해서','달이 스스로 빛나서','지구 빛을 받아서'], a:0,
        why:'달은 스스로 빛나지 않아요 — 거대한 거울처럼 태양 빛을 반사할 뿐! 그래서 태양 쪽 면만 밝아요.' },
      { type:'make', text:'🌓 달의 나이 약 7일 — <b style="color:#7048E8;">상현달</b>(오른쪽 반달)을 만들어 봐요!',
        check:function(){ return phaseInfo(phase).k==='first'; } },
      { type:'make', text:'🌕 약 15일 — <b style="color:#7048E8;">보름달(망)</b>! 달이 태양 반대편으로 가면?',
        check:function(){ return phaseInfo(phase).k==='full'; } },
      { type:'think', set:function(){ phase=0; },
        text:'🤔 지금 달은 <b style="color:#7048E8;">삭</b>(태양과 지구 사이) 위치예요. 달이 안 보이는 까닭은?',
        ch:['빛 받는 면이 태양 쪽이라 우리에겐 그늘진 면만 보여서','달이 잠시 사라져서','구름이 가려서'], a:0,
        why:'삭일 때도 달은 그 자리에! 다만 밝은 면이 전부 태양 쪽이라 지구에서는 깜깜한 뒷면만 보여요.' },
      { type:'make', text:'🌗 약 22일 — <b style="color:#7048E8;">하현달</b>(왼쪽 반달)까지 만들면 한 달 완성!',
        check:function(){ return phaseInfo(phase).k==='last'; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function advanceMission(){
      mLock=false;
      var CM=curMissions(); if(mStep<CM.length-1){ mStep++; if(CM[mStep].set)CM[mStep].set(); }
      else mDone=true;
      updateBars(); missionFoot(); render(); renderStatus();
    }
    function missionFoot(){
      var CM=curMissions(); ui.thinkFoot(el,{foot:'.mn-foot',bar:'.mn-bars'},(mode==='mission'&&!mDone&&CM[mStep]&&CM[mStep].type==='think')?CM[mStep]:null,advanceMission);
    }
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var m=curMissions()[mStep]; if(!m||m.type!=='make')return;
      if(m.check()){
        mLock=true; ui.toast(el,true);
        setTimeout(advanceMission,1500);
      }
    }
    function updateBars(){
      var host=el.querySelector('.mn-bars'); if(!host)return;
      if(mode==='mission'){var CM=curMissions();host.innerHTML=mDone?ui.doneBar():ui.missionBar(CM[mStep].text,mStep,CM.length);}
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else if(mode==='whatif')host.innerHTML=wif.barHTML();
      else host.innerHTML='';
    }

    /* ───────────── 🌀 만약에 (달의 규칙을 바꿔 보기) ───────────── */
    var dayCnt=0;
    var WHATIF={
      glow:{ icon:'💡', title:'달이 스스로 빛난다면?',
        q:'달이 전구처럼 스스로 빛나면, 달의 모양 변화는 어떻게 될까요?',
        ch:['항상 보름달 — 모양 변화가 사라져요','지금처럼 변해요','항상 초승달이에요'], a:0,
        reveal:'위상의 비밀 = 반사! 스스로 빛나면 어느 위치에서 봐도 둥근 보름달이에요. 모양이 변하는 건 태양 빛을 받는 면을 보는 각도가 달라지기 때문이었던 거죠.',
        tip:'▶ 공전 재생 — 달이 어디로 가도 \'지구에서 본 달\'이 늘 꽉 차 있어요!' },
      stopm:{ icon:'⏸', title:'달이 공전을 멈춘다면?',
        q:'달이 그 자리에 딱 멈추면, 밤마다 보는 달의 모양은?',
        ch:['매일 밤 같은 모양이에요','계속 변해요','달이 안 보이게 돼요'], a:0,
        reveal:'달 모양이 변하는 건 달이 지구를 공전하기 때문! 멈추면 평생 같은 달만 봐요 — 보름달에서 멈췄다면 매일 밤 보름달!',
        tip:'▶ 시간 흐르기 — 날짜가 흘러도 달 모양이 그대로예요!' },
      plane:{ icon:'🌗', title:'달 궤도가 지구 궤도와 같은 평면이라면?',
        q:'달·지구·태양이 언제나 딱 같은 평면에 있다면, 삭과 망 때 무슨 일이 벌어질까요?',
        ch:['매달 삭마다 일식, 망마다 월식이 일어나요','지금과 똑같아요','달이 아예 안 보이게 돼요'], a:0,
        reveal:'같은 평면이면 매달 삭=일식·망=월식! 실제 달 궤도는 약 5° 기울어 있어 그림자가 대부분 위아래로 비껴가요 — 삭인데도 일식이 드문 까닭이에요.',
        tip:'▶ 공전 재생 — 삭 자리를 지날 때 🌞 일식!, 망 자리를 지날 때 🔴 월식!' },
      fastm:{ icon:'⏩', title:'달이 2배 빨리 공전한다면?',
        q:'보름달에서 다음 보름달까지, 얼마나 걸릴까요?',
        ch:['보름(약 15일)으로 짧아져요','한 달 그대로예요','두 달이 걸려요'], a:0,
        reveal:'\'한 달\'의 길이는 달의 공전이 정해요! 2배 빨리 돌면 보름달→보름달이 15일 — 달력이 완전히 달라지겠죠?',
        tip:'▶ 공전 재생 — 위상이 두 배 빨리 휙휙 바뀌어요!' }
    };
    var wif;
    function makeWif(){
      var keys=GRADES[grade].wif, scen={};
      keys.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){buildUI();},
        footEl:function(){return el.querySelector('.mn-foot');},
        onSelect:function(k){ playing=false; dayCnt=0; phase=(k==='stopm')?180:(k==='plane'?150:45); eclState=''; },
        onPlay:function(){ dayCnt=0; },
        onExit:function(){ playing=false; dayCnt=0; phase=180; }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 달 잡기·스스로 빛: 첫 조작 = 🔮 예측 → 확인 조건 = 해소·칩 ── */
    var pred={ grab:{asked:false,ch:-1,done:false}, glowp:{asked:false,ch:-1,done:false,base:0} };
    var PRED={
      grab:{ q:'🔮 예측 먼저! 달을 궤도 어디에 두면 보름달이 될까요?',
        ch:['태양 쪽에 두면 보름달','태양 반대쪽에 두면 보름달','어디에 둬도 반달'],
        tip:'무대를 좌우로 끌어 달을 옮겨 보름달을 만들어 봐요!' },
      glowp:{ q:'🔮 예측 먼저! 달이 스스로 빛나면 달의 모양은 어떻게 될까요?',
        ch:['더 밝아질 뿐 모양은 지금처럼 변해요','어느 위치에 있든 늘 보름달이 돼요','달이 안 보이게 돼요'],
        tip:'켠 채로 달을 옮기며 오른쪽 위 \'지구에서 본 달\'을 지켜봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.mn-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="mn-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="mn-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.mn-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit,msg;
      if(kind==='grab'){
        hit=(p.ch===1);
        msg=hit?'✔ 예측 적중 — 보름달 자리는 태양 반대쪽(망)! 밝은 면을 지구에서 정면으로 보는 자리예요.'
           :'✘ 예측 빗나감 — 보름달 자리는 태양 반대쪽이에요! 태양 쪽(삭)에 두면 그늘진 뒷면만 보여 거의 안 보여요.';
      } else {
        hit=(p.ch===1);
        msg=hit?'✔ 예측 적중 — 스스로 빛나면 어느 위치든 보름달! 모양 변화의 비밀이 반사광이라는 증거예요.'
           :'✘ 예측 빗나감 — 어느 위치에 둬도 꽉 찬 보름달이 됐죠? 위상은 태양 빛 받는 면을 보는 각도가 만들어요.';
      }
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.mn-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(grabMoon&&pred.grab.ch>=0&&!pred.grab.done&&phaseInfo(phase).k==='full')predResolve('grab');
      if(glowV&&pred.glowp.ch>=0&&!pred.glowp.done){
        var d=Math.abs(((phase-pred.glowp.base)%360+540)%360-180);
        if(d>=25)predResolve('glowp');
      }
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 (earth·season 규약) ── */
    var CHIPNM={glow:'💡 스스로빛',stopm:'⏸ 공전멈춤',fastm:'⏩ 2배공전',plane:'🌗 같은평면',grab:'🌙 보름자리',glowp:'💡 빛토글'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🔭 꼬마 과학자 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.mn-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="mn-chip" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }

    /* ───────────── 퀴즈 ('지구에서 본 달'을 보고 답하기) ───────────── */
    var QUIZ=[
      { phase:180, q:'오른쪽 위 \'지구에서 본 달\'처럼 꽉 찬 달의 이름은?', ch:['보름달 (망)','초승달','하현달'], a:0 },
      { phase:90,  q:'오른쪽이 밝은 반달 — 이 달의 이름은?', ch:['상현달','하현달','그믐달'], a:0 },
      { phase:40,  q:'오른쪽 가는 낫 모양 — 이 달의 이름은?', ch:['초승달','보름달','하현달'], a:0 },
      { phase:180, q:'달의 모양이 날마다 변하는 까닭은?', ch:['태양 빛 받는 면을 보는 각도가 달라져서','달이 실제로 커졌다 작아져서','구름이 달을 가려서'], a:0 },
      { phase:0,   q:'달이 태양과 지구 사이에 있어 거의 안 보일 때를 뭐라고 할까요?', ch:['삭 (신월)','망 (보름)','상현'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      phase=QUIZ[qIdx].phase;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }
    function bindChoices(){
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); updateBars();
            var fc=el.querySelector('.mn-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(GRADES[grade].modes,mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var frozen=(wif.active()&&wif.state.key==='stopm');
      if(mode==='mission'){var CMB=curMissions();bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length);}
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); }
      /* ── v2 예측 노트 (3층) — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      /* ── v2 변수 행 (탐구 표준 v2 1층 — 자유탐구 전용, 학년 게이팅) ── */
      var g2=GRADES[grade].v2||{}, sbt='font-size:16px;padding:9px 13px;border-radius:12px;border:2.5px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
      var v2row='';
      if(mode==='free'&&(g2.grab||g2.spd||g2.glow||g2.hour)){
        v2row='<div class="mn-v2" style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +(g2.grab?('<button class="mn-grab" style="'+sbt+'border-color:#0B7285;'+(grabMoon?'background:#0B7285;color:#fff;':'background:#fff;color:#0B7285;')+'">'+(grabMoon?'✅ 달 놓기':'🌙 달 잡기')+'</button>'):'')
          +(g2.spd?('<span style="font-size:15px;font-weight:800;color:#5a7894;font-family:inherit;">공전 속도</span>'
            +'<input class="mn-spd" type="range" min="0.5" max="4" step="0.25" value="'+spdV+'" style="width:104px;">'
            +'<span class="mn-spdlab" style="font-size:15px;font-weight:800;color:#0B7285;min-width:40px;font-family:inherit;">'+spdV+'×</span>'):'')
          +(g2.glow?('<button class="mn-glowbtn" style="'+sbt+'border-color:#F59F00;'+(glowV?'background:#F59F00;color:#fff;':'background:#fff;color:#B26B00;')+'">'+(glowV?'💡 스스로 빛 ON':'💡 스스로 빛 OFF')+'</button>'):'')
          +(g2.hour?('<span style="font-size:15px;font-weight:800;color:#5a7894;font-family:inherit;">🕖 관측 시각</span>'
            +'<input class="mn-hour" type="range" min="18" max="30" step="1" value="'+hourV+'" style="width:118px;">'
            +'<span class="mn-hourlab" style="font-size:15px;font-weight:800;color:#0B7285;min-width:72px;font-family:inherit;">'+hourLabel(hourV)+'</span>'):'')
        +'</div>';
      }
      el.innerHTML='<style>.mn-btn:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.mn-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#10183A,#5C7CFA,#FFF3BF,#5C7CFA,#10183A);outline:none;}'
        +'.mn-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.mn-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}</style>'
        + top + '<div class="mn-bars">'+bar+'</div>' + v2row
        +((mode==='quiz'||(mode==='whatif'&&!wif.active()))?'<div style="display:none;">':'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">')
          +'<button class="mn-btn" data-act="day" style="font-size:18px;padding:11px 16px;border-radius:14px;border:3px solid #845EF7;background:#fff;color:#845EF7;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">📅 하루 뒤</button>'
          +(GRADES[grade].showPlay?('<button class="mn-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':(frozen?'▶ 시간 흐르기':'▶ 공전 재생'))+'</button>'):'')
          +'<input class="mn-range" type="range" min="0" max="360" step="1" value="'+phase+'" '+(frozen?'disabled':'')+' style="width:min(46vw,330px);'+(frozen?'opacity:.4;':'')+'">'
          +'<span class="mn-age" style="font-size:18px;font-weight:800;color:'+C.ink+';min-width:96px;text-align:center;font-family:inherit;"></span>'
        +'</div>'
        +'<div class="kl-stage-host" style="position:relative;"><div class="mn-stage" style="position:relative;width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 75% 25%,#10183A 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +(mode==='quiz'?'':'<div class="mn-texlab" style="position:absolute;top:12px;left:12px;font-size:12px;font-weight:800;color:#9fb6e6;background:rgba(8,12,26,0.55);padding:4px 9px;border-radius:9px;pointer-events:none;z-index:3;font-family:inherit;"></div>')
          +'<div class="mn-ecl" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;font-weight:800;padding:12px 20px;border-radius:16px;background:rgba(8,12,26,0.82);pointer-events:none;z-index:4;font-family:inherit;"></div>'
          +'<div class="mn-panel" style="position:absolute;top:12px;right:12px;width:118px;text-align:center;pointer-events:none;">'
            +'<svg class="mn-moon2d" viewBox="-55 -55 110 110" width="104" height="104"><circle cx="0" cy="0" r="50" fill="#1A2440" stroke="#3a4a6a" stroke-width="2"/><path class="mn-lit" d="" fill="#FDF6D8"/></svg>'
            +'<div style="font-size:13px;color:#cdd6e6;font-weight:800;margin-top:2px;">지구에서 본 달</div>'
          +'</div>'
          +(mode==='quiz'?'':'<div class="mn-evening" style="position:absolute;bottom:12px;left:12px;width:208px;text-align:center;pointer-events:none;background:rgba(8,12,26,0.62);border-radius:14px;padding:7px 6px 5px;">'
            +'<svg class="mn-evsky" viewBox="-78 -46 156 84" width="200" height="108">'
              +'<defs><linearGradient id="mnEv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16224a"/><stop offset="1" stop-color="#41356b"/></linearGradient></defs>'
              +'<rect x="-78" y="-46" width="156" height="76" fill="url(#mnEv)" rx="6"/>'
              +'<g class="mn-evg"></g>'
              +'<line x1="-74" y1="30" x2="74" y2="30" stroke="#6b8a4a" stroke-width="3"/>'
              +'<rect x="-74" y="30" width="148" height="4" fill="#3f5a28"/>'
              +'<text x="-66" y="27" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">동</text>'
              +'<text x="0" y="27" text-anchor="middle" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">남</text>'
              +'<text x="66" y="27" text-anchor="end" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">서</text>'
            +'</svg>'
            +'<div class="mn-evcap" style="font-size:12px;color:#cdd6e6;font-weight:800;margin-top:1px;">여러 날 저녁 7시, 남쪽 하늘</div>'
          +'</div>')
        +'</div></div>'
        +'<div class="mn-foot">'+foot+'</div>'
        +'<div class="mn-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="mn-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; playing=false; phase=180; dayCnt=0; v2reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindV2(); bindChoices(); bands.bind(el); renderChips(); texLabel();
      if(mode==='whatif')wif.bind(el);
      if(mode==='mission')missionFoot();
      render(); renderStatus();
    }

    var stage,scene,camera,renderer,moonMesh,earthMesh,orbitR=4.2;
    /* ── v2 4층: 실사 텍스처 승급 로더 — 없으면 캔버스 그림 폴백(절대 안 깨짐) ── */
    var texRealM=false, texTriedM=false, texImgM=null;   // 달 (moon/moon.png)
    var texTriedE=false, texImgE=null;                   // 지구 (earth/earth_day.png 재사용)
    function loadTexM(){
      if(texTriedM)return; texTriedM=true;
      try{
        var im=new Image();
        im.onload=function(){ texImgM=im; texRealM=true; applyTexM(); texLabel(); render(); };
        im.onerror=function(){ texRealM=false; texLabel(); };
        im.src='/kedu/teacher/engine/tools/assets/textures/moon/moon.png';
      }catch(e){ texRealM=false; }
    }
    function loadTexE(){
      if(texTriedE)return; texTriedE=true;
      try{
        var im=new Image();
        im.onload=function(){ texImgE=im; applyTexE(); render(); };
        im.onerror=function(){};
        im.src='/kedu/teacher/engine/tools/assets/textures/earth/earth_day.png';
      }catch(e){}
    }
    function applyTexM(){
      if(!texImgM||!moonMesh)return;
      try{
        var c=document.createElement('canvas'); c.width=texImgM.naturalWidth||1024; c.height=texImgM.naturalHeight||512;
        var x=c.getContext('2d'); if(!x||!x.drawImage)return;
        x.drawImage(texImgM,0,0);
        moonMesh.material.map=new T.CanvasTexture(c); moonMesh.material.needsUpdate=true;
      }catch(e){}
    }
    function applyTexE(){
      if(!texImgE||!earthMesh)return;
      try{
        var c=document.createElement('canvas'); c.width=texImgE.naturalWidth||1024; c.height=texImgE.naturalHeight||512;
        var x=c.getContext('2d'); if(!x||!x.drawImage)return;
        x.drawImage(texImgE,0,0);
        earthMesh.material.map=new T.CanvasTexture(c); earthMesh.material.needsUpdate=true;
      }catch(e){}
    }
    function texLabel(){
      var lb=el.querySelector('.mn-texlab'); if(!lb)return;
      lb.textContent=texRealM?'🖼️ 실사 달 텍스처':'🎨 기본 그림 달';
    }
    function moonTexture(){   // 캔버스 폴백 — 밝은 회색 표면 + 크레이터 + 어두운 바다
      var c=document.createElement('canvas'); c.width=512; c.height=256; var x=c.getContext('2d');
      try{
        x.fillStyle='#D5D8DE'; x.fillRect(0,0,512,256);
        x.fillStyle='#AEB4BF';                                              // 바다(어두운 평원)
        [[120,90,58,40],[300,140,70,44],[400,70,42,30]].forEach(function(b){
          x.beginPath(); x.ellipse(b[0],b[1],b[2],b[3],0,0,7); x.fill();});
        x.fillStyle='#BFC5CF';                                              // 크레이터
        [[60,50,13],[200,180,16],[350,200,10],[460,150,12],[90,190,9],[250,60,11],[430,40,8],[160,130,7]].forEach(function(b){
          x.beginPath(); x.arc(b[0],b[1],b[2],0,7); x.fill();
          x.strokeStyle='#9AA1AE'; x.lineWidth=2; x.stroke();});
      }catch(e){}
      return new T.CanvasTexture(c);
    }
    function initThree(){
      if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
      stage=el.querySelector('.mn-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||360;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(42,W/H,0.1,100);
      renderer=new T.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff,0.13));
      var sun=new T.DirectionalLight(0xffffff,1.6); sun.position.set(50,0,0); scene.add(sun);  // 태양 +X
      // 지구 — v2 4층: earth_day.png 재사용 승급(로드 성공 시), 폴백=기존 단색
      earthMesh=new T.Mesh(new T.SphereGeometry(1.05,40,28), new T.MeshStandardMaterial({color:0x2b6cb0,roughness:1,metalness:0}));
      scene.add(earthMesh);
      // 궤도 링(가늘게)
      var ring=new T.Mesh(new T.RingGeometry(orbitR-0.03,orbitR+0.03,72), new T.MeshBasicMaterial({color:0x3a4a6a,side:T.DoubleSide,transparent:true,opacity:0.5}));
      ring.rotation.x=Math.PI/2; scene.add(ring);
      // 달
      moonMesh=new T.Mesh(new T.SphereGeometry(0.42,32,24), new T.MeshStandardMaterial({color:0xffffff,map:moonTexture(),roughness:1,metalness:0}));
      scene.add(moonMesh);
      loadTexM(); if(texImgM)applyTexM();
      loadTexE(); if(texImgE)applyTexE();
      // 태양 표식
      var sc=document.createElement('canvas'); sc.width=128; sc.height=128; var sx=sc.getContext('2d');
      var g=sx.createRadialGradient(64,64,8,64,64,60); g.addColorStop(0,'#FFF7D6'); g.addColorStop(0.5,'#FFD43B'); g.addColorStop(1,'rgba(255,212,59,0)');
      sx.fillStyle=g; sx.fillRect(0,0,128,128);
      var sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc),transparent:true,depthTest:false}));
      sunSpr.position.set(8.5,0,0); sunSpr.scale.set(3.4,3.4,1); scene.add(sunSpr);
      theta=0.6; phi=0.42; camPos();   // 거의 위에서 내려다봄
    }
    var theta=0.6, phi=0.42, radius=12;
    function camPos(){ if(!camera)return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }

    function evAge(){ var a=Math.round((((phase%360)+360)%360)/12); return a===0?30:a; }
    /* v2 1층: 관측 시각 일반화 — 남중 시각 T = 12h + 위상/360×24h, 시간각 HA=(h−T)×15° */
    function evPos(pp,h){
      var Tt=12+pp/360*24;
      var dh=h-Tt; dh=((dh%24)+24)%24; if(dh>12)dh-=24;
      var HA=dh*15;
      if(Math.abs(HA)>=88)return {vis:false,HA:HA};
      return {vis:true,x:HA/90*70,y:28-Math.cos(HA*Math.PI/180)*40,HA:HA};
    }
    function renderEvening(){
      var g=el.querySelector('.mn-evg'); if(!g)return;
      g.innerHTML='';
      function S(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
      var pp=effGlow()?180:(((phase%360)+360)%360);
      var cap=el.querySelector('.mn-evcap');
      if(cap)cap.textContent=hourLabel(hourV)+', 남쪽 하늘 · 달 나이 '+evAge()+'일';
      function msg(txt){
        var t=S('text',{x:0,y:-4,'text-anchor':'middle',fill:'#9fb6e6','font-size':10,'font-weight':800,'font-family':'inherit'});
        t.textContent=txt; g.appendChild(t);
      }
      if(pp<15||pp>345){ msg('삭 무렵 — 달이 보이지 않아요'); return; }
      var ev=evPos(pp,hourV);
      if(!ev.vis){ msg((ev.HA<0)?'이 시각엔 아직 안 떴어요 (더 늦게 떠요)':'이 시각엔 이미 졌어요 (다음에 다시 떠요)'); return; }
      for(var d=-2;d<=2;d++){                   // 며칠 전후 자취 — '날마다 동쪽으로'
        if(d===0)continue;
        var p2=((pp+d*12)%360+360)%360; if(p2<15||p2>345)continue;
        var e2=evPos(p2,hourV); if(!e2.vis)continue;
        g.appendChild(S('circle',{cx:e2.x.toFixed(1),cy:e2.y.toFixed(1),r:2.2,fill:'#8d9dc8',opacity:0.45}));
      }
      var grp=S('g',{transform:'translate('+ev.x.toFixed(1)+','+ev.y.toFixed(1)+') scale(0.17)'});
      grp.appendChild(S('circle',{cx:0,cy:0,r:50,fill:'#1A2440',stroke:'#3a4a6a','stroke-width':3}));
      var lp=S('path',{fill:'#FDF6D8',class:'mn-evmoon'}); lp.setAttribute('d',litPath(50,pp)); grp.appendChild(lp);
      g.appendChild(grp);
      if(pp>40&&pp<196&&hourV<=20){
        var ar=S('text',{x:Math.min(ev.x+14,46),y:Math.max(ev.y-9,-38),fill:'#FFD43B','font-size':9,'font-weight':800,'font-family':'inherit'});
        ar.textContent='← 날마다 동쪽으로'; g.appendChild(ar);
      }
    }
    var eclState='';
    function renderEclipse(){   // v2 2층: 🌗 같은 평면 만약에 — 삭=일식·망=월식 연출
      var b=el.querySelector('.mn-ecl'); if(!b)return '';
      var pp=((phase%360)+360)%360, cur='';
      if(planeOn()){
        if(pp<12||pp>348)cur='sun';
        else if(Math.abs(pp-180)<12)cur='moon';
      }
      if(cur!==eclState){ if(cur)snd('whoosh'); eclState=cur; }
      if(cur==='sun'){ b.style.display='block'; b.style.color='#FFD43B'; b.textContent='🌞→🌑 일식! 달이 태양을 가려요'; }
      else if(cur==='moon'){ b.style.display='block'; b.style.color='#FF8787'; b.textContent='🔴 월식! 지구 그림자가 달을 가려요'; }
      else b.style.display='none';
      return cur;
    }
    function render(){
      // 달 공전 위치: φ=0 신월(+X 태양쪽), φ=180 보름(-X), φ=90 +Z
      var rad=phase*Math.PI/180;
      if(moonMesh) moonMesh.position.set(Math.cos(rad)*orbitR, 0, Math.sin(rad)*orbitR);
      var ecl=renderEclipse();
      // 2D 패널
      var lit=el.querySelector('.mn-lit');
      if(lit){
        lit.setAttribute('d', litPath(50, effGlow()?180:phase));
        lit.setAttribute('fill', ecl==='moon'?'#D9480F':'#FDF6D8');   // 월식 = 구릿빛 달
      }
      renderEvening();
      checkPred();
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(playing){ if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
        if(wif.active()&&wif.state.key==='stopm'){ dayCnt+=dt*8; renderStatus(); render(); requestAnimationFrame(loop); return; }
        var spd=(wif.active()&&wif.state.key==='fastm')?60:30*spdV;   /* v2: 자유탐구 공전 속도 변수 */
        phase=(phase+dt*spd)%360;                 // 약 12초에 한 바퀴 (2배 공전이면 6초)
        var r=el.querySelector('.mn-range'); if(r)r.value=phase;
        render(); renderStatus();
      }
      requestAnimationFrame(loop);
    }

    function ageStr(){ var d=phase/360*29.5; return '약 '+d.toFixed(1)+'일'; }
    function renderStatus(){
      if(mode==='quiz'){ var sq=el.querySelector('.mn-status'); if(sq)sq.innerHTML='<div style="font-size:19px;color:#8aa0b6;">오른쪽 위 \'지구에서 본 달\'과 달의 위치를 보고 답을 골라요!</div>'; return; }
      if(mode==='whatif'){
        var sw=el.querySelector('.mn-status'); if(!sw)return;
        if(wif.state.phase==='pick'){ sw.innerHTML='<div style="font-size:19px;color:#8aa0b6;">카드를 골라 달의 규칙을 바꿔 봐요 — 상상이 곧 실험!</div>'; return; }
        if(wif.state.phase==='predict'){ sw.innerHTML='<div style="font-size:19px;color:#8aa0b6;">정답 걱정 없이 네 생각을 먼저 골라요 — 그게 과학자의 첫걸음!</div>'; return; }
        if(wif.state.key==='stopm'){ sw.innerHTML='<div style="font-size:32px;color:#0B7285;">📅 +'+Math.floor(dayCnt)+'일</div><div style="font-size:18px;color:#8aa0b6;margin-top:3px;">날짜가 흘러도 달 모양은 그대로 — 위상은 공전이 만들어요!</div>'; return; }
        if(wif.state.key==='glow'){ sw.innerHTML='<div style="font-size:20px;color:#0B7285;">💡 스스로 빛나는 달 — 어느 위치든 \'지구에서 본 달\'이 꽉 차 있죠?</div>'; return; }
        if(wif.state.key==='plane'){ sw.innerHTML='<div style="font-size:20px;color:#0B7285;">🌗 같은 평면 — 삭 자리에서 🌞 일식, 망 자리에서 🔴 월식! ▶ 재생으로 궤도를 돌려 봐요.</div>'; return; }
        sw.innerHTML='<div style="font-size:20px;color:#0B7285;">⏩ 2배 공전 — 초승→보름→그믐이 두 배 빨리! 한 달이 보름이 됐어요.</div>'; return;
      }
      var info=phaseInfo(phase), pct=Math.round(illum(phase)*100);
      var age=el.querySelector('.mn-age'); if(age)age.textContent=info.emo+' '+ageStr();
      var s=el.querySelector('.mn-status'), sub;
      if(info.k==='new') sub='달이 태양과 지구 사이에 있어요. 밝은 면이 태양 쪽(반대편)이라 지구에선 거의 안 보여요.';
      else if(info.k==='full') sub='달이 태양 반대편에 있어요. 밝은 면을 지구에서 정면으로 봐서 꽉 찬 달이에요.';
      else if(info.k==='first'||info.k==='last') sub='달이 옆쪽에 있어요. 밝은 면의 절반만 지구에서 보여 반달이에요.';
      else if(info.k.indexOf('cre')>=0) sub='밝은 면이 거의 태양 쪽이라, 지구에선 가느다란 낫 모양만 보여요.';
      else sub='밝은 면 대부분이 지구를 향해 불룩하게 보여요.';
      s.innerHTML='<div style="font-size:25px;color:#FFF3BF;">'+info.emo+' '+info.nm+' · 밝기 '+pct+'%</div>'
        +'<div style="font-size:17px;color:#5a7894;margin-top:5px;">'+sub+'</div>'
        +'<div style="font-size:15px;color:#8aa0b6;margin-top:4px;">달은 스스로 빛나지 않아요. 태양 빛 받는 면을 지구에서 보는 각도가 달라져 모양이 변해요.</div>'
        +((mode==='free'&&grabMoon)?'<div class="mn-grabhint" style="font-size:15px;color:#0B7285;margin-top:4px;">🌙 무대를 좌우로 끌어 달을 궤도 위에서 직접 옮겨요!</div>':'')
        +((mode==='free'&&glowV)?'<div class="mn-glowhint" style="font-size:15px;color:#B26B00;margin-top:2px;">💡 스스로 빛 ON — 위치를 바꿔도 \'지구에서 본 달\'이 변하는지 봐요!</div>':'');
      checkMission();
    }
    function setPhase(v){ phase=((v%360)+360)%360; var r=el.querySelector('.mn-range'); if(r&&+r.value!==phase)r.value=phase; render(); renderStatus(); }
    /* ── v2 변수 컨트롤 바인딩 (자유탐구 전용) ── */
    function bindV2(){
      var gb=el.querySelector('.mn-grab');
      if(gb)gb.addEventListener('click',function(){
        grabMoon=!grabMoon; snd('select');
        gb.textContent=grabMoon?'✅ 달 놓기':'🌙 달 잡기';
        gb.style.background=grabMoon?'#0B7285':'#fff'; gb.style.color=grabMoon?'#fff':'#0B7285';
        if(stage)stage.style.cursor=grabMoon?'ew-resize':'grab';
        if(grabMoon)predArm('grab');
        renderStatus();
      });
      var sp=el.querySelector('.mn-spd');
      if(sp)sp.addEventListener('input',function(e){
        spdV=+e.target.value;
        var lb=el.querySelector('.mn-spdlab'); if(lb)lb.textContent=spdV+'×';
      });
      var gl=el.querySelector('.mn-glowbtn');
      if(gl)gl.addEventListener('click',function(){
        glowV=!glowV; snd('select');
        gl.textContent=glowV?'💡 스스로 빛 ON':'💡 스스로 빛 OFF';
        gl.style.background=glowV?'#F59F00':'#fff'; gl.style.color=glowV?'#fff':'#B26B00';
        if(glowV){ pred.glowp.base=phase; predArm('glowp'); }
        render(); renderStatus();
      });
      var hr=el.querySelector('.mn-hour');
      if(hr)hr.addEventListener('input',function(e){
        hourV=+e.target.value;
        var lb=el.querySelector('.mn-hourlab'); if(lb)lb.textContent=hourLabel(hourV);
        renderEvening();
      });
    }
    var _mv,_up;
    function bind(){
      var rg=el.querySelector('.mn-range'); if(rg)rg.addEventListener('input',function(e){ if(playing)togglePlay(); setPhase(+e.target.value); });
      var db=el.querySelector('[data-act="day"]'); if(db)db.addEventListener('click',function(){ if(playing)return; phase=(phase+12)%360; var r=el.querySelector('.mn-range'); if(r)r.value=phase; render(); renderStatus(); });
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',togglePlay);
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;
        if(grabMoon&&mode==='free'){                    /* v2: 달 잡기 — 가로 드래그 = 궤도 위 달 이동 */
          if(playing)togglePlay();
          setPhase(phase+(p.clientX-px)*0.7);
          px=p.clientX;py=p.clientY;
          if(e.touches)e.preventDefault(); return;
        }
        theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.2,Math.min(1.4,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
      function up(){drag=false;if(stage)stage.style.cursor='grab';}
      stage.addEventListener('mousedown',dn); stage.addEventListener('touchstart',dn,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){mv(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      _mv=mv;_up=up; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    }
    function togglePlay(){ playing=!playing; last=0;
      var b=el.querySelector('[data-act="play"]'); if(!b)return;
      b.textContent=playing?'■ 멈춤':'▶ 공전 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
