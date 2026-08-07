/* ============================================================
   test-round74.mjs — R74 구성 형태 선택 (간결 ↔ 전 구성)
   ------------------------------------------------------------
   R72 는 쌍이 많으면 장면 수를 줄인 「간결 구성」으로 지었지만, 그 사실이
   화면에 한 줄도 나오지 않았고 되돌릴 길도 없었다. 몰래 줄이지 않겠다는
   R72 의 약속이 문서 안에서만 지켜지고 있었던 셈이다.

   여기서 못 박는 계약:
     ① 기본은 자동 — 아무것도 안 고르면 R72 와 완전히 같다(회귀 0).
     ② 사용자가 뒤집을 수 있다 — 전 구성 강제(길어짐 감수) · 간결 강제(짧게).
     ③ 뒤집은 대가는 숫자로 말한다 — 전 구성이면 「아무리 눌러도 N초」(하한),
        간결이면 「무엇이 빠지는지」.
     ④ 「차례로」는 간결로 못 줄인다 — 조용히 무시하지 않고 거부하고 알린다.
     ⑤ 고른 형태는 문서에 남아 「다른 구성」에서도 유지된다.
     ⑥ 형태 전환은 구성을 흔들지 않는다 — 같은 씨앗이면 순서·비교 방식·
        쌍 묶음이 그대로고 장면 수만 바뀐다.
     ⑦ 사진은 한 장도 잃지 않는다. ★·⊘·잠금(R67~R70)은 형태와 무관하게 선다.
     ⑧ 화면은 실제 상태를 말한다 — 못 지킨 형태를 지킨 것처럼 적지 않는다.
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
const H = window.MK_VIDHUB;
const TPL = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && c.pairMode; }) || {}).id;
const COMP = C.getComposition(M.getTemplate(TPL)._compId || M.getTemplate(TPL).compositionId);
const budget = S._internals.pairSceneBudget;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n, w: 800, h: 600 });
const mkPairs = (n) => Array.from({ length: n }, (_, i) => ({ before: img(i * 2), after: img(i * 2 + 1),
  title: '쌍' + (i + 1), resultText: i % 2 ? '좋아졌어요' : '' }));
const build = (n, method, o) => S.buildSmart(TPL, { pairs: mkPairs(n), ...(method ? { method } : {}),
  texts: { title: 'T', result: 'R' }, ratio: '16:9', ...(o && o.pick ? { pairFormPick: o.pick } : {}) }, (o && o.opt) || {});
const R1 = (v) => Math.round(v * 10) / 10;
const totalOf = (doc) => R1(doc.scenes.reduce((a, s) => a + s.duration, 0));
const pairScenes = (doc) => doc.scenes.filter((s) => s.pairKey != null);
const photosOf = (doc) => new Set(doc.scenes.flatMap((s) => (s.elements || []).filter((e) => e.kind === 'image' && e.src).map((e) => e.src))).size;
const TEXTS = { title: 'T', result: 'R' };
const MAXT = 60;
const say = (r) => (r.warnings || []).join(' | ');

console.log('--- ① 예산 함수 — 형태별 정확한 장면 수·하한 ---');
T('T1 형태별 shape 를 둘 다 돌려준다', () => {
  const b = budget(COMP, TEXTS, 14, 'side-by-side', MAXT);
  return b.full && b.compact && b.full.scenes > b.compact.scenes ? true : JSON.stringify(b);
});
T('T2 장면 수는 정확한 값 — 쌍 밖 장면 + 쌍수×쌍당', () => {
  const b = budget(COMP, TEXTS, 6, 'side-by-side', MAXT);
  return b.full.scenes === b.overScenes + 6 * b.fullPer && b.compact.scenes === b.overScenes + 6 * b.compactPer
    ? true : JSON.stringify(b);
});
T('T3 예산의 장면 수 = 실제 빌드 장면 수 (전 구성)', () => {
  const b = budget(COMP, TEXTS, 6, 'side-by-side', MAXT);
  const r = build(6, 'side-by-side');
  return r.doc.scenes.length === b.full.scenes ? true : r.doc.scenes.length + ' vs ' + b.full.scenes;
});
T('T4 예산의 장면 수 = 실제 빌드 장면 수 (간결)', () => {
  const b = budget(COMP, TEXTS, 14, 'side-by-side', MAXT);
  const r = build(14, 'side-by-side');
  return r.doc.scenes.length === b.compact.scenes ? true : r.doc.scenes.length + ' vs ' + b.compact.scenes;
});
T('T5 minTotal 은 하한 — 실제 총길이가 그 아래로 안 내려간다', () => {
  const b = budget(COMP, TEXTS, 14, 'side-by-side', MAXT);
  const r = build(14, 'side-by-side', { pick: 'full' });
  return totalOf(r.doc) >= b.full.minTotal ? true : totalOf(r.doc) + ' < ' + b.full.minTotal;
});
T('T6 차례로는 간결 여지 없음 (compactPer = fullPer)', () => {
  const b = budget(COMP, TEXTS, 14, 'sequential', MAXT);
  return b.compactPer >= b.fullPer ? true : JSON.stringify(b);
});

console.log('--- ② 기본은 자동 — R72 회귀 0 ---');
T('T7 pick 없음 = 종전 자동 판정 (쌍 14 → 간결)', () => {
  const r = build(14, 'side-by-side');
  return r.smart.pairForm.form === 'compact' && r.smart.pairForm.pick === 'auto' ? true : JSON.stringify(r.smart.pairForm);
});
T('T8 pick 없음 (쌍 6) → 전 구성', () => {
  const r = build(6, 'side-by-side');
  return r.smart.pairForm.form === 'full' && r.smart.pairForm.auto === 'full' ? true : JSON.stringify(r.smart.pairForm);
});
T('T9 pick=auto 는 pick 없음과 완전히 같은 문서', () => {
  const a = build(14, 'side-by-side'), b = build(14, 'side-by-side', { pick: 'auto' });
  return JSON.stringify(a.doc) === JSON.stringify(b.doc) ? true : '문서 불일치';
});
T('T10 자동 자리에서는 meta.formPick 을 적지 않는다', () => {
  const r = build(14, 'side-by-side');
  return r.doc.meta.svar.formPick === undefined ? true : String(r.doc.meta.svar.formPick);
});
T('T11 쌍 5·8 총길이·방식 R72 그대로 (경계 아래 회귀)', () => {
  for (const n of [5, 8]) {
    const a = build(n, null, { opt: { seed: 's' + n } });
    const b = build(n, null, { pick: 'auto', opt: { seed: 's' + n } });
    if (totalOf(a.doc) !== totalOf(b.doc) || a.smart.method !== b.smart.method) return '쌍 ' + n + ' 불일치';
  }
  return true;
});

console.log('--- ③ 뒤집기 — 전 구성 강제 ---');
T('T12 간결 자리에서 전 구성 강제가 실제로 선다', () => {
  const auto = build(14, 'side-by-side');
  const full = build(14, 'side-by-side', { pick: 'full' });
  return full.smart.pairForm.form === 'full' && full.doc.scenes.length > auto.doc.scenes.length
    ? true : auto.doc.scenes.length + ' → ' + full.doc.scenes.length;
});
T('T13 강제하면 쌍마다 전 구성 장면 수를 받는다', () => {
  const r = build(14, 'side-by-side', { pick: 'full' });
  const per = new Map();
  for (const s of pairScenes(r.doc)) per.set(String(s.pairKey), (per.get(String(s.pairKey)) || 0) + 1);
  return [...per.values()].every((v) => v === 3) ? true : JSON.stringify([...per.values()]);
});
T('T14 넘는다는 사실을 하한 초와 함께 말한다', () => {
  const r = build(14, 'side-by-side', { pick: 'full' });
  const b = budget(COMP, TEXTS, 14, 'side-by-side', MAXT);
  const w = say(r);
  return w.includes('전 구성으로 만들었어요') && w.includes(String(b.full.minTotal) + '초') ? true : w;
});
T('T15 고지한 하한이 실제 총길이보다 크지 않다 (거짓 하한 금지)', () => {
  for (const n of [12, 14, 18, 24]) {
    const r = build(n, 'side-by-side', { pick: 'full' });
    const b = budget(COMP, TEXTS, n, 'side-by-side', MAXT);
    if (b.full.minTotal > totalOf(r.doc)) return '쌍 ' + n + ': 고지 ' + b.full.minTotal + ' > 실제 ' + totalOf(r.doc);
  }
  return true;
});

console.log('--- ④ 뒤집기 — 간결 강제 ---');
T('T16 여유 있는 자리에서도 간결을 고를 수 있다', () => {
  const r = build(6, 'side-by-side', { pick: 'compact' });
  const per = new Map();
  for (const s of pairScenes(r.doc)) per.set(String(s.pairKey), (per.get(String(s.pairKey)) || 0) + 1);
  return r.smart.pairForm.form === 'compact' && [...per.values()].every((v) => v === 1)
    ? true : JSON.stringify([...per.values()]);
});
T('T17 간결이 실제로 짧다', () => {
  const a = build(6, 'side-by-side'), b = build(6, 'side-by-side', { pick: 'compact' });
  return totalOf(b.doc) < totalOf(a.doc) ? true : totalOf(a.doc) + ' → ' + totalOf(b.doc);
});
T('T18 무엇이 빠지는지 말한다', () => {
  const w = say(build(6, 'side-by-side', { pick: 'compact' }));
  return w.includes('간결 구성으로 만들었어요') && w.includes('빠져요') ? true : w;
});
T('T19 차례로 + 간결 = 조용한 무시가 아니라 거부 + 고지', () => {
  const r = build(6, 'sequential', { pick: 'compact' });
  const w = say(r);
  return r.smart.pairForm.form === 'full' && w.includes('줄일 수 없어요') ? true : r.smart.pairForm.form + ' | ' + w;
});
T('T20 거부 자리에서 alt.can=false 와 이유를 함께 준다', () => {
  const pf = build(6, 'sequential', { pick: 'compact' }).smart.pairForm;
  return pf.alt.can === false && pf.alt.why ? true : JSON.stringify(pf.alt);
});

console.log('--- ⑤ 다른 형태의 대가 (한 번의 빌드로) ---');
T('T21 alt 장면 수는 그 형태로 지었을 때의 실제 장면 수', () => {
  const a = build(14, 'side-by-side');            /* 간결 */
  const f = build(14, 'side-by-side', { pick: 'full' });
  return a.smart.pairForm.alt.scenes === f.doc.scenes.length
    ? true : a.smart.pairForm.alt.scenes + ' vs ' + f.doc.scenes.length;
});
T('T22 반대 방향도 성립 (전 구성 → 간결 예고)', () => {
  const f = build(6, 'side-by-side');
  const c = build(6, 'side-by-side', { pick: 'compact' });
  return f.smart.pairForm.alt.scenes === c.doc.scenes.length
    ? true : f.smart.pairForm.alt.scenes + ' vs ' + c.doc.scenes.length;
});
T('T23 over 는 실제로 권장 길이를 넘는 자리에서만 참', () => {
  const a = build(14, 'side-by-side').smart.pairForm;   /* 전 구성으로 가면 넘음 */
  const b = build(6, 'side-by-side').smart.pairForm;    /* 간결로 가면 안 넘음 */
  return a.alt.over === true && b.alt.over === false ? true : a.alt.over + '/' + b.alt.over;
});
T('T24 over 참인 자리는 실제 빌드도 권장 길이를 넘는다', () => {
  const a = build(14, 'side-by-side').smart.pairForm;
  const f = build(14, 'side-by-side', { pick: 'full' });
  return a.alt.over === (totalOf(f.doc) > MAXT) ? true : a.alt.over + ' vs ' + totalOf(f.doc);
});

