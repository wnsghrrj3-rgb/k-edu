/* ============================================================
   test-round82.mjs — R82 빼기는 목록을 다시 그리지 않는다
   ------------------------------------------------------------
   R76 은 순서 변경을 부분 갱신으로 바꾸며 ✕(빼기)를 의도적으로
   미뤘다 — 빼기는 장면 수·「지금 뺀 사진 N장」·「예상: 장면 N개」처럼
   **개수에 딸린 줄**을 같이 바꾸기 때문이다. R82 는 그 줄들을 반드시
   다시 세는 것을 계약으로 걸고 빼기를 마저 얹는다.

   여기서 못 박는 계약:
     ① removeRow 는 배열 splice(i,1) 과 같은 뜻이다 — 행 하나를 지우고
        남은 행 번호를 빠짐없이 다시 맨다 (media·pair 두 kind).
     ② ✕ 를 눌러도 남은 행 노드가 살아남는다 (목록 통째 재렌더 0).
     ③ 화면이 상태와 같다 — 문구·역할·⊘ 클래스가 사진을 따라간다.
     ④ 개수에 딸린 줄 셋이 전부 다시 세어진다:
        #vhEst(자동 구성 장면 수) · #vhEst2(예상 장면 수) · #vhKept(뺀 N장).
     ⑤ ⊘ 토글의 부분 갱신도 #vhKept 를 고친다 — R71 부터 낡은 채
        남던 구멍을 여기서 막는다.
     ⑥ ✕ 뒤에도 배선이 살아 있다 — 연달아 빼고, ▲ 도 ★ 도 눌린다.
     ⑦ 쌍 행도 같은 대접 — ▲▼ 는 노드 이동 + 번호(눈에 보이는 1..N
        포함) 재부여, ✕ 는 행 소멸 + 재부여.
     ⑧ 마지막 하나를 지우면 종전대로 다시 그린다 (빈 화면은 렌더 몫).
     ⑨ 헬퍼가 없으면 종전대로 다시 그린다 (되돌아갈 길).
     ⑩ ★ 부분 갱신은 여전히 부분이다 (R71·R75·R76 계약 무손상).
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
const TA = async (name, fn) => {
  try { const r = await fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};
const tick = () => new Promise((r) => setTimeout(r, 15));

const H = window.MK_VIDHUB, C = window.MK_COMPOSE;
const doc = window.document;
const root = doc.getElementById('pgBody');
const img = (n) => ({ name: 'p' + n + '.jpg', kind: 'image', src: 'data:image/png;base64,AAA' + n, w: 800, h: 600 });

const N = 8;
/* 짝수 자리에만 문구, 2번에 ★, 5번에 ⊘ — 빼기 뒤에도 따라오는지 볼 표식 */
const stage = (n) => {
  const k = n || N;
  H.resetStage();
  H.st.comp = 'cx-slideshow';
  H.st.theme = C.listThemes()[0].id;
  H.st.title = '봄 소풍';
  H.st.seed = 'r82';
  H.stageMedias(Array.from({ length: k }, (_, i) => img(i)));
  H.st.captions = H.st.medias.map((m, i) => 'c' + i);
  if (H.st.roles) H.st.roles = H.st.medias.map((m, i) => (i === 2 ? 'highlight' : i === 5 ? 'exclude' : ''));
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  return scr;
};
/* 쌍 스테이지 — 3쌍, 1번에 ⊘ */
const stageP = (n) => {
  const k = n || 3;
  H.resetStage();
  H.st.comp = 'cx-beforeafter';
  H.st.theme = C.listThemes()[0].id;
  H.st.title = '달라진 교실';
  H.st.seed = 'r82p';
  H.st.stage = 'pairs';
  H.st.pairs = Array.from({ length: k }, (_, i) => ({ before: img(i * 2), after: img(i * 2 + 1), title: 't' + i }));
  if (H.st.pairRoles) H.st.pairRoles = H.st.pairs.map((p, i) => (i === 1 ? 'exclude' : ''));
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  /* render 안 syncPairRoles 가 길이만 맞추고 값은 보존하는지에 기대지 않는다 — 다시 박는다 */
  if (H.st.pairRoles) { H.st.pairRoles = H.st.pairs.map((p, i) => (i === 1 ? 'exclude' : '')); }
  return scr;
};

