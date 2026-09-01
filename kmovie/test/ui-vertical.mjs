// 케이무비 — 세로 9:16 출력 + 스마트 리프레임(자동 초점) + 부품 무대·자막 세로 대응.
// 준호(설계 v1 잔여): "9:16 세로 출력(스마트 리프레임)".
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-vertical.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8781);
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_REFRAME);

/* 화면에 안 보이는 곳에 프로젝트 크기 캔버스를 만들어 한 프레임 그린다 → 픽셀로 확인 */
await page.evaluate(() => {
  window.__shot = async (t) => {
    const P = KMV_PROJECT, W = P.w(), H = P.h();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    KMV_RENDER.draw(cx, W, H, t || 0);
    const d = cx.getImageData(0, 0, W, H).data;
    const lum = (x, y) => { const i = (Math.round(y) * W + Math.round(x)) * 4; return (d[i] + d[i + 1] + d[i + 2]) / 3; };
    const rowMax = y => { let m = 0; for (let x = 0; x < W; x += 4) m = Math.max(m, lum(x, y)); return m; };
    const colMax = x => { let m = 0; for (let y = 0; y < H; y += 4) m = Math.max(m, lum(x, y)); return m; };
    let sum = 0, cnt = 0; for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) { sum += lum(x, y); cnt++; }
    return { W, H, rowMax, colMax, lum, mean: sum / cnt, data: d };
  };
});

/* ---------- 1. 화면비 모델 ---------- */
const A = await page.evaluate(() => {
  const P = KMV_PROJECT;
  const list = P.ASPECTS.map(a => a.id + ':' + a.w + 'x' + a.h);
  const base = { w: P.w(), h: P.h(), id: P.aspect(), portrait: P.portrait() };
  P.setProjectLook({ cinemaBar: true });
  const changed = P.setAspect('9:16');
  const v = { w: P.w(), h: P.h(), id: P.aspect(), portrait: P.portrait(), bar: !!P.data.look.cinemaBar };
  const again = P.setAspect('9:16');                       // 같은 값이면 아무 일 없음
  P.undo();
  const back = { w: P.w(), h: P.h(), bar: !!P.data.look.cinemaBar };
  P.setProjectLook({ cinemaBar: false });
  const sq = P.setAspect('1:1') && P.aspect() === '1:1' && P.w() === 1080 && P.h() === 1080 && !P.portrait();
  P.setAspect('16:9');
  const bad = P.setAspect('4:3');
  return { list, base, changed, v, again, back, sq, bad, id: P.aspect() };
});
ok(A.list.join(' ') === '16:9:1920x1080 9:16:1080x1920 1:1:1080x1080', '화면비 3종 — ' + A.list.join(' · '));
ok(A.base.id === '16:9' && A.base.w === 1920 && !A.base.portrait, '기본은 가로 16:9 (1920×1080)');
ok(A.changed && A.v.w === 1080 && A.v.h === 1920 && A.v.id === '9:16' && A.v.portrait, '세로로 바꾸면 1080×1920 · portrait');
ok(!A.v.bar, '세로로 바꾸면 시네마 바(2.39:1)는 자동으로 꺼진다');
ok(!A.again && A.back.w === 1920 && A.back.bar, '같은 값은 무시 · Ctrl+Z 로 가로+시네마 바 복원');
ok(A.sq && !A.bad && A.id === '16:9', '정사각 1:1 지원 · 모르는 값은 거절');

/* ---------- 2. 미리보기 캔버스가 화면비를 따라간다 ---------- */
const C = await page.evaluate(() => {
  const P = KMV_PROJECT, pv = document.getElementById('preview'), out = [];
  for (const id of ['9:16', '1:1', '16:9']) { P.setAspect(id); out.push(pv.width + 'x' + pv.height); }
  return { out, fmt: document.getElementById('exFmt').textContent, on: document.querySelector('#aspectSeg button.on').dataset.k, btns: document.querySelectorAll('#aspectSeg button').length };
});
ok(C.out.join(' ') === '1080x1920 1080x1080 1920x1080', '미리보기 캔버스가 화면비를 따라간다 — ' + C.out.join(' · '));
ok(C.btns === 3 && C.on === '16:9' && C.fmt === '1920×1080', '프로젝트 탭 화면비 버튼 3개 · 내보내기 문구가 실제 해상도');

