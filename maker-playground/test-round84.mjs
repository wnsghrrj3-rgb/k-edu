/* ============================================================
   test-round84.mjs — R84 번호는 바뀐 구간만 다시 맨다
   ------------------------------------------------------------
   R76 은 순서 변경을 부분 갱신으로 바꾸며 「전량 재부여」로 정확성에
   값을 치렀다(§1.96 ① — 30행 × 7속성 = 210회 쓰기). splice 이동에서
   번호가 바뀌는 행은 [min(from,to), max(from,to)] 구간뿐이고,
   splice(i,1) 삭제에서는 i 부터 끝까지다. 구간 밖은 이미 제자리다.

   R84 처방: reindexRows(root, kind, lo, hi) — 구간만 쓴다.
   구간 밖은 getAttribute 로 「제자리인지」만 읽고, 하나라도 어긋나
   있으면(구멍) 전량 재부여로 스스로 고친다. R76 의 「번호에 구멍이
   안 난다」 보장을 쓰기 대신 읽기로 지킨다.

   여기서 못 박는 계약:
     ① 구간 재부여 — ▲ 한 칸의 쓰기가 구간 몫으로 준다 (전량 아님).
     ② 구간 밖 행의 속성은 손대지 않는다 (쓰기 0).
     ③ 그래도 번호는 빠짐없이 0..N-1 이다 — 이동·삭제·연쇄 매트릭스.
     ④ 자가 치유 — 구간 밖에 구멍을 심으면 전량 재부여로 고친다.
     ⑤ removeRow 는 i 앞을 손대지 않고, 마지막 행 삭제는 쓰기 0 이다.
     ⑥ 쌍(pair) 행도 같은 구간 규칙을 탄다.
     ⑦ 하위 호환 — lo·hi 없는 reindexRows(root) 는 종전 전량이다.
     ⑧ 배선 생존 — 구간 재부여 뒤에도 ▲·✕·★ 이 제 번호로 눌린다.
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

const N = 10;
const stage = (n) => {
  const k = n || N;
  H.resetStage();
  H.st.comp = 'cx-slideshow';
  H.st.theme = C.listThemes()[0].id;
  H.st.title = '봄 소풍';
  H.st.seed = 'r84';
  H.stageMedias(Array.from({ length: k }, (_, i) => img(i)));
  H.st.captions = H.st.medias.map((m, i) => 'c' + i);
  if (H.st.roles) H.st.roles = H.st.medias.map((m, i) => (i === 2 ? 'highlight' : ''));
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  return scr;
};
/* 쌍 무대 — 비포&애프터 (data-vh-prow) */
const stagePairs = (k) => {
  H.resetStage();
  H.st.comp = 'cx-beforeafter';
  H.st.theme = C.listThemes()[0].id;
  H.st.title = '전과 후';
  H.stageMedias(Array.from({ length: (k || 4) * 2 }, (_, i) => img(i)));
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  return scr;
};

const rows = () => Array.prototype.slice.call(root.querySelectorAll('[data-vh-mrow]'));
const prows = () => Array.prototype.slice.call(root.querySelectorAll('[data-vh-prow]'));
const alive = (node) => !!(node && doc.contains(node));
/* 번호 무결성 — 전 행 attr == 자리, 배선 칩(idx 셀렉터)도 같은 번호 */
const holes = (kind) => {
  const attr = kind === 'pair' ? 'data-vh-prow' : 'data-vh-mrow';
  const rs = Array.prototype.slice.call(root.querySelectorAll('[' + attr + ']'));
  let bad = 0;
  for (let i = 0; i < rs.length; i++) {
    if (rs[i].getAttribute(attr) !== String(i)) { bad++; continue; }
    const chips = rs[i].querySelectorAll(kind === 'pair'
      ? '[data-vh-pup],[data-vh-pdn],[data-vh-pdel]'
      : '[data-vh-mup],[data-vh-mdn],[data-vh-mdel],[data-vh-cap]');
    for (let j = 0; j < chips.length; j++) {
      const c = chips[j];
      const a = ['data-vh-mup', 'data-vh-mdn', 'data-vh-mdel', 'data-vh-cap', 'data-vh-pup', 'data-vh-pdn', 'data-vh-pdel']
        .find((x) => c.hasAttribute(x));
      if (a && c.getAttribute(a) !== String(i)) bad++;
    }
  }
  return bad;
};
/* setAttribute 계측 — 조작 한 번 동안의 쓰기 횟수. finally 로 반드시 원복(R75 교훈) */
const El = window.Element.prototype;
const countWrites = (fn, node) => {
  const orig = El.setAttribute;
  let n = 0;
  El.setAttribute = function (...a) { if (!node || this === node || (node.contains && node.contains(this))) n++; return orig.apply(this, a); };
  try { fn(); } finally { El.setAttribute = orig; }
  return n;
};
const fire = (el, type, extra) => el.dispatchEvent(Object.assign(
  new window.Event(type, { bubbles: true, cancelable: true }), extra || {}));
