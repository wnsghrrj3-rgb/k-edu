/* gate_g4s2_social_u2.js — 4학년 2학기 사회 2단원 「지역문제를 해결하고 지역을 알리는 노력」 케이티처 2세대 게이트 (209차, 베프) · gate_g4s2_social_u1.js 꼴.
   재료 = 자기주도 사회 4-2 2단원 l01~l11 → src_g4s2_social_u2.json(parse_selfdirected_soc4s2.js · 셋째 인자 l01=1~2,l08=10~11,l09=12~13,l10=14,l11=15~16). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(지도서 1~16차시 빈틈 0 · 키 = 차시 첫 번호 · 원문 머리 「N(~M)차시(lXX)」(l01~l07)·「지도서 N(~M)차시(p.…)」(l08~l11)와 같음 — l01 만 단원 도입 1차시를 더함 · 성취기준 = 원문)
   B 19장 · C 7요소 · D 계보(4-2 사회 u1_l14 → u2_l01 → … → u2_l15)
   E 정답 · F 원문 계승(동기 = 원문 1번 장 제목, u2_l14 는 6번 · u2_l15 는 0번 · 판 장 = 원문 4번, u2_l15 는 6번 · 카드 이름·아래 줄 = 원문 장 글 토막)
   G 그림(판 부품 = groups 7·then 2·tools 1·chain 1) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문·분(40분 30~45 · 80분 60~88 · 120분 90~130)
   L 선행 용어(원문 첫 등장 차시 전 학생 화면 0 · 원문도 같은 차례) · M 판 대조(원문 판의 표 ↔ 판 그림 + 뜻 규칙으로 따로 셈 · 판 11종)
   N 차단 어휘 — 생성기 T 표 「결」 0 · 데이터의 「결」 낱말은 모두 원문(교과 문장·판 글)에 있는 낱말 · 박음·빵꾸·갈아엎·결로 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_social_u2.js */
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
const L = load(path.join(TDIR, 'data/g4s2_social_u2.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_social_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u2.json'), 'utf8'));
const KEYS = ['u2_l01', 'u2_l03', 'u2_l04', 'u2_l05', 'u2_l07', 'u2_l08', 'u2_l09', 'u2_l10', 'u2_l12', 'u2_l14', 'u2_l15'];
const COV = { u2_l01: [1, 2], u2_l03: [3], u2_l04: [4], u2_l05: [5, 6], u2_l07: [7], u2_l08: [8], u2_l09: [9], u2_l10: [10, 11], u2_l12: [12, 13], u2_l14: [14], u2_l15: [15, 16] };
const FILEK = { u2_l01: 'u2_l01', u2_l03: 'u2_l02', u2_l04: 'u2_l03', u2_l05: 'u2_l04', u2_l07: 'u2_l05', u2_l08: 'u2_l06', u2_l09: 'u2_l07', u2_l10: 'u2_l08', u2_l12: 'u2_l09', u2_l14: 'u2_l10', u2_l15: 'u2_l11' };
const STD = { u2_l09: '[4사09-02][4사09-01]', u2_l15: '[4사09-01][4사09-02]' };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '지역문제를 해결하고 지역을 알리는 노력';
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
const BI = (k) => (k === 'u2_l15' ? 6 : 4);
const ASK = (k) => { const m = { u2_l14: 6, u2_l15: 0 }; return k in m ? m[k] : 1; };
const SAY = (sl) => sl.bub || sl.answer.join(' ') || sl.items.map(nb).join(' ');
const board = (k) => con(k).find(s => s.src === BI(k));
const slideText = (sl) => nb([sl.title, sl.bub, sl.note, sl.answer.join(' '), sl.items.join(' '), sl.scene.join(' ')].join(' '));
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };
const SRCDIR = path.join(ROOT, 'grade4/semester2/social/2단원_지역문제해결과지역알리기');

