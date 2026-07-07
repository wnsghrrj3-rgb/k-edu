/* ============================================================================
   케이랩 도구 모듈 — 소리·진동 (sound) v4  [과학 5호 · 탐구 표준 v2]
   3학년 소리의 성질.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 탐구 미션 4종 — 🔊 큰 / 🔉 작은 / ⬆️ 높은 / ⬇️ 낮은 소리 만들기.
     ▸ 슬라이더 현재값 표시(크기 1~5·높이 1~8)로 변수-현상 연결 강화.
     ▸ 발견 안내 — "진폭만 바꾸면 크기만, 진동수만 바꾸면 높이만 달라진다"
        (한 변수만 움직였을 때 감지해 분리 인과를 짚어 줌).
   탐구 표준 v2 (4층):
     1층 변수 개방 — 매질 2종 → 4종(💨공기 343 · 💧물 1,500 · 🔩철 5,100 · 🌌진공 0 m/s).
       파동 링 속도가 매질 따라 실제로 달라짐 + 상태줄 속도 표기. 고학년 전용.
     2층 만약에 — 💧 물속 대화(공기보다 4배 잘 전달 = 고래의 노래, 고) ·
       🦇 소리로 보기(벽 왕복 메아리 = 박쥐·소나, 신규 반사 물리) ·
       ⚡ 번개와 천둥(1km당 3초 = 소리의 속력). 중=🦇⚡, 고=3종.
       ※ 진공 무음은 라이브 토글·미션이 이미 교습 → 만약에 재탕 금지(strata·heat 원칙).
     3층 예측 노트 — 매질(물·철)·진공 첫 선택 = 🔮 무장 → 해소·칩·5칩 = 🎵 꼬마 소리탐정.
     4층 — 3D 미전환·SVG 유지(파형·파동 링 2D가 원리 그 자체). 신규 자산 0.
   변수 → 현상 → 발견:
     진폭(소리 크기)·진동수(소리 높이) 슬라이더 → 파형·떨림·실제 음 →
     "소리는 떨림(진동). 크게 떨리면 큰 소리, 빠르게 떨리면 높은 소리."
   - 의존: window.KLab (SVG + rAF + Web Audio, 오디오는 안전 try/catch)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 움직이는 파형을 보고 답하기.
   - config: { amp(1~5,기본3), freq(1~8,기본3), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wave:'#7048E8',speaker:'#495057',ink:'#1B3A57',sub:'#5a7894',ring:'#9775FA',good:'#12B886'};
  window.KLab.register('sound', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var amp=config.amp||3, freq=config.freq||3, playing=false, raf=null, ph=0;
    var medium='air', triedVacuum=false;   // 고학년 매질 — 진공이면 무음
    /* ── v2 1층 — 매질 4종(전달 속도 = 매질의 지문) + 만약에 미니 무대 상태 ── */
    var MEDIA={ air:{nm:'공기',ic:'💨',v:343,spd:1}, water:{nm:'물',ic:'💧',v:1500,spd:2.1}, iron:{nm:'철',ic:'🔩',v:5100,spd:3.4}, vacuum:{nm:'진공',ic:'🌌',v:0,spd:1} };
    var ec={ wall:620, p:-1, phase:'idle', f:0, done:0 };      // 🦇 메아리: 펄스 x·왕복 프레임
    var th={ km:2, phase:'idle', f:0 };                        // ⚡ 번개: 1km=30프레임(시각 3초)
    function v2reset(){ ec={wall:620,p:-1,phase:'idle',f:0,done:0}; th={km:2,phase:'idle',f:0}; }
    function wifKey(){ return (mode==='whatif'&&wif&&wif.active())?wif.state.key:null; }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n); }
    var actx=null, osc=null, gain=null, lastK=null;
    var btn='font-size:22px;padding:11px 20px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, SPK={x:135,y:230}, X0=235, X1=850, MID=230;

    function hz(){return 200+freq*80;}
    function vol(){return medium==='vacuum'?0:amp*0.04;}

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'🔊 진폭 슬라이더로 <b style="color:#7048E8;">가장 큰 소리</b>를 만들어 봐요!',
        check:function(){ return amp>=5; } },
      { text:'🔉 이번엔 <b style="color:#7048E8;">가장 작은 소리</b> — 파형이 어떻게 변하나요?',
        check:function(){ return amp<=1; } },
      { text:'⬆️ 진동수 슬라이더로 <b style="color:#7048E8;">가장 높은 소리</b>를 만들어 봐요!',
        check:function(){ return freq>=8; } },
      { text:'⬇️ 마지막 — <b style="color:#7048E8;">가장 낮은 소리</b>! 파형이 느긋해져요.',
        check:function(){ return freq<=1; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=떨림이 소리 / 중=크기·높이 분리(진폭/진동수) / 고=매질·진공(소리는 무엇을 타고 오나, 매질 기능 신규). */
    var LOW_MISSIONS=[
      { text:'🥁 ▶ <b style="color:#7048E8;">소리 듣기</b>를 눌러, 소리가 날 때 파형이 떨리는 걸 봐요! 떨림이 곧 소리예요.',
        check:function(){ return playing; } },
      { text:'🔊 <b style="color:#7048E8;">진폭(크기) 슬라이더</b>를 올려 큰 소리를 만들어 봐요 — 떨림이 더 커져요!',
        check:function(){ return amp>=4; } }
    ];
    var MEDIUM_MISSIONS=[
      { text:'🌌 <b style="color:#7048E8;">매질을 진공</b>으로 바꾸고 ▶ 소리를 들어봐요 — 소리가 들릴까요?',
        check:function(){ return medium==='vacuum' && triedVacuum; } },
      { text:'💨 다시 <b style="color:#7048E8;">공기</b>로 바꿔 봐요 — 소리는 공기(매질)를 타고 우리 귀에 와요!',
        check:function(){ return medium==='air' && triedVacuum; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],                  missions:LOW_MISSIONS,                     showMedium:false, wif:[] },
      mid:  { modes:['free','mission','quiz','whatif'],  missions:MISSIONS,                         showMedium:false, wif:['echo','thunder'] },
      high: { modes:['free','mission','quiz','whatif'],  missions:MISSIONS.concat(MEDIUM_MISSIONS), showMedium:true,  wif:['water','echo','thunder'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return GRADES[grade].missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; amp=3; freq=3; medium='air'; triedVacuum=false; lastK=null; v2reset();
      if(wif)wif.reset(); makeWif();
      buildUI();
    }});

    /* ───────────── 🌀 만약에 (v2 2층 — 진공 재탕 없이 신선한 반사실 3종) ───────────── */
    var WHATIF={
      water:{ icon:'💧', title:'물속에서 친구와 말한다면?',
        q:'물속에서 친구가 말하면 소리가 들릴까요?',
        ch:['물이 막아서 안 들려요','들려요 — 공기보다 더 잘 전달돼요','물 밖으로만 들려요'], a:1,
        reveal:'소리는 매질이 촘촘할수록 잘 전달돼요! 물속에선 공기보다 4배(약 1,500m/s), 쇠 속에선 15배(약 5,100m/s) 빨라요. 고래가 수백 km 밖 친구와 노래로 대화하고, 기찻길에 귀를 대면 기차 소리를 먼저 듣는 비밀이에요.',
        tip:'💨💧🔩 매질을 바꿔 ▶ 들어 봐요 — 물결(파동)의 빠르기를 비교!' },
      echo:{ icon:'🦇', title:'소리로 앞을 볼 수 있다면?',
        q:'캄캄한 동굴에서 "야호!" 외치면 소리는 어떻게 될까요?',
        ch:['벽을 그냥 통과해요','벽에 부딪혀 되돌아와요 (메아리)','벽에 스며들어 사라져요'], a:1,
        reveal:'소리는 벽에 부딪히면 빛처럼 튕겨 돌아와요 — 메아리! 박쥐와 돌고래는 이 되돌아오는 시간으로 캄캄한 곳의 거리를 "봐요"(초음파). 병원 초음파 검사, 배가 바다 깊이를 재는 소나도 모두 이 원리랍니다.',
        tip:'📢 야호! 를 누르고 — 벽 거리를 바꿔 되돌아오는 시간을 비교해 봐요!' },
      thunder:{ icon:'⚡', title:'번개는 번쩍! 천둥은 왜 늦게 올까?',
        q:'번개가 치면 번쩍(빛)과 우르릉(소리)은 어떻게 도착할까요?',
        ch:['동시에 도착해요','빛이 먼저, 소리는 한참 뒤에 와요','소리가 먼저 와요'], a:1,
        reveal:'빛은 1초에 지구 7바퀴 반 — 사실상 순간! 소리는 1초에 약 340m뿐이에요. 그래서 번쩍 후 우르릉까지 3초면 번개는 약 1km 밖. 번쩍~우르릉 초를 세면 번개까지 거리를 잴 수 있어요 — 폭풍이 다가오는지 아는 안전 지혜!',
        tip:'⚡ 번개! 를 누르고 초를 세 봐요 — 거리를 바꾸면 어떻게 될까요?' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ buildUI(); },
        footEl:function(){ return el.querySelector('.sd-foot'); },
        onSelect:function(k){ v2reset(); medium='air'; playing=false; stopAudio(); },
        onPlay:function(k){
          if(k==='water'){ medium='water'; amp=3; freq=3; }
          else if(k==='echo'){ v2reset(); }
          else { v2reset(); }
        },
        onExit:function(){ v2reset(); medium='air'; playing=false; stopAudio(); }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 매질(물·철)·진공 첫 선택 = 🔮 예측 → 재생 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ med:{asked:false,ch:-1,done:false}, vac:{asked:false,ch:-1,done:false} };
    var PRED={
      med:{ q:'🔮 예측 먼저! 물속·쇠 속에서 소리는 어떻게 될까요?',
        ch:['막혀서 안 들린다','공기보다 오히려 잘 전달된다','공기와 똑같다'],
        tip:'💧물·🔩철을 고르고 ▶ 들어 봐요 — 물결 빠르기도 지켜봐요!' },
      vac:{ q:'🔮 예측 먼저! 아무것도 없는 진공에서 소리는?',
        ch:['그대로 들린다','안 들린다 — 전달할 것이 없다','더 크게 들린다'],
        tip:'🌌 진공에서 ▶ 를 눌러 봐요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.sd-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="sd-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="sd-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.sd-pch').forEach(function(b){
        b.addEventListener('click',function(){
          pred[kind].ch=+b.dataset.v; snd('select');
          fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:#0B7285;font-family:inherit;">📝 예측 접수! '+PRED[kind].tip+'</div>';
          checkPred();
        });
      });
    }
    function predResolve(kind){
      var p=pred[kind]; if(p.done||p.ch<0)return; p.done=true;
      var hit=(p.ch===1), msg;
      if(kind==='med') msg=hit?'✔ 예측 적중 — 물속에선 4배, 쇠 속에선 15배 빨리 전달돼요! 매질이 촘촘할수록 떨림이 잘 옮아가요.'
                              :'✘ 예측 빗나감 — 물·쇠는 공기보다 오히려 잘 전달해요! 고래의 노래·기찻길 귀 대기의 비밀이에요.';
      else msg=hit?'✔ 예측 적중 — 진공엔 떨림을 옮겨 줄 것이 없어 소리가 못 가요! 소리는 매질이 꼭 필요해요.'
                  :'✘ 예측 빗나감 — 진공에선 안 들려요! 소리는 공기 같은 매질을 타고 오거든요. 우주는 완전한 고요예요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.sd-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.med.ch>=0&&!pred.med.done&&(medium==='water'||medium==='iron')&&playing)predResolve('med');
      if(pred.vac.ch>=0&&!pred.vac.done&&medium==='vacuum'&&playing)predResolve('vac');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={water:'💧 물속대화',echo:'🦇 메아리',thunder:'⚡ 번개천둥',med:'🔩 매질예측',vac:'🌌 진공예측'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🎵 꼬마 소리탐정 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.sd-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="sd-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }
    /* ── v2 만약에 액션 — 📢 야호(펄스 왕복) · ⚡ 번개(빛 즉시·소리 지연) ── */
    function yell(){
      if(ec.phase==='go'||ec.phase==='back')return;
      ec.p=210; ec.phase='go'; ec.f=0; snd('tap');
      renderStatus();
    }
    function bolt(){
      th.phase='wait'; th.f=0; snd('charge');
      renderStatus();
    }
    function checkMissionStep(){
      if(mode!=='mission'||mDone||mLock)return;
      if(curMissions()[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<curMissions().length-1)mStep++; else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (파형 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { amp:5, freq:3, q:'파형이 이렇게 크게 떨리면 어떤 소리일까요?', ch:['큰 소리','작은 소리','높은 소리'], a:0 },
      { amp:1, freq:3, q:'파형이 이렇게 작게 떨리면 어떤 소리일까요?', ch:['작은 소리','큰 소리','낮은 소리'], a:0 },
      { amp:3, freq:8, q:'파형이 이렇게 촘촘하면 어떤 소리일까요?', ch:['높은 소리','낮은 소리','큰 소리'], a:0 },
      { amp:3, freq:1, q:'파형이 이렇게 느긋하면 어떤 소리일까요?', ch:['낮은 소리','높은 소리','작은 소리'], a:0 },
      { amp:3, freq:3, q:'소리는 무엇 때문에 생길까요?', ch:['물체의 떨림(진동)','물체의 색깔','물체의 무게'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      amp=QUIZ[qIdx].amp; freq=QUIZ[qIdx].freq; lastK=null;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var medBtns='';
      if(G().showMedium){
        var medKeys=['air','water','iron','vacuum'];
        medBtns='<span style="width:6px;"></span>'+medKeys.map(function(k){
          var M=MEDIA[k], on=(medium===k), col=(k==='vacuum'?'#1E40AF':(k==='air'?'#15803D':(k==='water'?'#1971C2':'#495057')));
          return '<button class="sd-med" data-med="'+k+'" style="font-size:18px;padding:9px 12px;border-radius:13px;border:3px solid '+col+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(on?('background:'+col+';color:#fff;'):('background:#fff;color:'+col+';'))+'">'+M.ic+' '+M.nm+'</button>';
        }).join('');
      }
      var ctrl='<div style="display:flex;gap:18px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<span class="sd-lab">소리 크기(진폭)</span><input class="sd-range" data-k="amp" type="range" min="1" max="5" value="'+amp+'" style="width:min(26vw,170px);"><span class="sd-val" data-v="amp">'+amp+'/5</span>'
          +'<span class="sd-lab">소리 높이(진동수)</span><input class="sd-range" data-k="freq" type="range" min="1" max="8" value="'+freq+'" style="width:min(26vw,170px);"><span class="sd-val" data-v="freq">'+freq+'/8</span>'
          +'<button class="sd-btn" data-act="play" style="'+btn+(playing?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">'+(playing?'■ 멈춤':'▶ 소리 듣기')+'</button>'
          + medBtns
        +'</div>';
      if(mode==='mission'){ var CMB=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); ctrl='<div style="display:flex;justify-content:center;margin-bottom:8px;"><button class="sd-btn" data-act="play" style="'+btn+(playing?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">'+(playing?'■ 멈춤':'▶ 소리 듣기')+'</button></div>'; foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){
        bar=wif.barHTML(); ctrl='';
        if(wif.active()){
          var wk=wif.state.key, sl='font-size:16px;font-weight:800;color:#5a3fb8;font-family:inherit;';
          if(wk==='water'){
            ctrl='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
              +'<button class="sd-btn" data-act="play" style="'+btn+(playing?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">'+(playing?'■ 멈춤':'▶ 소리 듣기')+'</button>'
              +['air','water','iron'].map(function(k){ var M=MEDIA[k], on=(medium===k), col=(k==='air'?'#15803D':(k==='water'?'#1971C2':'#495057'));
                return '<button class="sd-med" data-med="'+k+'" style="font-size:18px;padding:9px 12px;border-radius:13px;border:3px solid '+col+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(on?('background:'+col+';color:#fff;'):('background:#fff;color:'+col+';'))+'">'+M.ic+' '+M.nm+'</button>'; }).join('')
              +'</div>';
          } else if(wk==='echo'){
            ctrl='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
              +'<button class="sd-btn" data-act="yell" style="'+btn+'background:#fff;color:#7048E8;">📢 야호!</button>'
              +'<span style="'+sl+'">벽 거리</span><input class="sd-ecd" type="range" min="420" max="800" step="10" value="'+ec.wall+'" style="width:150px;">'
              +'</div>';
          } else {
            ctrl='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
              +'<button class="sd-btn" data-act="bolt" style="'+btn+'background:#fff;color:#E8590C;border-color:#E8590C;">⚡ 번개!</button>'
              +'<span style="'+sl+'">번개까지 거리</span><input class="sd-thk" type="range" min="1" max="5" step="1" value="'+th.km+'" style="width:130px;">'
              +'<span class="sd-thklab" style="'+sl+'color:#E8590C;">'+th.km+'km</span>'
              +'</div>';
          }
        }
      }
      /* ── v2 3층 — 만약에 정리 화면 도달 시 칩 1개 자동 기록 ── */
      if(mode==='whatif'&&wif.state.key){
        if(wif.state.phase==='reveal'&&!chipDone){
          chipDone=true;
          var cw=WHATIF[wif.state.key];
          chips.push({k:wif.state.key,hit:(wif.state.choice===cw.a)});
          chipToast(); snd(wif.state.choice===cw.a?'success':'pop');
        } else if(wif.state.phase!=='reveal'){ chipDone=false; }
      }
      el.innerHTML='<style>.sd-btn:active,.sd-med:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 22px !important;}'
        +'.sd-range,.sd-ecd,.sd-thk{-webkit-appearance:none;appearance:none;height:12px;border-radius:7px;background:#D0BFFF;outline:none;}'
        +'.sd-range::-webkit-slider-thumb,.sd-ecd::-webkit-slider-thumb,.sd-thk::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.sd-range::-moz-range-thumb,.sd-ecd::-moz-range-thumb,.sd-thk::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.sd-lab{font-size:17px;font-weight:800;color:#5a3fb8;font-family:inherit;}.sd-val{font-size:16px;font-weight:800;color:#7048E8;font-family:inherit;min-width:34px;display:inline-block;text-align:center;}</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;"><div class="sd-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'42vh')+';min-height:'+(mode==='quiz'?'240':'310')+'px;background:radial-gradient(120% 120% at 16% 50%,#FBFAFF 0%,#F1EEFA 70%,#E7E0F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(112,72,232,0.10);"></div></div>'
        +'<div class="sd-foot">'+foot+'</div>'
        +'<div class="sd-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;line-height:1.4;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="sd-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; amp=3; freq=3; medium='air'; triedVacuum=false; lastK=null; v2reset();
        playing=false; stopAudio();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      drawStage(); bind(); bands.bind(el); if(!raf)loop(); renderChips(); renderStatus(); updateAudio();
      if(mode==='whatif')wif.bind(el);
    }

    var stage, waveEl, coneEl, ringEls=[], dyn={};
    function drawStage(){
      stage=el.querySelector('.sd-stage'); stage.innerHTML=''; ringEls=[]; dyn={}; waveEl=null; coneEl=null;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var wk=wifKey();
      if(wk==='echo'){ drawEcho(svg); stage.appendChild(svg); return; }
      if(wk==='thunder'){ drawThunder(svg); stage.appendChild(svg); return; }
      for(var i=0;i<4;i++){var r=svgEl('circle',{cx:SPK.x+40,cy:SPK.y,r:0,fill:'none',stroke:C.ring,'stroke-width':3,'stroke-opacity':0});svg.appendChild(r);ringEls.push(r);}
      svg.appendChild(svgEl('line',{x1:X0,y1:MID,x2:X1,y2:MID,stroke:'#C7BCE8','stroke-width':1.5,'stroke-dasharray':'5 5'}));
      waveEl=svgEl('path',{d:'',fill:'none',stroke:C.wave,'stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'}); svg.appendChild(waveEl);
      svg.appendChild(svgEl('rect',{x:SPK.x-42,y:SPK.y-58,width:74,height:116,rx:12,fill:C.speaker,stroke:'#212529','stroke-width':3}));
      coneEl=svgEl('g',{}); svg.appendChild(coneEl);
      /* v2 — 매질 표시(공기 외 매질이면 배경 틴트 + 속도 라벨) */
      if(medium!=='air'&&medium!=='vacuum'){
        svg.appendChild(svgEl('rect',{x:0,y:0,width:VBW,height:VBH,fill:(medium==='water'?'#1971C2':'#495057'),'fill-opacity':0.08}));
      }
      if(G().showMedium||wk==='water'){
        var ml=svgEl('text',{x:VBW-24,y:44,'text-anchor':'end','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:(medium==='vacuum'?'#1E40AF':'#5a3fb8')});
        ml.textContent=MEDIA[medium].ic+' '+MEDIA[medium].nm+' — '+(MEDIA[medium].v?('약 '+MEDIA[medium].v.toLocaleString()+'m/s'):'전달 안 됨');
        svg.appendChild(ml);
      }
      stage.appendChild(svg);
    }
    /* ── v2 만약에 🦇 — 야호 펄스가 벽까지 왕복(메아리) ── */
    function drawEcho(svg){
      svg.appendChild(svgEl('rect',{x:0,y:0,width:VBW,height:VBH,fill:'#141C2E'}));
      svg.appendChild(svgEl('rect',{x:0,y:380,width:VBW,height:80,fill:'#2B3A55'}));
      var kid=svgEl('text',{x:150,y:310,'text-anchor':'middle','font-size':64}); kid.textContent='🧒'; svg.appendChild(kid);
      var mg=svgEl('text',{x:212,y:262,'text-anchor':'middle','font-size':34}); mg.textContent='📢'; svg.appendChild(mg);
      dyn.wall=svgEl('rect',{x:ec.wall,y:80,width:26,height:300,rx:6,fill:'#5C6B84',stroke:'#8A9AB5','stroke-width':3}); svg.appendChild(dyn.wall);
      var wl=svgEl('text',{x:ec.wall+13,y:66,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':17,'font-weight':800,fill:'#8A9AB5'}); wl.textContent='동굴 벽'; svg.appendChild(wl); dyn.wallLab=wl;
      dyn.pulse=svgEl('circle',{cx:-50,cy:280,r:16,fill:'none',stroke:'#FFD43B','stroke-width':5,opacity:0}); svg.appendChild(dyn.pulse);
      dyn.ecLab=svgEl('text',{x:450,y:120,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':23,'font-weight':800,fill:'#FFD43B'}); svg.appendChild(dyn.ecLab);
      dyn.ecSub=svgEl('text',{x:450,y:154,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':17,'font-weight':800,fill:'#9FB3D4'}); svg.appendChild(dyn.ecSub);
    }
    function stepEcho(){
      if(ec.phase==='go'){ ec.p+=7; ec.f++; if(ec.p>=ec.wall-4){ ec.p=ec.wall-4; ec.phase='back'; snd('select'); } }
      else if(ec.phase==='back'){ ec.p-=7; ec.f++; if(ec.p<=210){ ec.phase='done'; ec.done=ec.f; snd('pop'); renderStatus(); } }
      if(dyn.pulse){
        var on=(ec.phase==='go'||ec.phase==='back');
        dyn.pulse.setAttribute('cx',ec.p); dyn.pulse.setAttribute('opacity',on?1:0);
        dyn.pulse.setAttribute('stroke',ec.phase==='back'?'#FF922B':'#FFD43B');
      }
      if(dyn.ecLab)dyn.ecLab.textContent = ec.phase==='idle'?'📢 야호! 를 눌러 소리를 쏘아 봐요'
        : ec.phase==='go'?'야호──!' : ec.phase==='back'?'…야호… (되돌아와요!)' : '메아리 도착! 왕복 '+(ec.done/10).toFixed(1)+'초';
      if(dyn.ecSub)dyn.ecSub.textContent = ec.phase==='done'?'벽이 멀수록 오래 걸려요 — 박쥐는 이 시간으로 거리를 재요!':'';
      updDS();
    }
    /* ── v2 만약에 ⚡ — 번쩍은 즉시, 우르릉은 1km당 3초(30프레임) ── */
    function drawThunder(svg){
      svg.appendChild(svgEl('rect',{x:0,y:0,width:VBW,height:VBH,fill:'#1B2440'}));
      svg.appendChild(svgEl('rect',{x:0,y:390,width:VBW,height:70,fill:'#233250'}));
      var cl=svgEl('text',{x:180,y:120,'text-anchor':'middle','font-size':84}); cl.textContent='🌩️'; svg.appendChild(cl);
      dyn.boltEl=svgEl('path',{d:'M 180 140 L 158 210 L 186 206 L 150 300',fill:'none',stroke:'#FFD43B','stroke-width':9,'stroke-linecap':'round','stroke-linejoin':'round',opacity:0}); svg.appendChild(dyn.boltEl);
      var kid=svgEl('text',{x:720,y:360,'text-anchor':'middle','font-size':60}); kid.textContent='🧒'; svg.appendChild(kid);
      dyn.thLab=svgEl('text',{x:470,y:200,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':26,'font-weight':800,fill:'#FFD43B'}); svg.appendChild(dyn.thLab);
      dyn.thSec=svgEl('text',{x:470,y:242,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:'#9FB3D4'}); svg.appendChild(dyn.thSec);
      dyn.thDist=svgEl('text',{x:470,y:428,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:'#8A9AB5'}); svg.appendChild(dyn.thDist);
    }
    function stepThunder(){
      if(th.phase==='wait'){ th.f++; if(th.f>=th.km*30){ th.phase='boom'; snd('erupt'); renderStatus(); } }
      if(dyn.boltEl)dyn.boltEl.setAttribute('opacity',(th.phase==='wait'&&th.f<7)?1:(th.phase==='boom'?0:0));
      if(dyn.thLab)dyn.thLab.textContent = th.phase==='idle'?'⚡ 번개! 를 눌러 봐요'
        : th.phase==='wait'?'번쩍…! (빛은 벌써 도착)' : '우르르릉──!! ('+(th.km*3)+'초 뒤 도착)';
      if(dyn.thSec)dyn.thSec.textContent = th.phase==='wait'?'⏱ '+(th.f/10).toFixed(1)+'초… 소리가 오는 중':(th.phase==='boom'?'소리는 1초에 약 340m — 번쩍~우르릉 3초 = 약 1km!':'');
      if(dyn.thDist)dyn.thDist.textContent='번개까지 거리: '+th.km+'km';
      updDS();
    }
    function drawCone(shift){
      if(!coneEl)return;
      coneEl.innerHTML='';
      var x=SPK.x+8+shift;
      coneEl.appendChild(svgEl('path',{d:'M '+(x-10)+' '+(SPK.y-30)+' L '+(x+18)+' '+(SPK.y-44)+' L '+(x+18)+' '+(SPK.y+44)+' L '+(x-10)+' '+(SPK.y+30)+' Z',fill:'#868E96',stroke:'#343A40','stroke-width':2}));
      coneEl.appendChild(svgEl('circle',{cx:x-6,cy:SPK.y,r:13,fill:'#ADB5BD',stroke:'#343A40','stroke-width':2}));
    }

    function loop(){
      var wk=wifKey();
      if(wk==='echo'){ stepEcho(); raf=requestAnimationFrame(loop); return; }
      if(wk==='thunder'){ stepThunder(); raf=requestAnimationFrame(loop); return; }
      ph+=0.05+freq*0.02; var t=ph;
      var wl=(X1-X0)/(freq*1.1), A=amp*15, d='M '+X0+' '+MID;
      for(var x=X0;x<=X1;x+=6){var y=MID - A*Math.sin((x-X0)/wl*2*Math.PI - t);d+=' L '+x.toFixed(1)+' '+y.toFixed(1);}
      if(waveEl)waveEl.setAttribute('d',d);
      drawCone(Math.sin(t*3)*amp*0.8);
      var spd=MEDIA[medium].spd;   // v2 — 매질이 촘촘할수록 파동이 빨리 퍼짐
      for(var i=0;i<ringEls.length;i++){var prog=((t*8*spd + i*40)% 160)/160; var r=prog*180;
        ringEls[i].setAttribute('r',r.toFixed(1));ringEls[i].setAttribute('stroke-opacity',(medium==='vacuum'?0:0.5*(1-prog)*(amp/5)).toFixed(2));}
      raf=requestAnimationFrame(loop);
    }

    /* ── v2 검증 관측점 ── */
    function updDS(){
      var stg=el.querySelector('.sd-stage'); if(!stg)return;
      stg.dataset.amp=String(amp); stg.dataset.freq=String(freq);
      stg.dataset.medium=medium; stg.dataset.spd=String(MEDIA[medium].v); stg.dataset.playing=playing?'1':'0';
      stg.dataset.ecwall=String(ec.wall); stg.dataset.ecphase=ec.phase; stg.dataset.ecframes=String(ec.done);
      stg.dataset.thkm=String(th.km); stg.dataset.thphase=th.phase; stg.dataset.thf=String(th.f);
    }

    function renderStatus(){
      var s=el.querySelector('.sd-status');
      function fin(html){ s.innerHTML=html; updDS(); }
      if(mode==='quiz'){ fin('<div style="font-size:19px;">떨리는 파형을 잘 보고 (들어 보고) 답을 골라요!</div>'); return; }
      var wk=wifKey();
      if(wk==='echo'){ fin('<div style="font-size:19px;color:#5a3fb8;">'+(ec.phase==='done'?'벽 거리를 바꿔 다시 야호! — 왕복 시간이 어떻게 변하나요?':'소리는 벽에 부딪히면 되돌아와요 — 되돌아오는 시간이 거리의 단서!')+'</div>'); return; }
      if(wk==='thunder'){ fin('<div style="font-size:19px;color:#5a3fb8;">'+(th.phase==='boom'?'거리를 바꿔 다시 ⚡ — 멀수록 우르릉이 늦게 와요! (1km ≈ 3초)':'빛은 순간, 소리는 1초에 약 340m — 번쩍과 우르릉 사이를 세어 봐요.')+'</div>'); return; }
      if(medium==='vacuum'){ fin('<div style="font-size:20px;color:#1E40AF;">🌌 진공 — 소리가 안 들려요! 소리는 공기 같은 <b>매질</b>이 있어야 떨림이 전달돼요. 진공에는 전달할 것이 없어요.</div>'); checkMissionStep(); return; }
      if(medium==='water'||medium==='iron'){
        var M=MEDIA[medium];
        fin('<div style="font-size:20px;color:'+(medium==='water'?'#1971C2':'#495057')+';">'+M.ic+' '+M.nm+' 속 — 소리가 공기보다 <b>'+(medium==='water'?'4배':'15배')+' 빨리</b>(약 '+M.v.toLocaleString()+'m/s) 전달돼요! '+(medium==='water'?'고래는 물속 노래로 수백 km 밖 친구와 대화해요.':'기찻길에 귀를 대면 기차 소리를 먼저 들을 수 있어요.')+'</div>');
        checkMissionStep(); return;
      }
      if(grade==='low'){ fin('<div style="font-size:19px;">🥁 소리가 날 때 파형이 <b>떨려요(진동)</b> — 이 떨림이 바로 소리예요! 크게 떨릴수록 큰 소리.</div>'); checkMissionStep(); return; }
      var big=amp>=4?'큰':(amp<=2?'작은':'보통'), high=freq>=6?'높은':(freq<=2?'낮은':'보통');
      var base='파형이 '+(amp>=4?'크게':(amp<=2?'작게':'적당히'))+' '+(freq>=6?'촘촘하게':(freq<=2?'천천히':'적당히'))+' 떨려요 — '+big+' 소리·'+high+' 소리. <b>진폭</b>은 소리 크기, <b>진동수</b>는 소리 높이예요.';
      var hint='';
      if(lastK==='amp')hint='<div style="font-size:16px;color:'+C.ring+';margin-top:4px;">크기(진폭)만 바꿨더니 파형 높이만 달라지고 촘촘함(높이)은 그대로예요.</div>';
      else if(lastK==='freq')hint='<div style="font-size:16px;color:'+C.ring+';margin-top:4px;">높이(진동수)만 바꿨더니 촘촘함만 달라지고 파형 높이(크기)는 그대로예요.</div>';
      fin('<div>'+base+'</div>'+hint);
      checkMissionStep();
    }

    function ensureCtx(){ try{ if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){actx=null;} return actx; }
    function startAudio(){ try{ var c=ensureCtx(); if(!c)return; osc=c.createOscillator(); gain=c.createGain(); osc.type='sine'; osc.frequency.value=hz(); gain.gain.value=vol(); osc.connect(gain); gain.connect(c.destination); osc.start(); }catch(e){} }
    function stopAudio(){ try{ if(osc){osc.stop();osc.disconnect();osc=null;} }catch(e){} }
    function updateAudio(){ try{ if(osc){osc.frequency.value=hz();} if(gain){gain.gain.value=vol();} }catch(e){} }

    function bind(){
      el.querySelectorAll('.sd-range').forEach(function(r){r.addEventListener('input',function(e){
        var v=+e.target.value, k=e.target.dataset.k; if(k==='amp')amp=v; else freq=v; lastK=k;
        var vv=el.querySelector('.sd-val[data-v="'+k+'"]'); if(vv)vv.textContent=v+'/'+(k==='amp'?'5':'8');
        updateAudio(); renderStatus();
      });});
      var pb=el.querySelector('[data-act="play"]');
      if(pb)pb.addEventListener('click',function(){
        playing=!playing; if(playing){ startAudio(); if(medium==='vacuum')triedVacuum=true; } else stopAudio();
        var b=el.querySelector('[data-act="play"]');
        b.textContent=playing?'■ 멈춤':'▶ 소리 듣기';
        b.style.background=playing?'#7048E8':'#fff'; b.style.color=playing?'#fff':'#7048E8';
        checkPred(); renderStatus();
      });
      /* ── v2 만약에 액션 ── */
      var yb=el.querySelector('[data-act="yell"]'); if(yb)yb.addEventListener('click',yell);
      var bb=el.querySelector('[data-act="bolt"]'); if(bb)bb.addEventListener('click',bolt);
      var ed=el.querySelector('.sd-ecd'); if(ed)ed.addEventListener('input',function(){
        ec.wall=+ed.value; if(ec.phase!=='go'&&ec.phase!=='back'){ec.phase='idle';ec.done=0;}
        if(dyn.wall)dyn.wall.setAttribute('x',ec.wall);
        if(dyn.wallLab)dyn.wallLab.setAttribute('x',ec.wall+13);
        updDS();
      });
      var tk=el.querySelector('.sd-thk'); if(tk)tk.addEventListener('input',function(){
        th.km=+tk.value; th.phase='idle'; th.f=0;
        var lb=el.querySelector('.sd-thklab'); if(lb)lb.textContent=th.km+'km';
        stepThunder();
      });
      el.querySelectorAll('.sd-med').forEach(function(b){ b.addEventListener('click',function(){
        var m=b.dataset.med; if(m===medium)return; medium=m; if(medium==='vacuum'&&playing)triedVacuum=true;
        updateAudio();
        /* v2 3층 — 매질(물·철)·진공 첫 선택 = 🔮 예측 무장 (buildUI 후 foot에 기록 — light 패턴) */
        buildUI();
        if(m==='water'||m==='iron')predArm('med'); else if(m==='vacuum')predArm('vac');
        checkPred();
      });});
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
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); stopAudio(); try{actx&&actx.close();}catch(e){} };
  });
})();
