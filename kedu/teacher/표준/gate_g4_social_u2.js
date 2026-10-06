/* gate_g4_social_u2.js — 4학년 1학기 사회 2단원 「우리 지역의 국가유산」 케이티처 2세대 게이트 (78차, 베프) · 1단원 게이트(gate_g4_social_u1.js) 꼴.
   재료 = 자기주도 사회 4-1 2단원 l01~l12 → src_g4_social_u2.json(parse_selfdirected_soc4.js). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(지도서 1~16차시 빈틈 0 · l01·l08·l09·l12 = 두 시간 80분 · 원문 「지도서 N(~M)차시」 주석과 겹침 — l01 은 단원 도입 1차시를 더함 · l03·l04 는 둘 다 「4~5차시」라 4·5 로 나눔 · 성취기준 = 원문, l12 는 원문 없음 → 두 성취기준)
   B 19장 · C 7요소 · D 계보(1단원 u1_l13 → l01 → … → l12)
   E 정답 · F 원문 계승(동기 = 원문 1번 장 제목, l06·l11·l12 는 6번 · 판 장 = 원문 5번, l07 6번 · l08·l12 4번 · 카드 이름·아래 줄 = 원문 장 글 토막)
   G 그림(판 부품 = groups 5·link 2·tools 4·exhibit 1) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문·분
   L 선행 용어(온돌·처마·심미적·생태환경적·유네스코 l02 · 답사·해설사·누리집 l03 · 조사 수첩·추론·소재지 l04 · 가상 일기·역할놀이·해녀·자긍심 l05 · 안내판 l06 · 박물관·기념관·유적지 l07
     · 계획서·보고서·문헌·면담 l08 · 큐레이터·사진전·출처 l09 · 훼손·지킴이 l10 · 암호·캐릭터 l11 · 빙고 l12 전 학생 화면 0 · 원문도 같은 차례)
   M 판 대조(원문 판의 표 ↔ 판 그림 + 뜻 규칙으로 따로 셈) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_social_u2.js */
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
const L = load(path.join(TDIR, 'data/g4_social_u2.js'));
const PREV = load(path.join(TDIR, 'data/g4_social_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_social_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 12 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const COV = { u2_l01: [1, 2], u2_l02: [3], u2_l03: [4], u2_l04: [5], u2_l05: [6], u2_l06: [7], u2_l07: [8], u2_l08: [9, 10], u2_l09: [11, 12], u2_l10: [13], u2_l11: [14], u2_l12: [15, 16] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '우리 지역의 국가유산';
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
const BI = (k) => ({ u2_l07: 6, u2_l08: 4, u2_l12: 4 })[k] || 5;
const ASK = (k) => ({ u2_l06: 6, u2_l11: 6, u2_l12: 6 })[k] || 1;
const board = (k) => con(k).find(s => s.src === BI(k));
const slideText = (sl) => nb([sl.title, sl.bub, sl.note, sl.answer.join(' '), sl.items.join(' '), sl.scene.join(' ')].join(' '));
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };

console.log('═══ A. 로드 ═══');
T('12차시 키(자기주도 파일 번호 u2_l01~l12)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 사회 · unit 1 · covers = 지도서 차시 · 분 = 40 × 차시 수 · 성취기준 = 원문 · 제목 = 원문 <title> · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = COV[k];
  ok(m.grade === 4 && m.term === 1 && m.unit === 2 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '차시'), k + ' covers ' + m.covers); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(k === 'u2_l12' ? SRC[k].std === '' && m.std === '[4사06-01][4사06-02]' : m.std === SRC[k].std && m.std === (+k.slice(-2) <= 6 ? '[4사06-01]' : '[4사06-02]'), k + ' std ' + m.std); ok(m.title === nb(SRC[k].title) && m.title.length > 4, k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); }));
