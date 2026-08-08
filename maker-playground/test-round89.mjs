/* ============================================================
   test-round89.mjs — R89 큰 사진 수용 + 만든 순간 저장
   ------------------------------------------------------------
   준호 실기기 보고 3호: 「사진 넣고 테스트하다가 사진이 안 떠서
   뒤로가기 했는데 튕겨져 나갔다」. 실크롬 해부 결과 원인 사슬 둘:

   ① 입구 거부 — fileToSrc 가 8MB 초과를 통째로 돌려보냈다. 요즘 폰·카메라
      사진은 8MB를 예사로 넘는다 → 넣었는데 아무것도 안 뜸.
      처방: 사진은 거부 대신 장변 1920px JPEG 재인코딩으로 줄여서 받는다.
      영상은 재인코딩 불가 — 종전 8MB 규칙·안내 그대로.
      (실크롬 실증: 34.5MB PNG 2장 → 수용 2·스킵 0·JPEG 변환·워크스페이스
       썸네일 표시 2 — 구세계는 전량 거부)

   ② 소실 이탈 — 프로젝트는 워크스페이스에서 「편집」해야만 자동저장이
      돌았다. 만들어 놓고 구경만 하다 뒤로가기로 나가면 통째 소실 →
      돌아와도 「이어서 만들기」에 없음.
      처방: createFromDoc 순간 saveDoc + saveProjects. 실패(쿼터)는 종전
      규약대로 조용히 false — 화면 계약 무변.

   계약:
     A1 8MB 이하 사진 = 종전 그대로(원본 dataURL 무변형).
     A2 8MB 초과 사진 = 수용 + shrinkImage 경유(스텁 검증).
     A3 8MB 초과 영상 = 종전 안내로 거부.
     A4 이미지·영상 아닌 파일 = 종전대로 무언 거부.
     A5 shrink 실패 시 정직한 안내 문구로 스킵(조용한 소실 없음).
     A6 readFiles 혼합 입력 — 큰 사진은 살고 큰 영상만 건너뛴다.
     B1 createFromDoc 순간 localStorage 에 프로젝트가 실린다.
     B2 문서(doc)도 같은 순간 실린다.
     B3 저장 백엔드 부재/예외에도 생성은 성공한다(안전망).
     B4 MK_START.open 경로(빠른 시작·구조 빌드 공용)도 즉시 영속.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

const html = read('index.html');
const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

/* FileReader 스텁 — jsdom 에서 파일 내용 없이 dataURL 흉내 */
class FakeReader {
  readAsDataURL(f) { setTimeout(() => { this.result = 'data:' + f.type + ';base64,' + 'A'.repeat(64); this.onload && this.onload(); }, 0); }
}
const file = (name, type, mb) => ({ name, type, size: Math.round(mb * 1024 * 1024) });
const L = w.MK_LIVE;
const MB9 = 9, MB2 = 2;

