/* Round 23 — Flow Experience System 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/flow' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const FL = window.MK_FLOW, BR = window.MK_BRAND;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);
const mkDoc = () => ({ title: 'd', scenes: [{ id: 's1', sec: 'cover', elements: [{ type: 'text', text: '금성초 여름 발표', x: 11, y: 13 }] }] });
BR.seed(); BR.setActive(BR.list()[0].brandId);

/* ============ 1. 기반·클록 ============ */
sec('1. 기반·클록');
T('MK_FLOW 존재·공개 표면', typeof FL.execute === 'function' && typeof FL.search === 'function' && typeof FL.predict === 'function');
T('내부 클록 정오 앵커', new Date(FL._now()).getUTCHours() === 3);
const c0 = FL._now(); FL._tick(FL.MIN);
T('_tick 전진', FL._now() - c0 === FL.MIN);

/* ============ 2. Micro Interaction(§16) ============ */
sec('2. Micro Interaction');
T('기본 모션 8종 등록', Object.keys(FL.MOTION).length >= 8);
T('전 모션 150~250ms', Object.values(FL.MOTION).every((m) => m.ms >= 150 && m.ms <= 250));
T('149ms 등록 거부', FL.motionRegister('fast', 149).ok === false);
T('300ms 등록 거부', FL.motionRegister('slow', 300).ok === false);
T('200ms 등록 허용', FL.motionRegister('ok200', 200).ok === true && FL.MOTION.ok200.ms === 200);

/* ============ 3. Command·One Click(§12)·Keyboard First(§18) ============ */
sec('3. Command·클릭 상한·단축키');
T('명령 18종 이상', FL.CMDS.length >= 18);
T('전 명령 클릭 ≤3', FL.CMDS.every((c) => c.clicks <= 3));
T('자주 쓰는 작업 1클릭 다수', FL.CMDS.filter((c) => c.clicks === 1).length >= 10);
T('전 명령 단축키 보유', FL.CMDS.every((c) => !!c.key));
T('4클릭 명령 등록 거부', FL.cmdRegister({ id: 'x4', label: 'x', key: 'F9', clicks: 4 }).ok === false);
T('단축키 없는 명령 거부', FL.cmdRegister({ id: 'nk', label: 'x', clicks: 1 }).ok === false);
T('단축키 충돌 등록 거부', FL.cmdRegister({ id: 'dup', label: 'x', key: 'Ctrl+S', clicks: 1 }).ok === false);
const rm = FL.cmdRemap('crop', 'Shift+C');
T('리맵 성공·KEYMAP 갱신', rm.ok && FL.KEYMAP['Shift+C'] === 'crop' && !FL.KEYMAP['C']);
T('리맵 충돌 거부', FL.cmdRemap('crop', 'Ctrl+S').ok === false);
T('keyboardMap 전 명령 포함', FL.keyboardMap().length === FL.CMDS.length);

/* ============ 4. Smart Interface(§3)·Progressive(§4) ============ */
sec('4. Smart Interface');
T('선택 없음 → none 툴바(삽입·AI)', FL.toolbarFor(null).kind === 'none' && FL.toolbarFor(null).tools.includes('ai-ask'));
T('텍스트 선택 → Text Toolbar', FL.toolbarFor({ type: 'text' }).tools.includes('font'));
T('이미지 선택 → Image Toolbar', FL.toolbarFor({ type: 'image' }).tools.includes('crop'));
T('표 선택 → Table Toolbar', FL.toolbarFor({ type: 'table' }).tools.includes('merge'));
T('다중 선택 → multi 툴바', FL.toolbarFor({ multi: true }).tools.includes('distribute'));
T('세 툴바 구성 전부 상이', JSON.stringify(FL.TOOLBARS.text) !== JSON.stringify(FL.TOOLBARS.image) && JSON.stringify(FL.TOOLBARS.image) !== JSON.stringify(FL.TOOLBARS.table));
const tl0 = FL.toolsFor({ type: 'image' });
T('전문 도구 초기 숨김', tl0.pro.length === 0 && tl0.proHidden >= 3);
T('expand 시 전문 도구 노출', FL.toolsFor({ type: 'image' }, { expand: true }).pro.includes('curves'));

