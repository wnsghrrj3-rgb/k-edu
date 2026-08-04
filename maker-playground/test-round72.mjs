/* ============================================================
   test-round72.mjs — R72 쌍 장면 수 정책 (R70 한계 ③ 해소)
   ------------------------------------------------------------
   쌍이 많으면 길이를 하한(1.5초)까지 눌러도 권장 총길이에 못 들어간다
   (쌍 12×3장면×1.5초=54초 + 쌍 밖 고정 7초 = 61초 > 60초).
   길이가 아니라 장면 수로 맞춘다.

   여기서 못 박는 계약:
     ① 전 구성이 하한으로도 안 들어가면 「간결 구성」 — 쌍마다 방식의
        본질 장면 하나만(좌우·상하→비교, 닦아내기·겹침→변신).
     ② 차례로(sequential)는 전→후 두 장면이 본질 — 줄이지 않고 경고한다.
     ③ 직접 고른 방식은 존중한다(넘으면 경고). 무작위 뽑기는
        하한으로도 못 들어가는 방식을 후보에서 뺀다.
     ④ 몰래 줄이지 않는다 — 간결 전환·생략 항목은 경고·노트로 말한다.
     ⑤ 사진은 한 장도 잃지 않는다. ★·⊘·잠금 계약(R68~R70)은 그대로 선다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><div id="root"></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video' });
const { window } = dom;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
window.alert = () => {}; window.confirm = () => true;
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

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

const S = window.MK_SVAR, X = window.MK_SVARX, M = window.MK_MANIFEST, C = window.MK_COMPOSE;
const TPL = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && c.pairMode; }) || {}).id;
const COMP = C.getComposition(M.getTemplate(TPL)._compId || M.getTemplate(TPL).compositionId);
const budget = S._internals.pairSceneBudget;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n, w: 800, h: 600 });
const mkPairs = (n, opt) => Array.from({ length: n }, (_, i) => ({ before: img(i * 2), after: img(i * 2 + 1),
  title: (opt && opt.noTitle) ? '' : '쌍' + (i + 1), resultText: (opt && opt.noResult) ? '' : (i % 2 ? '좋아졌어요' : '') }));
const build = (n, method, o, popt) => S.buildSmart(TPL, { pairs: mkPairs(n, popt), ...(method ? { method } : {}),
  texts: { title: 'T', result: 'R' }, ratio: '16:9' }, o || {});
const R1 = (v) => Math.round(v * 10) / 10;
const totalOf = (doc) => R1(doc.scenes.reduce((a, s) => a + s.duration, 0));
const pairScenes = (doc) => doc.scenes.filter((s) => s.pairKey != null);
const perPairCounts = (doc) => { const m = new Map();
  for (const s of pairScenes(doc)) { const k = String(s.pairKey); m.set(k, (m.get(k) || 0) + 1); } return m; };
const photosOf = (doc) => new Set(doc.scenes.flatMap((s) => (s.elements || []).filter((e) => e.kind === 'image' && e.src).map((e) => e.src))).size;
const TEXTS = { title: 'T', result: 'R' };
const MAXT = 60; /* extended-comparison 상한 */

console.log('--- ① 예산 함수 (경계 판정) ---');
T('T1 쌍4 좌우 → full (여유)', () => {
  const b = budget(COMP, TEXTS, 4, 'side-by-side', MAXT);
  return b.form === 'full' && !b.irreducible ? true : JSON.stringify(b);
});
T('T2 쌍11 좌우 → full (33장면×1.5=49.5 ≤ 53)', () => {
  const b = budget(COMP, TEXTS, 11, 'side-by-side', MAXT);
  return b.form === 'full' ? true : JSON.stringify(b);
});
T('T3 쌍12 좌우 → compact (54 > 53 — R70 한계 ③의 경계)', () => {
  const b = budget(COMP, TEXTS, 12, 'side-by-side', MAXT);
  return b.form === 'compact' && b.fits ? true : JSON.stringify(b);
});
T('T4 쌍12 차례로 → full (2장면/쌍 — 36 ≤ 53)', () => {
  const b = budget(COMP, TEXTS, 12, 'sequential', MAXT);
  return b.form === 'full' && !b.irreducible ? true : JSON.stringify(b);
});
T('T5 쌍18 차례로 → 축소 불가 (54 > 53, 본질 2장면)', () => {
  const b = budget(COMP, TEXTS, 18, 'sequential', MAXT);
  return b.form === 'full' && b.irreducible === true ? true : JSON.stringify(b);
});
T('T6 쌍40 좌우 → compact 도 못 들어감 (fits=false, 정직 고지 대상)', () => {
  const b = budget(COMP, TEXTS, 40, 'side-by-side', MAXT);
  return b.form === 'compact' && b.fits === false ? true : JSON.stringify(b);
});
T('T7 상한 없음(maxT=0) → 항상 full', () => {
  const b = budget(COMP, TEXTS, 30, 'side-by-side', 0);
  return b.form === 'full' ? true : JSON.stringify(b);
});
T('T8 제목·결과 없으면 오버헤드가 줄어 경계가 뒤로 밀린다 (쌍12 좌우 → full)', () => {
  /* 인트로(2)+결과(3) 빠짐 → 고정 2초 → 방 58 ≥ 54 */
  const b = budget(COMP, {}, 12, 'side-by-side', MAXT);
  return b.form === 'full' ? true : JSON.stringify(b);
});

