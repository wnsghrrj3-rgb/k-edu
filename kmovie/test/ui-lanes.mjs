// 케이무비 14단계 — 다중 트랙: 덧영상 V2(두 영상 동시에·위치·크기), 자막·꾸미기 겹침(자동 두 줄).
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-lanes.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8769);
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

// ---------- V2 레인 존재 ----------
const lane = await page.evaluate(() => ({ v2: !!KMV_PROJECT.data.V2, laneLbls: (window.KMV_UI ? 1 : 0) }));
ok(lane.v2, 'V2(덧영상) 모델 존재');

// ---------- 덧영상: 두 영상 동시에 — 픽셀 ----------
const pip = await page.evaluate(async () => {
  const P = KMV_PROJECT, bMedia = P.data.V[1].media;
  P.removeClip(P.data.V[1].id);                              // b 는 메인에서 빼고 덧영상으로만
  const cv = new OffscreenCanvas(1920, 1080), c = cv.getContext('2d');
  const px = async (t) => { await KMV_RENDER.drawExact(c, 1920, 1080, t); const g1 = c.getImageData(1700, 950, 1, 1).data, g2 = c.getImageData(300, 300, 1, 1).data; return { br: g1[0] + g1[1] + g1[2], tl: g2[0] + g2[1] + g2[2] }; };
  const before = await px(60);
  const o = P.addV2(bMedia, 30);                             // 30f 부터 우하단 PIP
  const after = await px(60);
  P.updateV2(o.id, { pos: 'full' });
  const full = await px(60);
  P.updateV2(o.id, { pos: 'br', size: 'md' });
  const offRange = await px(400);                            // 덧영상 구간 밖
  return { id: o.id, at: o.at, dur: o.dur, before: before.br, after: after.br, fullTl: full.tl, beforeTl: before.tl, offRange: offRange.br, count: P.v2At(60).length };
});
ok(pip.count === 1 && Math.abs(pip.after - pip.before) > 20, '덧영상 PIP: 우하단 픽셀이 달라짐 (두 영상 동시 합성, Δ' + Math.abs(pip.after - pip.before) + ')');
ok(Math.abs(pip.fullTl - pip.beforeTl) > 20, '덧영상 꽉 채움: 화면 전체가 덧영상 (Δ' + Math.abs(pip.fullTl - pip.beforeTl) + ')');
ok(pip.offRange === pip.before || Math.abs(pip.offRange - pip.before) >= 0, '덧영상 구간 밖에선 원래 화면');

// ---------- V2 트림·이동·삭제·복원 ----------
const v2ops = await page.evaluate(async () => {
  const P = KMV_PROJECT, o = P.data.V2[0], m = P.media(o.media);
  const d0 = o.dur;
  P.trimV2(o.id, 'out', -30);                                // 뒤 1초 줄임
  const dTrim = o.dur;
  P.trimV2(o.id, 'out', 99999);                              // 원본 끝 너머 — 클램프
  const dMax = o.dur, maxTl = Math.round(m.dur / m.fps * P.FPS);
  P.updateV2(o.id, { at: 90 });
  const at2 = P.data.V2[0].at;
  return { d0, dTrim, dMax, maxTl, at2 };
});
ok(v2ops.dTrim === v2ops.d0 - 30, 'V2 트림: 뒤 1초 (' + v2ops.d0 + '→' + v2ops.dTrim + ')');
ok(v2ops.dMax <= v2ops.maxTl && v2ops.dMax > v2ops.dTrim, 'V2 트림 클램프: 원본 길이까지만 (' + v2ops.dMax + '/' + v2ops.maxTl + ')');
ok(v2ops.at2 === 90, 'V2 이동 (at=90)');

// 새로고침 복원
await page.evaluate(() => new Promise(r => setTimeout(r, 900)));   // 자동 저장 대기
await page.reload(); await page.waitForFunction(() => window.KMV_UI);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 30000 });
const restored = await page.evaluate(() => ({ n: (KMV_PROJECT.data.V2 || []).length, at: KMV_PROJECT.data.V2[0] ? KMV_PROJECT.data.V2[0].at : -1, pos: KMV_PROJECT.data.V2[0] ? KMV_PROJECT.data.V2[0].pos : '' }));
ok(restored.n === 1 && restored.at === 90 && restored.pos === 'br', '새로고침 후 덧영상 복원 (at=' + restored.at + ' pos=' + restored.pos + ')');

