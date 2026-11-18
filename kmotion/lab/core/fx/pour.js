// 케이모션 과학실 — 붓는 줄기: 주둥이에서 포물선으로 떨어지는 휜 대롱(굵기 = 붓는 양) + 흐르는 무늬 + 닿는 곳에 튀는 방울 (+ 질소면 김)
// 대롱 모양은 꼭짓점 셰이더가 포물선 식으로 바로 만든다(프레임마다 메시를 다시 짓지 않는다). 시간은 update(dt) 로만 흐른다.
import * as THREE from 'three';
import { addPatch, makeGlassy } from './glass.js';
import { FX_LAYER } from './fog.js';

const LIQ = {
  ln2: { color: 0xdfeaf8, a: [.05, .42, .3], drop: 0xf4f8ff },       // 맑은 곳·흰 줄의 짙기, 끝이 방울로 끊기는 정도
  water: { color: 0xc4dde6, a: [.03, .3, .16], drop: 0xe2eef2 },
};
const G = 9.8, RINGS = 30, SIDES = 8;

/**
 * const pour = createPour(ctx)
 *   매 프레임: pour.setFlow(origin:Vector3(주둥이 끝), dir:Vector3(나가는 방향), flow 0~1, 'ln2'|'water');  pour.update(dt, vessels, benchY)
 *   vessels = [{ inside(p) → bool, surfaceY, absorb(amount) }]  (core/liquid.js 와 같은 약속. amount = flow × dt)
 *   읽기: pour.active · pour.landed(줄기 머리가 닿았나) · pour.land(Vector3 닿는 자리) · pour.vessel(받는 그릇 또는 null)
 */
