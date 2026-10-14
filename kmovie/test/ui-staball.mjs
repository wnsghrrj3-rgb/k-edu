// 케이무비 63단계 검증: 학생 도구상자 「흔들림 잡기」(더 보기 탭, 얼굴 가리기 아래) — 영상 전부 한 번에 약하게/세게/끄기, 2개 이상 골랐으면 고른 것만,
// undo 1회, 프리즈·빈 자리·사진 제외, 분석 중 안내, 픽셀이 실제로 달라짐(shake.mp4), 새로고침 복원, 콘솔 오류 0. (보정 정확도는 ui-stab 가 본다)
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-staball.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8795);
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_STAB);
const stabs = () => page.evaluate(() => KMV_PROJECT.data.V.filter(c => !c.gap).map(c => c.stab || '-'));
const note = () => page.evaluate(() => document.getElementById('stabAllNote').textContent);
const offDis = () => page.evaluate(() => document.getElementById('btnStabAllOff').disabled);
const pix = () => page.evaluate(() => { const P = KMV_PROJECT, W = P.w(), H = P.h(); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); KMV_RENDER.draw(cx, W, H, 20); const d = cx.getImageData(0, 0, W, H).data; let s = 0; for (let i = 0; i < d.length; i += 401) s += d[i]; return s; });

/* ---------- 1. 빈 타임라인 — 더 보기 탭, 얼굴 가리기 바로 아래 ---------- */
await page.evaluate(() => KMV_UI.tab('more'));
const p0 = await page.evaluate(() => { const sp = document.getElementById('stabPanel'), fp = document.getElementById('facePanel'), ap = document.getElementById('autoPanel'); return { vis: sp && getComputedStyle(sp).display !== 'none', afterFace: !!(fp.compareDocumentPosition(sp) & Node.DOCUMENT_POSITION_FOLLOWING), beforeAuto: !!(sp.compareDocumentPosition(ap) & Node.DOCUMENT_POSITION_FOLLOWING), tab: sp.dataset.tab, h3: sp.querySelector('h3').textContent }; });
ok(p0.vis && p0.afterFace && p0.beforeAuto && p0.tab === 'more' && /흔들림 잡기/.test(p0.h3), '「더 보기」 탭 얼굴 가리기 아래에 「흔들림 잡기」 패널');
ok(/영상을 넣으면/.test(await note()) && (await offDis()), '빈 타임라인 안내문 · 「끄기」 비활성');
await page.click('#btnStabAllA'); await page.waitForTimeout(150);
ok((await page.evaluate(() => KMV_PROJECT.data.V.length)) === 0, '영상 없이 눌러도 아무 일 없음');

/* ---------- 2. 흔들리는 원본 → 클립 3개 → 전부 약하게 (분석 끝날 때까지 안내) ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'shake.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.evaluate(() => { const c = KMV_PROJECT.data.V[0]; KMV_PROJECT.split(Math.round(c.dur / 3)); KMV_PROJECT.split(Math.round(c.dur * 2 / 3)); });
ok((await page.evaluate(() => KMV_PROJECT.data.V.length)) === 3 && /클립 3개 · 아직/.test(await note()), '클립 3개 · 안내문 「아직 잡는 게 없어요」');
await page.waitForFunction(() => { const m = KMV_MEDIA.get(KMV_PROJECT.data.media[0].id); return m && m.analyzed; }, null, { timeout: 90000 });
await page.evaluate(() => KMV_UI.select(null));
await page.waitForTimeout(400);
const px0 = await pix();
await page.click('#btnStabAllA'); await page.waitForTimeout(500);
ok(JSON.stringify(await stabs()) === JSON.stringify(['a', 'a', 'a']), '흔들림 잡기 → 3개 전부 약하게');
ok(/3개 중 3개 잡는 중 \(약하게\)/.test(await note()) && !(await note()).includes('분석 중') && !(await offDis()), '안내문 3/3 약하게 · 분석 끝 · 「끄기」 활성');
const px1 = await pix();
ok(px0 !== px1, '미리보기 픽셀이 달라짐(보정 적용)');
ok(await page.evaluate(() => Array.from(document.querySelectorAll('#stabSeg button')).length === 3), '설정 열 「흔들림」 3단 그대로');

/* ---------- 3. 같은 것 다시 = 변화 없음 · 세게로 ---------- */
const u0 = await page.evaluate(() => KMV_PROJECT.undoDepth ? KMV_PROJECT.undoDepth() : null);
await page.click('#btnStabAllA'); await page.waitForTimeout(150);
ok(JSON.stringify(await stabs()) === JSON.stringify(['a', 'a', 'a']) && (u0 == null || (await page.evaluate(() => KMV_PROJECT.undoDepth())) === u0), '같은 버튼 다시 → 그대로 · undo 안 쌓임');
await page.click('#btnStabAllB'); await page.waitForTimeout(150);
ok(JSON.stringify(await stabs()) === JSON.stringify(['b', 'b', 'b']) && /\(세게\)/.test(await note()), '세게 → 3개 전부 b · 안내문 (세게)');

