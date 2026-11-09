/* gate_g6s2_social_u1.js — 6학년 2학기 사회 1단원 「세계의 자연환경」 케이티처 2세대 게이트 (교과서판 2학기 트랙 준비본, 2026-11-09 · 오푸스 5.5 — gate_g5s2_social_u1 틀)
   지도서 직행(자기주도 원문 없음) — 2022 개정 사회 6-2 교사용 지도서 1단원 16~119쪽 · 정답 544쪽.
   A 로드·meta · B 19장 골격·extras · C 7요소(6학년 = 장면·물음) · D 복습 계보 · E 기본 문제 정답 · F 분 합계(560)
   G 지리 원칙(생각을 넓혀요 = 상황 · 물음 · 풀이 / 요약 화살표 / 차시마다 교과서·지도서 사실 다시 셈) · H 선행 용어·다루지 않는 것 · I 실렌더
   J 차단 어휘 · K 6학년 인물 0 · L 교사 화면 영어 코드 0 · M 물음 끝
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g6s2_social_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g6s2_social_u1.js'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06', 'u1_l08', 'u1_l09', 'u1_l10', 'u1_l11', 'u1_l12', 'u1_l13', 'u1_l14'];
const COV = { u1_l01: [1, 1], u1_l02: [2, 2], u1_l03: [3, 3], u1_l04: [4, 4], u1_l05: [5, 5], u1_l06: [6, 7], u1_l08: [8, 8], u1_l09: [9, 9], u1_l10: [10, 10], u1_l11: [11, 11], u1_l12: [12, 12], u1_l13: [13, 13], u1_l14: [14, 14] };
const PAGE = { u1_l01: 'p.6~11', u1_l02: 'p.12~14', u1_l03: 'p.15~18', u1_l04: 'p.19~22', u1_l05: 'p.23~25', u1_l06: 'p.26~29', u1_l08: 'p.30~33', u1_l09: 'p.34~36', u1_l10: 'p.37~40', u1_l11: 'p.41~43', u1_l12: 'p.44~47', u1_l13: 'p.48~49', u1_l14: 'p.50~53' };
const STD = { u1_l01: '[6사10-01][6사10-02]', u1_l13: '[6사10-01][6사10-02]', u1_l14: '[6사10-01][6사10-02]' };
['u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06'].forEach(k => STD[k] = '[6사10-01]'); ['u1_l08', 'u1_l09', 'u1_l10', 'u1_l11', 'u1_l12'].forEach(k => STD[k] = '[6사10-02]');
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '세계의 자연환경';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const all = (les) => JSON.stringify(les);
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const ans = (k, i) => L[k].slides[8 + i].data.options.filter(o => o.correct).map(o => o.text);

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('키 = 지도서 1·2·3·4·5·6~7·8·9·10·11·12·13·14차시', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 사회 · unit 1 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 · 목표 · 교과서 쪽 · 주제', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 6 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers');
  ok(m.std === STD[k], k + ' std ' + m.std); ok(m.textbook === PAGE[k], k + ' 쪽 ' + m.textbook); ok(m.goal && /수 있다$/.test(m.goal), k + ' 목표'); ok(m.topic && m.method && m.source, k + ' topic·method·source'); }));
T('주제 = 1주제(l02~l06) · 2주제(l08~l12)', () => { ['u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06'].forEach(k => ok(L[k].meta.topic === '세계 여러 지역의 지형 경관과 다양한 생활 모습', k)); ['u1_l08', 'u1_l09', 'u1_l10', 'u1_l11', 'u1_l12'].forEach(k => ok(L[k].meta.topic === '세계의 기후와 다양한 생활 모습', k)); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
KEYS.forEach(k => T(k + ' extras — 장이 가리키는 id 모두 있음 · id 겹침 0 · 17개(video1·q4·x2·c1·tip5·real1·game1·e2)', () => { const ex = L[k].extras, ids = ex.map(e => e.id); ok(new Set(ids).size === ids.length, '겹침'); ok(ex.length === 17, ex.length);
  const n = +k.slice(4); ok(ids.every(i => new RegExp('^[vqxctrge]_l' + n + '_\\d$').test(i)), 'id 꼴'); L[k].slides.forEach(s => (s.suggested_extras || []).forEach(x => ok(ids.indexOf(x) >= 0, s.id + ' ' + x)));
  ok(ex.every(e => e.title && (e.content || e.url)), '빈 extras'); }));
T('단원 전체 extras id 겹침 0', () => { const ids = KEYS.flatMap(k => L[k].extras.map(e => e.id)); ok(new Set(ids).size === ids.length, ids.length); });

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 3 && s.data.solo && s.data.solo.length), '④활동(1인 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반 · 활동 꼴 pair·group·whole · 6~7차시 = 모둠 소개 자료 · 14차시 = 다 함께 빙고', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); ok(/^(pair|group|whole)$/.test(a.type), k + ' ' + a.type);
  if (k === 'u1_l06') ok(a.type === 'group' && /소개 자료/.test(a.title), k); if (k === 'u1_l14') ok(a.type === 'whole' && /빙고/.test(a.title), k); }));

console.log('═══ D. 복습 계보 ═══');
T('u1_l01 = 단원 첫 차시(from 비움, 회상 셋)', () => { const rv = L.u1_l01.slides[1].data; ok(rv.from === '' && rv.items.length === 3, rv.from); });
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
T('단원 평가 문항 정답 = 지도서 544쪽(3 ② · 6 ③ · 7 ⑤ · 8 ④ · 9 ㉢ · 11 위도 · 12 기온·강수량 · 13 열대 · 14 ④ · 15 건조 · 16 ① · 17 ④ 냉대 · 18 털모자·장갑 · 19 고산 · 20 열대 · 1 지형)', () => {
  ok(ans('u1_l03', 2)[0] === '경사가 급해 관광지로 이용하지 못해요', '3번'); ok(ans('u1_l14', 1).length === 3 && !ans('u1_l14', 1).some(t => /어업이 이루어질 수 없/.test(t)), '6번'); ok(ans('u1_l05', 0)[0] === '해안 지형', '7번'); ok(ans('u1_l05', 1)[0] === '스키장', '8번');
  ok(ans('u1_l14', 0)[0] === '㉢ 화산', '9번'); ok(ans('u1_l08', 0)[0] === '위도', '11번'); ok(ans('u1_l08', 1).join() === '기온,강수량', '12번'); ok(ans('u1_l09', 0)[0] === '열대 기후', '13번'); ok(ans('u1_l08', 2)[0] === '열대–건조–온대–냉대–한대', '14번');
  ok(ans('u1_l09', 1)[0] === '건조 기후', '15번'); ok(/밀을 많이 재배하고 낙농업/.test(ans('u1_l10', 0)[0]), '16번'); ok(ans('u1_l10', 1)[0] === '냉대 기후', '17번'); ok(ans('u1_l11', 0).join() === '털모자,장갑', '18번'); ok(ans('u1_l11', 1)[0] === '고산 기후', '19번'); ok(ans('u1_l13', 0)[0] === '열대 기후', '20번'); ok(ans('u1_l14', 2)[0] === '지형', '1번');
  ok(ans('u1_l03', 0).length === 2 && ans('u1_l03', 0).every(t => /고원|화산/.test(t)), '2번 ④⑤'); });

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 560 (14차시 × 40) · 80분 하나(6·7차시)', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 560, d); ok(d.filter(x => x === 80).length === 1 && L.u1_l06.meta.duration_min === 80, d); });

console.log('═══ G. 지리 원칙 · 교과서·지도서 사실 다시 셈 ═══');
KEYS.forEach(k => T(k + ' s15 생각을 넓혀요 = 상황 · 물음 · 「풀이:」 · 발문', () => { const d = L[k].slides[14].data;
  ok(d.title === '생각을 넓혀요', d.title); ok(d.context && d.context.length > 30, 'context'); ok(d.challenge && /(봐요|세요)\.$/.test(d.challenge), 'challenge'); ok(/^풀이:/.test(d.note) && d.note.length > 80, 'note'); ok(d.tnote, 'tnote'); }));
T('생각을 넓혀요 「하나가 아니·근거·함께」 같은 균형 말 ≥ 8 차시(정답 강요 금지 · 지도서 균형적 시각)', () => { const n = KEYS.filter(k => /하나가 아니|근거|함께 보는|늘 그렇지는|둘/.test(L[k].slides[14].data.note)).length; ok(n >= 8, n); });
T('인과 줄: 요약 화살표 ≥3 · 마지막 = 「다음:」 물음 · 점 4', () => KEYS.forEach(k => { const d = L[k].slides[16].data, a = d.arrows; ok(a.length >= 3 && a.slice(0, -1).every(x => /→/.test(x)) && /^다음: .+\?$/.test(a[a.length - 1]), k); ok(d.points.length === 4, k + ' points'); }));
T('「다음:」 물음 → 다음 차시 주제로 이어짐', () => { const nx = (k) => L[k].slides[16].data.arrows.slice(-1)[0];
  [['u1_l01', /지형 경관/, /지형 경관/], ['u1_l02', /산지/, /산지/], ['u1_l03', /강/, /하천/], ['u1_l04', /바다와 육지/, /해안/], ['u1_l05', /조사/, /조사/], ['u1_l06', /기후/, /기후 분포/], ['u1_l08', /덥거나 비가 적은/, /열대 기후와 건조 기후/], ['u1_l09', /사계절|겨울이 긴/, /온대 기후와 냉대 기후/], ['u1_l10', /추운 곳과 아주 높은/, /한대 기후와 고산 기후/], ['u1_l11', /조사해 지도/, /조사/], ['u1_l12', /상품/, /상품/], ['u1_l13', /정리/, /단원 마무리/]].forEach(([k, re, re2], i) => { ok(re.test(nx(k)), k + ' 다음 물음'); ok(re2.test(L[KEYS[KEYS.indexOf(k) + 1]].meta.title), k + ' → 다음 제목'); ok(L[k].slides[18].data.title === '다음 시간엔', k); });
  ok(/시장경제와 국가 간 거래/.test(L.u1_l14.slides[18].data.preview) && L.u1_l14.slides[18].data.title === '이 단원을 마쳐요' && /사고팔/.test(nx('u1_l14')), 'l14 → 2단원'); });
T('l01 단원 도입: 박람회 전시관 다섯 · 네 친구 = 모로코(건조·흙벽돌)·캐나다(빙하·이누이트)·브라질(야자수·폭포)·네팔(지대가 높은 산·트레킹) · 실마리 셋 · 두 주제', () => { const s = txt(L.u1_l01); ok(/캐나다·모로코·네팔·브라질·일본/.test(s), '전시관'); ok(/흙벽돌로 만든 집」 → \*\*모로코\*\*/.test(s) && /이누이트족의 생활 체험」 → \*\*캐나다\*\*/.test(s) && /거대한 폭포」 → \*\*브라질\*\*/.test(s) && /트레킹」 → \*\*네팔\*\*/.test(s), '네 친구'); ok(/실마리는 셋/.test(s), '실마리'); ok(/1주제는 「세계 여러 지역의 \*\*지형 경관\*\*과 다양한 생활 모습」, 2주제는 「세계의 \*\*기후\*\*와 다양한 생활 모습」/.test(s), '두 주제'); });
T('l02 지형 경관: 지형 넷 · 일곱 곳(나라 그대로) · 피오르 뜻 · 아치 뜻 · 호라이마산 「우뚝 솟아 있지만 위쪽이 평평하다」 · 생활 모습에 영향', () => { const s = txt(L.u1_l02); ok(/\*\*산지, 하천, 해안, 사막\*\*/.test(s), '넷'); ['송네 피오르\\*\\*\\(노르웨이\\)', '사하라 사막\\*\\*\\(리비아\\)', '황허강\\*\\*\\(중국\\)', '울루루\\*\\*\\(오스트레일리아\\)', '마우나로아\\*\\*\\(미국\\)', '엘 아르코\\*\\*\\(멕시코\\)', '호라이마산\\*\\*\\(베네수엘라 볼리바르\\)'].forEach(p => ok(new RegExp(p).test(s), p)); ok(/빙하에 깎인 유\(U\) 자 모양의 계곡에 바닷물이 들어와 만들어진 해안선/.test(s), '피오르'); ok(/무지개같이 한가운데가 높고 길게 굽은 모양/.test(s), '아치'); ok(/우뚝 솟아 있지만 위쪽이 평평하다/.test(s), '호라이마산'); ok(/\*\*생활 모습\*\*에 영향/.test(s), '영향'); });
T('l03 산지: 해발 고도 뜻 · 고원·화산 · 에베레스트산 8,848 m · 아비시니아고원 아프리카의 지붕 · 파미르고원 양·알프스 관광·추키카마타 구리·아이슬란드 · 바나우에 계단식 논 · 셰르파·쓰레기·입산료 · 꼭 기억해요 2', () => { const s = txt(L.u1_l03); ok(/바다 표면으로부터 잰 육지 높이/.test(s), '해발 고도'); ok(/\*\*에베레스트산\(8,848 m\)\*\*/.test(s) && /아프리카의 지붕/.test(s), '산지'); ok(/\*\*양을 키우고\*\*/.test(s) && /\*\*구리\*\*/.test(s) && /알프스산맥/.test(s) && /아이슬란드/.test(s), '생활'); ok(/바나우에/.test(s) && /계단식 논/.test(s) && /지구 반 바퀴/.test(s), '바나우에'); ok(/\*\*셰르파\*\*/.test(s) && /\*\*입산료\*\*/.test(s) && /\*\*쓰레기\*\*/.test(s), '에베레스트'); ok(/관광 산업이 발달한다/.test(L.u1_l03.slides[7].data.wrong), '꼭 기억해요 2'); });
T('l04 하천: 계곡·평야·폭포 · 퇴적물 · ㉠ 아마존강·㉡ 나일강 평야·㉢ 호스슈 벤드 계곡·㉣ 빅토리아 폭포 · 콩고강·일리노이강·노르웨이 수력 · 이구아수·짜오프라야 수상 시장 · 프레이저강 통나무 · 여행 기획자', () => { const s = txt(L.u1_l04); ok(/\*\*계곡\*\*/.test(s) && /\*\*넓은 평야\*\*/.test(s) && /\*\*거대한 폭포\*\*/.test(s) && /\*\*퇴적물\*\*/.test(s), '특징'); ok(/㉠ 아마존강\*\*\(브라질\)/.test(s) && /㉡ 나일강 평야\*\*\(이집트\)/.test(s) && /㉢ 호스슈 벤드 계곡\*\*\(미국\)/.test(s) && /㉣ 빅토리아 폭포\*\*\(잠비아, 짐바브웨\)/.test(s), '네 곳'); ok(/\*\*콩고강\*\*/.test(s) && /\*\*일리노이강\*\*/.test(s) && /\*\*수력 발전\*\*/.test(s), '생활①'); ok(/\*\*이구아수 폭포\*\*/.test(s) && /\*\*수상 시장\*\*/.test(s) && /프레이저강/.test(s) && /통나무/.test(s), '생활②'); ok(/\*\*여행 기획자\*\*/.test(s), '직업'); });
T('l05 해안: 갯벌·모래사장·절벽·돌기둥 · 펀디만·마케나·포트 캠벨 · 세계 유명 갯벌 다섯 · 양식업 뜻 · 항구·관광지·염전 · 스리랑카·네덜란드·게랑드·멕시코 · 보라카이 2백만 명·10억 달러·6개월 폐쇄 · 꼭 기억해요 2', () => { const s = txt(L.u1_l05); ok(/\*\*갯벌\*\*/.test(s) && /\*\*모래사장\*\*/.test(s) && /\*\*거대한 절벽이나 돌기둥\*\*/.test(s), '경관'); ok(/펀디만/.test(s) && /마케나/.test(s) && /포트 캠벨/.test(s), '세 곳'); ok(/미국 동부 연안, 캐나다 동부 연안, 브라질 아마존강 유역, 유럽 북해 연안/.test(s), '갯벌 다섯'); ok(/물고기나 조개 등을 인공적으로 기르는 일/.test(s), '양식업'); ok(/\*\*항구\*\*/.test(s) && /\*\*염전\*\*/.test(s) && /스리랑카/.test(s) && /네덜란드/.test(s) && /게랑드/.test(s) && /멕시코/.test(s), '생활'); ok(/\*\*2백만 명 이상\*\*/.test(s) && /\*\*10억 달러\*\*/.test(s) && /\*\*6개월간 폐쇄\*\*/.test(s), '보라카이'); ok(/염전이 발달한다/.test(L.u1_l05.slides[7].data.wrong), '꼭 기억해요 2'); });
T('l06 조사: 주제 예 넷 · 동영상·사진 검색 · 세 칸 · 에트나 화산 검은 토양·오렌지·3,323 m · 「+」「공유」「삽입」「슬라이드」 · 조사 차례 · 박람회 표지판 「지형 경관」 · 여행 마그넷', () => { const s = txt(L.u1_l06), x = all(L.u1_l06); ok(/보호받는 지형 경관/.test(s) && /대륙별 큰 강/.test(s), '주제 예'); ok(/\*\*동영상 검색·사진 검색\*\*/.test(s), '검색'); ok(/\*\*지형 경관 · 사람들의 생활 모습 · 소개하고 싶은 내용\*\*/.test(s), '세 칸'); ok(/\*\*에트나 화산\*\*/.test(s) && /\*\*검은 토양\*\*/.test(s) && /\*\*오렌지 농사\*\*/.test(s) && /3,323 m/.test(s), '에트나'); ok(/「\*\*\+\*\*」/.test(s) && /「\*\*공유\*\*」/.test(s) && /「\*\*삽입\*\*」/.test(s) && /「\*\*슬라이드\*\*」/.test(s), '도구'); ok(/인터넷으로 조사하기 → 조사 내용 정리하기 → 소개 자료 만들기 → 발표하기/.test(s), '차례'); ok(/박람회 표지판 「\*\*지형 경관\*\*」/.test(s), '표지판'); ok(/여행 마그넷/.test(x), '마그넷'); });
T('l08 기후 분포: 기후 뜻 · 위도와 햇볕 · 아부자 26.6℃·리옹 11.9℃·키루나 -0.5℃(저·중·고위도) · 위치·지형·해발 고도 · 기온과 강수량 · 차례 · 냉대 = 북반구 · 우리나라 = 온대·냉대 · 전통 의상 페루·사우디아라비아·캐나다', () => { const s = txt(L.u1_l08); ok(/여러 해에 걸쳐 반복적으로\*\* 나타나는 \*\*대기의 평균적인 상태/.test(s), '뜻'); ok(/\*\*위도에 따라 햇볕을 받는 양\*\*/.test(s), '햇볕'); ok(/\*\*아부자 26\.6℃\*\*는 저위도 ㉢/.test(s) && /\*\*리옹 11\.9℃\*\*는 중위도 ㉡/.test(s) && /\*\*키루나 -0\.5℃\*\*는 고위도 ㉠/.test(s), '세 도시'); ok(/\*\*위치와 지형, 해발 고도\*\*/.test(s) && /\*\*기온과 강수량\*\*/.test(s), '요인·기준'); ok(/\*\*열대 기후, 건조 기후, 온대 기후, 냉대 기후, 한대 기후\*\*/.test(s) && /\*\*고산 기후\*\*/.test(s), '차례'); ok(/\*\*냉대 기후는 주로 북반구\*\*/.test(s) && /\*\*우리나라에는 온대 기후와 냉대 기후\*\*/.test(s), '분포'); ok(/페루·사우디아라비아·캐나다/.test(s), '사진전'); });
T('l09 열대·건조: 열대 특징 · 건기·우기 뜻 · 쿠알라룸푸르·므완자 · 막대 = 강수량·선 = 기온 · 화전 농업 뜻 · 대규모 재배 넷 · 생태 관광 · 큰 창·띄운 바닥·얇은 옷 · 똠얌꿍 향신료 다섯 · 건조 특징·카이로 · 유목 뜻 · 흙벽돌·이동식 가옥 · 오아시스 밀·대추야자', () => { const s = txt(L.u1_l09); ok(/\*\*일 년 내내 기온이 높고 기온의 변화가 거의 없어요\*\*/.test(s), '열대'); ok(/비가 적게 내리는 시기/.test(s) && /비가 많이 내리는 시기/.test(s) && /쿠알라룸푸르/.test(s) && /므완자/.test(s) && /막대는 강수량, 선은 기온/.test(s), '그래프'); ok(/나무와 풀을 태우고 남은 재를 거름 삼아 농사짓는 방식/.test(s) && /\*\*천연고무, 카카오, 바나나, 커피\*\*/.test(s) && /\*\*사파리 관광, 전통 부족 생활 체험\*\*/.test(s), '열대 생활'); ok(/똠얌꿍/.test(s) && /레몬그라스, 라임잎, 고추, 고수, 생강/.test(s), '똠얌꿍'); ok(/\*\*낮과 밤의 기온 차이가 커요\*\*/.test(s) && /카이로/.test(s), '건조'); ok(/물과 풀이 있는 곳을 찾아 이동하며 가축을 기르는 일/.test(s) && /\*\*이동식 가옥\*\*/.test(s) && /\*\*밀이나 대추야자\*\*/.test(s) && /흙벽돌/.test(s), '건조 생활'); });
T('l10 온대·냉대: 중위도·사계절 · 런던·로마·서울 강수량 셋 · 낙농업 뜻 · 서부 유럽·지중해·아시아 · 냉대 = 북반구 중·고위도·긴 겨울 · 오슬로 · 여름 밀·옥수수·감자 · 펄프 뜻 · 통나무집·털옷 · 에이쉬·핀란드 운전면허·파리 일광욕 · 관광 상품', () => { const s = txt(L.u1_l10); ok(/\*\*중위도\*\*/.test(s) && /\*\*사계절의 변화가 비교적 뚜렷해요\*\*/.test(s), '온대'); ok(/\(런던\)/.test(s) && /\(로마\)/.test(s) && /\(서울\)/.test(s), '세 도시'); ok(/젖소나 염소를 길러 우유, 치즈 등을 만드는 농업/.test(s) && /\*\*올리브나 포도\*\*/.test(s) && /\*\*벼농사\*\*/.test(s), '온대 생활'); ok(/\*\*북반구의 중위도와 고위도\*\*/.test(s) && /\*\*겨울이 여름보다 길고 몹시 추우며 눈이 많이 내려요\*\*/.test(s) && /오슬로/.test(s), '냉대'); ok(/\*\*여름에는 밀, 옥수수, 감자 등을 재배\*\*/.test(s) && /나무에서 뽑아낸 것으로 종이의 원료/.test(s) && /\*\*통나무집\*\*/.test(s), '냉대 생활'); ok(/「\*\*에이쉬\*\*」/.test(s) && /\*\*핀란드\*\*/.test(s) && /\*\*일광욕\*\*/.test(s), '독특한 문화'); ok(/관광 상품/.test(s), '관광 상품'); ok(/겨울에 밀, 옥수수, 감자/.test(L.u1_l10.slides[7].data.wrong), '꼭 기억해요 2'); });
T('l11 한대·고산: 남극·북극 주변 고위도 · 누크 · 사냥·순록 유목·지하자원·극지 연구 · 오로라 뜻 · 빙하 관광 · 고산 = 해발 고도·적도 주변 서늘·사람 많이 · 키토 · 고산 도시 여섯 · 감자·옥수수·알파카·라마·모자·망토 · 장보고 과학 기지 · 꼭 기억해요 2', () => { const s = txt(L.u1_l11); ok(/\*\*남극과 북극 주변의 고위도\*\*/.test(s) && /누크/.test(s), '한대'); ok(/\*\*순록을 기르며 유목\*\*/.test(s) && /\*\*지하자원 개발\*\*/.test(s) && /\*\*극지방 기후 환경 연구\*\*/.test(s) && /극지방 하늘에서 여러 가지 색깔의 빛이 나타나는 현상/.test(s) && /\*\*빙하\*\*/.test(s), '한대 생활'); ok(/\*\*해발 고도가 높은\*\*/.test(s) && /\*\*적도 주변의 일부 고산 기후 지역은 일 년 내내 서늘한 날씨\*\*/.test(s) && /키토/.test(s), '고산'); ok(/보고타\(콜롬비아\), 멕시코시티\(멕시코\), 라파스\(볼리비아\), 쿠스코\(페루\), 키토\(에콰도르\), 아디스아바바\(에티오피아\)/.test(s), '고산 도시'); ok(/\*\*감자와 옥수수\*\*/.test(s) && /\*\*알파카와 라마\*\*/.test(s) && /\*\*챙이 넓고 둥근 모자\*\*/.test(s) && /망토/.test(s), '고산 생활'); ok(/\*\*장보고 과학 기지\*\*/.test(s), '극지 과학자'); ok(/서늘/.test(L.u1_l11.slides[7].data.right), '꼭 기억해요 2'); });
T('l12 기후 조사·매핑: 주제 다섯 · 대륙별·기후대별 · 송끄란(열대 타이·가장 더운 시기·물 뿌림) · 매핑 뜻 · 준비 셋(저장됨–지도–지도 만들기·공유) · 매핑 셋(레이어 추가·+ 지도에 추가) · 수정 권한 · 글자 「기후」', () => { const s = txt(L.u1_l12); ok(/\*\*기후와 축제, 기후와 음식, 기후와 이동 수단, 기후와 전통 의상, 기후가 만든 독특한 문화\*\*/.test(s), '주제'); ok(/\*\*대륙별\*\* 또는 \*\*기후대별\*\*/.test(s), '나누기'); ok(/\*\*송끄란 축제\*\*는 열대 기후인 \*\*타이\*\*에서 일 년 중 가장 더운 시기/.test(s), '송끄란'); ok(/디지털 영상 지도에 필요한 정보를 원하는 위치에 \*\*배치\*\*하는 것/.test(s), '매핑'); ok(/「\*\*저장됨–지도–지도 만들기\*\*」/.test(s) && /「\*\*레이어 추가\*\*」/.test(s) && /「\*\*\+ 지도에 추가\*\*」/.test(s) && /\*\*수정할 수 있는 권한\*\*/.test(s), '매핑 차례'); ok(/「기후」/.test(s), '글자 찾기'); });
T('l13 생각을 펼쳐요: 네 단계 · 노르웨이(송네 피오르·스칸디나비아산맥·온대·냉대·한대) · 아이디어 셋(어망·등산 장비·다기능 신발) · 방한용 안전 신발(스파이크·스키·태양열 열선) · 해충 퇴치기 · 실현 가능성', () => { const s = txt(L.u1_l13); ok(/\*\*상품을 판매할 나라\*\*/.test(s) && /\*\*유명한 지형과 기후\*\*/.test(s) && /\*\*글과 그림\*\*/.test(s), '단계'); ok(/\*\*송네 피오르, 스칸디나비아산맥\*\*/.test(s) && /\*\*온대 기후, 냉대 기후, 한대 기후\*\*/.test(s), '노르웨이'); ok(/\*\*튼튼한 어망\*\*/.test(s) && /\*\*만능 등산 장비\*\*/.test(s) && /\*\*다기능 신발\*\*/.test(s), '아이디어'); ok(/\*\*스파이크\*\*/.test(s) && /\*\*스키를 붙일 수 있어\*\*/.test(s) && /\*\*태양열로 자동 충전되는 열선\*\*/.test(s) && /\*\*해충 퇴치기\*\*/.test(s), '판매 계획'); ok(/실현 가능성/.test(all(L.u1_l13)), '실현 가능성'); });
T('l14 단원 마무리: 생각 그물 둘 · 빙고 놀이 다섯 단계(정답 단어 말하지 않기·줄 3개) · 빙고 판 열여섯 낱말 · 단원 평가 20문항 · 지형 경관 지키는 노력 셋(단원 평가 10번)', () => { const s = txt(L.u1_l14), x = all(L.u1_l14); ok(/\*\*산지\*\* — 산맥·고원·화산/.test(s) && /\*\*한대\*\* — 순록 유목/.test(s), '그물'); ok(/정답 단어를 직접 말하지 않아요/.test(s) && /\*\*줄 3개\*\*/.test(s) && /이 지형은 바닷가 근처에 있어/.test(s), '빙고'); ok(/침엽수림·건조 기후·화전 농업·계단식 논·열대 우림·지형 경관·고산 기후·갯벌·해안 지형·사파리 관광·산지 지형·폭포·한대 기후·하천 지형·화산·올리브/.test(s), '빙고 판'); ok(/\*\*20문항\*\*/.test(s) && /쓰레기를 버리지 않는다, 지나친 개발을 하지 않는다, 관광객의 수를 제한한다/.test(s), '단원 평가'); ok(/지도서 544쪽/.test(x), '정답 출처'); });
[['u1_l01', /비슷하다/, /다양/], ['u1_l02', /모두 같다/, /서로 다른 특징/], ['u1_l03', /관광 산업이 발달한다/, /광업/], ['u1_l04', /어업이 이루어질 수 없다/, /어업이 활발/], ['u1_l05', /염전이 발달한다/, /항구/], ['u1_l06', /농사를 지을 수 없다/, /계단식 논/], ['u1_l08', /위도가 같으면/, /해발 고도/], ['u1_l09', /강수량이 많은 곳/, /오아시스/], ['u1_l10', /겨울에 밀/, /여름에 밀/], ['u1_l11', /무덥다/, /서늘하다/], ['u1_l12', /모두 같다/, /다양한 생활 모습/], ['u1_l13', /어디서나 잘 팔린다/, /지형과 기후/], ['u1_l14', /기준은 위도/, /기온과 강수량/]].forEach(([k, wr, r]) =>
  T(k.slice(3) + ' 오개념 ' + wr.source + ' ✗ · ' + r.source + ' (지도서 꼭 기억해요·단원 평가·유의점)', () => { const m = L[k].slides[7].data; ok(wr.test(m.wrong) && r.test(nb(m.right)), k); ok(m.hint && m.tnote, k + ' hint'); }));
