/* ============================================================
   test-round73.mjs — R73 저사양 처방 (R71 한계 ④ 해소)
   ------------------------------------------------------------
   실측(CPU 6배·1280×800@2x·12MP 30장)이 지목한 자리는 하나였다:
   축소본은 업로드 뒤에 만들어지므로 **첫 렌더에는 아직 없고**, 없으면
   목록이 원본을 그린다 → 첫 렌더 HTML 60,761KB, 업로드→목록 28.7초.

   여기서 못 박는 계약:
     ① 축소본이 없으면 원본을 화면 마크업으로 내보내지 않는다.
        자리표시는 같은 `<img>` 구조·같은 크기다(레이아웃 무변).
     ② 축소가 불가능한 환경에서는 종전대로 원본을 그린다 —
        느린 것이 안 보이는 것보다 낫다.
     ③ makeThumb 이 끝나면 답이 반드시 확정된다. 「축소 안 하기로 함」을
        미정으로 남기면 그 자리는 영영 빈 칸이 된다.
     ④ 진행 고지는 실제 남은 수와 같아야 한다 — 거짓 진행 금지.
        남은 게 없으면 아무 말도 하지 않는다.
     ⑤ 원본 `m.src` 는 어떤 경우에도 안 바뀐다(빌드는 원본을 쓴다).
        축소본은 빌드 문서로 새지 않는다(R71 계약 승계).
     ⑥ R71 캐시·부분 갱신, R72 간결 구성은 그대로 선다.
     ⑦ 보고서에 적는 숫자는 실측 저장본과 같아야 한다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><div id="root"></div><div id="pgBody"></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video' });
const { window } = dom;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
window.alert = () => {}; window.confirm = () => true;
window.requestAnimationFrame = (f) => setTimeout(f, 0);
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

/* ---- 캔버스·이미지 대역 ----
   jsdom 에는 캔버스가 없다. 없으면 video5 는 폴백(원본)으로 가므로
   주 경로가 아예 안 돌아본다. 실브라우저가 하는 일만 흉내 낸다. */
const TINY = 'data:image/jpeg;base64,' + 'T'.repeat(40);
window.HTMLCanvasElement.prototype.getContext = function () { return { drawImage() {} }; };
window.HTMLCanvasElement.prototype.toDataURL = function () { return TINY; };
class FakeImage {
  constructor() { this.naturalWidth = 4000; this.naturalHeight = 3000; }
  set src(v) { this._src = v; setTimeout(() => { if (FakeImage.failAll) { this.onerror && this.onerror(); } else { this.onload && this.onload(); } }, 0); }
  get src() { return this._src; }
}
FakeImage.failAll = false;
window.Image = FakeImage;

