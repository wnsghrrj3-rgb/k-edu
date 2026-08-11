/* Round 16 — Universal Render Engine & Export System 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/export' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const R = window.MK_RENDER;
const TPLS = window.MK_SAMPLE.TEMPLATES;
let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name); } };
const sec = (n) => console.log('—', n);

/* ============ 1. Render Pipeline · Display List ============ */
sec('Render Pipeline');
const s1 = TPLS[0].scenes[0];
const dl = R.renderScene(s1);
T('DL 생성', dl && Array.isArray(dl.ops) && dl.ops.length > 3);
T('배경 op 첫번째', dl.ops[0].role === 'background');
T('크기 유지', dl.width === 1280 && dl.height === 720);
T('해시 결정론', R.sceneHash(s1) === R.sceneHash(JSON.parse(JSON.stringify(s1))));
const dl2 = R.renderScene(s1);
T('동일 입력 → 동일 DL(캐시)', dl === dl2);
T('타임라인 포함', dl.timeline && dl.timeline.tracks.length === s1.elements.length);
const proj = R.renderProject(TPLS[0]);
T('프로젝트 렌더 = scene 수', proj.pages.length === TPLS[0].scenes.length);
T('order 정렬', proj.pages[0].sceneId === 's1');

/* ============ 2. Typography Engine ============ */
sec('Typography');
/* R115 — 여기 있던 계약은 "한글 폭 1em"이었다. 그게 틀린 가정이라는 게
   R115 가 잡은 것이다: 실폰트(fontkit·hmtx advance)에서 한글은 어떤 글꼴에서도
   1.0em 이 아니다(0.624~0.940). 기본 글꼴 프리텐다드는 0.864 다.
   계약을 지우는 게 아니라 정본에 맞춰 다시 쓴다 — 폭은 이제 글꼴에서 온다. */
T('한글 폭 = 글꼴 실측 (프리텐다드 0.864em)', R.measure('가', 10) === R.metricsOf('Pretendard').han * 10);
T('한글 폭이 1em 이 아니다', R.measure('가', 10) < 10);
T('라틴 소문자 폭', R.measure('a', 10) < 6);
T('줄바꿈 발생', R.wrap('가나다 라마바 사아자', 25, 10).length >= 2);
T('개행 유지', R.wrap('한\n줄\n씩', 500, 10).length === 3);
T('긴 단어 강제 분할', R.wrap('가나다라마바사아자차카', 40, 10).length >= 3);
const auto = R.layoutText({ text: '아주아주 긴 문장이 상자를 넘어가면 자동으로 줄어들어야 한다 반드시', sizePx: 40, overflow: 'autoresize' }, { w: 200, h: 60 }, () => {});
T('autoresize 축소', auto.size < 40);
const ell = R.layoutText({ text: '한 줄\n두 줄\n세 줄\n네 줄', sizePx: 20, overflow: 'ellipsis' }, { w: 400, h: 45 }, () => {});
T('ellipsis 말줄임', ell.lines.length <= 2 && ell.lines[ell.lines.length - 1].endsWith('…'));
const bullet = R.layoutText({ text: '하나\n둘', sizePx: 14, list: 'bullet' }, { w: 400, h: 200 }, () => {});
T('bullet 접두', bullet.lines[0].startsWith('· '));
const num = R.layoutText({ text: '하나\n둘', sizePx: 14, list: 'number' }, { w: 400, h: 200 }, () => {});
T('number 접두', num.lines[1].startsWith('2. '));

/* ============ 3. Font · Asset Resolver ============ */
sec('Resolver');
T('로컬 폰트', R.resolveFont('Pretendard').source === 'local');
T('구글 폰트', R.resolveFont('Noto Sans KR').source === 'google');
let fw = []; const ff = R.resolveFont('없는폰트', (c, m) => fw.push(c));
T('없는 폰트 → 폴백+경고', ff.missing && ff.family === 'Pretendard' && fw[0] === 'missing-font');
let aw = []; const broken = R.resolveAsset('as-없는것', (c) => aw.push(c));
T('끊긴 참조 경고', broken.broken && aw[0] === 'broken-reference');
const real = window.MK_DAM.list()[0];
T('DAM Reference 해석', R.resolveAsset(real.id, () => {}).id === real.id);

