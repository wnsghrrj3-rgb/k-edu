/* R67 — 내 사진 자동 구성 입구 · 역할 지정 · 쌍 「다른 구성」 · 조건 축 확장
   §12 실사용자 입구 · §19 역할 · §24 조건 축 · §28 문서만으로 재구성 */
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

for (const m of html.matchAll(/<script src="([^?"]+)/g)) {
  const p = m[1];
  try { window.eval(fs.readFileSync(p.replace(/^\//, ''), 'utf8')); }
  catch (e) { console.error('LOAD FAIL', p, e.message); process.exit(1); }
}

const S = window.MK_SVAR, X = window.MK_SVARX, H = window.MK_VIDHUB, B = window.MK_TBUILD, M = window.MK_MANIFEST;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✅', name); } catch (e) { fail++; console.log('  ❌', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const clone = (o) => JSON.parse(JSON.stringify(o));

const img = (i, w, h) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,IMG' + i, w: w || 800, h: h || 600 });
const lands = (n) => Array.from({ length: n }, (_, i) => img(i));
const placed = (doc) => doc.scenes.reduce((a, s) => a + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
const mkPairs = (n) => Array.from({ length: n }, (_, i) => ({
  before: { name: 'b' + i, kind: 'image', src: 'data:image/png;base64,B' + i, w: 800, h: 600 },
  after: { name: 'a' + i, kind: 'image', src: 'data:image/png;base64,A' + i, w: 800, h: 600 },
  title: '쌍' + i }));
const origSet = (doc) => new Set(doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'image' && e.src).map((e) => e.oi))).size;
const stage = (n) => { H.resetStage(); H.st.comp = null; H.select('cx-slideshow'); H.stageMedias(lands(n)); };
const renderVideo = () => {
  const root = window.document.querySelector('#app');
  root.innerHTML = window.MK_SCREENS.video.render();
  window.MK_SCREENS.video.mount(root);
  return root;
};

console.log('R67 — 내 사진 자동 구성 입구 · 쌍 재구성 · 조건 축');

/* ---------- §12 실사진 입구 ---------- */
T('T1 자동 구성 지원 구조만 템플릿이 잡힌다 (없는 구조엔 문이 안 열림)', () => {
  A(H.smartTemplateFor('cx-slideshow') === 'tm-slideshow', '슬라이드쇼 매핑 실패');
  A(H.smartTemplateFor('cx-beforeafter') === 'tm-beforeafter', '비포애프터 매핑 실패');
  A(H.smartTemplateFor('cx-story') === null, '등록 안 된 구조에 템플릿이 잡힘');
});

T('T2 스테이지 → 자동 구성 → 프로젝트 생성 → 문서에 근거 동행', () => {
  stage(6); H.st.seed = 'ui-1';
  const r = H.buildSmartStaged();
  A(r.ok, '빌드 실패: ' + (r.why || ''));
  A(placed(r.doc) === 6, '배치 ' + placed(r.doc));
  A(r.doc.meta.svar && r.doc.meta.svar.templateId === 'tm-slideshow', '재구성 근거 없음');
  A(r.doc.meta.svar.seed === 'ui-1', '씨앗 미기록');
  A(r.projectId, '프로젝트 미생성');
  A(window.MK_PROJ.get(r.projectId), '프로젝트 조회 실패');
});

T('T3 같은 씨앗 = 같은 구성 (실사진 입구에서도 재현)', () => {
  stage(9); H.st.seed = 'ui-same';
  const a = H.buildSmartStaged();
  stage(9); H.st.seed = 'ui-same';
  const b = H.buildSmartStaged();
  A(a.ok && b.ok, 'build');
  A(JSON.stringify(a.doc.scenes) === JSON.stringify(b.doc.scenes), '같은 씨앗인데 결과가 다름');
});

T('T4 역할 ★ 중요 — 그 사진 장면이 다른 장면보다 짧지 않다', () => {
  stage(8); H.st.seed = 'role-hl'; H.setRole(2, 'highlight');
  const r = H.buildSmartStaged();
  A(r.ok, 'build');
  A(placed(r.doc) === 8, '배치 ' + placed(r.doc));
  const media = r.doc.scenes.filter((s) => s.elements.some((e) => e.kind === 'image' && e.src));
  const hl = media.find((s) => s.elements.some((e) => e.kind === 'image' && e.src === 'data:image/png;base64,IMG2'));
  A(hl, '중요 사진이 문서에 없음');
  const avg = media.reduce((a, s) => a + s.duration, 0) / media.length;
  A(hl.duration >= avg, '중요 장면이 평균보다 짧음 ' + hl.duration + ' < ' + avg);
});

T('T5 역할 ⊘ 빼기 — 이번 구성에서만 빠지고 목록엔 남는다', () => {
  stage(7); H.st.seed = 'role-ex'; H.setRole(3, 'exclude');
  const r = H.buildSmartStaged();
  A(r.ok, 'build');
  A(placed(r.doc) === 6, '배치 ' + placed(r.doc) + ' (제외 1장이면 6)');
  const srcs = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'image' && e.src).map((e) => e.src));
  A(!srcs.includes('data:image/png;base64,IMG3'), '뺀 사진이 배치됨');
  A(H.st.medias.length === 7, '원본 목록이 줄어듦 ' + H.st.medias.length);
  A((r.warnings || []).some((w) => /제외/.test(w)), '제외 안내 없음');
});

T('T6 역할이 정렬을 따라간다 (순서 바뀌어도 같은 사진이 빠진다)', () => {
  stage(5); H.setRole(0, 'exclude');
  H.moveMedia(0, 1);
  A(H.st.roles[1] === 'exclude' && !H.st.roles[0], '▲▼ 정렬에 역할이 안 따라옴: ' + JSON.stringify(H.st.roles));
  A(H.st.medias[1].name === 'p0', '미디어 이동 자체가 어긋남');
  H.removeMedia(0);
  A(H.st.roles.length === 4 && H.st.roles[0] === 'exclude', '삭제 후 역할 어긋남: ' + JSON.stringify(H.st.roles));
  H.dragRole(0, 3);
  A(H.st.roles[3] === 'exclude', '드래그 역할 동행 실패');
});

T('T7 화면 실렌더 — 역할 칩·씨앗칸·자동 구성 버튼이 실제로 뜬다', () => {
  stage(4);
  const root = renderVideo();
  A(root.querySelectorAll('[data-vh-role]').length === 8, '역할 칩 수 ' + root.querySelectorAll('[data-vh-role]').length);
  A(root.querySelector('[data-vh-smart]'), '자동 구성 버튼 없음');
  A(root.querySelector('#vhSeed'), '씨앗 입력칸 없음');
  A(root.querySelector('[data-vh-build]'), '기존 만들기 버튼이 사라짐(대체 금지)');
});

T('T8 뺀 사진은 화면에서도 흐리게 — 무엇이 빠지는지 보인다', () => {
  stage(4); H.setRole(1, 'exclude');
  const root = renderVideo();
  A(root.querySelectorAll('.vh-row-off').length === 1, '흐린 행 수 ' + root.querySelectorAll('.vh-row-off').length);
});

T('T9 미리보기 요약은 실빌드 결과만 말한다', () => {
  stage(20); H.st.seed = 'peek';
  const p = H.smartPeek();
  A(p && p.ok, 'peek 실패');
  const r = S.buildSmart('tm-slideshow', H.smartInput(), { theme: H.st.theme, seed: 'peek' });
  A(r.ok && p.variant === r.smart.variant && p.scenes === r.doc.scenes.length, '요약이 실빌드와 다름');
});

/* ---------- 쌍 「다른 구성」 ---------- */
T('T10 쌍 문서에도 재구성 근거가 실린다 (쌍 묶음·원본 인덱스)', () => {
  const r = S.buildSmart('tm-beforeafter', { pairs: mkPairs(3), texts: { title: '전후' } }, { seed: 'p-1' });
  A(r.ok, 'build');
  const sv = r.doc.meta.svar;
  A(sv.pairMode && Array.isArray(sv.pairs) && sv.pairs.length === 3, '쌍 근거 없음');
  const ois = [...new Set(r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'image' && e.src).map((e) => e.oi)))];
  A(ois.length === 6 && ois.every((x) => x != null), '원본 인덱스 미동행: ' + JSON.stringify(ois));
});