console.log('═══ A. 로드 ═══');
T('11키(지도서 차시 첫 번호) · 재료 키와 같음', () => { ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')); ok(JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), '재료 키'); });
T('meta: 4학년 2학기 사회 · unit 1 · covers · 분 = 40 × 차시 수 · 성취기준 = 원문 · 제목 = 원문 <title> · live_url 실파일 · 원문 파일 키', () => KEYS.forEach(k => { const m = L[k].meta, c = COV[k];
  ok(m.grade === 4 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 1 ? c[0] + '차시' : c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '~' + c[2] + '차시'), k + ' covers ' + m.covers); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(m.std === SRC[k].std && m.std === (STD[k] || (+k.slice(-2) <= 8 ? '[4사09-01]' : '[4사09-02]')), k + ' std ' + m.std); ok(m.title === nb(SRC[k].title) && m.title.length > 4 && !/사회 4-2/.test(m.title), k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); ok(SRC[k].file_key === FILEK[k] && m.live_url.indexOf('_' + FILEK[k] + '_') > 0, k + ' 원문 파일 ' + SRC[k].file_key); }));
T('지도서 1~16차시 빈틈 0 · 80분 = l01·l05·l10·l12·l15 · 원문 머리 「N(~M)차시(lXX)」·「N(~M)차시(p.」와 같음(l01 만 단원 도입 1차시를 더함)', () => { const all = [].concat(...KEYS.map(k => COV[k])); ok(all.join() === Array.from({ length: 16 }, (_, i) => i + 1).join(), all.join());
  ok(KEYS.filter(k => COV[k].length === 2).join() === 'u2_l01,u2_l05,u2_l10,u2_l12,u2_l15' && KEYS.filter(k => COV[k].length > 2).length === 0, '묶음');
  KEYS.forEach(k => { ok(JSON.stringify(SRC[k].covers) === JSON.stringify(COV[k]), k + ' 재료 covers'); const f = fs.readdirSync(SRCDIR).find(x => x.indexOf('_' + FILEK[k] + '_') > 0); const m = fs.readFileSync(path.join(SRCDIR, f), 'utf8').slice(0, 600).match(/(\d+)(?:~(\d+))?차시\((?:l\d+|p\.)/); ok(m, k + ' 머리 주석');
    const a = +m[1], z = m[2] ? +m[2] : a, c = COV[k]; if (k === 'u2_l01') ok(a === 2 && z === 2 && c.join() === '1,2', 'l01 = 단원 도입 1 + 원문 2'); else ok(a === c[0] && z === c[c.length - 1], k + ' 머리 ' + m[0]); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u1_l14.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-2 사회 u1_l14') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_social:u1_l14'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 1번(u2_l14 는 6번 · u2_l15 는 0번) 장 제목 · 개념 제목 = 원문 · 말풍선 = 원문 말풍선(없으면 답 상자 · 목록 줄) · 카드 이름·아래 줄 = 원문 장 글 토막 · 판 장 = 교사 한 줄', () => {
  const ask = SLI(k, ASK(k)); ok(ask && ask.kind !== 'board' && /[?？]$/.test(nb(ask.title)), '동기 장 꼴 · 물음'); if (!ASK(k)) ok(ask.kind === 'intro', '0번 = 생각 열기'); const mo = L[k].slides[2]; ok(mo.data.question === plain(ask.title) && mo.src === ask.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (s.src === BI(k)) { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === SAY(sl) && d.content, s.id + ' 말풍선 ≠ 원문'); const txt = slideText(sl); const f = d.fig;
    ok(f.k === 'tools' || f.k === 'chain', s.id + ' 부품 ' + f.k); ok(f.items.length >= 3, s.id + ' 카드 수'); f.items.forEach(it => { ok(txt.indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 문항의 틀린 보기 ↔ 그 문항 정답 · 정리 = 원문 정리 줄 · 돌아보기 = 원문 · 다음 = 원문 끝 장', () => { const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)];
  ok(m.data.right === q.opts[q.ci], '바른 생각'); ok(q.opts.indexOf(m.data.wrong) >= 0 && m.data.wrong !== m.data.right, '틀린 생각'); ok(!/아닌 것|알맞지 않은/.test(q.t), '「아닌 것」 문항을 오개념으로 쓰지 않음');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length >= 3, '정리');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  const pv = L[k].slides[18].data.preview; if (k === 'u2_l15') ok(pv === nb(SRC[k].end_note) + ' ' + nb(SRC[k].next) && /다양한 환경/.test(pv) && L[k].slides[18].data.title === '다음 단원엔', '다음 단원'); else ok(pv === nb(SRC[k].next) && /^다음 시간/.test(pv), '다음 ≠ 원문'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'groups', 'link', 'then'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('판 부품 = groups 7(l04·l07·l09·l10·l12·l14·l15)·then 2(l01·l05)·tools 1(l03)·chain 1(l08) · 판 장 = 원문 4번(l15 는 6번) · 원문 그 장이 직접조작 판(장마다 하나)', () => { const bc = {}; KEYS.forEach(k => { const b = board(k); ok(b, k + ' 판 장'); const sl = SLI(k, BI(k)); ok(sl.kind === 'board' && SRC[k].slides.filter(x => x.kind === 'board').length === 1, k + ' 원문 판'); bc[b.data.fig.k] = (bc[b.data.fig.k] || []).concat(k.slice(-3)); });
  ok(JSON.stringify(bc) === JSON.stringify({ then: ['l01', 'l05'], tools: ['l03'], groups: ['l04', 'l07', 'l09', 'l10', 'l12', 'l14', 'l15'], chain: ['l08'] }), JSON.stringify(bc)); });

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
const FIRST = [['면담', 'u2_l03'], ['설문 조사', 'u2_l03'], ['공공 기관', 'u2_l03'], ['통계 자료', 'u2_l04'], ['공익 광고', 'u2_l04'], ['평가 기준', 'u2_l05'], ['장단점', 'u2_l05'], ['공유', 'u2_l05'], ['제안서', 'u2_l07'], ['지능형 교통', 'u2_l07'], ['의병', 'u2_l09'], ['퍼레이드', 'u2_l09'], ['축제', 'u2_l09'], ['직거래 장터', 'u2_l10'], ['체험 프로그램', 'u2_l10'], ['관광 상품', 'u2_l10'], ['사회 관계망 서비스', 'u2_l10'], ['안내도', 'u2_l12'], ['포스터', 'u2_l12'], ['동시', 'u2_l14'], ['기획서', 'u2_l14'], ['벌집', 'u2_l15']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — u2_l03 개념 장에 「기획서」를 심으면 잡는다', () => { const s = L.u2_l03.slides[3]; const keep = s.data.content; s.data.content = keep + ' 기획서'; let caught = false; try { KEYS.slice(0, 7).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('기획서') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 끝 장을 뺀 원문 글에서 첫 등장 = 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'end').map(x => [x.title, x.bub, x.answer, x.items, x.note, x.scene])) + JSON.stringify(SRC[k].problems); if (i < i0) ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); if (i === i0) ok(txt.indexOf(w0) >= 0, k0 + ' 원문에 없음 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
const names = (arr) => arr.map(x => x.name).join('|');
const cnt = (m, n) => { let c = 0; for (let i = 0; i < n; i++) if (m & (1 << i)) c++; return c; };
T('l01 선반 — then 넷 = LP_CARD 차례 · 선반 = 닿는 집 수(둘 이상 = 지역문제)로 따로 셈 · 옮아서 바뀌는 카드 = 독감 하나(개인의 일 1곳 → 지역문제 4곳) · 층간 소음 = 두 집인데 지역문제 · 문항 5·6 정답 = 「여러 집」·「갈등」', () => { const b = BD('u2_l01'), f = fig('u2_l01'); ok(f.k === 'then' && f.rows.length === b.LP_CARDS);
  const shelf = (m) => cnt(m, 6) >= 2 ? '지역문제' : '개인의 일'; b.LP_CARD.forEach((c, i) => { const m0 = b.LP_REACH[i], m1 = m0 | b.LP_SPREAD[i]; ok(f.rows[i].old.name === plain(c), c); ok(f.rows[i].old.note === shelf(m0) + ' · 닿는 집 ' + cnt(m0, 6) + '곳' && f.rows[i].now.name === shelf(m1) && f.rows[i].now.note === '닿는 집 ' + cnt(m1, 6) + '곳', c + ' 선반'); });
  const moved = f.rows.filter(r => r.old.note.indexOf(r.now.name) !== 0); ok(moved.length === 1 && /독감/.test(moved[0].old.name) && moved[0].old.note === '개인의 일 · 닿는 집 1곳' && moved[0].now.note === '닿는 집 4곳', '독감만 옮김');
  const fl = f.rows.find(r => /층간/.test(r.old.name)); ok(fl.old.note === '지역문제 · 닿는 집 2곳', '층간 소음'); ok(/여러 집/.test(qa('u2_l01', 4)) && /갈등/.test(qa('u2_l01', 5)), '문항 5·6'); });
T('l02 칸 표 — tools 여섯 = TL_ROWNAME · 칸 = 카드가 가리킨 줄을 따로 셈 · 합 = 카드 열둘 · 「가장 많음」 = 둘(교통 혼잡·환경 오염) · 문항 5 정답 = 「정하는 일은 나에게」', () => { const b = BD('u2_l03'), f = fig('u2_l03'); ok(f.k === 'tools' && f.items.length === 6);
  const n = [0, 0, 0, 0, 0, 0]; b.TL_SAY.forEach((s, i) => { n[b.TL_ROW[i]]++; }); ok(n.reduce((a, x) => a + x, 0) === b.TL_CARDS && b.TL_CARDS === 12, '합 12');
  b.TL_ROWNAME.forEach((r, i) => ok(f.items[i].name === r && f.items[i].kind.indexOf(n[i] + '칸') === 0, r)); const top = f.items.filter(x => /가장 많음/.test(x.kind)).map(x => x.name); ok(top.join() === '교통 혼잡 문제,환경 오염 문제', '가장 많음 ' + top.join());
  ok(b.TL_SAY.filter(s => /도로가 좁아서/.test(s)).length === 3, '같은 말 셋 = 교통 혼잡'); ok(/나에게 남겨/.test(qa('u2_l03', 4)), '문항 5'); });
T('l03 자료 겹치기 — groups 둘 = DG_CAUSE · 칸마다 받치는 자료 = DG_NEED 정보 · 뜻 규칙(정보에 「주차 공간」 = 원인 1, 나머지 = 원인 2)으로 따로 셈 · 자료 넷 다 한 번씩 · 원인마다 둘 · 문항 5 정답 = 「둘씩」', () => { const b = BD('u2_l04'), f = fig('u2_l04'); ok(f.k === 'groups' && f.bins.length === 2);
  const rule = b.DG_INFO.map(x => /주차 공간/.test(x) ? 0 : 1); b.DG_CAUSE.forEach((c, i) => { ok(f.bins[i].name === '원인 ' + (i + 1) + ' — ' + c, c); ok(names(f.bins[i].items) === b.DG_INFO.filter((x, j) => rule[j] === i).join('|') && f.bins[i].items.length === 2, c + ' 자료'); });
  ok([].concat(...b.DG_NEED).sort().join() === '0,1,2,3', '넷 한 번씩'); ok(/둘씩/.test(qa('u2_l04', 4)), '문항 5'); });
T('l04 방안 재기 — then 셋 = PC_PLAN · 처음 = 셋 다 멈춰(가장 낮은 자리 < 2) · 보완 = PC_FIXNOTE 자리만 +1 · 보완 뒤 셋 다 계속 · ㉮ = 더한 값 최대인데 멈춰 · ㉰ = 보완 두 번 · 문항 5·6 정답 = 「한 자리」·「하나 더」', () => { const b = BD('u2_l05'), f = fig('u2_l05'); ok(f.k === 'then' && f.rows.length === 3);
  const sum = (s) => s.reduce((a, x) => a + x, 0); b.PC_BASE.forEach((s, i) => { ok(Math.min(...s) < b.PC_BAR && /멈춰$/.test(f.rows[i].old.note) && f.rows[i].old.note.indexOf('더한 값 ' + sum(s)) === 0, i + ' 처음'); const fx = s.map((v, j) => j).filter(j => b.PC_FIXNOTE[i][j]); const low = s.map((v, j) => j).filter(j => s[j] < b.PC_BAR); ok(fx.join() === low.join(), i + ' 보완 자리 = 낮은 자리'); ok(f.rows[i].now.name === '보완 ' + low.length + '번' && /계속$/.test(f.rows[i].now.note), i + ' 뒤'); });
  const sums = b.PC_BASE.map(sum); ok(sums.indexOf(Math.max(...sums)) === 0, '㉮ 최대'); ok(f.rows[2].now.name === '보완 2번', '㉰ 두 번'); ok(/한 자리/.test(qa('u2_l05', 4)) && /하나 더/.test(qa('u2_l05', 5)), '문항 5·6'); });
T('l05 두 줄 — groups 둘 = PR_COL · 칸 = PR_SIDE · 뜻 규칙(설치·가격·단속 = 공공 기관에 부탁할 일)으로 따로 셈 · 셋씩 · 제안서 네 칸 = 원문 「제안서」 장 네 줄 · 문항 5 정답 = 「협조」', () => { const b = BD('u2_l07'), f = fig('u2_l07'); ok(f.k === 'groups' && f.bins.length === 2);
  b.PR_ACT.forEach((a, j) => ok((/설치|가격|단속/.test(a) ? 1 : 0) === b.PR_SIDE[j], a + ' 규칙')); b.PR_COL.forEach((c, i) => ok(f.bins[i].name === c && names(f.bins[i].items) === b.PR_ACT.filter((a, j) => b.PR_SIDE[j] === i).join('|') && f.bins[i].items.length === 3, c));
  const t5 = slideText(SLI('u2_l07', 5)); b.PR_SLOT_LB.forEach(x => ok(t5.indexOf(x) >= 0, x)); ok(/협조/.test(qa('u2_l07', 4)), '문항 5'); });
T('l06 길 — chain 다섯 = MZ_Q · O/X 화살표 = MZ_DIR·MZ_AR · 뜻 규칙(「정한 후에는 원인」·「에서만」 = X, 나머지 = O)으로 걸으면 출발 → 공원 앞 · 한 물음만 바꾸면 다섯 자리 모두 다름 · 문항 5 정답 = 「더한 값」', () => { const b = BD('u2_l08'), f = fig('u2_l08'); ok(f.k === 'chain' && f.items.length === b.MZ_N);
  b.MZ_Q.forEach((q, i) => { ok(f.items[i].name === q.replace(/[.]$/, ''), q); ok(f.items[i].kind === 'O ' + b.MZ_AR[b.MZ_DIR[i][0].join()] + ' · X ' + b.MZ_AR[b.MZ_DIR[i][1].join()], q + ' 화살표'); });
  const truth = b.MZ_Q.map(q => /정한 후에는 원인|에서만/.test(q) ? 1 : 0); const walk = (pick) => { let r = b.MZ_START.r, c = b.MZ_START.c; pick.forEach((x, i) => { r += b.MZ_DIR[i][x][0]; c += b.MZ_DIR[i][x][1]; }); return r + ',' + c; };
  ok(walk(truth) === b.MZ_GOAL.r + ',' + b.MZ_GOAL.c && f.note.indexOf(b.MZ_GOAL_NAME) >= 0, '공원 앞'); const one = truth.map((x, i) => walk(truth.map((y, j) => j === i ? 1 - y : y))); ok(new Set(one).size === 5 && one.indexOf(walk(truth)) < 0, '하나만 바꾸면 다섯 자리'); ok(/더한 값/.test(qa('u2_l08', 4)), '문항 5'); });
T('l07 네 갈래 — groups 넷 = PD_KINDS · 칸 = PD_KIND · 뜻 규칙(강·산 = 자연환경 · 의병·유적 = 역사 · 축제·박람회 = 문화 · 공품·김 = 생산물)으로 따로 셈 · 갈래마다 둘 · 문항 5 정답 = 「어떤 곳」', () => { const b = BD('u2_l09'), f = fig('u2_l09'); ok(f.k === 'groups' && f.bins.length === 4);
  const rule = (n) => /강$|산$/.test(n) ? 0 : /의병|유적/.test(n) ? 1 : /축제|박람회/.test(n) ? 2 : /공품|김$/.test(n) ? 3 : -1; b.PD_NAME.forEach((n, j) => ok(rule(n) === b.PD_KIND[j], n + ' 규칙')); b.PD_KINDS.forEach((k, i) => ok(f.bins[i].name === k && names(f.bins[i].items) === b.PD_SHORT.filter((s, j) => b.PD_KIND[j] === i).join('|') && f.bins[i].items.length === 2, k)); ok(/어떤 곳/.test(qa('u2_l09', 4)), '문항 5'); });
T('l08 갈래 둘 — groups 넷 = AL_KINDS · 칸 = AL_FIT 비트 · 뜻 규칙(AL_CASE 사례 글이 있는 자리 = 설 수 있는 자리)으로 따로 셈 · 축제 = 네 갈래 · 갈래마다 그 갈래에만 서는 방법 ≥ 1 · 문항 5·6 정답 = 「네 갈래 모두」·「따로」', () => { const b = BD('u2_l10'), f = fig('u2_l10'); ok(f.k === 'groups' && f.bins.length === 4);
  b.AL_WAY.forEach((w, j) => b.AL_KINDS.forEach((k, i) => ok(!!(b.AL_FIT[j] & (1 << i)) === !!b.AL_CASE[j][i], w + ' ' + k))); b.AL_KINDS.forEach((k, i) => { ok(f.bins[i].name === k && names(f.bins[i].items) === b.AL_SHORT.filter((s, j) => b.AL_CASE[j][i]).join('|'), k); ok(b.AL_SHORT.filter((s, j) => b.AL_CASE[j].filter(Boolean).length === 1 && b.AL_CASE[j][i]).length >= 1, k + ' 그 갈래에만'); });
  ok(b.AL_CASE[0].every(Boolean) && b.AL_SHORT[0] === '축제', '축제 넷'); ok(/네 갈래 모두/.test(qa('u2_l10', 4)) && /따로/.test(qa('u2_l10', 5)), '문항 5·6'); });
T('l09 세 길 — groups 셋 = MK_WAY · 걸음 = MK_STEP 차례 · 첫 걸음 = 방법 이름 + MK_HEAD(셋 다) · 안내도만 넷(마지막 = 선으로 잇기) · 문항 5·6 정답 = 「먼저 정리」·「선으로」', () => { const b = BD('u2_l12'), f = fig('u2_l12'); ok(f.k === 'groups' && f.bins.length === 3);
  b.MK_WAY.forEach((w, i) => { ok(f.bins[i].name === w && names(f.bins[i].items) === b.MK_STEP[i].join('|'), w); ok(b.MK_STEP[i][0] === b.MK_SHORT[i] + b.MK_HEAD, w + ' 첫 걸음'); }); ok(b.MK_STEP.map(s => s.length).join() === '3,3,4' && /선으로/.test(b.MK_STEP[2][3]), '안내도 넷');
  ok(/먼저 정리/.test(qa('u2_l12', 4)) && /선으로/.test(qa('u2_l12', 5)), '문항 5·6'); });
T('l10 두 장 — groups 둘 = SP_PAPER · 칸 = SP_SLOT 셋씩 · 한 장 = 셋 · 세 칸이 두 장에 나뉘면 어느 장도 다 안 참(따로 셈) · 문항 5·6 정답 = 「골라서」·「나뉘어」', () => { const b = BD('u2_l14'), f = fig('u2_l14'); ok(f.k === 'groups' && f.bins.length === 2);
  b.SP_PAPER.forEach((p, i) => ok(f.bins[i].name === p && names(f.bins[i].items) === b.SP_SLOT[i].join('|') && b.SP_SLOT[i].length === 3, p)); const closed = (a, z) => a === 3 || z === 3; ok(!closed(2, 1) && !closed(1, 2) && closed(3, 0) && closed(0, 3), '닫힘 규칙');
  ok(/골라서/.test(qa('u2_l14', 4)) && /나뉘어/.test(qa('u2_l14', 5)), '문항 5·6'); });
T('l11 벌집 — groups 두 차례 · 맞닿음 = HC_NEAR(서로 맞닿음 확인) · 점수 = 1 + 이미 칠한 칸과 맞닿으면 1(따로 셈) · 차례 ①~⑦ = 13점 · 다른 차례 = 11점(가장 낮은 점수 = 맞닿지 않는 칸 셋 먼저) · 문항 5·6 정답 = 「맞닿아」·「차례」', () => { const b = BD('u2_l15'), f = fig('u2_l15'); ok(f.k === 'groups' && f.bins.length === 2);
  b.HC_NEAR.forEach((ns, i) => ns.forEach(j => ok(b.HC_NEAR[j].indexOf(i) >= 0, i + '-' + j + ' 맞닿음'))); const MK = ['①', '②', '③', '④', '⑤', '⑥', '⑦'];
  const score = (o) => { const on = []; return o.map(c => { const s = b.HC_NEAR[c].some(x => on.indexOf(x) >= 0) ? 2 : 1; on.push(c); return s; }); };
  f.bins.forEach(bn => { const o = bn.items.map(it => MK.indexOf(it.name.slice(0, 1))); ok(o.slice().sort().join() === '0,1,2,3,4,5,6', '일곱 칸'); const sc = score(o); bn.items.forEach((it, j) => ok(it.name === MK[o[j]] + ' +' + sc[j] + '점', it.name)); ok(bn.hint.indexOf(sc.reduce((a, x) => a + x, 0) + '점') >= 0, '합'); });
  ok(f.bins[0].hint.indexOf('13점') >= 0 && f.bins[1].hint.indexOf('11점') >= 0, '13·11'); let lo = 99; const perm = (a, r) => { if (!a.length) { lo = Math.min(lo, score(r).reduce((x, y) => x + y, 0)); return; } a.forEach((x, i) => perm(a.slice(0, i).concat(a.slice(i + 1)), r.concat(x))); }; perm([0, 1, 2, 3, 4, 5, 6], []); ok(lo === 11, '가장 낮은 점수 ' + lo);
  ok(/맞닿아/.test(qa('u2_l15', 4)) && /차례/.test(qa('u2_l15', 5)), '문항 5·6'); });
T('판 검사기 자체 확인 — l05 칸 하나를 다른 줄로, l11 점수 하나를 바꾸면 잡는다', () => { const f = fig('u2_l07'), b = BD('u2_l07'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); const c1 = names(f.bins[0].items) !== b.PR_ACT.filter((a, j) => b.PR_SIDE[j] === 0).join('|'); f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u2_l15'); const keep = g.bins[1].hint; g.bins[1].hint = '벌집 점수 **13점**'; const c2 = g.bins[1].hint.indexOf('11점') < 0; g.bins[1].hint = keep; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
const GEN = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_social_u2.js'), 'utf8'); const DATA = fs.readFileSync(path.join(TDIR, 'data/g4s2_social_u2.js'), 'utf8');
T('생성기 T 표(교사 층) 「결」 0', () => { const a = GEN.indexOf('\nconst T = {'), z = GEN.indexOf('\nconst TYPE'); ok(a > 0 && z > a, 'T 표 자리'); const tb = GEN.slice(a, z); ok(!/결/.test(tb), (tb.match(/.{0,12}결.{0,12}/) || [''])[0]); });
T('데이터의 「결」 낱말 = 모두 원문(교과 문장·문항·판 글)에 있는 낱말 · 박음·빵꾸·갈아엎·결로 0', () => { const srcAll = fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u2.json'), 'utf8'); const words = new Set((DATA.split('2단원_지역문제해결과지역알리기').join('').match(/[가-힣]*결[가-힣]*/g) || [])); /* 원문 폴더 이름(파일 경로)은 낱말이 아님 */
  words.forEach(x => ok(srcAll.indexOf(x) >= 0, '원문에 없는 「' + x + '」')); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => { ok(DATA.indexOf(x) < 0, x); ok(GEN.indexOf(x) < 0, '생성기 ' + x); }); });
T('「결」 검사기 자체 확인 — 데이터에 「결심」을 심으면 잡는다', () => { const srcAll = fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u2.json'), 'utf8'); ok(srcAll.indexOf('결심') < 0, '원문에 결심이 있음'); });
T('학생 화면에 「자랑거리」 — 주제①(u2_l01~l08) 0(다음 예고 장 빼고)', () => KEYS.slice(0, 6).forEach(k => L[k].slides.forEach(s => ok(vis(s).indexOf('자랑거리') < 0, k + ' ' + s.id))));

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
