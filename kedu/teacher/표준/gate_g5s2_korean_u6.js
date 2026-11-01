/* gate_g5s2_korean_u6.js — 5학년 2학기 국어 6단원 「작품을 감상해요」 케이티처 2세대 게이트 (223차, 베프 — gate_g5s2_korean_u5 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 5단원 u5_l14 출구 · u5_l14 예고 = 이 단원 이름 · l15 예고 = 6학년 1학기)
   E 기본 문제 정답 + 이야기·극본 구성 요소 정의 · 인물 말·행동 = 제재 속 문장 · 극본 세 요소(해설 = 첫 두 줄 · 대사 = 이름 뒤 괄호 밖 · 지문 = 괄호) · 낱말 사전 뜻 · 사건 차례 = 극본 줄 차례 · 높임 표현 사전 다시 셈
   F 분 합계 600 · G 제재(자체 집필 판 일곱 · 교과서 작품·인물 이름 0) · H 선행(시대적 배경 l02 · 해설·대사·지문 l07 · 역할 수행·관계도 l09 · 감상 질문 l13 · 높임 l15)
   I 오개념·심화(하나가 아님·다를 수 + 근거) · J 실렌더 · K 물음 끝 · L 차단 어휘(「결」 글자 0 · 겹낫표 0) · M 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_korean_u6.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_korean_u6.js'));
const KEYS = ['u6_l01', 'u6_l02', 'u6_l04', 'u6_l07', 'u6_l09', 'u6_l11', 'u6_l13', 'u6_l15'];
const COV = { u6_l01: [1, 1], u6_l02: [2, 3], u6_l04: [4, 6], u6_l07: [7, 8], u6_l09: [9, 10], u6_l11: [11, 12], u6_l13: [13, 14], u6_l15: [15, 15] };
const PREVU = [1, 2, 3, 4, 5].map(u => load(path.join(TDIR, 'data/g5s2_korean_u' + u + '.js')));
const U5 = PREVU[4];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '작품을 감상해요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
/* 이야기·극본 구성 요소 뜻 — 지도서 6단원 그대로 */
const DEF = { 인물: '이야기에서 어떤 일을 겪는 사람이나 사물', 사건: '이야기에서 일어나는 일', 배경: '이야기가 펼쳐지는 시간과 장소, 사회적 상황', 해설: '대체로 극본의 첫 부분에서 때, 곳, 등장인물, 무대 배경 같은 것을 설명하는 부분', 대사: '극본에서 인물이 직접 하는 말', 지문: '극본에서 인물의 표정, 행동, 말투 같은 것을 설명하려고 괄호로 표현한 부분' };
/* 낱말 사전 뜻 — 표준국어대사전(들뜨다 ③ · 묵묵히 · 야속하다 · 잦아들다 ②), 제재 속 굵은 글씨 꼴 */
const DICT = { 들뜨다: '마음이 가라앉지 아니하고 조금 흥분되다', 묵묵히: '말없이 잠잠하게', 야속하다: '무정한 행동이 섭섭하게 여겨져 언짢다', 잦아들다: '거센 기운이 차차 가라앉아 가다' };
const DFORM = { 들뜨다: '들뜬', 묵묵히: '묵묵히', 야속하다: '야속해서', 잦아들다: '잦아들었어요' };
/* 높임 표현 — 지도서 6단원 기초 다지기(계시다 = 주어 직접 높임 · 있으시다 = 주어와 밀접한 대상 · 편찮으시다 = 높임 어휘) */
const HN = { '할머니께서 아프십니다.': '할머니께서 편찮으십니다.', '할아버지께서는 고민이 계십니다.': '할아버지께서는 고민이 있으십니다.', '교장 선생님께서 교장실에 있으십니다.': '교장 선생님께서 교장실에 계십니다.', '교장 선생님의 말씀이 계시겠습니다.': '교장 선생님의 말씀이 있으시겠습니다.' };
const HNV = Object.values(HN), HNK = Object.keys(HN);

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('8차시 키(2·3 → l02 · 4~6 → l04 · 7·8 → l07 · 9·10 → l09 · 11·12 → l11 · 13·14 → l13 · 15 → l15)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 국어 · unit 6 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 · 목표 · 테마', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 6 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국0(5-03|5-04|2-05)\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); ok(m.theme === '우리 반 작은 극장', k + ' theme'); }));
T('[6국05-03] 전 차시 · [6국05-04] = l04·l09·l11·l13(인상적인 부분) · [6국02-05] = l01·l13', () => {
  ok(KEYS.every(k => L[k].meta.std.indexOf('[6국05-03]') >= 0), '05-03');
  const q = KEYS.filter(k => L[k].meta.std.indexOf('[6국05-04]') >= 0).join(); ok(q === 'u6_l04,u6_l09,u6_l11,u6_l13', '05-04 ' + q);
  ['u6_l04', 'u6_l09', 'u6_l11', 'u6_l13'].forEach(k => ok(/인상|감상/.test(txt(L[k])), k + ' 인상적인 부분'));
  const r = KEYS.filter(k => L[k].meta.std.indexOf('[6국02-05]') >= 0).join(); ok(r === 'u6_l01,u6_l13', '02-05 ' + r); });
