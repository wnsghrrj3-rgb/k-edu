// 생성기 등록부(14 문서 2절) — 단원 파일 하나 = import 한 줄 + 목록 한 줄. 여기 말고는 아무 데도 손대지 않는다.
import { G1U3 } from './g1u3.js';
import { G1U1 } from './g1u1.js';   // 비교형·규칙형(강화 수정) — 베프 몫, 14 문서 8절
import { G2U1 } from './g2u1.js';   // 2-1 1단원 「세 자리 수」 비교형·규칙형 — 베프 몫(월드 2 장면 전엔 풀에 안 들어감)
export const UNITS = [G1U3, G1U1, G2U1];
export const GENERATORS = Object.assign({}, ...UNITS);
