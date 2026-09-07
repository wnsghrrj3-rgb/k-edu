// 케이무비 10단계 — 부품 12종·전환 20종(분류 5, 설계 v1 신규 8)·자막 9종(분류) 검증.
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
  const ids = KM_PARTS.list().map(d => d.id).filter(id => !id.startsWith('vfx')).sort();   // 화면 효과 21종은 ui-vfx 에서
  const cv = new OffscreenCanvas(480, 270), c = cv.getContext('2d');
  const drawn = {};
  for (const id of ids) {
    c.clearRect(0, 0, 480, 270);
    try { KM_PARTS.frame(id, c, 480, 270, KMV_PARTS.meta(id).thumbT, null, 'geumseong'); } catch (e) { drawn[id] = 'throw:' + e.message; continue; }
    const d = c.getImageData(0, 0, 480, 270).data; let px = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 8) px++;
    drawn[id] = px;
  }
  return { ids, drawn, total: KM_PARTS.list().length };
});
ok(parts.ids.length === 28 && parts.total === 49, '부품 28종 + 화면 효과 21종 = 49 등록');
for (const id of ['quote', 'chapter', 'list', 'credits']) ok(typeof parts.drawn[id] === 'number' && parts.drawn[id] > 150, '새 부품 ' + id + ' 그려짐 (픽셀 ' + parts.drawn[id] + ')');
ok(Object.values(parts.drawn).every(v => typeof v === 'number' && v > 50), '28종 전부 그려짐 (throw 0)' + (Object.entries(parts.drawn).filter(([k, v]) => !(typeof v === 'number' && v > 50)).map(([k, v]) => ' ' + k + ':' + v).join('') || ''));
/* 방송 자막 16종 — 카드로 그려도(글꼴 기본값·홀드) 픽셀·결정성 */
const bc = await page.evaluate(() => {
  const ids = ['extrude', 'glass', 'headline', 'ticker', 'nameplate', 'stamp', 'flip', 'vertical', 'marker', 'countdown', 'ribbon', 'bubble', 'live', 'split', 'reflect', 'outline'];
  const cv = new OffscreenCanvas(480, 270), c = cv.getContext('2d'), out = {};
  for (const id of ids) {
    const d0 = KMV_PROJECT.partDefault(id), card = { part: id, at: 0, dur: Math.round(KM_PARTS.get(id).dur * 30), p: d0.p };
    const shot = () => { c.clearRect(0, 0, 480, 270); KMV_PARTS.drawCard(c, 480, 270, card, Math.round(KMV_PARTS.meta(id).thumbT * 30), 'geumseong'); return c.getImageData(0, 0, 480, 270).data; };
    const a = shot(), b = shot(); let px = 0, same = true; for (let i = 0; i < a.length; i += 4) { if (a[i + 3] > 8) px++; if (a[i] !== b[i] || a[i + 3] !== b[i + 3]) same = false; }
    out[id] = { px, same, font: KMV_PARTS.meta(id).font, cat: KMV_PARTS.meta(id).cat };
  }
  return out;
});
ok(Object.values(bc).every(v => v.px > 200 && v.same && v.font && v.cat === 'bc'), '방송 자막 16종 — 카드 그리기 픽셀·결정적·글꼴 기본값·분류 「방송 자막」');
ok(new Set(Object.values(bc).map(v => v.font)).size >= 12, '글꼴 기본값이 12종 이상 서로 다름 (' + [...new Set(Object.values(bc).map(v => v.font))].join(',') + ')');

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
ok(grid.cells === 49 && grid.cats.join('/') === '타이틀/정보 표시/인물 뒤 글자/방송 자막/화면 효과', '꾸미기 패널: 분류 5그룹 · 49칸 (' + grid.cats.join('/') + ')');

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
ok(trSel.types === 20 && trSel.opts === 20 && trSel.groups.join('/') === '기본/딥/빛·질감/움직임/닦기', '전환 20종 · 분류 5그룹 (' + trSel.groups.join('/') + ')');
const trPix = await page.evaluate(async () => {
  const P = KMV_PROJECT, c2 = P.data.V[1];
  const cv = new OffscreenCanvas(1920, 1080), c = cv.getContext('2d');
  const snap = async () => { await KMV_RENDER.drawExact(c, 1920, 1080, c2.at + 9); const d = c.getImageData(0, 0, 1920, 1080).data; let s = 0; for (let i = 0; i < d.length; i += 4096) s += d[i] + d[i + 1] + d[i + 2]; return s; };
  P.setTransition(c2.id, null); const base = await snap();
  const out = { base };
  for (const [type, dir] of [['push', 'ltr'], ['cover', 'ttb'], ['zoom', 'in'], ['wipe', 'rtl'], ['blur', null], ['film', null], ['smooth', null], ['dipNavy', null], ['warmDip', null], ['exposure', null], ['luma', null], ['glow', null], ['dirblur', 'ltr']]) {
    P.setTransition(c2.id, { type, dur: 'normal', dir: dir || undefined });
    out[type] = await snap();
  }
  P.setTransition(c2.id, null);
  return out;
});
for (const t of ['push', 'cover', 'zoom', 'wipe', 'blur', 'film', 'smooth', 'dipNavy', 'warmDip', 'exposure', 'luma', 'glow', 'dirblur']) ok(Math.abs(trPix[t] - trPix.base) > 40, '전환 ' + t + ': 컷과 다른 합성 (Δ' + Math.abs(trPix[t] - trPix.base) + ')');

