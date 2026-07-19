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
  cannon: 0xff6b6b,
  tramp: 0x5cff9d,
  catcher: 0x9d84ff,
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

/** 트랙 전체 빌드 (M2b-2: 잎 합집합 entries 기반).
 * entries: [{ piece, pts, airLocal:Set, globalIdx }] — 스위치는 좌/우 두 entry (Y 분기 레일)
 * 반환: { group, bells, switches: Map(pieceIdx→플리퍼), levers: Map(pieceIdx→신호기 탭 패드) } */
export function buildTrackMeshes(pieces, entries, C) {
  const NS = window.MarbleSim;
  const hx = NS.hexgrid;
  const group = new THREE.Group();

  const tileGeo = new THREE.CylinderGeometry(C.R * 0.96, C.R * 0.96, 0.008, 6);
  const tileMat = new THREE.MeshStandardMaterial({ color: COLOR.tile, roughness: 0.6, metalness: 0.1 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: COLOR.tileEdge, emissive: COLOR.tileEdge, emissiveIntensity: 0.35, roughness: 0.4 });
  const pillarGeo = new THREE.CylinderGeometry(C.R * 0.28, C.R * 0.32, C.H, 6);
  const pillarMat = new THREE.MeshStandardMaterial({ color: COLOR.pillar, roughness: 0.7 });

  // 스팬 부품(대포·트램펄린)의 착지대 타일도 바닥·기둥·판을 세운다 (비행 타일은 일부러 빈 공간)
  const BAL = NS.BALLISTIC || {};
  function tileAhead(p, n) {
    const dir = (p.rot + 3) % 6;
    let q = p.q, r = p.r;
    for (let i = 0; i < n; i++) { const t = hx.neighborOf(q, r, dir); q = t.q; r = t.r; }
    return { q, r, dir };
  }
  const stacks = [];
  for (const p of pieces) {
    stacks.push({ q: p.q, r: p.r, h: p.h, type: p.type });
    if (BAL[p.type]) {
      const t = tileAhead(p, BAL[p.type].span);
      stacks.push({ q: t.q, r: t.r, h: p.h, type: 'catcher' });
    }
  }

  for (const p of stacks) {
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
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x2a3568, roughness: 0.7 });
  const boostMat = new THREE.MeshStandardMaterial({
    color: 0xffb020, emissive: 0xff7a00, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.5,
  });
  const bells = new Map();
  const switches = new Map();
  const levers = new Map();
  const decorated = new Set(); // 부품 장식(탑·벨·플리퍼 등)은 전역 인덱스당 한 번만

  for (const en of entries) {
    const piece = en.piece;
    const raw = en.pts;
    const mat = piece.type === 'booster' ? boostMat : railMat;
    if (raw.length >= 2) group.add(buildRails(raw, C, mat, tieMat, 0, en.airLocal));
    if (decorated.has(en.globalIdx)) continue;
    decorated.add(en.globalIdx);
    if (piece.type === 'start') group.add(makeTower(piece, C, hx));
    if (piece.type === 'goal') {
      const g = makeGoal(piece, C, hx);
      group.add(g);
      bells.set(en.globalIdx, g.getObjectByName('bell'));
    }
    if (piece.type === 'gyro') group.add(makeGyroPole(piece, C, hx));
    if (piece.type === 'switch' || piece.type === 'splitter') {
      const f = makeSwitch(piece, C, hx, piece.type === 'splitter');
      group.add(f);
      switches.set(en.globalIdx, f.getObjectByName('flipper'));
      const pad = f.getObjectByName('leverpad');
      if (pad) { pad.userData.pieceIdx = en.globalIdx; levers.set(en.globalIdx, pad); }
    }
    if (piece.type === 'cannon' || piece.type === 'trampoline') {
      group.add(makeBallistic(piece, C, hx, NS));
      const arc = raw.slice(1, raw.length - 1); // 설계 조준 궤적
      if (arc.length >= 2) group.add(makeAimArc(arc));
    }
  }

  return { group, bells, switches, levers };
}

