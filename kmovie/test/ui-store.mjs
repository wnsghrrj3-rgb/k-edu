// 케이무비 — 작업 파일(KMV_STORE) 검증. 준호 결정(2026-08-31): 서버 기본 + .kmv 파일, 다른 기기에서 원본 없으면 그 클립은 빼고 나머지만.
// 정답지: ① 작업이 이름 붙은 레코드로 여러 개 ② 새 작업/열기/이름/삭제 ③ 새로고침 후 현재 작업 복원 + 옛 단일 저장 이관
//        ④ 다른 기기 흉내(원본 없는 미디어) → 클립만 빠지고 자막·생성 음악은 살고 degraded 로 계정 저장 멈춤 → 사본으로 저장
//        ⑤ .kmv 파일 왕복 ⑥ 로그인 없는 환경에서 클라우드는 조용히 꺼짐(오류 0)
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-store.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8772);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'application/javascript' });    // supabase-js 는 빈 스크립트 → 클라우드 꺼짐
});
const goto = async () => { await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && KMV_UI.proj && KMV_UI.proj.id); };
await goto();
const importVideo = async file => { await page.setInputFiles('#fileIn', [path.join(FX, file)]); await page.waitForFunction(f => KMV_PROJECT.data.media.some(m => m.name === f) && KMV_MEDIA.get(KMV_PROJECT.data.media.find(m => m.name === f).id), file, { timeout: 60000 }); };

/* ---------- 1. 시작 상태 ---------- */
const s0 = await page.evaluate(async () => ({ id: KMV_UI.proj.id, name: KMV_UI.proj.name, title: document.getElementById('projName').textContent, btn: document.getElementById('btnNew').textContent, cloud: await KMV_STORE.cloud.ready(), list: (await KMV_STORE.list()).length }));
ok(!!s0.id && s0.name === '새 작업' && s0.title === '새 작업', '처음 열면 「새 작업」 이 현재 작업');
ok(/내 작업/.test(s0.btn), '헤더 「새로」 → 「📁 내 작업」');
ok(s0.cloud === false && s0.list === 1, '로그인 없는 환경 — 클라우드는 조용히 꺼지고 목록은 로컬 1개');

/* ---------- 2. 편집 → 자동 저장(레코드) ---------- */
await importVideo('a.mp4');
await page.evaluate(() => { KMV_PROJECT.addS({ text: '금성초', at: 10, dur: 60, style: 'gold' }); });
await page.waitForTimeout(900);
const s1 = await page.evaluate(async () => { const r = await KMV_STORE.local.get(KMV_UI.proj.id); return { V: r.doc.V.length, S: r.doc.S.length, clips: r.clips, dur: r.durSec, cur: await KMV_STORE.local.current() }; });
ok(s1.V === 1 && s1.S === 1 && s1.clips === 1 && s1.dur > 0, `편집이 레코드로 저장 (클립 ${s1.clips} · ${s1.dur.toFixed(1)}초 · 자막 1)`);
ok(s1.cur === s0.id, "kv 'current' = 지금 작업 id");

/* ---------- 3. 이름·새 작업·목록·열기 ---------- */
await page.evaluate(async () => { KMV_UI.proj.name = '학교 소개'; await KMV_STORE.rename(KMV_UI.proj.id, '학교 소개'); });
const firstId = s0.id;
await page.evaluate(() => KMV_UI.newProject('운동회'));
await page.waitForTimeout(700);
const s2 = await page.evaluate(async () => { const L = await KMV_STORE.list(); return { n: L.length, names: L.map(x => x.name), curName: KMV_UI.proj.name, V: KMV_PROJECT.data.V.length, media: KMV_PROJECT.data.media.length, srcAlive: KMV_MEDIA.has(KMV_PROJECT.data.media[0] && KMV_PROJECT.data.media[0].id) }; });
ok(s2.n === 2 && s2.names.includes('학교 소개') && s2.names.includes('운동회'), '작업 2개 — 「학교 소개」·「운동회」');
ok(s2.curName === '운동회' && s2.V === 0 && s2.media === 0, '새 작업은 빈 타임라인 (이전 작업의 미디어는 내려감)');
ok(s2.names[0] === '운동회', '목록은 최근 수정 순');

const s3 = await page.evaluate(async id => { const r = await KMV_STORE.get(id); await KMV_UI.openRecord(r); return { name: KMV_UI.proj.name, V: KMV_PROJECT.data.V.length, S: KMV_PROJECT.data.S.length, src: !!KMV_MEDIA.get(KMV_PROJECT.data.media[0].id), degraded: KMV_UI.proj.degraded }; }, firstId);
ok(s3.name === '학교 소개' && s3.V === 1 && s3.S === 1 && s3.src && !s3.degraded, '「학교 소개」 다시 열기 — 클립·자막·원본 전부 (같은 기기라 원본 있음)');

