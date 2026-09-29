/* gate_g3s2_science_u1.js — 3학년 2학기 과학 1단원 「물체와 물질」 케이티처 2세대 게이트 (41차, 베프 — 국어 u6 게이트 복제 + 과학용 검산: 상태·물질 판정 진리표).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다. 과학이라 산수 대신 원문 계승·정답 표시·선행 용어·상태/물질 판정을 전수 본다.
   A 로드·meta(묶음 차시 covers·분 = 40 × 차시 수) · B 19장 골격 · C 7요소 · D 복습 계보(1학기 g3_science u4_l11 → l01 → … → l11)
   E 정답 표시(mcq = 원문 정답 · ms = 원문 hit 그대로·맞/틀 둘 다 · cls = 통마다 원문 물건 전부 · mt = 원문 짝 전부) · 수준별·출구
   F 원문 계승(개념 = 원문 말풍선 · 시뮬 ① = 원문 관찰 표(카드 = 누른 것·첫 결과 줄) · 시뮬 ② = 원문 기준 안내문 + ask 두 갈래 = 원문 things · 오개념 = 원문 되짚기 · 문항 = 원문 · 정리 = 원문 정리 줄 · 자기 평가·다음 = 원문)
   G 그림 렌더(개념 4장 = 과학 부품 tools·chain·ask · 카드 이름 ** 0) · H 중복 0 · I 실렌더 + 1인 흐름 + 모두 고르기 표시
   J extras 22 · K 발문 6장↑·분 합(40분 30~45 · 80분 60~88) · L 선행 용어(학생 화면: 물질 l02 전 0 · 부피·고체·액체 l05 전 0 · 기체 l06 전 0 · 3D 프린터 l10 전 0 — 다음 차시 예고 장 제외)
   M 상태·물질 판정(원문 전체에서 물건 → 상태(고체·액체·기체)·물건 → 물질(나무·철·유리·플라스틱) 표를 모아 어긋남 0 · 기준(모양·부피) 진리표와 일치 · 검산기 자체 확인)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_science_u1.js */
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
const L = load(path.join(TDIR, 'data/g3s2_science_u1.js'));
const PREV = load(path.join(TDIR, 'data/g3_science_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_science_u1.json'), 'utf8'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06', 'u1_l07', 'u1_l08', 'u1_l10', 'u1_l11'];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '물체와 물질';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
const range = (n) => { const p = String(n).split('~').map(Number); return p.length === 2 ? p : [p[0], p[0]]; };

console.log('═══ A. 로드 ═══');
T('10차시 키(묶음 차시 8·9 는 첫 차시 번호 · l09 없음)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit 1 · unit_title · covers·분 = 원문 파일 · 성취기준 · 학습 목표 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = range(SRC[k].n);
  ok(m.grade === 3 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과05-0\d\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('원문 파일 성취기준 ⊂ meta.std (원문 머리 주석)', () => KEYS.forEach(k => { const s = SRC[k].std.match(/\[4과05-0\d\]/g) || []; s.forEach(x => ok(L[k].meta.std.indexOf(x) >= 0, k + ' ' + x)); ok(s.length >= 1, k + ' 원문 성취기준 0'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u4_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '1학기 u4_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3_science:u4_l11'), 'from ' + rv.from); }));
T('학기를 넘는 계보는 l01 하나뿐(나머지 from 은 이 단원 키)', () => ok(KEYS.filter(k => /:/.test(L[k].slides[1].data.from)).length === 1, '넘는 자리 수'));

console.log('═══ E. 정답 표시 ═══');
let nMcq = 0, nMs = 0, nCls = 0, nMt = 0;
KEYS.forEach(k => T(k + ' 기본 3 = 원문 정답 그대로 · 수준별 · 출구', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; ok(/^p\d$/.test(s.src), s.id + ' src ' + s.src); const src = SRC[k].problems[+s.src.slice(1)]; ok(src, s.id + ' 원문 문항 아님');
    if (src.kind === 'mcq') { nMcq++; ok(!d.multi && d.options.length === src.opts.length, s.id + ' 보기 수'); ok(d.options.filter(o => o.correct).length === 1, s.id + ' 정답 1'); ok(d.options.findIndex(o => o.correct) === src.ci, s.id + ' 정답 위치'); d.options.forEach((o, i) => ok(o.text === src.opts[i], s.id + ' 보기 원문')); ok(d.note.indexOf('**' + nb(src.opts[src.ci]) + '**') >= 0, s.id + ' 풀이 끝 = 정답'); }
    else if (src.kind === 'ms') { nMs++; ok(d.multi === true, s.id + ' multi'); ok(d.options.length === src.chips.length, s.id + ' 보기 수'); d.options.forEach((o, i) => { ok(o.text === src.chips[i].t, s.id + ' 보기 원문 ' + o.text); ok(!!o.correct === src.chips[i].hit, s.id + ' 정답 표시 ≠ 원문 ' + o.text); });
      ok(d.options.some(o => o.correct) && d.options.some(o => !o.correct), s.id + ' 맞는 것·틀린 것 모두'); ok(d.note.indexOf('**' + d.options.filter(o => o.correct).length + '개**') >= 0, s.id + ' 풀이 개수'); }
    else if (src.kind === 'cls') { nCls++; ok(d.scenario.body.indexOf('나눌 것: ' + src.items.map(it => it.emoji + ' ' + it.t).join(' · ')) >= 0, s.id + ' 나눌 것 = 원문 물건'); src.bins.forEach(b => { ok(d.scenario.body.indexOf(b.name) >= 0, s.id + ' 통 이름 ' + b.name); const seg = d.answer.split(' / ').find(x => x.startsWith(b.name + ' — ')); ok(seg, s.id + ' 답에 통 ' + b.name); const items = seg.slice(b.name.length + 3).split(' · '); ok(JSON.stringify(items) === JSON.stringify(src.items.filter(it => it.bin === b.id).map(it => it.t)), s.id + ' 통 ' + b.name + ' 물건 ≠ 원문'); }); }
    else if (src.kind === 'mt') { nMt++; ok(d.scenario.body.indexOf('왼쪽: ' + src.pairs.map(p => p[0].replace(/\n/g, ' ')).join(' · ')) >= 0 && d.scenario.body.indexOf('오른쪽: ' + src.pairs.map(p => p[1]).join(' · ')) >= 0, s.id + ' 왼쪽·오른쪽 = 원문 짝'); src.pairs.forEach(p => ok(d.answer.indexOf(p[0].replace(/\n/g, ' ') + ' ↔ ' + p[1]) >= 0, s.id + ' 짝 ' + p[0]) || ok(d.scenario.body.indexOf(p[1]) >= 0, s.id + ' 오른쪽 ' + p[1])); }
    else ok(false, s.id + ' 문항 종류 ' + src.kind); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open'); ['기본', '도전'].forEach(t => ok(lv[t].a && lv[t].steps.length >= 3, t + ' 답·풀이 단계'));
  sl[15].data.items.forEach(it => ok(it.q && it.a && /\?$/.test(it.q), '출구 ' + it.q)); }));
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (넷 다 쓰임)', () => ok(nMcq >= 8 && nCls >= 8 && nMt >= 6 && nMs >= 2, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
T('원문 문항 자체 확인 — mcq 정답 1 · ms 맞·틀 둘 다 · cls 통마다 물건 1↑ · mt 왼쪽·오른쪽 겹침 0', () => KEYS.forEach(k => SRC[k].problems.forEach(q => { if (q.kind === 'mcq') ok(q.ci >= 0 && q.opts.length >= 3, k + ' ' + q.t); if (q.kind === 'ms') ok(q.chips.some(c => c.hit) && q.chips.some(c => !c.hit), k + ' ' + q.t); if (q.kind === 'cls') q.bins.forEach(b => ok(q.items.some(it => it.bin === b.id), k + ' 빈 통 ' + b.name)); if (q.kind === 'mt') ok(new Set(q.pairs.map(p => p[0])).size === q.pairs.length && new Set(q.pairs.map(p => p[1])).size === q.pairs.length, k + ' 짝 겹침'); })));

console.log('═══ F. 원문 계승 ═══');
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 장(말풍선·관찰 표·기준 갈래·정리 카드) · 오개념 = 원문 되짚기 · 문항 = 원문 · 정리·자기 평가·다음 = 원문', () => { const src = SRC[k];
  const used = new Set();
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && sl.kind !== 'goal' && sl.kind !== 'miscon', s.id + ' 원문 개념 장 아님'); ok(!used.has(s.src), s.id + ' 같은 원문 장 두 번'); used.add(s.src); ok(d.title === nb(sl.title), s.id + ' 제목 ' + d.title);
    if (sl.kind === 'feat') { const fe = Object.values(sl.feat); ok(d.content && d.content.length < 90, s.id + ' 관찰 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 관찰 장 부품'); ok(d.fig.items.length === fe.length || d.fig.items.length >= 3, s.id + ' 카드 수'); d.fig.items.forEach(it => { const f = fe.find(x => x.name === it.name); ok(f, s.id + ' 원문에 없는 카드 ' + it.name); ok(it.emoji === f.emoji && it.kind === nb(f.items[0]).replace(/\.$/, ''), s.id + ' 카드 아래 줄 ≠ 원문 첫 결과 ' + it.name); }); }
    else if (sl.kind === 'classify') { const crit = sl.crits.find(c => c.t === d.fig.q); ok(crit, s.id + ' 기준 질문 원문 아님 ' + d.fig.q); ok(norm(d.content) === nb(sl.msgs[crit.id]), s.id + ' 말풍선 ≠ 원문 기준 안내문'); ok(d.fig.k === 'ask' || d.fig.k === 'sort2', s.id + ' ask/sort2 아님');
      const ys = d.fig.k === 'ask' ? d.fig.yes.map(x => x.emoji + ' ' + x.name) : d.fig.a.items, ns = d.fig.k === 'ask' ? d.fig.no.map(x => x.emoji + ' ' + x.name) : d.fig.b.items;
      ok(JSON.stringify(ys) === JSON.stringify(sl.things.filter(t => t[crit.id]).map(t => t.e + ' ' + t.n)) && JSON.stringify(ns) === JSON.stringify(sl.things.filter(t => !t[crit.id]).map(t => t.e + ' ' + t.n)), s.id + ' 두 갈래 ≠ 원문 기준값(그림 포함)'); }
    else { ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); if (sl.cards && (d.fig.k === 'tools' || d.fig.k === 'chain')) { ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = String(sl.cards[i].label).replace(/\*\*/g, '').split('\n'); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls.slice(1).join(' '), s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드'); }); } } });
  const m = L[k].slides[7].data, ms = src.slides[6]; ok(ms.kind === 'miscon' && m.title === nb(ms.title) && m.right === ms.recall.replace(/\n/g, ' ') + '\n' + ms.text, '오개념 장 ≠ 원문 조심해요');
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 개념 도입(2)·시뮬 ①(3)·시뮬 ②(4)·정리 카드(5) — 열 차시 모두 같은 자리', () => KEYS.forEach(k => ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '2,3,4,5', k)));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask', 'bins', 'cond', 'need', 'sort2', 'link', 'note', 'mimic', 'panels'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name));
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); }
  if (f.k === 'sort2') { ok(f.a.items.length >= 1 && f.b.items.length >= 1, s.id + ' 통 비어 있음'); ok(/ko-sort2 n2/.test(h), s.id + ' 두 통'); } })));
