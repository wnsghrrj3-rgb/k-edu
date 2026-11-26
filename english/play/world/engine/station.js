/* 공통 엔진 · 자리 — 한 화면 안에서 방이 변신한다(페이지를 바꾸지 않는다).
 * 자리를 고르면 빛과 벽 색이 다른 때로 넘어가고, 카메라가 다른 구도로 옮겨 가고, 지난 자리의 가구가 들어가며 새 가구가 나오고,
 * 물건들이 새 자리로 짧게 뛴다. 1.2초 안에 끝나고 그사이에도 손을 막지 않는다. 차례와 때는 자료(data 의 move.steps)를 따른다.
 * 자리 하나 = { id, place:{ 물건 이름:[x, z] }, enter(), leave(), step(dt), bg(dt)(다른 자리에 있을 때도 도는 일), onDown/onMove/onUp, load()(모형 늦게 받기) … } */
import * as THREE from 'three';
import { clamp } from './stage.js';
import { THING } from './things.js';

export const MOVE = { LOOK_AT: 0.10, LOOK: 1.0, CAM_AT: 0.15, CAM_K: 5, FURN_AT: 0.20, HOP_AT: 0.30, HOP: 0.4, HOP_GAP: 0.08, END: 1.2 };   // 자료 move.steps 의 때
const ease = t => t * t * (3 - 2 * t);

/** o = { stage, wall(벽 — 색이 바뀐다), stations:{ id: 자리 }, looks:{ id:{ wall, sky:[3], sun, hemi } }, cams:{ id:{ AIM, TILT, HALF_W } }, first,
 *        (자리 객체에 look 이 있으면 그것이 looks 보다 먼저다 — 제 장소를 지닌 자리)
 *        things:[물건…](x · z · home · vy · y 를 지닌 것), walk(x, z)(캐릭터를 걷게 한다), tray(단추를 넣을 요소), pictures:{ id: svg 글 }, sfx, onGo(id, 지난 id) } */
