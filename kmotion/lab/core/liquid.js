// 케이모션 과학실 — 알갱이(L01 회색 판): 붓는 줄기 대신 알갱이 · 담글 때 솟는 거품 · 상판에 굴러다니는 방울
// L05 에서 액면 자르기·휜 대롱 줄기·끓음 무늬로 바꾼다. 받는 그릇(vessel)과 주고받는 약속(absorb)은 그대로 둔다.
import * as THREE from 'three';

const N = 420, G = -6.5;
export function createLiquid(stage){
  const geo = new THREE.SphereGeometry(1, 8, 6), mat = new THREE.MeshStandardMaterial({ color: 0xe8f2ff, roughness: .25, metalness: 0, transparent: true, opacity: .9 });
  const mesh = new THREE.InstancedMesh(geo, mat, N); mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = N; stage.scene.add(mesh);
  const P = Array.from({ length: N }, () => ({ on: false, p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, r: .006, kind: 0, bounced: 0 }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  let next = 0; const take = () => { for (let k = 0; k < N; k++) { const i = (next + k) % N; if (!P[i].on) { next = i + 1; return P[i]; } } const i = next++ % N; return P[i]; };
  for (let i = 0; i < N; i++) mesh.setMatrixAt(i, zero);

  const api = {
    /** 붓기: 주둥이에서 알갱이 하나. dir = ±1 (기울인 쪽) */
    grain(at, dir, spread = 1){ const g = take(); g.on = true; g.kind = 0; g.bounced = 0; g.life = 2.5; g.r = .0055 + Math.random() * .003; g.p.copy(at); g.v.set(dir * (.05 + Math.random() * .05) * spread, -.05 - Math.random() * .1, (Math.random() - .5) * .03); },
    /** 거품: 액면에서 위로 솟음(세기 0~1) */
    bubbles(at, count, strength = 1, radius = .06){ for (let k = 0; k < count; k++) { const g = take(); g.on = true; g.kind = 1; g.life = .35 + Math.random() * .4 * strength; g.r = .004 + Math.random() * .006 * strength;
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * radius; g.p.set(at.x + Math.cos(a) * rr, at.y, at.z + Math.sin(a) * rr); g.v.set((Math.random() - .5) * .25, .35 + Math.random() * .7 * strength, (Math.random() - .5) * .25); } },
    live: 0,
    /** vessels: [{ inside(p) → bool, surfaceY, absorb() }] · benchY: 상판 높이 */
    update(dt, vessels, benchY){
      let live = 0;
      for (let i = 0; i < N; i++) { const g = P[i]; if (!g.on) continue; g.life -= dt; if (g.life <= 0) { g.on = false; mesh.setMatrixAt(i, zero); continue; } live++;
        g.v.y += (g.kind === 1 ? -1.6 : G) * dt; g.p.addScaledVector(g.v, dt);
        if (g.kind === 0) {
          const ves = vessels.find(v => v.inside(g.p));
          if (ves && g.p.y <= ves.surfaceY) { ves.absorb(); g.on = false; mesh.setMatrixAt(i, zero); api.bubbles(g.p, 1, .4, .01); continue; }
          if (!ves && g.p.y <= benchY + g.r && Math.abs(g.p.x) < 1.33 && Math.abs(g.p.z) < .41) { // 상판에 떨어짐: 한 번 튀고 구슬처럼 굴러가다 사라짐
            g.p.y = benchY + g.r; if (g.bounced < 1) { g.v.y = Math.abs(g.v.y) * .25; g.v.x *= 1.4; g.v.z += (Math.random() - .5) * .3; g.bounced++; g.life = Math.min(g.life, .9); } else { g.v.y = 0; g.v.x *= .97; g.v.z *= .97; } }
        }
        const s = g.kind === 1 ? g.r * (1 + (1 - g.life) * .6) : g.r; sc.set(s, s, s); m4.compose(g.p, q, sc); mesh.setMatrixAt(i, m4); }
      mesh.instanceMatrix.needsUpdate = true; api.live = live;
    },
  };
  return api;
}
