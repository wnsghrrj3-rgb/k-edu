/* ============================================================
 * 영어 놀이터 — 터 부품 상자(rooms/lands) (WA0 · 무대 설계 v1 §1 무대 여섯 칸 · §8 · 키트 core/diorama.js 위에)
 *   걸음마다 「보이는 무대」가 다르다. 방 파일의 place 여섯 칸이 부품 이름을 고르고, 이 상자가 짓는다(자리 약속은 glade.js — 손대지 않는다).
 *     place: { land, floor, back, sky, around, look } — 칸마다 { kind: 부품 이름, …그 부품에 넘길 것 }
 *       ① land   LANDS   땅의 높낮이와 물 — heightAt(x, z) 를 준다(물건 · 인물 · 선반 · 소품이 여기에 붙는다)
 *       ② floor  FLOORS  발밑의 소재와 색 — 바닥 그림 · 풀잎 · 꽃 · 흩뿌린 것(낙엽 · 조약돌 · 눈 더미)
 *       ③ back   BACKS   받침 뒤로 보이는 먼 풍경
 *       ④ sky    SKIES   빛의 때 + 날씨(WEATHER — 값이 아니라 보이는 것) + 하늘 색 띠 · 안개 · 바람
 *       ⑤ around TREES   글자 나무 둘의 생김새(걸음마다 다른 모델) + 그 곳의 풀 · 바위(PLANTS) · 덤불 · 버섯
 *       ⑥ look   LOOKS   글씨 없이 그 걸음인 줄 알게 하는 한 가지 — 눈(카메라)의 자리
 *   const G = buildLand(K, place, { blocks, paint, slots, letters, view, shadow, GW, GD, road, trees })
 *     G.group · G.heightAt(x, z)(물 위는 물 높이) · G.freeAt · G.ripple · G.step(dt, t) · G.creek · G.treeA · G.treeB · G.carrierA · G.carrierB(글자 그릇 — WD0) · G.lit · G.cam · G.weather · G.bounds
 *   터 부품을 더하는 법: 그 칸의 표(LANDS · FLOORS · BACKS · SKIES · WEATHER · TREES · PLANTS · LOOKS)에 이름 하나를 더한다. 같은 부품을 색만 바꿔 다른 걸음에 다시 쓰지 않는다(R1 · R3).
 *   색은 토큰 이름만(코드에 색 값 0).
 * ============================================================ */
import { GLADE, freeAtOf } from './glade.js';
import { carrier } from './carriers.js';
import { swapName, putModel, extraModels, SWAP_SIZE } from './around-models.js';

export const PLACE_KEYS = ['land', 'floor', 'back', 'sky', 'around', 'look'];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const inEl = (w, x, z, pad = 0) => { const e = (x - w.x) / (w.rx + pad), d = (z - w.z) / (w.rz + pad); return e * e + d * d < 1; };
const shoreD = (w, x, z) => (Math.hypot((x - w.x) / w.rx, (z - w.z) / w.rz) - 1) * Math.min(w.rx, w.rz);      /* 물가까지 거리(어림) — 안쪽은 음수 */

/* ── ① 땅 — (그 칸에 적은 것) → { heightAt(물 밑 바닥 포함), waters, waterY, ext(받침이 자리 테두리 밖으로 더 뻗는 만큼), drop(받침을 낮추는 만큼), … } ──
   어느 땅이든 앞 흙길(z ≥ GLADE.flatFrom)은 높이 0 — 통나무 버스 · 정류장 · 팻말 · 글자 열매 줄이 선다 */
const CREEK = { at: [0.8, -3.7], main: [2.85, 1.55], second: [-1.3, 1.3, 0.8], sand: [[0, 0, 3.25, 1.95], [0, -1.3, 1.75, 1.1]],
  stones: [[-0.9, 1.2, 0.42], [0.5, 1.5, 0.5], [1.9, 1.15, 0.4], [-2.6, 0.5, 0.36]],
  lilies: [[-1.7, 0.2, 0.36], [-1.1, -0.6, 0.28], [-2.0, -0.4, 0.22], [0.2, -1.6, 0.3]], lilyFlower: true,
  reeds: [[-2.7, -0.9, 1.2], [-2.45, -1.15, 0.95], [-2.9, -0.6, 0.85], [2.75, -1.0, 1.1], [2.5, -1.25, 0.9], [1.6, -2.15, 1.0]],
  free: [[0, 0, 3.3, 2.0], [0, -1.3, 1.8, 1.15]], rings: 5 };
export const LANDS = {
  /* 완만한 풀밭 — 얕은 개울(징검돌 · 연잎 · 갈대) */
  meadow(o){ const c = Object.assign({}, CREEK, o.creek || {}), k = c.at, ab = a => [k[0] + a[0], k[1] + a[1]].concat(a.slice(2));
    const waters = [{ x: k[0], z: k[1], rx: c.main[0], rz: c.main[1] }]; if (c.second) waters.push({ x: k[0], z: k[1] + c.second[0], rx: c.second[1], rz: c.second[2] });
    return { heightAt: () => 0, waters, waterY: 0.03, creek: k, ext: { back: 2.4, left: 0, right: 0 }, drop: 0,
      frees: c.free.map(f => ({ x: k[0] + f[0], z: k[1] + f[1], rx: f[2], rz: f[3] })), sand: c.sand.map(s => ({ x: k[0] + s[0], z: k[1] + s[1], rx: s[2], rz: s[3] })),
      stones: c.stones.map(ab), lilies: c.lilies.map(ab), lilyFlower: c.lilyFlower, reeds: c.reeds.map(ab), rings: c.rings }; },
  /* 깊은 숲 속 움푹한 자리 — 큰 나무를 벤 터라 둘레가 조금 높다 */
  hollow(o){ const R = o.rim || 0.8, pd = o.pond || null, rim = (x, z) => R * sm(1, 1.55, Math.hypot(x / 6.5, (z - 0.4) / 3.9)) * (1 - sm(1.9, GLADE.flatFrom, z)), py = pd ? rim(pd[0], pd[1]) : 0;
    const heightAt = (x, z) => { const h = rim(x, z); if (!pd) return h; const k = 1 - sm(pd[2] * 1.1, pd[2] * 1.1 + 1.0, Math.hypot(x - pd[0], (z - pd[1]) * 1.4)); return h + (py - 0.08 * k - h) * k; };      /* 작은 연못 자리는 평평하게 다진다 */
    const waters = pd ? [{ x: pd[0], z: pd[1], rx: pd[2] * 1.25, rz: pd[2] * 0.8, y: py - 0.04 }] : [];
    return { heightAt, waters, waterY: 0.03, creek: null, ext: { back: 2.6, left: 1.3, right: 1.3 }, drop: 0, lilies: pd ? [[pd[0] - 0.5, pd[1] + 0.15, 0.24], [pd[0] + 0.45, pd[1] - 0.2, 0.2]] : [], rings: 0 }; },
  /* 절벽 아래 물가 — 뒤가 절벽, 그 앞이 둥근 소. 물가가 계단처럼 낮아진다 */
  cliffpool(o){ const P1 = { x: 0.4, z: -3.7, rx: 3.5, rz: 2.15 }, P2 = { x: 0.4, z: -5.5, rx: 8.2, rz: 1.5 }, waters = [P1, P2], WY = -0.42;
    const heightAt = (x, z) => { const d = Math.min(shoreD(P1, x, z), shoreD(P2, x, z)); if (d < 0) return -0.42 - 0.4 * sm(0, 0.5, -d);
      return (-0.36 + 0.18 * sm(0.62, 0.8, d) + 0.18 * sm(1.5, 1.7, d)) * (1 - sm(1.9, GLADE.flatFrom, z)); };      /* 젖은 물가 → 한 단 → 뭍(앞 흙길은 0) */
    return { heightAt, waters, waterY: WY, creek: [P1.x, P1.z], ext: { back: 2.4, left: 0.6, right: 0.6 }, drop: 0.95, waterTone: K => K.mix(K.mix('stage', 'word-blue', 0.42), 'a-fish', 0.18),      /* 청록 물 */
      frees: waters.map(w => Object.assign({ pad: 0.25 }, w)),
      stones: [[-2.4, -2.0, 0.4], [2.9, -2.3, 0.44], [-1.2, -1.55, 0.3], [3.6, -3.4, 0.36], [-3.4, -3.2, 0.42]], lilies: [[1.3, -2.1, 0.26], [-1.6, -2.6, 0.3], [-0.6, -4.4, 0.3], [-2.2, -4.0, 0.24]], reeds: [[-3.7, -2.4, 1.1], [-3.5, -2.1, 0.9], [4.3, -3.0, 1.0]], rings: 5 }; },
  /* 솟은 둥근 언덕 — 자리들이 비탈에 놓이고 꼭대기는 납작하다 */
  hill(o){ const H = o.top || 1.75, c = o.at || [0.3, -3.2];
    return { heightAt: (x, z) => H * (1 - sm(0.12, 1, Math.hypot((x - c[0]) / 8.4, (z - c[1]) / 6.6))) * (1 - sm(1.7, GLADE.flatFrom, z)), waters: [], waterY: 0.03, creek: null, ext: { back: 1.2, left: 0, right: 0 }, drop: 0, peak: [c[0], c[1], H] }; },
  /* 좁은 골짜기 바닥 — 양옆이 높은 바위벽 */
  gorge(o){ const S = o.side || 0.9;
    return { heightAt: (x, z) => (S * sm(5.6, 8.5, Math.abs(x)) + 1.6 * sm(8.5, 10.6, Math.abs(x))) * (1 - sm(1.8, GLADE.flatFrom, z)) + 0.3 * sm(3.2, 5.7, -z) + 1.4 * sm(5.7, 8.4, -z), waters: [], waterY: 0.03, creek: null, ext: { back: 3.0, left: 2.4, right: 2.4 }, drop: 0,
      ice: { x: -1.2, z: 1.2, rx: 1.5, rz: 0.8 } }; },
  /* 높은 등성이 — 뒤로 갈수록 돌 단이 둘 올라가고(성문 앞), 앞은 낮다 */
  ridge(o){ const A = o.step1 || 0.42, B = o.step2 || 0.5;
    return { heightAt: (x, z) => (A * sm(0.5, 1.1, -z) + B * sm(3.3, 3.9, -z)) * (1 - sm(1.7, GLADE.flatFrom, z)), waters: [], waterY: 0.03, creek: null, ext: { back: 1.8, left: 0, right: 0 }, drop: 0.35, steps: [[-1.0, -0.8], [-1.0, -3.6]] }; },
  /* 아주 큰 나무 밑 — 굵은 뿌리가 등을 내밀고, 가운데 뒤로 달맞이 바위 자리가 솟았다 */
  roothollow(o){ const R = o.rock || [0.4, -3.4, 0.85], root = (x, z) => 0.22 * Math.pow(Math.abs(Math.sin(x * 0.75 + z * 0.35)), 6) * sm(3.6, 6.8, Math.abs(x));
    return { heightAt: (x, z) => (R[2] * (1 - sm(0.5, 1.9, Math.hypot(x - R[0], (z - R[1]) * 1.15))) + root(x, z) + 0.35 * sm(6.4, 9.0, Math.abs(x))) * (1 - sm(1.8, GLADE.flatFrom, z)), waters: [], waterY: 0.03, creek: null, ext: { back: 2.6, left: 0.8, right: 0.8 }, drop: 0, rock: R }; },
  /* 둥근 연못이 주인공 — 가운데 뒤로 큰 연못, 물가가 그 쪽으로 낮아진다 */
  pond(o){ const Pd = Object.assign({ x: 0.4, z: -3.1, rx: 2.7, rz: 1.85 }, o.pond || {}), WY = -0.14;
    const heightAt = (x, z) => { const d = shoreD(Pd, x, z); if (d < 0) return WY - 0.3 * sm(0, 0.6, -d); return (-0.12 + 0.12 * sm(0.25, 1.3, d)) * (1 - sm(1.9, GLADE.flatFrom, z)); };
    return { heightAt, waters: [Pd], waterY: WY, creek: [Pd.x, Pd.z], ext: { back: 1.6, left: 0.4, right: 0.4 }, drop: 0.5, waterTone: K => K.mix(K.mix('a-fish', 'word-blue', 0.3), 'surface', 0.12),
      frees: [Object.assign({ pad: 0.2 }, Pd)], lilies: [[Pd.x - 1.5, Pd.z + 0.9, 0.34], [Pd.x + 1.7, Pd.z + 0.6, 0.3], [Pd.x + 0.9, Pd.z - 1.1, 0.26], [Pd.x - 1.0, Pd.z - 0.9, 0.3]], lilyFlower: true,
      reeds: [[Pd.x - 2.5, Pd.z - 1.2, 1.2], [Pd.x - 2.3, Pd.z - 1.45, 1.0], [Pd.x + 2.5, Pd.z - 1.3, 1.1], [Pd.x + 2.25, Pd.z - 1.55, 0.9]], rings: 6 }; },
  /* 다듬은 정원 — 평평하고, 가운데 뒤 정자 자리만 한 단 높다 */
  garden(o){ const B = o.base || [0.4, -3.4, 0.22];
    return { heightAt: (x, z) => B[2] * (1 - sm(1.5, 2.0, Math.hypot(x - B[0], z - B[1]))) * (1 - sm(1.9, GLADE.flatFrom, z)), waters: [], waterY: 0.03, creek: null, ext: { back: 1.4, left: 0, right: 0 }, drop: 0.2, base: B }; }
};

