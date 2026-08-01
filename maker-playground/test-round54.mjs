/* R54 — 9:16 안전영역 + 시나리오 F(비율 전환) + 비율 override UI 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));
load('data/animations.js'); load('data/render.js'); load('data/caption.js');
load('data/compose.js'); load('data/compositions.js');
load('data/assets.js'); load('data/sample.js'); load('data/templates.js'); load('data/tplpack.js'); load('data/projects.js'); load('data/start.js');
load('screens/misc.js'); load('screens/video.js');

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const C = window.MK_COMPOSE, H = window.MK_VIDHUB, S = window.MK_SCREENS;
const Z = C.SAFE && C.SAFE['9:16'];
const root = document.getElementById('root');
const draw = () => { root.innerHTML = S.video.render(); S.video.mount.call(S.video, root); };
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: i % 2 ? 800 : 600, h: i % 2 ? 600 : 800 }));

/* ---------- 1. 안전영역 단위 ---------- */
T('SAFE 정의 — 9:16 텍스트 허용 x 6~94 · y 12~86', () => {
  A(Z && Z.x === 6 && Z.y === 12 && Z.x + Z.w === 94 && Z.y + Z.h === 86, JSON.stringify(Z));
});

T('applySafeZone — 텍스트만 클램프, 이미지는 풀블리드 유지', () => {
  const sc = [{ elements: [
    { kind: 'text', x: 0, y: 2, w: 100 },
    { kind: 'text', x: 40, y: 95, w: 50 },
    { kind: 'image', x: 0, y: 0, w: 100, h: 100 },
  ] }];
  C.applySafeZone(sc, '9:16');
  const [t1, t2, im] = sc[0].elements;
  A(t1.x === Z.x && t1.y === Z.y && t1.w === Z.w, '위 클램프: ' + JSON.stringify(t1));
  A(t2.y === Z.y + Z.h && t2.x + t2.w <= Z.x + Z.w + 1e-9, '아래 클램프: ' + JSON.stringify(t2));
  A(im.x === 0 && im.y === 0 && im.w === 100, '이미지 변형됨');
});

T('applySafeZone — 16:9는 무변 (안전영역 미정의 비율 통과)', () => {
  const sc = [{ elements: [{ kind: 'text', x: 2, y: 95, w: 96 }] }];
  C.applySafeZone(sc, '16:9');
  const t = sc[0].elements[0];
  A(t.x === 2 && t.y === 95 && t.w === 96, '16:9 변형됨');
});

/* ---------- 2. 시나리오 F — 비율 전환 (같은 입력, 16:9 ↔ 9:16) ---------- */
const inputF = () => ({ medias: mk(6), texts: { title: '비율 전환', subtitle: '시나리오 F' } });

T('F-1: 같은 입력 16:9 vs 9:16 — 캔버스 크기·doc.ratio 정확', () => {
  const a = C.buildProject('cx-slideshow', 'th-minimal', { ...inputF(), ratio: '16:9' });
  const b = C.buildProject('cx-slideshow', 'th-minimal', { ...inputF(), ratio: '9:16' });
  A(a.ok && b.ok, 'build 실패');
  A(a.doc.ratio === '16:9' && a.doc.scenes.every((s) => s.width === 1280 && s.height === 720), '16:9 캔버스');
  A(b.doc.ratio === '9:16' && b.doc.scenes.every((s) => s.width === 1080 && s.height === 1920), '9:16 캔버스');
});

T('F-2: 9:16에서 layoutByRatio 실적용 — 미디어 프레임이 16:9와 달라진다', () => {
  const a = C.buildProject('cx-slideshow', 'th-minimal', { ...inputF(), ratio: '16:9' });
  const b = C.buildProject('cx-slideshow', 'th-minimal', { ...inputF(), ratio: '9:16' });
  const key = (r) => JSON.stringify(r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'image').map((e) => [e.x, e.y, e.w, e.h])));
  A(key(a) !== key(b), '레이아웃 동일 — layoutByRatio 미적용');
});

