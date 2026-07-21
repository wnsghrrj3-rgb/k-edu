import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f30'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-au-tab="${k}"]`);

await pg.goto(base + '#/audit', { waitUntil: 'networkidle0' }); await wait(1100);
await pg.evaluate(() => window.PG && window.PG.go && window.PG.go('audit')); await wait(600);

/* 1. 개요 — 100/10/삭제 30% + Before/After */
await pg.screenshot({ path: 'shots/round30-over.png' }); await frame(4);

/* 2. Zero-based 거부 실연 — legacy·6질문 미답 */
await click('[data-au-try="legacy"]'); await frame(3);
await pg.screenshot({ path: 'shots/round30-legacy-reject.png' });
await click('[data-au-try="six"]'); await frame(3);
await pg.screenshot({ path: 'shots/round30-six-reject.png' });

/* 3. 전수 100 */
await tab('inv'); await frame(3);
await pg.screenshot({ path: 'shots/round30-inventory.png' });

/* 4. 판정·삭제·통합 */
await tab('del'); await frame(3);
await pg.screenshot({ path: 'shots/round30-delete.png' });

/* 5. 10경험 */
await tab('exp'); await frame(3);
await pg.screenshot({ path: 'shots/round30-experiences.png' });

/* 6. 메뉴·이름·시선 */
await tab('menu'); await frame(3);
await pg.screenshot({ path: 'shots/round30-menu-diet.png' });

/* 7. 레벨 — L1 → L3 → L5 확장 실연 */
await tab('lv'); await frame(3);
await pg.screenshot({ path: 'shots/round30-level1.png' });
await click('[data-au-lv="3"]'); await frame(3);
await click('[data-au-lv="5"]'); await frame(3);
await pg.screenshot({ path: 'shots/round30-level5.png' });

/* 8. 테스트 — 5초 정상 → 불량 스펙 실패 실연 */
await tab('test'); await frame(3);
await pg.screenshot({ path: 'shots/round30-tests.png' });
await click('[data-au-bad]'); await frame(3);
await pg.screenshot({ path: 'shots/round30-fivesec-fail.png' });
await click('[data-au-bad]'); await frame(2);

/* 9. 산출물 */
await tab('out'); await frame(3);
await pg.screenshot({ path: 'shots/round30-out.png' });

await br.close();

/* GIF */
const { execSync } = await import('child_process');
try { execSync(`ffmpeg -y -framerate 5 -i ${F}/%03d.png -vf "scale=720:-1" shots/round30-audit.gif`, { stdio: 'ignore' }); } catch (e) { console.log('gif skip'); }
console.log('shots done, frames', g);
