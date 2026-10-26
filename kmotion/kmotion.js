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
 *   body:raise_left/right · lower_* / body:open_arms · close_arms / body:clap / body:lean_left·right·center / body:freeze · unfreeze
 *   표준 명령(별칭, phase start/update/end): POINT GRAB RELEASE MOVE SWIPE WAVE JUMP SQUAT ARMS_UP RAISE_HAND OPEN_ARMS CLAP LEAN_LEFT LEAN_RIGHT FREEZE — km.on('GRAB', e => e.phase)
 *   마우스 모드: ?mouse=1 (카메라 없이 개발·시연)
 *   segment:true / km.setSegment(on) → 셀피 세그멘터 사람 마스크(f.maskCanvas, km.drawPerson; maskSmooth·maskFeather·maskShrink 조절) — 배경 바꾸기
 *   session:start / session:stop / frame / error
 * 영상은 기기 안에서만 처리되고 어디에도 보내지 않는다. 기록(kmotion-data.js)은 관절 좌표·행동 이벤트만.
 *
 * 사용:
 *   const km = KMotion.create({ video, canvas, modes:['pose'], activity:'jump' });
 *   km.on('body:jump', e => ...);   // e = {type, t, hand?, side?, pos?, score, source:'rule', session, engine, action, model}
 *   km.onFrame = f => ...            // f.ctx f.W f.H f.t f.fresh f.motion f.hands f.pose f.actions
 *   await km.start(); km.stop();
 * 좌표는 전부 캔버스(거울) 픽셀, 원유로 필터로 떨림 보정. 랜드마크 {x,y,z,v}. score = 자체 판정 점수(모델 신뢰도와 다름).\n * 손 actions: dir(손 방향 0~359°, 위=0 시계방향)·pointDir(검지 방향)·facing(palm/back)·pointer(검지 끝)·pinchPt(엄지·검지 사이). 몸: facing(front/left/right)·lean(기울기°).
 */
