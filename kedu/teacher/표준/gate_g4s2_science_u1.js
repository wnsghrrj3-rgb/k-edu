/* gate_g4s2_science_u1.js — 4학년 2학기 과학 1단원 「밤하늘 관찰」 케이티처 2세대 게이트 (204차, 베프 — 4-1 과학 u4 게이트 틀 + 4-2 원문 꼴에 맞춘 F + 천체 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(재료 키 = 차시 번호 · file_key ↔ 원문 파일 · 차시 = 원문 머리 주석 「N/11차시」 · 성취기준 = 원문 주석 있으면 그대로, 없으면 [4과13-0N] 배정)
   B 19장 · C 7요소 · D 복습 계보(4-1 과학 u4_l12 → l01 → … → l11)
   E 정답 표시(원문 그대로) · F 원문 계승(시뮬 ①② 카드 = 원문 시뮬 함수 본문 글 토막 · 도감 = 원문 이름·결과 줄 「— 」 뒤 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문(fx-label 「이름 — 아래 줄」이면 첫 「 — 」에서 가름) · 말풍선 = 원문 bub · 오개념 = 원문 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문(80분 묶음 60~88) · L 선행 용어(원문 첫 등장 차시보다 앞서 학생 화면에 안 나옴)
   M 천체 판정(달 모양 차례·약 30일 · 행성 땅/기체·고리 · 별 = 스스로 빛 · 북극성·북두칠성 자리 · 풍선 ⭕❌ · 학생 화면 서술 검산 + 검산기 자체 확인) · N 차단 어휘
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_science_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g4s2_science_u1.js'));
const PREV = load(path.join(TDIR, 'data/g4_science_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_science_u1.json'), 'utf8'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l06', 'u1_l08', 'u1_l10', 'u1_l11'];
const DIR = path.join(ROOT, 'grade4/semester2/science/1단원_밤하늘관찰');
/* 원문 시뮬 ①은 전부 pose 틀(steps 표 · l08 ②는 풍선 Q 표) — items 표가 없으면 sim 으로 본다 */
const kindOf = (sl) => (sl.kind === 'pose' && !(sl.data && sl.data.items)) ? 'sim' : sl.kind;
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '밤하늘 관찰';
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasiOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/\((\d+(?:~\d+)?)\/11차시/); return m ? m[1] : ''; };
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/성취기준 (\[[^\]]+\])/); return m ? m[1] : ''; };
const expandStd = (s) => { const m = s.match(/^\[4과13-(.+)\]$/); return m ? m[1].split('·').map(x => '[4과13-' + x + ']').join('') : s; };
const cardSplit = (label) => { const t = String(label).replace(/\*\*/g, '').replace(/\n/g, ' '); const i = t.indexOf(' — '); return i < 0 ? [norm(t), ''] : [norm(t.slice(0, i)), norm(t.slice(i + 3))]; };

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const nb = (t) => norm(String(t).replace(/\*\*/g, ''));
const range = (n) => { const p = String(n).split('~').map(Number); return p.length === 2 ? p : [p[0], p[0]]; };

