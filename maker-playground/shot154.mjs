/* shot154.mjs — Forest Weekend 패키지 실화면 12항목 (크로미움) — 레포 루트 python3 -m http.server 8913 → node shot154.mjs */
import puppeteer from 'puppeteer-core'; import chromium from '@sparticuz/chromium'; import fs from 'fs';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage(); await pg.setViewport({ width: 1440, height: 900 });
const base = 'http://127.0.0.1:8913/maker/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync('shots', { recursive: true }); let n = 0; const errs = []; let pass = 0, fail = 0;
pg.on('pageerror', (e) => errs.push(String(e)));
const shot = async (nm) => { n++; await pg.screenshot({ path: `shots/round154-${String(n).padStart(2, '0')}-${nm}.png` }); };
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '✅ ' : '❌ ') + m); };
const ID = 'pkg-forest-weekend-banner';
const st = () => pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx];
  return { pid: S.projectId, screen: window.PG.state.screen, sel: S.sel, gsel: S.gsel, inGrp: S.inGrp, n: sc.elements.length, undo: S.undo.length, redo: S.redo.length, groups: Object.keys(sc.groups || {}), hidden: sc.elements.filter((e) => e.visible === false).length,
    els: sc.elements.map((e, i) => ({ i, k: e.kind, a: e.aid, x: e.x, y: e.y, w: e.w, h: e.h, t: e.text, f: e.font, s: e.size, c: e.color, rot: e.rot, src: !!e.src, p: e.paint })) }; });
const rectOf = (s) => pg.evaluate((s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, s);
const drag = async (x0, y0, x1, y1, steps = 10) => { await pg.mouse.move(x0, y0); await pg.mouse.down(); for (let i = 1; i <= steps; i++) { await pg.mouse.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await wait(20); } await pg.mouse.up(); await wait(250); };
const idxOf = async (aid) => (await st()).els.find((e) => e.a === aid)?.i;
const pixelPoint = async (aid) => pg.evaluate((aid) => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const i = sc.elements.findIndex((e) => e.aid === aid); const d = document.querySelector(`[data-ws-el="${i}"]`); if (!d) return null; const r = d.getBoundingClientRect();
  for (const gy of [0.5, 0.7, 0.3, 0.85, 0.15]) for (const gx of [0.5, 0.3, 0.7, 0.15, 0.85]) { const x = r.x + r.width * gx, y = r.y + r.height * gy; const t = document.elementFromPoint(x, y); if (t && t.classList && (t.classList.contains('ws-hd') || t.classList.contains('ws-rh'))) continue; const h = t && t.closest && t.closest('[data-ws-el]'); if (h && +h.dataset.wsEl === i) return { i, x, y, r: { x: r.x, y: r.y, w: r.width, h: r.height } }; } return null; }, aid);

