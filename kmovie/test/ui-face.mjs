// 케이무비 58단계 검증: 얼굴 가리기(초상권) — 실 MediaPipe 모델로 합성 얼굴 2개 탐지, 모자이크/흐리게 픽셀, 세기, 자동 끔,
// 직접 가리기 칸(추가·화면 끌기·모서리 크기·Ctrl+Z·삭제), 앞뒤 창 합치기(HOLD), 내보내기 결정성, 분할 유지, 새로고침 복원, 콘솔 오류 0.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-face.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8793);
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

await page.evaluate(() => {
  window.__shot = t => { const P = KMV_PROJECT, W = P.w(), H = P.h(); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); KMV_RENDER.draw(cx, W, H, t || 0); return cx.getImageData(0, 0, W, H).data; };
  window.__shotExact = async t => { const P = KMV_PROJECT, W = P.w(), H = P.h(); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); await KMV_RENDER.drawExact(cx, W, H, t || 0); return cx.getImageData(0, 0, W, H).data; };
  /* 상자(화면 비율) 안·밖에서 두 그림이 얼마나 다른지 — 평균 절대차 */
  window.__diff = (a, b, W, H, r, inside) => { const rs = Array.isArray(r) ? r : [r]; let s = 0, k = 0; for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) { const inR = rs.some(r => x >= r.x * W && x < (r.x + r.w) * W && y >= r.y * H && y < (r.y + r.h) * H); if (inR !== inside) continue; const i = (y * W + x) * 4; s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); k++; } return k ? s / k / 3 : 0; };
  /* 칸 크기 — 상자 안 가로줄에서 같은 색이 이어지는 평균 길이(px) */
  window.__runlen = (d, W, H, r) => { let runs = 0, len = 0; for (let y = Math.round(r.y * H); y < (r.y + r.h) * H; y += 4) { let x0 = Math.round(r.x * W); for (let x = x0 + 1; x < (r.x + r.w) * W; x++) { const i = (y * W + x) * 4, j = i - 4; if (d[i] !== d[j] || d[i + 1] !== d[j + 1] || d[i + 2] !== d[j + 2]) { runs++; len += x - x0; x0 = x; } } } return runs ? len / runs : 0; };
  /* 모자이크 정도 — 상자 안에서 가로 이웃 픽셀이 같은 비율 */
  window.__blocky = (d, W, H, r) => { let same = 0, k = 0; for (let y = Math.round(r.y * H); y < (r.y + r.h) * H; y += 2) for (let x = Math.round(r.x * W); x + 1 < (r.x + r.w) * W; x++) { const i = (y * W + x) * 4, j = i + 4; if (d[i] === d[j] && d[i + 1] === d[j + 1] && d[i + 2] === d[j + 2]) same++; k++; } return k ? same / k : 0; };
});

