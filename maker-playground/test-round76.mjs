/* ============================================================
   test-round76.mjs — R76 순서만 바뀌면 목록을 다시 그리지 않는다
   ------------------------------------------------------------
   R75 는 재렌더를 사슬 맨 바깥에서 하게 고쳐 「사라지는 문제」를
   끝냈다. 남은 것은 비용이다. 사진 한 칸을 옮기는 데 30행을 통째로
   다시 만든다 — 실크롬 CPU 6배·30장에서 2,985 ms.

   순서 변경이 실제로 바꾸는 것은 자리와 번호뿐이다. 썸네일·문구·역할
   칩은 그 행에 붙어 따라간다. 그래서 노드를 옮기고 번호만 다시 맨다.

   여기서 못 박는 계약:
     ① 순서를 바꿔도 행 노드가 살아남는다 (▲·▼·드래그 모두).
     ② 화면 순서가 상태 순서와 같다.
     ③ 번호는 빠짐없이 0..N-1 로 다시 매겨진다 — 행·문구·▲▼✕·역할 칩.
     ④ 역할(★·⊘)과 문구는 사진을 따라간다.
     ⑤ 옮긴 뒤에도 배선이 살아 있다 — 연달아 옮기고, 그 뒤 ★ 도 눌린다.
     ⑥ ★ 클릭은 여전히 부분 갱신이다 (R71·R75 계약 유지).
     ⑦ 요약 줄은 다시 센다 — 「안 흔들리더라」를 믿고 안 세지 않는다.
     ⑧ 못 옮기는 자리(첫 행 ▲·끝 행 ▼)는 아무 일도 안 일어난다.
     ⑨ reorderRows 는 배열 splice 이동과 같은 뜻이다.
     ⑩ 헬퍼가 없으면 종전대로 다시 그린다 (되돌아갈 길을 남긴다).
     ⑪ 장면 수·총길이는 순서에 안 흔들린다 — 매트릭스로 확인.
        (⑦ 이 있는 한 이게 깨져도 화면은 거짓말하지 않는다.
         깨지는 날을 알기 위해 재는 것이다.)
   ============================================================ */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
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

