/* R66 — Randomize · 잠금 · source 추적 · Builder UI · 재진입 검증
   지시서 P1-3 후반부: §12 「다른 구성」 · §22~§25 · §28 T9~T14 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'https://x.test/#/tbuilder', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
try { window.localStorage.setItem('__t', '1'); } catch { Object.defineProperty(window, 'localStorage', { value: (() => { const s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = String(v); }, removeItem: (k) => { delete s[k]; }, clear: () => {} }; })() }); }

for (const m of html.matchAll(/<script src="([^?"]+)/g)) {
  const p = m[1];
  try { window.eval(fs.readFileSync(p.replace(/^\//, ''), 'utf8')); }
  catch (e) { console.error('LOAD FAIL', p, e.message); process.exit(1); }
}

const S = window.MK_SVAR, X = window.MK_SVARX, B = window.MK_TBUILD, M = window.MK_MANIFEST;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✅', name); } catch (e) { fail++; console.log('  ❌', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const clone = (o) => JSON.parse(JSON.stringify(o));

const img = (i, w, h) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,IMG' + i, w, h });
const lands = (n) => Array.from({ length: n }, (_, i) => img(i, 800, 600));
const ports = (n) => Array.from({ length: n }, (_, i) => img(i, 600, 900));
const placed = (doc) => doc.scenes.reduce((a, s) => a + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
const build = (n, seed, extra) => S.buildSmart('tm-slideshow', { medias: lands(n), texts: { title: '제목' }, ...(extra || {}) }, seed ? { seed } : {});

console.log('R66 — Randomize · 잠금 · 재진입 · Builder UI');

/* ---------- §22 Randomize ---------- */
T('T1 같은 seed = 같은 구성 (재현 가능한 무작위)', () => {
  const a = build(9, 'r-1'), b = build(9, 'r-1');
  A(a.ok && b.ok, 'build');
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), '같은 seed인데 결과가 다름');
});

T('T2 다른 seed = 다른 구성이되 전량 배치는 불변', () => {
  const a = build(12, 'r-a'), b = build(12, 'r-b');
  A(a.ok && b.ok, 'build');
  A(placed(a.doc) === 12 && placed(b.doc) === 12, '배치 수 ' + placed(a.doc) + '/' + placed(b.doc));
  A(JSON.stringify(a.smart.plan) !== JSON.stringify(b.smart.plan) ||
    JSON.stringify(a.doc.meta.svar.order) !== JSON.stringify(b.doc.meta.svar.order), 'seed가 구성에 영향을 못 줌');
});

T('T3 안전 규칙은 무작위여도 지켜진다 (3연속 금지·역할 불변)', () => {
  for (const seed of ['s1', 's2', 's3', 's4', 's5']) {
    const roles = { 0: 'start', 11: 'end', 3: 'highlight' };
    const r = S.buildSmart('tm-slideshow', { medias: lands(12), mediaRoles: roles, texts: { title: 'T' } }, { seed });
    A(r.ok, seed + ' build');
    A(placed(r.doc) === 12, seed + ' 배치 ' + placed(r.doc));
    const vs = r.smart.plan.map((p) => p.split('x')[0]);
    let run = 1;
    for (let i = 1; i < vs.length; i++) { run = vs[i] === vs[i - 1] ? run + 1 : 1; A(run < 3, seed + ' 같은 배치 3연속'); }
    const order = r.doc.meta.svar.order;
    A(order[0] === 0, seed + ' start가 앞이 아님');
    A(order[order.length - 1] === 11, seed + ' end가 뒤가 아님');
  }
});

/* ---------- §23 source 추적 · 잠금 ---------- */
T('T4 source 추적 — 자동이 사용자 것을 덮지 않는다', () => {
  const r = build(8, 'src-1');
  X.markSources(r.doc, 'random', 'src-1');
  const target = r.doc.scenes[1];
  X.markEdited(r.doc, target.id);
  A(target.svar.source === 'user' && target.svar.locked, 'markEdited');
  X.markSources(r.doc, 'auto');
  A(target.svar.source === 'user', '자동이 사용자 표시를 덮음');
  const sum = X.lockSummary(r.doc);
  A(sum.by.user === 1 && sum.locked === 1, 'summary ' + JSON.stringify(sum.by));
});

