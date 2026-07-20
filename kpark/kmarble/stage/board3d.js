/* 케이마블 · 3D 무대 — 밤의 세계여행 보드
 * 타일 28칸(캔버스 텍스처 카드) · 소유 네온 테두리 · 건물 성장(빌라→빌딩→랜드마크+빛기둥)
 * 말(윤나는 말+이모지 얼굴+활성 링) · 물리 주사위 메쉬 · 카메라 감독(전경/추적/주사위 클로즈업) */
'use strict';
import * as THREE from 'three';

export const TS = 1.15;              // 타일 한 변
const TILE_H = 0.12;

/* 2D판과 동일한 링 좌표 */
export function cellOf(i) {
  if (i === 0) return [7, 7]; if (i <= 6) return [7, 7 - i]; if (i === 7) return [7, 0];
  if (i <= 13) return [7 - (i - 7), 0]; if (i === 14) return [0, 0];
  if (i <= 20) return [0, i - 14]; if (i === 21) return [0, 7];
  return [i - 21, 7];
}
export function tileCenter(i) {
  const [r, c] = cellOf(i);
  return new THREE.Vector3((c - 3.5) * TS, TILE_H, (r - 3.5) * TS);
}

export const GCOLORS = { 1: 0xc8905c, 2: 0x5ccfe0, 3: 0x7de08a, 4: 0xf06292, 5: 0x5c8df0, 6: 0xffd35c };
const SPECIAL_BG = { start: '#243a63', island: '#1e4a4a', festival: '#4a2a55', space: '#20264f', key: '#3a3155', tax: '#4a2f2f', fountain: '#1f4356', tourist: '#3f3a1f' };

/* ---------- 캔버스 유틸 ---------- */
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* ---------- 무대 ---------- */
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b22);
  scene.fog = new THREE.Fog(0x070b22, 14, 30);

  scene.add(new THREE.HemisphereLight(0x8fa6ff, 0x2a1c33, 0.75));
  const key = new THREE.DirectionalLight(0xfff2d8, 1.5);
  key.position.set(5, 10, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const S = 6.4;
  key.shadow.camera.left = -S; key.shadow.camera.right = S;
  key.shadow.camera.top = S; key.shadow.camera.bottom = -S;
  key.shadow.camera.far = 26; key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6a7dff, 0.5); rim.position.set(-6, 5, -6); scene.add(rim);

  /* 별하늘 */
  const starGeo = new THREE.BufferGeometry();
  const pos = [];
  let s = 20260721;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 420; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 0.85);
    const R = 22;
    pos.push(R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph) + 1, R * Math.sin(ph) * Math.sin(th));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xcfd8ff, size: 0.07, transparent: true, opacity: 0.9, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  /* 바닥 원반(무대) + 판 받침 */
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 11.6, 0.5, 48),
    new THREE.MeshStandardMaterial({ color: 0x0c1233, roughness: 0.9 })
  );
  ground.position.y = -0.4; ground.receiveShadow = true; scene.add(ground);

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(TS * 8.55, 0.22, TS * 8.55),
    new THREE.MeshStandardMaterial({ color: 0x121a3f, roughness: 0.55, metalness: 0.25 })
  );
  slab.position.y = -0.11; slab.receiveShadow = true; scene.add(slab);
  /* 네온 테 */
  const neon = new THREE.Mesh(
    new THREE.BoxGeometry(TS * 8.7, 0.06, TS * 8.7),
    new THREE.MeshBasicMaterial({ color: 0x5c8df0, transparent: true, opacity: 0.0 })
  );
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(TS * 8.56, 0.24, TS * 8.56)),
    new THREE.LineBasicMaterial({ color: 0x6fa0ff, transparent: true, opacity: 0.8 })
  );
  edge.position.y = -0.1; scene.add(edge); neon.visible = false; scene.add(neon);

  /* 중앙 로고 + 주사위 접시 */
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshBasicMaterial({
      transparent: true, depthWrite: false,
      map: canvasTex(512, 512, (ctx, w, h) => {
        ctx.translate(w / 2, h / 2);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.16;
        ctx.font = '900 118px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffd35c'; ctx.fillText('케이마블', 0, -30);
        ctx.font = '96px serif'; ctx.globalAlpha = 0.2; ctx.fillText('👑', 0, 92);
        ctx.globalAlpha = 0.12; ctx.strokeStyle = '#8fa6ff'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(0, 0, 236, 0, Math.PI * 2); ctx.stroke();
      })
    })
  );
  logo.rotation.x = -Math.PI / 2; logo.position.y = 0.012; scene.add(logo);

  const dish = new THREE.Mesh(
    new THREE.RingGeometry(2.3, 2.44, 48),
    new THREE.MeshBasicMaterial({ color: 0xffd35c, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false })
  );
  dish.rotation.x = -Math.PI / 2; dish.position.y = 0.016; scene.add(dish);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  return { renderer, scene, camera, resize, dish, starMat };
}