/* ============ 4. Vector · Layout ============ */
sec('Vector · Layout');
T('rect path', R.VEC.rect(0, 0, 10, 10).startsWith('M0 0'));
T('rounded rect Q', R.VEC.rect(0, 0, 20, 20, 5).includes('Q'));
T('ellipse A', R.VEC.ellipse(0, 0, 10, 10).includes('A'));
T('polygon 닫힘', R.VEC.polygon(0, 0, 10, 10, 6).endsWith('Z'));
T('star 꼭짓점 2n', (R.VEC.star(0, 0, 10, 10, 5).match(/L/g) || []).length === 9);
T('bezier Q', R.VEC.bezier([[0, 0], [5, 5], [10, 0]]).includes('Q'));
let bw = []; R.VEC.boolean('subtract', 'M0 0', 'M1 1', (c) => bw.push(c));
T('boolean subtract 미지원 경고', bw[0] === 'unsupported-effect');
/* Flex AutoLayout */
const flexScene = { id: 'fx', width: 1000, height: 500, elements: [
  { kind: 'image', fill: '#eee', x: 10, y: 10, w: 80, h: 60, layout: { mode: 'row', gap: 20, padding: 20, align: 'center' }, children: [1, 2] },
  { kind: 'image', fill: '#aaa', x: 0, y: 0, w: 10, h: 20 },
  { kind: 'image', fill: '#bbb', x: 0, y: 0, w: 10, h: 20 },
] };
const fdl = R.renderScene(flexScene, { noCache: true });
const kids = fdl.ops.filter((o) => o.style.fill === '#aaa' || o.style.fill === '#bbb');
T('flex row 재배치', kids[1].frame.x > kids[0].frame.x + kids[0].frame.w);
T('flex align center', Math.abs((kids[0].frame.y + kids[0].frame.h / 2) - (10 * 5 + 60 * 5 / 2)) < 60);
/* Grid */
const gridScene = { id: 'gd', width: 1000, height: 500, elements: [
  { kind: 'image', fill: '#eee', x: 0, y: 0, w: 100, h: 100, layout: { mode: 'grid', cols: 2, gap: 10 }, children: [1, 2, 3, 4] },
  ...[1, 2, 3, 4].map(() => ({ kind: 'image', fill: '#ccc', x: 0, y: 0, w: 10, h: 10 })),
] };
const gdl = R.renderScene(gridScene, { noCache: true });
const gk = gdl.ops.filter((o) => o.style.fill === '#ccc');
T('grid 2열 4칸', gk.length === 4 && gk[0].frame.y === gk[1].frame.y && gk[2].frame.y > gk[0].frame.y);
/* Constraint */
const cScene = { id: 'ct', width: 1000, height: 500, elements: [{ kind: 'image', fill: '#111', x: 0, y: 0, w: 10, h: 10, constraints: { right: 5, bottom: 5 } }] };
const cdl = R.renderScene(cScene, { noCache: true });
T('constraint right/bottom 핀', cdl.ops[1].frame.x === 1000 - 50 - 100 && cdl.ops[1].frame.y === 500 - 25 - 50);

/* ============ 5. Effect · Image ============ */
sec('Effect · Image');
const fxScene = { id: 'fx2', width: 100, height: 100, elements: [
  { kind: 'image', fill: '#123456', x: 0, y: 0, w: 50, h: 50, effects: { dropShadow: {}, blend: 'multiply' } },
  { kind: 'image', fill: '#654321', x: 0, y: 0, w: 50, h: 50, effects: { noise: true } },
] };
const xdl = R.renderScene(fxScene, { noCache: true });
T('dropShadow filter def', xdl.defs.some((d) => d.includes('feDropShadow')));
T('blend mode 부여', xdl.ops[1].style['mix-blend-mode'] === 'multiply');
T('noise → unsupported 경고', xdl.warnings.some((w) => w.code === 'unsupported-effect'));
const imScene = { id: 'im', width: 100, height: 100, elements: [{ kind: 'image', assetId: real.id, x: 0, y: 0, w: 50, h: 50, mask: 'ellipse', filters: { brightness: 1.2, blur: 2 } }] };
const idl = R.renderScene(imScene, { noCache: true });
T('mask clipPath def', idl.defs.some((d) => d.includes('clipPath')));
T('이미지 필터 CSS', idl.ops[1].cssFilter.includes('brightness') && idl.ops[1].cssFilter.includes('blur'));

