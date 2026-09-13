/* 🎯 사격 게임장 · 3D 무대 v2 — 밤의 축제 부스, 스타일라이즈드 리얼
 * ACES 톤매핑 + 환경맵(PMREM) + 나무 결·캔버스 천·금속 캔 / 목재 카운터·차양·전구 스트링·상품 선반
 * 새총(굵은 고무줄·가죽 주머니·쇠구슬), 멀리 축제 불빛·천막·관람차 실루엣, 카메라(부스/공 추적/셰이크)
 * 외부 계약(불변): createStage/buildBooth/buildSlingshot/makeCan/makeBalloon/makeDuck/makeTarget/createDirector */
'use strict';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ---------- 절차 텍스처 ---------- */
let _s = 20260913;
const rnd = () => (_s = (_s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
function canvasTex(w, h, draw, opt = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = opt.repeat ? 1 : 8;
  t.colorSpace = opt.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (opt.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opt.repeat[0], opt.repeat[1]); }
  return t;
}
/* 나무 결 — 색·거칠기 한 쌍 */
function woodTex(base = '#8b5a2b', dark = '#5a3617', light = '#b07a45', size = 512) {
  const color = canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = rnd() * h, amp = 6 + rnd() * 18, th = 1 + rnd() * 3;
      ctx.strokeStyle = rnd() < 0.5 ? dark : light; ctx.globalAlpha = 0.10 + rnd() * 0.18; ctx.lineWidth = th;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, y + Math.sin(x / 90 + i) * amp * 0.25 + Math.sin(x / 23 + i * 3) * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.08; ctx.fillStyle = '#000';
    for (let i = 0; i < 6; i++) { const x = rnd() * w, y = rnd() * h; ctx.beginPath(); ctx.ellipse(x, y, 4 + rnd() * 8, 2 + rnd() * 4, 0, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }, { repeat: [1, 1] });
  const rough = canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = '#9a9a9a'; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 400; i++) { ctx.fillStyle = rnd() < 0.5 ? '#fff' : '#555'; ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 40, 1 + rnd() * 2); }
  }, { linear: true, repeat: [1, 1] });
  return { color, rough };
}
/* 캔버스 천 — 짜임 + 주름 명암 */
function clothTex(hex, folds = 0, size = 512) {
  return canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = hex; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.035;
    for (let x = 0; x < w; x += 3) { ctx.fillStyle = (x / 3) % 2 ? '#fff' : '#000'; ctx.fillRect(x, 0, 1, h); }
    for (let y = 0; y < h; y += 3) { ctx.fillStyle = (y / 3) % 2 ? '#fff' : '#000'; ctx.fillRect(0, y, w, 1); }
    if (folds) {
      for (let i = 0; i < folds; i++) {
        const x = (i + 0.5) * (w / folds);
        const g = ctx.createLinearGradient(x - w / folds / 2, 0, x + w / folds / 2, 0);
        g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(0.45, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - w / folds / 2, 0, w / folds, h);
      }
    }
    ctx.globalAlpha = 1;
  }, { repeat: [1, 1] });
}
/* 아스팔트 바닥 */
function asphaltTex() {
  /* 색만 쓴다 — roughnessMap 은 소프트웨어 GL 에서 삼각형 얼룩을 만들어 뺐다(2026-09-13 헤드리스 검증) */
  const color = canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#1b1c26'; ctx.fillRect(0, 0, w, h);
    /* 굵은 골재 */
    for (let i = 0; i < 26000; i++) {
      const v = rnd(); ctx.fillStyle = v < 0.45 ? 'rgba(255,255,255,.10)' : v < 0.7 ? 'rgba(120,130,170,.14)' : 'rgba(0,0,0,.42)';
      const sz = 1 + rnd() * 2.4; ctx.fillRect(rnd() * w, rnd() * h, sz, sz);
    }
    /* 젖은 웅덩이 얼룩 — 살짝 밝고 푸르게 */
    for (let i = 0; i < 22; i++) {
      const x = rnd() * w, y = rnd() * h, r = 40 + rnd() * 140;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(70,80,120,.22)'); g.addColorStop(0.7, 'rgba(70,80,120,.08)'); g.addColorStop(1, 'rgba(70,80,120,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    /* 그늘진 얼룩 */
    for (let i = 0; i < 30; i++) { const x = rnd() * w, y = rnd() * h, r = 30 + rnd() * 90; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
    /* 가는 균열 */
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 14; i++) {
      let x = rnd() * w, y = rnd() * h; ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 12; k++) { x += (rnd() - 0.5) * 60; y += (rnd() - 0.5) * 60; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }, { repeat: [10, 10] });
  return { color };
}
function glowSprite(hex, size, opacity = 0.9) {
  const tex = canvasTex(64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, hex); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.set(size, size, 1);
  return sp;
}

/* ---------- 무대 ---------- */
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  /* 하늘 — 남색에서 지평선 근처 보랏빛 노을 */
  scene.background = canvasTex(4, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05071a'); g.addColorStop(0.55, '#0c1030'); g.addColorStop(0.82, '#2a1b4a'); g.addColorStop(1, '#4a2a4a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  scene.fog = new THREE.Fog(0x120f2a, 12, 46);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;

  scene.add(new THREE.HemisphereLight(0x4a5da8, 0x2a1a10, 0.32));
  const key = new THREE.DirectionalLight(0xffe2bd, 1.5);
  key.position.set(2.6, 6.5, 5.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const S = 5;
  key.shadow.camera.left = -S; key.shadow.camera.right = S;
  key.shadow.camera.top = S; key.shadow.camera.bottom = -S;
  key.shadow.camera.near = 1; key.shadow.camera.far = 20; key.shadow.bias = -0.0002; key.shadow.normalBias = 0.03; key.shadow.radius = 3;
  scene.add(key);
  /* 부스 안 조명 — 카운터를 따뜻하게 비추는 스포트 */
  const spot = new THREE.SpotLight(0xffc48a, 60, 9, 0.62, 0.55, 1.4);
  spot.position.set(0, 3.2, 1.6); spot.target.position.set(0, 0, -0.2);
  scene.add(spot, spot.target);
  /* 뒤에서 오는 차가운 림 */
  const rim = new THREE.DirectionalLight(0x6a86ff, 0.5); rim.position.set(-4, 3.5, -7); scene.add(rim);

  /* 별 */
  const pos = [];
  for (let i = 0; i < 700; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 0.85);
    pos.push(30 * Math.sin(ph) * Math.cos(th), 30 * Math.cos(ph) + 1, 30 * Math.sin(ph) * Math.sin(th));
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.05, transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true });
  scene.add(new THREE.Points(starGeo, starMat));

  /* 바닥 — 젖은 아스팔트 */
  const at = asphaltTex();
  /* 60m 평면을 삼각형 2개로 그리면 소프트웨어 GL 에서 삼각형마다 밉 단계가 달라져 얼룩이 생긴다 → 잘게 나눈다 */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 48, 48),
    new THREE.MeshStandardMaterial({ map: at.color, color: 0x565a6e, roughness: 0.66, metalness: 0.03, envMapIntensity: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5; ground.receiveShadow = false; scene.add(ground);
  /* 부스 앞 따뜻한 빛 웅덩이 */
  const pool = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), new THREE.MeshBasicMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35,
    map: canvasTex(256, 256, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,170,90,.55)'); g.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); })
  }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, -1.49, 1.5); scene.add(pool);

  /* 멀리 — 축제 천막 실루엣 + 불빛 보케 */
  const far = new THREE.Group();
  const tentMat = new THREE.MeshStandardMaterial({ color: 0x151a34, roughness: 1 });
  for (let i = 0; i < 9; i++) {
    const x = -20 + i * 5 + (rnd() - 0.5) * 2, z = -24 - rnd() * 8, hgt = 2.4 + rnd() * 2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6 + rnd(), hgt, 2.4), tentMat); body.position.set(x, -1.5 + hgt / 2, z);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.4, 4), tentMat); roof.rotation.y = Math.PI / 4; roof.position.set(x, -1.5 + hgt + 0.7, z);
    far.add(body, roof);
    const gl = glowSprite(['rgba(255,190,90,1)', 'rgba(255,120,120,1)', 'rgba(140,220,255,1)'][i % 3], 0.5 + rnd() * 0.5, 0.75);
    gl.position.set(x + (rnd() - 0.5) * 1.5, -1.5 + hgt * (0.4 + rnd() * 0.5), z + 1.3); far.add(gl);
  }
  /* 관람차 실루엣 */
  const wheel = new THREE.Group();
  const spoke = new THREE.MeshStandardMaterial({ color: 0x1a2040, roughness: 1 });
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.08, 8, 40), spoke));
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6.4, 6), spoke); s.rotation.z = i * Math.PI / 8; wheel.add(s);
    const cab = glowSprite(i % 2 ? 'rgba(255,200,120,1)' : 'rgba(120,200,255,1)', 0.7, 0.8);
    cab.position.set(Math.cos(i * Math.PI / 4) * 3.2, Math.sin(i * Math.PI / 4) * 3.2, 0.2); wheel.add(cab);
  }
  wheel.position.set(9, 3.0, -28); far.add(wheel);
  scene.add(far);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  return { renderer, scene, camera, resize, starMat, wheel };
}

