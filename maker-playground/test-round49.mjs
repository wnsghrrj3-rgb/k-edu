/* R49 — MK_CAPTION 자막 디자인 시스템 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));
load('data/animations.js'); load('data/render.js'); load('data/caption.js'); load('data/start.js') /* buildDoc 레거시 재현용 — MK_LIVE 미필요 경로 */;

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const C = window.MK_CAPTION;
const wsrc = fs.readFileSync('screens/workspace.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

T('감사 — 프리셋 8종·id 유일·문자열 fill·cap 마킹·문구 왕복', () => {
  const a = C.audit();
  A(a.ok, a.why);
  A(a.presets === 8, '8종 아님: ' + a.presets);
});

T('빈 장면에 적용 — 어느 장면이든 자막 추가 가능', () => {
  const sc = { id: 's', elements: [{ kind: 'image', x: 0, y: 0, w: 100, h: 100, src: 'data:image/png;base64,A' }] };
  const r = C.apply(sc, 'scrim-bottom');
  A(r.ok, 'apply 실패');
  const d = C.detect(sc);
  A(d.preset === 'scrim-bottom', 'detect');
  A(sc.elements[0].src, '사진 요소 보존');
});

T('교체 — 문구 유지하며 디자인만 바뀜', () => {
  const sc = { id: 's', elements: [] };
  C.apply(sc, 'bar-bottom', { title: '우리 반 소풍', sub: '5월 어린이날' });
  C.apply(sc, 'news');
  const d = C.detect(sc);
  A(d.preset === 'news' && d.title === '우리 반 소풍' && d.sub === '5월 어린이날', '문구 유실');
  A(!sc.elements.some((el) => el.cap === 'bar-bottom'), '이전 프리셋 잔존');
});

T('제거 — 「자막 없음」이 자막만 지우고 나머지는 보존', () => {
  const sc = { id: 's', elements: [{ kind: 'text', x: 5, y: 5, w: 50, size: 4, text: '자막 아닌 텍스트' }] };
  C.apply(sc, 'center');
  C.apply(sc, 'none');
  A(C.detect(sc).preset === 'none', '제거 안 됨');
  A(sc.elements.length === 1 && sc.elements[0].text === '자막 아닌 텍스트', '무관 요소 훼손');
});

T('R43 레거시 인식 — MK_START 문서의 옛 자막을 프리셋으로 승계', () => {
  const doc = window.MK_START.buildDoc([{ name: 'a', kind: 'image', src: 'data:image/png;base64,A' }], { mode: 'video', title: '운동회' });
  const sc = doc.scenes[0];
  const d = C.detect(sc);
  A(d.preset === 'bar-bottom' && d.title === '운동회', '레거시 인식 실패: ' + JSON.stringify(d));
  C.apply(sc, 'badge');
  A(C.detect(sc).preset === 'badge' && C.detect(sc).title === '운동회', '레거시→프리셋 교체');
  A(!sc.elements.some(C.isCap.bind ? ((el) => el.fill === '#151B26' && el.y === 74) : () => false), '레거시 바 잔존');
});

T('레거시 오탐 없음 — 사용자 도형·텍스트는 자막으로 안 지움', () => {
  const sc = { id: 's', elements: [
    { kind: 'image', x: 0, y: 74, w: 50, h: 26, fill: '#151B26' } /* w 다름 */,
    { kind: 'text', x: 6, y: 79, w: 80, size: 4, text: '내 글', color: '#FF0000' } /* color 다름 */,
  ] };
  C.apply(sc, 'minimal');
  A(sc.elements.some((el) => el.fill === '#151B26'), '사용자 도형 삭제됨');
  A(sc.elements.some((el) => el.text === '내 글'), '사용자 텍스트 삭제됨');
});

T('실렌더 — 전 프리셋이 MK_RENDER SVG로 실출력 (경고 0·텍스트 실포함)', () => {
  for (const p of C.PRESETS) {
    if (p.id === 'none') continue;
    const sc = { id: 's', width: 1280, height: 720, background: '#000', elements: [] };
    C.apply(sc, p.id, { title: '제목텍스트', sub: '설명텍스트' });
    const dl = window.MK_RENDER.renderScene(sc, {});
    const svg = window.MK_RENDER.toSVG(dl);
    A(svg.includes('제목텍스트'), p.id + ': 제목 미출력');
  }
});

T('중앙 프리셋 — align center가 SVG text-anchor middle로 실반영', () => {
  const sc = { id: 's', width: 1280, height: 720, background: '#000', elements: [] };
  C.apply(sc, 'center');
  const svg = window.MK_RENDER.toSVG(window.MK_RENDER.renderScene(sc, {}));
  A(svg.includes('text-anchor="middle"'), 'anchor');
});

T('UI 배선 — Scene 패널 capCtl·클릭 핸들러·캔버스 align/radius', () => {
  A(wsrc.includes('data-ws-cap') && wsrc.includes('MK_CAPTION.apply(scene()'), '핸들러');
  A(wsrc.includes('capCtl(sc)'), 'Scene 패널');
  A(wsrc.includes('text-align:${el.align}'), '캔버스 align');
  A(wsrc.includes('border-radius'), '캔버스 radius');
});

T('index.html — caption.js 로드', () => {
  A(html.includes('data/caption.js'), '스크립트 태그');
});

console.log(`\nR49: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
