// 케이무비 10단계 — 부품 12종·전환 12종(분류)·자막 9종(분류) 검증.
// 준비: bash make-fixtures.sh (fx/a.mp4, fx/b.mp4) · npm i
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-parts.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8768);
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KM_PARTS);

// ---------- 부품 12종 · 전부 그려짐 ----------
const parts = await page.evaluate(() => {
  const ids = KM_PARTS.list().map(d => d.id).sort();
  const cv = new OffscreenCanvas(480, 270), c = cv.getContext('2d');
  const drawn = {};
  for (const id of ids) {
    c.clearRect(0, 0, 480, 270);
    try { KM_PARTS.frame(id, c, 480, 270, KMV_PARTS.meta(id).thumbT, null, 'geumseong'); } catch (e) { drawn[id] = 'throw:' + e.message; continue; }
    const d = c.getImageData(0, 0, 480, 270).data; let px = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 8) px++;
    drawn[id] = px;
  }
  return { ids, drawn };
});
ok(parts.ids.length === 12, '부품 12종 등록 (' + parts.ids.join(', ') + ')');
for (const id of ['quote', 'chapter', 'list', 'credits']) ok(typeof parts.drawn[id] === 'number' && parts.drawn[id] > 150, '새 부품 ' + id + ' 그려짐 (픽셀 ' + parts.drawn[id] + ')');
ok(Object.values(parts.drawn).every(v => typeof v === 'number' && v > 50), '기존 부품 8종도 전부 그려짐');

// ---------- 새 부품 홀드 재매핑 — 늘려도 등장·퇴장 원속도, 단조증가 ----------
const remap = await page.evaluate(() => {
  const out = {};
  for (const id of ['quote', 'chapter', 'list', 'credits']) {
    const d = KM_PARTS.get(id), FPS = KMV_PROJECT.FPS, dur = Math.round(d.dur * FPS * 2);   // 2배로 늘림
    const card = { part: id, dur };
    let prev = -1, mono = true;
    for (let lf = 0; lf < dur; lf++) { const t = KMV_PARTS.remap(card, lf, FPS); if (t < prev - 1e-9) mono = false; prev = t; }
    const meta = KMV_PARTS.meta(id), tEnd = KMV_PARTS.remap(card, dur - 1, FPS);
    const introOK = Math.abs(KMV_PARTS.remap(card, Math.round(meta.hold[0] * FPS) - 1, FPS) - (meta.hold[0] - 1 / FPS)) < 0.05;   // 등장 원속도
    out[id] = { mono, end: tEnd, dur: d.dur, introOK };
  }
  return out;
});
for (const id of Object.keys(remap)) { const r = remap[id]; ok(r.mono && Math.abs(r.end - r.dur) < 0.15 && r.introOK, '홀드 재매핑 ' + id + ' (단조 ' + r.mono + ' · 끝 ' + r.end.toFixed(2) + '/' + r.dur + ' · 등장 원속도 ' + r.introOK + ')'); }

// ---------- 부품 패널 — 분류 헤더 + 12칸 ----------
const grid = await page.evaluate(() => ({
  cats: Array.from(document.querySelectorAll('#partGrid .cat')).map(e => e.textContent),
  cells: document.querySelectorAll('#partGrid .pc').length,
}));
ok(grid.cells === 12 && grid.cats.join('/') === '타이틀/정보 표시/인물 뒤 글자/화면 효과', '꾸미기 패널: 분류 4그룹 · 12칸 (' + grid.cats.join('/') + ')');

// ---------- 자막 9종 · 분류 UI ----------
const subUI = await page.evaluate(() => ({
  styles: KMV_SUBTITLE.STYLES.map(s => s.id),
  cats: Array.from(document.querySelectorAll('#subStyleSeg .cat')).map(e => e.textContent),
  btns: document.querySelectorAll('#subStyleSeg button').length,
}));
ok(subUI.styles.length === 9 && subUI.btns === 9 && subUI.cats.join('/') === '기본/강조/장식', '자막 9종 · 분류 3그룹 (' + subUI.cats.join('/') + ')');