/* ---------- 부스 ---------- */
export function buildBooth(scene) {
  const g = new THREE.Group();
  const wood = woodTex('#6a4a30', '#3e2a18', '#8c6640');
  const woodMat = new THREE.MeshStandardMaterial({ map: wood.color, roughnessMap: wood.rough, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.5 });
  const darkWood = woodTex('#4a3320', '#2a1b0e', '#634628');
  const darkWoodMat = new THREE.MeshStandardMaterial({ map: darkWood.color, roughnessMap: darkWood.rough, roughness: 0.7 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.2 });

  /* 뒷벽 — 짙은 자줏빛 캔버스 천, 주름 */
  const back = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.4, 1, 1),
    new THREE.MeshStandardMaterial({ map: clothTex('#2e1a33', 6), roughness: 0.96 }));
  back.position.set(0, 1.0, -1.05); back.receiveShadow = true; g.add(back);
  /* 옆벽 */
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 3.4), new THREE.MeshStandardMaterial({ map: clothTex('#281530', 3), roughness: 0.96, side: THREE.DoubleSide }));
    side.position.set(sx * 2.3, 1.0, -0.19); side.rotation.y = -sx * Math.PI / 2; side.receiveShadow = true; g.add(side);
  }

  /* 카운터 — 두꺼운 원목 상판 + 앞판 널빤지 + 황동 몰딩 */
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.13, 1.2), woodMat);
  top.position.set(0, -0.065, -0.075); top.castShadow = top.receiveShadow = true; g.add(top);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(3.82, 0.03, 0.04), brass);
  lip.position.set(0, 0.0, 0.53); g.add(lip);
  for (let i = 0; i < 12; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.36, 0.05), darkWoodMat);
    plank.position.set(-1.74 + i * 0.316, -0.82, 0.5); plank.rotation.y = (rnd() - 0.5) * 0.006;
    plank.castShadow = true; g.add(plank);
  }
  const backing = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.36, 0.04), darkWoodMat); backing.position.set(0, -0.82, 0.46); g.add(backing);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.08, 0.09), woodMat); rail.position.set(0, -1.46, 0.53); g.add(rail);
  /* 상판 위 — 캔이 올라가는 낮은 진열 판 */
  const riser = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.6), darkWoodMat);
  riser.position.set(0, -0.02, -0.15); riser.receiveShadow = true; g.add(riser);

  /* 기둥 4 + 상단 보 */
  const postGeo = new THREE.CylinderGeometry(0.075, 0.09, 3.8, 14);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(sx * 2.25, 0.4, sz > 0 ? 0.62 : -1.0); post.castShadow = true; g.add(post);
  }
  for (const z of [0.62, -1.0]) { const beam = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.12, 0.12), woodMat); beam.position.set(0, 2.3, z); beam.castShadow = true; g.add(beam); }
  for (const sx of [-1, 1]) { const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.75), woodMat); beam.position.set(sx * 2.25, 2.3, -0.19); g.add(beam); }

  /* 차양 — 늘어진 줄무늬 캔버스 + 물결 발란스 */
  const awnTex = canvasTex(512, 256, (ctx, w, h) => {
    const cols = ['#b83a3a', '#efe2c6'];
    for (let x = 0, i = 0; x < w; x += 64, i++) { ctx.fillStyle = cols[i % 2]; ctx.fillRect(x, 0, 64, h); }
    ctx.globalAlpha = 0.08; for (let x = 0; x < w; x += 3) { ctx.fillStyle = (x / 3) % 2 ? '#fff' : '#000'; ctx.fillRect(x, 0, 1, h); }
    ctx.globalAlpha = 1;
    const g2 = ctx.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, 'rgba(0,0,0,.25)'); g2.addColorStop(0.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,.2)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
  }, { repeat: [1, 1] });
  const awnMat = new THREE.MeshStandardMaterial({ map: awnTex, roughness: 0.9, side: THREE.DoubleSide });
  const awning = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.0, 30, 10), awnMat);
  {
    const p = awning.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const t = (y + 1) / 2;                                   // 0 뒤 → 1 앞
      const sag = Math.sin(((x + 2.45) / 4.9) * Math.PI * 5) * 0.045 * t;
      p.setZ(i, -Math.pow(t, 1.4) * 0.55 + sag);
    }
    awning.geometry.computeVertexNormals();
  }
  awning.rotation.x = -Math.PI / 2 + 0.55; awning.position.set(0, 2.62, 0.2); awning.castShadow = true; g.add(awning);
  const valance = new THREE.Shape();
  valance.moveTo(-2.45, 0);
  for (let i = 0; i < 10; i++) { const x0 = -2.45 + i * 0.49; valance.absarc(x0 + 0.245, 0, 0.245, Math.PI, 0, true); }
  valance.lineTo(2.45, 0.22); valance.lineTo(-2.45, 0.22); valance.closePath();
  const val = new THREE.Mesh(new THREE.ShapeGeometry(valance, 12), awnMat);
  val.position.set(0, 2.14, 1.14); g.add(val);

  /* 간판 — 나무판에 손글씨 페인트 + 황동 못 */
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.62, 0.06), new THREE.MeshStandardMaterial({
    roughness: 0.75, map: canvasTex(768, 176, (ctx, w, h) => {
      ctx.fillStyle = '#2b1a12'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) { ctx.strokeStyle = rnd() < 0.5 ? '#1c100a' : '#3d2618'; ctx.globalAlpha = 0.35; ctx.lineWidth = 1 + rnd() * 2; ctx.beginPath(); const y = rnd() * h; ctx.moveTo(0, y); ctx.lineTo(w, y + (rnd() - 0.5) * 6); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.strokeStyle = '#d9b25a'; ctx.lineWidth = 5; ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 96px "Noto Serif KR", "Nanum Myeongjo", serif'; ctx.fillStyle = '#f2d98a';
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
      ctx.fillText('사 격 장', w / 2, h / 2 + 4);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.font = '700 26px sans-serif'; ctx.fillStyle = '#e0c27a';
      ctx.fillText('SHOOTING GALLERY', w / 2, h - 30);
    })
  }));
  sign.position.set(0, 2.78, 0.75); sign.scale.setScalar(0.88); sign.castShadow = true; g.add(sign);
  for (const sx of [-1.2, 1.2]) { const nail = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), brass); nail.position.set(sx * 0.88, 2.97, 0.79); g.add(nail); }
  /* 간판 조명 2 */
  for (const sx of [-0.8, 0.8]) {
    const lamp = new THREE.PointLight(0xffd9a0, 6, 2.6, 1.6); lamp.position.set(sx, 3.2, 1.1); g.add(lamp);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide }));
    shade.position.set(sx, 3.27, 1.1); shade.rotation.x = 0.5; g.add(shade);
  }

  /* 전구 스트링 — 늘어진 케이블 + 따뜻한 필라멘트 전구 + 은은한 글로우 */
  const bulbs = [];
  const pts = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24, x = -2.3 + t * 4.6; pts.push(new THREE.Vector3(x, 2.1 - Math.sin(t * Math.PI) * 0.22, 1.2)); }
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.008, 6, false), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
  g.add(cable);
  const bulbGeo = new THREE.SphereGeometry(0.038, 12, 10);
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffc677, emissive: 0xffa640, emissiveIntensity: 2.6, roughness: 0.2, metalness: 0.0 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.7, roughness: 0.5 });
  for (let i = 0; i < 11; i++) {
    const t = (i + 0.5) / 11, x = -2.3 + t * 4.6, y = 2.1 - Math.sin(t * Math.PI) * 0.22 - 0.06;
    const m = new THREE.Mesh(bulbGeo, bulbMat); m.position.set(x, y - 0.03, 1.2);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.04, 8), capMat); cap.position.set(x, y + 0.02, 1.2);
    const gl = glowSprite('rgba(255,170,80,1)', 0.26, 0.55); gl.position.copy(m.position);
    g.add(m, cap, gl); bulbs.push(m);
  }
  for (const x of [-1.5, 0, 1.5]) { const pl = new THREE.PointLight(0xffb060, 3.5, 3.2, 1.8); pl.position.set(x, 1.9, 1.2); g.add(pl); }

  /* 상품 선반 — 뒤쪽 위, 곰인형·상자 */
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.05, 0.36), woodMat);
  shelf.position.set(0, 1.62, -0.85); shelf.castShadow = shelf.receiveShadow = true; g.add(shelf);
  for (const sx of [-2.0, -0.7, 0.7, 2.0]) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.3), darkWoodMat); br.position.set(sx, 1.5, -0.87); g.add(br); }
  const plush = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 1, metalness: 0 });
  function bear(hex, x) {
    const b = new THREE.Group(), m = plush(hex);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), m); body.scale.set(1, 1.1, 0.9);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), m); head.position.y = 0.24;
    const earG = new THREE.SphereGeometry(0.045, 10, 8);
    const e1 = new THREE.Mesh(earG, m); e1.position.set(-0.09, 0.33, 0); const e2 = e1.clone(); e2.position.x = 0.09;
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), plush(0xf1dcc0)); muzzle.position.set(0, 0.21, 0.1);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), plush(0x221a16)); nose.position.set(0, 0.225, 0.148);
    const eyeG = new THREE.SphereGeometry(0.014, 8, 6);
    const y1 = new THREE.Mesh(eyeG, plush(0x1a1412)); y1.position.set(-0.045, 0.27, 0.1); const y2 = y1.clone(); y2.position.x = 0.045;
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), m); arm.position.set(-0.16, 0.05, 0.03); const arm2 = arm.clone(); arm2.position.x = 0.16;
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), m); leg.position.set(-0.1, -0.15, 0.06); const leg2 = leg.clone(); leg2.position.x = 0.1;
    b.add(body, head, e1, e2, muzzle, nose, y1, y2, arm, arm2, leg, leg2);
    b.traverse(o => { if (o.isMesh) o.castShadow = true; });
    b.position.set(x, 1.82, -0.85); b.rotation.y = (rnd() - 0.5) * 0.6;
    return b;
  }
  g.add(bear(0xb9834f, -1.75), bear(0xd9d2c8, -1.15), bear(0x8d5f8f, 1.2), bear(0xb9834f, 1.8));
  for (const [x, hex] of [[-0.35, 0x2f5fb3], [0.35, 0xc93b4a]]) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.24), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.55 }));
    box.position.set(x, 1.78, -0.85); box.castShadow = true; g.add(box);
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.05), new THREE.MeshStandardMaterial({ color: 0xf2d98a, roughness: 0.4 }));
    ribbon.position.copy(box.position); g.add(ribbon);
  }
  scene.add(g);
  return { group: g, bulbs };
}

