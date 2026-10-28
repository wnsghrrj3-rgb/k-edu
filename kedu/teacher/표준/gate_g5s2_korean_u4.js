/* gate_g5s2_korean_u4.js — 5학년 2학기 국어 4단원 「의견을 조정해요」 케이티처 2세대 게이트 (216차, 베프 — gate_g5s2_korean_u3 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 3단원 u3_l12 출구 · u3_l12 예고 = 이 단원 이름) · E 기본 문제 정답 + 절차·기준·순화어 다시 셈 · F 분 합계 520
   G 제재(자체 집필 토의 대화·만화·글 · 교과서 원문 제재 이름 0) · H 선행(합의점 l02 · 학급 토의 절차 l06 · 생각 도구 l11 · 순화어 l13)
   I 오개념·심화(정답 하나 아님 + 근거) · J 실렌더 · K 물음 끝 · L 차단 어휘(「결」 글자 0 · 겹낫표 0) · M 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_korean_u4.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_korean_u4.js'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l06', 'u4_l08', 'u4_l11', 'u4_l13'];
const COV = { u4_l01: [1, 1], u4_l02: [2, 3], u4_l04: [4, 5], u4_l06: [6, 7], u4_l08: [8, 10], u4_l11: [11, 12], u4_l13: [13, 13] };
const U1 = load(path.join(TDIR, 'data/g5s2_korean_u1.js')), U2 = load(path.join(TDIR, 'data/g5s2_korean_u2.js')), U3 = load(path.join(TDIR, 'data/g5s2_korean_u3.js'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '의견을 조정해요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
/* 외래어 → 순화어: 지도서 4단원 기초 다지기 예시 답안에 실린 것만 */
const PURE = { 언박싱: '개봉', '북 트레일러': '책 소개 영상', 큐레이터: '전시 기획자', '팩트 체크': '사실 확인', '여행 가이드': '여행 안내원' };
const STEPS = ['토의 주제 정하기', '의견 마련하기', '의견 나누기', '의견 모으기', '의견 정하기'];
const ADJ = ['의견을 검토할 기준 마련하기', '의견의 장점과 단점 검토하기', '합의점 찾기'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('7차시 키(2·3 → l02 · 4·5 → l04 · 6·7 → l06 · 8~10 → l08 · 11·12 → l11 · 13 → l13)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 국어 · unit 4 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6국01-06]·[6국01-03] · 목표 · 테마', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 4 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국01-0(6|3)\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); ok(m.theme === '우리 반 토의 마당', k + ' theme'); }));
T('[6국01-06] 전 차시 · [6국01-03] = l04·l06·l08·l11·l13', () => {
  ok(KEYS.every(k => L[k].meta.std.indexOf('[6국01-06]') >= 0), '01-06');
  const q = KEYS.filter(k => L[k].meta.std.indexOf('[6국01-03]') >= 0).join(); ok(q === 'u4_l04,u4_l06,u4_l08,u4_l11,u4_l13', '01-03 ' + q); });
T('l08 = 8~10차시 120분 · 토의·토론 학습 모형', () => { const m = L.u4_l08.meta; ok(m.covers === '8~10차시' && m.duration_min === 120 && /토의·토론 학습 모형/.test(m.lesson_format), m.covers); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length && ['pair', 'group', 'whole'].indexOf(s.data.type) >= 0), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 7종 서로 다름 · 1~3단원과도 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img), old = [U1, U2, U3].reduce((a, U) => a.concat(Object.keys(U).map(k => U[k].slides[2].data.img)), []); ok(new Set(im).size === 7, im.join()); ok(!im.some(x => old.indexOf(x) >= 0), '앞 단원 겹침'); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반 · 학급 토의 차시(l06·l08) = whole', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); if (k === 'u4_l06' || k === 'u4_l08') ok(a.type === 'whole', k + ' ' + a.type); }));

