/* ============================================================
   perf75.mjs (R75) — 사진 순서를 바꾼 뒤의 ★ 클릭 비용
   ------------------------------------------------------------
   R71 은 ★ 클릭을 「부분 갱신」으로 바꿔 저사양에서도 5ms 미만으로
   내렸다(R73 재확인). 그 부분 갱신 배선은 video4·video5 의 `mount`
   안에서 걸린다.

   그런데 video3 의 `redraw()` 는

       root.innerHTML = this.render(); this.mount(root);

   이고 `this` 가 video3 래퍼다. 즉 **재렌더 뒤 video4·video5 의
   mount 는 다시 안 걸린다.** 평소엔 안 드러난다 — video4 가 칩·씨앗
   배선을 전부 덮어써서 `redraw` 자체가 안 불리기 때문이다.
   덮이지 않은 경로가 둘 남는다.

     · 사진 순서 드래그(`ondrop`)  ← 흔한 조작
     · 자동 구성 실패 시 메시지 갱신

   이 하니스는 **드래그 한 번 전후의 같은 ★ 클릭**을 잰다.
   축은 R73 과 같다: CPU 스로틀 1·4·6배 · 1280×800@2x · 12MP 급 30장.

   사전 준비(레포에 커밋하지 않음):
     · http://127.0.0.1:8913 = k-edu 루트 정적 서버
     · /_perf75_photos.json  = gen75.mjs 산출
   실행: node perf75.mjs [출력경로]
   ============================================================ */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const OUT = process.argv[2] || 'report/_perf75.json';
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

    /* ---- 준비: 안정 상태까지 간다 (축소본 완성 = R73 처방 적용 후) ---- */
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

    /* ---- ★ 클릭 한 번 재기 ----
       같은 노드가 살아남으면 부분 갱신, 떨어져 나가면 전체 재렌더다. */
    const clickOne = async (idx, kind) => {
      const rt = root();
      const btn = rt.querySelector(`[data-vh-role="${kind}"][data-i="${idx}"]`);
      if (!btn) return null;
      const sentinel = rt.querySelector('[data-vh-mrow="7"]');
      flush();
      const t0 = performance.now();
      btn.click();
      const block = performance.now() - t0;
      const paint = await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - t0))));
      const kept = !!(sentinel && document.contains(sentinel));
      return { block, paint, kept };
    };

    const before = [];
    for (const i of [0, 1, 2, 3]) {
      const c = await clickOne(i, 'highlight');
      if (c) before.push(c);
      await new Promise((r) => setTimeout(r, 150));
    }

    /* ---- 사진 순서 드래그 1회 (0 → 3) ---- */
    const rt0 = root();
    const src = rt0.querySelector('[data-vh-mrow="0"]');
    const dst = rt0.querySelector('[data-vh-mrow="3"]');
    let dragMs = null, wiringLost = null;
    if (src && dst) {
      const mark = rt0.querySelector('[data-vh-mrow="9"]');
      const dt = { effectAllowed: '', setData() {}, getData() { return ''; } };
      const t = performance.now();
      src.dispatchEvent(Object.assign(new Event('dragstart', { bubbles: true }), { dataTransfer: dt }));
      dst.dispatchEvent(Object.assign(new Event('dragover', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
      dst.dispatchEvent(Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
      dragMs = +(performance.now() - t).toFixed(1);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      wiringLost = !(mark && document.contains(mark));
    }

    const after = [];
    for (const i of [0, 1, 2, 3]) {
      const c = await clickOne(i, 'highlight');
      if (c) after.push(c);
      await new Promise((r) => setTimeout(r, 150));
    }

    const scr = window.MK_SCREENS.video;
    return {
      photos: H.st.medias.length, noThumb,
      wrapChain: { r71: !!scr.__r71, r73: !!scr.__r73 },
      beforeBlock: med(before.map((c) => c.block)), beforePaint: med(before.map((c) => c.paint)),
      beforeKept: before.map((c) => c.kept),
      dragMs, wiringLost,
      afterBlock: med(after.map((c) => c.block)), afterPaint: med(after.map((c) => c.paint)),
      afterKept: after.map((c) => c.kept),
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
  console.log(`\nCPU ${r.rate}배 · 사진 ${r.photos}장 · 축소 안 된 사진 ${r.noThumb}장 · 래퍼 ${JSON.stringify(r.wrapChain)}`);
  console.log(`  ★ 클릭 (드래그 전)  멈춤 ${r.beforeBlock} ms / 그려지기까지 ${r.beforePaint} ms · ${keep(r.beforeKept)}`);
  console.log(`  사진 순서 드래그 1회 ${r.dragMs} ms · 목록 통째 교체됨: ${r.wiringLost}`);
  console.log(`  ★ 클릭 (드래그 후)  멈춤 ${r.afterBlock} ms / 그려지기까지 ${r.afterPaint} ms · ${keep(r.afterKept)}`);
  if (r.beforeBlock != null && r.afterBlock != null) console.log(`  → 멈춤 배수 ${(r.afterBlock / Math.max(r.beforeBlock, 0.1)).toFixed(0)}×`);
}
await setCPU(1);
fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), photos: loaded, rows, errs }, null, 1));
console.log('\n페이지 오류:', errs.length ? errs.slice(0, 3) : '없음');
console.log('저장:', OUT);
await br.close();
