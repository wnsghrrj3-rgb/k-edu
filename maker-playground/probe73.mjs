import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage(); pg.setDefaultTimeout(300000);
await pg.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
const cdp = await pg.createCDPSession();
await pg.goto('http://127.0.0.1:8913/maker-playground/index.html#/video', { waitUntil: 'networkidle0' });
await pg.evaluate(async () => { window.__P = await (await fetch('/_perf73_photos.json')).json(); });
for (const rate of [1, 6]) {
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const r = await pg.evaluate(async () => {
    const P = window.__P.slice(0, 10);
    const viaImage = async (src) => new Promise((res) => {
      const img = new Image();
      img.onload = () => { const w=320, h=Math.round(img.naturalHeight*(w/img.naturalWidth));
        const c=document.createElement('canvas'); c.width=w; c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h); res(c.toDataURL('image/jpeg',0.72).length); };
      img.onerror = () => res(0); img.src = src;
    });
    const viaBitmap = async (src) => {
      try {
        const blob = await (await fetch(src)).blob();
        const bmp = await createImageBitmap(blob, { resizeWidth: 320, resizeQuality: 'low' });
        const c=document.createElement('canvas'); c.width=bmp.width; c.height=bmp.height;
        c.getContext('2d').drawImage(bmp,0,0); bmp.close();
        return c.toDataURL('image/jpeg',0.72).length;
      } catch(e) { return -1; }
    };
    const run = async (fn) => { const t=performance.now(); for (const p of P) { await fn(p.src); await new Promise(r=>setTimeout(r,0)); } return +(performance.now()-t).toFixed(0); };
    const a = await run(viaImage);
    const b = await run(viaBitmap);
    const a2 = await run(viaImage);
    return { image: a, bitmap: b, imageAgain: a2 };
  });
  console.log(`CPU ${rate}x · 10장 | Image+canvas ${r.image}ms (재측 ${r.imageAgain}ms) | createImageBitmap 축소디코드 ${r.bitmap}ms`);
}
await br.close();
