// 케이무비 — 계정 동기화 안전 검증 (2026-09-03). 가짜 supabase-js(fake-supabase.js)로 로그인이 있는 환경을 흉내낸다.
// 정답지: ① 새 작업이 계정에 올라감 ② Ctrl+S = 즉시 계정 저장 + 상태 점 ③ 다른 기기가 먼저 저장 → 덮어쓰지 않고 conflict(점 빨강·버튼)
//        ④ 「다른 기기 것 열기」·「사본으로 저장」 ⑤ 시작 때 옛 로컬 사본이 계정을 덮지 않음(더 새 쪽을 연다) / 로컬이 더 새면 올림
//        ⑥ 같은 브라우저 다른 탭(navigator.locks) → 자동 저장 쉼 ⑦ 탭 닫힘 keepalive PATCH(낙관적 잠금 조건 포함)
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-sync.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8773);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  if (u.includes('supabase')) return route.fulfill({ path: path.join(HERE, 'fake-supabase.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'application/javascript' });
});
// 가짜 표는 페이지 새로고침에도 남아야 "다른 기기" 흉내가 된다 → 창 밖(테스트 프로세스)에 보관하고 addInitScript 로 되살린다
let DBROWS = [];
await page.addInitScript(rows => { window.__seedRows = rows; }, DBROWS);
const seed = async () => { await page.evaluate(() => { for (const r of (window.__seedRows || [])) window.__fakeDb.rows.set(r.id, r); }); };
const dump = async () => { DBROWS = await page.evaluate(() => [...window.__fakeDb.rows.values()]); await page.addInitScript(rows => { window.__seedRows = rows; }, DBROWS); };
const goto = async () => { await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && KMV_UI.proj && KMV_UI.proj.id); };
const st = () => page.evaluate(() => ({ id: KMV_UI.proj.id, name: KMV_UI.proj.name, cloudAt: KMV_UI.proj.cloudAt, dirty: KMV_UI.proj.dirty, conflict: !!KMV_UI.proj.conflict, otherTab: KMV_UI.proj.otherTab, state: KMV_UI.saveState(), dot: document.getElementById('saveDot').dataset.st, note: document.getElementById('saveNote').textContent, btn: !document.getElementById('saveConflict').hidden, rows: [...window.__fakeDb.rows.values()].map(r => ({ id: r.id, name: r.name, S: (r.doc.S || []).length, at: r.updated_at })) }));

/* ---------- 1. 로그인 환경 — 새 작업은 「저장」을 누르기 전엔 계정에 안 올라감 ---------- */
await goto();
await page.waitForTimeout(1500);
let s = await st();
ok(s.rows.length === 0 && s.cloudAt === 0, '처음 열어도 계정엔 아무것도 안 씀 (저장을 누른 것만 계정에)');
ok(s.dot === 'dirty' && /「저장」/.test(s.note), '상태 점 노랑 · 안내 문구 「저장(Ctrl+S)을 눌렀을 때만」');
const hasBtn = await page.evaluate(() => { const b = document.getElementById('btnSave'); return !!b && b.offsetParent !== null && b.textContent.trim() === '저장'; });
ok(hasBtn, '헤더에 「저장」 버튼');

