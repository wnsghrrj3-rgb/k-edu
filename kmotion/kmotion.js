/* 케이모션(KMotion) 공통 엔진 v0.1
 * 카메라 → 거울 캔버스 → 세 가지 눈
 *   motion : 직전 장면과 픽셀 차이(라이브러리 없음, 가장 가벼움)
 *   hands  : MediaPipe HandLandmarker (손 관절 21개, 최대 2손)
 *   pose   : MediaPipe PoseLandmarker (몸 관절 33개, 1명)
 * 영상은 기기 안에서만 처리되고 어디에도 보내지 않는다.
 *
 * 사용:
 *   const km = KMotion.create({ video, canvas, modes:['pose'] });
 *   await km.start();            // 카메라 허용 + 모델 준비
 *   km.onFrame = (f) => { ... } // f.ctx f.W f.H f.motion f.hands f.pose f.t
 *   km.stop();
 * 좌표는 전부 캔버스(거울) 픽셀 기준. 랜드마크 {x,y,z,v}
 */
(function(){
  const VENDOR = new URL('./vendor/tasks-vision/', document.currentScript ? document.currentScript.src : location.href).href;
  const MODELS = {
    hands: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    pose : 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
  };
  let visionMod = null;
  async function vision(){ if(!visionMod) visionMod = await import(VENDOR + 'vision_bundle.mjs'); return visionMod; }

  // 포즈 관절 번호(MediaPipe 33)
  const POSE = { nose:0, lEye:2, rEye:5, lEar:7, rEar:8, lShoulder:11, rShoulder:12, lElbow:13, rElbow:14, lWrist:15, rWrist:16,
    lHip:23, rHip:24, lKnee:25, rKnee:26, lAnkle:27, rAnkle:28 };
  const POSE_BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
  // 손 관절 번호(21)
  const HAND = { wrist:0, thumbTip:4, indexTip:8, middleTip:12, ringTip:16, pinkyTip:20, indexBase:5, middleBase:9 };
  const HAND_BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

  function create(opt){
    const video = opt.video, canvas = opt.canvas;
    const W = canvas.width || 640, H = canvas.height || 480;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    const modes = new Set(opt.modes || ['motion']);
    const S = opt.motionCell || 8; // 모션 격자 한 칸(px)

    const km = { W, H, ctx, video, canvas, modes, onFrame: null, onStatus: null, running: false, POSE, HAND, POSE_BONES, HAND_BONES };

    // ── 모션(픽셀 차이)
    const off = document.createElement('canvas'); off.width = W / S | 0; off.height = H / S | 0;
    const octx = off.getContext('2d', { willReadFrequently: true });
    let prev = null; const grid = new Uint8Array(off.width * off.height);
    const motion = {
      grid, gw: off.width, gh: off.height, cell: S,
      /** 거울 좌표 (x,y) 반지름 r 안에서 움직인 칸의 비율 0~1 */
      at(x, y, r){
        let hit = 0, tot = 0; const gx = (W - x) / S, gy = y / S, gr = Math.max(1, r / S);
        const y0 = Math.max(0, gy - gr | 0), y1 = Math.min(off.height, gy + gr), x0 = Math.max(0, gx - gr | 0), x1 = Math.min(off.width, gx + gr);
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { tot++; if (grid[yy * off.width + xx]) hit++; }
        return tot ? hit / tot : 0;
      },
      /** 화면 전체 움직임 비율 */
      total(){ let h = 0; for (let i = 0; i < grid.length; i++) h += grid[i]; return h / grid.length; }
    };
    function stepMotion(){
      octx.drawImage(video, 0, 0, off.width, off.height);
      const d = octx.getImageData(0, 0, off.width, off.height).data, n = grid.length;
      if (prev) for (let i = 0, j = 0; i < n; i++, j += 4) {
        const diff = Math.abs(d[j] - prev[j]) + Math.abs(d[j+1] - prev[j+1]) + Math.abs(d[j+2] - prev[j+2]);
        grid[i] = diff > 90 ? 1 : 0;
      }
      prev = new Uint8ClampedArray(d);
    }

    // ── MediaPipe
    let handLm = null, poseLm = null;
    function toPx(lm){ return lm.map(p => ({ x: (1 - p.x) * W, y: p.y * H, z: p.z, v: p.visibility == null ? 1 : p.visibility })); }
    async function loadModels(){
      if (!modes.has('hands') && !modes.has('pose')) return;
      status('인식 모델 준비 중…');
      const v = await vision();
      const files = await v.FilesetResolver.forVisionTasks(VENDOR + 'wasm');
      const base = (path) => ({ baseOptions: { modelAssetPath: path, delegate: 'GPU' }, runningMode: 'VIDEO' });
      if (modes.has('hands')) handLm = await v.HandLandmarker.createFromOptions(files, Object.assign(base(MODELS.hands), { numHands: opt.numHands || 2 }));
      if (modes.has('pose'))  poseLm = await v.PoseLandmarker.createFromOptions(files, Object.assign(base(MODELS.pose), { numPoses: 1 }));
    }
    function status(s){ if (km.onStatus) km.onStatus(s); }

    // ── 그리기 도우미
    km.drawSkeleton = function(lm, bones, color, r){
      if (!lm) return; ctx.strokeStyle = color || 'rgba(77,225,255,.9)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const [a, b] of bones) { if (lm[a].v < .4 || lm[b].v < .4) continue; ctx.beginPath(); ctx.moveTo(lm[a].x, lm[a].y); ctx.lineTo(lm[b].x, lm[b].y); ctx.stroke(); }
      ctx.fillStyle = '#fff';
      for (const p of lm) { if (p.v < .4) continue; ctx.beginPath(); ctx.arc(p.x, p.y, r || 5, 0, Math.PI * 2); ctx.fill(); }
    };
    km.drawCamera = function(){ ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0, W, H); ctx.restore(); };
    /** 손이 쥐어졌나 — 손끝이 손바닥 가운데에 가까우면 */
    km.isFist = function(h){ if (!h) return false; const c = h[HAND.middleBase], w = h[HAND.wrist];
      const span = Math.hypot(c.x - w.x, c.y - w.y) || 1; let near = 0;
      for (const t of [8, 12, 16, 20]) if (Math.hypot(h[t].x - c.x, h[t].y - c.y) < span * 0.9) near++; return near >= 3; };
    /** 펴진 손가락 개수(엄지 제외) */
    km.fingersUp = function(h){ if (!h) return 0; const w = h[HAND.wrist]; let n = 0;
      for (const [tip, pip] of [[8,6],[12,10],[16,14],[20,18]]) if (Math.hypot(h[tip].x - w.x, h[tip].y - w.y) > Math.hypot(h[pip].x - w.x, h[pip].y - w.y)) n++; return n; };

    // ── 루프
    let raf = 0, lastVideoTime = -1;
    function loop(){
      if (!km.running) return;
      const t = performance.now();
      const f = { ctx, W, H, t, motion: null, hands: [], pose: null, dt: 0 };
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        if (modes.has('motion')) { stepMotion(); f.motion = motion; }
        if (handLm) { const r = handLm.detectForVideo(video, t); f.hands = (r.landmarks || []).map(toPx); f.handedness = r.handednesses; }
        if (poseLm) { const r = poseLm.detectForVideo(video, t); f.pose = r.landmarks && r.landmarks[0] ? toPx(r.landmarks[0]) : null; }
      } else { if (modes.has('motion')) f.motion = motion; }
      if (km.onFrame) km.onFrame(f);
      raf = requestAnimationFrame(loop);
    }

    km.start = async function(){
      status('카메라 여는 중…');
      try {
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: W, height: H, facingMode: 'user' }, audio: false });
        await video.play();
      } catch (e) {
        const err = new Error(e && e.name === 'NotAllowedError' ? '카메라 사용이 허용되지 않았어요. 주소창 왼쪽 자물쇠에서 카메라를 「허용」으로 바꿔 주세요.'
          : e && e.name === 'NotFoundError' ? '이 기기에서 카메라를 찾지 못했어요.' : '카메라를 열 수 없어요. (' + (e && e.name || e) + ')');
        err.cause = e; throw err;
      }
      await loadModels();
      status('');
      km.running = true; lastVideoTime = -1; raf = requestAnimationFrame(loop);
    };
    km.stop = function(){ km.running = false; cancelAnimationFrame(raf); if (video.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; } };
    return km;
  }
  window.KMotion = { create, POSE, HAND, POSE_BONES, HAND_BONES };
})();
