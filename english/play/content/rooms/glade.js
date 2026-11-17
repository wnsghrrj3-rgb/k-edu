/* ============================================================
 * 영어 놀이터 — 빈터 판형(rooms/glade) = 자리 약속만 (WA0 · 무대 설계 v1 §1 · §8)
 *   글자 숲 걸음들이 함께 지키는 것은 「어디가 어느 자리인가」뿐이다. 땅 · 바닥 · 뒤 · 하늘 · 나무는 걸음마다 다르고, 터 부품 상자(content/rooms/lands.js)가 짓는다.
 *   GLADE        받침의 테두리(자리 좌표의 테두리일 뿐 땅 모양이 아니다) · 앞 흙길(통나무 버스 길 · 글자 길이 놓일 자리)
 *   ROOM_SLOTS   자리 이름 → [x, z](뒤쪽이 -z). 상세판 GLADE 의 자리를 화면에서 서로 가리지 않게 조금 옮긴 것 — 모든 방이 이 표를 쓴다
 *   sideOf(x)    왼쪽 = 첫 글자 · 오른쪽 = 둘째 글자
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