/* ============ 6. Animation Engine ============ */
sec('Animation');
const tl = dl.timeline;
T('stagger 지연 증가', tl.tracks[1].t0 > tl.tracks[0].t0);
const st0 = R.sampleTrack(tl.tracks[0], 0);
const st1 = R.sampleTrack(tl.tracks[0], 99);
T('t=0 등장 전', st0.opacity < 0.05);
T('t=끝 완성', st1.opacity === 1 && st1.dx === 0 && st1.dy === 0);
const slide = R.sampleTrack({ t0: 0, dur: 1, preset: 'slide', ease: 'linear', dir: 'up' }, 0.5);
T('slide 중간 dy>0', slide.dy > 0 && slide.opacity === 0.5);
const adl = R.renderScene(s1, { time: 0.05, noCache: true });
T('t 샘플 렌더 — opacity 반영', adl.ops.slice(1).some((o) => o.style.opacity < 1));

/* ============ 7. SVG · HTML · JSON Adapter ============ */
sec('SVG · HTML · JSON');
const svg = R.toSVG(dl);
T('SVG 루트·viewBox', svg.startsWith('<svg') && svg.includes('viewBox="0 0 1280 720"'));
T('SVG 텍스트 tspan', svg.includes('<tspan'));
T('SVG XML 파싱', !new window.DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror'));
T('SVG 결정론', R.toSVG(R.renderScene(s1)) === svg);
const pages = R.renderProject(TPLS[0]).pages;
const htmlOut = R.toHTML(pages, { title: '테스트' });
T('HTML doctype·페이저', htmlOut.startsWith('<!doctype') && htmlOut.includes('id="nx"'));
T('HTML 페이지 수', (htmlOut.match(/class="pg/g) || []).length >= pages.length);
const json = JSON.parse(R.ADAPTERS.json(pages, {}).files[0].text);
T('JSON 왕복', json.pages.length === pages.length && json.engine.includes('MK_RENDER'));

/* ============ 8. PPTX Adapter — ZIP·OOXML 실검증 ============ */
sec('PPTX');
const px = R.toPPTX(pages);
T('ZIP 시그니처 PK', px.bytes[0] === 0x50 && px.bytes[1] === 0x4B);
T('슬라이드 수', px.slides === pages.length);
T('필수 파트', ['[Content_Types].xml', '_rels/.rels', 'ppt/presentation.xml', 'ppt/slides/slide1.xml', 'ppt/theme/theme1.xml'].every((n) => px.entries.includes(n)));
/* EOCD 역파싱 — 중앙 디렉터리 엔트리 수 일치 */
const b = px.bytes; let eocd = -1;
for (let i = b.length - 22; i >= 0; i--) if (b[i] === 0x50 && b[i + 1] === 0x4B && b[i + 2] === 5 && b[i + 3] === 6) { eocd = i; break; }
T('EOCD 존재', eocd > 0);
T('CD 엔트리 수 일치', (b[eocd + 10] | b[eocd + 11] << 8) === px.entries.length);
T('이미지 폴백 정직 경고', px.warnings.some((w) => w.msg.includes('이미지')));
fs.mkdirSync('/tmp/r16', { recursive: true });
fs.writeFileSync('/tmp/r16/out.pptx', Buffer.from(px.bytes));

/* ============ 9. PDF Adapter ============ */
sec('PDF');
const pdf = R.toPDF(pages, { paper: 'a4', bleed: 3, cropMarks: true });
T('PDF 헤더·EOF', pdf.bytes.startsWith('%PDF-1.4') && pdf.bytes.trimEnd().endsWith('%%EOF'));
T('페이지 수', pdf.pages === pages.length);
T('xref·trailer', pdf.bytes.includes('xref') && pdf.bytes.includes('/Root'));
T('TrimBox(재단)', pdf.bytes.includes('/TrimBox'));
T('벡터 rect op', pdf.bytes.includes(' re f'));
T('한글 폰트 정직 경고', pdf.warnings.some((w) => w.code === 'missing-font'));
const pdfC = R.toPDF([pages[0]], { cmyk: true });
T('CMYK 연산자 k', pdfC.bytes.includes(' k\n') || / k$/m.test(pdfC.bytes));
const latin = R.renderScene({ id: 'lt', width: 200, height: 100, elements: [{ kind: 'text', x: 5, y: 20, w: 90, size: 12, text: 'Hello PDF' }] }, { noCache: true });
T('라틴 벡터 텍스트 Tj', R.toPDF([latin]).bytes.includes('(Hello PDF) Tj'));

/* ============ 10. Raster · Video ============ */
sec('Raster · Video');
const rp = R.toRaster(dl, { format: 'png', scale: 3, transparent: true, planOnly: true });
T('PNG 플랜 3x', rp.plan.width === 3840 && rp.plan.transparent === true);
const rj = R.toRaster(dl, { format: 'jpg', scale: 2, quality: 0.8, planOnly: true });
T('JPG 품질·투명 불가', rj.plan.quality === 0.8 && rj.plan.transparent === false);
T('스케일 상한 4x', R.toRaster(dl, { scale: 9, planOnly: true }).plan.scale === 4);
T('타일 플랜', R.tilePlan(2048, 1024, 512).length === 8);
const vp = R.toVideoPlan(pages, { fps: 30, full: true });
T('30fps 프레임 수', vp.total === Math.round(vp.duration * 30));
T('60fps 두 배', R.toVideoPlan(pages, { fps: 60, full: true }).total === vp.total * 2);
T('프레임 scene 매핑', vp.frames[0].scene === 0 && vp.frames[vp.total - 1].scene === pages.length - 1);

/* ============ 11. Preset · Adapter Registry ============ */
sec('Preset · Registry');
T('프리셋 9종', R.PRESETS.length === 9);
T('print-a3 = CMYK+재단', (() => { const p = R.PRESETS.find((x) => x.key === 'print-a3'); return p.opts.cmyk && p.opts.cropMarks && p.format === 'pdf'; })());
T('어댑터 8종 기본 등록', Object.keys(R.ADAPTERS).length === 8);
R.registerAdapter('txt', (pgs) => ({ files: [{ name: 'a.txt', text: pgs.map((p) => p.ops.filter((o) => o.op === 'text').map((o) => o.lines.join(' ')).join('\n')).join('\n---\n') }] }));
T('신규 어댑터 즉시 동작', R.ADAPTERS.txt(pages).files[0].text.includes('물의 여행'));

/* ============ 12. Export Queue ============ */
sec('Export Queue');
R.clearQueue(); R.cache.clear();
const j1 = R.enqueue({ format: 'svg', title: 'A', scenes: TPLS[0].scenes, priority: 3 });
const j2 = R.enqueue({ format: 'pptx', title: 'B', scenes: TPLS[1].scenes, priority: 9 });
T('우선순위 정렬', R.queue()[0].id === j2);
let prog = [];
R.step(j2, 40); prog.push(R.queue().find((j) => j.id === j2).progress);
R.step(j2, 40); prog.push(R.queue().find((j) => j.id === j2).progress);
T('진행률 증가', prog[0] === 40 && prog[1] === 80);
R.step(j2, 40);
T('완료 시 결과물', (() => { const j = R.queue().find((x) => x.id === j2); return j.status === 'done' && j.result.files[0].bin.length > 1000; })());
const j3 = R.enqueue({ format: 'svg', title: 'C', scenes: TPLS[2].scenes });
R.cancel(j3);
T('취소', R.queue().find((j) => j.id === j3).status === 'cancelled');
R.retry(j3); R.runAll();
T('재시도 후 완료', R.queue().find((j) => j.id === j3).status === 'done');
const jb = R.enqueue({ format: 'nope', title: 'X', scenes: TPLS[0].scenes });
R.runAll();
T('없는 포맷 → error', R.queue().find((j) => j.id === jb).status === 'error');
R.retry(jb); T('error 재시도 → queued', R.queue().find((j) => j.id === jb).status === 'queued');
R.cancel(jb);
R.clearQueue();
const ids = R.batch(TPLS.slice(0, 4), 'svg', {});
R.runAll();
T('배치 4건 전량 완료', ids.length === 4 && R.queue().every((j) => j.status === 'done'));
T('작업별 경고 수집', R.queue().every((j) => Array.isArray(j.warnings)));

/* ============ 13. Cache · Incremental ============ */
sec('Cache');
R.cache.clear();
R.renderScene(s1); const m1 = R.cache.stats.miss;
R.renderScene(s1); const h1 = R.cache.stats.hit;
T('두번째 렌더 캐시 적중', h1 >= 1 && R.cache.stats.miss === m1);
R.cache.invalidate(s1.id);
R.renderScene(s1);
T('invalidate 후 재계산', R.cache.stats.miss > m1);
const mutated = JSON.parse(JSON.stringify(s1)); mutated.elements[3].text = '수정됨';
T('내용 변경 → 다른 해시(증분 판정)', R.sceneHash(mutated) !== R.sceneHash(s1));

/* ============ 14. 스케일 — 100 Page · 5000 Object ============ */
sec('Scale');
const bigDoc = { title: '스케일', scenes: Array.from({ length: 100 }, (_, i) => ({
  id: 'bg' + i, order: i, width: 1280, height: 720, background: '#FFFFFF', duration: 2,
  elements: Array.from({ length: 50 }, (_, k) => k % 3 === 0
    ? { kind: 'text', x: (k * 7) % 90, y: (k * 11) % 85, w: 20, size: 2.4, text: '항목 ' + i + '-' + k }
    : { kind: 'image', fill: '#' + ((k * 999 + i * 77) % 0xFFFFFF).toString(16).padStart(6, '0'), x: (k * 13) % 88, y: (k * 17) % 80, w: 10, h: 8 }),
})) };
R.cache.clear();
let t0 = Date.now();
const bigPages = R.renderProject(bigDoc);
const renderMs = Date.now() - t0;
T('100페이지·5000오브젝트 렌더', bigPages.pages.length === 100 && bigPages.pages.reduce((s, p) => s + p.ops.length, 0) >= 5000);
t0 = Date.now();
const bigPptx = R.toPPTX(bigPages.pages);
const pptxMs = Date.now() - t0;
T('100페이지 PPTX 생성', bigPptx.slides === 100 && bigPptx.bytes.length > 100000);
t0 = Date.now();
const bigPdf = R.toPDF(bigPages.pages);
const pdfMs = Date.now() - t0;
T('100페이지 PDF 생성', bigPdf.pages === 100);
console.log(`  (성능 실측: 렌더 ${renderMs}ms · PPTX ${pptxMs}ms · PDF ${pdfMs}ms)`);

/* ============ 15. Export Studio 화면 ============ */
sec('Export Studio (#/export)');
const body = window.document.getElementById('pgBody');
const scr = window.MK_SCREENS.export;
R.clearQueue();
try { body.innerHTML = scr.render('A'); scr.mount(body); T('화면 렌더+마운트', true); } catch (e) { T('화면 렌더+마운트 — ' + e.message, false); }
T('라이브 SVG 미리보기', !!body.querySelector('#exCanvas svg'));
T('소스·포맷·프리셋 UI', body.querySelectorAll('[data-ex-src]').length >= 5 && body.querySelectorAll('[data-ex-fmt]').length === 8 && body.querySelectorAll('[data-ex-preset]').length === 9);
body.querySelector('[data-ex-fmt="pdf"]').click();
T('PDF 옵션 전환(용지·재단)', !!body.querySelector('[data-ex-paper]') && !!body.querySelector('[data-ex-bleed]'));
body.querySelector('[data-ex-run]').click();
R.runAll();
T('내보내기 버튼 → 큐 완료', R.queue().length >= 1 && R.queue()[0].status === 'done');
body.innerHTML = scr.render('A'); scr.mount(body);
T('완료 작업 저장 버튼 노출', !!body.querySelector('[data-ex-dl]'));

/* ============ 16. 완료 조건 — 단일 파이프라인 보증 ============ */
sec('완료 조건');
const one = R.renderScene(TPLS[3].scenes[0], { noCache: true });
const outs = { svg: R.toSVG(one), pdf: R.toPDF([one]).bytes, pptx: R.toPPTX([one]).slides, html: R.toHTML([one]), video: R.toVideoPlan([one]).total };
T('같은 DL → 5포맷 전부 산출', outs.svg.length > 100 && outs.pdf.length > 300 && outs.pptx === 1 && outs.html.length > 500 && outs.video > 0);
T('어댑터만 추가하면 확장(레지스트리)', typeof R.registerAdapter === 'function' && R.ADAPTERS.txt);

console.log(`\nRound 16: ${pass}/${pass + fail} 통과${fail ? ' · 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
