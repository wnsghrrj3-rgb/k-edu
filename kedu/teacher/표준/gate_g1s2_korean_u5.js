/* gate_g1s2_korean_u5.js — 1학년 2학기 국어 5단원 「생각을 키워요」 케이티처 2세대 게이트 (132차, 베프 — u4 게이트 복제 + 5단원 맞춤).
   2세대 무대(stage2.js renderSlide)로 실렌더한다. 국어라 산수 검산 대신 원문 계승·정답 표시·선행 용어·인물 조사를 전수 본다.
   A 로드·meta(7 묶음 키 = 원문 파일 1:1 · l03 단독 40분 + 6묶음 80분 = 520분 · grade 1 · term 2 · 학습 목표 = 원문) · B 19장 골격 · C 7요소 · D 복습 계보(g1s2_korean u4_l14 → l01 → … → l12)
   E 정답 표시(하나 고르기 = 원문 정답 · 모두 고르기 = 원문 hit 그대로(보기 3~6) · 짝 잇기 = 원문 짝 전부 · 종류 합 21) · 수준별·출구
   F 원문 계승(개념 말풍선 = 원문 글(점검 줄 포함) · 글 판 = 원문 줄 · 따라 쓰기 장 1 = 원문 HTML trace 칸 · 기본 문제 = 원문 문항 · 정리 = 원문 정리 줄(l10 은 recap 없음 → 원문 점검 줄) · 잇기 그림 = 원문 짝)
   G 그림 렌더 · H 중복 0 · I 실렌더 + 1인 흐름 + 모두 고르기 표시 · J extras 22 · K 발문 6장↑·분 합 = 차시 분의 0.75~1.1배 · L 선행 용어(원문도 같은 차례) · M 인물 조사 · N 저작권·차단 어휘
   133차: 재료 = 지도서·교과서 기준 v2(핸드오프 g1_2_u5/v2_slides.py) — L·M·N 을 v2 원문에 맞춤.
   실행: NODE_PATH=<jsdom 있는 node_modules> node kedu/teacher/표준/gate_g1s2_korean_u5.js */
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
const L = load(path.join(TDIR, 'data/g1s2_korean_u5.js'));
const PREV = load(path.join(TDIR, 'data/g1s2_korean_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_korean_u5.json'), 'utf8'));
const KEYS = ['u5_l01', 'u5_l03', 'u5_l04', 'u5_l06', 'u5_l08', 'u5_l10', 'u5_l12'];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '생각을 키워요';
const SD = path.join(TDIR, '..', '..', 'grade1/semester2/korean/5단원_생각을키워요');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
/* 따라 쓰기 장 1(l12 s11 연필·한글·항아리·한장)의 칸 — 생성기와 같은 길(trace-row 쪼개기)로 원문 HTML 에서 읽는다 */
const TRACE_AT = { u5_l12: 11 };
const TRACE = {}; Object.keys(TRACE_AT).forEach(k => { const h = fs.readFileSync(path.join(SD, SRC[k].file), 'utf8'); TRACE[k] = h.split('<div class="trace-row">').slice(1).map(row => (row.match(/class="trace-cell">([^<]*)</g) || []).map(c => c.replace(/^class="trace-cell">/, '').replace(/<$/, '')).join('')); });

