// 저장·리포트층 — 깃발·주머니·배고픔·자리·확인 결과·인생 층을 3초 디바운스로 저장한다(구조 설계 v1 §9).
// 1) 이 기기(localStorage) 에 — 동의 전 학생·방문자는 /kedu_scope.js 가 메모리에만 두므로 새로고침이면 사라진다(준호 결정 2026-09-09)
// 2) 케이에듀 정식 좌석(KeduTier.resolve → student) + SQL #38 적용이면 학생 행에 upsert(조용히 실패) — 다른 기기에서 이어서 할 수 있게
//    시작 때 서버 저장이 이 기기 것보다 새것이면 서버 것을 쓴다(loadMerged). 끝 카드는 kworld_jokbo 에 한 줄 남기고(recordEnd),
//    시작 때 서버 족보를 이 기기의 kworld_carry:<era>·kworld_jokbo 에 채운다(syncJokbo) — 넘겨받기·족보가 기기를 안 가린다.
// 재개: 시작 때 저장이 있으면 「이어서 하기 / 처음부터」. 컷신·선택 판 도중엔 저장하지 않는다. 시대 이름 없음(era 키만).
import { histEntry } from './jokbo.js';
const LS = () => (typeof localStorage !== 'undefined' ? localStorage : null);
const rd = (k) => { try { return JSON.parse(LS()?.getItem(k) || 'null'); } catch { return null; } };
const wr = (k, v) => { try { LS()?.setItem(k, JSON.stringify(v)); } catch { } };

/** 케이에듀 좌석 — 한 페이지에 한 번만 묻는다. {db, sid, nick, classId} 또는 null(방문자·게스트·교사·미연결) */
let _seat = null;
export function resetSeat() { _seat = null; }   // 시험용
export function seat() {
  if (_seat) return _seat;
  _seat = (async () => {
    try {
      if (typeof window === 'undefined' || typeof getKeduDb !== 'function' || !window.KeduTier?.resolve) return null;
      const db = getKeduDb(); const t = await window.KeduTier.resolve(db);
      if (!window.KeduTier.canSave(t)) return null;
      const sid = t.profile?.profile_id; return sid ? { db, sid, nick: t.profile?.nickname || '', classId: t.profile?.class_code_id || null } : null;
    } catch { return null; }
  })();
  return _seat;
}

/** 서버 족보 → 이 기기. 시대마다 가장 최근 끝 한 줄을 kworld_carry:<era> 로(기기 것이 더 새면 둔다), kworld_jokbo 는 합쳐서 시각순 */
export async function syncJokbo() {
  const s = await seat(); if (!s) return false;
  try {
    const { data } = await s.db.from('kworld_jokbo').select('era,record,ended_at').eq('student_id', s.sid).order('ended_at', { ascending: true }).limit(300);
    if (!data) return false;
    const hist = rd('kworld_jokbo') || []; const have = new Set(hist.map((h) => h.era + ':' + h.t));
    for (const row of data) {
      const rec = row.record || {}; const t = rec.t || Date.parse(row.ended_at) || 0;
      const cur = rd('kworld_carry:' + row.era); if (!cur || (cur.t || 0) < t) wr('kworld_carry:' + row.era, { ...rec, t });
      if (Array.isArray(rec.heirlooms) && rec.heirlooms.length) { const hl = rd('kworld_heirlooms') || []; let added = false; for (const h of rec.heirlooms) if (h?.id && !hl.some((x) => x.id === h.id)) { hl.push({ id: h.id, era: row.era, name: h.name, tag: h.tag || null, fact: h.fact || null, t: h.t || t }); added = true; } if (added) wr('kworld_heirlooms', hl.slice(-40)); }   // 물려줄 것도 서버 → 기기
      if (!have.has(row.era + ':' + t)) { hist.push(histEntry(row.era, { ...rec, t })); have.add(row.era + ':' + t); }   // 145: 끝 카드와 같은 꼴(연대기 칸까지)
    }
    hist.sort((a, b) => (a.t || 0) - (b.t || 0)); wr('kworld_jokbo', hist.slice(-300)); return true;
  } catch { return false; }
}