/* ── ④ 하늘 — 빛의 때(키트의 빛 벌 + 그 곳만의 빛 tune) · 하늘 색 띠 · 안개 · 바람 · 보이는 날씨 ── */
export const SKIES = {
  /* 복숭아빛 아침 — 낮은 해 · 긴 그림자 · 옅은 아침 안개 */
  peachMorning: { light: 'morning', tune: { sun: ['warm-soft', 3.3, [-15, 8.5, 6]] }, stops: [['a-pink', 'warm-soft', 0.55], ['warm-soft', 'surface', 0.35], 'bg'], fog: null, wind: 1, weather: ['mist'],
    shafts: [[-5.6, 3.6, -0.4, 1.5, 0.13], [-3.6, 3.2, 0.6, 1.0, 0.1], [-1.4, 3.0, -1.4, 1.8, 0.08]] },
  /* 나뭇잎 지붕 사이로 떨어지는 낮 빛 기둥 · 떠다니는 먼지 빛 */
  canopyShafts: { light: 'day', tune: { hemi: [['a-gold', 'stage-soft', 0.45], ['a-wood', 'a-leaf', 0.35], 0.5], sun: [['warm-soft', 'a-gold', 0.3], 3.0, [-4, 17, 5]], fill: [['a-gold', 'stage-soft', 0.5], 0.32], glow: 'a-gold' },
    stops: [['stage-deep', 'ink', 0.35], ['stage-deep', 'a-wood', 0.45], ['a-wood', 'a-gold', 0.35]], fog: null, wind: 0.6, weather: ['shafts'], dustTone: 'a-gold', dustSize: 0.1,
    shafts: [[-6.2, 4.4, -1.6, 1.3, 0.3], [-3.4, 4.2, 0.4, 0.9, 0.24], [-0.6, 4.6, -2.2, 1.9, 0.26], [1.8, 4.0, 0.8, 0.8, 0.2], [3.9, 4.4, -1.4, 1.5, 0.28], [6.3, 4.1, 0.2, 1.0, 0.22], [0.6, 4.0, 2.6, 0.7, 0.16]] },
  /* 낮 · 물안개 · 물보라에 걸린 작은 무지개 */
  sprayNoon: { light: 'day', tune: { hemi: [['a-fish', 'stage-soft', 0.5], ['a-steel', 'a-leaf', 0.4], 0.8] }, stops: [['a-fish', 'stage-soft', 0.35], ['stage-soft', 'surface', 0.3], 'bg'], fog: ['stage-soft', 38, 80], wind: 1, weather: ['spray'] },
  /* 넓은 오후 하늘 · 빠르게 흐르는 구름 그림자 */
  cloudAfternoon: { light: 'afternoon', tune: { sun: ['warm-soft', 3.0, [11, 11, 7]] }, stops: [['a-fish', 'surface', 0.3], ['surface', 'a-fish', 0.12], ['warm-soft', 'surface', 0.4]], fog: null, wind: 1.9, weather: ['cloudShadow'] },
  /* 좁은 하늘 띠 · 푸른 그늘빛 · 입김과 서리 */
  blueShade: { light: 'day', tune: { hemi: [['a-fish', 'word-blue', 0.25], ['a-steel', 'a-fish', 0.5], 0.95], sun: [['surface', 'a-fish', 0.45], 1.25, [-3, 15, -7]], fill: [['a-fish', 'surface', 0.4], 0.42], glow: 'surface' },
    stops: [['word-blue', 'a-fish', 0.45], ['a-fish', 'surface', 0.45], ['a-fish', 'surface', 0.7]], fog: [['a-fish', 'surface', 0.6], 30, 58], wind: 0.7, weather: ['breath'] },
  /* 맑고 높은 파란 하늘 · 센 바람 · 연 여럿과 날리는 민들레 씨 */
  highBlue: { light: 'day', tune: { hemi: [['word-blue', 'surface', 0.55], ['a-steel', 'a-leaf', 0.3], 0.85], sun: ['surface', 3.2, [9, 15, 5]] }, stops: [['word-blue', 'a-fish', 0.25], ['a-fish', 'surface', 0.35], ['surface', 'a-fish', 0.25]], fog: null, wind: 2.3, weather: ['kites'] },
  /* 남보라 저녁 · 별 · 반딧불 · 달빛 테두리 */
  moonNight: { light: 'evening', tune: { hemi: [['a-plum', 'word-blue', 0.5], ['a-plum', 'stage-deep', 0.45], 0.95], sun: [['surface', 'a-fish', 0.5], 1.7, [-9, 12, -8]], fill: [['a-fish', 'a-plum', 0.4], 0.55], glow: 'surface' },
    stops: [['ink', 'a-plum', 0.45], ['a-plum', 'word-blue', 0.35], ['a-plum', 'a-pink', 0.3]], fog: null, wind: 0.5, weather: ['moon'], dustTone: 'a-gold', dustSize: 0.12 },
  /* 맑은 낮 · 물에 비친 하늘 · 냄비에서 오르는 김 */
  clearMirror: { light: 'day', tune: { hemi: [['a-fish', 'surface', 0.45], ['a-fish', 'a-leaf', 0.45], 0.8], sun: [['surface', 'warm-soft', 0.25], 3.1, [-4, 16, 9]] }, stops: [['a-fish', 'word-blue', 0.2], ['a-fish', 'surface', 0.5], ['surface', 'warm-soft', 0.3]], fog: null, wind: 0.8, weather: ['steam'] },
  /* 회보라 비구름 · 빗줄기 · 웅덩이 파문 */
  rainGrey: { light: 'afternoon', tune: { hemi: [['a-plum', 'a-steel', 0.6], ['a-steel', 'a-leaf', 0.45], 0.9], sun: [['a-steel', 'surface', 0.5], 1.5, [8, 12, 6]], fill: [['a-plum', 'a-fish', 0.5], 0.5], glow: 'surface' },
    stops: [['a-steel', 'a-plum', 0.35], ['a-steel', 'surface', 0.35], ['surface', 'a-plum', 0.18]], fog: [['a-steel', 'surface', 0.5], 34, 70], wind: 1.3, weather: ['rain'] }
};
/* ── ⑥ 첫눈 — 눈(카메라)의 자리. pitch · yaw 는 판형 값을 덮고, lift 는 눈이 보는 곳을 올린다(터가 화면 아래로 — 하늘이 넓어진다) ── */
export const LOOKS = {
  creekFront: { cam: {} },                                            /* 앞에서 반짝이는 개울(기준판 그대로) */
  canopyGold: { cam: { pitch: 0.64, lift: 0.3 } },                    /* 갈색과 금빛, 지붕 덮인 숲 속 — 조금 위에서 내려다본다 */
  cliffTeal:  { cam: { pitch: 0.56, lift: 0.9 } },                    /* 세로로 높은 절벽과 청록 물 */
  skyHalf:    { cam: { pitch: 0.46, lift: 2.3 } },                    /* 하늘이 화면의 절반 — 낮게, 올려다보듯 */
  blueWindow: { cam: { pitch: 0.6, lift: 0.5 } },                     /* 희고 푸른 그늘 속 노란 창 하나 */
  redKite:    { cam: { pitch: 0.5, lift: 1.7 } },                     /* 돌 회색 위의 빨간 연 — 하늘을 넉넉히 */
  moonRound:  { cam: { pitch: 0.54, lift: 1.3 } },                    /* 밤, 그리고 둥근 달 */
  pondIsle:   { cam: { pitch: 0.66, lift: 0.2 } },                    /* 물이 주인공 — 위에서 내려다본다 */
  rainPavilion: { cam: { pitch: 0.58, lift: 0.9 } }                   /* 비, 그리고 지붕 있는 정자 */
};
/* place 가 여섯 칸을 다 채웠나 — 비었거나 상자에 없는 부품 이름이면 그 칸 이름을 돌려준다(하네스 · 짓기 전에 막는다) */
export function checkPlace(place){
  const box = { land: LANDS, floor: FLOORS, back: BACKS, sky: SKIES, around: TREES, look: LOOKS };
  return PLACE_KEYS.filter(k => !(place && place[k] && typeof place[k].kind === 'string' && box[k][place[k].kind]));
}
/* 두 걸음의 무대가 몇 칸 다른가(R1 — 이웃은 넷 이상 · 땅과 바닥이 둘 다 같으면 안 된다) */
export const placeDiff = (a, b) => PLACE_KEYS.filter(k => a[k].kind !== b[k].kind);

/* ── 공용 도우미 ── */
const rockTone = (K, d = 0.2) => K.mix(K.mix('a-steel', 'stage-2', 0.3), 'ink', d);
function bushOf(K, x, y, z, r, tn, berry, tall = 1){ const { THREE, M, mix, mesh, ball } = K, g = new THREE.Group(); g.position.set(x, y, z); const m1 = M(tn, { roughness: 0.95 }), m2 = M(mix(tn, 'warm-soft', 0.1), { roughness: 0.95 });
  g.add(mesh(new THREE.CylinderGeometry(0.16 * r, 0.24 * r, 1.1 * r * tall, 10), M('a-wood', { roughness: 0.9 }), 0, 0.5 * r * tall, 0)); const up = (tall - 1) * 1.1 * r;
  g.add(ball(1.0 * r, m1, 0, 1.6 * r + up, 0, 1, 0.92, 1)); g.add(ball(0.7 * r, m1, 0.62 * r, 1.25 * r + up, 0.1, 1, 0.9, 1)); g.add(ball(0.66 * r, m1, -0.56 * r, 1.3 * r + up, 0.15, 1, 0.9, 1)); g.add(ball(0.62 * r, m2, 0.1 * r, 2.15 * r + up, 0.1, 1, 0.8, 1)); g.add(ball(0.5 * r, m2, -0.2 * r, 1.5 * r + up, 0.7 * r, 1, 0.85, 0.8));
  if (berry) [[0.5, 1.5, 0.75], [-0.3, 1.9, 0.8], [0.1, 1.2, 0.95], [-0.7, 1.4, 0.6]].forEach(b => g.add(ball(0.09 * r, M('word-red', { roughness: 0.35 }), b[0] * r, b[1] * r, b[2] * r)));
  return g; }
function mushroomOf(K, x, y, z, s){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.32, 12), M('a-cream'), 0, 0.16, 0)); g.add(ball(0.26, M('a-red', { roughness: 0.5 }), 0, 0.34, 0, 1, 0.62, 1)); [[0.1, 0.46, 0.12], [-0.12, 0.44, 0.06], [0.02, 0.5, -0.1]].forEach(d => g.add(ball(0.045, M('surface'), d[0], d[1], d[2]))); return g; }
function rockOf(K, x, y, z, r, i, cap){ const { THREE, M, mix, ball } = K, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = i * 1.3; g.add(ball(r, M(rockTone(K, 0.25), { roughness: 0.9 }), 0, r * 0.4, 0, 1.3, 0.75, 1)); g.add(ball(r * 0.6, M(rockTone(K, 0.3), { roughness: 0.9 }), r * 0.9, r * 0.25, 0.1, 1.2, 0.7, 1));
  g.add(ball(r * 0.7, M(cap || mix('stage', 'a-leaf', 0.5), { roughness: 1 }), -0.05, r * 0.78, 0.02, 1.2, 0.3, 0.9)); return g; }
const puffM = (K, tn = 'surface', op = 0) => new K.THREE.MeshStandardMaterial({ color: K.tone(tn), transparent: true, opacity: op, depthWrite: false, roughness: 1 });

