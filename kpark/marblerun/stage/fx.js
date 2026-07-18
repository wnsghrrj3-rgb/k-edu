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

export function rollTickSound(v) {
  // M3에서 굴림음 본격 구현 — M0는 벨만.
}

// ---- 타종 애니메이션 ----
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
