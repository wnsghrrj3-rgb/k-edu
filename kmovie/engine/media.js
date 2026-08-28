/* ============================================================
   케이무비 미디어 층 (KMV_MEDIA) — 설계서 v1 §5
   ------------------------------------------------------------
   · 디먹스: mp4box.js (H.264 mp4/mov). HEVC·긴 파일은 껍데기 몫 → 안내.
   · 디코드: WebCodecs VideoDecoder. GOP(키프레임) 단위로 풀고 LRU 캐시.
     스크럽은 "최신 요청만" 디코드(중간 요청은 버림) → 가장 가까운 캐시 프레임 즉시, 정확 프레임 후속.
   · 오디오(원본): 통 PCM 을 올리지 않는다 — 압축 샘플(AAC·opus)만 두고
     필요한 구간을 AudioDecoder 로 8초 청크 단위 디코드(전 소스 합계 96MB LRU).
     52분 실촬영본에서 GB급 PCM → 수십 MB. AudioDecoder 가 없거나 코덱이
     낯설면 예전처럼 decodeAudioData 통 디코드로 폴백(src.audio).
   · 분석(백그라운드): 썸네일(1초마다 160×90) · 모션량(프레임 차) · 파형(프레임별 RMS).
   · 사진: ImageBitmap 하나. 회전(폰 세로 영상)은 tkhd matrix 에서 읽는다.
   · 음악(A2): mp3·wav·m4a·aac·ogg → decodeAudioData 만. 프레임은 30fps 기준 정수, 파형·비트 마커 분석.
   ============================================================ */
