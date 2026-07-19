/* Round 12 검증 — jsdom (전 화면 회귀 + AI Canvas Assistant 전용) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log('  ✓ ' + n + (x ? ' — ' + x : ''))) : (fail++, console.log('  ✗ ' + n + ' — ' + x)); };
const sec = (n) => console.log('\n[' + n + ']');

const PG = window.PG, AI = window.MK_AIED, HIST = window.MK_HIST;
const body = window.document.getElementById('pgBody');
const renderEditor = () => { const s = window.MK_SCREENS.editor; body.innerHTML = s.render('Design'); s.mount(body); };
const reset = (tpl = 'tpl-pr-presentation-01') => { PG.loadEditorDoc(tpl); HIST.reset(); PG.state.editor.aiLog = []; PG.state.editor.zoom = 1; };
const doc = () => PG.state.editor.doc;
const scene = () => doc().scenes[PG.state.editor.sceneIdx];

/* ---------- 1. 전 화면 회귀 ---------- */
sec('1. 전 화면 렌더 회귀');
for (const k of Object.keys(window.MK_SCREENS)) {
  const scr = window.MK_SCREENS[k];
  try {
    for (const v of scr.variants) { body.innerHTML = scr.render(v); if (scr.mount) scr.mount(body); }
    ok('screen: ' + k, true);
  } catch (e) { ok('screen: ' + k, false, e.message); }
}

/* ---------- 2. Canvas Context (STEP 1) ---------- */
sec('2. Canvas Context');
reset();
let c = AI.context();
ok('context 생성', !!c);
ok('project/templateId', c.project.length > 0 && c.templateId === 'tpl-pr-presentation-01', c.templateId);
ok('scene 정보', c.sceneId && c.sceneCount === 10 && c.sceneIdx === 0, `${c.sceneName} ${c.sceneCount}씬`);
ok('theme 인식', c.theme.paletteName === 'Ink & Teal' && c.theme.dark === true, `${c.theme.paletteName} dark=${c.theme.dark}`);
ok('typography/layer/assets', c.typography.count > 0 && c.layer.length === scene().elements.length, `text ${c.text} · layer ${c.layer.length}`);
ok('selection 반영', (() => { PG.state.editor.selEl = 2; return AI.context().selectedKind === 'text'; })());

/* ---------- 3. Command Parser (STEP 10) ---------- */
sec('3. Command Parser');
const P = [
  ['이 제목을 더 고급스럽게', 'text.premium'], ['이 이미지를 더 크게', 'el.bigger'], ['배경을 어둡게', 'scene.dark'],
  ['이 카드 3개를 정렬', 'distribute'], ['이 차트를 막대그래프로', 'chart.type'], ['표를 차트로', 'table.toChart'],
  ['차트를 표로', 'chart.toTable'], ['원형 그래프로', 'chart.type'], ['FAQ 페이지 추가', 'scene.add'],
  ['로드맵 하나 더', 'scene.add'], ['고객 후기 추가', 'scene.add'], ['CTA 추가', 'scene.add'],
  ['새 Scene 추가', 'scene.add'], ['이 페이지 삭제', 'scene.del'], ['슬라이드를 8장으로 줄여', 'project.scenes'],
  ['발표 시간을 5분으로 줄여', 'project.duration'], ['톤을 더 프리미엄하게', 'project.tone'],
  ['짧게', 'rewrite'], ['학생용으로', 'rewrite'], ['친근하게', 'rewrite'],
  ['배경 제거', 'img.bgremove'], ['이미지 추천', 'img.recommend'], ['이미지 교체', 'img.swap'], ['정방형으로 crop', 'img.crop'],
  ['더 미니멀하게', 'minimal'], ['여백 늘려', 'spacing'], ['제목 줄여', 'title.shorten'], ['색상 통일', 'color.unify'],
  ['브랜드 컬러 적용', 'theme.brand'], ['폰트 Pretendard', 'theme.font'], ['Apple 스타일', 'style.apple'],
  ['다크 모드', 'theme.darkmode'], ['테마를 코발트로', 'theme.palette'], ['되돌려줘', '@undo'], ['다시 실행', '@redo'],
];
let miss = [];
P.forEach(([q, a]) => { const r = AI.parse(q); if (!r || r.action !== a) miss.push(`${q}→${r ? r.action : 'null'}(기대 ${a})`); });
ok('지시서 명령 35종 파싱', miss.length === 0, miss.length ? miss.slice(0, 4).join(' / ') : `${P.length}/${P.length}`);
ok('미지원 문장은 null', AI.parse('오늘 점심 뭐 먹지') === null);

