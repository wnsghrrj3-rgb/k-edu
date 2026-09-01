// 케이무비 — 흔들림 잡기(안정화). 분석이 원본을 훑을 때 잰 이동량이 진짜 흔들림과 맞는지,
// 그 값으로 화면이 실제로 반대로 밀리는지(픽셀), 화면 가장자리에 빈틈이 안 생기는지.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-stab.mjs
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_STAB);

/* 프로젝트 크기 캔버스에 한 프레임 그려 픽셀을 본다 */
await page.evaluate(() => {
  window.__shot = t => {
    const P = KMV_PROJECT, W = P.w(), H = P.h();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    KMV_RENDER.draw(cx, W, H, t || 0);
    return cx.getImageData(0, 0, W, H).data;
  };
  window.__lum = (d, W, x, y) => { const i = (Math.round(y) * W + Math.round(x)) * 4; return (d[i] + d[i + 1] + d[i + 2]) / 3; };
});

/* ---------- 1. 흔들리는 원본 가져오기 → 분석 ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'shake.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length > 0, null, { timeout: 60000 });
await page.waitForFunction(() => { const m = KMV_PROJECT.data.media[0]; const s = m && KMV_MEDIA.get(m.id); return s && s.analyzed; }, null, { timeout: 120000 });

const A = await page.evaluate(() => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id);
  return { has: !!s.shake, len: s.shake ? s.shake.x.length : 0, frames: s.frames, fps: s.fps, w: s.w, h: s.h };
});
ok(A.has && A.len === A.frames, '분석이 흔들림 표를 함께 남긴다 (' + A.len + '프레임, 추가 디코드 0)');

/* ---------- 2. 잰 이동량이 진짜 흔들림과 맞나 ----------
   픽스처는 정지 그림 위에서 잘라내는 창을 x=320+30sin(2πn/5), y=180+24sin(2πn/7) 로 흔든 것.
   그림이 움직인 양 = −(창이 움직인 양), 격자(96×54)로 환산하면 ×96/640, ×54/360. */
const B = await page.evaluate(() => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id), sh = s.shake;
  const wx = n => Math.round(320 + 30 * Math.sin(2 * Math.PI * n / 5)), wy = n => Math.round(180 + 24 * Math.sin(2 * Math.PI * n / 7));
  const ex = [], ey = [], gx = [], gy = [];
  for (let i = 2; i < Math.min(s.frames, 110); i++) {
    if (!sh.ok[i]) continue;
    ex.push(-(wx(i) - wx(i - 1)) * 96 / 640); ey.push(-(wy(i) - wy(i - 1)) * 54 / 360);
    gx.push(sh.x[i]); gy.push(sh.y[i]);
  }
  const corr = (a, b) => {
    const ma = a.reduce((s, v) => s + v, 0) / a.length, mb = b.reduce((s, v) => s + v, 0) / b.length;
    let sab = 0, sa = 0, sb = 0;
    for (let i = 0; i < a.length; i++) { const u = a[i] - ma, v = b[i] - mb; sab += u * v; sa += u * u; sb += v * v; }
    return sab / Math.sqrt(sa * sb || 1);
  };
  const rms = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length);
  const okRate = Array.from(sh.ok).slice(2, 110).reduce((s, v) => s + v, 0) / 108;
  return { cnt: ex.length, cx: corr(ex, gx), cy: corr(ey, gy), rx: rms(ex, gx), ry: rms(ey, gy), okRate, cuts: Array.from(sh.cut).reduce((s, v) => s + v, 0) };
});
ok(B.okRate > 0.9, '거의 모든 프레임에서 자신 있게 쟀다 (' + Math.round(B.okRate * 100) + '%)');
ok(B.cx > 0.95 && B.cy > 0.95, '잰 이동량이 진짜 흔들림과 같은 모양 — 좌우 ' + B.cx.toFixed(3) + ' · 위아래 ' + B.cy.toFixed(3));
ok(B.rx < 0.6 && B.ry < 0.6, '오차 ' + B.rx.toFixed(2) + '·' + B.ry.toFixed(2) + '칸 (격자 96×54 기준, 1칸 = 원본 6.7px)');
ok(B.cuts === 0, '한 장면짜리 원본이라 컷 표시 0');

/* ---------- 3. 보정이 실제로 떨림을 줄이나 (모델) ---------- */
const C = await page.evaluate(() => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id), S = KMV_STAB;
  const jit = a => { let t = 0; for (let i = 1; i < a.length; i++) t += Math.abs(a[i] - a[i - 1]); return t / (a.length - 1); };
  const posOf = () => { const p = [0]; for (let i = 1; i < 110; i++) p.push(p[i - 1] + (s.shake.ok[i] ? s.shake.x[i] : 0)); return p; };
  const raw = posOf();
  const res = {};
  for (const lv of ['a', 'b']) {
    const after = raw.map((v, i) => v + S.offset(s, lv, i).sx * 96);
    res[lv] = { jit: jit(after), zoom: S.offset(s, lv, 0).zoom };
  }
  return { rawJit: jit(raw), a: res.a, b: res.b, off: S.offset(s, 'off', 0) };
});
ok(C.a.jit < C.rawJit * 0.5, '약하게: 떨림 ' + C.rawJit.toFixed(2) + ' → ' + C.a.jit.toFixed(2) + '칸');
ok(C.b.jit < C.a.jit, '강하게가 더 많이 잡는다 (' + C.b.jit.toFixed(2) + '칸)');
ok(Math.abs(C.a.zoom - 1.0989) < 0.01 && Math.abs(C.b.zoom - 1.25) < 0.01, '확대 배율 약 1.099 · 강 1.25');
ok(C.off === null, "'없음' 이면 아무것도 안 함");