/* ---------- 3. 실 원본 — 초점 찾기 ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4'), path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length >= 2 && KMV_PROJECT.data.V.every(c => { const s = KMV_MEDIA.get(c.media); return s && s.analyzed && s.thumbs.filter(Boolean).length > 1; }), null, { timeout: 90000 });
const F = await page.evaluate(() => {
  const P = KMV_PROJECT, RF = KMV_REFRAME, src = KMV_MEDIA.get(P.data.V[0].media);
  const f0 = RF.focus(src, 0), f0b = RF.focus(src, 0), f1 = RF.focus(src, 60);
  const inRange = v => v.cx >= 0 && v.cx <= 1 && v.cy >= 0 && v.cy <= 1;
  const same = Math.abs(f0.cx - f0b.cx) < 1e-12 && Math.abs(f0.cy - f0b.cy) < 1e-12;
  RF.forget();
  const f0c = RF.focus(src, 0);
  const axV = RF.axis(1080, 1920, src), axH = RF.axis(1920, 1080, src), axS = RF.axis(1080, 1080, src);
  const c = P.data.V[0];
  const fillAuto = RF.fill(c, 1080, 1920, src, 0), fillNone = RF.fill(Object.assign({}, c, { fill: 'none' }), 1080, 1920, src, 0);
  const fillSame = RF.fill(c, 1920, 1080, src, 0);
  const fa = RF.fill(Object.assign({}, c, { fill: 'a' }), 1080, 1920, src, 0), fb = RF.fill(Object.assign({}, c, { fill: 'b' }), 1080, 1920, src, 0);
  const miss = RF.focus(null, 0);
  return { f0, f1, inRange: inRange(f0) && inRange(f1), same, rebuilt: Math.abs(f0c.cx - f0.cx) < 1e-12, axV, axH, axS, fillAuto, fillNone, fillSame, fa: fa.cx, fb: fb.cx, miss };
});
ok(F.inRange && F.same, `초점 자동 — 0~1 안, 같은 프레임은 항상 같은 값 (cx ${F.f0.cx.toFixed(3)} · cy ${F.f0.cy.toFixed(3)})`);
ok(F.rebuilt, '초점 표를 지우고 다시 만들어도 같은 값 (결정적)');
ok(F.axV === 'x' && F.axH === null && F.axS === 'x', '잘리는 축 — 세로 화면은 좌우(x), 같은 화면비면 자를 것 없음(null)');
ok(F.fillAuto && F.fillAuto.cover && !F.fillNone && !F.fillSame, '자동 = cover · 「안 채움」·화면비 같으면 예전 그대로(레터박스)');
ok(F.fa < 0.2 && F.fb > 0.8 && F.miss.cx === 0.5, '앞쪽/뒤쪽 초점 고정 · 원본이 없으면 가운데');

/* ---------- 4. 픽셀 — 세로에서 화면이 꽉 차고, 「안 채움」이면 검은 띠 ---------- */
const PX = await page.evaluate(async () => {
  const P = KMV_PROJECT, c = P.data.V[0];
  P.setAspect('16:9');
  const h0 = await window.__shot(2);
  const land = { top: h0.rowMax(4), bottom: h0.rowMax(h0.H - 6) };
  P.setAspect('9:16');
  P.setFill(c.id, 'auto');
  const s1 = await window.__shot(2);
  const full = { top: s1.rowMax(4), bottom: s1.rowMax(s1.H - 6), left: s1.colMax(3), right: s1.colMax(s1.W - 4) };
  P.setFill(c.id, 'none');
  const s2 = await window.__shot(2);
  const box = { top: s2.rowMax(4), bottom: s2.rowMax(s2.H - 6), mid: s2.rowMax(s2.H / 2) };
  // 앞쪽/뒤쪽은 실제로 다른 부분을 남긴다
  P.setFill(c.id, 'a'); const sa = await window.__shot(2);
  P.setFill(c.id, 'b'); const sb = await window.__shot(2);
  let diff = 0; for (let i = 0; i < sa.data.length; i += 4 * 97) if (Math.abs(sa.data[i] - sb.data[i]) > 12) diff++;
  const total = Math.ceil(sa.data.length / (4 * 97));
  P.setFill(c.id, 'auto');
  return { land, full, box, diffRatio: diff / total };
});
ok(PX.land.top > 8 && PX.land.bottom > 8, '가로 16:9 — 예전 그대로 위아래까지 그림이 찬다 (회귀)');
ok(PX.full.top > 8 && PX.full.bottom > 8 && PX.full.left > 8 && PX.full.right > 8, '세로 9:16 자동 채우기 — 위·아래·좌·우 가장자리에 검은 띠가 없다');
ok(PX.box.top < 40 && PX.box.bottom < 40 && PX.box.mid > PX.box.top * 4 + 40, `「안 채움」 — 위아래는 검고 가운데만 그림 (띠 ${PX.box.top.toFixed(0)} · 가운데 ${PX.box.mid.toFixed(0)})`);
ok(PX.diffRatio > 0.05, `앞쪽·뒤쪽이 실제로 다른 자리를 남긴다 (픽셀 차이 ${(PX.diffRatio * 100).toFixed(0)}%)`);