/* ---------- 1. 원본 가져오기 → 클립 · 얼굴 가리기 켜기 ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'face.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.waitForFunction(() => { const m = KMV_PROJECT.data.media[0]; const s = KMV_MEDIA.get(m.id); return s && s.analyzed; }, null, { timeout: 120000 });
const W = await page.evaluate(() => KMV_PROJECT.w()), H = await page.evaluate(() => KMV_PROJECT.h());
await page.evaluate(async () => { KMV_UI.select(KMV_PROJECT.data.V[0].id); KMV_UI.setPH(0); await new Promise(r => setTimeout(r, 300)); window.__b0 = __shot(0); });
ok(await page.evaluate(() => !document.getElementById('rowFace').classList.contains('hidden') && document.getElementById('faceBody').classList.contains('hidden')), '클립 설정에 「얼굴 가리기」 행 · 켜기 전엔 세부 숨김');
await page.click('#faceSeg button[data-k="mosaic"]'); await page.waitForTimeout(100);
const f0 = await page.evaluate(() => KMV_PROJECT.data.V[0].face);
ok(f0 && f0.mode === 'mosaic' && f0.level === 'b' && f0.auto === true && f0.rects.length === 0, '모자이크 켜기 → face {mosaic, 보통, 자동, 직접 칸 0}');
ok(await page.evaluate(() => !document.getElementById('faceBody').classList.contains('hidden') && document.getElementById('tgFaceAuto').classList.contains('on')), '세부 행 보임 · 자동 토글 켜짐');

/* ---------- 2. 실모델 탐지 — 합성 얼굴 2개 ---------- */
await page.waitForFunction(() => { const c = KMV_PROJECT.data.V[0]; return KMV_FACE.cached(c.media, c.in); }, null, { timeout: 60000 });
const det = await page.evaluate(() => { const c = KMV_PROJECT.data.V[0]; return { st: KMV_FACE.status(), raw: KMV_FACE.cached(c.media, c.in), boxes: KMV_FACE.boxesAt(c.media, c.in) }; });
ok(det.st === 'ready' && det.raw.length === 2, '모델 로드 → 첫 프레임에서 얼굴 2개 탐지 (' + det.raw.map(b => Math.round(b.w * 640) + '×' + Math.round(b.h * 360)).join(', ') + ')');
const big = det.raw.slice().sort((a, b) => b.w - a.w)[0], small = det.raw.slice().sort((a, b) => a.w - b.w)[0];
ok(Math.abs(big.x + big.w / 2 - 120 / 640) < 0.06 && Math.abs(big.y + big.h / 2 - 150 / 360) < 0.08 && Math.abs(small.x + small.w / 2 - 560 / 640) < 0.06, '탐지 자리가 그린 자리와 맞음 (큰 얼굴 ' + (big.x + big.w / 2).toFixed(2) + ',' + (big.y + big.h / 2).toFixed(2) + ' · 작은 얼굴 ' + (small.x + small.w / 2).toFixed(2) + ')');
ok(det.boxes.length === 2 && det.boxes.every(b => b.w > big.w * 0.9 || b.w > small.w * 1.3), '덮개 상자는 얼굴보다 넉넉히(가로 1.5·세로 1.8)');
// 정지 미리보기가 정확해진다(facePending 해소)
await page.waitForFunction(() => { const P = KMV_PROJECT, W = P.w(), H = P.h(); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return KMV_RENDER.draw(cv.getContext('2d'), W, H, 0).exact; }, null, { timeout: 30000 });
ok(true, '정지 미리보기 exact (탐지 대기 뒤 다시 그림)');