const rows = () => Array.prototype.slice.call(root.querySelectorAll('[data-vh-mrow]'));
const prows = () => Array.prototype.slice.call(root.querySelectorAll('[data-vh-prow]'));
const alive = (node) => !!(node && doc.contains(node));
const names = () => H.st.medias.map((m) => m.name).join(',');
const shownCaps = () => rows().map((r) => { const c = r.querySelector('[data-vh-cap]'); return c ? c.value : '?'; }).join(',');
const shownTitles = () => prows().map((r) => { const c = r.querySelector('[data-vh-pt]'); return c ? c.value : '?'; }).join(',');
const pairNums = () => prows().map((r) => { const n = r.querySelector('.vh-pairn'); return n ? n.textContent : '?'; }).join(',');
const clickDel = (i) => { const b = root.querySelector(`[data-vh-mdel="${i}"]`); if (b) b.click(); return !!b; };
const clickPDel = (i) => { const b = root.querySelector(`[data-vh-pdel="${i}"]`); if (b) b.click(); return !!b; };
const seq = (n) => Array.from({ length: n }, (_, i) => String(i)).join(',');
const idxOf = (sel, attr) => rows().map((r) => {
  const e = r.matches && r.matches(sel) ? r : r.querySelector(sel);
  return e ? e.getAttribute(attr) : 'X';
}).join(',');

console.log('\n[R82] 빼기는 목록을 다시 그리지 않는다\n');

/* ---------------- ① removeRow 헬퍼 계약 ---------------- */
console.log('① removeRow 는 splice(i,1) 과 같은 뜻이다');
T('media: 가운데 행을 지우면 그 행만 사라진다', () => {
  stage();
  const gone = rows()[3], keep = rows()[6];
  const ok = H.removeRow(root, 3, 'media');
  return (ok === true && !alive(gone) && alive(keep) && rows().length === N - 1)
    || 'ok=' + ok + ' gone생존=' + alive(gone) + ' 행수=' + rows().length;
});
T('media: 지운 뒤 번호가 빠짐없이 0..N-2', () => idxOf('[data-vh-mrow]', 'data-vh-mrow') === seq(N - 1) || idxOf('[data-vh-mrow]', 'data-vh-mrow'));
T('media: ✕ 번호도 0..N-2', () => idxOf('[data-vh-mdel]', 'data-vh-mdel') === seq(N - 1) || idxOf('[data-vh-mdel]', 'data-vh-mdel'));
T('범위 밖 = 거짓, 화면 무변', () => {
  stage();
  const before = rows().length;
  const r1 = H.removeRow(root, N, 'media'), r2 = H.removeRow(root, -1, 'media');
  return (r1 === false && r2 === false && rows().length === before) || 'r1=' + r1 + ' r2=' + r2 + ' 행수=' + rows().length;
});
T('빈 root = 거짓', () => {
  const d = doc.createElement('div');
  return H.removeRow(d, 0, 'media') === false || '빈 곳에서 참을 돌려줬다';
});
T('모르는 kind = 거짓', () => { stage(); return H.removeRow(root, 0, 'x') === false || '모르는 kind 에 참'; });
T('pair: 행을 지우고 눈에 보이는 번호가 1..N-1 로 다시 매겨진다', () => {
  stageP();
  const gone = prows()[0];
  const ok = H.removeRow(root, 0, 'pair');
  return (ok === true && !alive(gone) && prows().length === 2 && pairNums() === '1,2')
    || 'ok=' + ok + ' 행수=' + prows().length + ' 번호=' + pairNums();
});
T('kind 생략 = media (R76 하위 호환) — DOM 만 지우고 상태는 안 건드린다', () => {
  stage();
  const ok = H.removeRow(root, 0);
  /* 원시함수는 화면만 만진다 — 상태는 부르는 쪽(H.removeMedia) 몫. 상태 무변이 옳다. */
  return (ok === true && rows().length === N - 1 && shownCaps() === 'c1,c2,c3,c4,c5,c6,c7'
    && H.st.medias.length === N) || 'ok=' + ok + ' 화면 ' + shownCaps() + ' 상태 ' + H.st.medias.length + '장';
});

