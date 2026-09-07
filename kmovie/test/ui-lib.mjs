// 케이무비 내장 음원 라이브러리(engine/lib.js · assets/library.json) 검증 — 목록·무드·미리듣기·＋ 넣기·효과음 실음원 승격·빈 목록 안내.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-lib.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8782);
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
// 가짜 라이브러리 — 실제 assets/ 는 비어 있으므로 여기서 채운다
const LIBJ = { music: [
  { file: 'music/따뜻/아침 교실.mp3', title: '아침 교실', mood: '따뜻', dur: 30, license: 'Pixabay', source: 'pixabay.com' },
  { file: 'music/활기/운동회.wav', title: '운동회', mood: '활기', dur: 22 },
  { file: 'music/따뜻/하굣길.m4a', title: '하굣길', mood: '따뜻', dur: 12 },
], sfx: [{ file: 'sfx/click/딸깍.wav', title: '딸깍', replace: 'click' }, { file: 'sfx/기타/박수.wav', title: '박수', replace: '기타' }] };
let libEmpty = false;
await page.route('**/kmovie/assets/**', route => {
  const u = decodeURIComponent(route.request().url());
  if (u.endsWith('library.json')) return route.fulfill({ body: JSON.stringify(libEmpty ? { music: [], sfx: [] } : LIBJ), contentType: 'application/json' });
  const ext = u.slice(u.lastIndexOf('.'));
  const f = ext === '.mp3' ? 'music.mp3' : ext === '.m4a' ? 'music.m4a' : 'music.wav';
  return route.fulfill({ path: path.join(FX, f), contentType: ext === '.mp3' ? 'audio/mpeg' : ext === '.m4a' ? 'audio/mp4' : 'audio/wav' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_LIB && KMV_LIB.get());
await page.waitForFunction(() => document.querySelectorAll('#libList .lr').length === 3, null, { timeout: 15000 });
await page.click('#toolTabs button[data-tab=music]');

// ---------- 목록·무드 ----------
const l1 = await page.evaluate(() => ({
  rows: Array.from(document.querySelectorAll('#libList .lr .t')).map(e => e.firstChild.textContent),
  moods: Array.from(document.querySelectorAll('#libMoodSeg button')).map(b => b.textContent),
  note: document.getElementById('libNote').textContent, durs: Array.from(document.querySelectorAll('#libList .lr .d')).map(e => e.textContent),
  small: document.querySelector('#libList .lr small') && document.querySelector('#libList .lr small').textContent.trim(),
}));
ok(l1.rows.join('/') === '아침 교실/하굣길/운동회' && l1.moods.join('/') === '전부/따뜻/활기', '목록 3곡(무드순·제목순) · 무드 칩 전부/따뜻/활기 (' + l1.rows.join('/') + ')');
ok(l1.durs.join('/') === '0:30/0:12/0:22' && l1.small === 'Pixabay · pixabay.com', '길이·출처·라이선스 표시 (' + l1.durs.join('/') + ' · ' + l1.small + ')');
await page.click('#libMoodSeg button:nth-child(3)');
const l2 = await page.evaluate(() => Array.from(document.querySelectorAll('#libList .lr .t')).map(e => e.firstChild.textContent));
ok(l2.join('/') === '운동회', '무드 「활기」 고르면 그 곡만 (' + l2.join('/') + ')');
await page.click('#libMoodSeg button:nth-child(1)');

// ---------- 효과음 실음원 승격 ----------
await page.waitForFunction(() => KMV_LIB.realCount() >= 1, null, { timeout: 15000 });
const sf = await page.evaluate(() => {
  const actx = KMV_AUDIO.ctx(), real = KMV_SFX.realFor('click', 0), buf = KMV_SFX.buffer(actx, 'click', 0), synth = KMV_SFX.buffer(actx, 'popSoft', 0);
  return { cnt: KMV_LIB.realCount(), real: !!real, same: real === buf, realDur: real ? real.duration : 0, synthDur: synth.duration, note: document.getElementById('libNote').textContent };
});
ok(sf.cnt === 1 && sf.real && sf.same && sf.realDur > 5 && sf.synthDur < 1, '효과음: click 은 실음원(' + sf.realDur.toFixed(1) + 's)이 합성을 대신 · 폴더 이름이 id 가 아닌 「기타」는 안 붙음 · 안내 「' + sf.note + '」');

// ---------- 미리듣기 토글 ----------
await page.click('#libList .lr:nth-child(1) button.play');
const pv1 = await page.evaluate(() => ({ playing: KMV_LIB.playing(), txt: document.querySelector('#libList .lr:nth-child(1) button.play').textContent }));
await page.click('#libList .lr:nth-child(1) button.play');
const pv2 = await page.evaluate(() => KMV_LIB.playing());
ok(pv1.playing === 'lib0' && pv1.txt === '■' && pv2 === null, '미리듣기 ▶ → ■ 토글, 다시 누르면 멈춤');

// ---------- ＋ 넣기 → 음악 레인 ----------
await page.click('#libList .lr:nth-child(1) button.gold');
await page.waitForFunction(() => KMV_PROJECT.data.A2.length === 1, null, { timeout: 60000 });
const placed = await page.evaluate(() => { const a = KMV_PROJECT.data.A2[0], m = KMV_PROJECT.media(a.media); return { name: m.name, kind: m.kind, at: a.at, dur: a.out - a.in }; });
ok(placed.kind === 'audio' && placed.name === '아침 교실.mp3' && placed.at === 0 && placed.dur > 30, '＋ 넣기: 곡이 음악 레인 처음에 파일 이름 「아침 교실.mp3」 로 (' + placed.dur + 'f)');
await page.click('#libList .lr:nth-child(3) button.gold');
await page.waitForFunction(() => KMV_PROJECT.data.A2.length === 2, null, { timeout: 60000 });
ok(await page.evaluate(() => KMV_PROJECT.media(KMV_PROJECT.data.A2[1].media).name === '운동회.wav'), '두 번째 곡(wav)도 넣어짐');

// ---------- 빈 목록 안내 ----------
libEmpty = true;
await page.reload(); await page.waitForFunction(() => window.KMV_UI && window.KMV_LIB && KMV_LIB.get());
await page.click('#toolTabs button[data-tab=music]');
await page.waitForFunction(() => document.querySelector('#libList .note'), null, { timeout: 15000 });
const empty = await page.evaluate(() => ({ note: document.querySelector('#libList .note').textContent, moodHidden: document.getElementById('libMoodRow').classList.contains('hidden') }));
ok(empty.note.includes('assets/music') && empty.note.includes('scan.mjs') && empty.moodHidden, '음원이 없으면 넣는 법 안내 · 무드 칩 숨김');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\nui-lib: ${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
