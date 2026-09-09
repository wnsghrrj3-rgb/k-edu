// 케이무비 — 같은 컴퓨터 다른 계정 검증 (2026-09-09). 준호 보고: "같은 컴퓨터 다른 아이디로 들어갔는데 다른 아이디에서 작업한 게 뜬다."
// 원인: 이 기기 IndexedDB 가 계정과 무관하게 하나 → 시작 작업(kv current)·「내 작업」 로컬 목록이 계정을 안 가렸다.
// 정답지: ① u1 작업 → u2 로 들어오면 새 작업으로 시작하고 목록·get 에 u1 것이 없다 ② 다시 u1 이면 그대로 돌아온다(u2 편집이 섞이지 않음)
//        ③ 주인 없는 옛 레코드 + 옛 kv current 는 로그인한 첫 계정이 가져간다(claimLegacy) — 다른 계정엔 안 보인다 ④ 로그인 없는 자리(anon)는 계정 것을 못 본다
//        ⑤ 다른 탭에서 계정이 바뀌면(onAuthStateChange) 저장 뒤 새로고침 ⑥ 콘솔 오류 0
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-owner.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8776);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
let ANON = false;
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  if (u.includes('supabase') && !ANON) return route.fulfill({ path: path.join(HERE, 'fake-supabase.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'application/javascript' });
});
let DBROWS = [], UID = 'u1';
const prep = async () => { await page.addInitScript(({ rows, uid }) => { window.__seedRows = rows; window.__uid = uid; }, { rows: DBROWS, uid: UID }); };
await prep();
const dump = async () => { if (ANON) return; DBROWS = await page.evaluate(() => window.__fakeDb ? [...window.__fakeDb.rows.values()] : null).catch(() => null) || DBROWS; };
const goto = async (uid) => { await dump(); UID = uid; await prep(); await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && KMV_UI.proj && KMV_UI.proj.id); for (let i = 0; i < 100; i++) { if (await page.evaluate(() => KMV_STORE.local.get(KMV_UI.proj.id).then(r => !!r, () => false))) break; await page.waitForTimeout(50); } };
const st = () => page.evaluate(async () => ({ id: KMV_UI.proj.id, name: KMV_UI.proj.name, owner: await KMV_STORE.owner(), S: KMV_PROJECT.data.S.map(s => s.text), list: (await KMV_STORE.list()).map(r => ({ id: r.id, name: r.name, where: r.where })), cur: await KMV_STORE.local.current() }));

/* ---------- 1. u1 이 작업하고 저장 ---------- */
await goto('u1'); await page.waitForTimeout(600);
await page.evaluate(async () => { KMV_UI.proj.name = '준호 본계정 작업'; await KMV_STORE.rename(KMV_UI.proj.id, '준호 본계정 작업'); KMV_PROJECT.addS({ text: '본계정 자막', at: 0, dur: 30, style: 'gold' }); await KMV_UI.saveNow(); });
await page.waitForTimeout(600);
const a = await st();
ok(a.owner === 'u1' && a.cur === a.id, 'u1 로 시작 — 주인 u1, current = 지금 작업');
const idA = a.id;

/* ---------- 2. 같은 브라우저, 다른 계정 u2 ---------- */
await goto('u2'); await page.waitForTimeout(800);
const b = await st();
const getA = await page.evaluate(id => KMV_STORE.local.get(id), idA);
ok(b.owner === 'u2' && b.id !== idA && b.name === '새 작업' && b.S.length === 0, 'u2 로 들어오면 u1 작업이 아니라 「새 작업」으로 시작');
ok(!b.list.some(r => r.id === idA) && b.list.length === 1, '「내 작업」 목록에도 u1 것은 없다 (자기 것 1개)');
ok(getA === null, 'local.get 으로도 u1 레코드는 안 나온다');
await page.evaluate(async () => { KMV_PROJECT.addS({ text: 'u2 자막', at: 0, dur: 30, style: 'gold' }); await KMV_UI.saveNow(); });
await page.waitForTimeout(600);
const idB = b.id;

