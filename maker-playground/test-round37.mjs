/* R37 폐 — 재생(MK_PLAY)·내보내기 실동작 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const P = window.MK_PLAY, R = window.MK_RENDER, PG = window.PG;
let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 재생 엔진 순수 로직 ============ */
sec('1. 재생 엔진');
const pa = P.playAudit();
T('playAudit 전 항목', pa.ok, JSON.stringify(pa.violations));
{
  T('프리셋 9종 = MK_ANIM과 동일', window.MK_ANIM.PRESETS.every((x) => P.PRESET_KEYS.includes(x.key)));
  const el = { kind: 'text', anim: { preset: 'inherit', delay: 0.3, duration: 0.5 } };
  const plan = P.enterPlan(el, 0, { enter: { preset: 'zoom' } });
  T('inherit → 장면 프리셋 승계', plan.name === 'mkp-zoom' && plan.delay === 0.3);
  T('none = 등장 애니 없음', P.enterPlan({ anim: { preset: 'none' } }, 0, null) === null);
  T('미지 프리셋 → fade 폴백', P.enterPlan({ anim: { preset: '외계' } }, 2, null).name === 'mkp-fade');
  const sq = P.sequence({ scenes: [{ duration: 0.5, elements: [] }] });
  T('최소 재생 시간 1.6초 보장', sq[0].durMs === 1600);
}

/* ============ 2. 플레이어 실DOM ============ */
sec('2. 플레이어 실DOM');
{
  PG.go('editor');
  const doc = PG.state.editor.doc;
  const timers = [];
  const r = P.open(doc, { startIdx: 0, setTimeout: (f, t) => { timers.push({ f, t }); return timers.length; }, clearTimeout: () => {} });
  T('열기 실동작', r.ok && !!window.document.getElementById('mkPlayer'));
  T('진행바 분절 = 장면 수', window.document.querySelectorAll('.mkp-seg').length === doc.scenes.length);
  T('장면 요소 실렌더', window.document.querySelectorAll('.mkp-scene .mkp-el').length === doc.scenes[0].elements.length);
  T('등장 애니 인라인 방출', /animation:mkp-/.test(window.document.querySelector('.mkp-scene').innerHTML));
  T('자동 진행 타이머 장전', timers.length === 1 && timers[0].t >= 1600);
  timers[0].f();                                               /* 시간 경과 → 다음 장면 */
  T('자동 다음 장면', P.state().idx === 1);
  window.document.querySelector('[data-mkp="prev"]').click();
  T('이전 버튼', P.state().idx === 0);
  window.document.querySelector('[data-mkp="pause"]').click();
  T('일시정지', P.state().paused === true);
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  T('Esc 닫기', !window.document.getElementById('mkPlayer') && P.state().on === false);
  /* 마지막 장면 종료 → 자동 닫힘 */
  const t2 = [];
  P.open(doc, { startIdx: doc.scenes.length - 1, setTimeout: (f, t) => { t2.push(f); return 1; }, clearTimeout: () => {} });
  t2[t2.length - 1]();
  T('끝 장면 후 자동 닫힘', P.state().on === false);
}

/* ============ 3. 출력 — src·rot가 실출력에 반영 ============ */
sec('3. 출력 파이프라인');
{
  const doc = PG.state.editor.doc;
  const sc = JSON.parse(JSON.stringify(doc.scenes[0]));
  sc.elements.push({ kind: 'image', x: 8, y: 8, w: 30, h: 30, src: 'data:image/png;base64,QQQ', fit: 'cover', radius: 14, rot: 20 });
  const svg = R.toSVG(R.renderScene(sc, {}));
  T('SVG — 실이미지 <image href>', /<image href="data:image\/png;base64,QQQ"/.test(svg));
  T('SVG — 회전 반영', /rotate\(20 /.test(svg));
  T('SVG — 크롭(radius) 클립', /rx="14"/.test(svg));
  T('SVG — xlink 오염 없음(XML 유효)', !/xlink/.test(svg));
  T('contain 맞춤 반영', /meet/.test(R.toSVG(R.renderScene({ ...sc, elements: [{ kind: 'image', x: 0, y: 0, w: 10, h: 10, src: 'data:,x', fit: 'contain' }] }, {}))));
  const plan = R.toRaster(R.renderScene(sc, {}), { format: 'png', scale: 2, planOnly: true });
  T('PNG 플랜 — 2x 스케일', plan.plan && plan.plan.scale === 2 && plan.plan.width === 2560);
  T('텍스트·도형 회귀(기존 씬 무변화 렌더)', R.toSVG(R.renderScene(doc.scenes[0], {})).length > 500);
}

/* ============ 4. 에디터 배선 ============ */
sec('4. 에디터 배선');
{
  PG.state.editor = {}; PG.go('editor');
  const root = window.document;
  root.querySelector('[data-ed="preview"]').click();
  T('미리보기 버튼 → 플레이어', !!root.getElementById('mkPlayer'));
  P.close();
  PG.state.variants.editor = 'Video'; PG.render();           /* 재생 바 = Video 모드 */
  const play = root.querySelector('[data-ed="play"]');
  T('하단 재생 버튼 존재(외형만 → 실동작)', !!play);
  play.click();
  T('재생 버튼 → 현재 장면부터', !!root.getElementById('mkPlayer') && P.state().on);
  P.close();
  PG.state.variants.editor = 'Design'; PG.render();
  root.querySelector('[data-ed="export"]').click();
  const exKinds = [...root.querySelectorAll('[data-ex]')].map((b) => b.dataset.ex);
  T('내보내기 모달 — R37 실옵션 4종 존재(이후 라운드 추가 허용)', ['png1', 'png2', 'pngall', 'svg'].every((k) => exKinds.includes(k)));
  T('가짜 항목("PPT 파일" 버튼) 제거', ![...root.querySelectorAll('.ph-item')].some((b) => b.textContent === 'PPT 파일'));
  window.MK.Modal.close();
}

/* ============ 5. 회귀 가드 ============ */
sec('5. 회귀 가드');
{
  T('R36 실편집 엔진 공존', window.MK_LIVE.liveAudit().ok);
  T('R35 p0 불변', window.MK_EASY.p0Audit().ok !== false);
  const scr = ['home', 'library', 'easy', 'editor'];
  T('주요 화면 렌더', scr.every((s2) => { try { PG.go(s2); return (window.document.getElementById('app') || window.document.body).innerHTML.length > 500; } catch (_) { return false; } }));
}

console.log(`\nRound 37: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
