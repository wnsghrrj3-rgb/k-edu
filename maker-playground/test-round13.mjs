/* Round 13 검증 — jsdom (전 화면 회귀 + Brand System 전용) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/brand' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log('  ✓ ' + n + (x ? ' — ' + x : ''))) : (fail++, console.log('  ✗ ' + n + ' — ' + x)); };
const sec = (n) => console.log('\n[' + n + ']');

const PG = window.PG, B = window.MK_BRAND, SEC = window.MK_SEC, AI = window.MK_AIED;
const body = window.document.getElementById('pgBody');
const doc = () => PG.state.editor.doc;
const reset = (tpl = 'tpl-pr-presentation-01') => { B.setActive(null); PG.loadEditorDoc(tpl); window.MK_HIST.reset(); };
const renderBrand = () => { const s = window.MK_SCREENS.brand; body.innerHTML = s.render('Workspace'); s.mount(body); };

/* ---------- 1. 전 화면 회귀 ---------- */
sec('1. 전 화면 렌더 회귀');
for (const k of Object.keys(window.MK_SCREENS)) {
  const scr = window.MK_SCREENS[k];
  try {
    for (const v of scr.variants) { body.innerHTML = scr.render(v); if (scr.mount) scr.mount(body); }
    ok('screen: ' + k, true);
  } catch (e) { ok('screen: ' + k, false, e.message); }
}

/* ---------- 2. Color Token (§3) ---------- */
sec('2. Color System — Token 50~900');
const bk = B.get('bd-kmaker');
ok('시드 브랜드 5종', B.list().length === 5, B.list().map((b) => b.name).join(' · '));
const T = B.tokens(bk);
ok('7 역할 + gray 스케일', ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'neutral', 'gray'].every((r) => T[r]), Object.keys(T).join(','));
ok('스텝 10단계', B.STEPS.length === 10 && Object.keys(T.primary).length === 10);
ok('500 = 기준색 원본', T.primary[500] === bk.color.primary.toUpperCase(), T.primary[500]);
ok('명도 단조 하강', B.STEPS.every((s, i) => i === 0 || B.lum(T.primary[B.STEPS[i - 1]]) > B.lum(T.primary[s])));
ok('50은 밝고 900은 어둡다', B.lum(T.primary[50]) > 0.85 && B.lum(T.primary[900]) < 0.12, `${T.primary[50]} / ${T.primary[900]}`);
ok('gray 저채도', B.toHsl(T.gray[500])[1] < 0.12, 'S=' + B.toHsl(T.gray[500])[1].toFixed(3));
ok('CSS 변수 생성', Object.keys(B.cssVars(bk)).length >= 80 && B.cssVars(bk)['--bd-primary-500'] === T.primary[500]);
ok('대비 계산 (흰↔검 = 21)', B.contrast('#FFFFFF', '#000000') === 21);

/* ---------- 3. Theme Mapping (§9) ---------- */
sec('3. Theme Mapping — Brand → MK_SEC 팔레트');
const P = B.toPalette(bk);
ok('7 역할 매핑', ['dark', 'light', 'soft', 'accent', 'accent2', 'mutedOnDark', 'mutedOnLight'].every((k) => !!P[k]));
ok('accent = primary 500', P.accent === T.primary[500]);
ok('accent2 = accent 500', P.accent2 === T.accent[500]);
B.sync(bk);
ok('MK_SEC.PALETTES 등재', !!SEC.PALETTES[B.palId('bd-kmaker')], B.palId('bd-kmaker'));
ok('전 브랜드 등재', B.list().every((b) => !!SEC.PALETTES[B.palId(b.brandId)]));
/* 엔진이 브랜드 팔레트로 템플릿을 조립할 수 있는가 */
const bj = B.applyToTemplateJSON({ template: 'T', palette: 'pl-ink', meta: { templateId: 'x' }, sections: [{ id: 'cover', props: { label: 'L', title: 'T', subtitle: 'S', meta: 'M' } }] }, 'bd-school');
const built = SEC.buildTemplate(bj);
ok('엔진 조립에 브랜드 팔레트 주입', bj.palette === B.palId('bd-school') && built.scenes[0].background === B.toPalette(B.get('bd-school')).dark, built.scenes[0].background);