(function (g) {
  'use strict';

  const CACHE_MAX = 150;               // VideoFrame 캐시 상한 (설계서 ≈90, 재생 여유분)
  const THUMB_W = 160, THUMB_H = 90;
  // 브라우저판 원본 상한. 데스크톱 껍데기(KMV_SHELL)가 붙으면 프록시 기준으로 limits 를 바꾼다.
  const limits = { maxFile: 700 * 1024 * 1024, maxSec: 10 * 60 };
  let analyzePaused = false;                 // 재생·셔틀 중엔 분석을 쉬게 한다 (디코더 경쟁 방지)
  function setAnalyzePaused(v) { analyzePaused = !!v; }
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

  /* ---------- 오디오 트랙 description·편집 오프셋 ---------- */
  function boxBody(box) {           // 박스를 직렬화해 헤더 8바이트를 뗀다 (avcC 방식)
    if (!box || !g.DataStream) return null;
    try { const ds = new g.DataStream(undefined, 0, g.DataStream.BIG_ENDIAN); box.write(ds); return new Uint8Array(ds.buffer, 8); } catch (e) { return null; }
  }
  function audioDescription(trak, codec) {
    try {
      const entry = trak.mdia.minf.stbl.stsd.entries[0];
      if (/^mp4a/i.test(codec)) {          // esds → DecSpecificInfo(tag 5) = AudioSpecificConfig
        const q = [entry.esds && entry.esds.esd].filter(Boolean);
        while (q.length) { const d = q.shift(); if (d.tag === 5 && d.data) return new Uint8Array(d.data); if (d.descs) for (const c of d.descs) q.push(c); }
        return null;
      }
      if (/^opus/i.test(codec)) {          // WebCodecs 는 dOps 가 아니라 OpusHead(리틀엔디언) 를 원한다
        const o = entry.dOps; if (!o || o.PreSkip == null) return null;
        const b = new ArrayBuffer(19), dv = new DataView(b);
        new Uint8Array(b).set([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], 0);   // "OpusHead"
        dv.setUint8(8, 1); dv.setUint8(9, o.OutputChannelCount || 2);
        dv.setUint16(10, o.PreSkip, true); dv.setUint32(12, o.InputSampleRate || 48000, true);
        dv.setInt16(16, o.OutputGain || 0, true); dv.setUint8(18, o.ChannelMappingFamily || 0);
        return new Uint8Array(b);
      }
    } catch (e) {}
    return null;
  }
  function editOffsetSec(trak, timescale) {  // elst 의 media_time — AAC 프라이밍 잘라내기 위치(초)
    try { for (const e of trak.edts.elst.entries) if (e.media_time >= 0) return e.media_time / timescale; } catch (e) {}
    return null;
  }

  /* ---------- 디먹스 ---------- */
  function demux(buffer) {
    return new Promise((resolve, reject) => {
      const mp4 = g.MP4Box.createFile();
      const out = { samples: [] };
      let track = null, atrack = null, nb = 0, na = 0, done = false;
      const check = () => { if (!done && out.samples.length >= nb && (!atrack || out.a.samples.length >= na)) { done = true; resolve(out); } };
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
        atrack = info.audioTracks && info.audioTracks[0];
        out.hasAudio = !!atrack;
        if (atrack) {
          na = atrack.nb_samples;
          const atrak = mp4.getTrackById(atrack.id);
          let acodec = String(atrack.codec || '');
          const adesc = audioDescription(atrak, acodec);
          let achn = atrack.audio && atrack.audio.channel_count;
          if (/^opus/i.test(acodec)) { acodec = 'opus'; if (adesc) achn = adesc[9]; }   // 코덱 소문자·채널은 OpusHead 기준
          out.a = { codec: acodec, timescale: atrack.timescale, samples: [],
                    sr: atrack.audio && atrack.audio.sample_rate, chn: achn,
                    desc: adesc, edit: editOffsetSec(atrak, atrack.timescale) };
          mp4.setExtractionOptions(atrack.id, 'a', { nbSamples: 4000 });
        }
        mp4.setExtractionOptions(track.id, null, { nbSamples: 4000 });
        mp4.start();
      };
      mp4.onSamples = (id, user, samples) => {
        if (user === 'a') { for (const s of samples) out.a.samples.push(s); }
        else for (const s of samples) out.samples.push(s);
        check();
      };
      buffer.fileStart = 0;
      try { mp4.appendBuffer(buffer); mp4.flush(); } catch (e) { return reject(new Error('mp4 구조를 읽는 중 오류: ' + (e.message || e))); }
      setTimeout(() => { if (!done) { if (out.samples.length) { done = true; if (out.a && !out.a.samples.length) out.hasAudio = false; resolve(out); } else reject(new Error('영상 샘플을 꺼내지 못했어요 (손상되었거나 스트리밍용 mp4일 수 있어요)')); } }, 1500);
    });
  }

  /* ---------- 스트리밍 PCM (원본 소리) ----------
     압축 샘플만 들고 있다가 필요한 구간을 8초 청크 단위로 디코드.
     · 축: 0초 = elst media_time(AAC 프라이밍) 또는 첫 샘플 cts — decodeAudioData 와 같은 자리.
     · 청크는 전 소스 합계 PCM_BUDGET 바이트 전역 LRU (최근 3초 내 만진 청크는 안 버림).
     · read() 는 캐시에서만 조립 — 없는 구간은 0 (ensure 를 먼저 부르는 게 규칙). */
  const PCM_CHUNK = 8, PCM_BUDGET = 96 * 1024 * 1024, PCM_PRE = 0.15;
  const pcmReg = new Set();
  class Pcm {
    constructor(a) {
      this.codec = a.codec; this.desc = a.desc || null; this.cfgSr = a.sr || 48000; this.cfgCh = Math.max(1, a.chn || 2);
      const ts = a.timescale, first = a.samples.length ? a.samples[0].cts / ts : 0;
      this.base = a.edit != null ? a.edit : first;
      this.pk = a.samples.map(s => ({ t: s.cts / ts - this.base, d: s.duration / ts, data: s.data }));
      const last = this.pk[this.pk.length - 1];
      this.durSec = last ? Math.max(0, last.t + last.d) : 0;
      this.sr = null; this.ch = null;                    // 첫 디코드 출력에서 확정 (HE-AAC 등)
      this.chunks = new Map(); this.chain = Promise.resolve();
    }
    dispose() { this.chunks.forEach(c => pcmReg.delete(c)); this.chunks.clear(); this.pk = []; }
    _per() { return Math.round(PCM_CHUNK * this.sr); }
    _alloc(ci) {
      let c = this.chunks.get(ci);
      if (!c) { const n = this._per(); c = { ci, pcm: this, ch: Array.from({ length: this.ch }, () => new Float32Array(n)) }; this.chunks.set(ci, c); pcmReg.add(c); }
      c.touch = performance.now(); return c;
    }
    static _evict() {
      let tot = 0; pcmReg.forEach(c => { tot += c.ch.length * c.ch[0].length * 4; });
      if (tot <= PCM_BUDGET) return;
      const now = performance.now();
      for (const c of [...pcmReg].sort((x, y) => x.touch - y.touch)) {
        if (tot <= PCM_BUDGET) break;
        if (now - c.touch < 3000) continue;
        c.pcm.chunks.delete(c.ci); pcmReg.delete(c); tot -= c.ch.length * c.ch[0].length * 4;
      }
    }
    /* [t0,t1) 초 구간의 청크를 확보 (디코드는 소스별 직렬) */
    ensure(t0, t1) {
      t0 = Math.max(0, t0); t1 = Math.min(this.durSec, t1);
      if (t1 <= t0) return Promise.resolve();
      const c0 = Math.floor(t0 / PCM_CHUNK), c1 = Math.floor((t1 - 1e-9) / PCM_CHUNK);
      const run = this.chain.then(async () => {
        const need = []; for (let ci = c0; ci <= c1; ci++) { if (this.chunks.has(ci)) this._alloc(ci); else need.push(ci); }
        if (!need.length) return;
        let s = need[0], p = need[0]; const runs = [];
        for (let i = 1; i < need.length; i++) { if (need[i] === p + 1) p = need[i]; else { runs.push([s, p]); s = p = need[i]; } }
        runs.push([s, p]);
        for (const [a, b] of runs) await this._decodeRun(a * PCM_CHUNK, (b + 1) * PCM_CHUNK, a, b);
        Pcm._evict();
      });
      this.chain = run.catch(() => null);
      return run;
    }
    async _decodeRun(t0, t1, ci0, ci1) {
      const pk = this.pk; if (!pk.length) return;
      let i0 = 0; for (let i = 0; i < pk.length; i++) { if (pk[i].t <= t0 - PCM_PRE) i0 = i; else break; }
      let err = null; const outs = [];
      const run = { in0: Math.round(pk[i0].t * 1e6), firstDur: pk[i0].d, trim0: null };   // 출력 ts 재사상용
      const dec = new AudioDecoder({ output: ad => outs.push(ad), error: e => { err = e; } });
      const cfg = { codec: this.codec, sampleRate: this.cfgSr, numberOfChannels: this.cfgCh }; if (this.desc) cfg.description = this.desc;
      try { dec.configure(cfg); } catch (e) { err = e; }
      for (let i = i0; i < pk.length && !err; i++) {
        const p = pk[i]; if (p.t >= t1) break;
        try { dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: Math.round(p.t * 1e6), duration: Math.max(0, Math.round(p.d * 1e6)), data: p.data })); } catch (e) { err = e; break; }
        if (dec.decodeQueueSize > 32) await new Promise(r => setTimeout(r, 2));
        if (outs.length > 64) this._drain(outs, ci0, ci1, run);
      }
      try { await dec.flush(); } catch (e) {}
      try { dec.close(); } catch (e) {}
      this._drain(outs, ci0, ci1, run);
      if (err) console.warn('[KMV media] pcm decode', err);
    }
    /* 출력 배치 규칙(실측, 크로미움): 출력 ts 는 첫 출력의 ts(음수 입력은 0 으로 클램프됨)부터
       순차 재생성이고, 코덱이 스트림 머리에서 내부 트림(opus 프리스킵)을 하면 그만큼 샘플이 빠진다.
       → 위치 = 첫입력t + 트림/sr + (출력ts − 첫출력ts). 앵커(첫출력ts)를 실측으로 잡으니
       클램프·패스스루·리베이스 어느 구현이든 같은 식이 맞는다.
       트림량 = 첫 패킷 기대 샘플 수 − 첫 출력 샘플 수. */
    _drain(outs, ci0, ci1, run) {
      for (const ad of outs) {
        if (this.sr == null) { this.sr = ad.sampleRate; this.ch = Math.max(1, Math.min(2, ad.numberOfChannels)); }
        if (run.trim0 == null) { run.trim0 = Math.max(0, Math.round(run.firstDur * this.sr) - ad.numberOfFrames); run.anchor = ad.timestamp; }
        const n = ad.numberOfFrames, per = this._per();
        const s0 = Math.round(run.in0 / 1e6 * this.sr) + run.trim0 + Math.round((ad.timestamp - run.anchor) / 1e6 * this.sr);
        if (!this._tmp || this._tmp.length < n) this._tmp = new Float32Array(Math.max(n, 4096));
        for (let ch = 0; ch < this.ch; ch++) {
          const tmp = this._tmp.subarray(0, n);
          try { ad.copyTo(tmp, { planeIndex: Math.min(ch, ad.numberOfChannels - 1), format: 'f32-planar' }); } catch (e) { break; }
          let off = 0;
          while (off < n) {
            const abs = s0 + off;
            if (abs < 0) { off += -abs; continue; }
            const ci = Math.floor(abs / per);
            if (ci < ci0 || ci > ci1) { off += (ci + 1) * per - abs; continue; }   // 요청 밖(프라이밍 등) — 버림
            const c = this._alloc(ci), rel = abs - ci * per, m = Math.min(n - off, per - rel);
            c.ch[ch].set(tmp.subarray(off, off + m), rel);
            off += m;
          }
        }
        ad.close();
      }
      outs.length = 0;
    }
    /* t0초부터 n샘플 조립 → { sr, ch:[Float32Array] }. 캐시에 없는 구간은 0 */
    read(t0, n) {
      const sr = this.sr || this.cfgSr, C = this.ch || Math.min(2, this.cfgCh);
      const out = Array.from({ length: C }, () => new Float32Array(n));
      const per = Math.round(PCM_CHUNK * sr);
      let s0 = Math.round(t0 * sr), off = 0;
      while (off < n) {
        const abs = s0 + off;
        if (abs < 0) { off += -abs; continue; }
        const ci = Math.floor(abs / per), c = this.chunks.get(ci), rel = abs - ci * per, m = Math.min(n - off, per - rel);
        if (c) { c.touch = performance.now(); for (let ch = 0; ch < C; ch++) out[ch].set(c.ch[ch].subarray(rel, rel + m), off); }
        off += m;
      }
      return { sr, ch: out };
    }
  }
  async function makePcm(a) {
    if (typeof AudioDecoder === 'undefined' || !a || !a.samples || !a.samples.length) return null;
    if (/^mp4a/i.test(a.codec) && !a.desc) return null;                    // AAC 는 ASC 필수
    try {
      const cfg = { codec: a.codec, sampleRate: a.sr || 48000, numberOfChannels: Math.max(1, a.chn || 2) };
      if (a.desc) cfg.description = a.desc;
      const sup = await AudioDecoder.isConfigSupported(cfg);
      if (!sup.supported) return null;
    } catch (e) { return null; }
    return new Pcm(a);
  }

  /* ---------- 영상 소스 ---------- */
  class VideoSource {
    constructor(id, dm, audio) {
      this.id = id; this.kind = 'video';
      this.codec = dm.codec; this.desc = dm.desc; this.rot = dm.rot;
      this.w = dm.w; this.h = dm.h; this.audio = audio; this.pcm = null; // audio: 폴백 AudioBuffer | null, pcm: 스트리밍 소리
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
      this.cacheMax = this.w * this.h > 2.2e6 ? 60 : CACHE_MAX;   // 4K 급은 캐시를 줄인다 (VideoFrame 메모리)
      this.decoder = null; this.chain = Promise.resolve(); this.latest = -1;
      this.thumbs = []; this.thumbEvery = Math.max(1, Math.round(this.fps)); this.motion = null; this.peaks = null;
      this.analyzed = false; this.analyzing = false;
    }
    dispose() { if (this.pcm) this.pcm.dispose(); this.cache.forEach(f => { try { f.close(); } catch (e) {} }); this.cache.clear(); try { if (this.decoder) this.decoder.close(); } catch (e) {} this.thumbs.forEach(b => b.close && b.close()); }

    gopOf(idx) { let lo = 0, hi = this.gops.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (this.gops[mid].first <= idx) lo = mid; else hi = mid - 1; } return lo; }
    cached(idx) { const f = this.cache.get(idx); if (f) { this.cache.delete(idx); this.cache.set(idx, f); } return f || null; }
    nearest(idx) {
      let best = null, bd = Infinity;
      this.cache.forEach((f, k) => { const d = Math.abs(k - idx); if (d < bd) { bd = d; best = f; } });
      return best;
    }
    _evict(protectFrom) {
      const MAXN = this.cacheMax || CACHE_MAX;
      if (this.cache.size <= MAXN) return;
      // 1) 지금 GOP 앞쪽(이미 지나간) 프레임부터 버린다 — 재생·내보내기는 앞으로만 간다
      for (const [k, f] of this.cache) {
        if (this.cache.size <= MAXN) return;
        if (k >= protectFrom) continue;
        this.cache.delete(k); try { f.close(); } catch (e) {}
      }
      // 2) 그래도 넘치면(긴 GOP) 목표에서 가장 먼 것부터 — 상한 2배까지만 허용
      while (this.cache.size > MAXN * 2) {
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
    /* ---------- 재생 스트림 ----------
       재생 중엔 getFrame(GOP 통 디코드 + flush) 대신 이 파이프라인이 캐시를 앞서 채운다.
       매 프레임 streamTo(idx) 만 부르면 됨: 목표를 따라가며 순차 디코드, flush 없음(끝에서만),
       목표보다 AHEAD 프레임 이상 앞서면 쉼. 목표가 뒤로 갔거나 창을 벗어나면 키프레임부터 재시작. */
    streamTo(idx) {
      idx = Math.max(0, Math.min(this.frames - 1, idx | 0));
      this.keepFrom = Math.max(0, idx - 6);
      const st = this._stream;
      if (st && st.alive) {
        st.target = idx;
        if (idx >= st.base && idx <= st.fed + 1) return;      // 창 안 — 이어서 감
        st.alive = false;                                     // 창 밖(점프·역방향) — 재시작
      }
      this._startStream(idx);
    }
    stopStream() { if (this._stream) this._stream.alive = false; this._stream = null; }
    _startStream(idx) {
      const st = this._stream = { alive: true, target: idx, base: idx, fed: idx - 1 };
      const AHEAD = Math.max(20, Math.min((this.cacheMax || CACHE_MAX) - 20, Math.round(this.fps * 2)));
      this.chain = this.chain.then(async () => {
        if (!st.alive) return;
        try { if (this.decoder) this.decoder.close(); } catch (e) {}
        this.decoder = null; this._ensureDecoder();
        this.keepFrom = Math.max(0, st.target - 6);
        this._decErr = null;
        let gi = this.gopOf(st.base), i = this.gops[gi].dec;
        while (st.alive && this._stream === st && i < this.dec.length) {
          const sm = this.dec[i];
          const pres = this.presOfUs.get(sm.us);
          if (pres != null && pres > st.fed) st.fed = pres;
          if (st.fed > st.target + AHEAD) { await new Promise(r => setTimeout(r, 12)); continue; }   // 충분히 앞섬 — 쉼
          while (this.decoder && this.decoder.decodeQueueSize > 24) await new Promise(r => setTimeout(r, 2));
          if (this._decErr || !st.alive || this._stream !== st) break;
          try { this.decoder.decode(new EncodedVideoChunk({ type: sm.key ? 'key' : 'delta', timestamp: sm.us, duration: Math.round(sm.dur * 1e6 / this.ts), data: sm.data })); } catch (e) { this._decErr = e; break; }
          i++;
        }
        if (st.alive && this._stream === st && i >= this.dec.length) { try { await this.decoder.flush(); } catch (e) {} }   // 파일 끝에서만 flush
        if (this._decErr) { try { this.decoder.close(); } catch (e) {} this.decoder = null; }
      }).catch(() => null);
    }

    /* 정확한 프레임. coalesce=true 면 스크럽용: 더 새 요청이 오면 이 요청은 버리고 null */
    getFrame(idx, coalesce) {
      idx = Math.max(0, Math.min(this.frames - 1, idx | 0));
      const hit = this.cached(idx); if (hit) return Promise.resolve(hit);
      this.stopStream();
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

  class AudioSource {
    constructor(id, audio) { this.id = id; this.kind = 'audio'; this.audio = audio; this.w = 0; this.h = 0; this.rot = 0; this.fps = 30; this.durSec = audio.duration; this.frames = Math.max(1, Math.round(audio.duration * 30)); this.thumbs = []; this.thumbEvery = 1e9; this.motion = null; this.peaks = null; this.beats = null; this.analyzed = false; this.analyzing = false; }
    cached() { return null; } nearest() { return null; } getFrame() { return Promise.resolve(null); } prefetch() {} dispose() { this.audio = null; }
  }
  function isAudioFile(file) { const name = file.name || ''; return /^audio\//.test(file.type) || /\.(mp3|wav|m4a|aac|ogg|oga|flac|weba)$/i.test(name); }

  /* ---------- 가져오기 ---------- */
  async function open(file, id, status) {
    id = id || uid('m');
    const name = file.name || '미디어';
    if (isAudioFile(file)) {
      status && status('음악 푸는 중');
      let audio = null;
      try { audio = await g.KMV_AUDIO.decode(await file.arrayBuffer()); } catch (e) { throw new Error('이 음악 파일을 풀 수 없어요 (mp3·wav·m4a 권장)'); }
      if (audio.duration > limits.maxSec * 2) throw new Error('음악은 20분 이하만');
      const src = new AudioSource(id, audio);
      SRC.set(id, src);
      return { id, name, kind: 'audio', dur: src.frames, w: 0, h: 0, fps: 30, audio: true, rot: 0, blobKey: id };
    }
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
    if (file.size > limits.maxFile) throw new Error(limits.maxFile >= 1024 * 1024 * 1024 ? '이 원본은 너무 커요 (' + Math.round(file.size / 1048576) + 'MB)' : '브라우저판은 700MB 이하 원본만 — 긴 원본은 데스크톱판 몫이에요');
    status && status('mp4 읽는 중');
    await loadMp4box();
    const buf = await file.arrayBuffer();
    const dm = await demux(buf);
    if (/^avc/i.test(dm.codec) && !dm.desc) throw new Error('H.264 설정(avcC)을 찾지 못했어요');
    const cfg = { codec: dm.codec, codedWidth: dm.w, codedHeight: dm.h }; if (dm.desc) cfg.description = dm.desc;
    const sup = await VideoDecoder.isConfigSupported(cfg);
    if (!sup.supported) throw new Error('이 영상 코덱을 이 브라우저에서 풀 수 없어요 (' + dm.codec + ')');
    let audio = null, pcm = null;
    if (dm.hasAudio) {
      pcm = await makePcm(dm.a);
      if (!pcm) {                                             // 낯선 코덱·구형 브라우저 — 예전 방식(통 PCM)
        status && status('소리 푸는 중');
        try { audio = await g.KMV_AUDIO.decode(buf.slice(0)); } catch (e) { console.warn('[KMV media] audio decode', e); }
      }
    }
    const src = new VideoSource(id, dm, audio);
    src.pcm = pcm;
    if (src.durSec > limits.maxSec) { src.dispose(); throw new Error(Math.round(limits.maxSec / 60) + '분 이하 원본만 읽어요' + (limits.maxSec <= 10 * 60 ? ' — 긴 원본은 데스크톱판 몫' : ' — 폰에서 먼저 잘라 주세요')); }
    SRC.set(id, src);
    const rotated = src.rot === 90 || src.rot === 270;
    return { id, name, kind: 'video', dur: src.frames, w: rotated ? src.h : src.w, h: rotated ? src.w : src.h, fps: src.fps, audio: !!(audio || pcm), rot: src.rot, blobKey: id };
  }

  /* ---------- 분석: 썸네일·모션량·파형 (백그라운드, 별도 디코더) ---------- */
  function audioPeaks(ab, fps, n) {
    const peaks = new Float32Array(n), per = ab.sampleRate / fps;
    const chs = []; for (let c = 0; c < ab.numberOfChannels; c++) chs.push(ab.getChannelData(c));
    for (let f = 0; f < n; f++) {
      const s0 = Math.floor(f * per), s1 = Math.min(ab.length, Math.floor((f + 1) * per));
      let acc = 0, cnt = 0;
      for (let s = s0; s < s1; s += 4) { let v = 0; for (let c = 0; c < chs.length; c++) v += chs[c][s]; v /= chs.length; acc += v * v; cnt++; }
      peaks[f] = cnt ? Math.sqrt(acc / cnt) : 0;
    }
    return peaks;
  }
  /* 스트리밍 파형: 압축 샘플 전체를 한 번 훑어 프레임 RMS 만 계산 (PCM 저장 없음) */
  async function pcmPeaks(src) {
    const P = src.pcm, n = src.frames, acc = new Float64Array(n), cnt = new Float64Array(n);
    let err = null; const outs = [];
    const run = { in0: Math.round((P.pk[0] ? P.pk[0].t : 0) * 1e6), firstDur: P.pk[0] ? P.pk[0].d : 0, trim0: null };
    const dec = new AudioDecoder({ output: ad => outs.push(ad), error: e => { err = e; } });
    const cfg = { codec: P.codec, sampleRate: P.cfgSr, numberOfChannels: P.cfgCh }; if (P.desc) cfg.description = P.desc;
    dec.configure(cfg);
    let tmp = null;
    const drain = () => {
      for (const ad of outs) {
        const sr = ad.sampleRate, N = ad.numberOfFrames, C = ad.numberOfChannels;
        if (run.trim0 == null) { run.trim0 = Math.max(0, Math.round(run.firstDur * sr) - N); run.anchor = ad.timestamp; }
        const t = run.in0 / 1e6 + run.trim0 / sr + (ad.timestamp - run.anchor) / 1e6;
        if (!tmp || tmp.length < N * 2) tmp = new Float32Array(N * 2);
        const mono = tmp.subarray(0, N), one = tmp.subarray(N, N * 2);
        mono.fill(0);
        for (let c = 0; c < C; c++) { try { ad.copyTo(one, { planeIndex: c, format: 'f32-planar' }); } catch (e) { break; } for (let i = 0; i < N; i++) mono[i] += one[i]; }
        for (let i = 0; i < N; i += 4) {
          const f = Math.floor((t + i / sr) * src.fps);
          if (f < 0 || f >= n) continue;
          const v = mono[i] / C; acc[f] += v * v; cnt[f]++;
        }
        ad.close();
      }
      outs.length = 0;
    };
    for (let i = 0; i < P.pk.length && !err; i++) {
      const p = P.pk[i];
      while (analyzePaused && !err) await new Promise(r => setTimeout(r, 200));
      try { dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: Math.round(p.t * 1e6), duration: Math.max(0, Math.round(p.d * 1e6)), data: p.data })); } catch (e) { err = e; break; }
      if (dec.decodeQueueSize > 32) await new Promise(r => setTimeout(r, 2));
      if (outs.length > 64) drain();
    }
    try { await dec.flush(); } catch (e) {}
    try { dec.close(); } catch (e) {}
    drain();
    if (err) console.warn('[KMV media] pcmPeaks', err);
    const peaks = new Float32Array(n);
    for (let f = 0; f < n; f++) peaks[f] = cnt[f] ? Math.sqrt(acc[f] / cnt[f]) : 0;
    return peaks;
  }

  async function analyze(id, onProgress) {
    const src = SRC.get(id); if (!src || src.analyzed || src.analyzing) return;
    if (src.kind === 'audio') {
      src.analyzing = true;
      await new Promise(r => setTimeout(r, 0));
      src.peaks = audioPeaks(src.audio, src.fps, src.frames);
      try { src.beats = g.KMV_AUDIO.beats(src.audio); } catch (e) { src.beats = []; }
      src.analyzed = true; src.analyzing = false; onProgress && onProgress(1); return;
    }
    if (src.kind !== 'video') return;
    src.analyzing = true;
    // 파형
    if (src.pcm) {
      try { src.peaks = await pcmPeaks(src); } catch (e) { console.warn('[KMV media] pcm peaks', e); }
    } else if (src.audio) {
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
        while (analyzePaused && !err) await new Promise(r => setTimeout(r, 200));    // 재생이 끝날 때까지 양보
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
    supported, open, analyze, drawFit, isAudioFile, limits, setAnalyzePaused,
    stopStreams: () => { SRC.forEach(s => { if (s.stopStream) s.stopStream(); }); },
    get: id => SRC.get(id) || null,
    has: id => SRC.has(id),
    remove: id => { const s = SRC.get(id); if (s) { s.dispose(); SRC.delete(id); } },
    THUMB_W, THUMB_H,
  };
})(typeof window !== 'undefined' ? window : globalThis);
