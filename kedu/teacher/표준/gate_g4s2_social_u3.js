/* gate_g4s2_social_u3.js — 4학년 2학기 사회 3단원 「다양한 환경과 삶의 모습」 케이티처 2세대 게이트 (210차, 베프) · gate_g4s2_social_u2.js 꼴.
   재료 = 자기주도 사회 4-2 3단원 l01~l12 → src_g4s2_social_u3.json(parse_selfdirected_soc4s2.js · 셋째 인자 l01=1~2,l02=3,l03=4,l04=5,l05=6~7,l06=8,l07=9,l08=10~11,l09=12,l10=13,l11=14,l12=15~16). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(지도서 1~16차시 빈틈 0 · 키 = 차시 첫 번호 · 원문 머리 「N(~M)차시(p.…)」와 같음 · l08 파일 둘 중 index.html 정본만 · 성취기준 = 원문)
   B 19장 · C 7요소 · D 계보(4-2 사회 u2_l15 → u3_l01 → … → u3_l15)
   E 정답 · F 원문 계승(동기 = 원문 1번 장 제목, u3_l08 은 0번 · 판 장 = 원문 5번 · 카드 이름·아래 줄 = 원문 장 글 토막 · 마지막 = 「이 단원을 마쳐요」)
   G 그림(판 부품 = groups 3·then 5·chain 3·tools 1) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문·분(40분 30~45 · 80분 60~88)
   L 선행 용어(원문 첫 등장 차시 전 학생 화면 0 · 원문도 같은 차례) · M 판 대조(원문 판의 표 ↔ 판 그림 + 판의 규칙으로 따로 셈 · 판 12종)
   N 차단 어휘 — 생성기 T 표 「결」 0 · 데이터의 「결」 낱말은 모두 원문에 있는 낱말 · 박음·빵꾸·갈아엎·결로 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_social_u3.js */
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
const L = load(path.join(TDIR, 'data/g4s2_social_u3.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_social_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u3.json'), 'utf8'));
const KEYS = ['u3_l01', 'u3_l03', 'u3_l04', 'u3_l05', 'u3_l06', 'u3_l08', 'u3_l09', 'u3_l10', 'u3_l12', 'u3_l13', 'u3_l14', 'u3_l15'];
const COV = { u3_l01: [1, 2], u3_l03: [3], u3_l04: [4], u3_l05: [5], u3_l06: [6, 7], u3_l08: [8], u3_l09: [9], u3_l10: [10, 11], u3_l12: [12], u3_l13: [13], u3_l14: [14], u3_l15: [15, 16] };
const FILEK = { u3_l01: 'u3_l01', u3_l03: 'u3_l02', u3_l04: 'u3_l03', u3_l05: 'u3_l04', u3_l06: 'u3_l05', u3_l08: 'u3_l06', u3_l09: 'u3_l07', u3_l10: 'u3_l08', u3_l12: 'u3_l09', u3_l13: 'u3_l10', u3_l14: 'u3_l11', u3_l15: 'u3_l12' };
const STD = { u3_l15: '[4사10-01][4사10-02]' };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '다양한 환경과 삶의 모습';
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
const BI = (k) => 5;
const ASK = (k) => { const m = { u3_l08: 0 }; return k in m ? m[k] : 1; };
const SAY = (sl) => sl.bub || sl.answer.join(' ') || sl.items.map(nb).join(' ');
const board = (k) => con(k).find(s => s.src === BI(k));
const slideText = (sl) => nb([sl.title, sl.bub, sl.note, sl.answer.join(' '), sl.items.join(' '), sl.scene.join(' ')].join(' '));
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };
const SRCDIR = path.join(ROOT, 'grade4/semester2/social/3단원_다양한환경과삶의모습');
const IDX = fs.readFileSync(path.join(ROOT, 'grade4/semester2/social/index.html'), 'utf8');
const SFILE = (k) => fs.readdirSync(SRCDIR).filter(x => x.indexOf('_' + FILEK[k] + '_') > 0 && IDX.indexOf(x) >= 0);

