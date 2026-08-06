/* R65 — Smart Variant · Auto Balance (P1-3 전반부) 검증
   지시서 §28 이번 세션 몫: Test 1~8 · 13 + 결정론 + 회귀 감사 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://x.test/#/video', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
if (!window.performance) window.performance = { now: () => Date.now() };
try { window.localStorage.setItem('__t', '1'); } catch { Object.defineProperty(window, 'localStorage', { value: (() => { const s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = String(v); }, removeItem: (k) => { delete s[k]; }, clear: () => {} }; })() }); }

const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
for (const m of html.matchAll(/<script src="([^?"]+)/g)) {
  const p = m[1];
  try { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); }   /* R75 */
  catch (e) { console.error('LOAD FAIL', p, e.message); process.exit(1); }
}

const S = window.MK_SVAR, C = window.MK_COMPOSE, M = window.MK_MANIFEST;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✅', name); } catch (e) { fail++; console.log('  ❌', name, '—', e.message); } };
const A = (cond, msg) => { if (!cond) throw new Error(msg || 'assert'); };
const clone = (o) => JSON.parse(JSON.stringify(o));

const img = (i, w, h) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,IMG' + i, w, h });
const vid = (i, d) => ({ name: 'v' + i, kind: 'video', src: 'data:video/mp4;base64,VID' + i, w: 1280, h: 720, duration: d });
const lands = (n) => Array.from({ length: n }, (_, i) => img(i, 800, 600));
const ports = (n) => Array.from({ length: n }, (_, i) => img(i, 600, 900));
const placedCount = (doc) => doc.scenes.reduce((a, s) => a + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
const mediaVariants = (r) => r.smart.plan.map((p) => p.split('x')[0]);
const noRun3 = (vs) => { let run = 1; for (let i = 1; i < vs.length; i++) { run = vs[i] === vs[i - 1] ? run + 1 : 1; if (run >= 3) return false; } return true; };

console.log('R65 — Smart Variant · Auto Balance');

/* ---------- 통계 ---------- */
T('mediaStats — 수·유형·방향 우세·캡션·쌍', () => {
  const s = S.mediaStats({ medias: [...ports(7), ...lands(3)], mediaCaptions: ['a', '', 'b'], texts: { title: 'T' } });
  A(s.count === 10 && s.kind === 'imageOnly', 'count/kind');
  A(s.orientation === 'portraitDominant', 'dominance: ' + s.orientation);
  A(s.captionCount === 2 && s.hasTitle && !s.hasSubtitle, 'texts');
  A(s.pairCount === 5, 'pairs');
});

/* ---------- Variant 선택 (§7 결정론·경계) ---------- */
T('selectVariant — 경계값 1/4/5/10/11/20/21', () => {
  const at = (n) => S.selectVariant('tm-slideshow', S.mediaStats({ medias: lands(n) }), { ratio: '16:9' }).id;
  A(at(1) === 'compact' && at(4) === 'compact', '1·4');
  A(at(5) === 'standard' && at(10) === 'standard', '5·10');
  A(at(11) === 'extended' && at(20) === 'extended', '11·20');
  A(at(21) === 'large' && at(30) === 'large', '21·30');
});
T('selectVariant — 사용자 지정 > 조건 · reason 추적(§7)', () => {
  const st = S.mediaStats({ medias: lands(3) });
  const u = S.selectVariant('tm-slideshow', st, { ratio: '16:9', variant: 'extended' });
  A(u.id === 'extended' && /직접 선택/.test(u.reason.join(' ')), 'user pick');
  const auto = S.selectVariant('tm-slideshow', st, { ratio: '16:9' });
  A(auto.id === 'compact' && auto.reason.some((r) => /mediaCount 3 matched/.test(r)), 'reason: ' + auto.reason.join('|'));
});

/* ---------- Test 1 · 사진 3 ---------- */
T('T1 사진3 → Compact — 빈슬롯 0·반복 0·짧은 구성', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(3), texts: { title: '봄' } });
  A(r.ok, r.why); A(r.smart.variant === 'compact', r.smart.variant);
  A(placedCount(r.doc) === 3, 'placed=' + placedCount(r.doc));
  const srcs = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.src).map((e) => e.src));
  A(new Set(srcs).size === srcs.length, '미디어 반복');
  A(r.doc.scenes.length <= 7, '씬 수 ' + r.doc.scenes.length);
});

