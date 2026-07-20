/* Round 24 — K-MAKER Design Language System (K-DLS) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/dls' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const D = window.MK_DLS, FL = window.MK_FLOW;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 철학·원칙·시각 언어 (§1~§3) ============ */
sec('1. 철학·원칙');
T('MK_DLS 공개 표면', typeof D.contrast === 'function' && typeof D.exportCss === 'function' && typeof D.complete === 'function');
T('Philosophy 8 단어', D.PHILOSOPHY.length === 8 && D.PHILOSOPHY.includes('Invisible') && D.PHILOSOPHY.includes('Predictable'));
T('Less/More 4쌍', D.PRINCIPLES.length === 4 && D.PRINCIPLES.some((p) => p.less === 'Decoration' && p.more === 'Meaning'));
T('Visual Language 7', D.VISUAL.length === 7 && D.VISUAL.includes('Whitespace') && D.VISUAL.includes('Consistency'));

/* ============ 2. 색 수학 — WCAG 실계산 (§4) ============ */
sec('2. 색 수학');
T('hex 파싱', JSON.stringify(D.hexRgb('#FF8000')) === '[255,128,0]' && D.hexRgb('red') === null);
T('휘도 — 흑백 기준값', Math.abs(D.luminance('#FFFFFF') - 1) < 1e-9 && Math.abs(D.luminance('#000000')) < 1e-9);
T('대비 — 흑/백 21:1', Math.abs(D.contrast('#000000', '#FFFFFF') - 21) < 0.01);
T('대비 — 대칭', D.contrast('#2E8C7F', '#FFFFFF') === D.contrast('#FFFFFF', '#2E8C7F'));
T('대비 — 잘못된 hex null', D.contrast('teal', '#FFFFFF') === null);
const tealW = D.contrast('#2E8C7F', '#FFFFFF');
T('teal base 는 UI만(3~4.5) — 본문 텍스트 불가 판정 근거', tealW >= 3 && tealW < 4.5);

/* ============ 3. Semantic 파생 보장 (§4·§18) ============ */
sec('3. Semantic 파생');
const semKeys = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
T('semantic 6종', semKeys.every((k) => D.SEMANTIC[k]));
T('전 semantic text-safe ≥4.5', semKeys.every((k) => D.contrast(D.SEMANTIC[k].text, '#FFFFFF') >= 4.5));
T('전 semantic ui-safe ≥3.0', semKeys.every((k) => D.contrast(D.SEMANTIC[k].ui, '#FFFFFF') >= 3.0));
T('파생 종결 보장(40스텝 내)', semKeys.every((k) => D.SEMANTIC[k].derived.textOk && D.SEMANTIC[k].derived.uiOk));
T('이미 통과 색은 0스텝', D.SEMANTIC.info.derived.uiSteps === 0 || D.contrast('#3B7BD4', '#FFFFFF') < 3);
const dv = D.deriveSafe('#E8735A', '#FFFFFF', 4.5);
T('deriveSafe — coral 4.5 도달', dv.ok && D.contrast(dv.hex, '#FFFFFF') >= 4.5 && dv.steps > 0);

/* ============ 4. Typography (§5) ============ */
sec('4. Typography');
T('8역할 존재', ['display', 'heading', 'title', 'body', 'caption', 'label', 'button', 'code'].every((k) => D.TYPE[k]));
const ta = D.typeAudit();
T('typeAudit 통과', ta.ok && ta.descending && ta.lineHeights && ta.bodyReadable);
T('button 행간 1 고정', D.TYPE.button.lh === 1);
T('body 행간 ≥1.5', D.TYPE.body.lh >= 1.5);
T('code 모노 지정', D.TYPE.code.mono === true);

/* ============ 5. Spacing (§6) ============ */
sec('5. Spacing');
T('그리드 4·리듬 8·베이스 16', D.SPACING.grid === 4 && D.SPACING.rhythm === 8 && D.SPACING.base === 16);
T('스케일 전부 그리드 위', D.SPACING.scale.every((v) => D.onGrid(v)));
T('린트 — 14px 거부·최근접 제안', (() => { const r = D.spacingLint(14); return !r.ok && r.reason.startsWith('off_grid') && r.nearest === 16; })());
T('린트 — 16px 통과·스케일·리듬', (() => { const r = D.spacingLint(16); return r.ok && r.inScale && r.rhythm; })());
T('린트 — 12px 통과·리듬 아님', (() => { const r = D.spacingLint(12); return r.ok && !r.rhythm; })());
T('린트 — 숫자 아님 거부', D.spacingLint('a').ok === false);

