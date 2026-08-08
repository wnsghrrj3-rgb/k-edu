/* ============================================================
   test-round88.mjs — R88 구조 카드 선택 → 다음 단계 가시화
   ------------------------------------------------------------
   준호 실기기 보고 2호: Video 화면에서 「템플릿(구조 카드)을 클릭해도
   반응이 없다」. 실크롬 재현 결과 클릭은 살아 있었다 — 선택 테두리가
   붙고 패널(#vhPanel)도 생기지만, 패널이 카드 그리드 아래(실측 top
   1090px, 뷰포트 800px)에 그려져 화면 밖이었다. 보이지 않는 반응은
   사용자에게 없는 반응이다.

   계약:
     ① 카드 클릭 → 패널이 실존하고, scrollIntoView 가 정확히 그 패널을
        표적으로 호출된다(화면 안으로 데려간다).
     ② 다른 카드로 갈아타도 같은 동작 — 매 선택마다 데려간다.
     ③ scrollIntoView 가 없는 환경(구형·jsdom 기본)에서도 예외 0 (가드).
     ④ 패널의 다음 단계 CTA 가 실존한다 — 상위 층이 pick 버튼을
        스테이지/열기 버튼으로 대체하므로, 셋 중 하나가 반드시 있다.
     ⑤ 선택 상태·카드 강조는 종전 그대로(회귀 0).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><html><body><div class="pg-shell"><nav id="pgNav"></nav><main><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></main></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

/* scrollIntoView 스파이 — jsdom 기본은 미구현이라, 계약 ③(가드)을 먼저
   무스파이 세계에서 확인한 뒤 스파이를 심어 ①②를 확인한다. */
const html = read('index.html');
const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

w.PG.go('video');
const body = () => w.document;

console.log('--- ③ 가드 — scrollIntoView 없는 세계에서 예외 0 ---');
T('T1 jsdom 기본(스파이 전) 카드 클릭이 던지지 않는다', () => {
  delete w.Element.prototype.scrollIntoView; /* jsdom 버전에 따라 no-op 이 있을 수 있어 명시 제거 */
  const card = body().querySelector('[data-vh-comp]');
  if (!card) return '카드 없음';
  card.click();
  return body().querySelector('#vhPanel') ? true : '패널 미생성';
});

/* 스파이 장착 — 이후 클릭부터 표적 기록 */
const scrolled = [];
w.Element.prototype.scrollIntoView = function () { scrolled.push(this.id || this.className || this.tagName); };

console.log('--- ① 클릭 → 패널로 데려간다 ---');
T('T2 카드 클릭 → 패널 실존 + scrollIntoView 표적 = vhPanel', () => {
  scrolled.length = 0;
  const cards = [...body().querySelectorAll('[data-vh-comp]')];
  const other = cards.find((b) => !b.classList.contains('on')) || cards[0];
  other.click();
  const p = body().querySelector('#vhPanel');
  return p && scrolled.includes('vhPanel') ? true
    : JSON.stringify({ panel: !!p, scrolled });
});

console.log('--- ② 갈아타기도 매번 ---');
T('T3 다른 카드로 갈아타도 다시 데려간다', () => {
  scrolled.length = 0;
  const cards = [...body().querySelectorAll('[data-vh-comp]')];
  const other = cards.find((b) => !b.classList.contains('on'));
  if (!other) return '갈아탈 카드 없음';
  other.click();
  return scrolled.includes('vhPanel') ? true : JSON.stringify(scrolled);
});
T('T4 같은 카드 재클릭 = 선택 해제(제품 계약) — 패널 제거·스크롤 미호출·예외 0', () => {
  scrolled.length = 0;
  const on = body().querySelector('[data-vh-comp].on');
  if (!on) return '선행 선택 없음';
  on.click(); /* select 는 토글 — 같은 id 재클릭이면 해제된다 */
  const panelGone = !body().querySelector('#vhPanel');
  const noneOn = body().querySelectorAll('[data-vh-comp].on').length === 0;
  return panelGone && noneOn && scrolled.length === 0 ? true
    : JSON.stringify({ panelGone, noneOn, scrolled });
});

console.log('--- ④ 다음 단계 CTA 실존 ---');
T('T5 패널에 pick·스테이지·열기 중 하나가 반드시 있다', () => {
  if (!body().querySelector('#vhPanel')) body().querySelector('[data-vh-comp]').click(); /* T4 해제 후 재선택 */
  const p = body().querySelector('#vhPanel');
  if (!p) return '패널 없음';
  const cta = p.querySelector('[data-vh-pick], [data-vh-open-stage], [data-vh-build], .vh-stage, [data-vh-smart]');
  return cta ? true : p.innerHTML.slice(0, 120);
});

console.log('--- ⑤ 선택 상태 회귀 0 ---');
T('T6 클릭한 카드가 강조(on)되고 하나만 강조된다', () => {
  const cards = [...body().querySelectorAll('[data-vh-comp]')];
  const other = cards.find((b) => !b.classList.contains('on'));
  other.click();
  const ons = body().querySelectorAll('[data-vh-comp].on');
  return ons.length === 1 && ons[0].dataset.vhComp === other.dataset.vhComp ? true
    : '강조 ' + ons.length;
});
T('T7 선택이 허브 상태(H.st.comp)에 남는다', () => {
  const on = body().querySelector('[data-vh-comp].on');
  return w.MK_VIDHUB.st.comp === on.dataset.vhComp ? true
    : w.MK_VIDHUB.st.comp + ' vs ' + on.dataset.vhComp;
});

console.log('');
console.log('test-round88: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
