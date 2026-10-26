/* gate_g4s2_korean_u3.js — 4학년 2학기 국어 3단원 「의견을 모아서」 케이티처 2세대 게이트 (199차, 베프 — 4-2 국어 u2 게이트 복제 + u3 맞춤).
   2세대 무대(stage2.js renderSlide)로 실렌더한다. 국어라 산수 검산 대신 원문 계승·정답 표시·선행 용어·인물 조사를 전수 본다.
   A 로드·meta(8 묶음 키 = 원문 파일 1:1 · 40/80/80/40/80/80/80/40 = 520분 · grade 4 · term 2 · 성취기준 = 원문 차시 머리 [4국…] · 학습 목표 = 원문)
   B 19장 골격 · C 7요소 · D 복습 계보(g4s2_korean u2_l14 → l01 → … → l11)
   E 정답 표시(하나 고르기 = 원문 정답 · 모두 고르기 = 원문 hit 그대로(보기 3~6) · 짝 잇기 = 원문 짝 전부 · 종류 합 24) · 수준별·출구
   F 원문 계승(개념 말풍선 = 원문 글(겹낫표 → 「」) · 글 판 = 원문 줄 · ㄺ 장 카드 = 원문 HTML 그 장의 trace 칸 · 기본 문제 = 원문 문항 · 정리 = 원문 「④ 정리」 줄(l01 = 단원 차례 줄 · l13 = 「정리하기」 줄) · 잇기 그림 = 원문 짝)
   G 그림 렌더(부품 8가지) · H 중복 0 · I 실렌더 + 1인 흐름 + 모두 고르기 표시 · J extras 22 · K 발문 6장↑·분 합 = 차시 분의 0.75~1.1배 · L 선행 용어(원문도 같은 차례) · M 이야기 인물 조사
   N 저작권·차단 어휘(박음·빵꾸·갈아엎·결로·박수 0 · 「결」은 교과 낱말 해결·결정·결과·결석 안에서만 — 199차 판단, 4-1 국어 2단원 토의 단원과 같은 처리)
   실행: NODE_PATH=<jsdom 있는 node_modules> node kedu/teacher/표준/gate_g4s2_korean_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g4s2_korean_u3.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_korean_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_korean_u3.json'), 'utf8'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l04', 'u3_l06', 'u3_l07', 'u3_l09', 'u3_l11', 'u3_l13'];
const MIN = { u3_l01: 40, u3_l02: 80, u3_l04: 80, u3_l06: 40, u3_l07: 80, u3_l09: 80, u3_l11: 80, u3_l13: 40 };
const STD = { u3_l01: '[4국01-06][4국03-03]', u3_l02: '[4국01-06]', u3_l04: '[4국01-06]', u3_l06: '[4국03-03]', u3_l07: '[4국03-03]', u3_l09: '[4국03-03][4국04-03][4국03-01]', u3_l11: '[4국01-06][4국03-03]', u3_l13: '[4국01-06][4국03-03]' };
const SUMSRC = { u3_l01: 10, u3_l02: 16, u3_l04: 17, u3_l06: 12, u3_l07: 15, u3_l09: 17, u3_l11: 12, u3_l13: 1 };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '의견을 모아서';
const SD = path.join(TDIR, '..', '..', 'grade4/semester2/korean/3단원_의견을모아서');
const kq = (s) => String(s || '').replace(/『([^』]*)』/g, '「$1」');
const OKG = /해결|결정|결과|결석/g; /* 199차: 「결」은 이 네 교과 낱말 안에서만 */

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
/* ㄺ 장(l13 s15)의 칸 — 생성기와 같은 길(그 장 제목부터 다음 장 머리까지의 trace-row)로 원문 HTML 에서 읽는다 */
const TRACE_AT = { u3_l13: 14 };
const TRACE = {}; Object.keys(TRACE_AT).forEach(k => { const h = fs.readFileSync(path.join(SD, SRC[k].file), 'utf8'); const a = h.indexOf("t:'" + SRC[k].slides[TRACE_AT[k]].t + "'"); const b = h.indexOf('{tag:', a + 1); TRACE[k] = h.slice(a, b).split('<div class="trace-row">').slice(1).map(row => (row.match(/class="trace-cell">([^<]*)</g) || []).map(c => c.replace(/^class="trace-cell">/, '').replace(/<$/, '')).join('')); });

