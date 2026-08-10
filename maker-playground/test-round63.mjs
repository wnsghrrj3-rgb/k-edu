/* R63 — Template Manifest Engine: Registry·Rules 컴파일·Migration 동일성·Smart Variant·Validation */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/video' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) { if (/^https?:/.test(f)) continue; const p = f.replace(/^\//, ''); if (!fs.existsSync(p) && !fs.existsSync(f)) continue; window.eval(fs.readFileSync(fs.existsSync(p) ? p : f, 'utf8')); }
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
window.alert = () => {}; window.confirm = () => true;

const C = window.MK_COMPOSE, M = window.MK_MANIFEST, R = window.MK_RENDER;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assert'); };
const img = (i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: i % 2 ? 800 : 600, h: i % 2 ? 600 : 800 });
const mk = (n) => Array.from({ length: n }, (_, i) => img(i));
const renderAll = (r) => r.doc.scenes.forEach((s) => { const svg = R.toSVG(R.renderScene(s, { noCache: true })); A(/^<svg/.test(svg), '렌더 실패 ' + s.id); });

/* ---------- 1. Registry — Layout·Animation·Transition·Template ---------- */
T('Registry 4종 존재 — Layout 9+·Animation 8·Transition 6·Template 3', () => {
  A(M.listLayouts().length >= 9, 'layouts=' + M.listLayouts().length);
  for (const id of ['full-media', 'framed-center', 'media-left', 'media-right', 'hero', 'split', 'stack', 'collage', 'gallery'])
    A(M.getLayout(id), '레이아웃 누락: ' + id);
  A(M.listAnimations().length >= 8, 'anims=' + M.listAnimations().length);
  A(M.listTransitions().length >= 6, 'transitions=' + M.listTransitions().length);
  const tpls = M.listTemplates().map((t) => t.id);
  for (const id of ['tm-slideshow', 'tm-beforeafter', 'tm-magazine']) A(tpls.includes(id), '템플릿 누락: ' + id);
});

T('계층 원칙 — Layout 은 프레임만·Theme 는 시각만 (교차 오염 0)', () => {
  for (const id of M.listLayouts()) {
    const L = M.getLayout(id);
    A(!L.tokens && !L.transitions && !L.color, id + ': Layout 에 Theme 속성');
    A(!L.preset && !L.anim, id + ': Layout 에 Animation 속성');
  }
  for (const t of C.listThemes().map((x) => C.getTheme(x.id))) {
    A(!t.scenes && !t.mediaSlots, t.id + ': Theme 이 Scene 을 안다');
  }
});

/* ---------- 2. Migration — 슬라이드쇼 rules 컴파일 = 기존 mediaPlan 완전 동일 ---------- */
T('Migration 동일성 — 컴파일된 플랜 = 기존 플랜 (4비율 × n=1..24 × 캡션 3패턴)', () => {
  const comp = C.getComposition('cx-slideshow');
  A(comp._legacyMediaPlan, 'legacy 미보존');
  A(comp.manifestId === 'tm-slideshow', 'manifest 미귀속');
  let checked = 0;
  for (const ratio of Object.keys(C.RATIOS)) for (let n = 1; n <= 24; n++) {
    const capSets = [ [], Array.from({ length: n }, (_, i) => (i % 3 === 0 ? '캡션' + i : '')),
      Array.from({ length: n }, (_, i) => '캡' + i) ];
    for (const caps of capSets) {
      const a = JSON.stringify(comp.mediaPlan(n, ratio, caps, 0));
      const b = JSON.stringify(comp._legacyMediaPlan(n, ratio, caps, 0));
      A(a === b, ratio + ' n=' + n + ' caps=' + caps.filter(Boolean).length + ' 불일치'); checked++;
    }
  }
  A(checked === 4 * 24 * 3, '검사 수=' + checked);
});

