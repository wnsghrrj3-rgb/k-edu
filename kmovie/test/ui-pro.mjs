// 케이무비 — 프로 편집기 단골 기술 1차: 속도 램프(타임 리맵 곡선 + 소리 배속 곡선)·잡음 줄이기(스펙트럴 게이트, 룸톤 지문).
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-pro.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8774);
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
await page.route('**/fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

/* ---------- 1. 속도 램프 — 매핑 수학 ---------- */
const R = await page.evaluate(() => {
  const P = KMV_PROJECT, mk = ramp => ({ speed: 'slow', ramp, in: 0, out: 120, at: 0, dur: 240, media: 'x' });
  const c0 = mk(undefined), c1 = mk('normal'), c2 = mk('long');
  const seq = c => { const a = []; for (let t = 0; t < 240; t++) a.push(P.srcFrame(c, t)); return a; };
  const s0 = seq(c0), s1 = seq(c1), s2 = seq(c2);
  const mono = a => a.every((v, i) => !i || v >= a[i - 1]);
  const stepAvg = (a, i0, i1) => (a[i1] - a[i0]) / (i1 - i0);
  return {
    sameEnds: s0[0] === s1[0] && s0[239] === s1[239] && s1[239] === 119,
    mono: mono(s1) && mono(s2),
    edgeFast: stepAvg(s1, 0, 20) > stepAvg(s1, 110, 130) * 1.5,             // 양 끝은 빠르고 가운데는 느리다
    longSlower: stepAvg(s2, 110, 130) < stepAvg(s1, 110, 130),              // 램프가 길수록 가운데가 더 느리다
    rate0: P.rateAt(c1, 0), rateMid: P.rateAt(c1, 0.5), rateNone: P.rateAt(c0, 0.5),
    hitUnchanged: P.srcFrame({ speed: 'hit', ramp: 'normal', in: 0, out: 120, at: 0, dur: 288 }, 100) === P.srcFrame({ speed: 'hit', in: 0, out: 120, at: 0, dur: 288 }, 100),
    normalUnchanged: P.srcFrame({ speed: 'normal', ramp: 'long', in: 0, out: 120, at: 0, dur: 120 }, 50) === 50,
  };
});
ok(R.sameEnds && R.mono, '램프 — 시작·끝 원본 프레임은 그대로(길이 불변), 단조 증가');
ok(R.edgeFast && R.longSlower, '램프 — 양 끝은 빠르게 들어가고 가운데가 슬로(길게 = 더 깊게)');
ok(R.rate0 > R.rateMid && Math.abs(R.rateNone - 0.5) < 1e-9, `소리 배속 곡선 — 시작 ${R.rate0.toFixed(2)}× → 가운데 ${R.rateMid.toFixed(2)}× (램프 없으면 0.5× 고정)`);
ok(R.hitUnchanged && R.normalUnchanged, '히트 슬로·정속은 램프 영향 없음');

/* ---------- 2. 잡음 줄이기 — 합성 신호로 SNR ---------- */
const D = await page.evaluate(() => {
  const sr = 48000, N = sr * 3, sig = new Float32Array(N), noise = new Float32Array(sr * 1.5);
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 - 0.5; };
  for (let i = 0; i < noise.length; i++) noise[i] = rnd() * 0.12;                             // 잡음 지문(조용한 구간 = 잡음만)
  const clean = new Float32Array(N), nz = new Float32Array(N);
  for (let i = 0; i < N; i++) { const t = i / sr; clean[i] = 0.4 * Math.sin(2 * Math.PI * 440 * t) * (t < 1.5 ? 1 : 0); nz[i] = rnd() * 0.12; sig[i] = clean[i] + nz[i]; }
  const prof = KMV_AUDIO.profileFrom([noise], sr);
  const rms = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / (b - a)); };
  const before = { tone: rms(sig, sr * 0.2, sr * 1.3), quiet: rms(sig, sr * 1.8, sr * 2.9) };
  const y = sig.slice(); KMV_AUDIO.denoiseBuf([y], prof, 'light');
  const y2 = sig.slice(); KMV_AUDIO.denoiseBuf([y2], prof, 'strong');
  const after = { tone: rms(y, sr * 0.2, sr * 1.3), quiet: rms(y, sr * 1.8, sr * 2.9) }, strong = { quiet: rms(y2, sr * 1.8, sr * 2.9), tone: rms(y2, sr * 0.2, sr * 1.3) };
  let fin = true; for (let i = 0; i < N; i++) if (!isFinite(y[i])) fin = false;
  return { before, after, strong, fin, snrBefore: before.tone / before.quiet, snrAfter: after.tone / after.quiet };
});
ok(D.fin && D.after.quiet < D.before.quiet * 0.4, `잡음 구간 RMS ${D.before.quiet.toFixed(4)} → ${D.after.quiet.toFixed(4)} (약하게)`);
ok(D.after.tone > D.before.tone * 0.8, `신호는 살아남음 ${D.before.tone.toFixed(3)} → ${D.after.tone.toFixed(3)}`);
ok(D.strong.quiet < D.after.quiet, `강하게는 더 줄임 (${D.strong.quiet.toFixed(4)})`);
ok(D.snrAfter > D.snrBefore * 2, `SNR ${D.snrBefore.toFixed(1)} → ${D.snrAfter.toFixed(1)}`);