T('l04 = 4~6차시 120분 · l09 = 9·10차시 80분 · 역할 수행 학습 모형', () => { ok(L.u6_l04.meta.covers === '4~6차시' && L.u6_l04.meta.duration_min === 120, 'l04'); const m = L.u6_l09.meta; ok(m.covers === '9·10차시' && m.duration_min === 80 && /역할 수행 학습 모형/.test(m.lesson_format), m.covers); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length && ['pair', 'group', 'whole'].indexOf(s.data.type) >= 0), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 8종 서로 다름 · 1~5단원과도 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img), old = PREVU.reduce((a, U) => a.concat(Object.keys(U).map(k => U[k].slides[2].data.img)), []); ok(new Set(im).size === 8, im.join()); ok(!im.some(x => old.indexOf(x) >= 0), '앞 단원 겹침'); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반 · 실천 차시(l13) = whole · 연극 차시(l11) = group', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); if (k === 'u6_l13') ok(a.type === 'whole', k + ' ' + a.type); if (k === 'u6_l11') ok(a.type === 'group', k + ' ' + a.type); }));

console.log('═══ D. 복습 계보 ═══');
T('u6_l01 복습 = 5단원 u5_l14 출구 그대로 · from g5s2_korean:u5_l14', () => { const rv = L.u6_l01.slides[1].data, ex = U5.u5_l14.slides[15].data.items; ok(rv.from === 'g5s2_korean:u5_l14', rv.from); ok(/지난 단원/.test(rv.title), rv.title);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '5단원 출구 어긋남'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l15 = 「이 단원을 마쳐요」 · 나머지 「다음 시간엔」', () => KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); }));
T('5단원 u5_l14 예고 = 이 단원 이름 · l15 예고 = 5-2 국어 마침 + 6학년 1학기 1단원', () => { ok(/6단원 「작품을 감상해요」/.test(U5.u5_l14.slides[18].data.preview), 'u5 예고'); const p = L.u6_l15.slides[18].data.preview; ok(/5학년 2학기 국어를 마쳐요/.test(p) && /6학년 1학기 1단원/.test(p), 'l15 예고 ' + p); });

console.log('═══ E. 기본 문제 정답 · 정의·짝 다시 셈 ═══');
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
const tline = (k, re) => { const f = L[k].slides.map(s => s.data.fig).filter(f => f && f.k === 'text' && re.test(f.title)); return f.map(x => x.lines.map(l => nb(l.t || l)).join(' ')).join(' '); };
T('이야기의 구성 요소 뜻 다시 셈: l02·l15 뜻 판 = 지도서 그대로 · l02 출구 · l15 출구·① · l02 ② 정답 셋', () => {
  ['u6_l02', 'u6_l15'].forEach(k => { const f = L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'note' && /이야기의 구성 요소/.test(f.title)); ok(f, k + ' 판'); const t = f.items.map(x => nb(x.t)).join(' | ');
    ['인물', '사건'].forEach(n => ok(t.indexOf(n + ': ' + DEF[n]) >= 0, k + ' ' + n)); ok(t.indexOf('배경: ' + DEF.배경) >= 0, k + ' 배경'); });
  ok(exitA('u6_l02', 0) === '인물' && exitA('u6_l02', 1) === '배경' && exitA('u6_l02', 2) === '이야기의 구성 요소', 'l02 출구');
  ok(exitA('u6_l15', 0) === '인물' && right(bps('u6_l15')[0])[0] === '배경', 'l15');
  ok(JSON.stringify(right(bps('u6_l02')[1])) === JSON.stringify(['인물', '사건', '배경']), 'l02 ②'); });
T('극본의 구성 요소 뜻 다시 셈: l07 뜻 판(극본 = 연극을 하려고 쓴 글 + 해설·대사·지문) · l07 출구 셋 · l07 ② 정답 셋 · l15 ② 정답 = 뜻과 맞음 · l15 출구 해설', () => {
  const f = L.u6_l07.slides[5].data.fig, t = f.items.map(x => nb(x.t)).join(' | '); ok(/연극을 하려고 쓴 글/.test(t), '극본');
  ['해설', '대사', '지문'].forEach(n => ok(t.indexOf(n + ': ' + DEF[n]) >= 0, 'l07 ' + n));
  ok(exitA('u6_l07', 0) === '극본' && exitA('u6_l07', 1) === '대사' && exitA('u6_l07', 2) === '지문' && exitA('u6_l15', 2) === '해설', '출구');
  ok(JSON.stringify(right(bps('u6_l07')[1])) === JSON.stringify(['해설', '대사', '지문']), 'l07 ②');
  const r = right(bps('u6_l15')[1]); ok(r.length === 3 && wrong(bps('u6_l15')[1]).every(x => /해설/.test(x) && /감정/.test(x)), 'l15 ② 오답 = 해설로 감정');
  ok(/인물이 직접 하는 말/.test(r[1]) && /괄호/.test(r[2]), 'l15 ② 정답'); });
T('l02 인물 판: 선생님·순덕·나 · 말·행동 = 제재 속 문장 그대로 · 순덕 성격 = 수준별 도전 답', () => {
  const f = fig('u6_l02', 4), W = tline('u6_l02', /반쪽 연필/); ok(f.k === 'mood' && JSON.stringify(f.items.map(x => x.name)) === JSON.stringify(['선생님', '순덕', '나']), '인물');
  f.items.forEach(x => ok(W.indexOf(nb(x.say)) >= 0, x.name + ' 행동 어긋남 ' + x.say)); ok(/나눌 줄 아는/.test(L.u6_l02.slides[11].data.levels.도전.a) && /나눌 줄/.test(f.items[1].feel), '순덕 성격'); });
T('l02 배경 판: 시대적 배경(1951년·6·25 전쟁) | 공간적 배경(부산·천막 교실) — 제재에 있음 · ③ 정답 = 공간적 배경 · 오답에 시대 둘', () => {
  const f = fig('u6_l02', 5), W = tline('u6_l02', /반쪽 연필/); ok(f.k === 'sort2' && f.a.name === '시대적 배경' && f.b.name === '공간적 배경', '머리');
  ok(/1951년/.test(f.a.items.join()) && /6·25 전쟁/.test(f.a.items.join()) && /부산/.test(f.b.items.join()) && /천막 교실/.test(f.b.items.join()), '판'); ok(/1951년/.test(W) && /부산/.test(W) && /천막 교실/.test(W), '제재');
  ok(/부산/.test(right(bps('u6_l02')[2])[0]) && wrong(bps('u6_l02')[2]).some(x => /1951/.test(x)), 'l02 ③'); });
T('l04 낱말 판(낱말 | 사전에서의 뜻) 넷 = 사전 DICT · 낱말이 제재 굵은 글씨 · l04 ③ · 수준별 기본 다시 셈', () => {
  const f = fig('u6_l04', 6), W = (fig('u6_l04', 3).lines.concat(fig('u6_l04', 4).lines)).join(' '); ok(f.k === 'link' && f.ha === '낱말' && f.hb === '사전에서의 뜻' && f.rows.length === 4, '판');
  f.rows.forEach(r => { ok(DICT[r[0].name] === r[1].name, r[0].name + ' 뜻'); ok(W.indexOf('**' + DFORM[r[0].name] + '**') >= 0, r[0].name + ' 굵은 글씨'); });
  const b = bps('u6_l04')[2]; ok(right(b)[0] === DICT['묵묵히'] && /묵묵히/.test(b.question), 'l04 ③'); const lv = L.u6_l04.slides[11].data.levels.기본; ok(/잦아들다/.test(lv.q) && lv.a === DICT['잦아들다'], 'l04 기본'); });
T('l04 마음 흐름 넷(들뜸 → 야속·서운 → 놀람·미안 → 고마움) = 수준별 도전 답 차례 · 「야속」 = 출구', () => {
  const f = fig('u6_l04', 5); ok(f.k === 'mood' && f.flow && f.flow.length === 4, '흐름'); const want = [/들뜬/, /야속/, /미안/, /고맙/]; f.flow.forEach((x, i) => ok(want[i].test(x.note), i + ' ' + x.note));
  const a = L.u6_l04.slides[11].data.levels.도전.a; let at = -1; ['들떴', '야속', '미안', '고마'].forEach(x => { const j = a.indexOf(x); ok(j > at, '도전 차례 ' + x); at = j; });
  ok(/태풍/.test(exitA('u6_l04', 1)) && /태풍/.test(tline('u6_l04', /앞/)), '출구 야속 까닭'); });
T('l04 ② 아버지 행동 = 제재 속 문장(행동 열쇠 말 셋) · 오답 = 도윤이 행동', () => { const W = tline('u6_l04', /바람이 잦아든 새벽/), b = bps('u6_l04')[1], KP = ['흠뻑 젖은 채 나룻배 밧줄을 다시 묶', '말없이 노를 잡', '배가 떠내려가면 우리 섬은 육지로 갈 길이 없어진단다'];
  KP.forEach(p => ok(W.indexOf(p) >= 0 && /아버지/.test(W.slice(Math.max(0, W.indexOf(p) - 40), W.indexOf(p) + 60)), '제재 ' + p)); const r = right(b); ok(r.length === 3 && r.every((t, i) => t.indexOf(KP[i]) >= 0), '정답 ' + r); ok(/방문을 쾅 닫/.test(wrong(b)[0]) && /도윤이는 방문을 쾅 닫/.test(W), '오답'); });
const SCR = (k, re) => { const f = L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title)); return f.lines.map(l => nb(l.t || l)); };
T('l07 극본 세 요소 판: 해설 보기 = 극본 첫 두 줄 · 대사 보기 = 이름 뒤 괄호 밖 · 지문 보기 = 괄호째 극본 속', () => {
  const S = SCR('u6_l07', /우체국/), f = fig('u6_l07', 4); ok(f.k === 'groups' && JSON.stringify(f.bins.map(b => b.name)) === JSON.stringify(['해설', '대사', '지문']), '판');
  ok(/^때:/.test(S[0]) && /나오는 인물/.test(S[0]) && !/^[가-힣 ]+: \(/.test(S[1]), '해설 두 줄');
  const say = S.slice(2).filter(l => /^[가-힣 ]+: /.test(l)).map(l => l.replace(/^[가-힣 ]+: /, '').replace(/\([^)]*\)\s*/g, ''));
  f.bins[0].items.forEach(x => ok(S.slice(0, 2).join(' ').indexOf(x.name.replace(/고$/, '')) >= 0, '해설 ' + x.name));
  f.bins[1].items.forEach(x => ok(say.some(s => s.indexOf(x.name) >= 0), '대사 ' + x.name));
  f.bins[2].items.forEach(x => { ok(/^\(.*\)$/.test(x.name), '지문 괄호 ' + x.name); ok(S.join(' ').indexOf(x.name) >= 0, '지문 극본 ' + x.name); });
  const b3 = bps('u6_l07')[2], m = b3.question.match(/「(\([^)]+\))[^」]*」/); ok(m && S.join(' ').indexOf(m[1]) >= 0 && right(b3)[0] === '지문', 'l07 ③'); });