T('Migration 후 기존 기능 무손상 — 슬라이드쇼 8장 doc 생성·전 미디어 배치·실렌더', () => {
  const r = C.buildProject('cx-slideshow', 'th-bold', { medias: mk(8), texts: { title: '가을 운동회' }, mediaCaptions: ['입장', '', '달리기', '', '', '점심', '', ''] });
  A(r.ok && r.sceneCount >= 10, '씬=' + r.sceneCount);
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 8, '배치=' + placed);
  renderAll(r);
});

T('Migration — 비포애프터 Manifest 귀속 + 쌍 3개 기존 동작 무손상', () => {
  const comp = C.getComposition('cx-beforeafter');
  A(comp.manifestId === 'tm-beforeafter', 'manifest 미귀속');
  const pairs = [0, 1, 2].map((i) => ({ before: img(i * 2), after: img(i * 2 + 1), title: '쌍' + i, resultText: '됐다' }));
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs, texts: { title: '대청소' }, ratio: '9:16', method: 'wipe-vertical' });
  A(r.ok && r.method === 'wipe-vertical', 'method=' + r.method);
  A(r.doc.scenes.some((s) => s.role === 'transform'), '변신 씬 없음');
  renderAll(r);
});

/* ---------- 3. 완료 조건 1 — Manifest 하나 추가 → 갤러리 자동 등록 ---------- */
T('신규 Manifest(tm-magazine) → listCompositions 카드 자동 등록 + 허브 메타 완비', () => {
  const card = C.listCompositions().find((c) => c.id === 'tm-magazine');
  A(card, '갤러리 미등록');
  A(card.name === '추억 매거진' && card.category === '매거진', '메타=' + card.name);
  A(card.recommendedMediaCount && card.recommendedDuration && card.defaultRatio, '허브 카드 필드 누락');
  /* variant 파생(hidden)은 갤러리에 노출되지 않는다 */
  A(!C.listCompositions().some((c) => /--/.test(c.id)), 'variant 가 갤러리에 노출');
  A(C.getComposition('tm-magazine--compact'), 'variant comp 는 존재해야 함');
});

T('허브 실 DOM — 신규 카드가 #/video 화면에 실제로 그려진다', () => {
  const S = window.MK_SCREENS;
  const root = window.document.createElement('div');
  root.innerHTML = S.video.render();
  S.video.mount && S.video.mount.call(S.video, root);
  const cards = [...root.querySelectorAll('[data-vh-comp]')];
  A(cards.length === C.listCompositions().length, '카드 수 ' + cards.length);
  A(cards.some((c) => c.getAttribute('data-vh-comp') === 'tm-magazine'), '매거진 카드 미표시');
});

/* ---------- 4. 완료 조건 2~7 — Manifest 기반 Scene·Layout·Animation·Theme·Rules ---------- */
T('build — 사진 5장: Scene 은 Layout Registry 프레임·등장은 Animation Registry', () => {
  const r = M.build('tm-magazine', { medias: mk(5), texts: { title: '봄 소풍', quote: '웃음이 가득했던 하루' }, mediaCaptions: ['입장', '보물찾기', '점심', '단체 사진', '귀가'] });
  A(r.ok, r.why);
  A(r.doc.scenes[0].role === 'intro' && r.doc.scenes[r.doc.scenes.length - 1].role === 'outro', '표지/뒷표지 순서');
  A(r.doc.scenes.some((s) => s.role === 'section'), 'quote 씬 누락');
  /* 16:9 기본 — media-left 레이아웃 프레임(x0 w58)이 실제 요소로 */
  const ml = M.getLayout('media-left').base.m[0];
  A(r.doc.scenes.some((s) => s.elements.some((e) => e.kind === 'image' && e.src && e.x === ml.x && e.w === ml.w)), 'media-left 프레임 미적용');
  A(r.templateId === 'tm-magazine' && r.manifestVersion === '1.0.0', '빌드 귀속');
  renderAll(r);
});

