/* ============================================================================
   케이랩 도구 모듈 — 3D 도형 (shape3d) v3 · 3모드
   v2 초점 = 전자칠판 가독성 (준호 1순위 결정 2026-06-04)
     · 굵은 검은 외곽선  : 도형보다 살짝 큰 BackSide 검은 셸 메시 → 카툰 테두리.
                           (three.js LineBasicMaterial.linewidth 는 대부분 1로 고정돼
                            라인으로는 안 굵어짐. 그래서 셸 기법 사용.)
     · 그림자·강한 조명  : 바닥 접지·입체감 또렷, 굴러가는 게 멀리서도 보임.
     · 선명한 색 + 밝은 배경 대비.
     · 큰 버튼·큰 상태 글씨.
     · 도형 이름 라벨    : 각 도형 위 고정 Sprite (굴러가도 제자리).
   거동 로직(굴러감/안 굴러감/눕히기)은 v1 그대로, 보이는 것만 키움.

   - 의존: THREE (전역), window.KLab
   - config 예시 (1학년 2단원):
       { shapes:["box","cylinder","ball"], actions:["roll","flip"], terms:"daily" }
       shapes  : 보여줄 도형 ("box"=상자, "cylinder"=기둥, "ball"=공)
       actions : 허용 동작 ("roll"=굴리기, "flip"=기둥 눕히기/세우기)
       terms   : "daily"=일상어(상자·기둥·공) / "math"=수학용어(직육면체·원기둥·구)
   - 한 모듈로 학년별 분기: 1학년은 daily+roll/flip, 상위 학년은 config만 바꿔 확장.
   - v3: KLab.ui 3모드. THREE 씬은 1회 구축 유지 — 모드 전환은 크롬(탭/바/선택지/컨트롤 표시)만
         갈아끼움. 퀴즈 중 상태 카드(굴러가요/안 굴러가요) 숨김(정답 누설 차단). config.mode 추가.
   ============================================================================ */
