/* ============================================================
   케이무비 오디오 층 (KMV_AUDIO) — 설계서 v1 §2-5·§4·§5
   ------------------------------------------------------------
   · AudioContext.currentTime 이 재생 마스터 시계. 영상은 이 시계에 맞춘다.
   · A1(현장음) 스케줄 함수 하나를 미리보기(AudioContext)와
     내보내기(OfflineAudioContext)가 같이 쓴다 → 미리보기 = 내보내기.
   · 컷 경계 자동 크로스페이드 80ms(딸깍 제거). J/L 컷으로 넘친 소리는
     옆 클립 위로 자연히 겹쳐 페이드된다.
   · 속도 프리셋: 슬로/타임랩스 = playbackRate, 히트 슬로 = 3구간 스케줄.
   · A2 음악: 페이드 인/아웃 + 오토 덕킹(A1 음성 구간에서 -depth dB, 진입 200ms/복귀 500ms).
     페이드 게인과 덕킹 게인은 노드 둘을 직렬로 — 자동화 곡선을 곱하기 위해.
   · 비트 마커: 에너지 봉우리(onset) 휴리스틱 — 클립 경계 스냅용. 자동 컷은 없다(헌법).
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

  /* ---------- A2 음악 ---------- */
  const DUCK_IN = 0.2, DUCK_OUT = 0.5;      // 진입 200ms / 복귀 500ms
  function dB(v) { return Math.pow(10, -Math.abs(v) / 20); }

  /* 덕킹 자동화 구간 [{t0, t1}] (초, 타임라인) — 음성 구간을 앞뒤로 살짝 넓힌다 */
  function duckSpans() {
    const P = g.KMV_PROJECT, D = P.data.audio && P.data.audio.ducking;
    if (!D || !D.on || !P.data.A2.length) return [];
    return voice().map(v => ({ t0: v.at / P.FPS, t1: (v.at + v.dur) / P.FPS }));
  }

  /* A2 전부 스케줄 — 타임라인 fromFrame 이 컨텍스트 시각 t0. */
  function scheduleA2(actx, dest, fromFrame, t0, untilFrame) {
    const P = g.KMV_PROJECT, FPS = P.FPS, nodes = [];
    const D = P.data.audio && P.data.audio.ducking, depth = D && D.on ? dB(D.depth == null ? 12 : D.depth) : 1;
    const spans = depth < 1 ? duckSpans() : [];
    for (const a of P.data.A2) {
      const m = P.media(a.media), src = g.KMV_MEDIA.get(m.id);
      if (!src || !src.audio) continue;
      const len = a.out - a.in, end = a.at + len;
      if (end <= fromFrame || len <= 0) continue;
      if (untilFrame != null && a.at >= untilFrame) continue;
      const skip = Math.max(0, fromFrame - a.at);
      const when = t0 + (a.at + skip - fromFrame) / FPS, durSec = (len - skip) / FPS;
      if (durSec <= 0.001) continue;
      const srcOff = (a.in + skip) / FPS; if (srcOff >= src.audio.duration) continue;
      const node = actx.createBufferSource(); node.buffer = src.audio;
      const vol = a.vol == null ? 1 : a.vol;
      // 페이드 게인: 타임라인 절대 시각으로 계산한 뒤 when 기준으로 옮긴다
      const fg = actx.createGain(), fi = (a.fadeIn || 0) / FPS, fo = (a.fadeOut || 0) / FPS;
      const tStart = a.at / FPS, tEnd = end / FPS, tNow = (a.at + skip) / FPS;
      const gainAt = tt => { let v = vol; if (fi > 0 && tt < tStart + fi) v *= Math.max(0, (tt - tStart) / fi); if (fo > 0 && tt > tEnd - fo) v *= Math.max(0, (tEnd - tt) / fo); return v; };
      fg.gain.setValueAtTime(gainAt(tNow), when);
      if (fi > 0 && tNow < tStart + fi) fg.gain.linearRampToValueAtTime(vol, when + (tStart + fi - tNow));
      if (fo > 0) { const fs = Math.max(tNow, tEnd - fo); fg.gain.setValueAtTime(gainAt(fs), when + (fs - tNow)); fg.gain.linearRampToValueAtTime(0, when + durSec); }
      // 덕킹 게인
      const dg = actx.createGain(); dg.gain.setValueAtTime(1, when);
      if (spans.length) {
        let cur = 1;
        for (const sp of spans) {
          const s0 = sp.t0 - DUCK_IN, s1 = sp.t1; if (s1 <= tNow || s0 >= tEnd) continue;
          const at0 = Math.max(s0, tNow), at1 = Math.min(s1, tEnd);
          if (at0 > tNow) { dg.gain.setValueAtTime(cur, when + (at0 - tNow)); dg.gain.linearRampToValueAtTime(depth, when + (Math.min(at1, at0 + DUCK_IN) - tNow)); }
          else dg.gain.setValueAtTime(depth, when);
          cur = depth;
          if (at1 < tEnd) { dg.gain.setValueAtTime(depth, when + (at1 - tNow)); dg.gain.linearRampToValueAtTime(1, when + (Math.min(tEnd, at1 + DUCK_OUT) - tNow)); cur = 1; }
        }
      }
      node.connect(fg); fg.connect(dg); dg.connect(dest);
      node.start(when, srcOff, durSec);
      nodes.push(node);
    }
    return nodes;
  }

  /* ---------- 비트 마커 (onset 휴리스틱) → 초 배열 ---------- */
  function beats(ab) {
    if (!ab) return [];
    const sr = ab.sampleRate, hop = 512, n = Math.floor(ab.length / hop);
    if (n < 8) return [];
    const chs = []; for (let c = 0; c < ab.numberOfChannels; c++) chs.push(ab.getChannelData(c));
    // 에너지 포락 (저역 강조: 1차 저역 통과 후 RMS — 킥이 도드라진다)
    const env = new Float32Array(n); let lp = 0; const k = Math.exp(-2 * Math.PI * 180 / sr);
    for (let i = 0; i < n; i++) {
      let acc = 0; const s0 = i * hop;
      for (let s = s0; s < s0 + hop; s++) { let v = 0; for (let c = 0; c < chs.length; c++) v += chs[c][s]; v /= chs.length; lp = lp * k + v * (1 - k); acc += lp * lp; }
      env[i] = Math.sqrt(acc / hop);
    }
    // 스펙트럴 플럭스 대용: 증가분만
    const flux = new Float32Array(n); for (let i = 1; i < n; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
    // 적응 문턱: 이동 평균(±0.35초) × 1.6 + 바닥, 봉우리 사이 최소 0.25초
    const win = Math.round(0.35 * sr / hop), minGap = Math.round(0.25 * sr / hop);
    let sum = 0; const q = [];
    const out = []; let last = -minGap;
    const sorted = Array.from(flux).sort((a, b) => a - b), floor = (sorted[Math.floor(n * 0.5)] || 0) * 0.5;
    for (let i = 0; i < n; i++) {
      // 이동 평균 (앞뒤 win)
      let m = 0, cnt = 0; for (let j = Math.max(0, i - win); j <= Math.min(n - 1, i + win); j++) { m += flux[j]; cnt++; } m /= cnt;
      const th = m * 1.6 + floor;
      if (flux[i] > th && flux[i] >= (flux[i - 1] || 0) && flux[i] >= (flux[i + 1] || 0) && i - last >= minGap) { out.push(i * hop / sr); last = i; }
    }
    return out;
  }

  /* ---------- 미리보기 재생 ---------- */
  async function play(fromFrame) {
    stop();
    const a = ctx();
    if (a.state !== 'running') { try { await a.resume(); } catch (e) {} }
    const t0 = a.currentTime + 0.06;
    playing = { fromFrame, t0, nodes: scheduleA1(a, a.destination, fromFrame, t0).concat(scheduleA2(a, a.destination, fromFrame, t0)) };
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
    scheduleA2(oac, oac.destination, 0, 0, totalFrames);
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

  g.KMV_AUDIO = { ctx, decode, play, stop, now, isPlaying, renderMix, segments, scheduleA1, scheduleA2, voice, beats, duckSpans, XF, SR };
})(typeof window !== 'undefined' ? window : globalThis);
