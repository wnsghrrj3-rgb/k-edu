/* 내용 팩 — 놀이는 학년을 모른다. 학년·학기를 고르면 같은 놀이에 다른 문제가 들어간다.
 * 맛보기라 학기 단위(단원 단위는 본편에서). 문제 모양: pick · part · compose · place · judge · time
 * 설계: 핸드오프 kmotion/math-wizard/19_놀이_깊이_내용팩_설계_v1.md 1절 */
export const TERMS = [
  { id: '1-1', label: '1학년 1학기' }, { id: '1-2', label: '1학년 2학기' },
  { id: '2-1', label: '2학년 1학기' }, { id: '2-2', label: '2학년 2학기' }];

export function makePack(id, rnd = Math.random){
  const R = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const bat = n => [0, 1, 3, 6, 7, 8].includes(Math.abs(n) % 10);            // 수를 읽었을 때 받침이 있나
  const eul = n => n + (bat(n) ? '을' : '를'), wa = n => n + (bat(n) ? '과' : '와');
  const one = arr => arr[Math.floor(rnd() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // 보기 셋: 정답 + 그럴듯한 오답 둘(겹치지 않게, 0 이상)
  const opts3 = (ans, cands) => { const out = [ans]; for (const c of shuffle(cands)) { if (out.length >= 3) break; if (c >= 0 && !out.includes(c)) out.push(c); } let k = 1; while (out.length < 3) { if (!out.includes(ans + k)) out.push(ans + k); k++; } return shuffle(out); };

  const pick = {
    '1-1': () => { if (rnd() < .5) { const a = R(1, 7), b = R(1, 9 - a); return { q: `${a} + ${b}`, ans: a + b, opts: opts3(a + b, [a + b + 1, a + b - 1, Math.abs(a - b)]) }; }
      const a = R(3, 9), b = R(1, a - 1); return { q: `${a} − ${b}`, ans: a - b, opts: opts3(a - b, [a - b + 1, a - b - 1, a + b]) }; },
    '1-2': () => { const k = R(0, 2);
      if (k === 0) { const a = R(1, 9); return { q: `${a} + □ = 10`, ans: 10 - a, opts: opts3(10 - a, [10 - a + 1, 10 - a - 1, a]) }; }
      if (k === 1) { const a = R(3, 9), b = R(11 - a, 9); return { q: `${a} + ${b}`, ans: a + b, opts: opts3(a + b, [a + b + 1, a + b - 1, a + b - 10]) }; }
      const n = R(11, 18), b = R(n - 9, 9); return { q: `${n} − ${b}`, ans: n - b, opts: opts3(n - b, [n - b + 1, n - b - 1, n - b + 10]) }; },
    '2-1': () => { if (rnd() < .5) { const t = R(1, 7), o = R(3, 9), b = R(11 - o, 9), a = t * 10 + o; return { q: `${a} + ${b}`, ans: a + b, opts: opts3(a + b, [a + b - 10, a + b + 10, a + b + 1]) }; }
      const t = R(2, 8), o = R(0, 6), b = R(o + 1, 9), a = t * 10 + o; return { q: `${a} − ${b}`, ans: a - b, opts: opts3(a - b, [a - b + 10, a - b - 1, t * 10 + (b - o)]) }; },
    '2-2': () => { const a = R(2, 9), b = R(2, 9); return { q: `${a} × ${b}`, ans: a * b, opts: opts3(a * b, [a * (b + 1), a * (b - 1), a * b + 1, a + b]) }; } };

  // 가르기: n 을 a 와 □ 로
  const P = (n, a) => ({ n, a, label: `${wa(a)} □`, say: `${eul(n)} ${wa(a)} 몇으로 갈라 줘` });
  const part = {
    '1-1': () => { const n = R(4, 9); return P(n, R(1, n - 1)); },
    '1-2': () => rnd() < .5 ? P(10, R(1, 9)) : P(R(11, 16), 10),
    '2-1': () => P(R(12, 18), R(3, 9)),
    '2-2': () => { const h = R(3, 9); return { n: h * 2, a: h, label: '똑같이 둘로', say: `${eul(h * 2)} 똑같이 둘로 갈라 줘` }; } };

  // 모으기: 선반 다섯 가운데 둘을 맞대 target 만들기(맞는 짝이 꼭 하나 이상)
  const comp = (lo, hi, plo, phi) => () => { for (let guard = 0; guard < 300; guard++) { const target = R(lo, hi), a = R(plo, Math.min(phi, target - plo)), b = target - a; if (b < plo || b > phi || a === b) continue;
      const shelf = [a, b]; let g2 = 0; while (shelf.length < 5 && g2++ < 300) { const v = R(plo, phi); if (!shelf.includes(v)) shelf.push(v); }
      if (shelf.length === 5) return { target, shelf: shuffle(shelf), say: `${eul(target)} 만들어 줘` }; } return { target: 7, shelf: [3, 4, 5, 2, 6], say: '7을 만들어 줘' }; };
  const compose = { '1-1': comp(5, 9, 1, 8), '1-2': () => rnd() < .6 ? comp(10, 10, 1, 9)() : comp(11, 15, 2, 9)(), '2-1': comp(20, 50, 6, 38), '2-2': comp(30, 90, 8, 60) };

  // 주문 싣기: 수 n 을 단위 상자로
  const dig = (hi) => R(1, hi);
  const place = {
    '1-1': () => { const n = 10 * R(1, 2) + R(1, 5); return { n, units: [10, 1] }; },
    '1-2': () => { const n = 10 * R(2, 5) + R(1, 5); return { n, units: [10, 1] }; },
    '2-1': () => { const n = 100 * dig(4) + 10 * R(0, 4) + R(1, 4); return { n, units: [100, 10, 1] }; },
    '2-2': () => { const n = 1000 * dig(3) + 100 * R(0, 3) + 10 * R(0, 3) + R(1, 3); return { n, units: [1000, 100, 10, 1] }; } };

  // 조건 판단: gen() 은 절반쯤 조건에 맞는 값을 낸다
  const mk = (text, say, ok, yes, no) => ({ text, say, ok, gen: () => rnd() < .5 ? yes() : no() });
  const judge = {
    '1-1': () => { const k = R(3, 6); return mk(`${k}보다 큰 수만 막아라`, `${k}보다 큰 수만 막아`, v => v > k, () => R(k + 1, 9), () => R(1, k)); },
    '1-2': () => { if (rnd() < .5) { const k = one([40, 50, 60]); return mk(`${k}보다 큰 수만 막아라`, `${k}보다 큰 수만 막아`, v => v > k, () => R(k + 1, 99), () => R(10, k)); }
      return rnd() < .5 ? mk('홀수만 막아라', '홀수만 막아', v => v % 2 === 1, () => R(0, 9) * 2 + 1, () => R(1, 10) * 2) : mk('짝수만 막아라', '짝수만 막아', v => v % 2 === 0, () => R(1, 10) * 2, () => R(0, 9) * 2 + 1); },
    '2-1': () => { if (rnd() < .5) { const d = R(1, 9); return mk(`십의 자리 숫자가 ${d}인 수만 막아라`, `십의 자리 숫자가 ${d}인 수만 막아`, v => Math.floor(v / 10) % 10 === d, () => R(1, 9) * 100 + d * 10 + R(0, 9), () => { let v; do { v = R(100, 999); } while (Math.floor(v / 10) % 10 === d); return v; }); }
      const k = one([300, 500, 700]); return mk(`${k}보다 큰 수만 막아라`, `${k}보다 큰 수만 막아`, v => v > k, () => R(k + 1, 999), () => R(100, k)); },
    '2-2': () => { const d = one([2, 5, 3, 4, 7]); return mk(`${d}단 수만 막아라`, `${d}단에 나오는 수만 막아`, v => v % d === 0, () => d * R(1, 9), () => { let v; do { v = R(2, d * 9); } while (v % d === 0); return v; }); } };

  // 시각 맞추기
  const T = (h, m, step) => ({ h, m, step, label: m ? `${h}시 ${m}분` : `${h}시`, say: m === 30 ? `${h}시 삼십 분으로 맞춰 줘` : m ? `${h}시 ${m}분으로 맞춰 줘` : `${h}시로 맞춰 줘` });
  const time = {
    '1-1': () => T(R(1, 12), 0, 30),
    '1-2': () => T(R(1, 12), one([0, 30, 30]), 30),
    '2-1': () => T(R(1, 12), one([0, 10, 20, 30, 40, 50]), 5),
    '2-2': () => T(R(1, 12), R(0, 11) * 5, 5) };

  const term = TERMS.find(t => t.id === id) || TERMS[1];
  return { id: term.id, label: term.label, pick: pick[term.id], part: part[term.id], compose: compose[term.id], place: place[term.id], judge: judge[term.id], time: time[term.id] };
}
