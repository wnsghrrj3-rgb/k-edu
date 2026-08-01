/* R60 — 슬라이드쇼 variant 시스템 + 비포애프터 Pair 모드 검증 (GPT 2단계 지시서) */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/home' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) { if (/^https?:/.test(f)) continue; const p = f.replace(/^\//, ''); if (!fs.existsSync(p) && !fs.existsSync(f)) continue; window.eval(fs.readFileSync(fs.existsSync(p) ? p : f, 'utf8')); }
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const C = window.MK_COMPOSE;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assert'); };
const mk = (n, o = {}) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: o.kind || 'image', src: 'data:image/png;base64,' + i, w: i % 2 ? 800 : 600, h: i % 2 ? 600 : 800, ...(o.dur ? { duration: o.dur } : {}) }));
const mediaScenes = (r) => r.doc.scenes.filter((s) => s.role === 'media');
const sig = (s) => s.elements.filter((e) => e.kind === 'image').map((e) => [e.x, e.y, e.w, e.h].join(',')).join('|');

/* ---------- 슬라이드쇼 variant 시스템 ---------- */
T('variant 순환 — 같은 레이아웃 3회 이상 연속 없음 (§8-3, 캡션 유무 각각)', () => {
  for (const caps of [null, ['한때', '', '바다', '', '노을', '', '', '길']]) {
    const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(12), texts: { title: 'T' }, ...(caps ? { mediaCaptions: caps } : {}) });
    const sigs = mediaScenes(r).map(sig);
    for (let i = 2; i < sigs.length; i++) A(!(sigs[i] === sigs[i - 1] && sigs[i] === sigs[i - 2]), '3연속 동일 레이아웃 @' + i);
  }
});

T('비율별 우선순위 — 9:16과 16:9의 미디어 프레임이 실제로 다르다 (§8-4)', () => {
  const a = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(6), texts: { title: 'T' } });
  const b = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(6), texts: { title: 'T' }, ratio: '9:16' });
  const sa = mediaScenes(a).map(sig).join(';'), sb = mediaScenes(b).map(sig).join(';');
  A(sa !== sb, '비율별 레이아웃 미분화');
});

T('미디어별 캡션 — 있는 사진에만 캡션 요소, 빈 캡션 = 빈 박스 0 (§8-7)', () => {
  const caps = ['첫날 아침', '', '셋째 날'];
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(4), texts: { title: 'T' }, mediaCaptions: caps });
  const capTexts = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text));
  A(capTexts.includes('첫날 아침') && capTexts.includes('셋째 날'), '캡션 미노출: ' + capTexts.join('/'));
  for (const s of r.doc.scenes) for (const e of s.elements) A(e.kind !== 'text' || String(e.text).trim(), '빈 텍스트 박스');
});

T('16장 이상 — collage-three(3장 몽타주) 실등장, 전 미디어 배치 (§8-3)', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(20), texts: { title: 'T' } });
  A(r.doc.scenes.some((s) => s.elements.filter((e) => e.src).length === 3), '콜라주 없음');
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 20, 'placed=' + placed);
});

T('estimate — 만들기 전 예상 씬·길이 = 실제 생성과 동일 (§8-1)', () => {
  const inp = { medias: mk(8), texts: { title: '여행' } };
  const e = C.estimate('cx-slideshow', 'th-minimal', inp);
  const r = C.buildProject('cx-slideshow', 'th-minimal', JSON.parse(JSON.stringify(inp)));
  A(e.ok && e.sceneCount === r.sceneCount && e.total === r.total, 'e=' + JSON.stringify(e));
  const z = C.estimate('cx-slideshow', 'th-minimal', { medias: [] });
  A(!z.ok && z.guide, '0장 예상치 가짜 성공');
});

/* ---------- 비포애프터 Pair 모드 ---------- */
const pairOf = (i) => ({ before: { name: 'b' + i, src: 'data:image/png;base64,B' + i }, after: { name: 'a' + i, src: 'data:image/png;base64,A' + i } });

T('Pair 입력 — 쌍 순서 유지·전후 미혼합 (§9-1·§9-7)', () => {
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs: [pairOf(0), pairOf(1), pairOf(2)], texts: { title: 'T' } });
  A(r.ok, r.why);
  const comps = r.doc.scenes.filter((s) => s.role === 'comparison');
  A(comps.length === 3, '비교 씬=' + comps.length);
  comps.forEach((s, i) => {
    const ms = s.elements.filter((e) => e.src);
    A(ms[0].src.includes('B' + i) && ms[1].src.includes('A' + i), '쌍 ' + i + ' 순서/혼합 위반');
  });
});

T('누락 쌍 — 완성 비교로 위장하지 않고 경고 (§9-4)', () => {
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs: [{ before: { src: 'data:image/png;base64,B' }, after: null }], texts: { title: 'T' } });
  A(r.ok && r.warnings.length === 1 && /후 사진/.test(r.warnings[0]), JSON.stringify(r.warnings));
  A(!r.doc.scenes.some((s) => s.role === 'comparison'), '미완성인데 비교 씬 생성');
  A(r.doc.scenes.some((s) => s.elements.some((e) => /없음/.test(e.text || ''))), '미완성 표기 없음');
});

