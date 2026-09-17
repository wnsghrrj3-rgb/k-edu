// 케이무비 61단계 검증: 내보내기 화질 고르기 — 원본에 맞게·고화질·보통·가볍게, 실제 파일 해상도, 기억, Esc/Enter, 세로.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-export.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8799);
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
await page.evaluate(() => {
  delete window.showSaveFilePicker; window.__exp = { blobs: [] };
  const o = URL.createObjectURL.bind(URL); URL.createObjectURL = b => { if (b && b.type === 'video/mp4') window.__exp.blobs.push(b); return o(b); };
});
const parse = i => page.evaluate(async i => {
  const b = window.__exp.blobs[i]; if (!b) return null; const buf = await b.arrayBuffer(); buf.fileStart = 0;
  return await new Promise(res => { const f = MP4Box.createFile(); f.onReady = info => { const v = info.videoTracks[0]; res({ w: v.video.width, h: v.video.height, n: v.nb_samples, bytes: b.size, audio: info.audioTracks.length }); }; f.onError = e => res({ err: String(e) }); f.appendBuffer(buf); f.flush(); });
}, i);

/* 1. 빈 타임라인 — 창이 안 뜸 */
await page.click('#btnExport'); await page.waitForTimeout(150);
ok(await page.evaluate(() => document.getElementById('expModal').classList.contains('hidden')), '빈 타임라인이면 화질 창이 안 뜸(토스트만)');

/* 2. 영상 넣고 → 창 · 4가지 · 기본 「보통」 */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.evaluate(() => { const c = KMV_PROJECT.data.V[0]; KMV_PROJECT.trim(c.id, 'out', Math.min(c.out, 12)); });
const src = await page.evaluate(() => KMV_EXPORT.mainSource());
ok(src && src.w > 0 && src.h > 0 && src.bps > 0, '원본 크기·비트레이트를 읽음 — ' + JSON.stringify(src));
await page.click('#btnExport'); await page.waitForTimeout(150);
const m1 = await page.evaluate(() => ({ open: !document.getElementById('expModal').classList.contains('hidden'), items: [...document.querySelectorAll('#expList button')].map(b => ({ q: b.dataset.q, on: b.classList.contains('on'), name: b.children[0].textContent, spec: b.children[1].textContent })), info: document.getElementById('expInfo').textContent }));
ok(m1.open && m1.items.map(x => x.q).join() === 'source,high,normal,light', '화질 창: 원본에 맞게·고화질·보통·가볍게');
ok(m1.items.find(x => x.on).q === 'normal', '기본은 「보통」');
ok(m1.items.every(x => /\d+×\d+ · [\d.]+Mbps · 약 \d/.test(x.spec)), '항목마다 크기·Mbps·예상 용량 — ' + m1.items.map(x => x.spec).join(' | '));
ok(/넣은 영상: \d+×\d+/.test(m1.info), '아래에 넣은 영상 정보 — ' + m1.info);

/* 3. plan 값 */
const pl = await page.evaluate(() => ({ s: KMV_EXPORT.plan('source'), h: KMV_EXPORT.plan('high'), n: KMV_EXPORT.plan('normal'), l: KMV_EXPORT.plan('light') }));
ok(pl.n.w === 1920 && pl.n.h === 1080 && pl.n.bitrate === 8000000, '보통 = 1920×1080 8Mbps (예전과 동일)');
ok(pl.l.w === 1280 && pl.l.h === 720 && pl.l.bitrate < pl.n.bitrate, '가볍게 = 1280×720, 더 낮은 비트레이트');
ok(pl.h.w >= 1920 && pl.h.bitrate >= 20000000, '고화질 = 1080p 이상 · 20Mbps 이상');
const k = Math.min(src.w / 1920, src.h / 1080), ew = Math.max(2, Math.round(1920 * Math.max(1 / 3, Math.min(2, k)) / 2) * 2);
ok(pl.s.w === ew && pl.s.w % 2 === 0 && pl.s.h % 2 === 0, '원본에 맞게 = 원본 크기(' + src.w + '×' + src.h + ') → ' + pl.s.w + '×' + pl.s.h + ' 짝수');
ok(pl.s.bitrate >= src.bps || pl.s.bitrate >= 0.3 * 3e6, '원본에 맞게 비트레이트 ≥ 원본(또는 바닥값) — ' + pl.s.bitrate);