console.log('═══ A. 로드 ═══');
T('8차시 키(원문 묶음 1:1 = 첫 차시 번호 · 원문 파일 8 = 13차시분)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · unit 1 · unit_title · covers·분 = 원문 파일 · 성취기준 = 원문 차시 머리 · 학습 목표 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = SRC[k].covers;
  ok(m.grade === 4 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '국어' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] === 1 ? '·' : '~') + c[1] + '차시'), k + ' covers');
  ok(m.std === STD[k], k + ' std ' + m.std); { const h = fs.readFileSync(path.join(SD, SRC[k].file), 'utf8'); (m.std.match(/\[4국0\d-0\d\]/g) || []).forEach(x => ok(h.indexOf(x) >= 0, k + ' 원문 머리에 ' + x + ' 없음')); }
  ok(m.goal === SRC[k].goal && m.goal && !/=/.test(m.goal), k + ' 학습 목표 ' + m.goal);
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('묶음 분(1 / 2·3 / 4·5 / 6 / 7·8 / 9·10 / 11·12 / 13) · 합 520분', () => { KEYS.forEach(k => ok(L[k].meta.duration_min === MIN[k], k + ' ' + L[k].meta.duration_min)); ok(L.u3_l02.meta.covers === '2·3차시', 'l02 covers'); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 520, '합'); });
T('ㄺ 칸(원문 HTML trace — 그 장 몫) l13 낱말 4(맑다·굵다·흙길·닭장) 실존 · 다음 장(문장 쓰기) 칸은 섞이지 않음', () => { ok(TRACE.u3_l13.join() === '맑다,굵다,흙길,닭장', 'l13 ' + TRACE.u3_l13.join(',')); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex13 = PREV.u2_l14.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2단원 마지막 g4s2_korean u2_l14') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex13.map(x => ({ q: kq(x.q), a: kq(x.a) }));
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_korean:u2_l14'), 'from ' + rv.from); ok(L[k].slides[1].data.title === '지난 시간엔 무엇을 했나요?', 'title'); ok(rv.items.length === 3, '문항 3'); }));
T('2단원 출구 그대로(겹낫표 해당 0) · 복습 장 「결」 0', () => { ok(JSON.stringify(ex13) === JSON.stringify(ex13.map(x => ({ q: kq(x.q), a: kq(x.a) }))), '2단원 출구가 바뀜'); ok(JSON.stringify(L.u3_l01.slides[1].data).indexOf('결') < 0, '복습 장 「결」'); });

console.log('═══ E. 정답 표시 ═══');
let nPick = 0, nCol = 0, nMatch = 0;
KEYS.forEach(k => T(k + ' 기본 3 = 원문 정답 그대로 · 수준별 · 출구', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, src = SRC[k].slides[s.src]; ok(src && src.log, s.id + ' 원문 문항 아님(로깅 문항만)');
    if (src.kind === 'pick') { nPick++; ok(!d.multi && d.options.length === src.opts.length, s.id + ' 보기 수'); ok(d.options.filter(o => o.correct).length === 1, s.id + ' 정답 1'); ok(d.options.findIndex(o => o.correct) === src.ci, s.id + ' 정답 위치'); d.options.forEach((o, i) => ok(o.text === src.opts[i], s.id + ' 보기 원문')); ok(d.note.indexOf('**' + nb(src.opts[src.ci]) + '**') >= 0, s.id + ' 풀이 끝 = 정답'); }
    else if (src.kind === 'collect') { nCol++; ok(d.multi === true, s.id + ' multi'); ok(d.options.length >= 3 && d.options.length <= 6, s.id + ' 보기 3~6 (' + d.options.length + ')'); d.options.forEach(o => { const c = src.chips.find(x => x.t === o.text); ok(c, s.id + ' 원문에 없는 보기 ' + o.text); ok(!!o.correct === c.hit, s.id + ' 정답 표시 ≠ 원문 ' + o.text); });
      ok(d.options.some(o => o.correct) && d.options.some(o => !o.correct), s.id + ' 맞는 것·틀린 것 모두'); ok(d.note.indexOf('**' + d.options.filter(o => o.correct).length + '개**') >= 0, s.id + ' 풀이 개수'); }
    else if (src.kind === 'match') { nMatch++; src.pairs.forEach(p => ok(d.answer.indexOf(p[0] + ' ↔ ' + p[1]) >= 0, s.id + ' 짝 ' + p[0])); }
    else ok(false, s.id + ' 문항 종류 ' + src.kind); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open'); ['기본', '도전'].forEach(t => ok(lv[t].a && lv[t].steps.length >= 3, t + ' 답·풀이 단계'));
  sl[15].data.items.forEach(it => ok(it.q && it.a && /\?$/.test(it.q), '출구 ' + it.q)); }));
T('기본 문제 종류 — 하나 고르기 ' + nPick + ' · 모두 고르기 ' + nCol + ' · 짝 ' + nMatch + ' (셋 다 쓰임 · 8묶음 × 3 = 24)', () => ok(nPick >= 5 && nCol >= 3 && nMatch >= 3 && nPick + nCol + nMatch === 24, nPick + '/' + nCol + '/' + nMatch));

console.log('═══ F. 원문 계승 ═══');
function srcContent(sl) { if (sl.kind === 'recap') return sl.items.join('\n'); if (sl.kind === 'stage') return [sl.text, sl.stage].filter(Boolean).join('\n'); if (!sl.text && sl.extra) return sl.extra.join('\n'); return sl.text || ''; }
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 장(말풍선·글 판·정리 줄·장면 글·ㄺ 칸) · 문항 = 원문 · 정리 = 원문 「④ 정리」 줄', () => { const src = SRC[k];
  const used = new Set();
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && !sl.log, s.id + ' 원문 개념 장 아님'); ok(!used.has(s.src), s.id + ' 같은 원문 장 두 번'); used.add(s.src); ok(d.title === nb(sl.t), s.id + ' 제목 ' + d.title);
    if (sl.kind === 'read') { ok(d.fig.k === 'text' && d.fig.lines.length === sl.lines.length, s.id + ' 글 판 줄 수'); d.fig.lines.forEach((l, i) => ok(norm(typeof l === 'string' ? l : l.t) === norm(sl.lines[i].replace(/\n/g, ' / ')), s.id + ' 글 판 ' + (i + 1) + '줄 원문 아님')); ok(d.content && d.content.length < 90, s.id + ' 글 판 장 말풍선은 한 줄'); }
    else if (!srcContent(sl)) { ok(TRACE_AT[k] === s.src && /써요/.test(sl.t || ''), s.id + ' 글 없는 원문 장은 따라 쓰기 장뿐'); ok(d.content === '따라 쓰기: ' + TRACE[k].join(' · '), s.id + ' 글씨 쓰기 낱말 ≠ 원문 ' + d.content); ok(d.fig.k === 'tools' && d.fig.items.map(x => x.name).join() === TRACE[k].join(), s.id + ' 글씨 카드 = 원문 낱말'); }
    else { ok(norm(d.content) === norm(kq(srcContent(sl))) && d.content, s.id + ' 말풍선 원문 아님'); if (TRACE_AT[k] === s.src) ok(d.fig.k === 'tools' && d.fig.items.map(x => x.name).join() === TRACE[k].join(), s.id + ' ㄺ 카드 = 원문 낱말'); }
    if (sl.kind === 'scene' && d.fig.k === 'text') { const say = sl.say.map(p => p.join(' ')).join(' ').replace(/\*\*/g, ''); d.fig.lines.forEach(l => { const t = String(l).replace(/^[가-힣]{2,3} — /, ''); ok(norm(say).indexOf(norm(t).slice(0, 12)) >= 0 || norm(say.replace(/[가-힣]{2} 「/g, '「')).indexOf(norm(t).slice(0, 12)) >= 0, s.id + ' 장면 말 줄 원문 아님 ' + l); }); } });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.slides[s.src].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; const at = SUMSRC[k], sl = src.slides[at];
  const recs = src.slides.map((x, i) => [x, i]).filter(([x]) => x.kind === 'recap' && /^④/.test(x.tag || ''));
  if (recs.length) ok(recs[recs.length - 1][1] === at, '정리 줄 = 원문 마지막 「④ 정리」 장(' + recs.map(r => r[1]).join(',') + ') ≠ ' + at);
  else ok(sl.kind === 'recap' && /무엇을 배울까요|정리하기/.test(sl.tag || ''), '「④ 정리」 없는 차시(l01·l13)는 원문 단원 차례 · 「정리하기」 줄');
  const items = sl.kind === 'recap' ? sl.items : sl.extra.map(x => nb(x.replace(/^✓/, ''))); ok(items.length >= 3 && items.every((it, i) => sm[i] === kq(it)), '정리 줄 ≠ 원문'); }));
