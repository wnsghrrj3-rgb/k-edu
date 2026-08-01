import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await pg.goto('http://127.0.0.1:8913/maker-playground/index.html#/home', { waitUntil: 'networkidle0' }); await wait(1500);
await pg.evaluate(async () => {
  const C = window.MK_COMPOSE;
  /* 실사진 느낌: 색 그라데이션 캔버스 3장 생성 */
  const ph = (c1, c2) => { const cv = document.createElement('canvas'); cv.width = 800; cv.height = 600; const x = cv.getContext('2d'); const g = x.createLinearGradient(0, 0, 800, 600); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 800, 600); return cv.toDataURL('image/png'); };
  const medias = [['#f6b73c', '#b45f06'], ['#4a90d9', '#1b4f8a'], ['#67c58f', '#1e7a4f']].map((c, i) => ({ name: 'photo' + i, kind: 'image', src: ph(c[0], c[1]), w: 800, h: 600 }));
  const r = C.buildProject('cx-slideshow', 'th-bold', { medias, texts: { title: '조림이 하이라이트' } });
  window.MK_START.open(r.doc);
});
await wait(700);
await pg.evaluate(() => { window.PG.go('animation'); window.PG.render(); });
await wait(700);
await pg.evaluate(() => {
  const d = window.MK_PROJ.current().doc;
  const si = d.scenes.findIndex((s) => s.elements.some((e) => e.kind === 'image' && e.src));
  document.querySelector(`[data-an-sc="${si}"]`).onclick();
});
await wait(500);
await pg.evaluate(() => { document.querySelector('[data-an-preset="bounce"]').onclick(); });
await wait(200); /* 데모 재생 중간 포착 */
await pg.screenshot({ path: 'shots/round57-stage.png' });
await br.close();
console.log('capture ok');
