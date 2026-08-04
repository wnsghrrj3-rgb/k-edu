/* ============================================================
   perf71.mjs (R71) — 미리보기 실빌드 비용 실브라우저 측정
   ------------------------------------------------------------
   R68 부터 3회 이월된 과제. 추정 금지 — 실제 크롬에서, 실제 폰 사진
   규격(12MP JPEG data URL)으로, 실제 클릭 한 번의 비용을 잰다.

   사전 준비(레포에 커밋하지 않음):
     · http://127.0.0.1:8913 = k-edu 루트 정적 서버
     · /_perf71_photos.json = 12MP JPEG 30장 data URL 묶음
   실행: node perf71.mjs [출력경로]
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const OUT = process.argv[2] || 'report/_perf71.json';
const BASE = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args.concat(['--js-flags=--expose-gc']),
  headless: 'shell',
});
const pg = await br.newPage();
await pg.setViewport({ width: 1440, height: 900 });
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(900);

/* 사진 묶음 1회 로드 — 측정 대상 밖 */
const loaded = await pg.evaluate(async () => {
  const r = await fetch('/_perf71_photos.json');
  window.__P71 = await r.json();
  return { n: window.__P71.length, mb: +(window.__P71.reduce((a, p) => a + p.bytes, 0) / 1048576).toFixed(1) };
});
console.log(`사진 ${loaded.n}장 · 원본 합 ${loaded.mb}MB 로드`);

const med = (a) => { const s = a.slice().sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(1); };

