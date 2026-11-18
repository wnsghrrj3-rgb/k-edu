// 케이모션 과학실 — 용기 안 액체: 안쪽 모양 메시(닫힌 빈 곳)를 수평면으로 잘라 보여 준다 (설계 6-3)
// 용기를 기울여도 액면은 수평이고, 용기가 움직이면 액면이 용수철처럼 출렁인다. 액체 흐름 계산은 하지 않는다.
// 잘린 면(뚜껑)은 따로 만들지 않는다: 안쪽 모양의 **뒷면**을 「시선이 수평면과 만나는 자리」로 옮겨 칠한다 → 어떤 모양·기울기에도 맞고, 깊이도 그 면의 것으로 쓴다(담근 물체가 액면 아래로 잠겨 보인다).
import * as THREE from 'three';
import { addPatch, makeGlassy } from './glass.js';
import { BOIL_GLSL } from './boil.js';
import { FX_LAYER } from './fog.js';

const LIQ = {
  ln2: { color: 0xbcd6f7, absorb: 5.5, body: .2, min: .1 },      // 맑고 푸르스름. 깊을수록 짙다
  water: { color: 0xbfdde8, absorb: 4, body: .16, min: .08 },
};

/**
 * const lv = createLevel(ctx, inner, { liquid: 'ln2'|'water' })
 *   inner = 닫힌 안쪽 모양 Mesh(용기의 자식, 세로축 = 자기 Y)  — 또는 { rBot, rTop, h, parent, y } 로 주면 회전체를 만들어 parent 에 붙인다.
 *   매 프레임: lv.fill = 0~1 (찬 정도);  lv.boil = 0~1;  lv.update(dt)
 *   읽기: lv.surfaceY · lv.center(Vector3, 액면 가운데) · lv.radius(액면 반지름 어림) · lv.rimCenter · lv.rimRadius
 *   lv.kick(x, z) — 액면을 한 번 흔든다(물체를 담글 때)
 */
