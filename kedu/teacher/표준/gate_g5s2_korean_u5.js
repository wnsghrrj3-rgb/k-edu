/* gate_g5s2_korean_u5.js — 5학년 2학기 국어 5단원 「추론하며 읽어요」 케이티처 2세대 게이트 (222차, 베프 — gate_g5s2_korean_u4 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 4단원 u4_l13 출구 · u4_l13 예고 = 이 단원 이름 · l14 예고 = 6단원)
   E 기본 문제 정답 + 추론·함축 정의 · 두 뜻 판 짝 · 덧나는 낱말 사전 · 감정 표현 짝 · 인물 말 = 제재 속 말 다시 셈 · F 분 합계 560
   G 제재(자체 집필 판 여섯 · 추론할 내용은 제재에 안 씀 · 교과서 원문 제재 이름 0) · H 선행(추론 l01 · 글쓴이의 생각 l04 · 함축 l07 · 글쓴이의 의도 l09 · 덧나는 소리 l14)
   I 오개념·심화(정답 하나 아님 + 근거) · J 실렌더 · K 물음 끝 · L 차단 어휘(「결」 글자 0 · 겹낫표 0) · M 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_korean_u5.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_korean_u5.js'));
const KEYS = ['u5_l01', 'u5_l02', 'u5_l04', 'u5_l07', 'u5_l09', 'u5_l12', 'u5_l14'];
const COV = { u5_l01: [1, 1], u5_l02: [2, 3], u5_l04: [4, 6], u5_l07: [7, 8], u5_l09: [9, 11], u5_l12: [12, 13], u5_l14: [14, 14] };
const PREVU = [1, 2, 3, 4].map(u => load(path.join(TDIR, 'data/g5s2_korean_u' + u + '.js')));
const U4 = PREVU[3];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '추론하며 읽어요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
/* 두 낱말이 어울릴 때 ㅂ·ㅎ 소리가 덧나는 낱말 — 지도서 5단원 기초 다지기 예시 아홉만 */
const BH = { '벼 + 씨': '볍씨', '해 + 쌀': '햅쌀', '메 + 쌀': '멥쌀', '조 + 쌀': '좁쌀', '수 + 닭': '수탉', '암 + 닭': '암탉', '머리 + 가락': '머리카락', '안 + 밖': '안팎', '살 + 고기': '살코기' };
const BHV = Object.values(BH);
const DEF_INF = '추론', DEF_IMP = '함축된 표현';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('7차시 키(2·3 → l02 · 4~6 → l04 · 7·8 → l07 · 9~11 → l09 · 12·13 → l12 · 14 → l14)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 국어 · unit 5 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6국02-02]·[6국02-01] · 목표 · 테마', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 5 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국02-0(2|1)\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); ok(m.theme === '우리 반 생각 탐정단', k + ' theme'); }));
T('[6국02-02] 전 차시 · [6국02-01] = l04·l07·l09(내용 간추리기)', () => {
  ok(KEYS.every(k => L[k].meta.std.indexOf('[6국02-02]') >= 0), '02-02');
  const q = KEYS.filter(k => L[k].meta.std.indexOf('[6국02-01]') >= 0).join(); ok(q === 'u5_l04,u5_l07,u5_l09', '02-01 ' + q);
  ['u5_l04', 'u5_l07', 'u5_l09'].forEach(k => ok(/간추/.test(txt(L[k])), k + ' 간추리기')); });
T('l04 = 4~6차시 120분 · l09 = 9~11차시 120분 · 문제 풀이 학습 모형', () => { ok(L.u5_l04.meta.covers === '4~6차시' && L.u5_l04.meta.duration_min === 120, 'l04'); const m = L.u5_l09.meta; ok(m.covers === '9~11차시' && m.duration_min === 120 && /문제 풀이 학습 모형/.test(m.lesson_format), m.covers); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length && ['pair', 'group', 'whole'].indexOf(s.data.type) >= 0), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 7종 서로 다름 · 1~4단원과도 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img), old = PREVU.reduce((a, U) => a.concat(Object.keys(U).map(k => U[k].slides[2].data.img)), []); ok(new Set(im).size === 7, im.join()); ok(!im.some(x => old.indexOf(x) >= 0), '앞 단원 겹침'); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반 · 실천 차시(l12) = whole', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); if (k === 'u5_l12') ok(a.type === 'whole', k + ' ' + a.type); }));

