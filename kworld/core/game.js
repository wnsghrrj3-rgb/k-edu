// 케이히스토리 엔진 · game.js — 시대 json을 읽어 규칙대로 굴린다. 코어는 시대 이름을 모른다.
import * as THREE from 'three';
import { Engine } from './engine.js';
import { Player } from './player.js';
import { UI } from './ui.js';
import { createFire } from './fire.js';
import { bindMinimap } from './minimap.js';
import { addSkyDome, addMotes, enhanceWater, applySurfaces } from './visuals.js';
import { applySplat } from './terrain.js';
import { Sound } from './sound.js';
import { Save } from './save.js';
import { Danger } from './danger.js';
import { Story } from './story.js';

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
    if (this.world.splat && new URLSearchParams(location.search).get('fx') !== '0') applySplat(this.e, this.world.splat);   // 바닥 스플랫(흙·풀·자갈 섞기) — 표면 텍스처 위에
    // 장면 층: GLB 위에 json 좌표로 대상·사람을 더 놓는다(이야기형 시대) — landscape 보다 먼저, 나무가 이 대상들을 피하도록
    if (this.world.scene) { this.story = new Story(this, await J(this.base + this.world.scene)); this.story.apply(); }
    // 시대별 장식 코드는 world.json 이 가리킬 때만(코어는 시대 이름을 모른다)
    if (this.world.landscape) { const { buildLandscape } = await import(new URL(this.base + this.world.landscape, location.href).href); buildLandscape(this.e, this.quality(), { treeModel: this.world.treeModel ? new URL(this.base + this.world.treeModel, location.href).href : null }); }
    // 보이는 것: 절차 하늘·햇빛 먼지·물결. ?fx=0 이면 끔. 후처리(블룸·색보정·SMAA)·그림자 4096·햇빛 먼지는 **?post=1 일 때만**(09-16 준호: 기본이 굼떴음 → 무거운 층은 켜서 보는 것으로), ?ao=1 로 구석 어둠 추가
    const qs = new URLSearchParams(location.search); const hi = this.quality() === 'high'; const post = hi && qs.get('post') === '1';
    if (qs.get('fx') !== '0') {
      addSkyDome(this.e, this.world.skyLook || {}); enhanceWater(this.e);
      if (post) { addMotes(this.e); this.e.sun.shadow.mapSize.set(4096, 4096); }
    }
    if (post) this.e.enablePost({ ao: qs.get('ao') === '1' });
    if (qs.get('fps') === '1') this.fpsMeter();
    this.autoTune();
    this.p = new Player(this.e, { eye: this.world.eye, bounds: this.world.bounds, yaw: 0 });
    try { this.sound = new Sound(this); } catch (err) { console.warn('sound', err); }
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
    this.e.start();
    // 저장·재개 — 저장이 있으면 프롤로그 대신 「이어서 / 처음부터」
    if (this.world.danger) this.danger = new Danger(this, this.world.danger);
    this.save = new Save(this, this.era || new URLSearchParams(location.search).get('era') || 'world'); const saved = new URLSearchParams(location.search).get('resume') === '0' ? null : this.save.load();
    if (saved && this.story) {
      const pick = await new Promise((res) => this.ui.open(`<div class="chk"><div class="tag">저장된 이야기</div><h3>이어서 할까?</h3><p>깃발 ${saved.flags.length}개 · ${new Date(saved.t).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p></div>`, [{ label: '이어서 하기', primary: true, onClick: () => { this.ui.close(); res(true); } }, { label: '처음부터', onClick: () => { this.ui.close(); res(false); } }]));
      if (pick) this.save.apply(saved); else this.save.clear();
      if (this.world.characters) await this.chooseCharacter(this.world.characters, pick ? saved.char : null);
      if (!pick && this.world.prologue) { this.p.enabled = false; await this.story.prologue(this.world.prologue); this.p.enabled = true; }
    } else { if (this.world.characters) await this.chooseCharacter(this.world.characters, null); if (this.world.prologue && this.story) { this.p.enabled = false; await this.story.prologue(this.world.prologue); this.p.enabled = true; } }
    this.ui.intro(this.world.title, this.world.question);
    setTimeout(() => this.ui.say(this.world.intro, 5000), 400);
    if (this.world.intro2) setTimeout(() => { this.ui.say(this.world.intro2, 5000); if (this.world.goal2) this.ui.setGoal(this.world.goal2); }, 5800);
  }
  /** 성능층 — 처음 몇 초 프레임을 재서 느리면 한 단계씩 내린다(해상도 → 나무·풀 수 → 그림자). 기기별로 기억(localStorage). ?tune=0 끔 (구조 설계 v1 §10) */
  autoTune() {
    const qs = new URLSearchParams(location.search); if (qs.get('tune') === '0') return;
    const key = 'kworld_tune'; this.tuneLevel = Number(localStorage.getItem(key) || 0); this.applyTune(this.tuneLevel);
    let n = 0, t0 = performance.now(), settled = 0; const target = 27;
    this.e.onFrame.push(() => {
      n++; const now = performance.now(); if (now - t0 < 2500) return; const fps = n / ((now - t0) / 1000); n = 0; t0 = now;
      if (settled++ < 1) return;   // 첫 구간(로딩 직후)은 버린다
      if (fps < target && this.tuneLevel < 3) { this.tuneLevel++; localStorage.setItem(key, String(this.tuneLevel)); this.applyTune(this.tuneLevel); }
      else if (fps > 55 && this.tuneLevel > 0 && settled > 8) { this.tuneLevel--; localStorage.setItem(key, String(this.tuneLevel)); this.applyTune(this.tuneLevel); }
    });
  }
  applyTune(level) {
    const r = this.e.renderer; r.setPixelRatio(Math.min(devicePixelRatio, level >= 1 ? 1.25 : 2));
    this.e.scene.traverse((o) => { if (!o.isInstancedMesh) return; if (o.userData.fullCount == null) o.userData.fullCount = o.count; if (/^woodland|meadow|river-stones/.test(o.name)) o.count = Math.floor(o.userData.fullCount * (level >= 2 ? 0.6 : 1)); });
    if (r.shadowMap.enabled !== (level < 3)) { r.shadowMap.enabled = level < 3; this.e.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }
    this.tuneLabel = ['', '해상도↓', '나무·풀 60%', '그림자 끔'][level];
  }
  /** 인물층 — 그 시대 사람 넷 중 하나로 산다. 능력은 「할 수 있다/없다」가 아니라 「편하다/힘들다」만 바꾼다(09-17 준호). 장점마다 단점 하나. */
  get stats() { return this.character?.stats || {}; }
  /** 손재주: craft 가 1보다 크면 첫 성공이 그만큼 어렵다(같은 것은 한 번만 미끄러진다 — 막지 않고 늦출 뿐) */
  fumble(key) { const c = this.stats.craft || 1; if (c <= 1 || !key) return false; this.fumbled ??= new Set(); if (this.fumbled.has(key)) return false; if (Math.random() < 1 - 1 / c) { this.fumbled.add(key); return true; } this.fumbled.add(key); return false; }
  async chooseCharacter(chars, saved) {
    if (saved) { const c = chars.find((x) => x.id === saved); if (c) { this.setCharacter(c); return; } }
    let remembered = null; try { remembered = localStorage.getItem('kworld_char:' + this.era); } catch { }
    const c = await new Promise((res) => this.ui.open(`<div class="chk"><div class="tag">누구로 살까</div><h3>강가의 사람 넷</h3><p class="sub">누구를 골라도 같은 것을 겪는다. 편한 것과 힘든 것이 다를 뿐.</p><ul class="mlist">${chars.map((x) => `<li><b>${x.name}</b><div class="mhint">👍 ${x.plus}<br>👎 ${x.minus}</div></li>`).join('')}</ul></div>`, chars.map((x) => ({ label: x.name, primary: x.id === remembered, onClick: () => { this.ui.close(); res(x); } }))));
    this.setCharacter(c);
  }
  setCharacter(c) { this.character = c; try { localStorage.setItem('kworld_char:' + this.era, c.id); } catch { } (this.telemetry ??= { missions: [], hints: 0, starved: 0 }).character = c.id; if (this.p?.body && c.look) this.p.body.traverse?.((m) => { if (!m.isMesh) return; const hex = m.material.color?.getHex?.(); if (hex === 0x506a62 && c.look.cloth) m.material = m.material.clone(), m.material.color.set(c.look.cloth); if (hex === 0x302d28 && c.look.hair) m.material = m.material.clone(), m.material.color.set(c.look.hair); }); }
  /** ?fps=1 — 왼쪽 위에 프레임·그리기 수(무거운 층을 찾을 때) */
  fpsMeter() {
    const el = document.createElement('div'); el.style.cssText = 'position:fixed;left:8px;top:8px;z-index:50;background:rgba(0,0,0,.55);color:#9f9;font:12px monospace;padding:4px 8px;border-radius:6px'; document.body.appendChild(el);
    let n = 0, t0 = performance.now(); this.e.onFrame.push(() => { n++; const now = performance.now(); if (now - t0 >= 1000) { const info = this.e.renderer.info.render; el.textContent = `${n} fps · draw ${info.calls} · tri ${(info.triangles / 1000) | 0}k · ${this.quality()}${this.tuneLabel ? ' · ' + this.tuneLabel : ''}`; n = 0; t0 = now; } });
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
  flag(f) { if (Array.isArray(f)) { for (const x of f) this.flag(x); return; } if (!f || this.flags.has(f)) return; this.save?.touch();
    if (/^act\d+$/.test(f)) this.checkpoint = { act: f, flags: [...this.flags, f], inventory: [...this.inventory] };   /* 체크포인트: ACT 시작마다(쓰러지면 여기로) */ this.flags.add(f); this.checkGate(); if (this.story) this.story.onFlag(); }
  /** 대상 정의: kinds(종류별 덮어쓰기) → rename(깃발에 따라 이름·동사·규칙이 바뀜, 첫 맞는 것) */
  defFor(t) {
    let d = this.items.targets[t.type]; if (!d) return null;
    if (d.kinds && t.kind && d.kinds[t.kind]) d = { ...d, ...d.kinds[t.kind] };
    if (d.rename) { const r = d.rename.find((x) => this.cond(x.if)); if (r) d = { ...d, ...r }; }
    return d;
  }
  cond(expr) { // "a && !b" 정도의 간단 조건
    if (!expr) return true;
    return expr.split('&&').every((t) => { t = t.trim(); const neg = t.startsWith('!'); const f = neg ? t.slice(1) : t; return neg ? !this.flags.has(f) : this.flags.has(f); });
  }
  renderInv() { this.ui.renderInventory(this.inventory, this.items.items, (k) => this.tapItem(k)); }
  tapItem(k) {
    const d = this.items.items[k];
    if (d.eat) { this.take(k); this.hunger = Math.max(0, Math.min(100, this.hunger + d.eat)); this.flag(d.flag); this.ui.say(d.say || `${d.icon} ${d.name}을(를) 먹었다.`, d.say ? 4200 : 3200); this.renderInv(); if (d.journal && this.story) this.story.journal(d.journal); }
    else this.ui.say(`${d.icon} ${d.name} — ${d.desc}`);
  }
  // ---------- 매 프레임 ----------
  tick(dt) {
    // 배고픔
    const h = this.world.hunger; const before = this.hunger; this.hunger = Math.max(0, this.hunger - h.perSecond * (this.hungerMul || 1) * (this.stats.hunger || 1) * dt); if (before > 0 && this.hunger === 0) (this.telemetry ??= { missions: [], hints: 0, starved: 0 }).starved++;
    const slow = this.hunger < h.slowBelow; this.p.speedMul = (slow ? 0.55 : 1) * (this.stats.speed || 1); this.ui.setHunger(this.hunger, slow);
    // 대상 안내
    if (!this.ui.isOpen()) {
      const t = this.target = this.e.pickTarget(this.e.camera, 3.2, this.p.pos);
      if (t) this.ui.setPrompt(this.promptFor(t));
      else { const near = this.e.pickTarget(this.e.camera, 9 * (this.stats.sense || 1), this.p.pos); this.ui.setPrompt(near ? this.infoFor(near) : null); }
    } else { this.target = null; this.ui.setPrompt(null); }
    // 시간이 지나면 바뀌는 대상(밭이 자라는 것 등)
    this.tickTimers();
    if (this.danger) this.danger.tick(dt);
    // 미션 나침반 + 힌트 시간
    this.updateMission(false);
    // 불꽃
    if (this.fire && this.fire.visible) { this.fire.rotation.y += dt * 2; this.fire.scale.y = ((this.fireBase ?? 3) < 2 ? 0.4 : 1) * (0.9 + Math.sin(performance.now() * 0.02) * 0.15); this.fireLight.intensity = (this.fireBase ?? 3) * (1 + Math.sin(performance.now() * 0.03) * 0.3); }
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
    const def = this.defFor(t); if (!def) return null;
    const st = def.states && def.states[t.state || 'unlit']; const info = (st && st.info) || def.info;
    return info ? { name: def.name, info } : null;
  }
  promptFor(t) {
    const def = this.defFor(t); if (!def) return null;
    let verb = def.verb; if (def.states) verb = def.states[t.state || 'unlit'].verb;
    if (t.type === 'gate' && this.world.gate && !this.gateOpen) verb = '아직 닫혀 있다 (눌러서 무엇이 남았는지 보기)';
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
    const def = this.defFor(t); if (!def) return;
    if (t.type === 'npc') { this.flag(def.flag); this.flag('talk:' + t.id); return this.talk(t); }
    if (t.type === 'gate') return this.enterGate();
    const rule = def.states ? def.states[t.state || 'unlit'] : def;
    if (rule.once && this.flags.has(rule.flag)) { this.ui.say(rule.say); return; }
    if (rule.choices) return this.choose(t, rule);
    if (rule.requiresFlags && !rule.requiresFlags.every((f) => this.flags.has(f))) { this.ui.say(rule.failNoFlag || rule.fail || '아직은 할 수 없어.', 4200); this.flag(rule.failFlag); if (rule.failHunger) this.hunger = Math.max(0, this.hunger + rule.failHunger); return; }
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
    this.after(t, rule);
  }
  /** 행동 뒤 공통: 배고픔 변화·달아나기·탐험일지 */
  after(t, rule) {
    if (rule.takes) { for (const k of rule.takes) this.take(k); this.renderInv(); }
    if ([].concat(rule.gives || []).includes('torch')) this.danger?.lightTorch();
    if (rule.hunger) { this.hunger = Math.max(0, Math.min(100, this.hunger + rule.hunger)); }
    if (rule.flee && this.story) this.story.flee(t, rule);
    if (rule.journal && this.story) setTimeout(() => this.story.journal(rule.journal), 1200);
  }
  /** 대상 앞 선택(먹는다 / 그냥 둔다 / 가져간다 …) — 정답 없음, 고른 것은 깃발로 남는다 */
  choose(t, rule) {
    this.p.enabled = false; this.flag(rule.flag);   // 살펴본 것 자체가 깃발(선택 전에)
    this.ui.open(`<div class="npc"><b>${rule.name || ''}</b><p>${rule.text || ''}</p></div>`, rule.choices.map((c) => ({ label: c.label, primary: true, onClick: () => {
      this.ui.close(); this.p.enabled = true;
      if (c.requiresFlags && !c.requiresFlags.every((f) => this.flags.has(f))) { this.ui.say(c.failNoFlag || '아직은 할 수 없어.', 4200); this.flag(c.failFlag); return; }
      if (c.requires && !this.has(c.requires)) { this.ui.say(c.failNoTool || '지금은 할 수 없어.', 4200); return; }
      if (c.consumes) { const need = {}; for (const k of c.consumes) need[k] = (need[k] || 0) + 1; for (const [k, n] of Object.entries(need)) if (this.count(k) < n) { this.ui.say(c.failNoTool || `${this.items.items[k].name}이(가) ${n}개는 있어야 한다.`, 4200); return; } for (const k of c.consumes) this.take(k); this.renderInv(); }
      if (c.set || c.hide || c.reveal) this.applyState(t, c);
      const gives = Array.isArray(c.gives) ? c.gives : (c.gives ? [c.gives] : []); for (const g of gives) this.inventory.push(g); if (gives.length) this.renderInv();
      if (c.say) this.ui.say(c.say, 4200); this.flag(rule.flag); this.flag(c.flag); this.after(t, c);
      if (c.uses) { t.uses++; if (rule.uses && t.uses >= rule.uses) { this.ui.say(rule.empty || '다 떨어졌어.', 2600); if (t.type === 'bush') this.stripBerries(t); else this.e.removeInteractable(t.name); } }
      if (c.why) setTimeout(() => this.showWhy(c.why), 1400);
    } })), 'npcpanel');
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
    const recipes = this.items.recipes.filter((r) => this.cond(r.showIf)).map((r) => ({ ...r, known: this.flags.has(r.flag) }));
    this.ui.craftPanel(this.inventory, this.items.items, recipes, (out) => this.craft(out), () => { this.ui.close(); this.p.enabled = true; });
  }
  craft(out) {
    const r = this.items.recipes.find((x) => x.out === out);
    if (r && r.pick) return this.craftPick(r);
    const need = {}; for (const i of r.in) need[i] = (need[i] || 0) + 1;
    for (const [k, n] of Object.entries(need)) if (this.count(k) < n) { this.ui.say('아무것도 안 됐어. 재료가 모자라.'); return; }
    if (this.fumble(r.out)) { this.ui.close(); this.p.enabled = true; this.ui.say(r.almost || '…거의 됐다. 손이 미끄러졌다. 다시.', 3600); return; }
    for (const i of r.in) if (!(r.keep || []).includes(i)) this.take(i);
    this.inventory.push(out); this.renderInv(); this.ui.close(); this.p.enabled = true;
    const d = this.items.items[out]; this.ui.say(r.say || `${d.icon} ${d.name}이(가) 됐다!`, r.say ? 4800 : 3200);
    this.flag(r.flag); if (r.journal && this.story) setTimeout(() => this.story.journal(r.journal), 1400);
    if (d.why) setTimeout(() => this.showWhy(d.why), 900);
  }
  /** 고르는 만들기: 같은 갈래(cat) 물건 n개를 골라 부딪쳐 본다 — 짝에 따라 되기도, 안 되기도 */
  craftPick(r) {
    const cands = [...new Set(this.inventory.filter((k) => this.items.items[k].cat === r.pick.cat))];
    this.ui.pickPanel(r, cands.map((k) => ({ key: k, n: this.count(k), d: this.items.items[k] })), (picked) => this.resolvePick(r, picked), () => { this.ui.close(); this.p.enabled = true; });
  }
  resolvePick(r, picked) {
    const key = picked.slice().sort().join('+');
    const res = r.results.find((x) => x.in && x.in.slice().sort().join('+') === key) || r.results.find((x) => x.in && x.in.includes('*') && picked.includes(x.in.find((i) => i !== '*'))) || r.results.find((x) => !x.in);
    this.ui.close(); this.p.enabled = true; if (!res) return;
    if (res.out && this.fumble(r.id || r.out)) { this.ui.say(res.almost || '…거의 됐다. 손이 미끄러졌다. 다시.', 3600); return; }
    const consume = res.consume || (res.out ? picked : []); for (const c of consume) this.take(c);
    if (res.out) this.inventory.push(res.out); this.renderInv();
    this.ui.say(res.say || '…아무 일도 없었다.', 4200); this.flag(res.flag); if (res.out) this.flag(r.flag);
    if (res.journal && this.story) setTimeout(() => this.story.journal(res.journal), 1400);
    const d = res.out && this.items.items[res.out]; if (d && d.why) setTimeout(() => this.showWhy(d.why), 900);
  }
  talk(t) {
    const npc = this.npcs[t.id]; if (!npc) return;
    const line = npc.lines.find((l) => this.cond(l.if)) || npc.lines[npc.lines.length - 1];
    this.p.enabled = false;
    const done = () => { this.ui.close(); this.p.enabled = true; this.flag(line.flag); if (line.why) setTimeout(() => this.showWhy(line.why), 600); if (line.journal && this.story) setTimeout(() => this.story.journal(line.journal), 900); };
    if (line.choices) { // 선택형 대사(딜레마) — 정답 없음, 고른 것은 깃발로만 남는다
      this.ui.open(`<div class="npc"><b>${npc.name}</b><p>${line.text}</p></div>`, line.choices.map((c) => ({ label: c.label, primary: true, onClick: () => { this.ui.close(); this.p.enabled = true; this.flag(line.flag); this.flag(c.flag); if (c.say) this.ui.say(c.say, 5600); this.after(t, c); if (c.journal && this.story) setTimeout(() => this.story.journal(c.journal), 1200); const w = c.why || line.why; if (w) setTimeout(() => this.showWhy(w), 1400); } })), 'npcpanel');
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
    if (m.any) return m.any.some((f) => this.flags.has(f));
    if (m.count) return this.count(m.count[0]) >= m.count[1] || (m.or && this.flags.has(m.or));
    return false;
  }
  updateMission(force) {
    const ms = this.missions.missions;
    let changed = force;
    while (this.mi < ms.length && this.missionDone(ms[this.mi])) { const sec = Math.round((performance.now() - this.missionStart) / 1000); (this.telemetry ??= { missions: [], hints: 0, starved: 0 }).missions.push({ id: ms[this.mi].id, sec, hints: this.hintsThis || 0 }); this.hintsThis = 0; this.mi++; changed = true; this.missionStart = performance.now(); this.hintShown = false; if (!force) this.ui.say(`✅ ${ms[this.mi - 1].title}`, 2200); }
    const m = ms[this.mi];
    if (changed) this.ui.setMission(m ? m.title : `${this.world.short || ''} 완주!`, this.mi, ms.length);
    if (!m) return;
    // 나침반: 구역 방향
    const a = this.e.areas.get(m.area);
    if (a) { const d = a.clone().sub(this.p.pos); const dist = Math.hypot(d.x, d.z); const bearing = Math.atan2(-d.x, -d.z) - this.p.yaw; this.ui.setCompass(this.world.areas[m.area]?.name || m.area, bearing, dist); }
    // 오래 걸리면 힌트 버튼 반짝
    if (!this.hintShown && (performance.now() - this.missionStart) / 1000 > (this.missions.hintDelay || 45)) { this.hintShown = true; this.ui.pulseHint(); }
  }
  showHint() { (this.telemetry ??= { missions: [], hints: 0, starved: 0 }).hints++; this.hintsThis = (this.hintsThis || 0) + 1;
    const m = this.missions.missions[this.mi]; if (!m) { this.ui.say('할 일은 다 했어. 마음껏 둘러봐.'); return; }
    this.ui.say(`💡 ${m.hint}`, 6000); this.hintShown = true;
  }
  missionList() {
    if (this.ui.isOpen()) { this.ui.close(); this.p.enabled = true; return; }
    this.p.enabled = false;
    const ms = this.missions.missions;
    let lastAct = null;
    const html = '<h3>할 일</h3><ol class="mlist">' + ms.map((m, i) => { const head = m.act && m.act !== lastAct ? `<li class="acthead">${m.act}</li>` : ''; lastAct = m.act || lastAct; const locked = i > this.mi; return head + `<li class="${i < this.mi ? 'done' : (i === this.mi ? 'now' : 'locked')}">${i < this.mi ? '✅' : (i === this.mi ? '👉' : '🔒')} ${locked ? '· · ·' : m.title}${i === this.mi ? `<div class="mhint">💡 ${m.hint}</div>` : ''}</li>`; }).join('') + '</ol>' + (this.story ? this.story.journalHtml() : '');
    this.ui.open(html, [{ label: '닫기', primary: true, onClick: () => { this.ui.close(); this.p.enabled = true; } }]);
  }
  // ---------- 불 ----------
  addFire() {
    const it = [...this.e.interactables.values()].find((x) => x.type === 'fire'); if (!it) return;
    const g = createFire(this.e, it.center); this.fire = g;
    this.fireLight = new THREE.PointLight(0xff9a3a, 0, 14, 1.6); this.fireLight.position.copy(g.position).add(new THREE.Vector3(0, 0.8, 0)); this.e.scene.add(this.fireLight);
  }
  setFire(on, small = false) { this.fireBase = on ? (small ? 0.8 : 3) : 0; this.sound?.set('fire', on ? (small ? 0.12 : 0.34) : 0); if (this.fire) { this.fire.visible = on; this.fire.scale.setScalar(small ? 0.4 : 1); } if (this.fireLight) this.fireLight.intensity = this.fireBase; }
  // ---------- 시간의 문 ----------
  checkGate() {
    const g = this.world.gate; if (!g) return; const ok = g.requires.every((f) => this.flags.has(f));
    if (ok && !this.gateOpen) { this.gateOpen = true; this.ui.setGoal(`시간의 문이 열렸다. ${g.hint || '문으로 가 보자.'}`); this.updateMission(false); this.ui.say('어디선가 바람이… 시간의 문이 열렸다!', 4000); }
  }
  enterGate() {
    if (!this.gateOpen) { const g = this.world.gate; if (!g) { this.ui.say('빛나는 문. 아직은 아무 일도 없다.'); return; } const left = g.requires.filter((f) => !this.flags.has(f)).length; this.ui.say(`아직 닫혀 있다. 해야 할 일이 ${left}가지 남았어.`); return; }
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