/* ---------- 4. Selection AI (STEP 2) ---------- */
sec('4. Selection AI — 실제 doc 변형');
reset();
PG.state.editor.selEl = scene().elements.findIndex((e) => e.kind === 'text');
let before = { ...scene().elements[PG.state.editor.selEl] };
let r = AI.run('이 제목을 더 고급스럽게');
let after = scene().elements[PG.state.editor.selEl];
ok('고급스럽게 → weight/size/색 변경', r.ok && after.weight === 700 && after.size > before.size && !!after.color, r.msg);
before = { ...after };
r = AI.run('더 크게');
ok('크게 → size 확대', scene().elements[PG.state.editor.selEl].size > before.size);
const bg0 = scene().background;
r = AI.run('배경을 밝게');
ok('배경 밝게 → background 변경', scene().background !== bg0 && !window.MK_SEC.isDark(scene().background), scene().background);
PG.state.editor.sceneIdx = 4; PG.state.editor.selEl = null;
const imgs0 = scene().elements.filter((e) => e.kind === 'image' && e.w > 8).map((e) => e.x);
r = AI.run('이 카드 3개를 정렬');
const imgs1 = scene().elements.filter((e) => e.kind === 'image' && e.w > 8);
ok('균등 배분 — 간격 동일', r.ok && imgs1.length > 1 && Math.abs((imgs1[1].x - imgs1[0].x) - (imgs1[2] ? imgs1[2].x - imgs1[1].x : imgs1[1].x - imgs1[0].x)) < 0.2, r.msg);
r = AI.run('색상 통일');
ok('색상 통일 — 전 텍스트 컬러 배정', r.ok && scene().elements.filter((e) => e.kind === 'text').every((e) => !!e.color), r.msg);

/* ---------- 5. Project AI (STEP 3) ---------- */
sec('5. Project AI');
reset();
const t0 = doc().scenes[3].elements.find((e) => e.kind === 'text' && e.size < 5);
const txt0 = t0 && t0.text;
r = AI.run('톤을 더 프리미엄하게');
ok('전체 톤 변경 — 10씬 텍스트 수정', r.ok && /10씬/.test(r.msg), r.msg);
r = AI.run('슬라이드를 8장으로 줄여');
ok('슬라이드 8장으로', r.ok && doc().scenes.length === 8, `${doc().scenes.length}장`);
ok('표지·마지막 장 보존', doc().scenes[0].name.includes('Cover') && doc().scenes[7].name.includes('Ending'), `${doc().scenes[0].name} / ${doc().scenes[7].name}`);
const d0 = doc().scenes.reduce((a, s) => a + s.duration, 0);
r = AI.run('발표 시간을 5분으로 줄여');
const d1 = doc().scenes.reduce((a, s) => a + s.duration, 0);
ok('발표 5분 — 씬 길이 재분배', r.ok && Math.abs(d1 - 300) < 60 && d1 !== d0, `${d0}s → ${d1}s`);

/* ---------- 6. Generate (STEP 4) ---------- */
sec('6. Scene Generate');
reset();
const n0 = doc().scenes.length;
for (const [cmd, name] of [['FAQ 페이지 추가', 'FAQ'], ['로드맵 하나 더', '로드맵'], ['고객 후기 추가', '고객 후기'], ['CTA 추가', 'CTA']]) {
  const rr = AI.run(cmd);
  ok(`${cmd} → 실섹션 생성`, rr.ok && doc().scenes[PG.state.editor.sceneIdx].name === name && doc().scenes[PG.state.editor.sceneIdx].elements.length >= 4, rr.msg);
}
ok('씬 수 +4', doc().scenes.length === n0 + 4, `${n0} → ${doc().scenes.length}`);
r = AI.run('이 페이지 삭제');
ok('페이지 삭제', r.ok && doc().scenes.length === n0 + 3);

/* ---------- 7. Rewrite (STEP 5) ---------- */
sec('7. Rewrite 7종');
const tones = [['짧게', 'short'], ['길게', 'long'], ['전문적으로', 'pro'], ['친근하게', 'friendly'], ['투자자용으로 수정', 'investor'], ['학생용으로', 'student']];
tones.forEach(([cmd, key]) => {
  reset(); PG.state.editor.sceneIdx = 3; PG.state.editor.selEl = null;
  const bs = scene().elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|');
  const rr = AI.run(cmd);
  const as = scene().elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|');
  ok(`${cmd} (${key})`, rr.ok && bs !== as, rr.msg.slice(0, 46));
});