for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((x) => !/^https?:/.test(x))) {
  const f = path.join(ROOT, u.replace(/^\//, '').split('?')[0]);
  if (!fs.existsSync(f)) continue;
  try { window.eval(fs.readFileSync(f, 'utf8')); } catch (e) { /* 부트 부작용 무시 — 엔진만 본다 */ }
}

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};
const TA = async (name, fn) => {
  try { const r = await fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const H = window.MK_VIDHUB;
const BIG = (n) => 'data:image/jpeg;base64,' + String(n).repeat(4000);   /* 원본 — 길다 */
const img = (n) => ({ name: 'IMG_' + n + '.JPG', kind: 'image', src: BIG(n), w: 4000, h: 3000 });
const reset = () => { H.resetStage(); if (H.costFlush) H.costFlush(); };
const settle = () => new Promise((r) => setTimeout(r, 30));

console.log('--- ① 자리표시: 축소 전 원본은 화면으로 안 나간다 ---');

T('T1 엔진 적재 — video5 훅·계약 표면 존재', () => {
  const miss = ['thumbImg', 'thumbWaiting', 'thumbProgressHTML', 'thumbSyncProgress', 'makeThumb', 'ensureThumbs']
    .filter((k) => typeof H[k] !== 'function');
  return miss.length === 0 ? true : '없음: ' + miss.join(',');
});

T('T2 축소 전 사진 → 자리표시 마크업 (원본 src 미포함)', () => {
  const m = img(1);
  const s = H.thumbImg(m, 'cx');
  if (/vh-thumb-wait/.test(s) === false) return '대기 표시 없음: ' + s.slice(0, 120);
  if (s.indexOf(m.src) >= 0) return '원본이 마크업에 실렸다';
  return true;
});

T('T3 자리표시도 <img> 구조·vh-thumb 유지 (레이아웃 무변)', () => {
  const s = H.thumbImg(img(2), 'cx');
  return /^<img /.test(s) && /class="cx vh-thumb/.test(s) ? true : s.slice(0, 140);
});

T('T4 자리표시는 사진마다 고유 이름표를 단다 (나중에 그 자리만 갈아 끼우려고)', () => {
  const a = img(3), b = img(4);
  const ia = (H.thumbImg(a, '').match(/data-vh-th="([^"]+)"/) || [])[1];
  const ib = (H.thumbImg(b, '').match(/data-vh-th="([^"]+)"/) || [])[1];
  return ia && ib && ia !== ib ? true : `${ia} / ${ib}`;
});

T('T5 축소본이 있으면 축소본을 쓴다 (원본 아님)', () => {
  const m = img(5); m.thumb = TINY;
  const s = H.thumbImg(m, '');
  return s.indexOf(TINY) >= 0 && s.indexOf(m.src) < 0 && !/vh-thumb-wait/.test(s) ? true : s.slice(0, 120);
});

T('T6 목록 전체 렌더에 원본이 한 장도 안 실린다', () => {
  reset();
  const ms = [1, 2, 3, 4, 5].map(img);
  H.st.medias = ms; H.st.captions = ms.map(() => '');
  H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  const out = H.renderStage();
  const leaked = ms.filter((m) => out.indexOf(m.src) >= 0);
  return leaked.length === 0 ? true : `원본 ${leaked.length}장 유출 (HTML ${out.length}자)`;
});

T('T7 목록 HTML 크기가 원본 크기를 안 따라간다 (실측 60,761KB→34KB 의 기전)', () => {
  const draw = (mult) => {
    reset();
    const ms = [1, 2, 3, 4, 5].map((n) => {
      const m = img(n); m.src = 'data:image/jpeg;base64,' + String(n).repeat(4000 * mult); return m;
    });
    H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
    return { html: H.renderStage().length, src: ms.reduce((a, m) => a + m.src.length, 0) };
  };
  const a = draw(1), b = draw(8);
  /* 원본이 8배가 돼도 화면 마크업은 그대로여야 한다 — 원본이 안 실리므로 */
  return b.src > a.src * 7 && b.html === a.html ? true : `원본 ${a.src}→${b.src} · HTML ${a.html}→${b.html}`;
});

console.log('--- ② 폴백: 축소가 불가능한 환경 ---');

T('T8 영상(kind=video)은 종전 🎬 — 자리표시 대상 아님', () => {
  const m = { name: 'v', kind: 'video', src: 'data:video/mp4;base64,AAA' };
  return H.thumbWaiting(m) === false ? true : '영상을 기다림으로 봤다';
});

T('T9 data:image 가 아닌 그림(외부 URL)은 종전대로 원본을 그린다', () => {
  const m = { name: 'u', kind: 'image', src: 'https://x.test/a.jpg' };
  const s = H.thumbImg(m, '');
  return s.indexOf(m.src) >= 0 && !/vh-thumb-wait/.test(s) ? true : s.slice(0, 120);
});

T('T10 빈 슬롯은 종전 ＋ 유지 (thumbImg 를 안 탄다)', () => {
  reset();
  H.st.stage = 'pairs';
  H.st.pairs = [{ before: null, after: null, title: '', resultText: '' }];
  H.st.pairRoles = ['normal'];
  const out = H.renderStage();
  return out.indexOf('vh-thumb-empty') >= 0 ? true : '＋ 슬롯이 사라졌다';
});

T('T11 video2 훅 갈래 — thumbImg 가 없으면 종전(원본) 동작', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/video2.js'), 'utf8');
  const hasHook = /typeof H\.thumbImg === 'function'/.test(src);
  const hasFallback = /esc\(m\.thumb \|\| m\.src\)/.test(src);
  return hasHook && hasFallback ? true : `훅 ${hasHook} · 폴백 ${hasFallback}`;
});

console.log('--- ③ 확정: 영영 빈 칸이 되지 않는다 ---');

await TA('T12 축소 성공 → thumb 확정 + 원본 무손상', async () => {
  const m = img(11); const before = m.src;
  await H.makeThumb(m);
  return m.thumb === TINY && m.src === before ? true : `thumb=${String(m.thumb).slice(0, 20)} src바뀜=${m.src !== before}`;
});

await TA('T13 축소 실패(디코드 불가) → 원본으로 확정 (미정으로 안 남긴다)', async () => {
  FakeImage.failAll = true;
  const m = img(12);
  await H.makeThumb(m);
  FakeImage.failAll = false;
  return m.thumb === m.src ? true : `thumb=${String(m.thumb).slice(0, 24)}`;
});

await TA('T14 줄여도 안 작아지는 원본 → 원본으로 확정', async () => {
  const m = { name: 's', kind: 'image', src: 'data:image/jpeg;base64,AB', w: 20, h: 15 };
  await H.makeThumb(m);
  return m.thumb === m.src ? true : `thumb=${String(m.thumb).slice(0, 24)}`;
});

await TA('T15 확정된 사진은 더 이상 기다림이 아니다', async () => {
  FakeImage.failAll = true;
  const m = img(13);
  await H.makeThumb(m);
  FakeImage.failAll = false;
  return H.thumbWaiting(m) === false && !/vh-thumb-wait/.test(H.thumbImg(m, '')) ? true : '여전히 대기 상태';
});

await TA('T16 ensureThumbs 완주 후 남은 대기 0', async () => {
  reset();
  const ms = [21, 22, 23, 24].map(img);
  H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  await H.ensureThumbs();
  await settle();
  const left = ms.filter(H.thumbWaiting).length;
  return left === 0 ? true : `대기 ${left}장 남음`;
});

console.log('--- ④ 진행 고지: 실제와 같아야 한다 ---');

T('T17 대기가 있으면 진행 문구, 숫자는 실제 남은 수', () => {
  reset();
  const ms = [31, 32, 33, 34, 35].map(img);
  ms[0].thumb = TINY; ms[1].thumb = TINY;
  H.st.medias = ms;
  const s = H.thumbProgressHTML();
  return /2\/5/.test(s) ? true : s || '(빈 문자열)';
});

T('T18 남은 게 없으면 아무 말도 하지 않는다', () => {
  reset();
  const ms = [41, 42].map(img);
  ms.forEach((m) => { m.thumb = TINY; });
  H.st.medias = ms;
  return H.thumbProgressHTML() === '' ? true : '끝났는데 진행 문구가 남았다';
});

T('T19 쌍 자리(전·후) 사진도 진행 수에 든다', () => {
  reset();
  H.st.stage = 'pairs';
  H.st.medias = [];
  H.st.pairs = [{ before: img(51), after: img(52), title: '', resultText: '' }];
  H.st.pairRoles = ['normal'];
  const s = H.thumbProgressHTML();
  return /0\/2/.test(s) ? true : s || '(빈 문자열)';
});

T('T20 영상은 진행 수에 안 든다 (축소 대상이 아니므로)', () => {
  reset();
  H.st.medias = [img(61), { name: 'v', kind: 'video', src: 'data:video/mp4;base64,AAA' }];
  const s = H.thumbProgressHTML();
  return /0\/1/.test(s) ? true : s || '(빈 문자열)';
});

await TA('T21 진행 줄은 스스로 사라진다 (DOM)', async () => {
  reset();
  const body = window.document.querySelector('#pgBody');
  body.innerHTML = '<div class="vh-stage"><div class="vh-rows"></div></div>';
  const ms = [71, 72].map(img);
  H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  H.thumbSyncProgress();
  const during = !!body.querySelector('#vhThumbWait');
  await H.ensureThumbs();
  await settle();
  H.thumbSyncProgress();
  const after = !!body.querySelector('#vhThumbWait');
  return during && !after ? true : `도중 ${during} · 이후 ${after}`;
});

await TA('T22 축소가 끝나면 그 자리 img 만 실그림으로 바뀐다 (전체 재렌더 없음)', async () => {
  reset();
  const body = window.document.querySelector('#pgBody');
  const m = img(81);
  H.st.medias = [m]; H.st.captions = ['']; H.st.roles = ['normal']; H.st.stage = 'media';
  const id = H.mediaUid(m);
  body.innerHTML = `<div class="vh-stage"><div class="vh-rows">${H.thumbImg(m, '')}</div></div>`;
  const node = body.querySelector(`img[data-vh-th="${id}"]`);
  const wasWait = node.classList.contains('vh-thumb-wait');
  await H.ensureThumbs();
  await settle();
  const same = body.querySelector(`img[data-vh-th="${id}"]`) === node;   /* 같은 노드여야 부분 갱신 */
  return wasWait && same && node.getAttribute('src') === TINY && !node.classList.contains('vh-thumb-wait')
    ? true : `대기였음 ${wasWait} · 동일노드 ${same} · src ${String(node.getAttribute('src')).slice(0, 20)}`;
});

console.log('--- ⑤ 무손상: 원본과 빌드 ---');

await TA('T23 축소 후에도 원본 src 는 그대로 (영상 화질 무손상)', async () => {
  reset();
  const ms = [91, 92, 93].map(img);
  const keep = ms.map((m) => m.src);
  H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  await H.ensureThumbs();
  await settle();
  return ms.every((m, i) => m.src === keep[i]) ? true : '원본이 바뀌었다';
});

await TA('T24 빌드 문서에 축소본이 안 샌다 (R71 계약 승계)', async () => {
  reset();
  const ms = [101, 102, 103].map(img);
  H.st.comp = 'cx-slideshow';
  H.st.theme = window.MK_COMPOSE.listThemes()[0].id;
  H.st.title = '봄 소풍';
  H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  await H.ensureThumbs();
  await settle();
  const r = window.MK_SVAR.buildSmart(H.smartTemplateFor(H.st.comp), H.smartInput(), { theme: H.st.theme });
  if (!r || !r.ok || !r.doc) return '빌드 실패: ' + JSON.stringify(r && (r.guide || r.why));
  const doc = JSON.stringify(r.doc);
  if (doc.indexOf(TINY) >= 0) return '축소본이 문서로 샜다';
  const inDoc = ms.filter((m) => doc.indexOf(m.src) >= 0).length;
  return inDoc === ms.length ? true : `문서에 실린 원본 ${inDoc}/${ms.length}`;
});

T('T25 자리표시 이름표(_uid)는 열거되지 않는다 (문서로 안 샌다)', () => {
  const m = img(111);
  H.mediaUid(m);
  return Object.keys(m).indexOf('_uid') < 0 && JSON.stringify(m).indexOf('_uid') < 0 ? true : '이름표가 노출된다';
});

console.log('--- ⑥ R71·R72 승계 ---');

T('T26 R71 캐시 — 같은 입력 재호출은 다시 안 돈다', () => {
  reset();
  H.st.comp = 'cx-slideshow'; H.st.theme = window.MK_COMPOSE.listThemes()[0].id; H.st.title = 'T';
  const ms = [121, 122, 123].map(img);
  H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  H.costFlush();
  const a = H.costStats().miss;
  H.smartPeek(); H.smartPeek(); H.smartPeek();
  const st = H.costStats();
  return st.miss === a + 1 && st.hit >= 2 ? true : JSON.stringify(st);
});

T('T27 R71 캐시 — 역할이 바뀌면 반드시 다시 센다 (옛 숫자 금지)', () => {
  const before = H.costStats().miss;
  H.setRole(0, 'highlight');
  H.smartPeek();
  return H.costStats().miss === before + 1 ? true : '바뀐 입력에 옛 답을 줬다';
});

T('T28 R71 요약 한 줄 단일 출처 유지', () => typeof H.smartLineHTML === 'function' ? true : 'smartLineHTML 없음');

T('T29 R72 간결 구성 — 쌍 12 는 상한 안에 든다', () => {
  const S = window.MK_SVAR, M = window.MK_MANIFEST, C = window.MK_COMPOSE;
  const tpl = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && c.pairMode; }) || {}).id;
  const pairs = Array.from({ length: 12 }, (_, i) => ({ before: img(200 + i * 2), after: img(201 + i * 2), title: '쌍' + i, resultText: '' }));
  const r = S.buildSmart(tpl, { pairs, texts: { title: 'T', result: 'R' }, ratio: '16:9' }, {});
  if (!r || !r.ok || !r.doc) return '빌드 실패: ' + JSON.stringify(r && (r.guide || r.why));
  const total = Math.round(r.doc.scenes.reduce((a, x) => a + x.duration, 0) * 10) / 10;
  return total <= 60 ? true : '총길이 ' + total;
});