/* 1. 템플릿 목록 */
await pg.goto(base + '#/templates', { waitUntil: 'networkidle0' }); await wait(1500);
await pg.evaluate(() => window.PG.go('templates')); await wait(600);
let card = await pg.$(`[data-tpl="${ID}"]`); ok(!!card, '① Templates 목록에 「Forest Weekend — 캠핑장 현수막」 카드');
await shot('templates-list');
/* 2. 클릭 → 미리보기 → 사용 → workspace */
await card.click(); await wait(600); await shot('preview');
const useBtn = await pg.evaluateHandle(() => [...document.querySelectorAll('#mkModal button, .mk-modal button, button')].find((b) => /이 템플릿|사용|만들기 시작/.test(b.textContent) && b.closest('#mkModal, .mk-modal, [class*="modal"]')));
if (useBtn && useBtn.asElement()) await useBtn.asElement().click(); else await pg.evaluate((id) => window.MK_TPL.load(id), ID);
await wait(1200);
let s = await st(); ok(s.screen === 'workspace' && s.n === 28, `② 캔버스 삽입 — workspace 도달, 요소 ${s.n}`); await shot('inserted');
/* 3. 위치·비율 — 실제 DOM 상자 vs 문서 % */
const cv = await rectOf('.ws-canvas'); const t0 = await rectOf(`[data-ws-el="${await idxOf('title')}"]`), p0 = await rectOf(`[data-ws-el="${await idxOf('photo-placeholder')}"]`);
const ar = cv.w / cv.h; ok(Math.abs(ar - 3) < 0.03 && Math.abs((t0.x - cv.x) / cv.w * 100 - 4.53) < 0.5 && Math.abs((p0.x - cv.x) / cv.w * 100 - 61.17) < 0.5 && Math.abs(p0.w / cv.w * 100 - 34) < 0.5, `③ 비율 3:1(${ar.toFixed(2)}) · 제목 x ${((t0.x - cv.x) / cv.w * 100).toFixed(2)}% · 사진 x ${((p0.x - cv.x) / cv.w * 100).toFixed(2)}% w ${(p0.w / cv.w * 100).toFixed(2)}%`);
/* 4. 제목 클릭 → 내용 수정 */
let pt = await pixelPoint('title'); await pg.mouse.click(pt.x, pt.y); await wait(400);
s = await st(); ok(s.sel.type === 'text' && s.els[s.sel.idx].a === 'title', '④a 제목 클릭 → 텍스트 선택');
await pg.evaluate(() => { const ta = document.querySelector('[data-ws-txt]'); ta.value = 'Camp\nWeekend'; ta.dispatchEvent(new Event('input', { bubbles: true })); ta.dispatchEvent(new Event('change', { bubbles: true })); }); await wait(400);
s = await st(); ok(s.els.find((e) => e.a === 'title').t === 'Camp\nWeekend', '④b 제목 내용 수정 반영'); await shot('title-edited');
/* 5. 글꼴·크기·색 */
await pg.click('[data-ws-tfontb="Gowun Batang"]'); await wait(300);
await pg.evaluate(() => { const r = document.querySelector('[data-ws-tsize]'); r.value = '14'; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }); await wait(300);
pt = await pixelPoint('title'); if (!pt) { await pg.evaluate((i) => { const S = window.MK_WS.state; S.sel = { type: 'text', idx: i }; window.PG.render(); }, await idxOf('title')); await wait(300); }
const col = await pg.evaluate(() => { const b = document.querySelector('[data-ws-tcol]'); b.click(); return b.dataset.wsTcol; }); await wait(300);
s = await st(); const tt = s.els.find((e) => e.a === 'title'); ok(tt.f === 'Gowun Batang' && +tt.s === 14 && tt.c === col, `⑤ 글꼴 ${tt.f} · 크기 ${tt.s} · 색 ${tt.c}`); await shot('title-style');
/* 6. 사진 교체 */
pt = await pixelPoint('photo-placeholder'); if (pt) await pg.mouse.click(pt.x, pt.y); else await pg.evaluate((i) => { const S = window.MK_WS.state; S.sel = { type: 'image', idx: i }; window.PG.render(); }, await idxOf('photo-placeholder')); await wait(400);
const png = 'shots/round154-photo.png'; if (!fs.existsSync(png)) { const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIW2NkYPj/n4GBgYGRAQIYGAAcjwID+DpCXwAAAABJRU5ErkJggg=='; fs.writeFileSync(png, Buffer.from(b64, 'base64')); }
const [chooser] = await Promise.all([pg.waitForFileChooser({ timeout: 5000 }).catch(() => null), pg.click('[data-ws-preplace]')]);
if (chooser) await chooser.accept([png]); await wait(1500);
s = await st(); const ph = s.els.find((e) => e.a === 'photo-placeholder');
ok(ph.src && s.hidden === 15 && s.n === 28, `⑥ 사진 교체 — src ${ph.src} · 풍경 숨김 ${s.hidden} · 요소 ${s.n} 유지`); await shot('photo-replaced');
/* 7. crop / 위치 */
const hasCrop = await pg.evaluate(() => !!document.querySelector('[data-ws-pcrop]') && document.querySelectorAll('[data-ws-focal]').length >= 9);
await pg.evaluate(() => document.querySelectorAll('[data-ws-focal]')[2].click()); await wait(300);
const foc = await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); return P.doc.scenes[S.sceneIdx].elements.find((e) => e.aid === 'photo-placeholder').focal; });
ok(hasCrop && !!foc, `⑦ 자르기 버튼 + 초점 9칸, 초점 이동 → ${JSON.stringify(foc)}`); await shot('photo-focal');
/* 풍경 복구(레이어 👁) 뒤 장식 조작 */
await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; window.MK_TPLPKG.showFallbacks(sc, sc.elements.find((e) => e.aid === 'photo-placeholder')); const el = sc.elements.find((e) => e.aid === 'photo-placeholder'); delete el.src; window.PG.render(); }); await wait(400);
/* 8. 장식 개별 선택 — 심볼(독립), 소나무(그룹 → 두 번 탭) */
pt = await pixelPoint('brand-mark'); await pg.mouse.click(pt.x, pt.y); await wait(300); s = await st();
const selBM = s.sel.type === 'vector' && s.els[s.sel.idx].a === 'brand-mark';
await pg.keyboard.press('Escape'); await wait(200);
pt = await pixelPoint('pine-2');
if (!pt) { const dbg = await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const i = sc.elements.findIndex((e) => e.aid === 'pine-2'); const d = document.querySelector(`[data-ws-el="${i}"]`); const r = d && d.getBoundingClientRect(); const t = r && document.elementFromPoint(r.x + r.width / 2, r.y + r.height * 0.6); return { i, r: r && [r.x, r.y, r.width, r.height], vis: sc.elements[i].visible, top: t && (t.tagName + '.' + t.className + ' ' + (t.closest('[data-ws-el]') || {}).dataset?.wsEl) }; }); console.log('pine-2 debug', JSON.stringify(dbg)); await shot('pine-debug'); }
await pg.mouse.click(pt.x, pt.y); await wait(300); s = await st(); const g1 = s.gsel;
await pg.mouse.click(pt.x, pt.y); await wait(120); await pg.mouse.click(pt.x, pt.y); await wait(400); s = await st();
ok(selBM && g1 && s.inGrp === g1 && s.els[s.sel.idx].a === 'pine-2', `⑧ 심볼 단독 선택 ${selBM} · 소나무 클릭=그룹(${!!g1}) 두 번 탭=내부 「소나무 2」 단일 선택`); await shot('pine-selected');
/* 9. 이동·회전·크기·삭제 */
const before = (await st()).els.map((e) => e.x);
pt = await pixelPoint('pine-2'); await drag(pt.x, pt.y, pt.x + 60, pt.y); s = await st();
const i2 = s.els.find((e) => e.a === 'pine-2').i; const movedOnly = s.els.every((e) => e.a === 'pine-2' ? e.x > before[e.i] + 1 : Math.abs(e.x - before[e.i]) < 0.01);
const hd = await rectOf(`[data-ws-el="${i2}"] .ws-hd.br`);
const wBefore = (await st()).els[i2].w; if (hd) await drag(hd.x + hd.w / 2, hd.y + hd.h / 2, hd.x + hd.w / 2 + 40, hd.y + hd.h / 2 + 60); else console.log('br 손잡이 없음');
let e2 = (await st()).els[i2]; const resized = e2.w > wBefore + 0.2; console.log('   크기', wBefore, '→', e2.w);
await pg.evaluate(() => { const r = document.querySelector('[data-ws-rotr]'); r.value = '20'; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }); await wait(300);
s = await st(); e2 = s.els[i2];
await pg.keyboard.press('Delete'); await wait(400); s = await st();
ok(movedOnly && +e2.rot === 20 && resized && s.n === 27 && !s.els.some((e) => e.a === 'pine-2'), `⑨ 소나무 2 만 이동(${movedOnly}) · 회전 ${e2.rot} · 크기 ${resized ? '커짐' : '그대로'} · 삭제 → ${s.n}`); await shot('pine-deleted');
/* 10. 레이어 순서 */
pt = await pixelPoint('accent-line'); if (pt) await pg.mouse.click(pt.x, pt.y); else await pg.evaluate((i) => { const S = window.MK_WS.state; S.sel = { type: 'image', idx: i }; window.PG.render(); }, await idxOf('accent-line')); await wait(300);
await pg.click('[data-ws-ord="back"]'); await wait(300); s = await st(); const ordBack = s.els[0].a === 'accent-line';
await pg.click('[data-ws-nav="layers"]'); await wait(400); await shot('layers');
const layerHas = await pg.evaluate(() => /풍경 · 사진/.test(document.body.innerHTML) && /메인 제목/.test(document.body.innerHTML));
ok(ordBack && layerHas, `⑩ 「맨뒤로」 → elements[0]=${s.els[0].a} · 레이어 패널에 풍경 그룹·제목`);
/* 11. Undo / Redo */
await pg.keyboard.down('Control'); await pg.keyboard.press('z'); await pg.keyboard.press('z'); await pg.keyboard.up('Control'); await wait(400); const u = await st();
await pg.keyboard.down('Control'); await pg.keyboard.press('y'); await pg.keyboard.up('Control'); await wait(400); const rd = await st();
ok(u.n === 28 && u.els.some((e) => e.a === 'pine-2') && rd.n === 27, `⑪ Undo ×2 → ${u.n}(소나무 2 복귀) · Redo → ${rd.n}`); await shot('undo-redo');
/* 12. 저장 → 새로고침 → 다시 열기 */
await wait(1500); const pid = (await st()).pid; const snapBefore = await pg.evaluate(() => JSON.stringify(window.MK_PROJ.current().doc));
await pg.goto(base + '#/projects', { waitUntil: 'networkidle0' }); await wait(1500);
await pg.evaluate((pid) => window.MK_PROJ.open(pid), pid); await wait(1200);
const after = await pg.evaluate(() => JSON.stringify(window.MK_PROJ.current().doc)); s = await st();
const tt2 = s.els.find((e) => e.a === 'title'); console.log('   재열기', JSON.stringify({ t: tt2.t, f: tt2.f, pine2: s.els.some((e) => e.a === 'pine-2'), n: s.n })); ok(after === snapBefore && s.n === 27 && tt2.t === 'Camp\nWeekend' && tt2.f === 'Gowun Batang' && !s.els.some((e) => e.a === 'pine-2'), `⑫ 새로고침 뒤 다시 열기 — 바이트 동일 ${after === snapBefore} · 요소 ${s.n} · 제목·글꼴·삭제 유지`); await shot('reopened');
console.log(`\nshot154: ${pass}/${pass + fail} · pageerror ${errs.length}`); errs.slice(0, 5).forEach((e) => console.log('  !', e));
await br.close(); process.exit(fail ? 1 : 0);
