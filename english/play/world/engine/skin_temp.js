/* 공통 엔진 · 온도 겉 — 물건과 캐릭터가 지닌 온도(temp -1 ~ 1)를 겉에 입힌다(연구소 설계 v1 · 4장 「물건의 상태 넷」).
 * 어느 자리에서나 보여야 한다(언 사과는 둥둥 자리에서도 서리가 끼어 있다) → 껍데기가 한 번 만들고 매 장면 tick(dt) 를 부른다.
 *   차가움: 서리 = 물건을 살짝 부풀린 흰 반투명 껍질이 「아래에서부터」 올라온다(온도만큼 높이). 큰 것은 천천히 차가워지니 서리도 천천히 오른다.
 *   뜨거움: 달아오름 = 같은 껍질의 주황 덧빛(가장자리가 더 밝다) + 위로 오르는 아지랑이 김.
 *   캐릭터: actor.tint 로 파래지고 발그레해진다(뼈로 움직이는 몸이라 껍질을 씌우지 않는다).
 * 물건 재질의 색 · emissive 는 건드리지 않는다 — 색은 색 겉(skin_color.js)이, emissive 는 things.js(닿았을 때 빛남)가 쓴다.
 * 김 · 눈 알갱이(createPuffs)도 여기 둔다: 밝은 벽 앞에서도 보이게 덧칠이 아니라 그냥 칠하는 부드러운 점. 자리 ④(얼음과 불)가 같은 무리를 나눠 쓴다(알갱이 한도). */
import * as THREE from 'three';
import { clamp, rand } from './stage.js';

// ── 수치
export const TEMP = {
  FROST_FROM: 0.05, FROST_FULL: 0.9,     // 온도가 -FROST_FROM 일 때 서리가 바닥에서 시작해 -FROST_FULL 에서 꼭대기까지 덮는다(-0.6 = "Cold!" 에서 3분의 2쯤)
  HOT_FROM: 0.1, HOT_FULL: 0.9,          // 달아오른 빛이 보이기 시작하는 온도 · 가장 짙은 온도
  EASE: 7,                               // 겉이 온도를 따라가는 빠르기(1/초)
  PUFF: 0.012,                           // 껍질을 부풀리는 두께(물건 크기 1일 때)
  STEAM_AT: 0.45, STEAM: 5, MIST: 1.6,   // 이보다 뜨거우면 김이 오른다(초당 알 수 × 뜨거움) · 언 것에서 흘러내리는 찬 김(초당)
  ACTOR: { cold: '#3f8fff', hot: '#ff2f55', coldK: 0.55, hotK: 0.22, from: 0.15 },   // 캐릭터의 살빛에 번지는 색 · 가장 짙을 때의 세기 · 번지기 시작하는 온도
  PUFFS: 140,                            // 김 · 눈 알갱이 수(무대의 반짝이 260 과 합쳐 400 — 설계 13장의 한도)
};
const COL = { steam: '#ffffff', mist: '#eaf6ff' };

/** 김 · 눈 · 물방울 — 부드러운 알갱이 무리(알갱이마다 크기와 진하기가 다르다).
 *  emit(자리, 색, 개수, 퍼짐, { v:[x,y,z](나가는 쪽), vr(제멋대로 퍼지는 빠르기), size, grow(1초에 커지는 크기), a(진하기), g(아래로 당기는 힘 · -면 떠오른다), life:[짧게, 길게], flat }) */