reset(); PG.state.editor.sceneIdx = 3; PG.state.editor.selEl = null;
const formal0 = scene().elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|');
AI.run('친근하게');
const friendly1 = scene().elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|');
const rcorp = AI.run('기업용으로');
const back1 = scene().elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|');
ok('기업용 (corp) — 친근체 → 격식체 복원', rcorp.ok && friendly1 !== back1 && back1 === formal0, rcorp.msg.slice(0, 40));

/* ---------- 8. Image (STEP 6) ---------- */
sec('8. Image');
reset(); PG.state.editor.sceneIdx = 4;
const im = scene().elements.findIndex((e) => e.kind === 'image' && e.w > 8);
PG.state.editor.selEl = im;
const f0 = scene().elements[im].fill;
ok('이미지 교체 → fill 변경', AI.run('이미지 교체').ok && scene().elements[im].fill !== f0);
const h0 = scene().elements[im].h;
ok('정방형 crop → 비율 보정', AI.run('정방형으로 잘라줘').ok && scene().elements[im].h !== h0, `h ${h0} → ${scene().elements[im].h}`);
ok('배경 제거 → cutout', AI.run('배경 제거').ok && scene().elements[im].cutout === true);
const rc = AI.run('이미지 추천');
ok('이미지 추천은 doc 무변(noop)', rc.ok && rc.noop === true);

/* ---------- 9. Chart / Table (STEP 7) ---------- */
sec('9. Chart / Table');
reset(); PG.state.editor.sceneIdx = 1; PG.state.editor.selEl = null;
r = AI.run('표 추가');
const ti = scene().elements.findIndex((e) => e.kind === 'table');
ok('표 삽입', r.ok && ti >= 0 && scene().elements[ti].rows.length === 4);
r = AI.run('표를 차트로');
const ci = scene().elements.findIndex((e) => e.kind === 'chart');
ok('표 → 차트 (데이터 승계)', r.ok && ci >= 0 && scene().elements[ci].series.length === 4 && scene().elements[ci].series[3].v === 78, r.msg);
r = AI.run('원형 그래프로');
ok('차트 유형 → pie', r.ok && scene().elements[ci].chartType === 'pie');
r = AI.run('라인으로');
ok('차트 유형 → line', r.ok && scene().elements[ci].chartType === 'line');
r = AI.run('차트를 표로');
ok('차트 → 표 (역변환)', r.ok && scene().elements.find((e) => e.kind === 'table').rows.length === 4, r.msg);
/* 렌더 검증 */
PG.state.editor.sceneIdx = 1; renderEditor();
ok('캔버스에 표 렌더', body.querySelector('.ed-data .ed-tbl table') !== null);
AI.run('표를 차트로'); renderEditor();
ok('캔버스에 차트 SVG 렌더', body.querySelector('.ed-data svg rect') !== null);
ok('Scene Strip 미니에도 반영', body.querySelectorAll('.ed-strip svg, .ed-sc svg').length > 0 || body.innerHTML.includes('ed-tbl'));

/* ---------- 10. Theme (STEP 8) ---------- */
sec('10. Theme');
reset();
const bg1 = doc().scenes[0].background;
r = AI.run('테마를 코발트로');
ok('팔레트 교체 — 전 씬 배경 재매핑', r.ok && doc().paletteId === 'pl-cobalt' && doc().scenes[0].background !== bg1, `${bg1} → ${doc().scenes[0].background}`);
r = AI.run('강조색 #FF6B00 적용');
ok('accent 교체', r.ok && doc().accentOverride === '#ff6b00' || doc().accentOverride === '#FF6B00'.toLowerCase(), r.msg);
r = AI.run('다크 모드');
ok('다크 모드 — 전 씬 다크', r.ok && doc().scenes.every((s) => window.MK_SEC.isDark(s.background)), r.msg);
r = AI.run('라이트 모드');
ok('라이트 모드 복귀', r.ok && doc().scenes.every((s) => !window.MK_SEC.isDark(s.background)));
r = AI.run('폰트 Pretendard');
ok('폰트 적용', r.ok && doc().fontFamily === 'Pretendard');
r = AI.run('브랜드 컬러 적용');
ok('브랜드 적용', r.ok && doc().paletteId === 'pl-brand-kmaker'); /* R13: theme.brand → Brand System 경유로 승격 */
reset(); r = AI.run('Apple 스타일');
ok('Apple 스타일 — 중앙정렬·초대형 제목', r.ok && doc().scenes[1].elements.filter((e) => e.kind === 'text').every((e) => e.align === 'center'), r.msg);

