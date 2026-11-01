// 3학년 2학기 2단원 「나눗셈」 생성기 — 08 문서 6절 · 정본 kedu/curriculum/math/g3_2/unit2 [4수01-05·06·08]
// 이 파일의 몫 = **(두 자리)÷(한 자리), 나머지 0** 만(정본 l02 (몇십)÷(몇) 내림 없음 · l03 내림 있음 · l04 (몇십몇)÷(몇) 내림 없음 · l05 내림 있음). 나머지 있는 나눗셈(l06~l07)·(세 자리)÷(한 자리)(l08~l09)는 오푸스 14 문서 #12 가 이 파일에 키를 **더한다**(등록부·unit 그대로).
// 왜 지금: 변환표 4학년 장면 키 `g3.div.2x1`(15 문서 7절 — 4학년 묶음 = 두 자리 ÷ 한 자리, 힘 ≤12·합 ≤96). 교육과정상 3-2 내용이라 unit g3-2-u2 · 키 접두 g3(gen.mjs 규칙).
// 오개념(정본 l03·l05·l09 「잘못 계산한 곳 찾기」): 내림 안 함 — 십의 자리에서 남은 10 을 일의 자리로 안 내림 45÷3 → 4÷3=1…1 버리고 5÷3=1 → 「11」(carry-drop) · 10배 누락 60÷3=2(div-tens-miss) · 나누는 수와 몫 바꿈(swap-div) · 뺌(sub-instead) · 몫 ±1(off-one) · 몫 ±10(off-ten)
import { wIga } from '../josa.js';
const wEul = w => { const c = w.charCodeAt(w.length - 1); return (c - 0xAC00) % 28 !== 0 ? '을' : '를'; };   // 세는 말 뒤 을/를
const THINGS = [['배지', '개'], ['손수건', '장'], ['구슬', '개'], ['색종이', '장'], ['쿠키', '개'], ['공책', '권'], ['풍선', '개'], ['딸기', '개']];
// 검산용: 몇 번 덜어낼 수 있는지 세기(gen 의 곱셈과 다른 방법)
const takeAway = (t, b) => { let n = 0, r = t; while (r >= b && n < 60) { r -= b; n++; } return r === 0 ? n : -1; };
// 내림 = 십의 자리가 나누는 수로 안 나누어떨어짐(십의 자리 ÷ b 에 나머지)
const hasCarry = (t, b) => Math.floor(t / 10) % b !== 0;
// 오개념 값
const carryDrop = (t, b) => Math.floor(Math.floor(t / 10) / b) * 10 + Math.floor((t % 10) / b);   // 자리마다 따로 나누고 남은 건 버림(45÷3 → 1·1 → 11)
const kinds = ['tensNo', 'tensCarry', 'no', 'carry'];   // (몇십)÷(몇) 내림 없음 / 있음 · (몇십몇)÷(몇) 내림 없음 / 있음
function pickDiv(rng, kind){ for (let x = 0; x < 120; x++) { const b = rng.int(2, 9), q = rng.int(10, 49), t = b * q; const tens = kind.startsWith('tens');
    if (t > 99) continue; if (tens !== (t % 10 === 0)) continue;   // 몫 10~49 = 곱셈구구 밖(3-1 과 구분)
    const c = hasCarry(t, b); if ((kind === 'tensNo' || kind === 'no') ? c : !c) continue;
    return [t, b, q]; }
  return kind === 'tensNo' ? [60, 3, 20] : kind === 'tensCarry' ? [30, 2, 15] : kind === 'no' ? [26, 2, 13] : [45, 3, 15]; }
const dOf = { tensNo: .1, tensCarry: .35, no: .3, carry: .65 };

const BASE = {
  'g3.div.2x1': { id: 'div2x1', gen(rng, d){ const kind = rng.next() < d ? rng.pick(['carry', 'carry', 'tensCarry']) : rng.pick(['tensNo', 'no', 'no']); const [t, b, q] = pickDiv(rng, kind);
      return { concept: 'g3.div.2x1', fact: `div2:${t},${b}`, d: dOf[kind] + (b - 2) / 7 * .15, type: kind === 'carry' ? 'calc2' : 'calc1', prompt: { key: 'q.g3.div', args: { t, b } }, a: t, b, op: '÷', answer: q, kind,
        wrongs: [[carryDrop(t, b), 'carry-drop'], ...(kind.startsWith('tens') && q % 10 === 0 ? [[q / 10, 'div-tens-miss']] : []), [b, 'swap-div'], [t - b, 'sub-instead'], [q + 1, 'off-one'], [q - 1, 'off-one'], [q + 10, 'off-ten'], [q - 10, 'off-ten']] }; },
    verify: q => takeAway(q.a, q.b) === q.answer && q.a >= 10 && q.a <= 99 && q.b >= 2 && q.b <= 9 && q.answer >= 10 && q.answer <= 49 },
  // 문장제 — 등분제(「b명이 똑같이 나누면 한 명은 몇 개」, 정본 l01 배지 96÷3) · 포함제(「k개씩 묶으면 몇 묶음」)
  'g3.div2.word': { id: 'div2Word', word: true, gen(rng, d){ const kind = rng.next() < d ? 'carry' : 'no'; const [t, b, q] = pickDiv(rng, kind); const [n, u] = rng.pick(THINGS); const share = rng.chance(.5);
      return share
        ? { concept: 'g3.div2.word', fact: `div2w:s:${t},${b}`, d: dOf[kind] + .15, type: 'word1', prompt: { key: 'q.g3.word.share', args: { n, u, t, b, j1: wIga(n) } }, a: t, b, op: '÷', answer: q, share, kind,
            wrongs: [[carryDrop(t, b), 'carry-drop'], [b, 'ask-swap'], [t - b, 'sub-instead'], [q + 1, 'off-one'], [q - 1, 'off-one'], [q + 10, 'off-ten']] }
        : { concept: 'g3.div2.word', fact: `div2w:g:${t},${b}`, d: dOf[kind] + .2, type: 'word1', prompt: { key: 'q.g3.word.group', args: { n, u, t, k: b, j2: wEul(u) } }, a: t, b, op: '÷', answer: q, share, kind,
            wrongs: [[carryDrop(t, b), 'carry-drop'], [b, 'ask-swap'], [t - b, 'sub-instead'], [q + 1, 'off-one'], [q - 1, 'off-one'], [q + 10, 'off-ten']] }; },
    verify: q => takeAway(q.a, q.b) === q.answer && q.a >= 10 && q.a <= 99 && q.answer >= 10 && q.answer <= 49 },
};
const HINT1 = { 'g3.div.2x1': q => q.kind === 'tensNo' ? 'hint.g3.divTens' : 'hint.g3.div2Col', 'g3.div2.word': q => q.share ? 'hint.g3.divShare' : 'hint.g3.divGroup' };
export const G3_2_U2 = {};
for (const [k, g] of Object.entries(BASE)) G3_2_U2[k] = Object.assign({}, g, { unit: 'g3-2-u2', max: 99, gen(rng, d, opt){ const q = g.gen(rng, d, opt);
  q.type = q.type || 'calc1'; q.hint1 = { key: HINT1[k](q), args: { t: q.a, b: q.b, q: q.answer, tt: Math.floor(q.a / 10), tq: q.a / 10 } };
  // 2단계 = 묶음 그림(b줄 × 몫) — 한 줄이 12 를 넘으면 그림이 안 읽히므로 null
  q.hint2 = q.b >= 2 && q.b <= 8 && q.answer <= 12 ? { kind: 'groups', n: q.b, each: q.answer } : null; return q; } });
