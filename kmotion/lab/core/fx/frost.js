// 케이모션 과학실 — 서리: 물체 재질에 서리를 0~1 만큼 덮는다(겉 온도 값이 곧 덮는 정도). 녹을 때는 물방울이 맺힌다. (설계 6-3)
// 흰 칠처럼 보이지 않게: ① 먼저 겉이 뿌옇게 김 서리고 ② 모서리·얇은 가장자리·윗면부터 결정이 번지고 ③ 두께가 고르지 않아 밑색이 비치고 ④ 결정 결(오돌토돌)과 반짝임이 있다.
// MeshStandard/Physical 재질에 조각을 덧댄다(onBeforeCompile). 물체 좌표에 붙으므로 물체가 움직여도 무늬가 미끄러지지 않는다.
import * as THREE from 'three';
import { addPatch } from './glass.js';

// 모서리 정도(0 평평 ~ 1 날카로움·열린 가장자리)를 꼭짓점마다 구해 둔다 — 서리가 거기서부터 자란다
function edgeAttribute(geo){
  if (geo.attributes.frostEdge || !geo.attributes.position) return;
  const pos = geo.attributes.position, ix = geo.index, nV = pos.count, nT = (ix ? ix.count : nV) / 3 | 0;
  const out = new Float32Array(nV);
  if (nV > 80000 || nT < 1) { geo.setAttribute('frostEdge', new THREE.BufferAttribute(out, 1)); return; }
  const ids = new Int32Array(nV), map = new Map(); let nU = 0;                         // 같은 자리의 꼭짓점을 하나로
  for (let i = 0; i < nV; i++) { const k = Math.round(pos.getX(i) * 2e4) * 73856093 ^ Math.round(pos.getY(i) * 2e4) * 19349663 ^ Math.round(pos.getZ(i) * 2e4) * 83492791; let id = map.get(k); if (id === undefined) { id = nU++; map.set(k, id); } ids[i] = id; }
  const sx = new Float64Array(nU), sy = new Float64Array(nU), sz = new Float64Array(nU), sa = new Float64Array(nU), open = new Uint8Array(nU), edges = new Map();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (let t = 0; t < nT; t++) {
    const i0 = ix ? ix.getX(t * 3) : t * 3, i1 = ix ? ix.getX(t * 3 + 1) : t * 3 + 1, i2 = ix ? ix.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2); n.copy(b).sub(a).cross(c.sub(a)); const ar = n.length(); if (ar < 1e-12) continue;
    const u = [ids[i0], ids[i1], ids[i2]];
    for (let k = 0; k < 3; k++) { sx[u[k]] += n.x; sy[u[k]] += n.y; sz[u[k]] += n.z; sa[u[k]] += ar; const p = u[k], q = u[(k + 1) % 3]; if (p !== q) { const ek = p < q ? p * nU + q : q * nU + p; edges.set(ek, (edges.get(ek) || 0) + 1); } }
  }
  for (const [ek, cnt] of edges) if (cnt === 1) { open[Math.floor(ek / nU)] = 1; open[ek % nU] = 1; }
  for (let i = 0; i < nV; i++) { const u = ids[i], flat = sa[u] > 0 ? Math.hypot(sx[u], sy[u], sz[u]) / sa[u] : 1; out[i] = open[u] ? 1 : Math.min(1, (1 - flat) * 3.2); }
  geo.setAttribute('frostEdge', new THREE.BufferAttribute(out, 1));
}

