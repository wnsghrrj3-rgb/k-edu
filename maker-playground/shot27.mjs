import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f27'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-sp-tab="${k}"]`);

await pg.goto(base + '#/simple', { waitUntil: 'networkidle0' }); await wait(1100);
await pg.evaluate(() => window.PG && window.PG.go && window.PG.go('simple')); await wait(600);

/* 1. 개요 */
await pg.screenshot({ path: 'shots/round27-over.png' }); await frame(4);

/* 2. 메뉴 분류 */
await tab('menu'); await frame(3);
await pg.screenshot({ path: 'shots/round27-menu.png' });

/* 3. 첫 화면 — 단순 vs 불량 스펙 3초 테스트 */
await tab('first'); await frame(3);
await pg.screenshot({ path: 'shots/round27-first.png' });
await click('[data-sp-bad]'); await frame(4);
await pg.screenshot({ path: 'shots/round27-first-bad.png' });
await click('[data-sp-good]'); await frame(3);

/* 4. 단계 공개 — 편집 누적으로 기능이 열린다 */
await tab('level'); await frame(3);
await pg.screenshot({ path: 'shots/round27-level-beginner.png' });
await click('[data-sp-edit]'); await frame(3);
await click('[data-sp-edit]'); await frame(3);
await pg.screenshot({ path: 'shots/round27-level-grow.png' });
await pg.evaluate(() => { const c = document.querySelector('[data-sp-opt]'); if (c) { c.checked = true; c.dispatchEvent(new Event('change')); } }); await wait(380); await frame(3);
await pg.screenshot({ path: 'shots/round27-level-expert.png' });

/* 5. 실내비 — 🌱 단순 모드 토글 */
await pg.evaluate(() => window.PG.toggleNavMode()); await wait(420); await frame(5);
await pg.screenshot({ path: 'shots/round27-nav-simple.png' });
await pg.evaluate(() => window.PG.toggleNavMode()); await wait(420); await frame(3);

/* 6. 컨텍스트 */
await tab('ctx'); await frame(2);
await click('[data-sp-sel="image"]'); await frame(2);
await pg.screenshot({ path: 'shots/round27-ctx.png' });

/* 7. 팔레트 — 숨김 기능 도달 */
await tab('pal'); await frame(2);
await pg.evaluate(() => { const i = document.querySelector('[data-sp-q]'); if (i) i.value = 'admin'; });
await click('[data-sp-search]'); await frame(4);
await pg.screenshot({ path: 'shots/round27-palette.png' });

/* 8. 30초 */
await tab('t30'); await frame(2);
await click('[data-sp-t30]'); await frame(4);
await pg.screenshot({ path: 'shots/round27-t30.png' });

/* 9. 산출물 */
await tab('out'); await frame(4);
await pg.screenshot({ path: 'shots/round27-out.png' });

await br.close();

/* GIF */
import { execSync } from 'child_process';
try {
  execSync(`ffmpeg -y -framerate 6 -i ${F}/%03d.png -vf "scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" shots/round27-simplify.gif`, { stdio: 'pipe' });
  console.log('gif ok, frames', g);
} catch (e) { console.log('gif fail', e.message.slice(0, 200)); }