T('Rules 실행 — 12장 이상이면 gallery 4장 묶음 자동 (if(media>10) 하드코딩 0)', () => {
  const r = M.build('tm-magazine', { medias: mk(14), texts: { title: '운동회' } });
  A(r.ok, r.why);
  const g = M.getLayout('gallery').base.m;
  const hasGallery = r.doc.scenes.some((s) => s.elements.filter((e) => e.kind === 'image' && e.src).length === 4);
  A(hasGallery, 'gallery 묶음 미발동');
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 14, '누락 ' + placed);
  const few = M.build('tm-magazine', { medias: mk(6), texts: { title: '소풍' } });
  A(!few.doc.scenes.some((s) => s.elements.filter((e) => e.kind === 'image' && e.src).length === 4), '12장 미만인데 gallery 발동');
  A(typeof g[3].x === 'number', 'gallery 레이아웃 프레임');
  renderAll(r);
});

T('Theme Registry 참조 — 같은 Manifest·다른 테마 = 색·전환만 변화(구조 동일)', () => {
  const a = M.build('tm-magazine', { medias: mk(4), texts: { title: 'X' } }, { theme: 'th-minimal' });
  const b = M.build('tm-magazine', { medias: mk(4), texts: { title: 'X' } }, { theme: 'th-bold' });
  A(a.ok && b.ok, '빌드 실패');
  A(a.sceneCount === b.sceneCount, '테마가 씬 수를 바꿈');
  A(a.doc.scenes[0].background !== b.doc.scenes[0].background, '테마 색 미반영');
});

T('결정론 + 저장 스키마 — 같은 입력=같은 doc·기존 파이프라인 호환 키 전부', () => {
  const inp = { medias: mk(7), texts: { title: '결정론' }, ratio: '9:16' };
  const a = M.build('tm-magazine', inp), b = M.build('tm-magazine', JSON.parse(JSON.stringify(inp)));
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), '비결정');
  A(a.doc.ratio === '9:16' && a.doc.contentType === 'video' && a.doc.compositionId === 'tm-magazine', 'doc 스키마');
  for (const s of a.doc.scenes) A(s.id && s.duration && Array.isArray(s.elements), '씬 스키마');
});

/* ---------- 5. Smart Variant ---------- */
T('Smart Variant — default/compact/magazine 이 씬 구성·레이아웃 순환을 바꾼다', () => {
  const inp = { medias: mk(8), texts: { title: 'V', quote: '한 줄' } };
  const d = M.build('tm-magazine', inp);
  const c = M.build('tm-magazine', inp, { variant: 'compact' });
  const g = M.build('tm-magazine', inp, { variant: 'magazine' });
  A(d.ok && c.ok && g.ok, '빌드 실패');
  A(d.doc.scenes.some((s) => s.role === 'section'), 'default 에 quote 씬 없음');
  A(!c.doc.scenes.some((s) => s.role === 'section'), 'compact 가 quote 씬을 생략하지 않음');
  /* compact = full-media 만 — 미디어 씬 레이아웃 서명 1종 */
  const sig = (r2) => new Set(r2.doc.scenes.filter((s) => s.role === 'media').map((s) => s.elements.filter((e) => e.kind === 'image' && e.src).map((e) => [e.x, e.w].join(',')).join('|')));
  A(sig(c).size === 1, 'compact 레이아웃 ' + sig(c).size + '종');
  A(sig(d).size >= 2, 'default 레이아웃 단일');
  /* magazine = 6장부터 gallery 리듬 */
  A(g.doc.scenes.some((s) => s.elements.filter((e) => e.kind === 'image' && e.src).length === 4), 'magazine gallery 미발동');
  A(!d.doc.scenes.some((s) => s.elements.filter((e) => e.kind === 'image' && e.src).length === 4), 'default 는 8장에서 gallery 없어야');
  A(c.variant === 'compact', '빌드 결과 variant 표기');
  renderAll(c); renderAll(g);
});

