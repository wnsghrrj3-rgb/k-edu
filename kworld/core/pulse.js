// 케이히스토리 엔진 · pulse.js — 「긴장·설렘 층」. world.pulse 가 있으면 켜진다. 코어는 시대 이름을 모른다.
//  · 쫓김(chases): 깃발이 서면 쫓는 사람이 나타나 진짜로 달려온다(걷기보다 빠르고 달리기보다 느리다 — 달려야 산다).
//      숨는 자리에 먼저 닿아 숨을 죽이면 escapedFlag, 손이 닿으면 caughtFlag + 흔적. 심장 소리·붉은 가장자리가 같이 온다.
//  · 급한 일(deadlines): 깃발이 서면 모래시계 — 시간 안에 끝(until)을 못 내면 failFlag. 「왜군이 온다, 불이 번진다」가 글이 아니라 시간이 된다.
//  · 살아 있는 마을(routines): 사람이 낮·밤에 다른 자리로 걸어간다(장터→집). 서 있는 마을이 아니라 사는 마을.
//      마주침: 일과 사람 둘이 길에서 만나면 멈춰 서서 마주 보고 한마디 나눈 뒤 제 길을 간다(값·깃발 없음, 보이는 것뿐).
//  · 숨은 것(secrets): 길에서 안 보이는 자리에 반짝임 — 찾으면 한 줄·값·물려줄 물건(heirloom, 다음 시대 끝 카드에 보인다).
//  · 느낌(tension): 위험층·쫓김·급한 일이 같은 심장·가장자리를 쓴다. 0=없음 1=최고.
import * as THREE from 'three';
import { Actor } from './actor.js';
const MEET_R = 1.9, MEET_SEC = 2.4, MEET_GAP = 90, HEAR = 14, SAY_GAP = 20;   // 마주침: 거리·서 있는 시간·같은 둘 사이·들리는 거리·한마디 사이
const GREET_D = ['잘 지내나.', '오늘도 바쁘구먼.', '밥은 먹었나.', '비 올 것 같은데.', '그 얘기 들었나?', '어디 가는 길인가.', '먼저 가게, 나는 천천히.'];
const GREET_N = ['이 밤에 어딜 가나.', '불 조심하게.', '어서 들어가게.', '잘 자게.'];
const ABOUT = { warm: ['저기 가는 사람, 지난번에 나눠 줬다지.', '저 사람 집은 인심이 좋아.', '저 사람이 그때 도와준 사람이야.'], cold: ['저 사람하곤 엮이지 말게.', '혼자 먹던 사람이야, 저 사람.', '저 사람 말은 반만 믿게.'], mark: ['저 사람 다리를 봐… 그때 그 일이지.', '절뚝이는 사람, 저 사람이야.'] };   // 마주친 둘이 내 얘길 한다(마을의 눈과 같은 기준)
/** GLB 의 ix_npc_* 는 엔진이 세계 좌표를 자식 메시에 구워 둔 채 묶음(Group)을 원점에 둔다 — 그대로 Actor 에 주면 goTo·face·sway 가 **원점을 축으로** 사람을 돌리고 멀리 날린다(㉟ 헤드리스 확인: 일과 사람이 마을 밖으로 빙 돈 것).
 *  발밑 가운데(상자 x·z 가운데, y 는 바닥)를 묶음 자리로 옮기고 자식은 그만큼 되돌려, obj.position 이 그 사람이 선 자리가 되게 한다. 한 번만(userData.centered). */
