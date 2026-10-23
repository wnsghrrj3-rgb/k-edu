/* 케이모션(KMotion) 공통 엔진 v0.2
 * 카메라 → 거울 캔버스 → 세 가지 눈 → 행동 층 → 이벤트
 *   motion : 직전 장면과 픽셀 차이(라이브러리 없음)
 *   hands  : MediaPipe HandLandmarker (손 관절 21개, 최대 2손)
 *   pose   : MediaPipe PoseLandmarker (몸 관절 33개, 1명)
 * 행동 층(규칙 기반, ACTION_VERSION):
 *   hand:open / hand:fist / hand:pinch / hand:point / hand:other   — 손 모양이 바뀔 때
 *   hand:grab / hand:release                                       — 집기 시작·놓기(pinch 또는 fist)
 *   hand:move(50ms) / hand:wave / hand:swipe(dir)
 *   body:found / body:lost / body:jump(height) / body:land(airMs) / body:squat / body:stand / body:arms_up / body:arms_down
 *   session:start / session:stop / frame / error
 * 영상은 기기 안에서만 처리되고 어디에도 보내지 않는다. 기록(kmotion-data.js)은 관절 좌표·행동 이벤트만.
 *
 * 사용:
 *   const km = KMotion.create({ video, canvas, modes:['pose'], activity:'jump' });
 *   km.on('body:jump', e => ...);   // e = {type, t, hand?, side?, pos?, score, source:'rule', session, engine, action, model}
 *   km.onFrame = f => ...            // f.ctx f.W f.H f.t f.fresh f.motion f.hands f.pose f.actions
 *   await km.start(); km.stop();
 * 좌표는 전부 캔버스(거울) 픽셀. 랜드마크 {x,y,z,v}. score = 자체 판정 점수(모델 신뢰도와 다름).
 */
