/* gate_g3s2_science_u4.js — 3학년 2학기 과학 4단원 「감염병과 건강한 생활」 케이티처 2세대 게이트 (44차, 베프 — u3 게이트 복제 + 4단원 검산: 감염병/아님·감염 경로·유행시키는/예방하는 습관·유행 때/안전한 사회·손 씻을 때·손 씻기 6단계 판정 표).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다. 과학이라 산수 대신 원문 계승·정답 표시·선행 용어·판정 표를 전수 본다.
   A 로드·meta(묶음 차시 covers·분 = 40 × 차시 수) · B 19장 골격 · C 7요소 · D 복습 계보(2학기 u3_l10 → l01 → … → l11)
   E 정답 표시(mcq = 원문 정답 · ms = 원문 hit 그대로·맞/틀 둘 다 · cls = 통마다 원문 물건 전부 · mt = 원문 짝 전부) · 수준별·출구
   F 원문 계승(개념 = 원문 말풍선 · 시뮬 ① = 원문 관찰·탐구 표(카드 = 누른 것·첫 결과 줄) · 시뮬 ② = 원문 기준 안내문 + ask/sort2 두 갈래 = 원문 things · 오개념 = 원문 되짚기 · 문항 = 원문 · 정리 = 원문 정리 줄 · 자기 평가·다음 = 원문)
   G 그림 렌더(개념 4장 = 과학 부품 tools·chain·ask·sort2 · 카드 이름 ** 0) · H 중복 0 · I 실렌더 + 1인 흐름 + 모두 고르기 표시
   J extras 22 · K 발문 6장↑·분 합(40분 30~45 · 80분 60~88) · L 선행 용어(학생 화면: 병원체·세균·예방접종 l02 전 0 · 증상 l03 전 0 · 거리 두기 l04 전 0 · 감염 과정·비말·기침 예절 l05 전 0 · 예방 수칙 l07 전 0 · 실천 기록장 l08 전 0 · 세계 손 씻기의 날·6단계 l10 전 0 — 표지·다음 차시 예고 장 제외)
   M 감염병 판정(원문 전체에서 경험 → 감염병/아님 · 습관 → 손·음식/기침·공기/오염된 물 경로 · 습관 → 유행시키는/예방하는 · 모습 → 크게 유행할 때/안전한 사회 · 때 → 음식/기침·코 표를 모아 어긋남 0 · 뜻 규칙(넘어·데·부러·꽃가루 = 아님 / 감기·독감·수두·수족구·눈병·코로나 = 감염병 / 기침·같은 교실·학교·마스크·옷소매·비말 = 기침·공기 · 물 마시기 = 오염된 물 · 손·눈 비비기·음식·침 = 손·음식 / 씻지 않·먹던 음식·아픈데도·아무렇게나·대충·익히지 않 = 유행시키는 / 옷소매·비누·손을 씻어요·집에서 쉬·익혀·예방접종 = 예방하는 / 문을 닫·가득 차·제 역할·떨어져 앉·마스크·텅 빈 = 유행 때 / 함께·자유롭게·많아·모여 = 안전) · 손 씻기 6단계 차례 = 원문 feat · mt 단계 짝 · l11 「옳은 설명」 정확히 셋 · l02 감기≠독감 · l10 매일·비누 · 학생 화면 「X는 감염병이에요/아니에요」 서술 검산 + 검산기 자체 확인 · N 차단 어휘 0)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_science_u4.js */
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
const L = load(path.join(TDIR, 'data/g3s2_science_u4.js'));
const PREV = load(path.join(TDIR, 'data/g3s2_science_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_science_u4.json'), 'utf8'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l03', 'u4_l04', 'u4_l05', 'u4_l07', 'u4_l08', 'u4_l10', 'u4_l11'];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '감염병과 건강한 생활';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
const range = (n) => { const p = String(n).split('~').map(Number); return p.length === 2 ? p : [p[0], p[0]]; };

console.log('═══ A. 로드 ═══');
T('9차시 키(묶음 차시 5·6 · 8·9 는 첫 차시 번호 · l06·l09 없음)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit 3 · unit_title · covers·분 = 원문 파일 · 성취기준 · 학습 목표 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = range(SRC[k].n);
  ok(m.grade === 3 && m.term === 2 && m.unit === 4 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과08-0\d\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('원문 파일 성취기준 ⊂ meta.std (원문 머리 주석)', () => KEYS.forEach(k => { const s = SRC[k].std.match(/\[4과08-0\d\]/g) || []; s.forEach(x => ok(L[k].meta.std.indexOf(x) >= 0, k + ' ' + x)); ok(s.length >= 1, k + ' 원문 성취기준 0'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u3_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2학기 u3_l10') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_science:u3_l10'), 'from ' + rv.from); }));
T('단원을 넘는 계보는 l01 하나뿐(나머지 from 은 이 단원 키)', () => ok(KEYS.filter(k => /:/.test(L[k].slides[1].data.from)).length === 1, '넘는 자리 수'));

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
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (넷 다 쓰임)', () => ok(nMcq >= 9 && nCls >= 9 && nMt >= 6 && nMs >= 3, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
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
T('개념 4장 = 원문 개념 도입(2)·시뮬 ①(3)·시뮬 ②(4)·정리 카드(5) — 아홉 차시 모두 같은 자리', () => KEYS.forEach(k => ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '2,3,4,5', k)));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask', 'bins', 'cond', 'need', 'sort2', 'link', 'note', 'mimic', 'panels'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name));
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); }
  if (f.k === 'sort2') { ok(f.a.items.length >= 1 && f.b.items.length >= 1, s.id + ' 통 비어 있음'); ok(/ko-sort2 n2/.test(h), s.id + ' 두 통'); } })));