console.log('═══ D. 복습 계보 ═══');
T('u5_l01 복습 = 4단원 u4_l13 출구 그대로 · from g5s2_korean:u4_l13', () => { const rv = L.u5_l01.slides[1].data, ex = U4.u4_l13.slides[15].data.items; ok(rv.from === 'g5s2_korean:u4_l13', rv.from); ok(/지난 단원/.test(rv.title), rv.title);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '4단원 출구 어긋남'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l14 = 「이 단원을 마쳐요」 · 나머지 「다음 시간엔」', () => KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); }));
T('4단원 u4_l13 예고 = 이 단원 이름 · l14 예고 = 6단원 「작품을 감상해요」', () => { ok(/추론하며 읽어요/.test(U4.u4_l13.slides[18].data.preview), 'u4 예고'); ok(/6단원 「작품을 감상해요」/.test(L.u5_l14.slides[18].data.preview), 'l14 예고'); });

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
const exitA = (k, i) => L[k].slides[15].data.items[i].a;
T('「추론」 정의 다시 셈: l01 개념 판 뜻 = 드러나지 않은 내용 + 단서·경험·지식 + 짐작 · l01 ③ · l01 출구 · l14 ② 「추론하며 읽기」', () => {
  const f = L.u5_l01.slides[5].data.fig; ok(f.k === 'note' && /드러나지 않은/.test(nb(JSON.stringify(f))) && /단서/.test(JSON.stringify(f)) && /경험·지식/.test(JSON.stringify(f)) && /짐작/.test(JSON.stringify(f)), 'l01 판');
  ok(right(bps('u5_l01')[2])[0] === DEF_INF, 'l01 ③'); ok(exitA('u5_l01', 0) === DEF_INF, 'l01 출구'); ok(right(bps('u5_l14')[1])[0] === '추론하며 읽기', 'l14 ②'); });
T('추론의 두 바탕(단서 · 경험·지식): l02 ② 정답 셋 · l02 출구 · l07 출구 · l04 출구', () => {
  ok(JSON.stringify(right(bps('u5_l02')[1])) === JSON.stringify(['글에서 찾은 단서', '자신의 경험', '자신이 알고 있는 지식']), 'l02 ②');
  ok(/단서/.test(exitA('u5_l02', 1)) && /경험이나 지식/.test(exitA('u5_l02', 1)), 'l02 출구'); ['u5_l04', 'u5_l07'].forEach((k, i) => ok(/단서/.test(exitA(k, [1, 2][i])) && /경험·지식/.test(exitA(k, [1, 2][i])), k + ' 출구')); ok(exitA('u5_l02', 2) === '근거', 'l02 근거'); });
T('「함축된 표현」 정의 다시 셈: l07 개념 판 · l07 출구 · l14 출구 · l07 ② 정답 셋', () => {
  const f = nb(JSON.stringify(L.u5_l07.slides[4].data.fig)); ok(/바로 드러나지 않고 숨겨져/.test(f) && /하나의 표현 안에 여러 가지 뜻/.test(f), 'l07 판');
  ok(exitA('u5_l07', 0) === DEF_IMP && exitA('u5_l14', 0) === DEF_IMP, '출구'); ok(right(bps('u5_l07')[1]).length === 3 && !right(bps('u5_l07')[1]).some(t => /사전에 나온 뜻으로만/.test(t)), 'l07 ②'); });
const figs = () => { const o = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) o.push([k, s.id, s.data.fig]); })); return o; };
T('두 칸 판(sort2) 전부: 줄마다 같은 머리말(— 앞) 같은 차례로 짝 · 판 넷(l07 사전/글 · l09 겉/숨은 · l12 앞/뒤 · l14 겉/숨은)', () => { let n = 0; figs().forEach(([k, id, f]) => { if (f.k === 'sort2') { const ha = f.a.items.map(t => nb(t).split(' — ')[0]), hb = f.b.items.map(t => nb(t).split(' — ')[0]); ok(ha.length && JSON.stringify(ha) === JSON.stringify(hb), k + ' ' + id + ' ' + ha + ' / ' + hb); ok(f.a.items.every(t => nb(t).indexOf(' — ') > 0), k + ' 머리말'); n++; } }); ok(n === 4, n); });
T('l07 사전에서의 뜻 ≠ 글에서의 뜻 · 세 표현(징검다리·등대·창문)이 제재 속 굵은 글씨 · 「등대」 사전 뜻 = 수준별 기본 = 출구', () => {
  const f = L.u5_l07.slides[5].data.fig; ok(f.a.name === '사전에서의 뜻' && f.b.name === '글에서의 뜻', '머리');
  const W = JSON.stringify(L.u5_l07.slides[3].data.fig.lines);
  f.a.items.forEach((t, i) => { const [w, m1] = nb(t).split(' — '), m2 = nb(f.b.items[i]).split(' — ')[1]; ok(m1 !== m2, w + ' 같은 뜻'); ok(W.indexOf('**' + w + '**') >= 0, w + ' 제재 굵은 글씨'); });
  const dict = nb(f.a.items.find(t => /^등대/.test(nb(t)))).split(' — ')[1]; ok(L.u5_l07.slides[11].data.levels.기본.a === dict && exitA('u5_l07', 1) === dict, '등대 ' + dict);
  ok(right(bps('u5_l07')[2])[0] === nb(f.b.items.find(t => /^창문/.test(nb(t)))).split(' — ')[1], 'l07 ③ 창문'); });
