// 케이히스토리 엔진 · bond.js — 「운명의 사람이 세상에 있다」(10-19). world.spark.bond 가 있으면 켜진다. 코어는 시대 이름을 모른다. (?bond=0 끔)
//  · 돌발 카드로 만난 그 사람(흰돌·조개·돌쇠·순이…)이 카드 밖으로 나온다 — `bond:met` 이 서면 관절 인형 하나가 이름표를 달고 나타나 손을 흔들고, 그때부터 **따라다닌다**.
//  · 갈림 뒤: `bond:friend` 면 더 가까이 붙고 내가 손을 흔들면(G) 같이 흔들고 쫓길 땐 같이 뛴다 · `bond:enemy` 면 따라오지 않는다 — 멀찍이 서서 등을 돌리고, 다가가면 물러난다.
//  · 끝(`bond:end`): 벗이면 끝까지 곁에, 등졌으면 떠난다(몸이 사라진다).
//  · 한마디: 곁에 있을 때 가끔(55초) 「👤 이름 — …」 한 줄. 값·판정엔 손대지 않는다 — 보이고, 걷고, 말할 뿐(반 친구와 같은 원칙).
//  · 저장할 것 없음 — 깃발(bond:met/friend/enemy/end)만으로 다시 선다. 재개 땐 조용히(손 흔들기·첫 줄 없음).
//  · 말 걸기(E, 10-19 77): 곁(3.8m — 선 자리 3.4 안)에 서면 「말을 건다」 — 한마디·주머니 물건 주기(bond:gave:<k>)·벗은 한 번 답례(cfg.gift 있으면, bond:gift). 등진 사람에겐 말이 닿지 않는다(bond:tried).
//  · 벗이 쫓김에 끼어든다: bond:friend 인 채 쫓기면 벗이 쫓는 사람에게 달려가 앞을 막아 3초를 번다(한 쫓김에 한 번, bond:blocked) — 그 사이 쫓는 사람은 멈춘다.
//  · 조건 토큰 `bond:1` = 벗이 곁(5m) — life.cond·game.cond 에서 「운명의 벗과 함께」 길에 쓴다(10-19 78: 열한 시대마다 하나, gen_bond_ways.py — 결과 카드 `bond:true` 면 `together()` 한마디).
//  · 화해(79): bond3e 에서 먼저 다가간 쪽(bond:sorry)에겐 돌발 bond4 가 한 번 더 — 굴림에 이기면 `bond:mended`: 등졌던 사람이 벗으로 돌아와 다시 따라다닌다(「…다시, 같이 가.」). 족보엔 「○○과 다시 벗」.
//  · 벗이 서두르게 한다(81): 급한 일(모래시계) 중이면 벗이 「서둘러! 이쪽이야.」 하며 그 상황의 자리(deadline.goal || life 상황 place)로 먼저 뛴다 — 12m 뒤처지면 기다리고, 내가 6m 안에 닿으면 그만(bond:hurry:<id>). 쫓김이 같이 있으면 쫓김 이끌기가 먼저.
//  · 벗이 「여기야」 하며 그 상황의 물건을 반짝인다(82): 급한 일 자리에 닿으면(hurry.done) 그 상황(sit:<id>:open)이 지금 열어 둔 대상·사람(items rename·npc lines 의 if 가 그 상황을 보고, 지금 조건이 맞는 것)에 호박빛 반짝임을 붙인다 — 어느 길을 고를지는 안 가리킨다(여럿이면 전부, 가까운 넷까지), 쓰면 그 자리 반짝임은 꺼지고, 급한 일이 끝나면(또는 60초) 전부 꺼진다. bond:point:<id>, 한 번.
//  · 벗이 길을 보여 준다(79): 쫓길 때(앞을 막은 뒤) 벗이 「이쪽!」 하며 숨을 곳(goal_at) 쪽으로 먼저 뛴다 — 내가 12m 넘게 뒤처지면 멈춰 기다린다. 값·판정엔 손 안 댐(bond:lead:<chase>).
//  · 벗의 한마디가 지난 선택에 반응(79): cfg.react[{id,if,text,once}] — 깃발이 서면(쫓김 탈출·잡힘·앞 막음·준 것·늦음·같이 한 것) 벗이 그 일을 말한다, 한 번(bond:said:<id>). 벗일 때만.
//  · 벗은 숨은 것을 먼저 안다(78): 벗이 아직 못 찾은 숨은 것(pulse.secrets) 12m 안을 지나면 한 번 「저기 뭔가 있다」 — 자리는 안 알려 준다(반짝임을 찾는 건 네 몫), `bond:hint:<id>`.
import * as THREE from 'three';
import { createAvatar } from './avatar.js';

