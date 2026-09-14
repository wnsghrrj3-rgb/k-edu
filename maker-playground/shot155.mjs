/* shot155.mjs — K-Maker Font & Typography System 실화면 12항목 (크로미움)
   레포 루트 python3 -m http.server 8913 → node shot155.mjs
   구글 폰트 링크는 fontcss155(로컬 woff) 로 가로챈다 — 코모런트·Noto Sans KR·프리텐다드만 있고
   고운바탕 등은 없으므로 「로드 실패 감지」 검사에도 쓴다. */
import puppeteer from 'puppeteer-core'; import chromium from '@sparticuz/chromium'; import fs from 'fs'; import css from './fontcss155.mjs';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage(); await pg.setViewport({ width: 1440, height: 900 });
await pg.setRequestInterception(true);
pg.on('request', (r) => { if (/fonts\.googleapis\.com/.test(r.url())) r.respond({ status: 200, contentType: 'text/css', body: css }); else if (!/127\.0\.0\.1/.test(r.url())) r.abort(); else r.continue(); });
const base = 'http://127.0.0.1:8913/maker/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync('shots', { recursive: true }); let n = 0; const errs = []; let pass = 0, fail = 0;
pg.on('pageerror', (e) => errs.push(String(e)));
const shot = async (nm) => { n++; await pg.screenshot({ path: `shots/round155-${String(n).padStart(2, '0')}-${nm}.png` }); };
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '✅ ' : '❌ ') + m); };
const ID = 'pkg-forest-weekend-banner';
const st = () => pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx];
  return { pid: S.projectId, screen: window.PG.state.screen, sel: S.sel, n: sc.elements.length, undo: S.undo.length, redo: S.redo.length, failed: window.MK_FONTREG.failed(), status: { ...window.MK_FONTREG.STATUS },
    els: sc.elements.map((e, i) => ({ i, k: e.kind, a: e.aid, t: e.text, f: e.font, fid: e.fontId, w: e.weight, s: e.size, ls: e.letterSpacing, lh: e.lineHeight, c: e.color, sub: e.fontSub, b: e.baseline })) }; });
const title = async () => (await st()).els.find((e) => e.a === 'title');
const idxOf = async (aid) => (await st()).els.find((e) => e.a === aid)?.i;
const domOf = (aid) => pg.evaluate((aid) => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const i = sc.elements.findIndex((e) => e.aid === aid); const d = document.querySelector(`[data-ws-el="${i}"]`); if (!d) return null; const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
  return { i, family: cs.fontFamily, weight: cs.fontWeight, size: cs.fontSize, ls: cs.letterSpacing, lh: cs.lineHeight, txt: d.textContent, h: r.height, w: r.width, mt: cs.marginTop }; }, aid);
const selectTitle = async () => { const i = await idxOf('title'); await pg.evaluate((i) => { const S = window.MK_WS.state; S.gsel = null; S.msel = []; S.inGrp = null; S.sel = { type: 'text', idx: i }; window.PG.render(); }, i); await wait(300); };
const setInput = async (sel, v) => pg.evaluate(({ sel, v }) => { const r = document.querySelector(sel); if (!r) return false; r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); return true; }, { sel, v });
const panel = () => pg.evaluate(() => { const b = document.getElementById('pgBody'); return { warn: /못 불러왔어요/.test(b.innerHTML), sub: /글꼴 대체:/.test(b.innerHTML), weights: [...document.querySelectorAll('[data-ws-tweight] option')].map((o) => o.value + (/대체/.test(o.textContent) ? '*' : '')), ls: document.querySelector('[data-ws-tls]')?.value, lh: document.querySelector('[data-ws-tlh]')?.value }; });
const fontsReady = async (fams) => { for (let k = 0; k < 40; k++) { const s = await st(); const keys = Object.keys(s.status).filter((x) => fams.some((f) => x.startsWith(f + '|'))); if (keys.length && keys.every((x) => s.status[x] === 'loaded' || s.status[x] === 'failed')) return s; await wait(250); } return st(); };
const checkFont = (fam, w) => pg.evaluate(({ fam, w }) => document.fonts.check(`${w || 400} 16px "${fam}"`, '가A'), { fam, w });

