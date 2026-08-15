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

  /* ---------- R122: 내보내기 정본(EXPORT_SPEC) ----------
     R38 부터 84라운드 동안 내보내기는 **한 번도 실브라우저에서 안 밟혔다**.
     R122 가 #/selfcheck 에 탐침을 올리는데, 탐침이 코덱 문자열·CDN 주소·출력
     치수를 **자기 파일에 다시 적으면** 여기가 바뀌어도 탐침은 옛 값을 계속
     검사한다 — 초록불이 「지금 이 코드가 된다」를 뜻하지 않게 된다.

     그래서 R117 이 세운 규약을 그대로 쓴다: **정본 하나를 양세계가 함께 읽는다.**
     exportMP4 와 MK_SELFCHECK 가 같은 EXPORT_SPEC 을 읽으므로, 코덱을 바꾸면
     탐침이 저절로 새 코덱을 묻는다. 아래 값은 이 객체 말고 어디에도 적지 않는다
     (test-round122 가 중복 리터럴을 잡는다).

     targetMin: 짧은 변을 이 값으로 맞춘다 — 1280×720 → 1920×1080 */
  /* ---------- R124: 먹서 주소가 둘이 되었다 (자체 우선 · CDN 폴백) ----------
     R123 까지 muxerUrl 은 CDN 하나였다. 학생이 마지막에 누르는 버튼이 남의
     CDN 에 매달려 있었다는 뜻이다 — 학교 방화벽은 우리가 못 고친다.

     ⚠ R124 가 발견한 것: mp4-muxer 패키지에는 `.min.js` 가 **실존하지 않는다.**
     종전 주소가 가리키던 압축본은 jsdelivr 가 즉석에서 만들어 주던 것이다.
     우리는 파일이 아니라 **CDN 의 기능** 하나에 매달려 있었다.

     그래서 순서를 뒤집는다 — muxerUrl(자체) 을 먼저 시도하고, 실패해야
     muxerFallbackUrl(CDN) 로 내려간다. 그 반대가 아니다.

     ⚠ 자체 주소는 **루트 절대경로**여야 한다. loadMuxer 는 실행 시점에
     스크립트를 꽂으므로 상대경로면 문서 URL 기준으로 풀린다 — 제품 진입점
     `/maker/` 에서는 `/maker/vendor/...` 로 빗나가 통째로 죽는다.
     (`maker/build.mjs` 의 경로 보정은 HTML 만 만지지 런타임 주입은 못 만진다.) */
  const EXPORT_SPEC = Object.freeze({
    vcodec: 'avc1.420028',                    /* H.264 Baseline@4.0 — 사다리 1단(R123 주석 교정) */
    acodec: 'mp4a.40.2',                      /* AAC-LC */
    muxerUrl: '/maker-playground/vendor/mp4-muxer-5.2.1.js',
    muxerFallbackUrl: 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js',
    targetMin: 1080, bitrate: BITRATE, fps: FPS,
    audioSampleRate: 48000, audioBitrate: 128000, audioChannels: 1,
    muxVideo: 'avc', muxAudio: 'aac',         /* mp4-muxer 쪽 이름 — 탐침이 같은 먹서를 짓는다 */
  });

  /* ---------- R123: 폴백 사다리 ----------
     R122 까지 내보내기엔 **폴백이 아예 없었다** — configure 가 예외를 던지거나
     error 콜백으로 중간에 죽는 게 전부다. 준호 기기 하나가 통과해도 교실의
     서른 대가 통과한다는 뜻이 아니다(n=1). 그래서 결과를 기다리지 않고 세운다.

     ⚠ 코덱 문자열 읽는 법 — avc1.PPCCLL (PP=프로파일 CC=제약 LL=레벨, 16진).
     `42`=Baseline · `4D`=Main · `64`=High, `28`=40=레벨 4.0 · `1F`=31=레벨 3.1.
     **정본 주석이 vcodec 을 「High@4.0」이라 적어 왔는데 그건 틀렸다 — 프로파일
     자리가 `42`, 즉 Baseline 이다.** R123 인계 문서의 위험 분석(「High profile 거부」)도
     그 오기 위에 서 있었다. 실제 위험은 프로파일이 아니라 **레벨 4.0 @1080p**
     이므로 사다리는 프로파일이 아니라 **해상도**를 내려간다(Baseline 보다 더
     호환되는 프로파일은 없으므로 High 로 올라가는 건 폴백이 아니라 후퇴다).
     Main 단을 끼우는 까닭은 일부 칩셋이 Baseline 하드웨어 경로만 막혀 있어서다.

     1단은 정본 자신을 읽는다 — 코덱을 바꾸면 사다리 머리도 같이 움직이고,
     중복 리터럴이 0 이라 test-round122 ⑴ 정본 단일성이 그대로 성립한다. */
  const BITRATE_720 = 4_000_000;
  const VIDEO_LADDER = Object.freeze([
    Object.freeze({ codec: EXPORT_SPEC.vcodec, targetMin: EXPORT_SPEC.targetMin, bitrate: EXPORT_SPEC.bitrate, label: '1080p 고화질' }),
    Object.freeze({ codec: 'avc1.4D0028', targetMin: 1080, bitrate: EXPORT_SPEC.bitrate, label: '1080p 표준(Main)' }),
    Object.freeze({ codec: 'avc1.42001F', targetMin: 720, bitrate: BITRATE_720, label: '720p' }),
    Object.freeze({ codec: 'avc1.4D001F', targetMin: 720, bitrate: BITRATE_720, label: '720p 표준(Main)' }),
  ]);

  /* 출력 치수 규칙 — exportMP4 와 탐침이 같은 함수를 쓴다(따로 계산하면 어긋난다).
     targetMin 생략 = 정본값이라 R122 이전 호출부·하니스는 바이트 동일하게 돈다. */
  function outSize(w, h, targetMin) {
    const tm = targetMin || EXPORT_SPEC.targetMin;
    const scale = tm / Math.min(w, h);
    return { scale, W: even(w * scale), H: even(h * scale) };
  }

  /* 사다리 한 단의 실치수 — 단 고르기와 탐침이 같은 함수를 쓴다 */
  function rungSize(i, w, h) {
    const r = VIDEO_LADDER[i];
    if (!r) return null;
    const o = outSize(w, h, r.targetMin);
    return { index: i, rung: r, scale: o.scale, W: o.W, H: o.H };
  }

  /* ★ 단 고르기 — exportMP4 와 #/selfcheck 탐침이 **같은 이 함수**를 부른다.
     탐침이 따로 훑으면 「탐침은 3단이라는데 제품은 1단으로 죽는」 일이 생긴다.
     isConfigSupported 가 없는 브라우저는 종전대로 1단 맹목 진행(회귀 0). */
  async function pickVideoRung(win, w, h) {
    const W0 = win || window;
    const VE = W0.VideoEncoder;
    if (typeof VE === 'undefined' || typeof VE.isConfigSupported !== 'function') {
      return Object.assign(rungSize(0, w, h), { queried: false, tried: [], why: '' });
    }
    const tried = [];
    for (let i = 0; i < VIDEO_LADDER.length; i++) {
      const c = rungSize(i, w, h);
      const cfg = { codec: c.rung.codec, width: c.W, height: c.H, bitrate: c.rung.bitrate, framerate: EXPORT_SPEC.fps };
      let sup = null;
      try { sup = await VE.isConfigSupported(cfg); } catch (e) { tried.push(`${c.rung.label} — 질의 예외`); continue; }
      if (sup && sup.supported) return Object.assign(c, { queried: true, tried, why: '' });
      tried.push(`${c.rung.label} (${c.rung.codec} ${c.W}×${c.H})`);
    }
    return { index: -1, rung: null, scale: 1, W: 0, H: 0, queried: true, tried,
      why: '이 기기 인코더가 사다리 어느 단도 받지 않아요' };
  }

  /* 소리도 같은 규약 — typeof 만 보고 강행하던 자리(R122 탐침이 지적한 그 자리) */
  async function pickAudio(win) {
    const W0 = win || window;
    const AE = W0.AudioEncoder;
    const cfg = { codec: EXPORT_SPEC.acodec, sampleRate: EXPORT_SPEC.audioSampleRate,
      numberOfChannels: EXPORT_SPEC.audioChannels, bitrate: EXPORT_SPEC.audioBitrate };
    if (typeof AE === 'undefined') return { ok: false, cfg, queried: false, why: '이 브라우저는 소리 저장을 지원하지 않아 무음으로 저장했어요' };
    if (typeof AE.isConfigSupported !== 'function') return { ok: true, cfg, queried: false, why: '' };
    try {
      const sup = await AE.isConfigSupported(cfg);
      if (sup && sup.supported) return { ok: true, cfg, queried: true, why: '' };
      return { ok: false, cfg, queried: true, why: '이 기기가 소리 형식(AAC)을 받지 않아 무음으로 저장했어요' };
    } catch (e) { return { ok: false, cfg, queried: true, why: '소리 지원을 확인하지 못해 무음으로 저장했어요' }; }
  }

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

  /* ---------- R127 — 소리 원천 수집 (순수) ----------
     R39 이래 MP4 소리 트랙은 배경음악 타임라인만 탔다 — 클립에 담긴 소리(AI
     생성 대사·현장음)와 준호가 녹음할 나레이션이 **화면에는 있는데 파일에는
     없는** 세계였다. 여기서 씬 시작초 기준으로 전 원천을 나열한다.
     · 클립: isVideoEl && !el.mute — 소리는 기본 켬(넣은 소리는 실리는 게 기본).
       음량 el.volume(0~1, 기본 1). 화면 루프 규약대로 반복(loop:true).
     · 나레이션: sc.narration.src — 반복 금지(loop:false), 씬 길이에서 잘림. */
  function soundSources(doc, planIn) {
    const plan = planIn || framePlan(doc, {});
    const out = []; let t = 0;
    plan.scenes.forEach((ps) => {
      const sc = doc.scenes[ps.sceneIdx];
      if (sc && sc.narration && sc.narration.src) {
        out.push({ kind: 'narration', start: t, dur: ps.durSec, src: sc.narration.src, vol: 1, loop: false });
      }
      ((sc && sc.elements) || []).forEach((el) => {
        if (isVideoEl(el) && !el.mute) {
          out.push({ kind: 'clip', start: t, dur: ps.durSec, src: el.src,
            vol: el.volume != null ? clamp(+el.volume || 0, 0, 1) : 1, loop: true });
        }
      });
      t += ps.durSec;
    });
    return out;
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
  async function buildMasterPCM(timeline, sr, doc, planIn, deps) {
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

    /* ---------- R127 — 클립·나레이션 ----------
       순서가 뜻이다: ① 음악을 다 쓴 뒤 ② 나레이션 구간의 음악만 낮추고(덕킹)
       ③ 클립 ④ 나레이션을 얹는다. 덕킹을 나중에 하면 나레이션 자신까지
       낮아지고, 먼저 하면 아직 없는 음악을 낮추는 헛손질이 된다. */
    const srcs = doc ? soundSources(doc, planIn) : [];
    const dec = (deps && deps.decode) || decodeToPCM;
    const DUCK = 0.35;                                    /* 나레이션 밑 음악 */
    for (const sp of srcs) {
      if (sp.kind !== 'narration') continue;
      const st = Math.round(sp.start * sr), en = Math.min(n, Math.round((sp.start + sp.dur) * sr));
      for (let i = st; i < en; i++) master[i] *= DUCK;
    }
    for (const sp of srcs) {
      const st = Math.round(sp.start * sr), en = Math.min(n, Math.round((sp.start + sp.dur) * sr));
      const len = en - st;
      if (len <= 0) continue;
      const pcm = await dec(sp.src, len, sr, { loop: sp.loop });
      if (!pcm) continue;                                 /* 해독 실패 = 그 원천만 무음(정직) */
      const g0 = sp.kind === 'narration' ? 1.0 : 0.9 * sp.vol;
      for (let i = 0; i < len; i++) {
        let g = g0;
        if (i < FADE) g *= i / FADE;
        if (len - i < FADE) g *= (len - i) / FADE;
        master[st + i] += (pcm[i] || 0) * g;
      }
    }
    for (let i = 0; i < n; i++) master[i] = clamp(master[i], -1, 1);
    return master;
  }
  async function decodeToPCM(src, lenSamples, sr, o) {
    try {
      const buf = await (await fetch(src)).arrayBuffer();
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OAC) return null;
      const ab = await new OAC(1, 1, sr).decodeAudioData(buf);   /* 컨텍스트 sr 로 리샘플 */
      const chs = []; for (let c = 0; c < ab.numberOfChannels; c++) chs.push(ab.getChannelData(c));
      const src0 = ab.length;
      const out = new Float32Array(lenSamples);
      /* R127 — loop 선택. 음악·클립은 화면 루프 규약과 동일하게 반복하지만,
         나레이션은 씬이 남는다고 처음부터 다시 말하면 안 된다(뒤는 무음). */
      const loop = !o || o.loop !== false;
      const upto = loop ? lenSamples : Math.min(lenSamples, src0);
      for (let i = 0; i < upto; i++) {
        const j = i % src0;
        let s = 0; for (const ch of chs) s += ch[j];
        out[i] = s / chs.length;
      }
      return out;
    } catch (_) { return null; }
  }

  /* ---------- R124: 먹서 적재 — 자체 → CDN 2단 ----------
     어디서 받았는지 **기록으로 남긴다**. 탐침이 「CDN 에서 받았어요」라고
     말해 놓고 실제로는 자체에서 받았다면 그건 초록불이 아니라 거짓말이다.

     onload 만 믿지 않는다 — 잘못된 리라이트가 200 으로 HTML 을 돌려주면
     스크립트는 「실렸다」고 하면서 Mp4Muxer 는 없다. 그 경우도 실패로 보고
     폴백으로 내려간다. */
  let muxerFrom = null;
  const muxerSource = () => muxerFrom;

  function injectMuxer(url) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => (window.Mp4Muxer ? res() : rej(new Error('실렸는데 Mp4Muxer 가 없어요')));
      s.onerror = () => rej(new Error('못 받았어요'));
      document.head.appendChild(s);
    });
  }

  function loadMuxer() {
    if (window.Mp4Muxer) { muxerFrom = muxerFrom || 'already'; return Promise.resolve(muxerFrom); }
    return injectMuxer(EXPORT_SPEC.muxerUrl)
      .then(() => { muxerFrom = 'self'; return muxerFrom; })
      .catch(() => injectMuxer(EXPORT_SPEC.muxerFallbackUrl)
        .then(() => { muxerFrom = 'cdn'; return muxerFrom; })
        .catch(() => { throw new Error('MP4 모듈을 불러올 수 없어요 — 네트워크를 확인해 주세요'); }));
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
      /* R123 — 맹목 configure 를 그만둔다. 사다리를 위에서부터 물어 첫 합격을 쓴다.
         한 단도 못 받으면 여기서 정직하게 멈춘다(예전엔 configure 가 던지거나
         error 콜백으로 프레임 한복판에서 죽어 「왜 안 되는지」가 안 남았다). */
      const pick = await pickVideoRung(window, dl0.width, dl0.height);
      if (!pick.rung) {
        return { ok: false, msg: '이 기기에서는 영상 저장이 안 돼요 — 다른 기기나 크롬 최신 버전을 써주세요',
          detail: pick.tried.join(' / ') };
      }
      const { scale, W, H } = outSize(dl0.width, dl0.height, pick.rung.targetMin);   /* 1280×720 → 1920×1080 */
      const lowered = pick.index > 0 ? `이 기기에 맞춰 ${pick.rung.label} 로 저장했어요` : '';
      const pxu = H / 720;                                            /* CSS px(모달 기준) → 출력 px */
      const out = document.createElement('canvas'); out.width = W; out.height = H;
      const ctx = out.getContext('2d');

      /* R39 — 소리 트랙: 장면 music 이 있고 AudioEncoder 지원 시에만 */
      const SR = EXPORT_SPEC.audioSampleRate;
      const timeline = musicTimeline(doc, plan);
      /* R127 — 소리의 이유가 셋이 됐다: 음악 · 클립 소리 · 나레이션 */
      const wantAudio = timeline.segments.length > 0 || soundSources(doc, plan).length > 0;
      /* R123 — typeof 만 보고 강행하던 자리. 실제로 물어보고, 안 되면 무음으로
         정직하게 내려간다(예전엔 AAC 미지원 기기에서 소리가 실리다 죽었다). */
      const apick = wantAudio ? await pickAudio(window) : { ok: false, cfg: null, why: '' };
      const canAudio = wantAudio && apick.ok;
      let masterPCM = null, audioMsg = '';
      if (wantAudio && !canAudio) audioMsg = apick.why;
      if (canAudio) {
        say('소리 준비 중…');
        masterPCM = await buildMasterPCM(timeline, SR, doc, plan);
      }

      const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: EXPORT_SPEC.muxVideo, width: W, height: H },
        ...(canAudio ? { audio: { codec: EXPORT_SPEC.muxAudio, sampleRate: SR, numberOfChannels: EXPORT_SPEC.audioChannels } } : {}),
        fastStart: 'in-memory',
      });
      encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { encError = e; },
      });
      encoder.configure({ codec: pick.rung.codec, width: W, height: H, bitrate: pick.rung.bitrate, framerate: EXPORT_SPEC.fps });

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
        aenc.configure(apick.cfg);
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
        audio: !!(canAudio && masterPCM), audioMsg,
        rung: pick.rung.label, rungIndex: pick.index, lowered };
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
    /* R122 — 출력 치수 정본: 짧은 변을 targetMin 으로. 1280×720 → 1920×1080 */
    const os = outSize(1280, 720);
    if (!(os.W === 1920 && os.H === 1080 && Math.abs(os.scale - 1.5) < 1e-9)) v.push('출력 치수 위반');
    const osp = outSize(1080, 1349);                    /* 세로 — 짧은 변이 가로 */
    if (osp.W !== 1080 || osp.H % 2 !== 0) v.push('세로 출력·짝수 보정 위반');
    if (!Object.isFrozen(EXPORT_SPEC)) v.push('EXPORT_SPEC 이 얼지 않음');
    /* R123 — 폴백 사다리. 차단망을 audit 에 두면 이 함수를 부르는 여러 스위트에 소급 적용된다 */
    if (!Object.isFrozen(VIDEO_LADDER) || !VIDEO_LADDER.every((r) => Object.isFrozen(r))) v.push('사다리가 얼지 않음');
    if (VIDEO_LADDER.length < 2) v.push('사다리에 단이 없음 — 폴백이 없다');
    if (VIDEO_LADDER[0].codec !== EXPORT_SPEC.vcodec || VIDEO_LADDER[0].targetMin !== EXPORT_SPEC.targetMin
      || VIDEO_LADDER[0].bitrate !== EXPORT_SPEC.bitrate) v.push('사다리 1단이 정본과 어긋남');
    if (!VIDEO_LADDER.every((r) => /^avc1\.[0-9A-Fa-f]{6}$/.test(r.codec) && r.targetMin > 0 && r.bitrate > 0 && r.label)) v.push('사다리 단 형태 위반');
    /* 내려가기만 한다 — 위 단보다 큰 치수·높은 레벨이 아래에 오면 폴백이 아니다 */
    for (let i = 1; i < VIDEO_LADDER.length; i++) {
      if (VIDEO_LADDER[i].targetMin > VIDEO_LADDER[i - 1].targetMin) v.push('사다리가 위로 올라감: ' + i);
      if (VIDEO_LADDER[i].targetMin === VIDEO_LADDER[i - 1].targetMin
        && VIDEO_LADDER[i].codec === VIDEO_LADDER[i - 1].codec) v.push('같은 단 중복: ' + i);
    }
    /* R124 — 먹서 주소 계약. 자체가 상대경로면 /maker/ 진입에서 빗나가 죽는다 */
    if (typeof EXPORT_SPEC.muxerFallbackUrl !== 'string' || !EXPORT_SPEC.muxerFallbackUrl) v.push('먹서 폴백 주소 부재');
    if (EXPORT_SPEC.muxerUrl === EXPORT_SPEC.muxerFallbackUrl) v.push('먹서 두 주소가 같음 — 폴백이 아님');
    if (EXPORT_SPEC.muxerUrl.charAt(0) !== '/') v.push('먹서 자체 주소가 루트 절대경로가 아님');
    if (/^https?:/i.test(EXPORT_SPEC.muxerUrl)) v.push('먹서 1순위가 외부 주소 — 자체 호스팅이 아님');
    if (!/^https?:/i.test(EXPORT_SPEC.muxerFallbackUrl)) v.push('먹서 폴백이 외부 주소가 아님');
    /* R127 — 소리 원천 계약: 음소거 클립·이미지는 안 실리고, 나레이션은 반복 금지 */
    const sdoc = { scenes: [{ duration: 2, narration: { src: 'data:audio/webm;base64,n' }, elements: [
      { kind: 'video', src: 'data:video/mp4;base64,a' },
      { kind: 'video', src: 'data:video/mp4;base64,b', mute: true },
      { kind: 'image', src: 'data:image/png;base64,c' }] }] };
    const ss = soundSources(sdoc);
    if (ss.length !== 2) v.push('soundSources 총원 위반: ' + ss.length);
    if (ss.filter((x) => x.kind === 'clip').length !== 1) v.push('음소거·이미지 제외 위반');
    const nn = ss.find((x) => x.kind === 'narration');
    if (!nn || nn.loop !== false) v.push('나레이션 반복 금지 위반');
    if (!ss.every((x) => x.vol >= 0 && x.vol <= 1)) v.push('음량 범위 위반');
    const rs = rungSize(2, 1280, 720);
    if (!rs || rs.W !== 1280 || rs.H !== 720) v.push('사다리 720 단 치수 위반');
    if (rungSize(99, 1280, 720) !== null) v.push('없는 단이 null 이 아님');
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

  return { FPS, TRANS_DUR, MAX_SEC, EXPORT_SPEC, VIDEO_LADDER, outSize, rungSize, pickVideoRung, pickAudio, loadMuxer, muxerSource, soundSources, buildMasterPCM,
    easeAt, stateAt, framePlan, exportMP4, videoAudit, busy: () => busy,
    isVideoEl, secondsInto, fitRect, musicTimeline, animPivot };
})();
