/* ============================================================
   test-round69.mjs — R69 쌍 역할 지정(★ 중요 / ⊘ 빼기)
   ------------------------------------------------------------
   R68 이 남긴 한계 ③: 쌍 스테이지에 역할 지정이 없었다. 평면 사진은
   ★·⊘ 를 R67 부터 쓸 수 있었는데 비포&애프터만 못 썼다.
   여기서 그 문을 열되, 쌍에서만 성립하는 계약을 함께 못 박는다:
     · ⊘ = 그 쌍 통째로 빠짐(원본 무손상). 잠근 쌍은 뺄 수 없다.
     · ★ = 그 쌍의 마지막(비교) 장면만 길어진다. 자리·크기는 비교 방식 소관이라
           바꾸는 척하지 않는다.
     · 만든 뒤(Workspace)에는 ★ 만 — ⊘ 는 되살릴 근거가 없어 정직 거부.
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
  try { window.eval(fs.readFileSync(f, 'utf8')); } catch (e) { /* 부트 부작용은 무시 — 엔진만 본다 */ }
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
const mkPairs = (n) => Array.from({ length: n }, (_, i) => ({ before: img(i * 2), after: img(i * 2 + 1), title: '쌍' + (i + 1), resultText: '' }));
const build = (n, roles, opt) => S.buildSmart(TPL, { pairs: mkPairs(n), ...(roles ? { pairRoles: roles } : {}),
  texts: { title: 'T', result: 'R' }, ratio: '16:9' }, { seed: 's1', ...(opt || {}) });
const keysOf = (doc) => [...new Set(doc.scenes.filter((s) => s.pairKey != null).map((s) => String(s.pairKey)))];
const photos = (doc) => new Set(doc.scenes.flatMap((s) => (s.elements || []).filter((e) => e.kind === 'image' && e.src).map((e) => e.src))).size;

console.log('\n[R69] 쌍 역할 지정 — 엔진');

T('T1 준비: 쌍 템플릿·엔진 존재', () => (TPL && S && X && M && C) ? true : 'missing');
T('T2 역할 없으면 R68 과 같은 결과(회귀)', () => {
  const a = build(4), b = build(4, {});
  return a.doc.scenes.length === b.doc.scenes.length && a.total === b.total ? true : `${a.total} vs ${b.total}`;
});
T('T3 pairRoles 는 엔진 입력으로 새지 않는다', () => {
  const inp = { pairs: mkPairs(3), pairRoles: { '0': 'highlight' }, texts: { title: 'T' }, ratio: '16:9' };
  const r = S.buildSmart(TPL, inp, { seed: 's1' });
  return (r.ok && inp.pairRoles && !('pairRoles' in (r.doc.meta.svar || {}))) ? true : 'leaked';
});