T('부품 가짓수 ≥ 4 (카드·차례·기준 갈래·두 통) · ask 9↑ · sort2 1↑(l08 문장 갈래) · chain 3↑', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 4 && cnt.ask >= 9 && cnt.sort2 >= 1 && cnt.chain >= 3, JSON.stringify(cnt)); });

console.log('═══ H. 중복 ═══');
T('한 차시 안에서 기본·수준별 문제 중복 0 · 출구 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q, lv.심화.q); const n = e.map(norm); ok(new Set(n).size === n.length, k + ' 문제 중복'); const x = sl[15].data.items.map(i => norm(i.q)); ok(new Set(x).size === 3, k + ' 출구 중복'); }));
T('차시 사이 출구 문항 중복 0', () => { const all = []; KEYS.forEach(k => L[k].slides[15].data.items.forEach(i => all.push(norm(i.q)))); ok(new Set(all).size === all.length, '중복'); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 모두 고르기 표시 · 통·짝 카드', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬');
  if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄');
  if (s.block === 'basic_problem' && s.data.multi) { ok(/multi-hint/.test(r.body), s.id + ' 모두 고르기 안내'); ok((r.body.match(/class="mk">☐|class="mk">☑/g) || []).length === s.data.options.length, s.id + ' 체크 칸'); if (rev) ok((r.body.match(/opt ok/g) || []).length === s.data.options.filter(o => o.correct).length, s.id + ' 열림 정답 수'); }
  if (s.block === 'basic_problem' && !s.data.multi && s.data.options && rev) ok((r.body.match(/opt ok/g) || []).length === 1, s.id + ' 열림 정답 1');
  if (s.block === 'basic_problem' && /나눌 것: |왼쪽: /.test(s.data.scenario.body)) ok(!/num-cards/.test(r.body) && /(나눌 것|왼쪽): /.test(r.body), s.id + ' 통·짝 줄 안 섬'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id)); }));

