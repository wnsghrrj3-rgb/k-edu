import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8902/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (hash) => { await pg.goto(base + hash, { waitUntil: 'networkidle0' }); await wait(700); };
const F = 'shots/_f11'; fs.mkdirSync(F, { recursive: true });

/* ---------- 1. Home Browser ---------- */
await go('#/library');
await pg.screenshot({ path: 'shots/round11-home.png' });
await pg.screenshot({ path: `${F}/g1.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });

/* ---------- 2. Category ---------- */
await (await pg.$('.lb-cats')).screenshot({ path: 'shots/round11-categories.png' });

/* ---------- 3. Project Browser (Presentation) ---------- */
await pg.click('[data-cat="presentation"]'); await wait(500);
await pg.screenshot({ path: 'shots/round11-browse.png' });
await pg.screenshot({ path: `${F}/g2.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });

/* ---------- 4. Type + Filter ---------- */
await pg.click('[data-t="Pitch Deck"]'); await wait(350);
await pg.screenshot({ path: `${F}/g3.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });
await pg.evaluate(() => { MK_SCREENS.library._S.type = ''; MK_SCREENS.library._S.filters.color = 'Blue'; MK_SCREENS.library._S.filters.theme = 'Dark'; MK_SCREENS.library._paint(); });
await wait(400);
await pg.screenshot({ path: 'shots/round11-filter.png' });
await pg.screenshot({ path: `${F}/g4.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });

/* ---------- 5. Search ---------- */
await pg.evaluate(() => { const L = MK_SCREENS.library; L._S.filters = { style: '', color: '', theme: '', ratio: '', pages: 'any' }; L._S.cat = 'all'; L._S.q = 'portfolio'; L._paint(); });
await wait(400);
await pg.screenshot({ path: 'shots/round11-search.png' });
await pg.screenshot({ path: `${F}/g5.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });

/* ---------- 6. Recommendation (Pitch Deck 3회 사용 후 Home) ---------- */
await pg.evaluate(() => {
  const id = MK_CAT.ENTRIES.find((e) => e.type === 'Pitch Deck' && e.live).id;
  MK_CAT.use(id); MK_CAT.use(id); MK_CAT.use(id);
  const L = MK_SCREENS.library; L._S.q = ''; L._S.mode = 'home'; L._paint();
});
await wait(500);
await (await pg.$('.lb-rail')).screenshot({ path: 'shots/round11-recommend.png' });
await pg.screenshot({ path: `${F}/g6.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });

/* ---------- 7. Preview 3프레임 ---------- */
await pg.evaluate(() => MK_SCREENS.library._openPreview(MK_CAT.ENTRIES.find((e) => e.id === 'pitch-deck-01').id));
await wait(500);
const shot = async (n) => { const el = await pg.$('.mk-modal.lb-wide'); await el.screenshot({ path: n }); };
await shot('shots/round11-preview-1.png'); await pg.screenshot({ path: `${F}/g7.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });
await pg.click('.lb-prev .dots button:nth-child(2)'); 
await wait(400); await shot('shots/round11-preview-2.png'); await pg.screenshot({ path: `${F}/g8.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });
await pg.click('.lb-prev .dots button:nth-child(3)'); await wait(400);
await shot('shots/round11-preview-3.png'); await pg.screenshot({ path: `${F}/g9.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });
await pg.evaluate(() => MK.Modal.close());

/* ---------- 8. Performance — 1000개 스크롤 ---------- */
await pg.evaluate(() => { const L = MK_SCREENS.library; L._S.mode = 'browse'; L._S.cat = 'all'; L._S.type = ''; L._S.q = ''; L._paint(); });
await wait(600);
const perf = await pg.evaluate(async () => {
  const vp = document.getElementById('lbVP');
  const total = MK_CAT.ENTRIES.length;
  MK_CAT.clearCache();

  /* (A) 가상 리스트 — 실제 스크롤 플릭 (프레임당 48px, 400프레임 ≈ 19,200px) */
  const frames = [];
  vp.scrollTop = 0; vp.dispatchEvent(new Event('scroll'));
  await new Promise((r) => requestAnimationFrame(r));
  let last = performance.now();
  for (let i = 0; i < 400; i++) {
    vp.scrollTop = i * 48;
    await new Promise((r) => requestAnimationFrame(r));
    const t = performance.now(); frames.push(t - last); last = t;
  }
  const f = frames.slice(3).sort((x, y) => x - y);
  const pct = (p) => +(f[Math.floor(f.length * p)] || 0).toFixed(2);
  const virt = {
    domNodes: document.querySelectorAll('*').length,
    cards: document.querySelectorAll('.lb-card').length,
    frameMedian: pct(0.5), frameP95: pct(0.95), frameMax: +f[f.length - 1].toFixed(2),
    fps: +(1000 / pct(0.5)).toFixed(1),
    dropped: f.filter((x) => x > 33.4).length,
    cacheHit: MK_CAT.cacheStats.hit, cacheMiss: MK_CAT.cacheStats.miss, cacheSize: MK_CAT.cache.size,
  };

  /* (B) 베이스라인 — 가상화 없이 1000장 전량 DOM 삽입 */
  MK_CAT.clearCache();
  const list = MK_CAT.query({ sort: 'recommend' });
  const t0 = performance.now();
  const html = list.map((e) => `<article class="lb-card"><div class="th">${MK_CAT.poster(e)}</div><div class="mt"><b>${e.name}</b><small>${e.type}</small></div></article>`).join('');
  const build = performance.now() - t0;
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:-99999px;top:0;width:1100px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px';
  document.body.appendChild(holder);
  const t1 = performance.now();
  holder.innerHTML = html;
  holder.getBoundingClientRect();
  const insert = performance.now() - t1;
  const nodes = document.querySelectorAll('*').length;
  holder.remove();

  return { total, virtual: virt, baseline: { buildMs: +build.toFixed(1), insertMs: +insert.toFixed(1), domNodes: nodes } };
});
console.log(JSON.stringify(perf, null, 2));
fs.writeFileSync('shots/round11-perf.json', JSON.stringify(perf, null, 2));
await pg.screenshot({ path: 'shots/round11-scroll.png' });
await pg.screenshot({ path: `${F}/g10.png`, clip: { x: 250, y: 0, width: 1190, height: 900 } });

await br.close();