/* ── ② 바닥 — 바닥 그림(base · paint) · 받침 턱 색(lip) · 풀잎(blades) · 꽃 · 흩뿌린 것(scatter) ── */
export const FLOORS = {
  /* 이슬 맺힌 풀 · 토끼풀 얼룩 — 풀잎 끝의 이슬이 반짝인다 */
  dew: { base: K => K.mix(K.mix('stage', 'a-leaf', 0.5), 'warm-soft', 0.2), dirt: K => K.mix('stage-2-soft', 'stage-2', 0.35), lip: K => K.mix('stage', 'stage-deep', 0.45),
    paint(g, P){ const { rnd, w, h, hex } = P; for (let i = 0; i < 130; i++) { g.globalAlpha = 0.05 + rnd() * 0.09; g.fillStyle = i % 3 ? hex('stage-deep') : hex('warm-soft'); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 26 + rnd() * 80, 14 + rnd() * 36, rnd() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; },
    speck: ['stage-deep', 520], blades: { n: 620, h: 0.22, sway: 0.28, tones: K => { const b = K.mix(K.mix('stage', 'a-leaf', 0.5), 'warm-soft', 0.2); return [K.mix(b, 'stage-deep', 0.3), K.mix(b, 'stage', 0.5), K.mix(b, 'warm-soft', 0.25), K.mix(b, 'a-leaf', 0.6)]; } },
    flowers: 54, scatter: (K, c) => sparkle(K, c, 46, 'surface', 0.16) },
  /* 낙엽 · 톱밥 · 이끼 — 풀 대신 낙엽이 깔리고 고사리가 난다 */
  litter: { base: K => K.mix(K.mix('a-wood', 'a-gold', 0.4), 'stage-2-soft', 0.25), dirt: K => K.mix('a-wood', 'stage-2-soft', 0.45), lip: K => K.mix('a-wood', 'stage-deep', 0.5),
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P, tn = [hex('a-gold'), hexOf(K.mix('warm', 'a-wood', 0.4)), hexOf(K.mix('a-wood', 'ink', 0.2)), hexOf(K.mix('stage-deep', 'a-leaf', 0.4))];
      for (let i = 0; i < 170; i++) { g.globalAlpha = 0.07 + rnd() * 0.12; g.fillStyle = tn[i % 4]; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 18 + rnd() * 60, 10 + rnd() * 30, rnd() * 3, 0, 7); g.fill(); }
      for (let i = 0; i < 12; i++) P.soft(g, rnd() * w, rnd() * h, 30 + rnd() * 50, 18 + rnd() * 26, hexOf(K.mix('stage-deep', 'a-leaf', 0.5)), 0.4, 26);                                /* 이끼 */
      P.soft(g, P.gx(0.4), P.gz(-2.2), 3.0 * P.gs, 1.5 * P.gs, hexOf(K.mix('a-cream', 'a-gold', 0.3)), 0.5, 0.7 * P.gs); g.globalAlpha = 1; },                                        /* 톱밥 */
    speck: ['a-wood', 700], blades: { n: 90, h: 0.16, sway: 0.12, tones: K => [K.mix('stage-deep', 'a-leaf', 0.4), K.mix('a-leaf', 'a-gold', 0.4)] },
    flowers: 8, scatter: (K, c) => flakes(K, c, 420, ['a-gold', ['warm', 'a-wood', 0.35], ['a-wood', 'a-gold', 0.5], ['a-red', 'a-wood', 0.5], 'warm-soft'], 0.13) },
  /* 젖은 바위 · 이끼 · 조약돌 */
  wetrock: { base: K => K.mix(K.mix('ink-2', 'a-fish', 0.55), 'stage', 0.2), dirt: K => K.mix(K.mix('ink-2', 'a-fish', 0.4), 'a-cream', 0.3), lip: K => K.mix('ink-2', 'stage-deep', 0.4), rough: 0.5,
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; for (let i = 0; i < 90; i++) { g.globalAlpha = 0.08 + rnd() * 0.12; g.fillStyle = i % 2 ? hexOf(K.mix('ink-2', 'ink', 0.3)) : hex('a-steel'); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 70, 8 + rnd() * 22, rnd() * 0.5 - 0.25, 0, 7); g.fill(); }
      for (let i = 0; i < 26; i++) P.soft(g, rnd() * w, rnd() * h, 26 + rnd() * 60, 16 + rnd() * 30, hexOf(K.mix('a-leaf', 'stage-deep', 0.35)), 0.55, 22);                                /* 이끼 */
      g.globalAlpha = 1; g.strokeStyle = hexOf(K.mix('a-steel', 'ink', 0.4)); g.lineWidth = 2; for (let i = 0; i < 26; i++) { g.globalAlpha = 0.25; g.beginPath(); const x = rnd() * w, y = rnd() * h; g.moveTo(x, y); g.lineTo(x + 30 + rnd() * 60, y + (rnd() - 0.5) * 16); g.stroke(); } g.globalAlpha = 1; },
    speck: ['a-steel', 300], blades: { n: 150, h: 0.2, sway: 0.2, tones: K => [K.mix('a-leaf', 'a-fish', 0.3), K.mix('a-leaf', 'stage-deep', 0.4)] },
    flowers: 14, scatter: (K, c) => pebbles(K, c, 170) },
  /* 바람에 눕는 긴 풀 · 들꽃 · 드러난 바위 */
  longgrass: { base: K => K.mix(K.mix('a-leaf', 'a-gold', 0.42), 'warm-soft', 0.25), dirt: K => K.mix('stage-2-soft', 'a-gold', 0.3), lip: K => K.mix('a-leaf', 'a-gold', 0.3),
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; for (let i = 0; i < 120; i++) { g.globalAlpha = 0.06 + rnd() * 0.1; g.fillStyle = i % 3 ? hex('a-gold') : hex('stage-deep'); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 40 + rnd() * 110, 8 + rnd() * 18, -0.25, 0, 7); g.fill(); }      /* 바람결 */
      for (let i = 0; i < 9; i++) P.soft(g, rnd() * w, rnd() * h, 22 + rnd() * 36, 12 + rnd() * 18, hexOf(K.mix('a-steel', 'stage-2-soft', 0.4)), 0.7, 14); g.globalAlpha = 1; },           /* 드러난 바위 */
    speck: ['a-gold', 600], blades: { n: 1050, h: 0.44, sway: 0.62, tones: K => { const b = K.mix('a-leaf', 'a-gold', 0.4); return [b, K.mix(b, 'warm-soft', 0.35), K.mix(b, 'stage-deep', 0.25), K.mix('a-gold', 'a-cream', 0.3)]; } },
    flowers: 90, scatter: null },
  /* 눈 · 서리 낀 흙 · 얼음판 */
  snow: { base: K => K.mix('surface', 'a-fish', 0.16), dirt: K => K.mix(K.mix('a-wood', 'a-steel', 0.5), 'surface', 0.35), lip: K => K.mix('surface', 'a-fish', 0.3), rough: 0.8,
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; for (let i = 0; i < 110; i++) { g.globalAlpha = 0.07 + rnd() * 0.1; g.fillStyle = i % 2 ? hex('surface') : hexOf(K.mix('a-fish', 'word-blue', 0.2)); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 30 + rnd() * 90, 14 + rnd() * 30, rnd() * 3, 0, 7); g.fill(); }
      for (let i = 0; i < 10; i++) P.soft(g, rnd() * w, rnd() * h, 24 + rnd() * 44, 12 + rnd() * 20, P.dirt, 0.55, 18); g.globalAlpha = 1; },                                              /* 서리 낀 흙 */
    speck: ['a-fish', 260], blades: { n: 60, h: 0.2, sway: 0.1, tones: K => [K.mix('a-cream', 'a-gold', 0.4), K.mix('a-cream', 'a-wood', 0.3)] },
    flowers: 0, scatter: (K, c) => { mounds(K, c, 26); sparkle(K, c, 70, 'surface', 0.1); } },
  /* 돌 포장 · 틈새의 짧은 풀 · 민들레 */
  paving: { base: K => K.mix(K.mix('a-steel', 'stage-2', 0.3), 'ink-2', 0.12), dirt: K => K.mix(K.mix('a-steel', 'stage-2-soft', 0.4), 'ink-2', 0.1), lip: K => K.mix('a-steel', 'ink-2', 0.35), rough: 0.85,
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; g.strokeStyle = hexOf(K.mix('a-steel', 'ink-2', 0.45)); g.lineWidth = 3;
      for (let r = 0; r < 13; r++) { const y = (r + 0.5) * h / 13; g.globalAlpha = 0.3; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (rnd() - 0.5) * 6); g.stroke(); for (let k = 0; k < 9; k++) { const x = (k + (r % 2) * 0.5 + rnd() * 0.2) * w / 9; g.globalAlpha = 0.22; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 6, y + h / 13); g.stroke(); } }      /* 돌 줄눈 */
      for (let i = 0; i < 70; i++) { g.globalAlpha = 0.07 + rnd() * 0.1; g.fillStyle = i % 2 ? hex('a-cream') : hexOf(K.mix('a-steel', 'ink-2', 0.3)); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 50, 12 + rnd() * 26, rnd() * 3, 0, 7); g.fill(); }
      for (let i = 0; i < 22; i++) P.soft(g, rnd() * w, rnd() * h, 22 + rnd() * 40, 12 + rnd() * 20, hexOf(K.mix('a-leaf', 'a-gold', 0.25)), 0.5, 18); g.globalAlpha = 1; },      /* 틈새 풀 */
    speck: ['a-steel', 380], blades: { n: 240, h: 0.14, sway: 0.5, tones: K => [K.mix('a-leaf', 'a-gold', 0.3), K.mix('a-leaf', 'stage', 0.4)] },
    flowers: 26, scatter: (K, c) => pebbles(K, c, 90) },
  /* 낙엽 · 드러난 뿌리 · 이끼 · 달그림자 */
  rootmoss: { base: K => K.mix(K.mix('stage-deep', 'a-plum', 0.35), 'a-leaf', 0.25), dirt: K => K.mix(K.mix('a-wood', 'a-plum', 0.4), 'ink-2', 0.2), lip: K => K.mix('stage-deep', 'ink', 0.35), rough: 0.95,
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; for (let i = 0; i < 120; i++) { g.globalAlpha = 0.07 + rnd() * 0.1; g.fillStyle = i % 3 ? hexOf(K.mix('a-leaf', 'stage-deep', 0.5)) : hexOf(K.mix('a-wood', 'a-plum', 0.4)); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 22 + rnd() * 70, 12 + rnd() * 30, rnd() * 3, 0, 7); g.fill(); }
      g.strokeStyle = hexOf(K.mix('a-wood', 'ink', 0.35)); g.lineCap = 'round'; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.35; g.lineWidth = 6 + rnd() * 10; g.beginPath(); const x = rnd() * w, y = rnd() * h * 0.7; g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 160, y + 40 + rnd() * 60, x + (rnd() - 0.5) * 240, y + 110 + rnd() * 80); g.stroke(); }      /* 뿌리 */
      P.soft(g, P.gx(-1.6), P.gz(-0.6), 4.2 * P.gs, 2.2 * P.gs, hexOf(K.mix('a-fish', 'surface', 0.4)), 0.32, 1.2 * P.gs); g.globalAlpha = 1; },      /* 달빛이 떨어진 자리 */
    speck: ['a-plum', 420], blades: { n: 130, h: 0.17, sway: 0.14, tones: K => [K.mix('stage-deep', 'a-leaf', 0.35), K.mix('a-leaf', 'a-plum', 0.4)] },
    flowers: 12, scatter: (K, c) => { flakes(K, c, 260, [['a-wood', 'a-plum', 0.4], ['a-gold', 'a-wood', 0.5], ['stage-deep', 'a-leaf', 0.4]], 0.12); sparkle(K, c, 40, 'a-gold', 0.35); } },
  /* 젖은 모래 · 물가 자갈 · 나무 판자 */
  wetsand: { base: K => K.mix(K.mix('a-cream', 'a-gold', 0.3), 'a-fish', 0.18), dirt: K => K.mix(K.mix('a-cream', 'a-wood', 0.35), 'a-fish', 0.1), lip: K => K.mix('a-wood', 'a-cream', 0.35), rough: 0.7,
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; for (let i = 0; i < 90; i++) { g.globalAlpha = 0.06 + rnd() * 0.1; g.fillStyle = i % 2 ? hexOf(K.mix('a-fish', 'a-cream', 0.5)) : hexOf(K.mix('a-gold', 'a-wood', 0.4)); g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 30 + rnd() * 90, 8 + rnd() * 18, rnd() * 0.4 - 0.2, 0, 7); g.fill(); }      /* 물결 자국 */
      g.strokeStyle = hexOf(K.mix('a-wood', 'ink', 0.2)); for (let i = 0; i < 5; i++) { const x = P.gx(-6.6 + i * 0.5), y = P.gz(2.2); g.globalAlpha = 0.5; g.lineWidth = 0.34 * P.gs; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 1.2 * P.gs); g.stroke(); } g.globalAlpha = 1; },      /* 나무 판자 */
    speck: ['a-gold', 520], blades: { n: 180, h: 0.3, sway: 0.3, tones: K => [K.mix('a-leaf', 'a-fish', 0.25), K.mix('a-leaf', 'a-gold', 0.3)] },
    flowers: 10, scatter: (K, c) => pebbles(K, c, 150) },
  /* 짧게 깎은 잔디 · 젖은 디딤돌 · 물웅덩이 */
  wetlawn: { base: K => K.mix(K.mix('a-leaf', 'a-steel', 0.35), 'stage-deep', 0.12), dirt: K => K.mix('a-steel', 'a-cream', 0.3), lip: K => K.mix('stage-deep', 'a-steel', 0.3), rough: 0.6,
    paint(g, P){ const { rnd, w, h, hex, hexOf, K } = P; for (let r = 0; r < 9; r++) { g.globalAlpha = 0.08; g.fillStyle = r % 2 ? hex('stage-deep') : hex('a-leaf'); g.fillRect(0, r * h / 9, w, h / 9); }      /* 깎은 줄무늬 */
      for (let i = 0; i < 6; i++) P.soft(g, P.gx(0.2 + Math.sin(i * 1.3) * 0.5), P.gz(1.6 - i * 0.85), 0.5 * P.gs, 0.34 * P.gs, hexOf(K.mix('a-steel', 'a-cream', 0.35)), 0.95, 4);      /* 정자로 가는 디딤돌 */
      for (let i = 0; i < 9; i++) P.soft(g, rnd() * w, rnd() * h, 26 + rnd() * 40, 12 + rnd() * 16, hexOf(K.mix('a-fish', 'surface', 0.5)), 0.5, 12); g.globalAlpha = 1; },      /* 웅덩이 빛 */
    speck: ['stage-deep', 380], blades: { n: 520, h: 0.1, sway: 0.3, tones: K => [K.mix('a-leaf', 'a-steel', 0.3), K.mix('a-leaf', 'stage-deep', 0.3)] },
    flowers: 24, scatter: (K, c) => sparkle(K, c, 50, 'surface', 0.05) }
};
/* 반짝임 — 이슬 · 서리(바닥 바로 위의 빛 점) */
function sparkle(K, c, n, tn, y){ const { THREE } = K, N = K.LOW ? Math.round(n / 2) : n, p = new Float32Array(N * 3), rnd = K.RNG(41); let k = 0, guard = 0;
  while (k < N && guard++ < N * 20) { const x = c.bx(rnd()), z = c.bz(rnd()); if (!c.freeAt(x, z)) continue; p[k * 3] = x; p[k * 3 + 1] = c.heightAt(x, z) + y; p[k * 3 + 2] = z; k++; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p.slice(0, k * 3), 3));
  const pts = K.fx(new THREE.Points(geo, new THREE.PointsMaterial({ color: K.tone(tn), size: 0.09, transparent: true, opacity: 0.9, depthWrite: false }))); c.group.add(K.extra(pts));
  c.steps.push((dt, t) => { pts.material.opacity = 0.55 + Math.sin(t * 2.3) * 0.35; pts.material.size = 0.07 + Math.max(0, Math.sin(t * 1.3)) * 0.05; }); }
/* 낙엽 — 바닥에 누운 잎 조각 */
function flakes(K, c, n, tones, r){ const { THREE, M } = K, N = K.LOW ? Math.round(n / 3) : n, geo = new THREE.CircleGeometry(r, 5); geo.rotateX(-Math.PI / 2);
  const im = new THREE.InstancedMesh(geo, M(K.C('surface'), { roughness: 0.9, side: THREE.DoubleSide }), N), rnd = K.RNG(57), d = new THREE.Object3D(), tn = tones.map(K.tone); let k = 0, guard = 0;
  while (k < N && guard++ < N * 12) { const x = c.bx(rnd()), z = c.bz(rnd()); if (!c.freeAt(x, z)) continue; d.position.set(x, c.heightAt(x, z) + 0.012 + rnd() * 0.02, z); d.rotation.set((rnd() - 0.5) * 0.5, rnd() * 6.3, (rnd() - 0.5) * 0.5); const s = 0.7 + rnd() * 0.9; d.scale.set(s * 1.5, 1, s * 0.8); d.updateMatrix(); im.setMatrixAt(k, d.matrix); im.setColorAt(k, tn[(rnd() * tn.length) | 0]); k++; }
  im.count = k; im.castShadow = false; im.receiveShadow = true; c.group.add(im); }
/* 조약돌 */
function pebbles(K, c, n){ const { THREE, M } = K, N = K.LOW ? Math.round(n / 2) : n, im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), M(K.C('surface'), { roughness: 0.45 }), N), rnd = K.RNG(71), d = new THREE.Object3D(), tn = [K.mix('a-steel', 'surface', 0.3), rockTone(K, 0.1), K.mix('a-cream', 'a-steel', 0.5), K.mix('a-fish', 'a-steel', 0.6)]; let k = 0, guard = 0;
  while (k < N && guard++ < N * 12) { const x = c.bx(rnd()), z = c.bz(rnd()); if (!c.freeAt(x, z)) continue; const s = 0.5 + rnd() * 1.1; d.position.set(x, c.heightAt(x, z) + 0.02, z); d.rotation.y = rnd() * 6.3; d.scale.set(s * 1.3, s * 0.45, s); d.updateMatrix(); im.setMatrixAt(k, d.matrix); im.setColorAt(k, tn[(rnd() * tn.length) | 0]); k++; }
  im.count = k; im.castShadow = false; im.receiveShadow = true; c.group.add(im); }
/* 눈 더미 */
function mounds(K, c, n){ const { M, ball } = K, rnd = K.RNG(83), m = M(K.mix('surface', 'a-fish', 0.08), { roughness: 0.85 }); let k = 0, guard = 0;
  while (k < n && guard++ < n * 20) { const x = c.bx(rnd()), z = c.bz(rnd()); if (!c.freeAt(x, z) || Math.abs(x) < 3.2 && z > -1 || z > 2.6) continue; const s = 0.3 + rnd() * 0.5, b = ball(s, m, x, c.heightAt(x, z) + s * 0.05, z, 1.5, 0.34, 1.1); b.castShadow = false; c.group.add(b); k++; } }

/* ── ⑤ 둘레 — 글자 나무(걸음마다 다른 생김새 · tr.userData = { crown, trunk, fruit, fruitHome }) ── */
/* 글자를 드는 것은 글자 그릇(rooms/carriers.js) — 나무는 그 곳의 나무일 뿐이다. 사과나무 빈터(A01)에서만 열매 그릇이 가지에 달린다(o.letter 가 있을 때) */
const FRUIT_AT = l => (l === 'a' ? [-1.25, 1.95, 1.95] : [-0.9, 2.15, 2.2]);
function treeBase(K, o){ const g = new K.THREE.Group(); g.position.set(o.x, o.y || 0, o.z); const trunk = new K.THREE.Group(); g.add(trunk); return { g, trunk, bark: K.M(o.bark || 'a-wood', { roughness: 0.9 }) }; }
function treeDone(K, t, crown, o){ let fruit = null; if (o.letter) { fruit = carrier(K, 'fruit', { letter: o.letter, tone: o.fruitTone, r: o.fruitR }); fruit.position.set(...(o.fruitAt || FRUIT_AT(o.letter))); (o.fruitInCrown ? crown : t.g).add(fruit); }
  t.g.userData = { crown, trunk: t.trunk, fruit, fruitHome: fruit ? fruit.position.clone() : null, kind: o.kind }; return t.g; }