/* ---------- 3. 픽셀 — 얼굴 자리만 바뀌고 나머지는 그대로 ---------- */
const inBox = (() => { const b = det.boxes.slice().sort((a, b) => b.w - a.w)[0]; return { x: b.x + b.w * 0.15, y: b.y + b.h * 0.15, w: b.w * 0.7, h: b.h * 0.7 }; })();
const allBoxes = det.boxes.map(b => ({ x: b.x - 0.01, y: b.y - 0.01, w: b.w + 0.02, h: b.h + 0.02 }));
const cov = await page.evaluate(([b, all]) => { const d = __shot(0); const W = KMV_PROJECT.w(), H = KMV_PROJECT.h(); return { inn: __diff(d, __b0, W, H, b, true), out: __diff(d, __b0, W, H, all, false), blocky: __blocky(d, W, H, b) }; }, [inBox, allBoxes]);
ok(cov.inn > 6, '모자이크: 얼굴 상자 안이 원본과 달라짐 (평균차 ' + cov.inn.toFixed(1) + ')');
ok(cov.out < 1.0, '얼굴 상자 밖은 원본 그대로 (평균차 ' + cov.out.toFixed(2) + ')');
const b0 = await page.evaluate(b => __blocky(__b0, KMV_PROJECT.w(), KMV_PROJECT.h(), b), inBox);
ok(cov.blocky > 0.85 && cov.blocky > b0 + 0.2, '모자이크는 칸으로 뭉쳐 있다 (이웃 같은 비율 ' + Math.round(cov.blocky * 100) + '% vs 원본 ' + Math.round(b0 * 100) + '%)');
// 세기: 많이 > 조금 (칸 크기)
await page.click('#faceLvSeg button[data-k="c"]'); await page.waitForTimeout(80);
const bc = await page.evaluate(b => __runlen(__shot(0), KMV_PROJECT.w(), KMV_PROJECT.h(), b), inBox);
await page.click('#faceLvSeg button[data-k="a"]'); await page.waitForTimeout(80);
const ba = await page.evaluate(b => __runlen(__shot(0), KMV_PROJECT.w(), KMV_PROJECT.h(), b), inBox);
ok(bc > ba * 1.8 && (await page.evaluate(() => KMV_PROJECT.data.V[0].face.level)) === 'a', '세기 많이(칸 ' + bc.toFixed(0) + 'px) > 조금(칸 ' + ba.toFixed(0) + 'px)');
// 흐리게: 상자 안이 달라지되 칸으로 뭉치진 않음
await page.click('#faceSeg button[data-k="blur"]'); await page.waitForTimeout(80);
const bl = await page.evaluate(([b, all]) => { const d = __shot(0); const W = KMV_PROJECT.w(), H = KMV_PROJECT.h(); return { inn: __diff(d, __b0, W, H, b, true), out: __diff(d, __b0, W, H, all, false), blocky: __blocky(d, W, H, b), mode: KMV_PROJECT.data.V[0].face.mode }; }, [inBox, allBoxes]);
ok(bl.mode === 'blur' && bl.inn > 3 && bl.out < 1.0 && bl.blocky < cov.blocky - 0.2, '흐리게: 상자 안 달라짐(' + bl.inn.toFixed(1) + ') · 밖 그대로 · 칸 아님(' + Math.round(bl.blocky * 100) + '%)');
// 자동 끔 → 원본 그대로
await page.click('#tgFaceAuto'); await page.waitForTimeout(80);
const off = await page.evaluate(b => { const d = __shot(0); return { inn: __diff(d, __b0, KMV_PROJECT.w(), KMV_PROJECT.h(), b, true), auto: KMV_PROJECT.data.V[0].face.auto }; }, inBox);
ok(off.auto === false && off.inn < 0.5, '자동 끔 → 얼굴 자리도 원본 그대로 (평균차 ' + off.inn.toFixed(2) + ')');
await page.click('#faceSeg button[data-k="mosaic"]'); await page.click('#faceLvSeg button[data-k="b"]'); await page.waitForTimeout(80);   // 자동은 끈 채 — 직접 칸만 본다

