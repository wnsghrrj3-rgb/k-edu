// v2.14 월드 2 「도형의 신전」 4학년 진짜 줄(4-1 2단원 각도 · 4단원 삼각형, 50절 「다음 ④」) — node tests/sim/p17.mjs
// 변환표 g4 8키 / 생성기 8종 정답 묶음·범위 / 작도 그림(tri:·quad:)의 각 = 실제 각(정본 작도 규약 ±0.01°) / 그림 코드 50~63·70~73 / 정령·열쇠 문 4학년 줄 / 봇 4학년 완주 / 3학년·숲 불변
import { createGame } from '../../sim/game/game.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { conceptsFor } from '../../sim/learn/gradeTable.js';
import { PIC, FAMILY, CODES, ANGLE_DEG, NAME_CODE } from '../../sim/learn/pics.js';
import { SPIRIT_SETS, spiritSet, pickSpiritShape } from '../../sim/learn/spirit.js';
import { makePuzzle, verifyPuzzle, SHAPE_KEY_SETS } from '../../sim/learn/puzzles.js';
import { picHtml, polyFromAngles } from '../../skins/proto/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['temple-2-1'];
const KEYS = ['g4.angle.kind', 'g4.angle.sum', 'g4.tri.angle', 'g4.quad.angle', 'g4.tri.side', 'g4.tri.byAngle', 'g4.iso.angle', 'g4.tri.len'];
const G3KEYS = ['g3.line.find', 'g3.right.find', 'g3.quad.right', 'g3.right.count', 'g3.circle.part', 'g3.circle.dia', 'g3.circle.same'];
const BAN = /보각|맞꼭지각|밑각|꼭지각|둘레|평행|수직|사다리꼴|마름모|합동|대칭|다각형|π|라디안/;   // 4-1 2·4단원 밖 낱말(중학·4-2·5학년) — 대각선은 정본 08차(사각형을 삼각형 2개로)에 있어 허용
const fam = c => FAMILY[PIC[c]];
const wrongsOf = b => b.choices.filter((_, i) => i !== b.correctSlot).map(c => c.num);
const run = (k, n, f) => { const qe = new QuestionEngine({ rng: createRng(17), concepts: [k] }); let bad = 0; for (let i = 0; i < n; i++) { const b = qe.next(); if (!f(b)) bad++; } return bad; };

// ── 1. 변환표·엔진
{ ok('temple-2-1 4학년 줄 = 8키(각도 4 + 삼각형 4) · 3학년 줄 7키 그대로 · 1·2학년 그대로', conceptsFor(data, ST, 4).join() === KEYS.join() && conceptsFor(data, ST, 3).join() === G3KEYS.join() && conceptsFor(data, ST, 1).length === 3 && conceptsFor(data, ST, 2).length === 5);
  const g4 = createGame({ data, seed: 3, grade: 4, stageId: 'temple-2-1' });
  ok('엔진 4학년: empty 아님 · concepts 8 · units g4-1-u2·g4-1-u4 · packs 없음', !g4.qe.empty && g4.qe.concepts.length === 8 && [...g4.qe.units].sort().join() === 'g4-1-u2,g4-1-u4' && Object.keys((data.gradeTable || data.conceptsByGrade)['temple-2-1'].g4.packs).length === 0);
  ok('숲 4학년 줄 무변경(3-2 키 2)', conceptsFor(data, data.stages['forest-1-1'], 4).join() === 'g3.div.2x1,g3.mul.3x1');
  ok('생성기 등록: 8종 전부 unit g4-1-u2/u4 · max 360/180 · 그림 보기 3종', KEYS.every(k => GENERATORS[k]) && KEYS.slice(0, 4).every(k => GENERATORS[k].unit === 'g4-1-u2' && GENERATORS[k].max === 360) && KEYS.slice(4).every(k => GENERATORS[k].unit === 'g4-1-u4' && GENERATORS[k].max === 180) && KEYS.filter(k => GENERATORS[k].choicePic).length === 3);
  ok('문구 키: learn 9 · hint 8', [...KEYS, 'g4.tri.name'].every(k => !!T['learn.' + k]) && ['angle.kind', 'angle.sum', 'tri.angle', 'quad.angle', 'tri.side', 'tri.byAngle', 'iso.angle', 'tri.len'].every(k => !!T['hint.' + k]));
  const txt = Object.entries(T).filter(([k]) => /^(q\.(angle|tri4|quad4|iso|equi)\.|hint\.(angle|tri|quad|iso)\.|learn\.g4\.|hint\.spirit\.(atri|otri|equi)|why\.(nm-(atri|otri|iso|equi)|is-(acute|obtuse|right|iso|atri|otri|rtri)|rights-count|tri-360|tri-90|sum-instead|quad-180|tri-scal|iso-not-equi|equi-is-iso|equi-sixty|one-only|half-miss|same-as-given|side-count|double-miss)$|pz\.key\.hint\.(iso|equi|atri|otri))/.test(k)).map(([, v]) => v).join('\n');
  ok('4-1 밖 낱말 0(보각·밑각·꼭지각·둘레·평행·다각형…)', !BAN.test(txt), (txt.match(BAN) || [''])[0]);
  ok('3학년 줄 문구에 4학년 낱말 0 그대로(p14 BAN)', !/예각|둔각|이등변|정삼각형/.test(Object.entries(T).filter(([k]) => /^(q|hint|why|learn)\.(line|right|quad|circle|g3\.(line|right|quad|circle))/.test(k)).map(([, v]) => v).join('\n'))); }

