/* ============================================================
   test-round78.mjs — R78 제품 모드 데모 시드 차단
   ① 제품: 프로젝트 목록 0 · 홈은 빈 상태 · serialize 에 smp- 0개
   ② 제품: 실프로젝트 생성 후에도 저장본에 smp- 오염 0개
   ③ 검수(깃발 없음): 시드 5종 그대로 — 무영향 증명
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
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

console.log('R78 ① 제품 — 데모 시드 0');
{
  const w = bootEnv({ product: true });
  const recent = w.MK_PROJ.list('recent');
  t('recent 목록 0개', recent.length === 0, '실제: ' + recent.length);
  t('serialize 에 smp- 없음', !w.MK_PROJ.serialize().includes('smp-'));
  const body = w.document.getElementById('pgBody').innerHTML;
  t('홈이 빈 상태 렌더', body.includes('첫 작품을 1분 안에') || body.includes('h2-empty'), '빈 상태 미노출');
  t('가짜 프로젝트 미노출', !body.includes('data-h2-open="smp-') && !body.includes('화산 발표'), '데모 시드 프로젝트가 홈에 노출됨 (템플릿의 smp- ID 는 정식이라 제외)');
}

console.log('R78 ② 제품 — 실생성 후 저장 오염 0');
{
  const w = bootEnv({ product: true });
  const doc = { id: 'real-1', title: '진짜 작업', contentType: 'presentation', scenes: [{ id: 's1', elements: [] }] };
  const p = w.MK_PROJ.createFromDoc(doc, '진짜 작업', { prompt: '테스트', action: '생성' });
  t('실프로젝트 생성됨', !!p && !!p.projectId);
  const raw = w.MK_PROJ.serialize();
  t('저장본에 실작업 1개만', (JSON.parse(raw)).length === 1, '실제: ' + JSON.parse(raw).length);
  t('저장본에 smp- 오염 0', !raw.includes('smp-'));
  /* 저장→재부팅 왕복: hydrate 가 실작업만 복원 */
  const w2 = bootEnv({ product: true });
  const ok = w2.MK_PROJ.hydrate(raw);
  t('재부팅 hydrate 성공', ok === true);
  t('복원 목록 = 실작업 1개', w2.MK_PROJ.list('recent').length === 1);
}

console.log('R78 ③ 검수 — 무영향');
{
  const w = bootEnv({ product: false });
  const recent = w.MK_PROJ.list('recent');
  t('시드 프로젝트 존재(기존)', recent.length >= 3, '실제: ' + recent.length);
  t('화산 발표 시드 존재(기존)', w.MK_PROJ.serialize().includes('화산 발표'));
}

console.log('\nR78 결과:', pass + '/' + (pass + fail), fail === 0 ? '전부 통과' : '실패 ' + fail);
process.exit(fail === 0 ? 0 : 1);
