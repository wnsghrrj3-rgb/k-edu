/* gate_g3s2_science_u2.js — 3학년 2학기 과학 2단원 「지구와 바다」 케이티처 2세대 게이트 (42차, 베프 — u1 게이트 복제 + 2단원 검산: 육지/바다·밀물/썰물·육지의 물/바닷물 판정 표).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다. 과학이라 산수 대신 원문 계승·정답 표시·선행 용어·판정 표를 전수 본다.
   A 로드·meta(묶음 차시 covers·분 = 40 × 차시 수) · B 19장 골격 · C 7요소 · D 복습 계보(2학기 u1_l11 → l01 → … → l11)
   E 정답 표시(mcq = 원문 정답 · ms = 원문 hit 그대로·맞/틀 둘 다 · cls = 통마다 원문 물건 전부 · mt = 원문 짝 전부) · 수준별·출구
   F 원문 계승(개념 = 원문 말풍선 · 시뮬 ① = 원문 관찰·조사 표(카드 = 누른 것·첫 결과 줄) · 시뮬 ② = 원문 기준 안내문 + ask/sort2 두 갈래 = 원문 things · 오개념 = 원문 되짚기 · 문항 = 원문 · 정리 = 원문 정리 줄 · 자기 평가·다음 = 원문)
   G 그림 렌더(개념 4장 = 과학 부품 tools·chain·ask·sort2 · 카드 이름 ** 0) · H 중복 0 · I 실렌더 + 1인 흐름 + 모두 고르기 표시
   J extras 22 · K 발문 6장↑·분 합(40분 30~45 · 80분 60~88) · L 선행 용어(학생 화면: 대기 l02 전 0 · 증발 접시 l04 전 0 · 절벽·동굴 l05 전 0 · 밀물·썰물 l06 전 0 · 염전 l10 전 0 — 표지·다음 차시 예고 장 제외)
   M 지구·바다 판정(원문 전체에서 모습 → 육지/바다 · 모습 → 밀물 때/썰물 때 · 물 → 육지의 물/바닷물 표를 모아 어긋남 0 · l06 기준 갈래 밀물 ⟺ 땅 안 드러남 · l11 옳은 설명 진리표 · 학생 화면 서술 검산 · 검산기 자체 확인)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_science_u2.js */
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
const L = load(path.join(TDIR, 'data/g3s2_science_u2.js'));
const PREV = load(path.join(TDIR, 'data/g3s2_science_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_science_u2.json'), 'utf8'));
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l04', 'u2_l05', 'u2_l06', 'u2_l07', 'u2_l08', 'u2_l10', 'u2_l11'];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '지구와 바다';

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
  ok(m.grade === 3 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과06-0\d\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('원문 파일 성취기준 ⊂ meta.std (원문 머리 주석)', () => KEYS.forEach(k => { const s = SRC[k].std.match(/\[4과06-0\d\]/g) || []; s.forEach(x => ok(L[k].meta.std.indexOf(x) >= 0, k + ' ' + x)); ok(s.length >= 1, k + ' 원문 성취기준 0'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u1_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2학기 u1_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_science:u1_l11'), 'from ' + rv.from); }));
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
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (넷 다 쓰임)', () => ok(nMcq >= 8 && nCls >= 8 && nMt >= 5 && nMs >= 3, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
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
T('부품 가짓수 ≥ 4 (카드·차례·기준 갈래·두 통) · ask 5↑ · sort2 5↑(문장 갈래 l04·l06·l07·l08·l11) · chain 2↑', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 4 && cnt.ask >= 5 && cnt.sort2 >= 5 && cnt.chain >= 2, JSON.stringify(cnt)); });

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
const FIRST = [['대기', 'u2_l02'], ['증발 접시', 'u2_l04'], ['절벽', 'u2_l05'], ['동굴', 'u2_l05'], ['밀물', 'u2_l06'], ['썰물', 'u2_l06'], ['염전', 'u2_l10']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (vis(s).indexOf(w0) < 0) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => vis(s).indexOf(w0) >= 0), '「' + w0 + '」 도입 차시에 안 나옴'); }));
T('선행 검사기 자체 확인 — l04 장에 「밀물」을 심으면 잡는다', () => { const s = L.u2_l04.slides[3]; const keep = s.data.content; s.data.content = keep + ' 밀물'; let caught = false; try { KEYS.slice(0, 5).forEach(k => L[k].slides.forEach(x => ok(vis(x).indexOf('밀물') < 0))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 개념·시뮬·정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides) + JSON.stringify(s.summary); /* 문항 보기·다음 예고는 제외 */ ok(txt.indexOf(w0) < 0, k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 지구·바다 판정 검산 ═══');
/* 원문 열 차시 전체에서 모습 → 육지/바다 · 모습 → 밀물 때/썰물 때 · 물 → 육지의 물/바닷물 표를 모은다: 통 나누기(land/sea · in/out) · 짝(오른쪽이 뜻) · 기준 갈래(l03 land · l06 high/land) */
const PLACE = { land: '육지', sea: '바다' }, TIDE = { in: '밀물', out: '썰물' };
const strip = (t) => nb(t).replace(/^[^\w가-힣]+/, '').replace(/\n/g, ' ');
function gather() { const pl = {}, td = {}, wt = {}; const put = (tab, name, val) => { name = strip(name); if (!tab[name]) tab[name] = new Set(); tab[name].add(val); };
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => { if (q.kind === 'cls') q.items.forEach(it => { const isWater = /물$/.test(strip(it.t)) || /물질|소금|짠맛|강, 호수/.test(it.t); if (PLACE[it.bin]) put(isWater ? wt : pl, it.t, isWater ? (it.bin === 'land' ? '육지의 물' : '바닷물') : PLACE[it.bin]); if (TIDE[it.bin]) put(td, it.t, TIDE[it.bin]); });
      if (q.kind === 'mt') q.pairs.forEach(p => { const r = strip(p[1]); if (r === '물로 덮여 있는 곳') put(pl, p[0], '바다'); if (r === '땅으로 이루어진 곳') put(pl, p[0], '육지'); if (/높이가 높아져요/.test(r)) put(td, p[0], '밀물'); if (/높이가 낮아져요/.test(r)) put(td, p[0], '썰물'); }); });
    s.slides.forEach(sl => { if (sl.kind === 'classify' && sl.things[0].land !== undefined && sl.things[0].high === undefined) sl.things.forEach(t => put(pl, t.n, t.land ? '육지' : '바다'));
      if (sl.kind === 'classify' && sl.things[0].high !== undefined) sl.things.forEach(t => put(td, t.n, t.high ? '밀물' : '썰물')); }); });
  return { pl, td, wt }; }
const G = gather();
T('육지·바다 표 — 모습 ' + Object.keys(G.pl).length + '개 · 어긋남 0 · 육지 6↑ · 바다 2↑', () => { const bad = Object.keys(G.pl).filter(n => G.pl[n].size > 1); ok(!bad.length, bad.map(n => n + ':' + [...G.pl[n]].join('/')).join(' · ')); const c = { 육지: 0, 바다: 0 }; Object.values(G.pl).forEach(v => c[[...v][0]]++); ok(c.육지 >= 6 && c.바다 >= 2, JSON.stringify(c)); });
T('밀물·썰물 표 — 모습 ' + Object.keys(G.td).length + '개 · 어긋남 0 · 밀물 4↑ · 썰물 4↑', () => { const bad = Object.keys(G.td).filter(n => G.td[n].size > 1); ok(!bad.length, bad.map(n => n + ':' + [...G.td[n]].join('/')).join(' · ')); const c = { 밀물: 0, 썰물: 0 }; Object.values(G.td).forEach(v => c[[...v][0]]++); ok(c.밀물 >= 4 && c.썰물 >= 4, JSON.stringify(c)); });
T('육지의 물·바닷물 표 — ' + Object.keys(G.wt).length + '개 · 어긋남 0 · 강·호수·계곡의 물 = 육지의 물 · 소금·짠맛 = 바닷물', () => { const bad = Object.keys(G.wt).filter(n => G.wt[n].size > 1); ok(!bad.length, bad.map(n => n + ':' + [...G.wt[n]].join('/')).join(' · ')); ['강의 물', '호수의 물', '계곡의 물'].forEach(n => ok(G.wt[n] && G.wt[n].has('육지의 물'), n)); ['소금이 남아요', '짠맛이 나요', '바다의 물'].forEach(n => ok(G.wt[n] && G.wt[n].has('바닷물'), n)); });
T('밀물·썰물 표 = 뜻 — 「밀려 들어와요」·「높아져요」·「잠겨요」·「사라져요」·「많이 보여요」 = 밀물 · 「빠져나가요」·「낮아져요」·「드러나요」·「땅이 보여요」 = 썰물', () => Object.keys(G.td).forEach(n => { const v = [...G.td[n]][0]; if (/밀려 들어|높아져요|잠겨요|사라져요|많이 보여요/.test(n)) ok(v === '밀물', n + ' ' + v); if (/빠져나가요|낮아져요|드러나요|땅이 보여요/.test(n)) ok(v === '썰물', n + ' ' + v); }));
T('l06 기준 갈래 진리표 — 밀물 때의 모습 ⟺ 땅이 드러나 보이지 않음 (high === !land · 원문 things 전수)', () => { const sl = SRC.u2_l06.slides[4]; ok(sl.kind === 'classify' && sl.things.length >= 6); sl.things.forEach(t => ok(t.high === !t.land, t.n)); });
T('l03 기준 갈래 진리표 — 육지의 물을 찾을 수 있으면 육지 (water ⇒ land) · 바다만 land 아님', () => { const sl = SRC.u2_l03.slides[4]; sl.things.forEach(t => { if (t.water) ok(t.land, t.n); }); ok(sl.things.filter(t => !t.land).map(t => t.n).join() === '바다'); });
const FALSE11 = ['육지가 바다보다 넓어요', '밀물 때 바닷물의 높이가 낮아져요', '바닷가 지형은 절벽과 동굴만 있어요'];
T('l11 「옳은 설명인가?」 진리표 — 옳지 않은 설명 = 정확히 셋(육지가 넓다·밀물 때 낮아짐·절벽과 동굴만) · 나머지 옳음', () => { const sl = SRC.u2_l11.slides[4]; ok(sl.crits[0].id === 'ok'); sl.things.forEach(t => ok(t.ok === (FALSE11.indexOf(t.n) < 0), t.n)); ok(sl.things.filter(t => !t.ok).length === 3); });
T('l08 「무인도 탈출」 옳은 설명 통 = 단원 정리 줄과 일치 (육지가 넓다·절벽과 동굴뿐 = x)', () => { const q = SRC.u2_l08.problems[5]; ok(q.kind === 'cls'); q.items.forEach(it => ok(it.bin === (/육지가 바다보다 넓어요|절벽과 동굴뿐/.test(it.t) ? 'x' : 'o'), it.t)); });
const SAY = /([가-힣 ]{1,14}?)(?:은|는|이|가|때는|때에는) (육지|바다|밀물|썰물|육지의 물|바닷물)(?:예요|이에요|다| 때예요|이야|에요)/g;
const sayCheck = (t) => { let m, n = 0; const bad = []; const re = new RegExp(SAY.source, 'g'); while ((m = re.exec(t))) { const nm0 = strip(m[1]).trim(); const tab = TIDE[m[2]] || m[2] === '밀물' || m[2] === '썰물' ? G.td : (/물$/.test(m[2]) && m[2].length > 2 ? G.wt : G.pl); const key = Object.keys(tab).find(x => nm0.endsWith(x) || x.endsWith(nm0)); if (!key) continue; n++; if (!tab[key].has(m[2])) bad.push(m[0]); } return { n, bad }; };
T('학생 화면의 육지·바다·밀물·썰물 서술이 표와 어긋나지 않음 — 「X는 육지/바다」·「X는 밀물/썰물」 꼴 전수', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(nb(vis(s))); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」 ≠ 표'); })); ok(n >= 2, '검산 대상 ' + n); });
T('검산기 자체 확인 — 「사막은 바다」「강은 바다」「표지판이 물에 잠겨요는 썰물」을 잡고 「사막은 육지」「강은 육지」「표지판이 물에 잠겨요는 밀물」은 지나간다', () => ok(sayCheck('사막은 바다예요').bad.length === 1 && sayCheck('강은 바다예요').bad.length === 1 && sayCheck('표지판이 물에 잠겨요는 썰물이에요').bad.length === 1 && !sayCheck('사막은 육지예요').bad.length && !sayCheck('강은 육지예요').bad.length && !sayCheck('표지판이 물에 잠겨요는 밀물이에요').bad.length && sayCheck('사막은 육지예요').n === 1, '검산기'));

console.log('\n게이트 g3s2 과학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