export class Save {
  constructor(g, era) { this.g = g; this.era = era; this.key = 'kworld_progress:' + era; this.timer = null; this.enabled = true; }
  snapshot() {
    const g = this.g; return { v: 1, era: this.era, flags: [...g.flags], inventory: [...g.inventory], hunger: Math.round(g.hunger), pos: g.p ? [Math.round(g.p.pos.x * 10) / 10, Math.round(g.p.pos.z * 10) / 10, Math.round((g.p.yaw || 0) * 100) / 100] : null, results: g.results || [], telemetry: g.telemetry || null, char: g.character?.id || null, sex: g.sex?.id || null, mi: g.mi, life: g.life?.snapshot() || null, pulse: g.pulse?.snapshot() || null, t: Date.now() };
  }
  /** 깃발이 설 때마다 부른다 — 3초 뒤 한 번만 쓴다 */
  touch() { if (!this.enabled || this.g.story?.cutsceneOn) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.write(), 3000); }
  write() {
    const snap = this.snapshot(); try { localStorage.setItem(this.key, JSON.stringify(snap)); } catch { }
    this.remote(snap);
  }
  async remote(snap) {
    const s = await seat(); if (!s) return;
    try { await s.db.from('kworld_progress').upsert({ student_id: s.sid, era: this.era, flags: snap.flags, inventory: snap.inventory, results: snap.results, telemetry: snap.telemetry, hunger: snap.hunger, pos: snap.pos, life: snap.life, chr: snap.char, sex: snap.sex, mi: snap.mi ?? null, updated_at: new Date(snap.t).toISOString() }, { onConflict: 'student_id,era' }); } catch { }
  }
  /** 끝 카드 한 줄 — 서버 족보(kworld_jokbo). 같은 기기엔 life.end() 가 이미 썼다 */
  async recordEnd(rec) {
    const s = await seat(); if (!s) return;
    try { await s.db.from('kworld_jokbo').insert({ student_id: s.sid, era: this.era, branch: rec.branch || null, title: rec.title || null, status: rec.status || null, status_name: rec.statusName || null, nation: rec.nation || null, nation_name: rec.nationName || null, record: rec, ended_at: new Date(rec.t || Date.now()).toISOString() }); } catch { }
  }
  load() { try { const s = JSON.parse(localStorage.getItem(this.key) || 'null'); return s && s.v === 1 && s.flags?.length ? s : null; } catch { return null; } }
  /** 이 기기 + 서버 중 새것. 서버 족보도 이때 같이 당긴다(넘겨받기 전에) */
  async loadMerged() {
    const local = this.load(); const s = await seat(); if (!s) return local;
    await syncJokbo();
    try {
      const { data } = await s.db.from('kworld_progress').select('flags,inventory,results,telemetry,hunger,pos,life,chr,sex,mi,updated_at').eq('student_id', s.sid).eq('era', this.era).maybeSingle();
      if (!data || !data.flags?.length) return local;
      const t = Date.parse(data.updated_at) || 0; if (local && (local.t || 0) >= t) return local;
      const snap = { v: 1, era: this.era, flags: data.flags, inventory: data.inventory || [], hunger: data.hunger, pos: data.pos, results: data.results || [], telemetry: data.telemetry, char: data.chr, sex: data.sex, mi: data.mi, life: data.life, t }; wr(this.key, snap); return snap;
    } catch { return local; }
  }
  clear() { try { localStorage.removeItem(this.key); } catch { } seat().then((s) => { if (s) s.db.from('kworld_progress').delete().eq('student_id', s.sid).eq('era', this.era).then(() => { }, () => { }); }).catch(() => { }); }
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
      if (g.life) {   // 인생 층: 하늘·불은 상황 깃발로 되짚는다(사건은 지나간 것으로)
        if (F('gone:1') || F('sit:rain:done')) st.transition('day', 0.5); else if (F('rain:on')) { st.transition('rainy', 0.5); st.rain(true); } else if (F('sit:share:done')) st.transition('night', 0.5); else if (F('day:2') || F('fire:kept')) st.transition('day', 0.5);
        if (F('fire:kept')) g.setFire(true); else if (F('night:1')) g.setFire(true, true);
        if (snap.life?.sky) st.setSky?.(snap.life.sky);   // 계절·날씨 하늘(10-13): 저장본의 하늘 한 줄로 되짚는다 — 위 깃발 규칙(구석기)보다 뒤라 이것이 이긴다
      }
    }
    if (snap.pos && g.p) { g.p.pos.x = snap.pos[0]; g.p.pos.z = snap.pos[1]; g.p.yaw = snap.pos[2] || 0; if (g.e.groundY) g.p.pos.y = g.e.groundY(snap.pos[0], snap.pos[1]) + (g.world.eye || 1.55); }
    g.updateMission?.(true); g.restoring = false;
  }
}
