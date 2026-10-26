/* gate_g4s2_science_u4.js — 4학년 2학기 과학 4단원 「기후 변화와 우리 생활」 케이티처 2세대 게이트 (207차, 베프 — gate_g4s2_science_u3 틀 + 기후 판정 M).
   2세대 무대(stage2.js renderSlide)로 실렌더. A 로드·meta(재료 키 = 차시 번호 · file_key ↔ 원문 파일 · 차시 = 원문 머리 주석 「(N/10)」(l07 「(7~8/10)」) ·
     성취기준 = 원문 주석 그대로(l09 「01~03」 = 셋))
   B 19장 · C 7요소 · D 복습 계보(4-2 과학 u3_l11 → l01 → … → l10)
   E 정답 표시(원문 그대로) · F 원문 계승(시뮬 ①② 카드 = 원문 시뮬 함수 본문 글 토막 · 도감 = 원문 이름·결과 줄 「— 」 뒤 / 두 갈래 = 원문 전부
     · 정리 카드 = 원문(빈 말풍선 장은 교사 한 줄) · 카드 없는 정리 장 = 원문 말풍선 글 토막 · 오개념 = 원문 틀린 보기)
   G 그림 · H 중복 · I 실렌더 · J extras · K 발문(80분 묶음 60~88) · L 선행 용어(원문 첫 등장 차시보다 앞서 학생 화면에 안 나옴)
   M 기후 판정(종이 빙하 판 · 바닷가 마을 판 · 현상 카드 기온/강수량 · 빙하/빙산 · 녹는 얼음 두 갈래 · 대응/악화 행동 통 나누기 · 학생 화면 서술 검산 + 검산기 자체 확인 · 상한선) · N 차단 어휘
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_science_u4.js */
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
const L = load(path.join(TDIR, 'data/g4s2_science_u4.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_science_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_science_u4.json'), 'utf8'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l03', 'u4_l04', 'u4_l05', 'u4_l06', 'u4_l07', 'u4_l09', 'u4_l10'];
const DIR = path.join(ROOT, 'grade4/semester2/science/4단원_기후변화와우리생활');
/* 원문 시뮬 ①은 전부 pose 틀(steps 표) — items 표가 없으면 sim 으로 본다 */
const kindOf = (sl) => (sl.kind === 'pose' && !(sl.data && sl.data.items)) ? 'sim' : sl.kind;
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '기후 변화와 우리 생활';
const ORIG = {}; KEYS.forEach(k => { const m = L[k] && L[k].meta; if (m) ORIG[k] = fs.readFileSync(path.join(TDIR, m.live_url), 'utf8'); });
const chasi = (k) => { const m = ORIG[k].slice(0, 3000).match(/\((\d+(?:~\d+)?)\/10\)/); return m ? m[1] : ''; };
const stdOf = (k) => { const m = ORIG[k].slice(0, 3000).match(/성취기준 (\[[^\]]+\])/); return m ? m[1] : ''; };
const expandStd = (s) => { let m = s.match(/^\[4과16-0(\d)~0(\d)\]$/); if (m) { let o = ''; for (let i = +m[1]; i <= +m[2]; i++) o += '[4과16-0' + i + ']'; return o; } m = s.match(/^\[4과16-(.+)\]$/); return m ? m[1].split('·').map(x => '[4과16-' + x + ']').join('') : s; };
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
T('9차시 키(묶음 7·8 → l07 · 원문 파일 l01~l09 = 1·2·3·4·5·6·7~8·9·10차시)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS) && JSON.stringify(Object.keys(SRC)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('원문 파일 키 = 차례 그대로(u4_l01~u4_l09 · 빠짐·겹침 0) · 원문 폴더 파일 9개 전부', () => { ok(KEYS.map(k => L[k].meta.src_key).join() === 'u4_l01,u4_l02,u4_l03,u4_l04,u4_l05,u4_l06,u4_l07,u4_l08,u4_l09', KEYS.map(k => L[k].meta.src_key).join()); ok(fs.readdirSync(DIR).filter(f => /^g4_sci_u4_l\d+_.*\.html$/.test(f)).length === 9, '원문 폴더'); KEYS.forEach(k => ok(SRC[k].file_key === L[k].meta.src_key, k)); });
T('원문 머리 주석 차시 = 1·2·3·4·5·6·7~8·9·10 · 재료 n 과 같음 · 전 파일 머리에 차시 있음(계획 표 불필요)', () => { ok(KEYS.map(chasi).join() === '1,2,3,4,5,6,7~8,9,10', KEYS.map(chasi).join()); ok(KEYS.map(chasi).join() === KEYS.map(k => SRC[k].n).join() && KEYS.every(k => SRC[k].of === 10), KEYS.map(k => SRC[k].n).join()); });
T('meta: 4학년 2학기 · unit 4 · unit_title · covers·분 = 원문 차시 · 학습 목표 = 원문 · live_url 실파일 · 합 400분', () => { let sum = 0; KEYS.forEach(k => { const m = L[k].meta, c = range(chasi(k));
  ok(m.grade === 4 && m.term === 2 && m.unit === 4 && m.unit_title === UT && m.subject === '과학' && m.n === +k.slice(-2) && m.n === c[0], k);
  ok(m.duration_min === 40 * (c[1] - c[0] + 1), k + ' 분 ' + m.duration_min); sum += m.duration_min; ok(m.covers === (c[0] === c[1] ? c[0] + '차시' : c[0] + (c[1] - c[0] > 1 ? '~' : '·') + c[1] + '차시'), k + ' covers');
  ok(m.goal === SRC[k].goal.map(nb).join(' / ') && m.goal, k + ' 학습 목표'); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.source === 'grade4/semester2/science/4단원_기후변화와우리생활/' + SRC[k].file, k + ' source'); ok(m.theme === '곰이·펭이 기후 탐험대', k + ' theme'); }); ok(sum === 400, '합 ' + sum); });