console.log('═══ K. 발문 ═══');
T('발문 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합 — 40분 차시 30~45 · 80분 묶음 60~88 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : m >= 60 && m <= 88, k + ' ' + m + '분/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
/* 학생 화면 = 발문 뺀 데이터 · 표지(단원 이름 「물체와 물질」)와 「다음 시간엔」 예고 장은 다음 차시 낱말을 미리 말하는 자리라 제외(원문 next-preview 계승) */
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
const FIRST = [['물질', 'u1_l02'], ['부피', 'u1_l05'], ['고체', 'u1_l05'], ['액체', 'u1_l05'], ['기체', 'u1_l06'], ['3D 프린터', 'u1_l10']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (vis(s).indexOf(w0) < 0) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), '「' + w0 + '」 도입 차시에 안 나옴'); }));
T('선행 검사기 자체 확인 — l04 장에 「기체」를 심으면 잡는다', () => { const s = L.u1_l04.slides[3]; const keep = s.data.content; s.data.content = keep + ' 기체'; let caught = false; try { KEYS.slice(0, 5).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('기체') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 개념·시뮬·정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides) + JSON.stringify(s.summary); /* 문항 보기의 미끼(l05 「기체예요」)는 제외 */ ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 상태·물질 판정 검산 ═══');
/* 원문 열 차시 전체에서 물건 → 상태 · 물건 → 물질 표를 모은다: 통 나누기(solid/liquid/gas · wood/iron/glass/plastic) · 짝(오른쪽이 상태·물질) · 관찰 표(「상태: X」·「물질: X」) · 기준 갈래(shape/vol 진리표) */
const STATE = { solid: '고체', liquid: '액체', gas: '기체', 고체: '고체', 액체: '액체', 기체: '기체' }, MAT = { wood: '나무', iron: '철', glass: '유리', plastic: '플라스틱', 나무: '나무', 철: '철', 유리: '유리', 플라스틱: '플라스틱', rubber: '고무', 고무: '고무' };
const strip = (t) => nb(t).replace(/^[^\w가-힣]+/, '').replace(/\n/g, ' ');
function gather() { const st = {}, mt = {}, srcOf = {}; const put = (tab, name, val, where) => { name = strip(name); if (!tab[name]) tab[name] = new Set(); tab[name].add(val); (srcOf[name] = srcOf[name] || []).push(where + '=' + val); };
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => { if (q.kind === 'cls') q.items.forEach(it => { if (STATE[it.bin]) put(st, it.t, STATE[it.bin], k + ' ' + q.t); if (MAT[it.bin]) put(mt, it.t, MAT[it.bin], k + ' ' + q.t); }); if (q.kind === 'mt') q.pairs.forEach(p => { const r = strip(p[1]); if (STATE[r]) put(st, p[0], STATE[r], k); if (MAT[r]) put(mt, p[0], MAT[r], k); }); });
    s.slides.forEach(sl => { if (sl.kind === 'feat') Object.values(sl.feat).forEach(f => { const a = f.items[0].match(/^상태: (고체|액체|기체)/); if (a) put(st, f.name, a[1], k + ' 관찰'); const b = f.items[0].match(/^물질: (나무|철|유리|플라스틱|고무)$/); if (b) put(mt, f.name, b[1], k + ' 관찰'); });
      if (sl.kind === 'classify' && sl.things[0].shape !== undefined) sl.things.forEach(t => { const v = t.vol !== undefined ? t.vol : (t.see === false); put(st, t.n, !t.shape ? '고체' : v ? '기체' : '액체', k + ' 기준'); }); }); });
  return { st, mt, srcOf }; }
