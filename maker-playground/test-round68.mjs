/* R68 — 쌍 단위 잠금 (§12 「다른 구성」 · §19 저장=실행 포맷 · §28 문서만으로 재구성)
   R67 은 쌍 문서에 잠긴 장면이 있으면 정직하게 거부했다(pair-locked).
   R68 은 지켜야 할 단위를 장면에서 쌍으로 올려 그 거부를 실제로 없앤다. */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const bodyHtml = (html.match(/<body[^>]*>([\s\S]*?)<script/) || [, ''])[1];
const dom = new JSDOM('<!doctype html><html><body>' + bodyHtml + '<div id="app"></div></body></html>', {
  url: 'https://x.test/#/video', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
try { window.localStorage.setItem('__t', '1'); } catch { Object.defineProperty(window, 'localStorage', { value: (() => { const s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = String(v); }, removeItem: (k) => { delete s[k]; }, clear: () => {} }; })() }); }
window.alert = () => {}; window.confirm = () => true;

/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
for (const m of html.matchAll(/<script src="([^?"]+)/g)) {
  const p = m[1];
  try { __ld(p); }
  catch (e) { console.error('LOAD FAIL', p, e.message); process.exit(1); }
}

const S = window.MK_SVAR, X = window.MK_SVARX, H = window.MK_VIDHUB, B = window.MK_TBUILD;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✅', name); } catch (e) { fail++; console.log('  ❌', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const clone = (o) => JSON.parse(JSON.stringify(o));

const mkPairs = (n) => Array.from({ length: n }, (_, i) => ({
  before: { name: 'b' + i, kind: 'image', src: 'data:image/png;base64,B' + i, w: 800, h: 600 },
  after: { name: 'a' + i, kind: 'image', src: 'data:image/png;base64,A' + i, w: 800, h: 600 },
  title: '쌍' + i, resultText: '결과' + i }));
const pairBuild = (n, seed, ratio) => S.buildSmart('tm-beforeafter',
  { pairs: mkPairs(n), texts: { title: '전후', result: '끝' }, ratio: ratio || '16:9' }, seed ? { seed } : {});
