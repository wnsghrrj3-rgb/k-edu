/* R47 — 채우기 방식 컨트롤 + Workspace 실내보내기 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const src = fs.readFileSync('screens/workspace.js', 'utf8');

/* ---- ① 채우기 방식 ---- */
T('fitCtl — cover/contain 두 버튼 존재', () => {
  A(src.includes('data-ws-fit="cover"') && src.includes('data-ws-fit="contain"'), '버튼');
  A(src.includes('꽉 채우기') && src.includes('원본 전체'), '한국어 라벨');
});
T('fitCtl — 이미지·영상 패널 양쪽에 연결', () => {
  const img = src.indexOf("title = '이미지'"), vid = src.indexOf("title = '영상'");
  A(src.slice(img, img + 2600).includes('fitCtl'), '이미지 패널'); /* R101 — 사진 바꾸기·필터·보정이 fitCtl 앞에 들어옴(§11 첫 행동 = 사진 바꾸기) */
  /* R127 정정(의도 보존): 잣대의 의도 = 영상 패널에 fitCtl 이 배선돼 있다.
     300자 창은 당시 패널이 한 줄이던 구현 세부 — R127 소리 컨트롤이 앞에
     들어와 밀렸다. 이미지 패널이 R101 때 같은 이유로 2600자 창을 쓴 전례
     그대로 넓힌다(재는 것은 불변). */
  A(src.slice(vid, vid + 1600).includes('fitCtl'), '영상 패널');
});
T('fit 핸들러 — snap 후 el.fit 기록·재렌더', () => {
  A(src.includes("el.fit = b.dataset.wsFit"), 'fit 기록');
  const i = src.indexOf('el.fit = b.dataset.wsFit');
  A(src.slice(i - 80, i).includes('snap()'), 'Undo 스냅');
});
T('R45 캔버스 — el.fit contain이 object-fit:contain으로 실반영', () => {
  A(src.includes("el.fit === 'contain' ? 'contain' : 'cover'"), '캔버스 fit');
});
T('placeholder 교체 버튼 제거 (정직성)', () => {
  A(!src.includes('이미지 교체 (placeholder)'), '가짜 버튼 잔존');
});

/* ---- ② 실내보내기 ---- */
T('가짜 문구 제거 — "기록만 남아요" 사라짐', () => {
  A(!src.includes('기록만 남아요'), '가짜 모달 잔존');
});
T('MP4 — MK_VIDEO.exportMP4 실경로', () => {
  A(src.includes('window.MK_VIDEO.exportMP4(doc()'), 'exportMP4');
});
T('PPTX·PDF·PNG — MK_RENDER 실경로(#/editor와 동일)', () => {
  A(src.includes('window.MK_RENDER.toPPTX'), 'PPTX');
  A(src.includes('window.MK_RENDER.toPDFRaster'), 'PDF');
  A(src.includes("format: 'png', scale: 2"), 'PNG');
});
T('진행 메시지·실패 정직 보고', () => {
  A(src.includes('wsExMsg'), '진행 영역');
  A(src.includes("exMsg('실패: ' + err.message)"), '실패 표면화');
});
T('내보내기 후 logExport 유지 (이력 회귀 없음)', () => {
  A(src.includes('window.MK_PROJ.logExport(WS.projectId, f.toUpperCase())'), 'logExport');
});

/* ---- 렌더 정합: fit이 실렌더 ops에 반영되는지 ---- */
load('data/animations.js'); load('data/render.js');
const IMG = 'data:image/png;base64,AAA=';
T('MK_RENDER — el.fit contain이 preserveAspectRatio meet으로 실출력', () => {
  const sc = { id: 's1', width: 1280, height: 720, background: '#151B26', elements: [{ kind: 'image', x: 0, y: 0, w: 100, h: 100, src: IMG, fit: 'contain' }] };
  const dlist = window.MK_RENDER.renderScene(sc, {});
  const op = dlist.ops.find((o) => o.op === 'image');
  A(op && op.fit === 'contain', 'ops fit');
  const svg = window.MK_RENDER.toSVG(dlist);
  A(svg.includes('xMidYMid meet'), 'SVG meet');
});
T('MK_RENDER — 기본(cover)은 slice 유지', () => {
  const sc = { id: 's1', width: 1280, height: 720, background: '#151B26', elements: [{ kind: 'image', x: 0, y: 0, w: 100, h: 100, src: IMG }] };
  const svg = window.MK_RENDER.toSVG(window.MK_RENDER.renderScene(sc, {}));
  A(svg.includes('xMidYMid slice'), 'SVG slice');
});

console.log(`\nR47: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
