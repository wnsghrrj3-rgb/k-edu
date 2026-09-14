// 케이히스토리 엔진 · game.js — 시대 json을 읽어 규칙대로 굴린다. 코어는 시대 이름을 모른다.
import * as THREE from 'three';
import { Engine } from './engine.js';
import { Player } from './player.js';
import { UI } from './ui.js';
import { createFire } from './fire.js';
import { bindMinimap } from './minimap.js';
import { addSkyDome, addMotes, enhanceWater, applySurfaces } from './visuals.js';

const J = (u) => fetch(u).then((r) => r.json());

export class Game {
  constructor(eraPath) {
    this.base = eraPath.replace(/\/?$/, '/');
    this.inventory = []; this.flags = new Set(); this.hunger = 50; this.results = null;
    this.ui = new UI();
  }
  async start() {
    [this.world, this.items, this.npcs, this.why, this.check, this.missions] = await Promise.all(['world', 'items', 'npcs', 'why', 'check', 'missions'].map((n) => J(this.base + n + '.json')));
    this.mi = 0; this.missionStart = performance.now(); this.hintShown = false;
    this.hunger = this.world.hunger.start;
    this.e = new Engine(document.getElementById('c'), this.world.atmosphere);
    if (this.world.sky) this.e.loadSky(this.world.sky);
    if (this.world.height) await this.e.loadHeight(this.base + this.world.height);
    this.e.skipDecor = !!this.world.landscape;   // 시대별 landscape.js 가 있을 때만 GLB 장식(나무·언덕)을 건너뜀
    await this.e.loadWorld(this.base + this.world.glb, this.world.eye);
    this.initTargets();
    if (this.world.surfaces && new URLSearchParams(location.search).get('fx') !== '0') applySurfaces(this.e, this.world.surfaces);   // 표면 텍스처(landscape 보다 먼저 — 장식이 재질을 물려받는다)
    // 시대별 장식 코드는 world.json 이 가리킬 때만(코어는 시대 이름을 모른다)
    if (this.world.landscape) { const { buildLandscape } = await import(new URL(this.base + this.world.landscape, location.href).href); buildLandscape(this.e, this.quality()); }
    // 보이는 것: 절차 하늘·햇빛 먼지·물결. ?fx=0 이면 끔. 후처리(블룸·색보정·SMAA)는 고사양 기본, ?post=0 끔, ?ao=1 로 구석 어둠 추가
    const qs = new URLSearchParams(location.search); const hi = this.quality() === 'high';
    if (qs.get('fx') !== '0') {
      addSkyDome(this.e, this.world.skyLook || {}); enhanceWater(this.e);
      if (hi) { addMotes(this.e); this.e.sun.shadow.mapSize.set(4096, 4096); }
    }
    if (hi && qs.get('post') !== '0') this.e.enablePost({ ao: qs.get('ao') === '1' });
    this.p = new Player(this.e, { eye: this.world.eye, bounds: this.world.bounds, yaw: 0 });
    if (this.world.id === 'paleo') {
      try {
        const { enhancePaleoActors } = await import('./paleo-actors.js');
        await enhancePaleoActors(this.e, this.p);
      } catch (error) { console.warn('Paleo actor assets unavailable; keeping original actors.', error); }
    }
    const vq = new URLSearchParams(location.search).get('view'); this.p.setView(vq || this.world.view || 'fp');
    this.p.bindJoystick(document.getElementById('stick'), document.getElementById('knob'));
    // 시작 시선: 야영지 쪽(있으면) 을 바라봄
    const camp = this.e.areas.get('camp'); if (camp) { const d = camp.clone().sub(this.p.pos); this.p.yaw = Math.atan2(-d.x, -d.z); }
    this.ui.setTitle(this.world.title, this.world.question, this.world.short); this.ui.setGoal(this.world.goal);
    this.renderInv(); this.updateMission(true);
    bindMinimap(this.e, this.p, document.getElementById('minimap'));
    this.addFire();
    for (const t of this.e.interactables.values()) if (t.type === 'fire' && t.state === 'lit') this.setFire(true);
    this.bindButtons();
    this.e.onFrame.push((dt) => this.tick(dt));
    document.getElementById('load').remove();
    this.e.start(); this.ui.intro(this.world.title, this.world.question);
    setTimeout(() => this.ui.say(this.world.intro, 5000), 400);
  }
  /** 기기 등급: 'low'(태블릿·저사양) / 'high'. URL ?q=low|high 로 강제 */
  quality() {
    const q = new URLSearchParams(location.search).get('q'); if (q) return q;
    const coarse = matchMedia('(pointer: coarse)').matches; const cores = navigator.hardwareConcurrency || 4; const mem = navigator.deviceMemory || 4;
    return (coarse && (cores <= 6 || mem <= 4)) ? 'low' : 'high';
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
      const t = this.target = this.e.pickTarget(this.e.camera, 3.2, this.p.pos);
      if (t) this.ui.setPrompt(this.promptFor(t));
      else { const near = this.e.pickTarget(this.e.camera, 9, this.p.pos); this.ui.setPrompt(near ? this.infoFor(near) : null); }
    } else { this.target = null; this.ui.setPrompt(null); }
    // 시간이 지나면 바뀌는 대상(밭이 자라는 것 등)
    this.tickTimers();
    // 미션 나침반 + 힌트 시간
    this.updateMission(false);
    // 불꽃
    if (this.fire && this.fire.visible) { this.fire.rotation.y += dt * 2; this.fire.scale.y = 0.9 + Math.sin(performance.now() * 0.02) * 0.15; this.fireLight.intensity = 3 + Math.sin(performance.now() * 0.03); }
  }
  /** json 의 start(처음 상태)·hidden(처음엔 안 보이는 재질 이름) 적용 */
  initTargets() {
    for (const t of this.e.interactables.values()) {
      const def = this.items.targets[t.type]; if (!def) continue;
      if (def.start) t.state = def.start;
      if (def.hidden) this.showMats(t, def.hidden, false);
    }
  }
  showMats(t, names, on) { t.obj.traverse((m) => { if (m.isMesh && names.includes(m.material.name)) m.visible = on; }); }
  applyState(t, rule) {
    if (rule.set) { t.state = rule.set; if (t.type === 'fire') this.setFire(rule.set === 'lit'); }
    if (rule.hide) this.showMats(t, rule.hide, false);
    if (rule.reveal) this.showMats(t, rule.reveal, true);
    if (rule.after) t.timer = { at: performance.now() + rule.after.sec * 1000, rule: rule.after }; else if (rule.set) t.timer = null;
  }
  tickTimers() {
    const now = performance.now();
    for (const t of this.e.interactables.values()) {
      if (!t.timer || now < t.timer.at) continue;
      const r = t.timer.rule; t.timer = null; this.applyState(t, r); if (r.say) this.ui.say(r.say, 4000); this.flag(r.flag);
    }
  }
  infoFor(t) {
    const def = this.items.targets[t.type]; if (!def) return null;
    const st = def.states && def.states[t.state || 'unlit']; const info = (st && st.info) || def.info;
    return info ? { name: def.name, info } : null;
  }
  promptFor(t) {
    const def = this.items.targets[t.type]; if (!def) return null;
    let verb = def.verb; if (def.states) verb = def.states[t.state || 'unlit'].verb;
    if (t.type === 'gate' && !this.gateOpen) verb = '아직 닫혀 있다 (눌러서 무엇이 남았는지 보기)';
    return { action: true, name: def.name, verb };
  }
  bindButtons() {
    addEventListener('keydown', (ev) => { if (/^(TEXTAREA|INPUT)$/.test(ev.target.tagName)) return; if (ev.code === 'KeyE' || ev.code === 'Space') this.act(); if (ev.code === 'KeyC') this.openCraft(); if (ev.code === 'KeyV') this.p.setView(this.p.viewMode === 'fp' ? 'tp' : 'fp'); if (ev.code === 'KeyH') this.showHint(); if (ev.code === 'KeyM') this.missionList(); });
    document.getElementById('actbtn').onclick = () => this.act();
    document.getElementById('craftbtn').onclick = () => this.openCraft();
    document.getElementById('viewbtn').onclick = () => this.p.setView(this.p.viewMode === 'fp' ? 'tp' : 'fp');
    document.getElementById('hintbtn').onclick = () => this.showHint();
    document.getElementById('mission').onclick = () => this.missionList();
  }
  // ---------- 행동 ----------
  act() {
    if (this.ui.isOpen()) return;
    const t = this.target; if (!t) { this.ui.say('가까이 가서 바라보면 할 수 있는 일이 보여.'); return; }
    const def = this.items.targets[t.type]; if (!def) return;
    if (t.type === 'npc') { this.flag(def.flag); this.flag('talk:' + t.id); return this.talk(t); }
    if (t.type === 'gate') return this.enterGate();
    const rule = def.states ? def.states[t.state || 'unlit'] : def;
    if (rule.once && this.flags.has(rule.flag)) { this.ui.say(rule.say); return; }
    if (rule.requiresFlags && !rule.requiresFlags.every((f) => this.flags.has(f))) { this.ui.say(rule.failNoFlag || rule.fail || '아직은 할 수 없어.'); return; }
    if (rule.requires && !this.has(rule.requires)) { this.ui.say(rule.failNoTool || rule.fail || '지금은 할 수 없어.'); return; }
    if (rule.consumes) { const need = {}; for (const c of rule.consumes) need[c] = (need[c] || 0) + 1;
      for (const [c, n] of Object.entries(need)) if (this.count(c) < n) { this.ui.say(rule['failNo' + c[0].toUpperCase() + c.slice(1)] || `${this.items.items[c].name}이(가) ${n > 1 ? n + '개 ' : ''}없어.`); return; } }
    if (rule.consumes) for (const c of rule.consumes) this.take(c);
    this.applyState(t, rule);
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
    t.type = 'bush_empty'; t.obj.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); if (m.material.name === 'berry') m.visible = false; else m.material.color.multiplyScalar(0.75); } });
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
    this.p.enabled = false;
    const done = () => { this.ui.close(); this.p.enabled = true; this.flag(line.flag); if (line.why) setTimeout(() => this.showWhy(line.why), 600); };
    if (line.choices) { // 선택형 대사(딜레마) — 정답 없음, 고른 것은 깃발로만 남는다
      this.ui.open(`<div class="npc"><b>${npc.name}</b><p>${line.text}</p></div>`, line.choices.map((c) => ({ label: c.label, primary: true, onClick: () => { this.ui.close(); this.p.enabled = true; this.flag(line.flag); this.flag(c.flag); if (c.say) this.ui.say(c.say, 5000); const w = c.why || line.why; if (w) setTimeout(() => this.showWhy(w), 1400); } })), 'npcpanel');
      return;
    }
    this.ui.npcLine(npc.name, line.text, done);
  }
  showWhy(key) {
    const card = this.why[key]; if (!card || this.flags.has('why:' + key)) return;
    this.p.enabled = false; this.ui.whyCard(card, () => { this.ui.close(); this.p.enabled = true; this.flag('why:' + key); });
  }
  // ---------- 미션 ----------
  missionDone(m) {
    if (m.done) return this.flags.has(m.done);
    if (m.all) return m.all.every((f) => this.flags.has(f));
    if (m.count) return this.count(m.count[0]) >= m.count[1] || (m.or && this.flags.has(m.or));
    return false;
  }
  updateMission(force) {
    const ms = this.missions.missions;
    let changed = force;
    while (this.mi < ms.length && this.missionDone(ms[this.mi])) { this.mi++; changed = true; this.missionStart = performance.now(); this.hintShown = false; if (!force) this.ui.say(`✅ ${ms[this.mi - 1].title}`, 2200); }
    const m = ms[this.mi];
    if (changed) this.ui.setMission(m ? m.title : `${this.world.short || ''} 완주!`, this.mi, ms.length);
    if (!m) return;
    // 나침반: 구역 방향
    const a = this.e.areas.get(m.area);
    if (a) { const d = a.clone().sub(this.p.pos); const dist = Math.hypot(d.x, d.z); const bearing = Math.atan2(-d.x, -d.z) - this.p.yaw; this.ui.setCompass(this.world.areas[m.area]?.name || m.area, bearing, dist); }
    // 오래 걸리면 힌트 버튼 반짝
    if (!this.hintShown && (performance.now() - this.missionStart) / 1000 > (this.missions.hintDelay || 45)) { this.hintShown = true; this.ui.pulseHint(); }
  }
  showHint() {
    const m = this.missions.missions[this.mi]; if (!m) { this.ui.say('할 일은 다 했어. 마음껏 둘러봐.'); return; }
    this.ui.say(`💡 ${m.hint}`, 6000); this.hintShown = true;
  }
  missionList() {
    if (this.ui.isOpen()) { this.ui.close(); this.p.enabled = true; return; }
    this.p.enabled = false;
    const ms = this.missions.missions;
    const html = '<h3>할 일</h3><ol class="mlist">' + ms.map((m, i) => `<li class="${i < this.mi ? 'done' : (i === this.mi ? 'now' : '')}">${i < this.mi ? '✅' : (i === this.mi ? '👉' : '·')} ${m.title}${i === this.mi ? `<div class="mhint">💡 ${m.hint}</div>` : ''}</li>`).join('') + '</ol>';
    this.ui.open(html, [{ label: '닫기', primary: true, onClick: () => { this.ui.close(); this.p.enabled = true; } }]);
  }
  // ---------- 불 ----------
  addFire() {
    const it = [...this.e.interactables.values()].find((x) => x.type === 'fire'); if (!it) return;
    const g = createFire(this.e, it.center); this.fire = g;
    this.fireLight = new THREE.PointLight(0xff9a3a, 0, 14, 1.6); this.fireLight.position.copy(g.position).add(new THREE.Vector3(0, 0.8, 0)); this.e.scene.add(this.fireLight);
  }
  setFire(on) { if (this.fire) this.fire.visible = on; this.fireLight.intensity = on ? 3 : 0; }
  // ---------- 시간의 문 ----------
  checkGate() {
    const g = this.world.gate; const ok = g.requires.every((f) => this.flags.has(f));
    if (ok && !this.gateOpen) { this.gateOpen = true; this.ui.setGoal(`시간의 문이 열렸다. ${g.hint || '문으로 가 보자.'}`); this.updateMission(false); this.ui.say('어디선가 바람이… 시간의 문이 열렸다!', 4000); }
  }
  enterGate() {
    if (!this.gateOpen) { const g = this.world.gate; const left = g.requires.filter((f) => !this.flags.has(f)).length; this.ui.say(`아직 닫혀 있다. 해야 할 일이 ${left}가지 남았어.`); return; }
    this.p.enabled = false;
    this.ui.open(`<div class="chk"><h3>${this.check.intro}</h3></div>`, [{ label: '좋아', primary: true, onClick: () => this.runCheck() }]);
  }
  runCheck() {
    this.ui.check(this.check, null,
      (results) => {
        this.results = results; this.flag('era:done'); this.updateMission(false);
        const okN = results.filter((r) => r.ok).length; const g = this.world.gate;
        const bag = [...new Set(this.inventory.filter((k) => this.items.items[k].bag))].map((k) => `${this.items.items[k].icon} ${this.items.items[k].name}`);
        this.ui.open(`<div class="chk"><div class="tag">시대 완주</div><h3>${this.check.done}</h3><p>🎒 <b>역사 가방</b>에 담김: ${bag.length ? bag.join(' · ') : '(없음)'}</p><p class="sub">기록: 확인 ${okN}/${results.filter((r) => 'ok' in r).length} · 「만약에」 1편 (선생님에게)</p></div>`,
          [{ label: g.ready ? `${g.nextName}로 가기` : `${g.nextName}로 (준비 중)`, primary: true, onClick: () => { if (g.ready) { const u = new URL(location.href); u.searchParams.set('era', g.next); location.href = u.toString(); } else this.ui.say(`${g.nextName}는 다음에 열려. 오늘은 여기까지가 ${this.world.short || '이 시대'}야.`, 4000); } }, { label: '더 둘러보기', onClick: () => { this.ui.close(); this.p.enabled = true; } }]);
        // 저장: 동의 학생 저장 표는 다음 시대에서(SQL). 지금은 화면 메모리에만.
      },
      (q) => { // 다시 가 보기: 그 장면으로 이동, 나중에 문에서 다시
        const a = this.e.areas.get(q.revisit); if (a) this.p.teleport(a.clone().add(new THREE.Vector3(2, 0, 2)));
        this.p.enabled = true; this.ui.say(q.revisitText, 4000);
      });
  }
}
