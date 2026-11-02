// v2.10 월드 2 「도형의 신전」 3학년 줄(16 문서 8절 ④) — node tests/sim/p14.mjs
// 변환표 g3·g4 / 생성기 7종(3-1 2단원 4 + 3-2 3단원 3) 정답 묶음·범위 경계 / 그림 코드 전부 proto 가 그림 / 봇 3·4학년 temple-2-1 완주 / 1·2학년·숲 불변
import { createGame } from '../../sim/game/game.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { conceptsFor } from '../../sim/learn/gradeTable.js';
import { PIC, FAMILY, CODES, RIGHT_ANGLES } from '../../sim/learn/pics.js';
import { picHtml } from '../../skins/proto/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['temple-2-1'];
const KEYS = ['g3.line.find', 'g3.right.find', 'g3.quad.right', 'g3.right.count', 'g3.circle.part', 'g3.circle.dia', 'g3.circle.same'];
const BAN = /예각|둔각|이등변|정삼각형|수직|평행|사다리꼴|마름모|다각형|90°|원주율|둘레|이등분|타원|π|circle|radius|diameter/;

// ── 1. 변환표·엔진
{ ok('temple-2-1 3학년 줄 = 7키(선분→원) · 4학년 줄 = 8키(v2.14 진짜 줄, p17) · 1·2학년 그대로', conceptsFor(data, ST, 3).join() === KEYS.join() && conceptsFor(data, ST, 4).length === 8 && conceptsFor(data, ST, 4).every(k => k.startsWith('g4.')) && conceptsFor(data, ST, 1).length === 3 && conceptsFor(data, ST, 2).length === 5);
  const g3 = createGame({ data, seed: 3, grade: 3, stageId: 'temple-2-1' }), g4 = createGame({ data, seed: 3, grade: 4, stageId: 'temple-2-1' });
  ok('엔진 3학년: empty 아님 · concepts 7 · units g3-1-u2·g3-2-u3 · packs 없음', !g3.qe.empty && g3.qe.concepts.length === 7 && [...g3.qe.units].sort().join() === 'g3-1-u2,g3-2-u3' && Object.keys((data.gradeTable || data.conceptsByGrade)['temple-2-1'].g3.packs).length === 0);
  ok('엔진 4학년: 3학년과 다른 풀(v2.14 4-1 각도·삼각형)', !g4.qe.empty && g4.qe.concepts.join() !== g3.qe.concepts.join() && [...g4.qe.units].sort().join() === 'g4-1-u2,g4-1-u4');
  ok('숲 3학년 줄 무변경(수와 연산 3키)', conceptsFor(data, data.stages['forest-1-1'], 3).join() === 'g3.addsub.3digit,g3.div.basic,g3.mul.2x1');
  ok('문구 키: learn 7 · hint 7 · q 21', KEYS.every(k => !!T['learn.' + k]) && ['line.find', 'right.find', 'quad.right', 'right.count', 'circle.part', 'circle.dia', 'circle.same'].every(k => !!T['hint.' + k]) && Object.keys(T).filter(k => /^q\.(line|right|quad|circle)\./.test(k)).length === 21);
  const txt = Object.entries(T).filter(([k]) => /^(q|hint|why|learn)\.(line|right(?!s-count)|quad\.(?!angle)|circle|g3\.(line|right|quad|circle))/.test(k) || /^why\.(is-(seg|ray|line|rect)|line-(seg|ray|line|out)|square-is-rect|rect-not-square|quad-no-right|count-right|miss-right|that-is|chord-off|rad-|dia-|same-plus)/.test(k)).map(([, v]) => v).join('\n');
  ok('4학년·6학년 낱말 0(정본 범위 경계·BAN_U3)', !BAN.test(txt), (txt.match(BAN) || [''])[0]); }

// ── 2. 그림 코드: 10~32 전부 PIC·FAMILY 있고 proto 가 그림(SVG)
{ let bad = []; for (let c = 10; c <= 32; c++) { const id = PIC[c]; if (!id || !FAMILY[id] || !/^<svg/.test(picHtml(id))) bad.push(c); }
  ok('그림 코드 10~32: PIC·FAMILY·proto SVG 전부', bad.length === 0, bad.join());
  ok('CODES 묶음: 직각 2·직각 아닌 각 2·직각삼각형 2·직사각형 2·정사각형 2·직각 없는 사각형 2·지름 2·반지름 2', ['rangle', 'angle', 'rtri', 'rect', 'square', 'quadNoRight', 'cdia', 'crad'].every(f => CODES[f].length === 2 && CODES[f].every(c => !!PIC[c])));
  ok('RIGHT_ANGLES: 직사각형·정사각형 4 · 직각삼각형 1 · 나머지 0', [19, 20, 21, 22].every(c => RIGHT_ANGLES[c] === 4) && [17, 18].every(c => RIGHT_ANGLES[c] === 1) && [1, 2, 4, 23].every(c => RIGHT_ANGLES[c] === 0)); }

