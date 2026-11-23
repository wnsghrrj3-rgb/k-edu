/* 장 4 · 둘째 날 낮 「어랑촌 — 해 질 때까지」 (1920년 10월 22일 아침~해 질 녘) — 설계 v2 ④ 장 4 (차례 2)
   틀(안시성을 키운 것): 능선 셋(왼·가운데·오른)마다 밀림 띠 0→100. 100 이면 그 능선이 넘어가고 부대 −15, 옆 능선이 두 곱절로 밀린다. 둘이 넘어가면 흩어져 빠진다(부대 −35, 탄약 반).
   해 띠가 다 가면 이긴다(어둠을 타고 빠짐). 내가 하는 일 = 예비대 보내기 · 탄약 나르기 · 기관총 자리 옮기기(붉은 산포 고리) · 주먹밥 받아 나누기 · 홍범도에게 전령(기다림/내가 뜀).
   물결 넷: 왼 능선 → 산포 → 한낮(주먹밥) → 세 능선 한꺼번에 → 해 질 녘 30초(북이 빨라짐). 앞 장의 값: 놓친 기병(시작이 40초씩 일찍=버틸 시간이 는다) · 말 · 전갈닿음 · 홍범도힘.
   주먹밥은 「전해지는 이야기」(이범석 회고) — 끝 화면에 그렇게 적는다. 적은 쓰러지면서 사라진다. 우리 편은 「다쳐 뒤로 보냈다」로만. */
import { clamp, dist, lerp, ART } from '../scene/kit.js';
import { EORANG } from './map.js';

const R = [
  { id: 'L', name: '왼 능선', pos: [522, 138], res: [534, 127], mg: [[517, 142], [529, 132]], dir: [-0.74, 0.67] },
  { id: 'C', name: '가운데 능선', pos: [565, 142], res: [565, 130], mg: [[561, 145], [569, 136]], dir: [0, 1] },
  { id: 'R', name: '오른 능선', pos: [608, 138], res: [596, 127], mg: [[613, 142], [601, 132]], dir: [0.74, 0.67] }];
const HQ = EORANG.hq, PILE = [557, 101], RICE = [566, 163], HONG = [468, 70], VILLAGE = [566, 199], CMD = [573, 99];
/* 물결 표(해 띠 0→1): 능선마다 밀어붙이는 세기 */
function waves(k) { if (k < 0.2) return [1.0, 0.15, 0.1]; if (k < 0.4) return [0.45, 0.7, 0.6]; if (k < 0.55) return [0.3, 0.32, 0.3]; if (k < 0.86) return [0.9, 0.95, 0.9]; return [1.1, 1.15, 1.1]; }
export const K4 = { R, HQ, PILE, RICE, HONG, VILLAGE };