/* ============ 6. Radius (§7) · Elevation (§8) ============ */
sec('6. Radius·Elevation');
T('radius 4단+pill', D.RADIUS.small === 6 && D.RADIUS.medium === 10 && D.RADIUS.large === 16 && D.RADIUS.xlarge === 24 && D.RADIUS.pill === 999);
T('elevation 5단', Object.keys(D.ELEVATION).length === 5);
T('elevation 단조 증가', D.elevationAudit().ok);
T('shadowCss — surface 는 none', D.shadowCss('surface') === 'none');
T('shadowCss — dialog 실규격', D.shadowCss('dialog') === '0 16px 48px rgba(20,28,40,0.22)');
T('shadowCss — 미지 레벨 null', D.shadowCss('mega') === null);

/* ============ 7. Motion (§9·§10) ============ */
sec('7. Motion');
T('원칙 4', D.MOTION_PRINCIPLES.length === 4);
T('지시서 §10 값 그대로', D.MOTION.hover.ms === 150 && D.MOTION.click.ms === 180 && D.MOTION.transition.ms === 220 && D.MOTION.dialog.ms === 250);
T('149ms 등록 거부', D.motionRegister('x', 149).ok === false);
T('251ms 등록 거부', D.motionRegister('x', 251).ok === false);
T('무명 등록 거부', D.motionRegister('', 200).ok === false);
T('200ms 등록 허용', D.motionRegister('t200', 200).ok === true && D.MOTION.t200.ms === 200);
const ma = D.motionAudit();
T('motionAudit — 밴드·Flow 정합', ma.ok && ma.band && ma.flowAligned);

/* ============ 8. Icon (§11) ============ */
sec('8. Icon');
T('규격 — 24그리드·1.75획', D.ICON.grid === 24 && D.ICON.stroke === 1.75 && D.ICON.variants.length === 2);
T('정합 아이콘 통과', D.iconValidate({ grid: 24, stroke: 1.75, variant: 'outlined', points: [[4, 4], [20, 4], [20, 20], [4, 20]] }).ok);
const bad = D.iconValidate({ grid: 20, stroke: 3, variant: 'duotone', points: [[2, 2], [6, 6]] });
T('비정합 — 4중 위반 검출', !bad.ok && ['grid_must_be_24', 'stroke_out_of_set', 'unknown_variant', 'optical_misaligned'].every((e) => bad.errors.includes(e)));
T('그리드 밖 점 검출', D.iconValidate({ grid: 24, stroke: 2, variant: 'filled', points: [[-1, 12], [25, 12]] }).errors.includes('point_out_of_grid'));

/* ============ 9. Component Rules (§12) ============ */
sec('9. Component');
T('10종 스펙', Object.keys(D.COMPONENTS).length === 10);
const ca = D.componentAudit();
T('전 컴포넌트 린트 통과', Object.values(ca).every((r) => r.ok));
T('전 고정 높이 4px 그리드', Object.values(D.COMPONENTS).filter((c) => !c.fluid).every((c) => D.onGrid(c.height)));
const lb = D.lintComponent({ height: 37, radius: 'huge', type: 'giant', motion: 'slow', states: ['default'], focusRing: false });
T('위반 스펙 — 6중 검출', !lb.ok && ['height_off_grid', 'radius_not_token', 'type_not_token', 'motion_not_token', 'states_incomplete', 'focus_ring_required'].every((e) => lb.errors.includes(e)));
T('tooltip 은 transient 예외', ca.tooltip.ok && D.COMPONENTS.tooltip.transient);
T('dialog/sheet 는 fluid·elevation 토큰', ca.dialog.ok && ca.sheet.ok && D.COMPONENTS.dialog.elevation === 'dialog' && D.COMPONENTS.sheet.elevation === 'overlay');

/* ============ 10. Card (§13) · Navigation (§14) ============ */
sec('10. Card·Navigation');
T('카드 5종·전부 card elevation', Object.keys(D.CARDS).length === 5 && Object.values(D.CARDS).every((c) => c.elevation === 'card'));
T('내비 5종·팔레트 Flow 브리지', Object.keys(D.NAVIGATION).length === 5 && D.NAVIGATION.palette.bridge === 'MK_FLOW.search' && D.NAVIGATION.palette.shortcut === 'Ctrl+K');

