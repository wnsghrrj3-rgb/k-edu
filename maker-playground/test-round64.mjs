/* R64 — Template Builder: 실사용 가능한 템플릿 제작 도구 (§23 실동작·§24 Test 1~7·§25 완료 조건) */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/tbuilder' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) { if (/^https?:/.test(f)) continue; const p = f.replace(/^\//, ''); if (!fs.existsSync(p) && !fs.existsSync(f)) continue; window.eval(fs.readFileSync(fs.existsSync(p) ? p : f, 'utf8')); }
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
window.alert = () => {}; window.confirm = () => true;

const B = window.MK_TBUILD, M = window.MK_MANIFEST, C = window.MK_COMPOSE, R = window.MK_RENDER, P = window.MK_PLAY;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assert'); };
const renderAll = (r) => r.doc.scenes.forEach((s) => { const svg = R.toSVG(R.renderScene(s, { noCache: true })); A(/^<svg/.test(svg), '렌더 실패 ' + s.id); });

/* ---------- §25 구조 — 재사용·단일 포맷 ---------- */
T('구조 — Builder 별도 실행 포맷 0: 저장 Manifest 가 registerTemplate 을 그대로 통과', () => {
  const id = B.create({ name: '포맷 검사', composition: 'slideshow' });
  const mf = JSON.parse(JSON.stringify(B.get(id).manifest));
  mf.id = 'fmt-check-1';
  const r = M.registerTemplate(mf);
  A(r.ok, '등록 실패: ' + JSON.stringify(r.errors));
  A(M.unregisterTemplate('fmt-check-1'), 'unregister 실패');
  B.remove(id);
});

T('구조 — 미리보기는 기존 파이프라인 재사용 (buildDraft → buildProject → MK_RENDER 실렌더)', () => {
  const id = B.create({ name: '재사용 검사', composition: 'slideshow' });
  const r = B.previewBuild(id, { mediaCount: 3 });
  A(r.ok && r.draft, '실빌드 실패');
  A(r.doc.contentType === 'video' && r.doc.scenes.length >= 3, '기존 doc 스키마 아님');
  renderAll(r);
  A(P.sequence(r.doc).length === r.doc.scenes.length, 'MK_PLAY 시퀀스 불일치'); /* 기존 Preview Player 그대로 */
  const hidden = C.listCompositions().some((c) => c.id.startsWith('__tbd-'));
  A(!hidden, '휘발 comp 이 갤러리에 노출'); /* 갤러리 오염 0 */
  B.remove(id);
});

/* ---------- §24 Test 1 — 새 Photo Slideshow 제작 전 여정 ---------- */
T('Test1 — 새 슬라이드쇼: 생성→씬4→반복→사진10→실미리보기→Draft 재진입→Ready→갤러리 실행', () => {
  const id = B.create({ name: '여정 슬라이드쇼', composition: 'slideshow', theme: 'th-minimal', ratio: '16:9' });
  const mf = B.get(id).manifest;
  A(mf.scenes.length === 4 && mf.scenes.some((s) => s.usePlan), '기본 씬 구조(§5) 아님');
  const r10 = B.previewBuild(id, { mediaCount: 10 });
  A(r10.ok && r10.doc.scenes.length >= 10, '사진 10 실빌드 실패');
  renderAll(r10);
  /* Draft 저장 → localStorage 왕복 재진입 (§19) */
  const before = JSON.stringify(B.get(id).manifest);
  B._reload();
  A(B.get(id) && JSON.stringify(B.get(id).manifest) === before, '재진입 후 Manifest 불일치');
  /* Ready → 갤러리 → 프로젝트 생성 (§20) */
  B.setInfo(id, { thumbnail: 'full-media', gallery: true });
  const pub = B.publish(id);
  A(pub.ok, 'Ready 실패: ' + JSON.stringify(pub.errors));
  A(C.listCompositions().some((c) => c.name === '여정 슬라이드쇼'), '갤러리 카드 없음');
  const gb = M.build(id, { medias: B.sampleMedias(6), texts: { title: '여정' } });
  A(gb.ok && gb.doc.scenes.length >= 6, '갤러리 경로 프로젝트 생성 실패');
  renderAll(gb);
  B.remove(id);
  A(!C.listCompositions().some((c) => c.name === '여정 슬라이드쇼'), '삭제 후에도 갤러리 잔존');
});