console.log('═══ A. 로드 ═══');
T('7차시 키(원문 묶음 1:1 = 첫 차시 번호 · 원문 파일 7 = 13차시분)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 1학년 2학기 · unit 4 · unit_title · covers·분 = 원문 파일 · 성취기준 [2국…] · 학습 목표 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = SRC[k].covers;
  ok(m.grade === 1 && m.term === 2 && m.unit === 5 && m.unit_title === UT && m.subject === '국어' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] === 1 ? '·' : '~') + c[1] + '차시'), k + ' covers');
  ok(/^(\[2국0\d-0\d\])+$|^단원 전체 통합$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal && m.goal && !/=/.test(m.goal), k + ' 학습 목표 ' + m.goal);
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('l03 단독 40분 + 묶음 여섯 80분(1·2 / 4·5 / 6·7 / 8·9 / 10·11 / 12·13) · 합 520분', () => { ok(KEYS.every(k => k === 'u5_l03' ? L[k].meta.duration_min === 40 && L[k].meta.covers === '3차시' : L[k].meta.duration_min === 80 && L[k].meta.covers === L[k].meta.n + '·' + (L[k].meta.n + 1) + '차시'), '분 묶음'); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 520, '합'); });
T('학습 목표 7 = 원문 머리 주석 목표 · 빈 값 0', () => { const G = { u5_l01: '배울 내용을 살펴볼 수 있다.', u5_l03: '한글을 소중히 여길 수 있다.', u5_l04: '글자에 관심을 가질 수 있다.', u5_l06: '책에 흥미를 가질 수 있다.', u5_l08: '글을 읽고 생각이나 느낌을 나눌 수 있다.', u5_l10: '배운 내용을 실천할 수 있다.', u5_l12: '배운 내용을 마무리할 수 있다.' }; KEYS.forEach(k => ok(L[k].meta.goal === G[k], k + ' ' + L[k].meta.goal)); });
T('따라 쓰기 칸(원문 HTML trace) l12 낱말 4(연필·한글·항아리·한장) 실존', () => { ok(TRACE.u5_l12.length === 4 && TRACE.u5_l12.join() === '연필,한글,항아리,한장', 'l12 ' + TRACE.u5_l12.join(',')); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex14 = PREV.u4_l14.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4단원 g1s2_korean u4_l14') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex14;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g1s2_korean:u4_l14'), 'from ' + rv.from); ok(rv.items.length === 3, '문항 3'); }));

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
T('기본 문제 종류 — 하나 고르기 ' + nPick + ' · 모두 고르기 ' + nCol + ' · 짝 ' + nMatch + ' (셋 다 쓰임 · 7묶음 × 3 = 21)', () => ok(nPick >= 5 && nCol >= 4 && nMatch >= 3 && nPick + nCol + nMatch === 21, nPick + '/' + nCol + '/' + nMatch));

console.log('═══ F. 원문 계승 ═══');
function srcContent(sl) { if (sl.kind === 'recap') return sl.items.join('\n'); if (sl.kind === 'stage') return [sl.text, sl.stage].filter(Boolean).join('\n'); if (!sl.text && sl.extra) return sl.extra.join('\n'); return sl.text || ''; }
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 장(말풍선·글 판·정리 줄·점검 줄·따라 쓰기 칸) · 문항 = 원문 · 정리 = 원문 정리 줄', () => { const src = SRC[k];
  const used = new Set();
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && !sl.log, s.id + ' 원문 개념 장 아님'); ok(!used.has(s.src), s.id + ' 같은 원문 장 두 번'); used.add(s.src); ok(d.title === nb(sl.t), s.id + ' 제목 ' + d.title);
    if (sl.kind === 'read') { ok(d.fig.k === 'text' && d.fig.lines.length === sl.lines.length, s.id + ' 글 판 줄 수'); d.fig.lines.forEach((l, i) => ok(norm(typeof l === 'string' ? l : l.t) === norm(sl.lines[i].replace(/\n/g, ' / ')), s.id + ' 글 판 ' + (i + 1) + '줄 원문 아님')); ok(d.content && d.content.length < 90, s.id + ' 글 판 장 말풍선은 한 줄'); }
    else if (!srcContent(sl)) { ok(TRACE_AT[k] === s.src && /따라 써/.test(sl.t || ''), s.id + ' 글 없는 원문 장은 따라 쓰기 장뿐'); ok(d.content === '따라 쓰기: ' + TRACE[k].join(' · '), s.id + ' 글씨 쓰기 낱말 ≠ 원문 ' + d.content); ok(d.fig.k === 'tools' && d.fig.items.map(x => x.name).join() === TRACE[k].join(), s.id + ' 글씨 카드 = 원문 낱말'); }
    else { ok(norm(d.content) === norm(srcContent(sl)) && d.content, s.id + ' 말풍선 원문 아님'); } });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.slides[s.src].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; const rc = src.slides.filter(x => x.kind === 'recap');
  /* 133차 v2: l12 원문 마지막 장 = 스스로 점검 → 정리 줄 = 원문 점검 장(s12) 줄(✓·** 뗌). 나머지는 원문 마지막 recap 장 줄 */
  if (k === 'u5_l12') { const c = src.slides[12].extra.map(x => nb(x.replace(/^✓/, ''))); ok(c.length === 3 && c.every((it, i) => sm[i] === it), '정리 줄 ≠ 원문 점검 줄'); }
  else { const last = src.slides[12]; ok(last.kind === 'recap' && last.items.every((it, i) => sm[i] === it), '정리 줄 ≠ 원문 마지막 정리 장'); ok(rc.length >= 1, 'recap 0'); } }));