T('잇기 그림(link) 줄 = 같은 차시 원문 짝 잇기 그대로', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.data.fig && s.data.fig.k === 'link').forEach(s => { n++; ok(SRC[k].slides.some(x => x.kind === 'match' && JSON.stringify(x.pairs) === JSON.stringify(s.data.fig.rows)), k + ' ' + s.id); ok(!L[k].slides.some(b => b.block === 'basic_problem' && JSON.stringify(SRC[k].slides[b.src].pairs || null) === JSON.stringify(s.data.fig.rows)), k + ' 잇기 그림 짝 = 같은 차시 기본 문제 정답'); })); ok(n >= 1, 'link ' + n); });
T('원문 문항 전부의 짝이 맞다(짝 잇기 원문 자체 확인 — 2~4짝 · 왼쪽·오른쪽 겹침 0)', () => KEYS.forEach(k => SRC[k].slides.filter(x => x.kind === 'match').forEach(x => { const n = x.pairs.length; ok(n >= 2 && n <= 4, k + ' ' + x.t); ok(new Set(x.pairs.map(p => p[0])).size === n && new Set(x.pairs.map(p => p[1])).size === n, k + ' 겹침'); })));
T('mood(인물 말풍선) 그림 0 — 인물 말 줄은 글 판(text)으로만 싣는다', () => KEYS.forEach(k => L[k].slides.forEach(s => ok(!(s.data.fig && s.data.fig.k === 'mood'), k + ' ' + s.id))));
T('next_lesson 제목 = 「다음 시간엔」 7 + 마지막 「다음 단원엔」 · 마지막 미리보기 = 4단원 「책 속의 길을 따라」', () => { KEYS.forEach((k, i) => ok(L[k].slides[18].data.title === (i === KEYS.length - 1 ? '다음 단원엔' : '다음 시간엔'), k + ' ' + L[k].slides[18].data.title)); ok(/4단원 「책 속의 길을 따라」/.test(L.u3_l13.slides[18].data.preview), 'l13 미리보기'); });
T('「결」 근거 — 원문 재료의 「결」은 전부 해결·결정·결과·결석 안(홑낱말 「결」·「결로」 0) · 박수 0', () => { const noTag = JSON.stringify(Object.keys(SRC).map(k => SRC[k].slides.map(x => Object.assign({}, x, { tag: undefined, raw: undefined })))); ok(noTag.replace(OKG, '').indexOf('결') < 0, '교과 낱말 아닌 「결」'); ok(noTag.indexOf('박수') < 0, '박수'); ok(noTag.indexOf('결로') < 0, '결로'); });
T('모두 고르기 하한 · 문항 종류 표 근거 — 원문 가려내기 문항 42개(하나 22 · 모두 13 · 짝 7)', () => { const all = []; KEYS.forEach(k => SRC[k].slides.filter(x => x.log).forEach(x => all.push(x.kind))); const c = (t) => all.filter(x => x === t).length; ok(all.length === 42 && c('pick') === 22 && c('collect') === 13 && c('match') === 7, all.length + ' ' + c('pick') + '/' + c('collect') + '/' + c('match')); });

