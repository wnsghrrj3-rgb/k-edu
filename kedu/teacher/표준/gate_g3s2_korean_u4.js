/* gate_g3s2_korean_u4.js — 3학년 2학기 국어 4단원 「서로 존중하며 대화해요」 케이티처 2세대 게이트 (38차, 베프 — 국어 u3 게이트 복제 + 이름 조사 표·말머리·정리 줄 새로).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다. 국어라 산수 검산 대신 원문 계승·정답 표시·선행 용어를 전수 본다.
   A 로드·meta(묶음 차시 covers·분 = 40 × 차시 수) · B 19장 골격 · C 7요소 · D 복습 계보(u3_l14 → l01 → … → l14)
   E 정답 표시(하나 고르기 = 원문 정답 · 모두 고르기 = 원문 hit 그대로·틀린 보기 1↑ · 짝 잇기 = 원문 짝 전부) · 수준별·출구
   F 원문 계승(개념 말풍선 = 원문 글 · 글 판 = 원문 줄 · 인물 말·잇기 그림 = 원문 · 기본 문제 = 원문 문항 · 정리 = 원문 정리 줄, 정리 장 없는 차시는 원문 말풍선 줄)
   G 그림 렌더(개념 4장 전부 국어 부품 · 카드 이름 ** 없음 · 인물 이름 = 원문 인물) · M 이름 조사(받침에 맞는 조사 · 학생 화면·재료·원문 HTML 전수) · H 중복 0 · I 실렌더 + 1인 흐름 + 모두 고르기 표시
   J extras 22 · K 발문 6장↑·분 합(40분 30~45 · 80분 60~88 · 120분 90~130) · L 선행 용어(학생 화면: ‘-시-’·성함 l03 전 0 · 뜻을 포함 l05 전 0 · 방언·표준어 l14 전 0)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_korean_u4.js */
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

function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g3s2_korean_u4.js'));
const PREV = load(path.join(TDIR, 'data/g3s2_korean_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u4.json'), 'utf8'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l03', 'u4_l05', 'u4_l07', 'u4_l08', 'u4_l10', 'u4_l12', 'u4_l14'];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '서로 존중하며 대화해요';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));

console.log('═══ A. 로드 ═══');
T('9차시 키(묶음 차시는 첫 차시 번호)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit 3 · unit_title · covers·분 = 원문 파일 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = SRC[k].covers;
  ok(m.grade === 3 && m.term === 2 && m.unit === 4 && m.unit_title === UT && m.subject === '국어' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4국0\d-0\d\])+$|^단원 전체 통합$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex13 = PREV.u3_l14.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'u3_l14') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex13;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_korean:u3_l14'), 'from ' + rv.from); }));

console.log('═══ E. 정답 표시 ═══');
let nPick = 0, nCol = 0, nMatch = 0;
KEYS.forEach(k => T(k + ' 기본 3 = 원문 정답 그대로 · 수준별 · 출구', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, src = SRC[k].slides[s.src]; ok(src && src.log, s.id + ' 원문 문항 아님');
    if (src.kind === 'pick') { nPick++; ok(!d.multi && d.options.length === src.opts.length, s.id + ' 보기 수'); ok(d.options.filter(o => o.correct).length === 1, s.id + ' 정답 1'); ok(d.options.findIndex(o => o.correct) === src.ci, s.id + ' 정답 위치'); d.options.forEach((o, i) => ok(o.text === src.opts[i], s.id + ' 보기 원문')); ok(d.note.indexOf('**' + nb(src.opts[src.ci]) + '**') >= 0, s.id + ' 풀이 끝 = 정답'); }
    else if (src.kind === 'collect') { nCol++; ok(d.multi === true, s.id + ' multi'); ok(d.options.length >= 3 && d.options.length <= 6, s.id + ' 보기 3~6 (' + d.options.length + ')'); d.options.forEach(o => { const c = src.chips.find(x => x.t === o.text); ok(c, s.id + ' 원문에 없는 보기 ' + o.text); ok(!!o.correct === c.hit, s.id + ' 정답 표시 ≠ 원문 ' + o.text); });
      ok(d.options.some(o => o.correct) && d.options.some(o => !o.correct), s.id + ' 맞는 것·틀린 것 모두'); ok(d.note.indexOf('**' + d.options.filter(o => o.correct).length + '개**') >= 0, s.id + ' 풀이 개수'); }
    else if (src.kind === 'match') { nMatch++; src.pairs.forEach(p => ok(d.answer.indexOf(p[0] + ' ↔ ' + p[1]) >= 0, s.id + ' 짝 ' + p[0])); }
    else ok(false, s.id + ' 문항 종류 ' + src.kind); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open'); ['기본', '도전'].forEach(t => ok(lv[t].a && lv[t].steps.length >= 3, t + ' 답·풀이 단계'));
  sl[15].data.items.forEach(it => ok(it.q && it.a && /\?$/.test(it.q), '출구 ' + it.q)); }));
