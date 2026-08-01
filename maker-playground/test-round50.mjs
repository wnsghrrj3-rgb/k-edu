/* R50 — MK_COMPOSE 비디오 템플릿 엔진 코어 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));
load('data/animations.js'); load('data/render.js'); load('data/caption.js');
load('data/compose.js'); load('data/compositions.js');

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const C = window.MK_COMPOSE;
const mk = (n, o = {}) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: o.kind || 'image', src: 'data:image/png;base64,' + i, w: o.w ?? (i % 2 ? 800 : 600), h: o.h ?? (i % 2 ? 600 : 800), ...(o.dur ? { duration: o.dur } : {}) }));

T('엔진 감사 — 전 Composition 결정론·스키마·미디어 무버림', () => {
  const a = C.audit();
  A(a.ok, JSON.stringify(a.violations.slice(0, 4)));
  A(a.compositions >= 1 && a.themes >= 2, 'comp=' + a.compositions + ' th=' + a.themes);
});

T('미디어 0장 = 가짜 성공 없이 명시적 안내', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: [] });
  A(!r.ok && r.why === 'no-media' && /골라/.test(r.guide), JSON.stringify(r));
});

T('미디어 수 → 씬 수 자동 (1·3·5·10·20장)', () => {
  const counts = [1, 3, 5, 10, 20].map((n) => C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(n), texts: { title: '여행' } }).sceneCount);
  for (let i = 1; i < counts.length; i++) A(counts[i] > counts[i - 1], counts.join(','));
});

T('전 미디어 배치 — 20장도 버리지 않는다', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(20), texts: { title: 'T' } });
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 20, 'placed=' + placed);
});

T('16장 이상 = 2분할 레이아웃 등장', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(18), texts: { title: 'T' } });
  A(r.doc.scenes.some((s) => s.elements.filter((e) => e.src).length >= 2), 'no-multi');
  const r5 = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(5), texts: { title: 'T' } });
  A(r5.doc.scenes.every((s) => s.elements.filter((e) => e.src).length <= 1), 'multi-at-5');
});

T('제목 없으면 Title 씬 자동 생략', () => {
  const w = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(4), texts: { title: '있음' } });
  const wo = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(4), texts: {} });
  A(w.doc.scenes.some((s) => s.role === 'title') && !wo.doc.scenes.some((s) => s.role === 'title'),
    'w=' + w.sceneCount + ' wo=' + wo.sceneCount);
  A(wo.notes.some((n) => /생략.*title/.test(n)), '생략 미보고');
});

T('빈 미디어 프레임 노출 0 (지시서 §24)', () => {
  for (const n of [1, 2, 3, 7]) {
    const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(n), texts: { title: 'T' } });
    for (const s of r.doc.scenes) for (const el of s.elements)
      A(el.kind !== 'image' || el.src || el.fill, n + '장:빈 프레임 ' + s.id);
  }
});

T('variant 순환 — 복제 씬이 전부 동일하지 않다 (mirror·애니 방향 교차)', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(6), texts: { title: 'T' } });
  const photos = r.doc.scenes.filter((s) => s.role === 'media');
  A(photos.length >= 4, 'photos=' + photos.length);
  const dirs = new Set(photos.map((s) => s.elements[0].anim.direction));
  A(dirs.size >= 2, '애니 방향 단일: ' + [...dirs]);
});

T('텍스트 fit — 축소 → 초과 시 다음 씬 분할, 화면 이탈 0', () => {
  const short = C.fitText('안녕', { maxCh: 12, maxLines: 2 });
  A(short.scale === 1 && !short.rest);
  const mid = C.fitText('조금 길어서 반드시 줄어들어야만 하는 다소 긴 제목 문장입니다', { maxCh: 12, maxLines: 2 });
  A(mid.scale < 1 && mid.scale >= 0.6 && !mid.rest, JSON.stringify(mid));
  const long = C.fitText('아주 긴 문장. '.repeat(12), { maxCh: 12, maxLines: 2 });
  A(long.rest && long.rest.length > 0, '분할 안 됨');
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3), texts: { title: '아주아주아주 긴 제목이라서 도저히 한 장면에 다 들어갈 수 없는 문장을 넣어 봅니다 정말로 길게 씁니다 계속' } });
  const titles = r.doc.scenes.filter((s) => s.role === 'title');
  A(titles.length >= 2, '분할 씬 미생성: ' + titles.length);
});

T('한글·영문 가중 길이 (지시서 §8-7)', () => {
  A(C.textLen('가나다') === 3 && Math.abs(C.textLen('abc') - 1.65) < 0.01, C.textLen('abc'));
});

T('media-aware duration — 영상 길이 반영·min/max 클램프', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3, { kind: 'video', dur: 3.4 }), texts: { title: 'T' } });
  const ph = r.doc.scenes.find((s) => s.role === 'media');
  A(ph.duration === 3.4, 'dur=' + ph.duration);
  const r2 = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3, { kind: 'video', dur: 30 }), texts: { title: 'T' } });
  A(r2.doc.scenes.find((s) => s.role === 'media').duration === 4, '클램프 실패');
});

T('비율 대응 — 4비율 캔버스 + 9:16 레이아웃 override 실적용', () => {
  for (const [ratio, d] of Object.entries(C.RATIOS)) {
    const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(4), texts: { title: 'T' }, ratio });
    A(r.doc.scenes[0].width === d.w && r.doc.scenes[0].height === d.h, ratio);
  }
  const v = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(18), texts: { title: 'T' }, ratio: '9:16' });
  const multi = v.doc.scenes.find((s) => s.elements.filter((e) => e.src).length >= 2);
  A(multi && multi.elements.filter((e) => e.src).every((e) => e.w === 100), '9:16 상하분할 아님');
});

T('Theme 교체 = 같은 구조, 다른 디자인 (지시서 §2-1)', () => {
  const inp = { medias: mk(5), texts: { title: '제목' } };
  const a = C.buildProject('cx-slideshow', 'th-minimal', inp);
  const b = C.buildProject('cx-slideshow', 'th-bold', inp);
  A(a.sceneCount === b.sceneCount, '구조 변형');
  A(a.doc.scenes.map((s) => s.role).join() === b.doc.scenes.map((s) => s.role).join(), '역할 순서 변형');
  A(JSON.stringify(a.doc.scenes) !== JSON.stringify(b.doc.scenes), '디자인 동일');
  const bgA = a.doc.scenes.find((s) => s.role === 'outro').background;
  const bgB = b.doc.scenes.find((s) => s.role === 'outro').background;
  A(bgA !== bgB, '테마 미반영');
});

T('doc 스키마 호환 — MK_RENDER 실렌더 + MK_CAPTION 적용 + 총길이', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(4), texts: { title: '호환' } });
  for (const s of r.doc.scenes) {
    const svg = window.MK_RENDER.toSVG(window.MK_RENDER.renderScene(s, {}));
    A(/^<svg/.test(svg), '렌더 실패 ' + s.id);
  }
  const cap = window.MK_CAPTION.apply(r.doc.scenes[0], 'scrim-bottom');
  A(cap && cap.ok !== false, '자막 비호환');
  A(Math.abs(r.total - r.doc.scenes.reduce((a2, s) => a2 + s.duration, 0)) < 0.01, '총길이 불일치');
});

T('원본 템플릿 불변 (지시서 §14) — build 후 Composition 정의 무변', () => {
  const before = JSON.stringify(C.getComposition('cx-slideshow'));
  C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(7), texts: { title: 'T' } });
  A(JSON.stringify(C.getComposition('cx-slideshow')) === before, '원본 오염');
});

T('선택 화면 메타 — 권장 수·길이·비율 노출 준비', () => {
  const list = C.listCompositions();
  A(list.length >= 1 && list[0].recommendedMediaCount && list[0].recommendedDuration && list[0].supportedRatios.length === 4, JSON.stringify(list[0]));
});

console.log(`\nR50: ${pass}/${pass + fail} ${fail ? 'FAIL' : 'ALL PASS'}`);
process.exit(fail ? 1 : 0);
