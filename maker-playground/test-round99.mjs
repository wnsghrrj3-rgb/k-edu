/* ============================================================
   test-round99.mjs — R99 구조 카드 호버 미리보기: 목업 아닌 진짜 빌드
   ------------------------------------------------------------
   준호: 「마우스를 올리면 어떤 디자인인지 미리보기처럼」.
   MK_PREVIEW가 컴포지션마다 진짜 엔진(buildProject)으로 샘플을
   짓고(자리 사진 = 인라인 SVG 3색조, sampleItems·정체성 텍스트
   포함), 대표 장면 ≤4장을 골라 캐시한다. 화면은 hover 가능 환경
   에서만 팝오버를 띄워 MK_PLAY.sceneHTML(still)로 그린다 —
   R98 장식·테마 토큰이 실물 그대로 미리보기에 나온다.

   계약:
     ① MK_PREVIEW 순수 — audit(자리사진 data URI·색조 교대·
        대표 장면 선정 첫/끝 보존)
     ② build — 전 컴포지션에서 ok + 장면 1~4장 + 캐시 동일 참조
     ③ 진짜 빌드 증거 — 미리보기 장면에 R98 decor 요소·구조 문법
        (카드뉴스 sampleItems 본문) 실림
     ④ 호버 배선 — mouseenter 후 지연 → .vh-pv 팝오버 + 스테이지에
        mkp-scene 렌더 · mouseleave → 소멸
     ⑤ hover 불가(터치) 환경 — 팝오버 미배선 (matchMedia 게이트)
     ⑥ 테마 반영 — 같은 구조라도 미니멀/볼드 미리보기가 다르다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R99_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function boot(hoverable) {
  const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
    { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
  const w = dom.window;
  w.alert = () => {}; w.confirm = () => true;
  Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
  const store = {};
  Object.defineProperty(w, 'localStorage', { value: {
    getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
  w.matchMedia = (q) => ({ matches: hoverable ? true : !/hover:\s*hover/.test(q), media: q, addListener: () => {}, removeListener: () => {} });
  for (const f of [...read('index.html').matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
    try { w.eval(read(f)); } catch (e) {}
  }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}

let pass = 0, fail = 0;
const T = async (name, fn) => {
  try { const r = await fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const w = boot(true);
const P = w.MK_PREVIEW, C = w.MK_COMPOSE;

console.log('--- ① 순수 ---');
await T('T1 모듈 존재 + audit 통과', () => {
  if (!P) return 'MK_PREVIEW 없음';
  const a = P.audit(); return a.ok ? true : a.violations.join(', ');
});

console.log('--- ② build ---');
await T('T2 전 컴포지션 미리보기 성립 (ok + 1~4장)', () => {
  for (const c of C.listCompositions()) {
    const r = P.build(c.id, 'th-minimal');
    if (!r.ok) return c.id + ' 실패';
    if (!r.scenes.length || r.scenes.length > 4) return c.id + ' 장면 ' + r.scenes.length;
  }
  return true;
});
await T('T3 캐시 — 같은 키 재호출 = 동일 참조', () => {
  const a = P.build('cx-cardnews', 'th-minimal'), b = P.build('cx-cardnews', 'th-minimal');
  return a === b ? true : '참조 상이';
});

console.log('--- ③ 진짜 빌드 증거 ---');
await T('T4 미리보기 장면에 R98 decor + 카드뉴스 sampleItems 본문', () => {
  const r = P.build('cx-cardnews', 'th-bold');
  const hasDecor = r.scenes.some((s) => s.elements.some((e) => e.decor === true));
  const texts = r.scenes.map((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|')).join('§');
  const comp = C.getComposition('cx-cardnews');
  const sampleBody = comp && comp.sampleItems && comp.sampleItems[0] && comp.sampleItems[0].body;
  return hasDecor && sampleBody && texts.includes(sampleBody) ? true
    : JSON.stringify({ hasDecor, sampleBody, texts: texts.slice(0, 80) });
});
await T('T5 자리 사진 — 슬라이드쇼 미리보기 미디어가 SVG data URI', () => {
  const r = P.build('cx-slideshow', 'th-minimal');
  const media = r.scenes.flatMap((s) => s.elements).find((e) => e.src);
  return media && /^data:image\/svg\+xml/.test(media.src) ? true : media ? media.src.slice(0, 40) : '미디어 없음';
});

console.log('--- ④ 호버 배선 ---');
await T('T6 enter 후 팝오버 + mkp-scene 렌더 · leave 후 소멸', () => {
  const card = w.document.querySelector('[data-vh-comp="cx-cardnews"]');
  if (!card) return '카드 없음';
  card.dispatchEvent(new w.Event('mouseenter'));
  return new Promise((res) => {
    setTimeout(() => {
      const pop = w.document.querySelector('.vh-pv');
      const scene = pop && pop.querySelector('.vh-pv-stage .mkp-scene');
      if (!pop || !scene) return res('팝오버/장면 미렌더');
      card.dispatchEvent(new w.Event('mouseleave'));
      setTimeout(() => res(w.document.querySelector('.vh-pv') ? '소멸 실패' : true), 30);
    }, 260);
  });
});

console.log('--- ⑤ hover 불가 환경 ---');
await T('T7 터치 세계 — mouseenter를 쏴도 팝오버 없음', () => {
  const w2 = boot(false);
  const card = w2.document.querySelector('[data-vh-comp="cx-cardnews"]');
  if (!card) return '카드 없음';
  card.dispatchEvent(new w2.Event('mouseenter'));
  return new Promise((res) => setTimeout(() =>
    res(w2.document.querySelector('.vh-pv') ? '터치에서 팝오버 노출' : true), 260));
});

console.log('--- ⑥ 테마 반영 ---');
await T('T8 미니멀 vs 볼드 미리보기 장면 상이', () => {
  const a = P.build('cx-ranking', 'th-minimal'), b = P.build('cx-ranking', 'th-bold');
  return JSON.stringify(a.scenes[0].elements) !== JSON.stringify(b.scenes[0].elements) ? true : '동일';
});

console.log(`\n=== R99: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