/* ---------- 3. 다시 u1 ---------- */
await goto('u1'); await page.waitForTimeout(800);
const c = await st();
ok(c.id === idA && c.name === '준호 본계정 작업' && c.S.includes('본계정 자막') && !c.S.includes('u2 자막'), '다시 u1 이면 본계정 작업이 그대로 (u2 편집 안 섞임)');
ok(!c.list.some(r => r.id === idB), 'u1 목록엔 u2 작업 없음');

/* ---------- 4. 주인 없는 옛 레코드 + 옛 kv current → 로그인한 첫 계정(u3)이 가져감 ---------- */
await page.evaluate(async () => {
  const doc = KMV_PROJECT.toJSON(); doc.S = [{ id: 'sL', text: '옛 레코드', at: 0, dur: 30, style: 'basic' }]; doc.media = []; doc.V = [];
  const rec = { id: 'legacy-1', name: '주인 없는 작업', doc, updatedAt: Date.now() - 1000, durSec: 0, clips: 0 };
  await new Promise((res, rej) => { const r = indexedDB.open('kmovie', 2); r.onsuccess = () => { const d = r.result; const t = d.transaction(['projects', 'kv'], 'readwrite'); t.objectStore('projects').put(rec); t.objectStore('kv').put('legacy-1', 'current'); t.oncomplete = () => { d.close(); res(); }; t.onerror = () => rej(t.error); }; r.onerror = () => rej(r.error); });
});
await goto('u3'); await page.waitForTimeout(800);
const d = await st();
ok(d.owner === 'u3' && d.id === 'legacy-1' && d.S[0] === '옛 레코드', '주인 없는 옛 레코드는 로그인한 첫 계정(u3)이 가져가 그 작업으로 시작');
const oldCur = await page.evaluate(() => new Promise(res => { const r = indexedDB.open('kmovie', 2); r.onsuccess = () => { const q = r.result.transaction('kv').objectStore('kv').get('current'); q.onsuccess = () => { r.result.close(); res(q.result); }; }; }));
ok(!oldCur, "옛 kv 'current' 는 비움");
await goto('u1'); await page.waitForTimeout(800);
const e = await st();
ok(e.id === idA && !e.list.some(r => r.id === 'legacy-1'), 'u1 에겐 그 옛 레코드가 안 보인다');

/* ---------- 5. 로그인 없는 자리(anon) ---------- */
ANON = true; await goto('anon'); await page.waitForTimeout(800);
const f = await st();
ok(f.owner === 'anon' && f.id !== idA && f.id !== idB && f.id !== 'legacy-1' && f.list.length === 1, '로그인 없는 자리는 어느 계정 작업도 못 보고 「새 작업」');
ANON = false;

/* ---------- 6. 다른 탭에서 계정이 바뀜(onAuthStateChange) → 이 기기에 저장 뒤 새로고침 ---------- */
await goto('u1'); await page.waitForTimeout(800);
const chg = await page.evaluate(async () => {
  window.__reloaded = false; window.__kmvReload = () => { window.__reloaded = true; };
  KMV_PROJECT.addS({ text: '바뀌기 직전', at: 0, dur: 20, style: 'gold' });
  if (!window.__fakeDb.authCb) return { hooked: false };
  window.__fakeDb.authCb('SIGNED_IN', { user: { id: 'u9' }, access_token: 'tok' });
  await new Promise(r => setTimeout(r, 400));
  const r = await new Promise(res => { const q = indexedDB.open('kmovie', 2); q.onsuccess = () => { const g = q.result.transaction('projects').objectStore('projects').get(KMV_UI.proj.id); g.onsuccess = () => { q.result.close(); res(g.result); }; }; });
  return { hooked: true, reloaded: window.__reloaded, savedS: r && r.doc.S.map(x => x.text), owner: r && r.owner };
});
ok(chg.hooked && chg.reloaded, '다른 탭에서 계정이 바뀌면 새로고침');
ok(chg.savedS && chg.savedS.includes('바뀌기 직전') && chg.owner === 'u1', '새로고침 전에 하던 편집은 u1 것으로 이 기기에 저장');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
