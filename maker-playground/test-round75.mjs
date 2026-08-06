/* ============================================================
   test-round75.mjs — R75 재렌더는 사슬 맨 바깥에서
   ------------------------------------------------------------
   영상 화면은 다섯 층이 겹쳐 있다(video → video2 → video3 → video4
   → video5). 각 층이 자기 mount 안에서 `this.render()` + `this.mount()`
   로 다시 그렸다. `this` 가 그 층 자신이라 **위 층이 얹은 것은 다시
   안 걸린다.** 실브라우저 확인 결과 두 가지가 무너졌다.

     · ▲▼✕·캡션 확정(video2 층 재렌더)
         → 역할 칩 16개·자동 구성 줄·씨앗 입력이 통째로 사라짐.
           R67~R74 가 얹은 것이 흔한 조작 하나에 전부 날아갔다.
     · 사진 순서 드래그(video3 층 재렌더)
         → 칩은 남지만 R71 부분 갱신 배선이 죽어 이후 ★ 클릭이
           전체 재렌더로 퇴화. CPU 6배·30장 실크롬에서 3.9ms → 2,966ms.

   여기서 못 박는 계약:
     ① 다시 그릴 때는 지금 화면으로 등록된 맨 바깥 객체로 그린다.
     ② 어느 층에서 시작한 재렌더든 위층 산출물이 살아남는다.
     ③ 어느 층에서 시작한 재렌더든 위층 배선(부분 갱신)이 다시 걸린다.
     ④ 재렌더는 상태를 흔들지 않는다 — 순서·역할·씨앗이 그대로 따라온다.
     ⑤ 헬퍼가 없거나 화면이 아직 승격 전이면 종전대로 자기 자신으로 그린다.
     ⑥ 사슬을 다시 태워도 되풀이(재귀)로 빠지지 않는다.
   ============================================================ */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
