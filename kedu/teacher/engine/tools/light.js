/* ============================================================================
   케이랩 도구 모듈 — 빛·그림자 (light) v4  [과학 4호 · 탐구 표준 v2]
   4학년 그림자와 거울.
     [그림자] 모드: 광원·물체 옮기며 빛 직진→그림자 (v1).
     [거울] 모드: 광원에서 광선을 쏘고 거울을 돌려, 입사각=반사각으로 빛이 튕기는
        광선 경로를 추적해서 봄. 거울 회전·이동.
   탐구 표준 v2 (4층):
     1층 변수 개방 — 📏 물체 크기 슬라이더(그림자 = 크기×거리 2변수 조합 발견) +
       🪞 거울 각도 슬라이더(15° 점프 대신 연속 스캔 = 입사각=반사각 불변량).
       고학년 자유탐구 전용. 기본값 = 기존 거동 완전 동일.
     2층 만약에 — 💡💡 전구 두 개(그림자 두 개+겹침만 진함, 원본 G칸) ·
       🌀 휘는 빛(반사실 물리: 그림자 소멸 = 그림자가 직진의 증거, 오개념 ③) ·
       🪞🪞 마주 보는 거울(다중 왕복 반사 = 이발소 거울, 원본 D칸 고). 중=💡🌀, 고=3종.
     3층 예측 노트 — 크기·각도 첫 조작 = 🔮 무장 → 해소·칩·5칩 = 🔦 꼬마 빛탐정.
     4층 — 3D 미전환·SVG 유지(광선 기하 2D가 원리 그 자체). 신규 자산 0.
   - 의존: window.KLab (순수 SVG)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 실험 토글 exp=그림자|거울.
   - config: { exp:"shadow"|"mirror"(기본shadow), mode:"free"|"mission"|"quiz" }
     (옛 config.mode="mirror"도 거울 진입으로 호환)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={light:'#FFD43B',ray:'#FFA94D',rayHot:'#FF922B',shadow:'#3A4A5C',ink:'#1B3A57',sub:'#5a7894',screen:'#CED4DA',mirror:'#74C0FC'};
  window.KLab.register('light', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var exp=(config.mode==='mirror'||config.exp==='mirror')?'mirror':'shadow';
    var src={x:130,y:200}, obj={x:430,y:230,h:150}, mir={x:540,y:270,ang:-0.78,len:220};
    var SCRX=810, TOP=45, BOT=415, VBW=900, VBH=460;
    /* ── v2 상태 — 만약에 미니 무대 + 예측 추적 ── */
    var src2={x:180,y:340};                                    // 💡💡 두 번째 전구
    var bd={bend:true};                                        // 🌀 휘는-빛 세상(true) ↔ 직진 비교(false)
    var M2A={x:330,y:230,ang:1.45,len:310}, M2B={x:760,y:230,ang:-1.45,len:310}; // 🪞🪞 마주 보는 거울
    var m2tilt=0, m2b=0;                                       // 기울임 보정·최근 바운스 수
    var angSpan={min:null,max:null};                           // 거울 각도 스캔 폭(예측 해소용)
    function v2reset(){ src2={x:180,y:340}; bd={bend:true}; m2tilt=0; m2b=0; angSpan={min:null,max:null}; }
    function wifKey(){ return (mode==='whatif'&&wif&&wif.active())?wif.state.key:null; }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n); }
    var btn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #1565C0;background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}

    // 중심 광선의 반사 방향 (거울 미션 판정)
    function centralReflect(){
      var base=Math.atan2(mir.y-src.y,mir.x-src.x), dx=Math.cos(base), dy=Math.sin(base);
      var hit=rayMirror(src.x,src.y,dx,dy); if(!hit)return null;
      var nx=-Math.sin(mir.ang), ny=Math.cos(mir.ang);
      var dot=dx*nx+dy*ny; return {rx:dx-2*dot*nx, ry:dy-2*dot*ny};
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { exp:'shadow', text:'💡 전구를 물체 <b style="color:#7048E8;">가까이</b> 옮겨 그림자를 크게 만들어 봐요!',
        check:function(){ return exp==='shadow' && src.x<obj.x && (obj.x-src.x)<200; } },
      { exp:'shadow', text:'💡 이번엔 전구를 <b style="color:#7048E8;">멀리</b> 옮겨 그림자를 작게 만들어 봐요!',
        check:function(){ return exp==='shadow' && src.x<obj.x && (obj.x-src.x)>420; } },
      { exp:'mirror', text:'🪞 거울을 돌려 반사된 주황 빛을 <b style="color:#7048E8;">위쪽</b>으로 보내 봐요!',
        check:function(){ if(exp!=='mirror')return false; var r=centralReflect(); return !!r && r.ry<-0.4; } },
      { exp:'mirror', text:'🪞 이번엔 빛을 <b style="color:#7048E8;">아래 바닥 쪽</b>으로 보내 봐요!',
        check:function(){ if(exp!=='mirror')return false; var r=centralReflect(); return !!r && r.ry>0.4; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=그림자 만들기 / 중=광원 위치와 그림자 크기(직진) / 고=거울 반사(입사각=반사각). 그림자/거울 토글은 고학년만. */
    var GRADES={
      low:  { mIdx:[0],       showExp:false, modes:['free','mission','quiz'],           v2:false, wif:[] },
      mid:  { mIdx:[0,1],     showExp:false, modes:['free','mission','quiz','whatif'],  v2:false, wif:['two','bend'] },
      high: { mIdx:[0,1,2,3], showExp:true,  modes:['free','mission','quiz','whatif'],  v2:true,  wif:['two','bend','mirror2'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return GRADES[grade].mIdx.map(function(i){return MISSIONS[i];}); }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; exp='shadow';
      src={x:130,y:200}; obj={x:430,y:230,h:150}; mir={x:540,y:270,ang:-0.78,len:220}; v2reset();
      if(wif)wif.reset(); makeWif();
      buildUI();
    }});

    /* ───────────── 🌀 만약에 (v2 2층 — 원본 D·G칸 미이행분 상환) ───────────── */
    var WHATIF={
      two:{ icon:'💡', title:'전구를 두 개 켜면?',
        q:'전구를 하나 더 켜면 물체의 그림자는 어떻게 될까요?',
        ch:['그림자가 더 진해져요','그림자가 두 개 생겨요','그림자가 사라져요'], a:1,
        reveal:'그림자는 검은 물질이 아니라 "그 전구의 빛이 못 닿은 자리"예요! 그래서 전구마다 그림자가 하나씩 — 두 그림자가 겹친 곳만 두 빛이 모두 못 닿아 진해요. 축구장 야간 경기에서 선수 그림자가 여러 개인 까닭이에요.',
        tip:'💡 두 전구를 끌어 옮겨 봐요 — 그림자가 몇 개?' },
      bend:{ icon:'🌀', title:'빛이 휘어서 모퉁이를 돈다면?',
        q:'만약 빛이 구불구불 휘어서 물체 뒤로 돌아갈 수 있다면, 그림자는 어떻게 될까요?',
        ch:['그림자가 더 진해져요','그림자가 사라져요','그림자가 두 배가 돼요'], a:1,
        reveal:'빛이 휘어 물체 뒤까지 돌아가면 빛이 못 닿는 자리가 없어져 그림자가 사라져요! 거꾸로 말하면 — 그림자가 있다는 것 자체가 빛이 곧게 나아간다는 증거예요. 휘는-빛 세상엔 그림자도, 밤도 없답니다.',
        tip:'↔ 버튼으로 직진 세상과 비교해 봐요!' },
      mirror2:{ icon:'🪞', title:'거울 두 장을 마주 보게 하면?',
        q:'두 거울을 마주 보게 세우고 빛을 쏘면, 빛은 몇 번 튕길까요?',
        ch:['딱 한 번만 튕겨요','여러 번 왔다 갔다 튕겨요','거울 사이에서 사라져요'], a:1,
        reveal:'빛은 거울에 닿을 때마다 입사각=반사각으로 또 튕겨요! 마주 보는 거울 사이에선 여러 번 왕복하며 지그재그로 나아가요 — 이발소·엘리베이터의 끝없는 거울 나라가 바로 이 원리예요.',
        tip:'전구를 끌고 ↻ 거울을 기울여 봐요 — 몇 번 튕기나!' }
    };
    var wif;
    function makeWif(){
      var scen={}; G().wif.forEach(function(k){ scen[k]=WHATIF[k]; });
      wif=ui.whatifEngine({
        scenarios:scen,
        rebuild:function(){ buildUI(); },
        footEl:function(){ return el.querySelector('.lt-foot'); },
        onSelect:function(k){ v2reset(); src={x:130,y:200}; obj={x:430,y:230,h:150}; },
        onPlay:function(k){
          if(k==='two'){ src={x:150,y:150}; src2={x:180,y:340}; obj={x:430,y:230,h:150}; }
          else if(k==='bend'){ src={x:130,y:200}; obj={x:430,y:230,h:150}; bd={bend:true}; }
          else { src={x:450,y:90}; m2tilt=0; m2b=0; }
        },
        onExit:function(){ v2reset(); src={x:130,y:200}; obj={x:430,y:230,h:150}; }
      });
    }
    makeWif();

    /* ── v2 예측 무장 (3층) — 물체 크기·거울 각도 첫 조작 = 🔮 예측 → 조건 도달 = 해소·칩 ── */
    var chips=[], chipDone=false;
    var pred={ size:{asked:false,ch:-1,done:false}, ang:{asked:false,ch:-1,done:false} };
    var PRED={
      size:{ q:'🔮 예측 먼저! 물체가 두 배로 커지면 그림자는 어떻게 될까요?',
        ch:['그림자는 그대로다','물체가 커진 만큼 그림자도 커진다','오히려 작아진다'],
        tip:'📏 슬라이더를 끝까지 키워 그림자를 지켜봐요!' },
      ang:{ q:'🔮 예측 먼저! 빛이 거울에 부딪히면 어떻게 튕길까요?',
        ch:['아무 각도로나 튕긴다','들어온 각과 같은 각으로 튕긴다','거울을 그냥 통과한다'],
        tip:'🪞 슬라이더로 각도를 이리저리 돌려 봐요 — 규칙이 보여요!' }
    };
    function predArm(kind){
      if(mode!=='free'||pred[kind].asked)return; pred[kind].asked=true;
      var fc=el.querySelector('.lt-foot'); if(!fc)return;
      var P=PRED[kind];
      fc.innerHTML='<div class="lt-pred" style="text-align:center;margin-top:8px;">'
        +'<div style="font-size:17px;font-weight:800;color:#7048E8;margin-bottom:7px;font-family:inherit;">'+P.q+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
        +P.ch.map(function(c,i){ return '<button class="lt-pch" data-kind="'+kind+'" data-v="'+i+'" style="font-size:15.5px;padding:10px 14px;border-radius:12px;border:2.5px solid #845EF7;background:#fff;color:#5F3DC4;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;">'+c+'</button>'; }).join('')
        +'</div></div>';
      fc.querySelectorAll('.lt-pch').forEach(function(b){
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
      if(kind==='size') msg=hit?'✔ 예측 적중 — 물체가 커진 만큼 그림자도 커져요! 빛이 곧게 가다 막힌 자리가 그림자거든요.'
                               :'✘ 예측 빗나감 — 물체가 커지면 그림자도 커져요! 빛을 막는 부분이 그만큼 넓어지니까요.';
      else msg=hit?'✔ 예측 적중 — 어느 각도로 돌려도 들어온 각=나간 각! 반사의 법칙이에요.'
                  :'✘ 예측 빗나감 — 빛은 언제나 들어온 각과 같은 각으로 튕겨요! 슬라이더로 확인했듯 어느 각도에서든 똑같은 규칙이에요.';
      chips.push({k:kind,hit:hit}); renderChips(); chipToast(); snd(hit?'success':'pop');
      var fc=el.querySelector('.lt-foot');
      if(fc&&mode==='free')fc.innerHTML='<div style="text-align:center;margin-top:8px;font-size:16px;font-weight:800;color:'+(hit?'#0B7A5C':'#C24106')+';font-family:inherit;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5;">'+msg+'</div>';
    }
    function checkPred(){
      if(mode!=='free')return;
      if(pred.size.ch>=0&&!pred.size.done&&exp==='shadow'&&obj.h>=220&&src.x<obj.x)predResolve('size');
      if(pred.ang.ch>=0&&!pred.ang.done&&exp==='mirror'&&angSpan.min!=null&&(angSpan.max-angSpan.min)>=0.9)predResolve('ang');
    }
    /* ── v2 예측 노트 칩 (3층) — 세션 누적, 5칩 토스트 ── */
    var CHIPNM={two:'💡 그림자둘',bend:'🌀 휘는빛',mirror2:'🪞 무한거울',size:'📏 크기예측',ang:'🪞 반사예측'};
    function chipToast(){ if(chips.length===5){ setTimeout(function(){ ui.toast(el,true,'🔦 꼬마 빛탐정 — 오늘 가설 5개를 실험했어요!'); },80); } }
    function renderChips(){
      var host=el.querySelector('.lt-chips'); if(!host)return;
      host.innerHTML=chips.map(function(c){
        var tag=c.hit?'✔예측적중':'✘예측빗나감';
        return '<span class="lt-chip2" style="font-size:13.5px;font-weight:800;padding:5px 10px;border-radius:999px;border:2px solid '+(c.hit?'#12B886':'#E8590C')+';color:'+(c.hit?'#0B7A5C':'#C24106')+';background:#fff;font-family:inherit;">'
          +(CHIPNM[c.k]||c.k)+' · '+tag+'</span>';
      }).join('');
    }

    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(curMissions()[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          var CM=curMissions(); if(mStep<CM.length-1){ mStep++; exp=CM[mStep].exp; } else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (빛 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { exp:'shadow', q:'그림자는 물체의 어느 쪽에 생길까요?', ch:['빛의 반대쪽 (물체 뒤)','빛이 오는 쪽','아무 데나 생겨요'], a:0 },
      { exp:'shadow', q:'전구를 물체에 더 가까이 가져가면 그림자는?', ch:['더 커져요','더 작아져요','없어져요'], a:0 },
      { exp:'shadow', q:'빛은 어떻게 나아갈까요?', ch:['곧게 나아가요','구불구불 휘어 가요','제자리에 멈춰요'], a:0 },
      { exp:'mirror', q:'빛이 거울에 부딪히면 어떻게 될까요?', ch:['들어온 각과 같은 각으로 튕겨요','거울을 그냥 통과해요','빛이 사라져요'], a:0 },
      { exp:'shadow', q:'그림자가 생기려면 꼭 필요한 두 가지는?', ch:['빛과 빛을 막는 물체','소리와 바람','물과 공기'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      src={x:130,y:200}; obj={x:430,y:230,h:150}; mir={x:540,y:270,ang:-0.78,len:220};
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var rot = exp==='mirror' ? '<button class="lt-btn" data-act="rot" style="'+btn+'background:#fff;color:#7048E8;">↻ 거울 돌리기</button>' : '';
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var expRow=GRADES[grade].showExp?('<div style="display:flex;gap:8px;justify-content:center;margin-bottom:7px;">'
          +'<button class="lt-mode'+(exp==='shadow'?' on':'')+'" data-mode="shadow" style="'+mbtn+'">그림자</button>'
          +'<button class="lt-mode'+(exp==='mirror'?' on':'')+'" data-mode="mirror" style="'+mbtn+'">거울 반사</button>'
          +(rot?'<span style="width:6px;"></span>'+rot:'')
        +'</div>'):(rot?'<div style="display:flex;justify-content:center;margin-bottom:7px;">'+rot+'</div>':'');
      /* ── v2 1층 — 물체 크기(그림자)·거울 각도(거울) 슬라이더 (고학년·자유탐구) ── */
      var v2row='';
      if(mode==='free'&&G().v2){
        var sl='font-size:15px;font-weight:800;color:'+C.sub+';font-family:inherit;';
        if(exp==='shadow')
          v2row='<div class="lt-v2" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
            +'<span style="'+sl+'">📏 물체 크기</span>'
            +'<input class="lt-size" type="range" min="80" max="260" step="2" value="'+obj.h+'" style="width:160px;">'
            +'<span class="lt-sizelab" style="font-size:15px;font-weight:800;color:#7048E8;min-width:40px;font-family:inherit;">'+obj.h+'</span></div>';
        else
          v2row='<div class="lt-v2" style="display:flex;gap:9px;align-items:center;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
            +'<span style="'+sl+'">🪞 거울 각도</span>'
            +'<input class="lt-ang" type="range" min="-2.4" max="0.8" step="0.02" value="'+mir.ang+'" style="width:180px;">'
            +'<span class="lt-anglab" style="font-size:15px;font-weight:800;color:#7048E8;min-width:52px;font-family:inherit;">'+Math.round(mir.ang*180/Math.PI)+'°</span></div>';
      }
      var hint='<div class="lt-hint" style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;"></div>';
      var mid=expRow+v2row+hint;
      if(mode==='mission'){ var CMB=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length); mid=(exp==='mirror'&&rot?'<div style="display:flex;justify-content:center;margin-bottom:7px;">'+rot+'</div>':''); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); mid=''; foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){
        bar=wif.barHTML(); mid='';
        if(wif.active()){
          var wk=wif.state.key;
          if(wk==='bend')mid='<div style="display:flex;justify-content:center;margin-bottom:7px;"><button class="lt-btn" data-act="bendTgl" style="'+btn+'background:'+(bd.bend?'#7048E8':'#fff')+';color:'+(bd.bend?'#fff':'#7048E8')+';">'+(bd.bend?'↔ 직진 세상과 비교':'🌀 휘는-빛 세상으로')+'</button></div>';
          else if(wk==='mirror2')mid='<div style="display:flex;justify-content:center;margin-bottom:7px;"><button class="lt-btn" data-act="tilt" style="'+btn+'background:#fff;color:#7048E8;">↻ 거울 조금 기울이기</button></div>';
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
      el.innerHTML='<style>.lt-btn:active,.lt-mode:active,.kl-choice:active{transform:translateY(2px);}.lt-mode.on{background:#1565C0 !important;color:#fff !important;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.lt-stage{touch-action:none;}.lt-grab{cursor:grab;}.lt-stage.drag .lt-grab{cursor:grabbing;}</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="lt-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'45vh')+';min-height:'+(mode==='quiz'?'260':'340')+'px;background:radial-gradient(120% 120% at 18% 30%,#FFFDF3 0%,#EEF2F7 70%,#E1E8F0 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +'<div class="lt-foot">'+foot+'</div>'
        +'<div class="lt-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;"></div>'
        +((mode==='free'||mode==='whatif')?'<div class="lt-chips" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;"></div>':'');
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; v2reset();
        src={x:130,y:200}; obj={x:430,y:230,h:150}; mir={x:540,y:270,ang:-0.78,len:220};
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      var hh=el.querySelector('.lt-hint'); if(hh)hh.textContent = exp==='shadow'
        ? '💡 전구와 물체를 끌어 옮겨요. 빛이 곧게 가다 물체에 막히면 그림자가 생겨요.'
        : '💡 전구를 끌어 옮기고 거울을 돌려요. 빛이 거울에 부딪히면 입사각=반사각으로 튕겨요.';
      bind(); bindV2(); render(); bands.bind(el); renderChips();
      if(mode==='whatif')wif.bind(el);
    }

    function sun(svg,x,y,key){var g=svgEl('g',{class:'lt-grab','data-grab':key||'src'});
      for(var a=0;a<360;a+=30){var r=a*Math.PI/180;g.appendChild(svgEl('line',{x1:x+24*Math.cos(r),y1:y+24*Math.sin(r),x2:x+34*Math.cos(r),y2:y+34*Math.sin(r),stroke:'#FCC419','stroke-width':4,'stroke-linecap':'round'}));}
      g.appendChild(svgEl('circle',{cx:x,cy:y,r:22,fill:'#FFE066',stroke:'#F59F00','stroke-width':3}));svg.appendChild(g);}

    var stage;
    function render(){
      stage=el.querySelector('.lt-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      /* ── v2 만약에 미니 무대 라우팅 ── */
      var wk=wifKey();
      if(wk==='two')renderTwo(svg);
      else if(wk==='bend')renderBend(svg);
      else if(wk==='mirror2')renderMirror2(svg);
      else if((mode==='quiz'?QUIZ[qIdx].exp:exp)==='shadow') renderShadow(svg); else renderMirror(svg);
      stage.appendChild(svg); renderStatus(); checkMission();
    }

    // ── 그림자 모드 (v1)
    function hitScreen(px,py){if(px<=src.x)return null;return src.y+(py-src.y)*(SCRX-src.x)/(px-src.x);}
    /* v2 — 임의 광원 S의 스크린 그림자 밴드 [a,b] (없으면 null) */
    function bandOf(S){
      if(S.x>=obj.x)return null;
      var oy1=obj.y-obj.h/2, oy2=obj.y+obj.h/2, f=(SCRX-S.x)/(obj.x-S.x);
      var y1=S.y+(oy1-S.y)*f, y2=S.y+(oy2-S.y)*f;
      var a=Math.max(TOP,Math.min(y1,y2)), b=Math.min(BOT,Math.max(y1,y2));
      return (b>a)?{a:a,b:b}:null;
    }
    function drawScreenObj(svg){
      svg.appendChild(svgEl('rect',{x:SCRX,y:TOP-10,width:24,height:BOT-TOP+20,rx:5,fill:C.screen,stroke:'#9AA7B4','stroke-width':2}));
      var og=svgEl('g',{class:'lt-grab','data-grab':'obj'});
      og.appendChild(svgEl('rect',{x:obj.x-15,y:obj.y-obj.h/2,width:30,height:obj.h,rx:8,fill:'#495057',stroke:'#212529','stroke-width':2}));
      svg.appendChild(og);
    }
    function renderShadow(svg){
      var oy1=obj.y-obj.h/2, oy2=obj.y+obj.h/2;
      if(src.x<SCRX)svg.appendChild(svgEl('path',{d:'M '+src.x+' '+src.y+' L '+SCRX+' '+TOP+' L '+SCRX+' '+BOT+' Z',fill:C.light,'fill-opacity':0.16}));
      var y1=hitScreen(obj.x,oy1), y2=hitScreen(obj.x,oy2);
      if(src.x<obj.x&&y1!=null&&y2!=null){
        svg.appendChild(svgEl('path',{d:'M '+obj.x+' '+oy1+' L '+SCRX+' '+y1+' L '+SCRX+' '+y2+' L '+obj.x+' '+oy2+' Z',fill:C.shadow,'fill-opacity':0.30}));
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:y1,stroke:C.ray,'stroke-width':2,'stroke-dasharray':'7 6'}));
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:y2,stroke:C.ray,'stroke-width':2,'stroke-dasharray':'7 6'}));
        svg.appendChild(svgEl('line',{x1:SCRX-4,y1:Math.max(TOP,Math.min(y1,y2)),x2:SCRX-4,y2:Math.min(BOT,Math.max(y1,y2)),stroke:C.shadow,'stroke-width':9,'stroke-opacity':0.85,'stroke-linecap':'round'}));
      }
      for(var k=0;k<=6;k++){var ty=TOP+(BOT-TOP)*k/6;svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:ty,stroke:C.ray,'stroke-width':1.5,'stroke-opacity':0.32}));}
      drawScreenObj(svg); sun(svg,src.x,src.y);
    }

    /* ── v2 만약에 💡💡 — 전구 두 개 = 그림자 두 개(겹침만 진함) ── */
    function renderTwo(svg){
      [src,src2].forEach(function(S){ if(S.x<SCRX)svg.appendChild(svgEl('path',{d:'M '+S.x+' '+S.y+' L '+SCRX+' '+TOP+' L '+SCRX+' '+BOT+' Z',fill:C.light,'fill-opacity':0.10})); });
      var b1=bandOf(src), b2=bandOf(src2);
      [ [b1,src], [b2,src2] ].forEach(function(pair){
        var b=pair[0], S=pair[1]; if(!b)return;
        var oy1=obj.y-obj.h/2, oy2=obj.y+obj.h/2;
        svg.appendChild(svgEl('path',{d:'M '+obj.x+' '+oy1+' L '+SCRX+' '+b.a+' L '+SCRX+' '+b.b+' L '+obj.x+' '+oy2+' Z',fill:C.shadow,'fill-opacity':0.16}));
        svg.appendChild(svgEl('line',{x1:SCRX-4,y1:b.a,x2:SCRX-4,y2:b.b,stroke:C.shadow,'stroke-width':9,'stroke-opacity':0.45,'stroke-linecap':'round'}));
      });
      if(b1&&b2){
        var oa=Math.max(b1.a,b2.a), ob=Math.min(b1.b,b2.b);
        if(ob>oa){
          svg.appendChild(svgEl('line',{x1:SCRX-4,y1:oa,x2:SCRX-4,y2:ob,stroke:'#141C26','stroke-width':11,'stroke-opacity':0.95,'stroke-linecap':'round'}));
          svg.appendChild(svgEl('text',{x:SCRX-38,y:(oa+ob)/2+6,'text-anchor':'end','font-family':'Jua,sans-serif','font-size':17,'font-weight':800,fill:'#141C26'})).textContent='겹침 — 진해요!';
        }
      }
      drawScreenObj(svg); sun(svg,src.x,src.y,'src'); sun(svg,src2.x,src2.y,'src2');
    }

    /* ── v2 만약에 🌀 — 휘는-빛 세상(그림자 소멸) ↔ 직진 비교 ── */
    function renderBend(svg){
      if(bd.bend){
        svg.appendChild(svgEl('rect',{x:SCRX-2,y:TOP-10,width:4,height:BOT-TOP+20,fill:C.light,'fill-opacity':0.5}));
        for(var k=0;k<=8;k++){
          var ty=TOP+(BOT-TOP)*k/8;
          var midY=(ty<obj.y)?(obj.y-obj.h/2-70-k*4):(obj.y+obj.h/2+70+(8-k)*4);   // 물체를 크게 우회
          svg.appendChild(svgEl('path',{d:'M '+src.x+' '+src.y+' Q '+obj.x+' '+midY+' '+SCRX+' '+ty,stroke:C.ray,'stroke-width':2.2,fill:'none','stroke-opacity':0.65}));
        }
        var lb=svgEl('text',{x:450,y:70,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:'#7048E8'}); lb.textContent='🌀 휘는-빛 세상 — 그림자가 없어요!'; svg.appendChild(lb);
        drawScreenObj(svg); sun(svg,src.x,src.y);
      } else {
        renderShadow(svg);
        var lb2=svgEl('text',{x:450,y:70,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:C.ink}); lb2.textContent='↔ 직진 세상 — 그림자가 돌아왔어요'; svg.appendChild(lb2);
      }
    }

    /* ── v2 만약에 🪞🪞 — 마주 보는 거울 다중 반사 ── */
    function mirEnds(M){var hx=Math.cos(M.ang)*M.len/2, hy=Math.sin(M.ang)*M.len/2;return [[M.x-hx,M.y-hy],[M.x+hx,M.y+hy]];}
    function raySeg(ox,oy,dx,dy,M){var m=mirEnds(M),p1=m[0],p2=m[1],ex=p2[0]-p1[0],ey=p2[1]-p1[1];
      var den=dx*ey-dy*ex; if(Math.abs(den)<1e-6)return null;
      var t=((p1[0]-ox)*ey-(p1[1]-oy)*ex)/den, s=((p1[0]-ox)*dy-(p1[1]-oy)*dx)/den;
      if(t>0.5&&s>=0&&s<=1)return {t:t,x:ox+dx*t,y:oy+dy*t}; return null;}
    function renderMirror2(svg){
      var MB={x:M2B.x,y:M2B.y,ang:M2B.ang+m2tilt,len:M2B.len}, MIRS=[M2A,MB];
      MIRS.forEach(function(M){ var m=mirEnds(M);
        svg.appendChild(svgEl('line',{x1:m[0][0],y1:m[0][1],x2:m[1][0],y2:m[1][1],stroke:C.mirror,'stroke-width':7,'stroke-linecap':'round'}));
        var nx=-Math.sin(M.ang), ny=Math.cos(M.ang), sgn=(M===M2A)?-1:1;
        for(var i=0;i<=10;i++){var px=m[0][0]+(m[1][0]-m[0][0])*i/10, py=m[0][1]+(m[1][1]-m[0][1])*i/10;
          svg.appendChild(svgEl('line',{x1:px,y1:py,x2:px+sgn*nx*11,y2:py+sgn*ny*11,stroke:'#A5D8FF','stroke-width':3}));}
      });
      // 중심 광선 다중 추적 (최대 8바운스)
      var base=Math.atan2(60, M2A.x-src.x), dx=Math.cos(base), dy=Math.sin(base);   // 왼쪽 거울로 얕게 입사 → 지그재그 왕복
      var ox=src.x, oy=src.y, pts=[[ox,oy]], b=0;
      for(var i2=0;i2<8;i2++){
        var best=null, bm=null;
        for(var j=0;j<2;j++){ var h=raySeg(ox,oy,dx,dy,MIRS[j]); if(h&&(!best||h.t<best.t)){best=h;bm=MIRS[j];} }
        if(!best)break;
        pts.push([best.x,best.y]); b++;
        var nx2=-Math.sin(bm.ang), ny2=Math.cos(bm.ang), dot=dx*nx2+dy*ny2;
        dx=dx-2*dot*nx2; dy=dy-2*dot*ny2;
        ox=best.x+dx*0.5; oy=best.y+dy*0.5;
      }
      pts.push([ox+dx*1200,oy+dy*1200]);
      m2b=b;
      for(var p2i=0;p2i<pts.length-1;p2i++){
        svg.appendChild(svgEl('line',{x1:pts[p2i][0],y1:pts[p2i][1],x2:pts[p2i+1][0],y2:pts[p2i+1][1],stroke:(p2i===0?C.ray:C.rayHot),'stroke-width':3,'stroke-opacity':Math.max(0.25,1-p2i*0.11),'stroke-linecap':'round'}));
        if(p2i>0)svg.appendChild(svgEl('circle',{cx:pts[p2i][0],cy:pts[p2i][1],r:5,fill:C.rayHot}));
      }
      var cnt=svgEl('text',{x:545,y:70,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:'#7048E8'}); cnt.textContent='튕긴 횟수: '+b+'번!'; svg.appendChild(cnt);
      sun(svg,src.x,src.y);
    }

    // ── 거울 모드 (광선 추적)
    function mP(){var hx=Math.cos(mir.ang)*mir.len/2, hy=Math.sin(mir.ang)*mir.len/2;return [[mir.x-hx,mir.y-hy],[mir.x+hx,mir.y+hy]];}
    function rayMirror(ox,oy,dx,dy){var m=mP(),p1=m[0],p2=m[1],ex=p2[0]-p1[0],ey=p2[1]-p1[1];
      var den=dx*ey-dy*ex; if(Math.abs(den)<1e-6)return null;
      var t=((p1[0]-ox)*ey-(p1[1]-oy)*ex)/den, s=((p1[0]-ox)*dy-(p1[1]-oy)*dx)/den;
      if(t>0.5&&s>=0&&s<=1)return {t:t,x:ox+dx*t,y:oy+dy*t}; return null;}
    function renderMirror(svg){
      var m=mP();
      // 거울 (반사면 + 뒷면 빗금)
      svg.appendChild(svgEl('line',{x1:m[0][0],y1:m[0][1],x2:m[1][0],y2:m[1][1],stroke:C.mirror,'stroke-width':7,'stroke-linecap':'round'}));
      var nx=-Math.sin(mir.ang), ny=Math.cos(mir.ang);
      for(var i=0;i<=10;i++){var px=m[0][0]+(m[1][0]-m[0][0])*i/10, py=m[0][1]+(m[1][1]-m[0][1])*i/10;
        svg.appendChild(svgEl('line',{x1:px,y1:py,x2:px-nx*11,y2:py-ny*11,stroke:'#A5D8FF','stroke-width':3}));}
      // 광선들 (S에서 거울 향해 부채꼴)
      var base=Math.atan2(mir.y-src.y,mir.x-src.x);
      for(var r=-4;r<=4;r++){var ang=base+r*0.06, dx=Math.cos(ang), dy=Math.sin(ang);
        var hit=rayMirror(src.x,src.y,dx,dy);
        if(hit){
          svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:hit.x,y2:hit.y,stroke:C.ray,'stroke-width':2.5,'stroke-opacity':0.85}));
          var dot=dx*nx+dy*ny, rx=dx-2*dot*nx, ry=dy-2*dot*ny;
          svg.appendChild(svgEl('line',{x1:hit.x,y1:hit.y,x2:hit.x+rx*900,y2:hit.y+ry*900,stroke:C.rayHot,'stroke-width':2.5,'stroke-opacity':0.85}));
        } else {
          svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:src.x+dx*1200,y2:src.y+dy*1200,stroke:C.ray,'stroke-width':2,'stroke-opacity':0.5}));
        }
      }
      // 법선(중심) 표시
      svg.appendChild(svgEl('line',{x1:mir.x,y1:mir.y,x2:mir.x-nx*40,y2:mir.y-ny*40,stroke:'#ADB5BD','stroke-width':1.5,'stroke-dasharray':'4 4'}));
      // 거울 드래그 핸들
      svg.appendChild(svgEl('circle',{cx:mir.x,cy:mir.y,r:30,fill:'transparent',class:'lt-grab','data-grab':'mir'}));
      sun(svg,src.x,src.y);
    }

    function renderStatus(){
      var s=el.querySelector('.lt-status');
      function fin(txt){
        s.textContent=txt;
        /* ── v2 검증 관측점 ── */
        var stg=el.querySelector('.lt-stage');
        if(stg){
          stg.dataset.exp=exp; stg.dataset.srcx=String(Math.round(src.x)); stg.dataset.srcy=String(Math.round(src.y));
          stg.dataset.objx=String(Math.round(obj.x)); stg.dataset.objh=String(Math.round(obj.h));
          stg.dataset.mirang=mir.ang.toFixed(2);
          var b=bandOf(src); stg.dataset.sh=b?String(Math.round(b.b-b.a)):'0';
          var b2=bandOf(src2); stg.dataset.sh2=b2?String(Math.round(b2.b-b2.a)):'0';
          stg.dataset.ov=(b&&b2)?String(Math.max(0,Math.round(Math.min(b.b,b2.b)-Math.max(b.a,b2.a)))):'0';
          stg.dataset.bend=bd.bend?'1':'0'; stg.dataset.bounces=String(m2b);
        }
      }
      if(mode==='quiz'){ fin('그림 속 빛을 잘 보고 답을 골라요!'); return; }
      /* ── v2 만약에 상태줄 ── */
      var wk=wifKey();
      if(wk==='two'){
        var bb1=bandOf(src), bb2=bandOf(src2), ovv=(bb1&&bb2)?Math.max(0,Math.min(bb1.b,bb2.b)-Math.max(bb1.a,bb2.a)):0;
        fin(ovv>0?'그림자가 두 개! 겹친 곳만 두 빛이 모두 못 닿아 진해요.':'전구마다 그림자가 하나씩 — 두 전구를 움직여 그림자를 겹쳐 봐요!');
        return;
      }
      if(wk==='bend'){
        fin(bd.bend?'빛이 물체를 휘어 돌아가니 스크린이 온통 환해요 — 그림자가 사라졌어요!':'직진 세상에선 물체 뒤에 그림자가 또렷해요 — 그림자는 직진의 증거!');
        return;
      }
      if(wk==='mirror2'){
        fin('빛이 두 거울 사이를 '+m2b+'번 튕기며 지그재그로 나아가요 — 닿을 때마다 입사각=반사각!');
        return;
      }
      if(exp==='shadow'){
        if(src.x>=obj.x){fin('전구를 물체 왼쪽으로 옮기면 그림자가 스크린에 생겨요.');return;}
        fin('빛은 곧게 나아가요. 물체에 막힌 곳 뒤로 그림자가 생겨요 — '+(obj.x-src.x<200?'전구가 가까워 그림자가 커요.':'전구가 멀어 그림자가 작아요.'));
      } else {
        fin('빛이 거울에 부딪히면 들어온 각(입사각)과 똑같은 각(반사각)으로 튕겨 나가요. 거울을 돌리면 반사 방향이 바뀌어요.');
      }
    }

    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){if(mode==='quiz')return;var g=e.target.closest?e.target.closest('.lt-grab'):null;if(!g)return;drag=g.getAttribute('data-grab');stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
    function move(e){if(!drag)return;var P=pt(e);
      if(drag==='src'){src.x=Math.max(40,Math.min(P[0],VBW-40));src.y=Math.max(TOP,Math.min(P[1],BOT));}
      else if(drag==='src2'){src2.x=Math.max(40,Math.min(P[0],VBW-40));src2.y=Math.max(TOP,Math.min(P[1],BOT));}
      else if(drag==='obj'){obj.x=Math.max(120,Math.min(P[0],SCRX-60));obj.y=Math.max(TOP+obj.h/2,Math.min(P[1],BOT-obj.h/2));}
      else if(drag==='mir'){mir.x=Math.max(260,Math.min(P[0],VBW-80));mir.y=Math.max(TOP+40,Math.min(P[1],BOT-40));}
      render();}
    function up(){drag=null;if(stage)stage.classList.remove('drag');}
    function bind(){
      stage=el.querySelector('.lt-stage');
      stage.addEventListener('mousedown',down); stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){move(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      el.querySelectorAll('.lt-mode').forEach(function(b){b.addEventListener('click',function(){if(exp!==b.dataset.mode){exp=b.dataset.mode;buildUI();}});});
      var rb=el.querySelector('[data-act="rot"]'); if(rb)rb.addEventListener('click',function(){mir.ang+=Math.PI/12;render();});
      /* ── v2 만약에 액션 ── */
      var bt=el.querySelector('[data-act="bendTgl"]'); if(bt)bt.addEventListener('click',function(){bd.bend=!bd.bend;snd('select');buildUI();});
      var tl=el.querySelector('[data-act="tilt"]'); if(tl)tl.addEventListener('click',function(){m2tilt-=0.05;snd('select');render();});
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
    /* ── v2 변수 바인딩 (1층) — 첫 조작 = 🔮 예측 무장 ── */
    function bindV2(){
      var sz=el.querySelector('.lt-size'); if(sz)sz.addEventListener('input',function(){
        obj.h=+sz.value; predArm('size');
        obj.y=Math.max(TOP+obj.h/2,Math.min(obj.y,BOT-obj.h/2));
        var lb=el.querySelector('.lt-sizelab'); if(lb)lb.textContent=String(obj.h);
        render(); checkPred();
      });
      var ag=el.querySelector('.lt-ang'); if(ag)ag.addEventListener('input',function(){
        mir.ang=+ag.value; predArm('ang');
        if(angSpan.min==null||mir.ang<angSpan.min)angSpan.min=mir.ang;
        if(angSpan.max==null||mir.ang>angSpan.max)angSpan.max=mir.ang;
        var lb=el.querySelector('.lt-anglab'); if(lb)lb.textContent=Math.round(mir.ang*180/Math.PI)+'°';
        render(); checkPred();
      });
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
