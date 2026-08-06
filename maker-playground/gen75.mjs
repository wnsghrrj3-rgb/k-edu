/* gen75.mjs — 실측용 사진 묶음 생성 (레포에 커밋하지 않음)
   R73 과 같은 규모: 12MP 급 JPEG 30장. 252×189 잡음을 4032 폭으로
   업스케일해 q0.72 로 굽는다 → 장당 1.5MB 안팎. */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const N = +(process.argv[2] || 30);
const OUT = process.argv[3] || '/home/claude/k-edu/_perf75_photos.json';

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args, headless: 'shell',
});
const pg = await br.newPage();
pg.setDefaultTimeout(600000);
await pg.goto('http://127.0.0.1:8913/maker-playground/index.html', { waitUntil: 'domcontentloaded' });

const photos = [];
for (let i = 0; i < N; i++) {
  const p = await pg.evaluate(async (i) => {
    const sw = 252, sh = 189;
    const s = document.createElement('canvas'); s.width = sw; s.height = sh;
    const sx = s.getContext('2d');
    const im = sx.createImageData(sw, sh);
    for (let k = 0; k < im.data.length; k += 4) {
      im.data[k] = (Math.random() * 256) | 0;
      im.data[k + 1] = (Math.random() * 256) | 0;
      im.data[k + 2] = (Math.random() * 256) | 0;
      im.data[k + 3] = 255;
    }
    sx.putImageData(im, 0, 0);
    const w = 4032, h = 3024;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.drawImage(s, 0, 0, w, h);
    g.font = 'bold 600px sans-serif'; g.fillStyle = '#fff';
    g.fillText(String(i + 1), 200, 1200);
    const url = c.toDataURL('image/jpeg', 0.72);
    return { src: url, bytes: Math.round(url.length * 0.75), w, h };
  }, i);
  photos.push({ ...p, name: `photo${i + 1}.jpg`, kind: 'image' });
  if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${N}장 · 누적 ${(photos.reduce((a, x) => a + x.bytes, 0) / 1048576).toFixed(1)}MB`);
}
fs.writeFileSync(OUT, JSON.stringify(photos));
console.log(`저장 ${OUT} · ${photos.length}장 · 합 ${(photos.reduce((a, x) => a + x.bytes, 0) / 1048576).toFixed(1)}MB`);
await br.close();
