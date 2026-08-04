/* ============================================================
   perf73.mjs (R73) — 저사양·태블릿 실측
   ------------------------------------------------------------
   R68 부터 다섯 라운드 이월된 마지막 부채. R71 은 데스크톱
   1440×900·헤드리스 셸에서만 쟀다("실제 학교 태블릿·저사양 기기
   실측 미실시" — §1.91 한계 ④).

   여기서는 두 축을 바꾼다.
     · CPU  : CDP Emulation.setCPUThrottlingRate — 1배(기준) / 4배 / 6배
     · 화면 : 1280×800 · DPR 2 (학교 보급 태블릿 가로)

   4배는 라이트하우스 모바일 기준(중급), 6배는 저가 보급기 대역이다.
   실기기가 아니므로 「스로틀 실측」이라고 부른다 — 실기기 실측이라고
   쓰면 거짓이다.

   사전 준비(레포에 커밋하지 않음):
     · http://127.0.0.1:8913 = k-edu 루트 정적 서버
     · /_perf73_photos.json = 12MP JPEG 30장 data URL 묶음
   실행: node perf73.mjs [출력경로]
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const OUT = process.argv[2] || 'report/_perf73.json';
const BASE = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args.concat(['--js-flags=--expose-gc']),
  headless: 'shell',
});
const pg = await br.newPage();
pg.setDefaultTimeout(240000);
await pg.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
const cdp = await pg.createCDPSession();

const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(900);

const loaded = await pg.evaluate(async () => {
  const r = await fetch('/_perf73_photos.json');
  window.__P73 = await r.json();
  return { n: window.__P73.length, mb: +(window.__P73.reduce((a, p) => a + p.bytes, 0) / 1048576).toFixed(1) };
});
console.log(`사진 ${loaded.n}장 · 원본 합 ${loaded.mb}MB · 뷰포트 1280×800@2x`);

const setCPU = async (rate) => { await cdp.send('Emulation.setCPUThrottlingRate', { rate }); };

/* 한 조합(스로틀 × 장수) 측정.
   R71 하니스와 달리 「업로드 순간」을 통째로 잰다 — 저사양에서 진짜
   아픈 자리는 클릭이 아니라 사진을 얹는 그 한 번이기 때문이다. */