export default function ch4(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, fx, choose, closeChoice, SFX, H } = c;
  const missed = S.tags.missed != null ? S.tags.missed : 1, horse = !!S.tags.horse, msgOk = S.tags.msgOk != null ? S.tags.msgOk : 1, hongPow = S.tags.hongPow != null ? S.tags.hongPow : 70;
  const LEN = 540 + 40 * missed;
  const st = { ph: 'intro', t: 0, k: 0, ridges: R.map((r, i) => ({ ...r, i, push: 0, meter: 60, mgAt: i < 2 ? 0 : -1, mgT: 0, fallen: false, foes: [], men: [], fed: false })), reserve: { at: null, to: null, x: HQ[0], z: HQ[1] + 4, eta: 0, units: [] },
    carry: null, horseUsed: false, rice: 'none', riceFed: 0, hong: { choice: null, at: null, came: false, ran: false, runReached: false }, wounded: null, saved: false, warned: false, mgLost: 0, fallenN: 0, attr: 0, shellT: 0, mgShell: [false, false, false], fireT: 0, scatter: false, endT: 0, log: [] };
  const P = {}; let mgMesh = [];
  const ch = {
    id: 4, title: '해 질 때까지', when: '1920년 10월 22일 아침', place: '어랑촌', len: LEN, region: [484, 60, 646, 216], zones: ['eorang', 'cheonsu', 'wanru'], yaw: Math.PI, noPull: false,
    goal: '해가 질 때까지 능선 셋을 지킨다 — 둘이 넘어가면 흩어진다', idle: '능선을 지킨다', K: K4,
    get st() { return st; },
    start() {
      S.px = HQ[0] + 2; S.pz = HQ[1] + 8; S.pdir2 = 0;
      c.putArt('cs_tent_cmd', CMD[0] + 4, CMD[1] - 4, 2.6); c.putArt('cs_crate_pile', PILE[0], PILE[1], 0.3); c.putArt('cs_crate_pile', PILE[0] - 2.6, PILE[1] + 1.2, 1.3, 0.8); c.putArt('cs_flag', CMD[0], CMD[1] - 3, 0, 1, { cloth: 0xc0392b }); c.putArt('cs_stretcher', CMD[0] + 3, CMD[1] + 3, 0.2);
      for (const [x, z] of [[560, 112], [571, 113], [553, 108]]) c.putArt('cs_rocks', x, z, Math.random() * 3, 0.8);
      /* 능선마다 엎드린 조 · 기관총 */
      st.ridges.forEach((r, ri) => { const [dx, dz] = r.dir, lx = -dz, lz = dx; for (let i = 0; i < 12; i++) { const off = (i - 5.5) * 2.1, back = (i % 3) * 1.2, x = r.pos[0] + lx * off - dx * back, z = r.pos[1] + lz * off - dz * back, ry = Math.atan2(dx, dz); const g = (i % 2 ? army.iaP : army.iaK)[(i + ri) % 3]; r.men.push({ u: g.add({ x, z, ry }), x, z, ry }); }
        const m = c.putArt('cs_mg', 0, 0, 0); mgMesh.push(m); });
      /* 지휘소 사람들 · 예비대 */
      P.kim = ppl.cast('kim', CMD[0], CMD[1], Math.PI); P.na = ppl.cast('na', CMD[0] - 2.4, CMD[1] + 0.6, Math.PI); P.lee = ppl.cast('lee', R[1].res[0] - 2, R[1].res[1] - 1, 0);
      P.mak = ppl.cast('mak', PILE[0] + 2.2, PILE[1] + 2.4, 0.6); P.sot = ppl.cast('sot', CMD[0] + 6, CMD[1] + 4, -1); P.sun = ppl.cast('sun', R[1].pos[0] + 4, R[1].pos[1] - 2, 0); P.sun.pose = 'kneel';
      for (const k of ['kim', 'na', 'mak', 'sot']) P[k].look = 'me';
      for (let i = 0; i < 10; i++) { const x = HQ[0] - 6 + (i % 5) * 2.6, z = HQ[1] + 6 + Math.floor(i / 5) * 2.2; st.reserve.units.push({ u: army.iaS[i % 3].add({ x, z, ry: 0 }), ox: (i % 5) * 2.4 - 4.8, oz: Math.floor(i / 5) * 2.2 - 1 }); }
      /* 마을 사람들(주먹밥) — 한낮까지 마을에 */
      P.aj = ppl.cast('vil1', VILLAGE[0], VILLAGE[1], Math.PI); P.kid = ppl.cast('kid', VILLAGE[0] + 1.6, VILLAGE[1] + 0.8, Math.PI); P.aj.speed = 2.2; P.kid.speed = 2.2;
      /* 고리 */
      R.forEach((r) => { pad('res_' + r.id, r.res[0], r.res[1], 0x7ab8f0, 2.0); pad('amm_' + r.id, r.pos[0] - r.dir[0] * 4.5, r.pos[1] - r.dir[1] * 4.5, 0xffcf4d, 1.9); pad('rice_' + r.id, r.pos[0] - r.dir[0] * 4.5 + 3, r.pos[1] - r.dir[1] * 4.5, 0xffffff, 1.6); pad('mg_' + r.id, 0, 0, 0xe0402a, 1.7); });
      pad('pile', PILE[0] + 2.4, PILE[1] + 2.6, 0xffcf4d, 2.0); pad('horse', PILE[0] - 3.4, PILE[1] + 4.2, 0x8ad08a, 1.8); pad('rice', RICE[0], RICE[1], 0xffffff, 2.2); pad('hong', HONG[0], HONG[1], 0xffcf4d, 3); pad('village', VILLAGE[0], VILLAGE[1] - 3, 0x8ad08a, 2); pad('wound', 0, 0, 0x8ad08a, 1.6);
      ch.placeMG();
      c.scene.fog.color.set(0xd8d0bc); c.scene.fog.near = 120; c.scene.fog.far = 560; c.sun.color.set(0xfff0d0); c.sun.intensity = 2.2; c.hemi.intensity = 1.2; c.sky.paint(0x8fb4dc, 0xeee2c8, 0xffd8a0, [-0.3, 0.5, 0.4], 0.5);
      ch.sunOff = [-40, 80, 50];
      setTimeout(() => cmd('김좌진 사령관', '고지에 올라 막는다. 해가 질 때까지.', 4.2), 1200);
      st.ph = 'battle';
      setTimeout(() => say(missed ? `천수평에서 놓친 기병 ${missed}이 알렸다 — 적이 일찍, 세게 온다` : '적이 들을 메우며 다가온다', null, 3.6), 5200);
    },
    timeK() { return clamp(1 - st.k, 0, 1); },
    placeMG() { st.ridges.forEach((r, i) => { const m = mgMesh[i]; if (!m) return; if (r.mgAt < 0) { m.visible = false; pads['mg_' + r.id].m.visible = false; return; } const p = r.mg[r.mgAt]; m.visible = true; m.position.set(p[0], H(p[0], p[1]), p[1]); m.rotation.y = Math.atan2(r.dir[0], r.dir[1]); }); },
    update(dt) {
      st.t += dt; const tm = document.getElementById('time').firstChild; const lab = st.ph === 'dusk' ? '해가 졌다 ' : '10월 22일 · 해 지기까지 '; if (tm.textContent !== lab) tm.textContent = lab;
      if (st.ph === 'battle') ch.battle(dt); else if (st.ph === 'dusk') ch.dusk(dt);
      ch.drawFoes(dt); ch.moveReserve(dt); ch.drawPanel();
      /* 해: 낮 → 해 질 녘(붉게) */
      if (Math.floor(st.t) !== Math.floor(st.t - dt)) { const k = st.k; c.sun.color.setHSL(0.09, 0.6, lerp(0.86, 0.55, Math.max(0, k - 0.6) / 0.4)); c.sun.intensity = lerp(2.2, 1.2, Math.max(0, k - 0.6) / 0.4); if (Math.floor(st.t) % 12 === 0) c.sky.paint(k < 0.75 ? 0x8fb4dc : 0x6a78a8, k < 0.75 ? 0xeee2c8 : 0xf0a070, 0xffa060, [-0.3, 0.5 - k * 0.45, 0.4], 0.5 + k * 0.7); }
      /* 고리 보이기 */
      const play = st.ph === 'battle', carrying = st.carry;
      R.forEach((r) => { const q = st.ridges[R.indexOf(r)]; pads['res_' + r.id].m.visible = play && !q.fallen && st.reserve.to !== r.id && st.reserve.at !== r.id; pads['amm_' + r.id].m.visible = play && carrying === 'ammo' && !q.fallen; pads['rice_' + r.id].m.visible = play && carrying === 'rice' && !q.fed && !q.fallen; pads['mg_' + r.id].m.visible = play && q.mgAt >= 0 && !q.fallen; });
      pads.pile.m.visible = play && !carrying && S.band.ammo >= 5; pads.horse.m.visible = play && horse && !st.horseUsed && !carrying;
      pads.rice.m.visible = play && st.rice === 'ready' && !carrying; pads.hong.m.visible = play && st.hong.choice === 'run' && !st.hong.runReached; pads.village.m.visible = play && !st.warned && !carrying; pads.wound.m.visible = play && st.wounded && !st.saved;
      for (const r of st.ridges) { const p = pads['mg_' + r.id]; if (r.mgAt >= 0) { const q = r.mg[r.mgAt]; if (p.x !== q[0] || p.z !== q[1]) { c.scene.remove(p.m); pad('mg_' + r.id, q[0], q[1], 0xe0402a, 1.7); } } }
      if (st.wounded && Math.abs(pads.wound.x - st.wounded.x - 1.4) > 0.01) { c.scene.remove(pads.wound.m); pad('wound', st.wounded.x + 1.4, st.wounded.z, 0x8ad08a, 1.6); }
    },
    /* ───── 싸움 ───── */
    battle(dt) {
      st.k = clamp(st.t / LEN, 0, 1); const k = st.k, w = waves(k), fallenN = st.ridges.filter((r) => r.fallen).length;
      const hongOn = st.hong.came, hm = hongOn ? 1 - 0.55 * (hongPow / 100) : 1, hung = S.band.hunger > 80 ? 1.15 : 1;
      for (const r of st.ridges) { if (r.fallen) continue; const i = r.i, nb = st.ridges.some((q) => q.fallen && Math.abs(q.i - i) === 1) ? 2 : 1;
        const mult = (r.mgAt >= 0 ? 0.5 : 1) * (st.reserve.at === r.id ? 0.4 : 1) * (r.meter <= 0 ? 2.2 : r.meter < 20 ? 1.4 : 1) * hm * nb * hung;
        r.rate = w[i] * mult; r.push = clamp(r.push + (r.rate - 0.35) * dt, 0, 100);
        if (w[i] > 0.12) r.meter = Math.max(0, r.meter - (0.18 + w[i] * 0.26) * dt);
        st.attr += 0.015 * w[i] * mult * dt;
        if (r.push >= 100) ch.fall(r); }
      if (st.attr >= 1) { const n = Math.floor(st.attr); st.attr -= n; band('troop', -n, '능선에서 다친 사람을 뒤로 보냈다', true); }
      if (S.band.troop <= 0) return ch.finish('wiped');
      /* 산포: 물결 둘부터 — 오래 둔 기관총 자리 · 능선 줄 */
      if (k > 0.2) { for (const r of st.ridges) if (r.mgAt >= 0 && !r.fallen) r.mgT += dt;
        st.shellT -= dt; if (st.shellT <= 0) { st.shellT = k < 0.55 ? 6 : 4.5; SFX.far(); const old = st.ridges.find((r) => r.mgAt >= 0 && !r.fallen && r.mgT > 44 && !st.mgShell[r.i]);
          let x, z, tgt = null; if (old) { tgt = old; st.mgShell[old.i] = true; const p = old.mg[old.mgAt]; x = p[0] + (Math.random() - 0.5) * 1.5; z = p[1] + (Math.random() - 0.5) * 1.5; say(`산포가 ${old.name} 기관총 자리를 노린다! — 붉은 고리 밖으로 옮기자`, null, 3.4); }
          else { const r = st.ridges[Math.floor(Math.random() * 3)]; x = r.pos[0] + (Math.random() - 0.5) * 22; z = r.pos[1] + (Math.random() - 0.5) * 14; }
          const at = tgt ? tgt.mgAt : -1; fx.shell(x, z, tgt ? 8 : 5, (lx, lz) => { SFX.boom(dist(S.px, S.pz, lx, lz) < 50 ? 1 : 0.4); fx.shake = dist(S.px, S.pz, lx, lz) < 30 ? 1.2 : 0.25;
            if (tgt) { st.mgShell[tgt.i] = false; if (tgt.mgAt === at && tgt.mgAt >= 0) { tgt.mgAt = -1; st.mgLost++; band('troop', -3, `${tgt.name} 기관총 조가 다쳐 뒤로 갔다`); ch.placeMG(); say(`${tgt.name} 기관총을 잃었다`, null, 3); } }
            if (dist(S.px, S.pz, lx, lz) < 3.3) { band('troop', -2, '산포 고리에 걸렸다'); SFX.bad(); } }, tgt ? 3.4 : 3); } }
      /* 한낮: 주먹밥 */
      if (k > 0.4 && st.rice === 'none') { st.rice = 'coming'; P.aj.tx = RICE[0] + 1; P.aj.tz = RICE[1] + 2.5; P.kid.tx = RICE[0] + 2.6; P.kid.tz = RICE[1] + 3.2; say('마을 사람들이 밥 광주리를 이고 비탈을 올라온다!', null, 4); }
      if (st.rice === 'coming' && dist(P.aj.x, P.aj.z, P.aj.tx, P.aj.tz) < 1) { st.rice = 'ready'; ppl.talk(P.aj, '주먹밥이오! 식기 전에 드시오.', 4); }
      /* 오후: 홍범도에게 전령 */
      if (k > 0.5 && !st.hong.choice && !c.choosing()) { st.hong.choice = 'ask'; choose('홍범도 부대에 알릴까?', [{ t: '내가 뛴다', s: msgOk ? '빨리 온다 — 가는 동안 능선은 나 없이 버틴다' : '전갈이 안 닿았다 — 내가 안 뛰면 안 온다', fn: () => { st.hong.choice = 'run'; say('북서쪽 능선 너머 노란 고리까지 달려가 알리자!', null, 3.4); } }, { t: '기다린다', s: msgOk ? '해가 많이 기울어야 온다' : '전갈이 안 닿았다 — 오지 않을 수도 있다', fn: () => { st.hong.choice = 'wait'; st.hong.at = msgOk ? 0.8 : 9; } }]); }
      if (st.hong.choice === 'run' && st.hong.runReached && st.hong.at == null) st.hong.at = Math.max(k + 0.04, 0.6);
      if (st.hong.at != null && k >= st.hong.at && !st.hong.came) ch.hongArrives();
      if (st.hong.ask && c.choosing() === false) st.hong.ask = false;
      /* 다친 동기(골라서): 셋째 물결에 */
      if (k > 0.6 && !st.wounded && !st.ridges[1].fallen) { st.wounded = { x: P.sun.x, z: P.sun.z }; P.sun.pose = 'prone'; ppl.talk(P.sun, '…윽, 다리를 맞았어.', 3.6); say('순길이 다쳤다 — 지휘소로 부축할 수 있다', null, 3); }
      /* 해 질 녘 30초 */
      const left = LEN - st.t; S.tension = clamp(Math.max(...st.ridges.map((r) => (r.fallen ? 0 : r.push / 100))), 0, 1);
      if (left < 30 && !S.said.last30) { S.said.last30 = 1; say('해가 능선에 걸렸다 — 조금만 더!', null, 3.4); }
      if (left < 30) { st.drumT = (st.drumT || 0) - dt; if (st.drumT <= 0) { st.drumT = lerp(0.35, 0.9, left / 30); SFX.drum(0.35); } S.tension = Math.max(S.tension, 0.7); }
      if (st.t >= LEN) ch.toDusk();
      /* 총소리 · 총구 불빛 */
      st.fireT -= dt; if (st.fireT <= 0) { st.fireT = 0.09; const live = st.ridges.filter((r) => !r.fallen && w[r.i] > 0.12); const r = live[Math.floor(Math.random() * live.length)]; if (r) { const m = r.men[Math.floor(Math.random() * r.men.length)], y = H(m.x, m.z) + 0.45; fx.flash(m.x + r.dir[0] * 1.3, y, m.z + r.dir[1] * 1.3, 1.2); if (Math.random() < 0.3) fx.puff(m.x + r.dir[0] * 1.5, y + 0.3, m.z + r.dir[1] * 1.5, { size: 1.1, life: 1.8, vy: 0.5, op: 0.45 }); if (Math.random() < 0.25) SFX.shot(dist(S.px, S.pz, m.x, m.z) < 40 ? 0.7 : 0.3); if (r.mgAt >= 0 && Math.random() < 0.4) { const q = r.mg[r.mgAt]; fx.flash(q[0] + r.dir[0], H(q[0], q[1]) + 0.6, q[1] + r.dir[1], 1.6); } } }
      if (st.hong.came && Math.random() < dt * 4) { const x = 492 + Math.random() * 18, z = 120 + Math.random() * 30; fx.flash(x, H(x, z) + 1, z, 1.2); if (Math.random() < 0.3) SFX.shot(0.25); }
    },
    fall(r) { r.fallen = true; r.push = 100; st.fallenN++; band('troop', -15, `${r.name}이 넘어갔다`); SFX.bad(); cmd('김좌진 사령관', `${r.name}을 거두어라!`, 3.4); say(`${r.name}이 넘어갔다 — 옆 능선이 두 곱절로 밀린다!`, null, 4);
      for (const m of r.men) m.u.on = false; if (st.reserve.at === r.id) { st.reserve.at = null; st.reserve.to = null; }
      if (st.ridges.filter((q) => q.fallen).length >= 2) { st.scatter = true; band('troop', -35, '능선 둘이 넘어가 흩어져 빠졌다'); band('ammo', -Math.round(S.band.ammo / 2), '흩어지며 탄약을 버렸다'); ch.finish('scatter'); } },
    hongArrives() { st.hong.came = true; SFX.volley(0.7); setTimeout(() => SFX.volley(0.6), 700); cmd('홍범도 부대', '북쪽에서 총소리 — 적의 옆구리를 친다!', 4.2); say('홍범도 부대가 왔다! 적의 공격이 둘로 갈린다', null, 4);
      P.hong = ppl.cast('hong', 498, 112, 2.4); P.hong.look = 'me'; ppl.talk(P.hong, '늦지 않았구먼. 옆구리는 우리가 맡겠소.', 4.6);
      st.hongUnits = []; for (let i = 0; i < 18; i++) { const x = 486 + (i % 6) * 2.4, z = 104 + Math.floor(i / 6) * 3; st.hongUnits.push(army.iaK[i % 3].add({ x, z, ry: 2.4 })); } },
    toDusk() { st.ph = 'dusk'; st.endT = 0; S.tension = 0.3; cmd('김좌진 사령관', '어둠을 타고 빠진다.', 4.2); say('해가 졌다 — 먼 능선부터 거두어 뒤 숲으로', null, 4); closeChoice(); },
    dusk(dt) { st.endT += dt; c.hemi.intensity = lerp(1.0, 0.45, clamp(st.endT / 6, 0, 1)); c.sun.intensity = lerp(1.2, 0.2, clamp(st.endT / 6, 0, 1));
      /* 먼 데(왼·오른)부터 거둔다: 엎드린 조가 지휘소 뒤로 */
      const order = [0, 2, 1]; order.forEach((ri, n) => { if (st.endT > 1 + n * 2) for (const m of st.ridges[ri].men) m.u.on = false; });
      if (st.endT > 8) ch.finish('dusk'); },
    /* ───── 적: 능선 밑 비탈을 오르는 무리(밀림이 오를수록 가까이) — 쓰러지면서 사라진다 ───── */
    drawFoes(dt) { const w = st.ph === 'battle' ? waves(st.k) : [0, 0, 0];
      for (const r of st.ridges) { const want = r.fallen ? 0 : Math.round(clamp(w[r.i], 0, 1.2) * 18); while (r.foes.length < want) { const f = { u: army.jp.add({ x: r.pos[0], z: r.pos[1] }), lat: (Math.random() - 0.5) * 30, d0: 30 + Math.random() * 26, ph: Math.random() * 6.28, st: 'go', t: 0 }; r.foes.push(f); }
        const [dx, dz] = r.dir, lx = -dz, lz = dx, near = lerp(36, 9, r.push / 100);
        for (let i = r.foes.length - 1; i >= 0; i--) { const f = r.foes[i], u = f.u;
          if (f.st === 'go') { f.d0 = Math.max(near + (i % 5) * 2.2, f.d0 - dt * (0.6 + w[r.i] * 1.2)); if (Math.random() < dt * 0.09 * (r.mgAt >= 0 ? 2 : 1) * (r.meter > 0 ? 1 : 0.2) || i >= want + 2 || r.fallen) { f.st = 'fall'; f.t = 0; } }
          const x = r.pos[0] + dx * f.d0 + lx * f.lat, z = r.pos[1] + dz * f.d0 + lz * f.lat; u.x = x; u.z = z; u.ry = Math.atan2(-dx, -dz);
          if (f.st === 'go') { u.bob = Math.abs(Math.sin(S.t * 6 + f.ph)) * 0.08; u.pitch = 0.12; u.s = 1; u.on = true; }
          else { f.t += dt; const a = clamp(f.t / 0.45, 0, 1), b = clamp((f.t - 0.45) / 0.55, 0, 1); u.pitch = -a * 1.3; u.s = 1 - b; if (f.t > 1) { u.on = false; r.foes.splice(i, 1); } } } } },
    moveReserve(dt) { const rv = st.reserve; if (rv.to) { const r = st.ridges.find((q) => q.id === rv.to), tx = r.res[0], tz = r.res[1]; const d = dist(rv.x, rv.z, tx, tz); rv.eta = d / 3.6; if (d > 1) { rv.x += (tx - rv.x) / d * 3.6 * dt; rv.z += (tz - rv.z) / d * 3.6 * dt; } else { rv.at = rv.to; rv.to = null; say(`예비대가 ${r.name}에 닿았다`, null, 2.4); } }
      const ry = rv.to ? Math.atan2(...(() => { const r = st.ridges.find((q) => q.id === rv.to); return [r.res[0] - rv.x, r.res[1] - rv.z]; })()) : 0;
      for (const p of rv.units) { p.u.x = rv.x + p.ox; p.u.z = rv.z + p.oz; p.u.ry = rv.at ? Math.atan2(...st.ridges.find((q) => q.id === rv.at).dir) : ry; p.u.bob = rv.to ? Math.abs(Math.sin(S.t * 10 + p.ox)) * 0.1 : 0; } },
    drawPanel() { const e = document.getElementById('panel'); if (!e) return; const html = st.ridges.map((r) => `<div class="rg ${r.fallen ? 'off' : r.push > 70 ? 'hot' : ''}"><b>${r.name}</b>${r.fallen ? '<span>넘어감</span>' : `<i title="밀림"><u style="width:${r.push.toFixed(0)}%"></u></i><em>${r.mgAt >= 0 ? '🔫' : ''}${st.reserve.at === r.id ? '🛡' : st.reserve.to === r.id ? '🛡…' : ''}</em><small>탄약 <i class="am"><u style="width:${r.meter.toFixed(0)}%"></u></i></small>`}</div>`).join('');
      if (e._h !== html) { e.innerHTML = '<div class="ph">능선 — 밀림</div>' + html; e._h = html; } e.style.display = st.ph === 'battle' ? 'block' : 'none'; },
    signal() { return false; },
    job() { if (st.ph !== 'battle') return null; const at = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      for (const r of st.ridges) { if (at('res_' + r.id)) return { key: 'res' + r.id, need: 0.8, label: `예비대를 ${r.name}으로`, fn: () => { st.reserve.to = r.id; st.reserve.at = null; SFX.page(); say(`예비대가 ${r.name}으로 간다(${Math.round(dist(st.reserve.x, st.reserve.z, r.res[0], r.res[1]) / 3.6)}초)`, null, 2.6); } };
        if (at('amm_' + r.id)) return { key: 'amm' + r.id, need: 0.9, label: `${r.name}에 탄약 내려놓기`, fn: () => { st.carry = null; r.meter = Math.min(100, r.meter + 70); SFX.good(); } };
        if (at('rice_' + r.id)) return { key: 'rice' + r.id, need: 0.9, label: `${r.name}에 주먹밥 나누기`, fn: () => { r.fed = true; r.push = Math.max(0, r.push - 15); st.riceFed++; SFX.good(); ppl.talk(c.me, '주먹밥이오!', 1.8, 2.4); if (st.riceFed >= st.ridges.filter((q) => !q.fallen).length) { st.carry = null; band('hunger', -35, '주먹밥'); say('능선마다 주먹밥을 나눴다 — 배고픔이 크게 줄었다', null, 3); } } };
        if (at('mg_' + r.id)) return { key: 'mg' + r.id, need: 1.4, label: '기관총 옮겨라', fn: () => { r.mgAt = 1 - r.mgAt; r.mgT = 0; ch.placeMG(); SFX.page(); say(`${r.name} 기관총을 옮겼다`, null, 2); } }; }
      if (at('pile')) return { key: 'pile', need: 1.4, label: '탄약 상자 지기', fn: () => { st.carry = 'ammo'; band('ammo', -5, '탄약 상자'); SFX.page(); } };
      if (at('horse')) return { key: 'horse', need: 1.6, label: '말에 탄약 싣기', fn: () => { st.horseUsed = true; band('ammo', -6, '말에 실은 탄약'); const r = st.ridges.filter((q) => !q.fallen).sort((a, b) => a.meter - b.meter)[0]; if (r) r.meter = Math.min(100, r.meter + 55); say(`말이 ${r ? r.name : ''}에 탄약을 날랐다`, null, 2.6); SFX.good(); } };
      if (at('rice')) return { key: 'rice', need: 1.6, label: '주먹밥 광주리 받기', fn: () => { st.carry = 'rice'; st.rice = 'taken'; ppl.talk(P.aj, '산으로 올라가시오, 어서!', 3); P.aj.tx = VILLAGE[0]; P.aj.tz = VILLAGE[1]; P.kid.tx = VILLAGE[0] + 1.6; P.kid.tz = VILLAGE[1] + 0.8; SFX.page(); } };
      if (at('hong')) return { key: 'hong', need: 1.0, label: '홍범도 부대에 알리기', fn: () => { st.hong.runReached = true; st.hong.ran = true; SFX.good(); say('알렸다! 홍범도 부대가 곧 온다 — 능선으로 돌아가자', null, 3.4); } };
      if (at('village')) return { key: 'village', need: 1.4, label: '「산으로 피하시오」', fn: () => { st.warned = true; S.tags.warn_eorang = 1; ppl.talk(P.aj, '알겠소, 아이들 데리고 산으로 가겠소.', 3.4); SFX.good(); } };
      if (at('wound')) return { key: 'wound', need: 1.6, label: '순길 부축하기', fn: () => { st.saved = true; S.tags.savedSun = 1; P.sun.pose = 'stand'; P.sun.tx = CMD[0] + 3; P.sun.tz = CMD[1] + 4; P.sun.speed = 1.6; ppl.talk(P.sun, '고, 고맙다… 혼자 갈 수 있어.', 3); SFX.good(); } };
      return null; },
    tasks() { const L = [], play = st.ph === 'battle', rs = st.ridges.filter((r) => !r.fallen);
      const mgSoon = rs.find((r) => r.mgAt >= 0 && r.mgT > 30 && !st.mgShell[r.i] && st.k > 0.2); const worst = rs.slice().sort((a, b) => b.push - a.push)[0], lowAmmo = rs.slice().sort((a, b) => a.meter - b.meter)[0], mgDanger = rs.find((r) => st.mgShell[r.i] && r.mgAt >= 0);
      if (play && mgDanger) L.push({ id: 'mgmove', req: true, t: `산포가 ${mgDanger.name} 기관총을 노린다 — 옮겨라!`, how: '기관총 곁 붉은 고리에 서기(1.4초) — 다른 자리로 옮긴다', done: () => !st.mgShell[mgDanger.i] || mgDanger.mgAt < 0, at: () => mgDanger.mg[mgDanger.mgAt], tag: '🔫 옮겨라!' });
      if (play && st.carry === 'rice') { const r = rs.find((q) => !q.fed); if (r) L.push({ id: 'feed', req: true, t: `주먹밥을 ${r.name}에`, n: () => [st.riceFed, rs.length], how: '능선 뒤 흰 고리 — 능선마다 밀림 −15, 다 나누면 배고픔 −35', done: () => st.carry !== 'rice', at: () => [pads['rice_' + r.id].x, pads['rice_' + r.id].z], tag: '🍙 주먹밥' }); }
      if (play && st.carry === 'ammo') L.push({ id: 'drop', req: true, t: `탄약을 ${lowAmmo ? lowAmmo.name : '능선'}에`, how: '능선 뒤 노란 고리에 내려놓기', done: () => st.carry !== 'ammo', at: () => [pads['amm_' + lowAmmo.id].x, pads['amm_' + lowAmmo.id].z], tag: () => `탄약 ↓ ${lowAmmo.name}` });
      if (play && mgSoon && !mgDanger) L.push({ id: 'mgsoon', req: true, t: `${mgSoon.name} 기관총이 한자리에 오래 있었다 — 옮기자`, how: '오래 두면 산포가 그 자리를 때린다 · 기관총 곁 붉은 고리에 서기', done: () => mgSoon.mgT < 30 || mgSoon.mgAt < 0, at: () => mgSoon.mg[mgSoon.mgAt], tag: '🔫 옮기기' });
      if (play && st.hong.choice === 'run' && !st.hong.runReached) L.push({ id: 'run', req: true, t: '홍범도 부대에 알리러 뛰기', how: '북서쪽 능선 너머 노란 고리 — 가는 동안 능선은 나 없이 버틴다', done: () => st.hong.runReached, at: () => HONG, tag: '🏃 홍범도 부대' });
      if (play && !st.carry && worst && worst.push > 40 && st.reserve.at !== worst.id && st.reserve.to !== worst.id) L.push({ id: 'res', req: true, t: `${worst.name}이 밀린다 — 예비대 보내기`, how: '그 능선 뒤 파란 고리에 서면 예비대가 간다(하나뿐 · 옮기는 데 시간이 걸린다)', done: () => st.reserve.at === worst.id || st.reserve.to === worst.id, at: () => worst.res, tag: '🛡 예비대' });
      if (play && !st.carry && lowAmmo && lowAmmo.meter < 35 && S.band.ammo >= 5) L.push({ id: 'ammo', req: true, t: `${lowAmmo.name} 탄약이 떨어진다 — 나르기`, how: '지휘소 탄약 더미(노란 고리)에서 지고 능선으로 · 한 번에 한 능선', done: () => st.carry === 'ammo', at: () => [pads.pile.x, pads.pile.z], tag: '🎯 탄약 더미' });
      if (play && st.rice === 'ready' && !st.carry) L.push({ id: 'rice', req: true, t: '주먹밥 받아 오기 — 마을 사람들이 왔다', how: '가운데 능선 아래 흰 고리 · 받으러 간 동안 능선은 나 없이 버틴다', done: () => st.rice === 'taken' || st.rice === 'done', at: () => RICE, tag: '🍙 주먹밥' });
      L.push({ id: 'hold', req: true, t: '해 질 때까지 능선 지키기', n: () => [Math.round(st.k * 100), 100], how: '능선 띠가 차면 넘어간다 — 둘이 넘어가면 흩어진다', done: () => st.ph !== 'battle' && !st.scatter, at: () => null, wait: true });
      if (play && horse && !st.horseUsed) L.push({ id: 'horse', t: '말에 탄약 싣기 (한 번)', how: '천수평에서 얻은 말이 탄약이 가장 적은 능선으로 나른다', done: () => st.horseUsed, at: () => [pads.horse.x, pads.horse.z], tag: '🐎 말' });
      if (play && st.wounded && !st.saved) L.push({ id: 'wound', t: '다친 순길 부축하기', how: '곁 초록 고리 — 지휘소로 보내면 살아남아 뒤 장에 나온다', done: () => st.saved, at: () => [pads.wound.x, pads.wound.z], tag: '🩹 순길' });
      if (play && !st.warned) L.push({ id: 'village', t: '마을 사람들에게 「산으로 피하시오」', how: '어랑촌 마을 초록 고리 — 끝 화면의 마을 소식이 달라진다', done: () => st.warned, at: () => [pads.village.x, pads.village.z], tag: '🏠 어랑촌' });
      return L; },
    tags(put) { for (const r of st.ridges) { if (dist(S.px, S.pz, r.pos[0], r.pos[1]) > 140) continue; put(r.pos[0], H(r.pos[0], r.pos[1]) + 4, r.pos[1], r.fallen ? `${r.name} — 넘어감` : `${r.name} ${Math.round(r.push)}%<small>탄약 ${Math.round(r.meter)}${r.mgAt >= 0 ? ' · 🔫' : ''}${st.reserve.at === r.id ? ' · 🛡 예비대' : ''}</small>`, r.fallen ? '' : r.push > 70 ? 'hot' : 'good'); }
      if (st.reserve.to) put(st.reserve.x, H(st.reserve.x, st.reserve.z) + 3.4, st.reserve.z, `🛡 예비대 → ${Math.ceil(st.reserve.eta)}초`); },
    mini(g, k) { for (const r of st.ridges) { g.fillStyle = r.fallen ? '#555' : r.push > 70 ? '#e0402a' : '#3fb46a'; g.beginPath(); g.arc(r.pos[0] * k, r.pos[1] * k, 5, 0, 6.28); g.fill(); } g.fillStyle = '#ffcf4d'; g.fillRect(HQ[0] * k - 3, HQ[1] * k - 3, 6, 6); },
    finish(why) { if (st.done) return; st.done = true; S.tension = 0; closeChoice();
      const kept = st.ridges.filter((r) => !r.fallen).length, won = why === 'dusk';
      S.tags.eorangKept = kept; S.tags.hongCame = st.hong.came ? 1 : 0; if (!st.warned) S.tags.warn_eorang = 0;
      const head = why === 'wiped' ? '더는 싸울 사람이 없다' : why === 'scatter' ? '능선이 무너져 흩어졌다' : kept === 3 && S.band.troop >= 70 ? '해 질 때까지 버텼다' : '버텼지만 많이 잃었다';
      c.endChapter({ b0: ch.b0, head, lose: why === 'wiped',
        marks: [{ t: `능선 ${kept}/3 지킴`, ok: kept === 3 }, { t: '주먹밥', ok: st.riceFed > 0 }, { t: st.hong.ran ? '홍범도에게 뛰어감' : '홍범도 부대', ok: st.hong.came }, { t: '기관총 지킴', ok: st.mgLost === 0 }, { t: '마을에 알림', ok: st.warned }],
        lines: [won ? '해가 지자 어둠을 타고 빠졌다.' : why === 'scatter' ? '능선 둘이 넘어가 부대가 흩어져 빠졌다 — 탄약도 반을 버렸다.' : '부대가 더는 버티지 못했다.',
          ...st.ridges.filter((r) => r.fallen).map((r) => `${r.name}이 넘어갔다`),
          st.riceFed ? `주먹밥을 능선 ${st.riceFed}곳에 나눴다` : '주먹밥을 받으러 가지 못했다',
          st.hong.came ? (st.hong.ran ? '내가 뛰어가 알려 홍범도 부대가 일찍 왔다 — 적의 공격이 둘로 갈렸다' : '홍범도 부대가 해 질 녘에 왔다') : '홍범도 부대가 오지 않았다',
          ...(st.mgLost ? [`산포에 기관총 ${st.mgLost}정을 잃었다`] : []), ...(st.saved ? ['다친 순길을 지휘소로 부축했다'] : []), ...(missed ? [`천수평에서 놓친 기병 ${missed} 때문에 ${missed * 40}초를 더 버텼다`] : [])],
        hist: '실제: 10월 22일, 독립군은 어랑촌 뒤 고지에 올라 아침부터 해 질 녘까지 에워싸 오는 일본군 대부대를 막았다. 홍범도의 부대가 싸움에 들어오면서 적의 공격이 갈렸고, 청산리 일대에서 가장 큰 싸움이 되었다. 마을 사람들이 비탈로 밥을 날라 주었다는 이야기가 전해진다(이범석 회고). 일본군 피해는 <b>기록마다 다르다</b>.<br><small>예비대·탄약 나르기·기관총 옮기기는 놀이로 꾸민 것이고, 부대원 이름은 지어낸 것이다.</small>' }); },
    b0: { ...S.band } };
  return ch;
}
