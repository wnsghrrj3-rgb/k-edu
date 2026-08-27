/* ============================================================
   케이무비 미디어 층 (KMV_MEDIA) — 설계서 v1 §5
   ------------------------------------------------------------
   · 디먹스: mp4box.js (H.264 mp4/mov). HEVC·긴 파일은 껍데기 몫 → 안내.
   · 디코드: WebCodecs VideoDecoder. GOP(키프레임) 단위로 풀고 LRU 캐시.
     스크럽은 "최신 요청만" 디코드(중간 요청은 버림) → 가장 가까운 캐시 프레임 즉시, 정확 프레임 후속.
   · 오디오: decodeAudioData 로 트랙 전체 PCM (브라우저판 상한 10분).
   · 분석(백그라운드): 썸네일(1초마다 160×90) · 모션량(프레임 차) · 파형(프레임별 RMS).
   · 사진: ImageBitmap 하나. 회전(폰 세로 영상)은 tkhd matrix 에서 읽는다.
   ============================================================ */
(function (g) {
  'use strict';

  const CACHE_MAX = 150;               // VideoFrame 캐시 상한 (설계서 ≈90, 재생 여유분)
  const THUMB_W = 160, THUMB_H = 90;
  const MAX_FILE = 700 * 1024 * 1024;   // 브라우저판 원본 상한
  const MAX_SEC = 10 * 60;
  const MP4BOX_URL = 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js';

  const SRC = new Map();               // media.id → 런타임 소스
  let mp4boxReady = null;

  function loadMp4box() {
    if (g.MP4Box) return Promise.resolve();
    if (mp4boxReady) return mp4boxReady;
    mp4boxReady = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = MP4BOX_URL; s.onload = res;
      s.onerror = () => rej(new Error('mp4 모듈을 불러올 수 없어요 — 네트워크를 확인해 주세요'));
      document.head.appendChild(s);
    });
    return mp4boxReady;
  }
  function uid(pre) { return pre + Math.random().toString(36).slice(2, 9); }
  function supported() { return typeof VideoDecoder !== 'undefined' && typeof VideoEncoder !== 'undefined'; }

  /* ---------- avcC → VideoDecoder description ---------- */
  function avcDescription(entry) {
    const box = entry.avcC;
    if (!box) return null;
    if (g.DataStream) {
      try {
        const ds = new g.DataStream(undefined, 0, g.DataStream.BIG_ENDIAN);
        box.write(ds);
        return new Uint8Array(ds.buffer, 8);
      } catch (e) { /* 수동 조립으로 */ }
    }
    const parts = [1, box.AVCProfileIndication, box.profile_compatibility, box.AVCLevelIndication, 0xFC | (box.lengthSizeMinusOne & 3), 0xE0 | (box.SPS.length & 31)];
    box.SPS.forEach(s => { parts.push((s.length >> 8) & 255, s.length & 255); s.nalu.forEach(b => parts.push(b)); });
    parts.push(box.PPS.length & 255);
    box.PPS.forEach(s => { parts.push((s.length >> 8) & 255, s.length & 255); s.nalu.forEach(b => parts.push(b)); });
    return new Uint8Array(parts);
  }
  function rotationOf(trak) {
    try {
      const m = Array.from(trak.tkhd.matrix).map(v => v > 0x7fffffff ? v - 0x100000000 : v); // uint32 → 부호 있는 16.16
      const a = m[0], b = m[1], d = m[4];
      if (a === 0 && b > 0) return 90;
      if (a === 0 && b < 0) return 270;
      if (a < 0 && d < 0) return 180;
    } catch (e) {}
    return 0;
  }

  /* ---------- 디먹스 ---------- */
  function demux(buffer) {
    return new Promise((resolve, reject) => {
      const mp4 = g.MP4Box.createFile();
      const out = { samples: [] };
      let track = null, nb = 0, done = false;
      mp4.onError = e => reject(new Error('mp4 를 읽을 수 없어요: ' + e));
      mp4.onReady = info => {
        track = info.videoTracks && info.videoTracks[0];
        if (!track) return reject(new Error('영상 트랙이 없어요'));
        const codec = String(track.codec || '');
        if (/^(hvc1|hev1|hvc|hev)/i.test(codec)) return reject(new Error('HEVC(H.265) 원본은 브라우저판에서 못 읽어요 — 폰 카메라 설정을 "호환성 우선(H.264)"으로 바꾸거나, 데스크톱판(4단계)을 기다려 주세요'));
        if (!/^(avc|vp09|av01)/i.test(codec)) return reject(new Error('지원하지 않는 코덱이에요 (' + codec + ') — H.264 mp4/mov 를 넣어 주세요'));
        nb = track.nb_samples;
        const trak = mp4.getTrackById(track.id);
        out.codec = codec; out.timescale = track.timescale;
        out.w = track.video.width; out.h = track.video.height;
        out.rot = rotationOf(trak);
        out.desc = /^avc/i.test(codec) ? avcDescription(trak.mdia.minf.stbl.stsd.entries[0]) : null;  // vp09·av01 은 description 불필요
        out.hasAudio = !!(info.audioTracks && info.audioTracks.length);
        mp4.setExtractionOptions(track.id, null, { nbSamples: 4000 });
        mp4.start();
      };
      mp4.onSamples = (id, user, samples) => {
        for (const s of samples) out.samples.push(s);
        if (!done && out.samples.length >= nb) { done = true; resolve(out); }
      };
      buffer.fileStart = 0;
      try { mp4.appendBuffer(buffer); mp4.flush(); } catch (e) { return reject(new Error('mp4 구조를 읽는 중 오류: ' + (e.message || e))); }
      setTimeout(() => { if (!done) { if (out.samples.length) { done = true; resolve(out); } else reject(new Error('영상 샘플을 꺼내지 못했어요 (손상되었거나 스트리밍용 mp4일 수 있어요)')); } }, 1500);
    });
  }

  /* ---------- 영상 소스 ---------- */
  class VideoSource {
    constructor(id, dm, audio) {
      this.id = id; this.kind = 'video';
      this.codec = dm.codec; this.desc = dm.desc; this.rot = dm.rot;
      this.w = dm.w; this.h = dm.h; this.audio = audio; // AudioBuffer | null
      const ts = dm.timescale; this.ts = ts;
      // 표시 순서(cts) 정렬. samples 는 디코드 순서(dts)로 들어온다.
      const dec = dm.samples.map((s, i) => ({ i, cts: s.cts, dur: s.duration, key: !!s.is_sync, data: s.data, us: Math.round(s.cts * 1e6 / ts) }));
      const pres = dec.slice().sort((a, b) => a.cts - b.cts);
      this.dec = dec; this.pres = pres;
      this.presOfUs = new Map(); pres.forEach((s, k) => this.presOfUs.set(s.us, k));
      const presIdxOfDec = new Array(dec.length); pres.forEach((s, k) => presIdxOfDec[s.i] = k);
      this.gops = [];
      dec.forEach((s, i) => { if (s.key) this.gops.push({ dec: i, first: presIdxOfDec[i] }); });
      if (!this.gops.length) this.gops.push({ dec: 0, first: 0 });
      this.gops[0].first = 0;
      this.gops.forEach((gp, k) => { gp.decEnd = k + 1 < this.gops.length ? this.gops[k + 1].dec : dec.length; gp.last = k + 1 < this.gops.length ? this.gops[k + 1].first - 1 : pres.length - 1; });
      this.frames = pres.length;
      const span = (pres[pres.length - 1].cts + pres[pres.length - 1].dur - pres[0].cts) / ts;
      let fps = pres.length / Math.max(span, 1e-6);
      this.fps = Math.abs(fps - Math.round(fps)) < 0.06 ? Math.round(fps) : Math.round(fps * 100) / 100;
      this.durSec = span;
      this.cache = new Map();
      this.decoder = null; this.chain = Promise.resolve(); this.latest = -1;
      this.thumbs = []; this.thumbEvery = Math.max(1, Math.round(this.fps)); this.motion = null; this.peaks = null;
      this.analyzed = false; this.analyzing = false;
    }
    dispose() { this.cache.forEach(f => { try { f.close(); } catch (e) {} }); this.cache.clear(); try { if (this.decoder) this.decoder.close(); } catch (e) {} this.thumbs.forEach(b => b.close && b.close()); }

    gopOf(idx) { let lo = 0, hi = this.gops.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (this.gops[mid].first <= idx) lo = mid; else hi = mid - 1; } return lo; }
    cached(idx) { const f = this.cache.get(idx); if (f) { this.cache.delete(idx); this.cache.set(idx, f); } return f || null; }
    nearest(idx) {
      let best = null, bd = Infinity;
      this.cache.forEach((f, k) => { const d = Math.abs(k - idx); if (d < bd) { bd = d; best = f; } });
      return best;
    }
    _evict(protectFrom) {
      if (this.cache.size <= CACHE_MAX) return;
      // 1) 지금 GOP 앞쪽(이미 지나간) 프레임부터 버린다 — 재생·내보내기는 앞으로만 간다
      for (const [k, f] of this.cache) {
        if (this.cache.size <= CACHE_MAX) return;
        if (k >= protectFrom) continue;
        this.cache.delete(k); try { f.close(); } catch (e) {}
      }
      // 2) 그래도 넘치면(긴 GOP) 목표에서 가장 먼 것부터 — 상한 2배까지만 허용
      while (this.cache.size > CACHE_MAX * 2) {
        let far = null, fd = -1;
        this.cache.forEach((f, k) => { const d = Math.abs(k - protectFrom); if (d > fd) { fd = d; far = k; } });
        const f = this.cache.get(far); this.cache.delete(far); try { f.close(); } catch (e) {}
      }
    }
    _ensureDecoder() {
      if (this.decoder && this.decoder.state === 'configured') return;
      if (this.decoder) { try { this.decoder.close(); } catch (e) {} }
      this.decoder = new VideoDecoder({
        output: frame => {
          const idx = this.presOfUs.get(frame.timestamp);
          if (idx == null || idx < this.keepFrom) { frame.close(); return; }
          const old = this.cache.get(idx); if (old) { try { old.close(); } catch (e) {} this.cache.delete(idx); }
          this.cache.set(idx, frame);
          this._evict(this.keepFrom);
        },
        error: e => { console.error('[KMV media] decoder', e); this._decErr = e; },
      });
      const cfg = { codec: this.codec, codedWidth: this.w, codedHeight: this.h, optimizeForLatency: false }; if (this.desc) cfg.description = this.desc;
      this.decoder.configure(cfg);
      this.keepFrom = 0;
    }
    async _decodeGop(gi, target) {
      this._ensureDecoder();
      const gp = this.gops[gi];
      this.keepFrom = Math.max(gp.first, target - 6);
      this._decErr = null;
      for (let i = gp.dec; i < gp.decEnd; i++) {
        const s = this.dec[i];
        while (this.decoder.decodeQueueSize > 24) await new Promise(r => setTimeout(r, 2));
        if (this._decErr) break;
        this.decoder.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: s.us, duration: Math.round(s.dur * 1e6 / this.ts), data: s.data }));
      }
      try { await this.decoder.flush(); } catch (e) { this._decErr = e; }
      if (this._decErr) { try { this.decoder.close(); } catch (e) {} this.decoder = null; }
    }
    /* 정확한 프레임. coalesce=true 면 스크럽용: 더 새 요청이 오면 이 요청은 버리고 null */
    getFrame(idx, coalesce) {
      idx = Math.max(0, Math.min(this.frames - 1, idx | 0));
      const hit = this.cached(idx); if (hit) return Promise.resolve(hit);
      if (coalesce) this.latest = idx;
      const run = this.chain.then(async () => {
        if (coalesce && this.latest !== idx) return null;
        if (this.cached(idx)) return this.cached(idx);
        await this._decodeGop(this.gopOf(idx), idx);
        return this.cached(idx);
      });
      this.chain = run.catch(() => null);
      return run;
    }
    prefetch(idx) {
      idx = Math.max(0, Math.min(this.frames - 1, idx | 0));
      if (this.cache.has(idx) || this._pf === this.gopOf(idx)) return;
      const gi = this.gopOf(idx); this._pf = gi;
      this.chain = this.chain.then(async () => { if (!this.cache.has(idx)) await this._decodeGop(gi, this.gops[gi].first); }).catch(() => null);
    }
  }

  class ImageSource {
    constructor(id, bitmap) { this.id = id; this.kind = 'image'; this.bmp = bitmap; this.w = bitmap.width; this.h = bitmap.height; this.rot = 0; this.fps = 30; this.frames = 10 * 60 * 30; this.audio = null; this.thumbs = []; this.thumbEvery = 1e9; this.motion = null; this.peaks = null; this.analyzed = true; }
    cached() { return this.bmp; } nearest() { return this.bmp; }
    getFrame() { return Promise.resolve(this.bmp); } prefetch() {} dispose() { this.bmp.close && this.bmp.close(); }
  }

  /* ---------- 가져오기 ---------- */
  async function open(file, id, status) {
    id = id || uid('m');
    const name = file.name || '미디어';
    const isImg = /^image\//.test(file.type) || /\.(png|jpe?g|webp|gif|bmp)$/i.test(name);
    if (isImg) {
      const bmp = await createImageBitmap(file);
      const src = new ImageSource(id, bmp);
      SRC.set(id, src);
      const meta = { id, name, kind: 'image', dur: src.frames, w: src.w, h: src.h, fps: 30, audio: false, rot: 0, blobKey: id };
      src.thumbs = [await createImageBitmap(bmp, { resizeWidth: THUMB_W, resizeHeight: THUMB_H })];
      return meta;
    }
    if (!supported()) throw new Error('이 브라우저는 영상 편집을 지원하지 않아요 — 크롬·엣지 최신 버전을 써 주세요');
    if (file.size > MAX_FILE) throw new Error('브라우저판은 700MB 이하 원본만 — 긴 원본은 데스크톱판(4단계) 몫이에요');
    status && status('mp4 읽는 중');
    await loadMp4box();
    const buf = await file.arrayBuffer();
    const dm = await demux(buf);
    if (/^avc/i.test(dm.codec) && !dm.desc) throw new Error('H.264 설정(avcC)을 찾지 못했어요');
    const cfg = { codec: dm.codec, codedWidth: dm.w, codedHeight: dm.h }; if (dm.desc) cfg.description = dm.desc;
    const sup = await VideoDecoder.isConfigSupported(cfg);
    if (!sup.supported) throw new Error('이 영상 코덱을 이 브라우저에서 풀 수 없어요 (' + dm.codec + ')');
    let audio = null;
    if (dm.hasAudio) {
      status && status('소리 푸는 중');
      try { audio = await g.KMV_AUDIO.decode(buf.slice(0)); } catch (e) { console.warn('[KMV media] audio decode', e); }
    }
    const src = new VideoSource(id, dm, audio);
    if (src.durSec > MAX_SEC) { src.dispose(); throw new Error('브라우저판은 10분 이하 원본만 읽어요 — 긴 원본은 데스크톱판 몫'); }
    SRC.set(id, src);
    const rotated = src.rot === 90 || src.rot === 270;
    return { id, name, kind: 'video', dur: src.frames, w: rotated ? src.h : src.w, h: rotated ? src.w : src.h, fps: src.fps, audio: !!audio, rot: src.rot, blobKey: id };
  }

  /* ---------- 분석: 썸네일·모션량·파형 (백그라운드, 별도 디코더) ---------- */
  async function analyze(id, onProgress) {
    const src = SRC.get(id); if (!src || src.kind !== 'video' || src.analyzed || src.analyzing) return;
    src.analyzing = true;
    // 파형
    if (src.audio) {
      const ab = src.audio, n = src.frames, peaks = new Float32Array(n), per = ab.sampleRate / src.fps;
      const chs = []; for (let c = 0; c < ab.numberOfChannels; c++) chs.push(ab.getChannelData(c));
      for (let f = 0; f < n; f++) {
        const s0 = Math.floor(f * per), s1 = Math.min(ab.length, Math.floor((f + 1) * per));
        let acc = 0, cnt = 0;
        for (let s = s0; s < s1; s += 4) { let v = 0; for (let c = 0; c < chs.length; c++) v += chs[c][s]; v /= chs.length; acc += v * v; cnt++; }
        peaks[f] = cnt ? Math.sqrt(acc / cnt) : 0;
      }
      src.peaks = peaks;
    }
    // 영상 한 번 훑기: 썸네일 + 모션량
    const SW = 96, SH = 54;
    const cv = new OffscreenCanvas(SW, SH), ctx = cv.getContext('2d', { willReadFrequently: true });
    const motion = new Float32Array(src.frames);
    let prev = null, count = 0, err = null;
    const pendingThumbs = [];
    const dec = new VideoDecoder({
      output: frame => {
        const idx = src.presOfUs.get(frame.timestamp);
        if (idx == null) { frame.close(); return; }
        ctx.drawImage(frame, 0, 0, SW, SH);
        const d = ctx.getImageData(0, 0, SW, SH).data;
        const cur = new Uint8Array(SW * SH);
        for (let i = 0, j = 0; i < d.length; i += 4, j++) cur[j] = (d[i] * 77 + d[i + 1] * 151 + d[i + 2] * 28) >> 8;
        if (prev) { let sum = 0; for (let j = 0; j < cur.length; j++) sum += Math.abs(cur[j] - prev[j]); motion[idx] = sum / cur.length / 255; }
        prev = cur;
        if (idx % src.thumbEvery === 0) {
          const k = idx / src.thumbEvery;
          const tc = new OffscreenCanvas(THUMB_W, THUMB_H), tctx = tc.getContext('2d');
          drawFit(tctx, frame, THUMB_W, THUMB_H, src.rot, frame.displayWidth, frame.displayHeight);
          pendingThumbs.push(tc.transferToImageBitmap ? Promise.resolve(tc.transferToImageBitmap()).then(b => { src.thumbs[k] = b; }) : createImageBitmap(tc).then(b => { src.thumbs[k] = b; }));
        }
        frame.close();
        count++;
        if (onProgress && count % 30 === 0) onProgress(count / src.frames);
      },
      error: e => { err = e; },
    });
    try {
      const cfg = { codec: src.codec, codedWidth: src.w, codedHeight: src.h }; if (src.desc) cfg.description = src.desc;
      dec.configure(cfg);
      for (let i = 0; i < src.dec.length; i++) {
        const s = src.dec[i];
        while (dec.decodeQueueSize > 16) await new Promise(r => setTimeout(r, 4));
        if (err) break;
        dec.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: s.us, data: s.data }));
      }
      await dec.flush();
      await Promise.all(pendingThumbs);
    } catch (e) { err = e; console.warn('[KMV media] analyze', e); }
    try { dec.close(); } catch (e) {}
    // 모션량 정규화: 95퍼센타일을 1 로
    const sorted = Array.from(motion).sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
    for (let i = 0; i < motion.length; i++) motion[i] = Math.min(1, motion[i] / p95);
    src.motion = motion; src.analyzed = true; src.analyzing = false;
    onProgress && onProgress(1);
  }

  /* 원본(회전 포함)을 W×H 안에 비율 유지로 꽉 채워 그림 — 렌더·썸네일 공용 */
  function drawFit(ctx, img, W, H, rot, iw, ih) {
    iw = iw || img.displayWidth || img.width; ih = ih || img.displayHeight || img.height;
    const rotated = rot === 90 || rot === 270;
    const dw = rotated ? ih : iw, dh = rotated ? iw : ih;
    const sc = Math.min(W / dw, H / dh);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    if (rot) ctx.rotate(rot * Math.PI / 180);
    try { ctx.drawImage(img, -iw * sc / 2, -ih * sc / 2, iw * sc, ih * sc); } catch (e) { /* 닫힌 프레임 */ }
    ctx.restore();
  }

  g.KMV_MEDIA = {
    supported, open, analyze, drawFit,
    get: id => SRC.get(id) || null,
    has: id => SRC.has(id),
    remove: id => { const s = SRC.get(id); if (s) { s.dispose(); SRC.delete(id); } },
    THUMB_W, THUMB_H,
  };
})(typeof window !== 'undefined' ? window : globalThis);
