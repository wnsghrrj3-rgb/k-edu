/* ============================================================
   probe94.mjs — R94 초점 실브라우저 계측
   ------------------------------------------------------------
   jsdom은 문자열 계약까지만 본다. 여기서는 진짜 크롬이
   ① 워크스페이스: 피커 클릭 전후 ws-media의 computed
      object-position (50% 50% → 0% 0%)
   ② 재생: 같은 문서를 열었을 때 mkp-img img의 computed
      object-position이 초점을 따라오는지
   를 잰다. 사전: http://127.0.0.1:8913 = k-edu 루트 정적 서버.
   실행: node probe94.mjs
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
await pg.setViewport({ width: 1280, height: 800 });
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(400);

/* 1×1 PNG 사진 3장으로 슬라이드쇼 빌드 → 워크스페이스 */
const PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const r1 = await pg.evaluate((px) => {
  const H = window.MK_VIDHUB;
  window.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '초점'; H.st.sub = '';
  const r = H.startBuild([1, 2, 3].map((n) => ({ name: 'p' + n, kind: 'image', src: px })));
  return { ok: r.ok, hash: location.hash };
}, PX);
await wait(400);

/* 미디어 장면으로 이동해 선택 */
const sel = await pg.evaluate(() => {
  for (let g = 0; g < 8 && !document.querySelector('.ws-el.media[data-ws-el]'); g++) {
    const nx = document.querySelector('[data-ws="next"]'); if (!nx) return 'no-next'; nx.click();
  }
  const el = document.querySelector('.ws-el.media[data-ws-el]');
  if (!el) return 'no-media';
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  return 'ok';
});
await wait(200);

const measure = () => pg.evaluate(() => {
  const m = document.querySelector('.ws-el.media .ws-media');
  return m ? getComputedStyle(m).objectPosition : null;
});
const before = await measure();
const btns = await pg.evaluate(() => document.querySelectorAll('[data-ws-focal]').length);
await pg.evaluate(() => { const b = document.querySelector('[data-ws-focal="0,0"]'); if (b) b.click(); });
await wait(200);
const after = await measure();

/* 재생에서 같은 초점 확인 */
const play = await pg.evaluate(() => {
  const d = window.MK_WS && window.MK_WS.currentDoc ? window.MK_WS.currentDoc() : null;
  /* currentDoc 미노출 세계 대비 — sceneHTML을 직접 잰다 */
  const sc = { duration: 3, background: '#fff', elements: [{ kind: 'image', src: document.querySelector('.ws-media').src, x: 0, y: 0, w: 100, h: 100, focal: { x: 0, y: 0 } }] };
  const host = document.createElement('div');
  host.innerHTML = window.MK_PLAY.sceneHTML(sc, { still: true });
  document.body.appendChild(host);
  const v = getComputedStyle(host.querySelector('.mkp-img img')).objectPosition;
  host.remove();
  return v;
});

console.log(JSON.stringify({ build: r1, sel, picker: btns, before, after, play, errs }, null, 2));
await br.close();
process.exit(before === '50% 50%' && after === '0% 0%' && play === '0% 0%' && btns === 9 && !errs.length ? 0 : 1);