/* ---------- 4. 화면(픽셀) — 실제로 반대로 밀리고, 가장자리에 빈틈이 없다 ---------- */
const D = await page.evaluate(async () => {
  const P = KMV_PROJECT, c = P.data.V[0], W = P.w(), H = P.h();
  const black = d => {                                   // 네 가장자리에 검은 띠(빈틈)가 있나
    let mx = 0;
    for (let x = 0; x < W; x += 7) { mx = Math.max(mx, __lum(d, W, x, 2), __lum(d, W, x, H - 3)); }
    for (let y = 0; y < H; y += 7) { mx = Math.max(mx, __lum(d, W, 2, y), __lum(d, W, W - 3, y)); }
    return mx;
  };
  const shots = {};
  for (const lv of ['none', 'a', 'b']) {
    P.setStab(c.id, lv);
    await new Promise(r => setTimeout(r, 60));
    shots[lv] = { t20: __shot(20), t21: __shot(21), stab: P.data.V[0].stab || 'none' };
  }
  // 두 프레임 사이 화면이 얼마나 튀나 — 가운데 가로줄의 평균 밝기 차이로 본다
  const jump = s => {
    let d = 0, cnt = 0;
    for (let x = 40; x < W - 40; x += 5) { d += Math.abs(__lum(s.t20, W, x, H / 2) - __lum(s.t21, W, x, H / 2)); cnt++; }
    return d / cnt;
  };
  return {
    setOK: shots.none.stab === 'none' && shots.a.stab === 'a' && shots.b.stab === 'b',
    edgeNone: black(shots.none.t20), edgeA: black(shots.a.t20), edgeB: black(shots.b.t20),
    jumpNone: jump(shots.none), jumpA: jump(shots.a), jumpB: jump(shots.b),
    same: (() => { let d = 0; for (let i = 0; i < shots.none.t20.length; i += 401) d += Math.abs(shots.none.t20[i] - shots.a.t20[i]); return d; })(),
  };
});
ok(D.setOK, '세기를 바꾸면 클립에 저장된다');
ok(D.same > 0, '켜면 화면이 실제로 달라진다 (확대 + 밀기)');
ok(D.edgeA > 20 && D.edgeB > 20, '가장자리에 검은 빈틈이 없다 — 밝기 ' + Math.round(D.edgeA) + '·' + Math.round(D.edgeB));
ok(D.jumpA < D.jumpNone && D.jumpB < D.jumpA, '이웃 프레임 사이 화면 튐이 줄어든다 (' + D.jumpNone.toFixed(1) + ' → ' + D.jumpA.toFixed(1) + ' → ' + D.jumpB.toFixed(1) + ')');

/* ---------- 5. UI — 세그·배지·되돌리기·저장 ---------- */
const E = await page.evaluate(() => {
  const P = KMV_PROJECT, c = P.data.V[0];
  P.setStab(c.id, 'none');
  KMV_UI.select(c.id);
  return { rowHidden: document.getElementById('rowStab').classList.contains('hidden'), btns: Array.from(document.querySelectorAll('#stabSeg button')).map(b => b.textContent) };
});
ok(!E.rowHidden && E.btns.join('·') === '없음·약하게·강하게', '클립을 고르면 「흔들림」 줄이 보인다 — ' + E.btns.join('·'));

await page.click('#stabSeg button[data-k="b"]');
const F = await page.evaluate(() => {
  const P = KMV_PROJECT;
  const on = document.querySelector('#stabSeg button.on').dataset.k, stab = P.data.V[0].stab;
  const doc = P.toJSON();
  P.undo();
  return { on, stab, saved: doc.V[0].stab, back: P.data.V[0].stab || 'none', note: !document.getElementById('stabNote').classList.contains('hidden') };
});
ok(F.on === 'b' && F.stab === 'b', '버튼을 누르면 모델에 반영 (강하게)');
ok(F.saved === 'b', '작업 파일에 저장된다');
ok(F.back === 'none', 'Ctrl+Z 로 되돌아간다');
ok(!F.note, '분석이 끝났으므로 "분석 중" 안내는 숨김');

const G = await page.evaluate(() => {
  const P = KMV_PROJECT, c = P.data.V[0];
  P.setStab(c.id, 'a');
  // 프리즈(정지) 클립에는 흔들림 줄이 안 보인다 — 한 장을 세워 둔 것이라 흔들림이 없다
  P.freeze(30, 30); const fz = P.data.V.find(v => v.freeze);
  KMV_UI.select(fz ? fz.id : c.id);
  const hidden = document.getElementById('rowStab').classList.contains('hidden');
  P.setStab(fz.id, 'a');
  const blocked = !fz.stab;
  P.undo(); KMV_UI.select(P.data.V[0].id);
  return { hidden, blocked, kept: P.data.V[0].stab === 'a' };
});
ok(G.hidden && G.blocked, '정지(프리즈) 클립에는 흔들림 잡기가 없다');
ok(G.kept, '되돌린 뒤에도 앞 클립의 흔들림 설정은 그대로');

ok(errs.filter(e => !/favicon|fonts\.googleapis/.test(e)).length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));

console.log('\n' + (n - fail) + '/' + n + ' 통과');
await close(); srv.kill();
process.exit(fail ? 1 : 0);
