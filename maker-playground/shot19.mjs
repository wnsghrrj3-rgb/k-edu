import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f19'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-adm="tab:${k}"]`);

await pg.goto(base + '#/admin', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 대시보드 — KPI 10종·최근 활동·라이선스 */
await pg.screenshot({ path: 'shots/round19-dash.png' }); await frame(4);

/* 2. 조직 — 계층 트리·유효 정책(상속 경로) */
await tab('org');
await pg.screenshot({ path: 'shots/round19-org.png' }); await frame(3);

/* 3. 사용자 — 라이프사이클 액션 + 잠금 실연 */
await tab('users'); await frame(2);
await pg.screenshot({ path: 'shots/round19-users.png' });

/* 4. 권한 — 매트릭스 + 판정기(거부 판정 실연) */
await tab('perms'); await frame(2);
await pg.evaluate(() => { const s = document.querySelector('select[data-adm="permKey"]'); s.value = 'billing.manage'; s.onchange(); }); await wait(350);
await pg.screenshot({ path: 'shots/round19-perms.png' }); await frame(2);

/* 5. 보안 — 오답 5회 자동 잠금 실연 */
await tab('security'); await frame(2);
await pg.screenshot({ path: 'shots/round19-security.png' });
await click('[data-adm="brute"]'); await frame(3);
await pg.screenshot({ path: 'shots/round19-lockout.png' });

/* 6. 거버넌스 — AI 정책 위반·게스트 쿼터 초과 실연 */
await tab('gov'); await frame(2);
await click('[data-adm="aiTry"]'); await frame(2);
await click('[data-adm="stTry"]'); await frame(2);
await pg.screenshot({ path: 'shots/round19-gov.png' });

/* 7. 조직 전환 → 한빛(Enterprise) 빌링 — 청구서·세금계산서 */
await pg.evaluate(() => { const s = document.querySelector('select[data-adm="org"]'); s.value = 'hanbit'; s.onchange(); }); await wait(400);
await tab('billing'); await frame(3);
await pg.screenshot({ path: 'shots/round19-billing.png' });

/* 8. 운영 — 감사 로그·심사 브리지·백업 */
await pg.evaluate(() => { const s = document.querySelector('select[data-adm="org"]'); s.value = 'geumseong'; s.onchange(); }); await wait(400);
await tab('ops'); await frame(2);
await pg.screenshot({ path: 'shots/round19-ops.png' });
await click('[data-adm="backup"]'); await frame(3);
await pg.screenshot({ path: 'shots/round19-backup.png' });

await br.close();
console.log('shots done, frames:', g);
