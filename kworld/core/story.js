// 케이히스토리 엔진 · story.js — 「장면 층」. world.json 이 scene 을 가리키면 GLB 위에 json 좌표로 대상·사람을 더 놓는다.
// 이야기(프롤로그·탐험일지·끝 화면)도 여기. 코어는 시대 이름을 모른다.
import * as THREE from 'three';
import { PROPS } from './props.js';

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
      let i = 0; for (const key of Object.keys(this.g.world.people)) { this.place({ id: key + '0', kind: key, x: this.s.spawn[0] + (i++ - 1) * 1.6, z: this.s.spawn[1] - 4, yaw: 0, prop: 'person', name: 'npc_' + key + '0' }); }
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
    const mixer = new THREE.AnimationMixer(inst); const clips = g.animations; const find = (k) => clips.find((c) => c.name.includes(k)); const idle = find('wait') || find('idle') || clips[0];
    obj.userData.actions = { idle: idle && mixer.clipAction(idle), walk: find('walk') && mixer.clipAction(find('walk')), run: find('run') && mixer.clipAction(find('run')) };
    if (obj.userData.actions.idle) { obj.userData.actions.idle.play(); obj.userData.actions.idle.time = Math.random() * 2; }
    obj.userData.mixer = mixer; this.mixers.push(mixer); obj.userData.animate = null;
    const it = this.g.e.interactables.get(a.name); if (it) { it.box.setFromObject(obj); it.center.copy(it.box.getCenter(new THREE.Vector3())); }
  }
  place(a) {
    const e = this.g.e; const fn = PROPS[a.prop]; if (!fn) return;
    const obj = a.prop === 'person' ? fn(a.look || {}) : fn(a.pkind || a.kind, a.seed || 1);   // pkind: 소품 모양은 같고 규칙 종류만 다를 때
    const model = a.prop === 'person' ? this.personModel(a.id || a.name.replace(/^npc_/, '')) : null;
    const y = e.groundY(a.x, a.z) + (a.dy || 0); obj.position.set(a.x, y, a.z); if (a.yaw != null) obj.rotation.y = a.yaw; if (a.scale) obj.scale.setScalar(a.scale);
    e.scene.add(obj);
    if (obj.userData.animate) { let t = 0; e.onFrame.push((dt) => { if (!obj.userData.animate) return; t += dt; obj.userData.animate(t, false); }); }
    const box = new THREE.Box3().setFromObject(obj); if (box.max.y - box.min.y < 0.6) box.expandByScalar(0.3);
    const [type, ...rest] = a.name.split('_');
    const it = { type, id: rest.join('_') || type, obj, box, center: box.getCenter(new THREE.Vector3()), uses: 0, state: null, name: a.name, kind: a.kind, showIf: a.showIf, fleeOn: a.fleeOn, fleeTo: a.fleeTo };
    e.interactables.set(a.name, it);
    if (a.showIf) this.cond.push(it);
    if (a.fleeOn) (this.fleeers ??= []).push(it);
    if (model) this.loadPerson(obj, model, a).catch((err) => console.warn('person GLB', a.name, err));
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
  }
  snapshot() { const e = this.g.e; const hemi = e.scene.children.find((o) => o.isHemisphereLight); const u = e.skyDome && e.skyDome.material.uniforms;
    return { sun: e.sun.intensity, sunC: e.sun.color.clone(), hemi: hemi ? hemi.intensity : 0.3, fogC: e.scene.fog ? e.scene.fog.color.clone() : null, fogN: e.scene.fog?.near, fogF: e.scene.fog?.far, exp: e.renderer.toneMappingExposure, sky: u && { z: u.uZenith.value.clone(), h: u.uHorizon.value.clone(), a: u.uHaze.value.clone(), s: u.uSunColor.value.clone(), c: u.uCloud.value } }; }
  /** 비 — 플레이어 주변에 떨어지는 점들 */
  rain(on) {
    const e = this.g.e; if (!e.scene.add || !this.g.p?.pos) { this.rainOn = on; return; }
    if (on && !this.rainPts) { const n = 1600; const arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - .5) * 44; arr[i * 3 + 1] = Math.random() * 18; arr[i * 3 + 2] = (Math.random() - .5) * 44; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); this.rainPts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfd0e6, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })); this.rainPts.frustumCulled = false; e.scene.add(this.rainPts); }
    if (this.rainPts) this.rainPts.visible = on; this.rainOn = on;
  }
  /** 사건: world.events — on(조건) 이 참이 되는 순간 한 번, do 를 순서대로 */
  runEvents() {
    for (const ev of this.g.world.events || []) if (!ev.done && this.g.cond(ev.on)) { ev.done = true; this.doActions(ev.do || []); }
  }
  async doActions(list) {
    const g = this.g; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const a of list) {
      if (a.wait) await sleep(this.fast ? 5 : a.wait * 1000);
      if (a.say) g.ui.say(a.say, a.ms || 4800);
      if (a.goal != null) g.ui.setGoal(a.goal);
      if (a.sky) this.transition(a.sky, a.sec);
      if (a.rain != null) this.rain(a.rain);
      if (a.fire != null) g.setFire(a.fire, a.small);
      if (a.cold != null) g.hungerMul = a.cold;
      if (a.lines) await this.overlay(a);
      if (a.cutscene) await this.cutscene(a.cutscene);
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
    const g = this.g; g.p.enabled = false;
    for (const st of seq) {
      if (st.lines) { await this.overlay(st); continue; }
      if (st.card) { await new Promise((res) => g.ui.open(`<div class="chk">${st.card.tag ? `<div class="tag">${st.card.tag}</div>` : ''}${st.card.icon ? `<div style="font-size:44px;text-align:center;margin:6px 0">${st.card.icon}</div>` : ''}<h3>${st.card.title || ''}</h3>${(st.card.body || []).map((b) => `<p>${b}</p>`).join('')}${st.card.items ? '<ul class="mlist">' + st.card.items.map((x) => `<li>${x}</li>`).join('') + '</ul>' : ''}${st.card.sub ? `<p class="sub">${st.card.sub}</p>` : ''}</div>`, [{ label: st.card.button || '…', primary: true, onClick: () => { g.ui.close(); res(); } }])); continue; }
      if (st.check) { await new Promise((res) => { const run = () => g.ui.check(st.check, null, (results) => { g.results = [...(g.results || []), ...results]; res(); }, () => { g.ui.say(st.check.revisitSay || '다시 보자.', 3000); run(); }); run(); }); continue; }
      if (st.reveal) { await new Promise((res) => g.ui.open(`<div class="chk"><div class="tag">${st.reveal.tag || '이 시대의 이름'}</div><h3 style="font-size:30px;letter-spacing:2px">${st.reveal.name}</h3>${(st.reveal.body || []).map((b) => `<p>${b}</p>`).join('')}</div>`, [{ label: st.reveal.button || '알겠어', primary: true, onClick: () => { g.ui.close(); res(); } }])); continue; }
      if (st.flag) g.flag(st.flag);
    }
    g.p.enabled = true;
  }
  /** 밤: 해가 지고, 안개가 가까워지고, 춥다(배고픔이 빨라진다) — 불이 살아나면 추위는 멎는다 */
  startNight(n) {
    const e = this.g.e; this.nightOn = true;
    if (n.ember) this.g.setFire(true, true);   // 바라가 지키는 작은 불
    this.transition('night', n.sec || 9);
    this.g.ui.say(n.intro || '해가 진다.', 5200); if (n.goal) setTimeout(() => this.g.ui.setGoal(n.goal), 3000);
    if (n.sounds) { let i = 0; this.soundTimer = setInterval(() => { if (this.warm || this.ended) { clearInterval(this.soundTimer); return; } this.g.ui.say(n.sounds[i++ % n.sounds.length], 3600); }, n.soundGap || 26000); }
    this.g.hungerMul = n.coldMul || 2.4; this.g.updateMission(false);
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
    if (this.rainPts && this.rainPts.visible) { const p = this.rainPts.geometry.attributes.position; const a = p.array; const c = this.g.p.pos; for (let i = 0; i < a.length; i += 3) { a[i + 1] -= dt * 14; if (a[i + 1] < -1) { a[i + 1] = 18; a[i] = c.x + (Math.random() - .5) * 44; a[i + 2] = c.z + (Math.random() - .5) * 44; } } p.needsUpdate = true; }
    for (const mx of this.mixers || []) mx.update(dt);
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
      [{ label: end.button || '더 둘러보기', primary: true, onClick: () => { g.ui.close(); g.p.enabled = true; } }]);
  }
}