console.log('--- ⑥ 형태 전환이 구성을 흔들지 않는다 ---');
T('T25 같은 씨앗 — 형태가 달라도 비교 방식 동일', () => {
  const a = build(14, null, { opt: { seed: 'zz' } });
  const b = build(14, null, { pick: 'full', opt: { seed: 'zz' } });
  return a.smart.method === b.smart.method ? true : a.smart.method + ' vs ' + b.smart.method;
});
T('T26 같은 씨앗 — 쌍 순서·묶음 동일', () => {
  const a = build(14, null, { opt: { seed: 'zz' } });
  const b = build(14, null, { pick: 'full', opt: { seed: 'zz' } });
  return JSON.stringify(a.doc.meta.svar.pairs) === JSON.stringify(b.doc.meta.svar.pairs) ? true : '쌍 근거 불일치';
});
T('T27 바뀐 것은 장면 수뿐 — 사진은 그대로', () => {
  const a = build(14, null, { opt: { seed: 'zz' } });
  const b = build(14, null, { pick: 'full', opt: { seed: 'zz' } });
  return photosOf(a.doc) === 28 && photosOf(b.doc) === 28 ? true : photosOf(a.doc) + '/' + photosOf(b.doc);
});
T('T28 결정론 — 같은 pick·같은 씨앗 = 같은 문서', () => {
  const a = build(14, null, { pick: 'full', opt: { seed: 'q1' } });
  const b = build(14, null, { pick: 'full', opt: { seed: 'q1' } });
  return JSON.stringify(a.doc) === JSON.stringify(b.doc) ? true : '비결정론';
});