T('T30 R72 간결 구성에서도 사진은 한 장도 안 잃는다', () => {
  const S = window.MK_SVAR, M = window.MK_MANIFEST, C = window.MK_COMPOSE;
  const tpl = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && c.pairMode; }) || {}).id;
  const pairs = Array.from({ length: 12 }, (_, i) => ({ before: img(300 + i * 2), after: img(301 + i * 2), title: '쌍' + i, resultText: '' }));
  const r = S.buildSmart(tpl, { pairs, texts: { title: 'T', result: 'R' }, ratio: '16:9' }, {});
  if (!r || !r.ok || !r.doc) return '빌드 실패: ' + JSON.stringify(r && (r.guide || r.why));
  const used = new Set(r.doc.scenes.flatMap((x) => (x.elements || []).filter((e) => e.kind === 'image' && e.src).map((e) => e.src)));
  return used.size === 24 ? true : '실린 사진 ' + used.size + '/24';
});

T('T31 자리표시가 떠 있는 동안에도 빌드는 원본으로 돈다', () => {
  reset();
  H.st.comp = 'cx-slideshow'; H.st.theme = window.MK_COMPOSE.listThemes()[0].id; H.st.title = 'T';
  const ms = [401, 402, 403].map(img);
  H.st.medias = ms; H.st.captions = ms.map(() => ''); H.st.roles = ms.map(() => 'normal'); H.st.stage = 'media';
  const left = ms.filter(H.thumbWaiting).length;          /* 아직 축소 전 */
  const r = window.MK_SVAR.buildSmart(H.smartTemplateFor(H.st.comp), H.smartInput(), { theme: H.st.theme });
  if (!r || !r.ok || !r.doc) return '빌드 실패: ' + JSON.stringify(r && (r.guide || r.why));
  const doc = JSON.stringify(r.doc);
  return left === 3 && ms.every((m) => doc.indexOf(m.src) >= 0) ? true : `대기 ${left} · 원본 반영 실패`;
});