/* ---------- §24 Test 2 — Theme 변경: 구조 유지·시각만 변경 ---------- */
T('Test2 — Theme 변경: Scene 구조·미디어 유지, 색·타이포만 변경, 재생 정상', () => {
  const id = B.create({ name: '테마 검사', composition: 'slideshow', theme: 'th-minimal' });
  const medias = B.sampleMedias(4);
  const a = B.previewBuild(id, { medias });
  const scenesA = B.get(id).manifest.scenes.map((s) => s.id).join(',');
  B.setInfo(id, { theme: 'th-bold' });
  const scenesB = B.get(id).manifest.scenes.map((s) => s.id).join(',');
  A(scenesA === scenesB, 'Theme 변경이 Scene 구조를 재생성(§11 위반)');
  const b = B.previewBuild(id, { medias });
  A(a.ok && b.ok && a.doc.scenes.length === b.doc.scenes.length, '씬 수 변동');
  A(a.doc.themeId !== b.doc.themeId, 'Theme 미반영');
  const bgA = JSON.stringify(a.doc.scenes[0].background), bgB = JSON.stringify(b.doc.scenes[0].background);
  A(bgA !== bgB, '배경 시각 무변 — Theme 실반영 아님');
  renderAll(b);
  B.remove(id);
});

/* ---------- §24 Test 3 — Layout 변경: 슬롯 재구성·안내 ---------- */
T('Test3 — Layout 변경: 호환 검사·슬롯 수 변화 안내·미리보기 갱신·저장 왕복', () => {
  const id = B.create({ name: '레이아웃 검사', composition: 'slideshow' });
  const add = B.addScene(id, { role: 'media', layout: 'split' });
  A(add.ok, '씬 추가 실패');
  const bad = B.setScene(id, add.sceneId, { layout: 'overlay-two' });
  A(!bad.ok, '없는/비호환 Layout 을 허용');
  const shrink = B.setScene(id, add.sceneId, { layout: 'full-media' });
  A(shrink.ok && /슬롯|줄어/.test(shrink.note || ''), '슬롯 축소 안내(§9) 없음: ' + JSON.stringify(shrink));
  const sc = B.get(id).manifest.scenes.find((s) => s.id === add.sceneId);
  A(sc.layout === 'full-media', 'Layout 미적용');
  B._reload();
  A(B.get(id).manifest.scenes.some((s) => s.id === add.sceneId && s.layout === 'full-media'), '저장 왕복 후 Layout 소실');
  B.remove(id);
});

/* ---------- §24 Test 4 — Scene 순서 변경 → 재생 순서 실반영 ---------- */
T('Test4 — Scene 순서 변경: Manifest·빌드·MK_PLAY 시퀀스 순서 반영 + 저장 유지', () => {
  const id = B.create({ name: '순서 검사', composition: 'slideshow' });
  B.setScene(id, 'sc-high', { required: true }); /* highlight 를 항상 등장시켜 순서 관찰 */
  const r1 = B.previewBuild(id, { mediaCount: 2, texts: { highlight: '별' } });
  const roles1 = r1.doc.scenes.map((s) => s.role).join(',');
  A(B.moveScene(id, 'sc-high', -1), '이동 실패'); /* highlight 를 media 앞으로 */
  const r2 = B.previewBuild(id, { mediaCount: 2, texts: { highlight: '별' } });
  const roles2 = r2.doc.scenes.map((s) => s.role).join(',');
  A(roles1 !== roles2, '순서 변경이 빌드에 미반영');
  A(roles2.indexOf('highlight') < roles2.indexOf('media'), '재생 순서 불일치: ' + roles2);
  A(P.sequence(r2.doc).length === r2.doc.scenes.length && P.sequence(r2.doc)[0].durMs >= 1600, 'MK_PLAY 시퀀스 계약');
  B._reload();
  const order = B.get(id).manifest.scenes.map((s) => s.id).join(',');
  A(order.indexOf('sc-high') < order.indexOf('sc-media'), '저장 후 순서 소실');
  B.remove(id);
});

