/* gate_g6s2_korean_u1.js — 6학년 2학기 국어 1단원 「깊이 있게 감상해요」 케이티처 2세대 게이트 (224차, 베프 — gate_g5s2_korean_u6 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 5학년 선수 학습 · l14 예고 = 2단원)
   E 기본 문제 정답 + 작가의 의도 뜻 · 시조 원문(지도서) · 김소월 시 · 이야기 구조 뜻 · 구조 판 = 제재 문단 · 간추린 줄거리 = 수준별 도전 답 · 시간 표현 = 제재 속 · 동형어 뜻(지도서) 다시 셈
   F 분 합계 560 · G 제재(자체 집필·공유 저작물 판 · 저작권 있는 교과서 작품·지은이 이름 0) · H 선행(작가의 의도 l01 · 시조·반응 중심 l02 · 일제 강점기 l04 · 이야기 구조 l07 · 시간 표현 l09 · 광고지 l12 · 동형어 l14)
   I 오개념·심화(하나가 아님·다를 수 + 근거) · J 실렌더 · K 물음 끝 · L 차단 어휘(「결」 글자는 교과 용어 「결말」만 · 겹낫표 0) · M 6학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g6s2_korean_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g6s2_korean_u1.js'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l04', 'u1_l07', 'u1_l09', 'u1_l12', 'u1_l14'];
const COV = { u1_l01: [1, 1], u1_l02: [2, 3], u1_l04: [4, 6], u1_l07: [7, 8], u1_l09: [9, 11], u1_l12: [12, 13], u1_l14: [14, 14] };
const OLD = [1, 2, 3, 4, 5, 6].map(u => load(path.join(TDIR, 'data/g5s2_korean_u' + u + '.js')));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '깊이 있게 감상해요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
/* 뜻 — 지도서 1단원 그대로 */
const INTENT = '작가가 글을 쓴 까닭, 읽는 사람이 무엇을 느끼거나 생각하기를 바라는지 등을 작품에 담은 것';
const DEF = { 발단: '이야기가 시작되는 부분', 전개: '사건이 본격적으로 일어나는 부분', 절정: '긴장감이 높아지거나 갈등이 두드러지는 부분', 결말: '이야기가 마무리되는 부분' };
/* 시조 원문 — 지도서 38~39쪽(옛 시조, 공유 저작물) */
const HAYEO = ['이런들 어떠하며 저런들 어떠하리', '만수산 드렁칡이 얽혀진들 어떠하리', '우리도 이같이 얽혀져 백 년까지 누리리라'];
const DANSIM = ['이 몸이 죽고 죽어 일백 번 고쳐 죽어', '백골이 진토 되어 넋이라도 있고 없고', '임 향한 일편단심이야 가실 줄이 있으랴'];
/* 김소월 「엄마야 누나야」(1920년대 발표, 공유 저작물) */
const MOM = ['엄마야 누나야 강변 살자', '뜰에는 반짝이는 금모래 빛', '뒷문 밖에는 갈잎의 노래', '엄마야 누나야 강변 살자'];
/* 동형어 — 지도서 75쪽 기초 다지기 뜻 */
const DONG = { '돌 ①': '흙 따위가 굳어서 된 단단한 덩어리', '돌 ②': '어린아이가 태어난 날로부터 한 해가 되는 날', '경로 ①': '지나는 길', '경로 ②': '노인을 공경함', '인정 ①': '남을 동정하는 따뜻한 마음', '인정 ②': '확실히 그렇다고 여김', '대상 ①': '어떤 일의 상대 또는 목표나 목적이 되는 것', '대상 ②': '여러 가지 상 가운데 가장 큰 상' };
const DONGV = Object.values(DONG);

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('7차시 키(2·3 → l02 · 4~6 → l04 · 7·8 → l07 · 9~11 → l09 · 12·13 → l12 · 14 → l14)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 국어 · unit 1 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 · 목표 · 테마', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 6 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국0(5-01|2-01|4-05)\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); ok(m.theme === '우리 반 문학 산책', k + ' theme'); }));
T('[6국05-01] = l01·l02·l04·l12·l14 · [6국02-01] = l07·l09·l12·l14 · [6국04-05] = l09(시간 표현)', () => {
  const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf(c) >= 0).join();
  ok(has('[6국05-01]') === 'u1_l01,u1_l02,u1_l04,u1_l12,u1_l14', '05-01 ' + has('[6국05-01]')); ok(has('[6국02-01]') === 'u1_l07,u1_l09,u1_l12,u1_l14', '02-01 ' + has('[6국02-01]')); ok(has('[6국04-05]') === 'u1_l09', '04-05');
  ['u1_l01', 'u1_l02', 'u1_l04', 'u1_l12', 'u1_l14'].forEach(k => ok(/작가의 의도/.test(txt(L[k])), k + ' 작가의 의도')); ['u1_l07', 'u1_l09', 'u1_l12', 'u1_l14'].forEach(k => ok(/줄거리/.test(txt(L[k])), k + ' 줄거리')); ok(/시간 표현/.test(txt(L.u1_l09)), 'l09 시간 표현'); });