console.log('═══ G. 그림 ═══');
const KO = ['text', 'sort2', 'sound', 'tools', 'chain', 'link', 'note', 'pause', 'letter'];
KEYS.forEach(k => T(k + ' 개념 4장 국어 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && KO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => ok(!/\*\*/.test(it.name), s.id + ' 카드 ** ' + it.name));
  if (f.k === 'letter') ok((f.parts && f.parts.length >= 3) || (f.lines && f.lines.length >= 2), s.id + ' 편지지 칸'); })));
T('부품 가짓수 ≥ 8 (글 판·두 갈래·카드·차례·잇기·메모·편지지·소리)', () => { const set = new Set(); KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && set.add(s.data.fig.k))); ok(set.size >= 8, [...set].join(',')); });

console.log('═══ H. 중복 ═══');
T('한 차시 안에서 기본·수준별 문제 중복 0 · 출구 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q, lv.심화.q); const n = e.map(norm); ok(new Set(n).size === n.length, k + ' 문제 중복'); const x = sl[15].data.items.map(i => norm(i.q)); ok(new Set(x).size === 3, k + ' 출구 중복'); }));
T('차시 사이 출구 문항 중복 0', () => { const all = []; KEYS.forEach(k => L[k].slides[15].data.items.forEach(i => all.push(norm(i.q)))); ok(new Set(all).size === all.length, '중복'); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 모두 고르기 표시', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬');
  if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄');
  if (s.block === 'basic_problem' && s.data.multi) { ok(/multi-hint|pv3-multi/.test(r.body), s.id + ' 모두 고르기 안내'); ok((r.body.match(/class="mk">☐|class="mk">☑/g) || []).length === s.data.options.length, s.id + ' 체크 칸'); if (rev) ok((r.body.match(/opt ok/g) || []).length === s.data.options.filter(o => o.correct).length, s.id + ' 열림 정답 수'); }
  if (s.block === 'basic_problem' && !s.data.multi && s.data.options && rev) ok((r.body.match(/opt ok/g) || []).length === 1, s.id + ' 열림 정답 1'); })); }));