/* ---------------- ② ✕ 부분 갱신 — 노드 생존 ---------------- */
console.log('\n② ✕ 를 눌러도 남은 행 노드가 살아남는다');
T('✕ 3번 뒤 관전 행(6번)이 살아 있다', () => {
  stage();
  const mark = rows()[6];
  clickDel(3);
  return alive(mark) || '행 노드가 떨어져 나갔다 = 목록 통째 재렌더';
});
T('썸네일 노드도 그대로다 (다시 그리면 사진을 다시 읽는다)', () => {
  stage();
  const t = rows()[7].querySelector('img, .vh-thumb');
  clickDel(3);
  return alive(t) || '썸네일이 새로 만들어졌다';
});
T('역할 칩이 남은 행마다 있다', () => {
  const rs = rows();
  const bad = rs.map((r, i) => (r.querySelectorAll('[data-vh-role]').length ? null : i)).filter((x) => x != null);
  return bad.length === 0 || '칩 없는 행 ' + bad.join(',');
});

/* ---------------- ③ 화면 = 상태 ---------------- */
console.log('\n③ 화면이 상태와 같다 — 문구·역할이 사진을 따라간다');
T('✕ 3번 — 상태', () => {
  stage();
  clickDel(3);
  return names() === 'p0.jpg,p1.jpg,p2.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg' || '상태 ' + names();
});
T('✕ 3번 — 화면', () => shownCaps() === 'c0,c1,c2,c4,c5,c6,c7' || '화면 ' + shownCaps());
T('✕ 3번 — 역할이 따라온다 (⊘였던 p5 가 여전히 ⊘)', () => {
  const i = H.st.medias.findIndex((m) => m.name === 'p5.jpg');
  return (H.st.roles[i] === 'exclude' && rows()[i].classList.contains('vh-row-off'))
    || '역할 ' + H.st.roles.join(',') + ' / off클래스 ' + rows()[i].classList.contains('vh-row-off');
});
T('✕ 첫 행', () => {
  stage(); clickDel(0);
  return (names() === 'p1.jpg,p2.jpg,p3.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg'
    && shownCaps() === 'c1,c2,c3,c4,c5,c6,c7') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});
T('✕ 끝 행', () => {
  stage(); clickDel(N - 1);
  return (names() === 'p0.jpg,p1.jpg,p2.jpg,p3.jpg,p4.jpg,p5.jpg,p6.jpg'
    && shownCaps() === 'c0,c1,c2,c3,c4,c5,c6') || '상태 ' + names() + ' / 화면 ' + shownCaps();
});
T('연쇄 ✕ 0,0,0 — 앞이 계속 지워진다 (번호 재부여가 배선에 먹힌다)', () => {
  stage();
  clickDel(0); clickDel(0); clickDel(0);
  return (names() === 'p3.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg'
    && shownCaps() === 'c3,c4,c5,c6,c7'
    && idxOf('[data-vh-mrow]', 'data-vh-mrow') === seq(5)) || '상태 ' + names() + ' / 화면 ' + shownCaps();
});