/* ============ 5. Zero Friction(§2) — 자동 이름·정렬·그룹·순서 ============ */
sec('5. Zero Friction');
const d0 = mkDoc();
T('자동 이름 — 내용에서 생성', FL.autoName(d0).startsWith('금성초 여름 발표'));
T('자동 이름 — 빈 doc 폴백', FL.autoName({ scenes: [] }).includes('새 디자인'));
const al = FL.autoAlign({ elements: [{ x: 11, y: 13 }, { x: 16, y: 24 }, { x: 8, y: 8 }] });
T('자동 정렬 — 8% 스냅·이동 수 보고', al.moved === 1 && al.scene.elements[0].x === 8 && al.scene.elements[0].y === 16 && al.scene.elements[1].x === 16 && al.scene.elements[2].x === 8);
const gr = FL.autoGroup({ elements: [{ x: 10, y: 10 }, { x: 15, y: 15 }, { x: 80, y: 80 }, { x: 85, y: 82 }] });
T('자동 그룹 — 근접 2클러스터', gr.length === 2 && gr[0].length === 2 && gr[1].length === 2);
const so = FL.autoSort([{ sec: 'outro' }, { sec: 'cover' }, { sec: 'body' }, { sec: 'toc' }]);
T('자동 순서 — 스토리 랭크', so[0].sec === 'cover' && so[1].sec === 'toc' && so[3].sec === 'outro' && so.every((s, i) => s.order === i));

/* ============ 6. 자동 저장 — 디바운스 ============ */
sec('6. 자동 저장');
const d1 = mkDoc();
const sc0 = FL.saveState().count;
FL.markDirty(d1);
T('dirty 표시', FL.saveState().state === 'dirty');
FL._tick(FL.SEC);
T('1초 — 아직 저장 안 됨(디바운스)', FL.saveState().state === 'dirty');
FL._tick(1.5 * FL.SEC);
T('2.5초 — 자동 저장 커밋', FL.saveState().state === 'saved' && FL.saveState().count === sc0 + 1);

