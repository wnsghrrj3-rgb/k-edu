import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f13'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };

const tab = async (k) => { await pg.evaluate((x) => document.querySelector(`[data-bd="tab"][data-k="${x}"]`).click(), k); await wait(320); };
const click = async (sel) => { await pg.evaluate((s) => { const e = document.querySelector(s); if (e) e.click(); }, sel); await wait(340); };

await pg.goto(base + '#/brand', { waitUntil: 'networkidle0' }); await wait(900);

/* 1. Workspace 첫 화면 */
await pg.screenshot({ path: 'shots/round13-workspace.png' }); await frame(4);

/* 2. Color — Token 램프 */
await tab('color'); await pg.screenshot({ path: 'shots/round13-color.png' }); await frame(4);

/* 3. Typography */
await tab('type'); await pg.screenshot({ path: 'shots/round13-typography.png' }); await frame(3);

/* 4. Logo */
await tab('logo'); await pg.screenshot({ path: 'shots/round13-logo.png' }); await frame(3);

/* 5. Component + 부품 프리뷰 */
await tab('comp'); await click('[data-bd="pv"][data-k="comp"]');
await pg.screenshot({ path: 'shots/round13-component.png' }); await frame(4);
await click('[data-bd="pv"][data-k="scene"]');

/* 6. Template Mapping */
await tab('tpl'); await pg.screenshot({ path: 'shots/round13-mapping.png' }); await frame(3);

/* 7. 브랜드 전환 — School → 프리뷰 전체 전환 (핵심 증거) */
await pg.evaluate(() => document.querySelectorAll('.bd-item')[3].click()); await wait(500);
await tab('color'); await pg.screenshot({ path: 'shots/round13-brand-school.png' }); await frame(5);
await pg.evaluate(() => document.querySelectorAll('.bd-item')[2].click()); await wait(500);
await pg.screenshot({ path: 'shots/round13-brand-noir.png' }); await frame(5);
const prev = await pg.$('.bd-prev'); await prev.screenshot({ path: 'shots/round13-preview-panel.png' });

/* 8. 실프로젝트 적용 — 에디터에서 before / after */
await pg.evaluate(() => { PG.state.editor.doc = null; PG.openEditor('tpl-pr-presentation-01'); });
await wait(700); await pg.screenshot({ path: 'shots/round13-editor-before.png' }); await frame(4);
await pg.evaluate(() => { window.MK_BRAND.apply(PG.state.editor.doc, 'bd-school'); PG.render(); });
await wait(600); await pg.screenshot({ path: 'shots/round13-editor-after.png' }); await frame(6);
await pg.evaluate(() => { window.MK_BRAND.apply(PG.state.editor.doc, 'bd-companyb'); PG.render(); });
await wait(600); await pg.screenshot({ path: 'shots/round13-editor-noir.png' }); await frame(6);

/* 9. AI — "학교 스타일로" */
await pg.evaluate(() => { PG.state.editor.menu = 'ai'; PG.render(); }); await wait(400);
await pg.evaluate(() => { const i = document.querySelector('[data-ed="ai-in"]'); i.value = '학교 스타일로'; document.querySelector('[data-ed="ai-run"]').click(); });
await wait(700); await pg.screenshot({ path: 'shots/round13-ai-brand.png' }); await frame(6);

/* 10. Validation */
await pg.evaluate(() => { PG.state.editor.doc.scenes[1].elements[0].color = '#FF00AA'; PG.state.editor.doc.fontFamily = 'Comic Sans MS'; PG.go('brand'); });
await wait(600); await tab('valid');
await pg.screenshot({ path: 'shots/round13-validate.png' }); await frame(5);
await click('[data-bd="fix"]'); await wait(400);
await pg.screenshot({ path: 'shots/round13-validate-fixed.png' }); await frame(4);

/* 11. Export */
await tab('share'); await pg.screenshot({ path: 'shots/round13-export.png' }); await frame(3);

await br.close();
console.log('shots done:', g, 'frames');