/* ① 템플릿 열기 → Font Ready (로드 전 폴백 배치 금지) */
await pg.goto(base + '#/templates', { waitUntil: 'load', timeout: 60000 }); await wait(2000);
await pg.evaluate((id) => window.MK_TPL.load(id), ID); await wait(600);
let s = await fontsReady(['Cormorant Garamond', 'Noto Sans KR']);
const req = await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); return window.MK_FONTREG.requiredOf(P.doc.scenes[S.sceneIdx]).map((r) => `${r.family}|${r.weight}|${r.style}`); });
const allLoaded = req.every((k) => s.status[k] === 'loaded');
ok(s.screen === 'workspace' && s.n === 28 && req.length >= 2 && allLoaded && s.failed.length === 0, `① 템플릿 열기 → 필요한 글꼴 ${req.length}종 전부 loaded(${allLoaded}) · failed ${s.failed.length} — ${req.join(', ')}`); await shot('font-ready');
/* ② 실제 그 글꼴로 그려졌는지 — 폴백이 아닌지 */
await selectTitle();
let d = await domOf('title'); const chk = await checkFont('Cormorant Garamond', 400); const chk2 = await checkFont('Noto Sans KR', 400);
let t = await title(); let p = await panel();
ok(/Cormorant Garamond/.test(d.family) && chk && chk2 && t.fid === 'cormorant-garamond' && !p.warn && !p.sub, `② 제목 DOM font-family=${d.family.split(',')[0]} · fonts.check 코모런트 ${chk}/Noto ${chk2} · fontId ${t.fid} · ⚠ 없음(${!p.warn}) · 대체 문구 없음(${!p.sub})`); await shot('title-selected');
/* ③ 한글 입력 */
await setInput('[data-ws-txt]', '숲속 주말\n캠핑 축제'); await wait(400);
t = await title(); d = await domOf('title');
ok(t.t === '숲속 주말\n캠핑 축제' && /숲속 주말/.test(d.txt) && /캠핑 축제/.test(d.txt) && t.fid === 'cormorant-garamond', `③ 한글 입력 → 문서 「${t.t.replace('\n', '⏎')}」 · DOM 표시 · 글꼴 유지 ${t.fid}`); await shot('ko-input');
/* ④ 영어 입력 */
await setInput('[data-ws-txt]', 'Camp\nWeekend'); await wait(400);
t = await title(); d = await domOf('title');
ok(t.t === 'Camp\nWeekend' && /Camp/.test(d.txt) && /Weekend/.test(d.txt), `④ 영어 입력 → 문서 「${t.t.replace('\n', '⏎')}」 · DOM 표시`); await shot('en-input');
/* ⑤ 글꼴 바꾸기 — 없는 글꼴(고운바탕: 이 헤드리스엔 face 없음) → 실패 감지 ⚠, 문서 글꼴은 그대로 */
await pg.click('[data-ws-tfontb="Gowun Batang"]'); await wait(300);
s = await fontsReady(['Gowun Batang']); await wait(300);
t = await title(); p = await panel(); const gbFailed = s.failed.some((k) => /^Gowun Batang\|/.test(k));
ok(t.f === 'Gowun Batang' && t.fid === 'gowun-batang' && gbFailed && p.warn, `⑤ 글꼴 → 고운바탕(face 없음): 문서 font=${t.f}/fontId=${t.fid} 유지 · STATUS failed(${gbFailed}) · 패널 ⚠ 표시(${p.warn})`); await shot('font-failed-warn');
/* ⑥ 글꼴 바꾸기 — 있는 글꼴(Noto Sans KR) → 로드·⚠ 사라짐·DOM 실제 적용 */
await pg.click('[data-ws-tfontb="Noto Sans KR"]'); await wait(300);
s = await fontsReady(['Noto Sans KR']); await wait(300);
t = await title(); p = await panel(); d = await domOf('title');
ok(t.f === 'Noto Sans KR' && t.fid === 'noto-sans-kr' && /Noto Sans KR/.test(d.family) && !p.warn && s.status['Noto Sans KR|400|normal'] === 'loaded', `⑥ 글꼴 → Noto Sans KR: fontId ${t.fid} · DOM ${d.family.split(',')[0]} · loaded · ⚠ 사라짐(${!p.warn})`); await shot('font-noto');
/* ⑦ 굵기 — 목록은 그 글꼴이 가진 굵기(Noto 300/400/500/700), 700 선택 */
p = await panel();
const wlist = p.weights.map((x) => x.replace('*', '')).join('/');
await pg.select('[data-ws-tweight]', '700'); await wait(400);
s = await fontsReady(['Noto Sans KR']);
t = await title(); d = await domOf('title');
ok(wlist === '300/400/500/700' && !p.weights.some((x) => /\*/.test(x)) && +t.w === 700 && d.weight === '700' && s.status['Noto Sans KR|700|normal'] === 'loaded', `⑦ 굵기 목록 ${wlist}(대체 표시 0) · 700 선택 → 문서 ${t.w} · DOM ${d.weight} · Noto 700 loaded`); await shot('weight-700');
/* ⑧ 크기 */
await setInput('[data-ws-tsize]', '14'); await wait(400);
t = await title(); d = await domOf('title');
const cv = await pg.evaluate(() => document.querySelector('.ws-canvas').getBoundingClientRect().height);
ok(+t.s === 14 && Math.abs(parseFloat(d.size) - cv * 0.14) < 1.5, `⑧ 크기 14 → 문서 ${t.s} · DOM font-size ${d.size}(캔버스 높이 14% = ${(cv * 0.14).toFixed(1)}px)`); await shot('size-14');
/* ⑨ 자간 */
await setInput('[data-ws-tls]', '0.1'); await wait(400);
t = await title(); d = await domOf('title');
const lsPx = parseFloat(d.ls); const fsPx = parseFloat(d.size);
ok(Math.abs(+t.ls - 0.1) < 1e-6 && Math.abs(lsPx - fsPx * 0.1) < 0.6, `⑨ 자간 0.1em → 문서 ${t.ls} · DOM letter-spacing ${d.ls}(=${(fsPx * 0.1).toFixed(2)}px)`); await shot('letter-spacing');
/* ⑩ 행간 */
const hBefore = d.h;
await setInput('[data-ws-tlh]', '1.5'); await wait(400);
t = await title(); d = await domOf('title');
ok(Math.abs(+t.lh - 1.5) < 1e-6 && Math.abs(parseFloat(d.lh) - fsPx * 1.5) < 1 && d.h > hBefore + 2 && Math.abs(d.h - fsPx * 1.5 * 2) < 2, `⑩ 행간 1.5 → 문서 ${t.lh} · DOM line-height ${d.lh}(=${(fsPx * 1.5).toFixed(1)}px) · 상자 높이 ${hBefore.toFixed(0)}→${d.h.toFixed(0)}(2줄×${(fsPx * 1.5).toFixed(1)}=${(fsPx * 3).toFixed(0)})`); await shot('line-height');
/* ⑪ Undo ×2 (행간·자간 되돌림) → Redo ×1 (자간 복귀) */
await pg.keyboard.down('Control'); await pg.keyboard.press('z'); await wait(150); await pg.keyboard.press('z'); await pg.keyboard.up('Control'); await wait(400);
const u = await title();
await pg.keyboard.down('Control'); await pg.keyboard.press('y'); await pg.keyboard.up('Control'); await wait(400);
const rd = await title();
ok(Math.abs(+u.lh - 1.04) < 0.02 && (u.ls == null || Math.abs(+u.ls) < 0.05) && Math.abs(+rd.ls - 0.1) < 1e-6 && Math.abs(+rd.lh - 1.04) < 0.02 && rd.f === 'Noto Sans KR' && +rd.w === 700, `⑪ Undo×2 → 행간 ${u.lh} · 자간 ${u.ls} / Redo → 자간 ${rd.ls} · 행간 ${rd.lh} · 글꼴·굵기 유지`); await shot('undo-redo');
/* ⑫ 저장 → 새로고침 → 다시 열기 → 글꼴·굵기·자간·행간·글 전부 유지, 글꼴 다시 로드 */
await wait(1500); const pid = (await st()).pid; const snapBefore = await pg.evaluate(() => JSON.stringify(window.MK_PROJ.current().doc));
await pg.goto(base + '#/projects', { waitUntil: 'load', timeout: 60000 }); await wait(1500);
await pg.evaluate((pid) => window.MK_PROJ.open(pid), pid); await wait(800);
s = await fontsReady(['Noto Sans KR', 'Cormorant Garamond']);
const after = await pg.evaluate(() => JSON.stringify(window.MK_PROJ.current().doc));
t = await title(); await selectTitle(); d = await domOf('title'); p = await panel();
ok(after === snapBefore && t.t === 'Camp\nWeekend' && t.f === 'Noto Sans KR' && t.fid === 'noto-sans-kr' && +t.w === 700 && +t.s === 14 && Math.abs(+t.ls - 0.1) < 1e-6 && /Noto Sans KR/.test(d.family) && d.weight === '700' && s.status['Noto Sans KR|700|normal'] === 'loaded' && !p.warn, `⑫ 재열기 — 바이트 동일 ${after === snapBefore} · 글꼴 ${t.f}/${t.w} · 크기 ${t.s} · 자간 ${t.ls} · 행간 ${t.lh} · DOM ${d.family.split(',')[0]} ${d.weight} · Noto 700 다시 loaded · ⚠ 없음`); await shot('reopened');
/* 부록 — 출력(SVG) 에도 같은 타이포가 실린다 */
const svg = await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const dl = window.MK_RENDER.renderScene(sc, { noCache: true }); return window.MK_RENDER.toSVG(dl); });
fs.writeFileSync('shots/round155-12-reopened.svg', svg);
const tEl = (svg.match(/<text [^>]*>[\s\S]*?<\/text>/g) || []).find((x) => /Camp/.test(x)); const ta = tEl ? tEl.slice(0, tEl.indexOf('>')) : '';
const svgOk = /font-family="[^"]*Noto Sans KR/.test(ta) && /font-weight="700"/.test(ta) && /letter-spacing="/.test(ta);
ok(svgOk, `부록 SVG 출력 제목 <text>: Noto Sans KR · weight 700 · letter-spacing 실림 (${svgOk})`);
console.log(`\nshot155: ${pass}/${pass + fail} · pageerror ${errs.length}`); errs.slice(0, 5).forEach((e) => console.log('  !', e));
await br.close(); process.exit(fail ? 1 : 0);
