import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8902/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f13'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };

/* ---------- 1. Brand Workspace — 개요 ---------- */
await pg.goto(base + '#/brand', { waitUntil: 'networkidle0' }); await wait(900);
await pg.screenshot({ path: 'shots/round13-workspace.png' });
await frame(6);

/* ---------- 2. 컬러 탭 — 램프 50~900 ---------- */
await pg.evaluate(() => { PG.state.brand.tab = 'color'; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round13-colors.png' });
await frame(4);

/* ---------- 3. 브랜드 전환 목록 훑기 (학교) ---------- */
await pg.evaluate(() => { PG.state.brand.sel = 'br-school'; PG.state.brand.tab = 'overview'; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round13-school.png' });
await frame(4);
await pg.evaluate(() => { PG.state.brand.tab = 'comp'; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round13-components.png' });
await frame(4);
await pg.evaluate(() => { PG.state.brand.sel = 'br-personal'; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round13-personal-comp.png' });
await frame(4);

/* ---------- 4. 차트·공유 탭 ---------- */
await pg.evaluate(() => { PG.state.brand.sel = 'br-signal'; PG.state.brand.tab = 'chart'; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round13-chart-tokens.png' });
await frame(3);
await pg.evaluate(() => { PG.state.brand.tab = 'share'; PG.render(); }); await wait(400);
await pg.screenshot({ path: 'shots/round13-share.png' });
await frame(3);

/* ---------- 5. Editor — 피치덱 열고 브랜드 3연속 전환 ---------- */
await pg.evaluate(() => { PG.loadEditorDoc('pitch-deck-01'); PG.state.editor.menu = 'ai'; PG.go('editor'); }); await wait(700);
await pg.screenshot({ path: 'shots/round13-editor-before.png' });
await frame(5);
const cmd = async (c) => { await pg.evaluate((x) => { const i = document.querySelector('[data-ed="ai-in"]'); i.value = x; document.querySelector('[data-ed="ai-run"]').click(); }, c); await wait(500); };
await cmd('학교 스타일로'); await frame(6);
await pg.screenshot({ path: 'shots/round13-apply-school.png' });
await cmd('개인 브랜드로'); await frame(6);
await pg.screenshot({ path: 'shots/round13-apply-personal.png' });
await cmd('우리 회사 스타일로'); await frame(6);
await pg.screenshot({ path: 'shots/round13-apply-kmaker.png' });

/* ---------- 6. 차트 씬 — 브랜드 다색 시리즈 확인 ---------- */
await pg.evaluate(() => { PG.state.editor.sceneIdx = 5; PG.state.editor.selEl = null; PG.render(); }); await wait(400);
await cmd('원형 그래프 추가'); await frame(4);
await pg.screenshot({ path: 'shots/round13-brand-chart.png' });

/* ---------- 7. 위반 주입 → 검사 → 규칙 유지 (자동 교정) ---------- */
await pg.evaluate(() => {
  const d = PG.state.editor.doc;
  d.scenes[PG.state.editor.sceneIdx].elements.push({ kind: 'text', x: 6, y: 6, w: 50, size: 4.5, weight: 700, text: '규칙 밖 색상 텍스트', color: '#FF00AA' });
  PG.render();
}); await wait(400); await frame(4);
await cmd('브랜드 검사'); await frame(5);
await pg.screenshot({ path: 'shots/round13-validate.png' });
await cmd('브랜드 규칙 유지'); await frame(6);
await pg.screenshot({ path: 'shots/round13-fix.png' });

/* ---------- 8. Undo 되감기 ---------- */
await pg.evaluate(() => { MK_HIST.undo(); PG.render(); }); await wait(350); await frame(3);
await pg.evaluate(() => { MK_HIST.undo(); PG.render(); }); await wait(350); await frame(3);

/* ---------- 9. Create Step4 — 템플릿 + 브랜드 선택 ---------- */
await pg.evaluate(() => { PG.state.create = { step: 4, type: 'presentation', style: 'Premium', tpl: 'tpl-pr-presentation-01', brand: 'br-school' }; PG.go('create'); }); await wait(600);
await pg.screenshot({ path: 'shots/round13-create-brand.png' });
await frame(5);

/* ---------- 히어로 ---------- */
await pg.evaluate(() => { PG.state.brand = { sel: 'br-kmaker', tab: 'overview' }; PG.go('brand'); }); await wait(600);
await pg.screenshot({ path: 'shots/round13-hero.png' });
await frame(4);

await br.close();
console.log('frames:', g);