T('l02 = 2·3차시 80분 · 반응 중심 학습 모형 · l04 = 4~6차시 120분 · l09 = 9~11차시 120분 · l12 = 실천', () => { const m = L.u1_l02.meta; ok(m.covers === '2·3차시' && m.duration_min === 80 && /반응 중심 학습 모형/.test(m.lesson_format), 'l02');
  ok(L.u1_l04.meta.covers === '4~6차시' && L.u1_l04.meta.duration_min === 120, 'l04'); ok(L.u1_l09.meta.covers === '9~11차시' && L.u1_l09.meta.duration_min === 120, 'l09'); ok(/실천/.test(L.u1_l12.meta.lesson_format), 'l12'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length && ['pair', 'group', 'whole'].indexOf(s.data.type) >= 0), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 7종 서로 다름 · 5-2 국어 1~6단원과도 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img), old = OLD.reduce((a, U) => a.concat(Object.keys(U).map(k => U[k].slides[2].data.img)), []); ok(new Set(im).size === 7, im.join()); ok(!im.some(x => old.indexOf(x) >= 0), '앞 학년 겹침'); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반 · 실천 차시(l12) = whole · 반응 중심(l02) = group', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); if (k === 'u1_l12') ok(a.type === 'whole', k + ' ' + a.type); if (k === 'u1_l02') ok(a.type === 'group', k + ' ' + a.type); }));

console.log('═══ D. 복습 계보 ═══');
T('u1_l01 복습 = 5학년 선수 학습 셋(인상적인 부분 · 이야기의 구성 요소 · 대사) · from 없음 · 제목 「5학년」', () => { const rv = L.u1_l01.slides[1].data; ok(rv.from === '', 'from ' + rv.from); ok(/5학년/.test(rv.title), rv.title);
  ok(JSON.stringify(rv.items.map(x => x.a)) === JSON.stringify(['인상적인 부분', '이야기의 구성 요소', '대사']), rv.items.map(x => x.a).join());
  const u1 = JSON.stringify(OLD[0]), u6 = JSON.stringify(OLD[5]); ok(/인상적인 부분/.test(u1) && /이야기의 구성 요소/.test(u6) && /인물이 직접 하는 말/.test(u6), '5-2 1·6단원에 실제로 배움'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l14 = 「이 단원을 마쳐요」 · 나머지 「다음 시간엔」 · l14 예고 = 1단원 마침 + 2단원', () => { KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); });
  const p = L.u1_l14.slides[18].data.preview; ok(/1단원을 마쳐요/.test(p) && /2단원/.test(p), p); });

console.log('═══ E. 기본 문제 정답 · 뜻·짝 다시 셈 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); ok(/모두 고르세요/.test(d.question), s.id + ' 모두 고르기 물음'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); ok(!/모두/.test(d.question), s.id + ' 하나인데 모두'); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 6', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 6, n); });
const bps = (k) => L[k].slides.filter(s => s.block === 'basic_problem').map(s => s.data);
const right = (d) => d.options.filter(o => o.correct).map(o => o.text);
const wrong = (d) => d.options.filter(o => !o.correct).map(o => o.text);
const exitA = (k, i) => L[k].slides[15].data.items[i].a;
const fig = (k, i) => L[k].slides[i].data.fig;
const tfig = (k, re) => L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title));
const tline = (k, re) => { const f = tfig(k, re); return f ? f.lines.map(l => nb(l.t || l)) : []; };
T('작가의 의도 뜻 다시 셈: l01 s06 글 · l02 방법 판 첫 줄 · l01 정리 = 지도서 뜻 · l01 출구 · l01 ② 정답 셋 = 뜻 세 갈래', () => {
  ok(nb(L.u1_l01.slides[5].data.content).indexOf(INTENT) >= 0, 'l01 s06'); const f = fig('u1_l02', 6); ok(f.k === 'note' && nb(f.items[0].t) === '작가의 의도: ' + INTENT, 'l02 판 ' + nb(f.items[0].t));
  ok(/작가가 글을 쓴 까닭/.test(nb(L.u1_l01.slides[16].data.points[0])), 'l01 정리'); ok(exitA('u1_l01', 0) === '작가의 의도', 'l01 출구');
  const r = right(bps('u1_l01')[1]); ok(r.length === 3 && /글을 쓴 까닭/.test(r[0]) && /느끼기를 바라/.test(r[1]) && /생각하기를 바라/.test(r[2]), 'l01 ②'); });
