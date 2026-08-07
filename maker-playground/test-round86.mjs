/* ============================================================
   test-round86.mjs — R86 잠금 vs 형태 우선순위 (§1.94 ① 상환)
   ------------------------------------------------------------
   R74 는 「형태 전환 후 잠근 쌍은 옛 형태로 남는다」를 한계로만 적었다 —
   잠금과 형태 중 무엇을 우선할지는 설계 자리였다. 여기서 답을 못 박는다:

   우선순위는 「무엇을 지키려던 잠금인가」로 가른다.
     잠금의 약속 = 자리·비교 방식·직접 고친 내용 (R68).
     형태 전환은 같은 씨앗·keepOrder 로 자리·방식을 이미 붙잡는다 (R73·R74).
     → 고친 장면이 없는 잠근 쌍 = 형태가 이긴다(새 형태로 함께, 잠금 승계).
     → 직접 고친 쌍 = 내용이 이긴다(옛 형태로 남고, 쌍 번호로 알린다).

   계약:
     ① 고치지 않은 잠근 쌍은 형태 전환을 따라온다 — 장면 수가 새 형태.
     ② 그 쌍의 잠금은 승계된다 — 전환 뒤에도 state 'full', 다음 「다른 구성」이 못 흔든다.
     ③ 자리·비교 방식은 전환 전후 동일 — 잠금이 지키던 것이 실제로 지켜진다.
     ④ 왕복이 성립한다 — compact→full 로 되돌리면 원래 장면 수, 여전히 잠김.
     ⑤ 직접 고친 잠근 쌍은 옛 형태로 남고 고친 장면이 바이트 그대로다.
     ⑥ 경고는 정직하다 — 「함께 바꿨어요」·「옛 형태로 남았어요(쌍 번호)」,
        전환 자리에서 순서 재추첨 안내는 안 나온다(keepOrder 인데 나오면 헛말).
     ⑦ 섞임 판정은 진짜 섞임에만 — 고치지 않은 잠근 쌍만 있으면 mixed false.
     ⑧ 「다른 구성」(formPick 없음)은 R68 그대로 — 잠근 쌍 원본 장면 되끼움, 회귀 0.
     ⑨ 잠근 쌍 ⊘ 보호·쌍 밖 잠금 장면 되끼움은 전환에서도 산다.
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
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n, w: 800, h: 600 });
const mkPairs = (n) => Array.from({ length: n }, (_, i) => ({ before: img(i * 2), after: img(i * 2 + 1),
  title: '쌍' + (i + 1), resultText: i % 2 ? '좋아졌어요' : '' }));
/* 첫 빌드에 씨앗을 주면 rnd 가 비교 방식을 재추첨한다 — 「차례로」가 뽑히면
   간결 자체가 성립하지 않아(전→후 두 장면이 본질) 잣대가 뽑기 운에 얹힌다.
   씨앗 없는 빌드로 side-by-side(전3·간결1)를 고정하고, 씨앗은 전환에만 준다. */
const build = (n, o) => S.buildSmart(TPL, { pairs: mkPairs(n), method: 'side-by-side',
  texts: { title: 'T', result: 'R' }, ratio: '16:9', ...(o || {}) }, {});
const pairOrderOf = (doc) => { const seen = []; for (const s of (doc.scenes || []))
  if (s.pairKey != null && !seen.includes(String(s.pairKey))) seen.push(String(s.pairKey)); return seen; };
const say = (r) => (r.warnings || []).join(' | ');