const GEX = { u2_l01: '단원 도입 1차시 + 원문 2차시', u2_l03: '원문 4~5차시 중 4', u2_l04: '원문 4~5차시 중 5' };
T('지도서 1~16차시 빈틈 0 · 두 시간 = l01·l08·l09·l12 · 원문 주석 「지도서 N(~M)차시」와 같음(예외 셋은 겹침 — l01 단원 도입 · l03·l04 4~5차시 나눔)', () => { const all = [].concat(...KEYS.map(k => COV[k])); ok(all.join() === Array.from({ length: 16 }, (_, i) => i + 1).join(), all.join()); ok(KEYS.filter(k => COV[k].length === 2).join() === 'u2_l01,u2_l08,u2_l09,u2_l12');
  let n = 0, ex = 0; KEYS.forEach(k => { const g = SRC[k].guide_note; ok(g, k + ' 주석 없음'); n++; const m = g.match(/(\d+)(?:~(\d+))?차시/); const a = +m[1], z = m[2] ? +m[2] : a, c = COV[k]; const same = a === c[0] && z === c[c.length - 1];
    if (GEX[k]) { ex++; ok(!same && c.some(x => x >= a && x <= z), k + ' 예외인데 겹침 아님 ' + g); } else ok(same, k + ' 주석 ' + g); }); ok(n === 12 && ex === 3, '주석 ' + n + ' 예외 ' + ex); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u1_l13.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '1단원 u1_l13') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_social:u1_l13'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 1번(l06·l11·l12 6번) 장 제목 · 개념 제목 = 원문 · 말풍선 = 원문 말풍선(없으면 답 상자) · 카드 이름·아래 줄 = 원문 장 글 토막 · 판 장 = 교사 한 줄', () => { const src = SRC[k];
  const ask = SLI(k, ASK(k)); ok(ask && ask.kind !== 'intro' && ask.kind !== 'board', '동기 장 꼴'); const mo = L[k].slides[2]; ok(mo.data.question === plain(ask.title) && mo.src === ask.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (s.src === BI(k)) { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === (sl.bub || sl.answer.join(' ')) && d.content, s.id + ' 말풍선 ≠ 원문'); const txt = slideText(sl); const f = d.fig;
    ok(f.k === 'tools' || f.k === 'chain', s.id + ' 부품 ' + f.k); ok(f.items.length >= 2, s.id + ' 카드 수'); f.items.forEach(it => { ok(txt.indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 문항의 틀린 보기 ↔ 그 문항 정답 · 정리 = 원문 정리 줄 · 돌아보기 = 원문 · 다음 = 원문 끝 장', () => { const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)];
  ok(m.data.right === q.opts[q.ci], '바른 생각'); ok(q.opts.indexOf(m.data.wrong) >= 0 && m.data.wrong !== m.data.right, '틀린 생각');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length === 3, '정리');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  ok(L[k].slides[18].data.preview === nb(SRC[k].end_note) && /다음/.test(SRC[k].end_note), '다음 ≠ 원문'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'groups', 'link', 'exhibit'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('판 부품 = groups 5(l01·l04·l07·l08·l10)·link 2(l02·l11)·tools 4(l03·l05·l06·l12)·exhibit 1(l09) · 판 장 = 원문 판 장(5번 · l07 6번 · l08·l12 4번) · 원문 그 장이 직접조작 판', () => { const bc = {}; KEYS.forEach(k => { const b = board(k); ok(b && SLI(k, BI(k)).kind === 'board', k + ' 판 장'); bc[b.data.fig.k] = (bc[b.data.fig.k] || []).concat(k.slice(-3)); });
  ok(JSON.stringify(bc) === JSON.stringify({ groups: ['l01', 'l04', 'l07', 'l08', 'l10'], link: ['l02', 'l11'], tools: ['l03', 'l05', 'l06', 'l12'], exhibit: ['l09'] }), JSON.stringify(bc)); KEYS.forEach(k => ok(SRC[k].slides.filter(x => x.kind === 'board').length === 1, k + ' 원문 판 하나')); });
T('짝 잇기(link) 칸이 전광판 칸 규칙에 덮이지 않음 — stage2.css 의 전광판 .so-lc 규칙은 .so-ledg 안으로만', () => { const css = fs.readFileSync(path.join(S2, 'stage2.css'), 'utf8'); const bad = css.split('\n').filter(l => /^\.so-lc(\.on)?[{.]/.test(l) && /#2B3446|#FFD24A|#FF8A3D|#5EC8FF/.test(l)); ok(bad.length === 0, bad.join(' | ')); });

console.log('═══ H. 중복 ═══');
KEYS.forEach(k => T(k + ' 개념 원문 장·기본 문제 문항·개념 제목 중복 0 · 판 장 1', () => { const c = con(k).map(s => s.src); ok(new Set(c).size === 4, '개념 src'); const p = L[k].slides.filter(s => s.block === 'basic_problem').map(s => s.src); ok(new Set(p).size === 3, '문항'); ok(new Set(con(k).map(s => s.data.title)).size === 4, '제목'); ok(c.filter(x => x === BI(k)).length === 1, '판 장'); }));

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
T('발문 분 합 — 40분 30~45 · 80분 60~88 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : m >= 60 && m <= 88, k + ' ' + m + '/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));
console.log('═══ L. 선행 용어 ═══');
const FIRST = [['온돌', 'u2_l02'], ['처마', 'u2_l02'], ['심미적', 'u2_l02'], ['생태환경적', 'u2_l02'], ['유네스코', 'u2_l02'], ['답사', 'u2_l03'], ['해설사', 'u2_l03'], ['누리집', 'u2_l03'], ['조사 수첩', 'u2_l04'], ['추론', 'u2_l04'], ['소재지', 'u2_l04'], ['가상 일기', 'u2_l05'], ['역할놀이', 'u2_l05'], ['해녀', 'u2_l05'], ['자긍심', 'u2_l05'], ['안내판', 'u2_l06'], ['박물관', 'u2_l07'], ['기념관', 'u2_l07'], ['유적지', 'u2_l07'], ['계획서', 'u2_l08'], ['보고서', 'u2_l08'], ['문헌', 'u2_l08'], ['면담', 'u2_l08'], ['큐레이터', 'u2_l09'], ['사진전', 'u2_l09'], ['출처', 'u2_l09'], ['훼손', 'u2_l10'], ['지킴이', 'u2_l10'], ['암호', 'u2_l11'], ['캐릭터', 'u2_l11'], ['빙고', 'u2_l12']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — l02 개념 장에 「박물관」을 심으면 잡는다', () => { const s = L.u2_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 박물관'; let caught = false; try { KEYS.slice(0, 6).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('박물관') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 끝 장을 뺀 원문 글에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'end').map(x => [x.title, x.bub, x.answer, x.items, x.note, x.scene])); if (i < i0) ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); if (i === i0) ok(txt.indexOf(w0) >= 0 || JSON.stringify(SRC[k].problems).indexOf(w0) >= 0, k0 + ' 원문에 없음 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
const D = (s) => plain(s);
T('l01 두 칸 — ① = TERMS type y 이름 차례 · ② = type m · 뜻 규칙(desc 의 건축물·물건 = 형태 있음 / 예술·놀이·기술 = 형태 없음)으로 따로 셈 · 문항 2·3·4·5 정답 = 칸 이름·칸 안', () => { const T0 = BD('u2_l01').TERMS, f = fig('u2_l01'); ok(f.k === 'groups' && f.bins.length === 2 && T0.length === 6);
  const rule = (t) => /건축물|물건/.test(t.desc) ? 'y' : /예술|놀이|기술/.test(t.desc) ? 'm' : '?'; T0.forEach(t => ok(rule(t) === t.type, t.name + ' 규칙'));
  ok(f.bins[0].items.map(x => x.name).join() === T0.filter(t => t.type === 'y').map(t => t.name).join() && f.bins[1].items.map(x => x.name).join() === T0.filter(t => t.type === 'm').map(t => t.name).join(), '칸');
  ok(f.bins[0].name.indexOf(qa('u2_l01', 1)) === 0 && f.bins[1].name.indexOf(qa('u2_l01', 2)) === 0 && qa('u2_l01', 5) === '무형유산', '칸 이름'); ok(f.bins[1].items.some(x => x.name === qa('u2_l01', 3)), '판소리'); ok(f.bins[0].items.some(x => x.name === '도자기') && qa('u2_l01', 4) === '형태가 있는 문화유산', '도자기'); });
T('l02 특징 → 가치 — link 여섯 줄 = TERMS 차례 · 오른쪽 = val + 가치 · 뜻 규칙(따뜻·시원·영양 = 과학적 · 아름다 = 심미적 · 나무·흙·돌 = 생태환경적 · 여러 세대 = 역사적)으로 따로 셈 · 네 가치 모두 · 문항 2·3·5·6 정답 = 그 특징 줄', () => { const T0 = BD('u2_l02').TERMS, f = fig('u2_l02'); ok(f.k === 'link' && f.rows.length === 6);
  const rule = (d) => /여러 세대/.test(d) ? '역사적' : /아름다/.test(d) ? '심미적' : /나무·흙·돌/.test(d) ? '생태환경적' : /따뜻|시원|영양/.test(d) ? '과학적' : '?';
  T0.forEach((t, i) => { ok(rule(t.desc) === t.val, t.name + ' 규칙'); ok(f.rows[i][0].name === t.src + ' · ' + t.name && f.rows[i][1].name === t.val + ' 가치', t.name + ' 줄'); }); ok(new Set(T0.map(t => t.val)).size === 4, '네 가치');
  const row = (n) => f.rows.find(r => r[0].name.endsWith(' · ' + n))[1].name; ok(row('온돌') === qa('u2_l02', 1) && row('마루') === qa('u2_l02', 1), '온돌·마루'); ok(row('처마') === qa('u2_l02', 2), '처마'); ok(row('자연 재료') === qa('u2_l02', 4), '자연 재료'); ok(row('함께 담그기') === qa('u2_l02', 5), '함께 담그기'); });
T('l03 조사 방법 — tools 넷 = TERMS 이름·desc(태그 뺌) · 문항 1 정답 답사 = 「직접 찾아가」 칸 · 문항 2 = 누리집 칸 · 문항 4 해설사 = 해설사 칸 · 문항 5 = 답사 칸의 유의점', () => { const T0 = BD('u2_l03').TERMS, f = fig('u2_l03'); ok(f.k === 'tools' && f.items.length === 4); T0.forEach((t, i) => ok(f.items[i].name === t.name && f.items[i].kind === D(t.desc), t.name));
  const it = (re) => f.items.find(x => re.test(x.name)); ok(qa('u2_l03', 0) === '답사' && /직접 찾아가/.test(it(/답사/).kind), '답사'); ok(/누리집/.test(qa('u2_l03', 1)) && /국가유산 포털/.test(it(/누리집/).kind), '누리집'); ok(it(/해설사/).kind.indexOf(qa('u2_l03', 3)) >= 0, '해설사'); ok(/계획/.test(it(/답사/).kind) && /촬영 가능한 곳/.test(it(/답사/).kind) && /답사 계획/.test(qa('u2_l03', 4)), '유의점'); });
T('l04 조사 수첩 — 기본 정보 칸 = kind 기본 label 넷 차례 · 특징 칸 = kind 사실 desc · 가치 칸 = kind 추론 desc · 뜻 규칙(층층이 쌓음 = 눈으로 확인 = 특징 · 솜씨 = 추론 = 가치) · 문항 5·6 정답', () => { const T0 = BD('u2_l04').TERMS, f = fig('u2_l04'); ok(f.k === 'groups' && f.bins.length === 3);
  ok(f.bins[0].items.map(x => x.name).join() === T0.filter(t => t.kind === '기본').map(t => t.label).join() && f.bins[0].items.length === 4, '기본'); ok(f.bins[1].items.length === 1 && /층층이 쌓아/.test(f.bins[1].items[0].name) && T0.find(t => t.kind === '사실').label === '특징', '특징'); ok(f.bins[2].items.length === 1 && /솜씨/.test(f.bins[2].items[0].name) && T0.find(t => t.kind === '추론').label === '가치', '가치');
  ok(/층층이/.test(SRC.u2_l04.problems[4].t) && /^특징/.test(qa('u2_l04', 4)), '문항 5'); ok(/솜씨/.test(SRC.u2_l04.problems[5].t) && /^가치/.test(qa('u2_l04', 5)), '문항 6'); ok(f.bins[0].items.some(x => x.name === '소재지') && !f.bins.some(b => b.items.some(x => x.name === '내일의 날씨')), '소재지'); });
T('l05 표현 방법 — tools 넷 = TERMS 이름·desc · 뜻 규칙(노래·춤 = 공연 · 일기 = 가상 일기 · 대본 = 역할놀이) = 문항 2·3·4 정답 · 강강술래 = 공연 칸 = 문항 8 정답 「원을 그리며」', () => { const T0 = BD('u2_l05').TERMS, f = fig('u2_l05'); ok(f.k === 'tools' && f.items.length === 4); T0.forEach((t, i) => ok(f.items[i].name === t.name && f.items[i].kind === D(t.desc), t.name));
  const by = (re) => f.items.find(x => re.test(x.kind)).name; ok(by(/노래·춤/) === qa('u2_l05', 1), '공연'); ok(by(/일기를 써요/) === qa('u2_l05', 2), '가상 일기'); ok(by(/대본/) === qa('u2_l05', 3), '역할놀이'); ok(by(/강강술래/) === '공연하기' && /원을 그리며/.test(qa('u2_l05', 7)), '강강술래'); ok(/역사적 사실을 토대로/.test(f.items[1].kind) && /역사적 사실을 토대로/.test(qa('u2_l05', 4)), '사실 토대'); });
T('l06 주제① 개념 — tools 여섯 = TERMS 이름·desc(차시 꼬리 뺌) · desc 꼬리 (lNN) 차례 = 1·1·2·3·4·5 = 주제① 차시 · 조사 칸에 답사(문항 4) · 정리 칸에 사실(문항 5)', () => { const T0 = BD('u2_l06').TERMS, f = fig('u2_l06'); ok(f.k === 'tools' && f.items.length === 6); T0.forEach((t, i) => { ok(f.items[i].name === t.name && f.items[i].kind === D(t.desc).replace(/\s*\(l\d+\)$/, ''), t.name); ok(!/\(l\d+\)/.test(f.items[i].kind), t.name + ' 꼬리'); });
  ok(T0.map(t => +D(t.desc).match(/\(l(\d+)\)$/)[1]).join() === '1,1,2,3,4,5', '차시 차례'); ok(f.items[3].kind.indexOf(qa('u2_l06', 3)) >= 0, '답사'); ok(/사실/.test(f.items[4].kind) && /사실/.test(qa('u2_l06', 4)), '사실'); });
T('l07 세 칸 — 박물관/기념관/유적지 = TERMS type mus/mem/site · 뜻 규칙(desc 전시 = 박물관 · 기억 = 기념관 · 흔적·유적 = 유적지) 따로 셈 · 둘·둘·둘 · 문항 1·2·3 정답 = 칸 이름', () => { const T0 = BD('u2_l07').TERMS, f = fig('u2_l07'); ok(f.k === 'groups' && f.bins.length === 3);
  const rule = (d) => /기억/.test(d) ? 'mem' : /흔적|유적/.test(d) ? 'site' : /전시|보여 주는/.test(d) ? 'mus' : '?'; T0.forEach(t => ok(rule(t.desc) === t.type, t.name + ' 규칙'));
  ['mus', 'mem', 'site'].forEach((ty, i) => ok(f.bins[i].items.map(x => x.name).join() === T0.filter(t => t.type === ty).map(t => t.name).join() && f.bins[i].items.length === 2, ty)); ok(f.bins.map(b => b.name).join() === [qa('u2_l07', 0), qa('u2_l07', 1), qa('u2_l07', 2)].join(), '칸 이름 = 문항'); });
T('l08 계획서 세 칸 — 칸 = KIND 차례(무엇을·어떻게·함께·주의) · 칸 안 = TERMS label · 문항 5 정답 「조사하고 느낀 점」은 계획서 어느 칸에도 없음 · 「조사 방법」 = 어떻게 칸', () => { const b = BD('u2_l08'), f = fig('u2_l08'); ok(f.k === 'groups' && f.bins.length === 3);
  Object.keys(b.KIND).forEach((kd, i) => { ok(f.bins[i].name === b.KIND[kd].label, kd); ok(f.bins[i].items.map(x => x.name).join() === b.TERMS.filter(t => t.kind === kd).map(t => t.label).join(), kd + ' 칸 안'); });
  const all = [].concat(...f.bins.map(x => x.items.map(y => y.name))); ok(all.length === 6 && all.indexOf(qa('u2_l08', 4)) < 0, '느낀 점'); ok(f.bins[1].items.some(x => x.name === '조사 방법'), '방법'); });
T('l09 전시대 — exhibit 다섯 = TERMS 이름·좋은 점 · 제목 = 문항 4 정답 · 사진전 칸에 출처(문항 5) · 동영상 만드는 차례 첫 단계 = 촬영(문항 2)', () => { const T0 = BD('u2_l09').TERMS, f = fig('u2_l09'); ok(f.k === 'exhibit' && f.items.length === 5); T0.forEach((t, i) => ok(f.items[i].name === t.name && f.items[i].use === t.good && f.items[i].emoji === t.emoji, t.name));
  ok(f.title === qa('u2_l09', 3), '제목'); ok(/출처/.test(T0.find(t => t.k === 'photoex').good) && /출처/.test(qa('u2_l09', 4)), '출처'); ok(/^촬영/.test(T0.find(t => t.k === 'movie').how) && /촬영/.test(qa('u2_l09', 1)), '촬영'); });
T('l10 보존 두 칸 — 칸 = WHO 차례 · 셋·셋 · 칸 안 = TERMS 이름 · 문항 4 정답(낙서)은 어느 칸에도 없음 · 문항 5 정답 재정·기술 = 유네스코 desc · 문항 7 정답 = 우리 칸 지킴이', () => { const b = BD('u2_l10'), f = fig('u2_l10'); ok(f.k === 'groups' && f.bins.length === 2);
  Object.keys(b.WHO).forEach((w0, i) => { ok(f.bins[i].name === b.WHO[w0].label, w0); ok(f.bins[i].items.map(x => x.name).join() === b.TERMS.filter(t => t.who === w0).map(t => t.name).join() && f.bins[i].items.length === 3, w0 + ' 칸 안'); });
  const all = [].concat(...f.bins.map(x => x.items.map(y => y.name))); ok(all.every(n => n.indexOf('낙서') < 0) && /낙서/.test(qa('u2_l10', 3)), '낙서'); ok(/재정·기술/.test(b.TERMS.find(t => t.k === 'unesco').desc) && /재정·기술/.test(qa('u2_l10', 4)), '유네스코'); ok(f.bins[1].items.some(x => /지킴이/.test(x.name)) && /지킴이/.test(qa('u2_l10', 6)), '지킴이'); });
T('l11 암호 — link 다섯 줄 = TERMS 차례·글 · 오른쪽 = ok · 뜻 규칙(계획서에 느낀 점 = 틀림 · 어른들만 = 틀림)으로 따로 셈 · 옳은 번호 1·2·4 → 암호 124 = 그림 풀이 = 원문 답 장 「1 2 4」 · 문항 7 정답 = 보고서', () => { const T0 = BD('u2_l11').TERMS, f = fig('u2_l11'); ok(f.k === 'link' && f.rows.length === 5);
  const rule = (t) => !(/계획서/.test(t.text) && /느낀 점/.test(t.text)) && !/어른들만/.test(t.text); T0.forEach((t, i) => { ok(rule(t) === t.ok, t.no + ' 규칙'); ok(f.rows[i][0].name.endsWith(D(t.text)) && f.rows[i][1].name === (t.ok ? '⭕ 옳아요' : '❌ 틀려요'), t.no + ' 줄'); });
  const code = T0.filter(t => t.ok).map(t => t.no).join(''); ok(code === '124' && f.note.indexOf('**' + code + '**') > 0, '암호'); ok(/1 2 4/.test(SLI('u2_l11', 6).answer.join(' ')), '원문 답'); ok(qa('u2_l11', 6) === '조사 보고서', '문항 7'); ok(L.u2_l11.slides[14].data.note.indexOf('**124**') >= 0, '생각을 넓혀요 풀이'); });
T('l12 생각 그물 — tools 여섯 = TERMS 차례 · 이름 = ①(t1)·②(t2) + label · 아래 줄 = fill · 셋·셋 · 차시 꼬리 차례 증가 · 도전 답 두 묶음 = topic 그대로 · 문항 3 정답 = 장소 가지', () => { const b = BD('u2_l12'), f = fig('u2_l12'); ok(f.k === 'tools' && f.items.length === 6);
  b.TERMS.forEach((t, i) => ok(f.items[i].name === (t.topic === 't1' ? '① ' : '② ') + t.label && f.items[i].kind === D(t.fill), t.label)); ok(b.TERMS.filter(t => t.topic === 't1').length === 3 && b.TERMS.slice(0, 3).every(t => t.topic === 't1'), '셋·셋');
  const first = b.TERMS.map(t => +t.lesson.match(/\d+/)[0]); for (let i = 1; i < first.length; i++) ok(first[i] > first[i - 1], '차시 차례 ' + i);
  const a = L.u2_l12.slides[11].data.levels['도전'].a; ok(a.indexOf('주제① — ' + b.TERMS.filter(t => t.topic === 't1').map(t => t.label).join(' · ')) === 0 && a.indexOf('주제② — ' + b.TERMS.filter(t => t.topic === 't2').map(t => t.label).join(' · ')) > 0, '도전 답');
  ok(f.items[3].kind.replace(/\s/g, '') === qa('u2_l12', 2).replace(/\s/g, ''), '장소 가지 = 문항 3'); });
T('판 검사기 자체 확인 — l01 칩 하나를 다른 칸으로, l11 줄 하나를 뒤집으면 잡는다', () => { const f = fig('u2_l01'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); const T0 = BD('u2_l01').TERMS; const c1 = f.bins[0].items.map(y => y.name).join() !== T0.filter(t => t.type === 'y').map(t => t.name).join(); f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u2_l11'); const keep = g.rows[2][1].name; g.rows[2][1].name = '⭕ 옳아요'; const c2 = g.rows[2][1].name !== (BD('u2_l11').TERMS[2].ok ? '⭕ 옳아요' : '❌ 틀려요'); g.rows[2][1].name = keep; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
T('데이터·생성기 차단 어휘 0 (박음·빵꾸·갈아엎·결로)', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_social_u2.js'), 'utf8') + fs.readFileSync(path.join(TDIR, 'scripts/gen_g4_social_u2.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => ok(t.indexOf(x) < 0, x)); });
T('학생 화면에 「문화재」 0 — 원문은 예전 이름으로만 씀', () => KEYS.forEach(k => L[k].slides.forEach(s => ok(vis(s).indexOf('문화재') < 0, k + ' ' + s.id))));

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
