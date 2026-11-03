// 길 구간 수학 퍼즐(07 문서 상황 D · 09 문서 9행) — 숫자 다리(모으기) · 크기 문(비교) · 규칙 징검다리(규칙)
// 게이지 없음(조작형) · 3번 틀리면 정답을 천천히 보여 주고 통과(숙달도에는 오답 1번, 보상 없음)
// 학년 폭: 1학년 9 이내 · 2학년 20 이내 · 3학년↑ 50 이내(규칙은 2·3·5 걸음)
import { eul, iga, wEun, wIga } from './josa.js';
import { PIC, FAMILY, CODES, OBJECTS, OBJ_KO, SHAPE_KO } from './pics.js';   // v2.11 모양 열쇠
const span = g => g <= 1 ? 9 : g <= 2 ? 20 : 50;
export const PUZZLE_CONCEPT = { 'number-bridge': 'g1.compose9', 'size-gate': 'g1.compare', 'rule-stones': 'g1.pattern', 'mushroom-add': 'g1.add.expr9', 'crystal-count': 'g1.count.tens', 'shape-key': 'g2.plane.pick', 'length-bridge': 'g2.len.ruler' };   // v3.1 길이 맞추기 다리(월드 3 길 B)

// v2.11 모양 열쇠(16 문서 8절 ③, 월드 2 「도형의 신전」 길 B): 문에 구멍(hole) — 꼭 맞는 모양의 열쇠 돌 3개 중 1. 답은 그림 코드(정수), 스킨은 id 만 그림.
// 학년 = 영역 안 단원(변환표와 같은 줄): 1학년 = 물건 구멍 → 같은 입체(7·8·9, g1.solid.same) · 2학년 = 평면 구멍 → 같은 모양(모양이 조금 달라도 같은 묶음이면 열림, g2.plane.pick)
// 3·4학년 = 직각 도형 구멍(직각·직각삼각형·직사각형·정사각형) → 오답은 「직각 없음」·「네 변 안 같음」 같은 개념 오답(g3.right.find·g3.quad.right). 직사각형 구멍엔 정사각형 돌을 안 둠(정사각형도 직사각형 — 두 답이 됨).
export const SHAPE_KEY_SETS = {
  g2: ['tri', 'quad', 'circ'].map(f => ({ hole: f, answer: f, wrongs: ['tri', 'quad', 'circ'].filter(x => x !== f), concept: 'g2.plane.pick', why: f => 'plane-' + f })),
  g3: [
    { hole: 'rtri', answer: 'rtri', wrongs: ['tri', 'rect'], concept: 'g3.right.find', why: f => f === 'tri' ? 'miss-right' : 'that-is-rect', hint: 'pz.key.hint.rtri' },
    { hole: 'rect', answer: 'rect', wrongs: ['quadNoRight', 'rtri'], concept: 'g3.quad.right', why: f => f === 'quadNoRight' ? 'quad-no-right' : 'that-is-rtri', hint: 'pz.key.hint.rect' },
    { hole: 'square', answer: 'square', wrongs: ['rect', 'quadNoRight'], concept: 'g3.quad.right', why: f => f === 'rect' ? 'rect-not-square' : 'quad-no-right', hint: 'pz.key.hint.square' },
    { hole: 'rangle', answer: 'rangle', wrongs: ['angle', 'angle'], concept: 'g3.right.find', why: () => 'miss-right', hint: 'pz.key.hint.rangle' },
  ],
  // v2.14 4학년 진짜 줄(4-1 4단원 삼각형): 구멍 = 이등변·정삼각형·예각삼각형·둔각삼각형. 정삼각형 구멍엔 이등변 돌도 안 맞음(변 셋이 같아야), 이등변 구멍의 오답은 세 변이 다른 돌만(정삼각형 돌은 이등변이라 맞아 버림)
  g4: [
    { hole: 'iso', answer: 'iso', wrongs: ['scal', 'scal'], concept: 'g4.tri.side', why: () => 'tri-scal', hint: 'pz.key.hint.iso' },
    { hole: 'equi', answer: 'equi', wrongs: ['iso', 'scal'], concept: 'g4.tri.side', why: f => f === 'iso' ? 'iso-not-equi' : 'tri-scal', hint: 'pz.key.hint.equi' },
    { hole: 'atri', answer: 'atri', wrongs: ['otri', 'rtri'], concept: 'g4.tri.byAngle', why: f => 'is-' + f, hint: 'pz.key.hint.atri' },
    { hole: 'otri', answer: 'otri', wrongs: ['atri', 'rtri'], concept: 'g4.tri.byAngle', why: f => 'is-' + f, hint: 'pz.key.hint.otri' },
  ],
};

