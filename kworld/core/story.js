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
    for (const [k, v] of Object.entries(this.s.areas || {})) e.areas.set(k, new THREE.Vector3(v[0], e.groundY(v[0], v[1]), v[1]));
    e.onFrame.push((dt) => this.tick(dt));
    this.onFlag();
  }
  place(a) {
    const e = this.g.e; const fn = PROPS[a.prop]; if (!fn) return;
    const obj = a.prop === 'person' ? fn(a.look || {}) : fn(a.pkind || a.kind, a.seed || 1);   // pkind: 소품 모양은 같고 규칙 종류만 다를 때
    const y = e.groundY(a.x, a.z) + (a.dy || 0); obj.position.set(a.x, y, a.z); if (a.yaw != null) obj.rotation.y = a.yaw; if (a.scale) obj.scale.setScalar(a.scale);
    e.scene.add(obj);
    if (obj.userData.animate) { let t = 0; e.onFrame.push((dt) => { t += dt; obj.userData.animate(t, false); }); }
    const box = new THREE.Box3().setFromObject(obj); if (box.max.y - box.min.y < 0.6) box.expandByScalar(0.3);
    const [type, ...rest] = a.name.split('_');
    const it = { type, id: rest.join('_') || type, obj, box, center: box.getCenter(new THREE.Vector3()), uses: 0, state: null, name: a.name, kind: a.kind, showIf: a.showIf, fleeOn: a.fleeOn, fleeTo: a.fleeTo };
    e.interactables.set(a.name, it);
    if (a.showIf) this.cond.push(it);
    if (a.fleeOn) (this.fleeers ??= []).push(it);
    return it;
  }
  /** 깃발이 바뀔 때: showIf 다시 보고, 끝 화면 */
  onFlag() {
    for (const it of this.cond) { const on = this.g.cond(it.showIf); it.obj.visible = on; it.disabled = !on; }
    // fleeOn: 이 깃발이 서면 달아난다(무리가 냄새를 맡고 도망치는 것) — 보이는 것만
    for (const it of this.fleeers || []) if (!it.fled && it.obj.visible && this.g.cond(it.fleeOn)) { it.fled = true; this.cond = this.cond.filter((c) => c !== it); this.flee(it, { flee: { to: it.fleeTo || [0, 60], sec: 3 } }); }
    const night = this.g.world.night; if (night && !this.nightOn && this.g.flags.has(night.on)) this.startNight(night);
    if (night && this.nightOn && night.warmOn && !this.warm && this.g.flags.has(night.warmOn)) { this.warm = true; this.g.hungerMul = 1; this.g.ui.setGoal(night.warmGoal || ''); }
    const end = this.g.world.end; if (end && !this.ended && this.g.flags.has(end.flag)) { this.ended = true; setTimeout(() => this.showEnd(end), 1800); }
  }
  /** 달아나기: 대상이 to 쪽으로 sec 동안 달려가 사라진다 */
  flee(it, rule) {
    const e = this.g.e; const from = it.obj.position.clone(); const to = new THREE.Vector3(rule.flee.to[0], 0, rule.flee.to[1]); const sec = rule.flee.sec || 3;
    it.obj.rotation.y = Math.atan2(to.x - from.x, to.z - from.z) + Math.PI / 2; it.disabled = true;
    this.movers.push({ it, from, to, sec, t: 0 });
  }
  /** 밤: 해가 지고, 안개가 가까워지고, 춥다(배고픔이 빨라진다) — 불이 살아나면 추위는 멎는다 */
  startNight(n) {
    const e = this.g.e; this.nightOn = true; this.nightT = 0; this.nightSec = n.sec || 9;
    if (n.ember) this.g.setFire(true, true);   // 바라가 지키는 작은 불
    if (e.sun) this.day = { sun: e.sun.intensity, sunC: e.sun.color.clone(), fogC: e.scene.fog ? e.scene.fog.color.clone() : null, fogN: e.scene.fog?.near, fogF: e.scene.fog?.far, exp: e.renderer.toneMappingExposure };
    const hemi = e.sun && e.scene.children.find((o) => o.isHemisphereLight); if (hemi) this.day.hemi = hemi.intensity;
    if (e.skyDome) { const u = e.skyDome.material.uniforms; this.day.sky = { z: u.uZenith.value.clone(), h: u.uHorizon.value.clone(), a: u.uHaze.value.clone(), s: u.uSunColor.value.clone(), c: u.uCloud.value }; }
    this.g.ui.say(n.intro || '해가 진다.', 5200); if (n.goal) setTimeout(() => this.g.ui.setGoal(n.goal), 3000);
    if (n.sounds) { let i = 0; this.soundTimer = setInterval(() => { if (this.warm || this.ended) { clearInterval(this.soundTimer); return; } this.g.ui.say(n.sounds[i++ % n.sounds.length], 3600); }, n.soundGap || 26000); }
    this.g.hungerMul = n.coldMul || 2.4; this.g.updateMission(false);
  }
  tick(dt) {
    if (this.nightOn && this.day && this.nightT < this.nightSec) {
      this.nightT += dt; const k = Math.min(1, this.nightT / this.nightSec); const e = this.g.e; const d = this.day; const L = (a, b) => a + (b - a) * k;
      e.sun.intensity = L(d.sun, 0.12); e.sun.color.copy(d.sunC).lerp(new THREE.Color(0x6f86b8), k);
      const hemi = e.scene.children.find((o) => o.isHemisphereLight); if (hemi) hemi.intensity = L(d.hemi, 0.16);
      if (e.scene.fog) { e.scene.fog.color.copy(d.fogC).lerp(new THREE.Color(0x0b0f18), k); e.scene.fog.near = L(d.fogN, 6); e.scene.fog.far = L(d.fogF, 34); }
      e.renderer.toneMappingExposure = L(d.exp, 0.62);
      if (e.skyDome && d.sky) { const u = e.skyDome.material.uniforms; u.uZenith.value.copy(d.sky.z).lerp(new THREE.Color(0x05070f), k); u.uHorizon.value.copy(d.sky.h).lerp(new THREE.Color(0x141a2a), k); u.uHaze.value.copy(d.sky.a).lerp(new THREE.Color(0x1b1f33), k); u.uSunColor.value.copy(d.sky.s).lerp(new THREE.Color(0x2a3350), k); u.uCloud.value = d.sky.c * (1 - k * 0.7); }
    }
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
      let i = 0; const next = () => { if (i < pro.lines.length) { const p = document.createElement('p'); p.textContent = pro.lines[i++]; box.appendChild(p); setTimeout(next, pro.gap || 1300); } else btn.style.display = 'inline-block'; };
      setTimeout(next, 600);
      btn.onclick = () => { el.classList.add('off'); setTimeout(() => { el.remove(); res(); }, 1400); };
    });
  }
  showEnd(end) {
    const g = this.g; g.p.enabled = false;
    g.ui.open(`<div class="chk"><div class="tag">${end.tag || 'TO BE CONTINUED'}</div><h3>${end.title}</h3>${(end.body || []).map((b) => `<p>${b}</p>`).join('')}${end.next ? `<p class="sub">${end.next}</p>` : ''}</div>`,
      [{ label: end.button || '더 둘러보기', primary: true, onClick: () => { g.ui.close(); g.p.enabled = true; } }]);
  }
}
