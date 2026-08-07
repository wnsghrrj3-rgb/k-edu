/* ============================================================
   perf82.mjs — R82 ✕(빼기) 실브라우저 측정
   ------------------------------------------------------------
   R76 이 순서 변경을 부분 갱신으로 바꾸며 미룬 ✕ 를 R82 가 얹었다.
   이 하니스는 **✕ 한 번의 멈춤**을 잰다 — 원본에선 목록 통째 재렌더,
   수정본에선 행 소멸 + 번호 재부여 + 개수 줄 다시 세기여야 한다.

   축은 R73·R76 과 같다: CPU 스로틀 1·4·6배 · 1280×800@2x · 12MP 급 30장.
   ✕ 4회(가운데 자리)의 중앙값 + 관전 행 생존 여부 + ✕ 뒤 ★ 클릭이
   여전히 부분인지까지 본다.

   사전 준비(레포에 커밋하지 않음):
     · http://127.0.0.1:8913 = k-edu 루트 정적 서버
     · /_perf75_photos.json  = gen75.mjs 산출
   실행: node perf82.mjs [출력경로]
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const OUT = process.argv[2] || 'report/_perf82.json';
const BASE = 'http://127.0.0.1:8913/maker-playground/index.html';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args.concat(['--js-flags=--expose-gc']),
  headless: 'shell',
  protocolTimeout: 900000,
});
const pg = await br.newPage();
pg.setDefaultTimeout(600000);
await pg.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
const cdp = await pg.createCDPSession();

const errs = [];
pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));

await pg.goto(BASE + '#/video', { waitUntil: 'networkidle0' });
await wait(900);

const loaded = await pg.evaluate(async () => {
  const r = await fetch('/_perf75_photos.json');
  window.__P75 = await r.json();
  return { n: window.__P75.length, mb: +(window.__P75.reduce((a, p) => a + p.bytes, 0) / 1048576).toFixed(1) };
});
console.log(`사진 ${loaded.n}장 · 원본 합 ${loaded.mb}MB · 뷰포트 1280×800@2x`);

const setCPU = async (rate) => { await cdp.send('Emulation.setCPUThrottlingRate', { rate }); };

async function measure(rate) {
  await setCPU(rate);
  const r = await pg.evaluate(async () => {
    const H = window.MK_VIDHUB, PG = window.PG;
    const med = (a) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(1); };
    const root = () => document.querySelector('#pgBody') || document.body;
    const flush = () => { if (typeof H.costFlush === 'function') H.costFlush(); };

    /* ---- 준비: 안정 상태까지 (축소본 완성) ---- */
    H.resetStage();
    flush();
    const fresh = window.__P75.map((p) => ({ name: p.name, kind: p.kind, src: p.src, w: p.w, h: p.h }));
    H.st.comp = 'cx-slideshow';
    H.st.theme = window.MK_COMPOSE.listThemes()[0].id;
    H.st.title = '우리 반 봄 소풍';
    H.stageMedias(fresh);
    H.st.captions = H.st.medias.map((m, i) => (i % 2 ? '' : '봄 소풍 ' + (i + 1) + '번째 사진'));

    if (typeof H.ensureThumbs === 'function') {
      await H.ensureThumbs();
      while (typeof H.thumbsPending === 'function' && H.thumbsPending()) await new Promise((r) => setTimeout(r, 40));
      if ((H.st.medias || []).filter((m) => !m.thumb).length) await H.ensureThumbs();
    }
    const noThumb = (H.st.medias || []).filter((m) => !m.thumb).length;

    PG.go('video');
    await new Promise((r) => setTimeout(r, 700));

    /* ---- ✕ 한 번 재기 ----
       관전 행(맨 끝)이 살아남으면 부분 갱신, 떨어져 나가면 전체 재렌더다. */
    const delOne = async (idx) => {
      const rt = root();
      const btn = rt.querySelector(`[data-vh-mdel="${idx}"]`);
      if (!btn) return null;
      const rows = rt.querySelectorAll('[data-vh-mrow]');
      const sentinel = rows[rows.length - 1];
      flush();
      const t0 = performance.now();
      btn.click();
      const block = performance.now() - t0;
      const paint = await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - t0))));
      return { block, paint, kept: !!(sentinel && document.contains(sentinel)) };
    };

    const dels = [];
    for (const i of [3, 3, 3, 3]) {   /* 30→26장 · 매번 같은 가운데 자리 */
      const d = await delOne(i);
      if (d) dels.push(d);
      await new Promise((r) => setTimeout(r, 200));
    }

    /* ---- ✕ 뒤 ★ 클릭이 여전히 부분인지 ---- */
    const starAfter = await (async () => {
      const rt = root();
      const btn = rt.querySelector('[data-vh-role="highlight"][data-i="0"]');
      if (!btn) return null;
      const rows = rt.querySelectorAll('[data-vh-mrow]');
      const mark = rows[rows.length - 1];
      flush();
      const t0 = performance.now();
      btn.click();
      const block = performance.now() - t0;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { block: +block.toFixed(1), kept: !!(mark && document.contains(mark)) };
    })();

    /* ---- 개수 줄 정직 확인: 지운 뒤 예상 장면 수가 실제와 맞는지 ---- */
    await new Promise((r) => setTimeout(r, 120));
    const est2 = (root().querySelector('#vhEst2') || {}).textContent || '';

    return {
      photos: H.st.medias.length, noThumb,
      delBlock: med(dels.map((d) => d.block)), delPaint: med(dels.map((d) => d.paint)),
      delKept: dels.map((d) => d.kept),
      starAfter, est2: est2.slice(0, 60),
      progressAlive: !!document.querySelector('.vh-rows, .vh-stage'),
    };
  });
  return { rate, ...r };
}

const rows = [];
for (const rate of [1, 4, 6]) {
  const r = await measure(rate);
  rows.push(r);
  const keep = (a) => (a.every(Boolean) ? '부분 갱신' : a.every((x) => !x) ? '전체 재렌더' : '섞임 ' + JSON.stringify(a));
  console.log(`\nCPU ${r.rate}배 · 남은 사진 ${r.photos}장 · 축소 안 된 사진 ${r.noThumb}장`);
  console.log(`  ✕ 빼기 한 번        멈춤 ${r.delBlock} ms / 그려지기까지 ${r.delPaint} ms · ${keep(r.delKept)}`);
  if (r.starAfter) console.log(`  ✕ 뒤 ★ 클릭        멈춤 ${r.starAfter.block} ms · ${r.starAfter.kept ? '부분 갱신' : '전체 재렌더'}`);
  console.log(`  지운 뒤 예상 줄      「${r.est2}」`);
}
await setCPU(1);
fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), photos: loaded, rows, errs }, null, 1));
console.log('\n페이지 오류:', errs.length ? errs.slice(0, 3) : '없음');
console.log('저장:', OUT);
await br.close();
