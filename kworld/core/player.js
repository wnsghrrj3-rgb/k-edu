// 케이히스토리 엔진 · player.js — 걷기·둘러보기. viewMode 'fp' / 'tp' · 관절 캐릭터와 카메라 충돌 회피
import * as THREE from 'three';
import { createAvatar } from './avatar.js';

export class Player {
  constructor(engine, opts = {}) {
    this.e = engine; this.eye = opts.eye ?? 1.55; this.bounds = opts.bounds ?? 60;
    this.pos = engine.spawn.clone(); this.pos.y = engine.groundY(this.pos.x, this.pos.z) + this.eye; this.yaw = opts.yaw ?? 0; this.pitch = 0;
    this.keys = {}; this.joy = { x: 0, y: 0 }; this.speedMul = 1; this.enabled = true;
    this.viewMode = 'fp';
    this.body = createAvatar(); this.body.visible = false; engine.scene.add(this.body);
    this.walkTime = 0;
    this.bindInput();
    engine.onFrame.push((dt) => this.update(dt));
  }
  setView(mode) { this.viewMode = mode; this.body.visible = mode === 'tp'; }
  bindInput() {
    const c = this.e.canvas;
    addEventListener('keydown', (ev) => { this.keys[ev.code] = true; });
    addEventListener('keyup', (ev) => { this.keys[ev.code] = false; });
    addEventListener('blur', () => { this.keys = {}; this.joy = { x: 0, y: 0 }; });
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
  teleport(v) { this.pos.set(v.x, this.e.groundY(v.x, v.z) + this.eye, v.z); }
  update(dt) {
    const cam = this.e.camera; const k = this.keys;
    // 좌우 = 옆걸음이 아니라 **몸을 트는 것**(09-16 준호): A/←·조이스틱 왼쪽 → 왼쪽으로 돌고, D/→·오른쪽 → 오른쪽으로 돈다. 앞뒤만 걷는다.
    let mx = 0, mz = 0, turn = 0;
    if (this.enabled) {
      if (k.KeyW || k.ArrowUp) mz += 1; if (k.KeyS || k.ArrowDown) mz -= 1;
      if (k.KeyA || k.ArrowLeft) turn += 1; if (k.KeyD || k.ArrowRight) turn -= 1;
      turn -= this.joy.x; mz -= this.joy.y;
      if (turn) this.yaw += turn * 2.2 * dt;
    }
    const L = Math.hypot(mx, mz);
    this.moving = L > 0.01;
    if (this.moving) {
      if (L > 1) { mx /= L; mz /= L; }
      const speed = ((k.ShiftLeft || k.ShiftRight) ? 6.5 : 3.6) * this.speedMul * (this.inWater ? 0.5 : 1);
      const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const step = fwd.multiplyScalar(mz * speed * dt).addScaledVector(right, mx * speed * dt);
      const p = this.pos.clone();
      p.x += step.x; if (this.e.collides(p, this.eye)) p.x = this.pos.x;
      p.z += step.z; if (this.e.collides(p, this.eye)) p.z = this.pos.z;
      const B = this.bounds; p.x = THREE.MathUtils.clamp(p.x, -B, B); p.z = THREE.MathUtils.clamp(p.z, -B, B);
      const gy = this.e.groundY(p.x, p.z); this.inWater = gy < -0.5;
      this.pos.set(p.x, gy + this.eye, p.z);
    }
    this.walkTime += dt; this.body.userData.animate(this.walkTime, this.moving);
    // 카메라
    cam.rotation.set(0, 0, 0); cam.rotateY(this.yaw); cam.rotateX(this.pitch);
    const bob = this.moving ? Math.sin(performance.now() * 0.012) * 0.03 : 0;
    if (this.viewMode === 'fp') {
      cam.position.set(this.pos.x, this.pos.y + bob, this.pos.z);
    } else {
      // 3인칭 자리: 어깨 뒤 3.5m, 몸은 pos에
      const back = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)).multiplyScalar(3.5);
      const eye = this.pos.clone().add(new THREE.Vector3(0, .35, 0));
      const desired = new THREE.Vector3(this.pos.x + back.x, this.pos.y + 1.1 + bob, this.pos.z + back.z);
      const delta = desired.clone().sub(eye), length = delta.length();
      const ray = new THREE.Ray(eye, delta.clone().normalize()); let safe = length;
      for (const box of this.e.colliders) { const hit = ray.intersectBox(box, new THREE.Vector3()); if (hit) safe = Math.min(safe, Math.max(.2, hit.distanceTo(eye) - .25)); }
      cam.position.copy(eye).addScaledVector(delta, safe / length);
      cam.position.y = Math.max(cam.position.y, this.e.groundY(cam.position.x,cam.position.z)+.35);
      cam.lookAt(this.pos.x-Math.sin(this.yaw)*3,this.pos.y+this.pitch*3,this.pos.z-Math.cos(this.yaw)*3);
      this.body.position.set(this.pos.x, this.pos.y - this.eye, this.pos.z); this.body.rotation.y = this.yaw;
    }
    // 태양 그림자 카메라를 플레이어 따라
    const s = this.e.sun; const o = this.e.sunOffset || { x: -34, y: 32, z: 24 }; s.position.set(this.pos.x + o.x, o.y, this.pos.z + o.z); s.target.position.set(this.pos.x, 0, this.pos.z); s.target.updateMatrixWorld();
  }
}
