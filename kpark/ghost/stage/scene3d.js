/* 🏚️ 유령의 집 · 3D 무대 — 밤의 저택 실내
 * 어두운 방(마루·벽지·달빛 창), 방마다 다른 가구 실루엣, 수줍은 유령(치마가 하늘하늘),
 * 손전등(스포트라이트 + 빛 원뿔 + 벽의 빛 원), 먼지 티끌. 무섭지 않게 — 다정한 어둠. */
'use strict';
import * as THREE from 'three';

const ROOM = { W: 5.2, H: 3.0, D: 4.2 };   // 방 안 치수 (뒷벽 z=-2.1)
export const PLANE_Z = -1.2;               // 손전등 조준 평면 (core 좌표평면)

function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- 무대 뼈대 ---------- */
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060f);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 40);
  camera.position.set(0, 1.4, 3.4);
  camera.lookAt(0, 1.4, PLANE_Z);   // 수평 시선 — 입력 매핑이 단순해진다

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  return { renderer, scene, camera, resize };
}

/* ---------- 방 짓기 ---------- */
export function buildRoom(scene, roomId) {
  const g = new THREE.Group();
  const { W, H, D } = ROOM;

  /* 마루 */
  const floorTex = canvasTex(512, 512, (c) => {
    c.fillStyle = '#241a16'; c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? '#2a1f1a' : '#221813';
      c.fillRect(0, i * 64, 512, 62);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, i * 64 + 62, 512, 2);
    }
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  g.add(floor);

  /* 벽지 (은은한 다마스크 점무늬) */
  const wallTex = canvasTex(256, 256, (c) => {
    c.fillStyle = '#191a2e'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = 'rgba(120,130,200,.08)';
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      c.beginPath(); c.arc(x * 64 + (y % 2 ? 32 : 0) + 16, y * 64 + 16, 10, 0, 7); c.fill();
    }
  });
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping; wallTex.repeat.set(3, 2);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
  back.position.set(0, H / 2, -D / 2); back.receiveShadow = true; g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
  left.rotation.y = Math.PI / 2; left.position.set(-W / 2, H / 2, 0); left.receiveShadow = true; g.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
  right.rotation.y = -Math.PI / 2; right.position.set(W / 2, H / 2, 0); right.receiveShadow = true; g.add(right);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({ color: 0x0d0e1c, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; g.add(ceil);

  /* 달빛 창 (왼벽) */
  const winG = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2),
    new THREE.MeshBasicMaterial({ color: 0xbfd2ff, transparent: true, opacity: 0.55 }));
  winG.add(frame);
  const barM = new THREE.MeshBasicMaterial({ color: 0x0a0b18 });
  const bv = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 1.2), barM); bv.position.z = 0.001; winG.add(bv);
  const bh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.06), barM); bh.position.z = 0.001; winG.add(bh);
  winG.rotation.y = Math.PI / 2; winG.position.set(-W / 2 + 0.01, 1.7, -0.6);
  g.add(winG);
  const moon = new THREE.DirectionalLight(0x9fb4ff, 0.35);
  moon.position.set(-3.5, 2.6, 0.2); moon.target.position.set(1.2, 0.2, -1);
  g.add(moon, moon.target);

  /* 은은한 바닥광 (완전 암전 방지) */
  g.add(new THREE.HemisphereLight(0x2a3160, 0x160f12, 0.5));

  /* 가구 실루엣 — 방마다 */
  const dark = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
  const box = (w, h, d, x, y, z, m) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || dark(0x1b1420));
    b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b;
  };
  const shelfTex = canvasTex(128, 256, (c) => {
    c.fillStyle = '#1d1526'; c.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 5; i++) {
      c.fillStyle = '#120d18'; c.fillRect(8, 14 + i * 48, 112, 34);
      for (let b = 0; b < 6; b++) {
        c.fillStyle = ['#3d2b4f', '#2b3d4f', '#4f3d2b', '#33244a'][((i * 7 + b * 3) % 4)];
        c.fillRect(12 + b * 18, 18 + i * 48, 13, 30);
      }
    }
  });
  if (roomId === 'lobby') {
    box(1.6, 0.55, 0.7, -1.1, 0.28, -1.5);                       // 소파
    box(1.6, 0.5, 0.16, -1.1, 0.75, -1.85);
    box(0.5, 0.9, 0.5, 1.3, 0.45, -1.5);                          // 협탁
    const lamp = box(0.08, 0.9, 0.08, 1.3, 1.3, -1.5);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.3, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x5a4a2a, roughness: 0.8, side: THREE.DoubleSide }));
    shade.position.set(1.3, 1.85, -1.5); g.add(shade);
  } else if (roomId === 'study') {
    box(1.1, 2.3, 0.35, -1.6, 1.15, -1.9, new THREE.MeshStandardMaterial({ map: shelfTex, roughness: 0.9 }));
    box(1.1, 2.3, 0.35, 1.6, 1.15, -1.9, new THREE.MeshStandardMaterial({ map: shelfTex, roughness: 0.9 }));
    box(1.3, 0.1, 0.7, 0, 0.75, -1.4); box(0.1, 0.75, 0.1, -0.55, 0.37, -1.4); box(0.1, 0.75, 0.1, 0.55, 0.37, -1.4); // 책상
    box(0.35, 0.26, 0.24, -0.2, 0.93, -1.45, dark(0x2b3d4f));    // 쌓인 책
    box(0.3, 0.2, 0.2, 0.25, 0.9, -1.35, dark(0x4f3d2b));
  } else if (roomId === 'kitchen') {
    box(3.6, 0.8, 0.6, 0, 0.4, -1.75);                            // 조리대
    const potM = new THREE.MeshStandardMaterial({ color: 0x3a3f52, roughness: 0.4, metalness: 0.7 });
    for (const [x, r] of [[-1.2, 0.2], [-0.4, 0.16], [0.5, 0.22], [1.3, 0.15]]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, r * 1.2, 14), potM);
      pot.position.set(x, 0.8 + r * 0.6, -1.7); pot.castShadow = true; g.add(pot);
    }
    box(0.9, 1.1, 0.3, 1.7, 2.0, -1.95, dark(0x241a2e));          // 찬장
    box(0.9, 1.1, 0.3, -1.7, 2.0, -1.95, dark(0x241a2e));
  } else if (roomId === 'attic') {
    /* 서까래 */
    for (const x of [-1.8, -0.6, 0.6, 1.8]) {
      const r = box(0.14, 0.14, ROOM.D, x, 2.8, 0, dark(0x2a1d16)); r.rotation.x = 0;
    }
    box(0.9, 0.7, 0.5, -1.5, 0.35, -1.5, dark(0x33261c));         // 궤짝
    box(0.7, 0.5, 0.4, -0.9, 0.25, -0.9, dark(0x2a1f16));
    const clock = box(0.5, 1.6, 0.3, 1.5, 0.8, -1.8, dark(0x3a2a1a)); // 괘종시계
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20),
      new THREE.MeshStandardMaterial({ color: 0xd8cfa8, roughness: 0.7 }));
    face.position.set(1.5, 1.3, -1.64); g.add(face);
  } else if (roomId === 'hall') {
    /* 샹들리에 */
    const ch = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x6a5420, roughness: 0.4, metalness: 0.8 }));
    ring.rotation.x = Math.PI / 2; ch.add(ring);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      const cd = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
      cd.position.set(Math.cos(a) * 0.4, 0.08, Math.sin(a) * 0.4); ch.add(cd);
    }
    ch.position.set(0, 2.55, -1.2); g.add(ch);
    const chLight = new THREE.PointLight(0xffb46a, 3, 5); chLight.position.set(0, 2.4, -1.2); g.add(chLight);
    box(0.5, 1.0, 0.5, -1.8, 0.5, -1.8, dark(0x241a2e));          // 기둥 받침
    box(0.5, 1.0, 0.5, 1.8, 0.5, -1.8, dark(0x241a2e));
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x3a1420, roughness: 1 }));
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.01, -0.4); g.add(carpet);
  }

  /* 먼지 티끌 */
  const dustN = 90, pos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    pos[i * 3] = (Math.random() - 0.5) * W;
    pos[i * 3 + 1] = Math.random() * H;
    pos[i * 3 + 2] = -Math.random() * D / 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0x9fb4ff, size: 0.014, transparent: true, opacity: 0.5, depthWrite: false
  }));
  g.add(dust);

  scene.add(g);
  return { group: g, dust };
}