console.log('═══ D. 복습 계보 ═══');
T('u4_l01 복습 = 3단원 u3_l12 출구 그대로 · from g5s2_korean:u3_l12', () => { const rv = L.u4_l01.slides[1].data, ex = U3.u3_l12.slides[15].data.items; ok(rv.from === 'g5s2_korean:u3_l12', rv.from); ok(/지난 단원/.test(rv.title), rv.title);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '3단원 출구 어긋남'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l13 = 「이 단원을 마쳐요」 · 나머지 「다음 시간엔」', () => KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); }));
T('3단원 u3_l12 예고 = 이 단원 이름', () => ok(/의견을 조정해요/.test(U3.u3_l12.slides[18].data.preview), 'u3 예고'));

console.log('═══ E. 기본 문제 정답 · 절차·기준·순화어 다시 셈 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); ok(/모두 고르세요/.test(d.question), s.id + ' 모두 고르기 물음'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); ok(!/모두/.test(d.question), s.id + ' 하나인데 모두'); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 6', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 6, n); });
const figs = () => { const o = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) o.push([k, s.id, s.data.fig]); })); return o; };
const chainNames = (f) => f.items.map(x => x.name.replace(/^[①-⑨]\s*/, ''));
T('학급 토의 절차 판(l06 · l13) = 다섯 절차 차례 그대로 · l11 = 다섯 + 되돌아보기', () => {
  ['u4_l06', 'u4_l13'].forEach(k => { const f = L[k].slides.filter(s => s.block === 'concept').map(s => s.data.fig).find(f => f.k === 'chain' && f.items.length === 5); ok(f && JSON.stringify(chainNames(f)) === JSON.stringify(STEPS), k + ' ' + (f && chainNames(f))); });
  const f11 = L.u4_l11.slides[4].data.fig; ok(JSON.stringify(chainNames(f11)) === JSON.stringify(STEPS.concat('되돌아보기')), 'l11 ' + chainNames(f11)); });
T('조정 차례(l02 판·출구·l13 출구): 기준 마련 → 장단점 검토 → 합의점 찾기', () => {
  const f = L.u4_l02.slides[6].data.fig; ok(f.k === 'chain' && /기준/.test(f.items[0].name) && /장단점/.test(f.items[1].name) && /합의점/.test(f.items[2].name), 'l02 판');
  const e = L.u4_l02.slides[15].data.items.map(x => x.a); ok(e[0] === ADJ[0] && e[1] === '장점과 단점 검토하기' && e[2] === '합의점', 'l02 출구 ' + e);
  ok(L.u4_l13.slides[15].data.items[0].a === ADJ[2], 'l13 출구');
  const b13 = L.u4_l13.slides.filter(s => s.block === 'basic_problem')[1].data; ok(JSON.stringify(b13.options.filter(o => o.correct).map(o => o.text)) === JSON.stringify(ADJ), 'l13 ② 의견 모으기 안 셋'); });
T('「의견 모으기」 정답 다시 셈: l06 ② · l06 출구 · 수준별 기본(l06·l11) 절차 줄', () => {
  const b = L.u4_l06.slides.filter(s => s.block === 'basic_problem')[1].data; ok(b.options.find(o => o.correct).text === STEPS[3], 'l06 ②');
  const e = L.u4_l06.slides[15].data.items.map(x => x.a); ok(e[0] === STEPS[0] && e[1] === STEPS[3] && e[2] === STEPS[4], 'l06 출구 ' + e);
  ok(L.u4_l06.slides[11].data.levels.기본.a === STEPS.join(' → '), 'l06 기본'); ok(L.u4_l11.slides[11].data.levels.기본.a === STEPS.concat('되돌아보기').join(' → '), 'l11 기본'); });
T('검토 기준 셋(실천 · 효과 · 여러 사람에게 도움)이 l01 판·l02 판에 그대로 · l08 = 비용 더함', () => {
  const g = JSON.stringify(L.u4_l01.slides[4].data.fig), n = JSON.stringify(L.u4_l02.slides[4].data.fig);
  [/실천/, /효과/, /여러 사람에게 도움|여러 학년에 도움/].forEach(re => { ok(re.test(g), 'l01 ' + re); ok(re.test(n), 'l02 ' + re); });
  ok(/비용/.test(JSON.stringify(L.u4_l08.slides[6].data)), 'l08 비용'); ok(L.u4_l08.slides[15].data.items[2].a === '비용', 'l08 출구 비용'); });
