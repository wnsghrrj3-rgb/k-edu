/* 공통 엔진 · 만질 수 있는 물건 — 크기 용수철 · 까딱임 · 중력과 튐 · 화면에서 집기.
 * 가벼운 물리를 손으로 짰다(물리 라이브러리 없음). 물건마다 다른 버릇(구르기 · 쓰러지기)은 놀이가 thing.live(dt) 로 덧붙인다. */
import * as THREE from 'three';
import { clamp } from './stage.js';

// ── 수치(놀이가 바꿔 쓸 수 있다)
export const THING = {
  SPRING_K: 110, SPRING_C: 9, JELLY: 0.10,   // 크기 용수철: 세기 · 잦아듦 · 출렁일 때 길쭉 · 납작해지는 정도
  WOB_K: 80, WOB_C: 6,                       // 건드려져 까딱이는 용수철
  GRAVITY: 14, BOUNCE: 0.45, REST: 1.2,      // 떨어지는 빠르기 · 튀는 정도 · 이보다 느리면 멈춘다
  PICK_PAD: 26,                              // 닿았다고 보는 여유(픽셀)
};
const v3 = new THREE.Vector3();

/** 물건 하나. mesh = 모형(바닥 가운데가 원점 · 공은 가운데가 원점), o = { name, x, z, r(반지름), h(키), ball, glow(닿았을 때 빛나는 색) } */
export function createThing(scene, mesh, o) {
  const obj = new THREE.Group(); mesh.material = mesh.material.clone(); mesh.material.emissive = new THREE.Color(o.glow || '#ffe9a8'); mesh.material.emissiveIntensity = 0; obj.add(mesh); scene.add(obj);
  return { name: o.name, obj, mesh, x: o.x, z: o.z, home: { x: o.x, z: o.z }, r: o.r, h: o.h, ball: !!o.ball, size: 1, to: 1, v: 0, y: 0, vy: 0, floor: 0, tx: 0, tz: 0, tvx: 0, tvz: 0, vx: 0, roll: 0, lean: 0, state: o.state || 'home', t: 0, lit: false, live: null, pose: null, onBounce: null, lift: 'bench', color: 'own', temp: 0 };   // lift · color · temp = 연구소의 상태(자리를 옮겨도 지닌다)
}
/** 매 장면: 크기 · 까딱임 · 떨어짐 → 자리와 모양에 입힌다. */
export function stepThing(t, dt) {
  t.v += (THING.SPRING_K * (t.to - t.size) - THING.SPRING_C * t.v) * dt; t.size = Math.max(0.05, t.size + t.v * dt);
  t.tvx += (-THING.WOB_K * t.tx - THING.WOB_C * t.tvx) * dt; t.tvz += (-THING.WOB_K * t.tz - THING.WOB_C * t.tvz) * dt; t.tx += t.tvx * dt; t.tz += t.tvz * dt;
  if (t.y > t.floor || t.vy !== 0) { t.vy -= THING.GRAVITY * dt; t.y += t.vy * dt;
    if (t.y < t.floor) { t.y = t.floor; const hard = Math.abs(t.vy) > THING.REST; if (hard && t.onBounce) t.onBounce(Math.abs(t.vy)); t.vy = hard ? -t.vy * THING.BOUNCE : 0; } }
  if (t.live) t.live(dt);
  const j = clamp(t.v / Math.max(t.size, 0.2) * THING.JELLY, -0.22, 0.22), ob = t.obj;
  ob.scale.set(t.size * (1 - j * 0.5), t.size * (1 + j), t.size * (1 - j * 0.5)); ob.position.set(t.x, t.y + (t.ball ? t.r * t.size : 0), t.z);
  if (t.pose) t.pose(ob); else if (t.ball) ob.rotation.set(t.tx * 0.2, 0, t.roll); else ob.rotation.set(t.tx * 0.1, 0, t.tz * 0.1);
  t.mesh.material.emissiveIntensity += ((t.lit ? 0.26 : 0) - t.mesh.material.emissiveIntensity) * Math.min(1, 12 * dt);
}
export const centerOf = (t, out) => out.set(t.x, t.y + (t.ball ? t.r : t.h * 0.5) * t.size, t.z);
export const topOf = (t, out) => out.set(t.x, t.y + (t.ball ? t.r * 2 : t.h) * t.size, t.z);
/** 화면에서 그 물건이 차지하는 반지름(픽셀). */
export function pxRadius(stage, t) { const c = stage.screenOf(centerOf(t, v3)), e = stage.screenOf(v3.set(t.x + Math.max(t.r, t.h * 0.5) * t.size, t.y + t.h * 0.5 * t.size, t.z)); return Math.abs(e.x - c.x) + THING.PICK_PAD; }
/** 화면의 (x, y) 에 있는 대상(가장 가운데에 가까운 것). 대상은 { x, y, z, r, h, size, state } 꼴이면 된다(캐릭터도). */
export function pickAt(stage, targets, x, y) {
  let best = null, bd = 1e9;
  for (const t of targets) { if (t.state === 'gone') continue; const c = stage.screenOf(centerOf(t, v3)), d = Math.hypot(c.x - x, c.y - y) / pxRadius(stage, t); if (d < 1 && d < bd) { bd = d; best = t; } }
  return best;
}
/** 캐릭터를 「대상」 꼴로 감싼다(크기를 물건처럼 읽고 쓴다). */
export function actorTarget(actor, name, r = 0.36, h = 1.05) {
  const s = actor.state; return { name, r, h, big: false, small: false, actor, lift: 'bench', color: 'own', temp: 0, get size() { return s.size; }, get to() { return s.sizeTo; }, set to(v) { actor.setSize(v); }, get x() { return s.pos.x; }, get z() { return s.pos.z; }, get y() { return s.y; } };
}
