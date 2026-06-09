/* ============================================================================
   케이랩 도구 모듈 — 태양계 (solar) v1  [과학 8호 · 천체 3호]
   5학년 태양계와 별 — 태양계 구성·행성 크기와 거리.
     변수 → 현상 → 발견:
       ▸ 8행성 공전(▶) · 행성 선택(수~해) · 🔭 실제 비율 토글
       ▸ 보기 좋게 ↔ 실제 비율: 거리·크기를 실제대로 바꾸면 안쪽 행성은 다닥,
         바깥 행성은 까마득. 목성·토성은 크고 나머지는 점.
       ▸ "태양계는 거의 텅 비어 있고, 행성마다 크기·태양까지 거리가 크게 다르다."
   - 의존: THREE (전역), window.KLab
   - config: { play(기본 false) }
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
    var playing=!!config.play, real=false, alive=true, last=0, sel=null;
    var ang=PL.map(function(_,i){return i*0.7;});
    var done={ear:false,jup:false,real:false};
    var C={ink:'#1B3A57',sub:'#8aa0b6',good:'#12B886'};
    var btn='font-size:20px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var MISSIONS=[
      {k:'ear',  l:'🌍 지구 찾기',     tip:'행성 버튼에서 지구를 골라요'},
      {k:'jup',  l:'🪐 가장 큰 행성',  tip:'가장 큰 행성(목성)을 골라요'},
      {k:'real', l:'🔭 실제 비율로 보기', tip:'실제 비율 버튼을 눌러 거리·크기를 실제대로'}
    ];
    function chips(){return MISSIONS.map(function(m){return '<button class="so-chip'+(done[m.k]?' done':'')+'" data-k="'+m.k+'" style="font-size:15px;padding:7px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">'+(done[m.k]?'✓ ':'')+m.l+'</button>';}).join('');}
    function planetBtns(){return PL.map(function(p){return '<button class="so-pl'+(sel===p.k?' on':'')+'" data-k="'+p.k+'" style="font-size:16px;padding:7px 12px;border-radius:12px;border:2.5px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'+(sel===p.k?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+p.nm+'</button>';}).join('');}

    function buildUI(){
      el.innerHTML='<style>.so-btn:active,.so-chip:active,.so-pl:active{transform:translateY(2px);}'
        +'.so-chip.done{background:#E6FCF5 !important;border-color:#12B886 !important;color:#12B886 !important;}'
        +'.so-real.on{background:#7048E8 !important;color:#fff !important;border-color:#7048E8 !important;}</style>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:8px;flex-wrap:wrap;"><span style="font-size:15px;color:#5a7894;align-self:center;font-weight:800;">미션</span>'+chips()+'</div>'
        +'<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="so-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':'▶ 공전 재생')+'</button>'
          +'<button class="so-btn so-real'+(real?' on':'')+'" data-act="real" style="'+btn+'border-color:#7048E8;'+(real?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🔭 '+(real?'보기 좋게':'실제 비율')+'</button>'
        +'</div>'
        +'<div class="so-stage" style="width:100%;height:42vh;min-height:320px;background:radial-gradient(120% 120% at 50% 45%,#0E1330 0%,#070B1E 60%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);"></div>'
        +'<div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap;">'+planetBtns()+'</div>'
        +'<div class="so-status" style="text-align:center;margin-top:9px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      initThree(); bind(); layout(); render(); renderStatus();
    }

    var stage,scene,camera,renderer,sunMesh,planetGrp=[],orbitRings=[];
    function initThree(){
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
    function checkMission(){
      var all=MISSIONS.every(function(m){return done[m.k];});
      el.querySelectorAll('.so-chip').forEach(function(c){var k=c.dataset.k;
        if(done[k]&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
      if(all){var s=el.querySelector('.so-status');
        if(s&&s.innerHTML.indexOf('태양계 탐험')<0)s.innerHTML+='<div style="font-size:15px;color:#12B886;margin-top:5px;">태양계 탐험 미션 완료! ✨ 행성마다 크기도, 태양까지 거리도 이렇게 다르답니다.</div>';}
    }

    var _mv,_up;
    function bind(){
      el.querySelector('[data-act="play"]').addEventListener('click',function(){ playing=!playing; last=0;
        var b=el.querySelector('[data-act="play"]'); b.textContent=playing?'■ 멈춤':'▶ 공전 재생';
        b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; });
      el.querySelector('[data-act="real"]').addEventListener('click',function(){ real=!real; if(real)done.real=true;
        layout(); render(); buildUIKeepState(); });
      el.querySelectorAll('.so-pl').forEach(function(b){b.addEventListener('click',function(){
        sel=b.dataset.k; if(sel==='ear')done.ear=true; if(sel==='jup')done.jup=true;
        el.querySelectorAll('.so-pl').forEach(function(x){var on=x.dataset.k===sel;x.classList.toggle('on',on);x.style.background=on?'#1565C0':'#fff';x.style.color=on?'#fff':'#1565C0';});
        renderStatus(); checkMission(); });});
      el.querySelectorAll('.so-chip').forEach(function(c){c.addEventListener('click',function(){
        var m=MISSIONS.filter(function(x){return x.k===c.dataset.k;})[0], s=el.querySelector('.so-status');
        if(s&&m)s.innerHTML='<div style="font-size:20px;color:#FFF3BF;">'+m.l+'</div><div style="font-size:16px;color:#8aa0b6;margin-top:5px;">'+m.tip+'</div>';
      });});
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
      var rb=el.querySelector('[data-act="real"]'); rb.textContent='🔭 '+(real?'보기 좋게':'실제 비율');
      rb.classList.toggle('on',real); rb.style.background=real?'#7048E8':'#fff'; rb.style.color=real?'#fff':'#7048E8';
      el.querySelectorAll('.so-chip').forEach(function(c){var k=c.dataset.k;
        if(done[k]&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
      renderStatus(); checkMission();
    }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