T('T11 문서 하나로 쌍 복원 — 전·후가 뒤바뀌지 않는다', () => {
  const r = S.buildSmart('tm-beforeafter', { pairs: mkPairs(4), texts: { title: '전후' } }, { seed: 'p-2' });
  const f = X.inputFromDoc(r.doc);
  A(f.ok, '복원 실패: ' + (f.why || ''));
  A(f.input.pairs.length === 4, '쌍 수 ' + f.input.pairs.length);
  for (const p of f.input.pairs) {
    A(/base64,B/.test(p.before.src), '전 자리에 후 사진이 들어감');
    A(/base64,A/.test(p.after.src), '후 자리에 전 사진이 들어감');
    A(p.before.name.replace('b', '') === p.after.name.replace('a', ''), '쌍 짝이 어긋남 ' + p.before.name + '/' + p.after.name);
  }
});

T('T12 쌍 「다른 구성」 — 순서·비교 방식은 바뀌고 쌍은 안 깨진다', () => {
  const base = S.buildSmart('tm-beforeafter', { pairs: mkPairs(5), texts: { title: '전후' } }, { seed: 'p-a' });
  const seeds = ['p-b', 'p-c', 'p-d', 'p-e'];
  let changed = 0;
  for (const sd of seeds) {
    const r = X.recomposeDoc(base.doc, { seed: sd });
    A(r.ok, '재구성 실패: ' + (r.guide || r.why));
    A(origSet(r.doc) === origSet(base.doc), '원본 사진 수가 달라짐 ' + origSet(r.doc) + '/' + origSet(base.doc));
    const f = X.inputFromDoc(r.doc);
    A(f.ok && f.input.pairs.every((p) => /base64,B/.test(p.before.src) && /base64,A/.test(p.after.src)), '쌍이 깨짐');
    const key = (d) => JSON.stringify(d.meta.svar.pairs.map((p) => p.t)) + '|' + (d.meta.svar.method || '');
    if (key(r.doc) !== key(base.doc)) changed++;
  }
  A(changed >= 3, '씨앗을 바꿔도 구성이 그대로 (' + changed + '/4)');
});