// v2.4 spec = 학년 변환표 puzzle 줄(gradeTable.puzzleSpec) — bridge/mushroom 'mul' 이면 두 돌의 곱·버섯 점의 곱, ruleMul 이면 「배가 되는 규칙」 섞임. 1학년({})은 rng 호출까지 그대로(골든 불변).
export function makePuzzle(type, rng, grade = 1, opt = {}, spec = {}){
  const N = span(grade);
  if (type === 'number-bridge' && spec.bridge === 'mul') {
    // 「곱해서 T가 되는 두 돌」 — 돌 3개(2~9) 중 2개, 곱이 T인 쌍은 하나뿐(c ∉ {a, b} 면 a·c ≠ a·b, b·c ≠ a·b)
    const a = rng.int(2, 9); let b = rng.int(2, 9); if (b === a) b = a < 9 ? a + 1 : a - 1; const T = a * b;
    let c = rng.int(2, 9); for (let i = 0; i < 9 && (c === a || c === b); i++) c = c < 9 ? c + 1 : 2;
    const slots = rng.shuffle([a, b, c]); const ans = [slots.indexOf(a), slots.indexOf(b)].sort();
    return { type, id: `pz-bridge-x${T}-${a}-${b}-${c}`, concept: 'g3.share.mul', fact: `bridge:x${T}:${a}*${b}`, d: .25 + T / 81 * .5, need: 2, target: T, op: '×',
      prompt: { key: 'pz.bridge.mul', args: { t: T, j: iga(T) } }, stones: slots.map((n, s) => ({ slot: s, num: n })), answer: ans,
      hint1: { key: 'pz.bridge.mul.hint', args: { a: Math.min(a, b), t: T, j: eul(T) } } };
  }
  if (type === 'number-bridge') {
    // 「T를 만드는 두 돌」 돌 3개 중 2개 — 정답 쌍은 하나뿐
    const T = opt.target && opt.target <= N ? opt.target : rng.int(Math.min(5, N), N);
    let a, b, c; for (let i = 0; i < 40; i++) { a = rng.int(1, T - 1); b = T - a; if (a === b) continue;
      c = rng.int(1, Math.min(N, T + 3)); if (c === a || c === b || a + c === T || b + c === T) continue; break; }
    if (a === b) { a = Math.max(1, a - 1); b = T - a; } if (c === a || c === b || a + c === T || b + c === T) c = T + 2 > N ? Math.max(1, T - a - b) || 1 : T + 2;
    const slots = rng.shuffle([a, b, c]); const ans = [slots.indexOf(a), slots.indexOf(b)].sort();
    return { type, id: `pz-bridge-${T}-${a}-${b}-${c}`, concept: PUZZLE_CONCEPT[type], fact: `bridge:${T}:${a}+${b}`, d: .25 + T / N * .45, need: 2, target: T,
      prompt: { key: 'pz.plank', args: { t: T, j: eul(T) } }, stones: slots.map((n, s) => ({ slot: s, num: n })), answer: ans,
      hint1: { key: 'pz.plank.hint', args: { a: Math.min(a, b), t: T } } };
  }
  if (type === 'size-gate') {
    // 「더 큰(작은) 수의 문으로」 — 두 문 L/R, 자리 = 몸 위치(I1)
    const bigger = opt.bigger != null ? !!opt.bigger : rng.chance(.7);
    let a = rng.int(1, N), b = rng.int(1, N); if (a === b) b = a < N ? a + 1 : a - 1;
    const left = rng.chance(.5) ? a : b, right = left === a ? b : a; const ans = bigger ? (left > right ? 'L' : 'R') : (left < right ? 'L' : 'R');
    return { type, id: `pz-gate-${left}-${right}-${bigger ? 'big' : 'small'}`, concept: PUZZLE_CONCEPT[type], fact: `gate:${left},${right}`, d: .2 + Math.min(1, Math.abs(left - right) <= 2 ? .5 : .2), need: 1, bigger,
      prompt: { key: bigger ? 'pz.gate.big' : 'pz.gate.small', args: {} }, gate: { left, right }, answer: ans,
      hint1: { key: 'pz.gate.hint', args: { a: Math.max(left, right), b: Math.min(left, right), j: iga(Math.max(left, right)) } } };
  }
  if (type === 'rule-stones' && spec.ruleMul && rng.chance(spec.ruleMul)) {
    // 배가 되는 규칙(3학년↑): 3, 6, 12, □ — ×2 또는 ×3, 네 번째 돌까지 N 안
    const m = rng.pick([2, 3]); const start = rng.int(1, Math.max(1, Math.floor(N / (m * m * m)))); const seq = [start, start * m, start * m * m], ans = start * m * m * m;
    const wrongs = []; for (const w of rng.shuffle([seq[2] + (seq[2] - seq[1]), ans + 1, ans - 1, ans + seq[0], seq[2] + m])) { if (w > 0 && w !== ans && !wrongs.includes(w) && !seq.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? ans : wrongs[wi++]);
    return { type, id: `pz-rule-${start}x${m}`, concept: 'g3.pattern', fact: `rule:${start}*${m}`, d: .3 + (m - 2) * .3, need: 1, seq, step: null, mul: m,
      prompt: { key: 'pz.rule', args: { s: seq.join(', ') } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.rule.mul.hint', args: { d: m } } };
  }
  if (type === 'rule-stones') {
    // 2, 4, 6, □ — 앞 돌 3개 보여 주고 다음 돌 고르기(3개 중 1)
    const steps = grade <= 1 ? [1, 2] : grade <= 2 ? [2, 3, 5] : [2, 3, 5, 10]; const dlt = rng.pick(steps);
    const start = rng.int(1, Math.max(1, N - dlt * 3)); const seq = [start, start + dlt, start + dlt * 2], ans = start + dlt * 3;
    const wrongs = []; for (const w of rng.shuffle([ans + 1, ans - 1, ans + dlt, ans - dlt - dlt, ans + 2])) { if (w > 0 && w !== ans && !wrongs.includes(w) && !seq.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? ans : wrongs[wi++]);
    return { type, id: `pz-rule-${start}-${dlt}`, concept: PUZZLE_CONCEPT[type], fact: `rule:${start}+${dlt}`, d: .2 + dlt / 10 * .5, need: 1, seq, step: dlt,
      prompt: { key: 'pz.rule', args: { s: seq.join(', ') } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.rule.hint', args: { d: dlt } } };
  }
  if (type === 'mushroom-add' && spec.mushroom === 'mul') {
    // 버섯 점 곱하기 문: 점 a·b(각 2~4)의 곱 = 문 번호(4~16) — 오답 = 더한 수(a+b)·곱 ±1·한 번 덜 더함
    const a = rng.int(2, 4), b = rng.int(2, 4), T = a * b, hi = 16;
    const wrongs = []; for (const w of rng.shuffle([a + b, T + 1, T - 1, T - a, T + a])) { if (w >= 1 && w <= hi && w !== T && !wrongs.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    while (wrongs.length < 2) { const w = rng.int(1, hi); if (w !== T && !wrongs.includes(w)) wrongs.push(w); }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? T : wrongs[wi++]);
    return { type, id: `pz-mush-x${a}-${b}`, concept: 'g3.share.mul', fact: `mush:${a}*${b}`, d: .15 + T / 16 * .45, need: 1, target: T, mush: { a, b }, op: '×',
      prompt: { key: 'pz.mush.mul', args: { a, b } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.mush.mul.hint', args: { a, b, j: eul(a) } } };
  }
  if (type === 'mushroom-add') {
    // 버섯 점 더하기 문(09 문서 9행, 1-2 버섯 마을 길): 버섯 두 송이의 점(a·b) 합 = 문 번호 — 문 3개 중 1(점을 세어 더한다, 글자 없음)
    const hi = Math.min(N, 9), a = rng.int(1, 4), b = rng.int(1, Math.min(4, hi - a)), T = a + b;
    const wrongs = []; for (const w of rng.shuffle([T + 1, T - 1, Math.max(a, b), a + b + 2, Math.abs(a - b)])) { if (w >= 1 && w <= hi && w !== T && !wrongs.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    while (wrongs.length < 2) { const w = rng.int(1, hi); if (w !== T && !wrongs.includes(w)) wrongs.push(w); }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? T : wrongs[wi++]);
    return { type, id: `pz-mush-${a}-${b}`, concept: PUZZLE_CONCEPT[type], fact: `mush:${a}+${b}`, d: .15 + T / 9 * .45, need: 1, target: T, mush: { a, b },
      prompt: { key: 'pz.mush', args: { a, b } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.mush.hint', args: { a, b } } };
  }
  if (type === 'crystal-count') {
    // 수정 묶음 세기(09 문서 9행, 1-3 반딧불 동굴): 벽 수정이 10개씩 묶음 n개 + 낱개 m개 → 모두 몇 개? 돌 3개 중 1
    // 1학년 10~49(50까지의 수) · 2학년 10~99 · 3학년↑ 백 묶음 1~4 더해 100~499. 오답 = 자리 바꿈(m·n)·묶음 ±1·낱개 ±1 — 「묶음을 낱개처럼 세기」 오개념
    const hund = grade >= 3 ? rng.int(1, 4) : 0, tens = rng.int(1, grade <= 1 ? 4 : 9), ones = rng.int(grade <= 1 ? 1 : 0, 9), T = hund * 100 + tens * 10 + ones;
    const cands = [hund * 100 + ones * 10 + tens, T + 10, T - 10, T + 1, T - 1, hund * 100 + tens + ones];
    const wrongs = []; for (const w of rng.shuffle(cands.slice(0, 3)).concat(cands.slice(3))) { if (w > 0 && w !== T && !wrongs.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? T : wrongs[wi++]);
    return { type, id: `pz-count-${T}`, concept: PUZZLE_CONCEPT[type], fact: `count:${T}`, d: .2 + tens / 9 * .3 + (hund ? .2 : 0), need: 1, target: T, bundle: { hund, tens, ones },
      prompt: { key: hund ? 'pz.count3' : 'pz.count', args: { h: hund, t: tens, o: ones } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: hund ? 'pz.count3.hint' : 'pz.count.hint', args: { h: hund, t: tens, o: ones, tt: tens * 10 } } };
  }
  if (type === 'shape-key') {
    if (grade <= 1) {
      // 1학년: 물건 구멍(통조림 등) → 같은 입체 열쇠(상자 7·둥근 기둥 8·공 9) — 보기 셋 = 입체 전부
      const fam = rng.pick(['box', 'cyl', 'ball']), obj = rng.pick(OBJECTS[fam]), ans = CODES[fam][0];
      const codes = rng.shuffle([CODES.box[0], CODES.cyl[0], CODES.ball[0]]), slot = codes.indexOf(ans);
      return { type, id: `pz-key-${obj}`, concept: 'g1.solid.same', fact: `key:${obj}`, d: .2 + (fam === 'cyl' ? .15 : fam === 'box' ? .1 : 0), need: 1, hole: { pic: obj, name: OBJ_KO[obj], family: fam, kind: 'solid' },
        prompt: { key: 'pz.key.solid', args: { o: OBJ_KO[obj] } }, stones: codes.map((n, s) => ({ slot: s, num: n })), answer: [slot],
        hint1: { key: 'pz.key.solid.hint', args: { o: OBJ_KO[obj], e: wEun(OBJ_KO[obj]), n: SHAPE_KO[fam] } } };
    }
    const set = rng.pick(grade <= 2 ? SHAPE_KEY_SETS.g2 : grade >= 4 ? SHAPE_KEY_SETS.g4 : SHAPE_KEY_SETS.g3);   // v2.14 4학년 줄
    const holeCode = rng.pick(CODES[set.hole]), hole = PIC[holeCode];
    const other = CODES[set.answer].filter(c => c !== holeCode), ans = other.length ? rng.pick(other) : holeCode;   // 같은 묶음의 다른 변형(한 그림으로 외우지 않게)
    const wrongs = []; for (const f of set.wrongs) { const pool = CODES[f].filter(c => !wrongs.includes(c)); wrongs.push(rng.pick(pool)); }
    const codes = rng.shuffle([ans, ...wrongs]), slot = codes.indexOf(ans), name = SHAPE_KO[set.answer];
    return { type, id: `pz-key-${hole}-${ans}`, concept: set.concept, fact: `key:${set.hole}`, d: grade <= 2 ? .25 : .35 + (set.hole === 'square' ? .15 : set.hole === 'rect' ? .1 : 0), need: 1, hole: { pic: hole, name, family: set.answer, kind: 'plane' },
      prompt: { key: 'pz.key', args: {} }, stones: codes.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: set.hint || 'pz.key.hint', args: { n: name, j: wIga(name) } } };
  }
  if (type === 'length-bridge') {
    // v3.1 길이 맞추기 다리(17 문서 8절 ②, 09 문서 9행, 월드 3 「측정의 협곡」 길 B): 끊어진 다리 틈(hole)에 꼭 맞는 길이의 널빤지 3개 중 1.
    // 1학년(1-1 4단원 비교하기) = 눈으로 비교: 틈 그림 'gap:n' · 널빤지 그림 'plank:a'(숫자 없음, 틈과 같은 폭만 맞음) — 오답은 ±1·±2 칸(한쪽 끝을 맞춰 보면 티가 남)
    // 2학년↑(2-1 4단원 길이 재기) = 자로 재기: 틈 아래 자 'gapcm:n' → 「n cm 널빤지」 숫자 돌(끝 눈금을 그대로 읽는 read-end 오답 포함)
    if (grade <= 1) {
      const n = rng.int(3, 7); const cands = rng.shuffle([n - 1, n + 1, n - 2, n + 2].filter(v => v >= 2 && v <= 9)); const ws = cands.slice(0, 2);
      const lens = rng.shuffle([n, ...ws]), slot = lens.indexOf(n);
      return { type, id: `pz-bridge-${n}-${ws.join('')}`, concept: 'g1.cmp.long', fact: `bridge:${n}`, d: .2 + (ws.some(w => Math.abs(w - n) === 1) ? .2 : 0), need: 1, gap: n, hole: { pic: `gap:${n}`, name: '틈', family: 'gap', kind: 'length' },
        prompt: { key: 'pz.plank', args: {} }, stones: lens.map((a, s) => ({ slot: s, num: a, pic: `plank:${a}` })), answer: [slot], hint1: { key: 'pz.plank.hint', args: {} } };
    }
    const a = rng.next() < .5 ? 0 : rng.int(1, 3), n = rng.int(2, Math.min(7, 10 - a)), b = a + n;   // 자 눈금 a 부터 b 까지가 틈 → n cm
    const cands = [a > 0 ? b : n + 2, n + 1, n - 1, n + 2]; const ws = []; for (const w of cands) { if (w >= 1 && w <= 10 && w !== n && !ws.includes(w)) ws.push(w); if (ws.length === 2) break; }
    const mm = grade >= 3 ? 10 : 1;   // v3.2 3학년↑ = 같은 자, 널빤지는 mm 로 적힘(1 cm = 10 mm, 3-1 5단원) — 틈 n cm 에 n0 mm 널빤지
    const lens = rng.shuffle([n, ...ws]).map(v => v * mm), slot = lens.indexOf(n * mm);
    return { type, id: `pz-bridge-${a}-${b}${mm > 1 ? 'mm' : ''}`, concept: mm > 1 ? 'g3.len.mm' : 'g2.len.ruler', fact: `bridge${mm > 1 ? 'mm' : 'cm'}:${a},${b}`, d: .25 + (a > 0 ? .25 : 0) + n / 20 + (mm > 1 ? .1 : 0), need: 1, gap: n * mm, hole: { pic: `gapcm:${a},${b}`, name: `${n * mm} ${mm > 1 ? 'mm' : 'cm'}`, family: 'gap', kind: 'length' },
      prompt: { key: mm > 1 ? 'pz.plankmm' : 'pz.plankcm', args: {} }, stones: lens.map((v, s) => ({ slot: s, num: v, pic: null })), answer: [slot], hint1: { key: mm > 1 ? 'pz.plankmm.hint' : 'pz.plankcm.hint', args: {} } };
  }
  throw new Error('퍼즐 종류 없음: ' + type);
}
export function verifyPuzzle(p){
  if (p.type === 'number-bridge') { const n = p.stones.map(s => s.num), f = p.op === '×' ? (x, y) => x * y : (x, y) => x + y; let pairs = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (f(n[i], n[j]) === p.target) pairs++; return pairs === 1 && f(n[p.answer[0]], n[p.answer[1]]) === p.target; }
  if (p.type === 'size-gate') { const { left, right } = p.gate; return left !== right && ((p.bigger ? left > right : left < right) ? 'L' : 'R') === p.answer; }
  if (p.type === 'rule-stones') { const n = p.stones.map(s => s.num), nx = p.mul ? p.seq[2] * p.mul : p.seq[2] + p.step; return n.filter(x => x === nx).length === 1 && n[p.answer[0]] === nx; }
  if (p.type === 'mushroom-add') { const n = p.stones.map(s => s.num), T = p.op === '×' ? p.mush.a * p.mush.b : p.mush.a + p.mush.b; return T === p.target && n.filter(x => x === T).length === 1 && n[p.answer[0]] === T; }
  if (p.type === 'crystal-count') { const n = p.stones.map(s => s.num), b = p.bundle, T = b.hund * 100 + b.tens * 10 + b.ones; return T === p.target && n.filter(x => x === T).length === 1 && n[p.answer[0]] === T; }
  if (p.type === 'shape-key') { const fam = c => FAMILY[PIC[c]]; const n = p.stones.map(s => s.num), hit = n.filter(c => fam(c) === p.hole.family); if (p.hole.kind === 'plane' && p.hole.family === 'rect' && n.some(c => fam(c) === 'square')) return false; return hit.length === 1 && fam(n[p.answer[0]]) === p.hole.family && n.every(c => !!PIC[c]); }
  if (p.type === 'length-bridge') { const n = p.stones.map(s => s.num); return n.filter(v => v === p.gap).length === 1 && n[p.answer[0]] === p.gap && new Set(n).size === 3 && n.every(v => v >= 1 && v <= 100) && (p.hole.pic.startsWith('gap:') ? p.stones.every(s => s.pic === 'plank:' + s.num) : p.stones.every(s => s.pic === null)); }
  return false;
}
