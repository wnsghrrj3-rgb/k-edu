// 케이히스토리 엔진 · look2.js — 「외형 시험 2」: 질감과 빛만으로 어디까지 좋아지는지 보는 층. 주소에 ?look=2 를 붙였을 때만 켜진다(기본 화면은 그대로).
//  하는 일 넷: ① 안개를 멀리 밀어 먼 언덕이 하얗게 날아가지 않게 ② 해를 세게·하늘빛을 낮춰 그늘이 생기게 ③ 그림자 틀을 좁혀 또렷하게 ④ 뭉툭한 나무 덩어리에 잎 질감.
//  규칙·시대 이름은 모른다. 모델은 그대로 두고 재질·빛만 건드린다 — 면 수가 늘지 않아 프레임에 거의 영향이 없다.
import * as THREE from 'three';
import { applySurfaces } from './visuals.js';

export function applyLook2(g) {
  const e = g.e, s = e.scene;
  /* ① 안개 */
  s.fog = new THREE.Fog(0xc9d6da, 75, 270);
  /* ② 빛 */
  const hemi = s.children.find((o) => o.isHemisphereLight);
  if (hemi) { hemi.color.set(0xbcd3ee); hemi.groundColor.set(0x6a583c); hemi.intensity = 0.42; }
  e.sun.color.set(0xffe0b0); e.sun.intensity = 3.1;
  e.sunOffset = new THREE.Vector3(-30, 30, 20);
  if (e.fill) e.fill.intensity = 0.22;
  e.renderer.toneMappingExposure = 0.98;
  /* ③ 그림자 */
  const sc = e.sun.shadow.camera; sc.left = -44; sc.right = 44; sc.top = 44; sc.bottom = -44; sc.near = 1; sc.far = 150; sc.updateProjectionMatrix();
  e.sun.shadow.mapSize.set(2048, 2048); e.sun.shadow.bias = -0.0004; e.sun.shadow.normalBias = 0.045;
  if (e.sun.shadow.map) { e.sun.shadow.map.dispose(); e.sun.shadow.map = null; }
  /* ④ 잎 */
  applySurfaces(e, {
    leaf: { set: 'leaf', tile: 1.5, tint: 0.3, normal: 1.3 },
    leaf2: { set: 'leaf', tile: 1.3, tint: 0.3, normal: 1.3 },
    pine: { set: 'leaf', tile: 1.0, tint: 0.38, normal: 1.4 },
  });
  /* ⑤ 그림은 있는데 밋밋한 벽·지붕·나무판: 그림은 그대로 두고 울퉁불퉁함(노멀)만 얹는다 */
  const L = new THREE.TextureLoader();
  const bump = (set, rep) => { const t = L.load(`/kworld/tex/${set}_normal.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t; };
  const relief = { mud: ['rock', 2, 1.1], wall: ['dirt', 3, 0.7], thatch: ['bark', 2, 1.0], wood: ['bark', 2, 0.6], tile: ['bark', 3, 0.5] };
  const seen = new Set();
  s.traverse((o) => { const m = o.material; if (!o.isMesh || !m || seen.has(m)) return; seen.add(m); const r = relief[m.name]; if (!r || !m.map || m.normalMap || !o.geometry.attributes.uv) return;
    m.normalMap = bump(r[0], r[1]); m.normalScale = new THREE.Vector2(r[2], r[2]); m.needsUpdate = true; });
}
