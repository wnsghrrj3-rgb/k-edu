/* gate_g4s2_science_u2.js — 4학년 2학기 과학 2단원 「생물과 환경」 케이티처 2세대 게이트 (205차, 베프 — gate_g4s2_science_u1 틀 + 생태계 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(재료 키 = 차시 번호 · file_key ↔ 원문 파일 · 차시 = 원문 머리 주석 「N/10차시」(l04 「4~5/10 연차시」) · 성취기준 = 원문 주석 있으면 그대로, 없는 l10 = 셋)
   B 19장 · C 7요소 · D 복습 계보(4-2 과학 u1_l11 → l01 → … → l10)
   E 정답 표시(원문 그대로) · F 원문 계승(시뮬 ①② 카드 = 원문 시뮬 함수 본문 글 토막 · 도감 = 원문 이름·결과 줄 「— 」 뒤 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문 · 말풍선 = 원문 bub(l09 ⑥ 은 원문 말풍선 없음) · 오개념 = 원문 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문(80분 묶음 60~88) · L 선행 용어(원문 첫 등장 차시보다 앞서 학생 화면에 안 나옴)
   M 생태계 판정(생물요소/비생물요소 · 생산자/소비자/분해자 · 먹이 화살표 방향 · 환경오염 가짓수 · 숲의 미로 · 곤충/가축 · 학생 화면 서술 검산 + 검산기 자체 확인) · N 차단 어휘
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_science_u2.js */
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
const L = load(path.join(TDIR, 'data/g4s2_science_u2.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_science_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_science_u2.json'), 'utf8'));
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l04', 'u2_l06', 'u2_l07', 'u2_l09', 'u2_l10'];
const DIR = path.join(ROOT, 'grade4/semester2/science/2단원_생물과환경');
/* 원문 시뮬 ①은 전부 pose 틀(steps 표) — items 표가 없으면 sim 으로 본다 */
const kindOf = (sl) => (sl.kind === 'pose' && !(sl.data && sl.data.items)) ? 'sim' : sl.kind;
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '생물과 환경';
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasiOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/\(\**(\d+(?:~\d+)?)\/10 ?연?차시/); return m ? m[1] : ''; };
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/성취기준 (\[[^\]]+\])/); return m ? m[1] : ''; };
const expandStd = (s) => { const m = s.match(/^\[4과14-(.+)\]$/); return m ? m[1].split('·').map(x => '[4과14-' + x + ']').join('') : s; };
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
T('8차시 키(묶음 4·5 → l04 · 7·8 → l07 · 원문 파일 l01~l08 = 1·2·3·4~5·6·7~8·9·10차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS) && JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u2_l01~u2_l08 · 빠짐·겹침 0) · 원문 폴더 파일 8개 전부', () => { ok(KEYS.map(k => L[k].meta.src_key).join() === 'u2_l01,u2_l02,u2_l03,u2_l04,u2_l05,u2_l06,u2_l07,u2_l08', KEYS.map(k => L[k].meta.src_key).join()); ok(fs.readdirSync(DIR).filter(f => /^g4_sci_u2_l\d+_.*\.html$/.test(f)).length === 8, '원문 폴더'); KEYS.forEach(k => ok(SRC[k].file_key === L[k].meta.src_key, k)); });
T('원문 머리 주석 차시 = 1·2·3·4~5·6·7~8·9·10 (l04 = 「(**4~5/10 연차시」 꼴)', () => ok(KEYS.map(chasiOf).join() === '1,2,3,4~5,6,7~8,9,10', KEYS.map(chasiOf).join()));
T('meta: 4학년 2학기 · unit 2 · unit_title · covers·분 = 원문 차시 · 학습 목표 = 원문 · live_url 실파일 · 합 400분', () => { let sum = 0; KEYS.forEach(k => { const m = L[k].meta, c = range(chasiOf(k));
  ok(m.grade === 4 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); sum += m.duration_min; ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표'); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.source === 'grade4/semester2/science/2단원_생물과환경/' + SRC[k].file, k + ' source'); }); ok(sum === 400, '합 ' + sum); });
T('성취기준 — 원문 주석에 있는 차시(l01~l09)는 그대로 · 없는 l10(단원 마무리) = 셋', () => { KEYS.forEach(k => { const s = stdOf(k); const m = L[k].meta.std; ok(/^(\[4과14-0[123]\])+$/.test(m), k + ' std ' + m); if (s) ok(m === expandStd(s), k + ' 원문 ' + s + ' ≠ ' + m); });
  ok(KEYS.filter(k => stdOf(k)).join() === KEYS.slice(0, 7).join(), '원문 주석 차시가 바뀜 — 확인'); ok(L.u2_l10.meta.std === '[4과14-01][4과14-02][4과14-03]', '배정'); });
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u1_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-2 과학 u1_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_science:u1_l11'), 'from ' + rv.from); }));
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
T('기본 문제 종류 — 하나 고르기 ' + nMcq + ' · 통 나누기 ' + nCls + ' · 짝 ' + nMt + ' · 모두 고르기 ' + nMs + ' (넷 다 쓰임)', () => ok(nMcq >= 8 && nCls >= 6 && nMt >= 6 && nMs >= 1, nMcq + '/' + nCls + '/' + nMt + '/' + nMs));
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
    else { ok(sl.cards, s.id + ' 원문 정리 카드 장 아님'); ok(norm(d.content) === norm(sl.text) && (d.content || (k === 'u2_l09' && s.src === 6)), s.id + ' 말풍선 원문 아님'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = cardSplit(sl.cards[i].label); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls[1], s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드 ' + it.name); }); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.kind === 'cls' ? q.items.filter(it => /^(no|bad)$/.test(it.bin)).map(it => it.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음');
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
T('개념 4장 = 원문 3·4·5·6 — 3 = 진행형 시뮬(전 차시 · steps 표) · 4 = 도감(l01·l03·l10) 또는 판(sim) · 5·6 = 정리 카드(말풍선 — l09 ⑥ 만 없음)', () => KEYS.forEach(k => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : kindOf(s)).join();
  ok(sk === (['u2_l01', 'u2_l03', 'u2_l10'].indexOf(k) >= 0 ? 'sim,feat,cards,cards' : 'sim,sim,cards,cards'), k + ' 원문 꼴 ' + sk); ok(SRC[k].slides[3].data.steps && SRC[k].slides[3].data.steps.length >= (k === 'u2_l09' ? 3 : 4), k + ' 진행형 steps'); ok(SRC[k].slides.slice(3, 7).every(s => !(s.data && s.data.items)), k + ' 원문에 items 표가 생김 — poseFig 로 바꿀 것'); ok(SRC[k].slides.slice(5, 7).every((s, i) => s.text || (k === 'u2_l09' && i === 1)), k + ' 정리 장 말풍선 비어 있음'); }));
T('원문 머리 주석에 「오개념」 줄 없음 → 전 차시 틀린 보기에서 세움(주석이 생기면 그쪽으로 바꿀 것)', () => KEYS.forEach(k => ok(!SRC[k].notes.some(n => /^오개념/.test(n)), k)));
T('동기 장 물음 = 원문 예상 장(recall)과 같은 물음 — 원문 예상 장의 핵심 낱말이 동기 물음에 있음', () => KEYS.forEach(k => { const r = plain(SRC[k].slides[2].recall); const q = plain(L[k].slides[2].data.question); const words = (r.match(/[가-힣]{2,}/g) || []).filter(w => w.length >= 3); ok(words.some(w => q.indexOf(w) >= 0), k + ' 동기 물음이 원문 예상과 동떨어짐'); }));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => { ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name); ok(s.src === 5 || s.src === 6 || (it.kind || '').length <= 40, s.id + ' 카드 아래 줄 너무 김 ' + it.kind); /* 5·6 = 원문 정리 카드 글 그대로 */ });
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); } })));
T('부품 가짓수 3 (카드·차례·기준 갈래) · chain 6↑ · ask 1↑ (l03 스스로 양분)', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length >= 3 && cnt.chain >= 6 && cnt.ask >= 1, JSON.stringify(cnt)); });

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
const TERMS = ['생태계', '생물요소', '비생물요소', '양분', '물곰팡이', '생산자', '소비자', '분해자', '배출물', '먹이사슬', '먹이그물', '화살표', '먹이 관계', '골리앗', '스라소니', '환경오염', '대기오염', '수질오염', '토양오염', '보전', '분리배출', '배기가스', '농약', '복원', '지킴이', '미로', '팻말', '온실 가스', '미래 식량', '누에'];
const firstSrc = (w0) => KEYS.findIndex(k => srcTxt(k).indexOf(w0) >= 0);
T('원문 첫 등장 차시 표 — ' + TERMS.map(w0 => w0 + ' ' + (KEYS[firstSrc(w0)] || '-').slice(-3)).join(' · '), () => TERMS.forEach(w0 => ok(firstSrc(w0) >= 0, w0 + ' 원문에 없음')));
TERMS.forEach(w0 => T('「' + w0 + '」 학생 화면 첫 등장 ≥ 원문 첫 등장(' + KEYS[firstSrc(w0)] + ')', () => { const i0 = firstSrc(w0); KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id + ' 에 「' + w0 + '」')); }); }));
T('선행 검사기 자체 확인 — l02 장에 「먹이그물」을 심으면 잡는다', () => { const s = L.u2_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 먹이그물'; let caught = false; const i0 = firstSrc('먹이그물'); try { KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(x => ok(vis(x).indexOf('먹이그물') < 0)); }); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });

console.log('═══ M. 생태계 판정 검산 ═══');
const NONLIVE = ['햇빛', '공기', '물', '흙', '온도'];
const PROD = ['소나무', '강아지풀', '부들', '벼', '검정말', '토끼풀', '도토리', '배추', '옥수수', '질경이', '갈대', '미역', '개망초'];
const DECO = ['곰팡이', '버섯', '세균', '물곰팡이'];
/* 먹고 먹히는 관계(먹히는 → 먹는) — 원문 먹이사슬·먹이그물·미로·마무리 그물 + 케이티처 교사 층에서 쓴 것 */
const EDGES = [['벼', '메뚜기'], ['메뚜기', '개구리'], ['개구리', '뱀'], ['뱀', '새매'], ['토끼풀', '토끼'], ['토끼', '여우'], ['여우', '호랑이'], ['도토리', '다람쥐'], ['다람쥐', '뱀'], ['옥수수', '메뚜기'], ['메뚜기', '참새'], ['참새', '새매'], ['강아지풀', '메뚜기'], ['질경이', '메뚜기'], ['메뚜기', '직박구리'], ['직박구리', '새매'], ['토끼', '스라소니'], ['메뚜기', '박새'], ['박새', '뱀'], ['개구리', '수리부엉이'], ['뱀', '수리부엉이'], ['박새', '수리부엉이'], ['진딧물', '무당벌레'], ['토끼풀', '메뚜기'], ['메뚜기', '거미']];
const ORG = Array.from(new Set([].concat.apply([], EDGES))).sort((a, b) => b.length - a.length);
const isEdge = (a, b) => EDGES.some(e => e[0] === a && e[1] === b);
/* 화살표 줄: 「A → B → C」에서 이웃 둘이 아는 관계를 거꾸로 가리키면 틀림 */
const arrowBad = (x) => { if (x.indexOf('→') < 0) return false; const parts = x.split('→').map(p => { const t = p.trim(); const hit = ORG.map(o => [t.lastIndexOf(o), o]).filter(a => a[0] >= 0); return { last: hit.length ? hit.sort((a, b) => b[0] - a[0] || b[1].length - a[1].length)[0][1] : null, first: (ORG.map(o => [t.indexOf(o), o]).filter(a => a[0] >= 0).sort((a, b) => a[0] - b[0] || b[1].length - a[1].length)[0] || [])[1] || null }; });
  for (let i = 1; i < parts.length; i++) { const a = parts[i - 1].last, b = parts[i].first; if (a && b && isEdge(b, a)) return true; } return false; };
const eb = SRC.u2_l02.slides[4].data.PLACE;
T('원문 두 칸 판(l02 ②) — 세 곳의 생물이 아닌 것 ⊂ 햇빛·공기·물·흙·온도 · 생물인 것에 그 다섯 0 · 분해자(세균·버섯·물곰팡이)는 생물인 것 칸', () => { Object.values(eb).forEach(p => { p.non.forEach(n => ok(NONLIVE.indexOf(n) >= 0, p.name + ' ' + n)); p.live.forEach(n => ok(NONLIVE.indexOf(n) < 0, p.name + ' ' + n)); }); ok(eb.forest.live.indexOf('세균') >= 0 && eb.forest.live.indexOf('버섯') >= 0 && eb.river.live.indexOf('물곰팡이') >= 0, '분해자 칸'); ok(['햇빛', '공기', '온도'].every(n => Object.values(eb).every(p => p.non.indexOf(n) >= 0)), '세 곳 모두 = 햇빛·공기·온도'); });
T('케이티처 l02 ② 카드 — 「햇빛, 공기, 온도가 세 곳 모두」 = 원문 표에서 다시 셈', () => { const it = L.u2_l02.slides[4].data.fig.items; ok(/햇빛, 공기, 온도가 세 곳 모두/.test(it[1].kind) && it[1].name === '생물이 아닌 것', it[1].kind); const common = NONLIVE.filter(n => Object.values(eb).every(p => p.non.indexOf(n) >= 0)); ok(common.join() === '햇빛,공기,온도', common.join()); });
const rd = SRC.u2_l03.slides[4].data.data;
T('원문 세 무리 도감(l03 ②) — 생산자 예 ⊂ 생산자 표 · 분해자 예 ⊂ 분해자 표 · 소비자 예는 둘 다 아님', () => { const ex = (f) => f.feats[2].split(' — ')[1].split(', '); ex(rd.prod).forEach(n => ok(PROD.indexOf(n) >= 0, n)); ex(rd.deco).forEach(n => ok(DECO.indexOf(n) >= 0, n)); ex(rd.cons).forEach(n => ok(PROD.indexOf(n) < 0 && DECO.indexOf(n) < 0, n)); });
T('케이티처 l03 두 갈래 「스스로 양분을 만드나요?」 — 예 = 생산자 하나 · 아니요 = 소비자 · 분해자', () => { const f = L.u2_l03.slides[4].data.fig; ok(f.k === 'ask' && f.yes.map(x => x.name).join() === '생산자' && f.no.map(x => x.name).join() === '소비자,분해자', JSON.stringify(f.yes) + JSON.stringify(f.no)); });
T('원문 문항의 무리 판정 — 어항(생산자 = 검정말 · 분해자 = 물곰팡이) · 곰팡이 = 분해 · 버섯 짝(분해자 칸 ↔ 곰팡이)', () => { const q = SRC.u2_l03.problems[6]; ok(/생산자는 검정말/.test(q.opts[q.ci]) && /분해자는 물곰팡이/.test(q.opts[q.ci]), '어항'); const q2 = SRC.u2_l03.problems[2]; ok(/분해/.test(q2.opts[q2.ci]), '곰팡이'); const q3 = SRC.u2_l10.problems[2]; ok(DECO.some(d => q3.opts[q3.ci].indexOf(d) >= 0), '버섯과 같은 역할'); });
T('먹이 관계 표 자체 확인 — 원문 화살표 줄(l04 판 · l07 미로 · l10 빈칸 · 문항) 전부 표의 방향과 같음 · 거꾸로 0', () => { const all = []; KEYS.forEach(k => { const t = srcTxt(k); (t.match(/[가-힣 ]+(?: → [가-힣 ]+)+/g) || []).forEach(x => all.push(x)); }); ok(all.length >= 4, '원문 화살표 줄 ' + all.length); all.forEach(x => ok(!arrowBad(x), x)); ['벼 → 메뚜기 → 개구리 → 뱀 → 새매', '옥수수 → 메뚜기 → 참새 → 새매', '토끼풀 → 토끼 → 여우 → 호랑이'].forEach(x => { const p = x.split(' → '); for (let i = 1; i < p.length; i++) ok(isEdge(p[i - 1], p[i]), x); }); });
T('원문 사슬·그물 판(l04 ②) — 사슬: 메뚜기가 먹는 것 1 · 먹히는 상대 1 / 그물: 둘 · 둘 · 표의 방향과 같음', () => { const W = SRC.u2_l04.slides[4].data.WAY; ok(W.chain.eat.length === 1 && W.chain.eaten.length === 1 && W.web.eat.length === 2 && W.web.eaten.length === 2, '가짓수'); [W.chain, W.web].forEach(w => { w.eat.forEach(e => ok(isEdge(e, '메뚜기'), e)); w.eaten.forEach(e => ok(isEdge('메뚜기', e), e)); }); });
const CA = SRC.u2_l06.slides[4].data.CAUSE; const POLL = ['대기오염', '수질오염', '토양오염'];
T('원문 환경오염 판(l06 ②) = 케이티처 카드 — 카드마다 켜지는 오염 이름·가짓수가 원문 kinds 와 같음(두 가지 = 배기가스·농약)', () => { const it = L.u2_l06.slides[4].data.fig.items; ok(it.length === 4, it.length); it.forEach(c => { const src = Object.values(CA).find(x => x.name === c.name); ok(src, c.name); const named = POLL.filter(p => c.kind.indexOf(p) >= 0); ok(named.sort().join() === src.kinds.slice().sort().join(), c.name + ' ' + named.join() + ' ≠ ' + src.kinds.join()); }); ok(Object.values(CA).filter(x => x.kinds.length === 2).map(x => x.name).join() === '자동차에서 나오는 배기가스,논밭에 사용하는 농약', '두 가지'); ok(Object.values(CA).filter(x => x.kinds.indexOf('수질오염') >= 0).length === 3, '수질오염 셋'); });
const MZ = SRC.u2_l07.slides[4].data.SIGN;
T('원문 숲의 미로(l07 ②) — 11 → 8 → 4 · 첫 팻말에서 빠진 것 = 비생물요소 셋 · 남은 넷 = 표의 먹이사슬 · 케이티처 카드 같은 수', () => { ok(MZ.none.pass.length === 11 && MZ.bio.pass.length === 8 && MZ.chain.pass.length === 4, '수'); ok(MZ.bio.stop.slice().sort().join() === MZ.none.pass.filter(n => NONLIVE.indexOf(n) >= 0).sort().join() && MZ.bio.pass.every(n => NONLIVE.indexOf(n) < 0), '첫 팻말'); const c = MZ.chain.pass; for (let i = 1; i < c.length; i++) ok(isEdge(c[i - 1], c[i]), c.join()); const it = L.u2_l07.slides[4].data.fig.items; ok(/열한 가지를 모두/.test(it[0].kind) && /열한 가지에서 여덟 가지/.test(it[1].kind) && it[2].kind === c.join(' → '), '카드'); });
const FV = SRC.u2_l09.slides[4].data.SIDE;
T('원문 곤충·가축 판(l09 ②) = 케이티처 카드 — 곤충 = 적게 · 거의 배출 안 함 / 가축 = 많이 · 배출', () => { ok(/적게/.test(FV.bug.feed) && /거의 배출하지 않/.test(FV.bug.gas) && /많이/.test(FV.stock.feed) && /배출해요/.test(FV.stock.gas), '원문'); const it = L.u2_l09.slides[4].data.fig.items; ok(/곤충/.test(it[0].name) && /적게/.test(it[0].kind) && /거의 배출하지 않/.test(it[0].kind) && /가축/.test(it[1].name) && /많이/.test(it[1].kind), '카드'); });
/* 학생 화면 서술 검산(문장 단위): 오개념 장 틀린 생각 칸 · 기본 문제 틀린 보기·통·짝은 빼고 본다 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|\s\/\s|","|":"|\["|"\]/).map(x => x.replace(/\\?"/g, '').trim()).filter(Boolean);
const NEG = /않|아니|없|못|틀|고쳐|실수|다르|달라|\?|라고 (말|적|여기|생각|하)/;
const NEG2 = /않|아니|못|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/; /* 「없이」·「없어」를 부정으로 보지 않는 자리 */
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x => {
  if (/라고 (말|적|썼|나누)|라는 문장|틀린 (문장|줄)|줄 알았|생각하기 쉬워|라고만|자고 발표/.test(x)) return; /* 틀린 생각을 인용해 고치게 하는 자리 · 지난 생각 돌아보기 */
  if (/(^|[^가-힣])(햇빛|공기|물|흙|온도)(은|는|도|이|가) [^.]{0,12}(?<!비)생물요소(예요|이에요|입니다|이다|에 속|에 해당)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/버섯[^.]{0,15}(스스로 양분을 만(들어요|든다|드는|들고|들며)|생산자(예요|이에요|이다|입니다))/.test(x) && !NEG.test(x)) bad.push(x);
  if (/(곰팡이|버섯|세균)(은|는|도|이|가) [^.]{0,10}(생산자|소비자)(예요|이에요|이다|입니다|에 속)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/분해자(는|도|가) [^.]{0,10}(살아 있지 않(아요|은 것|다)|비생물요소(예요|이에요|이다))/.test(x) && !/아니에요|아니라|아니다/.test(x)) bad.push(x);
  if (/먹이사슬과 먹이그물은 [^.]{0,15}같/.test(x) && !NEG.test(x)) bad.push(x);
  if (/단순할수록[^.]{0,25}유지/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/화살표[^.]{0,25}잡아먹는 생물(로부터|에서) [^.]{0,15}잡아먹히는 생물/.test(x)) bad.push(x);
  if (/곤충(은|이|도) [^.]{0,15}(먹이를 (훨씬 )?많이|온실 가스를 (아주 )?많이)/.test(x) && !NEG.test(x)) bad.push(x);
  if (/곤충[^.]{0,15}먹을거리가 될 수 없/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/생태계는 [^.]{0,6}(넓은|큰) 곳에만/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/생태계는 살아 있는 (요소|것)만/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/원인 하나는 [^.]{0,6}(반드시|꼭) 한 가지/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/생물요소이기만 하면/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/사진처럼 똑같이 [^.]{0,6}(그려야|나타내야|만들어야)/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/예쁘(고|게) [^.]{0,10}꾸민 [^.]{0,10}좋은 (발표 )?자료/.test(x) && !NEG2.test(x)) bad.push(x);
  if (/아무도 곤충을 먹지 않았/.test(x) && !/아니|틀|\?/.test(x)) bad.push(x);
  if (arrowBad(x)) bad.push(x);
  if (/(생물요소|분해자|생산자|소비자|먹이사슬|먹이그물|화살표|→|환경오염|곤충|버섯|햇빛|단순|복잡|생태계는)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; let d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined;
  if (d.fig) d.fig = d.fig.k === 'ask' ? d.fig.q + ' / ' + d.fig.yes.map(x => x.name).join(' · ') + ' — ' + (d.fig.ya || '') + ' / ' + d.fig.no.map(x => x.name).join(' · ') + ' — ' + (d.fig.na || '') + ' / ' + (d.fig.note || '') : d.fig.items.filter(it => it.emoji !== '❌').map(it => it.name + ' — ' + (it.kind || '')).join(' / ');
  if (s.block === 'basic_problem') d = { title: d.title, question: d.question, note: d.note, options: (d.options || []).filter(o => o.correct).map(o => o.text) }; return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v || '')).join('\n'); };
T('학생 화면 서술이 생태계 판정과 어긋나지 않음 — 비생물 → 생물요소 · 버섯 생산자 · 분해자 무생물 · 사슬=그물 · 단순할수록 · 화살표 거꾸로 · 곤충 많이 · 생태계 넓은 곳만/생물만 · 원인 하나 한 가지 · 먹이 방향 (전수 · 오개념 틀린 칸·틀린 보기 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 80, '검산 대상 ' + n); });
T('검산기 자체 확인 — 틀린 문장 열넷을 잡고 바른 문장 열넷은 지나간다', () => {
  ['햇빛은 생물요소예요.', '버섯은 식물처럼 스스로 양분을 만들어요.', '곰팡이는 생산자예요.', '분해자는 살아 있지 않은 것이에요.', '먹이사슬과 먹이그물은 이름만 다를 뿐 같은 것이에요.', '먹이 관계가 단순할수록 생태계가 큰 변화 없이 유지돼요.', '화살표는 잡아먹는 생물로부터 잡아먹히는 생물 쪽으로 그려요.', '곤충은 가축보다 먹이를 훨씬 많이 먹어요.', '생태계는 아주 넓은 곳에만 있어요.', '생태계는 살아 있는 요소만으로 이루어져 있어요.', '환경오염의 원인 하나는 반드시 한 가지 오염만 일으켜요.', '새매 → 뱀 → 개구리', '메뚜기 → 벼', '미로에서는 생물요소이기만 하면 지나갈 수 있어요.'].forEach(x => ok(sayCheck(x).bad.length >= 1, '못 잡음 ' + x));
  ['햇빛, 공기, 물, 온도, 흙처럼 살아 있지 않은 요소를 비생물요소라고 해요.', '버섯은 식물과 다른 생물이며 스스로 양분을 만들지 못해요.', '곰팡이, 버섯, 세균은 분해자예요.', '분해자도 살아 있는 생물요소예요.', '먹이사슬과 먹이그물은 서로 다른 것이에요.', '먹이 관계가 단순한 경우보다 복잡할수록 생태계가 큰 변화 없이 유지될 수 있어요.', '잡아먹히는 생물로부터 잡아먹는 생물 방향으로 화살표를 그려요.', '곤충은 기를 때 먹이를 훨씬 적게 먹어요.', '어항, 연못처럼 작은 생태계도 있어요.', '벼 → 메뚜기 → 개구리 → 뱀 → 새매', '옥수수 → 메뚜기 → 참새 → 새매', '토끼풀 → 토끼 → 여우 → 호랑이', '가축은 곤충보다 먹이를 훨씬 많이 먹어요.', '자동차 배기가스는 대기오염과 수질오염을 일으켜요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('오개념 장 「틀린 생각」이 판정과 반대 — 여덟 차시 전부 검산기에 잡힘', () => KEYS.forEach(k => ok(sayCheck(L[k].slides[7].data.wrong).bad.length >= 1, k + ' 「' + L[k].slides[7].data.wrong + '」')));
T('원문 일부러 틀린 보기도 판정과 반대 — 「버섯은 식물이니까 생산자예요」(l03) · 「먹이사슬과 먹이그물은 이름만 다를 뿐 같은 것이에요」(l04) · 「생태계는 살아 있는 요소만으로 이루어져 있어요」(l02) 를 잡음', () => { ['버섯은 식물이니까 생산자예요', '먹이사슬과 먹이그물은 이름만 다를 뿐 같은 것이에요', '생태계는 살아 있는 요소만으로 이루어져 있어요'].forEach(x => ok(sayCheck(x).bad.length >= 1, x)); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체 · 「결」은 원문 교과 낱말(결과·연결·결정·해결) 안에서만 · 생성기 교사 층(T 표) 「결」 0', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4s2_science_u2.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); const bad = (t.match(/.?결.?/g) || []).filter(x => !/결과|연결|결정|해결/.test(x)); ok(!bad.length, '「결」 ' + bad.join(' '));
  const g = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_science_u2.js'), 'utf8'); const tt = g.slice(g.indexOf('const T = {'), g.indexOf('const TYPE = {')); ok(tt.indexOf('결') < 0, 'T 표에 「결」'); });
T('「해결」은 원문 교과 문장 자리에만 — 학습 목표 · 정리 카드 ⑤⑥ · 기본 문제 · 정리 줄 가운데 원문에 「해결」이 있는 자리 (교사 층 0)', () => { const where = []; KEYS.forEach(k => { if (/해결/.test(L[k].meta.goal)) { ok(SRC[k].goal.some(g => /해결/.test(g)), k + ' goal'); where.push(k + ' goal'); } L[k].slides.forEach(s => { const d = JSON.stringify(Object.assign({}, s.data, { tnote: undefined })); if (!/해결/.test(d)) return; where.push(k + ' ' + s.id); const src = s.block === 'concept' ? JSON.stringify(SRC[k].slides[s.src].cards) + SRC[k].slides[s.src].text : s.block === 'basic_problem' ? JSON.stringify(SRC[k].problems[+s.src.slice(1)]) : s.block === 'summary' ? JSON.stringify(SRC[k].summary) : ''; ok(/해결/.test(src) && (s.block !== 'concept' || s.src >= 5), k + ' ' + s.id + ' 원문 자리 아님'); ok(!/해결/.test(JSON.stringify(s.data.tnote || '')), k + ' ' + s.id + ' 발문'); }); }); ok(where.length >= 3 && where.length <= 8, where.join()); });

console.log('\n게이트 g4s2 과학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