console.log('--- ② 간결 구성 문서 형태 ---');
T('T9 쌍12 좌우 명시 → 쌍당 비교 장면 1개', () => {
  const r = build(12, 'side-by-side');
  if (!r.ok) return r.why;
  const m = perPairCounts(r.doc);
  if (m.size !== 12) return '쌍 수 ' + m.size;
  for (const [k, v] of m) if (v !== 1) return '쌍 ' + k + ' 장면 ' + v + '개';
  const bad = pairScenes(r.doc).find((s) => s.specId !== 'ba-split-h');
  return bad ? '비교 장면이 아님: ' + bad.specId : true;
});
T('T10 쌍12 좌우 → form=compact 가 meta·smart 에 기록', () => {
  const r = build(12, 'side-by-side');
  return (r.doc.meta.svar || {}).form === 'compact' && (r.smart || {}).form === 'compact'
    ? true : JSON.stringify({ meta: (r.doc.meta.svar || {}).form, smart: (r.smart || {}).form });
});
T('T11 쌍12 닦아내기 → 쌍당 변신 장면 1개 + 라벨 「전→후」 + 리빌 애니', () => {
  const r = build(12, 'wipe-horizontal');
  if (!r.ok) return r.why;
  const ps = pairScenes(r.doc);
  if (ps.length !== 12) return '장면 ' + ps.length;
  const bad = ps.find((s) => s.specId !== 'ba-transform');
  if (bad) return '변신 장면이 아님: ' + bad.specId;
  const lab = ps[0].elements && ps[0].elements.find((e) => e.kind === 'text' && e.text === '전→후');
  if (!lab) return '라벨 전→후 없음';
  const anim = ps.every((s) => (s.elements || []).some((e) => e.anim && e.anim.preset === 'wipe'));
  return anim ? true : '리빌 애니 누락';
});
T('T12 쌍4 좌우 → 종전 그대로 3장면/쌍, form 미기록 (회귀)', () => {
  const r = build(4, 'side-by-side');
  const m = perPairCounts(r.doc);
  for (const [k, v] of m) if (v !== 3) return '쌍 ' + k + ' 장면 ' + v + '개';
  return (r.doc.meta.svar || {}).form == null ? true : 'form 이 기록됨';
});
T('T13 간결에서도 사진 무손실 (쌍12 → 24장 전부 문서 안)', () => {
  const r = build(12, 'side-by-side');
  const n = photosOf(r.doc);
  return n === 24 ? true : '사진 ' + n + '/24';
});
T('T14 간결 좌우 비교엔 쌍 결과 문구가 산다', () => {
  const r = build(12, 'side-by-side');
  const has = r.doc.scenes.some((s) => s.pairKey != null && (s.elements || []).some((e) => e.kind === 'text' && e.text === '좋아졌어요'));
  return has ? true : '결과 문구 없음';
});
T('T15 미완성 쌍(후 없음)은 간결에서도 ba-solo + 정직 마커', () => {
  const pairs = mkPairs(12); pairs[3].after = null;
  const r = S.buildSmart(TPL, { pairs, texts: TEXTS, ratio: '16:9' }, {});
  if (!r.ok) return r.why;
  const solo = r.doc.scenes.find((s) => s.specId === 'ba-solo');
  if (!solo) return 'ba-solo 없음';
  const mark = (solo.elements || []).some((e) => e.kind === 'text' && /없음/.test(e.text || ''));
  return mark ? true : '정직 마커 없음';
});

