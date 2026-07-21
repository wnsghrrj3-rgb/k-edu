/* 🎯 사격 게임장 · 3D 무대 — 밤의 축제 부스
 * 스트라이프 차양+전구 스트링+네온 간판, 빨간 천 선반, 새총(고무줄이 진짜 당겨진다),
 * 라벨 캔·풍선·러버덕·회전 과녁, 카메라(부스/공 추적/셰이크) */
'use strict';
import * as THREE from 'three';

function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- 무대 ---------- */
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080c24);
  scene.fog = new THREE.Fog(0x080c24, 16, 34);

  scene.add(new THREE.HemisphereLight(0x8fa6ff, 0x33201f, 0.7));
  const key = new THREE.DirectionalLight(0xffe9c8, 1.4);
  key.position.set(3.5, 7, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const S = 5;
  key.shadow.camera.left = -S; key.shadow.camera.right = S;
  key.shadow.camera.top = S; key.shadow.camera.bottom = -S;
  key.shadow.camera.far = 24; key.shadow.bias = -0.0004;
  scene.add(key);
  const warm = new THREE.PointLight(0xffb46a, 24, 12); warm.position.set(0, 2.6, 1.6); scene.add(warm);

  /* 별 */
  const pos = [];
  let s = 771107;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 360; i++) {
    const th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 0.8);
    pos.push(24 * Math.sin(ph) * Math.cos(th), 24 * Math.cos(ph) + 1, 24 * Math.sin(ph) * Math.sin(th));
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xcfd8ff, size: 0.07, transparent: true, opacity: 0.9, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  /* 놀이공원 바닥 */
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(13, 13.5, 0.5, 48),
    new THREE.MeshStandardMaterial({ color: 0x101736, roughness: 0.92 })
  );
  ground.position.y = -1.75; ground.receiveShadow = true; scene.add(ground);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60);
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  return { renderer, scene, camera, resize, starMat };
}