export function createLevel(ctx, inner, opt = {}){
  const lq = LIQ[opt.liquid] || LIQ.ln2;
  let mesh = inner, own = false;
  if (!inner.isMesh) {                                                    // 치수만 받았으면 회전체를 만든다
    const { rBot, rTop, h } = inner, pts = [new THREE.Vector2(0, 0), new THREE.Vector2(rBot, 0), new THREE.Vector2((rBot + rTop) / 2, h / 2), new THREE.Vector2(rTop, h), new THREE.Vector2(0, h)];
    mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 40)); mesh.position.y = inner.y || 0; (inner.parent || ctx.scene).add(mesh); own = true;
  }
  const geo = mesh.geometry; if (!geo.boundingBox) geo.computeBoundingBox();
  const bb = geo.boundingBox, pos = geo.attributes.position, cxL = (bb.min.x + bb.max.x) / 2, czL = (bb.min.z + bb.max.z) / 2, hL = Math.max(1e-5, bb.max.y - bb.min.y);

  // ── 높이별 반지름·부피 표(세운 자세 기준) + 기울었을 때 높낮이를 잴 점 몇 개
  const BINS = 24, rad = new Float32Array(BINS), vol = new Float32Array(BINS + 1);
  for (let i = 0; i < pos.count; i++) { const b = Math.min(BINS - 1, Math.max(0, Math.floor((pos.getY(i) - bb.min.y) / hL * BINS))), r = Math.hypot(pos.getX(i) - cxL, pos.getZ(i) - czL); if (r > rad[b]) rad[b] = r; }
  for (let b = 0; b < BINS; b++) if (rad[b] === 0) rad[b] = b ? rad[b - 1] : 0;
  for (let b = BINS - 2; b >= 0; b--) if (rad[b] === 0) rad[b] = rad[b + 1];
  for (let b = 0; b < BINS; b++) vol[b + 1] = vol[b] + rad[b] * rad[b]; for (let b = 1; b <= BINS; b++) vol[b] /= vol[BINS] || 1;
  const heightOf = f => { if (f <= 0) return 0; if (f >= 1) return 1; let b = 0; while (b < BINS && vol[b + 1] < f) b++; return (b + (f - vol[b]) / Math.max(1e-6, vol[b + 1] - vol[b])) / BINS; };
  const radiusAt = hf => rad[Math.min(BINS - 1, Math.max(0, Math.floor(hf * BINS)))];
  const SN = Math.min(96, pos.count), samp = new Float32Array(SN * 3); for (let k = 0; k < SN; k++) { const i = Math.floor(k * pos.count / SN); samp[k * 3] = pos.getX(i); samp[k * 3 + 1] = pos.getY(i); samp[k * 3 + 2] = pos.getZ(i); }

  // ── 재질: 뒷면 = 액면, 앞면 = 유리벽 너머의 액체 몸통
  const U = { uFxNoise: { value: ctx.noise }, uLvPlane: { value: new THREE.Vector4(0, 1, 0, 0) }, uLvA: { value: new THREE.Vector4(0, 0, lq.absorb, lq.body) }, uLvMin: { value: lq.min }, uLvFlip: { value: 0 },
    uLvInv: { value: new THREE.Matrix4() }, uLvY: { value: new THREE.Vector4(bb.min.y, hL, cxL, czL) }, uLvRad: { value: Array.from(rad) } };
  { // 면이 안쪽을 보게 내보내진 메시면(부호 있는 부피 < 0) 앞뒤를 바꿔 읽는다
    const ix = geo.index, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nT = ix ? ix.count / 3 : pos.count / 3; let sv = 0;
    for (let t = 0; t < nT; t++) { a.fromBufferAttribute(pos, ix ? ix.getX(t * 3) : t * 3); b.fromBufferAttribute(pos, ix ? ix.getX(t * 3 + 1) : t * 3 + 1); c.fromBufferAttribute(pos, ix ? ix.getX(t * 3 + 2) : t * 3 + 2); sv += a.dot(b.cross(c)); }
    U.uLvFlip.value = sv < 0 ? 1 : 0; }
  const mat = new THREE.MeshStandardMaterial({ color: opt.color ?? lq.color, roughness: .04, metalness: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: .55 });
  makeGlassy(mat);
  addPatch(mat, 'level', shader => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLvW;').replace('#include <project_vertex>', '#include <project_vertex>\nvLvW = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uFxNoise; uniform vec4 uLvPlane; uniform vec4 uLvA; uniform float uLvMin, uLvFlip; uniform mat4 projectionMatrix, uLvInv; uniform vec4 uLvY; uniform float uLvRad[ ' + BINS + ' ]; varying vec3 vLvW;\n' + BOIL_GLSL)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      {
        // 갈림길 없이 쓴다: 무늬 읽기를 if 안에 두면 윈도우 크롬의 셰이더 번역이 몹시 느려진다
        #ifdef FLIP_SIDED
          float lvCap = gl_FrontFacing ? 1.0 : 0.0;
        #else
          float lvCap = gl_FrontFacing ? 0.0 : 1.0;
        #endif
        lvCap = mix( lvCap, 1.0 - lvCap, step( 0.5, uLvFlip ) );                 // 1 = 뒷면(액면으로 그린다), 0 = 앞면(몸통)
        vec3 lvRd = normalize( vLvW - cameraPosition ); float lvDn = dot( lvRd, uLvPlane.xyz );
        float lvT = ( uLvPlane.w - dot( cameraPosition, uLvPlane.xyz ) ) / ( abs( lvDn ) < 1e-4 ? -1e-4 : lvDn );
        lvCap *= step( 0.0, lvT );
        vec3 lvP = cameraPosition + lvRd * max( lvT, 0.0 ); float lvDeep = distance( lvP, vLvW );
        // 그 자리가 용기 안쪽일 때만 액면이다(옆벽 아래로 들어온 시선은 액면을 지나지 않았다) — 안쪽 모양을 회전체로 보고 높이별 반지름 표와 견준다
        vec3 lvL = ( uLvInv * vec4( lvP, 1.0 ) ).xyz; float lvH = clamp( ( lvL.y - uLvY.x ) / uLvY.y, 0.0, 0.9999 ) * ${BINS}.0 - 0.5;
        int lvB = int( floor( clamp( lvH, 0.0, ${BINS - 1}.0 ) ) ); float lvR = mix( uLvRad[ lvB ], uLvRad[ min( lvB + 1, ${BINS - 1} ) ], clamp( lvH - float( lvB ), 0.0, 1.0 ) );
        vec3 bs = fxBoil( lvP.xz, uLvA.y, uLvA.x );
        if ( dot( vLvW, uLvPlane.xyz ) > uLvPlane.w || ( lvCap > 0.5 && distance( lvL.xz, uLvY.zw ) > lvR * 1.012 + 0.0004 ) ) discard;   // 수평면 위쪽은 잘라 낸다 · 용기 밖으로 나간 액면도
        vec3 lvN = normalize( ( viewMatrix * vec4( normalize( uLvPlane.xyz + vec3( -bs.x, 0.0, -bs.y ) ), 0.0 ) ).xyz );
        normal = normalize( mix( normal, lvN, lvCap ) );
        float lvEdge = 1.0 - smoothstep( 0.0, 0.007, lvDeep );                    // 벽에 닿는 테두리
        float lvA = mix( clamp( max( 1.0 - exp( -lvDeep * uLvA.z ), uLvMin ) + lvEdge * 0.3, 0.0, 1.0 ), 0.9, bs.z );
        diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), max( bs.z, lvEdge * 0.5 ) * lvCap );
        diffuseColor.a = mix( uLvA.w, lvA, lvCap ); roughnessFactor = mix( roughnessFactor, 0.6, bs.z * lvCap );
        vec4 lvC = projectionMatrix * viewMatrix * vec4( lvP, 1.0 );
        gl_FragDepth = mix( gl_FragCoord.z, clamp( lvC.z / lvC.w * 0.5 + 0.5, 0.0, 1.0 ), lvCap );   // 액면의 깊이로 쓴다 → 담근 물체가 액면 아래로 잠겨 보인다
      }`);
  });
  const keepMat = mesh.material; mesh.material = mat; mesh.name = mesh.name || 'fx_level'; mesh.castShadow = false; mesh.receiveShadow = false; mesh.renderOrder = opt.renderOrder ?? 2; mesh.layers.set(FX_LAYER); mesh.visible = false;

  // ── 출렁임(용수철): 용기가 빨라지면 액면이 반대로 기운다
  const wp = new THREE.Vector3(), prev = new THREE.Vector3(), vel = new THREE.Vector3(), pv = new THREE.Vector3(), n = new THREE.Vector3(), v = new THREE.Vector3(), q = new THREE.Vector3();
  const sl = { x: 0, z: 0, vx: 0, vz: 0 }; let has = false, time = 0;
  const api = {
    fill: opt.fill ?? 0, boil: 0, mesh, material: mat, surfaceY: 0, center: new THREE.Vector3(), radius: 0, rimCenter: new THREE.Vector3(), rimRadius: 0, bottomRadius: 0, bottomY: 0,
    kick(x = 0, z = 0){ sl.vx += x; sl.vz += z; },
    update(dt){
      const f = Math.min(1, Math.max(0, api.fill)); mesh.visible = f > .004;
      mesh.updateWorldMatrix(true, false); const m = mesh.matrixWorld, e = m.elements;
      let lo = Infinity, hi = -Infinity; for (let k = 0; k < SN; k++) { const y = e[1] * samp[k * 3] + e[5] * samp[k * 3 + 1] + e[9] * samp[k * 3 + 2] + e[13]; if (y < lo) lo = y; if (y > hi) hi = y; }
      const sc = Math.hypot(e[0], e[1], e[2]), hf = heightOf(f);
      wp.set(cxL, bb.min.y + hL * hf, czL).applyMatrix4(m);
      api.rimCenter.set(cxL, bb.max.y, czL).applyMatrix4(m); api.rimRadius = rad[BINS - 1] * sc; api.bottomRadius = rad[0] * sc; api.bottomY = lo;
      const y = lo + (hi - lo) * hf;
      if (dt > 0) {
        time += dt;
        if (!has) { prev.copy(wp); has = true; }
        v.copy(wp).sub(prev).divideScalar(dt); prev.copy(wp); const ax = (v.x - pv.x) / dt, az = (v.z - pv.z) / dt; pv.copy(v);
        const tx = Math.max(-.45, Math.min(.45, ax / 9.8)), tz = Math.max(-.45, Math.min(.45, az / 9.8));       // 빨라지는 쪽의 반대편이 솟는다
        let left = dt; while (left > 1e-5) { const h = Math.min(left, 1 / 90); left -= h; sl.vx += ((tx - sl.x) * 70 - sl.vx * 3.2) * h; sl.vz += ((tz - sl.z) * 70 - sl.vz * 3.2) * h; sl.x += sl.vx * h; sl.z += sl.vz * h; }
        sl.x = Math.max(-.6, Math.min(.6, sl.x)); sl.z = Math.max(-.6, Math.min(.6, sl.z));
      }
      n.set(sl.x, 1, sl.z).normalize(); q.set(wp.x, y, wp.z);
      U.uLvInv.value.copy(m).invert();
      U.uLvPlane.value.set(n.x, n.y, n.z, n.dot(q)); U.uLvA.value.x = Math.min(1, Math.max(0, api.boil)); U.uLvA.value.y = time;
      api.surfaceY = y; api.center.copy(q); api.radius = radiusAt(hf) * sc;
    },
    /** 붓는 줄기·알갱이가 받는 그릇으로 쓰는 약속(core/liquid.js 의 vessels 와 같다) */
    receiver(absorb){ return { inside: p => Math.hypot(p.x - api.rimCenter.x, p.z - api.rimCenter.z) < api.rimRadius && p.y < api.rimCenter.y + .01 && p.y > api.bottomY - .01, get surfaceY(){ return mesh.visible ? api.surfaceY : api.bottomY + .004; }, absorb: absorb || (() => { }) }; },
    dispose(){ mat.dispose(); if (own) { mesh.removeFromParent(); geo.dispose(); } else { mesh.material = keepMat; mesh.layers.set(0); } },
  };
  api.update(0);
  return api;
}
