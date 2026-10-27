// 숫자 읽기에 맞는 조사(1학년 문장) — 0 영·1 일·3 삼·6 육·7 칠·8 팔 은 받침
const last = n => Math.abs(n) % 10;   // 9 이하만 쓰는 1학년 범위
const hasBatchim = n => [0, 1, 3, 6, 7, 8].includes(last(n));
export const wa = n => hasBatchim(n) ? '과' : '와';
export const eun = n => hasBatchim(n) ? '은' : '는';
export const eul = n => hasBatchim(n) ? '을' : '를';