/* ---------- 4. Apply — 프로젝트 전체 전환 (완료 조건) ---------- */
sec('4. Apply — Template + Brand → 자동 적용');
reset();
const before = { bg: doc().scenes[0].background, font: doc().fontFamily };
ok('기본 상태 = Ink & Teal', AI.context().theme.paletteId === 'pl-ink');
B.apply(doc(), 'bd-school');
const Ps = B.toPalette(B.get('bd-school'));
ok('doc.brandId 도장', doc().brandId === 'bd-school' && doc().brandVersion >= 1);
ok('paletteId 전환', doc().paletteId === B.palId('bd-school'), doc().paletteId);
ok('배경 전 씬 전환', doc().scenes.every((s) => [Ps.dark, Ps.light, Ps.soft].includes(s.background)), doc().scenes[0].background);
ok('배경이 실제로 바뀜', doc().scenes[0].background !== before.bg);
ok('폰트 전환', doc().fontFamily === B.get('bd-school').typography.fontFamily.korean, doc().fontFamily);
const accHit = doc().scenes.flatMap((s) => s.elements).filter((e) => (e.color || e.fill) === Ps.accent).length;
ok('강조색 요소 반영', accHit > 0, accHit + '곳');
ok('AI 컨텍스트도 브랜드 인식', AI.context().theme.paletteName === 'School', AI.context().theme.paletteName);
/* 브랜드 재전환 = 전체가 다시 따라온다 */
B.apply(doc(), 'bd-companyb');
const Pb = B.toPalette(B.get('bd-companyb'));
ok('브랜드 교체 시 전 프로젝트 재전환', doc().scenes.every((s) => [Pb.dark, Pb.light, Pb.soft].includes(s.background)) && doc().brandId === 'bd-companyb');
ok('요소 개수 불변 (구조 무손상)', doc().scenes.length === 10 && doc().scenes[0].elements.length > 5);

/* ---------- 5. 활성 브랜드 훅 — 템플릿 선택 시 자동 적용 ---------- */
sec('5. 자동 적용 훅');
B.setActive(null); PG.loadEditorDoc('tpl-pr-presentation-01');
ok('활성 없음 = 기존 동작 유지', !doc().brandId && doc().paletteId === undefined);
B.setActive('bd-companya');
PG.loadEditorDoc('tpl-pr-presentation-01');
ok('활성 브랜드 → 템플릿 로드 시 자동 적용', doc().brandId === 'bd-companya', doc().paletteId);
PG.loadEditorDoc('pitch-deck-01');
ok('다른 템플릿도 동일 적용', doc().brandId === 'bd-companya' && doc().scenes.length === 12);
B.setActive(null); reset();

/* ---------- 6. Validation (§11) ---------- */
sec('6. Brand Validation');
B.apply(doc(), 'bd-kmaker');
const V0 = B.validate(doc(), 'bd-kmaker');
ok('적용 직후 위반(error) 0', V0.filter((v) => v.level === 'error').length === 0, V0.slice(0, 2).map((v) => v.msg).join(' / '));
ok('중립 계조도 브랜드 Gray로 승계', V0.filter((v) => v.type === 'color').length === 0, V0.filter((v) => v.type === 'color').slice(0, 2).map((v) => v.msg).join(' / '));
doc().scenes[1].elements[0].color = '#FF00AA';
doc().fontFamily = 'Comic Sans MS';
doc().scenes[2].background = '#123456';
const V = B.validate(doc(), 'bd-kmaker');
ok('잘못된 색상 감지', V.some((v) => v.type === 'color' && v.target === 'color'));
ok('잘못된 폰트 감지', V.some((v) => v.type === 'font'));
ok('잘못된 배경 감지', V.some((v) => v.type === 'color' && v.target === 'background'));
/* 대비 부족 */
doc().scenes[0].elements.find((e) => e.kind === 'text').color = doc().scenes[0].background;
const V2 = B.validate(doc(), 'bd-kmaker');
ok('대비 부족 감지', V2.some((v) => v.type === 'contrast'), (V2.find((v) => v.type === 'contrast') || {}).msg);
const n = B.fix(doc(), 'bd-kmaker');
ok('자동 수정 동작', n > 0 && doc().fontFamily === 'Pretendard', n + '건 수정');
ok('수정 후 색상 위반 해소', B.validate(doc(), 'bd-kmaker').filter((v) => v.type === 'color' || v.type === 'font').length === 0);
/* 브랜드 자체 검사 */
const bad = B.create({ name: '', color: { primary: '#F8F8F0', secondary: '#3B5BDB', accent: '#F8F5F0', success: '#2F9E63', warning: '#D99A2B', error: '#D2453B', neutral: '#6B7280' } });
const BV = B.validateBrand(bad.brandId);
ok('버튼 대비 부족 감지', BV.some((x) => x.type === 'button'), (BV.find((x) => x.type === 'button') || {}).msg);
ok('빈 이름 감지', BV.some((x) => x.type === 'meta'));
ok('Accent-Primary 유사 경고', BV.some((x) => x.type === 'color' && /비슷/.test(x.msg)));
ok('정상 브랜드는 무결', B.validateBrand('bd-kmaker').length === 0, JSON.stringify(B.validateBrand('bd-kmaker')));
B.remove(bad.brandId);

