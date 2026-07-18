/* 케이파크 · 마블런 — stage/renderer.js
 * Three.js r185. 코어(window.MarbleSim)가 만든 트랙 데이터를 3D로.
 * 밤의 놀이공원 톤: 딥 네이비 + 웜 라이트 + 부품별 포인트 컬러.
 */
import * as THREE from 'three';

const COLOR = {
  bg0: 0x0a0f2c,
  ground: 0x11173a,
  tile: 0x1d2650,
  tileEdge: 0x3b4a8f,
  pillar: 0x2a3568,
  rail: 0xc9d4ff,
  railEmissive: 0x2f3f8f,
  tower: 0x7c5cff,
  towerFunnel: 0x9d84ff,
  goalBase: 0xffb020,
  bell: 0xffd35c,
  marble: 0x4de1ff,
};

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR.bg0);
  scene.fog = new THREE.Fog(COLOR.bg0, 1.6, 4.5);

  // 조명: 달빛 키 + 웜 필 + 앰비언트
  const amb = new THREE.AmbientLight(0x8899ff, 0.55);
  scene.add(amb);
  const key = new THREE.DirectionalLight(0xdfe6ff, 1.6);
  key.position.set(0.8, 1.6, 0.6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -1; key.shadow.camera.right = 1;
  key.shadow.camera.top = 1; key.shadow.camera.bottom = -1;
  scene.add(key);
  const warm = new THREE.PointLight(0xffb45c, 0.9, 3.0);
  warm.position.set(0.4, 0.5, 0.6);
  scene.add(warm);

  // 바닥 + 별
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64),
    new THREE.MeshStandardMaterial({ color: COLOR.ground, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.002;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(makeStars());

  return { renderer, scene };
}

function makeStars() {
  const N = 400;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(Math.random() * 0.85);
    const rr = 3.8;
    pos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = rr * Math.cos(ph) + 0.2;
    pos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xaebbff, size: 0.012, sizeAttenuation: true, transparent: true, opacity: 0.8 }));
}

/** 트랙 전체 빌드. 반환: { group, marble, bellMesh } */
export function buildTrackMeshes(pieces, track, C) {
  const NS = window.MarbleSim;
  const hx = NS.hexgrid;
  const group = new THREE.Group();

  const tileGeo = new THREE.CylinderGeometry(C.R * 0.96, C.R * 0.96, 0.008, 6);
  const tileMat = new THREE.MeshStandardMaterial({ color: COLOR.tile, roughness: 0.6, metalness: 0.1 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: COLOR.tileEdge, emissive: COLOR.tileEdge, emissiveIntensity: 0.35, roughness: 0.4 });
  const pillarGeo = new THREE.CylinderGeometry(C.R * 0.28, C.R * 0.32, C.H, 6);
  const pillarMat = new THREE.MeshStandardMaterial({ color: COLOR.pillar, roughness: 0.7 });

  for (const p of pieces) {
    const c = hx.tileCenter(p.q, p.r, C.R);
    // 베이스판 (지면)
    const base = new THREE.Mesh(tileGeo, tileMat);
    base.position.set(c.x, 0.004, c.z);
    base.rotation.y = Math.PI / 6;
    base.receiveShadow = true;
    group.add(base);
    // 발광 테두리 링
    const ring = new THREE.Mesh(new THREE.TorusGeometry(C.R * 0.9, 0.0022, 8, 6), edgeMat);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = Math.PI / 6;
    ring.position.set(c.x, 0.009, c.z);
    group.add(ring);
    // 기둥 스택
    for (let k = 0; k < p.h; k++) {
      const pil = new THREE.Mesh(pillarGeo, pillarMat);
      pil.position.set(c.x, 0.008 + C.H * (k + 0.5), c.z);
      pil.castShadow = true;
      group.add(pil);
    }
    // 부품 판 (기둥 위)
    if (p.h > 0 || p.type !== 'start') {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(C.R * 0.9, C.R * 0.9, 0.006, 6),
        new THREE.MeshStandardMaterial({ color: COLOR.tile, roughness: 0.5 })
      );
      plate.position.set(c.x, p.h * C.H + 0.003, c.z);
      plate.rotation.y = Math.PI / 6;
      plate.castShadow = true;
      plate.receiveShadow = true;
      group.add(plate);
    }
  }

  // 레일: 부품별 웨이포인트 → 튜브
  const railMat = new THREE.MeshStandardMaterial({
    color: COLOR.rail, emissive: COLOR.railEmissive, emissiveIntensity: 0.5, roughness: 0.25, metalness: 0.5,
  });
  for (const rg of track.pieceRanges) {
    const piece = pieces[rg.pieceIndex];
    const pts = track.points.slice(rg.i0, rg.i1 + 1)
      .map(p => new THREE.Vector3(p.x, p.y - C.MR * 0.75, p.z));
    if (pts.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(pts.length * 3, 12), 0.005, 10, false), railMat);
      tube.castShadow = true;
      group.add(tube);
    }
    if (piece.type === 'start') group.add(makeTower(piece, C, hx));
    if (piece.type === 'goal') group.add(makeGoal(piece, C, hx));
  }

  // 구슬
  const marble = new THREE.Mesh(
    new THREE.SphereGeometry(C.MR, 24, 16),
    new THREE.MeshStandardMaterial({ color: COLOR.marble, emissive: 0x0a6fa0, emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.3 })
  );
  marble.castShadow = true;
  const glow = new THREE.PointLight(0x4de1ff, 0.5, 0.25);
  marble.add(glow);
  group.add(marble);

  const bellMesh = group.getObjectByName('bell') || null;
  return { group, marble, bellMesh };
}

function makeTower(piece, C, hx) {
  const g = new THREE.Group();
  const c = hx.tileCenter(piece.q, piece.r, C.R);
  const topY = piece.h * C.H;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(C.R * 0.34, C.R * 0.42, C.FUNNEL_DROP + 0.012, 12),
    new THREE.MeshStandardMaterial({ color: COLOR.tower, emissive: 0x35208f, emissiveIntensity: 0.4, roughness: 0.4 })
  );
  body.position.set(c.x, topY + (C.FUNNEL_DROP + 0.012) / 2, c.z);
  body.castShadow = true;
  g.add(body);
  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(C.R * 0.55, C.R * 0.30, 0.02, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: COLOR.towerFunnel, emissive: 0x4a2fb8, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.35 })
  );
  funnel.position.set(c.x, topY + C.FUNNEL_DROP + 0.016, c.z);
  g.add(funnel);
  return g;
}

function makeGoal(piece, C, hx) {
  const g = new THREE.Group();
  const c = hx.tileCenter(piece.q, piece.r, C.R);
  const y = piece.h * C.H;
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(C.R * 0.5, C.R * 0.36, 0.016, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: COLOR.goalBase, emissive: 0x8a5200, emissiveIntensity: 0.4, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.4 })
  );
  bowl.position.set(c.x, y + 0.006, c.z);
  g.add(bowl);
  // 종 (기둥 + 종체)
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0025, 0.0025, 0.075, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a93c8, roughness: 0.5, metalness: 0.6 })
  );
  post.position.set(c.x + C.R * 0.45, y + 0.0375, c.z);
  g.add(post);
  const bell = new THREE.Mesh(
    new THREE.ConeGeometry(0.014, 0.02, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: COLOR.bell, emissive: 0xa87400, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.2, metalness: 0.8 })
  );
  bell.name = 'bell';
  bell.position.set(c.x + C.R * 0.45, y + 0.078, c.z);
  g.add(bell);
  return g;
}

export { COLOR, THREE };