T('작가의 의도 짐작 방법 셋(반복·강조 표현 · 작가의 삶과 시대 상황 · 나의 삶) = l02 판 · l02 ② 정답 · l02·l14 출구 · l14 정리', () => { const t = fig('u1_l02', 6).items.slice(1).map(x => nb(x.t)).join(' | ');
  ok(/반복하거나 강조한 표현/.test(t) && /작가의 삶/.test(t) && /시대 상황/.test(t) && /나의 삶/.test(t), t); const r = right(bps('u1_l02')[1]); ok(/반복하거나 강조한 표현/.test(r[0]) && /작가의 삶/.test(r[1]) && /시대 상황/.test(r[2]), 'l02 ②');
  ok(exitA('u1_l02', 2) === '반복하거나 강조한 표현' && exitA('u1_l14', 2) === '반복하거나 강조한 표현', '출구'); const s = nb(L.u1_l14.slides[16].data.points[0]); ok(/반복·강조한 표현/.test(s) && /작가의 삶과 시대/.test(s) && /나의 삶/.test(s), 'l14 정리'); });
T('l02 시조 판 = 지도서 원문 그대로(하여가 셋 · 단심가 셋 · 지은이) · ③ 「어떠하리」 하여가에 두 번 이상 · ① 일편단심 · 기본 짝 · 출구 이방원', () => {
  const S = tline('u1_l02', /하여가/); ok(S.length === 8, S.length); ok(S[0] === '하여가 — 이방원' && S[4] === '단심가 — 정몽주', '지은이');
  ok(JSON.stringify(S.slice(1, 4)) === JSON.stringify(HAYEO) && JSON.stringify(S.slice(5, 8)) === JSON.stringify(DANSIM), '원문');
  ok(right(bps('u1_l02')[2])[0] === '어떠하리' && HAYEO.join(' ').split('어떠하').length - 1 >= 3, 'l02 ③'); wrong(bps('u1_l02')[2]).forEach(x => ok(DANSIM.join(' ').indexOf(x) >= 0, '③ 오답 = 단심가 ' + x));
  ok(/고려/.test(right(bps('u1_l02')[0])[0]) && /일편단심/.test(DANSIM[2]), 'l02 ①'); ok(L.u1_l02.slides[11].data.levels.기본.a === '하여가 — 이방원 / 단심가 — 정몽주' && exitA('u1_l02', 1) === '이방원', '기본·출구');
  const lk = fig('u1_l02', 5); ok(lk.k === 'link' && lk.rows.every(r => { const m = r[0].name.match(/^(.+) \((하여가|단심가)\)$/); return m && (m[2] === '하여가' ? HAYEO : DANSIM).join(' ').indexOf(m[1]) >= 0; }), '반복·강조 판 표현 = 원문'); });