const VS_PARS = /* glsl */`
attribute float frostEdge; uniform float uFrScale;
varying vec3 vFrP; varying vec3 vFrN; varying vec2 vFrE;`;
const VS_MAIN = /* glsl */`
vFrP = position * uFrScale; vFrN = normalize( normal ); vFrE = vec2( frostEdge, normalize( mat3( modelMatrix ) * normal ).y );`;
const FS_PARS = /* glsl */`
uniform sampler2D uFxNoise; uniform vec4 uFrost;     // 서리 · 물기 · 반짝임 세기 · 결 높이
uniform vec3 uFrCol; uniform float uFrDark;
varying vec3 vFrP; varying vec3 vFrN; varying vec2 vFrE;
vec4 frTri( vec3 p, vec3 w, float s ){ return texture2D( uFxNoise, p.yz * s ) * w.x + texture2D( uFxNoise, p.zx * s + 0.37 ) * w.y + texture2D( uFxNoise, p.xy * s + 0.71 ) * w.z; }
vec4 frHash( vec2 p ){ vec4 q = fract( vec4( p.xyxy ) * vec4( 0.1031, 0.1030, 0.0973, 0.1099 ) ); q += dot( q, q.wzxy + 33.33 ); return fract( ( q.xxyz + q.yzzw ) * q.zywx ); }
// 물방울: 칸마다 하나. 돌려주는 값 = 방울 높이(0~1) · 방울 안(0/1)
vec2 frBead( vec2 uv, float S, float wet ){
  vec2 g = uv * S, id = floor( g ), f = fract( g ); vec4 h = frHash( id );
  float on = step( h.z, wet * 0.62 ), r = ( 0.13 + 0.17 * h.w ) * smoothstep( 0.0, 0.5, wet ) + 1e-4;
  float d = length( f - ( 0.5 + ( h.xy - 0.5 ) * 0.4 ) ) / r;
  float hgt = max( 0.0, 1.0 - d * d ); return vec2( on * hgt * hgt, on * ( 1.0 - smoothstep( 0.8, 1.0, d ) ) );     // 둥근 볼록(가장자리가 매끈하게 0 으로) · 방울 안
}`;
const FS_MAIN = /* glsl */`
{
  float frA = uFrost.x, frW = uFrost.y;
  {                                                // 갈림길(if) 없이 늘 계산한다: 무늬 읽기를 if 안에 두면 윈도우 크롬의 셰이더 번역이 몹시 느려진다
    vec3 frw = pow( abs( vFrN ), vec3( 4.0 ) ); frw /= ( frw.x + frw.y + frw.z + 1e-5 );
    vec4 n1 = frTri( vFrP, frw, 4.0 );            // 큰 얼룩(조금 이르고 늦은 곳)
    vec4 n2 = frTri( vFrP, frw, 19.0 );           // 결정 씨앗(세포 무늬 3mm: 가운데에서 돋아 자라다 서로 만난다)
    vec4 n3 = frTri( vFrP, frw, 57.0 );           // 잔 알갱이
    // 덮이는 차례: 모서리·가장자리의 씨앗 먼저, 윗면 먼저. 씨앗 가운데에서 바깥으로 자란다(흰 칠처럼 한꺼번에 덮이지 않는다)
    float frSeed = n2.b * 0.75 + n3.b * 0.25;
    float frF = clamp( 0.5 * frSeed + 0.22 * n1.r + 0.24 * ( 1.0 - vFrE.x ) - 0.08 * vFrE.y + 0.04, 0.03, 1.0 );
    float frCover = smoothstep( frF - 0.12, frF + 0.12, frA * 1.12 - 0.04 );                 // 0.25 쯤부터 모서리에 돋기 시작해 0.9 에서 거의 다 덮인다
    float frCry = clamp( 1.15 - frSeed * 1.1, 0.0, 1.0 ) * 0.6 + n3.g * 0.4;                // 결정 두께(씨앗 가운데가 두껍다)
    float frThick = frCover * mix( 0.3, 0.95, frCry ) * mix( 0.62, 1.0, smoothstep( 0.3, 1.0, frA ) );
    float frHaze = smoothstep( 0.0, 0.45, frA ) * ( 0.55 + 0.45 * n3.r ) * 0.8;                     // 서리보다 먼저 겉이 뿌옇게 김 서림
    // 물방울(녹는 중): 서리가 걷힌 자리에 맺힌다
    vec2 frUv = frw.x > frw.y && frw.x > frw.z ? vFrP.yz : ( frw.y > frw.z ? vFrP.zx : vFrP.xy );
    vec2 frB = max( frBead( frUv, 140.0, frW ), frBead( frUv + 3.7, 260.0, frW * 0.9 ) ) * ( 1.0 - frCover * 0.85 );
    float frWetFilm = frW * ( 1.0 - frCover );
    // 색·거칠기: 얼면 밑색이 짙어지고(물기가 얼어 빛을 덜 흩뜨림), 서리는 비스듬히 보이는 곳(테두리)에서 더 하얗다 — 정면에서는 결정 사이로 밑색이 비친다
    float frFres = pow( 1.0 - abs( dot( normal, normalize( vViewPosition ) ) ), 2.0 );
    vec3 frBase = diffuseColor.rgb * mix( vec3( 1.0 ), pow( diffuseColor.rgb, vec3( uFrDark * 0.6 ) ) * ( 1.0 - uFrDark ), smoothstep( 0.1, 0.8, frA ) );   // 얼면 밑색이 짙고 진해진다(꽃잎·잎은 더)
    float frVis = frThick * mix( 0.5, 1.0, frFres ) * mix( 0.6, 1.0, frCry );
    diffuseColor.rgb = mix( frBase, mix( frBase, vec3( 0.84, 0.88, 0.92 ), 0.2 ), frHaze );
    diffuseColor.rgb = mix( diffuseColor.rgb, uFrCol * ( 0.68 + 0.32 * frCry ), frVis );   // 결정마다 밝기가 달라 판 결이 보인다
    diffuseColor.rgb *= 1.0 - 0.14 * frWetFilm; diffuseColor.rgb = mix( diffuseColor.rgb, frBase * 1.05, frB.y * 0.3 );
    roughnessFactor = mix( roughnessFactor, max( roughnessFactor, 0.72 ), frHaze );
    roughnessFactor = mix( roughnessFactor, 0.55 + 0.4 * frCry, frCover );
    roughnessFactor = mix( roughnessFactor, min( roughnessFactor, 0.3 ), frWetFilm * 0.7 ); roughnessFactor = mix( roughnessFactor, 0.04, frB.y );
    metalnessFactor *= 1.0 - max( frThick, frHaze * 0.6 );
    diffuseColor.a = max( diffuseColor.a, max( frThick, frHaze * 0.5 ) );              // 비치는 재질(유리·풍선)도 서리 낀 곳은 뿌옇다
    // 결(오돌토돌) + 방울 볼록: 높이의 화면 기울기로 법선을 민다
    float frH = frThick * ( 0.6 * frCry + 0.4 * n3.b ) * 0.4 * uFrost.w + frB.x * 0.3;
    vec3 frDx = dFdx( -vViewPosition ), frDy = dFdy( -vViewPosition ); float frHx = dFdx( frH ), frHy = dFdy( frH );
    vec3 frR1 = cross( frDy, normal ), frR2 = cross( normal, frDx ); float frDet = dot( frDx, frR1 );
    vec3 frG = sign( frDet ) * ( frHx * frR1 + frHy * frR2 );
    normal = normalize( abs( frDet ) * normal - 0.0011 * frG );
    // 반짝임: 보는 방향에 따라 켜졌다 꺼지는 결정
    vec3 frV = normalize( vViewPosition );
    float frGl = texture2D( uFxNoise, frUv * 47.0 + frV.xy * 0.35 ).b * texture2D( uFxNoise, frUv * 83.0 - frV.yx * 0.5 + 0.5 ).g;
    frSpark = smoothstep( 0.43, 0.52, frGl ) * frThick * frThick * uFrost.z * 0.8;
  }
}`;

