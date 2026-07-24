/* 🏚️ 유령의 집 · 효과 층 — WebAudio (사격장 fx 계열) + 3D 반짝이 */
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
  lighton: () => { tone(680, .06, 'square', .05); noise(.04, .05, 4200, 0, 'highpass'); },
  lightoff: () => tone(420, .07, 'square', .04, 0, 260),
  appear: () => tone(520, .18, 'sine', .06, 0, 760),                    // 뿅
  hide: () => tone(700, .14, 'sine', .045, 0, 380),                     // 쏙
  giggle: (m) => {                                                       // 킥킥 (미터 오를수록 높게)
    const base = 620 + (m || 0) * 340;
    tone(base, .05, 'triangle', .07); tone(base * 1.24, .05, 'triangle', .06, .07); tone(base * 1.5, .06, 'triangle', .05, .13);
  },
  startle: () => { noise(.16, .1, 2400, 0, 'bandpass'); tone(900, .16, 'sawtooth', .05, 0, 340); },  // 휙!
  bosswarp: () => { tone(220, .3, 'sawtooth', .1, 0, 90); noise(.24, .12, 700); tone(1300, .2, 'sine', .05, .05, 400); },
  capture: () => {                                                       // 마음이 열리는 차임
    [523, 659, 784, 1047].forEach((f, i) => tone(f, .34, 'sine', .11 - i * .015, i * .085));
    noise(.22, .05, 6000, 0, 'highpass');
  },
  snore: () => { tone(190, .28, 'sine', .04, 0, 150); tone(150, .22, 'sine', .03, .34, 210); },
  battout: () => { tone(340, .3, 'square', .06, 0, 110); },
  battok: () => { tone(500, .1, 'square', .05); tone(750, .12, 'square', .05, .11); },
  creak: () => tone(160 + Math.random() * 90, .5, 'sawtooth', .018, 0, 120 + Math.random() * 60),
  clear: () => {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, .3, 'triangle', .12, i * .13));
    noise(.5, .06, 7000, .6, 'highpass');
  },
  timeup: () => { tone(400, .35, 'sine', .09, 0, 240); tone(300, .45, 'sine', .08, .3, 170); }
};

/* ---------- 3D 반짝이 (캡처 순간) ---------- */
export function createSparkles(scene) {
  const pool = [];
  const geo = new THREE.SphereGeometry(0.02, 6, 4);
  return {
    burst(pos, color, n) {
      for (let i = 0; i < (n || 16); i++) {
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: color || 0xaef0c8, transparent: true }));
        m.position.copy(pos);
        const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI - Math.PI / 2;
        const sp = 0.6 + Math.random() * 1.1;
        m.userData.v = new THREE.Vector3(Math.cos(a) * Math.cos(b) * sp, Math.sin(b) * sp + 0.7, Math.sin(a) * Math.cos(b) * sp);
        m.userData.life = 1;
        scene.add(m); pool.push(m);
      }
    },
    trail(from, to, color) {  /* 유령이 랜턴으로 빨려가는 궤적 점 */
      for (let i = 0; i < 8; i++) {
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: color || 0xcfe0ff, transparent: true }));
        const k = i / 8;
        m.position.lerpVectors(from, to, k);
        m.position.y += Math.sin(k * Math.PI) * 0.5;
        m.userData.v = new THREE.Vector3(0, 0.3, 0);
        m.userData.life = 0.7 + k * 0.3;
        scene.add(m); pool.push(m);
      }
    },
    update(dt) {
      for (let i = pool.length - 1; i >= 0; i--) {
        const m = pool[i];
        m.userData.life -= dt * 1.4;
        if (m.userData.life <= 0) { scene.remove(m); m.material.dispose(); pool.splice(i, 1); continue; }
        m.position.addScaledVector(m.userData.v, dt);
        m.userData.v.y -= 1.6 * dt;
        m.material.opacity = m.userData.life;
      }
    }
  };
}

/* ---------- DOM 색종이 ---------- */
export function domConfetti(n) {
  const cols = ['#ffd35c', '#7dffb0', '#5ccfe0', '#f06292', '#c58aff'];
  for (let i = 0; i < (n || 60); i++) {
    const d = document.createElement('div');
    d.className = 'confetti';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.background = cols[i % cols.length];
    d.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
    d.style.animationDelay = (Math.random() * 0.5) + 's';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3600);
  }
}
