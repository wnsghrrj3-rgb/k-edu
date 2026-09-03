/* ============================================================
   케이무비 미디어 층 (KMV_MEDIA) — 설계서 v1 §5
   ------------------------------------------------------------
   · 디먹스: mp4box.js (H.264 mp4/mov). HEVC 는 껍데기 몫 → 안내.
   · 구간 읽기(지연 로드): moov(샘플 표)만 먼저 읽고, mdat 바이트는 GOP·오디오 구간 단위로
     blob.slice 에서 필요할 때만 — 파일을 통째로 메모리에 올리지 않는다 (브라우저판 60분).
     조각(fragmented) mp4 등 표를 못 뽑는 구조만 예전 통 읽기(15분·700MB)로 폴백.
   · 디코드: WebCodecs VideoDecoder. GOP(키프레임) 단위로 풀고 LRU 캐시.
     캐시는 VideoFrame 이 아니라 ImageBitmap — 하드웨어 디코더의 출력 풀(몇 장)을 즉시 돌려준다.
     스크럽은 "최신 요청만" 디코드(중간 요청은 버림) → 가장 가까운 캐시 프레임 즉시, 정확 프레임 후속.
   · 오디오(원본): 통 PCM 을 올리지 않는다 — 압축 샘플(AAC·opus)만 두고
     필요한 구간을 AudioDecoder 로 8초 청크 단위 디코드(전 소스 합계 96MB LRU).
     52분 실촬영본에서 GB급 PCM → 수십 MB. AudioDecoder 가 없거나 코덱이
     낯설면 예전처럼 decodeAudioData 통 디코드로 폴백(src.audio).
   · 분석(백그라운드): 썸네일(1초마다 160×90) · 모션량(프레임 차) · 파형(프레임별 RMS).
   · 사진: ImageBitmap 하나. 회전(폰 세로 영상)은 tkhd matrix 에서 읽는다.
   · 음악(A2)도 스트리밍: mp3(프레임 파서)·m4a(mp4box)·ADTS aac(프레임 파서)는 압축 샘플 + Pcm,
     wav 는 파일 바이트 직독(PcmWav). ogg·flac·낯선 코덱은 예전 통 디코드 폴백(20분 상한).
     파형·비트는 압축 샘플 1패스 스트리밍으로 계산(전체 PCM 미보유). 프레임은 30fps 기준 정수.
   ============================================================ */