/* ============ 7. 확인 정책·Error Prevention(§17) ============ */
sec('7. 확인 정책·가드');
T('저장·정렬 — 무확인', !FL.confirmPolicy('save').needsConfirm && !FL.confirmPolicy('align').needsConfirm);
T('삭제 — 확인 필요', FL.confirmPolicy('delete').needsConfirm === true);
T('삭제 가드 — confirm 게이트', FL.guard('delete').gate === 'confirm');
T('빈 문서 Export — block', FL.guard('export', { doc: { scenes: [] } }).gate === 'block');
const gfix = FL.guard('align', { color: '#ff00aa' });
T('브랜드 외 색 — autofix 제안', gfix.gate === 'autofix' && /^#/.test(gfix.fix.color));
T('브랜드 색 — 통과', FL.guard('align', { color: BR.active().color.primary }).ok === true);

/* ============ 8. Flow Engine(§1)·Execute·Continue ============ */
sec('8. Flow Engine');
const d2 = mkDoc();
const e1 = FL.execute('insert-image', d2, { confirmed: true });
T('execute 성공·doc 실변형', e1.ok && d2.scenes[0].elements.some((e) => e.type === 'image'));
T('Continue — 다음 3추천 반환', e1.next.length === 3 && e1.next.some((n) => n.id === 'crop'));
T('실행에 모션 스펙 동반', e1.motion && e1.motion.ms >= 150 && e1.motion.ms <= 250);
T('미지 명령 거부', FL.execute('nope', d2).ok === false);
const eDel = FL.execute('delete', d2);
T('파괴적 — 확인 전 차단', eDel.ok === false && eDel.needsConfirm === true);
T('파괴적 — 확인 후 실행', FL.execute('delete', d2, { confirmed: true }).ok === true);
const fs1 = FL.flowStep(null, d2, { confirmed: true });
T('flowStep — 예측 최상위 자동 실행', fs1.executed.ok && fs1.predicted.length === 3);

/* ============ 9. Predictive Actions(§6) — 체인·학습 ============ */
sec('9. Predictive Actions');
const p1 = FL.predict('insert-image');
T('이미지 삽입 → Crop 최상위', p1[0].id === 'crop' && p1.some((x) => x.id === 'shadow'));
T('crop → shadow → align 체인', FL.CHAIN.crop.includes('shadow') && FL.CHAIN.shadow.includes('align'));
const w0 = p1.find((x) => x.id === 'shadow').score;
FL.accept('insert-image', 'shadow'); FL.accept('insert-image', 'shadow'); FL.accept('insert-image', 'shadow'); FL.accept('insert-image', 'shadow');
T('수용 학습 → 순위 상승', FL.predict('insert-image')[0].id === 'shadow' && FL.predict('insert-image').find((x) => x.id === 'shadow').score > w0);
FL.dismiss('insert-image', 'shadow'); FL.dismiss('insert-image', 'shadow'); FL.dismiss('insert-image', 'shadow'); FL.dismiss('insert-image', 'shadow'); FL.dismiss('insert-image', 'shadow'); FL.dismiss('insert-image', 'shadow');
T('무시 학습 → 순위 하락', FL.predict('insert-image')[0].id === 'crop');

/* ============ 10. Instant Preview(§9) — 무커밋 ============ */
sec('10. Instant Preview');
const d3 = mkDoc();
const snap = JSON.stringify(d3);
const pv = FL.previewFor('insert-text', d3);
T('Preview 변경 시뮬', pv.ok && pv.changed && pv.after.scenes[0].elements.length === 2);
T('원본 doc 무변형', JSON.stringify(d3) === snap);
T('미지 명령 Preview 거부', FL.previewFor('nope', d3).ok === false);

/* ============ 11. Undo Philosophy(§10) ============ */
sec('11. Undo');
const d4 = mkDoc();
FL.execute('insert-text', d4, { confirmed: true });
FL.execute('insert-image', d4, { confirmed: true });
const dep0 = FL.undoDepth().undo;
const u1 = FL.undo(d4);
T('undo — 마지막 작업 복원', u1.ok && !d4.scenes[0].elements.some((e) => e.type === 'image'));
const r1 = FL.redo(d4);
T('redo — 재적용', r1.ok && d4.scenes[0].elements.some((e) => e.type === 'image'));
FL.undo(d4);
FL.execute('insert-table', d4, { confirmed: true });
T('undo 후 새 작업 → redo 꼬리 절단', FL.undoDepth().redo === 0);
T('AI(agent) 소스도 동일 스택', (() => { const b = JSON.parse(JSON.stringify(d4)); d4.scenes[0].elements.push({ type: 'text', text: 'ai' }); FL._record('AI 편집', b, d4, 'ai'); return FL.undo(d4).label === 'AI 편집'; })());
T('빈 스택 undo 거부', (() => { const dd = { a: 1 }; let n = 0; while (FL.undo(dd).ok) { n++; if (n > 99) return false; } return FL.undo(dd).ok === false; })());

/* ============ 12. Universal Search(§8) ============ */
sec('12. Universal Search');
T('8도메인 정의', FL.SEARCH_DOMAINS.length === 8);
const s1 = FL.search('브랜드');
T('명령·브랜드 도메인 동시 히트', s1.domains.includes('command') && s1.domains.includes('brand'));
const s2 = FL.search('메이커');
T('템플릿·프로젝트 검색 관통', s2.total >= 1);
const s3 = FL.search('설정');
T('Settings 도메인 히트', s3.domains.includes('settings'));
T('빈 질의 → 빈 결과', FL.search('').total === 0);
T('접두 > 부분 랭킹', (() => { const r = FL.search('내보'); const cmd = r.groups.find((g) => g.domain === 'command'); return cmd && cmd.items[0].label.startsWith('내보'); })());
T('AI 도메인(에이전트 명령) 검색', FL.search('피치').domains.includes('ai'));

/* ============ 13. Smart Empty State(§11)·Smart Defaults(§15) ============ */
sec('13. Empty State·Defaults');
const es = FL.emptyState('home');
T('빈 화면 금지 — 추천·AI 항상 존재', es.never_empty && es.recommend.length >= 1 && es.ai.length >= 1 && !!es.cta);
const df0 = FL.defaultsFor('poster');
T('AI 기본값 — 브랜드 팔레트 반영', df0.source === 'ai' && df0.palette === BR.active().color.primary);
FL.overrideDefault('poster', { ratio: '1:1' });
const df1 = FL.defaultsFor('poster');
T('사용자 수정 → 학습된 기본값', df1.ratio === '1:1' && df1.source === 'learned' && df1.font === df0.font);
T('다른 종류 기본값 불오염', FL.defaultsFor('deck').ratio === '16:9');

/* ============ 14. Context Awareness(§5) ============ */
sec('14. Context Awareness');
FL.setSelection({ type: 'image' });
const cx = FL.context();
T('선택·브랜드·패턴 인지', cx.selection.type === 'image' && cx.brand.name && Array.isArray(cx.patterns.topCommands));
T('상위 명령이 실사용 순', cx.patterns.topCommands.length >= 1);
FL.setSelection(null);
T('선택 해제 반영', FL.context().selection === null);

/* ============ 15. Adaptive Workspace(§14) ============ */
sec('15. Adaptive Workspace');
const d5 = mkDoc();
FL.execute('insert-image', d5, { confirmed: true }); FL.execute('insert-image', d5, { confirmed: true });
const lay = FL.layoutRecommend();
T('이미지 빈도 → Asset 패널 전면', lay.panels[0] === 'assets' && lay.reason.includes('이미지'));
T('1클릭 선반 — 사용 상위', lay.shelf.length >= 1 && lay.shelf.every((s) => s.key));
const ap = FL.layoutApply();
T('적용·초기화 왕복', ap.shelf.length >= 1 && FL.layoutReset().shelf.length === 0);

/* ============ 16. Journey(§21)·Delight(§20) ============ */
sec('16. Journey·Delight');
const j0 = FL.journey();
T('여정 6단계·first_run 완료', j0.steps.length === 6 && j0.steps[0].done);
const d6 = mkDoc();
FL.execute('new-project', d6, { confirmed: true });
FL.execute('export', d6, { confirmed: true });
FL.execute('ai-ask', d6, { confirmed: true });
FL.execute('share', d6, { confirmed: true });
FL.execute('market-open', d6, { confirmed: true });
const j1 = FL.journey();
T('전 단계 완주', j1.progress === '6/6');
T('Delight 5순간 — 모션 규격', j1.delights.length === 5 && j1.delights.every((d) => d.motion.ms >= 150 && d.motion.ms <= 250));
T('중복 마일스톤 무발화', (FL.execute('export', d6, { confirmed: true }), FL.journey().delights.length === 5));

/* ============ 17. Analytics(§13)·Metrics(§22) ============ */
sec('17. Analytics·Metrics');
const sid = 'fx-1';
FL.track('open', { sid }); FL._tick(2 * FL.SEC);
FL.track('pick_template', { sid }); FL._tick(3 * FL.SEC);
FL.track('edit', { sid });
const sid2 = 'fx-2';
FL.track('open', { sid: sid2 });                       /* 템플릿 못 고르고 이탈 */
const f1 = FL.funnel();
T('퍼널 — 세션 집계·이탈 지점', f1.sessions >= 2 && f1.steps[1].dropoff >= 1 && f1.worst && f1.worst.step === 'pick_template');
const mt = FL.metrics();
T('지표 6종 산출', 'timeToFirstDesign' in mt && 'timeToExport' in mt && 'clicksPerTask' in mt && 'undoRate' in mt && 'dropoff' in mt && 'completionRate' in mt);
T('undoRate 0~1', mt.undoRate >= 0 && mt.undoRate <= 1);

/* ============ 18. Personas(§23) ============ */
sec('18. Personas');
T('페르소나 6종(초보~학생)', Object.keys(FL.PERSONAS).length === 6);
const pr = FL.personaRun('novice');
T('초보 — 3스텝 완주·클릭 집계', pr.ok && pr.steps === 3 && pr.clicks >= 3 && pr.doc._exported === 1);
const mx = FL.personaMatrix();
T('전원 완주·클릭/스텝 ≤ 2', mx.every((r) => r.ok) && mx.every((r) => r.clicksPerStep <= 2));
T('전문가 — 체인 추종 발생', mx.find((r) => r.persona === '전문가').followedChain >= 1);
T('미지 페르소나 거부', FL.personaRun('ghost').ok === false);

/* ============ 19. Accessibility(§19) ============ */
sec('19. Accessibility');
const a = FL.a11y();
T('키보드 100%·낭독 트리·음성 브리지', a.keyboard.fullCoverage && a.screenReader.tree.length >= 5 && a.voice.via === 'MK_AGENT.voice');
T('대비 실계산 — 흰 바탕 인디고 AA', FL.contrast('#4f46e5', '#ffffff') >= 4.5);
T('저대비 판정', a.contrast.aa('#cccccc', '#ffffff') === false);

/* ============ 20. Report(§24)·완료 조건(§25) ============ */
sec('20. Deliverables·완료 조건');
const rep = FL.usabilityReport();
T('원칙 8·리포트 전항목', FL.PRINCIPLES.length === 8 && rep.keyboardCoverage && rep.motionCompliant && rep.maxClicks <= 3);
T('완주율·여정 리포트 반영', rep.journey === '6/6' && rep.metrics.completionRate !== null);

/* ============ 21. 화면 #/flow ============ */
sec('21. 화면');
const SCR = window.MK_SCREENS.flow;
T('화면 등록', !!SCR && typeof SCR.render === 'function');
const hostEl = window.document.createElement('div');
hostEl.innerHTML = SCR.render();
window.document.body.appendChild(hostEl);
T('8탭 렌더', hostEl.querySelectorAll('[data-fl-tab]').length === 8);
SCR.mount(window.document);
for (const tb of ['palette', 'predict', 'smart', 'friction', 'journey', 'analytics', 'guard']) {
  const btn = window.document.querySelector(`[data-fl-tab="${tb}"]`);
  btn.click();
  T(`탭 ${tb} 전환 렌더`, !!window.document.querySelector('.fl-body'));
}
window.document.querySelector('[data-fl-tab="predict"]').click();
const runBtn = window.document.querySelector('[data-fl-x]');
runBtn.click();
T('화면 버튼 실함수(execute 경로)', !!window.document.querySelector('.mk-banner'));

console.log(`\nRound23 결과: ${pass}/${pass + fail}${fail ? '  ✗ FAIL ' + fail : '  ✓ ALL PASS'}`);
process.exit(fail ? 1 : 0);
