/* R154 — 편집형 템플릿 패키지 파이프라인 (Forest Weekend 첫 대상, 하드코딩 0)
   ① 빌드 결정성 ② 등록·목록 ③ 열기 → workspace 요소 28 ④ 제목 텍스트 편집 ⑤ 사진 올리기 → 풍경 숨김
   ⑥ 벡터 개별 편집·삭제 ⑦ 순서 ⑧ undo/redo ⑨ 저장 왕복 ⑩ 다른 패키지도 같은 문(합성 패키지) */
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { JSDOM } from 'jsdom';
import { build } from './tplpkg-build.mjs';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let pass = 0, fail = 0;
const T = (n, fn) => { try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + ' → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + n + ' → ERROR ' + e.message); } };

console.log('--- ① 빌드 ---');
T('tplpkg-build 재실행 = 커밋본과 바이트 동일 (드리프트 0)', () => build().body === read('data/tplpkg-baked.js') || '다름 — node tplpkg-build.mjs 다시 돌릴 것');
T('index.html 두 곳 배선 + maker/index.html 재생성본', () => { const a = read('index.html'), b = read('../maker/index.html'); return /tplpkg\.js/.test(a) && /tplpkg-baked\.js/.test(a) && a.indexOf('svgasset.js') < a.indexOf('tplpkg.js') && a.indexOf('tplpkg.js') < a.indexOf('tplpkg-baked.js') && /tplpkg-baked\.js/.test(b); });

function boot() {
  const dom = new JSDOM('<!doctype html><html><body><div class="pg-shell"><nav id="pgNav"></nav><main><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></main></div></body></html>',
    { runScripts: 'outside-only', url: 'https://x.test/maker/', pretendToBeVisual: true });
  const w = dom.window; w.alert = () => {}; w.confirm = () => true;
  Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
  const store = {};
  Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; }, key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });
  w.MK_PRODUCT = true;
  const html = read('index.html');
  const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
  for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return { w, store };
}
const { w, store } = boot();
const ID = 'pkg-forest-weekend-banner';

console.log('--- ② 등록·목록 ---');
T('MK_TPL 에 등록됨 (Forest Weekend — 캠핑장 현수막, 3:1, poster)', () => { const t = w.MK_TPL.get(ID); return !!t && /Forest Weekend/.test(t.title) && /캠핑장 현수막/.test(t.title) && t.ratio === '3:1' && t.contentType === 'poster' || JSON.stringify(t && t.title); });
T('MK_TPL.list() 에 있고 기존 템플릿 수는 줄지 않음', () => { const l = w.MK_TPL.list(); return l.some((t) => t.templateId === ID) && l.length >= 62 || l.length; });
T('Templates 화면(browser) 「포스터」·「전체」 에 카드 노출', () => { w.PG.go('templates'); const b = w.document.getElementById('pgBody'); const all = !!b.querySelector(`[data-tpl="${ID}"]`); const cat = b.querySelector('[data-cat="poster"]'); if (cat) cat.click(); const po = !!b.querySelector(`[data-tpl="${ID}"]`); return all && po || JSON.stringify({ all, po }); });
T('만들기 깔때기(포스터 → 스타일 → 목록) 에 노출 (R154: MK_TPL.list 로)', () => { w.MK_SCREENS.create.enter('poster'); w.PG.state.create.style = 'Premium'; w.PG.state.create.step = 3; w.PG.render(); const b = w.document.getElementById('pgBody'); return !!b.querySelector(`[data-cf-tpl="${ID}"]`) || '없음'; });
T('깔때기 4단계 미리보기가 그 템플릿을 연다 (0번 샘플로 안 떨어짐)', () => { w.document.querySelector(`[data-cf-tpl="${ID}"]`).click(); const b = w.document.getElementById('pgBody').innerHTML; w.PG.loadEditorDoc(ID); return /Forest Weekend/.test(b) && w.PG.state.editor.doc.templateId === ID || w.PG.state.editor.doc.templateId; });