const FOLLOW = { met: 3.4, friend: 2.4 }, LEAD_WAIT = 12, LEAD_STOP = 1.6, HURRY_NEAR = 6, POINT_R = 30, POINT_SEE = 40, POINT_MAX = 4, POINT_SEC = 60, REACT_GAP = 8, HINT_R = 12, HINT_GAP = 20, AWAY = 11, STEPBACK = 5, WALK = 3.4, RUN = 6.2, LINE_GAP = 55, WAVE_MS = 1600, TALK_R = 3.8, WITH_R = 5, BLOCK_R = 2.2, BLOCK_SEC = 3;
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const JO = (n, a, b) => { const c = String(n || '').slice(-1).charCodeAt(0); return n + ((c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28) ? a : b); };
function label(text) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const c = document.createElement('canvas'); if (!c.getContext) return null; c.width = 256; c.height = 64; const x = c.getContext('2d'); if (!x) return null;
  x.font = '600 30px "Gowun Dodum", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(14,18,20,.55)'; const w = Math.min(240, x.measureText(text).width + 28); x.beginPath(); if (x.roundRect) x.roundRect((256 - w) / 2, 8, w, 48, 14); else x.rect((256 - w) / 2, 8, w, 48); x.fill();
  x.fillStyle = '#bfe3ff'; x.fillText(text, 128, 34);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); sp.scale.set(2.2, 0.55, 1); sp.renderOrder = 999; return sp;
}
/** 시대 데이터에 줄이 없을 때의 기본 한마디(이름으로 만든다) */
function defaultLines(n) {
  return { met: [`「같이 가.」 ${n}이(가) 옆에 붙는다.`, `${JO(n, '이', '가')} 네 걸음을 따라온다. 말은 없다.`, `「…어디 가?」 ${n}.`],
    friend: [`${JO(n, '이', '가')} 웃는다. 「네 뒤는 내가 본다.」`, `「힘들면 말해.」 ${n}.`, `${JO(n, '이', '가')} 네 옆에서 같이 걷는다. 그걸로 됐다.`],
    enemy: [`${JO(n, '이', '가')} 멀리서 너를 본다. 등을 돌린다.`, `${JO(n, '이', '가')} 네가 오자 한 걸음 물러난다.`, `${n}. 그날 이후로 말을 안 한다.`] };
}