// ── 2. 그림 코드: 50~63·70~73 PIC·FAMILY·proto SVG · 묶음 2종씩 · 각도표
{ let bad = []; for (const c of [...Array.from({ length: 14 }, (_, i) => 50 + i), 70, 71, 72, 73]) { const id = PIC[c]; if (!id || !FAMILY[id] || !/^<svg/.test(picHtml(id))) bad.push(c); }
  ok('그림 코드 50~63·70~73: PIC·FAMILY·proto SVG 전부', bad.length === 0, bad.join());
  ok('CODES 묶음: 예각·둔각·이등변·정삼각형·세 변 다른·예각삼각형·둔각삼각형 각 2', ['acute', 'obtuse', 'iso', 'equi', 'scal', 'atri', 'otri'].every(f => CODES[f].length === 2 && CODES[f].every(c => fam(c) === f)));
  ok('ANGLE_DEG: 직각 90 · 예각 <90 · 둔각 >90', CODES.rangle.every(c => ANGLE_DEG[c] === 90) && CODES.acute.every(c => ANGLE_DEG[c] < 90) && CODES.obtuse.every(c => ANGLE_DEG[c] > 90 && ANGLE_DEG[c] < 180));
  ok('NAME_CODE 4학년 이름 판: 예각·둔각·이등변·정삼각형 70~73', NAME_CODE.atri === 70 && NAME_CODE.otri === 71 && NAME_CODE.iso === 72 && NAME_CODE.equi === 73);
  ok('이름 판 SVG 에 글자(예각삼각형·둔각삼각형·이등변삼각형·정삼각형)', picHtml('nm-atri').includes('예각') && picHtml('nm-otri').includes('둔각') && picHtml('nm-iso').includes('이등변') && picHtml('nm-equi').includes('정삼각형'));
  ok('같은 변 표시: 이등변 2 · 정삼각형 3 · 세 변 다른 0', (picHtml('iso').match(/<line/g) || []).length === 2 && (picHtml('equi2').match(/<line/g) || []).length === 3 && !/<line/.test(picHtml('scal'))); }