/* ---------- 11. History (STEP 9) ---------- */
sec('11. History — Undo/Redo');
reset();
ok('초기 스택 비어 있음', !HIST.canUndo() && !HIST.canRedo());
const b0 = doc().scenes[0].background;
AI.run('배경을 밝게');
const b1 = doc().scenes[0].background;
ok('명령 후 undo 가능', HIST.canUndo() && b1 !== b0);
HIST.undo();
ok('undo → 원복', doc().scenes[0].background === b0, doc().scenes[0].background);
HIST.redo();
ok('redo → 재적용', doc().scenes[0].background === b1);
AI.run('FAQ 페이지 추가'); AI.run('색상 통일');
const dep = HIST.depth();
ok('연속 3동작 스택', dep.past === 3, JSON.stringify(dep));
HIST.undo(); HIST.undo(); HIST.undo();
ok('3회 undo → 최초 상태', doc().scenes.length === 10 && doc().scenes[0].background === b0);
ok('AI 명령 라벨 기록', (() => { AI.run('여백 늘려'); return HIST.list()[0].startsWith('AI · '); })(), HIST.list()[0]);
ok('undo 명령 자체도 파싱 실행', AI.run('되돌려줘').ok);
/* 실패 명령은 스택 오염 금지 */
reset(); PG.state.editor.sceneIdx = 8; PG.state.editor.selEl = null;
const dep0 = HIST.depth().past;
const rbad = AI.run('차트를 표로');
ok('실패 명령 — doc 무변 + 안내', !rbad.ok && !!rbad.msg, rbad.msg);
ok('실패해도 undo 스택 증가 없음', HIST.depth().past === dep0, `${dep0} → ${HIST.depth().past}`);

/* ---------- 12. UI 배선 ---------- */
sec('12. AI Dock UI');
reset(); PG.state.editor.menu = 'ai'; renderEditor();
ok('AI Dock 렌더', body.querySelector('.ed-aidock') !== null);
ok('Context 배지 노출', /씬 1\/10/.test(body.querySelector('.aid-ctx').textContent));
ok('빠른 명령 12종', body.querySelectorAll('.aid-chip').length === 12);
ok('입력창·실행 버튼', !!body.querySelector('[data-ed="ai-in"]') && !!body.querySelector('[data-ed="ai-run"]'));
const chip = body.querySelector('[data-cmd="여백 늘려"]');
const px0 = doc().scenes[0].elements.map((e) => e.y).join(',');
chip.click();
ok('칩 클릭 → 실제 캔버스 변경', doc().scenes[0].elements.map((e) => e.y).join(',') !== px0);
ok('대화 로그 누적(사용자+AI)', PG.state.editor.aiLog.length === 2 && PG.state.editor.aiLog[1].role === 'ai');
renderEditor();
ok('로그 화면 반영', body.querySelectorAll('.aid-msg').length === 2);
ok('툴바 undo 활성화', body.querySelector('[data-ed="undo"]') && !body.querySelector('[data-ed="undo"]').hasAttribute('disabled'));
body.querySelector('[data-ed="undo"]').click();
ok('툴바 undo 클릭 → 원복', doc().scenes[0].elements.map((e) => e.y).join(',') === px0);
/* 미지원 명령 */
PG.state.editor.menu = 'ai'; renderEditor();
const inp = body.querySelector('[data-ed="ai-in"]'); inp.value = '오늘 날씨 알려줘';
body.querySelector('[data-ed="ai-run"]').click();
ok('미지원 명령 — 예시 안내', PG.state.editor.aiLog.slice(-1)[0].err === true);

/* ---------- 13. 회귀 — Round 10/11 자산 무손상 ---------- */
sec('13. 기존 자산 회귀');
ok('템플릿 레지스트리 유지', window.MK_SAMPLE.TEMPLATES.length >= 10, window.MK_SAMPLE.TEMPLATES.length + '종');
ok('Pitch Deck 12씬 유지', (window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === 'pitch-deck-01') || {}).scenes.length === 12);
reset('pitch-deck-01');
ok('Pitch Deck에서도 AI 동작', AI.run('색상 통일').ok);
ok('signal 팔레트 역추적', AI.context().theme.paletteId === 'pl-signal', AI.context().theme.paletteName);
reset();
ok('원본 템플릿 불변 (§13)', window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === 'tpl-pr-presentation-01').scenes.length === 10);
body.innerHTML = window.MK_SCREENS.review.render('Design'); window.MK_SCREENS.review.mount(body);
ok('Review Mode 정상', body.querySelector('.ed--review') !== null);

console.log(`\n===== Round 12: ${pass} pass / ${fail} fail =====`);
process.exit(fail ? 1 : 0);