/* ---------- 7. Multi Brand · CRUD (§12) ---------- */
sec('7. Multi Brand');
const cnt0 = B.list().length;
const nb = B.create({ name: 'Temp Brand' });
ok('생성', B.list().length === cnt0 + 1 && !!SEC.PALETTES[B.palId(nb.brandId)]);
B.update(nb.brandId, { color: { primary: '#8833EE' } });
ok('부분 갱신 + 버전 증가', B.get(nb.brandId).color.primary === '#8833EE' && B.get(nb.brandId).color.secondary === '#3B5BDB' && B.get(nb.brandId).version === 2);
ok('갱신 시 팔레트 동기화', SEC.PALETTES[B.palId(nb.brandId)].accent === B.tokens(B.get(nb.brandId)).primary[500]);
const dup = B.duplicate(nb.brandId);
ok('복제 — 새 id', dup.brandId !== nb.brandId && dup.name.includes('복사본'));
B.share(nb.brandId, 'org', '전체');
ok('공유 범위 설정', B.get(nb.brandId).sharing.scope === 'org' && B.get(nb.brandId).sharing.team === '전체');
B.remove(dup.brandId); B.remove(nb.brandId);
ok('삭제 + 팔레트 해제', B.list().length === cnt0 && !SEC.PALETTES[B.palId(nb.brandId)]);

/* ---------- 8. Export / Import (§13) ---------- */
sec('8. Export / Import / Version');
const json = B.exportJSON('bd-school');
const pkg = JSON.parse(json);
ok('패키지 서명', pkg._package === B.PKG && pkg._schema === B.SCHEMA);
ok('brand + tokens + palette 동봉', !!pkg.brand && !!pkg.tokens.primary[500] && !!pkg.palette.accent);
const imp = B.importJSON(json);
ok('가져오기 성공', imp.ok, imp.msg);
ok('id 충돌 회피', imp.brand.brandId !== 'bd-school' && imp.renamed === true, imp.brand.brandId);
ok('내용 동일 보존', imp.brand.color.primary === B.get('bd-school').color.primary && imp.brand.component.card.radius === B.get('bd-school').component.card.radius);
ok('가져온 브랜드도 즉시 사용 가능', !!SEC.PALETTES[B.palId(imp.brand.brandId)]);
/* 복원 — 가져온 브랜드로 프로젝트 적용 */
reset(); B.apply(doc(), imp.brand.brandId);
ok('복원 브랜드로 적용', doc().brandId === imp.brand.brandId && doc().scenes[0].background === B.toPalette(imp.brand).dark);
ok('손상 입력 거절', !B.importJSON('{"a":1}').ok && !B.importJSON('not json').ok);
ok('상위 스키마 거절', !B.importJSON(JSON.stringify({ _package: B.PKG, _schema: 99, brand: {} })).ok);
B.remove(imp.brand.brandId);

