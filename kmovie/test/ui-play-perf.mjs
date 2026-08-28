// 재생 성능·동작 검증 (준비: make-fixtures.sh 에 big.mp4 추가 생성 — 1080p60 12초 VP9)
// 구버전(ea91ebf)은 이 조건에서 headless 0fps(완전 정지), 수정판은 굴러감: 1080p60 원본으로 실제 재생 프레임 진행 측정 + 반해상도·분석 일시정지·복귀·스트림 일치
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.PORT || 8765);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('/usr/bin/python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext({ viewport: { width: 1500, height: 900 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.route('**/cdn.jsdelivr.net/**', route => { const u = route.request().url(); if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' }); if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' }); return route.fulfill({ body: '', contentType: 'text/css' }); });
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);
await page.setInputFiles('#fileIn', [path.join(FX, 'big.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
const NEW = process.env.NEW !== '0';
const thumbs0 = await page.evaluate(() => KMV_MEDIA.get(KMV_PROJECT.data.media[0].id).thumbs.filter(Boolean).length);
await page.evaluate(() => KMV_UI.setPH(0));
await page.keyboard.press('Space'); await page.waitForTimeout(500);
const size = await page.evaluate(() => ({ w: document.getElementById('preview').width, h: document.getElementById('preview').height, playing: KMV_UI.playing }));
if (NEW) ok(size.playing && size.w === 960, '재생 중 미리보기 1/2 해상도 (' + size.w + '×' + size.h + ')'); else console.log('  (구버전: 재생 중 ' + size.w + '×' + size.h + ' playing=' + size.playing + ')');
const t0 = Date.now(); let last = -1, steps = 0, maxGap = 0;
while (Date.now() - t0 < 3000) { const p = await page.evaluate(() => KMV_UI.ph); if (last >= 0 && p > last) { steps += p - last; maxGap = Math.max(maxGap, p - last); } last = p; await new Promise(r => setTimeout(r, 40)); }
console.log(`  → 재생 3초: 진행 ${steps}프레임 (~${(steps / 3).toFixed(1)}fps 상당, 최대 건너뜀 ${maxGap}f)`);
const thumbsMid = await page.evaluate(() => KMV_MEDIA.get(KMV_PROJECT.data.media[0].id).thumbs.filter(Boolean).length);
await page.keyboard.press('Space'); await page.waitForTimeout(400);
const after = await page.evaluate(() => ({ w: document.getElementById('preview').width, playing: KMV_UI.playing }));
if (NEW) {
  ok(!after.playing && after.w === 1920, '정지하면 원본 해상도 복귀 (' + after.w + ')');
  ok(thumbsMid - thumbs0 <= 2, '재생 중 분석 일시정지 (썸네일 ' + thumbs0 + '→' + thumbsMid + ')');
  await page.waitForTimeout(3000);
  const thumbsEnd = await page.evaluate(() => KMV_MEDIA.get(KMV_PROJECT.data.media[0].id).thumbs.filter(Boolean).length);
  ok(thumbsEnd > thumbsMid, '정지하면 분석 재개 (' + thumbsMid + '→' + thumbsEnd + ')');
  await page.evaluate(() => KMV_UI.setPH(150)); await page.waitForTimeout(1500);
  const px1 = await page.evaluate(() => Array.from(document.getElementById('preview').getContext('2d').getImageData(600, 500, 1, 1).data));
  await page.evaluate(() => KMV_UI.setPH(0)); await page.waitForTimeout(500);
  await page.evaluate(() => KMV_UI.setPH(150)); await page.waitForTimeout(1500);
  const px2 = await page.evaluate(() => Array.from(document.getElementById('preview').getContext('2d').getImageData(600, 500, 1, 1).data));
  ok(Math.abs(px1[0] - px2[0]) + Math.abs(px1[1] - px2[1]) + Math.abs(px1[2] - px2[2]) <= 6, '같은 프레임 = 같은 픽셀 (스트림/정지 렌더 일치)');
  ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 2).join(' | ') : ''));
  console.log(`\n${n - fail}/${n} 통과${fail ? ' — 실패 ' + fail : ''}`);
}
await browser.close(); srv.kill(); process.exit(fail ? 1 : 0);