async function measure(n) {
  return await pg.evaluate(async (n) => {
    const H = window.MK_VIDHUB, PG = window.PG;
    const med = (a) => { const s = a.slice().sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(1); };
    const heap = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
    const root = () => document.querySelector('#pgBody') || document.body;

    /* ---- 초기화: 이전 조합의 축소본이 남으면 측정이 거짓이 된다 ---- */
    H.resetStage();
    if (typeof H.costFlush === 'function') H.costFlush();
    const fresh = window.__P73.slice(0, n).map((p) => ({ name: p.name, kind: p.kind, src: p.src, w: p.w, h: p.h }));
    H.st.comp = 'cx-slideshow';
    H.st.theme = window.MK_COMPOSE.listThemes()[0].id;
    H.st.title = '우리 반 봄 소풍';

    const heap0 = heap();

    /* ---- ① 업로드 순간 ----
       stageMedias(동기 블로킹) → 첫 렌더 → 실장착. 이 셋이 끝나야
       사용자는 목록을 볼 수 있다. 축소는 아직 안 끝났다. */
    const tUp = performance.now();
    H.stageMedias(fresh);
    const stageMs = +(performance.now() - tUp).toFixed(1);
    H.st.captions = H.st.medias.map((m, i) => (i % 2 ? '' : '봄 소풍 ' + (i + 1) + '번째 사진'));

    const tR = performance.now();
    const h0 = window.MK_SCREENS.video.render();
    const firstRenderMs = +(performance.now() - tR).toFixed(1);
    const firstHtmlKB = Math.round(h0.length / 1024);

    /* 실장착 — 문자열이 아니라 브라우저가 실제로 파싱·해독하는 비용 */
    const holder = document.createElement('div');
    document.body.appendChild(holder);
    const tM = performance.now();
    holder.innerHTML = h0;
    const mountMs = +(performance.now() - tM).toFixed(1);
    const paintMs = await new Promise((r) => {
      const t0 = performance.now();
      requestAnimationFrame(() => requestAnimationFrame(() => r(+(performance.now() - t0).toFixed(1))));
    });
    holder.remove();
    const usableMs = +(stageMs + firstRenderMs + mountMs + paintMs).toFixed(1);
    const heapAfterFirst = heap();

    /* ---- ② 축소본 완성까지 ---- */
    let thumbMs = null, thumbN = 0;
    if (typeof H.ensureThumbs === 'function') {
      const t = performance.now();
      thumbN = await H.ensureThumbs();
      while (typeof H.thumbsPending === 'function' && H.thumbsPending()) await new Promise((r) => setTimeout(r, 40));
      const left = (H.st.medias || []).filter((m) => !m.thumb).length;
      if (left) thumbN += await H.ensureThumbs();
      thumbMs = +(performance.now() - t).toFixed(1);
    }
    const thumbLeft = (H.st.medias || []).filter((m) => !m.thumb).length;
    const heapAfterThumb = heap();

    /* ---- ③ 축소 후 정상 상태 ---- */
    PG.go('video');
    await new Promise((r) => setTimeout(r, 600));
    const rt = root();
    const scr = window.MK_SCREENS.video;
    const flush = () => { if (typeof H.costFlush === 'function') H.costFlush(); };

    const rc = [];
    for (let i = 0; i < 3; i++) { flush(); const t = performance.now(); const h = scr.render(); rc.push(performance.now() - t); var lastLen = h.length; }
    const settledHtmlKB = Math.round(lastLen / 1024);

    const pk = [];
    for (let i = 0; i < 5; i++) { flush(); const t = performance.now(); H.smartPeek(); pk.push(performance.now() - t); }

    /* ---- ④ ★ 첫 클릭(캐시 반드시 빗나감) ---- */
    const clickOne = async (idx, kind) => {
      const btn = rt.querySelector('[data-vh-role="' + kind + '"][data-i="' + idx + '"]');
      if (!btn) return null;
      const t0 = performance.now();
      btn.click();
      const block = performance.now() - t0;
      const paint = await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - t0))));
      return { block, paint };
    };
    const cl = [];
    for (let i = 0; i < Math.min(4, n); i++) { const c = await clickOne(i, 'highlight'); if (c) cl.push(c); await new Promise((r) => setTimeout(r, 150)); }

    /* ---- ⑤ 요약 줄이 실제 숫자로 바뀌기까지 ---- */
    const settle = [];
    for (let i = 0; i < Math.min(3, n); i++) {
      flush();
      const btn = rt.querySelector('[data-vh-role="exclude"][data-i="' + i + '"]');
      if (!btn) break;
      const t0 = performance.now();
      btn.click();
      const txt = () => (rt.querySelector('#vhEst') || {}).textContent || '';
      while (/다시 세는 중/.test(txt()) && performance.now() - t0 < 60000) await new Promise((r) => setTimeout(r, 10));
      settle.push(performance.now() - t0);
      btn.click(); await new Promise((r) => setTimeout(r, 250));
    }

    const srcMB = +(H.st.medias.reduce((a, m) => a + (m.src ? m.src.length : 0), 0) / 1048576).toFixed(1);
    const thumbMB = +(H.st.medias.reduce((a, m) => a + (m.thumb ? m.thumb.length : 0), 0) / 1048576).toFixed(2);

    return {
      n,
      stageMs, firstRenderMs, mountMs, paintMs, usableMs, firstHtmlKB,
      thumbMs, thumbN, thumbLeft,
      renderMs: med(rc), settledHtmlKB, peekMs: med(pk),
      clickBlockMs: cl.length ? med(cl.map((c) => c.block)) : null,
      clickPaintMs: cl.length ? med(cl.map((c) => c.paint)) : null,
      settleMs: settle.length ? med(settle) : null,
      srcMB, thumbMB,
      heap0, heapAfterFirst, heapAfterThumb, heapEnd: heap(),
    };
  }, n);
}

const rows = [];
for (const rate of [1, 4, 6]) {
  await setCPU(rate);
  await wait(400);
  for (const n of [10, 30]) {
    const r = await measure(n);
    r.cpu = rate;
    rows.push(r);
    console.log(
      `CPU ${rate}x · ${String(n).padStart(2)}장 | 업로드→목록 ${String(r.usableMs).padStart(7)}ms ` +
      `(얹기 ${String(r.stageMs).padStart(5)} 렌더 ${String(r.firstRenderMs).padStart(6)} 장착 ${String(r.mountMs).padStart(6)} 페인트 ${String(r.paintMs).padStart(6)}) ` +
      `첫HTML ${String(r.firstHtmlKB).padStart(6)}KB | 축소 ${String(r.thumbN).padStart(2)}장 ${String(r.thumbMs).padStart(7)}ms | ` +
      `안정HTML ${String(r.settledHtmlKB).padStart(5)}KB 렌더 ${String(r.renderMs).padStart(6)}ms | ★클릭 ${String(r.clickBlockMs).padStart(6)}ms | 요약 ${String(r.settleMs).padStart(7)}ms | heap ${r.heap0}→${r.heapAfterFirst}→${r.heapAfterThumb}MB`
    );
  }
}

await setCPU(1);
fs.mkdirSync('report', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), viewport: '1280x800@2x', photos: loaded, rows, errs }, null, 1));
console.log('errs:', errs.length ? errs.slice(0, 3) : 'none');
console.log('→', OUT);
await br.close();
