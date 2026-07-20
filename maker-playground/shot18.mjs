import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f18'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };

await pg.goto(base + '#/market', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 탐색 — 컬렉션·검색·카드 */
await pg.screenshot({ path: 'shots/round18-browse.png' }); await frame(4);

/* 2. 검색 + 미소속 전환(교내 전용 숨김) */
await pg.evaluate(() => { const i = document.querySelector('[data-mkt="q"]'); i.value = '수업'; i.onkeydown({ key: 'Enter' }); }); await wait(400);
await pg.screenshot({ path: 'shots/round18-search.png' }); await frame(3);
await pg.evaluate(() => { const i = document.querySelector('[data-mkt="q"]'); i.value = ''; i.onkeydown({ key: 'Enter' }); }); await wait(300);
await pg.evaluate(() => { const s = document.querySelector('[data-mkt="org"]'); s.value = ''; s.onchange(); }); await wait(300);
await pg.screenshot({ path: 'shots/round18-public.png' }); await frame(2);
await pg.evaluate(() => { const s = document.querySelector('[data-mkt="org"]'); s.value = 'geumseong'; s.onchange(); }); await wait(300); await frame(2);

/* 3. 상세 — 버전 이력·리뷰·추천·분석 */
await click('[data-mkt="open:mk-pres-minimal"]');
await pg.screenshot({ path: 'shots/round18-detail.png' }); await frame(4);

/* 4. 구매(쿠폰) → 설치 — u-t2 는 이미 구버전 보유 → 업데이트 버튼 데모 */
await pg.evaluate(() => { const s = document.querySelector('[data-mkt="user"]'); s.value = 'u-t2'; s.onchange(); }); await wait(400);
await frame(2);
await click('[data-mkt="update:mk-pres-minimal"]'); await frame(3);
await pg.screenshot({ path: 'shots/round18-update.png' });

/* 5. 무료 상품 즉시 설치 (플러그인 브리지) */
await click('[data-mkt="back"]');
await click('[data-mkt="open:mk-edu-science"]'); await frame(2);
await pg.screenshot({ path: 'shots/round18-edu-detail.png' }); await frame(2);

/* 6. 크리에이터 — 프로필·랭킹 */
await click('[data-mkt="tab:creator"]');
await pg.screenshot({ path: 'shots/round18-creator.png' }); await frame(4);

/* 7. 대시보드 — KPI·정산·인보이스 */
await click('[data-mkt="tab:dash"]'); await frame(2);
await pg.evaluate(() => { const s = document.querySelector('[data-mkt="crsel"]'); s.value = 'cr-junho'; s.onchange(); }); await wait(400);
await click('[data-mkt="settle"]'); await wait(400);
await pg.screenshot({ path: 'shots/round18-dashboard.png' }); await frame(4);

/* 8. 운영 — 심사 로그·신고·저작권 */
await click('[data-mkt="tab:admin"]');
await pg.screenshot({ path: 'shots/round18-admin.png' }); await frame(3);
await click('[data-mkt="takedown:' + (await pg.evaluate(() => window.MK_MARKET._reports.find((r) => r.status === 'open')?.id)) + '"]'); await frame(3);
await pg.screenshot({ path: 'shots/round18-admin-done.png' }); await frame(2);

await br.close();
console.log('shots done, frames:', g);
