// 케이무비 자동 편집 UI — 도구상자 「자동」 탭. 무음 잘라내기·장면 나누기·표시만 하기·군소리 정리.
// 계산 자체(KMV_AUTO)는 model-auto.test.mjs 가 본다. 여기는 "찾기는 화면에만 · 누르면 그때 모델" 배선만.
// 음성 구간·diff·motion 은 결정적으로 보려고 페이지 안에서 값을 심는다(실촬영본 정확도는 준호 몫).
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-auto.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8781);
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

console.log('탭·모듈');
const tabs = await page.evaluate(() => Array.from(document.querySelectorAll('#toolTabs button')).map(b => b.dataset.tab + ':' + b.textContent));
ok(tabs.length === 6 && tabs.some(t => t.startsWith('auto:자동')), '도구상자 탭 6개 · 「자동」 있음 → ' + tabs.map(t => t.split(':')[1]).join('/'));
ok(await page.evaluate(() => !!(window.KMV_AUTO && KMV_AUTO.silences)), 'engine/auto.js 가 화면에 올라와 있다 (index.html 로드)');
await page.evaluate(() => KMV_UI.tab('auto'));
ok(await page.evaluate(() => !document.getElementById('autoPanel').closest('.panel').matches('[data-tab]:not(.tabOn)') && getComputedStyle(document.getElementById('autoPanel')).display !== 'none'), '「자동」 탭을 고르면 자동 패널만 보인다');
ok(await page.evaluate(() => getComputedStyle(document.getElementById('musicPanel')).display === 'none'), '다른 탭(음악)은 숨는다');

console.log('빈 타임라인 안전장치');
await page.click('#btnSilFind');
ok((await page.textContent('#toast')).includes('비어'), '타임라인이 비면 무음 찾기는 안내만');
ok(await page.evaluate(() => KMV_UI.autoPrev.sil.length === 0), '미리보기 안 생김');

// ---------- 원본 하나 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.waitForFunction(() => { const m = KMV_PROJECT.data.media[0]; const s = KMV_MEDIA.get(m.id); return s && s.analyzed; }, null, { timeout: 90000 });

console.log('무음 잘라내기');
// 음성 구간을 심는다: 45~75 · 120~150 (a.mp4 = 180f) → 무음 [0,36) 과 [84,111)
await page.evaluate(() => { window.__voice = KMV_AUDIO.voice; KMV_AUDIO.voice = () => [{ at: 45, dur: 30 }, { at: 120, dur: 30 }]; });
const tot0 = await page.evaluate(() => KMV_PROJECT.total());
ok(tot0 === 180, '원본 길이 ' + tot0 + 'f');
const pxAt = f => page.evaluate(x => {
  const ctx = document.getElementById('timeline').getContext('2d'), dpr = window.devicePixelRatio || 1;
  const L = KMV_UI.layout.LY.V, d = ctx.getImageData(Math.round(KMV_UI.xOf(x) * dpr), Math.round((L.y + L.h / 2) * dpr), 1, 1).data;
  return { r: d[0], g: d[1], b: d[2] };
}, f);
const px0 = await pxAt(97);
await page.click('#btnSilFind');
const prev = await page.evaluate(() => KMV_UI.autoPrev.sil.map(r => [r.at, r.dur]));
ok(JSON.stringify(prev) === JSON.stringify([[0, 36], [84, 27]]), '찾기 → 미리보기 구간 ' + JSON.stringify(prev) + ' (여유 9f·최소 24f 기본값 · 끝 21f 는 최소 미만이라 남김)');
ok(await page.evaluate(() => KMV_PROJECT.total()) === tot0, '찾기만으로는 모델이 안 바뀐다');
ok((await page.textContent('#silNote')).includes('잘라낼 무음'), '패널 안내가 찾은 결과로 바뀐다');
// 미리보기 픽셀 — 두 번째 무음(84~111) 한가운데가 붉게 물든다 (찾기 전후 비교)
const px1 = await pxAt(97);
ok((px1.r - px1.b) > (px0.r - px0.b) + 12, '타임라인이 붉은 쪽으로 물든다 (띠가 그려진다) → 찾기 전 rgb(' + [px0.r, px0.g, px0.b] + ') → 후 rgb(' + [px1.r, px1.g, px1.b] + ')');
// 자막·마커를 놓고 잘라내면 따라오는지
await page.evaluate(() => { KMV_PROJECT.addS({ text: '뒤쪽 자막', at: 150, dur: 25 }); KMV_PROJECT.addMarker({ at: 160, text: '표' }); });
await page.click('#btnSilCut');
const after = await page.evaluate(() => ({ tot: KMV_PROJECT.total(), s: KMV_PROJECT.data.S.map(c => c.at), mk: KMV_PROJECT.data.markers.map(m => m.at), prev: KMV_UI.autoPrev.sil.length }));
ok(after.tot === 180 - 63, '잘라낸 뒤 길이 ' + after.tot + 'f (무음 두 곳 63f 만큼 줄었다)');
ok(after.s[0] === 150 - 63 && after.mk[0] === 160 - 63, '자막·마커가 같이 당겨졌다 → 자막 ' + after.s[0] + ' · 마커 ' + after.mk[0]);
ok(after.prev === 0, '잘라낸 뒤 미리보기는 사라진다');
await page.keyboard.press('Control+z');
ok(await page.evaluate(() => KMV_PROJECT.total()) === tot0, 'Ctrl+Z 한 번으로 통째로 되돌아온다');
await page.evaluate(() => { KMV_AUDIO.voice = window.__voice; KMV_PROJECT.setS([]); (KMV_PROJECT.data.markers.slice()).forEach(m => KMV_PROJECT.removeMarker(m.id)); });

