/* gate_g5s2_korean_u1.js — 5학년 2학기 국어 1단원 「작품에 대한 의견을 나누어요」 케이티처 2세대 게이트 (213차, 베프 — gate_g5s2_science_u4 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 1학기 선수 학습) · E 기본 문제 정답 · F 분 합계 560
   G 제재(자체 집필 시 화면 · 교과서 원문 제재 0 · 유관순 사실) · H 선행(전기문 l07 · 서평 정의 l10 · 분류·분석·분배 l14 · 괜스레 l04) · I 오개념(스물한째 기준)
   J 실렌더 · K 물음 끝 「요」 · L 차단 어휘(「결」 글자 0 · 겹낫표 0) · M 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_korean_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_korean_u1.js'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l04', 'u1_l07', 'u1_l10', 'u1_l12', 'u1_l14'];
const COV = { u1_l01: [1, 1], u1_l02: [2, 3], u1_l04: [4, 6], u1_l07: [7, 9], u1_l10: [10, 11], u1_l12: [12, 13], u1_l14: [14, 14] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '작품에 대한 의견을 나누어요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('7차시 키(2·3 → l02 · 4~6 → l04 · 7~9 → l07 · 10·11 → l10 · 12·13 → l12)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 국어 · unit 1 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6국05-04]·[6국01-06] · 목표', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국0(5-04|1-06)\])+$/.test(m.std) && m.std.indexOf('[6국05-04]') >= 0, k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); }));
T('[6국01-06] 토의 = l04 모둠 의견 나누기 · l12 이달의 책 토의', () => ok(KEYS.filter(k => L[k].meta.std.indexOf('[6국01-06]') >= 0).join() === 'u1_l04,u1_l12', 'std 01-06'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 7종 서로 다름', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 7, im.join()); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));

console.log('═══ D. 복습 계보 ═══');
T('u1_l01 복습 = 1학기 선수 학습(5-1 비유적 표현·인상 깊은 내용) 3문항 · from 빈칸', () => { const rv = L.u1_l01.slides[1].data; ok(rv.from === '' && rv.items.length === 3, 'l01'); ok(/1학기/.test(rv.title), rv.title); ok(/비유적 표현/.test(JSON.stringify(rv.items)) && /인상 깊은/.test(JSON.stringify(rv.items)), 'l01 선수'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l14 = 「이 단원을 마쳐요」 + 2단원 「올바른 문장으로 글을 써요」 예고 · 나머지 「다음 시간엔」', () => KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); if (i === KEYS.length - 1) ok(/올바른 문장으로 글을 써요/.test(d.preview), d.preview); }));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); ok(/모두 고르세요/.test(d.question), s.id + ' 모두 고르기 물음'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); ok(!/모두/.test(d.question), s.id + ' 하나인데 모두'); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 5', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 5, n); });
T('수준별 세 계단 각 문항·답 · 심화 open', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); }));
T('수준별 기본 ≠ 출구 문항(복습 계보와 겹치지 않게)', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ok(ex.indexOf(lv.기본.q) < 0, k); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 560 (14차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 560, n); });

console.log('═══ G. 제재 ═══');
const POEMS = { u1_l01: ['귤 까는 법'], u1_l02: ['말의 온도'], u1_l04: ['괜찮아, 나', '방학 마지막 날'], u1_l14: ['종이비행기'] };
Object.entries(POEMS).forEach(([k, ts]) => T(k + ' 자체 집필 시 화면(시 판 poem) — ' + ts.join(' · '), () => ts.forEach(t => ok(L[k].slides.some(s => s.data.fig && s.data.fig.k === 'text' && s.data.fig.poem && s.data.fig.title === t && s.data.fig.lines.length >= 3), t))));
T('교과서 원문 제재 이름 0(말에도 색깔이 있지 · 똑, 똑 · 월요일 아침 · 뻥튀기 먹는 법 · 별 그리기 · 호랑이를 부탁해 · 단풍 · 민들레 꽃씨)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/말에도 색깔|똑, 똑|월요일 아침|뻥튀기|별 그리기|호랑이를 부탁해|민들레 꽃씨|「단풍」/.test(s), k + ' ' + (s.match(/.{8}(말에도 색깔|똑, 똑|월요일 아침|뻥튀기|별 그리기|호랑이를 부탁해|민들레 꽃씨|「단풍」).{8}/) || [''])[0]); }));
T('l07 전기문 판 둘 · 사실(1902 · 이화학당 · 1919 · 3월 1일 · 4월 1일 · 아우내 · 1920) 모두 실림', () => { const s = txt(L.u1_l07); ok(L.u1_l07.slides.filter(x => x.data.fig && x.data.fig.k === 'text' && /유관순/.test(x.data.fig.title)).length === 2, '판 둘'); ['1902년', '이화학당', '1919년', '3월 1일', '4월 1일', '아우내', '1920년'].forEach(x => ok(s.indexOf(x) >= 0, x)); });
T('l10 예시 서평 = 지어낸 책 「수요일의 텃밭」 · 서평 다섯 요소 · 아쉬운 점 실림', () => { const s = txt(L.u1_l10); ['제목', '책 소개', '줄거리', '인상적인 부분', '책에 대한 평가'].forEach(x => ok(s.indexOf(x) >= 0, x)); ok(/수요일의 텃밭/.test(s) && /아쉬워요/.test(s), '예시'); });

console.log('═══ H. 선행 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['전기문', /전기문/, 'u1_l07'], ['괜스레', /괜스레/, 'u1_l04'], ['분배하다', /분배/, 'u1_l14'], ['분석하다', /분석/, 'u1_l14'], ['독서 감상문', /감상문/, 'u1_l10'], ['일제 강점기', /일제 강점기/, 'u1_l07']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('서평 정의(까닭을 들어 평가) = l10 · l10 앞 「서평」은 l01 단원 안내 장(s07)에만', () => { ok(/까닭을 들어 평가/.test(txt(L.u1_l10)), 'l10 정의');
  KEYS.slice(0, 4).forEach(k => L[k].slides.slice(0, 18).forEach(s => { const j = JSON.stringify(Object.assign({}, s.data, { tnote: 0 })).replace(/"다음: [^"]*"/g, ''); if (/서평/.test(j)) ok(k === 'u1_l01' && s.id === 's07', k + ' ' + s.id); })); });
T('l14 기초 다지기 세 낱말 뜻(종류에 따라 가르다 · 여러 부분으로 나누어 살피다 · 몫으로 나누어 주다)', () => { const s = txt(L.u1_l14); ['종류에 따라 가르다', '여러 부분으로 나누어 살피다', '몫으로 나누어 주다'].forEach(x => ok(s.indexOf(x) >= 0, x)); });

console.log('═══ I. 오개념(스물한째 기준: 정답 하나 아님 + 아무거나 아님) ═══');
T('l01 오개념 = 정답 하나 ✗ · 다를 수 있음 + 까닭', () => { const m = L.u1_l01.slides[7].data; ok(/정답/.test(m.wrong) && /다를 수/.test(m.right) && /까닭/.test(m.right), 'l01'); });
T('l04 오개념 = 다르면 틀림 ✗ · 경험·관심사·배경지식', () => { const m = L.u1_l04.slides[7].data; ok(/경험/.test(m.right) && /관심사/.test(m.right) && /배경지식/.test(m.right), 'l04'); });
T('l07 오개념 = 전기문 말·행동 모두 그대로 ✗ · 사실 바탕 + 다시 꾸밈', () => { const m = L.u1_l07.slides[7].data; ok(/역사적 사실/.test(m.right) && /꾸며/.test(m.right), 'l07'); });
T('l10 오개념 = 줄거리 중심 ✗ · 평가', () => { const m = L.u1_l10.slides[7].data; ok(/줄거리/.test(m.wrong) && /평가/.test(m.right), 'l10'); });
T('심화 장 「정답 하나 아님」과 「근거·까닭 필요」를 함께 둔 차시 ≥ 3', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /정답은 하나가 아니|다를 수/.test(d.note) && /근거|까닭/.test(d.note); }).length; ok(n >= 3, n); });

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('국어 그림 부품 렌더(시 판 ko-text poem · 메모 ko-note · 마음 흐름 ko-flow · 두 갈래 ko-sort2 · 잇기 so-link · 편지지 ko-letter)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
  ['ko-text poem', 'ko-note', 'ko-flow', 'ko-sort2', 'so-link', 'ko-letter', 'ko-moods'].forEach(c => ok(all.indexOf(c) >= 0, c)); });

console.log('═══ K. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log('═══ L. 차단 어휘 ═══');
T('「결」 글자 0 · 박음·빵꾸·갈아엎 0 · 겹낫표 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎|『|』/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎|『).{10}/) || [''])[0]); }));

console.log('═══ M. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_korean_u1: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