/* ---------- 2. 편집 → dirty(노랑) → Ctrl+S → 즉시 계정 저장(초록) ---------- */
await page.evaluate(() => { KMV_PROJECT.addS({ text: '금성초', at: 10, dur: 60, style: 'gold' }); });
await page.waitForTimeout(600);
s = await st();
ok(s.dirty && s.dot === 'dirty' && s.rows.length === 0, '편집 직후 — 이 기기엔 저장, 계정엔 아직(점 노랑, 계정 행 0)');
await page.waitForTimeout(11000);
s = await st();
ok(s.rows.length === 0, '11초 기다려도 계정엔 안 올라감 (자동 계정 저장 없음)');
await page.click('#btnSave');
await page.waitForFunction(() => !KMV_UI.proj.dirty && !KMV_UI.proj.saving, null, { timeout: 8000 });
s = await st();
ok(!s.dirty && s.dot === 'ok' && s.rows.length === 1 && s.rows[0].S === 1, '「저장」 버튼 → 계정에 한 줄(자막 1) · 점 초록');
await page.evaluate(() => { KMV_PROJECT.addS({ text: '둘째', at: 200, dur: 30, style: 'gold' }); }); await page.waitForTimeout(600);
await page.evaluate(() => { KMV_PROJECT.removeS(KMV_PROJECT.data.S[1].id); }); await page.waitForTimeout(600);
await page.keyboard.press('Control+s');
await page.waitForFunction(() => !KMV_UI.proj.dirty && !KMV_UI.proj.saving, null, { timeout: 8000 });
s = await st();
ok(!s.dirty && s.dot === 'ok' && s.rows[0].S === 1, 'Ctrl+S → 계정에 바로 저장(자막 1) · 점 초록');
const at1 = s.cloudAt;
ok(s.rows[0].at === new Date(at1).toISOString(), '계정 updated_at = 내가 본 시각(cloudAt) — 낙관적 잠금 기준이 맞음');

/* ---------- 3. 다른 기기가 먼저 저장 → 덮어쓰지 않고 conflict ---------- */
await page.evaluate(() => { const r = window.__fakeDb.rows.get(KMV_UI.proj.id); r.name = '폰에서 고침'; r.doc = Object.assign({}, r.doc, { S: [{ id: 'sP', text: '폰 자막', at: 0, dur: 30, style: 'basic' }] }); r.updated_at = new Date(Date.now() + 5000).toISOString(); });
await page.evaluate(() => { KMV_PROJECT.addS({ text: 'PC 자막', at: 100, dur: 60, style: 'gold' }); });
await page.waitForTimeout(500);
await page.keyboard.press('Control+s');
await page.waitForFunction(() => !!KMV_UI.proj.conflict, null, { timeout: 8000 });
s = await st();
ok(s.conflict && s.dot === 'conflict' && s.btn, '다른 기기가 먼저 저장 → conflict (점 빨강·버튼 2개 노출)');
ok(s.rows[0].name === '폰에서 고침' && s.rows[0].S === 1, '계정 행은 덮어쓰지 않음 (폰 것 그대로)');
ok(/다른 기기에서/.test(s.note), '안내 문구에 다른 기기 저장 시각');
// conflict 중엔 자동 저장이 계정으로 안 감
await page.evaluate(() => { KMV_PROJECT.addS({ text: '또', at: 200, dur: 30, style: 'gold' }); });
await page.waitForTimeout(600); await page.evaluate(() => KMV_UI.saveCloud());
s = await st();
ok(s.rows[0].S === 1 && s.conflict, 'conflict 상태에선 saveCloud 가 계정을 건드리지 않음');
const localS = await page.evaluate(async () => (await KMV_STORE.local.get(KMV_UI.proj.id)).doc.S.length);
ok(localS === 3, '이 브라우저 사본엔 편집(자막 3)이 남아 있음');

