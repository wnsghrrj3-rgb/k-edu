/* gate_g5s2_korean_u3.js — 5학년 2학기 국어 3단원 「표준어와 방언을 알아봐요」 케이티처 2세대 게이트 (215차, 베프 — gate_g5s2_korean_u2 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 2단원 u2_l14 출구 · u2_l14 예고 = 이 단원 이름) · E 기본 문제 정답 + 방언↔표준어 다시 셈(사전 DICT·문장 SENT) · F 분 합계 480
   G 제재(자체 집필 시·글·이야기 · 교과서 원문 제재 이름 0 · 방언은 지도서 참고 자료에 실린 말만) · H 선행(국립국어원 l02 · 방언 지도 l10 · 동형어 l12)
   I 오개념·심화(정답 하나 아님 + 근거) · J 실렌더 · K 물음 끝 · L 차단 어휘(「결」 글자 0 · 겹낫표 0 · 방언 낮춤말 0) · M 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_korean_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_korean_u3.js'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l04', 'u3_l06', 'u3_l08', 'u3_l10', 'u3_l12'];
const COV = { u3_l01: [1, 1], u3_l02: [2, 3], u3_l04: [4, 5], u3_l06: [6, 7], u3_l08: [8, 9], u3_l10: [10, 11], u3_l12: [12, 12] };
const U1 = load(path.join(TDIR, 'data/g5s2_korean_u1.js')), U2 = load(path.join(TDIR, 'data/g5s2_korean_u2.js'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '표준어와 방언을 알아봐요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
/* 방언 → 표준어 사전: 지도서 3단원 참고 자료·예시 답안에 실린 것만 */
const DICT = { 감재: '감자', 옥시기: '옥수수', 까구리: '개구리', 깨고락지: '개구리', 먹장구: '개구리', 깨고리: '개구리', 정구지: '부추', 분추: '부추', 소풀: '부추', 세우리: '부추', 짐치: '김치', 짐끼: '김치', 지: '김치', 겡이: '고양이', 고냉이: '고양이', 궤이: '고양이', 낭구: '나무', 할망: '할머니', 가새기: '가위', 무시: '무', 찌짐: '부침개', 뻘: '갯벌', 올레: '집과 집 사이 좁은 길', 정낭: '대문 가로대', 삼춘: '마을 어른', 물허벅: '물동이', 아야: '얘야', 싸게싸게: '빨리빨리', 그러니께: '그러니까', 얼굴인디: '얼굴인데' };
const SENT = { '어서 오이소.': '어서 오세요.', '어서 오슈.': '어서 오세요.', '혼저 옵서예.': '어서 오세요.', '오빠, 일찍 왔네유.': '오빠, 일찍 왔네요.', '일찍 왔네유.': '일찍 왔네요.', '길 막혀서 힘들었슈?': '길 막혀서 힘들었어요?', '못 보던 얼굴인디, 누구 손주여?': '못 보던 얼굴인데, 누구 손주니?', '우리 딸네 아들이여. 서울서 왔당께.': '우리 딸네 아들이야. 서울에서 왔다니까.', '그러니께 얼굴이 하얗겄제.': '그러니까 얼굴이 하얗겠지.', '서울서 왔당께.': '서울에서 왔다니까.' };

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('7차시 키(2·3 → l02 · 4·5 → l04 · 6·7 → l06 · 8·9 → l08 · 10·11 → l10)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 국어 · unit 3 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6국04-02]·[6국05-06] · 목표 · 테마', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국0(4-02|5-06)\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); ok(m.theme === '우리말 지도 여행', k + ' theme'); }));
T('[6국04-02] 문법 = 전 차시 · [6국05-06] 문학 = l01·l08·l12', () => {
  ok(KEYS.every(k => L[k].meta.std.indexOf('[6국04-02]') >= 0), '04-02');
  ok(KEYS.filter(k => L[k].meta.std.indexOf('[6국05-06]') >= 0).join() === 'u3_l01,u3_l08,u3_l12', '05-06 ' + KEYS.filter(k => L[k].meta.std.indexOf('[6국05-06]') >= 0).join()); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length && ['pair', 'group', 'whole'].indexOf(s.data.type) >= 0), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 7종 서로 다름 · 1·2단원과도 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img), old = Object.keys(U1).map(k => U1[k].slides[2].data.img).concat(Object.keys(U2).map(k => U2[k].slides[2].data.img)); ok(new Set(im).size === 7, im.join()); ok(!im.some(x => old.indexOf(x) >= 0), '앞 단원 겹침'); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); }));