console.log('--- ⑦ 문서 왕복 (§12 「다른 구성」) ---');
T('T29 고른 형태가 문서에 남는다', () => {
  const r = build(14, 'side-by-side', { pick: 'full' });
  return r.doc.meta.svar.formPick === 'full' ? true : String(r.doc.meta.svar.formPick);
});
T('T30 inputFromDoc 이 형태를 되돌려 준다', () => {
  const f = X.inputFromDoc(build(14, 'side-by-side', { pick: 'full' }).doc);
  return f.ok && f.input.pairFormPick === 'full' ? true : JSON.stringify(f.ok ? f.input.pairFormPick : f.why);
});
T('T31 「다른 구성」 한 번에 형태가 사라지지 않는다', () => {
  const r = X.recomposeDoc(build(14, 'side-by-side', { pick: 'full' }).doc, {});
  if (!r.ok) return r.why;
  const pf = X.pairFormSummary(r.doc);
  return pf.form === 'full' && pf.pick === 'full' ? true : JSON.stringify(pf);
});
T('T32 형태 전환 — 씨앗을 주면 장면 수만 바뀐다', () => {
  const src = build(14, null, { pick: 'full', opt: { seed: 'w1' } });
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 'w1' });
  if (!sw.ok) return sw.why;
  return sw.doc.scenes.length < src.doc.scenes.length
    && JSON.stringify(sw.doc.meta.svar.pairs) === JSON.stringify(src.doc.meta.svar.pairs)
    ? true : src.doc.scenes.length + ' → ' + sw.doc.scenes.length;
});
T('T33 formPick=auto 로 되돌리면 자동 판정으로 복귀', () => {
  const src = build(14, null, { pick: 'full', opt: { seed: 'w2' } });
  const sw = X.recomposeDoc(src.doc, { formPick: 'auto', seed: 'w2' });
  if (!sw.ok) return sw.why;
  const pf = X.pairFormSummary(sw.doc);
  return pf.form === 'compact' && pf.pick === 'auto' ? true : JSON.stringify(pf);
});
T('T34 전환해도 사진은 한 장도 안 잃는다', () => {
  const src = build(14, null, { pick: 'full', opt: { seed: 'w3' } });
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 'w3' });
  return sw.ok && photosOf(sw.doc) === 28 ? true : sw.ok ? String(photosOf(sw.doc)) : sw.why;
});

