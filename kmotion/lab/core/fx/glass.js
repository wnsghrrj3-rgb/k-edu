// 케이모션 과학실 — 유리·스테인리스 재질(화질 등급별) + 재질에 셰이더 조각을 덧대는 공용 도구
// 상 등급: 굴절 있는 물리 재질 · 중/하 등급: 환경 반사 + 가장자리만 밝아지는 반투명(뒷면 먼저, 앞면 나중). 모양은 등급이 바뀌어도 같다.
import * as THREE from 'three';

/** 재질에 셰이더 조각을 덧댄다. 여러 효과(서리 + 유리 …)가 한 재질에 겹쳐도 되게 차례로 부른다.
 *  주의: material.clone() 은 덧댄 조각을 가져가지 않는다 → 복제한 뒤에 덧댄다. */
export function addPatch(material, key, fn){
  let P = material.__fxPatch;
  if (!P) {
    P = material.__fxPatch = { keys: [], fns: [], prev: material.onBeforeCompile };
    material.onBeforeCompile = function (shader, renderer){ if (P.prev) P.prev.call(this, shader, renderer); for (const f of P.fns) f(shader); };
    material.customProgramCacheKey = function (){ return 'fx|' + P.keys.join('|'); };
  }
  if (P.keys.includes(key)) return material;
  P.keys.push(key); P.fns.push(fn); material.needsUpdate = true; return material;
}

/** 반투명해도 반사광은 흐려지지 않게(유리·액체): 바탕 × (1 − 진하기) + 퍼진 빛 × 진하기 + 반사광 */
export function patchGlassy(shader){
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <opaque_fragment>', 'gl_FragColor = vec4( ( totalDiffuse + totalEmissiveRadiance ) * diffuseColor.a + totalSpecular, diffuseColor.a );')
    .replace('#include <premultiplied_alpha_fragment>', '');
}
export function makeGlassy(material){ material.transparent = true; material.premultipliedAlpha = true; return addPatch(material, 'glassy', patchGlassy); }

// ── 가짜 유리(중·하 등급): 가운데는 맑고 가장자리(비스듬히 보이는 곳)만 뿌옇게 밝아진다
function fakeGlass(src, o){
  const m = new THREE.MeshStandardMaterial({ color: o.tint, metalness: 0, roughness: o.roughness, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: o.envMapIntensity });
  if (src) { m.name = src.name; m.roughnessMap = src.roughnessMap || null; m.normalMap = src.normalMap || null; if (src.normalScale) m.normalScale.copy(src.normalScale); }
  const U = { uGlA: { value: new THREE.Vector3(o.clear, o.rim, o.rimPower) } };
  makeGlassy(m);
  addPatch(m, 'fakeglass', shader => {
    shader.uniforms.uGlA = U.uGlA;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uGlA;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { float glF = pow( 1.0 - abs( dot( normal, normalize( vViewPosition ) ) ), uGlA.z );
        diffuseColor.a = mix( uGlA.x, uGlA.y, glF ); diffuseColor.rgb *= mix( 0.35, 0.6, glF ); }   // 퍼진 빛은 조금만(벽이 네 겹 겹쳐도 뿌옇게 뜨지 않게). 유리다움은 반사광이 맡는다`);
  });
  m.userData.fxGlass = 'fake';
  return m;
}
// ── 진짜 유리(상 등급): 굴절·두께
function realGlass(src, o){
  const m = new THREE.MeshPhysicalMaterial({ color: o.tint, metalness: 0, roughness: o.roughness, transmission: 1, ior: o.ior, thickness: o.thickness,
    attenuationColor: new THREE.Color(o.tint), attenuationDistance: o.attenuationDistance, envMapIntensity: o.envMapIntensity, side: src ? src.side : THREE.FrontSide, specularIntensity: 1, depthWrite: false /* 안에 든 액체(비치는 것)가 유리 뒤에서도 그려지게 */ });
  if (src) { m.name = src.name; m.roughnessMap = src.roughnessMap || null; m.normalMap = src.normalMap || null; if (src.normalScale) m.normalScale.copy(src.normalScale); }
  m.userData.fxGlass = 'physical';
  return m;
}