T('부품 가짓수 ≥ 4 (카드·차례·기준 갈래·두 통) · sort2 8↑(경험 문장 갈래) · ask 1↑(l10 손 씻을 때) · chain 3↑', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 4 && cnt.sort2 >= 8 && cnt.ask >= 1 && cnt.chain >= 3, JSON.stringify(cnt)); });

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
/* 학생 화면 = 발문 뺀 데이터 · 표지(단원 이름·부제)와 「다음 시간엔」 예고 장은 다음 차시 낱말을 미리 말하는 자리라 제외(원문 next-preview 계승) */
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
const FIRST = [['병원체', 'u4_l02'], ['세균', 'u4_l02'], ['예방접종', 'u4_l02'], ['증상', 'u4_l03'], ['거리 두기', 'u4_l04'], ['감염 과정', 'u4_l05'], ['비말', 'u4_l05'], ['기침 예절', 'u4_l05'], ['예방 수칙', 'u4_l07'], ['실천 기록장', 'u4_l08'], ['세계 손 씻기의 날', 'u4_l10'], ['6단계', 'u4_l10']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (vis(s).indexOf(w0) < 0) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), '「' + w0 + '」 도입 차시에 안 나옴'); }));
T('선행 검사기 자체 확인 — l03 장에 「비말」을 심으면 잡는다', () => { const s = L.u4_l03.slides[3]; const keep = s.data.content; s.data.content = keep + ' 비말'; let caught = false; try { KEYS.slice(0, 3).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('비말') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 개념·시뮬·정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides) + JSON.stringify(s.summary); /* 문항 보기·다음 예고는 제외 */ ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 감염병 판정 검산 ═══');
/* 원문 아홉 차시 전체에서 경험 → 감염병/아님(INF) · 습관 → 손·음식/기침·공기/오염된 물(ROUTE) · 습관 → 유행시키는/예방하는(HABIT) · 모습 → 크게 유행할 때/안전한 사회(SOC) · 때 → 음식/기침·코(WHEN) 표를 모은다: 통 나누기 · 짝(오른쪽이 뜻) · 모두 고르기(hit) · 기준 갈래 things */
const strip = (t) => nb(t).replace(/^[^\w가-힣]+/, '').replace(/\n/g, ' ').trim();
const INF = { yes: '감염병', no: '아님' }, ROUTE = { hand: '손·음식', air: '기침·공기', water: '오염된 물' }, HABIT = { bad: '유행시키는 습관', good: '예방하는 습관' }, SOC = { pan: '크게 유행할 때', safe: '안전한 사회' }, WHEN = { food: '음식과 관련', nose: '기침·코와 관련', etc: '그 밖' };
const routeOf = (t) => /기침|같은 교실|같은 공간|학교|마스크|옷소매|비말|공기/.test(t) ? 'air' : /물을 마|물 마시|오염된 물|물을 통해/.test(t) ? 'water' : /손|눈을 비벼|음식|침|먹/.test(t) ? 'hand' : null;
function gather() { const inf = {}, rt = {}, hb = {}, so = {}, wh = {}; const put = (tab, name, val) => { name = strip(name); if (!tab[name]) tab[name] = new Set(); tab[name].add(val); };
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => {
      if (q.kind === 'cls') { const bn = (id) => q.bins.find(b => b.id === id).name;
        q.items.forEach(it => { const b = bn(it.bin);
          if (/감염병이에요$/.test(b)) put(inf, it.t, INF.yes); if (/감염병이 아니에요$/.test(b)) put(inf, it.t, INF.no);
          if (/손이나 음식으로|손을 통한 감염/.test(b)) put(rt, it.t, ROUTE.hand); if (/기침이나 공기로|비말을 통한 감염/.test(b)) put(rt, it.t, ROUTE.air);
          if (/유행시키는 습관/.test(b)) put(hb, it.t, HABIT.bad); if (/예방하는 습관|실천할 수 있어요/.test(b)) put(hb, it.t, HABIT.good); if (/알맞지 않아요/.test(b) && /교실에서 실천/.test(q.t)) put(hb, it.t, HABIT.bad);
          if (/크게 유행할 때/.test(b)) put(so, it.t, SOC.pan); if (/안전한 사회/.test(b)) put(so, it.t, SOC.safe);
          if (/음식과 관련된 때/.test(b)) put(wh, it.t, WHEN.food); if (/기침이나 코와 관련된 때/.test(b)) put(wh, it.t, WHEN.nose); }); }
      if (q.kind === 'ms' && /감염병의 예를 모두/.test(q.t)) q.chips.forEach(c => put(inf, c.t, c.hit ? INF.yes : INF.no));
      if (q.kind === 'ms' && /유행시킬 만한 행동/.test(q.t)) q.chips.forEach(c => put(hb, c.t, c.hit ? HABIT.bad : HABIT.good));
      if (q.kind === 'mcq' && /예방 수칙이 아닌 것/.test(q.t)) q.opts.forEach((o, i) => put(hb, o, i === q.ci ? HABIT.bad : HABIT.good));
      if (q.kind === 'mt') q.pairs.forEach(p => { const r = strip(p[1]); if (/통해/.test(r)) { const rr = routeOf(r); ok(rr, k + ' 경로 뜻 모름 ' + r); put(rt, p[0], ROUTE[rr]); } if (/이용해요$|많아져요$/.test(r) && /가게|병원|놀이터/.test(p[0])) { put(so, p[0], SOC.pan); put(so, r, SOC.safe); } }); });
    s.slides.forEach(sl => { if (sl.kind !== 'classify') return; const t0 = sl.things[0];
      if (t0.inf !== undefined) sl.things.forEach(t => put(inf, t.n, t.inf ? INF.yes : INF.no));
      if (t0.spread !== undefined) sl.things.forEach(t => { put(hb, t.n, t.spread ? HABIT.bad : HABIT.good); if (t.air) put(rt, t.n, ROUTE.air); else { const rr = routeOf(t.n); if (rr) put(rt, t.n, ROUTE[rr]); } });
      if (t0.ok !== undefined && t0.hand !== undefined) sl.things.forEach(t => put(hb, t.n, t.ok ? HABIT.good : HABIT.bad));
      if (t0.pan !== undefined) sl.things.forEach(t => put(so, t.n, t.pan ? SOC.pan : SOC.safe));
      if (t0.food !== undefined && t0.nose !== undefined) sl.things.forEach(t => { ok(!(t.food && t.nose), k + ' 손 씻을 때 갈래 겹침 ' + t.n); put(wh, t.n, t.food ? WHEN.food : t.nose ? WHEN.nose : WHEN.etc); }); }); });
  return { inf, rt, hb, so, wh }; }