/* ---------- Test 2 · 사진 8 ---------- */
T('T2 사진8 → Standard — 단일+2분할 혼합·3연속 없음', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(8), texts: { title: '여행' } });
  A(r.ok && r.smart.variant === 'standard', r.smart && r.smart.variant);
  A(placedCount(r.doc) === 8, 'placed');
  const vs = mediaVariants(r);
  A(r.smart.plan.some((p) => /x2/.test(p)), '2분할 없음: ' + r.smart.plan.join(','));
  A(noRun3(vs), '3연속: ' + vs.join(','));
});

/* ---------- Test 3 · 사진 20 ---------- */
T('T3 사진20 → Extended — 전량 사용·콜라주·길이 정책', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(20), texts: { title: '운동회' } });
  A(r.ok && r.smart.variant === 'extended', r.smart && r.smart.variant);
  A(placedCount(r.doc) === 20, 'placed=' + placedCount(r.doc));
  A(r.smart.plan.some((p) => /collage/.test(p)), '콜라주 없음: ' + r.smart.plan.join(','));
  A(r.total <= 90 + 0.01, '총길이 ' + r.total);
});

/* ---------- Test 4 · 사진 30 ---------- */
T('T4 사진30 → Large — 누락 0·씬 상한·초과 안내', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(30), texts: { title: '한 해' } });
  A(r.ok && r.smart.variant === 'large', r.smart && r.smart.variant);
  A(placedCount(r.doc) === 30, 'placed=' + placedCount(r.doc));
  A(r.doc.scenes.length <= 24, '씬 수 ' + r.doc.scenes.length);
  A(r.total <= 90 + 0.01 || r.warnings.some((w) => /권장 길이/.test(w)), '길이 정책');
});

/* ---------- Test 5 · 세로 10 + 9:16 ---------- */
T('T5 세로10·9:16 — 세로형 우선(잘림·여백 남용 없음)', () => {
  const r = S.buildSmart('tm-slideshow', { medias: ports(10), ratio: '9:16', texts: { title: '쇼츠' } });
  A(r.ok, r.why);
  const vs = mediaVariants(r);
  const good = vs.filter((v) => ['full-bleed', 'framed-center', 'highlight-zoom', 'split-two'].includes(v)).length;
  A(good === vs.length, '세로 비우선 레이아웃: ' + vs.join(','));
  A(vs.filter((v) => v === 'full-bleed').length >= Math.floor(vs.length / 2), 'full-bleed 비율: ' + vs.join(','));
});

/* ---------- Test 6 · 가로 10 + 16:9 ---------- */
T('T6 가로10·16:9 — 가로형 우선(레터박스 최소)', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(10), ratio: '16:9', texts: { title: '캠핑' } });
  A(r.ok, r.why);
  const vs = mediaVariants(r);
  A(vs.filter((v) => ['full-bleed', 'stacked-two', 'split-two'].includes(v)).length >= Math.ceil(vs.length / 2), '가로 우선: ' + vs.join(','));
});

/* ---------- Test 7 · 혼합 미디어 ---------- */
T('T7 이미지7+영상3 — 전량 사용·영상 duration 반영', () => {
  const medias = [...lands(7), vid(7, 6), vid(8, 6), vid(9, 6)];
  const r = S.buildSmart('tm-slideshow', { medias, texts: { title: '혼합' } });
  A(r.ok, r.why); A(r.smart.stats.kind === 'mixed' && r.smart.stats.videos === 3, 'stats');
  A(placedCount(r.doc) === 10, 'placed=' + placedCount(r.doc));
  const vids = r.doc.scenes.flatMap((s) => s.elements).filter((e) => e.src && /VID/.test(e.src));
  A(vids.length === 3, '영상 배치 ' + vids.length);
  A(r.doc.scenes.some((s) => s.role === 'media' && s.duration >= 3.9 && s.elements.some((e) => e.src && /VID/.test(e.src))), '영상 duration 미반영');
});