/* 4. Esc = 취소(내보내기 안 함) */
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.getElementById('expModal').classList.contains('hidden') && document.getElementById('overlay').classList.contains('hidden') && window.__exp.blobs.length === 0), 'Esc → 닫히고 내보내기 안 함');
await page.keyboard.press('s'); await page.waitForTimeout(100);
const nV = await page.evaluate(() => KMV_PROJECT.data.V.length);

/* 5. 「가볍게」 골라 내보내기 → 실제 파일 1280×720 · 기억 */
await page.click('#btnExport'); await page.waitForTimeout(150);
await page.keyboard.press('s'); await page.waitForTimeout(100);
ok((await page.evaluate(() => KMV_PROJECT.data.V.length)) === nV, '창이 떠 있을 땐 단축키 S 가 타임라인에 안 먹음');
await page.click('#expList button[data-q="light"]');
ok(await page.evaluate(() => document.querySelector('#expList button[data-q="light"]').classList.contains('on')), '「가볍게」 고름 표시');
await page.click('#expGo');
await page.waitForFunction(() => window.__exp.blobs.length === 1, null, { timeout: 240000 });
const f1 = await parse(0);
ok(f1 && f1.w === 1280 && f1.h === 720, '내보낸 파일이 실제 1280×720 — ' + JSON.stringify(f1));
ok((await page.evaluate(() => localStorage.getItem('kmv.expq'))) === 'light', '고른 화질 기억(kmv.expq)');
await page.waitForFunction(() => document.getElementById('overlay').classList.contains('hidden'), null, { timeout: 20000 });

/* 6. 「고화질」 → 같은 길이·1080p 이상·파일이 더 큼 */
await page.click('#btnExport'); await page.waitForTimeout(150);
ok(await page.evaluate(() => document.querySelector('#expList button.on').dataset.q === 'light'), '다시 열면 지난번 고른 것');
await page.click('#expList button[data-q="high"]'); await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__exp.blobs.length === 2, null, { timeout: 300000 });
const f2 = await parse(1);
ok(f2 && f2.w === pl.h.w && f2.h === pl.h.h && f2.n === f1.n, '고화질 파일 ' + pl.h.w + '×' + pl.h.h + ' · 프레임 수 같음 — ' + JSON.stringify(f2));
ok(f2.bytes > f1.bytes, '고화질 파일이 더 큼 (' + f2.bytes + ' > ' + f1.bytes + ')');
await page.waitForFunction(() => document.getElementById('overlay').classList.contains('hidden'), null, { timeout: 20000 });

/* 7. 「원본에 맞게」 실제 파일 크기 */
await page.click('#btnExport'); await page.waitForTimeout(150);
await page.click('#expList button[data-q="source"]'); await page.click('#expGo');
await page.waitForFunction(() => window.__exp.blobs.length === 3, null, { timeout: 300000 });
const f3 = await parse(2);
ok(f3 && f3.w === pl.s.w && f3.h === pl.s.h, '원본에 맞게 파일 ' + pl.s.w + '×' + pl.s.h + ' — ' + JSON.stringify(f3));

/* 8. 세로 화면비 */
await page.waitForFunction(() => document.getElementById('overlay').classList.contains('hidden'), null, { timeout: 20000 });
const pv = await page.evaluate(() => { KMV_PROJECT.setAspect('9:16'); return { n: KMV_EXPORT.plan('normal'), l: KMV_EXPORT.plan('light'), s: KMV_EXPORT.plan('source') }; });
ok(pv.n.w === 1080 && pv.n.h === 1920 && pv.l.w === 720 && pv.l.h === 1280 && pv.s.w === 1080, '세로(9:16): 보통 1080×1920 · 가볍게 720×1280 · 가로 원본이면 원본에 맞게도 화면 크기 그대로');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
