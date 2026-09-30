/* gate_g3s2_social_u2.js — 3학년 2학기 사회 2단원 「옛날과 오늘날의 생활 모습」 케이티처 2세대 게이트 (53차, 베프) · u1 게이트와 같은 꼴.
   재료 = 자기주도 사회 3-2 2단원(지금 채워진 l01~l06) → src_g3s2_social_u2.json(parse_selfdirected_soc.js). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(두 시간 한 파일 l03·l04·l06 = 80분 · covers = 지도서 2~10차시 빈틈 0 · 성취기준 = 원문 [4사04-01]) · B 19장 골격 · C 7요소 · D 복습 계보(1단원 u1_l12 → l01 → … → l06)
   E 정답 표시 · F 원문 계승 · G 그림(판 부품 = groups 2·tline·then·tools·chain) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문 6장↑·분 합
   L 선행 용어(학생 화면: 두레·품앗이 l02 전 · 폐백·수목장·해양장 l03 전 · 부럼·오곡밥·양력·수리취떡 l04 전 · 직업 l05 전 · 투호·고누·제기차기·지도사 l06 전 0 — 표지·다음 예고 제외 · 원문도 같은 차례)
   M 판 대조(원문 판의 표 ↔ 판 그림 + 뜻 규칙으로 따로 셈: l01 두 동그라미 · l02 일생 길 축하·위로 · l03 비교표 같아요/달라요 · l04 다섯 명절 단서 · l05 형광펜 두 색 · l06 만들기 차례) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_social_u2.js */
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
const L = load(path.join(TDIR, 'data/g3s2_social_u2.js'));
const PREV = load(path.join(TDIR, 'data/g3s2_social_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_social_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 6 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '옛날과 오늘날의 생활 모습';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SLI = (k, i) => SRC[k].slides.find(x => x.i === i);
const BD = (k) => SRC[k].board_data;
const PRE = (k) => Object.keys(BD(k)).find(x => /_FINQ$/.test(x)).slice(0, 2);
const con = (k) => L[k].slides.filter(s => s.block === 'concept');
const board = (k) => con(k).find(s => SLI(k, s.src).kind === 'board');

console.log('═══ A. 로드 ═══');
T('6차시 키(자기주도 파일 번호 u2_l01~l06 — 지금 채워진 것)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 사회 · unit 1 · unit_title · covers = 지도서 차시 · 분 = 40 × 차시 수 · 성취기준 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = SRC[k].covers;
  ok(m.grade === 3 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '차시'), k + ' covers'); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(/^\[4사04-01\]$/.test(m.std) && m.std === SRC[k].std, k + ' std ' + m.std); ok(m.title === nb(SRC[k].title), k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); }));