console.log('--- ⑧ 문서 요약 (화면이 읽는 상태) ---');
T('T35 pairFormSummary 는 적힌 값이 아니라 실제 장면 수로 판정', () => {
  const r = build(14, 'side-by-side');
  const pf = X.pairFormSummary(r.doc);
  return pf.form === 'compact' && pf.perMin === 1 && pf.perMax === 1 && pf.pairs === 14
    ? true : JSON.stringify(pf);
});
T('T36 전 구성 문서는 쌍마다 3장면으로 읽힌다', () => {
  const pf = X.pairFormSummary(build(6, 'side-by-side').doc);
  return pf.form === 'full' && pf.perMin === 3 && pf.perMax === 3 ? true : JSON.stringify(pf);
});
T('T37 쌍 문서가 아니면 null (평면 문서에서 헛말 금지)', () => {
  const r = S.buildSmart('tm-slideshow', { medias: [img(1), img(2), img(3)], texts: { title: 'T' } });
  return X.pairFormSummary(r.doc) === null ? true : JSON.stringify(X.pairFormSummary(r.doc));
});
/* R86 기능 탐지 — 고치지 않은 잠근 쌍이 형태 전환을 따라오는 세계인지.
   잣대의 의도(섞임을 정직하게 읽는다)는 보존하고, 「섞임을 만드는 방법」만
   그 세계에 맞게 고른다(§1.101·§1.105 전례 — 의도 보존·리터럴 해제). */
