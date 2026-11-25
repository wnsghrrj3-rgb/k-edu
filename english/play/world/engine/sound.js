/* 공통 엔진 · 소리 — 효과음과 캐릭터 목소리(말이 아닌 소리)를 그때그때 만들어 낸다(파일 없음).
 * 영어 낱말 소리는 voice.js 가 맡는다. 음소거는 여기 하나로 모은다. */
import { Q, AUTO, clamp } from './stage.js';

// 음소거 · 소리 장치는 창에 하나만 둔다 — 이 파일이 주소 꼬리(?v=)가 다른 채로 두 번 읽혀도(구역은 ?v= 를 붙이고 voice.js 는 안 붙인다) 같은 것을 본다.
const G = window.__worldSound || (window.__worldSound = { muted: Q.has('mute') || AUTO, AC: null, listeners: [], bed: null });
export const isMuted = () => G.muted;
export function setMuted(m) { G.muted = m; G.listeners.forEach(f => f(m)); }
export const onMute = f => G.listeners.push(f);
/** 첫 손길에 부른다(브라우저는 손길 뒤에만 소리를 낸다). */
export const unlock = () => G.muted ? null : (G.AC = G.AC || new (window.AudioContext || window.webkitAudioContext)());
const bedBus = a => G.bed || (G.bed = a.createGain(), G.bed.connect(a.destination), G.bed);   // 배경 소리가 지나가는 길(영어가 나올 때 여기만 줄인다)
/** 소리 하나: f → f2 로 미끄러지는 음, t 초. bus = 배경 소리 길로 보낸다. */
export function tone(f, f2, t, { type = 'sine', g = 0.16, at = 0, bus = false } = {}) {
  const a = unlock(); if (!a) return; const o = a.createOscillator(), v = a.createGain(), n = a.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(Math.max(20, f), n); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), n + t);
  v.gain.setValueAtTime(0.0001, n); v.gain.exponentialRampToValueAtTime(g, n + 0.014); v.gain.exponentialRampToValueAtTime(0.0001, n + t); o.connect(v).connect(bus ? bedBus(a) : a.destination); o.start(n); o.stop(n + t + 0.03);
}
/** 잡음 한 줌(씹는 소리 · 쏟아지는 소리). */
export function hiss(t, { g = 0.1, at = 0, f = 1800, q = 1, bus = false } = {}) {
  const a = unlock(); if (!a) return; const n = a.currentTime + at, len = Math.ceil(a.sampleRate * t), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = a.createBufferSource(), bp = a.createBiquadFilter(), v = a.createGain();
  s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; v.gain.value = g; s.connect(bp).connect(v).connect(bus ? bedBus(a) : a.destination); s.start(n);
}
export const sfx = {
  thud: s => tone(95 / Math.sqrt(s), 38, 0.2, { g: 0.5 * clamp(s / 1.8, 0.15, 1) }), tick: () => tone(1500, 1100, 0.03, { g: 0.04 }), ping: s => tone(760 / s ** 0.8, 800 / s ** 0.8, 0.09, { g: 0.05 }),
  pop: () => tone(620, 300, 0.14, { type: 'triangle' }), clink: () => { tone(1900, 1500, 0.12, { type: 'triangle', g: 0.12 }); tone(2500, 2100, 0.09, { type: 'triangle', g: 0.07, at: 0.05 }); },
  bounce: v => tone(230, 110, 0.13, { g: 0.22 * clamp(v, 0.1, 1) }), spark: up => { for (let i = 0; i < 4; i++) tone((up ? 520 : 1300) * (up ? 1.26 : 0.8) ** i, (up ? 560 : 1250) * (up ? 1.26 : 0.8) ** i, 0.12, { type: 'triangle', g: 0.09, at: i * 0.06 }); },
  whoosh: () => hiss(0.22, { g: 0.07, f: 900, q: 0.6 }), grab: () => tone(520, 700, 0.06, { type: 'triangle', g: 0.07 }),
  munch: (n = 3) => { for (let i = 0; i < n; i++) { hiss(0.09, { g: 0.16, f: 700 + i * 90, q: 2, at: i * 0.16 }); tone(170, 120, 0.08, { g: 0.12, at: i * 0.16 }); } },
  gulp: () => tone(300, 140, 0.18, { g: 0.2 }), splat: () => { hiss(0.16, { g: 0.14, f: 500, q: 0.8 }); tone(160, 70, 0.16, { g: 0.2 }); },
  fizz: () => hiss(0.5, { g: 0.06, f: 5200, q: 1.5 }), door: () => { tone(210, 150, 0.35, { type: 'sawtooth', g: 0.05 }); tone(120, 90, 0.4, { g: 0.2, at: 0.3 }); },
};
/** 캐릭터의 목소리. k = 높낮이 배수(몸이 크면 낮고 작으면 높다 · 성격마다 다르다). */
export function chirp(kind, k = 1) {
  const o = { type: 'triangle', g: 0.13 };
  if (kind === 'wow') tone(430 * k, 880 * k, 0.24, o); else if (kind === 'hm') tone(390 * k, 520 * k, 0.16, o);
  else if (kind === 'joy') { tone(560 * k, 760 * k, 0.11, o); tone(700 * k, 980 * k, 0.14, { ...o, at: 0.13 }); }
  else if (kind === 'oops') tone(700 * k, 260 * k, 0.3, o);
  else if (kind === 'dizzy') for (let i = 0; i < 4; i++) tone((640 - i * 70) * k, (520 - i * 70) * k, 0.2, { ...o, at: i * 0.21 });
  else if (kind === 'big') { tone(200 * k, 150 * k, 0.3, o); tone(170 * k, 120 * k, 0.34, { ...o, at: 0.3 }); }
  else if (kind === 'small') for (let i = 0; i < 3; i++) tone(820 * k, 1150 * k, 0.07, { ...o, at: i * 0.09 });
  else if (kind === 'yum') { tone(480 * k, 620 * k, 0.12, o); tone(620 * k, 520 * k, 0.2, { ...o, at: 0.12 }); }
  else if (kind === 'yuck') { tone(420 * k, 300 * k, 0.22, { ...o, type: 'sawtooth', g: 0.07 }); tone(300 * k, 240 * k, 0.2, { ...o, at: 0.2 }); }
  else if (kind === 'hot') for (let i = 0; i < 5; i++) tone((700 + i * 60) * k, (900 + i * 60) * k, 0.06, { ...o, at: i * 0.07 });
  else if (kind === 'brr') for (let i = 0; i < 6; i++) tone(520 * k, 480 * k, 0.04, { ...o, at: i * 0.06 });
  else if (kind === 'want') tone(520 * k, 700 * k, 0.2, o);
  else if (kind === 'giggle') for (let i = 0; i < 4; i++) tone((760 - (i % 2) * 120) * k, (860 - (i % 2) * 120) * k, 0.07, { ...o, g: 0.1, at: i * 0.085 });      // 킥킥
  else if (kind === 'please') { tone(480 * k, 640 * k, 0.16, o); tone(640 * k, 600 * k, 0.22, { ...o, at: 0.17 }); }                                    // 조르는 소리
}

