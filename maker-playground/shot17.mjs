import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f17'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };

await pg.goto(base + '#/plugins', { waitUntil: 'networkidle0' }); await wait(1100);

/* 1. 스토어 전경 — 카드·평점·권한·비공개 배포 */
await pg.screenshot({ path: 'shots/round17-store.png' }); await frame(4);

/* 2. 카테고리 필터 + 미소속 전환(비공개 숨김) */
await click('[data-pl="cat:education"]'); await frame(3);
await pg.evaluate(() => { const s = document.querySelector('[data-pl="org"]'); s.value = ''; s.onchange(); }); await wait(300);
await pg.screenshot({ path: 'shots/round17-store-public.png' }); await frame(2);
await pg.evaluate(() => { const s = document.querySelector('[data-pl="org"]'); s.value = 'geumseong'; s.onchange(); }); await wait(300);
await click('[data-pl="cat:all"]'); await frame(2);

/* 3. 설치 + 리뷰 */
await click('[data-pl="install:flowchart"]'); await frame(3);
await click('[data-pl="review:mindmap"]'); await frame(2);

/* 4. 설치됨 — 라이프사이클·권한 토글 */
await click('[data-pl="tab:installed"]');
await pg.screenshot({ path: 'shots/round17-installed.png' }); await frame(4);
await click('[data-pl="suspend:mindmap"]'); await frame(3);
await click('[data-pl="resume:mindmap"]'); await frame(2);
await click('[data-pl="perm:qr-gen:network"]'); await frame(2);

/* 5. 명령 즉시 실행 → Editor 확인 */
await click('[data-pl="exec:kedu.worksheet"]'); await frame(3);
await pg.screenshot({ path: 'shots/round17-cmd-run.png' });

/* 6. 개발자 — SDK·Test Harness·콘솔 */
await click('[data-pl="tab:dev"]');
await pg.screenshot({ path: 'shots/round17-dev.png' }); await frame(4);
await click('[data-pl="runtest"]'); await wait(300);
await pg.screenshot({ path: 'shots/round17-harness.png' }); await frame(4);

/* 7. Editor — 플러그인 툴바 버튼 실행(타임라인 장면 생성) */
await pg.goto(base + '#/editor', { waitUntil: 'networkidle0' }); await wait(900);
await pg.evaluate(() => { if (!window.PG.state.editor.doc) { window.PG.loadEditorDoc(); window.PG.render(); } }); await wait(400);
await pg.screenshot({ path: 'shots/round17-editor-plugbtn.png' }); await frame(3);
await click('[data-plugcmd="timeline.convert"]'); await wait(500);
await pg.evaluate(() => { const e = window.PG.state.editor; e.sceneIdx = e.doc.scenes.length - 1; window.PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round17-editor-timeline.png' }); await frame(4);

await br.close();
console.log('shots done, frames:', g);
