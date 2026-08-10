/* ============================================================
   probe97.mjs — R97 구조별 재료 입구 실브라우저 계측
   ------------------------------------------------------------
   진짜 크롬에서, 진짜 패널 DOM에 타이핑해서:
   ① 카드뉴스 선택 → items 텍스트영역·추가 필드가 뜨는가
   ② 3줄 타이핑 + 강조 입력 → 사진 0장 빌드 → 워크스페이스
      장면에 그 문장들이 실려 있는가 (번호 카드 3장)
   ③ 같은 사진 3장으로 슬라이드쇼를 빌드하면 장면 구성이 다른가
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

/* ① 카드뉴스 카드 클릭 → 패널 */
await pg.click('[data-vh-comp="cx-cardnews"]');
await wait(300);
const panel = await pg.evaluate(() => ({
  items: !!document.querySelector('#vhItems'),
  extras: [...document.querySelectorAll('[data-vh-extra]')].map((n) => n.dataset.vhExtra),
}));

/* ② 진짜 타이핑 — 패널 배선 자체를 검증 */
await pg.type('#vhItems', '급식 메뉴가 바뀌어요\n체육복 등교는 수요일\n도서관은 4시까지');
await pg.type('[data-vh-extra="emphasis"]', '이번 주만이에요');
await pg.type('#vhTitle', '주간 알림');
const b1 = await pg.evaluate(() => window.MK_VIDHUB.startBuild([]));
await wait(400);
const ws1 = await pg.evaluate(() => {
  /* 장면 1은 표지 — 카드 장면으로 넘겨서 읽는다 */
  const nx = document.querySelector('[data-ws="next"]'); if (nx) nx.click();
  const texts = [...document.querySelectorAll('.ws-el.text')].map((n) => n.textContent);
  return { texts: texts.join(' § ') };
});
const doc1 = { count: b1.ok ? b1.doc.scenes.length : 0,
  joined: b1.ok ? b1.doc.scenes.map((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|')).join(' § ') : '' };

/* ③ 슬라이드쇼 대조 빌드 */
await pg.evaluate(() => { location.hash = '#/video'; });
await wait(300);
const PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const b2 = await pg.evaluate((px) => {
  const H = window.MK_VIDHUB;
  H.select('cx-cardnews'); /* 해제 */
  H.select('cx-slideshow');
  H.st.title = '주간 알림';
  return H.startBuild([1, 2, 3].map((n) => ({ name: 'p' + n, kind: 'image', src: px })));
}, PX);
const doc2 = { count: b2.ok ? b2.doc.scenes.length : 0,
  joined: b2.ok ? b2.doc.scenes.map((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|')).join(' § ') : '' };

const cardTextsLanded = /급식 메뉴가 바뀌어요/.test(doc1.joined) && /도서관은 4시까지/.test(doc1.joined) && /이번 주만이에요/.test(doc1.joined);
const wsShows = /급식 메뉴가 바뀌어요/.test(ws1.texts);
const distinct = doc1.joined !== doc2.joined && !/급식 메뉴/.test(doc2.joined);

console.log(JSON.stringify({ panel, build1: b1.ok, scenes1: doc1.count, cardTextsLanded, wsShows,
  build2: b2.ok, scenes2: doc2.count, distinct, errs }, null, 2));
await br.close();
process.exit(panel.items && panel.extras.includes('emphasis') && b1.ok && cardTextsLanded && wsShows
  && b2.ok && distinct && !errs.length ? 0 : 1);