T('기본 문제 종류 — 하나 고르기 ' + nPick + ' · 모두 고르기 ' + nCol + ' · 짝 ' + nMatch + ' (고르기 둘 다 쓰임)', () => ok(nPick >= 8 && nCol >= 6, nPick + '/' + nCol));

console.log('═══ F. 원문 계승 ═══');
function srcContent(sl) { if (sl.kind === 'recap') return sl.items.join('\n'); if (sl.kind === 'stage') return [sl.text, sl.stage].filter(Boolean).join('\n'); return sl.text || ''; }
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 장(말풍선·글 판·인물 말) · 문항 = 원문 · 정리 = 원문 정리 줄', () => { const src = SRC[k];
  const used = new Set();
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && !sl.log, s.id + ' 원문 개념 장 아님'); ok(!used.has(s.src), s.id + ' 같은 원문 장 두 번'); used.add(s.src); ok(d.title === nb(sl.t), s.id + ' 제목 ' + d.title);
    if (sl.kind === 'read') { ok(d.fig.k === 'text' && d.fig.lines.length === sl.lines.length, s.id + ' 글 판 줄 수'); d.fig.lines.forEach((l, i) => ok(norm(typeof l === 'string' ? l : l.t) === norm(sl.lines[i].replace(/\n/g, ' / ')), s.id + ' 글 판 ' + (i + 1) + '줄 원문 아님')); ok(d.content && d.content.length < 90, s.id + ' 글 판 장 말풍선은 한 줄'); }
    else { ok(norm(d.content) === norm(srcContent(sl)) && d.content, s.id + ' 말풍선 원문 아님'); }
    if (sl.kind === 'scene' && d.fig.k === 'mood') d.fig.items.forEach((it, i) => ok(norm(it.say) === norm(sl.say[i][sl.say[i].length - 1]), s.id + ' 인물 말 원문 아님 ' + it.say)); });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.slides[s.src].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; const rc = src.slides.filter(x => x.kind === 'recap'); ok(rc.some(r => r.items.every((it, i) => sm[i] === it)) || (!rc.length && src.slides.some(x => x.kind === 'bub' && x.text && x.text.split('\n').every((ln, i) => sm[i] === nb(ln)))), '정리 줄 원문 아님'); }));
T('잇기 그림(link) 줄 = 같은 차시 원문 짝 잇기 그대로', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.data.fig && s.data.fig.k === 'link').forEach(s => { n++; ok(SRC[k].slides.some(x => x.kind === 'match' && JSON.stringify(x.pairs) === JSON.stringify(s.data.fig.rows)), k + ' ' + s.id); })); ok(n >= 2, 'link ' + n); });
T('원문 문항 전부의 짝이 맞다(짝 잇기 원문 자체 확인 — 3~4짝 · 왼쪽·오른쪽 겹침 0)', () => KEYS.forEach(k => SRC[k].slides.filter(x => x.kind === 'match').forEach(x => { const n = x.pairs.length; ok(n >= 3 && n <= 4, k + ' ' + x.t); ok(new Set(x.pairs.map(p => p[0])).size === n && new Set(x.pairs.map(p => p[1])).size === n, k + ' 겹침'); })));

