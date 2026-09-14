/* R153 — 학생 시야 내비·홈 칩 (2026-09-14, 준호 확정)
   홈 · 만들기 · 내 작업 · 내 가방 / 칩 6 (포스터·카드·발표·영상·상장·그냥 그리기)
   · 3D 칩은 학생 시야에서 숨김 · 교사에게만 「전체 보기」 토글 · ?nav=full */
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { JSDOM } from 'jsdom';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
function boot({ teacher = false, search = '' } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div class="pg-shell"><nav id="pgNav"></nav><main><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></main></div></body></html>',
    { runScripts: 'outside-only', url: 'https://x.test/maker/' + search, pretendToBeVisual: true });
  const w = dom.window; w.alert = () => {}; w.confirm = () => true;
  Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
  const store = {};
  Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
  w.MK_PRODUCT = true; if (teacher) w.KEDU_BACK = { role: 'teacher' };
  const html = read('index.html');
  const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
  for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}
let pass = 0, fail = 0;
const T = (n, fn) => { try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + ' → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + n + ' → ERROR ' + e.message); } };
const navKeys = (w) => [...w.document.querySelectorAll('#pgNav [data-nav]')].map((b) => b.dataset.nav);
const navTxt = (w) => [...w.document.querySelectorAll('#pgNav [data-nav] .txt')].map((b) => b.textContent);

const S = boot();
T('학생: 내비 4개 = home·make·projects·assets', () => JSON.stringify(navKeys(S)) === JSON.stringify(['home', 'make', 'projects', 'assets']) || JSON.stringify(navKeys(S)));
T('학생: 내비 글자 = 홈·만들기·내 작업·내 가방', () => JSON.stringify(navTxt(S)) === JSON.stringify(['홈', '만들기', '내 작업', '내 가방']) || JSON.stringify(navTxt(S)));
T('학생: 전체 보기 토글 없음', () => !S.document.querySelector('[data-navmode]'));
T('학생: 홈 칩 6 = 포스터·카드·발표·영상·상장·그냥 그리기', () => {
  const t = [...S.document.querySelectorAll('.h2-chip')].map((b) => b.textContent.trim());
  return JSON.stringify(t) === JSON.stringify(['포스터', '카드', '발표', '영상', '상장', '그냥 그리기']) || JSON.stringify(t);
});
T('학생: 3D 상장·3D 장면 칩 숨김', () => !S.document.querySelector('[data-h2-award3d]') && !S.document.querySelector('[data-scene3d]'));
T('학생: 헤더 링크는 「내 작업」 하나', () => { const l = [...S.document.querySelectorAll('#h2Header .h2-link')].map((b) => b.textContent); return JSON.stringify(l) === JSON.stringify(['내 작업']) || JSON.stringify(l); });
T('칩 「상장」 → create 2단계 print', () => { [...S.document.querySelectorAll('[data-h2-chip]')].find((b) => b.textContent === '상장').click(); const c = S.PG.state.create; return S.PG.state.screen === 'create' && c.type === 'print' && c.step === 2 || JSON.stringify(c); });
T('「그냥 그리기」 → 빈 장면 프로젝트 만들어 workspace 도달', () => {
  S.PG.go('home'); const before = S.MK_PROJ.list('recent').length;
  S.document.querySelector('[data-h2-blank]').click();
  const cur = S.MK_PROJ.current();
  return S.PG.state.screen === 'workspace' && S.MK_PROJ.list('recent').length === before + 1 && cur.doc.scenes[0].elements.length === 0 || S.PG.state.screen;
});
T('내비 「만들기」 = 만들던 것이 있으면 그 작업(workspace)', () => { S.PG.go('home'); S.document.querySelector('#pgNav [data-nav="make"]').click(); return S.PG.state.screen === 'workspace' || S.PG.state.screen; });
T('내비 「만들기」 는 workspace·create 에서 on', () => S.document.querySelector('#pgNav [data-nav="make"]').classList.contains('on'));
T('숨긴 화면 라우트는 살아 있다 (brand·video·library)', () => { S.PG.go('brand'); const a = S.PG.state.screen; S.PG.go('video'); const b = S.PG.state.screen; S.PG.go('library'); const c = S.PG.state.screen; return a === 'brand' && b === 'video' && c === 'library' || [a, b, c].join(); });
T('검수 화면은 여전히 home 튕김', () => { S.PG.go('audit'); return S.PG.state.screen === 'home'; });

const F = boot();
T('만든 것 없을 때 「만들기」 → create 1단계(종류 고르기)', () => { F.document.querySelector('#pgNav [data-nav="make"]').click(); return F.PG.state.screen === 'create' && F.PG.state.create.step === 1 || F.PG.state.screen; });

const Tw = boot({ teacher: true });
T('교사: 기본은 학생 시야 + 「전체 보기」 토글 노출', () => navKeys(Tw).length === 4 && Tw.document.querySelector('[data-navmode] .txt').textContent === '전체 보기');
T('교사: 토글 → 종전 10종(한글 라벨) + 「간단히」', () => { Tw.document.querySelector('[data-navmode]').click(); const k = navKeys(Tw); return k.length === 10 && k.includes('brand') && navTxt(Tw).includes('학교 색·글꼴') && Tw.document.querySelector('[data-navmode] .txt').textContent === '간단히' || JSON.stringify(navTxt(Tw)); });
T('교사 전체 보기: 홈 칩 7 + 3D 칩 복귀', () => { Tw.PG.go('home'); return Tw.document.querySelectorAll('[data-h2-chip]').length === 7 && !!Tw.document.querySelector('[data-h2-award3d]') && !!Tw.document.querySelector('[data-scene3d]'); });
T('교사: 「간단히」 → 학생 시야 복귀', () => { Tw.document.querySelector('[data-navmode]').click(); return navKeys(Tw).length === 4; });

const Q = boot({ search: '?nav=full' });
T('?nav=full 로 누구나 전체 보기 + 「간단히」 토글', () => navKeys(Q).length === 10 && !!Q.document.querySelector('[data-navmode]'));

const built = read('../maker/index.html');
T('maker/index.html 재생성본이 새 버스터를 싣는다', () => built.includes('app.js?v=20260914b') && built.includes('screens/home.js?v=20260914b'));

console.log(`\ntest-round153: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