async function measure(n) {
  return await pg.evaluate(async (n) => {
    const H = window.MK_VIDHUB, PG = window.PG;
    const med = (a) => { const s = a.slice().sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(1); };

    /* --- 스테이지 구성: 실제 사진 n 장 + 절반에 문구 --- */
    H.resetStage();
    H.st.comp = 'cx-slideshow';
    H.st.theme = window.MK_COMPOSE.listThemes()[0].id;
    H.st.title = '우리 반 봄 소풍';
    H.stageMedias(window.__P71.slice(0, n).map((p) => ({ name: p.name, kind: p.kind, src: p.src, w: p.w, h: p.h })));
    H.st.captions = H.st.medias.map((m, i) => (i % 2 ? '' : '봄 소풍 ' + (i + 1) + '번째 사진'));

    /* --- 화면 실장착 --- */
    PG.go('video');
    await new Promise((r) => setTimeout(r, 500));
    const root = document.querySelector('#pgBody') || document.body;

    /* --- ⓪-0 업로드 직후 첫 렌더 (축소본이 아직 없는 그 한 번) --- */
    PG.go('video');
    await new Promise((r) => setTimeout(r, 300));
    const t00 = performance.now();
    const h0 = window.MK_SCREENS.video.render();
    const firstRenderMs = +(performance.now() - t00).toFixed(1);
    const firstHtmlKB = Math.round(h0.length / 1024);

    /* --- ⓪ 썸네일 축소(R71 이후에만 존재) --- */
    let thumbMs = null, thumbN = 0;
    if (typeof H.ensureThumbs === 'function') {
      const t = performance.now();
      thumbN = await H.ensureThumbs();
      while (typeof H.thumbsPending === 'function' && H.thumbsPending()) await new Promise((r) => setTimeout(r, 50));
      const left = (H.st.medias || []).filter((m) => !m.thumb).length;
      if (left) thumbN += await H.ensureThumbs();
      thumbMs = +(performance.now() - t).toFixed(1);
      PG.go('video');
      await new Promise((r) => setTimeout(r, 400));
    }
    const flush = () => { if (typeof H.costFlush === 'function') H.costFlush(); };

    /* --- ① 실빌드(미리보기 peek) — 냉(캐시 없음) / 온(같은 입력 재렌더) --- */
    const cold = [], warm = [];
    for (let i = 0; i < 7; i++) { flush(); const t = performance.now(); H.smartPeek(); cold.push(performance.now() - t); }
    for (let i = 0; i < 7; i++) { const t = performance.now(); H.smartPeek(); warm.push(performance.now() - t); }

    /* --- ② render() 전체(문자열 생성) --- */
    const scr = window.MK_SCREENS.video;
    const fullCold = [], fullWarm = [];
    let htmlLen = 0;
    for (let i = 0; i < 5; i++) { flush(); const t = performance.now(); const h = scr.render(); fullCold.push(performance.now() - t); htmlLen = h.length; }
    for (let i = 0; i < 5; i++) { const t = performance.now(); scr.render(); fullWarm.push(performance.now() - t); }

    /* --- ③ 실클릭 1회(★ 토글) 총 블로킹 + 다음 페인트까지 ---
           역할이 바뀌므로 캐시는 반드시 빗나간다 = 실빌드 포함 실비용 */
    const clickOne = async (idx) => {
      const btn = root.querySelector('[data-vh-role="highlight"][data-i="' + idx + '"]');
      if (!btn) return null;
      const t0 = performance.now();
      btn.click();                                   /* onclick → setRole → redraw(render+innerHTML+mount) */
      const block = performance.now() - t0;          /* 이 사이 화면은 얼어 있다 */
      const paint = await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - t0))));
      return { block, paint };
    };
    /* (a) 처음 누르는 경우 — 매번 다른 사진에 걸어 캐시가 절대 못 맞춘다 */
    const fresh = [];
    for (let i = 0; i < Math.min(5, n); i++) { const c = await clickOne(i); if (c) fresh.push(c); await new Promise((r) => setTimeout(r, 120)); }
    /* (b) 껐다 켜는 경우 — 오가는 두 상태가 캐시에 남는다 */
    const clicks = [];
    for (let i = 0; i < 5; i++) { const c = await clickOne(0); if (c) clicks.push(c); await new Promise((r) => setTimeout(r, 120)); }

    /* (c) 요약 줄이 실제 숫자로 바뀌기까지 — 「다시 세는 중」이 사라지는 시각 */
    const settle = [];
    for (let i = 0; i < Math.min(4, n); i++) {
      if (typeof H.costFlush === 'function') H.costFlush();
      const btn = root.querySelector('[data-vh-role="exclude"][data-i="' + i + '"]');
      if (!btn) break;
      const t0 = performance.now();
      btn.click();
      const txt = () => (root.querySelector('#vhEst') || {}).textContent || '';
      while (/다시 세는 중/.test(txt()) && performance.now() - t0 < 8000) await new Promise((r) => setTimeout(r, 8));
      settle.push(performance.now() - t0);
      btn.click(); await new Promise((r) => setTimeout(r, 200));
    }

    /* --- ④ 실측 부수 지표 --- */
    const imgs = root.querySelectorAll('img.vh-thumb').length;
    const srcBytes = H.st.medias.reduce((a, m) => a + (m.src ? m.src.length : 0), 0);
    const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
    const peekRes = H.smartPeek();

    return {
      n,
      peekMs: med(cold), peekWarmMs: med(warm),
      renderMs: med(fullCold), renderWarmMs: med(fullWarm),
      baseMs: +(med(fullCold) - med(cold)).toFixed(1),
      thumbMs, thumbN,
      firstRenderMs, firstHtmlKB,
      settleMs: settle.length ? med(settle) : null,
      clickFreshMs: fresh.length ? med(fresh.map((c) => c.block)) : null,
      clickFreshPaintMs: fresh.length ? med(fresh.map((c) => c.paint)) : null,
      clickBlockMs: clicks.length ? med(clicks.map((c) => c.block)) : null,
      clickPaintMs: clicks.length ? med(clicks.map((c) => c.paint)) : null,
      htmlKB: Math.round(htmlLen / 1024),
      thumbs: imgs, thumbLeft: (H.st.medias || []).filter((m) => !m.thumb).length,
      srcMB: +(srcBytes / 1048576).toFixed(1),
      heapMB: mem, cache: typeof H.costStats === 'function' ? H.costStats() : null,
      scenes: peekRes && peekRes.ok ? peekRes.scenes : null,
      variant: peekRes && peekRes.ok ? peekRes.variant : null,
    };
  }, n);
}

const rows = [];
for (const n of [5, 10, 20, 30]) {
  const r = await measure(n);
  rows.push(r);
  console.log(`사진 ${String(n).padStart(2)}장 | 실빌드 냉 ${String(r.peekMs).padStart(6)}ms 온 ${String(r.peekWarmMs).padStart(5)}ms | render 냉 ${String(r.renderMs).padStart(6)}ms 온 ${String(r.renderWarmMs).padStart(6)}ms | ★클릭 ${String(r.clickFreshMs).padStart(5)}ms | 요약갱신 ${String(r.settleMs).padStart(6)}ms | 첫렌더 ${String(r.firstRenderMs).padStart(6)}ms/${String(r.firstHtmlKB).padStart(6)}KB | HTML ${String(r.htmlKB).padStart(5)}KB | 축소 ${String(r.thumbN).padStart(2)}장 ${String(r.thumbMs).padStart(6)}ms | 장면 ${r.scenes}`);
}

fs.mkdirSync('report', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), photos: loaded, rows, errs }, null, 1));
console.log('errs:', errs.length ? errs.slice(0, 3) : 'none');
console.log('→', OUT);
await br.close();