const R86 = (() => {
  try {
    const src = build(6, 'side-by-side', { opt: { seed: 'pr86' } });
    const g = X.pairGroups(src.doc)[0];
    if (!g || g.scenes.length < 2) return false;
    X.setPairLock(src.doc, g.key, true);
    const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 'pr86' });
    if (!sw.ok) return false;
    const g2 = X.pairGroupOf(sw.doc, g.key);
    return !!(g2 && g2.scenes.length < g.scenes.length);
  } catch (e) { return false; }
})();
T('T38 잠근 쌍이 형태를 안 따라오면 섞임으로 읽는다', () => {
  const src = build(6, 'side-by-side', { opt: { seed: 'm1' } });   /* 전 구성 */
  const g = X.pairGroups(src.doc)[0];
  if (R86) X.markEdited(src.doc, g.scenes[0].id); /* R86 — 옛 형태로 남는 쌍 = 직접 고친 쌍 */
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 'm1' });
  if (!sw.ok) return sw.why;
  const pf = X.pairFormSummary(sw.doc);
  return pf.mixed === true ? true : JSON.stringify(pf);
});

console.log('--- ⑨ 승계 — ★·⊘·잠금이 형태와 무관하게 선다 ---');
T('T39 ★ 는 강제 전 구성에서도 실린다', () => {
  const pairs = mkPairs(14);
  const key = String(0);
  const r = S.buildSmart(TPL, { pairs: pairs.map((p, i) => ({ ...p,
    before: { ...p.before, _oi: i * 2 }, after: { ...p.after, _oi: i * 2 + 1 } })),
    texts: TEXTS, ratio: '16:9', method: 'side-by-side', pairFormPick: 'full',
    pairRoles: { [key]: 'highlight' } }, {});
  const hl = r.doc.scenes.filter((s) => s.svar && s.svar.hlAdd);
  return hl.length >= 1 ? true : '가산 장면 0';
});
T('T40 ⊘ 는 강제 간결에서도 쌍을 뺀다', () => {
  const pairs = mkPairs(6).map((p, i) => ({ ...p,
    before: { ...p.before, _oi: i * 2 }, after: { ...p.after, _oi: i * 2 + 1 } }));
  const r = S.buildSmart(TPL, { pairs, texts: TEXTS, ratio: '16:9', method: 'side-by-side',
    pairFormPick: 'compact', pairRoles: { '0': 'exclude' } }, {});
  const keys = new Set(pairScenes(r.doc).map((s) => String(s.pairKey)));
  return keys.size === 5 ? true : '남은 쌍 ' + keys.size;
});
T('T41 잠근 쌍은 형태를 바꿔도 장면이 그대로 남는다', () => {
  const src = build(6, 'side-by-side', { opt: { seed: 'k9' } });
  const g = X.pairGroups(src.doc)[0];
  const before = g.scenes.length;
  if (R86) X.markEdited(src.doc, g.scenes[0].id); /* R86 — 장면 보존 약속은 고친 쌍의 것 */
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 'k9' });
  if (!sw.ok) return sw.why;
  const g2 = X.pairGroupOf(sw.doc, g.key);
  return g2 && g2.scenes.length === before ? true : (g2 ? g2.scenes.length : 'none') + ' vs ' + before;
});