// ── 3. 생성기 300문씩: 정답·오답 묶음(정본 개념)
{ const run = (k, n, f) => { const qe = new QuestionEngine({ rng: createRng(14), concepts: [k] }); let bad = 0; for (let i = 0; i < n; i++) { const b = qe.next(); if (!f(b)) bad++; } return bad; };
  const fam = c => FAMILY[PIC[c]];
  const wrongsOf = b => b.choices.filter((_, i) => i !== b.correctSlot).map(c => c.num);
  ok('선분·반직선·직선 300: 보기 전부 선 그림 3종 · 찾기면 정답만 그 선, 아닌 것이면 오답 둘이 그 선', run('g3.line.find', 300, b => { const a = fam(b.answer), ws = wrongsOf(b).map(fam); const isNot = /not/.test(b.prompt.key); const named = b.prompt.key.split('.').pop();
    return b.choices.every(c => ['seg', 'ray', 'line'].includes(fam(c.num))) && (isNot ? (ws[0] === named && ws[1] === named && a !== named) : (a === named && ws.every(w => w !== named))); }) === 0);
  ok('직각·직각삼각형 300: 찾기 = 정답만 직각(삼각형) · 아닌 것 = 오답 둘만 직각(삼각형)', run('g3.right.find', 300, b => { const tri = /tri/.test(b.prompt.key), isNot = /not/.test(b.prompt.key); const yes = tri ? CODES.rtri : CODES.rangle; const ws = wrongsOf(b);
    return isNot ? (!yes.includes(b.answer) && ws.every(w => yes.includes(w))) : (yes.includes(b.answer) && ws.every(w => !yes.includes(w))); }) === 0);
  ok('직사각형·정사각형 300: 직사각형 찾기 오답 = 직각 없는 사각형 · 정사각형 찾기 오답 = 직사각형 1 + 직각 없는 1 · 아닌 것 오답 = 직사각형·정사각형', run('g3.quad.right', 300, b => { const ws = wrongsOf(b); const R = CODES.rect, S = CODES.square, N = CODES.quadNoRight;
    if (b.prompt.key === 'q.quad.pick.rect') return R.includes(b.answer) && ws.every(w => N.includes(w)); if (b.prompt.key === 'q.quad.pick.square') return S.includes(b.answer) && ws.some(w => R.includes(w)) && ws.some(w => N.includes(w)); return N.includes(b.answer) && ws.some(w => R.includes(w)) && ws.some(w => S.includes(w)); }) === 0);
  ok('직각 세기 300: 답 0·1·4 · 문제 그림 = 그 도형 · 보기는 숫자', run('g3.right.count', 300, b => [0, 1, 4].includes(b.answer) && typeof b.pic === 'string' && FAMILY[b.pic] && b.choices.every(c => c.pic === null)) === 0);
  ok('지름·반지름 찾기 300: 지름 = 중심 지나는 선분 · 반지름 = 중심→원 위 · 오답에 반대쪽 하나', run('g3.circle.part', 300, b => { const dia = /dia/.test(b.prompt.key); const ws = wrongsOf(b); return (dia ? CODES.cdia : CODES.crad).includes(b.answer) && ws.some(w => (dia ? CODES.crad : CODES.cdia).includes(w)) && ws.every(w => [24, 25, 26, 27, 31, 32].includes(w)); }) === 0);
  ok('지름 = 반지름 × 2 300: 지름 짝수 2~32 · 반지름 1~16 · 문제 그림', run('g3.circle.dia', 300, b => { const a = b.prompt.args; if (b.prompt.key === 'q.circle.d2r') return a.d % 2 === 0 && a.d >= 2 && a.d <= 32 && b.answer * 2 === a.d; return b.answer === a.r * 2 && a.r >= 1 && a.r <= 16 && b.pic; }) === 0);
  ok('한 원에서 같다 300: 답 = 묻는 길이 · 지름이면 짝수', run('g3.circle.same', 300, b => b.answer === b.prompt.args.n && (!/Dia/.test(b.prompt.key) || b.answer % 2 === 0)) === 0); }

// ── 4. 봇 3·4학년 완주 — 문제 전부 두 단원에서, 그림 보기·수 답 둘 다
{ for (const grade of [3]) { let wins = 0, qs = 0;   /* 4학년은 p17 */ for (const seed of [11, 12, 13]) { const r = playOne({ data, seed, grade, acc: .8, stage: 'temple-2-1', rand: createRng(seed).next }); if (r.win) wins++; qs += r.q || 0; }
    ok(`봇 ${grade}학년 temple-2-1 3판 완주`, wins === 3, `wins ${wins} q ${qs}`); }
  const rec = []; playOne({ data, seed: 31, grade: 3, acc: .8, stage: 'temple-2-1', rand: createRng(31).next, record: rec }); const cps = rec.filter(e => e.type === 'q:open').map(e => e.concept || '');
  const picN = cps.filter(c => GENERATORS[c] && GENERATORS[c].choicePic).length, numN = cps.filter(c => GENERATORS[c] && !GENERATORS[c].choicePic).length, other = cps.filter(c => !GENERATORS[c] || !['g3-1-u2', 'g3-2-u3'].includes(GENERATORS[c].unit)).length;
  ok('3학년 판: 문제 전부 g3-1-u2·g3-2-u3 · 그림 보기·수 답 둘 다', cps.length > 0 && other === 0 && picN > 0 && numN > 0, `열림 ${cps.length} 그림 ${picN} 수 ${numN} 밖 ${other}`);
  // 1·2학년 신전 판은 v2.9 와 같은 개념만(3학년 키가 섞이지 않음)
  const rec2 = []; playOne({ data, seed: 21, grade: 2, acc: .8, stage: 'temple-2-1', rand: createRng(21).next, record: rec2 });
  ok('2학년 판 불변: g2-1-u2 만', rec2.filter(e => e.type === 'q:open').every(e => GENERATORS[e.concept] && GENERATORS[e.concept].unit === 'g2-1-u2')); }
console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