/* canvas 미설치 경고는 잠재운다 — 축소본을 못 만드는 환경이라는 뜻이고,
   R73 이 그때 원본을 그리도록 이미 정해 뒀다(여기서 재는 건 배선이다). */
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><div id="pgBody"></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', virtualConsole: vc });
const { window } = dom;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
window.alert = () => {}; window.confirm = () => true;
window.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((x) => !/^https?:/.test(x))) {
  const f = path.join(ROOT, u.replace(/^\//, '').split('?')[0]);
  if (!fs.existsSync(f)) continue;
  try { window.eval(fs.readFileSync(f, 'utf8')); } catch (e) { /* 부트 부작용 무시 — 화면만 본다 */ }
}

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const H = window.MK_VIDHUB, C = window.MK_COMPOSE;
const doc = window.document;
const root = doc.getElementById('pgBody');
const img = (n) => ({ name: 'p' + n + '.jpg', kind: 'image', src: 'data:image/png;base64,AAA' + n, w: 800, h: 600 });

/* 미디어 스테이지를 세우고 실제로 장착한다 — PG 없이 화면이 하는 그대로 */
const N = 8;
const stage = () => {
  H.resetStage();
  H.st.comp = 'cx-slideshow';
  H.st.theme = C.listThemes()[0].id;
  H.st.title = '봄 소풍';
  H.stageMedias(Array.from({ length: N }, (_, i) => img(i)));
  H.st.captions = H.st.medias.map(() => '');
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  return scr;
};
const q = (s) => root.querySelectorAll(s).length;
const shot = () => ({
  role: q('[data-vh-role]'), rows: q('[data-vh-mrow]'),
  smart: q('[data-vh-smart]'), seed: q('#vhSeed'),
});
/* 부분 갱신인가 — 지목한 행 노드가 살아남으면 참 */
const markRow = (i) => root.querySelector(`[data-vh-mrow="${i}"]`);
const alive = (node) => !!(node && doc.contains(node));
const fire = (el, type) => el.dispatchEvent(new window.Event(type, { bubbles: true, cancelable: true }));
/* 화면 객체를 잠깐 갈아 끼울 때는 반드시 되돌린다 — 던져도 되돌린다.
   (되돌리지 않으면 뒤 테스트가 통째로 거짓이 된다. R75 에서 실제로 겪었다.) */
const withScreen = (stub, fn) => {
  const keep = window.MK_SCREENS.video;
  try { window.MK_SCREENS.video = stub; return fn(); }
  finally { window.MK_SCREENS.video = keep; }
};
const dt = { effectAllowed: '', setData() {}, getData() { return ''; } };
const drag = (from, to) => {
  const a = root.querySelector(`[data-vh-mrow="${from}"]`), b = root.querySelector(`[data-vh-mrow="${to}"]`);
  a.dispatchEvent(Object.assign(new window.Event('dragstart', { bubbles: true }), { dataTransfer: dt }));
  b.dispatchEvent(Object.assign(new window.Event('dragover', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
  b.dispatchEvent(Object.assign(new window.Event('drop', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
};

console.log('--- ① 헬퍼 계약 ---');

T('T1 허브가 screenRedraw 를 내놓는다', () =>
  typeof H.screenRedraw === 'function' || '없음: ' + typeof H.screenRedraw);

T('T2 맨 바깥 객체로 그린다 — 자기 자신이 아니라', () => {
  const seen = [];
  const self = { render() { seen.push('self'); return '<i></i>'; }, mount() { seen.push('selfMount'); } };
  const el = doc.createElement('div');
  withScreen({ render() { seen.push('top'); return '<b></b>'; }, mount() { seen.push('topMount'); } },
    () => H.screenRedraw(el, self)());
  return seen.join(',') === 'top,topMount' ? true : '탄 것: ' + seen.join(',');
});

T('T3 화면이 승격 전이면 자기 자신으로 — 폴백', () => {
  const seen = [];
  const self = { render() { seen.push('self'); return '<i></i>'; }, mount() { seen.push('selfMount'); } };
  const el = doc.createElement('div');
  withScreen({ render: null, mount: null }, () => H.screenRedraw(el, self)());
  return seen.join(',') === 'self,selfMount' ? true : '탄 것: ' + seen.join(',');
});

T('T4 그린 결과를 실제로 그 자리에 넣는다', () => {
  const el = doc.createElement('div');
  withScreen({ render: () => '<b id="mk75">여기</b>', mount() {} }, () => H.screenRedraw(el, {})());
  return el.innerHTML.indexOf('mk75') >= 0 ? true : '안 들어감: ' + el.innerHTML;
});

console.log('--- ② 위층 산출물이 살아남는다 ---');

T('T5 처음 장착에 역할 칩·자동 구성 줄·씨앗이 다 선다', () => {
  stage();
  const s = shot();
  return (s.rows === N && s.role === N * 2 && s.smart === 1 && s.seed === 1)
    ? true : JSON.stringify(s);
});

T('T6 ▲ 위로 (video2 층) 뒤에도 그대로', () => {
  stage();
  const b = shot();
  root.querySelector('[data-vh-mup="3"]').click();
  const a = shot();
  return JSON.stringify(a) === JSON.stringify(b) ? true : `전 ${JSON.stringify(b)} / 후 ${JSON.stringify(a)}`;
});

T('T7 ✕ 빼기 (video2 층) 뒤에도 그대로 — 행 하나만 준다', () => {
  stage();
  root.querySelector('[data-vh-mdel="2"]').click();
  const s = shot();
  return (s.rows === N - 1 && s.role === (N - 1) * 2 && s.smart === 1 && s.seed === 1)
    ? true : JSON.stringify(s);
});

T('T8 캡션 확정 (video2 층) 뒤에도 그대로', () => {
  stage();
  const cap = root.querySelector('[data-vh-cap="2"]');
  cap.value = '한 줄'; fire(cap, 'change');
  const s = shot();
  return (s.rows === N && s.role === N * 2 && s.smart === 1 && s.seed === 1)
    ? true : JSON.stringify(s);
});

T('T9 사진 순서 드래그 (video3 층) 뒤에도 그대로', () => {
  stage();
  drag(0, 3);
  const s = shot();
  return (s.rows === N && s.role === N * 2 && s.smart === 1 && s.seed === 1)
    ? true : JSON.stringify(s);
});

console.log('--- ③ 위층 배선이 다시 걸린다 ---');

T('T10 처음부터 ★ 클릭은 부분 갱신이다', () => {
  stage();
  const keep = markRow(5);
  root.querySelector('[data-vh-role="highlight"][data-i="1"]').click();
  return alive(keep) ? true : '처음부터 전체 재렌더 — R71 이 이미 깨져 있다';
});

T('T11 드래그 뒤에도 ★ 클릭이 부분 갱신으로 남는다', () => {
  stage();
  drag(0, 3);
  const keep = markRow(5);
  root.querySelector('[data-vh-role="highlight"][data-i="1"]').click();
  return alive(keep) ? true : '드래그 후 전체 재렌더로 퇴화';
});

T('T12 ▲ 뒤에도 ★ 클릭이 부분 갱신으로 남는다', () => {
  stage();
  root.querySelector('[data-vh-mup="3"]').click();
  const keep = markRow(5);
  root.querySelector('[data-vh-role="highlight"][data-i="1"]').click();
  return alive(keep) ? true : '▲ 후 전체 재렌더로 퇴화';
});

T('T13 캡션 확정 뒤에도 ★ 클릭이 부분 갱신으로 남는다', () => {
  stage();
  const cap = root.querySelector('[data-vh-cap="2"]');
  cap.value = '한 줄'; fire(cap, 'change');
  const keep = markRow(5);
  root.querySelector('[data-vh-role="highlight"][data-i="1"]').click();
  return alive(keep) ? true : '캡션 확정 후 전체 재렌더로 퇴화';
});

T('T14 재렌더를 두 번 겹쳐도 배선이 남는다', () => {
  stage();
  drag(0, 3);
  root.querySelector('[data-vh-mup="2"]').click();
  drag(1, 4);
  const keep = markRow(5);
  root.querySelector('[data-vh-role="highlight"][data-i="1"]').click();
  return alive(keep) ? true : '겹친 재렌더 뒤 퇴화';
});

T('T15 씨앗 다시 뽑기도 부분 갱신이다 (목록 안 건드림)', () => {
  stage();
  drag(0, 3);
  const keep = markRow(5);
  const rs = root.querySelector('[data-vh-reseed]');
  if (!rs) return '씨앗 버튼 없음';
  rs.click();
  return alive(keep) ? true : '씨앗 다시 뽑기가 목록을 통째로 다시 그림';
});

console.log('--- ④ 재렌더가 상태를 흔들지 않는다 ---');

T('T16 드래그가 사진 순서를 정확히 옮긴다', () => {
  stage();
  const names = H.st.medias.map((m) => m.name);
  drag(0, 3);
  const now = H.st.medias.map((m) => m.name);
  const want = names.slice(1, 4).concat([names[0]], names.slice(4));
  return now.join(',') === want.join(',') ? true : `${now.join(',')} · 기대 ${want.join(',')}`;
});

T('T17 드래그에 역할이 사진을 따라간다', () => {
  stage();
  root.querySelector('[data-vh-role="highlight"][data-i="0"]').click();
  const before = H.st.medias[0].name;
  drag(0, 3);
  const at = H.st.medias.findIndex((m) => m.name === before);
  return H.st.roles[at] === 'highlight' ? true : `사진은 ${at} 번으로 갔는데 역할은 ${H.st.roles[at]}`;
});

T('T18 ▲ 뒤에도 씨앗 값이 그대로 화면에 있다', () => {
  stage();
  const sd = root.querySelector('#vhSeed');
  sd.value = 'bomnal'; fire(sd, 'input');
  root.querySelector('[data-vh-mup="3"]').click();
  const now = root.querySelector('#vhSeed');
  return (now && now.value === 'bomnal') ? true : '씨앗 값 유실: ' + (now && now.value);
});

T('T19 ▲ 뒤에도 켜 둔 ★ 표시가 그 사진 자리에 남는다', () => {
  stage();
  root.querySelector('[data-vh-role="highlight"][data-i="3"]').click();
  const star = H.st.medias[3].name;
  root.querySelector('[data-vh-mup="3"]').click();          /* 3 번이 2 번으로 */
  const at = H.st.medias.findIndex((m) => m.name === star);
  if (at !== 2) return '사진이 ' + at + ' 번으로 갔다 (2 번이어야 함)';
  const on = root.querySelector(`[data-vh-role="highlight"][data-i="${at}"]`);
  return (on && on.classList.contains('on')) ? true : '옮겨간 자리의 ★ 표시가 꺼져 있다';
});

T('T20 뺀 사진(⊘)이 재렌더 뒤에도 흐리게 남는다', () => {
  stage();
  root.querySelector('[data-vh-role="exclude"][data-i="2"]').click();
  drag(0, 6);
  const off = root.querySelectorAll('.vh-row-off').length;
  return off === 1 ? true : '흐린 행 ' + off + '개';
});

console.log('--- ⑤ 되풀이·안전 ---');

/* R76 로 표적을 옮겼다. 원래 ▲ 로 쟀는데, R76 이후 ▲ 는 노드를 옮기고
   번호만 다시 매기므로 **재렌더를 아예 안 한다**(0번). 계약이 깨진 게
   아니라 그 조작이 이 계약의 대상에서 빠진 것이다. 여전히 통째로 다시
   그리는 조작(✕ 빼기)으로 옮겨 같은 것을 잰다. */
T('T21 재렌더가 되풀이로 빠지지 않는다 — 한 번에 끝난다', () => {
  stage();
  let n = 0;
  const scr = window.MK_SCREENS.video;
  const baseRender = scr.render;
  scr.render = function () { n++; return baseRender.call(this); };
  try { root.querySelector('[data-vh-mdel="3"]').click(); }
  finally { scr.render = baseRender; }
  return n === 1 ? true : 'render 가 ' + n + '번 탔다';
});
T('T21b 순서 변경은 재렌더를 안 한다 (R76)', () => {
  stage();
  let n = 0;
  const scr = window.MK_SCREENS.video;
  const baseRender = scr.render;
  scr.render = function () { n++; return baseRender.call(this); };
  try { root.querySelector('[data-vh-mup="3"]').click(); }
  finally { scr.render = baseRender; }
  return n === 0 ? true : 'render 가 ' + n + '번 탔다 — 부분 재정렬이 안 걸렸다';
});

T('T22 사슬 다섯 층이 다 살아 있다', () => {
  stage();
  const scr = window.MK_SCREENS.video;
  return (scr.__r71 && scr.__r73) ? true : `r71=${!!scr.__r71} r73=${!!scr.__r73}`;
});

T('T23 재렌더가 화면 밖 상태를 건드리지 않는다', () => {
  stage();
  const t = H.st.title, th = H.st.theme, c = H.st.comp;
  drag(0, 3);
  root.querySelector('[data-vh-mup="2"]').click();
  return (H.st.title === t && H.st.theme === th && H.st.comp === c)
    ? true : `제목 ${H.st.title} 테마 ${H.st.theme} 구성 ${H.st.comp}`;
});

T('T24 사진은 한 장도 안 잃는다', () => {
  stage();
  drag(0, 3); drag(2, 7);
  root.querySelector('[data-vh-mup="4"]').click();
  return H.st.medias.length === N ? true : '사진 ' + H.st.medias.length + '장';
});

console.log(`\n결과  ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
