/* R36 이식 라운드 — MK_LIVE 실편집·실이미지·영속 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const L = window.MK_LIVE, PG = window.PG, H = window.MK_HIST;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mouse = (type, x, y, opts = {}) => new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ...opts });

/* ============ 1. 순수 기하 엔진 ============ */
sec('1. 기하 — 드래그·리사이즈·회전·스냅');
const au = L.liveAudit();
T('liveAudit 전 항목', au.ok, JSON.stringify(au.violations));
{
  const el = { kind: 'image', x: 90, y: 90, w: 20, h: 20 };
  L.dragTo(el, 90, 90, 50, 50);
  T('드래그 씬 이탈 방지 (96 상한)', el.x === 96 && el.y === 96);
  L.dragTo(el, 5, 5, -30, -30);
  T('드래그 좌상 이탈 방지 (요소 4% 잔존)', el.x === -16 && el.y === -16);
  const tx = { kind: 'text', x: 10, y: 10, w: 40, size: 4 };
  L.resizeTo(tx, 'br', { x: 10, y: 10, w: 40, size: 4 }, 40, 0, {});
  T('텍스트 모서리 = 글자 스케일 (w80→size8)', tx.w === 80 && tx.size === 8);
  const bx = { kind: 'image', x: 20, y: 20, w: 30, h: 20 };
  L.resizeTo(bx, 'tl', { x: 20, y: 20, w: 30, h: 20 }, 10, 5, {});
  T('tl 핸들 — 원점 이동+축소', bx.x === 30 && bx.y === 25 && bx.w === 20 && bx.h === 15);
  L.resizeTo(bx, 'br', { x: 30, y: 25, w: 20, h: 15 }, 20, 0, { aspect: true });
  T('Shift 비율 고정 (h = w×비율)', bx.w === 40 && bx.h === 30);
  const rt = { kind: 'image', x: 40, y: 40, w: 20, h: 20 };
  L.rotateTo(rt, 50, 50, 90, 58);
  T('회전 각도 (우측 아래 → ~101°)', rt.rot >= 99 && rt.rot <= 103);
  L.rotateTo(rt, 50, 50, 89, 50);
  T('회전 90° 자석 (±4°)', rt.rot === 90);
  const sn = { kind: 'image', x: 20, y: 20, w: 10, h: 10 };
  const g = L.snap(sn, [{ x: 30.8, y: 60, w: 10, h: 10 }]);
  T('요소 변 스냅 (우변→타 좌변 30.8)', sn.x === 20.8 && g.v === 30.8);
}

/* ============ 2. 키보드·구조 편집 ============ */
sec('2. 키보드·구조 편집');
{
  const el = { kind: 'text', x: 10, y: 10, w: 40, size: 4, text: 'A' };
  L.nudge(el, 'ArrowRight', false); L.nudge(el, 'ArrowDown', true);
  T('넛지 0.5% / Shift 2%', el.x === 10.5 && el.y === 12);
  const sc = { elements: [{ kind: 'text', x: 1, y: 1, w: 10, text: 'a' }, { kind: 'image', x: 5, y: 5, w: 10, h: 10 }] };
  const ni = L.dupEl(sc, 1);
  T('복제 — 바로 뒤 삽입+3% 오프셋', ni === 2 && sc.elements.length === 3 && sc.elements[2].x === 8);
  L.removeEl(sc, 2);
  T('삭제 실변형', sc.elements.length === 2);
  T('텍스트 커밋', L.editText(sc.elements[0], '증발과 응결').ok && sc.elements[0].text === '증발과 응결');
  T('이미지에 editText 정직 거부', !L.editText(sc.elements[1], 'x').ok);
}