/* ---------- 타일 카드 ---------- */
function tileTexture(t, i) {
  return canvasTex(256, 256, (ctx, w, h) => {
    const grp = t.g ? '#' + GCOLORS[t.g].toString(16).padStart(6, '0') : null;
    const bg = t.t === 'city' ? '#182448' : (SPECIAL_BG[t.t] || '#182448');
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, bg); g.addColorStop(1, '#0d1330');
    ctx.fillStyle = g; rr(ctx, 6, 6, w - 12, h - 12, 22); ctx.fill();
    ctx.strokeStyle = 'rgba(160,190,255,.28)'; ctx.lineWidth = 3; rr(ctx, 6, 6, w - 12, h - 12, 22); ctx.stroke();
    /* 색 그룹 밴드 */
    if (grp) {
      ctx.fillStyle = grp; rr(ctx, 14, 14, w - 28, 40, 12); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; rr(ctx, 14, 14, w - 28, 16, 8); ctx.fill();
    } else if (t.t === 'tourist') {
      ctx.fillStyle = '#ffd35c'; rr(ctx, 14, 14, w - 28, 40, 12); ctx.fill();
      ctx.fillStyle = '#3a2a00'; ctx.font = '700 26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('관광지', w / 2, 43);
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '92px serif'; ctx.fillText(t.em, w / 2, h / 2 - 4);
    ctx.font = '800 34px "Segoe UI", sans-serif'; ctx.fillStyle = '#f4f7ff';
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6;
    ctx.fillText(t.nm, w / 2, h - 62);
    ctx.shadowBlur = 0;
    if (t.p) {
      ctx.font = '700 28px sans-serif'; ctx.fillStyle = '#ffd35c';
      ctx.fillText('💰' + t.p, w / 2, h - 28);
    }
  });
}

export function buildBoard(scene, TILES) {
  const group = new THREE.Group();
  const tiles = new Map();
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x1b2650, roughness: 0.5, metalness: 0.2 });
  const botMat = new THREE.MeshStandardMaterial({ color: 0x0d1330 });
  for (let i = 0; i < TILES.length; i++) {
    const t = TILES[i];
    const top = new THREE.MeshStandardMaterial({ map: tileTexture(t, i), roughness: 0.62, metalness: 0.08 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(TS * 0.965, TILE_H, TS * 0.965), [sideMat, sideMat, top, botMat, sideMat, sideMat]);
    const c = tileCenter(i);
    mesh.position.set(c.x, TILE_H / 2, c.z);
    mesh.receiveShadow = true; mesh.castShadow = false;
    mesh.userData.tile = i;
    /* 소유 네온 프레임 (숨김 시작) */
    const frame = new THREE.Mesh(
      new THREE.RingGeometry(TS * 0.34, TS * 0.46, 4, 1, Math.PI / 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    frame.rotation.x = -Math.PI / 2; frame.rotation.z = Math.PI / 4;
    frame.scale.setScalar(1.48);
    frame.position.set(c.x, TILE_H + 0.012, c.z);
    /* 선택 하이라이트 링 */
    const pick = new THREE.Mesh(
      new THREE.RingGeometry(TS * 0.30, TS * 0.40, 24),
      new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0, depthWrite: false })
    );
    pick.rotation.x = -Math.PI / 2;
    pick.position.set(c.x, TILE_H + 0.02, c.z);
    group.add(mesh, frame, pick);
    tiles.set(i, { mesh, frame, pick, festival: null, buildings: null, beam: null });
  }
  scene.add(group);
  return { group, tiles };
}

/* ---------- 건물 ---------- */
function houseMesh(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xf6ead2, roughness: 0.7 }));
  body.position.y = 0.09;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.15, 4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55 }));
  roof.position.y = 0.255; roof.rotation.y = Math.PI / 4;
  g.add(body, roof);
  return g;
}
function towerMesh(color) {
  const g = new THREE.Group();
  const winTex = canvasTex(64, 128, (ctx, w, h) => {
    ctx.fillStyle = '#2a3564'; ctx.fillRect(0, 0, w, h);
    for (let y = 10; y < h - 8; y += 22) for (let x = 8; x < w - 8; x += 18) {
      ctx.fillStyle = Math.random() < 0.7 ? '#ffe9a8' : '#3d4a80';
      ctx.fillRect(x, y, 10, 12);
    }
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.52, 0.26),
    new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.5, emissive: 0x584a20, emissiveMap: winTex, emissiveIntensity: 0.55 }));
  body.position.y = 0.26;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
  cap.position.y = 0.545;
  g.add(body, cap);
  return g;
}
function landmarkMesh(color) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.16, 6),
    new THREE.MeshStandardMaterial({ color: 0x3a2f13, roughness: 0.5, metalness: 0.4 }));
  base.position.y = 0.08;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.17, 0.62, 6),
    new THREE.MeshStandardMaterial({ color: 0xffd35c, roughness: 0.28, metalness: 0.75, emissive: 0x6a4c00, emissiveIntensity: 0.5 }));
  tower.position.y = 0.47;
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffd35c, emissiveIntensity: 1.4, roughness: 0.2 }));
  orb.position.y = 0.85;
  g.add(base, tower, orb);
  g.userData.orb = orb;
  return g;
}
export function makeBuilding(lv, colorHex) {
  if (lv === 1) return houseMesh(colorHex);
  if (lv === 2) return towerMesh(colorHex);
  return landmarkMesh(colorHex);
}