console.log('--- ① 고치지 않은 잠근 쌍은 형태를 따라온다 ---');
T('T1 전 구성 잠근 쌍 → 간결 전환 시 그 쌍도 간결(장면 수 축소)', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  if (g.scenes.length < 2) return '전제 실패: 전 구성 아님(' + g.scenes.length + ')';
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const g2 = X.pairGroupOf(sw.doc, g.key);
  return g2 && g2.scenes.length < g.scenes.length ? true
    : '장면 ' + (g2 ? g2.scenes.length : 'none') + ' (전 ' + g.scenes.length + ')';
});
T('T2 전환 문서의 형태는 실측으로도 간결 — 잠근 쌍 탓 섞임 없음', () => {
  const src = build(6);
  X.setPairLock(src.doc, X.pairGroups(src.doc)[0].key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const pf = X.pairFormSummary(sw.doc);
  return pf.form === 'compact' && pf.mixed === false ? true : JSON.stringify(pf);
});
T('T3 잠그지 않은 쌍과 잠근 쌍의 새 장면 수가 같다 — 특별 취급 잔재 0', () => {
  const src = build(6);
  const gs = X.pairGroups(src.doc);
  X.setPairLock(src.doc, gs[2].key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const counts = X.pairGroups(sw.doc).map((g) => g.scenes.length);
  return Math.min(...counts) === Math.max(...counts) ? true : counts.join(',');
});

console.log('--- ② 잠금 승계 ---');
T('T4 전환 뒤에도 그 쌍은 잠겨 있다 (state full)', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[1];
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const g2 = X.pairGroupOf(sw.doc, g.key);
  return g2 && g2.state === 'full' ? true : (g2 ? g2.state : 'none');
});
T('T5 meta.svar.lockedPairs 에 그 쌍이 남는다', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[1];
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const lp = (sw.doc.meta.svar.lockedPairs || []).map(String);
  return lp.includes(String(g.key)) ? true : lp.join(',');
});
T('T6 전환 뒤 「다른 구성」에서 그 쌍은 자리·장면 그대로 (승계가 실제로 일한다)', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[1];
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const posBefore = pairOrderOf(sw.doc).indexOf(String(g.key));
  const scBefore = JSON.stringify(X.pairGroupOf(sw.doc, g.key).scenes.map((s) => s.elements));
  const re = X.recomposeDoc(sw.doc, { seed: 'other-1' });
  if (!re.ok) return re.why;
  const posAfter = pairOrderOf(re.doc).indexOf(String(g.key));
  const scAfter = JSON.stringify((X.pairGroupOf(re.doc, g.key) || { scenes: [] }).scenes.map((s) => s.elements));
  return posBefore === posAfter && scBefore === scAfter ? true : posBefore + '→' + posAfter;
});

console.log('--- ③ 자리·비교 방식 불변 ---');
T('T7 전환 전후 쌍 등장 순서가 동일하다', () => {
  const src = build(6);
  X.setPairLock(src.doc, X.pairGroups(src.doc)[0].key, true);
  const before = pairOrderOf(src.doc);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const after = pairOrderOf(sw.doc);
  return before.join(',') === after.join(',') ? true : before.join(',') + ' vs ' + after.join(',');
});
T('T8 비교 방식이 전환 전후 동일하다', () => {
  const src = build(6);
  X.setPairLock(src.doc, X.pairGroups(src.doc)[0].key, true);
  const m0 = src.doc.meta.svar.method;
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  return sw.doc.meta.svar.method === m0 ? true : m0 + '→' + sw.doc.meta.svar.method;
});

console.log('--- ④ 왕복 ---');
T('T9 간결→전 구성 되돌리면 장면 수가 원래대로, 여전히 잠김', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  const n0 = g.scenes.length;
  X.setPairLock(src.doc, g.key, true);
  const a = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!a.ok) return a.why;
  const b = X.recomposeDoc(a.doc, { formPick: 'full', seed: 's86' });
  if (!b.ok) return b.why;
  const g2 = X.pairGroupOf(b.doc, g.key);
  return g2 && g2.scenes.length === n0 && g2.state === 'full' ? true
    : (g2 ? g2.scenes.length + '/' + g2.state : 'none') + ' (원래 ' + n0 + ')';
});

console.log('--- ⑤ 직접 고친 쌍은 내용이 이긴다 ---');
T('T10 고친 잠근 쌍은 옛 형태로 남는다', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  const n0 = g.scenes.length;
  X.markEdited(src.doc, g.scenes[0].id);
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const g2 = X.pairGroupOf(sw.doc, g.key);
  return g2 && g2.scenes.length === n0 ? true : (g2 ? g2.scenes.length : 'none') + ' vs ' + n0;
});
T('T11 고친 장면의 요소가 바이트 그대로다', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  const target = g.scenes[0];
  target.elements.push({ kind: 'text', text: '내가 고침', x: 1, y: 2 });
  X.markEdited(src.doc, target.id);
  X.setPairLock(src.doc, g.key, true);
  const want = JSON.stringify(target.elements);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const kept = sw.doc.scenes.find((s) => s.id === target.id);
  return kept && JSON.stringify(kept.elements) === want ? true : (kept ? '내용 변형' : '장면 소멸');
});
T('T12 고친 쌍과 고치지 않은 쌍이 섞이면 mixed true — 진짜 섞임만 읽는다', () => {
  const src = build(6);
  const gs = X.pairGroups(src.doc);
  X.markEdited(src.doc, gs[0].scenes[0].id);
  X.setPairLock(src.doc, gs[0].key, true);
  X.setPairLock(src.doc, gs[1].key, true); /* 고치지 않은 잠근 쌍 — 따라와야 함 */
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const pf = X.pairFormSummary(sw.doc);
  const gA = X.pairGroupOf(sw.doc, gs[0].key), gB = X.pairGroupOf(sw.doc, gs[1].key);
  return pf.mixed === true && gA.scenes.length > gB.scenes.length ? true
    : JSON.stringify({ mixed: pf.mixed, a: gA.scenes.length, b: gB.scenes.length });
});

