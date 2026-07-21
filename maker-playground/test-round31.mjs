/* Round 31 — Home Experience (MK_HOMEX) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/homex' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const H = window.MK_HOMEX, S = window.MK_SIMPLE;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 표면·철학 ============ */
sec('1. 표면·철학');
T('공개 표면', ['questionAudit', 'heroAudit', 'quickStartAudit', 'eyeFlowAudit', 'removalAudit', 'hierarchyJudge', 'record', 'responsiveAudit', 'realHomeAudit', 'complete'].every((k) => typeof H[k] === 'function'));
T('철학 — 작업 시작 페이지', H.PHILOSOPHY.role.includes('작업을 시작'));
T('철학 — 목적 하나', H.PHILOSOPHY.purpose.includes('하나'));
T('철학 — 무대', H.PHILOSOPHY.stage.includes('무대'));

/* ============ 2. 실화면 렌더 ============ */
sec('2. 실화면 렌더');
const root = H.renderHome();
T('Home v2 실렌더', !!root && !!root.querySelector('.h2'), root ? 'ok' : 'render null');
T('main 실존', !!root.querySelector('main'));

/* ============ 3. 질문 (§2) ============ */
sec('3. 질문');
const qa = H.questionAudit(root);
T('실화면 질문 정확히 1', qa.ok, JSON.stringify(qa.violations));
T('질문 계열 — 무엇을 만들…?', /무엇을 만들/.test(qa.question || ''));
T('h1 은 질문뿐', root.querySelectorAll('h1').length === 1);
T('질문 2개 스펙 거부', !H.questionSpecAudit({ questions: ['무엇을 만들까요?', '어떤 기능이 필요하세요?'] }).ok);
T('계열 밖 질문 거부', !H.questionSpecAudit({ questions: ['기능을 살펴보세요'] }).ok);
T('질문 0개 스펙 거부', !H.questionSpecAudit({ questions: [] }).ok);

/* ============ 4. Hero (§3) ============ */
sec('4. Hero');
const ha = H.heroAudit(root);
T('Hero 감사 통과', ha.ok, JSON.stringify(ha.violations));
T('hero = main 첫 섹션', root.querySelector('main').firstElementChild.classList.contains('h2-hero'));
T('AI 입력 실존 + placeholder', (() => { const i = root.querySelector('#h2Ai'); return !!i && /^예[:：]/.test(i.placeholder); })());
T('제출 버튼 실존', !!root.querySelector('.h2-hero button[type="submit"]'));
T('hero 없는 스펙 거부', !H.heroAudit(window.document.createElement('div')).ok);

/* ============ 5. Quick Start (§4) ============ */
sec('5. Quick Start');
const qs = H.quickStartAudit(root);
T('실화면 4~6개', qs.ok && qs.count >= 4 && qs.count <= 6, String(qs.count));
T('기능어 0', qs.labels.every((l) => !/Export|Assets|Brand/i.test(l)));
T('7개 스펙 거부', !H.quickStartSpecAudit(['a', 'b', 'c', 'd', 'e', 'f', 'g']).ok);
T('3개 스펙 거부', !H.quickStartSpecAudit(['a', 'b', 'c']).ok);
T('기능어 포함 스펙 거부', !H.quickStartSpecAudit(['발표', '포스터', 'Export', '문서']).ok);
T('경계 — 정확히 4·6 허용', H.quickStartSpecAudit(['a', 'b', 'c', 'd']).ok && H.quickStartSpecAudit(['a', 'b', 'c', 'd', 'e', 'f']).ok);

/* ============ 6. Recent (§5) · Template (§6) ============ */
sec('6. Recent · Template');
const ra = H.recentAudit(root);
T('최근/시작 섹션 hero 뒤·h1 없음·≤5', ra.ok, JSON.stringify(ra.violations));
const ta = H.templateAudit(root);
T('추천 ≤6 + 더 보기 통로', ta.ok && ta.count <= 6, JSON.stringify(ta.violations));

/* ============ 7. AI 중심 (§7) ============ */
sec('7. AI 중심');
const aa = H.aiAudit(root);
T('AI 용해 — 단독 메뉴 0 · primary=ai-make', aa.ok, JSON.stringify(aa.violations));
T('homeSpec.primary 브리지', S.homeSpec('beginner').primary === 'ai-make');

/* ============ 8. 시선 흐름 (§8) ============ */
sec('8. 시선 흐름');
const ef = H.eyeFlowAudit(root);
T('실DOM 순서 질문→입력→QS→최근', ef.ok, JSON.stringify(ef.violations));
T('순서 정의 4단', H.EYE_ORDER.join(',') === 'question,input,quickstart,recent');
T('역전 스펙 거부', !H.eyeFlowSpecAudit(['recent', 'question', 'input', 'quickstart']).ok);
T('정순 스펙 통과', H.eyeFlowSpecAudit(['question', 'input', 'quickstart', 'recent']).ok);
T('추천은 최근 뒤', (() => { const rec = root.querySelector('.h2-continue-wrap, [aria-labelledby="h2RecentT"], .h2-empty'); const rc = root.querySelector('[aria-labelledby="h2RecoT"]'); return !!rec && !!rc && !!(rec.compareDocumentPosition(rc) & 4); })());

/* ============ 9. 제거 감사 (§9) ============ */
sec('9. 제거 감사');
const rm = H.removalAudit(root);
T('실화면 금지 요소 0', rm.ok, JSON.stringify(rm.violations));
T('카드 예산 ≤12', rm.cards <= H.CARD_BUDGET, String(rm.cards));
const bad = window.document.createElement('div');
bad.innerHTML = '<main><h1 class="h2-q">무엇을 만들까요?</h1><div>🎉 이벤트 안내 — 프리미엄 업그레이드 배너</div></main>';
T('배너 포함 불량 홈 거부', !H.removalAudit(bad).ok);
const bad2 = window.document.createElement('div');
bad2.innerHTML = '<div>공지사항: 점검 안내</div>';
T('공지 포함 거부', !H.removalAudit(bad2).ok);