/* ---------- 5. 부품 무대 ---------- */
const PT = await page.evaluate(async () => {
  const P = KMV_PROJECT, K = KMV_PARTS;
  const land = K.stage(1920, 1080, 0.9, false), vTop = K.stage(1080, 1920, 0.1, false), vMid = K.stage(1080, 1920, 0.5, false), vBot = K.stage(1080, 1920, 0.92, false), full = K.stage(1080, 1920, 0.9, true);
  P.setAspect('9:16');
  P.clearP && P.clearP();
  const id = P.addP({ part: 'lower3rd', at: 0, dur: 90, p: Object.assign({}, P.partDefault('lower3rd')) });
  const s = await window.__shot(10);
  // 아래쪽 기준 부품이면 아래 절반(무대)에 글자가, 위쪽 1/4 에는 부품이 없어야 한다
  const band = (y0, y1) => { let m = 0; for (let y = y0; y < y1; y += 3) m = Math.max(m, s.rowMax(y)); return m; };
  const bot = band(s.H - 420, s.H - 40), top = band(20, 220);
  P.removeP(id);
  return { land, vTop, vMid, vBot, full, bot, top, mean: s.mean };
});
ok(PT.land.h === 1080 && PT.land.y === 0, '가로 16:9 — 부품 무대 = 화면 그대로 (예전과 동일)');
ok(PT.vTop.h === 1080 && PT.vTop.y === 0 && PT.vBot.y === 840 && PT.vMid.y === 420, '세로 — 무대는 짧은 변 1080, 기준점 따라 위(0)·가운데(420)·아래(840)');
ok(PT.full.h === 1920 && PT.full.y === 0, '뚫린 글자 같은 self·layer 부품은 화면 전체를 쓴다');
ok(PT.bot > 40, '세로에서 아래쪽 기준 부품(인물 소개)이 화면 아래에 그려진다');