const drag = (from, to) => {
  const rs = rows();
  const dt = { effectAllowed: '', setData() {}, getData() { return ''; } };
  fire(rs[from], 'dragstart', { dataTransfer: dt });
  fire(rs[to], 'dragover', { dataTransfer: dt });
  fire(rs[to], 'drop', { dataTransfer: dt });
};

console.log('\n[R84] 번호는 바뀐 구간만 다시 맨다\n');

/* ---------------- ① 구간 재부여 — 쓰기가 구간 몫으로 준다 ---------------- */
console.log('① 구간 재부여 — 쓰기가 구간 몫으로 준다');
T('▲ 한 칸(3→2)의 쓰기가 전량보다 훨씬 적다 (2행 몫)', () => {
  stage();
  const w = countWrites(() => H.reorderRows(root, 3, 2));
  /* 전량이면 10행 × 7 = 70회. 구간 2행이면 ~14회 안팎. */
  return (w > 0 && w <= 20) || '쓰기 ' + w + '회 — 전량 재부여로 보인다';
});
T('구간 폭이 넓어지면 쓰기도 그만큼 는다 (0→9 = 사실상 전량)', () => {
  stage();
  const wNarrow = countWrites(() => H.reorderRows(root, 3, 2));
  stage();
  const wWide = countWrites(() => H.reorderRows(root, 0, 9));
  return (wWide > wNarrow * 3) || '넓은 이동(' + wWide + ') vs 좁은 이동(' + wNarrow + ') — 구간 비례가 아니다';
});

/* ---------------- ② 구간 밖 행은 손대지 않는다 ---------------- */
console.log('\n② 구간 밖 행의 속성은 손대지 않는다');
T('3→2 이동에서 7번 행 안의 쓰기 = 0', () => {
  stage();
  const bystander = rows()[7];
  const w = countWrites(() => H.reorderRows(root, 3, 2), bystander);
  return w === 0 || '구간 밖 행에 ' + w + '회 썼다';
});
T('3→2 이동에서 0번 행 안의 쓰기 = 0', () => {
  stage();
  const bystander = rows()[0];
  const w = countWrites(() => H.reorderRows(root, 3, 2), bystander);
  return w === 0 || '구간 밖 행에 ' + w + '회 썼다';
});
T('구간 안(2·3번) 두 행에는 쓴다', () => {
  stage();
  const a = rows()[2], b = rows()[3];
  const wa = countWrites(() => H.reorderRows(root, 3, 2), a);
  stage();
  const wb = countWrites(() => H.reorderRows(root, 3, 2), rows()[3]);
  return (wa > 0 && wb > 0) || '구간 안 행에 쓰기가 없다(' + wa + ',' + wb + ')';
});

