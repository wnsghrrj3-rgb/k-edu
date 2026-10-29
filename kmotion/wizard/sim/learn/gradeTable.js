// v2.3 학년 변환표 읽기(15 문서 6절, D-31) — 같은 스테이지를 ?grade= 로 재사용. 장면 JSON 은 1학년 기본값 그대로(골든 무변경).
const row = (data, stageId, grade) => { const t = data.gradeTable || data.conceptsByGrade; const st = t && t[stageId]; return st && st['g' + grade] || null; };
// 장면 개념 키: 변환표에 그 학년 줄이 있으면 그 줄, 없으면 장면 JSON 의 concepts(1학년)
export function conceptsFor(data, stage, grade){ const r = row(data, stage.id, grade); return r && Array.isArray(r.concepts) ? r.concepts.slice() : (stage.concepts || []).slice(); }
// 그 학년 일반 생성기가 아직 없을 때 대신 돌 생성기(오푸스 양산 전엔 3학년 = share 3종)
export function fallbackFor(data, stage, grade){ const r = row(data, stage.id, grade); return r && Array.isArray(r.fallback) ? r.fallback.slice() : []; }
// 묶음 파: { 'arena-2': [1, 3] } → 그 전투장 그 파(0부터)의 숫자 슬라임이 묶음으로
export function packWavesFor(data, stage, grade){ const r = row(data, stage.id, grade); return r && r.packs ? r.packs : {}; }
export function packRange(data, grade){ const t = data.gradeTable || data.conceptsByGrade; return t && t.pack && t.pack['g' + grade] || null; }
