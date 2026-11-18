// 케이모션 과학실 — 끓는 액면: 잔물결 + 부풀다 터지는 거품(셰이더) + 튀어 오르는 작은 방울(한 번에 그림)
// 세기는 boil(0~1) 하나만 읽는다. 낮으면 잔잔히 일렁이고, 높으면 하얗게 들끓는다. 시간은 update(dt) 로만 흐른다.
import * as THREE from 'three';
import { addPatch, makeGlassy } from './glass.js';
import { FX_LAYER } from './fog.js';

/** 끓는 액면 셰이더 조각. 앞에 `uniform sampler2D uFxNoise;` 가 있어야 한다.
 *  fxBoil(액면 위 자리 xz(m), 시간, 세기) → xy = 물결 기울기, z = 거품 흰빛(0~1)
 *  반복문·갈림길 없이 쓴다(윈도우 크롬의 셰이더 번역기는 반복문 안의 계산을 풀어 쓰느라 첫 화면이 몇십 초씩 멈춘다). */
export const BOIL_GLSL = /* glsl */`
vec4 fxHash4(vec2 p){ vec4 q = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099)); q += dot(q, q.wzxy + 33.33); return fract((q.xxyz + q.yzzw) * q.zywx); }
float fxBoilH(vec2 p, float t){ return texture2D(uFxNoise, p * 2.1 + vec2(t * 0.031, -t * 0.022)).r * 0.62 + texture2D(uFxNoise, p * 4.7 - vec2(t * 0.052, t * 0.041) + 0.37).r * 0.38; }
// 거품 한 겹: 칸마다 하나(칸 밖으로 나가지 않는다). 부풀다(0~0.7) 터지며 고리가 퍼진다(0.7~1). xy = 기울기, z = 흰빛
vec3 fxBubbles(vec2 p, float S, float sp, float t, float b){
  vec2 g = p * S, id = floor(g), f = fract(g) - 0.5; vec4 h = fxHash4(id);
  float ph = t * sp * (0.7 + 1.9 * h.z) * (0.45 + 0.9 * b) + h.w * 9.0, cyc = floor(ph); ph = fract(ph);
  vec4 h2 = fxHash4(id + cyc * 7.31 + 3.1);
  float on = step(h2.z, b * 1.25 - 0.06);                                // 끓는 세기만큼만 켜진다
  vec2 q = f - (h2.xy - 0.5) * 0.36;
  float R = (0.15 + 0.14 * h.x) * mix(0.7, 1.0, b), d = length(q);
  float grow = smoothstep(0.0, 0.7, ph), r = R * grow + 1e-4, alive = on * (1.0 - step(0.7, ph));
  float dome = alive * (1.0 - smoothstep(r * 0.7, r, d)), pp = clamp((ph - 0.7) / 0.3, 0.0, 1.0);
  float foam = alive * (1.0 - smoothstep(0.0, 0.07, abs(d - r))) * 0.75 * grow                                           // 거품 테두리
    + on * step(0.7, ph) * (1.0 - pp) * (1.0 - smoothstep(0.0, 0.07, abs(d - R * (1.0 + pp * 0.55)))) * 0.8;           // 터진 고리
  return vec3(-q / r * dome * 0.6, foam);
}
vec3 fxBoil(vec2 p, float t, float b){
  // 잔물결: 잡음 두 겹이 엇갈려 흐른다(끓을수록 거칠게)
  const float e = 0.003; float tt = t * (1.0 + 2.0 * b);
  float h0 = fxBoilH(p, tt);
  vec2 grad = vec2(fxBoilH(p + vec2(e, 0.0), tt) - h0, fxBoilH(p + vec2(0.0, e), tt) - h0) * (0.6 + 3.6 * b);
  // 거품 세 겹(크기·빠르기·방향이 달라 줄 맞춰 보이지 않는다)
  vec3 b1 = fxBubbles(p, 58.0, 1.0, t, b);
  vec3 b2 = fxBubbles(vec2(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y) + 0.37, 97.0, 1.5, t, b);
  vec3 b3 = fxBubbles(vec2(0.28 * p.x + 0.96 * p.y, -0.96 * p.x + 0.28 * p.y) + 0.71, 151.0, 2.1, t, b);
  grad += b1.xy + vec2(0.8 * b2.x + 0.6 * b2.y, -0.6 * b2.x + 0.8 * b2.y) + vec2(0.28 * b3.x - 0.96 * b3.y, 0.96 * b3.x + 0.28 * b3.y);
  float foam = b1.z + b2.z + b3.z;
  foam += smoothstep(0.6, 1.0, b) * smoothstep(0.52, 0.74, texture2D(uFxNoise, p * 6.3 + vec2(t * 0.11, -t * 0.08)).r) * 0.5;   // 들끓을 때의 흰 거품밭
  return vec3(grad, clamp(foam, 0.0, 1.0));
}`;

