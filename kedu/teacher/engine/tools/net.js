/* ============================================================================
   케이랩 도구 모듈 — 전개도 (net) v1
   초점 (5·6학년 전개도·겨냥도) = 평면 전개도가 입체로 접히는 과정을 눈으로.
     · 슬라이더(또는 ▶접기/◀펼치기)로 정육면체 전개도(십자)를 0%→100% 접는다.
     · 6면 색이 달라 "어느 면이 어디로 가는지" 추적. 드래그로 회전 관찰.
   종이는 한 번 접으면 끝이지만 여기선 반복·되감기·천천히 — 교구화 기준.
   ※ WebGL 렌더 → node 검증 불가. 접기 방향/각도는 화면에서 확인·조정.
   - 의존: THREE (전역), window.KLab
   - config: { fold(0~1 초기 접힘, 기본0) }
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;
  var FACE=[0xE64980,0x1565C0,0xF59F00,0x0CA678,0x7048E8,0xFF8A3D];
  window.KLab.register('net', function (el, config) {
    var t=(typeof config.fold==='number')?Math.max(0,Math.min(config.fold,1)):0;
    var targetT=t;
    el.innerHTML=
      '<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:12px;">'
        +'<button class="nt-btn" data-act="unfold" style="font-size:25px;padding:14px 26px;border-radius:16px;border:3px solid #1565C0;background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">◀ 펼치기</button>'
        +'<input class="nt-slider" type="range" min="0" max="100" value="'+Math.round(t*100)+'" style="width:240px;height:8px;">'
        +'<button class="nt-btn" data-act="fold" style="font-size:25px;padding:14px 26px;border-radius:16px;border:3px solid #1565C0;background:#1565C0;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">접기 ▶</button>'
      +'</div>'
      +'<div class="nt-stage" style="width:100%;height:54vh;min-height:380px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
      +'<div class="nt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#1B3A57;"></div>';
    var stage=el.querySelector('.nt-stage'), slider=el.querySelector('.nt-slider'), statusEl=el.querySelector('.nt-status');
    var W=stage.clientWidth||720,H=stage.clientHeight||380;
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(42,W/H,0.1,100);
    var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(W,H);
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff,0xb8cbe0,0.9));
    var key=new THREE.DirectionalLight(0xffffff,0.85); key.position.set(4,9,6); key.castShadow=true;
    key.shadow.mapSize.width=1024;key.shadow.mapSize.height=1024;key.shadow.camera.far=40;
    key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;
    scene.add(key);
    scene.add((function(){var f=new THREE.DirectionalLight(0xffffff,0.25);f.position.set(-5,4,-4);return f;})());

    function faceMesh(color){
      var g=new THREE.PlaneGeometry(1,1);
      var m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:color,roughness:0.5,metalness:0.02,side:THREE.DoubleSide}));
      m.castShadow=true;
      // 검은 테두리(EdgesGeometry)
      var edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x1B3A57}));
      m.add(edges);
      return m;
    }
    var root=new THREE.Group(); scene.add(root);
    // 바닥(고정): xz평면, 법선 +y
    var bottom=faceMesh(FACE[0]); bottom.rotation.x=-Math.PI/2; root.add(bottom);
    // 옆면 4개: 바닥 모서리 경첩 pivot
    function hinge(px,py,pz){var g=new THREE.Group();g.position.set(px,py,pz);root.add(g);return g;}
    // 면을 pivot 자식으로, 펼친 상태(바닥과 동일 평면)에 배치
    var pFront=hinge(0,0,0.5);  var front=faceMesh(FACE[1]); front.rotation.x=-Math.PI/2; front.position.set(0,0,0.5); pFront.add(front);
    var pBack =hinge(0,0,-0.5); var back =faceMesh(FACE[2]); back.rotation.x=-Math.PI/2; back.position.set(0,0,-0.5); pBack.add(back);
    var pRight=hinge(0.5,0,0);  var right=faceMesh(FACE[3]); right.rotation.x=-Math.PI/2; right.position.set(0.5,0,0); pRight.add(right);
    var pLeft =hinge(-0.5,0,0); var left =faceMesh(FACE[4]); left.rotation.x=-Math.PI/2; left.position.set(-0.5,0,0); pLeft.add(left);
    // 윗면: 뒤면 위 모서리 경첩 (뒤면 자식)
    var pTop=new THREE.Group(); pTop.position.set(0,0,-0.5); pBack.add(pTop); // 뒤면 바깥 모서리 = 펼친상태 z=-1
    var top=faceMesh(FACE[5]); top.rotation.x=-Math.PI/2; top.position.set(0,0,-0.5); pTop.add(top);

    function applyFold(){
      var a=t*Math.PI/2;
      pFront.rotation.x=-a;
      pBack.rotation.x= a;
      pRight.rotation.z= a;
      pLeft.rotation.z=-a;
      pTop.rotation.x= a;   // 뒤면 기준 한 번 더 접혀 천장
    }
    applyFold();

    var theta=0.7,phi=1.0,radius=4.6;
    function cam(){camera.position.set(radius*Math.sin(phi)*Math.sin(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(0,0.3,0);}
    cam();
    var drag=false,px=0,py=0;
    function down(e){drag=true;stage.style.cursor='grabbing';var p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;}
    function move(e){if(!drag)return;var p=e.touches?e.touches[0]:e;theta-=(p.clientX-px)*0.008;phi-=(p.clientY-py)*0.006;phi=Math.max(0.3,Math.min(1.45,phi));px=p.clientX;py=p.clientY;cam();if(e.touches)e.preventDefault();}
    function up(){drag=false;stage.style.cursor='grab';}
    stage.addEventListener('mousedown',down);window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
    stage.addEventListener('touchstart',down,{passive:false});stage.addEventListener('touchmove',move,{passive:false});stage.addEventListener('touchend',up);

    slider.addEventListener('input',function(){targetT=t=(+slider.value)/100;applyFold();updateStatus();});
    el.querySelector('[data-act="fold"]').addEventListener('click',function(){targetT=1;});
    el.querySelector('[data-act="unfold"]').addEventListener('click',function(){targetT=0;});
    function updateStatus(){statusEl.innerHTML='<span style="font-size:26px;">'+(t<0.02?'평면 전개도':(t>0.98?'정육면체 완성!':'접는 중 '+Math.round(t*100)+'%'))+'</span>';}
    updateStatus();

    var alive=true;
    function loop(){if(!alive)return;
      if(Math.abs(targetT-t)>0.005){t+=(targetT-t)*0.12;applyFold();slider.value=Math.round(t*100);updateStatus();}
      renderer.render(scene,camera);requestAnimationFrame(loop);}
    requestAnimationFrame(loop);
    function onResize(){var nw=stage.clientWidth||W,nh=stage.clientHeight||H;camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh);}
    window.addEventListener('resize',onResize);
    return function cleanup(){alive=false;window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);window.removeEventListener('resize',onResize);renderer.dispose();};
  });
})();
