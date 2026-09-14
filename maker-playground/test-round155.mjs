/* R155 — K-Maker Font Registry & Typography System (jsdom)
   ① 등록부·해석(Exact→Alias→Compatible→Fallback, 대체 기록) ② 로드 보장(face 없음=failed, 있음=loaded, fonts 없는 환경=unknown)
   ③ 패키지 타이포 보존(fontId·baseline·wrap·letterSpacing) ④ 렌더 출력(SVG) 에 글꼴·굵기·자간·행간 ⑤ 워크스페이스 배선
   (진입 시 ensure → 실패 ⚠ · failed 재시도 없음 · 굵기 목록 · 자간·행간 슬라이더 · Undo · 저장 왕복) ⑥ 행간이 상자 높이에 반영 ⑦ Preset·정규화·감사 */
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { JSDOM } from 'jsdom';
import { build } from './tplpkg-build.mjs';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let pass = 0, fail = 0;
const T = (n, fn) => { try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + ' → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + n + ' → ERROR ' + e.message); } };
const TA = async (n, fn) => { try { const r = await fn(); if (r === true) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + ' → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + n + ' → ERROR ' + e.message); } };

/* 가짜 document.fonts — 브라우저 규약 그대로: load(spec) 는 family 에 맞는 face 만, check 는 face 가 없으면 true(로드할 게 없음) */
function fakeFonts(families) {
  const faces = families.map((f) => ({ family: f.family, weight: String(f.weight || 400), style: f.style || 'normal', status: 'unloaded' }));
  const fam = (spec) => (spec.match(/"([^"]+)"/) || [])[1] || '';
  const set = { calls: [],
    load: (spec) => { set.calls.push(spec); const f = fam(spec); const m = faces.filter((x) => x.family === f); m.forEach((x) => x.status = 'loaded'); return Promise.resolve(m); },
    check: (spec) => { const f = fam(spec); const m = faces.filter((x) => x.family === f); return !m.length || m.every((x) => x.status === 'loaded'); },
    add: (face) => { faces.push({ family: face.family, weight: face.weight, style: face.style, status: 'unloaded' }); },
    [Symbol.iterator]: () => faces[Symbol.iterator](), get ready() { return Promise.resolve(); } };
  return set;
}
function boot(fonts) {
  const dom = new JSDOM('<!doctype html><html><body><div class="pg-shell"><nav id="pgNav"></nav><main><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></main></div></body></html>',
    { runScripts: 'outside-only', url: 'https://x.test/maker/', pretendToBeVisual: true });
  const w = dom.window; w.alert = () => {}; w.confirm = () => true;
  Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
  const store = {};
  Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; }, key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });
  if (fonts) { Object.defineProperty(w.document, 'fonts', { value: fonts, configurable: true }); w.FontFace = function (family, src, desc) { Object.assign(this, { family, src, weight: desc && desc.weight || '400', style: desc && desc.style || 'normal' }); }; }
  w.MK_PRODUCT = true;
  const html = read('index.html');
  const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
  for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return { w, store };
}
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 30));
const ID = 'pkg-forest-weekend-banner';

