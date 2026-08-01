/* R61 — Video 허브 시작 화면 검증 (GPT 2단계 지시서 §13·§14 + §19 시나리오 UI 몫) */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/video' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) { if (/^https?:/.test(f)) continue; const p = f.replace(/^\//, ''); if (!fs.existsSync(p) && !fs.existsSync(f)) continue; window.eval(fs.readFileSync(fs.existsSync(p) ? p : f, 'utf8')); }
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
window.alert = () => {}; window.confirm = () => true;

const H = window.MK_VIDHUB, S = window.MK_SCREENS.video, C = window.MK_COMPOSE;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assert'); };
const mk = (n, p2 = '') => Array.from({ length: n }, (_, i) => ({ name: p2 + i, kind: 'image', src: 'data:image/png;base64,' + p2 + i, w: 800, h: 600 }));
const root = window.document.createElement('div');
window.document.body.appendChild(root);
const draw = () => { root.innerHTML = S.render(); S.mount(root); };

T('시작 화면 진입 — 슬라이드쇼 선택 시 즉시 생성 대신 「고르고 순서 정하기」 (§13)', () => {
  H.select('cx-slideshow'); draw();
  A(root.querySelector('[data-vh-open-stage]'), '스테이지 진입 버튼 없음');
  A(!root.querySelector('[data-vh-pick]'), '즉시 생성 버튼 잔존');
});

T('미디어 스테이징 — 목록·캡션 입력·행 정렬 컨트롤 렌더 (§14)', () => {
  H.stageMedias(mk(4)); draw();
  A(root.querySelectorAll('[data-vh-mrow]').length === 4, '행 4개 아님');
  A(root.querySelectorAll('[data-vh-cap]').length === 4, '캡션 입력 4개 아님');
  A(root.querySelector('[data-vh-mrow]').getAttribute('draggable') === 'true', '드래그 불가');
  A(root.querySelector('[data-vh-build]'), '만들기 버튼 없음');
});

T('예상치 실시간 표기 — 「장면 N개 · 약 S초」 = estimate와 동일 (§8-1)', () => {
  const e = H.estimateNow();
  const est = root.querySelector('.vh-est');
  A(est && est.textContent.includes('장면 ' + e.sceneCount + '개') && est.textContent.includes(e.total + '초'), est ? est.textContent : '없음');
});

T('▲▼ 정렬 — 미디어와 캡션이 함께 움직인다', () => {
  H.setCaption(0, '첫 사진'); draw();
  root.querySelector('[data-vh-mdn="0"]').click();
  A(H.st.medias[1].name === '0' && H.st.captions[1] === '첫 사진', '캡션 동반 이동 실패');
  root.querySelector('[data-vh-mup="1"]').click();
  A(H.st.medias[0].name === '0' && H.st.captions[0] === '첫 사진', '복귀 실패');
});

T('드래그 정렬 — dragstart→drop으로 순서 변경', () => {
  const rows = () => root.querySelectorAll('[data-vh-mrow]');
  const ev = (type) => { const e = new window.Event(type, { bubbles: true, cancelable: true }); e.dataTransfer = { effectAllowed: '' }; return e; };
  rows()[0].dispatchEvent(ev('dragstart'));
  rows()[2].dispatchEvent(ev('drop'));
  A(H.st.medias[2].name === '0' && H.st.captions[2] === '첫 사진', '드래그 이동 실패: ' + H.st.medias.map((m) => m.name));
  /* 이후 테스트 위해 복귀 */
  H.moveMedia(2, -1); H.moveMedia(1, -1); draw();
});

T('행 빼기 — 미디어·캡션 동시 제거·예상치 갱신', () => {
  const before = H.estimateNow().sceneCount;
  root.querySelector('[data-vh-mdel="3"]').click();
  A(H.st.medias.length === 3 && H.st.captions.length === 3, '제거 실패');
  A(H.estimateNow().sceneCount < before, '예상치 미감소');
  H.stageMedias(mk(1, 'x')); draw();
});