// ── 3. 작도 그림(tri:a,b · quad:a,b,c): 정본 작도 규약 — 그림 속 각 = 문제의 각(±0.01°)
{ const ang = (P, i) => { const n = P.length, a = P[(i + n - 1) % n], o = P[i], b = P[(i + 1) % n]; const v1 = [a[0] - o[0], a[1] - o[1]], v2 = [b[0] - o[0], b[1] - o[1]]; return Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))) * 180 / Math.PI; };
  let bad = 0, n = 0; const qe = new QuestionEngine({ rng: createRng(171), concepts: ['g4.tri.angle'] });
  for (let i = 0; i < 300; i++) { const b = qe.next(); if (b.prompt.key !== 'q.tri4.missing') continue; n++; const [a, c] = b.pic.slice(4).split(',').map(Number), g = polyFromAngles([a, c]); if (!g) { bad++; continue; }
    if (Math.abs(ang(g.pts, 0) - a) > .01 || Math.abs(ang(g.pts, 1) - c) > .01 || Math.abs(ang(g.pts, 2) - b.answer) > .01 || !/<svg/.test(picHtml(b.pic))) bad++; }
  ok('삼각형 작도 그림: 세 각 = 문제의 두 각 + 답', n > 100 && bad === 0, `n ${n} bad ${bad}`);
  bad = 0; n = 0; const qe2 = new QuestionEngine({ rng: createRng(172), concepts: ['g4.quad.angle'] });
  for (let i = 0; i < 300; i++) { const b = qe2.next(); if (b.prompt.key !== 'q.quad4.missing') continue; n++; const [a, c, d] = b.pic.slice(5).split(',').map(Number), g = polyFromAngles([a, c, d]); if (!g || g.t <= 0 || g.s <= 0) { bad++; continue; }
    const got = [0, 1, 2, 3].map(i => ang(g.pts, i)); if (Math.abs(got[0] - a) > .01 || Math.abs(got[1] - c) > .01 || Math.abs(got[2] - d) > .01 || Math.abs(got[3] - b.answer) > .01 || Math.abs(got.reduce((s, x) => s + x, 0) - 360) > .05 || !/<svg/.test(picHtml(b.pic))) bad++; }
  ok('사각형 작도 그림: 네 각 = 문제의 세 각 + 답 · 볼록(교점 앞쪽) · 합 360', n > 100 && bad === 0, `n ${n} bad ${bad}`);
  ok('작도 그림 라벨: a°·b°·? 셋', (picHtml('tri:60,70').match(/<text/g) || []).length === 3 && picHtml('tri:60,70').includes('>?<') && (picHtml('quad:90,110,70').match(/<text/g) || []).length === 4); }

