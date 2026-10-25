// 케이히스토리 엔진 · road.js — 「길 위의 일」 층. world.road 가 있으면 켜진다. 코어는 시대 이름을 모른다. (?road=0 끔)
//  · 돌발(spark.surprises)은 카드가 느닷없이 떠서 고르게 한다. 길 위의 일은 **세상에 보인다** — 걷다 보면 앞길 10여 m 에 작은 것(보따리·주저앉은 사람·길을 막은 돌·새끼 짐승)이 놓인다.
//    가까이 가서 살펴보면(E) 작은 카드 — 길 둘셋, 값은 ±1 안팎, 📜 한 줄. 그냥 지나쳐도 된다: 멀어지거나 시간이 지나면 조용히 사라진다(pass 가 있으면 한 줄).
//  · 한 판에 같은 일은 한 번. 조용할 때(카드·쫓김·급한 일·짐승 없음)·걷는 중에만. 같은 자리에선 다시 안 놓인다.
//  · prop 'track' 에 beast(tiger·bear·boar)가 붙은 자국은 길에 then.lure 가 있으면 「따라가 본다」 → 짐승 층이 그 자리 둘레에 그 짐승을 세운다(113).
//  · 116: after:<kind> 가 붙은 일은 걷다 만나는 후보가 아니라 **짐승을 보내 준 자리**에 놓인다(beasts.end → afterBeast → 2.5초 뒤 그 자리, 40m 안·조용할 때만).
//  · 선택엔 roll(능력 굴림)·if(회색, 이유)·then/fail(값·흔적·물건·깃발) — 돌발과 같은 틀(spark.apply 재사용).
import * as THREE from 'three';
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const V = { craft: '✋ 솜씨', heart: '🤝 인심', grain: '🌾 곡식' };
const PROP = { bundle: ['bundle', 'sack'], person: ['person', null], stone: ['stone', 'hard'], stick: ['stick', 'dry'], animal: ['deer', 'small'], basket: ['bundle', 'basket'], bush: ['berryBush', 'red'], track: ['track', 'step'] };   // 일의 prop 이름 → 소품 함수·종류