/* ---------- 4. 모달 UI ---------- */
await page.click('#btnNew');
await page.waitForFunction(() => document.querySelectorAll('#projModal .prow').length >= 2);
const s4 = await page.evaluate(() => ({ rows: document.querySelectorAll('#projModal .prow').length, cur: document.querySelector('#projModal .prow.cur b').textContent, where: document.querySelector('#projModal .prow small').textContent, note: document.getElementById('projCloudNote').textContent }));
ok(s4.rows === 2 && /학교 소개/.test(s4.cur) && /지금 작업/.test(s4.cur), '모달에 작업 2줄, 지금 작업 표시');
ok(/이 기기/.test(s4.where) && /로그인하면/.test(s4.note), '저장 위치 「💾 이 기기」 · 로그인 안내');
await page.click('#btnProjClose');

/* ---------- 5. 새로고침 → 현재 작업 복원 ---------- */
await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_UI.proj && KMV_UI.proj.id && KMV_PROJECT.data.media.length, null, { timeout: 60000 });
await page.waitForTimeout(800);
const s5 = await page.evaluate(() => ({ id: KMV_UI.proj.id, name: KMV_UI.proj.name, V: KMV_PROJECT.data.V.length, title: document.getElementById('projName').textContent }));
ok(s5.id === firstId && s5.name === '학교 소개' && s5.V === 1 && s5.title === '학교 소개', '새로고침 후 현재 작업(「학교 소개」) 그대로');

/* ---------- 6. 다른 기기 흉내 — 원본 없는 미디어 ---------- */
const s6 = await page.evaluate(async () => {
  const doc = KMV_PROJECT.toJSON(), keepDur = doc.V[0].dur;
  // 폰에서 받은 PC 작업: 미디어 id 가 이 기기 IndexedDB 에 없음 + 생성 음악 + 자막
  doc.media = [{ id: 'pcOnly1', name: 'C0287.MP4', kind: 'video', dur: 300, w: 3840, h: 2160, fps: 24, audio: true, rot: 0 }, ...doc.media];
  doc.V = [{ id: 'cx', media: 'pcOnly1', in: 0, out: 120, at: 0, dur: 120, speed: 'normal' }, ...doc.V.map(c => Object.assign({}, c, { at: c.at + 120 }))];
  const { meta } = KMV_GEN.mediaMeta({ mood: 'ending', bpm: 64, key: 'A', seed: 2, durSec: 20 }, 'genB');
  doc.media.push(meta); doc.A2 = [{ id: 'a9', media: 'genB', in: 0, out: 300, at: 0, vol: 1, fadeIn: 30, fadeOut: 60 }];
  const r = KMV_STORE.make(doc, 'PC에서 만든 것');
  const missing = await KMV_UI.openRecord(r);
  const D = KMV_PROJECT.data;
  return { missing, V: D.V.length, S: D.S.length, A2: D.A2.length, media: D.media.map(m => m.name), degraded: KMV_UI.proj.degraded, note: document.getElementById('saveNote').textContent, tot: KMV_PROJECT.total(), keepDur, at0: D.V[0].at };
});
ok(s6.missing.length === 1 && s6.missing[0] === 'C0287.MP4', '이 기기에 없는 원본 1개(C0287.MP4)를 찾아냄');
ok(s6.V === 1 && !s6.media.includes('C0287.MP4') && s6.tot === s6.keepDur && s6.at0 === 0, '그 클립만 빠지고 나머지 클립은 남음 (빈틈 없이 당겨짐)');
ok(s6.S === 1 && s6.A2 === 1 && s6.media.some(x => /배경음악/.test(x)), '자막·생성 배경음악은 파일 없이 그대로');
ok(s6.degraded && /계정에는 저장하지 않아요/.test(s6.note), 'degraded — 계정 저장 멈춤 안내');
const s6b = await page.evaluate(async () => { await KMV_UI.saveCloud(); return { at: KMV_UI.proj.cloudAt, saving: KMV_UI.proj.saving }; });
ok(!s6b.at && !s6b.saving, 'degraded 상태에선 saveCloud 가 아무것도 안 함');
await page.click('#btnNew'); await page.waitForFunction(() => document.querySelectorAll('#projModal .prow').length >= 1);
const before = await page.evaluate(() => KMV_UI.proj.id);
await page.click('#btnProjCopy'); await page.waitForTimeout(300);
const s6c = await page.evaluate(async () => ({ id: KMV_UI.proj.id, name: KMV_UI.proj.name, degraded: KMV_UI.proj.degraded, n: (await KMV_STORE.list()).length }));
ok(s6c.id !== before && /사본/.test(s6c.name) && !s6c.degraded && s6c.n >= 4, '「사본으로 저장」 → 새 id·새 이름·degraded 해제');

