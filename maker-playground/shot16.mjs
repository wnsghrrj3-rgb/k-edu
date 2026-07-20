import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f16'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };

await pg.goto(base + '#/export', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. Studio 전경 — PPTX 기본 */
await pg.screenshot({ path: 'shots/round16-studio.png' }); await frame(4);

/* 2. 애니메이션 스크럽 — 타임라인 t 샘플링(같은 파이프라인) */
await pg.evaluate(() => { const t = document.querySelector('[data-ex-t]'); t.value = 20; t.oninput(); });
await wait(250); await pg.screenshot({ path: 'shots/round16-scrub-early.png' }); await frame(3);
await pg.evaluate(() => { const t = document.querySelector('[data-ex-t]'); t.value = 60; t.oninput(); }); await wait(200); await frame(3);
await pg.evaluate(() => { const t = document.querySelector('[data-ex-t]'); t.value = 200; t.oninput(); });
await wait(250); await frame(2);

/* 3. Scene 페이저 */
await click('[data-ex-pg="1"]');
await pg.screenshot({ path: 'shots/round16-scene2.png' }); await frame(3);

/* 4. PDF 옵션 — 용지·재단·CMYK */
await click('[data-ex-fmt="pdf"]');
await pg.screenshot({ path: 'shots/round16-pdf-options.png' }); await frame(3);

/* 5. 프리셋 — A3 포스터(인쇄) */
await click('[data-ex-preset="print-a3"]');
await pg.screenshot({ path: 'shots/round16-preset-a3.png' }); await frame(3);

/* 6. 내보내기 실행 — 큐 진행 */
await click('[data-ex-run]'); await wait(300);
await pg.screenshot({ path: 'shots/round16-queue-running.png' }); await frame(5);
await wait(1200);
await pg.screenshot({ path: 'shots/round16-queue-done.png' }); await frame(4);

/* 7. 배치 — 전체 템플릿 일괄 */
await click('[data-ex-fmt="svg"]');
await click('[data-ex-batch]'); await wait(500); await frame(4);
await wait(2600);
await pg.evaluate(() => window.PG.render()); await wait(400);
await pg.screenshot({ path: 'shots/round16-batch.png' }); await frame(4);

/* 8. 포스터 소스 + PNG 4x */
await click('[data-ex-src="smp-post-01"]');
await click('[data-ex-fmt="png"]');
await click('[data-ex-scale="4"]');
await pg.screenshot({ path: 'shots/round16-poster-png.png' }); await frame(3);

/* 9. 영상 소스 + Video 플랜 */
await click('[data-ex-src="smp-vid-01"]');
await click('[data-ex-fmt="video"]');
await pg.screenshot({ path: 'shots/round16-video.png' }); await frame(3);

/* 10. HTML 포맷 + 카드뉴스 */
await click('[data-ex-src="smp-card-01"]');
await click('[data-ex-fmt="html"]');
await pg.screenshot({ path: 'shots/round16-html.png' }); await frame(3);

await br.close();
console.log('shots done, frames:', g);