console.log('═══ D. 복습 계보 ═══');
T('u3_l01 복습 = 2단원 u2_l14 출구 그대로 · from g5s2_korean:u2_l14', () => { const rv = L.u3_l01.slides[1].data, ex = U2.u2_l14.slides[15].data.items; ok(rv.from === 'g5s2_korean:u2_l14', rv.from); ok(/지난 단원/.test(rv.title), rv.title);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '2단원 출구 어긋남'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l12 = 「이 단원을 마쳐요」 + 4단원 「의견을 조정해요」 예고 · 나머지 「다음 시간엔」', () => KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); if (i === KEYS.length - 1) ok(/의견을 조정해요/.test(d.preview), 'l12 예고'); }));
T('2단원 u2_l14 예고 = 이 단원 이름', () => ok(/표준어와 방언을 알아봐요/.test(U2.u2_l14.slides[18].data.preview), 'u2 예고'));

console.log('═══ E. 기본 문제 정답 · 방언↔표준어 다시 셈 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); ok(/모두 고르세요/.test(d.question), s.id + ' 모두 고르기 물음'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); ok(!/모두/.test(d.question), s.id + ' 하나인데 모두'); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 6', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 6, n); });
const figs = () => { const o = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) o.push([k, s.id, s.data.fig]); })); return o; };
T('방언 낱말 판(방언 | 표준어) 줄마다 = 사전 DICT', () => { let n = 0; figs().forEach(([k, id, f]) => { if (f.k === 'link' && f.ha === '방언' && f.hb === '표준어') f.rows.forEach(r => { const a = r[0].name, b = r[1].name; ok(DICT[a] === b, k + ' ' + id + ' ' + a + '→' + b + ' (사전 ' + DICT[a] + ')'); n++; }); }); ok(n >= 10, n); });
T('방언 문장 판(방언 문장 | 표준어 문장) 줄마다 = 문장 사전 SENT', () => { let n = 0; figs().forEach(([k, id, f]) => { if (f.k === 'link' && f.ha === '방언 문장') { ok(f.hb === '표준어 문장', k); f.rows.forEach(r => { ok(SENT[r[0].name] === r[1].name, k + ' ' + id + ' ' + r[0].name); n++; }); } }); ok(n >= 5, n); });
T('인사말 판: 지역 넷의 인사말 = 모두 「어서 오세요」 뜻(SENT) 또는 표준어', () => { const f = L.u3_l01.slides[3].data.fig; ok(f.k === 'link' && f.rows.length === 4, 'l01 판'); f.rows.forEach(r => ok(r[1].name === '어서 오세요.' || SENT[r[1].name] === '어서 오세요.', r[1].name)); });
T('「「X」를 표준어로」 기본 문제·수준별 기본 — 정답 = 사전(DICT·SENT) 다시 셈', () => { let n = 0;
  KEYS.forEach(k => L[k].slides.forEach(s => {
    const look = (q) => { if (!/표준어/.test(q)) return null; const m = q.match(/「([^」]+)」/g) || []; for (const x of m) { const w = x.slice(1, -1); if (DICT[w] || SENT[w]) return DICT[w] || SENT[w]; } return null; };
    if (s.block === 'basic_problem' && !s.data.multi) { const want = look(s.data.question) || look(s.data.question + s.data.scenario.body); if (want && /바꾸면|뜻이 같은|바르게 바꾼|정답을 표준어/.test(s.data.question)) { ok(s.data.options.find(o => o.correct).text === want, k + ' ' + s.id + ' 정답 ≠ ' + want); n++; } }
    if (s.block === 'leveled_problem') { const lv = s.data.levels.기본, want = look(lv.q); if (want && /표준어로 바꾸어 써|표준어로 써|표준어 뜻으로/.test(lv.q)) { ok(lv.a === want || lv.a === want.replace(/\.$/, '') + '.', k + ' 기본 ' + lv.a + ' ≠ ' + want); n++; } } }));
  ok(n >= 10, '다시 셈 ' + n); });