T('성취기준 — 원문 주석 그대로(l01 01·02·03 · l02·l03 01 · l04·l05·l09 02 · l06·l07 03 · l10 01~03 = 셋)', () => KEYS.forEach(k => { const s = stdOf(k); ok(s, k + ' 원문 주석 없음'); ok(/^(\[4과16-0[123]\])+$/.test(L[k].meta.std), k + ' std ' + L[k].meta.std); ok(L[k].meta.std === expandStd(s), k + ' 원문 ' + s + ' ≠ ' + L[k].meta.std); }));
console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
const ex0 = PREV.u3_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4-2 과학 u3_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex0;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_science:u3_l11'), 'from ' + rv.from); }));
T('단원을 넘는 계보는 l01 하나뿐(나머지 from 은 이 단원 키) · 마지막 차시 = 「이 단원을 마쳐요」', () => { ok(KEYS.filter(k => /:/.test(L[k].slides[1].data.from)).length === 1, '넘는 자리 수'); ok(L.u4_l10.slides[18].data.title === '이 단원을 마쳐요', '마지막 장'); });

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
KEYS.forEach(k => T(k + ' 개념 4장 = 원문 시뮬 ①(진행형)·②(도감/판)·정리 카드(빈 말풍선 = 교사 한 줄 · 카드 없음 = 말풍선 글 토막) · 오개념 = 원문 틀린 보기 · 문항·정리·자기 평가·다음 = 원문', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const d = s.data, sl = src.slides[s.src]; ok(sl && sl.kind !== 'goal', s.id + ' 원문 장 아님'); ok(d.title === nb(sl.title), s.id + ' 제목 ' + d.title);
    if (kindOf(sl) === 'sim') { const raw = simRaw(k, sl); ok(d.content && d.content.length < 90, s.id + ' 시뮬 장 말풍선은 교사 한 줄'); ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length >= 3, s.id + ' 카드 수');
      d.fig.items.forEach(it => { ok(it.kind && raw.indexOf(plain(it.kind)) >= 0, s.id + ' 카드 아래 줄이 원문 시뮬에 없음: ' + it.kind); ok(raw.indexOf(plain(it.name)) >= 0, s.id + ' 카드 이름이 원문 시뮬에 없음: ' + it.name); }); }
    else if (sl.kind === 'feat') { const vals = Object.values(sl.data.data); ok(d.content && d.content.length < 90, s.id + ' 도감 말풍선은 교사 한 줄');
      if (d.fig.k === 'ask') { const all = d.fig.yes.concat(d.fig.no).map(x => x.emoji + ' ' + x.name).sort(); ok(JSON.stringify(all) === JSON.stringify(vals.map(f => f.emoji + ' ' + f.name).sort()), s.id + ' 두 갈래 ≠ 원문 도감 전부'); }
      else { ok(d.fig.k === 'tools' || d.fig.k === 'chain', s.id + ' 부품'); ok(d.fig.items.length === vals.length, s.id + ' 카드 수'); d.fig.items.forEach(it => { const f = vals.find(x => x.name === it.name); ok(f, s.id + ' 원문에 없는 카드 ' + it.name); ok(it.emoji === f.emoji && f.feats.some(x => plain(x).endsWith(' — ' + it.kind)), s.id + ' 카드 아래 줄 ≠ 원문 결과 줄 「— 」 뒤 ' + it.name); }); } }
    else if (sl.cards) { if (sl.text) ok(norm(d.content) === norm(sl.text) && d.content, s.id + ' 말풍선 원문 아님'); else ok(d.content && d.content.length < 90, s.id + ' 빈 말풍선 장은 교사 한 줄'); ok(d.fig.items.length === sl.cards.length, s.id + ' 카드 수'); d.fig.items.forEach((it, i) => { const ls = cardSplit(sl.cards[i].label); ok(it.emoji === sl.cards[i].emoji && it.name === ls[0] && (it.kind || '') === ls[1], s.id + ' 카드 ' + (i + 1) + ' ≠ 원문 카드 ' + it.name); }); }
    else { ok(sl.text, s.id + ' 카드도 말풍선도 없는 원문 장'); ok(norm(d.content) === norm(sl.text), s.id + ' 말풍선 원문 아님'); ok(d.fig.k === 'tools' && d.fig.items.length >= 3, s.id + ' 말풍선 토막 카드'); d.fig.items.forEach(it => ok(!it.kind && plain(sl.text).indexOf(plain(it.name)) >= 0, s.id + ' 카드 이름이 원문 말풍선에 없음: ' + it.name)); } });
  const ms = L[k].slides[7]; const m = ms.data; ok(m.wrong && m.right && m.hint, '오개념 장 칸');
  const mm = String(ms.src).match(/^p(\d):(.+)$/); ok(mm, '오개념 출처 ' + ms.src); const q = src.problems[+mm[1]]; const wrongOpts = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.kind === 'cls' ? q.items.filter(it => /^(no|bad)$/.test(it.bin)).map(it => it.t) : q.opts.filter((_, i) => i !== q.ci); ok(wrongOpts.some(o => plain(o).indexOf(mm[2]) >= 0), '원문 틀린 보기에 「' + mm[2] + '」 없음'); ok(m.wrong.indexOf(mm[2]) >= 0, '오개념 글에 「' + mm[2] + '」 없음');
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(s.data.question === src.problems[+s.src.slice(1)].t, s.id + ' 문제 원문 아님'));
  const sm = L[k].slides[16].data.points; ok(sm.length === 4 && src.summary.every((it, i) => sm[i] === it), '정리 줄 원문 아님'); ok(L[k].slides[17].data.prompts[0] === src.self, '자기 평가 물음 원문 아님'); ok(L[k].slides[18].data.preview === src.next.replace(/\n/g, ' '), '다음 예고 원문 아님'); }));
