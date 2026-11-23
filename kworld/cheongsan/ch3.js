/* 장 3 · 둘째 날 새벽 「천수평 — 소리 없이 에워싸기」 (1920년 10월 22일 새벽) — 설계 v2 ④ 장 3 (차례 3)
   차례: 갑산촌에서 주민에게 듣기(할머니 · 나무꾼 · 겁먹은 집) → (밥 얻기) → 기병 야영지를 한 바퀴 돌며 빠지는 길 넷·보초 넷 살피기
        → 조 넷을 길 넷에 세우기(바람 위쪽 = 서쪽으로 가까이 가면 말이 냄새 맡고 운다) → 신호 → 싸움(30초) → 흔적 지우기(갑산촌).
   안 막은 길 하나에 놓친 기병 +1(0~3) → 어랑촌이 40초씩 일찍 시작. 얻는 것: 탄약 +30 · 쌀(배고픔 −25) · 말. 날이 새기까지 6분(나무꾼을 찾으면 1분 번다).
   들킴 100 = 기병이 먼저 올라타 흩어진다(놓친 기병 3, 얻는 것 반). 가만히 = 날이 새서 기병이 먼저 떠나며 우리를 본다.
   실제: 갑산촌 주민에게서 근처 천수평에 기병대가 묵고 있다는 말을 듣고 새벽에 가서 쳤다. 바람·조 세우기·흔적 지우기는 놀이 장치. */
import { dressCamp, dressVillage } from './dress.js';
import { clamp, dist, lerp, ART } from '../scene/kit.js';
import { GAPSAN, CAMP3 } from './map.js';

const C3 = CAMP3, WIND = [1, 0];   /* 바람: 서쪽에서 동쪽으로 분다 → 바람 위쪽 = 서쪽 */
const ROADS = [
  { id: 'E', name: '동쪽 큰길', post: [488, 182], block: [474, 180] },
  { id: 'N', name: '북쪽 개울 건너', post: [432, 133], block: [436, 145] },
  { id: 'S', name: '남쪽 숲길', post: [448, 227], block: [446, 213] },
  { id: 'W', name: '서쪽 마을 쪽', post: [394, 181], block: [405, 180] }];
const SENT = [[453, 170], [427, 171], [431, 190], [455, 189]];
const DOOR = (i) => { const [x, z, ry] = GAPSAN[i]; return [x + Math.sin(ry) * 3.2, z + Math.cos(ry) * 3.2]; };
const HOUSES = { gran: 0, wood: 3, scared: 5 }, SWEEP = [[338, 188], [349, 193], [361, 191]], START = [322, 185];
export const K3 = { C3, ROADS, SENT, DOOR, HOUSES, SWEEP, START };