/* ---------- §24 Test 5 — 템플릿 복제 ---------- */
T('Test5 — 복제: 새 id·원본 무변경·복사본만 Theme 변경·갤러리 별도 동작', () => {
  const src = B.list().find((t) => t.name === '느린 필름');
  A(src, '시드 A 없음');
  const origBefore = JSON.stringify(B.get(src.id).manifest);
  const nid = B.duplicate(src.id);
  A(nid && nid !== src.id, '새 templateId 아님');
  const copy = B.get(nid);
  A(/복사본/.test(copy.manifest.meta.name) && copy.status === 'draft', '복사본 표기·Draft 아님');
  B.setInfo(nid, { theme: 'th-bold', name: '느린 필름 볼드판', thumbnail: 'full-media', gallery: true });
  A(JSON.stringify(B.get(src.id).manifest) === origBefore, '원본이 변경됨(§21 위반)');
  const pub = B.publish(nid);
  A(pub.ok, '복사본 게시 실패: ' + JSON.stringify(pub.errors));
  const cards = C.listCompositions().map((c) => c.name);
  A(cards.includes('느린 필름') && cards.includes('느린 필름 볼드판'), '갤러리에 별도 템플릿으로 안 뜸');
  const gb = M.build(nid, { medias: B.sampleMedias(3), texts: { title: '복제' } });
  A(gb.ok && gb.doc.themeId === 'th-bold', '복사본 갤러리 빌드/테마 불일치');
  B.remove(nid);
});

/* ---------- §24 Test 6 — 유효성 오류 감지·해결 안내 ---------- */
T('Test6 — Validator: 없는 Layout·중복 Scene ID·잘못된 duration·기본비율 이탈 전부 감지 + 위치 표기', () => {
  const id = B.create({ name: '오류 검사', composition: 'slideshow' });
  const e = B.get(id).manifest;
  e.scenes[1].layout = 'no-such-layout';
  e.scenes.push({ ...JSON.parse(JSON.stringify(e.scenes[0])) }); /* 중복 id */
  e.scenes[0].duration = { default: 3, min: 5, max: 2 };
  B.setInfo(id, { defaultRatio: '21:9' });
  const v = B.validateDraft(id);
  A(!v.ok, '오류를 통과시킴');
  const codes = v.errors.map((x) => x.code);
  for (const c of ['E_UNKNOWN_LAYOUT', 'E_DUP_SCENE_ID', 'E_BAD_DURATION', 'E_BAD_DEFAULT_RATIO'])
    A(codes.includes(c), c + ' 미감지: ' + codes.join(','));
  A(v.errors.some((x) => /Scene \d+ · /.test(x.msg)), '위치 표기(§17) 없음');
  const pub = B.publish(id);
  A(!pub.ok, '오류 상태 Ready 를 허용');
  B.remove(id);
});

/* ---------- §24 Test 7 — Before & After 전 여정 ---------- */
T('Test7 — 비포애프터: 쌍3 샘플·16:9/9:16 실빌드·갤러리 등록·프로젝트 생성', () => {
  const id = B.create({ name: '비교 여정', composition: 'beforeafter', theme: 'th-minimal' });
  const mf = B.get(id).manifest;
  A(mf.pairMode && mf.scenes.some((s) => s.pairOnly), '§5 비교 기본 구조 아님');
  for (const ratio of ['16:9', '9:16']) {
    const r = B.previewBuild(id, { pairCount: 3, ratio });
    A(r.ok, ratio + ' 빌드 실패: ' + (r.why || ''));
    A(r.doc.scenes.filter((s) => s.role === 'comparison').length >= 1, ratio + ' 비교 씬 없음');
    A(r.doc.scenes[0].width === C.RATIOS[ratio].w && r.doc.scenes[0].height === C.RATIOS[ratio].h, ratio + ' 캔버스 크기 — 중앙 크롭 위장(§16) 의심');
    renderAll(r);
  }
  B.setInfo(id, { thumbnail: 'split', gallery: true });
  const pub = B.publish(id);
  A(pub.ok, 'Ready 실패: ' + JSON.stringify(pub.errors));
  const gb = M.build(id, { pairs: B.samplePairs(3), texts: { title: '변화' }, ratio: '9:16' });
  A(gb.ok && gb.doc.scenes.some((s) => s.role === 'comparison'), '갤러리 경로 실패');
  B.remove(id);
});

