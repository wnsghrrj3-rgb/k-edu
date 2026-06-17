/* ============================================================================
   케이랩 도구 모듈 — 계절별 별자리 (constellation) v3  [과학 10호 · 천체 5호]
   ★ 3층 깊이 골든 샘플 — "확인 → 사고 → 상상"의 케이랩 차세대 표준 1호.
   5학년 태양계와 별 — 계절별 별자리와 북극성.

   1층 · 확인 (v2 유지)
     🧭 자유탐구  — 3D 공전 + 2D 밤하늘 패널. 공전 위치 → 보이는 별자리.
     ❓ 퀴즈      — 장면 관찰형 8문 풀 (이름 가림, 거꾸로 추리 포함).
   2층 · 사고 (신규)
     🎯 미션 6단계 — 만들기형 ↔ 생각형(선택지 추론) 교차.
        만들기: 조작으로 목표 상태. 생각: "왜?"를 고르고 이유 배너로 확인.
        거꾸로 추리(별자리→계절), 반대편 개념, 북극성 원리.
   3층 · 상상 (신규)
     🌀 만약에   — 예측 → 실험 → 정리. 물리 법칙을 직접 바꿔 본다.
        ☀️ 태양이 꺼진다면? (낮에도 별은 떠 있다 — 핵심 오개념 직격)
        🔄 거꾸로 공전한다면? (별자리 달력이 거꾸로)
        ⏸ 공전을 멈춘다면? (계절 별자리의 진짜 원인 체감)
     ✨ 내 별자리 — 밤하늘에 별을 놓아 나만의 별자리를 만들고 이름 붙여
        🔗 링크로 친구에게 — 받은 친구는 "무엇처럼 보일까?" 감상 모드.

   - 의존: THREE(전역), window.KLab (modeTabs extraLabels 지원 v2 이상)
   - config: { orb(0~360, 0봄·90여름·180가을·270겨울, 기본 270),
               view:"south"|"north", mode:"free"|"mission"|"quiz"|"whatif"|"mystar",
               stars:[[x,y],...], name:"..."  ← mystar 공유 링크 수신용 }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  // ── 순수 계산
  function nearestConst(orb){ return Math.round((((orb%360)+360)%360)/90)%4; }
  function visState(orb, i){
    var d=Math.abs((((orb - i*90)%360)+360)%360); if(d>180)d=360-d;
    if(d<60) return 'night';
    if(d>120) return 'day';
    return 'edge';
  }
  function seasonName(orb){
    var i=nearestConst(orb);
    return [{nm:'봄',emo:'🌸',col:'#F06595'},{nm:'여름',emo:'☀️',col:'#FF922B'},
            {nm:'가을',emo:'🍂',col:'#E8590C'},{nm:'겨울',emo:'❄️',col:'#4DABF7'}][i];
  }

  // ── 별자리 데이터
  var CONSTS=[
    { k:'leo', nm:'사자자리', sea:'봄',
      st:[[-34,-22],[-40,-8],[-34,4],[-22,8],[-16,-2],[-20,-14],[14,10],[36,2],[20,-12]],
      ln:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[4,8],[8,7],[7,6],[6,4]] },
    { k:'cyg', nm:'백조자리', sea:'여름',
      st:[[0,-28],[0,-10],[0,4],[0,18],[-22,-4],[-40,2],[22,-4],[40,2]],
      ln:[[0,1],[1,2],[2,3],[4,1],[5,4],[6,1],[7,6]] },
    { k:'peg', nm:'페가수스자리', sea:'가을',
      st:[[-20,-18],[18,-20],[20,12],[-18,14],[-34,2],[-44,-12],[34,-28]],
      ln:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[1,6]] },
    { k:'ori', nm:'오리온자리', sea:'겨울',
      st:[[-16,-22],[16,-20],[-6,-2],[0,0],[6,2],[-18,20],[14,22]],
      ln:[[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]] }
  ];
  var NORTH={
    st:[[-58,16],[-46,22],[-34,20],[-24,12],[-36,2],[-48,4],[-25,-1],
        [22,-26],[32,-18],[40,-26],[50,-20],[58,-30],[2,-26]],
    dip:[[0,1],[1,2],[2,3],[3,6],[6,4],[4,5],[5,3]],
    cas:[[7,8],[8,9],[9,10],[10,11]]
  };

  window.KLab.register('constellation', function (el, config) {
    var ui=window.KLab.ui;
    /* ── 학년 칸 (헌법 3장) — 같은 밤하늘 무대 공유, 모드·만약에만 칸별 스왑 ──
       저=별 잇기 놀이(밤하늘+내 별자리 창작) / 중=계절별 별자리(거꾸로 공전) / 고=연주운동(태양꺼짐·낮에도 별 풀버전). */
    var GRADES={
      low:  { modes:['free','mystar'],                          wif:[] },
      mid:  { modes:['free','mission','quiz','whatif','mystar'], wif:['reverse'] },
      high: { modes:['free','mission','quiz','whatif','mystar'], wif:['sunoff','reverse','freeze'] }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    var MODES=GRADES[grade].modes;
    var mode=(MODES.indexOf(config.mode)>=0)?config.mode:MODES[0];
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; MODES=GRADES[grade].modes; mode=MODES[0]; mStep=0;mDone=false;mLock=false; playing=false; pointerOn=false; view='south'; wifKey=null; wifPhase='pick'; buildUI();
    }});
    var orb=(config.orb!=null)?config.orb:270;
    var view=(config.view==='north')?'north':'south';
    var pointerOn=false;
    var playing=false, alive=true, last=0, spin=0;
    var C={ink:'#1B3A57',sub:'#5a7894',mute:'#8aa0b6'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var SEASONS=[ {o:0,l:'🌸 봄'},{o:90,l:'☀️ 여름'},{o:180,l:'🍂 가을'},{o:270,l:'❄️ 겨울'} ];

    /* ═══════════════ 2층 · 사고 미션 (만들기 ↔ 생각 교차 6단계) ═══════════════ */
    var MISSIONS=[
      { type:'make', text:'❄️ <b style="color:#7048E8;">겨울</b> 위치로 가서 남쪽 하늘에 <b style="color:#7048E8;">오리온자리</b>를 띄워 봐요!',
        check:function(){ return view==='south' && nearestConst(orb)===3; } },
      { type:'think', text:'🤔 방금 본 오리온자리처럼, <b style="color:#7048E8;">한밤 남쪽 하늘에 잘 보이는 별자리</b>는 지구에서 봤을 때 어느 쪽에 있을까요?',
        ch:['태양 반대쪽','태양과 같은 쪽','지구 바로 위'], a:0,
        why:'밤 = 태양을 등진 쪽! 그래서 태양 반대쪽 별자리가 밤하늘에 잘 보여요.' },
      { type:'make', text:'🦁 거꾸로 추리! 밤하늘에 <b style="color:#7048E8;">사자자리</b>가 보였대요. 사자자리가 무슨 계절 별자리인지 생각해서, 지구를 <b style="color:#7048E8;">그 계절 위치</b>로 옮겨 봐요!',
        check:function(){ return view==='south' && nearestConst(orb)===0; } },
      { type:'think', set:function(){ orb=180; view='south'; pointerOn=false; },
        text:'🤔 지금 지구는 <b style="color:#7048E8;">가을</b> 위치예요. 그럼 <b style="color:#7048E8;">태양 쪽에 있어서 볼 수 없는</b> 별자리는 무엇일까요? (3D 화면에서 흐려진 쪽을 봐요)',
        ch:['봄 별자리 (사자자리)','가을 별자리 (페가수스자리)','북쪽 별자리 (북두칠성)'], a:0,
        why:'가을의 반대편 = 봄! 사자자리는 태양과 같은 쪽(낮 하늘)에 숨어 있어요. 반년 뒤에 다시 만나요.' },
      { type:'make', text:'⭐ <b style="color:#7048E8;">북쪽 하늘</b>로 가서 <b style="color:#7048E8;">북극성 찾기</b>를 눌러요 — 국자 끝 두 별 사이를 5배!',
        check:function(){ return view==='north' && pointerOn; } },
      { type:'think', set:function(){ view='north'; pointerOn=true; },
        text:'🤔 마지막 질문! 북극성은 <b style="color:#7048E8;">왜 일 년 내내 같은 자리</b>에 있을까요?',
        ch:['지구 자전축이 가리키는 방향이라서','북극성이 지구를 따라다녀서','태양보다 밝아서'], a:0,
        why:'북극성은 지구 자전축의 연장선 위! 지구가 돌고 공전해도 축이 가리키는 방향은 그대로예요.' }
    ];
    var mStep=0,mDone=false,mLock=false;
    function applyMissionSet(){ var m=MISSIONS[mStep]; if(m&&m.set){m.set();} }
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var m=MISSIONS[mStep];
      if(m.type==='make' && m.check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ advanceMission(); },1500);
      }
    }
    function advanceMission(){
      mLock=false;
      if(mStep<MISSIONS.length-1){ mStep++; applyMissionSet(); }
      else { mDone=true; }
      updateBars(); buildMissionFoot(); render(); renderStatus();
    }
    function buildMissionFoot(){
      var fc=el.querySelector('.cn-foot'); if(!fc)return;
      if(mode!=='mission'||mDone){ fc.innerHTML=''; return; }
      var m=MISSIONS[mStep];
      if(m.type!=='think'){ fc.innerHTML=''; return; }
      var idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      fc.innerHTML=ui.choices(idx.map(function(i){return {v:i,label:'<span style="font-size:19px;">'+m.ch[i]+'</span>'};}));
      fc.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(mLock)return;
          var ok=(+b.dataset.v===m.a);
          if(!ok){ ui.toast(el,false); return; }
          mLock=true;
          var host=el.querySelector('.cn-bars');
          if(host)host.innerHTML='<div style="text-align:center;background:#E6FCF5;border:3px solid #12B886;border-radius:18px;padding:13px 16px;margin-bottom:12px;">'
            +'<span style="font-size:21px;font-weight:800;color:#0B7A5C;">✅ 정답! '+m.why+'</span></div>';
          fc.innerHTML='';
          setTimeout(function(){ advanceMission(); },2400);
        });
      });
    }
    function updateBars(){
      var host=el.querySelector('.cn-bars'); if(!host)return;
      if(mode==='mission')host.innerHTML=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else if(mode==='whatif')host.innerHTML=wifBarHTML();
      else if(mode==='mystar')host.innerHTML=myBarHTML();
      else host.innerHTML='';
    }

    /* ═══════════════ 1층 · 퀴즈 (풀 8문 — 관찰 + 거꾸로 추리) ═══════════════ */
    var QUIZ=[
      { orb:270, view:'south', ptr:false, q:'겨울 밤하늘 — 오른쪽 패널의 이 별자리는?', ch:['오리온자리','백조자리','사자자리'], a:0 },
      { orb:90,  view:'south', ptr:false, q:'여름 밤하늘 — 이 별자리의 이름은?', ch:['백조자리','오리온자리','페가수스자리'], a:0 },
      { orb:270, view:'north', ptr:false, q:'일 년 내내 북쪽 같은 자리에서 빛나는 별(물음표 자리)은?', ch:['북극성','오리온자리의 별','태양'], a:0 },
      { orb:0,   view:'south', ptr:false, q:'계절마다 보이는 별자리가 다른 까닭은?', ch:['지구가 공전해서','별이 빠르게 움직여서','달이 별을 가려서'], a:0 },
      { orb:270, view:'north', ptr:true,  q:'북극성을 찾을 때 국자 끝 두 별을 이용하는 별자리는?', ch:['북두칠성','오리온자리','사자자리'], a:0 },
      { orb:180, view:'south', ptr:false, q:'거꾸로 추리! 밤하늘에 이 별자리(페가수스)가 보여요. 지금 지구는 어느 계절 위치일까요?', ch:['가을','봄','여름'], a:0 },
      { orb:90,  view:'south', ptr:false, q:'낮에는 왜 별자리가 안 보일까요?', ch:['태양 빛이 너무 밝아서','낮에는 별이 사라져서','별이 너무 멀어져서'], a:0 },
      { orb:0,   view:'south', ptr:false, q:'봄에 잘 보이는 사자자리 — 반년 뒤 가을엔 어떻게 될까요?', ch:['태양 쪽에 있어 보이지 않아요','밤하늘 한가운데 보여요','북쪽 하늘로 옮겨 가요'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      orb=QUIZ[qIdx].orb; view=QUIZ[qIdx].view; pointerOn=QUIZ[qIdx].ptr;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }
    function bindQuizChoices(){
      el.querySelectorAll('.cn-foot .kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); updateBars();
            var fc=el.querySelector('.cn-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindQuizChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }

    /* ═══════════════ 3층 · 🌀 만약에 (예측 → 실험 → 정리) ═══════════════ */
    var WHATIF={
      sunoff:{ icon:'☀️', title:'태양이 꺼진다면?',
        q:'태양이 갑자기 꺼져서 빛이 사라지면, 별자리는 어떻게 보일까요?',
        ch:['사방의 별자리를 다 볼 수 있어요','별도 같이 다 사라져요','지금과 똑같아요'], a:0,
        reveal:'별은 늘 떠 있었어요! 태양 빛이 너무 밝아서 낮 하늘의 별이 안 보였을 뿐이에요. 태양을 끄니 네 별자리가 한꺼번에 보이죠?',
        tip:'슬라이더를 움직여 봐요 — 지구가 어디에 있든 별자리 네 개가 전부 보여요!' },
      reverse:{ icon:'🔄', title:'지구가 거꾸로 공전한다면?',
        q:'지구가 반대 방향으로 공전하면, 봄 별자리(사자) 다음엔 어느 계절 별자리가 올까요?',
        ch:['겨울 별자리 (오리온)','여름 별자리 (백조)','계속 사자자리'], a:0,
        reveal:'공전 방향이 반대면 별자리 달력도 거꾸로 넘어가요! 봄 → 겨울 → 가을 → 여름 순서가 돼요.',
        tip:'▶ 1년 재생을 눌러 봐요 — 계절 별자리가 거꾸로 흘러가요!' },
      freeze:{ icon:'⏸', title:'지구가 공전을 멈춘다면?',
        q:'지구가 공전을 딱 멈추면, 밤하늘 별자리는 어떻게 될까요?',
        ch:['일 년 내내 같은 별자리만 보여요','그래도 계절마다 바뀌어요','별이 다 사라져요'], a:0,
        reveal:'이게 바로 계절별 별자리의 비밀! 별자리가 바뀌는 건 별이 움직여서가 아니라 지구가 공전하기 때문이에요. 멈추면 매일 밤 똑같은 하늘이죠.',
        tip:'▶ 시간 흐르기를 눌러 봐요 — 날짜는 흘러도 하늘은 그대로!' }
    };
    var wifKey=null, wifPhase='pick', wifChoice=null, dayCnt=0;
    function wifSandboxOn(){ return mode==='whatif' && wifKey && (wifPhase==='play'||wifPhase==='reveal'); }
    function wifBarHTML(){
      var card='font-size:19px;padding:14px 18px;border-radius:16px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;';
      if(wifPhase==='pick'){
        return '<div style="text-align:center;background:#E3FAFC;border:3px solid #0B7285;border-radius:18px;padding:12px 16px;margin-bottom:10px;">'
          +'<div style="font-size:22px;font-weight:800;color:#0B7285;">🌀 만약에… 상상해 보고, 직접 확인해요!</div></div>'
          +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +GRADES[grade].wif.map(function(k){var w=WHATIF[k];
            return '<button class="cn-wifcard" data-k="'+k+'" style="'+card+'">'+w.icon+' '+w.title+'</button>';}).join('')
          +'</div>';
      }
      var w=WHATIF[wifKey];
      if(wifPhase==='predict'){
        return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;background:#F3F0FF;border:3px solid #7048E8;border-radius:18px;padding:12px 18px;margin-bottom:12px;">'
          +'<span style="font-size:17px;font-weight:800;color:#fff;background:#7048E8;border-radius:10px;padding:6px 12px;white-space:nowrap;">🔮 예측</span>'
          +'<span style="font-size:22px;font-weight:800;color:#4527A0;">'+w.icon+' '+w.q+'</span></div>';
      }
      if(wifPhase==='play'){
        return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;background:#E3FAFC;border:3px solid #0B7285;border-radius:18px;padding:11px 16px;margin-bottom:10px;">'
          +'<span style="font-size:17px;font-weight:800;color:#fff;background:#0B7285;border-radius:10px;padding:6px 12px;white-space:nowrap;">🧪 실험 중</span>'
          +'<span style="font-size:20px;font-weight:800;color:#0B7285;">'+w.icon+' '+w.tip+'</span>'
          +'<button class="cn-wifreveal" style="font-size:18px;padding:9px 16px;border-radius:12px;border:3px solid #7048E8;background:#7048E8;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;">💡 정리 보기</button>'
          +'<button class="cn-wifback" style="font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;">← 다른 만약에</button></div>';
      }
      // reveal
      var mine=w.ch[wifChoice!=null?wifChoice:0], hit=(wifChoice===w.a);
      return '<div style="background:#E6FCF5;border:3px solid #12B886;border-radius:18px;padding:14px 18px;margin-bottom:10px;text-align:center;">'
        +'<div style="font-size:21px;font-weight:800;color:#0B7A5C;">💡 '+w.reveal+'</div>'
        +'<div style="font-size:17px;font-weight:800;color:'+(hit?'#0B7A5C':'#E8590C')+';margin-top:8px;">네 예측: “'+mine+'” → '
        +(hit?'정확했어요! 🎯':'실제는 달랐죠? 예측이 빗나갈 때 더 크게 배워요! 💪')+'</div>'
        +'<div style="margin-top:10px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        +'<button class="cn-wifplay" style="font-size:17px;padding:9px 15px;border-radius:12px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;">🔁 더 가지고 놀기</button>'
        +'<button class="cn-wifback" style="font-size:17px;padding:9px 15px;border-radius:12px;border:3px solid #0B7285;background:#0B7285;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;">🌀 다른 만약에</button></div></div>';
    }
    function applyWhatifPhysics(){
      var on=wifSandboxOn();
      var sunOff=on&&wifKey==='sunoff';
      if(sunSpr){ sunSpr.material.opacity=sunOff?0.06:1; }
      if(sunLight){ sunLight.intensity=sunOff?0.12:1.9; }
      if(ambLight){ ambLight.intensity=sunOff?0.6:0.3; }
      if(starMat){ starMat.opacity=sunOff?0.95:0.45; }
    }
    function bindWhatif(){
      el.querySelectorAll('.cn-wifcard').forEach(function(b){
        b.addEventListener('click',function(){
          wifKey=b.dataset.k; wifPhase='predict'; wifChoice=null; dayCnt=0;
          orb=(wifKey==='reverse')?0:270; view='south'; pointerOn=false; playing=false;
          buildUI();
        });
      });
      var rv=el.querySelector('.cn-wifreveal'); if(rv)rv.addEventListener('click',function(){ wifPhase='reveal'; playing=false; buildUI(); });
      el.querySelectorAll('.cn-wifback').forEach(function(b){b.addEventListener('click',function(){
        wifKey=null; wifPhase='pick'; wifChoice=null; playing=false; dayCnt=0; orb=270; buildUI();
      });});
      var pl=el.querySelector('.cn-wifplay'); if(pl)pl.addEventListener('click',function(){ wifPhase='play'; buildUI(); });
      if(wifPhase==='predict'){
        var w=WHATIF[wifKey];
        var fc=el.querySelector('.cn-foot');
        var idx=[0,1,2].sort(function(){return Math.random()-0.5;});
        fc.innerHTML=ui.choices(idx.map(function(i){return {v:i,label:'<span style="font-size:19px;">'+w.ch[i]+'</span>'};}));
        fc.querySelectorAll('.kl-choice').forEach(function(b){
          b.addEventListener('click',function(){
            wifChoice=+b.dataset.v;
            ui.toast(el,true,'🔮 예측 완료! 이제 직접 확인해 봐요');
            setTimeout(function(){ wifPhase='play'; dayCnt=0; buildUI(); },1200);
          });
        });
      }
    }

    /* ═══════════════ 3층 · ✨ 내 별자리 (창작 + 링크 공유) ═══════════════ */
    var MYMAX=12;
    var myStars=[], myName='', myView=false, myRevealed=false;
    if(config.mode==='mystar'&&Array.isArray(config.stars)&&config.stars.length){
      myView=true; myStars=config.stars.slice(0,MYMAX).map(function(p){return [Math.max(4,Math.min(+p[0]||0,196)),Math.max(4,Math.min(+p[1]||0,108))];});
      myName=(typeof config.name==='string')?config.name.slice(0,12):'';
    }
    function myBarHTML(){
      if(myView){
        return '<div style="text-align:center;background:#F3F0FF;border:3px solid #7048E8;border-radius:18px;padding:13px 16px;margin-bottom:10px;">'
          +'<span style="font-size:22px;font-weight:800;color:#4527A0;">🎁 친구가 보낸 별자리예요! 무엇처럼 보이나요?</span></div>';
      }
      return '<div style="text-align:center;background:#F3F0FF;border:3px solid #7048E8;border-radius:18px;padding:12px 16px;margin-bottom:10px;">'
        +'<span style="font-size:21px;font-weight:800;color:#4527A0;">✨ 밤하늘을 눌러 별을 놓고, 나만의 별자리를 만들어요! (별 3개부터 별자리)</span></div>';
    }
    function klabBase(){
      var base=location.href.split('?')[0];
      if(!/klab\.html$/.test(base)) base=base.replace(/[^\/]*$/,'klab.html');
      return base;
    }
    function myShareURL(){
      var cfg={mode:'mystar',stars:myStars.map(function(p){return [Math.round(p[0]),Math.round(p[1])];}),name:myName||'이름 없는 별자리'};
      return klabBase()+'?tool=constellation&cfg='+encodeURIComponent(JSON.stringify(cfg))+'&label='+encodeURIComponent('✨ 내 별자리');
    }
    function myCopy(btn){
      var url=myShareURL();
      function done(){ var o=btn.textContent; btn.textContent='✓ 복사됐어요! 친구에게 붙여 보내요'; btn.disabled=true;
        setTimeout(function(){btn.textContent=o;btn.disabled=false;},1600); }
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(done,function(){window.prompt('링크를 복사하세요',url);}); }
      else window.prompt('링크를 복사하세요',url);
    }
    function buildMyStage(){
      var host=el.querySelector('.cn-mystage'); if(!host)return;
      host.innerHTML='';
      var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 200 120'); svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
      svg.setAttribute('class','cn-mysky'); svg.style.display='block'; svg.style.cursor=myView?'default':'crosshair';
      var defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
      defs.innerHTML='<radialGradient id="cnMyBg" cx="50%" cy="0%" r="120%">'
        +'<stop offset="0" stop-color="#16224a"/><stop offset="0.6" stop-color="#0b1230"/><stop offset="1" stop-color="#05081a"/></radialGradient>'
        +'<filter id="cnGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.4" result="b"/>'
        +'<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      svg.appendChild(defs);
      var bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
      bg.setAttribute('x',0);bg.setAttribute('y',0);bg.setAttribute('width',200);bg.setAttribute('height',120);
      bg.setAttribute('fill','url(#cnMyBg)');bg.setAttribute('rx',6); svg.appendChild(bg);
      // 잔별 배경 (반짝)
      for(var i=0;i<46;i++){
        var sx=Math.random()*196+2, sy=Math.random()*112+2, r=Math.random()*0.7+0.3;
        var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',sx);c.setAttribute('cy',sy);c.setAttribute('r',r);
        c.setAttribute('fill','#cdd6ff');c.setAttribute('opacity',(0.18+Math.random()*0.3).toFixed(2));
        var an=document.createElementNS('http://www.w3.org/2000/svg','animate');
        an.setAttribute('attributeName','opacity');
        an.setAttribute('values',(0.12+Math.random()*0.2).toFixed(2)+';'+(0.4+Math.random()*0.3).toFixed(2)+';'+(0.12+Math.random()*0.2).toFixed(2));
        an.setAttribute('dur',(1.8+Math.random()*2.4).toFixed(1)+'s'); an.setAttribute('repeatCount','indefinite');
        c.appendChild(an); svg.appendChild(c);
      }
      var g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.setAttribute('class','cn-myg'); svg.appendChild(g);
      host.appendChild(svg);
      if(!myView){
        svg.addEventListener('click',function(ev){
          if(myStars.length>=MYMAX){ ui.toast(el,false,'별은 최대 '+MYMAX+'개까지!'); return; }
          var box=svg.getBoundingClientRect(); if(!box.width||!box.height)return;
          var x=(ev.clientX-box.left)*(200/box.width), y=(ev.clientY-box.top)*(120/box.height);
          x=Math.max(4,Math.min(x,196)); y=Math.max(4,Math.min(y,108));
          myStars.push([x,y]); drawMyStars(); renderStatus(); updateMyButtons();
        });
      }
      drawMyStars();
    }
    function drawMyStars(){
      var g=el.querySelector('.cn-myg'); if(!g)return;
      g.innerHTML='';
      function S(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
      for(var i=1;i<myStars.length;i++){
        g.appendChild(S('line',{x1:myStars[i-1][0],y1:myStars[i-1][1],x2:myStars[i][0],y2:myStars[i][1],
          stroke:'#9fb6ff','stroke-width':1.4,opacity:0.9,filter:'url(#cnGlow)'}));
      }
      myStars.forEach(function(p,i){
        var st=S('circle',{cx:p[0],cy:p[1],r:i===0?3.2:2.6,fill:'#FFE08A',filter:'url(#cnGlow)',class:'cn-mystar'});
        var an=document.createElementNS('http://www.w3.org/2000/svg','animate');
        an.setAttribute('attributeName','r');
        an.setAttribute('values',(i===0?'3.2;3.9;3.2':'2.6;3.2;2.6'));
        an.setAttribute('dur',(1.6+(i%5)*0.3)+'s'); an.setAttribute('repeatCount','indefinite');
        st.appendChild(an); g.appendChild(st);
      });
      // 이름판
      if(myStars.length>=3 && (myName||myView)){
        var show = myView ? (myRevealed?('⭐ '+(myName||'이름 없는 별자리')):'❔ 이름이 숨겨져 있어요') : ('⭐ '+myName);
        var t=S('text',{x:100,y:12,'text-anchor':'middle',fill:'#FFE08A','font-size':8.5,'font-weight':800,'font-family':'inherit',opacity:0.95});
        t.textContent=show; g.appendChild(t);
      }
    }
    function updateMyButtons(){
      var u=el.querySelector('[data-act="myundo"]'), cl=el.querySelector('[data-act="myclear"]'), sh=el.querySelector('[data-act="myshare"]');
      if(u)u.disabled=myStars.length===0;
      if(cl)cl.disabled=myStars.length===0;
      if(sh)sh.disabled=myStars.length<3;
    }
    function bindMyStar(){
      var inp=el.querySelector('.cn-myname');
      if(inp)inp.addEventListener('input',function(){ myName=inp.value.slice(0,12); drawMyStars(); });
      var u=el.querySelector('[data-act="myundo"]'); if(u)u.addEventListener('click',function(){ myStars.pop(); drawMyStars(); renderStatus(); updateMyButtons(); });
      var cl=el.querySelector('[data-act="myclear"]'); if(cl)cl.addEventListener('click',function(){ myStars=[]; drawMyStars(); renderStatus(); updateMyButtons(); });
      var sh=el.querySelector('[data-act="myshare"]'); if(sh)sh.addEventListener('click',function(){ myCopy(sh); });
      var rvl=el.querySelector('[data-act="myreveal"]'); if(rvl)rvl.addEventListener('click',function(){
        myRevealed=true; drawMyStars();
        ui.toast(el,true,'⭐ 「'+(myName||'이름 없는 별자리')+'」!');
        var st=el.querySelector('.cn-status');
        if(st)st.innerHTML='<div style="font-size:24px;color:#7048E8;">⭐ 「'+(myName||'이름 없는 별자리')+'」</div>'
          +'<div style="font-size:17px;color:#5a7894;margin-top:5px;">옛날 사람들도 이렇게 밤하늘 별을 이어 사자·백조 이야기를 만들었어요. 별자리는 상상에서 태어났답니다!</div>';
        rvl.style.display='none';
      });
      var mk=el.querySelector('[data-act="mymake"]'); if(mk)mk.addEventListener('click',function(){
        myView=false; myRevealed=false; myStars=[]; myName=''; buildUI();
      });
      updateMyButtons();
    }

    /* ═══════════════ 화면 구성 ═══════════════ */
    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(MODES,mode,{whatif:'🌀 만약에',mystar:'✨ 내 별자리'});
      var bar='', foot='';
      if(mode==='mission')bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif')bar=wifBarHTML();
      else if(mode==='mystar')bar=myBarHTML();

      var css='<style>.cn-btn:active,.cn-sea:active,.cn-vw:active,.kl-choice:active,.cn-wifcard:active,.cn-my:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.cn-sea.on,.cn-vw.on{background:#1565C0 !important;border-color:#1565C0 !important;color:#fff !important;}'
        +'.cn-btn[disabled],.cn-my[disabled]{opacity:.35;cursor:not-allowed;}'
        +'.cn-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#F06595,#FF922B,#E8590C,#4DABF7,#F06595);outline:none;}'
        +'.cn-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.cn-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.cn-star{transition:opacity .3s;}</style>';

      if(mode==='mystar'){
        var mybtn='font-size:18px;padding:10px 15px;border-radius:13px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
        var rows;
        if(myView){
          rows='<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;">'
            +'<button class="cn-my" data-act="myreveal" style="'+mybtn+'background:#7048E8;color:#fff;">✨ 이름 공개</button>'
            +'<button class="cn-my" data-act="mymake" style="'+mybtn+'">🖌 나도 만들기</button>'
          +'</div>';
        } else {
          rows='<div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;align-items:center;margin-bottom:10px;">'
            +'<input class="cn-myname" maxlength="12" placeholder="별자리 이름을 지어 줘요" value="'+myName.replace(/"/g,'&quot;')+'" '
              +'style="font-size:19px;font-weight:800;font-family:inherit;padding:10px 14px;border-radius:13px;border:3px solid #C9D7E6;width:min(56vw,260px);color:#1B3A57;">'
            +'<button class="cn-my" data-act="myundo" style="'+mybtn+'">↩ 하나 지우기</button>'
            +'<button class="cn-my" data-act="myclear" style="'+mybtn+'border-color:#C9D7E6;color:#5a7894;">🗑 처음부터</button>'
            +'<button class="cn-my" data-act="myshare" style="'+mybtn+'background:#7048E8;color:#fff;">🔗 친구에게 링크 보내기</button>'
          +'</div>';
        }
        el.innerHTML=css+top+'<div class="cn-bars">'+bar+'</div>'+rows
          +'<div class="kl-stage-host" style="position:relative;"><div class="cn-mystage" style="width:100%;height:46vh;min-height:320px;border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);background:#05081a;"></div></div>'
          +'<div class="cn-foot"></div>'
          +'<div class="cn-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
        bindTabs();
        if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
        buildMyStage(); bindMyStar(); renderStatus();
        return;
      }

      var hideCtrl=(mode==='quiz')||(mode==='whatif'&&(wifPhase==='pick'||wifPhase==='predict'));
      var frozen=wifSandboxOn()&&wifKey==='freeze';
      var playLabel=frozen?(playing?'■ 멈춤':'▶ 시간 흐르기'):(playing?'■ 멈춤':'▶ 1년 재생');
      el.innerHTML=css
        + top + '<div class="cn-bars">'+bar+'</div>'
        +(hideCtrl?'<div style="display:none;">':'<div>')
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'+SEASONS.map(function(s){return '<button class="cn-sea" data-o="'+s.o+'" style="'+sbtn+'">'+s.l+'</button>';}).join('')
          +'<span style="width:10px;"></span>'
          +(mode==='whatif'?'':'<button class="cn-vw" data-v="south" style="'+sbtn+'">🌌 남쪽 하늘</button>'
          +'<button class="cn-vw" data-v="north" style="'+sbtn+'">🧭 북쪽 하늘</button>'
          +'<button class="cn-btn" data-act="polaris" style="'+sbtn+'border-color:#FFD43B;color:#9A6700;background:#FFF9DB;">⭐ 북극성 찾기</button>')
        +'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<button class="cn-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+playLabel+'</button>'
          +'<span style="font-size:15px;color:#5a7894;font-weight:800;">공전 위치</span>'
          +'<input class="cn-range" type="range" min="0" max="360" step="1" value="'+orb+'" '+(frozen?'disabled':'')+' style="width:min(40vw,280px);'+(frozen?'opacity:.4;':'')+'">'
        +'</div>'
        +'</div>'
        +'<div class="kl-stage-host" style="position:relative;"><div class="cn-stage" style="position:relative;width:100%;height:'+(mode==='quiz'?'38vh':'42vh')+';min-height:'+(mode==='quiz'?'280':'320')+'px;background:radial-gradient(120% 120% at 60% 35%,#0D1430 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +'<div class="cn-panel" style="position:absolute;top:12px;right:12px;width:196px;text-align:center;pointer-events:none;background:rgba(8,12,26,0.6);border-radius:14px;padding:7px 6px 5px;">'
            +'<svg class="cn-sky" viewBox="-70 -46 140 84" width="188" height="112">'
              +'<defs><linearGradient id="cnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1733"/><stop offset="1" stop-color="#27406e"/></linearGradient></defs>'
              +'<rect x="-70" y="-46" width="140" height="80" fill="url(#cnSky)" rx="6"/>'
              +'<g class="cn-skyg"></g>'
              +'<line x1="-66" y1="30" x2="66" y2="30" stroke="#6b8a4a" stroke-width="3"/>'
              +'<rect x="-66" y="30" width="132" height="4" fill="#3f5a28"/>'
            +'</svg>'
            +'<div class="cn-panel-cap" style="font-size:12px;color:#cdd6e6;font-weight:800;margin-top:1px;"></div>'
          +'</div>'
        +'</div></div>'
        +'<div class="cn-foot">'+foot+'</div>'
        +'<div class="cn-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      bindTabs();
      initThree(); bind(); bands.bind(el);
      if(mode==='quiz')bindQuizChoices();
      if(mode==='whatif')bindWhatif();
      if(mode==='mission')buildMissionFoot();
      applyWhatifPhysics();
      render(); renderStatus();
    }
    function bindTabs(){
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; playing=false; pointerOn=false; view='south';
        wifKey=null; wifPhase='pick'; wifChoice=null; dayCnt=0;
        orb=(m==='mission')?0:270;
        if(m==='mission')applyMissionSet();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        if(m==='mystar'&&!myView){ /* 편집 상태 유지 */ }
        buildUI();
      });
    }

    /* ═══════════════ 3D ═══════════════ */
    var stage,scene,camera,renderer,earthPivot,earthSphere,constGroups=[],orbitR=5,farR=9.2;
    var sunSpr=null,sunLight=null,ambLight=null,starMat=null;
    function earthTex(){
      var c=document.createElement('canvas'); c.width=256; c.height=128; var x=c.getContext('2d');
      x.fillStyle='#1565C0'; x.fillRect(0,0,256,128);
      x.fillStyle='#2F9E44';
      [[40,42,34,26],[95,38,42,30],[150,72,40,24],[200,46,34,28]].forEach(function(b){x.beginPath();x.ellipse(b[0],b[1],b[2],b[3],0,0,7);x.fill();});
      return new T.CanvasTexture(c);
    }
    function initThree(){
      if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
      constGroups=[];
      stage=el.querySelector('.cn-stage'); if(!stage)return;
      var W=stage.clientWidth||720, H=stage.clientHeight||340;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(46, W/H, 0.1, 120);
      renderer=new T.WebGLRenderer({antialias:true, alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      ambLight=new T.AmbientLight(0xffffff,0.3); scene.add(ambLight);
      sunLight=new T.PointLight(0xffffff,1.9,0); sunLight.position.set(0,0,0); scene.add(sunLight);
      // 잔별 우주 배경 (만약에-태양 끄기에서 확 살아남)
      var bgPts=[];
      for(var i=0;i<170;i++){
        var th=Math.random()*Math.PI*2, ph2=Math.acos(Math.random()*2-1), r2=26+Math.random()*14;
        bgPts.push(new T.Vector3(r2*Math.sin(ph2)*Math.cos(th), r2*Math.cos(ph2)*0.6, r2*Math.sin(ph2)*Math.sin(th)));
      }
      starMat=new T.PointsMaterial({color:0xCDD6FF,size:0.22,transparent:true,opacity:0.45,depthWrite:false});
      scene.add(new T.Points(new T.BufferGeometry().setFromPoints(bgPts), starMat));
      // 태양 스프라이트
      var sc=document.createElement('canvas'); sc.width=128; sc.height=128; var sx=sc.getContext('2d');
      var g=sx.createRadialGradient(64,64,6,64,64,62); g.addColorStop(0,'#FFFBEA'); g.addColorStop(0.45,'#FFD43B'); g.addColorStop(1,'rgba(255,170,40,0)');
      sx.fillStyle=g; sx.fillRect(0,0,128,128);
      sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc),transparent:true,depthTest:false}));
      sunSpr.position.set(0,0,0); sunSpr.scale.set(2.4,2.4,1); scene.add(sunSpr);
      // 궤도 링
      var ring=new T.Mesh(new T.RingGeometry(orbitR-0.025,orbitR+0.025,80), new T.MeshBasicMaterial({color:0x3a4a6a,side:T.DoubleSide,transparent:true,opacity:0.55}));
      ring.rotation.x=Math.PI/2; scene.add(ring);
      // 지구
      earthPivot=new T.Group(); scene.add(earthPivot);
      earthSphere=new T.Mesh(new T.SphereGeometry(0.5,36,24), new T.MeshStandardMaterial({map:earthTex(),roughness:1,metalness:0}));
      earthPivot.add(earthSphere);
      // 별자리 4그룹
      CONSTS.forEach(function(cd,i){
        var ph=(i*90+90)*Math.PI/180;
        var cx=farR*Math.cos(ph), cz=farR*Math.sin(ph);
        var tx=-Math.sin(ph), tz=Math.cos(ph);
        var grp=new T.Group(); grp.position.set(0,0,0);
        var sMat=new T.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:1});
        var lMat=new T.LineBasicMaterial({color:0x9fb6ff,transparent:true,opacity:0.85});
        var SC=0.034;
        var pts3=cd.st.map(function(p){ return new T.Vector3(cx+tx*p[0]*SC, -p[1]*SC, cz+tz*p[0]*SC); });
        pts3.forEach(function(v){ var m=new T.Mesh(new T.SphereGeometry(0.085,10,8), sMat); m.position.copy(v); grp.add(m); });
        cd.ln.forEach(function(L){
          var gm=new T.BufferGeometry().setFromPoints([pts3[L[0]],pts3[L[1]]]);
          grp.add(new T.Line(gm,lMat));
        });
        grp.userData={sMat:sMat,lMat:lMat};
        scene.add(grp); constGroups.push(grp);
      });
      theta=0.78; phi=0.62; camPos();
    }
    var theta=0.78, phi=0.62, radius=15.5;
    function camPos(){ if(!camera)return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }
    function earthPos(o){ var ph=(o+90)*Math.PI/180; return {x:orbitR*Math.cos(ph), z:orbitR*Math.sin(ph)}; }

    /* ═══════════════ 2D 밤하늘 패널 ═══════════════ */
    function svgNS(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function drawConst(g, cd, cls, op, col){
      cd.ln.forEach(function(L){
        g.appendChild(svgNS('line',{x1:cd.st[L[0]][0],y1:cd.st[L[0]][1],x2:cd.st[L[1]][0],y2:cd.st[L[1]][1],
          stroke:col||'#9fb6ff','stroke-width':1.5,opacity:op,class:cls}));
      });
      cd.st.forEach(function(p){
        g.appendChild(svgNS('circle',{cx:p[0],cy:p[1],r:2.4,fill:'#fff',opacity:op,class:cls}));
      });
    }
    function renderPanel(){
      var g=el.querySelector('.cn-skyg'); if(!g)return;
      g.innerHTML='';
      var cap=el.querySelector('.cn-panel-cap');
      var sunOff=wifSandboxOn()&&wifKey==='sunoff';
      if(view==='south'){
        var i=nearestConst(orb), cd=CONSTS[i];
        drawConst(g,{st:cd.st.map(function(p){return [p[0],p[1]-8];}),ln:cd.ln},'cn-star',1);
        if(sunOff){
          // 태양이 꺼지면 반대편(낮이던 쪽) 별자리도 작게 함께!
          var opp=CONSTS[(i+2)%4];
          drawConst(g,{st:opp.st.map(function(p){return [p[0]*0.42+44,p[1]*0.42-28];}),ln:opp.ln},'cn-star',0.85,'#FFD8A8');
        }
        var t=svgNS('text',{x:0,y:-38,'text-anchor':'middle',fill:'#FFE08A','font-size':11,'font-weight':800,'font-family':'inherit'});
        t.textContent=(mode==='quiz')?'이 별자리는 무엇일까요?':(cd.nm+' ('+cd.sea+')'); g.appendChild(t);
        if(cap)cap.textContent=sunOff?'태양 없는 하늘 — 어디든 별!':(wifSandboxOn()&&wifKey==='freeze'?('📅 +'+Math.floor(dayCnt)+'일째 같은 하늘'):'지금 밤, 남쪽 하늘');
      } else {
        var st=NORTH.st.map(function(p){return [p[0]*0.92,p[1]*0.92-2];});
        NORTH.dip.forEach(function(L){g.appendChild(svgNS('line',{x1:st[L[0]][0],y1:st[L[0]][1],x2:st[L[1]][0],y2:st[L[1]][1],stroke:'#9fb6ff','stroke-width':1.5}));});
        NORTH.cas.forEach(function(L){g.appendChild(svgNS('line',{x1:st[L[0]][0],y1:st[L[0]][1],x2:st[L[1]][0],y2:st[L[1]][1],stroke:'#9fb6ff','stroke-width':1.5}));});
        st.forEach(function(p,idx){ if(idx===12)return;
          g.appendChild(svgNS('circle',{cx:p[0],cy:p[1],r:2.4,fill:'#fff'}));});
        if(pointerOn){
          g.appendChild(svgNS('line',{x1:st[5][0],y1:st[5][1],x2:st[12][0],y2:st[12][1],
            stroke:'#FFD43B','stroke-width':1.8,'stroke-dasharray':'4 3',class:'cn-pointer'}));
          var t5=svgNS('text',{x:(st[5][0]+st[12][0])/2,y:(st[5][1]+st[12][1])/2-5,'text-anchor':'middle',fill:'#FFD43B','font-size':10,'font-weight':800,'font-family':'inherit'});
          t5.textContent='5배!'; g.appendChild(t5);
        }
        g.appendChild(svgNS('circle',{cx:st[12][0],cy:st[12][1],r:pointerOn?4:2.6,fill:pointerOn?'#FFD43B':'#fff',class:'cn-polaris'}));
        var tn=svgNS('text',{x:st[12][0],y:st[12][1]-8,'text-anchor':'middle',fill:'#FFE08A','font-size':10,'font-weight':800,'font-family':'inherit'});
        tn.textContent=pointerOn?'⭐ 북극성!':'?'; g.appendChild(tn);
        var t2=svgNS('text',{x:-32,y:-36,'text-anchor':'middle',fill:'#cdd6e6','font-size':9,'font-weight':800,'font-family':'inherit'}); t2.textContent='북두칠성'; g.appendChild(t2);
        var t3=svgNS('text',{x:38,y:-36,'text-anchor':'middle',fill:'#cdd6e6','font-size':9,'font-weight':800,'font-family':'inherit'}); t3.textContent='카시오페이아'; g.appendChild(t3);
        if(cap)cap.textContent='북쪽 하늘 (일 년 내내)';
      }
    }

    function render(){
      if(mode==='mystar')return;
      if(earthPivot){ var p=earthPos(orb); earthPivot.position.set(p.x,0,p.z); }
      if(earthSphere) earthSphere.rotation.y=spin;
      var sunOff=wifSandboxOn()&&wifKey==='sunoff';
      constGroups.forEach(function(grp,i){
        var v=visState(orb,i), op=sunOff?1:((v==='night')?1:(v==='edge'?0.55:0.18));
        grp.userData.sMat.opacity=op; grp.userData.lMat.opacity=op*0.85;
      });
      renderPanel();
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
      spin += dt*0.9;
      if(playing){
        if(wifSandboxOn()&&wifKey==='freeze'){
          dayCnt += dt*120; renderStatus(); renderPanel();
        } else {
          var dir=(wifSandboxOn()&&wifKey==='reverse')?-1:1;
          orb=(((orb+dt*36*dir)%360)+360)%360;
          var r=el.querySelector('.cn-range'); if(r)r.value=orb; renderStatus();
        }
      }
      render();
      requestAnimationFrame(loop);
    }

    /* ═══════════════ 상태줄 ═══════════════ */
    function renderStatus(){
      var i=nearestConst(orb), opp=(i+2)%4, sea=seasonName(orb);
      var s=el.querySelector('.cn-status'); if(!s)return;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">오른쪽 밤하늘 패널과 지구의 위치를 보고 답을 골라요!</div>'; return; }
      if(mode==='mystar'){
        if(myView&&!myRevealed){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">별을 이어 보고 무엇을 닮았는지 상상한 다음, ✨ 이름 공개를 눌러요!</div>'; }
        else if(!myView){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">⭐ 별 '+myStars.length+'개 / '+MYMAX+' — 하늘을 누르면 별이 놓이고 차례대로 이어져요'+(myStars.length>=3?' · 이름 짓고 🔗 친구에게 보내요!':'')+'</div>'; }
        return;
      }
      if(mode==='whatif'){
        if(wifPhase==='pick'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">카드를 골라 상상을 시작해요 — 과학자는 늘 "만약에?"에서 출발했어요!</div>'; return; }
        if(wifPhase==='predict'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">정답 걱정은 노노! 네 생각을 먼저 골라 보는 게 진짜 실험의 시작이에요.</div>'; return; }
        if(wifKey==='freeze'){ s.innerHTML='<div style="font-size:32px;color:#0B7285;">📅 +'+Math.floor(dayCnt)+'일</div><div style="font-size:18px;color:#5a7894;margin-top:3px;">날짜가 흘러도 밤하늘은 '+CONSTS[i].nm+' 그대로!</div>'; return; }
        if(wifKey==='sunoff'){ s.innerHTML='<div style="font-size:20px;color:#0B7285;">지금 네 별자리가 모두 보여요 — 별은 원래 늘 그 자리에!</div>'; return; }
        s.innerHTML='<div style="font-size:20px;color:#0B7285;">'+sea.emo+' '+sea.nm+' 위치 — 다음엔 어느 계절 별자리가 올까요?</div>'; return;
      }
      var sub;
      if(view==='north')
        sub='북극성은 지구 자전축이 가리키는 방향에 있어요. 그래서 계절이 바뀌어도, 밤새 별이 돌아도 북쪽 같은 자리예요. 북두칠성 국자 끝 두 별 사이를 5배 늘이면 찾을 수 있어요.';
      else
        sub='지구가 공전해서 밤에 바라보는 하늘 방향이 바뀌어요. 그래서 '+sea.nm+' 밤엔 '+CONSTS[i].nm+'가 잘 보이고, '+CONSTS[opp].nm+'는 태양과 같은 쪽(낮 하늘)에 있어 보이지 않아요.';
      s.innerHTML='<div style="font-size:25px;color:'+sea.col+';">'+sea.emo+' '+sea.nm
          +(view==='south'?' · 밤하늘: '+CONSTS[i].nm:' · 북쪽 하늘')+'</div>'
        +'<div style="font-size:17px;color:'+C.sub+';margin-top:5px;">'+sub+'</div>'
        +'<div style="font-size:15px;color:'+C.mute+';margin-top:4px;">별자리가 계절마다 다른 건 별이 움직여서가 아니라, 지구가 공전하기 때문이에요.</div>';
      el.querySelectorAll('.cn-sea').forEach(function(b){ var d=Math.abs((((orb-(+b.dataset.o))%360)+360)%360); if(d>180)d=360-d;
        b.classList.toggle('on', d<45); });
      el.querySelectorAll('.cn-vw').forEach(function(b){ b.classList.toggle('on', b.dataset.v===view); });
      checkMission();
    }
    function setOrb(v){
      if(wifSandboxOn()&&wifKey==='freeze')return;
      orb=((v%360)+360)%360; var r=el.querySelector('.cn-range'); if(r&&+r.value!==orb)r.value=orb; render(); renderStatus(); }
    var _mv,_up;
    function bind(){
      var rg=el.querySelector('.cn-range'); if(rg)rg.addEventListener('input',function(e){ if(playing)togglePlay(); setOrb(+e.target.value); });
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',togglePlay);
      var ob=el.querySelector('[data-act="polaris"]'); if(ob)ob.addEventListener('click',function(){
        pointerOn=!pointerOn; if(pointerOn&&view!=='north'){view='north';} render(); renderStatus(); });
      el.querySelectorAll('.cn-sea').forEach(function(b){b.addEventListener('click',function(){ if(playing)togglePlay(); setOrb(+b.dataset.o); });});
      el.querySelectorAll('.cn-vw').forEach(function(b){b.addEventListener('click',function(){ view=b.dataset.v; render(); renderStatus(); });});
      if(!stage)return;
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.25,Math.min(1.45,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
      function up(){drag=false;if(stage)stage.style.cursor='grab';}
      stage.addEventListener('mousedown',dn); stage.addEventListener('touchstart',dn,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){mv(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      _mv=mv;_up=up; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    }
    function togglePlay(){ playing=!playing; last=0;
      var b=el.querySelector('[data-act="play"]'); if(!b)return;
      var frozen=wifSandboxOn()&&wifKey==='freeze';
      b.textContent=playing?'■ 멈춤':(frozen?'▶ 시간 흐르기':'▶ 1년 재생');
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    if(mode==='quiz')newQuiz();
    if(mode==='mission')applyMissionSet();
    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
