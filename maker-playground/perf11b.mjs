import puppeteer from 'puppeteer-core'; import chromium from '@sparticuz/chromium'; import fs from 'fs';
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const out = {};
for (const dsf of [1, 2]) {
  const pg = await br.newPage();
  await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: dsf });
  await pg.goto('http://localhost:8902/maker-playground/index.html#/library', { waitUntil: 'networkidle0' });
  await new Promise(r=>setTimeout(r,700));
  await pg.evaluate(() => { const L = MK_SCREENS.library; L._S.mode='browse'; L._S.cat='all'; L._paint(); });
  await new Promise(r=>setTimeout(r,600));
  out['dsf'+dsf] = await pg.evaluate(async () => {
    const vp = document.getElementById('lbVP'); MK_CAT.clearCache();
    const fr=[]; vp.scrollTop=0; await new Promise(r=>requestAnimationFrame(r)); let last=performance.now();
    for (let i=0;i<400;i++){ vp.scrollTop=i*48; await new Promise(r=>requestAnimationFrame(r)); const t=performance.now(); fr.push(t-last); last=t; }
    const f=fr.slice(3).sort((a,b)=>a-b); const p=(x)=>+(f[Math.floor(f.length*x)]||0).toFixed(2);
    return { median:p(0.5), p95:p(0.95), max:+f[f.length-1].toFixed(2), fps:+(1000/p(0.5)).toFixed(1),
      over33: f.filter(x=>x>33.4).length, of: f.length, cards: document.querySelectorAll('.lb-card').length,
      domNodes: document.querySelectorAll('*').length, miss: MK_CAT.cacheStats.miss };
  });
  await pg.close();
}
console.log(JSON.stringify(out,null,2)); fs.writeFileSync('shots/round11-perf-dsf.json', JSON.stringify(out,null,2));
await br.close();