// ── 4. 생성기 300문씩: 정답·오답 묶음(정본 개념)
{ ok('예각·둔각·직각 300: 보기 전부 각 그림 · 찾기 = 정답만 그 종류 · 아닌 것 = 오답 둘만 그 종류', run('g4.angle.kind', 300, b => { const k = c => ANGLE_DEG[c] < 90 ? 'acute' : ANGLE_DEG[c] > 90 ? 'obtuse' : 'right'; const named = b.prompt.key.split('.').pop(), isNot = /not/.test(b.prompt.key); const ws = wrongsOf(b);
    return b.choices.every(c => ANGLE_DEG[c.num] != null && c.pic) && (isNot ? (k(b.answer) !== named && ws.every(w => k(w) === named)) : (k(b.answer) === named && ws.every(w => k(w) !== named))); }) === 0);
  ok('각도의 합과 차 300: 답 = a+b / a−b / 90×n · 360 안 · 5° 단위', run('g4.angle.sum', 300, b => { const a = b.prompt.args; if (b.prompt.key === 'q.angle.rights') return b.answer === 90 * a.n && a.n >= 2 && a.n <= 4; if (b.prompt.key === 'q.angle.sum') return b.answer === a.a + a.b && b.answer <= 360 && a.a % 5 === 0 && a.b % 5 === 0; return b.answer === a.a - a.b && b.answer > 0 && a.a <= 360 && a.a % 5 === 0; }) === 0);
  ok('삼각형 세 각 300: 180 − a − b · 각 ≥20 · 그림 tri:a,b', run('g4.tri.angle', 300, b => { if (b.prompt.key === 'q.tri4.sum') return b.answer === 180; const a = b.prompt.args; return b.answer === 180 - a.a - a.b && b.answer >= 20 && b.pic === `tri:${a.a},${a.b}`; }) === 0);
  ok('사각형 네 각 300: 360 − a − b − c · 각 전부 60~140 · 그림 quad:a,b,c', run('g4.quad.angle', 300, b => { if (b.prompt.key === 'q.quad4.sum') return b.answer === 360; const a = b.prompt.args; return b.answer === 360 - a.a - a.b - a.c && [a.a, a.b, a.c, b.answer].every(x => x >= 60 && x <= 140) && b.pic === `quad:${a.a},${a.b},${a.c}`; }) === 0);
  ok('변으로 분류 300: 이등변 찾기 오답 = 세 변 다른 2 · 정삼각형 찾기 오답 = 이등변 1 + 세 변 다른 1 · 아닌 것 = 세 변 다른 정답·오답 이등변+정삼각형', run('g4.tri.side', 300, b => { const ws = wrongsOf(b).map(fam), a = fam(b.answer);
    if (b.prompt.key === 'q.tri4.pick.iso') return a === 'iso' && ws.every(w => w === 'scal'); if (b.prompt.key === 'q.tri4.pick.equi') return a === 'equi' && ws.includes('iso') && ws.includes('scal'); return a === 'scal' && ws.includes('iso') && ws.includes('equi'); }) === 0);
  ok('각으로 분류 300: 예각삼각형 찾기 오답 = 둔각·직각삼각형(348쪽 오개념) · 둔각 찾기 오답 = 예각·직각 · 아닌 것 = 오답 둘만 그 종류', run('g4.tri.byAngle', 300, b => { const ws = wrongsOf(b).map(fam), a = fam(b.answer), named = b.prompt.key.split('.').pop(), isNot = /not/.test(b.prompt.key);
    return b.choices.every(c => ['atri', 'otri', 'rtri'].includes(fam(c.num))) && (isNot ? (a !== named && ws.every(w => w === named)) : (a === named && ws.every(w => w !== named) && new Set(ws).size === 2)); }) === 0);
  ok('이등변·정삼각형의 각 300: 두 각 같으면 180−2a · 한 각 주면 (180−a)÷2 자연수 · 정삼각형 60', run('g4.iso.angle', 300, b => { const a = b.prompt.args; if (b.prompt.key === 'q.equi.angle') return b.answer === 60; if (b.prompt.key === 'q.iso.twoSame') return b.answer === 180 - 2 * a.a && b.answer >= 20; return b.answer * 2 + a.a === 180 && Number.isInteger(b.answer) && a.a % 10 === 0; }) === 0);
  ok('변의 길이 300: 정삼각형 3a · 이등변 2a+b(b<2a, b≠a) · 다른 변 = 합 − 2a · 그림', run('g4.tri.len', 300, b => { const a = b.prompt.args; if (b.prompt.key === 'q.equi.len') return b.answer === 3 * a.a; if (b.prompt.key === 'q.iso.len') return b.answer === 2 * a.a + a.b && a.b < 2 * a.a && a.b !== a.a; return b.answer === a.s - 2 * a.a && b.answer < 2 * a.a && b.answer !== a.a && typeof b.pic === 'string'; }) === 0); }