console.log('--- ③ 정직성 (경고·노트) ---');
T('T16 간결 전환 경고가 말한다', () => {
  const r = build(12, 'side-by-side');
  return (r.warnings || []).some((w) => /간결하게 구성했어요/.test(w)) ? true : (r.warnings || []).join('|');
});
T('T17 쌍 제목 생략 노트 (제목 있을 때만)', () => {
  const r1 = build(12, 'side-by-side');
  const r2 = build(12, 'side-by-side', {}, { noTitle: true });
  const a = (r1.notes || []).some((w) => /쌍 제목.*생략/.test(w));
  const b = (r2.notes || []).some((w) => /쌍 제목.*생략/.test(w));
  return a && !b ? true : JSON.stringify({ 있음: a, 없음일때: b });
});
T('T18 닦아내기 간결 → 결과 문구 생략 노트 / 좌우 간결 → 노트 없음', () => {
  const rw = build(12, 'wipe-horizontal');
  const rs = build(12, 'side-by-side');
  const a = (rw.notes || []).some((w) => /결과 문구를 생략/.test(w));
  const b = (rs.notes || []).some((w) => /결과 문구를 생략/.test(w));
  return a && !b ? true : JSON.stringify({ wipe: a, side: b });
});
T('T19 차례로 쌍20 명시 → 축소 불가 경고 + 초과 경고 (존중 + 정직)', () => {
  const r = build(20, 'sequential');
  const a = (r.warnings || []).some((w) => /차례로.*줄일 수 없어요/.test(w));
  const b = (r.warnings || []).some((w) => /권장 길이.*넘어요/.test(w));
  const t = totalOf(r.doc);
  return a && b && t > MAXT ? true : JSON.stringify({ 축소불가: a, 초과: b, total: t });
});

console.log('--- ④ 총길이 상한 (R70 한계 ③ 해소 본체) ---');
for (const n of [12, 16, 20, 24]) for (const m of ['side-by-side', 'wipe-horizontal', 'fade-between']) {
  T(`T20 쌍${n} ${m} → 총길이 ≤ ${MAXT}초`, () => {
    const r = build(n, m);
    const t = totalOf(r.doc);
    return t <= MAXT ? true : t + '초';
  });
}
T('T21 무작위 뽑기(씨앗 5종)는 쌍20에서 차례로를 집지 않는다', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e']) {
    const r = build(20, null, { seed });
    const m = (r.doc.meta.svar || {}).method;
    if (m === 'sequential') return '씨앗 ' + seed + ' 가 sequential 을 집음';
    if (totalOf(r.doc) > MAXT) return '씨앗 ' + seed + ' 초과 ' + totalOf(r.doc);
  }
  return true;
});
T('T22 쌍8 무작위 뽑기는 종전과 같은 후보에서 집는다 (필터 미발동 회귀)', () => {
  /* 쌍8: 전 방식이 하한 안 — 필터가 목록을 건드리지 않아 방식 다양성 유지 */
  const seen = new Set();
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const r = build(8, null, { seed });
    seen.add((r.doc.meta.svar || {}).method);
  }
  return seen.size >= 3 ? true : '다양성 부족: ' + [...seen].join(',');
});

