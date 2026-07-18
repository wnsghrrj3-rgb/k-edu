import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8902/maker-playground/index.html';
const go = async (hash) => { await pg.goto(base + hash, { waitUntil: 'networkidle0' }); await new Promise(r=>setTimeout(r,600)); };

/* 1. Design Desktop */
await go('#/review');
await pg.screenshot({ path: 'shots/review-desktop.png' });
/* 4. Canvas 확대 */
const cv = await pg.$('.ed-canvaswrap');
await cv.screenshot({ path: 'shots/round03-canvas.png' });
await pg.screenshot({ path: 'shots/review-canvas-selection.png', clip: { x: 288, y: 56, width: 904, height: 700 } });
/* 5. Inspector 확대 */
await (await pg.$('.ed-props')).screenshot({ path: 'shots/review-property-panel.png' });
/* 3. Timeline 확대 — Design */
await (await pg.$('.ed-bottom')).screenshot({ path: 'shots/round03-timeline-design.png' });

/* Interaction 프레임 — hover/selection/timeline */
const F = 'shots/_frames'; const fs = await import('fs'); fs.mkdirSync(F, { recursive: true });
/* (a) Insert card hover */
await pg.screenshot({ path: `${F}/i1.png`, clip: { x: 60, y: 56, width: 420, height: 340 } });
await pg.hover('.ed-detail .ph-item');
await new Promise(r=>setTimeout(r,300));
await pg.screenshot({ path: `${F}/i2.png`, clip: { x: 60, y: 56, width: 420, height: 340 } });
/* (b) Selection: 해제 → 부제 선택 → 핸들 hover */
await pg.evaluate(() => { PG.state.editor.selEl = null; PG.render(); });
await new Promise(r=>setTimeout(r,250));
await pg.screenshot({ path: `${F}/s1.png`, clip: { x: 340, y: 140, width: 760, height: 420 } });
await pg.evaluate(() => { PG.state.editor.selEl = 0; PG.render(); });
await new Promise(r=>setTimeout(r,250));
await pg.screenshot({ path: `${F}/s2.png`, clip: { x: 340, y: 140, width: 760, height: 420 } });
await pg.hover('.ed-el.sel .hd.br');
await new Promise(r=>setTimeout(r,300));
await pg.screenshot({ path: `${F}/s3.png`, clip: { x: 340, y: 140, width: 760, height: 420 } });
/* (c) Timeline: 기본 → 씬2 hover(ops) → 씬2 선택 */
await pg.screenshot({ path: `${F}/t1.png`, clip: { x: 0, y: 660, width: 1200, height: 240 } });
await pg.hover('.ed-sc:nth-child(2) .frame');
await new Promise(r=>setTimeout(r,300));
await pg.screenshot({ path: `${F}/t2.png`, clip: { x: 0, y: 660, width: 1200, height: 240 } });
await pg.click('.ed-sc:nth-child(2) .frame');
await new Promise(r=>setTimeout(r,400));
await pg.screenshot({ path: `${F}/t3.png`, clip: { x: 0, y: 660, width: 1200, height: 240 } });

/* 2. Video Desktop + 타임라인 */
await pg.evaluate(() => { PG.state.editor.sceneIdx = 0; PG.state.editor.selEl = 0; PG.state.variants.review = 'Video'; PG.render(); });
await new Promise(r=>setTimeout(r,400));
await pg.screenshot({ path: 'shots/review-desktop-video.png' });
await (await pg.$('.ed-bottom')).screenshot({ path: 'shots/round03-timeline-video.png' });

await br.close();
console.log('captures done');
