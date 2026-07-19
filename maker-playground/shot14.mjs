import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell' });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://localhost:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'shots/_f14'; fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
let g = 0;
const frame = async (n = 1) => { for (let i = 0; i < n; i++) await pg.screenshot({ path: `${F}/${String(++g).padStart(3, '0')}.png` }); };
const tab = async (k) => { await pg.evaluate((x) => [...document.querySelectorAll('[data-tm^="tab:"]')].find((b) => b.dataset.tm === 'tab:' + x)?.click(), k); await wait(340); };
const click = async (sel) => { await pg.evaluate((s) => document.querySelector(s)?.click(), sel); await wait(360); };

await pg.goto(base + '#/team', { waitUntil: 'networkidle0' }); await wait(1000);

/* 1. Dashboard */
await pg.screenshot({ path: 'shots/round14-dashboard.png' }); await frame(4);

/* 2. Members + Permission Matrix */
await tab('members'); await pg.screenshot({ path: 'shots/round14-members.png' }); await frame(3);
await pg.evaluate(() => document.querySelector('.tm-permwrap')?.scrollIntoView()); await wait(250);
await pg.screenshot({ path: 'shots/round14-permission-matrix.png' }); await frame(3);

/* 3. Invite — 이메일 초대(도메인 승인) 실발송 */
await tab('invites');
await pg.evaluate(() => { document.querySelector('#tmIvMail').value = 'designer@keduclass.com'; document.querySelector('#tmIvMode').value = 'domain'; });
await click('[data-tm="ivmail"]');
await pg.screenshot({ path: 'shots/round14-invite.png' }); await frame(4);

/* 4. Comments — 멘션 댓글 작성 + Resolve */
await tab('comments');
await pg.evaluate(() => { document.querySelector('#tmCmText').value = '@김철수 2번 씬 대비 확인 부탁!'; });
await click('[data-tm="cmnew"]');
await pg.screenshot({ path: 'shots/round14-comments.png' }); await frame(4);

/* 5. Review — 시작 → Request Changes */
await tab('review'); await click('[data-tm="rvon"]'); await frame(3);
await click('[data-tm="rv:changes"]');
await pg.screenshot({ path: 'shots/round14-review.png' }); await frame(4);
await click('[data-tm="rv:approve"]'); await click('[data-tm="rvoff"]');

/* 6. Versions — 저장 2회 → doc 변형 → Diff */
await tab('versions');
await pg.evaluate(() => { document.querySelector('#tmVerName').value = '검수 전 최종'; });
await click('[data-tm="vsave"]');
await pg.evaluate(() => {
  const p = window.MK_PROJ.list('recent')[0];
  const t = p.doc.scenes[0].elements.find((e) => e.kind === 'text'); if (t) t.text = '물의 대모험';
  window.MK_TEAM.snapshot('mb-kim', p.projectId, p.doc, 'Kim 수정', false);
  window.MK_SCREENS.team._st.tab = 'versions';
});
await tab('versions');
await pg.evaluate(() => [...document.querySelectorAll('[data-tm^="vdiff:"]')].pop()?.click()); await wait(360);
await pg.screenshot({ path: 'shots/round14-versions-diff.png' }); await frame(4);

/* 7. Activity + Audit */
await tab('activity'); await pg.screenshot({ path: 'shots/round14-activity.png' }); await frame(3);
await tab('audit'); await click('[data-tm="auex"]');
await pg.screenshot({ path: 'shots/round14-audit.png' }); await frame(3);

/* 8. Search */
await tab('search');
await pg.evaluate(() => { document.querySelector('#tmQ').value = '물의'; });
await click('[data-tm="q"]');
await pg.screenshot({ path: 'shots/round14-search.png' }); await frame(3);

/* 9. 역할 체험 — viewer 시점 실거부 */
await tab('review');
await pg.evaluate(() => { const s = document.querySelector('.tm-actor'); s.value = 'mb-choi'; s.dispatchEvent(new Event('change')); }); await wait(340);
await pg.evaluate(() => document.querySelector('[data-tm="rvon"]')?.click()); await wait(340);
await pg.screenshot({ path: 'shots/round14-permission-denied.png' }); await frame(4);
await pg.evaluate(() => { const s = document.querySelector('.tm-actor'); s.value = 'me'; s.dispatchEvent(new Event('change')); });

/* 10. Editor — Presence Bar + Live Cursor (봇 진행) */
await pg.evaluate(() => PG.openEditor('smp-pres-01')); await wait(900);
for (let i = 0; i < 7; i++) { await pg.evaluate(() => { window.MK_COLLAB.step(); window.MK_COLLAB.renderOverlay(); }); await wait(260); await frame(2); }
await pg.screenshot({ path: 'shots/round14-editor-presence.png' });
/* Lock 배지 */
await pg.evaluate(() => {
  const d = PG.state.editor.doc;
  window.MK_COLLAB.lock('mb-lee', { type: 'scene', projectId: window.MK_COLLAB.session().projectId, sceneId: d.scenes[1].id });
  window.MK_COLLAB.renderOverlay();
});
await wait(300); await pg.screenshot({ path: 'shots/round14-editor-lock.png' }); await frame(3);

await br.close();
console.log('shots done, frames:', g);
