/* gate_g6s2_social_u3.js — 6학년 2학기 사회 3단원 「지구촌 사람들」 케이티처 2세대 게이트 (교과서판 2학기 트랙, 2026-11-10 · 오푸스 5.5 — gate_g6s2_social_u1·u2 틀)
   지도서 직행(자기주도 원문 없음) — 2022 개정 사회 6-2 교사용 지도서 3단원 260~353쪽 · 정답 544·546~547쪽.
   A 로드·meta · B 19장 골격·extras · C 7요소(6학년 = 장면·물음) · D 복습 계보(l01 = 2단원 u2_l20 출구 — 2단원 데이터와 대조) · E 기본 문제 정답(단원 평가 다시 셈) · F 분 합계(560)
   G 지리 원칙(생각을 넓혀요 = 상황 · 물음 · 풀이 / 요약 화살표 / 차시마다 교과서·지도서 사실 다시 셈) · H 선행 용어·주제 잠금 · I 실렌더
   J 차단 어휘 · K 6학년 인물 0 · L 교사 화면 영어 코드 0 · M 물음 끝
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g6s2_social_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g6s2_social_u3.js'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l04', 'u3_l05', 'u3_l06', 'u3_l07', 'u3_l08', 'u3_l10', 'u3_l12', 'u3_l13', 'u3_l14'];
const COV = { u3_l01: [1, 1], u3_l02: [2, 3], u3_l04: [4, 4], u3_l05: [5, 5], u3_l06: [6, 6], u3_l07: [7, 7], u3_l08: [8, 9], u3_l10: [10, 11], u3_l12: [12, 12], u3_l13: [13, 13], u3_l14: [14, 14] };
const PAGE = { u3_l01: 'p.118~123', u3_l02: 'p.124~128', u3_l04: 'p.129~131', u3_l05: 'p.132~134', u3_l06: 'p.135~139', u3_l07: 'p.140~142', u3_l08: 'p.143~147', u3_l10: 'p.148~151', u3_l12: 'p.152~155', u3_l13: 'p.156~157', u3_l14: 'p.158~161' };
const T1K = ['u3_l02', 'u3_l04', 'u3_l05', 'u3_l06'], T2K = ['u3_l07', 'u3_l08', 'u3_l10', 'u3_l12'];
const STD = { u3_l01: '[6사12-01][6사12-02]', u3_l13: '[6사12-01][6사12-02]', u3_l14: '[6사12-01][6사12-02]' };
T1K.forEach(k => STD[k] = '[6사12-01]'); T2K.forEach(k => STD[k] = '[6사12-02]');
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '지구촌 사람들';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; })).replace(/\*\*/g, '');
const all = (les) => JSON.stringify(les);
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const ans = (k, i) => L[k].slides[8 + i].data.options.filter(o => o.correct).map(o => o.text);
const pos = (k, i) => L[k].slides[8 + i].data.options.findIndex(o => o.correct);
const has = (s, list) => list.forEach(p => ok(s.indexOf(p) >= 0, '없음: ' + p));

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('키 = 지도서 1·2~3·4·5·6·7·8~9·10~11·12·13·14차시', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 사회 · unit 3 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 · 목표 · 교과서 쪽 · 주제', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 6 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers');
  ok(m.std === STD[k], k + ' std ' + m.std); ok(m.textbook === PAGE[k], k + ' 쪽 ' + m.textbook); ok(m.goal && /수 있다$/.test(m.goal), k + ' 목표'); ok(m.topic && m.method && m.source && /지도서 3단원/.test(m.source), k + ' topic·method·source'); ok(m.theme === '지구촌 사람들 탐사대', k + ' theme'); }));