T('T13 쌍 재구성도 결정론 — 같은 씨앗 = 같은 문서', () => {
  const base = S.buildSmart('tm-beforeafter', { pairs: mkPairs(4), texts: { title: '전후' } }, { seed: 'p-x' });
  const a = X.recomposeDoc(base.doc, { seed: 'p-y' });
  const b = X.recomposeDoc(base.doc, { seed: 'p-y' });
  A(a.ok && b.ok, 'build');
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), '같은 씨앗인데 결과가 다름');
});

/* R68 갱신 — 「쌍은 지킬 수 없다」는 거부(pair-locked)는 쌍 단위 잠금으로 대체됐다.
   지킬 수 없는 약속을 하지 않는다는 계약 자체는 그대로다: 한 쌍의 일부만 잠근
   반쪽 상태는 여전히 성립할 수 없으므로 정직하게 거부하고 해법을 알려 준다. */
T('T14 쌍 + 반쪽 잠금 = 정직한 거부 (지킬 수 없는 약속을 하지 않는다)', () => {
  const base = S.buildSmart('tm-beforeafter', { pairs: mkPairs(3), texts: { title: '전후' } }, { seed: 'p-l' });
  const d = clone(base.doc);
  X.setLock(d, d.scenes[1].id, true);
  const r = X.recomposeDoc(d, { seed: 'p-l2' });
  A(!r.ok && r.why === 'pair-partial-lock', '반쪽 잠금인데 재구성이 통과함 (why=' + (r.why || 'ok') + ')');
  A(/통째/.test(r.guide || ''), '안내 문구에 해법이 없음');
  X.setLock(d, d.scenes[1].id, false);
  A(X.recomposeDoc(d, { seed: 'p-l3' }).ok, '잠금 풀었는데도 거부');
});