T('T5 잠긴 장면은 다른 구성에서도 그대로 (사진도 함께 고정)', () => {
  const r = build(10, 'lk-1');
  const d = clone(r.doc);
  const t = d.scenes.find((s) => s.elements.some((e) => e.kind === 'image' && e.src));
  X.setLock(d, t.id, true);
  const r2 = X.recomposeDoc(d, { seed: 'lk-2' });
  A(r2.ok, 'recompose ' + (r2.why || ''));
  const kept = r2.doc.scenes.find((s) => s.id === t.id);
  A(kept, '잠긴 장면 소실');
  A(JSON.stringify(kept.elements) === JSON.stringify(t.elements), '잠긴 장면 내용이 바뀜');
  A(placed(r2.doc) === 10, '전량 배치 깨짐 ' + placed(r2.doc));
});

T('T6 전부 잠그면 정직하게 거부한다', () => {
  const r = build(6, 'all-1');
  const d = clone(r.doc);
  for (const s of d.scenes) X.setLock(d, s.id, true);
  const r2 = X.recomposeDoc(d, { seed: 'all-2' });
  A(!r2.ok && r2.why === 'all-locked', '거부하지 않음');
  A(/잠금/.test(r2.guide || ''), '안내 문구 없음');
});

/* ---------- §12 되돌리기 ---------- */
T('T7 History — 이전 구성으로 되돌아간다', () => {
  X.clearHistory('t7');
  const r = build(9, 'h-0');
  X.pushHistory('t7', r.doc, { seed: 'h-0' });
  const r2 = X.recomposeDoc(r.doc, { seed: 'h-1', key: 't7' });
  A(r2.ok, 'recompose');
  A(X.historyDepth('t7') === 2, 'depth ' + X.historyDepth('t7'));
  const back = X.previous('t7');
  A(back && back.seed === 'h-0', '이전 구성이 아님');
  A(JSON.stringify(back.doc.scenes) === JSON.stringify(r.doc.scenes), '되돌린 문서가 원본과 다름');
  A(X.previous('t7') === null, '스택 바닥에서 더 되돌림');
});

/* ---------- §12·§28 문서 기반 재구성 ---------- */
T('T8 inputFromDoc — 문서만으로 원본 사진·캡션을 되찾는다', () => {
  const caps = ['첫 장', '', '셋째', '', '', '', '', '여덟'];
  const r = S.buildSmart('tm-slideshow', { medias: ports(8), mediaCaptions: caps, texts: { title: '제목' } }, { seed: 'f-1' });
  A(r.ok, 'build');
  const f = X.inputFromDoc(r.doc);
  A(f.ok, 'inputFromDoc ' + (f.why || ''));
  A(f.input.medias.length === 8, '사진 수 ' + f.input.medias.length);
  A(f.input.medias.every((m, i) => m.src === 'data:image/png;base64,IMG' + i), '원본 순서 복원 실패');
  A(f.input.medias[0].w === 600 && f.input.medias[0].h === 900, '픽셀 크기 유실');
  A(JSON.stringify(f.input.mediaCaptions) === JSON.stringify(caps), '캡션 복원 실패');
});

/* ---------- §28 T9~T14 저장 · 재진입 ---------- */
T('T9 저장 = 실행 포맷 하나 — 사이드카 없이 근거가 문서에 있다', () => {
  const r = build(7, 't9');
  const sv = r.doc.meta.svar;
  A(sv && sv.templateId === 'tm-slideshow', 'templateId');
  A(sv.variant && sv.seed === 't9', 'variant/seed');
  A(Array.isArray(sv.order) && sv.order.length === 7, 'order');
  A(Array.isArray(sv.media) && sv.media.length === 7, 'media 메타');
  A(sv.texts && sv.texts.title === '제목', 'texts');
});

T('T10 JSON 왕복 — 저장·복원 후에도 상태가 남는다', () => {
  const r = build(9, 't10');
  const round = JSON.parse(JSON.stringify(r.doc));
  const stt = X.readState(round);
  A(stt && stt.seed === 't10' && stt.templateId === 'tm-slideshow', 'readState');
  A(stt.variant === r.smart.variant, 'variant 유실');
});

T('T11 재진입 재현 — 저장된 seed로 같은 구성이 다시 나온다', () => {
  const r = build(11, 't11');
  const round = JSON.parse(JSON.stringify(r.doc));
  const f = X.inputFromDoc(round);
  A(f.ok, 'inputFromDoc');
  const again = X.reproduce(round, f.input);
  A(again.ok, 'reproduce ' + (again.why || ''));
  A(JSON.stringify(again.doc.scenes) === JSON.stringify(r.doc.scenes), '재현 결과가 다름');
});

