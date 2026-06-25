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
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음

    // ── 와우 ④ 마법모먼트(예측 빗나감형): 불량 전개도 ──
    // "다른 전개도 도전" → 한 면(top)이 잘못 달린 전개도 → 접으면 면이 겹치고 윗면이 빔
    //   = "면이 6개면 다 정육면체가 된다" 오개념 반증. (mid/high만 — 저학년은 정상 접기가 핵심 닻)
    var badNet = false;      // 불량 전개도 모드
    var magicShown = false;  // 마법 배너 1회성 가드
    var magicArmed = false;  // 바른 전개도로 복귀 후 첫 완성에만 초록(해소) 배너

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
      badNet = false; magicShown = false; magicArmed = false;
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

      // 와우 ④ 불량 전개도 도전 버튼 (자유탐구 + 중·고만 — 저학년은 정상 접기가 핵심 닻이라 게이팅)
      var canChallenge = (mode==='free' && grade!=='low');
      var challengeRow = canChallenge
        ? '<div style="display:flex;justify-content:center;margin-bottom:12px;">'
          + (badNet
             ? '<button class="nt-btn" data-act="goodnet" style="font-size:21px;padding:11px 22px;border-radius:14px;border:3px solid #12B886;background:#fff;color:#0CA678;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">✅ 바른 전개도로</button>'
             : '<button class="nt-btn" data-act="badnet" style="font-size:21px;padding:11px 22px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🔮 다른 전개도 도전</button>')
          + '</div>'
        : '';

      el.innerHTML='<style>.nt-btn:active{transform:translateY(2px);}.kl-choice{min-width:100px !important;}'
        +'.nt-flash{animation:ntFlashKf 2.8s ease both;}'
        +'@keyframes ntFlashKf{0%{opacity:0;transform:translateX(-50%) translateY(-8px);}10%{opacity:1;transform:translateX(-50%) translateY(0);}88%{opacity:1;transform:translateX(-50%) translateY(0);}100%{opacity:0;transform:translateX(-50%) translateY(0);}}'
        +'.nt-hold{display:inline-block;animation:ntHoldKf 1.1s ease both;transform-origin:center;}'
        +'@keyframes ntHoldKf{0%{transform:scale(1);}25%{transform:scale(1.18);color:#7048E8;}55%{transform:scale(.94);}100%{transform:scale(1);}}</style>'
        +top+bar+foldRow+challengeRow
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="nt-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'54vh')+';min-height:280px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        +foot
        +'<div class="nt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#1B3A57;"></div>';

      ui.bindModeTabs(el,function(m){
        mode=m;t=0;targetT=0;mStep=0;mDone=false;mLock=false;rotated=false;
        badNet=false;magicShown=false;magicArmed=false;
        if(m==='quiz')shuffleQuiz();
        cleanup3d();buildUI();
      });
      bands.bind(el);

      init3d();

      var slider=el.querySelector('.nt-slider');
      if(slider)slider.addEventListener('input',function(){targetT=t=(+slider.value)/100;applyFold();updateStatus();if(mode==='mission')checkMission();else{if(t>=0.98)fireMagic();else if(t<0.5)magicShown=false;}});
      var foldBtn=el.querySelector('[data-act="fold"]');
      var unfoldBtn=el.querySelector('[data-act="unfold"]');
      if(foldBtn)foldBtn.addEventListener('click',function(){targetT=1;snd('whoosh');if(mode==='mission')setTimeout(function(){checkMission();},1600);else fireMagic();});
      if(unfoldBtn)unfoldBtn.addEventListener('click',function(){targetT=0;snd('select');magicShown=false;clearFlash();if(mode==='mission')setTimeout(function(){checkMission();},1600);});

      // 와우 ④ 불량 전개도 도전 / 바른 전개도 복귀
      var badBtn=el.querySelector('[data-act="badnet"]');
      var goodBtn=el.querySelector('[data-act="goodnet"]');
      if(badBtn)badBtn.addEventListener('click',function(){
        badNet=true; magicShown=false; magicArmed=false;
        t=0; targetT=0; applyNetShape(); applyFold();
        snd('select'); cleanup3d(); buildUI();
      });
      if(goodBtn)goodBtn.addEventListener('click',function(){
        badNet=false; magicShown=false; magicArmed=true;   // 다음 완성에 해소(초록) 배너 1회
        t=0; targetT=0; applyNetShape(); applyFold();
        snd('select'); cleanup3d(); buildUI();
      });

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
      applyNetShape();applyFold();

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
        if(Math.abs(targetT-t)>0.005){t+=(targetT-t)*0.12;applyFold();var sl=el.querySelector('.nt-slider');if(sl)sl.value=Math.round(t*100);updateStatus();
          if(mode==='free'){if(t>=0.98)fireMagic();else if(t<0.5)magicShown=false;}}
        renderer3.render(scene3,camera3);requestAnimationFrame(loop);}
      requestAnimationFrame(loop);
    }

    function applyFold(){
      if(!pFront3)return;
      var a=t*Math.PI/2;
      pFront3.rotation.x=-a;pBack3.rotation.x=a;pRight3.rotation.z=a;pLeft3.rotation.z=-a;
      pTop3.rotation.x = badNet ? -a : a;   // 와우: 불량이면 top이 반대로 접혀 안쪽 겹침·윗면 빔
    }

    // 와우 ④ 전개도 모양 — 정상: top이 뒷면 위 한 칸 / 불량: top이 반대편에 붙어 접으면 겹침
    function applyNetShape(){
      if(!pTop3)return;
      pTop3.position.set(0,0, badNet ? 0.5 : -0.5);
    }

    function clearFlash(){
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      var f=host.querySelector('.nt-flash'); if(f&&f.parentNode)f.parentNode.removeChild(f);
    }
    function flashMagic(kind){
      var host=el.querySelector('.kl-stage-host'); if(!host)return;
      clearFlash();
      var bad=(kind==='bad');
      var div=document.createElement('div');
      div.className='nt-flash';
      div.style.cssText='position:absolute;left:50%;top:12px;transform:translateX(-50%);'
        +'max-width:92%;z-index:5;pointer-events:none;text-align:center;'
        +'background:'+(bad?'#7048E8':'#12B886')+';color:#fff;font-weight:800;'
        +'font-size:19px;line-height:1.45;padding:13px 20px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,0.18);';
      div.innerHTML=bad
        ? '면이 <b>6개</b>인데도 정육면체가 <b>안 돼요!</b> 🤔<br>한 면이 안쪽으로 겹치고 윗면이 뻥 뚫렸어요 — 면이 6개라고 다 정육면체가 되는 건 아니에요'
        : '이번엔 <b>딱 맞는 전개도!</b> ✨<br>빈틈도 겹침도 없이 정육면체가 됐어요';
      host.appendChild(div);
      setTimeout(function(){if(div&&div.parentNode)div.parentNode.removeChild(div);},2800);
    }
    function fireMagic(){   // 접기 완성 1회성 — 불량=빗나감(보라) / 복귀 후 첫 정상완성=해소(초록)
      if(mode!=='free'||magicShown)return;
      if(badNet){magicShown=true;snd('fail');flashMagic('bad');}
      else if(magicArmed){magicShown=true;snd('success');flashMagic('good');magicArmed=false;}
    }

    function updateStatus(){
      var statusEl=el.querySelector('.nt-status'); if(!statusEl)return;
      if(mode==='quiz'){statusEl.innerHTML='<span style="font-size:22px;color:#5a7894;">전개도를 보고 아래에서 선택하세요!</span>';}
      else if(badNet){
        statusEl.innerHTML=(t<0.02
          ? '<span style="font-size:24px;color:#7048E8;">이 전개도도 정육면체가 될까요? 🤔</span>'
          : (t>0.98
             ? '<span class="nt-hold" style="font-size:24px;color:#7048E8;">윗면이 비고 면이 겹쳤어요!</span>'
             : '<span style="font-size:24px;">접는 중 '+Math.round(t*100)+'%</span>'));
      }
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