const LIQ = { ln2: { color: 0xdcebff, drop: 0xf2f7ff }, water: { color: 0xc8e0ea, drop: 0xe6f1f5 } };

/**
 * const b = createBoil(ctx, { radius, liquid: 'ln2'|'water', surface: true, drops })
 *   매 프레임: b.boil = 0~1;  b.setSurface(center:Vector3, radius);  b.update(dt)
 *   한 번 확: b.splash(at:Vector3, count, strength, radius)   — 물체를 담그는 순간, 줄기가 닿는 자리
 *   surface:false 면 방울만 쓴다(액면은 level.js 의 잘린 면이 그린다).
 */
export function createBoil(ctx, opt = {}){
  const { scene } = ctx, rand = ctx.rand, N = opt.drops || ctx.q.drops, lq = LIQ[opt.liquid] || LIQ.ln2;
  const center = new THREE.Vector3(0, ctx.bench.y + .05, 0); let radius = opt.radius || .1, time = 0, acc = 0;

  // ── 액면(둥근 판). 물리 재질에 잔물결·거품을 덧댄다 → 환경 반사·빛이 방과 맞는다.
  let disc = null; const U = { uFxNoise: { value: ctx.noise }, uBoil: { value: new THREE.Vector2(0, 0) } };
  if (opt.surface !== false) {
    const m = new THREE.MeshStandardMaterial({ color: lq.color, roughness: .05, metalness: 0, depthWrite: false, envMapIntensity: 1.6 });
    makeGlassy(m);
    addPatch(m, 'boil', shader => {
      shader.uniforms.uFxNoise = U.uFxNoise; shader.uniforms.uBoil = U.uBoil;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBoilW;').replace('#include <project_vertex>', '#include <project_vertex>\nvBoilW = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D uFxNoise; uniform vec2 uBoil; varying vec3 vBoilW;\n' + BOIL_GLSL)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 bs = fxBoil( vBoilW.xz, uBoil.y, uBoil.x );
          normal = normalize( ( viewMatrix * vec4( normalize( vec3( -bs.x, 1.0, -bs.y ) ), 0.0 ) ).xyz );
          diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), bs.z ); diffuseColor.a = mix( 0.22, 0.92, bs.z ); roughnessFactor = mix( roughnessFactor, 0.6, bs.z ); }`);
    });
    const g = new THREE.CircleGeometry(1, 40); g.rotateX(-Math.PI / 2);
    disc = new THREE.Mesh(g, m); disc.name = 'fx_boil'; disc.renderOrder = 3; disc.layers.set(FX_LAYER); disc.visible = false; scene.add(disc);
  }

  // ── 튀는 방울
  const dm = new THREE.MeshStandardMaterial({ color: lq.drop, roughness: .08, metalness: 0, envMapIntensity: 1.6, emissive: 0x8fa3b8, emissiveIntensity: .12 });
  const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), dm, N); drops.name = 'fx_boil_drops'; drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage); drops.frustumCulled = false; drops.count = 0; drops.layers.set(FX_LAYER); scene.add(drops);
  const P = new Float32Array(N * 8);   // x y z vx vy vz 크기 남은시간
  const M = drops.instanceMatrix.array; let cur = 0;
  function drop(x, y, z, ux, uy, uz, r, lifeSec){ const o = (cur++ % N) * 8; P[o] = x; P[o + 1] = y; P[o + 2] = z; P[o + 3] = ux; P[o + 4] = uy; P[o + 5] = uz; P[o + 6] = r; P[o + 7] = lifeSec; }

  const api = {
    boil: 0, mesh: disc, drops, center, get radius(){ return radius; }, visible: true,
    /** 액면 자리(세계 좌표 가운데 점)와 반지름 */
    setSurface(c, r){ center.copy(c); if (r != null) radius = r; },
    /** 한 번 확 튀는 방울(담그는 순간) */
    splash(at, count = 12, strength = 1, r = .04){ for (let k = 0; k < count; k++) { const a = rand() * 6.283, rr = Math.sqrt(rand()) * r, s = .15 + rand() * .45 * strength;
      drop(at.x + Math.cos(a) * rr, at.y + .002, at.z + Math.sin(a) * rr, Math.cos(a) * s * .5, .35 + rand() * .9 * strength, Math.sin(a) * s * .5, .0008 + rand() * .0016 * Math.min(1.4, strength), .9); } },
    update(dt){
      if (!(dt > 0)) return; time += dt; const b = Math.min(1, Math.max(0, api.boil)), on = api.visible && radius > .002;
      U.uBoil.value.set(b, time);
      if (disc) { disc.visible = on; disc.position.copy(center); disc.scale.set(radius, 1, radius); }
      // 방울: 끓는 세기의 제곱만큼(잔잔할 때는 거의 안 튄다)
      if (on && b > .05) { acc += dt * (4 + 150 * b * b) * (N / 40); while (acc >= 1) { acc--; const a = rand() * 6.283, rr = Math.sqrt(rand()) * radius * .92, s = rand() * .22;
        drop(center.x + Math.cos(a) * rr, center.y + .001, center.z + Math.sin(a) * rr, Math.cos(a) * s, (.25 + rand() * .75) * (.35 + .65 * b), Math.sin(a) * s, .0006 + rand() * .0012 * (.5 + b), .8); } } else acc = 0;
      let n = 0;
      for (let i = 0; i < N; i++) { const o = i * 8; if (P[o + 7] <= 0) continue; P[o + 7] -= dt;
        P[o + 4] -= 6.5 * dt; P[o] += P[o + 3] * dt; P[o + 1] += P[o + 4] * dt; P[o + 2] += P[o + 5] * dt;
        if (P[o + 7] <= 0 || (P[o + 4] < 0 && P[o + 1] < center.y - .002)) { P[o + 7] = 0; continue; }              // 액면으로 돌아오면 사라진다
        const m = n * 16, s = P[o + 6]; M[m] = s; M[m + 1] = 0; M[m + 2] = 0; M[m + 3] = 0; M[m + 4] = 0; M[m + 5] = s * (1 + Math.min(.8, Math.abs(P[o + 4]) * .6)); M[m + 6] = 0; M[m + 7] = 0; M[m + 8] = 0; M[m + 9] = 0; M[m + 10] = s; M[m + 11] = 0;
        M[m + 12] = P[o]; M[m + 13] = P[o + 1]; M[m + 14] = P[o + 2]; M[m + 15] = 1; n++; }
      drops.count = n; drops.instanceMatrix.needsUpdate = true;
    },
    dispose(){ if (disc) { scene.remove(disc); disc.geometry.dispose(); disc.material.dispose(); } scene.remove(drops); drops.geometry.dispose(); dm.dispose(); },
  };
  return api;
}