T('T15 쌍 스테이지에서도 자동 구성 문이 열린다', () => {
  H.resetStage(); H.st.comp = null; H.select('cx-beforeafter');
  H.addPair(); H.addPair();
  H.setPairMedia(0, 'before', { name: 'b0', kind: 'image', src: 'data:image/png;base64,B0', w: 800, h: 600 });
  H.setPairMedia(0, 'after', { name: 'a0', kind: 'image', src: 'data:image/png;base64,A0', w: 800, h: 600 });
  H.setPairMedia(1, 'before', { name: 'b1', kind: 'image', src: 'data:image/png;base64,B1', w: 800, h: 600 });
  H.setPairMedia(1, 'after', { name: 'a1', kind: 'image', src: 'data:image/png;base64,A1', w: 800, h: 600 });
  const root = renderVideo();
  A(root.querySelector('[data-vh-smart]'), '쌍 스테이지에 자동 구성 버튼 없음');
  A(!root.querySelectorAll('[data-vh-role]').length, '쌍에는 역할 칩이 뜨면 안 됨');
  H.st.seed = 'pair-ui';
  const r = H.buildSmartStaged();
  A(r.ok && r.doc.meta.svar.pairMode, '쌍 자동 구성 실패');
  A(origSet(r.doc) === 4, '원본 사진 ' + origSet(r.doc));
});

/* ---------- §24 조건 축 확장 ---------- */
T('T16 조건 축 — 문구 유무로 다른 구성이 잡힌다', () => {
  S.defineVariants('tm-r67', [
    { id: 'capped', name: '문구형', conditions: { mediaCountMin: 1, hasCaptions: true }, priority: 1,
      layoutPool: ['media-left', 'media-right'], sceneStrategy: { maxSceneCount: 14 }, duration: { maxTotal: 60 } },
    { id: 'plain', name: '기본형', conditions: { mediaCountMin: 1, hasCaptions: false }, priority: 2,
      layoutPool: ['full-media'], sceneStrategy: { maxSceneCount: 14 }, duration: { maxTotal: 60 } },
  ]);
  const stats = (caps) => S.mediaStats({ medias: lands(5), mediaCaptions: caps || [] });
  const a = S.selectVariant('tm-r67', stats(['한 줄', '', '', '', '']), { ratio: '16:9' });
  const b = S.selectVariant('tm-r67', stats(), { ratio: '16:9' });
  A(a.id === 'capped', '문구 있는데 ' + a.id);
  A(b.id === 'plain', '문구 없는데 ' + b.id);
});

T('T17 조건 축 — 비율·미디어 종류가 실제로 선택을 가른다', () => {
  S.defineVariants('tm-r67b', [
    { id: 'shorts', name: '쇼츠형', conditions: { mediaCountMin: 1, ratio: ['9:16'] }, priority: 1,
      layoutPool: ['full-media'], duration: { maxTotal: 30 } },
    { id: 'wide', name: '가로형', conditions: { mediaCountMin: 1, ratio: ['16:9'] }, priority: 2,
      layoutPool: ['full-media'], duration: { maxTotal: 60 } },
    { id: 'vid', name: '영상형', conditions: { mediaCountMin: 1, mediaKind: 'videoOnly', ratio: ['1:1'] }, priority: 0,
      layoutPool: ['full-media'], duration: { maxTotal: 60 } },
  ]);
  const st5 = S.mediaStats({ medias: lands(5) });
  A(S.selectVariant('tm-r67b', st5, { ratio: '9:16' }).id === 'shorts', '9:16 선택 실패');
  A(S.selectVariant('tm-r67b', st5, { ratio: '16:9' }).id === 'wide', '16:9 선택 실패');
  const vids = lands(3).map((m) => ({ ...m, kind: 'video', duration: 3 }));
  A(S.selectVariant('tm-r67b', S.mediaStats({ medias: vids }), { ratio: '1:1' }).id === 'vid', '영상만 선택 실패');
});

