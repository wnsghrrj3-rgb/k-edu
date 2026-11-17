/* ============================================================
 * 모형 표 (모형 설계 v1 · WG0) — 숲의 둘레를 진짜 모형으로
 *   모형은 꼴만 쓰고 색은 토큰으로 입힌다(G1). 이 파일이 그 표 한 곳이다 — 재질 이름 → 색 토큰.
 *   MODEL_CONF   상수(파일 자리 · 가장 긴 기다림 · 걸음 하나의 무게)
 *   MODEL_TONES  재질 이름 → 색(토큰 이름 | [토큰, 토큰, 섞는 양] | 'leaf' · 'leafDark' · 'rock' 은 그 걸음이 정한다)
 *   MODELS       모형 이름 → { kb 파일 크기, tris 세모 수, mats 재질 이름들 } — 파일에서 센 것(하네스가 파일과 맞는지 본다)
 *   namesOf(around)  방 자료의 둘레 칸에서 쓰는 모형 이름들(겹침 없이) — around.swap(손으로 지은 바위 · 버섯 · 풀 · 덤불을 같은 자리에서 모형으로) + around.models(더 세우는 것)
 *   toneOf(mat, tones)  재질 이름 하나의 색 — 표에 없으면 null(하네스가 막는다)
 *   파일: english/play/assets/models/<이름>.glb — Quaternius CC0(출처 · 바꾼 점은 그 폴더의 CREDITS.md)
 * ============================================================ */
export const MODEL_CONF = { base: '../assets/models/', waitMs: 3500, perStep: 10, kb: 900, tris: 60000, lowEvery: 2 };      /* lowEvery = 낮은 화질에서는 둘 가운데 하나만 세운다 */

export const MODEL_TONES = {
  Wood: ['a-wood', 'ink', 0.1], DarkWood: ['a-wood', 'ink', 0.25], LightWood: ['a-wood', 'a-cream', 0.45],
  Green: 'leaf', Green_Tree: 'leaf', DarkGreen2: 'leaf', DarkGreen: 'leafDark', DarkGreen_Tree: 'leafDark',
  Snow: [['surface', 'a-fish', 0.22], 'a-steel', 0.18], White: [['a-cream', 'surface', 0.3], 'a-steel', 0.12], Black: 'ink-2', Rock: 'rock',
  Berry: 'a-red', Red: 'a-red', DarkRed: ['a-red', 'ink', 0.15], Yellow: 'a-gold', Pink: 'a-pink', Cyan: 'a-fish',
  Mushroom1: 'a-cream', Mushroom_Top: ['a-red', 'a-wood', 0.35], Mushroom_Bottom: ['a-wood', 'a-cream', 0.55]
};
/* 그 걸음이 정하는 색의 기본값 — 방 자료 around.leaf · around.rock 이 없을 때 */
export const MODEL_DEFAULT = { leaf: 'a-leaf', leafDark: ['a-leaf', 'stage-deep', 0.4], rock: [['a-steel', 'stage-2', 0.3], 'ink', 0.2] };

export function toneOf(mat, tones = {}){
  const t = MODEL_TONES[mat]; if (t == null) return null;
  if (t === 'leaf') return tones.leaf || MODEL_DEFAULT.leaf;
  if (t === 'leafDark') return tones.leafDark || (tones.leaf ? [tones.leaf, 'stage-deep', 0.35] : MODEL_DEFAULT.leafDark);
  if (t === 'rock') return tones.rock || MODEL_DEFAULT.rock;
  return t;
}
/* 방 자료의 둘레 칸에서 쓰는 모형 이름들(겹침 없이) — 바꿔 세우는 것(swap) + 더 세우는 것(models) */
export function namesOf(around){ const a = around || {}, sw = a.swap || {}, out = [];
  ['rocks', 'mushrooms', 'bushes'].forEach(k => (sw[k] || []).forEach(n => out.push(n))); Object.keys(sw.plants || {}).forEach(k => sw.plants[k].forEach(n => out.push(n))); (a.models || []).forEach(m => out.push(m[0]));
  return [...new Set(out.filter(Boolean))]; }