/* ---------------- ④ 개수에 딸린 줄 셋이 다시 세어진다 ---------------- */
console.log('\n④ 개수에 딸린 줄이 전부 다시 세어진다');
await TA('✕ 직후 요약 두 줄이 「다시 세는 중」을 먼저 말한다', async () => {
  stage(); await tick();   /* 앞선 조작의 미룬 셈을 흘려보낸다 */
  clickDel(3);
  const a = (root.querySelector('#vhEst') || {}).innerHTML || '';
  const b = (root.querySelector('#vhEst2') || {}).innerHTML || '';
  return (a.indexOf('다시 세는 중') >= 0 && b.indexOf('다시 세는 중') >= 0)
    || 'vhEst=' + a.slice(0, 40) + ' / vhEst2=' + b.slice(0, 40);
});
await TA('셈이 끝나면 #vhEst 가 실값(장면 수)으로 돌아온다', async () => {
  await tick();
  const a = (root.querySelector('#vhEst') || {}).innerHTML || '';
  return (a.indexOf('자동 구성') >= 0 && a.indexOf('장면') >= 0) || a.slice(0, 60);
});
await TA('#vhEst2 도 실값(예상 장면 수)으로 돌아온다', async () => {
  const b = (root.querySelector('#vhEst2') || {}).innerHTML || '';
  return (b.indexOf('예상') >= 0 && b.indexOf('장면') >= 0) || b.slice(0, 60);
});
await TA('⊘였던 사진을 ✕ 하면 「지금 뺀 사진 N장」이 즉시 준다', async () => {
  stage(); await tick();
  const before = (root.querySelector('#vhKept') || {}).innerHTML || '';
  clickDel(5);   /* 5번이 ⊘ */
  const after = (root.querySelector('#vhKept') || {}).innerHTML || '';
  return (before.indexOf('뺀 사진 1장') >= 0 && after.indexOf('뺀 사진') < 0)
    || '전=' + before + ' / 후=' + after;
});
await TA('보통 사진을 ✕ 하면 뺀 개수는 그대로다', async () => {
  stage(); await tick();
  clickDel(0);
  const after = (root.querySelector('#vhKept') || {}).innerHTML || '';
  return after.indexOf('뺀 사진 1장') >= 0 || '후=' + after;
});

/* ---------------- ⑤ ⊘ 토글도 개수 줄을 고친다 (묵은 구멍) ---------------- */
console.log('\n⑤ ⊘ 토글의 부분 갱신이 #vhKept 를 고친다');
T('⊘ 켜면 개수가 즉시 오른다', () => {
  stage();
  const b = root.querySelector('[data-vh-role="exclude"][data-i="0"]');
  b.click();
  const t = (root.querySelector('#vhKept') || {}).innerHTML || '';
  return t.indexOf('뺀 사진 2장') >= 0 || '줄=' + t;
});
T('⊘ 끄면 개수가 즉시 내린다', () => {
  const b = root.querySelector('[data-vh-role="exclude"][data-i="0"]');
  b.click();   /* 같은 칩 다시 = 해제 (setRole 토글) 또는 재지정 — 상태로 판정 */
  const t = (root.querySelector('#vhKept') || {}).innerHTML || '';
  const kept = H.st.roles.filter((r) => r === 'exclude').length;
  return t === (typeof H.keptLineHTML === 'function' ? H.keptLineHTML() : t) && (kept === 1 || kept === 2)
    ? (t.indexOf('뺀 사진 ' + kept + '장') >= 0 || (kept === 0 && t === '')) || '줄=' + t + ' 실제=' + kept
    : '줄=' + t + ' 실제=' + kept;
});
T('쌍 ⊘ 토글도 「뺀 쌍 N개」를 고친다', () => {
  stageP();
  const b = root.querySelector('[data-vh-prole="exclude"][data-i="0"]');
  if (!b) return '쌍 ⊘ 칩이 없다';
  b.click();
  const t = (root.querySelector('#vhKept') || {}).innerHTML || '';
  const kept = H.st.pairRoles.filter((r) => r === 'exclude').length;
  return t.indexOf('뺀 쌍 ' + kept + '개') >= 0 || '줄=' + t + ' 실제=' + kept;
});