const keysOf = (doc) => X.pairGroups(doc).map((g) => g.key);
const shotOf = (doc, key) => JSON.stringify(doc.scenes.filter((s) => String(s.pairKey) === String(key)).map((s) => s.elements));
const srcsIn = (doc) => new Set(doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'image' && e.src).map((e) => e.src)));
const img = (i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,IMG' + i, w: 800, h: 600 });
const lands = (n) => Array.from({ length: n }, (_, i) => img(i));
const placed = (doc) => doc.scenes.reduce((a, s) => a + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);

console.log('R68 — 쌍 단위 잠금');

/* ---------- 쌍 이름표 (근거) ---------- */
T('T1 쌍 장면에 이름표(pairKey)가 실린다 — 쌍 밖 장면엔 없다', () => {
  const r = pairBuild(4, 'k1');
  A(r.ok, 'build: ' + (r.why || ''));
  const withKey = r.doc.scenes.filter((s) => s.pairKey != null);
  const without = r.doc.scenes.filter((s) => s.pairKey == null);
  A(withKey.length >= 8, '쌍 장면 이름표 ' + withKey.length);
  A(without.length >= 1, '제목·마무리 장면에도 이름표가 붙음');
  A(new Set(withKey.map((s) => String(s.pairKey))).size === 4, '쌍 4개가 안 잡힘');
});

T('T2 이름표는 회차가 바뀌어도 그대로다 (자리 인덱스가 아니라 원본 사진 인덱스)', () => {
  const r = pairBuild(5, 'k2');
  X.markSources(r.doc, 'auto', 'k2');
  const before = keysOf(r.doc).slice().sort();
  const r2 = X.recomposeDoc(r.doc, { seed: 'k2b' });
  A(r2.ok, r2.why || '');
  const after = keysOf(r2.doc).slice().sort();
  A(JSON.stringify(before) === JSON.stringify(after), '이름표 집합이 달라짐 ' + before + ' → ' + after);
});

T('T3 이름표는 렌더 요소가 아니다 (화면으로 새지 않음)', () => {
  const r = pairBuild(3, 'k3');
  const leak = r.doc.scenes.flatMap((s) => s.elements).filter((e) => e.pairKey != null);
  A(!leak.length, '요소에 이름표 누출 ' + leak.length);
  const txt = r.doc.scenes.flatMap((s) => s.elements).filter((e) => e.kind === 'text').map((e) => e.text).join(' ');
  A(!/pairKey/.test(txt), '텍스트에 이름표 노출');
});

T('T4 쌍 그룹 요약 — 쌍 수·장면 수·상태', () => {
  const r = pairBuild(4, 'k4');
  const gs = X.pairGroups(r.doc);
  A(gs.length === 4, '쌍 ' + gs.length);
  A(gs.every((g) => g.count >= 2), '한 쌍이 2장면 미만');
  A(gs.every((g) => g.state === 'none'), '갓 만든 문서에 잠금 상태가 있음');
  A(gs.map((g) => g.no).join(',') === '1,2,3,4', '쌍 번호 ' + gs.map((g) => g.no));
});

/* ---------- 쌍 잠금 API ---------- */
T('T5 쌍을 잠그면 그 쌍의 장면이 전부 잠긴다 (반쪽 상태를 남기지 않음)', () => {
  const r = pairBuild(4, 'k5'); X.markSources(r.doc, 'auto', 'k5');
  const g = X.pairGroups(r.doc)[2];
  const res = X.setPairLock(r.doc, g.key, true);
  A(res.ok && res.scenes === g.count, '잠금 결과 ' + JSON.stringify(res));
  const g2 = X.pairGroupOf(r.doc, g.key);
  A(g2.state === 'full', '상태 ' + g2.state);
  A(g2.scenes.every((s) => s.svar && s.svar.locked), '일부 장면이 안 잠김');
});

T('T6 쌍 잠금 해제도 통째로 — 다른 쌍은 안 건드린다', () => {
  const r = pairBuild(4, 'k6'); X.markSources(r.doc, 'auto', 'k6');
  const gs = X.pairGroups(r.doc);
  X.setPairLock(r.doc, gs[0].key, true);
  X.setPairLock(r.doc, gs[1].key, true);
  X.setPairLock(r.doc, gs[0].key, false);
  A(X.pairGroupOf(r.doc, gs[0].key).state === 'none', '해제 실패');
  A(X.pairGroupOf(r.doc, gs[1].key).state === 'full', '다른 쌍이 함께 풀림');
});

T('T7 한 장면만 잠그면 그 쌍은 반쪽(partial) — 숨기지 않고 그대로 보고한다', () => {
  const r = pairBuild(3, 'k7'); X.markSources(r.doc, 'auto', 'k7');
  const g = X.pairGroups(r.doc)[1];
  X.setLock(r.doc, g.scenes[0].id, true);
  const sum = X.pairLockSummary(r.doc);
  A(sum.partial === 1, '반쪽 ' + sum.partial);
  A(sum.partialKeys[0] === g.key, '반쪽 대상 불일치');
  A(sum.locked === 0, '반쪽인데 통째 잠금으로 셈');
});

T('T8 직접 고친 장면도 그 쌍을 반쪽으로 만든다 (자동이 사용자 것을 덮지 않음)', () => {
  const r = pairBuild(3, 'k8'); X.markSources(r.doc, 'auto', 'k8');
  const g = X.pairGroups(r.doc)[0];
  X.markEdited(r.doc, g.scenes[0].id);
  const g2 = X.pairGroupOf(r.doc, g.key);
  A(g2.state === 'partial', '상태 ' + g2.state);
  A(g2.edited === true, '수정 표시 없음');
});

/* ---------- 재구성 ---------- */
T('T9 R67 의 pair-locked 거부는 사라졌다 — 잠근 쌍이 있어도 다른 구성이 만들어진다', () => {
  const r = pairBuild(4, 'k9'); X.markSources(r.doc, 'auto', 'k9');
  X.setPairLock(r.doc, X.pairGroups(r.doc)[1].key, true);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k9b' });
  A(r2.ok, '거부됨: ' + (r2.why || ''));
  A(r2.why !== 'pair-locked', 'pair-locked 잔존');
  A(r2.lockedKept > 0, '지킨 장면 0');
});

T('T10 잠근 쌍은 자리도 내용도 그대로다', () => {
  const r = pairBuild(5, 'k10'); X.markSources(r.doc, 'auto', 'k10');
  const gs = X.pairGroups(r.doc);
  const target = gs[2];
  const pos = keysOf(r.doc).indexOf(target.key);
  X.setPairLock(r.doc, target.key, true);
  const shot = shotOf(r.doc, target.key);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k10b' });
  A(r2.ok, r2.why || '');
  A(keysOf(r2.doc).indexOf(target.key) === pos, '자리가 옮겨짐');
  A(shotOf(r2.doc, target.key) === shot, '내용이 바뀜');
});

T('T11 잠그지 않은 쌍은 순서가 다시 골라진다 (씨앗을 바꾸면 실제로 달라짐)', () => {
  const base = pairBuild(6, 'k11'); X.markSources(base.doc, 'auto', 'k11');
  X.setPairLock(base.doc, X.pairGroups(base.doc)[0].key, true);
  const before = keysOf(base.doc).join(',');
  let changed = false;
  for (const sd of ['a', 'b', 'c', 'd', 'e']) {
    const r2 = X.recomposeDoc(clone(base.doc), { seed: 'k11-' + sd });
    A(r2.ok, r2.why || '');
    if (keysOf(r2.doc).join(',') !== before) { changed = true; break; }
  }
  A(changed, '씨앗을 5번 바꿔도 순서가 그대로');
});

T('T12 잠근 쌍이 있으면 비교 방식은 유지된다 (방식이 바뀌면 그 쌍의 장면도 달라지므로)', () => {
  const r = pairBuild(4, 'k12'); X.markSources(r.doc, 'auto', 'k12');
  const m0 = r.doc.meta.svar.method;
  X.setPairLock(r.doc, X.pairGroups(r.doc)[1].key, true);
  for (const sd of ['m1', 'm2', 'm3', 'm4']) {
    const r2 = X.recomposeDoc(clone(r.doc), { seed: sd });
    A(r2.ok, r2.why || '');
    A(r2.doc.meta.svar.method === m0, '방식이 바뀜 ' + m0 + ' → ' + r2.doc.meta.svar.method);
  }
});

T('T13 잠근 쌍이 없으면 방식도 다시 골라진다 (R67 동작 유지)', () => {
  const r = pairBuild(4, 'k13'); X.markSources(r.doc, 'auto', 'k13');
  const seen = new Set([r.doc.meta.svar.method]);
  for (const sd of ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']) {
    const r2 = X.recomposeDoc(clone(r.doc), { seed: sd });
    if (r2.ok) seen.add(r2.doc.meta.svar.method);
  }
  A(seen.size > 1, '방식이 한 가지로 고정됨: ' + [...seen].join(','));
});

T('T14 전→후 방향은 어떤 경우에도 안 섞인다', () => {
  const r = pairBuild(5, 'k14'); X.markSources(r.doc, 'auto', 'k14');
  X.setPairLock(r.doc, X.pairGroups(r.doc)[3].key, true);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k14b' });
  A(r2.ok, r2.why || '');
  for (const d of (r2.doc.meta.svar.pairs || [])) {
    A(d.b == null || d.a == null || d.b < d.a, '전·후가 뒤집힘 b=' + d.b + ' a=' + d.a);
  }
});

T('T15 사진은 한 장도 잃지 않는다 (잠금 유무와 무관)', () => {
  const r = pairBuild(6, 'k15'); X.markSources(r.doc, 'auto', 'k15');
  const n0 = srcsIn(r.doc).size;
  X.setPairLock(r.doc, X.pairGroups(r.doc)[2].key, true);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k15b' });
  A(r2.ok, r2.why || '');
  A(srcsIn(r2.doc).size === n0, '사진 ' + n0 + ' → ' + srcsIn(r2.doc).size);
});

T('T16 여러 쌍을 잠가도 각각 제자리 (전부 잠그면 순서는 그대로)', () => {
  const r = pairBuild(4, 'k16'); X.markSources(r.doc, 'auto', 'k16');
  const order0 = keysOf(r.doc).join(',');
  for (const g of X.pairGroups(r.doc)) X.setPairLock(r.doc, g.key, true);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k16b' });
  A(r2.ok, r2.why || '');
  A(keysOf(r2.doc).join(',') === order0, '전부 잠갔는데 순서가 바뀜');
  A(r2.lockedKept >= 8, '지킨 장면 ' + r2.lockedKept);
});

T('T17 같은 씨앗 = 같은 결과 (잠금이 있어도 결정론)', () => {
  const mk = () => { const r = pairBuild(5, 'k17'); X.markSources(r.doc, 'auto', 'k17'); X.setPairLock(r.doc, X.pairGroups(r.doc)[1].key, true); return r.doc; };
  const a = X.recomposeDoc(mk(), { seed: 'fixed' });
  const b = X.recomposeDoc(mk(), { seed: 'fixed' });
  A(a.ok && b.ok, 'build');
  A(JSON.stringify(a.doc.scenes) === JSON.stringify(b.doc.scenes), '같은 씨앗인데 결과가 다름');
});

/* ---------- 반쪽 상태 ---------- */
T('T18 반쪽 잠긴 쌍은 정직하게 거부하고 어느 쌍인지 알려 준다', () => {
  const r = pairBuild(4, 'k18'); X.markSources(r.doc, 'auto', 'k18');
  const g = X.pairGroups(r.doc)[2];
  X.setLock(r.doc, g.scenes[0].id, true);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k18b' });
  A(!r2.ok, '반쪽인데 통과됨');
  A(r2.why === 'pair-partial-lock', 'why=' + r2.why);
  A((r2.partialKeys || []).includes(g.key), '대상 쌍 미보고');
  A(/통째/.test(r2.guide || ''), '해결 방법 안내 없음');
});

T('T19 반쪽을 통째 잠금으로 올리면 바로 통과한다', () => {
  const r = pairBuild(4, 'k19'); X.markSources(r.doc, 'auto', 'k19');
  const g = X.pairGroups(r.doc)[1];
  X.markEdited(r.doc, g.scenes[0].id);
  const bad = X.recomposeDoc(clone(r.doc), { seed: 'k19a' });
  A(!bad.ok && bad.why === 'pair-partial-lock', '거부 안 됨');
  (X.pairLockSummary(r.doc).partialKeys || []).forEach((k) => X.setPairLock(r.doc, k, true));
  const shot = shotOf(r.doc, g.key);
  const ok = X.recomposeDoc(r.doc, { seed: 'k19b' });
  A(ok.ok, '승격 후에도 거부: ' + (ok.why || ''));
  A(shotOf(ok.doc, g.key) === shot, '직접 고친 쌍이 덮임');
});

T('T20 쌍 밖 장면(제목·마무리)을 잠가도 그 자리 그대로 남는다', () => {
  const r = pairBuild(4, 'k20'); X.markSources(r.doc, 'auto', 'k20');
  const free = r.doc.scenes.find((s) => s.pairKey == null);
  A(free, '쌍 밖 장면 없음');
  X.setLock(r.doc, free.id, true);
  const shot = JSON.stringify(free.elements);
  const r2 = X.recomposeDoc(r.doc, { seed: 'k20b' });
  A(r2.ok, r2.why || '');
  const same = r2.doc.scenes.find((s) => s.pairKey == null && s.specId === free.specId);
  A(same && JSON.stringify(same.elements) === shot, '쌍 밖 잠긴 장면이 안 지켜짐');
});

/* ---------- 화면 ---------- */
T('T21 Workspace — 쌍 장면에서 「쌍 통째 잠그기」가 뜬다', () => {
  const SC = window.MK_SCREENS.workspace;
  const r = pairBuild(4, 'ws68'); X.markSources(r.doc, 'auto', 'ws68');
  const pj = window.MK_PROJ.createFromDoc(clone(r.doc), '쌍 문서');
  window.MK_WS.state.projectId = pj.projectId;
  window.MK_WS.state.sceneIdx = r.doc.scenes.findIndex((s) => s.pairKey != null);
  window.MK_WS.state.sel = { type: 'scene' }; window.MK_WS.state.svarMsg = '';
  const h = SC.render();
  A(/data-ws-pairlock=/.test(h), '쌍 잠금 버튼 없음');
  A(/통째 잠그기/.test(h), '문구 없음');
  window.MK_WS.state.sel = null; /* 프로젝트 패널 — 쌍 잠금 요약 */
  const h2 = SC.render();
  A(/쌍 4개/.test(h2), '쌍 수 요약 없음');
  A(/통째 잠금/.test(h2), '통째 잠금 수 표기 없음');
});

T('T22 Workspace — 반쪽 상태면 일괄 승격 버튼이 뜬다', () => {
  const SC = window.MK_SCREENS.workspace;
  const r = pairBuild(4, 'ws68b'); X.markSources(r.doc, 'auto', 'ws68b');
  const g = X.pairGroups(r.doc)[1];
  X.setLock(r.doc, g.scenes[0].id, true);
  const pj = window.MK_PROJ.createFromDoc(clone(r.doc), '반쪽 문서');
  window.MK_WS.state.projectId = pj.projectId;
  window.MK_WS.state.sceneIdx = 0; window.MK_WS.state.sel = null; window.MK_WS.state.svarMsg = '';
  const h = SC.render();
  A(/data-ws-pairfix=/.test(h), '승격 버튼 없음');
  A(/반쪽/.test(h), '반쪽 표기 없음');
  window.MK_WS.state.sel = null;
});

/* ---------- 회귀 ---------- */
T('T23 R67 회귀 — 평면(비쌍) 자동 구성·장면 잠금은 그대로', () => {
  const r = S.buildSmart('tm-slideshow', { medias: lands(8), texts: { title: 'ㄱ' }, ratio: '16:9' }, { seed: 'r23' });
  A(r.ok, r.why || '');
  A(placed(r.doc) === 8, '배치 ' + placed(r.doc));
  A(r.doc.scenes.every((s) => s.pairKey == null), '평면 문서에 쌍 이름표가 붙음');
  X.markSources(r.doc, 'auto', 'r23');
  X.setLock(r.doc, r.doc.scenes[1].id, true);
  const shot = JSON.stringify(r.doc.scenes[1].elements);
  const r2 = X.recomposeDoc(r.doc, { seed: 'r23b' });
  A(r2.ok, r2.why || '');
  A(r2.lockedKept === 1, '지킨 장면 ' + r2.lockedKept);
  A(JSON.stringify(r2.doc.scenes[1].elements) === shot, '잠긴 장면이 바뀜');
});

T('T24 감사 — MK_SVAR · MK_SVARX · MK_TBUILD 전부 통과', () => {
  const a = S.audit(), b = X.audit(), c = B.audit();
  A(a.ok, 'SVAR: ' + JSON.stringify(a.violations));
  A(b.ok, 'SVARX: ' + JSON.stringify(b.violations));
  A(c.ok, 'TBUILD: ' + JSON.stringify(c.violations));
  A(typeof H.smartTemplateFor === 'function', '실사진 입구 소실');
});

console.log('\nR68 — ' + pass + ' pass / ' + fail + ' fail');
process.exit(fail ? 1 : 0);