(function () {
  if (!window.KLab || !window.THREE) return;

  var LABELS = {
    daily: { box: '상자 모양', cylinder: '기둥 모양', ball: '공 모양' },
    math:  { box: '직육면체', cylinder: '원기둥', ball: '구' }
  };
  // 라벨/외곽선은 짧게(라벨용 별칭)
  var SHORT = {
    daily: { box: '상자', cylinder: '기둥', ball: '공' },
    math:  { box: '직육면체', cylinder: '원기둥', ball: '구' }
  };

  // 선명한 색 (전자칠판에서 또렷한 채도)
  var COLOR   = { box: 0xFF6B35, cylinder: 0x12B886, ball: 0x6C5CE7 };
  var COLORCSS = { box: '#E8590C', cylinder: '#0B8457', ball: '#5145CD' };
  var OUTLINE = 0x37474F;   // 외곽선 (어두운 청회색 — 또렷하되 순검정보다 부드러움)
  var R   = { box: 0.9, cylinder: 0.78, ball: 0.92 };
  var BOX = 1.55;           // 상자 한 변
  var CYL_H = 1.95;         // 기둥 높이
  var SHELL = 1.035;        // 외곽선 셸 배율 (얇게 — 형태 안 헷갈리도록)

  window.KLab.register('shape3d', function (el, config) {
    var ui = window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음

    /* ── 학년 칸 (헌법 3장) — D칸 용어/난이도 사다리 ── */
    var GRADES = {
      low:  { modes: ['free', 'mission'],         quiz: false, missionN: 2, quizN: 0 },
      mid:  { modes: ['free', 'mission', 'quiz'], quiz: true,  missionN: 4, quizN: 3 },
      high: { modes: ['free', 'mission', 'quiz'], quiz: true,  missionN: 4, quizN: 5 }
    };
    var grade = (['low', 'mid', 'high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G() { return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var shapes  = (config.shapes  && config.shapes.length)  ? config.shapes  : ['box', 'cylinder', 'ball'];
    var actions = (config.actions && config.actions.length) ? config.actions : ['roll', 'flip'];
    // 용어: config 우선, 없으면 고학년 잠금일 때만 수학 용어(직육면체·원기둥·구), 그 외 일상어
    var terms   = (config.terms && LABELS[config.terms]) ? config.terms : ((config.grade === 'high') ? 'math' : 'daily');
    var L = LABELS[terms], LS = SHORT[terms];
    var canRollAction = actions.indexOf('roll') >= 0;
    var canFlipAction = actions.indexOf('flip') >= 0;

    var bands = ui.gradeBands({ grade: grade, locked: !!config.grade, onChange: function (g) {
      grade = g;
      if (typeof clearFlash === 'function') clearFlash();
      if (G().modes.indexOf(mode) < 0) mode = 'free';
      mStep = 0; mDone = false; mLock = false;
      mFlags = { rolled: false, laid: false, rolledLying: false, resetDone: false };
      rolling = false; cylUp = true; applyCyl(); drawStatus();
      shapes.forEach(function (k) { var gp = groups[k]; if (gp) { gp.position.x = gp.userData.homeX; gp.rotation.set(0, 0, 0); gp.userData.phase = 0; gp.userData.wobble = -1; } });
      if (mode === 'quiz') shuffleQuiz();
      buildChrome();
    } });

    /* ───────────── 미션 (관찰 행동 4단계) ───────────── */
    var mFlags = { rolled: false, laid: false, rolledLying: false, resetDone: false };
    var MISSIONS = [
      { text: '▶ <b style="color:#7048E8;">굴려보기</b>를 눌러 봐요! 누가 굴러가고 누가 안 굴러갈까요?',
        check: function () { return mFlags.rolled; } },
      { text: '<b style="color:#7048E8;">기둥 눕히기</b>를 눌러 ' + LS.cylinder + '을(를) 눕혀 봐요!',
        check: function () { return mFlags.laid; } },
      { text: '눕힌 채로 다시 ▶ <b style="color:#7048E8;">굴려보기</b> — 이제 ' + LS.cylinder + '도 굴러가요!',
        check: function () { return mFlags.rolledLying; } },
      { text: '↺ <b style="color:#7048E8;">처음으로</b>를 눌러 모두 제자리로 되돌려 봐요!',
        check: function () { return mFlags.resetDone; } }
    ];
    var mStep = 0, mDone = false, mLock = false;
    function curMissions() { return MISSIONS.slice(0, G().missionN); }
    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      var M = curMissions();
      if (M[mStep].check()) {
        mLock = true; ui.toast(el, true);
        setTimeout(function () {
          mLock = false; mStep++;
          if (mStep >= M.length) mDone = true;
          buildChrome();
        }, 1500);
      }
    }

    /* ───────────── 퀴즈 (모양과 굴러감 — 개념) ───────────── */
    var QUIZ_POOL = [
      { q: '셋 중에서 어느 쪽으로든 잘 굴러가는 모양은?', answer: LS.ball, choices: [LS.ball, LS.box, LS.cylinder] },
      { q: '잘 굴러가지 않고, 대신 잘 쌓을 수 있는 모양은?', answer: LS.box, choices: [LS.box, LS.ball, LS.cylinder] },
      { q: LS.cylinder + ' 모양을 눕히면 어떻게 될까요?', answer: '잘 굴러가요', choices: ['잘 굴러가요', '안 굴러가요', '공이 돼요'] },
      { q: LS.box + ' 모양이 잘 굴러가지 않는 까닭은?', answer: '평평한 면이 있어서', choices: ['평평한 면이 있어서', '너무 작아서', '색깔 때문에'] },
      { q: '축구공처럼 어디로든 굴러가야 하는 물건은 어떤 모양이 좋을까요?', answer: LS.ball, choices: [LS.ball, LS.box, LS.cylinder] }
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function quizPool() { return QUIZ_POOL.slice(0, G().quizN || QUIZ_POOL.length); }
    function shuffleQuiz() {
      qList = quizPool().slice();
      for (var i = qList.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = qList[i]; qList[i] = qList[j]; qList[j] = t; }
      qIdx = 0; qScore = 0; qCount = 0;
    }
    function shuffled(arr) { var c = arr.slice(); for (var i = c.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = c[i]; c[i] = c[j]; c[j] = t; } return c; }

    // ---------- UI 골격 (큰 버튼·큰 글씨) — 씬은 1회 구축, 크롬만 모드별 갱신 ----------
    var btnBase = 'font-size:28px;padding:16px 34px;border-radius:16px;border:3px solid #1565C0;'
                + 'cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    el.innerHTML =
      '<div class="s3d-top"></div>'
      + '<div class="s3d-bars"></div>'
      + '<div class="s3d-controls" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
        + (canRollAction ? '<button class="s3d-btn" data-act="roll" style="' + btnBase + 'background:#1565C0;color:#fff;">▶ 굴려보기</button>' : '')
        + (canFlipAction ? '<button class="s3d-btn" data-act="flip" style="' + btnBase + 'background:#fff;color:#1565C0;">기둥 눕히기</button>' : '')
        + '<button class="s3d-btn" data-act="reset" style="font-size:28px;padding:16px 34px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#555;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 처음으로</button>'
      + '</div>'
      + '<div class="kl-stage-host" style="position:relative;">'
      + '<div class="s3d-stage" style="width:100%;height:50vh;min-height:340px;'
        + 'background:linear-gradient(180deg,#F4F9FF 0%,#DCEBFB 100%);'
        + 'border-radius:20px;overflow:hidden;cursor:grab;touch-action:none;'
        + 'box-shadow:inset 0 0 0 3px rgba(21,101,192,0.12);"></div>'
      + '</div>'
      + '<div class="s3d-foot"></div>'
      + '<div class="s3d-status" style="display:flex;gap:12px;justify-content:center;margin-top:14px;flex-wrap:wrap;"></div>'
      + '<style>'
        + '.s3d-flash{animation:s3dFlashKf 2.6s ease both;}'   /* 와우 ④ 마법모먼트 배너 */
        + '@keyframes s3dFlashKf{0%{opacity:0;transform:translateX(-50%) translateY(-8px);}10%{opacity:1;transform:translateX(-50%) translateY(0);}85%{opacity:1;transform:translateX(-50%) translateY(0);}100%{opacity:0;transform:translateX(-50%) translateY(0);}}'
        + '.s3d-hold{display:inline-block;animation:s3dHoldKf 1.1s ease both;transform-origin:center;}'   /* 와우 ④ 기둥 상태 펄스 */
        + '@keyframes s3dHoldKf{0%{transform:scale(1);}25%{transform:scale(1.18);color:#7048E8;}55%{transform:scale(.94);}100%{transform:scale(1);}}'
      + '</style>';

    function buildChrome() {
      var topEl = el.querySelector('.s3d-top'), barEl = el.querySelector('.s3d-bars'), footEl = el.querySelector('.s3d-foot');
      topEl.innerHTML = bands.selectorHTML() + ui.modeTabs(G().modes, mode);
      if (mode === 'mission') { var M = curMissions(); barEl.innerHTML = mDone ? ui.doneBar() : ui.missionBar(M[mStep].text, mStep, M.length); }
      else if (mode === 'quiz') barEl.innerHTML = ui.quizBar(qList[qIdx].q, qScore, qCount);
      else barEl.innerHTML = '';
      var quiz = (mode === 'quiz');
      el.querySelector('.s3d-controls').style.display = quiz ? 'none' : 'flex';
      el.querySelector('.s3d-status').style.display = quiz ? 'none' : 'flex';
      footEl.innerHTML = quiz
        ? ui.choices(shuffled(qList[qIdx].choices).map(function (v) { return { v: v, label: v }; }))
          + '<style>.kl-choice{min-width:130px !important;}</style>'
        : '';
      ui.bindModeTabs(el, function (m2) {
        clearFlash();
        mode = m2; mStep = 0; mDone = false; mLock = false;
        mFlags = { rolled: false, laid: false, rolledLying: false, resetDone: false };
        rolling = false; cylUp = true; applyCyl(); drawStatus();
        shapes.forEach(function (k) { var g = groups[k]; if (g) { g.position.x = g.userData.homeX; g.rotation.set(0, 0, 0); g.userData.phase = 0; g.userData.wobble = -1; } });
        if (m2 === 'quiz') shuffleQuiz();
        buildChrome();
      });
      footEl.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (qLock) return; qLock = true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function () {
            qIdx++; if (qIdx >= qList.length) shuffleQuiz();
            qLock = false; buildChrome();
          }, 1400);
        });
      });
      bands.bind(el);
    }

    var stage  = el.querySelector('.s3d-stage');
    var statusRow = el.querySelector('.s3d-status');
    var stageHost = el.querySelector('.kl-stage-host');

    // 와우 ④ 마법모먼트 배너 (1회성 — 오개념 방향: 둥근데 안 굴러감 / 해소: 눕히니 굴러감)
    function clearFlash(){ var f = stageHost.querySelector('.s3d-flash'); if (f && f.parentNode) f.parentNode.removeChild(f); }
    function flashMagic(kind){
      clearFlash();
      var stop = (kind === 'stop');
      var div = document.createElement('div');
      div.className = 's3d-flash';
      div.style.cssText = 'position:absolute;left:50%;top:14px;transform:translateX(-50%);'
        + 'max-width:92%;z-index:5;pointer-events:none;text-align:center;'
        + 'background:' + (stop ? '#7048E8' : '#12B886') + ';color:#fff;'
        + 'font-weight:800;font-size:19px;line-height:1.45;'
        + 'padding:13px 20px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,0.18);';
      div.innerHTML = stop
        ? LS.cylinder + '은 둥근데 세우니까 <b>안 굴러가요!</b> 🤔<br>바닥에 닿은 면이 평평해서예요 — 둥글다고 다 굴러가는 건 아니에요'
        : '이번엔 눕혔더니 <b>데구르르!</b> ✨<br>닿는 면이 둥그니까 굴러가요';
      stageHost.appendChild(div);
      setTimeout(function(){ if (div && div.parentNode) div.parentNode.removeChild(div); }, 2600);
    }

    // ---------- three 씬 ----------
    var W = stage.clientWidth || 720, H = stage.clientHeight || 360;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    // 조명 — 부드러운 환경광 + 입체감 주는 메인광(그림자)
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8cbe0, 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(5, 10, 7);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -10; key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;   key.shadow.camera.bottom = -10;
    key.shadow.bias = -0.0004;
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, 0.25);
    fill.position.set(-6, 4, -4); scene.add(fill);

    // 바닥 (그림자 받는 면)
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    var groups = {};
    var n = shapes.length;
    var spread = 3.6;

    // 외곽선 셸 만들기 (본체와 같은 형태, 살짝 크게, 검은 BackSide)
    function shellOf(geom) {
      var m = new THREE.Mesh(geom.clone(), new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide }));
      m.scale.multiplyScalar(SHELL);
      return m;
    }

    // 도형 위 이름 라벨 (Sprite, scene 고정)
    function makeLabel(text, css) {
      var c = document.createElement('canvas');
      c.width = 320; c.height = 160;
      var ctx = c.getContext('2d');
      // 둥근 흰 배경
      var x = 10, y = 30, w = 300, h = 100, r = 26;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.strokeStyle = css; ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.font = '800 70px "Gowun Dodum", "Apple SD Gothic Neo", sans-serif';
      ctx.fillStyle = css;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 160, 82);
      var tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      sp.scale.set(2.2, 1.1, 1);
      sp.renderOrder = 999;
      return sp;
    }

    shapes.forEach(function (kind, i) {
      var x = (i - (n - 1) / 2) * spread;
      var mat = new THREE.MeshStandardMaterial({ color: COLOR[kind] || 0x888888, roughness: 0.42, metalness: 0.02 });
      var geom, mesh, y;
      if (kind === 'ball') {
        geom = new THREE.SphereGeometry(R.ball, 40, 28); y = R.ball;
      } else if (kind === 'cylinder') {
        geom = new THREE.CylinderGeometry(R.cylinder, R.cylinder, CYL_H, 44); y = CYL_H / 2;
      } else {
        geom = new THREE.BoxGeometry(BOX, BOX, BOX); y = BOX / 2;
      }
      mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.add(shellOf(geom));   // 외곽선 셸을 자식으로 → 같이 회전

      var g = new THREE.Group();
      g.position.set(x, y, 0);
      g.add(mesh);
      scene.add(g);
      g.userData = { homeX: x, homeY: y, kind: kind, phase: 0, wobble: -1, mesh: mesh, baseY: y };
      groups[kind] = g;

      // 라벨 (도형 home 위 고정)
      var topY = (kind === 'cylinder') ? CYL_H + 0.9 : (kind === 'ball' ? R.ball * 2 + 0.7 : BOX + 0.7);
      var label = makeLabel(LS[kind], COLORCSS[kind]);
      label.position.set(x, topY, 0);
      scene.add(label);
      g.userData.label = label;
      g.userData.labelTopBall = R.ball * 2 + 0.7;   // 기준값(공)
    });

    var cylUp = true;

    // ---------- 카메라 궤도(드래그) ----------
    var theta = 0.62, phi = 1.02, radius = Math.max(9.5, n * 3.5);
    function cam() {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0.7, 0);
    }
    cam();
    var drag = false, px = 0, py = 0;
    function down(e) { drag = true; stage.style.cursor = 'grabbing'; var p = e.touches ? e.touches[0] : e; px = p.clientX; py = p.clientY; }
    function move(e) {
      if (!drag) return; var p = e.touches ? e.touches[0] : e;
      theta -= (p.clientX - px) * 0.008; phi -= (p.clientY - py) * 0.006;
      phi = Math.max(0.4, Math.min(1.4, phi)); px = p.clientX; py = p.clientY; cam();
      if (e.touches) e.preventDefault();
    }
    function up() { drag = false; stage.style.cursor = 'grab'; }
    stage.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', down, { passive: false });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', up);

    // ---------- 상태/동작 ----------
    var rolling = false;
    function canRoll(kind) {
      if (kind === 'ball') return true;
      if (kind === 'box') return false;
      if (kind === 'cylinder') return !cylUp;
      return false;
    }
    function statusText(kind) {
      if (kind === 'ball') return L.ball + ' — 어느 쪽으로든 잘 굴러가요';
      if (kind === 'box') return L.box + ' — 안 굴러가요, 대신 잘 쌓여요';
      if (kind === 'cylinder') return L.cylinder + (cylUp ? ' — 세우면 안 굴러가요' : ' — 눕히면 잘 굴러가요');
      return '';
    }
    function drawStatus(holdCyl) {
      statusRow.innerHTML = shapes.map(function (k) {
        var t = statusText(k);
        if (holdCyl && k === 'cylinder') t = '<span class="s3d-hold">' + t + '</span>';
        return '<div style="font-size:21px;font-weight:800;color:' + COLORCSS[k]
          + ';background:#fff;border-radius:14px;padding:11px 18px;border:2px solid '
          + COLORCSS[k] + '33;">' + t + '</div>';
      }).join('');
      var flipBtn = el.querySelector('[data-act="flip"]');
      if (flipBtn) flipBtn.textContent = cylUp ? '기둥 눕히기' : '기둥 세우기';
    }

    function applyCyl() {
      var g = groups.cylinder; if (!g) return;
      if (cylUp) { g.userData.mesh.rotation.set(0, 0, 0); g.userData.homeY = CYL_H / 2; g.userData.baseY = CYL_H / 2; }
      else { g.userData.mesh.rotation.set(Math.PI / 2, 0, 0); g.userData.homeY = R.cylinder; g.userData.baseY = R.cylinder; }
      g.position.y = g.userData.homeY;
      // 라벨도 따라 내림/올림
      if (g.userData.label) g.userData.label.position.y = (cylUp ? CYL_H + 0.9 : R.cylinder * 2 + 0.7);
    }
    applyCyl(); drawStatus();

    el.querySelectorAll('.s3d-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.dataset.act;
        if (act === 'roll') {
          rolling = true;
          mFlags.rolled = true; if (!cylUp) mFlags.rolledLying = true;
          shapes.forEach(function (k) { groups[k].userData.phase = 0; groups[k].userData.wobble = canRoll(k) ? -1 : 0; });
          // 와우 ②③④ — 효과음 + 마법모먼트
          var cyl = groups.cylinder;
          var magic = !!cyl && cylUp;                 // 둥근데 세워서 안 굴러가는 순간 = "둥글면 다 구른다" 반증
          var anyRoll = shapes.some(function (k) { return canRoll(k); });
          if (magic) {
            snd('rumble');                            // 쿵(thud) — 예상이 깨짐
            flashMagic('stop'); drawStatus(true);     // 보라 배너 + 기둥 상태 펄스
          } else {
            if (anyRoll) snd('whoosh');               // 데구르르(swish)
            if (cyl && !cylUp) { snd('success'); flashMagic('roll'); }  // 눕히니 굴러가는 해소(초록)
            if (!anyRoll) snd('rumble');              // 전부 평평(예: 상자만) — 쿵, 배너 없음
          }
        } else if (act === 'flip') {
          clearFlash();
          cylUp = !cylUp; applyCyl(); drawStatus();
          snd('select');                              // 눕히기/세우기 — 조작음
          if (!cylUp) mFlags.laid = true;
          var g = groups.cylinder; if (g) { g.rotation.z = 0; g.userData.phase = 0; g.userData.wobble = (rolling && !canRoll('cylinder')) ? 0 : -1; }
        } else if (act === 'reset') {
          clearFlash();
          rolling = false; cylUp = true; applyCyl(); drawStatus();
          snd('tap');
          if (mode === 'mission' && mStep === 3) mFlags.resetDone = true;   // 마지막 단계에서만 인정
          shapes.forEach(function (k) { var g = groups[k]; g.position.x = g.userData.homeX; g.rotation.set(0, 0, 0); g.userData.phase = 0; g.userData.wobble = -1; });
        }
        if (mode === 'mission') checkMission();
      });
    });

    shuffleQuiz();
    buildChrome();

    // ---------- 루프 ----------
    var alive = true, last = performance.now();
    function loop(now) {
      if (!alive) return;
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (rolling) {
        shapes.forEach(function (k) {
          var g = groups[k], r = R[k];
          if (canRoll(k)) {
            g.userData.phase += dt * 1.1;
            var x = g.userData.homeX + Math.sin(g.userData.phase) * 1.3;
            g.position.x = x; g.rotation.z = (g.userData.homeX - x) / r;
          } else if (g.userData.wobble >= 0) {
            g.userData.wobble += dt; var w = g.userData.wobble;
            g.rotation.z = Math.sin(w * 10) * 0.13 * Math.max(0, 1 - w * 0.8);
            if (w > 1.6) { g.rotation.z = 0; g.userData.wobble = -1; }
          }
        });
      }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function onResize() {
      var nw = stage.clientWidth || W, nh = stage.clientHeight || H;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);

    // 슬라이드 떠날 때 정리 (엔진이 호출)
    return function cleanup() {
      alive = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  });
})();