const G = gather();
T('상태 표 — 물건 ' + Object.keys(G.st).length + '개 · 어긋남 0 · 고체·액체·기체 고체·액체 5↑ · 기체 4↑', () => { const bad = Object.keys(G.st).filter(n => G.st[n].size > 1); ok(!bad.length, bad.map(n => n + ':' + [...G.st[n]].join('/')).join(' · ')); const c = { 고체: 0, 액체: 0, 기체: 0 }; Object.values(G.st).forEach(v => c[[...v][0]]++); ok(c.고체 >= 5 && c.액체 >= 5 && c.기체 >= 4, JSON.stringify(c)); });
T('물질 표 — 물체 ' + Object.keys(G.mt).length + '개 · 어긋남 0 · 나무·철·유리·플라스틱 넷 다 3↑', () => { const bad = Object.keys(G.mt).filter(n => G.mt[n].size > 1); ok(!bad.length, bad.map(n => n + ':' + [...G.mt[n]].join('/')).join(' · ')); const c = {}; Object.values(G.mt).forEach(v => c[[...v][0]] = (c[[...v][0]] || 0) + 1); ok(c.나무 >= 3 && c.철 >= 3 && c.유리 >= 3 && c.플라스틱 >= 3, JSON.stringify(c)); });
T('기준 갈래 진리표 — 모양 변함 = 액체·기체 · 부피 변함 = 기체만 · 안 보임 = 기체만 · 손으로 잡힘 = 고체만 (원문 things 전수)', () => KEYS.forEach(k => SRC[k].slides.filter(sl => sl.kind === 'classify' && sl.things[0].shape !== undefined).forEach(sl => sl.things.forEach(t => { const s = [...G.st[strip(t.n)]][0]; ok(t.shape === (s !== '고체'), k + ' ' + t.n + ' 모양'); if (t.vol !== undefined) ok(t.vol === (s === '기체'), k + ' ' + t.n + ' 부피'); if (t.see !== undefined) ok(t.see === (s !== '기체'), k + ' ' + t.n + ' 보임'); if (t.hold !== undefined) ok(t.hold === (s === '고체'), k + ' ' + t.n + ' 잡힘'); }))));
T('l02 기준 「철이 들어 있는가?」 = 관찰 표의 물질에 철이 있는가 · 「한 가지 물질」 = 관찰 표 첫 줄에 「/」 없음', () => { const sl = SRC.u1_l02.slides[4]; sl.things.forEach(t => { const f = Object.values(SRC.u1_l02.slides[3].feat).find(x => x.name === t.n); ok(f, t.n); ok(t.iron === /철/.test(f.items[0]), t.n + ' 철'); ok(t.one === !/\//.test(f.items[0]), t.n + ' 한 가지'); }); });
const SAY = /([가-힣 ]{1,12}?)(?:은|는|이|가) (고체|액체|기체|나무|철|유리|플라스틱)(?:예요|이에요|다|로 분류)/g;
const sayCheck = (t) => { let m, n = 0; const bad = []; const re = new RegExp(SAY.source, 'g'); while ((m = re.exec(t))) { const nm0 = strip(m[1]).split(' ').slice(-2).join(' '); const tab = STATE[m[2]] ? G.st : G.mt; const key = Object.keys(tab).find(x => nm0.endsWith(x) || x.endsWith(nm0)); if (!key) continue; n++; if (!tab[key].has(m[2])) bad.push(m[0]); } return { n, bad }; };
T('학생 화면의 상태·물질 서술이 표와 어긋나지 않음 — 「X는 고체/액체/기체」·「X는 나무/철/유리/플라스틱」 꼴 전수', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(nb(vis(s))); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」 ≠ 표'); })); ok(n >= 5, '검산 대상 ' + n); });
T('검산기 자체 확인 — 「우유는 고체」「윷은 유리」를 잡고 「우유는 액체」「윷은 나무」는 지나간다', () => ok(sayCheck('우유는 고체예요').bad.length === 1 && sayCheck('윷은 유리예요').bad.length === 1 && !sayCheck('우유는 액체예요').bad.length && !sayCheck('윷은 나무예요').bad.length && sayCheck('우유는 액체예요').n === 1, '검산기'));

console.log('\n게이트 g3s2 과학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
