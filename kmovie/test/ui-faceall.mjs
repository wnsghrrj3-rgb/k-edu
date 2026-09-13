// 케이무비 59단계 검증: 학생 도구상자 「얼굴 가리기」(더 보기 탭) — 영상 전부 한 번에 모자이크/흐리게/끄기, 2개 이상 골랐으면 고른 것만,
// undo 1회, 안내문 개수, 빈 타임라인·중복 누름 안전, 새로고침 복원, 콘솔 오류 0. (탐지 픽셀은 ui-face 가 본다 — 여긴 모델·UI 만)
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-faceall.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8794);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1900, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'application/javascript' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_FACE);
const faces = () => page.evaluate(() => KMV_PROJECT.data.V.filter(c => !c.gap).map(c => c.face ? c.face.mode + '/' + c.face.level + '/' + (c.face.auto ? 'a' : '-') : '-'));
const note = () => page.evaluate(() => document.getElementById('faceAllNote').textContent);

/* ---------- 1. 빈 타임라인 — 더 보기 탭 맨 위에 패널 ---------- */
await page.evaluate(() => KMV_UI.tab('more'));
const p0 = await page.evaluate(() => { const fp = document.getElementById('facePanel'), ap = document.getElementById('autoPanel'); return { vis: fp && getComputedStyle(fp).display !== 'none', first: fp && fp.compareDocumentPosition(ap) & Node.DOCUMENT_POSITION_FOLLOWING, tab: fp.dataset.tab, h3: fp.querySelector('h3').textContent, off: document.getElementById('btnFaceAllOff').disabled }; });
ok(p0.vis && p0.first && p0.tab === 'more' && /얼굴 가리기/.test(p0.h3), '「더 보기」 탭 맨 위에 「얼굴 가리기」 패널');
ok(/영상을 넣으면/.test(await note()) && p0.off, '빈 타임라인 안내문 · 「끄기」 비활성');
await page.click('#btnFaceAllMosaic'); await page.waitForTimeout(150);
ok((await page.evaluate(() => KMV_PROJECT.data.V.length)) === 0 && (await page.evaluate(() => (document.getElementById('toast') || {}).textContent || '')).length >= 0, '영상 없이 눌러도 아무 일 없음(오류 0)');

/* ---------- 2. 클립 3개 → 전부 모자이크 ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.evaluate(() => { const c = KMV_PROJECT.data.V[0]; KMV_PROJECT.split(Math.round(c.dur / 3)); KMV_PROJECT.split(Math.round(c.dur * 2 / 3)); });
ok((await page.evaluate(() => KMV_PROJECT.data.V.length)) === 3, '클립 3개');
ok(/클립 3개 · 아직/.test(await note()), '안내문: 클립 3개 · 아직 가리는 게 없어요');
const u0 = await page.evaluate(() => KMV_PROJECT.undoDepth ? KMV_PROJECT.undoDepth() : null);
await page.click('#btnFaceAllMosaic'); await page.waitForTimeout(200);
ok(JSON.stringify(await faces()) === JSON.stringify(['mosaic/b/a', 'mosaic/b/a', 'mosaic/b/a']), '모자이크 → 3개 전부 {mosaic, 보통, 자동}');
ok(/3개 중 3개 가리는 중 \(모자이크\)/.test(await note()) && !(await page.evaluate(() => document.getElementById('btnFaceAllOff').disabled)), '안내문 3/3 모자이크 · 「끄기」 활성');
ok(await page.evaluate(() => KMV_PROJECT.data.V.every(c => c.face)) , '타임라인 클립에 face 유지');

/* ---------- 3. 같은 것 다시 누름 = 변화 없음 · 흐리게로 바꿈(직접 칸·세기 유지) ---------- */
await page.click('#btnFaceAllMosaic'); await page.waitForTimeout(150);
ok(JSON.stringify(await faces()) === JSON.stringify(['mosaic/b/a', 'mosaic/b/a', 'mosaic/b/a']), '같은 버튼 다시 → 그대로');
await page.evaluate(() => { const c = KMV_PROJECT.data.V[1]; KMV_PROJECT.setFace(c.id, { level: 'c' }); KMV_PROJECT.addFaceRect(c.id, { x: 0.1, y: 0.1, w: 0.2, h: 0.2 }); });
await page.click('#btnFaceAllBlur'); await page.waitForTimeout(150);
const f3 = await page.evaluate(() => KMV_PROJECT.data.V.map(c => c.face));
ok(f3.every(f => f.mode === 'blur') && f3[1].level === 'c' && f3[1].rects.length === 1 && f3[0].level === 'b', '흐리게 → 모드만 바뀌고 세기·직접 칸은 유지');
ok(/\(흐리게\)/.test(await note()), '안내문 (흐리게)');

