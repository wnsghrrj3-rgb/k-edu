import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f23'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-fl-tab="${k}"]`);

await pg.goto(base + '#/flow', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 개요 */
await pg.screenshot({ path: 'shots/round23-over.png' }); await frame(4);

/* 2. 팔레트 — Ctrl+K 실연 + 검색 */
await pg.keyboard.down('Control'); await pg.keyboard.press('k'); await pg.keyboard.up('Control'); await wait(450); await frame(3);
await pg.evaluate(() => { const i = document.querySelector('[data-fl-q]'); if (i) i.value = '브랜드'; });
await click('[data-fl-search]'); await frame(3);
await pg.screenshot({ path: 'shots/round23-palette.png' });

/* 3. 예측 — 이미지→Crop→Shadow→Align 체인 */
await tab('predict'); await frame(2);
await click('[data-fl-x="insert-image"]'); await frame(3);
await click('[data-fl-x="crop"]'); await frame(2);
await click('[data-fl-x="shadow"]'); await frame(2);
await pg.screenshot({ path: 'shots/round23-predict.png' }); await frame(2);

/* 4. 스마트 UI — 선택 전환 */
await tab('smart'); await frame(2);
await click('[data-fl-sel="image"]'); await frame(3);
await click('[data-fl-sel="table"]'); await frame(2);
await click('[data-fl-expand]'); await frame(2);
await pg.screenshot({ path: 'shots/round23-smart.png' });

/* 5. 마찰 제로 — 자동저장·undo */
await tab('friction'); await frame(2);
await click('[data-fl-dirty]'); await frame(2);
await click('[data-fl-tick]'); await frame(3);
await click('[data-fl-autoname]'); await frame(2);
await pg.screenshot({ path: 'shots/round23-friction.png' });
await click('[data-fl-undo]'); await frame(2);

/* 6. 여정 — 마일스톤·delight·페르소나 */
await tab('journey'); await frame(2);
await click('[data-fl-x="new-project"]'); await frame(2);
await click('[data-fl-x="export"]'); await frame(3);
await click('[data-fl-x="ai-ask"]'); await frame(2);
await click('[data-fl-matrix]'); await frame(3);
await pg.screenshot({ path: 'shots/round23-journey.png' });

/* 7. 분석 */
await tab('analytics'); await frame(3);
await pg.screenshot({ path: 'shots/round23-analytics.png' });
await click('[data-fl-lay-apply]'); await frame(2);

/* 8. 가드 */
await tab('guard'); await frame(3);
await click('[data-fl-motion-bad]'); await frame(3);
await pg.screenshot({ path: 'shots/round23-guard.png' });

await br.close();
console.log('frames', g);
