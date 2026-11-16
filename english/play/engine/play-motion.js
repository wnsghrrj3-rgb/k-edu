/* ============================================================
 * 영어 놀이터 — 몸 장면(PlayMotion) (모션 사건 설계 v1 §2 · WM1)
 *   몸으로 하는 장면(오늘의 사건 앞머리 30~60초)이 쓰는 얇은 층. 놀이터 쪽은 KMotion 을 직접 부르지 않는다.
 *   두 가지 손이 같은 두 알림을 낸다 — 장면 코드는 지금 어느 손인지 모른다.
 *     'hands' : KMotion(MediaPipe 손 21관절 · 떨림 보정 · 거울 좌표)의 손바닥 가운데
 *     'touch' : 손가락(포인터). 카메라 없음 · 거부 · 모델 못 받음 · 느림 · 아이가 손가락을 고름
 *   손가락은 'hands' 일 때도 늘 같이 된다(손이 안 보일 때 손가락으로 해도 이어진다 — 설계 §3). 다만 그때는 누르고 있는 동안만(지나가는 마우스가 카메라 손과 다투지 않게).
 *   두 손이 보이면 따라가던 손을 계속 따라간다(두 손을 흔들어도 손 자리가 이 손 저 손으로 튀지 않는다).
 *
 *   PlayMotion.start({ video, prefer, shakeZone })  → Promise('hands' | 'touch')
 *       prefer 'touch' = 카메라를 열지 않는다 · shakeZone(x, y) = 손가락이 이 자리에서 문지를 때만 흔들기로 센다(없으면 어디서나)
 *       한 번 거부되면 이 화면이 열려 있는 동안 다시 묻지 않는다(저장 0 — 기억은 이 화면 안에서만).
 *   PlayMotion.onHand(fn)   — fn({ x, y, seen }) 화면 비율 0~1(거울). 카메라 가운데 CONF.zone 만큼을 화면 전체로 늘린다.
 *                             손이 사라지면 한 번 { seen:false }(마지막 자리 그대로).
 *   PlayMotion.onShake(fn)  — fn(세기 0~1). 좌우 방향 바뀜이 이어지는 동안 계속 · 멈추면 0 을 한 번.
 *                             KMotion 의 hand:wave 는 한 번만 울려서 쓰지 않고 손 x 의 방향 바뀜을 직접 센다.
 *   PlayMotion.onMode(fn)   — fn('hands' | 'touch') 느려서 손가락으로 바뀔 때(알림 글 0 — 장면은 손 그림만 바꾼다)
 *   PlayMotion.stop()       — 카메라와 추론을 끈다(카메라 불이 꺼진다). 장면이 끝나면 꼭 부른다. 화면을 떠나도 저절로.
 *   PlayMotion.feed(p)      — 손 자리 하나를 넣는다(두 손이 다 이 길로 들어온다 · 하네스도 이 길로).
 *   영상은 기기 안에서만 처리되고 어디에도 저장·전송하지 않는다.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 해 보고 바꾼다 ── */
  var CONF = {
    zone: 0.7,                 /* 카메라 가운데 이만큼(70%)을 화면 전체로 — 팔을 끝까지 안 뻗어도 가장자리에 닿게 */
    inferEvery: 2,             /* 손 추적은 두 프레임에 한 번(설계 §1-8) */
    lostMs: 450,               /* 손이 이만큼 안 보이면 seen:false */
    shake: {
      minAmp: 0.04,            /* 방향이 바뀌기 전까지 움직인 너비(화면 너비 비율) — 이보다 작은 떨림은 안 센다 */
      maxGapMs: 900,           /* 방향 바뀜 사이가 이보다 길면 이어진 흔들기가 아니다 */
      step: 0.3,               /* 방향이 한 번 바뀔 때 세기가 오르는 만큼 */
      decay: 0.9,              /* 방향 바뀜이 없을 때 1초에 줄어드는 세기 */
      emitMs: 50               /* 흔드는 동안 세기를 알리는 간격 */
    },
    slow: { graceMs: 3000, fps: 10, lagMs: 350, holdMs: 2500 },   /* 켜고 이만큼 지난 뒤 · 추론이 초당 이보다 적거나 지연이 이보다 길게 holdMs 이어지면 손가락으로 */
    modelBase: '/kmotion/vendor/models/',
    canvas: [320, 240]         /* KMotion 이 쓰는 거울 캔버스 크기 */
  };

  var hands = [], shakes = [], modes = [];
  var mode = null, km = null, denied = false, running = false, startTok = 0;
  var last = { x: 0.5, y: 0.5, seen: false, t: 0 }, lostT = 0;
  var opt = {}, ptrOn = false, mouseOverlay = null;

  function now() { return (g.performance && g.performance.now) ? g.performance.now() : Date.now(); }
  function call(list, v) { list.slice().forEach(function (f) { try { f(v); } catch (e) {} }); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ── 흔들기 판정 — 손 x 의 방향 바뀜을 센다(한 번 휙 움직임으로는 안 오른다 · 좌우 되풀이면 오른다) ── */
  function shaker(conf) {
    conf = conf || CONF.shake;
    var dir = 0, ext = null, lastTurn = -1e9, level = 0, lastT = null, lastEmit = -1e9, on = false;
    return {
      level: function () { return level; },
      reset: function () { dir = 0; ext = null; lastTurn = -1e9; level = 0; lastT = null; on = false; },
      /* x 하나를 넣으면 지금 세기(알릴 때만 숫자, 아니면 null)를 돌려준다 */
      push: function (x, t) {
        if (lastT != null) level = Math.max(0, level - conf.decay * Math.max(0, t - lastT) / 1000);
        lastT = t;
        if (ext == null) { ext = x; return null; }
        var d = x - ext;
        if (dir === 0) { if (Math.abs(d) >= conf.minAmp) { dir = d > 0 ? 1 : -1; ext = x; } }
        else if (d * dir > 0) ext = x;                                    /* 같은 쪽으로 더 갔다 — 끝 자리를 옮긴다 */
        else if (Math.abs(d) >= conf.minAmp) {                            /* 반대쪽으로 충분히 왔다 = 방향이 바뀌었다 */
          if (t - lastTurn <= conf.maxGapMs) level = Math.min(1, level + conf.step);
          lastTurn = t; dir = -dir; ext = x;
        }
        if (level > 0) { on = true; if (t - lastEmit >= conf.emitMs) { lastEmit = t; return level; } return null; }
        if (on) { on = false; return 0; }
        return null;
      },
      /* 손이 멈춰 있어도 세기는 줄어든다 — 시간만 흘려 보낸다 */
      tick: function (t) {
        if (lastT == null || level <= 0) { if (on) { on = false; return 0; } return null; }
        level = Math.max(0, level - conf.decay * Math.max(0, t - lastT) / 1000); lastT = t;
        if (level > 0) { if (t - lastEmit >= conf.emitMs) { lastEmit = t; return level; } return null; }
        on = false; return 0;
      }
    };
  }
  var sh = shaker();

  /* 손 자리 하나 — 두 손(카메라 · 손가락)이 다 여기로 */
  function feed(p) {
    var t = p.t != null ? p.t : now();
    if (p.seen === false) {
      if (last.seen) { last.seen = false; call(hands, { x: last.x, y: last.y, seen: false }); }
      var v0 = sh.tick(t); if (v0 != null) call(shakes, v0);
      return;
    }
    var x = clamp01(p.x), y = clamp01(p.y);
    last = { x: x, y: y, seen: true, t: t }; lostT = t;
    call(hands, { x: x, y: y, seen: true });
    if (p.shake !== false) { var v = sh.push(x, t); if (v != null) call(shakes, v); }
    else { var v1 = sh.tick(t); if (v1 != null) call(shakes, v1); }
  }

  /* ── 손가락 — 포인터 자리 = 손 자리. 누른 채 문지르면 흔들기(shakeZone 안에서만) ── */
  var ptrDown = false;
  function ptXY(e) { var W = g.innerWidth || 1, H = g.innerHeight || 1; return { x: e.clientX / W, y: e.clientY / H }; }
  function onPtr(e) {
    if (!running) return;
    if (e.type === 'pointerdown') ptrDown = true;
    var p = ptXY(e), touch = e.pointerType === 'touch' || e.pointerType === 'pen';
    if (e.type === 'pointerup' || e.type === 'pointercancel') { ptrDown = false; if (touch) feed({ seen: false }); return; }
    if (!ptrDown && (touch || mode === 'hands')) return;                               /* 손가락은 닿아 있을 때만 · 손 추적 중에는 마우스도 누르고 있을 때만 */
    var zone = !opt.shakeZone || opt.shakeZone(p.x, p.y);
    feed({ x: p.x, y: p.y, shake: ptrDown && zone });
  }
  function ptrAttach() {
    if (ptrOn || !g.addEventListener) return; ptrOn = true;
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function (k) { g.addEventListener(k, onPtr, { passive: true }); });
  }
  function ptrDetach() {
    if (!ptrOn) return; ptrOn = false; ptrDown = false;
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function (k) { g.removeEventListener(k, onPtr); });
  }

  /* ── 손 추적(KMotion) ── */
  var slowSince = 0, startedAt = 0, lostTimer = 0, camHand = null;
  function mouseMode() { try { return /[?&]mouse(=|&|$)/.test(g.location.search); } catch (e) { return false; } }
  function zoneMap(v) { var z = CONF.zone, a = (1 - z) / 2; return clamp01((v - a) / z); }
  function onFrame(e) {
    if (!running || !km) return;
    var t = now(), hs = (e.actions && e.actions.hands) || [], best = null, bd = 1e9, stick = camHand && t - camHand.t < CONF.lostMs;
    for (var i = 0; i < hs.length; i++) { var h = hs[i]; if (!h || !h.center) continue;
      var nx = h.center.x / km.W, ny = h.center.y / km.H;
      if (!km.mouse) { nx = zoneMap(nx); ny = zoneMap(ny); }                               /* 마우스 모드는 이미 화면 자리 */
      /* 따라가던 손이 있으면 그 손(가장 가까운 것) · 없으면 가장 크게(가까이) 보이는 손 */
      var d = stick ? Math.hypot(nx - camHand.x, ny - camHand.y) : -(h.span || 0);
      if (d < bd) { bd = d; best = { x: nx, y: ny, t: t }; } }
    if (best) { camHand = best; feed(best); }
    /* 느림 판정 — 켜고 조금 지난 뒤, 추론이 너무 드물거나 늦게 이어지면 손가락으로(마우스 모드 제외) */
    if (!km.mouse && t - startedAt > CONF.slow.graceMs) {
      var slow = (km.fps && km.fps < CONF.slow.fps) || (e.lagMs != null && e.lagMs > CONF.slow.lagMs);
      if (slow) { if (!slowSince) slowSince = t; else if (t - slowSince > CONF.slow.holdMs) toTouch(); }
      else slowSince = 0;
    }
  }
  function lostLoop() {
    if (!running) return;
    var t = now();
    if (last.seen && t - lostT > CONF.lostMs) feed({ seen: false, t: t });
    else if (!last.seen) { var v = sh.tick(t); if (v != null) call(shakes, v); }
    lostTimer = setTimeout(lostLoop, 120);
  }
  function kmOff() {
    if (km) { try { km.stop(); } catch (e) {} km = null; }
    if (mouseOverlay) { try { mouseOverlay.remove(); } catch (e) {} mouseOverlay = null; }
  }
  function toTouch() { if (mode === 'touch') return; kmOff(); mode = 'touch'; ptrAttach(); call(modes, 'touch'); }

  function start(o) {
    stop();
    opt = o || {}; running = true; startedAt = now(); slowSince = 0; camHand = null; sh.reset(); last = { x: 0.5, y: 0.5, seen: false, t: 0 };
    var tok = ++startTok;
    lostLoop();
    var useCam = opt.prefer !== 'touch' && !denied && g.KMotion && (mouseMode() || (g.navigator && g.navigator.mediaDevices && g.navigator.mediaDevices.getUserMedia));
    if (!useCam) { mode = 'touch'; ptrAttach(); return Promise.resolve('touch'); }
    var doc = g.document, cv = doc.createElement('canvas'); cv.width = CONF.canvas[0]; cv.height = CONF.canvas[1];
    var mm = mouseMode();
    if (mm) {                                                                                 /* 마우스 모드: 가짜 손이 화면 전체의 마우스를 따르게 — 보이지 않는 캔버스를 깐다 */
      cv.setAttribute('aria-hidden', 'true'); cv.className = 'pm-mouse';
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;opacity:0;z-index:3;touch-action:none';
      doc.body.appendChild(cv); mouseOverlay = cv;
    }
    try {
      km = g.KMotion.create({ video: opt.video, canvas: cv, modes: ['hands'], activity: 'en-play-shake', numHands: 2, inferEvery: CONF.inferEvery, modelBase: CONF.modelBase, rangeButton: false });
    } catch (e) { km = null; }
    if (!km) { mode = 'touch'; ptrAttach(); return Promise.resolve('touch'); }
    km.on('frame', onFrame);
    var k = km;
    return k.start().then(function () {
      if (tok !== startTok || !running) { try { k.stop(); } catch (e) {} return mode || 'touch'; }
      mode = 'hands'; if (!mm) ptrAttach(); return 'hands';
    }, function (err) {
      try { k.stop(); } catch (e) {}                                                          /* 열린 카메라가 있으면 닫는다 */
      if (km === k) km = null;
      if (mouseOverlay) { try { mouseOverlay.remove(); } catch (e) {} mouseOverlay = null; }
      if (err && err.cause) denied = true;                                                   /* 카메라를 못 열었다(거부 · 없음 · 다른 앱이 씀) — 이 화면에서는 다시 묻지 않는다. 모델을 못 받은 것은 다음에 다시 해 본다 */
      if (tok !== startTok || !running) return 'touch';
      mode = 'touch'; ptrAttach(); return 'touch';
    });
  }

  function stop() {
    startTok++;
    var was = running; running = false;
    kmOff(); ptrDetach(); clearTimeout(lostTimer);
    if (was && last.seen) { last.seen = false; call(hands, { x: last.x, y: last.y, seen: false }); }
    if (sh.level() > 0) { sh.reset(); call(shakes, 0); }
    mode = null;
  }
  function sub(list) { return function (fn) { list.push(fn); return function () { var i = list.indexOf(fn); if (i >= 0) list.splice(i, 1); }; }; }

  if (g.addEventListener) {
    g.addEventListener('pagehide', function () { stop(); });
    if (g.document) g.document.addEventListener('visibilitychange', function () { if (g.document.visibilityState === 'hidden' && running && mode === 'hands') toTouch(); });
  }

  g.PlayMotion = {
    CONF: CONF,
    start: start, stop: stop, feed: feed,
    onHand: sub(hands), onShake: sub(shakes), onMode: sub(modes),
    mode: function () { return mode; },
    running: function () { return running; },
    camera: function () { return !!(km && !km.mouse && km.running); },
    denied: function () { return denied; },
    shaker: shaker,
    _clear: function () { hands.length = 0; shakes.length = 0; modes.length = 0; }
  };
})(window);