console.log('--- ① 등록부·해석 ---');
{
  const { w } = boot();
  const FR = w.MK_FONTREG;
  T('배선: index.html 에 fontreg.js 가 tplpkg.js 보다 앞, maker/index.html 재생성본에도', () => { const a = read('index.html'), b = read('../maker/index.html'); return a.indexOf('fontreg.js') > 0 && a.indexOf('fontreg.js') < a.indexOf('tplpkg.js') && /fontreg\.js/.test(b); });
  T('audit ok · 등록부 11종 · Preset 6종', () => { const a = FR.audit(); return a.ok && a.fonts === 11 && a.presets === 6 || JSON.stringify(a); });
  T('Exact: Cormorant Garamond / noto-sans-kr(id) → exact, 대체 없음', () => { const a = FR.resolve('Cormorant Garamond'), b = FR.resolve('noto-sans-kr'); return a.match === 'exact' && !a.substituted && b.match === 'exact' && b.family === 'Noto Sans KR'; });
  T('Alias: Noto Sans CJK KR → noto-sans-kr (같은 글꼴, substituted false)', () => { const r = FR.resolve('Noto Sans CJK KR'); return r.fontId === 'noto-sans-kr' && r.match === 'alias' && !r.substituted; });
  T('사이드카 fontMap 도 alias 로 (Exact 우선: 등록부에 있으면 map 무시)', () => { const a = FR.resolve('Brand Serif', { map: { 'Brand Serif': 'Gowun Batang' } }), b = FR.resolve('Cormorant Garamond', { map: { 'Cormorant Garamond': 'Pretendard' } }); return a.fontId === 'gowun-batang' && a.match === 'alias' && b.fontId === 'cormorant-garamond' && b.match === 'exact'; });
  T('Compatible: Georgia → cormorant-garamond, Arial → pretendard — substituted + 기록', () => { const n0 = FR.substitutions().length; const a = FR.resolve('Georgia', { where: 'x' }), b = FR.resolve('Arial'); const subs = FR.substitutions(); return a.fontId === 'cormorant-garamond' && a.substituted && b.fontId === 'pretendard' && subs.length === n0 + 2 && subs.some((s) => s.requested === 'Georgia' && s.where === 'x') || JSON.stringify(subs); });
  T('Fallback: 낯선 이름은 성격으로(Serif 계열 → 고운바탕 / 그 외 → 프리텐다드)', () => { const a = FR.resolve('Some Serif Face'), b = FR.resolve('Whatever Sans'); return a.fontId === 'gowun-batang' && a.substituted && b.fontId === 'pretendard' && b.match === 'fallback'; });
  T('같은 대체는 한 번만 기록', () => { const n0 = FR.substitutions().length; FR.resolve('Georgia'); FR.resolve('Georgia'); return FR.substitutions().length === n0; });
  T('nearestWeight — 글꼴이 가진 굵기로 스냅(코모런트 800→700, 주아 700→400)', () => FR.nearestWeight(FR.get('cormorant-garamond'), 800) === 700 && FR.nearestWeight(FR.get('jua'), 700) === 400 && FR.nearestWeight(FR.get('noto-sans-kr'), 600) === 500);
  T('requiredOf — 장면의 텍스트에서 (family|weight|style) 중복 없이', () => { const r = FR.requiredOf({ elements: [{ kind: 'text', font: 'Noto Sans KR', weight: 700 }, { kind: 'text', fontId: 'noto-sans-kr', weight: 700 }, { kind: 'text', font: 'Georgia', fontStyle: 'italic' }, { kind: 'image' }] }); return r.length === 2 && r[0].family === 'Noto Sans KR' && r[0].weight === 700 && r[1].family === 'Cormorant Garamond' && r[1].style === 'italic' || JSON.stringify(r); });
  T('transformText uppercase/capitalize · 문서 글은 안 바뀜(순수 함수)', () => FR.transformText('camp weekend', 'uppercase') === 'CAMP WEEKEND' && FR.transformText('camp weekend', 'capitalize') === 'Camp Weekend' && FR.transformText('x', 'none') === 'x');
  T('cssBaseline/domShiftPx — baseline 없는 요소는 0, 패키지 baseline 0.83 은 음수 보정(px)', () => { const z = FR.domShiftPx({ kind: 'text', font: 'Noto Sans KR' }, 100); const s = FR.domShiftPx({ kind: 'text', font: 'Noto Sans KR', baseline: 0.83, lineHeight: 1.04 }, 100); return z === 0 && s < 0 && s > -30 || JSON.stringify([z, s]); });
  T('applyPreset — Premium Serif Hero: 코모런트·uppercase·행간 1.04 · 없는 preset 은 false', () => { const el = { kind: 'text', text: 'hi' }; const ok = FR.applyPreset(el, 'tp-premium-serif-hero'); return ok && el.fontId === 'cormorant-garamond' && el.font === 'Cormorant Garamond' && el.textTransform === 'uppercase' && el.lineHeight === 1.04 && !FR.applyPreset(el, 'nope') || JSON.stringify(el); });
  T('normalizeEl — 이름만 있는 옛 요소에 fontId 채움, 값은 무변형', () => { const el = { kind: 'text', font: 'Gowun Batang', weight: 700 }; FR.normalizeEl(el); return el.fontId === 'gowun-batang' && el.font === 'Gowun Batang' && el.weight === 700; });
  T('addPackageFonts — 등록부에 있는 글꼴은 안 겹치고, 없는 글꼴만 등록(source:package)', () => { const n0 = FR.list().length; const added = FR.addPackageFonts([{ family: 'Cormorant Garamond', src: 'x.woff' }, { family: 'Brand Display', src: 'fonts/b.woff2', weight: '300 700' }], '/p/'); const e = FR.get('brand-display'); return FR.list().length === n0 + 1 && e && e.source.type === 'package' && e.weights.includes(500) && FR.resolve('Brand Display').match === 'exact' || JSON.stringify({ added, e }); });
}

