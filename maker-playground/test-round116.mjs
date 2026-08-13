/* ============================================================
   test-round116.mjs — 저장이 5MB 에서 죽던 세계를 끝낸다 (IndexedDB 이관)
   ------------------------------------------------------------
   §1.109 R89 가 남긴 빚: 사진 dataURL 이 실리는 K_DOC·K_PROJ 는
   수십 장 프로젝트에서 localStorage 5MB 쿼터를 넘고, setItem 이 던지면
   saveDoc 은 조용히 false — 사용자는 저장이 죽은 줄 모른 채 작품을 잃는다.

   처방 = MK_STORE(동기 파사드 + 비동기 IDB 미러). 계약:
     ① 파사드 동기 의미 — set/get/remove, 값 문자열 강제
     ② 첫 가동 이주 — IDB 빈 날 localStorage mklive:* 를 실어 온다 (원본 보존)
     ③ IDB 보유 부팅 — IDB 가 정본, localStorage 낡은 값 무시
     ④ IDB 부재 → ready false, live.js store() 는 종전 localStorage (옛 세계 무손)
     ⑤ 우선순위 — useBackend 주입 > MK_STORE > localStorage (하니스 계약 보전)
     ⑥ write-through — setItem 이 IDB 에 내구 도달 (whenIdle)
     ⑦ 대용량 — 쿼터 던지는 localStorage 세계에서 6MB saveDoc 이 이제 성공
     ⑧ 부팅 복원 — init 뒤 restoreProjects 가 실리고 home 화면이 다시 그려진다
     ⑨ IDB 쓰기 실패 — localStorage 폴백 + degraded 정직 표시
     ⑩ removeItem 전파 — IDB·localStorage 사본 동시 소거 (부활 차단)
     ⑪ audit 자기 검증 통과
     ⑫ 리뷰 모드 저장 차단 규약 무손 (autosave review 게이트)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R116_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let pass = 0, fail = 0;
const T = (name, ok, note) => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${note ? ' — ' + note : ''}`); }
};

/* ---------- 미니 가짜 IndexedDB — store.js 가 쓰는 표면만 ---------- */
function fakeIDB(opts = {}) {
  const dbs = {};
  const later = (fn) => queueMicrotask(fn);
  const mkReq = () => ({ onsuccess: null, onerror: null, onupgradeneeded: null, result: null, error: null });
  function storeAPI(map) {
    return {
      put(v, k) {
        const r = mkReq();
        later(() => {
          if (opts.failPut) { r.error = new Error('quota'); return r.onerror && r.onerror({ target: r }); }
          map.set(String(k), v); r.onsuccess && r.onsuccess({ target: r });
        });
        return r;
      },
      delete(k) { const r = mkReq(); later(() => { map.delete(String(k)); r.onsuccess && r.onsuccess({ target: r }); }); return r; },
      getAllKeys() { const r = mkReq(); later(() => { r.result = [...map.keys()]; r.onsuccess && r.onsuccess({ target: r }); }); return r; },
      getAll() { const r = mkReq(); later(() => { r.result = [...map.values()]; r.onsuccess && r.onsuccess({ target: r }); }); return r; },
    };
  }
  const factory = {
    _dbs: dbs,
    open(name) {
      const req = mkReq();
      later(() => {
        if (opts.failOpen) { req.error = new Error('open fail'); return req.onerror && req.onerror({ target: req }); }
        let db = dbs[name], isNew = false;
        if (!db) {
          isNew = true;
          const stores = {};
          db = dbs[name] = {
            name, stores,
            objectStoreNames: { contains: (s) => s in stores },
            createObjectStore(s) { stores[s] = new Map(); return storeAPI(stores[s]); },
            transaction(s) { return { objectStore: () => storeAPI(stores[s]) }; },
            close() {},
          };
        }
        req.result = db;
        if (isNew && req.onupgradeneeded) req.onupgradeneeded({ target: req });
        req.onsuccess && req.onsuccess({ target: req });
      });
      return req;
    },
  };
  return factory;
}
const seedIDB = (f, kv) => { /* 미리 채워진 IDB 세계 */
  const stores = {};
  const db = {
    name: 'mk-maker', stores,
    objectStoreNames: { contains: (s) => s in stores },
    createObjectStore(s) { stores[s] = new Map(); },
    transaction(s) {
      return { objectStore: () => ({
        put(v, k) { const r = { onsuccess: null, onerror: null }; queueMicrotask(() => { stores[s].set(String(k), v); r.onsuccess && r.onsuccess({}); }); return r; },
        delete(k) { const r = { onsuccess: null, onerror: null }; queueMicrotask(() => { stores[s].delete(String(k)); r.onsuccess && r.onsuccess({}); }); return r; },
        getAllKeys() { const r = { onsuccess: null, onerror: null }; queueMicrotask(() => { r.result = [...stores[s].keys()]; r.onsuccess && r.onsuccess({}); }); return r; },
        getAll() { const r = { onsuccess: null, onerror: null }; queueMicrotask(() => { r.result = [...stores[s].values()]; r.onsuccess && r.onsuccess({}); }); return r; },
      }) };
    },
  };
  db.createObjectStore('kv');
  Object.entries(kv).forEach(([k, v]) => db.stores.kv.set(k, v));
  f._dbs['mk-maker'] = db;
};

