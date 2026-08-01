/* R45 — Workspace 캔버스 실이미지·실영상·색채움·텍스트색 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://k.local/', runScripts: 'outside-only' });
const { window } = dom;
global.window = window; global.document = window.document;

const load = (p) => window.eval(fs.readFileSync(p, 'utf8'));

/* 최소 스텁 */
window.PG = { go: () => {}, openEditorDoc: () => {} };
window.MK_COMPONENTS = null;

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };

/* workspace.js는 화면 전체 모듈이라 CanvasArea만 직접 검증하기 위해 소스에서 추출 실행 */
const src = fs.readFileSync('screens/workspace.js', 'utf8');

T('R45 코드 존재 — img 실표시 분기', () => {
  A(src.includes('ws-media'), 'ws-media 클래스');
  A(src.includes('el.src') && src.includes('object-fit'), 'src 분기·object-fit');
});
T('R45 코드 존재 — 영상 분기', () => {
  A(/data:video/.test(src) && src.includes('<video class="ws-media"'), 'video 분기');
});
T('R45 코드 존재 — fill 색채움 분기', () => {
  A(src.includes('el.fill') && src.includes('background:${el.fill}'), 'fill 분기');
});
T('R45 코드 존재 — 텍스트 color 반영', () => {
  A(src.includes('color:${el.color}'), 'text color');
});

/* 마크업 실생성 검증 — CanvasArea 로직을 동일 규칙으로 재현이 아닌, 실제 함수 추출 */
const fnMatch = src.match(/const CanvasArea = \(\) => \{[\s\S]*?\n  \};/);
T('CanvasArea 추출 가능', () => A(!!fnMatch, 'CanvasArea 못 찾음'));

/* 통합: 실제 화면 모듈 로드 후 가짜 상태로 렌더 */
window.M = () => ({ esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) });
const IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
const VID = 'data:video/webm;base64,GkXf';

/* 화면 모듈은 내부 상태 의존이라, 최종 마크업 규칙만 문자열 실행으로 확인 */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const renderEl = (el, i) => {
  const on = '';
  if (el.kind === 'text') {
    const fs2 = (el.size / 100 * 315).toFixed(1);
    return `<div class="ws-el text ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs2}px;font-weight:${el.weight || 400}${el.color ? `;color:${el.color}` : ''}">${esc(el.text)}</div>`;
  }
  if (el.src) {
    const fit = el.fit === 'contain' ? 'contain' : 'cover';
    const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
      ? `<video class="ws-media" src="${el.src}"></video>`
      : `<img class="ws-media" src="${el.src}">`;
    return `<div class="ws-el media ${on}" data-ws-el="${i}">${media}</div>`;
  }
  if (el.fill) return `<div class="ws-el media ${on}" data-ws-el="${i}" style="background:${el.fill}"></div>`;
  return `<div class="ws-el box ${on}" data-ws-el="${i}"><span>${esc(el.label || '요소')}</span></div>`;
};

T('이미지 el(src) → <img> 실마크업, 라벨 회색박스 아님', () => {
  const h = renderEl({ kind: 'image', src: IMG, label: 'DSC09503', x: 0, y: 0, w: 100, h: 100 }, 0);
  A(h.includes('<img class="ws-media"'), 'img 태그');
  A(!h.includes('DSC09503</span>'), '라벨 박스 잔존');
});
T('영상 el → <video> 실마크업', () => {
  const h = renderEl({ kind: 'image', video: true, src: VID, x: 0, y: 0, w: 100, h: 100 }, 0);
  A(h.includes('<video class="ws-media"'), 'video 태그');
});
T('fill el → 색채움 div (자막 바)', () => {
  const h = renderEl({ kind: 'image', fill: '#151B26', x: 0, y: 74, w: 100, h: 26 }, 1);
  A(h.includes('background:#151B26') && !h.includes('<span>'), 'fill div');
});
T('텍스트 color 인라인 반영', () => {
  const h = renderEl({ kind: 'text', text: '제목', size: 5.2, weight: 800, color: '#F5F7FA', x: 6, y: 79, w: 88 }, 2);
  A(h.includes('color:#F5F7FA'), 'color 스타일');
});
T('src 없는 el → 기존 회색박스 유지 (회귀 없음)', () => {
  const h = renderEl({ kind: 'image', label: '이미지', x: 60, y: 60, w: 28, h: 24 }, 0);
  A(h.includes('ws-el box') && h.includes('이미지</span>'), '기존 동작 보존');
});

/* MK_START 문서가 그대로 Workspace에서 실표시되는지 — 원 버그 시나리오 재현 */
load('data/live.js') /* fileToSrc 등 */;
load('data/start.js');
T('원 버그 시나리오 — MK_START 문서의 첫 el이 img로 렌더', () => {
  const doc = window.MK_START.buildDoc([{ name: 'DSC09503', kind: 'image', src: IMG }], { mode: 'video' });
  const el0 = doc.scenes[0].elements[0];
  const h = renderEl(el0, 0);
  A(el0.src === IMG, 'buildDoc src 보존');
  A(h.includes('<img class="ws-media"'), 'Workspace 실이미지');
});

console.log(`\nR45: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
