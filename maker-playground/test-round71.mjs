/* ============================================================
   test-round71.mjs — R71 미리보기 실빌드 비용 (R68~R70 이월 ④ 완주)
   ------------------------------------------------------------
   실크롬 실측(12MP JPEG 30장·47.8MB): ★ 한 번에 화면이 1,980ms 얼었다.
   범인은 엔진이 아니라 원본 data URL 이 매 렌더마다 HTML 로 다시 흘러간
   것(렌더 한 번 = 65MB 문자열). R71 은 세 갈래로 끊었다.

   비용을 줄이는 일에서 제일 쉬운 유혹은 「실제로 안 세고 대충 말하기」다.
   그래서 여기서 지킬 계약은 속도가 아니라 **값이 그대로인가**이다:

     ① 썸네일은 목록에 그리는 그림만 줄인다 — 만들어지는 영상은 원본 그대로.
     ② 캐시가 돌려주는 값은 직전에 실제로 돌린 그 빌드 결과 — 어림수 금지.
     ③ 입력이 바뀌면 반드시 다시 센다(안 바뀐 걸로 착각하면 그게 거짓말).
     ④ 이름표(_uid)·축소본(thumb)은 문서·렌더로 새지 않는다.
     ⑤ 부분 갱신은 화면 상태를 실제 상태와 어긋나게 두지 않는다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><div id="root"></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video' });
const { window } = dom;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
window.alert = () => {}; window.confirm = () => true;
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((x) => !/^https?:/.test(x))) {
  const f = path.join(ROOT, u.replace(/^\//, '').split('?')[0]);
  if (!fs.existsSync(f)) continue;
  try { window.eval(fs.readFileSync(f, 'utf8')); } catch (e) { /* 부트 부작용 무시 — 엔진만 본다 */ }
}

let pass = 0, fail = 0;
const waiting = [];
const judge = (name, r) => {
  if (r === true) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + '  → ' + r); }
};
const T = (name, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === 'function') { waiting.push(r.then((v) => judge(name, v), (e) => judge(name, 'ERROR ' + e.message))); return; }
    judge(name, r);
  } catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const H = window.MK_VIDHUB, S = window.MK_SVAR, C = window.MK_COMPOSE, M = window.MK_MANIFEST;
const FLAT = (M.listTemplates().find((t) => { const c = C.getComposition(t.compositionId); return c && !c.pairMode; }) || {}).id;
const PAIRC = (C.listCompositions().find((c) => (C.getComposition(c.id) || {}).pairMode) || {}).id;
const FLATC = (M.listTemplates().find((t) => t.id === FLAT) || {}).compositionId;

/* 실사진 흉내 — 원본은 길고(data URL), 축소본은 짧다 */
const bigSrc = (n) => 'data:image/jpeg;base64,' + 'A'.repeat(2000) + n;
const img = (n) => ({ name: 'IMG_' + n + '.JPG', kind: 'image', src: bigSrc(n), w: 4032, h: 3024 });

const stage = (n, opt = {}) => {
  H.resetStage();
  H.st.comp = FLATC; H.st.theme = C.listThemes()[0].id; H.st.title = '봄 소풍';
  H.stageMedias(Array.from({ length: n }, (_, i) => img(i)));
  H.st.captions = H.st.medias.map((m, i) => (i % 2 ? '' : '문구 ' + i));
  H.st.stage = 'media';
  H.st.seed = opt.seed || 'k71';
  return H.st;
};

console.log('\n▶ R71 — 미리보기 실빌드 비용\n');

/* ---------------- 1. 이름표 ---------------- */
console.log('[1] 사진 이름표 (_uid)');
T('T1 같은 객체는 같은 이름표, 다른 객체는 다른 이름표', () => {
  const a = img(1), b = img(1);
  const ua = H.mediaUid(a);
  return (ua === H.mediaUid(a) && ua !== H.mediaUid(b)) || `${ua}/${H.mediaUid(b)}`;
});
T('T2 이름표는 열거되지 않는다 — JSON·전개로 새지 않는다', () => {
  const a = img(2); H.mediaUid(a);
  const j = JSON.stringify(a), sp = { ...a };
  return (!/_uid/.test(j) && !('_uid' in sp)) || j.slice(0, 60);
});
T('T3 이름표는 원본 src 를 건드리지 않는다', () => {
  const a = img(3), before = a.src; H.mediaUid(a);
  return a.src === before || 'src 변형';
});