export class Bond {
  constructor(g, cfg) { this.g = g; this.cfg = cfg || {}; this.name = this.cfg.name || '그 사람'; this.lines = { ...defaultLines(this.name), ...(this.cfg.lines || {}) }; this.body = null; this.pos = null; this.yaw = 0; this.walk = 0; this.sinceLine = 20; this.waveUntil = 0; this.lastWave = 0; this.spokenSky = null; this.turned = false; this.gone = false; this.block = null; this.sinceHint = 0; this.lead = null; this.hurry = null; this.point = null; this.reactT = 0; }
  /** 지금 관계 — null(아직) / met / friend / enemy / gone(등지고 끝) */
  state() { const f = this.g.flags; if (!f.has('bond:met')) return null; if (f.has('bond:mended')) return 'friend'; if (f.has('bond:enemy')) return f.has('bond:end') ? 'gone' : 'enemy'; return f.has('bond:friend') ? 'friend' : 'met'; }
  dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
  quiet() { const g = this.g; return !g.ui?.isOpen?.() && !g.story?.cutsceneOn && g.p?.enabled !== false; }
  /** 몸 세우기 — 플레이어 앞 7m. 재개(restoring)면 조용히 */
  spawn(silent) {
    const g = this.g; if (this.body || !g.e?.scene?.add || !g.p?.pos) return;
    const body = createAvatar(false); const lk = this.cfg.look || {}; const cloth = lk.cloth ?? 0x6b5a7a, hair = lk.hair ?? 0x2a211c;
    body.traverse((m) => { if (!m.isMesh || !m.material?.color) return; const h = m.material.color.getHex(); if (h === 0x506a62) { m.material = m.material.clone(); m.material.color.setHex(cloth); } if (h === 0x302d28) { m.material = m.material.clone(); m.material.color.setHex(hair); } });
    const tag = label(this.name); if (tag) { tag.position.y = 2.05; body.add(tag); }
    const p = g.p.pos; const ang = (g.p.yaw || 0); const x = p.x - Math.sin(ang) * 7, z = p.z - Math.cos(ang) * 7;
    this.pos = { x, z }; this.yaw = Math.atan2(p.x - x, p.z - z); body.position.set(x, g.e.groundY ? g.e.groundY(x, z) : 0, z); body.rotation.y = this.yaw; g.e.scene.add(body); this.body = body; g.flags.add('bond:here');
    if (!silent) { this.waveUntil = performance.now() + WAVE_MS; g.sound?.play?.('good', 0.25); g.ui?.say?.(`👤 ${this.name} — ${g.flags.has('bond:mended') ? '「…다시, 같이 가.」' : '「같이 가.」'}`, 4200); this.sinceLine = 0; }
  }
  remove(say) { const g = this.g; if (!this.body) return; g.e.scene.remove(this.body); this.body = null; this.pos = null; g.flags.delete('bond:here'); this.gone = true; if (say) g.ui?.say?.(say, 4200); }
  /** 걸음 — 목표 자리로 speed 로, 닿으면 서 있다. 돌려준다: 움직였나 */
  step(dt, tx, tz, speed, stopAt) {
    const d = Math.hypot(tx - this.pos.x, tz - this.pos.z); const tyaw = Math.atan2(tx - this.pos.x, tz - this.pos.z); let dy = tyaw - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 7);
    if (d <= stopAt) return false; const mv = Math.min(d - stopAt, speed * dt); this.pos.x += Math.sin(tyaw) * mv; this.pos.z += Math.cos(tyaw) * mv; return true;
  }
  tick(dt) {
    const g = this.g; if (!g.p?.pos) return; const first = !this.ticked; this.ticked = true; const st = this.state(); const now = performance.now();
    if (st === null || st === 'gone') { if (this.body) this.remove(st === 'gone' ? `👤 ${JO(this.name, '이', '가')} 떠났다. 다시 보지 못했다.` : null); return; }
    if (!this.body) { if (g.restoring) return; this.spawn(first); if (!this.body) return; }   // 첫 틱에 이미 만나 있었으면(재개) 조용히
    const p = g.p.pos; const d = this.dist(this.pos, p); let moving = false; let speed = WALK;
    if (st === 'enemy') {
      if (!this.turned) { this.turned = true; g.ui?.say?.(`👤 ${JO(this.name, '이', '가')} 등을 돌렸다. 더는 따라오지 않는다.`, 4200); }
      if (d < STEPBACK) { const ax = this.pos.x - p.x, az = this.pos.z - p.z; const n = Math.hypot(ax, az) || 1; moving = this.step(dt, this.pos.x + ax / n * 4, this.pos.z + az / n * 4, 2.2, 0); }   // 물러난다
      else if (d > AWAY * 2.2) { moving = this.step(dt, p.x, p.z, WALK, AWAY); }   // 아주 멀어지면 멀찍이 따라는 온다 — 보이는 거리에
      else { const away = Math.atan2(this.pos.x - p.x, this.pos.z - p.z); let dy = away - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 3); }   // 등을 돌리고 선다
    } else if (st === 'friend' && this.blocking(dt)) { moving = this.block.moving;   // 벗이 쫓는 사람 앞을 막으러 간다
    } else if (st === 'friend' && this.leading(dt)) { moving = this.lead.moving;   // 벗이 숨을 곳 쪽으로 먼저 뛰어 길을 보여 준다
    } else if (st === 'friend' && this.hurrying(dt)) { moving = this.hurry.moving;   // 급한 일(모래시계)이면 벗이 「서둘러!」 하며 그 자리로 먼저 뛴다
    } else {
      const stopAt = FOLLOW[st] ?? FOLLOW.met; const run = d > 9 || (st === 'friend' && g.pulse?.chase); speed = run ? RUN : WALK;
      moving = this.step(dt, p.x, p.z, speed, stopAt);
      if (!moving && this.quiet()) { const face = Math.atan2(p.x - this.pos.x, p.z - this.pos.z); let dy = face - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 3); }
      if (st === 'friend' && g.friends?.myWaveUntil > now && this.lastWave < g.friends.myWaveUntil) { this.lastWave = g.friends.myWaveUntil; this.waveUntil = now + WAVE_MS + 300; }   // 내가 흔들면 같이 흔든다
    }
    if (moving) this.walk += dt;
    const b = this.body; b.position.set(this.pos.x, g.e.groundY ? g.e.groundY(this.pos.x, this.pos.z) : b.position.y, this.pos.z); b.rotation.y = this.yaw; b.userData.animate?.(this.walk, moving);
    if (this.waveUntil > now) { const a = b.userData.arms?.[1]; if (a) a.rotation.x = -2.9 + Math.sin(now * 0.012) * 0.35; }
    // 한마디 — 곁에 있고 조용할 때, 55초에 한 번, 하늘이 바뀌면 새로
    this.sinceLine += dt; const sky = g.story?.skyName || 'day'; if (sky !== this.spokenSky) { this.spokenSky = sky; this.sinceLine = Math.max(this.sinceLine, LINE_GAP - 12); }
    if (this.sinceLine >= LINE_GAP && this.quiet() && d < (st === 'enemy' ? AWAY + 3 : 6)) { this.sinceLine = 0; const pool = this.lines[st] || []; if (pool.length) g.ui?.say?.(`👤 ${this.name} — ${pool[Math.floor(Math.random() * pool.length)]}`, 4200); }
    this.sinceHint += dt; if (st === 'friend' && this.sinceHint >= HINT_GAP) this.hint();
    if (st === 'friend') this.pointing(dt); else if (this.point) this.unpoint();
    this.reactT += dt; if (st === 'friend' && this.reactT >= 1 && this.sinceLine >= REACT_GAP && this.quiet() && d < 6) { this.reactT = 0; this.react(); }
  }
  /** 벗의 한마디가 지난 선택에 반응 — cfg.react 규칙 중 깃발이 선 것 하나, 한 번(bond:said:<id>) */
  react() {
    const g = this.g; const cond = g.cond ? (x) => g.cond(x) : () => false;
    for (const r of this.cfg.react || []) { if (!r?.id || !r.if || g.flags.has('bond:said:' + r.id) || !cond(r.if)) continue;
      this.sinceLine = 0; g.flags.add('bond:said:' + r.id); g.ui?.say?.(`👤 ${this.name} — ${r.text}`, 4600); return true; }
    return false;
  }
  /** 쫓김 중 벗이 숨을 곳 쪽으로 먼저 뛴다(앞 막기가 끝난 뒤). 내가 LEAD_WAIT 넘게 뒤처지면 멈춰 기다린다. 돌려준다: 지금 이끄는 중인가 */
  leading(dt) {
    const g = this.g; const ch = g.pulse?.chase; if (!ch) { this.lead = null; return false; }
    if (this.lead && this.lead.ch !== ch) this.lead = null;
    const goal = g.pulse.area?.(ch.c?.goal_at || ch.c?.goal); if (!goal) return false;
    if (!this.lead) { this.lead = { ch, moving: false }; if (!g.flags.has('bond:lead:' + ch.c.id)) { g.flags.add('bond:lead'); g.flag?.('bond:lead:' + ch.c.id); g.sound?.play?.('good', 0.3); g.ui?.say?.(`👤 ${this.name} — 「이쪽!」`, 2600); } }
    const L = this.lead; const p = g.p.pos; const dp = this.dist(this.pos, p);
    if (dp > LEAD_WAIT) { L.moving = false; const face = Math.atan2(p.x - this.pos.x, p.z - this.pos.z); let dy = face - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 5); return true; }   // 기다린다 — 돌아보고 선다
    L.moving = this.step(dt, goal.x, goal.z, RUN, LEAD_STOP); return true;
  }
  /** 급한 일(모래시계) 중 벗이 「서둘러!」 하며 그 상황의 자리(deadline.goal || life 상황 place)로 먼저 뛴다 — 내가 HURRY_NEAR 안에 닿으면 그 급한 일에선 더 안 이끈다. 쫓김이 같이 있으면 쫓김 이끌기가 먼저. 돌려준다: 지금 서두르게 하는 중인가 */
  hurrying(dt) {
    const g = this.g; const dl = g.pulse?.deadline; if (!dl || g.pulse?.chase) { this.hurry = null; return false; }
    if (this.hurry && this.hurry.dl !== dl) this.hurry = null;
    if (this.hurry?.done) return false;
    const sit = g.life?.situations?.find?.((x) => x.id === dl.d?.id); const goal = g.pulse.area?.(dl.d?.goal || sit?.place); if (!goal) return false;
    const p = g.p.pos; if (this.dist(goal, p) <= HURRY_NEAR) { if (this.hurry) this.hurry.done = true; else this.hurry = { dl, moving: false, done: true }; return false; }   // 이미 그 자리면 이끌 것 없다
    if (!this.hurry) { this.hurry = { dl, moving: false, done: false }; if (!g.flags.has('bond:hurry:' + dl.d.id)) { g.flags.add('bond:hurry'); g.flag?.('bond:hurry:' + dl.d.id); g.sound?.play?.('good', 0.3); g.ui?.say?.(`👤 ${this.name} — 「서둘러! 이쪽이야.」`, 2600); } }
    const H = this.hurry; const dp = this.dist(this.pos, p);
    if (dp > LEAD_WAIT) { H.moving = false; const face = Math.atan2(p.x - this.pos.x, p.z - this.pos.z); let dy = face - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 5); return true; }   // 기다린다 — 돌아보고 선다
    H.moving = this.step(dt, goal.x, goal.z, RUN, LEAD_STOP); return true;
  }
  /** 그 상황이 지금 열어 둔 대상·사람 — items rename(첫 맞는 것)·npc lines(첫 맞는 것)의 `if` 가 `sit:<id>:open` 을 보고 지금 조건이 맞는 것. 돌려준다: [{t, rule}] */
  sitTargets(sitId) {
    const g = this.g; const ix = g.e?.interactables; if (!ix?.values || !g.cond) return []; const key = 'sit:' + sitId + ':open'; const out = [];
    for (const t of ix.values()) { let rule = null;
      if (t.type === 'npc') { const l = g.npcs?.[t.id]?.lines?.find((x) => g.cond(x.if)); if (l?.if?.includes(key)) rule = l; }
      else { const d = g.items?.targets?.[t.type]; const r = d?.rename?.find((x) => g.cond(x.if)); if (r?.if?.includes(key)) rule = r; else if (!r && d?.if?.includes(key) && g.cond(d.if)) rule = d; }
      if (rule) out.push({ t, rule }); }
    return out;
  }
  /** 호박빛 반짝임 한 묶음 — 대상 위(box.max.y)에서 떠돈다 */
  mark(t) {
    const c = t.center || t.obj?.position || { x: 0, y: 0, z: 0 }; const top = t.box?.max?.y ?? (c.y + 1);
    const grp = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), m); const a = i / 6 * Math.PI * 2; s.position.set(Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45); s.userData.ph = a; grp.add(s); }
    const l = new THREE.PointLight(0xffc070, 0.8, 4.5, 2); l.position.y = 0.3; grp.add(l); grp.position.set(c.x, top + 0.25, c.z); return grp;
  }
  unpoint() { const g = this.g; const P = this.point; if (!P) return; for (const m of P.marks) g.e?.scene?.remove?.(m.grp); this.point = null; }
  /** 벗이 「여기야」 — 급한 일 자리에 닿은 뒤(hurry.done) 그 상황의 대상·사람에 반짝임. 길은 안 가리킨다. 쓰면(조건이 안 맞으면) 그 반짝임만 꺼지고, 급한 일이 끝나면(또는 POINT_SEC) 전부 꺼진다 */
  pointing(dt) {
    const g = this.g; const dl = g.pulse?.deadline; const now = performance.now();
    if (this.point && (!dl || this.point.dl !== dl || now > this.point.until)) this.unpoint();
    if (!dl) return;
    const H = this.hurry; if (!H?.done || H.dl !== dl) return;
    if (!this.point) {
      this.point = { dl, marks: [], until: now + POINT_SEC * 1000, t: 0 };
      if (g.flags.has('bond:point:' + dl.d.id)) return;   // 이미 가리켰다(재개·다시 온 자리)
      const sit = g.life?.situations?.find?.((x) => x.id === dl.d?.id); const goal = g.pulse.area?.(dl.d?.goal || sit?.place) || g.p.pos;
      const list = this.sitTargets(dl.d.id).map((x) => ({ ...x, dd: this.dist(x.t.center || x.t.obj?.position || goal, goal) })).filter((x) => x.dd <= POINT_R).sort((a, b) => a.dd - b.dd).slice(0, POINT_MAX);
      g.flags.add('bond:point'); g.flag?.('bond:point:' + dl.d.id);
      if (!list.length) return;
      for (const x of list) { const grp = this.mark(x.t); g.e?.scene?.add?.(grp); this.point.marks.push({ t: x.t, rule: x.rule, grp }); }
      this.sinceLine = 0; g.sound?.play?.('good', 0.3); g.ui?.say?.(`👤 ${this.name} — 「여기야.」 ${list.length > 1 ? `(${list.length}곳이 반짝인다 — 어디로 갈지는 네 몫)` : ''}`.trim(), 3200);
      return;
    }
    const P = this.point; P.t += dt; const p = g.p.pos; const re = Math.floor(P.t) !== Math.floor(P.t - dt);
    for (const m of [...P.marks]) {
      if (re && !g.cond(m.rule.if)) { g.e?.scene?.remove?.(m.grp); P.marks.splice(P.marks.indexOf(m), 1); continue; }   // 썼다(조건이 바뀜) — 그 반짝임만 끈다
      const grp = m.grp; grp.visible = this.dist(grp.position, p) < POINT_SEE; grp.rotation.y += dt * 1.2;
      for (const c of grp.children) if (c.isMesh) c.position.y = Math.sin(P.t * 2.5 + c.userData.ph) * 0.15;
    }
  }
  /** 벗이 숨은 것 곁을 지나면 「저기 뭔가 있다」 — 못 찾은 것, 한 번(bond:hint:<id>), 자리는 말 안 한다 */
  hint() {
    const g = this.g; const list = g.pulse?.secrets; if (!list?.length || !this.pos || !this.quiet()) return;
    for (const sc of list) { if (sc.found || g.flags.has('secret:' + sc.s.id) || g.flags.has('bond:hint:' + sc.s.id)) continue; if (this.dist(sc, this.pos) > HINT_R) continue;
      this.sinceHint = 0; this.sinceLine = Math.min(this.sinceLine, LINE_GAP - 20); g.flags.add('bond:hint:' + sc.s.id); g.sound?.play?.('good', 0.2);
      g.ui?.say?.(`👤 ${this.name} — 「저기 뭔가 있다. …어디더라.」`, 4200); return; }
  }
  /** 「운명의 벗과 함께」 길을 고른 뒤(결과 카드 bond:true) — 벗이 한마디. 값은 각자 */
  together(s, c) { const g = this.g; if (this.state() !== 'friend') return; this.sinceLine = 0; g.flags.add('bond:together'); g.flag?.('bond:together:' + (s?.id || '')); setTimeout(() => g.ui?.say?.(`👤 ${this.name} — 「같이 하니까 됐지.」 (${s?.title || ''})`, 4200), 1800); }
  /** 쫓김 중 벗의 끼어듦 — 쫓는 사람에게 달려가 BLOCK_R 안이면 pulse.hold(3초). 한 쫓김에 한 번. 돌려준다: 지금 끼어드는 중인가 */
  blocking(dt) {
    const g = this.g; const ch = g.pulse?.chase; const now = performance.now();
    if (this.block && (!ch || ch !== this.block.ch)) this.block = null;
    if (!ch) return false;
    if (ch.bondBlocked && !(this.block && this.block.until > now)) return false;
    const o = ch.actor?.obj; if (!o) return false;
    if (!this.block) this.block = { ch, moving: false, until: 0 };
    const b = this.block;
    if (b.until > now) { b.moving = false; return true; }   // 막고 서 있다
    if (ch.bondBlocked) return false;
    b.moving = this.step(dt, o.position.x, o.position.z, RUN, 0.4);
    if (Math.hypot(o.position.x - this.pos.x, o.position.z - this.pos.z) <= BLOCK_R) {
      ch.bondBlocked = true; b.until = now + BLOCK_SEC * 1000; g.pulse.hold?.(BLOCK_SEC); this.yaw = Math.atan2(o.position.x - this.pos.x, o.position.z - this.pos.z);
      g.sound?.play?.('good', 0.4); g.ui?.say?.(`👤 ${JO(this.name, '이', '가')} 앞을 막았다 — 「뛰어!」`, 3600); g.flags.add('bond:blocked'); g.flag?.('bond:blocked:' + ch.c.id);
    }
    return true;
  }
  /** 벗이 곁(WITH_R)에 있나 — 조건 토큰 `bond:1` */
  withMe(r = WITH_R) { return this.state() === 'friend' && this.near(r); }
  /** 말을 걸 수 있나(E) — 몸이 있고 TALK_R 안 */
  canTalk() { return !!this.body && !this.gone && this.near(TALK_R); }
  prompt() { const st = this.state(); return { action: true, name: this.name, verb: st === 'enemy' ? '…등을 돌린 채다' : '말을 건다' }; }
  /** 말 걸기(E) — 한마디 + 물건 주기. 값·판정엔 손대지 않는다 */
  talk() {
    const g = this.g; const st = this.state(); if (!this.body || !st || st === 'gone') return;
    if (st === 'enemy') { g.ui?.say?.(`👤 ${JO(this.name, '이', '가')} 등을 돌린 채다. 말이 닿지 않는다.`, 4200); g.flag?.('bond:tried'); return; }
    const pool = this.lines[st] || []; const line = pool.length ? pool[Math.floor(Math.random() * pool.length)] : `${this.name}.`;
    this.sinceLine = 0; g.p.enabled = false;
    const close = () => { g.ui.close(); g.p.enabled = true; };
    const kinds = [...new Set(g.inventory || [])].filter((k) => g.items?.items?.[k]).slice(0, 4);
    const buttons = [{ label: st === 'friend' ? '「같이 가자.」' : '「같이 갈래?」', primary: true, onClick: () => { close(); g.ui?.say?.(`👤 ${this.name} — ${st === 'friend' ? '「응. 어디든.」' : '「…응.」'}`, 3200); g.flag?.('bond:talked'); } }];
    for (const k of kinds) { const d = g.items.items[k]; buttons.push({ label: `${d.icon || ''} ${d.name} 준다`, onClick: () => { close(); g.take(k); g.renderInv?.(); g.flag?.('bond:gave'); g.flag?.('bond:gave:' + k); g.ui?.say?.(`👤 ${JO(this.name, '이', '가')} ${d.name}을(를) 받았다. ${st === 'friend' ? '「…고마워.」' : '「…이걸 나한테?」'}`, 4200); this.gift(); } }); }
    buttons.push({ label: '그냥 간다', onClick: close });
    g.ui.open(`<div class="npc"><b>👤 ${esc(this.name)}</b><p>${esc(line)}</p></div>`, buttons, 'npcpanel');
  }
  /** 벗의 답례 — cfg.gift(물건 키)가 있으면 한 번만 */
  gift() { const g = this.g; const k = this.cfg.gift; if (!k || this.state() !== 'friend' || g.flags.has('bond:gift') || !g.items?.items?.[k]) return; setTimeout(() => { g.inventory.push(k); g.renderInv?.(); g.flag?.('bond:gift'); g.ui?.say?.(`👤 ${this.name} — 「이건 네 거.」 ${g.items.items[k].icon || ''} ${g.items.items[k].name}`, 4200); }, 1600); }
  onFlag() { if (this.g.restoring) return; const st = this.state(); if (this.g.flags.has('bond:mended') && this.gone) { this.gone = false; this.turned = false; }   // 화해 — 떠났던 사람이 돌아온다(tick 에서 다시 선다)
    if (st === 'met' && !this.body) this.spawn(false); if (st === 'gone') this.remove(`👤 ${JO(this.name, '이', '가')} 떠났다. 다시 보지 못했다.`); }
  /** 곁에 있나(시험·HUD용) */
  near(r = 6) { return !!this.body && this.dist(this.pos, this.g.p.pos) <= r; }
}
