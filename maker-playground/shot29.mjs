import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f29'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-ct-tab="${k}"]`);

await pg.goto(base + '#/constitution', { waitUntil: 'networkidle0' }); await wait(1100);
await pg.evaluate(() => window.PG && window.PG.go && window.PG.go('constitution')); await wait(600);

/* 1. 전문·조문 — 20개조 비준 */
await pg.screenshot({ path: 'shots/round29-articles.png' }); await frame(4);

/* 2. 금지·의무 */
await tab('rules'); await frame(3);
await pg.screenshot({ path: 'shots/round29-rules.png' });

/* 3. 단순성 — 초등학생 3분 */
await tab('simp'); await frame(3);
await pg.screenshot({ path: 'shots/round29-simplicity.png' });

/* 4. 철학 8종 */
await tab('phil'); await frame(3);
await pg.screenshot({ path: 'shots/round29-philosophy.png' });

/* 5. 심사 — 6단계 실연: AI 위임 / 1단 기각 / 삭제 우선 / 릴리스 */
await tab('jud'); await frame(3);
await click('[data-ct-prop="handwrite"]'); await frame(3);
await pg.screenshot({ path: 'shots/round29-judge-ai.png' });
await click('[data-ct-prop="trend"]'); await frame(3);
await pg.screenshot({ path: 'shots/round29-judge-reject.png' });
await click('[data-ct-prop="backup"]'); await frame(2);
await click('[data-ct-del="blind"]'); await frame(2);
await pg.screenshot({ path: 'shots/round29-deletefirst-reject.png' });
await click('[data-ct-del="searched"]'); await frame(2);
await click('[data-ct-rel="rush"]'); await frame(2);
await pg.screenshot({ path: 'shots/round29-release-block.png' });
await click('[data-ct-rel="full"]'); await frame(2);

/* 6. 최고규범 — 매력 100 기각 / 충돌 0 채택 */
await tab('sup'); await frame(3);
await click('[data-ct-sup="hot"]'); await frame(3);
await pg.screenshot({ path: 'shots/round29-supremacy-reject.png' });
await click('[data-ct-sup="rank"]'); await frame(3);
await pg.screenshot({ path: 'shots/round29-supremacy-charter.png' });
await click('[data-ct-sup="clean"]'); await frame(3);
await pg.screenshot({ path: 'shots/round29-supremacy-adopt.png' });

/* 7. 체크리스트 */
await tab('chk'); await frame(3);
await pg.screenshot({ path: 'shots/round29-checklist.png' });

/* 8. 산출물 */
await tab('out'); await frame(3);
await pg.screenshot({ path: 'shots/round29-out.png' });

await br.close();

/* GIF */
const { execSync } = await import('child_process');
try { execSync(`ffmpeg -y -framerate 5 -i ${F}/%03d.png -vf "scale=720:-1" shots/round29.gif`, { stdio: 'ignore' }); } catch (e) { console.log('gif skip'); }
console.log('shots done, frames', g);
