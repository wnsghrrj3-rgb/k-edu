/* gate_g4_science_u1.js — 4학년 1학기 과학 1단원 「자석의 이용」 케이티처 2세대 게이트 (66차, 베프 — 3-2 과학 게이트 A~E·H~K 틀 + 4-1 원문 꼴(예상→관찰·살펴보기·정리 카드 둘·머리 주석 오개념)에 맞춘 F·G + 자석 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(파일 키 ↔ 차시 키 · 성취기준 [4과09-0N]) · B 19장 · C 7요소 · D 복습 계보(3-2 과학 u4_l11 → l01 → … → l11)
   E 정답 표시(원문 그대로) · F 원문 계승(시뮬 ① 카드 아래 줄 = 원문 관찰 결과 토막 · 시뮬 ② = 원문 살펴보기 이름·결과 줄 / 두 갈래 = 원문 전부 · 정리 카드 = 원문 · 오개념 = 원문 「오개념 직격」 주석 또는 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문 · L 선행 용어(극·밀어내 l04 · 나침반 l06 · 설계 l08 · 액체 자석·첨단 l10 · 자기장·전자석 0)
   M 자석 판정(원문 전체 붙음/안 붙음 · 밀어냄/끌어당김 · 나침반 빨간색 부분 표 어긋남 0 + 뜻 규칙 · 학생 화면 서술 검산 + 검산기 자체 확인) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_science_u1.js */
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
const L = load(path.join(TDIR, 'data/g4_science_u1.js'));
const PREV = load(path.join(TDIR, 'data/g3s2_science_u4.js'));
const SRC0 = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_science_u1.json'), 'utf8'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l06', 'u1_l07', 'u1_l08', 'u1_l10', 'u1_l11'];
/* 원문은 파일 키(u1_l01~l09) — 케이티처 키는 차시 번호. meta.src_key 로 잇는다 */
const FK = {}; KEYS.forEach(k => { FK[k] = L[k] && L[k].meta.src_key; });
const SRC = {}; KEYS.forEach(k => { SRC[k] = SRC0[FK[k]]; });
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '자석의 이용';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
const range = (n) => { const p = String(n).split('~').map(Number); return p.length === 2 ? p : [p[0], p[0]]; };

console.log('═══ A. 로드 ═══');
T('9차시 키(묶음 4·5 → l04 · 8·9 → l08 · 원문 파일 l05~l09 = 6·7·8~9·10·11차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u1_l01~u1_l09 · 빠짐·겹침 0)', () => ok(KEYS.map(k => FK[k]).join() === Object.keys(SRC0).join() && Object.keys(SRC0).length === 9, KEYS.map(k => FK[k]).join()));
T('meta: 4학년 1학기 · unit 1 · unit_title · covers·분 = 원문 차시(intro-meta, l01 단원 도입 = 1) · 성취기준 [4과09-0N] · 학습 목표 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = range(SRC[k].n || '1');
  ok(m.grade === 4 && m.term === 1 && m.unit === 1 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과09-0[123]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('원문 l09(단원 마무리) 머리 주석의 성취기준 [4과09-01][4과09-02][4과09-03] = u1_l11 std · 단원 전체가 셋을 모두 덮음', () => { const note = SRC.u1_l11.notes.join(' '); ['[4과09-01]', '[4과09-02]', '[4과09-03]'].forEach(x => { ok(note.indexOf(x) >= 0, '원문 ' + x); ok(L.u1_l11.meta.std.indexOf(x) >= 0, 'l11 ' + x); ok(KEYS.slice(0, 8).some(k => L[k].meta.std.indexOf(x) >= 0), '앞 차시 ' + x); }); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u4_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '3-2 과학 u4_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_science:u4_l11'), 'from ' + rv.from); }));
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
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (넷 다 쓰임)', () => ok(nMcq >= 9 && nCls >= 8 && nMt >= 5 && nMs >= 2, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
T('원문 문항 자체 확인 — mcq 정답 1 · ms 맞·틀 둘 다 · cls 통마다 물건 1↑ · mt 왼쪽·오른쪽 겹침 0', () => KEYS.forEach(k => SRC[k].problems.forEach(q => { if (q.kind === 'mcq') ok(q.ci >= 0 && q.opts.length >= 3, k + ' ' + q.t); if (q.kind === 'ms') ok(q.chips.some(c => c.hit) && q.chips.some(c => !c.hit), k + ' ' + q.t); if (q.kind === 'cls') q.bins.forEach(b => ok(q.items.some(it => it.bin === b.id), k + ' 빈 통 ' + b.name)); if (q.kind === 'mt') ok(new Set(q.pairs.map(p => p[0])).size === q.pairs.length && new Set(q.pairs.map(p => p[1])).size === q.pairs.length, k + ' 짝 겹침'); })));

