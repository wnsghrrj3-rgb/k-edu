/* ============================================================
   test-round90.mjs — R90 재생 애니 결합식: 빈 장면의 정체
   ------------------------------------------------------------
   준호 실기기 보고 4호(영상): 재생 4/4 「소개 3」이 완전히 빈 종이.
   실크롬 해부: 이미지는 로드 완료(640px)인데 요소 computed opacity 0 ·
   animationName "none" — animCss 가 idle(켄번즈·float·pulse) 지연을
   콤마 앞 치환으로 끼워 넣어 첫 선언이 `... both 0.6s,` 꼴 = 시간값 3개
   = CSS 문법 위반 → animation 선언 전체 무효 → 인라인 opacity:0 에
   영원히 갇힘. idle 딸린 모든 요소가 재생에서 투명이었다.

   계약:
     ① 켄번즈 idle — 지연이 두 번째 선언의 제자리에 놓인다
        (`mkp-kb-* <dur>s linear <after>s forwards`), both 뒤 시간값 없음.
     ② float·pulse idle — 같은 정위치(`... ease-in-out <after>s infinite`).
     ③ idle 없는 요소 — 산출 문자열 종전과 동일(회귀 0).
     ④ 유효성 일반칙 — 어떤 조합에서도 각 애니 선언의 시간값은 정확히 2개.
     ⑤ after = delay + dur — idle 은 등장이 끝난 뒤 시작한다(의도 보존).
     ⑥ playAudit ok — 자체 감사(정정본)가 초록.
     ⑦ 정지 렌더(still) 무애니 — 종전 계약 생존.
   실크롬 별도 실증(수치는 정본 기록): 4/4 진입 1.5s 후 opacity 1 ·
   animationName 에 mkp-kb-* 실림.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', url: 'https://x.test/' });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const PL = w.MK_PLAY;
const css = (anim, i) => PL.animCss({ kind: 'image', src: 'data:x', anim }, i || 0, null);
/* 애니 선언 파서 — 각 선언의 <time> 개수를 센다 */
const decls = (s) => {
  const m = s.match(/animation:([^;]+)$/);
  if (!m) return null;
  return m[1].split(',').map((d) => ({ d: d.trim(), times: (d.match(/(^|\s)[\d.]+m?s(\s|$)/g) || []).length }));
};

console.log('--- ①② idle 지연 정위치 ---');
T('T1 켄번즈 — 두 번째 선언 안에 after 지연, both 뒤 시간값 없음', () => {
  const s = css({ preset: 'fade', delay: 0, duration: 0.6, idle: 'kb-zoom-in', idleDur: 4 });
  return /both,mkp-kb-zoom-in [\d.]+s linear 0\.60s forwards$/.test(s) && !/both\s+[\d.]+m?s\s*,/.test(s)
    ? true : s;
});
T('T2 float — 정위치 지연 + infinite', () => {
  const s = css({ preset: 'pop', delay: 0.2, duration: 0.5, idle: 'float' });
  return /both,mkp-idle-float 3\.2s ease-in-out 0\.70s infinite$/.test(s) ? true : s;
});
T('T3 pulse — 정위치 지연 + infinite', () => {
  const s = css({ preset: 'scale', delay: 0, duration: 0.4, idle: 'pulse' });
  return /both,mkp-idle-pulse 2\.6s ease-in-out 0\.40s infinite$/.test(s) ? true : s;
});

console.log('--- ③ idle 없는 요소 회귀 0 ---');
T('T4 무idle 산출 종전과 동일', () => {
  const s = css({ preset: 'fade', delay: 0.3, duration: 0.6 });
  return s === ';opacity:0;animation:mkp-fade 0.6s ease-out 0.3s both' ? true : s;
});
T('T5 kb-static 은 idle 미부착(종전 계약)', () => {
  const s = css({ preset: 'fade', delay: 0, duration: 0.6, idle: 'kb-static' });
  return /both$/.test(s) ? true : s;
});

console.log('--- ④ 유효성 일반칙 — 시간값 정확히 2개 ---');
T('T6 모든 idle 조합에서 각 선언 시간값 2개(문법 유효)', () => {
  const cases = [
    { preset: 'fade', delay: 0, duration: 0.6, idle: 'kb-zoom-in', idleDur: 4 },
    { preset: 'slide', direction: 'left', delay: 0.15, duration: 0.5, idle: 'kb-pan-left', idleDur: 6 },
    { preset: 'pop', delay: 0.2, duration: 0.5, idle: 'float' },
    { preset: 'zoom', delay: 0, duration: 0.8, idle: 'pulse' },
    { preset: 'fade', delay: 0, duration: 0.6 },
  ];
  for (const a of cases) {
    const ds = decls(css(a));
    if (!ds) return '선언 없음: ' + JSON.stringify(a);
    for (const d of ds) if (d.times !== 2) return JSON.stringify({ a, bad: d });
  }
  return true;
});

console.log('--- ⑤ after = delay + dur ---');
T('T7 idle 은 등장이 끝난 시점에 시작한다', () => {
  const s = css({ preset: 'fade', delay: 0.25, duration: 0.35, idle: 'kb-zoom-out', idleDur: 5 });
  return / linear 0\.60s forwards$/.test(s) ? true : s;
});

console.log('--- ⑥⑦ 자체 감사·정지 렌더 ---');
T('T8 playAudit ok (정정본 감사 초록)', () => {
  const a = PL.playAudit();
  return a.ok ? true : a.violations.join(' / ');
});
T('T9 정지 렌더(still)에 애니 없음 — 종전 계약 생존', () => {
  const h = PL.sceneHTML({ duration: 3, background: '#fff',
    elements: [{ kind: 'image', src: 'data:x', x: 0, y: 0, w: 50, h: 50, anim: { preset: 'fade', idle: 'kb-zoom-in' } }] }, { still: true });
  return h.includes('animation:') ? h.slice(0, 120) : true;
});

console.log('');
console.log('test-round90: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