/* ---------- 유령 ---------- */
export function makeGhost(big) {
  const s = big ? 1.7 : 1;
  const grp = new THREE.Group();

  /* 몸통 = 반구 + 하늘하늘 치마 (라테) */
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push(new THREE.Vector2(Math.sin(t * Math.PI * 0.5) * 0.16, 0.16 - t * 0.02));
  }
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    pts.push(new THREE.Vector2(0.16 - t * 0.02 + Math.sin(t * 9) * 0.008, 0.14 - t * 0.3));
  }
  const bodyGeo = new THREE.LatheGeometry(pts.reverse(), 24);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf2f5ff, roughness: 0.55, transparent: true, opacity: 0,
    emissive: 0x8fa6ff, emissiveIntensity: 0.25
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.08; grp.add(body);

  /* 눈·볼 (캔버스 스프라이트 — 항상 카메라를 본다) */
  const faceTex = canvasTex(128, 128, (c) => {
    c.fillStyle = '#1a1830';
    c.beginPath(); c.ellipse(42, 56, 9, 13, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(86, 56, 9, 13, 0, 0, 7); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(45, 51, 3, 0, 7); c.fill();
    c.beginPath(); c.arc(89, 51, 3, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,150,170,.55)';
    c.beginPath(); c.arc(30, 76, 8, 0, 7); c.fill();
    c.beginPath(); c.arc(98, 76, 8, 0, 7); c.fill();
    c.strokeStyle = '#1a1830'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.arc(64, 74, 9, 0.25 * Math.PI, 0.75 * Math.PI); c.stroke();
  });
  const face = new THREE.Sprite(new THREE.SpriteMaterial({ map: faceTex, transparent: true, opacity: 0 }));
  face.scale.setScalar(0.22); face.position.set(0, 0.13, 0.1); grp.add(face);

  /* 왕관 (대왕) */
  let crown = null;
  if (big) {
    crown = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.1, 5),
      new THREE.MeshStandardMaterial({ color: 0xffd35c, roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0, emissive: 0x5a4200, emissiveIntensity: 0.5 }));
    crown.position.y = 0.27; grp.add(crown);
  }

  grp.scale.setScalar(s);
  grp.visible = false;
  return {
    group: grp, bodyMat, faceMat: face.material, crownMat: crown ? crown.material : null,
    /* op: 0~1 등장도, lit: 빛 받는 중, t: 시간 */
    set(op, lit, t) {
      grp.visible = op > 0.02;
      bodyMat.opacity = op * 0.92;
      bodyMat.emissiveIntensity = lit ? 0.7 : 0.25;
      this.faceMat.opacity = op;
      if (this.crownMat) this.crownMat.opacity = op;
      body.rotation.y = Math.sin(t * 1.7) * 0.12;
      body.scale.y = 1 + Math.sin(t * 5.2) * 0.04;
      grp.position.y += 0;  // (y 흔들림은 index에서 pos 세팅 시 처리)
    }
  };
}