export function createPuffs(scene, stage, n = TEMP.PUFFS) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 4), size = new Float32Array(n), pp = Array.from({ length: n }, () => ({ life: 0, max: 1, v: new THREE.Vector3(), g: 0, grow: 0, a: 1 })); let next = 0;
  const geo = new THREE.BufferGeometry(), c = new THREE.Color(), uK = { value: 400 };
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aCol', new THREE.BufferAttribute(col, 4)); geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uK },
    vertexShader: 'attribute vec4 aCol; attribute float aSize; varying vec4 vC; uniform float uK; void main(){ vC = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uK / -mv.z; }',
    fragmentShader: 'varying vec4 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.3, d) * vC.a; if (a < 0.004) discard; gl_FragColor = vec4(vC.rgb, a); }' });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 6; scene.add(pts);
  function emit(p, color, count = 1, spread = 0.1, o = {}) {
    c.set(color).convertLinearToSRGB(); const v = o.v || [0, 0, 0], vr = o.vr ?? 0.3;
    for (let i = 0; i < count; i++) { const q = pp[next], j = next; next = (next + 1) % n; q.life = q.max = rand(...(o.life || [0.6, 1.1])); q.g = o.g ?? 0; q.grow = o.grow ?? 0; q.a = o.a ?? 0.8;
      pos[j * 3] = p.x + rand(-spread, spread); pos[j * 3 + 1] = p.y + rand(-spread, spread) * (o.flat ? 0.1 : 1); pos[j * 3 + 2] = p.z + rand(-spread, spread); size[j] = (o.size ?? 0.2) * rand(0.75, 1.25);
      q.v.set(v[0] + rand(-vr, vr), v[1] + rand(-vr, vr), v[2] + rand(-vr, vr)); col[j * 4] = c.r; col[j * 4 + 1] = c.g; col[j * 4 + 2] = c.b; col[j * 4 + 3] = 0; }
  }
  function tick(dt) {
    uK.value = stage.renderer.domElement.height * 0.5 * stage.camera.projectionMatrix.elements[5];
    for (let i = 0; i < n; i++) { const q = pp[i]; if (q.life <= 0) { col[i * 4 + 3] = 0; continue; }
      q.life -= dt; pos[i * 3] += q.v.x * dt; pos[i * 3 + 1] += q.v.y * dt; pos[i * 3 + 2] += q.v.z * dt; q.v.y -= q.g * dt; size[i] += q.grow * dt;
      const k = Math.max(0, q.life / q.max); col[i * 4 + 3] = q.a * Math.min(1, (1 - k) * 7) * Math.min(1, k * 1.8); }
    geo.attributes.position.needsUpdate = geo.attributes.aCol.needsUpdate = geo.attributes.aSize.needsUpdate = true;
  }
  /** 흰 김 한 줌(위로 오르며 퍼진다). */
  const steam = (p, count = 1, spread = 0.2, up = 0.7, big = 1) => emit(p, COL.steam, count, spread, { v: [0, up, 0], vr: 0.22, size: 0.26 * big, grow: 0.4 * big, a: 0.6, g: -0.3, life: [0.8, 1.5] });
  /** 찬 김(아래로 흘러내린다). */
  const mist = (p, count = 1, spread = 0.15) => emit(p, COL.mist, count, spread, { v: [0, -0.25, 0], vr: 0.1, size: 0.18, grow: 0.22, a: 0.5, life: [0.7, 1.2] });
  return { emit, tick, steam, mist, points: pts };
}