T('l07 해설 = 수준별 기본 답(때·곳) · 도전 지문 「울먹이며」 = 극본 · 오개념 지문 예 = 극본', () => { const S = SCR('u6_l07', /우체국/); const a = L.u6_l07.slides[11].data.levels.기본.a;
  ok(S[0].indexOf(a.match(/때: ([^/]+?) \//)[1]) >= 0 && S[0].indexOf(a.match(/곳: (.+)$/)[1]) >= 0, '기본 ' + a); ok(/\(울먹이며\) 내일이 할아버지 생신인데/.test(S.join(' ')), '도전'); ok(/\(울먹이며\) 내일이 할아버지 생신인데/.test(L.u6_l07.slides[7].data.right), '오개념'); });
T('두 칸 판(sort2) 머리말 짝: l07 이야기 글 | 극본 · l11 잘한 점 | 더 나아질 점 — 줄마다 같은 머리말(— 앞) 같은 차례', () => { [['u6_l07', 6], ['u6_l11', 6]].forEach(([k, i]) => { const f = fig(k, i); ok(f.k === 'sort2', k); const ha = f.a.items.map(t => nb(t).split(' — ')[0]), hb = f.b.items.map(t => nb(t).split(' — ')[0]); ok(ha.length && JSON.stringify(ha) === JSON.stringify(hb), k + ' ' + ha + ' / ' + hb); ok(f.a.items.every(t => nb(t).indexOf(' — ') > 0), k + ' 머리말'); });
  ok(/연극으로 공연하려고/.test(fig('u6_l07', 6).b.items.join()), '극본 목적'); });
T('l09 극본: 해설 나오는 인물 넷 = 수준별 기본 답 · 관계도 인물 = 극본 인물 · 사건 차례 다섯 = 극본 줄 차례 · ③ 정답 = 마지막 사건', () => {
  const S = SCR('u6_l09', /숲속 음악회/), J = S.join(' '); const who = S[0].match(/나오는 인물: (.+)$/)[1]; ok(L.u6_l09.slides[11].data.levels.기본.a === who, '기본 ' + who);
  const rel = fig('u6_l09', 4); ok(rel.k === 'link' && rel.rows.length === 3, '관계도'); rel.rows.forEach(r => ok(who.indexOf(r[0].name) >= 0 && S.some(l => l.indexOf(r[0].name + ': ') === 0), '관계도 ' + r[0].name));
  const ev = fig('u6_l09', 5).items.map(x => x.name), cue = [/^뭉치: \(북을 끌어안으며\)/, /^토리: /, /빗방울/, /^가시: \(솔방울/, /^뭉치: \(얼굴이 빨개져서\)/]; ok(ev.length === 5, ev.length);
  let at = -1; cue.forEach((re, i) => { const j = S.findIndex(l => re.test(l)); ok(j > at, '사건 ' + i + ' ' + ev[i]); at = j; });
  const b3 = bps('u6_l09')[2]; ok(right(b3)[0] === ev[4], 'l09 ③'); b3.options.forEach(o => ok(ev.indexOf(o.text) >= 0, '③ 보기 ' + o.text));
  const b2 = bps('u6_l09')[1]; b2.options.forEach(o => ok(J.indexOf(o.text) >= 0, '② 보기 극본 ' + o.text)); right(b2).forEach(t => { const ln = S.find(l => l.indexOf(t) >= 0); ok(/^토리: /.test(ln), '② 정답 = 토리 줄 ' + t); }); });
T('l09 역할 수행 학습 모형 네 단계(상황 설정하기 → 준비 및 연습하기 → 실연하기 → 평가하기) · 출구 실연하기', () => { const t = fig('u6_l09', 6).items.map(x => nb(x.t)); ['상황 설정하기', '준비 및 연습하기', '실연하기', '평가하기'].forEach((n, i) => ok(t[i].indexOf(n + ':') === 0, n)); ok(exitA('u6_l09', 2) === '실연하기' && /맡은 역할이 되어 극본 낭독/.test(t[2]), '출구'); });
T('l11 표현 판: 대사 = l09 극본 속 문장 · 소품(북·솔방울) = 극본 · ③ 지문 = 극본', () => { const J = SCR('u6_l09', /숲속 음악회/).join(' '), f = fig('u6_l11', 4);
  ok(f.k === 'mood' && f.items.length === 3, '판'); f.items.forEach(x => ok(J.indexOf(nb(x.say)) >= 0, x.name + ' 대사 ' + x.say));
  ok(L.u6_l11.slides[11].data.levels.기본.a.split(', ').every(x => J.indexOf(x) >= 0), '소품'); ok(J.indexOf('(얼굴이 빨개져서) 가시야, 아까는 미안해.') >= 0 && /얼굴이 빨개져서/.test(bps('u6_l11')[2].question), 'l11 ③'); });
T('l13 감상 질문 판: 인물·사건·배경 세 칸 · 질문 끝 「?」 · ② 정답 = 배경 칸 질문 · 출구 인물 질문 = 판 속 질문', () => {
  const f = fig('u6_l13', 5); ok(f.k === 'groups' && JSON.stringify(f.bins.map(b => b.name)) === JSON.stringify(['인물', '사건', '배경']), '판');
  f.bins.forEach(b => b.items.forEach(x => ok(/\?$/.test(x.name), '질문 끝 ' + x.name))); ok(right(bps('u6_l13')[1])[0] === f.bins[2].items[0].name, '② 배경');
  ok(f.bins[0].items.some(x => x.name === exitA('u6_l13', 1)), '출구'); ok(exitA('u6_l13', 0) === '감상 질문', '출구 감상 질문'); });
T('l13 종이배 제재: 「같이 놀래?」 쪽지 · 공간적 배경(강가 마을) = 수준별 기본 · ① 정답 = 제재', () => { const W = tline('u6_l13', /종이배/); ok(/「같이 놀래\?」/.test(W) && /강가 마을 학교/.test(W) && /강가로/.test(W), '제재'); ok(/강가 마을 학교/.test(L.u6_l13.slides[11].data.levels.기본.a), '기본'); ok(/같이 놀래/.test(right(bps('u6_l13')[0])[0]), '①'); });
T('l15 알맞지 않은 설명 판: 넷 가운데 bad 하나 = 「해설 → 감정」 · 풀이가 해설 뜻(때·곳·등장인물·무대 배경)으로 고침', () => { const f = fig('u6_l15', 5); ok(f.k === 'sents' && f.items.length === 4, '판'); const bad = f.items.filter(x => x.bad); ok(bad.length === 1 && /해설/.test(bad[0].a) && /감정/.test(bad[0].b), 'bad'); ok(/때나 곳, 등장인물, 무대 배경/.test(L.u6_l15.slides[5].data.content), '풀이'); });
T('높임 판(고치기 전 | 바르게 고친 문장) 넷 = 사전 HN · l15 ③ 정답·오답 · 수준별 기본 · 출구 · 오개념 다시 셈', () => {
  const f = fig('u6_l15', 6); ok(f.k === 'link' && f.ha === '고치기 전' && f.hb === '바르게 고친 문장' && f.rows.length === 4, '판'); f.rows.forEach(r => ok(HN[r[0].name] === r[1].name, r[0].name));
  const b = bps('u6_l15')[2]; b.options.forEach(o => ok(!!o.correct === (HNV.indexOf(o.text) >= 0) && (o.correct || HNK.indexOf(o.text) >= 0), '③ ' + o.text));
  const lv = L.u6_l15.slides[11].data.levels.기본, q = lv.q.match(/「([^」]+)」/)[1]; ok(lv.a === HN[q], '기본 ' + q);
  const ex = L.u6_l15.slides[15].data.items[1], q2 = ex.q.match(/「([^」]+)」/)[1]; ok(ex.a === HN[q2], '출구 ' + q2);
  ok(/있으십니다/.test(L.u6_l15.slides[7].data.right) && /계시다/.test(L.u6_l15.slides[7].data.wrong), '오개념');
  const c = nb(L.u6_l15.slides[6].data.content); ok(/높임 어휘/.test(c) && /계시다/.test(c) && /편찮으시다/.test(c) && /밀접한 대상/.test(c) && /있으시다/.test(c), '규칙 글'); });
T('수준별 세 계단 각 문항·답 · 심화 open · 기본 ≠ 출구 문항', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); ok(ex.indexOf(lv.기본.q) < 0, k + ' 기본=출구'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 600 (15차시 × 40) · 80분 다섯 · 120분 하나 · 40분 둘', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 600, d); ok(d.filter(x => x === 80).length === 5 && d.filter(x => x === 120).length === 1 && d.filter(x => x === 40).length === 2, d); });

console.log('═══ G. 제재 ═══');
const tfig = (k, re) => L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title));
T('자체 집필 판 여덟: 메모 4 · 천막 교실 5 · 섬 앞 4 · 섬 뒤 4 · 우체국 7 · 숲속 음악회 7 · 종이배 5 · l09·l11 같은 극본(l11 은 판 없이 l09 극본을 씀)', () => {
  [['u6_l01', /책 소개 메모/, 4, [/등대섬의 여름/, /바다/]], ['u6_l02', /반쪽 연필/, 5, [/1951년/, /부산/, /천막 교실/, /순덕/]], ['u6_l04', /\(앞\)/, 4, [/소리섬/, /나룻배/, /태풍/]], ['u6_l04', /\(뒤\)/, 4, [/밧줄/, /노를/]], ['u6_l07', /우체국/, 7, [/^때:/, /하율: \(/, /우체부: \(/, /할머니: \(/]], ['u6_l09', /숲속 음악회/, 7, [/^때:/, /가시: \(/, /토리: \(/, /뭉치: \(/, /부엉이 선생님: \(/]], ['u6_l13', /종이배/, 5, [/마루/, /은별/, /종이배/]]].forEach(([k, re, n, must]) => { const f = tfig(k, re); ok(f, k + ' 판 없음 ' + re); ok(f.lines.length === n, k + ' 줄 ' + f.lines.length); const s = f.lines.map(l => nb(l)).join('\n'); must.forEach(m => ok(new RegExp(m.source, 'm').test(s), k + ' ' + m)); });
  ok(!L.u6_l11.slides.some(s => s.data.fig && s.data.fig.k === 'text'), 'l11 극본 판 없음'); });
T('극본 판 줄 꼴: 해설 다음은 「인물: (지문) 대사」 또는 「(지문)」 한 줄 — 괄호 짝 맞음', () => ['u6_l07', 'u6_l09'].forEach(k => { const S = SCR(k, k === 'u6_l07' ? /우체국/ : /숲속 음악회/); S.forEach((l, i) => { ok((l.match(/\(/g) || []).length === (l.match(/\)/g) || []).length, k + ' 괄호 ' + i); if (i >= (k === 'u6_l07' ? 2 : 1)) ok(/^[가-힣 ]+: \([^)]+\) .+/.test(l) || /^\([^)]+\)$/.test(l), k + ' 줄 꼴 ' + l); }); }));
T('교과서 원문 작품·인물 이름 0(엄마에게 · 서진선 · 장기려 · 나비를 잡는 아버지 · 현덕 · 바우 · 경환 · 까막골 · 보임누리꽃 · 솔이 · 토움 · 샬럿 · 윌버 · 주커만 · 러비 · 템플턴 · 몽실 · 아낌없이 주는 나무 · 별주부전 · 오즈의 마법사 · 호랑이와 곶감 · 마당을 나온 암탉 · 잎싹 · 시윤 · 온양이 · 장진호)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const re = /엄마에게|서진선|장기려|나비를 잡는 아버지|현덕|바우[가는의를]|경환|까막골|보임누리꽃|솔이|토움|샬럿|윌버|주커만|러비|템플턴|몽실|아낌없이 주는 나무|별주부전|오즈의 마법사|호랑이와 곶감|마당을 나온 암탉|잎싹|시윤|온양이|장진호/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{8}(' + re.source + ').{8}')) || [''])[0]); }));

console.log('═══ H. 선행·용어 ═══');
/* l01 s07(이 단원에서 배울 내용 안내) · 예고 장 · 「다음:」 줄은 뺀다 */
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).filter((s, i) => !(k === 'u6_l01' && i === 6)).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['시대적 배경', /시대적 배경/, 'u6_l02'], ['공간적 배경', /공간적 배경/, 'u6_l02'], ['해설', /해설/, 'u6_l07'], ['대사', /대사/, 'u6_l07'], ['지문', /지문/, 'u6_l07'], ['역할 수행', /역할 수행/, 'u6_l09'], ['관계도', /관계도/, 'u6_l09'], ['감상 질문', /감상 질문/, 'u6_l13'], ['높임', /높임/, 'u6_l15']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (l01 단원 안내 장·예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('l02 「사회적 상황」 · l04 국어사전·문맥 · l07 연극을 하려고 쓴 글 · l11 협력 · l13 근거', () => { ok(/사회적 상황/.test(txt(L.u6_l02)), 'l02'); ok(/국어사전/.test(txt(L.u6_l04)) && /앞뒤 문장/.test(txt(L.u6_l04)), 'l04'); ok(/연극을 하려고 쓴 글/.test(txt(L.u6_l07)), 'l07'); ok(/협력/.test(txt(L.u6_l11)), 'l11'); ok(/근거/.test(txt(L.u6_l13)), 'l13'); });

console.log('═══ I. 오개념·심화 ═══');
[['u6_l01', /줄거리만/, /깊이 있게 감상/], ['u6_l02', /장식/, /사건과 인물에 영향/], ['u6_l04', /말만/, /말과 행동/], ['u6_l07', /괄호 안의 말도/, /지문/], ['u6_l09', /대사만/, /해설·대사·지문/], ['u6_l11', /틀리지 않고/, /감상한 것을 표현/], ['u6_l13', /그대로 쓰여/, /감상이 깊어져요/], ['u6_l15', /무엇이든 「계시다」/, /있으시다/]].forEach(([k, wr, r]) =>
  T(k.slice(3) + ' 오개념 ' + wr.source + ' ✗ · ' + r.source, () => { const m = L[k].slides[7].data; ok(wr.test(m.wrong) && r.test(nb(m.right)), k); }));
T('심화 장 「하나가 아님·다를 수」와 「근거」를 함께 둔 차시 = 8 전부(정답 강요 금지)', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /하나가 아니|하나가 아닐|다를 수/.test(d.note) && /근거/.test(d.note); }).length; ok(n === 8, n); });
T('정답 강요 경계 발문(한쪽만·정답·근거 없이·우기·못 박) = 8 차시 전부', () => KEYS.forEach(k => { const t = JSON.stringify(L[k].slides.map(s => s.data.tnote || null)); ok(/한쪽만|정답|근거 없이|우기|못 박/.test(t), k); }));
T('소극적인 학생 배려 발문·팁(연극 차시 l01·l11)', () => { ok(/부담|두려워/.test(JSON.stringify(L.u6_l01.slides.map(s => s.data.tnote || null))), 'l01'); ok(L.u6_l11.extras.some(e => /소극적인 학생/.test(e.title)), 'l11'); });

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('그림 부품 렌더(ko-text · ko-moods · ko-flow · so-groups · ko-sort2 · ko-note · so-link · 문장 판)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
  ['ko-text', 'ko-moods', 'ko-flow', 'so-groups', 'ko-sort2', 'ko-note', 'so-link'].forEach(c => ok(all.indexOf(c) >= 0, c)); });
T('개념 장 그림 32장 전부 렌더 비지 않음', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id + ' ' + s.data.fig.k); n++; })); ok(n === 32, n); });

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

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_korean_u6: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