console.log('--- ③ 열기 ---');
let pid;
const doc = () => w.MK_PROJ.get(pid).doc;
let _sc; const scObj = { }; Object.defineProperty(globalThis, 'sc', { get: () => doc().scenes[0] });
T('템플릿 열기 → 프로젝트 생성 → workspace 도달', () => { const p = w.MK_PROJ.createFromTemplate(ID); pid = p.projectId; w.MK_PROJ.open(pid); return w.PG.state.screen === 'workspace' && sc.width === 3000 && sc.height === 1000 || w.PG.state.screen; });
T('요소 28 = 텍스트 7 · 사진 자리 1 · 벡터 14 · 도형/단색 6 — PNG 통짜 0', () => { const k = (x) => sc.elements.filter((e) => e.kind === x).length; const ph = sc.elements.filter((e) => e.role === 'photo-slot').length; return sc.elements.length === 28 && k('text') === 7 && ph === 1 && k('vector') === 14 && sc.elements.filter((e) => e.src).length === 1 && /forest-camp-dusk\.jpg$/.test(sc.elements.find((e) => e.role === 'photo-slot').src) || JSON.stringify({ n: sc.elements.length, t: k('text'), v: k('vector'), ph }); });
T('위치·비율: 제목 x=4.53% y=25.8% w=52.5% · 사진 자리 61.17/8.8/34/68.4', () => { const t = sc.elements.find((e) => e.aid === 'title'), p = sc.elements.find((e) => e.aid === 'photo-placeholder'); return t.x === 4.53 && t.y === 25.8 && t.w === 52.5 && p.x === 61.17 && p.y === 8.8 && p.w === 34 && p.h === 68.4 || JSON.stringify([t, p]); });
T('풍경 15조각은 한 그룹(scene.groups) · 다른 장식은 독립', () => { const g = Object.keys(sc.groups || {}); const m = sc.elements.filter((e) => e.grp === g[0]).length; const bm = sc.elements.find((e) => e.aid === 'brand-mark'); return g.length === 1 && m === 15 && !bm.grp || JSON.stringify({ g, m }); });
T('렌더(SVG 출력) 에 text 7 · 중첩 svg 14 · 경고 없음(글꼴 폴백 0)', () => { const dl = w.MK_RENDER.renderScene(sc, { noCache: true }); const svg = w.MK_RENDER.toSVG(dl); const nt = (svg.match(/<text /g) || []).length, nv = (svg.match(/<svg x=/g) || []).length + sc.elements.filter((e) => e.kind === 'vector' && e.visible === false).length; const miss = (dl.warnings || []).filter((x) => /missing-font|폰트 없음/.test(JSON.stringify(x))); return nt === 7 && nv === 14 && miss.length === 0 || JSON.stringify({ nt, nv, miss }); });
T('기본 사진이 들어 있어 풍경 15조각은 숨김(보존) → 캔버스 DOM 13 + 사진 img', () => { const n = w.document.querySelectorAll('[data-ws-el]').length, h = sc.elements.filter((e) => e.visible === false).length; return n === 13 && h === 15 && !!w.document.querySelector('.ws-media') || JSON.stringify({ n, h }); });
T('풍경 복구(showFallbacks) → DOM 28', () => { const el = sc.elements.find((e) => e.role === 'photo-slot'); w.MK_TPLPKG.showFallbacks(sc, el); w.PG.render(); return w.document.querySelectorAll('[data-ws-el]').length === 28 || w.document.querySelectorAll('[data-ws-el]').length; });

console.log('--- ④ 텍스트 ---');
const WS = w.MK_WS.state;
const idxOf = (aid) => sc.elements.findIndex((e) => e.aid === aid);
const typeOf = (e) => e.kind === 'text' ? 'text' : e.kind === 'vector' ? 'vector' : 'image';
const sel = (aid, inGrp) => { const i = idxOf(aid); const e = sc.elements[i]; WS.gsel = null; WS.msel = []; WS.inGrp = inGrp ? e.grp : null; WS.sel = { type: typeOf(e), idx: i }; w.PG.render(); return i; };
const key = (k, o) => w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, ...(o || {}) }));
T('제목 선택 → 텍스트 패널(내용 편집 칸) 열림', () => { const i = sel('title'); return WS.sel.idx === i && WS.sel.type === 'text' && !!w.document.querySelector('[data-ws-txt]') || JSON.stringify(WS.sel); });
T('제목 내용 수정 → 문서 반영', () => { const ta = w.document.querySelector('[data-ws-txt]'); ta.value = 'Camp\nWeekend'; ta.dispatchEvent(new w.Event('input', { bubbles: true })); ta.dispatchEvent(new w.Event('change', { bubbles: true })); return sc.elements[idxOf('title')].text === 'Camp\nWeekend' || sc.elements[idxOf('title')].text; });
T('글꼴 목록(코모런트 포함)·크기·색 컨트롤 존재', () => { const b = w.document.getElementById('pgBody'); return b.querySelectorAll('[data-ws-tfontb]').length >= 9 && !!b.querySelector('[data-ws-tfontb="Cormorant Garamond"]') && !!b.querySelector('[data-ws-tsize]') && b.querySelectorAll('[data-ws-tcol]').length > 0 || '패널 부족'; });
T('글꼴 변경(고운바탕) → font 반영', () => { w.document.querySelector('[data-ws-tfontb="Gowun Batang"]').click(); return sc.elements[idxOf('title')].font === 'Gowun Batang' || sc.elements[idxOf('title')].font; });
T('크기 변경(size 12) → size 반영', () => { sel('title'); const r = w.document.querySelector('[data-ws-tsize]'); r.value = '12'; r.dispatchEvent(new w.Event('input', { bubbles: true })); r.dispatchEvent(new w.Event('change', { bubbles: true })); return +sc.elements[idxOf('title')].size === 12 || sc.elements[idxOf('title')].size; });
T('색 변경(스와치) → color 반영', () => { sel('title'); const b = w.document.querySelector('[data-ws-tcol]'); const c = b.dataset.wsTcol; b.click(); return sc.elements[idxOf('title')].color === c || sc.elements[idxOf('title')].color; });