// ---------- 화면 전환 독립 패널 — 클립 선택에 따라 열림 ----------
const trPanel = await page.evaluate(() => ({
  h3: document.querySelector('#trPanel h3') ? document.querySelector('#trPanel h3').textContent : '',
  inPanel: !!document.querySelector('#trPanel #trType'),
  autoShown: !document.getElementById('trBody').classList.contains('hidden'),   // 46 따라가기: 고르지 않아도 플레이헤드 아래 클립이 자동 선택돼 이미 열려 있다
}));
await page.evaluate(() => { KMV_UI.setPH(30); });
const bb = await page.evaluate(() => { const r = document.getElementById('timeline').getBoundingClientRect(); return { x: r.x, y: r.y, pxf: KMV_UI.xOf(1) - KMV_UI.xOf(0) }; });
await page.mouse.click(bb.x + await page.evaluate(() => KMV_UI.xOf(30)), bb.y + 180);   // V 레인의 첫 클립 (레인: 눈금24+P40+S40+V2 32 → V 136~224)
const trPanel2 = await page.evaluate(() => ({ bodyShown: !document.getElementById('trBody').classList.contains('hidden') }));
ok(trPanel.h3.includes('화면 전환') && trPanel.inPanel && trPanel.autoShown && trPanel2.bodyShown, '화면 전환이 독립 패널로 — 플레이헤드 아래 클립을 따라 열림·클릭해도 유지 (' + trPanel.h3.trim() + ')');

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

