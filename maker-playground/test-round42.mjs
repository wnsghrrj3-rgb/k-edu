/* R42 — 실전 템플릿 팩 8종: 등록·전수 스키마 감사·브라우저 노출·실로드·실렌더(SVG) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/templates' });
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

let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);
const PK = window.MK_TPLPACK, TPL = window.MK_TPL, R = window.MK_RENDER, PG = window.PG;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const ANIMS = new Set(['fade', 'slide', 'scale', 'zoom', 'pop', 'bounce', 'wipe', 'blur', 'rotate']);
const SYNTHS = new Set((window.MK_AUDIO ? window.MK_AUDIO.SYNTHS : []).map((s) => s.id));

/* ============ 1. 등록 ============ */
sec('1. 등록');
{
  T('팩 8종 등록', PK && PK.result.ok && PK.result.count === 8, JSON.stringify(PK && PK.result));
  T('중복 설치 방어', PK.install().already === true && TPL.list({}).filter((t2) => /^pk-/.test(t2.templateId)).length === 8);
  const cats = new Set(PK.PACK.map((p) => p.category));
  T('8 카테고리 전 커버', ['발표자료', '카드뉴스', '영상', '포스터', '학습지', '썸네일', '활동자료', 'SNS'].every((c) => cats.has(c)), [...cats].join(','));
  T('레지스트리 총계 = 기존 20 + 팩 8', TPL.list({}).length === 28, 'n=' + TPL.list({}).length);
  T('오버레이 승계 (style·animation·ai)', PK.ids.every((id) => { const r = TPL.resolve(id); return r && r.style && r.animation && r.template._overlay.ai.hints.length; }));
}

/* ============ 2. 전수 스키마 감사 ============ */
sec('2. 전수 스키마 감사 (씬·요소 전량)');
{
  let scenes = 0, els = 0;
  const bad = [];
  PK.PACK.forEach((tpl) => {
    if (!tpl.templateId || !tpl.title || !tpl.description || !tpl.category || !tpl.ratio) bad.push(tpl.templateId + ':meta');
    tpl.scenes.forEach((sc, si) => {
      scenes++;
      if (!(sc.width > 0 && sc.height > 0 && sc.duration >= 1 && sc.duration <= 30)) bad.push(`${tpl.templateId}/${si}:scene`);
      if (!HEX.test(sc.background)) bad.push(`${tpl.templateId}/${si}:bg`);
      if (!['fade', 'slide', 'none'].includes(sc.transition)) bad.push(`${tpl.templateId}/${si}:tr`);
      if (sc.music && !SYNTHS.has(sc.music.synth)) bad.push(`${tpl.templateId}/${si}:music`);
      sc.elements.forEach((el, ei) => {
        els++;
        const w = el.w != null ? el.w : 0, h = el.h != null ? el.h : 0;
        if (!(el.x >= 0 && el.y >= 0 && el.x + w <= 100.01 && el.y + h <= 100.01)) bad.push(`${tpl.templateId}/${si}/${ei}:bounds(${el.x},${el.y},${w},${h})`);
        if (el.kind === 'text') {
          if (!el.text || !String(el.text).trim()) bad.push(`${tpl.templateId}/${si}/${ei}:empty-text`);
          if (el.color && !HEX.test(el.color)) bad.push(`${tpl.templateId}/${si}/${ei}:color`);
          if (!(el.size > 0)) bad.push(`${tpl.templateId}/${si}/${ei}:size`);
        }
        if (el.kind === 'chart' && !(el.series && el.series.length >= 2 && el.series.every((d) => typeof d.v === 'number'))) bad.push(`${tpl.templateId}/${si}/${ei}:series`);
        if (el.kind === 'table' && !(el.cols && el.rows && el.rows.every((r2) => r2.length === el.cols.length))) bad.push(`${tpl.templateId}/${si}/${ei}:table`);
        if (el.fill && !HEX.test(el.fill)) bad.push(`${tpl.templateId}/${si}/${ei}:fill`);
        if (el.anim && !ANIMS.has(el.anim.preset)) bad.push(`${tpl.templateId}/${si}/${ei}:anim`);
      });
    });
  });
  T('씬 27장 · 요소 전량 결격 0', bad.length === 0, bad.slice(0, 6).join(' | '));
  T('규모 실측 (씬 ≥ 20 · 요소 ≥ 150)', scenes >= 20 && els >= 150, `scenes=${scenes} els=${els}`);
  /* 대비 — 다크 배경 위 어두운 잉크 금지(단, 텍스트 아래 밝은 패널이 깔린 경우는 정상 디자인) */
  const lum6 = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16 & 255) + (n >> 8 & 255) + (n & 255)) / 3; };
  const darkClash = [];
  PK.PACK.forEach((tpl) => tpl.scenes.forEach((sc, si) => {
    const dark = window.MK_SEC ? window.MK_SEC.isDark(sc.background) : false;
    sc.elements.forEach((el, ei) => {
      if (el.kind === 'text' && el.color && dark && lum6(el.color) < 96) {
        const px = el.x + 1, py = el.y + 1;
        const onLight = sc.elements.slice(0, ei).some((b) => b.fill && HEX.test(b.fill) && lum6(b.fill) >= 150 &&
          px >= b.x && px <= b.x + (b.w || 0) && py >= b.y && py <= b.y + (b.h || 0));
        if (!onLight) darkClash.push(`${tpl.templateId}/${si}/${ei}`);
      }
    });
  }));
  T('다크 배경 위 저휘도 텍스트 0 (밝은 패널 위 예외)', darkClash.length === 0, darkClash.join(','));
  /* 영상 템플릿 — 전 씬 음악·총 15초 */
  const v = PK.PACK.find((p) => p.templateId === 'pk-vid-01');
  T('영상 = 전 씬 음악 실장·총 15초', v.scenes.every((sc) => sc.music && sc.music.synth === 'beat') && v.scenes.reduce((a, sc) => a + sc.duration, 0) === 15);
  /* 애니 스태거 — 등장 지연이 실제로 계단 */
  const p2 = PK.PACK[0].scenes[1].elements.filter((el) => el.anim).map((el) => el.anim.delay);
  T('애니 스태거 실계단', p2.length >= 3 && p2.every((d, i2) => i2 === 0 || d >= p2[i2 - 1]));
}

