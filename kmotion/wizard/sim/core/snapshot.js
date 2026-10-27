// 읽기 전용 스냅샷 — 표현 층은 이것만 읽는다. dev 에서는 깊게 얼려 쓰기 시도를 오류로 만든다
export function deepFreeze(o){ if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; }
export const r3 = v => Math.round(v * 1000) / 1000;
export const v3 = p => [r3(p[0]), r3(p[1]), r3(p[2])];