T('2세대 꼴 — 개념 장 cv2 · 문제 장 pv3·pa2·ch2', () => KEYS.forEach(k => { const les = L[k]; les.slides.slice(3, 7).forEach((s, j) => { const r = render(s, les, false); ok(/cv2/.test(r.cls || ''), k + ' concept s' + (j + 4) + ' cls ' + r.cls); }); les.slides.slice(8, 11).forEach((s, j) => { const r = render(s, les, false); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), k + ' basic s' + (j + 9) + ' cls ' + r.cls); }); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id)); }));

console.log('═══ K. 발문 ═══');
T('발문 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch !== undefined && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합 — 차시 분의 0.75~1.1배(80분 60~88 · 40분 30~44 · 120분 90~132) · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); const D = L[k].meta.duration_min; ok(m >= D * 0.75 && m <= D * 1.1, k + ' ' + m + '분/' + D); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
const vis = (s) => JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
/* 199차 원문 실측 첫 등장(재료 JSON 전수 · 장 머리표 tag 뺌) — l02 토의 절차·질문 갈래·호연이네 인물 · l04 현관·효주 · l06 방과 후·쪽지·짜임·제목 · l07 정류장·여원 · l09 수돗가·개요·선재 · l11 안건·놀잇감 · l13 겹받침·띄어 쓰기·낱말 관계
   (토의·제안·자치회·화분·미세 먼지는 l01 원문에 먼저 있어 가드 불가) */
const FIRST = [['사회자', 'u3_l02'], ['학급 문고', 'u3_l02'], ['스티커', 'u3_l02'], ['기준', 'u3_l02'], ['절차', 'u3_l02'], ['문턱', 'u3_l02'], ['색연필', 'u3_l02'], ['결과', 'u3_l02'], ['어려움', 'u3_l02'], ['실천 방법', 'u3_l02'], ['호연', 'u3_l02'], ['이솔', 'u3_l02'], ['유건', 'u3_l02'], ['결정', 'u3_l02'], ['질문', 'u3_l02'], ['존중', 'u3_l02'], ['현관', 'u3_l04'], ['우산', 'u3_l04'], ['발판', 'u3_l04'], ['음수대', 'u3_l04'], ['효주', 'u3_l04'], ['방과 후', 'u3_l06'], ['쪽지', 'u3_l06'], ['아정', 'u3_l06'], ['짜임', 'u3_l06'], ['제목', 'u3_l06'], ['정류장', 'u3_l07'], ['안내판', 'u3_l07'], ['일기', 'u3_l07'], ['시청', 'u3_l07'], ['여원', 'u3_l07'], ['도서관', 'u3_l07'], ['할머니', 'u3_l07'], ['그네', 'u3_l07'], ['수돗가', 'u3_l09'], ['개요', 'u3_l09'], ['비누', 'u3_l09'], ['세균', 'u3_l09'], ['반납함', 'u3_l09'], ['선재', 'u3_l09'], ['확인한 사실', 'u3_l09'], ['안건', 'u3_l11'], ['운동회', 'u3_l11'], ['놀잇감', 'u3_l11'], ['모래시계', 'u3_l11'], ['누리집', 'u3_l11'], ['겹받침', 'u3_l13'], ['띄어 쓰', 'u3_l13'], ['반대', 'u3_l13'], ['포함', 'u3_l13'], ['맑다', 'u3_l13'], ['흙길', 'u3_l13'], ['닭장', 'u3_l13']];
const srcTxt = (k) => JSON.stringify(Object.assign({}, SRC[k], { file: undefined, slides: SRC[k].slides.map(x => Object.assign({}, x, { tag: undefined })) }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (vis(s).indexOf(w0) < 0) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(KEYS.slice(i0).some(k => L[k].slides.some(s => vis(s).indexOf(w0) >= 0)), '「' + w0 + '」 한 번도 안 나옴'); }));
T('선행 검사기 자체 확인 — l11 이전 장에 「안건」을 심으면 잡는다', () => { const s = L.u3_l07.slides[3]; const keep = s.data.content; s.data.content = keep + ' 안건'; let caught = false; try { KEYS.slice(0, 6).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('안건') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('선행 용어 첫 등장 차시 = 원문도 같은 차례(원문에서 그 앞 차시 0 · 그 차시에 있음)', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const has = srcTxt(k).indexOf(w0) >= 0; if (i < i0) ok(!has, '원문 ' + k + ' 에 「' + w0 + '」'); if (i === i0) ok(has, '원문 ' + k0 + ' 에 「' + w0 + '」 없음'); }); }));
T('「다음 시간엔」 미리보기에 다음 차시 선행 용어 0', () => KEYS.forEach((k, i) => { if (i === KEYS.length - 1) return; const nx = L[k].slides[18].data.preview; FIRST.filter(f => f[1] === KEYS[i + 1]).forEach(([w]) => ok(nx.indexOf(w) < 0, k + ' 미리보기에 「' + w + '」')); }));

