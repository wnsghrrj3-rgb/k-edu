// 케이히스토리 엔진 · bond.js — 「운명의 사람이 세상에 있다」(10-19). world.spark.bond 가 있으면 켜진다. 코어는 시대 이름을 모른다. (?bond=0 끔)
//  · 돌발 카드로 만난 그 사람(흰돌·조개·돌쇠·순이…)이 카드 밖으로 나온다 — `bond:met` 이 서면 관절 인형 하나가 이름표를 달고 나타나 손을 흔들고, 그때부터 **따라다닌다**.
//  · 갈림 뒤: `bond:friend` 면 더 가까이 붙고 내가 손을 흔들면(G) 같이 흔들고 쫓길 땐 같이 뛴다 · `bond:enemy` 면 따라오지 않는다 — 멀찍이 서서 등을 돌리고, 다가가면 물러난다.
//  · 끝(`bond:end`): 벗이면 끝까지 곁에, 등졌으면 떠난다(몸이 사라진다).
//  · 한마디: 곁에 있을 때 가끔(55초) 「👤 이름 — …」 한 줄. 값·판정엔 손대지 않는다 — 보이고, 걷고, 말할 뿐(반 친구와 같은 원칙).
//  · 저장할 것 없음 — 깃발(bond:met/friend/enemy/end)만으로 다시 선다. 재개 땐 조용히(손 흔들기·첫 줄 없음).
import * as THREE from 'three';
import { createAvatar } from './avatar.js';

const FOLLOW = { met: 3.4, friend: 2.4 }, AWAY = 11, STEPBACK = 5, WALK = 3.4, RUN = 6.2, LINE_GAP = 55, WAVE_MS = 1600;
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
  constructor(g, cfg) { this.g = g; this.cfg = cfg || {}; this.name = this.cfg.name || '그 사람'; this.lines = { ...defaultLines(this.name), ...(this.cfg.lines || {}) }; this.body = null; this.pos = null; this.yaw = 0; this.walk = 0; this.sinceLine = 20; this.waveUntil = 0; this.lastWave = 0; this.spokenSky = null; this.turned = false; this.gone = false; }
  /** 지금 관계 — null(아직) / met / friend / enemy / gone(등지고 끝) */
  state() { const f = this.g.flags; if (!f.has('bond:met')) return null; if (f.has('bond:enemy')) return f.has('bond:end') ? 'gone' : 'enemy'; return f.has('bond:friend') ? 'friend' : 'met'; }
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
    if (!silent) { this.waveUntil = performance.now() + WAVE_MS; g.sound?.play?.('good', 0.25); g.ui?.say?.(`👤 ${this.name} — 「같이 가.」`, 4200); this.sinceLine = 0; }
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
  }
  onFlag() { if (this.g.restoring) return; const st = this.state(); if (st === 'met' && !this.body) this.spawn(false); if (st === 'gone') this.remove(`👤 ${JO(this.name, '이', '가')} 떠났다. 다시 보지 못했다.`); }
  /** 곁에 있나(시험·HUD용) */
  near(r = 6) { return !!this.body && this.dist(this.pos, this.g.p.pos) <= r; }
}