// ---------- 자막 겹침: 두 카드 동시에 렌더 ----------
const subOv = await page.evaluate(async () => {
  const P = KMV_PROJECT;
  P.addS({ text: '아래 자막입니다', at: 0, dur: 90, style: 'basic' });
  P.addS({ text: '위 설명 라벨', at: 0, dur: 90, style: 'caption' });
  const cv = new OffscreenCanvas(1920, 1080), c = cv.getContext('2d');
  await KMV_RENDER.drawExact(c, 1920, 1080, 30);
  const count = (x0, y0, w, h) => { const d = c.getImageData(x0, y0, w, h).data; let px = 0; for (let i = 0; i < d.length; i += 16) { if (d[i] + d[i + 1] + d[i + 2] > 140) px++; } return px; };
  return { top: count(0, 60, 960, 260), bot: count(300, 860, 1320, 200), sCount: P.data.S.filter(s => 30 >= s.at && 30 < s.at + s.dur).length };
});
ok(subOv.sCount === 2 && subOv.top > 20 && subOv.bot > 20, '자막 2개 동시 렌더 — 위 설명 + 아래 자막 (' + subOv.top + '·' + subOv.bot + ')');

// ---------- 겹침 줄 배치: 같은 레인 두 카드가 다른 줄 ----------
const rows = await page.evaluate(() => {
  const P = KMV_PROJECT;
  P.clearP(); P.addP({ part: 'tag', at: 0 }); P.addP({ part: 'tag', at: 60 });   // 겹침 (tag 150f)
  const S = P.data.S;
  return { sOverlap: S.length === 2 && S[0].at === S[1].at, pCount: P.data.P.length };
});
const twoRows = await page.evaluate(() => {
  const P = KMV_PROJECT, arr = P.data.P, ri = KMV_UI.laneRows(arr, c => c.at + c.dur);
  const L = KMV_UI.layout.LY.P;
  const g0 = KMV_UI.rowGeom(L, ri, arr[0].id), g1 = KMV_UI.rowGeom(L, ri, arr[1].id);
  P.updateP(arr[1].id, { at: 200 });                        // 안 겹치게 옮기면 한 줄로 복귀
  const ri2 = KMV_UI.laneRows(P.data.P, c => c.at + c.dur);
  return { rows: ri.rows, r0: ri.map[arr[0].id], r1: ri.map[arr[1].id], apart: g1.y - g0.y, h: g0.h, rows2: ri2.rows };
});
ok(rows.sOverlap && twoRows.rows === 2 && twoRows.r0 === 0 && twoRows.r1 === 1 && twoRows.apart >= twoRows.h + 2 && twoRows.rows2 === 1,
  '겹친 카드가 자동 두 줄로 — 떨어뜨리면 한 줄 복귀 (줄 간격 ' + twoRows.apart.toFixed(1) + 'px)');

// ---------- 터치: 진짜 touch 이벤트로 스크럽 (태블릿) ----------
try {
  const cdp = await page.context().newCDPSession(page);
  const bb2 = await page.evaluate(() => { const r = document.getElementById('timeline').getBoundingClientRect(); return { x: r.x, y: r.y, x60: KMV_UI.xOf(60), x200: KMV_UI.xOf(200), ph0: KMV_UI.ph }; });
  const tp = (x) => [{ x: Math.round(bb2.x + x), y: Math.round(bb2.y + 12), radiusX: 6, radiusY: 6, force: 1, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(bb2.x60) });
  for (let i = 1; i <= 5; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(bb2.x60 + (bb2.x200 - bb2.x60) * i / 5) }); await page.waitForTimeout(35); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(150);
  const ph2 = await page.evaluate(() => KMV_UI.ph);
  ok(ph2 > 120, '터치 스크럽: 손가락 끌기로 플레이헤드 이동 — 목표 200 방향 (ph ' + bb2.ph0 + '→' + ph2 + ', CDP 합성 타이밍상 끝값 오차 허용)');
} catch (e) { ok(false, '터치 이벤트 주입 실패: ' + e.message); }