function limb(K, t, from, to, r){ const { THREE } = K, a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), m = K.mesh(new THREE.CylinderGeometry(r * 0.6, r, a.distanceTo(b), 7), t.bark); m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); t.trunk.add(m); return m; }
export const TREES = {
  /* 둥글고 낮은 사과나무 — 줄기 · 뿌리 · 둥근 잎 머리 · 작은 열매들(A01 기준판 그대로) */
  apple(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, o), g = t.g, bark = t.bark;
    t.trunk.add(mesh(new THREE.CylinderGeometry(0.3, 0.52, 2.8, 14), bark, 0, 1.4, 0));
    [0.5, 2.6, 4.5].forEach(a => { const r = ball(0.3, bark, Math.cos(a) * 0.48, 0.06, Math.sin(a) * 0.48, 1.6, 0.55, 0.9); r.rotation.y = -a; g.add(r); });
    const crown = new THREE.Group(); crown.position.y = o.crownY || 3.6; t.trunk.add(crown);
    const leaf = o.leaf, L1 = M(leaf, { roughness: 0.95 }), L2 = M(mix(leaf, 'warm-soft', 0.12), { roughness: 0.95 }), L3 = M(mix(leaf, 'stage-deep', 0.4), { roughness: 0.95 });
    [[0, 0.15, 0, 1.75, L1], [1.3, -0.25, 0.2, 1.2, L1], [-1.3, -0.2, 0.25, 1.25, L1], [0.2, -0.4, 1.0, 1.15, L1], [0, 1.05, -0.2, 1.2, L2], [0.85, 0.8, 0.45, 0.8, L2], [-0.8, 0.75, 0.5, 0.85, L2], [0, -0.35, -1.0, 1.25, L3], [-0.9, -0.75, 0.7, 0.7, L3], [1.0, -0.8, 0.6, 0.7, L3]].forEach(c => crown.add(ball(c[3], c[4], c[0], c[1], c[2], 1, 0.9, 1)));
    const APPLES = [[-1.3, -0.35, 1.2], [0.9, 0.35, 1.55], [1.8, -0.5, 0.8], [-0.3, 0.95, 1.3], [-1.95, 0.3, 0.6], [0.45, -0.95, 1.75], [1.2, -0.75, 1.3], [-0.55, 0.1, 1.72], [0.85, 1.15, 0.9]];
    const apples = o.apples === true ? APPLES : o.apples;
    if (apples) apples.forEach(a => { crown.add(ball(0.25, M('a-red', { roughness: 0.3 }), a[0], a[1], a[2])); crown.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 5), bark, a[0], a[1] + 0.27, a[2])); });
    else [[-1.2, -0.3, 1.25], [1.0, 0.4, 1.5], [1.7, -0.55, 0.85], [-0.2, 1.0, 1.25], [0.5, -0.9, 1.75]].forEach(a => crown.add(ball(0.13, M('a-gold', { roughness: 0.4 }), a[0], a[1], a[2])));
    return treeDone(K, t, crown, o); },
  /* 굵고 곧은 큰 나무 — 줄기가 화면 위로 뻗고 잎 지붕은 높다. 열매는 낮은 곁가지에 */
  pillar(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, o), bark = t.bark, H = o.h || 8.5;
    t.trunk.add(mesh(new THREE.CylinderGeometry(0.5, 0.74, H, 16), bark, 0, H / 2, 0));
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, r = ball(0.34, bark, Math.cos(a) * 0.7, 0.1, Math.sin(a) * 0.7, 1.9, 0.6, 0.8); r.rotation.y = -a; t.g.add(r); }                       /* 버팀 뿌리 */
    for (let y = 1.2; y < H - 1; y += 1.5) { const k = mesh(new THREE.TorusGeometry(0.58 - y * 0.02, 0.035, 5, 18), M(mix(o.bark || 'a-wood', 'ink', 0.25), { roughness: 1 }), 0, y, 0); k.rotation.x = Math.PI / 2; k.castShadow = false; t.trunk.add(k); }      /* 껍질 띠 */
    t.trunk.add(ball(0.2, M(mix('stage-deep', 'a-leaf', 0.5), { roughness: 1 }), 0.3, 1.5, 0.52, 1.4, 1.8, 0.4));                                                                               /* 이끼 */
    const crown = new THREE.Group(); crown.position.y = H; t.trunk.add(crown); const L1 = M(o.leaf, { roughness: 0.95 }), L3 = M(mix(o.leaf, 'stage-deep', 0.45), { roughness: 0.95 });
    [[0, 0, 0, 2.5, L1], [2.0, -0.5, 0.4, 1.7, L3], [-2.1, -0.4, 0.3, 1.8, L1], [0.3, -0.7, 1.7, 1.6, L3], [0, -0.5, -1.6, 1.8, L3]].forEach(c => crown.add(ball(c[3], c[4], c[0], c[1], c[2], 1, 0.5, 1)));
    const at = o.fruitAt || FRUIT_AT(o.letter); limb(K, t, [0, 3.3, 0.2], [at[0], 3.05, at[2]], 0.16); t.trunk.add(ball(0.5, L1, at[0] - 0.1, 3.25, at[2] - 0.1, 1.3, 0.6, 1.1)); t.trunk.add(ball(0.36, L3, at[0] + 0.5, 3.1, at[2] - 0.4, 1.2, 0.6, 1));
    return treeDone(K, t, crown, o); },
  /* 물가로 늘어진 가지 — 줄기가 물 쪽으로 기울고 잎 줄기가 발처럼 드리운다 */
  weeping(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, o), s = o.x < 0 ? 1 : -1, L1 = M(o.leaf, { roughness: 0.9 }), L2 = M(mix(o.leaf, 'a-fish', 0.25), { roughness: 0.9 });
    limb(K, t, [0, 0, 0], [s * 0.5, 1.7, 0.1], 0.42); limb(K, t, [s * 0.5, 1.6, 0.1], [s * 1.3, 3.2, 0.3], 0.3); limb(K, t, [s * 1.2, 3.0, 0.3], [s * 2.5, 3.7, 0.9], 0.18); limb(K, t, [s * 0.9, 2.6, 0.2], [-s * 0.6, 3.6, 0.6], 0.16);
    [0.8, 3.0, 5.0].forEach(a => { const r = ball(0.26, t.bark, Math.cos(a) * 0.42, 0.05, Math.sin(a) * 0.42, 1.7, 0.5, 0.8); r.rotation.y = -a; t.g.add(r); });
    const crown = new THREE.Group(); crown.position.set(s * 1.4, 3.7, 0.4); t.trunk.add(crown);
    [[0, 0, 0, 1.5, L1], [s * 1.2, -0.1, 0.5, 1.1, L2], [-s * 1.4, 0, 0.2, 1.05, L1], [0.1, 0.5, -0.5, 1.0, L2]].forEach(c => crown.add(ball(c[3], c[4], c[0], c[1], c[2], 1.1, 0.55, 1)));
    const strands = []; for (let i = 0; i < 19; i++) { const a = i / 19 * Math.PI * 2, rx = 1.7 + (i % 3) * 0.3, len = 1.2 + (i * 7 % 5) * 0.34, st = new THREE.Group(); st.position.set(Math.cos(a) * rx, -0.1, Math.sin(a) * rx * 0.75 + 0.2);
      const m = mesh(new THREE.CapsuleGeometry(0.035, len, 3, 5), i % 2 ? L1 : L2, 0, -len / 2, 0); m.castShadow = false; st.add(m); for (let k = 1; k <= 4; k++) { const lf = ball(0.11, k % 2 ? L2 : L1, (k % 2 ? 0.07 : -0.07), -len * k / 4, 0, 0.7, 1.5, 0.45); lf.castShadow = false; st.add(lf); } crown.add(st); strands.push(st); }
    const g = treeDone(K, t, crown, o); g.userData.sway = (tt, w) => strands.forEach((st, i) => { st.rotation.z = Math.sin(tt * 1.1 * w + i) * 0.1; st.rotation.x = Math.cos(tt * 0.9 * w + i * 1.7) * 0.07; }); return g; },
  /* 바람에 한쪽으로 기운 나무 — 줄기가 휘고 잎 머리가 바람 쪽으로 길게 쏠렸다 */
  windswept(K, o){ const { THREE, M, mix, ball } = K, t = treeBase(K, o), L1 = M(o.leaf, { roughness: 0.95 }), L2 = M(mix(o.leaf, 'a-gold', 0.3), { roughness: 0.95 }), d = o.lean || 1;
    limb(K, t, [0, 0, 0], [d * 0.35, 1.3, 0], 0.34); limb(K, t, [d * 0.35, 1.25, 0], [d * 1.2, 2.5, 0.1], 0.26); limb(K, t, [d * 1.15, 2.45, 0.1], [d * 2.5, 3.2, 0.2], 0.17); limb(K, t, [d * 0.8, 2.0, 0], [d * 2.0, 2.2, 0.8], 0.11);
    [1.2, 3.4, 5.2].forEach(a => { const r = ball(0.22, t.bark, Math.cos(a) * 0.36, 0.05, Math.sin(a) * 0.36, 1.6, 0.5, 0.8); r.rotation.y = -a; t.g.add(r); });
    const crown = new THREE.Group(); crown.position.set(d * 2.3, 3.4, 0.2); t.trunk.add(crown);
    [[0, 0, 0, 1.15, L1, 1.9, 0.62], [d * 1.5, -0.25, 0.2, 0.85, L2, 2.0, 0.55], [-d * 0.9, 0.25, 0, 0.8, L1, 1.5, 0.6], [d * 0.5, 0.45, -0.3, 0.7, L2, 1.8, 0.5], [d * 2.6, -0.5, 0.1, 0.5, L1, 2.2, 0.5]].forEach(c => { const b = ball(c[3], c[4], c[0], c[1], c[2], c[5], c[6], 0.95); b.rotation.z = -d * 0.16; crown.add(b); });
    const g = treeDone(K, t, crown, o); g.userData.sway = (tt, w) => { crown.rotation.z = Math.sin(tt * 1.7 * w) * 0.035 - d * 0.03; crown.position.x = d * 2.3 + Math.sin(tt * 1.7 * w + 0.6) * 0.06; }; return g; },
  /* 서리 앉은 바늘잎나무 — 층층이 원뿔, 층마다 눈 */
  conifer(K, o){ const { THREE, M, mix, mesh } = K, t = treeBase(K, o), L1 = M(o.leaf, { roughness: 0.95 }), snow = M(mix('surface', 'a-fish', 0.1), { roughness: 0.8 });
    t.trunk.add(mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.6, 10), t.bark, 0, 0.8, 0));
    const crown = new THREE.Group(); crown.position.y = 1.2; t.trunk.add(crown);
    [[1.9, 1.9, 0], [1.55, 1.7, 1.15], [1.2, 1.5, 2.2], [0.85, 1.3, 3.15], [0.5, 1.1, 3.95]].forEach((c, i) => { crown.add(mesh(new THREE.ConeGeometry(c[0], c[1], 9), L1, 0, c[2] + c[1] / 2, 0)); const sn = mesh(new THREE.ConeGeometry(c[0] * 0.78, c[1] * 0.6, 9), snow, 0.04 * (i % 2 ? 1 : -1), c[2] + c[1] * 0.72, 0.03); sn.castShadow = false; crown.add(sn); });
    return treeDone(K, t, crown, o); },
  /* 깃대처럼 곧고 가는 나무 — 가지가 위로 붙고 잎 뭉치가 층층이 작다 */
  pole(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, o), L1 = M(o.leaf, { roughness: 0.95 }), L2 = M(mix(o.leaf, 'stage-deep', 0.3), { roughness: 0.95 });
    t.trunk.add(mesh(new THREE.CylinderGeometry(0.1, 0.19, 5.4, 9), t.bark, 0, 2.7, 0));
    const crown = new THREE.Group(); crown.position.y = 2.2; t.trunk.add(crown);
    [[0, 3.3, 0.62], [0.28, 2.5, 0.56], [-0.26, 1.75, 0.6], [0.22, 1.0, 0.5], [-0.2, 0.35, 0.44]].forEach((c, i) => crown.add(ball(c[2], i % 2 ? L2 : L1, c[0], c[1], (i % 2 ? 0.12 : -0.1), 1, 1.25, 1)));
    return treeDone(K, t, crown, Object.assign({ fruitAt: [0.5, 2.4, 0.5] }, o)); },
  /* 높은 도토리나무 — 굵은 줄기 · 넓고 납작한 머리 · 옆으로 뻗은 굵은 가지 하나(둥지 자리) */
  oak(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, o), L1 = M(o.leaf, { roughness: 0.95 }), L2 = M(mix(o.leaf, 'a-plum', 0.25), { roughness: 0.95 }), s = o.x < 0 ? 1 : -1;
    t.trunk.add(mesh(new THREE.CylinderGeometry(0.42, 0.66, 3.6, 12), t.bark, 0, 1.8, 0)); [[-0.5, 0], [0.45, 0.35], [0.1, -0.5]].forEach(r => { const rt = ball(0.34, t.bark, r[0], 0.12, r[1], 1.6, 0.5, 1); rt.rotation.y = Math.atan2(r[1], r[0]); t.trunk.add(rt); });      /* 뿌리 */
    limb(K, t, [0, 2.9, 0], [s * 1.9, 3.5, 0.3], 0.2);
    const crown = new THREE.Group(); crown.position.y = 3.4; t.trunk.add(crown);
    [[0, 1.1, 0, 1.75], [-1.4, 0.75, 0.2, 1.25], [1.45, 0.8, -0.1, 1.3], [0.2, 0.6, 1.0, 1.1], [-0.5, 1.9, -0.2, 1.05], [0.8, 1.8, 0.3, 0.95]].forEach((c, i) => crown.add(ball(c[3], i % 2 ? L2 : L1, c[0], c[1], c[2], 1.1, 0.72, 1)));
    const g = treeDone(K, t, crown, Object.assign({ fruitAt: [s * 1.2, 2.3, 0.9] }, o)); g.userData.limb = [s * 1.9, 3.5, 0.3]; return g; },
  /* 대나무 떨기 — 마디진 곧은 줄기 여럿과 가는 잎 */
  bamboo(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, Object.assign({ bark: ['a-leaf', 'a-gold', 0.35] }, o)), L1 = M(o.leaf, { roughness: 0.9 }), node = M(mix('a-leaf', 'stage-deep', 0.4), { roughness: 0.9 });
    const crown = new THREE.Group(); t.trunk.add(crown);
    [[0, 0, 5.2], [0.42, 0.2, 4.4], [-0.36, 0.26, 4.8], [0.1, -0.4, 3.8], [-0.5, -0.2, 3.4]].forEach((p, i) => { t.trunk.add(mesh(new THREE.CylinderGeometry(0.07, 0.09, p[2], 7), t.bark, p[0], p[2] / 2, p[1])); for (let y = 0.9; y < p[2]; y += 0.9) { const n = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 7), node, p[0], y, p[1]); n.castShadow = false; t.trunk.add(n); }
      for (let k = 0; k < 4; k++) { const lf = ball(0.34, L1, p[0] + Math.cos(k * 1.7 + i) * 0.42, p[2] - 0.3 - k * 0.42, p[1] + Math.sin(k * 1.7 + i) * 0.42, 1.5, 0.16, 0.45); lf.rotation.z = Math.cos(k * 1.7 + i) * 0.7; lf.rotation.y = k * 1.7 + i; crown.add(lf); } });
    return treeDone(K, t, crown, Object.assign({ fruitAt: [0.7, 2.2, 0.6] }, o)); },
  /* 둥글게 깎은 정원수 — 곧은 줄기에 공 둘(큰 것 · 작은 것) */
  topiary(K, o){ const { THREE, M, mix, mesh, ball } = K, t = treeBase(K, o), L1 = M(o.leaf, { roughness: 1 });
    t.trunk.add(mesh(new THREE.CylinderGeometry(0.11, 0.15, 3.3, 9), t.bark, 0, 1.65, 0)); { const pot = mesh(new THREE.CylinderGeometry(0.52, 0.4, 0.5, 14), M(mix('a-steel', 'a-cream', 0.35), { roughness: 0.9 }), 0, 0.25, 0); t.trunk.add(pot); }      /* 돌 화분 */
    const crown = new THREE.Group(); crown.position.y = 1.5; t.trunk.add(crown); crown.add(ball(1.05, L1, 0, 0.9, 0)); crown.add(ball(0.7, L1, 0, 2.35, 0)); crown.add(ball(0.42, L1, 0, 3.3, 0));
    return treeDone(K, t, crown, Object.assign({ fruitAt: [0.75, 2.5, 0.75] }, o)); }
};
export function letterTree(K, o){ const f = TREES[o.kind || 'apple']; if (!f) throw new Error('없는 나무 ' + o.kind); return f(K, o); }

/* 그 곳의 풀 · 바위 — around.plants: [[이름, x, z, 크기]] */
export const PLANTS = {
  fern(K, s){ const { THREE, M, mix, ball } = K, g = new THREE.Group(), m = M(mix('a-leaf', 'stage-deep', 0.3), { roughness: 0.9 }); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, f = ball(0.34, m, Math.cos(a) * 0.3, 0.26, Math.sin(a) * 0.3, 1.5, 0.12, 0.42); f.rotation.y = -a; f.rotation.z = 0.5; f.castShadow = false; g.add(f); } g.scale.setScalar(s); return g; },
  bigleaf(K, s){ const { THREE, M, mix, mesh, ball } = K, g = new THREE.Group(), m = M(mix('a-leaf', 'a-fish', 0.2), { roughness: 0.7, side: THREE.DoubleSide }); for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.4, st = new THREE.Group(); st.rotation.y = a; st.add(mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.7, 5), M('a-leaf'), 0.1, 0.35, 0)); const lf = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), m); lf.position.set(0.32, 0.72, 0); lf.rotation.set(-1.1, 0, -0.3); lf.scale.set(1, 1.25, 1); lf.castShadow = true; st.add(lf); g.add(st); } g.scale.setScalar(s); return g; },
  thistle(K, s){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(); [[0, 0.9, 0], [0.16, 0.66, 0.1], [-0.14, 0.74, -0.06]].forEach((p, i) => { g.add(mesh(new THREE.CylinderGeometry(0.018, 0.024, p[1], 5), M('a-leaf'), p[0], p[1] / 2, p[2])); g.add(ball(0.09, M('a-leaf'), p[0], p[1], p[2])); g.add(ball(0.1, M('a-plum', { roughness: 0.8 }), p[0], p[1] + 0.1, p[2], 1, 0.8, 1)); }); g.scale.setScalar(s); return g; },
  clover(K, s){ const { THREE, M, mix, ball } = K, g = new THREE.Group(), m = M(mix('a-leaf', 'stage', 0.3), { roughness: 0.9 }); for (let i = 0; i < 9; i++) { const x = (i % 3 - 1) * 0.3 + (i * 0.37 % 0.2), z = ((i / 3 | 0) - 1) * 0.26; [0, 2.1, 4.2].forEach(a => { const l = ball(0.07, m, x + Math.cos(a) * 0.06, 0.05, z + Math.sin(a) * 0.06, 1, 0.3, 1); l.castShadow = false; g.add(l); }); } [[-0.2, 0.1], [0.3, -0.15]].forEach(p => g.add(ball(0.06, M('surface', { roughness: 0.7 }), p[0], 0.16, p[1]))); g.scale.setScalar(s); return g; },
  snowrock(K, s){ return rockOf(K, 0, 0, 0, 0.5 * s, s * 3, K.mix('surface', 'a-fish', 0.1)); },
  mossrock(K, s){ return rockOf(K, 0, 0, 0, 0.5 * s, s * 3, K.mix('a-leaf', 'stage-deep', 0.4)); },
  stump(K, s){ const { THREE, M, mesh } = K, g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.34, 14), M('a-wood', { roughness: 0.9 }), 0, 0.17, 0)); g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 14), M('a-cream', { roughness: 0.8 }), 0, 0.345, 0)); g.scale.setScalar(s); return g; }
};

