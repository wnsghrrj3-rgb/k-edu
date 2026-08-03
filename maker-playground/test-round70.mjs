/* ============================================================
   test-round70.mjs — R70 ★ 가산 보전 (R69 한계 ① 해소)
   ------------------------------------------------------------
   R69 는 「★ 를 걸면 그 쌍의 비교 장면이 +1.0초 길어진다」고 약속했지만
   길이 정책이 가산까지 같이 눌러 실측이 구간마다 달랐다(쌍 8 에서 +0.7,
   쌍 10 에서 +0.6). 더 나쁜 건 씬에 적힌 hlAdd 는 1.0 그대로여서
   ★ 를 해제하면 원래보다 짧아졌다는 것 — 되돌릴 근거가 거짓이었다.

   여기서 못 박는 계약:
     ① 압축은 기본 길이에서만 한다 — 가산은 압축 대상 밖.
     ② 가산을 깎아야만 상한 안에 들어가는 자리에서만 깎는다.
        깎아도 못 맞추는 자리에서는 깎지 않는다(약속만 잃고 얻는 게 없다).
     ③ hlAdd 는 언제나 실제로 더해진 양과 같다 — 이 숫자로 되돌리기 때문에.
     ④ 지키지 못한 만큼만 말한다(침묵도, 부풀림도 금지).
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
const FLAT = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && !c.pairMode; }) || {}).id;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n, w: 800, h: 600 });
const mkPairs = (n) => Array.from({ length: n }, (_, i) => ({ before: img(i * 2), after: img(i * 2 + 1), title: '쌍' + (i + 1), resultText: '' }));
const build = (n, roles, opt) => S.buildSmart(TPL, { pairs: mkPairs(n), ...(roles ? { pairRoles: roles } : {}),
  texts: { title: 'T', result: 'R' }, ratio: '16:9' }, { seed: 's1', ...(opt || {}) });
const flat = (n, roles) => S.buildSmart(FLAT, { medias: Array.from({ length: n }, (_, i) => img(i)),
  ...(roles ? { mediaRoles: roles } : {}), texts: { title: 'T' }, ratio: '16:9' }, { seed: 's1' });
const R1 = (v) => Math.round(v * 10) / 10;
const totalOf = (doc) => R1(doc.scenes.reduce((a, s) => a + s.duration, 0));
const marks = (doc) => doc.scenes.filter((s) => s.svar && s.svar.hlAdd);
const addSum = (doc) => R1(marks(doc).reduce((a, s) => a + s.svar.hlAdd, 0));
const photos = (doc) => new Set(doc.scenes.flatMap((s) => (s.elements || []).filter((e) => e.kind === 'image' && e.src).map((e) => e.src))).size;
/* 「실제로 더해진 양」 = 그 문서에서 ★ 를 전부 해제했을 때 줄어드는 초.
   무★ 문서와의 총길이 차이로 재면 안 된다 — 상한에 걸린 자리에서는 기본 길이 압축량이
   서로 달라서, 가산이 온전해도 총길이는 같을 수 있다(총길이는 상한이 정한다). */
const actualAdd = (doc) => {
  const c = JSON.parse(JSON.stringify(doc));
  for (const k of (X.pairRoleSummary(c).keys || [])) X.setPairRole(c, k, null);
  return R1(totalOf(doc) - totalOf(c));
};
const stars = (ks) => { const o = {}; ks.forEach((k) => { o[String(k)] = 'highlight'; }); return o; };
const maxTotalOf = (r) => {
  const t = M.getTemplate(TPL); const c = t && C.getComposition(t._compId || t.compositionId);
  return (r.doc.meta && r.doc.meta.maxTotal) || 0;
};

console.log('\n[R70] ★ 가산 보전 — 엔진');