// 껍질의 그림: 서리는 높이(vH 0 = 바닥 · 1 = 꼭대기)가 uFrost 아래인 곳에만, 끝은 들쭉날쭉하게. 달아오름은 가장자리가 밝은 주황 덧빛.
const VERT = `uniform vec3 uUp; uniform float uY0, uY1, uPuff; varying float vH, vA; varying vec3 vN, vV;
void main(){ vH = (dot(position, uUp) - uY0) / max(uY1 - uY0, 0.0001); vA = atan(position.x, position.z); vec4 mv = modelViewMatrix * vec4(position + normal * uPuff, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const FRAG = `uniform float uFrost, uHot, uT; varying float vH, vA; varying vec3 vN, vV;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5), a = 0.0; vec3 c = vec3(1.0);
  if (uFrost > 0.002) { float e = uFrost * 1.14 - 0.07 + 0.035 * sin(vA * 7.0) + 0.025 * sin(vA * 13.0 + 1.7);
    float glint = step(0.975, fract(sin(dot(floor(gl_FragCoord.xy / 3.0), vec2(12.9898, 78.233))) * 43758.5453 + uT * 0.35));
    c = mix(vec3(0.78, 0.90, 1.0), vec3(1.0), 0.4 + 0.45 * rim) + glint * 0.25; a = (1.0 - smoothstep(e - 0.035, e + 0.02, vH)) * (0.58 + 0.34 * rim) * smoothstep(0.0, 0.1, uFrost); }
  else if (uHot > 0.002) { c = mix(vec3(1.0, 0.24, 0.03), vec3(1.0, 0.6, 0.18), rim); a = uHot * (0.14 + 0.42 * rim) * (0.88 + 0.12 * sin(uT * 6.0 + vH * 8.0)); }
  if (a < 0.004) discard; gl_FragColor = vec4(c, a); }`;

/** C = 껍데기가 넘기는 것 { stage, scene, things:{ 이름: 물건 }, GOGO(캐릭터를 대상 꼴로 감싼 것), gogo(캐릭터), fx }.  → { tick(dt), puffs }
 *  한 화면에 하나만 둔다: 두 번 부르면 처음 만든 것을 돌려준다(C.tempSkin). */
export function createTempSkin(C) {
  if (C.tempSkin) return C.tempSkin;
  const { stage, scene, gogo, GOGO } = C, puffs = createPuffs(scene, stage), v3 = new THREE.Vector3(), q = new THREE.Quaternion(), corner = new THREE.Vector3(), uT = { value: 0 }, skins = [];
  for (const t of Object.values(C.things)) {
    const geo = t.mesh.geometry; if (!geo.boundingBox) geo.computeBoundingBox();
    const U = { uUp: { value: new THREE.Vector3(0, 1, 0) }, uY0: { value: 0 }, uY1: { value: 1 }, uPuff: { value: TEMP.PUFF }, uFrost: { value: 0 }, uHot: { value: 0 }, uT };
    const shell = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
    shell.visible = false; shell.renderOrder = 2; shell.castShadow = shell.receiveShadow = false; shell.name = 'tempSkin'; t.obj.add(shell);      // 물건 모형의 형제로 둔다(모형을 베껴 쓰는 생각 방울에는 따라가지 않게)
    skins.push({ t, shell, U, box: geo.boundingBox, frost: 0, hot: 0 });
  }
  const A = { cold: 0, hot: 0, last: '' };
  // 살빛에 번지는 붉은 덧빛만으로는 초록 몸이 누렇게 보인다 → 뜨거울 때 얼굴 둘레에 발그레한 빛 무리를 하나 띄운다(카메라를 마주 보는 그림 한 장)
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 64; { const x = glowC.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,70,60,.9)'); gr.addColorStop(0.45, 'rgba(255,50,50,.4)'); gr.addColorStop(1, 'rgba(255,40,40,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; glow.renderOrder = 4; scene.add(glow);
  function tick(dt) {
    uT.value += dt; const k = 1 - Math.exp(-TEMP.EASE * dt);
    for (const S of skins) {
      const t = S.t, temp = t.temp || 0;
      S.frost += (clamp((-temp - TEMP.FROST_FROM) / (TEMP.FROST_FULL - TEMP.FROST_FROM), 0, 1) - S.frost) * k; S.hot += (clamp((temp - TEMP.HOT_FROM) / (TEMP.HOT_FULL - TEMP.HOT_FROM), 0, 1) - S.hot) * k;
      const on = (S.frost > 0.004 || S.hot > 0.004) && t.state !== 'gone'; S.shell.visible = on; if (!on) continue;
      const m = t.mesh, sh = S.shell; sh.position.copy(m.position); sh.quaternion.copy(m.quaternion); sh.scale.copy(m.scale);
      // 「아래」는 세상의 아래다: 구르는 공 · 쓰러진 컵에서도 서리는 바닥 쪽에서 올라온다 → 위쪽 방향을 모형의 좌표로 돌려서 넘긴다
      t.obj.getWorldQuaternion(q).multiply(m.quaternion).invert(); const up = S.U.uUp.value.set(0, 1, 0).applyQuaternion(q), b = S.box; let y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < 8; i++) { const d = corner.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).dot(up); if (d < y0) y0 = d; if (d > y1) y1 = d; }
      S.U.uY0.value = y0; S.U.uY1.value = y1; S.U.uFrost.value = S.frost; S.U.uHot.value = S.frost > 0.004 ? 0 : S.hot; const bl = S.frost > 0.004 ? THREE.NormalBlending : THREE.AdditiveBlending; if (sh.material.blending !== bl) sh.material.blending = bl;      // 서리는 덮어 칠하고, 달아오른 빛은 덧빛으로 더한다 S.U.uPuff.value = TEMP.PUFF / Math.max(t.size, 0.3);
      const top = t.y + (t.ball ? t.r * 2 : t.h) * t.size;
      if (temp > TEMP.STEAM_AT && Math.random() < dt * TEMP.STEAM * temp) puffs.steam(v3.set(t.x, top + 0.05, t.z), 1, t.r * t.size * 0.5, 0.55, 0.7 + 0.3 * t.size);
      if (temp < -0.5 && Math.random() < dt * TEMP.MIST) puffs.mist(v3.set(t.x, t.y + 0.12, t.z), 1, t.r * t.size);
    }
    // 캐릭터: 차가우면 파래지고 뜨거우면 발그레해진다
    const g = GOGO.temp || 0, P = TEMP.ACTOR; A.cold += (clamp((-g - P.from) / (1 - P.from), 0, 1) - A.cold) * k; A.hot += (clamp((g - P.from) / (1 - P.from), 0, 1) - A.hot) * k;
    const key = A.cold > 0.004 ? 'c' + A.cold.toFixed(2) : A.hot > 0.004 ? 'h' + A.hot.toFixed(2) : '';
    if (key !== A.last) { A.last = key; if (A.cold > 0.004) gogo.tint(P.cold, A.cold * P.coldK); else gogo.tint(P.hot, A.hot > 0.004 ? A.hot * P.hotK : 0); }
    glow.visible = A.hot > 0.02; if (glow.visible) { const s = gogo.state; glow.position.set(s.pos.x, s.y + 0.62 * s.size, s.pos.z + 0.25 * s.size); glow.scale.setScalar(1.7 * s.size * (1 + 0.05 * Math.sin(uT.value * 6))); glow.material.opacity = A.hot * 0.3; }
    if (g > TEMP.STEAM_AT + 0.15 && Math.random() < dt * TEMP.STEAM * 0.6 * g) { const s = gogo.state; puffs.steam(v3.set(s.pos.x, s.y + 1.1 * s.size, s.pos.z), 1, 0.15 * s.size, 0.6, 0.8); }
    puffs.tick(dt);
  }
  return C.tempSkin = { tick, puffs, skins, TEMP };
}