// ---------- 자막 새 스타일 렌더 — 위치·픽셀 ----------
const subPix = await page.evaluate(async () => {
  const cv = new OffscreenCanvas(1920, 1080), c = cv.getContext('2d');
  const count = (x0, y0, w, h) => { const d = c.getImageData(x0, y0, w, h).data; let px = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 8) px++; return px; };
  const draw = (style, t) => { c.clearRect(0, 0, 1920, 1080); KMV_SUBTITLE.draw(c, 1920, 1080, t, [{ text: '금성 어린이 여러분 안녕하세요', at: 0, dur: 90, style }], 'geumseong', 0); };
  draw('caption', 30); const cap = { top: count(0, 0, 960, 360), bot: count(0, 720, 1920, 360) };
  draw('gold', 30);    const gold = { mid: count(300, 380, 1320, 320), bot: count(0, 900, 1920, 180) };
  draw('bar', 30);     const bar = { left: count(20, 880, 200, 180), right: count(1700, 880, 200, 180) };   // 띠는 전체 폭
  draw('type', 2);     const t1 = count(0, 700, 1920, 380);
  draw('type', 70);    const t2 = count(0, 700, 1920, 380);
  return { cap, gold, bar, t1, t2 };
});
ok(subPix.cap.top > 40 && subPix.cap.bot === 0, '설명(caption): 상단 좌측에만 (' + subPix.cap.top + '/' + subPix.cap.bot + ')');
ok(subPix.gold.mid > 150 && subPix.gold.bot === 0, '금선(gold): 화면 가운데 (' + subPix.gold.mid + ')');
ok(subPix.bar.left > 100 && subPix.bar.right > 100, '띠(bar): 하단 전체 폭 (' + subPix.bar.left + '·' + subPix.bar.right + ')');
ok(subPix.t2 > subPix.t1 * 2, '타자기(type): 글자가 점점 늘어남 (' + subPix.t1 + ' → ' + subPix.t2 + ')');

// ---------- 전환 — 분류·새 5종 픽셀 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.setInputFiles('#fileIn', [path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 2, null, { timeout: 90000 });
const trSel = await page.evaluate(() => ({
  types: KMV_TRANSITION.TYPES.length,
  groups: Array.from(document.querySelectorAll('#trType optgroup')).map(o => o.label),
  opts: document.querySelectorAll('#trType option').length,
}));
ok(trSel.types === 12 && trSel.opts === 12 && trSel.groups.join('/') === '기본/움직임/닦기/빛·질감', '전환 12종 · 분류 4그룹 (' + trSel.groups.join('/') + ')');
const trPix = await page.evaluate(async () => {
  const P = KMV_PROJECT, c2 = P.data.V[1];
  const cv = new OffscreenCanvas(1920, 1080), c = cv.getContext('2d');
  const snap = async () => { await KMV_RENDER.drawExact(c, 1920, 1080, c2.at + 9); const d = c.getImageData(0, 0, 1920, 1080).data; let s = 0; for (let i = 0; i < d.length; i += 4096) s += d[i] + d[i + 1] + d[i + 2]; return s; };
  P.setTransition(c2.id, null); const base = await snap();
  const out = { base };
  for (const [type, dir] of [['push', 'ltr'], ['cover', 'ttb'], ['zoom', 'in'], ['wipe', 'rtl'], ['blur', null]]) {
    P.setTransition(c2.id, { type, dur: 'normal', dir: dir || undefined });
    out[type] = await snap();
  }
  P.setTransition(c2.id, null);
  return out;
});
for (const t of ['push', 'cover', 'zoom', 'wipe', 'blur']) ok(Math.abs(trPix[t] - trPix.base) > 40, '전환 ' + t + ': 컷과 다른 합성 (Δ' + Math.abs(trPix[t] - trPix.base) + ')');