T('T12 재진입 후 「다른 구성」이 이어진다', () => {
  const r = build(10, 't12');
  const round = JSON.parse(JSON.stringify(r.doc));
  const r2 = X.recomposeDoc(round, { seed: 't12b' });
  A(r2.ok, 'recompose ' + (r2.why || ''));
  A(placed(r2.doc) === 10, '배치 ' + placed(r2.doc));
  A(r2.doc.meta.svar.seed === 't12b', 'seed 갱신 안 됨');
  A(r2.doc.meta.svar.templateId === 'tm-slideshow', 'templateId 유실');
});

T('T13 잠금 상태가 저장·복원을 건너 살아남는다', () => {
  const r = build(9, 't13');
  const d = clone(r.doc);
  const t = d.scenes[2];
  X.setLock(d, t.id, true);
  const round = JSON.parse(JSON.stringify(d));
  const stt = X.readState(round);
  A(stt.locks.length === 1 && stt.locks[0] === t.id, '잠금 유실');
  const r2 = X.recomposeDoc(round, { seed: 't13b' });
  A(r2.ok && r2.doc.scenes.find((s) => s.id === t.id), '복원 후 잠금 무시');
});

T('T14 역할(중요·제외)이 재진입 후에도 이어진다', () => {
  const roles = { 0: 'start', 4: 'highlight', 7: 'exclude' };
  const r = S.buildSmart('tm-slideshow', { medias: lands(9), mediaRoles: roles, texts: { title: 'T' } }, { seed: 't14' });
  A(r.ok, 'build');
  A(placed(r.doc) === 8, '제외 반영 안 됨 ' + placed(r.doc));
  const round = JSON.parse(JSON.stringify(r.doc));
  const stt = X.readState(round);
  A(stt.roles['4'] === 'highlight' && stt.roles['7'] === 'exclude', '역할 유실');
  const f = X.inputFromDoc(round);
  A(f.ok && f.missing.length === 1 && f.missing[0] === 7, '제외 사진 추적 실패 ' + JSON.stringify(f.missing));
  A(f.input.medias.length === 8, '복원 사진 수 ' + f.input.medias.length);
  const r2 = X.recomposeDoc(round, { seed: 't14b' });
  A(r2.ok && placed(r2.doc) === 8, '재구성 배치 ' + (r2.ok ? placed(r2.doc) : r2.why));
  A((r2.warnings || []).some((w) => /제외/.test(w)), '제외 안내 없음');
});

/* ---------- §24 Builder Variant 설정 ---------- */
T('T15 Builder — Variant 추가·수정·삭제가 Manifest 안에 산다', () => {
  const id = B.create({ name: 'R66 테스트', composition: 'slideshow', theme: 'th-minimal', ratio: '16:9' });
  const a = B.addVariant(id, { name: '적게' });
  A(a.ok, 'addVariant');
  const set = B.setVariant(id, a.variantId, { conditions: { mediaCountMin: 1, mediaCountMax: 4 }, priority: 5 });
  A(set.ok, 'setVariant ' + (set.msg || ''));
  const list = B.getVariants(id);
  A(list.length === 1 && list[0].conditions.mediaCountMax === 4, '저장 위치가 Manifest가 아님');
  A(B.get(id).manifest.smartVariants.length === 1, 'Manifest 내장 아님');
  const bad = B.setVariant(id, a.variantId, { layoutPool: ['없는레이아웃'] });
  A(!bad.ok, '없는 Layout을 통과시킴');
  A(B.removeVariant(id, a.variantId).ok && B.getVariants(id).length === 0, 'removeVariant');
  B.remove(id);
});

T('T16 Variant 검증 — 구멍·중복·범위 역전을 정직하게 알린다', () => {
  const dup = X.validateVariants([{ id: 'v1', conditions: { mediaCountMin: 1, mediaCountMax: 30 } },
    { id: 'v1', conditions: { mediaCountMin: 1 } }], {});
  A(!dup.ok && dup.errors.some((e) => /중복/.test(e.msg)), '중복 미검출');
  const rev = X.validateVariants([{ id: 'a', conditions: { mediaCountMin: 9, mediaCountMax: 3 } }], {});
  A(!rev.ok && rev.errors.some((e) => /거꾸로/.test(e.msg)), '범위 역전 미검출');
  const hole = X.validateVariants([{ id: 'a', conditions: { mediaCountMin: 1, mediaCountMax: 5 }, layoutPool: ['full-media'] }], {});
  A(hole.ok && hole.warnings.some((w) => /6~30/.test(w)), '커버리지 구멍 안내 없음: ' + JSON.stringify(hole.warnings));
});