export function createPour(ctx, opt = {}){
  const { scene } = ctx, rand = ctx.rand, B = ctx.bench, N = opt.splash || ctx.q.splash;
  // ── 대롱
  const nV = (RINGS + 1) * SIDES, aS = new Float32Array(nV), aAng = new Float32Array(nV), idx = [];
  for (let r = 0; r <= RINGS; r++) for (let s = 0; s < SIDES; s++) { aS[r * SIDES + s] = r / RINGS; aAng[r * SIDES + s] = s / SIDES * Math.PI * 2; }
  for (let r = 0; r < RINGS; r++) for (let s = 0; s < SIDES; s++) { const a = r * SIDES + s, b = r * SIDES + (s + 1) % SIDES, c = a + SIDES, d = b + SIDES; idx.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nV * 3), 3)); geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nV * 3), 3));
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 1)); geo.setAttribute('aAng', new THREE.BufferAttribute(aAng, 1)); geo.setIndex(idx);
  const U = { uFxNoise: { value: ctx.noise }, uPO: { value: new THREE.Vector3() }, uPV: { value: new THREE.Vector3(0, -1, 0) }, uPA: { value: new THREE.Vector4(.2, .004, 0, 0) }, uPC: { value: new THREE.Vector4(.4, .9, .3, 0) } };
  const mat = new THREE.MeshStandardMaterial({ color: LIQ.ln2.color, roughness: .06, metalness: 0, depthWrite: false, envMapIntensity: 1.8, side: THREE.DoubleSide });
  makeGlassy(mat); mat.forceSinglePass = true;
  addPatch(mat, 'pour', shader => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aS; attribute float aAng; uniform vec3 uPO, uPV; uniform vec4 uPA, uPC; varying vec2 vPour;')
      .replace('#include <beginnormal_vertex>', `
        float pS = mix( uPA.w, uPA.z, aS ), pT = pS * uPA.x;
        vec3 pVel = uPV + vec3( 0.0, -${G.toFixed(1)}, 0.0 ) * pT, pC = uPO + uPV * pT + vec3( 0.0, -${(G / 2).toFixed(1)}, 0.0 ) * pT * pT;
        vec3 pTan = normalize( pVel ), pSide = normalize( cross( pTan, abs( pTan.z ) > 0.9 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 0.0, 1.0 ) ) ), pUp = cross( pSide, pTan );
        float pR = uPA.y * sqrt( clamp( length( uPV ) / length( pVel ), 0.1, 1.0 ) );                                   // 빨라질수록 가늘어진다
        pR *= 1.0 + ( 0.05 + 0.2 * pS ) * sin( pS * 44.0 - uPC.w * 17.0 + aAng * 2.0 ) * smoothstep( 0.04, 0.4, pS );      // 떨어지며 흔들린다
        pR *= mix( 1.0, smoothstep( 0.0, 0.08, aS ), step( 0.001, uPA.w ) ) * mix( 1.0 - smoothstep( 0.9, 1.0, aS ), 1.0, step( 0.999, uPA.z ) );   // 끊긴 꼬리·아직 떨어지는 머리는 둥글게
        vec3 pN = cos( aAng ) * pSide + sin( aAng ) * pUp;
        vec3 objectNormal = pN; vPour = vec2( pS, aAng );`)
      .replace('#include <begin_vertex>', 'vec3 transformed = pC + pN * pR;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uFxNoise; uniform vec4 uPC; varying vec2 vPour;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { vec4 pn = texture2D( uFxNoise, vec2( vPour.y * 0.318, vPour.x * 1.9 - uPC.w * 2.4 ) );
        float pk = smoothstep( 0.56, 0.82, pn.r * 0.6 + pn.g * 0.4 ), pf = pow( 1.0 - abs( dot( normal, normalize( vViewPosition ) ) ), 2.0 );   // 흰 줄 · 가장자리(비스듬히 보이는 곳)                                                     // 아래로 흐르는 흰 줄
        if ( pn.b < smoothstep( 0.5, 1.0, vPour.x ) * uPC.z ) discard;                                                  // 끝은 방울로 끊긴다
        diffuseColor.a = clamp( mix( uPC.x, uPC.y, pk ) + pf * 0.3, 0.0, 1.0 ); diffuseColor.rgb = mix( diffuseColor.rgb * 0.75, vec3( 1.0 ), max( pk, pf * 0.4 ) ); roughnessFactor = mix( roughnessFactor, 0.5, pk ); }`);
  });
  const tube = new THREE.Mesh(geo, mat); tube.name = 'fx_pour'; tube.frustumCulled = false; tube.visible = false; tube.renderOrder = 4; tube.layers.set(FX_LAYER); scene.add(tube);

  // ── 튀는 방울 / 상판을 굴러다니는 구슬
  const dm = new THREE.MeshStandardMaterial({ color: LIQ.ln2.drop, roughness: .08, metalness: 0, envMapIntensity: 1.6, emissive: 0x8fa3b8, emissiveIntensity: .1 });
  const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), dm, N); drops.name = 'fx_pour_drops'; drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage); drops.frustumCulled = false; drops.count = 0; drops.layers.set(FX_LAYER); scene.add(drops);
  const P = new Float32Array(N * 9), M = drops.instanceMatrix.array; let cur = 0;   // x y z vx vy vz 크기 남은시간 구슬(1)
  function drop(x, y, z, ux, uy, uz, r, lifeSec){ const o = (cur++ % N) * 9; P[o] = x; P[o + 1] = y; P[o + 2] = z; P[o + 3] = ux; P[o + 4] = uy; P[o + 5] = uz; P[o + 6] = r; P[o + 7] = lifeSec; P[o + 8] = 0; }

  const O = new THREE.Vector3(), V = new THREE.Vector3(0, -1, 0), tmp = new THREE.Vector3();
  let want = 0, flow = 0, liquid = 'ln2', head = 0, tail = 0, T = .2, time = 0, sAcc = 0, fAcc = 0;
  const at = (t, out) => out.set(O.x + V.x * t, O.y + V.y * t - G / 2 * t * t, O.z + V.z * t);
  const fall = y => { const c = O.y - y, d = V.y * V.y + 2 * G * c; return d <= 0 ? 0 : (V.y + Math.sqrt(d)) / G; };

  const api = {
    active: false, landed: false, land: new THREE.Vector3(), vessel: null, mesh: tube, drops, get flow(){ return flow; }, get liquid(){ return liquid; },
    /** 붓는 양을 정한다. flow 가 0 이면 줄기가 끊기고 남은 꼬리만 떨어진다. */
    setFlow(origin, dir, f, liq = 'ln2'){
      want = Math.min(1, Math.max(0, f || 0));
      if (want > .01) { O.copy(origin); const sp = .22 + .7 * want; V.copy(dir).normalize().multiplyScalar(sp); if (liq !== liquid) { liquid = liq; const L = LIQ[liq] || LIQ.ln2; mat.color.set(L.color); dm.color.set(L.drop); } }
    },
    update(dt, vessels, benchY = B.y){
      if (!(dt > 0)) return; time += dt; const L = LIQ[liquid] || LIQ.ln2;
      if (want > .01) { if (!api.active) { api.active = true; head = 0; } tail = 0; flow += (want - flow) * Math.min(1, dt * 10); }
      // 닿는 자리: 받는 그릇 → 상판 → 바닥
      let ves = null, t = 0;
      if (vessels) for (let k = 0; k < vessels.length; k++) { const tv = fall(vessels[k].surfaceY); if (tv > 0 && vessels[k].inside(at(tv, tmp))) { ves = vessels[k]; t = tv; break; } }
      if (!ves) { t = fall(benchY); at(t, tmp); if (t <= 0 || tmp.x < B.x0 || tmp.x > B.x1 || tmp.z < B.z0 || tmp.z > B.z1) t = fall(B.floorY); }
      T = Math.min(1.4, Math.max(.03, t)); at(T, api.land); api.vessel = ves;
      if (api.active) { head = Math.min(1, head + dt / T); if (want <= .01) { tail += dt / T; if (tail >= head - .02) { api.active = false; flow = 0; head = tail = 0; } } }
      api.landed = api.active && head >= 1;
      tube.visible = api.active;
      U.uPO.value.copy(O); U.uPV.value.copy(V); U.uPA.value.set(T, .0018 + .0055 * flow, head, tail); U.uPC.value.set(L.a[0], L.a[1], L.a[2], time);
      if (api.landed) {
        if (ves && want > .01) ves.absorb(flow * dt);
        sAcc += dt * (18 + 70 * flow) * (N / 64);
        while (sAcc >= 1) { sAcc--; const a = rand() * 6.283, s = (.04 + rand() * .24) * (.5 + flow), ly = api.land.y + .002;
          drop(api.land.x + Math.cos(a) * .006, ly, api.land.z + Math.sin(a) * .006, Math.cos(a) * s, (.3 + rand() * .7) * (.45 + .55 * flow), Math.sin(a) * s, .0008 + rand() * .002, 1.6); }
      } else sAcc = 0;
      // 질소: 줄기를 따라, 닿는 자리에서 김이 흘러내린다
      const fog = ctx.fog;
      if (fog && liquid === 'ln2' && api.active && flow > .02) { fAcc += dt * (8 + 22 * flow);
        while (fAcc >= 1) { fAcc--; if (api.landed && !ves && rand() < .55) fog.emit(api.land.x, api.land.y + .02, api.land.z, (rand() - .5) * .3, .05, (rand() - .5) * .3, .05, .16 + .1 * rand(), 1.8 + rand(), .16);
          else { at((tail + (head - tail) * rand()) * T, tmp); fog.emit(tmp.x + (rand() - .5) * .01, tmp.y, tmp.z + (rand() - .5) * .01, V.x * .2, -.12, V.z * .2, .03, .09 + .06 * rand(), 1 + .7 * rand(), .17); } } }
      // 방울
      let n = 0;
      for (let i = 0; i < N; i++) { const o = i * 9; if (P[o + 7] <= 0) continue; P[o + 7] -= dt; if (P[o + 7] <= 0) continue;
        let s = P[o + 6];
        if (P[o + 8] === 0) {
          P[o + 4] -= G * dt; P[o] += P[o + 3] * dt; P[o + 1] += P[o + 4] * dt; P[o + 2] += P[o + 5] * dt;
          if (P[o + 4] < 0) {
            let hit = false; if (vessels) for (let k = 0; k < vessels.length; k++) { tmp.set(P[o], P[o + 1], P[o + 2]); if (vessels[k].inside(tmp) && P[o + 1] <= vessels[k].surfaceY) { hit = true; break; } }
            if (hit) { P[o + 7] = 0; continue; }                                                                           // 그릇 액면으로 돌아감
            const onB = P[o] > B.x0 && P[o] < B.x1 && P[o + 2] > B.z0 && P[o + 2] < B.z1;
            if (onB && P[o + 1] <= benchY + s) { P[o + 1] = benchY + s;
              if (liquid === 'ln2') { P[o + 8] = 1; P[o + 4] = 0; P[o + 3] *= 1.3; P[o + 5] *= 1.3; P[o + 7] = .7 + rand() * .9; }   // 질소 방울은 구슬처럼 굴러다니다 사라진다
              else { P[o + 7] = Math.min(P[o + 7], .12); P[o + 3] = P[o + 5] = P[o + 4] = 0; } }
            else if (P[o + 1] < B.floorY) { P[o + 7] = 0; continue; }
          }
        } else { const f = Math.exp(-.9 * dt); P[o + 3] *= f; P[o + 5] *= f; P[o] += P[o + 3] * dt; P[o + 2] += P[o + 5] * dt; s *= Math.min(1, P[o + 7] / .5);
          if (P[o] < B.x0 || P[o] > B.x1 || P[o + 2] < B.z0 || P[o + 2] > B.z1) { P[o + 8] = 0; } }
        const m = n * 16; M[m] = s; M[m + 1] = 0; M[m + 2] = 0; M[m + 3] = 0; M[m + 4] = 0; M[m + 5] = s; M[m + 6] = 0; M[m + 7] = 0; M[m + 8] = 0; M[m + 9] = 0; M[m + 10] = s; M[m + 11] = 0;
        M[m + 12] = P[o]; M[m + 13] = P[o + 1]; M[m + 14] = P[o + 2]; M[m + 15] = 1; n++; }
      drops.count = n; drops.instanceMatrix.needsUpdate = true;
    },
    dispose(){ scene.remove(tube); scene.remove(drops); geo.dispose(); mat.dispose(); drops.geometry.dispose(); dm.dispose(); },
  };
  return api;
}
