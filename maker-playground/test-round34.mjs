/* Round 34 — FTUE: First 10 Minutes (MK_FTUE) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/ftue' });
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

const F = window.MK_FTUE, S = window.MK_SIMPLE, I = window.MK_INVIS, J = window.MK_JOURNEY, H = window.MK_HOMEX;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 표면·철학 (§0·§1) ============ */
sec('1. 표면·철학·목표');
T('공개 표면', ['timelineAudit', 'welcomeAudit', 'welcomeSpecAudit', 'optionRun', 'questionAudit', 'questionSpecAudit', 'convAudit', 'convSpecAudit', 'convRun', 'instant', 'blankAudit', 'instantSpecAudit', 'guidedAudit', 'guidedSpecAudit', 'confidenceAudit', 'confidenceSpecAudit', 'exportAudit', 'secondRun', 'secondAudit', 'emotionMapAudit', 'wireframe', 'wireframeAudit', 'ftueWalk', 'record', 'metrics', 'deliverables', 'deliverablesAudit', 'firstTimeTest', 'complete'].every((k) => typeof F[k] === 'function'));
T('철학 — 첫 10분이 10개월', F.PHILOSOPHY.rule.includes('첫 10분') && F.PHILOSOPHY.rule.includes('10개월'));
T('철학 — 첫 성공을 기억', F.PHILOSOPHY.memory.includes('첫 성공을 기억'));
T('철학 — 기능 설명이 아니라 첫 성공 경험', F.PHILOSOPHY.goal.includes('기능 설명') && F.PHILOSOPHY.goal.includes('첫 성공 경험'));
T('목표 — 5분 첫 결과물 · 10분 인상', F.GOALS.firstResultSec === 300 && F.GOALS.impressionSec === 600);
T('인상 문구 지시서 그대로', F.GOALS.impression === 'K-MAKER 쉽다.');

/* ============ 2. 타임라인 (§1) ============ */
sec('2. 타임라인');
const tl = F.timelineAudit();
T('7국면 전수 통과', tl.ok && tl.phases === 7, JSON.stringify(tl.violations));
T('첫 결과물 ≤ 300s 실합산', tl.firstResultSec != null && tl.firstResultSec <= 300);
T('전체 ≤ 600s 실합산', tl.totalSec <= 600);
T('전 국면 실라우트 존재', F.PHASES.every((p) => !!window.MK_SCREENS[p.route]));

/* ============ 3. Welcome (§2) ============ */
sec('3. Welcome');
const wa = F.welcomeAudit();
T('금지 표면 0 + 첫 표면 = 질문', wa.ok, JSON.stringify(wa.violations));
T('금지 목록에 설명·튜토리얼·슬라이드', ['tutorial', 'slides'].every((k) => F.FORBIDDEN_WELCOME.includes(k)));
T('홈 실DOM 질문 하나 브리지', H.realHomeAudit().parts.question.ok);
T('튜토리얼 낀 스펙 실거부', !F.welcomeSpecAudit({ surfaces: ['tutorial'] }).ok);
T('슬라이드 스펙 실거부', !F.welcomeSpecAudit({ surfaces: ['slides', 'question'] }).ok);
T('첫 표면이 설명인 스펙 실거부', !F.welcomeSpecAudit({ first: 'explain', surfaces: ['question'] }).ok);
T('바로 만들기 스펙 통과', F.welcomeSpecAudit({ first: 'question', surfaces: ['question', 'make'] }).ok);

/* ============ 4. 첫 질문 (§3) ============ */
sec('4. 첫 질문');
const qa = F.questionAudit();
T('질문 지시서 그대로', F.QUESTION === '오늘 무엇을 만들고 싶으신가요?');
T('6선택지 전수 통과', qa.ok && qa.options === 6, JSON.stringify(qa.violations));
T('선택지 라벨 지시서 그대로', JSON.stringify(F.OPTIONS.map((o) => o.label)) === JSON.stringify(['발표', '포스터', '영상', 'SNS', '문서', '그냥 AI에게 맡기기']));
T('맡기기 탈출구 존재', F.OPTIONS.some((o) => o.auto));
for (const o of F.OPTIONS) {
  const r = F.optionRun(o.id);
  T('실생성 — ' + o.label, r.ok && r.scenes > 0 && !!r.title);
}
T('미지 선택지 거부', !F.optionRun('nope').ok);
T('설문(질문 3) 스펙 실거부', !F.questionSpecAudit({ questions: 3 }).ok);
T('설명행 선택지 스펙 실거부', !F.questionSpecAudit({ options: [{ to: 'tutorial' }, { auto: true }] }).ok);
T('맡기기 없는 스펙 실거부', !F.questionSpecAudit({ options: [{ label: '발표' }] }).ok);
T('정상 스펙 통과', F.questionSpecAudit({ questions: 1, options: [{ label: '발표' }, { auto: true }] }).ok);