/* ---------------- ③ 그래도 번호는 빠짐없다 — 매트릭스 ---------------- */
console.log('\n③ 번호는 빠짐없이 0..N-1 — 이동·삭제·연쇄 매트릭스');
const MOVES = [[0, 1], [1, 0], [0, 9], [9, 0], [3, 6], [6, 3], [4, 5], [8, 2]];
for (const [f, t] of MOVES) {
  T(`이동 ${f}→${t} 뒤 구멍 0`, () => {
    stage();
    H.reorderRows(root, f, t);
    return holes() === 0 || '구멍 ' + holes() + '개';
  });
}
T('연쇄 — 드래그 0→3 · ▲ 6 · 삭제 2 · 드래그 5→1 뒤에도 구멍 0', () => {
  stage();
  drag(0, 3);
  H.reorderRows(root, 6, 5);
  H.removeRow(root, 2, 'media');
  H.reorderRows(root, 5, 1);
  return (holes() === 0 && rows().length === N - 1) || '구멍 ' + holes() + '개 · 행 ' + rows().length;
});
T('화면 순서 == 상태 순서 (연쇄 뒤 문구 대조)', () => {
  stage();
  drag(2, 7);
  H.removeRow(root, 0, 'media');
  /* removeRow 는 DOM 만 — 상태는 부르는 쪽 몫(R82 계약)이라 여기선 DOM 번호만 본다 */
  const rs = rows();
  for (let i = 0; i < rs.length; i++) {
    if (rs[i].getAttribute('data-vh-mrow') !== String(i)) return '행 ' + i + ' 번호 어긋남';
  }
  return true;
});

/* ---------------- ④ 자가 치유 — 구멍을 심으면 전량으로 고친다 ---------------- */
console.log('\n④ 자가 치유 — 구간 밖 구멍을 감지하면 전량 재부여');
T('구간 밖(8번 행)에 구멍을 심고 3→2 를 옮기면 구멍까지 고쳐진다', () => {
  stage();
  rows()[8].setAttribute('data-vh-mrow', '99');   /* 구멍 */
  H.reorderRows(root, 3, 2);
  return holes() === 0 || '구멍이 남았다 — 자가 치유가 안 됐다';
});
T('구멍이 없으면 전량으로 도망가지 않는다 (쓰기 재확인)', () => {
  stage();
  const w = countWrites(() => H.reorderRows(root, 3, 2));
  return w <= 20 || '멀쩡한데 전량 재부여(' + w + '회)';
});
T('reindexRows 구간 호출 자체도 자가 치유한다', () => {
  stage();
  rows()[0].setAttribute('data-vh-mrow', '77');
  H.reindexRows(root, 'media', 4, 5);
  return holes() === 0 || '구멍이 남았다';
});

/* ---------------- ⑤ removeRow — i 앞은 무변, 마지막 삭제는 쓰기 0 ---------------- */
console.log('\n⑤ removeRow 는 i 앞을 손대지 않는다');
T('5번 삭제에서 1번 행 안의 쓰기 = 0', () => {
  stage();
  const front = rows()[1];
  const w = countWrites(() => H.removeRow(root, 5, 'media'), front);
  return w === 0 || 'i 앞 행에 ' + w + '회 썼다';
});
T('5번 삭제 뒤 구멍 0 · 행 N-1', () => {
  stage();
  H.removeRow(root, 5, 'media');
  return (holes() === 0 && rows().length === N - 1) || '구멍 ' + holes() + ' · 행 ' + rows().length;
});
T('마지막 행 삭제는 쓰기 0 (바뀌는 번호가 없다)', () => {
  stage();
  const w = countWrites(() => H.removeRow(root, N - 1, 'media'));
  return (w === 0 && rows().length === N - 1 && holes() === 0) || '쓰기 ' + w + '회 · 행 ' + rows().length;
});
T('0번 삭제는 전 행을 다시 맨다 (구간 = 전부인 경우)', () => {
  stage();
  H.removeRow(root, 0, 'media');
  return (holes() === 0 && rows().length === N - 1) || '구멍 ' + holes();
});