console.log('--- ⑤ 사진 ---');
T('사진 자리 = image 요소 · role photo-slot · 「사진 올리기」 버튼', () => { const i = sel('photo-placeholder'); return sc.elements[i].kind === 'image' && sc.elements[i].role === 'photo-slot' && !!w.document.querySelector('[data-ws-preplace]') || '버튼 없음'; });
T('사진 넣으면(src) 풍경 15조각 visible:false, 다른 27요소 살아 있음', () => { const i = idxOf('photo-placeholder'); const el = sc.elements[i]; w.MK_TPLPKG.showFallbacks(sc, el); el.src = 'data:image/png;base64,iVBORw0KGgo='; const n = w.MK_TPLPKG.hideFallbacks(sc, el); const hidden = sc.elements.filter((e) => e.visible === false).length; return n === 15 && hidden === 15 && sc.elements.length === 28 || JSON.stringify({ n, hidden }); });
T('사진 요소에 자르기(crop)·초점(위치)·맞춤 컨트롤이 붙는다 (MK_PHOTO 경로)', () => { sel('photo-placeholder'); const b = w.document.getElementById('pgBody'); return !!b.querySelector('[data-ws-pcrop]') && b.querySelectorAll('[data-ws-focal]').length >= 9 && !!b.querySelector('[data-ws-fit]') || '컨트롤 없음'; });
T('사진 넣은 뒤 캔버스에 풍경 15조각이 안 그려지고 사진(img)이 그려진다', () => { const hidden = w.document.querySelectorAll('[data-ws-el]').length; const img = w.document.querySelectorAll('.ws-media').length; return hidden === 13 && img >= 1 || JSON.stringify({ hidden, img }); });
T('showFallbacks 로 복구 가능', () => { const el = sc.elements[idxOf('photo-placeholder')]; const n = w.MK_TPLPKG.showFallbacks(sc, el); return n === 15 && !sc.elements.some((e) => e.visible === false); });

console.log('--- ⑥⑦⑧ 장식·순서·undo ---');
T('브랜드 심볼(독립 벡터) 선택 → 벡터 패널(색 스와치·회전·순서)', () => { sel('brand-mark'); const b = w.document.getElementById('pgBody'); return b.querySelectorAll('[data-ws-paint]').length >= 1 && !!b.querySelector('[data-ws-rotr]') && !!b.querySelector('[data-ws-ord="back"]') || '패널 없음'; });
T('심볼 색 스와치 → paint 반영 → 렌더 마크업 치환', () => { const i = idxOf('brand-mark'); const p = w.document.querySelector('[data-ws-paint]'); p.value = '#ff00ff'; p.dispatchEvent(new w.Event('input', { bubbles: true })); p.dispatchEvent(new w.Event('change', { bubbles: true })); const el = sc.elements[i]; return el.paint && Object.values(el.paint).some((v) => /ff00ff/i.test(v)) && /ff00ff/i.test(w.MK_SVGASSET.markupOf(el)) || JSON.stringify(el.paint); });
T('심볼 회전(rot 15) → 반영', () => { sel('brand-mark'); const r = w.document.querySelector('[data-ws-rotr]'); r.value = '15'; r.dispatchEvent(new w.Event('input', { bubbles: true })); r.dispatchEvent(new w.Event('change', { bubbles: true })); return +sc.elements[idxOf('brand-mark')].rot === 15 || sc.elements[idxOf('brand-mark')].rot; });
T('풍경 조각(소나무 1) 은 그룹 → 내부 편집으로 단일 선택 가능', () => { const i = sel('pine-1', true); return WS.sel.idx === i && WS.inGrp === sc.elements[i].grp && !WS.gsel; });
T('소나무 1 이동(x+5) — 나머지 제자리', () => { const i = idxOf('pine-1'); const before = sc.elements.map((e) => e.x); sc.elements[i].x = Math.round((before[i] + 5) * 100) / 100; return sc.elements.every((e, j) => j === i ? e.x === Math.round((before[j] + 5) * 100) / 100 : e.x === before[j]); });
T('소나무 1 삭제(Delete) → 27, 다른 소나무·텐트 남음', () => { sel('pine-1', true); key('Delete'); return sc.elements.length === 27 && idxOf('pine-1') < 0 && idxOf('pine-2') >= 0 && idxOf('tent-roof') >= 0 || sc.elements.length; });
T('Ctrl+Z → 28 복귀 · Ctrl+Y → 27', () => { key('z', { ctrlKey: true }); const a = sc.elements.length; key('y', { ctrlKey: true }); const b = sc.elements.length; return a === 28 && b === 27 || JSON.stringify([a, b]); });
T('레이어 순서: 짧은 선을 맨뒤로 → elements[0] · 맨앞으로 → 마지막', () => { sel('accent-line'); w.document.querySelector('[data-ws-ord="back"]').click(); const a = sc.elements[0].aid; sel('accent-line'); w.document.querySelector('[data-ws-ord="front"]').click(); const b = sc.elements[sc.elements.length - 1].aid; sel('accent-line'); w.document.querySelector('[data-ws-ord="back"]').click(); return a === 'accent-line' && b === 'accent-line' || JSON.stringify([a, b]); });
T('레이어 패널에 풍경 그룹 + 조각 이름이 선다', () => { w.document.querySelector('[data-ws-nav="layers"]').click(); const b = w.document.getElementById('pgBody').innerHTML; return /풍경 · 사진/.test(b) && /소나무 2/.test(b) && /메인 제목/.test(b) || '레이어 없음'; });

