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
    var editable = (config.editable === false) ? false : true;
    var maxCount = (typeof config.maxCount === 'number' && config.maxCount > 0) ? config.maxCount : 80;
    var startShape = Array.isArray(config.shape) ? config.shape : DEFAULT_SHAPE;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';

    // ---- 미션 ----
    var MISSIONS = [
      { text: '쌓기나무를 <b style="color:#7048E8;">5개</b> 쌓아 봐요! (+쌓기 버튼이나 면을 클릭하세요)',
        check: function(cubes) { return Object.keys(cubes).length === 5; } },
      { text: '이번엔 <b style="color:#7048E8;">↺ 처음으로</b> 누른 뒤, <b style="color:#7048E8;">위에서 본 모양</b>이 ㄴ자(3칸+1칸)가 되게 쌓아 봐요!',
        check: function(cubes) {
          // 바닥층(y=0)에 ㄴ자 = 4칸, 높이는 모두 1층
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
    var mStep = 0, mDone = false, mLock = false;

    // ---- 퀴즈 ----
    // 모양별 정답 개수
    var QUIZ_POOL = [
      { q: '쌓기나무는 몇 개일까요?', shape:[[0,0,0],[1,0,0],[2,0,0],[0,1,0],[0,0,1]], answer:'5', choices:['4','5','6','7'] },
      { q: '쌓기나무는 몇 개일까요?', shape:[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1]], answer:'6', choices:['5','6','7','8'] },
      { q: '위에서 보면 몇 칸이 보일까요?', shape:[[0,0,0],[1,0,0],[0,0,1],[0,1,0]], answer:'3', choices:['2','3','4','5'] },
      { q: '쌓기나무는 몇 개일까요?', shape:[[0,0,0],[1,0,0],[2,0,0],[1,1,0],[1,0,1]], answer:'5', choices:['4','5','6','8'] },
      { q: '앞에서 보면 최대 층 높이는?', shape:[[0,0,0],[1,0,0],[0,1,0],[0,2,0],[1,1,0]], answer:'3층', choices:['1층','2층','3층','4층'] },
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = QUIZ_POOL.slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=qList[i];qList[i]=qList[j];qList[j]=tmp;}
      qIdx=0; qScore=0; qCount=0;
    }

    var btnBase = 'font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s,opacity .15s;';
    var viewBtn = 'font-size:22px;padding:12px 18px;border-radius:14px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function buildUI() {
      var top = ui.modeTabs(['free','mission','quiz'], mode);
      var bar = '', foot = '';

      if (mode === 'mission') {
        bar = mDone ? ui.doneBar() : ui.missionBar(MISSIONS[mStep].text, mStep, MISSIONS.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(q.choices.map(function(v){ return {v:v,label:v}; }));
      }

      el.innerHTML = '<style>.cb-btn:active{transform:translateY(2px);}.cb-btn.cb-on{background:#0B7285 !important;color:#fff !important;}.cb-view.cb-on{background:#0B7285 !important;color:#fff !important;}.kl-choice{min-width:80px !important;}</style>'
        + top + bar
        + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
        + '<span style="font-size:20px;font-weight:800;color:#5a7894;align-self:center;">시점</span>'
        + '<button class="cb-view cb-btn cb-on" data-view="free"  style="'+viewBtn+'">자유</button>'
        + '<button class="cb-view cb-btn" data-view="top"   style="'+viewBtn+'">위에서</button>'
        + '<button class="cb-view cb-btn" data-view="front" style="'+viewBtn+'">앞에서</button>'
        + '<button class="cb-view cb-btn" data-view="side"  style="'+viewBtn+'">옆에서</button>'
        + '</div>'
        + (editable && mode !== 'quiz'
          ? '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
            + '<span style="font-size:20px;font-weight:800;color:#5a7894;align-self:center;">손으로</span>'
            + '<button class="cb-mode cb-btn cb-on" data-mode="add" style="'+btnBase+'background:#1565C0;color:#fff;">＋ 쌓기</button>'
            + '<button class="cb-mode cb-btn" data-mode="del" style="'+btnBase+'background:#fff;color:#1565C0;">－ 빼기</button>'
            + '<button class="cb-btn" data-act="reset" style="font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
            + '</div>'
          : '')
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="cb-stage" style="width:100%;height:' + (mode==='quiz'?'40vh':'50vh') + ';min-height:300px;background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);border-radius:20px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
        + '</div>'
        + foot
        + '<div class="cb-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;color:#1B3A57;"></div>';

      ui.bindModeTabs(el, function(m) {
        mode = m; mStep=0; mDone=false; mLock=false;
        if (m === 'quiz') shuffleQuiz();
        cleanup3d();
        buildUI();
      });

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
        if(editMode==='del'){if(r.type==='cube'){removeCube(r.hit.object);updateStatus();if(mode==='mission')checkMission();}}
        else {
          if(r.type==='cube'){var c=r.hit.object.userData;var nlocal=r.hit.face.normal;var nx=Math.round(nlocal.x),ny=Math.round(nlocal.y),nz=Math.round(nlocal.z);if(addCube(c.gx+nx,c.gy+ny,c.gz+nz)){updateStatus();if(mode==='mission')checkMission();}}
          else if(r.type==='ground'){var gx=Math.round(r.hit.point.x),gz=Math.round(r.hit.point.z);var top=-1;for(var yy=0;yy<30;yy++)if(cubes[key3(gx,yy,gz)])top=yy;if(addCube(gx,top+1,gz)){updateStatus();if(mode==='mission')checkMission();}}
        }
      }
      renderer.domElement.addEventListener('pointerdown',function(e){downPt={x:e.clientX,y:e.clientY};});
      renderer.domElement.addEventListener('pointerup',function(e){if(!downPt)return;var dx=e.clientX-downPt.x,dy=e.clientY-downPt.y;if(dx*dx+dy*dy<36)handleClick(e.clientX,e.clientY);downPt=null;});

      function updateStatus(){
        if(!statusEl) return;
        var n=Object.keys(cubes).length;
        if(mode==='quiz'){statusEl.innerHTML='<span style="font-size:22px;color:#5a7894;">시점을 돌려 보고 개수를 세어 선택하세요!</span>';}
        else{statusEl.innerHTML='<span style="font-size:30px;">쌓기나무 </span><span style="font-size:48px;color:#1565C0;">'+n+'</span><span style="font-size:30px;">개  ＝  부피 </span><span style="font-size:48px;color:#0CA678;">'+n+'</span><span style="font-size:30px;"> 세제곱</span>';}
      }
      updateStatus();

      el.querySelectorAll('.cb-view').forEach(function(b){
        b.addEventListener('click',function(){setView(b.dataset.view);el.querySelectorAll('.cb-view').forEach(function(x){x.classList.toggle('cb-on',x.dataset.view===b.dataset.view);});});
      });
      el.querySelectorAll('.cb-mode').forEach(function(b){
        b.addEventListener('click',function(){
          editMode=b.dataset.mode;
          el.querySelectorAll('.cb-mode').forEach(function(x){x.classList.toggle('cb-on',x.dataset.mode===editMode);if(x.dataset.mode==='add'){x.style.background=editMode==='add'?'#1565C0':'#fff';x.style.color=editMode==='add'?'#fff':'#1565C0';}});
        });
      });
      var resetBtn=el.querySelector('[data-act="reset"]');
      if(resetBtn)resetBtn.addEventListener('click',function(){buildShape(startShape);setView('free');updateStatus();});

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
      if (MISSIONS[mStep].check(cubes)) {
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mStep++;
          if(mStep>=MISSIONS.length){mDone=true;cleanup3d();buildUI();return;}
          mLock=false; cleanup3d(); buildUI();
        },1500);
      }
    }

    shuffleQuiz();
    buildUI();

    return function cleanup() { cleanup3d(); };
  });
})();
