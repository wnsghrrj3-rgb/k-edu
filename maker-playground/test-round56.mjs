/* R56 — 텍스트 스타일 시스템: MK_TEXTSTYLE 엔진 + Workspace 패널 + 렌더 3계층 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/home' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const PG = window.PG, TS = window.MK_TEXTSTYLE, RD = window.MK_RENDER;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };

/* ---------- 1. 엔진 ---------- */
T('MK_TEXTSTYLE — 폰트 8종·프리셋 12종·audit ok', () => {
  A(TS, '엔진 없음');
  A(TS.FONTS.length >= 8, '폰트 ' + TS.FONTS.length);
  A(TS.PRESETS.length >= 12, '프리셋 ' + TS.PRESETS.length);
  const a = TS.audit();
  A(a.ok, '위반: ' + a.violations.join(','));
});

T('applyPreset — 스타일만 변경, 내용·기하 무손상 + null은 삭제', () => {
  const el = { kind: 'text', text: '드릉드릉', x: 12, y: 70, w: 60, size: 4, weight: 400 };
  TS.applyPreset(el, 'ts-caption');
  A(el.text === '드릉드릉' && el.x === 12 && el.size === 4, '기하 손상');
  A(el.font === 'Pretendard' && el.bg && el.bg.color, '미적용');
  TS.applyPreset(el, 'ts-poster');
  A(!el.bg && el.outline && el.font === 'Black Han Sans', 'null 정리 실패');
});

T('applyAll — 전 씬 텍스트 개수 정직 반환·이미지 무손상', () => {
  const d = { scenes: [
    { elements: [{ kind: 'text', text: 'a', x: 0, y: 0, w: 50, size: 4 }, { kind: 'image', x: 0, y: 0, w: 50, h: 50, src: 'data:image/png;base64,x' }] },
    { elements: [{ kind: 'text', text: 'b', x: 0, y: 0, w: 50, size: 4 }] },
  ] };
  const r = TS.applyAll(d, TS.PRESETS.find((p) => p.id === 'ts-neon').style);
  A(r.ok && r.count === 2, 'count ' + r.count);
  A(d.scenes[0].elements[0].shadow && d.scenes[1].elements[0].shadow, '전 씬 미반영');
  A(!d.scenes[0].elements[1].shadow, '이미지 오염');
});

T('css() — 글꼴·배경(패딩 규약)·외곽선·그림자 CSS 생성', () => {
  const el = { kind: 'text', font: 'Jua', bg: { color: '#FFE86B', radius: 0.2 }, outline: { color: '#FF7A59', w: 0.06 }, shadow: { color: '#000', x: 0.05, y: 0.05, blur: 0.1 }, letterSpacing: 0.02, lineHeight: 1.4 };
  const c = TS.css(el);
  A(/font-family:'Jua'/.test(c), '글꼴');
  A(c.includes(`padding:${TS.BG_PAD.y}em ${TS.BG_PAD.x}em`) && c.includes('background:#FFE86B'), '배경 패딩 규약');
  A(/-webkit-text-stroke:0\.06em #FF7A59/.test(c) && /paint-order:stroke fill/.test(c), '외곽선');
  A(/text-shadow:0\.05em 0\.05em 0\.1em/.test(c) && /letter-spacing:0\.02em/.test(c) && /line-height:1\.4/.test(c), '그림자·자간·행간');
});

/* ---------- 2. 렌더 계층 — SVG(내보내기 기반) ---------- */
const styledScene = () => ({ id: 's1', width: 1280, height: 720, background: '#FFFFFF', elements: [
  { kind: 'text', text: '멋진 글자', x: 10, y: 40, w: 80, size: 8, weight: 700, align: 'center',
    font: 'Jua', color: '#FFFFFF', bg: { color: '#C0392B', radius: 0.2 }, outline: { color: '#1F2733', w: 0.05 }, shadow: { color: 'rgba(0,0,0,.4)', x: 0.05, y: 0.05, blur: 0.1 } },
] });

T('renderScene — 텍스트 op에 bg·outline·shadow·textW 탑재', () => {
  const dl = RD.renderScene(styledScene(), { noCache: true });
  const op = dl.ops.find((o) => o.op === 'text');
  A(op, 'text op 없음');
  A(op.bg && op.bg.color === '#C0392B', 'bg');
  A(op.outline && op.outline.color === '#1F2733', 'outline');
  A(op.shadow && op.shadow.blur === 0.1, 'shadow');
  A(op.textW > 0, 'textW');
  A(op.font.family === 'Jua' && !op.font.missing, 'Jua 폰트 미등록: ' + JSON.stringify(op.font));
});

T('toSVG — 배경 rect·stroke·feDropShadow 실출력', () => {
  const svg = RD.toSVG(RD.renderScene(styledScene(), { noCache: true }));
  A(/<rect[^>]*fill="#C0392B"/.test(svg), '배경 rect');
  A(/stroke="#1F2733"[^>]*paint-order="stroke fill"/.test(svg), '외곽선');
  A(/feDropShadow/.test(svg), '그림자 필터');
  A(/font-family="Jua/.test(svg), 'SVG 글꼴');
});

T('신규 폰트 4종 resolveFont 등록 (Gowun Batang·Nanum Pen Script·Gaegu·Do Hyeon)', () => {
  ['Gowun Batang', 'Nanum Pen Script', 'Gaegu', 'Do Hyeon'].forEach((f) => {
    A(!RD.resolveFont(f).missing, f + ' 미등록');
  });
});

T('toRaster planOnly — 스타일 있어도 결정론 경로 무손상', () => {
  const r = RD.toRaster(RD.renderScene(styledScene(), { noCache: true }), { planOnly: true });
  A(r.plan && r.svg && /멋진 글자|멋진/.test(r.svg), 'planOnly 경로');
});

T('index.html — 웹폰트 7종 로드 + textstyle.js 배선', () => {
  A(/fonts\.googleapis\.com\/css2\?family=Jua/.test(html) && /Gaegu/.test(html) && /Nanum\+Pen\+Script/.test(html), '웹폰트 링크');
  A(/data\/textstyle\.js/.test(html), 'textstyle.js 로드');
});

/* ---------- 3. Workspace 패널 실배선 ---------- */
const C = window.MK_COMPOSE;
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));
window.MK_START.open(C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3), texts: { title: '스타일 검증' } }).doc);
const WSdoc = () => window.MK_PROJ.current().doc;
const TI = WSdoc().scenes.findIndex((s2) => s2.elements.some((e) => e.kind === 'text'));
const draw = () => PG.render();

