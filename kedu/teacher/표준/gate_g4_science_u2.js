/* gate_g4_science_u2.js — 4학년 1학기 과학 2단원 「물의 상태 변화」 케이티처 2세대 게이트 (67차, 베프 — u1 게이트 틀 + u2 원문 꼴(차시 고유 시뮬·예상 장·목록 장)에 맞춘 F + 상태 변화 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(파일 키 ↔ 차시 키 · 차시 = 원문 머리 주석 「N/11차시」 · 성취기준 = 원문 주석) · B 19장 · C 7요소 · D 복습 계보(4-1 과학 u1_l11 → l01 → … → l11)
   E 정답 표시(원문 그대로) · F 원문 계승(예상→관찰 카드 = 원문 관찰 결과 토막 · 차시 고유 시뮬 카드 = 원문 파일의 시뮬 함수 본문·시뮬 장 글 토막 · 살펴보기 = 원문 이름·결과 줄 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문 · 예상 장 = 원문 글 그대로 + 카드 토막 · 목록 장 = 원문 줄 그대로 · 오개념 = 원문 「오개념 직격」 주석 또는 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문 · L 선행 용어(수증기·상태 변화 l02 · 부피 l04 · 증발·끓음 l06 · 응결 l07 · 장치 l08 · 세계 물의 날 l10) + 지도서 차단 낱말 0
   M 상태 변화 판정(원문 전체 장면 → 방향 표 어긋남 0 + 뜻 규칙 · 부피 늘어남/줄어듦 표 · 학생 화면 서술 검산(무게 · 새어 나옴 · 사라짐 · 증발 물속) + 검산기 자체 확인) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_science_u2.js */
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
const L = load(path.join(TDIR, 'data/g4_science_u2.js'));
const PREV = load(path.join(TDIR, 'data/g4_science_u1.js'));
const SRC0 = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_science_u2.json'), 'utf8'));
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l04', 'u2_l06', 'u2_l07', 'u2_l08', 'u2_l10', 'u2_l11'];
/* 원문은 파일 키(u2_l01~l09) — 케이티처 키는 차시 번호. meta.src_key 로 잇는다 */
const FK = {}; KEYS.forEach(k => { FK[k] = L[k] && L[k].meta.src_key; });
const SRC = {}; KEYS.forEach(k => { SRC[k] = SRC0[FK[k]]; });
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '물의 상태 변화';
/* 원문 파일 그대로(머리 주석 · 시뮬 함수 본문) */
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasiOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/「물의 상태 변화」 (\d+(?:~\d+)?)(?:\/11)?차시/); return m ? m[1] : ''; };
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/성취기준 (\[4과10-0\d\])/); return m ? m[1] : ''; };

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
T('원문 파일 키 = 차례 그대로(u2_l01~u2_l09 · 빠짐·겹침 0)', () => ok(KEYS.map(k => FK[k]).join() === Object.keys(SRC0).join() && Object.keys(SRC0).length === 9, KEYS.map(k => FK[k]).join()));
T('원문 머리 주석 차시 = 1·2·3·4~5·6·7·8~9·10·11 (intro-meta 에 차시가 없어 주석으로 확인)', () => ok(KEYS.map(chasiOf).join() === '1,2,3,4~5,6,7,8~9,10,11', KEYS.map(chasiOf).join()));
T('meta: 4학년 1학기 · unit 2 · unit_title · covers·분 = 원문 차시 · 성취기준 [4과10-0N] · 학습 목표 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = range(chasiOf(k));
  ok(m.grade === 4 && m.term === 1 && m.unit === 2 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과10-0[123]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('원문 주석에 성취기준이 있는 차시(l02~l07 원문)는 그 번호 그대로 · l11 = 셋 모두 · 단원 전체가 [4과10-01·02·03] 을 덮음', () => { let n = 0; KEYS.forEach(k => { const s = stdOf(k); if (s) { n++; ok(L[k].meta.std === s, k + ' ' + L[k].meta.std + ' ≠ 원문 ' + s); } }); ok(n >= 6, '원문 성취기준 차시 ' + n);
  ['[4과10-01]', '[4과10-02]', '[4과10-03]'].forEach(x => { ok(KEYS.some(k => stdOf(k) === x), '원문 ' + x); ok(L.u2_l11.meta.std.indexOf(x) >= 0, 'l11 ' + x); ok(KEYS.slice(0, 8).some(k => L[k].meta.std.indexOf(x) >= 0), '앞 차시 ' + x); }); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u1_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-1 과학 u1_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_science:u1_l11'), 'from ' + rv.from); }));
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
/* 차시 고유 시뮬 원문 = 원문 파일의 그 시뮬 함수 본문(IIFE) + 시뮬 장 글(단계 단추·안내) */
const simRaw = (k, sl) => { const h = ORIG[k]; const i = h.indexOf('(function ' + sl.fn + '()'); ok(sl.fn && i >= 0, k + ' 원문 시뮬 함수 ' + sl.fn); const j = h.indexOf('})();', i); return plain(h.slice(i, j) + '\n' + (sl.simText || '')); };
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 시뮬 ①(예상→관찰 또는 차시 고유 시뮬)·시뮬 ②(살펴보기)·정리 카드/예상 장/목록 장 · 오개념 = 원문 오개념 주석/틀린 보기 · 문항·정리·자기 평가·다음 = 원문', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && sl.kind !== 'goal', s.id + ' 원문 장 아님'); ok(d.title === nb(sl.title), s.id + ' 제목 ' + d.title);
    if (sl.kind === 'pose') { ok(d.content && d.content.length < 90, s.id + ' 관찰 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach((it, i) => ok(sl.data.items[i] && sl.data.items[i].emoji === it.emoji && plain(sl.data.items[i].ans).indexOf(it.kind) >= 0, s.id + ' 카드 아래 줄이 원문 관찰 결과에 없음: ' + it.name + ' / ' + it.kind)); }
    else if (sl.kind === 'sim') { const raw = simRaw(k, sl); ok(d.content && d.content.length < 90, s.id + ' 시뮬 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach(it => { ok(it.kind && raw.indexOf(plain(it.kind)) >= 0, s.id + ' 카드 아래 줄이 원문 시뮬에 없음: ' + it.kind); ok(raw.indexOf(plain(it.name)) >= 0, s.id + ' 카드 이름이 원문 시뮬에 없음: ' + it.name); }); }
    else if (sl.kind === 'feat') { const fe = sl.data.data; const vals = Object.values(fe); ok(d.content === undefined || d.content.length < 90, s.id + ' 살펴보기 말풍선은 교사 한 줄');
      if (d.fig.k === 'ask') { const all = d.fig.yes.concat(d.fig.no).map(x => x.emoji + ' ' + x.name).sort(); ok(JSON.stringify(all) === JSON.stringify(vals.map(f => f.emoji + ' ' + f.name).sort()), s.id + ' 두 갈래 ≠ 원문 살펴보기 전부'); }
      else { ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length === vals.length, s.id + ' 카드 수'); d.fig.items.forEach(it => { const f = vals.find(x => x.name === it.name); ok(f, s.id + ' 원문에 없는 카드 ' + it.name); ok(it.emoji === f.emoji && f.feats.some(x => plain(x) === it.kind), s.id + ' 카드 아래 줄 ≠ 원문 결과 줄 ' + it.name); }); } }
    else if (sl.kind === 'recall') { ok(norm(d.content) === norm(sl.recall), s.id + ' 예상 장 말풍선 ≠ 원문 글'); ok(d.fig.k === 'chain' && d.fig.items.length >= 3, s.id + ' 차례 카드'); const r = plain(sl.recall); d.fig.items.forEach(it => ok(r.indexOf(plain(it.name)) >= 0 && r.indexOf(plain(it.kind)) >= 0, s.id + ' 카드가 원문 글 토막 아님 ' + it.name)); }
    else if (sl.kind === 'list') { ok(d.content && d.content.length < 90, s.id + ' 목록 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' && d.fig.items.length === sl.items.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => ok(it.emoji === sl.items[i].emoji && it.kind === plain(sl.items[i].t), s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 줄')); }
    else { ok(sl.cards, s.id + ' 원문 정리 카드 장 아님'); ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = String(sl.cards[i].label).replace(/\*\*/g, '').split('\n').map(norm); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls.slice(1).join(' '), s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드'); }); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  if (ms.src === 'note') { const line = src.notes.find(n => /오개념 직격/.test(n)); ok(line, '원문 오개념 주석 없음'); ok(plain(line).indexOf(plain(m.wrong)) >= 0, '오개념 ≠ 원문 주석 「' + m.wrong + '」'); }
  else { const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음'); ok(!src.notes.some(n => /오개념 직격/.test(n)), '원문 오개념 주석이 있는데 문항에서 세움'); }
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 3·4·5·6 — 3 = 예상→관찰(l01~l03)/차시 고유 시뮬(l04~l11) · 4 = 살펴보기 · 5 = 정리 카드 · 6 = 정리 카드/예상 장(l03)/목록 장(l10·l11)', () => KEYS.forEach((k, i) => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : s.kind).join();
  ok(sk === (i < 3 ? 'pose' : 'sim') + ',feat,cards,' + (k === 'u2_l03' ? 'recall' : (k === 'u2_l10' || k === 'u2_l11') ? 'list' : 'cards'), k + ' 원문 꼴 ' + sk); }));
T('원문 오개념 주석이 있는 차시(l02·l04·l06·l07·l08)는 모두 주석에서 · 없는 차시는 틀린 보기에서', () => KEYS.forEach(k => ok((L[k].slides[7].src === 'note') === SRC[k].notes.some(n => /오개념 직격/.test(n)), k)));
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
  if (s.block === 'basic_problem' && s.data.multi) { ok(/multi-hint|pv3-multi/.test(r.body), s.id + ' 모두 고르기 안내'); ok((r.body.match(/class="mk">☐|class="mk">☑/g) || []).length === s.data.options.length, s.id + ' 체크 칸'); if (rev) ok((r.body.match(/opt ok/g) || []).length === s.data.options.filter(o => o.correct).length, s.id + ' 열림 정답 수'); }
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
const TERM = { '수증기': /수증기/, '상태 변화': /상태 ?변화/, '부피': /부피/, '증발': /증발/, '끓음': /끓음/, '응결': /응결/, '장치': /장치/, '세계 물의 날': /세계 물의 날/ };
const FIRST = [['수증기', 'u2_l02'], ['상태 변화', 'u2_l02'], ['부피', 'u2_l04'], ['증발', 'u2_l06'], ['끓음', 'u2_l06'], ['응결', 'u2_l07'], ['장치', 'u2_l08'], ['세계 물의 날', 'u2_l10']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (!TERM[w0].test(vis(s))) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => TERM[w0].test(vis(s))), '「' + w0 + '」 도입 차시에 안 나옴'); }));
/* 지도서 차단 낱말: 승화(l02 유의점) · 기화·액화·이슬점·포화·분자·질량·김·증산·안개·구름(원문 어휘 게이트) — 「김」은 한 글자라 낱말 꼴로만 */
const BAN = /승화|기화|액화|이슬점|포화|분자|질량|증산|안개|구름|(^|[^가-힣])김([^가-힣]|[이을은의]|$)/;
T('지도서 차단 낱말(승화·기화·액화·이슬점·포화·분자·질량·김·증산·안개·구름) 학생 화면 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { const m = vis(s).match(BAN); ok(!m, k + ' ' + s.id + ' 「' + (m && m[0]) + '」'); })));
T('선행 검사기 자체 확인 — l02 장에 「증발」을 심으면 잡는다 · 「김치」는 「김」으로 안 잡고 「김이 나요」는 잡는다', () => { ok(!BAN.test('김치를 먹어요') && BAN.test('하얀 김이 나요') && BAN.test('"김"'), '김 판정'); const s = L.u2_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 증발'; let caught = false; try { KEYS.slice(0, 4).forEach(k => L[k].slides.forEach(x => ok(!TERM['증발'].test(vis(x))))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 예상·시뮬·정리 장과 정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides.slice(2, 7)) + JSON.stringify(s.summary); ok(!TERM[w0].test(txt), k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 상태 변화 판정 검산 ═══');
/* 원문 아홉 차시 전체에서 ① 장면 → 상태 변화 방향(고체→액체 s2l · 액체→고체 l2s · 액체→기체 l2g · 기체→액체 g2l) ② 장면 → 부피 늘어남/줄어듦 표를 모아 어긋남 0 + 표 이름 전부 뜻 규칙에 걸림 */
const strip = (t) => plain(t).replace(/\n/g, ' ').trim();
const DIRS = { s2l: '고체→액체', l2s: '액체→고체', l2g: '액체→기체', g2l: '기체→액체' };
/* 원문 글(통 이름 · 짝 오른쪽 · 살펴보기 kind · 관찰 결과)에서 방향 읽기 */
const dirOfLabel = (t) => { t = strip(t); if (/고체에서 액체로|고체 ?→ ?액체|고체 액체$|고체인 얼음 ?(→ )?액체인 물/.test(t)) return 's2l'; if (/액체에서 고체로|액체 ?→ ?고체|액체인 물 ?(→ )?고체인 얼음|액체 고체$/.test(t)) return 'l2s';
  if (/액체에서 기체로|액체 ?→ ?기체|물이 수증기로|액체인 물 ?(→ )?기체인 수증기|^증발$|액체 기체$/.test(t)) return 'l2g'; if (/기체에서 액체로|기체 ?→ ?액체|수증기가 물로|기체인 수증기 ?(→ )?액체인 물|^응결$|기체 액체$/.test(t)) return 'g2l'; return null; };
/* 뜻 규칙: 장면 글만 보고 방향을 정한다(녹 → 고체→액체 · 맺힘·이슬·흐려짐·물방울·수증기가 물로 → 기체→액체 · 얾 → 액체→고체 · 마름·줄어듦·수증기가 됨·다림질·소금·온천 → 액체→기체) */
const dirRule = (n) => /녹/.test(n) ? 's2l' : /맺|이슬|흐려|물방울|수증기가 (다시 )?물/.test(n) ? 'g2l' : /얼어|얼려|얼리|얼어요|어는/.test(n) ? 'l2s' : /말라|말려|말리|마르|줄어|수증기로|수증기가 되|다림질|소금|온천/.test(n) ? 'l2g' : null;
const UP = '늘어남', DOWN = '줄어듦';
const volRule = (n) => /녹/.test(n) ? DOWN : /얼|부풀|깨졌|튀어나|터지|쪼개/.test(n) ? UP : null;
const DESC = {};
function gather() { const dir = {}, vol = {}; const put = (tab, name, val) => { name = strip(name).replace(/^[^가-힣]+/, ''); if (!val) return; if (!tab[name]) tab[name] = new Set(); tab[name].add(val); };
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => {
      if (q.kind === 'cls') q.items.forEach(it => { const b = q.bins.find(x => x.id === it.bin).name; const d = dirOfLabel(b); if (d) put(dir, it.t, d); if (/부피가 늘어나요/.test(b)) put(vol, it.t, UP); if (/부피가 줄어들어요/.test(b)) put(vol, it.t, DOWN); });
      if (q.kind === 'mt') q.pairs.forEach(p => { const d = dirOfLabel(p[1].replace(/^[^가-힣]+/, '')); if (d && !/^(증발|응결)$/.test(strip(p[0]))) put(dir, p[0], d); if (/부피가 늘어나요/.test(p[1])) put(vol, p[0], UP); if (/부피가 줄어들어요/.test(p[1])) put(vol, p[0], DOWN); });
      if (q.kind === 'ms' && /물이 수증기로 변하는 예|증발에 해당/.test(q.t)) q.chips.forEach(c => { if (c.hit) put(dir, c.t, 'l2g'); });
      if (q.kind === 'ms' && /응결하는 예/.test(q.t)) q.chips.forEach(c => { if (c.hit) put(dir, c.t, 'g2l'); });
      if (q.kind === 'ms' && /부피가 늘어나는 예/.test(q.t)) q.chips.forEach(c => put(vol, c.t, c.hit ? UP : DOWN)); });
    s.slides.forEach(sl => { if (sl.kind === 'feat') Object.values(sl.data.data).forEach(f => { DESC[strip(f.name)] = strip(f.name + ' ' + f.feats.join(' ')); const d = f.kind && dirOfLabel(f.kind.replace(/[^가-힣 →]/g, ' ').replace(/\s+/g, ' ').trim()); if (d) put(dir, f.name, d); if (/부피가 늘어나요/.test(f.kind || '')) put(vol, f.name, UP); if (/부피가 줄어들어요/.test(f.kind || '')) put(vol, f.name, DOWN); });
      if (sl.kind === 'pose' && k === 'u2_l03') sl.data.items.forEach(it => put(dir, it.desc, dirOfLabel(it.ans.replace(/[^가-힣 ]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').slice(-2).join(' ')))); }); });
  return { dir, vol }; }
const GA = gather();
const noBad = (tab, label) => { const bad = Object.keys(tab).filter(n => tab[n].size > 1); ok(!bad.length, label + ' 어긋남: ' + bad.map(n => n + ':' + [...tab[n]].join('/')).join(' · ')); };
const count = (tab) => { const c = {}; Object.values(tab).forEach(v => { const x = [...v][0]; c[x] = (c[x] || 0) + 1; }); return c; };
T('방향 표 — 장면 ' + Object.keys(GA.dir).length + '개 · 어긋남 0 · 네 방향 모두 3↑', () => { noBad(GA.dir, '방향'); const c = count(GA.dir); Object.keys(DIRS).forEach(d => ok((c[d] || 0) >= 3, DIRS[d] + ' ' + (c[d] || 0))); });
T('방향 표 = 뜻 — 녹음 = 고체→액체 · 맺힘·이슬·흐려짐·수증기가 물로 = 기체→액체 · 얾 = 액체→고체 · 마름·줄어듦·수증기가 됨 = 액체→기체 (표 이름 전부 규칙에 걸림 · 살펴보기 장면은 원문 결과 줄까지 읽음)', () => Object.keys(GA.dir).forEach(n => { const v = [...GA.dir[n]][0]; const r = dirRule(DESC[n] || n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + DIRS[v] + ' ≠ 규칙 ' + DIRS[r]); }));
T('부피 표 — ' + Object.keys(GA.vol).length + '개 · 어긋남 0 · 얾 = 늘어남 · 녹음 = 줄어듦', () => { noBad(GA.vol, '부피'); ok(Object.keys(GA.vol).length >= 8, '대상 ' + Object.keys(GA.vol).length); Object.keys(GA.vol).forEach(n => { const v = [...GA.vol[n]][0]; const r = volRule(DESC[n] || n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + v); }); });
T('원문 l04 시험관 — 얼기 전·언 후·녹은 후 무게 같은 수(31.8 g) · 언 후 높이 > 처음 = 녹은 후 / 문항: 무게는 변하지 않아요 정답', () => { const h = ORIG.u2_l04; const hs = [...h.matchAll(/name: '([①②③][^']*)', h: (\w+)/g)].map(m => [m[1], m[2]]); ok(hs.length === 3, '단계 ' + hs.length); const base = +(h.match(/BASE_H = (\d+)/) || [])[1]; const val = (x) => x === 'BASE_H' ? base : +x; ok(val(hs[1][1]) > val(hs[0][1]) && val(hs[0][1]) === val(hs[2][1]), '높이 ' + JSON.stringify(hs)); ok(/저울은 언제나 31\.8 g/.test(h), '무게 줄'); const q = SRC.u2_l04.problems[2]; ok(/무게는 변하지 않아요/.test(q.opts[q.ci]), '문항'); });
T('원문 l06 대조 실험 — 물방울 맺힌 단계만 저울 숫자가 늘고(423.1 → 425.1 → 423.1 g) 닦은 휴지 단계에서 처음으로 돌아옴', () => { const st = SRC.u2_l07.slides[3].data.STEP; ok(st.length === 3 && st[0].drops === 0 && st[1].drops > 0 && st[2].drops === 0, '물방울'); const w = st.map(x => parseFloat(x.wR)); ok(w[1] > w[0] && w[2] === w[0], '무게 ' + w.join('/')); });
T('케이티처 기준 갈래 — l04 「부피가 늘어나나요?」 yes = 부피 표 늘어남 · no = 줄어듦 / l06 「물을 끓이나요?」 yes = 원문 kind 끓음 · no = 증발', () => { const f = L.u2_l04.slides[4].data.fig; f.yes.forEach(x => ok([...GA.vol[x.name] || []][0] === UP, '늘어나요 ' + x.name)); f.no.forEach(x => ok([...GA.vol[x.name] || []][0] === DOWN, '줄어들어요 ' + x.name));
  const g = L.u2_l06.slides[4].data.fig; const fe = Object.values(SRC.u2_l06.slides[4].data.data); g.yes.forEach(x => ok(/끓음/.test(fe.find(f => f.name === x.name).kind), '끓음 ' + x.name)); g.no.forEach(x => ok(/증발/.test(fe.find(f => f.name === x.name).kind), '증발 ' + x.name)); });
/* 학생 화면 서술 검산(문장 단위): ① 얾·녹음 + 무게가 늘/줄/무거워/가벼워 (부정 없음) ② 「새어」(부정 없음) ③ 수증기 + 사라/없어 (부정 없음) ④ 증발 + 물속 (끓음·부정 없음)
   오개념 장 틀린 생각 칸 · 기본 문제의 보기(일부러 틀린 보기 포함)는 빼고 본다 — 기본 문제 정답 보기는 따로 넣어 본다 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|"|·(?=\s)/).map(x => x.trim()).filter(Boolean);
const NEG = /않|아니|아닌|없었|그대로|같아|같은|변하지|뿐/;
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x => {
  if (/(얼|녹)/.test(x) && /무게/.test(x) && /(늘어|줄어|무거워|가벼워|증가)/.test(x) && !NEG.test(x.replace(/부피[^,.]*?(늘어|줄어)[가-힣]*/g, ''))) bad.push(x);
  if (/새어/.test(x) && !/(아니|아닌|않)/.test(x)) bad.push(x);
  if (/수증기/.test(x) && /(사라|없어)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/증발/.test(x) && /물속/.test(x) && !/(끓음|아니|아닌|않)/.test(x)) bad.push(x);
  if (/(무게|새어|사라|없어|물속)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; const d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined; if (s.block === 'basic_problem' && d.options) d.options = d.options.filter(o => o.correct).map(o => o.text); return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n'); };
T('학생 화면의 「얼고 녹을 때 무게」·「새어 나옴」·「수증기 = 사라짐」·「증발 = 물속」 서술이 판정과 어긋나지 않음 — 전수(오개념 장 틀린 생각 칸·틀린 보기 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 10, '검산 대상 ' + n); });
T('검산기 자체 확인 — 「물이 얼면 무게도 늘어나요」「물방울은 비커에서 새어 나왔어요」「수증기가 되면 사라져요」「증발은 물속에서 일어나요」를 잡고, 「부피는 늘어나지만 무게는 그대로예요」「새어 나온 것이 아니에요」「보이지 않을 뿐 사라진 게 아니에요」는 지나간다', () => {
  ['물이 얼면 무게도 늘어나요.', '물방울은 비커에서 새어 나왔어요.', '수증기가 되면 사라져요.', '증발은 물속에서 일어나요.'].forEach(x => ok(sayCheck(x).bad.length === 1, '못 잡음 ' + x));
  ['물이 얼면 부피는 늘어나지만 무게는 그대로예요.', '비커에서 새어 나온 것이 아니에요.', '보이지 않을 뿐 사라진 게 아니에요.', '끓음은 물속에서도 일어나요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('기본 문제 일부러 틀린 보기는 실제로 판정과 반대 — 검산기가 원문 틀린 보기 「(얼 때) 무게도 늘어나요」(l04) · 「비커 안의 주스가 새어 나왔어요」(l07) · 「아주 사라져 없어져요」(l06)를 잡음', () => { ok(sayCheck('물이 얼 때 무게도 늘어나요').bad.length === 1, 'l04'); ok(sayCheck('비커 안의 주스가 새어 나왔어요').bad.length === 1, 'l07'); ok(sayCheck('물이 수증기로 변하면 아주 사라져 없어져요').bad.length === 1, 'l06'); });
T('오개념 장 「틀린 생각」이 판정과 반대 — l02·l06 = 수증기 사라짐 · l04 = 얼면 무게 증가 · l07 = 바깥면 물방울 새어 나옴 · l11 = 수증기 → 물을 증발이라 함', () => { ok(sayCheck(L.u2_l02.slides[7].data.wrong).bad.length && sayCheck(L.u2_l06.slides[7].data.wrong).bad.length, 'l02·l06'); ok(sayCheck(L.u2_l04.slides[7].data.wrong).bad.length, 'l04'); ok(sayCheck(L.u2_l07.slides[7].data.wrong).bad.length, 'l07'); ok(/수증기가 물로/.test(L.u2_l11.slides[7].data.wrong) && /증발/.test(L.u2_l11.slides[7].data.wrong), 'l11'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로 — 「응결로」는 과학 낱말이라 제외) 0 — 데이터 전체', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_science_u2.js'), 'utf8'); ['박음', '빵꾸', '갈아엎'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); ok(!/(^|[^응])결로/.test(t), '결로'); });

console.log('\n게이트 g4 과학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
