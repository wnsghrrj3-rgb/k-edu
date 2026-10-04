/* gate_g4_science_u3.js — 4학년 1학기 과학 3단원 「땅의 변화」 케이티처 2세대 게이트 (68차, 베프 — u2 게이트 틀 + u3 원문 꼴(전 차시 고유 시뮬 · 목록 장)에 맞춘 F + 땅의 변화 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(파일 키 ↔ 차시 키 · 차시 = 원문 머리 주석 「땅의 변화」 N차시 / 3단원 N/13차시 · 성취기준 = 원문 주석) · B 19장 · C 7요소 · D 복습 계보(4-1 과학 u2_l11 → l01 → … → l13)
   E 정답 표시(원문 그대로) · F 원문 계승(차시 고유 시뮬 카드 = 원문 파일의 시뮬 함수 본문·시뮬 장 글 토막(items 없는 pose = sim) · 살펴보기 = 원문 이름·결과 줄 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문 · 목록 장 = 원문 줄 그대로 · 오개념 = 원문 「오개념 직격」 주석 또는 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문(120분 묶음 90~130) · L 선행 용어(침식·운반·퇴적 l02 · 상류·하류 l03 · 마그마·용암·분화구·화산 분출물 l04 · 현무암·화강암·화성암 l06 · 지진 l08 · 재난 l10) + 지도서 차단 낱말 0
   M 땅의 변화 판정(원문 전체 → 침식/퇴적 활발 표 · 상류/하류 표 · 현무암/화강암 표 · 피해/이로움 표 · 대처 행동 ○✗ 표 어긋남 0 + 뜻 규칙 · l03 기준 갈래 · l09 징검다리 OX · 학생 화면 서술 검산 + 검산기 자체 확인) · N 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_science_u3.js */
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
const L = load(path.join(TDIR, 'data/g4_science_u3.js'));
const PREV = load(path.join(TDIR, 'data/g4_science_u2.js'));
const SRC0 = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_science_u3.json'), 'utf8'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l06', 'u3_l07', 'u3_l08', 'u3_l10', 'u3_l13'];
/* 원문은 파일 키(u3_l01~l09) — 케이티처 키는 차시 번호. meta.src_key 로 잇는다 · 원문 시뮬 ①은 전부 pose 틀이지만 items 표가 없는 차시 고유 시뮬 → sim 으로 본다 */
const kindOf = (sl) => (sl.kind === 'pose' && !(sl.data && sl.data.items)) ? 'sim' : sl.kind;
const FK = {}; KEYS.forEach(k => { FK[k] = L[k] && L[k].meta.src_key; });
const SRC = {}; KEYS.forEach(k => { SRC[k] = SRC0[FK[k]]; });
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '땅의 변화';
/* 원문 파일 그대로(머리 주석 · 시뮬 함수 본문) */
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasiOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/(?:「땅의 변화」 |3단원 )(\d+(?:~\d+)?)(?:\/13)?차시/); return m ? m[1] : ''; };
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/\[(4과11-0\d)(?: [^\]]*)?\]/); return m ? '[' + m[1] + ']' : ''; };

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
const range = (n) => { const p = String(n).split('~').map(Number); return p.length === 2 ? p : [p[0], p[0]]; };

