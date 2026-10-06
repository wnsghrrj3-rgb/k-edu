/* gate_g4_social_u3.js — 4학년 1학기 사회 3단원 「경제활동과 지역 간 교류」 케이티처 2세대 게이트 (79차, 베프) · 2단원 게이트(gate_g4_social_u2.js) 꼴.
   재료 = 자기주도 사회 4-1 3단원 l01~l13 → src_g4_social_u3.json(parse_selfdirected_soc4.js). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(지도서 1~16차시 빈틈 0 · l01·l11·l13 = 두 시간 80분 · 원문 「지도서 N(~M)차시」 주석과 겹침 — l01 은 단원 도입 1차시를 더함 · l04·l05 는 둘 다 「5~6차시」라 5·6 으로 나눔 · 성취기준 = 원문)
   B 19장 · C 7요소 · D 계보(2단원 u2_l12 → l01 → … → l13)
   E 정답 · F 원문 계승(동기 = 원문 0번 들어가기 장 제목, l12 는 6번 · 판 장 = 원문 4번 · 카드 이름·아래 줄 = 원문 장 글 토막 · 말풍선 없는 목록 장은 목록 줄)
   G 그림(판 부품 = tools 5·link 4·groups 4) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문·분
   L 선행 용어(퍼스널 쇼퍼·중고 l02 · 과장 l03 · 선택 기준·우선순위·착한 소비·친환경·서비스 l04 · 점수표 l05 · 상호 의존·생산지·김밥 l09
     · 물자 교류·기술 교류·문화 교류·자원봉사 l10 · 여수·누리집 l11 · 자매결연·강점 l12 전 학생 화면 0 · 원문도 같은 차례)
   M 판 대조(원문 판의 표 ↔ 판 그림 + 뜻 규칙으로 따로 셈) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_social_u3.js */
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
const L = load(path.join(TDIR, 'data/g4_social_u3.js'));
const PREV = load(path.join(TDIR, 'data/g4_social_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_social_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 13 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const COV = { u3_l01: [1, 2], u3_l02: [3], u3_l03: [4], u3_l04: [5], u3_l05: [6], u3_l06: [7], u3_l07: [8], u3_l08: [9], u3_l09: [10], u3_l10: [11], u3_l11: [12, 13], u3_l12: [14], u3_l13: [15, 16] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '경제활동과 지역 간 교류';
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
const BI = () => 4;
const ASK = (k) => ({ u3_l12: 6 })[k] || 0;
const SAY = (sl) => sl.bub || sl.answer.join(' ') || sl.items.map(nb).join(' ');
const board = (k) => con(k).find(s => s.src === BI(k));
const slideText = (sl) => nb([sl.title, sl.bub, sl.note, sl.answer.join(' '), sl.items.join(' '), sl.scene.join(' ')].join(' '));
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };

console.log('═══ A. 로드 ═══');
T('13차시 키(자기주도 파일 번호 u3_l01~l13)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 사회 · unit 1 · covers = 지도서 차시 · 분 = 40 × 차시 수 · 성취기준 = 원문 · 제목 = 원문 <title> · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = COV[k];
  ok(m.grade === 4 && m.term === 1 && m.unit === 3 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '차시'), k + ' covers ' + m.covers); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(m.std === SRC[k].std && m.std === (k === 'u3_l13' ? '[4사07-01][4사07-02]' : +k.slice(-2) <= 6 ? '[4사07-01]' : '[4사07-02]'), k + ' std ' + m.std); ok(m.title === nb(SRC[k].title) && m.title.length > 4, k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); }));
