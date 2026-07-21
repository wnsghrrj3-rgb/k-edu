import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f26'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(380); };
const setv = (sel, v) => pg.evaluate((s, val) => { const i = document.querySelector(s); if (i) i.value = val; }, sel, v);
const tab = (k) => click(`[data-ops-tab="${k}"]`);

await pg.goto(base + '#/ops', { waitUntil: 'networkidle0' }); await wait(1100);
await pg.evaluate(() => window.PG && window.PG.go && window.PG.go('ops')); await wait(600);

/* 1. 개요 — 근거 없는 결정 거부 실연 */
await pg.screenshot({ path: 'shots/round26-over.png' }); await frame(4);
await setv('[data-ops-dt]', '홈 배너 교체'); await setv('[data-ops-de]', '');
await pg.evaluate(() => { const s = document.querySelector('[data-ops-db]'); if (s) s.value = '감(느낌)'; });
await click('[data-ops-decide]'); await frame(3);
await pg.screenshot({ path: 'shots/round26-decide-reject.png' });
await setv('[data-ops-dt]', '홈 배너 교체'); await setv('[data-ops-de]', '이탈률 실측 12%p');
await pg.evaluate(() => { const s = document.querySelector('[data-ops-db]'); if (s) s.value = 'data'; });
await click('[data-ops-decide]'); await frame(3);

/* 2. 라이프사이클 — 리뷰 게이트 실연 */
await tab('cycle'); await frame(3);
await pg.screenshot({ path: 'shots/round26-cycle.png' });
await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-ops-fdev]')].pop(); b && b.click(); }); await wait(380); await frame(3);

/* 3. 지표·대시보드 */
await tab('metric'); await frame(3);
await pg.screenshot({ path: 'shots/round26-metric.png' });
await click('[data-ops-mbr]'); await frame(3);

/* 4. 리뷰·게이트 — 6게이트 + 위반 시안 검출 */
await tab('review'); await frame(4);
await pg.screenshot({ path: 'shots/round26-gates.png' });

/* 5. 릴리즈·실험 — P1 차단 → 표본 판정 → 롤백 */
await tab('ship'); await frame(3);
await pg.screenshot({ path: 'shots/round26-ship.png' });
await click('[data-ops-radv]'); await frame(3);
await click('[data-ops-esim]'); await frame(3);
await pg.screenshot({ path: 'shots/round26-exp.png' });
await click('[data-ops-f25]'); await frame(2);
await click('[data-ops-f100]'); await frame(2);
await click('[data-ops-frb]'); await frame(3);

/* 6. 인시던트 — P1 발생 → 포스트모템 없는 close 거부 → 첨부 종결 */
await tab('inc'); await frame(3);
await click('[data-ops-ip1]'); await frame(3);
await pg.screenshot({ path: 'shots/round26-p1.png' });
await click('[data-ops-iclose]'); await frame(3);
await pg.screenshot({ path: 'shots/round26-pm-reject.png' });
await click('[data-ops-ipm]'); await frame(3);

/* 7. 피드백·CS */
await tab('voice'); await frame(3);
await pg.screenshot({ path: 'shots/round26-voice.png' });
await pg.evaluate(() => { const b = document.querySelector('[data-ops-ftr]'); b && b.click(); }); await wait(380); await frame(2);

/* 8. 거버넌스 — 루프 순서 강제 실연 */
await tab('gov'); await frame(3);
await click('[data-ops-l1]'); await frame(2);
await click('[data-ops-l2]'); await frame(3);
await pg.screenshot({ path: 'shots/round26-loop-reject.png' });
await click('[data-ops-l3]'); await frame(3);
await pg.screenshot({ path: 'shots/round26-gov.png' });

await br.close();

/* GIF */
import { execSync } from 'child_process';
try {
  execSync(`ffmpeg -y -framerate 6 -i ${F}/%03d.png -vf "scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" shots/round26-ops.gif`, { stdio: 'pipe' });
  console.log('gif ok, frames', g);
} catch (e) { console.log('gif fail', e.message.slice(0, 200)); }