/* 구슬 생성 — 다중 구슬용. colorHex 지정 시 발광도 맞춰 물들인다. */
export function makeMarble(C, colorHex, emissiveHex) {
  const marble = new THREE.Mesh(
    new THREE.SphereGeometry(C.MR, 24, 16),
    new THREE.MeshStandardMaterial({
      color: colorHex != null ? colorHex : COLOR.marble,
      emissive: emissiveHex != null ? emissiveHex : 0x0a6fa0,
      emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.3,
    })
  );
  marble.castShadow = true;
  const glow = new THREE.PointLight(colorHex != null ? colorHex : 0x4de1ff, 0.5, 0.25);
  marble.add(glow);
  return marble;
}

/* 🔀 스위치 / 🚦 신호기: 분기 원판 + 플리퍼(레버) 암.
 * 암은 중심에서 현재 방향의 출구 포트를 가리킨다. userData.yaw = {0: 왼, 1: 오}
 * splitter=true면 에메랄드 림 + 은색 레버 + 신호등 기둥 + 탭 패드(leverpad). */
function makeSwitch(piece, C, hx, splitter) {
  const g = new THREE.Group();
  const c = hx.tileCenter(piece.q, piece.r, C.R);
  const y = piece.h * C.H;
  // 분기 원판 (발광 링)
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(C.R * 0.34, C.R * 0.38, 0.006, 24),
    new THREE.MeshStandardMaterial({ color: 0x22306b, emissive: splitter ? 0x2effa8 : 0x4de1ff, emissiveIntensity: 0.22, roughness: 0.4, metalness: 0.3 })
  );
  disc.position.set(c.x, y + 0.003, c.z);
  g.add(disc);
  const rimColor = splitter ? 0x2effa8 : 0xb84dff;
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(C.R * 0.36, 0.0022, 8, 24),
    new THREE.MeshStandardMaterial({ color: rimColor, emissive: rimColor, emissiveIntensity: 0.8, roughness: 0.3 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(c.x, y + 0.007, c.z);
  g.add(rim);

  // 좌/우 출구 방향 yaw (Three.js yaw = atan2(x, z))
  const yawOf = (port) => {
    const d = hx.portDir(piece.q, piece.r, port, C.R);
    return Math.atan2(d.x, d.z);
  };
  const yawL = yawOf((piece.rot + 2) % 6);
  const yawR = yawOf((piece.rot + 4) % 6);

  // 플리퍼 암: 중심 피벗, 화살촉 모양으로 출구를 가리킨다
  const flipper = new THREE.Group();
  flipper.name = 'flipper';
  const armMat = splitter
    ? new THREE.MeshStandardMaterial({ color: 0xdfe9f5, emissive: 0x7f96b0, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.85 })
    : new THREE.MeshStandardMaterial({ color: 0xffd35c, emissive: 0xb87400, emissiveIntensity: 0.7, roughness: 0.25, metalness: 0.6 });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.005, C.R * 0.52), armMat);
  arm.position.z = C.R * 0.26;
  arm.castShadow = true;
  flipper.add(arm);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0075, 0.016, 4), armMat);
  tip.rotation.x = Math.PI / 2;
  tip.rotation.y = Math.PI / 4;
  tip.position.z = C.R * 0.52 + 0.006;
  tip.castShadow = true;
  flipper.add(tip);
  flipper.position.set(c.x, y + 0.011, c.z);
  flipper.rotation.y = yawL; // 초기 = 왼길
  flipper.userData.yaw = { 0: yawL, 1: yawR };
  flipper.userData.targetDir = 0;
  g.add(flipper);

  if (splitter) {
    // 신호등 기둥: 초록 램프 — "여긴 사람이 조종하는 분기"라는 표식
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0022, 0.0022, 0.055, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a4668, roughness: 0.6, metalness: 0.5 })
    );
    pole.position.set(c.x - C.R * 0.42, y + 0.0275, c.z);
    g.add(pole);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.007, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x2effa8, emissive: 0x2effa8, emissiveIntensity: 1.2, roughness: 0.3 })
    );
    lamp.position.set(c.x - C.R * 0.42, y + 0.058, c.z);
    g.add(lamp);
    // 탭 패드: 넉넉한 투명 히트 실린더 — 실행 중 탭하면 레버 전환
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(C.R * 0.55, C.R * 0.55, 0.05, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    pad.name = 'leverpad';
    pad.position.set(c.x, y + 0.025, c.z);
    g.add(pad);
  }
  return g;
}

