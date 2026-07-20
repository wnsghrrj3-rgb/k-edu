/* 케이마블 · 효과 층 — WebAudio 사운드 + 3D 파티클 */
'use strict';
import * as THREE from 'three';

/* ---------- 사운드 ---------- */
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, dur, type, vol, when, slide) {
  const a = ac(); if (!a) return;
  const t = (when || 0) + a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol || .15, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol, fc, when, type) {
  const a = ac(); if (!a) return;
  const t = (when || 0) + a.currentTime;
  const n = a.sampleRate * dur, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(); s.buffer = b;
  const f = a.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = fc || 900;
  const g = a.createGain(); g.gain.setValueAtTime(vol || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + dur);
}
const PENTA = [523, 587, 659, 784, 880, 1047];

export const snd = {
  hop: i => tone(PENTA[i % 6], .09, 'square', .06),
  /* 주사위: 물리 이벤트를 타임라인에 예약 — 진짜 부딪히는 순간에 소리가 난다 */
  diceEvents: (events) => {
    for (const e of events) {
      const v = Math.min(0.22, 0.05 + e.speed * 0.03);
      if (e.kind === 'bounce') { noise(.045, v, 3000, e.t, 'bandpass'); tone(190 + e.speed * 30, .05, 'square', v * 0.5, e.t); }
      else if (e.kind === 'clack') { noise(.05, v * 1.2, 2100, e.t, 'bandpass'); }
      else if (e.kind === 'wall') { noise(.04, v, 1400, e.t, 'bandpass'); }
    }
  },
  whoosh: () => noise(.35, .1, 5200, 0, 'highpass'),
  buy: () => { tone(660, .12, 'triangle', .16); tone(880, .14, 'triangle', .16, .09); tone(1320, .2, 'triangle', .14, .18); },
  coin: () => { tone(988, .09, 'triangle', .14); tone(1319, .16, 'triangle', .14, .07); },
  coins: n => { for (let i = 0; i < Math.min(n, 6); i++) { tone(988 + i * 110, .07, 'triangle', .1, i * .06); } },
  pay: () => { tone(440, .14, 'sawtooth', .08); tone(330, .2, 'sawtooth', .08, .1); },
  build: () => { noise(.06, .16, 1200); noise(.06, .16, 1200, .14); tone(784, .15, 'triangle', .12, .26); },
  landmark: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .3, 'triangle', .14, i * .1)); noise(.5, .07, 6000, .45, 'highpass'); },
  take: () => { tone(392, .16, 'sawtooth', .1); tone(494, .16, 'sawtooth', .1, .12); tone(587, .3, 'sawtooth', .12, .24); },
  card: () => { noise(.12, .1, 3200); tone(1047, .12, 'sine', .1, .08); },
  island: () => { noise(.4, .14, 500); tone(300, .4, 'sine', .1, 0, 120); },
  fly: () => { tone(300, .5, 'sine', .12, 0, 1400); noise(.4, .06, 4000); },
  shield: () => { tone(880, .1, 'sine', .14); tone(880, .1, 'sine', .12, .12); },
  sad: () => { tone(392, .25, 'sawtooth', .1); tone(330, .25, 'sawtooth', .1, .22); tone(262, .5, 'sawtooth', .1, .44); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .32, 'triangle', .16, i * .13)); tone(1319, .6, 'triangle', .16, .55); },
  firework: () => { tone(180, .5, 'sine', .1, 0, 900); noise(.4, .14, 2600, .45); },
  tick: () => tone(1568, .05, 'square', .05),
  fanfareDbl: () => { tone(784, .12, 'square', .1); tone(988, .12, 'square', .1, .1); tone(1175, .25, 'square', .12, .2); }
};

/* ---------- 파티클 ---------- */
export function createParticles(scene) {
  const pool = [];
  const geo = new THREE.PlaneGeometry(0.09, 0.06);
  function spawn(pos, vel, color, life, opts) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.position.copy(pos);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(m);
    pool.push({ m, v: vel, life, age: 0, g: (opts && opts.g) != null ? opts.g : -5.2, spin: (Math.random() - 0.5) * 9, scale: (opts && opts.scale) || 1 });
    m.scale.setScalar((opts && opts.scale) || 1);
  }
  const CONF = [0xffd35c, 0x4de1ff, 0xff8a5c, 0xc58aff, 0x7dffb0];
  return {
    confetti(pos, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1.4 + Math.random() * 2.4;
        spawn(pos.clone().add(new THREE.Vector3(0, 0.2, 0)),
          new THREE.Vector3(Math.cos(a) * s, 2.6 + Math.random() * 2.2, Math.sin(a) * s),
          CONF[i % 5], 1.5 + Math.random());
      }
    },
    dust(pos) {
      for (let i = 0; i < 7; i++) {
        const a = Math.random() * Math.PI * 2;
        spawn(pos.clone(), new THREE.Vector3(Math.cos(a) * 0.9, 0.5, Math.sin(a) * 0.9), 0x9aa6cc, 0.4, { g: -1.5, scale: 0.8 });
      }
    },
    firework(pos, color) {
      for (let i = 0; i < 26; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI;
        const s = 2.2 + Math.random() * 1.6;
        spawn(pos.clone(),
          new THREE.Vector3(Math.sin(ph) * Math.cos(th) * s, Math.cos(ph) * s, Math.sin(ph) * Math.sin(th) * s),
          color || CONF[i % 5], 1.1 + Math.random() * 0.5, { g: -2.4 });
      }
    },
    sparkle(pos, color) {
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        spawn(pos.clone().add(new THREE.Vector3(0, 0.3, 0)),
          new THREE.Vector3(Math.cos(a) * 0.7, 1.6 + Math.random(), Math.sin(a) * 0.7),
          color || 0xffd35c, 0.7, { g: -3, scale: 0.7 });
      }
    },
    update(dt) {
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];
        p.age += dt;
        if (p.age > p.life) { scene.remove(p.m); p.m.material.dispose(); pool.splice(i, 1); continue; }
        p.v.y += p.g * dt;
        p.m.position.addScaledVector(p.v, dt);
        p.m.rotation.x += p.spin * dt; p.m.rotation.z += p.spin * 0.7 * dt;
        p.m.material.opacity = Math.min(1, (p.life - p.age) / (p.life * 0.4));
      }
    }
  };
}
