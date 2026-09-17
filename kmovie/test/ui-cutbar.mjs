// 케이무비 60단계 검증: 타임라인 머리 컷 도구(✂ 자르기 S · 앞/뒤 버리기 Q/W · 지우기 Del) — 늘 보이고, 눌러서 동작.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-cutbar.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8797);
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);
const V = () => page.evaluate(() => KMV_PROJECT.data.V.map(c => ({ at: c.at, dur: c.dur })));

/* 1. 컷 도구가 타임라인 머리에 늘 보인다 (클립을 안 골라도) */
const vis = await page.evaluate(() => ['cutSplit', 'cutHead', 'cutTail', 'cutDel'].map(id => { const b = document.getElementById(id), r = b.getBoundingClientRect(); return r.width > 30 && r.height > 18 && r.bottom <= innerHeight && !!b.closest('.tl-bar'); }));
ok(vis.every(Boolean), '자르기·앞 버리기·뒤 버리기·지우기 버튼이 타임라인 머리에 보임');
ok(/S/.test(await page.evaluate(() => document.getElementById('cutSplit').textContent)) && /Del/.test(await page.evaluate(() => document.getElementById('cutDel').textContent)), '버튼에 단축키 S·Del 표기');
ok(/자르기 S/.test(await page.evaluate(() => document.getElementById('hintTL').textContent)), '힌트 줄 맨 앞이 자르기 S');
await page.click('#cutSplit'); await page.waitForTimeout(150);
ok(errs.length === 0, '빈 타임라인에서 눌러도 오류 0');

/* 2. 자르기 */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
const d0 = (await V())[0].dur;
await page.evaluate(() => { KMV_UI.stop(); KMV_UI.setPH(30); });
await page.click('#cutSplit'); await page.waitForTimeout(150);
let v = await V(); ok(v.length === 2 && v[0].dur === 30 && v[1].dur === d0 - 30, '✂ 자르기 → 30 / 나머지');
/* 3. 뒤 버리기 · 앞 버리기 */
await page.evaluate(() => KMV_UI.setPH(50)); await page.click('#cutTail'); await page.waitForTimeout(150);
v = await V(); ok(v.length === 2 && v[1].dur === 20, '뒤 버리기 → 둘째 조각이 20');
await page.evaluate(() => KMV_UI.setPH(10)); await page.click('#cutHead'); await page.waitForTimeout(150);
v = await V(); ok(v[0].dur === 20 && v[1].at === 20, '앞 버리기 → 첫 조각 20, 뒤가 당겨짐');
/* 4. 지우기 · 되돌리기 */
await page.evaluate(() => KMV_UI.setPH(5)); await page.click('#cutDel'); await page.waitForTimeout(150);
v = await V(); ok(v.length === 1 && v[0].at === 0 && v[0].dur === 20, '🗑 지우기 → 하나 남고 앞으로 붙음');
await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
ok((await V()).length === 2, 'Ctrl+Z 로 되돌림');
/* 5. 좁은 화면에서도 자르기는 보인다 */
await page.setViewportSize({ width: 820, height: 800 }); await page.waitForTimeout(200);
ok(await page.evaluate(() => { const r = document.getElementById('cutSplit').getBoundingClientRect(); return r.width > 30 && r.right <= innerWidth; }), '820px 에서도 자르기 버튼 보임');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
