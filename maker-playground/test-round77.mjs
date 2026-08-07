/* ============================================================
   test-round77.mjs — R77 /maker 제품 진입
   ① 제품 모드: 검수 화면이 내비·라우팅 모두에서 차단된다
   ② 검수 모드(깃발 없음): 기존 동작 그대로 — 무영향 증명
   ③ /maker 로더: 깃발 선주입·경로 보정·부트 호출 성문 검증
   ④ /kmake 배너: 존재·링크·닫기 기억·기존 화면 무손상
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
let pass = 0, fail = 0;
const t = (name, ok, why) => { if (ok) { pass++; } else { fail++; console.log('  ✗', name, why ? '— ' + why : ''); } };

function bootEnv({ product = false, hash = '' } = {}) {
  const dom = new JSDOM(read('index.html'), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/maker-playground/' + (hash ? '#/' + hash : '') });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  if (product) w.MK_PRODUCT = true;
  const html = read('index.html');
  const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
  for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}

const REVIEW_ONLY = ['foundations', 'components', 'patterns', 'screens', 'audit', 'ops', 'constitution', 'homex', 'dev', 'agent', 'flow', 'dls', 'invisible', 'nav', 'journey', 'ftue', 'easy', 'simple', 'admin', 'market', 'plugins', 'mobile', 'team', 'tbuilder', 'export'.length && 'never'].filter((x) => x !== 'never');
const PRODUCT_NAV = ['home', 'library', 'templates', 'assets', 'brand', 'editor', 'video', 'photo', 'ai', 'export'];

console.log('R77 ① 제품 모드 — 검수 화면 차단');
{
  const w = bootEnv({ product: true });
  t('기본 진입이 home', w.PG.state.screen === 'home', '실제: ' + w.PG.state.screen);
  const navHtml = w.document.getElementById('pgNav').innerHTML;
  for (const k of ['audit', 'ops', 'constitution', 'homex', 'dev', 'foundations', 'agent', 'dls', 'tbuilder', 'admin']) {
    t('내비에 ' + k + ' 없음', !navHtml.includes('data-nav="' + k + '"'));
  }
  for (const k of PRODUCT_NAV) {
    t('내비에 ' + k + ' 있음', navHtml.includes('data-nav="' + k + '"'));
  }
  w.PG.go('audit');
  t('go(audit) → home 강제', w.PG.state.screen === 'home', '실제: ' + w.PG.state.screen);
  w.PG.go('video');
  t('go(video) 정상 통과', w.PG.state.screen === 'video');
  w.PG.go('editor');
  t('go(editor) 정상 통과', w.PG.state.screen === 'editor');
}
{
  const w = bootEnv({ product: true, hash: 'constitution' });
  t('딥링크 #/constitution → home', w.PG.state.screen === 'home', '실제: ' + w.PG.state.screen);
}
{
  const w = bootEnv({ product: true, hash: 'video' });
  t('딥링크 #/video 통과', w.PG.state.screen === 'video');
}

console.log('R77 ② 검수 모드 — 무영향 증명');
{
  const w = bootEnv({ product: false });
  t('기본 진입이 foundations(기존)', w.PG.state.screen === 'foundations', '실제: ' + w.PG.state.screen);
  const navHtml = w.document.getElementById('pgNav').innerHTML;
  t('내비에 audit 노출(기존)', navHtml.includes('data-nav="audit"'));
  t('내비에 foundations 노출(기존)', navHtml.includes('data-nav="foundations"'));
  const NAV_KEYS = [...navHtml.matchAll(/data-nav="([^"]+)"/g)].map((m) => m[1]);
  t('내비 화면 수 34(기존 전체)', NAV_KEYS.length === 34, '실제: ' + NAV_KEYS.length);
  w.PG.go('audit');
  t('go(audit) 정상 진입(기존)', w.PG.state.screen === 'audit');
}
{
  const w = bootEnv({ product: false, hash: 'homex' });
  t('딥링크 #/homex 정상(기존)', w.PG.state.screen === 'homex');
}

console.log('R77 ③ /maker 로더 성문 검증');
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'maker', 'index.html'), 'utf8');
  t('MK_PRODUCT 를 적재 전에 주입', /window\.MK_PRODUCT = true;[\s\S]*fetch\(BASE/.test(src));
  t('원본 경로 ../maker-playground/ 참조', src.includes("'../maker-playground/'"));
  t('스크립트 순차 적재(순서 보존)', src.includes('await new Promise') && src.includes("querySelectorAll('script[src]')"));
  t('PG.boot 직접 호출', src.includes('PG.boot()'));
  t('절대·프로토콜 URL 은 보정 제외', src.includes("(https?:)?\\/\\/"));
  t('검수 문구 제거(제품 브랜딩)', src.includes('케이메이커') && !src.includes('Design Playground'));
}

console.log('R77 ④ /kmake 배너');
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'kmake', 'index.html'), 'utf8');
  t('배너 존재', src.includes('mkNewBanner'));
  t('/maker/ 링크', src.includes('href="/maker/"'));
  t('닫기 기억(localStorage)', src.includes("mkNewBannerOff"));
  t('기본 display:none — 스크립트로만 노출', /id="mkNewBanner" style="display:none/.test(src));
  t('시작 화면 마크업 보존', src.includes('<div id="start">'));
}

console.log('\nR77 결과:', pass + '/' + (pass + fail), fail === 0 ? '전부 통과' : '실패 ' + fail);
process.exit(fail === 0 ? 0 : 1);