/* ---------- 4. 직접 가리기 칸 — 추가 · 화면 끌기 · 모서리 · Ctrl+Z · 삭제 ---------- */
await page.click('#btnFaceRect'); await page.waitForTimeout(100);
const r1 = await page.evaluate(() => KMV_PROJECT.data.V[0].face.rects[0]);
ok(r1 && Math.abs(r1.x - 0.4) < 1e-6 && Math.abs(r1.w - 0.2) < 1e-6, '＋ 가리기 칸 → 화면 가운데 0.2×0.3 네모');
const rc = await page.evaluate(sm => { const P = KMV_PROJECT, c = P.data.V[0]; P.updateFaceRect(c.id, 0, { x: sm.x, y: sm.y, w: sm.w, h: sm.h }); const d = __shot(0); const W = P.w(), H = P.h(); const inr = { x: sm.x + 0.01, y: sm.y + 0.01, w: sm.w - 0.02, h: sm.h - 0.02 }; const r = { inn: __diff(d, __b0, W, H, inr, true), out: __diff(d, __b0, W, H, sm, false), blocky: __blocky(d, W, H, inr), sel: document.getElementById('faceRectV').textContent }; P.updateFaceRect(c.id, 0, { x: 0.4, y: 0.3, w: 0.2, h: 0.3 }); return r; }, det.boxes.slice().sort((a, b) => a.w - b.w)[0]);
ok(rc.inn > 6 && rc.out < 0.5 && rc.blocky > 0.85 && /1개/.test(rc.sel), '직접 칸(자동 끔, 작은 얼굴 위로 옮김) 안만 모자이크 (안 ' + rc.inn.toFixed(1) + ' · 밖 ' + rc.out.toFixed(2) + ') · 설정 열 「칸 1개」');
{
  const c = await page.evaluate(() => { const pv = document.getElementById('preview'), r = pv.getBoundingClientRect(); const W = KMV_PROJECT.w(), H = KMV_PROJECT.h(); const k = Math.max(W / r.width, H / r.height); return { ox: r.left + (r.width - W / k) / 2, oy: r.top + (r.height - H / k) / 2, k, W, H }; });
  const sx = c.ox + 0.5 * c.W / c.k, sy = c.oy + 0.45 * c.H / c.k;
  await page.mouse.move(sx, sy); await page.waitForTimeout(40);
  const cur1 = await page.evaluate(() => document.getElementById('preview').style.cursor);
  await page.mouse.down(); await page.mouse.move(sx - 0.2 * c.W / c.k, sy - 0.1 * c.H / c.k, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(150);
  const r2 = await page.evaluate(() => KMV_PROJECT.data.V[0].face.rects[0]);
  ok(cur1 === 'move' && Math.abs(r2.x - 0.2) < 0.01 && Math.abs(r2.y - 0.2) < 0.01, '재생 화면에서 몸통 끌기 → 칸 이동 (커서 move, x ' + r2.x.toFixed(2) + ' y ' + r2.y.toFixed(2) + ')');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(100);
  const r3 = await page.evaluate(() => KMV_PROJECT.data.V[0].face.rects[0]);
  ok(Math.abs(r3.x - 0.4) < 1e-6 && Math.abs(r3.y - 0.3) < 1e-6, 'Ctrl+Z 한 번에 원래 자리');
  const gx = c.ox + (0.6 * c.W - 6) / c.k, gy = c.oy + (0.6 * c.H - 6) / c.k;
  await page.mouse.move(gx, gy); await page.waitForTimeout(40);
  const cur2 = await page.evaluate(() => document.getElementById('preview').style.cursor);
  await page.mouse.down(); await page.mouse.move(gx + 0.1 * c.W / c.k, gy + 0.1 * c.H / c.k, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(150);
  const r4 = await page.evaluate(() => KMV_PROJECT.data.V[0].face.rects[0]);
  ok(cur2 === 'nwse-resize' && Math.abs(r4.w - 0.3) < 0.01 && Math.abs(r4.h - 0.4) < 0.01 && Math.abs(r4.x - 0.4) < 1e-6, '오른쪽 아래 모서리 끌기 → 크기 (0.2×0.3 → ' + r4.w.toFixed(2) + '×' + r4.h.toFixed(2) + ', 왼쪽 위 고정)');
}
await page.click('#btnFaceRect'); await page.waitForTimeout(80);
ok((await page.evaluate(() => KMV_PROJECT.data.V[0].face.rects.length)) === 2 && !(await page.evaluate(() => document.getElementById('btnFaceRectDel').classList.contains('hidden'))), '두 번째 칸 추가 · ✕ 보임');
await page.click('#btnFaceRectDel'); await page.waitForTimeout(80);
ok((await page.evaluate(() => KMV_PROJECT.data.V[0].face.rects.length)) === 1, '✕ → 고른 칸 삭제 (1개 남음)');

await page.click('#tgFaceAuto'); await page.waitForTimeout(50);
ok((await page.evaluate(() => KMV_PROJECT.data.V[0].face.auto)) === true, '자동 다시 켬');

/* ---------- 5. 앞뒤 창 합치기(HOLD) — 한 프레임 놓쳐도 이웃 탐지가 덮는다 ---------- */
const hold = await page.evaluate(async () => {
  const c = KMV_PROJECT.data.V[0], F = KMV_FACE, s = KMV_MEDIA.get(c.media);
  F.clear(c.media);
  const f3 = await s.getFrame(c.in + 3, false), f9 = await s.getFrame(c.in + 9, false);
  await F.detect(c.media, c.in + 3, f3); await F.detect(c.media, c.in + 9, f9);
  const at6 = F.boxesAt(c.media, c.in + 6), at20 = F.boxesAt(c.media, c.in + 20), at40 = F.boxesAt(c.media, c.in + 40);
  return { n3: F.cached(c.media, c.in + 3).length, at6: at6.length, at20: at20.length, at40: at40.length, pend6: F.pending(c.media, c.in + 6), w6: at6.map(b => b.w) };
});
ok(hold.n3 === 2 && hold.at6 === 2 && hold.pend6 === true, '3·9 프레임만 탐지 → 6 프레임 덮개는 이웃 합집합으로 2개 (자기 프레임은 아직 대기)');
ok(hold.at20 === 2 && hold.at40 === 0, '창 밖(20)은 가까운 프레임(15 안) 것 · 더 먼 프레임(40)은 없음');

/* ---------- 6. 내보내기 — 모든 프레임 정확 탐지 · 결정적 ---------- */
const ex = await page.evaluate(async () => {
  const c = KMV_PROJECT.data.V[0], F = KMV_FACE; F.clear(c.media);
  const t0 = performance.now(); const W = KMV_PROJECT.w(), H = KMV_PROJECT.h();
  const shots = []; for (let t = 0; t < 12; t++) shots.push(await __shotExact(t));
  const ms = (performance.now() - t0) / 12;
  const filled = []; for (let i = 0; i <= 11 + F.HOLD; i++) filled.push(!!F.cached(c.media, c.in + i));
  const again = await __shotExact(5);
  let d = 0; for (let i = 0; i < again.length; i += 4) d += Math.abs(again[i] - shots[5][i]);
  // 얼굴이 지나가는 큰 상자(첫 12프레임 동안 x 120→160) 안이 매 프레임 덮여 있나
  const covered = shots.map(s => __blocky(s, W, H, { x: 0.12, y: 0.32, w: 0.12, h: 0.24 }));
  return { ms, filled, allFilled: filled.every(v => v), same: d === 0, covered: covered.map(v => Math.round(v * 100)), size: F.cacheSize() };
});
ok(ex.allFilled, '내보내기 12프레임 → 0~' + (11 + 6) + ' 프레임 전부 탐지 캐시에 있음 (앞 ' + 6 + '프레임 미리)');
ok(ex.covered.every(v => v > 80), '매 프레임 얼굴 자리가 모자이크로 덮여 있음 (' + ex.covered.join(' ') + '%)');
ok(ex.same, '같은 프레임을 다시 내보내면 픽셀이 같다 (결정적)');
console.log('  ℹ 프레임당 내보내기(탐지 포함) ' + ex.ms.toFixed(0) + 'ms — xvfb 소프트웨어 GL 기준');

/* ---------- 7. 분할 · 배지 · 새로고침 복원 ---------- */
await page.evaluate(() => { KMV_UI.setPH(30); KMV_PROJECT.split(30); });
const sp = await page.evaluate(() => KMV_PROJECT.data.V.map(c => c.face ? c.face.mode + '/' + c.face.rects.length : 'none'));
ok(sp.length === 2 && sp[0] === 'mosaic/1' && sp[1] === 'mosaic/1', '분할해도 양쪽에 얼굴 가리기 유지 (' + sp.join(', ') + ')');
await page.waitForTimeout(700); await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_PROJECT.data.V.length === 2, null, { timeout: 60000 });
const re = await page.evaluate(() => KMV_PROJECT.data.V[0].face);
ok(re && re.mode === 'mosaic' && re.level === 'b' && re.rects.length === 1 && Math.abs(re.rects[0].w - 0.3) < 0.01, '새로고침 복원: 모드·세기·직접 칸');
await page.evaluate(() => { KMV_UI.select(KMV_PROJECT.data.V[0].id); KMV_UI.setPH(0); });
await page.click('#faceSeg button[data-k="none"]'); await page.waitForTimeout(80);
ok((await page.evaluate(() => KMV_PROJECT.data.V[0].face)) === undefined, '없음 → face 지움');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