/* ============ 5. AI Conversation (§4) ============ */
sec('5. AI Conversation');
const ca = F.convAudit();
T('제품 설명 0 · 되묻기 ≤1 · 종착 = 생성', ca.ok, JSON.stringify(ca.violations));
T('스크립트 첫 줄 = 첫 질문', F.SCRIPT[0].say === F.QUESTION);
T('pitch 스크립트 실거부', !F.convSpecAudit({ lines: [{ kind: 'pitch', say: 'x' }] }).ok);
T('기능 자랑 문구 실거부', !F.convSpecAudit({ lines: [{ kind: 'confirm', say: 'K-MAKER 는 100가지 기능이 있습니다' }] }).ok);
T('취조(되묻기 3) 실거부', !F.convSpecAudit({ lines: [1, 2, 3].map(() => ({ kind: 'ask-purpose', say: '?' })) }).ok);
T('목적 이해 스크립트 통과', F.convSpecAudit({ lines: [{ kind: 'ask-purpose', say: '누가 보나요?' }, { kind: 'make', say: '만들게요' }] }).ok);
const cr = F.convRun('present');
T('실대화 — 목적이 대사에 실주입', cr.ok && cr.dialog.some((l) => l.say.includes(cr.made.topic)));
T('실대화 종착 = 실생성 문서', cr.made.scenes > 0);

/* ============ 6. Instant Success (§5) ============ */
sec('6. Instant Success');
const it = F.instant();
T('30초 초안 실생성 + 전 장면 글 실존', it.ok && it.sec <= 30 && it.filled, JSON.stringify(it));
T('빈 화면 금지 — 전 국면 표면 실존', F.blankAudit().ok);
T('빈 화면 스펙 실거부', !F.instantSpecAudit({ phases: [{ blank: true }] }).ok);
T('60초 초안 스펙 실거부', !F.instantSpecAudit({ draftSec: 60 }).ok);
T('30초 스펙 통과', F.instantSpecAudit({ draftSec: 25 }).ok);

/* ============ 7. Guided Editing (§6) ============ */
sec('7. Guided Editing');
const ga = F.guidedAudit();
T('순간 팁 · 동시 1 · 전 기능 미만', ga.ok && ga.concurrent === 1, JSON.stringify(ga.violations));
T('MK_INVIS 트리거 라이브 브리지', ['empty-doc', 'stuck'].every((k) => I.COMPANION_TRIGGERS.includes(k)));
T('전 기능 설명 스펙 실거부', !F.guidedSpecAudit({ teachAll: true }).ok);
T('동시 팁 3 스펙 실거부', !F.guidedSpecAudit({ concurrent: 3 }).ok);
T('가르침 2개 팁 스펙 실거부', !F.guidedSpecAudit({ teach: ['a', 'b'] }).ok);
T('한 가지 팁 스펙 통과', F.guidedSpecAudit({ concurrent: 1, teach: ['a'] }).ok);

/* ============ 8. Confidence (§7) ============ */
sec('8. Confidence');
const cf = F.confidenceAudit();
T('"나도 할 수 있네" 명시', F.FEELING === '나도 할 수 있네.');
T('전 순간 공 = 사용자 · 보이는 결과', cf.ok, JSON.stringify(cf.violations));
T('AI 가 공을 갖는 스펙 실거부', !F.confidenceSpecAudit({ moments: [{ credit: 'ai' }] }).ok);
T('사용자 공 스펙 통과', F.confidenceSpecAudit({ moments: [{ credit: 'user' }] }).ok);

/* ============ 9. First Export (§8) ============ */
sec('9. First Export');
const ea = F.exportAudit();
T('1클릭 · 형식 결정 0 · 이탈 해소 브리지', ea.ok && ea.clicks === 1 && ea.formatDecisions === 0, JSON.stringify(ea.violations));
T('MK_JOURNEY export·share 이탈 해소 실측', J.dropAudit().rows.filter((r) => ['export', 'share'].includes(r.id)).every((r) => r.gone));

/* ============ 10. Second Project (§9) ============ */
sec('10. Second Project');
const sa2 = F.secondAudit();
T('6선택지 전부 다음 제안 실생성', sa2.ok && sa2.ideas === 6, JSON.stringify(sa2.violations));
T('제안이 첫 주제를 잇는다', F.OPTIONS.every((o) => { const s = F.secondRun(o.id); return s.ok && s.suggest.includes(s.topic); }));
T('여정 종착 = 완료 브리지', J.memoryTest().endsDone);