/* ---------- 4. 「다른 기기 것 열기」 / 「사본으로 저장」 ---------- */
const before = s.id;
await page.evaluate(() => { const r = window.__fakeDb.rows.get(KMV_UI.proj.id); r.doc = Object.assign({}, r.doc, { media: [], V: [] }); });   // 원본 없이 여는 걸 단순화
await page.click('#btnOpenRemote');
await page.waitForFunction(() => !KMV_UI.proj.conflict, null, { timeout: 8000 });
await page.waitForTimeout(300);
s = await st();
const S4 = await page.evaluate(() => KMV_PROJECT.data.S.map(x => x.text));
ok(s.id === before && s.name === '폰에서 고침' && S4.length === 1 && S4[0] === '폰 자막' && s.dot === 'ok', '「다른 기기 것 열기」 → 계정 사본으로 바뀜(이름·자막) · 점 초록' + JSON.stringify({ name: s.name, S4, dot: s.dot, state: s.state }));
ok(s.cloudAt === Date.parse(s.rows[0].at), '연 뒤 cloudAt = 계정 시각 (다음 저장이 통과하도록)');
await page.evaluate(() => { KMV_PROJECT.addS({ text: '합류', at: 300, dur: 30, style: 'gold' }); });
await page.keyboard.press('Control+s');
await page.waitForFunction(() => !KMV_UI.proj.dirty && !KMV_UI.proj.saving, null, { timeout: 8000 });
s = await st();
ok(!s.conflict && s.rows[0].S === 2, '그 뒤 편집·Ctrl+S 는 정상 통과(계정 자막 2)');
// 다시 충돌 → 사본으로 저장
await page.evaluate(() => { const r = window.__fakeDb.rows.get(KMV_UI.proj.id); r.updated_at = new Date(Date.now() + 9000).toISOString(); });
await page.evaluate(() => { KMV_PROJECT.addS({ text: '충돌2', at: 400, dur: 30, style: 'gold' }); });
await page.keyboard.press('Control+s');
await page.waitForFunction(() => !!KMV_UI.proj.conflict, null, { timeout: 8000 });
await page.click('#btnConflictCopy');
await page.waitForFunction(id => KMV_UI.proj.id !== id && !KMV_UI.proj.conflict, before, { timeout: 8000 });
await page.waitForTimeout(300);
s = await st();
ok(s.id !== before && /사본/.test(s.name) && s.rows.length === 2 && s.rows.some(r => r.id === s.id && r.S === 3), '「사본으로 저장」 → 새 id 로 계정에 새 줄(자막 3) · 원래 줄은 그대로');
ok(!s.btn && s.dot === 'ok', '충돌 버튼 사라지고 점 초록');

/* ---------- 5. 시작 = 이 기기 사본만 — 계정 사본은 자동으로 열지도, 올리지도 않음 ---------- */
const curId = s.id;
// (a) 계정이 더 새(다른 기기가 저장) : 새로고침해도 이 기기 것을 열고, 계정엔 쓰기 0, 안내만
const localName = s.name; const localS5 = await page.evaluate(() => KMV_PROJECT.data.S.length);
await page.evaluate(() => { const r = window.__fakeDb.rows.get(KMV_UI.proj.id); r.name = '계정이 더 새'; r.updated_at = new Date(Date.now() + 20000).toISOString(); r.doc = Object.assign({}, r.doc, { S: [] }); window.__fakeDb.log.length = 0; });
await dump();
await goto(); await seed();
await page.waitForTimeout(1500);
s = await st();
const S5a = await page.evaluate(() => KMV_PROJECT.data.S.length);
ok(s.id === curId && s.name === localName && S5a === localS5 && !s.conflict, '(a) 계정이 더 새여도 시작은 이 기기 사본(이름·자막 ' + localS5 + ' 그대로)');
const logA = await page.evaluate(() => window.__fakeDb.log.filter(l => /^(update|insert|upsert)/.test(l)));
ok(logA.length === 0 && s.rows.find(r => r.id === curId).name === '계정이 더 새', '(a) 계정엔 쓰기 0회 (다른 기기 것 그대로)');
const toastA = await page.evaluate(() => document.body.innerText);
ok(/다른 기기에서/.test(toastA) && /내 작업/.test(toastA), '(a) "다른 기기에서 더 나중에 저장 — 내 작업에서 불러와요" 안내');
// (b) 로컬이 더 새 : 새로고침해도 계정엔 안 올림(저장을 눌러야) — 점 노랑
await page.evaluate(() => { KMV_PROJECT.addS({ text: '로컬이 새', at: 500, dur: 30, style: 'gold' }); });
await page.waitForTimeout(600);
await page.evaluate(() => { const r = window.__fakeDb.rows.get(KMV_UI.proj.id); r.name = '계정은 옛것'; r.updated_at = new Date(Date.now() - 60000).toISOString(); r.doc = Object.assign({}, r.doc, { S: [] }); window.__fakeDb.log.length = 0; });
await dump();
await goto(); await seed();
await page.waitForTimeout(1500);
s = await st();
const logB = await page.evaluate(() => window.__fakeDb.log.filter(l => /^(update|insert|upsert)/.test(l)));
ok(s.id === curId && logB.length === 0 && s.rows.find(r => r.id === curId).name === '계정은 옛것', '(b) 로컬이 더 새여도 자동으로 안 올림 (쓰기 0회)');
// (c) 「내 작업」에서 계정 것을 불러오면 그때 계정 사본을 연다
await page.evaluate(async id => { const r = await KMV_STORE.cloud.get(id); await KMV_UI.openRecord(Object.assign(r, { where: 'cloud', cloudAt: r.updatedAt })); }, curId);
await page.waitForTimeout(300);
s = await st();
const S5c = await page.evaluate(() => KMV_PROJECT.data.S.length);
ok(s.name === '계정은 옛것' && S5c === 0, '(c) 「내 작업」 불러오기는 계정 사본을 연다 (계정 이름·자막 0)');
await page.keyboard.press('Control+s');
await page.waitForFunction(() => !KMV_UI.proj.dirty && !KMV_UI.proj.saving, null, { timeout: 8000 });