(function(){
  const ENGINE_VERSION = '0.2.1';
  const ACTION_VERSION = 'rule-0.2.1';
  const MODEL_VERSION  = { hands: 'hand_landmarker/float16/1', pose: 'pose_landmarker_lite/float16/1', vision: 'tasks-vision@0.10.21' };
  const VENDOR = new URL('./vendor/tasks-vision/', document.currentScript ? document.currentScript.src : location.href).href;
  const MODELS = {
    hands: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    pose : 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
  };
  let visionMod = null;
  async function vision(){ if(!visionMod) visionMod = await import(VENDOR + 'vision_bundle.mjs'); return visionMod; }

  const POSE = { nose:0, lEye:2, rEye:5, lEar:7, rEar:8, lShoulder:11, rShoulder:12, lElbow:13, rElbow:14, lWrist:15, rWrist:16,
    lHip:23, rHip:24, lKnee:25, rKnee:26, lAnkle:27, rAnkle:28 };
  const POSE_BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
  const HAND = { wrist:0, thumbTip:4, indexTip:8, middleTip:12, ringTip:16, pinkyTip:20, indexBase:5, middleBase:9 };
  const HAND_BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const mid  = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  function angle(a, b, c){ const v1 = { x: a.x - b.x, y: a.y - b.y }, v2 = { x: c.x - b.x, y: c.y - b.y };
    const d = (v1.x * v2.x + v1.y * v2.y) / ((Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)) || 1); return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI; }

  function create(opt){
    const video = opt.video, canvas = opt.canvas;
    const W = canvas.width || 640, H = canvas.height || 480;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const modes = new Set(opt.modes || ['motion']);
    const S = opt.motionCell || 8;
    const sessionId = opt.sessionId || ('s' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));

    const km = { W, H, ctx, video, canvas, modes, sessionId, onFrame: null, onStatus: null, running: false, fps: 0,
      POSE, HAND, POSE_BONES, HAND_BONES, ENGINE_VERSION, ACTION_VERSION, MODEL_VERSION,
      activity: opt.activity || (location.pathname.split('/').pop() || 'index').replace('.html', '') };

    // ── 이벤트 버스
    const subs = {};
    km.on = (type, fn) => { (subs[type] = subs[type] || []).push(fn); return km; };
    km.off = (type, fn) => { subs[type] = (subs[type] || []).filter(f => f !== fn); return km; };
    km.emit = (type, data) => {
      const e = Object.assign({ type, t: performance.now(), score: 1, source: 'rule', session: sessionId, engine: ENGINE_VERSION, action: ACTION_VERSION,
        model: type.startsWith('hand') ? MODEL_VERSION.hands : type.startsWith('body') ? MODEL_VERSION.pose : null }, data || {});
      (subs[type] || []).forEach(f => f(e)); (subs['*'] || []).forEach(f => f(e)); return e;
    };

    // ── 모션(픽셀 차이)
    const off = document.createElement('canvas'); off.width = W / S | 0; off.height = H / S | 0;
    const octx = off.getContext('2d', { willReadFrequently: true });
    let prev = null; const grid = new Uint8Array(off.width * off.height);
    const motion = { grid, gw: off.width, gh: off.height, cell: S,
      at(x, y, r){ let hit = 0, tot = 0; const gx = (W - x) / S, gy = y / S, gr = Math.max(1, r / S);
        const y0 = Math.max(0, gy - gr | 0), y1 = Math.min(off.height, gy + gr), x0 = Math.max(0, gx - gr | 0), x1 = Math.min(off.width, gx + gr);
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { tot++; if (grid[yy * off.width + xx]) hit++; } return tot ? hit / tot : 0; },
      total(){ let h = 0; for (let i = 0; i < grid.length; i++) h += grid[i]; return h / grid.length; } };
    function stepMotion(){ octx.drawImage(video, 0, 0, off.width, off.height);
      const d = octx.getImageData(0, 0, off.width, off.height).data, n = grid.length;
      if (prev) for (let i = 0, j = 0; i < n; i++, j += 4) grid[i] = (Math.abs(d[j] - prev[j]) + Math.abs(d[j+1] - prev[j+1]) + Math.abs(d[j+2] - prev[j+2])) > 90 ? 1 : 0;
      prev = new Uint8ClampedArray(d); }

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
    km.drawSkeleton = function(lm, bones, color, r){ if (!lm) return; ctx.strokeStyle = color || 'rgba(77,225,255,.9)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const [a, b] of bones) { if (lm[a].v < .4 || lm[b].v < .4) continue; ctx.beginPath(); ctx.moveTo(lm[a].x, lm[a].y); ctx.lineTo(lm[b].x, lm[b].y); ctx.stroke(); }
      ctx.fillStyle = '#fff'; for (const p of lm) { if (p.v < .4) continue; ctx.beginPath(); ctx.arc(p.x, p.y, r || 5, 0, Math.PI * 2); ctx.fill(); } };
    km.drawCamera = function(){ ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0, W, H); ctx.restore(); };

    // ── 손 특징(규칙 층 재료)
    km.handFeatures = function(h){
      const w = h[0], c = h[9], span = dist(c, w) || 1;
      const tips = [8, 12, 16, 20], pips = [6, 10, 14, 18];
      const ext = tips.map((t, i) => dist(h[t], w) > dist(h[pips[i]], w) * 1.05);
      const thumbExt = dist(h[4], h[17]) > dist(h[3], h[17]) * 1.1 && dist(h[4], h[5]) > span * 0.45; // 엄지 끝이 새끼손가락 쪽에서 멀고 검지 밑동에서도 떨어짐
      const curl = tips.reduce((s, t) => s + dist(h[t], c), 0) / (4 * span);   // 작을수록 쥠
      const pinch = dist(h[4], h[8]) / span;                                   // 엄지-검지 거리(손 크기 비)
      return { span, ext, thumbExt, fingersUp: ext.filter(Boolean).length + (thumbExt ? 1 : 0), curl, pinch, center: c, wrist: w };
    };
    km.isFist = h => !!h && km.handFeatures(h).curl < 0.55;
    km.fingersUp = h => h ? km.handFeatures(h).fingersUp : 0;

    // ── 행동 층 상태
    const HOLD = 3; // 연속 프레임 확인(히스테리시스)
    const handState = [0, 1].map(() => ({ pose: 'none', cand: 'none', n: 0, pinched: false, hist: [], lastMoveEmit: 0, waved: false, swiped: false }));
    const body = { seen: false, base: null, air: false, airT: 0, squat: false, squatN: 0, armsUp: false, armsN: 0 };
    function labelHand(f){
      if (f.pinch < 0.25 && f.ext[1] && f.ext[2]) return 'pinch';
      if (f.curl < 0.55) return 'fist';
      if (f.ext[0] && !f.ext[1] && !f.ext[2] && !f.ext[3]) return 'point';
      if (f.fingersUp >= 4) return 'open';
      return 'other';
    }
    function stepHands(frame){
      const acts = [];
      for (let i = 0; i < 2; i++) {
        const h = frame.hands[i], st = handState[i];
        if (!h) { if (st.pose !== 'none') { if (st.pinched) { km.emit('hand:release', { hand: i, reason: 'lost', score: .5 }); st.pinched = false; } st.pose = 'none'; st.cand = 'none'; st.n = 0; st.hist = []; } continue; }
        const f = km.handFeatures(h);
        const hd = frame.handedness && frame.handedness[i] && frame.handedness[i][0];
        const side = hd ? (hd.categoryName === 'Left' ? 'left' : 'right') : null; // 모델 라벨이 거울 기준이라 그대로(실기기 10-23 확인)
        const lab = labelHand(f), now = frame.t;
        if (lab === st.cand) st.n++; else { st.cand = lab; st.n = 1; }
        if (st.n >= HOLD && lab !== st.pose) {
          st.pose = lab;
          const score = lab === 'pinch' ? Math.min(1, (0.25 - f.pinch) / 0.15 + .6) : lab === 'fist' ? Math.min(1, (0.55 - f.curl) / 0.3 + .6) : .8;
          if (lab === 'pinch' || lab === 'fist') { if (!st.pinched) { st.pinched = true; km.emit('hand:grab', { hand: i, side, pos: f.center, score, via: lab }); } }
          else if (st.pinched) { st.pinched = false; km.emit('hand:release', { hand: i, side, pos: f.center, score }); }
          km.emit('hand:' + lab, { hand: i, side, pos: f.center, score, fingersUp: f.fingersUp });
        }
        st.hist.push({ x: f.center.x, y: f.center.y, t: now }); while (st.hist.length && now - st.hist[0].t > 600) st.hist.shift();
        if (now - st.lastMoveEmit > 50) { st.lastMoveEmit = now; km.emit('hand:move', { hand: i, side, pos: f.center, pinched: st.pinched, pose: st.pose }); }
        if (st.hist.length > 8) {
          const xs = st.hist.map(p => p.x), dx = xs[xs.length - 1] - xs[0];
          let turns = 0; for (let k = 2; k < xs.length; k++) if ((xs[k] - xs[k-1]) * (xs[k-1] - xs[k-2]) < 0 && Math.abs(xs[k] - xs[k-1]) > 4) turns++;
          const range = Math.max(...xs) - Math.min(...xs);
          if (turns >= 4 && range > f.span * 1.5 && st.pose === 'open' && !st.waved) { st.waved = true; km.emit('hand:wave', { hand: i, side, pos: f.center, score: Math.min(1, turns / 6) }); setTimeout(() => st.waved = false, 900); }
          if (Math.abs(dx) > f.span * 3 && turns <= 1 && !st.swiped) { st.swiped = true; km.emit('hand:swipe', { hand: i, side, pos: f.center, dir: dx > 0 ? 'right' : 'left', score: Math.min(1, Math.abs(dx) / (f.span * 5)) }); setTimeout(() => st.swiped = false, 700); }
        }
        acts.push({ hand: i, side, pose: st.pose, pinched: st.pinched, fingersUp: f.fingersUp, pinch: +f.pinch.toFixed(3), curl: +f.curl.toFixed(3) });
      }
      return acts;
    }
    function stepBody(frame){
      const p = frame.pose;
      if (!p) { if (body.seen) { body.seen = false; km.emit('body:lost'); } return null; }
      const hip = mid(p[23], p[24]), sh = mid(p[11], p[12]), torso = dist(hip, sh) || 1;
      const vis = Math.min(p[23].v, p[24].v, p[11].v, p[12].v), feet = Math.min(p[27].v, p[28].v);
      if (vis < .5) { if (body.seen) { body.seen = false; km.emit('body:lost'); } return { vis, feet, ok: false }; }
      if (!body.seen) { body.seen = true; body.base = hip.y; km.emit('body:found'); }
      // 점프: 엉덩이 중심 y, 서 있을 때 기준 완충, 몸통 길이 1/4 이상 오르면 공중
      if (!body.air) { body.base = body.base * 0.85 + hip.y * 0.15;
        if (hip.y < body.base - torso * 0.25) { body.air = true; body.airT = frame.t; km.emit('body:jump', { pos: hip, score: Math.min(1, (body.base - hip.y) / (torso * .5)), height: +((body.base - hip.y) / torso).toFixed(2) }); } }
      else if (hip.y > body.base - torso * 0.08) { body.air = false; km.emit('body:land', { pos: hip, airMs: Math.round(frame.t - body.airT) }); }
      // 스쿼트: 무릎 각도
      const kneeA = Math.min(angle(p[23], p[25], p[27]), angle(p[24], p[26], p[28]));
      const sq = feet > .4 && kneeA < 120;
      body.squatN = sq === body.squat ? 0 : body.squatN + 1;
      if (body.squatN >= HOLD) { body.squat = sq; body.squatN = 0; km.emit(sq ? 'body:squat' : 'body:stand', { pos: hip, score: sq ? Math.min(1, (140 - kneeA) / 50) : 1, knee: Math.round(kneeA) }); }
      // 팔 올리기: 양 손목이 어깨보다 몸통 0.3 위
      const up = p[15].y < sh.y - torso * .3 && p[16].y < sh.y - torso * .3;
      body.armsN = up === body.armsUp ? 0 : body.armsN + 1;
      if (body.armsN >= HOLD) { body.armsUp = up; body.armsN = 0; km.emit(up ? 'body:arms_up' : 'body:arms_down', { pos: sh }); }
      return { vis, feet, ok: true, hip, sh, torso, air: body.air, squat: body.squat, armsUp: body.armsUp, knee: Math.round(kneeA) };
    }

    // ── 루프
    let raf = 0, lastVideoTime = -1, fpsT = 0, fpsN = 0;
    function loop(){
      if (!km.running) return;
      const t = performance.now();
      const f = { ctx, W, H, t, motion: modes.has('motion') ? motion : null, hands: [], handedness: null, pose: null, actions: { hands: [], body: null }, fresh: false };
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime; f.fresh = true;
        try {
          if (modes.has('motion')) stepMotion();
          if (handLm) { const r = handLm.detectForVideo(video, t); f.hands = (r.landmarks || []).map(toPx); f.handedness = r.handednesses; }
          if (poseLm) { const r = poseLm.detectForVideo(video, t); f.pose = r.landmarks && r.landmarks[0] ? toPx(r.landmarks[0]) : null; }
        } catch (e) { km.emit('error', { kind: 'detect', message: String(e), score: 0 }); }
        if (handLm) f.actions.hands = stepHands(f);
        if (poseLm) f.actions.body = stepBody(f);
        fpsN++; if (t - fpsT > 1000) { km.fps = fpsN; fpsN = 0; fpsT = t; }
        km.emit('frame', { hands: f.hands, pose: f.pose, actions: f.actions, fps: km.fps });
      }
      km.last = f;
      if (km.onFrame) km.onFrame(f);
      raf = requestAnimationFrame(loop);
    }

    km.start = async function(){
      status('카메라 여는 중…');
      try { video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: W, height: H, facingMode: 'user' }, audio: false }); await video.play(); }
      catch (e) { const err = new Error(e && e.name === 'NotAllowedError' ? '카메라 사용이 허용되지 않았어요. 주소창 왼쪽 자물쇠에서 카메라를 「허용」으로 바꿔 주세요.'
          : e && e.name === 'NotFoundError' ? '이 기기에서 카메라를 찾지 못했어요.' : '카메라를 열 수 없어요. (' + (e && e.name || e) + ')');
        err.cause = e; km.emit('error', { kind: 'camera', message: err.message, score: 0 }); throw err; }
      try { await loadModels(); } catch (e) { km.emit('error', { kind: 'model', message: String(e), score: 0 }); throw new Error('인식 모델을 불러오지 못했어요. 인터넷(모델 서버) 연결을 확인해 주세요.'); }
      status(''); km.running = true; lastVideoTime = -1;
      km.emit('session:start', { activity: km.activity, modes: [...modes], ua: navigator.userAgent, W, H }); raf = requestAnimationFrame(loop);
    };
    km.stop = function(){ if (km.running) km.emit('session:stop'); km.running = false; cancelAnimationFrame(raf); if (video.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; } };
    return km;
  }
  window.KMotion = { create, POSE, HAND, POSE_BONES, HAND_BONES, ENGINE_VERSION, ACTION_VERSION, MODEL_VERSION };
})();
