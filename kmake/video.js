/* ============================================================
   케이메이커 영상 엔진 (KM_VIDEO) — 영상 확장 2단계 (2026-07-03)
   ------------------------------------------------------------
   씬 시퀀스(scene.js) × 모션 엔진 오프라인 API(motion.js)로
   프레임을 결정적으로 그려 WebCodecs(VideoEncoder, H.264)로
   인코딩하고 mp4-muxer로 묶는다. 전부 브라우저 안 — 서버 0원,
   실시간 녹화가 아니라서 프레임 드랍 0.

   파이프라인 (씬마다):
     KM_SCENE.eachScene → 캔버스를 내보내기 해상도로 줌 →
     [모션배경 오프라인 드라이버] + [fabric 정지+애니 층] + [FX 오버레이]
     → 합성 캔버스 → VideoFrame → encoder (배압 관리) → muxer

   전환: "나가는 씬 위덮기" 방식 — 씬 i의 마지막 프레임을 비트맵으로
   잡아두고, 씬 i+1의 첫 0.6초 동안 그 위에 페이드/슬라이드/줌으로
   걷어낸다. 라이브 캔버스 1개로 크로스 전환이 성립하는 구조.

   폴백: WebCodecs 미지원(구형 사파리 등)이면 안내 후 중단.
   (MediaRecorder 실시간 녹화 폴백은 품질 타협이라 보류 — STATUS)
   ============================================================ */
