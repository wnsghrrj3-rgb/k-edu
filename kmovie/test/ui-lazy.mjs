// 케이무비 구간 읽기(지연 로드) 검증 — 원본을 통째로 안 올리고 moov(샘플 표)만 읽은 뒤
// GOP·오디오 구간 바이트를 blob.slice 로 필요할 때만 읽는 경로.
// 정답지: 오디오는 decodeAudioData(예전 방식)와 샘플 비교, 조각 mp4 는 통 읽기 폴백 확인.
// 준비: bash make-fixtures.sh (fx/a.mp4, fx/big.mp4, fx/frag.mp4) · npm i mp4box@0.5.2 mp4-muxer@5.2.1
// 실행: node test/ui-lazy.mjs  (KMV_ELECTRON=<electron> 이면 Electron)
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8779);
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
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

// ---------- 상한·안내문 ----------
ok(await page.evaluate(() => KMV_MEDIA.limits.maxSec === 60 * 60), '브라우저판 원본 상한 60분');
ok(await page.evaluate(() => document.getElementById('empty').textContent.includes('60분')), '빈 화면 안내문에 60분');

// ---------- a.mp4 (moov 뒤): 지연 열기 — 샘플 바이트 미보유 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
const lz = await page.evaluate(() => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id);
  const noData = s.dec.every(x => !x.data), hasOff = s.dec.every(x => x.off >= 0 && x.size > 0);
  const pk = s.pcm ? { noData: s.pcm.pk.every(x => !x.data), hasOff: s.pcm.pk.every(x => x.off >= 0 && x.size > 0), blob: !!s.pcm.blob } : null;
  return { lazy: !!s.lazy, noData, hasOff, frames: s.frames, pcm: !!s.pcm, pk };
});
ok(lz.lazy, '지연 열기 (src.lazy)');
ok(lz.noData && lz.hasOff, '영상 샘플: data 없음 · off/size 만 (' + lz.frames + '장)');
ok(lz.pcm && lz.pk.noData && lz.pk.hasOff && lz.pk.blob, '소리 샘플: data 없음 · 구간은 blob 에서');

// ---------- 프레임: 지연 바이트로 디코드된 그림이 실제로 나오는지 ----------
const px = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id);
  const grab = async idx => {
    const f = await s.getFrame(idx);
    if (!f) return null;
    const cv = new OffscreenCanvas(64, 36), ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(f, 0, 0, 64, 36);
    return Array.from(ctx.getImageData(0, 0, 64, 36).data);
  };
  const a = await grab(0), b = await grab(120);
  if (!a || !b) return { ok: false };
  let sumA = 0, diff = 0;
  for (let i = 0; i < a.length; i += 4) { sumA += a[i] + a[i + 1] + a[i + 2]; diff += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]); }
  return { ok: true, lit: sumA / (a.length / 4) > 30, diff: diff / (a.length / 4) };
});
ok(px.ok && px.lit, '프레임 0 디코드 — 그림 있음');
ok(px.diff > 8, '프레임 0 ≠ 프레임 120 — 구간별 바이트가 제대로 (' + (px.diff | 0) + ')');

// ---------- 소리: 지연 구간 디코드 = decodeAudioData(예전 방식) ----------
const au = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id), sr = 48000;
  if (!s.pcm) return { pcm: false };
  const buf = await (await fetch('/kmovie/test/fx/a.mp4')).arrayBuffer();
  const ref = await new OfflineAudioContext(1, 1, sr).decodeAudioData(buf);
  await s.pcm.ensure(2.0, 4.0);
  const rd = s.pcm.read(2.5, Math.round(0.5 * sr));
  const a = rd.ch[0], b = ref.getChannelData(0);
  let best = { off: 0, d: Infinity };
  for (let off = -16; off <= 16; off++) {
    let d = 0;
    for (let i = 0; i < a.length; i++) { const j = Math.round(2.5 * sr) + i + off; const e = Math.abs(a[i] - (b[j] || 0)); if (e > d) d = e; }
    if (d < best.d) best = { off, d };
  }
  let rms = 0; for (let i = 0; i < a.length; i++) rms += a[i] * a[i]; rms = Math.sqrt(rms / a.length);
  return { pcm: true, rms, off: best.off, d: best.d };
});
ok(au.pcm && au.rms > 0.05, '지연 소리 디코드 — 사인파 살아 있음 (rms ' + au.rms.toFixed(2) + ')');
ok(au.d < 1e-3, '지연 구간 디코드 = decodeAudioData (정렬 ' + au.off + '샘플 · 최대 오차 ' + au.d.toExponential(1) + ')');

// ---------- 분석: 지연 바이트로 전체 훑기(썸네일·모션·파형) 완료 ----------
const an = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id);
  KMV_MEDIA.analyze(m.id);                                       // 가져오기 때 이미 돌고 있으면 그대로
  const t0 = performance.now();
  while (!s.analyzed && performance.now() - t0 < 60000) await new Promise(r => setTimeout(r, 100));
  const pk = s.peaks ? Math.max(...s.peaks) : 0;
  return { analyzed: s.analyzed, thumbs: s.thumbs.filter(Boolean).length, peaks: pk, motion: !!s.motion };
});
ok(an.analyzed && an.thumbs >= 5 && an.motion, '분석 완료 — 썸네일 ' + an.thumbs + '장 · 모션량');
ok(an.peaks > 0.05, '분석 파형 — 소리 잡힘 (' + an.peaks.toFixed(2) + ')');

// ---------- 재생: 스트림이 지연 바이트로 따라오는지 ----------
const play = await page.evaluate(async () => {
  KMV_UI.setPH(0); KMV_UI.play();
  await new Promise(r => setTimeout(r, 1500));
  const adv = KMV_UI.ph; KMV_UI.stop();
  return { adv };
});
ok(play.adv > 20, '재생 시계 진행 (' + Math.round(play.adv) + 'f)');

// ---------- big.mp4 (faststart — moov 앞): 지연 열기 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'big.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.media.length === 2, null, { timeout: 120000 });
const ff = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[1], s = KMV_MEDIA.get(m.id);
  const f = await s.getFrame(30);
  return { lazy: !!s.lazy, w: s.w, frame: !!f };
});
ok(ff.lazy && ff.w === 1920 && ff.frame, 'moov 가 앞인 파일(faststart)도 지연 열기 + 프레임');

// ---------- frag.mp4 (조각 mp4): 통 읽기 폴백 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'frag.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.media.length === 3, null, { timeout: 90000 });
const fb = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[2], s = KMV_MEDIA.get(m.id);
  const f = await s.getFrame(10);
  return { lazy: !!s.lazy, frame: !!f, frames: s.frames };
});
ok(!fb.lazy && fb.frame && fb.frames > 30, '조각 mp4 → 통 읽기 폴백으로 열림 (lazy=false, ' + fb.frames + '장)');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 2).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과${fail ? ' — 실패 ' + fail : ''}`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
