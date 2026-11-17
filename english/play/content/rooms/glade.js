/* ============================================================
 * 영어 놀이터 — 빈터 판형(rooms/glade) = 자리 약속만 (WA0 · 무대 설계 v1 §1 · §8)
 *   글자 숲 걸음들이 함께 지키는 것은 「어디가 어느 자리인가」뿐이다. 땅 · 바닥 · 뒤 · 하늘 · 나무는 걸음마다 다르고, 터 부품 상자(content/rooms/lands.js)가 짓는다.
 *   GLADE        받침의 테두리(자리 좌표의 테두리일 뿐 땅 모양이 아니다) · 앞 흙길(통나무 버스 길 · 글자 길이 놓일 자리)
 *   ROOM_SLOTS   자리 이름 → [x, z](뒤쪽이 -z). 상세판 GLADE 의 자리를 화면에서 서로 가리지 않게 조금 옮긴 것 — 모든 방이 이 표를 쓴다
 *   sideOf(x)    왼쪽 = 첫 글자 · 오른쪽 = 둘째 글자(좌우 구도일 때만 — 다른 구도는 AXES[구도].first)
 *   AXES · slotsFor(구도)   구도별 자리 표(WD0) — 자리 이름은 같고 좌표는 구도가 준다
 *   freeAtOf(o)  풀 · 꽃 · 흩뿌리는 것이 피해야 할 자리(받침 밖 · 둥근 귀퉁이 · 물 · 앞 흙길 · 물건 자리)를 아는 함수를 만든다
 * ============================================================ */
export const GLADE = {
  GW: 17, GD: 11.4, corner: 1.6,
  road: { z: 4.3, halfW: 4, halfD: 0.75, stones: 7 },   /* 앞 흙길 — 통나무 버스가 왼쪽 숲길에서 들어와 오른쪽으로 나간다 · 글자 길이 놓일 자리. 어느 땅에서든 평평하다(높이 0) */
  flatFrom: 2.9                                         /* 이 z 부터 앞쪽은 어느 땅에서든 높이 0(버스 · 정류장 · 팻말 · 글자 열매 줄이 서는 곳) */
};
export const ROOM_SLOTS = {
  La: [-6.9, -0.9], Lb: [-3.2, -1.7], Lc: [-5.7, 1.4], Ld: [-3.6, 1.1], Ra: [7.3, -2.3], Rb: [3.1, -1.9], Rc: [6.5, -0.4], Rd: [3.5, 0.9],
  center: [0.4, -3.4], skyR: [2.4, -2.6], skyL: [-2.4, -2.6], owner: [-0.5, -0.8], me: [-2.2, 2.3], guide: [1.9, 2.3], Re: [4.9, 3.5], sign: [7.25, 3.7], path: [0, 4.3]
};
export const sideOf = x => (x < 0 ? 'L' : 'R');

/* ── 구도(WD0 · 다름 설계 v1 §2 ⑧) — 첫째 것과 둘째 것이 화면에 놓이는 꼴. 자리 이름은 그대로, 좌표는 구도가 준다 ──
   구도 하나 = { slots(물건 여덟 자리 — La~Ld 는 첫째 것, Ra~Rd 는 둘째 것) · trees(그 곳의 나무 둘) · shelf(씨앗 선반 둘 [x, z, 돌림]) ·
                 carrier(글자 그릇 둘이 놓이는 자리 — 'tree' 면 나무 가지에) · first(x, z)(그 자리가 첫째 쪽인가) }
   사람 · 버스 · 팻말 · 하늘 자리는 어느 구도든 ROOM_SLOTS 그대로(앞 흙길은 늘 같은 곳). 물건끼리는 1.6 넘게 떨어진다.
   이번에 지은 다섯: lr 좌우 · ring 둥글게 · ud 위아래 · slope 비탈 · io 안팎. 구도를 더하는 법: 이 표에 이름 하나(다름 자료 AXES 의 열쇠 그대로). */