/* ============ 11. Emotion Map ============ */
sec('11. Emotion Map');
const em = F.emotionMapAudit();
T('감정 사상 7국면 전체·단조', em.ok, JSON.stringify(em.violations));
T('종착 감정 = 다시 오고 싶음(§11)', em.arc[em.arc.length - 1] === '다시 오고 싶음');
T('부정 감정 해소 선행(MK_INVIS)', I.emotionAudit().ok);

/* ============ 12. Wireframe·Prototype ============ */
sec('12. Wireframe·Prototype');
T('와이어프레임 7프레임 전부 라이브', F.wireframeAudit().ok && F.wireframeAudit().frames === 7);
const w = F.ftueWalk('present');
T('ftueWalk 실보행 — 전 국면 통과', w.ok, JSON.stringify(w.steps));
T('실보행 중 실생성·다음 제안', !!w.made && !!w.suggest);
T('첫 결과물 초 실합산 반환', w.firstResultSec <= 300 && w.totalSec <= 600);
T('보행 종착 = 홈(다음 시작)', window.PG.state.screen === 'home');
window.PG.go('ftue');

/* ============ 13. 지표 ============ */
sec('13. 지표');
T('5종 키', JSON.stringify(F.METRIC_KEYS) === JSON.stringify(['firstResultSec', 'tenMinDone', 'easyImpression', 'returnRate', 'secondStartRate']));
T('미실측 = null', F.metrics().every((m) => m.value === null && !m.measured));
T('미등록 지표 거부', !F.record('vanity', 1).ok);
T('비수치 거부', !F.record('returnRate', 'high').ok);
T('record 유일 경로 실기록', F.record('returnRate', 0.4).ok && F.metrics().find((m) => m.key === 'returnRate').value === 0.4);

/* ============ 14. 산출물·완료 (§10·§11) ============ */
sec('14. 산출물·완료');
const d = F.deliverables();
T('8종 전부 준비', F.deliverablesAudit().ok && d.length === 8, JSON.stringify(F.deliverablesAudit().open));
T('지시서 산출물 8종 실존', ['flow', 'welcome', 'ai-script', 'onboarding', 'metrics', 'emotion', 'wireframe', 'prototype'].every((id) => d.find((x) => x.id === id && x.ready)));
const ft = F.firstTimeTest();
T('설명 없이 첫 결과물', ft.ok && ft.noExplain && ft.walked, JSON.stringify(ft));
T('다시 돌아오고 싶다', ft.wantsBack);
T('complete() 충족', F.complete());
window.PG.go('ftue');

/* ============ 15. 회귀 가드 ============ */
sec('15. 회귀 가드');
T('ftue 화면 등재·8탭 렌더', typeof window.MK_SCREENS.ftue.render === 'function' && (window.MK_SCREENS.ftue.render().match(/data-ft-tab/g) || []).length === 8);
T('초보자 내비 불변(MK_SIMPLE)', S.navFor('beginner').length === 4);
T('MK_NAV 기본 구조 불변', window.MK_NAV.defaultAudit().ok && window.MK_NAV.rows().length === 4);
T('MK_JOURNEY 완료 조건 불변', J.complete());
T('홈 질문 하나 불변(MK_HOMEX)', H.realHomeAudit().parts.question.ok);

/* 화면 스모크 — 8탭 실렌더 + 실연 버튼 */
const root = window.document.createElement('div');
window.document.body.appendChild(root);
window.PG.state.screen = 'ftue';
const scr = window.MK_SCREENS.ftue;
for (const tab of ['over', 'flow', 'ask', 'win', 'guide', 'next', 'emo', 'out']) {
  root.innerHTML = ''; root.innerHTML = scr.render();
  scr.mount(root);
  const btn = root.querySelector(`[data-ft-tab="${tab}"]`);
  T('탭 실렌더 — ' + tab, !!btn);
  if (btn) { btn.onclick(); T('탭 본문 — ' + tab, root.innerHTML.length > 200); }
}
T('첫 질문 탭에서 튜토리얼 스펙 실거부 실연', (() => {
  root.innerHTML = scr.render(); scr.mount(root);
  const t = root.querySelector('[data-ft-tab="flow"]'); if (t) t.onclick();
  const b = root.querySelector('[data-ft-tuto]'); if (!b) return false;
  b.onclick();
  return root.innerHTML.includes('거부');
})());
T('선택지 버튼 실생성 실연', (() => {
  root.innerHTML = scr.render(); scr.mount(root);
  const t = root.querySelector('[data-ft-tab="ask"]'); if (t) t.onclick();
  const b = root.querySelector('[data-ft-opt="sns"]'); if (!b) return false;
  b.onclick();
  return root.innerHTML.includes('실생성');
})());

console.log(`\nRound 34: ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);   /* walk 실이동이 home 타이머를 남기므로 명시 종료 */
