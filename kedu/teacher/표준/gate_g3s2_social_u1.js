/* gate_g3s2_social_u1.js — 3학년 2학기 사회 1단원 「사회 변화와 다양한 문화」 케이티처 2세대 게이트 (45차, 베프).
   재료는 자기주도 사회 3-2(ka- 사회 골격 · 직접조작 판) → src_g3s2_social_u1.json(parse_selfdirected_soc.js). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(두 시간 한 파일 = 80분 · covers = 지도서 차시 · 성취기준 = 원문) · B 19장 골격 · C 7요소 · D 복습 계보(1학기 g3_social u2_l18 → l01 → … → l12)
   E 정답 표시(기본 문제 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭) · F 원문 계승(동기 물음 = 원문 들어가기 · 개념 = 원문 말풍선·제목 · 카드/목록 = 원문 답·목록 줄 · 오개념 = 원문 판 마무리 3택(틀린 보기 ↔ 정답 보기) · 정리·스스로 돌아보기·다음 = 원문)
   G 그림 렌더(사회 부품 · 45차 sbars·dots) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문 6장↑·분 합(40분 30~45 · 80분 60~88)
   L 선행 용어(학생 화면: 저출산·출산율 l02 전 · 고령화 l03 전 · 인공지능·지능정보화·정보 통신 기술 l04 전 · 세계화·한류 l05 전 · 의식주·규범 l07 전 · 이주민·1인 가구·반려동물 l08 전 · 편견·차별 l09 전 · 유니버설 l10 전 0 — 표지·다음 예고 제외 · 원문도 같은 차례)
   M 판 대조(원문 판의 표 ↔ 케이티처 판 그림 + 뜻 규칙으로 따로 셈: l01 원인 · l02 막대·두 해 차이 · l03 백 명 마을 · l04 누려요/보완해요 · l05 들어온/나간 실 · l06 남은 글자 = 세계화 · l07 우리 학교 문화 · l08 깃발 · l09 두 면 · l10 존중의 탑 · l11 ○✗·버스 · l12 딩고 네 주제) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_social_u1.js */
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
const L = load(path.join(TDIR, 'data/g3s2_social_u1.js'));
const PREV = load(path.join(TDIR, 'data/g3_social_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_social_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 12 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '사회 변화와 다양한 문화';
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
T('12차시 키(자기주도 파일 번호 u1_l01~l12)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 사회 · unit 1 · unit_title · covers = 지도서 차시 · 분 = 40 × 차시 수 · 성취기준 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = SRC[k].covers;
  ok(m.grade === 3 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '차시'), k + ' covers'); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(/^(\[4사03-0[12]\])+$/.test(m.std) && m.std === SRC[k].std, k + ' std ' + m.std); ok(m.title === nb(SRC[k].title), k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); }));
