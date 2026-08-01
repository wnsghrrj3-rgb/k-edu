/* R53 — Video 허브: 구조 템플릿 선택 → 업로드 → MK_COMPOSE → 에디터 배선 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));
/* 부트 — index.html 순서 축약 (video 허브 의존만) */
load('data/animations.js'); load('data/render.js'); load('data/caption.js');
load('data/compose.js'); load('data/compositions.js');
load('data/assets.js'); load('data/sample.js'); load('data/templates.js'); load('data/tplpack.js'); load('data/projects.js'); load('data/start.js');
load('screens/misc.js'); load('screens/video.js');

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const C = window.MK_COMPOSE, H = window.MK_VIDHUB, S = window.MK_SCREENS;
const root = document.getElementById('root');
const draw = () => { root.innerHTML = S.video.render(); S.video.mount.call(S.video, root); };
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));

/* ---------- 1. 승격 대체 — misc.js 이후 로드로 video 화면이 허브 버전 ---------- */
T('screens/video.js가 misc.js의 video 화면을 승격 대체', () => {
  A(S.video && typeof S.video.render === 'function', 'video 화면 없음');
  A(S.video.render().includes('vh-grid'), '허브 렌더 아님');
});

T('MK_VIDHUB 공개 API — st·select·startBuild·pick', () => {
  ['st', 'select', 'startBuild', 'pick'].forEach((k) => A(H[k] != null, k + ' 없음'));
});

/* ---------- 2. 카드 — 10종 전부 + 권장 미디어 수·예상 길이·비율 표시 ---------- */
T('Composition 카드 수 = listCompositions 수 (10종)', () => {
  draw();
  const n = C.listCompositions().length;
  A(n >= 10, 'compositions ' + n);
  A(root.querySelectorAll('[data-vh-comp]').length === n, '카드 수 불일치');
});

T('카드마다 권장 미디어 수·예상 길이·비율 3배지 표시', () => {
  const cards = [...root.querySelectorAll('.vh-card')];
  cards.forEach((c) => {
    const badges = c.querySelectorAll('.vh-badge');
    A(badges.length === 3, '배지 ' + badges.length);
    A(/장|사진 없이도/.test(badges[0].textContent), '미디어 수 없음');
    A(/약 \d+초|길이 자동/.test(badges[1].textContent), '길이 없음');
    A(/^\d+:\d+$|^A4$/.test(badges[2].textContent.trim()), '비율 없음: ' + badges[2].textContent);
  });
});

T('카드 문구가 listCompositions 실데이터와 일치 (첫 카드)', () => {
  const c0 = C.listCompositions()[0];
  const card = root.querySelector(`[data-vh-comp="${c0.id}"]`);
  A(card.textContent.includes(c0.name), '이름');
  A(card.textContent.includes(`딱 좋아요: ${c0.recommendedMediaCount.ideal}장`), 'ideal');
  A(card.textContent.includes(`약 ${c0.recommendedDuration.default}초`), 'duration');
  A(card.textContent.includes(c0.defaultRatio), 'ratio');
});

/* ---------- 3. 빠른 시작 존속 ---------- */
T('MK_START 빠른 시작 3버튼 존속 (vid-files·vid-tpl·go-projects)', () => {
  ['vid-files', 'vid-tpl', 'go-projects'].forEach((k) => A(root.querySelector(`[data-st="${k}"]`), k + ' 없음'));
});

T('vid-files 클릭 → MK_START.pickAndStart 호출', () => {
  let called = null;
  const orig = window.MK_START.pickAndStart;
  window.MK_START.pickAndStart = (mode) => { called = mode; };
  root.querySelector('[data-st="vid-files"]').onclick();
  window.MK_START.pickAndStart = orig;
  A(called === 'video', 'mode=' + called);
});

/* ---------- 4. 선택 흐름 — 카드 → 패널 → 테마 칩 ---------- */
T('카드 클릭 → 선택 패널 열림 + 테마 칩(2종) + 기본 테마 선택됨', () => {
  const c0 = C.listCompositions()[0];
  root.querySelector(`[data-vh-comp="${c0.id}"]`).onclick();
  A(H.st.comp === c0.id, 'comp 미설정');
  A(root.querySelector('#vhPanel'), '패널 없음');
  const chips = root.querySelectorAll('[data-vh-theme]');
  A(chips.length === C.listThemes().length, '칩 수');
  A(H.st.theme === C.listThemes()[0].id, '기본 테마');
  A(root.querySelector('.vh-chip.on'), '선택 표시 없음');
});