/* ============ 3. 실로드 — 템플릿 → 프로젝트 → Workspace ============ */
sec('3. 실로드 (MK_TPL.load → 프로젝트 → Workspace)');
{
  const doc = TPL.load('pk-pres-01');
  T('발표 팩 실로드 (프로젝트 생성·화면 전환)', ['workspace', 'editor'].includes(PG.state.screen) && doc && doc.scenes.length === 5, 'screen=' + PG.state.screen);
  T('엔진 메타 실림', !!(doc && doc.engine && doc.engine.style && doc.engine.ai));
  T('프로젝트 실등재', !!(window.MK_PROJ && window.MK_PROJ.current() && /개념 한 장/.test(window.MK_PROJ.current().name)));
  const vdoc = TPL.load('pk-vid-01');
  const mode = window.MK_WS && window.MK_WS.state ? window.MK_WS.state.mode : null;
  T('영상 팩 → video 모드 자동', vdoc.contentType === 'video' && (mode === 'video' || mode == null), 'mode=' + mode);
  const seq = window.MK_PLAY.sequence(vdoc);
  T('MK_PLAY 시퀀스 실소비 (팩 애니 등장 실계획)', Array.isArray(seq) && seq.length === 4 && seq.every((sc2) => sc2.enterCount > 0));
}

/* ============ 4. 실렌더 — 전 씬 SVG ============ */
sec('4. 실렌더 (renderScene→toSVG 전 씬)');
{
  let ok = 0, total = 0, errs = [];
  PK.PACK.forEach((tpl) => tpl.scenes.forEach((sc, si) => {
    total++;
    try {
      const svg = R.toSVG(R.renderScene(sc, {}));
      if (/^<svg/.test(svg) && svg.includes('</svg>') && (sc.elements.some((e2) => e2.kind === 'text') ? /<text|<tspan/.test(svg) : true)) ok++;
      else errs.push(tpl.templateId + '/' + si);
    } catch (e2) { errs.push(tpl.templateId + '/' + si + ':' + e2.message); }
  }));
  T('전 씬 SVG 실렌더', ok === total, `${ok}/${total} ` + errs.slice(0, 3).join(','));
  /* PDF 래스터 플랜 — 인쇄 계열이 R40 경로에 태워지는가 */
  const w1 = PK.PACK.find((p) => p.templateId === 'pk-work-01');
  const plan = R.toRaster(R.renderScene(w1.scenes[0], {}), { format: 'jpg', scale: 2, planOnly: true });
  T('학습지 → PDF 래스터 플랜 성립 (A4 비율)', plan.plan && Math.abs(plan.plan.height / plan.plan.width - 1754 / 1240) < 0.01);
}

/* ============ 5. 브라우저 노출 ============ */
sec('5. Template Browser 노출');
{
  PG.go('templates');
  const html2 = window.document.body.innerHTML;
  T('팩 카드 실렌더 (제목 노출)', ['개념 한 장 수업', '학부모 안내 · 미드나잇', '행사 하이라이트 15초', '모둠 활동판'].every((s) => html2.includes(s)));
  T('AI 추천 배지 실장', /AI/.test(html2) && TPL.list({}).filter((t2) => /^pk-/.test(t2.templateId) && t2.aiRecommended !== false).length >= 4);
}

/* ============ 6. 실렌더 썸네일 (R42 후속) ============ */
sec('6. 실렌더 썸네일');
{
  PG.go('templates');
  const cards = [...window.document.querySelectorAll('.mk-tplcard')];
  T('전 카드 실타이포 썸네일', cards.length === 28 && cards.every((c) => /<text/.test(c.innerHTML)), 'n=' + cards.length);
  T('팩 팔레트 실색 노출', cards.filter((c) => /#2F6B54|#182230|#FFD166/i.test(c.innerHTML)).length >= 3);
  const pk = cards.find((c) => /개념 한 장/.test(c.textContent)); pk.click();
  T('모달 스테이지 실렌더', /<text/.test((window.document.querySelector('.stage') || { innerHTML: '' }).innerHTML));
  if (window.MK && window.MK.Modal) window.MK.Modal.close();
}

/* ============ 결과 ============ */
console.log(`\nR42 검증: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
if (fail) process.exit(1);