console.log('\n[⊘ 빼기]');
T('T4 뺀 쌍은 장면에서 사라진다', () => {
  const base = build(4), ex = build(4, { '2': 'exclude' });
  const bk = keysOf(base.doc), ek = keysOf(ex.doc);
  return (bk.includes('2') && !ek.includes('2') && ek.length === bk.length - 1) ? true : bk + ' / ' + ek;
});
T('T5 남은 쌍의 사진은 한 장도 안 준다', () => {
  const ex = build(4, { '2': 'exclude' });
  return photos(ex.doc) === 6 ? true : '사진 ' + photos(ex.doc) + '장(기대 6)';
});
T('T6 뺐다는 사실을 말한다(조용히 빼지 않는다)', () => {
  const ex = build(4, { '2': 'exclude' });
  return (ex.warnings || []).some((w) => /뺀 쌍/.test(w)) ? true : (ex.warnings || []).join('|');
});
T('T7 전부 빼면 정직 거부', () => {
  const r = build(2, { '0': 'exclude', '2': 'exclude' });
  return (!r.ok && r.why === 'all-excluded' && /남겨/.test(r.guide || '')) ? true : JSON.stringify(r.why);
});
T('T8 잠근 쌍은 빼지 않고 이유를 말한다', () => {
  const r = build(4, { '2': 'exclude' }, { lockedPairKeys: ['2'] });
  return (r.ok && keysOf(r.doc).includes('2') && (r.warnings || []).some((w) => /잠근 쌍/.test(w) && /빼지/.test(w)))
    ? true : keysOf(r.doc).join(',') + ' | ' + (r.warnings || []).join('|');
});
T('T9 뺀 쌍은 문서 근거(meta.pairs)에도 없다', () => {
  const ex = build(4, { '2': 'exclude' });
  const bs = (ex.doc.meta.svar.pairs || []).map((d) => String(d.b));
  return !bs.includes('2') && bs.length === 3 ? true : bs.join(',');
});
T('T10 뺀 쌍의 ★ 는 문서에 적지 않는다(지킬 수 없는 약속 금지)', () => {
  const r = build(4, { '2': 'exclude', '4': 'highlight' });
  const roles = r.doc.meta.svar.roles || {};
  return (roles['4'] === 'highlight' && !roles['2']) ? true : JSON.stringify(roles);
});

console.log('\n[★ 중요]');
T('T11 ★ 는 그 쌍을 정확히 1.0초 늘린다', () => {
  const a = build(3), b = build(3, { '0': 'highlight' });
  const d = Math.round((b.total - a.total) * 10) / 10;
  return d === 1 ? true : '차이 ' + d + '초';
});
T('T12 ★ 는 장면 수를 바꾸지 않는다', () => {
  const a = build(3), b = build(3, { '0': 'highlight' });
  return a.doc.scenes.length === b.doc.scenes.length ? true : a.doc.scenes.length + ' vs ' + b.doc.scenes.length;
});
T('T13 가산은 그 쌍의 장면 하나에만', () => {
  const b = build(3, { '0': 'highlight' });
  const marked = b.doc.scenes.filter((s) => s.svar && s.svar.hlAdd);
  return (marked.length === 1 && String(marked[0].pairKey) === '0') ? true : marked.length + '개';
});
T('T14 ★ 2개면 2장면·2.0초', () => {
  const a = build(4), b = build(4, { '0': 'highlight', '4': 'highlight' });
  const marked = b.doc.scenes.filter((s) => s.svar && s.svar.hlAdd).length;
  return (marked === 2 && Math.round((b.total - a.total) * 10) / 10 === 2) ? true : marked + '개 / ' + (b.total - a.total);
});
T('T15 없는 쌍에 ★ 를 걸면 조용히 넘기지 않는다', () => {
  const r = build(2, { '99': 'highlight' });
  return (r.ok && (r.warnings || []).some((w) => /중요 표시/.test(w))) ? true : (r.warnings || []).join('|');
});
T('T16 ★ 는 사진 수를 바꾸지 않는다', () => {
  const a = build(4), b = build(4, { '0': 'highlight' });
  return photos(a.doc) === photos(b.doc) && photos(b.doc) === 8 ? true : photos(a.doc) + ' vs ' + photos(b.doc);
});
T('T17 같은 씨앗·같은 역할 = 같은 결과(결정론)', () => {
  const a = build(4, { '0': 'highlight', '2': 'exclude' });
  const b = build(4, { '0': 'highlight', '2': 'exclude' });
  return (a.total === b.total && keysOf(a.doc).join() === keysOf(b.doc).join()) ? true : 'drift';
});

