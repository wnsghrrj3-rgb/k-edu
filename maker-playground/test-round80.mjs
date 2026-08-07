/* ============================================================
   test-round80.mjs — R80 교체 마무리: 패리티 감사 + 미니 도구 다리
   ① 패리티 감사 — 진입 카드 문구(상장·학습지·카드·이름표)가 실데이터로 뒷받침
   ② 격차 2건 다리 — 제품 홈에 초대장·마음 카드 링크 (구 /kmake 독립 페이지)
   ③ 무깃발 무오염 — 검수·플레이그라운드 홈에는 미니 도구 0
   ④ 미니 페이지 자립성 — 구 편집기 번들 미로드 (링크 보전의 전제)
   ⑤ 역경로 무손상 — /kmake 메인의 미니 2종 CTA 생존 (R79 계승)
   ⑥ /maker 정적본 드리프트 0 (R77 계약 재확인)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
const site = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
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

console.log('R80 ① 패리티 감사 — 진입 문구는 실데이터가 뒷받침한다');
{
  const w = bootEnv({ product: true });
  const types = w.MK_SAMPLE.TYPES.map((x) => x.key);
  const actDesc = (w.MK_SAMPLE.TYPES.find((x) => x.key === 'activity') || {}).desc || '';
  t('학습지 유형 존재', types.includes('worksheet'));
  t('활동자료 유형 존재', types.includes('activity'));
  t('활동자료 설명에 상장', actDesc.includes('상장'), '실제: ' + actDesc);
  t('활동자료 설명에 이름표', actDesc.includes('이름표'), '실제: ' + actDesc);
  t('카드뉴스 유형 존재', types.includes('cardnews'));
  // 진입 3곳의 주장 낱말이 위 실데이터·미니 도구로 전부 커버되는지
  const claims = { 'index.html': ['상장', '학습지', '카드'], 'teacher/index.html': ['상장', '학습지', '이름표'], 'hub2/index.html': ['상장', '학습지', '카드'] };
  for (const [f, words] of Object.entries(claims)) {
    const src = site(f);
    for (const wd of words) t(`${f} 문구 「${wd}」 실존`, src.includes(wd));
  }
}

console.log('R80 ② 제품 홈 — 미니 도구 다리 2종');
{
  const w = bootEnv({ product: true });
  const body = w.document.getElementById('pgBody').innerHTML;
  /* R81 이주로 URL은 /kmake/* → /maker/* 로 승계 — R80의 의도(제품 홈에
     초대장·마음 카드로 가는 문이 실존)는 경로 무관하게 유지 검증.
     현행 정확 URL 고정은 test-round81 ④가 담당. */
  t('초대장 링크', /href="\/(kmake|maker)\/invite\/"/.test(body), '제품 홈에 초대장 문 없음');
  t('마음 카드 링크', /href="\/(kmake|maker)\/card\/"/.test(body), '제품 홈에 마음 카드 문 없음');
  t('섹션 제목', body.includes('바로 만드는 미니 도구'));
  t('초대장 문구 = 원문 이식', body.includes('일시와 장소가 움직이는 초대장으로'));
  t('마음 카드 문구 = 원문 이식', body.includes('생일·감사·축하 카드가 움직이는 영상으로'));
  // 링크는 <a href> — SPA 라우터를 안 타고 실제 페이지로 나간다
  const a = w.document.querySelector('[data-h2-mini="invite"]');
  t('실제 앵커 요소', !!a && a.tagName === 'A' && /^\/(kmake|maker)\/invite\/$/.test(a.getAttribute('href') || ''));
}

console.log('R80 ③ 무깃발 — 검수·플레이그라운드 무오염');
{
  const w = bootEnv({ product: false });
  const home = w.MK_SCREENS.home.render();
  t('무깃발 홈에 초대장 링크 0', !home.includes('/kmake/invite/'));
  t('무깃발 홈에 마음 카드 링크 0', !home.includes('/kmake/card/'));
  t('무깃발 홈에 미니 섹션 0', !home.includes('h2MiniT'));
}

console.log('R80 ④ 미니 페이지 자립성 — 구 편집기 번들 미로드');
{
  const OLD_BUNDLE = ['kmake.js', 'templates.js', 'p0.js', 'p0_core.js', 'scene.js', 'motion.js', 'photo.js', 'video.js', 'merge.js', 'materials.js'];
  for (const page of ['kmake/invite/index.html', 'kmake/card/index.html']) {
    const src = site(page);
    const loads = [...src.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
    const dirty = loads.filter((s) => OLD_BUNDLE.some((b) => s.endsWith('/' + b) || s === b));
    t(page + ' — 구 번들 로드 0', dirty.length === 0, '로드됨: ' + dirty.join(','));
    t(page + ' — 공통 셸만', loads.every((s) => s === '/kedu_gate.js' || s === '/kedu_back.js'), '외부 로드: ' + loads.join(','));
  }
}

console.log('R80 ⑤ 역경로 무손상 — /kmake 메인의 미니 CTA 생존');
{
  const km = site('kmake/index.html');
  t('초대장 CTA', km.includes('href="/kmake/invite/"'));
  t('마음 카드 CTA', km.includes('href="/kmake/card/"'));
  t('배너 유지 (R79)', km.includes('mkNewBanner') && km.includes('href="/maker/"'));
}

console.log('R80 ⑥ /maker 정적본 드리프트 0');
{
  const built = site('maker/index.html');
  const { transform } = await import(path.join(__dirname, '..', 'maker', 'build.mjs'));
  const fresh = transform(read('index.html'));
  t('재생성본 일치', built === fresh, 'node maker/build.mjs 재실행 필요');
  /* R81 정정: 리터럴(v=20260807a) 고정은 버스터 범프 때마다 깨진다.
     의도(정적본이 옛 자산을 가리키지 않음)는 플레이그라운드 현행 버스터와
     동적 대조로 유지 — 재생성본 일치 검증과 함께 이중 안전망. */
  const bust = (read('index.html').match(/\?v=([0-9a-z]+)/) || [])[1];
  t('정적본이 현행 캐시버스터 반영', !!bust && built.includes('v=' + bust), '옛 버전 자산을 가리킴');
}

console.log('\nR80 결과:', pass + '/' + (pass + fail), fail === 0 ? '전부 통과' : '실패 ' + fail);
process.exit(fail === 0 ? 0 : 1);
