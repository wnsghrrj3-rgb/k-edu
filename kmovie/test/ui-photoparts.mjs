// 케이무비 — 사진 틀 부품 5종(kmake/parts/p-photo.js) + 사진 칸(type:'img') 검증.
// 준비: bash make-fixtures.sh (fx/still.png) · npm i
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-photoparts.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8779);
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
await page.route('**/fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KM_PARTS && window.KMV_PARTS);

// ---------- 등록·분류·메타 ----------
const reg = await page.evaluate(() => {
  const PH = ['photoOpen', 'collage3', 'photoOne', 'photoPair', 'photoGrid4'];
  const list = KMV_PARTS.list();
  const cats = Array.from(document.querySelectorAll('#partGrid .cat')).map(e => e.textContent);
  return {
    all: PH.every(id => KM_PARTS.get(id)), cat: PH.every(id => KMV_PARTS.meta(id).cat === 'photo'), font: PH.every(id => KMV_PARTS.meta(id).font === 'notoserif'),
    hold: PH.every(id => { const h = KMV_PARTS.meta(id).hold; return h && h[0] < h[1] && h[1] < KM_PARTS.get(id).dur; }),
    img: PH.every(id => KM_PARTS.get(id).fields.some(f => f.type === 'img')),
    order: list.findIndex(x => x.meta.cat === 'photo') > list.findIndex(x => x.meta.cat === 'title') && list.findIndex(x => x.meta.cat === 'photo') < list.findIndex(x => x.meta.cat === 'info'),
    cats, cells: document.querySelectorAll('#partGrid .pc').length, photoCells: document.querySelectorAll('#partGrid .pc').length && Array.from(document.querySelectorAll('#partGrid .pc')).filter(e => PH.includes(e.dataset.id)).length,
  };
});
ok(reg.all && reg.img, '사진 틀 5종 등록 · 모두 사진 칸(type img) 있음');
ok(reg.cat && reg.font && reg.hold, '메타: 분류 「사진 틀」 · 명조 글꼴 · 홀드 구간이 길이 안');
ok(reg.order && reg.cats[1] === '사진 틀' && reg.photoCells === 5, '패널: 「타이틀」 다음 「사진 틀」 헤더 · 5칸 (' + reg.cats.join('/') + ')');

// ---------- 사진 없이 놓기 → 자리표시 · 설정 창에 사진 칸(없음 + 안내) ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.evaluate(() => { KMV_UI.placePart('photoOne', 10); });
await page.waitForTimeout(200);
const p0 = await page.evaluate(() => {
  const P = KMV_PROJECT, pt = P.data.P[P.data.P.length - 1]; KMV_UI.selectP(pt.id);
  const box = document.querySelector('#partFields .imgpick');
  return { part: pt.part, photo: pt.p.photo, hasPick: !!box, n: box ? box.dataset.n : null, btns: box ? box.querySelectorAll('button').length : 0, note: box ? !!box.querySelector('.imgpick-note') : false };
});
ok(p0.part === 'photoOne' && p0.photo === '' && p0.hasPick && p0.n === '0' && p0.btns === 1 && p0.note, '한 장 크게 놓기 → 사진 칸 「없음」 하나 + 「사진을 먼저 넣어 주세요」 안내');
await page.evaluate(() => { KMV_UI.setPH(10 + 90); });
await page.waitForTimeout(500);
const ph0 = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); return Array.from(c.getImageData(960, 470, 1, 1).data); });
ok(ph0[3] > 0, '자리표시 프레임이 그려짐 (가운데 픽셀 ' + ph0.join(',') + ')');