/* ── ③ 뒤 — 받침 뒤쪽(자리 테두리 밖으로 뻗은 땅 위와 그 너머)의 먼 풍경. (K, c) → 매 장면 함수(없어도 된다) ── */
export const BACKS = {
  /* 숲 가장자리 — 나무 사이로 들어온 길이 보인다 */
  forestEdge(K, c){ const { mix, C } = K, zs = c.z0 + 1.3, gap = c.o.gap == null ? -2.6 : c.o.gap;
    for (let i = 0; i < 9; i++) { const x = c.x0 + 1.2 + i * (c.x1 - c.x0 - 2.4) / 8; if (Math.abs(x - gap) < 1.25) continue; const r = 1.45 + (i * 7 % 4) * 0.2, z = zs + (i % 2) * 0.7 - 0.2; c.group.add(bushOf(K, x, c.heightAt(x, z), z, r, i % 2 ? mix('stage-deep', 'a-leaf', 0.35) : C('stage-deep'), false, 1.3)); }
    for (let i = 0; i < 6; i++) { const x = c.x0 + 2.6 + i * (c.x1 - c.x0 - 5.2) / 5; if (Math.abs(x - gap) < 1.6) continue; c.group.add(bushOf(K, x, 0, c.z0 + 0.35, 1.7, mix('stage-deep', 'ink', 0.18), false, 1.6)); }
    c.trail = [[gap, c.z0 + 0.2, 0.9], [gap - 0.1, c.z0 + 1.2, 0.8], [gap - 0.2, c.z0 + 2.1, 0.7]].concat(c.o.trail || [[gap - 0.1, -5.0, 0.62]]); },      /* 들어온 길 — 바닥 그림이 받아 그린다 */
  /* 굵은 줄기들이 벽처럼 가깝다 — 하늘은 조금만 */
  trunkWall(K, c){ const { THREE, M, mix, mesh, ball } = K, bark = M(mix('a-wood', 'ink', 0.22), { roughness: 1 }), far = M(mix(mix('a-wood', 'ink', 0.4), 'stage-deep', 0.3), { roughness: 1 });
    const col = (x, z, r, mt) => { const y = c.heightAt(x, z); c.group.add(mesh(new THREE.CylinderGeometry(r * 0.8, r, 16, 14), mt, x, y + 8, z)); for (let i = 0; i < 4; i++) { const a = i * 1.6 + x, rt = ball(r * 0.5, mt, x + Math.cos(a) * r * 0.95, y + 0.1, z + Math.sin(a) * r * 0.95, 1.8, 0.6, 0.8); rt.rotation.y = -a; c.group.add(rt); } };
    [[-8.6, -6.4, 0.95], [-5.6, -7.3, 1.15], [-2.3, -6.6, 0.8], [1.2, -7.4, 1.25], [4.3, -6.5, 0.9], [7.4, -7.2, 1.1], [-9.3, -2.6, 0.8], [9.4, -3.4, 0.85]].forEach(t => col(t[0], t[1], t[2], bark));
    [[-7.2, -8.0, 0.8], [-3.9, -8.1, 0.7], [-0.6, -8.0, 0.75], [2.9, -8.1, 0.7], [5.9, -8.0, 0.8], [9.0, -7.9, 0.7]].forEach(t => col(t[0], t[1], t[2], far));
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 26), new THREE.MeshBasicMaterial({ color: mix(mix('stage-deep', 'ink', 0.45), 'a-wood', 0.2) })); wall.position.set(0, 7, c.z0 - 1.4); c.group.add(K.fx(wall));                 /* 그 뒤는 어두운 숲 */
    const roof = M(mix('stage-deep', 'a-leaf', 0.25), { roughness: 1 }), roof2 = M(mix('stage-deep', 'a-gold', 0.3), { roughness: 1 });
    for (let i = 0; i < 11; i++) { const b = ball(1.5 + (i % 3) * 0.3, i % 3 ? roof : roof2, -10 + i * 2, 6.9 + (i % 2) * 0.5, -5.6 - (i % 3) * 0.5, 1.2, 0.55, 1); b.castShadow = false; c.group.add(b); } },      /* 잎 지붕의 아랫자락 */
  /* 절벽과 떨어지는 폭포 — 절벽 위로 숲 */
  cliffFall(K, c){ const { THREE, M, mix, mesh, ball, canvasTex, hex, hexOf } = K, wet = mix(mix('ink-2', 'a-fish', 0.4), 'stage-deep', 0.16), rock = M(wet, { roughness: 0.85 }), rock2 = M(mix(wet, 'ink', 0.22), { roughness: 0.85 }), moss = M(mix('a-leaf', 'stage-deep', 0.35), { roughness: 1 });
    const zc = c.z0 + 1.2, fx0 = c.o.fallX == null ? 0.4 : c.o.fallX;
    for (let i = 0; i < 9; i++) { const x = c.x0 - 0.6 + i * (c.x1 - c.x0 + 1.2) / 8, dz = (i * 5 % 3) * 0.25, hole = Math.abs(x - fx0) < 1.3; const b = mesh(new THREE.BoxGeometry(2.6, 15, 1.9), i % 2 ? rock : rock2, x, 7.2, zc - dz - (hole ? 0.5 : 0)); b.rotation.y = (i % 3 - 1) * 0.08; c.group.add(b);
      [[2.2, 0.5], [5.0, 0.42], [8.2, 0.5]].forEach((l, k) => { if (hole || (i + k) % 2) return; c.group.add(ball(0.9, k % 2 ? rock : rock2, x + (k - 1) * 0.3, l[0] + (i % 2) * 0.7, zc - dz + 0.85, 1.4, 0.45, 0.7)); c.group.add(ball(0.6, moss, x + (k - 1) * 0.3, l[0] + (i % 2) * 0.7 + 0.32, zc - dz + 0.9, 1.5, 0.25, 0.7)); }); }
    [-1, 1].forEach(s => { const x = s > 0 ? c.x1 + 0.2 : c.x0 - 0.2; c.group.add(mesh(new THREE.BoxGeometry(1.8, 9, 3.2), rock2, x, 4.3, c.z0 + 2.6)); c.group.add(ball(1.2, moss, x, 8.9, c.z0 + 2.7, 1.1, 0.35, 1.4)); });      /* 양옆으로 감싸는 바위 날개 */
    const tex = canvasTex(64, 256, (g, w, h) => { g.fillStyle = hexOf(mix('a-fish', 'surface', 0.35)); g.fillRect(0, 0, w, h); g.fillStyle = hex('surface'); const rnd = K.RNG(9); for (let i = 0; i < 60; i++) { g.globalAlpha = 0.3 + rnd() * 0.45; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 4, 24 + rnd() * 50); } g.globalAlpha = 1; }); tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 2.2);
    const fall = K.fx(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 15), new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.92, roughness: 0.25 }))); fall.position.set(fx0, c.waterY + 7.4, zc + 0.52); c.group.add(fall);
    const foam = []; for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), puffM(K, 'surface', 0.7)); c.group.add(K.fx(f)); foam.push({ m: f, k: i / 7 }); }
    return (dt, t) => { tex.offset.y = t * 0.55; foam.forEach(f => { const k = (f.k + t * 0.3) % 1; f.m.position.set(fx0 + Math.sin(f.k * 21) * 1.0, c.waterY + 0.1 + k * 0.5, zc + 1.0 + Math.cos(f.k * 13) * 0.4); f.m.scale.setScalar(0.6 + k * 0.9); f.m.material.opacity = Math.sin(k * Math.PI) * 0.75; }); }; },
  /* 탁 트였다 — 겹겹이 먼 언덕, 숲은 발아래 */
  farHills(K, c){ const { THREE, mix, ball, C } = K, top = K.tone(c.SK.stops[1]);
    [[-9, -6.2, -11, 9.5, 'a-leaf', 0.3], [8, -7.4, -13, 11, 'a-leaf', 0.48], [-2, -8.8, -16, 13, 'a-fish', 0.62], [13, -9.6, -19, 12, 'a-fish', 0.76], [-15, -9.4, -20, 11, 'a-fish', 0.8]].forEach(h => { const m = new THREE.Mesh(new THREE.SphereGeometry(h[3], 28, 14), new THREE.MeshBasicMaterial({ color: mix(mix(h[4], 'a-gold', 0.18), top, h[5]) })); m.position.set(h[0], h[1], h[2]); m.scale.set(1.5, 0.62, 0.6); c.group.add(K.fx(m)); });
    for (let i = 0; i < 12; i++) { const x = c.x0 - 2 + i * (c.x1 - c.x0 + 4) / 11, b = bushOf(K, x, -3.1 - (i % 3) * 0.4, c.z0 - 1.6 - (i % 2) * 1.1, 1.3 + (i % 3) * 0.25, i % 2 ? mix('stage-deep', 'a-leaf', 0.3) : C('stage-deep'), false, 1); b.traverse(m => { m.castShadow = false; }); c.group.add(b); } },      /* 지나온 숲의 나무 머리 */
  /* 양옆 바위벽이 뒤에서 좁아지고, 골짜기 끝에 밝은 틈 하나 */
  gorgeGap(K, c){ const { THREE, M, mix, mesh, ball } = K, r1 = M(mix(rockTone(K, 0.22), 'a-fish', 0.2), { roughness: 0.95 }), r2 = M(mix(rockTone(K, 0.36), 'a-fish', 0.15), { roughness: 0.95 }), snow = M(mix('surface', 'a-fish', 0.08), { roughness: 0.85 });
    const slab = (x, y, z, w, h, d, ry, i) => { const b = mesh(new THREE.BoxGeometry(w, h, d), i % 2 ? r1 : r2, x, y + h / 2, z); b.rotation.y = ry; c.group.add(b); const cap = ball(Math.max(w, d) * 0.5, snow, x, y + h, z, w / Math.max(w, d) * 1.05, 0.16, d / Math.max(w, d) * 1.05); cap.castShadow = false; c.group.add(cap);
      if (h > 3) { const lg = ball(0.7, snow, x + (x < 0 ? 0.9 : -0.9) * w * 0.4, y + h * 0.45, z + 0.3, 1.5, 0.22, 1.2); lg.castShadow = false; c.group.add(lg); } };
    for (let i = 0; i < 6; i++) { const z = 2.2 - i * 2.0, k = i / 5; slab(c.x0 + 0.9 + k * 0.7, 0.6, z, 2.4, 3.2 + k * 7.5, 2.3, 0.1 - k * 0.2, i); slab(c.x1 - 0.7 - k * 0.5, 0.6, z, 2.2, 1.6 + k * 7.0, 2.3, -0.1 + k * 0.2, i + 1); }      /* 앞은 낮고 뒤로 갈수록 높다 */
    [[-6.6, 9.5, 3.4], [-3.6, 11, 3.0], [4.6, 11.5, 3.0], [7.4, 9.5, 3.4]].forEach((w, i) => slab(w[0], 1.2, c.z0 + 0.9 + (i % 2) * 0.3, w[2], w[1], 2.2, (w[0] < 0 ? -1 : 1) * 0.14, i));                                                           /* 뒤에서 좁아진다 */
    const gx = 0.5, gl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 16), new THREE.MeshBasicMaterial({ color: mix('surface', 'warm-soft', 0.4) })); gl.position.set(gx, 7.4, c.z0 - 0.6); c.group.add(K.fx(gl));                                 /* 밝은 틈 */
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 15), new THREE.MeshBasicMaterial({ map: K.glowTex(128, 1.3), color: K.C('warm-soft'), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(gx, 4.8, c.z0 + 0.9); c.group.add(K.extra(K.fx(halo)));
    return (dt, t) => { halo.material.opacity = 0.48 + Math.sin(t * 0.6) * 0.08; }; }
,
  /* 성벽과 탑의 한 귀퉁이 — 벼랑 아래로 지나온 숲의 나무 머리 */
  castleWall(K, c){ const { THREE, M, mix, mesh, C } = K, st = M(mix(mix('a-steel', 'a-cream', 0.35), 'stage-2-soft', 0.2), { roughness: 0.95 }), st2 = M(mix('a-steel', 'ink-2', 0.3), { roughness: 0.95 }), zw = c.z0 + 0.9, y0 = c.heightAt(0, zw);
    const wall = mesh(new THREE.BoxGeometry(c.x1 - c.x0 - 3.2, 2.6, 0.9), st, -1.6, y0 + 1.3, zw); c.group.add(wall);
    for (let i = 0; i < 9; i++) { const x = c.x0 + 0.5 + i * (c.x1 - c.x0 - 4.4) / 8; c.group.add(mesh(new THREE.BoxGeometry(0.72, 0.5, 0.95), i % 2 ? st : st2, x, y0 + 2.85, zw)); }                              /* 성가퀴 */
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const b = mesh(new THREE.BoxGeometry(1.1, 0.06, 0.04), st2, c.x0 + 1.4 + i * 1.75 + (r % 2) * 0.8, y0 + 0.6 + r * 0.75, zw + 0.47); b.castShadow = false; c.group.add(b); }      /* 돌 줄눈 */
    const tx = c.x1 - 1.4, tw = mesh(new THREE.CylinderGeometry(1.25, 1.4, 5.2, 14), st, tx, y0 + 2.6, zw - 0.2); c.group.add(tw); c.group.add(mesh(new THREE.ConeGeometry(1.6, 1.7, 14), M(mix('a-red', 'a-wood', 0.35), { roughness: 0.8 }), tx, y0 + 6.05, zw - 0.2));      /* 탑과 지붕 */
    { const win = mesh(new THREE.BoxGeometry(0.34, 0.6, 0.08), M(mix('ink', 'a-plum', 0.3)), tx - 0.2, y0 + 3.6, zw + 1.12); win.castShadow = false; c.group.add(win); const fl = mesh(new THREE.BoxGeometry(0.05, 1.3, 0.05), M('a-wood'), tx, y0 + 7.5, zw - 0.2); c.group.add(fl); const pen = mesh(new THREE.BoxGeometry(0.8, 0.42, 0.03), M('a-gold', { side: THREE.DoubleSide }), tx + 0.42, y0 + 7.9, zw - 0.2); pen.castShadow = false; c.group.add(pen); c.flag = pen; }
    for (let i = 0; i < 12; i++) { const x = c.x0 - 3 + i * (c.x1 - c.x0 + 6) / 11, b = bushOf(K, x, -3.4 - (i % 3) * 0.5, c.z0 - 2.4 - (i % 2) * 1.3, 1.5 + (i % 3) * 0.3, i % 2 ? mix('stage-deep', 'a-leaf', 0.3) : C('stage-deep'), false, 1); b.traverse(m => { m.castShadow = false; }); c.group.add(b); }      /* 벼랑 아래 지나온 숲 */
    return (dt, t) => { if (c.flag) c.flag.rotation.y = Math.sin(t * 5) * 0.35; }; },
  /* 검은 숲 실루엣과 큰 달 */
  moonForest(K, c){ const { THREE, mix, mesh } = K, dark = new THREE.MeshBasicMaterial({ color: mix('ink', 'a-plum', 0.35) }), dark2 = new THREE.MeshBasicMaterial({ color: mix(mix('ink', 'a-plum', 0.5), 'word-blue', 0.2) }), mo = c.o.moon || [-4.6, 3.3, c.z0 - 3.4, 2.5];      /* 달 — 눈이 내려다보므로 낮게 걸어야 화면에 든다 */
    const moon = K.fx(new THREE.Mesh(new THREE.CircleGeometry(mo[3], 48), new THREE.MeshBasicMaterial({ color: mix('surface', 'a-gold', 0.18) }))); moon.position.set(mo[0], mo[1], mo[2]); c.group.add(moon);
    const halo = K.fx(new THREE.Mesh(new THREE.CircleGeometry(mo[3] * 1.7, 48), new THREE.MeshBasicMaterial({ color: mix('surface', 'a-fish', 0.3), transparent: true, opacity: 0.16, depthWrite: false }))); halo.position.set(mo[0], mo[1], mo[2] - 0.1); c.group.add(halo);
    for (let i = 0; i < 15; i++) { const x = c.x0 - 2.5 + i * (c.x1 - c.x0 + 5) / 14, far = i % 2, h = 5.5 + (i * 7 % 5) * 0.9, z = c.z0 - 0.4 - far * 2.2, g = new THREE.Group(); if (Math.abs(x - mo[0]) < (far ? 1.2 : 2.6)) continue;      /* 달 앞은 비워 둔다 */ g.position.set(x, c.heightAt(Math.max(c.x0, Math.min(c.x1, x)), c.z0) - 0.4, z);
      g.add(K.fx(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, h * 0.5, 7), far ? dark2 : dark))).position.y = h * 0.25; for (let k = 0; k < 3; k++) { const cr = K.fx(new THREE.Mesh(new THREE.ConeGeometry(1.9 - k * 0.45, h * 0.42, 8), far ? dark2 : dark)); cr.position.y = h * (0.45 + k * 0.22); g.add(cr); } c.group.add(g); }
    c.moon = moon; return (dt, t) => { halo.material.opacity = 0.14 + Math.sin(t * 0.6) * 0.04; }; },
  /* 갈대밭과 낮게 늘어진 버드나무 — 물 건너편이 낮고 훤하다 */
  reedWillow(K, c){ const { THREE, M, mix, mesh, ball } = K, reed = M(mix('a-leaf', 'a-gold', 0.4), { roughness: 0.95 }), head = M(mix('a-wood', 'ink', 0.15), { roughness: 0.9 }), list = [];
    for (let i = 0; i < 46; i++) { const x = c.x0 + 0.3 + (i * 0.618 % 1) * (c.x1 - c.x0 - 0.6), z = c.z0 + 0.3 + (i * 0.37 % 1) * 1.4, h = 1.3 + (i * 7 % 5) * 0.28, g = new THREE.Group(); g.position.set(x, c.heightAt(x, z), z);
      const st = mesh(new THREE.CylinderGeometry(0.02, 0.035, h, 5), reed, 0, h / 2, 0); st.castShadow = false; g.add(st); if (i % 3 === 0) g.add(mesh(new THREE.CapsuleGeometry(0.06, 0.24, 4, 8), head, 0, h + 0.1, 0)); else { const lf = ball(0.22, reed, 0.1, h * 0.7, 0, 1.3, 0.1, 0.3); lf.rotation.z = 0.8; lf.castShadow = false; g.add(lf); } g.userData.k = i * 1.3; c.group.add(g); list.push(g); }
    [[c.x0 + 1.2, 1], [c.x1 - 1.0, -1], [c.x0 + 6.2, 1]].forEach((w, i) => { const g = new THREE.Group(), z = c.z0 - 0.5 - i * 0.3; g.position.set(w[0], c.heightAt(Math.max(c.x0, Math.min(c.x1, w[0])), c.z0), z); g.add(mesh(new THREE.CylinderGeometry(0.3, 0.46, 3.0, 9), M(mix('a-wood', 'ink', 0.18), { roughness: 1 }), 0, 1.5, 0));
      const lm = M(mix(mix('a-leaf', 'a-fish', 0.3), 'surface', 0.12), { roughness: 0.95 }); for (let k = 0; k < 5; k++) g.add(ball(1.0 - k * 0.06, lm, w[1] * (k * 0.5 - 0.6), 3.4 - Math.abs(k - 2) * 0.25, 0.2, 1.3, 0.75, 1)); for (let k = 0; k < 7; k++) { const dr = mesh(new THREE.CapsuleGeometry(0.05, 1.2 + (k % 3) * 0.4, 3, 5), lm, w[1] * (k * 0.42 - 1.0), 2.4 - (k % 3) * 0.2, 0.55); dr.castShadow = false; g.add(dr); } c.group.add(g); });      /* 늘어진 버드나무 */
    return (dt, t) => { list.forEach(g => { g.rotation.z = Math.sin(t * 1.3 + g.userData.k) * 0.06 * (c.wind || 1); }); }; },
  /* 장미 덩굴 담과 아치문 — 그 뒤로 비에 흐린 숲 */
  roseWall(K, c){ const { THREE, M, mix, mesh, ball, C } = K, hedge = M(mix('stage-deep', 'a-leaf', 0.35), { roughness: 1 }), stone = M(mix('a-steel', 'a-cream', 0.3), { roughness: 0.95 }), rose = [M('a-red', { roughness: 0.6 }), M('a-pink', { roughness: 0.6 }), M(mix('a-red', 'a-plum', 0.4), { roughness: 0.6 })], zw = c.z0 + 0.7, y0 = c.heightAt(0, zw), ax = c.o.arch == null ? -4.6 : c.o.arch;
    [[c.x0 + 0.2, ax - 1.1], [ax + 1.1, c.x1 - 0.2]].forEach(sp => { const w = sp[1] - sp[0]; c.group.add(mesh(new THREE.BoxGeometry(w, 1.9, 0.8), hedge, (sp[0] + sp[1]) / 2, y0 + 0.95, zw)); const top = ball(0.5, hedge, (sp[0] + sp[1]) / 2, y0 + 1.9, zw, w, 0.5, 0.85); c.group.add(top);
      for (let i = 0; i < Math.round(w * 1.6); i++) { const x = sp[0] + 0.3 + (i * 0.618 % 1) * (w - 0.6), y = y0 + 0.5 + (i * 0.37 % 1) * 1.4, r = ball(0.11, rose[i % 3], x, y, zw + 0.42, 1, 1, 0.6); r.castShadow = false; c.group.add(r); } });      /* 장미 */
    [-1, 1].forEach(sd => c.group.add(mesh(new THREE.BoxGeometry(0.34, 2.6, 0.9), stone, ax + sd * 0.95, y0 + 1.3, zw))); { const ar = mesh(new THREE.TorusGeometry(0.95, 0.17, 8, 18, Math.PI), stone, ax, y0 + 2.6, zw); c.group.add(ar); for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI, r = ball(0.12, rose[i % 3], ax + Math.cos(a) * 1.0, y0 + 2.6 + Math.sin(a) * 1.0, zw + 0.2); r.castShadow = false; c.group.add(r); } }      /* 아치문 */
    c.trail = [[ax, c.z0 + 0.4, 0.8], [ax + 0.2, c.z0 + 1.5, 0.7]];
    for (let i = 0; i < 11; i++) { const x = c.x0 - 2 + i * (c.x1 - c.x0 + 4) / 10, b = bushOf(K, x, 0.4 + (i % 3) * 0.3, c.z0 - 1.8 - (i % 2) * 1.2, 1.9 + (i % 3) * 0.3, mix(i % 2 ? 'stage-deep' : 'a-leaf', 'a-steel', 0.45), false, 1.4); b.traverse(m => { m.castShadow = false; }); c.group.add(b); } }      /* 비에 흐린 숲 */
};

