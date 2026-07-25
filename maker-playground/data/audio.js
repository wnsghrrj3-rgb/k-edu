/* ============================================================
   MK_AUDIO — R38 이식 3차(귀): 오디오 실재생
   두 갈래 — ① 내 음악 파일(dataURL → <audio> 루프 실재생)
            ② 내장 합성 3종(WebAudio 실합성 — 음원 파일 0개, 서버 0원)
   패턴은 순수 데이터(jsdom 완전 검증), 실발성은 AudioContext 주입식.
   MK_PLAY(슬라이드쇼)가 장면 music 을 이 엔진으로 실재생한다.
   R39: renderPattern(오프라인 PCM) — MK_VIDEO 가 MP4 소리 트랙에 먹싱.
   ============================================================ */
window.MK_AUDIO = (() => {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 합성 프리셋 — 순수 데이터 ----------
     note: { t(박 시작·초), f(주파수 Hz), d(길이·초), type(osc), g(게인) } */
  const N = (t, f, d, type, g) => ({ t, f, d, type, g });
  const SYNTHS = [
    {
      id: 'piano', name: '밝은 피아노 루프', mood: '경쾌', loopSec: 3.2, master: 0.5,
      notes: [
        /* C-E-G-A 아르페지오 2회전 + 꾸밈 */
        N(0.0, 523.25, 0.34, 'triangle', 0.9), N(0.4, 659.25, 0.34, 'triangle', 0.7),
        N(0.8, 783.99, 0.34, 'triangle', 0.8), N(1.2, 880.00, 0.42, 'triangle', 0.7),
        N(1.6, 783.99, 0.34, 'triangle', 0.6), N(2.0, 659.25, 0.34, 'triangle', 0.7),
        N(2.4, 587.33, 0.34, 'triangle', 0.6), N(2.8, 523.25, 0.40, 'triangle', 0.8),
        N(0.0, 261.63, 1.5, 'sine', 0.5), N(1.6, 220.00, 1.5, 'sine', 0.5),
      ],
    },
    {
      id: 'calm', name: '잔잔한 파도 패드', mood: '차분', loopSec: 6.4, master: 0.42,
      notes: [
        N(0.0, 261.63, 3.4, 'sine', 0.8), N(0.0, 329.63, 3.4, 'sine', 0.55), N(0.0, 392.00, 3.4, 'sine', 0.4),
        N(3.2, 246.94, 3.4, 'sine', 0.8), N(3.2, 293.66, 3.4, 'sine', 0.55), N(3.2, 369.99, 3.4, 'sine', 0.4),
        N(1.6, 523.25, 1.2, 'sine', 0.25), N(4.8, 493.88, 1.2, 'sine', 0.25),
      ],
    },
    {
      id: 'beat', name: '신나는 비트', mood: '활기', loopSec: 2.0, master: 0.55,
      notes: [
        /* 킥(저음 순간) 4박 + 하이(고음 짧게) 업비트 + 베이스 */
        N(0.0, 70, 0.14, 'sine', 1.0), N(0.5, 70, 0.14, 'sine', 1.0), N(1.0, 70, 0.14, 'sine', 1.0), N(1.5, 70, 0.14, 'sine', 1.0),
        N(0.25, 4200, 0.05, 'square', 0.12), N(0.75, 4200, 0.05, 'square', 0.12), N(1.25, 4200, 0.05, 'square', 0.12), N(1.75, 4200, 0.05, 'square', 0.12),
        N(0.0, 110, 0.4, 'square', 0.28), N(1.0, 98, 0.4, 'square', 0.28), N(1.5, 130.81, 0.22, 'square', 0.22),
      ],
    },
  ];
  const synth = (id) => SYNTHS.find((s) => s.id === id) || null;

  /* 순수 계획 — 루프 1회의 발성 스케줄 (검증용·실재생 공용) */
  function patternPlan(id) {
    const s = synth(id);
    if (!s) return null;
    return {
      id: s.id, name: s.name, loopSec: s.loopSec, noteCount: s.notes.length,
      lastEnd: s.notes.reduce((m, n) => Math.max(m, n.t + n.d), 0),
      notes: s.notes,
    };
  }

  /* ---------- 실재생 런타임 ---------- */
  const S = { playing: false, paused: false, kind: null, key: null, name: null, engine: 'none',
    ctx: null, gain: null, loopTimer: null, audioEl: null, ctxFactory: null, setT: null, clearT: null };

  const sameMusic = (music) => {
    const key = music.src ? 'src:' + music.src.slice(0, 64) : 'synth:' + (music.synth || '');
    return key === S.key ? key : (S.nextKey = key, null) || key;
  };

  function makeCtx() {
    if (S.ctxFactory) return S.ctxFactory();
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    return AC ? new AC() : null;
  }

  function scheduleLoop(s, startAt) {
    const ctx = S.ctx, out = S.gain;
    s.notes.forEach((n) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = n.type; o.frequency.value = n.f;
      const t0 = startAt + n.t, t1 = t0 + n.d;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(clamp(n.g, 0.02, 1), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t1);
      o.connect(g); g.connect(out);
      o.start(t0); o.stop(t1 + 0.03);
    });
  }
  function armLoop(s) {
    const ctx = S.ctx;
    let nextStart = ctx.currentTime + 0.06;
    scheduleLoop(s, nextStart);
    const tick = () => {
      if (!S.playing || S.paused) return;
      const lead = nextStart + s.loopSec - ctx.currentTime;
      if (lead < 0.5) { nextStart += s.loopSec; scheduleLoop(s, nextStart); }
      S.loopTimer = (S.setT || ((f, t) => setTimeout(f, t)))(tick, 200);
    };
    S.loopTimer = (S.setT || ((f, t) => setTimeout(f, t)))(tick, 200);
  }
  const stopTimer = () => { if (S.loopTimer != null) { (S.clearT || clearTimeout)(S.loopTimer); S.loopTimer = null; } };

  /* music: {name, src?} | {name, synth: id} — 같은 음악이면 이어 재생(재시작 없음) */
  function play(music, opts = {}) {
    if (!music || (!music.src && !music.synth)) { stop(); return { ok: false }; }
    if (opts.ctxFactory) S.ctxFactory = opts.ctxFactory;
    if (opts.setTimeout) S.setT = opts.setTimeout;
    if (opts.clearTimeout) S.clearT = opts.clearTimeout;
    const key = music.src ? 'src:' + String(music.src).slice(0, 64) : 'synth:' + music.synth;
    if (S.playing && !S.paused && key === S.key) { S.name = music.name || S.name; return { ok: true, cont: true, engine: S.engine }; }
    stop();
    S.key = key; S.name = music.name || (music.synth ? (synth(music.synth) || {}).name : '내 음악') || '배경음';
    S.kind = music.src ? 'file' : 'synth'; S.playing = true; S.paused = false;

    try {
      if (music.src && typeof Audio !== 'undefined') {
        const a = new Audio(music.src);
        a.loop = true; a.volume = 0.85;
        const p = a.play(); if (p && p.catch) p.catch(() => {});
        S.audioEl = a; S.engine = 'audio';
      } else if (music.synth) {
        const s = synth(music.synth);
        if (!s) { S.playing = false; return { ok: false, msg: '없는 음악이에요' }; }
        const ctx = makeCtx();
        if (ctx) {
          S.ctx = ctx; S.gain = ctx.createGain(); S.gain.gain.value = s.master; S.gain.connect(ctx.destination);
          if (ctx.resume) { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); }
          armLoop(s);
          S.engine = 'webaudio';
        } else S.engine = 'none';                 /* 환경 미지원 — 상태만 유지(정직) */
      } else S.engine = 'none';
    } catch (_) { S.engine = 'none'; }
    return { ok: true, engine: S.engine };
  }
  function pause() {
    if (!S.playing || S.paused) return;
    S.paused = true; stopTimer();
    try { if (S.audioEl) S.audioEl.pause(); if (S.ctx && S.ctx.suspend) S.ctx.suspend(); } catch (_) {}
  }
  function resume() {
    if (!S.playing || !S.paused) return;
    S.paused = false;
    try {
      if (S.audioEl) { const p = S.audioEl.play(); if (p && p.catch) p.catch(() => {}); }
      if (S.ctx) { if (S.ctx.resume) S.ctx.resume(); const s = synth((S.key || '').replace('synth:', '')); if (s) armLoop(s); }
    } catch (_) {}
  }
  function stop() {
    stopTimer();
    try { if (S.audioEl) { S.audioEl.pause(); S.audioEl.src = ''; } } catch (_) {}
    try { if (S.ctx && S.ctx.close) S.ctx.close(); } catch (_) {}
    S.audioEl = null; S.ctx = null; S.gain = null;
    S.playing = false; S.paused = false; S.key = null; S.kind = null; S.name = null; S.engine = 'none';
  }

  /* ---------- R39 — 오프라인 PCM 렌더 (MP4 소리 트랙용, 순수 수학) ----------
     scheduleLoop 와 같은 패턴을 실시간 대신 샘플 배열로 그린다 — jsdom 완전 검증. */
  function waveAt(type, phaseCycles) {
    const p = phaseCycles - Math.floor(phaseCycles);
    if (type === 'square') return p < 0.5 ? 1 : -1;
    if (type === 'triangle') return 4 * Math.abs(p - 0.5) - 1;
    return Math.sin(2 * Math.PI * p);                       /* sine 기본 */
  }
  function envAt(tin, d, g) {
    /* scheduleLoop 의 지수 램프 근사: 0.0001 → g (0.02s 어택) → 0.0001 (d 끝) */
    const A = 0.02, lo = 0.0001, gg = clamp(g, 0.02, 1);
    if (tin < 0 || tin > d + 0.03) return 0;
    if (tin < A) return lo * Math.pow(gg / lo, tin / A);
    const r = clamp((tin - A) / Math.max(d - A, 1e-6), 0, 1);
    return gg * Math.pow(lo / gg, r);
  }
  function renderPattern(id, seconds, sr) {
    const s = synth(id);
    if (!s || !(seconds > 0)) return null;
    sr = sr || 48000;
    const n = Math.max(1, Math.round(seconds * sr));
    const out = new Float32Array(n);
    const loops = Math.ceil(seconds / s.loopSec);
    for (let li = 0; li < loops; li++) {
      const base = li * s.loopSec;
      for (const nt of s.notes) {
        const st = Math.max(0, Math.round((base + nt.t) * sr));
        const en = Math.min(n, Math.round((base + nt.t + nt.d + 0.03) * sr));
        for (let i = st; i < en; i++) {
          const t = i / sr;
          out[i] += waveAt(nt.type, nt.f * t) * envAt(t - (base + nt.t), nt.d, nt.g) * s.master;
        }
      }
    }
    for (let i = 0; i < n; i++) out[i] = clamp(out[i], -1, 1);
    return out;
  }

  /* 내 음악 파일 → dataURL (오디오 전용 — MK_LIVE 이미지 규약과 분리, 8MB) */
  function fileToSrc(file, cb, ReaderCls) {
    if (!file) return cb(null);
    if (!/^audio\//.test(file.type || '')) return cb(null, '음악 파일(mp3 등)만 넣을 수 있어요');
    if (file.size > 8 * 1024 * 1024) return cb(null, '8MB 이하만 넣을 수 있어요');
    const R = ReaderCls || window.FileReader;
    const rd = new R();
    rd.onload = () => cb(String(rd.result || ''));
    rd.onerror = () => cb(null, '파일을 읽지 못했어요');
    rd.readAsDataURL(file);
  }

  /* ---------- 판정 ---------- */
  function audioAudit() {
    const v = [];
    if (SYNTHS.length !== 3) v.push('합성 프리셋 3종 미충족');
    SYNTHS.forEach((s) => {
      if (!(s.loopSec > 0) || !s.notes.length) v.push(`${s.id} 패턴 비어있음`);
      const plan = patternPlan(s.id);
      if (plan.lastEnd > s.loopSec + 0.6) v.push(`${s.id} 발성이 루프를 크게 초과`);
      if (s.notes.some((n) => !(n.f >= 40 && n.f <= 9000) || !(n.d > 0))) v.push(`${s.id} 주파수·길이 범위 위반`);
    });
    /* 파일 게이트 — 오디오만 통과 */
    let gate = null; fileToSrc({ type: 'image/png', size: 10 }, (src, err) => { gate = err; }, function () { this.readAsDataURL = () => {}; });
    if (!gate) v.push('비오디오 파일 차단 실패');
    /* 상태 기계 — 주입 컨텍스트 없이도 상태 정직 유지 */
    play({ name: 'x', synth: 'piano' }, { ctxFactory: () => null });
    if (!state().playing || state().engine !== 'none') v.push('미지원 환경 상태 유지 실패');
    stop();
    if (state().playing) v.push('정지 실패');
    /* R39 — 오프라인 PCM: 길이 정확·무음 아님·클리핑 없음·없는 id 거절 */
    const pcm = renderPattern('piano', 1, 48000);
    if (!pcm || pcm.length !== 48000) v.push('PCM 길이 위반');
    else {
      let peak = 0; for (let i = 0; i < pcm.length; i++) peak = Math.max(peak, Math.abs(pcm[i]));
      if (!(peak > 0.05)) v.push('PCM 무음');
      if (peak > 1) v.push('PCM 클리핑');
    }
    if (renderPattern('없는음악', 1) !== null) v.push('없는 패턴 미거절');
    return { ok: v.length === 0, violations: v };
  }

  const state = () => ({ playing: S.playing, paused: S.paused, kind: S.kind, name: S.name, engine: S.engine });
  return { SYNTHS, patternPlan, play, pause, resume, stop, fileToSrc, state, audioAudit, waveAt, envAt, renderPattern };
})();