T('두 시간 한 파일 = l04·l08·l09·l10·l12 (원문 머리 주석) · 지도서 2~18차시 빈틈 0', () => { ok(KEYS.filter(k => SRC[k].covers.length === 2).join() === 'u1_l04,u1_l08,u1_l09,u1_l10,u1_l12'); const all = [].concat(...KEYS.map(k => SRC[k].covers.length === 2 ? [SRC[k].covers[0], SRC[k].covers[1]] : SRC[k].covers)); ok(all.join() === Array.from({ length: 17 }, (_, i) => i + 2).join(), all.join()); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u2_l18.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '1학기 u2_l18') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3_social:u2_l18'), 'from ' + rv.from); }));

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
const SO = ['tools', 'chain', 'note', 'then', 'groups', 'link', 'sort2', 'sbars', 'dots'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('부품 가짓수 ≥ 8 · 판 부품 = sbars 1·dots 1·then 3·groups 5·note 1·sort2 1', () => { const cnt = {}; KEYS.forEach(k => con(k).forEach(s => cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1)); const bc = {}; KEYS.forEach(k => { const f = board(k).data.fig; bc[f.k] = (bc[f.k] || 0) + 1; });
  ok(Object.keys(cnt).length >= 8, JSON.stringify(cnt)); ok(bc.sbars === 1 && bc.dots === 1 && bc.then === 3 && bc.groups === 5 && bc.note === 1 && bc.sort2 === 1, JSON.stringify(bc)); });
T('45차 부품 — sbars data-v·hi·두 해 캡션 · dots data-on·동그라미 수', () => { const h = FIG.render({ k: 'sbars', x: ['가', '나', '다'], v: [9, 5, 7], unit: '명', hi: [0, 1], cmp: true }); ok(/data-v="9,5,7"/.test(h) && /4명 줄었어요/.test(h) && (h.match(/<rect/g) || []).length === 3, 'sbars');
  const d = FIG.render({ k: 'dots', groups: [{ name: 'a', on: 7 }, { name: 'b', on: 0, of: 20 }] }); ok(/data-on="7,0"/.test(d) && (d.match(/#FF7A2F/g) || []).length === 7 && (d.match(/<circle/g) || []).length === 120, 'dots'); });

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
const FIRST = [['저출산', 'u1_l02'], ['출산율', 'u1_l02'], ['고령화', 'u1_l03'], ['인공지능', 'u1_l04'], ['지능정보화', 'u1_l04'], ['정보 통신 기술', 'u1_l04'], ['세계화', 'u1_l05'], ['한류', 'u1_l05'], ['의식주', 'u1_l07'], ['규범', 'u1_l07'], ['이주민', 'u1_l08'], ['1인 가구', 'u1_l08'], ['반려동물', 'u1_l08'], ['편견', 'u1_l09'], ['차별', 'u1_l09'], ['유니버설', 'u1_l10']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — l03 개념 장에 「세계화」를 심으면 잡는다', () => { const s = L.u1_l03.slides[3]; const keep = s.data.content; s.data.content = keep + ' 세계화'; let caught = false; try { KEYS.slice(0, 4).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('세계화') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 들어가기·살펴보기·정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'board').map(x => [x.title, x.bub, x.answer, x.items])) + JSON.stringify(SRC[k].summary); ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
T('l01 원인 — then 네 줄 = CH_SPOT(옛·오늘·원인) · 뜻 규칙(학생·어린이 = 사람 수 / 노인 = 평균 수명 / 로봇 = 과학 기술 / 세계·여러 나라 = 교류) · 남은 원인 = 사람들의 생각 변화 = 판 읽기 정답', () => { const b = BD('u1_l01'), f = fig('u1_l01'); ok(f.k === 'then' && f.rows.length === 4);
  const RULE = [[/학생|어린이/, '사람 수의 변화'], [/노인/, '평균 수명의 증가'], [/로봇/, '과학 기술의 발달'], [/세계|여러 나라/, '다른 나라와의 교류']];
  b.CH_SPOT.forEach((s, i) => { const r = f.rows[i]; ok(r.old.name === s.old && r.now.name === s.now && r.now.note === '원인: ' + b.CH_CAUSE[s.by], 'l01 줄 ' + i); const hit = RULE.filter(x => x[0].test(s.now + s.why)); ok(hit.length === 1 && hit[0][1] === b.CH_CAUSE[s.by], s.name + ' 규칙 ' + hit.map(x => x[1])); });
  const left = b.CH_CAUSE.filter((c, i) => !b.CH_SPOT.some(s => s.by === i)); ok(left.join() === '사람들의 생각 변화' && b.CH_READQ[b.CH_READ_OK].indexOf(left[0]) >= 0, '남은 원인 ' + left); });
T('l02 막대 — sbars = BW_YEAR·BW_BIRTH · 해마다 줄어듦(판 읽기 정답) · 견준 두 해 1990·2000 = 1만 명 줄었어요 = 문항 5 정답 · 1990 = 65만(문항 3)', () => { const b = BD('u1_l02'), f = fig('u1_l02'); ok(f.k === 'sbars' && f.v.join() === b.BW_BIRTH.join() && f.x.join() === b.BW_YEAR.map(y => y + '년').join());
  for (let i = 1; i < f.v.length; i++) ok(f.v[i] < f.v[i - 1], '줄어듦 ' + i); ok(/뒤의 해가 더 적으니/.test(b.BW_READQ[b.BW_READ_OK]), '판 읽기'); const h = FIG.render(f); ok(/1990년 65만 명 → 2000년 64만 명 · 1만 명 줄었어요/.test(h), '캡션');
  const q = SRC.u1_l02.problems[4]; ok(q.opts[q.ci] === '1만 명 줄었어요', '문항 5'); const q3 = SRC.u1_l02.problems[2]; ok(q3.opts[q3.ci] === f.v[f.x.indexOf('1990년')] + '만 명', '문항 3'); });
T('l03 백 명 마을 — dots = HV_YEAR·HV_OLD · 비율 높아짐 · 2020 = 16명(문항 5) · 2050 노인 아닌 사람 = 100 − 40 = 60명(문항 6) · 원문 개념 장 4·16·40', () => { const b = BD('u1_l03'), f = fig('u1_l03'); ok(f.k === 'dots' && f.groups.map(g => g.on).join() === b.HV_OLD.join() && f.groups.every((g, i) => g.name.indexOf(String(b.HV_YEAR[i])) === 0));
  for (let i = 1; i < 3; i++) ok(b.HV_OLD[i] > b.HV_OLD[i - 1]); const q5 = SRC.u1_l03.problems[4], q6 = SRC.u1_l03.problems[5]; ok(q5.opts[q5.ci] === b.HV_OLD[1] + '명 정도', '문항 5'); ok(q6.opts[q6.ci] === (100 - b.HV_OLD[2]) + '명 정도', '문항 6');
  const txt = SLI('u1_l03', 3).answer.join(' '); ok(txt.indexOf(b.HV_OLD[0] + '명') >= 0 && txt.indexOf(b.HV_OLD[1] + '명') >= 0, '원문 개념 장'); });
T('l04 두 칸 — 누려요/보완해요 = DS_CARD side · 뜻 규칙(범죄·거짓·과의존·감소 = 보완해요) · 문항 5 정답 ∈ 보완해요', () => { const b = BD('u1_l04'), f = fig('u1_l04'); ok(f.k === 'groups' && f.bins.length === 2);
  b.DS_CARD.forEach(c => { const want = /범죄|거짓|과의존|감소/.test(c.name) ? 1 : 0; ok(c.side === want, c.name + ' 규칙'); ok(f.bins[c.side].items.indexOf(c.name) >= 0, c.name + ' 칸'); }); const q = SRC.u1_l04.problems[4]; ok(f.bins[1].items.indexOf(q.opts[q.ci]) >= 0, '문항 5'); });
T('l05 실 — 들어온/나간 실 = SL_THING way · 뜻 규칙(공장을 세움·지음 = 나간 실) · 나라 = SL_LAND · 문항 5 정답(라면) ∈ 나간 실', () => { const b = BD('u1_l05'), f = fig('u1_l05'); ok(f.k === 'groups' && f.bins.length === 2);
  b.SL_THING.forEach(c => { ok(c.way === (/공장/.test(c.text) ? 1 : 0), c.name + ' 규칙'); ok(f.bins[c.way].items.indexOf(c.name + ' · ' + c.land.map(l => b.SL_LAND[l]).join('·')) >= 0, c.name + ' 칸'); c.land.forEach(l => ok(c.text.indexOf(b.SL_LAND[l]) >= 0, c.name + ' 나라 ' + b.SL_LAND[l])); });
  const q = SRC.u1_l05.problems[4]; ok(f.bins[1].items.some(x => x.indexOf(q.opts[q.ci] + ' ·') === 0), '문항 5'); });
T('l06 가려진 글자 — 열쇠 여섯 낱말 = GP_KEY · 가려진 글자 ⊂ 글자판 · 남은 글자 = 세 글자 → 「세계화」 = 문항 5 정답 · 겹친 칸 글자 같음', () => { const b = BD('u1_l06'), f = fig('u1_l06'); ok(f.k === 'note' && f.items.length === 6);
  const used = new Set(); b.GP_KEY.forEach((g, i) => { ok(nb(f.items[i]).endsWith(g.word.join('')), '낱말 ' + g.word.join('')); g.hide.forEach(h => { ok(b.GP_BOARD.indexOf(g.word[h]) >= 0, '글자판에 ' + g.word[h]); used.add(g.word[h]); }); });
  const left = b.GP_BOARD.filter(c => !used.has(c)); const q = SRC.u1_l06.problems[4]; ok(left.length === 3 && [...q.opts[q.ci]].sort().join() === left.slice().sort().join(), '남은 글자 ' + left.join('')); });
T('l07 학교 문화 — 우리 학교 칸 = CD_ROW 정답 보기 · 뜻 규칙(중국 → 3월 · 미국 → 숙여요 · 독일 → 국어) · 다른 나라 보기 ≠ 우리 학교', () => { const b = BD('u1_l07'), f = fig('u1_l07'); ok(f.k === 'then' && f.rows.length === 3);
  const RULE = { 중국: /^3월$/, 미국: /숙여요/, 독일: /국어/ }; b.CD_ROW.forEach((r, i) => { r.ok.forEach(o => ok(RULE[r.land].test(r.opts[o]), r.land + ' 규칙 ' + r.opts[o])); ok(r.ok.indexOf(r.there) < 0, r.land + ' there'); ok(f.rows[i].old.name === r.land && f.rows[i].now.name.indexOf(r.opts[r.ok[0]]) === 0, '줄 ' + i); }); });
T('l08 깃발 — 세 깃발 = FG_SPOT cul · 뜻 규칙(인도·외국인·베트남 = 이주민 / 1인분·혼자 = 1인 가구 / 강아지·고양이 = 반려동물) · 세 깃발 모두 꽂힘', () => { const b = BD('u1_l08'), f = fig('u1_l08');
  b.FG_SPOT.forEach(s => { const t = s.place + s.look + s.talk; const want = /인도|외국인|베트남/.test(t) ? 0 : /1인분|혼자/.test(t) ? 1 : /강아지|고양이/.test(t) ? 2 : -1; ok(s.cul === want, s.place + ' 규칙'); ok(f.bins[s.cul].items.some(x => x.name === s.place), s.place + ' 칸'); }); ok(f.bins.every(x => x.items.length >= 1), '빈 깃발'); });
T('l09 두 면 — 카드 셋 = TN_CARD · 셋 모두 밝은 면·그늘 면 · 줄임말이 원문 면 글에서 나옴', () => { const b = BD('u1_l09'), f = fig('u1_l09'); ok(f.k === 'then' && f.rows.length === 3);
  b.TN_CARD.forEach((c, i) => { const r = f.rows[i]; ok(r.old.name === c.name && c.bright.text && c.shade.text, c.name); nb(r.old.note).split(/·/).forEach(p => ok(c.bright.text.replace(/\s/g, '').indexOf(p.trim().replace(/\s/g, '').slice(0, 2)) >= 0, c.name + ' 밝은 ' + p)); nb(r.now.name).split(/·/).forEach(p => ok(c.shade.text.replace(/\s/g, '').indexOf(p.trim().replace(/\s/g, '').slice(0, 2)) >= 0, c.name + ' 그늘 ' + p)); }); ok(/두 면이 있어요/.test(b.TN_READQ[b.TN_READ_OK]), '판 읽기'); });
T('l10 존중의 탑 — 쌓는 블록 = TW_BLOCK good · 뜻 규칙(무시·이상하다·비난 = 기울어요) · 셋·셋', () => { const b = BD('u1_l10'), f = fig('u1_l10');
  b.TW_BLOCK.forEach(x => { ok(x.good === !/무시|이상하다|비난/.test(x.text), x.text); ok(f.bins[x.good ? 0 : 1].items.indexOf(x.text) >= 0, x.text + ' 칸'); }); ok(f.bins[0].items.length === 3 && f.bins[1].items.length === 3); });
T('l11 ○✗·버스 — ○ = BS_SAY ok · 뜻 규칙(배고파서 = 문화 아님 · 1인 가구 줄어듦 = 틀림) · 알맞은 힌트만 따로 셈 = 한 대 · 그림의 찾은 버스와 같음', () => { const b = BD('u1_l11'), f = fig('u1_l11');
  b.BS_SAY.forEach(x => { ok(x.ok === !/배가 고파서|줄어들고 있어요/.test(x.text), x.text); ok((x.ok ? f.a.items : f.b.items).some(t => t.indexOf(x.text) === 0), x.text + ' 칸'); });
  const jong = (s) => [...s].map(ch => (ch.charCodeAt(0) - 0xAC00) % 28); let left = b.BS_BUS.filter(bus => b.BS_SAY.filter(x => x.ok).every(x => ({ even: bus.no % 2 === 1, odd: bus.no % 2 === 0, nieun: jong(bus.city).indexOf(4) < 0 })[x.off] !== undefined ? ({ even: bus.no % 2 === 1, odd: bus.no % 2 === 0, nieun: jong(bus.city).indexOf(4) < 0 })[x.off] : bus.color !== x.off));
  ok(left.length === 1, '남은 버스 ' + left.length); ok(f.b.hint.indexOf(left[0].no + '번') >= 0 && f.b.hint.indexOf(left[0].city) >= 0, '찾은 버스 ' + f.b.hint);
  const all = b.BS_BUS.filter(bus => b.BS_SAY.every(x => ({ even: bus.no % 2 === 1, odd: bus.no % 2 === 0, nieun: jong(bus.city).indexOf(4) < 0 })[x.off] !== undefined ? ({ even: bus.no % 2 === 1, odd: bus.no % 2 === 0, nieun: jong(bus.city).indexOf(4) < 0 })[x.off] : bus.color !== x.off)); ok(all.length !== 1 || all[0].no !== left[0].no, '모든 힌트를 따라도 같은 버스(판 읽기와 어긋남)'); });
T('l12 딩고 — 네 주제 = DG_CARD t · 뜻 규칙(양육비·보육·학생 수·일할 수 있는 = 저출산 / 노인·복지·일자리 제공 = 고령화 / 인공지능·사이버·인터넷 = 지능정보화 / 나라·감염병·세계·생활 양식 = 세계화) · 주제마다 넷', () => { const b = BD('u1_l12'), f = fig('u1_l12');
  const R = [/양육비|보육|학생 수|일할 수 있는/, /노인|복지|일자리 제공/, /인공지능|사이버|인터넷/, /나라|감염병|세계|생활 양식/]; b.DG_CARD.forEach(c => { const hit = R.map((r, i) => r.test(c.text) ? i : -1).filter(i => i >= 0); ok(hit.length === 1 && hit[0] === c.t, c.text + ' 규칙 ' + hit); ok(f.bins[c.t].items.indexOf(c.text) >= 0, c.text + ' 칸'); }); ok(f.bins.every(x => x.items.length === 4), '넷'); });
T('판 검사기 자체 확인 — l04 카드 하나를 다른 칸으로, l02 막대 하나를 바꾸면 잡는다', () => { const f = fig('u1_l04'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); let c1 = false; try { BD('u1_l04').DS_CARD.forEach(c => ok(f.bins[c.side].items.indexOf(c.name) >= 0)); } catch (e) { c1 = true; } f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u1_l02'); const v0 = g.v[3]; g.v[3] = 66; let c2 = false; try { for (let i = 1; i < g.v.length; i++) ok(g.v[i] < g.v[i - 1]); } catch (e) { c2 = true; } g.v[3] = v0; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
T('데이터·생성기 차단 어휘 0 (박음·빵꾸·갈아엎·결로)', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g3s2_social_u1.js'), 'utf8') + fs.readFileSync(path.join(TDIR, 'scripts/gen_g3s2_social_u1.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => ok(t.indexOf(x) < 0, x)); });

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