/* ---------- 실 localStorage 스텁 — length·key 지원 (이주 검증용) ---------- */
function realishLS(init = {}, opts = {}) {
  const m = new Map(Object.entries(init));
  return {
    _m: m,
    getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => {
      if (opts.quotaOver && String(v).length > opts.quotaOver) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      m.set(String(k), String(v));
    },
    removeItem: (k) => { m.delete(String(k)); },
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
}

/* ---------- 부팅 헬퍼 — 스크립트를 골라 실은 창 하나 ---------- */
const FILES = ['data/store.js', 'data/projects.js', 'data/live.js'];
function boot({ lsInit, lsOpts, withIDB, idbOpts, idbSeed, files } = {}) {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', url: 'https://x.test/#/home', pretendToBeVisual: true });
  const w = dom.window;
  Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
  const LS = realishLS(lsInit || {}, lsOpts || {});
  Object.defineProperty(w, 'localStorage', { value: LS });
  let F = null;
  if (withIDB !== false) {
    F = fakeIDB(idbOpts || {});
    if (idbSeed) seedIDB(F, idbSeed);
  }
  for (const f of (files || FILES)) w.eval(read(f));
  if (F && w.MK_STORE) w.MK_STORE.useIDB(F);
  return { w, LS, F };
}
const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async (n = 6) => { for (let i = 0; i < n; i++) await tick(); };
const initP = (w) => new Promise((r) => w.MK_STORE.init(r));

/* ============================================================ */
console.log('R116 — IndexedDB 이관');

/* ① 파사드 동기 의미 */
{
  const { w } = boot({});
  const S = w.MK_STORE;
  S.setItem('a', 'x'); T('① set→get 동기 왕복', S.getItem('a') === 'x');
  S.setItem('a', 42); T('① 값 문자열 강제', S.getItem('a') === '42');
  S.removeItem('a'); T('① remove 후 null', S.getItem('a') === null);
  T('① 미보유 키 null', S.getItem('없음') === null);
}

/* ② 첫 가동 이주 — IDB 빈 날 localStorage mklive:* 만 실어 온다 */
{
  const { w, LS, F } = boot({ lsInit: {
    'mklive:doc:d1': JSON.stringify({ savedAt: 1, doc: { id: 'd1', scenes: [] } }),
    'mklive:projects': '[]',
    '남의키': 'x',
  } });
  const ok = await initP(w);
  await settle();
  T('② init 성공', ok === true && w.MK_STORE.ready === true);
  T('② mklive:* 이주', w.MK_STORE.getItem('mklive:doc:d1') !== null && w.MK_STORE.getItem('mklive:projects') === '[]');
  T('② 남의 키 미이주', w.MK_STORE.getItem('남의키') === null);
  const kv = F._dbs['mk-maker'].stores.kv;
  T('② IDB 내구 도달', kv.get('mklive:doc:d1') === LS._m.get('mklive:doc:d1'));
  T('② 원본 localStorage 보존', LS._m.has('mklive:doc:d1'));
}

/* ③ IDB 보유 부팅 — IDB 가 정본 */
{
  const { w } = boot({
    lsInit: { 'mklive:doc:d1': '낡은값' },
    idbSeed: { 'mklive:doc:d1': '새값', 'mklive:projects': '[{"projectId":"p"}]' },
  });
  await initP(w); await settle();
  T('③ IDB 값이 이긴다', w.MK_STORE.getItem('mklive:doc:d1') === '새값');
  T('③ 이주 미발동(비어 있지 않음)', w.MK_STORE.getItem('남의키') === null && w.MK_STORE.keys().length === 2);
}

/* ④ IDB 부재 → ready false, live.js 는 종전 localStorage 세계 */
{
  const { w, LS } = boot({ withIDB: false, lsInit: {} });
  let cbOk = null; w.MK_STORE.init((ok) => { cbOk = ok; });
  await settle();
  T('④ IDB 부재 init false', cbOk === false && w.MK_STORE.ready === false);
  const r = w.MK_LIVE.saveDoc({ id: 'z', scenes: [] });
  T('④ saveDoc 이 localStorage 로 폴백', r === true && LS._m.has('mklive:doc:z'));
  T('④ loadDoc 왕복(옛 세계 무손)', w.MK_LIVE.loadDoc('z') && w.MK_LIVE.loadDoc('z').doc.id === 'z');
}

/* ⑤ 우선순위 — 주입 backend 가 MK_STORE(ready)보다 이긴다 */
{
  const { w } = boot({});
  await initP(w); await settle();
  T('⑤ 전제: MK_STORE ready', w.MK_STORE.ready === true);
  const mem = {}; const memB = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
  w.MK_LIVE.useBackend(memB);
  w.MK_LIVE.saveDoc({ id: 'inj', scenes: [] });
  T('⑤ 주입 backend 로 기록', 'mklive:doc:inj' in mem);
  T('⑤ MK_STORE 는 그 키를 모른다', w.MK_STORE.getItem('mklive:doc:inj') === null);
  w.MK_LIVE.useBackend(null);
  w.MK_LIVE.saveDoc({ id: 'own', scenes: [] });
  T('⑤ 주입 해제 후 MK_STORE 로 기록', w.MK_STORE.getItem('mklive:doc:own') !== null && !('mklive:doc:own' in mem));
}

/* ⑥ write-through 내구 — whenIdle 뒤 IDB 실보유 */
{
  const { w, F } = boot({});
  await initP(w); await settle();
  w.MK_STORE.setItem('mklive:doc:wt', 'V');
  await new Promise((r) => w.MK_STORE.whenIdle(r)); await settle();
  T('⑥ whenIdle 뒤 IDB 도달', F._dbs['mk-maker'].stores.kv.get('mklive:doc:wt') === 'V');
}

/* ⑦ 대용량 — 5MB 쿼터 localStorage 세계에서 6MB 저장이 이제 성공 */
{
  const big = 'x'.repeat(6 * 1024 * 1024);
  /* 옛 세계 재현: MK_STORE 미탑재 + 쿼터 localStorage → saveDoc false (준호가 겪던 조용한 소실) */
  const old = boot({ files: ['data/projects.js', 'data/live.js'], lsOpts: { quotaOver: 5 * 1024 * 1024 } });
  const oldR = old.w.MK_LIVE.saveDoc({ id: 'big', scenes: [], blob: big });
  T('⑦ 옛 세계: 6MB saveDoc false (쿼터 소실 재현)', oldR === false);
  /* 새 세계: 같은 쿼터 localStorage 라도 MK_STORE 가 받는다 */
  const nw = boot({ lsOpts: { quotaOver: 5 * 1024 * 1024 } });
  await initP(nw.w); await settle();
  const r = nw.w.MK_LIVE.saveDoc({ id: 'big', scenes: [], blob: big });
  await new Promise((res) => nw.w.MK_STORE.whenIdle(res)); await settle();
  T('⑦ 새 세계: 6MB saveDoc true', r === true);
  T('⑦ IDB 실보유(6MB)', (nw.F._dbs['mk-maker'].stores.kv.get('mklive:doc:big') || '').length > 6 * 1024 * 1024);
  T('⑦ degraded 아님(폴백 미발동)', nw.w.MK_STORE.degraded === false);
}

/* ⑧ 부팅 복원 — init 뒤 restoreProjects + home 재렌더 */
{
  const projRaw = JSON.stringify([{ projectId: 'p1', name: '살아난 작품', doc: { id: 'd', scenes: [] }, updatedAt: 1, createdAt: 1 }]);
  const { w } = boot({ idbSeed: { 'mklive:projects': projRaw } });
  let renders = 0;
  w.PG = { state: { screen: 'home' }, render: () => { renders++; } };
  /* live.js 말미 부팅 블록을 재현 실행 — 실파일의 그 블록이 이 순서로 도는지는 ⑧b 가 정적 고정 */
  w.eval(`MK_STORE.init(() => { const had = MK_LIVE.restoreProjects(); if (had && PG && PG.render && /^(home|projects)$/.test(PG.state.screen||'')) PG.render(); });`);
  await settle(10);
  /* 복원 미발동 세계(원본)에선 get→ensure→seed 가 MK_TPL 부재로 던진다 — 잣대는 죽지 않고 실패한다 */
  let p1 = null; try { p1 = w.MK_PROJ.get('p1'); } catch (_) {}
  T('⑧ 복원 실림', p1 && p1.name === '살아난 작품');
  T('⑧ home 재렌더 1회', renders === 1);
  const src = read('data/live.js');
  T('⑧b 실파일 부팅 블록이 init→restore→재렌더 순서를 갖는다',
    /MK_STORE\.init\(/.test(src) && /restoreProjects\(\)/.test(src) && /P\.render\(\)/.test(src) && src.indexOf('MK_STORE.init') < src.indexOf('P.render()'));
  /* 편집 중(workspace)이면 재렌더로 방해하지 않는다 */
  const w2 = boot({ idbSeed: { 'mklive:projects': projRaw } }).w;
  let r2 = 0; w2.PG = { state: { screen: 'workspace' }, render: () => { r2++; } };
  w2.eval(`MK_STORE.init(() => { const had = MK_LIVE.restoreProjects(); if (had && PG && PG.render && /^(home|projects)$/.test(PG.state.screen||'')) PG.render(); });`);
  await settle(10);
  T('⑧ 작업 화면은 재렌더 안 함', r2 === 0);
}

/* ⑨ IDB 쓰기 실패 — localStorage 폴백 + degraded 정직 */
{
  const { w, LS } = boot({ idbOpts: { failPut: true } });
  await initP(w); await settle();
  w.MK_STORE.setItem('mklive:doc:f', 'FB');
  await new Promise((r) => w.MK_STORE.whenIdle(r)); await settle();
  T('⑨ degraded 표시', w.MK_STORE.degraded === true);
  T('⑨ localStorage 폴백 기록', LS._m.get('mklive:doc:f') === 'FB');
  T('⑨ 메모리 진실 유지', w.MK_STORE.getItem('mklive:doc:f') === 'FB');
}

/* ⑩ removeItem 전파 — IDB·localStorage 사본 동시 소거 */
{
  const { w, LS, F } = boot({ lsInit: { 'mklive:doc:rm': '사본' }, idbSeed: { 'mklive:doc:rm': '정본' } });
  await initP(w); await settle();
  w.MK_STORE.removeItem('mklive:doc:rm');
  await new Promise((r) => w.MK_STORE.whenIdle(r)); await settle();
  T('⑩ 메모리 소거', w.MK_STORE.getItem('mklive:doc:rm') === null);
  T('⑩ IDB 소거', !F._dbs['mk-maker'].stores.kv.has('mklive:doc:rm'));
  T('⑩ localStorage 사본 소거(부활 차단)', !LS._m.has('mklive:doc:rm'));
}

/* ⑪ audit */
{
  const { w } = boot({});
  const a = w.MK_STORE.audit();
  T('⑪ audit 통과', a.ok === true, (a.violations || []).join(','));
}

/* ⑫ 리뷰 모드 저장 차단 규약 무손 */
{
  const { w } = boot({});
  await initP(w); await settle();
  const r = w.MK_LIVE.autosave({ id: 'rv', scenes: [] }, { review: true });
  T('⑫ review 게이트 유지', r.ok === false && r.why === 'review');
}

console.log(`\n════ R116: ${pass}/${pass + fail} 통과 ════`);
process.exit(fail === 0 ? 0 : 1);