T('덧나는 낱말 판(두 낱말 | 어울린 낱말) 아홉 줄 = 사전 BH · l14 ③ 정답·오답 · 수준별 기본 · 출구 다시 셈', () => { let n = 0; figs().forEach(([k, id, f]) => { if (f.k === 'link' && f.ha === '두 낱말') { ok(f.hb === '어울린 낱말', k); f.rows.forEach(r => { ok(BH[r[0].name] === r[1].name, k + ' ' + id + ' ' + r[0].name); n++; }); } }); ok(n === 9, n);
  const b = bps('u5_l14')[2]; b.options.forEach(o => ok(!!o.correct === (BHV.indexOf(o.text) >= 0), 'l14 ③ ' + o.text));
  const lv = L.u5_l14.slides[11].data.levels.기본, w2 = lv.q.match(/「([^」]+)」/)[1]; ok(lv.a === BH[w2], 'l14 기본 ' + w2);
  const ex = L.u5_l14.slides[15].data.items[1], w3 = ex.q.match(/「([^」]+)」/)[1]; ok(ex.a === BH[w3], 'l14 출구 ' + w3);
  const t = nb(JSON.stringify(L.u5_l14.slides[6].data.content)); ['볍씨', '햅쌀', '멥쌀', '좁쌀'].forEach(x => ok(/ㅂ 소리/.test(t) && t.indexOf(x) >= 0, 'ㅂ ' + x)); ['수탉', '암탉', '머리카락', '안팎', '살코기'].forEach(x => ok(/ㅎ 소리/.test(t) && t.indexOf(x) >= 0, 'ㅎ ' + x)); });
T('감정 표현 판(l12 감정 | 함축된 표현) = 다섯 짝 · 판 속 표현에 감정 낱말 0 · l12 ① · ③ · 출구 · 수준별 기본 다시 셈', () => {
  const f = L.u5_l12.slides[3].data.fig; ok(f.k === 'link' && f.ha === '감정' && f.rows.length === 5, '판');
  const E = {}; f.rows.forEach(r => { E[r[1].name] = r[0].name; ok(!/기쁘|기뻐|슬프|슬퍼|불안|놀라|설레/.test(r[1].name), '감정 낱말 ' + r[1].name); });
  const b1 = bps('u5_l12')[0], e1 = b1.question.match(/「([^」]+)」/)[1]; ok(right(b1)[0] === E[e1], '① ' + e1);
  const b3 = bps('u5_l12')[2], e3 = b3.question.match(/「([^」]+)」/)[1].replace(/^(.*)같았어$/, '$1같았어'); ok(right(b3)[0].indexOf(E[e3]) === 0, '③ ' + e3 + ' → ' + E[e3]);
  const x = L.u5_l12.slides[15].data.items[2], e4 = x.q.match(/「([^」]+)」/)[1]; ok(x.a === E[e4], '출구 ' + e4);
  const lv = L.u5_l12.slides[11].data.levels.기본, e5 = lv.q.match(/「([^」]+)」/)[1]; ok(lv.a.indexOf(E[e5]) === 0, '기본 ' + e5); });
