/* Round 11 검증 — jsdom 헤드리스 (전 화면 회귀 + Library 전용) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/library' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, "performance", { value: { now: () => Date.now() } });

/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? (pass++, console.log('  ✓ ' + name + (extra ? ' — ' + extra : ''))) : (fail++, console.log('  ✗ ' + name + ' — ' + extra)); };
const sec = (n) => console.log('\n[' + n + ']');

const C = window.MK_CAT, PG = window.PG;

/* ---------- 1. 전 화면 회귀 ---------- */
sec('1. 전 화면 렌더 회귀');
for (const k of Object.keys(window.MK_SCREENS)) {
  const scr = window.MK_SCREENS[k];
  try {
    for (const v of scr.variants) {
      const body = window.document.getElementById('pgBody');
      body.innerHTML = scr.render(v);
      if (scr.mount) scr.mount(body);
    }
    ok('screen: ' + k, true);
  } catch (e) { ok('screen: ' + k, false, e.message); }
}

/* ---------- 2. Catalog 구조 ---------- */
sec('2. Catalog 구조 (STEP 2·3)');
ok('Category 9종', C.CATEGORIES.length === 9, C.CATEGORIES.map((c) => c.name).join(','));
ok('Category 아이콘·설명 전량', C.CATEGORIES.every((c) => c.icon && c.desc));
ok('Presentation 하위 타입 9종', C.TYPES.presentation.length === 9);
ok('Pitch Deck 포함', C.TYPES.presentation.includes('Pitch Deck'));
ok('전 Category에 타입 존재', C.CATEGORIES.every((c) => (C.TYPES[c.key] || []).length >= 5));
ok('엔트리 1000개', C.ENTRIES.length === 1000);
ok('실템플릿 10종 연결', C.ENTRIES.filter((e) => e.live).length === 10, 'live=' + C.ENTRIES.filter((e) => e.live).length);
ok('실템플릿 tplId 유효', C.ENTRIES.filter((e) => e.live).every((e) => window.MK_SAMPLE.TEMPLATES.some((t) => t.templateId === e.tplId)));
ok('id 유일', new Set(C.ENTRIES.map((e) => e.id)).size === 1000);
ok('카탈로그 재현성(시드 고정)', C.ENTRIES[500].name === C.get(C.ENTRIES[500].id).name);

/* ---------- 3. 검색 (STEP 6) ---------- */
sec('3. Search');
const q = (o) => C.query(o).length;
ok('이름 검색', q({ q: C.ENTRIES[3].name.split(' ')[0].toLowerCase() }) > 0);
ok('카테고리 검색', q({ q: 'presentation' }) > 0);
ok('스타일 검색', q({ q: 'luxury' }) > 0);
ok('색 검색', q({ q: 'orange' }) > 0);
ok('비율 검색', q({ q: '16:9' }) > 0);
ok('장수 검색', q({ q: '12장' }) > 0);
ok('태그 검색', q({ q: 'pitch' }) > 0);
ok('무의미 검색은 0', q({ q: 'zzzzqqq' }) === 0);
ok('검색 제안', C.suggest('pi').length > 0, C.suggest('pi').slice(0, 3).join('/'));
C.pushQuery('pitch deck'); C.pushQuery('poster'); C.pushQuery('pitch deck');
ok('최근 검색 중복 제거·최신 우선', C.recentQueries[0] === 'pitch deck' && C.recentQueries.length === 2);

/* ---------- 4. 필터 (STEP 7) ---------- */
sec('4. Filter');
for (const s of C.STYLES) ok('style=' + s, C.query({ filters: { style: s } }).every((e) => e.style === s) && q({ filters: { style: s } }) > 0);
for (const c of C.COLORS) ok('color=' + c, C.query({ filters: { color: c } }).every((e) => e.color === c));
for (const t of C.THEMES) ok('theme=' + t, C.query({ filters: { theme: t } }).every((e) => e.theme === t));
ok('pages 버킷 s(1–4장)', C.query({ filters: { pages: 's' } }).every((e) => e.pages <= 4));
ok('pages 버킷 l(13장+)', C.query({ filters: { pages: 'l' } }).every((e) => e.pages >= 13));
const multi = C.query({ cat: 'presentation', type: 'Pitch Deck', filters: { style: 'Modern', theme: 'Light' } });
ok('복합 필터 교집합', multi.every((e) => e.cat === 'presentation' && e.type === 'Pitch Deck' && e.style === 'Modern' && e.theme === 'Light'), multi.length + '개');
ok('결과 없음도 정상 처리', Array.isArray(C.query({ q: 'zzz', filters: { style: 'Luxury' } })));

/* ---------- 5. 정렬 ---------- */
sec('5. Sort');
const nm = C.query({ sort: 'name' });
ok('이름순 오름차', nm[0].name.localeCompare(nm[nm.length - 1].name) <= 0);
const pp = C.query({ sort: 'popular' });
ok('인기순 내림차', pp[0].popularity >= pp[999].popularity);
const pg = C.query({ sort: 'pages' });
ok('장수순 내림차', pg[0].pages >= pg[999].pages);
ok('추천순은 완성 템플릿 우선', C.query({ sort: 'recommend' })[0].live === true);

