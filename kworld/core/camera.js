// 연출층 — 카메라 트랙: 플레이어를 멈추고 카메라가 정해진 길을 탄다(구조 설계 v1 §6).
//   cut(g, [{ pos:[x,y,z], look:[x,y,z], sec:3, ease:'inout' }, ...], { hold:0.6 }) → Promise
//   같은 step 에 from 이 없으면 이전 step 끝 자리에서 이어진다. 끝나면 플레이어 카메라로 돌아간다.
import * as THREE from 'three';

const EASE = { linear: (t) => t, inout: (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, out: (t) => 1 - Math.pow(1 - t, 3) };

export function cut(g, steps, { release = true } = {}) {
  const e = g.e; const cam = e.camera; g.p.enabled = false; e.cameraOverride = true;
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  let start = { pos: cam.position.clone(), look: cam.position.clone().add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(5)) };
  return new Promise((res) => {
    let i = 0, t = 0; let cur = null;
    const next = () => { const st = steps[i]; if (!st) { fin(); return; } cur = { from: st.from ? { pos: V(st.from.pos), look: V(st.from.look) } : start, to: { pos: V(st.pos), look: V(st.look || st.pos) }, sec: st.sec || 3, ease: EASE[st.ease || 'inout'], on: st.on }; t = 0; if (st.on) st.on(); };
    const fn = (dt) => {
      if (!cur) return; t += dt; const k = Math.min(1, t / cur.sec); const kk = cur.ease(k);
      cam.position.lerpVectors(cur.from.pos, cur.to.pos, kk); const look = new THREE.Vector3().lerpVectors(cur.from.look, cur.to.look, kk); cam.lookAt(look);
      if (k >= 1) { start = { pos: cur.to.pos.clone(), look: cur.to.look.clone() }; i++; cur = null; next(); }
    };
    const fin = () => { const idx = e.onFrame.indexOf(fn); if (idx >= 0) e.onFrame.splice(idx, 1); if (release) { e.cameraOverride = false; g.p.enabled = true; } res(); };
    e.onFrame.push(fn); next();
  });
}
/** 컷 도중 카메라를 한 자리에 두고 다른 연출(시간 가속)을 돌릴 때 */
export function hold(g, pos, look) { const e = g.e; g.p.enabled = false; e.cameraOverride = true; e.camera.position.set(...pos); e.camera.lookAt(new THREE.Vector3(...look)); }
export function releaseCam(g) { g.e.cameraOverride = false; g.p.enabled = true; }
