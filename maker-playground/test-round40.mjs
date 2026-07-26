/* R40 — PDF 실출력(래스터 · 한글 그대로): jpegSize 순수 파서 + toPDFRaster 라이터 + 에디터 배선 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const R = window.MK_RENDER;
let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);

/* ---- 합성 JPEG 픽스처(순수 바이트) — SOI + APP0 + SOF0/SOF2 + 임의 페이로드 + EOI ---- */
const mkJpeg = (w, h, { sof = 0xC0, payload = [] } = {}) => {
  const b = [0xFF, 0xD8];                                       /* SOI */
  b.push(0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0); /* APP0 len16 */
  b.push(0xFF, sof, 0x00, 0x11, 8, h >> 8 & 255, h & 255, w >> 8 & 255, w & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1); /* SOFn len17 */
  b.push(0xFF, 0xDA, 0x00, 0x04, 0, 0);                         /* SOS(형식만) */
  b.push(...payload);
  b.push(0xFF, 0xD9);                                           /* EOI */
  return new Uint8Array(b);
};

/* ============ 1. jpegSize — SOF 스캔 순수 파서 ============ */
sec('1. jpegSize 순수 파서');
{
  const j = R.jpegSize(mkJpeg(1920, 1080));
  T('SOF0 치수 판독', j && j.w === 1920 && j.h === 1080 && j.progressive === false, JSON.stringify(j));
  const p = R.jpegSize(mkJpeg(720, 1280, { sof: 0xC2 }));
  T('SOF2(프로그레시브) 치수 판독', p && p.w === 720 && p.h === 1280 && p.progressive === true);
  T('SOI 아님 → null', R.jpegSize(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) === null);
  T('빈 입력 → null', R.jpegSize(null) === null && R.jpegSize(new Uint8Array([])) === null);
  T('C4(DHT)는 SOF 아님 — 건너뜀', (() => {
    const b = [0xFF, 0xD8, 0xFF, 0xC4, 0x00, 0x04, 0, 0, /* DHT 위장 */ ...Array.from(mkJpeg(64, 32)).slice(2)];
    const r = R.jpegSize(new Uint8Array(b)); return r && r.w === 64 && r.h === 32;
  })());
  T('페이로드에 0xFFD8 잡음 있어도 첫 SOF 정답', (() => {
    const r = R.jpegSize(mkJpeg(300, 200, { payload: [0xFF, 0xD8, 0xFF, 0x00, 0x12] }));
    return r && r.w === 300 && r.h === 200;
  })());
  T('불량 세그먼트 길이 → null', R.jpegSize(new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x00, 1, 2, 3, 4, 5, 6])) === null);
}

/* ============ 2. toPDFRaster — 라이터 순수 검증 ============ */
sec('2. toPDFRaster 라이터');
{
  const j1 = mkJpeg(1600, 900, { payload: [0x00, 0xFF, 0x28, 0x29, 0x5C, 0x0A, 0x65, 0x6E, 0x64] }); /* 위험 바이트: NUL·0xFF·()·\·개행 */
  const j2 = mkJpeg(900, 1600);
  const r = R.toPDFRaster([{ bin: j1 }, { bin: j2 }], {});
  T('2쪽 생성 (치수 자동 판독)', r.pages === 2 && r.raster === true, 'pages=' + r.pages);
  T('PDF 헤더·EOF', r.bytes.startsWith('%PDF-1.4') && r.bytes.trimEnd().endsWith('%%EOF'));
  T('DCTDecode XObject 2개', (r.bytes.match(/\/Filter \/DCTDecode/g) || []).length === 2);
  T('치수 반영', r.bytes.includes('/Width 1600 /Height 900') && r.bytes.includes('/Width 900 /Height 1600'));
  /* MediaBox — A4 폭 595.28 기준, 비율 유지 */
  T('가로 장면 MediaBox = 595.28×334.85', /\/MediaBox \[0 0 595\.28 334\.8[0-9]*\]/.test(r.bytes));
  T('세로 장면 MediaBox 세로 > 가로', (() => {
    const m = [...r.bytes.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)];
    return m.length === 2 && +m[1][1] < +m[1][2];
  })());
  /* 바이너리 무손실 — JPEG 바이트가 stream 구간에 그대로 */
  const at = r.bytes.indexOf('DCTDecode');
  const st = r.bytes.indexOf('stream\n', at) + 7;
  let intact = true;
  for (let i = 0; i < j1.length; i++) if ((r.bytes.charCodeAt(st + i) & 255) !== j1[i]) { intact = false; break; }
  T('JPEG 바이트 무손실 임베드(NUL·괄호·백슬래시 포함)', intact);
  T('/Length = 실바이트 수', new RegExp('/Filter /DCTDecode /Length ' + j1.length + ' >>').test(r.bytes));
  /* xref 오프셋 실검증 — 각 항목이 "N 0 obj" 를 실제로 가리키는가 */
  T('xref 오프셋 전량 정합', (() => {
    const xm = /xref\n0 (\d+)\n0000000000 65535 f \n([\s\S]*?)trailer/.exec(r.bytes);
    if (!xm) return false;
    const rows = xm[2].trim().split('\n');
    if (rows.length !== +xm[1] - 1) return false;
    return rows.every((row, i) => {
      const off = +row.slice(0, 10);
      return r.bytes.slice(off, off + String(i + 1).length + 6) === `${i + 1} 0 obj`;
    });
  })());
  T('startxref = xref 위치', (() => {
    const m = /startxref\n(\d+)\n%%EOF/.exec(r.bytes);
    return m && r.bytes.slice(+m[1], +m[1] + 4) === 'xref';
  })());
  T('바이트 전량 latin-1 범위(다운로드 변환 안전)', (() => {
    for (let i = 0; i < r.bytes.length; i++) if (r.bytes.charCodeAt(i) > 255) return false;
    return true;
  })());
  /* 명시 치수 우선 */
  const r2 = R.toPDFRaster([{ bin: j2, w: 3200, h: 1800 }], {});
  T('명시 w/h 우선', r2.pages === 1 && r2.bytes.includes('/Width 3200 /Height 1800'));
  /* 정직 — 불량 입력 */
  const r3 = R.toPDFRaster([{ bin: new Uint8Array([1, 2, 3]) }, { bin: mkJpeg(100, 50) }], {});
  T('불량 JPEG 건너뜀 + 경고', r3.pages === 1 && r3.warnings.length === 1 && r3.warnings[0].code === 'bad-jpeg');
  const r4 = R.toPDFRaster([], {});
  T('빈 입력 → 0쪽 (거짓 성공 없음)', r4.pages === 0);
}