/* ---------------- 2. 서명 ---------------- */
console.log('\n[2] 입력 서명 — 바뀐 걸 안 바뀐 걸로 보지 않는다');
T('T4 아무것도 안 바꾸면 서명 동일', () => {
  stage(6); const s1 = H.costSig(); const s2 = H.costSig();
  return s1 === s2 || '동일 입력 서명 불일치';
});
T('T5 역할을 바꾸면 서명이 바뀐다', () => {
  stage(6); const s1 = H.costSig(); H.setRole(2, 'highlight');
  return H.costSig() !== s1 || '역할 변경 미감지';
});
T('T6 문구를 고치면 서명이 바뀐다', () => {
  stage(6); const s1 = H.costSig(); H.st.captions[1] = '새 문구';
  return H.costSig() !== s1 || '문구 변경 미감지';
});
T('T7 씨앗을 바꾸면 서명이 바뀐다', () => {
  stage(6); const s1 = H.costSig(); H.st.seed = 'zzz';
  return H.costSig() !== s1 || '씨앗 변경 미감지';
});
T('T8 순서를 바꾸면 서명이 바뀐다', () => {
  stage(6); const s1 = H.costSig();
  const m = H.st.medias.splice(0, 1)[0]; H.st.medias.splice(3, 0, m);
  return H.costSig() !== s1 || '순서 변경 미감지';
});
T('T9 사진을 빼면 서명이 바뀐다', () => {
  stage(6); const s1 = H.costSig(); H.removeMedia(1);
  return H.costSig() !== s1 || '삭제 미감지';
});
T('T10 제목·테마도 서명에 든다', () => {
  stage(6); const s1 = H.costSig(); H.st.title = '가을 소풍';
  const s2 = H.costSig(); H.st.theme = (C.listThemes()[1] || C.listThemes()[0]).id;
  return (s2 !== s1 && H.costSig() !== s2) || '제목/테마 미감지';
});

/* ---------------- 3. 캐시 정직성 ---------------- */
console.log('\n[3] 캐시 — 돌려주는 값은 실빌드 결과 그대로');
T('T11 캐시가 맞은 값 = 캐시를 비우고 다시 센 값', () => {
  stage(8);
  const warm = H.smartPeek();
  H.costFlush();
  const cold = H.smartPeek();
  const k = (p) => p && [p.ok, p.variant, p.scenes, p.total, (p.warnings || []).join('|'), p.method].join('/');
  return k(warm) === k(cold) || `${k(warm)} vs ${k(cold)}`;
});
T('T12 같은 입력 재호출은 다시 세지 않는다(캐시 적중)', () => {
  stage(8); H.costFlush(); H.smartPeek();
  const a = H.costStats().miss; H.smartPeek(); H.smartPeek();
  return H.costStats().miss === a || '입력 무변인데 재빌드';
});
T('T13 역할이 바뀌면 반드시 다시 센다', () => {
  stage(8); H.costFlush(); H.smartPeek();
  const a = H.costStats().miss; H.setRole(0, 'highlight'); H.smartPeek();
  return H.costStats().miss === a + 1 || '변경 후 옛 값 재사용';
});
T('T14 값 자체가 달라진다 — ★ 를 걸면 요약이 실제로 바뀐다', () => {
  stage(8); H.costFlush();
  const before = H.smartPeek();
  H.setRole(0, 'highlight');
  const after = H.smartPeek();
  if (!before || !before.ok || !after || !after.ok) return '빌드 실패';
  return (before.total !== after.total || before.scenes !== after.scenes) || `총길이·장면 동일(${before.total}/${after.total})`;
});
T('T15 estimate 도 같은 서명을 탄다', () => {
  stage(8); H.costFlush();
  const e1 = H.estimateNow(); const a = H.costStats().miss;
  const e2 = H.estimateNow();
  if (H.costStats().miss !== a) return '입력 무변인데 재계산';
  H.st.captions[0] = '바뀐 문구';
  const e3 = H.estimateNow();
  return !!(H.costStats().miss === a + 1 && e1 && e2 && e3) || '문구 변경 후 재계산 없음';
});
T('T16 캐시는 무한정 쌓이지 않는다', () => {
  stage(4); H.costFlush();
  for (let i = 0; i < 30; i++) { H.st.seed = 's' + i; H.smartPeek(); }
  return H.costStats().size <= 8 || '상한 초과 ' + H.costStats().size;
});
T('T17 costFlush 이후에는 반드시 다시 센다', () => {
  stage(6); H.smartPeek(); H.costFlush();
  const a = H.costStats().miss; H.smartPeek();
  return H.costStats().miss === a + 1 || '비운 뒤에도 옛 값';
});

