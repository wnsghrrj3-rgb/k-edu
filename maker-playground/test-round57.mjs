/* R57 — Animation Stage 실미디어 + 프리셋 클릭 즉시 데모(playPhase) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/home' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const PG = window.PG, AN = window.MK_ANIM;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const Tp = async (name, fn) => { try { await fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- 준비: compose 프로젝트 열고 애니메이션 화면 진입 (준호 재현 경로) ---- */
const C = window.MK_COMPOSE;
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));
window.MK_START.open(C.buildProject('cx-slideshow', 'th-bold', { medias: mk(3), texts: { title: '애니 검증', subtitle: '한 줄' } }).doc);
PG.go('animation'); PG.render();

const doc2 = () => window.MK_PROJ.current().doc;
const stage = () => document.getElementById('anStage');

T('Stage — 현재 프로젝트 실이미지 표시 (회색 박스 아님)', () => {
  /* 이미지 있는 씬으로 이동 */
  const si = doc2().scenes.findIndex((s2) => s2.elements.some((e) => e.kind === 'image' && e.src));
  A(si >= 0, '이미지 씬 없음');
  document.querySelector(`[data-an-sc="${si}"]`).onclick();
  const imgs = stage().querySelectorAll('img.an-media');
  A(imgs.length > 0, 'an-media 없음');
  A([...imgs].every((im) => /^data:image\//.test(im.getAttribute('src'))), 'src 미연결');
});

T('Stage — 색채움(fill)·텍스트 스타일(R56) 동률 반영', () => {
  const si = doc2().scenes.findIndex((s2) => s2.elements.some((e) => e.kind === 'text'));
  document.querySelector(`[data-an-sc="${si}"]`).onclick();
  const sc2 = doc2().scenes[si];
  const ti = sc2.elements.findIndex((e) => e.kind === 'text');
  window.MK_TEXTSTYLE.applyPreset(sc2.elements[ti], 'ts-news');
  PG.render();
  const tn = stage().querySelector(`[data-an-el="${ti}"]`);
  A(/Do Hyeon/.test(tn.getAttribute('style')) && /background:#C0392B/.test(tn.getAttribute('style')), '텍스트 스타일 미반영');
  const hasFillEl = doc2().scenes.some((s2) => s2.elements.some((e) => e.fill));
  if (hasFillEl) {
    const fi = doc2().scenes.findIndex((s2) => s2.elements.some((e) => e.fill));
    document.querySelector(`[data-an-sc="${fi}"]`).onclick();
    const idx = doc2().scenes[fi].elements.findIndex((e) => e.fill);
    A(/background:/.test(stage().querySelector(`[data-an-el="${idx}"]`).getAttribute('style')), 'fill 미반영');
  }
});

await Tp('playPhase(in) — 클래스 즉시 적용·정리·cancel 동작', async () => {
  const si = doc2().scenes.findIndex((s2) => s2.elements.length > 0);
  document.querySelector(`[data-an-sc="${si}"]`).onclick();
  const sc2 = doc2().scenes[si];
  sc2.anim.enter.preset = 'bounce'; sc2.anim.enter.duration = 0.15;
  const cancel = AN.playPhase(stage(), sc2, 'in');
  const el0 = stage().querySelector('[data-mka]');
  A(el0.className.includes('mka-in-bounce'), '클래스 미적용: ' + el0.className);
  await sleep(350);
  A(!el0.className.includes('mka-in-bounce'), 'duration 뒤 미정리');
  /* cancel 즉시 정리 */
  AN.playPhase(stage(), sc2, 'in')();
  A(!stage().querySelector('[data-mka]').className.includes('mka-in-'), 'cancel 미정리');
  cancel();
});

await Tp('playPhase(idle) — 루프 클래스 유지·none은 정리만', async () => {
  const si = doc2().scenes.findIndex((s2) => s2.elements.length > 0);
  const sc2 = doc2().scenes[si];
  sc2.anim.idle.preset = 'float';
  AN.playPhase(stage(), sc2, 'idle');
  A(stage().querySelector('[data-mka]').className.includes('mka-idle-float'), 'idle 루프 미적용');
  sc2.anim.idle.preset = 'none';
  AN.playPhase(stage(), sc2, 'idle');
  A(!stage().querySelector('[data-mka]').className.includes('mka-idle-'), 'none 정리 실패');
});

await Tp('프리셋 클릭 → 값 반영 + 30ms 뒤 스테이지 데모 실재생', async () => {
  PG.render();
  const b = document.querySelector('[data-an-preset="pop"]');
  A(b, 'pop 카드 없음');
  b.onclick();
  const si2 = doc2().scenes.findIndex((s2, i2) => document.querySelector(`[data-an-sc="${i2}"]`)?.className.includes('on'));
  await sleep(90);
  const sc2 = doc2().scenes[si2 >= 0 ? si2 : 0];
  A(sc2.anim.enter.preset === 'pop', '값 미반영: ' + sc2.anim.enter.preset);
  const el0 = document.getElementById('anStage').querySelector('[data-mka]');
  A(el0 && el0.className.includes('mka-in-pop'), '데모 미재생: ' + (el0 ? el0.className : 'null'));
});

T('Idle 갤러리 loop CSS — float·pulse·none 존재', () => {
  const css2 = fs.readFileSync('playground.css', 'utf8');
  A(css2.includes('.mka-loop-float{') && css2.includes('.mka-loop-pulse{') && css2.includes('.mka-loop-none{'), 'loop 클래스 누락');
});

T('회귀 — MK_ANIM.play 기존 시퀀서 무손상 (enter 클래스 적용)', () => {
  const si = doc2().scenes.findIndex((s2) => s2.elements.length > 0);
  const sc2 = doc2().scenes[si];
  const cancel = AN.play(stage(), sc2, {});
  A(stage().querySelector('[data-mka]').className.includes('mka-in-'), 'play enter 미적용');
  cancel();
});

console.log(`\nR57: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