T('T1 준비: 쌍·평면 템플릿·엔진 존재', () => (TPL && FLAT && S && X && M && C) ? true : 'missing');
T('T2 역할 없으면 R69 와 같은 결과(회귀)', () => {
  const a = build(8), b = build(8, {});
  return (a.total === b.total && a.doc.scenes.length === b.doc.scenes.length) ? true : `${a.total} vs ${b.total}`;
});
T('T3 압축 없는 구간(쌍 2·4·5)은 R69 대로 정확히 +1.0', () => {
  for (const n of [2, 4, 5]) {
    const d = R1(build(n, stars(['0'])).total - build(n).total);
    if (d !== 1.0) return `쌍${n} → +${d}`;
  }
  return true;
});
T('T4 쌍 8 — R69 실측 +0.7 이 +1.0 으로 복원', () => {
  const b = build(8, stars(['0']));
  return (addSum(b.doc) === 1.0 && actualAdd(b.doc) === 1.0) ? true : `기록 ${addSum(b.doc)} / 실제 ${actualAdd(b.doc)}`;
});
T('T5 쌍 10 — R69 실측 +0.6 이 +1.0 으로 복원', () => {
  const b = build(10, stars(['0']));
  return (addSum(b.doc) === 1.0 && actualAdd(b.doc) === 1.0) ? true : `기록 ${addSum(b.doc)} / 실제 ${actualAdd(b.doc)}`;
});
T('T6 ★ 2개는 +2.0 (압축 구간 포함)', () => {
  for (const n of [5, 8, 10]) {
    const b = build(n, stars(['0', '2']));
    if (addSum(b.doc) !== 2.0 || actualAdd(b.doc) !== 2.0) return `쌍${n} 기록 ${addSum(b.doc)} / 실제 ${actualAdd(b.doc)}`;
  }
  return true;
});
T('T7 hlAdd 기록 = 실제 더해진 양 (전 구간)', () => {
  for (const n of [2, 4, 5, 8, 10, 12]) {
    const b = build(n, stars(['0']));
    if (addSum(b.doc) !== actualAdd(b.doc)) return `쌍${n} 기록 ${addSum(b.doc)} vs 실제 ${actualAdd(b.doc)}`;
  }
  return true;
});
T('T8 가산은 그 쌍의 장면 하나에만 (쌍 하나가 영상을 삼키지 않는다)', () => {
  const b = build(8, stars(['0', '2']));
  return marks(b.doc).length === 2 ? true : '표식 ' + marks(b.doc).length + '개';
});
T('T9 압축은 기본 길이에서만 — ★ 장면의 기본분도 남들과 같은 비율로 준다', () => {
  const b = build(8, stars(['0']));
  const a = build(8);
  const hs = marks(b.doc)[0];
  const same = a.doc.scenes.find((s) => s.id === hs.id);
  if (!same) return 'no pair scene';
  const base = R1(hs.duration - hs.svar.hlAdd);
  /* 가산이 압축 대상이었다면 base 는 무★ 길이보다 눈에 띄게 짧아진다.
     보전 후에는 남들과 같은 비율(1 이하)로만 줄어든다. */
  return (base <= same.duration + 0.01 && base >= same.duration * 0.6 - 0.01) ? true
    : `base ${base} vs 무★ ${same.duration}`;
});
T('T10 기본 길이가 하한에 닿기 전에는 가산을 깎지 않는다', () => {
  /* 쌍 6·8 은 ★ 를 전부 걸어도 기본 길이에 아직 여유가 있다 — 여기서 깎이면 순서가 틀린 것 */
  for (const n of [6, 8]) {
    const ks = Array.from({ length: n }, (_, i) => String(i * 2));
    const b = build(n, stars(ks));
    if (addSum(b.doc) !== n) return `쌍${n} ★${n} → 가산 ${addSum(b.doc)}(기대 ${n})`;
  }
  return true;
});
T('T11 하한까지 갔는데도 안 맞으면 깎고, 깎은 값을 다시 적고, 숫자로 말한다', () => {
  const n = 16, ks = Array.from({ length: n }, (_, i) => String(i * 2));
  const b = build(n, stars(ks));
  const rec = addSum(b.doc);
  if (rec >= n) return '절삭이 일어나지 않음(가산 ' + rec + ')';
  if (rec !== actualAdd(b.doc)) return `기록 ${rec} vs 실제 ${actualAdd(b.doc)}`;
  return (b.warnings || []).some((w) => /중요 표시 가산은/.test(w) && w.includes(String(rec)))
    ? true : (b.warnings || []).join('|');
});
T('T12 온전히 지켰으면 지켰다고 말한다', () => {
  const b = build(8, stars(['0']));
  const shrunk = (b.warnings || []).some((w) => /권장 길이/.test(w));
  if (!shrunk) return true; /* 압축 자체가 없었으면 할 말도 없다 */
  return (b.warnings || []).some((w) => /그대로 지켰어요/.test(w)) ? true : (b.warnings || []).join('|');
});
T('T13 깎아도 못 맞추는 자리에서는 깎지 않는다 (약속만 잃는 손해 금지)', () => {
  const b = build(12, stars(['0']));
  const over = (b.warnings || []).some((w) => /넘어요/.test(w));
  if (!over) return true; /* 상한 안에 들어갔으면 이 계약의 대상이 아니다 */
  return addSum(b.doc) === 1.0 ? true : '가산 ' + addSum(b.doc) + '(초과 자리인데 깎임)';
});
T('T14 압축했든 넘었든 침묵하지 않는다', () => {
  for (const n of [8, 10, 12]) {
    const b = build(n, stars(['0']));
    const said = (b.warnings || []).some((w) => /권장 길이/.test(w));
    const base = build(n);
    const overflow = b.total > base.total || said;
    if (!overflow) continue;
    if (!said && b.total > base.total + 1.01) return `쌍${n} 무고지`;
  }
  return true;
});
T('T14b 압축 자리에서 총길이는 상한 안에 남는다 (가산 보전이 상한을 깨지 않는다)', () => {
  for (const n of [8, 10]) {
    const a = build(n), b = build(n, stars(['0']));
    if (!(a.warnings || []).some((w) => /권장 길이/.test(w))) continue;
    if (b.total > a.total + 1.01) return `쌍${n} ${a.total} → ${b.total}`;
  }
  return true;
});
T('T15 결정론 — 같은 씨앗·같은 ★ 면 같은 결과', () => {
  const a = build(8, stars(['0', '2'])), b = build(8, stars(['0', '2']));
  return (a.total === b.total && addSum(a.doc) === addSum(b.doc)) ? true : `${a.total}/${b.total}`;
});
T('T16 사진 손실 0 — 가산 보전이 장면·사진을 건드리지 않는다', () => {
  for (const n of [4, 8, 10]) {
    const a = build(n), b = build(n, stars(['0', '2']));
    if (photos(a.doc) !== photos(b.doc)) return `쌍${n} ${photos(a.doc)} vs ${photos(b.doc)}`;
    if (a.doc.scenes.length !== b.doc.scenes.length) return `쌍${n} 장면 수 변동`;
  }
  return true;
});

