// 케이히스토리 엔진 · friends.js — 반 멀티 0단계 「같은 마을에 반 친구가 보인다」(역사 인생게임 3단계의 첫 층, 2026-10-12).
//  · 정식 좌석(동의 학생)만. 같은 학급 × 같은 시대 = Supabase Realtime 채널 하나(`kworld:<class_code_id>:<era>`) — 표·RLS 없음, DB 에 아무것도 안 쌓인다(케이파크 KParkNet 과 같은 길).
//  · 오가는 건 자리(x·z·yaw·걷는 중)뿐, 5번/초. 이름표는 좌석 이름(번호+이름). 화면·판정은 각자 — 친구는 보이기만 하고 내 상황·값에 손대지 않는다.
//  · 1단계(10-12): 👥 친구 수 HUD(왼쪽 여정 카드 밑) · 👋 손 흔들기(G 키·단추, 1.6초 오른팔) · 친구 곁(3.5m)에 가면 「무엇을 골랐는지」 한 줄(값은 안 보임) · 「같이 하기」 = 선택지 조건 `near:n`(곁 5m 안 친구 n) — 값·판정은 여전히 각자.
//  · 80: 외침(shout) — 내가 쫓김에서 살았다/잡혔다/급한 일에 늦었다 하면 곁(14m) 친구 화면에 「👥 이름 — 「살았다!」」 한 줄(값 없음). pulse.endChase·endDeadline 이 부른다.
//  · 82: 답을 받으면 외친 쪽 몸도 손을 들어 답한다(myWaveUntil) + wave reply kind 'back' → 답한 쪽엔 「👋 이름 — 「고마워.」」 한 줄(그 줄엔 다시 답하지 않는다).
//  · 81: 외침에 답하기 — 곁 친구의 외침이 뜬 뒤 9초 안에 G 로 손을 흔들면 wave 에 reply{to,kind} 가 실려 가고, 외친 쪽 화면엔 「👋 이름 — 「다행이다!」」 한 줄(값 없음).
//  · 20초 넘게 소식 없으면 사라진다. `?friends=0` 또는 world.friends === false 면 끔. 망에서 wss 가 막히면 조용히 없음.
import * as THREE from 'three';
import { createAvatar } from './avatar.js';
import { seat } from './save.js';

const SEND_MS = 200, STALE_MS = 20000, WAVE_MS = 1600, NEAR_PICK = 3.5, NEAR_WITH = 5, NEAR_SHOUT = 14;
const REPLY_MS = 9000, REPLY = { escaped: ['「다행이다!」', '「잘 뛰었어.」'], caught: ['「괜찮아, 다시 하자.」', '「다음엔 같이.」'], late: ['「나도 늦을 뻔했어.」', '「다음엔 같이 뛰자.」'], back: ['「고마워.」', '「응, 봤어!」'] };
const SHOUT = { escaped: ['「살았다!」', '「봤어, 뛰는 거!」', '「숨 좀 돌려.」'], caught: ['「…잡혔네.」', '「다음엔 같이 뛰자.」', '「괜찮아?」'], late: ['「늦었다…」', '「모래시계 봤어?」', '「다음엔 내가 알려 줄게.」'] };
function label(text) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); if (!x) return null;
  x.font = '600 30px "Gowun Dodum", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(14,18,20,.55)'; const w = Math.min(240, x.measureText(text).width + 28); x.beginPath(); if (x.roundRect) x.roundRect((256 - w) / 2, 8, w, 48, 14); else x.rect((256 - w) / 2, 8, w, 48); x.fill();
  x.fillStyle = '#f5d68a'; x.fillText(text, 128, 34);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); sp.scale.set(2.2, 0.55, 1); sp.renderOrder = 999; return sp;
}

/** 오른팔을 들어 흔든다(애니메이트 뒤에 덮어씀) */
function waveArm(body, now) { const a = body.userData.arms?.[1]; if (!a) return; a.rotation.x = -2.9 + Math.sin(now * 0.012) * 0.35; }

