/* gate_g5s2_social_u1.js — 5학년 2학기 사회 1단원 「유적과 유물로 살펴본 옛 사람들의 생활」 케이티처 2세대 게이트 (158차, 베프 — 과학 u3 게이트 틀).
   지도서 직행(자기주도 원문 없음) — T 표 자체 규칙을 잰다. 역사 원칙: 인과 중심 · 연도 묻기 0 · s15 = 「그날의 선택」.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보 · E 기본 문제 정답 표시 · F 분 합계
   G 역사 원칙(연도·숫자 연대 0 · 그날의 선택 = 고르기 둘 → 그때 실제로는 → 다음 이야기) · H 선행 용어 · I 실렌더 · J 차단 어휘 · K 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_social_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_social_u1.js'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04'];
const COV = { u1_l01: [1, 1], u1_l02: [2, 2], u1_l03: [3, 3], u1_l04: [4, 5] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '유적과 유물로 살펴본 옛 사람들의 생활';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('키 = 지도서 1·2·3·4~5차시', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 사회 · unit 1 · 단원명 · n·covers·분 = 지도서 차시 · [6사04-01] · 목표·교과서 쪽', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers'); ok(/^\[6사04-0[123]\]$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4 && /^p\.\d/.test(m.textbook), k + ' 목표·쪽'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
KEYS.forEach(k => T(k + ' extras — 장이 가리키는 id 모두 있음 · id 겹침 0', () => { const ids = L[k].extras.map(e => e.id); ok(new Set(ids).size === ids.length, '겹침'); L[k].slides.forEach(s => (s.suggested_extras || []).forEach(x => ok(ids.indexOf(x) >= 0, s.id + ' ' + x))); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length), '④활동(1인 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
T('u1_l01 = 단원 첫 차시(from 비움, 회상 셋)', () => { const rv = L.u1_l01.slides[1].data; ok(rv.from === '' && rv.items.length === 3, rv.from); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data, ex = L[KEYS[i]].slides[15].data.items;
  ok(rv.from === 'g5s2_social:' + KEYS[i], 'from ' + rv.from); ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 2', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 2, n); });
T('수준별 세 계단 각 문항·답 있음 · 심화 = 열린 답', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; Object.entries(lv).forEach(([n, x]) => ok(x && x.q && x.a, k + ' 계단 ' + n)); ok(lv.심화.open, k + ' 심화 open'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 200 (5차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 200, n); });

console.log('═══ G. 역사 원칙 ═══');
T('연도·연대 숫자 0 (○○년·○만 년 전·기원전·세기 — 교사 메모 포함 전부)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k].slides); ok(!/\d+\s*(만\s*)?년|기원전|기원후|세기/.test(s), k + ' ' + (s.match(/.{12}(\d+\s*(만\s*)?년|기원전|기원후|세기).{8}/) || [''])[0]); }));
T('문제·출구에 「언제」 묻기 0', () => KEYS.forEach(k => L[k].slides.filter(s => /basic_problem|exit_ticket|leveled_problem/.test(s.block)).forEach(s => ok(!/언제|몇 년|연도/.test(JSON.stringify(s.data)), k + ' ' + s.id))));
KEYS.forEach(k => T(k + ' s15 그날의 선택 = 상황 · ①② 고르기 · 그때 실제로는 · 다음 이야기', () => { const d = L[k].slides[14].data;
  ok(d.title === '그날의 선택', d.title); ok(d.context && d.context.length > 30, 'context'); ok(/①[^②]+②/.test(d.challenge) && /까닭/.test(d.challenge), 'challenge');
  ok(/^그때 실제로는:/.test(d.note) && /→ 다음 이야기:/.test(d.note), 'note'); }));
T('그날의 선택 「다음 이야기」 → 다음 차시 주제로 이어짐', () => { ok(/구석기/.test(L.u1_l01.slides[14].data.note) && /구석기/.test(L.u1_l02.meta.title), 'l01→l02'); ok(/씨앗/.test(L.u1_l02.slides[14].data.note) && /농사/.test(txt(L.u1_l03)), 'l02→l03'); ok(/더 많이 가진/.test(L.u1_l03.slides[14].data.note) && /빈부의 차이/.test(txt(L.u1_l04)), 'l03→l04'); ok(/고조선/.test(L.u1_l04.slides[14].data.note) && /고조선/.test(L.u1_l04.slides[18].data.preview), 'l04→l05'); });
T('인과 줄: 요약 화살표 ≥3 · 마지막 = 「다음:」 물음', () => KEYS.forEach(k => { const a = L[k].slides[16].data.arrows; ok(a.length >= 3 && a.slice(0, -1).every(x => /→/.test(x)) && /^다음: .+\?$/.test(a[a.length - 1]), k); }));
T('l03 정착 까닭 = 먹을 것을 꾸준히(지도서 핵심 질문) · 농사는 「점차」', () => { const s = txt(L.u1_l03); ok(/꾸준히/.test(s) && /정착 생활/.test(s) && /점차/.test(s), 'l03'); });
T('l04 지도서 핵심: 청동기 = 지배자가 주로(농사엔 돌·나무) · 빈부의 차이 까닭 = 곡식이 남음 · 고인돌 = 지배자 짐작', () => { const s = txt(L.u1_l04); ok(/지배자\*\*가 무기와 제사/.test(s) && /돌·나무/.test(s), '청동기 쓰임'); ok(/곡식이 남[자았]/.test(s) && /\*\*빈부의 차이\*\*/.test(s), '빈부'); ok(/\*\*고인돌\*\*/.test(s) && /많은 사람/.test(s), '고인돌'); ok(/청동.{0,6}농기구/.test(JSON.stringify(L.u1_l04.slides[7].data.wrong)), '오개념 = 청동 농기구(교과서 꼭 기억해요 1)'); });