console.log('═══ G. 그림 ═══');
const KO = ['text', 'mood', 'sort2', 'sound', 'tools', 'chain', 'link', 'note', 'para', 'letter', 'pause'];
KEYS.forEach(k => T(k + ' 개념 4장 국어 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && KO.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => ok(!/\*\*/.test(it.name), s.id + ' 카드 ** ' + it.name));
  if (f.k === 'sound' && f.ox) f.pairs.forEach(p => { ok(/[^ ] (것|수|줄)[ 을를이]/.test(p[0]), s.id + ' ○ 쪽이 것·수·줄을 띄어 씀 ' + p[0]); ok(!/[^ ] (것|수|줄)[ 을를이]/.test(p[1]) && p[0].replace(/ /g, '') === p[1].replace(/ /g, ''), s.id + ' ✗ 쪽은 띄어쓰기만 다름 ' + p[1]); });
  if (f.k === 'pause') { ok(f.lines.every(l => /∨/.test(l) && /≡$/.test(l)), s.id + ' 줄마다 ∨ 와 끝 ≡'); ok((h.match(/class="ko-p1"/g) || []).length === f.lines.join('').split('∨').length - 1 + 1 && (h.match(/class="ko-p2">≡/g) || []).length === f.lines.length + 1, s.id + ' ∨·≡ 표시 수(범례 포함)'); ok(!f.lines.some(l => /∨∨/.test(l)), s.id + ' ∨∨ 과 ≡ 섞임'); } })));
T('부품 가짓수 ≥ 6 (단원 안에서 글 판·인물·두 갈래·소리·카드·잇기·메모·띄어 읽기)', () => { const set = new Set(); KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && set.add(s.data.fig.k))); ok(set.size >= 6, [...set].join(',')); });

console.log('═══ H. 중복 ═══');
T('한 차시 안에서 기본·수준별 문제 중복 0 · 출구 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q, lv.심화.q); const n = e.map(norm); ok(new Set(n).size === n.length, k + ' 문제 중복'); const x = sl[15].data.items.map(i => norm(i.q)); ok(new Set(x).size === 3, k + ' 출구 중복'); }));
T('차시 사이 출구 문항 중복 0', () => { const all = []; KEYS.forEach(k => L[k].slides[15].data.items.forEach(i => all.push(norm(i.q)))); ok(new Set(all).size === all.length, '중복'); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 모두 고르기 표시', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬');
  if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄');
  if (s.block === 'basic_problem' && s.data.multi) { ok(/multi-hint|pv3-multi/.test(r.body), s.id + ' 모두 고르기 안내'); ok((r.body.match(/class="mk">☐|class="mk">☑/g) || []).length === s.data.options.length, s.id + ' 체크 칸'); if (rev) ok((r.body.match(/opt ok/g) || []).length === s.data.options.filter(o => o.correct).length, s.id + ' 열림 정답 수'); }
  if (s.block === 'basic_problem' && !s.data.multi && s.data.options && rev) ok((r.body.match(/opt ok/g) || []).length === 1, s.id + ' 열림 정답 1'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id)); }));

