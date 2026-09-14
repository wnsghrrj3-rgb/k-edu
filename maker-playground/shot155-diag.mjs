/* shot155-diag — Forest Weekend 원본 preview vs 케이메이커 화면/SVG 글자 잉크 상자 대조 */
import puppeteer from 'puppeteer-core'; import chromium from '@sparticuz/chromium'; import fs from 'fs'; import css from './fontcss155.mjs';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage(); await pg.setViewport({ width: 1440, height: 900 }); const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
await pg.setRequestInterception(true);
pg.on('request', (r) => { if (/fonts\.googleapis\.com/.test(r.url())) r.respond({ status: 200, contentType: 'text/css', body: css }); else if (!/127\.0\.0\.1/.test(r.url())) r.abort(); else r.continue(); });
const base = 'http://127.0.0.1:8913/maker/index.html'; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ID = 'pkg-forest-weekend-banner'; const tag = process.argv[2] || 'before';
await pg.goto(base + '#/templates', { waitUntil: 'load', timeout: 60000 }); await wait(2500);
await pg.evaluate(async () => { await document.fonts.ready; }); 
await pg.evaluate((id) => window.MK_TPL.load(id), ID); await wait(1500);
await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const ph = sc.elements.find((e) => e.aid === 'photo-placeholder'); delete ph.src; window.MK_TPLPKG.showFallbacks(sc, ph); window.PG.render(); }); await wait(600);
const fontsLoaded = await pg.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight));
console.log('loaded fonts', fontsLoaded.length, [...new Set(fontsLoaded.map((s) => s.split(' ')[0]))].join(', '));
/* 화면(DOM) 캔버스만 1800 폭으로 찍는다 */
await pg.setViewport({ width: 2800, height: 1400 }); await wait(300);
await pg.evaluate(() => { const S = window.MK_WS.state; S.zoom = Math.round(1800 / (S.baseW || 600) * 10000) / 100; window.PG.render(); }); await wait(600);
await pg.evaluate(() => { document.querySelectorAll('.ws-el .ws-hd,.ws-el .ws-rh,.ws-gbox').forEach((n) => n.remove()); document.querySelectorAll('.ws-el.on').forEach((n) => n.classList.remove('on')); });
const cvr = await pg.evaluate(() => { const r = document.querySelector('.ws-canvas').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }); console.log('canvas', JSON.stringify(cvr));
const cvEl = await pg.$('.ws-canvas'); await cvEl.screenshot({ path: `shots/round155-dom-${tag}.png` });
/* SVG 출력 */
const svg = await pg.evaluate(() => { const S = window.MK_WS.state, P = window.MK_PROJ.get(S.projectId); const sc = P.doc.scenes[S.sceneIdx]; const dl = window.MK_RENDER.renderScene(sc, { noCache: true }); return window.MK_RENDER.toSVG(dl); });
fs.writeFileSync(`shots/round155-${tag}.svg`, svg);
const p2 = await br.newPage(); await p2.setViewport({ width: 1800, height: 600 }); await p2.setRequestInterception(true);
p2.on('request', (r) => { if (/fonts\.googleapis\.com/.test(r.url())) r.respond({ status: 200, contentType: 'text/css', body: css }); else r.continue(); });
await p2.goto('http://127.0.0.1:8913/maker/index.html', { waitUntil: 'domcontentloaded' });
await p2.setContent(`<link href="https://fonts.googleapis.com/css2?x" rel="stylesheet"><style>body{margin:0}svg{width:1800px;height:600px;display:block}</style>${svg}`, { waitUntil: 'load' });
await p2.evaluate(async () => { await document.fonts.ready; }); await wait(500);
await p2.screenshot({ path: `shots/round155-svg-${tag}.png`, clip: { x: 0, y: 0, width: 1800, height: 600 } });
console.log('pageerror', errs.length, errs.slice(0, 3)); await br.close();