const G = gather();
const noBad = (tab, label) => { const bad = Object.keys(tab).filter(n => tab[n].size > 1); ok(!bad.length, label + ' 어긋남: ' + bad.map(n => n + ':' + [...tab[n]].join('/')).join(' · ')); };
const count = (tab) => { const c = {}; Object.values(tab).forEach(v => { const x = [...v][0]; c[x] = (c[x] || 0) + 1; }); return c; };
const infRule = (n) => /넘어|데|부러|꽃가루/.test(n) ? INF.no : /감기|독감|수두|수족구|눈병|코로나/.test(n) ? INF.yes : null;
T('감염병/아님 표 — 경험 ' + Object.keys(G.inf).length + '개 · 어긋남 0 · 감염병 8↑ · 아님 5↑', () => { noBad(G.inf, '감염병/아님'); const c = count(G.inf); ok(c['감염병'] >= 8 && c['아님'] >= 5, JSON.stringify(c)); });
T('감염병/아님 표 = 뜻 — 넘어·데·부러·꽃가루 = 아님 · 감기·독감·수두·수족구·눈병·코로나 = 감염병 (표의 이름 전부 규칙에 걸림)', () => Object.keys(G.inf).forEach(n => { const v = [...G.inf[n]][0]; const r = infRule(n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }));
T('감염 경로 표 — 습관 ' + Object.keys(G.rt).length + '개 · 어긋남 0 · 손·음식 4↑ · 기침·공기 4↑ · 오염된 물 2↑', () => { noBad(G.rt, '경로'); const c = count(G.rt); ok(c['손·음식'] >= 4 && c['기침·공기'] >= 4 && c['오염된 물'] >= 2, JSON.stringify(c)); });
T('감염 경로 표 = 뜻 — 기침·같은 교실·학교·마스크·옷소매·비말 = 기침·공기 · 물 마시기 = 오염된 물 · 손·눈 비비기·음식·침 = 손·음식', () => Object.keys(G.rt).forEach(n => { const v = [...G.rt[n]][0]; const r = routeOf(n); ok(r, n + ' — 규칙 없음'); ok(ROUTE[r] === v, n + ' ' + v); }));
const habRule = (n) => /씻지 않|먹던 음식|아픈데도|아무렇게나|확인하지 않은 물|대충|익히지 않|휴지를 책상|나눠 먹/.test(n) ? HABIT.bad : /옷소매|비누|손을 씻어요|집에서 쉬|깨끗한 물|익혀|예방접종|환기|마시지 않아요|기침 예절/.test(n) ? HABIT.good : null;
T('유행시키는/예방하는 습관 표 — 습관 ' + Object.keys(G.hb).length + '개 · 어긋남 0 · 유행시키는 8↑ · 예방하는 8↑', () => { noBad(G.hb, '습관'); const c = count(G.hb); ok(c['유행시키는 습관'] >= 8 && c['예방하는 습관'] >= 8, JSON.stringify(c)); });
T('습관 표 = 뜻 — 씻지 않·먹던 음식·아픈데도·아무렇게나·대충·익히지 않·휴지를 책상 = 유행시키는 · 옷소매·비누·손을 씻어요·집에서 쉬·익혀·예방접종·환기 = 예방하는', () => Object.keys(G.hb).forEach(n => { const v = [...G.hb[n]][0]; const r = habRule(n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }));
const socRule = (n) => /문을 닫|사람이 없|사람들이 없|가득 차|가득 찬|제 역할|떨어져 앉|마스크|텅 빈|등교하지 못|이용하기 어려/.test(n) ? SOC.pan : /함께|자유롭게|많아|모여|쉽게 이용/.test(n) ? SOC.safe : null;
T('유행 때/안전한 사회 표 — 모습 ' + Object.keys(G.so).length + '개 · 어긋남 0 · 유행 때 8↑ · 안전 8↑', () => { noBad(G.so, '사회'); const c = count(G.so); ok(c['크게 유행할 때'] >= 8 && c['안전한 사회'] >= 8, JSON.stringify(c)); });
T('사회 표 = 뜻 — 문을 닫·가득 차·제 역할·떨어져 앉·마스크·텅 빈 = 유행 때 · 함께·자유롭게·많아·모여 = 안전', () => Object.keys(G.so).forEach(n => { const v = [...G.so[n]][0]; const r = socRule(n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }));
T('손 씻을 때 표 — 때 ' + Object.keys(G.wh).length + '개 · 어긋남 0 · 식사·음식 = 음식 · 기침·재채기·코 = 기침·코 · 화장실·쓰레기 = 그 밖', () => { noBad(G.wh, '손 씻을 때'); const c = count(G.wh); ok(c['음식과 관련'] >= 2 && c['기침·코와 관련'] >= 2 && c['그 밖'] >= 2, JSON.stringify(c)); Object.keys(G.wh).forEach(n => { const v = [...G.wh[n]][0]; if (/식사|음식/.test(n)) ok(v === WHEN.food, n + ' ' + v); if (/기침|재채기|코/.test(n)) ok(v === WHEN.nose, n + ' ' + v); if (/화장실|쓰레기/.test(n)) ok(v === WHEN.etc, n + ' ' + v); }); });
const STEPS = ['손바닥', '손등', '손가락 사이', '두 손 모아', '엄지손가락', '손톱 밑'];
T('손 씻기 6단계 — 원문 feat 차례 = 손바닥·손등·손가락 사이·두 손 모아·엄지손가락·손톱 밑 · 정리 카드 장 순서 줄 · mt 「N단계 ↔ 방법」 = feat[N-1] 첫 줄 · 케이티처 chain 카드 여섯', () => { const fe = Object.values(SRC.u4_l10.slides[3].feat); ok(fe.map(f => f.name).join() === STEPS.join(), fe.map(f => f.name).join()); ok(nb(SRC.u4_l10.slides[5].text).indexOf(STEPS.join(' → ')) >= 0, '순서 줄');
  const q = SRC.u4_l10.problems[3]; ok(q.kind === 'mt'); q.pairs.forEach(p => { const n = +strip(p[0]).match(/(\d)단계/)[1]; ok(nb(fe[n - 1].items[0]).indexOf(strip(p[1]).replace(/요$/, '')) >= 0, p[0] + ' ↔ ' + p[1]); });
  const f = L.u4_l10.slides[4].data.fig; ok(f.k === 'chain' && f.items.map(i => i.name).join() === STEPS.join(), '케이티처 chain'); });
T('l07 「손을 씻으면 좋은 때」 — 외출·식사 전·기침 뒤 = 맞음 · 「깨끗해 보이면 씻지 않아도」 = 틀림 · l10 「반드시 씻어야 하는 때」 — 「세계 손 씻기의 날에만」 = 틀림', () => { const q = SRC.u4_l07.problems[4]; ok(q.kind === 'ms'); q.chips.forEach(c => ok(c.hit === !/씻지 않아도/.test(c.t), c.t)); const q2 = SRC.u4_l10.problems[4]; ok(q2.kind === 'ms'); q2.chips.forEach(c => ok(c.hit === !/날에만/.test(c.t), c.t)); });
const FALSE11 = ['감염병은 예방할 수 없어요', '뜨거운 물에 데인 것도 감염병이에요', '생활 습관은 감염병 유행과 관련이 없어요'];
T('l11 「옳은 설명인가?」 진리표 — 옳지 않은 설명 = 정확히 셋(예방 불가 · 데인 것도 감염병 · 습관 무관) · 나머지 옳음', () => { const sl = SRC.u4_l11.slides[4]; ok(sl.crits[0].id === 'ok'); sl.things.forEach(t => ok(t.ok === (FALSE11.indexOf(t.n) < 0), t.n)); ok(sl.things.filter(t => !t.ok).length === 3); });
T('l02 오개념 — 감기와 독감은 다른 질병(원문 되짚기 · l02 마지막 ms 「심해지면 독감」 = 틀림 · 케이티처 오개념 장에 독감)', () => { ok(/서로 다른 질병/.test(nb(SRC.u4_l02.slides[6].recall)), '되짚기'); const q = SRC.u4_l02.problems[7]; ok(q.chips.find(c => /독감이 돼요/.test(c.t)).hit === false, 'ms'); ok(/독감/.test(L.u4_l02.slides[7].data.wrong), '케이티처'); });
T('l07·l10 오개념 — 손 씻기 = 비누·30초·매일(l07 되짚기 비누·30초 · l10 되짚기 매일 · l10 ms 「물로만 헹궈도」 = 틀림 · 케이티처 오개념 장)', () => { ok(/비누/.test(nb(SRC.u4_l07.slides[6].recall)) && /30초/.test(nb(SRC.u4_l07.slides[6].recall)), 'l07 되짚기'); ok(/매일/.test(nb(SRC.u4_l10.slides[6].recall)), 'l10 되짚기'); ok(SRC.u4_l10.problems[7].chips.find(c => /물로만/.test(c.t)).hit === false, 'ms'); ok(/물로만/.test(L.u4_l07.slides[7].data.wrong) && /날에만/.test(L.u4_l10.slides[7].data.wrong), '케이티처'); });
T('l05 기준 갈래 진리표 — 옷소매로 가리기·밥 먹기 전 손 씻기 = 유행 안 시킴 · 나머지 넷 = 유행시킴 · air 갈래는 기침·학교·옷소매 셋', () => { const sl = SRC.u4_l05.slides[4]; sl.things.forEach(t => ok(t.spread === !/옷소매|손을 씻어요/.test(t.n), t.n)); ok(sl.things.filter(t => t.air).length === 3 && sl.things.filter(t => t.air).every(t => /기침|학교/.test(t.n)), 'air'); });
const SAY = /([가-힣 ]{1,20}?)(?:은|는|이|가|도) 감염병(?:이에요|이 아니에요|이 아니|이라|이지|일까요)/g;
const sayCheck = (t) => { let m, n = 0; const bad = []; const re = new RegExp(SAY.source, 'g'); while ((m = re.exec(t))) { const nm0 = strip(m[1]).replace(/^(그래서|그러니|그래도|하지만|또|이런|이처럼) /, '').trim(); const exp = m[0].indexOf('아니') >= 0 ? INF.no : INF.yes; const ks = Object.keys(G.inf); const key = ks.find(x => nm0.endsWith(x) || x.endsWith(nm0)) || (nm0.length >= 2 ? ks.find(x => x.indexOf(nm0) >= 0 || nm0.indexOf(x) >= 0) : null); const truth = key ? [...G.inf[key]][0] : infRule(nm0); if (!truth) continue; n++; if (truth !== exp) bad.push(m[0]); } return { n, bad }; };
/* l11 「옳은 설명인가?」 두 통은 옳지 않은 설명을 일부러 늘어놓는 자리라 그 그림만 뺀다(원문 things) */
const vis2 = (s) => (s.block === 'concept' && s.data.fig && /옳은 설명/.test(s.data.fig.q || '')) ? JSON.stringify(Object.assign({}, s.data, { tnote: undefined, fig: undefined })) : vis(s);
T('학생 화면의 「X는 감염병이에요/아니에요」 서술이 표·규칙과 어긋나지 않음 — 전수(l11 옳은 설명 두 통 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(nb(vis2(s))); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」 ≠ 표'); })); ok(n >= 2, '검산 대상 ' + n); });
T('검산기 자체 확인 — 「뜨거운 물에 데인 것은 감염병이에요」「독감은 감염병이 아니에요」를 잡고 「수두는 감염병이에요」「데인 것은 감염병이 아니에요」는 지나간다', () => ok(sayCheck('뜨거운 물에 데인 것은 감염병이에요').bad.length === 1 && sayCheck('독감은 감염병이 아니에요').bad.length === 1 && !sayCheck('수두는 감염병이에요').bad.length && !sayCheck('데인 것은 감염병이 아니에요').bad.length && sayCheck('수두는 감염병이에요').n === 1, '검산기'));
T('오개념 장 「틀린 생각」이 표와 반대 — l03 = 증상 외우기 · l04 = 언제나 문 닫음 · l05 = 재미만 · l08 = 비난 · l11 = 예방 불가', () => { ok(/외워야/.test(L.u4_l03.slides[7].data.wrong), 'l03'); ok(/언제나/.test(L.u4_l04.slides[7].data.wrong), 'l04'); ok(/재미/.test(L.u4_l05.slides[7].data.wrong), 'l05'); ok(/비난/.test(L.u4_l08.slides[7].data.wrong), 'l08'); ok(/예방할 수 없/.test(L.u4_l11.slides[7].data.wrong), 'l11'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g3s2_science_u4.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); });

console.log('\n게이트 g3s2 과학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