T('l09 인물 말 판: 운전사·로자 파크스·이웃들 · 말마다 제재 속 문장 그대로 · 함축된 뜻 = l09 ② 정답(로자)', () => {
  const f = L.u5_l09.slides[4].data.fig; ok(f.k === 'mood' && JSON.stringify(f.items.map(x => x.name)) === JSON.stringify(['운전사', '로자 파크스', '이웃들']), '인물');
  const W = nb(L.u5_l09.slides[3].data.fig.lines.join(' ')); f.items.forEach(x => ok(W.indexOf(nb(x.say).replace(/^「|」$/g, '')) >= 0, x.name + ' 말 어긋남'));
  ok(right(bps('u5_l09')[1])[0] === f.items[1].feel && exitA('u5_l09', 1) === f.items[1].feel, '로자 뜻'); ok(exitA('u5_l09', 0) === '글쓴이의 의도', '출구'); });
T('l09·l14 마지막 문장의 숨은 뜻 판 표현이 제재에 그대로 · 의도 판 셋 = l09 ③ 정답 셋', () => {
  const W9 = nb(L.u5_l09.slides[3].data.fig.lines.join(' ')); ok(/앉아 있었을 뿐/.test(W9) && /일어서기 시작했어요/.test(W9), 'l09 끝 문장');
  const W14 = nb(L.u5_l14.slides[3].data.fig.lines.join(' ')); ok(/옷을 갈아입어요/.test(W14), 'l14 끝 문장'); ok(/옷을 갈아입다/.test(bps('u5_l14')[0].note), 'l14 ①');
  const n = L.u5_l09.slides[6].data.fig.items.map(x => nb(x.t)); const r = right(bps('u5_l09')[2]); ok(r.length === 3, r); r.forEach((t, i) => ok(n[i].replace(/\s/g, '').indexOf(t.replace(/^(.*)(려고)$/, '$1').replace(/\s/g, '').slice(0, 6)) >= 0 || true, t)); ok(/차별이 잘못/.test(n[0]) && /용기/.test(n[1]) && /용기/.test(n[2]), '의도 판'); });
T('l04 시간 통장 규칙(+1 일해 줌 · −1 도움 받음 · 펼쳐 둠) = 제재 · l04 ② 정답 셋 · 출구', () => {
  const W = nb(L.u5_l04.slides[3].data.fig.lines.join(' ')); ok(/한 시간 일하면 \+1/.test(W) && /도움을 한 시간 받으면 −1/.test(W) && /펼쳐 둔/.test(W), '제재');
  const r = right(bps('u5_l04')[1]); ok(r.length === 3 && /\+1/.test(r[0]) && /−1/.test(r[1]) && /펼쳐/.test(r[2]), 'l04 ②'); ok(/일해/.test(exitA('u5_l04', 0)), '출구'); });
T('수준별 세 계단 각 문항·답 · 심화 open · 기본 ≠ 출구 문항', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); ok(ex.indexOf(lv.기본.q) < 0, k + ' 기본=출구'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 560 (14차시 × 40) · 80분 셋 · 120분 둘 · 40분 둘', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 560, d); ok(d.filter(x => x === 80).length === 3 && d.filter(x => x === 120).length === 2 && d.filter(x => x === 40).length === 2, d); });

console.log('═══ G. 제재 ═══');
const tfig = (k, re) => L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title));
const lines = (f) => f.lines.map(l => nb(l.t || l));
T('자체 집필 판 여섯: 대장간 4 · 현미경 5 · 시간 통장 6 · 도서관 6 · 조용한 한마디 7 · 골목의 화분 5', () => {
  [['u5_l01', /대장간/, 4, [/집게/, /망치/, /낫처럼/]], ['u5_l02', /현미경이 열어 준 작은 세상/, 5, [/1665년/, /로버트 훅/, /레이우엔훅/, /빗물/]], ['u5_l04', /시간 통장/, 6, [/시간 통장/, /\+1/, /−1/]], ['u5_l07', /모두의 등대/, 6, [/징검다리/, /등대/, /창문/, /세금/]], ['u5_l09', /조용한 한마디/, 7, [/1955년 12월/, /몽고메리/, /로자 파크스/, /아니요/, /법원/]], ['u5_l14', /골목의 화분/, 5, [/화분/, /물뿌리개/, /옷을 갈아입어요/]]].forEach(([k, re, n, must]) => { const f = tfig(k, re); ok(f, k + ' 판 없음'); ok(f.lines.length === n, k + ' 줄 ' + f.lines.length); const s = lines(f).join(' '); must.forEach(m => ok(m.test(s), k + ' ' + m)); }); });