const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((x) => !/^https?:/.test(x))) {
  const f = __res(u.split('?')[0]);
  if (!f) continue;
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

const N = 8;
/* 짝수 자리에만 문구, 2번에 ★, 5번에 ⊘ — 따라오는지 볼 표식 */
const stage = (n) => {
  const k = n || N;
  H.resetStage();
  H.st.comp = 'cx-slideshow';
  H.st.theme = C.listThemes()[0].id;
  H.st.title = '봄 소풍';
  H.st.seed = 'r76';
  H.stageMedias(Array.from({ length: k }, (_, i) => img(i)));
  H.st.captions = H.st.medias.map((m, i) => 'c' + i);
  if (H.st.roles) H.st.roles = H.st.medias.map((m, i) => (i === 2 ? 'highlight' : i === 5 ? 'exclude' : ''));
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  return scr;
};

const rows = () => Array.prototype.slice.call(root.querySelectorAll('[data-vh-mrow]'));
const alive = (node) => !!(node && doc.contains(node));
const names = () => H.st.medias.map((m) => m.name).join(',');
/* 화면이 말하는 순서 — 행 안의 문구 입력 값으로 읽는다(사진에 붙어 다닌다) */
const shownCaps = () => rows().map((r) => { const c = r.querySelector('[data-vh-cap]'); return c ? c.value : '?'; }).join(',');
const fire = (el, type, extra) => el.dispatchEvent(Object.assign(
  new window.Event(type, { bubbles: true, cancelable: true }), extra || {}));
const drag = (from, to) => {
  const rs = rows();
  const dt = { effectAllowed: '', setData() {}, getData() { return ''; } };
  fire(rs[from], 'dragstart', { dataTransfer: dt });
  fire(rs[to], 'dragover', { dataTransfer: dt });
  fire(rs[to], 'drop', { dataTransfer: dt });
};
const clickUp = (i) => { const b = root.querySelector(`[data-vh-mup="${i}"]`); if (b) b.click(); return !!b; };
const clickDn = (i) => { const b = root.querySelector(`[data-vh-mdn="${i}"]`); if (b) b.click(); return !!b; };

console.log('\n[R76] 순서만 바뀌면 목록을 다시 그리지 않는다\n');

/* ---------------- ① 노드 생존 ---------------- */
console.log('① 순서를 바꿔도 행 노드가 살아남는다');
T('드래그 0→3 뒤 관전 행(6번)이 살아 있다', () => {
  stage();
  const mark = rows()[6];
  drag(0, 3);
  return alive(mark) || '행 노드가 떨어져 나갔다 = 목록 통째 재렌더';
});
T('드래그로 옮긴 행 자신이 살아 있다', () => {
  stage();
  const moved = rows()[0];
  drag(0, 3);
  return (alive(moved) && rows()[3] === moved) || '옮긴 노드가 새로 만들어졌다';
});
T('▲ 한 번 뒤 관전 행이 살아 있다', () => {
  stage();
  const mark = rows()[6];
  clickUp(3);
  return alive(mark) || '▲ 가 목록을 다시 만들었다';
});
T('▼ 한 번 뒤 관전 행이 살아 있다', () => {
  stage();
  const mark = rows()[6];
  clickDn(1);
  return alive(mark) || '▼ 가 목록을 다시 만들었다';
});
T('썸네일 노드도 그대로다 (다시 그리면 사진을 다시 읽는다)', () => {
  stage();
  const t = rows()[7].querySelector('img, .vh-thumb');
  drag(0, 3);
  return alive(t) || '썸네일이 새로 만들어졌다';
});

/* ---------------- ② 화면 순서 = 상태 순서 ---------------- */
console.log('\n② 화면 순서가 상태 순서와 같다');
T('드래그 0→3 — 상태', () => {
  stage();
  drag(0, 3);
  return names() === 'p1.jpg,p2.jpg,p3.jpg,p0.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg' || '상태 ' + names();
});
T('드래그 0→3 — 화면', () => shownCaps() === 'c1,c2,c3,c0,c4,c5,c6,c7' || '화면 ' + shownCaps());
T('드래그 5→1 (뒤에서 앞으로)', () => {
  stage();
  drag(5, 1);
  return (names() === 'p0.jpg,p5.jpg,p1.jpg,p2.jpg,p3.jpg,p4.jpg,p6.jpg,p7.jpg'
    && shownCaps() === 'c0,c5,c1,c2,c3,c4,c6,c7') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});
T('드래그 0→끝', () => {
  stage();
  drag(0, 7);
  return (names() === 'p1.jpg,p2.jpg,p3.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg,p0.jpg'
    && shownCaps() === 'c1,c2,c3,c4,c5,c6,c7,c0') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});
T('드래그 끝→0', () => {
  stage();
  drag(7, 0);
  return (names() === 'p7.jpg,p0.jpg,p1.jpg,p2.jpg,p3.jpg,p4.jpg,p5.jpg,p6.jpg'
    && shownCaps() === 'c7,c0,c1,c2,c3,c4,c5,c6') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});
T('▲ — 상태와 화면이 같이 움직인다', () => {
  stage();
  clickUp(3);
  return (names() === 'p0.jpg,p1.jpg,p3.jpg,p2.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg'
    && shownCaps() === 'c0,c1,c3,c2,c4,c5,c6,c7') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});
T('▼ — 상태와 화면이 같이 움직인다', () => {
  stage();
  clickDn(0);
  return (names() === 'p1.jpg,p0.jpg,p2.jpg,p3.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg'
    && shownCaps() === 'c1,c0,c2,c3,c4,c5,c6,c7') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});

/* ---------------- ③ 번호 재부여 ---------------- */
console.log('\n③ 번호가 빠짐없이 다시 매겨진다');
const idxOf = (sel, attr) => rows().map((r) => {
  const e = r.matches && r.matches(sel) ? r : r.querySelector(sel);
  return e ? e.getAttribute(attr) : 'X';
}).join(',');
const seq = (n) => Array.from({ length: n }, (_, i) => String(i)).join(',');
T('행 번호 data-vh-mrow', () => { stage(); drag(0, 3); return idxOf('[data-vh-mrow]', 'data-vh-mrow') === seq(N) || idxOf('[data-vh-mrow]', 'data-vh-mrow'); });
T('문구 번호 data-vh-cap', () => idxOf('[data-vh-cap]', 'data-vh-cap') === seq(N) || idxOf('[data-vh-cap]', 'data-vh-cap'));
T('▲ 번호 data-vh-mup', () => idxOf('[data-vh-mup]', 'data-vh-mup') === seq(N) || idxOf('[data-vh-mup]', 'data-vh-mup'));
T('▼ 번호 data-vh-mdn', () => idxOf('[data-vh-mdn]', 'data-vh-mdn') === seq(N) || idxOf('[data-vh-mdn]', 'data-vh-mdn'));
T('✕ 번호 data-vh-mdel', () => idxOf('[data-vh-mdel]', 'data-vh-mdel') === seq(N) || idxOf('[data-vh-mdel]', 'data-vh-mdel'));
T('역할 칩 번호 data-i — 한 행 안의 칩이 모두 같은 번호', () => {
  const bad = rows().map((r, i) => {
    const cs = Array.prototype.slice.call(r.querySelectorAll('[data-vh-role]'));
    return cs.length && cs.every((c) => c.getAttribute('data-i') === String(i)) ? null : i;
  }).filter((x) => x != null);
  return bad.length === 0 || '어긋난 행 ' + bad.join(',');
});
T('역할 칩이 행마다 있다 (칩이 사라지지 않았다)', () => {
  const c = root.querySelectorAll('[data-vh-role]').length;
  return c >= N || '칩 ' + c + '개';
});
T('▲▼ 뒤에도 번호가 0..N-1', () => {
  stage(); clickUp(5); clickDn(0);
  return idxOf('[data-vh-mrow]', 'data-vh-mrow') === seq(N) || idxOf('[data-vh-mrow]', 'data-vh-mrow');
});

/* ---------------- ④ 역할·문구가 사진을 따라간다 ---------------- */
console.log('\n④ ★·⊘ 와 문구가 사진을 따라간다');
T('드래그 — 상태의 역할 배열이 같이 움직인다', () => {
  stage();
  drag(2, 6);   /* ★ 를 뒤로 */
  return H.st.roles.join(',') === ',,,,exclude,,highlight,' || H.st.roles.join(',');
});
T('드래그 — 화면 칩도 같은 자리에 있다', () => {
  const on = rows().map((r, i) => {
    const b = r.querySelector('[data-vh-role="highlight"]');
    return b && b.classList.contains('on') ? i : null;
  }).filter((x) => x != null);
  return on.join(',') === '6' || '★ 켜진 행 ' + on.join(',');
});
T('드래그 — ⊘ 행 흐림 표시가 따라간다', () => {
  const off = rows().map((r, i) => (r.classList.contains('vh-row-off') ? i : null)).filter((x) => x != null);
  return off.join(',') === '4' || '흐린 행 ' + off.join(',');
});
T('▲ — 역할이 같이 움직인다', () => {
  stage();
  clickUp(2);   /* ★ 가 2 → 1 */
  return H.st.roles.join(',') === ',highlight,,,,exclude,,' || H.st.roles.join(',');
});
T('▲ — 화면 칩도 따라갔다', () => {
  const on = rows().map((r, i) => {
    const b = r.querySelector('[data-vh-role="highlight"]');
    return b && b.classList.contains('on') ? i : null;
  }).filter((x) => x != null);
  return on.join(',') === '1' || '★ 켜진 행 ' + on.join(',');
});
T('문구가 사진에 붙어 다닌다 (사진 이름과 문구 짝이 유지)', () => {
  stage();
  drag(1, 6);
  const bad = H.st.medias.map((m, i) => {
    const n = m.name.replace(/p(\d+)\.jpg/, '$1');
    return H.st.captions[i] === 'c' + n ? null : n + ':' + H.st.captions[i];
  }).filter((x) => x != null);
  return bad.length === 0 || '어긋남 ' + bad.join(' ');
});

/* ---------------- ⑤ 배선 생존 ---------------- */
console.log('\n⑤ 옮긴 뒤에도 배선이 살아 있다');
T('드래그 두 번 연달아', () => {
  stage();
  drag(0, 3); drag(0, 3);
  return names() === 'p2.jpg,p3.jpg,p0.jpg,p1.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg' || names();
});
T('드래그 뒤 ▲ 가 먹는다', () => {
  stage();
  drag(0, 3);
  clickUp(1);
  return names() === 'p2.jpg,p1.jpg,p3.jpg,p0.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg' || names();
});
T('▲ 뒤 드래그가 먹는다', () => {
  stage();
  clickUp(1);
  drag(0, 2);
  return names() === 'p0.jpg,p2.jpg,p1.jpg,p3.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg' || names();
});
T('▲ 를 같은 자리에서 두 번 (연타)', () => {
  stage();
  clickUp(4); clickUp(3);
  return names() === 'p0.jpg,p1.jpg,p4.jpg,p2.jpg,p3.jpg,p5.jpg,p6.jpg,p7.jpg' || names();
});
T('드래그 뒤 문구 입력이 옳은 사진에 붙는다', () => {
  stage();
  drag(0, 3);
  const cap = root.querySelector('[data-vh-cap="0"]');
  cap.value = '새문구';
  fire(cap, 'input');
  return H.st.captions[0] === '새문구' && H.st.medias[0].name === 'p1.jpg'
    ? true : '문구 ' + H.st.captions.join('|') + ' / 첫 사진 ' + H.st.medias[0].name;
});
T('드래그 뒤 ★ 가 옳은 사진에 붙는다', () => {
  stage();
  drag(0, 3);   /* p0 이 3번 자리로 */
  const b = root.querySelector('[data-vh-role="highlight"][data-i="3"]');
  if (!b) return '3번 행에 ★ 칩이 없다';
  b.click();
  return H.st.roles[3] === 'highlight' && H.st.medias[3].name === 'p0.jpg'
    ? true : '역할 ' + H.st.roles.join(',') + ' / 3번 사진 ' + H.st.medias[3].name;
});

/* ---------------- ⑥ ★ 는 여전히 부분 갱신 ---------------- */
console.log('\n⑥ ★ 클릭은 여전히 부분 갱신이다 (R71·R75 계약)');
T('드래그 뒤 ★ 클릭에도 행 노드가 살아남는다', () => {
  stage();
  drag(0, 3);
  const mark = rows()[6];
  const b = root.querySelector('[data-vh-role="highlight"][data-i="0"]');
  if (b) b.click();
  return alive(mark) || '★ 클릭이 전체 재렌더로 퇴화했다 (R75 회귀)';
});
T('▲ 뒤 ★ 클릭에도 행 노드가 살아남는다', () => {
  stage();
  clickUp(4);
  const mark = rows()[6];
  const b = root.querySelector('[data-vh-role="highlight"][data-i="0"]');
  if (b) b.click();
  return alive(mark) || '★ 클릭이 전체 재렌더로 퇴화했다';
});

/* ---------------- ⑦ 요약 줄 다시 세기 ---------------- */
console.log('\n⑦ 요약 줄은 다시 센다');
T('드래그 직후 「다시 세는 중」 이 뜬다', () => {
  stage();
  const est = root.querySelector('#vhEst');
  if (!est) return 'SKIP — 이 구성엔 자동 구성 줄이 없다';
  drag(0, 3);
  const now = root.querySelector('#vhEst');
  return /다시 세는 중/.test(now.innerHTML) || '요약 줄이 그대로다 → 안 세고 있다: ' + now.innerHTML.slice(0, 60);
});
T('▲ 직후에도 「다시 세는 중」 이 뜬다', () => {
  stage();
  if (!root.querySelector('#vhEst')) return 'SKIP';
  clickUp(3);
  return /다시 세는 중/.test(root.querySelector('#vhEst').innerHTML) || '안 세고 있다';
});
await new Promise((r) => setTimeout(r, 30));
T('한 박자 뒤 요약 줄이 값으로 복귀', () => {
  const est = root.querySelector('#vhEst');
  if (!est) return 'SKIP';
  return !/다시 세는 중/.test(est.innerHTML) || '「다시 세는 중」 에 갇혔다';
});
T('요약 줄 자리(#vhEst)는 그대로 살아 있다', () => {
  const est = root.querySelector('#vhEst');
  return !est || alive(est) ? true : '요약 줄이 떨어져 나갔다';
});

/* ---------------- ⑧ 못 옮기는 자리 ---------------- */
console.log('\n⑧ 못 옮기는 자리는 아무 일도 안 일어난다');
T('첫 행 ▲ — 순서 그대로', () => {
  stage();
  const before = names();
  clickUp(0);
  return names() === before || '순서가 흔들렸다 ' + names();
});
T('첫 행 ▲ — 화면도 그대로', () => shownCaps() === 'c0,c1,c2,c3,c4,c5,c6,c7' || shownCaps());
T('끝 행 ▼ — 순서 그대로', () => {
  stage();
  const before = names();
  clickDn(N - 1);
  return names() === before || '순서가 흔들렸다 ' + names();
});
T('끝 행 ▼ — 행 노드도 안 흔들린다', () => {
  stage();
  const mark = rows()[3];
  clickDn(N - 1);
  return alive(mark) || '아무 일도 없어야 하는데 다시 그렸다';
});
T('제자리 드래그(3→3) — 순서 그대로', () => {
  stage();
  const before = names();
  drag(3, 3);
  return names() === before || names();
});

/* ---------------- ⑨ reorderRows 계약 ---------------- */
console.log('\n⑨ reorderRows 는 배열 splice 이동과 같은 뜻이다');
const asArr = () => rows().map((r) => r.getAttribute('data-vh-mrow')).join(',');
const spliceMove = (a, from, to) => { const b = a.slice(); const x = b.splice(from, 1)[0]; b.splice(to, 0, x); return b; };
T('헬퍼가 허브에 있다', () => typeof H.reorderRows === 'function' || 'H.reorderRows 없음');
T('reindexRows 도 있다', () => typeof H.reindexRows === 'function' || 'H.reindexRows 없음');
for (const [f, t] of [[0, 1], [0, 7], [7, 0], [2, 5], [5, 2], [3, 4], [6, 1]]) {
  T(`${f}→${t} 가 splice 이동과 같다`, () => {
    stage();
    const label = rows().map((r) => r.querySelector('[data-vh-cap]').value);
    const want = spliceMove(label, f, t).join(',');
    H.reorderRows(root, f, t);
    return shownCaps() === want || '얻음 ' + shownCaps() + ' / 기대 ' + want;
  });
}
T('같은 자리는 거짓을 돌려준다', () => { stage(); return H.reorderRows(root, 3, 3) === false || '참을 돌려줬다'; });
T('범위 밖은 거짓을 돌려준다', () => { stage(); return H.reorderRows(root, 0, 99) === false && H.reorderRows(root, 99, 0) === false || '참을 돌려줬다'; });
T('음수는 거짓을 돌려준다', () => { stage(); return H.reorderRows(root, -1, 2) === false || '참을 돌려줬다'; });
T('빈 root 는 거짓을 돌려준다 (터지지 않는다)', () => {
  const empty = doc.createElement('div');
  return H.reorderRows(empty, 0, 1) === false || '참을 돌려줬다';
});
T('옮긴 뒤 번호가 0..N-1 (헬퍼 단독 호출에서도)', () => {
  stage(); H.reorderRows(root, 1, 6);
  return asArr() === seq(N) || asArr();
});

/* ---------------- ⑩ 폴백 ---------------- */
console.log('\n⑩ 헬퍼가 없으면 종전대로 다시 그린다');
T('reorderRows 를 치우면 드래그가 전체 재렌더로 되돌아간다', () => {
  const keep = H.reorderRows;
  try {
    H.reorderRows = undefined;
    stage();
    const mark = rows()[6];
    drag(0, 3);
    /* 되돌아간 길이므로 노드는 죽는다 — 대신 순서는 옳아야 한다 */
    return (!alive(mark) && names() === 'p1.jpg,p2.jpg,p3.jpg,p0.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg')
      ? true : '폴백이 안 걸렸다 — 노드생존 ' + alive(mark) + ' / ' + names();
  } finally { H.reorderRows = keep; }   /* 던져도 반드시 되돌린다 (R75 교훈) */
});
T('폴백에서도 ▲ 가 순서를 옳게 바꾼다', () => {
  const keep = H.reorderRows;
  try {
    H.reorderRows = undefined;
    stage(); clickUp(3);
    return names() === 'p0.jpg,p1.jpg,p3.jpg,p2.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg' || names();
  } finally { H.reorderRows = keep; }
});
T('되돌린 뒤 다시 부분 재정렬로 돈다', () => {
  stage();
  const mark = rows()[6];
  drag(0, 3);
  return alive(mark) || '되돌리기가 안 먹었다';
});

/* ---------------- ⑪ 순서 불변 매트릭스 ---------------- */
console.log('\n⑪ 장면 수·총길이는 순서에 안 흔들린다');
const estOf = () => { const e = H.estimateNow(); return e ? `${e.ok}/${e.sceneCount}/${e.total}` : 'null'; };
for (const n of [4, 7, 10, 13]) {
  for (const [f, t] of [[0, 2], [1, 5], [3, 0]]) {
    if (f >= n || t >= n) continue;
    T(`${n}장 ${f}→${t}`, () => {
      stage(n);
      if (typeof H.costFlush === 'function') H.costFlush();
      const a = estOf();
      const m = H.st.medias.splice(f, 1)[0], c = H.st.captions.splice(f, 1)[0];
      H.st.medias.splice(t, 0, m); H.st.captions.splice(t, 0, c);
      if (typeof H.dragRole === 'function') H.dragRole(f, t);
      if (typeof H.costFlush === 'function') H.costFlush();
      const b = estOf();
      return a === b || `${a} → ${b} — 순서가 예상치를 바꾼다. ⑦ 덕에 화면은 안 틀리지만 여기 적힌 근거는 낡았다`;
    });
  }
}
T('캐시 서명은 순서를 본다 (안 보면 옛 숫자가 남는다)', () => {
  stage();
  const a = H.costSig();
  const m = H.st.medias.splice(0, 1)[0]; H.st.medias.splice(3, 0, m);
  return H.costSig() !== a || '서명이 순서를 못 본다';
});

console.log(`\n[R76] ${pass}/${pass + fail} 통과 · 실패 ${fail}\n`);
process.exit(fail ? 1 : 0);
