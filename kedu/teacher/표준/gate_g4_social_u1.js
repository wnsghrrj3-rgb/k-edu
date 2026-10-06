/* gate_g4_social_u1.js — 4학년 1학기 사회 1단원 「지도로 만나는 우리 지역」 케이티처 2세대 게이트 (76차, 베프) · 3-2 사회 게이트(gate_g3s2_social_u2.js) 꼴.
   재료 = 자기주도 사회 4-1 1단원 l01~l13 → src_g4_social_u1.json(parse_selfdirected_soc4.js). 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(지도서 1~16차시 빈틈 0 · l01·l11·l13 = 두 시간 80분 · 원문 「지도서 N차시」 주석과 일치 · 성취기준 = 원문) · B 19장 · C 7요소 · D 계보(3-2 사회 u2_l08 → l01 → … → l13)
   E 정답 · F 원문 계승(카드 이름·아래 줄 = 원문 장 글 토막) · G 그림(판 부품 = link 3·groups 2·chain 2·tools 3·sbars 2·led 1) · H 중복 0 · I 실렌더 + 1인 흐름 · J extras 22 · K 발문·분
   L 선행 용어(방위표·나침반 l02 · 범례·픽토그램 l03 · 등고선 l04 · 축척 l05 · 약도·노선도·대동여지도 l06 · 면적·인구·지리 정보 l08 · 막대그래프 l09 · 기후 그래프·기상청 l10 · 독도 l11 전 학생 화면 0 · 원문도 같은 차례)
   M 판 대조(원문 판의 표 ↔ 판 그림 + 뜻 규칙으로 따로 셈) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_social_u1.js */
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
const L = load(path.join(TDIR, 'data/g4_social_u1.js'));
const PREV = load(path.join(TDIR, 'data/g3s2_social_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_social_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 13 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const COV = { u1_l01: [1, 2], u1_l02: [3], u1_l03: [4], u1_l04: [5], u1_l05: [6], u1_l06: [7], u1_l07: [8], u1_l08: [9], u1_l09: [10], u1_l10: [11], u1_l11: [12, 13], u1_l12: [14], u1_l13: [15, 16] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '지도로 만나는 우리 지역';
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
const BOARD_I = 4;
const board = (k) => con(k).find(s => s.src === BOARD_I);
const slideText = (sl) => nb([sl.title, sl.bub, sl.note, sl.answer.join(' '), sl.items.join(' '), sl.scene.join(' ')].join(' '));
const qa = (k, n) => { const q = SRC[k].problems[n]; return q.opts[q.ci]; };

console.log('═══ A. 로드 ═══');
T('13차시 키(자기주도 파일 번호 u1_l01~l13)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 사회 · unit 1 · covers = 지도서 차시 · 분 = 40 × 차시 수 · 성취기준 = 원문 · 제목 = 원문 <title> · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = COV[k];
  ok(m.grade === 4 && m.term === 1 && m.unit === 1 && m.unit_title === UT && m.subject === '사회' && m.n === +k.slice(-2), k);
  ok(m.covers === (c.length === 2 ? c[0] + '·' + c[1] + '차시' : c[0] + '차시'), k + ' covers ' + m.covers); ok(m.duration_min === 40 * c.length, k + ' 분');
  ok(m.std === SRC[k].std && (k === 'u1_l13' ? m.std === '[4사05-01][4사05-02]' : +k.slice(-2) <= 7 ? m.std === '[4사05-01]' : m.std === '[4사05-02]'), k + ' std ' + m.std); ok(m.title === nb(SRC[k].title) && m.title.length > 4, k + ' 제목');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url'); }));
T('지도서 1~16차시 빈틈 0 · 두 시간 = l01·l11·l13 · 원문 머리 주석 「지도서 N(~M)차시」가 있는 차시는 그 번호와 같음', () => { const all = [].concat(...KEYS.map(k => COV[k])); ok(all.join() === Array.from({ length: 16 }, (_, i) => i + 1).join(), all.join()); ok(KEYS.filter(k => COV[k].length === 2).join() === 'u1_l01,u1_l11,u1_l13');
  let n = 0; KEYS.forEach(k => { const g = SRC[k].guide_note; if (!g) return; n++; const m = g.match(/(\d+)(?:~(\d+))?차시/); ok(+m[1] === COV[k][0] && (m[2] ? +m[2] === COV[k][1] : COV[k].length === 1), k + ' 주석 ' + g); }); ok(n === 7, '주석 차시 ' + n); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u2_l08.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '3-2 사회 u2_l08') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_social:u2_l08'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 3 = 원문 4택 · 정답 하나 = 원문 정답 · 풀이 = 원문 까닭 · 수준 3 · 출구 3', () => { const bs = L[k].slides.filter(s => s.block === 'basic_problem'); ok(bs.length === 3);
  bs.forEach(s => { const q = SRC[k].problems[+s.src.slice(1)], d = s.data; ok(d.question === q.t, s.id + ' 물음'); ok(d.options.length === q.opts.length && q.opts.length === 4, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === q.opts[i], s.id + ' 보기 ' + i); ok(!!o.correct === (i === q.ci), s.id + ' 정답 ' + i); }); ok(d.note.indexOf(q.reason) >= 0 && d.note.indexOf(q.opts[q.ci]) >= 0, s.id + ' 풀이'); });
  const lv = L[k].slides[11].data.levels; ok(['기본', '도전', '심화'].every(x => lv[x] && lv[x].q && lv[x].a), '수준'); L[k].slides[15].data.items.forEach(x => ok(x.q && x.a && /[?？]$/.test(x.q), '출구 ' + x.q)); }));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 동기 = 원문 발문 장 제목 · 개념 제목 = 원문 · 말풍선 = 원문 말풍선(없으면 답 상자) · 카드 이름·아래 줄 = 원문 장 글 토막 · 판 장 = 교사 한 줄', () => { const src = SRC[k];
  const s1 = SLI(k, 1), ask = s1.kind === 'intro' ? s1 : SLI(k, 0); const mo = L[k].slides[2]; ok(mo.data.question === plain(ask.title) && mo.src === ask.i, '동기');
  con(k).forEach(s => { const sl = SLI(k, s.src), d = s.data; ok(d.title === nb(sl.title), s.id + ' 제목');
    if (s.src === BOARD_I) { ok(d.content && d.content.length < 90, s.id + ' 판 장 한 줄'); return; }
    ok(d.content === (sl.bub || sl.answer.join(' ')) && d.content, s.id + ' 말풍선 ≠ 원문'); const txt = slideText(sl); const f = d.fig;
    ok(f.k === 'tools' || f.k === 'chain', s.id + ' 부품 ' + f.k); ok(f.items.length >= 2, s.id + ' 카드 수'); f.items.forEach(it => { ok(txt.indexOf(nb(it.name)) >= 0, s.id + ' 카드 이름 ' + it.name); if (it.kind) ok(txt.indexOf(nb(it.kind)) >= 0, s.id + ' 카드 글 ' + it.kind); }); }); }));
