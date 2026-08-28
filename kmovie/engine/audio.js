/* ============================================================
   케이무비 오디오 층 (KMV_AUDIO) — 설계서 v1 §2-5·§4·§5
   ------------------------------------------------------------
   · AudioContext.currentTime 이 재생 마스터 시계. 영상은 이 시계에 맞춘다.
   · 원본 소리는 스트리밍(KMV_MEDIA 의 pcm): 재생은 12초 창 펌프 — 창마다
     필요한 구간만 미리 디코드(ensureRange)해 스케줄하고, 노드는 창 끝에서
     잘라 다음 창이 샘플 정확히 이어받는다. 내보내기 믹스도 같은 창 단위
     오프라인 렌더(전체 PCM 을 들고 있지 않음).
   · A1(현장음) 스케줄 함수 하나를 미리보기(AudioContext)와
     내보내기(OfflineAudioContext)가 같이 쓴다 → 미리보기 = 내보내기.
   · 컷 경계 자동 크로스페이드 80ms(딸깍 제거). J/L 컷으로 넘친 소리는
     옆 클립 위로 자연히 겹쳐 페이드된다.
   · 속도 프리셋: 슬로/타임랩스 = playbackRate, 히트 슬로 = 3구간 스케줄.
   · A2 음악: 페이드 인/아웃 + 오토 덕킹(A1 음성 구간에서 -depth dB, 진입 200ms/복귀 500ms).
     페이드 게인과 덕킹 게인은 노드 둘을 직렬로 — 자동화 곡선을 곱하기 위해.
   · 비트 마커: 에너지 봉우리(onset) 휴리스틱 — 클립 경계 스냅용. 자동 컷은 없다(헌법).
   · 앰비언스: 원본에서 찾은 룸톤 1.5초를 이음매 없는 루프로 만들어 A1 빈틈(사진·프리즈·무음)에 깐다.
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

  /* ---------- 스트리밍 소리 헬퍼 ---------- */
  function hasA(src) { return !!(src && (src.audio || src.pcm)); }
  function aDur(src) { return src.pcm ? src.pcm.durSec : (src.audio ? src.audio.duration : 0); }
  /* offSec 부터 needSec 만큼을 담은 버퍼 — pcm 이면 캐시에서 조각을 조립(offset 0), 폴백이면 통 버퍼 그대로 */
  function bufFor(actx, src, offSec, needSec) {
    if (src.pcm) {
      const sr = src.pcm.sr || src.pcm.cfgSr || 48000, n = Math.max(1, Math.round(needSec * sr));
      const r = src.pcm.read(offSec, n), b = actx.createBuffer(r.ch.length, n, r.sr);
      for (let c = 0; c < r.ch.length; c++) b.copyToChannel(r.ch[c], c);
      return { buffer: b, offset: 0 };
    }
    return { buffer: src.audio, offset: offSec };
  }
  /* 타임라인 [f0,f1) 창이 재생·렌더에 필요로 하는 원본 구간을 전부 선디코드 */
  async function ensureRange(f0, f1) {
    const P = g.KMV_PROJECT, FPS = P.FPS, M = g.KMV_MEDIA, jobs = [];
    for (const a of P.data.A1) {
      const c = P.clip(a.clip); if (!c) continue;
      const m = P.media(c.media), src = M.get(m.id); if (!src || !src.pcm) continue;
      for (const s of segments(a, c, m)) {
        const st = Math.max(s.tl, f0), en = Math.min(s.tl + s.dur, f1); if (en <= st) continue;
        jobs.push(src.pcm.ensure(s.src + (st - s.tl) / FPS * s.rate - 0.05, s.src + (en - s.tl) / FPS * s.rate + 0.1));
      }
    }
    for (const a of (P.data.A2 || [])) {
      const m = P.media(a.media), src = m && M.get(m.id); if (!src || !src.pcm) continue;
      const st = Math.max(a.at, f0), en = Math.min(a.at + (a.out - a.in), f1); if (en <= st) continue;
      jobs.push(src.pcm.ensure((a.in + st - a.at) / FPS - 0.05, (a.in + en - a.at) / FPS + 0.1));
    }
    const amb = P.data.audio && P.data.audio.ambience;
    if (amb && amb.on && amb.src) {
      const m = P.media(amb.src.media), S = M.get(amb.src.media);
      if (m && S && S.pcm) jobs.push(S.pcm.ensure(amb.src.in / m.fps - 0.05, amb.src.out / m.fps + 0.2));
    }
    await Promise.all(jobs);
  }

  /* 타임라인 fromFrame 이 컨텍스트 시각 t0 에 재생되도록 A1 전부 스케줄. 반환: 노드 목록 */
  function scheduleA1(actx, dest, fromFrame, t0, untilFrame, capFrame) {
    const P = g.KMV_PROJECT, FPS = P.FPS, nodes = [];
    for (const a of P.data.A1) {
      const c = P.clip(a.clip); if (!c) continue;
      const m = P.media(c.media), src = g.KMV_MEDIA.get(m.id);
      if (!src || !hasA(src)) continue;
      for (const s of segments(a, c, m)) {
        const end = s.tl + s.dur;
        if (end <= fromFrame || s.dur <= 0) continue;
        if (untilFrame != null && s.tl >= untilFrame) continue;
        const skip = Math.max(0, fromFrame - s.tl);
        const when = t0 + (s.tl + skip - fromFrame) / FPS;
        const durSec = (s.dur - skip) / FPS;
        let durPlay = capFrame != null ? Math.min(durSec, (capFrame - (s.tl + skip)) / FPS) : durSec;
        if (durPlay <= 0.001) continue;
        const srcOff = s.src + skip / FPS * s.rate;
        if (srcOff >= aDur(src)) continue;
        const bf = bufFor(actx, src, srcOff, durPlay * s.rate + 0.05);
        const node = actx.createBufferSource(); node.buffer = bf.buffer; node.playbackRate.value = s.rate;
        const gn = actx.createGain();
        const vol = a.vol == null ? 1 : a.vol;
        // 페이드는 조각 전체 길이 기준 — 창 경계에서 잘려 이어져도 게인 값이 연속
        const lenWall = s.dur / FPS, f = Math.min(XF, lenWall / 2), pos0 = skip / FPS;
        const gAt = p => { let v = vol; if (f > 0) { if (p < f) v *= p / f; const q = lenWall - p; if (q < f) v *= Math.max(0, q / f); } return v; };
        gn.gain.setValueAtTime(gAt(pos0), when);
        if (pos0 < f) gn.gain.linearRampToValueAtTime(vol, when + (f - pos0));
        const foS = Math.max(pos0, lenWall - f);
        gn.gain.setValueAtTime(gAt(foS), when + (foS - pos0));
        gn.gain.linearRampToValueAtTime(0, when + (lenWall - pos0));
        node.connect(gn); gn.connect(dest);
        node.start(when, bf.offset, durPlay * s.rate);
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
  function scheduleA2(actx, dest, fromFrame, t0, untilFrame, capFrame) {
    const P = g.KMV_PROJECT, FPS = P.FPS, nodes = [];
    const D = P.data.audio && P.data.audio.ducking, depth = D && D.on ? dB(D.depth == null ? 12 : D.depth) : 1;
    const spans = depth < 1 ? duckSpans() : [];
    for (const a of P.data.A2) {
      const m = P.media(a.media), src = g.KMV_MEDIA.get(m.id);
      if (!src || !hasA(src)) continue;
      const len = a.out - a.in, end = a.at + len;
      if (end <= fromFrame || len <= 0) continue;
      if (untilFrame != null && a.at >= untilFrame) continue;
      const skip = Math.max(0, fromFrame - a.at);
      const when = t0 + (a.at + skip - fromFrame) / FPS, durSec = (len - skip) / FPS;
      let durPlay = capFrame != null ? Math.min(durSec, (capFrame - (a.at + skip)) / FPS) : durSec;
      if (durPlay <= 0.001) continue;
      const srcOff = (a.in + skip) / FPS; if (srcOff >= aDur(src)) continue;
      const bf = bufFor(actx, src, srcOff, durPlay + 0.05);
      const node = actx.createBufferSource(); node.buffer = bf.buffer;
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
      node.start(when, bf.offset, durPlay);
      nodes.push(node);
    }
    return nodes;
  }


  /* ---------- 앰비언스(룸톤) ----------
     · findRoomTone(): 타임라인에 쓰인 영상 원본들의 peaks(프레임 RMS) 에서 가장 조용하면서 "완전 무음은 아닌" 1.5초 창을 고른다.
       (디지털 무음은 룸톤이 아니다 — 최대값 문턱). 점수 = 평균 RMS + 흔들림(표준편차) 가중. 앞쪽 클립 우선(같은 점수면 먼저 나온 것).
     · ambGaps(): A1 이 하나도 덮지 않는 타임라인 구간(사진·프리즈·무음 클립·소리 0). 3프레임 미만은 무시.
     · ambBuffer(): 룸톤 구간을 잘라 앞뒤 100ms 를 겹쳐 붙인 "이음매 없는 루프" 버퍼(캐시).
     · scheduleAmb(): 빈틈마다 루프 재생 + 200ms 페이드 인/아웃. gain = 원본 레벨 × ambience.gain. */
  const AMB_SEC = 1.5, AMB_XF = 0.1, AMB_EDGE = 0.2;
  const ambCache = new Map();
  function findRoomTone() {
    const P = g.KMV_PROJECT, M = g.KMV_MEDIA;
    const used = []; for (const c of P.data.V) if (!used.includes(c.media)) used.push(c.media);
    let best = null;
    used.forEach((mid, order) => {
      const m = P.media(mid), src = M.get(mid); if (!m || m.kind !== 'video' || !m.audio || !src || !src.peaks) return;
      const pk = src.peaks, n = pk.length, win = Math.round(AMB_SEC * m.fps); if (n < win + 2) return;
      const sorted = Array.from(pk).sort((a, b) => a - b), q90 = sorted[Math.floor(n * 0.9)] || 0;
      const silent = Math.max(1e-4, q90 * 0.002);            // 이보다 작으면 디지털 무음
      let sum = 0, sq = 0; for (let i = 0; i < win; i++) { sum += pk[i]; sq += pk[i] * pk[i]; }
      const step = Math.max(1, Math.round(m.fps / 10));       // 0.1초 간격으로 훑는다
      for (let i = 0; i + win <= n; i += step) {
        if (i) { for (let j = i - step; j < i; j++) { sum -= pk[j]; sq -= pk[j] * pk[j]; } for (let j = i + win - step; j < i + win; j++) { sum += pk[j]; sq += pk[j] * pk[j]; } }
        const mean = sum / win, sd = Math.sqrt(Math.max(0, sq / win - mean * mean));
        let mx = 0; for (let j = i; j < i + win; j++) if (pk[j] > mx) mx = pk[j];
        if (mx <= silent) continue;
        const score = mean + sd * 2 + order * 1e-6;
        if (!best || score < best.score) best = { media: mid, in: i, out: i + win, score, level: mean };
      }
    });
    return best;
  }
  function ambGaps(totalFrames) {
    const P = g.KMV_PROJECT, tot = totalFrames == null ? P.total() : totalFrames;
    if (!tot) return [];
    const on = new Uint8Array(tot);
    for (const a of P.data.A1) { const c = P.clip(a.clip); if (!c || (a.vol != null && a.vol <= 0)) continue; const m = P.media(c.media); for (const sg of segments(a, c, m)) for (let f = Math.max(0, sg.tl); f < Math.min(tot, sg.tl + sg.dur); f++) on[f] = 1; }
    const out = []; let st = -1;
    for (let f = 0; f <= tot; f++) { const v = f < tot && !on[f]; if (v && st < 0) st = f; else if (!v && st >= 0) { if (f - st >= 3) out.push({ at: st, dur: f - st }); st = -1; } }
    return out;
  }
  function ambBuffer(actx) {
    const P = g.KMV_PROJECT, amb = P.data.audio && P.data.audio.ambience, src = amb && amb.src;
    if (!src) return null;
    const m = P.media(src.media), S = g.KMV_MEDIA.get(src.media); if (!m || !S || !hasA(S)) return null;
    if (S.pcm) {                                             // 스트리밍: 필요한 1.5초만 읽는다 (ensureRange 가 먼저 채움)
      const sr = S.pcm.sr || S.pcm.cfgSr || 48000, key = src.media + ':' + src.in + ':' + src.out + ':' + sr;
      if (ambCache.has(key)) return ambCache.get(key);
      const len = Math.round((src.out - src.in) / m.fps * sr), xf = Math.min(Math.floor(AMB_XF * sr), Math.floor(len / 4));
      if (len < sr * 0.3) return null;
      const r = S.pcm.read(src.in / m.fps, len), outLen = len - xf, buf = actx.createBuffer(r.ch.length, outLen, sr);
      for (let ch = 0; ch < r.ch.length; ch++) {
        const d = r.ch[ch], o = buf.getChannelData(ch);
        for (let i = 0; i < outLen; i++) o[i] = d[i];
        for (let i = 0; i < xf; i++) { const t = i / xf, w = Math.sqrt(t), w2 = Math.sqrt(1 - t); o[i] = d[i] * w + d[outLen + i] * w2; }
      }
      ambCache.set(key, buf); return buf;
    }
    const ab = S.audio, sr = ab.sampleRate, key = src.media + ':' + src.in + ':' + src.out + ':' + sr;
    if (ambCache.has(key)) return ambCache.get(key);
    const s0 = Math.floor(src.in / m.fps * sr), s1 = Math.min(ab.length, Math.floor(src.out / m.fps * sr));
    const len = s1 - s0, xf = Math.min(Math.floor(AMB_XF * sr), Math.floor(len / 4));
    if (len < sr * 0.3) return null;
    const outLen = len - xf, buf = actx.createBuffer(ab.numberOfChannels, outLen, sr);
    for (let ch = 0; ch < ab.numberOfChannels; ch++) {
      const d = ab.getChannelData(ch), o = buf.getChannelData(ch);
      for (let i = 0; i < outLen; i++) o[i] = d[s0 + i];
      for (let i = 0; i < xf; i++) { const t = i / xf, w = Math.sqrt(t), w2 = Math.sqrt(1 - t); o[i] = d[s0 + i] * w + d[s0 + outLen + i] * w2; }   // 끝 100ms 를 앞에 겹쳐 이음매 제거(등전력)
    }
    ambCache.set(key, buf); return buf;
  }
  function scheduleAmb(actx, dest, fromFrame, t0, untilFrame, capFrame) {
    const P = g.KMV_PROJECT, FPS = P.FPS, amb = P.data.audio && P.data.audio.ambience, nodes = [];
    if (!amb || !amb.on || !amb.src) return nodes;
    const buf = ambBuffer(actx); if (!buf) return nodes;
    const gainV = amb.gain == null ? 1 : amb.gain, loopSec = buf.duration;
    for (const gp of ambGaps(untilFrame)) {
      const end = gp.at + gp.dur; if (end <= fromFrame) continue;
      if (untilFrame != null && gp.at >= untilFrame) continue;
      const skip = Math.max(0, fromFrame - gp.at), when = t0 + (gp.at + skip - fromFrame) / FPS, durSec = (gp.dur - skip) / FPS;
      let durPlay = capFrame != null ? Math.min(durSec, (capFrame - (gp.at + skip)) / FPS) : durSec;
      if (durPlay <= 0.02) continue;
      const node = actx.createBufferSource(); node.buffer = buf; node.loop = true; node.loopStart = 0; node.loopEnd = loopSec;
      const gn = actx.createGain(), f = Math.min(AMB_EDGE, durSec / 2);
      const gapStartSec = gp.at / FPS, tNow = (gp.at + skip) / FPS;
      gn.gain.setValueAtTime(skip > 0 ? gainV : 0, when);
      if (skip === 0) gn.gain.linearRampToValueAtTime(gainV, when + f);
      gn.gain.setValueAtTime(gainV, when + durSec - f); gn.gain.linearRampToValueAtTime(0, when + durSec);
      node.connect(gn); gn.connect(dest);
      node.start(when, ((tNow - gapStartSec) % loopSec), durPlay);
      nodes.push(node);
    }
    return nodes;
  }

  /* ---------- 비트 마커 (onset 휴리스틱) → 초 배열 ----------
     env = 저역 포락(hop 단위 RMS), envRate = 초당 env 개수. 통 버퍼(beats)와
     스트리밍 분석(KMV_MEDIA pcmScan·PcmWav.scan)이 같은 봉우리 뽑기를 쓴다. */
  function beatsFromEnv(env, envRate) {
    const n = env ? env.length : 0;
    if (n < 8 || !envRate) return [];
    // 스펙트럴 플럭스 대용: 증가분만
    const flux = new Float32Array(n); for (let i = 1; i < n; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
    // 적응 문턱: 이동 평균(±0.35초) × 1.6 + 바닥, 봉우리 사이 최소 0.25초
    const win = Math.round(0.35 * envRate), minGap = Math.round(0.25 * envRate);
    const out = []; let last = -minGap;
    const sorted = Array.from(flux).sort((a, b) => a - b), floor = (sorted[Math.floor(n * 0.5)] || 0) * 0.5;
    for (let i = 0; i < n; i++) {
      // 이동 평균 (앞뒤 win)
      let m = 0, cnt = 0; for (let j = Math.max(0, i - win); j <= Math.min(n - 1, i + win); j++) { m += flux[j]; cnt++; } m /= cnt;
      const th = m * 1.6 + floor;
      if (flux[i] > th && flux[i] >= (flux[i - 1] || 0) && flux[i] >= (flux[i + 1] || 0) && i - last >= minGap) { out.push(i / envRate); last = i; }
    }
    return out;
  }
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
    return beatsFromEnv(env, sr / hop);
  }

  /* ---------- 미리보기 재생 (창 펌프) ----------
     첫 창(WIN_S초)을 선디코드해 스케줄하고, 남은 앞길이 TOP_S초 밑으로 내려오면
     다음 창을 이어 붙인다. 각 창의 노드는 창 끝에서 잘리고(capFrame) 다음 창이
     같은 수식으로 이어받아 샘플 연속. 폴백(통 버퍼) 소스도 같은 길로 간다. */
  let WIN_S = 12, TOP_S = 6;
  let gen = 0, pumpTimer = null;
  function stopPump() { if (pumpTimer) { clearInterval(pumpTimer); pumpTimer = null; } gen++; }
  async function play(fromFrame) {
    stop();
    const a = ctx();
    if (a.state !== 'running') { try { await a.resume(); } catch (e) {} }
    const P = g.KMV_PROJECT, FPS = P.FPS, total = P.total(), myGen = ++gen;
    const WIN = Math.max(1, Math.round(WIN_S * FPS));
    let h = Math.min(total, fromFrame + Math.max(1, Math.round(4 * FPS)));   // 첫 창은 4초 — 시작이 빨라야 한다 (나머지는 펌프)
    try { await ensureRange(fromFrame, h); } catch (e) {}
    if (gen !== myGen) return null;
    const t0 = a.currentTime + 0.06;
    playing = { fromFrame, t0, nodes: scheduleA1(a, a.destination, fromFrame, t0, h, h).concat(scheduleA2(a, a.destination, fromFrame, t0, h, h), scheduleAmb(a, a.destination, fromFrame, t0, h, h)) };
    const me = playing;
    let busy = false;
    const pump = async () => {
      if (busy || gen !== myGen || playing !== me) return;
      const nf = now(); if (nf == null || h >= total) return;
      if (h - nf > TOP_S * FPS) return;
      busy = true;
      try {
        const w0 = h, w1 = Math.min(total, h + WIN);
        await ensureRange(w0, w1);
        if (gen !== myGen || playing !== me) return;
        const tw = t0 + (w0 - fromFrame) / FPS;
        me.nodes.push(...scheduleA1(a, a.destination, w0, tw, w1, w1), ...scheduleA2(a, a.destination, w0, tw, w1, w1), ...scheduleAmb(a, a.destination, w0, tw, w1, w1));
        h = w1;
      } finally { busy = false; }
    };
    pumpTimer = setInterval(() => { pump().catch(() => {}); }, 300);
    return t0;
  }
  function now() { if (!playing) return null; return playing.fromFrame + (ctx().currentTime - playing.t0) * (playing.fps || g.KMV_PROJECT.FPS); }
  /* 소스 모니터 재생 — 원본 소리를 원본 프레임 fromSrcFrame 부터, 같은 창 펌프. now() 는 원본 프레임 단위 */
  async function playSource(mediaId, fromSrcFrame) {
    stop();
    const P = g.KMV_PROJECT, m = P.media(mediaId), src = g.KMV_MEDIA.get(mediaId);
    if (!m) return null;
    const a = ctx();
    if (a.state !== 'running') { try { await a.resume(); } catch (e) {} }
    const myGen = ++gen, dur = src ? aDur(src) : 0, off0 = fromSrcFrame / m.fps;
    let h = Math.min(dur, off0 + 4);                     // 첫 창 4초 (나머지는 펌프)
    if (src && src.pcm) { try { await src.pcm.ensure(off0 - 0.05, h + 0.1); } catch (e) {} }
    if (gen !== myGen) return null;
    const t0 = a.currentTime + 0.06, nodes = [];
    const seg = (o0, o1, when) => {
      if (!src || !hasA(src) || o1 - o0 <= 0.005) return;
      const bf = bufFor(a, src, o0, o1 - o0 + 0.05);
      const n = a.createBufferSource(); n.buffer = bf.buffer; n.connect(a.destination); n.start(when, bf.offset, o1 - o0); nodes.push(n);
    };
    if (off0 < dur - 0.01) seg(off0, h, t0);
    playing = { fromFrame: fromSrcFrame, t0, nodes, fps: m.fps, source: mediaId };
    const me = playing;
    let busy = false;
    pumpTimer = setInterval(async () => {
      if (busy || gen !== myGen || playing !== me || h >= dur) return;
      const pos = off0 + (ctx().currentTime - t0);
      if (h - pos > TOP_S) return;
      busy = true;
      try {
        const w0 = h, w1 = Math.min(dur, h + WIN_S);
        if (src && src.pcm) await src.pcm.ensure(w0 - 0.05, w1 + 0.1);
        if (gen !== myGen || playing !== me) return;
        seg(w0, w1, t0 + (w0 - off0));
        h = w1;
      } finally { busy = false; }
    }, 300);
    return t0;
  }
  function stop() {
    stopPump();
    if (!playing) return;
    playing.nodes.forEach(n => { try { n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
    playing = null;
  }
  function isPlaying() { return !!playing; }

  /* ---------- 내보내기용 오프라인 믹스(창 단위 스트리밍) ----------
     onChunk(buf, startFrame) 를 주면 15초 창마다 렌더해 바로 넘긴다(전체 PCM 미보유).
     안 주면 이어 붙인 AudioBuffer 하나(짧은 타임라인·테스트용). */
  async function renderMix(totalFrames, onChunk) {
    const FPS = g.KMV_PROJECT.FPS;
    const WINF = Math.max(1, Math.round(15 * FPS));
    const chunks = [];
    for (let w0 = 0; w0 < totalFrames; w0 += WINF) {
      const w1 = Math.min(totalFrames, w0 + WINF);
      try { await ensureRange(w0, w1); } catch (e) {}
      const len = Math.max(1, Math.round((w1 - w0) / FPS * SR));
      const oac = new OfflineAudioContext(2, len, SR);
      scheduleA1(oac, oac.destination, w0, 0, w1);
      scheduleA2(oac, oac.destination, w0, 0, w1);
      scheduleAmb(oac, oac.destination, w0, 0, w1);
      const buf = await oac.startRendering();
      if (onChunk) await onChunk(buf, w0); else chunks.push(buf);
    }
    if (onChunk) return null;
    const total = Math.max(1, Math.ceil(totalFrames / FPS * SR));
    const out = new AudioBuffer({ length: total, sampleRate: SR, numberOfChannels: 2 });
    let at = 0;
    for (const b of chunks) { for (let c = 0; c < 2; c++) out.copyToChannel(b.getChannelData(Math.min(c, b.numberOfChannels - 1)), c, at); at += b.length; }
    return out;
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

  g.KMV_AUDIO = { ctx, decode, play, playSource, stop, now, isPlaying, nodeCount: () => (playing ? playing.nodes.length : 0), renderMix, ensureRange, segments, scheduleA1, scheduleA2, scheduleAmb, findRoomTone, ambGaps, ambBuffer, voice, beats, beatsFromEnv, duckSpans, XF, SR, AMB_SEC,
    _tune: o => { if (o && o.win > 0) WIN_S = o.win; if (o && o.top > 0) TOP_S = o.top; } };
})(typeof window !== 'undefined' ? window : globalThis);