/* 플리퍼를 목표 방향으로 러프 회전 (프레임 루프에서 호출) */
export function updateSwitchFlipper(flipper, dir, dt) {
  if (!flipper) return;
  flipper.userData.targetDir = dir;
  const target = flipper.userData.yaw[dir];
  let diff = target - flipper.rotation.y;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  flipper.rotation.y += diff * Math.min(1, dt * 14);
}

/* 두 줄 레일 + 침목: 구슬이 레일 사이에 얹혀 내려가는 게 읽히도록.
 * 각 웨이포인트에서 진행방향의 수평 법선으로 ±offset. */
function buildRails(rawPts, C, railMat, tieMat, baseIdx, airSet) {
  const g = new THREE.Group();
  const offset = C.MR * 0.62;          // 레일 중심 간격의 절반
  const drop = C.MR * 0.42;            // 구슬 중심 대비 레일 높이 (사이에 얹힘)
  const left = [], right = [];
  for (let i = 0; i < rawPts.length; i++) {
    const a = rawPts[Math.max(0, i - 1)], b = rawPts[Math.min(rawPts.length - 1, i + 1)];
    let nx = b.z - a.z, nz = -(b.x - a.x);
    const L = Math.hypot(nx, nz) || 1;
    nx /= L; nz /= L;
    const p = rawPts[i];
    left.push(new THREE.Vector3(p.x + nx * offset, p.y - drop, p.z + nz * offset));
    right.push(new THREE.Vector3(p.x - nx * offset, p.y - drop, p.z - nz * offset));
  }
  // air 구간(점프 공중)은 레일을 끊는다 — 연속 구간별 서브 튜브
  const runs = [];
  let run = [];
  for (let i = 0; i < rawPts.length; i++) {
    const inAir = airSet && airSet.has((baseIdx || 0) + i);
    if (inAir) { if (run.length >= 2) runs.push(run); run = []; }
    else run.push(i);
  }
  if (run.length >= 2) runs.push(run);
  for (const r of runs) {
    for (const side of [left, right]) {
      const pts = r.map(i => side[i]);
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(pts.length * 3, 12), 0.0032, 8, false), railMat);
      tube.castShadow = true;
      g.add(tube);
    }
  }
  // 침목: 3포인트마다 (air 구간 제외)
  const tieGeo = new THREE.CylinderGeometry(0.0018, 0.0018, offset * 2.3, 6);
  for (let i = 1; i < rawPts.length - 1; i += 3) {
    if (airSet && airSet.has((baseIdx || 0) + i)) continue;
    const l = left[i], r = right[i];
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set((l.x + r.x) / 2, (l.y + r.y) / 2 - 0.0035, (l.z + r.z) / 2);
    const dx = r.x - l.x, dz = r.z - l.z;
    tie.rotation.z = Math.PI / 2;
    tie.rotation.y = -Math.atan2(dz, dx);
    tie.castShadow = true;
    g.add(tie);
  }
  return g;
}

