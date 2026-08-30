/* ============================================================
   케이무비 생성 배경음악 (KMV_GEN) — 음원·폰트·효과 설계 v1 §2
   ------------------------------------------------------------
   · 샘플·모델 없이 Web Audio 수식만으로 만든다 → 라이선스 0·다운로드 0·오프라인 동작.
   · 결정적: 같은 {무드, bpm, 조성, seed, 길이} 면 언제나 같은 소리(재생 = 내보내기 = 새로고침 뒤).
   · KMV_MEDIA 의 Pcm 과 같은 인터페이스({durSec, sr, ensure, read, dispose})를 흉내내
     A2 음악 경로(창 펌프·믹스·페이드·덕킹)를 코드 0줄로 그대로 탄다.
   · 비트 격자는 추측이 아니라 BPM 그대로 — 몽타주·박자 스냅이 어긋나지 않는다.
   · 소리내기 단위는 "보이스"(악기+음높이+길이+세기). 화음 진행이 반복되므로
     보이스 버퍼를 캐시하면 3분짜리도 실제로는 수십 개만 만든다.
   ============================================================ */
(function (g) {
  'use strict';

  const SR = 48000;            // 합성 표본율 (재생 컨텍스트가 44.1k 라도 브라우저가 리샘플)
  const TAIL = 1.1;            // 보이스마다 붙는 잔향 꼬리(초)
  const VOICE_BUDGET = 48 * 1048576;

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  function rnd(seed) {
    let a = (seed >>> 0) || 1;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  /* ---------- 조성 ---------- */
  const KEYS = [
    { id: 'C', ko: '다장조', pc: 0 }, { id: 'G', ko: '사장조', pc: 7 }, { id: 'F', ko: '바장조', pc: 5 },
    { id: 'D', ko: '라장조', pc: 2 }, { id: 'Bb', ko: '내림나장조', pc: 10 }, { id: 'Eb', ko: '내림마장조', pc: 3 },
    { id: 'A', ko: '가단조', pc: 9 }, { id: 'E', ko: '마단조', pc: 4 },
  ];
  const QUAL = { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], sus: [0, 5, 7] };
  function chordMidi(root, q) { const iv = QUAL[q] || QUAL.maj; return iv.map(i => root + i).concat([root + 12]); }

  /* ---------- 무드 ----------
     bar(o) 가 한 마디 분량의 음을 push 한다. o = {push, t0, spb, chord, section, bar, rand} */
  const MOODS = [
    {
      id: 'morning', ko: '아침 교실', desc: '펠트 피아노 아르페지오 + 따뜻한 패드 + 셰이커',
      bpm: { def: 92, min: 80, max: 104 }, keys: ['C', 'G', 'F'],
      prog: [[0, 'maj'], [7, 'maj'], [9, 'min'], [5, 'maj']], intro: 2, outro: 4,
      bar(o) {
        const root = 48 + o.chord[0], v = chordMidi(root, o.chord[1]);
        const arp = [v[1] + 12, v[2] + 12, v[3] + 12, v[2] + 24];
        const pad = [v[0] + 12, v[1] + 12, v[2] + 12];
        const s = o.section, last = s === 'outro' && o.lastBar;
        pad.forEach((m, i) => o.push({ inst: 'pad', midi: m, t: o.t0, dur: o.spb * 4 * (last ? 2.2 : 1.04), vel: s === 'intro' ? 0.13 : 0.17, pan: (i - 1) * 0.35 }));
        const pat = s === 'intro' ? [0, -1, 2, -1, 1, -1, 3, -1] : s === 'B' ? [3, 1, 2, 0, 3, 1, 2, 1] : [0, 1, 2, 3, 2, 1, 2, 0];
        for (let i = 0; i < 8; i++) {
          const k = pat[i]; if (k < 0) continue;
          if (last && i > 0) break;
          o.push({ inst: 'piano', midi: arp[k], t: o.t0 + i * o.spb / 2, dur: last ? o.spb * 5 : o.spb * 0.95, vel: (i % 2 ? 0.30 : 0.42) * (s === 'intro' ? 0.8 : 1), pan: (o.rand() - 0.5) * 0.3 });
        }
        if (s !== 'intro') {
          o.push({ inst: 'bass', midi: root - 12, t: o.t0, dur: o.spb * 1.9, vel: 0.34 });
          if (!last) o.push({ inst: 'bass', midi: root - 12, t: o.t0 + o.spb * 2, dur: o.spb * 1.7, vel: 0.26 });
        }
        if ((s === 'A' || s === 'B') && !last) for (let i = 0; i < 8; i++) o.push({ inst: 'shaker', midi: 0, t: o.t0 + i * o.spb / 2, dur: 0.14, vel: i % 2 ? 0.09 : 0.16, pan: 0.2 });
        if (last) o.push({ inst: 'bell', midi: v[0] + 24, t: o.t0, dur: 3.4, vel: 0.22 });
      },
    },
    {
      id: 'ending', ko: '잔잔한 엔딩', desc: '피아노 단음 + 긴 패드 + 벨 한 번 (엔딩 카드용)',
      bpm: { def: 64, min: 56, max: 72 }, keys: ['A', 'E', 'C'],
      prog: [[9, 'min7'], [5, 'maj7'], [0, 'maj'], [7, 'sus']], intro: 2, outro: 4,
      bar(o) {
        const root = 45 + o.chord[0], v = chordMidi(root, o.chord[1]);
        const s = o.section, last = s === 'outro' && o.lastBar;
        const pad = last ? [v[0] + 12, v[1] + 12, v[2] + 12, v[0] + 24] : [v[0] + 12, v[1] + 12, v[2] + 12];
        pad.forEach((m, i) => o.push({ inst: 'pad', midi: m, t: o.t0, dur: o.spb * 4 * (last ? 2.6 : 1.06), vel: 0.15, pan: (i - 1.5) * 0.3 }));
        if (last) { o.push({ inst: 'piano', midi: v[0] + 12, t: o.t0, dur: o.spb * 6, vel: 0.34 }); o.push({ inst: 'bell', midi: v[0] + 24, t: o.t0 + o.spb * 0.5, dur: 4.2, vel: 0.26 }); return; }
        const mel = s === 'intro' ? [1, 3] : s === 'B' ? [3, 2, 1, 2] : [2, 3, 1];
        mel.forEach((k, i) => o.push({ inst: 'piano', midi: v[k % v.length] + 12, t: o.t0 + i * (o.spb * 4 / mel.length), dur: o.spb * 2.4, vel: 0.30 - i * 0.03, pan: (o.rand() - 0.5) * 0.24 }));
        if (s !== 'intro') o.push({ inst: 'bass', midi: root - 12, t: o.t0, dur: o.spb * 3.6, vel: 0.26 });
        if (o.bar % 8 === 0) o.push({ inst: 'bell', midi: v[2] + 24, t: o.t0, dur: 2.6, vel: 0.16 });
      },
    },
  ];
  const mood = id => MOODS.find(m => m.id === id) || MOODS[0];
  const keyOf = id => KEYS.find(k => k.id === id) || KEYS[0];

  /* ---------- 악보 짜기 ----------
     spec = { mood, bpm, key, seed, durSec }  →  { notes(시각순), beats(초), bars, bpm, durSec } */
  function plan(spec) {
    const M = mood(spec.mood), K = keyOf(spec.key || M.keys[0]);
    const bpm = clamp(Math.round(spec.bpm || M.bpm.def), M.bpm.min, M.bpm.max);
    const spb = 60 / bpm, barSec = spb * 4;
    const want = Math.max(4, spec.durSec || 60);
    const bars = Math.max(M.intro + M.outro + 2, Math.ceil(want / barSec));
    const rand = rnd((spec.seed == null ? 1 : spec.seed) * 2654435761 + bars);
    const notes = [], push = n => notes.push(n);
    for (let b = 0; b < bars; b++) {
      let section = 'A';
      if (b < M.intro) section = 'intro';
      else if (b >= bars - M.outro) section = 'outro';
      else section = (Math.floor((b - M.intro) / M.prog.length) % 2) ? 'B' : 'A';
      const ci = section === 'outro' ? (b === bars - 1 ? 2 : (b - M.intro) % M.prog.length) : (b - M.intro + M.prog.length) % M.prog.length;
      const chord = M.prog[section === 'outro' && b === bars - 1 ? 2 : ci];   // 마지막 마디는 으뜸화음으로 닫는다
      M.bar({ push, t0: b * barSec, spb, chord: [chord[0] + K.pc, chord[1]], section, bar: b, lastBar: b === bars - 1, rand });
    }
    notes.sort((a, b) => a.t - b.t);
    let end = bars * barSec;                                  // 마지막 음(꼬리 포함)까지가 실제 길이
    for (const nt of notes) end = Math.max(end, nt.t + nt.dur + TAIL);
    const durSec = end + 0.2;
    const beats = []; for (let i = 0; i * spb < bars * barSec; i++) beats.push(i * spb);
    return { notes, beats, bars, bpm, spb, barSec, durSec, mood: M.id, key: K.id, seed: spec.seed == null ? 1 : spec.seed };
  }

  /* ---------- 보이스 합성 (순수 수식, 모노 + 잔향 꼬리) ---------- */
  const vcache = new Map(); let vbytes = 0;
  function voiceBuf(inst, freq, dur, sr) {
    const key = inst + '|' + freq.toFixed(3) + '|' + dur.toFixed(3) + '|' + sr;
    const hit = vcache.get(key); if (hit) { hit.touch = ++vcache.tick; return hit.buf; }
    const buf = synth(inst, freq, dur, sr);
    vcache.set(key, { buf, touch: ++vcache.tick || 1 }); vbytes += buf.length * 4;
    if (vbytes > VOICE_BUDGET) {                                  // 오래 안 쓴 보이스부터 버림
      for (const [k, v] of [...vcache.entries()].sort((a, b) => a[1].touch - b[1].touch)) {
        if (vbytes <= VOICE_BUDGET * 0.7) break;
        vcache.delete(k); vbytes -= v.buf.length * 4;
      }
    }
    return buf;
  }
  vcache.tick = 0;

  /* 잔향: 짧은 IIR 콤 둘(37ms·53ms) — 보이스 안에 넣어 두면 어느 창에서 읽어도 같은 소리 */
  function reverb(x, sr, wet) {
    const d1 = Math.round(0.037 * sr), d2 = Math.round(0.053 * sr), fb = 0.62;
    for (let i = d1; i < x.length; i++) x[i] += x[i - d1] * fb * 0.5 * wet;
    for (let i = d2; i < x.length; i++) x[i] += x[i - d2] * fb * 0.42 * wet;
  }

  function synth(inst, f, dur, sr) {
    const n = Math.max(1, Math.round((dur + TAIL) * sr)), x = new Float32Array(n), TAU = Math.PI * 2;
    const env = (i, a, d) => { const t = i / sr; return t < a ? t / a : Math.exp(-(t - a) / d); };
    if (inst === 'piano') {
      // 펠트 피아노: 3배음 + 짧은 노이즈 트랜지언트, 배음일수록 빨리 사라짐
      const ps = [[1, 1, dur * 0.9], [2.003, 0.42, dur * 0.42], [3.01, 0.19, dur * 0.26], [4.02, 0.08, dur * 0.16]];
      const R = rnd(Math.round(f * 100));
      for (let i = 0; i < n; i++) {
        const t = i / sr; let v = 0;
        for (const [r, a, d] of ps) v += a * Math.sin(TAU * f * r * t) * Math.exp(-t / Math.max(0.05, d));
        if (t < 0.006) v += (R() - 0.5) * 0.5 * (1 - t / 0.006);
        x[i] = v * (t < 0.004 ? t / 0.004 : 1) * 0.28;
      }
      reverb(x, sr, 0.8);
    } else if (inst === 'pad') {
      // 디튠 둘 × 5배음, 배음은 저역통과처럼 눌러 담는다. 느린 등장·퇴장.
      const det = [1, 1.0035], hs = [1, 2, 3, 4, 5], fc = 1400;
      const at = Math.min(0.7, dur * 0.35), rl = Math.min(1.1, dur * 0.45);
      for (let i = 0; i < n; i++) {
        const t = i / sr; let v = 0;
        for (const dt of det) for (const h of hs) { const fh = f * h * dt; v += Math.sin(TAU * fh * t) / (h * (1 + Math.pow(fh / fc, 2))); }
        let e = t < at ? t / at : 1;
        if (t > dur - rl) e *= Math.max(0, (dur - t) / rl);
        if (t > dur) e = 0;
        x[i] = v * e * 0.16;
      }
      reverb(x, sr, 1);
    } else if (inst === 'bell') {
      const mr = 3.47;
      for (let i = 0; i < n; i++) {
        const t = i / sr, idx = 3.2 * Math.exp(-t / 0.35), e = Math.exp(-t / Math.max(0.2, dur / 3.2));
        x[i] = Math.sin(TAU * f * t + idx * Math.sin(TAU * f * mr * t)) * e * 0.22 * (t < 0.003 ? t / 0.003 : 1);
      }
      reverb(x, sr, 1);
    } else if (inst === 'bass') {
      for (let i = 0; i < n; i++) {
        const t = i / sr, e = env(i, 0.012, Math.max(0.15, dur * 0.55)) * (t > dur ? Math.exp(-(t - dur) / 0.12) : 1);
        x[i] = (Math.sin(TAU * f * t) + 0.24 * Math.sin(TAU * f * 2 * t)) * e * 0.34;
      }
      reverb(x, sr, 0.25);
    } else if (inst === 'shaker') {
      const R = rnd(7717); let prev = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr, w = R() - 0.5, hp = w - prev; prev = w;
        x[i] = hp * Math.exp(-t / 0.028) * 0.5;
      }
      reverb(x, sr, 0.35);
    } else if (inst === 'kick') {
      for (let i = 0; i < n; i++) {
        const t = i / sr, ff = 45 + 55 * Math.exp(-t / 0.045);
        x[i] = Math.sin(TAU * ff * t) * Math.exp(-t / 0.16) * 0.6;
      }
    }
    return x;
  }

  /* ---------- 소리 소스 (Pcm 흉내) ----------
     ensure() 는 할 일이 없다(합성은 즉시). read(t0, n) 이 그 구간에 걸치는 음만 섞는다. */
  class GenSource {
    constructor(spec) {
      this.spec = Object.assign({}, spec);
      this.pl = plan(spec);
      this.sr = SR; this.ch = 2;
      this.durSec = this.pl.durSec;
      this.maxLen = 0;
      this.pl.notes.forEach(nt => { nt.len = nt.dur + TAIL; if (nt.len > this.maxLen) this.maxLen = nt.len; });
    }
    get beats() { return this.pl.beats; }
    ensure() { return Promise.resolve(); }
    dispose() { this.pl = { notes: [], beats: [] }; }
    /* 프레임 RMS 근사 — A2 카드 파형용(전부 합성해 보지 않고 음의 세기로 그린다) */
    peaks(fps) {
      fps = fps || 30;
      const n = Math.max(1, Math.round(this.durSec * fps)), out = new Float32Array(n);
      for (const nt of this.pl.notes) {
        const f0 = Math.floor(nt.t * fps), f1 = Math.min(n, Math.ceil((nt.t + nt.len) * fps));
        for (let f = Math.max(0, f0); f < f1; f++) {
          const t = f / fps - nt.t, d = nt.inst === 'pad' ? nt.dur : Math.max(0.12, nt.dur * 0.5);
          out[f] += nt.vel * (t < 0.01 ? 1 : Math.exp(-t / d));
        }
      }
      let mx = 0; for (let i = 0; i < n; i++) if (out[i] > mx) mx = out[i];
      if (mx > 0) for (let i = 0; i < n; i++) out[i] = Math.min(1, out[i] / mx * 0.7);
      return out;
    }
    read(t0, n) {
      const L = new Float32Array(n), R = new Float32Array(n), sr = this.sr;
      const s0 = Math.round(t0 * sr), t1 = t0 + n / sr;
      const notes = this.pl.notes;
      // 정렬돼 있으므로 (t0 - 최장음) 지점부터만 훑는다
      let lo = 0, hi = notes.length, from = t0 - this.maxLen;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (notes[mid].t < from) lo = mid + 1; else hi = mid; }
      for (let i = lo; i < notes.length; i++) {
        const nt = notes[i]; if (nt.t >= t1) break;
        if (nt.t + nt.len <= t0) continue;
        const buf = voiceBuf(nt.inst, nt.inst === 'shaker' || nt.inst === 'kick' ? 1 : hz(nt.midi), nt.dur, sr);
        const base = Math.round(nt.t * sr) - s0;             // 출력 배열에서 이 음이 시작하는 자리
        const p = clamp(nt.pan || 0, -1, 1), gl = nt.vel * Math.sqrt((1 - p) / 2) * 1.414, gr = nt.vel * Math.sqrt((1 + p) / 2) * 1.414;
        let j = Math.max(0, -base), jEnd = Math.min(buf.length, n - base);
        for (; j < jEnd; j++) { const v = buf[j], k = base + j; L[k] += v * gl; R[k] += v * gr; }
      }
      for (let i = 0; i < n; i++) {                           // 부드러운 리미터 — 겹침이 몰려도 찌그러지지 않게
        L[i] = Math.tanh(L[i] * 1.1) * 0.9; R[i] = Math.tanh(R[i] * 1.1) * 0.9;
      }
      return { sr, ch: [L, R] };
    }
  }

  function source(spec) { return new GenSource(spec); }
  /* 미디어 메타 — kind 'audio' + gen 스펙. 파일이 없으므로 새로고침 복원도 스펙만으로 된다. */
  function mediaMeta(spec, id) {
    const src = new GenSource(spec), M = mood(spec.mood);
    return { meta: { id, name: '배경음악 · ' + M.ko, kind: 'audio', dur: Math.max(1, Math.round(src.durSec * 30)), w: 0, h: 0, fps: 30, audio: true, rot: 0, gen: Object.assign({}, spec, { bpm: src.pl.bpm, key: src.pl.key, seed: src.pl.seed }) }, src };
  }

  g.KMV_GEN = { SR, MOODS, KEYS, mood, plan, source, mediaMeta, hz, _synth: synth, _clearCache: () => { vcache.clear(); vbytes = 0; } };
})(typeof window !== 'undefined' ? window : globalThis);