T('텍스트 선택 → 프리셋 12·글꼴 select·색·배경·정렬·전체 적용 버튼 렌더', () => {
  draw();
  document.querySelector(`[data-ws-sc="${TI}"]`).onclick(); draw();
  const ti = WSdoc().scenes[TI].elements.findIndex((e) => e.kind === 'text');
  document.querySelector(`[data-ws-el="${ti}"]`).onclick({ stopPropagation() {} }); draw();
  A(document.querySelectorAll('[data-ws-tsp]').length >= 12, '프리셋 수');
  A(document.querySelector('[data-ws-tfont]'), '글꼴 select');
  A(document.querySelectorAll('[data-ws-tcol]').length >= 10, '색 스와치');
  A(document.querySelectorAll('[data-ws-tbg]').length >= 7, '배경 스와치');
  A(document.querySelectorAll('[data-ws-tal]').length === 3, '정렬');
  A(document.querySelector('[data-ws-tsall]'), '전체 적용 버튼');
  A(!document.body.innerHTML.includes('시안 반영 대상'), '자리표시자 잔존');
});

T('프리셋 클릭 → el 실반영 + 캔버스 CSS 반영 + undo 적립', () => {
  const sc2 = WSdoc().scenes[TI];
  const ti = sc2.elements.findIndex((e) => e.kind === 'text');
  document.querySelector('[data-ws-tsp="ts-news"]').onclick(); draw();
  const el = sc2.elements[ti];
  A(el.font === 'Do Hyeon' && el.bg && el.bg.color === '#C0392B', '프리셋 미반영');
  const n = document.querySelector(`[data-ws-el="${ti}"]`);
  A(/Do Hyeon/.test(n.getAttribute('style')) && /background:#C0392B/.test(n.getAttribute('style')), '캔버스 CSS 미반영');
  document.querySelector('[data-ws="undo"]').onclick(); draw();
  A(!WSdoc().scenes[TI].elements[ti].bg, 'undo 미동작');
  document.querySelector('[data-ws="redo"]').onclick(); draw();
});

T('글꼴 select·색·배경·정렬 개별 컨트롤 실반영', () => {
  const sc2 = WSdoc().scenes[TI];
  const ti = sc2.elements.findIndex((e) => e.kind === 'text');
  const fsel = document.querySelector('[data-ws-tfont]');
  fsel.value = 'Gaegu'; fsel.onchange(); draw();
  A(sc2.elements[ti].font === 'Gaegu', '글꼴');
  document.querySelector('[data-ws-tcol="#22D3A5"]').onclick(); draw();
  A(sc2.elements[ti].color === '#22D3A5', '색');
  document.querySelector('[data-ws-tbg="none"]').onclick(); draw();
  A(!sc2.elements[ti].bg, '배경 없음');
  document.querySelector('[data-ws-tal="center"]').onclick(); draw();
  A(sc2.elements[ti].align === 'center', '정렬');
});

T('「모든 장면 글자에」 → 전 씬 실반영 + 개수 정직 알림', () => {
  const aOrig = window.alert; let msg = '';
  window.alert = (m2) => { msg = m2; };
  document.querySelector('[data-ws-tsall]').onclick();
  window.alert = aOrig;
  draw();
  const total = WSdoc().scenes.reduce((a2, s2) => a2 + s2.elements.filter((e) => e.kind === 'text').length, 0);
  A(new RegExp(total + '개').test(msg), '개수 알림: ' + msg);
  WSdoc().scenes.forEach((s2) => s2.elements.filter((e) => e.kind === 'text').forEach((e) => {
    A(e.font === 'Gaegu' && e.color === '#22D3A5', '전 씬 미반영');
  }));
});

/* ---------- 4. 플레이어 동률 ---------- */
T('플레이어 씬 HTML — 스타일 CSS 동일 규약', () => {
  const sc2 = { background: '#fff', elements: [{ kind: 'text', text: '재생', x: 10, y: 40, w: 80, size: 6, font: 'Jua', bg: { color: '#FFE86B', radius: 0.2 } }] };
  const h2 = window.MK_PLAY.sceneHTML ? window.MK_PLAY.sceneHTML(sc2) : null;
  if (h2 === null) { /* 내부 함수 미공개 시 소스 검증 */
    const src2 = fs.readFileSync('data/play.js', 'utf8');
    A(src2.includes('MK_TEXTSTYLE.css(el)'), 'play 배선 없음');
  } else {
    A(/Jua/.test(h2) && /background:#FFE86B/.test(h2), '플레이어 미반영');
  }
});

console.log(`\nR56: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
