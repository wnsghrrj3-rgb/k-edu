/* gate_g4_science_u4.js — 4학년 1학기 과학 4단원 「다양한 생물과 우리 생활」 케이티처 2세대 게이트 (69차, 베프 — u3 게이트 틀 + u4 원문 꼴(정리 카드 「이름 · 아래 줄」 한 줄 꼴 · 카드 뒤 말풍선)에 맞춘 F + 생물 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(파일 키 ↔ 차시 키 · 차시 = 원문 머리 주석 「N/12차시」 · 성취기준은 원문에 없어 [4과12-0N] 임시) · B 19장 · C 7요소 · D 복습 계보(4-1 과학 u3_l13 → l01 → … → l12)
   E 정답 표시(원문 그대로) · F 원문 계승(차시 고유 시뮬 카드 = 원문 파일의 시뮬 함수 본문·시뮬 장 글 토막(items 없는 pose = sim) · 살펴보기 = 원문 이름·결과 줄 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문(fx-label 「이름 · 아래 줄」 — 첫 「 · 」에서 가름) · 말풍선 = 카드 뒤 bub 원문 · 오개념 = 원문 「오개념」 주석 또는 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문(80분 묶음 60~88) · L 선행 용어(균류·균사·포자·번식 l02 · 원생생물 l04 · 세균 l06 · 적조·발효 l07 · 생명과학·항생제·친환경 가죽·생물 연료 l08) + 지도서 차단 낱말(바이러스·세포·엽록체·광합성·단세포·다세포·미생물·5계) 0
   M 생물 판정(원문 전체 → 무리 표(균류/원생생물/세균) · 영향 무리 표 · 도움/어려움 표 · 맨눈 ○✗ 표 · 땅/물 표 어긋남 0 + 뜻 규칙 · 세균 모양 · l04 기준 갈래 · l09 편지 ○✗ · l12 빈칸 · 학생 화면 서술 검산 + 검산기 자체 확인) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_science_u4.js */
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
const L = load(path.join(TDIR, 'data/g4_science_u4.js'));
const PREV = load(path.join(TDIR, 'data/g4_science_u3.js'));
const SRC0 = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_science_u4.json'), 'utf8'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l06', 'u4_l07', 'u4_l08', 'u4_l09', 'u4_l11', 'u4_l12'];
/* 원문은 파일 키(u4_l01~l09) — 케이티처 키는 차시 번호. meta.src_key 로 잇는다 · 원문 시뮬 ①은 전부 pose 틀이지만 items 표가 없는 차시 고유 시뮬 → sim 으로 본다 */
const kindOf = (sl) => (sl.kind === 'pose' && !(sl.data && sl.data.items)) ? 'sim' : sl.kind;
const FK = {}; KEYS.forEach(k => { FK[k] = L[k] && L[k].meta.src_key; });
const SRC = {}; KEYS.forEach(k => { SRC[k] = SRC0[FK[k]]; });
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '다양한 생물과 우리 생활';
/* 원문 파일 그대로(머리 주석 · 시뮬 함수 본문) */
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasiOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/「다양한 생물과 우리 생활」 (\d+(?:~\d+)?)\/12차시/); return m ? m[1] : ''; };
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/\[(4과12-0\d)(?: [^\]]*)?\]/); return m ? '[' + m[1] + ']' : ''; };
/* 원문 정리 카드 fx-label 은 「이름 · 아래 줄」 한 줄 꼴(원문 화면의 줄바꿈 자리) — 첫 「 · 」에서 가른다(생성기 cardsFig 와 같은 규칙) */
const cardSplit = (label) => { const ls = String(label).replace(/\*\*/g, '').split(' · ').map(norm); return [ls[0], ls.slice(1).join(' · ')]; };

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
const range = (n) => { const p = String(n).split('~').map(Number); return p.length === 2 ? p : [p[0], p[0]]; };

