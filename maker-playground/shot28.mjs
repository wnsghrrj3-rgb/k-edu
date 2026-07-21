import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f28'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-iv-tab="${k}"]`);

await pg.goto(base + '#/invisible', { waitUntil: 'networkidle0' }); await wait(1100);
await pg.evaluate(() => window.PG && window.PG.go && window.PG.go('invisible')); await wait(600);

/* 1. 개요 */
await pg.screenshot({ path: 'shots/round28-over.png' }); await frame(4);

/* 2. UI 감사 + 디자인 리뷰 게이트 거부/승인 */
await tab('audit'); await frame(3);
await pg.screenshot({ path: 'shots/round28-audit.png' });
await click('[data-iv-prop="add"]'); await frame(3);
await pg.screenshot({ path: 'shots/round28-review-reject.png' });
await click('[data-iv-prop="swap"]'); await frame(3);
await pg.screenshot({ path: 'shots/round28-review-accept.png' });

/* 3. 결정·기본값 */
await tab('dec'); await frame(3);
await pg.screenshot({ path: 'shots/round28-decision.png' });

/* 4. 컨텍스트·툴바 — 선택 전환 */
await tab('ctx'); await frame(3);
await pg.screenshot({ path: 'shots/round28-ctx-text.png' });
await click('[data-iv-ctx="image"]'); await frame(3);
await pg.screenshot({ path: 'shots/round28-ctx-image.png' });

/* 5. 동반자·자동화 — 기본 숨김 → 트리거 등장 → 무알림 저널 */
await tab('auto'); await frame(3);
await pg.screenshot({ path: 'shots/round28-companion-hidden.png' });
await click('[data-iv-idle]'); await frame(4);
await pg.screenshot({ path: 'shots/round28-companion-stuck.png' });
await click('[data-iv-calm]'); await frame(2);
await click('[data-iv-auto="auto-save"]'); await frame(2);
await click('[data-iv-auto="auto-align"]'); await frame(2);
await click('[data-iv-auto="auto-name"]'); await frame(3);
await pg.screenshot({ path: 'shots/round28-silent-journal.png' });

/* 6. 검색·의도 — "발표" */
await tab('sea'); await frame(2);
await click('[data-iv-search]'); await frame(4);
await pg.screenshot({ path: 'shots/round28-search.png' });
await click('[data-iv-intent]'); await frame(4);
await pg.screenshot({ path: 'shots/round28-intent.png' });

/* 7. 마찰·감정 */
await tab('fri'); await frame(3);
await pg.screenshot({ path: 'shots/round28-friction.png' });

/* 8. 산출물 */
await tab('out'); await frame(4);
await pg.screenshot({ path: 'shots/round28-out.png' });

await br.close();
console.log('captures done, frames:', g);