/* ---------- 4. Ctrl+Z 한 번에 전부 되돌림 ---------- */
await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
ok(JSON.stringify((await page.evaluate(() => KMV_PROJECT.data.V.map(c => c.face.mode)))) === JSON.stringify(['mosaic', 'mosaic', 'mosaic']), 'Ctrl+Z 한 번 → 3개 모두 모자이크로');
await page.keyboard.press('Control+y'); await page.waitForTimeout(150);
ok((await page.evaluate(() => KMV_PROJECT.data.V.every(c => c.face.mode === 'blur'))), 'Ctrl+Y → 다시 흐리게');

/* ---------- 5. 2개 이상 골랐으면 고른 것만 ---------- */
await page.evaluate(() => { const V = KMV_PROJECT.data.V; KMV_UI.select(V[0].id); KMV_UI.select(V[1].id, 'toggle'); });
ok(/고른 클립 2개에만/.test(await note()), '2개 골랐을 때 안내문에 「고른 클립 2개에만」');
await page.click('#btnFaceAllOff'); await page.waitForTimeout(150);
ok(JSON.stringify(await faces()) === JSON.stringify(['-', '-', 'blur/b/a']), '끄기 → 고른 2개만 지워지고 셋째는 그대로');
await page.evaluate(() => KMV_UI.select(null));
ok(!/고른 클립/.test(await note()) && /3개 중 1개/.test(await note()), '선택 풀면 안내문 3개 중 1개');

/* ---------- 6. 전부 끄기 → 끄기 비활성 · 다시 끄기 눌러도 오류 0 ---------- */
await page.click('#btnFaceAllOff'); await page.waitForTimeout(150);
ok(JSON.stringify(await faces()) === JSON.stringify(['-', '-', '-']) && (await page.evaluate(() => document.getElementById('btnFaceAllOff').disabled)), '전부 끄기 → face 없음 · 「끄기」 비활성');
await page.evaluate(() => document.getElementById('btnFaceAllOff').removeAttribute('disabled')); await page.click('#btnFaceAllOff'); await page.waitForTimeout(100);
ok(JSON.stringify(await faces()) === JSON.stringify(['-', '-', '-']), '없는데 또 끄기 → 아무 일 없음');

/* ---------- 7. 빈 자리(gap)는 건너뜀 · 새로고침 복원 ---------- */
await page.click('#btnFaceAllMosaic'); await page.waitForTimeout(150);
await page.evaluate(() => { KMV_UI.select(KMV_PROJECT.data.V[1].id); });
await page.keyboard.press(';'); await page.waitForTimeout(150);   // 리프트 = 빈 자리
const g = await page.evaluate(() => ({ gaps: KMV_PROJECT.data.V.filter(c => c.gap).length, faces: KMV_PROJECT.data.V.filter(c => !c.gap && c.face).length }));
ok(g.gaps === 1 && g.faces === 2, '리프트 → 빈 자리 1 · 가린 클립 2');
await page.evaluate(() => KMV_UI.select(null));
await page.click('#btnFaceAllBlur'); await page.waitForTimeout(150);
ok(await page.evaluate(() => KMV_PROJECT.data.V.every(c => c.gap ? !c.face : c.face.mode === 'blur')), '빈 자리엔 face 없음 · 나머지 흐리게');
await page.waitForTimeout(900);
await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_PROJECT.data.V.length >= 3, null, { timeout: 30000 }); await page.waitForTimeout(400);
ok(await page.evaluate(() => KMV_PROJECT.data.V.filter(c => !c.gap).every(c => c.face && c.face.mode === 'blur')), '새로고침 복원');
await page.evaluate(() => KMV_UI.tab('more'));
ok(/2개 가리는 중 \(흐리게\)/.test(await note()), '복원 뒤 안내문 갱신');

/* ---------- 8. 별칭 auto → more 탭에서 패널 보임 ---------- */
await page.evaluate(() => KMV_UI.tab('auto'));
ok(await page.evaluate(() => getComputedStyle(document.getElementById('facePanel')).display !== 'none'), '옛 별칭 tab(auto) 에서도 패널 보임');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