console.log('═══ A. 로드 ═══');
T('9차시 키(묶음 4·5 → l04 · 8·9 → l08 · 10~12 → l10 · 원문 파일 l05~l09 = 6·7·8~9·10~12·13차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u3_l01~u3_l09 · 빠짐·겹침 0)', () => ok(KEYS.map(k => FK[k]).join() === Object.keys(SRC0).join() && Object.keys(SRC0).length === 9, KEYS.map(k => FK[k]).join()));
T('원문 머리 주석 차시 = 1·2·3·4~5·6·7·8~9·10~12·13 (intro-meta 는 l02 만 있어 주석으로 확인)', () => ok(KEYS.map(chasiOf).join() === '1,2,3,4~5,6,7,8~9,10~12,13', KEYS.map(chasiOf).join()));
T('meta: 4학년 1학기 · unit 3 · unit_title · covers·분 = 원문 차시 · 성취기준 [4과11-0N] · 학습 목표 = 원문 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta, c = range(chasiOf(k));
  ok(m.grade === 4 && m.term === 1 && m.unit === 3 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(/^(\[4과11-0[1234]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표');
  ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('원문 주석에 성취기준이 있는 차시(l02~l08 원문)는 그 번호 그대로 · l13 = 넷 모두 · 단원 전체가 [4과11-01·02·03·04] 를 덮음', () => { let n = 0; KEYS.forEach(k => { const s = stdOf(k); if (s) { n++; ok(L[k].meta.std === s, k + ' ' + L[k].meta.std + ' ≠ 원문 ' + s); } }); ok(n >= 7, '원문 성취기준 차시 ' + n);
  ['[4과11-01]', '[4과11-02]', '[4과11-03]', '[4과11-04]'].forEach(x => { ok(KEYS.some(k => stdOf(k) === x), '원문 ' + x); ok(L.u3_l13.meta.std.indexOf(x) >= 0, 'l13 ' + x); ok(KEYS.slice(0, 8).some(k => L[k].meta.std.indexOf(x) >= 0), '앞 차시 ' + x); }); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u2_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-1 과학 u2_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_science:u2_l11'), 'from ' + rv.from); }));
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
    else { ok(sl.cards, s.id + ' 원문 정리 카드 장 아님'); ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = String(sl.cards[i].label).replace(/\*\*/g, '').split('\n').map(norm); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls.slice(1).join(' '), s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드'); }); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  if (ms.src === 'note') { const line = src.notes.find(n => /오개념 직격/.test(n)); ok(line, '원문 오개념 주석 없음'); ok(plain(line).indexOf(plain(m.wrong)) >= 0, '오개념 ≠ 원문 주석 「' + m.wrong + '」'); }
  else { const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음'); ok(!src.notes.some(n => /오개념 직격/.test(n)), '원문 오개념 주석이 있는데 문항에서 세움'); }
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 3·4·5·6 — 3 = 차시 고유 시뮬(전 차시 · items 없는 pose 틀) · 4 = 살펴보기 · 5 = 정리 카드 · 6 = 정리 카드/목록 장(l13)', () => KEYS.forEach((k, i) => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : kindOf(s)).join();
  ok(sk === 'sim,feat,cards,' + (k === 'u3_l13' ? 'list' : 'cards'), k + ' 원문 꼴 ' + sk); ok(SRC[k].slides.slice(3, 7).every(s => !(s.data && s.data.items)), k + ' 원문에 items 표가 생김 — poseFig 로 바꿀 것'); }));
T('원문 오개념 주석이 있는 차시(원문 l02·l03·l04·l05 = 키 l02·l03·l04·l06)는 모두 주석에서 · 없는 차시는 틀린 보기에서', () => { KEYS.forEach(k => ok((L[k].slides[7].src === 'note') === SRC[k].notes.some(n => /오개념 직격/.test(n)), k)); ok(KEYS.filter(k => L[k].slides[7].src === 'note').join() === 'u3_l02,u3_l03,u3_l04,u3_l06', '주석 차시'); });
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
T('발문 분 합 — 40분 차시 30~45 · 80분 묶음 60~88 · 120분 묶음 90~130 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : d === 80 ? m >= 60 && m <= 88 : m >= 90 && m <= 130, k + ' ' + m + '분/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
/* 학생 화면 = 발문 뺀 데이터 · 표지와 「다음 시간엔」 예고 장은 다음 차시 낱말을 미리 말하는 자리라 제외(원문 next-preview 계승) */
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
const TERM = { '침식': /침식/, '운반': /운반/, '퇴적': /퇴적/, '상류': /상류/, '하류': /하류/, '마그마': /마그마/, '용암': /용암/, '분화구': /분화구/, '화산 분출물': /화산 분출물/, '현무암': /현무암/, '화강암': /화강암/, '화성암': /화성암/, '지진': /지진/, '재난': /재난/ };
const FIRST = [['침식', 'u3_l02'], ['운반', 'u3_l02'], ['퇴적', 'u3_l02'], ['상류', 'u3_l03'], ['하류', 'u3_l03'], ['마그마', 'u3_l04'], ['용암', 'u3_l04'], ['분화구', 'u3_l04'], ['화산 분출물', 'u3_l04'], ['현무암', 'u3_l06'], ['화강암', 'u3_l06'], ['화성암', 'u3_l06'], ['지진', 'u3_l08'], ['재난', 'u3_l10']];
FIRST.forEach(([w0, k0]) => T('「' + w0 + '」 학생 화면 첫 등장 ≥ ' + k0, () => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => L[k].slides.forEach(s => { if (!TERM[w0].test(vis(s))) return; ok(!(i < i0), k + ' ' + s.id + ' 에 「' + w0 + '」'); })); ok(L[k0].slides.some(s => TERM[w0].test(vis(s))), '「' + w0 + '」 도입 차시에 안 나옴'); }));
/* 지도서 차단 낱말(원문 머리 주석 「어휘 차단」 전 차시 합): 삼각주·곡류·단층·지각·활화산·휴화산·사화산·순상·종상·중류·계곡·폭포·풍화·광물·심성암·화산암·절리·진앙·진원·내진·쓰나미·해일·유네스코·측화산·폼페이·간헐천·리히터·규모·진도 — 「판」은 한 글자라 「지각판」 꼴로만 */
const BAN = /삼각주|곡류|단층|지각|활화산|휴화산|사화산|순상|종상|중류|계곡|폭포|풍화|광물|심성암|화산암|절리|진앙|진원|내진|쓰나미|해일|유네스코|측화산|폼페이|간헐천|리히터|규모|(^|[^지])진도/;
T('지도서 차단 낱말(삼각주·곡류·단층·지각·활화산·휴화산·사화산·순상·종상·중류·계곡·폭포·풍화·광물·심성암·화산암·절리·진앙·진원·내진·쓰나미·해일·유네스코·측화산·폼페이·간헐천·리히터·규모·진도) 학생 화면 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { const m = vis(s).match(BAN); ok(!m, k + ' ' + s.id + ' 「' + (m && m[0]) + '」'); })));
T('선행 검사기 자체 확인 — l02 장에 「지진」을 심으면 잡는다 · 「화산 암석 조각」은 「화산암」으로 안 잡고 「화산암」은 잡는다', () => { ok(!BAN.test('화산 암석 조각') && BAN.test('화산암') && BAN.test('지각판') && !BAN.test('지진도 마찬가지') && BAN.test('진도 5'), '화산암·진도 판정'); const s = L.u3_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 지진'; let caught = false; try { KEYS.slice(0, 5).forEach(k => L[k].slides.forEach(x => ok(!TERM['지진'].test(vis(x))))); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });
T('원문(자기주도)도 같은 차례 — 예상·시뮬·정리 장과 정리 줄에서 첫 등장 ≥ 도입 차시', () => FIRST.forEach(([w0, k0]) => { const i0 = KEYS.indexOf(k0); KEYS.forEach((k, i) => { if (i >= i0) return; const s = SRC[k]; const txt = JSON.stringify(s.slides.slice(2, 7)) + JSON.stringify(s.summary); ok(!TERM[w0].test(txt), k + ' 원문에 「' + w0 + '」'); }); }));

console.log('═══ M. 땅의 변화 판정 검산 ═══');
/* 원문 아홉 차시 전체에서 ① 장면 → 침식/퇴적 더 활발(ero/dep) ② 모습 → 상류/하류(up/down) ③ 특징·물건 → 현무암/화강암(hyun/hwa) ④ 일 → 피해/이로움(bad/good) ⑤ 행동 → 알맞음/알맞지 않음(o/x) 표를 모아 어긋남 0 + 표 이름 전부 뜻 규칙에 걸림 */
const strip = (t) => plain(t).replace(/\n/g, ' ').replace(/^[^가-힣㉠-㉣]+/, '').trim();
const NAMES = { ero: '침식 활발', dep: '퇴적 활발', up: '상류', down: '하류', hyun: '현무암', hwa: '화강암', bad: '피해', good: '이로움', o: '알맞음', x: '알맞지 않음' };
const eroRule = (n) => /깎|파|빠르|급해|위쪽|윗부분|상류|모난|바위/.test(n) ? 'ero' : /쌓|모여|모였|느리|느려|완만|아래|하류|모래/.test(n) ? 'dep' : null;
const udRule = (n) => /바위|모난|좁|급|상류/.test(n) ? 'up' : /모래|흙|넓|완만|느린|하류/.test(n) ? 'down' : null;
const rockRule = (n) => /화강암으로/.test(n) ? 'hwa' : /현무암으로/.test(n) ? 'hyun' : /석굴암/.test(n) ? 'hwa' : /돌하르방/.test(n) ? 'hyun' : /어둡|어두운|구멍|작아|안 보|작은/.test(n) ? 'hyun' : /밝|커서|큰|잘 보|분홍/.test(n) ? 'hwa' : null;
const harmRule = (n) => /비옥|농작물|온천|관광|전기|열을 이용/.test(n) ? 'good' : /산불|화재|숨|비행기|뒤덮|덮어|가리|기온/.test(n) ? 'bad' : null;
const actRule = (n) => /승강기를 타|승강기로|그대로 타고|뛰어나가|벽에 바짝|창문|가까이 가|무작정|듣지 않/.test(n) ? 'x' : /책상 아래|먼저 열리는|먼 곳|차단|계단|마스크|손수건|안내 방송에 따라|고정|생존 가방|대피장소/.test(n) ? 'o' : null;
const RULE = { ero: eroRule, dep: eroRule, up: udRule, down: udRule, hyun: rockRule, hwa: rockRule, bad: harmRule, good: harmRule, o: actRule, x: actRule };
const DESC = {};
function gather() { const tab = { ero: {}, ud: {}, rock: {}, harm: {}, act: {} }; const put = (t, name, val) => { name = strip(name); if (!val || !name) return; if (!t[name]) t[name] = new Set(); t[name].add(val); };
  const binVal = (b) => /침식/.test(b) ? ['ero', 'ero'] : /퇴적/.test(b) ? ['ero', 'dep'] : /상류/.test(b) ? ['ud', 'up'] : /하류/.test(b) ? ['ud', 'down'] : /현무암/.test(b) ? ['rock', 'hyun'] : /화강암/.test(b) ? ['rock', 'hwa'] : /피해/.test(b) ? ['harm', 'bad'] : /이로운/.test(b) ? ['harm', 'good'] : /알맞지 않은 행동/.test(b) ? ['act', 'x'] : /알맞은 행동/.test(b) ? ['act', 'o'] : null;
  KEYS.forEach(k => { const s = SRC[k];
    s.problems.forEach(q => {
      if (q.kind === 'cls') q.items.forEach(it => { const b = q.bins.find(x => x.id === it.bin).name; const v = binVal(b); if (v) put(tab[v[0]], it.t, v[1]); });
      if (q.kind === 'mt') q.pairs.forEach(p => { const l = strip(p[0]), r = strip(p[1]); const vr = binVal(r); if (vr && (vr[0] === 'ero' || vr[0] === 'rock')) put(tab[vr[0]], l, vr[1]); if (/^현무암$/.test(l)) put(tab.rock, r, 'hyun'); if (/^화강암$/.test(l)) put(tab.rock, r, 'hwa'); });
      if (q.kind === 'ms' && /이로운 점/.test(q.t)) q.chips.forEach(c => put(tab.harm, c.t, c.hit ? 'good' : 'bad'));
      if (q.kind === 'ms' && /강 상류의 특징/.test(q.t)) q.chips.forEach(c => put(tab.ud, c.t, c.hit ? 'up' : 'down'));
      if (q.kind === 'ms' && /평소에 준비할 일/.test(q.t)) q.chips.forEach(c => put(tab.act, c.t, c.hit ? 'o' : 'x')); });
    s.slides.forEach(sl => { if (sl.kind === 'feat') Object.values(sl.data.data).forEach(f => { DESC[strip(f.name)] = strip(f.name + ' ' + f.feats.join(' ')); if (/강 상류에서 많이/.test(f.feats[0])) put(tab.ud, f.name, 'up'); if (/강 하류/.test(f.feats[0])) put(tab.ud, f.name, 'down'); if (/현무암으로 만들/.test(f.feats.join())) put(tab.rock, f.name, 'hyun'); if (/화강암으로 만들/.test(f.feats.join())) put(tab.rock, f.name, 'hwa'); });
      const d = sl.data || {}; if (d.specs) d.specs.forEach(x => put(tab.rock, x.desc, x.j)); if (d.notes) d.notes.forEach(x => put(tab.harm, x.desc, x.j)); if (d.scenes) d.scenes.forEach(x => ['A', 'B'].forEach(ab => put(tab.act, x[ab].t, x[ab].ok ? 'o' : 'x'))); }); });
  return tab; }
const GA = gather();
const noBad = (tab, label) => { const bad = Object.keys(tab).filter(n => tab[n].size > 1); ok(!bad.length, label + ' 어긋남: ' + bad.map(n => n + ':' + [...tab[n]].join('/')).join(' · ')); };
const count = (tab) => { const c = {}; Object.values(tab).forEach(v => { const x = [...v][0]; c[x] = (c[x] || 0) + 1; }); return c; };
const checkTab = (name, tab, min, each) => T(name + ' 표 — ' + Object.keys(tab).length + '개 · 어긋남 0 · 두 갈래 ' + each + '↑ · 이름 전부 뜻 규칙에 걸림', () => { noBad(tab, name); ok(Object.keys(tab).length >= min, '대상 ' + Object.keys(tab).length); const c = count(tab); ok(Object.keys(c).length === 2 && Object.values(c).every(x => x >= each), JSON.stringify(c));
  Object.keys(tab).forEach(n => { const v = [...tab[n]][0]; const r = RULE[v](n) || RULE[v](DESC[n] || n); ok(r, n + ' — 규칙 없음'); ok(r === v, n + ' ' + NAMES[v] + ' ≠ 규칙 ' + NAMES[r]); }); });
checkTab('침식/퇴적 활발', GA.ero, 14, 6);
checkTab('상류/하류', GA.ud, 10, 4);
checkTab('현무암/화강암', GA.rock, 10, 4);
checkTab('피해/이로움', GA.harm, 12, 5);
checkTab('대처 행동 ○✗', GA.act, 14, 6);
T('케이티처 l03 기준 갈래 「강 상류에서 많이 보나요?」 — yes = 상류 표 · no = 하류 표 / l06 ㉠~㉣ 판정 카드 = 원문 specs 판정 / l07 쪽지 카드 = 원문 notes 판정 / l08 훈련 카드 = 원문 scenes 의 알맞은 행동', () => { const f = L.u3_l03.slides[4].data.fig; ok(f.k === 'ask', 'l03 ask'); f.yes.forEach(x => ok([...GA.ud[x.name] || []][0] === 'up', '상류 ' + x.name)); f.no.forEach(x => ok([...GA.ud[x.name] || []][0] === 'down', '하류 ' + x.name));
  const sp = SRC.u3_l06.slides[3].data.specs; L.u3_l06.slides[3].data.fig.items.forEach((it, i) => ok(it.emoji === sp[i].emoji && strip(sp[i].desc).startsWith(strip(it.name)) && new RegExp(sp[i].j === 'hyun' ? '현무암' : '화강암').test(it.kind), 'l06 ' + it.name));
  const no = SRC.u3_l07.slides[3].data.notes; L.u3_l07.slides[3].data.fig.items.forEach((it, i) => ok(it.emoji === no[i].emoji && strip(no[i].desc).indexOf(strip(it.name)) >= 0 && new RegExp(no[i].j === 'bad' ? '피해' : '이로운 점').test(it.kind), 'l07 ' + it.name));
  const sc = SRC.u3_l08.slides[3].data.scenes; L.u3_l08.slides[3].data.fig.items.forEach((it, i) => { const okT = strip(sc[i].A.ok ? sc[i].A.t : sc[i].B.t); ok(it.emoji === sc[i].emoji && strip(sc[i].desc).indexOf(strip(it.name)) >= 0 && (okT.indexOf(it.kind) >= 0 || it.kind.indexOf(okT.slice(0, 10)) >= 0 || /계단을 이용|먼저 열리는/.test(it.kind)), 'l08 ' + it.name); ok(actRule(it.kind) === 'o', 'l08 카드 아래 줄이 알맞은 행동이 아님 ' + it.kind); }); });
T('l13 징검다리 카드 — ⭕ 카드 이름은 원문 Q 의 O 문장 토막 · ❌ 는 X 문장 토막 · 아래 줄은 그 문항의 why 토막 · O·X 각 3', () => { const Q = SRC.u3_l13.slides[3].data.Q; const f = L.u3_l13.slides[3].data.fig; let o = 0, x = 0; f.items.forEach(it => { const q = Q.find(q => strip(q.q).indexOf(strip(it.name)) >= 0); ok(q, '원문 문항 없음 ' + it.name); ok((q.a === 'O') === (it.emoji === '⭕'), 'O/X 그림 ' + it.name); ok(strip(q.why).indexOf(it.kind) >= 0, 'why 토막 ' + it.kind); if (q.a === 'O') o++; else x++; }); ok(o === 3 && x === 3, o + '/' + x); ok(Q.length === 8 && Q.filter(q => q.a === 'O').length === 4, '원문 문항 8 · O 4'); });
T('원문 l04 모형실험 — 연기 = 화산 가스 · 흐르는 마시멜로 = 용암 · 튀는 덩어리 = 화산 암석 조각(원문 ans) · 케이티처 카드도 같은 대응', () => { const ans = SRC.u3_l04.slides[3].data.steps[3].ans; ok(/연기=화산 가스/.test(ans) && /마시멜로=용암/.test(ans) && /덩어리=화산 암석 조각/.test(ans), ans); const ks = L.u3_l04.slides[3].data.fig.items.map(i => i.kind).join(' '); ok(/연기는 실제 화산의 화산 가스/.test(ks) && /마시멜로 = 용암/.test(ks) && /덩어리 = 화산 암석 조각/.test(ks), ks); });
/* 학생 화면 서술 검산(문장 단위): 오개념 장 틀린 생각 칸 · 기본 문제의 나눌 것·짝·답(일부러 틀린 보기 포함)은 빼고 본다 — 기본 문제 정답 보기는 따로 넣어 본다 */
/* 따옴표로는 가르지 않는다 — 원문 l07 카드 「\"우리나라에서는 지진 피해가 없다\"? 아니에요 — …」처럼 틀린 생각을 인용하고 바로 뒤집는 문장이 있어서 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|·(?=\s)|\s\/\s/).map(x => x.replace(/\\?"/g, '').trim()).filter(Boolean);
const NEG = /않|아니|없|뿐|함께|동시|달라|다를|고쳐|틀/;
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x => {
  if (/라고 (말|적|썼)|줄을 적었|틀린 (이름표|문장|줄)/.test(x)) return; /* 틀린 생각을 인용해 고치게 하는 자리(생각을 넓혀요·오개념 힌트) */
  if (/(침식|운반|퇴적|세 작용)/.test(x) && /(따로따로|독립|각각|만 일어)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/현무암/.test(x) && !/화강암/.test(x) && /(밝|커서 잘)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/화강암/.test(x) && !/현무암/.test(x) && /(어둡|작아)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(모두 구멍|모두 흰|모두 표면에 구멍|구멍이 모두)/.test(x) && !/않|아니|없|\?/.test(x)) bad.push(x);
  if (/우리나라/.test(x) && /지진/.test(x) && /(없|안전해)/.test(x) && !/않|아니|있|\?/.test(x)) bad.push(x);
  if (/피해만/.test(x) && !/않|아니|잘못|틀|\?/.test(x)) bad.push(x);
  if (/승강기/.test(x) && /(타고|이용해|로 대피|로 내려|를 이용)/.test(x) && !/않|아니|말고|대신|안 돼|위험|멈|갇|금지|못|까닭|계단|먼저 열리는/.test(x)) bad.push(x);
  if (/뛰어나가|뛰어나간/.test(x) && !/않|아니|말고|위험|안 돼|대신|먼저|다칠|\?/.test(x)) bad.push(x);
  if (/(같은 곳|한 지점)/.test(x) && /(빠르기|속도)/.test(x) && /같/.test(x) && !/않|아니|달라|다르|\?/.test(x)) bad.push(x);
  if (/용암/.test(x) && /(나와야|분출해야|흘러나와야)/.test(x) && !/않|아니|\?/.test(x)) bad.push(x);
  if (/(소품만|꾸미기만|화려하게만)/.test(x) && !/않|아니|보다/.test(x)) bad.push(x);
  if (/현무암/.test(x) && /화강암/.test(x) && /색/.test(x) && /같/.test(x) && !/않|아니|달라|다르/.test(x)) bad.push(x);
  if (/땅의 모습/.test(x) && /(절대|변하지 않|가만히)/.test(x) && !/조금씩|아니|틀|변하고/.test(x)) bad.push(x);
  if (/(침식|퇴적|현무암|화강암|지진|피해만|승강기|뛰어나가|뛰어나간|용암|소품|땅의 모습)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; let d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined;
  if (d.fig) d.fig = d.fig.k === 'ask' ? d.fig.q + ' / ' + d.fig.yes.concat(d.fig.no).map(x => x.name).join(' / ') + ' / ' + (d.fig.note || '') : d.fig.items.map(it => it.name + ' — ' + (it.kind || '')).join(' / '); if (s.block === 'basic_problem') d = { title: d.title, question: d.question, note: d.note, options: (d.options || []).filter(o => o.correct).map(o => o.text) }; return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n'); };
T('학생 화면의 「세 작용 따로」·「암석 색·알갱이」·「우리나라 지진 없음」·「피해만」·「승강기·뛰어나가기」·「~해야 화산」·「소품만」 서술이 판정과 어긋나지 않음 — 전수(오개념 장 틀린 생각 칸·틀린 보기·통·짝 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 40, '검산 대상 ' + n); });
T('검산기 자체 확인 — 틀린 문장 여덟을 잡고 바른 문장 여덟은 지나간다', () => {
  ['침식 작용과 퇴적 작용은 각각 독립적으로 일어나요.', '현무암은 색이 밝아요.', '화강암은 모두 흰색과 검은색이에요.', '우리나라에서는 지진 피해가 없어요.', '화산 활동은 피해만 줘요.', '지진이 나면 승강기를 타고 내려가요.', '용암이 흘러나와야 화산이에요.', '안내 자료는 소품만 화려하게 꾸미면 돼요.'].forEach(x => ok(sayCheck(x).bad.length === 1, '못 잡음 ' + x));
  ['세 작용은 보통 동시에 일어나요.', '현무암은 색이 어둡고 화강암은 밝아요.', '분홍색 알갱이가 보이는 화강암도 있어요.', '우리나라도 지진으로부터 안전하지 않아요.', '화산 활동은 피해만 주지 않아요.', '승강기 대신 계단을 이용해요.', '용암이 나오지 않아도 화산일 수 있어요.', '소품보다 내용이 중요해요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('오개념 장 「틀린 생각」이 판정과 반대 — 아홉 차시 전부 검산기에 잡힘', () => KEYS.forEach(k => ok(sayCheck(L[k].slides[7].data.wrong).bad.length >= 1, k + ' 「' + L[k].slides[7].data.wrong + '」')));
T('기본 문제 일부러 틀린 보기도 판정과 반대 — 원문 「세 작용은 언제나 따로따로만」(l02) · 「강 상류에서는 침식 작용만」(l03) · 「우리나라에서는 지진 피해가 없었어요」(l08)를 잡음', () => { ok(sayCheck('세 작용은 언제나 따로따로만 일어나요').bad.length === 1, 'l02'); ok(sayCheck('강 상류에서는 침식 작용만 일어나요').bad.length === 1, 'l03'); ok(sayCheck('우리나라에서는 지진 피해가 없었어요').bad.length === 1, 'l08'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4_science_u3.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); });

console.log('\n게이트 g4 과학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