/* ---------- 새총 ---------- */
export const ballMaterial = () => new THREE.MeshStandardMaterial({ color: 0xd5d8de, metalness: 1.0, roughness: 0.22, envMapIntensity: 1.3 });
export function buildSlingshot(scene, MUZZLE) {
  const g = new THREE.Group();
  const wood = woodTex('#6e4423', '#3f2410', '#96633a', 256);
  const woodMat = new THREE.MeshStandardMaterial({ map: wood.color, roughnessMap: wood.rough, roughness: 0.55 });
  /* 손잡이 + 갈라지는 가지 — 굽은 튜브 */
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02, -0.6, 0.03), new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, -0.1, 0)]);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 12, 0.05, 12, false), woodMat);
  const forkL = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(-0.09, 0.0, 0.01), new THREE.Vector3(-0.17, 0.14, 0)]), 12, 0.036, 10, false), woodMat);
  const forkR = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(0.09, 0.0, -0.01), new THREE.Vector3(0.17, 0.14, 0)]), 12, 0.036, 10, false), woodMat);
  const capGeo = new THREE.SphereGeometry(0.036, 10, 8);
  const capL = new THREE.Mesh(capGeo, woodMat); capL.position.set(-0.17, 0.14, 0); const capR = capL.clone(); capR.position.x = 0.17;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.058, 0.26, 12), new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.85 }));
  grip.position.set(0.01, -0.47, 0.015); grip.rotation.x = 0.06;
  /* 가지에 감은 고무줄 매듭 */
  const wrapMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7 });
  const wrapL = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 8, 16), wrapMat); wrapL.position.set(-0.165, 0.11, 0); wrapL.rotation.x = Math.PI / 2 - 0.4;
  const wrapR = wrapL.clone(); wrapR.position.x = 0.165; wrapR.rotation.x = Math.PI / 2 + 0.4;
  [stem, forkL, forkR, capL, capR, grip].forEach(m => m.castShadow = true);
  g.add(stem, forkL, forkR, capL, capR, grip, wrapL, wrapR);
  g.position.set(MUZZLE[0], MUZZLE[1], MUZZLE[2]);

  const tipL = new THREE.Vector3(-0.165, 0.11, 0), tipR = new THREE.Vector3(0.165, 0.11, 0);
  /* 고무줄 — 굵기 있는 튜브 (당기면 가늘어진다) */
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xc9a86b, roughness: 0.75, metalness: 0 });
  let bandL = new THREE.Mesh(new THREE.BufferGeometry(), bandMat), bandR = new THREE.Mesh(new THREE.BufferGeometry(), bandMat);
  g.add(bandL, bandR);
  /* 가죽 주머니 + 쇠구슬 */
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 8, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.42),
    new THREE.MeshStandardMaterial({ color: 0x4a2e1c, roughness: 0.9, side: THREE.DoubleSide }));
  pouch.scale.set(1.1, 0.8, 1.35);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 18), ballMaterial());
  ball.castShadow = true;
  g.add(pouch, ball);

  function setPull(pull) {
    const p = new THREE.Vector3(pull.x, 0.1 + pull.y, pull.z);
    pouch.position.copy(p); ball.position.copy(p).add(new THREE.Vector3(0, 0.03, 0));
    const stretch = 1 + p.distanceTo(tipL) * 1.4;
    const r = 0.014 / Math.sqrt(stretch);
    const mk = (a, b) => new THREE.TubeGeometry(new THREE.LineCurve3(a, b.clone().add(new THREE.Vector3(0, 0.02, 0))), 1, r, 7, false);
    bandL.geometry.dispose(); bandR.geometry.dispose();
    bandL.geometry = mk(tipL, p); bandR.geometry = mk(tipR, p);
  }
  setPull({ x: 0, y: 0, z: 0 });
  scene.add(g);
  return { group: g, setPull, ball, showBall: v => { ball.visible = v; pouch.visible = v; } };
}