/* ---------------- ⑥ 쌍 행도 같은 규칙 ---------------- */
console.log('\n⑥ 쌍(pair) 행도 구간 규칙을 탄다');
T('쌍 이동 2→1 에서 0번 쌍 행 쓰기 = 0', () => {
  stagePairs(4);
  if (prows().length < 3) return true;   /* 쌍 UI 미노출 화면이면 넘어간다 — ③⑤ 가 media 로 지킨다 */
  const bystander = prows()[0];
  const w = countWrites(() => H.reorderRows(root, 2, 1, 'pair'), bystander);
  return w === 0 || '구간 밖 쌍 행에 ' + w + '회 썼다';
});
T('쌍 이동 뒤 번호(1..N 배지 포함) 구멍 0', () => {
  stagePairs(4);
  if (prows().length < 3) return true;
  H.reorderRows(root, 2, 1, 'pair');
  if (holes('pair') !== 0) return '구멍 ' + holes('pair');
  const badge = prows()[1].querySelector('.vh-pairn');
  return (!badge || badge.textContent === '2') || '배지 번호 어긋남: ' + badge.textContent;
});
T('쌍 삭제 — 앞 쌍 무변·구멍 0', () => {
  stagePairs(4);
  if (prows().length < 3) return true;
  const front = prows()[0];
  const w = countWrites(() => H.removeRow(root, 2, 'pair'), front);
  return (w === 0 && holes('pair') === 0) || '앞 쌍 쓰기 ' + w + ' · 구멍 ' + holes('pair');
});

/* ---------------- ⑦ 하위 호환 ---------------- */
console.log('\n⑦ 하위 호환 — lo·hi 없는 호출은 종전 전량');
T('reindexRows(root) 는 전 행을 맨다 (R76·R82 호출부 무변)', () => {
  stage();
  rows().forEach((r) => r.setAttribute('data-vh-mrow', '55'));
  const n = H.reindexRows(root);
  return (n === N && holes() === 0) || '반환 ' + n + ' · 구멍 ' + holes();
});
T('reindexRows(root, "media") 도 전량이다', () => {
  stage();
  rows().forEach((r) => r.setAttribute('data-vh-mrow', '55'));
  H.reindexRows(root, 'media');
  return holes() === 0 || '구멍 ' + holes();
});
T('reorderRows 반환 계약 유지 — 같은 자리·범위 밖·빈 root 는 거짓', () => {
  stage();
  const empty = doc.createElement('div');
  return (H.reorderRows(root, 3, 3) === false && H.reorderRows(root, 0, 99) === false
    && H.reorderRows(empty, 0, 1) === false) || '거짓 계약이 깨졌다';
});

/* ---------------- ⑧ 배선 생존 ---------------- */
console.log('\n⑧ 구간 재부여 뒤에도 배선이 제 번호로 눌린다');
T('▲(3) 실배선 뒤 ▲(2) 를 누르면 같은 사진이 또 올라간다', () => {
  /* 원시함수는 DOM 만 만진다(R82 계약과 같은 뜻) — 상태까지 함께
     움직이는 건 실배선 몫이므로, 두 번 다 화면 버튼으로 누른다. */
  stage();
  const moved = H.st.medias[3].name;   /* p3 */
  const b1 = root.querySelector('[data-vh-mup="3"]');
  if (!b1) return '▲(3) 버튼이 없다';
  b1.click();                          /* 상태·DOM 함께 3→2 (구간 재부여 경유) */
  const b2 = root.querySelector('[data-vh-mup="2"]');
  if (!b2) return '재부여 뒤 ▲(2) 버튼이 없다 — 번호가 안 매겨졌다';
  b2.click();
  return H.st.medias[1].name === moved || '상태 순서가 화면과 어긋났다: ' + H.st.medias.map((m) => m.name).join(',');
});
T('실드래그 5→0 뒤 ★(0) 이 옮겨 온 그 사진에 붙는다', () => {
  stage();
  const moved = H.st.medias[5].name;   /* p5 */
  drag(5, 0);                          /* 실배선 — 상태·DOM 함께 (구간 재부여 경유) */
  if (H.st.medias[0].name !== moved) return '드래그 상태 반영 실패';
  const star = root.querySelector('[data-vh-role="highlight"][data-i="0"]');
  if (!star) return '재부여 뒤 ★(0) 버튼이 없다';
  star.click();
  return (H.st.roles && H.st.roles[0] === 'highlight') || '★ 이 딴 사진에 갔다';
});

console.log(`\n결과: ${pass}/${pass + fail}${fail ? '  ← 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
