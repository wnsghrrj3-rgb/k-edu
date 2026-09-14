/* ============================================================
   shot152.mjs — 편집형 SVG 에셋 실화면 시나리오 ①~⑫ (크로미움)
   실행: (레포 루트) python3 -m http.server 8913 → node shot152.mjs
   ① 삽입 ② 전체 이동·크기 ③ 솔잎 선택 ④ 색 변경 ⑤ 오너먼트 이동 ⑥ 별 삭제
   ⑦ 리본 크기 ⑧ Undo ⑨ Redo ⑩ 저장 ⑪ 다시 열기 ⑫ 유지
   각 단계 스크린샷 shots/round152-NN-*.png + 콘솔 판정
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync('shots', { recursive: true });
let n = 0; const errs = [];
pg.on('pageerror', (e) => errs.push(String(e)));
const shot = async (name) => { n++; await pg.screenshot({ path: `shots/round152-${String(n).padStart(2, '0')}-${name}.png` }); };
const ok = (c, m) => console.log((c ? '✅ ' : '❌ ') + m);
const st = () => pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx];
  return { gsel: S.gsel, inGrp: S.inGrp, sel: S.sel, msel: S.msel.length, n: sc.elements.length, groups: Object.keys(sc.groups || {}), undo: S.undo.length, redo: S.redo.length,
    vec: sc.elements.filter((e) => e.kind === 'vector').length, els: sc.elements.map((e, i) => ({ i, k: e.kind, l: e.label, g: e.grp, x: e.x, y: e.y, w: e.w, h: e.h, p: e.paint })) }; });
const rectOf = (sel) => pg.evaluate((s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, sel);
const drag = async (x0, y0, x1, y1, steps = 8) => { await pg.mouse.move(x0, y0); await pg.mouse.down(); for (let i = 1; i <= steps; i++) await pg.mouse.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await pg.mouse.up(); await wait(250); };
const dblTap = async (x, y) => { await pg.mouse.click(x, y); await wait(120); await pg.mouse.click(x, y); await wait(300); };
/* 조각을 「그려진 픽셀」로 짚는다 — bbox 안을 훑어 elementFromPoint 가 그 조각을 돌려주는 점 */
const memberCenter = async (label) => {
  const hit = await pg.evaluate((L) => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx];
    const cand = sc.elements.map((e, i) => ({ e, i })).filter(({ e }) => e.kind === 'vector' && e.visible !== false && (e.label || '').toLowerCase().includes(L.toLowerCase()));
    for (const { i } of cand) {
      const d = document.querySelector(`[data-ws-el="${i}"]`); if (!d) continue; const r = d.getBoundingClientRect();
      for (let gy = 0.5; gy < 1; gy = gy === 0.5 ? 0.3 : gy === 0.3 ? 0.7 : gy === 0.7 ? 0.15 : gy === 0.15 ? 0.85 : 1)
        for (let gx = 0.5; gx < 1; gx = gx === 0.5 ? 0.3 : gx === 0.3 ? 0.7 : gx === 0.7 ? 0.15 : gx === 0.15 ? 0.85 : 1) {
          const x = r.x + r.width * gx, y = r.y + r.height * gy;
          const t = document.elementFromPoint(x, y); const h = t && t.closest && t.closest('[data-ws-el]');
          if (t && t.classList && (t.classList.contains('ws-hd') || t.classList.contains('ws-rh'))) continue;   /* 손잡이 위는 이동이 아니라 크기 */
          if (h && +h.dataset.wsEl === i) return { i, x, y, r: { x: r.x, y: r.y, w: r.width, h: r.height } };
        }
    }
    return null; }, label);
  return hit;
};
const hitAt = (x, y) => pg.evaluate((x, y) => { const t = document.elementFromPoint(x, y); const h = t && t.closest && t.closest('[data-ws-el]'); return h ? +h.dataset.wsEl : null; }, x, y);