T('l04 김소월 시 = 원문 넷 · 첫 줄 = 끝 줄 = 수준별 기본 = 출구 · 작가의 삶(1902~1934) · 시대(일제 강점기) = ③ 정답 · ② 보기 = 시와 맞음', () => {
  const S = tline('u1_l04', /엄마야 누나야/); ok(JSON.stringify(S) === JSON.stringify(MOM), S.join('/')); ok(S[0] === S[3], '되풀이');
  ok(L.u1_l04.slides[11].data.levels.기본.a === S[0] && exitA('u1_l04', 2) === S[0] && exitA('u1_l04', 0) === '김소월', '기본·출구');
  const tw = fig('u1_l04', 5); ok(tw.k === 'sort2' && /1902~1934/.test(tw.a.items.join()) && /일제 강점기/.test(tw.b.items.join()), '삶·시대 판'); ok(right(bps('u1_l04')[2])[0] === '일제 강점기' && exitA('u1_l04', 1) === '일제 강점기', '③');
  const b = bps('u1_l04')[1]; ok(/첫 줄을 끝 줄에서 되풀이/.test(b.options[0].text) && S.join(' ').indexOf('반짝이는 금모래 빛') >= 0 && S.join(' ').indexOf('노래') >= 0 && /떠나고 싶어/.test(wrong(b)[0]), '②');
  ok(/엄마와 누나/.test(right(bps('u1_l04')[0])[0]) && /엄마야 누나야/.test(S[0]), '①'); });
T('이야기 구조 뜻 넷 = l07 뜻 판 · l07 출구(발단·결말·이야기 구조) · l07 ① 절정 · l14 출구 절정', () => { const f = fig('u1_l07', 4), t = f.items.map(x => nb(x.t));
  Object.keys(DEF).forEach((n, i) => ok(t[i] === n + ': ' + DEF[n], n + ' ' + t[i])); ok(/이야기 구조/.test(t[4]), '이야기 구조 줄');
  ok(exitA('u1_l07', 0) === '발단' && exitA('u1_l07', 1) === '결말' && exitA('u1_l07', 2) === '이야기 구조' && exitA('u1_l14', 1) === '절정', '출구');
  const b = bps('u1_l07')[0]; ok(right(b)[0] === '절정' && b.question.indexOf(DEF.절정) >= 0, 'l07 ①'); });
/* 과거 표지 = 받침 ㅆ(-았-·-었-) 이나 「전」 */
/* 구조 판: bins 이름 넷 · hint 「a~b문단」이 제재 문단 범위 · 칸 문장의 열쇠 말이 그 문단에 있음 · 수준별 도전 답 = 네 칸 차례 그대로 */
const STRUCT = (k, figIdx, paras, keys) => { const f = fig(k, figIdx); ok(f.k === 'groups' && JSON.stringify(f.bins.map(b => b.name)) === JSON.stringify(['발단', '전개', '절정', '결말']), k + ' 판');
  let last = 0; f.bins.forEach((b, i) => { const m = b.hint.match(/^(\d+)(?:~(\d+))?문단$/); ok(m, k + ' hint ' + b.hint); const a = +m[1], z = +(m[2] || m[1]); ok(a === last + 1, k + ' 문단 이어짐 ' + b.hint); last = z;
    const seg = paras.slice(a - 1, z).join(' '); keys[i].forEach(w => ok(seg.indexOf(w) >= 0, k + ' ' + b.name + ' 열쇠 ' + w)); }); ok(last === paras.length, k + ' 문단 끝 ' + last);
  const a = L[k].slides[11].data.levels.도전.a; f.bins.forEach((b, i) => ok(a.indexOf(b.name + ' — ' + b.items[0].name) >= 0, k + ' 도전 ' + b.name)); };
T('l07 구조 판 = 「여우가 준 지름길 지도」 여섯 문단(발단 1~2 · 전개 3~4 · 절정 5 · 결말 6) · 수준별 기본 = 발단 칸 · ③ 정답 = 대가', () => {
  const W = tline('u1_l07', /지름길 지도/); ok(W.length === 6, W.length); STRUCT('u1_l07', 5, W, [['지름길 지도', '선물'], ['당근 다섯', '스무', '백'], ['청소', '아무 말도 못'], ['지도는 접자', '숲길을 다시 익히']]);
  ok(L.u1_l07.slides[11].data.levels.기본.a === fig('u1_l07', 5).bins[0].items[0].name + '.', '기본'); ok(/대가/.test(right(bps('u1_l07')[2])[0]), '③'); });
