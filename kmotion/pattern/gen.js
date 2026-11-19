// 규칙 찾기 · 문제 만들기(화면·카메라와 무관한 순수 함수) — 1학년 2학기 「규칙 찾기」
//  다음은 뭘까?  1단계 AB(보기 2) → 2단계 ABC·AAB·ABB → 3단계 AABB·ABAC·AAAB·ABBC(모양과 색) → 4단계 가운데 빈칸
//                → 5단계 수가 되풀이·1씩 → 6단계 뛰어 세기(2·5·10씩, 거꾸로, 가운데 빈칸) → 7단계부터 3~6단계 섞임
//  몸으로 규칙   1단계 AB 다 보임 → 2단계 ABC·AAB → 3단계 뒤 3칸 가림 → 4단계 뒤 4칸 가림 → 5단계 첫 마디만 보임 → 6단계부터 섞임
const SETS = {
  color: ['🔴', '🔵', '🟡', '🟢', '🟣'],
  fruit: ['🍎', '🍌', '🍇', '🍊', '🍓'],
  animal: ['🐶', '🐱', '🐰', '🐻', '🐸'],
  mixed: ['🔴', '🟦', '🔺', '⭐', '🟩', '🔷'] };
const UNITS = { 1: ['AB'], 2: ['ABC', 'AAB', 'ABB'], 3: ['AABB', 'ABAC', 'AAAB', 'ABBC'] };
const pick = (a, r) => a[Math.floor(r() * a.length)];
function shuffle(a, r){ a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const uniq = a => [...new Set(a)];

function repeat(unit, len){ const out = []; for (let i = 0; i < len; i++) out.push(unit[i % unit.length]); return out; }
function build(full, hole, pool, n, rule, kind, r){
  const answer = full[hole]; let wrong = shuffle(uniq(pool).filter(x => x !== answer), r).slice(0, n - 1);
  const choices = shuffle([answer, ...wrong], r);
  return { cells: full.map((x, i) => i === hole ? null : x), hole, answer, choices, rule, kind };
}
function picture(stage, r, middle){
  const tpl = pick(UNITS[Math.min(3, stage)], r);
  const set = shuffle(SETS[stage === 1 ? 'color' : stage === 2 ? pick(['fruit', 'animal', 'color'], r) : 'mixed'], r);
  const unit = [...tpl].map(ch => set[ch.charCodeAt(0) - 65]); const u = unit.length;
  const len = Math.min(9, Math.max(7, 2 * u + 1)); const full = repeat(unit, len);
  const hole = middle ? u + Math.floor(r() * (len - 1 - u)) : len - 1;
  const used = uniq(unit); const pool = used.concat(set.filter(x => !used.includes(x)));
  return build(full, hole, pool, stage === 1 ? 2 : 3, unit.join(' ') + ' 가 되풀이돼요', 'pic', r);
}
function numberRepeat(r){
  const tpl = pick(['AB', 'AAB', 'ABB', 'ABC'], r); const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r);
  const unit = [...tpl].map(ch => ds[ch.charCodeAt(0) - 65]); const len = Math.max(7, 2 * unit.length + 1); const full = repeat(unit, len);
  return build(full, len - 1, uniq(unit).concat(ds.slice(3, 6)), 3, unit.join(' ') + ' 가 되풀이돼요', 'num', r);
}
function numberStep(step, r, middle){
  const len = 6, a = Math.abs(step); let start;
  if (step > 0) start = a === 10 ? pick([10, 20, 30, 3, 5, 12], r) : a === 5 ? pick([5, 10, 15, 20], r) : a === 2 ? 1 + Math.floor(r() * 12) : 1 + Math.floor(r() * 20);
  else start = a === 10 ? pick([90, 80, 70, 95], r) : a === 5 ? pick([50, 45, 40, 30], r) : a === 2 ? 14 + Math.floor(r() * 10) : 8 + Math.floor(r() * 20);
  const full = Array.from({ length: len }, (_, i) => start + step * i);
  const hole = middle ? 2 + Math.floor(r() * 3) : len - 1; const ans = full[hole];
  const pool = [ans + a, ans - a, ans + 1, ans - 1, ans + 2 * a, ans + 2, ans - 2].filter(x => x >= 0 && x <= 100);
  return build(full, hole, shuffle(pool.slice(0, 4), r).concat(pool.slice(4)), 3, `${a}씩 ${step > 0 ? '커져요' : '작아져요'}`, 'num', r);
}
/** 다음은 뭘까? 한 문제. stage 1~ */
export function makeQuestion(stage, r = Math.random){
  if (stage > 6) stage = 3 + Math.floor(r() * 4);
  if (stage <= 3) return picture(stage, r, false);
  if (stage === 4) return picture(2 + Math.floor(r() * 2), r, true);
  if (stage === 5) return r() < .5 ? numberRepeat(r) : numberStep(r() < .7 ? 1 : -1, r, false);
  return numberStep(pick([2, 2, 5, 10, -2, -10], r), r, r() < .4);
}

const BODY = { easy: ['rest', 'arms_up', 'arms_side'], mid: ['rest', 'arms_up', 'arms_side', 'raise_right', 'raise_left'], all: ['rest', 'arms_up', 'arms_side', 'raise_right', 'raise_left', 'hands_top', 'cross'] };
const ROWS = [null,
  { tpl: ['AB'], pool: 'easy', show: 8 }, { tpl: ['ABC', 'AAB'], pool: 'easy', show: 8 }, { tpl: ['AB', 'ABC'], pool: 'mid', show: 5 },
  { tpl: ['AAB', 'ABB', 'ABC'], pool: 'mid', show: 4 }, { tpl: ['ABAC', 'AABB'], pool: 'all', show: 4 } ];
/** 몸으로 규칙 한 줄(8칸). show = 보이는 칸 수(그 뒤는 「?」) */
export function makeRow(level, r = Math.random){
  const L = level <= 5 ? ROWS[level] : { tpl: ['ABC', 'AAB', 'ABB', 'ABAC', 'AABB'], pool: 'all', show: 0 };
  const tpl = pick(L.tpl, r); const ps = shuffle(BODY[L.pool], r); const unit = [...tpl].map(ch => ps[ch.charCodeAt(0) - 65]);
  return { seq: repeat(unit, 8), unit, show: L.show || unit.length + 1, level };
}
