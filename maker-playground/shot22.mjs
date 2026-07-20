import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f22'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-ag-tab="${k}"]`);

await pg.goto(base + '#/agent', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 개요 — 이해·메모리 */
await pg.screenshot({ path: 'shots/round22-over.png' }); await frame(4);

/* 2. 스튜디오 — 소개서 생성 실연 (Preview → 실행 → 플랜) */
await tab('studio'); await frame(2);
await pg.evaluate(() => { const i = document.querySelector('[data-ag-prompt]'); i.value = '회사 소개서 「금성초 이야기」 만들어줘'; });
await click('[data-ag-preview]'); await frame(3);
await click('[data-ag-run]'); await frame(4);
await pg.screenshot({ path: 'shots/round22-studio.png' });

/* 3. 에이전트 — invoke 공개 경로 */
await tab('agents'); await frame(2);
await click('[data-ag-agent="illustrator"]'); await frame(3);
await pg.screenshot({ path: 'shots/round22-agents.png' });

/* 4. 타임라인 — Job·설명·Undo */
await tab('timeline'); await frame(2);
await click('[data-ag-undo]'); await frame(2);
await click('[data-ag-redo]'); await frame(2);
await pg.screenshot({ path: 'shots/round22-timeline.png' });

/* 5. 리뷰 — 6종 검사 + 협업 시뮬 */
await tab('review'); await frame(2);
await click('[data-ag-collab]'); await frame(2);
await click('[data-ag-conflict]'); await frame(3);
await pg.screenshot({ path: 'shots/round22-review.png' });

/* 6. 작업·자동화 — 예약 생성 → 시간 감기 → 실행 */
await tab('tasks'); await frame(2);
await click('[data-ag-task-later]'); await frame(2);
await click('[data-ag-auto="auto-brand"]'); await frame(2);
await click('[data-ag-tick-h]'); await frame(2);
await click('[data-ag-tick-d]'); await frame(3);
await pg.screenshot({ path: 'shots/round22-tasks.png' });

/* 7. 팔레트·음성 → 인스펙터 */
await tab('palette'); await frame(2);
await click('[data-ag-voice-run]'); await frame(3);
await tab('inspector'); await frame(3);
await pg.screenshot({ path: 'shots/round22-inspector.png' });

await br.close();
console.log('PNG 6종 + 프레임', g, '장');