/* ---------- 부스 ---------- */
export function buildBooth(scene) {
  const g = new THREE.Group();
  /* 뒷벽 — 어두운 천막 + 별 무늬 */
  const backTex = canvasTex(512, 256, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#1a1440'); gr.addColorStop(1, '#241a52');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.22; ctx.fillStyle = '#ffd35c'; ctx.font = '22px serif'; ctx.textAlign = 'center';
    for (let i = 0; i < 26; i++) ctx.fillText(['✦', '✧', '⭐'][i % 3], (i * 97) % w, (i * 61) % h);
  });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.2),
    new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.95 }));
  back.position.set(0, 0.9, -1.0); back.receiveShadow = true;
  g.add(back);

  /* 선반(카운터) — 빨간 천 */
  const clothTex = canvasTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#a52739'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let x = 0; x < w; x += 24) ctx.fillRect(x, 0, 10, h);
  });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.18, 1.15),
    new THREE.MeshStandardMaterial({ map: clothTex, roughness: 0.85 }));
  shelf.position.set(0, -0.1, -0.08);
  shelf.receiveShadow = true; shelf.castShadow = true;
  g.add(shelf);
  /* 앞판 스커트 */
  const skirtTex = canvasTex(512, 200, (ctx, w, h) => {
    const stripes = ['#c9314b', '#f4e8d0'];
    for (let x = 0, i = 0; x < w; x += 64, i++) { ctx.fillStyle = stripes[i % 2]; ctx.fillRect(x, 0, 64, h); }
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, w, 26);
  });
  const skirt = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 1.5),
    new THREE.MeshStandardMaterial({ map: skirtTex, roughness: 0.9 }));
  skirt.position.set(0, -0.95, 0.5);
  g.add(skirt);

  /* 기둥 2 + 차양 */
  const postMat = new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.7 });
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 3.6, 10), postMat);
    post.position.set(sx * 2.1, 0.5, 0.55); post.castShadow = true;
    g.add(post);
  }
  const awningTex = canvasTex(512, 128, (ctx, w, h) => {
    const stripes = ['#e0443e', '#f7efdc'];
    for (let x = 0, i = 0; x < w; x += 64, i++) { ctx.fillStyle = stripes[i % 2]; ctx.fillRect(x, 0, 64, h); }
  });
  const awning = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4.6, 20, 1, true, Math.PI * 0.98, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({ map: awningTex, roughness: 0.85, side: THREE.DoubleSide }));
  awning.rotation.z = Math.PI / 2;
  awning.position.set(0, 2.35, 0.2);
  awning.castShadow = true;
  g.add(awning);
  /* 차양 물결단 */
  const frill = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.24, 24, 1), new THREE.MeshStandardMaterial({ map: awningTex, roughness: 0.85, side: THREE.DoubleSide }));
  const fp = frill.geometry.attributes.position;
  for (let i = 0; i < fp.count; i++) if (fp.getY(i) < 0) fp.setY(i, -0.12 + Math.sin(fp.getX(i) * 8) * 0.05);
  frill.position.set(0, 2.12, 1.06);
  g.add(frill);

  /* 네온 간판 */
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.62),
    new THREE.MeshBasicMaterial({
      transparent: true, depthWrite: false,
      map: canvasTex(512, 112, (ctx, w, h) => {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff7a6a'; ctx.shadowBlur = 26;
        ctx.font = '900 62px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffe9a8';
        ctx.fillText('🎯 사격 게임장', w / 2, h / 2 + 3);
      })
    }));
  sign.position.set(0, 2.78, 0.9);
  g.add(sign);

  /* 전구 스트링 */
  const bulbs = [];
  const bulbGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const cols = [0xffd35c, 0xff8a5c, 0x7dffb0, 0x5ccfe0, 0xc58aff];
  for (let i = 0; i < 11; i++) {
    const x = -2.0 + i * 0.4;
    const m = new THREE.Mesh(bulbGeo, new THREE.MeshStandardMaterial({
      color: cols[i % 5], emissive: cols[i % 5], emissiveIntensity: 1.6, roughness: 0.4
    }));
    m.position.set(x, 1.98 - Math.abs(Math.sin(i * 0.6)) * 0.001 + Math.sin((i / 10) * Math.PI) * -0.14, 1.05);
    g.add(m); bulbs.push(m);
  }
  /* 진열 인형 선반 (좌우 위쪽 구경거리) */
  const dollTex = canvasTex(96, 96, (ctx, w, h) => { ctx.font = '64px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🧸', w / 2, h / 2 + 4); });
  for (const sx of [-1.75, 1.75]) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dollTex, transparent: true, depthWrite: false }));
    sp.scale.set(0.45, 0.45, 1); sp.position.set(sx, 1.45, -0.6);
    g.add(sp);
  }
  scene.add(g);
  return { group: g, bulbs };
}

/* ---------- 새총 ---------- */
export function buildSlingshot(scene, MUZZLE) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.6 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.5, 10), wood);
  stem.position.y = -0.32;
  const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.34, 10), wood);
  forkL.position.set(-0.11, -0.05, 0); forkL.rotation.z = 0.5;
  const forkR = forkL.clone(); forkR.position.x = 0.11; forkR.rotation.z = -0.5;
  stem.castShadow = forkL.castShadow = forkR.castShadow = true;
  g.add(stem, forkL, forkR);
  g.position.set(MUZZLE[0], MUZZLE[1], MUZZLE[2]);

  const tipL = new THREE.Vector3(-0.185, 0.10, 0), tipR = new THREE.Vector3(0.185, 0.10, 0);
  /* 고무줄 */
  const bandMat = new THREE.LineBasicMaterial({ color: 0xd8b06a });
  const bandL = new THREE.Line(new THREE.BufferGeometry().setFromPoints([tipL, tipL]), bandMat);
  const bandR = new THREE.Line(new THREE.BufferGeometry().setFromPoints([tipR, tipR]), bandMat);
  g.add(bandL, bandR);
  /* 주머니 + 공 */
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.8, side: THREE.DoubleSide }));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd35c, roughness: 0.3, metalness: 0.2, emissive: 0x5a4200, emissiveIntensity: 0.3 }));
  ball.castShadow = true;
  g.add(pouch, ball);

  function setPull(pull) {
    /* pull: {x,y,z} 로컬 오프셋 (0이면 중립) */
    const p = new THREE.Vector3(pull.x, 0.1 + pull.y, pull.z);
    pouch.position.copy(p); ball.position.copy(p).add(new THREE.Vector3(0, 0.02, 0));
    bandL.geometry.setFromPoints([tipL, p]); bandR.geometry.setFromPoints([tipR, p]);
  }
  setPull({ x: 0, y: 0, z: 0 });
  scene.add(g);
  return { group: g, setPull, ball, showBall: v => { ball.visible = v; pouch.visible = v; } };
}

