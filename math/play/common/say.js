/* 수학 놀이터 「띠의 말」(정본 27 문서 5-9절 — 띠는 교과서 말 그대로 · 토씨는 받침에 맞게 · T02 에서 split/ 에서 옮겨 옴).
 *   「1과 3을 모으면 ?」 · 「5를 가르면 1과 ?」 — 「1와 1」 같은 말이 화면에 나가면 안 된다. 식 기호(+ − =)는 그 기호를 배우는 낱칸부터.
 *   수의 받침: 영 · 일 · 삼 · 육 · 칠 · 팔 · 십(0 1 3 6 7 8, 10 의 배수)은 받침이 있다 — 끝자리로 본다(백 · 천도 받침이 있다). */
export const jong = n => { n = Math.abs(Math.round(n)); return n % 10 === 0 ? true : [1, 3, 6, 7, 8].includes(n % 10); };
export const wa = n => jong(n) ? '과' : '와';     /* 1과 · 2와 */
export const eul = n => jong(n) ? '을' : '를';    /* 1을 · 2를 */
export const iga = n => jong(n) ? '이' : '가';    /* 1이 · 2가 */
export const eun = n => jong(n) ? '은' : '는';    /* 1은 · 2는 */
/** 「N을 가르면」 · 「b를 모으면」 — 숫자 뒤에 붙는 말(? 는 묻는 동안 「를」로 둔다). */
export const garu = n => (n === '?' ? '를' : eul(n)) + ' 가르면';
export const moeu = n => (n === '?' ? '를' : eul(n)) + ' 모으면';
