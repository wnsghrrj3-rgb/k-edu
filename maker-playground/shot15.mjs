import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f15'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };

await pg.goto(base + '#/assets', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. Browser — 전체 그리드 */
await pg.screenshot({ path: 'shots/round15-browser.png' }); await frame(4);

/* 2. 검색 — "푸른 하늘" */
await pg.evaluate(() => { const q = document.querySelector('#dmQ'); q.value = '푸른 하늘'; q.oninput(); });
await wait(400); await pg.screenshot({ path: 'shots/round15-search.png' }); await frame(4);
await pg.evaluate(() => { const q = document.querySelector('#dmQ'); q.value = ''; q.oninput(); }); await wait(350);

/* 3. 자산 선택 → Inspector Meta */
await click('[data-dm-sel]');
await pg.screenshot({ path: 'shots/round15-inspector-meta.png' }); await frame(4);

/* 4. AI 탭 — 자동 태그·유사 추천 */
await click('[data-dm-tab="ai"]');
await pg.screenshot({ path: 'shots/round15-ai.png' }); await frame(4);

/* 5. Usage + Replace Everywhere 실행 */
await click('[data-dm-tab="usage"]');
await frame(2);
await click('[data-dm-repl]');
await pg.screenshot({ path: 'shots/round15-replace.png' }); await frame(4);

/* 6. Version 탭 */
await click('[data-dm-tab="ver"]');
await pg.screenshot({ path: 'shots/round15-version.png' }); await frame(3);

/* 7. Variant 탭 — 브랜드 로고 선택 후 */
await pg.evaluate(() => { window.MK_SCREENS.assets._S.src = 'brand:bd-kmaker'; });
await pg.evaluate(() => window.location.hash = '#/assets');
await pg.evaluate(() => window.PG && document.querySelector('[data-dm-src="brand:bd-kmaker"]')?.click()); await wait(400);
await click('[data-dm-sel]');
await click('[data-dm-tab="var"]');
await pg.screenshot({ path: 'shots/round15-variants.png' }); await frame(4);

/* 8. Smart Collection — 푸른 계열 */
await click('[data-dm-src="sc-2"]');
await pg.screenshot({ path: 'shots/round15-collection.png' }); await frame(3);

/* 9. List 뷰 */
await click('[data-dm-src="all"]');
await click('[data-dm-view="list"]');
await pg.screenshot({ path: 'shots/round15-list.png' }); await frame(3);
await click('[data-dm-view="grid"]');

/* 10. 업로드 시뮬 — 청크 큐 */
await click('#dmUp'); await wait(500);
await pg.screenshot({ path: 'shots/round15-upload.png' }); await frame(3);

/* 11. Fullscreen Preview + 배경 토글 */
await click('[data-dm-sel]');
await click('[data-dm-full]');
await pg.screenshot({ path: 'shots/round15-fullscreen.png' }); await frame(3);
await pg.evaluate(() => { const b = document.querySelector('[data-dm-fsbg]'); b && b.onclick({ stopPropagation: () => {}, target: b }); }); await wait(350);
await pg.screenshot({ path: 'shots/round15-fullscreen-dark.png' }); await frame(3);

await br.close();
console.log('shots done, frames:', g);