T('비교 방식 — 비율별 지원표·억지 적용 거부 (§9-5)', () => {
  A(C.METHODS_BY_RATIO['16:9'].includes('side-by-side') && C.METHODS_BY_RATIO['9:16'].includes('wipe-vertical'));
  A(!Object.values(C.METHODS_BY_RATIO).flat().includes('slider-reveal'), 'slider-reveal 가짜 지원');
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs: [pairOf(0)], texts: {}, ratio: '9:16', method: 'wipe-horizontal' });
  A(r.method !== 'wipe-horizontal' && r.notes.some((n) => /지원하지 않아/.test(n)), '억지 적용: ' + r.method);
});

T('wipe 변신 씬 — 후 사진 wipe 리빌·KB 제외·전후 동일 프레임 (§9-5·§9-6)', () => {
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs: [pairOf(0)], texts: {}, method: 'wipe-horizontal' });
  const tf = r.doc.scenes.find((s) => s.role === 'transform');
  A(tf, '변신 씬 없음');
  const ms = tf.elements.filter((e) => e.src);
  A(ms.length === 2 && ms[0].x === ms[1].x && ms[0].w === ms[1].w && ms[0].h === ms[1].h, '전후 프레임 불일치');
  A(ms[1].anim.preset === 'wipe' && ms[1].anim.direction === 'right', '리빌 anim: ' + JSON.stringify(ms[1].anim));
  A(!ms.some((e) => /^kb-/.test((e.anim || {}).idle || '')), '변신 씬 KB 미제외');
});

T('세로 wipe — 재생 이름 매핑·MP4 clipH 수치 동률 (R60 신설)', () => {
  const P = window.MK_PLAY, V = window.MK_VIDEO;
  const plan = P.enterPlan({ anim: { preset: 'wipe', direction: 'down', delay: 0, duration: 1 } }, 0, null);
  A(plan.name === 'mkp-wipe-v', '이름=' + plan.name);
  A(/mkp-wipe-v/.test(P.KEYFRAMES), 'CSS 키프레임 없음');
  const st = V.stateAt({ name: 'mkp-wipe-v', delay: 0, dur: 1, ease: 'linear' }, {}, 0.4);
  A(Math.abs(st.clipH - 0.4) < 1e-9 && st.alpha === 1, 'clipH=' + st.clipH);
  const h = P.enterPlan({ anim: { preset: 'wipe', direction: 'right', delay: 0, duration: 1 } }, 0, null);
  A(h.name === 'mkp-wipe', '가로 기본 무변 위반');
});

T('fade-between — 변신 씬만, 분할 씬 없음 (§9-5)', () => {
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs: [pairOf(0)], texts: {}, ratio: '1:1', method: 'fade-between' });
  const tf = r.doc.scenes.find((s) => s.role === 'transform');
  A(tf && tf.elements.filter((e) => e.src)[1].anim.preset === 'fade', 'fade 리빌 아님');
  A(!r.doc.scenes.some((s) => s.role === 'comparison'), 'fade-between에 분할 씬');
});

T('sequential — 전 씬 → 후 씬 순서·동일 프레임·라벨 (§9-5·§9-6)', () => {
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs: [pairOf(0)], texts: {}, method: 'sequential' });
  const solos = r.doc.scenes.filter((s) => s.role === 'media');
  A(solos.length === 2, 'solo=' + solos.length);
  A(solos[0].elements.some((e) => e.text === '전') && solos[1].elements.some((e) => e.text === '후'), '라벨');
  const f0 = sig(solos[0]), f1 = sig(solos[1]);
  A(f0 === f1, '전후 프레임 불일치');
});

T('쌍별 문구 — pairTitle·resultText 해당 씬에만 (§9-2)', () => {
  const pairs = [{ ...pairOf(0), title: '교실 앞', resultText: '깨끗해졌어요' }, pairOf(1)];
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs, texts: { title: 'T' }, method: 'side-by-side' });
  const all = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text));
  A(all.includes('교실 앞') && all.includes('깨끗해졌어요'), '쌍 문구 미노출');
  A(all.filter((t) => t === '깨끗해졌어요').length === 1, '결과 문구 중복');
});

T('결정론 — Pair 모드 같은 입력 = 같은 doc', () => {
  const inp = { pairs: [pairOf(0), pairOf(1)], texts: { title: 'T', result: 'R' }, method: 'wipe-horizontal' };
  const a = C.buildProject('cx-beforeafter', 'th-bold', inp);
  const b = C.buildProject('cx-beforeafter', 'th-bold', JSON.parse(JSON.stringify(inp)));
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), '비결정');
});

T('전체 감사 — 10종 규약 유지 (audit ok)', () => {
  const a = C.audit();
  A(a.ok && a.compositions >= 10, JSON.stringify(a.violations.slice(0, 4))); /* R63: Manifest 등록으로 증가 가능 */
});

console.log('');
console.log(`R60: ${pass}/${pass + fail}` + (fail ? ' FAIL' : ' ALL PASS'));
process.exit(fail ? 1 : 0);