/* ============ 11. Empty (§15) · Loading (§16) · Feedback (§17) ============ */
sec('11. Empty·Loading·Feedback');
const ep = D.emptyFor('projects');
T('Empty — 4특성 충족', ep.title && ep.help && ep.ai && ep.action && ep.traits.length === 4);
T('Empty — 미지 컨텍스트 폴백', D.emptyFor('unknown').title === D.emptyFor('search').title);
T('Skeleton — 카드 슬롯 매핑', (() => { const s = D.skeletonFor('project'); return s.length === 4 && s[0].shape === 'rect' && s[1].shape === 'line'; })());
T('Skeleton — 미지 카드 null', D.skeletonFor('mega') === null);
T('Feedback 라우팅 매트릭스', D.feedbackRoute('danger', true) === 'modal' && D.feedbackRoute('warning', true) === 'banner' && D.feedbackRoute('info', false) === 'toast' && D.feedbackRoute('warning', false) === 'inline');
T('Loading — 빈 화면 금지 원칙', D.LOADING.placeholder === 'never-blank');

/* ============ 12. Accessibility (§18) ============ */
sec('12. Accessibility');
const aa = D.a11yAudit();
T('a11yAudit 전체 통과', aa.ok);
T('텍스트 쌍 전부 ≥4.5', aa.text.every((p) => p.ok && p.min === 4.5));
T('UI 쌍 전부 ≥3.0', aa.ui.every((p) => p.ok && p.min === 3.0));
T('키보드 — Flow 브리지 100%', aa.keyboard === true);
T('포커스 링 2px·오프셋', aa.focusRing === true && D.FOCUS_RING.width === 2);

/* ============ 13. Dark Mode (§19) ============ */
sec('13. Dark');
const da = D.darkAudit();
T('darkAudit 통과', da.ok);
T('다크 텍스트 쌍 AA', da.pairs.every((p) => p.ok));
T('다크 semantic — 밝히기 파생', (() => { const ds = D.darkSemantic(); return semKeys.every((k) => D.contrast(ds[k].text, D.DARK.surface) >= 4.5); })());
T('다크 elevation — 표면 밝아짐 단조', da.elevationLightens === true);

/* ============ 14. Responsive (§20) ============ */
sec('14. Responsive');
T('데스크톱 3패널', D.layoutFor(1440).layout === 'three-panel');
T('태블릿 2패널', D.layoutFor(900).layout === 'two-panel');
T('모바일 싱글', D.layoutFor(390).layout === 'single-stack');
T('폴더블 — 접힘/펼침 상이', D.layoutFor(390, 'closed').layout !== D.layoutFor(390, 'open').layout && D.layoutFor(390, 'open').device === 'foldable');

/* ============ 15. Design Tokens (§21) ============ */
sec('15. Tokens');
const tk = D.tokens();
T('6종 카테고리', ['color', 'spacing', 'radius', 'shadow', 'motion', 'typography'].every((k) => tk[k]));
T('tokens 는 사본(원본 불변)', (() => { tk.radius.small = 999; return D.RADIUS.small === 6; })());
const css = D.exportCss();
T('CSS — 시맨틱 3형 방출', css.includes('--mk-primary:') && css.includes('--mk-primary-text:') && css.includes('--mk-primary-ui:'));
T('CSS — 간격·모션·타이포 방출', css.includes('--mk-sp-1: 4px') && css.includes('--mk-mo-hover: 150ms') && css.includes('--mk-t-body: 400 14.5px/1.6'));
T('CSS — 자기 감사 통과', D.auditCss(css).ok);
T('JSON — 파싱 왕복', JSON.parse(D.exportJson()).spacing.grid === 4);
const fg = D.figmaStructure();
T('Figma — 6페이지·6컬렉션·2모드', fg.pages.length === 6 && fg.variableCollections.length === 6 && fg.modes.includes('dark'));

/* ============ 16. 실 tokens.css 감사 ============ */
sec('16. 실 CSS 감사');
const realCss = fs.readFileSync('tokens.css', 'utf8');
const ra = D.auditCss(realCss);
T('실 tokens.css — 그리드·hex·모션 밴드 위반 0', ra.ok, JSON.stringify(ra.violations));
T('감사 — 위반 CSS 검출', (() => { const r = D.auditCss(':root{--mk-sp-x: 13px; --mk-mo-slow: 400ms;}'); return !r.ok && r.violations.length === 2; })());

/* ============ 17. Library (§22) · Docs (§23) ============ */
sec('17. Library·Docs');
T('Atomic 5계층', ['foundation', 'primitive', 'composite', 'pattern', 'template'].every((k) => D.LIBRARY[k].length > 0));
T('levelOf 판정', D.levelOf('button') === 'primitive' && D.levelOf('color') === 'foundation' && D.levelOf('project-card') === 'composite' && D.levelOf('nope') === null);
T('docFor — do/dont/a11y 구비', (() => { const d = D.docFor('button'); return d.do.length === 3 && d.dont.length === 3 && !!d.a11y && !!d.usage; })());
T('docFor — 미지 null·사본', D.docFor('nope') === null && (() => { const d = D.docFor('input'); d.do.push('x'); return D.docFor('input').do.length === 3; })());
T('문서 커버리지 100%', D.docsCoverage().pct === 100);

