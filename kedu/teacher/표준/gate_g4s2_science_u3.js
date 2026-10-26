/* gate_g4s2_science_u3.js — 4학년 2학기 과학 3단원 「여러 가지 기체」 케이티처 2세대 게이트 (206차, 베프 — gate_g4s2_science_u2 틀 + 기체 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(재료 키 = 차시 번호 · file_key ↔ 원문 파일 · 차시 = 원문 머리 주석 「N/11차시」(l06 「6~7/11 연차시」 · l07 「8~9/11」) ·
     머리에 차시가 없는 l04·l05 = 핸드오프 _PLAN.md 차시 표 4/11·5/11 · 성취기준 = 원문 주석 있으면 그대로, 없는 l10·l11 = 배정)
   B 19장 · C 7요소 · D 복습 계보(4-2 과학 u2_l10 → l01 → … → l11)
   E 정답 표시(원문 그대로) · F 원문 계승(시뮬 ①② 카드 = 원문 시뮬 함수 본문 글 토막 · 도감 = 원문 이름·결과 줄 「— 」 뒤 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문 · 말풍선 = 원문 bub · 오개념 = 원문 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문(80분 묶음 60~88) · L 선행 용어(원문 첫 등장 차시보다 앞서 학생 화면에 안 나옴)
   M 기체 판정(온도·압력 → 부피 방향 · 공기 넣기·빼기 → 무게 방향 · 원문 판 넷·도감 둘·문항 통 나누기 검산 · 질소/산소/이산화 탄소/헬륨 성질 · 「적게」≠「전혀」 · 학생 화면 서술 검산 + 검산기 자체 확인) · N 차단 어휘
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_science_u3.js */
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
const L = load(path.join(TDIR, 'data/g4s2_science_u3.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_science_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_science_u3.json'), 'utf8'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05', 'u3_l06', 'u3_l08', 'u3_l10', 'u3_l11'];
const DIR = path.join(ROOT, 'grade4/semester2/science/3단원_여러가지기체');
/* 원문 시뮬 ①은 전부 pose 틀(steps 표) — items 표가 없으면 sim 으로 본다 */
const kindOf = (sl) => (sl.kind === 'pose' && !(sl.data && sl.data.items)) ? 'sim' : sl.kind;
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '여러 가지 기체';
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasiOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/\(\**(\d+(?:~\d+)?)\/11(?: ?연?차시|\))/); return m ? m[1] : ''; };
const PLAN = { u3_l04: '4', u3_l05: '5' }; /* 머리에 차시가 없는 두 파일 — 핸드오프 kedu/curriculum/science/g4/s2_unit3/_PLAN.md 차시 표 */
const chasi = (k) => chasiOf(k) || PLAN[k] || '';
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/성취기준 (\[[^\]]+\])/); return m ? m[1] : ''; };
const expandStd = (s) => { const m = s.match(/^\[4과15-(.+)\]$/); return m ? m[1].split('·').map(x => '[4과15-' + x + ']').join('') : s; };
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
T('9차시 키(묶음 6·7 → l06 · 8·9 → l08 · 원문 파일 l01~l09 = 1·2·3·4·5·6~7·8~9·10·11차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS) && JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u3_l01~u3_l09 · 빠짐·겹침 0) · 원문 폴더 파일 9개 전부', () => { ok(KEYS.map(k => L[k].meta.src_key).join() === 'u3_l01,u3_l02,u3_l03,u3_l04,u3_l05,u3_l06,u3_l07,u3_l08,u3_l09', KEYS.map(k => L[k].meta.src_key).join()); ok(fs.readdirSync(DIR).filter(f => /^g4_sci_u3_l\d+_.*\.html$/.test(f)).length === 9, '원문 폴더'); KEYS.forEach(k => ok(SRC[k].file_key === L[k].meta.src_key, k)); });
T('원문 머리 주석 차시 = 1·2·3·(없음)·(없음)·6~7·8~9·10·11 · 없는 둘은 계획 표 4·5 · 재료 n 과 같음', () => { ok(KEYS.map(chasiOf).join() === '1,2,3,,,6~7,8~9,10,11', KEYS.map(chasiOf).join()); ok(KEYS.map(chasi).join() === KEYS.map(k => SRC[k].n).join() && KEYS.every(k => SRC[k].of === 11), KEYS.map(k => SRC[k].n).join()); });
T('meta: 4학년 2학기 · unit 3 · unit_title · covers·분 = 원문 차시 · 학습 목표 = 원문 · live_url 실파일 · 합 440분', () => { let sum = 0; KEYS.forEach(k => { const m = L[k].meta, c = range(chasi(k));
  ok(m.grade === 4 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); sum += m.duration_min; ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표'); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.source === 'grade4/semester2/science/3단원_여러가지기체/' + SRC[k].file, k + ' source'); }); ok(sum === 440, '합 ' + sum); });
T('성취기준 — 원문 주석에 있는 차시(l01~l08)는 그대로 · 없는 l10(비행선) = 03·04 · l11(단원 마무리) = 넷', () => { KEYS.forEach(k => { const s = stdOf(k); const m = L[k].meta.std; ok(/^(\[4과15-0[1234]\])+$/.test(m), k + ' std ' + m); if (s) ok(m === expandStd(s), k + ' 원문 ' + s + ' ≠ ' + m); });
  ok(KEYS.filter(k => stdOf(k)).join() === KEYS.slice(0, 7).join(), '원문 주석 차시가 바뀜 — 확인'); ok(L.u3_l10.meta.std === '[4과15-03][4과15-04]' && L.u3_l11.meta.std === '[4과15-01][4과15-02][4과15-03][4과15-04]', '배정'); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u2_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-2 과학 u2_l10') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_science:u2_l10'), 'from ' + rv.from); }));
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
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (셋 쓰임 · 모두 고르기 6칩은 넘침 단골이라 기본 문제에서 뺌)', () => ok(nMcq >= 8 && nCls >= 6 && nMt >= 8 && nMs === 0, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
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
T('개념 4장 = 원문 3·4·5·6 — 3 = 진행형 시뮬(전 차시 · steps 표) · 4 = 도감(l01·l05·l06·l11) 또는 판(sim) · 5·6 = 정리 카드(말풍선 전부)', () => KEYS.forEach(k => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : kindOf(s)).join();
  ok(sk === (['u3_l01', 'u3_l05', 'u3_l06', 'u3_l11'].indexOf(k) >= 0 ? 'sim,feat,cards,cards' : 'sim,sim,cards,cards'), k + ' 원문 꼴 ' + sk); ok(SRC[k].slides[3].data.steps && SRC[k].slides[3].data.steps.length >= 3, k + ' 진행형 steps'); ok(SRC[k].slides.slice(3, 7).every(s => !(s.data && s.data.items)), k + ' 원문에 items 표가 생김 — poseFig 로 바꿀 것'); ok(SRC[k].slides.slice(5, 7).every(s => s.text), k + ' 정리 장 말풍선 비어 있음'); }));