console.log('\n[문서 왕복 · 재구성]');
T('T18 문서만으로 ★ 가 되살아난다', () => {
  const b = build(3, { '0': 'highlight' });
  const fi = X.pairInputFromDoc(b.doc, b.doc.meta.svar);
  return (fi.ok && fi.input.pairRoles && fi.input.pairRoles['0'] === 'highlight') ? true : JSON.stringify(fi.input && fi.input.pairRoles);
});
T('T19 「다른 구성」 후에도 ★ 가 유지된다', () => {
  const b = build(3, { '0': 'highlight' });
  const fi = X.pairInputFromDoc(b.doc, b.doc.meta.svar);
  const re = X.recompose(fi.templateId, fi.input, { prevDoc: b.doc, seed: 's9' });
  const marked = re.doc.scenes.filter((s) => s.svar && s.svar.hlAdd);
  return (re.ok && marked.length === 1 && (re.doc.meta.svar.roles || {})['0'] === 'highlight') ? true : marked.length + ' / ' + JSON.stringify(re.doc.meta.svar.roles);
});
T('T20 뺀 쌍은 재구성해도 돌아오지 않는다(정직 — 근거가 없다)', () => {
  const b = build(4, { '2': 'exclude' });
  const fi = X.pairInputFromDoc(b.doc, b.doc.meta.svar);
  return (fi.ok && fi.input.pairs.length === 3) ? true : (fi.input && fi.input.pairs.length);
});
T('T21 ★ + 잠금 공존 — 잠근 쌍 장면 무손상', () => {
  const b = build(4, { '0': 'highlight' });
  const g = X.pairGroups(b.doc);
  X.setPairLock(b.doc, g[1].key, true);
  const before = JSON.stringify(X.pairGroupOf(b.doc, g[1].key).scenes.map((s) => [s.specId, s.duration]));
  const fi = X.pairInputFromDoc(b.doc, b.doc.meta.svar);
  const re = X.recompose(fi.templateId, fi.input, { prevDoc: b.doc, seed: 's7' });
  if (!re.ok) return re.why;
  const after = JSON.stringify(X.pairGroupOf(re.doc, g[1].key).scenes.map((s) => [s.specId, s.duration]));
  return before === after ? true : before + ' → ' + after;
});

console.log('\n[Workspace 계약]');
T('T22 setPairRole 이 길이를 늘리고 요약에 잡힌다', () => {
  const b = build(3);
  const g = X.pairGroups(b.doc);
  const last = g[1].scenes[g[1].scenes.length - 1];
  const d0 = last.duration;
  const r = X.setPairRole(b.doc, g[1].key, 'highlight');
  const sm = X.pairRoleSummary(b.doc);
  return (r.ok && r.highlight && Math.round((r.duration - d0) * 10) / 10 === 1 && sm.highlight === 1) ? true : JSON.stringify({ r: r.duration, d0, sm });
});
T('T23 다시 누르면 원래 길이로 정확히 복귀', () => {
  const b = build(3);
  const g = X.pairGroups(b.doc);
  const d0 = g[1].scenes[g[1].scenes.length - 1].duration;
  X.setPairRole(b.doc, g[1].key, 'highlight');
  X.setPairRole(b.doc, g[1].key, 'highlight');
  const d1 = X.pairGroups(b.doc)[1].scenes.slice(-1)[0].duration;
  return (d1 === d0 && !(b.doc.meta.svar.roles && Object.keys(b.doc.meta.svar.roles).length)) ? true : d0 + ' → ' + d1;
});
T('T24 두 번 걸어도 두 번 늘어나지 않는다', () => {
  const b = build(3, { '0': 'highlight' });
  const g0 = X.pairGroupOf(b.doc, '0');
  const d0 = g0.scenes[g0.scenes.length - 1].duration;
  const r = X.setPairRole(b.doc, '0', 'highlight'); /* 이미 ★ → 해제 */
  const back = X.pairGroupOf(b.doc, '0').scenes.slice(-1)[0].duration;
  return (!r.highlight && Math.round((d0 - back) * 10) / 10 === 1) ? true : d0 + ' → ' + back;
});
T('T25 만든 뒤 ⊘ 는 정직 거부', () => {
  const b = build(3);
  const r = X.setPairRole(b.doc, X.pairGroups(b.doc)[0].key, 'exclude');
  return (!r.ok && r.why === 'pair-exclude-here' && /되돌릴 수 없/.test(r.guide || '')) ? true : JSON.stringify(r);
});
T('T26 없는 쌍·엉뚱한 역할은 거부', () => {
  const b = build(3);
  const a = X.setPairRole(b.doc, 'zzz', 'highlight'), c = X.setPairRole(b.doc, X.pairGroups(b.doc)[0].key, 'weird');
  return (!a.ok && a.why === 'no-pair' && !c.ok && c.why === 'bad-role') ? true : JSON.stringify([a.why, c.why]);
});