T('두 시간 한 파일 = l03·l04·l06 (원문 머리 주석) · 지도서 2~10차시 빈틈 0', () => { ok(KEYS.filter(k => SRC[k].covers.length === 2).join() === 'u2_l03,u2_l04,u2_l06'); const all = [].concat(...KEYS.map(k => SRC[k].covers)); ok(all.join() === Array.from({ length: 9 }, (_, i) => i + 2).join(), all.join()); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u1_l12.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '1단원 u1_l12') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_social:u1_l12'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 들어가기 물음 · 개념 제목·말풍선 = 원문 · 카드/목록 = 원문 줄 · 판 장 = 교사 한 줄', () => { const src = SRC[k];
  const intro = src.slides.find(x => x.kind === 'intro'); const mo = L[k].slides[2]; ok(mo.data.question === nb(intro.title) && mo.src === intro.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (sl.kind === 'board') { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === sl.bub && sl.bub, s.id + ' 말풍선 ≠ 원문'); const lines = sl.answer.length ? sl.answer : sl.items; const txt = nb(lines.join(' '));
    const f = d.fig; if (f.k === 'note') ok(JSON.stringify(f.items) === JSON.stringify(lines), s.id + ' 목록 ≠ 원문');
    else if (f.k === 'tools' || f.k === 'chain') { ok(f.items.length === lines.length, s.id + ' 카드 수'); f.items.forEach((it, j) => { ok(nb(lines[j]).indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }
    else if (f.k === 'then') f.rows.forEach(r => [r.old, r.now].forEach(c => ok(txt.indexOf(nb(c.name).split(',')[0]) >= 0 || /없어요/.test(c.name), s.id + ' then ' + c.name)));
    else if (f.k === 'link') f.rows.forEach(r => ok(txt.indexOf(r[0]) >= 0 && txt.indexOf(r[1]) >= 0, s.id + ' link ' + r));
    else ok(false, s.id + ' 부품 ' + f.k); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 판 마무리 3택(틀린 보기 ↔ 정답 보기) · 정리 = 원문 정리 줄 · 스스로 돌아보기·다음 = 원문', () => { const b = BD(k), P = PRE(k), fin = b[P + '_FINQ'], okI = b[P + '_FIN_OK'];
  const m = L[k].slides[7].data; ok(m.right === fin[okI], '바른 생각'); ok(fin.indexOf(m.wrong) >= 0 && m.wrong !== fin[okI], '틀린 생각');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length >= 3, '정리');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  const nx = L[k].slides[18].data.preview; if (SRC[k].next) ok(nx === nb(SRC[k].next), '다음 ≠ 원문'); else ok(/다음 시간에는/.test(nx), '다음'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'note', 'then', 'groups', 'link', 'sort2', 'tline'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('부품 가짓수 ≥ 5 · 판 부품 = groups 2·tline 1·then 1·tools 1·chain 1', () => { const cnt = {}; KEYS.forEach(k => con(k).forEach(s => cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1)); const bc = {}; KEYS.forEach(k => { const f = board(k).data.fig; bc[f.k] = (bc[f.k] || 0) + 1; });
  ok(Object.keys(cnt).length >= 5, JSON.stringify(cnt)); ok(bc.groups === 2 && bc.tline === 1 && bc.then === 1 && bc.tools === 1 && bc.chain === 1, JSON.stringify(bc)); });
T('tline 일곱 칸 렌더 · 켠 칸(위로) 하나', () => { const h = FIG.render(board('u2_l02').data.fig); ok((h.match(/so-ev /g) || []).length === 7, '칸 수'); ok((h.match(/so-ev [^"]* on/g) || []).length === 1, '켠 칸'); });

console.log('═══ H. 중복 ═══');
KEYS.forEach(k => T(k + ' 개념 원문 장·기본 문제 문항·개념 제목 중복 0 · 판 장 1', () => { const c = con(k).map(s => s.src); ok(new Set(c).size === 4, '개념 src'); const p = L[k].slides.filter(s => s.block === 'basic_problem').map(s => s.src); ok(new Set(p).size === 3, '문항'); ok(new Set(con(k).map(s => s.data.title)).size === 4, '제목'); ok(con(k).filter(s => SLI(k, s.src).kind === 'board').length === 1, '판 장'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 정답 열림', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 깨짐');
  if (s.block === 'offline_activity') ok(r.body.indexOf(s.data.solo[0]) >= 0, s.id + ' 1인 흐름'); if (s.block === 'basic_problem' && rev) ok((r.body.match(/opt ok/g) || []).length === 1, s.id + ' 정답 열림'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재 · 더 물어보기 = 원문 문항 · 헷갈리는 생각 = 판 마무리 틀린 보기', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id));
  const qs = ex.filter(e => e.type === 'fun_question'); ok(qs.length === 5 && qs.every(e => SRC[k].problems.some(p => p.t === e.content)), '더 물어보기'); const b = BD(k), P = PRE(k); ex.filter(e => e.type === 'misconception').forEach(e => ok(b[P + '_FINQ'].some((f, i) => i !== b[P + '_FIN_OK'] && e.content.indexOf(f) === 0), 'x ' + e.content)); }));

console.log('═══ K. 발문 ═══');
T('발문 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합 — 40분 30~45 · 80분 60~88 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : m >= 60 && m <= 88, k + ' ' + m + '/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
const FIRST = [['두레', 'u2_l02'], ['품앗이', 'u2_l02'], ['폐백', 'u2_l03'], ['수목장', 'u2_l03'], ['해양장', 'u2_l03'], ['부럼', 'u2_l04'], ['오곡밥', 'u2_l04'], ['양력', 'u2_l04'], ['수리취떡', 'u2_l04'], ['직업', 'u2_l05'], ['투호', 'u2_l06'], ['고누', 'u2_l06'], ['제기차기', 'u2_l06'], ['지도사', 'u2_l06']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — l02 개념 장에 「투호」를 심으면 잡는다', () => { const s = L.u2_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 투호'; let caught = false; try { KEYS.slice(0, 5).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('투호') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 들어가기·살펴보기·정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'board').map(x => [x.title, x.bub, x.answer, x.items])) + JSON.stringify(SRC[k].summary); ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };
T('l01 두 동그라미 — 바깥(일상생활 속 풍습)/안쪽(세시 풍속) = PC_CARD r · 뜻 규칙(차례·송편·세배·전통 놀이·명절·설날·추석 = 세시 풍속) · 넷·넷 · 판 읽기 정답 = 안쪽이 바깥 안에', () => { const b = BD('u2_l01'), f = fig('u2_l01'); ok(f.k === 'groups' && f.bins.length === 2);
  b.PC_CARD.forEach(c => { const want = /차례|송편|세배|전통 놀이|명절|설날|추석/.test(c.text) ? 1 : 0; ok(c.r === want, c.text + ' 규칙'); ok(f.bins[c.r].items.indexOf(c.text) >= 0, c.text + ' 칸'); });
  ok(f.bins[0].items.length === 4 && f.bins[1].items.length === 4, '넷·넷'); ok(/안에 있어요/.test(b.PC_READQ[b.PC_READ_OK]) && qa('u2_l01', 7) === '세시 풍속 동그라미는 풍습 동그라미 안에 있어요', '판 읽기·문항 8'); });
T('l02 일생 길 — tline 일곱 = GW_STOP 차례 · 쪽지 자리 = 정거장 하나씩 · 뜻 규칙(죽은·위로 = 위로 쪽지) · 위로 = 장례 하나 · 켠 칸 = 장례', () => { const b = BD('u2_l02'), f = fig('u2_l02'); ok(f.k === 'tline' && f.items.map(x => x.what).join() === b.GW_STOP.map(x => x.name).join(), '정거장');
  ok(b.GW_SLIP.map(x => x.at).sort().join() === '0,1,2,3,4,5,6', '쪽지 자리'); b.GW_SLIP.forEach(x => ok(x.k === (/죽은|위로/.test(x.text) ? 1 : 0), x.text + ' 규칙'));
  const on = f.items.map((x, i) => x.on ? i : -1).filter(i => i >= 0); ok(on.length === 1 && b.GW_STOP[on[0]].name === '장례', '켠 칸 ' + on); ok(f.note.indexOf(b.GW_LAMP[1] + ' 1(장례)') >= 0 && f.note.indexOf(b.GW_LAMP[0] + ' 6') >= 0, 'note ' + f.note);
  ok(/출생 → 백일 → 첫돌 → 관례 → 혼례 → 회갑 → 장례/.test(L.u2_l02.slides[11].data.levels['도전'].a) && b.GW_STOP.map(x => x.name).join(' → ') === '출생 → 백일 → 첫돌 → 관례 → 혼례 → 회갑 → 장례', '도전 답 = 정거장 차례'); });
T('l03 비교표 — then 여섯 줄 = DJ_ROW · 옛·오늘 글이 같으면 「같아요」(k 1)·다르면 「달라요」 — 따로 셈 · 같아요 둘(축복·알림) = 문항 7 정답의 마음', () => { const b = BD('u2_l03'), f = fig('u2_l03'); ok(f.k === 'then' && f.rows.length === 6);
  b.DJ_ROW.forEach((r, i) => { const same = r.old === r.now; ok(r.k === (same ? 1 : 0), r.name + ' 규칙'); ok(f.rows[i].old.name === r.old && f.rows[i].now.name === r.now && f.rows[i].now.note === b.DJ_SEAL[same ? 1 : 0], r.name + ' 줄'); });
  ok(b.DJ_ROW.filter(r => r.k === 1).map(r => r.name).join() === '축복,알림', '같아요'); ok(/축복/.test(qa('u2_l03', 6)) && /알리고 축복/.test(qa('u2_l03', 7)), '문항'); });
T('l04 다섯 명절 — tools 다섯 = SX_DAY(이름·날짜·음식) · 상자마다 「먹는 음식」 단서에 그 명절 음식 · 다섯 상자가 다섯 명절 하나씩 · 동지만 양력(생각을 넓혀요 풀이와 같음)', () => { const b = BD('u2_l04'), f = fig('u2_l04'); ok(f.k === 'tools' && f.items.length === 5);
  b.SX_DAY.forEach((d, i) => ok(f.items[i].name === d.name && f.items[i].kind === d.date + ' · ' + d.food, d.name));
  ok(b.SX_BOX.map(x => x.k).sort().join() === '0,1,2,3,4', '상자 = 명절 하나씩'); b.SX_BOX.forEach(x => { const food = b.SX_DAY[x.k].food; ok(x.clue[1].indexOf(food) >= 0, x.mark + ' 음식 ' + food); b.SX_DAY.forEach((d, j) => { if (j !== x.k) ok(x.clue[1].indexOf(d.food) < 0, x.mark + ' 다른 음식 ' + d.food); }); });
  const yang = b.SX_DAY.filter(d => /양력/.test(d.date)).map(d => d.name); ok(yang.join() === '동지', '양력 ' + yang); ok(L.u2_l04.slides[14].data.note.indexOf('**동지**는 **양력**') >= 0, '풀이'); });
T('l05 형광펜 — 노랑(이어져 오는 모습)/하늘색(달라진 모습) = YP_BIT k · 뜻 규칙(차례·세배·떡국 = 이어져 옴) · 셋·여섯 · 문항 6 정답 ∈ 노랑', () => { const b = BD('u2_l05'), f = fig('u2_l05'); ok(f.k === 'groups' && f.bins.length === 2);
  b.YP_BIT.forEach(x => { ok(x.k === (/차례|세배|떡국/.test(x.text) ? 0 : 1), x.text + ' 규칙'); ok(f.bins[x.k].items.indexOf(x.text) >= 0, x.text + ' 칸'); });
  ok(f.bins[0].items.length === 3 && f.bins[1].items.length === 6, '셋·여섯'); ok(/차례를 지내고 세배/.test(qa('u2_l05', 5)), '문항 6'); });
T('l06 만들기 차례 — chain 넷 = JM_STEP n 차례 · 첫 단계 = 문항 5 정답(준비) · 끝 = 손잡이 · 준비물 = JM_GEAR need(윷·제기·투호 화살은 빼기)', () => { const b = BD('u2_l06'), f = fig('u2_l06'); ok(f.k === 'chain' && f.items.length === 4);
  const ord = b.JM_STEP.slice().sort((x, y) => x.n - y.n).map(x => x.text); ok(f.items.map(x => x.name).join('|') === ord.join('|'), '차례');
  const stem = (t) => t.replace(/(해요|하기|어요|요)\.?$/, '').replace(/\s/g, ''); ok(stem(ord[0]).indexOf(stem(qa('u2_l06', 4)).slice(0, 12)) === 0, '첫 단계 = 문항 5'); ok(/손잡이/.test(ord[3]), '끝 = 손잡이');
  b.JM_GEAR.forEach(g => ok(g.need === (/윷|제기|투호/.test(g.name) ? 0 : 1), g.name + ' 준비물 규칙')); });
T('판 검사기 자체 확인 — l01 카드 하나를 다른 동그라미로, l06 차례 둘을 바꾸면 잡는다', () => { const f = fig('u2_l01'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); let c1 = false; try { BD('u2_l01').PC_CARD.forEach(c => ok(f.bins[c.r].items.indexOf(c.text) >= 0)); } catch (e) { c1 = true; } f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u2_l06'); const t = g.items[1]; g.items[1] = g.items[2]; g.items[2] = t; const ord = BD('u2_l06').JM_STEP.slice().sort((a, b) => a.n - b.n).map(x => x.text); const c2 = g.items.map(x => x.name).join('|') !== ord.join('|'); g.items[2] = g.items[1]; g.items[1] = t; ok(c1 && c2, '못 잡음'); });
console.log('═══ N. 차단 어휘 ═══');
T('데이터·생성기 차단 어휘 0 (박음·빵꾸·갈아엎·결로)', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g3s2_social_u2.js'), 'utf8') + fs.readFileSync(path.join(TDIR, 'scripts/gen_g3s2_social_u2.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => ok(t.indexOf(x) < 0, x)); });

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
