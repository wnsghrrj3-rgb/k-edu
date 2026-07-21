import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f31'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const tab = (k) => click(`[data-hx-tab="${k}"]`);

/* 0. 실 Home v2 — 데스크톱 + 실측 계층 판정 */
await pg.goto(base + '#/home', { waitUntil: 'networkidle0' }); await wait(1200);
await pg.evaluate(() => window.PG && window.PG.go('home')); await wait(700);
await pg.screenshot({ path: 'shots/round31-home-desktop.png' }); await frame(4);
const judge = await pg.evaluate(() => {
  const area = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width * r.height; };
  const hero = area(document.querySelector('.h2-hero'));
  const chips = area(document.querySelector('.h2-chips'));
  const rec = area(document.querySelector('.h2-continue-wrap') || document.querySelector('[aria-labelledby="h2RecentT"]') || document.querySelector('.h2-empty'));
  const body = document.querySelector('#pgBody') || document.body;
  const vp = body.clientWidth * innerHeight;                     /* 첫 화면 = 콘텐츠 영역 1뷰포트 */
  return { m: { viewport: vp, hero, quickstart: chips, recent: rec }, out: window.MK_HOMEX.hierarchyJudge({ viewport: vp, hero, quickstart: chips, recent: rec }) };
});
console.log('실측 계층 판정:', JSON.stringify(judge.out), 'hero', Math.round(judge.m.hero), 'qs', Math.round(judge.m.quickstart), 'recent', Math.round(judge.m.recent));
if (!judge.out.ok) { console.log('✗ 실측 계층 판정 실패'); process.exit(1); }

/* 모바일 Home (480) */
await pg.setViewport({ width: 420, height: 860, deviceScaleFactor: 2 });
await pg.evaluate(() => window.PG.render()); await wait(600);
await pg.screenshot({ path: 'shots/round31-home-mobile.png' }); await frame(3);
/* 태블릿 Home (1024) */
await pg.setViewport({ width: 1000, height: 800, deviceScaleFactor: 2 });
await pg.evaluate(() => window.PG.render()); await wait(500);
await pg.screenshot({ path: 'shots/round31-home-tablet.png' }); await frame(3);
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

/* 1. #/homex 개요 + 실화면 9감사 재실행 */
await pg.evaluate(() => window.PG.go('homex')); await wait(700);
await pg.screenshot({ path: 'shots/round31-over.png' }); await frame(4);
await click('[data-hx-real]'); await frame(3);
await pg.screenshot({ path: 'shots/round31-real-pass.png' });

/* 2. 질문 — 2개 스펙 거부 */
await tab('q'); await frame(3);
await click('[data-hx-badq]'); await frame(3);
await pg.screenshot({ path: 'shots/round31-question-reject.png' });

/* 3. Quick Start — 7개 거부 */
await tab('qs'); await frame(3);
await pg.screenshot({ path: 'shots/round31-quickstart.png' });
await click('[data-hx-qs7]'); await frame(3);
await pg.screenshot({ path: 'shots/round31-qs7-reject.png' });

/* 4. 시선 — 역전 거부 + 실측 주입 3연 */
await tab('flow'); await frame(3);
await click('[data-hx-rev]'); await frame(2);
await pg.screenshot({ path: 'shots/round31-flow-reject.png' });
await click('[data-hx-meas]'); await frame(2);
await click('[data-hx-measbad]'); await frame(2);
await click('[data-hx-measno]'); await frame(2);
await pg.screenshot({ path: 'shots/round31-hierarchy.png' });

/* 5. 제거 — 배너 불량 홈 거부 */
await tab('rm'); await frame(3);
await click('[data-hx-ban]'); await frame(3);
await pg.screenshot({ path: 'shots/round31-removal-reject.png' });

/* 6. 반응형 — bp 전환 */
await tab('rs'); await frame(2);
await click('[data-hx-bp="mobile"]'); await frame(3);
await pg.screenshot({ path: 'shots/round31-responsive.png' });

/* 7. 지표 — record 실연 + 미지 거부 */
await tab('mt'); await frame(2);
await click('[data-hx-rec]'); await frame(2);
await click('[data-hx-recbad]'); await frame(2);
await pg.screenshot({ path: 'shots/round31-metrics.png' });

/* 8. 산출물 */
await tab('out'); await frame(3);
await pg.screenshot({ path: 'shots/round31-out.png' });

await br.close();

const { execSync } = await import('child_process');
try { execSync(`ffmpeg -y -framerate 5 -i ${F}/%03d.png -vf "scale=720:-1" shots/round31-homex.gif`, { stdio: 'ignore' }); } catch (e) { console.log('gif skip'); }
console.log('shots done, frames', g);