T('원문 머리 주석에 「오개념」 줄 없음 → 전 차시 틀린 보기에서 세움(주석이 생기면 그쪽으로 바꿀 것)', () => KEYS.forEach(k => ok(!SRC[k].notes.some(n => /^오개념/.test(n)), k)));
T('동기 장 물음 = 원문 예상 장(recall)과 같은 물음 — 원문 예상 장의 핵심 낱말이 동기 물음에 있음', () => KEYS.forEach(k => { const r = plain(SRC[k].slides[2].recall); const q = plain(L[k].slides[2].data.question); const words = (r.match(/[가-힣]{2,}/g) || []).filter(w => w.length >= 3); ok(words.some(w => q.indexOf(w) >= 0), k + ' 동기 물음이 원문 예상과 동떨어짐'); }));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => { ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name); ok(s.src === 5 || s.src === 6 || (it.kind || '').length <= 40, s.id + ' 카드 아래 줄 너무 김 ' + it.kind); /* 5·6 = 원문 정리 카드 글 그대로 */ });
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); } })));
T('부품 가짓수 3 (카드·차례·기준 갈래) · chain 9 (진행형 ③ 전부) · ask 3 (l01 공기가 이동하나요 · l05 온도가 달라졌나요 · l06 타는 것을 돕나요)', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 3 && cnt.chain === 9 && cnt.ask === 3, JSON.stringify(cnt)); });

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
const TERMS = ['무게', '전자저울', '감압 용기', '공기 주입 마개', '부피', '포일 풍선', '머리 말리개', '열기구', '압력', '피스톤', '호핑볼', '에어 매트', '비치 볼', '출처', '질소', '산소', '이산화 탄소', '수소', '소화기', '탄산음료', '시럽', '유토', '약병', '헬륨', '비행선', '활주로', '비행체', '친환경', '환경오염'];
const firstSrc = (w0) => KEYS.findIndex(k => srcTxt(k).indexOf(w0) >= 0);
T('원문 첫 등장 차시 표 — ' + TERMS.map(w0 => w0 + ' ' + (KEYS[firstSrc(w0)] || '-').slice(-3)).join(' · '), () => TERMS.forEach(w0 => ok(firstSrc(w0) >= 0, w0 + ' 원문에 없음')));
TERMS.forEach(w0 => T('「' + w0 + '」 학생 화면 첫 등장 ≥ 원문 첫 등장(' + KEYS[firstSrc(w0)] + ')', () => { const i0 = firstSrc(w0); KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id + ' 에 「' + w0 + '」')); }); }));
T('선행 검사기 자체 확인 — l02 장에 「압력」을 심으면 잡는다', () => { const s = L.u3_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 압력'; let caught = false; const i0 = firstSrc('압력'); try { KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(x => ok(vis(x).indexOf('압력') < 0)); }); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });

console.log('═══ M. 기체 판정 검산 ═══');
/* 판정 규칙(원문 정리 줄 그대로): 온도 ↑ → 부피 ↑ · 온도 ↓ → 부피 ↓ · 압력 ↑ → 부피 ↓ · 압력 ↓ → 부피 ↑ · 공기 넣기 → 무게 ↑ · 빼기 → 무게 ↓ */
const LAW = { '온도+': 'up', '온도-': 'down', '압력+': 'down', '압력-': 'up' };
const dirWord = (t) => /늘어|팽팽|부풀|올라가|커/.test(t) ? 'up' : /줄어|쭈그러|찌그러|납작|오목|움푹|내려가|작아/.test(t) ? 'down' : null;
/* 상황 글 → [원인, 방향] — 원문 문항 통 나누기 · 도감 · 판 검산용 */
const causeOf = (t0) => { const t = nb(t0); let m = t.match(/(온도|압력)(?:이|가)? (높아|낮아)/); if (m) return m[1] + (m[2] === '높아' ? '+' : '-');
  if (/피스톤을 (눌|누르)|세게 (친|쳐|찼|찬|차)|앉|짐을|뛰어내리|땅을 디딜|피스톤을 눌렀/.test(t)) return '압력+'; if (/피스톤을 당|뛰어오르/.test(t)) return '압력-';
  if (/가열|따뜻|햇빛|땡볕|뜨거운|열을 가|창가/.test(t)) return '온도+'; if (/얼음|냉장고|추운|겨울|그늘|차갑/.test(t)) return '온도-'; return null; };
const wgtOf = (t) => /(빼내|빼낸|빼면|뺀|빼요|빼 )/.test(t) ? 'down' : /(넣은|넣으면|넣어요|넣어)/.test(t) ? 'up' : null;
const P = (k, i) => SRC[k].problems[i];
T('판정 규칙 자체 확인 — 원문 정리 줄(l03·l04·l11)과 같은 방향', () => { ok(SRC.u3_l03.summary.join().indexOf('온도가 높아지면 기체의 부피가 **늘어나요**') >= 0 && SRC.u3_l03.summary.join().indexOf('온도가 낮아지면 기체의 부피가 **줄어들어요**') >= 0, 'l03'); ok(SRC.u3_l04.summary.join().indexOf('압력이 높아지면 기체의 부피가 **줄어들어요**') >= 0 && SRC.u3_l04.summary.join().indexOf('압력이 낮아지면 기체의 부피가 **늘어나요**') >= 0, 'l04');
  ok(LAW['온도+'] === 'up' && LAW['온도-'] === 'down' && LAW['압력+'] === 'down' && LAW['압력-'] === 'up', '표'); });
const SB = SRC.u3_l02.slides[4].data.SIDE; const gram = (t) => +String(t).match(/([\d.]+) g/)[1];
T('원문 무게 판(l02 ②) — 넣은 뒤 > 처음 · 뺀 뒤 < 처음(숫자) · 글 「늘어났어요 / 줄어들었어요」와 같음 · 케이티처 카드 같은 숫자', () => { ok(gram(SB.in.after) > gram(SB.in.before) && /늘어났/.test(SB.in.after), 'in'); ok(gram(SB.out.after) < gram(SB.out.before) && /줄어들었/.test(SB.out.after), 'out');
  const it = L.u3_l02.slides[4].data.fig.items; ok(it[0].kind.indexOf(String(gram(SB.in.after))) >= 0 && /늘어/.test(it[0].kind) && it[1].kind.indexOf(String(gram(SB.out.after))) >= 0 && /줄어/.test(it[1].kind), '카드'); });
const boards = [['u3_l03', 'vol', ['warm', 'cold']], ['u3_l04', 'air', ['push', 'pull']], ['u3_l08', 'vol', ['warm', 'cold']]];
T('원문 부피 판(l03 온도 · l04 압력 · l08 시럽) — 한 일의 원인 → 판정 규칙 방향 = 판의 부피 줄 · l04 풍선 줄 · l08 시럽 위치(부피 늘면 올라감)', () => boards.forEach(([k, f, ids]) => { const SD = SRC[k].slides[4].data.SIDE; ids.forEach(id => { const c = causeOf(SD[id].name); ok(c, k + ' ' + id + ' 원인 못 읽음'); ok(dirWord(SD[id][f].split(' — ')[1]) === LAW[c], k + ' ' + id + ' ' + SD[id][f]);
  if (SD[id].bal) ok(dirWord(SD[id].bal.split(' — ')[1]) === LAW[c], k + ' 풍선'); if (SD[id].pos) ok((LAW[c] === 'up') === /올라가/.test(SD[id].pos), k + ' 시럽'); }); }));
T('케이티처 판 카드(l03 · l04 · l08) — 카드 이름의 원인 → 아래 줄 방향이 판정 규칙과 같음', () => [['u3_l03', 2], ['u3_l04', 2], ['u3_l08', 2]].forEach(([k, n]) => { const it = L[k].slides[4].data.fig.items; for (let i = 0; i < n; i++) { const c = causeOf(it[i].name); ok(c, k + ' ' + it[i].name); ok(dirWord(it[i].kind) === LAW[c], k + ' ' + it[i].name + ' — ' + it[i].kind); } }));
const AD = SRC.u3_l01.slides[4].data.data;
T('케이티처 l01 두 갈래 「공기가 이동하는 모습인가요?」 = 원문 문항 p5 두 칸(📦 안에 들어 있어요 / ➡️ 이동해요) — 공 · 튜브 = 들어 있음 · 공기 주입기 · 부채질 = 이동', () => { const f = L.u3_l01.slides[4].data.fig; ok(f.k === 'ask' && f.yes.map(x => x.name).join() === '자전거 타이어,부채질' && f.no.map(x => x.name).join() === '공과 튜브', JSON.stringify(f.yes) + JSON.stringify(f.no)); const q = P('u3_l01', 5); ok(q.items.filter(it => it.bin === 'move').map(it => it.t).join().match(/부채질/) && q.items.filter(it => it.bin === 'move').map(it => it.t).join().match(/타이어/) && q.items.filter(it => it.bin === 'in').every(it => /공|튜브/.test(it.t)), '원문 p5'); ok(/이동/.test(AD.tire.feats[1]) && /이동/.test(AD.fan.feats[1]) && !/이동/.test(AD.ball.feats[1]), '원문 도감'); });
const CD = SRC.u3_l05.slides[4].data.data;
T('원문 생활 속 도감(l05 ②) — 그림마다 까닭 줄(온도/압력 · 높아/낮아) → 판정 규칙 = 부피 줄 방향 · 온도 둘(㉮·㉱) · 압력 둘(㉯·㉰)', () => { Object.keys(CD).forEach(id => { const f = CD[id].feats; const c = causeOf(f[2]); ok(c, id); ok(dirWord(f[1].split(' — ')[1]) === LAW[c], id + ' ' + f[1]); }); ok(Object.keys(CD).filter(id => /온도/.test(CD[id].feats[2])).join() === 'ga,ra', '온도 둘'); });
T('케이티처 l05 두 갈래 「온도가 달라졌나요?」 — 예 = 까닭 줄이 온도인 그림 · 아니요 = 압력', () => { const f = L.u3_l05.slides[4].data.fig; const want = (re) => Object.keys(CD).filter(id => re.test(CD[id].feats[2])).map(id => CD[id].name).join(); ok(f.k === 'ask' && f.yes.map(x => x.name).join() === want(/온도/) && f.no.map(x => x.name).join() === want(/압력/), JSON.stringify(f.yes) + JSON.stringify(f.no)); });
const GD = SRC.u3_l06.slides[4].data.data;
T('원문 세 기체 도감(l06 ②) — 질소 = 안정된 · 포장 / 산소 = 타는 것을 돕 · 호흡 / 이산화 탄소 = 톡 쏘는 · 타는 것을 막 · 소화기', () => { ok(/안정된/.test(GD.n2.feats[1]) && /포장/.test(GD.n2.feats[2]), '질소'); ok(/타는 것을 돕/.test(GD.o2.feats[1]) && /호흡/.test(GD.o2.feats[1]), '산소'); ok(/톡 쏘는/.test(GD.co2.feats[1]) && /타는 것을 막/.test(GD.co2.feats[1]) && /소화기/.test(GD.co2.feats[2]), '이산화 탄소'); });
T('케이티처 l06 두 갈래 「다른 물질이 타는 것을 돕나요?」 — 예 = 산소 하나 · 아니요 = 질소 · 이산화 탄소', () => { const f = L.u3_l06.slides[4].data.fig; ok(f.k === 'ask' && f.yes.map(x => x.name).join() === Object.keys(GD).filter(id => /타는 것을 돕/.test(GD[id].feats[1])).map(id => GD[id].name).join() && f.no.map(x => x.name).join() === '질소,이산화 탄소', JSON.stringify(f.yes) + JSON.stringify(f.no)); });
const KB = SRC.u3_l10.slides[4].data.SIDE;
T('원문 비행기·비행선 판(l10 ②) — 비행선 엔진 = 「적게」(「전혀」 0) · 비행기 = 많이 · 활주로 / 케이티처 카드 「적게」', () => { ok(/적게/.test(KB.ship.eng) && !/전혀/.test(KB.ship.eng) && /많이/.test(KB.plane.eng), '원문'); const it = L.u3_l10.slides[4].data.fig.items; ok(it.some(x => x.name === '엔진' && /적게/.test(x.kind)) && !JSON.stringify(it).match(/전혀/), '카드'); });
T('원문 문항 통 나누기 — 늘어/줄어 · 온도/압력 · 올라/내려 통에 든 상황이 판정 규칙과 같음(l02·l03·l04·l05·l08·l10 아님·l11)', () => { let n = 0; KEYS.forEach(k => SRC[k].problems.filter(q => q.kind === 'cls').forEach(q => { const ids = q.bins.map(b => b.id).join(); q.items.forEach(it => {
  if (ids === 'up,down' || ids === 'in,out') { const t = it.t; const w = /무게/.test(t) || k === 'u3_l02' ? wgtOf(t) : null; const c = w ? null : causeOf(t); const d = w || (c ? LAW[c] : dirWord(t)); ok(d, k + ' 못 읽음 ' + t); ok((it.bin === 'up' || it.bin === 'in') === (d === 'up'), k + ' ' + t + ' → ' + it.bin); n++; }
  else if (ids === 'temp,press') { const c = causeOf(it.t); ok(c && c.slice(0, 2) === (it.bin === 'temp' ? '온도' : '압력'), k + ' ' + it.t); n++; } }); })); ok(n >= 24, '검산 ' + n); });
T('원문 하나 고르기 정답 — 부피 방향을 묻는 문항의 정답이 판정 규칙과 같음(l03 냉장고 페트병 · l04 피스톤·운동화 · l05 짐·그늘 · l08 창가 · l11 얼음 수조)', () => { [['u3_l03', 6], ['u3_l04', 2], ['u3_l04', 6], ['u3_l05', 0], ['u3_l05', 2], ['u3_l05', 6], ['u3_l08', 2], ['u3_l11', 2]].forEach(([k, i]) => { const q = P(k, i); const c = causeOf(q.t + ' ' + q.opts[q.ci]); ok(c, k + ' p' + i); ok(dirWord(q.opts[q.ci].replace(/^.*?(부피|위치)/, '')) === LAW[c] || dirWord(q.opts[q.ci]) === LAW[c], k + ' p' + i + ' ' + q.opts[q.ci]); }); });
/* 학생 화면 서술 검산(문장 단위): 오개념 장 틀린 생각 칸 · 기본 문제 틀린 보기·통·짝 · ✗ 표시 풍선(원문 고치기 놀이)은 빼고 본다 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|\s\/\s|","|":"|\["|"\]/).map(x => x.replace(/\\?"/g, '').trim()).filter(Boolean);
const NEG2 = /않|아니|못|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/;
const NEG3 = /아니|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/; /* 틀린 생각 자체에 「않」이 든 자리 */
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x0 => {
  if (/✗|라고 (말|적|썼|나누)|라는 문장|틀린 (문장|줄)|줄 알았|생각하기 쉬워|라고만/.test(x0)) return;
  const x = x0.replace(/이산화 탄소/g, 'CO2');
  if (/온도가 (높아지|올라가)[^,.]{0,25}부피가 (줄어|작아)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/온도가 낮아지[^,.]{0,25}부피가 (늘어|커)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/압력이 높아지[^,.]{0,25}부피가 (늘어|커)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/압력이 낮아지[^,.]{0,25}부피가 (줄어|작아)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(빼면|빼내면|뺀 뒤|빠지면)[^,.]{0,20}무게가 (늘어|무거워)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(넣으면|넣은 뒤)[^,.]{0,20}무게가 (줄어|가벼워)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(기체|공기)(는|도|에는)? [^.]{0,20}무게가 없/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/눈으로 보아야만/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/바람이 풍선 안으로 들어가/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/닿지 않은[^.]{0,20}부피가 달라지지 않/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/같으면 까닭도[^.]{0,6}같/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(^|[^가-힣])산소(는|가) [^.]{0,10}반응을 거의 하지 않/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/(^|[^가-힣])산소[^.]{0,15}(타는 것을 막|톡 쏘)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/CO2[^.]{0,15}타는 것을 (돕|도와|도우)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/질소[^.]{0,15}(타는 것을 (돕|도와|도우)|톡 쏘|호흡에 필요)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/소화기[^.]{0,10}(^|[^가-힣])?산소를 (이용|넣)/.test(x) && !/CO2/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/헬륨[^.]{0,20}(공기보다 무거|무거운 기체)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/엔진을 전혀 (사용하지|쓰지) 않/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/특별한 기체를 따로 넣어야/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(창가|따뜻한 곳)[^.]{0,30}시럽[^.]{0,12}내려/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/냉장고[^.]{0,30}시럽[^.]{0,12}올라/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(부피|무게|압력|온도|질소|산소|CO2|헬륨|비행선|시럽)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; let d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined;
  if (d.fig) d.fig = d.fig.k === 'ask' ? d.fig.q + ' / ' + d.fig.yes.map(x => x.name).join(' · ') + ' — ' + (d.fig.ya || '') + ' / ' + d.fig.no.map(x => x.name).join(' · ') + ' — ' + (d.fig.na || '') + ' / ' + (d.fig.note || '') : d.fig.items.filter(it => it.emoji !== '❌').map(it => it.name + ' — ' + (it.kind || '')).join(' / ');
  if (s.block === 'basic_problem') d = { title: d.title, question: d.question, note: d.note, options: (d.options || []).filter(o => o.correct).map(o => o.text) }; return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v || '')).join('\n'); };
T('학생 화면 서술이 기체 판정과 어긋나지 않음 — 온도·압력 → 부피 방향 · 넣기·빼기 → 무게 · 기체 무게 없음 · 바람이 들어감 · 닿지 않은 풍선 · 같은 까닭 · 질소/산소/이산화 탄소 성질 · 헬륨 무거움 · 엔진 전혀 · 특별한 기체 · 시럽 방향 (전수 · 오개념 틀린 칸·틀린 보기·✗ 풍선 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 120, '검산 대상 ' + n); });
T('검산기 자체 확인 — 틀린 문장 열여덟을 잡고 바른 문장 열여덟은 지나간다', () => {
  ['온도가 높아지면 기체의 부피가 줄어들어요.', '온도가 낮아지면 기체의 부피가 늘어나요.', '압력이 높아지면 기체의 부피가 늘어나요.', '압력이 낮아지면 기체의 부피가 줄어들어요.', '감압 용기에서 공기를 빼면 무게가 늘어나요.', '페트병에 공기를 넣으면 무게가 줄어들어요.', '공기와 같은 기체는 무게가 없어요.', '기체는 눈으로 보아야만 있다는 것을 알 수 있어요.', '머리 말리개의 바람이 풍선 안으로 들어가서 부풀어요.', '피스톤에 닿지 않은 풍선은 부피가 달라지지 않아요.', '줄어든 모습이 같으면 까닭도 모두 같아요.', '산소는 반응을 거의 하지 않는 안정된 성질이 있어요.', '산소는 다른 물질이 타는 것을 막아요.', '이산화 탄소는 다른 물질이 타는 것을 도와요.', '질소는 생물의 호흡에 필요해요.', '헬륨은 공기보다 무거운 기체예요.', '비행선은 엔진을 전혀 사용하지 않아요.', '장치를 따뜻한 창가에 두면 시럽이 내려가요.'].forEach(x => ok(sayCheck(x).bad.length >= 1, '못 잡음 ' + x));
  ['온도가 높아지면 기체의 부피가 늘어나고, 온도가 낮아지면 기체의 부피가 줄어들어요.', '압력이 높아지면 기체의 부피가 줄어들고, 압력이 낮아지면 기체의 부피가 늘어나요.', '공기를 넣으면 용기의 무게가 늘어나고, 공기를 빼면 용기의 무게가 줄어들어요.', '눈에 보이지 않는 기체도 무게가 있어요.', '포일 풍선은 입구를 잘 닫았기 때문에 바람이 안으로 들어가지 못해요.', '피스톤에 닿지 않은 풍선도 부피가 줄어들어요.', '부피가 줄어든 모습이 같아도 까닭은 다를 수 있어요.', '질소는 반응을 거의 하지 않는 안정된 성질이 있어요.', '산소는 다른 물질이 타는 것을 돕고 생물의 호흡에 필요해요.', '이산화 탄소는 다른 물질이 타는 것을 막는 성질이 있어 소화기에 이용해요.', '불을 끄는 소화기에는 이산화 탄소를 이용해요.', '헬륨 기체는 같은 부피의 공기보다 가벼워요.', '비행선은 비행기에 비해 엔진을 적게 사용해요.', '특별한 기체를 따로 넣지 않아도 공기만으로 시럽이 움직여요.', '장치를 냉장고 안에 넣으면 시럽이 내려가요.', '따뜻한 창가에 두면 시럽의 위치가 올라가요.', '공기를 빼지 않았으므로 무게는 달라지지 않아요.', '온도가 낮아져 공 안 공기의 부피가 줄어들어요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('오개념 장 「틀린 생각」이 판정과 반대 — 아홉 차시 전부 검산기에 잡힘', () => KEYS.forEach(k => ok(sayCheck(L[k].slides[7].data.wrong).bad.length >= 1, k + ' 「' + L[k].slides[7].data.wrong + '」')));
T('원문 일부러 틀린 보기도 판정과 반대 — 「기체는 무게가 없어요」(l02) · 「압력이 높아지면 기체의 부피가 늘어나요」(l11) · 「비행선은 엔진을 전혀 사용하지 않아요」(l10) · 「불을 끄는 소화기에 산소를 이용할 수 있어요」(l08) 를 잡음', () => { ['기체는 무게가 없어요', '압력이 높아지면 기체의 부피가 늘어나요', '비행선은 엔진을 전혀 사용하지 않아요', '불을 끄는 소화기에 산소를 이용할 수 있어요'].forEach(x => ok(sayCheck(x).bad.length >= 1, x)); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체 · 「결」은 원문 교과 낱말(결과·연결·결정·해결) 안에서만 · 생성기 교사 층(T 표) 「결」 0', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4s2_science_u3.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); const bad = (t.match(/.?결.?/g) || []).filter(x => !/결과|연결|결정|해결/.test(x)); ok(!bad.length, '「결」 ' + bad.join(' '));
  const g = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_science_u3.js'), 'utf8'); const tt = g.slice(g.indexOf('const T = {'), g.indexOf('const TYPE = {')); ok(tt.indexOf('결') < 0, 'T 표에 「결」'); });
T('「해결」은 원문 교과 문장 자리에만 — 학습 목표 · 정리 카드 ⑤⑥ · 기본 문제 · 정리 줄 가운데 원문에 「해결」이 있는 자리 (교사 층 0)', () => { const where = []; KEYS.forEach(k => { if (/해결/.test(L[k].meta.goal)) { ok(SRC[k].goal.some(g => /해결/.test(g)), k + ' goal'); where.push(k + ' goal'); } L[k].slides.forEach(s => { const d = JSON.stringify(Object.assign({}, s.data, { tnote: undefined })); if (!/해결/.test(d)) return; where.push(k + ' ' + s.id); const src = s.block === 'concept' ? JSON.stringify(SRC[k].slides[s.src].cards) + SRC[k].slides[s.src].text : s.block === 'basic_problem' ? JSON.stringify(SRC[k].problems[+s.src.slice(1)]) : s.block === 'summary' ? JSON.stringify(SRC[k].summary) : ''; ok(/해결/.test(src) && (s.block !== 'concept' || s.src >= 5), k + ' ' + s.id + ' 원문 자리 아님'); ok(!/해결/.test(JSON.stringify(s.data.tnote || '')), k + ' ' + s.id + ' 발문'); }); }); ok(where.length <= 8, where.join()); /* 3단원은 고른 원문 자리에 「해결」이 없어 0 */ });

console.log('\n게이트 g4s2 과학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
