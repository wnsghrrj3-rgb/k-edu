// 케이히스토리 엔진 · player.js — 걷기·둘러보기. viewMode 'fp'(기본) / 'tp'(자리만; 캐릭터 자산 들어오면 채움)
import * as THREE from 'three';

export class Player {
  constructor(engine, opts = {}) {
    this.e = engine; this.eye = opts.eye ?? 1.55; this.bounds = opts.bounds ?? 60;
    this.pos = engine.spawn.clone(); this.yaw = opts.yaw ?? 0; this.pitch = 0;
    this.keys = {}; this.joy = { x: 0, y: 0 }; this.speedMul = 1; this.enabled = true;
    this.viewMode = 'fp';
    // 3인칭 자리: 몸 표시용 임시 메시(fp에선 숨김). 캐릭터 GLB가 오면 여기만 바꾼다.
    this.body = new THREE.Group(); this.body.visible = false; engine.scene.add(this.body);
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8) : new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x8a6a48 }));
    cap.position.y = 0.6; cap.castShadow = true; this.body.add(cap);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: 0xcc9e7a })); head.position.y = 1.42; this.body.add(head);
    this.bindInput();
    engine.onFrame.push((dt) => this.update(dt));
  }
  setView(mode) { this.viewMode = mode; this.body.visible = mode === 'tp'; }
  bindInput() {
    const c = this.e.canvas;
    addEventListener('keydown', (ev) => { this.keys[ev.code] = true; });
    addEventListener('keyup', (ev) => { this.keys[ev.code] = false; });
    let lookId = null, lx = 0, ly = 0;
    c.addEventListener('pointerdown', (ev) => {
      if (!this.enabled) return;
      if (ev.pointerType === 'touch' && ev.clientX < innerWidth * 0.42) return;
      lookId = ev.pointerId; lx = ev.clientX; ly = ev.clientY; c.setPointerCapture(ev.pointerId);
    });
    c.addEventListener('pointermove', (ev) => {
      if (ev.pointerId !== lookId) return;
      const dx = ev.clientX - lx, dy = ev.clientY - ly; lx = ev.clientX; ly = ev.clientY;
      this.yaw -= dx * 0.0035; this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.0028, -1.2, 1.2);
    });
    const up = (ev) => { if (ev.pointerId === lookId) lookId = null; };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  }
  bindJoystick(stick, knob) {
    let id = null; const set = (x, y) => { knob.style.left = (35 + x * 35) + 'px'; knob.style.top = (35 + y * 35) + 'px'; };
    const move = (ev) => { const r = stick.getBoundingClientRect(); let x = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2); const L = Math.hypot(x, y); if (L > 1) { x /= L; y /= L; } this.joy = { x, y }; set(x, y); };
    stick.addEventListener('pointerdown', (ev) => { id = ev.pointerId; stick.setPointerCapture(ev.pointerId); move(ev); });
    stick.addEventListener('pointermove', (ev) => { if (ev.pointerId === id) move(ev); });
    const end = (ev) => { if (ev.pointerId === id) { id = null; this.joy = { x: 0, y: 0 }; set(0, 0); } };
    stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end);
  }
  teleport(v) { this.pos.set(v.x, this.eye, v.z); }
  update(dt) {
    const cam = this.e.camera; const k = this.keys;
    let mx = 0, mz = 0;
    if (this.enabled) {
      if (k.KeyW || k.ArrowUp) mz += 1; if (k.KeyS || k.ArrowDown) mz -= 1;
      if (k.KeyA || k.ArrowLeft) mx -= 1; if (k.KeyD || k.ArrowRight) mx += 1;
      mx += this.joy.x; mz -= this.joy.y;
    }
    const L = Math.hypot(mx, mz);
    this.moving = L > 0.01;
    if (this.moving) {
      if (L > 1) { mx /= L; mz /= L; }
      const speed = ((k.ShiftLeft || k.ShiftRight) ? 6.5 : 3.6) * this.speedMul;
      const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const step = fwd.multiplyScalar(mz * speed * dt).addScaledVector(right, mx * speed * dt);
      const p = this.pos.clone();
      p.x += step.x; if (this.e.collides(p, this.eye)) p.x = this.pos.x;
      p.z += step.z; if (this.e.collides(p, this.eye)) p.z = this.pos.z;
      const B = this.bounds; p.x = THREE.MathUtils.clamp(p.x, -B, B); p.z = THREE.MathUtils.clamp(p.z, -B, B);
      this.pos.set(p.x, this.eye, p.z);
    }
    // 카메라
    cam.rotation.set(0, 0, 0); cam.rotateY(this.yaw); cam.rotateX(this.pitch);
    const bob = this.moving ? Math.sin(performance.now() * 0.012) * 0.03 : 0;
    if (this.viewMode === 'fp') {
      cam.position.set(this.pos.x, this.eye + bob, this.pos.z);
    } else {
      // 3인칭 자리: 어깨 뒤 3.5m, 몸은 pos에
      const back = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)).multiplyScalar(3.5);
      cam.position.set(this.pos.x + back.x, this.eye + 1.2 + bob, this.pos.z + back.z);
      this.body.position.set(this.pos.x, 0, this.pos.z); this.body.rotation.y = this.yaw;
    }
    // 태양 그림자 카메라를 플레이어 따라
    const s = this.e.sun; s.position.set(this.pos.x - 30, 40, this.pos.z + 24); s.target.position.set(this.pos.x, 0, this.pos.z); s.target.updateMatrixWorld();
  }
}