T('l09 구조 판 = 「할머니의 한글 공책」 여덟 문단(앞 넷 · 뒤 넷 · 발단 1~2 · 전개 3~4 · 절정 5~6 · 결말 7~8) · 출구 절정 = 편지 읽기', () => {
  const W = tline('u1_l09', /\(앞\)/).concat(tline('u1_l09', /\(뒤\)/)); ok(W.length === 8, W.length); STRUCT('u1_l09', 5, W, [['한글 교실', '웃'], ['꾹꾹', '숨겼'], ['돌아오지 않', '사랑하는 지우에게'], ['으뜸상', '편지를 쓸 것이다']]);
  ok(/편지를 읽/.test(exitA('u1_l09', 1)) && W.slice(4, 6).join(' ').indexOf('글을 읽고') >= 0, '출구'); ok(/동생들을 돌보느라/.test(W[1]) && right(bps('u1_l09')[0])[0] === '동생들을 돌보느라', '①'); });
T('l09 시간 표현 판(과거·현재·미래) 표현 = 제재 속 · ② 보기 = 제재 문장 그대로 · 정답 = 과거(「지금」 없음) · 기본 = 제재 마지막 문장 · 출구 「두 해 전」 = 과거', () => {
  const W = tline('u1_l09', /\(앞\)/).concat(tline('u1_l09', /\(뒤\)/)).join(' '), f = fig('u1_l09', 6); ok(f.k === 'groups' && JSON.stringify(f.bins.map(b => b.name)) === JSON.stringify(['과거', '현재', '미래']), '판');
  f.bins.forEach(b => b.items.forEach(x => ok(W.indexOf(x.name.replace(/ \([^)]*\)$/, '')) >= 0, b.name + ' ' + x.name)));
  bps('u1_l09')[1].options.forEach(o => { ok(W.indexOf(o.text) >= 0, '② 제재 ' + o.text); ok(!!o.correct === !/지금/.test(o.text), '② 정답 ' + o.text); ok(!o.correct || /전/.test(o.text) || [...o.text].some(c => { const x = c.charCodeAt(0) - 0xAC00; return x >= 0 && x < 11172 && x % 28 === 20; }), '② 과거 표지 ' + o.text); });
  const q = L.u1_l09.slides[11].data.levels.기본.q.match(/「([^」]+)」/)[1]; ok(W.indexOf(q) >= 0 && /내일/.test(q) && L.u1_l09.slides[11].data.levels.기본.a === '내일, 쓸 것이다', '기본'); ok(exitA('u1_l09', 0) === '과거' && /두 해 전/.test(W), '출구'); });
T('l12 광고지 = 김소월 「엄마야 누나야」 · 짐작한 의도 = 수준별 기본 · 인상 깊은 구절 = 시 속 · ① 정답 김소월 · 댓글 판 bad = ③ 오답', () => { const f = fig('u1_l12', 4); ok(f.k === 'news' && /엄마야 누나야/.test(f.title) && /김소월/.test(f.title), '광고지');
  const a = L.u1_l12.slides[11].data.levels.기본.a; ok(f.body.indexOf('짐작한 작가의 의도: ' + a) >= 0, '기본'); ok(MOM.join(' ').indexOf(f.items[0].match(/인상 깊은 구절: ([^—]+?) —/)[1]) >= 0, '구절'); ok(right(bps('u1_l12')[0])[0] === '김소월', '①');
  const p = fig('u1_l12', 6); ok(p.k === 'post' && p.comments.filter(c => c.bad).every(c => wrong(bps('u1_l12')[2]).indexOf(c.t) >= 0) && p.comments.some(c => c.ok && c.t === right(bps('u1_l12')[2])[0]), '댓글'); });
T('l14 동형어 판 넷 = 지도서 뜻 · ② 인정 정답·오답에 인정 ② · ③ 짝 정답 = 뜻 맞음 · 오답 = 다른 뜻 · 기본 = 돌 ①', () => { const f = fig('u1_l14', 6); ok(f.k === 'link' && f.ha === '낱말' && f.hb === '뜻' && f.rows.length === 4, '판'); f.rows.forEach(r => ok(DONG[r[0].name] === r[1].name, r[0].name));
  const b2 = bps('u1_l14')[1]; ok(right(b2)[0] === DONG['인정 ①'] && wrong(b2).indexOf(DONG['인정 ②']) >= 0, '②');
  const b3 = bps('u1_l14')[2]; b3.options.forEach(o => { const m = o.text.split(' — '); ok(m.length === 2 && DONGV.indexOf(m[1]) >= 0, '③ 뜻 ' + o.text); }); ok(/돌 ②|한 해가 되는 날/.test(b3.note) && /돌을 맞이한다/.test(wrong(b3)[0]) && wrong(b3)[0].indexOf(DONG['돌 ①']) >= 0, '③ 오답');
  ok(L.u1_l14.slides[11].data.levels.기본.a === DONG['돌 ①'], '기본'); ok(exitA('u1_l14', 0) === '동형어', '출구'); });