/* ---------- 6. 추천 (STEP 8) ---------- */
sec('6. Recommendation');
ok('이력 없을 때 폴백', C.recommend(6).length === 6 && C.recommend(6)[0].live === true);
const pitch = C.ENTRIES.find((e) => e.type === 'Pitch Deck');
C.use(pitch.id); C.use(pitch.id); C.use(pitch.id);
const rec = C.recommend(12).map((e) => e.type);
ok('Pitch Deck 사용 → Proposal 추천', rec.includes('Proposal'), rec.slice(0, 6).join(','));
ok('Pitch Deck 사용 → Company Profile 추천', rec.includes('Company Profile'));
ok('Pitch Deck 사용 → Business Report 추천', rec.includes('Business Report'));
ok('사용한 항목은 추천에서 제외', !C.recommend(20).some((e) => e.id === pitch.id));
ok('추천 근거 문구', /Pitch Deck/.test(C.recommendReason()), C.recommendReason());
ok('최근 사용 기록', C.recents[0] === pitch.id);
ok('친화도 반영 정렬', C.query({ sort: 'recommend' }).findIndex((e) => e.type === 'Proposal') < 400);

/* ---------- 7. Rails (STEP 1) ---------- */
sec('7. Home Rails');
const favs = new Set([C.ENTRIES[7].id, C.ENTRIES[8].id]);
const rails = C.rails(favs);
ok('레일 6줄', rails.length === 6, rails.map((r) => r.title).join('/'));
ok('AI 추천·최근·즐겨찾기·새·인기·프리미엄 전부', ['AI 추천', '최근 사용', '즐겨찾기', '새 템플릿', '인기 템플릿', '완성형 프리미엄'].every((t) => rails.some((r) => r.title === t)));
ok('즐겨찾기 레일 = 즐겨찾기 항목', rails.find((r) => r.key === 'fav').items.length === 2);
ok('최근 사용 레일 채워짐', rails.find((r) => r.key === 'recent').items.length >= 1);
ok('인기 레일 내림차', (() => { const it = rails.find((r) => r.key === 'pop').items; return it[0].popularity >= it[it.length - 1].popularity; })());

/* ---------- 8. Virtual List (STEP 9) ---------- */
sec('8. Virtual List · Thumbnail Cache');
const w1 = C.windowRange({ scrollTop: 0, viewH: 640, rowH: 214, cols: 4, total: 1000 });
ok('총 행 계산', w1.rows === 250 && w1.totalH === 250 * 214);
ok('첫 화면은 앞쪽만 렌더', w1.start === 0 && w1.end <= 32, `${w1.start}~${w1.end}`);
const w2 = C.windowRange({ scrollTop: 214 * 100, viewH: 640, rowH: 214, cols: 4, total: 1000 });
ok('스크롤 중 창 이동', w2.start === (100 - 2) * 4 && w2.padTop === 98 * 214, `start=${w2.start}`);
ok('창 크기는 상수(1000개여도)', (w2.end - w2.start) <= 32, `${w2.end - w2.start}개`);
const w3 = C.windowRange({ scrollTop: 214 * 260, viewH: 640, rowH: 214, cols: 4, total: 1000 });
ok('바닥 클램프', w3.end === 1000 && w3.lastRow === 249);
ok('결과 0개에서도 안전', C.windowRange({ scrollTop: 0, viewH: 640, rowH: 214, cols: 4, total: 0 }).end === 0);
C.clearCache();
const sample = C.ENTRIES.slice(0, 40);
sample.forEach((e) => C.poster(e)); sample.forEach((e) => C.poster(e));
ok('썸네일 캐시 적중', C.cacheStats.hit === 40 && C.cacheStats.miss === 40, `hit=${C.cacheStats.hit} miss=${C.cacheStats.miss}`);
ok('캐시 상한 유지', (() => { C.ENTRIES.forEach((e) => C.poster(e)); return C.cache.size <= 600; })(), 'size=' + C.cache.size);
ok('실템플릿 썸네일 = Scene 렌더', C.poster(C.ENTRIES.find((e) => e.live)).includes('<svg'));
ok('목업 썸네일 아키타입 6종', new Set(C.ENTRIES.filter((e) => !e.live).map((e) => e.arch)).size === 6);

