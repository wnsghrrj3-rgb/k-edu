/* ============================================================
   케이무비 오디오 층 (KMV_AUDIO) — 설계서 v1 §2-5·§4·§5
   ------------------------------------------------------------
   · AudioContext.currentTime 이 재생 마스터 시계. 영상은 이 시계에 맞춘다.
   · A1(현장음) 스케줄 함수 하나를 미리보기(AudioContext)와
     내보내기(OfflineAudioContext)가 같이 쓴다 → 미리보기 = 내보내기.
   · 컷 경계 자동 크로스페이드 80ms(딸깍 제거). J/L 컷으로 넘친 소리는
     옆 클립 위로 자연히 겹쳐 페이드된다.
   · 속도 프리셋: 슬로/타임랩스 = playbackRate, 히트 슬로 = 3구간 스케줄.
   · [3단계 슬롯] A2 음악·덕킹·앰비언스·비트 → 이 파일에 추가.
   ============================================================ */
(function (g) {
  'use strict';

  const XF = 0.08;          // 컷 경계 크로스페이드(초)
  const SR = 48000;         // 내보내기 샘플레이트
  let ac = null;
  let playing = null;       // { nodes, t0, fromFrame }

  function ctx() {
    if (!ac) ac = new (g.AudioContext || g.webkitAudioContext)({ latencyHint: 'interactive' });
    return ac;
  }
  function decode(arrayBuffer) { return ctx().decodeAudioData(arrayBuffer); }

  /* A1 한 항목 → 재생 구간들 [{tl(프레임), dur(프레임), src(초), rate}] */
  function segments(a, c, m) {
    const P = g.KMV_PROJECT, FPS = P.FPS;
    if (!a.linked) return [{ tl: a.at, dur: a.dur, src: a.in / m.fps, rate: 1 }];
    const inSec = c.in / m.fps, len = (c.out - c.in) / m.fps;
    if (c.speed === 'hit') {
      const d = c.dur, d1 = Math.round(d * 0.2 / 2.4), d2 = Math.round(d * 2.0 / 2.4);
      return [
        { tl: c.at, dur: d1, src: inSec, rate: 1 },
        { tl: c.at + d1, dur: d2, src: inSec + len * 0.2, rate: 0.3 },
        { tl: c.at + d1 + d2, dur: d - d1 - d2, src: inSec + len * 0.8, rate: 1 },
      ];
    }
    return [{ tl: c.at, dur: c.dur, src: inSec, rate: P.SPEED[c.speed].f }];
  }

  /* 타임라인 fromFrame 이 컨텍스트 시각 t0 에 재생되도록 A1 전부 스케줄. 반환: 노드 목록 */
  function scheduleA1(actx, dest, fromFrame, t0, untilFrame) {
    const P = g.KMV_PROJECT, FPS = P.FPS, nodes = [];
    for (const a of P.data.A1) {
      const c = P.clip(a.clip); if (!c) continue;
      const m = P.media(c.media), src = g.KMV_MEDIA.get(m.id);
      if (!src || !src.audio) continue;
      for (const s of segments(a, c, m)) {
        const end = s.tl + s.dur;
        if (end <= fromFrame || s.dur <= 0) continue;
        if (untilFrame != null && s.tl >= untilFrame) continue;
        const skip = Math.max(0, fromFrame - s.tl);
        const when = t0 + (s.tl + skip - fromFrame) / FPS;
        const durSec = (s.dur - skip) / FPS;
        if (durSec <= 0.001) continue;
        const srcOff = s.src + skip / FPS * s.rate;
        if (srcOff >= src.audio.duration) continue;
        const node = actx.createBufferSource(); node.buffer = src.audio; node.playbackRate.value = s.rate;
        const gn = actx.createGain();
        const vol = a.vol == null ? 1 : a.vol;
        const f = Math.min(XF, durSec / 2);
        gn.gain.setValueAtTime(skip > 0 ? vol : 0, when);
        if (skip === 0) gn.gain.linearRampToValueAtTime(vol, when + f);
        gn.gain.setValueAtTime(vol, when + durSec - f);
        gn.gain.linearRampToValueAtTime(0, when + durSec);
        node.connect(gn); gn.connect(dest);
        node.start(when, srcOff, durSec * s.rate);
        nodes.push(node);
      }
    }
    return nodes;
  }

  /* ---------- 미리보기 재생 ---------- */
  async function play(fromFrame) {
    stop();
    const a = ctx();
    if (a.state !== 'running') { try { await a.resume(); } catch (e) {} }
    const t0 = a.currentTime + 0.06;
    playing = { fromFrame, t0, nodes: scheduleA1(a, a.destination, fromFrame, t0) };
    return t0;
  }
  function now() { if (!playing) return null; return playing.fromFrame + (ctx().currentTime - playing.t0) * g.KMV_PROJECT.FPS; }
  function stop() {
    if (!playing) return;
    playing.nodes.forEach(n => { try { n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
    playing = null;
  }
  function isPlaying() { return !!playing; }

  /* ---------- 내보내기용 오프라인 믹스 → AudioBuffer(48k 스테레오) ---------- */
  async function renderMix(totalFrames) {
    const FPS = g.KMV_PROJECT.FPS;
    const len = Math.max(1, Math.ceil(totalFrames / FPS * SR));
    const oac = new OfflineAudioContext(2, len, SR);
    scheduleA1(oac, oac.destination, 0, 0, totalFrames);
    return oac.startRendering();
  }

  /* 타임라인 A1 음성 구간 [{at,dur}] — 미디어 peaks(프레임 RMS) 기반 휴리스틱.
     문턱 = 바닥(20%분위)×3 과 큰 소리(90%분위)×0.18 중 큰 쪽(최소 0.012), 0.4초 미만 빈틈은 이어 붙이고 0.6초 미만 구간은 버림. */
  function voice() {
    const P = g.KMV_PROJECT, FPS = P.FPS, M = g.KMV_MEDIA, on = new Uint8Array(P.total());
    for (const a of P.data.A1) {
      const c = P.clip(a.clip), m = P.media(c.media), src = M.get(m.id); if (!src || !src.peaks) continue;
      for (const sg of segments(a, c, m)) {
        const vals = []; for (let f = 0; f < sg.dur; f++) { const si = Math.min(src.frames - 1, Math.floor((sg.src + f / FPS * sg.rate) * m.fps)); vals.push(src.peaks[si] || 0); }
        const sorted = vals.slice().sort((x, y) => x - y), q = k => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * k))] || 0;
        const th = Math.max(0.012, q(0.2) * 3, q(0.9) * 0.18);   // 바닥(20%)의 3배 또는 큰 소리(90%)의 18% — 둘 중 큰 쪽
        for (let f = 0; f < sg.dur; f++) if (vals[f] > th) on[sg.tl + f] = 1;
      }
    }
    const out = []; let start = -1;
    const gap = Math.round(0.4 * FPS), min = Math.round(0.6 * FPS);
    for (let f = 0; f <= on.length; f++) {
      const v = f < on.length && on[f];
      if (v && start < 0) start = f;
      else if (!v && start >= 0) {
        const last = out[out.length - 1];
        if (last && start - (last.at + last.dur) < gap) last.dur = f - last.at; else out.push({ at: start, dur: f - start });
        start = -1;
      }
    }
    return out.filter(s => s.dur >= min);
  }

  g.KMV_AUDIO = { ctx, decode, play, stop, now, isPlaying, renderMix, segments, scheduleA1, voice, XF, SR };
})(typeof window !== 'undefined' ? window : globalThis);
