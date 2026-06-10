/* ============================================================================
   케이랩 도구 모듈 — 계절별 별자리 (constellation) v2  [과학 10호 · 천체 5호 · 3모드]
   5학년 태양계와 별 — 계절별 별자리와 북극성.
   하이브리드:
     ▸ 3D 공전 — 태양 중심, 지구가 궤도를 공전. 궤도 멀리 바깥 4방향에
        봄(사자)·여름(백조)·가을(페가수스)·겨울(오리온) 별자리가 떠 있다.
        지구의 밤(태양 반대쪽)이 향하는 별자리만 밝게 — 태양 쪽은 낮이라 흐림.
     ▸ 2D '밤하늘' 패널 — [남쪽 하늘] 지금 계절의 별자리를 별·선·이름으로.
        [북쪽 하늘] 북두칠성·카시오페이아·북극성, ⭐북극성 찾기(국자 끝 5배 연장).
   변수 → 현상 → 발견:
     공전 위치(봄·여름·가을·겨울) →
       ▸ 계절마다 밤하늘에 보이는 별자리가 다르다
       ▸ 같은 별자리가 반대 계절엔 태양과 같은 쪽 = 낮 하늘이라 보이지 않는다
       ▸ 북극성은 자전축이 가리키는 방향 — 일 년 내내 북쪽 같은 자리
     "별자리가 계절마다 다른 건 별이 움직여서가 아니라, 지구가 공전하면서
      밤에 바라보는 하늘의 방향이 바뀌기 때문."
   - 의존: THREE (전역, preview의 vendor/three.min.js), window.KLab
   v2: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 밤하늘 패널을 보고 답하기(퀴즈 중 별자리 이름 가림).
   - config: { orb(0~360, 0=봄·90=여름·180=가을·270=겨울, 기본 270),
               view:"south"|"north"(기본 south), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var T = window.THREE;

  // ── 순수 계산(THREE 불필요)
  // 가장 가까운 계절 별자리 인덱스 (0봄·1여름·2가을·3겨울)
  function nearestConst(orb){ return Math.round((((orb%360)+360)%360)/90)%4; }
  // 별자리 i가 공전각 orb에서 어떻게 보이나: night(밤하늘 잘 보임)/edge(초저녁·새벽)/day(태양 쪽=안 보임)
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

  // ── 별자리 데이터: 2D 상대좌표(가운데 0,0 기준) + 잇는 선
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
  // 북쪽 하늘: 북두칠성(0~6, 6=국자 끝 바깥·5=국자 끝 안쪽), 카시오페이아(7~11), 북극성(12)
  var NORTH={
    st:[[-58,16],[-46,22],[-34,20],[-24,12],[-36,2],[-48,4],[-25,-1],
        [22,-26],[32,-18],[40,-26],[50,-20],[58,-30],[2,-26]],
    dip:[[0,1],[1,2],[2,3],[3,6],[6,4],[4,5],[5,3]],
    cas:[[7,8],[8,9],[9,10],[10,11]]
  };

  window.KLab.register('constellation', function (el, config) {
    var orb=(config.orb!=null)?config.orb:270;
    var view=(config.view==='north')?'north':'south';
    var pointerOn=false;                 // ⭐북극성 찾기 연장선 표시
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var playing=false, alive=true, last=0, spin=0;
    var C={ink:'#1B3A57',sub:'#5a7894',mute:'#8aa0b6'};
    var btn='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var SEASONS=[ {o:0,l:'🌸 봄'},{o:90,l:'☀️ 여름'},{o:180,l:'🍂 가을'},{o:270,l:'❄️ 겨울'} ];

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'❄️ <b style="color:#7048E8;">겨울</b> 위치로 가서 남쪽 하늘에 <b style="color:#7048E8;">오리온자리</b>를 띄워 봐요!',
        check:function(){ return view==='south' && nearestConst(orb)===3; } },
      { text:'☀️ 이번엔 <b style="color:#7048E8;">여름</b> — 남쪽 하늘에 백조자리가 보이나요?',
        check:function(){ return view==='south' && nearestConst(orb)===1; } },
      { text:'🧭 <b style="color:#7048E8;">북쪽 하늘</b> 버튼을 눌러 북두칠성과 카시오페이아를 찾아봐요!',
        check:function(){ return view==='north'; } },
      { text:'⭐ <b style="color:#7048E8;">북극성 찾기</b>를 눌러요 — 국자 끝 두 별 사이를 5배 늘이면!',
        check:function(){ return view==='north' && pointerOn; } }
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
      var host=el.querySelector('.cn-bars'); if(!host)return;
      if(mode==='mission')host.innerHTML=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz')host.innerHTML=ui.quizBar(QUIZ[qIdx].q,qScore,qCount);
      else host.innerHTML='';
    }

    /* ───────────── 퀴즈 (밤하늘 패널을 보고 답하기 — 이름 가림) ───────────── */
    var QUIZ=[
      { orb:270, view:'south', ptr:false, q:'겨울 밤하늘 — 오른쪽 패널의 이 별자리는?', ch:['오리온자리','백조자리','사자자리'], a:0 },
      { orb:90,  view:'south', ptr:false, q:'여름 밤하늘 — 이 별자리의 이름은?', ch:['백조자리','오리온자리','페가수스자리'], a:0 },
      { orb:270, view:'north', ptr:false, q:'일 년 내내 북쪽 같은 자리에서 빛나는 별(물음표 자리)은?', ch:['북극성','오리온자리의 별','태양'], a:0 },
      { orb:0,   view:'south', ptr:false, q:'계절마다 보이는 별자리가 다른 까닭은?', ch:['지구가 공전해서','별이 빠르게 움직여서','달이 별을 가려서'], a:0 },
      { orb:270, view:'north', ptr:true,  q:'북극성을 찾을 때 국자 끝 두 별을 이용하는 별자리는?', ch:['북두칠성','오리온자리','사자자리'], a:0 }
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
    function bindChoices(){
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); updateBars();
            var fc=el.querySelector('.cn-foot'); if(fc){fc.innerHTML=ui.choices(quizChoices());bindChoices();}
            render(); renderStatus();
          },1500);
        });
      });
    }
    function seasonBtns(){return SEASONS.map(function(s){return '<button class="cn-sea" data-o="'+s.o+'" style="'+sbtn+'">'+s.l+'</button>';}).join('');}

    function buildUI(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      if(mode==='mission')bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length);
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      el.innerHTML='<style>.cn-btn:active,.cn-sea:active,.cn-vw:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.cn-sea.on,.cn-vw.on{background:#1565C0 !important;border-color:#1565C0 !important;color:#fff !important;}'
        +'.cn-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#F06595,#FF922B,#E8590C,#4DABF7,#F06595);outline:none;}'
        +'.cn-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.cn-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.cn-star{transition:opacity .3s;}</style>'
        + top + '<div class="cn-bars">'+bar+'</div>'
        +(mode==='quiz'?'<div style="display:none;">':'<div>')
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'+seasonBtns()
          +'<span style="width:10px;"></span>'
          +'<button class="cn-vw" data-v="south" style="'+sbtn+'">🌌 남쪽 하늘</button>'
          +'<button class="cn-vw" data-v="north" style="'+sbtn+'">🧭 북쪽 하늘</button>'
          +'<button class="cn-btn" data-act="polaris" style="'+sbtn+'border-color:#FFD43B;color:#9A6700;background:#FFF9DB;">⭐ 북극성 찾기</button>'
        +'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:9px;flex-wrap:wrap;">'
          +'<button class="cn-btn" data-act="play" style="'+btn+(playing?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+(playing?'■ 멈춤':'▶ 1년 재생')+'</button>'
          +'<span style="font-size:15px;color:#5a7894;font-weight:800;">공전 위치</span>'
          +'<input class="cn-range" type="range" min="0" max="360" step="1" value="'+orb+'" style="width:min(40vw,280px);">'
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
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; playing=false; orb=(m==='mission')?0:270; view='south'; pointerOn=false;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      initThree(); bind(); bindChoices(); render(); renderStatus();
    }

    // ── 3D
    var stage,scene,camera,renderer,earthPivot,earthSphere,constGroups=[],orbitR=5,farR=9.2;
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
      stage=el.querySelector('.cn-stage');
      var W=stage.clientWidth||720, H=stage.clientHeight||340;
      scene=new T.Scene();
      camera=new T.PerspectiveCamera(46, W/H, 0.1, 120);
      renderer=new T.WebGLRenderer({antialias:true, alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W,H); stage.appendChild(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff,0.3));
      var sunLight=new T.PointLight(0xffffff,1.9,0); sunLight.position.set(0,0,0); scene.add(sunLight);
      // 태양 스프라이트
      var sc=document.createElement('canvas'); sc.width=128; sc.height=128; var sx=sc.getContext('2d');
      var g=sx.createRadialGradient(64,64,6,64,64,62); g.addColorStop(0,'#FFFBEA'); g.addColorStop(0.45,'#FFD43B'); g.addColorStop(1,'rgba(255,170,40,0)');
      sx.fillStyle=g; sx.fillRect(0,0,128,128);
      var sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc),transparent:true,depthTest:false}));
      sunSpr.position.set(0,0,0); sunSpr.scale.set(2.4,2.4,1); scene.add(sunSpr);
      // 궤도 링
      var ring=new T.Mesh(new T.RingGeometry(orbitR-0.025,orbitR+0.025,80), new T.MeshBasicMaterial({color:0x3a4a6a,side:T.DoubleSide,transparent:true,opacity:0.55}));
      ring.rotation.x=Math.PI/2; scene.add(ring);
      // 지구
      earthPivot=new T.Group(); scene.add(earthPivot);
      earthSphere=new T.Mesh(new T.SphereGeometry(0.5,36,24), new T.MeshStandardMaterial({map:earthTex(),roughness:1,metalness:0}));
      earthPivot.add(earthSphere);
      // 별자리 4그룹 (방향 i*90, season의 earthPos와 동일 각도계)
      CONSTS.forEach(function(cd,i){
        var ph=(i*90+90)*Math.PI/180;
        var cx=farR*Math.cos(ph), cz=farR*Math.sin(ph);
        var tx=-Math.sin(ph), tz=Math.cos(ph);            // 접선(가로) 방향
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

    // ── 2D 패널
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
      if(view==='south'){
        var i=nearestConst(orb), cd=CONSTS[i];
        drawConst(g,{st:cd.st.map(function(p){return [p[0],p[1]-8];}),ln:cd.ln},'cn-star',1);
        var t=svgNS('text',{x:0,y:-38,'text-anchor':'middle',fill:'#FFE08A','font-size':11,'font-weight':800,'font-family':'inherit'});
        t.textContent=(mode==='quiz')?'이 별자리는 무엇일까요?':(cd.nm+' ('+cd.sea+')'); g.appendChild(t);
        if(cap)cap.textContent='지금 밤, 남쪽 하늘';
      } else {
        // 북두칠성 + 카시오페이아 + 북극성 (스케일 0.92, 위로 살짝)
        var st=NORTH.st.map(function(p){return [p[0]*0.92,p[1]*0.92-2];});
        NORTH.dip.forEach(function(L){g.appendChild(svgNS('line',{x1:st[L[0]][0],y1:st[L[0]][1],x2:st[L[1]][0],y2:st[L[1]][1],stroke:'#9fb6ff','stroke-width':1.5}));});
        NORTH.cas.forEach(function(L){g.appendChild(svgNS('line',{x1:st[L[0]][0],y1:st[L[0]][1],x2:st[L[1]][0],y2:st[L[1]][1],stroke:'#9fb6ff','stroke-width':1.5}));});
        st.forEach(function(p,idx){ if(idx===12)return;
          g.appendChild(svgNS('circle',{cx:p[0],cy:p[1],r:2.4,fill:'#fff'}));});
        // 북극성 찾기 연장선: 국자 끝 두 별(인덱스 4=안쪽, 5=바깥쪽)에서 북극성으로
        if(pointerOn){
          g.appendChild(svgNS('line',{x1:st[5][0],y1:st[5][1],x2:st[12][0],y2:st[12][1],
            stroke:'#FFD43B','stroke-width':1.8,'stroke-dasharray':'4 3',class:'cn-pointer'}));
          var t5=svgNS('text',{x:(st[5][0]+st[12][0])/2,y:(st[5][1]+st[12][1])/2-5,'text-anchor':'middle',fill:'#FFD43B','font-size':10,'font-weight':800,'font-family':'inherit'});
          t5.textContent='5배!'; g.appendChild(t5);
        }
        // 북극성 (찾으면 크게 반짝)
        g.appendChild(svgNS('circle',{cx:st[12][0],cy:st[12][1],r:pointerOn?4:2.6,fill:pointerOn?'#FFD43B':'#fff',class:'cn-polaris'}));
        var tn=svgNS('text',{x:st[12][0],y:st[12][1]-8,'text-anchor':'middle',fill:'#FFE08A','font-size':10,'font-weight':800,'font-family':'inherit'});
        tn.textContent=pointerOn?'⭐ 북극성!':'?'; g.appendChild(tn);
        var t2=svgNS('text',{x:-32,y:-36,'text-anchor':'middle',fill:'#cdd6e6','font-size':9,'font-weight':800,'font-family':'inherit'}); t2.textContent='북두칠성'; g.appendChild(t2);
        var t3=svgNS('text',{x:38,y:-36,'text-anchor':'middle',fill:'#cdd6e6','font-size':9,'font-weight':800,'font-family':'inherit'}); t3.textContent='카시오페이아'; g.appendChild(t3);
        if(cap)cap.textContent='북쪽 하늘 (일 년 내내)';
      }
    }

    function render(){
      if(earthPivot){ var p=earthPos(orb); earthPivot.position.set(p.x,0,p.z); }
      if(earthSphere) earthSphere.rotation.y=spin;
      // 별자리 밝기: 밤하늘=1 / 가장자리=0.55 / 낮(태양쪽)=0.18
      constGroups.forEach(function(grp,i){
        var v=visState(orb,i), op=(v==='night')?1:(v==='edge'?0.55:0.18);
        grp.userData.sMat.opacity=op; grp.userData.lMat.opacity=op*0.85;
      });
      renderPanel();
      if(renderer&&scene&&camera) renderer.render(scene,camera);
    }
    function loop(now){ if(!alive)return;
      if(!last)last=now; var dt=Math.min((now-last)/1000,0.05); last=now;
      spin += dt*0.9;
      if(playing){ orb=(orb+dt*36)%360;
        var r=el.querySelector('.cn-range'); if(r)r.value=orb; renderStatus(); }
      render();
      requestAnimationFrame(loop);
    }

    function renderStatus(){
      var i=nearestConst(orb), opp=(i+2)%4, sea=seasonName(orb);
      var s=el.querySelector('.cn-status'); if(!s)return;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;color:#8aa0b6;">오른쪽 밤하늘 패널과 지구의 위치를 보고 답을 골라요!</div>'; return; }
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
    function setOrb(v){ orb=((v%360)+360)%360; var r=el.querySelector('.cn-range'); if(r&&+r.value!==orb)r.value=orb; render(); renderStatus(); }
    var _mv,_up;
    function bind(){
      var rg=el.querySelector('.cn-range'); if(rg)rg.addEventListener('input',function(e){ if(playing)togglePlay(); setOrb(+e.target.value); });
      var pb=el.querySelector('[data-act="play"]'); if(pb)pb.addEventListener('click',togglePlay);
      var ob=el.querySelector('[data-act="polaris"]'); if(ob)ob.addEventListener('click',function(){
        pointerOn=!pointerOn; if(pointerOn&&view!=='north'){view='north';} render(); renderStatus(); });
      el.querySelectorAll('.cn-sea').forEach(function(b){b.addEventListener('click',function(){ if(playing)togglePlay(); setOrb(+b.dataset.o); });});
      el.querySelectorAll('.cn-vw').forEach(function(b){b.addEventListener('click',function(){ view=b.dataset.v; render(); renderStatus(); });});
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
      b.textContent=playing?'■ 멈춤':'▶ 1년 재생';
      b.style.background=playing?'#1565C0':'#fff'; b.style.color=playing?'#fff':'#1565C0'; }

    buildUI(); requestAnimationFrame(loop);
    return function cleanup(){ alive=false;
      if(_mv)window.removeEventListener('mousemove',_mv); if(_up)window.removeEventListener('mouseup',_up);
      try{renderer&&renderer.dispose();}catch(e){} };
  });
})();
