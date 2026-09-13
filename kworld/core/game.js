// 케이히스토리 엔진 · game.js — 시대 json을 읽어 규칙대로 굴린다. 코어는 시대 이름을 모른다.
import * as THREE from 'three';
import { Engine } from './engine.js';
import { Player } from './player.js';
import { UI } from './ui.js';

const J = (u) => fetch(u).then((r) => r.json());

export class Game {
  constructor(eraPath) {
    this.base = eraPath.replace(/\/?$/, '/');
    this.inventory = []; this.flags = new Set(); this.hunger = 50; this.results = null;
    this.ui = new UI();
  }
  async start() {
    [this.world, this.items, this.npcs, this.why, this.check] = await Promise.all(['world', 'items', 'npcs', 'why', 'check'].map((n) => J(this.base + n + '.json')));
    this.hunger = this.world.hunger.start;
    this.e = new Engine(document.getElementById('c'));
    if (this.world.sky) this.e.loadSky(this.world.sky);
    await this.e.loadWorld(this.base + this.world.glb, this.world.eye);
    this.p = new Player(this.e, { eye: this.world.eye, bounds: this.world.bounds, yaw: 0 });
    this.p.bindJoystick(document.getElementById('stick'), document.getElementById('knob'));
    // 시작 시선: 야영지 쪽(있으면) 을 바라봄
    const camp = this.e.areas.get('camp'); if (camp) { const d = camp.clone().sub(this.p.pos); this.p.yaw = Math.atan2(-d.x, -d.z); }
    this.ui.setTitle(this.world.title, this.world.question); this.ui.setGoal(this.world.goal);
    this.renderInv();
    this.addFire();
    this.bindButtons();
    this.e.onFrame.push((dt) => this.tick(dt));
    document.getElementById('load').remove();
    this.e.start();
    setTimeout(() => this.ui.say(this.world.intro, 5000), 400);
  }
  // ---------- 상태 ----------
  has(k) { return this.inventory.includes(k); }
  count(k) { return this.inventory.filter((x) => x === k).length; }
  take(k) { const i = this.inventory.indexOf(k); if (i >= 0) this.inventory.splice(i, 1); }
  give(k) { this.inventory.push(k); this.renderInv(); }
  flag(f) { if (!f || this.flags.has(f)) return; this.flags.add(f); this.checkGate(); }
  cond(expr) { // "a && !b" 정도의 간단 조건
    if (!expr) return true;
    return expr.split('&&').every((t) => { t = t.trim(); const neg = t.startsWith('!'); const f = neg ? t.slice(1) : t; return neg ? !this.flags.has(f) : this.flags.has(f); });
  }
  renderInv() { this.ui.renderInventory(this.inventory, this.items.items, (k) => this.tapItem(k)); }
  tapItem(k) {
    const d = this.items.items[k];
    if (d.eat) { this.take(k); this.hunger = Math.min(100, this.hunger + d.eat); this.flag(d.flag); this.ui.say(`${d.icon} ${d.name}을(를) 먹었다.`); this.renderInv(); }
    else this.ui.say(`${d.icon} ${d.name} — ${d.desc}`);
  }
  // ---------- 매 프레임 ----------
  tick(dt) {
    // 배고픔
    const h = this.world.hunger; this.hunger = Math.max(0, this.hunger - h.perSecond * dt);
    const slow = this.hunger < h.slowBelow; this.p.speedMul = slow ? 0.55 : 1; this.ui.setHunger(this.hunger, slow);
    // 대상 안내
    if (!this.ui.isOpen()) {
      const t = this.target = this.e.pickTarget(this.e.camera);
      this.ui.setPrompt(t ? this.promptFor(t) : null);
    } else { this.target = null; this.ui.setPrompt(null); }
    // 불꽃
    if (this.fire && this.fire.visible) { this.fire.rotation.y += dt * 2; this.fire.scale.y = 0.9 + Math.sin(performance.now() * 0.02) * 0.15; this.fireLight.intensity = 3 + Math.sin(performance.now() * 0.03); }
  }
  promptFor(t) {
    const def = this.items.targets[t.type]; if (!def) return null;
    let verb = def.verb; if (def.states) verb = def.states[t.state || 'unlit'].verb;
    if (t.type === 'gate' && !this.gateOpen) verb = '아직 닫혀 있다';
    return `<b>${def.name}</b> — ${verb} <kbd>E</kbd> / 탭`;
  }
  bindButtons() {
    addEventListener('keydown', (ev) => { if (/^(TEXTAREA|INPUT)$/.test(ev.target.tagName)) return; if (ev.code === 'KeyE' || ev.code === 'Space') this.act(); if (ev.code === 'KeyC') this.openCraft(); if (ev.code === 'KeyV') this.p.setView(this.p.viewMode === 'fp' ? 'tp' : 'fp'); });
    document.getElementById('actbtn').onclick = () => this.act();
    document.getElementById('craftbtn').onclick = () => this.openCraft();
    document.getElementById('viewbtn').onclick = () => this.p.setView(this.p.viewMode === 'fp' ? 'tp' : 'fp');
  }
  // ---------- 행동 ----------
  act() {
    if (this.ui.isOpen()) return;
    const t = this.target; if (!t) { this.ui.say('가까이 가서 바라보면 할 수 있는 일이 보여.'); return; }
    const def = this.items.targets[t.type]; if (!def) return;
    if (t.type === 'npc') return this.talk(t);
    if (t.type === 'gate') return this.enterGate();
    const rule = def.states ? def.states[t.state || 'unlit'] : def;
    if (rule.once && this.flags.has(rule.flag)) { this.ui.say(rule.say); return; }
    if (rule.requires && !this.has(rule.requires)) { this.ui.say(rule.failNoTool || rule.fail || '지금은 할 수 없어.'); return; }
    if (rule.consumes) for (const c of rule.consumes) if (!this.has(c)) { this.ui.say(rule['failNo' + c[0].toUpperCase() + c.slice(1)] || `${this.items.items[c].name}이(가) 없어.`); return; }
    if (rule.consumes) for (const c of rule.consumes) this.take(c);
    if (rule.set) { t.state = rule.set; if (t.type === 'fire') this.setFire(true); }
    const gives = Array.isArray(rule.gives) ? rule.gives : (rule.gives ? [rule.gives] : []);
    for (const g of gives) this.inventory.push(g);
    if (rule.uses) { t.uses++; }
    this.renderInv();
    if (rule.say) this.ui.say(rule.say); else if (gives.length) this.ui.say(`${this.items.items[gives[0]].icon} ${this.items.items[gives[0]].name}을(를) 얻었다.`);
    this.flag(rule.flag);
    if (rule.remove || (rule.uses && t.uses >= rule.uses)) {
      if (rule.uses) { this.ui.say(rule.empty || '다 떨어졌어.'); this.stripBerries(t); if (rule.areaEvent) this.areaEvent(rule.areaEvent, t); }
      else this.e.removeInteractable(t.name);
    }
    if (rule.why) setTimeout(() => this.showWhy(rule.why), 900);
  }
  stripBerries(t) { // 덤불은 남기고 열매 색만 빼기 — 재질이 하나로 합쳐져 있으니 어둡게
    t.type = 'bush_empty'; t.obj.material = t.obj.material.clone(); t.obj.material.color.multiplyScalar(0.6);
  }
  areaEvent(ev, t) {
    if (ev === 'bush_empty') {
      const area = t.name.split('_')[1]; // a1 / a2
      const left = [...this.e.interactables.values()].filter((x) => x.type === 'bush' && x.name.split('_')[1] === area).length;
      if (left === 0 && area === 'a1') { this.flag('area1:empty'); setTimeout(() => this.showWhy('move'), 900); }
    }
  }
  openCraft() {
    if (this.ui.isOpen()) { this.ui.close(); return; }
    this.p.enabled = false;
    const recipes = this.items.recipes.map((r) => ({ ...r, known: this.flags.has(r.flag) }));
    this.ui.craftPanel(this.inventory, this.items.items, recipes, (out) => this.craft(out), () => { this.ui.close(); this.p.enabled = true; });
  }
  craft(out) {
    const r = this.items.recipes.find((x) => x.out === out);
    const need = {}; for (const i of r.in) need[i] = (need[i] || 0) + 1;
    for (const [k, n] of Object.entries(need)) if (this.count(k) < n) { this.ui.say('아무것도 안 됐어. 재료가 모자라.'); return; }
    for (const i of r.in) this.take(i);
    this.inventory.push(out); this.renderInv(); this.ui.close(); this.p.enabled = true;
    const d = this.items.items[out]; this.ui.say(`${d.icon} ${d.name}이(가) 됐다!`);
    this.flag(r.flag);
    if (d.why) setTimeout(() => this.showWhy(d.why), 900);
  }
  talk(t) {
    const npc = this.npcs[t.id]; if (!npc) return;
    const line = npc.lines.find((l) => this.cond(l.if)) || npc.lines[npc.lines.length - 1];
    this.p.enabled = false; this.ui.npcLine(npc.name, line.text, () => { this.ui.close(); this.p.enabled = true; });
  }
  showWhy(key) {
    const card = this.why[key]; if (!card || this.flags.has('why:' + key)) return;
    this.p.enabled = false; this.ui.whyCard(card, () => { this.ui.close(); this.p.enabled = true; this.flag('why:' + key); });
  }
  // ---------- 불 ----------
  addFire() {
    const it = [...this.e.interactables.values()].find((x) => x.type === 'fire'); if (!it) return;
    const g = new THREE.Group(); g.position.copy(it.center); g.position.y = 0.35;
    const m = new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.9 });
    for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.32 - k * 0.08, 0.9 + k * 0.25, 6), m.clone()); c.material.color.setHSL(0.07 + k * 0.03, 1, 0.55 + k * 0.1); c.position.y = 0.4 + k * 0.15; c.rotation.y = k; g.add(c); }
    g.visible = false; this.e.scene.add(g); this.fire = g;
    this.fireLight = new THREE.PointLight(0xff9a3a, 0, 14, 1.6); this.fireLight.position.copy(g.position).add(new THREE.Vector3(0, 0.8, 0)); this.e.scene.add(this.fireLight);
  }
  setFire(on) { if (this.fire) this.fire.visible = on; this.fireLight.intensity = on ? 3 : 0; }
  // ---------- 시간의 문 ----------
  checkGate() {
    const g = this.world.gate; const ok = g.requires.every((f) => this.flags.has(f));
    if (ok && !this.gateOpen) { this.gateOpen = true; this.ui.setGoal(`시간의 문이 열렸다. 동굴 옆 문으로 가 보자.`); this.ui.say('어디선가 바람이… 시간의 문이 열렸다!', 4000); }
  }
  enterGate() {
    if (!this.gateOpen) { const g = this.world.gate; const left = g.requires.filter((f) => !this.flags.has(f)).length; this.ui.say(`아직 닫혀 있다. 해야 할 일이 ${left}가지 남았어.`); return; }
    this.p.enabled = false;
    this.ui.open(`<div class="chk"><h3>${this.check.intro}</h3></div>`, [{ label: '좋아', primary: true, onClick: () => this.runCheck() }]);
  }
  runCheck() {
    this.ui.check(this.check, null,
      (results) => {
        this.results = results;
        const okN = results.filter((r) => r.ok).length; const g = this.world.gate;
        const bag = this.inventory.filter((k) => this.items.items[k].why || k === 'handaxe');
        this.ui.open(`<div class="chk"><div class="tag">시대 완주</div><h3>${this.check.done}</h3><p>🎒 <b>역사 가방</b>에 담김: ${bag.length ? '🔪 주먹도끼' : '(없음)'}</p><p class="sub">기록: 확인 ${okN}/${results.filter((r) => 'ok' in r).length} · 「만약에」 1편 (선생님에게)</p></div>`,
          [{ label: `${g.nextName}로 (준비 중)`, primary: true, onClick: () => { this.ui.say(`${g.nextName}는 다음에 열려. 오늘은 여기까지가 구석기야.`, 4000); } }, { label: '더 둘러보기', onClick: () => { this.ui.close(); this.p.enabled = true; } }]);
        // 저장: 동의 학생 저장 표는 다음 시대에서(SQL). 지금은 화면 메모리에만.
      },
      (q) => { // 다시 가 보기: 그 장면으로 이동, 나중에 문에서 다시
        const a = this.e.areas.get(q.revisit); if (a) this.p.teleport(a.clone().add(new THREE.Vector3(2, 0, 2)));
        this.p.enabled = true; this.ui.say(q.revisitText, 4000);
      });
  }
}
