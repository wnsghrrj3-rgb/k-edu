// 케이무비 56단계 검증: 사진 겹치기 — 미디어 띠에서 끌어 놓기(덧영상 레인·영상 레인·재생 화면), 자유 자리·크기, 화면에서 끌어 옮기기·모서리 크기, 슬라이더·테두리, 새로고침 복원.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-photo.mjs
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

// 원본 두 개 (a: 메인, b: 덧영상)
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.setInputFiles('#fileIn', [path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 2, null, { timeout: 90000 });

// 56: 사진 겹치기 — 미디어 띠에서 끌어 놓기(덧영상·V 끼워 넣기·재생 화면), 자유 자리·크기, 화면에서 끌어 옮기기·모서리 크기
await page.setInputFiles('#fileIn', [path.join(FX, 'still.png')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 3, null, { timeout: 90000 });
await page.evaluate(() => { const P = KMV_PROJECT; const c = P.data.V[2]; P.removeClip(c.id); KMV_UI.setPH(20); });   // 사진 클립은 빼고 보관함엔 남김
const img = await page.evaluate(() => KMV_PROJECT.data.media.find(m => m.kind === 'image').id);
ok(!!img, '사진이 보관함에 있다');
const tile = async () => { const b = await page.locator('.mi').filter({ hasText: 'still' }).first().boundingBox(); return b; };
const tlBox = await page.locator('#timeline').boundingBox();
const lanes = await page.evaluate(() => ({ V2: KMV_UI.layout.LY.V2, V: KMV_UI.layout.LY.V, HEAD: KMV_UI.layout.HEAD }));
const xAt = await page.evaluate(() => KMV_UI.xOf(45));
// 1) 덧영상 레인에 끌어 놓기 → V2 카드(자유 자리)
{ const b = await tile(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + 40, b.y - 40, { steps: 4 }); await page.mouse.move(tlBox.x + xAt, tlBox.y + lanes.V2.y + lanes.V2.h / 2, { steps: 6 }); await page.waitForTimeout(80);
  const ghost = await page.evaluate(() => ({ shown: !document.getElementById('partGhost').classList.contains('hidden'), txt: document.getElementById('partGhost').textContent }));
  await page.mouse.up(); await page.waitForTimeout(150);
  const r = await page.evaluate(() => { const P = KMV_PROJECT; const o = P.data.V2[P.data.V2.length - 1]; return { n: P.data.V2.length, o, sel: KMV_UI.selV2, srcOpen: !!KMV_UI.src, v: P.data.V.length }; });
  ok(ghost.shown && /겹치기/.test(ghost.txt), '끌면 고스트에 「영상 위에 겹치기」 (' + ghost.txt + ')');
  ok(r.n === 1 && r.o && r.o.media === img && r.o.pos === 'free' && Math.abs(r.o.sc - 0.45) < 1e-6 && r.sel === r.o.id && r.v === 2 && !r.srcOpen, '덧영상 레인에 놓기 → 사진이 자유 자리 덧영상으로(at ' + (r.o && r.o.at) + ', 클립 수 그대로, 소스 안 열림)');
}
// 2) 재생 화면에 그려지는지 + 자리 계산
const rect0 = await page.evaluate(() => { const P = KMV_PROJECT, o = P.data.V2[0], m = P.media(o.media); return KMV_RENDER.overlayRect(o, m, P.w(), P.h()); });
ok(rect0.w === Math.round(1920 * 0.45) && Math.abs(rect0.x + rect0.w / 2 - 960) <= 1 && Math.abs(rect0.y + rect0.h / 2 - 540) <= 1, '자유 자리 = 화면 가운데, 너비 45% (' + JSON.stringify(rect0) + ')');
await page.evaluate(() => { KMV_UI.setPH(50); });
await page.waitForTimeout(600);
const px = await page.evaluate(() => { const pv = document.getElementById('preview'), c = pv.getContext('2d'); const mid = c.getImageData(960, 540, 1, 1).data, edge = c.getImageData(60, 60, 1, 1).data; return { mid: Array.from(mid), edge: Array.from(edge) }; });
ok(px.mid[3] > 0, '미리보기 가운데에 사진이 그려짐 (' + px.mid.join(',') + ' / 가장자리 ' + px.edge.join(',') + ')');
// 3) 화면에서 끌어 옮기기 (몸통) → fx·fy 변화, Ctrl+Z 한 번
{ const pvB = await page.locator('#preview').boundingBox();
  const c = await page.evaluate(() => { const pv = document.getElementById('preview'), r = pv.getBoundingClientRect(); const k = Math.max(1920 / r.width, 1080 / r.height); return { ox: r.left + (r.width - 1920 / k) / 2, oy: r.top + (r.height - 1080 / k) / 2, k }; });
  const sx = c.ox + 960 / c.k, sy = c.oy + 540 / c.k;
  await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx - 100 / c.k * 1, sy - 60 / c.k, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(150);
  const o = await page.evaluate(() => KMV_PROJECT.data.V2[0]);
  ok(o.pos === 'free' && Math.abs(o.fx - (960 - 100) / 1920) < 0.01 && Math.abs(o.fy - (540 - 60) / 1080) < 0.01, '몸통 끌기 → 자리 이동 (fx ' + o.fx.toFixed(3) + ' fy ' + o.fy.toFixed(3) + ')');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(100);
  const u = await page.evaluate(() => KMV_PROJECT.data.V2[0]);
  ok(Math.abs(u.fx - 0.5) < 1e-6 && Math.abs(u.fy - 0.5) < 1e-6, 'Ctrl+Z 한 번에 원래 자리');
  // 모서리 끌기 → 크기
  const R = await page.evaluate(() => { const P = KMV_PROJECT, o = P.data.V2[0]; return KMV_RENDER.overlayRect(o, P.media(o.media), 1920, 1080); });
  const gx = c.ox + (R.x + R.w - 8) / c.k, gy = c.oy + (R.y + R.h - 8) / c.k;
  await page.mouse.move(gx, gy); await page.waitForTimeout(50);
  const cur = await page.evaluate(() => document.getElementById('preview').style.cursor);
  await page.mouse.down(); await page.mouse.move(gx + 192 / c.k, gy + 100 / c.k, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(150);
  const o2 = await page.evaluate(() => KMV_PROJECT.data.V2[0]);
  const R2 = await page.evaluate(() => { const P = KMV_PROJECT, o = P.data.V2[0]; return KMV_RENDER.overlayRect(o, P.media(o.media), 1920, 1080); });
  ok(cur === 'nwse-resize' && Math.abs(o2.sc - 0.55) < 0.01 && Math.abs(R2.x - R.x) <= 2 && Math.abs(R2.y - R.y) <= 2, '모서리 끌기 → 크기 45→' + Math.round(o2.sc * 100) + '% · 왼쪽 위 고정 (커서 ' + cur + ')');
}
// 4) 설정 열: 슬라이더·테두리 토글
{ await page.evaluate(() => { const s = document.getElementById('v2Sc'); s.value = 30; s.dispatchEvent(new Event('input')); s.dispatchEvent(new Event('change')); });
  await page.waitForTimeout(80);
  const a = await page.evaluate(() => ({ sc: KMV_PROJECT.data.V2[0].sc, shown: !document.getElementById('v2Body').classList.contains('hidden'), hint: document.getElementById('v2Hint').textContent, lbl: document.getElementById('v2ScV').textContent }));
  await page.click('#tgV2Frame'); await page.waitForTimeout(80);
  const f = await page.evaluate(() => KMV_PROJECT.data.V2[0].frame);
  ok(a.shown && Math.abs(a.sc - 0.3) < 1e-6 && a.lbl === '30%' && /끌어/.test(a.hint) && f === false, '설정: 크기 슬라이더 30% · 테두리 끄기 (' + a.hint + ')');
}
// 5) 영상 레인에 끌어 놓기 → 끼워 넣기
{ const b = await tile(); const v0 = await page.evaluate(() => KMV_PROJECT.data.V.length);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + 40, b.y - 40, { steps: 4 }); await page.mouse.move(tlBox.x + xAt, tlBox.y + lanes.V.y + lanes.V.h / 2, { steps: 6 }); await page.waitForTimeout(80);
  const ghost = await page.evaluate(() => document.getElementById('partGhost').textContent);
  await page.mouse.up(); await page.waitForTimeout(150);
  const r = await page.evaluate(() => { const P = KMV_PROJECT; const c = P.clip(KMV_UI.sel); return { v: P.data.V.length, at: c && c.at, img: c && P.media(c.media).kind === 'image', v2: P.data.V2.length }; });
  ok(/끼워/.test(ghost) && r.v === v0 + 2 && r.img && r.at === 45 && r.v2 === 1, '영상 레인에 놓기 → 45f 에 사진 클립 끼워 넣기(클립 가운데라 둘로 갈라짐, ' + v0 + '→' + r.v + ')');
  await page.keyboard.press('Control+z');
}
// 6) 재생 화면에 끌어 놓기 → 플레이헤드에 덧영상
{ const b = await tile(); const pvB = await page.locator('#stage').boundingBox(); await page.evaluate(() => KMV_UI.setPH(70));
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + 40, b.y - 40, { steps: 4 }); await page.mouse.move(pvB.x + pvB.width / 2, pvB.y + pvB.height / 2, { steps: 6 }); await page.waitForTimeout(80);
  const ghost = await page.evaluate(() => document.getElementById('partGhost').textContent);
  await page.mouse.up(); await page.waitForTimeout(150);
  const r = await page.evaluate(() => { const P = KMV_PROJECT; const o = P.data.V2[P.data.V2.length - 1]; return { n: P.data.V2.length, at: o.at, pos: o.pos }; });
  ok(/화면 위/.test(ghost) && r.n === 2 && r.at === 70 && r.pos === 'free', '재생 화면에 놓기 → 플레이헤드(70f) 덧영상 (' + r.at + ')');
}
// 7) 짧게 클릭은 종전대로 소스 열기
{ const b = await tile(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150);
  const s = await page.evaluate(() => ({ src: KMV_UI.src && KMV_UI.src.media, stage: KMV_UI.stage }));
  ok(s.src === img && s.stage === 'src', '클릭(안 끌면)은 종전대로 소스 모니터 열기');
  await page.keyboard.press('Escape');
}
// 8) 새로고침 복원 — free·sc·frame
await page.evaluate(() => KMV_UI.saveNow && KMV_UI.saveNow());
await page.waitForTimeout(600); await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_PROJECT.data.V2.length === 2, null, { timeout: 60000 });
const re = await page.evaluate(() => KMV_PROJECT.data.V2[0]);
ok(re.pos === 'free' && Math.abs(re.sc - 0.3) < 1e-6 && re.frame === false, '새로고침 복원: 자유 자리·크기·테두리 끔');
const lbl = await page.evaluate(() => KMV_UI.laneRows ? 1 : 0);
ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
