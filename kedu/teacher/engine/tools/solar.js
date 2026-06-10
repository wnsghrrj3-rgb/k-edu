/* ============================================================================
   케이랩 도구 모듈 — 태양계 (solar) v2  [과학 8호 · 천체 3호 · 3모드]
   5학년 태양계와 별 — 태양계 구성·행성 크기와 거리.
     변수 → 현상 → 발견:
       ▸ 8행성 공전(▶) · 행성 선택(수~해) · 🔭 실제 비율 토글
       ▸ 보기 좋게 ↔ 실제 비율: 거리·크기를 실제대로 바꾸면 안쪽 행성은 다닥,
         바깥 행성은 까마득. 목성·토성은 크고 나머지는 점.
       ▸ "태양계는 거의 텅 비어 있고, 행성마다 크기·태양까지 거리가 크게 다르다."
   - 의존: THREE (전역), window.KLab
   v2: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 태양계 장면을 보며 행성 상식 답하기.
   - config: { play(기본 false), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  var PL=[
    {k:'mer',nm:'수성',au:0.39,r:0.38,col:0x9c8a7a,yr:0.24,desc:'태양에서 가장 가깝고 가장 작은 행성'},
    {k:'ven',nm:'금성',au:0.72,r:0.95,col:0xe6c47a,yr:0.62,desc:'두꺼운 구름에 싸인 가장 뜨거운 행성'},
    {k:'ear',nm:'지구',au:1.00,r:1.00,col:0x2b6cb0,yr:1.00,desc:'생명이 사는 우리 행성'},
    {k:'mar',nm:'화성',au:1.52,r:0.53,col:0xc1440e,yr:1.88,desc:'붉게 보이는 행성'},
    {k:'jup',nm:'목성',au:5.20,r:11.2,col:0xc99039,yr:11.9,desc:'태양계에서 가장 큰 행성'},
    {k:'sat',nm:'토성',au:9.50,r:9.40,col:0xe0c884,yr:29.5,desc:'아름다운 고리를 가진 행성'},
    {k:'ura',nm:'천왕성',au:19.2,r:4.00,col:0x9fd8e0,yr:84,desc:'옆으로 누워 자전하는 행성'},
    {k:'nep',nm:'해왕성',au:30.1,r:3.90,col:0x3b5bdb,yr:165,desc:'태양에서 가장 먼 행성'}
  ];
  // 스케일 — 보기 좋게(pretty) / 실제 비율(real)
  function dist(i, real){ return real ? (3 + PL[i].au*3.4) : (3.4 + i*2.0); }
  function prad(i, real){ return real ? Math.max(0.08, PL[i].r*0.28) : (0.34 + Math.log(PL[i].r+1)*0.42); }

  window.KLab.register('solar', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var playing=!!config.play, real=false, alive=true, last=0, sel=null;
    var ang=PL.map(function(_,i){return i*0.7;});
    var C={ink:'#1B3A57',sub:'#8aa0b6',good:'#12B886'};
    var btn='font-size:20px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'🌍 행성 버튼에서 <b style="color:#7048E8;">우리가 사는 지구</b>를 찾아 골라 봐요!',
        check:function(){ return sel==='ear'; } },
      { text:'🪐 태양계에서 <b style="color:#7048E8;">가장 큰 행성</b>은 누구일까요? 골라 봐요!',
        check:function(){ return sel==='jup'; } },
      { text:'🔭 <b style="color:#7048E8;">실제 비율</b> 버튼을 눌러 진짜 거리·크기를 봐요 — 태양계는 텅텅!',
        check:function(){ return real===true; } },
      { text:'🌀 <b style="color:#7048E8;">태양에서 가장 먼 행성</b>을 찾아 골라 봐요!',
        check:function(){ return sel==='nep'; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1)mStep++; else mDone=true;
          updateBars();
        },1500);
      }
    }
    function updateBars(){
      var host=el.querySelector('.so-bars'); if(!host)return;
      if(mode==='mission')host.innerHTML=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else host.innerHTML='';
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { q:'태양에서 가장 가까운 행성은?', ch:['수성','금성','지구'], a:0 },
      { q:'태양계에서 가장 큰 행성은?', ch:['목성','토성','지구'], a:0 },
      { q:'우리가 사는 지구는 태양에서 몇 번째 행성일까요?', ch:['세 번째','첫 번째','다섯 번째'], a:0 },
      { q:'아름다운 고리를 가진 행성은?', ch:['토성','화성','수성'], a:0 },
      { q:'태양에서 가장 먼 행성은?', ch:['해왕성','천왕성','목성'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      sel=null;
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
            var fc=el.querySelector('.so-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }
    function planetBtns(){return PL.map(function(p){return '<button class="so-pl'+(sel===p.k?' on':'')+'" data-k="'+p.k+'" style="font-size:16px;padding:7px 12px;border-radius:12px;border:2.5px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(sel===p.k?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+p.nm+'</button>';}).join('');}

    function buildUI(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      if(mode==='mission')bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      var ctrl='<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="so-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':'▶ 공전 재생')+'</button>'
          +'<button class="so-btn so-real'+(real?' on':'')+'" data-act="real" style="'+btn+'border-color:#7048E8;'+(real?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🔭 '+(real?'보기 좋게':'실제 비율')+'</button>'
        +'</div>';
      var plRow='<div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap;">'+planetBtns()+'</div>';
      if(mode==='quiz'){ ctrl=''; plRow=''; }
      el.innerHTML='<style>.so-btn:active,.so-pl:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.so-real.on{background:#7048E8 !important;color:#fff !important;border-color:#7048E8 !important;}</style>'
        + top + '<div class="so-bars">'+bar+'</div>' + ctrl
        +'<div class="kl-stage-host" style="position:relative;"><div class="so-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'42vh')+';min-height:'+(mode==='quiz'?'250':'320')+'px;background:radial-gradient(120% 120% at 50% 45%,#0E1330 0%,#070B1E 60%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);"></div></div>'
        + plRow
        +'<div class="so-foot">'+foot+'</div>'
        +'<div class="so-status" style="text-align:center;margin-top:9px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; sel=null; real=false; playing=false;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindChoices(); layout(); render(); renderStatus();
    }

    var stage,scene,camera,renderer,sunMesh,planetGrp=[],orbitRings=[];
    function initThree(){
      if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
      planetGrp=[]; orbitRings=[];
      stage=el.querySelector('.so-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||360;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(45,W/H,0.1,2000);
      renderer=new T.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff,0.55));
      var pt=new T.PointLight(0xffffff,2.2,0); pt.position.set(0,0,0); scene.add(pt);
      // 태양
      sunMesh=new T.Mesh(new T.SphereGeometry(1.5,40,28), new T.MeshBasicMaterial({color:0xFFD43B}));
      scene.add(sunMesh);
      // 행성 + 궤도
      PL.forEach(function(p,i){
        var m=new T.Mesh(new T.SphereGeometry(1,28,20), new T.MeshStandardMaterial({color:p.col,roughness:1,metalness:0}));
        scene.add(m); planetGrp.push(m);
        var ring=new T.Mesh(new T.RingGeometry(1,1.01,96), new T.MeshBasicMaterial({color:0x33415e,side:T.DoubleSide,transparent:true,opacity:0.45}));
        ring.rotation.x=Math.PI/2; scene.add(ring); orbitRings.push(ring);
      });
      theta=0.7; phi=0.5; camPos();
    }
    var theta=0.7, phi=0.5, radius=22;
    function camPos(){ if(!camera)return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }

    function layout(){    // 스케일 모드에 맞춰 크기·궤도 반경·카메라 거리 재설정
      var far=dist(PL.length-1, real);
      radius = real ? far*1.55 : far*1.15;
      if(sunMesh)sunMesh.scale.setScalar(real?1.0:1.0);
      planetGrp.forEach(function(m,i){ m.scale.setScalar(prad(i,real)); });
      orbitRings.forEach(function(ring,i){ var d=dist(i,real); ring.scale.set(d,d,1); });
      camPos();
    }
    function render(){
      planetGrp.forEach(function(m,i){ var d=dist(i,real); m.position.set(Math.cos(ang[i])*d,0,Math.sin(ang[i])*d); });
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(playing){ if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
        PL.forEach(function(p,i){ ang[i]=(ang[i]+dt*(0.9/Math.sqrt(p.au)))%(2*Math.PI); });
        render();
      }
      requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.so-status');
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">태양계 그림을 보면서 답을 골라요! (화면을 끌어 돌려볼 수 있어요)</div>'; return; }
      if(sel){ var p=PL.filter(function(x){return x.k===sel;})[0], idx=PL.map(function(x){return x.k;}).indexOf(sel);
        s.innerHTML='<div style="font-size:23px;color:#FFF3BF;">'+p.nm+' — 태양에서 '+(idx+1)+'번째</div>'
          +'<div style="font-size:17px;color:#cdd6e6;margin-top:4px;">'+p.desc+'</div>'
          +'<div style="font-size:15px;color:#8aa0b6;margin-top:4px;">태양까지 거리 약 '+p.au+'AU · 크기(지구=1) 약 '+p.r+'배</div>';
      } else if(real){
        s.innerHTML='<div style="font-size:21px;color:#A9C4FF;">실제 비율로 보는 중 🔭</div><div style="font-size:16px;color:#8aa0b6;margin-top:4px;">안쪽 4행성은 태양 가까이 다닥, 바깥 행성은 까마득히 멀어요. 행성 사이는 거의 텅 비어 있어요.</div>';
      } else {
        s.innerHTML='<div style="font-size:21px;color:#FFF3BF;">☀️ 태양계</div><div style="font-size:16px;color:#8aa0b6;margin-top:4px;">행성을 골라 보고, 🔭 실제 비율을 눌러 진짜 거리·크기를 비교해 보세요.</div>';
      }
    }

    var _mv,_up;
    function bind(){
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',function(){ playing=!playing; last=0;
        pb.textContent=playing?'■ 멈춤':'▶ 공전 재생';
        pb.style.background=playing?'#1565C0':'#fff'; pb.style.color=playing?'#fff':'#1565C0'; });
      var rb=el.querySelector('[data-act="real"]'); if(rb)rb.addEventListener('click',function(){ real=!real;
        layout(); render(); buildUIKeepState(); checkMission(); });
      el.querySelectorAll('.so-pl').forEach(function(b){b.addEventListener('click',function(){
        sel=b.dataset.k;
        el.querySelectorAll('.so-pl').forEach(function(x){var on=x.dataset.k===sel;x.classList.toggle('on',on);x.style.background=on?'#1565C0':'#fff';x.style.color=on?'#fff':'#1565C0';});
        renderStatus(); checkMission(); });});
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.15,Math.min(1.45,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
      function up(){drag=false;if(stage)stage.style.cursor='grab';}
      stage.addEventListener('mousedown',dn); stage.addEventListener('touchstart',dn,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){mv(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      _mv=mv;_up=up; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    }
    // 토글 시 버튼 라벨/미션칩만 다시 그리되 three 씬은 유지
    function buildUIKeepState(){
      var rb=el.querySelector('[data-act="real"]'); if(!rb)return;
      rb.textContent='🔭 '+(real?'보기 좋게':'실제 비율');
      rb.classList.toggle('on',real); rb.style.background=real?'#7048E8':'#fff'; rb.style.color=real?'#fff':'#7048E8';
      renderStatus();
    }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
