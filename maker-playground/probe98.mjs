/* ============================================================
   probe98.mjs — R98 데코 레이어 실브라우저 계측
   ------------------------------------------------------------
   진짜 크롬에서 카드뉴스(볼드)를 빌드해:
   ① 워크스페이스 캔버스에 장식 fill div가 실제로 그려지는가
   ② 장식 원의 computed border-radius = 50% (이중 표기의 CSS 절반)
   ③ z순서 — 장식 div가 텍스트 div보다 DOM 앞(뒤에 깔림)
   ④ 재생(미리보기) 장면 HTML에도 장식이 실리는가
   사전: http://127.0.0.1:8913 = k-edu 루트 정적 서버.
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const BASE = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args, headless: 'shell', protocolTimeout: 300000,
});
const pg = await br.newPage();
pg.setDefaultTimeout(120000);
await pg.setViewport({ width: 1440, height: 900 });
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(400);

await pg.click('[data-vh-comp="cx-cardnews"]');
await wait(250);
/* 볼드 테마 — 원·오프셋 블록이 있는 레시피 */
await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-vh-theme]')].find((x) => x.dataset.vhTheme === 'th-bold'); if (b) b.click(); });
await wait(200);
await pg.type('#vhItems', '급식이 바뀌어요\n체육복은 수요일');
await pg.type('#vhTitle', '주간 알림');
const b1 = await pg.evaluate(() => window.MK_VIDHUB.startBuild([]));
await wait(400);

const ws = await pg.evaluate(() => {
  const nodes = [...document.querySelectorAll('.ws-canvas [data-ws-el]')];
  const fills = nodes.filter((n) => !n.querySelector('.ws-media') && n.classList.contains('media'));
  const circle = fills.map((n) => getComputedStyle(n).borderRadius).find((r) => r === '50%');
  const firstText = nodes.findIndex((n) => n.classList.contains('text'));
  const lastFill = nodes.reduce((m, n, i) => (fills.includes(n) ? i : m), -1);
  return { total: nodes.length, fills: fills.length, circle: circle || null,
    zOrderOk: firstText < 0 || lastFill < firstText };
});

/* 재생 스틸 검사 — 표지 장면 HTML */
const play = await pg.evaluate(() => {
  const H = window.MK_VIDHUB;
  const r = H.startBuild ? null : null;
  const doc = window.MK_PROJ.list('recent')[0];
  return null;
});
const playHtml = await pg.evaluate((ok) => {
  if (!ok) return null;
  return null;
}, false);
/* 재생 경로는 doc 접근 대신 sceneHTML 직접 — 빌드 결과를 다시 만든다 */
const playChk = await pg.evaluate(() => {
  const r = window.MK_COMPOSE.buildProject('cx-cardnews', 'th-bold', {
    medias: [], texts: { title: '주간 알림' }, items: [{ body: '급식이 바뀌어요' }] });
  if (!r.ok) return { ok: false };
  const h = window.MK_PLAY.sceneHTML(r.doc.scenes[0], { still: true });
  return { ok: true, fills: (h.match(/background:rgba|background:#/g) || []).length,
    circle: /border-radius:50%/.test(h) };
});

console.log(JSON.stringify({ build: b1.ok, ws, play: playChk, errs }, null, 2));
await br.close();
process.exit(b1.ok && ws.fills >= 2 && ws.circle === '50%' && ws.zOrderOk
  && playChk.ok && playChk.fills >= 2 && playChk.circle && !errs.length ? 0 : 1);