T('l14 「씨앗 하나」 ① 되풀이 = 「참고 또 참고」 · 의도 판 표현 = 시 속', () => { const S = tline('u1_l14', /씨앗 하나/).join(' '); ok(right(bps('u1_l14')[0])[0] === '참고 또 참고' && S.indexOf('참고 또 참고') >= 0, '①'); fig('u1_l14', 4).rows.forEach(r => ok(S.indexOf(r[0].name) >= 0, '판 ' + r[0].name)); });
T('수준별 세 계단 각 문항·답 · 심화 open · 기본 ≠ 출구 문항', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); ok(ex.indexOf(lv.기본.q) < 0, k + ' 기본=출구'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 560 (14차시 × 40) · 120분 둘 · 80분 셋 · 40분 둘', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 560, d); ok(d.filter(x => x === 120).length === 2 && d.filter(x => x === 80).length === 3 && d.filter(x => x === 40).length === 2, d); });

console.log('═══ G. 제재 ═══');
T('제재 판 여덟: 골목 가로등 4 · 시조 8 · 엄마야 누나야 4 · 지름길 지도 6 · 한글 공책 앞 4 · 뒤 4 · 씨앗 하나 5 · 시는 poem 꼴', () => {
  [['u1_l01', /골목 가로등/, 4, true], ['u1_l02', /하여가/, 8, true], ['u1_l04', /엄마야 누나야/, 4, true], ['u1_l07', /지름길 지도/, 6, false], ['u1_l09', /\(앞\)/, 4, false], ['u1_l09', /\(뒤\)/, 4, false], ['u1_l14', /씨앗 하나/, 5, true]].forEach(([k, re, n, po]) => { const f = tfig(k, re); ok(f, k + ' 판 없음 ' + re); ok(f.lines.length === n, k + ' 줄 ' + f.lines.length); ok(!!f.poem === po, k + ' poem'); });
  ok(!L.u1_l12.slides.some(s => s.data.fig && s.data.fig.k === 'text'), 'l12 글 판 없음'); });
T('저작권 있는 교과서 작품·지은이·인물 이름 0(별 하나 · 이준관 · 윤동주 · 원숭이 꽃신 · 정휘창 · 오소리 · 아빠의 희망 마라톤 · 양태석 · 필립 · 대추 한 알 · 장석주 · 감자꽃 · 권태응 · 서시 · 별 헤는 밤 · 장금이 · 뉴욕 마라톤)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const re = /별 하나|이준관|윤동주|원숭이 꽃신|정휘창|오소리|희망 마라톤|양태석|필립|대추|장석주|감자꽃|권태응|서시|별 헤는 밤|장금이|뉴욕 마라톤/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{8}(' + re.source + ').{8}')) || [''])[0]); }));
T('공유 저작물 출처 표기: l02 시조 지은이 · l04 시 제목 옆 김소월 · meta source', () => { ok(/이방원/.test(tline('u1_l02', /하여가/)[0]) && /정몽주/.test(tline('u1_l02', /하여가/)[4]), 'l02'); ok(/김소월/.test(tfig('u1_l04', /엄마야/).title), 'l04'); KEYS.forEach(k => ok(/공유 저작물/.test(L[k].meta.source), k)); });