/* ---------- 6. 자막 세로 대응 ---------- */
const SB = await page.evaluate(async () => {
  const P = KMV_PROJECT, txt = '금성초등학교 학생들이 운동장에서 함께 달리기를 하고 있습니다';
  P.clearS && P.clearS();
  const measure = () => {
    const cv = document.createElement('canvas'); cv.width = P.w(); cv.height = P.h();
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height);
    KMV_SUBTITLE.draw(cx, cv.width, cv.height, 5, P.data.S, P.data.theme, 0);
    const d = cx.getImageData(0, 0, cv.width, cv.height).data;
    let minX = cv.width, maxX = 0, minY = cv.height, maxY = 0;
    for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x += 2) {
      const i = (y * cv.width + x) * 4; if ((d[i] + d[i + 1] + d[i + 2]) / 3 > 60) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    return { minX, maxX, W: cv.width, H: cv.height, span: maxY - minY, bottom: cv.height - maxY };
  };
  P.setAspect('16:9'); P.addS({ text: txt, at: 0, dur: 90, style: 'basic' });
  const h = measure();
  P.setAspect('9:16');
  const v = measure();
  P.clearS();
  P.setAspect('16:9');
  return { h, v };
});
ok(SB.h.maxX > 0 && SB.h.maxX <= SB.h.W && SB.h.minX > 0, '가로 — 자막이 화면 안에 (회귀)');
ok(SB.v.minX > 8 && SB.v.maxX < SB.v.W - 8, `세로 — 긴 문장이 화면 폭을 넘지 않는다 (좌 ${SB.v.minX}px · 우 여백 ${SB.v.W - SB.v.maxX}px)`);
ok(Math.abs(SB.v.span - SB.h.span) <= 4 && Math.abs(SB.v.bottom - SB.h.bottom) <= 4, `세로에서도 글씨 크기·아래 여백이 그대로 — 짧은 변 기준이라 화면 폭에 비해 커지지 않는다 (높이 ${SB.h.span}→${SB.v.span}px)`);

/* ---------- 7. UI — 클립 「채우기」 ---------- */
const U = await page.evaluate(async () => {
  const P = KMV_PROJECT, $ = id => document.getElementById(id);
  P.setAspect('16:9');
  KMV_UI.select(P.data.V[0].id);
  const hidden16 = $('rowFit').classList.contains('hidden');
  P.setAspect('9:16');
  KMV_UI.select(P.data.V[0].id);
  const seg = Array.from($('fitSeg').children);
  const labels = seg.map(b => b.textContent);
  const shown = !$('rowFit').classList.contains('hidden');
  seg.find(b => b.dataset.k === 'b').click();
  const saved = P.data.V[0].fill, onKey = ($('fitSeg').querySelector('button.on') || {}).dataset;
  const inDoc = JSON.parse(JSON.stringify(P.toJSON())).V[0].fill;
  P.undo();
  const undone = P.data.V[0].fill;
  const note = $('fitNote').textContent;
  P.setAspect('16:9'); KMV_UI.select(P.data.V[0].id);
  const hiddenBack = $('rowFit').classList.contains('hidden');
  return { hidden16, shown, labels, saved, onKey: onKey && onKey.k, inDoc, undone, note, hiddenBack };
});
ok(U.hidden16 && U.shown && U.hiddenBack, '채우기 행은 화면비가 원본과 다를 때만 보인다');
ok(U.labels.join('/') === '자동/가운데/왼쪽/오른쪽/안 채움', '세로에서 이름이 좌우로 — ' + U.labels.join(' · '));
ok(U.saved === 'b' && U.onKey === 'b' && U.inDoc === 'b', '고른 채우기가 클립·작업 파일에 저장');
ok(U.undone === undefined && /좌우/.test(U.note), 'Ctrl+Z 로 되돌아감 · 안내 문구가 잘리는 축을 알려 준다');

ok(errs.filter(e => !/favicon|net::ERR/.test(e)).length === 0, '콘솔 오류 0' + (errs.length ? ' (' + errs.slice(0, 2).join(' | ') + ')' : ''));

console.log('\n' + (n - fail) + '/' + n + ' 통과');
await close(); srv.kill(); process.exit(fail ? 1 : 0);