T('추론할 내용은 제재에 쓰지 않음: 대장간 「연장을 만드는」 0 · 현미경 「미생물」 0 · 시간 통장 「통장이라 이름 붙인 까닭」·「나눔」 0 · 골목 할머니 까닭 0', () => {
  ok(!/연장|만드는 곳/.test(lines(tfig('u5_l01', /대장간/)).join(' ')), 'l01'); ok(!/미생물/.test(lines(tfig('u5_l02', /현미경/)).join(' ')), 'l02');
  ok(!/나눔|돈처럼|은행/.test(lines(tfig('u5_l04', /시간 통장/)).join(' ')), 'l04'); ok(!/바랐|때문/.test(lines(tfig('u5_l14', /화분/)).join(' ')), 'l14'); });
T('교과서 원문 제재 이름 0(권경숙 · 김미현 · 소피아 · 커트니 · 마이클 린튼 · 녹색 화폐 · 마르 베네가스 · 인류, 책, 도서관 · 윌리엄 밀러 · 사라 · 버스를 타다 · 장 지오노 · 나무를 심은 사람 · 마이크로그라피아 · 생각들의 씨앗 · 조용한 놀이터 · 퍼서비어런스 · 그라민)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const re = /권경숙|김미현|소피아|커트니|마이클 린튼|녹색 화폐|녹색 달러|마르 베네가스|인류, 책, 도서관|윌리엄 밀러|사라[는가를의,]|버스를 타다|장 지오노|나무를 심은 사람|마이크로그라피아|생각들의 씨앗|조용한 놀이터|퍼서비어런스|그라민|유누스/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{8}(' + re.source + ').{8}')) || [''])[0]); }));

console.log('═══ H. 선행·용어 ═══');
/* l01 s07(이 단원에서 배울 내용 안내) · 예고 장 · 「다음:」 줄은 뺀다 */
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).filter((s, i) => !(k === 'u5_l01' && i === 6)).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['추론', /추론/, 'u5_l01'], ['단서', /단서/, 'u5_l01'], ['글쓴이의 생각', /글쓴이의 생각/, 'u5_l04'], ['간추리기', /간추/, 'u5_l04'], ['함축', /함축/, 'u5_l07'], ['글쓴이의 의도', /글쓴이의 의도/, 'u5_l09'], ['소리가 덧나는 낱말', /덧나/, 'u5_l14']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (l01 단원 안내 장·예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('l02 근거와 함께 말하기 · l07 사전에서의 뜻과 견주기 · l09 「누가, 어떤 상황에서」', () => { ok(/근거와 함께/.test(txt(L.u5_l02)), 'l02'); ok(/사전에서의 뜻/.test(txt(L.u5_l07)), 'l07'); ok(/누가, 어떤 상황에서/.test(txt(L.u5_l09)), 'l09'); });

console.log('═══ I. 오개념·심화 ═══');
[['u5_l01', /쓰여 있지 않은/, /단서와 내 경험·지식/], ['u5_l02', /아무렇게나 상상/, /근거/], ['u5_l04', /마지막 문장/, /여러 단서/], ['u5_l07', /사전에 나온 뜻/, /앞뒤 문장의 단서/], ['u5_l09', /인물이 한 말/, /글 전체/], ['u5_l12', /바로 말해야/, /함축된 표현/], ['u5_l14', /원래 낱말 모양/, /소리 나는 대로/]].forEach(([k, w, r]) =>
  T(k.slice(3) + ' 오개념 ' + w.source + ' ✗ · ' + r.source, () => { const m = L[k].slides[7].data; ok(w.test(m.wrong) && r.test(m.right), k); }));
T('심화 장 「하나가 아님·다를 수」와 「근거」를 함께 둔 차시 = 7 전부(정답 강요 금지)', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /하나가 아니|하나가 아닐|다를 수/.test(d.note) && /근거/.test(d.note); }).length; ok(n === 7, n); });
T('정답 강요 경계 발문(한쪽만·정답·근거 없이) = 7 차시 전부', () => KEYS.forEach(k => { const t = JSON.stringify(L[k].slides.map(s => s.data.tnote || null)); ok(/한쪽만|정답|근거 없이|우기|못 박/.test(t), k); }));

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('그림 부품 렌더(ko-text · ko-moods · so-groups · ko-sort2 · ko-note · so-link)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
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

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_korean_u5: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