export function createStations(o) {
  const { stage, stations } = o, ids = Object.keys(stations), col = () => ({ wall: new THREE.Color(), sky: [new THREE.Color(), new THREE.Color(), new THREE.Color()], sun: new THREE.Color(), hemi: 1 });
  const setLook = (L, d) => { L.wall.set(d.wall); d.sky.forEach((c, i) => L.sky[i].set(c)); L.sun.set(d.sun); L.hemi = d.hemi; return L; };
  const cur = setLook(col(), o.looks[o.first]), from = col(), to = col(), base = { hemi: o.looks[o.first].hemi, sun: stage.sun.intensity, env: stage.scene.environmentIntensity }, S = { now: o.first, M: null, loading: null, moves: 0 }, btn = {};
  function apply() { o.wall.material.color.copy(cur.wall); stage.sun.color.copy(cur.sun); stage.hemi.intensity = cur.hemi; const dim = cur.hemi / base.hemi; stage.sun.intensity = base.sun * dim ** 1.6; stage.scene.environmentIntensity = base.env * dim ** 1.6;   /* 어둑한 때(저녁)에는 해와 둘레 빛도 같이 줄인다 */ stage.setSky(cur.sky.map(c => '#' + c.getHexString())); }
  function mark() { for (const id of ids) if (btn[id]) { btn[id].classList.toggle('now', id === S.now); btn[id].classList.toggle('loading', id === S.loading); } }
  /** 그 자리로 옮긴다. 모형을 아직 안 받은 자리면 받는 동안 그림이 깜박이고, 다 받으면 옮긴다(그동안 지금 자리에서 계속 논다). */
  function go(id) {
    const st = stations[id]; if (!st || id === S.now || S.loading) return false;
    if (st.load && !st.loaded) { S.loading = id; mark(); Promise.resolve(st.load()).catch(e => console.error(e)).then(() => { st.loaded = true; S.loading = null; go(id); }); return true; }
    const was = S.now; if (stations[was].leave) stations[was].leave(id);
    setLook(from, { wall: cur.wall, sky: cur.sky, sun: cur.sun, hemi: cur.hemi }); setLook(to, st.look || o.looks[id]);
    S.now = id; S.M = { t: 0, was, cam: false, furn: false, hops: null }; S.moves++; mark(); if (o.sfx) o.sfx.whoosh(); if (o.onGo) o.onGo(id, was);
    return true;
  }
  /** 매 장면. */
  function tick(dt) {
    const M = S.M; if (!M) return; M.t += dt; const st = stations[S.now];
    const k = ease(clamp((M.t - MOVE.LOOK_AT) / MOVE.LOOK, 0, 1)); cur.wall.lerpColors(from.wall, to.wall, k); cur.sun.lerpColors(from.sun, to.sun, k); cur.sky.forEach((c, i) => c.lerpColors(from.sky[i], to.sky[i], k)); cur.hemi = from.hemi + (to.hemi - from.hemi) * k; apply();
    if (!M.cam && M.t >= MOVE.CAM_AT) { M.cam = true; stage.view(o.cams[S.now], MOVE.CAM_K); }
    if (!M.furn && M.t >= MOVE.FURN_AT) { M.furn = true; if (o.onFurn) o.onFurn(S.now, M.was); if (st.enter) st.enter(M.was); }   /* onFurn = 장소(배경)를 갈아 끼우는 때 */
    if (!M.hops && M.t >= MOVE.HOP_AT) {                                           // 물건들이 새 자리로 짧게 뛴다(조금씩 어긋나게). 캐릭터는 걸어간다
      const P = st.place || {}; M.hops = []; let i = 0;
      for (const t of o.things) { const p = P[t.name]; if (!p) continue; t.home.x = p[0]; t.home.z = p[1]; if (Math.hypot(t.x - p[0], t.z - p[1]) < 0.06) continue; M.hops.push({ t, x0: t.x, z0: t.z, x: p[0], z: p[1], at: M.t + MOVE.HOP_GAP * i++, on: false }); }
      if (P.gogo && o.walk) o.walk(P.gogo[0], P.gogo[1]);
    }
    if (M.hops) for (const h of M.hops) {
      const u = (M.t - h.at) / MOVE.HOP; if (u < 0) continue; const t = h.t;
      if (!h.on) { h.on = true; if (t.state === 'home' || t.state === 'up' || t.state === 'down') { t.vy = THING.GRAVITY * MOVE.HOP / 2; t.y = Math.max(t.y, 0.001); } h.x0 = t.x; h.z0 = t.z; }
      if (u <= 1 || !h.end) { const e = ease(clamp(u, 0, 1)); if (!(t.ball && t.state !== 'home')) t.x = h.x0 + (h.x - h.x0) * e; t.z = h.z0 + (h.z - h.z0) * e; if (t.ball) t.vx = 0; if (u >= 1) h.end = true; }
    }
    if (M.t >= MOVE.END && (!M.hops || M.hops.every(h => h.end))) S.M = null;
  }
  // 도구 그림 넷(글 없음). 누르면 0.1초 눌렸다가 옮긴다.
  if (o.tray) for (const id of ids) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.station = id; b.setAttribute('aria-label', stations[id].title || id); b.innerHTML = o.pictures[id] || '';
    b.addEventListener('click', () => { b.classList.add('press'); setTimeout(() => b.classList.remove('press'), 100); go(id); }); o.tray.appendChild(b); btn[id] = b;
  }
  mark();
  return { go, tick, get now() { return S.now; }, get cur() { return stations[S.now]; }, get moving() { return !!S.M; }, get loading() { return S.loading; }, get moves() { return S.moves; },
    look: () => ({ wall: '#' + cur.wall.getHexString(), sky: cur.sky.map(c => '#' + c.getHexString()), hemi: +cur.hemi.toFixed(2) }) };
}
