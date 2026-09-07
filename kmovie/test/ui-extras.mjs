// 케이무비 51 — 부가 도구(engine/extras.js) 검증: 뼈대 템플릿 3·사진 묶어 넣기·로고 워터마크·SRT/챕터/썸네일·첫 안내.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-extras.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8783);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
process.env.KMV_PORT = String(PORT); process.env.KMV_TOUR = '1';
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_EXTRAS);

// ---------- 첫 안내: 처음엔 뜨고, 닫으면 기억, 「?」로 다시 ----------
await page.waitForTimeout(1300);
const t1 = await page.evaluate(() => ({ shown: !document.getElementById('tour').classList.contains('hidden'), steps: document.querySelectorAll('#tour .tstep').length, keys: document.querySelectorAll('#tourKeys kbd').length }));
await page.click('#tourDone');
const t2 = await page.evaluate(() => ({ hidden: document.getElementById('tour').classList.contains('hidden'), flag: localStorage.getItem('kmv.tour') }));
await page.click('#btnHelp'); const t3 = await page.evaluate(() => !document.getElementById('tour').classList.contains('hidden')); await page.keyboard.press('Escape');
ok(t1.shown && t1.steps === 3 && t1.keys >= 20 && t2.hidden && t2.flag === '1' && t3, '첫 안내: 처음 열면 3단계+단축키 · 「시작하기」로 닫고 기억 · 「?」로 다시');

