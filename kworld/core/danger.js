// 위험층 — 「살아남아라」가 진짜가 되는 층(09-17 준호: 실감 없으면 재미 없다).
//  · 밤에 불 반경 밖에 혼자 있으면 눈 두 쌍 → 심장 → 쓰러진다. 횃불(불에서 가지에 붙임, 90초)이 있으면 안 온다.
//  · 숲 깊은 곳 큰 발자국 옆에 오래 있으면 큰 짐승 — 움직이면 다가오고, 가만히 있으면 물러난다.
//  · 배고픔 0 이 오래가면 쓰러진다.
//  · 쓰러지면 죽지 않는다: 그 ACT 시작(체크포인트)으로, 주머니의 먹을 것 절반을 잃고 불 곁에서 눈을 뜬다. 이미 끝낸 ACT 는 다시 하지 않는다.
// world.danger 로 켠다. 시대 이름 없음.
import * as THREE from 'three';

export class Danger {
  constructor(g, cfg) {
    this.g = g; this.cfg = { nightRadius: 9, graceSec: 14, eyesAt: 4, starveSec: 45, torchSec: 90, lairRadius: 8, lairSec: 18, ...cfg };
    this.t = 0; this.starveT = 0; this.lairT = 0; this.enc = null; this.eyes = null; this.torchUntil = 0;
  }
  get night() { const s = this.g.story; return !!(s?.nightOn && s.skyName === 'night'); }
  firePos() { const f = this.g.fire; return f && f.visible && (this.g.fireBase || 0) > 0 ? f.position : null; }
  hasTorch() { return performance.now() < this.torchUntil; }
  lightTorch() { this.torchUntil = performance.now() + this.cfg.torchSec * 1000; if (!this.torch && this.g.e.scene?.add) { this.torch = new THREE.PointLight(0xff9a3a, 1.6, 9, 1.5); this.g.e.scene.add(this.torch); } this.g.flag('torch:lit'); this.g.ui.say('가지 끝에 불이 붙는다. 오래 못 간다.', 3200); }
  /** 눈 두 쌍 — 플레이어 앞 8m, 어둠 속 */
  showEyes(on) {
    const e = this.g.e; if (!e.scene?.add || !this.g.p?.pos) { this.eyesOn = on; return; }
    if (!this.eyes) { this.eyes = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: 0xffd37a }); for (const [x, z] of [[-0.12, 0], [0.12, 0], [1.6, 0.6], [1.84, 0.6]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), m); s.position.set(x, 0.55, z); this.eyes.add(s); } e.scene.add(this.eyes); }
    this.eyes.visible = on; this.eyesOn = on;
    if (on) { const p = this.g.p; const dir = new THREE.Vector3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw)); const at = p.pos.clone().add(dir.multiplyScalar(8)); this.eyes.position.set(at.x, e.groundY ? e.groundY(at.x, at.z) : 0, at.z); this.eyes.lookAt(p.pos.x, this.eyes.position.y + 0.55, p.pos.z); }
  }
  tick(dt) {
    const g = this.g; const p = g.p; if (!p?.pos || g.restoring || g.story?.cutsceneOn || this.collapsing) return;
    if (this.torch) { this.torch.position.set(p.pos.x, (p.pos.y || 0) + 0.3, p.pos.z); this.torch.visible = this.hasTorch(); }
    if (this.torchUntil && !this.hasTorch() && g.has?.('torch')) { g.take('torch'); g.renderInv?.(); this.torchUntil = 0; g.ui.say('횃불이 꺼졌다.', 2600); }
    // 1) 밤, 불 밖, 횃불 없음
    let danger = false;
    if (this.night && !this.hasTorch()) { const f = this.firePos(); const d = f ? Math.hypot(p.pos.x - f.x, p.pos.z - f.z) : Infinity; danger = d > this.cfg.nightRadius; }
    if (danger) {
      this.t += dt;
      if (this.t > this.cfg.eyesAt && !this.eyesOn) { this.showEyes(true); g.ui.say('…어둠 속에 눈.', 2600); g.sound?.thump?.(0.3); g.sound?.play('growl', 0.5); }
      if (this.t > this.cfg.eyesAt) g.sound?.set?.('wind', 0.6);
      if (this.t > this.cfg.graceSec) return this.collapse('night', '…뒤에서 소리. 너무 늦었다.');
    } else if (this.t > 0) { this.t = Math.max(0, this.t - dt * 2); if (this.t < this.cfg.eyesAt && this.eyesOn) { this.showEyes(false); g.ui.say('…물러갔다.', 2000); } }
    // 2) 큰 짐승 자리(낮·밤 무관): 오래 머물면 만난다 — 움직이면 온다, 가만히 있으면 간다
    const lair = this.cfg.lair; if (lair && !g.flags.has('beast:met')) {
      const d = Math.hypot(p.pos.x - lair[0], p.pos.z - lair[1]);
      if (!this.enc) { if (d < this.cfg.lairRadius) { this.lairT += dt; if (this.lairT > this.cfg.lairSec) { this.enc = { t: 0, moved: 0 }; this.showEyes(true); g.ui.say('…낮은 소리. 풀이 흔들린다. 움직이지 마.', 4200); g.ui.setGoal?.('가만히. 뒤로.'); g.sound?.play('growl', 0.7); } } else this.lairT = Math.max(0, this.lairT - dt); }
      else { this.enc.t += dt; if (p.moving) this.enc.moved += dt; if (this.enc.moved > 2.2) return this.collapse('beast', '…달렸다. 그게 더 빨랐다.'); if (this.enc.t > 7) { this.enc = null; this.showEyes(false); g.flag('beast:met'); g.ui.say('…물러난다. 사라졌다. 숨을 쉰다.', 4200); g.ui.setGoal?.(''); } }
    }
    // 3) 배고픔 0
    if (g.hunger <= 0) { this.starveT += dt; if (this.starveT > this.cfg.starveSec) return this.collapse('hunger', '…다리에 힘이 빠진다.'); } else this.starveT = 0;
  }
  /** 쓰러진다 — 체크포인트(ACT 시작)로, 먹을 것 절반 잃고 불 곁에서 눈을 뜬다 */
  async collapse(reason, line) {
    const g = this.g; this.collapsing = true; this.showEyes(false); this.t = 0; this.starveT = 0; this.enc = null;
    (g.telemetry ??= { missions: [], hints: 0, starved: 0 }).collapsed = [...(g.telemetry.collapsed || []), { reason, act: g.checkpoint?.act || null }];
    g.p.enabled = false;
    if (g.story?.overlay) await g.story.overlay({ lines: [line, '…', '쓰러진다.'], gap: 1400, hold: 1600 });
    // 체크포인트 되돌리기(있으면) — 이미 끝난 ACT 의 깃발은 남는다
    if (g.checkpoint) { g.flags.clear(); for (const f of g.checkpoint.flags) g.flags.add(f); g.inventory.length = 0; g.inventory.push(...g.checkpoint.inventory); for (const ev of g.world.events || []) ev.done = g.cond(ev.on); g.story?.onFlag(); }
    // 먹을 것 절반
    const food = this.cfg.food || ['berry', 'root', 'meat', 'cooked', 'fish', 'shell']; const have = g.inventory.filter((k) => food.includes(k)); const lose = Math.floor(have.length / 2); for (let i = 0; i < lose; i++) g.take(have[i]); g.renderInv?.();
    g.hunger = Math.max(g.hunger, 22);
    const f = this.firePos() || (g.e.areas?.get('camp') ? g.e.areas.get('camp') : null); if (f) { g.p.pos.x = f.x + 1.5; g.p.pos.z = f.z + 1.5; if (g.e.groundY) g.p.pos.y = g.e.groundY(g.p.pos.x, g.p.pos.z) + (g.world.eye || 1.55); }
    g.ui.say(this.cfg.wakeSay || '…불 곁이다. 누가 데려왔다. 「혼자 가지 마.」', 5200);
    g.updateMission?.(true); g.save?.touch(); g.p.enabled = true; this.collapsing = false;
  }
}