/* ---------- Test 8 · Highlight 역할 ---------- */
T('T8 역할 — 중요2·시작1·마지막1·제외1 배치', () => {
  const medias = lands(12);
  const roles = { 0: 'start', 2: 'highlight', 3: 'highlight', 11: 'end', 5: 'exclude' };
  const r = S.buildSmart('tm-slideshow', { medias, texts: { title: '역할' }, mediaRoles: roles });
  A(r.ok, r.why);
  A(placedCount(r.doc) === 11, '제외 반영 placed=' + placedCount(r.doc));
  const allSrc = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.src).map((e) => e.src)).join('|');
  A(!allSrc.includes('IMG5'), '제외 미디어 배치됨');
  const firstMedia = r.doc.scenes.find((s) => s.role === 'media');
  A(firstMedia.elements.some((e) => e.src && e.src.includes('IMG0')), '시작 미배치');
  const high = r.doc.scenes.find((s) => s.role === 'highlight');
  A(high && high.elements.some((e) => e.src && e.src.includes('IMG11')), '마지막 → 하이라이트 씬 미배치');
  A(r.smart.plan.filter((p) => p.endsWith('*')).length === 2, '중요 씬 수: ' + r.smart.plan.join(','));
  A(r.smart.excluded.length === 1 && r.doc.meta.svar.roles['2'] === 'highlight', '메타 기록');
});
T('T8b 중요 → 하이라이트 씬 우선 배치 + duration 가산(§19·§21)', () => {
  const base = S.buildSmart('tm-slideshow', { medias: lands(6), texts: { title: 'x' } });
  const hl = S.buildSmart('tm-slideshow', { medias: lands(6), texts: { title: 'x' }, mediaRoles: { 1: 'highlight' } });
  const hs = hl.doc.scenes.find((s) => s.role === 'highlight');
  A(hs && hs.elements.some((e) => e.src && e.src.includes('IMG1')), '중요 → ss-high 미배치');
  const hsBase = base.doc.scenes.find((s) => s.role === 'highlight');
  A(hs.duration >= hsBase.duration + 0.9, 'hl 가산 ' + hs.duration + ' vs ' + hsBase.duration);
});

/* ---------- Test 13 · Before & After ---------- */
T('T13 BA — Pair 1/3/6 → Variant·쌍 순서 유지', () => {
  const mkPair = (i) => ({ before: img(i * 2, 800, 600), after: img(i * 2 + 1, 800, 600), title: '쌍' + (i + 1) });
  const at = (k) => S.buildSmart('tm-beforeafter', { pairs: Array.from({ length: k }, (_, i) => mkPair(i)), texts: { title: '변화' } });
  const r1 = at(1), r3 = at(3), r6 = at(6);
  A(r1.ok && r1.smart.variant === 'single-pair', r1.smart && r1.smart.variant);
  A(r3.ok && r3.smart.variant === 'multi-pair', r3.smart && r3.smart.variant);
  A(r6.ok && r6.smart.variant === 'extended-comparison', r6.smart && r6.smart.variant);
  /* 쌍 관계·순서 — before 짝수 src 가 after 홀수 src 보다 항상 먼저 */
  const seq = r3.doc.scenes.flatMap((s) => s.elements.filter((e) => e.src).map((e) => e.src));
  A(seq.findIndex((s) => s.includes('IMG0')) < seq.findIndex((s) => s.includes('IMG1')), '쌍 순서');
  A(r6.total <= 60 + 0.01 || r6.warnings.some((w) => /권장 길이/.test(w)), 'extended 길이 정책: ' + r6.total);
  A(r6.doc.scenes[0].role === 'intro' && r6.doc.scenes[r6.doc.scenes.length - 1].role === 'outro', 'intro/outro 유지');
});

/* ---------- 결정론·회귀 ---------- */
T('결정론 — 같은 입력 = 같은 doc (역할 포함)', () => {
  const inp = { medias: [...ports(4), ...lands(9)], texts: { title: 'd' }, mediaRoles: { 1: 'highlight' }, mediaCaptions: ['', '캡션', ''] };
  const a = S.buildSmart('tm-slideshow', inp), b = S.buildSmart('tm-slideshow', clone(inp));
  A(a.ok && JSON.stringify(a.doc) === JSON.stringify(b.doc), '비결정');
  A(JSON.stringify(a.smart.plan) === JSON.stringify(b.smart.plan), '플랜 비결정');
});
T('레거시 무손상 — _planOverride 없는 기존 경로 그대로', () => {
  const r = M.build('tm-slideshow', { medias: lands(8), texts: { title: 'legacy' } });
  A(r.ok && placedCount(r.doc) === 8, '레거시 build');
  const a = C.audit(); A(a.ok, 'MK_COMPOSE.audit: ' + a.violations.join(','));
  const m = M.audit(); A(m.ok, 'MK_MANIFEST.audit: ' + m.violations.join(','));
});
T('MK_SVAR.audit — 결정론·Variant 경계·전량 배치', () => {
  const a = S.audit(); A(a.ok, a.violations.join(','));
});
T('저장 재료 — doc.meta.svar 왕복(§28 T14 전반)', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(5), texts: { title: 's' } });
  const back = clone(r.doc);
  A(back.meta.svar.variant === 'compact' || back.meta.svar.variant === 'standard', 'meta variant');
  A(Array.isArray(back.meta.svar.order) && back.meta.svar.order.length === 5, 'meta order');
});

console.log('\n결과: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
