/* 케이파크 · 마블런 — stage/fx.js
 * 벨 사운드(WebAudio 합성) + 타종 애니메이션 + 골 색종이 파티클.
 */
import * as THREE from 'three';

// ---- 사운드 ----
let audioCtx = null;
function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function ringBell() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    // 종 배음: 기본 880 + 비조화 부분음
    [[880, 0.3, 1.6], [1320, 0.14, 1.1], [2217, 0.07, 0.7]].forEach(([f, g, dur]) => {
      const o = ac.createOscillator();
      const gn = ac.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      gn.gain.setValueAtTime(g, t0);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(gn).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + dur);
    });
  } catch (e) { /* 오디오 미지원 무시 */ }
}

export function thudSound() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const o = ac.createOscillator();
    const gn = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(160, t0);
    o.frequency.exponentialRampToValueAtTime(48, t0 + 0.22);
    gn.gain.setValueAtTime(0.28, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    o.connect(gn).connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.3);
  } catch (e) { /* 무시 */ }
}

/* 대포 발사: 노이즈 버스트 + 저역 펀치 */
export function boomSound() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const len = Math.floor(ac.sampleRate * 0.18);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    const src = ac.createBufferSource(); src.buffer = buf;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    const gn = ac.createGain(); gn.gain.value = 0.34;
    src.connect(lp).connect(gn).connect(ac.destination);
    src.start(t0);
    const o = ac.createOscillator(); const g2 = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t0);
    o.frequency.exponentialRampToValueAtTime(55, t0 + 0.16);
    g2.gain.setValueAtTime(0.32, t0);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    o.connect(g2).connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.2);
  } catch (e) { /* 무시 */ }
}

/* 트램펄린 튕김: 상승 글리산도 */
export function boingSound() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const o = ac.createOscillator(); const gn = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180, t0);
    o.frequency.exponentialRampToValueAtTime(680, t0 + 0.13);
    gn.gain.setValueAtTime(0.22, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    o.connect(gn).connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.22);
  } catch (e) { /* 무시 */ }
}

/* 착지대 포획: 톡 — 깔때기(맑음) / 백보드(둔탁) */
export function catchSound(wall) {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const o = ac.createOscillator(); const gn = ac.createGain();
    o.type = wall ? 'square' : 'sine';
    o.frequency.setValueAtTime(wall ? 300 : 660, t0);
    o.frequency.exponentialRampToValueAtTime(wall ? 150 : 990, t0 + 0.09);
    gn.gain.setValueAtTime(wall ? 0.16 : 0.20, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    o.connect(gn).connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.16);
  } catch (e) { /* 무시 */ }
}

export function placeClick() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const o = ac.createOscillator();
    const gn = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, t0);
    o.frequency.exponentialRampToValueAtTime(760, t0 + 0.06);
    gn.gain.setValueAtTime(0.12, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    o.connect(gn).connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.12);
  } catch (e) { /* 무시 */ }
}

/* 스위치 플리퍼 딸깍 — 두 음 높이로 방향을 귀로 구분 (왼=높, 오=낮) */
export function flipSound(dir) {
  const c = ctx();
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(dir === 1 ? 620 : 880, t);
  o.frequency.exponentialRampToValueAtTime(dir === 1 ? 470 : 660, t + 0.05);
  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + 0.08);
}

/* ── 굴림음 (M3) ──
 * 루프 노이즈 → 밴드패스 → 게인. 속도가 필터 주파수와 크기를 민다.
 * 공중(air/falling)에선 높고 가는 바람 소리로 바뀐다.
 * 슬로모 중엔 rateScale로 낮고 묵직해진다 — 귀로도 슬로모. */
export function createRollSound() {
  let started = false, gain = null, filt = null;
  function ensure() {
    const ac = ctx();
    const len = Math.floor(ac.sampleRate * 1.4);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < len; i++) {           // 갈색 잡음 근사 — 구르는 질감
      lp = lp * 0.94 + (Math.random() * 2 - 1) * 0.06;
      d[i] = lp * 6;
    }
    const src = ac.createBufferSource();
    src.buffer = buf; src.loop = true;
    filt = ac.createBiquadFilter();
    filt.type = 'bandpass'; filt.Q.value = 0.9; filt.frequency.value = 260;
    gain = ac.createGain(); gain.gain.value = 0;
    src.connect(filt).connect(gain).connect(ac.destination);
    src.start();
    started = true;
  }
  function update(speed, airborne, rateScale) {
    if (!started) {
      if (speed < 0.02) return;
      try { ensure(); } catch (e) { return; }
    }
    const ac = audioCtx;
    const r = rateScale != null ? rateScale : 1;
    const g = airborne ? 0.018 : Math.min(speed * 0.15, 0.12) * (0.55 + 0.45 * r);
    const f = airborne ? 1400 + speed * 500 : (200 + speed * 620) * (0.6 + 0.4 * r);
    gain.gain.setTargetAtTime(g, ac.currentTime, 0.06);
    filt.frequency.setTargetAtTime(Math.max(80, f), ac.currentTime, 0.09);
  }
  function stop() {
    if (!started) return;
    gain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.1);
  }
  return { update, stop };
}

// ---- 타종 애니메이션 ----