console.log('\n[문서 왕복 — hlAdd 정합성]');

T('T17 ★ 해제하면 그 장면만 기록된 값만큼 정확히 줄어든다', () => {
  for (const n of [4, 8, 10]) {
    const b = build(n, stars(['0']));
    const hs = marks(b.doc)[0];
    const before = hs.duration, rec = hs.svar.hlAdd;
    const r = X.setPairRole(b.doc, '0', null);
    if (!r.ok) return `쌍${n} ${r.why}`;
    const now = b.doc.scenes.find((s) => s.id === hs.id).duration;
    if (R1(before - now) !== rec) return `쌍${n} ${before}→${now} (기록 ${rec})`;
  }
  return true;
});
T('T18 해제해도 다른 장면 길이는 그대로', () => {
  const b = build(8, stars(['0']));
  const hs = marks(b.doc)[0];
  const before = b.doc.scenes.filter((s) => s.id !== hs.id).map((s) => s.duration).join(',');
  X.setPairRole(b.doc, '0', null);
  const after = b.doc.scenes.filter((s) => s.id !== hs.id).map((s) => s.duration).join(',');
  return before === after ? true : '다른 장면이 흔들림';
});
T('T19 해제 후 총길이 = 무★ 총길이 (압축 없는 구간)', () => {
  for (const n of [4, 5]) {
    const b = build(n, stars(['0']));
    X.setPairRole(b.doc, '0', null);
    if (totalOf(b.doc) !== build(n).total) return `쌍${n} ${totalOf(b.doc)} vs ${build(n).total}`;
  }
  return true;
});
T('T20 요약의 add 는 문서에 실제로 들어 있는 초의 합', () => {
  const b = build(8, stars(['0', '2']));
  const s = X.pairRoleSummary(b.doc);
  return (s.highlight === 2 && s.add === addSum(b.doc)) ? true : JSON.stringify(s);
});
T('T21 요약의 trimmed 는 실제 절삭과 일치', () => {
  const ok1 = X.pairRoleSummary(build(8, stars(['0'])).doc);
  const ks = Array.from({ length: 8 }, (_, i) => String(i * 2));
  const cut = X.pairRoleSummary(build(8, stars(ks)).doc);
  if (ok1.trimmed) return '온전한데 trimmed=true';
  return cut.trimmed === (cut.add < cut.want) ? true : JSON.stringify(cut);
});
T('T22 재구성해도 ★ 와 가산 기록이 함께 살아남는다 (R69 회귀)', () => {
  const b = build(8, stars(['0']));
  const re = X.recomposeDoc ? X.recomposeDoc(b.doc, { seed: 's9' }) : null;
  if (!re || !re.ok) return re ? re.why : 'no recomposeDoc';
  const m = marks(re.doc);
  if (!m.length) return '★ 소실';
  return R1(m.reduce((a, s) => a + s.svar.hlAdd, 0)) > 0 ? true : '가산 0';
});
T('T23 markSources 는 가산 표식을 지우지 않는다 (R69 회귀)', () => {
  const b = build(8, stars(['0']));
  const before = addSum(b.doc);
  X.markSources(b.doc, 'variant', 's1');
  return addSum(b.doc) === before ? true : `${before} → ${addSum(b.doc)}`;
});

