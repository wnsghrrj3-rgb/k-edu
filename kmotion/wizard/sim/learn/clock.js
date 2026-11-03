// v3.4 시간 정령 「시계 보호막」(09 문서 5절 W3 6행 「시간 정령」 · 17 문서 2차 ⑤) — 시계 읽기 학년 줄. 보호막 = 시계 그림(`clock:h,m[,s]`), 답 = 시각(정수 부호화)
// 1학년 = 1-2 3단원 「모양과 시각」 [2수03-07]: 「몇 시」·「몇 시 30분」 · 2학년 = 2-2 4단원 「시각과 시간」 02~04차시: 5분 단위·1분 단위 「몇 시 몇 분」 · 3학년 = 3-1 5단원 「길이와 시간」 [4수03-13]: 초 단위(초침) · 4학년 = 3학년 임시
// 부호화: 초 없으면 h*100+m(7시 30분 = 730) · 초 있으면 h*10000+m*100+s(7시 30분 15초 = 73015) — 구슬엔 이 수가 안 뜨고 글자 판 `tm:h,m[,s]` 로 보임(계약 choices[].pic)
// 오답은 지도서(2-2-4 248쪽 「학생의 예상 반응」)의 오개념 그대로: 긴바늘 숫자를 그대로 분으로(min-num) · 짧은바늘 숫자를 분으로/바늘 바꿔 읽기(swap) · 짧은바늘이 지나간 다음 숫자로 시 읽기(hour-next) · 30분을 정각으로(half-as-hour) · 1분 어긋남(min-one) · 초침 숫자를 초로(sec-num)
export const TIME_SETS = {
  g1: { concept: 'g1.clock.read', unit: 'g1-2-u3', fams: ['hour', 'half'] },
  g2: { concept: 'g2.clock.read', unit: 'g2-2-u4', fams: ['five', 'one'] },
  g3: { concept: 'g3.clock.read', unit: 'g3-1-u5', fams: ['one', 'sec'] },
};
export const timeSet = grade => grade <= 1 ? TIME_SETS.g1 : grade === 2 ? TIME_SETS.g2 : TIME_SETS.g3;   // 4학년 = g3 임시
export const encodeTime = (h, m, s = null) => s == null ? h * 100 + m : h * 10000 + m * 100 + s;
export function decodeTime(v){ if (v >= 10000) return { h: Math.floor(v / 10000), m: Math.floor(v / 100) % 100, s: v % 100 }; return { h: Math.floor(v / 100), m: v % 100, s: null }; }
export const timePic = v => { const t = decodeTime(v); return 'tm:' + t.h + ',' + t.m + (t.s == null ? '' : ',' + t.s); };
export const clockPic = (h, m, s = null) => 'clock:' + h + ',' + m + (s == null ? '' : ',' + s);
export function parseClock(code){ const a = String(code).replace(/^clock:/, '').split(',').map(Number); return { h: a[0], m: a[1], s: a.length > 2 ? a[2] : null }; }
/** 묶음(fam)에 맞는 시각 하나 — { fam, h, m, s } */
export function genTime(rng, fam){ const h = rng.int(1, 12);
  if (fam === 'hour') return { fam, h, m: 0, s: null };
  if (fam === 'half') return { fam, h, m: 30, s: null };
  if (fam === 'five') { let m = rng.int(1, 11) * 5; return { fam, h, m, s: null }; }   // 5~55(정각은 1학년 몫)
  if (fam === 'one') { let m = rng.int(1, 59); if (m % 5 === 0) m += 1; if (m > 59) m = 58; return { fam, h, m, s: null }; }   // 5분 단위가 아닌 분
  return { fam, h, m: rng.int(0, 59), s: rng.int(1, 11) * 5 };   // sec: 초는 5초 단위(초침 숫자 읽기)
}
const wrapH = h => ((h - 1 + 12) % 12) + 1;
/** 오개념 오답 [값, 태그] — 묶음별, 값이 정답과 같거나 범위 밖이면 뺀 뒤 호출자가 2개 이상인지 본다 */
export function timeWrongs(t){ const { fam, h, m, s } = t, E = (hh, mm, ss) => encodeTime(hh, mm, s == null ? null : ss), out = [];
  if (fam === 'hour') { out.push([E(wrapH(h + 1), 0), 'clock-hour-next'], [E(wrapH(h - 1), 0), 'clock-hour-prev'], [E(h, 30), 'clock-half-as-hour']); }
  else if (fam === 'half') { out.push([E(h, 0), 'clock-half-as-hour'], [E(wrapH(h + 1), 30), 'clock-hour-next'], [E(6, h * 5 % 60), 'clock-swap']); }
  else if (fam === 'five') { out.push([E(h, m / 5), 'clock-min-num'], [E(wrapH(h + 1), m), 'clock-hour-next'], [E(wrapH(m / 5 || 12), h * 5 % 60), 'clock-swap']); }
  else if (fam === 'one') { out.push([E(h, m + 1 > 59 ? m - 1 : m + 1), 'clock-min-one'], [E(h, Math.round(m / 5) * 5 % 60), 'clock-round-five'], [E(wrapH(h + 1), m), 'clock-hour-next']); }
  else { out.push([E(h, m, s / 5), 'clock-sec-num'], [E(h, m, (s + 5) % 60), 'clock-sec-five'], [E(wrapH(h + 1), m, s), 'clock-hour-next']); }
  const ans = encodeTime(h, m, s), seen = new Set([ans]); return out.filter(([v]) => { if (seen.has(v) || v < 0) return false; seen.add(v); return true; });
}