/* ---------- 9. 성능 ---------- */
sec('9. Performance');
const t0 = Date.now(); for (let i = 0; i < 50; i++) C.query({ sort: 'recommend' }); const qms = (Date.now() - t0) / 50;
ok('1000개 질의 평균 < 8ms', qms < 8, qms.toFixed(2) + 'ms');
const t1 = Date.now(); for (let i = 0; i < 50; i++) C.query({ q: 'report', filters: { style: 'Modern' } }); const fms = (Date.now() - t1) / 50;
ok('검색+필터 평균 < 8ms', fms < 8, fms.toFixed(2) + 'ms');
C.clearCache();
const t2 = Date.now(); C.ENTRIES.slice(0, 24).forEach((e) => C.poster(e)); const pms = Date.now() - t2;
ok('첫 화면 24장 썸네일 < 60ms', pms < 60, pms + 'ms');
const t3 = Date.now(); C.ENTRIES.slice(0, 24).forEach((e) => C.poster(e)); const cms = Date.now() - t3;
ok('캐시 재사용 < 5ms', cms < 5, cms + 'ms');

/* ---------- 10. 화면 동작 ---------- */
sec('10. Library 화면');
const body = window.document.getElementById('pgBody');
const L = window.MK_SCREENS.library;
body.innerHTML = L.render('v1'); L.mount(body);
ok('Home 렌더', body.querySelectorAll('.lb-cat').length === 9);
ok('Rails 카드 노출', body.querySelectorAll('.lb-rail .lb-card').length > 0, body.querySelectorAll('.lb-rail .lb-card').length + '장');
body.querySelector('[data-cat="presentation"]').click();
ok('Category 클릭 → Browse', !!body.querySelector('.lb-vp') && L._S.cat === 'presentation');
ok('Project Type 칩 노출', body.querySelectorAll('[data-t]').length === 10);
body.querySelector('[data-t="Pitch Deck"]').click();
ok('Type 선택 반영', L._S.type === 'Pitch Deck');
body.querySelector('[data-f="style"][data-v="Luxury"]').click();
ok('Filter 토글 on', L._S.filters.style === 'Luxury');
body.querySelector('[data-f="style"][data-v="Luxury"]').click();
ok('Filter 토글 off', L._S.filters.style === '');
ok('필터 초기화 버튼', !!body.querySelector('[data-reset]'));
body.querySelector('[data-reset]').click();
ok('초기화 후 타입 해제', L._S.type === '' && L._S.filters.pages === 'any');
body.querySelector('[data-home]').click();
ok('처음으로 복귀', L._S.mode === 'home' && body.querySelectorAll('.lb-cat').length === 9);
/* Preview */
L._openPreview(C.ENTRIES.find((e) => e.live).id);
const modal = window.document.getElementById('mkModal');
ok('Preview 모달 열림', !!modal && !!modal.querySelector('.lb-prev'));
ok('Preview 3프레임(Cover·대표·마지막)', modal.querySelectorAll('.dots button').length === 3,
  [...modal.querySelectorAll('.dots button')].map((b) => b.textContent).join('/'));
ok('Preview 정보 6행', modal.querySelectorAll('.info tr').length === 6);
ok('실템플릿은 목업 경고 없음', !modal.querySelector('.warn'));
window.MK.Modal.close();
L._openPreview(C.ENTRIES.find((e) => !e.live).id);
ok('목업은 경고 문구 표기', !!window.document.getElementById('mkModal').querySelector('.warn'));
window.MK.Modal.close();
/* 카드 정보 6종 */
body.innerHTML = L.render('v1'); L.mount(body);
const c0 = body.querySelector('.lb-card');
ok('Card: 썸네일', !!c0.querySelector('svg'));
ok('Card: 이름', !!c0.querySelector('.mt b').textContent.trim());
ok('Card: 타입·스타일·장수·비율', /· .+ · \d+장 · /.test(c0.querySelector('.mt small').textContent));
ok('Card: 즐겨찾기', !!c0.querySelector('.fav'));
ok('Card: hover 액션 2종', c0.querySelectorAll('.hov button').length === 2);
ok('Premium 배지 존재', body.querySelectorAll('.lb-card .prem').length > 0);

/* ---------- 11. 원본 불변 · 회귀 ---------- */
sec('11. 원본 불변 · 기존 경로 회귀');
const before = window.MK_SAMPLE.TEMPLATES.length;
C.query({ q: 'a' }); C.rails(new Set()); C.recommend(6);
ok('템플릿 원본 개수 불변', window.MK_SAMPLE.TEMPLATES.length === before);
ok('Presentation 10씬 유지', window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === 'tpl-pr-presentation-01').scenes.length === 10);
ok('Pitch Deck 12씬 유지', window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === 'pitch-deck-01').scenes.length === 12);
ok('기존 Templates 화면 정상', (() => { const s = window.MK_SCREENS.templates; body.innerHTML = s.render('v1'); s.mount(body); return body.querySelectorAll('.mk-tplcard').length > 0; })());
ok('Library 내비 등재', /library/.test(fs.readFileSync('app.js', 'utf8')));

console.log(`\n결과: ${pass}/${pass + fail} 통과` + (fail ? `  ✗ 실패 ${fail}건` : '  ✓ 전량 통과'));
process.exit(fail ? 1 : 0);