// ── 5. 정령 4학년 줄 · 이름 맞히기: 보호막 = 예각·둔각·정삼각형, 오답 이름은 그 모양에 틀린 것만(정삼각형엔 예각삼각형·이등변 이름 없음)
{ ok('spiritSet(4) = g4 · (3) = g3 그대로', spiritSet(4) === SPIRIT_SETS.g4 && spiritSet(3) === SPIRIT_SETS.g3 && SPIRIT_SETS.g4.fams.join() === 'atri,otri,equi');
  const qe = new QuestionEngine({ rng: createRng(174), concepts: ['g4.tri.name'] }); let bad = 0; const fams = new Set();
  for (let i = 0; i < 300; i++) { const sh = pickSpiritShape(qe.rng, 4); const b = qe.next({ fixed: { concept: sh.concept, fam: sh.fam, code: sh.code } }); fams.add(sh.fam);
    const ws = wrongsOf(b); const truthy = { atri: [NAME_CODE.atri], otri: [NAME_CODE.otri], equi: [NAME_CODE.equi, NAME_CODE.atri, NAME_CODE.iso, NAME_CODE.tri] }[sh.fam];   // 그 모양에 참인 이름들
    if (b.answer !== NAME_CODE[sh.fam] || b.pic !== PIC[sh.code] || ws.some(w => truthy.includes(w)) || !b.choices.every(c => c.pic && c.pic.startsWith('nm-'))) bad++; }
  ok('정령 4학년 300: 정답 = 보호막 이름 · 오답에 참인 이름 0 · 이름 판 3', bad === 0 && fams.size === 3, `bad ${bad} fams ${[...fams]}`);
  ok('정령 3학년 줄 그대로(직각 도형)', (() => { const sh = pickSpiritShape(createRng(5), 3); return ['rtri', 'rect', 'square'].includes(sh.fam); })()); }

// ── 6. 열쇠 문 4학년 줄
{ const rng = createRng(19); let bad = 0; const holes = new Set();
  for (let i = 0; i < 300; i++) { const p = makePuzzle('shape-key', rng, 4); holes.add(p.hole.family); const stones = p.stones.map(s => fam(s.num));
    if (!verifyPuzzle(p) || !SHAPE_KEY_SETS.g4.some(s => s.hole === p.hole.family) || !/^<svg/.test(picHtml(p.hole.pic)) || !T[p.hint1.key] || (p.hole.family === 'equi' && !stones.includes('iso')) || (p.hole.family === 'iso' && stones.includes('equi'))) bad++; }
  ok('열쇠 문 4학년 300: 구멍 4종 · verify · 정삼각형 구멍엔 이등변 돌(안 맞음) · 이등변 구멍엔 정삼각형 돌 없음(맞아 버리니)', bad === 0 && holes.size === 4, `bad ${bad} holes ${[...holes]}`);
  ok('열쇠 문 3학년 그대로', (() => { const p = makePuzzle('shape-key', createRng(16), 3); return SHAPE_KEY_SETS.g3.some(s => s.hole === p.hole.family); })()); }

// ── 7. 봇 4학년 완주 — 문제 전부 두 단원에서, 그림 보기·수 답 둘 다 · 3학년 판 불변
{ let wins = 0, qs = 0; for (const seed of [11, 12, 13]) { const r = playOne({ data, seed, grade: 4, acc: .8, stage: 'temple-2-1', rand: createRng(seed).next }); if (r.win) wins++; qs += r.q || 0; }
  ok('봇 4학년 temple-2-1 3판 완주', wins === 3, `wins ${wins} q ${qs}`);
  const rec = []; playOne({ data, seed: 31, grade: 4, acc: .8, stage: 'temple-2-1', rand: createRng(31).next, record: rec }); const cps = rec.filter(e => e.type === 'q:open').map(e => e.concept || '');
  const picN = cps.filter(c => GENERATORS[c] && GENERATORS[c].choicePic).length, numN = cps.filter(c => GENERATORS[c] && !GENERATORS[c].choicePic).length, other = cps.filter(c => !GENERATORS[c] || !['g4-1-u2', 'g4-1-u4'].includes(GENERATORS[c].unit)).length;
  ok('4학년 판: 문제 전부 g4-1-u2·g4-1-u4 · 그림 보기·수 답 둘 다', cps.length > 0 && other === 0 && picN > 0 && numN > 0, `열림 ${cps.length} 그림 ${picN} 수 ${numN} 밖 ${other}`);
  const rec3 = []; playOne({ data, seed: 31, grade: 3, acc: .8, stage: 'temple-2-1', rand: createRng(31).next, record: rec3 });
  ok('3학년 판 불변: g3-1-u2·g3-2-u3 만', rec3.filter(e => e.type === 'q:open').every(e => GENERATORS[e.concept] && ['g3-1-u2', 'g3-2-u3'].includes(GENERATORS[e.concept].unit))); }
console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
