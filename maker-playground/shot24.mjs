import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f24'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const setv = (sel, v) => pg.evaluate((s, val) => { const i = document.querySelector(s); if (i) i.value = val; }, sel, v);
const tab = (k) => click(`[data-dls-tab="${k}"]`);

await pg.goto(base + '#/dls', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 개요 — 철학·Less/More·산출물 9/9 */
await pg.screenshot({ path: 'shots/round24-over.png' }); await frame(4);

/* 2. 컬러 — semantic 파생표 + 대비 검사기 실연 */
await tab('color'); await frame(3);
await pg.screenshot({ path: 'shots/round24-color.png' });
await setv('[data-dls-fg]', '#2E8C7F'); await click('[data-dls-contrast]'); await frame(3);
await setv('[data-dls-fg]', '#E8735A'); await click('[data-dls-contrast]'); await frame(3);
await pg.screenshot({ path: 'shots/round24-contrast.png' });

/* 3. 타이포 */
await tab('type'); await frame(3);
await pg.screenshot({ path: 'shots/round24-type.png' });

/* 4. 간격·형태 — 14px 린트 거부 실연 */
await tab('shape'); await frame(2);
await setv('[data-dls-sp]', '14'); await click('[data-dls-splint]'); await frame(3);
await pg.screenshot({ path: 'shots/round24-shape.png' });
await setv('[data-dls-sp]', '16'); await click('[data-dls-splint]'); await frame(2);

/* 5. 모션·아이콘 — 300ms 거부·비정합 아이콘 실연 */
await tab('motion'); await frame(2);
await click('[data-dls-mo-bad]'); await frame(3);
await click('[data-dls-icon-bad]'); await frame(3);
await pg.screenshot({ path: 'shots/round24-motion.png' });

/* 6. 컴포넌트 — 10 PASS + 위반 스펙 린트 */
await tab('comp'); await frame(3);
await pg.screenshot({ path: 'shots/round24-comp.png' });
await click('[data-dls-lint-bad]'); await frame(3);

/* 7. 다크·반응형 — 다크 전환 실연 */
await tab('adapt'); await frame(2);
await pg.screenshot({ path: 'shots/round24-adapt.png' });
await click('[data-dls-dark]'); await frame(4);
await pg.screenshot({ path: 'shots/round24-dark.png' });
await click('[data-dls-dark]'); await frame(2);

/* 8. 산출물 — CSS 내보내기·일관성 감사 */
await tab('ship'); await frame(2);
await click('[data-dls-css]'); await frame(3);
await click('[data-dls-audit]'); await frame(3);
await pg.screenshot({ path: 'shots/round24-ship.png' });

await br.close();
console.log('frames', g);