console.log('--- ⑦ 실측 정직성 ---');

const before = JSON.parse(fs.readFileSync(path.join(ROOT, 'report/_perf73-before.json'), 'utf8'));
const after = JSON.parse(fs.readFileSync(path.join(ROOT, 'report/_perf73-after.json'), 'utf8'));
const row = (d, cpu, n) => d.rows.find((r) => r.cpu === cpu && r.n === n);

T('T32 실측 저장본 존재 — 전·후 같은 조합 (스로틀 3 × 장수 2)', () => {
  const key = (d) => d.rows.map((r) => r.cpu + 'x' + r.n).join(',');
  return before.rows.length === 6 && key(before) === key(after) ? true : `${key(before)} / ${key(after)}`;
});

T('T33 측정 조건이 태블릿 규격으로 기록돼 있다', () =>
  before.viewport === '1280x800@2x' && after.viewport === '1280x800@2x' ? true : `${before.viewport} / ${after.viewport}`);

T('T34 첫 렌더 HTML — 원본 유출이 실제로 끊겼다 (6배·30장)', () => {
  const b = row(before, 6, 30), a = row(after, 6, 30);
  return b.firstHtmlKB > 50000 && a.firstHtmlKB < 200 ? true : `${b.firstHtmlKB}KB → ${a.firstHtmlKB}KB`;
});