/* ---------- §25 테스트 모드 ---------- */
T('T17 테스트 매트릭스 — 9경우 실빌드, 전량 배치', () => {
  const mx = X.testMatrix('tm-slideshow', {});
  A(mx.rows.length === 9, '행 ' + mx.rows.length);
  A(mx.ok, '문제 ' + mx.problems + '건: ' + JSON.stringify(mx.rows.filter((r) => !r.ok || r.placed !== r.expected)));
  for (const r of mx.rows) A(r.variant && r.scenes > 0 && r.total > 0, r.label + ' 실빌드 결과 없음');
});

T('T18 Builder 초안도 등록 없이 같은 경로로 테스트된다', () => {
  const id = B.create({ name: 'R66 초안', composition: 'slideshow', theme: 'th-minimal', ratio: '16:9' });
  const mx = B.smartPreview(id, {});
  A(mx.rows && mx.rows.length === 9, '초안 매트릭스 실패');
  A(mx.ok, '초안 문제 ' + mx.problems + '건');
  A(!M.getTemplate(B.get(id).manifest.id), '초안이 등록돼 버림');
  B.remove(id);
});

/* ---------- UI 배선 (§12·§24·§25) ---------- */
T('T19 Builder 화면 — 자동 구성 탭·매트릭스 표가 실제로 그려진다', () => {
  const SC = window.MK_SCREENS.tbuilder;
  const id = B.create({ name: 'UI 확인', composition: 'slideshow', theme: 'th-minimal', ratio: '16:9' });
  SC._st.view = 'edit'; SC._st.tid = id; SC._st.sid = null; SC._st.tab = 'svar'; SC._st.matrix = null;
  B.addVariant(id, { name: '표준' });
  SC._st.vsel = B.getVariants(id)[0].id;
  const h1 = SC.render();
  A(/자동 구성/.test(h1), '탭 없음');
  A(/data-tb="vadd"/.test(h1) && /data-tb="v-min"/.test(h1), 'Variant 편집 폼 없음');
  SC._st.matrix = B.smartPreview(id, {});
  const h2 = SC.render();
  A(/고른 구성/.test(h2) && /배치 계획/.test(h2), '매트릭스 표 없음');
  A(/10\/10/.test(h2) || /5\/5/.test(h2), '실측 배치 수 표기 없음');
  SC._st.view = 'list'; SC._st.tid = null; SC._st.matrix = null; SC._st.vsel = null;
  B.remove(id);
});

T('T20 Workspace — 자동 구성 문서에서만 「다른 구성」이 뜬다', () => {
  const SC = window.MK_SCREENS.workspace;
  const r = build(8, 'ws-1');
  const pj = window.MK_PROJ.createFromDoc(clone(r.doc), '자동 구성 문서');
  window.MK_WS.state.projectId = pj.projectId;
  window.MK_WS.state.sceneIdx = 0; window.MK_WS.state.sel = null; window.MK_WS.state.svarMsg = '';
  const h = SC.render();
  A(/다른 구성으로/.test(h), '「다른 구성」 버튼 없음');
  A(/씨앗/.test(h), 'seed 표기 없음');
  window.MK_WS.state.sel = { type: 'scene' };
  const h2 = SC.render();
  A(/data-ws-lock=/.test(h2), '잠금 토글 없음');
  /* 자동 구성이 아닌 문서에서는 뜨지 않는다 */
  const plain = clone(r.doc); delete plain.meta.svar;
  const pj2 = window.MK_PROJ.createFromDoc(plain, '평범한 문서');
  window.MK_WS.state.projectId = pj2.projectId; window.MK_WS.state.sel = null;
  A(!/다른 구성으로/.test(SC.render()), '근거 없는 문서에 버튼이 뜸');
});

/* ---------- 회귀 ---------- */
T('T21 감사 — MK_SVAR · MK_SVARX 전부 통과', () => {
  const a = S.audit(), b = X.audit(), c = B.audit();
  A(a.ok, 'SVAR: ' + JSON.stringify(a.violations));
  A(b.ok, 'SVARX: ' + JSON.stringify(b.violations));
  A(c.ok, 'TBUILD: ' + JSON.stringify(c.violations));
});

T('T22 R65 회귀 — Variant 경계·전량 배치·결정론 불변', () => {
  for (const [n, want] of [[3, 'compact'], [8, 'standard'], [16, 'extended'], [25, 'large']]) {
    const r = build(n);
    A(r.ok && r.smart.variant === want, n + '장 → ' + (r.ok ? r.smart.variant : r.why));
    A(placed(r.doc) === n, n + '장 배치 ' + placed(r.doc));
  }
  const a = build(14), b = build(14);
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), 'seed 없을 때 결정론 깨짐');
});

console.log(`\nR66 — ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