/* ---------- 표적 메쉬 ---------- */
function labelTex(gold) {
  return canvasTex(512, 256, (ctx, w, h) => {
    if (gold) {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#1b1f3a'); g.addColorStop(0.5, '#262b52'); g.addColorStop(1, '#1b1f3a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e8c15a'; ctx.lineWidth = 6; ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f2d27a'; ctx.font = '900 84px "Noto Serif KR", serif'; ctx.fillText('金', w / 2, h / 2 - 8);
      ctx.font = '700 26px sans-serif'; ctx.fillStyle = '#e8c15a'; ctx.fillText('★ GOLD CAN ★', w / 2, h - 44);
    } else {
      ctx.fillStyle = '#c8232f'; ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(0.3, 'rgba(255,255,255,.06)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f7efe0';
      ctx.beginPath(); ctx.moveTo(0, h * 0.30); ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.7, h * 0.44, w, h * 0.34); ctx.lineTo(w, h * 0.68); ctx.bezierCurveTo(w * 0.7, h * 0.78, w * 0.3, h * 0.56, 0, h * 0.64); ctx.closePath(); ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#b01a26'; ctx.font = 'italic 900 64px "Georgia", serif'; ctx.fillText('K·Cola', w / 2, h / 2 + 4);
      ctx.fillStyle = '#f7efe0'; ctx.font = '700 20px sans-serif'; ctx.fillText('SINCE 2026 · 355ml', w / 2, h - 26);
      ctx.fillStyle = '#f7efe0'; for (let i = 0; i < 18; i++) ctx.fillRect(w - 60 + i * 2.6, 20, i % 3 ? 1 : 2, 22);
    }
  });
}
export function makeCan(gold, R, H) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: gold ? 0xd8b25a : 0xcfd3da, metalness: 1.0, roughness: gold ? 0.3 : 0.32, envMapIntensity: 1.1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.995, R * 0.995, H, 36, 1, true), bodyMat);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H * 0.74, 36, 1, true),
    new THREE.MeshStandardMaterial({ map: labelTex(gold), roughness: 0.6, metalness: 0.05 }));
  const rimGeo = new THREE.TorusGeometry(R * 0.93, R * 0.07, 8, 36);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xb9bec7, metalness: 1, roughness: 0.28, envMapIntensity: 1.2 });
  const rimT = new THREE.Mesh(rimGeo, rimMat); rimT.rotation.x = Math.PI / 2; rimT.position.y = H / 2 - R * 0.05;
  const rimB = rimT.clone(); rimB.position.y = -H / 2 + R * 0.05;
  const capMat = new THREE.MeshStandardMaterial({ color: 0xa9aeb8, metalness: 1, roughness: 0.4 });
  const capT = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 36), capMat); capT.rotation.x = -Math.PI / 2; capT.position.y = H / 2 - R * 0.09;
  const capB = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 36), capMat); capB.rotation.x = Math.PI / 2; capB.position.y = -H / 2 + R * 0.09;
  const tab = new THREE.Mesh(new THREE.TorusGeometry(R * 0.2, R * 0.03, 6, 14), rimMat); tab.rotation.x = Math.PI / 2; tab.position.set(R * 0.15, H / 2 - R * 0.07, 0);
  const neckT = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.93, R * 0.995, R * 0.12, 36, 1, true), bodyMat); neckT.position.y = H / 2 - R * 0.06;
  const neckB = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.995, R * 0.93, R * 0.12, 36, 1, true), bodyMat); neckB.position.y = -H / 2 + R * 0.06;
  g.add(body, label, rimT, rimB, capT, capB, tab, neckT, neckB);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