// ---------- 템플릿: 빈 타임라인 거절 → 클립 넣고 적용 → 다시 고르면 교체 ----------
const e0 = await page.evaluate(() => KMV_EXTRAS.applyTemplate('school'));
ok(e0 === null, '템플릿: 타임라인이 비면 null');
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.setInputFiles('#fileIn', [path.join(FX, 'big.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 2, null, { timeout: 120000 });
await page.click('#toolTabs button[data-tab=proj]');
await page.click('#tplRow button[data-k=school]');
const tp1 = await page.evaluate(() => { const P = KMV_PROJECT, cards = P.data.P.filter(x => x.tpl); return { n: cards.length, parts: cards.map(x => x.part).sort().join(','), inRange: cards.every(x => x.at >= 0 && x.at < P.total()), on: document.querySelector('#tplRow button.on') && document.querySelector('#tplRow button.on').dataset.k, sfx: P.data.audio.sfx.on, lut: P.data.look.lut }; });
ok(tp1.n === 6 && tp1.parts === 'chapter,chapter,credits,lower3rd,opening,vfxVignette' && tp1.inRange && tp1.on === 'school' && tp1.sfx && tp1.lut === 'cinema-navy', '「학교 소개」 6장 깔림 (길이 안·순서·효과음 켬·LUT) — ' + tp1.parts);
await page.evaluate(() => KMV_PROJECT.addP({ part: 'tag', at: 30 }));   // 손으로 넣은 카드
await page.click('#tplRow button[data-k=event]');
const tp2 = await page.evaluate(() => { const P = KMV_PROJECT; return { tpl: P.data.P.filter(x => x.tpl).map(x => x.tpl).join(','), hand: P.data.P.filter(x => !x.tpl).map(x => x.part).join(','), total: P.data.P.length }; });
ok(/^(event,)+event$/.test(tp2.tpl) && tp2.hand === 'tag' && tp2.total === 7, '「행사 스케치」로 바꾸면 템플릿 카드만 교체, 손 카드(tag)는 남음');
await page.click('#tplRow button[data-k=class]');
ok(await page.evaluate(() => KMV_PROJECT.data.P.filter(x => x.tpl === 'class').length === 5 && KMV_PROJECT.data.P.length === 6), '「학급 영상」 5장');
await page.evaluate(() => { while (KMV_PROJECT.data.P.length) KMV_PROJECT.removeP(KMV_PROJECT.data.P[0].id); });

// ---------- 사진 묶어 넣기 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'still.png'), path.join(FX, 'still.png'), path.join(FX, 'still.png')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 5, null, { timeout: 60000 });
const hint = await page.evaluate(() => document.getElementById('toast').textContent);
ok(/사진 3장/.test(hint), '사진 3장 넣으면 「묶어 넣기」 힌트 토스트 (' + hint.slice(0, 30) + '…)');
await page.click('#toolTabs button[data-tab=auto]');
await page.click('#photoSecSeg button[data-k="2.5"]');
await page.click('#btnPhotoSlide');
const ps = await page.evaluate(() => { const P = KMV_PROJECT, imgs = P.data.V.filter(c => P.media(c.media).kind === 'image'); return { n: imgs.length, durs: imgs.map(c => c.out - c.in).join(','), kb: imgs.map(c => c.kenburns).join(','), tr: imgs.map(c => c.transIn && c.transIn.type).join(','), nogap: P.data.V.every((c, i) => !i || c.at === P.data.V[i - 1].at + P.data.V[i - 1].dur) }; });
ok(ps.n === 3 && ps.durs === '75,75,75' && ps.kb === 'push,panL,pull' && ps.tr === 'dissolve,dissolve,dissolve' && ps.nogap, '사진 3장 — 2.5초씩 · 켄 번즈 순환 · 디졸브 · 빈틈 없음 (' + ps.kb + ')');
const undo = await page.evaluate(() => { KMV_PROJECT.undo(); return KMV_PROJECT.data.V.filter(c => KMV_PROJECT.media(c.media).kind === 'image').some(c => c.kenburns); });
await page.evaluate(() => { KMV_PROJECT.redo && KMV_PROJECT.redo(); });
ok(undo === true, 'Ctrl+Z 한 번은 마지막 사진의 전환만(사진마다 커밋 — 되돌리기 여러 번)');

// ---------- 로고 워터마크 ----------
await page.click('#toolTabs button[data-tab=proj]');
const lg = await page.evaluate(async () => {
  const P = KMV_PROJECT, img = P.data.media.find(m => m.kind === 'image'), W = 640, H = 360, cv = new OffscreenCanvas(W, H), c = cv.getContext('2d');
  const px = async (t) => { await KMV_RENDER.drawExact(c, W, H, t); const d = c.getImageData(W - 20, 14, 1, 1).data; return [d[0], d[1], d[2]]; };
  const before = await px(5);
  const sel = document.getElementById('logoSel'), opts = sel.options.length;
  sel.value = img.id; sel.dispatchEvent(new Event('change'));
  const after = await px(5), L = P.data.logo;
  const rowsOn = !document.getElementById('logoRows').classList.contains('hidden');
  P.setLogo({ pos: 'bl' }); const afterBl = await px(5);
  const bl = c.getImageData(20, H - 14, 1, 1).data;
  return { opts, before, after, L: L && { media: L.media === img.id, pos: L.pos, size: L.size }, rowsOn, afterBl, blPix: [bl[0], bl[1], bl[2]] };
});
const dif = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
ok(lg.opts >= 2 && lg.L && lg.L.media && lg.L.pos === 'tr' && lg.rowsOn && dif(lg.before, lg.after) > 20, '로고: 사진을 고르면 오른쪽 위에 그려짐 · 자리·크기 줄 노출');
ok(dif(lg.afterBl, lg.before) < 6 && dif(lg.blPix, lg.before) >= 0, '자리를 ↙ 로 바꾸면 오른쪽 위는 원래대로');
await page.evaluate(() => { KMV_PROJECT.setLogo(null); });

// ---------- SRT · 챕터 · 썸네일 ----------
const ex = await page.evaluate(async () => {
  const P = KMV_PROJECT;
  P.addS({ text: '안녕하세요', at: 0, dur: 45 }); P.addS({ text: '금성초입니다', at: 60, dur: 30 });
  P.addMarker({ at: 90, text: '운동장' }); P.addMarker({ at: 300, text: '' });
  const srt = KMV_EXTRAS.srt(), ch = KMV_EXTRAS.chapters();
  const blob = await KMV_EXTRAS.thumbnail(10);
  return { srt, ch, png: blob.type, size: blob.size, W: P.w() };
});
ok(ex.srt.startsWith('1\n00:00:00,000 --> 00:00:01,500\n안녕하세요\n\n2\n00:00:02,000 --> 00:00:03,000\n금성초입니다'), 'SRT — 번호·시각(콤마 ms)·문구');
ok(ex.ch === '0:00 시작\n0:03 운동장\n0:10 챕터 2', '유튜브 챕터 — 0:00 이 없으면 「시작」 앞에, 빈 마커는 「챕터 n」 (' + ex.ch.replace(/\n/g, ' | ') + ')');
ok(ex.png === 'image/png' && ex.size > 5000 && ex.W === 1920, '썸네일 PNG — 원본 해상도 ' + ex.W + ' · ' + ex.size + ' bytes');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\nui-extras: ${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
