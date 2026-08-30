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
  let dbc = null, sessionP = null;

  const uuid = () => (g.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  function summary(doc) {
    const V = (doc && doc.V) || [], last = V[V.length - 1];
    return { durSec: last ? (last.at + last.dur) / 30 : 0, clips: V.filter(c => !c.gap).length };
  }

  /* ---------- ① 로컬 ---------- */
  const local = {
    list() { return DB ? DB.tx('projects', 'readonly', s => s.getAll()).then(r => (r || []).map(x => Object.assign({ where: 'local' }, x, { doc: undefined, hasDoc: true }))) : Promise.resolve([]); },
    get(id) { return DB ? DB.tx('projects', 'readonly', s => s.get(id)) : Promise.resolve(null); },
    put(rec) { return DB ? DB.tx('projects', 'readwrite', s => s.put(rec)) : Promise.resolve(null); },
    del(id) { return DB ? DB.tx('projects', 'readwrite', s => s.delete(id)) : Promise.resolve(null); },
    current() { return DB ? DB.getKV('current') : Promise.resolve(null); },
    setCurrent(id) { return DB ? DB.putKV('current', id) : Promise.resolve(null); },
  };

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
    sessionP.then(s => { if (!s) sessionP = null; });    // 로그인 없으면 다음에 다시 물어본다
    return sessionP;
  }
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
    async put(rec) {
      const s = await session(); if (!s) return false;
      const row = { id: rec.id, user_id: s.user.id, name: rec.name, doc: rec.doc, dur_sec: rec.durSec || 0, clips: rec.clips | 0, updated_at: new Date(rec.updatedAt || Date.now()).toISOString() };
      const q = await client().from('kmovie_projects').upsert(row, { onConflict: 'id' });
      if (q.error) throw q.error;
      return true;
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
  /* 가장 새 사본을 준다(로컬 vs 클라우드 중 updatedAt 큰 쪽) */
  async function get(id) {
    const l = await local.get(id).catch(() => null);
    let c = null; try { c = await cloud.get(id); } catch (e) { console.warn('[KMV store] cloud get', e); }
    if (l && c) return (c.updatedAt || 0) > (l.updatedAt || 0) ? Object.assign(c, { where: 'cloud' }) : Object.assign(l, { where: 'local' });
    return l ? Object.assign(l, { where: 'local' }) : (c ? Object.assign(c, { where: 'cloud' }) : null);
  }
  function make(doc, name) { const sm = summary(doc); return { id: uuid(), name: name || '새 작업', doc, updatedAt: Date.now(), durSec: sm.durSec, clips: sm.clips }; }
  async function save(rec, opt) {
    const sm = summary(rec.doc); rec.durSec = sm.durSec; rec.clips = sm.clips; rec.updatedAt = Date.now();
    await local.put(rec); await local.setCurrent(rec.id);
    if (opt && opt.cloud === false) return { cloud: false };
    try { return { cloud: await cloud.put(rec) }; } catch (e) { console.warn('[KMV store] cloud put', e); return { cloud: false, error: e }; }
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
  function parse(text) {
    const j = JSON.parse(text);
    if (!j || j.app !== 'kmovie' || !j.doc || !Array.isArray(j.doc.V)) throw new Error('케이무비 작업 파일이 아니에요');
    const rec = make(j.doc, j.name); if (j.id) rec.id = j.id;                      // 같은 작업을 다시 넣으면 같은 id 로 덮는다
    return rec;
  }
  async function fromFile(file) { return parse(await file.text()); }

  g.KMV_STORE = {
    FILE_EXT, init: db => { DB = db; }, uuid, summary,
    local, cloud, list, get, make, save, remove, rename, download, parse, fromFile,
    _reset: () => { dbc = null; sessionP = null; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