export function makeBalloon(colorHex) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 28, 20),
    new THREE.MeshPhysicalMaterial({ color: colorHex, roughness: 0.18, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.2, sheen: 0.4, sheenColor: new THREE.Color(0xffffff) }));
  b.scale.y = 1.16; b.castShadow = true;
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, 10), new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 }));
  knot.position.y = -0.245; knot.rotation.x = Math.PI;
  const string = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.27, 0), new THREE.Vector3(0.02, -0.5, 0.01), new THREE.Vector3(0.03, -0.78, 0)]), 8, 0.004, 5, false),
    new THREE.MeshStandardMaterial({ color: 0xe6e9f5, roughness: 0.8 }));
  g.add(b, knot, string);
  return g;
}
export function makeDuck() {
  const g = new THREE.Group();
  const yellow = new THREE.MeshPhysicalMaterial({ color: 0xffcf3a, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.25, envMapIntensity: 0.9 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 22, 16), yellow); body.scale.set(1.2, 0.85, 1);
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), yellow); tail.position.set(-0.13, 0.05, 0); tail.scale.set(1.2, 0.8, 0.8);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 14), yellow); head.position.set(0.09, 0.15, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xff8a3c, roughness: 0.45 }));
  beak.position.set(0.19, 0.135, 0); beak.rotation.z = -Math.PI / 2; beak.scale.y = 0.7;
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 }));
  eye.position.set(0.135, 0.19, 0.06); const eye2 = eye.clone(); eye2.position.z = -0.06;
  [body, tail, head, beak].forEach(m => m.castShadow = true);
  g.add(body, tail, head, beak, eye, eye2);
  return g;
}
export function makeTarget(r) {
  const face = canvasTex(512, 512, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2;
    const rings = ['#e9dcc0', '#c23a3a', '#e9dcc0', '#c23a3a', '#e8c15a'];
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cx, cy, (w / 2) * (1 - i * 0.19), 0, Math.PI * 2); ctx.fillStyle = rings[i]; ctx.fill(); }
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.07, 0, Math.PI * 2); ctx.fillStyle = '#c23a3a'; ctx.fill();
    ctx.globalAlpha = 0.22; for (let i = 0; i < 1400; i++) { ctx.fillStyle = rnd() < 0.5 ? '#000' : '#fff'; ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#2b1a12'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cx, cy, (w / 2) * (1 - i * 0.19), 0, Math.PI * 2); ctx.stroke(); }
  });
  const wood = woodTex('#7d4d25', '#4a2c12', '#a2673a', 256);
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 40),
    [new THREE.MeshStandardMaterial({ map: wood.color, roughness: 0.7 }),
     new THREE.MeshStandardMaterial({ map: face, roughness: 0.6 }),
     new THREE.MeshStandardMaterial({ map: wood.color, roughness: 0.7 })]);
  disc.rotation.x = Math.PI / 2; disc.castShadow = true;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a8f9a, metalness: 0.9, roughness: 0.35 }));
  arm.position.y = -r - 0.2;
  g.add(disc, arm);
  g.userData.disc = disc;
  return g;
}