// ---------- 사진을 미디어 띠에 넣으면 고르기 칸이 다시 그려지고, 고르면 p.photo = 미디어 id ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'still.png')]);
await page.waitForFunction(() => KMV_PROJECT.data.media.some(m => m.kind === 'image'), null, { timeout: 90000 });
await page.evaluate(() => { const P = KMV_PROJECT; const c = P.data.V.find(c => P.media(c.media) && P.media(c.media).kind === 'image'); if (c) P.removeClip(c.id); KMV_UI.setPH(100); });   // 사진 클립은 빼고 보관함엔 남김
await page.waitForTimeout(300);
const pick = await page.evaluate(() => {
  const box = document.querySelector('#partFields .imgpick'); const btns = Array.from(box.querySelectorAll('button'));
  return { n: box.dataset.n, btns: btns.length, canvas: btns.filter(b => b.querySelector('canvas')).length, note: !!box.querySelector('.imgpick-note') };
});
ok(pick.n === '1' && pick.btns === 2 && pick.canvas === 1 && !pick.note, '사진 넣으면 고르기 칸 갱신: 「없음」 + 썸네일 1 (안내 사라짐)');
const before = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); return Array.from(c.getImageData(960, 470, 1, 1).data); });
await page.click('#partFields .imgpick button:nth-child(2)');
await page.waitForTimeout(500);
const after = await page.evaluate(() => {
  const P = KMV_PROJECT, pt = P.part(KMV_UI.selP), img = P.data.media.find(m => m.kind === 'image');
  const c = document.getElementById('preview').getContext('2d');
  const on = Array.from(document.querySelectorAll('#partFields .imgpick button')).map(b => b.classList.contains('on'));
  return { photo: pt.p.photo, img: img.id, on, px: Array.from(c.getImageData(960, 470, 1, 1).data) };
});
ok(after.photo === after.img && after.on.join(',') === 'false,true', '썸네일 클릭 → p.photo = 미디어 id · 그 칸에 표시');
ok(before.join(',') !== after.px.join(','), '사진이 틀 안에 그려진다 (가운데 픽셀 ' + before.join(',') + ' → ' + after.px.join(',') + ')');
// 되돌리기 한 번에 사진 칸도 돌아온다
await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
const undo = await page.evaluate(() => KMV_PROJECT.part(KMV_UI.selP).p.photo);
ok(undo === '', 'Ctrl+Z 한 번 → 사진 칸 비움 (updateP 경로)');
await page.keyboard.press('Control+y'); await page.waitForTimeout(150);

// ---------- 콜라주 3장 — 사진 3칸에 같은 사진, 뒤집힘 뒤 문구 · 이름표 ----------
await page.evaluate(() => { const P = KMV_PROJECT; P.updateP(KMV_UI.selP, { p: { paper: 'off' } }); KMV_UI.placePart('collage3', 0); });   // 원본이 6초라 0초에 (한 장 크게는 종이 끄고 겹침)
await page.waitForTimeout(200);
const col = await page.evaluate(() => {
  const P = KMV_PROJECT, pt = P.data.P.find(x => x.part === 'collage3'), img = P.data.media.find(m => m.kind === 'image').id;
  KMV_UI.selectP(pt.id);
  P.updateP(pt.id, { p: { photo1: img, photo2: img, photo3: img, main1: '검사문구' } });
  const picks = document.querySelectorAll('#partFields .imgpick').length;
  return { part: pt.part, dur: pt.dur, picks, label: KMV_PARTS.label(P.part(pt.id)) };
});
ok(col.part === 'collage3' && col.dur === 12 * 30 && col.picks === 3, '콜라주 3장 놓기: 12초 · 사진 칸 3개');
ok(/콜라주 3장 · 검사문구/.test(col.label), '카드 이름표 = 「콜라주 3장 · 큰 줄1」 (' + col.label + ')');
await page.evaluate(() => KMV_UI.setPH(60)); await page.waitForTimeout(400);
const c2 = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); return Array.from(c.getImageData(365, 540, 1, 1).data); });
await page.evaluate(() => KMV_UI.setPH(150)); await page.waitForTimeout(400);
const c5 = await page.evaluate(() => { const c = document.getElementById('preview').getContext('2d'); return Array.from(c.getImageData(365, 540, 1, 1).data); });
ok(c2.join(',') !== c5.join(','), '2초(사진) → 5초(첫 카드 문구로 뒤집힘) 첫 카드 픽셀이 바뀐다 (' + c2.join(',') + ' → ' + c5.join(',') + ')');

// ---------- 저장·새로고침 복원 — 사진 칸 값(미디어 id)이 그대로 ----------
await page.evaluate(() => KMV_PROJECT.save && KMV_PROJECT.save());
await page.reload(); await page.waitForFunction(() => window.KMV_UI && window.KM_PARTS, null, { timeout: 60000 });
await page.waitForFunction(() => KMV_PROJECT.data.P.length === 2, null, { timeout: 90000 });
const re = await page.evaluate(() => { const P = KMV_PROJECT, a = P.data.P.find(x => x.part === 'photoOne'), b = P.data.P.find(x => x.part === 'collage3'), img = P.data.media.find(m => m.kind === 'image'); return { a: a.p.photo, b: [b.p.photo1, b.p.photo2, b.p.photo3], img: img && img.id }; });
ok(re.img && re.a === re.img && re.b.every(v => v === re.img), '새로고침 복원: 사진 칸 = 미디어 id 그대로 (사진 보관함과 다시 이어짐)');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
await close(); srv.kill();
console.log(`\n${n - fail}/${n} 통과`); process.exit(fail ? 1 : 0);