T('T35 업로드→목록이 저사양에서 실제로 짧아졌다 (6배·30장)', () => {
  const b = row(before, 6, 30), a = row(after, 6, 30);
  return a.usableMs < b.usableMs / 5 ? true : `${b.usableMs}ms → ${a.usableMs}ms`;
});

T('T36 4배(중급 태블릿)에서도 같은 방향', () => {
  const b = row(before, 4, 30), a = row(after, 4, 30);
  return a.usableMs < b.usableMs / 3 && a.firstHtmlKB < 200 ? true : `${b.usableMs}→${a.usableMs}ms · ${a.firstHtmlKB}KB`;
});

T('T37 기준선(1배)도 나빠지지 않았다', () => {
  const b = row(before, 1, 30), a = row(after, 1, 30);
  return a.usableMs <= b.usableMs ? true : `${b.usableMs}ms → ${a.usableMs}ms`;
});

T('T38 R71 성과(★클릭)가 저사양에서 유지된다 — 어느 조합도 20ms 미만', () => {
  const bad = after.rows.filter((r) => r.clickBlockMs == null || r.clickBlockMs >= 20);
  return bad.length === 0 ? true : bad.map((r) => `${r.cpu}x/${r.n}:${r.clickBlockMs}ms`).join(' ');
});