(function(){
  const ENGINE_VERSION = '0.6.0';
  const ACTION_VERSION = 'rule-0.4.0';
  const MODEL_VERSION  = { hands: 'hand_landmarker/float16/1', pose: 'pose_landmarker_lite/float16/1', vision: 'tasks-vision@0.10.21' };
  const VENDOR = new URL('./vendor/tasks-vision/', document.currentScript ? document.currentScript.src : location.href).href;
  const MODELS = {
    hands: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    pose : 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    seg  : 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite'
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

  // 떨림 보정 — 원유로(One Euro) 필터: 멈추면 매끈, 빨리 움직이면 바로 따라감
  function oneEuro(minCut, beta){ minCut = minCut || 1.2; beta = beta || 0.02; const dCut = 1.0; let xp = null, dxp = 0, tp = 0;
    const a = (cut, dt) => { const r = 2 * Math.PI * cut * dt; return r / (r + 1); };
    return (x, t) => { if (xp == null) { xp = x; tp = t; return x; } const dt = Math.max(1e-3, (t - tp) / 1000); tp = t;
      const dx = (x - xp) / dt, ad = a(dCut, dt); dxp = ad * dx + (1 - ad) * dxp;
      const cut = minCut + beta * Math.abs(dxp), ax = a(cut, dt); xp = ax * x + (1 - ax) * xp; return xp; }; }
  function smoother(n, minCut, beta){ const fx = [], fy = []; for (let i = 0; i < n; i++) { fx.push(oneEuro(minCut, beta)); fy.push(oneEuro(minCut, beta)); }
    return { apply(lm, t){ return lm.map((p, i) => ({ x: fx[i](p.x, t), y: fy[i](p.y, t), z: p.z, v: p.v })); }, reset(){ for (let i = 0; i < n; i++) { fx[i] = oneEuro(minCut, beta); fy[i] = oneEuro(minCut, beta); } } }; }

  function create(opt){
    const video = opt.video, canvas = opt.canvas;
    const W = canvas.width || 640, H = canvas.height || 480;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const modes = new Set(opt.modes || ['motion']);
    const S = opt.motionCell || 8;
    // ── 카메라 범위(모든 케이모션 공통): 웹캠(가까이)·전자칠판 캠(멀리)에 따라 영상의 일부만 잘라 쓴다.
    //    range = { zoom: 1~3, cx, cy: 잘라 쓸 상자의 중심(0~1, 영상 원본 좌표) } — localStorage 'kmotion.camRange'
    const RANGE_KEY = 'kmotion.camRange';
    function loadRange(){ try { const r = JSON.parse(localStorage.getItem(RANGE_KEY) || 'null'); if (r && r.zoom) return { zoom: Math.min(3, Math.max(1, +r.zoom)), cx: Math.min(1, Math.max(0, +r.cx)), cy: Math.min(1, Math.max(0, +r.cy)) }; } catch (_) {} return { zoom: 1, cx: .5, cy: .5 }; }
    let range = loadRange();
    const cropC = document.createElement('canvas'); cropC.width = W; cropC.height = H; const cctx = cropC.getContext('2d');
    const cropOn = () => range.zoom > 1.001 || Math.abs(range.cx - .5) > .001 || Math.abs(range.cy - .5) > .001;
    const srcImg = () => cropOn() ? cropC : video;
    function cropRect(){ const vw = video.videoWidth || W, vh = video.videoHeight || H; const sw = vw / range.zoom, sh = vh / range.zoom; return { sx: Math.min(vw - sw, Math.max(0, range.cx * vw - sw / 2)), sy: Math.min(vh - sh, Math.max(0, range.cy * vh - sh / 2)), sw, sh, vw, vh }; }
    function updateCrop(){ if (!cropOn()) return; const r = cropRect(); cctx.drawImage(video, r.sx, r.sy, r.sw, r.sh, 0, 0, W, H); }
    const sessionId = opt.sessionId || ('s' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));

    const km = { W, H, ctx, video, canvas, modes, sessionId, onFrame: null, onStatus: null, running: false, fps: 0,
      POSE, HAND, POSE_BONES, HAND_BONES, ENGINE_VERSION, ACTION_VERSION, MODEL_VERSION,
      activity: opt.activity || (location.pathname.split('/').pop() || 'index').replace('.html', '') };

    // ── 이벤트 버스
    const subs = {};
    km.on = (type, fn) => { (subs[type] = subs[type] || []).push(fn); return km; };
    km.off = (type, fn) => { subs[type] = (subs[type] || []).filter(f => f !== fn); return km; };
    // 표준 행동 명령(KEDU ACTION LAB 명세) ← 내부 이벤트 별칭. phase: start/update/end
    const STD = { 'hand:point': ['POINT', 'start'], 'hand:grab': ['GRAB', 'start'], 'hand:release': ['RELEASE', 'start'], 'hand:move': ['MOVE', 'update'], 'hand:swipe': ['SWIPE', 'start'], 'hand:wave': ['WAVE', 'start'],
      'body:jump': ['JUMP', 'start'], 'body:land': ['JUMP', 'end'], 'body:squat': ['SQUAT', 'start'], 'body:stand': ['SQUAT', 'end'], 'body:arms_up': ['ARMS_UP', 'start'], 'body:arms_down': ['ARMS_UP', 'end'],
      'body:raise_left': ['RAISE_HAND', 'start'], 'body:raise_right': ['RAISE_HAND', 'start'], 'body:lower_left': ['RAISE_HAND', 'end'], 'body:lower_right': ['RAISE_HAND', 'end'],
      'body:open_arms': ['OPEN_ARMS', 'start'], 'body:close_arms': ['OPEN_ARMS', 'end'], 'body:clap': ['CLAP', 'start'], 'body:lean_left': ['LEAN_LEFT', 'start'], 'body:lean_right': ['LEAN_RIGHT', 'start'], 'body:lean_center': ['LEAN', 'end'],
      'body:freeze': ['FREEZE', 'start'], 'body:unfreeze': ['FREEZE', 'end'] };
    km.emit = (type, data) => {
      const e = Object.assign({ type, t: performance.now(), score: 1, source: 'rule', session: sessionId, engine: ENGINE_VERSION, action: ACTION_VERSION,
        model: type.startsWith('hand') ? MODEL_VERSION.hands : type.startsWith('body') ? MODEL_VERSION.pose : null }, data || {});
      (subs[type] || []).forEach(f => f(e)); (subs['*'] || []).forEach(f => f(e));
      const std = STD[type]; if (std) { const se = Object.assign({}, e, { type: std[0], actionType: std[0], phase: std[1], raw: type }); (subs[std[0]] || []).forEach(f => f(se)); (subs['std:*'] || []).forEach(f => f(se)); }
      return e;
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
    function stepMotion(){ octx.drawImage(srcImg(), 0, 0, off.width, off.height);
      const d = octx.getImageData(0, 0, off.width, off.height).data, n = grid.length;
      if (prev) for (let i = 0, j = 0; i < n; i++, j += 4) grid[i] = (Math.abs(d[j] - prev[j]) + Math.abs(d[j+1] - prev[j+1]) + Math.abs(d[j+2] - prev[j+2])) > 90 ? 1 : 0;
      prev = new Uint8ClampedArray(d); }

    // ── MediaPipe
    let handLm = null, poseLm = null;
    const NH = Math.max(1, opt.numHands || 2); const hsm = opt.handSmooth || {}; const handSm = Array.from({ length: NH }, () => smoother(21, hsm.minCut, hsm.beta)), poseSm = smoother(33); let poseSeen = false;
    function toPx(lm){ return lm.map(p => ({ x: (1 - p.x) * W, y: p.y * H, z: p.z, v: p.visibility == null ? 1 : p.visibility })); }
    async function loadModels(){
      if (!modes.has('hands') && !modes.has('pose')) return;
      status('인식 모델 준비 중…');
      const v = await vision();
      const files = await v.FilesetResolver.forVisionTasks(VENDOR + 'wasm');
      const base = (path) => ({ baseOptions: { modelAssetPath: path, delegate: 'GPU' }, runningMode: 'VIDEO' });
      if (modes.has('hands')) { const hc = opt.handConf; handLm = await v.HandLandmarker.createFromOptions(files, Object.assign(base(MODELS.hands), { numHands: opt.numHands || 2 }, hc ? { minHandDetectionConfidence: hc, minHandPresenceConfidence: hc, minTrackingConfidence: hc } : {})); }
      if (modes.has('pose')) { const pcf = opt.poseConf; poseLm = await v.PoseLandmarker.createFromOptions(files, Object.assign(base(MODELS.pose), { numPoses: 1 }, pcf ? { minPoseDetectionConfidence: pcf, minPosePresenceConfidence: pcf, minTrackingConfidence: pcf } : {})); }
      if (opt.segment) await ensureSeg();
    }
    function status(s){ if (km.onStatus) km.onStatus(s); }

    // ── 사람 마스크(segment 옵션): 거울 좌표 알파 캔버스. 배경 바꾸기·실루엣에 씀
    const maskCanvas = document.createElement('canvas'); const mctx = maskCanvas.getContext('2d'); let maskImg = null;
    km.segmentOn = !!opt.segment; let segLm = null, segLoading = null, maskAcc = null, segLastT = -1;
    async function ensureSeg(){ if (segLm) return segLm; if (segLoading) return segLoading; status('사람 분리 모델 준비 중…');
      segLoading = (async () => { const v = await vision(); const files = await v.FilesetResolver.forVisionTasks(VENDOR + 'wasm');
        segLm = await v.ImageSegmenter.createFromOptions(files, { baseOptions: { modelAssetPath: MODELS.seg, delegate: 'GPU' }, runningMode: 'VIDEO', outputConfidenceMasks: true, outputCategoryMask: false }); status(''); return segLm; })();
      return segLoading; }
    // 사람 확률(0~1) → 시간 평활(EMA .55) → 부드러운 문턱 → 알파. 끝부분 떨림을 잡는 핵심은 EMA + 그릴 때 blur 깃털
    km.updateMask = function(mask){ const mw = mask.width, mh = mask.height; if (maskCanvas.width !== mw || maskCanvas.height !== mh) { maskCanvas.width = mw; maskCanvas.height = mh; maskImg = mctx.createImageData(mw, mh); maskAcc = null; }
      const a = mask.getAsFloat32Array(); if (!maskAcc || maskAcc.length !== a.length) maskAcc = Float32Array.from(a);
      const d = maskImg.data, k = km.maskSmooth == null ? .55 : km.maskSmooth; let j = 3;
      for (let i = 0; i < a.length; i++, j += 4) { const v = maskAcc[i] = maskAcc[i] * k + a[i] * (1 - k); d[j] = v > .7 ? 255 : v < .4 ? 0 : ((v - .4) / .3 * 255) | 0; }
      mctx.putImageData(maskImg, 0, 0); };
    function stepSeg(t){ if (!segLm || !km.segmentOn) return false; if (video.currentTime === segLastT) return !!maskCanvas.width; segLastT = video.currentTime;
      const r = segLm.segmentForVideo(srcImg(), t); const m = r.confidenceMasks && r.confidenceMasks[0]; if (!m) return false; try { km.updateMask(m); } finally { try { m.close(); } catch (_) {} } return true; }
    /** 사람 마스크 켜고 끄기(배경 바꿀 때만 켜서 프레임 아낌) */
    km.setSegment = async function(on){ km.segmentOn = !!on; if (on) { try { await ensureSeg(); } catch (e) { km.emit('error', { kind: 'segment', message: String(e), score: 0 }); } } else { maskAcc = null; } };
    // ── 가장자리 다듬기(WebGL 조인트 바이래터럴): 저해상 마스크를 영상 색 경계에 맞춰 다시 그음 — 머리카락·손가락 끝
    let gl = null, glc = null, prog = null, texV = null, texM = null, glFail = false;
    function initGL(){ if (gl || glFail) return !!gl; try { glc = document.createElement('canvas'); glc.width = W; glc.height = H; gl = glc.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false, preserveDrawingBuffer: false }); if (!gl) throw new Error('webgl 없음');
      const vs = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,p.y*.5+.5);gl_Position=vec4(p,0.,1.);}';
      const fs = `precision mediump float;varying vec2 v;uniform sampler2D uV;uniform sampler2D uM;uniform vec2 uT;uniform float uSc;uniform float uR;
        void main(){ vec3 c=texture2D(uV,v).rgb; float ws=0.,wm=0.;
          for(int y=-3;y<=3;y++){for(int x=-3;x<=3;x++){ vec2 o=vec2(float(x),float(y))*uR*uT; vec3 cn=texture2D(uV,v+o).rgb; float m=texture2D(uM,v+o).a;
            float dc=distance(c,cn); float w=exp(-dot(o/uT,o/uT)/(2.*3.*3.*uR*uR))*exp(-(dc*dc)/(2.*uSc*uSc)); ws+=w; wm+=w*m; }}
          float a=wm/max(ws,1e-4); a=smoothstep(.38,.62,a); gl_FragColor=vec4(c,a); }`;
      const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)); gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const mkTex = (unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); return t; };
      texV = mkTex(0); texM = mkTex(1); gl.uniform1i(gl.getUniformLocation(prog, 'uV'), 0); gl.uniform1i(gl.getUniformLocation(prog, 'uM'), 1); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.viewport(0, 0, W, H); return true; }
      catch (e) { glFail = true; gl = null; km.emit('warn', { kind: 'gl', message: '가장자리 다듬기 불가: ' + e.message }); return false; } }
    function refineGL(){ if (!initGL()) return null; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texV); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcImg());
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texM); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
      gl.uniform2f(gl.getUniformLocation(prog, 'uT'), 1 / W, 1 / H); gl.uniform1f(gl.getUniformLocation(prog, 'uSc'), km.maskColorSigma == null ? .12 : km.maskColorSigma); gl.uniform1f(gl.getUniformLocation(prog, 'uR'), km.maskRefineStep == null ? 2.0 : km.maskRefineStep);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); return glc; }
    /** 사람만 거울로 그린다(배경 투명). target ctx 에 W×H */
    km.drawPerson = function(tctx){ tctx = tctx || ctx;
      if (km.maskRefine !== false) { const out = refineGL(); if (out) { tctx.save(); tctx.translate(W, 0); tctx.scale(-1, 1); tctx.drawImage(out, 0, 0, W, H); tctx.restore(); return; } }
      const pc = km._pc || (km._pc = document.createElement('canvas')); if (pc.width !== W || pc.height !== H) { pc.width = W; pc.height = H; } const p = pc.getContext('2d');
      p.clearRect(0, 0, W, H); p.save(); p.translate(W, 0); p.scale(-1, 1); p.drawImage(srcImg(), 0, 0, W, H); p.globalCompositeOperation = 'destination-in'; p.filter = 'blur(' + (km.maskFeather == null ? 3 : km.maskFeather) + 'px)'; const sh = km.maskShrink == null ? 2 : km.maskShrink; p.drawImage(maskCanvas, sh, sh, W - sh * 2, H - sh * 2); p.filter = 'none'; p.restore(); tctx.drawImage(pc, 0, 0); };
    km.maskCanvas = maskCanvas;

    // ── 카메라 범위 API·조절 화면
    km.getRange = () => ({ ...range });
    km.setRange = (r, save) => { range = { zoom: Math.min(3, Math.max(1, +r.zoom || 1)), cx: Math.min(1, Math.max(0, r.cx == null ? .5 : +r.cx)), cy: Math.min(1, Math.max(0, r.cy == null ? .5 : +r.cy)) }; if (save !== false) try { localStorage.setItem(RANGE_KEY, JSON.stringify(range)); } catch (_) {} km.emit('range', { ...range }); };
    km.resetRange = () => km.setRange({ zoom: 1, cx: .5, cy: .5 });
    /** 범위 조절 화면(공통). 카메라가 켜진 뒤에 호출. 저장하면 모든 케이모션 활동에 같이 적용. */
    km.openRangeUI = function(onClose){ if (km._rangeUI) return; const before = { ...range }; let cur = { ...range };
      const el = document.createElement('div'); km._rangeUI = el; el.setAttribute('style', 'position:fixed;inset:0;z-index:99999;background:rgba(5,4,18,.94);color:#fff;font-family:inherit;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;padding:10px 12px 16px;box-sizing:border-box;overflow:auto;-webkit-overflow-scrolling:touch');
      el.innerHTML = `<div style="display:flex;align-items:center;gap:12px;width:min(92vw,760px);justify-content:space-between"><div style="font-size:1.2rem;font-weight:900">📷 카메라 범위</div><div style="display:flex;gap:8px"><button data-a="save" style="padding:9px 18px;border-radius:12px;border:0;background:#5ef2c8;color:#0b1020;font-weight:900;font-size:1rem;cursor:pointer">저장</button><button data-a="cancel" style="padding:9px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:transparent;color:#fff;font-size:1rem;cursor:pointer">닫기</button></div></div>
        <div style="font-size:.85rem;opacity:.8;text-align:center;max-width:720px">상자 안이 게임 화면 전체가 돼요. 아이가 서는 자리가 상자에 꽉 차게 맞춘 뒤 「저장」 — 모든 케이모션에 같이 적용돼요. 화면을 눌러 상자를 옮길 수 있어요.</div>
        <canvas style="width:min(92vw,760px,calc(46vh * 4 / 3));aspect-ratio:4/3;border-radius:14px;background:#000;border:2px solid rgba(255,255,255,.25);touch-action:none;flex:none"></canvas>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <button data-p="1" style="padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;font-size:1rem;cursor:pointer">🖥 웹캠 (가까이)</button>
          <button data-p="1.8" style="padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;font-size:1rem;cursor:pointer">📺 전자칠판 캠 (멀리)</button>
          <button data-p="2.5" style="padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;font-size:1rem;cursor:pointer">🔭 아주 멀리</button>
        </div>
        <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px 12px;align-items:center;width:min(92vw,520px);font-size:.95rem">
          <span>확대</span><input data-k="zoom" type="range" min="1" max="3" step="0.05"><b data-v="zoom" style="min-width:3.5em;text-align:right"></b>
          <span>좌우</span><input data-k="x" type="range" min="0" max="1" step="0.01"><b data-v="x" style="min-width:3.5em;text-align:right"></b>
          <span>상하</span><input data-k="y" type="range" min="0" max="1" step="0.01"><b data-v="y" style="min-width:3.5em;text-align:right"></b>
        </div>
        `;
      document.body.appendChild(el);
      const pv = el.querySelector('canvas'); pv.width = 640; pv.height = 480; const pc = pv.getContext('2d');
      const inZ = el.querySelector('[data-k=zoom]'), inX = el.querySelector('[data-k=x]'), inY = el.querySelector('[data-k=y]');
      const sync = () => { inZ.value = cur.zoom; inX.value = 1 - cur.cx; inY.value = cur.cy; el.querySelector('[data-v=zoom]').textContent = cur.zoom.toFixed(2) + '×'; el.querySelector('[data-v=x]').textContent = Math.round((1 - cur.cx) * 100) + '%'; el.querySelector('[data-v=y]').textContent = Math.round(cur.cy * 100) + '%'; km.setRange(cur, false); };
      inZ.oninput = () => { cur.zoom = +inZ.value; sync(); }; inX.oninput = () => { cur.cx = 1 - +inX.value; sync(); }; inY.oninput = () => { cur.cy = +inY.value; sync(); };
      el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { cur = { zoom: +b.dataset.p, cx: .5, cy: .5 }; sync(); });
      const pick = e => { const r = pv.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; cur.cx = 1 - Math.min(1, Math.max(0, x)); cur.cy = Math.min(1, Math.max(0, y)); sync(); };
      let dragging = false; pv.onpointerdown = e => { dragging = true; pv.setPointerCapture(e.pointerId); pick(e); }; pv.onpointermove = e => { if (dragging) pick(e); }; pv.onpointerup = pv.onpointercancel = () => { dragging = false; };
      let rafId = 0; const draw = () => { if (!km._rangeUI) return; const vw = video.videoWidth || W, vh = video.videoHeight || H;
        pc.save(); pc.translate(640, 0); pc.scale(-1, 1); if (vw) pc.drawImage(video, 0, 0, 640, 480); else { pc.fillStyle = '#222'; pc.fillRect(0, 0, 640, 480); } pc.restore();
        if (cur.zoom > 1.001 || cur.cx !== .5 || cur.cy !== .5) { const sw = 640 / cur.zoom, sh = 480 / cur.zoom; const sx = Math.min(640 - sw, Math.max(0, cur.cx * 640 - sw / 2)), sy = Math.min(480 - sh, Math.max(0, cur.cy * 480 - sh / 2)); const mx = 640 - sx - sw;
          pc.fillStyle = 'rgba(0,0,0,.55)'; pc.fillRect(0, 0, 640, 480); pc.clearRect(mx, sy, sw, sh); pc.save(); pc.translate(640, 0); pc.scale(-1, 1); pc.beginPath(); pc.rect(640 - mx - sw, sy, sw, sh); pc.clip(); pc.drawImage(video, 0, 0, 640, 480); pc.restore();
          pc.strokeStyle = '#5ef2c8'; pc.lineWidth = 4; pc.strokeRect(mx, sy, sw, sh); }
        else { pc.strokeStyle = '#5ef2c8'; pc.lineWidth = 4; pc.strokeRect(2, 2, 636, 476); }
        rafId = requestAnimationFrame(draw); };
      const close = (save) => { cancelAnimationFrame(rafId); if (save) km.setRange(cur, true); else km.setRange(before, false); el.remove(); km._rangeUI = null; if (onClose) onClose(save ? { ...range } : null); };
      el.querySelector('[data-a=save]').onclick = () => close(true); el.querySelector('[data-a=cancel]').onclick = () => close(false);
      sync(); draw(); };
    /** 캔버스 옆에 「📷 범위」 단추 붙이기(활동이 원하면 opt.rangeButton: false 로 끔) */
    function mountRangeButton(){ if (opt.rangeButton === false || km.mouse || km._rangeBtn) return; const host = canvas.parentElement; if (!host) return; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const b = document.createElement('button'); km._rangeBtn = b; b.type = 'button'; b.textContent = '📷 범위'; b.title = '카메라 범위 조절(웹캠·전자칠판 캠)'; b.setAttribute('style', 'position:absolute;left:6px;top:6px;z-index:20;padding:4px 9px;border-radius:9px;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.55);color:#fff;font-size:.78rem;cursor:pointer;font-family:inherit;pointer-events:auto');
      b.onclick = e => { e.stopPropagation(); km.openRangeUI(); }; host.appendChild(b); }

    // ── 그리기 도우미
    km.drawSkeleton = function(lm, bones, color, r){ if (!lm) return; ctx.strokeStyle = color || 'rgba(77,225,255,.9)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const [a, b] of bones) { if (lm[a].v < .4 || lm[b].v < .4) continue; ctx.beginPath(); ctx.moveTo(lm[a].x, lm[a].y); ctx.lineTo(lm[b].x, lm[b].y); ctx.stroke(); }
      ctx.fillStyle = '#fff'; for (const p of lm) { if (p.v < .4) continue; ctx.beginPath(); ctx.arc(p.x, p.y, r || 5, 0, Math.PI * 2); ctx.fill(); } };
    km.drawCamera = function(){ if (km.mouse) { ctx.fillStyle = '#1b2236'; ctx.fillRect(0, 0, W, H); km.drawMouseHelp(); return; } ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(srcImg(), 0, 0, W, H); ctx.restore(); };

    // ── 손 특징(규칙 층 재료)
    km.handFeatures = function(h){
      const w = h[0], c = h[9], span = dist(c, w) || 1;
      const tips = [8, 12, 16, 20], pips = [6, 10, 14, 18];
      const ext = tips.map((t, i) => dist(h[t], w) > dist(h[pips[i]], w) * 1.05);
      const thumbExt = dist(h[4], h[17]) > dist(h[3], h[17]) * 1.1 && dist(h[4], h[5]) > span * 0.45; // 엄지 끝이 새끼손가락 쪽에서 멀고 검지 밑동에서도 떨어짐
      const curl = tips.reduce((s, t) => s + dist(h[t], c), 0) / (4 * span);   // 작을수록 쥠
      const pinch = dist(h[4], h[8]) / span;                                   // 엄지-검지 거리(손 크기 비)
      // 방향: 손목→중지 밑동 각도(화면 위=0°, 시계 방향 +), 가리키는 방향은 검지 밑동→검지 끝
      const dirDeg = (a, b) => (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI + 360) % 360;
      const dir = dirDeg(w, c), pointDir = dirDeg(h[5], h[8]);
      const named = d => ['위', '오른쪽 위', '오른쪽', '오른쪽 아래', '아래', '왼쪽 아래', '왼쪽', '왼쪽 위'][Math.round(d / 45) % 8];
      // 손바닥/손등: 검지 밑동·새끼 밑동이 손목 기준으로 도는 방향 (왼손·오른손은 호출부에서 side 로 보정)
      const crossZ = (h[5].x - w.x) * (h[17].y - w.y) - (h[5].y - w.y) * (h[17].x - w.x);
      const pointer = { x: h[8].x, y: h[8].y };                                 // 정밀 위치 = 검지 끝
      const pinchPt = mid(h[4], h[8]);                                         // 집기 위치 = 엄지·검지 사이
      return { span, ext, thumbExt, fingersUp: ext.filter(Boolean).length + (thumbExt ? 1 : 0), curl, pinch, center: c, wrist: w,
        dir: Math.round(dir), dirName: named(dir), pointDir: Math.round(pointDir), pointDirName: named(pointDir), crossZ, pointer, pinchPt };
    };
    km.isFist = h => !!h && km.handFeatures(h).curl < 0.55;
    km.fingersUp = h => h ? km.handFeatures(h).fingersUp : 0;

    // ── 행동 층 상태
    const HOLD = 3; // 연속 프레임 확인(히스테리시스)
    const handState = Array.from({ length: NH }, () => ({ pose: 'none', cand: 'none', n: 0, pinched: false, hist: [], lastMoveEmit: 0, waved: false, swiped: false }));
    const body = { seen: false, base: null, air: false, airT: 0, squat: false, squatN: 0, armsUp: false, armsN: 0, raiseL: false, raiseR: false, openArms: false, clapClose: false, leanDir: 'center', leanN: 0, still: 0, frozen: false, prevPose: null };
    function flip(key, cur, onT, offT, data){ const nk = key + 'N'; body[nk] = cur === body[key] ? 0 : (body[nk] || 0) + 1; if (body[nk] >= HOLD) { body[key] = cur; body[nk] = 0; km.emit(cur ? onT : offT, data || {}); } }
    function labelHand(f){
      if (f.pinch < 0.25 && f.ext[1] && f.ext[2]) return 'pinch';
      if (f.curl < 0.55) return 'fist';
      if (f.ext[0] && !f.ext[1] && !f.ext[2] && !f.ext[3]) return 'point';
      if (f.fingersUp >= 4) return 'open';
      return 'other';
    }
    function stepHands(frame){
      const acts = [];
      for (let i = 0; i < NH; i++) {
        const h = frame.hands[i], st = handState[i];
        if (!h) { if (st.pose !== 'none') { if (st.pinched) { km.emit('hand:release', { hand: i, reason: 'lost', score: .5 }); st.pinched = false; } st.pose = 'none'; st.cand = 'none'; st.n = 0; st.hist = []; } continue; }
        const f = km.handFeatures(h);
        const hd = frame.handedness && frame.handedness[i] && frame.handedness[i][0];
        const side = hd ? (hd.categoryName === 'Left' ? 'left' : 'right') : null; // 모델 라벨이 거울 기준이라 그대로(실기기 10-23 확인)
        f.facing = side ? ((f.crossZ < 0) === (side === 'right') ? 'palm' : 'back') : null; // 손바닥/손등 (거울 화면 기준)
        const lab = labelHand(f), now = frame.t;
        if (lab === st.cand) st.n++; else { st.cand = lab; st.n = 1; }
        if (st.n >= HOLD && lab !== st.pose) {
          st.pose = lab;
          const score = lab === 'pinch' ? Math.min(1, (0.25 - f.pinch) / 0.15 + .6) : lab === 'fist' ? Math.min(1, (0.55 - f.curl) / 0.3 + .6) : .8;
          if (lab === 'pinch' || lab === 'fist') { if (!st.pinched) { st.pinched = true; km.emit('hand:grab', { hand: i, side, pos: lab === 'pinch' ? f.pinchPt : f.center, score, via: lab }); } }
          else if (st.pinched) { st.pinched = false; km.emit('hand:release', { hand: i, side, pos: f.pinchPt, score }); }
          km.emit('hand:' + lab, { hand: i, side, pos: lab === 'point' ? f.pointer : f.center, score, fingersUp: f.fingersUp, dir: f.dir, pointDir: f.pointDir, facing: f.facing });
        }
        st.hist.push({ x: f.center.x, y: f.center.y, t: now }); while (st.hist.length && now - st.hist[0].t > 600) st.hist.shift();
        if (now - st.lastMoveEmit > 50) { st.lastMoveEmit = now; km.emit('hand:move', { hand: i, side, pos: f.center, pointer: f.pointer, pinchPt: f.pinchPt, dir: f.dir, pointDir: f.pointDir, facing: f.facing, pinched: st.pinched, pose: st.pose }); }
        if (st.hist.length > 8) {
          const xs = st.hist.map(p => p.x), dx = xs[xs.length - 1] - xs[0];
          let turns = 0; for (let k = 2; k < xs.length; k++) if ((xs[k] - xs[k-1]) * (xs[k-1] - xs[k-2]) < 0 && Math.abs(xs[k] - xs[k-1]) > 4) turns++;
          const range = Math.max(...xs) - Math.min(...xs);
          if (turns >= 4 && range > f.span * 1.5 && st.pose === 'open' && !st.waved) { st.waved = true; km.emit('hand:wave', { hand: i, side, pos: f.center, score: Math.min(1, turns / 6) }); setTimeout(() => st.waved = false, 900); }
          if (Math.abs(dx) > f.span * 3 && turns <= 1 && !st.swiped) { st.swiped = true; km.emit('hand:swipe', { hand: i, side, pos: f.center, dir: dx > 0 ? 'right' : 'left', score: Math.min(1, Math.abs(dx) / (f.span * 5)) }); setTimeout(() => st.swiped = false, 700); }
        }
        acts.push({ hand: i, side, pose: st.pose, pinched: st.pinched, fingersUp: f.fingersUp, pinch: +f.pinch.toFixed(3), curl: +f.curl.toFixed(3),
          dir: f.dir, dirName: f.dirName, pointDir: f.pointDir, pointDirName: f.pointDirName, facing: f.facing, pointer: f.pointer, pinchPt: f.pinchPt, center: f.center, span: Math.round(f.span) });
      }
      return acts;
    }
    function stepBody(frame){
      const p = frame.pose;
      if (!p) { if (body.seen) { body.seen = false; body.prevPose = null; body.still = 0; km.emit('body:lost'); } return null; }
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
      const upL = p[15].v > .4 && p[15].y < sh.y - torso * .3, upR = p[16].v > .4 && p[16].y < sh.y - torso * .3;
      flip('armsUp', upL && upR, 'body:arms_up', 'body:arms_down', { pos: sh });
      flip('raiseL', upL && !upR, 'body:raise_left', 'body:lower_left', { pos: p[15], side: 'left' });
      flip('raiseR', upR && !upL, 'body:raise_right', 'body:lower_right', { pos: p[16], side: 'right' });
      // 양팔 벌리기: 손목이 어깨 높이 근처, 둘 사이가 어깨폭 1.6배 넘음
      const shw = dist(p[11], p[12]) || 1, wristDist = dist(p[15], p[16]);
      const open = p[15].v > .4 && p[16].v > .4 && wristDist > shw * 1.6 && Math.abs(p[15].y - sh.y) < torso * .45 && Math.abs(p[16].y - sh.y) < torso * .45;
      flip('openArms', open, 'body:open_arms', 'body:close_arms', { pos: sh, spread: +(wristDist / shw).toFixed(2) });
      // 손뼉: 손목 거리가 몸통 .3 아래로 들어오는 순간
      const close = p[15].v > .4 && p[16].v > .4 && wristDist < torso * .3;
      if (close && !body.clapClose) km.emit('body:clap', { pos: mid(p[15], p[16]) }); body.clapClose = close;
      // 기울기: lean ±12°
      const leanNow = Math.atan2(sh.x - hip.x, -(sh.y - hip.y)) * 180 / Math.PI, ld = leanNow < -12 ? 'left' : leanNow > 12 ? 'right' : 'center';
      body.leanN = ld === body.leanDir ? 0 : body.leanN + 1;
      if (body.leanN >= HOLD) { body.leanDir = ld; body.leanN = 0; km.emit(ld === 'center' ? 'body:lean_center' : 'body:lean_' + ld, { pos: sh, lean: Math.round(leanNow) }); }
      // 멈춤: 주요 관절 평균 속도가 낮은 상태 1초
      if (body.prevPose) { let mv = 0, n = 0; for (const k of [0, 11, 12, 15, 16, 23, 24]) { mv += dist(p[k], body.prevPose[k]); n++; } mv = mv / n / torso;
        body.still = mv < 0.02 ? body.still + 1 : 0; const fz = body.still > 25; if (fz !== body.frozen) { body.frozen = fz; km.emit(fz ? 'body:freeze' : 'body:unfreeze', { pos: hip }); } }
      body.prevPose = p;
      // 몸 방향: 어깨 폭/몸통 비(정면 클수록)·코가 어깨 중심에서 어느 쪽인지·기울기
      const shW = dist(p[11], p[12]) / torso, nose = p[0];
      const facing = shW > 0.55 ? 'front' : (nose.x < sh.x ? 'left' : 'right');
      const lean = Math.round(Math.atan2(sh.x - hip.x, -(sh.y - hip.y)) * 180 / Math.PI); // 0 = 똑바로, + 오른쪽으로 기움
      return { vis, feet, ok: true, hip, sh, torso, air: body.air, squat: body.squat, armsUp: body.armsUp, raiseL: body.raiseL, raiseR: body.raiseR, openArms: body.openArms, frozen: body.frozen, leanDir: body.leanDir, knee: Math.round(kneeA), facing, shoulderRatio: +shW.toFixed(2), lean };
    }

    // ── 루프
    let raf = 0, lastVideoTime = -1, fpsT = 0, fpsN = 0;
    function loop(){
      if (!km.running) return;
      const t = performance.now();
      const f = { ctx, W, H, t, motion: modes.has('motion') ? motion : null, hands: [], handedness: null, pose: null, actions: { hands: [], body: null }, fresh: false };
      if (mouseMode) { f.fresh = true;
        if (modes.has('hands')) { f.hands = [mockHand()]; f.handedness = [[{ categoryName: 'Right', score: 1 }]]; f.actions.hands = stepHands(f); }
        if (modes.has('pose')) { f.pose = mockPose(); f.actions.body = stepBody(f); }
        if (modes.has('motion')) { grid.fill(0); const gx = (W - mouse.x) / S | 0, gy = mouse.y / S | 0; if (mouse.down) for (let yy = gy - 4; yy <= gy + 4; yy++) for (let xx = gx - 4; xx <= gx + 4; xx++) if (yy >= 0 && xx >= 0 && yy < off.height && xx < off.width) grid[yy * off.width + xx] = 1; }
        fpsN++; if (t - fpsT > 1000) { km.fps = fpsN; fpsN = 0; fpsT = t; }
        km.emit('frame', { hands: f.hands, pose: f.pose, actions: f.actions, fps: km.fps });
      } else if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime; f.fresh = true;
        try {
          updateCrop();
          if (modes.has('motion')) stepMotion();
          if (handLm) { const r = handLm.detectForVideo(srcImg(), t); f.hands = (r.landmarks || []).map((lm, i) => handSm[i] ? handSm[i].apply(toPx(lm), t) : toPx(lm)); f.handedness = r.handednesses;
            for (let i = f.hands.length; i < NH; i++) handSm[i].reset(); }
          if (poseLm) { const r = poseLm.detectForVideo(srcImg(), t); const raw = r.landmarks && r.landmarks[0] ? toPx(r.landmarks[0]) : null;
            if (raw) { f.pose = poseSm.apply(raw, t); poseSeen = true; } else { f.pose = null; if (poseSeen) { poseSm.reset(); poseSeen = false; } }
            }
          if (km.segmentOn) { try { if (stepSeg(t)) f.maskCanvas = maskCanvas; } catch (e) { km.emit('error', { kind: 'mask', message: String(e), score: 0 }); } }
        } catch (e) { km.emit('error', { kind: 'detect', message: String(e), score: 0 }); }
        if (handLm) f.actions.hands = stepHands(f);
        if (poseLm) f.actions.body = stepBody(f);
        fpsN++; if (t - fpsT > 1000) { km.fps = fpsN; fpsN = 0; fpsT = t; }
        km.emit('frame', { hands: f.hands, pose: f.pose, actions: f.actions, fps: km.fps });
      }
      km.last = f;
      const t1 = performance.now(); if (km.onFrame) { try { km.onFrame(f); } catch (e) { km.emit('error', { kind: 'onFrame', message: String(e), score: 0 }); console.error(e); } } const dtF = performance.now() - t1; km.slow = dtF > 120 ? (km.slow || 0) + 1 : 0; if (km.slow === 3) km.emit('warn', { kind: 'slow', message: '프레임이 ' + Math.round(dtF) + 'ms 걸림', ms: Math.round(dtF) });
      raf = requestAnimationFrame(loop);
    }

    // 마우스 모드 — 카메라 없이 개발·시연. 손: 마우스 위치=손, 누르면 집기, F=주먹. 몸: 마우스 x=고개·몸 위치, 클릭=점프, S=앉기, A/D=기울기, Q/E=왼손/오른손 들기, W=양손, O=양팔 벌리기
    const mouseMode = opt.mouse || new URLSearchParams(location.search).has('mouse');
    const mouse = { x: W / 2, y: H / 2, down: false, keys: {} , jumpT: 0 };
    if (mouseMode) { km.mouse = true;
      const rect = () => canvas.getBoundingClientRect();
      const mv = ev => { const r = rect(); const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX), cy = (ev.touches ? ev.touches[0].clientY : ev.clientY); mouse.x = (cx - r.left) / r.width * W; mouse.y = (cy - r.top) / r.height * H; };
      canvas.addEventListener('mousemove', mv); canvas.addEventListener('touchmove', mv, { passive: true });
      canvas.addEventListener('mousedown', ev => { mv(ev); mouse.down = true; if (modes.has('pose')) mouse.jumpT = performance.now(); }); window.addEventListener('mouseup', () => mouse.down = false);
      canvas.addEventListener('touchstart', ev => { mv(ev); mouse.down = true; if (modes.has('pose')) mouse.jumpT = performance.now(); }, { passive: true }); window.addEventListener('touchend', () => mouse.down = false);
      window.addEventListener('keydown', ev => { mouse.keys[ev.key.toLowerCase()] = true; if (ev.key === ' ') mouse.jumpT = performance.now(); }); window.addEventListener('keyup', ev => { mouse.keys[ev.key.toLowerCase()] = false; }); }
    function mockHand(){ const s = 60, c = { x: mouse.x, y: mouse.y }, fist = !!mouse.keys.f, pinch = mouse.down && !fist; const pt = []; const fing = [[-.55, -1.2], [-.2, -1.6], [.15, -1.7], [.5, -1.5]];
      pt[0] = { x: c.x, y: c.y + s, z: 0, v: 1 }; for (let i = 1; i <= 4; i++) pt[i] = { x: c.x - s * (.4 + i * .18), y: c.y + s * (.6 - i * .3), z: 0, v: 1 };
      fing.forEach(([dx, dy], fi) => { for (let j = 0; j < 4; j++) { const k = 5 + fi * 4 + j, r = fist && j > 0 ? .25 : 1; pt[k] = { x: c.x + dx * s * (j === 0 ? 1 : 1 + j * .15 * r), y: c.y + s * (j === 0 ? -.2 : -.2 + dy * j * .35 * r), z: 0, v: 1 }; } });
      if (pinch) { pt[4] = { x: pt[8].x - 4, y: pt[8].y, z: 0, v: 1 }; } return pt; }
    function mockPose(){ const t = performance.now(), cx = W / 2 + (mouse.x - W / 2) * .35, air = t - mouse.jumpT < 320 ? Math.sin((t - mouse.jumpT) / 320 * Math.PI) : 0, sq = mouse.keys.s ? 1 : 0, lean = mouse.keys.a ? -22 : mouse.keys.d ? 22 : 0;
      const T = 110, hipY = H * .62 - air * 70 + sq * 40, shY = hipY - T, headX = cx + (mouse.x - W / 2) * .25, L = Math.sin(lean * Math.PI / 180) * T;
      const P = (x, y, v) => ({ x, y, z: 0, v: v == null ? 1 : v }); const p = new Array(33).fill(null).map(() => P(cx, shY, 0));
      p[11] = P(cx - 60 + L, shY); p[12] = P(cx + 60 + L, shY); p[23] = P(cx - 35, hipY); p[24] = P(cx + 35, hipY);
      p[0] = P(headX + L * 1.3, shY - 75); p[7] = P(headX - 22 + L * 1.3, shY - 70 + lean * .6); p[8] = P(headX + 22 + L * 1.3, shY - 70 - lean * .6); p[2] = P(headX - 10 + L * 1.3, shY - 80); p[5] = P(headX + 10 + L * 1.3, shY - 80);
      const upL = mouse.keys.q || mouse.keys.w, upR = mouse.keys.e || mouse.keys.w, open = mouse.keys.o;
      p[13] = P(cx - 85 + L, shY + 60); p[14] = P(cx + 85 + L, shY + 60);
      p[15] = open ? P(cx - 150 + L, shY) : upL ? P(cx - 70 + L, shY - 110) : P(cx - 90 + L, shY + 120); p[16] = open ? P(cx + 150 + L, shY) : upR ? P(cx + 70 + L, shY - 110) : P(cx + 90 + L, shY + 120);
      if (mouse.keys.c) { p[15] = P(cx - 8, shY + 40); p[16] = P(cx + 8, shY + 40); }
      const kneeY = hipY + 90 - sq * 30, ankY = hipY + 180; p[25] = P(cx - 40 - sq * 30, kneeY); p[26] = P(cx + 40 + sq * 30, kneeY); p[27] = P(cx - 40, ankY); p[28] = P(cx + 40, ankY);
      return p; }
    km.drawMouseHelp = function(){ if (!mouseMode) return; ctx.font = '13px ui-monospace,monospace'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText('마우스 모드 · ' + (modes.has('pose') ? '이동=몸·고개  클릭/Space=점프  S=앉기  A/D=기울기  Q/E=손 들기  W=양손  O=팔 벌리기  C=손뼉' : '이동=손  누르기=집기  F=주먹'), 10, H - 10); };

    km.start = async function(){
      if (mouseMode) { status(''); km.running = true; lastVideoTime = -1; km.emit('session:start', { activity: km.activity, modes: [...modes], ua: 'mouse-mode', W, H }); raf = requestAnimationFrame(loop); return; }
      status('카메라 여는 중…');
      try { video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: W, height: H, facingMode: 'user' }, audio: false }); await video.play(); }
      catch (e) { const err = new Error(e && e.name === 'NotAllowedError' ? '카메라 사용이 허용되지 않았어요. 주소창 왼쪽 자물쇠에서 카메라를 「허용」으로 바꿔 주세요.'
          : e && e.name === 'NotFoundError' ? '이 기기에서 카메라를 찾지 못했어요.' : '카메라를 열 수 없어요. (' + (e && e.name || e) + ')');
        err.cause = e; km.emit('error', { kind: 'camera', message: err.message, score: 0 }); throw err; }
      try { await loadModels(); } catch (e) { km.emit('error', { kind: 'model', message: String(e), score: 0 }); throw new Error('인식 모델을 불러오지 못했어요. 인터넷(모델 서버) 연결을 확인해 주세요.'); }
      status(''); km.running = true; lastVideoTime = -1;
      km.emit('session:start', { activity: km.activity, modes: [...modes], ua: navigator.userAgent, W, H }); mountRangeButton(); raf = requestAnimationFrame(loop);
    };
    km.stop = function(){ if (km.running) km.emit('session:stop'); km.running = false; if (km._rangeBtn) { km._rangeBtn.remove(); km._rangeBtn = null; } cancelAnimationFrame(raf); if (video.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; } };
    return km;
  }
  window.KMotion = { create, POSE, HAND, POSE_BONES, HAND_BONES, ENGINE_VERSION, ACTION_VERSION, MODEL_VERSION };
})();
