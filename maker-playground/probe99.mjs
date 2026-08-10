/* ============================================================
   probe99.mjs — R99 호버 미리보기 실브라우저 계측
   ------------------------------------------------------------
   헤드리스 셸 기본 = hover:none(터치 세계) — 게이트 덕에 팝오버가
   안 뜨는 게 「정답」이다. 그래서 두 세계를 다 잰다:
   ① 터치 세계(기본): hover를 흉내 내도 팝오버 0 (게이트 실증)
   ② hover 세계(CDP setEmulatedMedia hover:hover): 카드 호버 →
      팝오버 + mkp-scene + 장식 fill ≥1 + 점 표시 · 1.1초 후 장면
      순환 · 마우스 이탈 → 소멸 · 화면 안 배치 · 에러 0
   사전: http://127.0.0.1:8913 = k-edu 루트 정적 서버.
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const BASE = 'http://127.0.0.1:8913/maker-playground/index.html#/video';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args, headless: 'shell', protocolTimeout: 300000,
});

/* ── ① 터치 세계 (기본 hover:none) ── */
const pgT = await br.newPage();
await pgT.setViewport({ width: 1440, height: 900 });
await pgT.goto(BASE, { waitUntil: 'networkidle0' });
await wait(300);
const touchWorld = await pgT.evaluate(() => ({ hoverFeat: matchMedia('(hover: hover)').matches }));
const cardT = await pgT.$('[data-vh-comp="cx-cardnews"]');
await cardT.hover();
await wait(400);
const touchPop = await pgT.evaluate(() => !!document.querySelector('.vh-pv'));
await pgT.close();

/* ── ② hover 세계 (CDP 에뮬레이션) ── */
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900 });
/* 헤드리스 셸은 hover 피처 CDP 에뮬을 안 받는다 — 문서 로드 전
   matchMedia를 감싸 (hover: hover)만 참으로 강제 (게이트가 읽는 그 값) */
await pg.evaluateOnNewDocument(() => {
  const orig = window.matchMedia.bind(window);
  window.matchMedia = (q) => (/hover:\s*hover/.test(q)
    ? { matches: true, media: q, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }
    : orig(q));
});
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await pg.goto(BASE, { waitUntil: 'networkidle0' });
await wait(300);
const hoverFeat = await pg.evaluate(() => matchMedia('(hover: hover)').matches);
const card = await pg.$('[data-vh-comp="cx-cardnews"]');
await card.hover();
await wait(450);
const st1 = await pg.evaluate(() => {
  const pop = document.querySelector('.vh-pv');
  if (!pop) return null;
  const sc = pop.querySelector('.vh-pv-stage .mkp-scene');
  const els = sc ? [...sc.querySelectorAll('.mkp-el')] : [];
  const r = pop.getBoundingClientRect();
  return {
    scene: !!sc,
    textHit: els.some((n) => /카드뉴스/.test(n.textContent)),
    decorFills: els.filter((n) => /background:(rgba|#)/.test(n.getAttribute('style') || '')).length,
    dots: pop.querySelectorAll('.vh-pv-dots i').length,
    onScreen: r.left >= 0 && r.top >= 0 && r.right <= innerWidth,
    snap: document.querySelector('.vh-pv-stage').innerHTML.length,
  };
});
await wait(1200); /* 순환 1틱 */
const st2 = await pg.evaluate((prev) => {
  const stg = document.querySelector('.vh-pv-stage');
  return { cycled: stg ? stg.innerHTML.length !== prev : false,
    dotOn: document.querySelectorAll('.vh-pv-dots i.on').length };
}, st1 ? st1.snap : 0);
await pg.mouse.move(10, 10);
await wait(150);
const gone = await pg.evaluate(() => !document.querySelector('.vh-pv'));

console.log(JSON.stringify({ touchWorld, touchPop, hoverFeat, st1, st2, gone, errs }, null, 2));
await br.close();
process.exit(!touchWorld.hoverFeat && touchPop === false && hoverFeat
  && st1 && st1.scene && st1.textHit && st1.decorFills >= 1 && st1.dots >= 2 && st1.onScreen
  && st2.cycled && st2.dotOn === 1 && gone && !errs.length ? 0 : 1);