export class Road {
  constructor(g, cfg) { this.g = g; this.cfg = cfg || {}; this.cur = null; this.since = cfg?.firstGap ?? 45; this.t = 0; this.walk = 0; this.lastAt = null; this.dom(); }
  dom() { if (typeof document === 'undefined' || typeof document.createElement !== 'function' || document.getElementById('roadfx')) return; const st = document.createElement('style'); st.id = 'roadfx'; st.textContent = `.chk.road .tag{color:#ffc78a}`; document.head.appendChild(st); }
  dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
  quiet() { const g = this.g; return !g.ui.isOpen?.() && !g.pulse?.chase && !g.pulse?.deadline && !g.story?.cutsceneOn && !g.danger?.enc && !g.danger?.eyesOn && !g.beasts?.busy && g.p?.enabled !== false; }
  /** 아직 안 온 일 중 지금 조건에 맞는 것 */
  cands() { const g = this.g; const night = !!g.story?.isNight; return (this.cfg.events || []).filter((s) => !s.after && !g.flags.has('road:' + s.id) && (s.night == null || !!s.night === night) && g.cond(s.if)); }
  // ---------- 놓기 ----------
  /** 116: 짐승을 보내 준 자리 — world.road.events 에 after:<kind> 가 붙은 일(「쫓겨난 자리의 발자국」)을 그 자리에 놓는다. 한 판에 종류마다 한 번. */
  afterBeast(kind, how, at) {
    const g = this.g; if (!at) return false; const s = (this.cfg.events || []).find((x) => x.after === kind && !g.flags.has('road:' + x.id) && g.cond(x.if)); if (!s) return false;
    this.pending = { s, x: at.x, z: at.z, how, t: 0 }; return true;
  }
  tickPending(dt) {
    const g = this.g; const pd = this.pending; pd.t += dt; if (pd.t < (this.cfg.afterSec ?? 2.5)) return; if (pd.t > 90) { this.pending = null; return; }
    if (!this.quiet()) return; const d = this.dist(pd, g.p.pos); if (d > 40) { this.pending = null; return; }
    const e = g.e; const gy = e.groundY ? e.groundY(pd.x, pd.z) : 0; if ((g.world.deepWater != null && gy < g.world.deepWater) || e.collides?.({ x: pd.x, z: pd.z }, 1.6)) { this.pending = null; return; }
    const yaw = Math.atan2(g.p.pos.x - pd.x, g.p.pos.z - pd.z) + Math.PI; this.pending = null; this.put(pd.s, { x: pd.x, z: pd.z, yaw });
  }
  tick(dt) {
    const g = this.g; if (!g.p?.pos || g.restoring) return;
    if (this.cur) return this.tickCur(dt);
    if (this.pending) return this.tickPending(dt);
    this.since += dt; if (g.p.moving) this.walk += dt; else this.walk = Math.max(0, this.walk - dt * 0.5);
    this.t += dt; if (this.t < 1.5) return; this.t = 0;
    if (this.since < (this.cfg.gapSec || 75) || this.walk < 4 || !this.quiet()) return;
    if (this.lastAt && this.dist(this.lastAt, g.p.pos) < (this.cfg.minMove || 22)) return;   // 같은 자리에서 또 안 온다
    const cands = this.cands(); if (!cands.length) return;
    if (Math.random() > (this.cfg.chance ?? 0.6)) { this.since = (this.cfg.gapSec || 75) - 15; return; }
    const spot = this.ahead(); if (!spot) { this.since = (this.cfg.gapSec || 75) - 8; return; }
    this.put(cands[Math.floor(Math.random() * cands.length)], spot);
  }
  /** 앞길 10~16m — 바닥이 깊은 물이 아니고, 건물 상자 안이 아니고, 땅 안인 자리. 정면이 막히면 좌우 25°. */
  ahead() {
    const g = this.g; const e = g.e; const p = g.p; const B = (g.world.bounds || 116) - 6; const hit = e.collides ? (x, z) => e.collides({ x, z }, 1.6) : () => false;
    for (const off of [0, 0.45, -0.45, 0.9, -0.9]) { const yaw = p.yaw + off; const dir = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      for (const d of [12, 15, 9]) { const x = p.pos.x + dir.x * d, z = p.pos.z + dir.z * d; if (Math.abs(x) > B || Math.abs(z) > B) continue; const gy = e.groundY ? e.groundY(x, z) : 0; if (g.world.deepWater != null && gy < g.world.deepWater) continue; if (hit(x, z)) continue; return { x, z, yaw }; } }
    return null;
  }
  put(s, spot) {
    const g = this.g; const st = g.story; if (!st?.place) return; const [fn, kind] = PROP[s.prop] || PROP.bundle; const name = 'road_' + s.id;
    const it = st.place({ id: 'road_' + s.id, name, prop: fn, kind: s.prop === 'person' ? undefined : kind, pkind: kind || undefined, look: s.look || { cloth: 0x7a6a52, hair: 0x2b2420 }, x: spot.x, z: spot.z, yaw: spot.yaw + Math.PI + (s.yaw || 0), seed: 3 + (this.cfg.events || []).indexOf(s), noAuto: true });
    if (!it) return; it.road = s; if (it.box.max.y - it.box.min.y < 1.2) it.box.expandByScalar(0.5); it.center.copy(it.box.getCenter(new THREE.Vector3()));
    this.cur = { s, it, t: 0, x: spot.x, z: spot.z, seen: false }; this.since = 0; this.walk = 0; this.lastAt = { x: spot.x, z: spot.z }; g.flags.add('road:' + s.id);
    this.mark(it.obj);
  }
  /** 바닥에 흐린 테 하나 — 「저기 뭐가 있다」가 멀리서도 보이게(숨은 것의 반짝임보다 조용히) */
  mark(obj) { if (!this.g.e.scene?.add) return; const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.95, 24), new THREE.MeshBasicMaterial({ color: 0xffc78a, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; obj.add(ring); this.cur.ring = ring; }
  tickCur(dt) {
    const g = this.g; const c = this.cur; c.t += dt; const d = this.dist(c, g.p.pos); if (c.ring) c.ring.material.opacity = 0.2 + Math.sin(c.t * 2.5) * 0.15;
    if (!c.seen && d < (c.s.seeR || 11) && !g.ui.isOpen?.()) { c.seen = true; g.sound?.play?.('meet', 0.18); g.ui.say(c.s.see || `👀 길 위에 — ${c.s.title}`, 2800); }
    if (c.opened) return;
    if (d > (c.s.leaveR || 40) || c.t > (c.s.staySec || 150)) this.pass(c);
  }
  /** 지나쳤다 — 조용히 치운다. pass 줄이 있고 한 번 봤으면 그 줄(값은 안 건드린다) */
  pass(c, quiet) { const g = this.g; this.remove(c); if (quiet) return; if (c.seen && c.s.pass) g.ui.say(c.s.pass, 3200); g.flags.add('road:' + c.s.id + ':passed'); }
  remove(c) { const g = this.g; if (c.it) g.e.removeInteractable(c.it.name); if (g.story?.actors) delete g.story.actors['road_' + c.s.id]; if (g.story?.animals) g.story.animals = g.story.animals.filter((o) => o !== c.it?.obj); if (this.cur === c) this.cur = null; }
  // ---------- 살펴보기 ----------
  prompt(t) { const s = t.road; if (!s) return null; return { action: true, name: s.title || '길 위의 것', verb: s.verb || '살펴본다' }; }
  info(t) { const s = t.road; if (!s) return null; return { name: s.title || '길 위의 것', info: s.info || '길에 놓여 있다' }; }
  open(t) {
    const g = this.g; const c = this.cur; const s = t.road; if (!s || !c || c.it !== t) return; c.opened = true; g.p.enabled = false; g.sound?.play?.('pick', 0.3); if (g.life?.scene) g.life.scene(s.sound, 350); else g.sound?.play?.(s.sound?.[0] || s.sound || 'pick', 0.3);   /* 127: 카드 뜨면 그 길 위의 일 소리 장면(데이터 sound 1~2) */
    const ways = (s.ways || []).map((w) => { const off = w.if && !g.cond(w.if); return { label: (off ? '▫ ' : '') + w.label + (w.roll ? ' 🎲' : ''), disabled: off, reason: off ? (w.why || '지금은 못 한다') : '', onClick: () => { if (off) return; this.choose(c, w); } }; });
    ways.push({ label: s.leave || '그냥 간다', onClick: () => { g.ui.close(); g.p.enabled = true; c.opened = false; this.pass(c, true); g.flag('road:' + s.id + ':left'); } });
    g.ui.open(`<div class="chk life road"><div class="tag">🛤 ${esc(s.tag || '길 위에서')}</div><h3>${esc(s.title || '')}</h3>${(s.body || []).map((b) => `<p>${esc(b)}</p>`).join('')}${s.ask ? `<p class="sub">${esc(s.ask)}</p>` : ''}</div>`, ways, 'roadpanel');
  }
  choose(c, w) {
    const g = this.g; const s = c.s; let out = w.then || {}; let ok = true;
    if (w.roll) { ok = g.life ? g.life.roll({ roll: w.roll, rollFail: w.fail?.say || '…안 됐다.', rollFailFlag: w.fail?.flag }) : Math.random() < 0.6; if (!ok) out = w.fail || {}; }
    g.ui.close(); const lines = this.apply(out); g.flag('road:' + s.id + ':' + (ok ? 'ok' : 'fail'));
    if (out.lure && s.beast) g.beasts?.lure?.(s.beast, { x: c.x, z: c.z });   // 113 발자국을 따라갔다 → 그 자리 둘레에 그 짐승이 선다
    const re = out.result || (ok ? w.result : null);
    g.ui.open(`<div class="chk life road"><div class="tag">🛤 ${esc(s.tag || '길 위에서')}</div><h3>${esc(re?.title || w.label)}</h3>${(re?.body || [out.say || (ok ? '…그렇게 했다.' : '…그렇게는 안 됐다.')]).map((b) => `<p>${esc(b)}</p>`).join('')}${lines.length ? `<p class="delta">${lines.join(' · ')}</p>` : ''}${s.fact ? `<div class="facts"><div>📜 <b>실제</b> ${esc(s.fact)}</div></div>` : ''}</div>`, [{ label: '…', primary: true, onClick: () => { g.ui.close(); g.p.enabled = true; this.remove(c); if (s.journal && g.story) g.story.journal(s.journal); g.spark?.checkTitles?.(); g.save?.touch(); } }]);
  }
  /** 효과 한 묶음 → 바뀐 것 줄 — 돌발과 같은 틀(spark 가 있으면 그것을, 없으면 여기서) */
  apply(out) {
    const g = this.g; if (g.spark?.apply) return g.spark.apply(out, null, true); const lines = []; if (!out) return lines; const L = g.life;
    for (const k of ['craft', 'heart', 'grain']) { const n = out[k]; if (!n) continue; if (k === 'grain' && !L?.d?.grain?.open) continue; L?.add(k, n); lines.push(`${V[k]} ${n > 0 ? '+' : ''}${n}`); }
    if (out.hurt) { L?.injure(out.hurt); lines.push(`🩹 ${L?.d?.hurts?.[out.hurt]?.name || out.hurt}`); } if (out.give) { for (const k of [].concat(out.give)) g.inventory.push(k); g.renderInv?.(); lines.push(`🎒 ${[].concat(out.give).map((k) => g.world.items?.[k]?.name || k).join('·')}`); }
    if (out.flag) setTimeout(() => { for (const f of [].concat(out.flag)) g.flag(f); }, 300); return lines;
  }
  snapshot() { return null; }   // 길 위의 일은 저장하지 않는다 — 다음 판에 다시 놓인다(road: 깃발은 flags 에 남아 같은 판엔 한 번)
}
