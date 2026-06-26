/* ============================================================================
   케이랩 도구 모듈 — 쌓기나무 (cubes) v2
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 자유탐구 — v1 자산(자유 회전·시점 전환·쌓기/빼기) 완전 유지.
     · 미션 — 5개 쌓기→위에서 ㄴ자→앞에서 2층→직육면체 12개 4단계.
     · 퀴즈 — 모양을 보고 개수 선택 / 정사영(위에서·앞에서·옆에서) 선택지.
   - 의존: THREE (전역), window.KLab
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;

  var CUBE = 0xFFB259;
  var OUTLINE = 0x7A4A12;
  var SHELL = 1.06;

  var DEFAULT_SHAPE = [
    [0,0,0],[1,0,0],[2,0,0],
    [0,0,1],[1,0,1],
    [0,1,0],[1,1,0],
    [0,2,0]
  ];

  window.KLab.register('cubes', function (el, config) {
    var ui = window.KLab.ui;

    /* ── ③효과음 헬퍼 ── */
    function snd(n){ if(window.KLab.sound && window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── ④마법모먼트(예측 빗나감형): 같은 개수라도 쌓는 모양 따라 드러난 면(겉넓이)이 달라짐 ── */
    function exposedFaces(c){
      if(!c) return 0;
      var keys=Object.keys(c), touch=0;
      var dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
      keys.forEach(function(k){
        var p=k.split(','), x=+p[0], y=+p[1], z=+p[2];
        dirs.forEach(function(d){ if(c[(x+d[0])+','+(y+d[1])+','+(z+d[2])]) touch++; });
      });
      return keys.length*6 - touch;   // 맞닿은 면쌍은 양쪽에서 2번 세지므로 그대로 빼면 됨
    }
    var SURF_COMPACT=[[0,0,0],[1,0,0],[0,0,1],[1,0,1],[0,1,0],[1,1,0],[0,1,1],[1,1,1]]; // 2×2×2 = 8개, 드러난 면 24
    var SURF_SPREAD =[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[4,0,0],[5,0,0],[6,0,0],[7,0,0]]; // 1×8 = 8개, 드러난 면 34
    var surfState=null; // null | 'compact' | 'spread'
    function clearFlash(){ var f=el.querySelector('.cb-flash'); if(f&&f.parentNode)f.parentNode.removeChild(f); }
    function showFlash(msg){
      clearFlash();
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      var d=window.document.createElement('div');
      d.className='cb-flash';
      d.style.cssText='position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:92%;background:linear-gradient(135deg,#7048E8,#9775FA);color:#fff;font-weight:800;font-size:20px;line-height:1.35;padding:14px 20px;border-radius:16px;box-shadow:0 8px 24px rgba(112,72,232,0.4);text-align:center;z-index:5;animation:cbFlashIn .3s ease;';
      d.textContent=msg; host.appendChild(d);
      setTimeout(function(){ if(d.parentNode){d.style.transition='opacity .4s';d.style.opacity='0';setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},420);} },3400);
    }

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes: ['free', 'mission'],         views: false, quiz: false, volume: false, missionN: 2, quizN: 0 },
      mid:  { modes: ['free', 'mission', 'quiz'], views: true,  quiz: true,  volume: true,  missionN: 3, quizN: 3 },
      high: { modes: ['free', 'mission', 'quiz'], views: true,  quiz: true,  volume: true,  missionN: 4, quizN: 5 }
    };
    var grade = (['low', 'mid', 'high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G() { return GRADES[grade]; }

    var editable = (config.editable === false) ? false : true;
    var maxCount = (typeof config.maxCount === 'number' && config.maxCount > 0) ? config.maxCount : 80;
    var startShape = Array.isArray(config.shape) ? config.shape : DEFAULT_SHAPE;
    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';

    var bands = ui.gradeBands({ grade: grade, locked: !!config.grade, onChange: function (g) {
      grade = g;
      if (G().modes.indexOf(mode) < 0) mode = 'free';
      if (!G().views) { viewMode = 'free'; }
      mStep = 0; mDone = false; mLock = false;
      surfState = null; clearFlash();
      if (mode === 'quiz') shuffleQuiz();
      cleanup3d(); buildUI();
    } });

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS = [
      { text: '쌓기나무를 <b style="color:#7048E8;">5개</b> 쌓아 봐요! (+쌓기 버튼이나 면을 클릭하세요)',
        check: function(cubes) { return Object.keys(cubes).length === 5; } },
      { text: '이번엔 <b style="color:#7048E8;">8개</b>를 쌓아 봐요! 모두 몇 개인지 세어 봐요!',
        check: function(cubes) { return Object.keys(cubes).length === 8; } }
    ];
    var BASE_MISSIONS = [
      { text: '쌓기나무를 <b style="color:#7048E8;">5개</b> 쌓아 봐요! (+쌓기 버튼이나 면을 클릭하세요)',
        check: function(cubes) { return Object.keys(cubes).length === 5; } },
      { text: '이번엔 <b style="color:#7048E8;">↺ 처음으로</b> 누른 뒤, <b style="color:#7048E8;">위에서 본 모양</b>이 ㄴ자(3칸+1칸)가 되게 쌓아 봐요!',
        check: function(cubes) {
          var ks=Object.keys(cubes); if(ks.length!==4) return false;
          var allFlat=true; ks.forEach(function(k){if(cubes[k].userData.gy!==0)allFlat=false;});
          return allFlat;
        }
      },
      { text: '<b style="color:#7048E8;">앞에서 본 모양</b>이 2층으로 보이게 쌓아 봐요! (바닥 위에 한 칸 더)',
        check: function(cubes) {
          var ys={}; Object.keys(cubes).forEach(function(k){var y=cubes[k].userData.gy;ys[y]=true;});
          return ys[0] && ys[1];
        }
      },
      { text: '가로 3×세로 2×높이 2인 <b style="color:#7048E8;">직육면체(12개)</b>를 쌓아 봐요!',
        check: function(cubes) {
          if(Object.keys(cubes).length!==12) return false;
          var ok=true;
          for(var x=0;x<3;x++) for(var y=0;y<2;y++) for(var z=0;z<2;z++){
            if(!cubes[x+','+y+','+z]) ok=false;
          }
          return ok;
        }
      }
    ];
    function curMissions() { return (grade==='low') ? LOW_MISSIONS : BASE_MISSIONS.slice(0, G().missionN); }
    var mStep = 0, mDone = false, mLock = false;

    // ---- 퀴즈 (중·고만) ----
    var QUIZ_POOL = [
      { q: '쌓기나무는 몇 개일까요?', shape:[[0,0,0],[1,0,0],[2,0,0],[0,1,0],[0,0,1]], answer:'5', choices:['4','5','6','7'] },
      { q: '쌓기나무는 몇 개일까요?', shape:[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1]], answer:'6', choices:['5','6','7','8'] },
      { q: '위에서 보면 몇 칸이 보일까요?', shape:[[0,0,0],[1,0,0],[0,0,1],[0,1,0]], answer:'3', choices:['2','3','4','5'] },
      { q: '쌓기나무는 몇 개일까요?', shape:[[0,0,0],[1,0,0],[2,0,0],[1,1,0],[1,0,1]], answer:'5', choices:['4','5','6','8'] },
      { q: '앞에서 보면 최대 층 높이는?', shape:[[0,0,0],[1,0,0],[0,1,0],[0,2,0],[1,1,0]], answer:'3층', choices:['1층','2층','3층','4층'] },
    ];
    // 중학년 = 개수 세기만(정사영 읽기 제외), 고학년 = 전체(위에서·앞에서 정사영 포함)
    function quizPool() { return (grade==='mid') ? [QUIZ_POOL[0], QUIZ_POOL[1], QUIZ_POOL[3]] : QUIZ_POOL; }
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = quizPool().slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=qList[i];qList[i]=qList[j];qList[j]=tmp;}
      qIdx=0; qScore=0; qCount=0;
    }

    var btnBase = 'font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s,opacity .15s;';
    var viewBtn = 'font-size:22px;padding:12px 18px;border-radius:14px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function buildUI() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode);
      var bar = '', foot = '';

      if (mode === 'mission') {
        var M = curMissions();
        bar = mDone ? ui.doneBar() : ui.missionBar(M[mStep].text, mStep, M.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(q.choices.map(function(v){ return {v:v,label:v}; }));
      }

      var viewRow = G().views
        ? '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
          + '<span style="font-size:20px;font-weight:800;color:#5a7894;align-self:center;">시점</span>'
          + '<button class="cb-view cb-btn cb-on" data-view="free"  style="'+viewBtn+'">자유</button>'
          + '<button class="cb-view cb-btn" data-view="top"   style="'+viewBtn+'">위에서</button>'
          + '<button class="cb-view cb-btn" data-view="front" style="'+viewBtn+'">앞에서</button>'
          + '<button class="cb-view cb-btn" data-view="side"  style="'+viewBtn+'">옆에서</button>'
          + '</div>' : '';

      el.innerHTML = '<style>.cb-btn:active{transform:translateY(2px);}.cb-btn.cb-on{background:#0B7285 !important;color:#fff !important;}.cb-view.cb-on{background:#0B7285 !important;color:#fff !important;}.kl-choice{min-width:80px !important;}@keyframes cbFlashIn{from{opacity:0;transform:translateX(-50%) translateY(-10px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}@keyframes cbHold{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}.cb-hold{display:inline-block;animation:cbHold .9s ease 2;}.cb-surf:active{transform:translateY(2px);}</style>'
        + top + bar
        + viewRow
        + (editable && mode !== 'quiz'
          ? '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
            + '<span style="font-size:20px;font-weight:800;color:#5a7894;align-self:center;">손으로</span>'
            + '<button class="cb-mode cb-btn cb-on" data-mode="add" style="'+btnBase+'background:#1565C0;color:#fff;">＋ 쌓기</button>'
            + '<button class="cb-mode cb-btn" data-mode="del" style="'+btnBase+'background:#fff;color:#1565C0;">－ 빼기</button>'
            + '<button class="cb-btn" data-act="reset" style="font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
            + ((G().views && mode==='free')
              ? '<button class="cb-surf" data-act="surf" style="font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🔭 같은 개수, 다르게</button>'
              : '')
            + '</div>'
          : '')
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="cb-stage" style="width:100%;height:' + (mode==='quiz'?'40vh':'50vh') + ';min-height:300px;background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);border-radius:20px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
        + '</div>'
        + foot
        + '<div class="cb-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;color:#1B3A57;"></div>';

      ui.bindModeTabs(el, function(m) {
        mode = m; mStep=0; mDone=false; mLock=false;
        surfState=null; clearFlash();
        if (m === 'quiz') shuffleQuiz();
        cleanup3d();
        buildUI();
      });
      bands.bind(el);

      init3d();

      el.querySelectorAll('.kl-choice').forEach(function(b) {
        b.addEventListener('click', function() {
          if (qLock) return; qLock=true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function() {
            qIdx++; if(qIdx>=qList.length) shuffleQuiz();
            qLock=false; cleanup3d(); buildUI();
          }, 1400);
        });
      });
    }

    // ---- THREE 씬 ----
    var scene, camera, renderer, cubes, cubeGroup, ground, grid;
    var alive = false;
    var theta = 0.7, phi = 0.95, tTheta = 0.7, tPhi = 0.95;
    var viewMode = 'free', editMode = 'add';
    var drag = false, dpx = 0, dpy = 0;
    var frustum = 9;
    var raycaster, mouse;

    function cleanup3d() {
      alive = false;
      var stage = el.querySelector('.cb-stage');
      if (renderer) { renderer.dispose(); if (stage && renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement); }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    function init3d() {
      var stage = el.querySelector('.cb-stage');
      var statusEl = el.querySelector('.cb-status');
      if (!stage) return;
      var W = stage.clientWidth || 720, H = stage.clientHeight || 360;
      scene = new THREE.Scene();
      var aspect = W/H;
      camera = new THREE.OrthographicCamera(-frustum*aspect/2, frustum*aspect/2, frustum/2, -frustum/2, 0.1, 100);
      renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      renderer.setSize(W,H);
      renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      stage.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xffffff,0xb8cbe0,0.85));
      var key=new THREE.DirectionalLight(0xffffff,0.9); key.position.set(6,12,8); key.castShadow=true;
      key.shadow.mapSize.width=1024; key.shadow.mapSize.height=1024;
      key.shadow.camera.near=1; key.shadow.camera.far=50;
      key.shadow.camera.left=-12; key.shadow.camera.right=12;
      key.shadow.camera.top=12; key.shadow.camera.bottom=-12;
      key.shadow.bias=-0.0004; scene.add(key);
      var fill=new THREE.DirectionalLight(0xffffff,0.25); fill.position.set(-6,5,-5); scene.add(fill);

      ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:0.2}));
      ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; ground.name='ground'; scene.add(ground);
      grid=new THREE.GridHelper(20,20,0x9AB7D4,0xC5D8EC); grid.position.y=0.001; scene.add(grid);

      var cubeMat=new THREE.MeshStandardMaterial({color:CUBE,roughness:0.55,metalness:0.02});
      var shellMat=new THREE.MeshBasicMaterial({color:OUTLINE,side:THREE.BackSide});
      var boxGeom=new THREE.BoxGeometry(1,1,1);
      var shellGeom=boxGeom.clone();
      cubes={}; cubeGroup=new THREE.Group(); scene.add(cubeGroup);

      function key3(x,y,z){return x+','+y+','+z;}
      function addCube(x,y,z){
        var k=key3(x,y,z); if(cubes[k]) return false;
        if(Object.keys(cubes).length>=maxCount) return false;
        var m=new THREE.Mesh(boxGeom,cubeMat); m.castShadow=true; m.receiveShadow=true;
        m.position.set(x,y+0.5,z);
        var shell=new THREE.Mesh(shellGeom,shellMat); shell.scale.multiplyScalar(SHELL); m.add(shell);
        m.userData.gx=x; m.userData.gy=y; m.userData.gz=z;
        cubeGroup.add(m); cubes[k]=m; return true;
      }
      function removeCube(mesh){var k=key3(mesh.userData.gx,mesh.userData.gy,mesh.userData.gz);if(!cubes[k])return;cubeGroup.remove(mesh);delete cubes[k];}
      function buildShape(arr){Object.keys(cubes).forEach(function(k){cubeGroup.remove(cubes[k]);});cubes={};arr.forEach(function(c){addCube(c[0],c[1]||0,c[2]||0);});}

      var curShape = (mode === 'quiz') ? (qList[qIdx]||qList[0]).shape : startShape;
      buildShape(curShape);

      camTo();

      // 드래그
      function down(e){if(viewMode!=='free')return;drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;dpx=p.clientX;dpy=p.clientY;}
      function up(){drag=false;stage.style.cursor='grab';}
      onMouseMove=function(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-dpx)*0.009;phi-=(p.clientY-dpy)*0.007;phi=Math.max(0.15,Math.min(1.45,phi));tTheta=theta;tPhi=phi;dpx=p.clientX;dpy=p.clientY;camTo();if(e.touches)e.preventDefault();};
      onMouseUp=up;
      stage.addEventListener('mousedown',down);
      window.addEventListener('mousemove',onMouseMove);
      window.addEventListener('mouseup',onMouseUp);
      stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',onMouseMove,{passive:false});
      stage.addEventListener('touchend',up);

      // 클릭 쌓기/빼기
      raycaster=new THREE.Raycaster(); mouse=new THREE.Vector2();
      var downPt=null;
      function pickAt(cx,cy){
        var rect=renderer.domElement.getBoundingClientRect();
        mouse.x=((cx-rect.left)/rect.width)*2-1; mouse.y=-((cy-rect.top)/rect.height)*2+1;
        raycaster.setFromCamera(mouse,camera);
        var hits=raycaster.intersectObjects(cubeGroup.children,false);
        if(hits.length) return {type:'cube',hit:hits[0]};
        var g=raycaster.intersectObject(ground,false);
        if(g.length) return {type:'ground',hit:g[0]};
        return null;
      }
      function handleClick(cx,cy){
        if(!editable||mode==='quiz') return;
        var r=pickAt(cx,cy); if(!r) return;
        if(editMode==='del'){if(r.type==='cube'){removeCube(r.hit.object);snd('tap');updateStatus();if(mode==='mission')checkMission();}}
        else {
          if(r.type==='cube'){var c=r.hit.object.userData;var nlocal=r.hit.face.normal;var nx=Math.round(nlocal.x),ny=Math.round(nlocal.y),nz=Math.round(nlocal.z);if(addCube(c.gx+nx,c.gy+ny,c.gz+nz)){snd('pop');updateStatus();if(mode==='mission')checkMission();}}
          else if(r.type==='ground'){var gx=Math.round(r.hit.point.x),gz=Math.round(r.hit.point.z);var top=-1;for(var yy=0;yy<30;yy++)if(cubes[key3(gx,yy,gz)])top=yy;if(addCube(gx,top+1,gz)){snd('pop');updateStatus();if(mode==='mission')checkMission();}}
        }
      }
      renderer.domElement.addEventListener('pointerdown',function(e){downPt={x:e.clientX,y:e.clientY};});
      renderer.domElement.addEventListener('pointerup',function(e){if(!downPt)return;var dx=e.clientX-downPt.x,dy=e.clientY-downPt.y;if(dx*dx+dy*dy<36)handleClick(e.clientX,e.clientY);downPt=null;});

      function updateStatus(){
        if(!statusEl) return;
        var n=Object.keys(cubes).length;
        var base;
        if(mode==='quiz'){base='<span style="font-size:22px;color:#5a7894;">시점을 돌려 보고 개수를 세어 선택하세요!</span>';}
        else if(!G().volume){base='<span style="font-size:30px;">모두 </span><span style="font-size:48px;color:#1565C0;">'+n+'</span><span style="font-size:30px;">개!</span>';}
        else{base='<span style="font-size:30px;">쌓기나무 </span><span style="font-size:48px;color:#1565C0;">'+n+'</span><span style="font-size:30px;">개  ＝  부피 </span><span style="font-size:48px;color:#0CA678;">'+n+'</span><span style="font-size:30px;"> 세제곱</span>';}
        if(surfState!==null && mode==='free'){
          base += '<div style="margin-top:10px;font-size:26px;color:#7048E8;font-weight:800;">드러난 면 <span class="cb-hold" style="font-size:40px;">'+exposedFaces(cubes)+'</span>개</div>';
        }
        statusEl.innerHTML=base;
      }
      updateStatus();

      el.querySelectorAll('.cb-view').forEach(function(b){
        b.addEventListener('click',function(){setView(b.dataset.view);snd('select');clearFlash();el.querySelectorAll('.cb-view').forEach(function(x){x.classList.toggle('cb-on',x.dataset.view===b.dataset.view);});});
      });
      el.querySelectorAll('.cb-mode').forEach(function(b){
        b.addEventListener('click',function(){
          editMode=b.dataset.mode; snd('tap');
          el.querySelectorAll('.cb-mode').forEach(function(x){x.classList.toggle('cb-on',x.dataset.mode===editMode);if(x.dataset.mode==='add'){x.style.background=editMode==='add'?'#1565C0':'#fff';x.style.color=editMode==='add'?'#fff':'#1565C0';}});
        });
      });
      var resetBtn=el.querySelector('[data-act="reset"]');
      if(resetBtn)resetBtn.addEventListener('click',function(){buildShape(startShape);setView('free');surfState=null;clearFlash();snd('select');updateStatus();});

      var surfBtn=el.querySelector('[data-act="surf"]');
      if(surfBtn)surfBtn.addEventListener('click',function(){
        if(surfState===null){
          // 1단계: 8개를 뭉쳐 놓고 "펼치면 드러난 면이 늘까?" 예측 유도(마법 아직)
          buildShape(SURF_COMPACT); surfState='compact'; setView('free');
          snd('select'); updateStatus();
          showFlash('쌓기나무 8개를 뭉쳐 놨어요. 펼치면 드러난 면(겉넓이)이 늘까요, 줄까요? 버튼을 한 번 더 눌러 봐요!');
          return;
        }
        var prev=exposedFaces(cubes);
        if(surfState==='compact'){ buildShape(SURF_SPREAD); surfState='spread'; }
        else { buildShape(SURF_COMPACT); surfState='compact'; }
        setView('free');
        var now=exposedFaces(cubes), n=Object.keys(cubes).length;
        snd('whoosh'); snd('success'); updateStatus();
        var msg=(surfState==='spread')
          ? '쌓기나무는 똑같이 '+n+'개인데 드러난 면이 '+prev+'개 → '+now+'개! 개수가 같아도 펼치면 겉넓이가 늘어나요'
          : '다시 뭉치니 드러난 면이 '+prev+'개 → '+now+'개! 같은 '+n+'개라도 쌓는 모양에 따라 겉넓이가 달라요';
        showFlash(msg);
      });

      alive=true;
      function loop(){if(!alive)return;theta+=(tTheta-theta)*0.18;phi+=(tPhi-phi)*0.18;camTo();renderer.render(scene,camera);requestAnimationFrame(loop);}
      requestAnimationFrame(loop);

      function onResize(){var nw=stage.clientWidth||W,nh=stage.clientHeight||H;var a=nw/nh;camera.left=-frustum*a/2;camera.right=frustum*a/2;camera.top=frustum/2;camera.bottom=-frustum/2;camera.updateProjectionMatrix();renderer.setSize(nw,nh);}
      window.addEventListener('resize',onResize);
    }

    var onMouseMove = function(){}, onMouseUp = function(){};

    function camTo(){camera.position.x=30*Math.sin(phi)*Math.sin(theta);camera.position.y=30*Math.cos(phi);camera.position.z=30*Math.sin(phi)*Math.cos(theta);camera.lookAt(0.5,0.8,0.5);}
    function setView(m){viewMode=m;if(m==='top'){tTheta=0;tPhi=0.02;}else if(m==='front'){tTheta=0;tPhi=Math.PI/2;}else if(m==='side'){tTheta=Math.PI/2;tPhi=Math.PI/2;}else{tTheta=theta;tPhi=phi;}}

    function checkMission() {
      if (mode !== 'mission' || mDone || mLock || !cubes) return;
      var M = curMissions();
      if (M[mStep].check(cubes)) {
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mStep++;
          if(mStep>=M.length){mDone=true;cleanup3d();buildUI();return;}
          mLock=false; cleanup3d(); buildUI();
        },1500);
      }
    }

    shuffleQuiz();
    buildUI();

    return function cleanup() { cleanup3d(); };
  });
})();