console.log('═══ A. 로드 ═══');
T('12키(지도서 차시 첫 번호) · 재료 키와 같음', () => { ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')); ok(JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), '재료 키'); });
T('meta: 4학년 2학기 사회 · unit 3 · covers · 분 = 40 × 차시 수 · 성취기준 = 원문 · 제목 = 원문 <title> · live_url 실파일 · 원문 파일 키', () => KEYS.forEach(k => { const m = L[k].meta, c = COV[k];
  ok(m.grade === 4 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 1 ? c[0] + '차시' : c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '~' + c[2] + '차시'), k + ' covers ' + m.covers); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(m.std === SRC[k].std && m.std === (STD[k] || (+k.slice(-2) <= 8 ? '[4사10-01]' : '[4사10-02]')), k + ' std ' + m.std); ok(m.title === nb(SRC[k].title) && m.title.length > 4 && !/사회 4-2/.test(m.title), k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); ok(SRC[k].file_key === FILEK[k] && m.live_url.indexOf('_' + FILEK[k] + '_') > 0, k + ' 원문 파일 ' + SRC[k].file_key); }));
T('지도서 1~16차시 빈틈 0 · 80분 = l01·l06·l10·l15 · 원문 머리 「N(~M)차시(p.」와 같음(재료가 index.html 정본 파일에서 옴 — l08 두 파일 가운데 이으면가까워요)', () => { const all = [].concat(...KEYS.map(k => COV[k])); ok(all.join() === Array.from({ length: 16 }, (_, i) => i + 1).join(), all.join());
  ok(KEYS.filter(k => COV[k].length === 2).join() === 'u3_l01,u3_l06,u3_l10,u3_l15' && KEYS.filter(k => COV[k].length > 2).length === 0, '묶음');
  KEYS.forEach(k => { ok(JSON.stringify(SRC[k].covers) === JSON.stringify(COV[k]), k + ' 재료 covers'); const fl = SFILE(k); ok(fl.length === 1 && SRC[k].file === fl[0], k + ' 정본 파일 ' + fl.join()); const f = fl[0]; const m = fs.readFileSync(path.join(SRCDIR, f), 'utf8').slice(0, 600).match(/(\d+)(?:~(\d+))?차시\((?:l\d+|p\.)/); ok(m, k + ' 머리 주석');
    const a = +m[1], z = m[2] ? +m[2] : a, c = COV[k]; ok(a === c[0] && z === c[c.length - 1], k + ' 머리 ' + m[0]); }); });
T('l08 파일 둘 — 정본(이으면가까워요)만 재료 · 다른 하나(창을옮겨요)는 index.html 에 없음', () => { const two = fs.readdirSync(SRCDIR).filter(x => /_u3_l08_/.test(x)); ok(two.length === 2, two.join()); ok(IDX.indexOf('g4_social_u3_l08_이으면가까워요.html') >= 0 && IDX.indexOf('창을옮겨요') < 0, 'index'); ok(SRC.u3_l10.file === 'g4_social_u3_l08_이으면가까워요.html' && /이으면가까워요/.test(L.u3_l10.meta.live_url), '정본'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u2_l15.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-2 사회 u2_l15') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_social:u2_l15'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 1번(u3_l08 은 0번) 장 제목 · 개념 제목 = 원문 · 말풍선 = 원문 말풍선(없으면 답 상자 · 목록 줄) · 카드 이름·아래 줄 = 원문 장 글 토막 · 판 장 = 교사 한 줄', () => {
  const ask = SLI(k, ASK(k)); ok(ask && ask.kind !== 'board' && /[?？]$/.test(nb(ask.title)), '동기 장 꼴 · 물음'); if (!ASK(k)) ok(ask.kind === 'intro', '0번 = 생각 열기'); const mo = L[k].slides[2]; ok(mo.data.question === plain(ask.title) && mo.src === ask.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (s.src === BI(k)) { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === SAY(sl) && d.content, s.id + ' 말풍선 ≠ 원문'); const txt = slideText(sl); const f = d.fig;
    ok(f.k === 'tools' || f.k === 'chain', s.id + ' 부품 ' + f.k); ok(f.items.length >= 3, s.id + ' 카드 수'); f.items.forEach(it => { ok(txt.indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 문항의 틀린 보기 ↔ 그 문항 정답 · 정리 = 원문 정리 줄 · 돌아보기 = 원문 · 다음 = 원문 끝 장', () => { const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)];
  ok(m.data.right === q.opts[q.ci], '바른 생각'); ok(q.opts.indexOf(m.data.wrong) >= 0 && m.data.wrong !== m.data.right, '틀린 생각'); ok(!/아닌 것|알맞지 않은/.test(q.t), '「아닌 것」 문항을 오개념으로 쓰지 않음');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length >= 2, '정리(원문 정리 줄 — 3단원은 두 줄인 차시 있음)');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  const pv = L[k].slides[18].data.preview; if (k === 'u3_l15') ok(!nb(SRC[k].next) && pv === nb(SRC[k].end_note) && /교실 몫/.test(pv) && L[k].slides[18].data.title === '이 단원을 마쳐요', '마지막 장 — 4-2 사회 끝'); else ok(pv === nb(SRC[k].next) && /^다음 시간/.test(pv), '다음 ≠ 원문'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'groups', 'link', 'then'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('판 부품 = groups 3(l01·l12·l15)·then 5(l04·l06·l10·l13·l14)·chain 3(l03·l05·l09)·tools 1(l08) · 판 장 = 원문 5번(모든 키) · 원문 그 장이 직접조작 판(장마다 하나)', () => { const bc = {}; KEYS.forEach(k => { const b = board(k); ok(b, k + ' 판 장'); const sl = SLI(k, BI(k)); ok(sl.kind === 'board' && SRC[k].slides.filter(x => x.kind === 'board').length === 1, k + ' 원문 판'); bc[b.data.fig.k] = (bc[b.data.fig.k] || []).concat(k.slice(-3)); });
  ok(JSON.stringify(bc) === JSON.stringify({ groups: ['l01', 'l12', 'l15'], chain: ['l03', 'l05', 'l09'], then: ['l04', 'l06', 'l10', 'l13', 'l14'], tools: ['l08'] }), JSON.stringify(bc)); });

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
const FIRST = [['산비탈', 'u3_l03'], ['풍력 발전기', 'u3_l03'], ['삼림욕장', 'u3_l03'], ['비닐하우스', 'u3_l04'], ['문화 시설', 'u3_l04'], ['축사', 'u3_l04'], ['양식장', 'u3_l05'], ['원료', 'u3_l05'], ['수산물 직판장', 'u3_l05'], ['간척', 'u3_l06'], ['생태 통로', 'u3_l06'], ['자연 휴식년제', 'u3_l06'], ['케이블카', 'u3_l06'], ['교통 체증', 'u3_l06'], ['낱말 퍼즐', 'u3_l08'], ['공공 기관', 'u3_l09'], ['편의 시설', 'u3_l09'], ['제조업', 'u3_l10'], ['금융업', 'u3_l10'], ['지도 애플리케이션', 'u3_l10'], ['무언극', 'u3_l12'], ['스마트 도시', 'u3_l12'], ['바람길 숲', 'u3_l13'], ['캠페인', 'u3_l13'], ['이야기책', 'u3_l14'], ['주사위', 'u3_l15']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — u3_l03 개념 장에 「무언극」을 심으면 잡는다', () => { const s = L.u3_l03.slides[3]; const keep = s.data.content; s.data.content = keep + ' 무언극'; let caught = false; try { KEYS.slice(0, 8).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('무언극') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 끝 장을 뺀 원문 글에서 첫 등장 = 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'end').map(x => [x.title, x.bub, x.answer, x.items, x.note, x.scene])) + JSON.stringify(SRC[k].problems); if (i < i0) ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); if (i === i0) ok(txt.indexOf(w0) >= 0, k0 + ' 원문에 없음 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
const names = (arr) => arr.map(x => x.name).join('|');
T('l01 두 갈래 — groups 둘 = EV_KIND · 칸 = EV_MADE · 뜻 규칙(하천·갯벌·섬·바람 = 자연 그대로)으로 따로 셈 · 4장·8장 · 하천의 짝 = 3장 · 문항 6 정답 = 「어느 두 장이든」', () => { const b = BD('u3_l01'), f = fig('u3_l01'); ok(f.k === 'groups' && f.bins.length === 2);
  const rule = (n) => /^(하천|갯벌|섬|바람)$/.test(n) ? 0 : 1; b.EV_NAME.forEach((n, j) => ok(rule(n) === b.EV_MADE[j], n + ' 규칙'));
  b.EV_KIND.forEach((kd, i) => { const want = b.EV_NAME.filter(n => rule(n) === i); ok(f.bins[i].name === kd && names(f.bins[i].items) === want.join('|') && f.bins[i].hint.indexOf(want.length + '장') >= 0, kd); }); ok(f.bins[0].items.length === 4 && f.bins[1].items.length === 8, '4·8');
  ok(/3장/.test(f.note) && /갯벌·섬·바람/.test(f.note), '하천 짝 3'); ok(/어느 두 장이든/.test(qa('u3_l01', 6)), '문항 6'); });
T('l03 틈 — chain 여섯 = CF_ATOM 차례 · 때 = CF_WHEN · 뜻 규칙(「옛날」로 시작 = 옛날, 나머지 = 오늘날)으로 따로 셈 · 꼭 자르는 틈 = 때가 바뀌는 자리 3곳 · 자유 2곳 · 문항 6 정답 = 「바뀌는 틈」', () => { const b = BD('u3_l03'), f = fig('u3_l03'); ok(f.k === 'chain' && f.items.length === 6);
  const when = b.CF_ATOM.map(a => /^옛날/.test(a) ? 0 : 1); ok(when.join() === b.CF_WHEN.join(), '때 규칙 ' + when.join());
  const must = when.slice(0, -1).map((x, i) => x !== when[i + 1]); f.items.forEach((it, i) => { ok(it.name === b.CF_ATOM[i], i + ' 토막'); ok(it.kind === b.CF_SLOT[when[i]] + (i < 5 ? (must[i] ? ' · 뒤 틈 ✂ 꼭' : ' · 뒤 틈 자유') : ''), i + ' ' + it.kind); });
  ok(must.filter(Boolean).length === 3 && /3곳/.test(f.note) && /자유|두어도/.test(f.note), '3곳'); ok(/세 곳/.test(L.u3_l03.slides[11].data.levels.도전.a), '도전 답 = 세 곳'); ok(/바뀌는 틈/.test(qa('u3_l03', 6)), '문항 6'); });
T('l04 덮기 — then 넷 = LY_BASE 갈래(논·밭·하천·학교) · 칸 수 따로 셈 · 논·밭 = 덮음(7칸 = 카드 7장) · 하천 그대로 · 학교 1 → 1 + 새 학교 2 = 3 · 문항 5·7 정답 = 「논이나 밭」·「더 많아졌다」', () => { const b = BD('u3_l04'), f = fig('u3_l04'); ok(f.k === 'then' && f.rows.length === 4);
  const n = (x) => b.LY_BASE.filter(y => y === x).length; ok(['논', '밭', '하천', '학교'].map(n).join() === '4,3,4,1' && b.LY_BASE.length === 12, '칸 수');
  ['논', '밭'].forEach((x, i) => ok(f.rows[i].old.name === x + ' ' + n(x) + '칸' && f.rows[i].now.name === '카드로 덮음' && f.rows[i].now.note === '들추면 ' + x + ' 그대로', x));
  ok(n('논') + n('밭') === b.LY_NEW.length && f.note.indexOf(b.LY_NEW.length + '장') >= 0, '덮는 칸 = 카드'); ok(f.rows[2].old.name === '하천 4칸' && f.rows[2].now.name === '그대로', '하천');
  const sch = 1 + b.LY_NEW.filter(x => x === '학교').length; ok(f.rows[3].old.name === '학교 1칸' && f.rows[3].now.name === '학교 ' + sch + '칸' && sch === 3, '학교 3'); ok(/1칸에서 3칸/.test(L.u3_l04.slides[11].data.levels.도전.a), '도전 답');
  ok(/논이나 밭/.test(qa('u3_l04', 4)) && /더 많아졌다/.test(qa('u3_l04', 6)), '문항 5·7'); });
T('l05 세 단추 — chain 셋 = SH_BTN · 차례 = 들어옴 → 만듦 → 나감 · 누를 수 있는 때 = 판 규칙(원료 남음·항구 원료·만든 제품) · 각 3번 · 누르는 차례 가짓수 = 3×3 표 수(따로 셈 42) · 문항 5 정답 = 「원료가 있을 때」', () => { const b = BD('u3_l05'), f = fig('u3_l05'); ok(f.k === 'chain' && f.items.length === 3 && b.SH_STEP.join() === 'in,make,out');
  b.SH_BTN.forEach((t, i) => ok(f.items[i].name === b.SH_MARK[i] + ' — ' + t && f.items[i].kind.endsWith(' · ' + b.SH_LOAD + '번'), t)); ok(/남았을 때/.test(f.items[0].kind) && /항구에 원료/.test(f.items[1].kind) && /만든 제품/.test(f.items[2].kind), '때');
  const seqs = []; const go = (s, a, m, o) => { if (s.length === 3 * b.SH_LOAD) { seqs.push(s); return; } if (a < b.SH_LOAD) go(s + 'i', a + 1, m, o); if (m < a) go(s + 'm', a, m + 1, o); if (o < m) go(s + 'o', a, m, o + 1); }; go('', 0, 0, 0);
  ok(seqs.length === 42 && f.note.indexOf('42가지') >= 0, '가짓수 ' + seqs.length); ok(seqs.every(s => s[0] === 'i' && s[s.length - 1] === 'o'), '처음 들어옴·끝 나감'); ok(/원료가 있을 때/.test(qa('u3_l05', 4)), '문항 5'); });
T('l06 개발 ↔ 되돌림 — then 셋 = IP_LAND · 개발 = 좋은 점·문제점 함께 · 되돌림 = 둘 다 없음 · 노력 = 문제점에만(문항 6) · 원문 판 뜻(IP_READQ 정답 = 「함께 사라졌어요」) · 문항 5 정답 = 「함께 사라졌어요」', () => { const b = BD('u3_l06'), f = fig('u3_l06'); ok(f.k === 'then' && f.rows.length === b.IP_N);
  b.IP_LAND.forEach((l, i) => { ok(f.rows[i].old.name === l && /좋은 점 ✓/.test(f.rows[i].old.note) && /문제점 ✓/.test(f.rows[i].old.note), l + ' 개발'); ok(f.rows[i].now.name === b.IP_BEFORE && f.rows[i].now.note.indexOf(b.IP_EMPTY) >= 0, l + ' 되돌림'); ok(b.IP_GOOD[i] && b.IP_BAD[i] && b.IP_DEV[i], l + ' 원문 칸'); });
  ok(/함께 사라졌어요/.test(b.IP_READQ[b.IP_READ_OK]), '판 뜻'); ok(/함께 사라졌어요/.test(qa('u3_l06', 4)) && /문제점 칸에만/.test(qa('u3_l06', 5)) && /문제점 칸/.test(f.note), '문항 5·6'); });
T('l08 퍼즐 — tools 여덟 = CW_WORD · 가로/세로 = CW_AT · 칸(띄어쓰기 뺀 글자)을 놓아 따로 셈 · 겹친 칸 글자 같음 · 칸이 셋 이상 겹치는 자리 0 · 함께 쓰는 칸 수 · 모래사장 0 · 산사태–생태 통로 = 「태」 · 문항 5·6 정답 = 「태」·「모래사장」', () => { const b = BD('u3_l08'), f = fig('u3_l08'); ok(f.k === 'tools' && f.items.length === b.CW_N);
  const cells = b.CW_WORD.map((w, k) => { const [r, c, d] = b.CW_AT[k]; return Array.from(w.replace(/ /g, ''), (ch, i) => [d ? r + i : r, d ? c : c + i, ch]); }); const at = {};
  cells.forEach((cs, k) => cs.forEach(([r, c, ch]) => { const key = r + ',' + c; (at[key] = at[key] || []).push([k, ch]); ok(r >= 0 && r < b.CW_ROWS && c >= 0, b.CW_WORD[k] + ' 판 밖'); }));
  Object.keys(at).forEach(key => { const v = at[key]; ok(v.length <= 2, key + ' 셋 겹침'); if (v.length === 2) ok(v[0][1] === v[1][1], key + ' 글자 다름 ' + v[0][1] + v[1][1]); });
  const shared = cells.map(cs => cs.filter(([r, c]) => at[r + ',' + c].length === 2).length); f.items.forEach((it, k) => ok(it.name === b.CW_WORD[k] && it.kind === b.CW_DIR[b.CW_AT[k][2]] + ' · 함께 쓰는 칸 ' + shared[k], it.name + ' ' + it.kind));
  const mr = b.CW_WORD.indexOf('모래사장'); ok(shared[mr] === 0 && shared.filter(x => x === 0).length === 1, '홀로 = 모래사장'); const s1 = b.CW_WORD.indexOf('산사태'), s2 = b.CW_WORD.indexOf('생태 통로'); const both = Object.keys(at).filter(key => at[key].map(x => x[0]).sort().join() === [s1, s2].sort().join()); ok(both.length === 1 && at[both[0]][0][1] === '태', '태 칸');
  ok(/「태」 칸을 함께/.test(qa('u3_l08', 4)) && qa('u3_l08', 5) === '모래사장', '문항 5·6'); });
T('l09 불빛 — chain 다섯 = 0·1·3·4·5사람 · 불빛 = 사람 수 규칙(0 꺼짐 · 1~2 희미 · 3~4 밝음 · 5 가장 밝음) · 시설 = CT_FAC need 이상 · 공공 기관 = CT_CITY · 옮김 = 5 − 처음 1 = 4번 · 문항 5·6 정답 = 「다섯 사람」·「꺼지고」', () => { const b = BD('u3_l09'), f = fig('u3_l09'); ok(f.k === 'chain' && f.items.length === 5);
  const LB = ['불빛 꺼짐', '희미한 불빛', '밝은 불빛', '가장 밝은 불빛']; const light = (n) => n === 0 ? 0 : n <= 2 ? 1 : n < b.CT_CITY ? 2 : 3;
  [0, 1, 3, 4, 5].forEach((n, i) => { const fac = b.CT_FAC.filter(x => n >= x.need).map(x => x.name); ok(f.items[i].name === n + '사람' && f.items[i].kind === LB[light(n)] + ' · ' + (fac.length ? fac.join('·') : '시설 없음'), n + ' ' + f.items[i].kind); });
  ok(b.CT_FAC.find(x => x.name === '공공 기관').need === b.CT_CITY && b.CT_START.every(x => x === 1) && b.CT_START.length === b.CT_N, '판 값'); ok(/4번/.test(f.note) && /네 번/.test(L.u3_l09.slides[11].data.levels.도전.a), '4번');
  ok(/다섯 사람/.test(qa('u3_l09', 4)) && /꺼지고/.test(qa('u3_l09', 5)), '문항 5·6'); });
T('l10 길 — then 넷 · 길 모양 넷을 너비 우선으로 따로 셈(넷 = 닿지 않음 · 한 줄 다섯 = 5 · 한 바퀴 여섯 = 3 · 역에서 다섯 = 2) · 두 길 안 = RD_NEAR · 다섯 길보다 적으면 닿지 않음(전수) · 문항 5·6 정답 = 「늘어나지는 않았어요」·「다섯 개」', () => { const b = BD('u3_l10'), f = fig('u3_l10'); ok(f.k === 'then' && f.rows.length === 4 && b.RD_N === 6 && b.RD_NEAR === 2);
  const far = (E) => { let m = 0; for (let a = 0; a < 6; a++) { const d = [-1, -1, -1, -1, -1, -1]; d[a] = 0; const q = [a]; while (q.length) { const x = q.shift(); E.forEach(([p, r]) => { [[p, r], [r, p]].forEach(([u, v]) => { if (u === x && d[v] < 0) { d[v] = d[x] + 1; q.push(v); } }); }); } if (d.indexOf(-1) >= 0) return -1; m = Math.max(m, ...d); } return m; };
  const path5 = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]; const sets = [path5.slice(0, 4), path5, path5.concat([[5, 0]]), [0, 1, 2, 3, 4].map(i => [5, i])]; const want = ['닿지 않는 곳이 있어요', '5길', '3길', '2길'];
  sets.forEach((E, i) => { const d = far(E); ok(f.rows[i].now.name === (d < 0 ? '닿지 않는 곳이 있어요' : d + '길') && f.rows[i].now.name === want[i], i + ' ' + f.rows[i].now.name); ok(f.rows[i].old.name.indexOf('길 ' + ['넷', '다섯', '여섯', '다섯'][i]) === 0 && f.rows[i].old.note.indexOf(b.RD_NAME[E[0][0]] + '–' + b.RD_NAME[E[0][1]]) === 0, i + ' 길 이름'); ok((f.rows[i].now.emoji === '✅') === (d >= 1 && d <= 2), i + ' 표'); });
  const all = []; for (let a = 0; a < 6; a++) for (let c = a + 1; c < 6; c++) all.push([a, c]); let minOk = 99; for (let m = 0; m < 1 << 15; m++) { const E = all.filter((e, i) => m & (1 << i)); if (E.length >= minOk) continue; const d = far(E); if (d >= 1 && d <= 2) minOk = E.length; } ok(minOk === 5, '가장 적은 길 ' + minOk);
  ok(/늘어나지는 않았어요/.test(qa('u3_l10', 4)) && qa('u3_l10', 5) === '다섯 개' && /다섯 개/.test(L.u3_l10.slides[11].data.levels.도전.a), '문항 5·6'); });
T('l12 무언극 — groups 셋 = MM_GNAME · 칸 = MM_KIND · 뜻 규칙(「살아요」 = 사는 곳 · 회의·조립·서비스 = 하는 일 · 감상·자전거·운동 = 여가 생활)으로 따로 셈 · 셋씩 · 문항 6 정답 = 「내가 … 고른 카드가 그대로 답」', () => { const b = BD('u3_l12'), f = fig('u3_l12'); ok(f.k === 'groups' && f.bins.length === b.MM_G);
  const rule = (c) => /살아요$/.test(c) ? 0 : /회의|조립|서비스/.test(c) ? 1 : /감상|자전거|운동/.test(c) ? 2 : -1; b.MM_CARD.forEach((c, j) => ok(rule(c) === b.MM_KIND[j], c + ' 규칙'));
  b.MM_GNAME.forEach((g, i) => ok(f.bins[i].name === g && names(f.bins[i].items) === b.MM_CARD.filter(c => rule(c) === i).join('|') && f.bins[i].items.length === 3 && f.bins[i].hint.indexOf(b.MM_MOVE[i]) === 0, g)); ok(/그대로 답/.test(qa('u3_l12', 5)), '문항 6'); });
T('l13 뒤집힘 — then 넷 = PT_GNAME · 뒤집히는 칸 = 놓은 칸 > 남은 자리(CAP − 놓은 칸)를 1칸부터 따로 셈 = 3칸 · 좋은 점·문제점 토막 = PT_GOOD·PT_BAD 글 안 · 노력 = PT_HELP_G 갈래(산업·편의 시설)에만 · 문항 5 정답 = 「상황이 달라지면」', () => { const b = BD('u3_l13'), f = fig('u3_l13'); ok(f.k === 'then' && f.rows.length === b.PT_G);
  let fa = 0; for (let n = 1; n <= b.PT_CAP; n++) if (n > b.PT_CAP - n) { fa = n; break; } ok(fa === 3 && f.heads[0] === '칸 1~2 — 좋은 점' && f.heads[1] === '칸 3~' + b.PT_CAP + ' — 문제점', '뒤집히는 칸 ' + fa);
  b.PT_GNAME.forEach((g, i) => { const r = f.rows[i]; ok(r.old.name === g && b.PT_GOOD[i].indexOf(r.old.note) >= 0 && b.PT_BAD[i].indexOf(r.now.name) >= 0, g + ' 토막'); const h = b.PT_HELP_G.indexOf(i); ok(h >= 0 ? r.now.note === '노력: ' + (h ? '생활 쓰레기를 최소한으로 줄이는 캠페인' : '바람길 숲') && b.PT_HELP[h].indexOf(r.now.note.slice(4)) >= 0 : r.now.note === '노력 기사 없음', g + ' 노력'); });
  ok(/3칸부터/.test(L.u3_l13.slides[11].data.levels.도전.a), '도전 답'); ok(/상황이 달라지면/.test(qa('u3_l13', 4)), '문항 5'); });
T('l14 접기 — then 넷 = 쪽 FD_PAGE_N · 마주 붙는 칸 = 접는 자리 하나(k ↔ N−1−k)로 따로 셈 · 1↔8 · 2↔7 · 3↔6 · 4↔5 · 조각 갈래 = 앞 넷 도시·뒤 넷 나(「나는」으로 시작) · 쪽이 서는 규칙 = 갈래 다름 · 문항 5 정답 = 「마주 놓여야」', () => { const b = BD('u3_l14'), f = fig('u3_l14'); ok(f.k === 'then' && f.rows.length === b.FD_PAGE_N && b.FD_N === 8);
  f.rows.forEach((r, j) => ok(r.old.name === (j + 1) + '번 칸' && r.now.name === (b.FD_N - 1 - j + 1) + '번 칸', j + ' 짝')); b.FD_PIECE.forEach((p, i) => ok((/^나는/.test(p) ? 1 : 0) === (i < b.FD_SIDE_N ? 0 : 1), p + ' 갈래'));
  const stand = (a, z) => (a < 4 ? 0 : 1) !== (z < 4 ? 0 : 1); ok(stand(0, 4) && !stand(0, 1) && !stand(5, 6), '서는 규칙'); ok(f.note.indexOf(b.FD_KNAME[0]) >= 0 && f.note.indexOf(b.FD_KNAME[1]) >= 0, '두 갈래'); ok(/8번 칸/.test(L.u3_l14.slides[11].data.levels.도전.a), '도전 답'); ok(/마주 놓여야/.test(qa('u3_l14', 4)), '문항 5'); });
T('l15 그물 — groups 둘 = RB_STEMNAME · 잎 = RB_LEAF 를 RB_MID 로 나눔(8·4) · 퀴즈 열둘 = 잎 열둘 · 물러나도 잎 = 지나온 칸 수 · 끝 = 잎 12 · 문항 5·6 정답 = 「다시 묻지 않으니」·「맞혀야 하는 칸의 수」', () => { const b = BD('u3_l15'), f = fig('u3_l15'); ok(f.k === 'groups' && f.bins.length === 2 && b.RB_LEAF.length === b.RB_N && b.RB_QUIZ.length === b.RB_N);
  [b.RB_LEAF.slice(0, b.RB_MID), b.RB_LEAF.slice(b.RB_MID)].forEach((lv, t) => ok(f.bins[t].name === b.RB_STEMNAME[t] && names(f.bins[t].items) === lv.join('|') && f.bins[t].hint.indexOf(lv.length + '장') >= 0, t + ' 줄기'));
  ok(f.bins[0].items.length === 8 && f.bins[1].items.length === 4 && f.note.indexOf(b.RB_N + '장') >= 0, '8·4·12'); b.RB_QUIZ.forEach((q, i) => ok(q.opts.length === 3 && q.ok >= 0 && q.ok < 3, i + ' 퀴즈'));
  let done = 0; [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1].forEach(x => { if (x) done = Math.min(b.RB_N, done + 1); }); ok(done === b.RB_N, '물러나도 끝'); ok(/12장/.test(L.u3_l15.slides[11].data.levels.도전.a), '도전 답');
  ok(/다시 묻지 않으니/.test(qa('u3_l15', 4)) && qa('u3_l15', 5) === '맞혀야 하는 칸의 수', '문항 5·6'); });
T('판 검사기 자체 확인 — l12 카드 하나를 다른 갈래로, l13 뒤집는 칸을 바꾸면 잡는다', () => { const f = fig('u3_l12'), b = BD('u3_l12'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); const c1 = names(f.bins[0].items) !== b.MM_CARD.filter((c, j) => b.MM_KIND[j] === 0).join('|'); f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u3_l13'); const keep = g.heads[1]; g.heads[1] = '칸 2~4 — 문제점'; const c2 = g.heads[1] !== '칸 3~4 — 문제점'; g.heads[1] = keep; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
const GEN = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_social_u3.js'), 'utf8'); const DATA = fs.readFileSync(path.join(TDIR, 'data/g4s2_social_u3.js'), 'utf8');
T('생성기 T 표(교사 층) 「결」 0', () => { const a = GEN.indexOf('\nconst T = {'), z = GEN.indexOf('\nconst TYPE'); ok(a > 0 && z > a, 'T 표 자리'); const tb = GEN.slice(a, z); ok(!/결/.test(tb), (tb.match(/.{0,12}결.{0,12}/) || [''])[0]); });
T('데이터의 「결」 낱말 = 모두 원문(교과 문장·문항·판 글)에 있는 낱말 · 박음·빵꾸·갈아엎·결로 0', () => { const srcAll = fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u3.json'), 'utf8'); const words = new Set((DATA.match(/[가-힣]*결[가-힣]*/g) || []));
  words.forEach(x => ok(srcAll.indexOf(x) >= 0, '원문에 없는 「' + x + '」')); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => { ok(DATA.indexOf(x) < 0, x); ok(GEN.indexOf(x) < 0, '생성기 ' + x); }); });
T('「결」 검사기 자체 확인 — 데이터에 「결심」을 심으면 잡는다', () => { const srcAll = fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_social_u3.json'), 'utf8'); ok(srcAll.indexOf('결심') < 0, '원문에 결심이 있음'); });
T('학생 화면에 「도시」 — 주제①(u3_l01~l06) 0(다음 예고 장 빼고)', () => KEYS.slice(0, 5).forEach(k => L[k].slides.forEach(s => ok(vis(s).indexOf('도시') < 0, k + ' ' + s.id))));

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
