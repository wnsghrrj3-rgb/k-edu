/* ============================================================
   test-round87.mjs — R87 제품 동선 라우팅 개방 (실기기 피드백 상환)
   ------------------------------------------------------------
   준호 실기기 보고: /maker 홈에서 「눌러도 아무 반응이 없다」.
   원인: R77 화이트리스트가 내비 목록(10종)으로 라우팅까지 재단 —
   create(칩)·workspace(열기)·projects(이어서)·animation(워크스페이스)은
   내비 미등재가 의도였을 뿐 제품 동선의 본체인데, 가드가 전부 home으로
   튕겨 화면이 안 바뀌었다(이미 home이라 무반응처럼 보임).
   R80 감사는 진입 문구·데이터만 봤고, 깃발 켠 상태로 눌러본 잣대가 0이었다.

   계약:
     ① 깃발 켠 부팅에서 유형 칩 실클릭 → create 화면 도달.
     ② 딥링크·go 직접 호출로도 create·workspace·projects·animation 통과.
     ③ 「이어서 만들기」 실경로: 프로젝트 open → workspace 도달.
     ④ AI 초안 「열기」 실배선 → workspace 도달.
     ⑤ 검수 화면 차단은 그대로: foundations·components·admin·market 등 → home.
     ⑥ 제품 내비 출력 무변: 종전 10종 그대로, create 등 4종 버튼 미표시.
     ⑦ 무깃발 부팅 무영향: 검수 환경은 어떤 화면이든 그대로 간다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function boot(product) {
  const dom = new JSDOM('<!doctype html><html><body><div class="pg-shell"><nav id="pgNav"></nav><main><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></main></div></body></html>',
    { runScripts: 'outside-only', url: 'https://x.test/', pretendToBeVisual: true });
  const w = dom.window;
  w.alert = () => {}; w.confirm = () => true;
  Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
  const store = {};
  Object.defineProperty(w, 'localStorage', { value: {
    getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
    key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });
  if (product) w.MK_PRODUCT = true;
  const html = read('index.html');
  const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
  for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const P = boot(true);   /* 제품 세계 */
const F = boot(false);  /* 검수 세계 */

console.log('--- ① 실클릭 — 칩이 실제로 데려간다 ---');
T('T1 홈이 그려지고 유형 칩 6개가 있다', () => {
  P.PG.go('home');
  const n = P.document.querySelectorAll('[data-h2-chip]').length;
  return n === 6 ? true : '칩 ' + n;
});
T('T2 칩 클릭 → create 화면 도달 (홈 되튕김 아님)', () => {
  P.PG.go('home');
  const chip = P.document.querySelector('[data-h2-chip]');
  chip.click();
  return P.PG.state.screen === 'create' ? true : P.PG.state.screen;
});
T('T3 도달한 create는 칩의 종류를 승계한다 (Step2 직행)', () => {
  P.PG.go('home');
  const chip = P.document.querySelector('[data-h2-chip]');
  const want = chip.dataset.h2Chip;
  chip.click();
  const c = P.PG.state.create || {};
  return c.type === want && c.step === 2 ? true : JSON.stringify(c);
});

console.log('--- ② 라우팅 개방 4종 ---');
for (const k of ['create', 'workspace', 'projects', 'animation']) {
  T('T4-' + k + ' go(\'' + k + '\') 통과', () => {
    P.PG.go(k);
    return P.PG.state.screen === k ? true : P.PG.state.screen;
  });
}
T('T5 딥링크(hash) 경로도 통과한다', () => {
  P.location.hash = '#/create';
  P.window ? null : null;
  P.dispatchEvent(new P.Event('hashchange'));
  return P.PG.state.screen === 'create' ? true : P.PG.state.screen;
});

console.log('--- ③ 이어서 만들기 실경로 ---');
T('T6 프로젝트 open → workspace 도달', () => {
  const t = P.MK_TPL.list()[0];
  const doc = { title: '실경로 검증', scenes: [{ id: 's1', elements: [] }], meta: {} };
  const p = P.MK_PROJ.createFromDoc(doc, doc.title, { action: '하니스' });
  P.PG.go('home');
  P.MK_PROJ.open(p.projectId);
  return P.PG.state.screen === 'workspace' ? true : P.PG.state.screen;
});

console.log('--- ④ AI 초안 「열기」 실배선 ---');
/* runAi 는 240ms 단계 연출(setTimeout 사슬) — 실타이머로 카드가 뜰 때까지 기다린다 */
await (async () => {
  let r;
  try {
    P.PG.go('home');
    const inp = P.document.querySelector('#h2Ai');
    const form = P.document.querySelector('#h2Form');
    if (!inp || !form) r = '폼 없음';
    else {
      inp.value = '여름 방학 안전 안내 카드뉴스 만들어줘';
      form.dispatchEvent(new P.Event('submit', { bubbles: true, cancelable: true }));
      let open = null;
      for (let i = 0; i < 30 && !open; i++) {
        await new Promise((res) => setTimeout(res, 120));
        open = P.document.querySelector('[data-h2-ai-open]');
      }
      if (!open) r = 'AI 초안 카드 미생성';
      else { open.click(); r = P.PG.state.screen === 'workspace' ? true : P.PG.state.screen; }
    }
  } catch (e) { r = 'ERROR ' + e.message; }
  if (r === true) { pass++; console.log('  ✓ T7 AI 초안 생성 → 열기 클릭 → workspace 도달'); }
  else { fail++; console.log('  ✗ T7 AI 초안 생성 → 열기 클릭 → workspace 도달  → ' + r); }
})();

console.log('--- ⑤ 검수 화면 차단 유지 ---');
for (const k of ['foundations', 'components', 'admin', 'market', 'flow', 'dls']) {
  T('T8-' + k + ' 여전히 home 튕김', () => {
    P.PG.go('home'); P.PG.go(k);
    return P.PG.state.screen === 'home' ? true : P.PG.state.screen;
  });
}

console.log('--- ⑥ 내비 출력 무변 ---');
T('T9 제품 내비 버튼은 종전 10종 그대로 — create 등 4종 미표시', () => {
  P.PG.go('home');
  const keys = [...P.document.querySelectorAll('#pgNav [data-nav]')].map((b) => b.dataset.nav);
  const extra = keys.filter((k) => ['create', 'workspace', 'projects', 'animation'].includes(k));
  const want = ['home', 'library', 'templates', 'assets', 'brand', 'editor', 'video', 'photo', 'ai', 'export'];
  return extra.length === 0 && want.every((k) => keys.includes(k)) ? true
    : JSON.stringify({ extra, keys });
});

console.log('--- ⑦ 무깃발(검수) 세계 무영향 ---');
for (const k of ['create', 'workspace', 'foundations', 'components']) {
  T('T10-' + k + ' 검수 세계는 어디든 간다', () => {
    F.PG.go(k);
    return F.PG.state.screen === k ? true : F.PG.state.screen;
  });
}

console.log('');
console.log('test-round87: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