console.log('--- ② 로드 보장 ---');
{
  const { w } = boot();  /* document.fonts 없음 */
  await TA('fonts API 없는 환경: unknown (failed 로 오판하지 않음)', async () => { const r = await w.MK_FONTREG.ensure([{ family: 'Noto Sans KR' }]); return !r.ok && r.unknown.length === 1 && r.failed.length === 0 || JSON.stringify(r); });
}
{
  const fonts = fakeFonts([{ family: 'Noto Sans KR', weight: 400 }, { family: 'Noto Sans KR', weight: 700 }, { family: 'Cormorant Garamond', weight: 400 }]);
  const { w } = boot(fonts); const FR = w.MK_FONTREG;
  await TA('face 있는 글꼴 → loaded · STATUS · onChange 알림', async () => { const ev = []; FR.onChange((e) => ev.push(e.type)); const r = await FR.ensure([{ family: 'Noto Sans KR', weight: 700 }]); return r.ok && r.loaded[0] === 'Noto Sans KR|700|normal' && FR.STATUS['Noto Sans KR|700|normal'] === 'loaded' && ev.includes('loading') && ev.includes('loaded') || JSON.stringify({ r, ev }); });
  await TA('face 없는 글꼴(구글 CSS 안 옴) → check 가 true 여도 failed (짧은 타임아웃)', async () => { const r = await FR.ensure([{ family: 'Gowun Batang' }], { timeout: 300 }); return !r.ok && r.failed[0] === 'Gowun Batang|400|normal' && FR.STATUS['Gowun Batang|400|normal'] === 'failed' && FR.failed().length === 1 || JSON.stringify(r); });
  await TA('face 가 나중에 생기면(CSS 지연) 시간 안에 loaded', async () => { const p = FR.ensure([{ family: 'Jua' }], { timeout: 1500 }); await tick(120); fonts.add({ family: 'Jua', weight: '400', style: 'normal' }); const r = await p; return r.ok && FR.STATUS['Jua|400|normal'] === 'loaded' || JSON.stringify(r); });
  T('굵기는 글꼴 보유분으로 스냅해서 로드(코모런트 800 요청 → 700 키)', () => { FR.ensure([{ family: 'Cormorant Garamond', weight: 800 }]); return FR.STATUS['Cormorant Garamond|700|normal'] !== undefined && FR.STATUS['Cormorant Garamond|800|normal'] === undefined; });
  T('statusOf(el) 가 요소 기준으로 답한다 · ensureSource 는 없는 구글 링크를 붙인다', () => { const st = FR.statusOf({ kind: 'text', font: 'Gowun Batang' }); const n0 = w.document.querySelectorAll('link[href*="fonts.googleapis.com"]').length; const added = FR.ensureSource(FR.get('gaegu')); const n1 = w.document.querySelectorAll('link[href*="fonts.googleapis.com"]').length; return st === 'failed' && added && n1 === n0 + 1 && !FR.ensureSource(FR.get('gaegu')) || JSON.stringify([st, added, n0, n1]); });
  T('hasFace — face 있음/없음', () => FR.hasFace('Noto Sans KR') && !FR.hasFace('Gowun Batang'));
}