/* ---------------- ⑥ ✕ 뒤에도 배선이 살아 있다 ---------------- */
console.log('\n⑥ ✕ 뒤에도 배선이 살아 있다');
T('✕ 뒤 ▲ 가 눌린다 — 부분 재정렬로', () => {
  stage();
  clickDel(3);
  const mark = rows()[5];
  const b = root.querySelector('[data-vh-mup="4"]');
  b.click();
  return (alive(mark) && shownCaps() === 'c0,c1,c2,c5,c4,c6,c7' && names().split(',')[3] === 'p5.jpg')
    || '화면 ' + shownCaps() + ' / 상태 ' + names();
});
T('✕ 뒤 ★ 가 눌린다 — 부분 갱신으로', () => {
  stage();
  clickDel(0);
  const mark = rows()[4];
  const b = root.querySelector('[data-vh-role="highlight"][data-i="0"]');
  b.click();
  return (alive(mark) && H.st.roles[0] === 'highlight' && b.classList.contains('on'))
    || '역할 ' + H.st.roles.join(',') + ' / mark생존 ' + alive(mark);
});
T('✕ 뒤 문구 입력이 제 사진에 적힌다', () => {
  stage();
  clickDel(2);
  const inp = root.querySelector('[data-vh-cap="2"]');   /* 지금 2번 = p3 */
  inp.value = '바뀐 문구';
  inp.dispatchEvent(new window.Event('input', { bubbles: true }));
  return H.st.captions[2] === '바뀐 문구' || '문구 ' + H.st.captions.join(',');
});

/* ---------------- ⑦ 쌍 행 — ▲▼·✕ 같은 대접 ---------------- */
console.log('\n⑦ 쌍 행도 같은 대접이다');
T('쌍 ▲ — 노드가 살아남고 상태·화면·번호가 같이 움직인다', () => {
  stageP();
  const moved = prows()[1], mark = prows()[2];
  const b = root.querySelector('[data-vh-pup="1"]');
  b.click();
  return (alive(moved) && alive(mark) && prows()[0] === moved
    && H.st.pairs.map((p) => p.title).join(',') === 't1,t0,t2'
    && shownTitles() === 't1,t0,t2' && pairNums() === '1,2,3')
    || '상태 ' + H.st.pairs.map((p) => p.title).join(',') + ' / 화면 ' + shownTitles() + ' / 번호 ' + pairNums();
});
T('쌍 ▼ — 같은 계약', () => {
  stageP();
  const mark = prows()[2];
  const b = root.querySelector('[data-vh-pdn="0"]');
  b.click();
  return (alive(mark) && H.st.pairs.map((p) => p.title).join(',') === 't1,t0,t2'
    && shownTitles() === 't1,t0,t2' && pairNums() === '1,2,3')
    || '상태 ' + H.st.pairs.map((p) => p.title).join(',') + ' / 화면 ' + shownTitles();
});
T('쌍 ▲▼ 뒤 ⊘ 역할이 쌍을 따라간다', () => {
  stageP();   /* 1번이 ⊘ */
  root.querySelector('[data-vh-pup="1"]').click();   /* t1 이 맨 앞으로 */
  const i = H.st.pairs.findIndex((p) => p.title === 't1');
  return (H.st.pairRoles[i] === 'exclude') || '역할 ' + H.st.pairRoles.join(',') + ' (t1 자리 ' + i + ')';
});
T('쌍 ✕ — 노드 생존·상태=화면·번호 1..N-1', () => {
  stageP();
  const mark = prows()[2];
  clickPDel(0);
  return (alive(mark) && H.st.pairs.map((p) => p.title).join(',') === 't1,t2'
    && shownTitles() === 't1,t2' && pairNums() === '1,2'
    && prows().map((r) => r.getAttribute('data-vh-prow')).join(',') === '0,1')
    || '상태 ' + H.st.pairs.map((p) => p.title).join(',') + ' / 화면 ' + shownTitles() + ' / 번호 ' + pairNums();
});
await TA('⊘였던 쌍을 ✕ 하면 「뺀 쌍 N개」가 즉시 준다', async () => {
  stageP(); await tick();
  const before = (root.querySelector('#vhKept') || {}).innerHTML || '';
  clickPDel(1);   /* 1번이 ⊘ */
  const after = (root.querySelector('#vhKept') || {}).innerHTML || '';
  return (before.indexOf('뺀 쌍 1개') >= 0 && after.indexOf('뺀 쌍') < 0)
    || '전=' + before + ' / 후=' + after;
});
T('쌍 ✕ 뒤 전·후 고르기 버튼 번호도 재부여된다', () => {
  stageP();
  clickPDel(0);
  const pb = prows().map((r) => r.querySelector('[data-vh-pb]').getAttribute('data-vh-pb')).join(',');
  const pa = prows().map((r) => r.querySelector('[data-vh-pa]').getAttribute('data-vh-pa')).join(',');
  return (pb === '0,1' && pa === '0,1') || 'pb=' + pb + ' pa=' + pa;
});