/* ---------- §22 다양성 — Builder 만으로 만든 4종 실작동 ---------- */
T('§22 다양성 — 시드 A·B·C·D 4종 갤러리 라이브 + 전부 실빌드·실렌더', () => {
  const names = ['느린 필름', '스냅 비트', '차분한 비교', '임팩트 체인지'];
  const cards = C.listCompositions().map((c) => c.name);
  for (const n of names) A(cards.includes(n), '갤러리 누락: ' + n);
  for (const n of names) {
    const t = B.list().find((x) => x.name === n);
    A(t && t.status === 'ready', n + ' 상태 ready 아님');
    const r = B.previewBuild(t.id, { mediaCount: 8, pairCount: 2 });
    A(r.ok, n + ' 빌드 실패');
    renderAll(r);
  }
});

T('§22-B 스냅 비트 — 분할·콜라주 리듬 실적용 (16:9 사진 12장에 collage 등장)', () => {
  const t = B.list().find((x) => x.name === '스냅 비트');
  const r = B.previewBuild(t.id, { mediaCount: 12, ratio: '16:9' });
  A(r.ok, '빌드 실패');
  const kinds = r.doc.scenes.map((s) => (s.elements || []).filter((el) => (el.kind === 'image' && el.src) || el.kind === 'video').length);
  A(kinds.some((n) => n >= 3), '콜라주(3+ 미디어 씬) 없음: ' + kinds.join(','));
  A(kinds.some((n) => n === 2), '분할(2 미디어 씬) 없음');
});

T('§22-D 임팩트 체인지 — wipe-vertical 기본 방식 + 9:16 실동작', () => {
  const t = B.list().find((x) => x.name === '임팩트 체인지');
  const r = B.previewBuild(t.id, { pairCount: 2, ratio: '9:16' });
  A(r.ok && r.method === 'wipe-vertical', 'method=' + (r.method || 'none'));
  const tr = r.doc.scenes.find((s) => s.role === 'transform');
  A(tr, '변신 씬 없음');
  A((tr.elements || []).some((el) => el.anim && el.anim.preset === 'wipe'), 'wipe 리빌 애니 없음');
});

/* ---------- §18 상태 전이 ---------- */
T('§18 상태 — Inactive: 보존하되 갤러리에서 숨김, 재게시로 복귀', () => {
  const id = B.create({ name: '상태 검사', composition: 'slideshow' });
  B.setInfo(id, { thumbnail: 'full-media', gallery: true });
  A(B.publish(id).ok, 'Ready 실패');
  A(C.listCompositions().some((c) => c.name === '상태 검사'), '갤러리 미노출');
  B.setStatus(id, 'inactive');
  A(!C.listCompositions().some((c) => c.name === '상태 검사'), 'Inactive 인데 갤러리 잔존');
  A(B.get(id), 'Inactive 가 템플릿을 삭제함');
  A(B.publish(id).ok, '재게시 실패');
  A(C.listCompositions().some((c) => c.name === '상태 검사'), '재게시 후 미노출');
  B.remove(id);
});

