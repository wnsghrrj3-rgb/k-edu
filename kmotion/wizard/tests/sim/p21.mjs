// v3.2 월드 3 3학년 줄(17 문서 4절) — node tests/sim/p21.mjs
// 3-1 5단원 길이와 시간 6종 · 3-2 5단원 들이와 무게 5종: 답 검산(환산식) · 오답 셋 양수·서로 다름·오개념 값 포함 · 변환표 g3·g4 · 봇 3·4학년 canyon-3-1 완주 · 다리 퍼즐 3학년 mm
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { conceptsFor } from '../../sim/learn/gradeTable.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['canyon-3-1'];
const WANT = { 'g3.len.mm': q => q.a * 10 + q.b, 'g3.len.mmPart': q => q.n - q.a * 10, 'g3.len.km': q => q.a * 1000 + q.b, 'g3.len.mPart': q => q.n - q.a * 1000, 'g3.time.sec': q => q.a * 60 + q.b, 'g3.time.secPart': q => q.n - q.a * 60,
  'g3.cap.small': q => q.a * 1000 + q.b, 'g3.cap.part': q => q.n - q.a * 1000, 'g3.wt.small': q => q.a * 1000 + q.b, 'g3.wt.part': q => q.n - q.a * 1000, 'g3.wt.ton': q => q.a * 1000 };
const MISC = { 'g3.len.mm': q => q.a + q.b, 'g3.len.km': q => q.a + q.b, 'g3.time.sec': q => q.a * 100 + q.b, 'g3.cap.small': q => q.a + q.b, 'g3.wt.small': q => q.a + q.b };   // 꼭 들어 있어야 할 오개념 값(단위 무시·100진법)
{ let bad = 0, n = 0, miss = 0, hard = 0; for (const k of Object.keys(WANT)) { const rng = createRng(31); for (let i = 0; i < 150; i++) { const q = GENERATORS[k].gen(rng, i % 2 ? .9 : .2); n++; const ws = q.wrongs.map(w => w[0]);
      if (q.answer !== WANT[k](q) || q.answer < 1 || q.answer > 9999 || ws.length < 2 || new Set(ws).size !== ws.length || ws.some(w => w <= 0 || w === q.answer || w > 9999) || !GENERATORS[k].verify(q) || q.type !== 'calc1' || q.pic !== null) bad++;
      if (MISC[k] && !ws.includes(MISC[k](q))) miss++; if (i % 2 && ('b' in q) && q.b % 100 && k !== 'g3.len.mm' && k !== 'g3.len.mmPart' && !k.startsWith('g3.time')) hard++; } }
  ok(`3학년 11종 ${n}문: 답 = 환산식 · 1~9999 · 오답 ≥2 서로 다름·양수·답 아님 · verify · calc1 · 그림 없음`, bad === 0, `어긋남 ${bad}`);
  ok('오개념 값(단위 무시 a+b · 1분 = 100초) 오답에 항상 포함', miss === 0, `빠짐 ${miss}`); ok('d 높으면 10 단위 끝수(b 가 100의 배수 아님)도 나옴', hard > 100, `${hard}`);
  ok('엔진: 11종 보기 3·정답 자리 셋 다 · 4자리 답 있음', (() => { let four = 0, slots = new Set(); for (const k of Object.keys(WANT)) { const qe = new QuestionEngine({ rng: createRng(5), concepts: [k] }); for (let i = 0; i < 40; i++) { const b = qe.next(); if (b.choices.length !== 3) return false; slots.add(b.correctSlot); if (b.choices[b.correctSlot].num >= 1000) four++; } } return slots.size === 3 && four > 50; })());
  ok('문구 키: learn·q·hint 11종 · why 6(unit-ignore·ten-hundred·part-swap·part-shift·base60·off-min)', Object.keys(WANT).every(k => T['learn.' + k] && T['q.' + k] && T['hint.' + k]) && ['unit-ignore', 'ten-hundred', 'part-swap', 'part-shift', 'base60', 'off-min'].every(w => T['why.' + w])); }
{ ok('변환표 canyon-3-1: g3 = 길이·시간 6 + 들이·무게 5 (g3-1-u5·g3-2-u5) · g4 = g3 임시', conceptsFor(data, ST, 3).length === 11 && conceptsFor(data, ST, 3).every(k => GENERATORS[k] && /^g3-[12]-u5$/.test(GENERATORS[k].unit)) && conceptsFor(data, ST, 4).join() === conceptsFor(data, ST, 3).join());
  for (const grade of [3, 4]) { let wins = 0, qs = 0, pz = 0, badC = 0; for (const seed of [11, 12, 13]) { const rec = []; const r = playOne({ data, seed, grade, acc: .8, stage: 'canyon-3-1', rand: createRng(seed * 5 + grade).next, record: rec }); if (r.win) wins++; qs += r.q || 0; pz += r.pzRight || 0; for (const e of rec.filter(e => e.type === 'q:open')) if (!/^g3\.(len|time|cap|wt)\./.test(e.concept || '')) badC++; const lg = (r.log || []).filter(x => x.type === 'puzzle:length-bridge'); if (!(lg.length === 1 && lg[0].concept === 'g3.len.mm')) badC++; }
    ok(`봇 ${grade}학년 canyon-3-1 3판 완주 · 문제 전부 3학년 환산 · 다리 퍼즐 mm(g3.len.mm)`, wins === 3 && badC === 0, `wins ${wins} q ${qs} pz ${pz} 어긋남 ${badC}`); } }
console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