/* ---------- 3. 실 파이프 — 클립에 걸어 믹스·재생 ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4'), path.join(FX, 'au.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length >= 2 && KMV_MEDIA.get(KMV_PROJECT.data.V[1].media) && KMV_MEDIA.get(KMV_PROJECT.data.V[1].media).analyzed, null, { timeout: 90000 });
const Pn = await page.evaluate(async () => {
  const P = KMV_PROJECT, c = P.data.V[1], A = KMV_AUDIO;
  const rms = b => { const d = b.getChannelData(0); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; return Math.sqrt(s / d.length); };
  const win = A.quietWindow(c.media);
  const base = rms(await A.renderMix(P.total()));
  P.setDenoise(c.id, 'strong');
  const prof = await A.noiseProfile(c.media);
  const den = rms(await A.renderMix(P.total()));
  P.setDenoise(c.id, 'none');
  P.setSpeed(c.id, 'slow'); P.setRamp(c.id, 'normal');
  const rampMix = await A.renderMix(P.total());
  const t0 = await A.play(c.at); await new Promise(r => setTimeout(r, 900)); const f = A.now(); A.stop();
  P.setRamp(c.id, 'none'); P.setSpeed(c.id, 'normal');
  return { win: !!win, prof: !!(prof && prof.ch && prof.ch[0].length === 513), base, den, rampLen: rampMix.length, played: t0 != null && f > c.at + 10, ramp: c.ramp, badge: !!document.getElementById('timeline') };
});
ok(Pn.win && Pn.prof, '실 원본에서 조용한 구간 → 잡음 지문(513빈)');
ok(Pn.den < Pn.base && Pn.den > 0, `잡음 줄이기 켠 믹스가 조용해짐 (${Pn.base.toFixed(4)} → ${Pn.den.toFixed(4)})`);
ok(Pn.rampLen > 0 && Pn.played, '램프 클립 — 믹스 렌더·재생(배속 곡선) 오류 없이 진행');

/* ---------- 4. UI ---------- */
const U = await page.evaluate(() => {
  const P = KMV_PROJECT, c = P.data.V[1]; KMV_UI.select(c.id);
  const vis = id => document.getElementById(id).getBoundingClientRect().height > 0;
  const r0 = vis('rowRamp');
  document.getElementById('speedSeg').querySelector('[data-k="slow"]').click();
  const r1 = vis('rowRamp');
  document.getElementById('rampSeg').querySelector('[data-k="long"]').click();
  const ramp = P.clip(c.id).ramp;
  document.getElementById('denoiseSeg').querySelector('[data-k="light"]').click();
  const dn = P.clip(c.id).denoise, dnVis = vis('rowDenoise');
  document.getElementById('speedSeg').querySelector('[data-k="normal"]').click();
  const r2 = vis('rowRamp');
  return { r0, r1, ramp, dn, dnVis, r2, undoOK: (() => { P.undo(); P.undo(); P.undo(); return !P.clip(c.id).denoise && !P.clip(c.id).ramp; })() };
});
ok(!U.r0 && U.r1 && !U.r2, '램프 줄은 슬로·타임랩스일 때만');
ok(U.ramp === 'long' && U.dn === 'light' && U.dnVis, '램프·잡음 세그 → 클립 저장');
ok(U.undoOK, 'undo 로 되돌아감');


/* ---------- 5. 색 맞춤(그레이 월드) ---------- */
const CM = await page.evaluate(async () => {
  const P = KMV_PROJECT, L = KMV_LOOK, c = P.data.V[0];
  // 원본을 따뜻한 쪽으로 기운 것처럼 통계를 흉내 — resolve 가 채널 게인을 내놓는지
  const src = KMV_MEDIA.get(c.media); const st0 = L.stats ? L.stats(c.media) : null;
  P.setProjectLook({ colorMatch: false }); const off = L.resolve(c, P.data.look).wb;
  P.setProjectLook({ colorMatch: true }); const on = L.resolve(c, P.data.look).wb;
  const W = 96, H = 54, cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
  ctx.fillStyle = 'rgb(200,150,100)'; ctx.fillRect(0, 0, W, H);
  const p = L.resolve(c, P.data.look); const fake = Object.assign({}, p, { wb: [0.85, 1, 1.2], lut: null, gain: 1, off: 0, bright: 0, contrast: 1, sat: 1, vig: 0 });
  L.applyCPU(ctx, W, H, fake); const d = ctx.getImageData(0, 0, 1, 1).data;
  P.setProjectLook({ colorMatch: false });
  return { hasStats: !!(st0 && st0.r != null), off: off.join(','), on: on.map(v => +v.toFixed(3)), px: [d[0], d[1], d[2]] };
});
ok(CM.hasStats && CM.off === '1,1,1', '색 맞춤 — 원본 통계에 채널 평균이 있고, 끄면 게인 1');
ok(CM.on.every(v => v >= 0.8 && v <= 1.25) && CM.on.some(v => v !== 1), `켜면 채널 게인 ${CM.on.join('/')} (0.8~1.25 안)`);
ok(CM.px[0] < 200 && CM.px[2] > 100, `채널 게인이 픽셀에 반영 (200,150,100 → ${CM.px.join(',')})`);

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