/* ---------- 손전등 ---------- */
export function makeFlashlight(scene, camera) {
  const spot = new THREE.SpotLight(0xfff2cf, 0, 12, 0.32, 0.55, 1.2);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  scene.add(spot, spot.target);

  /* 빛 원뿔 (반투명) */
  const coneGeo = new THREE.ConeGeometry(0.7, 5, 24, 1, true);
  coneGeo.translate(0, -2.5, 0); coneGeo.rotateX(-Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xffe9b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  scene.add(cone);

  /* 조준점 글로우 */
  const glowTex = canvasTex(128, 128, (c) => {
    const g2 = c.createRadialGradient(64, 64, 4, 64, 64, 62);
    g2.addColorStop(0, 'rgba(255,240,200,.9)');
    g2.addColorStop(0.5, 'rgba(255,220,150,.28)');
    g2.addColorStop(1, 'rgba(255,220,150,0)');
    c.fillStyle = g2; c.fillRect(0, 0, 128, 128);
  });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  glow.scale.setScalar(1.5);
  scene.add(glow);

  const from = new THREE.Vector3();
  return {
    spot, cone, glow,
    update(aim, on, batt) {
      const k = on ? (batt <= 0 ? 0 : 1) : 0;
      const flicker = batt < 0.22 && on ? (0.6 + Math.random() * 0.4) : 1;
      spot.intensity = 60 * k * flicker;
      coneMat.opacity = 0.075 * k * flicker;
      glow.material.opacity = 0.85 * k * flicker;
      if (!aim) return;
      from.copy(camera.position); from.y -= 0.25;
      spot.position.copy(from);
      spot.target.position.copy(aim);
      cone.position.copy(from);
      cone.lookAt(aim);
      const d = from.distanceTo(aim);
      cone.scale.set(1, 1, d / 5);
      glow.position.copy(aim);
    }
  };
}

/* ---------- 랜턴 (잡은 유령이 들어가는) ---------- */
export function makeLantern(scene) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.26, 10),
    new THREE.MeshStandardMaterial({ color: 0x2b3150, roughness: 0.5, metalness: 0.4 }));
  g.add(body);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xaef0c8 }));
  g.add(core);
  const glow = new THREE.PointLight(0x8fffc0, 1.4, 2.5);
  g.add(glow);
  g.position.set(1.35, 0.55, 2.2);
  scene.add(g);
  return { group: g, core, glow, pulse(t, n) { core.scale.setScalar(1 + Math.sin(t * 3) * 0.1); glow.intensity = 1.1 + n * 0.5 + Math.sin(t * 3) * 0.3; } };
}