export const AXES = {
  lr:    { name: '좌우',   slots: {}, trees: { L: [-5, -3.2], R: [5, -3.2] }, shelf: { L: [-5, -1.4, 0.2], R: [5, -1.4, -0.2] }, carrier: { L: 'tree', R: 'tree' }, first: (x, z) => x < 0 },
  ring:  { name: '둥글게', slots: { La: [-5.5, -2.9], Lb: [-2.6, -4.0], Lc: [-6.3, -1.0], Ld: [-4.5, 0.4], Ra: [5.9, -2.9], Rb: [3.0, -4.0], Rc: [6.7, -1.0], Rd: [4.9, 0.4] },
           trees: { L: [-7.3, -4.6], R: [7.5, -4.6] }, shelf: { L: [-7.0, 1.9, 0.5], R: [7.1, 1.6, -0.5] }, carrier: { L: [-2.3, -1.6], R: [3.0, -1.5] }, first: (x, z) => x < 0.2 },      /* 가운데를 둘러 왼 반원 = 첫째 · 오른 반원 = 둘째 */
  ud:    { name: '위아래', slots: { La: [-6.6, -2.6], Lb: [-3.0, -2.3], Lc: [3.2, -2.3], Ld: [6.7, -2.6], Ra: [6.3, 0.8], Rb: [3.7, 1.2], Rc: [-6.3, 0.8], Rd: [-3.9, 1.2] },
           trees: { L: [-7.6, -4.5], R: [7.7, -4.5] }, shelf: { L: [-5.0, -1.0, 0.2], R: [5.1, -0.9, -0.2] }, carrier: { L: [-1.3, -2.5], R: [1.4, 0.6] }, first: (x, z) => z < -0.75 },      /* 위(뒤) 줄 = 첫째 · 아래(앞) 줄 = 둘째 */
  slope: { name: '비탈',   slots: { La: [-6.4, -2.7], Lb: [-3.3, -3.0], Lc: [-5.3, -0.6], Ld: [-2.8, -1.2], Ra: [6.7, -1.1], Rb: [3.6, -0.5], Rc: [6.3, 1.2], Rd: [3.7, 1.6] },
           trees: { L: [-7.7, -4.5], R: [7.6, -3.6] }, shelf: { L: [-6.9, 1.2, 0.4], R: [5.6, -2.9, -0.2] }, carrier: { L: [1.1, -1.9], R: [0.4, 1.0] }, first: (x, z) => x * 0.5 + z < -1.2 },      /* 비탈 위쪽 = 첫째 · 아래쪽 = 둘째 */
  io:    { name: '안팎',   slots: { La: [-3.0, -3.3], Lb: [3.5, -3.0], Lc: [-3.1, -0.8], Ld: [2.7, -0.6], Ra: [7.0, -1.9], Rb: [-6.9, -1.9], Rc: [6.5, 1.0], Rd: [-6.3, 1.1] },
           trees: { L: [-7.5, -4.5], R: [7.6, -4.5] }, shelf: { L: [-5.2, -3.7, 0.2], R: [5.2, -3.7, -0.2] }, carrier: { L: [-1.6, -2.3], R: [5.0, -0.6] }, first: (x, z) => Math.hypot((x - 0.4) / 4.6, (z + 1.9) / 2.3) < 1 },     /* 가운데 안쪽 = 첫째 · 바깥 둘레 = 둘째 */
  fb:    { name: '앞뒤',   slots: { La: [-6.2, -2.2], Lb: [-3.4, -4.4], Lc: [3.6, -4.3], Ld: [5.4, -2.4], Ra: [-6.0, 0.9], Rb: [-3.9, 1.0], Rc: [4.0, 0.9], Rd: [5.9, 1.6] },
           trees: { L: [-7.5, -4.5], R: [7.7, 0.4] }, shelf: { L: [-5.0, -0.7, 0.2], R: [5.4, -0.5, -0.2] }, carrier: { L: [-3.6, -2.2], R: [-0.2, 2.6] }, first: (x, z) => z < -1.0 }      /* 먼 쪽(뒤 — 하늘 가까이) = 첫째 · 가까운 쪽(앞) = 둘째. 둘째 나무는 옆 가운데까지 내려온다 */
};
export const hasAxis = a => !!AXES[a];
export const slotsFor = axis => { const A = AXES[axis]; if (!A) throw new Error('없는 구도 ' + axis); return Object.assign({}, ROOM_SLOTS, A.slots, { treeL: A.trees.L, treeR: A.trees.R }); };

/* o = { x0, x1, z0, z1(땅이 뻗은 테두리 — 없으면 GW · GD 로) , corner, waters:[{ x, z, rx, rz, pad? }], road, blocks:[[x, z, r]] } */
export function freeAtOf(o){
  const x0 = o.x0 != null ? o.x0 : -o.GW / 2, x1 = o.x1 != null ? o.x1 : o.GW / 2, z0 = o.z0 != null ? o.z0 : -o.GD / 2, z1 = o.z1 != null ? o.z1 : o.GD / 2;
  const c = o.corner == null ? GLADE.corner : o.corner, waters = o.waters || [], blocks = o.blocks || [], road = o.road, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  return function freeAt(x, z){
    const dx = Math.abs(x - mx), dz = Math.abs(z - mz); if (dx > hx - 0.45 || dz > hz - 0.45) return false;
    const cx = dx - (hx - c), cz = dz - (hz - c); if (cx > 0 && cz > 0 && cx * cx + cz * cz > (c - 0.4) * (c - 0.4)) return false;
    for (const w of waters) { const e = (x - w.x) / (w.rx + (w.pad || 0)), d = (z - w.z) / (w.rz + (w.pad || 0)); if (e * e + d * d < 1) return false; }
    if (road && Math.abs(x) < road.halfW && Math.abs(z - road.z) < road.halfD) return false;
    return !blocks.some(b => (x - b[0]) * (x - b[0]) + (z - b[1]) * (z - b[1]) < b[2] * b[2]);
  };
}