console.log('═══ M. 인물 ═══');
/* 199차 이야기 인물: 받침 없음 곰이·펭이·성주·희수·효주·온하·솔비·선재 → +이가/이는/이를/아 틀림 · 받침 있음 한빛·예슬·새론·호연·초은·이솔·유건·하랑·석진·아정·여원 → +가/는/를/야 틀림(새론이가·아정이와 꼴이 맞음). 학생 화면·발문·extras·재료·원문 HTML 전수 */
T('이야기 인물 이름 조사 — 받침 없는 이름+이가/이는/이를/아 0 · 받침 있는 이름+가/는/를/야 0 · 검사기 자체 확인', () => { const bad = /(곰이|펭이|성주|희수|효주|온하|솔비|선재)(이가|이는|이를|아)(?![가-힣])|(한빛|예슬|새론|호연|초은|이솔|유건|하랑|석진|아정|여원)(가|는|를|야)(?![가-힣])/; ok(bad.test('곰이이가 왔다') && bad.test('펭이아!') && bad.test('여원는') && bad.test('아정가') && bad.test('선재이는'), '검사기 잡기'); ok(!bad.test('곰이가 · 펭아 · 새론이가 · 여원이는 · 아정이의 · 선재가 · 선재는 · 유건아'), '검사기 정상 꼴'); KEYS.forEach(k => ok(!bad.test(JSON.stringify(L[k])), k + ' 이름 조사')); ok(!bad.test(JSON.stringify(SRC)), '재료 이름 조사'); fs.readdirSync(SD).filter(f => /\.html$/.test(f)).forEach(f => ok(!bad.test(fs.readFileSync(path.join(SD, f), 'utf8')), f + ' 원문 이름 조사')); ok(/새론/.test(JSON.stringify(L.u3_l01)) && /이솔/.test(JSON.stringify(L.u3_l02)) && /효주/.test(JSON.stringify(L.u3_l04)) && /아정/.test(JSON.stringify(L.u3_l06)) && /여원/.test(JSON.stringify(L.u3_l07)) && /선재/.test(JSON.stringify(L.u3_l09)) && /유건/.test(JSON.stringify(L.u3_l11)), '이야기 인물 실존'); });
T('곰이·펭이 서사 = motivate 장에 두 인물', () => KEYS.forEach(k => { const m = L[k].slides[2].data; ok(m.kids.length === 2 && /곰이/.test(m.kids[0].label) && /펭이/.test(m.kids[1].label), k + ' kids'); }));