/* ============ 3. 실이미지 — src 계약 ============ */
sec('3. 실이미지');
{
  const E = window.MK_EASY, d = E.demoDoc();
  const ei = d.scenes[0].elements.findIndex((x) => E.kindOf(x) !== 'text');
  d.scenes[0].elements[ei].anim = { preset: 'pop' }; d.scenes[0].elements[ei].radius = 10; d.scenes[0].elements[ei].fit = 'cover';
  const geo = { x: d.scenes[0].elements[ei].x, y: d.scenes[0].elements[ei].y, w: d.scenes[0].elements[ei].w, h: d.scenes[0].elements[ei].h };
  const r = L.replaceWithSrc(d, 0, ei, { name: '운동회', kind: 'image', src: 'data:image/png;base64,iVBOR' });
  const el = d.scenes[0].elements[ei];
  T('교체 — src 탑재', r.ok && el.src === 'data:image/png;base64,iVBOR');
  T('교체 — 틀 불변', el.x === geo.x && el.y === geo.y && el.w === geo.w && el.h === geo.h);
  T('교체 — 애니·크롭 유지', el.anim.preset === 'pop' && el.radius === 10 && el.fit === 'cover');
  const n0 = d.scenes[0].elements.length;
  const r2 = L.insertWithSrc(d, 0, { name: '새 사진', kind: 'image', src: 'data:image/png;base64,BBB' });
  T('삽입 — src+자동 애니', r2.ok && d.scenes[0].elements.length === n0 + 1 && d.scenes[0].elements[n0].src === 'data:image/png;base64,BBB' && d.scenes[0].elements[n0].anim && d.scenes[0].elements[n0].anim.preset);
  /* fileToSrc — Reader 주입 검증 */
  let got = null;
  class FakeReader { readAsDataURL() { this.result = 'data:image/jpeg;base64,FAKE'; this.onload(); } }
  L.fileToSrc({ type: 'image/jpeg', size: 100, name: 'x.jpg' }, (src) => { got = src; }, FakeReader);
  T('fileToSrc — dataURL 반환', got === 'data:image/jpeg;base64,FAKE');
  let err2 = null;
  /* R90 정정(의도 보존 — §1.101 전례): 잣대의 의도 = 감당 못 할 입력을 조용히
     삼키지 않는다. R89 세계에선 8MB 초과 「사진」은 줄여서 받는 게 설계라
     정직 거부의 표적은 재인코딩이 불가한 「영상」이다. 구세계(normalizeImage
     부재)에선 원문 그대로 사진으로 잰다. */
  const bigType = L.normalizeImage ? 'video/mp4' : 'image/jpeg';
  L.fileToSrc({ type: bigType, size: 9 * 1024 * 1024 }, (s, e2) => { err2 = e2; }, FakeReader);
  T('fileToSrc — 8MB 상한 정직 거부(재인코딩 불가 유형)', /8MB/.test(err2 || ''));
  let nul = 'x';
  L.fileToSrc({ type: 'application/pdf', size: 10 }, (s) => { nul = s; }, FakeReader);
  T('fileToSrc — 비미디어 거부', nul === null);
}

/* ============ 4. 영속 — 저장·복원·자동저장 ============ */
sec('4. 영속');
{
  const mem = {}; L.useBackend({ getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } });
  const doc = { id: 'test-doc', scenes: [{ id: 's1', elements: [{ kind: 'text', text: '가', x: 1, y: 1, w: 10 }] }] };
  T('saveDoc/loadDoc 왕복', L.saveDoc(doc) && L.loadDoc('test-doc').doc.scenes[0].elements[0].text === '가');
  L.clearDoc('test-doc');
  T('clearDoc', L.loadDoc('test-doc') === null);
  /* 자동저장 디바운스 — timer 주입 */
  let fired = 0; const timers = [];
  const setT = (f) => { timers.push(f); return timers.length; };
  L.autosave(doc, { setTimeout: setT, clearTimeout: () => {}, onSaved: () => fired++ });
  L.autosave(doc, { setTimeout: setT, clearTimeout: () => {}, onSaved: () => fired++ });
  timers[timers.length - 1]();
  T('디바운스 — 마지막 1회만 저장', fired === 1 && !!L.loadDoc('test-doc'));
  T('리뷰 모드 자동저장 차단', L.autosave(doc, { review: true }).ok === false);
  /* 프로젝트 직렬화 왕복 */
  const P = window.MK_PROJ;
  const before = P.list('recent').length;
  T('serialize/hydrate 왕복', P.hydrate(P.serialize()) && P.list('recent').length === before);
  T('hydrate 불량 입력 정직 거부', P.hydrate('덜된 json{') === false && P.hydrate('[]') === false);
  L.useBackend(null);
}