console.log('장면 나누기');
// diff 를 심는다: 원본 40·90 프레임에 한 프레임 솟구침(하드 컷), 200~215 는 팬(여러 프레임)
await page.evaluate(() => {
  const s = KMV_MEDIA.get(KMV_PROJECT.data.media[0].id);
  const d = new Float32Array(Math.max(300, s.frames)).fill(0.01);
  d[40] = 0.5; d[90] = 0.5; for (let i = 200; i < 215; i++) d[i] = 0.3;
  s.diff = d;
});
const clips0 = await page.evaluate(() => KMV_PROJECT.data.V.length);
await page.click('#btnScnFind');
const cuts = await page.evaluate(() => KMV_UI.autoPrev.cuts.slice());
ok(cuts.length === 2, '하드 컷 2곳만 (팬은 제외) → ' + JSON.stringify(cuts));
ok(await page.evaluate(() => KMV_PROJECT.data.V.length) === clips0, '찾기만으로는 안 나뉜다');
await page.click('#btnScnSplit');
ok(await page.evaluate(() => KMV_PROJECT.data.V.length) === clips0 + 2, '나누기 → 클립 ' + (clips0 + 2) + '개');
await page.keyboard.press('Control+z');
ok(await page.evaluate(() => KMV_PROJECT.data.V.length) === clips0, 'Ctrl+Z 한 번');

console.log('표시만 하기');
await page.evaluate(() => {
  const s = KMV_MEDIA.get(KMV_PROJECT.data.media[0].id);
  const mo = new Float32Array(Math.max(300, s.frames)).fill(0.15);
  for (let i = 50; i < 90; i++) mo[i] = 0.92;                     // 흔들림 한 곳
  s.motion = mo;
});
await page.click('#btnShake');
const mks = await page.evaluate(() => KMV_PROJECT.data.markers.map(m => m.text));
ok(mks.length >= 1 && mks.every(t => t === '흔들림'), '흔들린 곳에 마커 ' + mks.length + '개');
ok(await page.evaluate(() => KMV_PROJECT.data.V.length) === clips0, '표시만 — 클립은 안 건드린다');
await page.keyboard.press('Control+z');
ok(await page.evaluate(() => KMV_PROJECT.data.markers.length) === 0, '마커 여러 개도 Ctrl+Z 한 번');

console.log('군소리 정리');
await page.evaluate(() => KMV_PROJECT.setS([
  { text: '어 그 오늘은 운동회 날입니다', at: 10, dur: 60 },
  { text: '음 음', at: 80, dur: 30 },
  { text: '학생들이 달리기를 합니다', at: 120, dur: 60 },
]));
await page.evaluate(() => KMV_UI.tab('auto'));
await page.click('#btnFillFind');
ok((await page.textContent('#fillNote')).includes('군소리 4개') || (await page.textContent('#fillNote')).includes('군소리'), '찾기 → 개수 안내 → ' + (await page.textContent('#fillNote')).slice(0, 40));
await page.click('#btnFillStrip');
const sTexts = await page.evaluate(() => KMV_PROJECT.data.S.map(c => c.text));
ok(sTexts.length === 2 && sTexts[0] === '오늘은 운동회 날입니다' && sTexts[1] === '학생들이 달리기를 합니다', '낱말만 빠지고 통째로 군소리인 카드는 삭제 → ' + JSON.stringify(sTexts));
await page.keyboard.press('Control+z');
ok(await page.evaluate(() => KMV_PROJECT.data.S.length) === 3, 'Ctrl+Z 한 번');

console.log('미리보기 무효화');
await page.evaluate(() => { window.__voice2 = KMV_AUDIO.voice; KMV_AUDIO.voice = () => [{ at: 30, dur: 60 }, { at: 150, dur: 60 }]; });
await page.click('#btnSilFind');
ok(await page.evaluate(() => KMV_UI.autoPrev.sil.length) > 0, '다시 찾아 미리보기 생김');
await page.evaluate(() => KMV_PROJECT.split(60));
ok(await page.evaluate(() => KMV_UI.autoPrev.sil.length) === 0, '타임라인을 손대면 찾아 둔 자리는 버린다 (시각이 밀리므로)');
await page.evaluate(() => { KMV_AUDIO.voice = window.__voice2; });

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''));
console.log('\n' + (n - fail) + '/' + n + ' 통과');
await close(); srv.kill();
process.exit(fail ? 1 : 0);