(function (g) {
  'use strict';

  const CACHE_MAX = 150;               // 프레임 캐시 장수 상한 (설계서 ≈90, 재생 여유분)
  const CACHE_BYTES = 480 * 1024 * 1024;   // 프레임 캐시 바이트 예산 (ImageBitmap RGBA 기준)
  const THUMB_W = 160, THUMB_H = 90;
  // 브라우저판 원본 상한. 데스크톱 껍데기(KMV_SHELL)가 붙으면 프록시 기준으로 limits 를 바꾼다.
  // 구간 읽기(지연 로드) 도입으로 15분·700MB → 60분·4GB: 파일을 통째로 안 올리고
  // moov(샘플 표)만 읽은 뒤 바이트는 필요한 구간만 blob.slice 로 읽는다.
  const limits = { maxFile: 4 * 1024 * 1024 * 1024, maxSec: 60 * 60 };
  // 통 읽기 폴백(조각 mp4 등 moov 기반 샘플 표를 못 뽑는 구조) 전용 상한 — 예전 그대로.
  const FULL_MAX_FILE = 700 * 1024 * 1024, FULL_MAX_SEC = 15 * 60;
  const MUSIC_MAX = 60 * 60, MUSIC_MAX_FULL = 20 * 60, MUSIC_MAX_BYTES = 300 * 1024 * 1024;
  let analyzePaused = false;                 // 재생·셔틀 중엔 분석을 쉬게 한다 (디코더 경쟁 방지)
  function setAnalyzePaused(v) { analyzePaused = !!v; }
  const MP4BOX_URL = 'vendor/mp4box.all.min.js';   // 레포 동봉(0.5.4) — 폴백 로드용

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

  /* ---------- 구간 읽기(지연 로드) 도우미 ----------
     blob 은 File·Blob 또는 껍데기의 디스크 직독 래퍼 — slice(a,b).arrayBuffer() 만 있으면 된다. */
  async function readBytes(blob, a, b) {
    return new Uint8Array(await blob.slice(a, b).arrayBuffer());
  }
  /* 흩어진 샘플 묶음 읽기: [{off,size}] 를 오프셋 순으로 gap 이하 틈은 붙여 한 번에 읽고,
     items 순서 그대로 Uint8Array 뷰 배열을 돌려준다 (오디오 청크 다발·GOP 용). */
  async function readRuns(blob, items, gap) {
    gap = gap || 262144;
    const order = items.map((it, i) => i).sort((x, y) => items[x].off - items[y].off);
    const out = new Array(items.length);
    let s = 0;
    while (s < order.length) {
      let e = s, end = items[order[s]].off + items[order[s]].size;
      while (e + 1 < order.length && items[order[e + 1]].off <= end + gap) { e++; end = Math.max(end, items[order[e]].off + items[order[e]].size); }
      const a0 = items[order[s]].off;
      const u8 = await readBytes(blob, a0, end);
      for (let k = s; k <= e; k++) { const it = items[order[k]]; out[order[k]] = u8.subarray(it.off - a0, it.off - a0 + it.size); }
      s = e + 1;
    }
    return out;
  }
  /* 순차 읽기 창(재생 스트림·분석용): 8MB 창을 굴리며 범위를 돌려준다. drop() 으로 놓아준다. */
  function fileCursor(blob, win) {
    const W = win || (8 * 1024 * 1024);
    let buf = null, b0 = 0, b1 = 0;
    return {
      async range(o0, o1) {
        if (!(buf && o0 >= b0 && o1 <= b1)) {
          const b = Math.min(blob.size, o0 + Math.max(W, o1 - o0));
          buf = await readBytes(blob, o0, b); b0 = o0; b1 = b;
        }
        return buf.subarray(o0 - b0, o1 - b0);
      },
      drop() { buf = null; b0 = b1 = 0; },
    };
  }
  /* 최상위 박스 스캔 — 헤더 16바이트씩만 읽어 moov·ftyp 위치를 찾는다 (moov 가 앞이든 뒤든). */
  async function boxScan(blob) {
    let p = 0; const out = [];
    while (p + 8 <= blob.size && out.length < 64) {
      const hd = new DataView((await readBytes(blob, p, Math.min(blob.size, p + 16))).buffer);
      if (hd.byteLength < 8) break;
      let sz = hd.getUint32(0), hdr = 8;
      const typ = String.fromCharCode(hd.getUint8(4), hd.getUint8(5), hd.getUint8(6), hd.getUint8(7));
      if (sz === 1) { if (hd.byteLength < 16) break; sz = hd.getUint32(8) * 4294967296 + hd.getUint32(12); hdr = 16; }
      else if (sz === 0) sz = blob.size - p;
      if (sz < hdr || !/^[\x20-\x7e]{4}$/.test(typ)) break;
      out.push({ typ, off: p, size: sz });
      p += sz;
    }
    return out;
  }

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

  /* ---------- 지연 디먹스: moov(샘플 표)만 읽는다 ----------
     mp4box 는 moov 만 먹여도 updateSampleLists 로 전체 샘플 표(원본 파일 절대 오프셋·크기·cts·is_sync)를
     만든다 — mdat 바이트는 필요할 때 blob.slice 로 구간만 읽는다. demux() 와 같은 모양의 dm 을 돌려주되
     samples 엔 data 대신 off·size 가 실리고 dm.lazy·dm.blob 이 붙는다. 조각(fragmented) mp4 등
     moov 기반 표가 안 나오는 구조면 throw — 호출자가 통 읽기(demux)로 폴백한다. */
  async function demuxLazy(file) {
    const boxes = await boxScan(file);
    const ftyp = boxes.find(b => b.typ === 'ftyp'), moov = boxes.find(b => b.typ === 'moov');
    if (!moov) throw new Error('moov 를 찾지 못했어요');
    if (moov.size > 64 * 1024 * 1024) throw new Error('moov 가 비정상적으로 커요');
    const parts = [];
    if (ftyp) parts.push(await readBytes(file, ftyp.off, ftyp.off + ftyp.size));
    parts.push(await readBytes(file, moov.off, moov.off + moov.size));
    let n = 0; parts.forEach(p => { n += p.length; });
    const lean = new Uint8Array(n); let q = 0; parts.forEach(p => { lean.set(p, q); q += p.length; });
    const ab = lean.buffer; ab.fileStart = 0;
    return await new Promise((resolve, reject) => {
      const mp4 = g.MP4Box.createFile();
      let done = false;
      mp4.onError = e => { if (!done) { done = true; reject(new Error('mp4 를 읽을 수 없어요: ' + e)); } };
      mp4.onReady = info => {
        if (done) return; done = true;
        try {
          const track = info.videoTracks && info.videoTracks[0];
          if (!track) return reject(new Error('영상 트랙이 없어요'));
          const codec = String(track.codec || '');
          if (/^(hvc1|hev1|hvc|hev)/i.test(codec)) return reject(new Error('HEVC(H.265) 원본은 브라우저판에서 못 읽어요 — 폰 카메라 설정을 "호환성 우선(H.264)"으로 바꾸거나, 데스크톱판을 써 주세요'));
          if (!/^(avc|vp09|av01)/i.test(codec)) return reject(new Error('지원하지 않는 코덱이에요 (' + codec + ') — H.264 mp4/mov 를 넣어 주세요'));
          const trak = mp4.getTrackById(track.id);
          const vs = trak.samples;
          if (!vs || !vs.length || vs[0].offset == null) return reject(new Error('샘플 표를 만들지 못했어요 (조각 mp4?)'));
          const out = {
            lazy: true, blob: file,
            codec, timescale: track.timescale, w: track.video.width, h: track.video.height,
            rot: rotationOf(trak),
            desc: /^avc/i.test(codec) ? avcDescription(trak.mdia.minf.stbl.stsd.entries[0]) : null,
            samples: vs.map(s => ({ cts: s.cts, duration: s.duration, is_sync: !!s.is_sync, off: s.offset, size: s.size })),
          };
          const atrack = info.audioTracks && info.audioTracks[0];
          out.hasAudio = !!atrack;
          if (atrack) {
            const atrak = mp4.getTrackById(atrack.id), as = atrak.samples;
            if (as && as.length && as[0].offset != null) {
              let acodec = String(atrack.codec || '');
              const adesc = audioDescription(atrak, acodec);
              let achn = atrack.audio && atrack.audio.channel_count;
              if (/^opus/i.test(acodec)) { acodec = 'opus'; if (adesc) achn = adesc[9]; }
              out.a = { lazy: true, blob: file, codec: acodec, timescale: atrack.timescale,
                        samples: as.map(s => ({ cts: s.cts, duration: s.duration, off: s.offset, size: s.size })),
                        sr: atrack.audio && atrack.audio.sample_rate, chn: achn,
                        desc: adesc, edit: editOffsetSec(atrak, atrack.timescale) };
            } else out.hasAudio = false;
          }
          resolve(out);
        } catch (e) { reject(e); }
      };
      try { mp4.appendBuffer(ab); mp4.flush(); } catch (e) { if (!done) { done = true; reject(new Error('mp4 구조를 읽는 중 오류: ' + (e.message || e))); } }
      setTimeout(() => { if (!done) { done = true; reject(new Error('moov 를 해석하지 못했어요')); } }, 3000);
    });
  }

  /* ---------- 음악 파일 → 압축 샘플 (Pcm 입력과 같은 모양) ---------- */
  function demuxA(buffer) {                                  // m4a(오디오만 있는 mp4)
    return new Promise((resolve, reject) => {
      const mp4 = g.MP4Box.createFile();
      let a = null, na = 0, done = false;
      mp4.onError = e => reject(new Error('m4a 를 읽을 수 없어요: ' + e));
      mp4.onReady = info => {
        const at = info.audioTracks && info.audioTracks[0];
        if (!at) return reject(new Error('소리 트랙이 없어요'));
        na = at.nb_samples;
        const atrak = mp4.getTrackById(at.id);
        let acodec = String(at.codec || '');
        const adesc = audioDescription(atrak, acodec);
        let achn = at.audio && at.audio.channel_count;
        if (/^opus/i.test(acodec)) { acodec = 'opus'; if (adesc) achn = adesc[9]; }
        a = { codec: acodec, timescale: at.timescale, samples: [],
              sr: at.audio && at.audio.sample_rate, chn: achn,
              desc: adesc, edit: editOffsetSec(atrak, at.timescale) };
        mp4.setExtractionOptions(at.id, 'a', { nbSamples: 4000 });
        mp4.start();
      };
      mp4.onSamples = (id, user, samples) => {
        for (const s of samples) a.samples.push(s);
        if (!done && a.samples.length >= na) { done = true; resolve(a); }
      };
      buffer.fileStart = 0;
      try { mp4.appendBuffer(buffer); mp4.flush(); } catch (e) { return reject(new Error('m4a 구조를 읽는 중 오류: ' + (e.message || e))); }
      setTimeout(() => { if (!done) { if (a && a.samples.length) { done = true; resolve(a); } else reject(new Error('소리 샘플을 꺼내지 못했어요')); } }, 1500);
    });
  }

  /* mp3 프레임 파서 — MPEG1/2/2.5 Layer III. Xing/Info 메타 프레임은 버리고
     LAME 태그의 인코더 지연이 있으면 edit(초)로 넘겨 Pcm 이 앞을 잘라내게 한다
     (AAC 프라이밍과 같은 자리 — decodeAudioData 의 갭리스 처리와 맞춘다). */
  const MP3_BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const MP3_BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  function parseMp3(u8) {
    let p = 0;
    if (u8.length > 10 && u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33) {  // ID3v2
      const sz = ((u8[6] & 127) << 21) | ((u8[7] & 127) << 14) | ((u8[8] & 127) << 7) | (u8[9] & 127);
      p = 10 + sz + ((u8[5] & 0x10) ? 10 : 0);
    }
    const samples = []; let t = 0, sr0 = 0, chn = 2, edit = 0, junk = 0;
    while (p + 4 <= u8.length) {
      if (!(u8[p] === 0xFF && (u8[p + 1] & 0xE0) === 0xE0)) { p++; if (++junk > 1 << 20 && !samples.length) return null; continue; }
      const b1 = u8[p + 1], b2 = u8[p + 2];
      const ver = (b1 >> 3) & 3, layer = (b1 >> 1) & 3;                  // ver: 0=2.5 2=MPEG2 3=MPEG1
      const brI = (b2 >> 4) & 15, srI = (b2 >> 2) & 3, pad = (b2 >> 1) & 1;
      if (ver === 1 || layer !== 1 || brI === 0 || brI === 15 || srI === 3) { p++; continue; }   // Layer III 만
      const srBase = [44100, 48000, 32000][srI];
      const sr = ver === 3 ? srBase : ver === 2 ? srBase >> 1 : srBase >> 2;
      const br = (ver === 3 ? MP3_BR1 : MP3_BR2)[brI] * 1000;
      const size = Math.floor((ver === 3 ? 144 : 72) * br / sr) + pad;
      if (size < 24 || p + size > u8.length) break;
      const spf = ver === 3 ? 1152 : 576;
      if (!samples.length) {                                             // 첫 프레임이 Xing/Info 면 메타 — 버림
        const mono = ((u8[p + 3] >> 6) & 3) === 3;
        const off = p + 4 + (ver === 3 ? (mono ? 17 : 32) : (mono ? 9 : 17));
        const four = String.fromCharCode(u8[off] || 0, u8[off + 1] || 0, u8[off + 2] || 0, u8[off + 3] || 0);
        if (four === 'Xing' || four === 'Info') {
          for (let q = off; q < p + size - 24; q++) {                    // LAME/Lavc 태그의 delay(12bit)
            const s4 = String.fromCharCode(u8[q], u8[q + 1], u8[q + 2], u8[q + 3]);
            if (s4 === 'LAME' || s4 === 'Lavc' || s4 === 'Lavf') { edit = (((u8[q + 21] << 4) | (u8[q + 22] >> 4)) + 529) / sr; break; }
          }
          if (!edit) edit = (576 + 529) / sr;                            // 태그는 있는데 delay 를 못 읽음 — 관례값
          p += size; continue;
        }
      }
      sr0 = sr0 || sr; if (((u8[p + 3] >> 6) & 3) === 3) chn = Math.min(chn, 1);
      samples.push({ cts: t, duration: spf, data: u8.slice(p, p + size) });
      t += spf; p += size;
    }
    if (!samples.length || !sr0) return null;
    return { codec: 'mp3', timescale: sr0, samples, sr: sr0, chn, desc: null, edit: edit || null };
  }

  /* ADTS .aac 프레임 파서 — 헤더째 넘긴다 (description 없음 = WebCodecs ADTS 모드) */
  const ADTS_SR = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
  function parseAdts(u8) {
    let p = 0; const samples = []; let t = 0, sr0 = 0, chn = 2, aot = 2, junk = 0;
    while (p + 7 <= u8.length) {
      if (!(u8[p] === 0xFF && (u8[p + 1] & 0xF0) === 0xF0)) { p++; if (++junk > 1 << 20 && !samples.length) return null; continue; }
      const prot = u8[p + 1] & 1, srI = (u8[p + 2] >> 2) & 15;
      const len = ((u8[p + 3] & 3) << 11) | (u8[p + 4] << 3) | (u8[p + 5] >> 5);
      if (srI > 12 || len < (prot ? 7 : 9) || p + len > u8.length) { p++; continue; }
      const blocks = (u8[p + 6] & 3) + 1;
      if (!samples.length) { sr0 = ADTS_SR[srI]; chn = Math.max(1, ((u8[p + 2] & 1) << 2) | ((u8[p + 3] >> 6) & 3)); aot = ((u8[p + 2] >> 6) & 3) + 1; }
      samples.push({ cts: t, duration: 1024 * blocks, data: u8.slice(p, p + len) });
      t += 1024 * blocks; p += len;
    }
    if (!samples.length || !sr0) return null;
    return { codec: 'mp4a.40.' + aot, timescale: sr0, samples, sr: sr0, chn: Math.min(2, chn), desc: null, edit: null, adts: true };
  }

  /* wav 직독 — 파일 바이트가 곧 "압축 샘플". Pcm 과 같은 인터페이스(ensure/read/durSec). */
  class PcmWav {
    constructor(buffer) {
      const dv = new DataView(buffer), u8 = new Uint8Array(buffer);
      const tag = o => String.fromCharCode(u8[o], u8[o + 1], u8[o + 2], u8[o + 3]);
      if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('wav 가 아니에요');
      let p = 12, fmt = null, d0 = 0, dn = 0;
      while (p + 8 <= u8.length) {
        const id = tag(p), sz = dv.getUint32(p + 4, true);
        if (id === 'fmt ') fmt = { af: dv.getUint16(p + 8, true), ch: dv.getUint16(p + 10, true), sr: dv.getUint32(p + 12, true), bits: dv.getUint16(p + 22, true) };
        else if (id === 'data') { d0 = p + 8; dn = Math.min(sz, u8.length - d0); }
        p += 8 + sz + (sz & 1);
      }
      if (!fmt || !dn) throw new Error('wav 구조를 읽지 못했어요');
      let af = fmt.af;
      if (af === 0xFFFE) af = fmt.bits === 32 ? 3 : 1;                   // WAVE_FORMAT_EXTENSIBLE — 근사
      if (!((af === 1 && (fmt.bits === 8 || fmt.bits === 16 || fmt.bits === 24 || fmt.bits === 32)) || (af === 3 && fmt.bits === 32))) throw new Error('이 wav 형식(' + fmt.af + '/' + fmt.bits + 'bit)은 지원하지 않아요');
      this.dv = dv; this.d0 = d0; this.af = af; this.bits = fmt.bits; this.chn = Math.max(1, fmt.ch);
      this.sr = this.cfgSr = fmt.sr; this.ch = Math.min(2, this.chn);
      this.total = Math.floor(dn / (this.chn * this.bits / 8));
      this.durSec = this.total / this.sr;
    }
    dispose() { this.dv = null; }
    ensure() { return Promise.resolve(); }
    _at(s, c) {                                                          // 샘플 s, 채널 c → f32
      const B = this.bits / 8, o = this.d0 + (s * this.chn + c) * B, dv = this.dv;
      if (this.af === 3) return dv.getFloat32(o, true);
      if (B === 2) return dv.getInt16(o, true) / 32768;
      if (B === 1) return (dv.getUint8(o) - 128) / 128;
      if (B === 3) { const v = dv.getUint8(o) | (dv.getUint8(o + 1) << 8) | (dv.getInt8(o + 2) << 16); return v / 8388608; }
      return dv.getInt32(o, true) / 2147483648;
    }
    read(t0, n) {
      const out = Array.from({ length: this.ch }, () => new Float32Array(n));
      if (this.dv) {
        let s0 = Math.round(t0 * this.sr);
        for (let i = 0; i < n; i++) { const s = s0 + i; if (s < 0 || s >= this.total) continue; for (let c = 0; c < this.ch; c++) out[c][i] = this._at(s, c); }
      }
      return { sr: this.sr, ch: out };
    }
    /* 분석 1패스: 프레임 RMS(peaks) + 비트용 저역 포락(env, hop=512) */
    scan(fps, nFrames) {
      const peaks = new Float32Array(nFrames), env = [], hop = 512;
      const k = Math.exp(-2 * Math.PI * 180 / this.sr), per = this.sr / fps;
      let lp = 0, wAcc = 0, wCnt = 0, fAcc = 0, fCnt = 0, f = 0;
      for (let s = 0; s < this.total; s++) {
        let v = 0; for (let c = 0; c < this.ch; c++) v += this._at(s, c); v /= this.ch;
        lp = lp * k + v * (1 - k); wAcc += lp * lp;
        if (++wCnt === hop) { env.push(Math.sqrt(wAcc / hop)); wAcc = 0; wCnt = 0; }
        if ((s & 3) === 0) { fAcc += v * v; fCnt++; }
        if (s + 1 >= (f + 1) * per) { if (f < nFrames) peaks[f] = fCnt ? Math.sqrt(fAcc / fCnt) : 0; fAcc = 0; fCnt = 0; f++; }
      }
      return { peaks, env: Float32Array.from(env), envRate: this.sr / hop };
    }
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
      this.blob = a.lazy ? a.blob : null;                 // 지연 소스 — 샘플 바이트는 필요할 때 blob 에서
      const ts = a.timescale, first = a.samples.length ? a.samples[0].cts / ts : 0;
      this.base = a.edit != null ? a.edit : first;
      this.pk = a.samples.map(s => ({ t: s.cts / ts - this.base, d: s.duration / ts, data: s.data || null, off: s.off, size: s.size }));
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
      let i1 = i0; while (i1 < pk.length && pk[i1].t < t1) i1++;
      let views = null;                                   // 지연 소스 — 이 구간 바이트만 묶어 읽는다 (일시 보유)
      if (this.blob && !pk[i0].data) { try { views = await readRuns(this.blob, pk.slice(i0, i1), 262144); } catch (e) { console.warn('[KMV media] pcm read', e); return; } }
      let err = null; const outs = [];
      const run = { in0: Math.round(pk[i0].t * 1e6), firstDur: pk[i0].d, trim0: null };   // 출력 ts 재사상용
      const dec = new AudioDecoder({ output: ad => outs.push(ad), error: e => { err = e; } });
      const cfg = { codec: this.codec, sampleRate: this.cfgSr, numberOfChannels: this.cfgCh }; if (this.desc) cfg.description = this.desc;
      try { dec.configure(cfg); } catch (e) { err = e; }
      for (let i = i0; i < i1 && !err; i++) {
        const p = pk[i];
        try { dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: Math.round(p.t * 1e6), duration: Math.max(0, Math.round(p.d * 1e6)), data: p.data || views[i - i0] })); } catch (e) { err = e; break; }
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
    if (/^mp4a/i.test(a.codec) && !a.desc && !a.adts) return null;          // AAC 는 ASC 필수 (ADTS 는 헤더가 대신)
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
      this.lazy = !!dm.lazy; this.blob = dm.blob || null;               // 지연 소스 — 샘플 바이트는 blob 에서 구간만
      const ts = dm.timescale; this.ts = ts;
      // 표시 순서(cts) 정렬. samples 는 디코드 순서(dts)로 들어온다.
      const dec = dm.samples.map((s, i) => ({ i, cts: s.cts, dur: s.duration, key: !!s.is_sync, data: s.data || null, off: s.off, size: s.size, us: Math.round(s.cts * 1e6 / ts) }));
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
      // 캐시는 ImageBitmap(RGBA) — 바이트 예산으로 상한 (1080p ≈57장 · 4K ≈20장)
      this.cacheMax = Math.max(20, Math.min(CACHE_MAX, Math.floor(CACHE_BYTES / (this.w * this.h * 4))));
      this._bmp = new Set(); this._disposed = false;
      this.decoder = null; this.chain = Promise.resolve(); this.latest = -1;
      this.thumbs = []; this.thumbEvery = Math.max(1, Math.round(this.fps)); this.motion = null; this.peaks = null;
      this.analyzed = false; this.analyzing = false;
    }
    dispose() { this._disposed = true; if (this.pcm) this.pcm.dispose(); if (this._rd) this._rd.drop(); this.cache.forEach(f => { try { f.close(); } catch (e) {} }); this.cache.clear(); try { if (this.decoder) this.decoder.close(); } catch (e) {} this.thumbs.forEach(b => b.close && b.close()); }

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
        /* 실크롬 하드웨어 디코더의 출력 표면(VideoFrame)은 몇 장짜리 풀이다 — 닫지 않고
           들고 있으면 디코더가 출력을 멈춘다(소프트웨어 디코드인 headless 는 안 걸리는 제약).
           → 받자마자 ImageBitmap 으로 복사하고 VideoFrame 은 즉시 닫아 풀에 돌려준다.
           캐시에는 비트맵만 남는다(그리기 호환 — drawFit·seg·필름스트립 전부 drawImage). */
        output: frame => {
          const idx = this.presOfUs.get(frame.timestamp);
          if (idx == null || idx < this.keepFrom) { frame.close(); return; }
          const job = createImageBitmap(frame).then(bmp => {
            try { frame.close(); } catch (e) {}
            if (this._disposed || idx < this.keepFrom) { bmp.close(); return; }
            const old = this.cache.get(idx); if (old) { try { old.close(); } catch (e) {} this.cache.delete(idx); }
            this.cache.set(idx, bmp);
            this._evict(this.keepFrom);
          }).catch(() => { try { frame.close(); } catch (e) {} }).finally(() => this._bmp.delete(job));
          this._bmp.add(job);
        },
        error: e => { console.error('[KMV media] decoder', e); this._decErr = e; },
      });
      const cfg = { codec: this.codec, codedWidth: this.w, codedHeight: this.h, optimizeForLatency: false }; if (this.desc) cfg.description = this.desc;
      this.decoder.configure(cfg);
      this.keepFrom = 0;
    }
    _settle() { return this._bmp.size ? Promise.all(Array.from(this._bmp)).then(() => {}) : Promise.resolve(); }
    async _decodeGop(gi, target) {
      this._ensureDecoder();
      const gp = this.gops[gi];
      this.keepFrom = Math.max(gp.first, target - 6);
      this._decErr = null;
      let views = null;                                          // 지연 소스 — 이 GOP 바이트만 묶어 읽는다
      if (this.lazy) { try { views = await readRuns(this.blob, this.dec.slice(gp.dec, gp.decEnd), 1024 * 1024); } catch (e) { this._decErr = e; } }
      for (let i = gp.dec; i < gp.decEnd && !this._decErr; i++) {
        const s = this.dec[i];
        while (this.decoder.decodeQueueSize > 24) await new Promise(r => setTimeout(r, 2));
        if (this._decErr) break;
        this.decoder.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: s.us, duration: Math.round(s.dur * 1e6 / this.ts), data: s.data || views[i - gp.dec] }));
      }
      try { await this.decoder.flush(); } catch (e) { this._decErr = e; }
      await this._settle();                                        // 비트맵 복사 완료까지 (cached 가 보이도록)
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
    stopStream() { if (this._stream) this._stream.alive = false; this._stream = null; if (this._rd) this._rd.drop(); }
    _startStream(idx) {
      const st = this._stream = { alive: true, target: idx, base: idx, fed: idx - 1 };
      const AHEAD = Math.max(10, Math.min((this.cacheMax || CACHE_MAX) - 8, Math.round(this.fps * 2)));
      this.chain = this.chain.then(async () => {
        if (!st.alive) return;
        try { if (this.decoder) this.decoder.close(); } catch (e) {}
        this.decoder = null; this._ensureDecoder();
        this.keepFrom = Math.max(0, st.target - 6);
        this._decErr = null;
        let gi = this.gopOf(st.base), i = this.gops[gi].dec;
        const i0 = i, tp0 = performance.now();            // 페이스: 첫 12장은 즉시, 이후 실시간 2배 — 시작 폭주가 소리 디코드를 굶기지 않게
        while (st.alive && this._stream === st && i < this.dec.length) {
          if (i - i0 > 12 + (performance.now() - tp0) / 1000 * this.fps * 2) { await new Promise(r => setTimeout(r, 8)); continue; }
          const sm = this.dec[i];
          const pres = this.presOfUs.get(sm.us);
          if (pres != null && pres > st.fed) st.fed = pres;
          if (st.fed > st.target + AHEAD) { await new Promise(r => setTimeout(r, 12)); continue; }   // 충분히 앞섬 — 쉼
          while (this.decoder && this.decoder.decodeQueueSize > 24) await new Promise(r => setTimeout(r, 2));
          if (this._decErr || !st.alive || this._stream !== st) break;
          let bytes = sm.data;
          if (!bytes) {                                              // 지연 소스 — 8MB 창을 굴리며 읽는다
            if (!this._rd) this._rd = fileCursor(this.blob);
            try { bytes = await this._rd.range(sm.off, sm.off + sm.size); } catch (e) { this._decErr = e; break; }
            if (!st.alive || this._stream !== st) break;
          }
          try { this.decoder.decode(new EncodedVideoChunk({ type: sm.key ? 'key' : 'delta', timestamp: sm.us, duration: Math.round(sm.dur * 1e6 / this.ts), data: bytes })); } catch (e) { this._decErr = e; break; }
          i++;
        }
        if (st.alive && this._stream === st && i >= this.dec.length) { try { await this.decoder.flush(); } catch (e) {} await this._settle(); }   // 파일 끝에서만 flush
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
      if (this._stream && this._stream.alive) return;              // 재생 스트림이 앞서 채우는 중 — 뒤에 줄서지 않는다
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
    constructor(id, o) { this.id = id; this.kind = 'audio'; this.audio = o.audio || null; this.pcm = o.pcm || null; this.w = 0; this.h = 0; this.rot = 0; this.fps = 30; this.durSec = this.pcm ? this.pcm.durSec : this.audio.duration; this.frames = Math.max(1, Math.round(this.durSec * 30)); this.thumbs = []; this.thumbEvery = 1e9; this.motion = null; this.peaks = null; this.beats = null; this.analyzed = false; this.analyzing = false; }
    cached() { return null; } nearest() { return null; } getFrame() { return Promise.resolve(null); } prefetch() {} dispose() { this.audio = null; if (this.pcm) { this.pcm.dispose(); this.pcm = null; } }
  }
  function isAudioFile(file) { const name = file.name || ''; return /^audio\//.test(file.type) || /\.(mp3|wav|m4a|aac|ogg|oga|flac|weba)$/i.test(name); }

  /* ---------- 가져오기 ---------- */
  async function open(file, id, status) {
    id = id || uid('m');
    const name = file.name || '미디어';
    if (isAudioFile(file)) {
      status && status('음악 읽는 중');
      if (file.size > MUSIC_MAX_BYTES) throw new Error('음악 파일이 너무 커요 (' + Math.round(file.size / 1048576) + 'MB — ' + Math.round(MUSIC_MAX_BYTES / 1048576) + 'MB 이하만)');
      const buf = await file.arrayBuffer(), u8 = new Uint8Array(buf);
      const four = o => String.fromCharCode(u8[o] || 0, u8[o + 1] || 0, u8[o + 2] || 0, u8[o + 3] || 0);
      let pcm = null;
      try {                                                            // 1) 스트리밍 (압축 샘플 + 구간 디코드 / wav 직독)
        if (four(0) === 'RIFF' && four(8) === 'WAVE') pcm = new PcmWav(buf);
        else if (four(4) === 'ftyp') { await loadMp4box(); pcm = await makePcm(await demuxA(buf)); }
        else if (u8[0] === 0xFF && (u8[1] & 0xF6) === 0xF0) pcm = await makePcm(parseAdts(u8));   // ADTS: 싱크 12비트 + layer 00
        else if (/\.aac$/i.test(name)) pcm = await makePcm(parseAdts(u8));
        else if (/\.mp3$/i.test(name) || four(0).slice(0, 3) === 'ID3' || (u8[0] === 0xFF && (u8[1] & 0xE0) === 0xE0)) pcm = await makePcm(parseMp3(u8));
      } catch (e) { console.warn('[KMV media] music stream', e); pcm = null; }
      if (pcm && pcm.durSec > MUSIC_MAX) { pcm.dispose(); throw new Error('음악은 ' + Math.round(MUSIC_MAX / 60) + '분 이하만'); }
      let audio = null;
      if (!pcm) {                                                      // 2) 폴백 — 예전 통 디코드 (ogg·flac·낯선 코덱·구형 브라우저)
        status && status('음악 푸는 중');
        try { audio = await g.KMV_AUDIO.decode(buf.slice(0)); } catch (e) { throw new Error('이 음악 파일을 풀 수 없어요 (mp3·wav·m4a 권장)'); }
        if (audio.duration > MUSIC_MAX_FULL) throw new Error('음악은 ' + Math.round(MUSIC_MAX_FULL / 60) + '분 이하만 (이 형식은 통으로 풀어야 해요 — mp3·m4a 로 바꾸면 ' + Math.round(MUSIC_MAX / 60) + '분까지)');
      }
      const src = new AudioSource(id, { audio, pcm });
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
    if (file.size > limits.maxFile) throw new Error('이 원본은 너무 커요 (' + Math.round(file.size / 1048576) + 'MB — ' + Math.round(limits.maxFile / 1073741824 * 10) / 10 + 'GB 이하만)');
    status && status('mp4 읽는 중');
    await loadMp4box();
    let dm = null, buf = null;
    try { dm = await demuxLazy(file); }                       // 1) 구간 읽기 — moov(샘플 표)만, 바이트는 지연
    catch (e) { console.warn('[KMV media] lazy demux → 통 읽기 폴백', e.message || e); }
    if (!dm) {                                                // 2) 폴백 — 통 읽기 (조각 mp4 등, 예전 상한)
      if (file.size > FULL_MAX_FILE) throw new Error('이 mp4 는 통으로 읽어야 하는 구조라 ' + Math.round(FULL_MAX_FILE / 1048576) + 'MB 이하만 읽을 수 있어요');
      buf = await file.arrayBuffer();
      dm = await demux(buf);
    }
    if (/^avc/i.test(dm.codec) && !dm.desc) throw new Error('H.264 설정(avcC)을 찾지 못했어요');
    const cfg = { codec: dm.codec, codedWidth: dm.w, codedHeight: dm.h }; if (dm.desc) cfg.description = dm.desc;
    const sup = await VideoDecoder.isConfigSupported(cfg);
    if (!sup.supported) throw new Error('이 영상 코덱을 이 브라우저에서 풀 수 없어요 (' + dm.codec + ')');
    let audio = null, pcm = null;
    if (dm.hasAudio) {
      pcm = await makePcm(dm.a);
      if (!pcm) {                                             // 낯선 코덱·구형 브라우저 — 예전 방식(통 PCM)
        if (file.size <= FULL_MAX_FILE) {
          status && status('소리 푸는 중');
          try { audio = await g.KMV_AUDIO.decode(buf ? buf.slice(0) : await file.arrayBuffer()); } catch (e) { console.warn('[KMV media] audio decode', e); }
        } else console.warn('[KMV media] 소리 코덱 폴백은 ' + Math.round(FULL_MAX_FILE / 1048576) + 'MB 이하만 — 소리 없이 엽니다');
      }
    }
    const src = new VideoSource(id, dm, audio);
    src.pcm = pcm;
    const capSec = dm.lazy ? limits.maxSec : Math.min(limits.maxSec, FULL_MAX_SEC);
    if (src.durSec > capSec) { src.dispose(); throw new Error(Math.round(capSec / 60) + '분 이하 원본만 읽어요' + (dm.lazy ? ' — 더 긴 원본은 잘라서 넣어 주세요' : ' (통으로 읽어야 하는 구조)')); }
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
  /* 스트리밍 분석: 압축 샘플 전체를 한 번 훑어 프레임 RMS(파형)를 계산 (PCM 저장 없음).
     wantEnv 면 비트 마커용 저역 포락(hop=512, KMV_AUDIO.beats 와 같은 수식)도 같은 패스에서 뽑는다. */
  async function pcmScan(src, wantEnv, onProgress) {
    const P = src.pcm, n = src.frames, acc = new Float64Array(n), cnt = new Float64Array(n);
    const HOP = 512, envArr = []; const ev = { lp: 0, k: 0, wAcc: 0, wCnt: 0, sr: 0 };
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
        if (wantEnv) {                                       // 저역 포락 — 모든 샘플, 출력 순서대로 연속
          if (!ev.sr) { ev.sr = sr; ev.k = Math.exp(-2 * Math.PI * 180 / sr); }
          const skip = t < 0 ? Math.min(N, Math.ceil(-t * sr)) : 0;   // 프라이밍(0초 이전)은 버림
          for (let i = skip; i < N; i++) {
            const v = mono[i] / C;
            ev.lp = ev.lp * ev.k + v * (1 - ev.k); ev.wAcc += ev.lp * ev.lp;
            if (++ev.wCnt === HOP) { envArr.push(Math.sqrt(ev.wAcc / HOP)); ev.wAcc = 0; ev.wCnt = 0; }
          }
        }
        ad.close();
      }
      outs.length = 0;
    };
    const BLK = 768; let views = null, blk0 = 0;                 // 지연 소스 — 768샘플 블록씩 바이트를 읽어가며
    for (let i = 0; i < P.pk.length && !err; i++) {
      const p = P.pk[i];
      while (analyzePaused && !err) await new Promise(r => setTimeout(r, 200));
      if (P.blob && !p.data && (!views || i >= blk0 + BLK)) {
        blk0 = i;
        try { views = await readRuns(P.blob, P.pk.slice(i, Math.min(P.pk.length, i + BLK)), 262144); } catch (e) { err = e; break; }
      }
      try { dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: Math.round(p.t * 1e6), duration: Math.max(0, Math.round(p.d * 1e6)), data: p.data || views[i - blk0] })); } catch (e) { err = e; break; }
      if (dec.decodeQueueSize > 32) await new Promise(r => setTimeout(r, 2));
      if (outs.length > 64) drain();
      if (onProgress && (i & 511) === 0) onProgress(i / P.pk.length);
    }
    try { await dec.flush(); } catch (e) {}
    try { dec.close(); } catch (e) {}
    drain();
    if (err) console.warn('[KMV media] pcmScan', err);
    const peaks = new Float32Array(n);
    for (let f = 0; f < n; f++) peaks[f] = cnt[f] ? Math.sqrt(acc[f] / cnt[f]) : 0;
    return { peaks, env: Float32Array.from(envArr), envRate: ev.sr ? ev.sr / HOP : 0 };
  }

  async function analyze(id, onProgress) {
    const src = SRC.get(id); if (!src || src.analyzed || src.analyzing) return;
    if (src.kind === 'audio') {
      src.analyzing = true;
      await new Promise(r => setTimeout(r, 0));
      try {
        if (src.pcm && src.pcm.scan) {                       // wav 직독 — 동기 1패스
          const r = src.pcm.scan(src.fps, src.frames);
          src.peaks = r.peaks; src.beats = g.KMV_AUDIO.beatsFromEnv(r.env, r.envRate);
        } else if (src.pcm) {                                // mp3·m4a·aac — 스트리밍 디코드 1패스
          const r = await pcmScan(src, true, onProgress);
          src.peaks = r.peaks; src.beats = g.KMV_AUDIO.beatsFromEnv(r.env, r.envRate);
        } else {                                             // 폴백 — 통 버퍼
          src.peaks = audioPeaks(src.audio, src.fps, src.frames);
          src.beats = g.KMV_AUDIO.beats(src.audio);
        }
      } catch (e) { console.warn('[KMV media] music analyze', e); if (!src.peaks) src.peaks = new Float32Array(src.frames); src.beats = src.beats || []; }
      src.analyzed = true; src.analyzing = false; onProgress && onProgress(1); return;
    }
    if (src.kind !== 'video') return;
    src.analyzing = true;
    // 파형
    if (src.pcm) {
      try { src.peaks = (await pcmScan(src, false)).peaks; } catch (e) { console.warn('[KMV media] pcm peaks', e); }
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
    const ST = g.KMV_STAB;                                   // 흔들림 잡기 — 이 훑기에 얹는다(추가 디코드 0)
    const shake = ST ? { x: new Float32Array(src.frames), y: new Float32Array(src.frames), ok: new Uint8Array(src.frames), cut: new Uint8Array(src.frames) } : null;
    if (shake) src.shake = shake;
    let prev = null, prevProf = null, count = 0, err = null;
    const pendingThumbs = [];
    const mkDec = () => new VideoDecoder({
      output: frame => {
        const idx = src.presOfUs.get(frame.timestamp);
        if (idx == null) { frame.close(); return; }
        ctx.drawImage(frame, 0, 0, SW, SH);
        const d = ctx.getImageData(0, 0, SW, SH).data;
        const cur = new Uint8Array(SW * SH);
        for (let i = 0, j = 0; i < d.length; i += 4, j++) cur[j] = (d[i] * 77 + d[i + 1] * 151 + d[i + 2] * 28) >> 8;
        if (prev) { let sum = 0; for (let j = 0; j < cur.length; j++) sum += Math.abs(cur[j] - prev[j]); motion[idx] = sum / cur.length / 255; }
        prev = cur;
        if (shake) {
          const pf = ST.profile(cur, SW, SH);
          if (prevProf) { const e = ST.estimate(prevProf, pf); shake.x[idx] = e.dx; shake.y[idx] = e.dy; shake.ok[idx] = e.ok ? 1 : 0; }
          if (motion[idx] > 0.10) shake.cut[idx] = 1;        // 장면 경계 — 여기서 궤적을 끊는다 (auto.sceneCuts 와 같은 문턱)
          prevProf = pf;
        }
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
    let dec = mkDec();
    try {
      const cfg = { codec: src.codec, codedWidth: src.w, codedHeight: src.h }; if (src.desc) cfg.description = src.desc;
      dec.configure(cfg);
      const rd = src.lazy ? fileCursor(src.blob) : null;           // 분석 전용 읽기 창 (재생 창과 분리)
      let tries = 0;
      for (let i = 0; i < src.dec.length; i++) {
        while (analyzePaused && !err) await new Promise(r => setTimeout(r, 200));    // 재생이 끝날 때까지 양보
        while (dec.decodeQueueSize > 16 && !err) await new Promise(r => setTimeout(r, 4));
        if (err) {
          // 탐색(getFrame) 등 다른 디코더와 경쟁하다 죽을 수 있다 — 새 디코더로 키프레임부터 이어서
          if (++tries > 4) break;
          console.warn('[KMV media] analyze 디코더 재시작 ' + tries, err);
          err = null; prev = null; prevProf = null;
          try { dec.close(); } catch (e) {}
          await new Promise(r => setTimeout(r, 300));               // 경쟁 상대가 지나가게 잠깐 양보
          dec = mkDec(); dec.configure(cfg);
          while (i > 0 && !src.dec[i].key) i--;
        }
        const s = src.dec[i];
        const bytes = s.data || await rd.range(s.off, s.off + s.size);
        dec.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: s.us, data: bytes }));
      }
      if (!err) { await dec.flush(); await Promise.all(pendingThumbs); }
      else console.warn('[KMV media] analyze 재시도 소진', err);
    } catch (e) { err = e; console.warn('[KMV media] analyze', e); }
    try { dec.close(); } catch (e) {}
    // 모션량 정규화: 95퍼센타일을 1 로
    const sorted = Array.from(motion).sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
    src.diff = Float32Array.from(motion);                   // 정규화 전 원값(평균 절대 차 0..1) — 장면 경계(컷) 찾기용, 정규화하면 큰 움직임과 컷이 같은 1 로 뭉개진다
    for (let i = 0; i < motion.length; i++) motion[i] = Math.min(1, motion[i] / p95);
    src.motion = motion; src.analyzed = true; src.analyzing = false;
    onProgress && onProgress(1);
  }

  /* 원본(회전 포함)을 W×H 안에 비율 유지로 꽉 채워 그림 — 렌더·썸네일 공용 */
  /* fill = {cover:true, cx, cy} 면 화면을 꽉 채우도록 키우고(cover) 초점(cx,cy: 원본 0~1)이 가운데로 오게 민다.
     fill.zoom(>1) 은 더 키워 여백을 만들고, fill.sx·sy(화면 크기 비율) 만큼 민다 — 흔들림 잡기가 쓴다.
     화면 밖으로 빈틈이 생기지 않도록 이동량은 잘린 만큼으로 한계를 둔다. 없으면 예전 그대로 레터박스(contain). */
  function drawFit(ctx, img, W, H, rot, iw, ih, fill) {
    iw = iw || img.displayWidth || img.width; ih = ih || img.displayHeight || img.height;
    const rotated = rot === 90 || rot === 270;
    const dw = rotated ? ih : iw, dh = rotated ? iw : ih;
    const cover = !!(fill && fill.cover);
    const zoom = fill && fill.zoom > 1 ? fill.zoom : 1;
    const sc = (cover ? Math.max(W / dw, H / dh) : Math.min(W / dw, H / dh)) * zoom;
    let px = 0, py = 0;
    if (cover || zoom > 1) {
      const ox = Math.max(0, dw * sc - W) / 2, oy = Math.max(0, dh * sc - H) / 2;
      const cx = fill && fill.cx != null ? fill.cx : 0.5, cy = fill && fill.cy != null ? fill.cy : 0.5;
      const shx = (fill && fill.sx ? fill.sx : 0) * W, shy = (fill && fill.sy ? fill.sy : 0) * H;
      px = Math.max(-ox, Math.min(ox, (0.5 - cx) * dw * sc + shx));
      py = Math.max(-oy, Math.min(oy, (0.5 - cy) * dh * sc + shy));
    }
    ctx.save();
    ctx.translate(W / 2 + px, H / 2 + py);
    if (rot) ctx.rotate(rot * Math.PI / 180);
    try { ctx.drawImage(img, -iw * sc / 2, -ih * sc / 2, iw * sc, ih * sc); } catch (e) { /* 닫힌 프레임 */ }
    ctx.restore();
  }

  /* 생성 배경음악 — 파일 없이 스펙만으로 소스를 만든다(KMV_GEN). 분석도 필요 없다(비트·파형을 이미 안다). */
  function addGen(meta) {
    const G = g.KMV_GEN; if (!G || !meta || !meta.gen) return null;
    const gs = G.source(meta.gen);
    const src = new AudioSource(meta.id, { pcm: gs });
    src.gen = meta.gen; src.beats = gs.beats.slice(); src.peaks = gs.peaks(30); src.frames = Math.max(1, Math.round(gs.durSec * 30)); src.analyzed = true;
    SRC.set(meta.id, src);
    return meta;
  }

  g.KMV_MEDIA = {
    supported, open, analyze, addGen, drawFit, isAudioFile, limits, setAnalyzePaused,
    stopStreams: () => { SRC.forEach(s => { if (s.stopStream) s.stopStream(); }); },
    get: id => SRC.get(id) || null,
    has: id => SRC.has(id),
    remove: id => { const s = SRC.get(id); if (s) { s.dispose(); SRC.delete(id); } },
    THUMB_W, THUMB_H,
  };
})(typeof window !== 'undefined' ? window : globalThis);
