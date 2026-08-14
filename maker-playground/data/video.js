/* ============================================================
   MK_VIDEO — R38 이식 3차(다리): MP4 실출력
   kmake/video.js(WebCodecs·mp4-muxer)를 플레이그라운드 문서 모델로 이식.
   구조: 장면×요소를 MK_RENDER 로 스프라이트 래스터 1회 → 프레임마다
   MK_PLAY 등장 계획(enterPlan)을 수치 보간(stateAt)해 캔버스 합성 →
   VideoFrame → VideoEncoder(H.264, 배압 관리) → Mp4Muxer. 전부 브라우저 안 —
   서버 0원, 실시간 녹화가 아니라 프레임 드랍 0. 장면 전환 = 크로스페이드.
   순수 계층(easeAt·stateAt·framePlan·fitRect·musicTimeline)은 jsdom 완전 검증,
   인코딩·시킹은 실브라우저 몫. R39: 삽입 영상 프레임 시킹 합성 + 장면 music
   오디오 트랙(AAC 모노) 먹싱 — 같은 음악은 장면을 넘어 이어짐(플레이어 규약 동일).
   ============================================================ */
window.MK_VIDEO = (() => {
  'use strict';
  const FPS = 30, TRANS_DUR = 0.5, BITRATE = 8_000_000, KEY_EVERY = 60, QUEUE_MAX = 8, MAX_SEC = 120;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const even = (n) => Math.max(2, 2 * Math.round(n / 2));
  let busy = false;

  /* ---------- 이징 (CSS 근사) ---------- */
  function easeAt(name, p) {
    p = clamp(p, 0, 1);
    if (name === 'linear') return p;
    if (name === 'ease-in') return p * p * p;
    if (name === 'ease-in-out') return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    return 1 - Math.pow(1 - p, 3);              /* ease·ease-out 기본 */
  }

  /* ---------- 요소의 시각 t 상태 — MK_PLAY 프리셋의 수치판 ----------
     반환 {alpha, dx, dy(px@720), scale, rot(추가 deg), clipW(0~1|null), blur(px)} */
  function stateAt(plan, el, t) {
    const st = { alpha: 1, dx: 0, dy: 0, scale: 1, rot: 0, clipW: null, clipH: null, blur: 0 };
    if (plan) {
      const raw = (t - plan.delay) / plan.dur;
      if (raw <= 0) { st.alpha = 0; return st; }
      const q = clamp(raw, 0, 1), p = easeAt(plan.ease, q);
      const n = plan.name;
      if (n === 'mkp-fade') st.alpha = p;
      else if (n === 'mkp-slide-up') { st.alpha = p; st.dy = (1 - p) * 26; }
      else if (n === 'mkp-slide-down') { st.alpha = p; st.dy = -(1 - p) * 26; }
      else if (n === 'mkp-slide-left') { st.alpha = p; st.dx = (1 - p) * 26; }
      else if (n === 'mkp-slide-right') { st.alpha = p; st.dx = -(1 - p) * 26; }
      else if (n === 'mkp-scale') { st.alpha = p; st.scale = 0.82 + 0.18 * p; }
      else if (n === 'mkp-zoom') { st.alpha = p; st.scale = 1.14 - 0.14 * p; }
      else if (n === 'mkp-pop') {
        if (p <= 0.7) { const k = p / 0.7; st.alpha = k; st.scale = 0.6 + 0.46 * k; }
        else { st.alpha = 1; st.scale = 1.06 - 0.06 * (p - 0.7) / 0.3; }
      } else if (n === 'mkp-bounce') {
        st.alpha = Math.min(1, p / 0.55);
        if (p <= 0.55) st.dy = -34 + 40 * (p / 0.55);
        else if (p <= 0.78) st.dy = 6 - 9 * (p - 0.55) / 0.23;
        else st.dy = -3 + 3 * (p - 0.78) / 0.22;
      } else if (n === 'mkp-wipe') { st.alpha = 1; st.clipW = p; }
      else if (n === 'mkp-wipe-v') { st.alpha = 1; st.clipH = p; }
      else if (n === 'mkp-blur') { st.alpha = p; st.blur = (1 - p) * 9; }
      else if (n === 'mkp-rotate') { st.alpha = p; st.rot = -7 * (1 - p); st.scale = 0.94 + 0.06 * p; }
      else st.alpha = p;
    }
    /* idle — 등장이 끝난 뒤 은은하게 (CSS keyframe 0/50/100 근사) */
    const endT = plan ? plan.delay + plan.dur : 0;
    if (el && el.anim && t >= endT) {
      if (el.anim.idle === 'float') { const fr = ((t - endT) % 3.2) / 3.2; st.dy += -5 * (1 - Math.cos(2 * Math.PI * fr)) / 2; }
      else if (el.anim.idle === 'pulse') { const fr = ((t - endT) % 2.6) / 2.6; st.scale *= 1 + 0.02 * (1 - Math.cos(2 * Math.PI * fr)) / 2; }
      else if (/^kb-/.test(el.anim.idle || '') && window.MK_COMPOSE) {
        /* R52 켄번즈 — CSS(linear forwards)와 동일 수치: enter 종료 후 잔여 씬 길이 동안 진행 */
        const span = Math.max(0.8, (el.anim.idleDur || 4) - endT);
        const kb = window.MK_COMPOSE.kbState(el.anim.idle, (t - endT) / span);
        st.scale *= kb.scale; st.dx += kb.dx; st.dy += kb.dy;
      }
    }
    return st;
  }

  /* ---------- R39 순수 계층 — 영상 기하·음악 타임라인 ---------- */
  const isVideoEl = (el) => !!(el && el.src && (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src)));
  const secondsInto = (t, dur) => (dur > 0 && isFinite(dur) ? ((t % dur) + dur) % dur : 0);
  /* 소스(vw×vh)를 틀(fw×fh)에 맞추는 기하 — cover=소스 크롭, contain=목적지 축소 */
  function fitRect(vw, vh, fw, fh, fit, focal) {
    vw = Math.max(1, vw || 1); vh = Math.max(1, vh || 1);
    if (fit === 'contain') {
      const s = Math.min(fw / vw, fh / vh), dw = vw * s, dh = vh * s;
      return { mode: 'contain', dx: (fw - dw) / 2, dy: (fh - dh) / 2, dw, dh };
    }
    const s = Math.max(fw / vw, fh / vh), sw = fw / s, sh = fh / s;
    /* R94 — 초점: 소스 크롭 원점이 (vw-sw)·fx — 기본 0.5 = 종전 가운데와 동일 값 */
    const fx = focal && isFinite(+focal.x) ? Math.max(0, Math.min(1, +focal.x)) : 0.5;
    const fy = focal && isFinite(+focal.y) ? Math.max(0, Math.min(1, +focal.y)) : 0.5;
    return { mode: 'cover', sx: (vw - sw) * fx, sy: (vh - sh) * fy, sw, sh };
  }
  /* R117 — 애니 변형(등장 scale·rotate 델타·켄번즈)의 캔버스 피벗.
     정본은 MK_FOCAL.originOf 하나 — 재생 CSS transform-origin 이 같은 수를 읽어
     패리티가 구조로 성립. null = 종전 중앙(cx·cy) 폴백. 순수 함수 — 하니스 직측. */
  function animPivot(el, ex, ey, ew, eh) {
    const F = window.MK_FOCAL;
    const og = F && F.originOf ? F.originOf(el) : null;
    return og ? { px: ex + ew * og.x, py: ey + eh * og.y } : null;
  }
  /* 장면 music → 시간 구간 — MK_PLAY 규약 그대로: 같은 음악은 장면을 넘어 이어짐 */
  function musicTimeline(doc, planIn) {
    const plan = planIn || framePlan(doc, {});
    const segments = []; let t = 0;
    plan.scenes.forEach((ps) => {
      const sc = doc.scenes[ps.sceneIdx], m = sc && sc.music;
      const key = m ? (m.src ? 'src:' + String(m.src).slice(0, 64) : (m.synth ? 'synth:' + m.synth : null)) : null;
      if (key) {
        const last = segments[segments.length - 1];
        if (last && last.key === key && Math.abs(last.end - t) < 1e-6) last.end = t + ps.durSec;
        else segments.push({ key, start: t, end: t + ps.durSec, music: m });
      }
      t += ps.durSec;
    });
    return { totalSec: plan.totalSec, segments };
  }

  /* ---------- 프레임 플랜 — 순수 (MK_PLAY.sequence 기준 그대로) ---------- */
  function framePlan(doc, o) {
    o = o || {};
    const fps = o.fps || FPS;
    const seq = window.MK_PLAY.sequence(doc);
    let total = 0;
    const scenes = seq.map((s, i) => {
      const durSec = s.durMs / 1000;
      const frames = Math.max(1, Math.round(durSec * fps));
      total += frames;
      return { sceneIdx: s.sceneIdx, durSec, frames, transIn: i > 0 ? TRANS_DUR : 0 };
    });
    const capped = total / fps > MAX_SEC;
    return { fps, scenes, totalFrames: total, totalSec: total / fps, capped, transDur: TRANS_DUR };
  }

  /* ---------- 스프라이트 래스터 — 장면 배경 1장 + 요소별 투명 1장 ---------- */
  function rasterToImage(dataUrl) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('스프라이트 래스터 실패'));
      im.src = dataUrl;
    });
  }
  async function sceneSprites(scene, scale) {
    const R = window.MK_RENDER;
    const bgOut = await R.toRaster(R.renderScene({ ...scene, elements: [] }, {}), { format: 'png', scale });
    const bg = await rasterToImage(bgOut.dataUrl);
    const els = [], vids = [];
    for (let i = 0; i < scene.elements.length; i++) {
      if (isVideoEl(scene.elements[i])) {                 /* R39 — 영상은 스프라이트 대신 프레임 시킹 */
        els.push(null);
        vids.push(await loadVideo(scene.elements[i].src));
        continue;
      }
      vids.push(null);
      const only = { ...scene, background: 'rgba(0,0,0,0)', elements: [scene.elements[i]] };
      const out = await R.toRaster(R.renderScene(only, {}), { format: 'png', scale, transparent: true });
      els.push(await rasterToImage(out.dataUrl));
    }
    return { bg, els, vids };
  }

  /* ---------- R39 — 삽입 영상 프레임 재생 (시킹 기반 — 실시간 아님, 드랍 0) ---------- */
  function loadVideo(src) {
    return new Promise((res) => {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.preload = 'auto';
      let done = false;
      const fin = (val) => { if (!done) { done = true; res(val); } };
      v.onloadeddata = () => fin(v);
      v.onerror = () => fin(null);
      try { v.src = src; } catch (_) { fin(null); }
      setTimeout(() => fin(v.readyState >= 2 ? v : null), 5000);
    });
  }
  function seekTo(v, t) {
    return new Promise((res) => {
      if (!v || !(v.duration > 0) || !isFinite(v.duration)) return res();
      const target = secondsInto(t, v.duration);
      if (Math.abs(v.currentTime - target) < 1 / (2 * FPS)) return res();
      let done = false;
      const fin = () => { if (!done) { done = true; v.removeEventListener('seeked', fin); res(); } };
      v.addEventListener('seeked', fin);
      try { v.currentTime = target; } catch (_) { fin(); }
      setTimeout(fin, 400);                               /* 시킹 지연 상한 — 프레임은 마지막 디코드분 사용 */
    });
  }

  /* ---------- R39 — 소리 트랙 준비: 타임라인 → 모노 PCM 마스터 ---------- */
  async function buildMasterPCM(timeline, sr) {
    const n = Math.max(1, Math.round(timeline.totalSec * sr));
    const master = new Float32Array(n);
    const FADE = Math.round(0.06 * sr);                   /* 구간 경계 클릭 방지 */
    for (const seg of timeline.segments) {
      const st = Math.round(seg.start * sr), en = Math.min(n, Math.round(seg.end * sr));
      const len = en - st;
      if (len <= 0) continue;
      let pcm = null;
      if (seg.music.synth && window.MK_AUDIO) {
        pcm = window.MK_AUDIO.renderPattern(seg.music.synth, len / sr, sr);
      } else if (seg.music.src) {
        pcm = await decodeToPCM(seg.music.src, len, sr);  /* 실패 시 null → 그 구간만 무음(정직) */
      }
      if (!pcm) continue;
      /* R52 — 영상 끝에 닿는 구간은 fadeOut(1.2s), 아니면 경계 클릭 방지만 */
      const atEnd = Math.abs(seg.end - timeline.totalSec) < 0.05;
      const OUT = atEnd ? Math.min(len, Math.round(1.2 * sr)) : FADE;
      for (let i = 0; i < len; i++) {
        let g = 0.85;
        if (i < FADE) g *= i / FADE;
        if (len - i < OUT) g *= (len - i) / OUT;
        master[st + i] += (pcm[i] || 0) * g;
      }
    }
    for (let i = 0; i < n; i++) master[i] = clamp(master[i], -1, 1);
    return master;
  }
  async function decodeToPCM(src, lenSamples, sr) {
    try {
      const buf = await (await fetch(src)).arrayBuffer();
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OAC) return null;
      const ab = await new OAC(1, 1, sr).decodeAudioData(buf);   /* 컨텍스트 sr 로 리샘플 */
      const chs = []; for (let c = 0; c < ab.numberOfChannels; c++) chs.push(ab.getChannelData(c));
      const src0 = ab.length;
      const out = new Float32Array(lenSamples);
      for (let i = 0; i < lenSamples; i++) {
        const j = i % src0;                               /* 루프 — 플레이어 loop 규약과 동일 */
        let s = 0; for (const ch of chs) s += ch[j];
        out[i] = s / chs.length;
      }
      return out;
    } catch (_) { return null; }
  }

  function loadMuxer() {
    return new Promise((res, rej) => {
      if (window.Mp4Muxer) return res();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js';
      s.onload = res; s.onerror = () => rej(new Error('MP4 모듈을 불러올 수 없어요 — 네트워크를 확인해 주세요'));
      document.head.appendChild(s);
    });
  }
  const waitQueue = (encoder) => new Promise((res) => {
    if (encoder.encodeQueueSize <= QUEUE_MAX) return res();
    const iv = setInterval(() => { if (encoder.encodeQueueSize <= QUEUE_MAX) { clearInterval(iv); res(); } }, 4);
  });

  /* ---------- 본체 ---------- */
  async function exportMP4(doc, opts) {
    opts = opts || {};
    const say = opts.onProgress || (() => {});
    if (busy) return { ok: false, msg: '이미 만드는 중이에요' };
    if (typeof VideoEncoder === 'undefined') return { ok: false, msg: '이 브라우저는 영상 저장을 지원하지 않아요 (크롬·엣지 최신 버전을 써주세요)' };
    const plan = framePlan(doc, {});
    if (plan.capped) return { ok: false, msg: `전체 길이가 ${MAX_SEC}초를 넘어요 — 장면 시간을 줄여 주세요` };
    busy = true;
    let encoder = null, encError = null, lastBitmap = null;
    try {
      await loadMuxer();
      const dl0 = window.MK_RENDER.renderScene(doc.scenes[0], {});
      const scale = 1080 / Math.min(dl0.width, dl0.height);           /* 1280×720 → 1920×1080 */
      const W = even(dl0.width * scale), H = even(dl0.height * scale);
      const pxu = H / 720;                                            /* CSS px(모달 기준) → 출력 px */
      const out = document.createElement('canvas'); out.width = W; out.height = H;
      const ctx = out.getContext('2d');

      /* R39 — 소리 트랙: 장면 music 이 있고 AudioEncoder 지원 시에만 */
      const SR = 48000;
      const timeline = musicTimeline(doc, plan);
      const wantAudio = timeline.segments.length > 0;
      const canAudio = wantAudio && typeof AudioEncoder !== 'undefined';
      let masterPCM = null, audioMsg = '';
      if (wantAudio && !canAudio) audioMsg = '이 브라우저는 소리 저장을 지원하지 않아 무음으로 저장했어요';
      if (canAudio) {
        say('소리 준비 중…');
        masterPCM = await buildMasterPCM(timeline, SR);
      }

      const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: 'avc', width: W, height: H },
        ...(canAudio ? { audio: { codec: 'aac', sampleRate: SR, numberOfChannels: 1 } } : {}),
        fastStart: 'in-memory',
      });
      encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { encError = e; },
      });
      encoder.configure({ codec: 'avc1.420028', width: W, height: H, bitrate: BITRATE, framerate: FPS });

      let frameIdx = 0;
      for (let si = 0; si < plan.scenes.length; si++) {
        const scene = doc.scenes[plan.scenes[si].sceneIdx];
        say(`장면 ${si + 1}/${plan.scenes.length} 준비 중…`);
        const sp = await sceneSprites(scene, scale);
        const plans = scene.elements.map((el, i) => window.MK_PLAY.enterPlan(el, i, scene.anim));
        const frames = plan.scenes[si].frames;

        for (let f = 0; f < frames; f++) {
          if (encError) throw encError;
          const t = f / FPS;
          /* R39 — 영상 요소 프레임 시킹 (그리기 전에 완료) */
          for (let i = 0; i < scene.elements.length; i++) {
            if (sp.vids[i]) await seekTo(sp.vids[i], t);
          }
          ctx.globalAlpha = 1; ctx.filter = 'none';
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(sp.bg, 0, 0, W, H);
          scene.elements.forEach((el, i) => {
            const st = stateAt(plans[i], el, t);
            if (st.alpha <= 0.001) return;
            if (!sp.els[i] && !sp.vids[i]) return;         /* 영상 로드 실패 — 정직하게 비움 */
            ctx.save();
            ctx.globalAlpha = clamp(st.alpha, 0, 1);
            const ex = el.x / 100 * W, ew = el.w / 100 * W;
            const ey = el.y / 100 * H;
            const eh = (el.h != null ? el.h / 100 * H : H * 0.2);
            const cx = ex + ew / 2, cy = ey + eh / 2;
            if (st.clipW != null) { ctx.beginPath(); ctx.rect(ex, 0, ew * st.clipW, H); ctx.clip(); }
            if (st.clipH != null) { ctx.beginPath(); ctx.rect(0, ey, W, eh * st.clipH); ctx.clip(); }
            if (st.blur > 0.2) { try { ctx.filter = `blur(${(st.blur * pxu).toFixed(1)}px)`; } catch (_) {} }
            const og = animPivot(el, ex, ey, ew, eh);       /* R117 — 무회전 초점 축, null=중앙 */
            const isPan = /^kb-(pan|diagonal)/.test((el.anim && el.anim.idle) || '');
            const rp = (!og && !isPan && window.MK_FOCAL && window.MK_FOCAL.rotPivot) ? window.MK_FOCAL.rotPivot(el, ex, ey, ew, eh) : null; /* R119 — 회전 초점 축, 피벗=R(θ)·Fs */
            const pv = og || rp;
            const pvx = pv ? pv.px : cx, pvy = pv ? pv.py : cy;
            ctx.translate(pvx, pvy);
            if (st.rot) ctx.rotate(st.rot * Math.PI / 180);
            if (st.scale !== 1) ctx.scale(st.scale, st.scale);
            ctx.translate(-pvx + st.dx * pxu, -pvy + st.dy * pxu);
            if (sp.vids[i]) {                              /* R39 — 영상: radius 클립 + fit 기하 */
              const v = sp.vids[i];
              const rr = el.radius ? (el.radius > 100 ? Math.min(ew, eh) / 2 : Math.min(el.radius * pxu, Math.min(ew, eh) / 2)) : 0;
              ctx.beginPath();
              if (rr > 0 && ctx.roundRect) ctx.roundRect(ex, ey, ew, eh, rr);
              else ctx.rect(ex, ey, ew, eh);
              ctx.clip();
              const fr = fitRect(v.videoWidth, v.videoHeight, ew, eh, el.fit, el.focal); /* R94 */
              if (fr.mode === 'cover') ctx.drawImage(v, fr.sx, fr.sy, fr.sw, fr.sh, ex, ey, ew, eh);
              else ctx.drawImage(v, ex + fr.dx, ey + fr.dy, fr.dw, fr.dh);
            } else {
              ctx.drawImage(sp.els[i], 0, 0, W, H);
            }
            ctx.restore();
          });
          /* 크로스페이드 — 이전 장면 마지막 프레임을 걷어냄 (kmake 방식) */
          if (si > 0 && lastBitmap && t < TRANS_DUR) {
            ctx.save(); ctx.globalAlpha = 1 - t / TRANS_DUR; ctx.filter = 'none';
            ctx.drawImage(lastBitmap, 0, 0, W, H); ctx.restore();
          }
          const vf = new VideoFrame(out, { timestamp: Math.round(frameIdx * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
          await waitQueue(encoder);
          encoder.encode(vf, { keyFrame: frameIdx % KEY_EVERY === 0 });
          vf.close();
          frameIdx++;
          if (frameIdx % 8 === 0 || f === frames - 1) {
            say(`영상 만드는 중… ${Math.round(frameIdx / plan.totalFrames * 100)}%`);
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        if (lastBitmap && lastBitmap.close) lastBitmap.close();
        lastBitmap = await createImageBitmap(out);
        sp.vids.forEach((v) => { if (v) { try { v.src = ''; v.load && v.load(); } catch (_) {} } });
      }
      say('인코딩 마무리 중…');
      await encoder.flush();
      if (encError) throw encError;
      /* R39 — 소리 트랙 인코딩 (AAC 모노) */
      if (canAudio && masterPCM) {
        say('소리 입히는 중…');
        const aenc = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error: (e) => { encError = e; },
        });
        aenc.configure({ codec: 'mp4a.40.2', sampleRate: SR, numberOfChannels: 1, bitrate: 128000 });
        const CH = 1024;
        for (let off = 0; off < masterPCM.length; off += CH) {
          const nF = Math.min(CH, masterPCM.length - off);
          const ad = new AudioData({
            format: 'f32-planar', sampleRate: SR, numberOfFrames: nF, numberOfChannels: 1,
            timestamp: Math.round(off / SR * 1e6),
            data: masterPCM.slice(off, off + nF),
          });
          aenc.encode(ad); ad.close();
          if ((off / CH) % 64 === 0) await new Promise((r) => setTimeout(r, 0));
        }
        await aenc.flush(); aenc.close();
        if (encError) throw encError;
      }
      muxer.finalize();
      const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(doc.title || '케이메이커').replace(/[^\w가-힣 _-]/g, '')}.mp4`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return { ok: true, sec: Math.round(plan.totalSec), w: W, h: H, frames: plan.totalFrames,
        audio: !!(canAudio && masterPCM), audioMsg };
    } catch (e) {
      return { ok: false, msg: (e && e.message) || '영상 저장에 실패했어요' };
    } finally {
      try { if (encoder && encoder.state !== 'closed') encoder.close(); } catch (_) {}
      if (lastBitmap && lastBitmap.close) lastBitmap.close();
      busy = false;
    }
  }

  /* ---------- 판정 ---------- */
  function videoAudit() {
    const v = [];
    /* 이징 경계 */
    if (easeAt('ease-out', 0) !== 0 || easeAt('ease-out', 1) !== 1 || easeAt('linear', 0.5) !== 0.5) v.push('이징 경계 위반');
    /* 프리셋 수치 보간 — 등장 전 투명 · 종료 후 정착 */
    const mk = (name) => ({ name, delay: 0.2, dur: 0.6, ease: 'ease-out' });
    if (stateAt(mk('mkp-pop'), {}, 0).alpha !== 0) v.push('등장 전 alpha 0 위반');
    const done = stateAt(mk('mkp-pop'), {}, 1.0);
    if (Math.abs(done.alpha - 1) > 1e-9 || Math.abs(done.scale - 1) > 1e-9) v.push('pop 정착 실패');
    const mid = stateAt(mk('mkp-slide-left'), {}, 0.4);
    if (!(mid.alpha > 0 && mid.alpha < 1 && mid.dx > 0)) v.push('slide 중간 상태 위반');
    if (stateAt(mk('mkp-wipe'), {}, 0.4).clipW == null) v.push('wipe 클립 미산출');
    if (!(stateAt(mk('mkp-blur'), {}, 0.25).blur > 0)) v.push('blur 산출 실패');
    const idle = stateAt(mk('mkp-fade'), { anim: { idle: 'float' } }, 0.8 + 1.6);   /* 반주기 → 최저점 */
    if (!(idle.dy < -4.9)) v.push('idle float 미적용');
    /* R52 — 켄번즈 수치판: 시작 1.0 → 끝 1.08 (과도 확대 금지 ≤1.1) · static 모션 0 */
    if (window.MK_COMPOSE) {
      const ke = { anim: { idle: 'kb-zoom-in', idleDur: 4 } };
      const k0 = stateAt(mk('mkp-fade'), ke, 0.8), k1 = stateAt(mk('mkp-fade'), ke, 4);
      if (!(Math.abs(k0.scale - 1) < 1e-6 && Math.abs(k1.scale - 1.08) < 1e-6)) v.push('켄번즈 zoom-in 수치 위반');
      if (window.MK_COMPOSE.KENBURNS.some((k) => Math.max(k.scale[0], k.scale[1]) > 1.1)) v.push('켄번즈 과도 확대');
      const ks = stateAt(mk('mkp-fade'), { anim: { idle: 'kb-static', idleDur: 4 } }, 3);
      if (!(ks.scale === 1 && ks.dx === 0 && ks.dy === 0)) v.push('켄번즈 static 모션 발생');
    }
    /* R117 — 애니 피벗: 초점 축 좌표 변환·회전 요소 제외·무초점 null */
    if (window.MK_FOCAL && window.MK_FOCAL.originOf) {
      const pv = animPivot({ focal: { x: 0.2, y: 0.9 } }, 100, 50, 200, 100);
      if (!pv || Math.abs(pv.px - 140) > 1e-9 || Math.abs(pv.py - 140) > 1e-9) v.push('R117 애니 피벗 좌표 위반');
      if (animPivot({ focal: { x: 0.2, y: 0.9 }, rot: 10 }, 0, 0, 10, 10) !== null) v.push('R117 회전 제외 위반');
      if (animPivot({}, 0, 0, 10, 10) !== null) v.push('R117 무초점 null 위반');
    }
    /* R119 — 회전 초점 피벗: 초점을 θ만큼 중앙 회전한 점(무회전은 rotPivot null=중앙 폴백) */
    if (window.MK_FOCAL && window.MK_FOCAL.rotPivot) {
      const rp = window.MK_FOCAL.rotPivot({ rot: 90, focal: { x: 0.3, y: 1 } }, 0, 0, 100, 100);
      if (!rp || Math.abs(rp.px - 0) > 1e-6 || Math.abs(rp.py - 30) > 1e-6) v.push('R119 회전 피벗 수학 위반');
      if (window.MK_FOCAL.rotPivot({ focal: { x: 0.2, y: 0.9 } }, 0, 0, 10, 10) !== null) v.push('R119 무회전 null 위반');
    }
    /* 프레임 플랜 — MK_PLAY.sequence와 동일 시간축 */
    const doc = { scenes: [{ duration: 2, elements: [] }, { duration: 3, elements: [] }] };
    const p = framePlan(doc, {});
    if (p.totalFrames !== 60 + 90 || p.scenes[1].transIn !== TRANS_DUR || p.scenes[0].transIn !== 0) v.push('프레임 플랜 위반');
    if (!framePlan({ scenes: [{ duration: 999, elements: [] }] }, {}).capped) v.push('길이 상한 미작동');
    /* R39 — 영상 기하: cover 소스 크롭·contain 목적지 축소 */
    const cv = fitRect(1920, 1080, 100, 100, 'cover');
    if (!(Math.abs(cv.sw - 1080) < 1e-6 && Math.abs(cv.sx - 420) < 1e-6)) v.push('cover 기하 위반');
    const cn = fitRect(1920, 1080, 100, 100, 'contain');
    if (!(Math.abs(cn.dw - 100) < 1e-6 && Math.abs(cn.dh - 56.25) < 1e-6 && Math.abs(cn.dy - 21.875) < 1e-6)) v.push('contain 기하 위반');
    if (secondsInto(5.5, 2) !== 1.5 || secondsInto(3, 0) !== 0) v.push('루프 시각 위반');
    if (!isVideoEl({ kind: 'video', src: 'data:video/mp4;base64,x' }) || isVideoEl({ kind: 'image', src: 'data:image/png;base64,x' })) v.push('영상 판별 위반');
    /* R39 — 음악 타임라인: 같은 음악 병합·다른 음악 분리·무음 장면 공백 */
    const md = { scenes: [
      { duration: 2, elements: [], music: { synth: 'piano' } },
      { duration: 3, elements: [], music: { synth: 'piano' } },
      { duration: 2, elements: [] },
      { duration: 2, elements: [], music: { synth: 'beat' } },
    ] };
    const tl = musicTimeline(md);
    if (tl.segments.length !== 2) v.push('타임라인 병합·분리 위반');
    else if (!(tl.segments[0].start === 0 && tl.segments[0].end === 5 && tl.segments[1].start === 7 && tl.segments[1].end === 9)) v.push('타임라인 경계 위반');
    return { ok: v.length === 0, violations: v };
  }

  return { FPS, TRANS_DUR, MAX_SEC, easeAt, stateAt, framePlan, exportMP4, videoAudit, busy: () => busy,
    isVideoEl, secondsInto, fitRect, musicTimeline, animPivot };
})();