console.log('═══ H. 선행·용어 ═══');
/* l01 s07(이 단원에서 배울 내용 안내) · 예고 장 · 「다음:」 줄은 뺀다 */
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).filter((s, i) => !(k === 'u1_l01' && i === 6)).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['작가의 의도', /작가의 의도/, 'u1_l01'], ['시조', /시조/, 'u1_l02'], ['반응 중심', /반응 (준비|형성|명료화|심화)하기/, 'u1_l02'], ['일제 강점기', /일제 강점기/, 'u1_l04'], ['발단', /발단/, 'u1_l07'], ['절정', /절정/, 'u1_l07'], ['이야기 구조', /이야기 구조/, 'u1_l07'], ['시간 표현', /시간 표현/, 'u1_l09'], ['광고지', /광고지/, 'u1_l12'], ['동형어', /동형어/, 'u1_l14']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (l01 단원 안내 장·예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('l02 반응 중심 네 단계 차례(준비 → 형성 → 명료화 → 심화) = 활동 단계 · l04 시어 속뜻 · l07 「빠짐없이」 ✗ · l09 주제 · l14 문맥', () => { const st = L.u1_l02.slides[12].data.steps; ['준비', '형성', '명료화', '심화'].forEach((n, i) => ok(st[i].indexOf('반응 ' + n + '하기') === 0, n));
  ok(/속뜻/.test(txt(L.u1_l04)), 'l04'); ok(/주제/.test(txt(L.u1_l09)), 'l09'); ok(/문맥/.test(txt(L.u1_l14)), 'l14'); });

console.log('═══ I. 오개념·심화 ═══');
[['u1_l01', /정답 하나/, /다를 수 있어요/], ['u1_l02', /작가의 삶만/, /나의 삶/], ['u1_l04', /뜻대로만/, /나의 경험과 느낌/], ['u1_l07', /빠짐없이/, /중요한 사건/], ['u1_l09', /똑같이/, /근거/], ['u1_l12', /줄거리를 처음부터 끝까지/, /인상 깊었던 까닭/], ['u1_l14', /뜻이 같다/, /문맥/]].forEach(([k, wr, r]) =>
  T(k.slice(3) + ' 오개념 ' + wr.source + ' ✗ · ' + r.source, () => { const m = L[k].slides[7].data; ok(wr.test(m.wrong) && r.test(nb(m.right)), k); }));
T('심화 장 「하나가 아님·다를 수」와 「근거」를 함께 둔 차시 = 7 전부(정답 강요 금지)', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /하나가 아니|하나가 아닐|다를 수/.test(d.note) && /근거/.test(d.note); }).length; ok(n === 7, n); });
T('정답 강요 경계 발문(한쪽만·정답·근거 없이·우기·못 박) = 7 차시 전부', () => KEYS.forEach(k => { const t = JSON.stringify(L[k].slides.map(s => s.data.tnote || null)); ok(/한쪽만|정답|근거 없이|우기|못 박/.test(t), k); }));
T('지도서 유의점: 맞고 틀림 아님(l04) · 누구 의견이 옳은지 평가 않기(l02) · 주제 허용(l09)', () => { ok(/맞고 틀림/.test(txt(L.u1_l04)), 'l04'); ok(L.u1_l02.extras.some(e => /평가하지 않/.test(e.content)), 'l02'); ok(L.u1_l09.extras.some(e => /허용적/.test(e.content)), 'l09'); });

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('그림 부품 렌더(ko-text · ko-moods · so-groups · ko-sort2 · ko-note · so-link · so-news · so-post)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
  ['ko-text', 'ko-moods', 'so-groups', 'ko-sort2', 'ko-note', 'so-link', 'so-news', 'so-post'].forEach(c => ok(all.indexOf(c) >= 0, c)); });
T('개념 장 그림 28장 전부 렌더 비지 않음', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id + ' ' + s.data.fig.k); n++; })); ok(n === 28, n); });

console.log('═══ K. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」 · 동기 「요?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log('═══ L. 차단 어휘 ═══');
T('「결」 글자 = 교과 용어 「결말」뿐 · 박음·빵꾸·갈아엎 0 · 겹낫표 0 · 비속 줄임말 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const z = s.replace(/결말/g, ''); ok(!/결|박음|빵꾸|갈아엎|『|』|ㅈㄴ|ㅅㅂ/.test(z), k + ' ' + (z.match(/.{10}(결|박음|빵꾸|갈아엎|『|ㅈㄴ).{10}/) || [''])[0]); }));
T('「결말」은 이야기 구조 차시(l07·l09·l14)에만', () => { const has = KEYS.filter(k => /결말/.test(JSON.stringify(L[k]))).join(); ok(has === 'u1_l07,u1_l09,u1_l14', has); });

console.log('═══ M. 6학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g6s2_korean_u1: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
