/* ============================================================
   케이무비 작업 파일 저장소 (KMV_STORE)
   ------------------------------------------------------------
   · 작업 = { id, name, doc, updatedAt(ms), durSec, clips }. doc 은 KMV_PROJECT.toJSON() —
     편집 상태만 있고 원본 영상 바이트는 없다(원본은 기기에 남는다 — 프리미어와 같은 원리).
   · 세 자리에 산다: ① 이 기기 IndexedDB(항상) ② 케이에듀 계정 Supabase(로그인 시, 어디서든 목록)
     ③ .kmv 파일(직접 옮기기). 목록은 ①②를 id 로 합쳐 보여준다.
   · 클라우드는 sql/setup_kmovie_projects.sql — 본인 행만(RLS). supabase-js·kedu_config 가 없거나
     로그인이 없으면 조용히 로컬만(브라우저판·차단망·테스트에서 그대로 돈다).
   ============================================================ */
(function (g) {
  'use strict';

  const FILE_EXT = '.kmv', FILE_V = 1;
  let DB = null;                                              // kmovie.js 의 IndexedDB 래퍼(projects 스토어 필요)
  let dbc = null, sessionP = null, sessionNow = null, authHooked = false;   // sessionNow: keepalive 저장용 동기 사본(토큰 갱신을 따라간다)
  /* 주인(owner) — 이 브라우저의 IndexedDB 는 계정과 무관하게 하나라, 같은 컴퓨터에서 다른 케이에듀 계정으로 들어오면 남의 작업이 그대로 떴다(2026-09-09 준호 보고).
     그래서 로컬 레코드마다 owner(계정 uid, 로그인 없으면 'anon')를 붙이고 목록·시작 작업(current)·get 을 주인으로 가른다.
     ownerNow = 이 페이지가 열릴 때 정한 주인. 다른 탭에서 로그인/로그아웃해 주인이 바뀌면 onOwnerChange 로 알린다(kmovie.js 가 저장 후 새로고침). */
  let ownerNow = null, ownerP = null, ownerCbs = [];
  const ANON = 'anon';

  const uuid = () => (g.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  function summary(doc) {
    const V = (doc && doc.V) || [], last = V[V.length - 1];
    return { durSec: last ? (last.at + last.dur) / 30 : 0, clips: V.filter(c => !c.gap).length };
  }

  /* ---------- ① 로컬 (주인별) ---------- */
  async function owner() {
    if (ownerNow) return ownerNow;
    if (!ownerP) ownerP = session().then(s => { ownerNow = (s && s.user && s.user.id) || ANON; return ownerNow; }).catch(() => (ownerNow = ANON));
    return ownerP;
  }
  const mine = (r, o) => !!r && (r.owner ? r.owner === o : o === ANON);        // owner 없는 옛 레코드는 로그인 없는 자리에서만 보인다(로그인 뒤엔 claimLegacy 가 주인을 붙인다)
  const curKey = o => o === ANON ? 'current' : 'current:' + o;                  // 로그인 없는 자리는 옛 키 그대로(호환)
  const local = {
    async list() { if (!DB) return []; const o = await owner(); const r = await DB.tx('projects', 'readonly', s => s.getAll()); return (r || []).filter(x => mine(x, o)).map(x => Object.assign({ where: 'local' }, x, { doc: undefined, hasDoc: true })); },
    async get(id) { if (!DB) return null; const o = await owner(); const r = await DB.tx('projects', 'readonly', s => s.get(id)); return mine(r, o) ? r : null; },
    async put(rec) { if (!DB) return null; rec.owner = await owner(); return DB.tx('projects', 'readwrite', s => s.put(rec)); },
    del(id) { return DB ? DB.tx('projects', 'readwrite', s => s.delete(id)) : Promise.resolve(null); },
    async current() { if (!DB) return null; return DB.getKV(curKey(await owner())); },
    async setCurrent(id) { if (!DB) return null; return DB.putKV(curKey(await owner()), id); },
  };
  /* 주인 없는 옛 레코드(2026-09-09 이전 저장)에 주인 붙이기 — 로그인한 첫 시작 때 한 번. 계정에 같은 id 가 있으면 확실히 그 사람 것, 나머지도 그 사람 것으로 본다
     (같은 브라우저에서 먼저 로그인한 계정이 가져간다 — 이 컴퓨터를 그 사람 혼자 쓰던 시절의 작업이므로). 옛 kv 'current' 도 그 계정의 current 로 옮긴다. 돌려주는 값 = 붙인 개수. */
  async function claimLegacy() {
    if (!DB) return 0; const o = await owner(); if (o === ANON) return 0;
    const all = (await DB.tx('projects', 'readonly', s => s.getAll())) || [], orphan = all.filter(r => r && !r.owner);
    if (!orphan.length) return 0;
    for (const r of orphan) { r.owner = o; await DB.tx('projects', 'readwrite', s => s.put(r)); }
    try { const old = await DB.getKV('current'); if (old && orphan.some(r => r.id === old)) { const cur = await DB.getKV(curKey(o)); if (!cur) await DB.putKV(curKey(o), old); } await DB.putKV('current', null); } catch (e) {}
    return orphan.length;
  }
  function onOwnerChange(cb) { ownerCbs.push(cb); }
  function ownerChanged(s) {
    const o = (s && s.user && s.user.id) || ANON;
    if (ownerNow && o !== ownerNow) { const prev = ownerNow; ownerCbs.forEach(cb => { try { cb(o, prev); } catch (e) {} }); }
  }

  /* ---------- ② 계정(클라우드) ---------- */
  function client() {
    if (dbc) return dbc;
    try { if (typeof g.getKeduDb === 'function' && g.supabase && g.supabase.createClient) dbc = g.getKeduDb(); } catch (e) { dbc = null; }
    return dbc;
  }
  function session() {
    if (sessionP) return sessionP;
    const c = client();
    sessionP = c ? c.auth.getSession().then(r => (r && r.data && r.data.session) || null).catch(() => null) : Promise.resolve(null);
    sessionP.then(s => { sessionNow = s; if (!s) sessionP = null; });    // 로그인 없으면 다음에 다시 물어본다
    if (c && !authHooked) { authHooked = true; try { c.auth.onAuthStateChange((ev, s) => { sessionNow = s || null; if (!s) sessionP = null; ownerChanged(s); }); } catch (e) {} }
    return sessionP;
  }
  const iso = ms => new Date(ms || Date.now()).toISOString();
  const cloud = {
    async ready() { return !!(await session()); },
    async list() {
      const s = await session(); if (!s) return [];
      const q = await client().from('kmovie_projects').select('id,name,dur_sec,clips,updated_at').order('updated_at', { ascending: false });
      if (q.error) throw q.error;
      return (q.data || []).map(r => ({ id: r.id, name: r.name, durSec: +r.dur_sec || 0, clips: r.clips | 0, updatedAt: Date.parse(r.updated_at), where: 'cloud' }));
    },
    async get(id) {
      const s = await session(); if (!s) return null;
      const q = await client().from('kmovie_projects').select('id,name,doc,dur_sec,clips,updated_at').eq('id', id).maybeSingle();
      if (q.error) throw q.error;
      const r = q.data; if (!r) return null;
      return { id: r.id, name: r.name, doc: r.doc, durSec: +r.dur_sec || 0, clips: r.clips | 0, updatedAt: Date.parse(r.updated_at) };
    },
    /* 계정에 있는 행의 시각만 (없으면 null) */
    async stamp(id) {
      const s = await session(); if (!s) return null;
      const q = await client().from('kmovie_projects').select('updated_at').eq('id', id).maybeSingle();
      if (q.error) throw q.error;
      return q.data ? Date.parse(q.data.updated_at) : null;
    },
    /* 낙관적 잠금 저장. baseAt = 내가 마지막으로 본 계정 시각(ms). 계정 행이 그보다 새면 덮어쓰지 않고 conflict 로 돌려준다.
       baseAt 이 0(이 기기에서만 살던 작업)인데 계정에 이미 행이 있으면 그것도 conflict — 옛 사본이 새 작업을 덮는 길을 막는다.
       돌려주는 값: { ok, at } | { conflict:true, remoteAt } */
    async put(rec, baseAt) {
      const s = await session(); if (!s) return { ok: false };
      const row = { id: rec.id, user_id: s.user.id, name: rec.name, doc: rec.doc, dur_sec: rec.durSec || 0, clips: rec.clips | 0, updated_at: iso(rec.updatedAt) };
      const c = client();
      if (baseAt) {
        const u = await c.from('kmovie_projects').update(row).eq('id', rec.id).lte('updated_at', iso(baseAt + 1)).select('id');
        if (u.error) throw u.error;
        if (u.data && u.data.length) return { ok: true, at: rec.updatedAt };
      }
      const remoteAt = await cloud.stamp(rec.id);
      if (remoteAt == null) { const i = await c.from('kmovie_projects').insert(row); if (i.error) throw i.error; return { ok: true, at: rec.updatedAt }; }
      if (baseAt && remoteAt <= baseAt + 1) { const u2 = await c.from('kmovie_projects').update(row).eq('id', rec.id); if (u2.error) throw u2.error; return { ok: true, at: rec.updatedAt }; }
      return { conflict: true, remoteAt };
    },
    /* 창을 닫을 때 — keepalive fetch 로 REST 에 직접(대기 안 함). 본문 한도(약 64KB) 넘으면 보내지 않고 false. */
    putKeepalive(rec, baseAt) {
      try {
        const c = client(); if (!c || !g.fetch) return false;
        const url = c.supabaseUrl || (c.rest && c.rest.url && c.rest.url.replace(/\/rest\/v1\/?$/, '')), key = c.supabaseKey;
        const tok = sessionNow && sessionNow.access_token; if (!url || !key || !tok) return false;
        const body = JSON.stringify({ name: rec.name, doc: rec.doc, dur_sec: rec.durSec || 0, clips: rec.clips | 0, updated_at: iso(rec.updatedAt) });
        if (body.length > 60000 || !baseAt) return false;
        const q = url + '/rest/v1/kmovie_projects?id=eq.' + encodeURIComponent(rec.id) + '&updated_at=lte.' + encodeURIComponent(iso(baseAt + 1));
        g.fetch(q, { method: 'PATCH', keepalive: true, headers: { apikey: key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body }).catch(() => {});
        return true;
      } catch (e) { return false; }
    },
    async del(id) {
      const s = await session(); if (!s) return false;
      const q = await client().from('kmovie_projects').delete().eq('id', id);
      if (q.error) throw q.error;
      return true;
    },
  };

  /* ---------- 합친 목록 ---------- */
  async function list() {
    const [L, C] = await Promise.all([local.list().catch(() => []), cloud.list().catch(e => { console.warn('[KMV store] cloud list', e); return null; })]);
    const map = new Map();
    for (const r of L) map.set(r.id, Object.assign({}, r, { localAt: r.updatedAt }));
    if (C) for (const r of C) {
      const x = map.get(r.id);
      if (x) { x.where = 'both'; x.cloudAt = r.updatedAt; if (r.updatedAt > (x.updatedAt || 0)) { x.updatedAt = r.updatedAt; x.name = r.name; x.durSec = r.durSec; x.clips = r.clips; } }
      else map.set(r.id, Object.assign({}, r, { cloudAt: r.updatedAt }));
    }
    return [...map.values()].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).map(r => Object.assign(r, { cloudOk: C !== null }));
  }
  /* 가장 새 사본을 준다(로컬 vs 클라우드 중 updatedAt 큰 쪽). localAt·cloudAt 을 같이 돌려줘 시작 때 어느 쪽을 올릴지 정한다. */
  async function get(id) {
    const l = await local.get(id).catch(() => null);
    let c = null, cloudOk = true; try { c = await cloud.get(id); } catch (e) { cloudOk = false; console.warn('[KMV store] cloud get', e); }
    const tag = (r, where) => Object.assign(r, { where, localAt: l ? (l.updatedAt || 0) : 0, cloudAt: c ? (c.updatedAt || 0) : 0, cloudOk });
    if (l && c) return (c.updatedAt || 0) > (l.updatedAt || 0) ? tag(c, 'cloud') : tag(l, 'local');
    return l ? tag(l, 'local') : (c ? tag(c, 'cloud') : null);
  }
  function make(doc, name) { const sm = summary(doc); return { id: uuid(), name: name || '새 작업', doc, updatedAt: Date.now(), durSec: sm.durSec, clips: sm.clips }; }
  /* opt.cloud=false → 로컬만. opt.baseAt → 낙관적 잠금 기준 시각. 돌려주는 값 { cloud, at?, conflict?, remoteAt?, error? } */
  async function save(rec, opt) {
    const sm = summary(rec.doc); rec.durSec = sm.durSec; rec.clips = sm.clips; rec.updatedAt = Date.now();
    await local.put(rec); await local.setCurrent(rec.id);
    if (opt && opt.cloud === false) return { cloud: false };
    try {
      const r = await cloud.put(rec, opt && opt.baseAt);
      if (r.conflict) return { cloud: false, conflict: true, remoteAt: r.remoteAt };
      return { cloud: !!r.ok, at: r.at };
    } catch (e) { console.warn('[KMV store] cloud put', e); return { cloud: false, error: e }; }
  }
  async function remove(id) { await local.del(id); try { await cloud.del(id); } catch (e) { console.warn('[KMV store] cloud del', e); } }
  async function rename(id, name) {
    const l = await local.get(id); if (l) { l.name = name; await local.put(l); }
    try { const s = await session(); if (s) { const q = await client().from('kmovie_projects').update({ name }).eq('id', id); if (q.error) throw q.error; } } catch (e) { console.warn('[KMV store] cloud rename', e); }
  }

  /* ---------- ③ .kmv 파일 ---------- */
  function fileText(rec) { return JSON.stringify({ app: 'kmovie', v: FILE_V, id: rec.id, name: rec.name, updatedAt: rec.updatedAt, doc: rec.doc }); }
  function download(rec) {
    const blob = new Blob([fileText(rec)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = (rec.name || '케이무비 작업').replace(/[\\/:*?"<>|]+/g, '_') + FILE_EXT;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }
  /* 작업 폴더(File System Access API)에 <이름>.kmv 로 쓰기 — 편집 상태만이라 작다(영상 바이트 0). 돌려주는 값 { name, bytes } */
  async function writeToDir(dir, rec) {
    const text = fileText(rec), name = (rec.name || '케이무비 작업').replace(/[\\/:*?"<>|]+/g, '_') + FILE_EXT;
    const fh = await dir.getFileHandle(name, { create: true });
    const w = await fh.createWritable(); await w.write(text); await w.close();
    return { name, bytes: new Blob([text]).size };
  }
  function fileBytes(rec) { return new Blob([fileText(rec)]).size; }
  function parse(text) {
    const j = JSON.parse(text);
    if (!j || j.app !== 'kmovie' || !j.doc || !Array.isArray(j.doc.V)) throw new Error('케이무비 작업 파일이 아니에요');
    const rec = make(j.doc, j.name); if (j.id) rec.id = j.id;                      // 같은 작업을 다시 넣으면 같은 id 로 덮는다
    return rec;
  }
  async function fromFile(file) { return parse(await file.text()); }

  g.KMV_STORE = {
    FILE_EXT, init: db => { DB = db; }, uuid, summary,
    local, cloud, list, get, make, save, remove, rename, download, writeToDir, fileBytes, parse, fromFile, iso,
    owner, claimLegacy, onOwnerChange, ANON, client, session,
    _reset: () => { dbc = null; sessionP = null; sessionNow = null; authHooked = false; ownerNow = null; ownerP = null; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