T('F-3: 10종 전 Composition × 9:16 — 전 텍스트 요소 안전영역 내', () => {
  for (const c of C.listCompositions()) {
    const r = C.buildProject(c.id, 'th-bold', { ...inputF(), ratio: '9:16' });
    A(r.ok, c.id + ' build 실패: ' + (r.why || ''));
    r.doc.scenes.forEach((s) => s.elements.filter((e) => e.kind === 'text').forEach((e) => {
      A(e.x >= Z.x - 1e-9 && e.x + e.w <= Z.x + Z.w + 1e-9, `${c.id} x 이탈: ${e.x}+${e.w}`);
      A(e.y >= Z.y - 1e-9 && e.y <= Z.y + Z.h + 1e-9, `${c.id} y 이탈: ${e.y}`);
    }));
  }
});

T('F-4: 9:16에서도 켄번즈·전환 규약 유지 (인접 반복 금지 포함)', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { ...inputF(), ratio: '9:16' });
  const kbs = r.doc.scenes.map((s) => { const im = s.elements.find((e) => e.kind === 'image' && e.anim && e.anim.idle); return im ? im.anim.idle : null; });
  A(kbs.some(Boolean), '켄번즈 미배정');
  for (let i = 1; i < kbs.length; i++) if (kbs[i] && kbs[i - 1]) A(kbs[i] !== kbs[i - 1] || kbs[i] === 'kb-static', '인접 반복: ' + kbs[i]);
  for (let i = 1; i < r.doc.scenes.length; i++) A(r.doc.scenes[i].transition, '전환 없음');
});

T('F-5: 결정론 — 같은 입력 두 번 빌드 = 동일 doc', () => {
  const a = C.buildProject('cx-cardnews', 'th-bold', { ...inputF(), ratio: '9:16' });
  const b = C.buildProject('cx-cardnews', 'th-bold', { ...inputF(), ratio: '9:16' });
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), '비결정');
});

T('F-6: audit() 여전히 ok (안전영역 추가 후 무위반)', () => {
  const r = C.audit();
  A(r.ok, '위반: ' + r.violations.join(','));
});

/* ---------- 3. 비율 override UI ---------- */
T('카드 선택 → 비율 칩 렌더 + 기본값 = defaultRatio(추천 표기)', () => {
  draw();
  const c0 = C.listCompositions()[0];
  root.querySelector(`[data-vh-comp="${c0.id}"]`).onclick();
  const chips = [...root.querySelectorAll('[data-vh-ratio]')];
  A(chips.length === c0.supportedRatios.length, '칩 수 ' + chips.length);
  A(H.st.ratio === c0.defaultRatio, '기본 비율');
  const on = root.querySelector('.vh-chip.on[data-vh-ratio]');
  A(on && on.dataset.vhRatio === c0.defaultRatio && /추천/.test(on.textContent), '추천 표기');
  A(chips.some((b) => b.dataset.vhRatio === '9:16' && /쇼츠/.test(b.textContent)), '쇼츠 라벨');
});

T('9:16 칩 클릭 → startBuild가 ratio override로 9:16 doc 생성 + 안전영역', () => {
  root.querySelector('[data-vh-ratio="9:16"]').onclick();
  A(H.st.ratio === '9:16', 'st.ratio');
  const wsOrig = window.MK_WS; window.MK_WS = { enter: () => {} };
  const aOrig = window.alert; window.alert = () => {};
  const r = H.startBuild(mk(5));
  window.MK_WS = wsOrig; window.alert = aOrig;
  A(r.ok && r.doc.ratio === '9:16' && r.doc.scenes[0].width === 1080, 'override 미반영');
  r.doc.scenes.forEach((s) => s.elements.filter((e) => e.kind === 'text').forEach((e) =>
    A(e.y >= Z.y - 1e-9 && e.y <= Z.y + Z.h + 1e-9, 'UI 경로 안전영역 이탈')));
});

T('카드 해제 → st.ratio 초기화', () => {
  const id = H.st.comp;
  H.select(id);
  A(H.st.ratio === null, '잔존: ' + H.st.ratio);
});

console.log(`\nR54: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