const GLASS_DEFAULT = { tint: 0xeaf4f1, roughness: .05, ior: 1.5, thickness: .004, attenuationDistance: .6, envMapIntensity: 1.5, clear: .03, rim: .5, rimPower: 2.6 };

/** 유리 재질을 등급에 맞게 바꿔 돌려준다(원본은 그대로 두고, 등급별로 한 번만 만든다).
 *  tier: 'high' → 굴절 유리 · 'mid'/'low' → 가짜 유리 */
export function applyTier(material, tier = 'mid', opt = {}){
  const src = material || null, kind = tier === 'high' ? 'physical' : 'fake';
  const cache = src ? (src.__fxTier || (src.__fxTier = {})) : {};
  if (cache[kind]) return cache[kind];
  const o = { ...GLASS_DEFAULT, ...(src && src.color && opt.tint == null ? { tint: src.color.getHex() } : {}), ...(src && src.roughness != null && opt.roughness == null && src.roughness < .5 ? { roughness: src.roughness } : {}), ...opt };
  return (cache[kind] = kind === 'physical' ? realGlass(src, o) : fakeGlass(src, o));
}

// ── 스테인리스: 금속 + 닦은 자국 거칠기 무늬(절차 생성, 한 번만)
let brushed = null;
function brushedTexture(){
  if (brushed) return brushed;
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  let s = 12345; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  g.fillStyle = 'rgb(0,150,255)'; g.fillRect(0, 0, S, S);                       // G = 거칠기, B = 금속
  for (let k = 0; k < 900; k++) { const y = rnd() * S, x = rnd() * S, w = 30 + rnd() * 200, v = 90 + rnd() * 130 | 0; g.fillStyle = `rgba(0,${v},255,${.10 + rnd() * .25})`; g.fillRect(x, y, w, 1); if (x + w > S) g.fillRect(x - S, y, w, 1); }   // 결(가로 줄)
  for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(0,${200 + rnd() * 55 | 0},255,${.05 + rnd() * .08})`; g.lineWidth = 2 + rnd() * 7; g.beginPath(); g.arc(rnd() * S, rnd() * S, 30 + rnd() * 90, rnd() * 6.3, rnd() * 6.3); g.stroke(); }   // 닦은 자국
  brushed = new THREE.CanvasTexture(c); brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping; brushed.repeat.set(3, 1); brushed.anisotropy = 4;
  return brushed;
}
/** 스테인리스 재질을 만든다(또는 준 재질을 스테인리스로 맞춘다). 등급과 상관없이 같다. */
export function steel(material, opt = {}){
  const m = material && material.isMeshStandardMaterial ? material : new THREE.MeshStandardMaterial();
  m.color.set(opt.color ?? 0xd6d9dc); m.metalness = 1; m.roughness = opt.roughness ?? .42; m.envMapIntensity = opt.envMapIntensity ?? 1.25;
  if (!m.roughnessMap && opt.brushed !== false) { m.roughnessMap = brushedTexture(); m.metalnessMap = m.roughnessMap; }
  m.needsUpdate = true; return m;
}

/** 물체 아래 재질을 이름 머리말로 갈아 끼운다: glass_ → 등급별 유리, metal_ → 스테인리스.
 *  등급이 내려가면 같은 물체에 다시 부르면 된다(원본은 userData.fxSrcMat 에 남아 있다). onGlass(mesh) 는 유리 메시마다 불린다. */
export function applyToObject(root, tier = 'mid', opt = {}){
  const gp = opt.glassPrefix || 'glass_', mp = opt.metalPrefix || 'metal_';
  root.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const src = o.userData.fxSrcMat || o.material, name = src.name || '';
    if (name.startsWith(gp)) { o.userData.fxSrcMat = src; o.material = applyTier(src, tier, opt.glass); o.castShadow = false; if (opt.onGlass) opt.onGlass(o); }
    else if (name.startsWith(mp) && !o.userData.fxSteel) { o.userData.fxSteel = true; steel(o.material, opt.steel); }
  });
  return root;
}

export function createGlass(ctx){
  return { applyTier: (m, tier = ctx.tier, opt) => applyTier(m, tier, opt), applyToObject: (root, tier = ctx.tier, opt = {}) => applyToObject(root, tier, { onGlass: ctx.noFogDepth, ...opt }), steel, addPatch, makeGlassy };
}