const SIMS = ['u4_l01', 'u4_l04', 'u4_l07'];
T('개념 4장 = 원문 3·4·5·6 — 3 = 진행형 시뮬(전 차시 · steps 표) · 4 = 판(l01·l04·l07) 또는 도감(나머지 여섯) · 5·6 = 정리 카드 · 빈 말풍선 = l02·l03·l07 ⑤ · 카드 없음 = l02·l03 ⑥', () => { KEYS.forEach(k => { ok(L[k].slides.filter(s => s.block === 'concept').map(s => s.src).join() === '3,4,5,6', k); const sk = SRC[k].slides.slice(3, 7).map(s => s.cards ? 'cards' : kindOf(s) === 'sim' || kindOf(s) === 'feat' ? kindOf(s) : 'text').join();
  ok(sk === (SIMS.indexOf(k) >= 0 ? 'sim,sim,cards,cards' : ['u4_l02', 'u4_l03'].indexOf(k) >= 0 ? 'sim,feat,cards,text' : 'sim,feat,cards,cards'), k + ' 원문 꼴 ' + sk); ok(SRC[k].slides[3].data.steps && SRC[k].slides[3].data.steps.length >= 3, k + ' 진행형 steps'); ok(SRC[k].slides.slice(3, 7).every(s => !(s.data && s.data.items)), k + ' 원문에 items 표가 생김 — poseFig 로 바꿀 것'); });
  ok(KEYS.filter(k => SRC[k].slides.slice(5, 7).some(s => !s.text)).join() === 'u4_l02,u4_l03,u4_l07', '빈 말풍선 차시가 바뀜'); });
T('원문 머리 주석에 「오개념」 줄 없음 → 전 차시 틀린 보기에서 세움(주석이 생기면 그쪽으로 바꿀 것)', () => KEYS.forEach(k => ok(!SRC[k].notes.some(n => /^오개념/.test(n)), k)));
const predTxt = (k) => { const s = SRC[k].slides[2]; return plain([s.title, s.text, s.recall].concat((s.cards || []).map(c => c.label)).join(' ')); };
T('동기 장 물음 = 원문 예상 장(l07·l10 은 셋째 장)과 같은 물음 — 원문 핵심 낱말이 동기 물음에 있음', () => KEYS.forEach(k => { const r = predTxt(k); const q = plain(L[k].slides[2].data.question); let words = (r.match(/[가-힣]{2,}/g) || []).filter(w => w.length >= 3); if (!words.length) words = r.match(/[가-힣]{2,}/g) || []; ok(words.some(w => q.indexOf(w) >= 0), k + ' 동기 물음이 원문 예상과 동떨어짐'); }));