T('테마 칩 클릭 → st.theme 교체 + on 클래스 이동', () => {
  const t1 = C.listThemes()[1];
  root.querySelector(`[data-vh-theme="${t1.id}"]`).onclick();
  A(H.st.theme === t1.id, 'theme');
  A(root.querySelector('.vh-chip.on').dataset.vhTheme === t1.id, 'on 이동');
});

T('제목·부제 입력 → st 반영 + 재렌더에도 값 유지', () => {
  const ti = root.querySelector('#vhTitle'); ti.value = '봄 소풍'; ti.oninput();
  const su = root.querySelector('#vhSub'); su.value = '4학년 1반'; su.oninput();
  A(H.st.title === '봄 소풍' && H.st.sub === '4학년 1반', 'st 미반영');
  draw();
  A(root.querySelector('#vhTitle').value === '봄 소풍', '재렌더 유실');
});

T('같은 카드 재클릭 → 선택 해제(패널 닫힘)', () => {
  const id = H.st.comp;
  root.querySelector(`[data-vh-comp="${id}"]`).onclick();
  A(H.st.comp === null, '해제 안 됨');
  A(!root.querySelector('#vhPanel'), '패널 잔존');
  H.select(id); draw(); /* 이후 테스트 위해 복구 */
});

/* ---------- 5. startBuild — buildProject → MK_START.open 경로 ---------- */
T('startBuild(사진 6장) → ok + doc 스키마 + 제목 반영 + 프로젝트 생성·열림', () => {
  let opened = null;
  const wsOrig = window.MK_WS; window.MK_WS = { enter: (pid) => { opened = pid; } };
  const r = H.startBuild(mk(6));
  window.MK_WS = wsOrig;
  A(r.ok, 'fail: ' + (r.why || r.guide));
  A(r.doc.contentType === 'video' && Array.isArray(r.doc.scenes) && r.doc.scenes.length === r.sceneCount, 'doc 스키마');
  A(r.doc.title === '봄 소풍', 'texts.title 미반영: ' + r.doc.title);
  A(r.doc.compositionId === H.st.comp && r.doc.themeId === H.st.theme, '선택값 미반영');
  A(opened, 'MK_PROJ 프로젝트 미열림');
  const p = window.MK_PROJ.current();
  A(p && p.doc.templateId === r.doc.templateId, '프로젝트 doc 불일치');
});

T('startBuild 빈 미디어 → 정직 실패 + 안내문 st.msg', () => {
  const r = H.startBuild([]);
  A(!r.ok, '성공하면 안 됨');
  A(H.st.msg && H.st.msg.length > 5, '안내문 없음');
});

T('남는 미디어 → 정직 알림(alert) 후 열림', () => {
  let alerted = '';
  const aOrig = window.alert; window.alert = (m) => { alerted += m; };
  const wsOrig = window.MK_WS; window.MK_WS = { enter: () => {} };
  H.select(H.st.comp); H.select('cx-cardnews'); /* 카드뉴스: max 8 — 20장이면 초과 확실 */
  const r = H.startBuild(mk(20));
  window.alert = aOrig; window.MK_WS = wsOrig;
  A(r.ok, 'fail: ' + (r.why || ''));
  if (r.unusedMedia > 0) A(alerted.length > 0, '남는 미디어 알림 없음');
});

T('제목 비우면 texts.title 미전달 → needs:title 씬 자동 생략 (compose 규약)', () => {
  H.st.title = ''; H.st.sub = '';
  H.select(H.st.comp); H.select('cx-slideshow');
  const wsOrig = window.MK_WS; window.MK_WS = { enter: () => {} };
  const r = H.startBuild(mk(4));
  window.MK_WS = wsOrig;
  A(r.ok, 'fail');
  A(!r.doc.scenes.some((s) => s.role === 'title'), '제목 씬이 남아 있음');
});

/* ---------- 6. 회귀 — misc.js photo 화면 무손상 ---------- */
T('Photo 화면(misc.js) 무손상 — 렌더·pickAndStart 배선 유지', () => {
  A(S.photo && S.photo.render().includes('ph-files'), 'photo 화면 훼손');
});

console.log(`\nR53: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
