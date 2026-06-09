/* ============================================================================
   케이랩 도구 모듈 — 달의 위상 (moon) v1  [과학 7호 · 천체 2호]
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
   - config: { phase(0~360, 기본 180=보름) }
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
    var phase=(config.phase!=null)?config.phase:180;
    var playing=false, alive=true, last=0, done={wax_cre:false,first:false,full:false,last:false};
    var C={ink:'#1B3A57',sub:'#8aa0b6',good:'#12B886'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var MISSIONS=[
      {k:'wax_cre', l:'🌒 초승달', tip:'삭 직후 — 오른쪽 가는 낫 모양'},
      {k:'first',   l:'🌓 상현달', tip:'달의 나이 약 7일 — 오른쪽 반달'},
      {k:'full',    l:'🌕 보름달', tip:'약 15일 — 꽉 찬 달(망)'},
      {k:'last',    l:'🌗 하현달', tip:'약 22일 — 왼쪽 반달'}
    ];
    function chips(){return MISSIONS.map(function(m){return '<button class="mn-chip'+(done[m.k]?' done':'')+'" data-k="'+m.k+'" style="font-size:16px;padding:7px 13px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">'+(done[m.k]?'✓ ':'')+m.l+'</button>';}).join('');}

    function buildUI(){
      el.innerHTML='<style>.mn-btn:active,.mn-chip:active{transform:translateY(2px);}'
        +'.mn-chip.done{background:#E6FCF5 !important;border-color:#12B886 !important;color:#12B886 !important;}'
        +'.mn-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#10183A,#5C7CFA,#FFF3BF,#5C7CFA,#10183A);outline:none;}'
        +'.mn-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.mn-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}</style>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;"><span style="font-size:15px;color:#5a7894;align-self:center;font-weight:800;">미션</span>'+chips()+'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<button class="mn-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':'▶ 공전 재생')+'</button>'
          +'<input class="mn-range" type="range" min="0" max="360" step="1" value="'+phase+'" style="width:min(46vw,330px);">'
          +'<span class="mn-age" style="font-size:18px;font-weight:800;color:'+C.ink+';min-width:96px;text-align:center;font-family:inherit;"></span>'
        +'</div>'
        +'<div class="mn-stage" style="position:relative;width:100%;height:44vh;min-height:330px;background:radial-gradient(120% 120% at 75% 25%,#10183A 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +'<div class="mn-panel" style="position:absolute;top:12px;right:12px;width:118px;text-align:center;pointer-events:none;">'
            +'<svg class="mn-moon2d" viewBox="-55 -55 110 110" width="104" height="104"><circle cx="0" cy="0" r="50" fill="#1A2440" stroke="#3a4a6a" stroke-width="2"/><path class="mn-lit" d="" fill="#FDF6D8"/></svg>'
            +'<div style="font-size:13px;color:#cdd6e6;font-weight:800;margin-top:2px;">지구에서 본 달</div>'
          +'</div>'
        +'</div>'
        +'<div class="mn-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      initThree(); bind(); render(); renderStatus();
    }

    var stage,scene,camera,renderer,moonMesh,orbitR=4.2;
    function initThree(){
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

    function render(){
      // 달 공전 위치: φ=0 신월(+X 태양쪽), φ=180 보름(-X), φ=90 +Z
      var rad=phase*Math.PI/180;
      if(moonMesh) moonMesh.position.set(Math.cos(rad)*orbitR, 0, Math.sin(rad)*orbitR);
      // 2D 패널
      var lit=el.querySelector('.mn-lit'); if(lit)lit.setAttribute('d', litPath(50, phase));
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(playing){ if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
        phase=(phase+dt*30)%360;                  // 약 12초에 한 바퀴
        var r=el.querySelector('.mn-range'); if(r)r.value=phase;
        render(); renderStatus();
      }
      requestAnimationFrame(loop);
    }

    function ageStr(){ var d=phase/360*29.5; return '약 '+d.toFixed(1)+'일'; }
    function renderStatus(){
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
      checkMission(info);
    }
    function checkMission(info){
      if(done.hasOwnProperty(info.k))done[info.k]=true;
      var all=MISSIONS.every(function(m){return done[m.k];});
      el.querySelectorAll('.mn-chip').forEach(function(c){var k=c.dataset.k;
        if(done[k]&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
      if(all){var s=el.querySelector('.mn-status');
        if(s&&s.innerHTML.indexOf('한 달 동안')<0)s.innerHTML+='<div style="font-size:16px;color:#12B886;margin-top:5px;">초승→상현→보름→하현을 다 봤어요! ✨ 한 달 동안 달은 이 순서로 차고 이지러져요.</div>';}
    }

    function setPhase(v){ phase=((v%360)+360)%360; var r=el.querySelector('.mn-range'); if(r&&+r.value!==phase)r.value=phase; render(); renderStatus(); }
    var _mv,_up;
    function bind(){
      el.querySelector('.mn-range').addEventListener('input',function(e){ if(playing)togglePlay(); setPhase(+e.target.value); });
      el.querySelector('[data-act="play"]').addEventListener('click',togglePlay);
      el.querySelectorAll('.mn-chip').forEach(function(c){c.addEventListener('click',function(){
        var m=MISSIONS.filter(function(x){return x.k===c.dataset.k;})[0], s=el.querySelector('.mn-status');
        if(s&&m)s.innerHTML='<div style="font-size:21px;color:#FFF3BF;">'+m.l+' 만들기</div><div style="font-size:17px;color:#8aa0b6;margin-top:5px;">'+m.tip+'</div>';
      });});
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
      var b=el.querySelector('[data-act="play"]'); b.textContent=playing?'■ 멈춤':'▶ 공전 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