// ---------- 부품 미리보기 — 올리면 재생, 클릭 고정 + 넣기, 더블클릭 놓기 ----------
{
  const tile = page.locator('#partGrid .pc[data-id="stamp"]');
  await tile.hover(); await page.waitForTimeout(500);
  const hov = await page.evaluate(() => { const pk = document.getElementById('partPeek'); const r = pk.getBoundingClientRect(); const c = pk.querySelector('canvas').getContext('2d').getImageData(0, 0, 480, 270).data; let px = 0; for (let i = 3; i < c.length; i += 64) if (c[i] > 8) px++; return { shown: !pk.classList.contains('hidden') && r.width > 0, id: KMV_PEEK.id, pinned: KMV_PEEK.pinned, px, name: document.getElementById('pkName').textContent, n0: KMV_PROJECT.data.P.length }; });
  await page.waitForTimeout(400);
  const t2 = await page.evaluate(() => document.getElementById('pkTime').textContent);
  await page.mouse.move(5, 5); await page.waitForTimeout(150);
  const gone = await page.evaluate(() => document.getElementById('partPeek').classList.contains('hidden'));
  ok(hov.shown && hov.id === 'stamp' && !hov.pinned && hov.px > 50 && /스탬프/.test(hov.name) && /초/.test(t2) && gone, `올리면 미리보기 창(재생 중 ${t2}) · 떠나면 사라짐 · 넣지 않음`);
  const n0 = hov.n0;
  await tile.click(); await page.waitForTimeout(250);
  await page.mouse.move(5, 5); await page.waitForTimeout(200);
  const pinned = await page.evaluate(() => ({ pinned: KMV_PEEK.pinned, shown: !document.getElementById('partPeek').classList.contains('hidden'), n: KMV_PROJECT.data.P.length, mark: document.querySelector('#partGrid .pc[data-id="stamp"]').classList.contains('peek') }));
  ok(pinned.pinned && pinned.shown && pinned.n === n0 && pinned.mark, '클릭 = 미리보기 고정(떠나도 남음), 아직 안 넣음');
  await page.click('#pkPlace'); await page.waitForTimeout(150);
  const placed = await page.evaluate(() => ({ n: KMV_PROJECT.data.P.length, last: KMV_PROJECT.data.P.some(x => x.part === 'stamp'), hidden: document.getElementById('partPeek').classList.contains('hidden'), parts: KMV_PROJECT.data.P.map(x => x.part + '@' + x.at).join(','), ph: KMV_UI.ph, peekId: KMV_PEEK.id }));
  ok(placed.n === n0 + 1 && placed.last && placed.hidden, '「넣기」 → 플레이헤드에 놓이고 창 닫힘 ');
  await page.locator('#partGrid .pc[data-id="ribbon"]').dblclick(); await page.waitForTimeout(150);
  const dbl = await page.evaluate(() => ({ n: KMV_PROJECT.data.P.length, last: KMV_PROJECT.data.P.map(x => x.part).includes('ribbon') }));
  ok(dbl.n === n0 + 2 && dbl.last, '더블클릭 = 바로 놓기');
  await page.evaluate(() => { const P = KMV_PROJECT; for (const x of [...P.data.P]) if (x.part === 'stamp' || x.part === 'ribbon') P.removeP(x.id); });
}

// ---------- 도구상자 탭 — 위에서 골라 하나만 ----------
{
  const tb = await page.evaluate(() => {
    const vis = id => document.getElementById(id).getBoundingClientRect().height > 0;
    const tabs = Array.from(document.querySelectorAll('#toolTabs button')).map(b => b.textContent);
    KMV_UI.tab('parts'); const a = { parts: vis('partPanel'), sub: vis('subPanel'), music: vis('musicPanel'), look: vis('lookPanel'), proj: vis('projPanel') };
    document.querySelector('#toolTabs [data-tab="music"]').click(); const b = { parts: vis('partPanel'), music: vis('musicPanel'), on: document.querySelector('#toolTabs button.on').dataset.tab, saved: localStorage.getItem('kmv.tab') };
    KMV_UI.tab('parts');
    return { tabs, a, b };
  });
  ok(tb.tabs.join('/') === '타이틀·꾸미기/자막/음악/자동/룩/프로젝트', '도구상자 탭 6개 (' + tb.tabs.join('/') + ')');
  ok(tb.a.parts && !tb.a.sub && !tb.a.music && !tb.a.look && !tb.a.proj, '탭 하나만 보인다 (타이틀·꾸미기)');
  ok(!tb.b.parts && tb.b.music && tb.b.on === 'music' && tb.b.saved === 'music', '음악 탭 클릭 → 음악만, 기억됨');
}

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