/* ---------- 7. .kmv 파일 왕복 ---------- */
const kmv = await page.evaluate(() => JSON.stringify({ app: 'kmovie', v: 1, id: 'fileProj1', name: '파일로 옮긴 것', updatedAt: Date.now(), doc: KMV_PROJECT.toJSON() }));
const bad = JSON.stringify({ hello: 1 });
const s7 = await page.evaluate(([good, badTxt]) => { const r = KMV_STORE.parse(good); let err = null; try { KMV_STORE.parse(badTxt); } catch (e) { err = e.message; } return { id: r.id, name: r.name, S: r.doc.S.length, err }; }, [kmv, bad]);
ok(s7.id === 'fileProj1' && s7.name === '파일로 옮긴 것' && s7.S === 1, '.kmv 텍스트 → 레코드 (id·이름·내용 유지)');
ok(/작업 파일이 아니에요/.test(s7.err), '엉뚱한 파일은 거절');
const kmvPath = path.join(FX, 'test.kmv'); fs.writeFileSync(kmvPath, kmv);
await page.click('#btnNew'); await page.waitForFunction(() => document.querySelectorAll('#projModal .prow').length >= 1);
await page.setInputFiles('#kmvIn', [kmvPath]);
await page.waitForFunction(() => KMV_UI.proj.id === 'fileProj1', null, { timeout: 30000 });
await page.waitForTimeout(500);
const s7b = await page.evaluate(async () => ({ name: KMV_UI.proj.name, S: KMV_PROJECT.data.S.length, inList: (await KMV_STORE.list()).some(x => x.id === 'fileProj1'), modal: document.getElementById('projModal').classList.contains('hidden') }));
ok(s7b.name === '파일로 옮긴 것' && s7b.S === 1 && s7b.inList && s7b.modal, '「파일 가져오기」 → 열리고 목록에도 들어감');

/* ---------- 8. 삭제 ---------- */
const s8 = await page.evaluate(async () => { const id = KMV_UI.proj.id; await KMV_STORE.remove(id); await KMV_UI.newProject(); const L = await KMV_STORE.list(); return { gone: !L.some(x => x.id === id), name: KMV_UI.proj.name }; });
ok(s8.gone && /새 작업/.test(s8.name), '삭제 후 목록에서 사라지고 새 작업으로');

/* ---------- 9. 옛 단일 저장(kv project) 이관 ---------- */
await page.evaluate(async () => {
  const doc = KMV_PROJECT.toJSON(); doc.S = [{ id: 'sL', text: '옛날 작업', at: 0, dur: 30, style: 'basic' }];
  const { meta } = KMV_GEN.mediaMeta({ mood: 'morning', bpm: 92, key: 'C', seed: 1, durSec: 10 }, 'genL'); doc.media = [meta]; doc.V = [];
  await new Promise((res, rej) => { const r = indexedDB.open('kmovie', 2); r.onsuccess = () => { const d = r.result; const t = d.transaction(['kv'], 'readwrite'); t.objectStore('kv').put(doc, 'project'); t.objectStore('kv').delete('current'); t.oncomplete = () => { d.close(); res(); }; t.onerror = () => rej(t.error); }; r.onerror = () => rej(r.error); });
});
await goto(); await page.waitForTimeout(800);
const s9 = await page.evaluate(async () => ({ name: KMV_UI.proj.name, S: KMV_PROJECT.data.S.map(s => s.text), music: KMV_PROJECT.data.media.length, legacy: await (async () => { try { return await new Promise((res, rej) => { const r = indexedDB.open('kmovie', 2); r.onsuccess = () => { const q = r.result.transaction('kv').objectStore('kv').get('project'); q.onsuccess = () => { r.result.close(); res(q.result); }; q.onerror = () => rej(q.error); }; }); } catch (e) { return 'err'; } })() }));
ok(s9.name === '이전 작업' && s9.S[0] === '옛날 작업' && s9.music === 1, '옛 단일 저장 → 「이전 작업」 레코드로 이관');
ok(!s9.legacy, '이관 뒤 옛 자리는 비움');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
try { fs.unlinkSync(kmvPath); } catch (e) {}
await close(); srv.kill();
process.exit(fail ? 1 : 0);