T('주제 = 1주제 세계의 인구 분포(l02~l06) · 2주제 지구촌의 문제와 지속가능한 미래(l07~l12)', () => { T1K.forEach(k => ok(L[k].meta.topic === '세계의 인구 분포', k)); T2K.forEach(k => ok(L[k].meta.topic === '지구촌의 문제와 지속가능한 미래', k)); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
KEYS.forEach(k => T(k + ' extras — 장이 가리키는 id 모두 있음 · id 겹침 0 · 17개(video1·q4·x2·c1·tip5·real1·game1·e2)', () => { const ex = L[k].extras, ids = ex.map(e => e.id); ok(new Set(ids).size === ids.length, '겹침'); ok(ex.length === 17, ex.length);
  const n = +k.slice(4); ok(ids.every(i => new RegExp('^[vqxctrge]_l' + n + '_\\d$').test(i)), 'id 꼴'); L[k].slides.forEach(s => (s.suggested_extras || []).forEach(x => ok(ids.indexOf(x) >= 0, s.id + ' ' + x)));
  ok(ex.every(e => e.title && (e.content || e.url)), '빈 extras'); }));
T('단원 전체 extras id 겹침 0', () => { const ids = KEYS.flatMap(k => L[k].extras.map(e => e.id)); ok(new Set(ids).size === ids.length, ids.length); });

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, hs = f => sl.some(f);
  ok(hs(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(hs(s => s.data.img), '②실사');
  ok(hs(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(hs(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 3 && s.data.solo && s.data.solo.length), '④활동(1인 포함)'); ok(hs(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(hs(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 11종 서로 다름 · 1단원 13종과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 11, im); const u1 = ['world_travel_fair', 'rocky_mountains_lake', 'banaue_rice_terraces', 'fraser_river_logs', 'boracay_beach', 'niagara_falls', 'traditional_clothes_gallery', 'stilt_house_and_mud_house', 'log_cabin_snow', 'aurora_night_sky', 'songkran_water_festival', 'snowy_street_norway', 'bingo_board_classroom']; ok(!im.some(x => u1.some(u => x.indexOf(u) >= 0)), '겹침'); });
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반 · 활동 꼴 pair·group·whole · 8~9차시 = 모둠 붙임쪽지 · 10~11차시 = 비정부 기구 로고 · 12차시 = 실천 인증 릴레이 · 14차시 = 다 함께 카드 모으기', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); ok(/^(pair|group|whole)$/.test(a.type), k + ' ' + a.type);
  if (k === 'u3_l08') ok(a.type === 'group' && /붙임쪽지/.test(a.title), k); if (k === 'u3_l10') ok(a.type === 'group' && /로고/.test(a.title), k); if (k === 'u3_l12') ok(/릴레이/.test(a.title), k); if (k === 'u3_l14') ok(a.type === 'whole' && /카드 모으기/.test(a.title), k); }));

console.log('═══ D. 복습 계보 ═══');
T('u3_l01 복습 = 2단원 마지막 차시(g6s2_social:u2_l20) 출구 셋 — 2단원 데이터와 대조', () => { const rv = L.u3_l01.slides[1].data; ok(rv.from === 'g6s2_social:u2_l20', rv.from); const f2 = path.join(TDIR, 'data/g6s2_social_u2.js'); ok(fs.existsSync(f2), '2단원 데이터 없음'); const U2 = load(f2), ks = Object.keys(U2); ok(ks[ks.length - 1] === 'u2_l20' && U2.u2_l20, '2단원 마지막 키 ' + ks[ks.length - 1]); const ex = U2.u2_l20.slides[15].data.items.map(x => [x.q, x.a]); ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex), '2단원 출구 어긋남'); ok(/시장경제와 국가 간 거래/.test(rv.content), 'content'); });
T('데이터 꼴 = 키마다 window.LESSONS["u3_lNN"] = (활동 배선 검사가 읽는 꼴)', () => { const src = fs.readFileSync(path.join(TDIR, 'data/g6s2_social_u3.js'), 'utf8'); const ks = (src.match(/window\.LESSONS\["(u3_l\d\d)"\] =/g) || []).map(x => x.slice(16, 22)); ok(JSON.stringify(ks) === JSON.stringify(KEYS), ks.join()); ok(!/Object\.assign\(window\.LESSONS/.test(src), 'Object.assign 꼴'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data, ex = L[KEYS[i]].slides[15].data.items;
  ok(rv.from === 'g6s2_social:' + KEYS[i], 'from ' + rv.from); ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답 · 보기 겹침 0', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 3 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); }
    ok(/^풀이:/.test(d.note), s.id + ' 풀이'); ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 10 · 차시마다 ≥ 1', () => { const n = KEYS.map(k => L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length); ok(n.reduce((a, b) => a + b, 0) >= 10 && n.every(x => x >= 1), n); });
T('수준별 세 계단 각 문항·답 있음 · 기본·도전 = 단계 셋 · 심화 = 열린 답', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; Object.entries(lv).forEach(([n, x]) => ok(x && x.q && x.a, k + ' 계단 ' + n)); ok(lv.기본.steps.length === 3 && lv.도전.steps.length === 3, k + ' steps'); ok(lv.심화.open, k + ' 심화 open'); }));
T('단원 평가 정답 = 지도서 546쪽(1 ⑤ · 2 ② · 3 ㉢ 인도 · 4 아시아 · 5 ③ · 7 인구 밀도 · 8 ① · 10 ⑤ · 11 지구촌 · 12 ① · 13 기후변화·생태계 · 14 ⑤ · 16 ⑴㉢⑵㉠⑶㉡ · 17 국제 연합 · 18 ④ · 20 ③) + 보기 자리 = 원 번호', () => {
  ok(ans('u3_l02', 0)[0] === '강수량이 매우 적은 지역' && pos('u3_l02', 0) === 4, '1번'); ok(ans('u3_l02', 2)[0] === '인구가 가장 많은 대륙은 아시아이다' && pos('u3_l02', 2) === 1, '2번');
  ok(/인도/.test(ans('u3_l14', 2)[0]), '3번'); ok(ans('u3_l14', 0)[0] === '아시아', '4번'); ok(ans('u3_l04', 0)[0] === '오세아니아에 있는 나라들은 인구수가 많다' && pos('u3_l04', 0) === 2, '5번');
  ok(ans('u3_l05', 2)[0] === '인구 밀도', '7번'); ok(ans('u3_l05', 0)[0] === '벼농사가 발달했기 때문이다' && pos('u3_l05', 0) === 0, '8번'); ok(ans('u3_l06', 1)[0] === '외국인 근로자를 많이 받아들인 나라의 인구 피라미드다', '10번');
  ok(ans('u3_l07', 0)[0] === '지구촌', '11번'); ok(ans('u3_l07', 2)[0] === '기후변화' && pos('u3_l07', 2) === 0, '12번'); ok(ans('u3_l08', 0)[0] === '㉠ 기후변화 ㉡ 생태계', '13번');
  ok(/^주현/.test(ans('u3_l08', 2)[0]) && pos('u3_l08', 2) === 4, '14번'); ok(ans('u3_l10', 0)[0] === '개인 ㉢ · 기업 ㉠ · 국가 ㉡', '16번'); ok(L.u3_l10.slides[11].data.levels.기본.a === '국제 연합(UN)', '17번');
  ok(ans('u3_l10', 1)[0] === '국제 연합 아동 기금(UNICEF)' && pos('u3_l10', 1) === 3, '18번'); ok(ans('u3_l12', 0)[0] === '㉠, ㉣' && pos('u3_l12', 0) === 2, '20번'); });
T('교과서 활동 정답 다시 셈: 2023 비율이 늘어난 대륙 넷(원그래프 수 대조) · 탑승구 9(안내판 단서 셈) · 인구 피라미드 일본 셋 · 인도네시아 ⑵', () => {
  const p50 = { 아시아: 54.9, 유럽: 22.0, 아프리카: 9.1, 북아메리카: 6.8, 남아메리카: 6.7, 오세아니아: 0.5 }, p23 = { 아시아: 59.1, 아프리카: 18.3, 유럽: 9.2, 남아메리카: 8.1, 북아메리카: 4.7, 오세아니아: 0.6 };
  const s50 = Object.values(p50).reduce((a, b) => a + b, 0), s23 = Object.values(p23).reduce((a, b) => a + b, 0); ok(Math.abs(s50 - 100) < 0.05 && Math.abs(s23 - 100) < 0.05, '합 ' + s50 + ' ' + s23);
  const up = Object.keys(p50).filter(c => p23[c] > p50[c]); ok(JSON.stringify(ans('u3_l02', 1).slice().sort()) === JSON.stringify(up.slice().sort()), up);
  const s = txt(L.u3_l02); Object.entries(p50).forEach(([c, v]) => ok(s.indexOf(c + ' ' + v.toFixed(1) + ' %') >= 0, '1950 ' + c)); Object.entries(p23).forEach(([c, v]) => ok(s.indexOf(c + ' ' + v.toFixed(1) + ' %') >= 0, '2023 ' + c));
  const board = L.u3_l12.slides[10].data.scenario.body.split('안내판: ')[1].split(' / ').map(r => r.split(' ')); const hit = board.filter(r => /^HC/.test(r[0]) && r[1] === '11:00' && r[r.length - 1] === '탑승');
  ok(hit.length === 1 && ans('u3_l12', 2)[0] === hit[0][3], '탑승구 ' + JSON.stringify(hit)); ok(ans('u3_l06', 0).length === 3 && ans('u3_l06', 2)[0] === '⑵', '일본·인도네시아'); });

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 560 (14차시 × 40) · 80분 셋(2·3 · 8·9 · 10·11차시)', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 560, d); ok(d.filter(x => x === 80).length === 3 && ['u3_l02', 'u3_l08', 'u3_l10'].every(k => L[k].meta.duration_min === 80), d); });

console.log('═══ G. 지리 원칙 · 교과서·지도서 사실 다시 셈 ═══');
KEYS.forEach(k => T(k + ' s15 생각을 넓혀요 = 상황 · 물음 · 「풀이:」 · 발문', () => { const d = L[k].slides[14].data;
  ok(d.title === '생각을 넓혀요', d.title); ok(d.context && d.context.length > 30, 'context'); ok(d.challenge && /(봐요|세요)\.$/.test(d.challenge), 'challenge'); ok(/^풀이:/.test(d.note) && d.note.length > 80, 'note'); ok(d.tnote, 'tnote'); }));
T('생각을 넓혀요 「하나가 아니·근거·함께·꾸준」 같은 균형 말 ≥ 8 차시(정답 강요 금지 · 특정 나라 편견 금지)', () => { const n = KEYS.filter(k => /하나가 아니|하나만으로는|근거|함께 보는|함께|늘 그렇지는/.test(L[k].slides[14].data.note)).length; ok(n >= 8, n); });
T('인과 줄: 요약 화살표 ≥3 · 마지막 = 「다음:」 물음 · 점 4', () => KEYS.forEach(k => { const d = L[k].slides[16].data, a = d.arrows; ok(a.length >= 3 && a.slice(0, -1).every(x => /→/.test(x)) && /^다음: .+\?$/.test(a[a.length - 1]), k); ok(d.points.length === 4, k + ' points'); }));
T('「다음:」 물음 → 다음 차시 주제로 이어짐 · l14 = 이 단원을 마쳐요', () => { const nx = (k) => L[k].slides[16].data.arrows.slice(-1)[0];
  [['u3_l01', /분포/, /인구 분포/], ['u3_l02', /인구수/, /인구수/], ['u3_l04', /면적과 인구수/, /인구 밀도/], ['u3_l05', /나이별/, /인구 구조/], ['u3_l06', /하나의 마을/, /지구촌을 위협/], ['u3_l07', /조사/, /조사/], ['u3_l08', /지속가능한 미래/, /지속가능한 미래를 위한 노력/], ['u3_l10', /실천/, /실천/], ['u3_l12', /그림책/, /스토리보드/], ['u3_l13', /생각 그물/, /생각 그물/]].forEach(([k, re, re2]) => { ok(re.test(nx(k)), k + ' 다음 물음'); ok(re2.test(L[KEYS[KEYS.indexOf(k) + 1]].meta.title), k + ' → 다음 제목'); ok(L[k].slides[18].data.title === '다음 시간엔', k); });
  ok(L.u3_l14.slides[18].data.title === '이 단원을 마쳐요' && /지구촌 사람들/.test(L.u3_l14.slides[18].data.preview) && /6학년 2학기 사회/.test(L.u3_l14.slides[18].data.preview), 'l14 = 6학년 2학기 사회 끝'); ok(!/중학교|7학년|다음 학년/.test(JSON.stringify(L.u3_l14)), 'l14 다음 학년 예고 0(지도서에 없음)'); });
T('l01 단원 도입: 두영이의 방(인구 분포 지도·지구촌 신문·국제 연합·전등 끄기) · 네 사람(아프리카 삽·남아메리카 티셔츠·오스트레일리아 모자·북아메리카 장갑) · 몽골 나무 심기 · 팻말 · 두 주제 · 탐구 질문 예', () => { const s = txt(L.u3_l01);
  has(s, ['세계의 인구 분포 지도', '지구촌 신문', '국제 연합', '아프리카, 삽', '남아메리카, 티셔츠', '오스트레일리아, 모자', '1시간 동안 전등을 끄는 활동', '세계에서 인구가 가장 많은 대륙', '몽골', '나무를 심고', '에너지를 절약합시다!', '나무를 지켜 주세요.', '북극곰을 지켜 주세요.', '1주제는 「세계의 인구 분포」, 2주제는 「지구촌의 문제와 지속가능한 미래」', '세계의 인구는 어디에 분포해 있을까요?']); });
T('l02 인구 분포: 100명 마을 59·18·9·8·5·1 · 자연환경·인문환경 · 붙임딱지 여섯 · 점 1개 100만 명 · 북반구 약 90 % · 중위도 · 25억→81억 · 알래스카 · 활동지 ㉠~㉣', () => { const s = txt(L.u3_l02), x = all(L.u3_l02);
  has(s, ['아시아 59명 · 아프리카 18명 · 유럽 9명 · 남아메리카 8명 · 북아메리카 5명 · 오세아니아 1명', '기온, 강수량, 지형 등 자연환경과 산업, 교통, 문화 등 인문환경', '일찍부터 과학과 기술이 발전하여 다양한 산업이 발달했습니다.', '강수량이 많고 비옥한 평야가 있어 농사에 유리합니다.', '바다를 이용해 무역을 하거나 해산물을 쉽게 얻을 수 있습니다.', '기온이 높고 강수량이 많아 열대 우림이 우거져 있습니다.', '강수량이 매우 적어 물을 구하기 어렵습니다.', '기온이 매우 낮아 식물이 자라기 어렵습니다.', '점(1점당 100만 명)', '약 90 %', '중위도', '1950년 약 25억 명', '2023년 약 81억 명', '알래스카', '가장 적은 대륙은 오세아니아']);
  has(x, ['㉠ 사하라 사막 · ㉡ 시베리아 · ㉢ 히말라야산맥 · ㉣ 아마존 열대 우림', '지도서 276쪽']); });
T('l04 인구수: 10억 이상 인도·중국 · 1억 이상 대륙별 · 인도 14억 3,807만·미국 3억 4,348만·투발루 9,816명·리비아 731만 · 이민 · 출생·사망·이동·환경 · 인구 성장률 뜻 · 아프리카 높음·유럽 낮음', () => { const s = txt(L.u3_l04);
  has(s, ['10억 명 이상인 나라는 인도와 중국', '인도, 중국, 인도네시아, 파키스탄, 방글라데시, 일본, 필리핀, 베트남', '나이지리아, 에티오피아, 이집트, 콩고 민주 공화국', '오세아니아 — 없음', '약 14억 3,807만 명', '약 3억 4,348만 명', '9,816명', '약 731만 명', '이민', '출생과 사망, 인구의 이동, 환경의 변화', '일정한 지역 안에 사는 인구가 증가하는 비율', '아프리카에 있는 나라들은 인구 성장률이 높고']); });
T('l05 인구 밀도: 뜻 · 높은 나라 셋·낮은 나라 셋 · 방글라데시 1,317·캐나다 4 · 우리나라 515·아이슬란드 4·과테말라 169·헝가리 107 · 통계학 연구원', () => { const s = txt(L.u3_l05);
  has(s, ['일정한 면적(1 km²) 안에 사는 인구수로, 인구가 모여 있는 정도', '방글라데시, 르완다, 인도', '몽골, 오스트레일리아, 캐나다', '약 1,317명/km²', '약 4명/km²', '우리나라 약 515명/km² · 아이슬란드 약 4명/km² · 과테말라 약 169명/km² · 헝가리 약 107명/km²', '평야', '벼농사', '냉대 기후', '통계학 연구원']); });
T('l06 인구 구조: 뜻 · 연령층 셋 · 1960~2020 수 · 피라미드 축 · 나이지리아/일본 표 · 인도네시아 54.4 %·25.0/68.0/7.0 · 외국인 근로자 · 2040 예시 · 암호 · 니제르/독일/카타르', () => { const s = txt(L.u3_l06), x = all(L.u3_l06);
  has(s, ['연령, 성 등을 기준으로 한 인구의 짜임새', '0~14세', '15~64세', '65세 이상', '1960년 37.4/57.6/5.0 · 1980년 35.5/58.7/5.8 · 2000년 30.4/62.8/6.8 · 2020년 25.8/64.9/9.3', '가로축 왼쪽은 남자 인구 비율, 오른쪽은 여자 인구 비율, 세로축은 나이(연령)', '유소년층 비율 높다 · 노년층 비율 낮다 · 출생률 높다 · 사망률 높다 · 평균 수명 짧다', '유소년층 비율 낮다 · 노년층 비율 높다 · 출생률 낮다 · 사망률 낮다 · 평균 수명 길다', '54.4 %가 1980~1990년대생', '25.0 %', '68.0 %', '7.0 %', '사우디아라비아·아랍 에미리트·쿠웨이트·카타르', '근로자를 받아들여']);
  has(x, ['21.2 % · 청장년층 64.5 % · 노년층 14.3 %', '세계 인구의 약 90 %는 육지 면적이 넓은 북반구에 살고 있습니다.', '⑴ 독일 · ⑵ 카타르 · ⑶ 니제르']); });
T('l07 지구촌 문제: 3월 마지막 주 토요일 한 시간 · 지구촌 뜻 · 열대 우림 13 %·3분의 2·프랑스·인간 활동·절반 이상·탄소 · 고갈 뜻 · 네 사진(라스밤바스·수마트라·로스글라시아레스·남지중해) · 네 문제', () => { const s = txt(L.u3_l07);
  has(s, ['3월 마지막 주 토요일에 한 시간 동안', '지구가 하나의 마을처럼 가까워진', '약 13 %', '3분의 2', '프랑스의 영토보다 더 넓어요', '농사, 에너지 사용, 목축, 각종 산업', '지구 생명체의 절반 이상', '탄소를 많이 흡수하여 지구 온난화의 속도를 늦추는', '돈이나 물자 등이 다하여 없어짐', '라스밤바스 구리 광산', '수마트라섬', '로스글라시아레스', '남지중해', '자원과 에너지 고갈, 생태계 파괴, 기후변화, 난민']); });
T('l08 조사: 편지(40년·6 km·탄소 적게) · 화석 연료 · 조사 방법 넷 · 출처 · 붙임쪽지 예 둘(폭염·솜브레로 산호초 / 호박벌 60년 70 %) · 조사 네 단계 · 물 10 L·2,700 L·1만 2,000 L', () => { const s = txt(L.u3_l08);
  has(s, ['40년 만에 가장 건조한', '6 km 이상', '탄소 배출을 적게 하는데', '화석 연료', '다큐멘터리 등의 영상 · 지구촌 문제와 관련 있는 책 · 관련 누리집의 통계 · 신문 기사와 카드 뉴스', '출처가 명확하고 믿을 만한 자료인지', '솜브레로 지역의 산호초가 모두 폐사', '호박벌', '60년 안에 70 % 이상', '① 문제 생각하기 → ② 조사 방법 정하기 → ③ 문제 상황, 원인 조사하기 → ④ 내용 정리하기', 'A4 용지 한 장 10 L · 면 티셔츠 한 벌 2,700 L · 청바지 한 벌 1만 2,000 L']); });
T('l10 노력: 지속가능한 미래 뜻 · 녹색 제품 뜻 · 개인 넷 · 기업 둘 · 국가 둘 · 국제기구 셋 · 비정부 기구 셋 · 비정부 기구 뜻 · 디지털+ 게시판 · S.P.E.G.', () => { const s = txt(L.u3_l10), x = all(L.u3_l10);
  has(s, ['오늘날의 모든 사람이 지구 환경을 개선하고 보존하여 미래 세대에 물려주려는', '물건을 생산할 때 지구의 자원이나 에너지를 적게 사용하여 오염 물질 배출을 최소화한 제품', '쓰레기를 분리배출하고 재활용', '물 적게 쓰기, 안 쓰는 전등 끄기', '함부로 훼손하지 않고 보존', '라벨을 없애고 플라스틱 뚜껑의 크기를 줄인 생수병', '플라스틱을 재활용해 만든 운동화', '기후변화 협약', '난민 보호 시설', '국제 평화와 안전을 지키고자 정치·경제·사회·문화 등에서 국제적인 협력', '어려움을 겪는 어린이에게 의료·식량·교육', '난민을 보호하고 생활에 필요한 물품·의료·교육', '개인이나 민간단체가 중심이 되어 공공의 이익을 지키려고', '차별 없이 의료', '생물 다양성', '해양 생태계를 보호', '인터넷 게시판']);
  has(x, ['S.P.E.G.']); });
T('l12 실천: 세계시민 뜻 · 더하기 둘·빼기 둘 · 실천 계획(1명당 3일간·김○○–양○○–최○○–허○○) · 릴레이 네 차례 · 에코 제품 디자이너 · 탑승구 판 여섯 줄 · 평가표 14·11·12', () => { const s = txt(L.u3_l12), x = all(L.u3_l12);
  has(s, ['협력하며 책임 있게 행동하는 사람', '시장바구니 사용하기, 다회용품 사용하기', '플라스틱 덜 사용하기, 안 쓰는 전등 끄기', '한 번의 실천으로 끝나지 않도록', '1명당 3일간', '김○○–양○○–최○○–허○○', '인증 사진', '구체적으로 기록', '다음 차례인 친구에게', '에코 제품 디자이너', '버리는 과정까지', 'AZ01 11:00 카이로 11 탑승 / PE09 12:00 뉴욕 2 준비 / HC01 11:00 제네바 9 탑승 / PE20 11:00 다카 16 탑승 / HC03 12:00 나이로비 22 탑승 / HC15 11:00 도쿄 8 완료']);
  has(x, ['14·11·12']); });
T('l13 생각을 펼쳐요: 스토리보드 뜻 · 네 단계 · 교과서 계획(지구와 함께 살아가는 우리·8~9세) · 여섯 장면 글 · 독자 수준·흐름·두 주제 골고루 · 발표회 살필 점', () => { const s = txt(L.u3_l13);
  has(s, ['장면을 구성하며 이야기의 흐름을 작성한 것', '줄거리와 스케치 형식의 그림', '그림책 발표회', '지구와 함께 살아가는 우리', '8~9세 어린이', '지구촌 곳곳에 많은 사람이 살아가고 있어요.', '어떤 지역은 인구가 많고', '어떤 지역은 인구가 적어요.', '하지만 지구가 병들어 아파하고 있어요.', '지구를 위해 우리 모두 분리배출을 실천해요!', '지구야, 우리가 지켜 줄게!', '독자의 수준', '이야기의 흐름', '세계 인구의 특징과 지속가능한 지구촌', '내용과 수준이 알맞은지']); });
T('l14 단원 마무리: 생각 그물 두 갈래 · 카드 모으기 여덟 단계(진 사람이 문제·맨 아래·맨 위) · 단원 평가 20문항 · 정답 출처 546~547 · 카드 예 넷(544)', () => { const s = txt(L.u3_l14), x = all(L.u3_l14);
  has(s, ['대체로 아시아에 있는 나라들은 인구수가 많고 오세아니아에 있는 나라들은 적어요', '면적과 인구수에 따라', '노년층', '유소년층', '자원과 에너지 고갈 · 생태계 파괴 · 기후변화 · 난민', '카드 6장', '진 사람이', '맨 아래', '맨 위', '가장 많은 카드를 모은 모둠', '20문항']);
  has(x, ['지도서 546~547쪽', '지도서 544쪽']); });
[['u3_l01', /다른 나라 사람들의 일일 뿐/, /어린 학생도/], ['u3_l02', /고르게 퍼져/, /고르게 분포하지 않고/], ['u3_l04', /반드시 많다/, /반드시 인구수가 많은 것은 아니며/], ['u3_l05', /인구 밀도도 높다/, /면적과 인구수에 따라/], ['u3_l06', /미래와는 관계없다/, /미래의 인구 변화를 예상/], ['u3_l07', /좋은 점만/, /위협하는 문제도/], ['u3_l08', /발생한 나라에만/, /다른 나라에도/], ['u3_l10', /한 주체의 노력만으로/, /모든 사람의 노력/], ['u3_l12', /아무 소용이 없다/, /꾸준히 실천/], ['u3_l13', /그림만 예쁘면/, /골고루/], ['u3_l14', /관계없는 두 이야기/, /우리 모두의 문제/]].forEach(([k, wr, r]) =>
  T(k.slice(3) + ' 오개념 ' + wr.source + ' ✗ · ' + r.source + ' (지도서 꼭 기억해요·유의점)', () => { const m = L[k].slides[7].data; ok(wr.test(m.wrong) && r.test(nb(m.right)), k); ok(m.hint && m.tnote, k + ' hint'); }));
T('지도서 유의점: 특정 국가 편견 금지(l04·l05·l06) · 비율↓≠수↓(l02) · 출처 확인(l08) · 실천 가능성·지속 피드백(l12) · 단원 전반 반영(l13)', () => { ok(['u3_l04', 'u3_l05', 'u3_l06'].every(k => /편견/.test(all(L[k]))), '편견'); ok(L.u3_l02.extras.some(e => /비율과 인구수를 같게 볼 수 없/.test(e.content)), 'l02'); ok(/출처가 명확하고 믿을 만한/.test(all(L.u3_l08)), 'l08'); ok(L.u3_l12.extras.some(e => /현실적인 방안/.test(e.content)) && L.u3_l12.extras.some(e => /틈틈이 살피고 피드백/.test(e.content)), 'l12'); ok(L.u3_l13.extras.some(e => /전반적으로 반영/.test(e.content)), 'l13'); });

console.log('═══ H. 선행 용어 · 주제 잠금 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const pre2 = (k) => JSON.stringify(L[k].slides.slice(2, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['이민', /이민/, 'u3_l04'], ['인구 성장률', /인구 성장률/, 'u3_l04'], ['투발루', /투발루/, 'u3_l04'], ['인구 밀도', /인구 밀도/, 'u3_l05'], ['통계학 연구원', /통계학 연구원/, 'u3_l05'], ['방글라데시', /방글라데시/, 'u3_l04'], ['인구 구조', /인구 구조/, 'u3_l06'], ['인구 피라미드', /인구 피라미드/, 'u3_l06'], ['유소년층', /유소년층/, 'u3_l06'], ['고갈', /고갈/, 'u3_l07'], ['라스밤바스', /라스밤바스/, 'u3_l07'], ['붙임쪽지', /붙임쪽지/, 'u3_l08'], ['호박벌', /호박벌/, 'u3_l08'], ['녹색 제품', /녹색 제품/, 'u3_l10'], ['비정부 기구', /비정부 기구/, 'u3_l10'], ['그린피스', /그린피스/, 'u3_l10'], ['세계시민', /세계시민/, 'u3_l12'], ['에코 제품 디자이너', /에코 제품 디자이너/, 'u3_l12'], ['탑승구', /탑승구/, 'u3_l12'], ['스토리보드', /스토리보드/, 'u3_l13'], ['카드 모으기', /카드 모으기/, 'u3_l14']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('1주제(l02~l06)에 2주제 용어(지구촌 문제·난민·지속가능·세계시민·비정부 기구) 0 — 예고·물려받은 복습 장 제외 · 투발루 「기후변화」는 교과서 130쪽 사실이라 허용', () => T1K.forEach(k => { const s = pre2(k); ok(!/지구촌 문제|난민|지속가능|세계시민|비정부 기구/.test(s), k + ' ' + (s.match(/.{10}(지구촌 문제|난민|지속가능|세계시민|비정부 기구).{10}/) || [''])[0]); }));
T('2단원 용어 「시장경제」는 l01 복습에만', () => KEYS.forEach(k => { const s = pre(k).replace(/시장경제와 국가 간 거래/g, ''); if (k === 'u3_l01') ok(JSON.stringify(L[k].slides[1].data).indexOf('시장경제') >= 0, k); else ok(!/시장경제/.test(s), k); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('개념 장 그림 44장 전부 렌더 비지 않음(tools·chain·places)', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(/^(tools|chain|places)$/.test(s.data.fig.k), k + ' ' + s.data.fig.k); const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id); n++; })); ok(n === 44, n); });
T('next_lesson = 「다음 시간엔」 · 단원 끝(l14) = 「이 단원을 마쳐요」', () => KEYS.forEach((k, i) => ok(L[k].slides[18].data.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ J. 차단 어휘 ═══');
T('결·박음·빵꾸·갈아엎 0 (결정·해결·연결·결과·대결 포함 전부) · 겹낫표 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎|『|』/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎|『).{10}/) || [''])[0]); }));
T('신문·방송사 이름·누리집 주소 0(기사 출처는 교사 메모에도 싣지 않음)', () => KEYS.forEach(k => ok(!/KBS|SBS|MBN|뉴스』|타임스|일보|연합 뉴스|코트라|머니 에스|파이낸셜|ntb\.gov|xcms|\.kr|\.org/.test(JSON.stringify(L[k]).replace(/youtube\.com[^"]*/g, '')), k)));

console.log('═══ K. 6학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log('═══ L. 교사 화면 영어 코드 0 ═══');
const SKIP = { id: 1, from: 1, suggested_extras: 1, fit_slides: 1, url: 1, img: 1, k: 1, block: 1, stage: 1, type: 1, src_key: 1 };
function walk(o, out) { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach(x => walk(x, out)); else if (o && typeof o === 'object') Object.keys(o).forEach(key => { if (!SKIP[key]) walk(o[key], out); }); return out; }
T('보이는 글에 u3·L01·l02 같은 코드 0 · 「3단원」「2차시」로', () => KEYS.forEach(k => { const t = walk(L[k], []).join('\n'); ok(!/\b[uUlL]\d{1,2}\b|_l\d|u\d_/.test(t), k + ' ' + (t.match(/.{10}(\b[uUlL]\d{1,2}\b|_l\d|u\d_).{10}/) || [''])[0]); }));

console.log('═══ M. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」 · 동기 「요?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log(`\n${fail ? '❌' : '✅'} gate_g6s2_social_u3: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