export const TALL = /Tree|Willow/;      /* 키로 세우는 것(나머지는 가장 긴 쪽의 길이로) */

/* 모형 이름 → 파일에서 센 것(tools 없이 손으로 고치지 않는다 — 하네스가 파일과 견준다) */
export const MODELS = {
  BirchTree_1: { kb: 96, tris: 1704, mats: ['White', 'Black', 'DarkGreen', 'Green'] },
  BirchTree_3: { kb: 98, tris: 1730, mats: ['White', 'Black', 'Green', 'DarkGreen'] },
  BirchTree_Dead_Snow_2: { kb: 81, tris: 1433, mats: ['White', 'Black', 'Snow'] },
  BushBerries_1: { kb: 50, tris: 891, mats: ['Green', 'Berry'] },
  Bush_1: { kb: 21, tris: 364, mats: ['Green'] },
  Bush_2: { kb: 16, tris: 266, mats: ['Green'] },
  Bush_Snow_1: { kb: 27, tris: 460, mats: ['Snow', 'Green'] },
  CommonTree_1: { kb: 155, tris: 2888, mats: ['Wood', 'Green'] },
  CommonTree_3: { kb: 88, tris: 1584, mats: ['Wood', 'Green', 'DarkGreen'] },
  Flowers: { kb: 26, tris: 408, mats: ['Green', 'Cyan', 'Yellow'] },
  Grass: { kb: 13, tris: 192, mats: ['Green'] },
  Grass_2: { kb: 13, tris: 192, mats: ['Green'] },
  Lilypad: { kb: 24, tris: 372, mats: ['Green', 'Pink'] },
  Mushroom_3: { kb: 54, tris: 920, mats: ['Mushroom1', 'Red'] },
  Mushroom_4: { kb: 101, tris: 1760, mats: ['Mushroom1', 'Red'] },
  PineTree_Snow_1: { kb: 105, tris: 1911, mats: ['Wood', 'Green', 'Snow'] },
  PineTree_Snow_5: { kb: 87, tris: 1566, mats: ['Wood', 'Green', 'Snow'] },
  Plant_1: { kb: 18, tris: 295, mats: ['Green'] },
  Plant_3: { kb: 35, tris: 600, mats: ['DarkGreen'] },
  Plant_5: { kb: 37, tris: 620, mats: ['Yellow', 'Pink'] },
  Rock_1: { kb: 6, tris: 70, mats: ['Rock'] },
  Rock_3: { kb: 6, tris: 72, mats: ['Rock'] },
  Rock_5: { kb: 7, tris: 90, mats: ['Rock'] },
  Rock_Moss_1: { kb: 7, tris: 70, mats: ['Rock', 'Green'] },
  Rock_Moss_4: { kb: 10, tris: 128, mats: ['Rock', 'Green'] },
  Rock_Moss_6: { kb: 9, tris: 116, mats: ['Green', 'Rock'] },
  Rock_Snow_1: { kb: 9, tris: 102, mats: ['Rock', 'Snow'] },
  Rock_Snow_4: { kb: 13, tris: 188, mats: ['Rock', 'Snow'] },
  Rock_Snow_6: { kb: 13, tris: 184, mats: ['Rock', 'Snow'] },
  TreeStump_Moss: { kb: 16, tris: 232, mats: ['Wood', 'Green'] },
  TreeStump_Snow: { kb: 17, tris: 258, mats: ['Wood', 'Snow'] },
  Wheat: { kb: 24, tris: 408, mats: ['Yellow'] },
  Willow_1: { kb: 107, tris: 1946, mats: ['Wood', 'DarkGreen'] },
  Willow_3: { kb: 58, tris: 1044, mats: ['Wood', 'DarkGreen'] },
  WoodLog_Moss: { kb: 40, tris: 614, mats: ['Wood', 'Green', 'Mushroom_Top', 'Mushroom_Bottom', 'DarkGreen'] }
};
