/* ============================================================
   test-round104.mjs — R104 원클릭 프리셋(§9): 규칙 기반, 불가침, 수렴
   ------------------------------------------------------------
   깔끔하게·사진 강조·글자 강조 — 기존 스키마 값만 생성하는
   규칙 세 다발. 사용자 설정 불가침 · changed=0 정직 보고 ·
   재실행 수렴 · undo 1건(무변화 시 미적재).

   계약:
     ① MK_SMART verify (불가침·수렴·스냅 반경 포함)
     ② 씬 선택 → 「한 번에 정돈」 버튼 3
     ③ 사진 강조 실행 → 무보정 사진에 filters + n곳 보고 +
        undo 1번 전체 원복
     ④ 무변화 재실행 → 「이미 정돈되어 있어요」 + undo 미적재
     ⑤ 글자 강조 → 제목 위계·굵기, 기존 굵기 텍스트 불가침
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R104_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const PH = w.MK_PHOTO;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });

console.log('--- ① 순수 계약 ---');
T('T1 MK_SMART verify', () => {
  const SM = w.MK_SMART; if (!SM) return '모듈 없음';
  const a = SM.verify(); return a.ok ? true : a.violations.join(', ');
});

const H = w.MK_VIDHUB;
T('T2 사진 3장 빌드 → workspace (기반 회귀)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '정돈'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  return !!w.document.querySelector('.ws-canvas') ? true : w.location.hash;
});

const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const undoBtn = () => [...w.document.querySelectorAll('[data-ws="undo"]')][0];
const sceneBtn = () => w.document.querySelector('[data-ws-smart="photoPop"]');
const curScene = () => { /* 표시 씬 문서 — Footer 번호로 */
  const no = +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
  const list = w.MK_PROJ.list();
  for (const p of list) if (p.doc && p.doc.scenes && p.doc.scenes.length > no) {
    /* 이 워크스페이스의 프로젝트 = 씬 카드 수가 같은 것 */
    if (w.document.querySelectorAll('[data-ws-sc]').length / 2 === p.doc.scenes.length ||
        w.document.querySelectorAll('.ws-scenes [data-ws-sc]').length === p.doc.scenes.length) return p.doc.scenes[no];
  }
  const p0 = list[0]; return p0 && p0.doc.scenes[no];
};

console.log('--- ②③ 씬 패널 + 사진 강조 ---');
T('T3 사진 있는 장면 → 장면 선택 → 정돈 버튼 3', () => {
  for (let g = 0; g < 8 && !allEls().find((n) => n.querySelector('.ws-media')); g++) {
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) break; nx.click();
  }
  /* 장면 선택 = 캔버스 빈 곳 클릭 대신 씬 카드 클릭 */
  const no = +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
  const card = w.document.querySelector(`[data-ws-sc="${no}"]`);
  if (card) card.click();
  const btns = w.document.querySelectorAll('[data-ws-smart]').length;
  return btns === 3 ? true : 'btns=' + btns;
});
T('T4 사진 강조 → 무보정 사진에 filters + 보고 + undo 1번 원복', () => {
  const sc = curScene(); if (!sc) return '씬 미특정';
  const plain = sc.elements.filter((e) => e.kind === 'image' && e.src && !e.filters);
  if (!plain.length) return '무보정 사진 없음(시나리오)';
  const undoBefore = w.document.querySelectorAll('[data-ws="undo"]:not([disabled])').length;
  sceneBtn().click();
  if (!plain.every((e) => e.filters && e.filters.contrast === 1.08)) return 'filters 미부여';
  const msg = [...w.document.querySelectorAll('.ws-context .mut')].map((x) => x.textContent).join(' ');
  if (!/곳 정돈/.test(msg)) return '보고 없음: ' + msg;
  undoBtn().click();
  const sc2 = curScene();
  const still = sc2.elements.filter((e) => e.kind === 'image' && e.src && e.filters && e.filters.contrast === 1.08);
  return still.length === 0 ? true : 'undo 후 잔존 ' + still.length;
});
T('T5 재실행 → 「이미 정돈」 + undo 미적재', () => {
  /* 원복 후 다시 강조 → 또 재실행 = 무변화 */
  const no = +(w.document.querySelector('.page span')).textContent.split('/')[0].trim() - 1;
  w.document.querySelector(`[data-ws-sc="${no}"]`).click();
  sceneBtn().click();                                   /* 1차 — 변화 */
  const depth = () => (undoBtn() && !undoBtn().disabled);
  sceneBtn().click();                                   /* 2차 — 수렴 */
  const msg = [...w.document.querySelectorAll('.ws-context .mut')].map((x) => x.textContent).join(' ');
  if (!/이미 정돈/.test(msg)) return '수렴 보고 없음: ' + msg;
  /* 2차가 undo 를 안 쌓았는지: undo 1번이면 1차 이전으로 완전 복귀 */
  undoBtn().click();
  const sc2 = curScene();
  const dirty = sc2.elements.filter((e) => e.filters && e.filters.contrast === 1.08).length;
  return dirty === 0 ? true : 'undo 1번 후 잔존 ' + dirty;
});

console.log('--- ⑤ 글자 강조 불가침 ---');
T('T6 글자 강조 — 제목 위계 + 기존 굵기 불가침 (순수 경로)', () => {
  const SM = w.MK_SMART;
  const sc = { elements: [
    { kind: 'text', size: 5, text: 'T', x: 0, y: 0, w: 50 },
    { kind: 'text', size: 4, text: 'b', x: 0, y: 20, w: 50, weight: 300 }] };
  SM.textPop(sc, w.MK_ARRANGE);
  const head = sc.elements[0], body2 = sc.elements[1];
  if (head.size !== 6.8 || head.weight !== 700) return 'head=' + JSON.stringify(head);
  return body2.weight === 300 && body2.size === 4 ? true : '본문 침해: ' + JSON.stringify(body2);
});

console.log(`\nR104: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