/* ── 날씨 — 값이 아니라 보이는 것(R6). (K, c) → { step(dt, t), … }. null = 뒤 묶음이 채울 자리(비 · 달 · 눈) ── */
export const WEATHER = {
  /* 아침 안개 — 풀밭 위에 낮게 깔려 천천히 흐른다 */
  mist(K, c){ const { THREE } = K, tex = K.glowTex(128, 1.5), list = [];
    [[-5.5, 0.4, 1.6, 7, 2.6], [3.6, 0.5, -1.2, 8, 2.8], [-0.5, 0.34, 3.4, 9, 2.2], [6.6, 0.42, 2.4, 6, 2.4], [-7, 0.5, -3.4, 7, 2.6]].forEach((p, i) => { const m = K.fx(new THREE.Mesh(new THREE.PlaneGeometry(p[3], p[4]), new THREE.MeshBasicMaterial({ map: tex, color: K.C('surface'), transparent: true, opacity: 0.3, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.position.set(p[0], p[1], p[2]); m.userData = { x: p[0], k: i * 1.9 }; c.group.add(m); list.push(m); });      /* 느린 기기에서도 보인다(날씨는 보이는 것 — R6) */
    return { step: (dt, t) => list.forEach(m => { m.position.x = m.userData.x + Math.sin(t * 0.12 + m.userData.k) * 1.6; m.material.opacity = 0.22 + Math.sin(t * 0.3 + m.userData.k) * 0.1; }) }; },
  /* 빛 기둥 — 키트의 햇살 판(하늘 부품의 shafts)이 짓는다. 여기서는 빛 속을 떠다니는 큰 먼지 빛만 더한다 */
  shafts(K, c){ const { THREE } = K, N = K.LOW ? 24 : 60, p = new Float32Array(N * 3), rnd = K.RNG(17); for (let i = 0; i < N; i++) { p[i * 3] = (rnd() - 0.5) * 15; p[i * 3 + 1] = 0.6 + rnd() * 4.6; p[i * 3 + 2] = (rnd() - 0.5) * 9; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = K.fx(new THREE.Points(geo, new THREE.PointsMaterial({ color: K.C('a-gold'), size: 0.16, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }))); c.group.add(K.extra(pts));
    return { step: (dt, t) => { const a = geo.attributes.position; for (let i = 0; i < N; i++) { a.array[i * 3 + 1] -= dt * 0.05; a.array[i * 3] += Math.sin(t * 0.4 + i) * dt * 0.08; if (a.array[i * 3 + 1] < 0.4) a.array[i * 3 + 1] = 5.2; } a.needsUpdate = true; pts.material.opacity = 0.5 + Math.sin(t * 0.7) * 0.2; } }; },
  /* 물안개와 물보라에 걸린 작은 무지개 */
  spray(K, c){ const { THREE } = K, at = c.land.creek || [0.4, -3.7], mist = []; for (let i = 0; i < 9; i++) { const m = K.fx(new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), puffM(K, 'surface', 0))); c.group.add(m); mist.push({ m, k: i / 9 }); }
    const bow = new THREE.Group(); bow.position.set(at[0] - 1.5, c.waterY - 0.3, at[1] - 0.7); bow.rotation.y = 0.25; ['a-red', 'a-gold', 'a-leaf', 'a-fish', 'a-plum'].forEach((tn, i) => { const m = K.fx(new THREE.Mesh(new THREE.TorusGeometry(2.0 - i * 0.1, 0.055, 6, 40, Math.PI), new THREE.MeshBasicMaterial({ color: K.C(tn), transparent: true, opacity: 0.5, depthWrite: false }))); bow.add(m); }); c.group.add(bow);
    return { bow, step: (dt, t) => { mist.forEach(s => { const k = (s.k + t * 0.1) % 1; s.m.position.set(at[0] + Math.sin(s.k * 17) * 3.0, c.waterY + 0.3 + k * 1.6, at[1] - 0.6 + Math.cos(s.k * 11) * 1.4); s.m.scale.setScalar(0.8 + k * 1.6); s.m.material.opacity = Math.sin(k * Math.PI) * 0.3; }); bow.children.forEach(m => { m.material.opacity = 0.36 + Math.sin(t * 0.5) * 0.14; }); } }; },
  /* 구름 그림자 — 땅을 따라 빠르게 지나간다 · 하늘에는 그 구름 */
  cloudShadow(K, c){ const { THREE } = K, tex = K.canvasTex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const rnd = K.RNG(29); for (let i = 0; i < 5; i++) { const x = rnd() * w, y = rnd() * h, r = 46 + rnd() * 40; for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) K.soft(g, x + ox, y + oy, r, r * 0.6, K.hex('ink'), 0.5, 26); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(0.75, 0.75);
    const sh = K.fx(new THREE.Mesh(c.terrainGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))); sh.position.y = 0.02; c.group.add(sh);
    const cm = new THREE.MeshBasicMaterial({ color: K.mix('surface', 'warm-soft', 0.15) }), clouds = [];
    [[-7, 6.2, -9, 1.5], [1, 7.0, -11, 2.0], [8, 5.8, -8.5, 1.3], [-13, 6.8, -10, 1.7], [14, 6.6, -12, 1.8]].forEach((p, i) => { const g = new THREE.Group(); [[0, 0, 1], [0.9, -0.1, 0.72], [-0.95, -0.12, 0.78], [0.3, 0.3, 0.7], [-0.4, 0.26, 0.6]].forEach(b => { const m = new THREE.Mesh(new THREE.SphereGeometry(b[2] * p[3], 14, 10), cm); m.position.set(b[0] * p[3], b[1] * p[3], 0); m.scale.set(1.25, 0.72, 0.7); g.add(K.fx(m)); }); g.position.set(p[0], p[1], p[2]); g.userData.x = p[0]; c.group.add(g); clouds.push(g); });
    return { shadow: sh, clouds, step: (dt, t) => { tex.offset.x = -t * 0.035 * c.wind; tex.offset.y = t * 0.008; clouds.forEach((g, i) => { g.position.x = ((g.userData.x + t * 0.5 * c.wind + 22) % 44) - 22; g.position.y += Math.sin(t * 0.4 + i) * dt * 0.02; }); } }; },
  /* 입김 — 말하는 입에서 흰 김(add 로 사람을 알려 준다) · 서리는 바닥 부품이 반짝인다 */
  breath(K, c){ const { THREE } = K, who = [], puffs = []; for (let i = 0; i < 9; i++) { const m = K.fx(new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), puffM(K, 'surface', 0))); m.visible = false; c.group.add(m); puffs.push({ m, t: 1 }); }
    const v = new THREE.Vector3(); let next = 1.2, n = 0;
    return { add: (obj, y) => who.push({ obj, y: y == null ? 1.5 : y }), step: (dt, t) => { next -= dt; if (next <= 0 && who.length) { next = 0.9 + (n % 3) * 0.5; const w = who[n++ % who.length]; w.obj.getWorldPosition(v); c.group.worldToLocal(v); for (let k = 0; k < 3; k++) { const p = puffs.find(q => q.t >= 1); if (!p) break; p.t = -k * 0.12; p.at = [v.x + Math.sin(w.obj.rotation.y) * 0.5, v.y + w.y, v.z + Math.cos(w.obj.rotation.y) * 0.5, w.obj.rotation.y]; } }
        puffs.forEach(p => { if (p.t >= 1) { p.m.visible = false; return; } p.t += dt / 1.7; if (p.t < 0) return; const k = p.t; p.m.visible = true; p.m.position.set(p.at[0] + Math.sin(p.at[3]) * k * 0.5, p.at[1] + k * 0.45, p.at[2] + Math.cos(p.at[3]) * k * 0.5); p.m.scale.setScalar(0.7 + k * 2.2); p.m.material.opacity = Math.sin(Math.min(1, k) * Math.PI) * 0.55; }); } }; },
  /* 센 바람 — 먼 하늘의 연 셋과 옆으로 날리는 민들레 씨 */
  kites(K, c){ const { THREE, M, mesh } = K, kites = [], tn = ['a-gold', 'a-fish', 'a-pink'];
    [[-6.5, 7.2, -9], [3.5, 8.4, -11], [9.5, 6.6, -8]].forEach((p, i) => { const g = new THREE.Group(), d = K.fx(new THREE.Mesh(new THREE.CircleGeometry(0.62, 4), new THREE.MeshBasicMaterial({ color: K.C(tn[i]), side: THREE.DoubleSide }))); d.scale.set(0.8, 1.15, 1); g.add(d);
      for (let k = 1; k <= 4; k++) { const t = K.fx(new THREE.Mesh(new THREE.CircleGeometry(0.1, 3), new THREE.MeshBasicMaterial({ color: K.C(tn[(i + k) % 3]), side: THREE.DoubleSide }))); t.position.set(-k * 0.22, -0.7 - k * 0.3, 0); g.add(t); } g.position.set(p[0], p[1], p[2]); g.userData = { p, k: i * 2.1, tail: g.children.slice(1) }; c.group.add(g); kites.push(g); });
    const N = K.LOW ? 14 : 34, pos = new Float32Array(N * 3), rnd = K.RNG(23), sd = []; for (let i = 0; i < N; i++) sd.push([rnd(), 0.6 + rnd() * 3.6, c.z0 + rnd() * (c.z1 - c.z0), 0.5 + rnd() * 0.8]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = K.fx(new THREE.Points(geo, new THREE.PointsMaterial({ color: K.C('surface'), size: 0.13, transparent: true, opacity: 0.9, depthWrite: false }))); c.group.add(pts);
    return { kites, step: (dt, t) => { kites.forEach(g => { const u = g.userData; g.position.x = u.p[0] + Math.sin(t * 0.5 + u.k) * 0.9; g.position.y = u.p[1] + Math.sin(t * 0.8 + u.k) * 0.4; g.rotation.z = Math.sin(t * 1.3 + u.k) * 0.2 - 0.25; u.tail.forEach((m, k) => { m.position.x = -(k + 1) * 0.22 + Math.sin(t * 4 + k + u.k) * 0.12; }); });
      const W = c.x1 - c.x0 + 4; for (let i = 0; i < N; i++) { const q = sd[i], x = c.x0 - 2 + ((q[0] + t * 0.07 * q[3]) % 1) * W; pos[i * 3] = x; pos[i * 3 + 1] = q[1] + Math.sin(t * 1.4 + i) * 0.25; pos[i * 3 + 2] = q[2]; } geo.attributes.position.needsUpdate = true; } }; },
  /* 김 — 따뜻한 것(냄비) 위로 오르는 흰 김과 물 위의 반짝임. c.o 가 아니라 터가 아는 물 자리에서 오른다 */
  steam(K, c){ const { THREE } = K, at = c.land.creek || [0.4, -3.1], puffs = [], N = K.LOW ? 5 : 10; for (let i = 0; i < N; i++) { const m = K.fx(new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), puffM(K, 'surface', 0))); m.userData.k = i / N; c.group.add(m); puffs.push(m); }
    const NG = K.LOW ? 10 : 22, gp = new Float32Array(NG * 3), rnd = K.RNG(37), W0 = c.land.waters[0] || { x: at[0], z: at[1], rx: 2, rz: 1.4 }; for (let i = 0; i < NG; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.9; gp[i * 3] = W0.x + Math.cos(a) * W0.rx * r; gp[i * 3 + 1] = c.waterY + 0.03; gp[i * 3 + 2] = W0.z + Math.sin(a) * W0.rz * r; }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); const glint = K.fx(new THREE.Points(gg, new THREE.PointsMaterial({ color: K.C('surface'), size: 0.11, transparent: true, opacity: 0.8, depthWrite: false }))); c.group.add(glint);
    return { puffs, step: (dt, t) => { puffs.forEach(m => { const k = (m.userData.k + t * 0.16) % 1; m.position.set(at[0] + Math.sin(m.userData.k * 19) * 1.5, c.waterY + 0.8 + k * 2.0, at[1] + Math.cos(m.userData.k * 13) * 0.9); m.scale.setScalar(0.5 + k * 1.1); m.material.opacity = Math.sin(k * Math.PI) * 0.34; }); glint.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.3; } }; },
  /* 비 — 빗줄기와 땅에 번지는 파문. stop() 으로 그친다(비 갠 뒤의 장면) */
  rain(K, c){ const { THREE } = K, N = K.LOW ? 60 : 150, pos = new Float32Array(N * 6), rnd = K.RNG(53), dr = []; for (let i = 0; i < N; i++) dr.push([c.bx(rnd()), c.bz(rnd()), rnd(), 0.8 + rnd() * 0.5]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const lines = K.fx(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: K.mix('surface', 'a-fish', 0.3), transparent: true, opacity: 0.55, depthWrite: false }))); c.group.add(lines);
    const rings = []; for (let i = 0; i < (K.LOW ? 4 : 8); i++) { const m = K.fx(new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 24), new THREE.MeshBasicMaterial({ color: K.C('surface'), transparent: true, opacity: 0, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.userData = { t: i / 8, x: 0, z: 0 }; c.group.add(m); rings.push(m); }
    let on = 1, goal = 1;
    return { stop(){ goal = 0; }, start(){ goal = 1; }, get on(){ return on; }, step: (dt, t) => { on += (goal - on) * Math.min(1, dt * 1.2); lines.material.opacity = 0.55 * on; const TOP = 7.5;
      for (let i = 0; i < N; i++) { const q = dr[i], k = (q[2] + t * 0.9 * q[3]) % 1, y = TOP * (1 - k), x = q[0] - k * 0.6; pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = q[1]; pos[i * 6 + 3] = x - 0.05; pos[i * 6 + 4] = y - 0.45; pos[i * 6 + 5] = q[1]; } geo.attributes.position.needsUpdate = true;
      rings.forEach((m, i) => { const u = m.userData; u.t += dt * 0.9; if (u.t >= 1) { u.t = 0; u.x = c.bx(Math.random()); u.z = c.bz(Math.random()); } m.position.set(u.x, c.heightAt(u.x, u.z) + 0.03, u.z); m.scale.setScalar(0.1 + u.t * 0.5); m.material.opacity = (1 - u.t) * 0.5 * on; }); } }; },
  snow: null,      /* 뒤 묶음이 채운다 — 쌓이는 눈(R6) */
  /* 달밤 — 별과, 박자에 깜박이는 반딧불(flies 는 그 걸음의 놀이가 빌려 쓴다) */
  moon(K, c){ const { THREE } = K, NS = K.LOW ? 40 : 110, sp = new Float32Array(NS * 3), rnd = K.RNG(61); for (let i = 0; i < NS; i++) { sp[i * 3] = c.x0 - 8 + rnd() * (c.x1 - c.x0 + 16); sp[i * 3 + 1] = 6 + rnd() * 9; sp[i * 3 + 2] = c.z0 - 6 - rnd() * 8; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); const stars = K.fx(new THREE.Points(sg, new THREE.PointsMaterial({ color: K.C('surface'), size: 0.14, transparent: true, opacity: 0.85, depthWrite: false }))); c.group.add(stars);
    const flies = [], NF = K.LOW ? 8 : 16, fm = () => new THREE.MeshBasicMaterial({ color: K.mix('a-gold', 'surface', 0.3), transparent: true, opacity: 0.9, depthWrite: false });
    for (let i = 0; i < NF; i++) { let x = 0, z = 0, guard = 0; do { x = c.bx(rnd()); z = c.bz(rnd()); } while (!c.freeAt(x, z) && guard++ < 30); const m = K.fx(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), fm())); m.userData = { x, z, y: c.heightAt(x, z) + 0.7 + rnd() * 1.5, k: rnd() * 6.3 }; c.group.add(m); flies.push(m); }
    return { flies, stars, step: (dt, t) => { stars.material.opacity = 0.75 + Math.sin(t * 0.9) * 0.1; flies.forEach(m => { const u = m.userData; if (u.hold) return; m.position.set(u.x + Math.sin(t * 0.5 + u.k) * 0.5, u.y + Math.sin(t * 0.8 + u.k * 2) * 0.25, u.z + Math.cos(t * 0.4 + u.k) * 0.4); m.material.opacity = 0.35 + Math.abs(Math.sin(t * 1.3 + u.k)) * 0.6; }); } }; }
};