/* ============ 5. 라이브 — 실DOM 드래그·리사이즈·인라인 편집 ============ */
sec('5. 라이브 실DOM');
window.localStorage.clear();
PG.go('editor');
let cv = window.document.querySelector('.ed-canvas');
T('에디터 부팅·캔버스 존재', !!cv);
const RECT = { left: 0, top: 0, width: 1000, height: 562, right: 1000, bottom: 562 };
const fixRect = () => { cv = window.document.querySelector('.ed-canvas'); if (cv) { cv.getBoundingClientRect = () => RECT; Object.defineProperty(cv, 'clientHeight', { value: 562, configurable: true }); } };
fixRect();
{
  const e = PG.state.editor, sc = e.doc.scenes[e.sceneIdx];
  const i = sc.elements.findIndex((x) => x.kind !== 'text');
  const el = sc.elements[i];
  const x0 = el.x, y0 = el.y;
  const n = cv.querySelector(`[data-el="${i}"]`);
  n.dispatchEvent(mouse('pointerdown', 100, 100));
  cv.dispatchEvent(mouse('pointermove', 200, 156));            /* +10% / +10% */
  cv.dispatchEvent(mouse('pointerup', 200, 156));
  const el2 = PG.state.editor.doc.scenes[PG.state.editor.sceneIdx].elements[i];
  T('드래그 이동 실반영 (+10%±스냅)', Math.abs(el2.x - (x0 + 10)) <= 1.3 && Math.abs(el2.y - (y0 + 10)) <= 1.3, `x ${x0}→${el2.x}`);
  T('드래그 후 선택 유지', PG.state.editor.selEl === i);
  const und = H.undo(); PG.render(); fixRect();
  T('이동이 히스토리에 1건 (undo=이동)', und === '이동' && PG.state.editor.doc.scenes[PG.state.editor.sceneIdx].elements[i].x === x0);
  H.redo(); PG.render(); fixRect();
}
{
  /* 리사이즈 — 선택 상태에서 br 핸들 */
  const e = PG.state.editor, sc = e.doc.scenes[e.sceneIdx];
  const i = sc.elements.findIndex((x) => x.kind !== 'text' && x.h != null);
  e.selEl = i; PG.render(); fixRect();
  const w0 = sc.elements[i].w, h0 = sc.elements[i].h;
  const hd = cv.querySelector(`[data-el="${i}"] .hd.br`);
  T('선택 시 br 핸들 렌더', !!hd);
  hd.dispatchEvent(mouse('pointerdown', 500, 300));
  cv.dispatchEvent(mouse('pointermove', 600, 356));             /* +10% / +10% */
  cv.dispatchEvent(mouse('pointerup', 600, 356));
  const el3 = PG.state.editor.doc.scenes[PG.state.editor.sceneIdx].elements[i];
  T('리사이즈 실반영 (w+10·h+10)', Math.abs(el3.w - (w0 + 10)) < 0.5 && Math.abs(el3.h - (h0 + 10)) < 0.5, `w ${w0}→${el3.w}`);
  fixRect();
}
{
  /* 회전 핸들 */
  const e = PG.state.editor, sc = e.doc.scenes[e.sceneIdx];
  const i = sc.elements.findIndex((x) => x.kind !== 'text' && x.h != null);
  e.selEl = i; PG.render(); fixRect();
  const el = sc.elements[i];
  const cx = (el.x + el.w / 2) / 100 * 1000, cy = (el.y + el.h / 2) / 100 * 562;
  const rot = cv.querySelector(`[data-el="${i}"] .hd.rot`);
  rot.dispatchEvent(mouse('pointerdown', cx, cy - 50));
  cv.dispatchEvent(mouse('pointermove', cx + 80, cy));          /* 우측 = 90° */
  cv.dispatchEvent(mouse('pointerup', cx + 80, cy));
  const el4 = PG.state.editor.doc.scenes[PG.state.editor.sceneIdx].elements[i];
  T('회전 핸들 실반영 (90°)', el4.rot === 90, `rot=${el4.rot}`);
  T('회전 transform 렌더', (cv.querySelector(`[data-el="${i}"]`).getAttribute('style') || '').includes('rotate(90deg)'));
  /* 원위치 */
  H.undo(); PG.render(); fixRect();
}
{
  /* 인라인 텍스트 편집 — dblclick → 입력 → Enter */
  const e = PG.state.editor, sc = e.doc.scenes[e.sceneIdx];
  const i = sc.elements.findIndex((x) => x.kind === 'text');
  const n = cv.querySelector(`[data-el="${i}"]`);
  n.dispatchEvent(mouse('dblclick', 10, 10));
  const span = cv.querySelector(`[data-el="${i}"] .ed-txt[contenteditable]`);
  T('더블클릭 → 인라인 편집 진입', !!span);
  span.textContent = '이식 라운드 실편집';
  span.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  T('Enter 커밋 — doc 실변형', PG.state.editor.doc.scenes[PG.state.editor.sceneIdx].elements[i].text === '이식 라운드 실편집');
  T('편집이 히스토리 등재', H.undo() === '텍스트 편집');
  H.redo(); PG.render(); fixRect();
}
{
  /* 키보드 — 화살표·복제·삭제 */
  const e = PG.state.editor;
  e.selEl = 0; PG.render(); fixRect();
  const sc = () => PG.state.editor.doc.scenes[PG.state.editor.sceneIdx];
  const x0 = sc().elements[0].x;
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  T('화살표 넛지 실반영', sc().elements[0].x === Math.round((x0 + 0.5) * 10) / 10);
  const n0 = sc().elements.length;
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true }));
  T('Ctrl+D 복제', sc().elements.length === n0 + 1 && PG.state.editor.selEl === 1);
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
  T('Delete 삭제', sc().elements.length === n0 && PG.state.editor.selEl === null);
}
{
  /* 실이미지 렌더 — src 있는 요소는 <img>, 미니씬은 배경 */
  const e = PG.state.editor, sc = e.doc.scenes[e.sceneIdx];
  const i = sc.elements.findIndex((x) => x.kind !== 'text');
  L.replaceWithSrc(e.doc, e.sceneIdx, i, { name: '실사진', kind: 'image', src: 'data:image/png;base64,ZZZ' });
  PG.render(); fixRect();
  const img = cv.querySelector(`[data-el="${i}"] img.ed-imgreal`);
  T('캔버스 <img> 실렌더', !!img && img.getAttribute('src') === 'data:image/png;base64,ZZZ');
  const mini = window.document.querySelector('.ed-sc');
  T('미니씬 실이미지 배경', !!mini && /ZZZ/.test(mini.innerHTML));
}

