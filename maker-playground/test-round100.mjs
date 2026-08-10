/* ============================================================
   test-round100.mjs — R100 팔레트 확장: 초록·회색 세상에 여섯 색
   ------------------------------------------------------------
   준호: 「색상이 죄다 초록이나 짙은 회색뿐」. 원인 = 테마 2종.
   R100 = 신규 테마 6종(바다·노을·자두·라벤더·청록·로즈) + 전 테마
   대비 감사(accent↔onDark ≥3.0 대형글자 AA · dark↔onDark ≥7 ·
   paper↔ink ≥7) + th-bold 액센트 보정(#D97757 2.95 → #D0693F
   3.44) + 테마 칩 색점 스와치 + 미리보기·데코 연동.

   계약:
     ① 테마 8종 이상 등록·id 유일·swatch 동봉
     ② 대비 감사 — 전 테마 합격 (MK_THEMES.audit)
     ③ th-bold 보정 실측 — accent ↔ onDark ≥ 3.0
     ④ 빌드 관통 — th-ocean 카드뉴스 표지 배경 = 바다 액센트,
        글자 = 바다 onDark
     ⑤ 데코 연동 — 신규 테마 장식 색이 그 테마 토큰에서 나온다
     ⑥ 칩 — 테마 수만큼 + 색점 스와치 렌더 (R53 칩 수 계약 존속)
     ⑦ 미리보기 연동 — th-ocean vs th-rose 미리보기 장면 상이
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R100_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
for (const f of [...read('index.html').matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const TH = w.MK_THEMES, C = w.MK_COMPOSE;

console.log('--- ①~③ 팔레트 규율 ---');
T('T1 테마 8종 이상 · id 유일 · swatch 동봉', () => {
  const list = C.listThemes();
  const ids = new Set(list.map((t) => t.id));
  const newOnes = ['th-ocean', 'th-sunset', 'th-plum', 'th-lavender', 'th-teal', 'th-rose'];
  return list.length >= 8 && ids.size === list.length
    && newOnes.every((id) => ids.has(id)) && list.every((t) => t.swatch && t.swatch.accent)
    ? true : JSON.stringify({ n: list.length, ids: [...ids] });
});
T('T2 대비 감사 — 전 테마 합격', () => {
  if (!TH) return 'MK_THEMES 없음';
  const a = TH.audit(); return a.ok ? true : a.violations.join(', ');
});
T('T3 th-bold 보정 — accent↔onDark ≥ 3.0 (구 2.95)', () => {
  const b = C.listThemes().find((t) => t.id === 'th-bold');
  const c = TH.contrast(b.swatch.accent, b.swatch.onDark);
  return c >= 3.0 && b.swatch.accent.toUpperCase() === '#D0693F' ? true : JSON.stringify({ accent: b.swatch.accent, c: +c.toFixed(2) });
});

console.log('--- ④~⑤ 빌드·데코 관통 ---');
T('T4 th-ocean 카드뉴스 — 표지 배경·글자색이 바다 토큰', () => {
  const r = C.buildProject('cx-cardnews', 'th-ocean', { medias: [], texts: { title: '바다' }, items: [{ body: '한 장' }] });
  if (!r.ok) return r.why;
  const cover = r.doc.scenes[0];
  const txt = cover.elements.find((e) => e.kind === 'text');
  return cover.background === '#2D6FB3' && txt && txt.color === '#F2F7FC' ? true
    : JSON.stringify({ bg: cover.background, col: txt && txt.color });
});
T('T5 데코 연동 — th-teal 장식이 청록 액센트 계열', () => {
  const r = C.buildProject('cx-cardnews', 'th-teal', { medias: [], texts: { title: '청록' }, items: [{ body: '한 장' }] });
  if (!r.ok) return r.why;
  const card = r.doc.scenes.find((s) => s.role === 'list-item');
  const dec = card.elements.filter((e) => e.decor);
  const hit = dec.some((e) => /31,122,114|#1F7A72/i.test(String(e.fill))); /* rgb(31,122,114) = #1F7A72 */
  return dec.length && hit ? true : JSON.stringify(dec.map((e) => e.fill));
});

console.log('--- ⑥ 칩 ---');
T('T6 테마 칩 = 테마 수 + 색점 스와치', () => {
  const H = w.MK_VIDHUB;
  w.PG.go('video');
  H.select('cx-cardnews');
  w.PG.go('video');
  const chips = [...w.document.querySelectorAll('[data-vh-theme]')];
  const n = C.listThemes().length;
  const swatched = chips.filter((c) => /border-radius:50%/.test(c.innerHTML)).length;
  const ocean = chips.find((c) => c.dataset.vhTheme === 'th-ocean');
  return chips.length === n && swatched === n && ocean && /#2D6FB3/i.test(ocean.innerHTML) ? true
    : JSON.stringify({ chips: chips.length, n, swatched });
});

console.log('--- ⑦ 미리보기 연동 ---');
T('T7 th-ocean vs th-rose 미리보기 상이 + 각 토큰 반영', () => {
  const P = w.MK_PREVIEW;
  const a = P.build('cx-ranking', 'th-ocean'), b = P.build('cx-ranking', 'th-rose');
  if (!a.ok || !b.ok) return 'build 실패';
  const bgA = a.scenes[0].background, bgB = b.scenes[0].background; /* 랭킹 표지 = dark 배경 */
  return bgA !== bgB && bgA === '#14263A' && bgB === '#311E23' ? true
    : JSON.stringify({ bgA, bgB });
});

console.log(`\n=== R100: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
