/* ============================================================
   MK_VIDEO — R38 이식 3차(다리): MP4 실출력
   kmake/video.js(WebCodecs·mp4-muxer)를 플레이그라운드 문서 모델로 이식.
   구조: 장면×요소를 MK_RENDER 로 스프라이트 래스터 1회 → 프레임마다
   MK_PLAY 등장 계획(enterPlan)을 수치 보간(stateAt)해 캔버스 합성 →
   VideoFrame → VideoEncoder(H.264, 배압 관리) → Mp4Muxer. 전부 브라우저 안 —
   서버 0원, 실시간 녹화가 아니라 프레임 드랍 0. 장면 전환 = 크로스페이드.
   순수 계층(easeAt·stateAt·framePlan)은 jsdom 완전 검증, 인코딩은 실브라우저 몫.
   미탑재(정직): 오디오 트랙 먹싱·삽입 영상의 프레임 재생 — 다음 몫.
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
    const st = { alpha: 1, dx: 0, dy: 0, scale: 1, rot: 0, clipW: null, blur: 0 };
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
      else if (n === 'mkp-blur') { st.alpha = p; st.blur = (1 - p) * 9; }
      else if (n === 'mkp-rotate') { st.alpha = p; st.rot = -7 * (1 - p); st.scale = 0.94 + 0.06 * p; }
      else st.alpha = p;
    }
    /* idle — 등장이 끝난 뒤 은은하게 (CSS keyframe 0/50/100 근사) */
    const endT = plan ? plan.delay + plan.dur : 0;
    if (el && el.anim && t >= endT) {
      if (el.anim.idle === 'float') { const fr = ((t - endT) % 3.2) / 3.2; st.dy += -5 * (1 - Math.cos(2 * Math.PI * fr)) / 2; }
      else if (el.anim.idle === 'pulse') { const fr = ((t - endT) % 2.6) / 2.6; st.scale *= 1 + 0.02 * (1 - Math.cos(2 * Math.PI * fr)) / 2; }
    }
    return st;
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
    const els = [];
    for (let i = 0; i < scene.elements.length; i++) {
      const only = { ...scene, background: 'rgba(0,0,0,0)', elements: [scene.elements[i]] };
      const out = await R.toRaster(R.renderScene(only, {}), { format: 'png', scale, transparent: true });
      els.push(await rasterToImage(out.dataUrl));
    }
    return { bg, els };
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

      const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: 'avc', width: W, height: H },
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
          ctx.globalAlpha = 1; ctx.filter = 'none';
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(sp.bg, 0, 0, W, H);
          scene.elements.forEach((el, i) => {
            const st = stateAt(plans[i], el, t);
            if (st.alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = clamp(st.alpha, 0, 1);
            const ex = el.x / 100 * W, ew = el.w / 100 * W;
            const eh = (el.h != null ? el.h / 100 * H : H * 0.2);
            const cx = ex + ew / 2, cy = el.y / 100 * H + eh / 2;
            if (st.clipW != null) { ctx.beginPath(); ctx.rect(ex, 0, ew * st.clipW, H); ctx.clip(); }
            if (st.blur > 0.2) { try { ctx.filter = `blur(${(st.blur * pxu).toFixed(1)}px)`; } catch (_) {} }
            ctx.translate(cx, cy);
            if (st.rot) ctx.rotate(st.rot * Math.PI / 180);
            if (st.scale !== 1) ctx.scale(st.scale, st.scale);
            ctx.translate(-cx + st.dx * pxu, -cy + st.dy * pxu);
            ctx.drawImage(sp.els[i], 0, 0, W, H);
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
      }
      say('인코딩 마무리 중…');
      await encoder.flush();
      if (encError) throw encError;
      muxer.finalize();
      const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(doc.title || '케이메이커').replace(/[^\w가-힣 _-]/g, '')}.mp4`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return { ok: true, sec: Math.round(plan.totalSec), w: W, h: H, frames: plan.totalFrames };
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
    /* 프레임 플랜 — MK_PLAY.sequence와 동일 시간축 */
    const doc = { scenes: [{ duration: 2, elements: [] }, { duration: 3, elements: [] }] };
    const p = framePlan(doc, {});
    if (p.totalFrames !== 60 + 90 || p.scenes[1].transIn !== TRANS_DUR || p.scenes[0].transIn !== 0) v.push('프레임 플랜 위반');
    if (!framePlan({ scenes: [{ duration: 999, elements: [] }] }, {}).capped) v.push('길이 상한 미작동');
    return { ok: v.length === 0, violations: v };
  }

  return { FPS, TRANS_DUR, MAX_SEC, easeAt, stateAt, framePlan, exportMP4, videoAudit, busy: () => busy };
})();
