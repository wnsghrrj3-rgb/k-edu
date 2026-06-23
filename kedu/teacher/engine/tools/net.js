/* ============================================================================
   케이랩 도구 모듈 — 전개도 (net) v2
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 자유탐구 — v1 자산(슬라이더·▶접기/◀펼치기·드래그 회전·6면 색) 완전 유지.
     · 미션 — 완전히 접기→펼치기→마주보는 면 탐구→회전 관찰 4단계.
     · 퀴즈 — 전개도·정육면체 개념 선택지 5문 출제.
   - 의존: THREE (전역), window.KLab
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var FACE = [0xE64980,0x1565C0,0xF59F00,0x0CA678,0x7048E8,0xFF8A3D];
  var FACE_NAME = ['분홍(바닥)','파랑(앞)','노랑(뒤)','초록(오른쪽)','보라(왼쪽)','주황(위)'];

  window.KLab.register('net', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes: ['free', 'mission'],         quiz: false, missionN: 2, quizN: 0 },
      mid:  { modes: ['free', 'mission', 'quiz'], quiz: true,  missionN: 3, quizN: 3 },
      high: { modes: ['free', 'mission', 'quiz'], quiz: true,  missionN: 4, quizN: 5 }
    };
    var grade = (['low', 'mid', 'high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G() { return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var t = (typeof config.fold === 'number') ? Math.max(0, Math.min(config.fold, 1)) : 0;
    var targetT = t;

    var bands = ui.gradeBands({ grade: grade, locked: !!config.grade, onChange: function (g) {
      grade = g;
      if (G().modes.indexOf(mode) < 0) mode = 'free';
      t = 0; targetT = 0; mStep = 0; mDone = false; mLock = false; rotated = false;
      if (mode === 'quiz') shuffleQuiz();
      cleanup3d(); buildUI();
    } });

    // ---- 미션 ----
    // M1: 완전히 접기(t>=0.99), M2: 완전히 펼치기(t<=0.01), M3: 중간(0.3~0.7) 상태로 두기, M4: 접고 드래그
    var MISSIONS = [
      { text: '슬라이더나 <b style="color:#7048E8;">접기 ▶</b> 버튼으로 전개도를 완전히 <b style="color:#7048E8;">접어</b> 정육면체를 만들어 봐요!',
        check: function() { return t >= 0.98; } },
      { text: '이번엔 <b style="color:#7048E8;">◀ 펼치기</b>로 다시 평면 전개도로 펼쳐 봐요!',
        check: function() { return t <= 0.02; } },
      { text: '슬라이더를 중간(50%)쯤에 놓고, <b style="color:#7048E8;">면이 접히는 모습</b>을 관찰해 봐요!',
        check: function() { return t >= 0.35 && t <= 0.65; } },
      { text: '완전히 접은 뒤, <b style="color:#7048E8;">드래그해서 돌려</b> 6면을 모두 확인해 봐요!',
        check: function() { return t >= 0.98 && rotated; } }
    ];
    var mStep = 0, mDone = false, mLock = false, rotated = false;
    function curMissions() { return MISSIONS.slice(0, G().missionN); }

    // ---- 퀴즈 (중·고만) ----
    var QUIZ_POOL = [
      { q: '전개도를 접으면 어떤 입체가 될까요?', answer: '정육면체', choices: ['직육면체','정육면체','삼각형','원기둥'] },
      { q: '정육면체의 면은 몇 개인가요?', answer: '6개', choices: ['4개','5개','6개','8개'] },
      { q: '정육면체에서 마주보는 면은 몇 쌍인가요?', answer: '3쌍', choices: ['1쌍','2쌍','3쌍','4쌍'] },
      { q: '전개도에서 면의 수는?', answer: '6개', choices: ['4개','5개','6개','7개'] },
      { q: '정육면체의 꼭짓점은 몇 개인가요?', answer: '8개', choices: ['6개','7개','8개','12개'] },
    ];
    // 중학년 = 기본 개념(접으면 정육면체·면 6개·전개도 면 수), 고학년 = 전체(마주보는 면·꼭짓점 포함)
    function quizPool() { return (grade==='mid') ? [QUIZ_POOL[0], QUIZ_POOL[1], QUIZ_POOL[3]] : QUIZ_POOL; }
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz(){
      qList=quizPool().slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=qList[i];qList[i]=qList[j];qList[j]=tmp;}
      qIdx=0; qScore=0; qCount=0;
    }

    var alive = false;
    var renderer3, scene3, camera3, root3, pFront3, pBack3, pRight3, pLeft3, pTop3;
    var drag3=false, dpx3=0, dpy3=0, theta3=0.7, phi3=1.0, radius3=4.6;
    var onMM3=function(){}, onMU3=function(){};

    function cleanup3d(){
      alive=false;
      window.removeEventListener('mousemove',onMM3);
      window.removeEventListener('mouseup',onMU3);
      var stage=el.querySelector('.nt-stage');
      if(renderer3){renderer3.dispose();if(stage&&renderer3.domElement.parentNode===stage)stage.removeChild(renderer3.domElement);}
    }

    function buildUI(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode);
      var bar='',foot='';

      if(mode==='mission'){var M=curMissions();bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length);}
      else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(q.choices.map(function(v){return{v:v,label:v};}));
      }

      var foldRow='<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:12px;">'
        +'<button class="nt-btn" data-act="unfold" style="font-size:25px;padding:14px 26px;border-radius:16px;border:3px solid #1565C0;background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">◀ 펼치기</button>'
        +'<input class="nt-slider" type="range" min="0" max="100" value="'+Math.round(t*100)+'" style="width:240px;height:8px;">'
        +'<button class="nt-btn" data-act="fold" style="font-size:25px;padding:14px 26px;border-radius:16px;border:3px solid #1565C0;background:#1565C0;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">접기 ▶</button>'
        +'</div>';

      el.innerHTML='<style>.nt-btn:active{transform:translateY(2px);}.kl-choice{min-width:100px !important;}</style>'
        +top+bar+foldRow
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="nt-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'54vh')+';min-height:280px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        +foot
        +'<div class="nt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#1B3A57;"></div>';

      ui.bindModeTabs(el,function(m){
        mode=m;t=0;targetT=0;mStep=0;mDone=false;mLock=false;rotated=false;
        if(m==='quiz')shuffleQuiz();
        cleanup3d();buildUI();
      });
      bands.bind(el);

      init3d();

      var slider=el.querySelector('.nt-slider');
      if(slider)slider.addEventListener('input',function(){targetT=t=(+slider.value)/100;applyFold();updateStatus();if(mode==='mission')checkMission();});
      var foldBtn=el.querySelector('[data-act="fold"]');
      var unfoldBtn=el.querySelector('[data-act="unfold"]');
      if(foldBtn)foldBtn.addEventListener('click',function(){targetT=1;if(mode==='mission')setTimeout(function(){checkMission();},1600);});
      if(unfoldBtn)unfoldBtn.addEventListener('click',function(){targetT=0;if(mode==='mission')setTimeout(function(){checkMission();},1600);});

      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return;qLock=true;qCount++;
          var q=qList[qIdx];
          var ok=(b.dataset.v===String(q.answer));
          if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){qIdx++;if(qIdx>=qList.length)shuffleQuiz();qLock=false;cleanup3d();buildUI();},1400);
        });
      });
    }

    function init3d(){
      var stage=el.querySelector('.nt-stage'); if(!stage)return;
      var W=stage.clientWidth||720,H=stage.clientHeight||380;
      scene3=new THREE.Scene();
      camera3=new THREE.PerspectiveCamera(42,W/H,0.1,100);
      renderer3=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer3.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer3.setSize(W,H);
      renderer3.shadowMap.enabled=true;renderer3.shadowMap.type=THREE.PCFSoftShadowMap;
      stage.appendChild(renderer3.domElement);
      scene3.add(new THREE.HemisphereLight(0xffffff,0xb8cbe0,0.9));
      var key=new THREE.DirectionalLight(0xffffff,0.85);key.position.set(4,9,6);key.castShadow=true;
      key.shadow.mapSize.width=1024;key.shadow.mapSize.height=1024;key.shadow.camera.far=40;
      key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;
      scene3.add(key);scene3.add((function(){var f=new THREE.DirectionalLight(0xffffff,0.25);f.position.set(-5,4,-4);return f;})());

      function faceMesh(color){
        var g=new THREE.PlaneGeometry(1,1);
        var m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:color,roughness:0.5,metalness:0.02,side:THREE.DoubleSide}));
        m.castShadow=true;
        var edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x1B3A57}));
        m.add(edges);return m;
      }
      root3=new THREE.Group();scene3.add(root3);
      var bottom=faceMesh(FACE[0]);bottom.rotation.x=-Math.PI/2;root3.add(bottom);
      function hinge(px,py,pz){var g=new THREE.Group();g.position.set(px,py,pz);root3.add(g);return g;}
      pFront3=hinge(0,0,0.5);var front=faceMesh(FACE[1]);front.rotation.x=-Math.PI/2;front.position.set(0,0,0.5);pFront3.add(front);
      pBack3=hinge(0,0,-0.5);var back=faceMesh(FACE[2]);back.rotation.x=-Math.PI/2;back.position.set(0,0,-0.5);pBack3.add(back);
      pRight3=hinge(0.5,0,0);var right=faceMesh(FACE[3]);right.rotation.x=-Math.PI/2;right.position.set(0.5,0,0);pRight3.add(right);
      pLeft3=hinge(-0.5,0,0);var left=faceMesh(FACE[4]);left.rotation.x=-Math.PI/2;left.position.set(-0.5,0,0);pLeft3.add(left);
      pTop3=new THREE.Group();pTop3.position.set(0,0,-0.5);pBack3.add(pTop3);
      var top=faceMesh(FACE[5]);top.rotation.x=-Math.PI/2;top.position.set(0,0,-0.5);pTop3.add(top);
      applyFold();

      function cam(){camera3.position.set(radius3*Math.sin(phi3)*Math.sin(theta3),radius3*Math.cos(phi3),radius3*Math.sin(phi3)*Math.cos(theta3));camera3.lookAt(0,0.3,0);}
      cam();
      function down(e){drag3=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;dpx3=p.clientX;dpy3=p.clientY;}
      function up(){drag3=false;stage.style.cursor='grab';}
      onMM3=function(e){if(!drag3)return;var p=e.touches?e.touches[0]:e;theta3-=(p.clientX-dpx3)*0.008;phi3-=(p.clientY-dpy3)*0.006;phi3=Math.max(0.3,Math.min(1.45,phi3));dpx3=p.clientX;dpy3=p.clientY;cam();if(mode==='mission'&&t>=0.98){rotated=true;checkMission();}if(e.touches)e.preventDefault();};
      onMU3=up;
      stage.addEventListener('mousedown',down);window.addEventListener('mousemove',onMM3);window.addEventListener('mouseup',onMU3);
      stage.addEventListener('touchstart',down,{passive:false});stage.addEventListener('touchmove',onMM3,{passive:false});stage.addEventListener('touchend',up);

      function onResize(){var nw=stage.clientWidth||W,nh=stage.clientHeight||H;camera3.aspect=nw/nh;camera3.updateProjectionMatrix();renderer3.setSize(nw,nh);}
      window.addEventListener('resize',onResize);

      alive=true;
      function loop(){if(!alive)return;
        if(Math.abs(targetT-t)>0.005){t+=(targetT-t)*0.12;applyFold();var sl=el.querySelector('.nt-slider');if(sl)sl.value=Math.round(t*100);updateStatus();}
        renderer3.render(scene3,camera3);requestAnimationFrame(loop);}
      requestAnimationFrame(loop);
    }

    function applyFold(){
      if(!pFront3)return;
      var a=t*Math.PI/2;
      pFront3.rotation.x=-a;pBack3.rotation.x=a;pRight3.rotation.z=a;pLeft3.rotation.z=-a;pTop3.rotation.x=a;
    }

    function updateStatus(){
      var statusEl=el.querySelector('.nt-status'); if(!statusEl)return;
      if(mode==='quiz'){statusEl.innerHTML='<span style="font-size:22px;color:#5a7894;">전개도를 보고 아래에서 선택하세요!</span>';}
      else{
        var doneMsg=(!G().quiz)?'접으니 상자(정육면체)가 됐어요! ✅':'정육면체 완성! ✅';
        statusEl.innerHTML='<span style="font-size:26px;">'+(t<0.02?'평면 전개도':(t>0.98?doneMsg:'접는 중 '+Math.round(t*100)+'%'))+'</span>';
      }
    }

    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true;ui.toast(el,true);
        setTimeout(function(){
          mStep++;
          if(mStep>=M.length){mDone=true;cleanup3d();buildUI();return;}
          if(mStep===1)targetT=1; // M2 진입 시 접힌 상태
          mLock=false;cleanup3d();buildUI();
        },1500);
      }
    }

    shuffleQuiz();
    buildUI();
    return function cleanup(){cleanup3d();};
  });
})();