console.log('═══ N. 저작권 · 차단 어휘 ═══');
/* 199차: 글 판은 자기주도 원문이 새로 쓴 글(새론·아정·여원의 제안하는 글 · 호연이네 토의 장면 · 효주네 의견 · 여원 일기 · 선재 계획 · 의견 쪽지)뿐 — 작가 작품·노래 글 판 0. */
const ALL = JSON.stringify(L);
const NREAD = { u3_l01: 1, u3_l02: 3, u3_l04: 2, u3_l06: 1, u3_l07: 3, u3_l09: 3, u3_l11: 1, u3_l13: 0 };
T('작품 글 판 0 — 원문 글 판 수(1·3·2·1·3·3·1·0) · 제목 「글)」·「시)」 꼴 0 · 글 판 줄 6 이하', () => KEYS.forEach(k => { const r = SRC[k].slides.filter(x => x.kind === 'read'); ok(r.length === NREAD[k], k + ' 글 판 ' + r.length); r.forEach(x => { ok(!/(글|시|노래)\)/.test(x.t), k + ' ' + x.t); ok(x.lines.length <= 6, k + ' 줄 ' + x.lines.length); }); }));
T('겹낫표『』 는 학생 화면에 0', () => KEYS.forEach(k => L[k].slides.forEach(s => ok(!/[『』]/.test(vis(s)), k + ' ' + s.id))));
T('차단 어휘 0 — 박음·빵꾸·갈아엎·결로·박수(→손뼉) · 「결」은 해결·결정·결과·결석 안에서만', () => { ['박음', '빵꾸', '갈아엎', '결로', '박수'].forEach(w => ok(ALL.indexOf(w) < 0, '「' + w + '」')); const left = ALL.replace(OKG, ''); const at = left.indexOf('결'); ok(at < 0, '교과 낱말 아닌 「결」 … ' + left.slice(Math.max(0, at - 12), at + 6)); });
console.log('\n게이트 g4s2 국어 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