/* 비동기 잣대를 순차로 */
const run = async () => {
  const call = (f) => new Promise((res) => L.fileToSrc(f, (src, err) => res({ src, err }), FakeReader));

  console.log('--- A. 입구 — 사진 표준화 ---');
  {
    /* 라우팅: 래스터 사진은 크기와 무관하게 normalize 입구를 지난다 */
    const seen = [];
    const orig = L.normalizeImage;
    L.normalizeImage = (src, f, cb) => { seen.push({ n: f.name, mb: +(f.size / 1048576).toFixed(0) }); cb(src); };
    const r1 = await call(file('small.jpg', 'image/jpeg', MB2));
    const r2 = await call(file('big.jpg', 'image/jpeg', MB9));
    L.normalizeImage = orig;
    T('A1 8MB 이하 사진 — 거부 없이 normalize 입구 통과·원본 유지', () =>
      r1.src === 'data:image/jpeg;base64,' + 'A'.repeat(64) && seen[0] && seen[0].mb === 2 ? true : JSON.stringify({ r1, seen }));
    T('A2 8MB 초과 사진 — 거부 없이 normalize 입구 통과(구세계=문전 거부)', () =>
      r2.src && seen[1] && seen[1].mb === 9 ? true : JSON.stringify({ r2, seen }));
  }
  if (!L.normalizeImage) {
    T('A3 소형(장변≤1920·≤8MB) = 원본 무변형', () => 'normalizeImage 부재(구세계)');
    T('A4 장변 1920 초과 = 용량 무관 축소', () => 'normalizeImage 부재(구세계)');
    T('A5 8MB 초과 = 축소', () => 'normalizeImage 부재(구세계)');
  } else {
    /* normalize 기본 구현 판정 — Image·캔버스 능력을 가짜로 심어 치수 분기 실행 */
    const OrigImg = w.Image;
    const origCreate = w.document.createElement.bind(w.document);
    w.document.createElement = (tag) => tag === 'canvas'
      ? { getContext: () => ({ drawImage: () => {} }), toDataURL: () => 'data:image/jpeg;base64,CANVAS' }
      : origCreate(tag);
    const fakeImg = (nw, nh) => class { set src(v) { this.naturalWidth = nw; this.naturalHeight = nh; setTimeout(() => this.onload && this.onload(), 0); } };
    const origShrink = L.shrinkImage;
    let shrunk = 0; L.shrinkImage = (src, cb) => { shrunk++; cb('data:image/jpeg;base64,SHRUNK'); };
    w.Image = fakeImg(1280, 720);
    const small = await new Promise((res) => L.normalizeImage('data:image/png;base64,ORIG', file('s.png', 'image/png', MB2), (s, e) => res({ s, e })));
    const shrunkAtSmall = shrunk;
    w.Image = fakeImg(4000, 3000);
    const bigDim = await new Promise((res) => L.normalizeImage('data:image/png;base64,ORIG', file('d.png', 'image/png', MB2), (s, e) => res({ s, e })));
    const bigSize = await new Promise((res) => L.normalizeImage('data:image/png;base64,ORIG', file('b.png', 'image/png', MB9), (s, e) => res({ s, e })));
    w.Image = OrigImg; L.shrinkImage = origShrink; w.document.createElement = origCreate;
    T('A3 소형(장변≤1920·≤8MB) = 원본 무변형', () => small.s === 'data:image/png;base64,ORIG' && shrunkAtSmall === 0 ? true : JSON.stringify({ small, shrunkAtSmall }));
    T('A4 장변 1920 초과 = 용량 무관 축소', () => bigDim.s === 'data:image/jpeg;base64,SHRUNK' ? true : JSON.stringify(bigDim));
    T('A5 8MB 초과 = 축소', () => bigSize.s === 'data:image/jpeg;base64,SHRUNK' && shrunk === 2 ? true : JSON.stringify({ bigSize, shrunk }));
  }
  {
    const r = await call(file('big.mp4', 'video/mp4', MB9));
    T('A6 8MB 초과 영상은 종전 안내로 거부', () =>
      r.src === null && /8MB 이하/.test(r.err || '') ? true : JSON.stringify(r));
  }
  {
    const r = await call(file('anim.gif', 'image/gif', MB2));
    const rB = await call(file('anim-big.gif', 'image/gif', MB9));
    T('A7 GIF 는 재인코딩 제외 — 원본 유지·8MB 규칙 종전', () =>
      r.src === 'data:image/gif;base64,' + 'A'.repeat(64) && rB.src === null && /8MB 이하/.test(rB.err || '')
        ? true : JSON.stringify({ r, rB }));
  }
  {
    const r = await call(file('doc.pdf', 'application/pdf', 1));
    T('A8 사진·영상 아닌 파일은 종전대로 무언 거부', () =>
      r.src === null && r.err === undefined ? true : JSON.stringify(r));
  }
  {
    /* 능력 판별 안전망 — 캔버스 2d 없는 환경(jsdom)은 즉시 원본 통과 */
    const t0 = Date.now();
    const r = await call(file('env.jpg', 'image/jpeg', MB2));
    T('A9 캔버스 없는 환경 = 즉시 원본 통과(구세계 동작·경주 없음)', () =>
      r.src === 'data:image/jpeg;base64,' + 'A'.repeat(64) && Date.now() - t0 < 300 ? true : JSON.stringify({ r, ms: Date.now() - t0 }));
  }
  {
    const orig = L.normalizeImage;
    L.normalizeImage = (src, f, cb) => (f.name === 'a.jpg' ? cb('data:image/jpeg;base64,SHRUNK2') : cb(src));
    const got = await new Promise((res) => w.MK_START.readFiles(
      [file('a.jpg', 'image/jpeg', MB9), file('b.mp4', 'video/mp4', MB9), file('c.png', 'image/png', 1)],
      (medias, skipped) => res({ medias, skipped }), FakeReader));
    L.normalizeImage = orig;
    T('A10 혼합 입력 — 큰 사진은 살고 큰 영상만 건너뛴다', () =>
      got.medias.length === 2 && got.skipped.length === 1 && /b\.mp4/.test(got.skipped[0])
        ? true : JSON.stringify({ m: got.medias.length, s: got.skipped }));
  }

  console.log('--- B. 만든 순간 저장 ---');
  {
    for (const k in store) delete store[k];
    const doc = { id: 'd-r89', title: '저장 검증', contentType: 'video', scenes: [{ id: 's1', elements: [] }], meta: {} };
    const p = w.MK_PROJ.createFromDoc(doc, doc.title, { action: '하니스' });
    T('B1 createFromDoc 순간 프로젝트 목록이 localStorage 에 실린다', () => {
      const raw = store['mklive:projects'] || '';
      return raw.includes(p.projectId) ? true : '목록 길이 ' + raw.length;
    });
    T('B2 문서도 같은 순간 실린다', () =>
      (store['mklive:doc:d-r89'] || '').includes('저장 검증') ? true : Object.keys(store).join(','));
  }
  {
    const origSave = L.saveProjects;
    L.saveProjects = () => { throw new Error('quota'); };
    let p = null, threw = false;
    try { p = w.MK_PROJ.createFromDoc({ id: 'd-r89b', title: 'x', contentType: 'video', scenes: [], meta: {} }, 'x'); }
    catch (e) { threw = true; }
    L.saveProjects = origSave;
    T('B3 저장 예외에도 생성은 성공(안전망)', () => !threw && p && p.projectId ? true : 'threw=' + threw);
  }
  {
    for (const k in store) delete store[k];
    const doc = { id: 'd-r89c', title: '오픈 경로', contentType: 'video', scenes: [{ id: 's1', elements: [] }], meta: {} };
    w.MK_START.open(doc);
    T('B4 MK_START.open 경로도 즉시 영속(빠른 시작·구조 빌드 공용)', () =>
      (store['mklive:projects'] || '').includes('오픈 경로') ? true : '목록 미기록');
  }

  console.log('');
  console.log('test-round89: ' + pass + '/' + (pass + fail));
  process.exit(fail ? 1 : 0);
};
run();
