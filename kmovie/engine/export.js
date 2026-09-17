/* ============================================================
   케이무비 내보내기 (KMV_EXPORT) — 설계서 v1 §5
   ------------------------------------------------------------
   kmake/video.js 파이프 확장. H.264 + AAC 48k 스테레오. 화질은 plan(): 원본에 맞게 / 고화질 / 보통(1080p 8Mbps) / 가볍게(720p).
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
  const MUXER_URL = 'vendor/mp4-muxer.js';   // 레포 동봉(5.2.2) — 폴백 로드용
  let busy = false, lastLoud = null;   // lastLoud: 마지막 내보내기의 라우드니스 측정 {lufs,peak,gainDb,target}

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
  async function pickVideoCodec(W, H, bitrate) {
    // 1080p 까지는 레벨 4.0(호환 최우선) · 고화질(20Mbps 넘음)·1440p 는 5.0 · 4K 는 5.1
    const big = W * H > 1920 * 1088, huge = W * H > 2560 * 1440, fat = (bitrate || BITRATE) > 20_000_000;
    const lv = huge ? '33' : (big || fat) ? '32' : '28';
    const list = ['avc1.6400' + lv, 'avc1.4d00' + lv, 'avc1.4200' + lv];
    if (lv !== '33') list.push('avc1.640033');
    list.push(big ? 'vp09.00.51.08' : 'vp09.00.40.08');
    for (const codec of list) {
      try { const r = await VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: bitrate || BITRATE, framerate: 30 }); if (r.supported) return codec; } catch (e) {}
    }
    return null;
  }
  const even = v => Math.max(2, Math.round(v / 2) * 2);
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  /* 타임라인에서 가장 오래 쓰인 영상 원본 — 「원본에 맞게」 의 기준 */
  function mainSource() {
    const P = g.KMV_PROJECT, use = new Map();
    (P.data.V || []).forEach(c => { if (c.gap || !c.media) return; use.set(c.media, (use.get(c.media) || 0) + c.dur); });
    let best = null, bestDur = 0;
    use.forEach((d, id) => { const m = P.media(id); if (m && m.kind === 'video' && m.w && m.h && d > bestDur) { best = m; bestDur = d; } });
    if (!best) return null;
    const src = g.KMV_MEDIA && g.KMV_MEDIA.get(best.id);
    return { id: best.id, name: best.name, w: best.w, h: best.h, bps: (src && src.bps) || 0 };
  }
  /* 화질 고르기 → { id, name, w, h, bitrate, note }.  id: 'source' | 'high' | 'normal' | 'light' */
  const QUALITIES = [
    { id: 'source', name: '원본에 맞게' }, { id: 'high', name: '고화질' }, { id: 'normal', name: '보통' }, { id: 'light', name: '가볍게' },
  ];
  function plan(id) {
    const P = g.KMV_PROJECT, PW = P.w ? P.w() : P.W, PH = P.h ? P.h() : P.H;
    const shell = !!(g.KMV_SHELL && g.KMV_SHELL.active);
    const ms = mainSource();
    const size = k => ({ w: even(PW * k), h: even(PH * k) });
    const perPx = (w, h, mbps1080) => Math.round(mbps1080 * 1e6 * clampN((w * h) / (1920 * 1080), 0.3, 4.5));
    if (id === 'light') { const z = size(2 / 3); return { id, name: '가볍게', w: z.w, h: z.h, bitrate: perPx(z.w, z.h, 9), note: '파일이 작아요 — 메신저·밴드로 보낼 때' }; }
    if (id === 'high') {
      // 원본이 프로젝트 화면보다 크면(4K 등) 그 크기까지, 아니면 프로젝트 크기 그대로 — 비트레이트를 넉넉히
      let k = 1; if (ms && !shell) { const same = (ms.w >= ms.h) === (PW >= PH); if (same) k = clampN(Math.min(ms.w / PW, ms.h / PH), 1, 2); }
      const z = size(k); return { id, name: '고화질', w: z.w, h: z.h, bitrate: perPx(z.w, z.h, 20), note: '가장 선명해요 — 큰 화면·학교 누리집·보관용. 파일이 커요' };
    }
    if (id === 'source') {
      let k = 1, bitrate = perPx(PW, PH, 12), note = '영상 원본이 없어 화면 크기 그대로예요';
      if (ms) {
        const same = (ms.w >= ms.h) === (PW >= PH);
        if (same && !shell) k = clampN(Math.min(ms.w / PW, ms.h / PH), 1 / 3, 2);
        const z0 = size(k);
        // 다시 압축하면 조금씩 잃는다 → 원본 비트레이트보다 조금 넉넉히(1.15배), 너무 낮거나 높지 않게
        bitrate = ms.bps ? clampN(Math.round(ms.bps * 1.15), perPx(z0.w, z0.h, 3), perPx(z0.w, z0.h, 40)) : perPx(z0.w, z0.h, 12);
        note = '넣은 영상과 같은 크기·같은 선명도 (' + ms.w + '×' + ms.h + (ms.bps ? ' · ' + (ms.bps / 1e6).toFixed(1) + 'Mbps' : '') + ')';
      }
      const z = size(k); return { id, name: '원본에 맞게', w: z.w, h: z.h, bitrate, note };
    }
    return { id: 'normal', name: '보통', w: PW, h: PH, bitrate: perPx(PW, PH, 8), note: '지금까지 쓰던 기본 — 대부분 이걸로 충분해요' };
  }
  /* 예상 파일 크기(MB) — 영상 비트레이트 + 소리 192kbps */
  function estimateMB(pl) { const P = g.KMV_PROJECT, sec = P.total() / P.FPS; return (pl.bitrate + 192000) * sec / 8 / 1048576; }

  /* opt: { onProgress(p, label), fileName } */
  async function exportMP4(opt) {
    opt = opt || {};
    if (busy) return;
    if (typeof VideoEncoder === 'undefined') throw new Error('이 브라우저는 영상 저장을 지원하지 않아요 (크롬·엣지 최신 버전)');
    const P = g.KMV_PROJECT, FPS = P.FPS;
    const PL = opt.width && opt.height ? { w: even(opt.width), h: even(opt.height), bitrate: opt.bitrate || BITRATE } : plan(opt.quality || 'normal');
    const W = PL.w, H = PL.h, VBR = PL.bitrate;
    const total = P.total();
    if (!total) throw new Error('타임라인이 비어 있어요');
    const prog = opt.onProgress || (() => {});
    const sig = opt.signal || null;                                    // AbortSignal — 취소 버튼
    const aborted = () => { if (sig && sig.aborted) { const e = new Error('내보내기를 취소했어요'); e.name = 'AbortError'; throw e; } };
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
      const vcodec = await pickVideoCodec(W, H, VBR);
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
      encoder.configure({ codec: vcodec, width: W, height: H, bitrate: VBR, framerate: FPS, latencyMode: 'quality' });

      if (wantAudio) {
        // -14 LUFS 맞춤: 1패스로 믹스를 재고(영상 없이 소리만이라 빠르다) 게인 하나를 정한다 — 전 구간 같은 게인(압축 아님)
        let lgain = 1; lastLoud = null;
        const LC = P.data.audio && P.data.audio.loudness;
        if (LC && LC.on && g.KMV_LOUD) {
          prog(0, '소리 크기 재는 중');
          const mt = g.KMV_LOUD.meter(SRr, 2);
          await g.KMV_AUDIO.renderMix(total, async (mix, startFrame) => { aborted(); mt.push([mix.getChannelData(0), mix.numberOfChannels > 1 ? mix.getChannelData(1) : mix.getChannelData(0)]); });
          const r = mt.result(), gdb = g.KMV_LOUD.gainDb(r.lufs, r.peak, LC.target);
          lgain = Math.pow(10, gdb / 20); lastLoud = { lufs: r.lufs, peak: r.peak, gainDb: gdb, target: LC.target == null ? -14 : LC.target };
        }
        aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: e => { encErr = e; } });
        aenc.configure({ codec: 'mp4a.40.2', sampleRate: SRr, numberOfChannels: 2, bitrate: 192000 });
        await g.KMV_AUDIO.renderMix(total, async (mix, startFrame) => {
          if (encErr) throw encErr; aborted();
          const base = Math.round(startFrame / FPS * SRr);
          const CH = 4800, L = mix.length, c0 = mix.getChannelData(0), c1 = mix.numberOfChannels > 1 ? mix.getChannelData(1) : c0;
          for (let s = 0; s < L; s += CH) {
            const n = Math.min(CH, L - s), data = new Float32Array(n * 2);
            data.set(c0.subarray(s, s + n), 0); data.set(c1.subarray(s, s + n), n);
            if (lgain !== 1) for (let i = 0; i < data.length; i++) data[i] *= lgain;
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
        if (encErr) throw encErr; aborted();
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
      aborted();
      prog(1, '마무리 중');
      await encoder.flush();
      if (encErr) throw encErr;
      muxer.finalize();
      if (exactSrc) await SH.exactEnd();
      if (shellSave) { await shellSave.close(); shellSave = null; return { toDisk: true, name, seconds: total / FPS, codec: vcodec, w: W, h: H, bitrate: VBR, exact: true }; }
      if (toDisk) { await stream.close(); stream = null; return { toDisk: true, name, seconds: total / FPS, codec: vcodec, w: W, h: H, bitrate: VBR }; }
      const blob = new Blob([target.buffer], { type: 'video/mp4' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return { toDisk: false, name, seconds: total / FPS, codec: vcodec, w: W, h: H, bitrate: VBR };
    } finally {
      try { if (encoder && encoder.state !== 'closed') encoder.close(); } catch (e) {}
      try { if (aenc && aenc.state !== 'closed') aenc.close(); } catch (e) {}
      try { if (stream) await stream.abort(); } catch (e) {}
      try { if (shellSave) await shellSave.abort(); } catch (e) {}
      try { if (SH) await SH.exactEnd(); } catch (e) {}
      busy = false;
    }
  }

  g.KMV_EXPORT = { exportMP4, isBusy: () => busy, lastLoud: () => lastLoud, plan, estimateMB, mainSource, QUALITIES, _pickVideoCodec: pickVideoCodec };
})(typeof window !== 'undefined' ? window : globalThis);