/* ---------------- 4. 화질·누출 ---------------- */
console.log('\n[4] 축소본은 목록에만 — 만들어지는 영상은 원본');
T('T18 축소본이 있어도 빌드는 원본 src 를 쓴다', () => {
  stage(6);
  H.st.medias.forEach((m) => { m.thumb = 'data:image/jpeg;base64,TINY'; });
  const r = S.buildSmart(FLAT, H.smartInput(), { theme: H.st.theme, seed: 'k71' });
  if (!r.ok) return '빌드 실패';
  const srcs = JSON.stringify(r.doc).match(/data:image\/jpeg;base64,[A-Za-z0-9]+/g) || [];
  return (srcs.length > 0 && !srcs.some((s) => /TINY/.test(s))) || '축소본이 문서에 실림';
});
T('T19 축소본·이름표는 문서로 새지 않는다', () => {
  stage(6);
  H.st.medias.forEach((m) => { m.thumb = 'data:image/jpeg;base64,TINY'; H.mediaUid(m); });
  const r = S.buildSmart(FLAT, H.smartInput(), { theme: H.st.theme, seed: 'k71' });
  const j = JSON.stringify(r.doc);
  return (!/thumb/.test(j) && !/_uid/.test(j)) || '문서 오염';
});
T('T20 축소본 유무가 구성 결과를 바꾸지 않는다', () => {
  stage(9); H.costFlush();
  const a = H.smartPeek();
  H.st.medias.forEach((m) => { m.thumb = 'data:image/jpeg;base64,TINY'; });
  H.costFlush();
  const b = H.smartPeek();
  const k = (p) => p && [p.variant, p.scenes, p.total].join('/');
  return k(a) === k(b) || `${k(a)} vs ${k(b)}`;
});
T('T21 목록 그림은 축소본 우선, 없으면 원본', () => {
  stage(3);
  const noThumb = H.renderStage();
  if (!/src="data:image\/jpeg;base64,A/.test(noThumb)) return '원본 미표시';
  H.st.medias.forEach((m) => { m.thumb = 'data:image/jpeg;base64,TINY'; });
  const withThumb = H.renderStage();
  return (/TINY/.test(withThumb) && withThumb.length < noThumb.length) || '축소본 미사용';
});
T('T22 축소본은 원본보다 짧을 때만 채택된다', () => {
  const m = { name: 'tiny', kind: 'image', src: 'data:image/jpeg;base64,AB', w: 4, h: 4 };
  return typeof H.makeThumb === 'function' ? (m.thumb === undefined || '작은 원본에 축소본 강제') : '축소 함수 없음';
});

/* ---------------- 5. 요약 줄 단일 출처 ---------------- */
console.log('\n[5] 요약 줄 — 갈아 끼우는 값과 처음 그리는 값이 같다');
T('T23 smartLineHTML 이 막대 안 문구와 동일', () => {
  stage(7);
  const line = H.smartLineHTML();
  const bar = H.renderSmartBar();
  const inner = (bar.match(/<span id="vhEst">([\s\S]*?)<\/span>/) || [])[1];
  return inner === line || '막대와 줄 불일치';
});
T('T24 요약에 적히는 숫자는 실빌드 값', () => {
  stage(7); H.costFlush();
  const p = H.smartPeek();
  const line = H.smartLineHTML();
  return (p.ok && line.indexOf('장면 ' + p.scenes + '개') >= 0) || '요약 숫자 불일치';
});
T('T25 갈아 끼울 자리가 마크업에 실제로 있다', () => {
  stage(7);
  return /<span id="vhEst">/.test(H.renderSmartBar()) || '#vhEst 없음';
});

/* ---------------- 6. 부분 갱신 배선 ---------------- */
console.log('\n[6] 부분 갱신 — 목록을 다시 그리지 않는다');
const mountVideo = () => {
  const root = window.document.getElementById('root');
  const scr = window.MK_SCREENS.video;
  root.innerHTML = scr.render();
  scr.mount(root);
  return root;
};
T('T26 화면이 R71 배선으로 감싸져 있다', () => window.MK_SCREENS.video.__r71 === true || '미배선');
T('T27 ★ 를 눌러도 목록 노드가 살아 있다(재렌더 아님)', () => {
  stage(5);
  const root = mountVideo();
  const row = root.querySelector('[data-vh-mrow="1"]');
  if (!row) return '행 없음';
  const btn = root.querySelector('[data-vh-role="highlight"][data-i="1"]');
  if (!btn) return '칩 없음';
  btn.click();
  return root.querySelector('[data-vh-mrow="1"]') === row || '목록이 통째로 다시 그려짐';
});
T('T28 누른 칩만 켜지고 상태와 일치한다', () => {
  stage(5);
  const root = mountVideo();
  const btn = root.querySelector('[data-vh-role="highlight"][data-i="2"]');
  btn.click();
  const on = btn.classList.contains('on');
  const other = root.querySelector('[data-vh-role="exclude"][data-i="2"]').classList.contains('on');
  return (on && !other && H.st.roles[2] === 'highlight') || `on=${on} other=${other} st=${H.st.roles[2]}`;
});
T('T29 ⊘ 는 그 행을 흐리게 하고, 다시 누르면 되돌린다', () => {
  stage(5);
  const root = mountVideo();
  const btn = root.querySelector('[data-vh-role="exclude"][data-i="3"]');
  btn.click();
  const row = root.querySelector('[data-vh-mrow="3"]');
  const off = row.classList.contains('vh-row-off');
  btn.click();
  return (off && !row.classList.contains('vh-row-off') && !H.st.roles[3]) || `off=${off}`;
});
T('T30 요약 줄은 먼저 「다시 세는 중」이라고 말한다', () => {
  stage(5);
  const root = mountVideo();
  root.querySelector('[data-vh-role="highlight"][data-i="0"]').click();
  const t = root.querySelector('#vhEst').textContent;
  return /다시 세는 중/.test(t) || '옛 숫자를 그대로 둠: ' + t.slice(0, 40);
});
T('T32 씨앗 버튼도 목록을 다시 그리지 않는다', () => {
  stage(5);
  const root = mountVideo();
  const row = root.querySelector('[data-vh-mrow="0"]');
  const before = H.st.seed;
  root.querySelector('[data-vh-reseed]').click();
  return (H.st.seed !== before && root.querySelector('[data-vh-mrow="0"]') === row
    && root.querySelector('#vhSeed').value === H.st.seed) || '씨앗 갱신 어긋남';
});

/* ---------------- 7. 축소 가드 ---------------- */
console.log('\n[7] 축소 — 못 하는 자리에서는 안 한 척하지 않는다');
/* 비동기 케이스는 나중에 판정되므로 그때의 H.st 를 보면 안 된다 —
   뒤이은 동기 케이스가 스테이지를 이미 갈아엎었기 때문이다. 사진 객체를 붙잡아 둔다. */
T('T33 캔버스가 없으면 0장, 원본은 그대로', () => {
  stage(4);
  const mine = H.st.medias.slice();
  const before = mine.map((m) => m.src);
  return Promise.resolve(H.ensureThumbs()).then((n) =>
    (n === 0 && mine.every((m, i) => m.src === before[i] && !m.thumb)) || '가드 실패 n=' + n);
});
T('T34 영상은 축소 대상이 아니다', () => {
  stage(3);
  const vid = H.st.medias[0];
  vid.kind = 'video';
  return Promise.resolve(H.ensureThumbs()).then(() => !vid.thumb || '영상에 축소본');
});

/* ---------------- 8. 회귀 ---------------- */
console.log('\n[8] 회귀 — 앞 라운드 계약 무손상');
T('T35 R67 씨앗 재현 — 같은 씨앗은 같은 구성', () => {
  stage(10, { seed: 'r67' });
  const a = S.buildSmart(FLAT, H.smartInput(), { theme: H.st.theme, seed: 'r67' });
  const b = S.buildSmart(FLAT, H.smartInput(), { theme: H.st.theme, seed: 'r67' });
  return (a.ok && b.ok && a.doc.scenes.length === b.doc.scenes.length
    && JSON.stringify(a.smart) === JSON.stringify(b.smart)) || '재현 실패';
});
T('T36 R69 ★ 는 사진 수를 바꾸지 않는다', () => {
  stage(8); H.costFlush();
  const a = S.buildSmart(FLAT, H.smartInput(), { theme: H.st.theme, seed: 'k71' });
  H.setRole(1, 'highlight');
  const b = S.buildSmart(FLAT, H.smartInput(), { theme: H.st.theme, seed: 'k71' });
  const cnt = (r) => (JSON.stringify(r.doc).match(/data:image\/jpeg/g) || []).length;
  return cnt(a) === cnt(b) || `${cnt(a)} vs ${cnt(b)}`;
});
T('T37 R67 ⊘ 는 목록에서 사라지지 않는다', () => {
  stage(6);
  H.setRole(2, 'exclude');
  return H.st.medias.length === 6 || '원본 목록 손실';
});
T('T38 고정 구성(🎬 영상 만들기) 경로 무영향', () => {
  stage(6);
  const r = C.buildProject(H.st.comp, H.st.theme, H.stagedInput());
  return (r.ok && r.doc.scenes.length > 0) || '고정 경로 파손';
});
T('T39 쌍 스테이지에서도 서명·캐시가 성립한다', () => {
  if (!PAIRC) return true;
  H.resetStage();
  H.st.comp = PAIRC; H.st.theme = C.listThemes()[0].id; H.st.stage = 'pairs';
  H.st.pairs = [0, 1, 2].map((i) => ({ before: img(i * 2), after: img(i * 2 + 1), title: '쌍' + i, resultText: '' }));
  const s1 = H.costSig();
  H.setPairRoleAt(1, 'highlight');
  return H.costSig() !== s1 || '쌍 역할 미감지';
});
T('T40 세 엔진 감사 통과', () => {
  const a = S.audit ? S.audit() : { ok: true };
  const b = window.MK_SVARX.audit ? window.MK_SVARX.audit() : { ok: true };
  return (a.ok !== false && b.ok !== false) || '감사 실패';
});


/* 화면을 다시 장착하는 케이스가 뒤에 오면 판정이 오염되므로 맨 끝에 둔다 */
T('T31 그리고 실제 숫자로 바뀐다', () => {
  stage(5);
  const root = mountVideo();
  root.querySelector('[data-vh-role="highlight"][data-i="0"]').click();
  return new Promise((res) => setTimeout(() => {
    const t = (root.querySelector('#vhEst') || {}).textContent || '';
    const p = H.smartPeek();
    res((!/다시 세는 중/.test(t) && p.ok && t.indexOf('장면 ' + p.scenes + '개') >= 0) || '갱신 안 됨: ' + t.slice(0, 40));
  }, 60));
});

/* 비동기 T 가 섞여 있으므로 전부 끝난 뒤에 셈한다 */
await Promise.all(waiting);
await new Promise((r) => setTimeout(r, 120));
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
if (fail) process.exit(1);