console.log('═══ A. 로드 ═══');
T('9차시 키(묶음 2~3 → l02 · 4~5 → l04 · 9~10 → l09 · 원문 파일 l04~l09 = 6·7·8·9~10·11·12차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u4_l01~u4_l09 · 빠짐·겹침 0)', () => ok(KEYS.map(k => FK[k]).join() === Object.keys(SRC0).join() && Object.keys(SRC0).length === 9, KEYS.map(k => FK[k]).join()));
T('원문 머리 주석 차시 = 1·2~3·4~5·6·7·8·9~10·11·12 (intro-meta 에 차시 없음 → 주석으로 확인)', () => ok(KEYS.map(chasiOf).join() === '1,2~3,4~5,6,7,8,9~10,11,12', KEYS.map(chasiOf).join()));
T('meta: 4학년 1학기 · unit 4 · unit_title · covers·분 = 원문 차시 · 성취기준 [4과12-0N] · 학습 목표 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = range(chasiOf(k));
  ok(m.grade === 4 && m.term === 1 && m.unit === 4 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과12-0[123]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('성취기준 — 원문 주석에 없음(0차시) · 특징 -01 = l01·l02·l04·l06 · 영향 -02 = l07 · 생명과학 -03 = l08·l09·l11 · l12 = 셋 모두 (임시 — 준호 확인)', () => { ok(KEYS.filter(k => stdOf(k)).length === 0, '원문에 성취기준이 생김 — 그 번호로 바꿀 것'); KEYS.forEach(k => { if (stdOf(k)) ok(L[k].meta.std === stdOf(k), k); });
  ok(['u4_l01', 'u4_l02', 'u4_l04', 'u4_l06'].every(k => L[k].meta.std === '[4과12-01]') && L.u4_l07.meta.std === '[4과12-02]' && ['u4_l08', 'u4_l09', 'u4_l11'].every(k => L[k].meta.std === '[4과12-03]'), '차시별'); ['[4과12-01]', '[4과12-02]', '[4과12-03]'].forEach(x => ok(L.u4_l12.meta.std.indexOf(x) >= 0, 'l12 ' + x)); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u3_l13.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-1 과학 u3_l13') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_science:u3_l13'), 'from ' + rv.from); }));
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
const EMO = /[\u{1F000}-\u{1FFFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u20E3]/gu;
const plain = (t) => nb(t).replace(EMO, '').replace(/\s+/g, ' ').trim();
/* 차시 고유 시뮬 원문 = 원문 파일의 그 시뮬 함수 본문(IIFE) + 시뮬 장 글(단계 단추·안내) */
const simRaw = (k, sl) => { const h = ORIG[k]; const i = h.indexOf('(function ' + sl.fn + '()'); ok(sl.fn && i >= 0, k + ' 원문 시뮬 함수 ' + sl.fn); const j = h.indexOf('})();', i); return plain(h.slice(i, j) + '\n' + (sl.simText || '')); };
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 시뮬 ①(차시 고유 시뮬)·시뮬 ②(살펴보기)·정리 카드/목록 장 · 오개념 = 원문 오개념 주석/틀린 보기 · 문항·정리·자기 평가·다음 = 원문', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && sl.kind !== 'goal', s.id + ' 원문 장 아님'); ok(d.title === nb(sl.title), s.id + ' 제목 ' + d.title);
    if (kindOf(sl) === 'pose') { ok(d.content && d.content.length < 90, s.id + ' 관찰 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach((it, i) => ok(sl.data.items[i] && sl.data.items[i].emoji === it.emoji && plain(sl.data.items[i].ans).indexOf(it.kind) >= 0, s.id + ' 카드 아래 줄이 원문 관찰 결과에 없음: ' + it.name + ' / ' + it.kind)); }
    else if (kindOf(sl) === 'sim') { const raw = simRaw(k, sl); ok(d.content && d.content.length < 90, s.id + ' 시뮬 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach(it => { ok(it.kind && raw.indexOf(plain(it.kind)) >= 0, s.id + ' 카드 아래 줄이 원문 시뮬에 없음: ' + it.kind); ok(raw.indexOf(plain(it.name)) >= 0, s.id + ' 카드 이름이 원문 시뮬에 없음: ' + it.name); }); }
    else if (sl.kind === 'feat') { const fe = sl.data.data; const vals = Object.values(fe); ok(d.content === undefined || d.content.length < 90, s.id + ' 살펴보기 말풍선은 교사 한 줄');
      if (d.fig.k === 'ask') { const all = d.fig.yes.concat(d.fig.no).map(x => x.emoji + ' ' + x.name).sort(); ok(JSON.stringify(all) === JSON.stringify(vals.map(f => f.emoji + ' ' + f.name).sort()), s.id + ' 두 갈래 ≠ 원문 살펴보기 전부'); }
      else { ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length === vals.length, s.id + ' 카드 수'); d.fig.items.forEach(it => { const f = vals.find(x => x.name === it.name); ok(f, s.id + ' 원문에 없는 카드 ' + it.name); ok(it.emoji === f.emoji && f.feats.some(x => plain(x) === it.kind), s.id + ' 카드 아래 줄 ≠ 원문 결과 줄 ' + it.name); }); } }
    else if (sl.kind === 'recall') { ok(norm(d.content) === norm(sl.recall), s.id + ' 예상 장 말풍선 ≠ 원문 글'); ok(d.fig.k === 'chain' && d.fig.items.length >= 3, s.id + ' 차례 카드'); const r = plain(sl.recall); d.fig.items.forEach(it => ok(r.indexOf(plain(it.name)) >= 0 && r.indexOf(plain(it.kind)) >= 0, s.id + ' 카드가 원문 글 토막 아님 ' + it.name)); }
    else if (sl.kind === 'list') { ok(d.content && d.content.length < 90, s.id + ' 목록 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' && d.fig.items.length === sl.items.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => ok(it.emoji === sl.items[i].emoji && it.kind === plain(sl.items[i].t), s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 줄')); }
    else { ok(sl.cards, s.id + ' 원문 정리 카드 장 아님'); ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = cardSplit(sl.cards[i].label); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls[1], s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드 ' + it.name); }); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  if (ms.src === 'note') { const line = src.notes.find(n => /^오개념/.test(n)); ok(line, '원문 오개념 주석 없음'); ok(plain(line).indexOf(plain(m.wrong)) >= 0, '오개념 ≠ 원문 주석 「' + m.wrong + '」'); }
  else { const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음'); ok(!src.notes.some(n => /^오개념/.test(n)), '원문 오개념 주석이 있는데 문항에서 세움'); }
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 3·4·5·6 — 3 = 차시 고유 시뮬(전 차시 · items 없는 pose 틀) · 4 = 살펴보기 · 5·6 = 정리 카드(말풍선 있음)', () => KEYS.forEach((k, i) => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : kindOf(s)).join();
  ok(sk === 'sim,feat,cards,cards', k + ' 원문 꼴 ' + sk); ok(SRC[k].slides.slice(3, 7).every(s => !(s.data && s.data.items)), k + ' 원문에 items 표가 생김 — poseFig 로 바꿀 것'); ok(SRC[k].slides.slice(5, 7).every(s => s.text), k + ' 정리 장 말풍선 비어 있음(추출기 bub 읽기 확인)'); }));
T('원문 오개념 주석이 있는 차시(원문 l02~l06 = 키 l02·l04·l06·l07·l08)는 모두 주석에서 · 없는 차시는 틀린 보기에서', () => { KEYS.forEach(k => ok((L[k].slides[7].src === 'note') === SRC[k].notes.some(n => /^오개념/.test(n)), k)); ok(KEYS.filter(k => L[k].slides[7].src === 'note').join() === 'u4_l02,u4_l04,u4_l06,u4_l07,u4_l08', '주석 차시'); });
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
T('발문 분 합 — 40분 차시 30~45 · 80분 묶음 60~88 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : d === 80 ? m >= 60 && m <= 88 : m >= 90 && m <= 130, k + ' ' + m + '분/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
/* 학생 화면 = 발문 뺀 데이터 · 표지와 「다음 시간엔」 예고 장은 다음 차시 낱말을 미리 말하는 자리라 제외(원문 next-preview 계승) */
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
const TERM = { '균류': /균류/, '균사': /균사/, '포자': /포자/, '번식': /번식/, '원생생물': /원생생물/, '세균': /세균/, '적조': /적조/, '발효': /발효/, '생명과학': /생명과학/, '항생제': /항생제/, '친환경 가죽': /친환경 가죽/, '생물 연료': /생물 연료/ };
const FIRST = [['균류', 'u4_l02'], ['균사', 'u4_l02'], ['포자', 'u4_l02'], ['번식', 'u4_l02'], ['원생생물', 'u4_l04'], ['세균', 'u4_l06'], ['적조', 'u4_l07'], ['발효', 'u4_l07'], ['생명과학', 'u4_l08'], ['항생제', 'u4_l08'], ['친환경 가죽', 'u4_l08'], ['생물 연료', 'u4_l08']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (!TERM[w0].test(vis(s))) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => TERM[w0].test(vis(s))), '「' + w0 + '」 도입 차시에 안 나옴'); }));
/* 지도서 차단 낱말(원문 머리 주석 「어휘 차단(전 차시)」): 바이러스·세포·핵·엽록체·광합성·단세포·다세포·미생물·5계 — 「핵」은 한 글자라 「세포핵」 꼴로만(「핵심」 오탐 방지) */
const BAN = /바이러스|세포|엽록체|광합성|단세포|다세포|미생물|5계/;
T('지도서 차단 낱말(바이러스·세포·세포핵·엽록체·광합성·단세포·다세포·미생물·5계) 학생 화면 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { const m = vis(s).match(BAN); ok(!m, k + ' ' + s.id + ' 「' + (m && m[0]) + '」'); })));
T('선행 검사기 자체 확인 — l02 장에 「세균」을 심으면 잡는다 · 「핵심」은 안 잡고 「세포핵」·「미생물」은 잡는다', () => { ok(!BAN.test('핵심 내용') && BAN.test('세포핵') && BAN.test('미생물') && !BAN.test('세균'), '차단 판정'); const s = L.u4_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 세균'; let caught = false; try { KEYS.slice(0, 3).forEach(k => L[k].slides.forEach(x => ok(!TERM['세균'].test(vis(x))))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 예상·시뮬·정리 장과 정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides.slice(2, 7)) + JSON.stringify(s.summary); ok(!TERM[w0].test(txt), k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 생물 판정 검산 ═══');
/* 원문 아홉 차시 전체에서 ① 이름 → 무리(fungi/proto/bac) ② 하는 일 → 영향 무리(fungi/proto/bac) ③ 영향 → 도움/어려움(good/bad) ④ 이름 → 맨눈 ○✗(yes/no) ⑤ 이름 → 땅/물(land/water) 표를 모아 어긋남 0 + 표 이름 전부 뜻 규칙에 걸림 */
const strip = (t) => plain(t).replace(/\n/g, ' ').replace(/^[^가-힣㉠-㉣]+/, '').trim();
const NAMES = { fungi: '균류', proto: '원생생물', bac: '세균', good: '도움', bad: '어려움', yes: '맨눈 ○', no: '맨눈 ✗', land: '땅', water: '물' };
const grpRule = (n) => /균류|버섯|곰팡이|균사|포자/.test(n) ? 'fungi' : /원생생물|해캄|짚신벌레|아메바|나팔벌레|미역|다시마|클로렐라/.test(n) ? 'proto' : /세균|젖산|대장균|헬리코박터|포도상|살모넬라|콜레라/.test(n) ? 'bac' : null;
const effRule = (n) => /기름|김치|요구르트|충치|장염|인공눈|플라스틱|젖산|상하게/.test(n) ? 'bac' : /낙엽|하수|된장|가죽|균사|곰팡이|습진/.test(n) ? 'fungi' : /산소|적조|먹이|연료|클로렐라|해캄/.test(n) ? 'proto' : null;
const goodRule = (n) => /상하게|질병|적조|충치|장염|습진/.test(n) ? 'bad' : /분해|만드는 데|만들|산소|먹이|깨끗/.test(n) ? 'good' : null;
const eyeRule = (n) => /세균|균$|짚신벌레|포자|아메바|나팔벌레/.test(n) ? 'no' : /버섯|미역|곰팡이|해캄/.test(n) ? 'yes' : null;
const placeRule = (n) => /해캄|짚신벌레|미역|아메바|나팔벌레|다시마|원생생물/.test(n) ? 'water' : /버섯|곰팡이/.test(n) ? 'land' : null;
const RULE = { fungi: grpRule, proto: grpRule, bac: grpRule, good: goodRule, bad: goodRule, yes: eyeRule, no: eyeRule, land: placeRule, water: placeRule };
const RULE2 = { fungi: effRule, proto: effRule, bac: effRule };
function gather() { const tab = { grp: {}, eff: {}, gb: {}, eye: {}, place: {} }; const put = (t, name, val) => { name = strip(name); if (!val || !name) return; if (!t[name]) t[name] = new Set(); t[name].add(val); };
  const grpOf = (b) => /균류/.test(b) ? 'fungi' : /원생생물/.test(b) ? 'proto' : /세균/.test(b) ? 'bac' : null;
  const effQ = /영향|이용한 것|이용한 무리|무리별/;
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => {
      if (q.kind === 'cls') { const names = q.bins.map(b => b.name); const g = q.bins.map(b => grpOf(b.name));
        if (/세균이 아니/.test(names.join())) q.items.forEach(it => put(tab.grp, it.t, /아니/.test(q.bins.find(b => b.id === it.bin).name) ? grpRule(it.t) : 'bac'));
        if (g.every(Boolean) && !/세균이 아니/.test(names.join())) { const isEff = effQ.test(q.t) || q.items.some(it => /해요|돼요$/.test(it.t)); q.items.forEach(it => put(isEff ? tab.eff : tab.grp, it.t, g[q.bins.findIndex(b => b.id === it.bin)])); }
        if (/맨눈으로 볼 수/.test(names.join())) q.items.forEach(it => put(tab.eye, it.t, /없어요/.test(q.bins.find(b => b.id === it.bin).name) ? 'no' : 'yes'));
        if (/땅 위/.test(names.join())) q.items.forEach(it => put(tab.place, it.t, /물속/.test(q.bins.find(b => b.id === it.bin).name) ? 'water' : 'land'));
        if (/도움을 주는 영향/.test(names.join())) q.items.forEach(it => put(tab.gb, it.t, /어려움/.test(q.bins.find(b => b.id === it.bin).name) ? 'bad' : 'good')); }
      if (q.kind === 'mt') q.pairs.forEach(p => { const l = strip(p[0]), r = strip(p[1]); const g = grpOf(r); if (/(공|막대|나선) 모양/.test(r)) put(tab.grp, l, 'bac'); if (g && /이용/.test(r)) put(tab.eff, l, g); else if (g && /^(균류|원생생물|세균)/.test(r)) put(tab.eff, l, g); if (/숲속|물속/.test(r)) put(tab.place, l, /물속/.test(r) ? 'water' : 'land'); });
      if (q.kind === 'ms' && /원생생물인 것/.test(q.t)) q.chips.forEach(c => { if (c.hit) put(tab.grp, c.t, 'proto'); else put(tab.grp, c.t, grpRule(c.t)); });
      if (q.kind === 'ms' && /세균이 미치는 영향/.test(q.t)) q.chips.forEach(c => put(tab.eff, c.t, c.hit ? 'bac' : 'proto'));
      if (q.kind === 'ms' && /세균을 이용한 사례/.test(q.t)) q.chips.forEach(c => put(tab.eff, c.t, c.hit ? 'bac' : 'fungi'));
      if (q.kind === 'ms' && /도움을 주는 예/.test(q.t)) q.chips.forEach(c => put(tab.gb, c.t, c.hit ? 'good' : 'bad')); });
    s.slides.forEach(sl => { if (sl.kind === 'feat') Object.values(sl.data.data).forEach(f => { if (/맨눈으로는 (보기 어려워요|보이지 않아요)/.test(f.feats.join())) put(tab.eye, f.name, 'no'); if (/물속에 살아요|물속에 떠|고인 물에 떠/.test(f.feats.join())) put(tab.place, f.name, 'water'); if (/죽은 나무에서 자라요|빵이나 과일에 피어요/.test(f.feats.join())) put(tab.place, f.name, 'land'); });
      if (sl.fn === 'balanceScale') sl.data.steps.forEach((st, i) => put(tab.gb, st.desc.replace(/^[^—]*— /, ''), i % 2 ? 'bad' : 'good')); }); });
  /* l09 정리 카드 도움/어려움 */
  const cd = SRC.u4_l12.slides[6].cards; cd.forEach(c => { const [n, kd] = cardSplit(c.label); if (n === '도움') put(tab.gb, kd, 'good'); if (n === '어려움') put(tab.gb, kd, 'bad'); });
  return tab; }
const GA = gather();
const noBad = (tab, label) => { const bad = Object.keys(tab).filter(n => tab[n].size > 1); ok(!bad.length, label + ' 어긋남: ' + bad.map(n => n + ':' + [...tab[n]].join('/')).join(' · ')); };
const count = (tab) => { const c = {}; Object.values(tab).forEach(v => { const x = [...v][0]; c[x] = (c[x] || 0) + 1; }); return c; };
const checkTab = (name, tab, min, each, nv, rules) => T(name + ' 표 — ' + Object.keys(tab).length + '개 · 어긋남 0 · 갈래 ' + nv + ' 각 ' + each + '↑ · 이름 전부 뜻 규칙에 걸림', () => { noBad(tab, name); ok(Object.keys(tab).length >= min, '대상 ' + Object.keys(tab).length); const c = count(tab); ok(Object.keys(c).length === nv && Object.values(c).every(x => x >= each), JSON.stringify(c));
  Object.keys(tab).forEach(n => { const v = [...tab[n]][0]; const r = (rules || RULE)[v](n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + NAMES[v] + ' ≠ 규칙 ' + NAMES[r]); }); });
checkTab('무리(균류/원생생물/세균)', GA.grp, 11, 2, 3);
checkTab('영향 무리(균류/원생생물/세균)', GA.eff, 22, 5, 3, RULE2);
checkTab('도움/어려움', GA.gb, 12, 5, 2);
checkTab('맨눈 ○✗', GA.eye, 5, 2, 2);
checkTab('땅/물', GA.place, 6, 2, 2);
/* 세균 모양: 원문 l04 shapeCycle 단계(포도상구균 공 · 대장균·살모넬라균 막대 · 콜레라균·헬리코박터 나선) ↔ l04 짝 문항 ↔ 케이티처 l06 시뮬 카드 */
const shapeRule = (t) => /포도상|포도송이|공 모양|공처럼/.test(t) ? '공' : /대장균|살모넬라|막대/.test(t) ? '막대' : /콜레라|헬리코박터|나선|용수철/.test(t) ? '나선' : null;
T('세균 모양 — 원문 단계 4(공·막대·나선·꼬리 달린 나선) ↔ 짝 문항(대장균 막대 · 헬리코박터 나선) ↔ 케이티처 l06 카드 이름·아래 줄이 같은 모양', () => { const st = SRC.u4_l06.slides[3].data.steps; ok(st.length === 4, '단계 수'); const sh = st.map(x => shapeRule(x.desc)); ok(sh.join() === '공,막대,나선,나선', sh.join());
  st.forEach(x => { const m = x.desc.match(/(공|막대|나선) 모양/); ok(m && m[1] === shapeRule(x.desc.replace(/(공|막대|나선) 모양/, '')), '단계 이름 ≠ 예 ' + x.desc.slice(0, 20)); });
  const mt = SRC.u4_l06.problems.find(q => q.kind === 'mt'); mt.pairs.forEach(p => ok(shapeRule(p[0]) === shapeRule(p[1]), '짝 ' + p[0]));
  L.u4_l06.slides[3].data.fig.items.forEach((it, i) => ok(shapeRule(it.name) === sh[i] && (shapeRule(it.kind) || sh[i]) === sh[i], 'l06 카드 ' + it.name)); });
T('케이티처 l04 기준 갈래 「스스로 양분을 만드나요?」 — yes 는 원문 살펴보기에 「스스로 양분」 줄이 있고 no 는 없음 · 전부 물에 삶 / l12 사는 곳 카드 — 균류 습기 · 원생생물 물 · 세균 어디에나', () => { const f = L.u4_l04.slides[4].data.fig; ok(f.k === 'ask', 'l04 ask'); const fe = SRC.u4_l04.slides[4].data.data; const feat = (n) => Object.values(fe).find(x => x.name === n).feats.join();
  f.yes.forEach(x => ok(/스스로 양분/.test(feat(x.name)), 'yes ' + x.name)); f.no.forEach(x => ok(!/스스로 양분/.test(feat(x.name)), 'no ' + x.name)); f.yes.concat(f.no).forEach(x => ok(placeRule(x.name) === 'water' || /물/.test(feat(x.name)), '물 ' + x.name));
  const cd = L.u4_l12.slides[5].data.fig.items; ok(cd.length === 3 && /습기/.test(cd[0].kind) && /물/.test(cd[1].kind) && /어디에나/.test(cd[2].kind) && cd.map(c => grpRule(c.name)).join() === 'fungi,proto,bac', 'l12 사는 곳'); });
T('l09 편지 카드 — ⭕ 카드 이름은 원문 Q 의 옳은 문장 토막 · ❌ 는 틀린 문장 토막 · 아래 줄은 그 문항의 yes 토막 · O 3 · X 2 · 원문 Q 5', () => { const Q = SRC.u4_l09.slides[3].data.Q; const f = L.u4_l09.slides[3].data.fig; let o = 0, x = 0; f.items.forEach(it => { const q = Q.find(q => strip(q.text).indexOf(strip(it.name)) >= 0); ok(q, '원문 문항 없음 ' + it.name); ok(q.ok === (it.emoji === '⭕'), 'O/X 그림 ' + it.name); ok(strip(q.yes).indexOf(strip(it.kind)) >= 0, 'yes 토막 ' + it.kind); if (q.ok) o++; else x++; }); ok(o === 3 && x === 2 && Q.length === 5 && f.items.length === 5, o + '/' + x); });
T('l12 빈칸 카드 — 카드 이름은 원문 Q 의 물음 토막 · 아래 줄 = 정답 보기 그대로 · 여섯 문항 전부 · 정답이 뜻 규칙과 같음(균류·원생생물·세균·적조·생명과학·세균)', () => { const Q = SRC.u4_l12.slides[3].data.Q; const f = L.u4_l12.slides[3].data.fig; ok(Q.length === 6 && f.items.length === 6, '여섯'); f.items.forEach((it, i) => { const q = Q[i]; ok(strip(q.text).indexOf(strip(it.name)) >= 0, '물음 토막 ' + it.name); ok(it.kind === q.opts[q.ans], '정답 ' + it.kind + ' ≠ ' + q.opts[q.ans]); }); ok(Q.map(q => q.opts[q.ans]).join() === '균류,원생생물,세균,적조 현상,생명과학,세균', '정답 차례');
  ok(grpRule(Q[0].text) === 'fungi' && grpRule(Q[1].text) === 'proto' && /작고|모양이 다양/.test(Q[2].text) && grpRule('곰팡이') === 'fungi', '물음 ↔ 무리'); });
/* 학생 화면 서술 검산(문장 단위): 오개념 장 틀린 생각 칸 · 기본 문제의 나눌 것·짝·답(일부러 틀린 보기 포함)은 빼고 본다 — 기본 문제 정답 보기는 따로 넣어 본다 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|·(?=\s)|\s\/\s/).map(x => x.replace(/\\?"/g, '').trim()).filter(Boolean);
const NEG = /않|아니|없|뿐|고쳐|틀|지만|실수|일부|\?|라고 (말|적|여기|생각|하)/;
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x => {
  if (/라고 (말|적|썼)|라는 문장|줄을 적었|틀린 (문장|줄)|두 줄/.test(x)) return; /* 틀린 생각을 인용해 고치게 하는 자리(생각을 넓혀요·오개념 힌트) */
  if (/버섯/.test(x) && /식물(이에요|이다|입니다|이야)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/해캄/.test(x) && /식물(이에요|이다|입니다|이야)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(곰팡이|세균)/.test(x) && /생물이 아니/.test(x) && !/않|틀|실수|\?|고 (여기|생각)|이야기/.test(x)) bad.push(x);
  if (/더러운 곳에만/.test(x) && !/않|아니|실수|\?|라고 (말|여기)/.test(x)) bad.push(x);
  if (/(해롭기만|해로운 것만|나쁘기만|나쁜 것만|모두 나쁘다)/.test(x) && !/않|아니|틀|실수|\?|라고|고치/.test(x)) bad.push(x);
  if (/모든 곰팡이/.test(x) && /(약|치료|물질)/.test(x) && /(얻|만들)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/세균/.test(x) && /적조/.test(x) && /일으/.test(x) && !/원생생물|않|아니|틀|실수/.test(x)) bad.push(x);
  if (/(원생생물|해캄|짚신벌레)[은는이가도]? [^,.]{0,12}균사/.test(x) && !NEG.test(x)) bad.push(x);
  if (/썩/.test(x) && /(부정적|나쁜 일|나쁘)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/어려운 낱말/.test(x) && /많/.test(x) && /좋/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(두 가지뿐|둘뿐)/.test(x) && /(동물|식물)/.test(x) && !/않|아니|틀|실수|\?|라고|고치/.test(x)) bad.push(x);
  if (/건조한 곳/.test(x) && /잘 자/.test(x) && !NEG.test(x)) bad.push(x);
  if (/갑자기 생/.test(x) && /곰팡이/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(초록색이면|초록색이니까)/.test(x) && /식물/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(버섯|해캄|곰팡이|세균|원생생물|더러운 곳|모든 곰팡이|적조|두 가지뿐|건조한 곳|갑자기 생|초록색|썩|어려운 낱말)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; let d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined;
  if (d.fig) d.fig = d.fig.k === 'ask' ? d.fig.q + ' / ' + d.fig.yes.concat(d.fig.no).map(x => x.name).join(' / ') + ' / ' + (d.fig.note || '') : d.fig.items.filter(it => it.emoji !== '❌').map(it => it.name + ' — ' + (it.kind || '')).join(' / '); /* ❌ 카드(l09 편지)는 일부러 틀린 문장 */ if (s.block === 'basic_problem') d = { title: d.title, question: d.question, note: d.note, options: (d.options || []).filter(o => o.correct).map(o => o.text) }; return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n'); };
T('학생 화면의 「버섯·해캄은 식물」·「곰팡이·세균은 생물이 아님」·「더러운 곳에만」·「해롭기만」·「모든 곰팡이에서 약」·「세균이 적조」·「원생생물은 균사」·「두 가지뿐」·「건조한 곳」·「갑자기 생김」 서술이 판정과 어긋나지 않음 — 전수(오개념 장 틀린 생각 칸·틀린 보기·통·짝 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 60, '검산 대상 ' + n); });
T('검산기 자체 확인 — 틀린 문장 열넷을 잡고 바른 문장 열다섯은 지나간다', () => {
  ['버섯은 식물이에요.', '해캄은 초록색이니까 식물이에요.', '곰팡이는 생물이 아니에요.', '세균은 더러운 곳에만 살아요.', '세 무리는 사람에게 해롭기만 해요.', '모든 곰팡이에서 약이 되는 물질을 얻을 수 있어요.', '세균이 바다에서 적조 현상을 일으켜요.', '원생생물은 균사로 이루어져 있어요.', '생물은 동물과 식물, 두 가지뿐이에요.', '곰팡이는 따뜻하고 건조한 곳에서 잘 자라요.', '곰팡이는 갑자기 생겨요.', '해캄은 초록색이면 식물이에요.', '죽은 생물이 썩는 과정은 부정적이에요.', '어려운 낱말을 많이 넣을수록 좋은 자료예요.'].forEach(x => ok(sayCheck(x).bad.length >= 1, '못 잡음 ' + x));
  ['버섯은 식물이 아니에요.', '해캄은 초록색이지만 뿌리·줄기·잎이 없어요.', '세균은 눈에 보이지 않지만 살아 있는 생물이에요.', '세균은 더러운 곳에만 사는 것이 아니에요.', '세균은 해롭기만 하지 않아요.', '약이 되는 물질은 일부 곰팡이에서만 얻어요.', '적조 현상은 일부 원생생물이 일으켜요.', '균사는 균류의 특징이에요.', '동물도 식물도 아닌 생물이 있어요.', '곰팡이는 습기가 많고 따뜻한 곳에서 잘 자라요.', '곰팡이는 갑자기 생기지 않아요.', '초록색이라는 것만으로 식물이라고 할 수 없어요.', '썩지 않으면 죽은 생물과 낙엽이 그대로 쌓여요.', '균사·곰팡이는 균류, 물속 생물은 원생생물이에요.', '어려운 낱말이 많으면 이해하기 어려워요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('오개념 장 「틀린 생각」이 판정과 반대 — 아홉 차시 전부 검산기에 잡힘', () => KEYS.forEach(k => ok(sayCheck(L[k].slides[7].data.wrong).bad.length >= 1, k + ' 「' + L[k].slides[7].data.wrong + '」')));
T('기본 문제 일부러 틀린 보기도 판정과 반대 — 원문 「생물은 동물과 식물, 두 가지뿐이에요」(l01) · 「더러운 곳에만 살아요」(l06) · 「세균이 적조 현상을 일으켜요」(l07) · 「모든 곰팡이에서 이런 약을 얻을 수 있어요」(l12)를 잡음', () => { ok(sayCheck('생물은 동물과 식물, 두 가지뿐이에요').bad.length >= 1, 'l01'); ok(sayCheck('더러운 곳에만 살아요').bad.length >= 1, 'l06'); ok(sayCheck('세균이 적조 현상을 일으켜요').bad.length >= 1, 'l07'); ok(sayCheck('모든 곰팡이에서 이런 약을 얻을 수 있어요').bad.length >= 1, 'l12'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_science_u4.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); });

console.log('\n게이트 g4 과학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