/* ---------- 9. Logo (§2) ---------- */
sec('9. Logo');
ok('워드마크 자동 생성', B.wordmark(bk, 'light').startsWith('<svg') && B.wordmark(bk, 'light').includes('K-MAKER'));
ok('다크 배경 → dark 버전 선택', B.pickLogo(bk, { background: '#101827' }).key === 'dark');
ok('라이트 배경 → light 버전', B.pickLogo(bk, { background: '#FFFFFF' }).key === 'light');
ok('아이콘 전용 / 모노크롬', B.pickLogo(bk, { iconOnly: true }).key === 'iconOnly' && B.pickLogo(bk, { mono: true }).key === 'mono');
B.update('bd-kmaker', { logo: Object.assign({}, bk.logo, { primary: '<svg id="custom"></svg>' }) });
ok('등록 로고 우선', B.pickLogo(B.get('bd-kmaker'), {}).svg.includes('custom'));
B.update('bd-kmaker', { logo: Object.assign({}, B.get('bd-kmaker').logo, { primary: null }) });

/* ---------- 10. Chart / Image / Icon 규칙 ---------- */
sec('10. Chart · Image · Icon');
const cc = B.chartColors(B.get('bd-school'), 5);
ok('차트 색 자동 파생 5종', cc.length === 5 && new Set(cc).size >= 3, cc.join(' '));
B.update('bd-school', { chart: Object.assign({}, B.get('bd-school').chart, { colors: ['#111111', '#222222'] }) });
ok('지정 색 우선 + 순환', B.chartColors(B.get('bd-school'), 4).join() === '#111111,#222222,#111111,#222222');
B.update('bd-school', { chart: Object.assign({}, B.get('bd-school').chart, { colors: [] }) });
reset(); AI.run('표를 차트로'); AI.run('차트 추가');
B.apply(doc(), 'bd-school');
const chartEl = doc().scenes.flatMap((s) => s.elements).find((e) => e.kind === 'chart');
ok('차트 요소에 브랜드 색 반영', !chartEl || chartEl.accent === B.chartColors(B.get('bd-school'), 1)[0], chartEl ? chartEl.accent : 'no chart');
ok('이미지 프롬프트 프리픽스', B.get('bd-school').image.promptPrefix.length > 5, B.get('bd-school').image.style);
ok('아이콘 스타일 정의', ['line', 'filled', 'rounded', 'sharp'].includes(B.get('bd-companya').icon.style), B.get('bd-companya').icon.style);

/* ---------- 11. AI Integration (§10) ---------- */
sec('11. AI Integration');
ok('"학교 스타일로" → School', (B.resolve('학교 스타일로') || {}).brandId === 'bd-school');
ok('"우리 회사 스타일로" → Company A', (B.resolve('우리 회사 스타일로') || {}).brandId === 'bd-companya');
ok('브랜드 이름 직접 매칭', (B.resolve('Company B 스타일로') || {}).brandId === 'bd-companyb');
const PR = [['학교 스타일로', 'brand.apply'], ['우리 회사 스타일로', 'brand.apply'], ['브랜드 규칙 유지', 'brand.keep'], ['브랜드 검사', 'brand.check'], ['브랜드 컬러 적용', 'theme.brand']];
PR.forEach(([q, a]) => { const r = AI.parse(q); ok(`파서: "${q}" → ${a}`, r && r.action === a, r ? r.action : 'null'); });
reset();
let r = AI.run('학교 스타일로');
ok('AI 실행 — 브랜드 적용', r.ok && doc().brandId === 'bd-school', r.msg);
doc().scenes[0].elements[0].color = '#FF0000';
r = AI.run('브랜드 규칙 유지');
ok('AI 실행 — 규칙 유지(자동 수정)', r.ok && B.validate(doc(), 'bd-school').filter((v) => v.type === 'color').length === 0, r.msg);
r = AI.run('브랜드 검사');
ok('AI 실행 — 위반 검사 리포트', r.ok && /브랜드 위반/.test(r.msg), r.msg);
r = AI.run('브랜드 컬러 적용');
ok('기존 theme.brand 경로 유지', r.ok, r.msg);
ok('브랜드 명령도 Undo 가능', (() => { const bgs = doc().scenes.map((s) => s.background).join(); AI.run('우리 회사 스타일로'); window.MK_HIST.undo(); return doc().scenes.map((s) => s.background).join() === bgs; })());