T('지도서 유의점: 기후 그래프 일반화 주의(l09·l10·l11) · 대략적인 분포(l08) · 균형적 시각(l05) · 실현 가능성(l13) · 수정 권한(l12)', () => { ok(['u1_l09', 'u1_l10', 'u1_l11'].every(k => L[k].extras.some(e => /일반화되지 않도록/.test(e.content))), '일반화'); ok(L.u1_l08.extras.some(e => /경계를 명확히 가르는 것은 알맞지 않/.test(e.content)), 'l08'); ok(L.u1_l05.extras.some(e => /균형적 시각/.test(e.content)), 'l05'); ok(L.u1_l13.extras.some(e => /실현 가능성/.test(e.content)), 'l13'); ok(L.u1_l12.extras.some(e => /수정 권한/.test(e.content)), 'l12'); });

console.log('═══ H. 선행 용어 · 다루지 않는 것 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['피오르', /피오르/, 'u1_l02'], ['아치', /아치/, 'u1_l02'], ['디지털 영상 지도', /디지털 영상 지도/, 'u1_l02'], ['해발 고도', /해발 고도/, 'u1_l03'], ['고원', /고원/, 'u1_l03'], ['계단식 논', /계단식 논/, 'u1_l03'], ['셰르파', /셰르파/, 'u1_l03'], ['광업', /광업/, 'u1_l03'], ['퇴적물', /퇴적물/, 'u1_l04'], ['수력 발전', /수력 발전/, 'u1_l04'], ['수상 시장', /수상 시장/, 'u1_l04'], ['양식업', /양식업/, 'u1_l05'], ['염전', /염전/, 'u1_l05'], ['갯벌', /갯벌/, 'u1_l05'], ['보라카이', /보라카이/, 'u1_l05'], ['에트나', /에트나/, 'u1_l06'], ['프레젠테이션', /프레젠테이션/, 'u1_l06'], ['위도', /위도/, 'u1_l08'], ['기온과 강수량', /기온과 강수량/, 'u1_l08'], ['냉대', /냉대/, 'u1_l08'], ['열대 우림', /열대 우림/, 'u1_l09'], ['화전 농업', /화전/, 'u1_l09'], ['건기', /건기/, 'u1_l09'], ['유목', /유목/, 'u1_l09'], ['대추야자', /대추야자/, 'u1_l09'], ['낙농업', /낙농업/, 'u1_l10'], ['펄프', /펄프/, 'u1_l10'], ['침엽수림', /침엽수림/, 'u1_l10'], ['순록', /순록/, 'u1_l10'], ['오로라', /오로라/, 'u1_l11'], ['알파카', /알파카/, 'u1_l11'], ['극지 과학자', /극지 과학자/, 'u1_l11'], ['매핑', /매핑/, 'u1_l12'], ['송끄란', /송끄란/, 'u1_l12'], ['판매 동기', /판매 동기/, 'u1_l13'], ['빙고', /빙고/, 'u1_l14']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('지나치게 세분한 기후 이름·원인 0(쾨펜·사바나 기후·스텝·툰드라·서안 해양성·지중해성 기후·열대 계절풍·타이가·편서풍·아열대 고압대 — 지도서 69·74쪽 유의점)', () => KEYS.forEach(k => { const s = all(L[k]); ok(!/쾨펜|사바나 기후|스텝|툰드라|서안 해양성|지중해성 기후|열대 계절풍|타이가|편서풍|아열대 고압대/.test(s), k + ' ' + (s.match(/.{10}(쾨펜|사바나 기후|스텝|툰드라|서안 해양성|지중해성 기후|열대 계절풍|타이가|편서풍|아열대 고압대).{10}/) || [''])[0]); }));
T('1주제(l01~l06)에 2주제 기후 세부(화전·낙농업·펄프·순록·알파카·오로라) 0 · 2단원 용어(시장경제·무역·수출) 0(l14 예고 제외)', () => { ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06'].forEach(k => ok(!/화전|낙농업|펄프|순록|알파카|오로라/.test(pre(k)), k)); KEYS.forEach(k => { const s = pre(k).replace(/시장경제와 국가 간 거래/g, ''); ok(!/시장경제|무역|수출/.test(s), k); }); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('개념 장 그림 52장 전부 렌더 비지 않음(tools·chain·places)', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(/^(tools|chain|places)$/.test(s.data.fig.k), k + ' ' + s.data.fig.k); const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id); n++; })); ok(n === 52, n); });
T('next_lesson = 「다음 시간엔」 · 단원 끝(l14) = 「이 단원을 마쳐요」', () => KEYS.forEach((k, i) => ok(L[k].slides[18].data.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ J. 차단 어휘 ═══');
T('결·박음·빵꾸·갈아엎 0 (결정·해결·연결·결과·대결 포함 전부) · 겹낫표 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎|『|』/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎|『).{10}/) || [''])[0]); }));
T('신문·방송사 이름 0(기사 출처는 교사 메모에도 싣지 않음)', () => KEYS.forEach(k => ok(!/KBS|뉴스』|타임스|일보|ntb\.gov|xcms/.test(JSON.stringify(L[k])), k)));

console.log('═══ K. 6학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log('═══ L. 교사 화면 영어 코드 0 ═══');
const SKIP = { id: 1, from: 1, suggested_extras: 1, fit_slides: 1, url: 1, img: 1, k: 1, block: 1, stage: 1, type: 1, src_key: 1 };
function walk(o, out) { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach(x => walk(x, out)); else if (o && typeof o === 'object') Object.keys(o).forEach(key => { if (!SKIP[key]) walk(o[key], out); }); return out; }
T('보이는 글에 u1·L01·l02 같은 코드 0 · 「1단원」「2차시」로', () => KEYS.forEach(k => { const t = walk(L[k], []).join('\n'); ok(!/\b[uUlL]\d{1,2}\b|_l\d|u\d_/.test(t), k + ' ' + (t.match(/.{10}(\b[uUlL]\d{1,2}\b|_l\d|u\d_).{10}/) || [''])[0]); }));

console.log('═══ M. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」 · 동기 「요?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log(`\n${fail ? '❌' : '✅'} gate_g6s2_social_u1: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
