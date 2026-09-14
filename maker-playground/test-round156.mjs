/* R156 — 타이포 프리셋 UI(텍스트 패널 6칩) + 로드 실패 「다시 시도」 (jsdom)
   ① retry API(STATUS 지우고 출처 <link> 새로 붙여 한 번 더 — 자동 재시도는 여전히 없음)
   ② 프리셋 6칩(등록부 PRESETS 와 1:1 · 일괄 적용 · 켜짐 표시 · Undo · 저장 왕복 · 새 칸 0)
   ③ 「다시 시도」 버튼(failed 일 때만 · 눌러서 loaded → ⚠ 사라짐) ④ 배선·버스터·회귀 */
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { JSDOM } from 'jsdom';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let pass = 0, fail = 0;
const T = (n, fn) => { try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + ' → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + n + ' → ERROR ' + e.message); } };
const TA = async (n, fn) => { try { const r = await fn(); if (r === true) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + ' → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + n + ' → ERROR ' + e.message); } };

/* R155 와 같은 가짜 document.fonts — check 는 face 가 없는 family 에도 true(브라우저 규약) */
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
  const dom = new JSDOM('<!doctype html><html><head></head><body><div class="pg-shell"><nav id="pgNav"></nav><main><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></main></div></body></html>',
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
const ALL = [{ family: 'Noto Sans KR', weight: 400 }, { family: 'Noto Sans KR', weight: 700 }, { family: 'Noto Sans KR', weight: 300 }, { family: 'Noto Sans KR', weight: 500 }, { family: 'Cormorant Garamond', weight: 400 }, { family: 'Pretendard', weight: 400 }, { family: 'Pretendard', weight: 700 }];

console.log('--- ① retry API ---');
{
  const fonts = fakeFonts(ALL);
  const { w } = boot(fonts); const FR = w.MK_FONTREG;
  T('retry·retryEl 이 열려 있다', () => typeof FR.retry === 'function' && typeof FR.retryEl === 'function');
  await TA('face 없는 글꼴 → failed', async () => { const r = await FR.ensure([{ family: 'Gowun Batang' }], { timeout: 250 }); return !r.ok && FR.STATUS['Gowun Batang|400|normal'] === 'failed' || JSON.stringify(r); });
  await TA('retry: STATUS 를 지우고 다시 시도 — 그 사이 face 가 생기면 loaded', async () => {
    const p = FR.retry([{ family: 'Gowun Batang' }], { timeout: 1500 });
    await tick(60); fonts.add({ family: 'Gowun Batang', weight: '400', style: 'normal' });
    const r = await p; return r.ok && FR.STATUS['Gowun Batang|400|normal'] === 'loaded' && FR.failed().length === 0 || JSON.stringify({ r, st: FR.STATUS['Gowun Batang|400|normal'] });
  });
  await TA('retry 는 구글 <link> 를 떼고 새로 붙인다(kmretry 표식 · 개수는 그대로)', async () => {
    const sel = 'link[href*="fonts.googleapis.com"]';
    await FR.ensure([{ family: 'Gaegu' }], { timeout: 200 });
    const before = [...w.document.querySelectorAll(sel)].filter((l) => /Gaegu/.test(l.href));
    await FR.retry([{ family: 'Gaegu' }], { timeout: 200 });
    const after = [...w.document.querySelectorAll(sel)].filter((l) => /Gaegu/.test(l.href));
    return before.length === 1 && after.length === 1 && /kmretry=/.test(after[0].href) && after[0] !== before[0] || JSON.stringify({ b: before.length, a: after.map((l) => l.href) });
  });
  await TA('retry() 인자 없이 = 실패한 것 전부', async () => {
    await FR.ensure([{ family: 'Do Hyeon' }, { family: 'Jua' }], { timeout: 200 });
    const f0 = FR.failed().slice(); if (f0.length < 2) return '실패 준비 안 됨: ' + JSON.stringify(f0);
    f0.forEach((k) => fonts.add({ family: k.split('|')[0], weight: k.split('|')[1], style: 'normal' }));
    const r = await FR.retry(null, { timeout: 800 });
    return r.ok && r.loaded.length === f0.length && FR.failed().length === 0 || JSON.stringify({ f0, r });
  });
  await TA('retryEl 은 요소의 글꼴 값을 건드리지 않는다', async () => {
    const el = { kind: 'text', text: '가', font: 'Nanum Pen Script', fontId: 'nanum-pen-script', weight: 400 };
    const before = JSON.stringify(el);
    await FR.retryEl(el, { timeout: 200 });
    return JSON.stringify(el) === before && FR.STATUS['Nanum Pen Script|400|normal'] === 'failed' || JSON.stringify([el, FR.STATUS['Nanum Pen Script|400|normal']]);
  });
  await TA('자동 재시도는 여전히 없다 — ensure 를 다시 불러도 failed 는 그대로(load 호출 수 불변)', async () => {
    const n0 = fonts.calls.filter((s) => /Nanum Pen/.test(s)).length;
    const req = FR.requiredOf([{ kind: 'text', font: 'Nanum Pen Script' }]);
    const pending = req.filter((r) => { const st = FR.STATUS[`${r.family}|${r.weight}|${r.style}`]; return !st || st === 'unloaded'; });
    const n1 = fonts.calls.filter((s) => /Nanum Pen/.test(s)).length;
    return pending.length === 0 && n1 === n0 || JSON.stringify({ pending, n0, n1 });
  });
}

console.log('--- ②③ 워크스페이스: 프리셋 칩 · 다시 시도 ---');
{
  const fonts = fakeFonts(ALL);
  const { w, store } = boot(fonts); const FR = w.MK_FONTREG; const WS = w.MK_WS.state;
  let pid; const doc = () => w.MK_PROJ.get(pid).doc; const sc = () => doc().scenes[0];
  const idxOf = (aid) => sc().elements.findIndex((e) => e.aid === aid);
  const sel = (aid) => { const i = idxOf(aid); WS.gsel = null; WS.msel = []; WS.inGrp = null; WS.sel = { type: 'text', idx: i }; w.PG.render(); return i; };
  const el = () => sc().elements[idxOf('title')];
  const key = (k, o) => w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, ...(o || {}) }));
  const body = () => w.document.getElementById('pgBody');
  const p = w.MK_PROJ.createFromTemplate(ID); pid = p.projectId; w.MK_PROJ.open(pid);
  await tick(80); sel('title');

  T('텍스트 패널에 「타이포 프리셋」 6칩 — 등록부 PRESETS 와 1:1(순서까지)', () => {
    const chips = [...body().querySelectorAll('.cx-tpres .cx-tpre')];
    const ids = chips.map((c) => c.dataset.wsTpreset);
    return chips.length === 6 && ids.join(',') === FR.PRESETS.map((x) => x.id).join(',') && /타이포 프리셋/.test(body().innerHTML) || ids.join(',');
  });
  T('칩 라벨은 한글 이름, 미리보기는 그 글꼴·굵기·자간으로 그린다', () => {
    const c = body().querySelector('[data-ws-tpreset="tp-warm-korean-title"]');
    const st = c.querySelector('span').getAttribute('style');
    return /따뜻한 한글 제목/.test(c.textContent) && /Gowun Batang/.test(st) && /font-weight:\s*700/.test(st) && /letter-spacing:\s*-0\.01em/.test(st) || st;
  });
  T('아무 칩도 안 켜져 있다(패키지 기본값은 프리셋과 다름)', () => body().querySelectorAll('.cx-tpre.on').length === 0);
  T('칩 클릭 → 글꼴·굵기·크기·행간·자간·대문자 한 번에', () => {
    body().querySelector('[data-ws-tpreset="tp-premium-serif-hero"]').click();
    const e = el(); const p1 = FR.PRESETS[0];
    return e.fontId === 'cormorant-garamond' && e.font === 'Cormorant Garamond' && +e.weight === 400 && e.size === p1.fontSizeRatio
      && Math.abs(e.lineHeight - 1.04) < 1e-9 && Math.abs(+e.letterSpacing) < 1e-9 && e.textTransform === 'uppercase' || JSON.stringify(e);
  });
  T('적용한 칩이 켜짐으로 보인다(문서에 새 칸을 만들지 않고 값으로 판정)', () => {
    sel('title'); const on = [...body().querySelectorAll('.cx-tpre.on')].map((c) => c.dataset.wsTpreset);
    return on.length === 1 && on[0] === 'tp-premium-serif-hero' || JSON.stringify(on);
  });
  T('요소에 프리셋 이름 같은 새 칸이 생기지 않는다', () => { const k = Object.keys(el()); return !k.some((x) => /preset|tpreset/i.test(x)) || JSON.stringify(k); });
  await TA('둘째 칩(모던 굵은 배너) → 프리텐다드 · 굵기는 글꼴 보유분으로 스냅 · 대문자 해제 · 자간 -0.02', async () => {
    sel('title'); body().querySelector('[data-ws-tpreset="tp-modern-bold-banner"]').click(); await tick(60);
    const e = el(); const w8 = FR.nearestWeight(FR.get('pretendard'), 800);
    return e.fontId === 'pretendard' && +e.weight === w8 && e.textTransform === undefined && Math.abs(e.letterSpacing + 0.02) < 1e-9 && e.size === 14 || JSON.stringify(e);
  });
  T('Ctrl+Z ×2 → 프리셋 적용 전으로 복귀(코모런트 400 · 원래 크기)', () => {
    key('z', { ctrlKey: true }); key('z', { ctrlKey: true });
    const e = el(); return e.fontId === 'cormorant-garamond' && e.size !== 18 && e.size !== 14 && e.textTransform === undefined || JSON.stringify(e);
  });
  T('Ctrl+Y ×2 → 다시 모던 굵은 배너', () => { key('y', { ctrlKey: true }); key('y', { ctrlKey: true }); const e = el(); return e.fontId === 'pretendard' && e.size === 14 || JSON.stringify(e); });
  T('저장 → 재부팅 → 프리셋으로 얹은 값 전부 유지', () => {
    w.MK_LIVE.saveDoc(doc()); w.MK_LIVE.saveProjects(); const snap = JSON.stringify(doc());
    const d2 = boot(fonts); Object.keys(store).forEach((k) => d2.store[k] = store[k]); d2.w.MK_LIVE.restoreProjects && d2.w.MK_LIVE.restoreProjects();
    const p2 = d2.w.MK_PROJ.get(pid); if (!p2) return '재부팅 뒤 프로젝트 없음';
    const t2 = p2.doc.scenes[0].elements.find((e) => e.aid === 'title');
    return JSON.stringify(p2.doc) === snap && t2.fontId === 'pretendard' && +t2.weight === FR.nearestWeight(FR.get('pretendard'), 800) && t2.size === 14 && Math.abs(t2.lineHeight - 1.1) < 1e-9 || JSON.stringify(t2);
  });
  T('로드된 글꼴에는 ⚠ 도 「다시 시도」 도 없다', () => { sel('title'); return !/못 불러왔어요/.test(body().innerHTML) && !body().querySelector('[data-ws-fontretry]'); });
  await TA('face 없는 글꼴로 바꾸면 ⚠ 와 함께 「다시 시도」 버튼이 뜬다', async () => {
    body().querySelector('[data-ws-tfontb="Gowun Batang"]').click();
    for (let i = 0; i < 300 && FR.statusOf(el()) !== 'failed'; i++) await tick(50);
    await tick(80); sel('title');
    const b = body().querySelector('[data-ws-fontretry]');
    return /못 불러왔어요/.test(body().innerHTML) && !!b && /다시 시도/.test(b.textContent) || '버튼 없음';
  });
  await TA('「다시 시도」 클릭 → 이번엔 face 가 있어 loaded · ⚠ 사라짐 · 문서 글꼴 그대로', async () => {
    FR.get('gowun-batang').weights.forEach((wt) => fonts.add({ family: 'Gowun Batang', weight: String(wt), style: 'normal' }));
    body().querySelector('[data-ws-fontretry]').click();
    for (let i = 0; i < 200 && FR.statusOf(el()) !== 'loaded'; i++) await tick(50);
    await tick(80); sel('title');
    return FR.statusOf(el()) === 'loaded' && !/못 불러왔어요/.test(body().innerHTML) && el().font === 'Gowun Batang' && el().fontId === 'gowun-batang' || JSON.stringify([FR.statusOf(el()), el().font]);
  });
  T('R154 계약 무손: 요소 28 · 풍경 그룹 1 · 사진 자리', () => sc().elements.length === 28 && Object.keys(sc().groups || {}).length === 1 && !!sc().elements.find((e) => e.role === 'photo-slot'));
}

console.log('--- ④ 배선·버스터 ---');
{
  const idx = read('index.html'), mk = read('../maker/index.html'), css = read('playground.css'), wsjs = read('screens/workspace.js');
  T('버스터: fontreg·workspace·css 가 두 index 에서 같은 값', () => {
    const g = (s, re) => (s.match(re) || [])[1];
    const a = [g(idx, /data\/fontreg\.js\?v=([0-9a-z]+)/), g(idx, /screens\/workspace\.js\?v=([0-9a-z]+)/), g(idx, /playground\.css\?v=([0-9a-z]+)/)];
    const b = [g(mk, /data\/fontreg\.js\?v=([0-9a-z]+)/), g(mk, /screens\/workspace\.js\?v=([0-9a-z]+)/), g(mk, /playground\.css\?v=([0-9a-z]+)/)];
    return a.every(Boolean) && a.join('/') === b.join('/') && a[0] === '20260915b' || JSON.stringify([a, b]);
  });
  T('CSS 에 .cx-tpres/.cx-tpre/.cx-tpre.on/.cx-retry', () => /\.cx-tpres\{/.test(css) && /\.cx-tpre\{/.test(css) && /\.cx-tpre\.on\{/.test(css) && /\.cx-retry\{/.test(css));
  T('워크스페이스가 등록부 API 로만 얹는다(프리셋 값 하드코딩 0)', () => /MK_FONTREG\.PRESETS|FR\.PRESETS/.test(wsjs) && /applyPreset/.test(wsjs) && !/tp-premium-serif-hero/.test(wsjs));
  T('「다시 시도」 는 retryEl 을 쓴다(자동 재시도 코드 아님)', () => /data-ws-fontretry/.test(wsjs) && /FR\.retryEl\(el\)/.test(wsjs));
  const { w } = boot(fakeFonts(ALL));
  T('audit 그대로 — 등록부 11종 · Preset 6종', () => { const a = w.MK_FONTREG.audit(); return a.ok && a.fonts === 11 && a.presets === 6 || JSON.stringify(a); });
}

console.log(`\ntest-round156: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