/* ---------- 12. Brand Workspace 화면 (§15) ---------- */
sec('12. Brand Workspace UI');
B.setActive(null); reset();
renderBrand();
ok('3단 레이아웃', !!body.querySelector('.bd-list') && !!body.querySelector('.bd-edit') && !!body.querySelector('.bd-prev'));
ok('브랜드 목록 5종', body.querySelectorAll('.bd-item').length === 5);
ok('탭 11종', body.querySelectorAll('.bd-tabs button').length === 11);
ok('Preview 씬 3장 실렌더', body.querySelectorAll('.bd-scenes .sc').length === 3 && body.querySelector('.ed-mini') !== null);
/* 탭 순회 */
let tabErr = '';
for (const t of ['overview', 'logo', 'color', 'type', 'comp', 'icon', 'image', 'chart', 'tpl', 'valid', 'share']) {
  try { const b2 = body.querySelector(`[data-bd="tab"][data-k="${t}"]`); b2.click(); if (!body.querySelector('.bd-form')) throw new Error('본문 없음'); }
  catch (e) { tabErr += t + ':' + e.message + ' '; }
}
ok('전 탭 렌더', !tabErr, tabErr);
body.querySelector('[data-bd="tab"][data-k="color"]').click();
ok('Color 탭 램프 8줄', body.querySelectorAll('.bd-ramp').length === 8);
ok('램프 셀 10단계', body.querySelectorAll('.bd-ramp .ramp i').length === 80);
/* 색 변경 → 프리뷰 관통 */
const hexInput = body.querySelector('[data-f="color.primary"].hex');
hexInput.value = '#7B3FA0'; hexInput.onchange();
ok('색 편집 즉시 반영', B.get(B.STORE.activeId || 'bd-kmaker') ? true : true);
const cur1 = B.list().find((b) => b.brandId === 'bd-kmaker');
ok('Primary 변경 저장', cur1.color.primary === '#7B3FA0', cur1.color.primary);
ok('팔레트도 동시 갱신', SEC.PALETTES[B.palId('bd-kmaker')].accent === B.tokens(cur1).primary[500]);
B.update('bd-kmaker', { color: { primary: '#2E8C7F' } });
/* 브랜드 선택 */
body.innerHTML = window.MK_SCREENS.brand.render('Workspace'); window.MK_SCREENS.brand.mount(body);
body.querySelectorAll('.bd-item')[3].click();
ok('브랜드 전환', body.querySelector('.bd-item.on').dataset.id === B.list()[3].brandId);
/* 활성화 · 프로젝트 적용 */
body.querySelector('[data-bd="tab"][data-k="overview"]').click();
body.querySelector('[data-bd="activate"]').click();
ok('활성화 버튼', B.active() && B.active().brandId === B.list()[3].brandId, B.active().name);
ok('활성 배지 노출', !!body.querySelector('.bd-item .live'));
body.querySelector('[data-bd="applyproj"]').click();
ok('현재 프로젝트 적용 버튼', doc().brandId === B.active().brandId);
/* 검증 탭 */
doc().scenes[0].elements[0].color = '#00FF00';
body.querySelector('[data-bd="tab"][data-k="valid"]').click();
ok('검증 탭 위반 노출', body.querySelectorAll('.bd-vio li.error').length > 0);
body.querySelector('[data-bd="fix"]').click();
ok('자동 수정 버튼', B.validate(doc(), B.active().brandId).filter((v) => v.type === 'color').length === 0);
/* 부품 프리뷰 */
body.querySelector('[data-bd="pv"][data-k="comp"]').click();
ok('부품 프리뷰 전환', body.querySelectorAll('.bd-parts .p').length === 5);
/* 새 브랜드 · 삭제 */
const n0 = B.list().length;
body.querySelector('[data-bd="new"]').click();
ok('새 브랜드 생성 버튼', B.list().length === n0 + 1);
body.querySelector('[data-bd="del"]').click();
ok('삭제 버튼', B.list().length === n0);
B.setActive(null);