console.log('═══ A. 로드 ═══');
T('8차시 키(묶음 4·5 → l04 · 6·7 → l06 · 8·9 → l08 · 원문 파일 l01~l08 = 1·2·3·4~5·6~7·8~9·10·11차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS) && JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u1_l01~u1_l08 · 빠짐·겹침 0) · 원문 폴더 파일 8개 전부', () => { ok(KEYS.map(k => L[k].meta.src_key).join() === 'u1_l01,u1_l02,u1_l03,u1_l04,u1_l05,u1_l06,u1_l07,u1_l08', KEYS.map(k => L[k].meta.src_key).join()); ok(fs.readdirSync(DIR).filter(f => /^g4_sci_u1_l\d+_.*\.html$/.test(f)).length === 8, '원문 폴더'); KEYS.forEach(k => ok(SRC[k].file_key === L[k].meta.src_key, k)); });
T('원문 머리 주석 차시 = 1·2·3·4~5·6~7·8~9·10·11 (intro-meta 에 차시 없음 → 주석으로 확인)', () => ok(KEYS.map(chasiOf).join() === '1,2,3,4~5,6~7,8~9,10,11', KEYS.map(chasiOf).join()));
T('meta: 4학년 2학기 · unit 1 · unit_title · covers·분 = 원문 차시 · 학습 목표 = 원문 · live_url 실파일 · 합 440분', () => { let sum = 0; KEYS.forEach(k => { const m = L[k].meta, c = range(chasiOf(k));
  ok(m.grade === 4 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); sum += m.duration_min; ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표'); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.source === 'grade4/semester2/science/1단원_밤하늘관찰/' + SRC[k].file, k + ' source'); }); ok(sum === 440, '합 ' + sum); });
T('성취기준 — 원문 주석에 있는 차시(l01·l02·l03·l04·l06)는 그대로 · 없는 차시(l08 홍보 = 셋 · l10 망원경 = -02 · l11 = 셋)는 단원 넷 밖 0', () => { KEYS.forEach(k => { const s = stdOf(k); const m = L[k].meta.std; ok(/^(\[4과13-0[123]\])+$/.test(m), k + ' std ' + m); if (s) ok(m === expandStd(s), k + ' 원문 ' + s + ' ≠ ' + m); });
  ok(KEYS.filter(k => stdOf(k)).join() === 'u1_l01,u1_l02,u1_l03,u1_l04,u1_l06', '원문 주석 차시가 바뀜 — 확인'); ok(L.u1_l10.meta.std === '[4과13-02]' && L.u1_l11.meta.std === '[4과13-01][4과13-02][4과13-03]', '배정'); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u4_l12.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-1 과학 u4_l12') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_science:u4_l12'), 'from ' + rv.from); }));
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
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (넷 다 쓰임)', () => ok(nMcq >= 7 && nCls >= 4 && nMt >= 5 && nMs >= 3, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
T('원문 문항 자체 확인 — mcq 정답 1 · ms 맞·틀 둘 다 · cls 통마다 물건 1↑ · mt 왼쪽·오른쪽 겹침 0', () => KEYS.forEach(k => SRC[k].problems.forEach(q => { if (q.kind === 'mcq') ok(q.ci >= 0 && q.opts.length >= 3, k + ' ' + q.t); if (q.kind === 'ms') ok(q.chips.some(c => c.hit) && q.chips.some(c => !c.hit), k + ' ' + q.t); if (q.kind === 'cls') q.bins.forEach(b => ok(q.items.some(it => it.bin === b.id), k + ' 빈 통 ' + b.name)); if (q.kind === 'mt') ok(new Set(q.pairs.map(p => p[0])).size === q.pairs.length && new Set(q.pairs.map(p => p[1])).size === q.pairs.length, k + ' 짝 겹침'); })));

console.log('═══ F. 원문 계승 ═══');
const EMO = /[\u{1F000}-\u{1FFFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u20E3]/gu;
const plain = (t) => nb(t).replace(EMO, '').replace(/\s+/g, ' ').trim();
/* 시뮬 원문 = 원문 파일의 그 시뮬 함수 본문(IIFE) + 시뮬 장 글 */
const simRaw = (k, sl) => { const h = ORIG[k]; const i = h.indexOf('(function ' + sl.fn + '()'); ok(sl.fn && i >= 0, k + ' 원문 시뮬 함수 ' + sl.fn); const j = h.indexOf('})();', i); return plain(h.slice(i, j) + '\n' + (sl.simText || '')); };
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 시뮬 ①(진행형)·②(도감/판)·정리 카드 · 오개념 = 원문 틀린 보기 · 문항·정리·자기 평가·다음 = 원문', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && sl.kind !== 'goal', s.id + ' 원문 장 아님'); ok(d.title === nb(sl.title), s.id + ' 제목 ' + d.title);
    if (kindOf(sl) === 'sim') { const raw = simRaw(k, sl); ok(d.content && d.content.length < 90, s.id + ' 시뮬 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach(it => { ok(it.kind && raw.indexOf(plain(it.kind)) >= 0, s.id + ' 카드 아래 줄이 원문 시뮬에 없음: ' + it.kind); ok(raw.indexOf(plain(it.name)) >= 0, s.id + ' 카드 이름이 원문 시뮬에 없음: ' + it.name); }); }
    else if (sl.kind === 'feat') { const vals = Object.values(sl.data.data); ok(d.content && d.content.length < 90, s.id + ' 도감 말풍선은 교사 한 줄');
      if (d.fig.k === 'ask') { const all = d.fig.yes.concat(d.fig.no).map(x => x.emoji + ' ' + x.name).sort(); ok(JSON.stringify(all) === JSON.stringify(vals.map(f => f.emoji + ' ' + f.name).sort()), s.id + ' 두 갈래 ≠ 원문 도감 전부'); }
      else { ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length === vals.length, s.id + ' 카드 수'); d.fig.items.forEach(it => { const f = vals.find(x => x.name === it.name); ok(f, s.id + ' 원문에 없는 카드 ' + it.name); ok(it.emoji === f.emoji && f.feats.some(x => plain(x).endsWith(' — ' + it.kind)), s.id + ' 카드 아래 줄 ≠ 원문 결과 줄 「— 」 뒤 ' + it.name); }); } }
    else { ok(sl.cards, s.id + ' 원문 정리 카드 장 아님'); ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = cardSplit(sl.cards[i].label); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls[1], s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드 ' + it.name); }); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.kind === 'cls' ? q.items.filter(it => /^(no|bad)$/.test(it.bin)).map(it => it.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음');
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 3·4·5·6 — 3 = 진행형 시뮬(전 차시 · steps 표) · 4 = 도감(l01·l04·l11) 또는 판(sim) · 5·6 = 정리 카드(말풍선 있음)', () => KEYS.forEach(k => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : kindOf(s)).join();
  ok(sk === (['u1_l01', 'u1_l04', 'u1_l11'].indexOf(k) >= 0 ? 'sim,feat,cards,cards' : 'sim,sim,cards,cards'), k + ' 원문 꼴 ' + sk); ok(SRC[k].slides[3].data.steps && SRC[k].slides[3].data.steps.length >= 4, k + ' 진행형 steps'); ok(SRC[k].slides.slice(3, 7).every(s => !(s.data && s.data.items)), k + ' 원문에 items 표가 생김 — poseFig 로 바꿀 것'); ok(SRC[k].slides.slice(5, 7).every(s => s.text), k + ' 정리 장 말풍선 비어 있음'); }));
