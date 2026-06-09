/* ============================================================================
   케이랩 도구 모듈 — 지구 자전·낮밤 (earth) v1  [과학 6호 · 천체 1호]
   6학년 지구와 달의 운동 — 지구의 자전과 낮·밤.
     변수 → 현상 → 발견:
       ▸ 시간 슬라이더(0~24시) / ▶ 하루 재생 → 지구가 서→동으로 자전
       ▸ 태양광은 한 방향(평행광) → 태양을 향한 면=낮(밝음), 반대 면=밤(어두움)
       ▸ '우리나라' 핀이 자전 따라 낮↔밤으로 옮겨 가며 아침·정오·저녁·밤
       ▸ "낮과 밤은 태양이 도는 게 아니라 지구가 자전하기 때문" (오개념 직격)
   - 의존: THREE (전역, preview의 vendor/three.min.js), window.KLab
   - 자전축은 수직(기울기 0). 계절·기울기는 다른 도구에서 다룸.
   - config: { hour(0~24, 기본 12), lat(관찰자 위도, 기본 37.5=한국) }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  // ── 순수 계산(THREE 불필요): 시간·위도 → 태양 고도 성분(dot). >0 낮, <0 밤, ≈0 경계
  //    h=12 정오(태양 정면)·h=0/24 자정(반대)·h=6 일출·h=18 일몰.
  function sunDot(h, lat){
    var ang = ((h-12)/24)*2*Math.PI;        // 정오=0, 자정=±π
    var latr = (lat||0)*Math.PI/180;
    return Math.cos(latr)*Math.cos(ang);    // = 태양 고도의 sin
  }
  function timeOfDay(h, lat){
    var d = sunDot(h, lat);
    if(d > 0.06) return (h<12?'morning':(h<13.5?'noon':'afternoon'));
    if(d < -0.06) return 'night';
    return (h<12?'sunrise':'sunset');
  }

  window.KLab.register('earth', function (el, config) {
    var hour = (config.hour!=null)?config.hour:12;
    var lat  = (config.lat!=null)?config.lat:37.5;
    var playing=false, alive=true, last=0, done={noon:false,night:false,sunrise:false};
    var C={ink:'#1B3A57',sub:'#9DB2C8',good:'#37D67A',day:'#FFD43B',night:'#5C7CFA'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var MISSIONS=[
      {k:'noon',    l:'☀️ 우리나라 정오', tip:'태양을 정면으로 보는 낮 12시쯤으로', test:function(){return timeOfDay(hour,lat)==='noon';}},
      {k:'night',   l:'🌙 우리나라 한밤', tip:'태양 반대쪽, 0시(자정)쯤으로',     test:function(){return timeOfDay(hour,lat)==='night';}},
      {k:'sunrise', l:'🌅 해돋이',       tip:'낮과 밤의 경계, 아침 6시쯤으로',     test:function(){return timeOfDay(hour,lat)==='sunrise';}}
    ];

    function chips(){return MISSIONS.map(function(m){return '<button class="ea-chip'+(done[m.k]?' done':'')+'" data-k="'+m.k+'" style="font-size:16px;padding:7px 13px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">'+(done[m.k]?'✓ ':'')+m.l+'</button>';}).join('');}

    function buildUI(){
      el.innerHTML='<style>.ea-btn:active,.ea-chip:active{transform:translateY(2px);}'
        +'.ea-chip.done{background:#E6FCF5 !important;border-color:#12B886 !important;color:#12B886 !important;}'
        +'.ea-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#1A2B4A,#5C7CFA,#FFD43B,#5C7CFA,#1A2B4A);outline:none;}'
        +'.ea-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.ea-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}</style>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;"><span style="font-size:15px;color:#5a7894;align-self:center;font-weight:800;">미션</span>'+chips()+'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<button class="ea-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':'▶ 하루 재생')+'</button>'
          +'<input class="ea-range" type="range" min="0" max="24" step="0.25" value="'+hour+'" style="width:min(46vw,330px);">'
          +'<span class="ea-clock" style="font-size:22px;font-weight:800;color:'+C.ink+';min-width:78px;text-align:center;font-family:inherit;"></span>'
        +'</div>'
        +'<div class="ea-stage" style="width:100%;height:44vh;min-height:330px;background:radial-gradient(120% 120% at 70% 30%,#10183A 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);"></div>'
        +'<div class="ea-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      initThree(); bind(); render(); renderStatus();
    }

    var stage,scene,camera,renderer,earthGrp,pin,sunSpr;
    function earthTexture(){
      var c=document.createElement('canvas'); c.width=512; c.height=256; var x=c.getContext('2d');
      x.fillStyle='#1565C0'; x.fillRect(0,0,512,256);                    // 바다
      x.fillStyle='#2F9E44';                                            // 대륙 근사 패치
      [[60,80,70,55],[150,70,90,70],[250,150,80,50],[150,170,60,45],[360,90,70,60],[420,150,55,40]].forEach(function(b){
        x.beginPath(); x.ellipse(b[0],b[1],b[2],b[3],0,0,7); x.fill();});
      x.strokeStyle='rgba(255,255,255,0.18)'; x.lineWidth=1;             // 위도·경도선
      for(var la=0;la<=256;la+=32){x.beginPath();x.moveTo(0,la);x.lineTo(512,la);x.stroke();}
      for(var lo=0;lo<=512;lo+=42){x.beginPath();x.moveTo(lo,0);x.lineTo(lo,256);x.stroke();}
      return new T.CanvasTexture(c);
    }
    function initThree(){
      stage=el.querySelector('.ea-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||360;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(42, W/H, 0.1, 100);
      renderer=new T.WebGLRenderer({antialias:true, alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      // 빛: 약한 환경광(밤도 형체는 보임) + 태양 평행광(+X에서)
      scene.add(new T.AmbientLight(0xffffff,0.16));
      var sun=new T.DirectionalLight(0xffffff,1.5); sun.position.set(50,6,0); scene.add(sun);
      // 지구
      earthGrp=new T.Group();
      var earth=new T.Mesh(new T.SphereGeometry(2.4,48,36), new T.MeshStandardMaterial({map:earthTexture(),roughness:1,metalness:0}));
      earthGrp.add(earth);
      // 우리나라 핀(로컬 +X·위도만큼 올림 → rotation.y로 자전)
      var latr=lat*Math.PI/180, pr=2.42;
      pin=new T.Mesh(new T.SphereGeometry(0.12,16,12), new T.MeshBasicMaterial({color:0xE03131}));
      pin.position.set(Math.cos(latr)*pr, Math.sin(latr)*pr, 0); earthGrp.add(pin);
      scene.add(earthGrp);
      // 태양(화면 표식)
      var sc=document.createElement('canvas'); sc.width=128; sc.height=128; var sx=sc.getContext('2d');
      var g=sx.createRadialGradient(64,64,8,64,64,60); g.addColorStop(0,'#FFF7D6'); g.addColorStop(0.5,'#FFD43B'); g.addColorStop(1,'rgba(255,212,59,0)');
      sx.fillStyle=g; sx.fillRect(0,0,128,128);
      sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc),transparent:true,depthTest:false}));
      sunSpr.position.set(9,1.2,0); sunSpr.scale.set(3.2,3.2,1); scene.add(sunSpr);
      // 카메라(우주에서 비스듬히)
      theta=0.9; phi=1.15; camPos();
    }
    var theta=0.9, phi=1.15, radius=9.5;
    function camPos(){ if(!camera)return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0); }

    function render(){
      if(earthGrp){ var ang=((hour-12)/24)*2*Math.PI; earthGrp.rotation.y=ang; }   // 자전(서→동)
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(playing){ if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
        hour=(hour+dt*3)%24;                         // 약 8초에 하루
        var r=el.querySelector('.ea-range'); if(r)r.value=hour;
        render(); renderStatus();
      }
      requestAnimationFrame(loop);
    }

    function clockStr(h){ var hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
    function renderStatus(){
      var s=el.querySelector('.ea-status'), clk=el.querySelector('.ea-clock'); if(clk)clk.textContent=clockStr(hour);
      var tod=timeOfDay(hour,lat), nm,col,sub;
      if(tod==='noon'){nm='낮 · 정오 ☀️';col=C.day;sub='우리나라가 태양을 정면으로 봐요. 태양이 하늘 가장 높이 떠 있어요.';}
      else if(tod==='morning'){nm='낮 · 아침 🌤️';col=C.day;sub='우리나라가 막 태양 쪽으로 들어왔어요. 태양이 동쪽 하늘에 낮게 떠 있어요.';}
      else if(tod==='afternoon'){nm='낮 · 오후 🌇';col=C.day;sub='태양이 서쪽으로 기울어요. 곧 우리나라가 어두운 쪽(밤)으로 들어가요.';}
      else if(tod==='sunrise'){nm='해돋이 🌅';col='#FF922B';sub='낮과 밤의 경계예요. 자전으로 우리나라가 태양 쪽으로 막 들어오는 순간 — 해가 떠요.';}
      else if(tod==='sunset'){nm='해넘이 🌆';col='#FF922B';sub='낮과 밤의 경계예요. 우리나라가 태양 반대쪽으로 넘어가는 순간 — 해가 져요.';}
      else{nm='밤 🌙';col=C.night;sub='우리나라가 태양 반대쪽이에요. 태양 빛이 닿지 않아 어두운 밤이에요.';}
      s.innerHTML='<div style="font-size:25px;color:'+col+';">'+clockStr(hour)+' — '+nm+'</div>'
        +'<div style="font-size:17px;color:#5a7894;margin-top:5px;">'+sub+'</div>'
        +'<div style="font-size:15px;color:#8aa0b6;margin-top:4px;">지구는 하루에 한 바퀴 서→동으로 자전해요. 태양이 도는 게 아니라 지구가 돌아서 낮과 밤이 생겨요.</div>';
      checkMission();
    }
    function checkMission(){
      var all=true;
      MISSIONS.forEach(function(m){ if(m.test())done[m.k]=true; if(!done[m.k])all=false; });
      el.querySelectorAll('.ea-chip').forEach(function(c){var k=c.dataset.k;
        if(done[k]&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
      if(all){var s=el.querySelector('.ea-status');
        if(s&&s.innerHTML.indexOf('하루 전체')<0)s.innerHTML+='<div style="font-size:16px;color:#12B886;margin-top:5px;">하루 전체를 다 봤어요! ✨ 한 곳이 아침→정오→저녁→밤으로 변하는 건 지구가 자전하기 때문이에요.</div>';}
    }

    function setHour(v){ hour=Math.max(0,Math.min(24,v)); var r=el.querySelector('.ea-range'); if(r&&+r.value!==hour)r.value=hour; render(); renderStatus(); }
    function bind(){
      el.querySelector('.ea-range').addEventListener('input',function(e){ if(playing)togglePlay(); setHour(+e.target.value); });
      el.querySelector('[data-act="play"]').addEventListener('click',togglePlay);
      el.querySelectorAll('.ea-chip').forEach(function(c){c.addEventListener('click',function(){
        var m=MISSIONS.filter(function(x){return x.k===c.dataset.k;})[0], s=el.querySelector('.ea-status');
        if(s&&m)s.innerHTML='<div style="font-size:21px;color:'+C.ink+';">'+m.l+' 만들기</div><div style="font-size:17px;color:#5a7894;margin-top:5px;">'+m.tip+'</div>';
      });});
      // 카메라 드래그 (우주 시점 회전)
      var drag=false,px=0,py=0;
      function dn(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
      function mv(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.5,Math.min(1.5,phi));px=p.clientX;py=p.clientY;camPos();render();if(e.touches)e.preventDefault();}
      function up(){drag=false;if(stage)stage.style.cursor='grab';}
      stage.addEventListener('mousedown',dn); stage.addEventListener('touchstart',dn,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){mv(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      _mv=mv; _up=up; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    }
    var _mv,_up;
    function togglePlay(){ playing=!playing; last=0;
      var b=el.querySelector('[data-act="play"]'); b.textContent=playing?'■ 멈춤':'▶ 하루 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