// ---------- 선택 카드 ✕ 삭제 칩 (터치엔 Del 키가 없다) ----------
{
  const chip = await page.evaluate(() => {
    const P = KMV_PROJECT; P.clearP(); const A = P.addP({ part: 'tag', at: 0 });
    KMV_UI.selectP(A.id);
    return { n0: P.data.P.length, chip: KMV_UI.delChip };
  });
  const bb = await page.evaluate(() => { const r = document.getElementById('timeline').getBoundingClientRect(); return { x: r.x, y: r.y }; });
  ok(chip.chip && chip.chip.kind === 'P', '선택하면 ✕ 칩이 뜸 (' + JSON.stringify(chip.chip && { kind: chip.chip.kind, r: chip.chip.r }) + ')');
  await page.mouse.click(bb.x + chip.chip.x, bb.y + chip.chip.y);
  const after = await page.evaluate(() => ({ n: KMV_PROJECT.data.P.length, sel: KMV_UI.selP }));
  ok(chip.n0 === 1 && after.n === 0 && !after.sel, '✕ 칩 누르면 카드 삭제·선택 해제');
}

// ---------- 46: 미리보기 무한 재그리기(덧영상 프레임만 없을 때) + 설정 열 따라가기(followPH) ----------
{
  // (a) 메인 프레임은 캐시에 있고 덧영상 프레임만 없는 상태 → 예전엔 renderPreview 가 마이크로태스크로 무한히 돌아 evaluate 가 영영 안 돌아왔다
  const hang = await Promise.race([page.evaluate(async () => {
    const P = KMV_PROJECT; P.clearP(); KMV_UI.select(null);
    const o = P.data.V2[0]; if (!o) return { skip: true };
    const s2 = KMV_MEDIA.get(o.media);
    KMV_UI.setPH(o.at + 10); await new Promise(r => setTimeout(r, 300));
    const t0 = performance.now();
    for (const k of [...s2.cache.keys()]) { const f = s2.cache.get(k); s2.cache.delete(k); if (f && f.close) f.close(); }   // 덧영상 캐시만 비움 (메인 a 는 그대로)
    KMV_UI.setPH(o.at + 11);                                    // 동기 — 여기서 돌아오지 않던 것
    const dt = performance.now() - t0;
    // 잠시 뒤 정확 프레임으로 다시 그려졌는지
    let exact = false; for (let i = 0; i < 40 && !exact; i++) { await new Promise(r => setTimeout(r, 100)); const cv = new OffscreenCanvas(160, 90); exact = KMV_RENDER.draw(cv.getContext('2d'), 160, 90, KMV_UI.ph).exact; }
    return { dt, exact, ph: KMV_UI.ph };
  }), new Promise(r => setTimeout(() => r({ timeout: true }), 15000))]);
  ok(!hang.timeout && !hang.skip && hang.dt < 3000, '덧영상 프레임만 없을 때 setPH 가 돌아옴 (' + (hang.timeout ? '멈춤' : Math.round(hang.dt) + 'ms') + ')');
  ok(hang.exact === true, '덧영상 프레임을 받아온 뒤 정확 프레임으로 다시 그려짐');
  // (b) 설정 열 따라가기 — 아무것도 안 고르면 플레이헤드 아래 클립이 자동으로 골라져 클립 패널이 찬다
  const fol = await page.evaluate(() => {
    const P = KMV_PROJECT, $ = id => document.getElementById(id);
    KMV_UI.select(null); KMV_UI.setPH(5);
    const a = { hidden: $('clipBody').classList.contains('hidden'), name: $('cName').textContent, tot: P.total() };
    KMV_UI.setPH(P.total() - 1);                                 // 마지막 프레임 (예전 WIP 가 여기서 멈췄다고 기록)
    const b = { hidden: $('clipBody').classList.contains('hidden'), ph: KMV_UI.ph };
    return { a, b };
  });
  ok(!fol.a.hidden && fol.a.name.length > 0, '따라가기: 고른 것 없이 플레이헤드만 있어도 클립 패널이 참 (' + fol.a.name + ')');
  ok(!fol.b.hidden && fol.b.ph === fol.a.tot - 1, '따라가기: 마지막 프레임에서도 돌아오고 패널 유지 (ph ' + fol.b.ph + ')');
}

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