// ---------- 화면 전환 독립 패널 — 클립 선택에 따라 열림 ----------
const trPanel = await page.evaluate(() => ({
  h3: document.querySelector('#trPanel h3') ? document.querySelector('#trPanel h3').textContent : '',
  inPanel: !!document.querySelector('#trPanel #trType'),
  noneShown: !document.getElementById('trNone').classList.contains('hidden'),
}));
await page.evaluate(() => { KMV_UI.setPH(30); });
const bb = await page.evaluate(() => { const r = document.getElementById('timeline').getBoundingClientRect(); return { x: r.x, y: r.y, pxf: KMV_UI.xOf(1) - KMV_UI.xOf(0) }; });
await page.mouse.click(bb.x + await page.evaluate(() => KMV_UI.xOf(30)), bb.y + 180);   // V 레인의 첫 클립 (레인: 눈금24+P40+S40+V2 32 → V 136~224)
const trPanel2 = await page.evaluate(() => ({ bodyShown: !document.getElementById('trBody').classList.contains('hidden') }));
ok(trPanel.h3.includes('화면 전환') && trPanel.inPanel && trPanel.noneShown && trPanel2.bodyShown, '화면 전환이 독립 패널로 — 클립 고르면 열림 (' + trPanel.h3.trim() + ')');

// ---------- 자석 스냅 — 앞 카드 끝에 딱 붙기 ----------
const mag = await page.evaluate(() => { const P2 = KMV_PROJECT; P2.clearP(); const A = P2.addP({ part: 'tag', at: 0 }); const B = P2.addP({ part: 'tag', at: 170 }); KMV_UI.setPH(0); return { aEnd: A.at + A.dur, b: B.id, bAt: B.at, pxf: KMV_UI.xOf(1) - KMV_UI.xOf(0) }; });
{
  const py = bb.y + 39, grab = 3;                          // P 레인, 카드 앞 3f 지점을 잡는다
  const gx = f => page.evaluate(fr => KMV_UI.xOf(fr), f);
  await page.mouse.move(bb.x + await gx(mag.bAt + grab), py);
  await page.mouse.down();
  await page.mouse.move(bb.x + await gx(mag.aEnd + 0.45 + grab), py, { steps: 6 });   // 시작이 150.45 근처 — 자석 반경(7px) 안
  await page.mouse.up();
  const at = await page.evaluate(id => (KMV_PROJECT.data.P.find(q => q.id === id) || {}).at, mag.b);
  ok(at === mag.aEnd, '자석 스냅: 카드가 앞 카드 끝(' + mag.aEnd + ')에 딱 붙음 (at=' + at + ')');
}

// ---------- 부품 설정이 재생 화면 옆 인스펙터로 ----------
{
  const ins = await page.evaluate(() => {
    const P = KMV_PROJECT; P.clearP(); const A = P.addP({ part: 'tag', at: 0 });
    const vis = () => { const el = document.getElementById('inspector'); const r = el.getBoundingClientRect(); return { w: r.width, shown: r.width > 0 && !document.getElementById('partEdit').classList.contains('hidden') }; };
    const before = vis();
    KMV_UI.selectP(A.id);
    const on = vis();
    const stage = document.getElementById('stage').getBoundingClientRect(), ir = document.getElementById('inspector').getBoundingClientRect();
    KMV_UI.selectP(null);
    const off = vis();
    return { before: before.shown, on: on.shown, off: off.shown, beside: ir.left >= stage.right - 2 && Math.abs(ir.top - stage.top) < 40 };
  });
  ok(!ins.before && ins.on && !ins.off && ins.beside, '카드 설정 인스펙터: 선택 시 재생 화면 오른쪽에 (선택 전 ' + ins.before + ' → 선택 ' + ins.on + ' → 해제 ' + ins.off + ', 옆배치 ' + ins.beside + ')');
}

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
