/* ============================================================
   perf84.mjs — R84 순서 변경 잔여 원가 실브라우저 측정
   ------------------------------------------------------------
   R76 은 순서 변경을 부분 갱신으로 바꿨지만 「전량 재부여」로
   정확성에 값을 치렀다(§1.96 ① — 30행 × 6속성 ≈ 180회).
   R84 는 재부여를 [min(from,to), max(from,to)] 구간으로 좁힌다.

   이 하니스는 두 가지를 잰다:
     · 멈춤(ms): ▲ 한 칸(중앙값 4회) · 드래그 0→3 · CPU 1·4·6배
     · 속성 쓰기 횟수: Element.setAttribute 계측 — ms 는 이 규모에서
       잡음이 크므로, 원가의 실체(쓰기 횟수)를 직접 센다.

   사전 준비(레포에 커밋하지 않음):
     · http://127.0.0.1:8913 = k-edu 루트 정적 서버
     · /_perf75_photos.json  = gen75.mjs 산출
   실행: node perf84.mjs [출력경로]
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const OUT = process.argv[2] || 'report/_perf84.json';
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

    PG.go('video');
    await new Promise((r) => setTimeout(r, 700));

    /* ---- 속성 쓰기 계측: 조작 한 번 동안 setAttribute 횟수를 센다 ---- */
    let attrWrites = 0, counting = false;
    const origSet = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (...a) { if (counting) attrWrites++; return origSet.apply(this, a); };
    const countDuring = (fn) => { attrWrites = 0; counting = true; try { fn(); } finally { counting = false; } return attrWrites; };

    /* ---- ▲ 한 칸 (idx 5~8 · 4회 중앙값) ---- */
    const ups = [], upWrites = [];
    for (const i of [5, 6, 7, 8]) {
      const rt = root();
      const btn = rt.querySelector(`[data-vh-mup="${i}"]`);
      if (!btn) continue;
      const mark = rt.querySelector('[data-vh-mrow="20"]');
      flush();
      let block;
      const w = countDuring(() => {
        const t0 = performance.now();
        btn.click();
        block = performance.now() - t0;
      });
      const paint = await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(0))));
      ups.push({ block, kept: !!(mark && document.contains(mark)) });
      upWrites.push(w);
      await new Promise((r) => setTimeout(r, 150));
    }

    /* ---- 드래그 0→3 (구간 4행) ---- */
    const rt0 = root();
    const src = rt0.querySelector('[data-vh-mrow="0"]');
    const dst = rt0.querySelector('[data-vh-mrow="3"]');
    let dragMs = null, dragWrites = null, wiringLost = null;
    if (src && dst) {
      const mark = rt0.querySelector('[data-vh-mrow="20"]');
      const dt = { effectAllowed: '', setData() {}, getData() { return ''; } };
      dragWrites = countDuring(() => {
        const t = performance.now();
        src.dispatchEvent(Object.assign(new Event('dragstart', { bubbles: true }), { dataTransfer: dt }));
        dst.dispatchEvent(Object.assign(new Event('dragover', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
        dst.dispatchEvent(Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
        dragMs = +(performance.now() - t).toFixed(1);
      });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      wiringLost = !(mark && document.contains(mark));
    }

    Element.prototype.setAttribute = origSet;   /* 계측 원복 — 던져도 counting=false 라 안전 */

    /* 번호 무결성: 조작들 끝에 전 행 attr == 자리인지 손으로 센다 */
    const rows = root().querySelectorAll('[data-vh-mrow]');
    let holes = 0;
    for (let i = 0; i < rows.length; i++) if (rows[i].getAttribute('data-vh-mrow') !== String(i)) holes++;

    return {
      upBlockMed: med(ups.map((u) => u.block)),
      upKept: ups.every((u) => u.kept),
      upWritesMed: med(upWrites),
      dragMs, dragWrites, wiringLost, holes, rows: rows.length,
    };
  });
  return r;
}

const out = { at: new Date().toISOString(), photos: loaded, rates: {} };
for (const rate of [1, 4, 6]) {
  console.log(`\n—— CPU ${rate}배 ——`);
  const m = await measure(rate);
  out.rates['x' + rate] = m;
  console.log(`  ▲ 멈춤 중앙값 ${m.upBlockMed}ms · 속성 쓰기 ${m.upWritesMed}회 · 관전 행 생존 ${m.upKept}`);
  console.log(`  드래그 0→3 ${m.dragMs}ms · 속성 쓰기 ${m.dragWrites}회 · 배선 소실 ${m.wiringLost}`);
  console.log(`  번호 구멍 ${m.holes} / ${m.rows}행`);
}
out.pageErrors = errs;
fs.mkdirSync('report', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`\n저장 ${OUT}${errs.length ? ' · 페이지 오류 ' + errs.length : ''}`);
await br.close();