T('잇기 그림(link) 줄 = 같은 차시 원문 짝 잇기 그대로', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.data.fig && s.data.fig.k === 'link').forEach(s => { n++; ok(SRC[k].slides.some(x => x.kind === 'match' && JSON.stringify(x.pairs) === JSON.stringify(s.data.fig.rows)), k + ' ' + s.id); })); ok(n >= 2, 'link ' + n); });
T('원문 문항 전부의 짝이 맞다(짝 잇기 원문 자체 확인 — 2~4짝 · 왼쪽·오른쪽 겹침 0)', () => KEYS.forEach(k => SRC[k].slides.filter(x => x.kind === 'match').forEach(x => { const n = x.pairs.length; ok(n >= 2 && n <= 4, k + ' ' + x.t); ok(new Set(x.pairs.map(p => p[0])).size === n && new Set(x.pairs.map(p => p[1])).size === n, k + ' 겹침'); })));
T('mood(인물 말풍선) 그림 0 — 원문에 인물 말 줄이 없다', () => KEYS.forEach(k => L[k].slides.forEach(s => ok(!(s.data.fig && s.data.fig.k === 'mood'), k + ' ' + s.id))));

console.log('═══ G. 그림 ═══');
const KO = ['text', 'sort2', 'sound', 'tools', 'chain', 'link', 'note'];
KEYS.forEach(k => T(k + ' 개념 4장 국어 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && KO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => ok(!/\*\*/.test(it.name), s.id + ' 카드 ** ' + it.name));
  if (f.k === 'sound') ok(f.items && f.items.length === 4 && f.items.every(it => it.w && it.s), s.id + ' 소리 짝'); })));
T('부품 가짓수 ≥ 6 (글 판·두 갈래·카드·차례·잇기·메모)', () => { const set = new Set(); KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && set.add(s.data.fig.k))); ok(set.size >= 6, [...set].join(',')); });

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
T('발문 분 합 — 차시 분의 0.75~1.1배(80분 60~88 · 40분 30~44) · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); const D = L[k].meta.duration_min; ok(m >= D * 0.75 && m <= D * 1.1, k + ' ' + m + '분/' + D); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
const vis = (s) => JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
/* 133차 v2 원문 실측 첫 등장(재료 JSON 전수): 세종 l03 · 동키·몽키 l06 · 훌라후프 l08 · 계단 l10 · 다람쥐·켤레 l12 */
const FIRST = [['세종', 'u5_l03'], ['동키', 'u5_l06'], ['몽키', 'u5_l06'], ['훌라후프', 'u5_l08'], ['계단', 'u5_l10'], ['다람쥐', 'u5_l12'], ['켤레', 'u5_l12']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (vis(s).indexOf(w0) < 0) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(KEYS.slice(i0).some(k => L[k].slides.some(s => vis(s).indexOf(w0) >= 0)), '「' + w0 + '」 한 번도 안 나옴'); }));
T('선행 검사기 자체 확인 — l08 이전 장에 「훌라후프」를 심으면 잡는다', () => { const s = L.u5_l03.slides[3]; const keep = s.data.content; s.data.content = keep + ' 훌라후프'; let caught = false; try { KEYS.slice(0, 4).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('훌라후프') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('선행 용어 첫 등장 차시 = 원문도 같은 차례(원문에서 그 앞 차시 0 · 그 차시에 있음)', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const has = JSON.stringify(Object.assign({}, SRC[k], { file: undefined })).indexOf(w0) >= 0; if (i < i0) ok(!has, '원문 ' + k + ' 에 「' + w0 + '」'); if (i === i0) ok(has, '원문 ' + k0 + ' 에 「' + w0 + '」 없음'); }); }));
T('「다음 시간엔」 미리보기에 다음 차시 선행 용어 0', () => KEYS.forEach((k, i) => { if (i === KEYS.length - 1) return; const nx = L[k].slides[18].data.preview; FIRST.filter(f => f[1] === KEYS[i + 1]).forEach(([w]) => ok(nx.indexOf(w) < 0, k + ' 미리보기에 「' + w + '」')); }));

