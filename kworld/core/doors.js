// 신분의 문(130) — 못 들어가는 문·막힌 길이 글이 아니라 몸으로 보인다 + 내 집(신분마다 다른 자리).
//  · world.doors = { list:[{id, area, r, if, unless, who, say, fact}], homes:{ default | <status>: {area, say} } } (생성기 핸드오프 kworld/game/gen_doors130.py)
//  · 문: 조건(if, life.cond 문법)에 맞는 사람이 구역 중심 r(기본 5) 안으로 들어오면 r 밖으로 밀려나고 문지기 한마디(6.5초에 한 번) + 처음엔 📜 한 줄. 깃발 door:<id>:blocked.
//    들여보내는 때 = unless 조건 · 그 자리의 상황이 열려 있을 때(opened·pending) · 지금 미션 자리 · 쫓기는 중(pulse.chase) · 카드 열림·되감는 중. 상황은 11m 에서 열리니 카드 흐름은 그대로.
//  · 집: 지금 신분의 집(homes[status], 없으면 default). HUD 🏠 뒤에 자리 이름, 미니맵 🏠, 처음 집에 들어서면 한 줄(home:<status>), 삶 중간에 신분이 바뀌면 「🏠 집이 바뀌었다」.
//  · 값·판정·저장 변경 0 — 문은 신분이 정한다는 것을 발로 겪게 할 뿐. ?doors=0 으로 끔.
export class Doors {
  constructor(g, cfg) { this.g = g; this.list = (cfg?.list || []).map((d) => ({ r: 5, ...d })); this.homes = cfg?.homes || {}; this.last = new Map(); this.count = new Map(); this.homeSaid = new Set(); this.curHome = null; this.t = 0; this.ht = 0; }
  /** 이 문이 지금 나를 막나 */
  blocked(d) {
    const g = this.g; if (!g.cond(d.if)) return false; if (d.unless && g.cond(d.unless)) return false; if (g.pulse?.chase) return false;
    const L = g.life; if (L) { for (const id of L.opened || []) { if (L.done?.has(id)) continue; const s = (L.situations || []).find((x) => x.id === id); if (s?.place === d.area) return false; } if (L.rv?.pending?.place === d.area) return false; }
    const m = g.missions?.missions?.[g.mi]; if (m?.area === d.area) return false;
    return true;
  }
  tick(dt) {
    const g = this.g, p = g.p; if (!p?.pos || g.restoring || g.story?.cutsceneOn) return; this.t += dt; this.ht += dt;
    if (p.enabled && !g.ui?.isOpen?.()) for (const d of this.list) {
      const a = g.e.areas.get(d.area); if (!a) continue; const dx = p.pos.x - a.x, dz = p.pos.z - a.z, dist = Math.hypot(dx, dz); if (dist >= d.r) continue;
      if (!this.blocked(d)) continue;
      const k = dist > 0.05 ? (d.r + 0.4) / dist : 0; const nx = dist > 0.05 ? a.x + dx * k : a.x + d.r + 0.4, nz = dist > 0.05 ? a.z + dz * k : a.z;
      p.pos.set(nx, g.e.groundY(nx, nz) + (p.eye || 0), nz);
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()); if (this.last.has(d.id) && now - this.last.get(d.id) < 6500) continue; this.last.set(d.id, now); this.count.set(d.id, (this.count.get(d.id) || 0) + 1);
      g.sound?.play?.('locked', 0.45); g.ui?.say?.(`🚪 ${d.who ? d.who + ' — ' : ''}「${d.say}」`, 4200);
      if (!g.flags.has('door:' + d.id + ':blocked')) { g.flag('door:' + d.id + ':blocked'); if (d.fact) setTimeout(() => g.ui?.say?.('📜 ' + d.fact, 5600), 4400); }
    }
    if (this.ht >= 0.5) { this.ht = 0; this.homeTick(); }
  }
  /** 지금 신분의 집 */
  home() { const st = this.g.life?.status; return (st && this.homes[st]) || this.homes.default || null; }
  homeName() { const h = this.home(); return h ? (this.g.world?.areas?.[h.area]?.name || h.area) : ''; }
  homeArea() { const h = this.home(); return h ? (this.g.e?.areas?.get(h.area) || null) : null; }
  homeTick() {
    const g = this.g, h = this.home(); if (!h) return; const key = (g.life?.status || 'default') + ':' + h.area;
    if (key !== this.curHome) { const first = this.curHome === null; this.curHome = key; if (!first && this.t > 3 && !g.restoring) { g.ui?.say?.(`🏠 집이 바뀌었다 — ${this.homeName()}. ${h.say || ''}`, 5200); g.life?.render?.(); } }
    if (this.homeSaid.has(key) || g.ui?.isOpen?.()) return; const a = g.e?.areas?.get(h.area); if (!a) return;
    if (Math.hypot(a.x - g.p.pos.x, a.z - g.p.pos.z) < 9) { this.homeSaid.add(key); g.flag('home:' + (g.life?.status || 'default')); g.ui?.say?.(`🏠 내 집 — ${this.homeName()}. ${h.say || ''}`, 5200); }
  }
  /** 「그 뒤」 카드 한 줄 — 이 시대에 어느 문 앞에서 몇 번 돌아섰나. 한 번도 없으면 빈 글 */
  doorLine() {
    const total = [...this.count.values()].reduce((a, b) => a + b, 0); if (!total) return '';
    const names = this.list.filter((d) => this.count.get(d.id)).map((d) => this.g.world?.areas?.[d.area]?.name || d.area);
    return `막힌 문 — ${names.join('·')}에서 ${total}번 돌아섰다. 문은 신분이 정했다.`;
  }
}
