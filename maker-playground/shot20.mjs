import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f20'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-dev="tab:${k}"]`);

await pg.goto(base + '#/dev', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 개요 — 파이프라인·버전·KPI */
await pg.screenshot({ path: 'shots/round20-over.png' }); await frame(4);

/* 2. 탐색기 — 무자격 401 실판정 */
await tab('explorer'); await frame(2);
await pg.evaluate(() => { const s = document.querySelector('select[data-dev="exAuth"]'); s.value = 'none'; s.onchange(); }); await wait(350);
await click('button[data-dev="exec"]'); await frame(3);
await pg.screenshot({ path: 'shots/round20-explorer-401.png' });

/* 3. 탐색기 — 자격 전환 후 200 + 레이트 헤더 */
await pg.evaluate(() => { const s = document.querySelector('select[data-dev="exAuth"]'); s.value = 'geum'; s.onchange(); }); await wait(350);
await click('button[data-dev="exec"]'); await frame(3);
await pg.screenshot({ path: 'shots/round20-explorer-200.png' });

/* 4. 인증 — 앱·키·PAT + OAuth 플로 실연(회전·재사용 거부) */
await tab('auth'); await frame(2);
await click('button[data-dev="oauthCode"]'); await frame(2);
await click('button[data-dev="oauthToken"]'); await frame(2);
await click('button[data-dev="oauthRefresh"]'); await frame(2);
await pg.screenshot({ path: 'shots/round20-auth.png' });
await click('button[data-dev="oauthReuse"]'); await frame(3);
await pg.screenshot({ path: 'shots/round20-auth-reuse.png' });

/* 5. 웹훅 — 배달 로그·재시도·DLQ 재배달 */
await tab('hooks'); await frame(3);
await pg.screenshot({ path: 'shots/round20-hooks.png' });
await click('button[data-dev="fixFlaky"]'); await frame(1);
await pg.evaluate(() => { const b = document.querySelector('button[data-dev^="redeliver:"]'); b && b.click(); }); await wait(380); await frame(2);
await click('button[data-dev="tick40"]'); await frame(3);
await pg.screenshot({ path: 'shots/round20-hooks-redeliver.png' });

/* 6. 자동화 — 조건 매치/불일치 실연 + 발신함 */
await tab('auto'); await frame(2);
await click('button[data-dev="fireSave1"]'); await frame(2);
await click('button[data-dev="fireSave2"]'); await frame(3);
await pg.screenshot({ path: 'shots/round20-auto.png' });

/* 7. 워크플로 — PDF 분기 실행 → delay 재개 */
await tab('flow'); await frame(2);
await click('button[data-dev="flowPdf"]'); await frame(3);
await click('button[data-dev="tickFlow"]'); await frame(2);
await pg.evaluate(() => { const b = document.querySelector('button[data-dev^="flowSel:"]'); b && b.click(); }); await wait(380); await frame(3);
await pg.screenshot({ path: 'shots/round20-flow.png' });

/* 8. 모니터링 — 사용량·free 티어 429 실연 */
await tab('mon'); await frame(2);
await click('button[data-dev="burstFree"]'); await frame(3);
await pg.screenshot({ path: 'shots/round20-mon.png' });

/* 9. 문서 — OpenAPI·SDK 스니펫·CLI 실행 */
await tab('docs'); await frame(2);
await pg.evaluate(() => { const b = document.querySelector('button[data-dev="cliRun"]'); b && b.click(); }); await wait(380); await frame(3);
await pg.screenshot({ path: 'shots/round20-docs.png' });

await br.close();
console.log('shots + frames:', g);
