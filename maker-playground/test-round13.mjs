/* Round 13 검증 — Brand System (jsdom) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/brand' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log('  ✓ ' + n + (x ? ' — ' + x : ''))) : (fail++, console.log('  ✗ ' + n + ' — ' + x)); };
const sec = (n) => console.log('\n[' + n + ']');

const PG = window.PG, BR = window.MK_BRAND, AI = window.MK_AIED, HIST = window.MK_HIST, SEC = window.MK_SEC;
const body = window.document.getElementById('pgBody');
const reset = (tpl = 'pitch-deck-01') => { PG.loadEditorDoc(tpl); HIST.reset(); PG.state.editor.aiLog = []; PG.state.editor.zoom = 1; };
const doc = () => PG.state.editor.doc;
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ---------- 1. 색 수학 · 램프 토큰 ---------- */
sec('1. 색 수학 · 램프 (50~900)');
const R = BR.ramp('#2E8C7F');
ok('램프 10단 생성', Object.keys(R).length === 10 && R[500] === '#2E8C7F', `500=${R[500]}`);
const lums = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((k) => {
  const h = R[k].replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).reduce((a, v) => a + v, 0);
});
ok('밝기 단조 감소 (50 → 900)', lums.every((v, i) => i === 0 || v <= lums[i - 1] + 1), lums.join(','));
ok('WCAG 대비 계산', BR.contrast('#FFFFFF', '#000000') === 21 && BR.contrast('#FFFFFF', '#FFFFFF') === 1);
ok('스키마 필수 필드', Array.isArray(BR.SCHEMA.required) && BR.SCHEMA.required.includes('colors'));