console.log('--- ③ 패키지 타이포 보존 ---');
{
  const { w } = boot();
  T('tplpkg-build 재실행 = 커밋본과 바이트 동일 (fontreg 변경이 굳힌 결과를 안 바꿈)', () => build().body === read('data/tplpkg-baked.js') || '다름 — node tplpkg-build.mjs');
  const t = w.MK_TPL.get(ID); const els = (t.scenes || t.src.scenes)[0].elements.filter((e) => e.kind === 'text');
  T('Forest Weekend 텍스트 7 전부 fontId 참조 · baseline 0.83 · wrap none', () => els.length === 7 && els.every((e) => e.fontId && e.baseline === 0.83 && e.wrap === 'none') || JSON.stringify(els.map((e) => [e.aid, e.fontId, e.baseline, e.wrap])));
  T('제목 = cormorant-garamond(Exact, srcFont 없음) · 캡션 자간 em 소수 3자리', () => { const ti = els.find((e) => e.aid === 'title'), cap = els.find((e) => e.letterSpacing); return ti.fontId === 'cormorant-garamond' && !ti.srcFont && !ti.fontSub && cap && String(cap.letterSpacing).split('.')[1].length <= 3 || JSON.stringify([ti, cap]); });
  T('Noto Sans CJK KR 로 온 요소는 srcFont 에 원래 이름, fontSub 없음(alias = 같은 글꼴)', () => { const e = els.find((e) => e.srcFont === 'Noto Sans CJK KR'); return !!e && e.fontId === 'noto-sans-kr' && !e.fontSub || JSON.stringify(els.map((e) => e.srcFont)); });
  T('낯선 글꼴(Georgia) 패키지 → fontSub 기록 + Compatible 글꼴, 동봉 fonts 는 등록부로', () => { const pkg = { schema: 'kedu.editable-template/1.0', templateId: 'syn-f', name: 'F', canvas: { width: 1000, height: 1000 }, fonts: [{ family: 'Brand Serif X', src: 'fonts/x.woff2', weight: '400 700' }], objects: [{ id: 't', type: 'text', x: 0, y: 0, width: 500, height: 100, text: 'A', fontSize: 50, fontFamily: 'Georgia', fill: '#000', zIndex: 1 }, { id: 'u', type: 'text', x: 0, y: 200, width: 500, height: 100, text: 'B', fontSize: 50, fontFamily: 'Brand Serif X', fill: '#000', zIndex: 2 }] }; w.MK_FONTREG.addPackageFonts(pkg.fonts, '/p/'); const r = w.MK_TPLPKG.toTemplate(pkg, {}, {}, { dir: 'x' }); const e = r.src.scenes[0].elements; return e[0].fontSub && e[0].fontSub.requested === 'Georgia' && e[0].fontId === 'cormorant-garamond' && e[1].fontId === 'brand-serif-x' && !e[1].fontSub || JSON.stringify(e.map((x) => [x.fontId, x.fontSub])); });
}

