/* 🎯 사격 게임장 · 효과 층 — WebAudio + 3D 파티클 (케이마블 fx 계열) */
'use strict';
import * as THREE from 'three';

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

export const snd = {
  stretch: p => tone(120 + p * 160, .08, 'sawtooth', .04 + p * 0.03),
  shoot: () => { noise(.12, .16, 5000, 0, 'highpass'); tone(220, .1, 'square', .08, 0, 480); },
  /* 시뮬 이벤트를 타임라인에 예약 — 부딪히는 그 순간 소리 */
  schedule: (events) => {
    for (const e of events) {
      if (e.kind === 'clang') {
        const v = Math.min(0.26, 0.08 + e.speed * 0.04);
        noise(.07, v, 2600, e.t, 'bandpass');
        tone(820 + (e.speed || 1) * 60, .09, 'square', v * 0.55, e.t, 500);
      }
      else if (e.kind === 'thud') noise(.06, Math.min(0.16, 0.05 + e.speed * 0.03), 700, e.t);
      else if (e.kind === 'bounce') { noise(.04, .07, 2000, e.t, 'bandpass'); }
      else if (e.kind === 'fall') { tone(500, .28, 'sine', .12, e.t, 160); noise(.2, .1, 500, e.t + 0.18); }
      else if (e.kind === 'pop') { noise(.05, .22, 3600, e.t, 'bandpass'); tone(1200, .1, 'triangle', .12, e.t + .02, 2200); }
      else if (e.kind === 'quack') { tone(640, .09, 'square', .14, e.t, 420); tone(520, .11, 'square', .12, e.t + .1, 300); }
      else if (e.kind === 'ring') {
        const f = e.ring === 3 ? 1319 : e.ring === 2 ? 988 : 784;
        tone(f, .18, 'triangle', .16, e.t); tone(f * 1.5, .24, 'triangle', .12, e.t + .09);
      }
    }
  },
  clear: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .16, i * .12)); tone(1319, .55, 'triangle', .16, .5); },
  medal: () => { tone(784, .14, 'triangle', .14); tone(1047, .3, 'triangle', .16, .12); },
  prize: () => { [659, 784, 988, 1319, 1568].forEach((f, i) => tone(f, .22, 'triangle', .14, i * .09)); noise(.4, .06, 6000, .4, 'highpass'); },
  miss: () => { tone(330, .2, 'sine', .08, 0, 220); },
  sad: () => { tone(392, .22, 'sawtooth', .09); tone(311, .3, 'sawtooth', .09, .2); },
  tick: () => tone(1568, .05, 'square', .05),
  reload: () => { noise(.06, .1, 1600, 0, 'bandpass'); tone(700, .06, 'square', .06, .05); }
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
    pool.push({ m, v: vel, life, age: 0, g: (opts && opts.g) != null ? opts.g : -5.2, spin: (Math.random() - 0.5) * 9 });
    m.scale.setScalar((opts && opts.scale) || 1);
  }
  const CONF = [0xffd35c, 0x4de1ff, 0xff8a5c, 0xc58aff, 0x7dffb0];
  return {
    confetti(pos, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 2;
        spawn(pos.clone(), new THREE.Vector3(Math.cos(a) * s, 2.2 + Math.random() * 2, Math.sin(a) * s), CONF[i % 5], 1.3 + Math.random() * 0.7);
      }
    },
    burst(pos, color, n) {
      for (let i = 0; i < (n || 14); i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI;
        const s = 1.6 + Math.random() * 1.4;
        spawn(pos.clone(), new THREE.Vector3(Math.sin(ph) * Math.cos(th) * s, Math.cos(ph) * s + 0.6, Math.sin(ph) * Math.sin(th) * s), color, 0.8 + Math.random() * 0.4, { g: -3.4, scale: 0.9 });
      }
    },
    sparks(pos) {
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2;
        spawn(pos.clone(), new THREE.Vector3(Math.cos(a) * 1.4, 0.8 + Math.random(), Math.sin(a) * 1.4), 0xffe9a8, 0.45, { g: -4, scale: 0.6 });
      }
    },
    splash(pos) {
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        spawn(pos.clone(), new THREE.Vector3(Math.cos(a) * 0.7, 1.1, Math.sin(a) * 0.7), 0x9aa6cc, 0.5, { g: -3, scale: 0.7 });
      }
    },
    firework(pos, color) {
      for (let i = 0; i < 24; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI;
        const s = 2.2 + Math.random() * 1.4;
        spawn(pos.clone(), new THREE.Vector3(Math.sin(ph) * Math.cos(th) * s, Math.cos(ph) * s, Math.sin(ph) * Math.sin(th) * s), color || CONF[i % 5], 1 + Math.random() * 0.5, { g: -2.4 });
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