/* ---------- 2. 레지스트리 · 팔레트 이식 ---------- */
sec('2. 다중 브랜드 레지스트리');
ok('붙박이 4종 (회사A·회사B·학교·개인)', BR.list().length >= 4 && ['br-kmaker', 'br-signal', 'br-school', 'br-personal'].every((id) => !!BR.get(id)));
ok('공유 범위 다양성', new Set(BR.list().map((b) => b.sharing.scope)).size >= 3, BR.list().map((b) => b.sharing.scope).join(','));
ok('팔레트가 엔진에 이식됨', ['pl-brand-kmaker', 'pl-brand-school'].every((k) => !!SEC.PALETTES[k]));
const pal = BR.get('br-school').palette;
ok('derivePalette 역할 hex 유효', ['dark', 'light', 'soft', 'accent', 'accent2', 'mutedOnDark', 'mutedOnLight'].every((k) => /^#[0-9A-F]{6}$/i.test(pal[k])));
ok('차트색 자동 파생 5색', BR.get('br-kmaker').chart.colors.length === 5);
const custom = BR.create('테스트 브랜드');
ok('커스텀 생성', /^br-custom-/.test(custom.id) && !!SEC.PALETTES[BR.palId(custom.id)]);
const upd = BR.update(custom.id, { colors: { primary: '#3B5BDB' } });
ok('색 수정 → 램프·팔레트 재계산', upd.ramps.primary[500] === '#3B5BDB' && upd.palette.accent === '#3B5BDB');
ok('커스텀 삭제 (붙박이는 보호)', BR.remove(custom.id) === true && BR.remove('br-kmaker') === false);

/* ---------- 3. 로고 자동 선택 ---------- */
sec('3. 로고 — 슬롯 3 × 버전 3 · AI 자동 선택');
const km = BR.get('br-kmaker');
ok('variants 3×3 생성', ['primary', 'secondary', 'iconOnly'].every((s) => ['light', 'dark', 'mono'].every((v) => !!km.logo.variants[s][v])));
ok('SVG/PNG 포맷 슬롯', km.logo.variants.primary.light.formats.join() === 'svg,png');
ok('어두운 배경 → dark 버전', BR.pickLogo(km, { dark: true }).version === 'dark');
ok('좁은 공간 → 아이콘 온리', BR.pickLogo(km, { space: 'tight' }).slot === 'iconOnly');
ok('인쇄 → 모노', BR.pickLogo(km, { print: true }).version === 'mono');

/* ---------- 4. 적용 — 역할 토큰 치환 (완료 조건의 심장) ---------- */
sec('4. Brand 적용 = 토큰 치환 (개별 수정 아님)');
reset('pitch-deck-01');
const before = clone(doc());
ok('적용 성공', BR.apply(doc(), 'br-school') === true && doc().brandId === 'br-school');
ok('paletteId 브랜드 팔레트로', doc().paletteId === 'pl-brand-school');
ok('본문 폰트 = 브랜드 body', doc().fontFamily === 'Noto Sans KR' && doc().headingFont === 'Noto Sans KR');
const elCount = (d) => d.scenes.reduce((a, s) => a + s.elements.length, 0);
ok('요소 수 불변 (구조 무손상)', elCount(before) === elCount(doc()));
const nonColorSame = doc().scenes.every((s, si) => s.elements.every((el, ei) => {
  const b = before.scenes[si].elements[ei];
  return el.x === b.x && el.y === b.y && el.w === b.w && (el.text || '') === (b.text || '') && el.kind === b.kind;
}));
ok('색 외 필드 완전 불변 (좌표·텍스트·종류)', nonColorSame);
const schoolSet = BR.allowedColors(BR.get('br-school'));
const stray = [];
doc().scenes.forEach((s, si) => { const bg = String(s.background).toLowerCase(); if (/^#/.test(bg) && !schoolSet.has(bg)) stray.push('bg' + si); });
ok('전 씬 배경이 브랜드 토큰 안', stray.length === 0, stray.join(','));

sec('4b. 브랜드 전환 왕복 무손실 (school → kmaker → school)');
BR.fix(doc());                                   /* 잔존 리터럴을 토큰으로 정규화 — 왕복 불변식의 전제 */
const snapA = clone(doc());
BR.apply(doc(), 'br-kmaker');
ok('전환: 배경이 kmaker dark 로', doc().scenes.some((s) => s.background === BR.get('br-kmaker').palette.dark));
BR.apply(doc(), 'br-school');
const snapB = clone(doc());
const rt = JSON.stringify(snapA.scenes.map((s) => [s.background, s.elements.map((e) => [e.color, e.fill, e.accent])])) ===
           JSON.stringify(snapB.scenes.map((s) => [s.background, s.elements.map((e) => [e.color, e.fill, e.accent])]));
ok('왕복 후 색 상태 동일 — 치환 테이블 가역성', rt);

/* ---------- 5. 렌더 시점 토큰 (컴포넌트·차트) ---------- */
sec('5. 컴포넌트·차트는 렌더에서 브랜드 토큰을 읽는다');
reset('tpl-pr-presentation-01');
AI.run('막대 그래프 추가') .ok || AI.run('차트 추가');
if (!doc().scenes[PG.state.editor.sceneIdx].elements.some((e) => e.kind === 'chart')) {
  doc().scenes[PG.state.editor.sceneIdx].elements.push(AI.mkChart(AI.paletteOf(doc()), 'pie', null, '검증'));
}
BR.apply(doc(), 'br-signal');
PG.state.editor.menu = 'ai';
const rE = () => { const s = window.MK_SCREENS.editor; body.innerHTML = s.render('Design'); s.mount(body); };
rE();
const svg = body.innerHTML;
const sigColors = BR.get('br-signal').chart.colors.map((c) => c.toLowerCase());
ok('차트에 signal 다색 시리즈 렌더', sigColors.filter((c) => svg.toLowerCase().includes(c)).length >= 2, sigColors.join(','));
ok('브랜드 배지 · 전환 select 표시', svg.includes('brand-sel') && svg.includes('Signal'));
BR.apply(doc(), 'br-personal'); rE();
ok('브랜드 전환 → 제목에 세리프 헤딩 폰트', body.innerHTML.includes("Noto Serif KR"));

/* ---------- 6. Validation · Fix ---------- */
sec('6. 브랜드 위반 검사 · 자동 교정');
reset('tpl-pr-presentation-01'); BR.apply(doc(), 'br-kmaker');
let v = BR.validate(doc());
ok('적용 직후 위반 0', v.ok, JSON.stringify(v.violations.slice(0, 2)));
doc().scenes[0].elements.push({ kind: 'text', x: 5, y: 5, w: 40, size: 4, weight: 400, text: '위반 텍스트', color: '#FF00AA' });
doc().scenes[1].elements.push({ kind: 'chart', x: 10, y: 10, w: 50, h: 40, chartType: 'bar', accent: '#123456', series: [{ k: 'a', v: 1 }] });
doc().fontFamily = 'Comic Sans MS';
v = BR.validate(doc());
ok('색·차트·폰트 위반 감지', ['color', 'chart', 'font'].every((t) => v.violations.some((x) => x.type === t)), v.violations.map((x) => x.type).join(','));
const darkBg = doc().scenes.findIndex((s) => SEC.isDark(s.background));
doc().scenes[darkBg].elements.push({ kind: 'text', x: 5, y: 80, w: 40, size: 3, weight: 400, text: '안 보이는 글', color: BR.get('br-kmaker').palette.dark });
v = BR.validate(doc());
ok('저대비 감지 (<3:1)', v.violations.some((x) => x.type === 'contrast'));
BR.fix(doc());
v = BR.validate(doc());
ok('fix 후 전부 통과', v.ok, JSON.stringify(v.violations.slice(0, 2)));

/* ---------- 7. AI Integration ---------- */
sec('7. AI — "우리 회사 스타일로" 류 명령');
reset('tpl-pr-presentation-01');
const P1 = AI.parse('우리 회사 스타일로');
ok('파싱: 회사 → br-kmaker', P1 && P1.action === 'brand.apply' && P1.args.brandId === 'br-kmaker');
ok('파싱: 학교 스타일로 → br-school', AI.parse('학교 스타일로 바꿔줘').args.brandId === 'br-school');
ok('파싱: 시그널 브랜드 적용 → br-signal', AI.parse('시그널 브랜드 적용').args.brandId === 'br-signal');
ok('파싱: 개인 브랜드로 → br-personal', AI.parse('개인 브랜드로 해줘').args.brandId === 'br-personal');
ok('파싱: 브랜드 규칙 유지 → validate+fix', (() => { const p = AI.parse('브랜드 규칙 유지'); return p.action === 'brand.validate' && p.args.fix === true; })());
ok('파싱: 브랜드 검사 → validate', AI.parse('브랜드 검사해줘').action === 'brand.validate');
let r = AI.run('학교 스타일로');
ok('실행: doc 실변형 + 응답', r.ok && doc().brandId === 'br-school' && /금성/.test(r.msg), r.msg);
r = AI.run('브랜드 검사');
ok('실행: 검사 통과 보고', r.ok && /위반 없음/.test(r.msg), r.msg);
doc().scenes[0].elements[0].color = '#FF00AA';
AI.run('브랜드 규칙 유지');
ok('실행: 규칙 유지 → 자동 교정', BR.validate(doc()).ok);
const und = window.MK_HIST.undo() && window.MK_HIST.undo();
ok('AI 브랜드 작업 Undo 가능', !!und && HIST.canRedo());
ok('context 에 brand 노출', (() => { BR.apply(doc(), 'br-signal'); return AI.context().brand.name === 'Signal'; })());

/* ---------- 8. Export / Import ---------- */
sec('8. Brand JSON — Export · Import · 복원');
const js = BR.exportJSON('br-school');
ok('Export JSON 생성', !!js && JSON.parse(js).$schema === 'k-maker/brand@1');
const imp = BR.importJSON(js);
ok('Import — id 충돌 시 사본 생성', imp.ok && imp.id !== 'br-school' && /가져옴/.test(imp.name), imp.id);
const impB = BR.get(imp.id);
ok('복원 무결성 — 색·폰트·팔레트 동일', impB.colors.primary === BR.get('br-school').colors.primary && impB.palette.accent === BR.get('br-school').palette.accent);
reset('pitch-deck-01');
BR.apply(doc(), imp.id);
const c1 = clone(doc().scenes.map((s) => s.background));
reset('pitch-deck-01');
BR.apply(doc(), 'br-school');
ok('가져온 브랜드 적용 결과 = 원본 적용 결과', JSON.stringify(c1) === JSON.stringify(doc().scenes.map((s) => s.background)));
ok('Import 방어 — 깨진 JSON', BR.importJSON('{oops').ok === false);
ok('Import 방어 — 필수 필드 누락', BR.importJSON('{"id":"br-x","name":"x"}').ok === false);
BR.remove(imp.id);

/* ---------- 9. UI — Brand Workspace · Create · 전 화면 회귀 ---------- */
sec('9. UI 렌더');
PG.state.brand = null;
const scr = window.MK_SCREENS.brand;
body.innerHTML = scr.render('Workspace'); scr.mount(body);
ok('워크스페이스: 좌 목록 + 우 편집', body.querySelectorAll('[data-bw-sel]').length >= 4 && !!body.querySelector('.bw-tabs'));
PG.state.brand.tab = 'color'; body.innerHTML = scr.render('Workspace'); scr.mount(body);
ok('컬러 탭: 램프 50~900 렌더', body.querySelectorAll('.bw-ramp').length >= 5 && body.innerHTML.includes('>900<'));
PG.state.brand.tab = 'comp'; body.innerHTML = scr.render('Workspace'); scr.mount(body);
ok('컴포넌트 탭: 10종 프리뷰', body.querySelectorAll('.bw-comp').length >= 8);
PG.state.brand.tab = 'share'; body.innerHTML = scr.render('Workspace'); scr.mount(body);
ok('공유·Export 탭', body.innerHTML.includes('Brand JSON') && body.querySelectorAll('.bw-scope').length === 4);
PG.state.create = { step: 4, type: 'presentation', style: 'Premium', tpl: 'tpl-pr-presentation-01', brand: '' };
const cs = window.MK_SCREENS.create;
body.innerHTML = cs.render('Flow'); cs.mount(body);
ok('Create Step4: 브랜드 선택 칩', body.querySelectorAll('[data-cf-brand]').length >= 5);
for (const k of Object.keys(window.MK_SCREENS)) {
  const sc = window.MK_SCREENS[k];
  try { for (const vv of sc.variants) { body.innerHTML = sc.render(vv); if (sc.mount) sc.mount(body); } ok('screen: ' + k, true); }
  catch (e) { ok('screen: ' + k, false, e.message); }
}

console.log(`\n===== Round 13: ${pass} 통과 · ${fail} 실패 =====`);
process.exit(fail ? 1 : 0);