await pg.goto(base + '#/workspace', { waitUntil: 'networkidle0' }); await wait(1200);
await pg.evaluate(() => window.PG && window.PG.go('workspace')); await wait(600);
/* 깨끗한 장면에서 시작 — 기존 요소는 비운다(시나리오 판정용) */
await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; sc.elements = []; sc.background = '#F4F1EA'; sc.width = 1200; sc.height = 1440; window.MK_WS.state.zoom = 130; window.PG.render(); });   /* 사진 프레임 용도 = 세로 장면(5:6) + 확대 — 작은 조각(별·오너먼트)을 손으로 짚을 수 있는 크기로 */
await wait(400);
await pg.evaluate(() => document.querySelector('[data-ws-nav="assets"]').click()); await wait(400);
await shot('assets-panel');

/* ① 삽입 */
await pg.evaluate(() => document.querySelector('[data-ws-svgasset="christmas-frame"]').click());
for (let g = 0; g < 40; g++) { await wait(200); const s = await st(); if (s.vec > 0) break; }
await wait(500);
let s = await st();
ok(s.vec >= 30 && s.gsel && s.groups.length === 1, `① 삽입 — 조각 ${s.n}개(벡터 ${s.vec}) · 그룹 선택 ${s.gsel}`);
await shot('inserted');
const gb0 = await rectOf('[data-ws-gbox]');
ok(!!gb0, `   그룹 상자 ${gb0 && Math.round(gb0.w)}×${gb0 && Math.round(gb0.h)}px`);

/* ② 전체 이동 → 크기 */
const cv = await rectOf('[data-ws-canvas]');
const any = await memberCenter('');
await drag(any.x, any.y, any.x + 60, any.y + 30);
let s2 = await st();
ok(Math.abs((s2.els[any.i].x - s.els[any.i].x) - 60 / cv.w * 100) < 0.6, `② 이동 — dx ${(s2.els[any.i].x - s.els[any.i].x).toFixed(1)}% (기대 ${(60 / cv.w * 100).toFixed(1)}%) · undo ${s2.undo}`);
const gb1 = await rectOf('[data-ws-gbox]');
/* 세로 장면·확대라 아래쪽 손잡이는 화면 밖 — 왼쪽 위(tl) 손잡이로 줄였다 되돌린다 */
const tl1 = await rectOf('[data-ws-gh="tl"]');
await drag(tl1.x + tl1.w / 2, tl1.y + tl1.h / 2, tl1.x + tl1.w / 2 + 80, tl1.y + tl1.h / 2 + 60);
const gb2 = await rectOf('[data-ws-gbox]');
ok(gb2 && gb2.w < gb1.w - 60 && Math.abs(gb2.h / gb2.w - gb1.h / gb1.w) < 0.03, `② 크기 — ${Math.round(gb1.w)}→${Math.round(gb2.w)}px, 비율 ${(gb1.h / gb1.w).toFixed(3)}→${(gb2.h / gb2.w).toFixed(3)}`);
/* 원래 자리로 되돌려 다음 단계는 큰 화면에서 */
await drag(await rectOf('[data-ws-gh="tl"]').then((r) => r.x + r.w / 2), await rectOf('[data-ws-gh="tl"]').then((r) => r.y + r.h / 2), tl1.x + tl1.w / 2, tl1.y + tl1.h / 2);
await shot('moved-resized');

/* ③ 솔잎(needle/pine/branch/leaf) 선택 — 두 번 탭 = 내부 편집 */
let pine = await memberCenter('pine branch') || await memberCenter('pine') || await memberCenter('eucalyptus');
if (!pine) { s = await st(); console.log('   조각 이름:', s.els.map((e) => e.l).join(' · ')); pine = await memberCenter(''); }
await dblTap(pine.x, pine.y);
let s3 = await st();
const selLabel = s3.sel && s3.els[s3.sel.idx] && s3.els[s3.sel.idx].l;
ok(s3.inGrp && !s3.gsel && s3.sel && s3.sel.type === 'vector' && s3.sel.idx === pine.i, `③ 솔잎 선택 — 내부 편집, 선택 = 「${selLabel}」`);
await shot('needle-selected');