/* ============ 10. 30초·5분 (§10·§11) ============ */
sec('10. 30초 · 5분');
const t30 = H.first30();
T('30초 — 가입 0 · 실생성', t30.ok && t30.authSteps === 0 && t30.built, JSON.stringify(t30));
const fs5 = H.firstSuccess();
T('5분 — 예산 300s 내 실생성', fs5.ok && fs5.total <= 300);
T('예산 대비 점유율 문자열', /%$/.test(fs5.share));

/* ============ 11. Emotion (§12) ============ */
sec('11. Emotion');
const em = H.emotionAudit(root);
T('기대감 신호 ≥2', em.ok && em.signals.length >= 2, JSON.stringify(em));
T('신호에 예시 placeholder 포함', em.signals.includes('placeholder-example'));

/* ============ 12. 계층 (§13) — 실측 주입 판정 ============ */
sec('12. 계층');
T('정상 실측 통과', H.hierarchyJudge({ viewport: 1296000, hero: 492480, quickstart: 86400, recent: 44800 }).ok);
T('역전 실측 거부', !H.hierarchyJudge({ viewport: 1296000, hero: 129600, quickstart: 86400, recent: 720000 }).ok);
T('hero 20% 미만 거부', !H.hierarchyJudge({ viewport: 1296000, hero: 100000, quickstart: 8000, recent: 4000 }).ok);
T('미실측 판정 거부', H.hierarchyJudge(null).reason === 'measurement_required');
T('부분 실측 판정 거부', H.hierarchyJudge({ viewport: 100 }).reason === 'measurement_required');

/* ============ 13. 지표 (§14) ============ */
sec('13. 지표');
T('5종 정확', H.METRICS.join(',') === 'ttfp,ai_start_rate,quickstart_ctr,recent_reentry,first_export_success');
T('미실측 = null — 숫자를 만들지 않는다', H.read('ttfp').value === null && H.read('ttfp').measured === false);
T('미지 지표 record 거부', H.record('nps', 50).reason === 'unknown_metric');
T('숫자 아닌 값 거부', H.record('ttfp', '빠름').reason === 'number_required');
T('record 유일 경로 — 기록 후 평균', (() => { H.record('ttfp', 40); H.record('ttfp', 60); const r = H.read('ttfp'); return r.measured && r.value === 50 && r.n === 2; })());
T('미지 지표 read 거부', H.read('nps').reason === 'unknown_metric');
T('라벨 5종', Object.keys(H.M_LABEL).length === 5 && H.M_LABEL.ttfp.includes('First Project'));

/* ============ 14. 반응형 — 실CSS 감사 ============ */
sec('14. 반응형');
const css = fs.readFileSync('playground.css', 'utf8');
window.__H2CSS = css;
const rs = H.responsiveAudit(css);
T('실CSS 1024/768/480 에 .h2 규칙 실존', rs.ok, JSON.stringify(rs.violations));
T('bp 3종', H.BREAKPOINTS.length === 3 && H.BREAKPOINTS.map((b) => b.id).join(',') === 'desktop,tablet,mobile');
T('전 bp 시선 순서 동일', rs.specs.every((s) => s.order.join() === rs.specs[0].order.join()));
T('전 bp 질문 1·QS 4~6', rs.specs.every((s) => s.question === 1 && s.quickstart.min === 4 && s.quickstart.max === 6));
T('CSS 미주입 시 감사 실패(추정 금지)', !H.responsiveAudit('').ok);

/* ============ 15. Before/After · 산출물 · 완료 ============ */
sec('15. 산출물·완료');
const ba = H.beforeAfter();
T('Before 질문 0 → After 1', ba.before.questions === 0 && ba.after.questions === 1);
T('노출 메뉴 25 → 0', ba.before.menuExposed === 25 && ba.after.menuExposed === 0);
const d = H.deliverables();
T('Deliverables 8종', d.length === 8);
T('8종 전부 ready', d.every((x) => x.ready), JSON.stringify(d.filter((x) => !x.ready).map((x) => x.id)));
T('모바일·태블릿·데스크톱 3종 포함', ['home-mobile', 'home-tablet', 'home-desktop'].every((id) => d.some((x) => x.id === id)));
const rp = H.uxReport();
T('UX 보고서 — 감사 9종 · 위반 0', rp.ok && rp.audited === 9, JSON.stringify(rp.violations));
T('보고서 지표 — 실측/미실측 구분', rp.metrics.some((m) => m.measured) && rp.metrics.some((m) => !m.measured));
T('complete() — §16', H.complete() === true);

/* ============ 16. 통합 — 화면·내비·회귀 가드 ============ */
sec('16. 통합');
T('#/homex 화면 등재', !!window.MK_SCREENS.homex && typeof window.MK_SCREENS.homex.render === 'function');
T('화면 렌더 — 8탭', (() => { const h2 = window.document.createElement('div'); h2.innerHTML = window.MK_SCREENS.homex.render(); return h2.querySelectorAll('[data-hx-tab]').length === 8; })());
T('MK_TEN 전수 100 유지(회귀 가드)', window.MK_TEN.inventoryAudit().total === 100);
T('MK_SIMPLE 3초 테스트 유지', S.threeSecTest().pass === true);
T('실화면 종합 — 9감사 위반 0', H.realHomeAudit().ok);

console.log(`\nRound31: ${pass}/${pass + fail} ${fail ? '— FAIL ' + fail : 'ALL PASS'}`);
process.exit(fail ? 1 : 0);
