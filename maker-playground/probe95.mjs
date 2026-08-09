/* ============================================================
   probe95.mjs — R95 터치 리사이즈 실브라우저 계측
   ------------------------------------------------------------
   터치 에뮬레이션(pointer:coarse + touchscreen)으로:
   ① coarse 세계에서 모서리 핸들 computed 크기 = 14px
   ② 선택된 사진의 br 모서리 「근처」(정밀 명중 아님)를 손가락으로
      끌면 리사이즈가 실작동하고 비율이 유지되는지
   를 잰다. 사전: http://127.0.0.1:8913 = k-edu 루트 정적 서버.
   실행: node probe95.mjs
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
const cdp = await pg.createCDPSession();          /* puppeteer가 'pointer' 피처를 막아 CDP 직행 */
await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }] });
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(400);

const PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
await pg.evaluate((px) => {
  const H = window.MK_VIDHUB;
  window.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '크기'; H.st.sub = '';
  H.startBuild([1, 2, 3].map((n) => ({ name: 'p' + n, kind: 'image', src: px })));
}, PX);
await wait(400);
await pg.evaluate(() => {
  for (let g = 0; g < 8 && !document.querySelector('.ws-el.media[data-ws-el]'); g++)
    document.querySelector('[data-ws="next"]').click();
});
await wait(200);

/* 캔버스를 축소해 모서리를 패널 그늘 밖으로 — 이 뷰포트(1280)에선 좌우
   패널이 캔버스 가장자리를 덮는다(계측 중 발견 — 후속 라운드 후보로 기록) */
await pg.evaluate(() => { const z = document.querySelector('[data-ws="zout"]'); z.click(); z && document.querySelector('[data-ws="zout"]').click(); });
await wait(250);

/* 손가락 탭으로 선택 */
const c0 = await pg.evaluate(() => {
  const n = document.querySelector('.ws-el.media[data-ws-el]');
  const r = n.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await pg.touchscreen.tap(c0.x, c0.y);
await wait(250);

const st1 = await pg.evaluate(() => {
  const sel = document.querySelector('.ws-el.media.sel');
  if (!sel) return null;
  const hd = sel.querySelector('.ws-hd.br');
  const r = sel.getBoundingClientRect();
  return {
    handlePx: hd ? getComputedStyle(hd).width : null,
    rect: { l: r.left, t: r.top, rgt: r.right, btm: r.bottom, w: r.width, h: r.height },
    style: sel.getAttribute('style'),
  };
});

/* bl 모서리에서 12px 안쪽 — 8px 시각 핸들 정밀 명중이 아닌 「근처」 터치.
   (br 쪽은 이 뷰포트에선 컨텍스트 패널이 캔버스 위를 덮어 표적으로 부적합 —
   계측 중 발견, 별도 관찰 기록) */
const sx = st1.rect.l + 12, sy = st1.rect.btm - 12;
await pg.touchscreen.touchStart(sx, sy);
await wait(60);
await pg.touchscreen.touchMove(sx - 40, sy + 30);
await wait(60);
await pg.touchscreen.touchMove(sx - 60, sy + 45);
await wait(60);
await pg.touchscreen.touchEnd();
await wait(250);

const st2 = await pg.evaluate(() => {
  const sel = document.querySelector('.ws-el.media.sel') || document.querySelector('.ws-el.media[data-ws-el]');
  const r = sel.getBoundingClientRect();
  return { rect: { w: r.width, h: r.height }, style: sel.getAttribute('style') };
});

const grewW = st2.rect.w - st1.rect.w, grewH = st2.rect.h - st1.rect.h;
const ratioBefore = st1.rect.w / st1.rect.h, ratioAfter = st2.rect.w / st2.rect.h;
const ratioDrift = Math.abs(ratioAfter - ratioBefore) / ratioBefore;

console.log(JSON.stringify({
  coarseHandle: st1.handlePx, before: st1.rect, after: st2.rect,
  grewW: +grewW.toFixed(1), grewH: +grewH.toFixed(1),
  ratioDrift: +ratioDrift.toFixed(4), errs,
}, null, 2));
await br.close();
process.exit(st1.handlePx === '14px' && grewW > 30 && grewH > 20 && ratioDrift < 0.02 && !errs.length ? 0 : 1);
