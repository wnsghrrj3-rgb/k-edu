/* ============================================================================
   케이랩 도구 모듈 — 쌓기나무 (cubes) v1
   초점 (5·6학년 쌓기나무·부피) = 종이로 절대 못 하는 두 가지:
     ① 자유 회전 — 뒤·아래 가려진 칸을 돌려서 직접 확인하고 개수를 센다.
     ② 위/앞/옆 정사영 시점 — 버튼 한 번으로 "위에서 본 모양"을 그대로 본다.
   여기에 ③ 손으로 직접 쌓고 빼기(면을 누르면 그 방향에 한 칸 붙음 / 빼기
   모드에선 누른 칸이 사라짐) 를 더해 부피(=쌓기나무 개수)를 눈으로 만든다.
   실물 나무토막은 뒤를 보려면 손으로 돌려야 하고 망가지지만, 여기선
   즉각·정확·반복 가능 — 교구화 기준("디지털이 실물보다 결정적으로 나은 것만").

   - 의존: THREE (전역), window.KLab
   - config 예시:
       기본 세기 연습:  { }                       // 약간 가려진 8칸 모양 제공
       빈 판에서 쌓기:  { shape:[], }              // 바닥부터 직접 쌓기
       모양 지정:       { shape:[[0,0,0],[1,0,0],[0,1,0]] }
       shape    : 시작 큐브들의 [x,y,z] 격자좌표 배열 (y=위/높이). 생략 시 기본 모양.
       editable : 손으로 쌓기/빼기 허용 (기본 true)
       maxCount : 큐브 최대 개수 (기본 80)
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;

  var CUBE   = 0xFFB259;   // 쌓기나무 (따뜻한 나무톤, 전자칠판에서 또렷)
  var OUTLINE = 0x7A4A12;  // 외곽선 (진한 갈색 — 칸 경계 또렷)
  var SHELL  = 1.06;       // 외곽선 셸 배율

  // 기본 모양: 일부가 가려져 회전해야 정확히 세지는 8칸 (디지털 우위 시연용)
  var DEFAULT_SHAPE = [
    [0,0,0],[1,0,0],[2,0,0],
    [0,0,1],[1,0,1],
    [0,1,0],[1,1,0],
    [0,2,0]
  ];

  window.KLab.register('cubes', function (el, config) {
    var editable = (config.editable === false) ? false : true;
    var maxCount = (typeof config.maxCount === 'number' && config.maxCount > 0) ? config.maxCount : 80;
    var startShape = Array.isArray(config.shape) ? config.shape : DEFAULT_SHAPE;

    // ---------- UI 골격 (공통 스타일) ----------
    var btnBase = 'font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #1565C0;'
                + 'cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s,opacity .15s;';
    var viewBtn = 'font-size:22px;padding:12px 18px;border-radius:14px;border:3px solid #0B7285;'
                + 'background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    el.innerHTML =
      '<style>'
      + '.cb-btn:active{transform:translateY(2px);}'
      + '.cb-btn.cb-on{background:#0B7285 !important;color:#fff !important;}'
      + '.cb-view.cb-on{background:#0B7285 !important;color:#fff !important;}'
      + '</style>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
        + '<span style="font-size:20px;font-weight:800;color:#5a7894;align-self:center;">시점</span>'
        + '<button class="cb-view cb-btn cb-on" data-view="free"  style="' + viewBtn + '">자유</button>'
        + '<button class="cb-view cb-btn" data-view="top"   style="' + viewBtn + '">위에서</button>'
        + '<button class="cb-view cb-btn" data-view="front" style="' + viewBtn + '">앞에서</button>'
        + '<button class="cb-view cb-btn" data-view="side"  style="' + viewBtn + '">옆에서</button>'
      + '</div>'
      + (editable
        ? '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
          + '<span style="font-size:20px;font-weight:800;color:#5a7894;align-self:center;">손으로</span>'
          + '<button class="cb-mode cb-btn cb-on" data-mode="add" style="' + btnBase + 'background:#1565C0;color:#fff;">＋ 쌓기</button>'
          + '<button class="cb-mode cb-btn" data-mode="del" style="' + btnBase + 'background:#fff;color:#1565C0;">－ 빼기</button>'
          + '<button class="cb-btn" data-act="reset" style="font-size:24px;padding:13px 22px;border-radius:14px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
        + '</div>'
        : '')
      + '<div class="cb-stage" style="width:100%;height:50vh;min-height:340px;'
        + 'background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);'
        + 'border-radius:20px;overflow:hidden;cursor:grab;touch-action:none;'
        + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
      + '<div class="cb-status" style="text-align:center;margin-top:14px;font-weight:800;'
        + 'font-family:inherit;color:#1B3A57;"></div>';

    var stage = el.querySelector('.cb-stage');
    var statusEl = el.querySelector('.cb-status');

    // ---------- three 씬 ----------
    var W = stage.clientWidth || 720, H = stage.clientHeight || 360;
    var scene = new THREE.Scene();
    // 정사영 카메라 (위/앞/옆에서 본 모양 = 정확한 정사영이어야 교육적으로 맞음)
    var frustum = 9;
    var aspect = W / H;
    var camera = new THREE.OrthographicCamera(
      -frustum * aspect / 2, frustum * aspect / 2, frustum / 2, -frustum / 2, 0.1, 100
    );
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8cbe0, 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(6, 12, 8);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024; key.shadow.mapSize.height = 1024;
    key.shadow.camera.near = 1; key.shadow.camera.far = 50;
    key.shadow.camera.left = -12; key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;   key.shadow.camera.bottom = -12;
    key.shadow.bias = -0.0004;
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, 0.25);
    fill.position.set(-6, 5, -5); scene.add(fill);

    // 바닥 (그림자 + 클릭으로 바닥에 쌓기)
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);
    // 옅은 격자 (바닥 위치 감)
    var grid = new THREE.GridHelper(20, 20, 0x9AB7D4, 0xC5D8EC);
    grid.position.y = 0.001;
    scene.add(grid);

    // ---------- 큐브 상태 ----------
    var cubeMat = new THREE.MeshStandardMaterial({ color: CUBE, roughness: 0.55, metalness: 0.02 });
    var shellMat = new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide });
    var boxGeom = new THREE.BoxGeometry(1, 1, 1);
    var shellGeom = boxGeom.clone();
    var cubes = {};          // key "x,y,z" -> mesh
    var cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    function key3(x, y, z) { return x + ',' + y + ',' + z; }

    function addCube(x, y, z) {
      var k = key3(x, y, z);
      if (cubes[k]) return false;
      if (Object.keys(cubes).length >= maxCount) return false;
      var m = new THREE.Mesh(boxGeom, cubeMat);
      m.castShadow = true; m.receiveShadow = true;
      m.position.set(x, y + 0.5, z);   // y=0층 → 중심 0.5
      var shell = new THREE.Mesh(shellGeom, shellMat);
      shell.scale.multiplyScalar(SHELL);
      m.add(shell);
      m.userData.gx = x; m.userData.gy = y; m.userData.gz = z;
      cubeGroup.add(m);
      cubes[k] = m;
      return true;
    }
    function removeCube(mesh) {
      var k = key3(mesh.userData.gx, mesh.userData.gy, mesh.userData.gz);
      if (!cubes[k]) return;
      cubeGroup.remove(mesh);
      delete cubes[k];
    }
    function buildShape(arr) {
      Object.keys(cubes).forEach(function (k) { cubeGroup.remove(cubes[k]); });
      cubes = {};
      arr.forEach(function (c) { addCube(c[0], c[1] || 0, c[2] || 0); });
    }
    buildShape(startShape);

    // ---------- 카메라 궤도 (정사영, 방향만 의미) ----------
    var R = 30;
    var theta = 0.7, phi = 0.95;          // 현재
    var tTheta = theta, tPhi = phi;       // 목표 (lerp)
    function camTo() {
      camera.position.x = R * Math.sin(phi) * Math.sin(theta);
      camera.position.y = R * Math.cos(phi);
      camera.position.z = R * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0.5, 0.8, 0.5);
    }
    camTo();

    var viewMode = 'free';
    function setView(mode) {
      viewMode = mode;
      if (mode === 'top')      { tTheta = 0;            tPhi = 0.02; }
      else if (mode === 'front'){ tTheta = 0;           tPhi = Math.PI / 2; }
      else if (mode === 'side') { tTheta = Math.PI / 2; tPhi = Math.PI / 2; }
      // free: 목표를 현재로 두고 드래그 허용
      else { tTheta = theta; tPhi = phi; }
      el.querySelectorAll('.cb-view').forEach(function (b) {
        b.classList.toggle('cb-on', b.dataset.view === mode);
      });
    }

    // 드래그 (free 모드에서만)
    var drag = false, px = 0, py = 0;
    function down(e) {
      if (viewMode !== 'free') return;
      drag = true; stage.style.cursor = 'grabbing';
      var p = e.touches ? e.touches[0] : e; px = p.clientX; py = p.clientY;
    }
    function move(e) {
      if (!drag) return;
      var p = e.touches ? e.touches[0] : e;
      theta -= (p.clientX - px) * 0.009; phi -= (p.clientY - py) * 0.007;
      phi = Math.max(0.15, Math.min(1.45, phi));
      tTheta = theta; tPhi = phi;
      px = p.clientX; py = p.clientY; camTo();
      if (e.touches) e.preventDefault();
    }
    function up() { drag = false; stage.style.cursor = 'grab'; }
    stage.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', down, { passive: false });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', up);

    // ---------- 클릭으로 쌓기/빼기 (raycast) ----------
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var mode = 'add';
    var downPt = null;

    function pickAt(clientX, clientY) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(cubeGroup.children, false);
      if (hits.length) return { type: 'cube', hit: hits[0] };
      var g = raycaster.intersectObject(ground, false);
      if (g.length) return { type: 'ground', hit: g[0] };
      return null;
    }

    function handleClick(clientX, clientY) {
      if (!editable) return;
      var r = pickAt(clientX, clientY);
      if (!r) return;
      if (mode === 'del') {
        if (r.type === 'cube') { removeCube(r.hit.object); updateStatus(); }
        return;
      }
      // add
      if (r.type === 'cube') {
        var c = r.hit.object.userData;
        var nlocal = r.hit.face.normal;   // 큐브 축정렬 → 로컬=월드
        var nx = Math.round(nlocal.x), ny = Math.round(nlocal.y), nz = Math.round(nlocal.z);
        if (addCube(c.gx + nx, c.gy + ny, c.gz + nz)) updateStatus();
      } else if (r.type === 'ground') {
        var gx = Math.round(r.hit.point.x), gz = Math.round(r.hit.point.z);
        // 그 칸 가장 높은 큐브 위에 (없으면 0층)
        var top = -1;
        for (var yy = 0; yy < 30; yy++) if (cubes[key3(gx, yy, gz)]) top = yy;
        if (addCube(gx, top + 1, gz)) updateStatus();
      }
    }

    // 드래그와 클릭 구분 (회전하려다 큐브가 생기면 안 됨)
    renderer.domElement.addEventListener('pointerdown', function (e) { downPt = { x: e.clientX, y: e.clientY }; });
    renderer.domElement.addEventListener('pointerup', function (e) {
      if (!downPt) return;
      var dx = e.clientX - downPt.x, dy = e.clientY - downPt.y;
      if (dx * dx + dy * dy < 36) handleClick(e.clientX, e.clientY);  // 6px 미만 이동 = 클릭
      downPt = null;
    });

    // ---------- 상태 / 버튼 ----------
    function updateStatus() {
      var n = Object.keys(cubes).length;
      statusEl.innerHTML =
        '<span style="font-size:30px;">쌓기나무 </span>'
        + '<span style="font-size:48px;color:#1565C0;">' + n + '</span>'
        + '<span style="font-size:30px;">개  ＝  부피 </span>'
        + '<span style="font-size:48px;color:#0CA678;">' + n + '</span>'
        + '<span style="font-size:30px;"> 세제곱</span>';
    }

    el.querySelectorAll('.cb-view').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });
    el.querySelectorAll('.cb-mode').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.mode;
        el.querySelectorAll('.cb-mode').forEach(function (x) {
          x.classList.toggle('cb-on', x.dataset.mode === mode);
          // add=파랑 채움, del=흰
          if (x.dataset.mode === 'add') { x.style.background = (mode === 'add') ? '#1565C0' : '#fff'; x.style.color = (mode === 'add') ? '#fff' : '#1565C0'; }
        });
      });
    });
    var resetBtn = el.querySelector('[data-act="reset"]');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      buildShape(startShape); setView('free'); updateStatus();
    });

    updateStatus();

    // ---------- 루프 ----------
    var alive = true;
    function loop() {
      if (!alive) return;
      // 시점 부드럽게 보간
      theta += (tTheta - theta) * 0.18;
      phi   += (tPhi - phi) * 0.18;
      camTo();
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function onResize() {
      var nw = stage.clientWidth || W, nh = stage.clientHeight || H;
      var a = nw / nh;
      camera.left = -frustum * a / 2; camera.right = frustum * a / 2;
      camera.top = frustum / 2; camera.bottom = -frustum / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);

    // ---------- cleanup ----------
    return function cleanup() {
      alive = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  });
})();
