// 배우층 — Actor: 사람·동물이 「이름·자리·동작」만 받고 스스로 걷고 돌고 동작을 튼다.
// 이야기층은 { actor:'nuri', go:'hunt', anim:'run' } 만 말한다. GLB(뼈대+동작)가 있으면 그걸로, 없으면 관절 인형이 같은 명령을 따른다.
// 시대 이름은 여기 없다. 구조 설계 v1 §3.
import * as THREE from 'three';

const CLIP_ALIAS = { idle: ['wait', 'idle', 'stand'], walk: ['walk'], run: ['run', 'jog'], sit: ['sit', 'squat', 'crouch'], point: ['point', 'wave'], look: ['look'], work: ['chop', 'hammer', 'hit'], throw: ['throw'] };

export class Actor {
  constructor(g, id, obj, opts = {}) {
    this.g = g; this.id = id; this.obj = obj; this.speed = { walk: 1.5, run: 4.2, ...(opts.speed || {}) };
    this.state = 'idle'; this.anim = 'idle'; this.path = null; this.cur = null; this.actions = {}; this.mixer = null; this.t = 0; this.turnTo = null;
  }
  /** GLB 가 로드되면 뼈대·동작을 붙인다(story.loadPerson 이 부른다) */
  setModel(inst, mixer, clips) {
    this.mixer = mixer; this.actions = {};
    for (const [key, names] of Object.entries(CLIP_ALIAS)) { const c = clips.find((c) => names.some((n) => c.name.toLowerCase().includes(n))); if (c) this.actions[key] = mixer.clipAction(c); }
    if (!this.actions.idle && clips[0]) this.actions.idle = mixer.clipAction(clips[0]);
    this.cur = null; this.play(this.anim, 0); if (this.cur) this.cur.time = Math.random() * 2;
  }
  /** 동작 바꾸기 — 없는 동작은 가장 가까운 것으로(sit 없으면 idle, run 없으면 walk) */
  play(name, fade = 0.25) {
    this.anim = name;
    if (!this.mixer) return;   // 관절 인형: tick 에서 moving 여부로만
    const a = this.actions[name] || (name === 'run' && this.actions.walk) || this.actions.idle; if (!a) return;
    if (this.cur === a) return;
    a.reset().fadeIn(fade).play(); if (a === this.actions.walk && this.actions.run && name === 'run') a.timeScale = 1.6; else a.timeScale = 1;
    if (this.cur) this.cur.fadeOut(fade); this.cur = a;
  }
  /** [x,z] 나 구역 이름으로 걸어간다. 도착하면 then 동작. 약속을 돌려준다 */
  goTo(target, { anim = 'walk', then = 'idle', speed } = {}) {
    const p = this.resolve(target); if (!p) return Promise.resolve();
    this.path = { to: p, anim, then, speed: speed || this.speed[anim] || this.speed.walk };
    this.state = anim; this.play(anim);
    return new Promise((res) => { this.path.done = res; });
  }
  /** 움직인 뒤 상호작용 상자를 새 자리로 */
  syncBox() { const it = this.g.e.interactables?.get('npc_' + this.id); if (it && it.box) { it.box.setFromObject(this.obj); it.center.copy(it.box.getCenter(new THREE.Vector3())); } }
  face(target, snap = false) { const p = this.resolve(target); if (!p) return; const yaw = Math.atan2(p.x - this.obj.position.x, p.z - this.obj.position.z); if (snap) this.obj.rotation.y = yaw; else this.turnTo = yaw; }
  resolve(t) {
    if (t === 'player') return { x: this.g.p.pos.x, z: this.g.p.pos.z };
    if (typeof t === 'string') { const a = this.g.e.areas?.get(t) || (this.g.story?.s?.areas?.[t] && new THREE.Vector3(this.g.story.s.areas[t][0], 0, this.g.story.s.areas[t][1])); return a ? { x: a.x, z: a.z } : null; }
    if (Array.isArray(t)) return { x: t[0], z: t[1] };
    return t && typeof t.x === 'number' ? { x: t.x, z: t.z } : null;
  }
  tick(dt) {
    this.t += dt; const o = this.obj;
    if (this.path) {
      const { to, speed } = this.path; const dx = to.x - o.position.x, dz = to.z - o.position.z; const d = Math.hypot(dx, dz);
      const step = speed * dt;
      if (d <= Math.max(step, 0.15)) { o.position.x = to.x; o.position.z = to.z; const done = this.path.done; const then = this.path.then; this.path = null; this.state = then; this.play(then, 0.35); this.syncBox(); done && done(); }
      else { o.position.x += dx / d * step; o.position.z += dz / d * step; this.turnTo = Math.atan2(dx, dz); }
      if (this.g.e.groundY) o.position.y = this.g.e.groundY(o.position.x, o.position.z);
    }
    if (this.turnTo != null) { let diff = this.turnTo - o.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); const k = Math.min(1, dt * 8); o.rotation.y += diff * k; if (Math.abs(diff) < 0.02) this.turnTo = null; }
    // LOD: 멀면 동작 갱신을 띄엄띄엄
    const dist = this.g.p?.pos ? Math.hypot(o.position.x - this.g.p.pos.x, o.position.z - this.g.p.pos.z) : 0;
    if (this.mixer) { if (dist < 25 || (this.t * 60 | 0) % 3 === 0) this.mixer.update(dist < 25 ? dt : dt * 3); }
    else if (o.userData.animate) o.userData.animate(this.t, !!this.path);
  }
}

/** 여러 배우가 한 점 둘레에 원형으로 걸어와 서거나 앉는다 */
export function gather(actors, center, { r = 2.2, anim = 'walk', then = 'idle', face = true } = {}) {
  const n = actors.length; return Promise.all(actors.map((a, i) => { const ang = (i / n) * Math.PI * 2 + 0.4; const to = [center.x + Math.cos(ang) * r, center.z + Math.sin(ang) * r]; return a.goTo(to, { anim, then }).then(() => { if (face) a.face({ x: center.x, z: center.z }); }); }));
}