/* ---------- 표적 메쉬 ---------- */
function labelTex(gold) {
  return canvasTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = gold ? '#e8b429' : '#e94e5c'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = gold ? '#fff4cc' : '#ffe1e5'; ctx.fillRect(0, h * 0.36, w, h * 0.28);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 40px "Segoe UI", sans-serif';
    ctx.fillStyle = gold ? '#7a5400' : '#8a1a26';
    ctx.fillText(gold ? '★ 금캔 ★' : 'K-콜라', w / 2, h / 2 + 2);
  });
}
export function makeCan(gold, R, H) {
  const side = new THREE.MeshStandardMaterial({ map: labelTex(gold), roughness: gold ? 0.25 : 0.45, metalness: gold ? 0.8 : 0.5 });
  const cap = new THREE.MeshStandardMaterial({ color: 0xcfd4de, roughness: 0.35, metalness: 0.85 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 20), [side, cap, cap]);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function makeBalloon(colorHex) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.25, metalness: 0.05, emissive: colorHex, emissiveIntensity: 0.12 }));
  b.scale.y = 1.14; b.castShadow = true;
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 }));
  knot.position.y = -0.24; knot.rotation.x = Math.PI;
  const string = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.27, 0), new THREE.Vector3(0.03, -0.75, 0)]),
    new THREE.LineBasicMaterial({ color: 0xd8dcf0, transparent: true, opacity: 0.6 }));
  g.add(b, knot, string);
  return g;
}
export function makeDuck() {
  const g = new THREE.Group();
  const yellow = new THREE.MeshStandardMaterial({ color: 0xffd23e, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), yellow);
  body.scale.set(1.15, 0.9, 1);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), yellow);
  head.position.set(0.09, 0.14, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8a3c, roughness: 0.5 }));
  beak.position.set(0.185, 0.13, 0); beak.rotation.z = -Math.PI / 2;
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x222222 }));
  eye.position.set(0.13, 0.18, 0.055);
  const eye2 = eye.clone(); eye2.position.z = -0.055;
  body.castShadow = head.castShadow = true;
  g.add(body, head, beak, eye, eye2);
  return g;
}
export function makeTarget(r) {
  const face = canvasTex(256, 256, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2;
    const rings = ['#f4e8d0', '#e0443e', '#f4e8d0', '#e0443e', '#ffd35c'];
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, (w / 2) * (1 - i * 0.19), 0, Math.PI * 2);
      ctx.fillStyle = rings[i]; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.07, 0, Math.PI * 2); ctx.fillStyle = '#e0443e'; ctx.fill();
  });
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 28),
    [new THREE.MeshStandardMaterial({ color: 0xd8b06a, roughness: 0.6 }),
     new THREE.MeshStandardMaterial({ map: face, roughness: 0.55 }),
     new THREE.MeshStandardMaterial({ color: 0x8a5a30 })]);
  disc.rotation.x = Math.PI / 2;
  disc.castShadow = true;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x666f8a, roughness: 0.5 }));
  arm.position.y = -r - 0.2;
  g.add(disc, arm);
  g.userData.disc = disc;
  return g;
}

/* ---------- 카메라 ---------- */
export function createDirector(camera, canvas) {
  const st = {
    look: new THREE.Vector3(0, 0.55, -0.2), pos: new THREE.Vector3(0, 1.5, 6.8),
    tLook: new THREE.Vector3(0, 0.55, -0.2), tPos: new THREE.Vector3(0, 1.5, 6.8),
    shakeAmt: 0, drift: 0, userX: 0
  };
  const api = {
    booth() { st.tPos.set(st.userX * 0.6, 1.5, 6.8); st.tLook.set(st.userX * 0.25, 0.55, -0.2); },
    aim() { st.tPos.set(st.userX * 0.6, 1.25, 6.2); st.tLook.set(st.userX * 0.25, 0.5, -0.2); },
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
      camera.position.set(st.pos.x + ox + Math.sin(st.drift * 0.13) * 0.04, st.pos.y + oy, st.pos.z);
      camera.lookAt(st.look);
    },
    setUserX(v) { st.userX = Math.max(-1, Math.min(1, v)); }
  };
  return api;
}