/* ── 터를 짓는다 ── */
export function buildLand(K, place, opt = {}){
  const miss = checkPlace(place); if (miss.length) throw new Error('무대 칸이 비었다 — ' + miss.join(' · '));
  const { THREE, M, C, hex, mix, hexOf, tone, RNG, canvasTex, mesh, ball, rbox, flat, oval, soft, glowTex, fx, LOW, S } = K;
  const GW = opt.GW || GLADE.GW, GD = opt.GD || GLADE.GD, road = opt.road === undefined ? GLADE.road : opt.road;
  const land = LANDS[place.land.kind](place.land), FL = FLOORS[place.floor.kind], SK = Object.assign({}, SKIES[place.sky.kind], place.sky), AR = place.around, LOOK = LOOKS[place.look.kind];
  const ext = Object.assign({ back: 0, left: 0, right: 0 }, land.ext, opt.ext), x0 = -GW / 2 - ext.left, x1 = GW / 2 + ext.right, z0 = -GD / 2 - ext.back, z1 = GD / 2, W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const waters = land.waters || [], waterY = land.waterY == null ? 0.03 : land.waterY, drop = land.drop || 0, wind = SK.wind || 1;
  const inWater = (x, z) => waters.some(w => inEl(w, x, z));
  const wy = w => (w.y == null ? waterY : w.y);
  const heightAt = (x, z) => { const w = waters.find(q => inEl(q, x, z)); return w ? wy(w) : land.heightAt(x, z); };      /* 설 수 있는 높이 — 물 위는 물 높이 */
  const group = new THREE.Group(), steps = [];
  const blocks = (opt.blocks || []).slice();
  const freeAt = freeAtOf({ x0, x1, z0, z1, waters: land.frees || waters, road, blocks });
  const c = { K, group, steps, land, heightAt, freeAt, waterY, x0, x1, z0, z1, GW, GD, SK, wind, o: null, bx: r => x0 + r * W, bz: r => z0 + r * D, trail: null, terrainGeo: null };
  /* 뒤 — 먼저 짓는다(들어온 길처럼 바닥 그림이 받아 그릴 것이 있다) */
  c.o = place.back; const backStep = BACKS[place.back.kind](K, c); if (backStep) steps.push(backStep);
  /* 잘라 낸 땅 + 땅 아래의 옅은 그림자(떠 있는 느낌) */
  { const soil = rbox(W, D, 1.0, 1.6, M(mix('a-wood', 'ink', 0.2), { roughness: 0.95 })); soil.rotation.x = -Math.PI / 2; soil.position.set(cx, -0.66 - drop, cz); group.add(soil);
    const band = rbox(W + 0.04, D + 0.04, 0.14, 1.62, M(mix('stage-2', 'a-wood', 0.35), { roughness: 1 })); band.rotation.x = -Math.PI / 2; band.position.set(cx, -0.34 - drop, cz); group.add(band);
    const lip = rbox(W + 0.2, D + 0.2, 0.22, 1.7, M(FL.lip(K), { roughness: 1 })); lip.rotation.x = -Math.PI / 2; lip.position.set(cx, -0.112 - drop, cz); group.add(lip);
    const sh = fx(new THREE.Mesh(new THREE.PlaneGeometry(W * 1.5, D * 1.6), new THREE.MeshBasicMaterial({ map: glowTex(128, 1.6), color: C('ink'), transparent: true, opacity: 0.5, depthWrite: false }))); sh.rotation.x = -Math.PI / 2; sh.position.set(cx + 0.4, -1.5 - drop, cz + 0.6); group.add(sh); }
  /* 바닥 그림 — 바닥 부품의 바탕 · 물가 모래 · 뒤에서 들어온 길 · 그 방의 얼룩(오솔길 · 밟힌 자리) */
  const TW = 1024, TH = Math.round(1024 * D / W), gx = x => (x - x0) / W * TW, gz = z => (z - z0) / D * TH, gs = TW / W;
  const dirt = hexOf(FL.dirt(K)), sand = hexOf(mix('a-cream', 'stage-2-soft', 0.4));
  const tex = canvasTex(TW, TH, (g, w, h) => { const rnd = RNG(5), P = { gx, gz, gs, soft, hex, hexOf, mix, dirt, sand, rnd, w, h, K };
    g.fillStyle = hexOf(FL.base(K)); g.fillRect(0, 0, w, h); FL.paint(g, P);
    (land.sand || []).forEach(s => soft(g, gx(s.x), gz(s.z), s.rx * gs, s.rz * gs, sand, 0.96, 0.32 * gs));                                                    /* 개울가 모래 */
    if (!land.sand) waters.forEach(wt => soft(g, gx(wt.x), gz(wt.z), (wt.rx + 0.35) * gs, (wt.rz + 0.35) * gs, hexOf(mix(FL.dirt(K), 'ink', 0.12)), 0.5, 0.3 * gs));  /* 젖은 물가 */
    if (land.ice) soft(g, gx(land.ice.x), gz(land.ice.z), (land.ice.rx + 0.25) * gs, (land.ice.rz + 0.2) * gs, hexOf(mix('a-fish', 'surface', 0.4)), 0.7, 0.25 * gs);
    if (c.trail) c.trail.forEach(p => soft(g, gx(p[0]), gz(p[1]), p[2] * gs, 0.5 * gs, dirt, 0.72, 0.3 * gs));
    if (opt.paint) opt.paint(g, P);
    g.fillStyle = hex(FL.speck[0]); for (let i = 0; i < FL.speck[1]; i++) { g.globalAlpha = 0.22 + rnd() * 0.25; g.fillRect(rnd() * w, rnd() * h, 2, 4 + rnd() * 6); } g.globalAlpha = 1; });
  /* 땅 — 높낮이가 있는 한 장(귀퉁이는 둥글게) + 가장자리 옆면 */
  { const NX = LOW ? 56 : 84, NZ = LOW ? 40 : 60, geo = new THREE.PlaneGeometry(W - 0.16, D - 0.16, NX, NZ); geo.rotateX(-Math.PI / 2); geo.translate(cx, 0, cz);
    const pa = geo.attributes.position, uv = geo.attributes.uv, hx = (W - 0.16) / 2, hz = (D - 0.16) / 2, cr = 1.52;
    for (let i = 0; i < pa.count; i++) { let x = pa.getX(i) - cx, z = pa.getZ(i) - cz; const ax = Math.abs(x) - (hx - cr), az = Math.abs(z) - (hz - cr);
      if (ax > 0 && az > 0) { const d = Math.hypot(ax, az); if (d > cr) { x = Math.sign(x) * (hx - cr + ax / d * cr); z = Math.sign(z) * (hz - cr + az / d * cr); } }
      x += cx; z += cz; pa.setXYZ(i, x, land.heightAt(x, z), z); uv.setXY(i, (x - x0) / W, 1 - (z - z0) / D); }
    geo.computeVertexNormals(); c.terrainGeo = geo;
    const top = new THREE.Mesh(geo, M(C('surface'), { map: tex, roughness: FL.rough || 0.96 })); top.receiveShadow = true; top.position.y = 0.004; group.add(top);
    /* 옆면 — 땅 가장자리에서 받침 턱까지 */
    const ring = []; for (let i = 0; i <= NX; i++) ring.push(i); for (let j = 1; j <= NZ; j++) ring.push(j * (NX + 1) + NX); for (let i = NX - 1; i >= 0; i--) ring.push(NZ * (NX + 1) + i); for (let j = NZ - 1; j >= 1; j--) ring.push(j * (NX + 1));
    const sp = [], si = [], yb = -0.02 - drop; ring.forEach((id, k) => { sp.push(pa.getX(id), pa.getY(id) + 0.004, pa.getZ(id), pa.getX(id), Math.min(yb, pa.getY(id)), pa.getZ(id)); const a = k * 2, b = ((k + 1) % ring.length) * 2; si.push(a, b, a + 1, b, b + 1, a + 1); });
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); sg.setIndex(si); sg.computeVertexNormals();
    const side = new THREE.Mesh(sg, M(mix(FL.lip(K), 'a-wood', 0.35), { roughness: 1, side: THREE.DoubleSide })); side.receiveShadow = true; group.add(side); }
  /* 풀잎 — 한 번에 그리는 수백 포기. 바람에 끝이 흔들린다(긴 풀은 눕는다) */
  const windU = { value: 0 }, dummy = new THREE.Object3D(), B = FL.blades;
  if (B && B.n) { const N = Math.round((LOW ? B.n * 0.33 : B.n) * (opt.grass == null ? 1 : opt.grass)), geo = new THREE.ConeGeometry(0.04, B.h, 4, 1); geo.translate(0, B.h / 2, 0);
    const mat = M(C('surface'), { roughness: 1 }), amp = (B.sway / B.h * 0.22).toFixed(3), lean = (B.sway > 0.4 ? 0.5 : 0).toFixed(2);
    mat.onBeforeCompile = sh => { sh.uniforms.uT = windU; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed.x += (sin(uT * 1.7 + instanceMatrix[3][0] * 1.7 + instanceMatrix[3][2] * 1.3) * ' + amp + ' + ' + lean + ') * position.y;\n#endif'); };
    const im = new THREE.InstancedMesh(geo, mat, N), rnd = RNG(11), tones = B.tones(K);
    let n = 0, guard = 0; while (n < N && guard++ < N * 12) { const cl = rnd() < 0.7, bx = c.bx(rnd()), bz = c.bz(rnd()), k = cl ? 3 : 1;
      for (let j = 0; j < k && n < N; j++) { const x = bx + (rnd() - 0.5) * 0.3, z = bz + (rnd() - 0.5) * 0.3; if (!freeAt(x, z)) continue;
        dummy.position.set(x, land.heightAt(x, z), z); dummy.rotation.set((rnd() - 0.5) * 0.3, rnd() * 6.3, (rnd() - 0.5) * 0.5); const s = 0.7 + rnd() * 0.8; dummy.scale.set(s, s * (0.8 + rnd() * 0.6), s); dummy.updateMatrix();
        im.setMatrixAt(n, dummy.matrix); im.setColorAt(n, tones[(rnd() * tones.length) | 0]); n++; } }
    im.count = n; im.receiveShadow = true; im.castShadow = false; group.add(im); }
  /* 꽃 — 무리 지어 핀다 */
  if (FL.flowers) { const N = Math.round((LOW ? FL.flowers / 3 : FL.flowers) * (opt.flowers == null ? 1 : opt.flowers)), rnd = RNG(23), stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.014, 0.018, 0.3, 5), M('a-leaf'), N), heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), M(C('surface'), { roughness: 0.6 }), N), cores = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), M('warm', { roughness: 0.5 }), N);
    const tones = [C('surface'), C('a-pink'), C('warm-soft'), mix('a-plum', 'surface', 0.45), C('a-gold')];
    let n = 0, guard = 0; while (n < N && guard++ < 400) { const bx = c.bx(rnd()), bz = c.bz(rnd()), tn = tones[(rnd() * tones.length) | 0];
      for (let j = 0; j < 5 && n < N; j++) { const x = bx + (rnd() - 0.5) * 0.9, z = bz + (rnd() - 0.5) * 0.7; if (!freeAt(x, z)) continue; const h = 0.2 + rnd() * 0.16, s = 0.8 + rnd() * 0.5, y = land.heightAt(x, z);
        dummy.rotation.set(0, 0, 0); dummy.scale.set(1, h / 0.3, 1); dummy.position.set(x, y + h / 2, z); dummy.updateMatrix(); stems.setMatrixAt(n, dummy.matrix);
        dummy.scale.set(s, s * 0.42, s); dummy.position.set(x, y + h, z); dummy.updateMatrix(); heads.setMatrixAt(n, dummy.matrix); heads.setColorAt(n, tn);
        dummy.scale.set(s, s, s); dummy.position.set(x, y + h + 0.035, z); dummy.updateMatrix(); cores.setMatrixAt(n, dummy.matrix); n++; } }
    [stems, heads, cores].forEach(m => { m.count = n; m.castShadow = false; m.receiveShadow = true; group.add(m); }); }
  if (FL.scatter) FL.scatter(K, c);
  /* 앞 흙길의 디딤돌 */
  if (road && road.stones) for (let i = 0; i < road.stones; i++) group.add(ball(0.2, M(mix(mix('a-steel', 'stage-2', 0.45), 'ink', 0.12), { roughness: 0.9 }), -3 + i * 1 + (i % 2) * 0.2, 0.02, road.z + ((i * 7) % 5 - 2) * 0.1, 1.2, 0.22, 0.9));
  /* 물 — 천천히 흐르고 물무늬가 퍼진다(돌 · 연잎 · 갈대) */
  const waterTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = hexOf(land.waterTone ? land.waterTone(K) : mix('a-fish', 'stage-soft', 0.3)); g.fillRect(0, 0, w, h); const rnd = RNG(3); g.strokeStyle = hex('surface'); g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { g.globalAlpha = 0.1 + rnd() * 0.16; g.lineWidth = 2 + rnd() * 3; const x = rnd() * w, y = rnd() * h, l = 18 + rnd() * 40; for (const of of [-w, 0, w]) { g.beginPath(); g.moveTo(x + of, y); g.quadraticCurveTo(x + of + l / 2, y - 5, x + of + l, y); g.stroke(); } } g.globalAlpha = 1; });
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping; waterTex.repeat.set(0.22, 0.22);
  const water = M(C('surface'), { map: waterTex, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.94 });
  const lilies = [], reeds = [], rings = [];
  if (waters.length) { waters.forEach(w => group.add(flat(oval(w.x, w.z, w.rx, w.rz), water, wy(w))));
    (land.stones || []).forEach(a => group.add(ball(a[2], M(mix('a-steel', 'ink', 0.08), { roughness: 0.65 }), a[0], heightAt(a[0], a[1]) + 0.04, a[1], 1.25, 0.34, 1)));
    (land.lilies || []).forEach((a, i) => { const p = new THREE.Mesh(new THREE.CircleGeometry(a[2], 22, 0.35, 5.6), M(mix('a-leaf', 'stage', 0.5), { roughness: 0.6, side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; p.rotation.z = i * 1.9; p.position.set(a[0], heightAt(a[0], a[1]) + 0.02, a[1]); p.userData.y = p.position.y; p.receiveShadow = true; group.add(p); lilies.push(p);
      if (i === 0 && land.lilyFlower) { const f = new THREE.Group(); f.position.set(a[0] + 0.05, heightAt(a[0], a[1]) + 0.05, a[1] - 0.04); for (let k = 0; k < 6; k++) { const pt = ball(0.08, M('a-pink', { roughness: 0.6 }), Math.cos(k * 1.047) * 0.07, 0.03, Math.sin(k * 1.047) * 0.07, 1, 0.55, 0.6); pt.rotation.y = -k * 1.047; f.add(pt); } f.add(ball(0.05, M('warm'), 0, 0.06, 0)); group.add(f); } });
    (land.reeds || []).forEach((a, i) => { const r = new THREE.Group(); r.position.set(a[0], heightAt(a[0], a[1]) - 0.03, a[1]); r.add(mesh(new THREE.CylinderGeometry(0.02, 0.028, a[2], 5), M(mix('a-leaf', 'warm', 0.25)), 0, a[2] / 2, 0)); r.add(mesh(new THREE.CapsuleGeometry(0.055, 0.2, 4, 8), M(mix('a-wood', 'ink', 0.1), { roughness: 0.9 }), 0, a[2] + 0.06, 0)); const lf = ball(0.2, M('a-leaf'), 0.12, a[2] * 0.4, 0, 1.2, 0.12, 0.3); lf.rotation.z = 0.9; r.add(lf); r.userData.k = i * 1.7; group.add(r); reeds.push(r); });
    for (let i = 0; i < (LOW ? Math.min(3, land.rings || 0) : land.rings || 0); i++) { const m = fx(new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 40), new THREE.MeshBasicMaterial({ color: C('surface'), transparent: true, opacity: 0, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.position.y = waterY + 0.015; m.userData = { t: 1, max: 1 }; group.add(m); rings.push(m); } }
  function ripple(x, z, max = 0.8){ const m = rings.find(r => r.userData.t >= 1); if (!m) return; m.position.x = x; m.position.z = z; m.userData.t = 0; m.userData.max = max; }
  if (land.ice) { const ic = flat(oval(land.ice.x, land.ice.z, land.ice.rx, land.ice.rz), M(mix('a-fish', 'surface', 0.55), { roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.9 }), heightAt(land.ice.x, land.ice.z) + 0.012); group.add(ic); }      /* 얼음판 */
  /* 둘레 — 덤불 · 버섯 · 바위 · 그 곳의 풀. 모형이 와 있으면(opt.models — 모형 설계 v1) 방 자료의 around.swap 대로 같은 자리에서 모형으로 바꿔 세우고, 안 왔으면 손으로 지은 것 그대로(G3) */
  const MS = opt.models || null, sw = (kind, i, sub) => swapName(AR, MS, kind, i, sub), models = [];
  const model = (n, x, z, size) => { const g = putModel(K, MS, n, x, heightAt(x, z) - 0.03, z, size, AR); group.add(g); models.push(g); return g; };
  const bushes = (AR.bushes || []).map((b, i) => { const n = sw('bushes', i); if (n) return model(n, b[0], b[1], SWAP_SIZE.bushes(b[2]));
    const g = bushOf(K, b[0], heightAt(b[0], b[1]), b[1], b[2], i % 2 ? mix(AR.bushTone || 'stage-deep', 'a-leaf', 0.35) : tone(AR.bushTone || 'stage-deep'), b[3]); group.add(g); return g; });
  (AR.mushrooms || []).forEach((m, i) => { const n = sw('mushrooms', i); if (n) model(n, m[0], m[1], SWAP_SIZE.mushrooms(m[2])); else group.add(mushroomOf(K, m[0], heightAt(m[0], m[1]), m[1], m[2])); });
  (AR.rocks || []).forEach((r, i) => { const n = sw('rocks', i); if (n) model(n, r[0], r[1], SWAP_SIZE.rocks(r[2])); else group.add(rockOf(K, r[0], heightAt(r[0], r[1]), r[1], r[2], i, AR.rockCap ? tone(AR.rockCap) : null)); });
  { const seen = {}; (AR.plants || []).forEach(p => { const f = PLANTS[p[0]]; if (!f) throw new Error('없는 풀 ' + p[0]); const k = seen[p[0]] = (seen[p[0]] || 0) + 1, n = sw('plants', k - 1, p[0]); if (n) return model(n, p[1], p[2], SWAP_SIZE.plants(p[3] || 1));
    const g = f(K, p[3] || 1); g.position.set(p[1], heightAt(p[1], p[2]), p[2]); g.rotation.y = p[1] * 1.7 + p[2]; group.add(g); }); }
  extraModels(K, group, AR, MS, { heightAt, inWater }).forEach(g => models.push(g));
  /* 그 곳의 나무 둘(생김새는 그 걸음의 것) + 글자 그릇 둘 — 그릇이 'fruit' 이고 구도가 나무 자리('tree')면 가지에 달고, 아니면 구도가 준 자리에 받침째 놓는다 */
  let treeA = null, treeB = null, carrierA = null, carrierB = null;
  if (opt.trees !== false) { const sl = opt.slots || {}, tl = sl.treeL || [-5, -3.2], tr = sl.treeR || [5, -3.2], ls = opt.letters || ['a', 'b'], T = AR.trees || { L: {}, R: {} }, CR = opt.carriers || { L: { kind: 'fruit', at: 'tree' }, R: { kind: 'fruit', at: 'tree' } };
    const onTree = c => c.kind === 'fruit' && (c.at === 'tree' || !c.at);
    const mk = (p, l, t, c) => letterTree(K, Object.assign({ kind: AR.kind, x: p[0], y: heightAt(p[0], p[1]), z: p[1], letter: onTree(c) ? l : null, lean: 1 }, t, { leaf: tone(t.leaf || 'a-leaf'), bark: t.bark ? tone(t.bark) : null, fruitTone: t.fruit || 'a-red', apples: t.apples }));
    treeA = mk(tl, ls[0], T.L, CR.L); treeB = mk(tr, ls[1], T.R, CR.R); group.add(treeA, treeB);
    const put = (c, l, t, tree) => { if (onTree(c)) return tree.userData.fruit; const g2 = carrier(K, c.kind, { letter: (opt.labels && opt.labels[l]) || l, tone: c.tone || t.fruit }), at = c.at, wet = inWater(at[0], at[1]), h = heightAt(at[0], at[1]);
      if (!wet) { const st = mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.42, 12), M(mix('a-wood', 'ink', 0.1), { roughness: 0.9 }), at[0], h + 0.21, at[1]); group.add(st); }      /* 받침 그루터기 */
      g2.position.set(at[0], h + (wet ? 0.34 : 0.98) + (c.y || 0), at[1]); g2.userData.y0 = g2.position.y; g2.userData.home = g2.position.clone(); group.add(g2); return g2; };
    carrierA = put(CR.L, ls[0], T.L, treeA); carrierB = put(CR.R, ls[1], T.R, treeB); }
  /* 하늘 — 색 띠 · 빛 · 안개 · 날씨 */
  K.sky(SK.stops);
  const lit = K.light(SK.light, Object.assign({ tune: SK.tune, shafts: SK.shafts, dustTone: SK.dustTone, dustSize: SK.dustSize, dust: [16, 4, 10] }, opt.light || {}));
  if (SK.fog) S.fog = new THREE.Fog(tone(SK.fog[0]), SK.fog[1], SK.fog[2]);
  const weather = {}; (SK.weather || []).forEach(n => { const f = WEATHER[n]; if (f === undefined) throw new Error('없는 날씨 ' + n); if (!f) return; weather[n] = f(K, c); });
  function step(dt, t){
    const tw = t * wind; windU.value = tw;
    bushes.forEach((b, i) => { b.rotation.z = Math.sin(tw * 0.7 + i * 1.7) * 0.012; });
    [treeA, treeB].forEach(tr => { if (tr && tr.userData.sway) tr.userData.sway(t, wind); });
    waterTex.offset.x = t * 0.018; waterTex.offset.y = Math.sin(t * 0.3) * 0.03;
    lilies.forEach((p, i) => { p.position.y = p.userData.y + Math.sin(t * 1.4 + i * 2) * 0.006; p.rotation.z += dt * 0.04 * (i % 2 ? 1 : -1); });
    reeds.forEach(r => { r.rotation.z = Math.sin(tw * 1.2 + r.userData.k) * 0.07; });
    rings.forEach(m => { const u = m.userData; if (u.t >= 1) { m.material.opacity = 0; return; } u.t = Math.min(1, u.t + dt / 1.9); m.scale.setScalar(0.12 + u.t * u.max); m.material.opacity = (1 - u.t) * 0.55; });
    steps.forEach(f => f(dt, t)); Object.values(weather).forEach(w => w.step(dt, t)); lit.step(dt, t);
  }
  return { group, GW, GD, bounds: { x0, x1, z0, z1 }, creek: land.creek || null, land, place, heightAt, bedAt: land.heightAt, inWater, waterY, freeAt, ripple, step, wind: windU, waterTex, lilies, reeds, rings, bushes, models, treeA, treeB, carrierA, carrierB, lit, weather, cam: LOOK.cam || {}, sky: SK };
}