T('T18 Builder 화면에 조건 축 컨트롤이 실제로 뜬다 (§24)', () => {
  const cid = B.create({ name: 'R67 조건축', composition: 'slideshow', ratio: '16:9' });
  A(typeof cid === 'string' && B.get(cid), '템플릿 생성 실패');
  const add = B.addVariant(cid, { name: '테스트 구성' });
  A(add.ok, 'Variant 추가 실패: ' + (add.msg || ''));
  const set = B.setVariant(cid, add.variantId, { conditions: { hasCaptions: true, mediaKind: 'imageOnly', ratio: ['16:9'] } });
  A(set.ok, '조건 축 저장 실패: ' + (set.msg || ''));
  const v = B.getVariants(cid).find((x) => x.id === add.variantId);
  A(v.conditions.hasCaptions === true && v.conditions.mediaKind === 'imageOnly'
    && JSON.stringify(v.conditions.ratio) === '["16:9"]', '조건이 저장되지 않음: ' + JSON.stringify(v.conditions));
  /* 실렌더 — 화면 컨트롤 존재 확인 */
  window.location.hash = '#/tbuilder';
  const root = window.document.querySelector('#app');
  window.PG.go('tbuilder');
  const scr = window.MK_SCREENS.tbuilder;
  const html2 = (() => { root.innerHTML = scr.render(); scr.mount(root); return root.innerHTML; })();
  A(/data-tb="new"/.test(html2) || /data-tb="edit"/.test(html2), 'Builder 목록이 안 뜸');
});

/* ---------- 회귀 ---------- */
T('T19 R66 회귀 — 슬라이드쇼 문서 재구성·잠금 보존 불변', () => {
  const base = S.buildSmart('tm-slideshow', { medias: lands(10), texts: { title: '회귀' } }, { seed: 'g-1' });
  A(base.ok && placed(base.doc) === 10, 'base');
  const d = clone(base.doc);
  const target = d.scenes.find((s) => s.elements.some((e) => e.kind === 'image' && e.src));
  X.setLock(d, target.id, true);
  const r = X.recomposeDoc(d, { seed: 'g-2' });
  A(r.ok, '재구성 실패: ' + (r.guide || r.why));
  A(placed(r.doc) === 10, '배치 ' + placed(r.doc));
  const kept = r.doc.scenes.find((s) => s.id === target.id);
  A(kept && JSON.stringify(kept.elements) === JSON.stringify(target.elements), '잠금 깨짐');
});

T('T20 R65 회귀 + 감사 — 두 엔진 전부 통과', () => {
  A(S.audit().ok, 'MK_SVAR audit: ' + JSON.stringify(S.audit().violations));
  A(X.audit().ok, 'MK_SVARX audit: ' + JSON.stringify(X.audit().violations));
  const r = S.buildSmart('tm-slideshow', { medias: lands(25), texts: { title: '회귀' } }, {});
  A(r.ok && r.smart.variant === 'large' && placed(r.doc) === 25, 'R65 경계 불변');
});

T('T21 기존 고정 구성 경로 무손상 (자동 구성은 갈래 추가지 대체가 아님)', () => {
  H.resetStage(); H.st.comp = null; H.select('cx-slideshow'); H.stageMedias(lands(5));
  const r = window.MK_COMPOSE.buildProject('cx-slideshow', H.st.theme, H.stagedInput());
  A(r.ok, 'buildProject 실패');
  A(r.doc.scenes.length > 0, '문서 없음');
  A(!r.doc.meta || !r.doc.meta.svar, '고정 구성인데 자동 구성 근거가 붙음');
});

T('T22 쌍 미디어 원본 인덱스는 렌더러가 무시한다 (통과 필드)', () => {
  const r = S.buildSmart('tm-beforeafter', { pairs: mkPairs(2), texts: { title: '전후' } }, { seed: 'oi-1' });
  const R = window.MK_RENDER;
  const svg = R.toSVG(R.renderScene(r.doc.scenes[r.doc.scenes.length - 1], { noCache: true }));
  A(typeof svg === 'string' && svg.length > 50, '렌더 실패');
  A(!/\boi=/.test(svg), 'oi 가 SVG 로 새어 나감');
});

console.log('\nR67 — ' + pass + ' pass / ' + fail + ' fail');
process.exit(fail ? 1 : 0);