/* 대포 포신 / 트램펄린 매트 + 착지대(깔때기 + 백보드) */
function makeBallistic(piece, C, hx, NS) {
  const g = new THREE.Group();
  const spec = NS.BALLISTIC[piece.type];
  const dir = (piece.rot + 3) % 6;
  let q = piece.q, r = piece.r;
  for (let i = 0; i < spec.span; i++) { const t = hx.neighborOf(q, r, dir); q = t.q; r = t.r; }
  const A = hx.tileCenter(piece.q, piece.r, C.R);
  const B = hx.tileCenter(q, r, C.R);
  const y = piece.h * C.H;
  let ux = B.x - A.x, uz = B.z - A.z;
  const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
  const yaw = Math.atan2(ux, uz);

  if (piece.type === 'cannon') {
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(C.R * 0.30, C.R * 0.36, 0.012, 12),
      new THREE.MeshStandardMaterial({ color: 0x3a2a5a, roughness: 0.6 })
    );
    mount.position.set(A.x, y + 0.006, A.z);
    g.add(mount);
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.014, 0.055, 14, 1, true),
      new THREE.MeshStandardMaterial({
        color: COLOR.cannon, emissive: 0x8a1f1f, emissiveIntensity: 0.55,
        side: THREE.DoubleSide, roughness: 0.3, metalness: 0.6,
      })
    );
    // 포신을 발사각(45°)으로 눕혀 착지대 방향으로 조준
    barrel.position.set(A.x + ux * 0.012, y + 0.028, A.z + uz * 0.012);
    barrel.rotation.order = 'YXZ';
    barrel.rotation.y = yaw;
    barrel.rotation.x = spec.angle;
    barrel.castShadow = true;
    g.add(barrel);
  } else {
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(C.R * 0.5, 0.0035, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x2a3568, roughness: 0.6 })
    );
    frame.rotation.x = Math.PI / 2;
    frame.position.set(A.x, y + 0.010, A.z);
    g.add(frame);
    const mat = new THREE.Mesh(
      new THREE.CircleGeometry(C.R * 0.5, 24),
      new THREE.MeshStandardMaterial({
        color: COLOR.tramp, emissive: 0x1f8a4a, emissiveIntensity: 0.5,
        side: THREE.DoubleSide, roughness: 0.5, transparent: true, opacity: 0.85,
      })
    );
    mat.rotation.x = -Math.PI / 2;
    mat.position.set(A.x, y + 0.010, A.z);
    g.add(mat);
  }

  // 착지대: 깔때기
  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(C.R * 0.82, C.R * 0.30, 0.026, 20, 1, true),
    new THREE.MeshStandardMaterial({
      color: COLOR.catcher, emissive: 0x4a2fb8, emissiveIntensity: 0.5,
      side: THREE.DoubleSide, roughness: 0.35,
    })
  );
  funnel.position.set(B.x, y + 0.013, B.z);
  g.add(funnel);
  // 백보드(뒷벽): 오버슛을 받아내는 판
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(C.R * 1.35, spec.wallH, 0.005),
    new THREE.MeshStandardMaterial({
      color: 0xffd35c, emissive: 0x8a5200, emissiveIntensity: 0.45, roughness: 0.4, metalness: 0.3,
    })
  );
  wall.position.set(B.x + ux * spec.wallR, y + spec.wallH / 2 + 0.004, B.z + uz * spec.wallR);
  wall.rotation.y = yaw + Math.PI / 2;
  wall.castShadow = true;
  g.add(wall);
  return g;
}

/* 설계 조준 궤적: 얇은 점선 아크 (실제 비행은 물리가 결정) */
function makeAimArc(pts) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x8a93c8, transparent: true, opacity: 0.30 });
  const geo = new THREE.SphereGeometry(0.0022, 6, 4);
  for (let i = 0; i < pts.length; i += 2) {
    const d = new THREE.Mesh(geo, mat);
    d.position.set(pts[i].x, pts[i].y, pts[i].z);
    g.add(d);
  }
  return g;
}

/* 자이로 중앙 기둥 */
function makeGyroPole(piece, C, hx) {
  const c = hx.tileCenter(piece.q, piece.r, C.R);
  const y0 = piece.h * C.H;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.008, 2 * C.H + 0.02, 10),
    new THREE.MeshStandardMaterial({ color: 0x7c5cff, emissive: 0x35208f, emissiveIntensity: 0.5, roughness: 0.4 })
  );
  pole.position.set(c.x, y0 + C.H + 0.01, c.z);
  pole.castShadow = true;
  return pole;
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

/* 다음 부품이 놓일 자리 마커: 발광 육각 링 (초록=가능 / 빨강=막힘) */
export function makeSlotMarker(C) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(C.R * 0.8, 0.004, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0x4dff88, transparent: true, opacity: 0.9 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI / 6;
  ring.visible = false;
  return ring;
}
export function updateSlotMarker(marker, C, next, exitH, time) {
  if (!next) { marker.visible = false; return; }
  const NS = window.MarbleSim;
  const c = NS.hexgrid.tileCenter(next.q, next.r, C.R);
  marker.position.set(c.x, exitH * C.H + 0.012, c.z);
  marker.material.color.setHex(next.blocked ? 0xff5c5c : 0x4dff88);
  const pulse = 0.72 + 0.28 * Math.sin(time * 5);
  marker.material.opacity = pulse;
  marker.scale.setScalar(0.94 + 0.06 * Math.sin(time * 5));
  marker.visible = true;
}

/* 고스트 구슬: 건설 중 상시 미리보기용 반투명 구슬 */
export function makeGhostMarble(C) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(C.MR, 20, 14),
    new THREE.MeshStandardMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.38, roughness: 0.2, depthWrite: false })
  );
  m.visible = false;
  return m;
}

export { COLOR, THREE };