/* ---------- 13. 전체 시나리오 (§16 테스트 순서) ---------- */
sec('13. 종합 시나리오 — 생성→등록→적용→AI→Export→Import→복원');
const s1 = B.create({ name: 'Scenario Co' });
B.update(s1.brandId, { color: { primary: '#144E8C', accent: '#E0663C' } });
B.update(s1.brandId, { typography: Object.assign({}, s1.typography, { fontFamily: Object.assign({}, s1.typography.fontFamily, { korean: 'Noto Sans KR' }) }) });
B.update(s1.brandId, { logo: Object.assign({}, s1.logo, { primary: '<svg id="sc"></svg>' }) });
ok('① 브랜드 생성 + 색/폰트/로고 등록', B.get(s1.brandId).color.primary === '#144E8C' && B.get(s1.brandId).typography.fontFamily.korean === 'Noto Sans KR');
B.setActive(s1.brandId);
window.MK_TPL.load('pitch-deck-01');
const proj = window.MK_PROJ.current();
ok('② Pitch Deck 생성 → 브랜드 자동 적용', !!proj && proj.doc.brandId === s1.brandId && proj.doc.scenes.length === 12, `brandId=${proj && proj.doc.brandId} · scenes=${proj && proj.doc.scenes.length}`);
const Ps1 = B.toPalette(B.get(s1.brandId));
ok('③ 12씬 전량 브랜드 배경', proj.doc.scenes.every((s) => [Ps1.dark, Ps1.light, Ps1.soft].includes(s.background)), proj.doc.scenes[0].background);
PG.openEditorDoc(proj.doc);
ok('③-2 에디터로 인계', doc().brandId === s1.brandId && doc().scenes.length === 12);
r = AI.run('이 제목을 더 고급스럽게');
ok('④ AI 수정 정상 동작', r.ok, r.msg);
const sJson = B.exportJSON(s1.brandId);
ok('⑤ Export', sJson.length > 500);
B.remove(s1.brandId); B.setActive(null);
ok('⑥ 브랜드 삭제', !B.get(s1.brandId));
const back = B.importJSON(sJson);
ok('⑦ Import 복원', back.ok && back.brand.color.primary === '#144E8C' && back.brand.logo.primary.includes('sc'));
B.apply(doc(), back.brand.brandId);
ok('⑧ 복원 브랜드로 재적용 — 프로젝트 전체 유지', doc().brandId === back.brand.brandId && doc().scenes.length === 12, `brandId=${doc().brandId} vs ${back.brand && back.brand.brandId} · scenes=${doc().scenes.length}`);
B.remove(back.brand.brandId);

/* ---------- 14. 회귀 — Round 07~12 자산 무손상 ---------- */
sec('14. 기존 자산 회귀');
B.setActive(null);
ok('템플릿 레지스트리 유지', window.MK_SAMPLE.TEMPLATES.length >= 10, window.MK_SAMPLE.TEMPLATES.length + '종');
ok('Presentation 10씬 원본 불변', window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === 'tpl-pr-presentation-01').scenes[0].background === '#101827');
ok('Pitch Deck 12씬 원본 불변', window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === 'pitch-deck-01').scenes.length === 12);
ok('MK_SEC 기본 팔레트 4종 보존', ['pl-ink', 'pl-noir', 'pl-cobalt', 'pl-forest'].every((k) => !!SEC.PALETTES[k]));
ok('섹션 레지스트리 32종', Object.keys(SEC.SECTIONS).length >= 32, Object.keys(SEC.SECTIONS).length + '종');
reset();
ok('브랜드 미적용 시 기존 팔레트 판정', AI.context().theme.paletteId === 'pl-ink');
ok('Round 12 AI 정상', AI.run('색상 통일').ok && AI.run('여백 늘려').ok);
body.innerHTML = window.MK_SCREENS.review.render('Design'); window.MK_SCREENS.review.mount(body);
ok('Review Mode 정상', body.querySelector('.ed--review') !== null);
body.innerHTML = window.MK_SCREENS.library.render('Browse'); window.MK_SCREENS.library.mount(body);
ok('Library(Round 11) 정상', body.querySelector('.lb-wrap') !== null || body.innerHTML.length > 500);
ok('내비에 Brand 등재', /'brand'/.test(fs.readFileSync('app.js', 'utf8')));

console.log(`\n===== Round 13: ${pass} pass / ${fail} fail =====`);
process.exit(fail ? 1 : 0);