T('다섯 고개(겡이·고냉이) 정답 = 고양이 · 인사말 「어서 오이소.」 = 어서 오세요. · 동형어 「눈」 = 내리는 눈', () => {
  const b02 = L.u3_l02.slides.filter(s => s.block === 'basic_problem')[2].data; ok(/겡이/.test(b02.scenario.body) && b02.options.find(o => o.correct).text === DICT.겡이, 'l02 ③');
  const b01 = L.u3_l01.slides.filter(s => s.block === 'basic_problem')[0].data; ok(b01.options.find(o => o.correct).text === SENT['어서 오이소.'], 'l01 ①');
  const b12 = L.u3_l12.slides.filter(s => s.block === 'basic_problem')[2].data; ok(/쌓였다/.test(b12.options.find(o => o.correct).text) && /내린다/.test(b12.scenario.body), 'l12 ③'); });
T('수준별 세 계단 각 문항·답 · 심화 open · 기본 ≠ 출구 문항', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); ok(ex.indexOf(lv.기본.q) < 0, k + ' 기본=출구'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 480 (12차시 × 40) · 80분 다섯 · 40분 둘', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 480, d); ok(d.filter(x => x === 80).length === 5 && d.filter(x => x === 40).length === 2, d); });

console.log('═══ G. 제재 ═══');
const tfig = (k, re) => L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title));
const lines = (f) => f.lines.map(l => nb(l.t || l));
T('자체 집필 판 다섯: 시 「감재 한 바구니」(poem·방언 감재·옥시기) · 글 「말에도 고향이 있어요」(6줄·국립국어원 세 기준·멍게) · 「설날, 외할머니 댁에서」(충청 ~유·~슈 + 뉴스 표준어) · 「돌담 마을 체험 학습 보고서」(올레·정낭·삼춘·물허벅) · 「감 따는 날」(아야·싸게싸게·그러니께·~인디·~당께·~겄제)', () => {
  const p = tfig('u3_l01', /감재 한 바구니/); ok(p && p.poem && /감재/.test(lines(p).join()) && /옥시기/.test(lines(p).join()), 'l01 시');
  const e = tfig('u3_l02', /말에도 고향이 있어요/); const es = lines(e).join(' '); ok(e && e.lines.length === 6 && /국립국어원/.test(es) && /두루/.test(es) && /문법/.test(es) && /발음/.test(es) && /멍게/.test(es), 'l02 글');
  const s4 = tfig('u3_l04', /설날/); const s4s = lines(s4).join(' '); ok(s4 && /유\./.test(s4s) && /슈\?/.test(s4s) && /뉴스/.test(s4s) && /내리겠습니다/.test(s4s), 'l04 이야기');
  const s6 = tfig('u3_l06', /돌담 마을/); ok(s6 && ['올레', '정낭', '삼춘', '물허벅'].every(w => lines(s6).join().indexOf(w) >= 0), 'l06 보고서');
  const s8 = tfig('u3_l08', /감 따는 날/); const s8s = lines(s8).join(' '); ok(s8 && ['아야', '싸게싸게', '그러니께', '인디', '당께', '겄제'].every(w => s8s.indexOf(w) >= 0), 'l08 이야기'); });
T('교과서 원문 제재 이름 0(안동 고구마 · 박승우 · 세발자전거 · 멋져 부러 · 김남중 · 기림 · 마숩제 · 보낸 추석 · 제주도 여행 · 곶자왈 · 숨비소리 · 무레질 · 돔베고기 · 곰 세 마리 · 옥시기 축제)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const re = /안동 고구마|박승우|세발자전거|멋져 부러|김남중|기림|마숩제|보낸 추석|제주도 여행|곶자왈|숨비소리|무레질|돔베고기|곰 세 마리|옥시기 축제/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{8}(' + re.source + ').{8}')) || [''])[0]); }));
T('방언 판에 쓴 방언은 모두 지도서 사전에 있음(지어낸 방언 0) · 방언 문장은 자체 집필 판 속 대사와 같음', () => { const all = KEYS.map(k => txt(L[k])).join(''); figs().forEach(([k, id, f]) => { if (f.k === 'link' && f.ha === '방언 문장') f.rows.forEach(r => ok(all.indexOf(r[0].name) >= 0, r[0].name)); }); });