export class Friends {
  constructor(g) { this.g = g; this.ch = null; this.me = null; this.friends = new Map(); this.last = null; this.lastSend = -1e9; this.on = false; this.myPick = null; this.myWaveUntil = 0; this.box = null; }
  async start() {
    const g = this.g; if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('friends') === '0') return; if (g.world.friends === false) return;
    const s = await seat(); if (!s || !s.classId || !s.db?.channel) return; this.me = s;
    try {
      this.ch = s.db.channel('kworld:' + s.classId + ':' + g.era, { config: { broadcast: { self: false }, presence: { key: s.sid } } });
      this.ch.on('broadcast', { event: 'pos' }, ({ payload }) => this.recv(payload));
      this.ch.on('broadcast', { event: 'wave' }, ({ payload }) => this.recvWave(payload)).on('broadcast', { event: 'shout' }, ({ payload }) => this.recvShout(payload));
      this.ch.on('broadcast', { event: 'pick' }, ({ payload }) => this.recvPick(payload));
      this.ch.on('presence', { event: 'leave' }, ({ key }) => this.drop(key));
      this.ch.subscribe((st) => { if (st === 'SUBSCRIBED') { this.on = true; this.ch.track({ nick: s.nick, chr: g.character?.id || null }); this.send(true); } });
      g.e.onFrame.push((dt) => this.tick(dt)); this.hud();
      addEventListener('beforeunload', () => { try { this.ch.untrack(); this.ch.unsubscribe(); } catch { } });
    } catch { this.ch = null; }
  }
  /** 내 자리 — 움직였을 때만, 5번/초 */
  send(force = false) {
    const g = this.g; if (!this.on || !g.p) return; const t = performance.now(); if (!force && t - this.lastSend < SEND_MS) return;
    const x = Math.round(g.p.pos.x * 10) / 10, z = Math.round(g.p.pos.z * 10) / 10, yaw = Math.round((g.p.yaw || 0) * 100) / 100, mv = !!g.p.moving;
    const same = this.last && this.last.x === x && this.last.z === z && this.last.yaw === yaw && this.last.mv === mv; if (same && !force) return;
    this.last = { x, z, yaw, mv }; this.lastSend = t;
    try { this.ch.send({ type: 'broadcast', event: 'pos', payload: { id: this.me.sid, nick: this.me.nick, chr: g.character?.id || null, x, z, yaw, mv } }); } catch { }
  }
  recv(p) {
    if (!p || !p.id || p.id === this.me?.sid) return; const g = this.g;
    let f = this.friends.get(p.id);
    if (!f) {
      const body = createAvatar(false); body.userData.nick = p.nick; const tag = label(p.nick || '친구'); if (tag) { tag.position.y = 2.05; body.add(tag); }
      const chars = g.world.characters || []; const c = chars.find((x) => x.id === p.chr); if (c?.look) body.traverse((m) => { if (!m.isMesh || !m.material?.color) return; const h = m.material.color.getHex(); if (h === 0x506a62 && c.look.cloth) m.material = m.material.clone(), m.material.color.setHex(c.look.cloth); if (h === 0x302d28 && c.look.hair) m.material = m.material.clone(), m.material.color.setHex(c.look.hair); });
      g.e.scene.add(body); f = { body, x: p.x, z: p.z, yaw: p.yaw || 0, tx: p.x, tz: p.z, tyaw: p.yaw || 0, mv: false, t: 0, walk: 0 }; this.friends.set(p.id, f);
      body.position.set(p.x, g.e.groundY ? g.e.groundY(p.x, p.z) : 0, p.z); this.renderHud();
      this.send(true); if (this.myPick) this.sendPick();   // 새로 온 친구에게 내 자리·마지막에 고른 것(한 줄뿐)
      const pend = this.pending?.get(p.id); if (pend) { this.pending.delete(p.id); this.recvPick(pend); }
    }
    f.tx = p.x; f.tz = p.z; f.tyaw = p.yaw || 0; f.mv = !!p.mv; f.t = performance.now();
  }
  drop(id) { const f = this.friends.get(id); if (!f) return; this.g.e.scene.remove(f.body); this.friends.delete(id); this.renderHud(); }
  tick(dt) {
    this.send(); const now = performance.now(); const g = this.g;
    for (const [id, f] of this.friends) {
      if (now - f.t > STALE_MS) { this.drop(id); continue; }
      const k = Math.min(1, dt * 8); f.x += (f.tx - f.x) * k; f.z += (f.tz - f.z) * k; let d = f.tyaw - f.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); f.yaw += d * k;
      const moving = f.mv || Math.hypot(f.tx - f.x, f.tz - f.z) > 0.05; if (moving) f.walk += dt;
      f.body.position.set(f.x, g.e.groundY ? g.e.groundY(f.x, f.z) : f.body.position.y, f.z); f.body.rotation.y = f.yaw; f.body.userData.animate?.(f.walk, moving);
      if (f.waveUntil > now) waveArm(f.body, now);
      if (f.pick && !f.pick.shown && g.p && Math.hypot(f.x - g.p.pos.x, f.z - g.p.pos.z) < NEAR_PICK) { f.pick.shown = true; g.ui?.say?.(`👥 ${f.body.userData.nick || '친구'} — 「${f.pick.sit}」에서 ${f.pick.choice}`, 4200); }   // 곁에 가면 한 줄(값은 안 보임)
    }
    if (this.myWaveUntil > now && g.p?.body) waveArm(g.p.body, now);
  }
  /** 곁(r m 안)에 있는 친구 수 — 「같이 하기」 조건 near:n */
  near(r = NEAR_WITH) { const g = this.g; if (!g.p) return 0; let n = 0; for (const f of this.friends.values()) if (Math.hypot(f.tx - g.p.pos.x, f.tz - g.p.pos.z) <= r) n++; return n; }   // 목표 자리(마지막 받은 자리)로 잰다
  /** 👋 손 흔들기 — G 키·단추. 카드 열린 중엔 안 보냄 */
  wave() { const g = this.g; if (!this.on || g.ui?.isOpen?.()) return; const now = performance.now(); this.myWaveUntil = now + WAVE_MS; g.sound?.play?.('wave', 0.4); const r = this.reply && this.reply.until > now ? { to: this.reply.id, kind: this.reply.kind } : null; this.reply = null; try { this.ch.send({ type: 'broadcast', event: 'wave', payload: { id: this.me.sid, nick: this.me.nick, ...(r ? { reply: r } : {}) } }); } catch { } }   // 81: 곁 친구의 외침 뒤 9초 안에 G 면 답(reply)이 실려 간다
  /** 82: 내 외침에 답이 오면 내 몸도 손을 들어 답한다 + 답한 쪽엔 「고마워」 한 줄(reply kind 'back' — 그쪽은 다시 답하지 않는다) */
  waveBack(to) { if (!this.on) return; this.myWaveUntil = performance.now() + WAVE_MS; try { this.ch.send({ type: 'broadcast', event: 'wave', payload: { id: this.me.sid, nick: this.me.nick, reply: { to, kind: 'back' } } }); } catch { } }
  /** 외침 — 쫓김 끝(escaped/caught)·급한 일 늦음(late). 곁 친구 화면에만 뜬다 */
  shout(kind, title) { if (!this.on || !SHOUT[kind]) return; try { this.ch.send({ type: 'broadcast', event: 'shout', payload: { id: this.me.sid, nick: this.me.nick, kind, title: title || '', x: this.g.p?.pos.x, z: this.g.p?.pos.z } }); } catch { } }
  recvShout(p) { if (!p || !p.id || p.id === this.me?.sid || !SHOUT[p.kind]) return; const f = this.friends.get(p.id); const g = this.g; if (!f || !g.p) return; const x = p.x ?? f.tx, z = p.z ?? f.tz; if (Math.hypot(x - g.p.pos.x, z - g.p.pos.z) > NEAR_SHOUT) return; const pool = SHOUT[p.kind]; g.ui?.say?.(`👥 ${f.body.userData.nick || p.nick || '친구'} — ${pool[Math.floor(Math.random() * pool.length)]}${p.title ? ` (${p.title})` : ''} · G 👋`, 4200); f.shoutKind = p.kind; this.reply = { id: p.id, kind: p.kind, until: performance.now() + REPLY_MS }; }
  recvWave(p) { if (!p || !p.id || p.id === this.me?.sid) return; const f = this.friends.get(p.id); if (!f) return; f.waveUntil = performance.now() + WAVE_MS; const nick = f.body.userData.nick || p.nick || '친구'; const r = p.reply; if (r && r.to === this.me?.sid && REPLY[r.kind]) { const pool = REPLY[r.kind]; this.g.ui?.say?.(`👋 ${nick} — ${pool[Math.floor(Math.random() * pool.length)]}`, 3200); if (r.kind !== 'back') this.waveBack(p.id); return; }   // 81: 내 외침에 답한 손 흔들기 — 한 줄
    this.g.ui?.say?.(`👋 ${nick}이(가) 손을 흔든다`, 2600); }
  /** life.finish 가 부른다 — 무엇을 골랐는지 한 줄(제목만, 값 없음). `with` 면 곁 친구에게 「함께」 */
  picked(s, c) { if (!this.on) return; this.myPick = { sit: s.title, choice: c.title || c.label || '', with: !!c.with }; this.sendPick(); }
  sendPick() { try { this.ch.send({ type: 'broadcast', event: 'pick', payload: { id: this.me.sid, nick: this.me.nick, ...this.myPick } }); } catch { } }
  recvPick(p) {
    if (!p || !p.id || p.id === this.me?.sid) return; const f = this.friends.get(p.id); if (!f) { (this.pending ??= new Map()).set(p.id, p); return; } const g = this.g;   // 자리보다 먼저 오면 받아 뒀다가
    const nearNow = g.p && Math.hypot(f.x - g.p.pos.x, f.z - g.p.pos.z) <= NEAR_WITH;
    if (p.with && nearNow) { f.pick = { sit: p.sit, choice: p.choice, shown: true }; g.ui?.say?.(`👥 ${f.body.userData.nick || p.nick || '친구'}이(가) 너와 함께 — 「${p.sit}」`, 4200); return; }
    f.pick = { sit: p.sit, choice: p.choice, shown: false };
  }
  // ---------- HUD(왼쪽 여정 카드 밑) ----------
  hud() {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function' || document.getElementById('friendsbox')) return;
    const st = document.createElement('style'); st.textContent = `#friendsbox{display:none;margin-top:8px;padding:6px 10px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.05);font-size:11px;color:#f2dfb2;line-height:1.5}#friendsbox.on{display:block}#friendsbox .row{display:flex;align-items:center;justify-content:space-between;gap:8px}#friendsbox b{color:#fff}#friendsbox button{border:1px solid var(--line);background:rgba(255,255,255,.06);color:#f2dfb2;border-radius:999px;padding:2px 9px;font-size:11px;cursor:pointer;font-family:inherit}#friendsbox button:hover{border-color:var(--accent)}#friendsbox .names{opacity:.8;font-size:10px;margin-top:2px}`;
    document.head.appendChild(st); const el = document.createElement('div'); el.id = 'friendsbox'; (document.getElementById('hud') || document.body).appendChild(el); this.box = el; this.renderHud();
  }
  renderHud() {
    const el = this.box; if (!el) return; const n = this.friends.size; el.classList.toggle('on', n > 0);
    const names = [...this.friends.values()].map((f) => f.body.userData.nick || '친구'); el.innerHTML = `<div class="row"><span>👥 같이 있는 친구 <b>${n}</b></span><button id="wavebtn" title="손 흔들기 (G)">👋</button></div>${n ? `<div class="names">${names.map((x) => String(x).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]))).join(' · ')}</div>` : ''}`;
    const b = el.querySelector('#wavebtn'); if (b) b.onclick = () => this.wave();
  }
  /** 같이 있는 친구 수(시험·HUD용) */
  count() { return this.friends.size; }
}
