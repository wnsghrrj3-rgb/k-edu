/* ============================================================================
   케이랩 도구 모듈 — 달의 위상 (moon) v3  [과학 7호 · 천체 2호 · 3층]
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
   v3 · 3층: 미션 6단계(만들기↔생각형: 달빛=반사, 삭의 비밀) + 🌀 만약에
       (달이 스스로 빛난다면=항상 보름달!, 공전 멈춤=모양 고정, 2배 공전=보름짜리 한 달).
   - config: { phase(0~360, 기본 180=보름), mode:"free"|"mission"|"quiz" }
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
      if(mStep<MISSIONS.length-1){ mStep++; if(MISSIONS[mStep].set)MISSIONS[mStep].set(); }
      else mDone=true;
      updateBars(); missionFoot(); render(); renderStatus();
    }
    function missionFoot(){
      ui.thinkFoot(el,{foot:'.mn-foot',bar:'.mn-bars'},(mode==='mission'&&!mDone&&MISSIONS[mStep].type==='think')?MISSIONS[mStep]:null,advanceMission);
    }
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var m=MISSIONS[mStep]; if(m.type!=='make')return;
      if(m.check()){
        mLock=true; ui.toast(el,true);
        setTimeout(advanceMission,1500);
      }
    }
    function updateBars(){
      var host=el.querySelector('.mn-bars'); if(!host)return;
      if(mode==='mission')host.innerHTML=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
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
      fastm:{ icon:'⏩', title:'달이 2배 빨리 공전한다면?',
        q:'보름달에서 다음 보름달까지, 얼마나 걸릴까요?',
        ch:['보름(약 15일)으로 짧아져요','한 달 그대로예요','두 달이 걸려요'], a:0,
        reveal:'\'한 달\'의 길이는 달의 공전이 정해요! 2배 빨리 돌면 보름달→보름달이 15일 — 달력이 완전히 달라지겠죠?',
        tip:'▶ 공전 재생 — 위상이 두 배 빨리 휙휙 바뀌어요!' }
    };
    var wif=ui.whatifEngine({
      scenarios:WHATIF,
      rebuild:function(){buildUI();},
      footEl:function(){return el.querySelector('.mn-foot');},
      onSelect:function(k){ playing=false; dayCnt=0; phase=(k==='stopm')?180:45; },
      onPlay:function(){ dayCnt=0; },
      onExit:function(){ playing=false; dayCnt=0; phase=180; }
    });

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
      var top=ui.modeTabs(['free','mission','quiz','whatif'],mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var frozen=(wif.active()&&wif.state.key==='stopm');
      if(mode==='mission')bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); }
      el.innerHTML='<style>.mn-btn:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.mn-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#10183A,#5C7CFA,#FFF3BF,#5C7CFA,#10183A);outline:none;}'
        +'.mn-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.mn-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}</style>'
        + top + '<div class="mn-bars">'+bar+'</div>'
        +((mode==='quiz'||(mode==='whatif'&&!wif.active()))?'<div style="display:none;">':'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">')
          +'<button class="mn-btn" data-act="day" style="font-size:18px;padding:11px 16px;border-radius:14px;border:3px solid #845EF7;background:#fff;color:#845EF7;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">📅 하루 뒤</button>'
          +'<button class="mn-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':(frozen?'▶ 시간 흐르기':'▶ 공전 재생'))+'</button>'
          +'<input class="mn-range" type="range" min="0" max="360" step="1" value="'+phase+'" '+(frozen?'disabled':'')+' style="width:min(46vw,330px);'+(frozen?'opacity:.4;':'')+'">'
          +'<span class="mn-age" style="font-size:18px;font-weight:800;color:'+C.ink+';min-width:96px;text-align:center;font-family:inherit;"></span>'
        +'</div>'
        +'<div class="kl-stage-host" style="position:relative;"><div class="mn-stage" style="position:relative;width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 75% 25%,#10183A 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
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
        +'<div class="mn-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; playing=false; phase=180; dayCnt=0;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindChoices();
      if(mode==='whatif')wif.bind(el);
      if(mode==='mission')missionFoot();
      render(); renderStatus();
    }

    var stage,scene,camera,renderer,moonMesh,orbitR=4.2;
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
      // 지구
      var earth=new T.Mesh(new T.SphereGeometry(1.05,40,28), new T.MeshStandardMaterial({color:0x2b6cb0,roughness:1,metalness:0}));
      scene.add(earth);
      // 궤도 링(가늘게)
      var ring=new T.Mesh(new T.RingGeometry(orbitR-0.03,orbitR+0.03,72), new T.MeshBasicMaterial({color:0x3a4a6a,side:T.DoubleSide,transparent:true,opacity:0.5}));
      ring.rotation.x=Math.PI/2; scene.add(ring);
      // 달
      moonMesh=new T.Mesh(new T.SphereGeometry(0.42,32,24), new T.MeshStandardMaterial({color:0xd5d8de,roughness:1,metalness:0}));
      scene.add(moonMesh);
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
    function renderEvening(){
      var g=el.querySelector('.mn-evg'); if(!g)return;
      g.innerHTML='';
      function S(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
      var pp=(wif.active()&&wif.state.key==='glow')?180:(((phase%360)+360)%360);
      var cap=el.querySelector('.mn-evcap');
      if(cap)cap.textContent='여러 날 저녁 7시, 남쪽 하늘 · 달 나이 '+evAge()+'일';
      if(pp<22||pp>200){
        var t=S('text',{x:0,y:-4,'text-anchor':'middle',fill:'#9fb6e6','font-size':10,'font-weight':800,'font-family':'inherit'});
        t.textContent=(pp<22)?'삭 무렵 — 달이 보이지 않아요':'저녁 7시엔 아직 안 떴어요 (새벽에 떠요)';
        g.appendChild(t); return;
      }
      var tt=(pp-22)/(200-22);                  // 초승(서쪽) → 보름 직후(동쪽)
      var x=64-128*tt;
      var alt=Math.sin(Math.min(Math.max((pp-22)/(180-22),0),1)*Math.PI)*40;
      var y=28-alt;
      for(var d=-2;d<=2;d++){                   // 며칠 전후 자취 — '날마다 동쪽으로'
        if(d===0)continue;
        var p2=pp+d*12; if(p2<22||p2>200)continue;
        var t2=(p2-22)/(200-22);
        var a2=Math.sin(Math.min(Math.max((p2-22)/(180-22),0),1)*Math.PI)*40;
        g.appendChild(S('circle',{cx:(64-128*t2).toFixed(1),cy:(28-a2).toFixed(1),r:2.2,fill:'#8d9dc8',opacity:0.45}));
      }
      var grp=S('g',{transform:'translate('+x.toFixed(1)+','+y.toFixed(1)+') scale(0.17)'});
      grp.appendChild(S('circle',{cx:0,cy:0,r:50,fill:'#1A2440',stroke:'#3a4a6a','stroke-width':3}));
      var lp=S('path',{fill:'#FDF6D8',class:'mn-evmoon'}); lp.setAttribute('d',litPath(50,pp)); grp.appendChild(lp);
      g.appendChild(grp);
      if(pp>40&&pp<196){
        var ar=S('text',{x:Math.min(x+14,46),y:Math.max(y-9,-38),fill:'#FFD43B','font-size':9,'font-weight':800,'font-family':'inherit'});
        ar.textContent='← 날마다 동쪽으로'; g.appendChild(ar);
      }
    }
    function render(){
      // 달 공전 위치: φ=0 신월(+X 태양쪽), φ=180 보름(-X), φ=90 +Z
      var rad=phase*Math.PI/180;
      if(moonMesh) moonMesh.position.set(Math.cos(rad)*orbitR, 0, Math.sin(rad)*orbitR);
      // 2D 패널
      var lit=el.querySelector('.mn-lit'); if(lit)lit.setAttribute('d', litPath(50, (wif.active()&&wif.state.key==='glow')?180:phase));
      renderEvening();
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(playing){ if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
        if(wif.active()&&wif.state.key==='stopm'){ dayCnt+=dt*8; renderStatus(); render(); requestAnimationFrame(loop); return; }
        var spd=(wif.active()&&wif.state.key==='fastm')?60:30;
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
        +'<div style="font-size:15px;color:#8aa0b6;margin-top:4px;">달은 스스로 빛나지 않아요. 태양 빛 받는 면을 지구에서 보는 각도가 달라져 모양이 변해요.</div>';
      checkMission();
    }
    function setPhase(v){ phase=((v%360)+360)%360; var r=el.querySelector('.mn-range'); if(r&&+r.value!==phase)r.value=phase; render(); renderStatus(); }
    var _mv,_up;
    function bind(){
      var rg=el.querySelector('.mn-range'); if(rg)rg.addEventListener('input',function(e){ if(playing)togglePlay(); setPhase(+e.target.value); });
      var db=el.querySelector('[data-act="day"]'); if(db)db.addEventListener('click',function(){ if(playing)return; phase=(phase+12)%360; var r=el.querySelector('.mn-range'); if(r)r.value=phase; render(); renderStatus(); });
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',togglePlay);
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.2,Math.min(1.4,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
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
