/* ============================================================================
   케이랩 도구 모듈 — 지구 자전·낮밤 (earth) v3  [과학 6호 · 천체 1호 · 3층]
   6학년 지구와 달의 운동 — 지구의 자전과 낮·밤.
     변수 → 현상 → 발견:
       ▸ 시간 슬라이더(0~24시) / ▶ 하루 재생 → 지구가 서→동으로 자전
       ▸ 태양광은 한 방향(평행광) → 태양을 향한 면=낮(밝음), 반대 면=밤(어두움)
       ▸ '우리나라' 핀이 자전 따라 낮↔밤으로 옮겨 가며 아침·정오·저녁·밤
       ▸ "낮과 밤은 태양이 도는 게 아니라 지구가 자전하기 때문" (오개념 직격)
   - 의존: THREE (전역, preview의 vendor/three.min.js), window.KLab
   - 자전축은 수직(기울기 0). 계절·기울기는 다른 도구에서 다룸.
   v3 · 3층: 미션 6단계(만들기↔생각형) + 🌀 만약에(거꾸로 자전=해가 서쪽에서!,
       2배 자전=하루 12시간, 자전 멈춤=아주 긴 낮). 퀴즈 = 장면 관찰형.
   - config: { hour(0~24, 기본 12), lat(기본 37.5), mode:"free"|"mission"|"quiz" }
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
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var hour = (config.hour!=null)?config.hour:12;
    var lat  = (config.lat!=null)?config.lat:37.5;
    var playing=false, alive=true, last=0, spinAcc=0;
    var C={ink:'#1B3A57',sub:'#9DB2C8',good:'#37D67A',day:'#FFD43B',night:'#5C7CFA'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    /* ───────────── 미션 6단계 (만들기 ↔ 생각형) ───────────── */
    var MISSIONS=[
      { type:'make', text:'☀️ 시간을 움직여 <b style="color:#7048E8;">우리나라 정오(낮 12시쯤)</b>를 만들어 봐요!',
        check:function(){ return timeOfDay(hour,lat)==='noon'; } },
      { type:'think', text:'🤔 우리 눈엔 <b style="color:#7048E8;">태양이 하늘을 가로질러 움직이는</b> 것처럼 보여요. 진짜는 무엇이 움직일까요?',
        ch:['지구가 자전해서 그렇게 보여요','태양이 지구 둘레를 돌아요','태양이 켜졌다 꺼졌다 해요'], a:0,
        why:'움직이는 건 우리(지구)! 회전목마를 타면 바깥 풍경이 도는 것처럼 보이는 것과 같아요.' },
      { type:'make', text:'🌙 이번엔 태양 반대쪽 — <b style="color:#7048E8;">한밤(자정쯤)</b>으로!',
        check:function(){ return timeOfDay(hour,lat)==='night'; } },
      { type:'make', text:'🌅 낮과 밤의 경계, <b style="color:#7048E8;">해돋이(아침 6시쯤)</b> 순간을 잡아 봐요!',
        check:function(){ return timeOfDay(hour,lat)==='sunrise'; } },
      { type:'make', text:'▶ <b style="color:#7048E8;">하루 재생</b>을 켜고 지구가 한 바퀴 도는 걸 끝까지 지켜봐요!',
        check:function(){ return spinAcc>=24; } },
      { type:'think', text:'🤔 마지막 질문! 내일 아침, 해는 <b style="color:#7048E8;">어느 쪽</b>에서 뜰까요?',
        ch:['동쪽 — 지구가 늘 같은 방향(서→동)으로 도니까','서쪽 — 날마다 바뀌니까','남쪽 — 한국은 남쪽이 밝으니까'], a:0,
        why:'지구는 언제나 서→동으로 자전해요. 그래서 해는 어제도 내일도 동쪽에서!' }
    ];
    var mStep=0,mDone=false,mLock=false;
    function advanceMission(){
      mLock=false; spinAcc=0;
      if(mStep<MISSIONS.length-1){ mStep++; if(MISSIONS[mStep].set)MISSIONS[mStep].set(); }
      else mDone=true;
      updateBars(); missionFoot(); render(); renderStatus();
    }
    function missionFoot(){
      ui.thinkFoot(el,{foot:'.ea-foot',bar:'.ea-bars'},(mode==='mission'&&!mDone&&MISSIONS[mStep].type==='think')?MISSIONS[mStep]:null,advanceMission);
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
      var host=el.querySelector('.ea-bars'); if(!host)return;
      if(mode==='mission')host.innerHTML=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else if(mode==='whatif')host.innerHTML=wif.barHTML();
      else host.innerHTML='';
    }

    /* ───────────── 🌀 만약에 (자전을 직접 바꿔 보기) ───────────── */
    var hrCnt=0;
    var WHATIF={
      rev:{ icon:'🔄', title:'지구가 거꾸로 자전한다면?',
        q:'지구가 반대 방향으로 자전하면, 해는 어느 쪽에서 뜰까요?',
        ch:['서쪽에서 떠요!','동쪽 그대로예요','해가 안 떠요'], a:0,
        reveal:'"해가 서쪽에서 뜨겠네"라는 말 알죠? 자전이 거꾸로면 진짜로 서쪽에서 해가 떠요. 해 뜨는 방향은 지구의 자전 방향이 정하는 거예요!',
        tip:'▶ 하루 재생을 눌러 봐요 — 시간이 거꾸로 흐르듯 빨간 핀이 반대로 돌아요!' },
      fast:{ icon:'⏩', title:'자전이 2배 빨라진다면?',
        q:'지구가 2배 빨리 돌면 하루는 어떻게 될까요?',
        ch:['12시간으로 짧아져요','24시간 그대로예요','이틀(48시간)이 돼요'], a:0,
        reveal:'하루 = 지구가 한 바퀴 도는 시간! 2배 빨리 돌면 하루가 12시간 — 낮 6시간, 밤 6시간이 돼요. 잠잘 시간이 모자라겠죠?',
        tip:'▶ 하루 재생 — 시계가 휙휙! 하루가 두 배 빨리 지나가요.' },
      stop:{ icon:'⏸', title:'자전이 멈춘다면?',
        q:'자전이 딱 멈추면, 지금 낮인 곳은 어떻게 될까요?',
        ch:['아주 오랫동안 낮이 계속돼요','곧바로 밤이 돼요','지금처럼 하루가 흘러요'], a:0,
        reveal:'자전이 멈추면 태양 쪽은 계속 낮! (아주 느린 공전 때문에 결국 바뀌긴 하지만, 반년짜리 낮이에요.) 하루의 리듬은 자전이 만든다는 것!',
        tip:'▶ 시간 흐르기 — 시간이 흘러도 시계와 핀이 그대로예요!' }
    };
    var wif=ui.whatifEngine({
      scenarios:WHATIF,
      rebuild:function(){buildUI();},
      footEl:function(){return el.querySelector('.ea-foot');},
      onSelect:function(k){ playing=false; hrCnt=0; hour=(k==='stop')?12:5; },
      onPlay:function(){ hrCnt=0; },
      onExit:function(){ playing=false; hrCnt=0; hour=12; }
    });

    /* ───────────── 퀴즈 (지구 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { hour:12, q:'빨간 핀(우리나라)이 태양 쪽을 보고 있어요. 지금 우리나라는?', ch:['낮','밤','알 수 없어요'], a:0 },
      { hour:0,  q:'빨간 핀이 태양 반대쪽에 있어요. 지금 우리나라는?', ch:['밤','낮','정오'], a:0 },
      { hour:12, q:'낮과 밤이 생기는 까닭은 무엇일까요?', ch:['지구가 자전해서','태양이 지구 둘레를 돌아서','달이 태양을 가려서'], a:0 },
      { hour:18, q:'지구가 한 바퀴 자전하는 데 걸리는 시간은?', ch:['하루 (24시간)','한 달','일 년'], a:0 },
      { hour:6,  q:'지구의 자전 방향은 어느 쪽일까요?', ch:['서쪽 → 동쪽','동쪽 → 서쪽','북쪽 → 남쪽'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      hour=QUIZ[qIdx].hour;
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
            var fc=el.querySelector('.ea-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }

    function buildUI(){
      var top=ui.modeTabs(['free','mission','quiz','whatif'],mode,{whatif:'🌀 만약에'}), bar='', foot='';
      var frozen=(wif.active()&&wif.state.key==='stop');
      var playLabel=frozen?(playing?'■ 멈춤':'▶ 시간 흐르기'):(playing?'■ 멈춤':'▶ 하루 재생');
      var ctrl='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<button class="ea-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+playLabel+'</button>'
          +'<input class="ea-range" type="range" min="0" max="24" step="0.25" value="'+hour+'" '+(frozen?'disabled':'')+' style="width:min(46vw,330px);'+(frozen?'opacity:.4;':'')+'">'
          +'<span class="ea-clock" style="font-size:22px;font-weight:800;color:'+C.ink+';min-width:78px;text-align:center;font-family:inherit;"></span>'
        +'</div>';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); ctrl=''; foot=ui.choices(quizChoices()); }
      else if(mode==='whatif'){ bar=wif.barHTML(); if(wif.state.phase==='pick'||wif.state.phase==='predict')ctrl=''; }
      el.innerHTML='<style>.ea-btn:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.ea-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#1A2B4A,#5C7CFA,#FFD43B,#5C7CFA,#1A2B4A);outline:none;}'
        +'.ea-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.ea-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}</style>'
        + top + '<div class="ea-bars">'+bar+'</div>' + ctrl
        +'<div class="kl-stage-host" style="position:relative;"><div class="ea-stage" style="position:relative;width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 70% 30%,#10183A 0%,#070B1E 70%,#03060F 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(92,124,250,0.18);">'
          +(mode==='quiz'?'':'<div class="ea-skypanel" style="position:absolute;bottom:12px;left:12px;width:212px;text-align:center;pointer-events:none;background:rgba(8,12,26,0.62);border-radius:14px;padding:7px 6px 5px;">'
            +'<svg class="ea-spsvg" viewBox="-80 -46 160 84" width="204" height="108">'
              +'<defs><linearGradient id="eaSp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16224a"/><stop offset="1" stop-color="#3a4f86"/></linearGradient></defs>'
              +'<rect class="ea-spbg" x="-80" y="-46" width="160" height="76" fill="url(#eaSp)" rx="6"/>'
              +'<g class="ea-spg"></g>'
              +'<line x1="-76" y1="30" x2="76" y2="30" stroke="#6b8a4a" stroke-width="3"/>'
              +'<rect x="-76" y="30" width="152" height="4" fill="#3f5a28"/>'
              +'<text x="-68" y="27" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">동</text>'
              +'<text x="0" y="27" text-anchor="middle" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">남</text>'
              +'<text x="68" y="27" text-anchor="end" fill="#9fb6e6" font-size="9" font-weight="800" font-family="inherit">서</text>'
            +'</svg>'
            +'<div class="ea-spcap" style="font-size:12px;color:#cdd6e6;font-weight:800;margin-top:1px;">우리나라 하늘에서 본 태양</div>'
          +'</div>')
        +'</div></div>'
        +'<div class="ea-foot">'+foot+'</div>'
        +'<div class="ea-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        wif.reset();
        mode=m; mStep=0;mDone=false;mLock=false; playing=false; spinAcc=0; hrCnt=0; hour=(m==='mission')?9:12;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindChoices();
      if(mode==='whatif')wif.bind(el);
      if(mode==='mission')missionFoot();
      render(); renderStatus();
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
      if(renderer){ try{renderer.dispose();}catch(e){} renderer=null; }
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

    function renderSky(){
      var g=el.querySelector('.ea-spg'); if(!g)return;
      g.innerHTML='';
      function S(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
      var rev=(wif.active()&&wif.state.key==='rev');
      var day=(hour>=6&&hour<=18);
      var bg=el.querySelector('.ea-spbg');
      // 경로 참조선
      g.appendChild(S('path',{d:'M -64 30 Q 0 -32 64 30',stroke:'#7d8db5','stroke-width':1.3,fill:'none','stroke-dasharray':'4 4',opacity:0.6}));
      var cap=el.querySelector('.ea-spcap');
      if(day){
        var t=(hour-6)/12;                       // 0(동) → 1(서)
        var x=-64+128*t; if(rev)x=-x;            // 거꾸로 자전이면 서→동!
        var y=30-Math.sin(t*Math.PI)*58;
        g.appendChild(S('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:6,fill:'#FFD43B',class:'ea-spsun'}));
        var hr=Math.floor(hour), mn=Math.round((hour-hr)*60); if(mn===60){hr=(hr+1)%24;mn=0;}
        if(cap)cap.textContent=hr+'시'+(mn?(' '+mn+'분'):'')+' — 태양이 '+(rev?'서→동':'동→남→서')+'으로 움직여요'+(rev?' (거꾸로!)':'');
        if(bg)bg.setAttribute('fill','url(#eaSp)');
      } else {
        for(var i=0;i<10;i++){
          g.appendChild(S('circle',{cx:(Math.sin(i*7.7)*70).toFixed(1),cy:(-40+((i*13)%62)).toFixed(1),r:(0.8+(i%3)*0.5),fill:'#cdd6ff',opacity:0.7,class:'ea-spstar'}));
        }
        var tn=S('text',{x:0,y:-8,'text-anchor':'middle',fill:'#9fb6e6','font-size':11,'font-weight':800,'font-family':'inherit'});
        tn.textContent='🌙 밤이에요 — 태양은 지구 반대편!'; g.appendChild(tn);
        if(cap)cap.textContent='밤하늘 — 자전이 우리를 태양 반대쪽으로 데려갔어요';
      }
    }
    function render(){
      if(earthGrp){ var ang=((hour-12)/24)*2*Math.PI; earthGrp.rotation.y=ang; }   // 자전(서→동)
      renderSky();
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(playing){ if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
        if(wif.active()&&wif.state.key==='stop'){
          hrCnt+=dt*8; renderStatus(); render(); requestAnimationFrame(loop); return;
        }
        var spd=3;
        if(wif.active()&&wif.state.key==='rev')spd=-3;
        if(wif.active()&&wif.state.key==='fast')spd=6;
        hour=(((hour+dt*spd)%24)+24)%24; spinAcc+=dt*Math.abs(spd);   // 약 8초에 하루
        var r=el.querySelector('.ea-range'); if(r)r.value=hour;
        render(); renderStatus();
      }
      requestAnimationFrame(loop);
    }

    function clockStr(h){ var hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
    function renderStatus(){
      var s=el.querySelector('.ea-status'), clk=el.querySelector('.ea-clock'); if(clk)clk.textContent=clockStr(hour);
      if(mode==='quiz'){ if(s)s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">지구와 빨간 핀, 태양을 잘 보고 답을 골라요! (화면을 끌어 돌려볼 수 있어요)</div>'; return; }
      if(mode==='whatif'){
        if(!s)return;
        if(wif.state.phase==='pick'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">카드를 골라 자전을 직접 바꿔 봐요 — 과학자는 늘 "만약에?"에서 출발!</div>'; return; }
        if(wif.state.phase==='predict'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">정답 걱정은 노노! 네 생각을 먼저 고르는 게 진짜 실험의 시작이에요.</div>'; return; }
        if(wif.state.key==='stop'){ s.innerHTML='<div style="font-size:32px;color:#0B7285;">⏱ +'+Math.floor(hrCnt)+'시간</div><div style="font-size:18px;color:#5a7894;margin-top:3px;">시간이 흘러도 빨간 핀은 계속 낮 — 자전이 하루를 만들어요!</div>'; return; }
        if(wif.state.key==='rev'){ s.innerHTML='<div style="font-size:20px;color:#0B7285;">🔄 거꾸로 도는 지구 — 빨간 핀의 아침이 어느 쪽에서 시작되는지 봐요!</div>'; return; }
        s.innerHTML='<div style="font-size:20px;color:#0B7285;">⏩ 2배 자전 — 시계가 두 배 빨리! 낮도 밤도 절반씩이에요.</div>'; return;
      }
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
    function setHour(v){ hour=Math.max(0,Math.min(24,v)); var r=el.querySelector('.ea-range'); if(r&&+r.value!==hour)r.value=hour; render(); renderStatus(); }
    function bind(){
      var rg=el.querySelector('.ea-range'); if(rg)rg.addEventListener('input',function(e){ if(playing)togglePlay(); setHour(+e.target.value); });
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',togglePlay);
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
      var b=el.querySelector('[data-act="play"]'); if(!b)return;
      b.textContent=playing?'■ 멈춤':'▶ 하루 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