export default function ch3(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, fx, SFX, H } = c;
  const st = { ph: 'village', t: 0, len: 360, asked: {}, info: 0, wood: false, ate: false, scaredKnock: 0, found: {}, sentSeen: {}, teams: {}, teamUnits: {}, smellT: 0, sig: null, missed: 0, broken: false, idle: false, swept: {}, told: false, fightT: 0, horses: [], sentries: [], riders: [], camp: [], gains: null, endT: 0 };
  const P = {};
  const ch = {
    id: 3, sameDay: true, title: '소리 없이 에워싸기', when: '1920년 10월 22일 새벽', place: '천수평', len: 360, region: [318, 128, 492, 232], zones: ['gapsan', 'cheonsu', 'wanru'], yaw: -Math.PI / 2,
    goal: '날이 새기 전에 — 기병 야영지의 길 넷을 막고 신호', idle: '날이 샌다', K: K3,
    get st() { return st; },
    start() {
      S.px = START[0]; S.pz = START[1]; S.pdir2 = Math.PI / 2;
      /* 밤: 푸르고 어둡다 */
      c.scene.fog.color.set(0x2a3448); c.scene.fog.near = 40; c.scene.fog.far = 240; c.hemi.intensity = 0.62; c.hemi.color.set(0x9ab0d8); c.sun.color.set(0xb8c8f0); c.sun.intensity = 0.7; c.sky.paint(0x1a2238, 0x3a4660, 0x8090c0, [0.4, 0.3, -0.5], 0.3); ch.sunOff = [40, 70, -40];
      /* 기병 야영지: 천막 여덟 · 모닥불 · 말 열넷 · 보초 넷 */
      for (let i = 0; i < 8; i++) { const x = C3[0] - 9 + (i % 4) * 6, z = C3[1] + (i < 4 ? -2 : 6); c.putArt('cs_tent_jp', x, z, 0); }
      c.putArt('cs_fire', C3[0] + 1, C3[1] + 2); st.glow = c.fx; dressCamp(c.putArt, C3[0], C3[1] + 2, { r: 12, seed: 6, jp: true, n: 5 }); c.putArt('cs_hitch', C3[0] - 7, C3[1] - 10.4, 0); c.putArt('cs_hitch', C3[0] + 5, C3[1] - 10.4, 0);
      for (let i = 0; i < 14; i++) { const x = C3[0] - 13 + i * 2, z = C3[1] - 9 + Math.sin(i) * 0.5; const m = c.putArt('cs_horse', x, z, Math.PI / 2 + (i % 2 ? 0.15 : -0.1), 0.92); if (m) st.horses.push({ m, x, z, ph: i }); }
      for (const [x, z] of SENT) st.sentries.push({ u: army.jp.add({ x, z, ry: Math.atan2(x - C3[0], z - C3[1]) }), x, z, a0: Math.atan2(x - C3[0], z - C3[1]), ph: Math.random() * 6 });
      /* 개울: 들 가운데를 남북으로 */
      { const g = new c.THREE.PlaneGeometry(3.4, 96, 1, 24); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = C3[1] + p.getZ(i), x = 446 + Math.sin(z * 0.08) * 3 + p.getX(i); p.setX(i, x); p.setZ(i, z); p.setY(i, H(x, z) + 0.12); } const m = new c.THREE.Mesh(g, new c.THREE.MeshStandardMaterial({ color: 0x4a6a8a, roughness: 0.2, metalness: 0.1 })); c.scene.add(m); st.creek = m; }
      /* 갑산촌 사람들 */
      const d0 = DOOR(HOUSES.gran), d1 = DOOR(HOUSES.wood);
      P.gran = ppl.cast('vil2', d0[0], d0[1] + 0.6, 0); P.wood = ppl.cast('wood', d1[0] + 0.8, d1[1] + 0.6, 0); P.gran.look = P.wood.look = 'me'; P.gran.m.visible = P.wood.m.visible = false;
      P.lee = ppl.cast('lee', START[0] - 3, START[1] + 2, Math.PI / 2); P.mak = ppl.cast('mak', START[0] - 5, START[1] - 1.5, Math.PI / 2); P.sot = ppl.cast('sot', START[0] - 6, START[1] + 3.4, Math.PI / 2);
      /* 조 넷(엎드려 기다림) */
      ROADS.forEach((r, ri) => { st.teamUnits[r.id] = []; for (let i = 0; i < 6; i++) { const x = START[0] - 8 - ri * 2.4, z = START[1] - 6 + i * 2.2; st.teamUnits[r.id].push({ u: army.iaK[(i + ri) % 3].add({ x, z, ry: Math.PI / 2 }), x, z, tx: x, tz: z, i }); } });
      /* 고리 */
      for (const k of ['gran', 'wood', 'scared']) { const d = DOOR(HOUSES[k]); pad('door_' + k, d[0], d[1] + 1.2, 0xffcf4d, 1.7); }
      pad('eat', d0[0] + 2.4, d0[1] + 1.6, 0x8ad08a, 1.6);
      for (const r of ROADS) pad('blk_' + r.id, r.block[0], r.block[1], 0x7ab8f0, 2.2);
      SWEEP.forEach((p, i) => pad('sw' + i, p[0], p[1], 0xd8c8a0, 1.7)); pad('tell', d0[0] - 1.6, d0[1] + 2, 0x8ad08a, 1.6);
      /* 살피기 목표: 길 넷 · 보초 넷 */
      for (const r of ROADS) c.addTarget({ id: 'road_' + r.id, x: r.post[0], y: H(r.post[0], r.post[1]) + 1.2, z: r.post[1], range: 120, need: 0.6, labelY: 2.4, ok: (eye) => c.losClear(eye.x, eye.y, eye.z, r.post[0], H(r.post[0], r.post[1]) + 1.5, r.post[1], 3),
        label: () => (st.found[r.id] ? `빠지는 길 — ${r.name}` : '길?'), line: () => `🛤 ${r.name}`, onSeen: () => { st.found[r.id] = 1; say(`빠지는 길: ${r.name}`, null, 2); } });
      SENT.forEach((p, i) => c.addTarget({ id: 'sent' + i, x: p[0], y: H(p[0], p[1]) + 1.6, z: p[1], range: 90, need: 0.6, labelY: 1.6, ok: (eye) => c.losClear(eye.x, eye.y, eye.z, p[0], H(p[0], p[1]) + 1.6, p[1], 3), label: () => (st.sentSeen[i] ? '보초' : '?'), line: () => '👁 보초 — 붉은 고리 안은 보인다', onSeen: () => { st.sentSeen[i] = 1; ch.sentRing(i); } }));
      for (const r of ROADS) c.putArt('cs_marker_rock', r.post[0], r.post[1], 0, 0.8);
      setTimeout(() => cmd('김좌진 사령관', '갑산촌에서 소식을 들어 보아라.', 3.8), 1600);
    },
    sentRing(i) { if (st['ring' + i]) return; const p = SENT[i]; st['ring' + i] = c.groundRing(c.scene, p[0], p[1], 19.4, 20, 0xe0402a, 0.55, 48); },
    timeK() { return clamp(1 - st.t / ch.len, 0, 1); },
    update(dt) {
      st.t += dt; const tm = document.getElementById('time').firstChild, lab = st.sig ? '10월 22일 · 동이 텄다 ' : '10월 22일 새벽 · 날이 새기까지 '; if (tm.textContent !== lab) tm.textContent = lab;
      const k = clamp(st.t / ch.len, 0, 1);
      if (Math.floor(st.t) !== Math.floor(st.t - dt) && Math.floor(st.t) % 6 === 0) { const d = st.sig ? 1 : clamp((k - 0.7) / 0.3, 0, 1); c.hemi.intensity = lerp(0.62, 1.05, d); c.sun.intensity = lerp(0.7, 1.6, d); c.sun.color.set(d > 0.5 ? 0xffd8b0 : 0xb8c8f0); c.scene.fog.color.setRGB(lerp(0.16, 0.85, d), lerp(0.2, 0.8, d), lerp(0.28, 0.75, d)); c.sky.paint(d > 0.5 ? 0x7a90c0 : 0x1a2238, d > 0.5 ? 0xf0b890 : 0x3a4660, 0xffa070, [0.9, 0.05 + d * 0.1, 0.2], 0.4 + d * 0.8); }
      /* 보초는 천천히 둘러본다 · 말은 고개를 숙였다 든다 */
      for (const s of st.sentries) { if (!s.u.on) continue; s.u.ry = s.a0 + Math.sin(S.t * 0.4 + s.ph) * 0.9; }
      for (const h of st.horses) if (h.m.visible) h.m.rotation.x = Math.max(0, Math.sin(S.t * 0.6 + h.ph)) * 0.05;
      if (st.ph === 'village' || st.ph === 'round') ch.sneak(dt, k);
      if (st.ph === 'fight') ch.fight(dt);
      if (st.ph === 'after') ch.after(dt);
      /* 고리 보이기 */
      const pv = st.ph === 'village' || st.ph === 'round';
      for (const kk of ['gran', 'wood', 'scared']) pads['door_' + kk].m.visible = pv && !st.asked[kk] && !(kk === 'scared' && st.scaredKnock >= 2);
      pads.eat.m.visible = pv && st.asked.gran && !st.ate;
      for (const r of ROADS) pads['blk_' + r.id].m.visible = pv && st.found[r.id] && !st.teams[r.id];
      SWEEP.forEach((p, i) => (pads['sw' + i].m.visible = st.ph === 'after' && !st.swept[i])); pads.tell.m.visible = st.ph === 'after' && !st.told;
      /* 조가 길목으로 기어간다 */
      for (const id in st.teamUnits) for (const p of st.teamUnits[id]) { const d = dist(p.x, p.z, p.tx, p.tz); if (d > 0.5) { const v = 3.4 * dt; p.x += (p.tx - p.x) / d * Math.min(d, v); p.z += (p.tz - p.z) / d * Math.min(d, v); p.u.ry = Math.atan2(p.tx - p.x, p.tz - p.z); p.u.bob = Math.abs(Math.sin(S.t * 8 + p.i)) * 0.05; } else p.u.bob = 0; p.u.x = p.x; p.u.z = p.z; }
    },
    /* ───── 숨어 돌기: 보초 눈 · 말 코 ───── */
    sneak(dt, k) { const py = H(S.px, S.pz), dc = dist(S.px, S.pz, C3[0], C3[1]);
      if (dc < 75 && st.ph === 'village') { st.ph = 'round'; S.detOn = true; say('야영지가 보인다 — 보초 눈(붉은 고리) 밖으로, 바람 위쪽(서쪽)은 피해 돌자', null, 4); }
      if (st.ph === 'round') { let seen = false, best = 1e9; const R = k > 0.85 ? 28 : 20, ty = py + (S.crouch ? 0.35 : 1.5);
        for (const s of st.sentries) { const d = dist(S.px, S.pz, s.x, s.z); if (d < R && d < best && c.losClear(s.x, H(s.x, s.z) + 1.6, s.z, S.px, ty, S.pz, 3)) { best = d; seen = true; } }
        if (seen) S.det += c.exposure() * 34 * (1 - best / R) * dt; else S.det = Math.max(0, S.det - 4 * dt);
        /* 바람 위쪽에서 말 곁 28 m 안 → 냄새 */
        st.smellT -= dt; const hx = C3[0], hz = C3[1] - 9, up = (hx - S.px) * WIND[0] + (hz - S.pz) * WIND[1];
        if (dist(S.px, S.pz, hx, hz) < 28 && up > 6 && st.smellT <= 0) { st.smellT = 9; S.det += 30; SFX.bad(); ch.neigh(); say('바람 위쪽이다 — 말들이 냄새를 맡고 운다! 바람 아래로 돌자', null, 3.4); }
        S.det = clamp(S.det, 0, 100); S.tension = clamp(0.2 + S.det / 120, 0, 1);
        if (S.det >= 100) return ch.spring(true); }
      if (st.t >= ch.len && !st.sig) ch.dawnLeave(); },
    neigh() { SFX.bad(); SFX.drum(0.3); },
    signal() { if (st.ph !== 'round' && st.ph !== 'village') return false; const at = ROADS.find((r) => st.teams[r.id] && dist(S.px, S.pz, r.block[0], r.block[1]) < 4); if (!at) { if (Object.keys(st.teams).length) say('조를 세운 길목(파란 고리 자리)에서 신호를 올린다', null, 2.4); return Object.keys(st.teams).length > 0; } ch.spring(false); return true; },
    spring(broken) { st.sig = { t: st.t, broken }; st.ph = 'fight'; st.fightT = 0; S.detOn = false; st.broken = broken; const open = ROADS.filter((r) => !st.teams[r.id]);
      st.missed = broken ? 3 : Math.min(3, open.length); SFX.bugle(); setTimeout(() => SFX.volley(1), 300);
      say(broken ? '들켰다! 기병들이 먼저 말에 올라 흩어진다' : open.length ? `동이 튼다 — 신호! 안 막은 길(${open.map((r) => r.name).join('·')})로 기병이 빠져나간다` : '동이 튼다 — 신호! 길 넷이 다 막혔다', null, 4.2);
      /* 말 탄 기병: 열린 길로 달아남, 막힌 길은 쓰러짐 */
      ROADS.forEach((r, ri) => { const n = broken ? 3 : 3; for (let i = 0; i < n; i++) { const blocked = !broken && st.teams[r.id]; st.riders.push({ u: army.off.add({ x: C3[0] + (Math.random() - 0.5) * 6, z: C3[1] - 9 + (Math.random() - 0.5) * 4 }), r, blocked, t: -i * 0.8 - Math.random(), fall: blocked ? 2 + Math.random() * 6 : 99 }); } });
      for (const h of st.horses) h.m.visible = false; for (let i = 0; i < 4; i++) if (st['ring' + i]) st['ring' + i].visible = false;
      for (const s of st.sentries) s.fall = 1 + Math.random() * 4;
      for (let i = 0; i < 18; i++) st.camp.push({ u: army.jp.add({ x: C3[0] - 9 + Math.random() * 18, z: C3[1] - 2 + Math.random() * 8 }), t: 0, fall: 2 + Math.random() * 16 });
      cmd('이범석 연성대장', broken ? '쏴라! 놓치지 마라!' : '쳐라!', 3); },
    fight(dt) { st.fightT += dt; const t = st.fightT;
      for (const q of st.riders) { const u = q.u; q.t += dt; if (q.t < 0) { u.on = false; continue; } const from = [C3[0], C3[1] - 9], to = q.r.post, far = [to[0] + (to[0] - C3[0]) * 1.8, to[1] + (to[1] - C3[1]) * 1.8]; const L = dist(from[0], from[1], far[0], far[1]), s = Math.min(L, q.t * 9), f = s / L;
        if (q.blocked && q.t > q.fall) { q.ft = (q.ft || 0) + dt; u.pitch = -clamp(q.ft / 0.5, 0, 1) * 1.2; u.s = 1 - clamp((q.ft - 0.5) / 0.6, 0, 1); if (q.ft > 1.1) u.on = false; continue; }
        if (q.blocked && s > dist(from[0], from[1], q.r.block[0], q.r.block[1]) - 6) { q.t = q.fall; }
        u.on = f < 1; u.x = lerp(from[0], far[0], f); u.z = lerp(from[1], far[1], f); u.ry = Math.atan2(far[0] - from[0], far[1] - from[1]); u.bob = Math.abs(Math.sin(S.t * 14 + q.t)) * 0.18; }
      for (const s of st.sentries) if (s.fall != null) { s.ft = (s.ft || 0) + (t > s.fall ? dt : 0); s.u.pitch = -clamp(s.ft / 0.45, 0, 1) * 1.3; s.u.s = 1 - clamp((s.ft - 0.45) / 0.5, 0, 1); if (s.ft > 1) s.u.on = false; }
      for (const q of st.camp) { q.ft = (q.ft || 0) + (t > q.fall ? dt : 0); q.u.pitch = -clamp(q.ft / 0.45, 0, 1) * 1.3; q.u.s = 1 - clamp((q.ft - 0.45) / 0.5, 0, 1); if (q.ft > 1) q.u.on = false; }
      if (Math.random() < dt * 8 && t < 24) { const ids = Object.keys(st.teams); const id = ids[Math.floor(Math.random() * ids.length)]; if (id) { const p = st.teamUnits[id][Math.floor(Math.random() * 6)]; fx.flash(p.x + Math.sin(p.u.ry) * 1.2, H(p.x, p.z) + 0.7, p.z + Math.cos(p.u.ry) * 1.2, 1.2); if (Math.random() < 0.4) SFX.shot(0.5); } }
      if (t > 30) ch.gain(); },
    gain() { st.ph = 'after'; st.endT = 0; const half = st.broken; band('ammo', half ? 15 : 30, '천수평에서 얻은 탄약'); band('hunger', half ? -12 : -25, '천수평에서 얻은 쌀'); if (!half && st.missed <= 2) { S.tags.horse = 1; say('탄약·쌀·말을 얻었다! 이제 갑산촌으로 돌아가 흔적을 지우자', null, 4); } else say('탄약과 쌀을 조금 얻었다 — 갑산촌으로 돌아가 흔적을 지우자', null, 4);
      S.tags.missed = st.missed; st.gains = { half }; c.sun.intensity = 1.6; c.hemi.intensity = 1.05; },
    dawnLeave() { st.idle = true; st.missed = 3; S.tags.missed = 3; st.sig = { t: st.t, idle: true }; st.ph = 'after'; S.detOn = false; band('net', 6, '기병이 우리를 보고 갔다'); band('troop', -4, '떠나는 기병과 맞닥뜨렸다'); say('날이 샜다 — 기병들이 먼저 말에 올라 떠나며 우리를 보았다!', null, 4.4); SFX.bad();
      ROADS.forEach((r) => { for (let i = 0; i < 3; i++) st.riders.push({ u: army.off.add({ x: C3[0], z: C3[1] - 9 }), r, blocked: false, t: -i * 0.7, fall: 99 }); }); for (const h of st.horses) h.m.visible = false; for (const s of st.sentries) s.u.on = false; for (let i = 0; i < 4; i++) if (st['ring' + i]) st['ring' + i].visible = false; st.fightT = 0; st.leaving = true; },
    after(dt) { st.endT += dt; if (st.leaving) { st.fightT += dt; for (const q of st.riders) { const u = q.u; q.t += dt; if (q.t < 0) { u.on = false; continue; } const from = [C3[0], C3[1] - 9], to = q.r.post, far = [to[0] + (to[0] - C3[0]) * 1.8, to[1] + (to[1] - C3[1]) * 1.8], L = dist(from[0], from[1], far[0], far[1]), f = Math.min(1, q.t * 9 / L); u.on = f < 1; u.x = lerp(from[0], far[0], f); u.z = lerp(from[1], far[1], f); u.ry = Math.atan2(far[0] - from[0], far[1] - from[1]); } }
      if ((Object.keys(st.swept).length >= 3 && st.told) || st.endT > 140) ch.finish(); },
    job() { const at = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      if (at('door_gran')) return { key: 'gran', need: 1.4, label: '할머니께 여쭙기', fn: () => { st.asked.gran = 1; st.info = Math.max(st.info, 1); P.gran.m.visible = true; ppl.talk(P.gran, '새벽에 말 우는 소리가 동쪽 들에서 났다오.', 4.4); S.tags.seen_cav = 1; } };
      if (at('door_wood')) return { key: 'wood', need: 1.4, label: '나무꾼에게 묻기', fn: () => { st.asked.wood = 1; st.wood = true; st.info = 2; ch.len += 60; P.wood.m.visible = true; ppl.talk(P.wood, '천수평 개울가요. 천막 여덟, 말 서른쯤, 보초는 넷이오. 바람이 서쪽에서 부니 말 근처 서쪽은 피하시오.', 6); S.tags.seen_cav = 1; SENT.forEach((_, i) => { st.sentSeen[i] = 1; ch.sentRing(i); }); say('나무꾼 덕에 야영지와 보초 자리를 알았다(날이 새기까지 1분 더)', null, 4); SFX.good(); } };
      if (at('door_scared')) return { key: 'scared' + st.scaredKnock, need: 1.0, label: '문 두드리기', fn: () => { st.scaredKnock++; if (st.scaredKnock === 1) say('…안에서 숨죽이는 소리. 문이 열리지 않는다', null, 3); else { st.asked.scared = 1; say('「제발 그냥 가시오!」 — 더 겁을 먹었다. 그냥 두자', null, 3.4); SFX.bad(); } } };
      if (at('eat')) return { key: 'eat', need: 1.6, label: '밥 얻기', fn: () => { st.ate = true; band('hunger', -40, '갑산촌에서 얻은 밥'); ppl.talk(P.gran, '식은 밥이지만 드시오. 몸조심하오.', 3.6); SFX.good(); } };
      for (const r of ROADS) if (at('blk_' + r.id)) return { key: 'blk' + r.id, need: 1.2, label: `조를 ${r.name}에 세우기`, fn: () => { st.teams[r.id] = 1; const face = Math.atan2(C3[0] - r.block[0], C3[1] - r.block[1]); st.teamUnits[r.id].forEach((p, i) => { const lx = Math.cos(face), lz = -Math.sin(face); p.tx = r.block[0] + lx * (i - 2.5) * 2.2; p.tz = r.block[1] + lz * (i - 2.5) * 2.2; }); SFX.page(); say(`${r.name}에 조를 세웠다 (${Object.keys(st.teams).length}/4)`, null, 2.4); } };
      for (let i = 0; i < 3; i++) if (at('sw' + i)) return { key: 'sw' + i, need: 1.4, label: '발자국·불 자리 쓸기', fn: () => { st.swept[i] = 1; SFX.page(); } };
      if (at('tell')) return { key: 'tell', need: 1.4, label: '「산으로 피해 있으시오」', fn: () => { st.told = true; P.gran.m.visible = true; ppl.talk(P.gran, '알았소. 아이들 데리고 산으로 가겠소.', 3.4); SFX.good(); } };
      return null; },
    tasks() { const L = [], ph = st.ph, pv = ph === 'village' || ph === 'round', nf = Object.keys(st.found).length + Object.keys(st.sentSeen).length, nt = Object.keys(st.teams).length;
      const nearDoor = () => { let b = null, bd = 1e9; for (const kk of ['wood', 'gran', 'scared']) { if (st.asked[kk] || (kk === 'scared')) continue; const d = DOOR(HOUSES[kk]); const dd = dist(S.px, S.pz, d[0], d[1]); if (dd < bd) { bd = dd; b = kk; } } return b; };
      const nextBlock = () => { let b = null, bd = 1e9; for (const r of ROADS) if (st.found[r.id] && !st.teams[r.id]) { const d = dist(S.px, S.pz, r.block[0], r.block[1]); if (d < bd) { bd = d; b = r; } } return b; };
      L.push({ id: 'listen', req: true, t: '갑산촌 사람에게 소식 듣기', how: '문 연 집 노란 고리 — 다 아는 건 아니다(나무꾼은 자세히 안다)', done: () => st.info > 0, at: () => { const kk = nearDoor(); if (!kk) return null; const d = DOOR(HOUSES[kk]); return [d[0], d[1] + 1.2]; }, tag: '🏠 문 두드리기', wait: !pv });
      L.push({ id: 'look', req: true, t: '야영지를 돌며 빠지는 길 넷·보초 넷 살피기', n: () => [nf, 8], how: '<kbd>Space</kbd> 꾹 — 길 끝 표지 바위와 보초를 망원경 가운데에 · 바람 위쪽(서쪽 가까이)은 말이 냄새 맡는다', done: () => nf >= 8 || !!st.sig, can: () => pv && st.info > 0, at: () => { const r = ROADS.find((q) => !st.found[q.id]); return r ? [lerp(r.post[0], C3[0], -0.15), lerp(r.post[1], C3[1], -0.15)] : null; }, tag: '🔭 살피기' });
      L.push({ id: 'teams', req: true, t: '조 넷을 길 넷에 세우기', n: () => [nt, 4], how: '찾은 길목 파란 고리에 서면 조가 그리로 기어간다 · 시간이 모자라면 셋만 세우고 신호해도 된다', done: () => nt >= 4 || !!st.sig, can: () => pv && !!nextBlock(), at: () => { const r = nextBlock(); return r ? r.block : null; }, tag: '🛡 조 세우기' });
      L.push({ id: 'sig', req: true, t: '신호 — 깃발(F)', how: '조를 세운 길목 고리에서 <kbd>F</kbd> · 안 막은 길로 기병이 빠져나가 어랑촌 본대에 알린다', done: () => !!st.sig, can: () => pv && nt > 0, at: () => { const r = ROADS.filter((q) => st.teams[q.id]).sort((a, b) => dist(S.px, S.pz, a.block[0], a.block[1]) - dist(S.px, S.pz, b.block[0], b.block[1]))[0]; return r ? r.block : null; }, tag: '🚩 F — 신호' });
      L.push({ id: 'fight', req: true, t: '싸움 — 길목의 조가 친다', how: '기다리자 — 막은 길로 나오는 기병은 쓰러지면서 사라진다', done: () => st.ph === 'after', at: () => null, wait: true });
      L.push({ id: 'sweep', req: true, t: '갑산촌으로 돌아가 흔적 지우기', n: () => [Object.keys(st.swept).length + (st.told ? 1 : 0), 4], how: '발자국·불 자리 고리 셋을 쓸고, 할머니께 「산으로 피해 있으시오」 — 안 하면 마을이 뒤에 화를 입을 수 있다', done: () => Object.keys(st.swept).length >= 3 && st.told, can: () => ph === 'after', at: () => { for (let i = 0; i < 3; i++) if (!st.swept[i]) return SWEEP[i]; return st.told ? null : [pads.tell.x, pads.tell.z]; }, tag: '🧹 흔적 지우기', wait: ph !== 'after' });
      if (pv && st.asked.gran && !st.ate) L.push({ id: 'eat', t: '밥 얻기 (배고픔 −40)', how: '할머니 집 초록 고리 — 흔적이 남으니 떠날 때 지우자', done: () => st.ate, at: () => [pads.eat.x, pads.eat.z], tag: '🍚 밥' });
      if (pv && !st.asked.scared) L.push({ id: 'scared', t: '문 닫은 집 두드려 보기', how: '겁먹은 집 — 여러 번 두드리면 더 겁낸다', done: () => !!st.asked.scared, at: () => { const d = DOOR(HOUSES.scared); return [d[0], d[1] + 1.2]; }, tag: '🚪' });
      return L; },
    tags(put) { if (dist(S.px, S.pz, C3[0], C3[1]) < 130) { put(C3[0], H(C3[0], C3[1]) + 4.4, C3[1], st.info ? '기병 야영지' : '?'); for (const r of ROADS) if (st.found[r.id]) put(r.block[0], H(r.block[0], r.block[1]) + 2.6, r.block[1], st.teams[r.id] ? `🛡 ${r.name} 막음` : `${r.name} — 조 세울 곳`, st.teams[r.id] ? 'good' : ''); }
      if (dist(S.px, S.pz, 345, 188) < 60 && st.ph !== 'after') { for (const kk of ['gran', 'wood', 'scared']) if (!st.asked[kk]) { const d = DOOR(HOUSES[kk]); put(d[0], H(d[0], d[1]) + 3, d[1], kk === 'scared' ? '문 닫은 집' : '불 켜진 집'); } }
      if (st.ph === 'round') put(S.px, H(S.px, S.pz) + 3.4, S.pz, '바람 → 동쪽'); },
    mini(g, k) { if (st.info) { g.fillStyle = st.info > 1 ? '#e0301e' : 'rgba(224,48,30,.45)'; g.beginPath(); g.arc(C3[0] * k, C3[1] * k, st.info > 1 ? 6 : 10, 0, 6.28); g.fill(); }
      for (const r of ROADS) if (st.found[r.id]) { g.fillStyle = st.teams[r.id] ? '#3fb46a' : '#7ab8f0'; g.fillRect(r.block[0] * k - 3, r.block[1] * k - 3, 6, 6); }
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(400 * k, 140 * k); g.lineTo(415 * k, 140 * k); g.lineTo(411 * k, 136 * k); g.moveTo(415 * k, 140 * k); g.lineTo(411 * k, 144 * k); g.stroke(); },
    finish() { if (st.done) return; st.done = true; S.tension = 0; const sw = Object.keys(st.swept).length >= 3 && st.told; S.tags.trace_gapsan = sw ? 0 : 1; S.tags.missed = st.missed; const nt = Object.keys(st.teams).length;
      const head = st.idle ? '날이 새 버렸다' : st.broken ? '들켜서 흩어졌다' : st.missed === 0 ? '한 기도 놓치지 않았다' : `기병 ${st.missed}갈래를 놓쳤다`;
      c.endChapter({ b0: ch.b0, head,
        marks: [{ t: st.wood ? '나무꾼' : '소식 듣기', ok: st.wood }, { t: `조 ${nt}/4`, ok: nt >= 4 }, { t: '들키지 않음', ok: !st.broken && !st.idle }, { t: `놓친 기병 ${st.missed}`, ok: st.missed === 0 }, { t: '흔적 지움', ok: sw }],
        lines: [st.wood ? '나무꾼에게 야영지·보초 자리를 자세히 들었다' : st.info ? '할머니에게 말 우는 소리를 들었다' : '마을에서 소식을 듣지 못했다',
          ...(st.ate ? ['갑산촌에서 밥을 얻었다'] : []),
          st.idle ? '신호를 올리지 못하고 날이 샜다 — 기병이 먼저 떠나며 우리를 보았다' : st.broken ? '보초나 말에게 들켜 기병이 먼저 말에 올랐다' : `길 넷 가운데 ${nt}곳을 막고 신호했다`,
          st.missed ? `놓친 기병 ${st.missed} — 어랑촌 싸움이 ${st.missed * 40}초 일찍, 더 세게 시작된다` : '놓친 기병이 없다 — 어랑촌 본대는 아직 모른다',
          st.gains ? (st.gains.half ? '탄약·쌀을 반만 얻었다' : `탄약 +30 · 쌀(배고픔 −25)${S.tags.horse ? ' · 말' : ''}을 얻었다`) : '얻은 것이 없다',
          sw ? '갑산촌의 발자국과 불 자리를 지우고, 주민에게 산으로 피하라 전했다' : '갑산촌에 흔적이 남았다 — 뒤에 화를 입을 수 있다'],
        hist: '실제: 10월 22일 새벽, 독립군은 갑산촌 주민에게서 가까운 천수평에 일본군 기병대가 묵고 있다는 말을 듣고 가서 에워싸 쳤다. 이 싸움 뒤 독립군은 어랑촌 쪽으로 나아가 그날 가장 큰 싸움을 치렀다.<br><small>바람·조 세우기·흔적 지우기, 할머니·나무꾼은 놀이로 꾸민 것이다.</small>',
        night: st.missed ? `놓친 기병이 어랑촌 본대로 달려갔다` : '' }); },
    b0: { ...S.band } };
  return ch;
}
