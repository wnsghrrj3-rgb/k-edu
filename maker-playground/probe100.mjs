/* ============================================================
   probe100.mjs — R100 팔레트 확장 실브라우저 계측
   ------------------------------------------------------------
   ① 테마 칩 8종 + 전부 색점(스와치), 바다 점 = #2D6FB3 실측
   ② 바다 테마 카드뉴스 빌드 → 워크스페이스 표지 배경 실색상
   ③ 로즈 테마 랭킹 호버 미리보기 → 로즈 dark 실색상 (테마 키 캐시)
   사전: http://127.0.0.1:8913 = k-edu 루트 정적 서버.
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const br = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: 'shell', protocolTimeout: 300000 });
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900 });
await pg.evaluateOnNewDocument(() => {
  const orig = window.matchMedia.bind(window);
  window.matchMedia = (q) => (/hover:\s*hover/.test(q)
    ? { matches: true, media: q, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} } : orig(q));
});
const errs = []; pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await pg.goto('http://127.0.0.1:8913/maker-playground/index.html#/video', { waitUntil: 'networkidle0' });
await wait(400);
await pg.click('[data-vh-comp="cx-cardnews"]');
await wait(250);
const chips = await pg.evaluate(() => {
  const cs = [...document.querySelectorAll('[data-vh-theme]')];
  return { n: cs.length, dots: cs.filter((c) => c.querySelector('i')).length,
    oceanDot: (() => { const o = cs.find((c) => c.dataset.vhTheme === 'th-ocean'); const i = o && o.querySelector('i'); return i ? getComputedStyle(i).backgroundColor : null; })() };
});
await pg.evaluate(() => { [...document.querySelectorAll('[data-vh-theme]')].find((c) => c.dataset.vhTheme === 'th-ocean').click(); });
await wait(200);
await pg.type('#vhItems', '한 장\n두 장');
await pg.type('#vhTitle', '바다색');
await pg.evaluate(() => window.MK_VIDHUB.startBuild([]));
await wait(400);
const canvasBg = await pg.evaluate(() => getComputedStyle(document.querySelector('.ws-canvas')).backgroundColor);
await pg.evaluate(() => { location.hash = '#/video'; });
await wait(300);
await pg.evaluate(() => { window.MK_VIDHUB.st.theme = 'th-rose'; window.MK_PREVIEW.clear(); });
const card = await pg.$('[data-vh-comp="cx-ranking"]');
await card.hover();
await wait(450);
const pvBg = await pg.evaluate(() => { const sc = document.querySelector('.vh-pv-stage .mkp-scene'); return sc ? getComputedStyle(sc).backgroundColor : null; });
console.log(JSON.stringify({ chips, canvasBg, pvBg, errs }, null, 2));
await br.close();
process.exit(chips.n >= 8 && chips.dots === chips.n && chips.oceanDot === 'rgb(45, 111, 179)'
  && canvasBg === 'rgb(45, 111, 179)' && pvBg === 'rgb(49, 30, 35)' && !errs.length ? 0 : 1);