T('T39 안정 상태 HTML 은 전·후 동일 (축소 후 화면은 안 바뀐다)', () => {
  const bad = [1, 4, 6].filter((c) => Math.abs(row(before, c, 30).settledHtmlKB - row(after, c, 30).settledHtmlKB) > 5);
  return bad.length === 0 ? true : '차이 나는 스로틀: ' + bad.join(',');
});

T('T40 축소 배경 비용은 늘었다 — 숨기지 않고 기록한다', () => {
  const b = row(before, 6, 30), a = row(after, 6, 30);
  /* 전에는 첫 페인트가 30장을 이미 해독해 둔 뒤라 축소가 그 캐시를 탔다.
     이제 그 원가가 배경으로 옮겨왔다 — 늘어난 게 정상이고, 그렇게 적어야 한다. */
  return a.thumbMs > b.thumbMs ? true : `${b.thumbMs}ms → ${a.thumbMs}ms (예상과 다름 — 보고서 문구 재검토)`;
});

T('T41 그럼에도 「다 준비되기까지」 총합은 줄었다 (6배·30장)', () => {
  const b = row(before, 6, 30), a = row(after, 6, 30);
  const tb = b.usableMs + b.thumbMs, ta = a.usableMs + a.thumbMs;
  return ta < tb ? true : `${Math.round(tb)}ms → ${Math.round(ta)}ms`;
});

T('T42 페이지 오류 0 (전·후 양쪽)', () =>
  (before.errs || []).length === 0 && (after.errs || []).length === 0 ? true : JSON.stringify([before.errs, after.errs]));

console.log(`\n${fail ? '❌' : '✅'}  R73  ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