/**
 * const frost = createFrost(ctx)
 *   const h = frost.apply(object3D, { scale, sparkle, color, bump, darken })   darken = 얼었을 때 밑색이 짙어지는 정도(기본 0.28, 꽃잎은 0.45 쯤)     — 그 아래 모든 표준 재질에 덧댄다(재질을 나눠 쓰는 다른 물체도 같이 언다 → 물체마다 재질을 복제해 두기)
 *   매 프레임: h.amount = 0~1 (겉 온도에서: 20℃ → 0, −60℃ 아래 → 1 같은 식으로)
 *   녹는 물기 h.wet 은 스스로 따라간다(amount 가 내려가면 물방울이 맺혔다 마른다). 손으로 주려면 h.autoWet = false.
 *   frost.update(dt)
 */
export function createFrost(ctx){
  const handles = [];
  function patch(material, U){
    if (!material || !material.isMeshStandardMaterial) return false;
    addPatch(material, 'frost', shader => {
      Object.assign(shader.uniforms, U);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\n' + VS_PARS).replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VS_MAIN);
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\n' + FS_PARS)
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nfloat frSpark = 0.0;')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + FS_MAIN)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3( 0.85, 0.93, 1.0 ) * frSpark;');
    });
    return true;
  }
  const api = {
    handles,
    apply(root, opt = {}){
      const U = { uFxNoise: { value: ctx.noise }, uFrost: { value: new THREE.Vector4(0, 0, opt.sparkle ?? 1.2, opt.bump ?? 1) }, uFrScale: { value: opt.scale ?? 1 }, uFrCol: { value: new THREE.Color(opt.color ?? 0xf1f6fb) }, uFrDark: { value: opt.darken ?? .28 } };
      const mats = new Set();
      root.updateWorldMatrix(true, false);
      if (opt.scale == null) { const e = root.matrixWorld.elements; U.uFrScale.value = Math.hypot(e[0], e[1], e[2]) || 1; }   // 물체가 커져 있어도 서리 알갱이 크기는 같게
      root.traverse(o => { if (!o.isMesh) return; edgeAttribute(o.geometry); for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (patch(m, U)) mats.add(m); });
      const h = { root, uniforms: U, materials: mats, amount: 0, wet: 0, autoWet: true, prev: 0,
        remove(){ const i = handles.indexOf(h); if (i >= 0) handles.splice(i, 1); U.uFrost.value.x = 0; U.uFrost.value.y = 0; } };
      handles.push(h); return h;
    },
    update(dt){
      for (let k = 0; k < handles.length; k++) { const h = handles[k], a = Math.min(1, Math.max(0, h.amount));
        if (h.autoWet && dt > 0) { const d = a - h.prev;
          if (d < -1e-6) h.wet = Math.min(1, h.wet + (-d) * 3.2);                         // 녹는 만큼 물기가 맺힌다
          else if (d > 1e-6) h.wet = Math.max(0, h.wet - dt * 1.6);                       // 다시 얼면 물방울도 언다
          else if (a < .02) h.wet = Math.max(0, h.wet - dt * .07); }                      // 다 녹은 뒤 천천히 마른다
        h.prev = a; h.uniforms.uFrost.value.x = a; h.uniforms.uFrost.value.y = Math.min(1, Math.max(0, h.wet)); }
    },
  };
  return api;
}
