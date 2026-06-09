/* ============================================================================
   케이랩 도구 모듈 — 계절의 변화 (season) v1  [과학 9호 · 천체 4호]
   6학년 계절의 변화 — 자전축 기울기와 공전.
   하이브리드:
     ▸ 3D 공전 — 태양 중심, 지구가 궤도를 공전. 자전축은 우주 공간에서
        방향이 일정하게 기울어진 채 돈다(항상 같은 쪽). 그래서 공전 위치에 따라
        북반구가 태양 쪽(여름)·반대쪽(겨울)이 자동으로 생긴다.
     ▸ 2D '우리나라에서 본 태양' 패널 — 그 계절 정오의 남중고도(태양 높이) 옆모습.
   변수 → 현상 → 발견:
     공전 위치(봄·여름·가을·겨울) + 자전축 기울기 슬라이더 →
       ▸ 여름: 북반구가 태양 쪽 → 남중고도 높고 낮이 길다
       ▸ 겨울: 북반구가 반대쪽 → 남중고도 낮고 낮이 짧다
       ▸ 기울기를 0으로 → 남중고도·낮 길이가 사철 똑같아 계절이 사라진다 (오개념 직격)
     "계절은 지구-태양 거리 때문이 아니라, 자전축이 기울어진 채 공전하기 때문."
   - 의존: THREE (전역, preview의 vendor/three.min.js), window.KLab
   - config: { orb(0~360, 0=춘분·90=하지·180=추분·270=동지, 기본 90),
               tilt(자전축 기울기 0~35, 기본 23.5), lat(위도, 기본 37.5=한국) }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  // ── 순수 계산(THREE 불필요)
  // 태양 적위 δ = ε·sin(공전각). 공전각 0=춘분·90=하지·180=추분·270=동지.
  function decl(orb, tilt){ return tilt * Math.sin(orb*Math.PI/180); }   // °
  // 남중고도 = 90 − |위도 − δ|
  function noonAlt(orb, tilt, lat){ return 90 - Math.abs(lat - decl(orb,tilt)); }
  // 낮 길이(시간): cosH = −tan(위도)·tan(δ), 낮길이 = 2·H(deg)/15
  function dayHours(orb, tilt, lat){
    var d = decl(orb,tilt)*Math.PI/180, la = lat*Math.PI/180;
    var c = -Math.tan(la)*Math.tan(d);
    c = Math.max(-1, Math.min(1, c));                 // 위도37.5에선 안 넘지만 안전장치
    var H = Math.acos(c)*180/Math.PI;                 // 반일주각(°)
    return 2*H/15;
  }
  // 계절 판정 — 기울기 0이면 계절이 없다.
  function seasonOf(orb, tilt){
    if(tilt <= 1) return {k:'none', nm:'계절 없음', emo:'⚪', col:'#9DB2C8'};
    orb = ((orb%360)+360)%360;
    if(orb>=45 && orb<135)  return {k:'summer', nm:'여름', emo:'☀️', col:'#FF922B'};
    if(orb>=225 && orb<315) return {k:'winter', nm:'겨울', emo:'❄️', col:'#4DABF7'};
    if(orb>=135 && orb<225) return {k:'fall',   nm:'가을', emo:'🍂', col:'#E8590C'};
    return                         {k:'spring', nm:'봄',   emo:'🌸', col:'#F06595'};
  }

  window.KLab.register('season', function (el, config) {
    var orb  = (config.orb!=null)?config.orb:90;
    var tilt = (config.tilt!=null)?config.tilt:23.5;
    var lat  = (config.lat!=null)?config.lat:37.5;
    var playing=false, alive=true, last=0, spin=0;
    var done={summer:false,winter:false,flat:false};
    var C={ink:'#1B3A57',sub:'#5a7894',mute:'#8aa0b6',good:'#12B886'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var SEASONS=[ {k:'spring',o:0,l:'🌸 봄(춘분)'},{k:'summer',o:90,l:'☀️ 여름(하지)'},
                  {k:'fall',o:180,l:'🍂 가을(추분)'},{k:'winter',o:270,l:'❄️ 겨울(동지)'} ];

    var MISSIONS=[
      {k:'summer', l:'☀️ 여름 만들기', tip:'하지(여름) 위치로 — 남중고도가 가장 높고 낮이 가장 길어요',
        test:function(){ return tilt>5 && decl(orb,tilt) >= tilt*0.93; }},
      {k:'winter', l:'❄️ 겨울 만들기', tip:'동지(겨울) 위치로 — 남중고도가 가장 낮고 낮이 가장 짧아요',
        test:function(){ return tilt>5 && decl(orb,tilt) <= -tilt*0.93; }},
      {k:'flat',   l:'🔭 기울기 0', tip:'자전축 기울기를 0°으로 — 계절이 사라지는지 확인해요',
        test:function(){ return tilt <= 1; }}
    ];
    function chips(){return MISSIONS.map(function(m){return '<button class="se-chip'+(done[m.k]?' done':'')+'" data-k="'+m.k+'" style="'+sbtn+'">'+(done[m.k]?'✓ ':'')+m.l+'</button>';}).join('');}
    function seasonBtns(){return SEASONS.map(function(s){return '<button class="se-sea" data-o="'+s.o+'" style="'+sbtn+'">'+s.l+'</button>';}).join('');}

    function buildUI(){
      el.innerHTML='<style>.se-btn:active,.se-chip:active,.se-sea:active{transform:translateY(2px);}'
        +'.se-chip.done{background:#E6FCF5 !important;border-color:#12B886 !important;color:#12B886 !important;}'
        +'.se-sea.on{background:#1565C0 !important;border-color:#1565C0 !important;color:#fff !important;}'
        +'.se-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#10183A,#5C7CFA,#FFD43B);outline:none;}'
        +'.se-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.se-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.se-tilt{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#9DB2C8,#FF922B);outline:none;}'
        +'.se-tilt::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #E8590C;cursor:pointer;}'
        +'.se-tilt::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #E8590C;cursor:pointer;}</style>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;"><span style="font-size:15px;color:#5a7894;align-self:center;font-weight:800;">미션</span>'+chips()+'</div>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'+seasonBtns()+'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<button class="se-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':'▶ 1년 재생')+'</button>'
          +'<span style="font-size:15px;color:#5a7894;font-weight:800;">공전 위치</span>'
          +'<input class="se-range" type="range" min="0" max="360" step="1" value="'+orb+'" style="width:min(40vw,280px);">'
        +'</div>'
        +'<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<span style="font-size:15px;color:#E8590C;font-weight:800;">🌐 자전축 기울기</span>'
          +'<input class="se-tilt" type="range" min="0" max="35" step="0.5" value="'+tilt+'" style="width:min(40vw,280px);">'
          +'<span class="se-tval" style="font-size:18px;font-weight:800;color:#E8590C;min-width:54px;text-align:center;font-family:inherit;"></span>'
        +'</div>'
        +'<div class="se-stage" style="position:relative;width:100%;height:42vh;min-height:320px;background:radial-gradient(120% 120% at 60% 35%,#0D1430 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +'<div class="se-panel" style="position:absolute;top:12px;right:12px;width:150px;text-align:center;pointer-events:none;background:rgba(8,12,26,0.55);border-radius:14px;padding:7px 6px 5px;">'
            +'<svg class="se-sky" viewBox="-65 -52 130 78" width="142" height="85">'
              +'<defs><linearGradient id="seSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2e54"/><stop offset="1" stop-color="#4a6aa0"/></linearGradient></defs>'
              +'<rect x="-65" y="-52" width="130" height="76" fill="url(#seSky)" rx="6"/>'
              +'<path class="se-arc" d="" fill="none" stroke="#FFE08A" stroke-width="2" stroke-dasharray="3 3" opacity="0.7"/>'
              +'<line x1="-60" y1="22" x2="60" y2="22" stroke="#6b8a4a" stroke-width="3"/>'
              +'<rect x="-60" y="22" width="120" height="6" fill="#3f5a28"/>'
              +'<line class="se-pole" x1="0" y1="22" x2="0" y2="11" stroke="#cdd6e6" stroke-width="2.5"/>'
              +'<circle class="se-sun2d" cx="0" cy="0" r="6" fill="#FFD43B"/>'
              +'<text class="se-alt" x="0" y="-44" text-anchor="middle" fill="#FFF3BF" font-size="11" font-weight="800" font-family="inherit"></text>'
            +'</svg>'
            +'<div style="font-size:12px;color:#cdd6e6;font-weight:800;margin-top:1px;">우리나라 정오의 태양</div>'
          +'</div>'
        +'</div>'
        +'<div class="se-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      initThree(); bind(); render(); renderStatus();
    }

    var stage,scene,camera,renderer,earthPivot,earthSphere,pin,orbitR=5;
    function earthTex(){
      var c=document.createElement('canvas'); c.width=256; c.height=128; var x=c.getContext('2d');
      x.fillStyle='#1565C0'; x.fillRect(0,0,256,128);
      x.fillStyle='#2F9E44';
      [[40,42,34,26],[95,38,42,30],[150,72,40,24],[200,46,34,28]].forEach(function(b){x.beginPath();x.ellipse(b[0],b[1],b[2],b[3],0,0,7);x.fill();});
      x.strokeStyle='rgba(255,255,255,0.16)'; x.lineWidth=1;
      for(var la=0;la<=128;la+=21){x.beginPath();x.moveTo(0,la);x.lineTo(256,la);x.stroke();}
      return new T.CanvasTexture(c);
    }
    function initThree(){
      stage=el.querySelector('.se-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||340;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(42, W/H, 0.1, 100);
      renderer=new T.WebGLRenderer({antialias:true, alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff,0.18));
      var sunLight=new T.PointLight(0xffffff,2.1,0); sunLight.position.set(0,0,0); scene.add(sunLight);  // 태양=원점
      // 태양(중심 표식)
      var sc=document.createElement('canvas'); sc.width=128; sc.height=128; var sx=sc.getContext('2d');
      var g=sx.createRadialGradient(64,64,6,64,64,62); g.addColorStop(0,'#FFFBEA'); g.addColorStop(0.45,'#FFD43B'); g.addColorStop(1,'rgba(255,170,40,0)');
      sx.fillStyle=g; sx.fillRect(0,0,128,128);
      var sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc),transparent:true,depthTest:false}));
      sunSpr.position.set(0,0,0); sunSpr.scale.set(2.6,2.6,1); scene.add(sunSpr);
      // 궤도 링
      var ring=new T.Mesh(new T.RingGeometry(orbitR-0.025,orbitR+0.025,80), new T.MeshBasicMaterial({color:0x3a4a6a,side:T.DoubleSide,transparent:true,opacity:0.55}));
      ring.rotation.x=Math.PI/2; scene.add(ring);
      // 4계절 위치 마커(궤도 위, 고정)
      SEASONS.forEach(function(s){ var p=earthPos(s.o);
        var m=new T.Mesh(new T.SphereGeometry(0.1,12,8), new T.MeshBasicMaterial({color:0x6b7da0}));
        m.position.set(p.x,0,p.z); scene.add(m); });
      // 지구 pivot(공전 위치) — 자전축 기울기는 pivot.rotation.z로 '월드 고정 방향'
      earthPivot=new T.Group(); scene.add(earthPivot);
      earthSphere=new T.Mesh(new T.SphereGeometry(0.62,40,28), new T.MeshStandardMaterial({map:earthTex(),roughness:1,metalness:0}));
      earthPivot.add(earthSphere);
      // 우리나라 핀(자전 따라감 → earthSphere 자식, 위도 lat·경도 0)
      var latr=lat*Math.PI/180, pr=0.64;
      pin=new T.Mesh(new T.SphereGeometry(0.07,14,10), new T.MeshBasicMaterial({color:0xE03131}));
      pin.position.set(Math.cos(latr)*pr, Math.sin(latr)*pr, 0); earthSphere.add(pin);
      // 자전축 선(기울기만, 자전 안 함 → pivot 직속)
      var axis=new T.Mesh(new T.CylinderGeometry(0.022,0.022,2.0,8), new T.MeshBasicMaterial({color:0xFFD43B}));
      earthPivot.add(axis);
      var npole=new T.Mesh(new T.SphereGeometry(0.08,12,8), new T.MeshBasicMaterial({color:0xFFE08A}));
      npole.position.set(0,1.0,0); earthPivot.add(npole);   // 북극 표식
      theta=0.78; phi=0.72; camPos();
    }
    var theta=0.78, phi=0.72, radius=11.5;
    function camPos(){ if(!camera)return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }

    // 지구 궤도 위치: φ=(orb+90)° → orb=90(하지) 때 지구 -X(북극이 태양 쪽), orb=270(동지) 때 +X
    function earthPos(o){ var ph=(o+90)*Math.PI/180; return {x:orbitR*Math.cos(ph), z:orbitR*Math.sin(ph)}; }

    function render(){
      if(earthPivot){
        var p=earthPos(orb); earthPivot.position.set(p.x,0,p.z);
        earthPivot.rotation.z = tilt*Math.PI/180;     // 월드 고정 방향(+X쪽)으로 기울기
      }
      if(earthSphere) earthSphere.rotation.y = spin;   // 자전(시각 디테일)
      // 2D 패널: 남중고도 호
      var alt=Math.max(0,noonAlt(orb,tilt,lat));
      var altH = alt/90*60;                            // 정점 높이(픽셀)
      var arc=el.querySelector('.se-arc'), sun2d=el.querySelector('.se-sun2d');
      if(arc) arc.setAttribute('d','M -55 22 Q 0 '+(22-2*altH).toFixed(1)+' 55 22');
      if(sun2d) sun2d.setAttribute('cy', (22-altH).toFixed(1));
      var altT=el.querySelector('.se-alt'); if(altT) altT.textContent='남중고도 '+Math.round(alt)+'°';
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
      spin += dt*0.9;                                  // 지구 자전 항상 살짝
      if(playing){ orb=(orb+dt*36)%360;                // 약 10초에 1년
        var r=el.querySelector('.se-range'); if(r)r.value=orb; renderStatus(); }
      render();
      requestAnimationFrame(loop);
    }

    function renderStatus(){
      var tv=el.querySelector('.se-tval'); if(tv)tv.textContent=tilt.toFixed(1)+'°';
      var alt=noonAlt(orb,tilt,lat), dh=dayHours(orb,tilt,lat), sea=seasonOf(orb,tilt);
      var s=el.querySelector('.se-status'), sub;
      if(sea.k==='none')
        sub='자전축이 똑바로 서 있어요(기울기 0°). 공전 위치를 아무리 바꿔도 남중고도 52°·낮 12시간 그대로 — 계절이 생기지 않아요.';
      else if(sea.k==='summer')
        sub='북반구가 태양 쪽으로 기울어 태양을 정면에 가깝게 받아요. 그래서 남중고도가 높고 낮이 길어 더워요.';
      else if(sea.k==='winter')
        sub='북반구가 태양 반대쪽으로 기울어 태양을 비스듬히 받아요. 그래서 남중고도가 낮고 낮이 짧아 추워요.';
      else
        sub='북반구가 태양 쪽도 반대쪽도 아니에요. 남중고도와 낮 길이가 여름·겨울의 중간이에요.';
      s.innerHTML='<div style="font-size:25px;color:'+sea.col+';">'+sea.emo+' '+sea.nm
          +(sea.k!=='none'?' · 남중고도 '+Math.round(alt)+'° · 낮 '+dh.toFixed(1)+'시간':'')+'</div>'
        +'<div style="font-size:17px;color:'+C.sub+';margin-top:5px;">'+sub+'</div>'
        +'<div style="font-size:15px;color:'+C.mute+';margin-top:4px;">계절이 생기는 건 지구-태양 거리 때문이 아니라, 자전축이 기울어진 채 공전하기 때문이에요.</div>';
      // 계절 버튼 활성 표시
      el.querySelectorAll('.se-sea').forEach(function(b){ var on=Math.abs(((orb-(+b.dataset.o))%360+360)%360)<8 || Math.abs(((orb-(+b.dataset.o))%360+360)%360-360)<8;
        b.classList.toggle('on', on); });
      checkMission();
    }
    function checkMission(){
      var all=true;
      MISSIONS.forEach(function(m){ if(m.test())done[m.k]=true; if(!done[m.k])all=false; });
      el.querySelectorAll('.se-chip').forEach(function(c){var k=c.dataset.k;
        if(done[k]&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
      if(all){var s=el.querySelector('.se-status');
        if(s&&s.innerHTML.indexOf('직접 확인')<0)s.innerHTML+='<div style="font-size:16px;color:#12B886;margin-top:5px;">여름·겨울을 만들고, 기울기를 0으로 해 계절이 사라지는 것까지 직접 확인했어요! ✨ 계절의 진짜 원인은 자전축 기울기예요.</div>';}
    }

    function setOrb(v){ orb=((v%360)+360)%360; var r=el.querySelector('.se-range'); if(r&&+r.value!==orb)r.value=orb; render(); renderStatus(); }
    function setTilt(v){ tilt=Math.max(0,Math.min(35,v)); var r=el.querySelector('.se-tilt'); if(r&&+r.value!==tilt)r.value=tilt; render(); renderStatus(); }
    var _mv,_up;
    function bind(){
      el.querySelector('.se-range').addEventListener('input',function(e){ if(playing)togglePlay(); setOrb(+e.target.value); });
      el.querySelector('.se-tilt').addEventListener('input',function(e){ setTilt(+e.target.value); });
      el.querySelector('[data-act="play"]').addEventListener('click',togglePlay);
      el.querySelectorAll('.se-sea').forEach(function(b){b.addEventListener('click',function(){ if(playing)togglePlay(); setOrb(+b.dataset.o); });});
      el.querySelectorAll('.se-chip').forEach(function(c){c.addEventListener('click',function(){
        var m=MISSIONS.filter(function(x){return x.k===c.dataset.k;})[0], s=el.querySelector('.se-status');
        if(s&&m)s.innerHTML='<div style="font-size:21px;color:'+C.ink+';">'+m.l+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:5px;">'+m.tip+'</div>';
      });});
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
      var b=el.querySelector('[data-act="play"]'); b.textContent=playing?'■ 멈춤':'▶ 1년 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