/* ---------- 4. Ctrl+Z 한 번 ---------- */
await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
ok(JSON.stringify(await stabs()) === JSON.stringify(['a', 'a', 'a']), 'Ctrl+Z 한 번 → 3개 모두 약하게로');
await page.keyboard.press('Control+y'); await page.waitForTimeout(150);
ok(JSON.stringify(await stabs()) === JSON.stringify(['b', 'b', 'b']), 'Ctrl+Y → 다시 세게');

/* ---------- 5. 2개 이상 골랐으면 고른 것만 ---------- */
await page.evaluate(() => { const V = KMV_PROJECT.data.V; KMV_UI.select(V[0].id); KMV_UI.select(V[1].id, 'toggle'); });
ok(/고른 클립 2개에만/.test(await note()), '2개 골랐을 때 「고른 클립 2개에만」');
await page.click('#btnStabAllOff'); await page.waitForTimeout(150);
ok(JSON.stringify(await stabs()) === JSON.stringify(['-', '-', 'b']), '끄기 → 고른 2개만 꺼지고 셋째는 그대로');
await page.evaluate(() => KMV_UI.select(null));
ok(!/고른 클립/.test(await note()) && /3개 중 1개/.test(await note()), '선택 풀면 안내문 3개 중 1개');

/* ---------- 6. 전부 끄기 → 비활성 · 또 눌러도 오류 0 ---------- */
await page.click('#btnStabAllOff'); await page.waitForTimeout(150);
ok(JSON.stringify(await stabs()) === JSON.stringify(['-', '-', '-']) && (await offDis()), '전부 끄기 → stab 없음 · 「끄기」 비활성');
await page.evaluate(() => document.getElementById('btnStabAllOff').removeAttribute('disabled')); await page.click('#btnStabAllOff'); await page.waitForTimeout(100);
ok(JSON.stringify(await stabs()) === JSON.stringify(['-', '-', '-']), '없는데 또 끄기 → 아무 일 없음');

/* ---------- 7. 프리즈·빈 자리 제외 · 새로고침 복원 ---------- */
await page.evaluate(() => { const c = KMV_PROJECT.data.V[2]; KMV_UI.select(c.id); });
await page.keyboard.press(';'); await page.waitForTimeout(150);   // 셋째 리프트 = 빈 자리
await page.evaluate(() => { const c = KMV_PROJECT.data.V[1]; KMV_PROJECT.freeze(c.at + 1, 30); });
await page.evaluate(() => KMV_UI.select(null));
await page.click('#btnStabAllA'); await page.waitForTimeout(200);
const g = await page.evaluate(() => KMV_PROJECT.data.V.map(c => (c.gap ? 'gap' : c.freeze ? 'frz' : 'v') + ':' + (c.stab || '-')));
ok(g.filter(x => x.startsWith('gap')).length === 1 && g.every(x => x.startsWith('v:') ? x === 'v:a' : x.endsWith(':-')), '빈 자리·프리즈엔 안 붙고 영상 클립만 약하게 — ' + g.join(' '));
ok(/잡는 중/.test(await note()), '안내문에 잡는 중');
await page.waitForTimeout(900);
await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_PROJECT.data.V.length >= 3, null, { timeout: 30000 }); await page.waitForTimeout(400);
ok(await page.evaluate(() => KMV_PROJECT.data.V.filter(c => !c.gap && !c.freeze).every(c => c.stab === 'a')), '새로고침 복원');
await page.evaluate(() => KMV_UI.tab('more'));
ok(/잡는 중 \(약하게\)/.test(await note()), '복원 뒤 안내문 갱신');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