console.log('═══ K. 발문 ═══');
T('발문 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합 — 40분 차시 30~45 · 80분 묶음 60~88 · 120분 묶음 90~130 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : d === 80 ? m >= 60 && m <= 88 : m >= 90 && m <= 130, k + ' ' + m + '분/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
const vis = (s) => JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
const FIRST = [['‘-시-’', 'u4_l03'], ['성함', 'u4_l03'], ['포함', 'u4_l05'], ['방언', 'u4_l14'], ['표준어', 'u4_l14']];
FIRST.forEach(([w0, k0, s0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0 + (s0 ? ' ' + s0 : ''), () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (vis(s).indexOf(w0) < 0) return; const before = i < i0 || (i === i0 && s0 && s.id < s0); ok(!before, k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(KEYS.slice(i0).some(k => L[k].slides.some(s => vis(s).indexOf(w0) >= 0)), '「' + w0 + '」 한 번도 안 나옴'); }));
T('선행 검사기 자체 확인 — l03 이전 장에 「방언」을 심으면 잡는다', () => { const s = L.u4_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 방언'; let caught = false; try { KEYS.slice(0, 2).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('방언') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });

console.log('═══ M. 이름 조사 ═══');
/* 38차: 자기주도 원문에 「기현를·기현야·기현는·준오이가·온서이가·온서이 것·온서이야」(받침에 맞지 않는 조사)가 있어 원문 HTML 을 고쳤다 — 다시 생기지 않게 학생 화면·재료·원문 전수로 본다 */
const HAS = ['민결', '희찬', '혜온', '원준', '지웅', '기현'], NO = ['은후', '준오', '온서']; // 받침 있는 이름 = 이가·이는·이를·아 · 없는 이름 = 가·는·를·야
const BAD = new RegExp('(' + HAS.join('|') + ')(가|는|를|야)(?![가-힣])|(' + NO.join('|') + ')이(?=[가-힣 ])');
const scan = (t) => { const m = String(t).match(BAD); return m ? m[0] : null; };
T('학생 화면(교사 발문 제외) 이름 + 조사 틀림 0 — 받침 있는 이름(민결·희찬·혜온·원준·지웅·기현)은 이가·이는·아 · 없는 이름(은후·준오·온서)은 가·는·야', () => KEYS.forEach(k => L[k].slides.forEach(s => { const b = scan(vis(s)); ok(!b, k + ' ' + s.id + ' 「' + b + '」'); })));
T('교사 발문·extras 에도 이름 + 조사 틀림 0', () => KEYS.forEach(k => { const b = scan(JSON.stringify(L[k].slides.map(s => s.data.tnote)) + JSON.stringify(L[k].extras)); ok(!b, k + ' 「' + b + '」'); }));
T('재료(src)·원문 HTML 에도 이름 + 조사 틀림 0', () => { Object.keys(SRC).forEach(k => SRC[k].slides.forEach((s, i) => { const b = scan(JSON.stringify(s)); ok(!b, k + ' 원문 ' + i + ' 「' + b + '」'); }));
  const dir = path.join(TDIR, '..', '..', 'grade3/semester2/korean/4단원_서로존중하며대화해요'); fs.readdirSync(dir).filter(f => /\.html$/.test(f)).forEach(f => { const b = scan(fs.readFileSync(path.join(dir, f), 'utf8')); ok(!b, f + ' 「' + b + '」'); }); });
T('이름 조사 검사기 자체 확인 — 「기현를」「기현야」「온서이가」「준오이가」를 잡고 「기현이를」「기현아」「온서가」「준오는」은 지나간다', () => ok(scan('기현를 불렀다') && scan('기현야, 와') && scan('온서이가 왔다') && scan('준오이가 물었다') && scan('온서이 것') && !scan('기현이를 불렀다') && !scan('기현아, 와') && !scan('온서가 왔다') && !scan('준오는 말했다') && !scan('민결이는 웃었다') && !scan('은후야'), '검사기'));
T('인물 그림(mood) 이름 = 이 단원 인물(얼굴 = 인물 표) 또는 말머리(친구에게·선생님께·이웃 어른께)', () => { const FACE = { 민결: '👦', 희찬: '👦', 혜온: '👧', 원준: '👦', 지웅: '👦', 기현: '👦', 은후: '👧', 준오: '👦', 온서: '👧', 할머니: '👵' }; let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const f = s.data.fig; if (!f || f.k !== 'mood') return; f.items.forEach(it => { if (!it.name) return; n++; if (/(에게|께)$/.test(it.name)) { ok(it.who !== '🙂', k + ' ' + s.id + ' 말머리 얼굴'); return; } ok(FACE[it.name], k + ' ' + s.id + ' 모르는 인물 ' + it.name); ok(it.who === FACE[it.name], k + ' ' + s.id + ' 얼굴 ' + it.name); }); })); ok(n >= 4, 'mood 이름 ' + n); });

console.log('\n게이트 g3s2 국어 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