/* ============ 18. Testing (§24) — 일관성 감사 ============ */
sec('18. 일관성 감사');
const au = D.consistencyAudit([
  { prop: 'color', value: '#FF00AA' }, { prop: 'padding', value: '13px' },
  { prop: 'border-radius', value: '7px' }, { prop: 'transition-duration', value: '400ms' },
  { prop: 'color', value: D.COLOR.textPrimary }, { prop: 'padding', value: '16px' },
  { prop: 'color', value: D.SEMANTIC.primary.text }, { prop: 'border-radius', value: '10px' },
]);
T('오프토큰 4건만 검출', au.violations.length === 4 && au.checked === 8);
T('위반 사유 분류', ['off_token_color', 'off_grid_spacing', 'off_token_radius', 'motion_out_of_band'].every((r) => au.violations.some((v) => v.reason === r)));
T('정합 선언만이면 통과', D.consistencyAudit([{ prop: 'padding', value: '24px' }, { prop: 'color', value: D.COLOR.surface }]).ok);

/* ============ 19. Deliverables (§25) · 완료 조건 (§26) ============ */
sec('19. 산출물·완료');
const del = D.deliverables();
T('산출물 9종', del.length === 9);
T('전부 READY', del.every((d) => d.ready), del.filter((d) => !d.ready).map((d) => d.id).join(','));
T('complete() 충족', D.complete() === true);

/* ============ 20. 화면 — #/dls 8탭·버튼 실연 ============ */
sec('20. 화면');
const scr = window.MK_SCREENS.dls;
T('화면 등재', !!scr && typeof scr.render === 'function' && typeof scr.mount === 'function');
document.body.innerHTML = '<div id="stage">' + scr.render() + '</div>';
scr.mount(document.getElementById('stage'));
T('8탭 렌더', document.querySelectorAll('[data-dls-tab]').length === 8);
T('개요 — 산출물 9/9 표시', document.body.innerHTML.includes('9/9'));
const clickTab = (k) => { document.querySelector(`[data-dls-tab="${k}"]`).click(); };
clickTab('color');
T('컬러 탭 — semantic 표·파생 배지', document.querySelectorAll('.dls-chip').length >= 20 && document.body.innerHTML.includes('text-safe'));
document.querySelector('[data-dls-fg]').value = '#2E8C7F';
document.querySelector('[data-dls-contrast]').click();
T('대비 검사기 실동작 — coral 본문 금지 판정', document.body.innerHTML.includes('UI(3:1)만 통과'));
clickTab('shape');
document.querySelector('[data-dls-sp]').value = '14';
document.querySelector('[data-dls-splint]').click();
T('간격 린트 실동작 — 14px 거부·16 제안', document.body.innerHTML.includes('off_grid') && document.body.innerHTML.includes('16px'));
clickTab('motion');
document.querySelector('[data-dls-mo-bad]').click();
T('모션 300ms 거부 실연', document.body.innerHTML.includes('duration_out_of_range'));
document.querySelector('[data-dls-icon-bad]').click();
T('아이콘 비정합 실연', document.body.innerHTML.includes('grid_must_be_24'));
clickTab('comp');
T('컴포넌트 탭 — 10행 PASS', (document.body.innerHTML.match(/>PASS</g) || []).length >= 10);
document.querySelector('[data-dls-lint-bad]').click();
T('위반 스펙 린트 실연', document.body.innerHTML.includes('focus_ring_required'));
clickTab('adapt');
document.querySelector('[data-dls-dark]').click();
T('다크 전환 실연 — 재파생 문구', document.body.innerHTML.includes('semantic 재파생'));
clickTab('ship');
document.querySelector('[data-dls-css]').click();
T('CSS 내보내기 실연', document.body.innerHTML.includes('--mk-primary-text'));
document.querySelector('[data-dls-audit]').click();
T('일관성 감사 실연 — 위반 4건', document.body.innerHTML.includes('위반 4건'));

/* ============ 21. 통합 — 기존 계층 무영향 ============ */
sec('21. 통합');
T('NAV 등재', window.PG && document.title !== '');
T('MK_FLOW 모션 밴드 상호 정합', Object.values(FL.MOTION).every((m) => m.ms >= 150 && m.ms <= 250));
T('기존 화면 잔존', ['flow', 'agent', 'mobile', 'editor', 'home'].every((k) => window.MK_SCREENS[k]));

console.log(`\nRound 24 (K-DLS): ${pass}/${pass + fail}${fail ? '  ← FAIL ' + fail : ' ✅'}`);
process.exit(fail ? 1 : 0);