T('없는 variant = 정직 거부', () => {
  const r = M.build('tm-magazine', { medias: mk(3) }, { variant: 'ultra' });
  A(!r.ok && r.why === 'no-variant' && /ultra/.test(r.guide), '조용한 실패');
});

/* ---------- 6. Validation — 잘못된 Manifest 는 명확한 오류로 거부 ---------- */
T('Validation — 없는 Layout·Theme·Animation·Transition·Scene 중복·Rule 충돌 전부 검출', () => {
  const base = { id: 'tm-bad', version: '1.0.0', meta: { name: '나쁨' } };
  const v1 = M.validate({ ...base, scenes: [{ id: 's1', layout: 'no-such-layout' }] });
  A(!v1.ok && v1.errors.some((e) => e.code === 'E_UNKNOWN_LAYOUT'), 'Layout 미검출');
  const v2 = M.validate({ ...base, theme: 'th-none', scenes: [{ id: 's1' }] });
  A(!v2.ok && v2.errors.some((e) => e.code === 'E_UNKNOWN_THEME'), 'Theme 미검출');
  const v3 = M.validate({ ...base, scenes: [{ id: 's1', animation: 'teleport' }] });
  A(!v3.ok && v3.errors.some((e) => e.code === 'E_UNKNOWN_ANIMATION'), 'Animation 미검출');
  const v4 = M.validate({ ...base, scenes: [{ id: 's1', transition: 'shatter' }] });
  A(!v4.ok && v4.errors.some((e) => e.code === 'E_UNKNOWN_TRANSITION'), 'Transition 미검출');
  const v5 = M.validate({ ...base, scenes: [{ id: 's1' }, { id: 's1' }] });
  A(!v5.ok && v5.errors.some((e) => e.code === 'E_DUP_SCENE_ID'), 'Scene 중복 미검출');
  const v6 = M.validate({ ...base, scenes: [{ id: 's1' }],
    rules: [{ when: { ratio: '16:9' }, cycle: ['full-media'] }, { when: { ratio: '16:9' }, cycle: ['framed-center'] }] });
  A(!v6.ok && v6.errors.some((e) => e.code === 'E_RULE_CONFLICT'), 'Rule 충돌 미검출');
  const v7 = M.validate({ ...base, scenes: [{ id: 's1' }], supportedRatios: ['3:2'] });
  A(!v7.ok && v7.errors.some((e) => e.code === 'E_BAD_RATIO'), '비율 미검출');
  /* 오류 메시지는 원인 지목 — 사람이 읽고 고칠 수 있어야 한다 */
  A(/no-such-layout/.test(v1.errors.find((e) => e.code === 'E_UNKNOWN_LAYOUT').msg), '오류에 원인 미표기');
});

T('잘못된 Manifest 는 등록 자체가 거부된다 (조용한 반영 0)', () => {
  const before = M.listTemplates().length;
  const r = M.registerTemplate({ id: 'tm-broken', version: '1', meta: { name: 'B' }, scenes: [{ id: 'x', layout: 'ghost' }] });
  A(!r.ok && r.errors.length, '거부 안 됨');
  A(M.listTemplates().length === before, '거부됐는데 등록됨');
  A(!C.getComposition('tm-broken'), 'Composition 이 새어 들어감');
});

/* ---------- 7. 감사 — MK_MANIFEST + MK_COMPOSE 전 컴포지션(신규 포함) ---------- */
T('audit — MK_MANIFEST 무위반 + MK_COMPOSE 전수(신규·variant 포함) 무위반', () => {
  const ma = M.audit();
  A(ma.ok, 'MANIFEST 위반: ' + ma.violations.join(', '));
  A(ma.templates >= 3 && ma.layouts >= 9, '집계=' + JSON.stringify(ma)); /* R64 — Builder 시드 4종이 추가 등록됨 */
  const ca = C.audit();
  A(ca.ok, 'COMPOSE 위반: ' + ca.violations.join(', '));
});

console.log('═'.repeat(50));
console.log(`R63 Template Manifest Engine: ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
