/* ============================================================
   probe96.mjs — R96 centered-overflow 해제 실브라우저 계측
   ------------------------------------------------------------
   1280px 뷰포트(캔버스가 래퍼를 넘치는 그 조건)에서:
   ① scrollLeft=0일 때 canvas.left ≥ wrap.left (시작쪽 조각이
      스크롤 원점 앞으로 사라지지 않음 — R95 계측의 위반 사항)
   ② scrollWidth가 캔버스 전 폭을 담아 좌우 끝 모두 스크롤 도달
   ③ 스크롤로 끌어온 왼쪽 모서리에서 손가락 리사이즈 실작동
   ④ 넓은 공간(줌아웃)에선 종전과 같은 가운데 정렬 유지
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
await pg.setViewport({ width: 1280, height: 800, hasTouch: true });
const cdp = await pg.createCDPSession();
await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(400);
const PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
await pg.evaluate((px) => {
  const H = window.MK_VIDHUB;
  window.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = 'r96'; H.st.sub = '';
  H.startBuild([1, 2, 3].map((n) => ({ name: 'p' + n, kind: 'image', src: px })));
}, PX);
await wait(400);
await pg.evaluate(() => {
  for (let g = 0; g < 8 && !document.querySelector('.ws-el.media[data-ws-el]'); g++)
    document.querySelector('[data-ws="next"]').click();
});
await wait(200);

/* ①② 기하 — 넘침 상태에서 원점·스크롤 범위 */
const geo = await pg.evaluate(() => {
  const wrap = document.querySelector('.ws-canvaswrap');
  wrap.scrollLeft = 0;
  const c = document.querySelector('.ws-canvas').getBoundingClientRect();
  const wr = wrap.getBoundingClientRect();
  return {
    overflowing: wrap.scrollWidth > wrap.clientWidth,
    canvasL: Math.round(c.left), wrapL: Math.round(wr.left),
    startReachable: c.left >= wr.left - 0.5,
    scrollSpan: wrap.scrollWidth, canvasW: Math.round(c.width),
    coversCanvas: wrap.scrollWidth >= c.width,
  };
});

/* ③ 왼쪽 모서리를 스크롤로 끌어와 손가락 리사이즈 */
await pg.evaluate(() => { document.querySelector('.ws-canvaswrap').scrollLeft = 0; });
const c0 = await pg.evaluate(() => {
  const n = document.querySelector('.ws-el.media[data-ws-el]');
  const r = n.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await pg.touchscreen.tap(c0.x, c0.y);
await wait(250);
const st1 = await pg.evaluate(() => {
  const sel = document.querySelector('.ws-el.media.sel');
  const r = sel.getBoundingClientRect();
  const wr = document.querySelector('.ws-canvaswrap').getBoundingClientRect();
  return { l: r.left, btm: r.bottom, w: r.width, h: r.height, wrapL: wr.left, wrapR: wr.right };
});
/* bl 모서리 12px 안쪽 — 래퍼 가시영역 안임을 함께 확인 */
const sx = st1.l + 12, sy = st1.btm - 12;
const inView = sx > st1.wrapL && sx < st1.wrapR;
await pg.touchscreen.touchStart(sx, sy); await wait(60);
await pg.touchscreen.touchMove(sx - 40, sy + 30); await wait(60);
await pg.touchscreen.touchEnd(); await wait(250);
const st2 = await pg.evaluate(() => {
  const sel = document.querySelector('.ws-el.media.sel') || document.querySelector('.ws-el.media[data-ws-el]');
  const r = sel.getBoundingClientRect();
  return { w: r.width, h: r.height };
});
const grew = st2.w - st1.w;
const drift = Math.abs(st2.w / st2.h - st1.w / st1.h) / (st1.w / st1.h);

/* ④ 공간이 남을 땐 가운데 정렬 유지 — 줌아웃 2회 */
await pg.evaluate(() => { document.querySelector('[data-ws="zout"]').click(); document.querySelector('[data-ws="zout"]').click(); });
await wait(250);
const centered = await pg.evaluate(() => {
  const wrap = document.querySelector('.ws-canvaswrap');
  const c = document.querySelector('.ws-canvas').getBoundingClientRect();
  const wr = wrap.getBoundingClientRect();
  const lGap = c.left - wr.left, rGap = wr.right - c.right;
  return { fits: wrap.scrollWidth <= wrap.clientWidth + 1, lGap: Math.round(lGap), rGap: Math.round(rGap), symmetric: Math.abs(lGap - rGap) < 3 };
});

console.log(JSON.stringify({ geo, cornerInView: inView, grew: +grew.toFixed(1), ratioDrift: +drift.toFixed(4), centered, errs }, null, 2));
await br.close();
process.exit(geo.overflowing && geo.startReachable && geo.coversCanvas && inView && grew > 20 && drift < 0.02
  && centered.fits && centered.symmetric && !errs.length ? 0 : 1);
