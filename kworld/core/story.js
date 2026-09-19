// 케이히스토리 엔진 · story.js — 「장면 층」. world.json 이 scene 을 가리키면 GLB 위에 json 좌표로 대상·사람을 더 놓는다.
// 이야기(프롤로그·탐험일지·끝 화면)도 여기. 코어는 시대 이름을 모른다.
import * as THREE from 'three';
import { PROPS } from './props.js';
import { Actor, gather } from './actor.js';
import { hold, releaseCam } from './camera.js';

export class Story {
  constructor(game, scene) { this.g = game; this.s = scene; this.cond = []; this.movers = []; }
  /** GLB 로드·landscape 뒤에 부른다 */
  apply() {
    const e = this.g.e;
    for (const pat of this.s.remove || []) for (const k of [...e.interactables.keys()]) if (k === pat || (pat.endsWith('*') && k.startsWith(pat.slice(0, -1)))) e.removeInteractable(k);
    if (this.s.spawn) { e.spawn = new THREE.Vector3(this.s.spawn[0], 0, this.s.spawn[1]); }
    for (const a of this.s.add || []) this.place(a);
    for (const n of this.s.people || []) this.place({ ...n, prop: 'person', name: 'npc_' + n.id });
    // ?peek=1 — 자산 확인용: world.people 에 있는 사람들을 시작 지점 앞에 한 명씩 세워 둔다(이야기 깃발 무시)
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('peek') === '1' && this.s.spawn && this.g.world.people) {
      let i = 0; for (const key of Object.keys(this.g.world.people)) { this.place({ id: key + '0', kind: key, x: this.s.spawn[0] + (i++ - 1) * 1.6, z: this.s.spawn[1] + 4, yaw: Math.PI, prop: 'person', name: 'npc_' + key + '0' }); }   // 플레이어는 야영지(+z) 쪽을 보고 시작한다
      if (this.g.world.animals?.deer) this.place({ name: 'peek_deer', prop: 'deer', kind: 'big', x: this.s.spawn[0] + 4, z: this.s.spawn[1] + 5, yaw: 2.2 });
    }
    for (const [k, v] of Object.entries(this.s.areas || {})) e.areas.set(k, new THREE.Vector3(v[0], e.groundY(v[0], v[1]), v[1]));
    e.onFrame.push((dt) => this.tick(dt));
    this.onFlag();
  }
  /** 사람 GLB(Tripo 리깅+동작): world.people = { aru: "../../assets/people/aru.glb" } — id 의 글자 부분으로 찾는다(aru3 → aru). 없으면 관절 인형 */
  personModel(id) { const map = this.g.world.people; if (!map || typeof document === 'undefined' || typeof document.createElement !== 'function') return null; const key = id.replace(/\d+$/, ''); return map[key] ? { key, url: new URL(this.g.base + map[key], location.href).href } : null; }
  async loadPerson(obj, model, a) {
    this.gltfCache ??= {}; this.mixers ??= [];
    if (!this.gltfCache[model.key]) this.gltfCache[model.key] = (async () => { const [{ GLTFLoader }, { clone }] = await Promise.all([import('three/addons/loaders/GLTFLoader.js'), import('three/addons/utils/SkeletonUtils.js')]); const g = await new GLTFLoader().loadAsync(model.url); return { g, clone }; })();
    const { g, clone } = await this.gltfCache[model.key];
    const inst = clone(g.scene); const box = new THREE.Box3().setFromObject(inst); const h = box.max.y - box.min.y || 1; const s = (this.g.world.peopleHeight || 1.62) / h; inst.scale.setScalar(s); inst.position.y = -box.min.y * s; inst.rotation.y = this.g.world.peopleYaw || 0;   // 모델 정면이 다르면 world.peopleYaw 로 보정
    inst.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; if (o.material) { o.material.roughness = 0.9; o.material.metalness = 0; } } });
    for (const c of [...obj.children]) obj.remove(c);   // 관절 인형 자리를 GLB 로
    obj.add(inst);
    const mixer = new THREE.AnimationMixer(inst); obj.userData.animate = null;
    const actor = this.actors?.[a.id || a.name.replace(/^npc_/, '')]; if (actor) actor.setModel(inst, mixer, g.animations);
    const it = this.g.e.interactables.get(a.name); if (it) { it.box.setFromObject(obj); it.center.copy(it.box.getCenter(new THREE.Vector3())); }
  }
  /** 동물 GLB(Tripo, 뼈는 있으나 동작 없음): world.animals = { deer: url } — 소품 사슴(big/small) 자리에 얹고, 고개 뼈로 풀 뜯기, 달아날 땐 몸 흔들림 */
  async loadAnimal(obj, kind, a) {
    const map = this.g.world.animals; if (!map || !map[kind] || typeof document === 'undefined' || typeof document.createElement !== 'function') return;
    this.gltfCache ??= {}; const key = 'animal:' + kind;
    if (!this.gltfCache[key]) this.gltfCache[key] = (async () => { const [{ GLTFLoader }, { clone }] = await Promise.all([import('three/addons/loaders/GLTFLoader.js'), import('three/addons/utils/SkeletonUtils.js')]); const g = await new GLTFLoader().loadAsync(new URL(this.g.base + map[kind], location.href).href); return { g, clone }; })();
    const { g, clone } = await this.gltfCache[key];
    const inst = clone(g.scene); const box = new THREE.Box3().setFromObject(inst); const h = box.max.y - box.min.y || 1; const s = ((a.kind === 'small' ? 0.72 : 1.0) * (this.g.world.animalHeight?.[kind] || 1.0)) / h; inst.scale.setScalar(s); inst.position.y = -box.min.y * s; inst.rotation.y = this.g.world.animalYaw?.[kind] || 0;
    inst.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; if (o.material) { o.material.roughness = 0.95; o.material.metalness = 0; } } });
    for (const c of [...obj.children]) obj.remove(c); obj.add(inst);
    const heads = []; inst.traverse((o) => { if (o.isBone && /Head_[0-3]/.test(o.name)) heads.push(o); }); heads.forEach((b) => { b.userData.rx = b.rotation.x; });
    obj.userData.animal = { heads, graze: Math.random() * 6, phase: Math.random() * 6 };
    const it = this.g.e.interactables.get(a.name); if (it) { it.box.setFromObject(obj); it.center.copy(it.box.getCenter(new THREE.Vector3())); }
  }
  place(a) {
    const e = this.g.e; const fn = PROPS[a.prop]; if (!fn) return;
    const obj = a.prop === 'person' ? fn(a.look || {}) : fn(a.pkind || a.kind, a.seed || 1);   // pkind: 소품 모양은 같고 규칙 종류만 다를 때
    const model = a.prop === 'person' ? this.personModel(a.id || a.name.replace(/^npc_/, '')) : null;
    const y = e.groundY(a.x, a.z) + (a.dy || 0); obj.position.set(a.x, y, a.z); if (a.yaw != null) obj.rotation.y = a.yaw; if (a.scale) obj.scale.setScalar(a.scale);
    e.scene.add(obj);
    if (a.prop === 'person') { (this.actors ??= {})[a.id || a.name.replace(/^npc_/, '')] = new Actor(this.g, a.id || a.name, obj); }
    else if (obj.userData.animate) { let t = 0; e.onFrame.push((dt) => { if (!obj.userData.animate) return; t += dt; obj.userData.animate(t, false); }); }
    const box = new THREE.Box3().setFromObject(obj); if (box.max.y - box.min.y < 0.6) box.expandByScalar(0.3);
    const [type, ...rest] = a.name.split('_');
    const it = { type, id: rest.join('_') || type, obj, box, center: box.getCenter(new THREE.Vector3()), uses: 0, state: null, name: a.name, kind: a.kind, showIf: a.showIf, fleeOn: a.fleeOn, fleeTo: a.fleeTo };
    e.interactables.set(a.name, it);
    if (a.showIf) this.cond.push(it);
    if (a.fleeOn) (this.fleeers ??= []).push(it);
    if (model) this.loadPerson(obj, model, a).catch((err) => console.warn('person GLB', a.name, err));
    if (a.prop === 'deer' && a.kind !== 'down') { (this.animals ??= []).push(obj); this.loadAnimal(obj, 'deer', a).catch((err) => console.warn('animal GLB', a.name, err)); }
    return it;
  }
  /** 깃발이 바뀔 때: showIf 다시 보고, 끝 화면 */
  onFlag() {
    for (const it of this.cond) { const on = this.g.cond(it.showIf); it.obj.visible = on; it.disabled = !on; }
    // fleeOn: 이 깃발이 서면 달아난다(무리가 냄새를 맡고 도망치는 것) — 보이는 것만
    for (const it of this.fleeers || []) if (!it.fled && it.obj.visible && this.g.cond(it.fleeOn)) { it.fled = true; this.cond = this.cond.filter((c) => c !== it); this.flee(it, { flee: { to: it.fleeTo || [0, 60], sec: 3 } }); }
    const night = this.g.world.night; if (night && !this.nightOn && this.g.flags.has(night.on)) this.startNight(night);
    this.runEvents();
    if (night && this.nightOn && night.warmOn && !this.warm && this.g.flags.has(night.warmOn)) { this.warm = true; this.g.hungerMul = 1; this.g.ui.setGoal(night.warmGoal || ''); }
    const end = this.g.world.end; if (end && !this.ended && this.g.flags.has(end.flag)) { this.ended = true; setTimeout(() => this.showEnd(end), 1800); }
  }
  /** 달아나기: 대상이 to 쪽으로 sec 동안 달려가 사라진다 */
  flee(it, rule) {
    const e = this.g.e; const from = it.obj.position.clone(); const to = new THREE.Vector3(rule.flee.to[0], 0, rule.flee.to[1]); const sec = rule.flee.sec || 3;
    it.obj.rotation.y = Math.atan2(to.x - from.x, to.z - from.z) + Math.PI / 2; it.disabled = true;
    this.movers.push({ it, from, to, sec, t: 0 });
  }
  /** 하늘 팔레트: day 는 처음 값, night/dull 은 고정 값. transition(name, sec) 으로 천천히 바뀐다 */
  captureDay() {
    const e = this.g.e; if (!e.sun || this.day) return;
    this.day = { sun: e.sun.intensity, sunC: e.sun.color.clone(), fogC: e.scene.fog ? e.scene.fog.color.clone() : null, fogN: e.scene.fog?.near, fogF: e.scene.fog?.far, exp: e.renderer.toneMappingExposure };
    const hemi = e.scene.children.find((o) => o.isHemisphereLight); if (hemi) this.day.hemi = hemi.intensity;
    if (e.skyDome) { const u = e.skyDome.material.uniforms; this.day.sky = { z: u.uZenith.value.clone(), h: u.uHorizon.value.clone(), a: u.uHaze.value.clone(), s: u.uSunColor.value.clone(), c: u.uCloud.value }; }
    this.cur = this.pal('day');
  }
  pal(name) {
    const C = (x) => new THREE.Color(x); const d = this.day;
    if (name === 'night') return { sun: 0.12, sunC: C(0x6f86b8), hemi: 0.16, fogC: C(0x0b0f18), fogN: 6, fogF: 34, exp: 0.62, sky: { z: C(0x05070f), h: C(0x141a2a), a: C(0x1b1f33), s: C(0x2a3350), c: 0.15 } };
    if (name === 'dull') return { sun: 0.9, sunC: C(0xc9cdd6), hemi: 0.42, fogC: C(0x9aa2a8), fogN: 16, fogF: 70, exp: 0.86, sky: { z: C(0x6f7d8c), h: C(0xb5bcc1), a: C(0xb9bec4), s: C(0xd8dce0), c: 0.9 } };
    if (name === 'rainy') return { sun: 0.5, sunC: C(0x9aa4b8), hemi: 0.3, fogC: C(0x6b7480), fogN: 10, fogF: 50, exp: 0.75, sky: { z: C(0x3c4756), h: C(0x7d8791), a: C(0x848d97), s: C(0x9aa2ab), c: 1.0 } };
    return d ? { sun: d.sun, sunC: d.sunC.clone(), hemi: d.hemi, fogC: d.fogC ? d.fogC.clone() : null, fogN: d.fogN, fogF: d.fogF, exp: d.exp, sky: d.sky && { z: d.sky.z.clone(), h: d.sky.h.clone(), a: d.sky.a.clone(), s: d.sky.s.clone(), c: d.sky.c } } : null;
  }
  transition(name, sec = 9) {
    this.captureDay(); if (!this.day) return;
    this.from = this.snapshot(); this.to = this.pal(name); this.trT = 0; this.trSec = sec; this.skyName = name;
    this.g.sound?.set('wind', { night: 0.42, dull: 0.5, rainy: 0.55 }[name] ?? 0.35);
  }
  snapshot() { const e = this.g.e; const hemi = e.scene.children.find((o) => o.isHemisphereLight); const u = e.skyDome && e.skyDome.material.uniforms;
    return { sun: e.sun.intensity, sunC: e.sun.color.clone(), hemi: hemi ? hemi.intensity : 0.3, fogC: e.scene.fog ? e.scene.fog.color.clone() : null, fogN: e.scene.fog?.near, fogF: e.scene.fog?.far, exp: e.renderer.toneMappingExposure, sky: u && { z: u.uZenith.value.clone(), h: u.uHorizon.value.clone(), a: u.uHaze.value.clone(), s: u.uSunColor.value.clone(), c: u.uCloud.value } }; }
  /** 비 — 플레이어 주변에 떨어지는 점들 */
  rain(on) {
    const e = this.g.e; if (!e.scene.add || !this.g.p?.pos) { this.rainOn = on; return; }
    if (on && !this.rainPts) { const n = 1600; const arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - .5) * 44; arr[i * 3 + 1] = Math.random() * 18; arr[i * 3 + 2] = (Math.random() - .5) * 44; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); this.rainPts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfd0e6, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })); this.rainPts.frustumCulled = false; e.scene.add(this.rainPts); }
    if (this.rainPts) this.rainPts.visible = on; this.rainOn = on; this.g.sound?.set('rain', on ? 0.4 : 0);
  }
  /** 사건: world.events — on(조건) 이 참이 되는 순간 한 번, do 를 순서대로 */
  runEvents() {
    for (const ev of this.g.world.events || []) if (!ev.done && this.g.cond(ev.on)) { ev.done = true; this.doActions(ev.do || []); }
  }
  async doActions(list) {
    const g = this.g; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const a of list) {
      if (a.wait) await sleep(this.fast ? 5 : a.wait * 1000);
      if (a.sound) g.sound?.play(a.sound, a.gain);
      if (a.say) g.ui.say(a.say, a.ms || 4800);
      if (a.goal != null) g.ui.setGoal(a.goal);
      if (a.sky) this.transition(a.sky, a.sec);
      if (a.rain != null) this.rain(a.rain);
      if (a.fire != null) g.setFire(a.fire, a.small);
      if (a.cold != null) g.hungerMul = a.cold;
      if (a.lines) await this.overlay(a);
      if (a.cutscene) await this.cutscene(a.cutscene);
      if (a.actor) { const ac = this.actors?.[a.actor]; if (ac) { if (a.go) { const pr = ac.goTo(a.go, { anim: a.anim || 'walk', then: a.then || 'idle' }); if (a.await) await pr; } if (a.face) ac.face(a.face); if (a.play) ac.play(a.play); } }
      if (a.gather) { const acs = a.gather.map((id) => this.actors?.[id]).filter(Boolean); const c = acs[0]?.resolve(a.at) || (Array.isArray(a.at) && { x: a.at[0], z: a.at[1] }); if (acs.length && c) { const pr = gather(acs, c, { r: a.r, anim: a.anim, then: a.then }); if (a.await) await pr; } }
      if (a.flag) g.flag(a.flag);
    }
  }
  /** 검은 화면에 글자만(자동으로 넘어가거나 tap 버튼) — 프롤로그와 같은 틀 */
  overlay(a) {
    if (typeof document.createElement !== 'function') return Promise.resolve();
    this.g.p.enabled = false;
    return this.prologue({ lines: a.lines, gap: a.gap || 1500, tap: a.tap, auto: !a.tap, hold: a.hold }).then(() => { this.g.p.enabled = true; });
  }
  /** 컷신: 카드(card) · 확인(check) · 이름 공개(reveal) 를 순서대로. 플레이어는 멈춘다 */
  async cutscene(seq) {
    const g = this.g; g.p.enabled = false; this.cutsceneOn = true;
    for (const st of seq) {
      if (st.lines) { await this.overlay(st); continue; }
      if (st.timelapse) { await this.timelapse(st.timelapse); continue; }
      if (st.dig) { await this.dig(st.dig); continue; }
      if (st.restore) { this.restoreScene(); continue; }
      if (st.review) { await this.review(this.g.world.review); continue; }
      if (st.card) { await new Promise((res) => g.ui.open(`<div class="chk">${st.card.tag ? `<div class="tag">${st.card.tag}</div>` : ''}${st.card.icon ? `<div style="font-size:44px;text-align:center;margin:6px 0">${st.card.icon}</div>` : ''}<h3>${st.card.title || ''}</h3>${(st.card.body || []).map((b) => `<p>${b}</p>`).join('')}${st.card.items ? '<ul class="mlist">' + st.card.items.map((x) => `<li>${x}</li>`).join('') + '</ul>' : ''}${st.card.sub ? `<p class="sub">${st.card.sub}</p>` : ''}</div>`, [{ label: st.card.button || '…', primary: true, onClick: () => { g.ui.close(); res(); } }])); continue; }
      if (st.check) { await new Promise((res) => { const run = () => g.ui.check(st.check, null, (results) => { g.results = [...(g.results || []), ...results]; res(); }, () => { g.ui.say(st.check.revisitSay || '다시 보자.', 3000); run(); }); run(); }); continue; }
      if (st.reveal) { await new Promise((res) => g.ui.open(`<div class="chk"><div class="tag">${st.reveal.tag || '이 시대의 이름'}</div><h3 style="font-size:30px;letter-spacing:2px">${st.reveal.name}</h3>${(st.reveal.body || []).map((b) => `<p>${b}</p>`).join('')}</div>`, [{ label: st.reveal.button || '알겠어', primary: true, onClick: () => { g.ui.close(); res(); } }])); continue; }
      if (st.flag) g.flag(st.flag);
    }
    g.p.enabled = true; this.cutsceneOn = false; g.save?.touch();
  }
  /** ACT 13 「우리가 떠난 자리」 — 카메라가 야영지 위에 멈춘 채 시간이 흐른다: 불 꺼짐 → 비 → 낙엽 → 눈 → 흙이 덮음 (자산 0) */
  async timelapse(a) {
    const g = this.g; const e = g.e; const sleep = (ms) => new Promise((r) => setTimeout(r, this.fast ? 5 : ms));
    const c = this.resolveArea(a.at || 'camp'); if (!c) return; const y = e.groundY ? e.groundY(c.x, c.z) : 0;
    const vis = !!(e.camera && e.scene?.add); this.tl = { objs: [] };
    if (vis) hold(g, [c.x + 2, y + 9, c.z + 13], [c.x, y + 0.5, c.z]);
    const step = async (text, sec, fn) => { if (text) g.ui.say(text, sec * 1000 + 400); fn && fn(); await sleep(sec * 1000); };
    await step(a.lines?.[0] || '떠난다.', 2.2);
    await step('불이 꺼진다.', 2.4, () => g.setFire(false));
    await step('비.', 3.2, () => { this.rain(true); this.transition('rainy', 2.5); });
    await step('낙엽.', 3.2, () => { this.rain(false); this.transition('dull', 2.5); if (vis) e.scene.traverse((o) => { if (o.isInstancedMesh && /^woodland/.test(o.name) && o.material?.color) { o.userData.tlColor ??= o.material.color.clone(); o.material.color.set(0xb8783a); } }); });
    await step('눈.', 3.2, () => { if (vis && this.rainPts) { this.rainPts.material.color.set(0xffffff); this.rainPts.material.size = 0.14; this.tl.snow = true; } this.rain(true); if (vis) e.scene.traverse((o) => { if (o.isInstancedMesh && /^woodland/.test(o.name) && o.material?.color) o.material.color.set(0x8a7a66); }); });
    await step('흙.', 3.6, () => { this.rain(false); if (!vis) return; const disc = new THREE.Mesh(new THREE.CylinderGeometry(16, 17, 2.4, 40), new THREE.MeshStandardMaterial({ color: 0x5b4a36, roughness: 1 })); disc.position.set(c.x, y - 2.0, c.z); disc.receiveShadow = true; e.scene.add(disc); this.tl.objs.push(disc); this.tl.disc = disc; this.tl.discTo = y + 0.2; });
    await step('…', 1.4);
  }
  resolveArea(t) { if (Array.isArray(t)) return { x: t[0], z: t[1] }; const a = this.g.e.areas?.get(t); if (a) return { x: a.x, z: a.z }; const s = this.s.areas?.[t]; return s ? { x: s[0], z: s[1] } : null; }
  /** ACT 14 발굴 — 같은 자리에 구덩이·줄·유물(학생이 남긴 것: 재·뼈·날 선 돌·기둥 구멍), 카메라가 내려간다 */
  async dig(a) {
    const g = this.g; const e = g.e; const sleep = (ms) => new Promise((r) => setTimeout(r, this.fast ? 5 : ms));
    const c = this.resolveArea(a.at || 'camp'); if (!c) return; const y = (this.tl?.discTo ?? (e.groundY ? e.groundY(c.x, c.z) : 0));
    const vis = !!(e.camera && e.scene?.add); this.tl ??= { objs: [] };
    if (vis) {
      this.transition('day', 3);
      const M = (col, r = 1) => new THREE.MeshStandardMaterial({ color: col, roughness: r });
      const pit = new THREE.Mesh(new THREE.BoxGeometry(5, 1.3, 5), M(0x3a2e22)); pit.position.set(c.x, y - 0.55, c.z); e.scene.add(pit); this.tl.objs.push(pit);
      for (const [dx, dz] of [[-2.7, -2.7], [2.7, -2.7], [2.7, 2.7], [-2.7, 2.7]]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), M(0xe0d8c0)); post.position.set(c.x + dx, y + 0.4, c.z + dz); e.scene.add(post); this.tl.objs.push(post); }
      const rope = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-2.7, -2.7], [2.7, -2.7], [2.7, 2.7], [-2.7, 2.7]].map(([dx, dz]) => new THREE.Vector3(c.x + dx, y + 0.75, c.z + dz))), new THREE.LineBasicMaterial({ color: 0xffe08a })); e.scene.add(rope); this.tl.objs.push(rope);
      const ash = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), M(0x1a1512)); ash.rotation.x = -Math.PI / 2; ash.position.set(c.x - 0.6, y - 1.18, c.z + 0.4); e.scene.add(ash); this.tl.objs.push(ash);
      for (const [dx, dz, col, sz] of [[0.9, -0.8, 0x6d6560, 0.16], [1.3, 0.3, 0x9a8f80, 0.22], [-1.4, -1.1, 0xd9cfb8, 0.12]]) { const o = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), M(col, 0.8)); o.position.set(c.x + dx, y - 1.1, c.z + dz); e.scene.add(o); this.tl.objs.push(o); }
      for (const [dx, dz] of [[-1.8, 1.6], [1.9, 1.7], [0.1, -1.9]]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 10), M(0x241c14)); h.position.set(c.x + dx, y - 1.2, c.z + dz); e.scene.add(h); this.tl.objs.push(h); }
      const { cut } = await import('./camera.js');
      await cut(g, [{ pos: [c.x + 2, y + 9, c.z + 13], look: [c.x, y, c.z], sec: 0.01 }, { pos: [c.x + 1.5, y + 3.2, c.z + 4.6], look: [c.x - 0.3, y - 1.0, c.z], sec: this.fast ? 0.01 : 4.5, ease: 'inout' }], { release: false });
    }
    g.ui.say(a.say || '삽이 땅을 걷어낸다.', 3600); await sleep(1800);
  }
  /** 시대 정리 — 이번 시대에서 알게 된 것을 하나씩 되짚는다: 발견마다 「왜 필요했지?」(인과) + 열린 한 줄 → 시대 정리 카드. 결과는 g.results(개념 코드) */
  async review(r) {
    if (!r) return; const g = this.g; const J = g.world.journal || {};
    const got = (r.items || []).filter((it) => g.flags.has('journal:' + it.journal));
    await new Promise((res) => g.ui.open(`<div class="chk"><div class="tag">${r.tag || '정리'}</div><h3>${r.intro || '이번에 알게 된 것들'}</h3><ul class="mlist">${got.map((it) => `<li><b>${J[it.journal]?.title || it.journal}</b></li>`).join('')}</ul><p class="sub">${r.sub || '하나씩 되짚어 보자. 왜 그게 필요했는지.'}</p></div>`, [{ label: '되짚기', primary: true, onClick: () => { g.ui.close(); res(); } }]));
    const questions = got.map((it) => ({ id: 'rv:' + it.journal, type: 'choice', concept: it.concept || ('hist.' + it.journal), q: it.q, options: it.options, answer: it.answer ?? 0, revisit: it.revisit || 'camp', revisitText: it.revisitText || (J[it.journal]?.note || '') }));
    if (r.open) questions.push({ id: 'rv:open', type: 'open', concept: r.open.concept || 'hist.reflect', q: r.open.q });
    await new Promise((res) => { const run = () => g.ui.check({ questions, intro: '', done: '' }, null, (results) => { g.results = [...(g.results || []), ...results]; res(); }, () => { g.ui.say(r.revisitSay || '탐험일지를 다시 떠올려 보자.', 3000); run(); }); run(); });
    const okN = questions.filter((q) => q.type === 'choice').length; const gotOk = (g.results || []).filter((x) => String(x.id).startsWith('rv:') && x.ok).length;
    g.flag(r.flag || 'era:review');
    await new Promise((res) => g.ui.open(`<div class="chk"><div class="tag">${r.card?.tag || '시대 정리 카드'}</div><h3>${r.card?.title || ''}</h3>${(r.card?.body || []).map((b) => `<p>${b}</p>`).join('')}<ul class="mlist">${got.map((it) => `<li><b>${J[it.journal]?.title}</b><div class="mhint">${J[it.journal]?.note || ''}</div></li>`).join('')}</ul><p class="sub">되짚기 ${gotOk}/${okN} · ${r.card?.question || ''}</p></div>`, [{ label: r.card?.button || '알겠어', primary: true, onClick: () => { g.ui.close(); res(); } }]));
  }
  /** 컷신 뒤 세상 되돌리기(「더 둘러보기」) */
  restoreScene() {
    const e = this.g.e; if (this.tl) { for (const o of this.tl.objs) e.scene.remove?.(o); if (this.rainPts) { this.rainPts.material.color.set(0xbfd0e6); this.rainPts.material.size = 0.06; } e.scene.traverse?.((o) => { if (o.userData?.tlColor && o.material) o.material.color.copy(o.userData.tlColor); }); this.tl = null; }
    this.rain(false); this.transition('day', 2); if (e.camera) releaseCam(this.g);
  }
  /** 밤: 해가 지고, 안개가 가까워지고, 춥다(배고픔이 빨라진다) — 불이 살아나면 추위는 멎는다 */
  startNight(n) {
    const e = this.g.e; this.nightOn = true;
    if (n.ember) this.g.setFire(true, true);   // 바라가 지키는 작은 불
    this.transition('night', n.sec || 9);
    this.g.ui.say(n.intro || '해가 진다.', 5200); if (n.goal) setTimeout(() => this.g.ui.setGoal(n.goal), 3000);
    if (n.sounds) { let i = 0; this.soundTimer = setInterval(() => { if (this.warm || this.ended) { clearInterval(this.soundTimer); return; } this.g.ui.say(n.sounds[i++ % n.sounds.length], 3600); this.g.sound?.play('night_' + (i % 2 ? 'wolf' : 'rustle'), 0.4); }, n.soundGap || 26000); }
    this.g.hungerMul = (n.coldMul || 2.4) * (this.g.stats?.cold || 1); this.g.updateMission(false);
  }
  tick(dt) {
    if (this.to && this.trT < this.trSec) {
      this.trT += dt; const k = Math.min(1, this.trT / this.trSec); const e = this.g.e; const f = this.from, t = this.to; const L = (a, b) => a + (b - a) * k;
      e.sun.intensity = L(f.sun, t.sun); e.sun.color.copy(f.sunC).lerp(t.sunC, k);
      const hemi = e.scene.children.find((o) => o.isHemisphereLight); if (hemi) hemi.intensity = L(f.hemi, t.hemi);
      if (e.scene.fog && f.fogC && t.fogC) { e.scene.fog.color.copy(f.fogC).lerp(t.fogC, k); e.scene.fog.near = L(f.fogN, t.fogN); e.scene.fog.far = L(f.fogF, t.fogF); }
      e.renderer.toneMappingExposure = L(f.exp, t.exp);
      if (e.skyDome && f.sky && t.sky) { const u = e.skyDome.material.uniforms; u.uZenith.value.copy(f.sky.z).lerp(t.sky.z, k); u.uHorizon.value.copy(f.sky.h).lerp(t.sky.h, k); u.uHaze.value.copy(f.sky.a).lerp(t.sky.a, k); u.uSunColor.value.copy(f.sky.s).lerp(t.sky.s, k); u.uCloud.value = L(f.sky.c, t.sky.c); }
    }
    if (this.tl?.disc && this.tl.disc.position.y < this.tl.discTo) this.tl.disc.position.y = Math.min(this.tl.discTo, this.tl.disc.position.y + dt * 0.7);
    if (this.rainPts && this.rainPts.visible) { const p = this.rainPts.geometry.attributes.position; const a = p.array; const c = this.g.p.pos; for (let i = 0; i < a.length; i += 3) { a[i + 1] -= dt * 14; if (a[i + 1] < -1) { a[i + 1] = 18; a[i] = c.x + (Math.random() - .5) * 44; a[i + 2] = c.z + (Math.random() - .5) * 44; } } p.needsUpdate = true; }
    for (const k in this.actors || {}) { const ac = this.actors[k]; if (ac.obj.visible) ac.tick(dt); }
    for (const o of this.animals || []) { const an = o.userData.animal; if (!an || !o.visible) continue; an.graze += dt; const moving = this.movers.some((m) => m.it.obj === o);
      const down = moving ? 0 : (Math.sin(an.graze * 0.35 + an.phase) > 0.2 ? 0.75 : 0);   // 풀 뜯기: 한동안 고개 숙였다가 든다
      an.heads.forEach((b, i) => { b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, b.userData.rx + down * (i === 0 ? 0.45 : 0.25), dt * 2.5); });
      if (moving) o.children[0] && (o.children[0].rotation.x = Math.sin(an.graze * 14) * 0.08); else if (o.children[0]) o.children[0].rotation.x = THREE.MathUtils.lerp(o.children[0].rotation.x, 0, dt * 4); }
    for (const m of this.movers) {
      m.t += dt; const k = Math.min(1, m.t / m.sec); const x = m.from.x + (m.to.x - m.from.x) * k, z = m.from.z + (m.to.z - m.from.z) * k;
      m.it.obj.position.set(x, this.g.e.groundY(x, z) + Math.abs(Math.sin(m.t * 9)) * 0.35, z);
      if (k >= 1) { this.g.e.removeInteractable(m.it.name); }
    }
    this.movers = this.movers.filter((m) => m.t < m.sec);
  }
  /** 탐험일지: 조용히 한 줄 늘어난다 */
  journal(key) {
    const j = (this.g.world.journal || {})[key]; if (!j || this.g.flags.has('journal:' + key)) return;
    this.g.flags.add('journal:' + key); this.g.ui.say(`📔 발견 — **${j.title}**`, 3600); this.g.checkGate?.(); this.onFlag(); this.g.updateMission(false);
  }
  journalHtml() {
    const j = this.g.world.journal || {}; const got = Object.entries(j).filter(([k]) => this.g.flags.has('journal:' + k));
    return `<h3>📔 탐험일지</h3>${got.length ? '<ul class="mlist">' + got.map(([, v]) => `<li><b>${v.title}</b>${v.note ? `<div class="mhint">${v.note}</div>` : ''}</li>`).join('') + '</ul>' : '<p class="sub">아직 적은 게 없어. 세상을 돌아다녀 봐.</p>'}`;
  }
  /** 프롤로그: 검은 화면에 소리만, 눈을 뜨면 시작 */
  prologue(pro) {
    return new Promise((res) => {
      const el = document.createElement('div'); el.id = 'prologue';
      el.innerHTML = `<div class="pl"></div><button class="eye" style="display:none">${pro.tap || '눈을 뜬다'}</button>`; document.body.appendChild(el);
      const box = el.querySelector('.pl'); const btn = el.querySelector('.eye');
      const off = () => { el.classList.add('off'); setTimeout(() => { el.remove(); res(); }, 1400); };
      let i = 0; const next = () => { if (i < pro.lines.length) { const p = document.createElement('p'); p.textContent = pro.lines[i++]; box.appendChild(p); if (box.children.length > 6) box.removeChild(box.firstChild); setTimeout(next, pro.gap || 1300); } else if (pro.auto) setTimeout(off, pro.hold || 1600); else btn.style.display = 'inline-block'; };
      setTimeout(next, 600);
      btn.onclick = off;
    });
  }
  showEnd(end) {
    const g = this.g; g.p.enabled = false;
    g.ui.open(`<div class="chk"><div class="tag">${end.tag || 'TO BE CONTINUED'}</div><h3>${end.title}</h3>${(end.body || []).map((b) => `<p>${b}</p>`).join('')}${end.next ? `<p class="sub">${end.next}</p>` : ''}</div>`,
      [...(g.world.gate ? [{ label: g.world.gate.ready ? `${g.world.gate.nextName}로 가기` : `${g.world.gate.nextName}로 (준비 중)`, primary: true, onClick: () => { const gt = g.world.gate; if (gt.ready) { const u = new URL(location.href); u.searchParams.set('era', gt.next); location.href = u.toString(); } else g.ui.say(`${gt.nextName}는 다음에 열려. 오늘은 여기까지야.`, 4000); } }] : []), { label: end.button || '더 둘러보기', primary: !g.world.gate, onClick: () => { g.ui.close(); g.p.enabled = true; } }]);
  }
}
