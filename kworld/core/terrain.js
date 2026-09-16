// 세계층 — 바닥 스플랫: 흙/풀/자갈 질감을 높이·경사·물가·야영지 거리로 섞어 칠한다(구조 설계 v1 §2).
// 자산 0 — 이미 있는 tex/<set>_albedo·rough 를 셰이더에서 섞는다. 시대 이름 없음: world.splat 로 켠다.
//   "splat": { "targets": ["grass","dry"], "sets": { "base":"grass", "dirt":"dirt", "rock":"rock" }, "tile": 2.5,
//              "waterY": -0.3, "shore": 1.6, "slope": 0.42, "trampled": [[-6,3,7]] }
import * as THREE from 'three';

const _cache = new Map();
function tex(name, srgb) {
  const key = name; if (_cache.has(key)) return _cache.get(key);
  const t = new THREE.TextureLoader().load(`/kworld/tex/${name}`); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; _cache.set(key, t); return t;
}

export function applySplat(e, cfg) {
  if (!cfg || !cfg.targets) return;
  const sets = cfg.sets || { base: 'grass', dirt: 'dirt', rock: 'rock' };
  const u = {
    uTile: { value: cfg.tile ?? 2.5 }, uWaterY: { value: cfg.waterY ?? -0.3 }, uShore: { value: cfg.shore ?? 1.6 }, uSlope: { value: cfg.slope ?? 0.42 },
    uDirtMap: { value: tex(`${sets.dirt}_albedo.jpg`, true) }, uDirtRough: { value: tex(`${sets.dirt}_rough.jpg`) },
    uRockMap: { value: tex(`${sets.rock}_albedo.jpg`, true) }, uRockRough: { value: tex(`${sets.rock}_rough.jpg`) },
    uTrampled: { value: (cfg.trampled || []).slice(0, 4).map(([x, z, r]) => new THREE.Vector3(x, z, r)).concat(Array(4).fill(new THREE.Vector3(0, 0, 0))).slice(0, 4) },
  };
  e.scene.traverse((o) => {
    if (!o.isMesh || !o.material?.name || !cfg.targets.includes(o.material.name)) return;
    const m = o.material; if (m.userData.splat) return; m.userData.splat = true;
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (s, r) => {
      prev && prev(s, r); Object.assign(s.uniforms, u);
      s.vertexShader = 'varying vec3 vWPos; varying vec3 vWNrm;\n' + s.vertexShader
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vWNrm = normalize(mat3(modelMatrix) * objectNormal);');
      s.fragmentShader = `varying vec3 vWPos; varying vec3 vWNrm; uniform float uTile, uWaterY, uShore, uSlope; uniform sampler2D uDirtMap, uDirtRough, uRockMap, uRockRough; uniform vec3 uTrampled[4];
        float hashn(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hashn(i), hashn(i+vec2(1,0)), f.x), mix(hashn(i+vec2(0,1)), hashn(i+vec2(1,1)), f.x), f.y); }
        vec3 splatW(){
          float slope = 1.0 - clamp(vWNrm.y, 0.0, 1.0);
          float wRock = smoothstep(uSlope - 0.12, uSlope + 0.12, slope);
          float shore = 1.0 - smoothstep(uWaterY, uWaterY + uShore, vWPos.y);
          float n = vnoise(vWPos.xz * 0.11) * 0.7 + vnoise(vWPos.xz * 0.37) * 0.3;
          float patches = smoothstep(0.62, 0.78, n);
          float tr = 0.0; for (int i = 0; i < 4; i++) { float d = distance(vWPos.xz, uTrampled[i].xy); tr = max(tr, (1.0 - smoothstep(uTrampled[i].z * 0.35, uTrampled[i].z, d)) * step(0.01, uTrampled[i].z)); }
          float wDirt = clamp(max(max(shore * 0.9, patches * 0.6), tr) * (1.0 - wRock), 0.0, 1.0);
          float wBase = clamp(1.0 - wRock - wDirt, 0.0, 1.0);
          return vec3(wBase, wDirt, wRock);
        }\n` + s.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 w = splatW(); vec2 tuv = vWPos.xz / uTile;
            vec4 dirtC = texture2D(uDirtMap, tuv); vec4 rockC = texture2D(uRockMap, tuv * 1.3);
            diffuseColor.rgb = diffuseColor.rgb * w.x + dirtC.rgb * w.y + rockC.rgb * w.z; }`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          { vec3 w = splatW(); vec2 tuv = vWPos.xz / uTile; roughnessFactor = roughnessFactor * w.x + texture2D(uDirtRough, tuv).g * w.y + texture2D(uRockRough, tuv * 1.3).g * w.z; }`);
    };
    m.customProgramCacheKey = () => 'kworld-splat-v1:' + (m.map ? 'm' : '') + (m.roughnessMap ? 'r' : '');
    m.needsUpdate = true;
  });
}