console.log('═══ M. 인물 ═══');
/* 이야기 인물: 동키·몽키·곰이·펭이(모두 받침 없음 → 이가/이는/이를/아 틀림). 이름 조사 틀림 0 을 학생 화면·발문·extras·재료·원문 HTML 전수 */
T('이야기 인물 이름 조사 — 동키·몽키·곰이·펭이+이가/이는/이를/아 0 · 검사기 자체 확인', () => { const bad = /(동키|몽키|곰이|펭이)(이가|이는|이를|아)(?![가-힣])/; ok(bad.test('동키이가 왔다') && bad.test('몽키아!') && bad.test('곰이이가'), '검사기 잡기'); ok(!bad.test('동키가 · 몽키는 · 동키야 · 곰이가 · 펭이야'), '검사기 정상 꼴'); KEYS.forEach(k => ok(!bad.test(JSON.stringify(L[k])), k + ' 이름 조사')); ok(!bad.test(JSON.stringify(SRC)), '재료 이름 조사'); fs.readdirSync(SD).filter(f => /\.html$/.test(f)).forEach(f => ok(!bad.test(fs.readFileSync(path.join(SD, f), 'utf8')), f + ' 원문 이름 조사')); ok(/동키/.test(JSON.stringify(L.u5_l06)) && /훌라후프/.test(JSON.stringify(L.u5_l08)), '이야기 인물 실존'); });
T('곰이·펭이 서사 = motivate 장에 두 인물', () => KEYS.forEach(k => { const m = L[k].slides[2].data; ok(m.kids.length === 2 && /곰이/.test(m.kids[0].label) && /펭이/.test(m.kids[1].label), k + ' kids'); }));

console.log('═══ N. 저작권 · 차단 어휘 ═══');
/* 133차 v2: 작가 작품 「그래, 책이야!」(레인 스미스 글·그림, 김경연 옮김)는 원문이 간추림만 싣는다 — 원작 대사(교과서 154~165쪽) 0. 작품 출처 표시는 l06 표지 장 한 곳. 그 밖의 제재(책 제목·훌라후프 글·안내판)는 교육부 자료. */
const ALL = JSON.stringify(L);
const ORIG = ['스크롤 안 해', '한 장 한 장 넘기면', '이건 책이거든', '스크롤은 어떻게 해', '게임할 수 있어', '책인걸', '메일 보낼 수 있어', '와이파이는?', '이렇게 할 수 있어', '책으로는 뭘 할 수 있어', '비밀번호 있어야 해', '별명이 있어야 해', '책이라니까', '이제 내 책 돌려줄래', '다 보면 충전해 놓을게', '충전할 필요 없어'];
T('작가 작품 원작 대사 0 — 재료·자기주도 원문·케이티처 전수(' + ORIG.length + '줄)', () => { const srcAll = JSON.stringify(SRC); const html = fs.readdirSync(SD).filter(f => /\.html$/.test(f)).map(f => fs.readFileSync(path.join(SD, f), 'utf8')).join(''); ORIG.forEach(o => { ok(srcAll.indexOf(o) < 0, '재료 「' + o + '」'); ok(html.indexOf(o) < 0, '원문 「' + o + '」'); ok(ALL.indexOf(o) < 0, '케이티처 「' + o + '」'); }); });
T('작품 출처 표시(옮김) = 재료 l06 표지 장 한 곳', () => { const hits = []; KEYS.forEach(k => SRC[k].slides.forEach((x, i) => { if (/옮김|옮긴이|지은이/.test(JSON.stringify(x))) hits.push(k + ' s' + i); })); ok(hits.length === 1 && hits[0] === 'u5_l06 s0', hits.join(',')); });
T('겹낫표『』 는 학생 화면에 0', () => KEYS.forEach(k => L[k].slides.forEach(s => ok(!/[『』]/.test(vis(s)), k + ' ' + s.id))));
T('차단 어휘 0 — 박음·빵꾸·갈아엎·결로·박수(→손뼉)', () => ['박음', '빵꾸', '갈아엎', '결로', '박수'].forEach(w => ok(ALL.indexOf(w) < 0, '「' + w + '」')));
console.log('\n게이트 g1s2 국어 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