console.log('--- ④ 렌더 출력 ---');
{
  const { w } = boot();
  const sc = { width: 3000, height: 1000, elements: [{ kind: 'text', text: 'Camp\nWeekend', font: 'Noto Sans KR', fontId: 'noto-sans-kr', weight: 700, size: 14, x: 4, y: 20, w: 50, letterSpacing: 0.1, lineHeight: 1.5, color: '#fff' },
    { kind: 'text', text: 'forest weekend', font: 'Cormorant Garamond', fontId: 'cormorant-garamond', weight: 400, fontStyle: 'italic', textTransform: 'uppercase', textDecoration: 'underline', size: 4, x: 4, y: 5, w: 50, color: '#fff', wrap: 'none', baseline: 0.83 }] };
  const dl = w.MK_RENDER.renderScene(sc, { noCache: true }); const svg = w.MK_RENDER.toSVG(dl);
  const texts = svg.match(/<text [^>]*>[\s\S]*?<\/text>/g) || [];
  T('SVG 제목: Noto Sans KR · weight 700 · letter-spacing(px=14em×0.1) · 2줄 tspan', () => { const t = texts.find((x) => /Camp/.test(x)); return !!t && /font-family="Noto Sans KR/.test(t) && /font-weight="700"/.test(t) && /letter-spacing="14"/.test(t) && (t.match(/<tspan/g) || []).length === 2 || t; });
  T('SVG 부제: uppercase 변형 · italic · underline · 문서 text 는 소문자 그대로', () => { const t = texts.find((x) => /FOREST WEEKEND/.test(x)); return !!t && /font-style="italic"/.test(t) && /text-decoration="underline"/.test(t) && sc.elements[1].text === 'forest weekend' || (texts[1] || '').slice(0, 200); });
  T('행간이 두 줄 사이 간격에 실린다 (y 차 = size×lineHeight)', () => { const t = texts.find((x) => /Camp/.test(x)); const ys = [...t.matchAll(/<tspan[^>]* y="([\d.]+)"/g)].map((m) => +m[1]); return ys.length === 2 && Math.abs((ys[1] - ys[0]) - 140 * 1.5) < 0.5 || JSON.stringify(ys); });
  T('wrap:none 은 명시 개행만 (긴 문구도 한 줄)', () => { const s2 = { width: 1000, height: 1000, elements: [{ kind: 'text', text: 'a very long line of words that would normally wrap around the box', font: 'Noto Sans KR', size: 8, x: 0, y: 0, w: 20, wrap: 'none' }] }; const d2 = w.MK_RENDER.renderScene(s2, { noCache: true }); const op = d2.ops.find((o) => o.op === 'text'); return op && op.lines.length === 1 || JSON.stringify(op && op.lines); });
  T('폭표: 코모런트는 자기 정적표(프리텐다드 폭이 아님)', () => { const a = w.MK_FONTREG.metricsOf('Cormorant Garamond'), b = w.MK_FONTREG.metricsOf('Pretendard'); return a.lo === .441 && b.lo === .506; });
}

console.log('--- ⑤⑥ 워크스페이스 ---');
{
  const fonts = fakeFonts([{ family: 'Noto Sans KR', weight: 400 }, { family: 'Noto Sans KR', weight: 700 }, { family: 'Noto Sans KR', weight: 300 }, { family: 'Noto Sans KR', weight: 500 }, { family: 'Cormorant Garamond', weight: 400 }, { family: 'Pretendard', weight: 400 }]);
  const { w, store } = boot(fonts); const FR = w.MK_FONTREG; const WS = w.MK_WS.state;
  let pid; const doc = () => w.MK_PROJ.get(pid).doc; const sc = () => doc().scenes[0];
  const idxOf = (aid) => sc().elements.findIndex((e) => e.aid === aid);
  const sel = (aid) => { const i = idxOf(aid); WS.gsel = null; WS.msel = []; WS.inGrp = null; WS.sel = { type: 'text', idx: i }; w.PG.render(); return i; };
  const fire = (q, v) => { const r = w.document.querySelector(q); r.value = v; r.dispatchEvent(new w.Event('input', { bubbles: true })); r.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const key = (k, o) => w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, ...(o || {}) }));
  const p = w.MK_PROJ.createFromTemplate(ID); pid = p.projectId; w.MK_PROJ.open(pid);
  await tick(80);
  T('진입 시 장면 글꼴 ensure → 코모런트·Noto loaded (Font Ready)', () => FR.STATUS['Cormorant Garamond|400|normal'] === 'loaded' && FR.STATUS['Noto Sans KR|400|normal'] === 'loaded' && (WS.fontsFailed || []).length === 0 || JSON.stringify(FR.STATUS));
  T('제목 선택 → 패널에 ⚠ 없음 · 굵기 목록 = 코모런트 보유분 300~700', () => { sel('title'); const b = w.document.getElementById('pgBody'); const ws = [...b.querySelectorAll('[data-ws-tweight] option')].map((o) => o.value); return !/못 불러왔어요/.test(b.innerHTML) && ws.join('/') === '300/400/500/600/700' || ws.join('/'); });
  T('글꼴 버튼 → 고운바탕(face 없음): 문서 font/fontId 바뀌고 로드 시도', () => { w.document.querySelector('[data-ws-tfontb="Gowun Batang"]').click(); const e = sc().elements[idxOf('title')]; return e.font === 'Gowun Batang' && e.fontId === 'gowun-batang' && !e.fontSub && (FR.STATUS['Gowun Batang|400|normal'] === 'loading' || FR.STATUS['Gowun Batang|400|normal'] === 'failed') || JSON.stringify([e.font, FR.STATUS]); });
  await TA('로드 실패 확정 → 다시 그려져 패널 ⚠ · 문서 글꼴은 그대로 · 다시 시도하지 않음(재렌더해도 loads 수 불변)', async () => { for (let i = 0; i < 300 && FR.STATUS['Gowun Batang|400|normal'] !== 'failed'; i++) await tick(50); await tick(60); const b = w.document.getElementById('pgBody'); const warn = /못 불러왔어요/.test(b.innerHTML) && /고운바탕/.test(b.innerHTML); const n0 = fonts.calls.filter((s) => /Gowun/.test(s)).length; w.PG.render(); await tick(80); w.PG.render(); await tick(80); const n1 = fonts.calls.filter((s) => /Gowun/.test(s)).length; return warn && sc().elements[idxOf('title')].font === 'Gowun Batang' && n1 === n0 && FR.STATUS['Gowun Batang|400|normal'] === 'failed' || JSON.stringify({ warn, n0, n1, st: FR.STATUS['Gowun Batang|400|normal'] }); });
  await TA('글꼴 버튼 → Noto Sans KR: loaded · ⚠ 사라짐 · 굵기 목록 300/400/500/700', async () => { sel('title'); w.document.querySelector('[data-ws-tfontb="Noto Sans KR"]').click(); await tick(80); sel('title'); const b = w.document.getElementById('pgBody'); const ws = [...b.querySelectorAll('[data-ws-tweight] option')].map((o) => o.value + (/대체/.test(o.textContent) ? '*' : '')); return sc().elements[idxOf('title')].fontId === 'noto-sans-kr' && !/못 불러왔어요/.test(b.innerHTML) && ws.join('/') === '300/400/500/700' || ws.join('/'); });
  T('문서 굵기가 목록에 없으면(600) 그대로 두고 「· 대체」 표시', () => { sc().elements[idxOf('title')].weight = 600; sel('title'); const o = [...w.document.querySelectorAll('[data-ws-tweight] option')].find((x) => x.value === '600'); return !!o && /대체/.test(o.textContent) && o.selected || '없음'; });
  T('굵기 select 700 → 문서 700', () => { fire('[data-ws-tweight]', '700'); return +sc().elements[idxOf('title')].weight === 700; });
  T('자간 슬라이더 0.1 → letterSpacing 0.1 · DOM letter-spacing 0.1em', () => { sel('title'); fire('[data-ws-tls]', '0.1'); const e = sc().elements[idxOf('title')]; sel('title'); const d = w.document.querySelector(`[data-ws-el="${idxOf('title')}"]`); return Math.abs(e.letterSpacing - 0.1) < 1e-9 && /letter-spacing:\s*0\.1em/.test(d.getAttribute('style')) || JSON.stringify([e.letterSpacing, d && d.getAttribute('style')]); });
  T('행간 슬라이더 1.5 → lineHeight 1.5 · 상자 높이(%) = size×1.5×2줄 (textH 가 행간을 봄)', () => { fire('[data-ws-tlh]', '1.5'); const e = sc().elements[idxOf('title')]; const h = w.MK_LIVE.textH(e); return Math.abs(e.lineHeight - 1.5) < 1e-9 && Math.abs(h - e.size * 1.5 * 2) < 1e-6 || JSON.stringify([e.lineHeight, h, e.size]); });
  T('textH 옛 계약 유지: lineHeight 없으면 1.4/줄, 1줄 하한 1.5', () => Math.abs(w.MK_LIVE.textH({ size: 4, text: 'a\nb' }) - 11.2) < 1e-9 && Math.abs(w.MK_LIVE.textH({ size: 4, text: '한 줄' }) - 6) < 1e-9);
  T('Ctrl+Z ×2 → 행간·자간 복귀 · Ctrl+Y → 자간 0.1', () => { key('z', { ctrlKey: true }); key('z', { ctrlKey: true }); const e1 = { ...sc().elements[idxOf('title')] }; key('y', { ctrlKey: true }); const e2 = sc().elements[idxOf('title')]; return Math.abs(e1.lineHeight - 1.04) < 1e-6 && !(Math.abs(+e1.letterSpacing || 0) > 1e-6) && Math.abs(e2.letterSpacing - 0.1) < 1e-9 && +e2.weight === 700 || JSON.stringify([e1, e2]); });
  T('저장 → 재부팅 → 글꼴·fontId·굵기·자간·baseline 유지', () => {
    w.MK_LIVE.saveDoc(doc()); w.MK_LIVE.saveProjects(); const snap = JSON.stringify(doc());
    const d2 = boot(fonts); Object.keys(store).forEach((k) => d2.store[k] = store[k]); d2.w.MK_LIVE.restoreProjects && d2.w.MK_LIVE.restoreProjects();
    const p2 = d2.w.MK_PROJ.get(pid); if (!p2) return '재부팅 뒤 프로젝트 없음'; const t2 = p2.doc.scenes[0].elements.find((e) => e.aid === 'title');
    return JSON.stringify(p2.doc) === snap && t2.font === 'Noto Sans KR' && t2.fontId === 'noto-sans-kr' && +t2.weight === 700 && Math.abs(t2.letterSpacing - 0.1) < 1e-9 && t2.baseline === 0.83 || JSON.stringify(t2);
  });
  T('R154 계약 무손: 요소 28 · 풍경 그룹 1 · 사진 자리', () => sc().elements.length === 28 && Object.keys(sc().groups || {}).length === 1 && !!sc().elements.find((e) => e.role === 'photo-slot'));
}

console.log(`\ntest-round155: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
