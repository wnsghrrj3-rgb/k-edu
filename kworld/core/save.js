// 저장·리포트층 — 깃발·주머니·배고픔·자리·확인 결과를 3초 디바운스로 저장한다(구조 설계 v1 §9).
// 1) 이 브라우저(localStorage) 에 항상 · 2) 케이에듀 로그인 + SQL #kworld_progress 적용이면 학생 행에 upsert(조용히 실패).
// 재개: 시작 때 저장이 있으면 「이어서 하기 / 처음부터」. 컷신·선택 판 도중엔 저장하지 않는다. 시대 이름 없음(era 키만).
export class Save {
  constructor(g, era) { this.g = g; this.era = era; this.key = 'kworld_progress:' + era; this.timer = null; this.enabled = true; }
  snapshot() {
    const g = this.g; return { v: 1, era: this.era, flags: [...g.flags], inventory: [...g.inventory], hunger: Math.round(g.hunger), pos: g.p ? [Math.round(g.p.pos.x * 10) / 10, Math.round(g.p.pos.z * 10) / 10, Math.round((g.p.yaw || 0) * 100) / 100] : null, results: g.results || [], telemetry: g.telemetry || null, mi: g.mi, t: Date.now() };
  }
  /** 깃발이 설 때마다 부른다 — 3초 뒤 한 번만 쓴다 */
  touch() { if (!this.enabled || this.g.story?.cutsceneOn) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.write(), 3000); }
  write() {
    const snap = this.snapshot(); try { localStorage.setItem(this.key, JSON.stringify(snap)); } catch { }
    this.remote(snap);
  }
  remote(snap) {
    try {
      const sid = window.kedu?.debug?.().studentId; const db = typeof getKeduDb === 'function' ? getKeduDb() : null; if (!sid || !db) return;
      db.from('kworld_progress').upsert({ student_id: sid, era: this.era, flags: snap.flags, inventory: snap.inventory, results: snap.results, telemetry: snap.telemetry, hunger: snap.hunger, pos: snap.pos, updated_at: new Date().toISOString() }, { onConflict: 'student_id,era' }).then(() => { }).catch(() => { });
    } catch { }
  }
  load() { try { const s = JSON.parse(localStorage.getItem(this.key) || 'null'); return s && s.v === 1 && s.flags?.length ? s : null; } catch { return null; } }
  clear() { try { localStorage.removeItem(this.key); } catch { } }
  /** 저장본을 세상에 적용 — 깃발 → 사건은 「이미 일어난 것」으로 표시 → 하늘·불·자리 */
  apply(snap) {
    const g = this.g; g.restoring = true;
    for (const f of snap.flags) g.flags.add(f);
    g.inventory.length = 0; for (const it of snap.inventory) g.inventory.push(it);
    g.hunger = snap.hunger ?? g.hunger; g.results = snap.results || []; g.telemetry = snap.telemetry || g.telemetry; g.renderInv?.();
    const st = g.story;
    if (st) {
      for (const ev of g.world.events || []) if (g.cond(ev.on)) ev.done = true;   // 지나간 사건은 다시 일으키지 않는다
      st.nightOn = false; st.onFlag();
      const F = (x) => g.flags.has(x);
      if (F('act12')) { st.transition('night', 0.5); g.setFire(true); }
      else if (F('act11')) st.transition('dull', 0.5);
      else if (F('act9')) { st.transition('day', 0.5); g.setFire(F('act10')); }
      else if (F('share:done')) { st.nightOn = true; st.transition('night', 0.5); g.setFire(true, !F('fire:alive')); g.hungerMul = F('fire:alive') ? 1 : (g.world.night?.coldMul || 1.8); }
      for (const ev of g.world.events || []) if (g.cond(ev.on)) ev.done = true;
    }
    if (snap.pos && g.p) { g.p.pos.x = snap.pos[0]; g.p.pos.z = snap.pos[1]; g.p.yaw = snap.pos[2] || 0; if (g.e.groundY) g.p.pos.y = g.e.groundY(snap.pos[0], snap.pos[1]) + (g.world.eye || 1.55); }
    g.updateMission?.(true); g.restoring = false;
  }
}