console.log('--- ⑥ 경고 정직성 ---');
T('T13 함께 바뀐 잠근 쌍은 「함께 바꿨어요」로 말한다', () => {
  const src = build(6);
  X.setPairLock(src.doc, X.pairGroups(src.doc)[0].key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  return /함께 바꿨어요/.test(say(sw)) ? true : say(sw);
});
T('T14 옛 형태로 남은 쌍은 번호와 이유·길을 말한다', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  X.markEdited(src.doc, g.scenes[0].id);
  X.setPairLock(src.doc, g.key, true);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const w = say(sw);
  return new RegExp('쌍 ' + g.no + '번').test(w) && /옛 형태로 남았어요/.test(w) && /잠금을 풀/.test(w) ? true : w;
});
T('T15 전환 자리에서 순서 재추첨 안내는 안 나온다 (keepOrder 인데 나오면 헛말)', () => {
  const src = build(6);
  const gs = X.pairGroups(src.doc);
  for (const g of gs) X.setPairLock(src.doc, g.key, true); /* 전부 잠금 */
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  return /바뀔 자리가 없어요|순서는 그대로예요/.test(say(sw)) ? say(sw) : true;
});
T('T16 아무 쌍도 안 잠갔으면 잠금 경고 0 — 없는 일을 말하지 않는다', () => {
  const src = build(6);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  return /잠근|잠금/.test(say(sw)) ? say(sw) : true;
});

console.log('--- ⑦ 「다른 구성」 회귀 — R68 그대로 ---');
T('T17 formPick 없는 재구성에서 잠근 쌍은 원본 장면을 되끼운다', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  const want = JSON.stringify(g.scenes.map((s) => s.elements));
  X.setPairLock(src.doc, g.key, true);
  const re = X.recomposeDoc(src.doc, { seed: 'zz1' });
  if (!re.ok) return re.why;
  const g2 = X.pairGroupOf(re.doc, g.key);
  return g2 && JSON.stringify(g2.scenes.map((s) => s.elements)) === want ? true : '장면 변형';
});
T('T18 formPick 없는 재구성의 경고 문구는 종전 그대로', () => {
  const src = build(6);
  X.setPairLock(src.doc, X.pairGroups(src.doc)[0].key, true);
  const re = X.recomposeDoc(src.doc, { seed: 'zz2' });
  if (!re.ok) return re.why;
  return /잠근 쌍 1개\(장면 \d+개\)는 그대로 뒀어요/.test(say(re)) ? true : say(re);
});
T('T19 전부 잠근 「다른 구성」의 「바뀔 자리가 없어요」 안내 생존', () => {
  const src = build(4);
  for (const g of X.pairGroups(src.doc)) X.setPairLock(src.doc, g.key, true);
  const re = X.recomposeDoc(src.doc, { seed: 'zz3' });
  if (!re.ok) return re.why;
  return /바뀔 자리가 없어요/.test(say(re)) ? true : say(re);
});

console.log('--- ⑧⑨ 보호 생존 ---');
T('T20 잠근 쌍 ⊘ 은 전환에서도 안 빠진다', () => {
  const src = build(6);
  const g = X.pairGroups(src.doc)[0];
  X.setPairLock(src.doc, g.key, true);
  X.setPairRole(src.doc, g.key, 'exclude');
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  return X.pairGroupOf(sw.doc, g.key) ? true : '쌍 소멸';
});
T('T21 쌍 밖 잠금 장면(제목 등)은 전환에서도 되끼워진다', () => {
  const src = build(6);
  const title = (src.doc.scenes || []).find((s) => s.pairKey == null);
  if (!title) return '전제 실패: 쌍 밖 장면 없음';
  title.elements.push({ kind: 'text', text: '고친 제목', x: 0, y: 0 });
  X.markEdited(src.doc, title.id);
  const want = JSON.stringify(title.elements);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  const kept = sw.doc.scenes.find((s) => s.pairKey == null && s.specId === title.specId);
  return kept && JSON.stringify(kept.elements) === want ? true : (kept ? '내용 변형' : '장면 소멸');
});
T('T22 사진은 한 장도 잃지 않는다 (혼합 잠금 상태 전환)', () => {
  const src = build(6);
  const gs = X.pairGroups(src.doc);
  X.markEdited(src.doc, gs[0].scenes[0].id);
  X.setPairLock(src.doc, gs[0].key, true);
  X.setPairLock(src.doc, gs[3].key, true);
  const cnt = (d) => new Set(d.scenes.flatMap((s) => (s.elements || [])
    .filter((e) => e.kind === 'image' && e.src).map((e) => e.src))).size;
  const n0 = cnt(src.doc);
  const sw = X.recomposeDoc(src.doc, { formPick: 'compact', seed: 's86' });
  if (!sw.ok) return sw.why;
  return cnt(sw.doc) === n0 ? true : cnt(sw.doc) + ' vs ' + n0;
});

console.log('');
console.log('test-round86: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