KEYS.forEach(k => T(k + ' 오개념 = 원문 문항의 틀린 보기 ↔ 그 문항 정답 · 정리 = 원문 정리 줄 · 돌아보기 = 원문 · 다음 = 원문 끝 장', () => { const m = L[k].slides[7], q = SRC[k].problems[+m.src.slice(1)];
  ok(m.data.right === q.opts[q.ci], '바른 생각'); ok(q.opts.indexOf(m.data.wrong) >= 0 && m.data.wrong !== m.data.right, '틀린 생각');
  const pts = L[k].slides[16].data.points; ok(JSON.stringify(pts.slice(0, SRC[k].summary.length)) === JSON.stringify(SRC[k].summary) && SRC[k].summary.length === 3, '정리');
  const sa = L[k].slides[17].data.items; SRC[k].self.forEach((x, i) => ok(sa[i].endsWith(x), '돌아보기 ' + i)); ok(SRC[k].self.length === 3, '돌아보기 3');
  ok(L[k].slides[18].data.preview === nb(SRC[k].end_note) && /다음/.test(SRC[k].end_note), '다음 ≠ 원문'); }));

console.log('═══ G. 그림 ═══');
const SO = ['tools', 'chain', 'groups', 'link', 'sbars', 'led'];
KEYS.forEach(k => T(k + ' 개념 4장 렌더 · 사회 부품 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => con(k).forEach(s => { const f = s.data.fig; ok(f && SO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐'); (f.items || []).forEach(it => it && it.name && ok(!/\*\*/.test(it.name), s.id + ' ** ' + it.name)); })));
T('판 부품 = link 3(l01·l03·l05)·groups 2(l02·l13)·chain 2(l04·l06)·tools 3(l07·l08·l11)·sbars 2(l09·l10)·led 1(l12) · 판 장 = 원문 5번 장', () => { const bc = {}; KEYS.forEach(k => { const b = board(k); ok(b && SLI(k, BOARD_I).title.length, k + ' 판 장'); bc[b.data.fig.k] = (bc[b.data.fig.k] || []).concat(k.slice(-3)); });
  ok(JSON.stringify(bc) === JSON.stringify({ link: ['l01', 'l03', 'l05'], groups: ['l02', 'l13'], chain: ['l04', 'l06'], tools: ['l07', 'l08', 'l11'], sbars: ['l09', 'l10'], led: ['l12'] }), JSON.stringify(bc)); });
