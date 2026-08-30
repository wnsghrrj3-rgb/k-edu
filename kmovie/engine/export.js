/* ============================================================
   케이무비 내보내기 (KMV_EXPORT) — 설계서 v1 §5
   ------------------------------------------------------------
   kmake/video.js 파이프 확장. 1080p30 H.264 8Mbps + AAC 48k 스테레오.
   · 영상: KMV_RENDER.drawExact(t) 전 프레임 → VideoEncoder (배압 관리)
   · 소리: KMV_AUDIO.renderMix 창 단위 스트리밍 — 15초 믹스가 나올 때마다
     AudioEncoder 에 바로 흘린다 (전체 PCM 미보유, 긴 타임라인 안전).
   · 묶기: mp4-muxer. 파일 저장 창(showSaveFilePicker)이 되면 디스크로 바로
     흘려보내(메모리 0), 아니면 메모리에 모아 다운로드.
   · 데스크톱 껍데기(KMV_SHELL.active): 저장은 껍데기 파일 쓰기(StreamTarget), 원본이 연결된 클립의 프레임은
     프록시 대신 원본(원화질) 파이프에서 — drawExact 가 알아서 바꿔 받는다.
   ============================================================ */
(function (g) {
  'use strict';

  const BITRATE = 8_000_000, KEY_EVERY = 60, QUEUE_MAX = 8;
  const MUXER_URL = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js';
  let busy = false;

  function loadMuxer() {
    return new Promise((res, rej) => {
      if (g.Mp4Muxer) return res();
      const s = document.createElement('script'); s.src = MUXER_URL; s.onload = res;
      s.onerror = () => rej(new Error('MP4 모듈을 불러올 수 없어요 — 네트워크를 확인해 주세요'));
      document.head.appendChild(s);
    });
  }
  function waitQueue(enc) {
    return new Promise(res => { if (enc.encodeQueueSize <= QUEUE_MAX) return res(); const iv = setInterval(() => { if (enc.encodeQueueSize <= QUEUE_MAX) { clearInterval(iv); res(); } }, 4); });
  }
  /* H.264(필모라·프리미어 호환) 우선, 없으면 VP9 (H.264 인코더가 없는 리눅스 크로미움 등) */
  async function pickVideoCodec(W, H) {
    for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.420028', 'vp09.00.40.08']) {
      try { const r = await VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: BITRATE, framerate: 30 }); if (r.supported) return codec; } catch (e) {}
    }
    return null;
  }

  /* opt: { onProgress(p, label), fileName } */
  async function exportMP4(opt) {
    opt = opt || {};
    if (busy) return;
    if (typeof VideoEncoder === 'undefined') throw new Error('이 브라우저는 영상 저장을 지원하지 않아요 (크롬·엣지 최신 버전)');
    const P = g.KMV_PROJECT, FPS = P.FPS, W = P.W, H = P.H;
    const total = P.total();
    if (!total) throw new Error('타임라인이 비어 있어요');
    const prog = opt.onProgress || (() => {});
    busy = true;
    let encoder = null, aenc = null, muxer = null, stream = null, encErr = null;
    const name = opt.fileName || '케이무비.mp4';
    // 저장 창은 사용자 클릭 직후에 열어야 한다 (다른 await 보다 먼저)
    let target = null, toDisk = false, shellSave = null;
    const SH = g.KMV_SHELL && g.KMV_SHELL.active ? g.KMV_SHELL : null;
    if (SH) {
      // 데스크톱 껍데기: 저장 창은 껍데기 것, 쓰기는 mp4-muxer StreamTarget → 파일(메모리 0)
      await loadMuxer();
      try { shellSave = await SH.saveTarget(name); } catch (e) { console.warn('[KMV export] shell save', e); shellSave = null; }
      if (shellSave && shellSave.cancelled) { busy = false; return null; }
      if (shellSave) toDisk = true;
    }
    if (!shellSave && g.showSaveFilePicker) {
      try {
        const fh = await g.showSaveFilePicker({ suggestedName: name, types: [{ description: 'MP4 영상', accept: { 'video/mp4': ['.mp4'] } }] });
        stream = await fh.createWritable(); toDisk = true;
      } catch (e) { if (e && e.name === 'AbortError') { busy = false; return null; } stream = null; }
    }
    try {
      await loadMuxer();
      const vcodec = await pickVideoCodec(W, H);
      if (!vcodec) throw new Error('영상 인코더를 쓸 수 없어요 (크롬·엣지 데스크톱 최신 버전)');
      const isAvc = /^avc/.test(vcodec);
      target = shellSave ? shellSave.target : toDisk ? new g.Mp4Muxer.FileSystemWritableFileStreamTarget(stream) : new g.Mp4Muxer.ArrayBufferTarget();

      // 소리: 15초 창마다 믹스 → 바로 인코드 (전체 PCM 을 들고 있지 않음)
      prog(0, '소리 섞는 중');
      const SRr = g.KMV_AUDIO.SR;
      let acodecOK = false;
      try {
        const sup = await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: SRr, numberOfChannels: 2, bitrate: 192000 });
        acodecOK = !!sup.supported;
      } catch (e) {}
      const wantAudio = acodecOK && (P.data.A1.length || (P.data.A2 && P.data.A2.length) || (P.data.audio && P.data.audio.ambience && P.data.audio.ambience.on && P.data.audio.ambience.src) || (P.data.audio && P.data.audio.sfx && P.data.audio.sfx.on));

      muxer = new g.Mp4Muxer.Muxer({
        target,
        video: { codec: isAvc ? 'avc' : 'vp9', width: W, height: H },
        audio: wantAudio ? { codec: 'aac', sampleRate: SRr, numberOfChannels: 2 } : undefined,
        fastStart: toDisk ? false : 'in-memory',
      });
      encoder = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { encErr = e; } });
      encoder.configure({ codec: vcodec, width: W, height: H, bitrate: BITRATE, framerate: FPS, latencyMode: 'quality' });

      if (wantAudio) {
        aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: e => { encErr = e; } });
        aenc.configure({ codec: 'mp4a.40.2', sampleRate: SRr, numberOfChannels: 2, bitrate: 192000 });
        await g.KMV_AUDIO.renderMix(total, async (mix, startFrame) => {
          if (encErr) throw encErr;
          const base = Math.round(startFrame / FPS * SRr);
          const CH = 4800, L = mix.length, c0 = mix.getChannelData(0), c1 = mix.numberOfChannels > 1 ? mix.getChannelData(1) : c0;
          for (let s = 0; s < L; s += CH) {
            const n = Math.min(CH, L - s), data = new Float32Array(n * 2);
            data.set(c0.subarray(s, s + n), 0); data.set(c1.subarray(s, s + n), n);
            const ad = new AudioData({ format: 'f32-planar', sampleRate: SRr, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((base + s) * 1e6 / SRr), data });
            aenc.encode(ad); ad.close();
            if (aenc.encodeQueueSize > 16) await new Promise(r => setTimeout(r, 2));
          }
          prog(0, '소리 섞는 중 ' + Math.round(startFrame / FPS) + '/' + Math.round(total / FPS) + '초');
        });
        await aenc.flush();
      }

      // 인물 뒤 부품이 있으면 세그 모델을 먼저 세운다 (첫 프레임 지연 흡수)
      if (g.KMV_SEG && P.data.P.some(pt => g.KMV_PARTS && g.KMV_PARTS.behind(pt))) { prog(0, '인물 컷아웃 모델 준비'); await g.KMV_SEG.load(); }
      // 데스크톱 껍데기: 원본이 연결된 클립은 원화질 프레임 파이프로 (drawExact 안에서 KMV_SHELL.exact)
      const exactSrc = !!(SH && SH.anyOrigin());
      if (exactSrc) { SH.exactBegin(); prog(0, '원본 화질로 렌더링 준비'); }
      // 영상 전 프레임
      const cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
      const t0 = performance.now();
      for (let t = 0; t < total; t++) {
        if (encErr) throw encErr;
        await g.KMV_RENDER.drawExact(ctx, W, H, t);
        const vf = new VideoFrame(cv, { timestamp: Math.round(t * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
        await waitQueue(encoder);
        encoder.encode(vf, { keyFrame: t % KEY_EVERY === 0 });
        vf.close();
        if (t % 6 === 0 || t === total - 1) {
          const el = (performance.now() - t0) / 1000, eta = t > 0 ? el / t * (total - t) : 0;
          prog(t / total, (exactSrc ? '원본 화질 렌더링 ' : '렌더링 ') + Math.round(t / FPS) + '/' + Math.round(total / FPS) + '초' + (t > 30 ? ' · 남은 시간 ' + Math.round(eta) + '초' : ''));
          await new Promise(r => setTimeout(r, 0));
        }
      }
      prog(1, '마무리 중');
      await encoder.flush();
      if (encErr) throw encErr;
      muxer.finalize();
      if (exactSrc) await SH.exactEnd();
      if (shellSave) { await shellSave.close(); shellSave = null; return { toDisk: true, name, seconds: total / FPS, codec: vcodec, exact: true }; }
      if (toDisk) { await stream.close(); stream = null; return { toDisk: true, name, seconds: total / FPS, codec: vcodec }; }
      const blob = new Blob([target.buffer], { type: 'video/mp4' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return { toDisk: false, name, seconds: total / FPS, codec: vcodec };
    } finally {
      try { if (encoder && encoder.state !== 'closed') encoder.close(); } catch (e) {}
      try { if (aenc && aenc.state !== 'closed') aenc.close(); } catch (e) {}
      try { if (stream) await stream.abort(); } catch (e) {}
      try { if (shellSave) await shellSave.abort(); } catch (e) {}
      try { if (SH) await SH.exactEnd(); } catch (e) {}
      busy = false;
    }
  }

  g.KMV_EXPORT = { exportMP4, isBusy: () => busy };
})(typeof window !== 'undefined' ? window : globalThis);