// ── 배경 소리(임시 · 합성) — 구역의 바탕(느린 종 다섯 음) 위에 자리마다 한 겹. 영어가 나올 때는 줄였다가 돌아온다.
export const BED = { DUCK: 0.4, DUCK_IN: 0.25, DUCK_OUT: 0.6, FADE: 1.0, BELL: [261.6, 329.6, 392, 440, 523.3], BELL_EVERY: 2.6, BELL_G: 0.028 };
/** layers = { 이름: (dt, 세기 0~1, 그 겹의 기억) => 소리 내기 }. set(이름) 으로 겹을 바꾸면 FADE 초에 걸쳐 넘어간다. tick(dt, 말하는 중인가) 을 매 장면 부른다.
 *  때는 놀이의 시계(dt)로 잰다 — 자동 확인에서도 같은 값이 나온다(level · weights 로 숫자만 확인한다. 소리가 어울리는지는 사람이 듣는다). */
export function createBed(layers = {}) {
  const w = {}, mem = {}; let now = null, level = 1, bellT = 1.2, bellI = 0, bells = 0;
  for (const k in layers) { w[k] = 0; mem[k] = { t: 0 }; }
  function tick(dt, talking) {
    level = talking ? Math.max(BED.DUCK, level - dt * (1 - BED.DUCK) / BED.DUCK_IN) : Math.min(1, level + dt * (1 - BED.DUCK) / BED.DUCK_OUT);
    if (G.bed) G.bed.gain.value = level;
    if ((bellT -= dt) <= 0) { const f = BED.BELL[bellI]; tone(f, f, 2.4, { g: BED.BELL_G, bus: true }); tone(f * 2, f * 2, 1.3, { g: BED.BELL_G * 0.4, bus: true }); bellI = (bellI + 1 + (Math.random() < 0.4 ? 1 : 0)) % BED.BELL.length; bellT = BED.BELL_EVERY; bells++; }
    for (const k in layers) { w[k] = clamp(w[k] + clamp((k === now ? 1 : 0) - w[k], -dt / BED.FADE, dt / BED.FADE), 0, 1); if (w[k] > 0.02) layers[k](dt, w[k], mem[k]); }
  }
  return { set: id => { now = id; }, tick, weights: w, get level() { return level; }, get now() { return now; }, get bells() { return bells; } };
}