(function () {
  'use strict';

  var FPS = 30;
  var TRANS_DUR = 0.6;          // 전환 길이(초) — 다음 씬 시간에 흡수
  var TARGET_SHORT = 1080;      // 짧은 변 목표 해상도
  var BITRATE = 8_000_000;
  var KEY_EVERY = 60;           // 키프레임 간격(프레임)
  var QUEUE_MAX = 8;            // 인코더 배압 상한

  var busy = false;

  function even(n) { return Math.max(2, 2 * Math.round(n / 2)); }

  function loadMuxer() {
    return new Promise(function (res, rej) {
      if (window.Mp4Muxer) return res();
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js';
      s.onload = res; s.onerror = function () { rej(new Error('MP4 모듈을 불러올 수 없어요 — 네트워크를 확인해 주세요')); };
      document.head.appendChild(s);
    });
  }

  /* ---------- 진행 오버레이 ---------- */
  function progressUI() {
    var el = document.getElementById('vidProgress');
    return {
      show: function () { el.classList.remove('hidden'); this.set(0, ''); },
      set: function (p, label) {
        el.querySelector('.vp-bar i').style.width = Math.round(p * 100) + '%';
        el.querySelector('.vp-pct').textContent = Math.round(p * 100) + '%';
        el.querySelector('.vp-label').textContent = label || '';
      },
      hide: function () { el.classList.add('hidden'); },
    };
  }

  function waitQueue(encoder) {
    return new Promise(function (res) {
      if (encoder.encodeQueueSize <= QUEUE_MAX) return res();
      var iv = setInterval(function () {
        if (encoder.encodeQueueSize <= QUEUE_MAX) { clearInterval(iv); res(); }
      }, 4);
    });
  }

  /* ---------- 전환 합성 (나가는 프레임을 새 씬 위에 덮고 걷어냄) ---------- */
  function drawTransition(ctx, outgoing, kind, p, W, H) { // p: 0→1 (전환 진행)
    ctx.save();
    if (kind === 'fade') {
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(outgoing, 0, 0, W, H);
    } else if (kind === 'slideL') {
      ctx.drawImage(outgoing, -easeInOut(p) * W, 0, W, H);
    } else if (kind === 'zoom') {
      var k = 1 + 0.18 * p;
      ctx.globalAlpha = 1 - p;
      ctx.translate(W / 2, H / 2); ctx.scale(k, k);
      ctx.drawImage(outgoing, -W / 2, -H / 2, W, H);
    }
    ctx.restore();
  }
  function easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

  /* ---------- 본체 ---------- */
  async function exportMP4() {
    if (busy) return;
    if (typeof VideoEncoder === 'undefined') {
      toast('이 브라우저는 영상 저장을 지원하지 않아요 (크롬·엣지 최신 버전을 써주세요)');
      return;
    }
    busy = true;
    var ui = progressUI();
    var cv = canvas; // kmake.js 전역
    var prev = { z: cv.getZoom(), w: cv.getWidth(), h: cv.getHeight() };
    var scale = TARGET_SHORT / Math.min(baseW, baseH);
    var W = even(baseW * scale), H = even(baseH * scale);

    // 합성·부속 캔버스
    var out = document.createElement('canvas'); out.width = W; out.height = H;
    var octx = out.getContext('2d');
    var mbgCv = document.createElement('canvas'); mbgCv.width = W; mbgCv.height = H;
    var mbgCtx = mbgCv.getContext('2d');
    var fxCv = document.createElement('canvas'); fxCv.width = W; fxCv.height = H;

    var totalFrames = 0;
    for (var i = 0; i < KM_SCENE.count(); i++) totalFrames += Math.max(1, Math.round(KM_SCENE.get(i).dur * FPS));
    var doneFrames = 0, frameIdx = 0;

    var encoder = null, muxer = null, encError = null;
    var lastBitmap = null, lastTransition = 'fade';

    try {
      await loadMuxer();
      ui.show();
      cv.discardActiveObject();
      KM_MOTION.suspendBg(true);
      KM_MOTION.fxOverride(fxCv);

      muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: 'avc', width: W, height: H },
        fastStart: 'in-memory',
      });
      encoder = new VideoEncoder({
        output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); },
        error: function (e) { encError = e; },
      });
      encoder.configure({ codec: 'avc1.420028', width: W, height: H, bitrate: BITRATE, framerate: FPS });

      var sceneNo = 0;
      await KM_SCENE.eachScene(async function (i, sc) {
        sceneNo = i;
        // 내보내기 해상도로 줌 (FXR·getBoundingRect가 이 좌표계를 쓴다)
        cv.setZoom(scale); cv.setDimensions({ width: W, height: H });

        var mbg = KM_MOTION.offlineMbg(sc.motionBg, W, H);
        var frames = Math.max(1, Math.round(sc.dur * FPS));
        KM_MOTION.offlineBegin();

        for (var f = 0; f < frames; f++) {
          if (encError) throw encError;
          var t = f / FPS;
          KM_MOTION.offlineFrame(t);

          // 합성: 바닥색 → 모션배경 → fabric → FX
          octx.globalAlpha = 1;
          octx.fillStyle = (mbg && mbg.base) || '#ffffff';
          octx.fillRect(0, 0, W, H);
          if (mbg) { mbg.frame(mbgCtx, t, 1 / FPS); octx.drawImage(mbgCv, 0, 0, W, H); }
          octx.drawImage(cv.lowerCanvasEl, 0, 0, W, H);
          octx.drawImage(fxCv, 0, 0, W, H);

          // 전환: 이전 씬 마지막 프레임을 걷어내기
          if (i > 0 && lastBitmap && lastTransition !== 'none' && t < TRANS_DUR) {
            drawTransition(octx, lastBitmap, lastTransition, t / TRANS_DUR, W, H);
          }

          var usec = Math.round(frameIdx * 1e6 / FPS);
          var vf = new VideoFrame(out, { timestamp: usec, duration: Math.round(1e6 / FPS) });
          await waitQueue(encoder);
          encoder.encode(vf, { keyFrame: frameIdx % KEY_EVERY === 0 });
          vf.close();

          frameIdx++; doneFrames++;
          if (doneFrames % 6 === 0 || f === frames - 1) {
            ui.set(doneFrames / totalFrames, '씬 ' + (i + 1) + '/' + KM_SCENE.count() + ' 렌더링 중');
            await new Promise(function (r) { setTimeout(r, 0); }); // UI 숨통
          }
        }

        // 다음 씬 전환용으로 마지막 프레임 보관
        if (lastBitmap && lastBitmap.close) lastBitmap.close();
        lastBitmap = await createImageBitmap(out);
        lastTransition = sc.transition || 'fade';
        KM_MOTION.offlineEnd();
      });

      ui.set(1, '인코딩 마무리 중');
      await encoder.flush();
      if (encError) throw encError;
      muxer.finalize();

      var blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = '케이메이커.mp4'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      toast('영상 저장 완료 (' + Math.round(totalFrames / FPS) + '초 · ' + W + '×' + H + ')');
    } catch (e) {
      console.error('[KM_VIDEO]', e);
      toast((e && e.message) ? e.message : '영상 저장에 실패했어요');
    } finally {
      try { if (encoder && encoder.state !== 'closed') encoder.close(); } catch (e2) {}
      if (lastBitmap && lastBitmap.close) lastBitmap.close();
      KM_MOTION.offlineEnd();
      KM_MOTION.fxOverride(null);
      cv.setZoom(prev.z); cv.setDimensions({ width: prev.w, height: prev.h });
      KM_MOTION.suspendBg(false);
      cv.requestRenderAll();
      ui.hide();
      busy = false;
    }
  }

  window.KM_VIDEO = { exportMP4: exportMP4, FPS: FPS, TRANS_DUR: TRANS_DUR };
})();