/* ---------- 수정 → Ready 강등 (정직 상태) ---------- */
T('정직 상태 — Ready 템플릿 수정 시 Draft 강등 (검증 안 된 채 게시 가능 위장 금지)', () => {
  const id = B.create({ name: '강등 검사', composition: 'slideshow' });
  B.setInfo(id, { thumbnail: 'full-media', gallery: true });
  A(B.publish(id).ok, 'Ready 실패');
  B.setScene(id, 'sc-title', { name: '수정됨' });
  A(B.get(id).status === 'draft', '수정 후에도 ready 유지');
  B.remove(id);
});

/* ---------- §6 Scene 추가 — 역할·Layout 호환 ---------- */
T('§6 Scene 추가 — 역할·Layout 비호환 거부, 호환 목록 제공, 고유 ID', () => {
  const id = B.create({ name: '추가 검사', composition: 'slideshow' });
  const bad = B.addScene(id, { role: 'quote', layout: 'collage' });
  A(!bad.ok && /호환/.test(bad.msg), '비호환 조합 허용');
  A(B.layoutsForRole('media').includes('collage'), '호환 목록 계약');
  const a = B.addScene(id, { role: 'media', layout: 'collage' });
  const b = B.addScene(id, { role: 'media', layout: 'split' });
  A(a.ok && b.ok && a.sceneId !== b.sceneId, '고유 Scene ID 실패');
  const meta = B.layoutMeta('collage');
  A(meta.mediaSlots === 3 && meta.roles.includes('media'), 'Layout 메타(§7) 불일치');
  B.remove(id);
});

/* ---------- §4-2 필수 Scene 삭제 경고 ---------- */
T('§4-2 필수 Scene 삭제 — 경고 후 force 로만 삭제', () => {
  const id = B.create({ name: '삭제 검사', composition: 'slideshow' });
  const r1 = B.removeScene(id, 'sc-title');
  A(!r1.ok && r1.warn && /필수/.test(r1.msg), '필수 삭제 경고 없음');
  A(B.removeScene(id, 'sc-title', true).ok, 'force 삭제 실패');
  A(!B.get(id).manifest.scenes.some((s) => s.id === 'sc-title'), '삭제 미반영');
  B.remove(id);
});

/* ---------- 화면 — 실DOM 실동작 (§23 버튼만 있는 UI 금지) ---------- */
T('화면 — #/tbuilder 목록·편집·씬 선택·Ready 실DOM 동작', () => {
  const PG = window.PG; PG.boot && PG.boot();
  PG.go('tbuilder');
  const root = window.document;
  A(root.querySelector('[data-tb="new"]'), '목록 화면 없음');
  const editBtn = [...root.querySelectorAll('[data-tb="edit"]')][0];
  A(editBtn, '편집 버튼 없음');
  editBtn.onclick();
  A(root.querySelector('[data-tb="ready"]'), '편집기 미진입');
  A(root.querySelector('svg'), '중앙 실렌더 미리보기 없음(정적 위장 §4-3)');
  const sel = root.querySelector('[data-tb="sel"]');
  sel.onclick({ target: sel });
  A(root.querySelector('[data-tb="s-layout"]'), '씬 속성 패널 미표시');
  root.querySelector('[data-tb="check"]').onclick();
  A(/검사 통과|오류/.test(root.body.textContent), '검사 결과 미표시');
  root.querySelector('[data-tb="back"]').onclick();
  A(root.querySelector('[data-tb="new"]'), '목록 복귀 실패');
});

/* ---------- 감사 ---------- */
T('감사 — MK_TBUILD.audit·MK_MANIFEST.audit·MK_COMPOSE 갤러리 무오염', () => {
  const a = B.audit();
  A(a.ok, 'tbuild 위반: ' + a.violations.join(','));
  const m = M.audit();
  A(m.ok, 'manifest 위반: ' + m.violations.join(','));
  A(!C.listCompositions().some((c) => c.id.startsWith('__tbd-')), '휘발 comp 노출');
});

console.log('\nR64: ' + pass + '/' + (pass + fail) + (fail ? '  ← FAIL ' + fail : '  ALL PASS'));
process.exit(fail ? 1 : 0);