/* ============ 3. 파이프라인 결합 — 장면→래스터 플랜→PDF ============ */
sec('3. 파이프라인 결합 (renderScene→toRaster jpg 플랜)');
{
  const scene = { name: 'S', duration: 3, elements: [{ kind: 'text', x: 10, y: 20, w: 80, size: 6, text: '한글 인쇄 검증', weight: 700 }] };
  const dl = R.renderScene(scene, {});
  const out = R.toRaster(dl, { format: 'jpg', scale: 2, quality: 0.92, planOnly: true });
  T('결정론 플랜 (실래스터는 브라우저 몫)', out.plan && out.plan.format === 'jpg' && out.plan.scale === 2 && out.plan.quality === 0.92);
  T('플랜 치수 = 2배', out.plan.width === Math.round(dl.width * 2) && out.plan.height === Math.round(dl.height * 2));
  /* 플랜 치수를 그대로 명시 치수로 쓰는 에디터 경로 성립 */
  const pdf = R.toPDFRaster([{ bin: mkJpeg(out.plan.width, out.plan.height), w: out.plan.width, h: out.plan.height }], {});
  T('플랜 치수 → PDF 페이지 성립', pdf.pages === 1 && pdf.bytes.includes(`/Width ${out.plan.width}`));
  /* dataUrlBytes 왕복 — 에디터가 쓰는 실경로 */
  const jj = mkJpeg(40, 30);
  let b64 = ''; const C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let i = 0; i < jj.length; i += 3) {
    const n = (jj[i] << 16) | ((jj[i + 1] || 0) << 8) | (jj[i + 2] || 0);
    b64 += C[n >> 18 & 63] + C[n >> 12 & 63] + (i + 1 < jj.length ? C[n >> 6 & 63] : '=') + (i + 2 < jj.length ? C[n & 63] : '=');
  }
  const db = R.dataUrlBytes('data:image/jpeg;base64,' + b64);
  T('dataUrlBytes JPEG 왕복 무손실', db && db.ext === 'jpg' && db.bin.length === jj.length && db.bin.every((v, i) => v === jj[i]));
  T('왕복 결과 → jpegSize 판독', (() => { const s = R.jpegSize(db.bin); return s && s.w === 40 && s.h === 30; })());
}

/* ============ 4. 에디터 배선 + 정직 표기 ============ */
sec('4. 에디터 배선·정직 표기');
{
  const src = fs.readFileSync('screens/editor.js', 'utf8');
  T('PDF 실버튼 존재', /data-ex="pdf"/.test(src) && /PDF — 전체 장면/.test(src));
  T('PDF 핸들러 = toPDFRaster 실경로', /toPDFRaster\(imgs/.test(src) && /format: 'jpg', scale: 2/.test(src));
  T('실패 시 거짓 성공 없음(throw)', /장면 래스터 실패/.test(src) && /PDF 페이지 생성 실패/.test(src));
  T('낡은 "PDF 한글 다음 몫" 문구 소멸', !/PDF 한글·영상 오디오 트랙은 다음 몫/.test(src));
  T('벡터 미탑재 정직 주석 유지(render.js)', /벡터 텍스트\(CID 폰트 임베드\)는 여전히 미탑재/.test(fs.readFileSync('data/render.js', 'utf8')));
  /* 라이브 부팅 — 에디터 화면에서 내보내기 버튼 실존 */
  window.PG.go('editor');
  const exBtn = window.document.querySelector('[data-ed="export"]');
  T('에디터 내보내기 버튼 실존', !!exBtn);
  exBtn.click();
  const pdfBtn = window.document.querySelector('[data-ex="pdf"]');
  T('모달에 PDF 버튼 실렌더', !!pdfBtn && /한글 그대로/.test(pdfBtn.textContent));
  const msg = window.document.getElementById('exMsg');
  T('안내 문구 갱신 실렌더', !!msg && /인쇄용 고해상/.test(msg.textContent));
  if (window.MK && window.MK.Modal) window.MK.Modal.close();
}

/* ============ 5. 회귀 — 기존 toPDF(벡터)·PPTX 무변 ============ */
sec('5. 회귀 (toPDF 벡터·PPTX)');
{
  const dl = R.renderScene({ name: 'S', duration: 3, elements: [{ kind: 'text', x: 10, y: 20, w: 80, size: 6, text: 'Hello 한글', weight: 700 }] }, {});
  const v = R.toPDF([dl], {});
  T('toPDF 벡터 경로 무변', v.vector === true && v.pages === 1 && v.bytes.startsWith('%PDF-1.4'));
  T('toPDF 한글 경고 유지(정직)', v.warnings.some((w) => w.code === 'missing-font'));
  const p = R.toPPTX([dl], {});
  T('toPPTX 무변', p && p.bytes && p.slides === 1);
}

/* ============ 결과 ============ */
console.log(`\nR40 검증: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
if (fail) process.exit(1);