T('장단점 판(sort2 장점|단점): 의견마다 장점 한 줄·단점 한 줄 짝(같은 의견 이름 같은 차례) · 판 다섯(l02·l04·l06·l08·l13)', () => { let n = 0; figs().forEach(([k, id, f]) => { if (f.k === 'sort2' && f.a.name === '장점' && f.b.name === '단점') { const ha = f.a.items.map(t => nb(t).split(' — ')[0]), hb = f.b.items.map(t => nb(t).split(' — ')[0]); ok(JSON.stringify(ha) === JSON.stringify(hb), k + ' ' + id + ' ' + ha + ' / ' + hb); n++; } }); ok(n === 5, n); });
T('순화어 판(외래어 | 순화어) 줄마다 = 사전 PURE · 기본 ③ · 수준별 기본 · 출구 다시 셈', () => { let n = 0; figs().forEach(([k, id, f]) => { if (f.k === 'link' && f.ha === '외래어') { ok(f.hb === '순화어', k); f.rows.forEach(r => { ok(PURE[r[0].name] === r[1].name, k + ' ' + id + ' ' + r[0].name); n++; }); } }); ok(n === 5, n);
  const b = L.u4_l13.slides.filter(s => s.block === 'basic_problem')[2].data, w = b.question.match(/「([^」]+)」/)[1]; ok(b.options.find(o => o.correct).text === PURE[w], 'l13 ③ ' + w);
  const lv = L.u4_l13.slides[11].data.levels.기본, w2 = lv.q.match(/「([^」]+)」/)[1]; ok(lv.a === PURE[w2], 'l13 기본 ' + w2);
  const ex = L.u4_l13.slides[15].data.items[2], w3 = ex.q.match(/「([^」]+)」/)[1]; ok(ex.a === PURE[w3], 'l13 출구 ' + w3); });
T('수준별 세 계단 각 문항·답 · 심화 open · 기본 ≠ 출구 문항', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); ok(ex.indexOf(lv.기본.q) < 0, k + ' 기본=출구'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 520 (13차시 × 40) · 80분 넷 · 120분 하나 · 40분 둘', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 520, d); ok(d.filter(x => x === 80).length === 4 && d.filter(x => x === 120).length === 1 && d.filter(x => x === 40).length === 2, d); });

console.log('═══ G. 제재 ═══');
const tfig = (k, re) => L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title));
const lines = (f) => f.lines.map(l => nb(l.t || l));
T('자체 집필 판 셋: 토의 「복도를 안전하게」(사회자 + 셋 · 지킴이·포스터·교실) · 글 「소중한 것이 서로 다를 때」(6줄 · 산책길·놀이터 · 양보) · 토의 「블록 놀이 자리」(사회자 + 셋 · 네 명·요일·규칙)', () => {
  const h = tfig('u4_l02', /복도/); const hs = lines(h); ok(h && hs.length === 4 && /^사회자:/.test(hs[0]) && /지킴이/.test(hs[1]) && /포스터/.test(hs[2]) && /교실에만/.test(hs[3]), 'l02 토의');
  const v = tfig('u4_l08', /소중한 것이 서로 다를 때/); const vs = lines(v).join(' '); ok(v && v.lines.length === 6 && /산책길/.test(vs) && /놀이터/.test(vs) && /양보/.test(vs), 'l08 글');
  const b = tfig('u4_l13', /블록/); const bs = lines(b); ok(b && bs.length === 4 && /^사회자:/.test(bs[0]) && /네 명/.test(bs[1]) && /요일/.test(bs[2]) && /규칙/.test(bs[3]), 'l13 토의'); });
T('만화 「우리 반 아침 15분」(l06 · 사회자 안내) · 모둠 질문 장면(l04 · 질문하며 듣기)', () => {
  const m6 = L.u4_l06.slides[3].data.fig; ok(m6.k === 'mood' && m6.items[0].name === '사회자' && /아침 15분/.test(JSON.stringify(m6)), 'l06 만화');
  const m4 = L.u4_l04.slides[5].data.fig; ok(m4.k === 'mood' && m4.items.some(x => /\?/.test(x.say) && /궁금/.test(x.feel)), 'l04 질문'); });