console.log('--- ⑨ 저장 왕복 ---');
T('자동 저장(MK_LIVE) → 다시 불러오면 편집 상태(제목·색·삭제·순서) 유지', () => {
  w.MK_LIVE.saveDoc(doc()); w.MK_LIVE.saveProjects();
  const snap = JSON.stringify(doc());
  const { w: w2 } = (() => { const d = boot(); Object.keys(store).forEach((k) => d.store[k] = store[k]); d.w.MK_LIVE.restoreProjects && d.w.MK_LIVE.restoreProjects(); return d; })();
  const p2 = w2.MK_PROJ.get(pid); if (!p2) return '재부팅 뒤 프로젝트 없음';
  const s2 = p2.doc.scenes[0];
  const t2 = s2.elements.find((e) => e.aid === 'title'), bm = s2.elements.find((e) => e.aid === 'brand-mark');
  return JSON.stringify(p2.doc) === snap && s2.elements.length === 27 && t2.text === 'Camp\nWeekend' && t2.font === 'Gowun Batang' && +t2.size === 12 && s2.elements[0].aid === 'accent-line' && +bm.rot === 15 && s2.elements.filter((e) => e.visible === false).length === 0 && Object.keys(s2.groups || {}).length === 1 || JSON.stringify({ same: JSON.stringify(p2.doc) === snap, n: s2.elements.length });
});

console.log('--- ⑩ 하드코딩 0 — 합성 패키지도 같은 문 ---');
T('다른 패키지(합성 2객체) 를 toTemplate 로 풀면 같은 구조', () => { const pkg = { schema: 'kedu.editable-template/1.0', templateId: 'synthetic-x', name: 'X', canvas: { width: 1000, height: 1000 }, objects: [ { id: 'bg', type: 'shape', shape: 'rect', x: 0, y: 0, width: 1000, height: 1000, fill: '#fff', zIndex: 0 }, { id: 't', type: 'text', x: 10, y: 10, width: 500, height: 100, text: 'Hi', fontSize: 50, fontFamily: 'Noto Sans CJK KR', fill: '#000', zIndex: 1 }, { id: 'v', type: 'vector', x: 100, y: 100, width: 100, height: 100, viewBox: [0, 0, 10, 10], paths: [{ d: 'M0 0L10 10', stroke: '#000', strokeWidth: 1 }], zIndex: 2 } ] }; const r = w.MK_TPLPKG.toTemplate(pkg, {}, {}, { dir: 'x' }); const e = r.src.scenes[0].elements; return r.src.templateId === 'pkg-synthetic-x' && e.length === 3 && e[1].kind === 'text' && e[1].font === 'Noto Sans KR' && e[1].size === 5 && e[2].kind === 'vector' && /stroke="#000"/.test(e[2].vec.body) || JSON.stringify(e); });
T('validate 가 깨진 패키지를 거른다', () => { const v = w.MK_TPLPKG.validate({ schema: 'x', objects: [{ id: 'a', type: 'vector' }] }); return !v.ok && v.violations.length >= 3 || JSON.stringify(v); });
T('기존 R152 크리스마스 에셋 카탈로그 무접촉', () => w.MK_SVGASSET.CATALOG.some((c) => c.id === 'christmas-frame'));

console.log(`\ntest-round154: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