console.log('--- ⑩ 화면 배선 ---');
T('T42 형태 칩 3개가 쌍 스테이지에만 뜬다', () => {
  if (!H) return 'no-hub';
  H.st.stage = 'pairs'; H.st.comp = (M.listTemplates().find((t) => t.id === TPL) || {}).compositionId;
  const barP = H.renderSmartBar();
  H.st.stage = 'media';
  const barM = H.renderSmartBar();
  H.st.stage = 'pairs';
  const cntP = (barP.match(/data-vh-pform=/g) || []).length;
  const cntM = (barM.match(/data-vh-pform=/g) || []).length;
  return cntP === 3 && cntM === 0 ? true : cntP + '/' + cntM;
});
T('T43 setPairForm 이 상태를 잡는다 (엉뚱한 값은 자동으로)', () => {
  H.setPairForm('full'); const a = H.st.pairFormPick;
  H.setPairForm('nonsense'); const b = H.st.pairFormPick;
  H.setPairForm('auto');
  return a === 'full' && b === 'auto' ? true : a + '/' + b;
});
T('T44 형태 줄 — 장면 수는 늘 적고, 초는 넘을 때만 적는다', () => {
  const over = H.formLineHTML(build(14, 'side-by-side').smart.pairForm);
  const fine = H.formLineHTML(build(6, 'side-by-side').smart.pairForm);
  return /장면 \d+개/.test(over) && /초/.test(over) && /장면 \d+개/.test(fine) && !/최소|아무리/.test(fine)
    ? true : over + ' || ' + fine;
});
T('T45 못 지킨 형태를 지킨 것처럼 적지 않는다', () => {
  const pf = build(6, 'sequential', { pick: 'compact' }).smart.pairForm;
  const line = H.formLineHTML(pf);
  return line.includes('전 구성') && line.includes('못 지켰어요') ? true : line;
});
T('T46 캐시 서명에 형태가 들어간다', () => {
  if (!H.costSig) return 'no-sig';
  H.st.stage = 'pairs';
  H.setPairForm('auto'); const a = H.costSig();
  H.setPairForm('full'); const b = H.costSig();
  H.setPairForm('auto');
  return a !== b ? true : '서명 동일';
});
T('T47 Workspace 에 형태 줄·전환 버튼이 있다', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/workspace.js'), 'utf8');
  return src.includes('data-ws-pform') && src.includes('pairFormSummary') && src.includes('구성 형태')
    ? true : '배선 없음';
});
T('T48 Workspace 전환은 씨앗을 붙잡는다 (구성 통째 교체 금지)', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/workspace.js'), 'utf8');
  const i = src.lastIndexOf('data-ws-pform');
  const seg = src.slice(i, i + 1200);
  return /formPick: want/.test(seg) && /seed: st\.seed/.test(seg) ? true : '씨앗 미전달';
});

console.log('--- ⑪ 상한 실측 (전 구성 강제는 정직하게 넘는다) ---');
T('T49 자동은 여전히 상한을 지킨다 (쌍 2~24 전량)', () => {
  const bad = [];
  for (const n of [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24]) {
    const r = build(n, null, { opt: { seed: 'lim' + n } });
    if (totalOf(r.doc) > MAXT + 0.05) bad.push(n + ':' + totalOf(r.doc));
  }
  return bad.length ? bad.join(',') : true;
});
T('T50 전 구성 강제로 넘는 자리는 전부 말로 고지된다', () => {
  const silent = [];
  for (const n of [12, 14, 16, 18, 20, 24]) {
    const r = build(n, 'side-by-side', { pick: 'full' });
    if (totalOf(r.doc) > MAXT + 0.05 && !/넘어요/.test(say(r))) silent.push(n);
  }
  return silent.length ? '무고지 ' + silent.join(',') : true;
});

console.log('');
console.log('=== R74  ' + pass + '/' + (pass + fail) + ' ===');
if (fail) process.exit(1);