T('원문 머리 주석에 「오개념」 줄 없음 → 전 차시 틀린 보기에서 세움(주석이 생기면 그쪽으로 바꿀 것)', () => KEYS.forEach(k => ok(!SRC[k].notes.some(n => /^오개념/.test(n)), k)));
T('동기 장 물음 = 원문 예상 장(recall)과 같은 물음 — 원문 예상 장의 핵심 낱말이 동기 물음에 있음', () => KEYS.forEach(k => { const r = plain(SRC[k].slides[2].recall); const q = plain(L[k].slides[2].data.question); const words = (r.match(/[가-힣]{2,}/g) || []).filter(w => w.length >= 3); ok(words.some(w => q.indexOf(w) >= 0), k + ' 동기 물음이 원문 예상과 동떨어짐'); }));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => { ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name); ok(s.src === 5 || s.src === 6 || (it.kind || '').length <= 40, s.id + ' 카드 아래 줄 너무 김 ' + it.kind); /* 5·6 = 원문 정리 카드 글 그대로 */ });
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); } })));
T('부품 가짓수 3 (카드·차례·기준 갈래) · chain 6↑ · ask 1↑ (l04 표면 상태)', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 3 && cnt.chain >= 6 && cnt.ask >= 1, JSON.stringify(cnt)); });

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
T('발문 분 합 — 40분 차시 30~45 · 80분 묶음 60~88 · 교실 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].meta.duration_min; const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(d === 40 ? m >= 30 && m <= 45 : d === 80 ? m >= 60 && m <= 88 : m >= 90 && m <= 130, k + ' ' + m + '분/' + d); const act = L[k].slides[12].data; ok(act.minutes === act.tnote.min, k + ' 활동 분'); }));

console.log('═══ L. 선행 용어 ═══');
/* 학생 화면 = 발문 뺀 데이터 · 표지·「다음 시간엔」은 다음 차시를 미리 말하는 자리라 제외 · 기준 = 원문(자기주도) 첫 등장 차시 — 케이티처가 원문보다 앞서 꺼내지 않음 */
const vis = (s) => (s.block === 'next_lesson' || s.block === 'cover') ? '' : JSON.stringify(Object.assign({}, s.data, { tnote: undefined }));
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + JSON.stringify(SRC[k].summary);
const TERMS = ['달의 바다', '충돌 구덩이', '초승달', '상현달', '하현달', '그믐달', '30일', '태양계', '천체', '수성', '천왕성', '해왕성', '고리', '기체', '북극성', '북두칠성', '큰곰자리', '작은곰자리', '카시오페이아', '별자리', '망원경', '다누리호', '제임스 웹', '탐사선'];
const firstSrc = (w0) => KEYS.findIndex(k => srcTxt(k).indexOf(w0) >= 0);
T('원문 첫 등장 차시 표 — ' + TERMS.map(w0 => w0 + ' ' + (KEYS[firstSrc(w0)] || '-').slice(-3)).join(' · '), () => TERMS.forEach(w0 => ok(firstSrc(w0) >= 0, w0 + ' 원문에 없음')));
TERMS.forEach(w0 => T('「' + w0 + '」 학생 화면 첫 등장 ≥ 원문 첫 등장(' + KEYS[firstSrc(w0)] + ')', () => { const i0 = firstSrc(w0); KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id + ' 에 「' + w0 + '」')); }); }));
T('선행 검사기 자체 확인 — l02 장에 「카시오페이아」를 심으면 잡는다', () => { const s = L.u1_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 카시오페이아'; let caught = false; const i0 = firstSrc('카시오페이아'); try { KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(x => ok(vis(x).indexOf('카시오페이아') < 0)); }); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });

console.log('═══ M. 천체 판정 검산 ═══');
const PH = ['초승달', '상현달', '보름달', '하현달', '그믐달'];
const PL = ['수성', '금성', '지구', '화성', '목성', '토성', '천왕성', '해왕성'];
const LAND = PL.slice(0, 4), GAS = PL.slice(4);
const pd = SRC.u1_l04.slides[4].data.data; const featOf = (n) => Object.values(pd).find(x => x.name === n).feats.join(' ');
T('원문 행성 도감 = 태양에서 가까운 차례 여덟 · 땅 넷(단단한 땅 · 고리 없음) / 기체 넷(기체 · 고리 있음) — 검산기 표와 같음', () => { ok(Object.values(pd).map(x => x.name).join() === PL.join(), Object.values(pd).map(x => x.name).join()); LAND.forEach(n => ok(/단단한 땅이 있습니다/.test(featOf(n)) && /고리 — 없습니다/.test(featOf(n)), n)); GAS.forEach(n => ok(/기체로 이루어져/.test(featOf(n)) && /고리 — (희미한|크고 뚜렷한) 고리/.test(featOf(n)), n)); ok(/크고 뚜렷한/.test(featOf('토성')) && GAS.filter(n => /크고 뚜렷한/.test(featOf(n))).length === 1, '크고 뚜렷한 고리 = 토성 하나'); });
T('케이티처 l04 두 갈래 「표면에 단단한 땅이 있나요?」 — yes = 수성·금성·지구·화성 · no = 목성·토성·천왕성·해왕성 (원문 표면 상태 줄과 같음)', () => { const f = L.u1_l04.slides[4].data.fig; ok(f.k === 'ask', 'ask'); ok(f.yes.map(x => x.name).join() === LAND.join() && f.no.map(x => x.name).join() === GAS.join(), f.yes.map(x => x.name).join() + ' / ' + f.no.map(x => x.name).join()); f.yes.forEach(x => ok(/단단한 땅이 있습니다/.test(featOf(x.name)), x.name)); f.no.forEach(x => ok(/기체/.test(featOf(x.name)), x.name)); });
T('원문 l11 행성 두 칸 문항(cls) — 땅 칸 = 땅 넷 안 · 기체 칸 = 기체 넷 안', () => { const q = SRC.u1_l11.problems.find(p => p.kind === 'cls' && p.bins.some(b => /단단한 땅/.test(b.name))); ok(q, '문항'); q.items.forEach(it => ok((it.bin === 'land' ? LAND : GAS).indexOf(it.t) >= 0, it.t)); });
T('달 모양 차례 — 원문 붙임딱지 SEEN 순서 = 초승·상현·보름·하현·그믐·초승 · 케이티처 l03 판 카드·정리 카드·l11 빈칸 카드가 같은 차례', () => { const seen = SRC.u1_l03.slides[4].data.SEEN.map(x => PH.find(p => x.t.indexOf(p) >= 0)); ok(seen.join() === PH.concat(PH[0]).join(), seen.join());
  ok(L.u1_l03.slides[4].data.fig.items.map(it => PH.find(p => it.name.indexOf(p) >= 0)).join() === PH.join(), 'l03 판'); ok(L.u1_l03.slides[5].data.fig.items.map(it => it.name).join() === PH.join(), 'l03 정리 카드'); ok(L.u1_l11.slides[3].data.fig.items[1].kind === PH.join(' → '), 'l11 빈칸 카드'); });
T('풍선 놀이 카드(l08 ②) — ⭕/❌ = 원문 Q 의 ok · 아래 줄 = 그 문항 why 토막 · ⭕ 2 · ❌ 2 · l08 출구 셋째(북두칠성) = 원문 ⑧ 틀림', () => { const Q = SRC.u1_l08.slides[4].data.Q; const f = L.u1_l08.slides[4].data.fig; let o = 0, x = 0; f.items.forEach(it => { const q = Q.find(q => plain(q.t) === plain(it.name)); ok(q, '원문 문항 없음 ' + it.name); ok(q.ok === (it.emoji === '⭕'), 'O/X ' + it.name); ok(plain(q.why).indexOf(plain(it.kind)) >= 0, 'why ' + it.kind); q.ok ? o++ : x++; }); ok(o === 2 && x === 2, o + '/' + x);
  const q8 = Q.find(q => /북두칠성/.test(q.t)); ok(q8 && q8.ok === false && /^틀렸다/.test(L.u1_l08.slides[15].data.items[2].a), '출구 ⑧'); });
T('북극성·북두칠성 자리(l06 ② 판 카드) — 북극성 = 작은곰자리 꼬리 · 북두칠성 = 큰곰자리 꼬리 (원문 FOUND 와 같음)', () => { const F = SRC.u1_l06.slides[4].data.FOUND; ok(/작은곰자리의 꼬리 부분에 북극성/.test(F[0].fact) && /북두칠성은 큰곰자리의 꼬리/.test(F[1].fact), '원문'); const it = L.u1_l06.slides[4].data.fig.items; ok(it[1].name === '작은곰자리' && /북극성/.test(it[1].kind) && it[2].name === '북두칠성' && /큰곰자리/.test(it[2].kind), '케이티처'); });
/* 학생 화면 서술 검산(문장 단위): 오개념 장 틀린 생각 칸 · ❌ 카드 · 기본 문제 틀린 보기·통·짝은 빼고 본다 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|\s\/\s|","|":"|\["|"\]/).map(x => x.replace(/\\?"/g, '').trim()).filter(Boolean);
const NEG = /않|아니|없|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/;
const NEG2 = /않|아니|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/; /* 「없었」을 부정으로 보지 않는 자리 */
const cyc = (seq) => { let d = 0; for (let i = 1; i < seq.length; i++) if (seq[i] <= seq[i - 1]) d++; return d === 0 || (d === 1 && seq[seq.length - 1] < seq[0]); };
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x => {
  if (/라고 (말|적|썼)|라는 문장|틀린 (문장|줄)|줄 알았/.test(x)) return; /* 틀린 생각을 인용해 고치게 하는 자리 · 「~인 줄 알았어」 = 지난 생각 돌아보기 */
  if (/(행성|목성|금성|화성|지구)(은|는|도|이|가) [^.]{0,15}스스로 빛을 (내요|낸다|내는|내며|내고|내어)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/태양계의 중심(에는|에)? ?(지구|행성)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(지구|행성)(은|는|이|가) [^.]{0,10}태양계(의)? 중심/.test(x) && !NEG.test(x)) bad.push(x);
  if (/태양(은|는|이|가) [^.]{0,10}(행성 (가운데|중)|행성이에요|행성이다|행성 주위를 돌)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/달의 바다[^.]{0,15}물이 (있|가득|차)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/달의 바다[^.]{0,12}밝은/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(달의 모양이|달이) [^.]{0,6}실제로 (변|바뀌)|달이 깎/.test(x) && !NEG.test(x)) bad.push(x);
  if (/약 15일/.test(x) && /같은 모양/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(행성은 모두|모든 행성)[^.]{0,12}단단한 땅이 있/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(목성|토성|천왕성|해왕성)[은는에도]? [^.]{0,10}단단한 땅이 있/.test(x) && !/(수성|금성|지구|화성)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(수성|금성|지구|화성)[은는에도의]? [^.]{0,10}(크고 뚜렷한 )?고리(가 있|를 가지)/.test(x) && !/(목성|토성|천왕성|해왕성)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/북두칠성[^.]{0,10}작은곰자리/.test(x) && !NEG.test(x)) bad.push(x);
  if (/북극성[^.]{0,15}(큰곰자리|북두칠성)의 꼬리/.test(x) && !NEG.test(x)) bad.push(x);
  if (/북극성[^.]{0,25}남쪽/.test(x) && !NEG.test(x)) bad.push(x);
  if (/북극성[^.]{0,20}(자리가 크게 달라|위치가 (많이|크게) 변)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/행성이 아직 없었|그때(에는)? [^.]{0,10}(천왕성|해왕성)[^.]{0,10}없었/.test(x) && !NEG2.test(x)) bad.push(x);
  const ph = PH.map((p, i) => [x.indexOf(p), i]).filter(a => a[0] >= 0).sort((a, b) => a[0] - b[0]).map(a => a[1]); if (ph.length >= 3 && !cyc(ph)) bad.push(x);
  x.split(/이고|이며|하고|\s—\s/).forEach(part => { const pl = PL.map((p, i) => [part.search(new RegExp('(^|[^가-힣])' + p)), i]).filter(a => a[0] >= 0).sort((a, b) => a[0] - b[0]).map(a => a[1]); if (pl.length >= 4 && pl.some((v, i) => i && v < pl[i - 1])) bad.push(x); }); /* 「고리가 있는 행성은 목·토·천·해이고, 없는 행성은 수·금·지·화」처럼 두 무리를 잇는 문장은 마디마다 */
  if (/(스스로 빛|태양계의 중심|달의 바다|실제로|15일|단단한 땅|고리|북두칠성|북극성|초승달|보름달)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; let d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined;
  if (d.fig) d.fig = d.fig.k === 'ask' ? d.fig.q + ' / ' + d.fig.yes.map(x => x.name).join(' · ') + ' — ' + (d.fig.ya || '') + ' / ' + d.fig.no.map(x => x.name).join(' · ') + ' — ' + (d.fig.na || '') + ' / ' + (d.fig.note || '') : d.fig.items.filter(it => it.emoji !== '❌').map(it => it.name + ' — ' + (it.kind || '')).join(' / ');
  if (s.block === 'basic_problem') d = { title: d.title, question: d.question, note: d.note, options: (d.options || []).filter(o => o.correct).map(o => o.text) }; return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v || '')).join('\n'); };
T('학생 화면 서술이 천체 판정과 어긋나지 않음 — 행성 스스로 빛 · 지구 중심 · 달의 바다 물/밝음 · 달 실제 변화 · 15일 · 모든 행성 땅 · 땅 행성 고리 · 북두칠성/북극성 자리 · 북극성 남쪽 · 달 모양·행성 차례 (전수 · 오개념 틀린 칸·❌ 카드·틀린 보기 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 80, '검산 대상 ' + n); });
T('검산기 자체 확인 — 틀린 문장 열다섯을 잡고 바른 문장 열다섯은 지나간다', () => {
  ['행성도 별처럼 스스로 빛을 낸다.', '목성은 별처럼 스스로 빛을 내요.', '태양계의 중심에는 지구가 있어요.', '태양은 태양계 행성 가운데 하나예요.', '달의 바다에는 물이 가득 차 있어요.', '달의 바다는 달 표면의 밝은 부분이에요.', '달의 모양이 실제로 변해서 다르게 보여요.', '같은 모양의 달을 보려면 약 15일이 걸려요.', '태양계 행성은 모두 표면에 단단한 땅이 있어요.', '화성은 크고 뚜렷한 고리가 있어요.', '북두칠성은 작은곰자리의 꼬리 부분에 있어요.', '북극성은 남쪽 밤하늘에서 볼 수 있어요.', '초승달 · 보름달 · 상현달 · 하현달 · 그믐달', '목성 · 수성 · 금성 · 지구 · 화성 차례로 있어요.', '그때에는 두 행성이 아직 없었기 때문이에요.'].forEach(x => ok(sayCheck(x).bad.length >= 1, '못 잡음 ' + x));
  ['행성은 별과 달리 스스로 빛을 내지 않아요.', '별은 행성과 달리 스스로 빛을 내는 천체예요.', '태양은 태양계 중심에 있고, 행성은 태양 주위를 돌고 있어요.', '태양은 행성이 아니라 태양계 중심에 있는 천체예요.', '달의 바다에는 실제로 물이 없어요.', '달 표면의 어두운 곳을 달의 바다라고 해요.', '실제 달의 모양은 변하지 않아요.', '같은 모양의 달을 다시 보려면 약 30일이 걸려요.', '수성, 금성, 지구, 화성은 표면에 단단한 땅이 있고, 고리가 없어요.', '목성, 토성, 천왕성, 해왕성은 표면이 기체로 이루어져 있고 고리가 있어요.', '북두칠성은 큰곰자리의 꼬리 부분에 있는 일곱 개의 별이에요.', '작은곰자리의 꼬리 부분에 있는 북극성은 정확한 북쪽 부근에서 위치가 거의 변하지 않아요.', '초승달 → 상현달 → 보름달 → 하현달 → 그믐달', '그믐달을 본 뒤 며칠이 지나면 다시 초승달을 볼 수 있어요.', '고리가 있는 행성은 목성, 토성, 천왕성, 해왕성이고, 없는 행성은 수성, 금성, 지구, 화성이에요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('오개념 장 「틀린 생각」이 판정과 반대 — 천체 차시 여섯(l02·l03·l04·l06·l10·l11) 전부 검산기에 잡힘', () => ['u1_l02', 'u1_l03', 'u1_l04', 'u1_l06', 'u1_l10', 'u1_l11'].forEach(k => ok(sayCheck(L[k].slides[7].data.wrong).bad.length >= 1, k + ' 「' + L[k].slides[7].data.wrong + '」')));
T('원문 일부러 틀린 보기도 판정과 반대 — 「행성도 별처럼 스스로 빛을 내요」(l06) · 「태양계의 중심에는 지구가 있어요」(l11) · 「달의 바다에는 물이 가득 차 있어요」(l02) 를 잡음', () => { ok(sayCheck('행성도 별처럼 스스로 빛을 내요').bad.length >= 1, 'l06'); ok(sayCheck('태양계의 중심에는 지구가 있어요').bad.length >= 1, 'l11'); ok(sayCheck('달의 바다에는 물이 가득 차 있어요').bad.length >= 1, 'l02'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체 · 「결」은 원문 교과 낱말(결과·연결·결정) 안에서만 · 생성기 교사 층(T 표) 「결」 0', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4s2_science_u1.js'), 'utf8').replace(JSON.stringify(L.u1_l01.slides[1].data.items), ''); /* l01 복습 문항 = 4-1 과학 u4_l12 출구 그대로(계보) — 그 단원 낱말 「해결」은 여기서 보지 않음 */ ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); const bad = (t.match(/.?결.?/g) || []).filter(x => !/결과|연결|결정/.test(x)); ok(!bad.length, '「결」 ' + bad.join(' '));
  const g = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_science_u1.js'), 'utf8'); const tt = g.slice(g.indexOf('const T = {'), g.indexOf('const TYPE = {')); ok(tt.indexOf('결') < 0, 'T 표에 「결」'); });

console.log('\n게이트 g4s2 과학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