console.log('\n[화면 배선]');
T('T27 #/video 쌍 스테이지에 역할 칩이 그려진다', () => {
  const H = window.MK_VIDHUB;
  if (!H || !H.renderPairRoleChips) return 'no hub';
  const c = H.renderPairRoleChips(0);
  return (/data-vh-prole="highlight"/.test(c) && /data-vh-prole="exclude"/.test(c)) ? true : c.slice(0, 40);
});
T('T28 쌍 자리를 옮기면 역할도 따라간다', () => {
  const H = window.MK_VIDHUB;
  H.st.stage = 'pairs'; H.st.pairs = [{ before: img(0), after: img(1), title: 'A' }, { before: img(2), after: img(3), title: 'B' }];
  H.st.pairRoles = ['highlight', ''];
  H.movePair(0, 1);
  return (H.st.pairs[1].title === 'A' && H.st.pairRoles[1] === 'highlight') ? true : JSON.stringify([H.st.pairs.map((p) => p.title), H.st.pairRoles]);
});
T('T29 쌍을 지우면 역할도 지워진다', () => {
  const H = window.MK_VIDHUB;
  H.st.pairs = [{ before: img(0), after: img(1), title: 'A' }, { before: img(2), after: img(3), title: 'B' }];
  H.st.pairRoles = ['', 'exclude'];
  H.removePair(0);
  return (H.st.pairs.length === 1 && H.st.pairRoles.length === 1 && H.st.pairRoles[0] === 'exclude') ? true : JSON.stringify(H.st.pairRoles);
});
T('T30 smartInput 이 역할을 이름표 기준으로 넘긴다', () => {
  const H = window.MK_VIDHUB;
  H.st.stage = 'pairs';
  H.st.pairs = [{ before: img(0), after: img(1), title: 'A' }, { before: null, after: null, title: '빈' }, { before: img(4), after: img(5), title: 'C' }];
  H.st.pairRoles = ['', '', 'exclude'];
  const inp = H.smartInput();
  /* 빈 쌍이 걸러져 C 는 두 번째 자리 → 이름표는 2 */
  return (inp.pairs.length === 2 && inp.pairRoles && inp.pairRoles['2'] === 'exclude') ? true : JSON.stringify(inp.pairRoles) + ' / ' + inp.pairs.length;
});
T('T31 Workspace 에 쌍 ★ 버튼이 있다', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/workspace.js'), 'utf8');
  return (/data-ws-pairstar/.test(src) && /setPairRole/.test(src)) ? true : 'missing';
});

console.log('\n[평면 회귀]');
T('T32 평면 사진 경로는 그대로', () => {
  const t2 = M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && !c.pairMode; });
  const r = S.buildSmart(t2.id, { medias: Array.from({ length: 6 }, (_, i) => img(i)), texts: { title: 'T' }, ratio: '16:9' }, { seed: 's1' });
  return (r.ok && r.doc.scenes.length > 0) ? true : 'plain broken';
});
T('T33 감사(audit) 통과', () => {
  const a = X.audit ? X.audit() : null;
  return (!a || a.ok !== false) ? true : JSON.stringify(a).slice(0, 80);
});

console.log('\n────────────  R69: ' + pass + '/' + (pass + fail) + ' 통과  ────────────\n');
process.exit(fail ? 1 : 0);