console.log('═══ H. 선행 용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['유적', /유적/, 'u1_l01'], ['유물', /유물/, 'u1_l01'], ['선사 시대', /선사 시대/, 'u1_l01'], ['뗀석기', /뗀석기/, 'u1_l02'], ['막집', /막집/, 'u1_l02'], ['움집', /움집/, 'u1_l03'], ['가락바퀴', /가락바퀴/, 'u1_l03'], ['빗살무늬', /빗살무늬/, 'u1_l03'], ['정착 생활', /정착 생활/, 'u1_l03'], ['고인돌', /고인돌/, 'u1_l04'], ['민무늬 토기', /민무늬/, 'u1_l04'], ['반달 돌칼', /반달 돌칼/, 'u1_l04'], ['빈부의 차이', /빈부/, 'u1_l04'], ['지배자', /지배자/, 'u1_l04'], ['부족', /부족/, 'u1_l04']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('다루지 않는 것 0(l01~l03: 계급·지배자·부족·씨족 · 전 차시: 계급·계층·씨족·제정일치·군장·족장·비파형)', () => KEYS.forEach(k => { const s = txt(L[k]), re = k === 'u1_l04' ? /계급|계층|씨족|제정일치|군장|족장|비파형/ : /계급|지배자|부족|씨족/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{10}(' + re.source + ').{10}')) || [''])[0]); }));
T('유적 = 자리 · 유물 = 물건 (l01 정의)', () => { const s = txt(L.u1_l01); ok(/자리를 \*\*유적\*\*/.test(s) && /물건을 \*\*유물\*\*/.test(s), 'l01'); });
T('간석기 = 갈고 다듬어 (l03 정의)', () => ok(/\*\*갈고 다듬어\*\*[^"]*\*\*간석기\*\*/.test(txt(L.u1_l03)), 'l03'));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('next_lesson = 「다음 시간엔」(단원 끝 아님)', () => KEYS.forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)));

console.log('═══ J. 차단 어휘 ═══');
T('결·박음·빵꾸·갈아엎 0 (결정·해결 같은 낱말 포함 전부)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));

console.log('═══ K. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_social_u1: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