const GEX = { u3_l01: '단원 도입 1차시 + 원문 2차시', u3_l04: '원문 5~6차시 중 5', u3_l05: '원문 5~6차시 중 6' };
T('지도서 1~16차시 빈틈 0 · 두 시간 = l01·l11·l13 · 원문 주석 「지도서 N(~M)차시」와 같음(예외 셋은 겹침 — l01 단원 도입 · l04·l05 5~6차시 나눔)', () => { const all = [].concat(...KEYS.map(k => COV[k])); ok(all.join() === Array.from({ length: 16 }, (_, i) => i + 1).join(), all.join()); ok(KEYS.filter(k => COV[k].length === 2).join() === 'u3_l01,u3_l11,u3_l13');
  let n = 0, ex = 0; KEYS.forEach(k => { const g = SRC[k].guide_note; ok(g, k + ' 주석 없음'); n++; const m = g.match(/(\d+)(?:~(\d+))?차시/); const a = +m[1], z = m[2] ? +m[2] : a, c = COV[k]; const same = a === c[0] && z === c[c.length - 1];
    if (GEX[k]) { ex++; ok(!same && c.some(x => x >= a && x <= z), k + ' 예외인데 겹침 아님 ' + g); } else ok(same, k + ' 주석 ' + g); }); ok(n === 13 && ex === 3, '주석 ' + n + ' 예외 ' + ex); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u2_l12.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2단원 u2_l12') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_social:u2_l12'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 0번 들어가기(l12 6번) 장 제목 · 개념 제목 = 원문 · 말풍선 = 원문 말풍선(없으면 답 상자) · 카드 이름·아래 줄 = 원문 장 글 토막 · 판 장 = 교사 한 줄', () => { const src = SRC[k];
  const ask = SLI(k, ASK(k)); ok(ask && ask.kind !== 'board' && /[?？]$/.test(nb(ask.title)), '동기 장 꼴 · 물음'); const mo = L[k].slides[2]; ok(mo.data.question === plain(ask.title) && mo.src === ask.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (s.src === BI(k)) { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === SAY(sl) && d.content, s.id + ' 말풍선 ≠ 원문'); const txt = slideText(sl); const f = d.fig;
    ok(f.k === 'tools' || f.k === 'chain', s.id + ' 부품 ' + f.k); ok(f.items.length >= 2, s.id + ' 카드 수'); f.items.forEach(it => { ok(txt.indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 문항의 틀린 보기 ↔ 그 문항 정답 · 정리 = 원문 정리 줄 · 돌아보기 = 원문 · 다음 = 원문 끝 장', () => { const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)];
  ok(m.data.right === q.opts[q.ci], '바른 생각'); ok(q.opts.indexOf(m.data.wrong) >= 0 && m.data.wrong !== m.data.right, '틀린 생각');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length === 3, '정리');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  const pv = L[k].slides[18].data.preview; if (k === 'u3_l13') ok(pv.indexOf(nb(SRC[k].end_note)) === 0 && /민주주의와 자치/.test(pv) && SRC[k].next === '', '다음 단원'); else ok(pv === nb(SRC[k].next) && /^다음 시간/.test(pv), '다음 ≠ 원문'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'groups', 'link', 'exhibit'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('판 부품 = tools 5(l01·l05·l06·l09·l13)·link 4(l02·l04·l11·l12)·groups 4(l03·l07·l08·l10) · 판 장 = 원문 4번 · 원문 그 장이 직접조작 판', () => { const bc = {}; KEYS.forEach(k => { const b = board(k); ok(b && SLI(k, BI(k)).kind === 'board', k + ' 판 장'); bc[b.data.fig.k] = (bc[b.data.fig.k] || []).concat(k.slice(-3)); });
  ok(JSON.stringify(bc) === JSON.stringify({ tools: ['l01', 'l05', 'l06', 'l09', 'l13'], link: ['l02', 'l04', 'l11', 'l12'], groups: ['l03', 'l07', 'l08', 'l10'] }), JSON.stringify(bc)); KEYS.forEach(k => ok(SRC[k].slides.filter(x => x.kind === 'board').length === 1, k + ' 원문 판 하나')); });
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
const FIRST = [['퍼스널 쇼퍼', 'u3_l02'], ['중고', 'u3_l02'], ['과장', 'u3_l03'], ['선택 기준', 'u3_l04'], ['우선순위', 'u3_l04'], ['착한 소비', 'u3_l04'], ['친환경', 'u3_l04'], ['서비스', 'u3_l04'], ['점수표', 'u3_l05'], ['상호 의존', 'u3_l09'], ['생산지', 'u3_l09'], ['김밥', 'u3_l09'], ['물자 교류', 'u3_l10'], ['기술 교류', 'u3_l10'], ['문화 교류', 'u3_l10'], ['자원봉사', 'u3_l10'], ['여수', 'u3_l11'], ['누리집', 'u3_l11'], ['자매결연', 'u3_l12'], ['강점', 'u3_l12']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — l02 개념 장에 「상호 의존」을 심으면 잡는다', () => { const s = L.u3_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 상호 의존'; let caught = false; try { KEYS.slice(0, 8).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('상호 의존') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 끝 장을 뺀 원문 글에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'end').map(x => [x.title, x.bub, x.answer, x.items, x.note, x.scene])); if (i < i0) ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); if (i === i0) ok(txt.indexOf(w0) >= 0 || JSON.stringify(SRC[k].problems).indexOf(w0) >= 0, k0 + ' 원문에 없음 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
const D = (s) => plain(s);
const won = (n) => n.toLocaleString('en-US') + '원';
const binNames = (f, i) => f.bins[i].items.map(x => x.name).join();
T('l01 장바구니 — tools 여섯 = ITEMS 이름·그림·값 차례 · 값 합 = TOTAL_WANT 12,800 > 용돈 5,000 · 축구공+만화책 > 용돈 = 문항 5 정답(포기) · 판 장 한 줄의 두 값 = 표', () => { const b = BD('u3_l01'), f = fig('u3_l01'); ok(f.k === 'tools' && f.items.length === 6);
  b.ITEMS.forEach((t, i) => ok(f.items[i].name === t.label && f.items[i].emoji === t.emoji && f.items[i].kind === won(t.price), t.label)); const sum = b.ITEMS.reduce((a, t) => a + t.price, 0); ok(sum === b.TOTAL_WANT && sum === 12800 && b.BUDGET === 5000 && sum > b.BUDGET, '합');
  const pr = (n) => b.ITEMS.find(t => t.label === n).price; ok(pr('축구공') + pr('만화책') > b.BUDGET && /포기/.test(qa('u3_l01', 4)) && b.BUDGET - pr('축구공') === 1000, '축구공·만화책'); const lead = board('u3_l01').data.content; ok(lead.indexOf(won(b.BUDGET)) >= 0 && lead.indexOf(won(b.TOTAL_WANT)) >= 0, '판 한 줄 값'); });
T('l02 비용·만족 — link 셋 = CHOICES 차례 · 오른쪽 = 비용 + 만족 별 · 뜻 규칙(비용 가장 적고 만족 가장 큰 것)으로 따로 셈 = good 하나 = 고쳐 쓰기 = 문항 5 정답', () => { const C = BD('u3_l02').CHOICES, f = fig('u3_l02'); ok(f.k === 'link' && f.rows.length === 3);
  C.forEach((t, i) => ok(f.rows[i][0].name === t.label && f.rows[i][1].name === '비용 ' + t.cost + ' · 만족 ' + '★'.repeat(t.sat), t.label)); const minC = Math.min(...C.map(t => t.costLv)), maxS = Math.max(...C.map(t => t.sat));
  const best = C.filter(t => t.costLv === minC && t.sat === maxS); ok(best.length === 1 && best[0].good && C.filter(t => t.good).length === 1, '규칙'); ok(best[0].label === '고쳐 쓰기' && /^고쳐/.test(qa('u3_l02', 4)) && f.note.indexOf('**' + best[0].label + '**') >= 0, '고쳐 쓰기'); });
T('l03 정보 두 칸 — 믿을 만한 = CARDS trust 차례 · 조심할 = !trust · 뜻 규칙(본문의 「무조건·세계 1등·쑥쑥」 = 근거 없이 부풀린 말)으로 따로 셈 · 문항 5 정답 = 과장된 광고 확인', () => { const C = BD('u3_l03').CARDS, f = fig('u3_l03'); ok(f.k === 'groups' && f.bins.length === 2);
  const rule = (t) => !/무조건|세계 1등|쑥쑥/.test(t.body); C.forEach(t => ok(rule(t) === t.trust, t.k + ' 규칙')); ok(binNames(f, 0) === C.filter(t => t.trust).map(t => D(t.label)).join() && binNames(f, 1) === C.filter(t => !t.trust).map(t => D(t.label)).join(), '칸'); ok(f.bins[1].items.length === 1 && /과장된 광고/.test(qa('u3_l03', 4)), '광고'); });
T('l04 기준 렌즈 — link 다섯 = LENSES 차례 · 오른쪽 = win 자전거 이름(디자인 = 정답 없음) · 뜻 규칙(가격 = 값 가장 낮음 · 품질 = 기어 · 서비스 = 무상 수리 가장 긺 · 친환경 = eco)으로 따로 셈 · msg 굵은 글 = 이름 · 렌즈마다 1등이 다름', () => { const b = BD('u3_l04'), f = fig('u3_l04'), B = b.BIKES; ok(f.k === 'link' && f.rows.length === 5);
  const won0 = (s) => +s.match(/\d+/)[0]; const yrs = (s) => +s.match(/무상 수리 (\d)년/)[1]; const minP = Math.min(...B.map(x => won0(x.price))), maxY = Math.max(...B.map(x => yrs(x.svc)));
  const rule = { price: B.map((x, i) => won0(x.price) === minP ? i : -1).filter(i => i >= 0), quality: B.map((x, i) => /기어/.test(x.feat) ? i : -1).filter(i => i >= 0), service: B.map((x, i) => yrs(x.svc) === maxY ? i : -1).filter(i => i >= 0), eco: B.map((x, i) => x.eco ? i : -1).filter(i => i >= 0), design: null };
  b.LENSES.forEach((t, i) => { ok(JSON.stringify(rule[t.k]) === JSON.stringify(t.win), t.k + ' 규칙'); ok(f.rows[i][0].name === t.label && f.rows[i][1].name === (t.win ? t.win.map(j => B[j].name).join(' · ') : '정답 없음 — 사람마다 달라요'), t.k + ' 줄'); if (t.win) t.win.forEach(j => ok(t.msg.indexOf(B[j].name.replace('자전거 ', '')) >= 0, t.k + ' msg')); });
  ok(new Set(b.LENSES.filter(t => t.win).map(t => t.win.join())).size >= 3, '1등 바뀜'); ok(/우선순위/.test(qa('u3_l04', 5)) && f.note.indexOf('**우선순위**') >= 0, '우선순위'); });
T('l05 점수표 — tools 넷 = SB_CRIT 이름 차례 · 아래 줄 = 1~SB_MAX점 · 자전거 넷 · 문항 5 정답(품질) · 문항 6 정답(가격) = 기준 이름', () => { const b = BD('u3_l05'), f = fig('u3_l05'); ok(f.k === 'tools' && f.items.length === 4 && b.SB_BIKES.length === 4 && b.SB_MAX === 10);
  b.SB_CRIT.forEach((t, i) => ok(f.items[i].name === t.label && f.items[i].kind.indexOf('1~' + b.SB_MAX + '점') >= 0, t.label)); const crit = b.SB_CRIT.map(t => t.label); ok(crit.indexOf(qa('u3_l05', 4).replace(/\(.*$/, '')) >= 0 && crit.indexOf(qa('u3_l05', 5)) >= 0, '문항 정답'); ok(/네 대/.test(board('u3_l05').data.content), '네 대'); });
T('l06 용어 짝 — tools 여섯 = PAIRS term · desc 차례 · 문항 1·3·4 물음 = desc 로 시작 → 정답 = 그 term · 숨은 낱말 = 경제활동(원문 답)', () => { const P = BD('u3_l06').PAIRS, f = fig('u3_l06'); ok(f.k === 'tools' && f.items.length === 6);
  P.forEach((t, i) => ok(f.items[i].name === t.term && f.items[i].kind === t.desc, t.k)); let n = 0; SRC.u3_l06.problems.forEach((q, i) => { const p = P.find(x => q.t.indexOf(x.desc) === 0); if (p) { n++; ok(qa('u3_l06', i) === p.term, '문항 ' + (i + 1)); } }); ok(n === 3, '대조 문항 ' + n);
  ok(/경제활동/.test(SLI('u3_l06', 6).answer.join(' ')), '숨은 낱말'); });
T('l07 생산·소비 두 칸 — 칸 = PC_LABEL 이름 · 넷·넷 · 뜻 규칙(「사요·받아요」로 끝남 = 소비)으로 따로 셈 · 장소마다 생산 하나·소비 하나 · 문항 6 정답(미용실 앞 생산·뒤 소비)', () => { const b = BD('u3_l07'), f = fig('u3_l07'); ok(f.k === 'groups' && f.bins.length === 2);
  const rule = (t) => /(사요|받아요)$/.test(t.text) ? 'cons' : 'prod'; b.SCENES.forEach(t => ok(rule(t) === t.type, t.k + ' 규칙')); ok(f.bins[0].name === b.PC_LABEL.prod.t && f.bins[1].name === b.PC_LABEL.cons.t, '칸 이름');
  ok(binNames(f, 0) === b.SCENES.filter(t => t.type === 'prod').map(t => t.text).join() && binNames(f, 1) === b.SCENES.filter(t => t.type === 'cons').map(t => t.text).join() && f.bins[0].items.length === 4, '칸');
  const places = [...new Set(b.SCENES.map(t => t.place))]; places.forEach(p => ok(b.SCENES.filter(t => t.place === p).map(t => t.type).sort().join() === 'cons,prod', p)); const mi = b.SCENES.filter(t => t.place === '미용실'); ok(mi[0].type === 'prod' && mi[1].type === 'cons' && qa('u3_l07', 5) === '앞은 생산, 뒤는 소비다', '미용실'); });
T('l08 생산 세 칸 — 칸 = ACT_ORDER · ACT_LABEL · 셋·셋·셋 · 뜻 규칙(벼농사·물고기·버섯 = 자연 · 만들·지어 = 만들기 · 진료·공연·배달 = 해 주기)으로 따로 셈 · 문항 2·3·4 정답 칸 · 문항 6 공연 = 진료 칸', () => { const b = BD('u3_l08'), f = fig('u3_l08'); ok(f.k === 'groups' && f.bins.length === 3);
  const rule = (t) => /벼농사|물고기|버섯/.test(t.text) ? 'nature' : /진료|공연|배달/.test(t.text) ? 'serve' : /만들|지어/.test(t.text) ? 'make' : '?'; b.ACTS.forEach(t => ok(rule(t) === t.type, t.k + ' 규칙'));
  b.ACT_ORDER.forEach((o, i) => { ok(f.bins[i].name === b.ACT_LABEL[o].t, o); ok(binNames(f, i) === b.ACTS.filter(t => t.type === o).map(t => t.text).join() && f.bins[i].items.length === 3, o + ' 칸'); });
  const binOf = (re) => f.bins.findIndex(x => x.items.some(y => re.test(y.name))); ok(binOf(/물고기/) === 0 && /고기잡이/.test(qa('u3_l08', 1)), '고기잡이'); ok(binOf(/옷/) === 1 && /옷/.test(qa('u3_l08', 2)), '옷'); ok(binOf(/진료/) === 2 && /진료/.test(qa('u3_l08', 3)), '진료'); ok(binOf(/공연/) === binOf(/진료/) && /진료/.test(qa('u3_l08', 5)), '공연 = 진료'); });
T('l09 김밥 재료 — tools 아홉 = INGRED 이름·생산지 차례 · 생산지 ⊂ REGIONS · 지역 8곳 · 도 6곳 · 쌀·햄 같은 김제 · 문항 3 정답 = 교류', () => { const b = BD('u3_l09'), f = fig('u3_l09'); ok(f.k === 'tools' && f.items.length === 9);
  b.INGRED.forEach((t, i) => { ok(f.items[i].name === t.name && f.items[i].kind === t.region && f.items[i].emoji === t.emoji, t.name); ok(b.REGIONS.indexOf(t.region) >= 0, t.name + ' 지역'); }); ok(new Set(b.INGRED.map(t => t.region)).size === 8 && b.REGIONS.length === 8, '8곳'); ok(new Set(b.INGRED.map(t => t.region.split(' ')[0])).size === 6, '도 6');
  ok(b.INGRED.find(t => t.name === '쌀').region === b.INGRED.find(t => t.name === '햄').region, '김제'); ok(/교류/.test(qa('u3_l09', 2)), '문항 3'); });
T('l10 교류 세 칸 — 칸 = EXCH_ORDER · EXCH_LABEL · 셋·셋·셋 · 뜻 규칙(공연·축제·예술 = 문화 · 기술·농사·의료 = 기술 · 나머지 = 물자)으로 따로 셈 · 문항 5(새 기술)·6(축제) 정답 = 칸 이름', () => { const b = BD('u3_l10'), f = fig('u3_l10'); ok(f.k === 'groups' && f.bins.length === 3);
  const rule = (t) => /공연|축제|예술/.test(t.text) ? 'culture' : /기술|농사|의료/.test(t.text) ? 'tech' : 'goods'; b.CASES.forEach(t => ok(rule(t) === t.type, t.k + ' 규칙'));
  b.EXCH_ORDER.forEach((o, i) => { ok(f.bins[i].name === b.EXCH_LABEL[o].t, o); ok(binNames(f, i) === b.CASES.filter(t => t.type === o).map(t => t.text).join() && f.bins[i].items.length === 3, o + ' 칸'); });
  const binName = (re) => f.bins.find(x => x.items.some(y => re.test(y.name))).name; ok(binName(/새 기술/) === qa('u3_l10', 4), '새 기술'); ok(binName(/축제/) === qa('u3_l10', 5), '축제'); });
T('l11 여수시 교류 지도 — link 넷 = XCARDS 차례 · 왼쪽 = 이름·종류 · 오른쪽 = 지역(장식 지역 0)·방향 · 들어옴 = 노란색(DIR_LABEL·원문 장·문항 3) · 판소리 = 문화 교류(문항 5) · 산청 = 기술 · 교류 지역 3곳', () => { const b = BD('u3_l11'), f = fig('u3_l11'); ok(f.k === 'link' && f.rows.length === 4);
  const sp = (k) => b.SPOTS.find(s => s.k === k); b.XCARDS.forEach((t, i) => { ok(f.rows[i][0].name === t.text + ' · ' + t.kind + ' 교류', t.k + ' 왼쪽'); ok(!sp(t.spot).deco && f.rows[i][1].name.indexOf(sp(t.spot).name) === 0 && f.rows[i][1].name.endsWith(b.DIR_LABEL[t.dir].t), t.k + ' 오른쪽'); });
  b.SPOTS.filter(s => s.deco).forEach(s => ok(!f.rows.some(r => r[1].name.indexOf(s.name) >= 0), s.name + ' 장식'));
  ok(b.DIR_LABEL.in.t === '들어옴' && /노란색/.test(SLI('u3_l11', 2).bub) && /들어오는/.test(SLI('u3_l11', 2).bub) && /^노란색/.test(qa('u3_l11', 2)), '노랑 = 들어옴');
  ok(b.XCARDS.find(t => t.text === '판소리').kind + ' 교류' === qa('u3_l11', 4), '판소리'); ok(b.XCARDS.find(t => t.spot === 'sancheong').kind === '기술', '산청'); ok(new Set(b.XCARDS.map(t => t.spot)).size === 3 && f.note.indexOf('**3지역**') >= 0, '3지역'); });
T('l12 O·X — link 여섯 = OXQ 차례·글 · 오른쪽 = ans · 뜻 규칙(버스 이용 = 생산 아님 · 한 지역만 이익 = 틀림 · 공연은 생산 = 아니에요가 틀림)으로 따로 셈 · 맞음 3·틀림 3 · 문항 5 정답 = 소비 활동(② 틀림)', () => { const Q = BD('u3_l12').OXQ, f = fig('u3_l12'); ok(f.k === 'link' && f.rows.length === 6);
  const rule = (t) => !(/버스/.test(t.text) && /생산 활동이에요/.test(t.text)) && !/한 지역만/.test(t.text) && !(/공연/.test(t.text) && /아니에요/.test(t.text)); Q.forEach((t, i) => { ok(rule(t) === t.ans, t.k + ' 규칙'); ok(f.rows[i][0].name.endsWith(D(t.text)) && f.rows[i][1].name === (t.ans ? '⭕ 맞아요' : '❌ 틀려요'), t.k + ' 줄'); });
  ok(Q.filter(t => t.ans).length === 3 && f.note.indexOf('**3개**') >= 0, '3·3'); ok(!Q[1].ans && qa('u3_l12', 4) === '소비 활동', '버스'); });
T('l13 생각 그물 — tools 여섯 = NODES 차례 · 이름 = ①(topic1)·②(topic2) + answer · 아래 줄 = hint · 셋·셋 · 도전 답 두 묶음 = branch 그대로 · 문항 2·7 정답 ⊂ 개념', () => { const b = BD('u3_l13'), f = fig('u3_l13'); ok(f.k === 'tools' && f.items.length === 6);
  b.NODES.forEach((t, i) => ok(f.items[i].name === (t.branch === 'topic1' ? '① ' : '② ') + t.answer && f.items[i].kind === t.hint, t.k)); ok(b.NODES.slice(0, 3).every(t => t.branch === 'topic1') && b.NODES.slice(3).every(t => t.branch === 'topic2'), '셋·셋');
  const a = L.u3_l13.slides[11].data.levels['도전'].a; ok(a.indexOf('주제① — ' + b.NODES.filter(t => t.branch === 'topic1').map(t => t.answer).join(' · ')) === 0 && a.indexOf('주제② — ' + b.NODES.filter(t => t.branch === 'topic2').map(t => t.answer).join(' · ')) > 0, '도전 답');
  const ans = b.NODES.map(t => t.answer); ok(ans.indexOf(qa('u3_l13', 1)) >= 0 && ans.indexOf(qa('u3_l13', 6)) >= 0, '문항'); });
T('판 검사기 자체 확인 — l07 장면 하나를 다른 칸으로, l12 줄 하나를 뒤집으면 잡는다', () => { const f = fig('u3_l07'), b = BD('u3_l07'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); const c1 = binNames(f, 0) !== b.SCENES.filter(t => t.type === 'prod').map(t => t.text).join(); f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u3_l12'); const keep = g.rows[1][1].name; g.rows[1][1].name = '⭕ 맞아요'; const c2 = g.rows[1][1].name !== (BD('u3_l12').OXQ[1].ans ? '⭕ 맞아요' : '❌ 틀려요'); g.rows[1][1].name = keep; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
T('데이터·생성기 차단 어휘 0 (박음·빵꾸·갈아엎·결로)', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_social_u3.js'), 'utf8') + fs.readFileSync(path.join(TDIR, 'scripts/gen_g4_social_u3.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => ok(t.indexOf(x) < 0, x)); });
T('학생 화면에 「생산」「교류」 — 주제①(l01~l05) 0(단원 이름 빼고) · l06 은 다음 주제 예고 장(끝)만', () => KEYS.slice(0, 5).forEach(k => L[k].slides.forEach(s => ['생산', '교류'].forEach(w0 => ok(vis(s).split(UT).join('').indexOf(w0) < 0, k + ' ' + s.id + ' ' + w0)))));

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