/* ---------- 6. 같은 브라우저 다른 탭 — 자동 저장 쉼 ---------- */
await page.evaluate(async id => { await KMV_UI.newProject('딴 작업'); window.__hold = navigator.locks.request('kmv-proj-' + id, () => new Promise(r => { window.__release = r; })); await new Promise(r => setTimeout(r, 80)); const r = await KMV_STORE.get(id); await KMV_UI.openRecord(r); }, curId);
await page.waitForTimeout(200);
s = await st();
ok(s.otherTab && s.dot === 'off' && /다른 탭/.test(s.note), '다른 탭이 먼저 잡고 있으면 이 탭은 otherTab (점 회색 · 안내)');
await page.evaluate(() => { window.__fakeDb.log.length = 0; KMV_PROJECT.addS({ text: '둘째 탭', at: 600, dur: 30, style: 'gold' }); });
await page.waitForTimeout(700);
const s6 = await page.evaluate(async () => ({ local: (await KMV_STORE.local.get(KMV_UI.proj.id)).doc.S.length, writes: window.__fakeDb.log.filter(l => /^(update|insert|upsert)/.test(l)).length }));
ok(s6.writes === 0, '둘째 탭의 편집은 계정에 안 감');
await page.keyboard.press('Control+s'); await page.waitForTimeout(300);
const s6b = await page.evaluate(() => window.__fakeDb.log.filter(l => /^(update|insert|upsert)/.test(l)).length);
ok(s6b === 0, 'Ctrl+S 도 둘째 탭에선 저장하지 않고 안내만');
await page.evaluate(() => { window.__release(); });
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await page.waitForFunction(() => !KMV_UI.proj.otherTab, null, { timeout: 8000 });
s = await st();
ok(!s.otherTab && s.dot !== 'off', '첫 탭이 놓으면(다시 보일 때) 이 탭이 이어받음');

/* ---------- 7. 탭 닫힘·숨김 — 이 기기에만, 계정엔 안 올림 ---------- */
const kp = await page.evaluate(async () => {
  const calls = []; const orig = window.fetch; window.fetch = (u, o) => { calls.push({ u: String(u), o }); return Promise.resolve({ ok: true }); };
  window.__fakeDb.log.length = 0;
  KMV_PROJECT.addS({ text: '닫기 직전', at: 700, dur: 30, style: 'gold' });
  window.dispatchEvent(new Event('pagehide'));
  await new Promise(r => setTimeout(r, 300)); window.fetch = orig;
  const loc = await KMV_STORE.local.get(KMV_UI.proj.id);
  return { fetches: calls.length, writes: window.__fakeDb.log.filter(l => /^(update|insert|upsert)/.test(l)).length, localHas: !!(loc && loc.doc.S.some(x => x.text === '닫기 직전')) };
});
ok(kp.fetches === 0 && kp.writes === 0, '닫힐 때 계정엔 아무것도 안 보냄 (keepalive 없음)');
ok(kp.localHas, '닫힐 때 마지막 편집은 이 기기에 저장됨');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