T('스테이징 생성 — 캡션·순서·마무리 문구가 doc에 실반영 (§14→§15)', () => {
  H.st.outro = '또 만나요';
  const r = H.buildStaged();
  A(r.ok, r.why);
  const texts = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text));
  A(texts.includes('첫 사진'), '캡션 미반영');
  A(texts.includes('또 만나요'), '마무리 문구 미반영');
  A(window.MK_PROJ.current() && window.MK_PROJ.current().doc.scenes.length === r.sceneCount, '프로젝트 미생성');
});

T('구조 전환 시 스테이징 초기화 — 이전 사진이 새 구조로 새지 않는다', () => {
  H.select('cx-slideshow'); /* 해제 */
  H.select('cx-beforeafter');
  A(H.st.stage === null && H.st.medias.length === 0 && H.st.pairs.length === 0, '초기화 실패');
});

T('Pair 시작 화면 — 전·후 슬롯이 분리된 쌍 입력 (§9-2: 순서 추측 금지)', () => {
  draw();
  const open = root.querySelector('[data-vh-open-stage]');
  A(open && /쌍/.test(open.textContent), '쌍 진입 버튼 없음');
  open.click(); draw();
  A(H.st.stage === 'pairs' && H.st.pairs.length === 1, '쌍 스테이지 진입 실패');
  A(root.querySelector('[data-vh-pb="0"]') && root.querySelector('[data-vh-pa="0"]'), '전·후 슬롯 분리 없음');
});

T('쌍 추가·삭제·정렬', () => {
  H.setPairMedia(0, 'before', mk(1, 'b')[0]); H.setPairMedia(0, 'after', mk(1, 'a')[0]);
  H.addPair(); H.setPairMedia(1, 'before', mk(1, 'B')[0]); H.setPairMedia(1, 'after', mk(1, 'A')[0]);
  H.st.pairs[1].title = '둘째 쌍';
  H.movePair(1, -1);
  A(H.st.pairs[0].title === '둘째 쌍', '정렬 실패');
  H.movePair(0, 1);
  H.addPair(); H.removePair(2);
  A(H.st.pairs.length === 2, '추가/삭제 실패');
});

T('비교 방식 칩 — 비율별 실작동분만·slider-reveal 없음 (§9-5)', () => {
  draw();
  const chips = [...root.querySelectorAll('[data-vh-method]')].map((b) => b.dataset.vhMethod);
  A(chips[0] === 'auto', 'auto 없음');
  const allow = C.METHODS_BY_RATIO[H.st.ratio || '16:9'];
  A(allow.every((m) => chips.includes(m)), '지원 방식 누락: ' + chips.join(','));
  A(!chips.includes('slider-reveal'), 'slider-reveal 가짜 노출');
});

T('누락 쌍 경고 — 예상치 줄에 ⚠ 표기 (§9-4)', () => {
  H.addPair(); H.setPairMedia(2, 'before', mk(1, 'solo')[0]); draw();
  const warn = root.querySelector('.vh-est-warn');
  A(warn && /후 사진/.test(warn.textContent), '경고 미표기');
  H.removePair(2); draw();
});

T('쌍 생성 — 방식 선택이 doc에 실반영·쌍 순서 유지', () => {
  H.st.method = 'wipe-horizontal'; H.st.result = '달라졌어요';
  const r = H.buildStaged();
  A(r.ok && r.method === 'wipe-horizontal', 'method=' + r.method);
  A(r.doc.scenes.some((s) => s.role === 'transform'), '변신 씬 없음');
  const comps = r.doc.scenes.filter((s) => s.role === 'comparison');
  A(comps.length === 2, '비교 씬=' + comps.length);
  A(comps[0].elements.some((e) => e.src && e.src.includes('b0')), '쌍 순서');
  const texts = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text));
  A(texts.includes('달라졌어요'), '결과 문구 미반영');
});

T('기존 R53 API 무손상 — select·startBuild·pick 존속', () => {
  A(typeof H.select === 'function' && typeof H.startBuild === 'function' && typeof H.pick === 'function');
  H.select('cx-beforeafter'); /* 해제 */
  H.select('cx-story');
  const r = H.startBuild(mk(3));
  A(r.ok, 'startBuild 경로 파손: ' + r.why);
  H.select('cx-story');
});

console.log('');
console.log(`R61: ${pass}/${pass + fail}` + (fail ? ' FAIL' : ' ALL PASS'));
process.exit(fail ? 1 : 0);
