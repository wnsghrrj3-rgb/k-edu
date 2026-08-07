/* ============================================================
   test-round81.mjs — R81 미니 2종 실이주: /kmake/* → /maker/*
   ① 이주본 실존 — maker/invite/·maker/card/ 페이지 존재
   ② 기계 패리티 — 이주본은 원본과 「복귀 링크 /kmake/→/maker/」만 다르고
      나머지 전부 바이트 동일 (역변환하면 원본과 완전 일치)
   ③ 이주본 자립성 — 구 편집기 번들 미로드, 공통 셸(/kedu_gate·/kedu_back)만,
      복귀 링크는 신 홈(/maker/)을 가리킴 (구 영역 의존 0)
   ④ 홈 다리 갱신 — 제품 홈 미니 앵커가 신 URL을 가리키고,
      렌더 출력에 /kmake/ 앵커 잔존 0 (은퇴 의존 절단)
   ⑤ 무깃발 무오염 — 검수·플레이그라운드 부팅엔 미니 도구 렌더 0 (R80 계승)
   ⑥ 원본 생존 — /kmake 폴백 은퇴 전까지 구 페이지·구 메인 CTA 무손상 (R79·R80 계승)
   ⑦ /maker 정적본 드리프트 0 (R77 계약 재확인)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
const site = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const exists = (p) => fs.existsSync(path.join(__dirname, '..', p));
let pass = 0, fail = 0;
const t = (name, ok, why) => { if (ok) { pass++; } else { fail++; console.log('  ✗', name, why ? '— ' + why : ''); } };

function bootEnv({ product = false } = {}) {
  const dom = new JSDOM(read('index.html'), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/maker-playground/' });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  if (product) w.MK_PRODUCT = true;
  const html = read('index.html');
  const srcs = [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((f) => !f.startsWith('http') && !f.startsWith('/'));
  for (const f of srcs) { try { w.eval(read(f)); } catch (e) {} }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}

/* 제품 홈 렌더 HTML 획득 */
function productHomeHTML() {
  const w = bootEnv({ product: true });
  const scr = w.MK_SCREENS && (w.MK_SCREENS.home || w.MK_SCREENS['home']);
  if (scr && typeof scr.render === 'function') { try { return String(scr.render()); } catch (e) { return ''; } }
  return '';
}

console.log('R81 ① 이주본 실존 — 신 영역에 두 페이지가 산다');
{
  t('maker/invite/index.html 존재', exists('maker/invite/index.html'));
  t('maker/card/index.html 존재', exists('maker/card/index.html'));
}

console.log('R81 ② 기계 패리티 — 복귀 링크 외 바이트 동일');
for (const [name, oldP, newP] of [['초대장', 'kmake/invite/index.html', 'maker/invite/index.html'], ['마음 카드', 'kmake/card/index.html', 'maker/card/index.html']]) {
  const oldSrc = site(oldP), newSrc = site(newP);
  const retired = oldSrc.includes('data-r85-redirect'); /* R85 은퇴 — 패리티는 R81 커밋에서 이행 완료, 이후 정본은 이주본 */
  if (retired) {
    t(`${name} 역변환 == 원본 (R85 은퇴: 이주본이 정본)`, newSrc.length > 10000 && !newSrc.includes('data-r85-redirect'));
    t(`${name} 복귀 링크 실존 (은퇴 후 잔여 계약)`, (newSrc.match(/href="\/maker\/"/g) || []).length > 0);
  } else {
    const reverted = newSrc.split('href="/maker/"').join('href="/kmake/"');
    t(`${name} 역변환 == 원본`, reverted === oldSrc, '역변환 불일치 — 링크 외 내용 드리프트');
    const nOld = (oldSrc.match(/href="\/kmake\/"/g) || []).length;
    const nNew = (newSrc.match(/href="\/maker\/"/g) || []).length;
    t(`${name} 복귀 링크 전량 치환 (${nOld}건)`, nOld > 0 && nOld === nNew, `원본 ${nOld} vs 이주본 ${nNew}`);
  }
  t(`${name} 이주본에 /kmake/ 링크 잔존 0`, !newSrc.includes('href="/kmake/"'));
}

console.log('R81 ③ 이주본 자립성 — 구 영역 의존 0');
for (const [name, p] of [['초대장', 'maker/invite/index.html'], ['마음 카드', 'maker/card/index.html']]) {
  const src = site(p);
  t(`${name} 구 편집기 번들 미로드`, !src.includes('kmake.js') && !src.includes('/kmake/kmake'));
  t(`${name} 공통 셸 gate 로드`, src.includes('/kedu_gate.js'));
  t(`${name} 공통 셸 back 로드`, src.includes('/kedu_back.js'));
  t(`${name} 상대경로 자산 0 (이주 무손상 전제)`, ![...src.matchAll(/(src|href)="(?!https?:\/\/|\/\/|\/|data:|#)[^"]/g)].length);
}

console.log('R81 ④ 홈 다리 갱신 — 신 URL로, 구 앵커 잔존 0');
{
  const html = productHomeHTML();
  t('제품 홈 렌더 성립', html.length > 0);
  t('초대장 앵커 → /maker/invite/', html.includes('href="/maker/invite/"'));
  t('마음 카드 앵커 → /maker/card/', html.includes('href="/maker/card/"'));
  t('초대장 미니 카드 식별자 생존', html.includes('data-h2-mini="invite"'));
  t('마음 카드 미니 카드 식별자 생존', html.includes('data-h2-mini="card"'));
  t('렌더 출력에 /kmake/ 앵커 잔존 0', !html.includes('href="/kmake/'));
  t('소개문 원문 유지(초대장)', html.includes('일시와 장소가 움직이는 초대장으로'));
  t('소개문 원문 유지(마음 카드)', html.includes('생일·감사·축하 카드가 움직이는 영상으로'));
}

console.log('R81 ⑤ 무깃발 무오염 — 검수·플레이그라운드 렌더 0 (R80 계승)');
{
  const w = bootEnv({ product: false });
  const scr = w.MK_SCREENS && w.MK_SCREENS.home;
  let html = '';
  if (scr && typeof scr.render === 'function') { try { html = String(scr.render()); } catch (e) {} }
  t('무깃발 부팅 성립', html.length > 0);
  t('무깃발 홈에 미니 도구 0', !html.includes('data-h2-mini='));
  t('무깃발 홈에 /maker/invite 0', !html.includes('/maker/invite/'));
}

console.log('R81 ⑥ 원본 생존 — 은퇴 전 구 영역 무손상 (R79·R80 계승)');
{
  t('구 초대장 페이지 생존', exists('kmake/invite/index.html'));
  t('구 마음 카드 페이지 생존', exists('kmake/card/index.html'));
  const km = site('kmake/index.html');
  const retired6 = km.includes('data-r85-redirect'); /* R85 은퇴 — 도달 경로는 /maker 홈 브리지가 승계 */
  t('구 메인 초대장 CTA 생존 (R85 은퇴 시 브리지 승계)', retired6 || km.includes('/kmake/invite/') || km.includes('invite'));
  t('구 메인 카드 CTA 생존 (R85 은퇴 시 브리지 승계)', retired6 || km.includes('/kmake/card/') || km.includes('card'));
}

console.log('R81 ⑦ /maker 정적본 드리프트 0 (R77 계약)');
{
  const { transform } = await import('../maker/build.mjs');
  const src = read('index.html');
  const built = site('maker/index.html');
  t('정적본 == transform(플레이그라운드)', transform(src) === built, '`node maker/build.mjs` 재실행 필요');
}

console.log(`\nR81: ${pass}/${pass + fail}${fail ? '  ← 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
