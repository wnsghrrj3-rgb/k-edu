// 케이무비 6단계 컷 도구 — headless chromium 검증 (playwright)
// 준비: test/ 에서  npm i mp4box@0.5.2 mp4-muxer@5.2.1  ·  bash make-fixtures.sh (ffmpeg, VP9/opus 6초 2개)
// 실행: PLAYWRIGHT_BROWSERS_PATH=… node test/ui-cut.mjs   (jsdelivr 는 node_modules 로 대체 — 차단망에서도 돈다)
// headless 는 rAF 가 드물게 돌아 재생·셔틀 검사는 느슨하게(프레임 수 > 몇) 둔다. 실크롬에선 정속.
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..'), PORT = 8765, DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required', '--enable-features=WebCodecs'] });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
page.on('dialog', d => d.accept('마커이름'));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`);
await page.waitForFunction(() => window.KMV_UI && window.KMV_PROJECT);
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4'), path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 2 && KMV_PROJECT.data.media.every(m => KMV_MEDIA.get(m.id).analyzed), null, { timeout: 60000 });
const V = () => page.evaluate(() => KMV_PROJECT.data.V.map(c => ({ id: c.id, media: c.media, in: c.in, out: c.out, at: c.at, dur: c.dur })));
const clipXY = async (i, where) => page.evaluate(({ i, where }) => { const c = KMV_PROJECT.data.V[i], L = KMV_UI.layout, r = document.getElementById('timeline').getBoundingClientRect(); const x0 = KMV_UI.xOf(c.at), x1 = KMV_UI.xOf(c.at + c.dur); const x = where === 'in' ? x0 + 3 : where === 'out' ? x1 - 3 : (x0 + x1) / 2; return { x: r.left + x, y: r.top + L.LY.V.y + L.LY.V.h / 2 }; }, { i, where });
let v = await V(); ok(v.length === 2 && v[0].dur === 180 && v[1].dur === 180, '가져오기 2개 (각 180f)');

console.log('다중 선택');
let p = await clipXY(0, 'mid'); await page.mouse.click(p.x, p.y);
p = await clipXY(1, 'mid'); await page.keyboard.down('Shift'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Shift');
ok((await page.evaluate(() => KMV_UI.selectedIds().length)) === 2, 'Shift+클릭 범위 선택 2개');
await page.keyboard.down('Control'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Control');
ok((await page.evaluate(() => KMV_UI.selectedIds().length)) === 1, 'Ctrl+클릭 토글 해제 → 1개');
await page.keyboard.press('Control+a'); ok((await page.evaluate(() => KMV_UI.selectedIds().length)) === 2, 'Ctrl+A 전체');
await page.keyboard.press('Delete'); ok((await V()).length === 0, 'Del 로 둘 다 삭제');
await page.keyboard.press('Control+z'); ok((await V()).length === 2, 'Ctrl+Z 복원');
ok((await page.evaluate(() => document.getElementById('pCnt').textContent)).includes('선택') === false, '선택 표시는 다중일 때만');

console.log('복사·붙여넣기');
p = await clipXY(0, 'mid'); await page.mouse.click(p.x, p.y);
await page.keyboard.press('Control+c'); await page.evaluate(() => KMV_UI.setPH(90)); await page.keyboard.press('Control+v');
v = await V(); ok(v.length === 4 && v[1].dur === 180 && v[0].dur === 90 && v[2].dur === 90, 'Ctrl+C/V: 90f 에 삽입(앞 클립 갈라짐)');
ok((await page.evaluate(() => KMV_UI.ph)) === 270, '붙여넣은 클립 끝으로 플레이헤드');
await page.keyboard.press('Control+z'); v = await V(); ok(v.length === 2, '붙여넣기 undo 한 번');
p = await clipXY(1, 'mid'); await page.mouse.click(p.x, p.y); await page.keyboard.press('Control+x'); ok((await V()).length === 1, 'Ctrl+X 잘라내기');
await page.evaluate(() => KMV_UI.setPH(0)); await page.keyboard.press('Control+v'); v = await V(); ok(v.length === 2 && v[0].media !== v[1].media && v[0].at === 0, '0 에 붙여넣기 → 맨 앞');
await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z'); v = await V(); ok(v.length === 2 && v[0].at === 0 && v[0].dur === 180, '되돌리기 2회 → 처음 상태');

console.log('롤 (Ctrl+가장자리)');
await page.evaluate(() => { const c = KMV_PROJECT.data.V[0]; KMV_PROJECT.trim(c.id, 'out', 150); const d = KMV_PROJECT.data.V[1]; KMV_PROJECT.trim(d.id, 'in', 30); });   // 핸들 확보: A 0-150 | B 30-180
const tot0 = await page.evaluate(() => KMV_PROJECT.total());
p = await clipXY(0, 'out');
await page.keyboard.down('Control'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 30, p.y, { steps: 6 });
const mid = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); const d = c.getImageData(960, 300, 1, 1).data; const l = c.getImageData(480, 540, 1, 1).data; const r = c.getImageData(1440, 540, 1, 1).data; return { divider: d[0] + d[1] + d[2], left: l[0] + l[1] + l[2], right: r[0] + r[1] + r[2] }; });
ok(mid.divider > 60 && mid.left > 0 && mid.right > 0, '롤 중 두 화면 미리보기 (가운데 구분선·양쪽 프레임)');
await page.mouse.up(); await page.keyboard.up('Control');
v = await V(); const pxf = await page.evaluate(() => KMV_UI.pxf);
const dExp = Math.round(30 / pxf);
ok(v[0].out > 150 && v[1].in > 30 && v[0].out - 150 === v[1].in - 30 && Math.abs(v[1].in - 30 - dExp) <= 1, `롤: 앞 out +${v[0].out - 150} · 뒤 in +${v[1].in - 30} (기대 ≈${dExp})`);
ok((await page.evaluate(() => KMV_PROJECT.total())) === tot0, '롤 후 전체 길이 그대로');
await page.keyboard.press('Control+z'); v = await V(); ok(v[0].out === 150 && v[1].in === 30, '롤 undo 한 번');
await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z'); v = await V(); ok(v[0].out === 180 && v[1].in === 0, '트림 undo');

console.log('슬립 (Alt+몸통)');
p = await clipXY(1, 'in'); await page.mouse.click(p.x, p.y); await page.evaluate(() => KMV_UI.setPH(0));
// 먼저 뒤 클립을 트림해 슬립 여지를 만든다
await page.evaluate(() => { const c = KMV_PROJECT.data.V[1]; KMV_PROJECT.trim(c.id, 'in', 60); KMV_PROJECT.trim(c.id, 'out', 120); });
p = await clipXY(1, 'mid');
await page.keyboard.down('Alt'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 40, p.y, { steps: 6 });
const two = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); const d = c.getImageData(960, 300, 1, 1).data; return d[0] + d[1] + d[2]; });
ok(two > 60, '슬립 중 두 화면(시작·끝) 미리보기');
await page.mouse.up(); await page.keyboard.up('Alt');
v = await V(); const sExp = Math.round(40 / pxf);
ok(v[1].dur === 60 && v[1].in < 60 && 60 - v[1].in === 120 - v[1].out && Math.abs(60 - v[1].in - sExp) <= 1, `슬립: 길이 60 그대로, in/out -${60 - v[1].in} (기대 ≈${sExp})`);
await page.keyboard.press('Control+z'); v = await V(); ok(v[1].in === 60 && v[1].out === 120, '슬립 undo');
await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z'); v = await V(); ok(v[1].in === 0 && v[1].out === 180, '트림도 되돌림');

console.log('마커');
await page.evaluate(() => KMV_UI.setPH(45)); await page.keyboard.press('m');
ok((await page.evaluate(() => KMV_PROJECT.markerFrames())).join() === '45', 'M → 마커 45');
await page.keyboard.press('m'); ok((await page.evaluate(() => KMV_PROJECT.data.markers[0].text)) === '마커이름', '같은 자리 M 한 번 더 → 이름 (prompt)');
await page.evaluate(() => KMV_UI.setPH(200)); await page.keyboard.press('m'); await page.evaluate(() => KMV_UI.setPH(0));
await page.keyboard.press('Shift+m'); ok((await page.evaluate(() => KMV_UI.ph)) === 45, 'Shift+M 다음 마커');
await page.keyboard.press('Shift+m'); ok((await page.evaluate(() => KMV_UI.ph)) === 200, 'Shift+M 또 다음');
await page.keyboard.press('Control+Shift+m'); ok((await page.evaluate(() => KMV_UI.ph)) === 45, 'Ctrl+Shift+M 이전');
ok((await page.evaluate(() => document.querySelectorAll('#markerList .mk').length)) === 2, '마커 목록 2개');
// 눈금자 마커 클릭·끌기
const mkP = await page.evaluate(() => { const r = document.getElementById('timeline').getBoundingClientRect(); return { x: r.left + KMV_UI.xOf(200), y: r.top + 12 }; });
await page.mouse.move(mkP.x, mkP.y); await page.mouse.down(); await page.mouse.move(mkP.x + 50, mkP.y, { steps: 5 }); await page.mouse.up();
const mks = await page.evaluate(() => KMV_PROJECT.markerFrames()); ok(mks[1] > 200 && Math.abs(mks[1] - 200 - Math.round(50 / pxf)) <= 1, '마커 끌어 이동 → ' + mks[1]);
ok((await page.evaluate(() => KMV_UI.selM)) != null, '마커 선택됨'); await page.keyboard.press('Delete');
ok((await page.evaluate(() => KMV_PROJECT.markerFrames())).length === 1, 'Del 로 선택 마커 삭제');
// 스냅 후보: 마커 45 에 클립 경계 트림 스냅
const ruler = await page.evaluate(() => { const c = document.getElementById('timeline').getContext('2d'); const x = Math.round(KMV_UI.xOf(45)); const d = c.getImageData(Math.round(x * devicePixelRatio), Math.round(14 * devicePixelRatio), 1, 1).data; return d[0] + d[1] + d[2]; });
ok(ruler > 200, '눈금자에 마커 마름모 픽셀');

console.log('소스 모니터 · 3점 편집');
await page.click('#bin .mi:nth-child(2)');
ok((await page.evaluate(() => KMV_UI.stage)) === 'src', '보관함 클릭 → 소스 모니터');
ok(!(await page.evaluate(() => document.getElementById('srcBar').classList.contains('hidden'))), '소스 바 표시');
await page.evaluate(() => KMV_UI.setSrcPH(30)); await page.keyboard.press('i');
await page.evaluate(() => KMV_UI.setSrcPH(89)); await page.keyboard.press('o');
const io = await page.evaluate(() => ({ in: KMV_UI.src.in, out: KMV_UI.src.out, txt: document.getElementById('srcIO').textContent }));
ok(io.in === 30 && io.out === 90 && /I 00:01:00/.test(io.txt) && /O 00:03:00/.test(io.txt) && /2\.00초/.test(io.txt), 'I/O 30~90 · 표시 ' + io.txt);
await page.waitForTimeout(300);
const srcPx = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); const d = c.getImageData(960, 540, 1, 1).data; return d[0] + d[1] + d[2]; });
ok(srcPx > 0, '소스 프레임이 스테이지에 그려짐');
await page.evaluate(() => { KMV_UI.showStage('tl'); KMV_UI.setPH(60); KMV_UI.showStage('src'); });
await page.keyboard.press(','); v = await V();
ok(v.length === 4 && v[1].in === 30 && v[1].out === 90 && v[1].at === 60 && v[0].dur === 60 && v[2].dur === 120, '삽입(,): 60 에서 갈라 넣음 ' + JSON.stringify(v.map(c => [c.in, c.out])));
ok((await page.evaluate(() => KMV_UI.stage)) === 'src' && (await page.evaluate(() => KMV_UI.ph)) === 120, '삽입 후 소스 모니터 유지 · 플레이헤드는 삽입 끝');
await page.keyboard.press('Control+z');
await page.evaluate(() => { KMV_UI.showStage('tl'); KMV_UI.setPH(60); KMV_UI.showStage('src'); });
await page.keyboard.press('.'); v = await V(); const totNow = await page.evaluate(() => KMV_PROJECT.total());
ok(v.length === 4 && v[1].in === 30 && v[1].out === 90 && v[2].in === 120 && totNow === 360, '덮어쓰기(.): 전체 길이 360 그대로 ' + JSON.stringify(v.map(c => [c.in, c.out])));
await page.click('#srcAppend'); v = await V(); ok(v.length === 5 && v[4].in === 30 && v[4].out === 90, '끝에 버튼');
await page.keyboard.press('Escape'); ok((await page.evaluate(() => KMV_UI.stage)) === 'tl', 'Esc → 타임라인');
await page.click('#tabSrc'); ok((await page.evaluate(() => KMV_UI.stage)) === 'src', '소스 탭으로 복귀 (I/O 기억)');
ok((await page.evaluate(() => KMV_UI.src.in === 30 && KMV_UI.src.out === 90)), 'I/O 기억됨');
await page.click('#bin .mi:nth-child(1)'); ok((await page.evaluate(() => KMV_UI.src.in == null)), '다른 원본은 I/O 없음(전체)');
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); ok((await page.evaluate(() => KMV_UI.src.ph)) === 2, '소스에서 → 는 소스 프레임 이동');
// 소스 재생
await page.keyboard.press('Space'); await page.waitForTimeout(700); const sp = await page.evaluate(() => ({ ph: KMV_UI.src.ph, playing: KMV_UI.playing })); await page.keyboard.press('Space');
ok(sp.playing && sp.ph > 3, '소스 재생 (소리 시계) ' + sp.ph);
await page.click('#bin .mi:nth-child(1) .add'); v = await V(); ok(v.length === 6 && (await page.evaluate(() => KMV_UI.stage)) === 'tl', '＋ 버튼: 통째로 끝에 · 타임라인으로');

console.log('JKL 셔틀');
await page.evaluate(() => KMV_UI.setPH(0));
await page.keyboard.press('l'); await page.waitForTimeout(1000); const l1 = await page.evaluate(() => ({ ph: KMV_UI.ph, sh: KMV_UI.shuttle, playing: KMV_UI.playing }));
ok(l1.playing && l1.sh === 1 && l1.ph > 2, 'L 1× 재생(소리) ' + l1.ph);
await page.keyboard.press('l'); await page.waitForTimeout(1600); const l2 = await page.evaluate(() => ({ ph: KMV_UI.ph, sh: KMV_UI.shuttle, playing: KMV_UI.playing, lbl: document.getElementById('tPlay').textContent }));
ok(!l2.playing && l2.sh === 2 && l2.ph > l1.ph && /2×/.test(l2.lbl), 'L 두 번 → 2× 무음 ' + l2.ph + ' ' + l2.lbl);
await page.keyboard.press('k'); const k1 = await page.evaluate(() => ({ sh: KMV_UI.shuttle, playing: KMV_UI.playing })); ok(k1.sh === 0 && !k1.playing, 'K 정지');
await page.evaluate(() => KMV_UI.setPH(200)); const before = await page.evaluate(() => KMV_UI.ph);
await page.keyboard.press('j'); await page.waitForTimeout(1200); const j1 = await page.evaluate(() => ({ ph: KMV_UI.ph, sh: KMV_UI.shuttle }));
ok(j1.sh === -1 && j1.ph < before - 2, 'J 역방향 1× ' + before + '→' + j1.ph);
await page.keyboard.press('j'); await page.waitForTimeout(300); ok((await page.evaluate(() => KMV_UI.shuttle)) === -2, 'J 두 번 → -2×');
await page.keyboard.press('Space'); ok((await page.evaluate(() => KMV_UI.shuttle)) === 0, 'Space 로 셔틀 정지');

console.log('다중 이동');
await page.evaluate(() => { KMV_UI.stop(); KMV_UI.setPH(0); });
v = await V(); const idsBefore = v.map(c => c.id);
p = await clipXY(0, 'mid'); await page.mouse.click(p.x, p.y); p = await clipXY(1, 'mid'); await page.keyboard.down('Shift'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Shift');
const p0 = await clipXY(0, 'mid'), pEnd = await clipXY(5, 'out');
await page.mouse.move(p0.x, p0.y); await page.mouse.down(); await page.mouse.move(pEnd.x + 20, p0.y, { steps: 8 }); await page.mouse.up();
v = await V(); ok(v.slice(4).map(c => c.id).join() === idsBefore.slice(0, 2).join() && v.length === 6, '두 클립을 끝으로 끌어 이동 (순서 유지)');

console.log('회귀 — 기존 컷 도구');
v = await V(); const n0 = v.length, d0 = v[0].dur, d1 = v[1].dur;
await page.evaluate(() => { KMV_UI.stop(); const c = KMV_PROJECT.data.V[1]; KMV_UI.setPH(c.at + 30); }); await page.keyboard.press('s'); v = await V(); ok(v.length === n0 + 1 && v[1].dur === 30 && v[2].dur === d1 - 30, 'S 분할 그대로');
p = await clipXY(0, 'out'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x - 20, p.y, { steps: 5 }); await page.mouse.up(); v = await V(); ok(v[0].dur < d0 && v[0].dur >= d0 - 7 && v[1].dur === 30, '가장자리 끌기 = 리플 트림(롤 아님, 뒤 클립 그대로) ' + d0 + '→' + v[0].dur);
p = await clipXY(2, 'mid'); await page.mouse.click(p.x, p.y); ok((await page.evaluate(() => KMV_UI.selectedIds().length)) === 1, '단일 클릭 = 단일 선택');
p = await clipXY(3, 'mid'); await page.keyboard.down('Shift'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Shift'); p = await clipXY(2, 'mid'); await page.mouse.click(p.x, p.y); ok((await page.evaluate(() => KMV_UI.selectedIds().length)) === 1, '다중 선택 중 하나를 그냥 클릭 → 그것만');
await page.evaluate(() => KMV_UI.setPH(v => 0)); await page.evaluate(() => { const c = KMV_PROJECT.data.V[2]; KMV_UI.setPH(c.at + 20); }); await page.keyboard.press('q'); v = await V(); ok(v[2].in === 20 || v[2].dur === v[2].out - v[2].in, 'Q 트림 동작');
await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');

console.log('복원');
await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_PROJECT.data.V.length >= 6, null, { timeout: 60000 });
ok((await page.evaluate(() => KMV_PROJECT.markerFrames())).join() === '45', '새로고침 후 마커 복원');
ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과${fail ? ' — 실패 ' + fail : ''}`);
await browser.close(); srv.kill(); process.exit(fail ? 1 : 0);
