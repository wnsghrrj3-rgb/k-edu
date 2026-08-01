import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await pg.goto('http://127.0.0.1:8913/maker-playground/index.html#/home', { waitUntil: 'networkidle0' }); await wait(1600);
await pg.evaluate(() => {
  const C = window.MK_COMPOSE, TS = window.MK_TEXTSTYLE;
  const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3), texts: { title: '텍스트 스타일' } });
  window.MK_START.open(r.doc);
});
await wait(900);
await pg.evaluate(() => {
  const d = window.MK_PROJ.current().doc;
  const ti = d.scenes.findIndex((s) => s.elements.some((e) => e.kind === 'text'));
  document.querySelector(`[data-ws-sc="${ti}"]`).onclick();
});
await wait(500);
await pg.evaluate(() => {
  const d = window.MK_PROJ.current().doc;
  const ti = d.scenes.findIndex((s) => s.elements.some((e) => e.kind === 'text'));
  const ei = d.scenes[ti].elements.findIndex((e) => e.kind === 'text');
  document.querySelector(`[data-ws-el="${ei}"]`).onclick({ stopPropagation() {} });
  window.PG.render();
});
await wait(700);
await pg.screenshot({ path: 'shots/round56-panel.png' });
await pg.evaluate(() => { document.querySelector('[data-ws-tsp="ts-poster"]').onclick(); });
await wait(900);
await pg.screenshot({ path: 'shots/round56-poster.png' });
await pg.evaluate(() => { document.querySelector('[data-ws-tsp="ts-caption"]').onclick(); });
await wait(900);
await pg.screenshot({ path: 'shots/round56-caption.png' });
await br.close();
console.log('captures ok');