T('교과서 원문 제재 이름 0(민찬 · 수영 · 혜진 · 언어폭력 · 누리 소통망 사용을 · 봉사 활동 · 보드게임 · 서로 다른 가치를 존중하며 살아가기 · 잔반 · 학급 도서 · 민수 · 예진 · 개인 방송 촬영 금지 구역)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const re = /민찬|수영|혜진|언어폭력|누리 소통망 사용을|봉사 활동|보드게임|서로 다른 가치를 존중하며 살아가기|잔반|학급 도서|민수|예진|촬영 금지 구역/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{8}(' + re.source + ').{8}')) || [''])[0]); }));

console.log('═══ H. 선행·용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['토의', /토의/, 'u4_l01'], ['의견 조정', /조정/, 'u4_l01'], ['합의점', /합의점/, 'u4_l02'], ['학급 토의 절차', /의견 모으기/, 'u4_l06'], ['서로 다른 가치', /서로 다른 가치/, 'u4_l08'], ['생각 도구(합치기)', /합치기/, 'u4_l11'], ['순화어', /순화어/, 'u4_l13']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('l06 회의와 토의 견줌 · 정당한 절차면 받아들임 · 다시 토의 가능(l06·l11)', () => { const s = txt(L.u4_l06); ok(/회의/.test(s) && /정당한 절차/.test(s), 'l06'); ok(/다시 토의/.test(s) && /다시 토의/.test(txt(L.u4_l11)), '다시 토의'); });
T('l02 조정 차례는 앞으로 되돌아갈 수 있음 · 단점 말하기 = 비난 아님', () => { const s = txt(L.u4_l02); ok(/되돌아가/.test(s), '되돌아감'); ok(/비난하는 것이 아니라/.test(s), '비난 아님'); });

console.log('═══ I. 오개념·심화 ═══');
T('l01 오개념 = 「목소리 큰 사람 의견대로」 ✗ · 기준에 비추어', () => { const m = L.u4_l01.slides[7].data; ok(/목소리가 큰/.test(m.wrong) && /기준에 비추어/.test(m.right), 'l01'); });
T('l02 오개념 = 「조정하면 내 의견을 버려야」 ✗ · 장점은 살리고', () => { const m = L.u4_l02.slides[7].data; ok(/버려야/.test(m.wrong) && /장점은 살리고/.test(m.right), 'l02'); });
T('l08 오개념 = 「더 옳은 쪽 하나를 골라야」 ✗ · 둘 다 소중 · 양보', () => { const m = L.u4_l08.slides[7].data; ok(/옳은 쪽 하나/.test(m.wrong) && /둘 다 소중/.test(m.right) && /양보/.test(m.right), 'l08'); });
T('l13 오개념 = 「좋은 의견은 처음부터 정해져 있다」 ✗ · 발전된 의견', () => { const m = L.u4_l13.slides[7].data; ok(/정해져 있어서/.test(m.wrong) && /발전된 의견/.test(m.right), 'l13'); });
T('심화 장 「하나가 아님·다를 수」와 「까닭·근거」를 함께 둔 차시 = 7 전부(정답 강요 금지)', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /하나가 아니|다를 수/.test(d.note) && /근거|까닭/.test(d.note); }).length; ok(n === 7, n); });
T('탓하기·비난 경계 발문 = 경험 나누기·되돌아보기·단점 말하기 차시(l01·l02·l04·l08·l11)', () => ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l08', 'u4_l11'].forEach(k => { const t = JSON.stringify(L[k].slides.map(s => s.data.tnote || null)); ok(/탓|비난|깎아|감정이 상/.test(t), k); }));

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('그림 부품 렌더(ko-text · ko-moods · so-groups · ko-sort2 · ko-note · so-link · fig-chain)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
  ['ko-text', 'ko-moods', 'so-groups', 'ko-sort2', 'ko-note', 'so-link'].forEach(c => ok(all.indexOf(c) >= 0, c)); });
T('개념 장 그림 28장 전부 렌더 비지 않음', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id + ' ' + s.data.fig.k); n++; })); ok(n === 28, n); });

console.log('═══ K. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」 · 동기 「요?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log('═══ L. 차단 어휘 ═══');
T('「결」 글자 0 · 박음·빵꾸·갈아엎 0 · 겹낫표 0 · 비속 줄임말 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎|『|』|ㅈㄴ|ㅅㅂ/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎|『|ㅈㄴ).{10}/) || [''])[0]); }));

console.log('═══ M. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_korean_u4: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
