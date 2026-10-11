// 케이히스토리 엔진 · friends.js — 반 멀티 0단계 「같은 마을에 반 친구가 보인다」(역사 인생게임 3단계의 첫 층, 2026-10-12).
//  · 정식 좌석(동의 학생)만. 같은 학급 × 같은 시대 = Supabase Realtime 채널 하나(`kworld:<class_code_id>:<era>`) — 표·RLS 없음, DB 에 아무것도 안 쌓인다(케이파크 KParkNet 과 같은 길).
//  · 오가는 건 자리(x·z·yaw·걷는 중)뿐, 5번/초. 이름표는 좌석 이름(번호+이름). 화면·판정은 각자 — 친구는 보이기만 하고 내 상황·값에 손대지 않는다.
//  · 20초 넘게 소식 없으면 사라진다. `?friends=0` 또는 world.friends === false 면 끔. 망에서 wss 가 막히면 조용히 없음.
import * as THREE from 'three';
import { createAvatar } from './avatar.js';
import { seat } from './save.js';

const SEND_MS = 200, STALE_MS = 20000;
function label(text) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); if (!x) return null;
  x.font = '600 30px "Gowun Dodum", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(14,18,20,.55)'; const w = Math.min(240, x.measureText(text).width + 28); x.beginPath(); if (x.roundRect) x.roundRect((256 - w) / 2, 8, w, 48, 14); else x.rect((256 - w) / 2, 8, w, 48); x.fill();
  x.fillStyle = '#f5d68a'; x.fillText(text, 128, 34);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); sp.scale.set(2.2, 0.55, 1); sp.renderOrder = 999; return sp;
}

export class Friends {
  constructor(g) { this.g = g; this.ch = null; this.me = null; this.friends = new Map(); this.last = null; this.lastSend = -1e9; this.on = false; }
  async start() {
    const g = this.g; if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('friends') === '0') return; if (g.world.friends === false) return;
    const s = await seat(); if (!s || !s.classId || !s.db?.channel) return; this.me = s;
    try {
      this.ch = s.db.channel('kworld:' + s.classId + ':' + g.era, { config: { broadcast: { self: false }, presence: { key: s.sid } } });
      this.ch.on('broadcast', { event: 'pos' }, ({ payload }) => this.recv(payload));
      this.ch.on('presence', { event: 'leave' }, ({ key }) => this.drop(key));
      this.ch.subscribe((st) => { if (st === 'SUBSCRIBED') { this.on = true; this.ch.track({ nick: s.nick, chr: g.character?.id || null }); this.send(true); } });
      g.e.onFrame.push((dt) => this.tick(dt));
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
      body.position.set(p.x, g.e.groundY ? g.e.groundY(p.x, p.z) : 0, p.z);
    }
    f.tx = p.x; f.tz = p.z; f.tyaw = p.yaw || 0; f.mv = !!p.mv; f.t = performance.now();
  }
  drop(id) { const f = this.friends.get(id); if (!f) return; this.g.e.scene.remove(f.body); this.friends.delete(id); }
  tick(dt) {
    this.send(); const now = performance.now(); const g = this.g;
    for (const [id, f] of this.friends) {
      if (now - f.t > STALE_MS) { this.drop(id); continue; }
      const k = Math.min(1, dt * 8); f.x += (f.tx - f.x) * k; f.z += (f.tz - f.z) * k; let d = f.tyaw - f.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); f.yaw += d * k;
      const moving = f.mv || Math.hypot(f.tx - f.x, f.tz - f.z) > 0.05; if (moving) f.walk += dt;
      f.body.position.set(f.x, g.e.groundY ? g.e.groundY(f.x, f.z) : f.body.position.y, f.z); f.body.rotation.y = f.yaw; f.body.userData.animate?.(f.walk, moving);
    }
  }
  /** 같이 있는 친구 수(시험·HUD용) */
  count() { return this.friends.size; }
}