console.log('═══ F. 원문 계승 ═══');
const EMO = /[\u{1F000}-\u{1FFFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u20E3]/gu;
const plain = (t) => nb(t).replace(EMO, '').replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 시뮬 ①(예상→관찰)·시뮬 ②(살펴보기)·정리 카드 둘 · 오개념 = 원문 오개념 주석/틀린 보기 · 문항 = 원문 · 정리·자기 평가·다음 = 원문', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && sl.kind !== 'goal', s.id + ' 원문 장 아님'); ok(d.title === nb(sl.title), s.id + ' 제목 ' + d.title);
    if (sl.kind === 'pose') { ok(d.content && d.content.length < 90, s.id + ' 관찰 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach(it => ok(sl.data.items.some(x => x.emoji === it.emoji && plain(x.ans).indexOf(it.kind) >= 0), s.id + ' 카드 아래 줄이 원문 관찰 결과에 없음: ' + it.name + ' / ' + it.kind)); }
    else if (sl.kind === 'feat') { const fe = sl.data.data; const vals = Object.values(fe); ok(d.content === undefined || d.content.length < 90, s.id + ' 살펴보기 말풍선은 교사 한 줄');
      if (d.fig.k === 'ask') { const all = d.fig.yes.concat(d.fig.no).map(x => x.emoji + ' ' + x.name).sort(); ok(JSON.stringify(all) === JSON.stringify(vals.map(f => f.emoji + ' ' + f.name).sort()), s.id + ' 두 갈래 ≠ 원문 살펴보기 전부'); }
      else { ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length === vals.length, s.id + ' 카드 수'); d.fig.items.forEach(it => { const f = vals.find(x => x.name === it.name); ok(f, s.id + ' 원문에 없는 카드 ' + it.name); ok(it.emoji === f.emoji && f.feats.some(x => plain(x) === it.kind), s.id + ' 카드 아래 줄 ≠ 원문 결과 줄 ' + it.name); }); } }
    else { ok(sl.cards, s.id + ' 원문 정리 카드 장 아님'); ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = nb(sl.cards[i].label).split('\n'); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls.slice(1).join(' '), s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드'); }); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  if (ms.src === 'note') { const line = src.notes.find(n => /오개념/.test(n)); ok(line, '원문 오개념 주석 없음'); ok(line.indexOf('"' + m.wrong + '"') >= 0 || line.indexOf('“' + m.wrong + '”') >= 0, '오개념 ≠ 원문 주석 「' + m.wrong + '」'); }
  else { const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음'); ok(!src.notes.some(n => /오개념 직격/.test(n)), '원문 오개념 주석이 있는데 문항에서 세움'); }
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 시뮬 ①(3)·시뮬 ②(4)·정리 카드(5·6) — 아홉 차시 모두 같은 자리 · 원문 장 꼴 pose·feat·카드', () => KEYS.forEach(k => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); ok(SRC[k].slides[3].kind === 'pose' && SRC[k].slides[4].kind === 'feat' && SRC[k].slides[5].cards && SRC[k].slides[6].cards, k + ' 원문 꼴'); }));
T('동기 장 물음 = 원문 예상 장(recall)과 같은 물음 — 원문 예상 장의 핵심 낱말이 동기 물음에 있음', () => KEYS.forEach(k => { const r = plain(SRC[k].slides[2].recall); const q = plain(L[k].slides[2].data.question); const words = (r.match(/[가-힣]{2,}/g) || []).filter(w => w.length >= 3); ok(words.some(w => q.indexOf(w) >= 0), k + ' 동기 물음이 원문 예상과 동떨어짐'); }));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => { ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name); ok((it.kind || '').length <= 40, s.id + ' 카드 아래 줄 너무 김 ' + it.kind); });
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); } })));
T('부품 가짓수 3 (카드·차례·기준 갈래) · chain 6↑ · ask 1↑', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 3 && cnt.chain >= 6 && cnt.ask >= 1, JSON.stringify(cnt)); });

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
/* 학생 화면 = 발문 뺀 데이터 · 표지와 「다음 시간엔」 예고 장은 다음 차시 낱말을 미리 말하는 자리라 제외(원문 next-preview 계승) */
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
/* 「극」은 한 글자라 「자석의 극 · N극 · S극 · 같은/다른 극 · 극끼리 · 극은/이/을/의」 꼴로만 센다(「적극」 같은 낱말 제외) */
const TERM = { '극': /자석의 극|[NS]극|같은 극|다른 극|극끼리|(^|[^가-힣])극[은이을의]/, '나침반': /나침반/, '밀어내': /밀어 ?내|밀려나/, '설계': /설계/, '액체 자석': /액체 자석/, '첨단': /첨단/ };
const FIRST = [['극', 'u1_l04'], ['밀어내', 'u1_l04'], ['나침반', 'u1_l06'], ['설계', 'u1_l08'], ['액체 자석', 'u1_l10'], ['첨단', 'u1_l10']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (!TERM[w0].test(vis(s))) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => TERM[w0].test(vis(s))), '「' + w0 + '」 도입 차시에 안 나옴'); }));
T('「자기장」·「전자석」 학생 화면 0 (지도서 유의점: 자기장 개념 도입 X)', () => KEYS.forEach(k => L[k].slides.forEach(s => ok(!/자기장|전자석|자기화/.test(vis(s)), k + ' ' + s.id))));
T('선행 검사기 자체 확인 — l02 장에 「N극」을 심으면 잡는다 · 「적극」은 안 잡는다', () => { ok(!TERM['극'].test('적극적으로 참여해요'), '적극 오탐'); const s = L.u1_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' N극'; let caught = false; try { KEYS.slice(0, 3).forEach(k => L[k].slides.forEach(x => ok(!TERM['극'].test(vis(x))))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 시뮬·정리 카드·정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides.slice(0, 7)) + JSON.stringify(s.summary); ok(!TERM[w0].test(txt), k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 자석 판정 검산 ═══');
/* 원문 아홉 차시 전체에서 ① 물체 → 붙음/안 붙음 ② 가까이 한 것 → 밀어냄/끌어당김 ③ 나침반 빨간색 부분 → 멀어짐/가까워짐 표를 모아 어긋남 0 + 표 이름 전부 뜻 규칙에 걸림 */
const strip = (t) => plain(t).replace(/\n/g, ' ').trim();
const STICK = { y: '붙음', n: '안 붙음' }, FORCE = { push: '밀어냄', pull: '끌어당김' }, NEEDLE = { away: '멀어짐', near: '가까워짐' };
function gather() { const st = {}, fo = {}, ne = {}; const put = (tab, name, val) => { name = strip(name); if (!tab[name]) tab[name] = new Set(); tab[name].add(val); };
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => {
      if (q.kind === 'cls') { const bn = (id) => strip(q.bins.find(b => b.id === id).name);
        q.items.forEach(it => { const b = bn(it.bin);
          if (/^자석에 (붙어요|붙는 부분)$|^붙어요$/.test(b)) put(st, it.t, STICK.y); if (/^자석에 (안 붙어요|붙지 않아요)$|^안 붙는 부분$/.test(b)) put(st, it.t, STICK.n);
          if (/서로 밀어내요/.test(b)) put(fo, it.t, FORCE.push); if (/서로 끌어당겨요/.test(b) && /가까이/.test(it.t)) put(fo, it.t, FORCE.pull);
          if (/빨간색 부분이 멀어져요/.test(b)) put(ne, it.t, NEEDLE.away); if (/빨간색 부분이 가까워져요/.test(b)) put(ne, it.t, NEEDLE.near); }); }
      if (q.kind === 'ms' && /자석에 붙는 물체를 모두/.test(q.t)) q.chips.forEach(c => put(st, c.t, c.hit ? STICK.y : STICK.n));
      if (q.kind === 'mcq' && /자석에 붙는 물체는 무엇/.test(q.t)) q.opts.forEach((o, i) => put(st, o, i === q.ci ? STICK.y : STICK.n));
      if (q.kind === 'mt') q.pairs.forEach(p => { const r = strip(p[1]); if (/^자석에 붙어요$/.test(r)) put(st, p[0], STICK.y); if (/^자석에 안 붙어요$/.test(r)) put(st, p[0], STICK.n); if (/빨간색 부분이 멀어져요/.test(r)) put(ne, p[0], NEEDLE.away); if (/빨간색 부분이 가까워져요/.test(r)) put(ne, p[0], NEEDLE.near); }); });
    const fe = s.slides[4].data.data; if (k === 'u1_l02') Object.values(fe).forEach(f => put(st, f.name, f.feats.some(x => /안 붙|붙지 않/.test(x)) ? STICK.n : STICK.y)); });
  return { st, fo, ne }; }
const GA = gather();
const noBad = (tab, label) => { const bad = Object.keys(tab).filter(n => tab[n].size > 1); ok(!bad.length, label + ' 어긋남: ' + bad.map(n => n + ':' + [...tab[n]].join('/')).join(' · ')); };
const count = (tab) => { const c = {}; Object.values(tab).forEach(v => { const x = [...v][0]; c[x] = (c[x] || 0) + 1; }); return c; };
const stickRule = (n) => /알루미늄|색종이|종이|고무|나무|플라스틱|유리|손잡이/.test(n) ? STICK.n : /철/.test(n) ? STICK.y : null;
const poles = (t) => (t.match(/[NS]극/g) || []);
const forceRule = (n) => { const p = poles(n); if (p.length === 1 && /끼리/.test(n)) return FORCE.push; if (p.length === 2) return p[0] === p[1] ? FORCE.push : FORCE.pull; if (/클립|철/.test(n)) return FORCE.pull; return null; };
const needleRule = (n) => /N극/.test(n) ? NEEDLE.away : /S극/.test(n) ? NEEDLE.near : null;
T('붙음/안 붙음 표 — 물체 ' + Object.keys(GA.st).length + '개 · 어긋남 0 · 붙음 5↑ · 안 붙음 8↑', () => { noBad(GA.st, '붙음'); const c = count(GA.st); ok(c['붙음'] >= 5 && c['안 붙음'] >= 8, JSON.stringify(c)); });
T('붙음 표 = 뜻 — 철(날·스프링 포함) = 붙음 · 알루미늄·종이·고무·나무·플라스틱·유리·손잡이 = 안 붙음 (표 이름 전부 규칙에 걸림)', () => Object.keys(GA.st).forEach(n => { const v = [...GA.st[n]][0]; const r = stickRule(n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }));
T('밀어냄/끌어당김 표 — ' + Object.keys(GA.fo).length + '개 · 어긋남 0 · 같은 극 = 밀어냄 · 다른 극·철 클립 = 끌어당김', () => { noBad(GA.fo, '힘'); ok(Object.keys(GA.fo).length >= 6, '대상 ' + Object.keys(GA.fo).length); Object.keys(GA.fo).forEach(n => { const v = [...GA.fo[n]][0]; const r = forceRule(n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }); });
T('나침반 표 — ' + Object.keys(GA.ne).length + '개 · 어긋남 0 · N극을 가까이 = 빨간색 부분 멀어짐 · S극 = 가까워짐', () => { noBad(GA.ne, '나침반'); ok(Object.keys(GA.ne).length >= 4, '대상'); Object.keys(GA.ne).forEach(n => { const v = [...GA.ne[n]][0]; const r = needleRule(n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }); });
T('원문 l05 나침반 — 빨간색 부분 = N극 (살펴보기 첫 줄 · 문항 정답) · l04 극은 항상 두 개(문항 정답)', () => { ok(/빨간색 부분은 N극/.test(SRC.u1_l06.slides[4].data.data.red.feats[0]), 'feat'); const q = SRC.u1_l06.problems[0]; ok(/N극/.test(q.opts[q.ci]), 'mcq'); const q2 = SRC.u1_l04.problems[2]; ok(/항상 두 개/.test(q2.opts[q2.ci]), 'l04 두 개'); });
T('케이티처 l02 기준 갈래(자석에 붙나요?) = 붙음 표 · l04 살펴보기 카드(같은 극 → 밀어냄 · 다른 극 → 끌어당김)', () => { const f = L.u1_l02.slides[4].data.fig; f.yes.forEach(x => ok(stickRule(x.name) === STICK.y, '붙어요 ' + x.name)); f.no.forEach(x => ok(stickRule(x.name) === STICK.n, '안 붙어요 ' + x.name));
  L.u1_l04.slides[4].data.fig.items.forEach(it => { const r = forceRule(it.name); if (r === FORCE.push) ok(/밀어내/.test(it.kind), it.name + ' ' + it.kind); if (r === FORCE.pull) ok(/끌어당/.test(it.kind), it.name + ' ' + it.kind); }); });
/* 학생 화면 서술 검산: 문장 단위로 「같은 극 … 끌어당겨」·「다른 극 … 밀어내」·「알루미늄/동전 … 붙어요(부정 없음)」·「빨간색 부분 … S극 … 멀어」를 잡는다 (오개념 장 wrong 칸은 틀린 생각이라 제외) */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|"|·(?=\s)/).map(x => x.trim()).filter(Boolean);
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x => {
  if (/같은 극/.test(x) && /(끌어당|끌려)/.test(x) && !/다른 극/.test(x) && !/(밀어|밀려)/.test(x)) bad.push(x);
  if (/다른 극/.test(x) && /(밀어|밀려)/.test(x) && !/같은 극/.test(x) && !/(끌어당|끌려)/.test(x)) bad.push(x);
  if (/(알루미늄|동전)/.test(x) && /붙어요|붙는다|붙어 /.test(x) && !/(안 붙|붙지 않|않아|아니|철 캔|철 숟가락)/.test(x)) bad.push(x);
  if (/(같은 극|다른 극|알루미늄|동전)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => s.block === 'misconception' ? JSON.stringify(Object.assign({}, s.data, { tnote: undefined, wrong: undefined })) : vis(s);
T('학생 화면의 「같은 극/다른 극 → 힘」·「알루미늄·동전 → 붙음」 서술이 표와 어긋나지 않음 — 전수(오개념 장 틀린 생각 칸 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(JSON.parse(vis2(s) || '""') && Object.values(JSON.parse(vis2(s) || '{}')).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n')); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 6, '검산 대상 ' + n); });
T('검산기 자체 확인 — 「같은 극끼리는 끌어당겨요」「알루미늄 캔은 자석에 붙어요」를 잡고 「같은 극끼리는 밀어내요」「알루미늄은 붙지 않아요」는 지나간다', () => ok(sayCheck('같은 극끼리는 끌어당겨요.').bad.length === 1 && sayCheck('알루미늄 캔은 자석에 붙어요.').bad.length === 1 && !sayCheck('같은 극끼리는 밀어내요.').bad.length && !sayCheck('알루미늄은 붙지 않아요.').bad.length, '검산기'));
T('오개념 장 「틀린 생각」이 표와 반대 — l02·l11 = 모든 금속 붙음 · l03 = 자석만 · l04 = 잘라서 극 나눔 · l06 = 바늘은 철', () => { ok(/모든 금속|금속으로 된 물체는 모두/.test(L.u1_l02.slides[7].data.wrong) && /금속으로 된 물체는 모두/.test(L.u1_l11.slides[7].data.wrong), 'l02·l11'); ok(/자석만/.test(L.u1_l03.slides[7].data.wrong), 'l03'); ok(/반으로 자르면/.test(L.u1_l04.slides[7].data.wrong), 'l04'); ok(/철이다/.test(L.u1_l06.slides[7].data.wrong), 'l06'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_science_u1.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); });

console.log('\n게이트 g4 과학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
