/* gate_g4s2_social_u1.js — 4학년 2학기 사회 1단원 「민주주의와 자치」 케이티처 2세대 게이트 (208차, 베프) · 4-1 사회 3단원 게이트(gate_g4_social_u3.js) 꼴.
   재료 = 자기주도 사회 4-2 1단원 l01~l11 → src_g4s2_social_u1.json(parse_selfdirected_soc4s2.js). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(지도서 1~16차시 빈틈 0 · 키 = 차시 첫 번호 · 원문 머리 「N(~M)차시(lXX)」와 같음 — l01 만 단원 도입 1차시를 더함 · 성취기준 = 원문)
   B 19장 · C 7요소 · D 계보(4-1 사회 u3_l13 → u1_l01 → … → u1_l14)
   E 정답 · F 원문 계승(동기 = 원문 0번 장 제목, u1_l03 은 2번 · 판 장 = 원문 3번, u1_l14 는 6번 · 카드 이름·아래 줄 = 원문 장 글 토막)
   G 그림(판 부품 = groups 7·chain 1·then 2·tools 1) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문·분(40분 30~45 · 80분 60~88 · 120분 90~130)
   L 선행 용어(원문 첫 등장 차시 전 학생 화면 0 · 원문도 같은 차례) · M 판 대조(원문 판의 표 ↔ 판 그림 + 뜻 규칙으로 따로 셈)
   N 차단 어휘 — 생성기 T 표 「결」 0 · 데이터의 「결」 낱말은 모두 원문(교과 문장·판 글)에 있는 낱말 · 박음·빵꾸·갈아엎·결로 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_social_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g4s2_social_u1.js'));
const PREV = load(path.join(TDIR, 'data/g4_social_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u1.json'), 'utf8'));
const KEYS = ['u1_l01', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l07', 'u1_l08', 'u1_l09', 'u1_l10', 'u1_l11', 'u1_l13', 'u1_l14'];
const COV = { u1_l01: [1, 2], u1_l03: [3], u1_l04: [4], u1_l05: [5, 6], u1_l07: [7], u1_l08: [8], u1_l09: [9], u1_l10: [10], u1_l11: [11, 12], u1_l13: [13], u1_l14: [14, 15, 16] };
const FILEK = { u1_l01: 'u1_l01', u1_l03: 'u1_l02', u1_l04: 'u1_l03', u1_l05: 'u1_l04', u1_l07: 'u1_l05', u1_l08: 'u1_l06', u1_l09: 'u1_l07', u1_l10: 'u1_l08', u1_l11: 'u1_l09', u1_l13: 'u1_l10', u1_l14: 'u1_l11' };
const STD = { u1_l08: '[4사08-02][4사08-01]', u1_l14: '[4사08-01][4사08-02]' };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '민주주의와 자치';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const EMO = /[\u{1F000}-\u{1FFFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u20E3]/gu;
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const plain = (s) => nb(s).replace(EMO, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const SLI = (k, i) => SRC[k].slides.find(x => x.i === i);
const BD = (k) => SRC[k].board_data;
const con = (k) => L[k].slides.filter(s => s.block === 'concept');
const BI = (k) => (k === 'u1_l14' ? 6 : 3);
const ASK = (k) => ({ u1_l03: 2 })[k] || 0;
const SAY = (sl) => sl.bub || sl.answer.join(' ') || sl.items.map(nb).join(' ');
const board = (k) => con(k).find(s => s.src === BI(k));
const slideText = (sl) => nb([sl.title, sl.bub, sl.note, sl.answer.join(' '), sl.items.join(' '), sl.scene.join(' ')].join(' '));
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };
const SRCDIR = path.join(ROOT, 'grade4/semester2/social/1단원_민주주의와자치');

console.log('═══ A. 로드 ═══');
T('11키(지도서 차시 첫 번호) · 재료 키와 같음', () => { ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')); ok(JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), '재료 키'); });
T('meta: 4학년 2학기 사회 · unit 1 · covers · 분 = 40 × 차시 수 · 성취기준 = 원문 · 제목 = 원문 <title> · live_url 실파일 · 원문 파일 키', () => KEYS.forEach(k => { const m = L[k].meta, c = COV[k];
  ok(m.grade === 4 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 1 ? c[0] + '차시' : c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '~' + c[2] + '차시'), k + ' covers ' + m.covers); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(m.std === SRC[k].std && m.std === (STD[k] || (+k.slice(-2) <= 7 ? '[4사08-01]' : '[4사08-02]')), k + ' std ' + m.std); ok(m.title === nb(SRC[k].title) && m.title.length > 4 && !/사회 4-2/.test(m.title), k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); ok(SRC[k].file_key === FILEK[k] && m.live_url.indexOf('_' + FILEK[k] + '_') > 0, k + ' 원문 파일 ' + SRC[k].file_key); }));
T('지도서 1~16차시 빈틈 0 · 80분 = l01·l05·l11 · 120분 = l14 · 원문 머리 「N(~M)차시(lXX)」와 같음(l01 만 단원 도입 1차시를 더함)', () => { const all = [].concat(...KEYS.map(k => COV[k])); ok(all.join() === Array.from({ length: 16 }, (_, i) => i + 1).join(), all.join());
  ok(KEYS.filter(k => COV[k].length === 2).join() === 'u1_l01,u1_l05,u1_l11' && KEYS.filter(k => COV[k].length === 3).join() === 'u1_l14', '묶음');
  KEYS.forEach(k => { ok(JSON.stringify(SRC[k].covers) === JSON.stringify(COV[k]), k + ' 재료 covers'); const f = fs.readdirSync(SRCDIR).find(x => x.indexOf('_' + FILEK[k] + '_') > 0); const m = fs.readFileSync(path.join(SRCDIR, f), 'utf8').slice(0, 600).match(/(\d+)(?:~(\d+))?차시\(l\d+/); ok(m, k + ' 머리 주석');
    const a = +m[1], z = m[2] ? +m[2] : a, c = COV[k]; if (k === 'u1_l01') ok(a === 2 && z === 2 && c.join() === '1,2', 'l01 = 단원 도입 1 + 원문 2'); else ok(a === c[0] && z === c[c.length - 1], k + ' 머리 ' + m[0]); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u3_l13.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-1 사회 u3_l13') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_social:u3_l13'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 0번(u1_l03 은 2번) 장 제목 · 개념 제목 = 원문 · 말풍선 = 원문 말풍선(없으면 답 상자 · 목록 줄) · 카드 이름·아래 줄 = 원문 장 글 토막 · 판 장 = 교사 한 줄', () => {
  const ask = SLI(k, ASK(k)); ok(ask && ask.kind !== 'board' && /[?？]$/.test(nb(ask.title)), '동기 장 꼴 · 물음'); if (!ASK(k)) ok(ask.kind === 'intro', '0번 = 생각 열기'); const mo = L[k].slides[2]; ok(mo.data.question === plain(ask.title) && mo.src === ask.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (s.src === BI(k)) { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === SAY(sl) && d.content, s.id + ' 말풍선 ≠ 원문'); const txt = slideText(sl); const f = d.fig;
    ok(f.k === 'tools' || f.k === 'chain', s.id + ' 부품 ' + f.k); ok(f.items.length >= 3, s.id + ' 카드 수'); f.items.forEach(it => { ok(txt.indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 문항의 틀린 보기 ↔ 그 문항 정답 · 정리 = 원문 정리 줄 · 돌아보기 = 원문 · 다음 = 원문 끝 장', () => { const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)];
  ok(m.data.right === q.opts[q.ci], '바른 생각'); ok(q.opts.indexOf(m.data.wrong) >= 0 && m.data.wrong !== m.data.right, '틀린 생각'); ok(!/아닌 것|알맞지 않은/.test(q.t), '「아닌 것」 문항을 오개념으로 쓰지 않음');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length >= 3, '정리');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  const pv = L[k].slides[18].data.preview; if (k === 'u1_l14') ok(pv === nb(SRC[k].end_note) + ' ' + nb(SRC[k].next) && /지역문제/.test(pv) && L[k].slides[18].data.title === '다음 단원엔', '다음 단원'); else ok(pv === nb(SRC[k].next) && /^다음 시간/.test(pv), '다음 ≠ 원문'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'groups', 'link', 'then'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('판 부품 = groups 7(l01·l04·l05·l07·l09·l10·l11)·chain 1(l03)·then 2(l08·l13)·tools 1(l14) · 판 장 = 원문 3번(l14 는 6번) · 원문 그 장이 직접조작 판(l01 은 「자리를 눌러」 장)', () => { const bc = {}; KEYS.forEach(k => { const b = board(k); ok(b, k + ' 판 장'); const sl = SLI(k, BI(k)); ok(k === 'u1_l01' ? sl.kind === 'concept' && /눌러/.test(sl.title) && SRC[k].slides.filter(x => x.kind === 'board').length === 0 : sl.kind === 'board' && SRC[k].slides.filter(x => x.kind === 'board').length === 1, k + ' 원문 판'); bc[b.data.fig.k] = (bc[b.data.fig.k] || []).concat(k.slice(-3)); });
  ok(JSON.stringify(bc) === JSON.stringify({ groups: ['l01', 'l04', 'l05', 'l07', 'l09', 'l10', 'l11'], chain: ['l03'], then: ['l08', 'l13'], tools: ['l14'] }), JSON.stringify(bc)); });

console.log('═══ H. 중복 ═══');
KEYS.forEach(k => T(k + ' 개념 원문 장·기본 문제 문항·개념 제목 중복 0 · 판 장 1 · 오개념 문항 ∉ 기본 문제', () => { const c = con(k).map(s => s.src); ok(new Set(c).size === 4, '개념 src'); const p = L[k].slides.filter(s => s.block === 'basic_problem').map(s => s.src); ok(new Set(p).size === 3, '문항'); ok(new Set(con(k).map(s => s.data.title)).size === 4, '제목'); ok(c.filter(x => x === BI(k)).length === 1, '판 장'); ok(p.indexOf(L[k].slides[7].src) < 0, '오개념 문항'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 정답 열림', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 깨짐');
  if (s.block === 'offline_activity') ok(r.body.indexOf(s.data.solo[0]) >= 0, s.id + ' 1인 흐름'); if (s.block === 'basic_problem' && rev) ok((r.body.match(/opt ok/g) || []).length === 1, s.id + ' 정답 열림'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재 · 더 물어보기 = 기본 문제에 안 쓴 원문 문항 5 · 헷갈리는 생각 = 오개념 문항의 나머지 틀린 보기 2', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id));
  const used = L[k].slides.filter(s => s.block === 'basic_problem').map(s => +s.src.slice(1)); const qs = ex.filter(e => e.type === 'fun_question'); ok(qs.length === 5 && qs.every(e => SRC[k].problems.some((p, i) => p.t === e.content && used.indexOf(i) < 0)), '더 물어보기');
  const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)]; const xs = ex.filter(e => e.type === 'misconception'); ok(xs.length === 2 && xs.every(e => q.opts.some((o, i) => i !== q.ci && o !== m.data.wrong && e.content.indexOf(o + ' — ') === 0)), 'x'); }));

console.log('═══ K. 발문 ═══');
T('발문 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합 — 40분 30~45 · 80분 60~88 · 120분 90~130 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : d === 80 ? m >= 60 && m <= 88 : m >= 90 && m <= 130, k + ' ' + m + '/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
const FIRST = [['여론', 'u1_l03'], ['타협', 'u1_l03'], ['학생 참여 예산제', 'u1_l04'], ['서명 운동', 'u1_l05'], ['설문조사', 'u1_l05'], ['주민 자치회', 'u1_l08'], ['주민 참여', 'u1_l08'], ['관광 두레', 'u1_l09'], ['돌봄 로봇', 'u1_l09'], ['공공 기관', 'u1_l10'], ['공청회', 'u1_l10'], ['시민 단체', 'u1_l10'], ['주민 투표', 'u1_l10'], ['조사 보고서', 'u1_l11'], ['생활 실험실', 'u1_l11'], ['바둑알', 'u1_l14']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — u1_l03 개념 장에 「공청회」를 심으면 잡는다', () => { const s = L.u1_l03.slides[3]; const keep = s.data.content; s.data.content = keep + ' 공청회'; let caught = false; try { KEYS.slice(0, 7).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('공청회') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 끝 장을 뺀 원문 글에서 첫 등장 = 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'end').map(x => [x.title, x.bub, x.answer, x.items, x.note, x.scene])) + JSON.stringify(SRC[k].problems); if (i < i0) ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); if (i === i0) ok(txt.indexOf(w0) >= 0, k0 + ' 원문에 없음 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
const names = (arr) => arr.map(x => x.name).join('|');
T('l01 의견함 — 첫 판 = OP_FEW 비트 자리(둘) · 둘째 판 = 여섯 자리 모두 · 자리·의견 = OP_SEAT·OP_IDEA 차례 · 「반영된 의견 n / 6」 = 따로 센 수 · 문항 5 정답 = 반영된 의견의 수', () => { const b = BD('u1_l01'), f = fig('u1_l01'); ok(f.k === 'groups' && f.bins.length === 2);
  const open1 = b.OP_SEAT.map((s, i) => i).filter(i => b.OP_FEW & (1 << i)); ok(open1.length === 2 && /두 사람/.test(SLI('u1_l01', 3).bub), '첫 판 둘'); ok(names(f.bins[0].items) === open1.map(i => b.OP_SEAT[i] + ' ' + b.OP_IDEA[i]).join('|'), '첫 판 자리');
  ok(names(f.bins[1].items) === b.OP_SEAT.map((s, i) => s + ' ' + b.OP_IDEA[i]).join('|') && b.OP_N === 6 && /여섯 사람/.test(SLI('u1_l01', 2).bub), '둘째 판 여섯'); ok(f.bins[0].hint.indexOf('2 / 6') >= 0 && f.bins[1].hint.indexOf('6 / 6') >= 0, '반영 수'); ok(qa('u1_l01', 4) === '반영된 의견의 수', '문항 5'); });
T('l02 회의 — chain 다섯 = TD_WHO 차례 · 아래 줄 = TD_NOTE · 판을 못 바꾼 사람(「하나도 달라지지」) = TD_WHOQ 정답(영훈) · 고친 의견 = 지헌 의견에서(TD_FROM) · 문항 5 정답 = 「지워지지 않고」', () => { const b = BD('u1_l03'), f = fig('u1_l03'); ok(f.k === 'chain' && f.items.length === 5);
  b.TD_WHO.forEach((x, i) => ok(f.items[i].name === x && f.items[i].kind === plain(b.TD_NOTE[i]), x)); const still = b.TD_WHO.filter((x, i) => /하나도 달라지지/.test(b.TD_NOTE[i])); ok(still.length === 1 && still[0] === b.TD_WHOQ[b.TD_WHOQ_OK] && still[0] === '영훈', '영훈');
  const fx = b.TD_FROM.findIndex(x => x !== null); ok(fx === 3 && b.TD_IDEA_BY[b.TD_FROM[fx]] === '지헌' && /하리/.test(b.TD_IDEA_BY[fx]) && /지헌이가 처음에 제안했던 의견을 수정/.test(b.TD_SAY[4]), '하리 ← 지헌'); ok(/지워지지 않고/.test(qa('u1_l03', 4)), '문항 5'); });
T('l03 사례 — groups 셋 = SC_CASE · 칸마다 세 걸음 = SC_DO_S 차례 · 걸음 수 = SC_STEP 셋 · 뜻 규칙(걸음 1 = 의견·제안 모음 · 2 = 회의·토의로 정함 · 3 = 실천·참여·설치)으로 따로 셈 · 문항 5 정답 = 세 걸음', () => { const b = BD('u1_l04'), f = fig('u1_l04'); ok(f.k === 'groups' && f.bins.length === 3 && b.SC_STEP.length === 3);
  b.SC_CASE.forEach((c, i) => { ok(f.bins[i].name === c && names(f.bins[i].items) === b.SC_DO_S[i].join('|'), c); ok(/의견|제안/.test(b.SC_DO_S[i][0]) && /정함|결정/.test(b.SC_DO_S[i][1]) && /참여|실천|설치/.test(b.SC_DO_S[i][2]), c + ' 규칙'); }); ok(/세 걸음/.test(qa('u1_l04', 4)), '문항 5'); });
T('l04 실천 — groups 둘 = LV_WAY · 칸 = LV_WAYOF · hint = LV_WAY_D · 뜻 규칙(「규칙」 방안 = 학급 회의, 바꾸는 방안 = 설문조사)으로 따로 셈 · 방안 셋 다 실림 · 문항 5 정답 = 실천은 함께', () => { const b = BD('u1_l05'), f = fig('u1_l05'); ok(f.k === 'groups' && f.bins.length === 2);
  b.LV_PLAN.forEach((p, j) => ok((/규칙/.test(p) ? 1 : 0) === b.LV_WAYOF[j], p + ' 규칙')); b.LV_WAY.forEach((x, i) => { ok(f.bins[i].name === x && f.bins[i].hint === b.LV_WAY_D[i], x); ok(names(f.bins[i].items) === b.LV_PLAN_S.map((s, j) => j).filter(j => b.LV_WAYOF[j] === i).map(j => b.LV_PLAN[j].slice(0, 1) + ' ' + b.LV_PLAN_S[j]).join('|'), x + ' 칸'); });
  ok(f.bins[0].items.length + f.bins[1].items.length === b.LV_N && b.LV_N === 3, '셋'); ok(/함께/.test(qa('u1_l05', 4)), '문항 5'); });
T('l05 계획 — groups 셋 이름 = 자리·달·목표 · 칸마다 둘 = MO_GAIN · 뜻 규칙(우정·바른 말 = 사이좋은 · 분리수거·공간 = 깨끗한 · 안전 = 안전한)으로 따로 셈 · 출구 = 「우정 표어」 짝 · 문항 5 정답 = 나란히', () => { const b = BD('u1_l07'), f = fig('u1_l07'); ok(f.k === 'groups' && f.bins.length === 3);
  const rule = (e) => /우정|바른 말/.test(e) ? 0 : /분리수거|공간/.test(e) ? 1 : /안전/.test(e) ? 2 : -1; b.MO_EVENT.forEach((e, j) => ok(rule(e) === b.MO_GAIN[j], e + ' 규칙'));
  b.MO_SEAT.forEach((s, i) => { ok(f.bins[i].name === s + ' ' + b.MO_MONTH[i] + ' · ' + b.MO_AIM[i], s); ok(f.bins[i].items.length === 2 && names(f.bins[i].items) === b.MO_EVENT_S.filter((e, j) => b.MO_GAIN[j] === i).join('|'), s + ' 칸'); });
  ok(L.u1_l07.slides[15].data.items[1].a === b.MO_EVENT[b.MO_GAIN.findIndex((g, j) => g === 0 && j !== 0)], '출구 짝'); ok(/나란히/.test(qa('u1_l07', 4)), '문항 5'); });
T('l06 바꿔 끼우기 — then 셋 = SW_SLOT 차례 · 학교 쪽 = SIDE 0 낱말 · 지역 쪽 = SIDE 1 낱말 · 뜻 규칙(학교 쪽 ⊂ 학생·학교 · 지역 쪽 ⊂ 주민·지역)으로 따로 셈 · 「일부의 사람만」(SIDE −1) 판 그림 0 · 그대로인 말 = 판 읽기 정답 · 문항 5 정답 = 같은 곳', () => { const b = BD('u1_l08'), f = fig('u1_l08'); ok(f.k === 'then' && f.rows.length === 3);
  b.SW_SLOT.forEach((s, i) => { const a = b.SW_WORD[i][b.SW_SIDE[i].indexOf(0)], z = b.SW_WORD[i][b.SW_SIDE[i].indexOf(1)]; ok(/^(학생|학교)$/.test(a) && /^(주민|지역)$/.test(z), s + ' 규칙'); ok(f.rows[i].old.name === s + ' — ' + a && f.rows[i].now.name === z, s); });
  ok(JSON.stringify(f).indexOf('일부의 사람만') < 0, '일부'); ok(f.note === plain(b.SW_READQ[b.SW_READ_OK]) && /그대로/.test(f.note), '그대로인 말'); ok(/같은 곳/.test(qa('u1_l08', 4)), '문항 5'); });
T('l07 두 가지 — groups 둘 = 활발할 때(WING 1)·활발하지 않을 때(WING 0) · 층 차례 = BR_STORY · 뜻 규칙(「어려·않」 = 활발하지 않을 때)으로 따로 셈 · 층마다 가지 하나씩 · 문항 5 정답 = 서로 반대로', () => { const b = BD('u1_l09'), f = fig('u1_l09'); ok(f.k === 'groups' && f.bins.length === 2);
  b.BR_TEXT.forEach((t, i) => ok((/어려|않/.test(t) ? 0 : 1) === b.BR_WING[i], t + ' 규칙')); [1, 0].forEach((wg, bi) => { ok(f.bins[bi].name === b.BR_TITLE[wg], '이름 ' + wg); const ix = b.BR_TAG.map((t, i) => i).filter(i => b.BR_WING[i] === wg).sort((x, y) => b.BR_STORY[x] - b.BR_STORY[y]); ok(names(f.bins[bi].items) === ix.map(i => b.BR_TAG[i]).join('|') && ix.map(i => b.BR_STORY[i]).join() === '0,1,2', '층 ' + wg); });
  ok(/참여|관심/.test(f.bins[0].items[0].name) && /활발하지 않음/.test(f.bins[1].items[0].name), '맨 아래 = 참여'); ok(/반대로/.test(qa('u1_l09', 4)), '문항 5'); });
T('l08 붙임딱지 — groups 둘 = 그림 속(WD_HOME ≥ 0) 여덟 · 그림 밖(−1) 셋 · 그림 속 자리 = 장면 여덟에 하나씩 · 그림 밖 셋 = 원문 「그림 밖에서도」 장의 서명 운동·공청회·시민 단체 · 문항 5 정답 = 더 있기 때문', () => { const b = BD('u1_l10'), f = fig('u1_l10'); ok(f.k === 'groups' && f.bins.length === 2 && b.WD_ST.length === b.WD_N);
  const inn = b.WD_HOME.filter(h => h >= 0); ok(inn.length === b.WD_P && new Set(inn).size === b.WD_SCENE.length, '장면 하나씩'); ok(names(f.bins[0].items) === b.WD_ST.filter((s, k) => b.WD_HOME[k] >= 0).join('|'), '그림 속');
  const out = b.WD_ST.filter((s, k) => b.WD_HOME[k] < 0); ok(names(f.bins[1].items) === out.join('|') && out.length === 3, '그림 밖'); const t4 = slideText(SLI('u1_l10', 4)); out.forEach(s => ok(t4.indexOf(s.replace(/ 벌이기| 참석하기|를 만들어 참여하기|에 참석하기/g, '').replace(/에$/, '')) >= 0, s + ' ⊂ 「그림 밖」 장')); ok(/더 있기/.test(qa('u1_l10', 4)), '문항 5'); });
T('l09 보고서 — groups 셋 = RP_TIME · 칸 = RP_WHEN · 뜻 규칙(날짜·모습·내용 = 조사하는 날 · 알게 된·더 알고 = 마친 뒤 · 나머지 = 전)으로 따로 셈 · 여덟 칸 · 문항 5 정답 = 조사하는 날', () => { const b = BD('u1_l11'), f = fig('u1_l11'); ok(f.k === 'groups' && f.bins.length === 3 && b.RP_ROW.length === b.RP_N);
  const rule = (r) => /날짜|모습|내용/.test(r) ? 1 : /알게 된|더 알고/.test(r) ? 2 : 0; b.RP_ROW.forEach((r, j) => ok(rule(r) === b.RP_WHEN[j], r + ' 규칙')); b.RP_TIME.forEach((t, i) => ok(f.bins[i].name === t && names(f.bins[i].items) === b.RP_ROW.filter((r, j) => b.RP_WHEN[j] === i).join('|'), t));
  ok(f.bins.reduce((a, x) => a + x.items.length, 0) === 8, '여덟'); ok(b.RP_WHEN[1] === 1 && b.RP_WHEN[2] === 0 && b.RP_WHEN[3] === 0 && /조사하는 날/.test(qa('u1_l11', 4)), '날짜가 늦게'); });
T('l10 두 장면 — then 넷 = CH_SPOT 차례 · 참여하기 전 = CH_BEFORE · 참여한 뒤 = 실천 카드가 닿은 자리(CH_DO_AT)만 CH_DO_THEN, 나머지 그대로 · 그대로인 자리 = CH_N − CH_K = 하나(학교에 오는 길) · 문항 5 정답 = 실천했을 때', () => { const b = BD('u1_l13'), f = fig('u1_l13'); ok(f.k === 'then' && f.rows.length === b.CH_N);
  let same = []; b.CH_SPOT.forEach((s, j) => { const d = b.CH_DO_AT.indexOf(j); ok(f.rows[j].old.name === s && f.rows[j].old.note === b.CH_BEFORE[j] && f.rows[j].now.name === s, s); ok(f.rows[j].now.note === (d >= 0 ? b.CH_DO_THEN[d] : b.CH_BEFORE[j]), s + ' 뒤'); if (d < 0) same.push(s); });
  ok(same.length === b.CH_N - b.CH_K && same.join() === '학교에 오는 길', '그대로 ' + same.join()); ok(f.note.indexOf('**' + b.CH_DO.length + '장**') >= 0, '카드 수'); ok(/실천했을 때/.test(qa('u1_l13', 4)), '문항 5'); });
T('l11 바둑알 — tools 여섯 = BD_MARK·BD_TOPIC 차례 · 아래 줄 = BD_VAL 칸 · ㉯+㉰ = 3칸 = 문항 6 정답 · 칸 정답 = 단원 낱말(민주주의 · 주민 자치)', () => { const b = BD('u1_l14'), f = fig('u1_l14'); ok(f.k === 'tools' && f.items.length === b.BD_CELLS);
  b.BD_TOPIC.forEach((t, i) => ok(f.items[i].name === b.BD_MARK[i] + ' ' + t && f.items[i].kind === b.BD_VAL[i] + '칸', t)); ok(b.BD_VAL[1] + b.BD_VAL[2] + '칸' === qa('u1_l14', 5), '㉯+㉰'); ok(b.BD_OPT[0][b.BD_RIGHT[0]] === '민주주의' && b.BD_OPT[3][b.BD_RIGHT[3]] === '주민 자치', '칸 정답'); });
T('판 검사기 자체 확인 — l07 가지 칸 하나를 다른 가지로, l10 그대로인 자리를 바꾸면 잡는다', () => { const f = fig('u1_l09'), b = BD('u1_l09'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); const c1 = names(f.bins[0].items) !== b.BR_TAG.filter((t, i) => b.BR_WING[i] === 1).join('|'); f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u1_l13'); const keep = g.rows[2].now.note; g.rows[2].now.note = '바뀌었어요'; const c2 = g.rows[2].now.note !== BD('u1_l13').CH_BEFORE[2]; g.rows[2].now.note = keep; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
const GEN = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_social_u1.js'), 'utf8'); const DATA = fs.readFileSync(path.join(TDIR, 'data/g4s2_social_u1.js'), 'utf8');
T('생성기 T 표(교사 층) 「결」 0', () => { const a = GEN.indexOf('\nconst T = {'), z = GEN.indexOf('\nconst TYPE'); ok(a > 0 && z > a, 'T 표 자리'); const tb = GEN.slice(a, z); ok(!/결/.test(tb), (tb.match(/.{0,12}결.{0,12}/) || [''])[0]); });
T('데이터의 「결」 낱말 = 모두 원문(교과 문장·문항·판 글)에 있는 낱말 · 박음·빵꾸·갈아엎·결로 0', () => { const srcAll = fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u1.json'), 'utf8'); const words = new Set((DATA.match(/[가-힣]*결[가-힣]*/g) || []));
  words.forEach(x => ok(srcAll.indexOf(x) >= 0, '원문에 없는 「' + x + '」')); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => { ok(DATA.indexOf(x) < 0, x); ok(GEN.indexOf(x) < 0, '생성기 ' + x); }); });
T('「결」 검사기 자체 확인 — 데이터에 「결심」을 심으면 잡는다', () => { const srcAll = fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u1.json'), 'utf8'); ok(srcAll.indexOf('결심') < 0, '원문에 결심이 있음'); });
T('학생 화면에 「주민 자치」 — 주제①(u1_l01~l05) 0(정리 장의 다음 예고 빼고)', () => KEYS.slice(0, 4).forEach(k => L[k].slides.forEach(s => ok(vis(s).indexOf('주민 자치') < 0, k + ' ' + s.id))));

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