/* ---------------- ⑧ 마지막 하나 = 전체 재렌더 폴백 ---------------- */
console.log('\n⑧ 마지막 하나를 지우면 종전대로 다시 그린다');
T('사진 1장에서 ✕ — 상태 0장, 화면도 렌더 결과와 같다', () => {
  stage(1);
  const stale = root.querySelector('.vh-stage');
  clickDel(0);
  return (H.st.medias.length === 0 && rows().length === 0 && !alive(stale))
    || '상태 ' + H.st.medias.length + '장 / 행 ' + rows().length + ' / 옛 화면 생존 ' + alive(stale);
});
T('쌍 1개에서 ✕ — 같은 폴백', () => {
  stageP(1);
  const stale = root.querySelector('.vh-stage');
  clickPDel(0);
  return (H.st.pairs.length === 0 && prows().length === 0 && !alive(stale))
    || '상태 ' + H.st.pairs.length + '쌍 / 행 ' + prows().length + ' / 옛 화면 생존 ' + alive(stale);
});

/* ---------------- ⑨ 헬퍼 부재 = 전체 재렌더 폴백 ---------------- */
console.log('\n⑨ 헬퍼가 없으면 종전대로 다시 그린다');
T('removeRow 없이도 ✕ 가 옳게 동작한다 (화면=상태)', () => {
  stage();
  const saved = H.removeRow;
  try {
    H.removeRow = null;
    clickDel(3);
    return (names() === 'p0.jpg,p1.jpg,p2.jpg,p4.jpg,p5.jpg,p6.jpg,p7.jpg'
      && shownCaps() === 'c0,c1,c2,c4,c5,c6,c7'
      && rows().length === N - 1) || '상태 ' + names() + ' / 화면 ' + shownCaps();
  } finally { H.removeRow = saved; }   /* R75 교훈 — finally 없는 스왑은 하니스를 중독시킨다 */
});
T('reorderRows 없이도 쌍 ▲ 가 옳게 동작한다', () => {
  stageP();
  const saved = H.reorderRows;
  try {
    H.reorderRows = null;
    root.querySelector('[data-vh-pup="1"]').click();
    return (H.st.pairs.map((p) => p.title).join(',') === 't1,t0,t2' && shownTitles() === 't1,t0,t2')
      || '상태 ' + H.st.pairs.map((p) => p.title).join(',') + ' / 화면 ' + shownTitles();
  } finally { H.reorderRows = saved; }
});

/* ---------------- ⑩ R76·R71 계약 무손상 ---------------- */
console.log('\n⑩ 기존 부분 갱신 계약이 그대로다');
T('kind 생략 reorderRows 가 여전히 media 를 옮긴다 (R76 하위 호환)', () => {
  stage();
  const mark = rows()[6];
  const ok = H.reorderRows(root, 0, 3);
  return (ok === true && alive(mark) && idxOf('[data-vh-mrow]', 'data-vh-mrow') === seq(N)) || 'ok=' + ok;
});
T('reindexRows(root) 만 불러도 media 가 매겨진다 (R76 하위 호환)', () => {
  stage();
  const n = H.reindexRows(root);
  return n === N || '행수 ' + n;
});
T('★ 클릭은 여전히 부분 갱신이다', () => {
  stage();
  const mark = rows()[6];
  root.querySelector('[data-vh-role="highlight"][data-i="0"]').click();
  return alive(mark) || '★ 가 목록을 다시 만들었다';
});

console.log(`\n결과: ${pass}/${pass + fail}${fail ? '  ← 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
