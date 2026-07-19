import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8902/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f12'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };

/* AI Dock을 연 리뷰 모드로 진입 */
await pg.goto(base + '#/review', { waitUntil: 'networkidle0' }); await wait(800);
const cmd = async (c) => { await pg.evaluate((x) => { const b = [...document.querySelectorAll('[data-cmd]')].find((e) => e.dataset.cmd === x); if (b) b.click(); else { const i = document.querySelector('[data-ed="ai-in"]'); i.value = x; document.querySelector('[data-ed="ai-run"]').click(); } }, c); await wait(420); };
const openAI = async () => { await pg.evaluate(() => { PG.state.editor.menu = 'ai'; PG.render(); }); await wait(400); };
const clip = { x: 0, y: 0, width: 1440, height: 900 };

/* ---------- 1. AI Dock 첫 화면 ---------- */
await openAI();
await pg.screenshot({ path: 'shots/round12-dock.png' });
await (await pg.$('.ed-aidock')).screenshot({ path: 'shots/round12-dock-panel.png' });
await frame(6);

/* ---------- 2. Selection AI — 제목 고급스럽게 ---------- */
await pg.evaluate(() => { PG.state.editor.selEl = PG.state.editor.doc.scenes[0].elements.findIndex((e) => e.kind === 'text' && e.size > 8); PG.render(); });
await wait(300); await frame(3);
await cmd('이 제목을 더 고급스럽게'); await frame(4);
await pg.screenshot({ path: 'shots/round12-selection.png' });

/* ---------- 3. Theme — 다크 모드 + 팔레트 ---------- */
await cmd('테마를 코발트로'); await frame(4);
await pg.screenshot({ path: 'shots/round12-theme.png' });
await cmd('다크 모드'); await frame(4);
await pg.screenshot({ path: 'shots/round12-dark.png' });

/* ---------- 4. Generate — FAQ 씬 생성 ---------- */
await cmd('FAQ 페이지 추가'); await frame(5);
await pg.screenshot({ path: 'shots/round12-generate.png' });

/* ---------- 5. Chart — 표 추가 → 차트 → 원형 ---------- */
await pg.evaluate(() => { PG.state.editor.sceneIdx = 5; PG.state.editor.selEl = null; PG.render(); });
await wait(300);
await cmd('표 추가'); await frame(3);
await pg.screenshot({ path: 'shots/round12-table.png' });
await cmd('표를 차트로'); await frame(4);
await pg.screenshot({ path: 'shots/round12-chart.png' });
await cmd('원형 그래프로'); await frame(4);
await pg.screenshot({ path: 'shots/round12-chart-pie.png' });
await (await pg.$('.ed-canvas')).screenshot({ path: 'shots/round12-chart-canvas.png' });

/* ---------- 6. Project AI — 슬라이드 축약 ---------- */
await cmd('슬라이드를 8장으로 줄여'); await frame(5);
await pg.screenshot({ path: 'shots/round12-project.png' });

/* ---------- 7. History — Undo 3연타 ---------- */
for (let i = 0; i < 3; i++) { await pg.click('[data-ed="undo"]'); await wait(320); await frame(3); }
await pg.screenshot({ path: 'shots/round12-undo.png' });
await (await pg.$('.ed-toolbar')).screenshot({ path: 'shots/round12-toolbar.png' });

/* ---------- 8. Apple 스타일 (마무리 프레임) ---------- */
await pg.evaluate(() => { PG.state.editor.sceneIdx = 3; PG.render(); }); await wait(300);
await cmd('Apple 스타일'); await frame(6);
await pg.screenshot({ path: 'shots/round12-apple.png' });

/* ---------- 히어로 (1440×760 크롭) ---------- */
await pg.evaluate(() => { PG.state.editor.sceneIdx = 5; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round12-hero.png', clip: { x: 0, y: 60, width: 1440, height: 760 } });

await br.close();
console.log('frames', g);