/* ============ 6. 영속 실브라우저 경로 — localStorage 자동저장·복원·리뷰 차단 ============ */
sec('6. 영속 실경로');
await (async () => {
  window.localStorage.clear();
  const e = PG.state.editor;
  const id = e.doc.id;
  H.push('영속 검증');
  e.doc.scenes[e.sceneIdx].name = '저장 확인 장면';
  await sleep(900);                                             /* 디바운스 700ms 통과 */
  const saved = L.loadDoc(id);
  T('편집 → 자동저장 (localStorage 실기록)', !!saved && saved.doc.scenes[e.sceneIdx].name === '저장 확인 장면');
  T('저장 표시 갱신', /저장됨/.test((window.document.getElementById('edSave') || {}).textContent || ''));
  /* 복원 — 에디터 상태 초기화 후 재진입 */
  PG.state.editor = {};
  PG.go('home'); PG.go('editor');
  const e2 = PG.state.editor;
  T('재진입 시 저장본 복원', e2.doc && e2.doc.scenes.some((s) => s.name === '저장 확인 장면'));
  /* 리뷰 모드 — 저장 차단 */
  window.localStorage.clear();
  PG.state.editor = {};
  PG.go('review');
  const er = PG.state.editor;
  T('리뷰 부팅', er.review === true && !!er.doc);
  H.push('리뷰 편집');
  er.doc.scenes[0].name = '리뷰 수정';
  await sleep(900);
  T('리뷰 모드 = localStorage 무기록', window.localStorage.getItem('mklive:doc:' + er.doc.id) === null);
})();

/* ============ 7. 회귀 가드 ============ */
sec('7. 회귀 가드');
{
  PG.state.editor = {}; PG.go('editor');
  const e = PG.state.editor;
  e.selEl = 0; PG.render();
  T('R35 알약 4버튼 공존', window.document.querySelectorAll('.ed-quickpill button').length === 4);
  T('MK_EASY p0Audit 불변', window.MK_EASY.p0Audit().ok !== false);
  T('표면 기준선 동결 유지', window.MK_EASY.surfaceAudit(window.document.querySelector('.ed')).ok !== false);
  const scr = ['home', 'library', 'easy', 'ftue', 'editor'];
  T('주요 화면 렌더 회귀', scr.every((s) => { try { PG.go(s); return (window.document.getElementById('app') || window.document.body).innerHTML.length > 500; } catch (_) { return false; } }));
}

console.log(`\nRound 36: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