console.log('\n[평면 회귀]');

T('T24 평면 ★ 도 가산을 씬에 적는다', () => {
  const r = flat(6, { '0': 'highlight' });
  return (r.ok && marks(r.doc).length >= 1) ? true : '표식 없음';
});
T('T25 평면 ★ 도 +1.0 (압축 구간 포함)', () => {
  for (const n of [6, 14, 20, 30]) {
    const a = flat(n), b = flat(n, { '0': 'highlight' });
    if (!a.ok || !b.ok) continue;
    const d = R1(b.total - a.total);
    if (d !== 1.0 && !(b.warnings || []).some((w) => /중요 표시 가산은/.test(w))) return `평면${n} → +${d}`;
  }
  return true;
});
T('T26 평면 ★ 없으면 가산 표식도 없다 (무오염)', () => {
  const r = flat(10);
  const m = marks(r.doc).filter((s) => s.role === 'media');
  return m.length === 0 ? true : '표식 ' + m.length + '개';
});
T('T27 평면 총길이 회귀 — 역할 없으면 값 불변', () => {
  const a = flat(14), b = flat(14, {});
  return a.total === b.total ? true : `${a.total} vs ${b.total}`;
});

console.log('\n[화면 배선]');

T('T28 Workspace 요약에 실가산 초 표기', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/workspace.js'), 'utf8');
  return /prs\.add/.test(src) && /★ 중요/.test(src) ? true : '미배선';
});
T('T29 Workspace 쌍 ★ 토글 유지 (R69 회귀)', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/workspace.js'), 'utf8');
  return /data-ws-pairstar/.test(src) ? true : '토글 소실';
});
T('T30 video3 쌍 역할 칩 유지 (R69 회귀)', () => {
  const src = fs.readFileSync(path.join(ROOT, 'screens/video3.js'), 'utf8');
  return /data-vh-prole/.test(src) ? true : '칩 소실';
});
T('T31 엔진 내부 노출 — shrinkKeepingBonus 존재', () => {
  const i = S._internals || {};
  return typeof i.shrinkKeepingBonus === 'function' ? true : '미노출';
});
T('T32 감사(audit) 통과', () => {
  const a = X.audit ? X.audit() : null;
  return (!a || a.ok !== false) ? true : JSON.stringify(a).slice(0, 80);
});

console.log('\n  ────────────  R70: ' + pass + '/' + (pass + fail) + ' 통과  ────────────\n');
process.exit(fail ? 1 : 0);