/* ---------- 말 ---------- */
export function makeToken(em, colorHex) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.35, emissive: colorHex, emissiveIntensity: 0.1 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.16, 0.1, 20), mat);
  base.position.y = 0.05;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.16, 16), mat);
  neck.position.y = 0.17;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 14), mat);
  head.position.y = 0.32;
  base.castShadow = neck.castShadow = head.castShadow = true;
  const face = new THREE.Sprite(new THREE.SpriteMaterial({
    map: canvasTex(96, 96, (ctx, w, h) => {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '68px serif';
      ctx.fillText(em, w / 2, h / 2 + 4);
    }), transparent: true, depthWrite: false
  }));
  face.scale.set(0.34, 0.34, 1); face.position.y = 0.56;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.19, 0.27, 26),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.015;
  g.add(base, neck, head, face, ring);
  g.userData = { ring, body: [base, neck, head] };
  return g;
}

/* ---------- 주사위 ---------- */
const pipCache = {};
function pipTexture(v) {
  if (pipCache[v]) return pipCache[v];
  const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  const t = canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#efe6d2');
    ctx.fillStyle = g; rr(ctx, 3, 3, w - 6, h - 6, 26); ctx.fill();
    ctx.strokeStyle = '#d8cdb2'; ctx.lineWidth = 3; rr(ctx, 3, 3, w - 6, h - 6, 26); ctx.stroke();
    ctx.fillStyle = v === 1 ? '#e0443e' : '#23335e';
    const R = v === 1 ? 17 : 11, o = 30;
    for (const [px, py] of P[v]) {
      ctx.beginPath(); ctx.arc(w / 2 + px * o, h / 2 + py * o, R, 0, Math.PI * 2); ctx.fill();
    }
  });
  pipCache[v] = t;
  return t;
}
export function makeDie(faceValues) {
  const mats = faceValues.map(v => new THREE.MeshStandardMaterial({ map: pipTexture(v), roughness: 0.3, metalness: 0.05 }));
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.68), mats);
  m.castShadow = true;
  return m;
}
export function setDieFaces(die, faceValues) {
  die.material.forEach((mat, i) => { mat.map = pipTexture(faceValues[i]); mat.needsUpdate = true; });
}

/* ---------- 카메라 감독 ---------- */
export function createDirector(camera, canvas) {
  const st = {
    mode: 'over',
    look: new THREE.Vector3(0, 0, -0.2),
    dist: 10.6, pitch: 0.94, yaw: 0,
    tLook: new THREE.Vector3(0, 0, -0.2), tDist: 10.6, tPitch: 0.94, tYaw: 0,
    userYaw: 0, drift: 0,
  };
  function apply(mode, look, dist, pitch) {
    st.mode = mode;
    if (look) st.tLook.copy(look);
    if (dist) st.tDist = dist;
    if (pitch != null) st.tPitch = pitch;
  }
  const api = {
    over() { apply('over', new THREE.Vector3(0, 0, -0.2), 10.6, 0.94); st.tYaw = 0; },
    dice() { apply('dice', new THREE.Vector3(0, 0.2, 0), 6.4, 0.78); st.tYaw = 0; },
    follow(p) { apply('follow', p.clone().setY(0.2), 6.8, 0.82); st.tYaw = 0; },
    peek(p) { apply('peek', p.clone().setY(0.15), 5.6, 0.72); st.tYaw = 0; },
    update(dt) {
      st.drift += dt;
      const k = 1 - Math.pow(0.0018, dt);
      st.look.lerp(st.tLook, k);
      st.dist += (st.tDist - st.dist) * k;
      st.pitch += (st.tPitch - st.pitch) * k;
      st.yaw += (st.tYaw + st.userYaw - st.yaw) * k;
      const idle = st.mode === 'over' ? Math.sin(st.drift * 0.11) * 0.05 : 0;
      const yaw = st.yaw + idle;
      const y = Math.sin(st.pitch) * st.dist;
      const r = Math.cos(st.pitch) * st.dist;
      camera.position.set(st.look.x + Math.sin(yaw) * r, y, st.look.z + Math.cos(yaw) * r);
      camera.lookAt(st.look);
    },
    state: st
  };
  /* 드래그 = 살짝 둘러보기, 휠 = 줌 */
  let dragging = false, px = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; px = e.clientX; });
  addEventListener('pointerup', () => { dragging = false; });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    st.userYaw += (e.clientX - px) * 0.004;
    st.userYaw = Math.max(-0.9, Math.min(0.9, st.userYaw));
    px = e.clientX;
  });
  canvas.addEventListener('wheel', e => {
    st.tDist = Math.max(5.4, Math.min(13.5, st.tDist + e.deltaY * 0.004));
    e.preventDefault();
  }, { passive: false });
  return api;
}
