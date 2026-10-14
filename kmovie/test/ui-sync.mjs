// 케이무비 62단계 검증: 영상·소리 싱크 — 29.97fps 원본은 fps 를 정확히(30 으로 반올림 금지), 가변 프레임률 원본은 cts 시각으로 프레임을 고르고 소리도 같은 시각에서.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-sync.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8791);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
process.env.KMV_PORT = String(PORT);
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);
await page.evaluate(() => { delete window.showSaveFilePicker; window.__exp = { blobs: [] }; const o = URL.createObjectURL.bind(URL); URL.createObjectURL = b => { if (b && b.type === 'video/mp4') window.__exp.blobs.push(b); return o(b); }; HTMLAnchorElement.prototype.click = function () {}; });

// ---- 1) 29.97fps 원본 ----
await page.setInputFiles('#fileIn', [path.join(FX, 'ntsc.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
{
  const r = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0], m = P.media(c.media), S = KMV_MEDIA.get(m.id); return { fps: S.fps, mfps: m.fps, vfr: S.vfr, frames: S.frames, sec: S.secOf(S.frames - 1), uni: (S.frames - 1) / S.fps, dev: S.vfrDevMs }; });
  ok(Math.abs(r.fps - 29.97) < 0.01 && r.mfps === r.fps, '29.97fps 원본 → fps 를 30 으로 반올림하지 않음 (' + r.fps + ', 보관함 메타도 같음)');
  ok(!r.vfr, '고정 프레임률 → vfr 아님 (최대 어긋남 ' + r.dev + 'ms)');
  ok(Math.abs(r.sec - r.uni) < 0.02, '마지막 프레임 시각 = 번호/fps (' + r.sec.toFixed(3) + ' ≈ ' + r.uni.toFixed(3) + ')');
  // 클립을 원본 끝까지 늘리고, 1100번째 원본 프레임의 영상 시각과 소리 시작이 같은지
  const s = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0], m = P.media(c.media), S = KMV_MEDIA.get(m.id); P.trim(c.id, 'out', 100000); const c2 = P.data.V[0];
    const t = c2.at + Math.round((1100 - c2.in) / S.fps * P.FPS);          // 타임라인에서 원본 1100번 프레임이 나올 때
    const idx = P.srcFrame(c2, t), a = P.data.A1[0], sg = KMV_AUDIO.segments(a, c2, m)[0];
    const audioSec = sg.src + (t - sg.tl) / P.FPS * sg.rate;                // 그때 소리가 재생하는 원본 초
    return { out: c2.out, dur: c2.dur, idx, videoSec: S.secOf(idx), audioSec, naive30: idx / 30 }; });
  ok(s.out === 1199, '원본 끝까지 늘림 (out ' + s.out + ', 타임라인 ' + s.dur + '프레임)');
  ok(Math.abs(s.idx - 1100) <= 1 && Math.abs(s.videoSec - s.audioSec) < 0.04, '원본 1100번 프레임 때 영상 시각 ' + s.videoSec.toFixed(3) + 's = 소리 ' + s.audioSec.toFixed(3) + 's (30 으로 셌다면 ' + s.naive30.toFixed(3) + 's — ' + ((s.videoSec - s.naive30) * 1000).toFixed(0) + 'ms 어긋났을 것)');
}
// ---- 2) 가변 프레임률 원본 (앞 10초만 프레임이 듬성듬성) ----
await page.evaluate(() => { const P = KMV_PROJECT; P.data.V.slice().forEach(c => P.removeClip(c.id)); });
await page.setInputFiles('#fileIn', [path.join(FX, 'vfr.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
{
  const r = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0], m = P.media(c.media), S = KMV_MEDIA.get(m.id); P.trim(c.id, 'out', 100000); const c2 = P.data.V[0];
    const t = c2.at + 240;                                                   // 타임라인 8초
    const idx = P.srcFrame(c2, t), a = P.data.A1[0], sg = KMV_AUDIO.segments(a, c2, m)[0];
    const naive = c2.in + Math.floor(240 / c2.dur * (c2.out - c2.in));
    return { fps: S.fps, vfr: S.vfr, dev: S.vfrDevMs, frames: S.frames, idx, naive, videoSec: S.secOf(idx), naiveSec: S.secOf(naive), audioSec: sg.src + 240 / P.FPS * sg.rate, i10: S.idxAtSec(10), t10: S.secOf(S.idxAtSec(10)) }; });
  ok(r.vfr && r.dev > 500, '가변 프레임률 감지 (평균 ' + r.fps + 'fps, 최대 어긋남 ' + r.dev + 'ms)');
  ok(Math.abs(r.t10 - 10) < 0.05, '10초 → 프레임 ' + r.i10 + ' (시각 ' + r.t10.toFixed(3) + 's)');
  ok(Math.abs(r.videoSec - r.audioSec) < 0.05, '타임라인 8초: 영상 프레임 ' + r.idx + '(' + r.videoSec.toFixed(3) + 's) = 소리 ' + r.audioSec.toFixed(3) + 's');
  ok(Math.abs(r.naiveSec - r.audioSec) > 0.5, '번호 비례로 골랐다면 프레임 ' + r.naive + '(' + r.naiveSec.toFixed(3) + 's) — ' + ((r.naiveSec - r.audioSec) * 1000).toFixed(0) + 'ms 어긋남 (고쳐짐)');
  // 정지 미리보기가 그려지는지(timeIdx 를 거친 프레임이 디코드되는지)
  await page.evaluate(() => KMV_UI.setPH(240)); await page.waitForTimeout(900);
  const px = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); return Array.from(c.getImageData(960, 540, 1, 1).data); });
  ok(px[3] > 0 && (px[0] + px[1] + px[2]) > 0, '8초 자리 미리보기가 그려짐 (' + px.join(',') + ')');
  // 내보내기 짧게 (소리 포함) — 오류 없이 끝나는지
  const ex = await page.evaluate(async () => { const P = KMV_PROJECT; const c = P.data.V[0]; P.trim(c.id, 'out', c.in + 40); try { const r = await KMV_EXPORT.exportMP4({ quality: 'light' }); return { ok: !!r, sec: r && r.seconds, dur: P.data.V[0].dur, blobs: window.__exp.blobs.length }; } catch (e) { return { err: String(e) }; } });
  ok(ex.ok && !ex.err, '가변 프레임률 원본 1.5초 내보내기 완료 (' + (ex.err || ex.sec + 's · ' + ex.dur + '프레임 · 파일 ' + ex.blobs + '개') + ')');
}
ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