const recenter = (grp) => { if (grp.userData.centered) return grp; grp.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(grp); grp.userData.centered = true; if (box.isEmpty() || !grp.children.length) return grp;   /* 시험의 빈 Group 은 그대로 */ const c = box.getCenter(new THREE.Vector3()); c.y = box.min.y;
  for (const m of grp.children) m.position.sub(c); grp.position.copy(c); grp.updateMatrixWorld(true); return grp; };
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export class Pulse {
  constructor(g, cfg) { this.g = g; this.cfg = cfg || {}; this.chase = null; this.deadline = null; this.secrets = []; this.level = 0; this.t = 0; this.heartT = 0; this.dom(); }
  dom() {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function' || document.getElementById('pulsefx')) return;
    const st = document.createElement('style'); st.textContent = `#pulsefx{position:fixed;inset:0;pointer-events:none;z-index:40;opacity:0;transition:opacity .4s;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 48%,rgba(120,0,0,.55) 100%)}#pulsefx.beat{animation:pbeat .9s infinite}@keyframes pbeat{0%{transform:scale(1)}30%{transform:scale(1.025)}100%{transform:scale(1)}}#pulsebar{position:fixed;left:50%;top:14px;transform:translateX(-50%);min-width:220px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:7px 12px;font-size:12px;backdrop-filter:blur(10px);display:none;z-index:30}#pulsebar b{color:#ffe08a}#pulsebar .bar{height:5px;background:rgba(255,255,255,.12);border-radius:3px;margin-top:5px;overflow:hidden}#pulsebar .bar i{display:block;height:100%;background:#f3a05a;transition:width .5s linear}#pulsebar.hot .bar i{background:#ff4d4d}.chk.secret .tag{color:#9fe0b0}`;
    document.head.appendChild(st); this.fx = document.createElement('div'); this.fx.id = 'pulsefx'; document.body.appendChild(this.fx);
    this.bar = document.createElement('div'); this.bar.id = 'pulsebar'; this.bar.innerHTML = '<div class="t"></div><div class="bar"><i></i></div>'; document.body.appendChild(this.bar);
  }
  /** 긴장 — 가장자리 붉기 + 심장(소리) */
  tension(v) { this.level = Math.max(0, Math.min(1, v)); if (this.fx) { this.fx.style.opacity = this.level ? String(0.25 + this.level * 0.7) : '0'; this.fx.classList.toggle('beat', this.level > 0.5); } }
  area(t) { if (Array.isArray(t)) return { x: t[0], z: t[1] }; const a = this.g.e.areas?.get(t); return a ? { x: a.x, z: a.z } : (this.g.story?.resolveArea?.(t) || null); }
  dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
  onFlag() { const g = this.g; if (g.restoring) return;
    for (const c of this.cfg.chases || []) if (!this.chase && !g.flags.has('chase:' + c.id) && g.cond(c.on) && !g.cond(c.until)) this.startChase(c);
    for (const d of this.cfg.deadlines || []) if (!this.deadline && !g.flags.has('deadline:' + d.id) && g.cond(d.on) && !g.cond(d.until)) this.startDeadline(d);
    if (this.deadline && g.cond(this.deadline.d.until)) this.endDeadline(true);
    if (this.chase && g.cond(this.chase.c.until)) this.endChase(null);
  }
  // ---------- 쫓김 ----------
  startChase(c) {
    const g = this.g; const st = g.story; if (!st) return; const p = g.p?.pos; if (!p) return; g.flags.add('chase:' + c.id);
    let from = this.area(c.from); if (!from) { const dir = new THREE.Vector3(-Math.sin(g.p.yaw), 0, -Math.cos(g.p.yaw)); from = { x: p.x - dir.x * (c.behind || 16), z: p.z - dir.z * (c.behind || 16) }; }
    const name = 'npc_chaser_' + c.id; const animal = c.pursuer?.animal;   // animal: 'wolf' 같은 world.animals 키 — 짐승이 쫓아온다(구석기·신석기), 없으면 사람
    const it = animal ? st.place({ id: 'chaser_' + c.id, name, prop: 'deer', kind: 'big', x: from.x, z: from.z, noAuto: true }) : st.place({ id: 'chaser_' + c.id, name, prop: 'person', look: c.pursuer?.look || { body: 0x2a2f3a, skin: 0xd7a981 }, x: from.x, z: from.z, noAuto: true });
    if (animal && it) st.loadAnimal?.(it.obj, animal, { name, kind: 'big' })?.then?.(() => { if (c.pursuer.scale) it.obj.scale.multiplyScalar(c.pursuer.scale); }).catch?.(() => { });
    const actor = st.actors?.['chaser_' + c.id] || (it && new Actor(g, 'chaser_' + c.id, it.obj)); if (it) it.disabled = true;   // 말 걸 수 없다 — 쫓아올 뿐
    this.chase = { c, it, actor, t: 0, re: 0, hide: 0, speed: c.speed || 4.6 };
    g.sound?.play?.('drum', 0.5); g.ui.say(c.say || '…뒤에서 발소리. 「거기 서!」', 4200); if (c.goal) g.ui.setGoal(c.goal); this.tension(0.75);
  }
  tickChase(dt) {
    const g = this.g; const ch = this.chase; const c = ch.c; const p = g.p.pos; const o = ch.actor?.obj; if (!o) return this.endChase(null);
    if (g.ui.isOpen?.()) return;   // 카드를 읽는 동안은 쫓는 사람도 멈춘다(상황이 열리며 바로 시작하는 쫓김 — 읽고 나서 달린다)
    if (ch.holdUntil > performance.now()) { ch.actor.tick(dt); this.tension(0.5); return; }   // 벗이 앞을 막은 동안(bond.blocking) 쫓는 사람은 서 있다
    ch.t += dt; const d = this.dist({ x: o.position.x, z: o.position.z }, p);
    ch.re += dt; if (ch.re > 0.35) { ch.re = 0; ch.actor.goTo([p.x, p.z], { anim: 'run', then: 'run', speed: ch.speed * (d > 30 ? 1.35 : 1) }); }   // 너무 멀어지면 따라붙는다(놓치지 않는다)
    ch.actor.tick(dt); this.tension(Math.max(0.35, 1 - d / 14)); if (d < 7 && !ch.near) { ch.near = true; g.sound?.play?.('growl', 0.3); g.ui.say(c.nearSay || '숨이 목에. 바로 뒤다.', 2400); } if (d > 10) ch.near = false;
    const goal = this.area(c.goal_at || c.goal); const hiding = goal && this.dist(goal, p) < (c.goalR || 5);
    if (hiding) { ch.hide += dt; if (ch.hide > 0.1 && !ch.hideSaid) { ch.hideSaid = true; g.ui.say(c.goalSay || '…숨을 죽인다. 움직이지 마.', 3000); g.ui.setGoal?.('가만히.'); } if (g.p.moving) ch.hide = Math.max(0, ch.hide - dt * 2); if (ch.hide > (c.hideSec || 4) && d > (c.loseR || 6)) return this.endChase('escaped'); } else ch.hide = 0;
    if (d < (c.catchR || 1.5) && ch.t > 1.2) return this.endChase('caught');
    if (ch.t > (c.maxSec || 150)) return this.endChase('escaped');   // 끝없이 쫓지는 않는다
  }
  /** 쫓는 사람을 sec 초 세운다(벗의 끼어듦) */
  hold(sec) { const ch = this.chase; if (!ch) return; ch.holdUntil = performance.now() + sec * 1000; if (ch.actor) { ch.actor.path = null; ch.actor.state = 'idle'; ch.actor.play?.('idle'); } }
  endChase(how) {
    const g = this.g; const ch = this.chase; if (!ch) return; this.chase = null; this.tension(0); const c = ch.c;
    if (how === 'caught') { g.sound?.play?.('bad', 0.6); g.ui.say(c.caughtSay || '…손이 어깨를 잡았다.', 4200); g.ui.setGoal?.(''); if (c.caughtHurt) g.life?.injure(c.caughtHurt); g.friends?.shout?.('caught', c.title); setTimeout(() => { this.removeChaser(ch); g.flag(c.caughtFlag); }, 1400); return; }
    if (how === 'escaped') { g.sound?.play?.('good', 0.5); g.ui.say(c.escapedSay || '…발소리가 멀어진다. 놓쳤다.', 4200); g.ui.setGoal?.(''); this.chaserLeave(ch); g.friends?.shout?.('escaped', c.title); setTimeout(() => g.flag(c.escapedFlag), 1200); return; }
    this.chaserLeave(ch);
  }
  chaserLeave(ch) { const g = this.g; const back = this.area(ch.c.from) || { x: ch.actor.obj.position.x + 30, z: ch.actor.obj.position.z + 30 }; ch.actor?.goTo([back.x, back.z], { anim: 'walk', then: 'idle' }).then(() => this.removeChaser(ch)); (this.leaving ??= []).push(ch.actor); }
  removeChaser(ch) { this.leaving = (this.leaving || []).filter((a) => a !== ch.actor); if (ch.it) this.g.e.removeInteractable(ch.it.name); if (this.g.story?.actors) delete this.g.story.actors[ch.actor?.id]; }
  // ---------- 급한 일 ----------
  startDeadline(d) { const g = this.g; g.flags.add('deadline:' + d.id); this.deadline = { d, left: d.sec || 60 }; g.sound?.play?.('drum', 0.4); g.ui.say(d.say || '시간이 없다.', 4000); if (this.bar) { this.bar.style.display = 'block'; this.bar.classList.remove('hot'); } this.renderBar(); }
  tickDeadline(dt) { const dl = this.deadline; if (this.g.ui.isOpen?.() || this.g.story?.cutsceneOn) return; dl.left -= dt; const k = dl.left / (dl.d.sec || 60); this.tension(Math.max(this.level, k < 0.3 ? 0.6 : 0.2)); if (k < 0.3 && !dl.hot) { dl.hot = true; this.bar?.classList.add('hot'); this.g.ui.say(dl.d.hotSay || '…거의 다 왔다.', 2600); } if ((dl.tk = (dl.tk || 0) + dt) > 0.5) { dl.tk = 0; this.renderBar(); } if (dl.left <= 0) this.endDeadline(false); }
  renderBar() { const dl = this.deadline; if (!this.bar || !dl) return; this.bar.querySelector('.t').innerHTML = `⏳ <b>${esc(dl.d.title || '')}</b> ${Math.max(0, Math.ceil(dl.left))}초`; this.bar.querySelector('.bar i').style.width = `${Math.max(0, Math.min(100, dl.left / (dl.d.sec || 60) * 100))}%`; }
  endDeadline(ok) { const g = this.g; const dl = this.deadline; if (!dl) return; this.deadline = null; this.tension(0); if (this.bar) this.bar.style.display = 'none'; if (ok) { if (dl.d.okSay) g.ui.say(dl.d.okSay, 3600); return; } g.sound?.play?.('bad', 0.6); g.ui.say(dl.d.failSay || '…늦었다.', 4400); g.friends?.shout?.('late', dl.d.title); if (dl.d.failThen) g.life?.doThen(dl.d.failThen); g.flag(dl.d.failFlag); }
  // ---------- 살아 있는 마을 ----------
  actorOf(id) { const st = this.g.story; const a = st?.actors?.[id]; if (a) return a; const it = this.g.e.interactables.get('npc_' + id); if (!it?.obj) return null; (this.wrapped ??= {})[id] ??= new Actor(this.g, id, recenter(it.obj), { speed: { walk: 1.2 }, yaw0: this.cfg.facing?.[id] || 0 }); return this.wrapped[id]; }
  /** 일과 목적지 — 구역 중심 둘레 r 에서 `e.collides` 가 거짓인 자리(건물 col_ 상자·담 안이 아닌 곳). 8방향을 r → 2r 로 돌고, 다 막히면 아무 각. (90-② 건물 구역에서 사람이 지붕·벽 속에 서던 것) */
  spot(to, r = 1.5) { const e = this.g.e; const hit = e.collides ? (x, z) => e.collides({ x, z }, 1.6) : () => false; const a0 = Math.random() * Math.PI * 2;
    for (const rr of [r, r * 2]) for (let i = 0; i < 8; i++) { const ang = a0 + i * Math.PI / 4; const x = to.x + Math.cos(ang) * rr, z = to.z + Math.sin(ang) * rr; if (!hit(x, z)) return [x, z]; }
    return [to.x + Math.cos(a0) * r, to.z + Math.sin(a0) * r]; }
  blocked(to) { const e = this.g.e; return !!(e.collides && e.collides({ x: to.x, z: to.z }, 1.6)); }   /* 92: 구역 중심이 건물 col_ 안이면(주막·서당·대장간) 거닐지 않는다 — 거닐면 집을 가로질러 지붕 속을 지나감(91 spot 시험이 그 틈에 걸려 흔들렸음) */
  tickRoutine(dt) {
    const g = this.g; const night = !!g.story?.isNight; this.rt = (this.rt || 0) + dt; const check = this.rt > 2.5; if (check) this.rt = 0;
    const who = []; for (const r of this.cfg.routines || []) { const a = this.actorOf(r.actor); if (!a) continue; who.push(a); if (this.wrapped?.[r.actor] === a) a.tick(dt);   /* 장면층 배우는 story 가 tick */
      if (!check || a.path || this.meet?.who.includes(a)) continue; if (r.if && !g.cond(r.if)) continue; const want = night ? (r.night || r.day) : r.day; const to = this.area(want); if (!to) continue; const o = a.obj; const d = this.dist({ x: o.position.x, z: o.position.z }, to);
      if (d > (r.r || 3)) { a.goTo(this.spot(to, 1.5), { anim: 'walk', then: r.then || 'idle' }).then(() => a.syncBox()); if (r.say && !night === !r.sayNight && !g.flags.has('routine:' + r.actor + ':' + (night ? 'n' : 'd'))) { g.flags.add('routine:' + r.actor + ':' + (night ? 'n' : 'd')); } }
      else if (r.wander && Math.random() < 0.25 && !this.blocked(to)) { a.goTo(this.spot(to, r.wander), { anim: 'walk', then: r.then || 'idle' }).then(() => a.syncBox()); } }
    this.tickMeet(dt, who);
  }
  // ---------- 마주침 ----------
  /** 일과 사람 둘이 길에서 MEET_R 안에 들면(한쪽은 걷는 중) 둘 다 멈춰 마주 보고 MEET_SEC 동안 선 뒤 걷던 길을 그대로 잇는다.
   *  같은 둘은 MEET_GAP 뒤에야 다시. 내가 HEAR 안에 있고 조용하면 「👥 이름·이름 — 한마디」(SAY_GAP 에 한 번). 값·깃발엔 손대지 않는다. */
  tickMeet(dt, who) {
    const g = this.g; this.mclock = (this.mclock || 0) + dt; const mt = this.meet;
    if (mt) { mt.left -= dt; if (mt.left > 0) return; this.meet = null; for (const [a, p] of mt.resume) if (p && !a.path) { a.path = p; a.state = p.anim; a.play(p.anim); } return; }
    if ((this.mt = (this.mt || 0) + dt) < 0.5) return; this.mt = 0; if (this.chase || g.ui.isOpen?.()) return;
    for (let i = 0; i < who.length; i++) for (let j = i + 1; j < who.length; j++) { const a = who[i], b = who[j]; if (!a.path && !b.path) continue;
      const d = Math.hypot(a.obj.position.x - b.obj.position.x, a.obj.position.z - b.obj.position.z); if (d > MEET_R) continue;
      const key = [a.id, b.id].sort().join('|'); if ((this.metAt?.[key] ?? -1e9) + MEET_GAP > this.mclock) continue; (this.metAt ??= {})[key] = this.mclock;
      this.meet = { who: [a, b], resume: [[a, a.path], [b, b.path]], left: MEET_SEC }; for (const x of [a, b]) { if (x.path) { x.path = null; x.state = 'idle'; x.play('idle', 0.3); } } a.face({ x: b.obj.position.x, z: b.obj.position.z }); b.face({ x: a.obj.position.x, z: a.obj.position.z });
      const near = g.p?.pos && Math.hypot(a.obj.position.x - g.p.pos.x, a.obj.position.z - g.p.pos.z) <= HEAR; if (near && (this.meetSaidAt ?? -1e9) + SAY_GAP <= this.mclock) { this.meetSaidAt = this.mclock; const night = !!g.story?.isNight; const pool = (night ? this.cfg.greetNight : this.cfg.greet) || (night ? GREET_N : GREET_D); const about = this.aboutMe(); const line = (about && Math.random() < 0.5) ? about : pool[Math.floor(Math.random() * pool.length)]; g.ui.say(`👥 ${this.nameOf(a.id)}·${this.nameOf(b.id)} — 「${line}」`, 3200); }
      for (const x of [a, b]) x.nod?.(1.2);
      return; }
  }
  /** 마주친 둘이 내 얘기를 할 때 — 절뚝이면 흔적 줄, 인심 ≥5 따뜻한 줄, 인심 ≤0(상황 둘 지난 뒤) 차가운 줄, 아니면 null. 시대 데이터 `pulse.greetAbout {warm,cold,mark}` 가 있으면 그것 */
  aboutMe() { const lf = this.g.life; if (!lf) return null; const P = this.cfg.greetAbout || {}; const pick = (k) => { const pool = P[k] || ABOUT[k]; return pool[Math.floor(Math.random() * pool.length)]; };
    if (lf.hurt?.has('leg')) return pick('mark'); if ((lf.values?.heart ?? 0) >= 5) return pick('warm'); if ((lf.values?.heart ?? 0) <= 0 && (lf.done?.size ?? 0) >= 2) return pick('cold'); return null; }
  nameOf(id) { const n = this.g.npcs?.[id]?.name; return (n || id).replace(/\s*\(.*?\)\s*$/, ''); }
  // ---------- 숨은 것 ----------
  placeSecrets() {
    const g = this.g; const e = g.e; if (!e.scene?.add) return; for (const s of this.cfg.secrets || []) { if (g.flags.has('secret:' + s.id)) continue; const base = this.area(s.at); if (!base) continue; const x = base.x + (s.dx || 0), z = base.z + (s.dz || 0); const y = e.groundY ? e.groundY(x, z) : 0;
      const grp = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: 0xa8f0c0, transparent: true, opacity: 0.85 }); for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), m); p.position.set((Math.random() - .5) * 0.8, 0.35 + Math.random() * 0.5, (Math.random() - .5) * 0.8); p.userData.ph = Math.random() * 6; grp.add(p); } const l = new THREE.PointLight(0x9fe0b0, 0.7, 4, 2); l.position.y = 0.6; grp.add(l); grp.position.set(x, y, z); e.scene.add(grp); this.secrets.push({ s, grp, x, z }); }
  }
  tickSecrets(dt) {
    const g = this.g; const p = g.p.pos; this.st = (this.st || 0) + dt;
    for (const sc of this.secrets) { if (sc.found) continue; for (const c of sc.grp.children) if (c.isMesh) c.position.y = 0.35 + Math.sin(this.st * 2 + c.userData.ph) * 0.18 + 0.2; const d = this.dist(sc, p); sc.grp.visible = d < (sc.s.seeR || 28);
      if (d < (sc.s.r || 2.2) && !g.ui.isOpen?.()) this.findSecret(sc); }
  }
  findSecret(sc) {
    const g = this.g; const s = sc.s; sc.found = true; g.e.scene.remove?.(sc.grp); g.flags.add('secret:' + s.id); g.p.enabled = false; g.sound?.play?.('good', 0.5);
    const deltas = []; if (s.craft) { g.life?.add('craft', s.craft); deltas.push(`✋ 솜씨 +${s.craft}`); } if (s.heart) { g.life?.add('heart', s.heart); deltas.push(`🤝 인심 +${s.heart}`); } if (s.give) { for (const k of [].concat(s.give)) g.inventory.push(k); g.renderInv?.(); }
    if (s.heirloom) { Pulse.keep(g, { id: s.id, name: s.heirloom, tag: s.tag || null, fact: s.fact || null }); deltas.push(`🎁 물려줄 것 — ${s.heirloom}`); }
    g.ui.open(`<div class="chk life secret"><div class="tag">✨ ${esc(s.tag || '숨어 있던 것')}</div><h3>${esc(s.title || '')}</h3>${(s.body || []).map((b) => `<p>${esc(b)}</p>`).join('')}${deltas.length ? `<p class="delta">${deltas.join(' · ')}</p>` : ''}${s.fact ? `<div class="facts"><div>📜 <b>실제</b> ${esc(s.fact)}</div></div>` : ''}</div>`, [{ label: s.button || '챙긴다', primary: true, onClick: () => { g.ui.close(); g.p.enabled = true; if (s.journal && g.story) g.story.journal(s.journal); g.flag('found:' + s.id); g.save?.touch(); } }]);
  }
  /** 물려줄 것 한 점을 이 기기 kworld_heirlooms 에 적는다(같은 id 는 한 번) + heirloom:<id> 깃발. from 은 출처(없으면 숨은 것, 'bond' 면 벗의 선물 — n/3 셈엔 안 들어간다). 돌려준다: 새로 적었나 */
  static keep(g, h) { let fresh = false; try { const list = JSON.parse(localStorage.getItem('kworld_heirlooms') || '[]'); const id = h.from ? `${h.from}:${h.id}` : h.id; if (!list.some((x) => x.id === id && x.era === g.era)) { list.push({ id, era: g.era, name: h.name, tag: h.tag || null, fact: h.fact || null, from: h.from || null, t: Date.now() }); localStorage.setItem('kworld_heirlooms', JSON.stringify(list.slice(-60))); fresh = true; } } catch { } g.flags.add('heirloom:' + (h.from ? h.from + ':' : '') + h.id); return fresh; }
  static heirlooms() { try { return JSON.parse(localStorage.getItem('kworld_heirlooms') || '[]'); } catch { return []; } }
  // ---------- 매 프레임 ----------
  tick(dt) {
    const g = this.g; if (!g.p?.pos || g.restoring || g.story?.cutsceneOn) return;
    if (!this.placed) { this.placed = true; this.placeSecrets(); }
    for (const a of this.leaving || []) a.tick(dt);
    if (this.chase) this.tickChase(dt); else if (this.deadline) this.tickDeadline(dt); else if (g.danger?.eyesOn || g.danger?.enc) this.tension(0.6); else if (this.level) this.tension(0);
    if (this.deadline && this.chase) this.tickDeadline(dt);
    this.tickRoutine(dt); if (this.secrets.length) this.tickSecrets(dt);
    if (this.level > 0.5 && g.sound) { this.heartT += dt; const gap = 1.1 - this.level * 0.5; if (this.heartT > gap) { this.heartT = 0; g.sound.thump?.(0.22 * this.level); setTimeout(() => g.sound.thump?.(0.12 * this.level), 170); } }
  }
  snapshot() { return { chase: this.chase ? this.chase.c.id : null, deadline: this.deadline ? { id: this.deadline.d.id, left: this.deadline.left } : null }; }
  restore(s) { if (!s) return; if (s.deadline) { const d = (this.cfg.deadlines || []).find((x) => x.id === s.deadline.id); if (d && !this.g.cond(d.until)) { this.startDeadline(d); this.deadline.left = s.deadline.left; } } if (s.chase) { const c = (this.cfg.chases || []).find((x) => x.id === s.chase); if (c && !this.g.cond(c.until)) { this.g.flags.delete('chase:' + c.id); setTimeout(() => this.startChase(c), 800); } } }
}