console.log('═══ H. 선행·용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['표준어', /표준어/, 'u3_l01'], ['방언', /방언/, 'u3_l01'], ['국립국어원', /국립국어원/, 'u3_l02'], ['지역어', /지역어/, 'u3_l02'], ['방언 지도', /방언 지도/, 'u3_l10'], ['상황극', /상황극/, 'u3_l10'], ['동형어', /동형어/, 'u3_l12']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('l04 「방언을 표준어로 바꾸기」 = 고치기가 아님을 밝힘 · 조사 관점 셋(누구에게·어떤 상황·어떤 사이)', () => { const s = txt(L.u3_l04); ok(/고치기 위해서가 아니라/.test(s), '고치기 아님'); ['누구에게', '어떤 상황에서', '어떤 사이'].forEach(x => ok(s.indexOf(x) >= 0, x)); });

console.log('═══ I. 오개념·심화 ═══');
T('l01 오개념 = 「방언은 틀린 말」 ✗ · 둘 다 소중', () => { const m = L.u3_l01.slides[7].data; ok(/틀린 말/.test(m.wrong) && /둘 다 소중/.test(m.right), 'l01'); });
T('l04 오개념 = 「방언은 고쳐야 할 말」 ✗ · 상황에 맞게', () => { const m = L.u3_l04.slides[7].data; ok(/고쳐야/.test(m.wrong) && /상황에 맞게/.test(m.right), 'l04'); });
T('l12 오개념 = 「더 좋은 말이 정해져 있다」 ✗ · 상황과 목적', () => { const m = L.u3_l12.slides[7].data; ok(/정해져 있다/.test(m.wrong) && /상황과 목적/.test(m.right), 'l12'); });
T('심화 장 「하나가 아님·다를 수」와 「까닭·근거」를 함께 둔 차시 = 7 전부(지도서 ❾ 정답 강요 금지)', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /하나가 아니|다를 수/.test(d.note) && /근거|까닭/.test(d.note); }).length; ok(n === 7, n); });
T('l12 심화: 표준어를 쓰는 지역은 표준어도 답(지도서)', () => ok(/표준어도 답이 될 수/.test(L.u3_l12.slides[14].data.note), 'l12'));
T('방언 흉내·웃음거리 경계 발문 = 활동이 있는 l01·l08·l10 · l06 활동', () => ['u3_l01', 'u3_l06', 'u3_l08', 'u3_l10'].forEach(k => { const t = JSON.stringify(L[k].slides.map(s => s.data.tnote || null)); ok(/흉내|낮추어|웃음거리/.test(t), k); }));

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('그림 부품 렌더(ko-text poem · ko-moods · so-link · ko-note · ko-sort2 · so-groups/bins · fig-chain · tools)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
  ['ko-text poem', 'ko-moods', 'so-link', 'ko-note', 'ko-sort2'].forEach(c => ok(all.indexOf(c) >= 0, c)); });
T('개념 장 그림 28장 전부 렌더 비지 않음', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id + ' ' + s.data.fig.k); n++; })); ok(n === 28, n); });

console.log('═══ K. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」 · 동기 「요?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log('═══ L. 차단 어휘 ═══');
T('「결」 글자 0 · 박음·빵꾸·갈아엎 0 · 겹낫표 0 · 비속 줄임말 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎|『|』|ㅈㄴ|ㅅㅂ/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎|『|ㅈㄴ).{10}/) || [''])[0]); }));
T('방언 낮춤말 0(촌스럽 · 우스꽝 · 사투리 · 이상한 말) — 오개념 장의 「틀린 말」 바로잡기만 허용', () => KEYS.forEach(k => { const s = JSON.stringify(L[k].slides.filter(x => x.block !== 'misconception').map(x => x.data)) + JSON.stringify(L[k].extras.filter(e => e.type !== 'misconception')); ok(!/촌스럽|우스꽝|사투리|이상한 말|틀린 말/.test(s), k + ' ' + (s.match(/.{10}(촌스럽|우스꽝|사투리|이상한 말|틀린 말).{10}/) || [''])[0]); }));

console.log('═══ M. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_korean_u3: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