/* ---------- 카메라 ---------- */
export function createDirector(camera, canvas) {
  const st = {
    look: new THREE.Vector3(0, 0.8, -0.2), pos: new THREE.Vector3(0, 1.55, 7.0),
    tLook: new THREE.Vector3(0, 0.8, -0.2), tPos: new THREE.Vector3(0, 1.55, 7.0),
    shakeAmt: 0, drift: 0, userX: 0
  };
  const api = {
    booth() { st.tPos.set(st.userX * 0.6, 1.55, 7.0); st.tLook.set(st.userX * 0.25, 0.8, -0.2); },
    aim() { st.tPos.set(st.userX * 0.6, 1.3, 6.4); st.tLook.set(st.userX * 0.25, 0.6, -0.2); },
    follow(p) {
      st.tPos.set(p.x * 0.5, Math.max(1.0, p.y + 0.5), p.z + 2.6);
      st.tLook.set(p.x, p.y, p.z - 0.5);
    },
    shake(a) { st.shakeAmt = Math.min(0.16, st.shakeAmt + a); },
    update(dt) {
      st.drift += dt;
      const k = 1 - Math.pow(0.002, dt);
      st.pos.lerp(st.tPos, k); st.look.lerp(st.tLook, k);
      const sh = st.shakeAmt;
      st.shakeAmt = Math.max(0, st.shakeAmt - dt * 0.55);
      const ox = (Math.random() - 0.5) * sh, oy = (Math.random() - 0.5) * sh;
      camera.position.set(st.pos.x + ox + Math.sin(st.drift * 0.13) * 0.035, st.pos.y + oy + Math.sin(st.drift * 0.21) * 0.015, st.pos.z);
      camera.lookAt(st.look);
    },
    setUserX(v) { st.userX = Math.max(-1, Math.min(1, v)); },
    _st: st
  };
  return api;
}