console.log('--- ⑤ ★·⊘·잠금 계약 승계 (R68~R70) ---');
T('T23 간결 쌍에 ★ → 그 쌍의 유일한 장면에 +1.0 (hlAdd 기록)', () => {
  const r0 = build(12, 'side-by-side');
  const key = String(pairScenes(r0.doc)[2].pairKey);
  const r = S.buildSmart(TPL, { pairs: mkPairs(12), method: 'side-by-side',
    pairRoles: { [key]: 'highlight' }, texts: TEXTS, ratio: '16:9' }, {});
  const sc = r.doc.scenes.find((s) => String(s.pairKey) === key);
  if (!sc) return '장면 없음';
  const add = (sc.svar || {}).hlAdd;
  return add > 0 ? true : 'hlAdd=' + add;
});
T('T24 ★ 가산은 실제 지킨 만큼만 기록 (R70 계약 — 해제 시 그만큼만 줄어듦)', () => {
  const key = '4';
  const r = S.buildSmart(TPL, { pairs: mkPairs(12), method: 'side-by-side',
    pairRoles: { [key]: 'highlight' }, texts: TEXTS, ratio: '16:9' }, {});
  const t1 = totalOf(r.doc);
  const doc2 = JSON.parse(JSON.stringify(r.doc));
  let recorded = 0;
  for (const s of doc2.scenes) if (s.svar && s.svar.hlAdd) { recorded = R1(recorded + s.svar.hlAdd);
    s.duration = R1(s.duration - s.svar.hlAdd); delete s.svar.hlAdd; }
  const t2 = totalOf(doc2);
  return R1(t1 - t2) === recorded ? true : JSON.stringify({ 줄어듦: R1(t1 - t2), 기록: recorded });
});
T('T25 ⊘ 로 경계를 건너면 형태도 결정론으로 바뀐다 (쌍13→⊘1→compact 유지, 쌍12→⊘1→full 복귀)', () => {
  const r13 = S.buildSmart(TPL, { pairs: mkPairs(13), method: 'side-by-side',
    pairRoles: { '0': 'exclude' }, texts: TEXTS, ratio: '16:9' }, {});
  const r12 = S.buildSmart(TPL, { pairs: mkPairs(12), method: 'side-by-side',
    pairRoles: { '0': 'exclude' }, texts: TEXTS, ratio: '16:9' }, {});
  const a = (r13.doc.meta.svar || {}).form === 'compact';   /* 12쌍 남음 → compact */
  const b = (r12.doc.meta.svar || {}).form == null;          /* 11쌍 남음 → full */
  return a && b ? true : JSON.stringify({ 쌍13제외1: (r13.doc.meta.svar || {}).form, 쌍12제외1: (r12.doc.meta.svar || {}).form });
});
T('T26 간결 문서에서 쌍 잠금 → 다른 구성에도 그 쌍 장면 보존 + 방식 유지', () => {
  /* 씨앗을 주면 무작위 뽑기가 방식을 갈아치운다(기존 규약) — 간결 형태를 보려면 무씨앗 빌드 */
  const r = S.buildSmart(TPL, { pairs: mkPairs(12), method: 'side-by-side', texts: TEXTS, ratio: '16:9' }, {});
  X.markSources(r.doc, 'auto', 'L1');
  const g = X.pairGroups(r.doc)[3];
  X.setPairLock(r.doc, g.key, true);
  const before = JSON.stringify(r.doc.scenes.find((s) => String(s.pairKey) === String(g.key)).elements);
  const r2 = X.recomposeDoc(r.doc, { seed: 'L2' });
  if (!r2.ok) return r2.why;
  const sc2 = r2.doc.scenes.filter((s) => String(s.pairKey) === String(g.key));
  if (sc2.length !== 1) return '잠근 쌍 장면 ' + sc2.length + '개';
  if (JSON.stringify(sc2[0].elements) !== before) return '잠근 쌍 내용 바뀜';
  const m2 = (r2.doc.meta.svar || {}).method;
  return m2 === 'side-by-side' ? true : '방식 바뀜: ' + m2;
});
T('T27 간결 문서 재구성도 상한 안 (씨앗 3종)', () => {
  const r = S.buildSmart(TPL, { pairs: mkPairs(16), method: 'side-by-side', texts: TEXTS, ratio: '16:9' }, { seed: 'M1' });
  X.markSources(r.doc, 'auto', 'M1');
  let doc = r.doc;
  for (const seed of ['M2', 'M3', 'M4']) {
    const r2 = X.recomposeDoc(doc, { seed });
    if (!r2.ok) return seed + ': ' + r2.why;
    if (totalOf(r2.doc) > MAXT) return seed + ' 초과 ' + totalOf(r2.doc);
    doc = r2.doc; X.markSources(doc, 'random', seed);
  }
  return true;
});

console.log('--- ⑥ 회귀 (기존 계약 유지) ---');
T('T28 쌍5·8 총길이는 패치 전 실측과 동일 (경계 아래 무변) ', () => {
  /* perf72 before 기록과 대조 — 방식 무작위지만 씨앗 같으면 뽑기도 같아야 한다(필터 미발동) */
  const bf = JSON.parse(fs.readFileSync(path.join(ROOT, 'report/_perf72-before.json'), 'utf8'));
  const af = JSON.parse(fs.readFileSync(path.join(ROOT, 'report/_perf72-after.json'), 'utf8'));
  for (const n of [5, 8]) {
    const b = bf.filter((r) => r.n === n), a = af.filter((r) => r.n === n);
    for (let i = 0; i < b.length; i++)
      if (b[i].total !== a[i].total || b[i].method !== a[i].method)
        return '쌍' + n + ' 행' + i + ' 전 ' + b[i].total + '/' + b[i].method + ' 후 ' + a[i].total + '/' + a[i].method;
  }
  return true;
});
T('T29 평면(비쌍) 경로 무변 — 장면 수 정책은 쌍 전용', () => {
  const FLAT = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && !c.pairMode; }) || {}).id;
  const r = S.buildSmart(FLAT, { medias: Array.from({ length: 8 }, (_, i) => img(i)), texts: { title: 'T' }, ratio: '16:9' }, { seed: 's1' });
  return r.ok && (r.doc.meta.svar || {}).form == null ? true : 'form 이 평면에 기록됨';
});
T('T30 R67 부분 잠금 거부(pair-partial-lock)는 간결에서도 그대로 선다', () => {
  /* 간결은 쌍당 1장면 — 그 1장면을 잠그면 곧 통째 잠금이라 partial 이 성립할 수 없다.
     쌍 밖(제목) 장면 잠금과 섞어도 쌍 판정은 독립적으로 동작해야 한다. */
  const r = S.buildSmart(TPL, { pairs: mkPairs(12), method: 'side-by-side', texts: TEXTS, ratio: '16:9' }, { seed: 'P1' });
  X.markSources(r.doc, 'auto', 'P1');
  const gs = X.pairGroups(r.doc);
  return gs.length === 12 && gs.every((g) => g.state === 'none') ? true
    : JSON.stringify(gs.map((g) => g.state));
});

console.log('');
console.log('결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
