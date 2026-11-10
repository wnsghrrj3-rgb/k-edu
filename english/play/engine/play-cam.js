/* ============================================================
 * 영어 놀이터 — 몸 활동(PlayCam) : 웹캠 좌/우 기울이기
 *   외부 모델 없이 프레임 차이(움직임 에너지)만 본다 — 태블릿 전면 카메라에서 아이가 몸을 왼쪽/오른쪽으로 기울이면
 *   그쪽 반에 움직임이 몰린다. 영상은 거울처럼 뒤집어 보여 주고 판정도 거울 좌표(화면 왼쪽 = 아이의 왼쪽).
 *   카메라 없음·거부 = 탭 대체(좌/우 그림 누르기). 영상은 어디에도 저장·전송하지 않는다(화면 안 캔버스뿐).
 *   사용: PlayCam.start(videoEl) → Promise(bool) / PlayCam.pick({onSide}) → 한 판 판정 / PlayCam.move({timeout}) → 움직였나(동물 댄스) / PlayCam.stop()
 * ============================================================ */
(function (g) {
  'use strict';
  var video = null, stream = null, cv = null, ctx = null, prev = null, raf = 0, W = 96, H = 72;
  var listeners = [], energy = { l: 0, r: 0 };

  function loop() {
    if (!video || video.readyState < 2) { raf = requestAnimationFrame(loop); return; }
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -W, 0, W, H); ctx.restore();   /* 거울 */
    var cur = ctx.getImageData(0, 0, W, H).data;
    if (prev) {
      var l = 0, r = 0, half = W / 2;
      for (var y = 0; y < H; y += 2) for (var x = 0; x < W; x += 2) {
        var i = (y * W + x) * 4;
        var d = Math.abs(cur[i] - prev[i]) + Math.abs(cur[i + 1] - prev[i + 1]) + Math.abs(cur[i + 2] - prev[i + 2]);
        if (d > 70) { if (x < half) l++; else r++; }
      }
      energy.l = energy.l * 0.6 + l * 0.4; energy.r = energy.r * 0.6 + r * 0.4;
      listeners.forEach(function (f) { f(energy); });
    }
    prev = cur;
    raf = requestAnimationFrame(loop);
  }

  var PlayCam = {
    available: function () { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); },
    running: function () { return !!stream; },
    start: function (videoEl) {
      video = videoEl;
      if (!this.available()) return Promise.resolve(false);
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false })
        .then(function (s) {
          stream = s; video.srcObject = s; video.muted = true; video.playsInline = true;
          cv = document.createElement('canvas'); cv.width = W; cv.height = H; ctx = cv.getContext('2d', { willReadFrequently: true });
          return video.play().then(function () { raf = requestAnimationFrame(loop); return true; }).catch(function () { return false; });
        })
        .catch(function () { return false; });
    },
    stop: function () {
      cancelAnimationFrame(raf); raf = 0; listeners = []; prev = null;
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      if (video) video.srcObject = null;
    },
    /* 한 판: 잠깐(0.7초) 기준을 잡고, 한쪽 에너지가 다른 쪽의 2.2배↑ 이고 문턱을 넘긴 상태가 0.45초 이어지면 그쪽.
       반환 Promise('left'|'right'|null) — timeout(ms) 안에 못 고르면 null */
    pick: function (opt) {
      opt = opt || {};
      return new Promise(function (resolve) {
        if (!stream) return resolve(null);
        var t0 = Date.now(), since = 0, side = null, done = false, thr = opt.threshold || 60;
        function fin(v) { if (done) return; done = true; listeners = listeners.filter(function (f) { return f !== on; }); resolve(v); }
        function on(e) {
          var now = Date.now();
          if (now - t0 < 700) return;                           /* 기준 잡기 */
          var s = null;
          if (e.l > thr && e.l > e.r * 2.2) s = 'left'; else if (e.r > thr && e.r > e.l * 2.2) s = 'right';
          if (opt.onLevel) opt.onLevel(e, s);
          if (s && s === side) { if (now - since > 450) fin(s); }
          else { side = s; since = now; }
          if (now - t0 > (opt.timeout || 9000)) fin(null);
        }
        listeners.push(on);
      });
    }
    ,
    /* 움직였나(동물 댄스 #10) — 기준을 0.5초 잡고, 양쪽 움직임 합이 문턱을 넘긴 상태가 0.4초 이어지면 true. timeout 안에 없으면 false.
       어떤 동작인지는 가리지 않는다(카메라로는 「움직였다」까지만 — 동작은 카드로 고른다) */
    move: function (opt) {
      opt = opt || {};
      return new Promise(function (resolve) {
        if (!stream) return resolve(false);
        var t0 = Date.now(), since = 0, done = false, thr = opt.threshold || 90;
        function fin(v) { if (done) return; done = true; listeners = listeners.filter(function (f) { return f !== on; }); resolve(v); }
        function on(e) {
          var now = Date.now(); if (now - t0 < 500) return;
          if (e.l + e.r > thr) { if (!since) since = now; else if (now - since > 400) fin(true); } else since = 0;
          if (now - t0 > (opt.timeout || 4000)) fin(false);
        }
        listeners.push(on);
      });
    }
  };
  g.PlayCam = PlayCam;
})(window);