console.log('═══ G. 그림 ═══');
const SC = ['tools', 'chain', 'ask'];
KEYS.forEach(k => T(k + ' 개념 4장 과학 부품 렌더 · 빈 그림·NaN 0 · 카드 이름 ** 0', () => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const f = s.data.fig; ok(f && SC.indexOf(f.k) >= 0, s.id + ' 부품 ' + (f && f.k)); const h = FIG.render(f); ok(h && h.length > 150, s.id + ' 빈 그림'); ok(!/NaN|undefined|\[object/.test(h), s.id + ' 깨짐');
  if (f.k === 'tools' || f.k === 'chain') f.items.forEach(it => { ok(!/\*\*/.test(it.name) && !/\*\*/.test(it.kind || ''), s.id + ' 카드 ** ' + it.name); ok(s.src === 5 || s.src === 6 || (it.kind || '').length <= 40, s.id + ' 카드 아래 줄 너무 김 ' + it.kind); });
  if (f.k === 'ask') { ok(f.yes.length >= 1 && f.no.length >= 1, s.id + ' 갈래 비어 있음'); ok((h.match(/class="so-chip sc-chip/g) || []).length === f.yes.length + f.no.length, s.id + ' 칩 수'); } })));
T('부품 가짓수 3 (카드·차례·기준 갈래) · chain 9 (진행형 ③ 전부) · ask 2 (l02 기온이 달라졌나요 · l09 기후 변화로 녹고 있나요)', () => { const cnt = {}; KEYS.forEach(k => L[k].slides.forEach(s => s.data.fig && (cnt[s.data.fig.k] = (cnt[s.data.fig.k] || 0) + 1))); ok(Object.keys(cnt).length === 3 && cnt.chain === 9 && cnt.ask === 2, JSON.stringify(cnt)); });

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
const TERMS = ['빙하', '북극곰', '연평균 기온', '강수량', '폭염', '한파', '가뭄', '홍수', '폭설', '화석 연료', '붙임딱지', '출처', '해수면', '모형실험', '빙산', '산호초', '사막', '극지방', '삼각책', '온열 질환', '감염병', '열사병', '친환경', '서머킹', '풍력', '계획표', '점검표', '영구 동토', '세균', '미생물', '타임캡슐', '순록'];
const firstSrc = (w0) => KEYS.findIndex(k => srcTxt(k).indexOf(w0) >= 0);
T('원문 첫 등장 차시 표 — ' + TERMS.map(w0 => w0 + ' ' + (KEYS[firstSrc(w0)] || '-').slice(-3)).join(' · '), () => TERMS.forEach(w0 => ok(firstSrc(w0) >= 0, w0 + ' 원문에 없음')));
TERMS.forEach(w0 => T('「' + w0 + '」 학생 화면 첫 등장 ≥ 원문 첫 등장(' + KEYS[firstSrc(w0)] + ')', () => { const i0 = firstSrc(w0); KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(s => ok(vis(s).indexOf(w0) < 0, k + ' ' + s.id + ' 에 「' + w0 + '」')); }); }));
T('선행 검사기 자체 확인 — l02 장에 「해수면」을 심으면 잡는다', () => { const s = L.u4_l02.slides[3]; const keep = s.data.content; s.data.content = keep + ' 해수면'; let caught = false; const i0 = firstSrc('해수면'); try { KEYS.forEach((k, i) => { if (i >= i0) return; L[k].slides.forEach(x => ok(vis(x).indexOf('해수면') < 0)); }); } catch (e) { caught = true; } s.data.content = keep; ok(caught, '못 잡음'); });

console.log('═══ M. 기후 판정 검산 ═══');
const P = (k, i) => SRC[k].problems[i];
const cnt = (t, ch) => (String(t).match(new RegExp(ch, 'gu')) || []).length;
/* ① 종이 빙하 판(l01 ②) — 접을수록 자리 반씩 · 모둠 친구 그대로 */
const IB = SRC.u4_l01.slides[4].data.STATE;
T('원문 종이 빙하 판(l01 ②) — 올라설 자리 ⬜ 8 → 4 → 2 → 1(접을 때마다 반) · 이름 줄 「접지 않았어요 → 한 번 → 두 번 → 세 번」 · 피드백에 모둠 친구 「그대로」', () => { ok(IB.map(s => cnt(s.spot, '⬜')).join() === '8,4,2,1', IB.map(s => cnt(s.spot, '⬜')).join()); ok(/접지 않았/.test(IB[0].name) && /한 번/.test(IB[1].name) && /두 번/.test(IB[2].name) && /세 번/.test(IB[3].name), '이름 줄'); ok(/그대로/.test(IB[1].fb) && /그대로/.test(IB[2].fb), '친구 그대로'); });
T('케이티처 l01 판 카드 — 처음 「접지 않았어요」 → 끝 「세 번」 · 가운데 두 장 「작아/줄었」 + 「그대로」(친구 수가 준다는 카드 0)', () => { const it = L.u4_l01.slides[4].data.fig.items; ok(/접지 않았/.test(it[0].kind) && /세 번/.test(it[3].kind), '처음·끝'); [1, 2].forEach(i => ok(/작아|줄었/.test(it[i].name) && /그대로/.test(it[i].kind), '카드 ' + i)); ok(!it.some(x => /친구[^—]*(줄|작아)/.test(x.name + ' ' + (x.kind || ''))), '친구 수 줄어듦'); });
/* ② 바닷가 마을 판(l04 ②) — 물을 부을수록 육지 🟫 줄고 바닷물 🟦 늚 · 칸 수 4 그대로 */
const SB = SRC.u4_l04.slides[4].data.STATE;
T('원문 바닷가 마을 판(l04 ②) — 육지 🟫 4 → 3 → 2 → 1 → 0 · 물 🟦 0 → 4 · 칸 합 4 그대로 · 이름 줄 「붓지 않았어요 → 끝까지 부었어요」', () => { ok(SB.map(s => cnt(s.land, '🟫')).join() === '4,3,2,1,0', SB.map(s => cnt(s.land, '🟫')).join()); ok(SB.map(s => cnt(s.land, '🟦')).join() === '0,1,2,3,4', '물'); ok(SB.every(s => cnt(s.land, '🟫') + cnt(s.land, '🟦') === 4), '칸 합'); ok(/붓지 않았/.test(SB[0].name) && /끝까지/.test(SB[4].name), '이름 줄'); });
T('케이티처 l04 판 카드 — 처음 「붓지 않았어요」 → 「잠기는 부분이 생겼어요」 → 「육지가 또 줄었어요」 → 끝 「끝까지 부었어요」(육지가 늘거나 물이 줄어드는 카드 0)', () => { const it = L.u4_l04.slides[4].data.fig.items; ok(/붓지 않았/.test(it[0].kind) && /잠기는 부분이 생겼/.test(it[1].name) && /육지가 또 줄었/.test(it[2].name) && /끝까지/.test(it[3].kind), it.map(x => x.name).join('|')); ok(!it.some(x => /육지[^—]*(늘|넓어)|물[^—]*줄/.test(x.name + ' ' + (x.kind || ''))), '방향 거꾸로'); });
/* ③ 현상 카드(l02 ②) — 기온 카드 = ℃ · 강수량 카드 = mm · 늘/줄 · 홍수/가뭄 */
const CD = SRC.u4_l02.slides[4].data.data;
T('원문 현상 카드(l02 ②) — 폭염·한파 = ℃(기온) · 연간·가을~봄 강수량 = mm · 폭염·한파·연간 「늘었」 / 가을~봄 「줄었」 · 연간 → 홍수 · 가을~봄 → 가뭄', () => { ok(/℃/.test(CD.hot.feats[0]) && /℃/.test(CD.cold.feats[0]) && /mm/.test(CD.year.feats[0]) && /mm/.test(CD.dry.feats[0]), '단위'); ok(/늘었/.test(CD.hot.feats[0]) && /늘었/.test(CD.cold.feats[0]) && /늘었/.test(CD.year.feats[0]) && /줄었/.test(CD.dry.feats[0]) && !/늘었/.test(CD.dry.feats[0]), '늘/줄'); ok(/홍수/.test(CD.year.feats[1]) && /가뭄/.test(CD.dry.feats[1]), '홍수/가뭄'); });
T('케이티처 l02 두 갈래 「기온이 달라졌나요?」 — 예 = 첫 줄에 ℃ 가 있는 카드(폭염·한파) · 아니요 = mm 카드(강수량 둘) · 원문 문항 p5 기온/강수량 통과 같은 가름', () => { const f = L.u4_l02.slides[4].data.fig; const want = (re) => Object.keys(CD).filter(id => re.test(CD[id].feats[0])).map(id => CD[id].name).join(); ok(f.k === 'ask' && f.yes.map(x => x.name).join() === want(/℃/) && f.no.map(x => x.name).join() === want(/mm/), JSON.stringify(f.yes) + JSON.stringify(f.no)); const q = P('u4_l02', 5); q.items.forEach(it => ok((it.bin === 'temp') === /℃/.test(it.t) && (it.bin === 'rain') === /mm/.test(it.t), 'p5 ' + it.t)); });
T('원문 짝(l02 p3) — 늘어난 강수량 ↔ 홍수 · 줄어든 강수량 ↔ 가뭄 · 폭염 ↔ 여름 · 한파 ↔ 겨울', () => P('u4_l02', 3).pairs.forEach(p => { const l = p[0], r = p[1]; if (/강수량이 늘/.test(l)) ok(/홍수/.test(r), l); if (/강수량이 줄/.test(l)) ok(/가뭄/.test(r), l); if (/폭염/.test(l)) ok(/여름/.test(r), l); if (/한파/.test(l)) ok(/겨울/.test(r), l); }));
/* ④ 빙하/빙산(l04 ⑥) — 빙하 = 육지 · 빙산 = 물에 떠 있는 · 띄운 얼음이 녹아도 물 높이 그대로 */
T('원문 빙하·빙산 카드(l04 ⑥) — 빙하 = 육지를 덮고 있는 · 빙산 = 물에 떠 있는 · 말풍선 「물의 높이가 변하지 않아요」 · 케이티처 카드 같은 글', () => { const sl = SRC.u4_l04.slides[6]; const c = sl.cards.map(x => nb(x.label)); ok(/^빙하 — .*육지를 덮고/.test(c[0]) && /^빙산 — .*물에 떠 있는/.test(c[1]), c.join('|')); ok(/물의 높이가 변하지 않아요/.test(nb(sl.text)), '말풍선'); const it = L.u4_l04.slides[6].data.fig.items; ok(it[0].name === '빙하' && /육지/.test(it[0].kind) && it[1].name === '빙산' && /물에 떠/.test(it[1].kind), '카드'); });
/* ⑤ 녹는 얼음 두 갈래(l09 ②) */
const ID = SRC.u4_l09.slides[4].data.data;
T('원문 카드 셋(l09 ②) — 영구 동토·빙하 둘째 줄 = 「녹으면서」 · 과학자 = 「연구」 · 케이티처 두 갈래 「기후 변화로 녹고 있나요?」 예 = 영구 동토·빙하 · 아니요 = 과학자', () => { ok(/녹으면서/.test(ID.soil.feats[1]) && /녹으면서/.test(ID.ice.feats[1]) && !/녹/.test(ID.sci.feats[0]) && /연구/.test(ID.sci.feats[0]), '원문'); const f = L.u4_l09.slides[4].data.fig; ok(f.k === 'ask' && f.yes.map(x => x.name).join() === Object.keys(ID).filter(id => /녹으면서/.test(ID[id].feats[1])).map(id => ID[id].name).join() && f.no.map(x => x.name).join() === '과학자', JSON.stringify(f.yes) + JSON.stringify(f.no)); });
/* ⑥ 대응 / 악화 행동 판정 */
const GOOD = /심어|심고|가꾸|친환경|절약|줄여|줄이|걸어|계단|재활용|끄|꺼|다회용|대중교통|붙여 놓|점검|길게 하지 않|법과 제도|먹을 만큼|플러그/;
const BAD = /파괴|화석 연료를 사용|공장에서|남겨|아무 곳|일회용품을 (자주|많이|더)|승강기를|켜 (두|놓)|자동차로|자가용|승용차|창문을 열|미뤄|비닐봉지|아끼지 않|필요 이상|쓰레기를 (많이|버려)|많은 양의 쓰레기/;
const judge = (t) => { const g = GOOD.test(t), b = BAD.test(t); return g && !b ? 'good' : b && !g ? 'bad' : null; };
const actBins = [['u4_l06', 1, { yes: 'good', no: 'bad' }], ['u4_l09', 1, { yes: 'good', no: 'bad' }], ['u4_l10', 1, { yes: 'bad', no: 'good' }], ['u4_l07', 5, { help: 'good', stop: 'bad' }]];
T('원문 행동 통 나누기(l06 p1 · l09 p1 · l10 p1 · l07 p5) — 대응/악화 낱말 판정 = 원문 통(l10 은 「더욱 심각하게 만들어요」 통이 먼저)', () => { let n = 0; actBins.forEach(([k, i, map]) => P(k, i).items.forEach(it => { const j = judge(it.t); ok(j, k + ' 못 읽음 ' + it.t); ok(map[it.bin] === j, k + ' ' + it.t + ' → ' + it.bin); n++; })); ok(n === 16, '검산 ' + n); });
T('원문 모두 고르기(l03 p4 악화 · l06 p4 대응) — 맞는 보기 = 그 쪽 판정 · 틀린 보기 = 반대 쪽', () => { [['u4_l03', 4, 'bad'], ['u4_l06', 4, 'good']].forEach(([k, i, want]) => P(k, i).chips.forEach(c => { const j = judge(c.t); ok(j, k + ' 못 읽음 ' + c.t); ok((j === want) === c.hit, k + ' ' + c.t); })); });
T('기본 문제로 고른 행동 통(l10 p1) — 화면 답 줄이 판정과 같음', () => { const s = L.u4_l10.slides.find(x => x.src === 'p1'); s.data.answer.split(' / ').forEach(seg => { const [bin, items] = seg.split(' — '); items.split(' · ').forEach(t => ok((/심각/.test(bin) ? 'bad' : 'good') === judge(t), t)); }); });
/* ⑦ 학생 화면 서술 검산(문장 단위): 오개념 장 틀린 생각 칸 · 기본 문제 틀린 보기 · ❌ 표시 카드(퀴즈 「×」 문제)는 빼고 본다 */
const sentences = (t) => nb(t).split(/(?<=[.!?。])\s+|\n|\\n|\s\/\s|","|":"|\["|"\]/).map(x => x.replace(/\\?"/g, '').trim()).filter(Boolean);
const NEG2 = /않|아니|못|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/;
const NEG3 = /아니|틀|고쳐|실수|\?|라고 (말|적|여기|생각|하)/; /* 틀린 생각 자체에 「않」·「없」이 든 자리 */
const sayCheck = (t) => { const bad = []; let n = 0; sentences(t).forEach(x0 => {
  if (/✗|라고 (말|적|썼|나누)|라는 문장|틀린 (문장|줄)|줄 알았|생각하기 쉬워|라고만/.test(x0)) return;
  const x = x0;
  if (/빙산(이|은)? [^.]{0,6}녹(으면|아서|아도)[^.]{0,15}(해수면|물의 높이)[^.]{0,8}(올라|높아|상승)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/빙하가 녹(으면|아)[^.]{0,15}해수면[^.]{0,8}(낮아|내려)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/해수면이 (높아지|상승하)[^.]{0,25}땅이 (넓어|늘어)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/해수면이 (높아지|상승하)[^.]{0,25}(아무 일도|괜찮)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/인간의 활동(은|이)?[^.]{0,15}(영향을 미치지 않|관련이 없|아무 관련)/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/숲을 파괴하면 기후 변화가 일어나지 않/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/자연에 의해서만/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/다른 나라에서만/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/먼 미래에만/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(상관없|관련이 없)/.test(x) && /(기후|북극|빙하|우리)/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/나 혼자서만 하면/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/나라에서만 할 수/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/영구 동토[^.]{0,8}여름마다 모두 녹/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(폭염|한파|가뭄|홍수|폭설)[^.]{0,20}줄어들고 있/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/평균 기온이[^.]{0,6}(낮아|내려가)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/가을[^.]{0,6}봄[^.]{0,15}강수량이[^.]{0,6}(크게 )?늘/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/이미 모두 밝혀/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/무섭기만 하고 할 수 있는 일이 없/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/할 수 있는 (건|것은|일은|일이) 없/.test(x) && !NEG3.test(x)) bad.push(x0);
  if (/(이긴 것이 가장 중요|이기는 모둠을 가리는 것이 목표)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/빙하[^.]{0,10}(더 커졌|점점 늘어나|넓어졌)/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/걱정만 하고 있으면 된/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/좋은 점만 있/.test(x) && !NEG2.test(x)) bad.push(x0);
  if (/(빙하|빙산|해수면|폭염|한파|가뭄|홍수|기후 변화|영구 동토|대응)/.test(x)) n++; }); return { n, bad }; };
const vis2 = (s) => { if (s.block === 'cover' || s.block === 'next_lesson') return ''; let d = Object.assign({}, s.data, { tnote: undefined }); if (s.block === 'misconception') d.wrong = undefined;
  if (d.fig) d.fig = d.fig.k === 'ask' ? d.fig.q + ' / ' + d.fig.yes.map(x => x.name).join(' · ') + ' — ' + (d.fig.ya || '') + ' / ' + d.fig.no.map(x => x.name).join(' · ') + ' — ' + (d.fig.na || '') + ' / ' + (d.fig.note || '') : d.fig.items.filter(it => it.emoji !== '❌').map(it => it.name + ' — ' + (it.kind || '')).join(' / ');
  if (s.block === 'basic_problem') d = { title: d.title, question: d.question, note: d.note, options: (d.options || []).filter(o => o.correct).map(o => o.text) }; return Object.values(d).map(v => typeof v === 'string' ? v : JSON.stringify(v || '')).join('\n'); };
T('학생 화면 서술이 기후 판정과 어긋나지 않음 — 빙산·빙하와 해수면 · 해수면과 땅 · 인간의 활동 · 자연만 · 다른 나라만 · 먼 미래만 · 상관없음 · 혼자만/나라만 · 영구 동토 · 현상 줄어듦 · 기온 낮아짐 · 강수량 거꾸로 · 이미 밝혀짐 · 무기력 · 승부 · 빙하 커짐 · 걱정만 · 좋은 점만 (전수 · 오개념 틀린 칸·틀린 보기·❌ 퀴즈 카드 제외)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const r = sayCheck(vis2(s)); n += r.n; ok(!r.bad.length, k + ' ' + s.id + ' 「' + r.bad.join('」「') + '」'); })); ok(n >= 150, '검산 대상 ' + n); });
T('검산기 자체 확인 — 틀린 문장 스물을 잡고 바른 문장 스물은 지나간다', () => {
  ['물에 떠 있는 빙산이 녹으면 해수면이 올라가요.', '빙하가 녹으면 해수면이 낮아져요.', '해수면이 높아지면 살 수 있는 땅이 넓어져요.', '인간의 활동은 기후 변화에 영향을 미치지 않습니다.', '기후 변화는 자연에 의해서만 일어나요.', '기후 변화 현상은 다른 나라에서만 일어나요.', '기후 변화는 먼 미래에만 일어나는 일이에요.', '북극의 일이라 우리와는 상관없어요.', '기후 변화 대응은 나 혼자서만 하면 돼요.', '대응 방법은 나라에서만 할 수 있어요.', '영구 동토는 여름마다 모두 녹아요.', '폭염, 한파, 가뭄, 홍수, 폭설이 점점 줄어들고 있어요.', '연도별 평균 기온이 점차 낮아져요.', '가을에서 봄 사이의 평균 강수량이 크게 늘었어요.', '세균이 사회에 미칠 영향은 이미 모두 밝혀졌어요.', '무섭기만 하고 할 수 있는 일이 없어요.', '가장 오래 버틴 모둠이 이긴 것이 가장 중요해요.', '빙하의 크기가 더 커졌어요.', '기후 변화가 걱정될 때는 걱정만 하고 있으면 된다.', '겨울이 따뜻해지면 좋은 점만 있어요.'].forEach(x => ok(sayCheck(x).bad.length >= 1, '못 잡음 ' + x));
  ['기후 변화로 빙하가 녹으면 해수면이 높아져요.', '물에 떠 있는 빙산은 녹아도 물의 높이가 변하지 않아요.', '해수면이 높아지면 우리가 살 수 있는 땅이 줄어들어요.', '기후 변화는 자연에 의해서도 일어나지만 인간의 활동과도 관련이 있어요.', '우리나라에서도 폭염, 한파, 가뭄, 홍수, 폭설이 일어나요.', '기후 변화는 먼 미래의 일이 아니라 이미 우리 생활과 환경에 영향을 미치고 있어요.', '국가와 사회, 과학자, 사람들이 함께 기후 변화에 대응해요.', '영구 동토는 여름에도 얼어 있는 땅이에요.', '우리나라의 연도별 평균 기온이 점차 상승하고 있어요.', '가을~봄 강수량이 줄어서 가뭄이 심해질 수 있어요.', '세균이 드러나면 어떤 영향을 미칠지 앞으로 연구가 더 필요해요.', '이 놀이는 이기는 모둠을 가리는 놀이가 아니에요.', '북극의 일은 우리와 상관없는 일이 아니에요.', '숲을 파괴하고 건물을 지을수록 기후 변화가 심각해질 수 있어요.', '연간 강수량이 늘어서 홍수가 심해질 수 있어요.', '빙하의 크기가 많이 작아졌어요.', '폭염 일수는 2010년대가 2000년대에 비해 5.5일 증가했어요.', '한파가 왔다고 기후 변화가 없는 것이 아니에요.', '걱정하는 마음을 실천으로 바꾸어요.', '해수면이 상승하면 해안가의 육지가 바닷물에 잠겨요.'].forEach(x => ok(!sayCheck(x).bad.length, '오탐 ' + x)); });
T('오개념 장 「틀린 생각」이 판정과 반대 — 아홉 차시 전부 검산기에 잡힘', () => KEYS.forEach(k => ok(sayCheck(L[k].slides[7].data.wrong).bad.length >= 1, k + ' 「' + L[k].slides[7].data.wrong + '」')));
T('원문 일부러 틀린 보기도 판정과 반대 — l04 「빙산이 녹으면 해수면이 올라가요」 · l10 「빙하가 녹으면 해수면이 낮아져요」 · l03 「기후 변화는 인간의 활동과 아무 관련이 없어요」 · l02 「폭염 … 점점 줄어들고 있어요」 를 잡음', () => { [['u4_l04', 7], ['u4_l10', 2], ['u4_l03', 5], ['u4_l02', 4]].forEach(([k, i]) => { const q = P(k, i); const wrongs = q.kind === 'ms' ? q.chips.filter(c => !c.hit).map(c => c.t) : q.kind === 'cls' ? q.items.filter(it => it.bin === 'xx').map(it => it.t) : q.opts.filter((_, j) => j !== q.ci); ok(wrongs.some(x => sayCheck(plain(x)).bad.length >= 1), k + ' p' + i); }); });
/* ⑧ 상한선(원문 _PLAN) — 승부 · 불안·무기력 · 원문에 없는 원인 설명 */
T('상한선 — 원문에 없는 원인 낱말(온실 가스 · 지구 온난화 · 이산화 탄소) 학생 화면·발문 0 · 퀴즈 판 「×」 카드는 ❌ 표시', () => { KEYS.forEach(k => { const t = JSON.stringify(L[k].slides); ['온실 가스', '온실가스', '지구 온난화', '이산화 탄소'].forEach(w0 => ok(t.indexOf(w0) < 0, k + ' 「' + w0 + '」')); }); ok(KEYS.every(k => ['온실 가스', '지구 온난화', '이산화 탄소'].every(w0 => srcTxt(k).indexOf(w0) < 0)), '원문에 생김 — 상한선 다시 볼 것'); const it = L.u4_l07.slides[4].data.fig.items; it.forEach(x => ok((x.kind === '×') === (x.emoji === '❌'), x.name)); const QS = SRC.u4_l07.slides[4].data.QS; ok(it.length === QS.length && it.every((x, i) => x.kind === QS[i].a), '퀴즈 카드 답 = 원문 답'); });

console.log('═══ N. 차단 어휘 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 — 데이터 전체 · 「결」은 원문 교과 낱말(결과·연결·결정·해결) 안에서만 · 생성기 교사 층(T 표) 「결」 0', () => { const t = fs.readFileSync(path.join(TDIR, 'data/g4s2_science_u4.js'), 'utf8'); ['박음', '빵꾸', '갈아엎', '결로'].forEach(w0 => ok(t.indexOf(w0) < 0, w0)); const bad = (t.match(/.?결.?/g) || []).filter(x => !/결과|연결|결정|해결/.test(x)); ok(!bad.length, '「결」 ' + bad.join(' '));
  const g = fs.readFileSync(path.join(TDIR, 'scripts/gen_g4s2_science_u4.js'), 'utf8'); const tt = g.slice(g.indexOf('const T = {'), g.indexOf('const TYPE = {')); ok(tt.indexOf('결') < 0, 'T 표에 「결」'); });
T('「해결」은 원문 교과 문장 자리에만 — 학습 목표 · 정리 카드 ⑤⑥ · 기본 문제 · 정리 줄 · 자기 평가 물음 가운데 원문에 「해결」이 있는 자리 (교사 층 0)', () => { const where = []; KEYS.forEach(k => { if (/해결/.test(L[k].meta.goal)) { ok(SRC[k].goal.some(g => /해결/.test(g)), k + ' goal'); where.push(k + ' goal'); } L[k].slides.forEach(s => { const d = JSON.stringify(Object.assign({}, s.data, { tnote: undefined })); if (!/해결/.test(d)) return; where.push(k + ' ' + s.id); const src = s.block === 'concept' ? JSON.stringify(SRC[k].slides[s.src].cards) + SRC[k].slides[s.src].text : s.block === 'basic_problem' ? JSON.stringify(SRC[k].problems[+s.src.slice(1)]) : s.block === 'summary' ? JSON.stringify(SRC[k].summary) : s.block === 'self_assessment' ? SRC[k].self : ''; ok(/해결/.test(src) && (s.block !== 'concept' || s.src >= 5), k + ' ' + s.id + ' 원문 자리 아님'); ok(!/해결/.test(JSON.stringify(s.data.tnote || '')), k + ' ' + s.id + ' 발문'); }); }); ok(where.join() === 'u4_l06 s18,u4_l09 goal,u4_l09 s18', where.join()); /* 4단원은 원문 학습 목표·자기 평가 물음의 「해결」 세 자리(l06 「기후 위기를 해결하기」 · l09 목표·자기 평가 「해결 방법」) */ });

console.log('\n게이트 g4s2 과학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