/* 🎨 색 게이트 반사: 팅! — 금속 현 튕김 (높은 삼진동 급강하 + 클릭) */
export function gateBounceSound() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const o = ac.createOscillator();
    const gn = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(1900, t0);
    o.frequency.exponentialRampToValueAtTime(620, t0 + 0.11);
    gn.gain.setValueAtTime(0.22, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    o.connect(gn).connect(ac.destination);
    o.start(t0); o.stop(t0 + 0.16);
  } catch (e) { /* 무시 */ }
}

/* 🎨 색 게이트 통과: 반짝 — 짧은 상행 두 음 */
export function gatePassSound() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    [[1046.5, 0], [1568, 0.06]].forEach(([f, dt]) => {
      const o = ac.createOscillator();
      const gn = ac.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      gn.gain.setValueAtTime(0.001, t0 + dt);
      gn.gain.exponentialRampToValueAtTime(0.14, t0 + dt + 0.015);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.22);
      o.connect(gn).connect(ac.destination);
      o.start(t0 + dt); o.stop(t0 + dt + 0.24);
    });
  } catch (e) { /* 무시 */ }
}

/* 🁢 도미노 클랙 (넘어질 때마다) — 살짝씩 다른 높이 (인덱스 결정론) */
export function dominoClack(i) {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const len = 0.05;
    const buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate);
    const ch = buf.getChannelData(0);
    for (let k = 0; k < ch.length; k++) ch[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / ch.length, 3);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400 + ((i * 137) % 5) * 180;
    bp.Q.value = 4;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0.22, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    src.connect(bp).connect(gn).connect(ac.destination);
    src.start(t0);
  } catch (e) { /* 무시 */ }
}

/* 🏁 포토피니시: 카메라 셔터 — 틱 + 저역 콩 */
export function shutterSound() {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    const buf = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate);
    const ch = buf.getChannelData(0);
    for (let k = 0; k < ch.length; k++) ch[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / ch.length, 2);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2400;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0.3, t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
    src.connect(hp).connect(gn).connect(ac.destination);
    src.start(t0);
    const o = ac.createOscillator();
    const g2 = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(320, t0 + 0.02);
    o.frequency.exponentialRampToValueAtTime(140, t0 + 0.1);
    g2.gain.setValueAtTime(0.12, t0 + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    o.connect(g2).connect(ac.destination);
    o.start(t0 + 0.02); o.stop(t0 + 0.12);
  } catch (e) { /* 무시 */ }
}

/* 🎼 오르골 한 음 — 뮤직박스 음색 (기본음 + 4배음, 날카로운 어택, 긴 잔향) */
export function orgolNote(freq) {
  try {
    const ac = ctx();
    const t0 = ac.currentTime;
    [[freq, 0.20, 1.4], [freq * 4, 0.05, 0.5]].forEach(([f, g, dur]) => {
      const o = ac.createOscillator();
      const gn = ac.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      gn.gain.setValueAtTime(0.001, t0);
      gn.gain.exponentialRampToValueAtTime(g, t0 + 0.008);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(gn).connect(ac.destination);
      o.start(t0); o.stop(t0 + dur);
    });
  } catch (e) { /* 무시 */ }
}

export function animateBell(bellMesh) {
  if (!bellMesh) return;
  bellMesh.userData.swing = 1.0;
}
export function updateBell(bellMesh, dt) {
  if (!bellMesh || !bellMesh.userData.swing) return;
  bellMesh.userData.t = (bellMesh.userData.t || 0) + dt;
  const s = bellMesh.userData.swing * Math.exp(-bellMesh.userData.t * 2.2);
  bellMesh.rotation.z = Math.sin(bellMesh.userData.t * 18) * 0.5 * s;
  if (s < 0.01) { bellMesh.userData.swing = 0; bellMesh.userData.t = 0; bellMesh.rotation.z = 0; }
}

// ---- 색종이 ----
const CONFETTI_COLORS = [0xff5c8a, 0xffd35c, 0x4de1ff, 0x8dff7a, 0xc084ff];

export function createConfetti(scene) {
  const bursts = [];
  function burst(pos, count = 90) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vels = [];
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x; positions[i * 3 + 1] = pos.y; positions[i * 3 + 2] = pos.z;
      const th = Math.random() * Math.PI * 2;
      const up = 0.5 + Math.random() * 0.9;
      const sp = 0.15 + Math.random() * 0.35;
      vels.push({ x: Math.cos(th) * sp, y: up, z: Math.sin(th) * sp });
      col.setHex(CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.008, vertexColors: true, transparent: true, opacity: 1 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    bursts.push({ pts, vels, life: 0 });
  }
  function update(dt) {
    for (let b = bursts.length - 1; b >= 0; b--) {
      const B = bursts[b];
      B.life += dt;
      const arr = B.pts.geometry.attributes.position.array;
      for (let i = 0; i < B.vels.length; i++) {
        const v = B.vels[i];
        v.y -= 1.8 * dt;
        arr[i * 3] += v.x * dt;
        arr[i * 3 + 1] += v.y * dt;
        arr[i * 3 + 2] += v.z * dt;
      }
      B.pts.geometry.attributes.position.needsUpdate = true;
      B.pts.material.opacity = Math.max(0, 1 - B.life / 2.2);
      if (B.life > 2.2) {
        scene.remove(B.pts);
        B.pts.geometry.dispose();
        B.pts.material.dispose();
        bursts.splice(b, 1);
      }
    }
  }
  return { burst, update };
}
