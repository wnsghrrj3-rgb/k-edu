/* ============================================================
   test-round93.mjs — R93 빌드 정직 안내: alert → 워크스페이스 한 줄
   ------------------------------------------------------------
   준호 실기기: 영상 만들기에서 OS 경고창 「생략: ss-title (title 없음)」.
   정체 = 오류 아님 — buildProject 의 정직 안내(notes)가 차단형 alert 로
   나가서 에러처럼 읽히고 흐름을 끊음. 입력창 자리표시가 이미 같은 말을
   하고 있었다(「비우면 제목 장면이 자동으로 빠져요」).
   처방 = 안내는 워크스페이스 상단 한 줄(ws-notice)로: 만들어진 화면
   위에서 조용히 읽히고, 닫기 ✕ 로 치울 수 있다. alert 는 MK_WS 부재
   환경 폴백으로만 잔존.

   계약:
     ① 구조 빌드(video 경로) — notes 발생 시 alert 0 · 워크스페이스에
        ws-notice 로 그 문구가 실린다.
     ② 스테이지 빌드(video2 경로) — 동일.
     ③ 자동 구성(video3 경로) — 동일(warnings 포함).
     ④ 안내 없는 빌드 — ws-notice 미표시(없는 말 안 함).
     ⑤ 닫기 ✕ — 누르면 사라진다.
     ⑥ 일회성 — 다른 프로젝트 재진입 시 이전 안내가 따라오지 않는다.
     ⑦ 폴백 — MK_WS 부재 세계에선 종전 alert 경로 생존.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
const alerts = [];
w.alert = (m) => alerts.push(String(m));
w.confirm = () => true;
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

const H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const notice = () => w.document.querySelector('.ws-notice');

console.log('--- ① 구조 빌드 경로 ---');
T('T1 제목 생략 notes → alert 0 · ws-notice 에 실림', () => {
  alerts.length = 0;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = ''; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  const n = notice();
  return alerts.length === 0 && n && /생략|제목/.test(n.textContent) ? true
    : JSON.stringify({ alerts, notice: n ? n.textContent.slice(0, 60) : null });
});
T('T2 자리 없는 사진 안내도 같은 줄로 (unusedMedia)', () => {
  alerts.length = 0;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '제목'; H.st.sub = '';
  const many = Array.from({ length: 25 }, (_, i) => img(i));
  const r = H.startBuild(many);
  if (!r.ok) return r.why;
  const n = notice();
  const said = (n ? n.textContent : '') + '';
  return alerts.length === 0 && (r.unusedMedia > 0 ? /자리가 없어|남/.test(said) : true) ? true
    : JSON.stringify({ alerts: alerts.length, unused: r.unusedMedia, said: said.slice(0, 60) });
});

console.log('--- ②③ 스테이지·자동 구성 경로 ---');
T('T3 buildStaged — alert 0 · ws-notice', () => {
  alerts.length = 0;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = ''; H.st.sub = '';
  H.resetStage(); H.st.stage = 'media'; H.st.medias = [img(1), img(2)];
  const r = H.buildStaged();
  if (!r.ok) return r.why;
  return alerts.length === 0 && notice() ? true : JSON.stringify({ alerts, n: !!notice() });
});
T('T4 자동 구성(buildSmartGo 상당) — alert 0 · warnings 도 같은 줄', () => {
  alerts.length = 0;
  /* video3 경로는 내부 함수 — 계약 핵심(발화 지점의 alert 부재)은 소스로 잰다 */
  const src = read('screens/video3.js');
  const seg = src.split('const say = ')[1] || '';
  return /pendingNotice = say\.join/.test(seg) && /else if \(say\.length && typeof window\.alert/.test(seg)
    ? true : seg.slice(0, 120);
});

console.log('--- ④⑤⑥ 표시 규율 ---');
T('T5 안내 없는 빌드 — ws-notice 미표시', () => {
  alerts.length = 0;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '제목 있음'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  return notice() ? (notice().textContent.slice(0, 60)) : true;
});
T('T6 닫기 ✕ → 사라진다', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = ''; H.st.sub = '';
  H.startBuild([img(1), img(2)]);
  const n = notice();
  if (!n) return '안내 없음(전제 실패)';
  n.querySelector('[data-ws="notice-x"]').click();
  return notice() ? '잔존' : true;
});
T('T7 일회성 — 재진입에 이전 안내가 따라오지 않는다', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = ''; H.st.sub = '';
  H.startBuild([img(1), img(2)]);                       /* 안내 있는 진입 */
  const doc2 = { id: 'd93', title: '깨끗', contentType: 'video', scenes: [{ id: 's', name: 'a', duration: 2, background: '#fff', elements: [] }], meta: {} };
  const p2 = w.MK_PROJ.createFromDoc(doc2, doc2.title);  /* 안내 없는 진입 */
  w.MK_PROJ.open(p2.projectId);
  return notice() ? '이전 안내 잔존' : true;
});

console.log('--- ⑦ 폴백 ---');
T('T8 MK_WS 부재 세계 — 종전 alert 생존', () => {
  alerts.length = 0;
  const saved = w.MK_WS;
  w.MK_WS = null;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = ''; H.st.sub = '';
  const r = H.startBuild([img(1), img(2)]);
  w.MK_WS = saved;
  return r.ok && alerts.length === 1 && /생략/.test(alerts[0]) ? true
    : JSON.stringify({ ok: r.ok, alerts });
});

console.log('');
console.log('test-round93: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