T('짝 잇기(link) 칸이 전광판 칸 규칙에 덮이지 않음 — stage2.css 의 전광판 .so-lc 규칙은 .so-ledg 안으로만', () => { const css = fs.readFileSync(path.join(S2, 'stage2.css'), 'utf8'); const bad = css.split('\n').filter(l => /^\.so-lc(\.on)?[{.]/.test(l) && /#2B3446|#FFD24A|#FF8A3D|#5EC8FF/.test(l)); ok(bad.length === 0, bad.join(' | ')); });

console.log('═══ H. 중복 ═══');
KEYS.forEach(k => T(k + ' 개념 원문 장·기본 문제 문항·개념 제목 중복 0 · 판 장 1', () => { const c = con(k).map(s => s.src); ok(new Set(c).size === 4, '개념 src'); const p = L[k].slides.filter(s => s.block === 'basic_problem').map(s => s.src); ok(new Set(p).size === 3, '문항'); ok(new Set(con(k).map(s => s.data.title)).size === 4, '제목'); ok(c.filter(x => x === BOARD_I).length === 1, '판 장'); }));

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
const FIRST = [['방위표', 'u1_l02'], ['나침반', 'u1_l02'], ['범례', 'u1_l03'], ['픽토그램', 'u1_l03'], ['등고선', 'u1_l04'], ['축척', 'u1_l05'], ['약도', 'u1_l06'], ['노선도', 'u1_l06'], ['대동여지도', 'u1_l06'], ['면적', 'u1_l08'], ['인구', 'u1_l08'], ['지리 정보', 'u1_l08'], ['막대그래프', 'u1_l09'], ['기후 그래프', 'u1_l10'], ['기상청', 'u1_l10'], ['독도', 'u1_l11']];
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 ' + k0 + ' 전 학생 화면 0 · ' + k0 + ' 에는 나옴', () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i < i0) L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id)); }); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), k0 + ' 에 없음'); }));
T('선행 검사기 자체 확인 — l02 개념 장에 「등고선」을 심으면 잡는다', () => { const s = L.u1_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 등고선'; let caught = false; try { KEYS.slice(0, 3).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('등고선') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 끝 장을 뺀 원문 18장 글에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const txt = JSON.stringify(SRC[k].slides.filter(x => x.kind !== 'end').map(x => [x.title, x.bub, x.answer, x.items, x.note, x.scene])); ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 판 대조 ═══');
const fig = (k) => board(k).data.fig;
T('l01 사진 → 지도 — link 여섯 줄 = PLACES 차례·이름 · 오른쪽 기호 이름의 낱말(두 글자↑)이 모두 원문 그 장소 desc 에 있음 · 문항 6 정답 = 기호로 장소가 잘 나타남', () => { const P = BD('u1_l01').PLACES, f = fig('u1_l01'), ks = Object.keys(P); ok(f.k === 'link' && f.rows.length === 6 && ks.length === 6);
  ks.forEach((k, i) => { ok(f.rows[i][0].name === P[k].name, k + ' 이름'); f.rows[i][1].name.split(/[\s·]+/).map(x => x.replace(/[()（）＋+]/g, '')).filter(x => x.length >= 2).forEach(wd => ok(P[k].desc.indexOf(wd) >= 0, k + ' 「' + wd + '」')); });
  ok(/약속된 기호/.test(qa('u1_l01', 5)) && f.note.indexOf('장소 6곳') === 0, '문항 6·그림 풀이'); });
T('l02 8방위 — 바깥 갈래(4방위) = deg 가 90 의 배수 · 안쪽(사이 방위) = 45 홀수배 · 칩 = 방위 이름쪽 · 장소 · 방위 이름 규칙(사이 방위 = 북/남 먼저 + 동/서)을 deg 로 따로 셈 · 문항 6 정답 = 북동쪽', () => { const P = BD('u1_l02').PLACES, f = fig('u1_l02'); ok(f.k === 'groups' && f.bins.length === 2 && Object.keys(P).length === 8);
  const base = { 0: '북', 90: '동', 180: '남', 270: '서' }; const name = (d) => base[d] != null ? base[d] : (d < 90 || d > 270 ? '북' : '남') + (d < 180 ? '동' : '서');
  Object.keys(P).forEach(k => { const p = P[k]; ok(p.ko === name(p.deg), k + ' 이름 규칙 ' + p.ko); const bi = p.deg % 90 === 0 ? 0 : 1; ok(f.bins[bi].items.some(x => x.name === p.ko + '쪽 · ' + p.name && x.emoji === p.emoji), k + ' 칸'); });
  ok(f.bins[0].items.length === 4 && f.bins[1].items.length === 4, '넷·넷'); ok(qa('u1_l02', 5) === '북동쪽' && Object.values(P).some(p => p.deg === 45 && p.ko + '쪽' === '북동쪽'), '문항 6'); });
T('l03 범례 — link 여섯 줄 = PLACES 차례·이름 · 문항 5(제비 모양 기호) 정답 = 우체국 = 「제비」 줄의 뜻', () => { const P = BD('u1_l03').PLACES, f = fig('u1_l03'), ks = Object.keys(P); ok(f.k === 'link' && f.rows.length === 6); ks.forEach((k, i) => ok(f.rows[i][1].name === P[k].name, k));
  const r = f.rows.find(x => x[0].name === '제비'); ok(r && r[1].name === qa('u1_l03', 4) && /제비/.test(SRC.u1_l03.problems[4].t), '제비 → 우체국'); });
T('l04 등고선 띠 — chain 다섯 = BANDS label 차례 · 바깥(r 큼)부터 안쪽(r 작음) · 높이 h 가 안쪽으로 갈수록 커짐 · 첫 띠 초록·끝 띠 고동(색 숫자로 셈) · 문항 6 정답 = 가장 안쪽', () => { const B = BD('u1_l04').BANDS, f = fig('u1_l04'); ok(f.k === 'chain' && f.items.map(x => x.name).join() === B.map(b => b.label).join(), '차례');
  for (let i = 1; i < B.length; i++) { ok(B[i].r < B[i - 1].r, 'r ' + i); ok(parseInt(B[i].h) >= parseInt(B[i - 1].h), 'h ' + i); }
  const rgb = (c) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const g0 = rgb(B[0].color), g4 = rgb(B[B.length - 1].color); ok(g0[1] > g0[0] && g0[1] > g0[2], '첫 띠 초록 ' + B[0].color); ok(g4[0] > g4[1] && g4[1] > g4[2], '끝 띠 고동 ' + B[B.length - 1].color);
  ok(/가장 안쪽/.test(qa('u1_l04', 5)) && /초록색 · 높은 곳 고동색/.test(qa('u1_l04', 3)), '문항'); });
T('l05 축척 막대자 — 두 곳 거리 = LOC gx 차이(1 cm = 1 km) 따로 셈 · 시청 → 역 = 3 km = 원문 정리 장 「지도상 3 cm 는 실제 3 km」 = 문항 3 정답 · 공항 → 시장 = 10', () => { const b = BD('u1_l05'), f = fig('u1_l05'); ok(f.k === 'link' && f.rows.length === 4);
  const at = (n) => b.LOC.find(x => x.name === n).gx; f.rows.forEach(r => { const [a, z] = r[0].name.split(' → '); const d = at(z) - at(a); ok(r[1].name === '지도상 ' + d + ' cm = 실제 ' + d + ' km', r[0].name + ' ' + d); });
  ok(at('역') - at('시청') === 3 && /3 cm/.test(SLI('u1_l05', 6).note) && qa('u1_l05', 2) === '3 km', '시청 → 역'); ok(at('시장') - at('공항') === 10, '공항 → 시장'); });
T('l06 노선 환승 — chain = 종합운동장(3호선) → 수영(두 노선·transfer) → 해운대(2호선) · 두 노선을 다 가진 역은 수영 하나(따로 셈) · 문항 5 정답 = 환승', () => { const S = BD('u1_l06').STATIONS, f = fig('u1_l06'); const two = S.filter(s => s.lines.length === 2); ok(two.length === 1 && two[0].name === '수영' && two[0].transfer, '환승역');
  const st = (n) => S.find(s => s.name === n); ok(f.k === 'chain' && f.items.map(x => x.name).join() === '종합운동장역,수영역,해운대역', '차례'); ok(st('종합운동장').lines.join() === '3' && st('해운대').lines.join() === '2', '노선');
  ok(f.items[1].kind === '갈아타요 · 3호선 → 2호선' && qa('u1_l06', 4) === '환승', '환승'); ok(L.u1_l06.slides[14].data.note.indexOf('**수영역**') >= 0, '생각을 넓혀요 풀이'); });
T('l07 지도 요소 — tools 넷 = ELEMENTS 이름·desc(태그 뺌) · 방위표·기호·등고선·축척 · 문항 8 정답 = 여러 정보', () => { const E = BD('u1_l07').ELEMENTS, f = fig('u1_l07'); ok(f.k === 'tools' && f.items.length === 4); E.forEach((e, i) => ok(f.items[i].name === e.name && f.items[i].kind === plain(e.desc), e.name)); ok(E.map(e => e.name).join() === '방위표,기호,등고선,축척', '넷'); ok(/여러 정보/.test(qa('u1_l07', 7)), '문항 8'); });
T('l08 지형 — tools 다섯 = LANDFORMS · 판 자리(LF_SPOTS)에 다섯 모두 · 뜻 규칙(산 = 높은 땅 · 들 = 평평한 땅 · 섬 = 바다에 둘러싸인) = 문항 4·5 정답', () => { const b = BD('u1_l08'), f = fig('u1_l08'); ok(f.k === 'tools' && f.items.length === 5); b.LANDFORMS.forEach((x, i) => { ok(f.items[i].name === x.name && f.items[i].kind === plain(x.desc), x.name); ok(b.LF_SPOTS[x.k], x.k + ' 자리'); });
  const d = (n) => plain(b.LANDFORMS.find(x => x.name === n).desc); ok(/높은 땅/.test(d('산')) && qa('u1_l08', 3) === '산', '산'); ok(/평평한 땅/.test(d('들')) && qa('u1_l08', 4) === '들(평야)', '들'); ok(/바다에 둘러싸인/.test(d('섬')), '섬'); });
T('l09 인구 막대 — sbars = YEARS 해·인구 · 해마다 늘어남(따로 셈) = 문항 6 정답 · 첫 해 → 끝 해 차이 = 캡션 = 도전 답', () => { const Y = BD('u1_l09').YEARS, f = fig('u1_l09'); ok(f.k === 'sbars' && f.x.join() === Y.map(y => y.year).join() && f.v.join() === Y.map(y => y.pop).join(), '표');
  for (let i = 1; i < Y.length; i++) ok(Y[i].pop > Y[i - 1].pop, '늘어남 ' + i); ok(qa('u1_l09', 5) === '인구가 점점 늘고 있다', '문항 6'); const d = Y[Y.length - 1].pop - Y[0].pop; const h = FIG.render(f);
  ok(h.indexOf(Y[0].year + ' ' + Y[0].pop + '만 명 → ' + Y[Y.length - 1].year + ' ' + Y[Y.length - 1].pop + '만 명 · ' + d + '만 명 늘었어요') >= 0, '캡션'); ok(L.u1_l09.slides[11].data.levels['도전'].a.indexOf(Y[0].pop + '만 명 → ' + Y[Y.length - 1].pop + '만 명') === 0 && L.u1_l09.slides[11].data.levels['도전'].a.indexOf(d + '만 명') > 0, '도전 답'); });
T('l10 기후 — sbars = SEASONS 강수량 · 캡션 = 계절 기온 · 강수량 최대·기온 최대 = 여름(따로 셈) = 문항 5·6 정답 · 기온 최소 = 겨울 · 도전 답 수 = 표', () => { const S = BD('u1_l10').SEASONS, f = fig('u1_l10'); ok(f.k === 'sbars' && f.v.join() === S.map(s => s.precip).join() && f.x.join() === S.map(s => s.name).join(), '표');
  S.forEach(s => ok(f.caption.indexOf(s.name + ' ' + s.temp + '°C') >= 0, s.name + ' 기온')); const mx = (key, sgn) => S.slice().sort((a, b) => sgn * (b[key] - a[key]))[0].name;
  ok(mx('precip', 1) === '여름' && qa('u1_l10', 5) === '여름', '강수량'); ok(mx('temp', 1) === '여름' && qa('u1_l10', 4) === '여름', '기온'); ok(mx('temp', -1) === '겨울', '겨울');
  const a = L.u1_l10.slides[11].data.levels['도전'].a, su = S.find(s => s.name === '여름'), wi = S.find(s => s.name === '겨울'); ok(a.indexOf('여름 ' + su.temp + '°C · ' + su.precip + ' mm') >= 0 && a.indexOf('겨울 ' + wi.temp + '°C · ' + wi.precip + ' mm') >= 0, '도전 답');
  ok(qa('u1_l10', 6) === '기온 = 꺾은선 · 강수량 = 막대' && /꺾은선/.test(f.caption), '선·막대'); });
T('l11 비교표 — tools 다섯 = GEOINFO 이름 · 아래 줄 = 우리 지역 값 ↔ 다른 지역 값 · 다섯 항목 모두 두 값이 다름(따로 셈) · 이름 = 지리 정보 다섯(문항 8 정답)', () => { const G = BD('u1_l11').GEOINFO, f = fig('u1_l11'); ok(f.k === 'tools' && f.items.length === 5);
  G.forEach((g, i) => { ok(f.items[i].name === g.name && f.items[i].kind === '우리 지역 ' + g.ours + ' ↔ 다른 지역 ' + g.other, g.name); ok(g.ours !== g.other, g.name + ' 같음'); }); ok(G.map(g => g.name).join('·') === qa('u1_l11', 7), '다섯 = 문항 8'); });
T('l12 픽셀 지도 — led 6열 = GRID_COLS · 칸마다 지역 = PIXELS cells(따로 놓아 셈) · 지역별 칸 수 = 렌더 칸 수 · 1번 6칸 최대 · 4번 2칸 최소(= 문항 5) · 1번 북서·2번 북동(도전 답) · 색 = 원문 색', () => { const b = BD('u1_l12'), f = fig('u1_l12'), W = b.GRID_COLS; ok(f.k === 'led' && f.cols === W && f.cells.length % W === 0, '판');
  b.PIXELS.forEach((p, k) => { p.cells.forEach(([x, y]) => ok(f.cells[y * W + x].k === k && f.cells[y * W + x].name === String(k + 1), p.name + ' ' + x + ',' + y)); ok(f.cells.filter(c => c.k === k).length === p.cells.length, p.name + ' 칸 수'); ok(f.colors[k] === p.color, p.name + ' 색'); });
  const cnt = b.PIXELS.map(p => p.cells.length); ok(Math.max.apply(null, cnt) === 6 && cnt.indexOf(6) === 0 && Math.min.apply(null, cnt) === 2 && cnt.indexOf(2) === 3, '최대·최소'); ok(/1번 지역은 6칸, 4번 지역은 2칸/.test(SRC.u1_l12.problems[4].t) && qa('u1_l12', 4) === '1번이 4번보다 면적이 넓다', '문항 5');
  const h = FIG.render(f); b.PIXELS.forEach((p, k) => ok((h.match(new RegExp('so-lc on k' + k + '"', 'g')) || []).length === p.cells.length, '렌더 ' + p.name)); ok(h.indexOf(b.PIXELS[0].color) >= 0, '렌더 색');
  const cen = (p) => [p.cells.reduce((a, c) => a + c[0], 0) / p.cells.length, p.cells.reduce((a, c) => a + c[1], 0) / p.cells.length]; const H = f.cells.length / W; const dir = (p) => { const [x, y] = cen(p); return (y < (H - 1) / 2 ? '북' : '남') + (x < (W - 1) / 2 ? '서' : '동'); };
  const a = L.u1_l12.slides[11].data.levels['도전'].a; ok(dir(b.PIXELS[0]) === '북서' && dir(b.PIXELS[1]) === '북동' && a.indexOf('1번 지역은 지도의 북서쪽') === 0 && a.indexOf('2번 지역은 북동쪽') > 0, '도전 답 ' + dir(b.PIXELS[0]) + dir(b.PIXELS[1])); });
T('l13 용어 모으기 — groups ① = TERMS topic ① 이름 · ② = topic ② · 셋·셋 · 도전 답 = 두 칸 그대로 · 문항 7 정답 = 지리 정보', () => { const T0 = BD('u1_l13').TERMS, f = fig('u1_l13'); ok(f.k === 'groups' && f.bins.length === 2);
  ['①', '②'].forEach((tp, i) => ok(f.bins[i].items.map(x => x.name).join() === T0.filter(t => t.topic === tp).map(t => t.name).join(), tp)); ok(f.bins[0].items.length === 3 && f.bins[1].items.length === 3, '셋·셋');
  const a = L.u1_l13.slides[11].data.levels['도전'].a; ok(a.indexOf('① ' + T0.filter(t => t.topic === '①').map(t => t.name).join('·')) === 0 && a.indexOf('② ' + T0.filter(t => t.topic === '②').map(t => t.name).join('·')) > 0, '도전 답'); ok(qa('u1_l13', 6) === '지리 정보', '문항 7'); });
T('판 검사기 자체 확인 — l02 방위 칩 하나를 다른 갈래로, l12 픽셀 칸 하나를 다른 지역으로 옮기면 잡는다', () => { const f = fig('u1_l02'); const x = f.bins[0].items.shift(); f.bins[1].items.push(x); const P = BD('u1_l02').PLACES; const c1 = !Object.keys(P).every(k => f.bins[P[k].deg % 90 === 0 ? 0 : 1].items.some(y => y.name === P[k].ko + '쪽 · ' + P[k].name)); f.bins[1].items.pop(); f.bins[0].items.unshift(x);
  const g = fig('u1_l12'); const c0 = g.cells[0]; const keep = c0.k; c0.k = 3; const c2 = g.cells.filter(c => c.k === 0).length !== BD('u1_l12').PIXELS[0].cells.length; c0.k = keep; ok(c1 && c2, '못 잡음'); });

console.log('═══ N. 차단 어휘 ═══');
T('데이터·생성기 차단 어휘 0 (박음·빵꾸·갈아엎·결로)', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_social_u1.js'), 'utf8') + fs.readFileSync(path.join(TDIR, 'scripts/gen_g4_social_u1.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => ok(t.indexOf(x) < 0, x)); });

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