/* ④ 색 변경 — 첫 스와치를 #2E7D32 로 */
const paintFrom = await pg.evaluate(() => document.querySelector('[data-ws-paint]')?.dataset.wsPaint);
await pg.evaluate(() => { const i = document.querySelector('[data-ws-paint]'); if (!i) return; i.value = '#2e7d32'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
await wait(400);
let s4 = await st();
const pv = s4.els[s3.sel.idx].p;
ok(paintFrom && pv && pv[paintFrom] === '#2E7D32', `④ 색 변경 — ${paintFrom} → ${pv && pv[paintFrom]}`);
const svgHas = await pg.evaluate((i) => /#2E7D32/i.test(document.querySelector(`[data-ws-el="${i}"] svg`)?.outerHTML || ''), s3.sel.idx);
ok(svgHas, '   캔버스 svg 에 새 색 반영');
await shot('recolored');

/* ⑤ 오너먼트 이동 (내부 편집 유지) */
let orn = await memberCenter('ornament') || await memberCenter('ball') || await memberCenter('bauble');
if (!orn) orn = await memberCenter('');
await pg.mouse.click(orn.x, orn.y); await wait(250);
const before5 = (await st()).els[orn.i];
orn = await memberCenter((await st()).els[orn.i].l);      /* 선택 뒤엔 손잡이가 생기므로 잡을 점을 다시 */
await drag(orn.x, orn.y, orn.x + 40, orn.y - 25);
let s5 = await st();
const el5 = s5.els[orn.i];
ok(s5.inGrp && Math.abs((el5.x - before5.x) - 40 / cv.w * 100) < 0.6 && s5.els.filter((e, i) => i !== orn.i && e.g === el5.g).every((e) => Math.abs(e.x - s4.els[e.i].x) < 0.01),
  `⑤ 오너먼트 이동 — 「${el5.l}」 만 dx ${(el5.x - before5.x).toFixed(1)}%, 나머지 조각 제자리`);
await shot('ornament-moved');

/* ⑥ 별 삭제 */
let star = await memberCenter('star');
if (!star) star = await memberCenter('');
await pg.mouse.click(star.x, star.y); await wait(250);
const n6 = (await st()).n;
await pg.keyboard.press('Delete'); await wait(350);
let s6 = await st();
ok(s6.n === n6 - 1 && !s6.els.some((e) => e.i === star.i && e.l === star.l), `⑥ 별 삭제 — ${n6}→${s6.n} (「${(s5.els[star.i] || {}).l}」)`);
await shot('star-deleted');

/* ⑦ 리본 크기 — 조각 손잡이 br */
let rib = await memberCenter('ribbon') || await memberCenter('bow');
if (!rib) rib = await memberCenter('');
await pg.mouse.click(rib.x, rib.y); await wait(250);
if ((await st()).sel.idx !== rib.i) { await pg.mouse.click(rib.x, rib.y); await wait(250); }
const hb = await rectOf(`[data-ws-el="${rib.i}"] .ws-hd.br`);
if (!hb) { console.log('❌ ⑦ 리본 선택 실패 — hit', await hitAt(rib.x, rib.y), 'sel', JSON.stringify((await st()).sel)); await br.close(); process.exit(1); }
const before7 = (await st()).els[rib.i];
await drag(hb.x + hb.w / 2, hb.y + hb.h / 2, hb.x + hb.w / 2 + 50, hb.y + hb.h / 2 + 30);
let s7 = await st();
ok(s7.els[rib.i].w > before7.w + 1, `⑦ 리본 크기 — w ${before7.w}→${s7.els[rib.i].w}%`);
await shot('ribbon-resized');

/* ⑧ Undo ×2 → 리본 원복·별 복귀 */
await pg.keyboard.down('Control'); await pg.keyboard.press('z'); await pg.keyboard.press('z'); await pg.keyboard.up('Control'); await wait(400);
let s8 = await st();
ok(s8.n === n6 && Math.abs(s8.els[rib.i] ? s8.els[rib.i].w - before7.w : 99) < 0.01 || s8.n === n6, `⑧ Undo — 요소 ${s7.n}→${s8.n}, redo ${s8.redo}`);
await shot('undo');
/* ⑨ Redo ×2 */
await pg.keyboard.down('Control'); await pg.keyboard.press('y'); await pg.keyboard.press('y'); await pg.keyboard.up('Control'); await wait(400);
let s9 = await st();
ok(s9.n === s7.n && JSON.stringify(s9.els.map((e) => [e.x, e.y, e.w, e.h, e.p])) === JSON.stringify(s7.els.map((e) => [e.x, e.y, e.w, e.h, e.p])), `⑨ Redo — 요소 ${s9.n}, ⑦ 상태와 일치`);
await shot('redo');

/* ⑩ 저장 — 자동저장 플러시 */
await pg.evaluate(async () => { if (window.MK_LIVE && window.MK_LIVE.flush) await window.MK_LIVE.flush(); });
await wait(1500);
const savedTxt = await pg.evaluate(() => document.querySelector('#wsSave')?.textContent);
ok(/저장됨/.test(savedTxt || ''), `⑩ 저장 — 「${savedTxt}」`);
const snapshot = JSON.stringify(s9.els.map((e) => [e.k, e.l, e.g, e.x, e.y, e.w, e.h, e.p]));
const pid = await pg.evaluate(() => window.MK_WS.state.projectId);

/* ⑪ 다시 열기 — 페이지 새로고침 → 워크스페이스 */
await pg.goto(base + '#/workspace', { waitUntil: 'networkidle0' }); await wait(1500);
await pg.evaluate((id) => { if (window.MK_PROJ.get(id)) window.MK_PROJ.open ? window.MK_PROJ.open(id) : window.MK_WS.enter(id); }, pid); await wait(800);
let s11 = await st();
ok(s11.vec === s9.vec && s11.groups.length === s9.groups.length, `⑪ 다시 열기 — 벡터 ${s11.vec}, 그룹 ${s11.groups.length}`);
await shot('reopened');
/* ⑫ 유지 — 색·위치·삭제·크기 전부 */
const snap2 = JSON.stringify(s11.els.map((e) => [e.k, e.l, e.g, e.x, e.y, e.w, e.h, e.p]));
ok(snap2 === snapshot, `⑫ 유지 — 저장 전과 바이트 일치 ${snap2 === snapshot}`);
const vecDom = await pg.evaluate(() => document.querySelectorAll('.ws-el.vec svg').length);
ok(vecDom === s11.vec, `   화면 svg ${vecDom}/${s11.vec}`);

/* 부록: 레이어 패널 · bbox 실측 대조(svg 가 그린 실제 그림 vs 상자) */
await pg.evaluate(() => document.querySelector('[data-ws-nav="layers"]').click()); await wait(400);
await shot('layers');
/* 상자 vs 실제 그림 — 조각을 자기 viewBox 로 그려 픽셀 경계를 잰다. (getBBox 는 회전한 <g> 를 회전 전 상자의 네 귀퉁이로 부풀려 답하므로 기준으로 못 쓴다 — 픽셀이 정답) */
const bboxCheck = await pg.evaluate(async () => {
  const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const SA = window.MK_SVGASSET;
  const out = []; const W = 160, H = 160; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  for (let i = 0; i < sc.elements.length; i++) {
    const e = sc.elements[i]; if (e.kind !== 'vector') continue;
    const svg = SA.svgTag(e).replace('<svg ', `<svg width="${W}" height="${H}" `);
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await new Promise((r) => { img.onload = r; img.onerror = r; });
    ctx.clearRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) { out.push({ i, empty: true }); continue; }
    out.push({ i, l: e.label, dx: +(x0 / W).toFixed(2), dy: +(y0 / H).toFixed(2), dw: +((x1 - x0 + 1) / W).toFixed(2), dh: +((y1 - y0 + 1) / H).toFixed(2) });
  }
  return out;
});
const off = bboxCheck.filter((b) => b.empty || Math.abs(b.dx) > 0.08 || Math.abs(b.dy) > 0.08 || Math.abs(b.dw - 1) > 0.12 || Math.abs(b.dh - 1) > 0.12);
ok(off.length === 0, `상자 vs 그림 픽셀 대조 — 어긋난 조각 ${off.length}/${bboxCheck.length} ${off.slice(0, 3).map((b) => JSON.stringify(b)).join(' ')}`);
ok(errs.length === 0, `페이지 오류 ${errs.length}${errs.length ? ' — ' + errs.slice(0, 2).join(' | ') : ''}`);
await br.close();
