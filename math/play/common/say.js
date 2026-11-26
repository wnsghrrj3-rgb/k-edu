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
/** 세는 말(단위) — 「물고기는 모두 4마리」(T03). 틀은 이 표에서 꺼내 쓴다. */
export const UNIT = { fish: '마리', cargo: '개' };
/** 한글 수말(T04 — 숫자를 배우기 전의 낱칸은 「셋 주세요」처럼 말로 주문한다). */
export const KO = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const word = n => KO[n] != null ? KO[n] : String(n);
/** 낱말 끝에 받침이 있는가(한글이면 글자로 · 숫자면 jong). */
export const hasJong = s => { s = String(s); const c = s.charCodeAt(s.length - 1); return c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 !== 0 : jong(+s); };
export const eulW = s => hasJong(s) ? '을' : '를';   /* 하나를 · 둘을 · 셋을 */
/** 한자 수말(숫자 이름 — 「셋, 삼」 · T05). */
export const SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
export const sino = n => SINO[n] != null ? SINO[n] : n > 10 && n < 20 ? '십' + SINO[n - 10] : String(n);   /* 십몇(T10 포장 틀 — 11~19 「십일 … 십구」) */
/** 우리 수말 10~19(T10 포장 틀 — 「열 · 열하나 · … · 열아홉」 · 10 까지는 word 와 같다). */
export const native = n => n >= 0 && n <= 10 ? KO[n] : n > 10 && n < 20 ? '열' + KO[n - 10] : String(n);
/** 덧셈식 읽기 둘(T08 타고 내리기 틀 · B07 부터 — 교과서 말 그대로 · 토씨는 받침에 맞게): 「3 더하기 2는 5와 같습니다」 · 「3과 2의 합은 5입니다」. */
export const plusRead = (a, b, c) => `${a} 더하기 ${b}${eun(b)} ${c}${wa(c)} 같습니다`;
export const sumRead = (a, b, c) => `${a}${wa(a)} ${b}의 합은 ${c}입니다`;
