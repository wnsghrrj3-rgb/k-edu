/* 수학 놀이터 「다음으로」 — 나들이 끝에서 권하는 다음 낱칸(T11 · 화면 없음 · 하네스가 그대로 부른다).
 * 같은 학년 꼬리표 안에서만 권한다: 만들어진 다음 낱칸(map.js next — 고치지 않는다)이 다른 학년이면 권하지 않는다(「돌아가기」만).
 *   D06(1학년 2학기) → J01(2학년 1학기)은 서른넷을 건너뛰는 수준 튐이라 권하지 않는다. 고르는 화면에서 J01 깃발은 누구나 누를 수 있다(잠그지 않음 — 정본 5-2절).
 * 학년 = cells.js 꼬리표의 「N학년」(7살~1학년 1학기 · 1학년 1학기 · 1학년 2학기 는 모두 1학년). */
import { cell as cellOf } from '../common/cells.js?v=1';
import { next } from '../common/map.js?v=13';
/** 낱칸이 갈 곳(틀 주소). */
export const href = id => `/math/play/${cellOf(id).frame}/?cell=${id}`;
/** 그 낱칸의 학년(수 · 모르면 0). */
export function gradeNo(id){ const c = cellOf(id); if (!c) return 0; const m = String(c.grade).match(/(\d)학년/g); return m ? +m[m.length - 1][0] : 0; }
/** 권하는 다음 낱칸 — 같은 학년이면 그 낱칸 · 학년이 바뀌거나 없으면 null. */
export function nextHere(id){ const n = next(id); return n && gradeNo(n) === gradeNo(id) && gradeNo(id) > 0 ? n : null; }
