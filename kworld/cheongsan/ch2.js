/* 장 2 · 첫날 밤 「완루구 — 적끼리」 (1920년 10월 21일 밤) — 설계 v2 ④ 장 2 (차례 5)
   차례: 사령관의 전갈(「어랑촌 쪽에서 만납시다」)을 품고 밤 숲을 건넌다(순찰 횃불 셋의 빛 고리 — 엎드리면 빛이 스쳐도 안 들킨다 · 눈 내린 빈터는 발자국이 남는다)
        → 홍범도 부대에 닿는다(백 포수 「발소리가 아직 크구먼」) → 「틈이 어디냐?」 살피기로 두 횃불 줄 사이 틈 셋(넓지만 곧 닫힘 · 좁지만 오래 · 물길)
        → 틈 하나를 골라 길잡이로 앞장선다(뛰면 줄이 끊긴다 — 걷고, 멈추고, 엎드리는 박자) → 능선에서 내려다본다: 두 횃불 줄이 빈 야영지를 향해 서로 다가가 총소리가 서로를 향한다.
   넘기는 값: 전갈닿음(어랑촌에서 홍범도가 제때 오나) · 홍범도힘(100/70/40). 실제: 홍범도 부대가 포위를 빠져나오며 일본군 부대끼리 서로 공격하게 만들었다.
   빛 고리·틈 고르기·발자국·모닥불 남기기는 놀이 장치. */
import { dressCamp, dressVillage } from './dress.js';
import { clamp, dist, lerp, art, glowSprite, ART } from '../scene/kit.js';

const START = [404, 158], CAMP = [437, 100], RIDGE = [388, 76];
const PATROLS = [{ c: [418, 136], r: 10, sp: 0.38 }, { c: [447, 126], r: 9, sp: -0.45 }, { c: [430, 116], r: 7, sp: 0.55 }];
const SNOW = [424, 140], SNOW_R = 9;
const GAPS = [
  { id: 'wide', name: '서쪽 비탈 — 넓은 틈', at: [412, 86], close: 75, way: [[412, 86], RIDGE], note: '넓지만 곧 닫힌다' },
  { id: 'narrow', name: '북쪽 골 — 좁은 틈', at: [432, 66], close: 150, way: [[432, 66], [418, 58], RIDGE], note: '좁고 횃불이 지나가지만 오래 열린다', patrol: { a: [446, 64], b: [420, 64], sp: 3.2 } },
  { id: 'water', name: '개울 따라 — 물길', at: [431, 44], close: 210, way: [[431, 44], [404, 40], RIDGE], note: '가장 오래 열린다 · 춥고 배고프다(배고픔 +8)' }];
export const K2 = { START, CAMP, RIDGE, PATROLS, SNOW, GAPS };

export default function ch2(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, fx, choose, closeChoice, SFX, H } = c;
  const st = { ph: 'go', t: 0, len: 300, arrT: null, foot: false, caught: false, gapSeen: {}, gap: null, line: [], trail: [], lost: 0, brokeT: 0, broke: false, fireLeft: false, fireT: 0, overT: 0, det2: 0, pat: [], lines: [], done: false };
  const P = {};
  const ch = {
    id: 2, title: '적끼리', when: '1920년 10월 21일 밤', place: '완루구', len: 300, region: [372, 30, 492, 168], zones: ['wanru', 'cheonsu'], yaw: Math.PI * 0.25,
    goal: '전갈을 홍범도 부대에 — 그리고 두 횃불 줄 사이 틈으로 빼낸다', idle: '밤 숲', K: K2,
    get st() { return st; },
    start() {
      S.px = START[0]; S.pz = START[1]; S.pdir2 = Math.PI;
      c.scene.fog.color.set(0x141c2e); c.scene.fog.near = 30; c.scene.fog.far = 170; c.hemi.intensity = 0.5; c.hemi.color.set(0x8aa0d0); c.sun.color.set(0xa8b8e8); c.sun.intensity = 0.55; c.sky.paint(0x0c1428, 0x24304a, 0x6070a0, [0.3, 0.4, -0.5], 0.3); ch.sunOff = [30, 70, -40];
      /* 눈 내린 빈터 */
      st.snow = c.groundFan(c.scene, SNOW[0], SNOW[1], SNOW_R, 0, Math.PI * 2, 0xeef2f8, 0.75);
      /* 순찰 횃불 셋: 사람 + 빛 고리 */
      for (const q of PATROLS) { const m = ppl.mk({ shirt: 0x7a7350, pants: 0x6a6448, hat: 'jcap', torch: true }); const ring = new c.THREE.Mesh(new c.THREE.CircleGeometry(9, 28), new c.THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.22, depthWrite: false })); ring.rotation.x = -Math.PI / 2; c.scene.add(ring); const gl = glowSprite(c.scene, 'rgba(255,210,140,.9)', 'rgba(255,150,60,0)', 6); st.pat.push({ ...q, m, ring, gl, a: Math.random() * 6 }); }
      /* 두 횃불 줄(적 둘): 동쪽 비탈 · 북쪽 골 — 시간이 갈수록 안으로 */
      for (let i = 0; i < 12; i++) st.lines.push({ side: 'E', k: i / 11, gl: glowSprite(c.scene, 'rgba(255,190,110,.95)', 'rgba(255,120,40,0)', 4.5) });
      for (let i = 0; i < 10; i++) st.lines.push({ side: 'N', k: i / 9, gl: glowSprite(c.scene, 'rgba(255,190,110,.95)', 'rgba(255,120,40,0)', 4.5) });
      /* 홍범도 부대 야영지 */
      c.putArt('cs_fire', CAMP[0], CAMP[1]); for (let i = 0; i < 5; i++) { const a = i * 1.25; c.putArt('cs_tent', CAMP[0] + Math.cos(a) * 9, CAMP[1] + Math.sin(a) * 7, a + Math.PI); }
      dressCamp(c.putArt, CAMP[0], CAMP[1], { r: 8, seed: 4, n: 3, keep: (x, z) => dist(x, z, CAMP[0] - 1, CAMP[1] + 6) > 3 && dist(x, z, CAMP[0] + 2.2, CAMP[1] + 1.6) > 2.5 });
      P.hong = ppl.cast('hong', CAMP[0] + 2, CAMP[1] - 2.4, Math.PI); P.baek = ppl.cast('baek', CAMP[0] - 5, CAMP[1] + 4.5, 2.4); P.hong.look = P.baek.look = 'me';
      for (let i = 0; i < 24; i++) { const a = i * 0.7, rr = 5 + (i % 3) * 2, x = CAMP[0] + Math.cos(a) * rr, z = CAMP[1] + Math.sin(a) * rr; st.line.push({ u: army.iaS[i % 3].add({ x, z, ry: Math.atan2(CAMP[0] - x, CAMP[1] - z) }), x, z, i, lost: false }); }
      pad('camp', CAMP[0] - 1, CAMP[1] + 6, 0xffcf4d, 2.2); pad('fire', CAMP[0] + 2.2, CAMP[1] + 1.6, 0xffa040, 1.6); for (const g of GAPS) pad('gap_' + g.id, g.at[0], g.at[1], 0x7ab8f0, 2.4); pad('ridge', RIDGE[0], RIDGE[1], 0xffcf4d, 3.4);
      for (const g of GAPS) c.addTarget({ id: 'gap_' + g.id, x: g.at[0], y: H(g.at[0], g.at[1]) + 2, z: g.at[1], range: 90, need: 0.6, labelY: 3, off: () => st.ph !== 'ask', label: () => (st.gapSeen[g.id] ? `틈 — ${g.name}<small>${g.note} · ${Math.max(0, Math.round(ch.closeIn(g)))}초</small>` : '틈?'), line: () => `↔ ${g.name}`, onSeen: () => { st.gapSeen[g.id] = 1; } });
      setTimeout(() => cmd('김좌진 사령관', '이 전갈을 홍범도 장군께. 「어랑촌 쪽에서 만납시다.」', 4.6), 1200);
    },
    closeIn(g) { return st.arrT == null ? g.close : g.close - (st.foot ? 20 : 0) - (st.t - st.arrT); },
    timeK() { return st.arrT == null ? clamp(1 - st.t / st.len, 0, 1) : clamp(ch.closeIn(GAPS[2]) / 210, 0, 1); },
    update(dt) {
      st.t += dt; const tm = document.getElementById('time').firstChild, lab = st.arrT == null ? '10월 21일 밤 · 전갈 ' : '틈이 닫히기까지 '; if (tm.textContent !== lab) tm.textContent = lab;
      const py = H(S.px, S.pz);
      /* 순찰 횃불 */
      for (const q of st.pat) { q.a += q.sp * dt; const x = q.c[0] + Math.cos(q.a) * q.r, z = q.c[1] + Math.sin(q.a) * q.r, y = H(x, z); q.x = x; q.z = z; q.m.position.set(x, y, z); q.m.rotation.y = Math.atan2(-Math.sin(q.a) * Math.sign(q.sp), Math.cos(q.a) * Math.sign(q.sp)); ppl.walkAnim(q.m, S.t * 9, true); q.ring.position.set(x, y + 0.35, z); q.gl.position.set(x + 0.4, y + 2.6, z); q.ring.visible = q.gl.visible = q.m.visible = st.ph === 'go' || st.ph === 'ask'; }
      /* 두 횃불 줄이 조인다 */
      const squeeze = st.arrT == null ? 0 : clamp((st.t - st.arrT) / 210, 0, 1), conv = st.ph === 'over' ? clamp(st.overT / 6, 0, 1) : 0;
      for (const L of st.lines) { let x, z; if (L.side === 'E') { x = lerp(lerp(482, 462, squeeze), CAMP[0] + 8, conv); z = lerp(52, 142, L.k); } else { x = lerp(398, 470, L.k); z = lerp(lerp(30, 50, squeeze), CAMP[1] - 8, conv); } const y = H(x, z); L.gl.position.set(x, y + 2.2 + Math.sin(S.t * 3 + L.k * 9) * 0.1, z); if (st.ph === 'over' && Math.random() < dt * 1.5) { fx.flash(x, y + 1.4, z, 1.4); if (Math.random() < 0.3) SFX.shot(0.35); } }
      if (st.ph === 'go') ch.go(dt, py); else if (st.ph === 'ask') ch.ask(dt); else if (st.ph === 'lead') ch.lead(dt); else if (st.ph === 'over') ch.over(dt);
      /* 고리 */
      pads.camp.m.visible = st.ph === 'go' || (st.ph === 'ask' && Object.keys(st.gapSeen).length > 0); pads.fire.m.visible = (st.ph === 'ask' || st.ph === 'lead') && !st.fireLeft && dist(S.px, S.pz, CAMP[0], CAMP[1]) < 30; for (const g of GAPS) pads['gap_' + g.id].m.visible = false; pads.ridge.m.visible = st.ph === 'lead';
    },
    /* ───── 밤 숲 건너기 ───── */
    go(dt, py) { S.detOn = true; let lit = false; for (const q of st.pat) if (dist(S.px, S.pz, q.x, q.z) < 9) lit = true;
      if (lit) S.det += (S.crouch ? 0 : S.moving ? 70 : 40) * dt; else S.det = Math.max(0, S.det - 6 * dt); S.det = clamp(S.det, 0, 100); S.tension = clamp(S.det / 80 + (lit ? 0.3 : 0), 0, 1);
      if (lit && !S.crouch) say('횃불 빛 안이다 — 엎드려(C)!', 'lit', 2); if (lit && S.crouch) say('엎드려 있으면 빛이 스쳐도 안 들킨다', 'litc', 2.4);
      if (!st.foot && dist(S.px, S.pz, SNOW[0], SNOW[1]) < SNOW_R) { st.foot = true; say('눈 내린 빈터 — 발자국이 남는다! 뒤에 순찰이 따라올 수 있다', null, 3.4); for (let i = 0; i < 10; i++) c.groundRing(c.scene, SNOW[0] + (Math.random() - 0.5) * 14, SNOW[1] + (Math.random() - 0.5) * 14, 0.01, 0.22, 0x5a6070, 0.7, 7); }
      if (S.det >= 100 && !st.caught) { st.caught = true; S.det = 0; band('net', 4, '순찰에 들켰다'); say('들켰다! 쫓기며 돌아서 가느라 전갈이 늦는다', null, 3.6); SFX.bad(); st.lateMsg = true; }
      if (st.t >= st.len) ch.finish('late'); },
    arrive() { st.ph = 'ask'; st.arrT = st.t; S.detOn = false; S.det = 0; SFX.good(); ppl.talk(P.baek, '발소리가 아직 크구먼.', 3); S.tags.msgOk = st.lateMsg ? 0 : 1;
      setTimeout(() => { ppl.talk(P.hong, '전갈은 받았네. 양쪽에서 죄어 온다 — 틈이 어디냐?', 4.4); cmd('홍범도', '틈이 어디냐?', 3.4); }, 1600);
      if (st.foot) setTimeout(() => say('발자국을 따라 순찰이 온다 — 틈이 더 빨리 닫힌다', null, 3.4), 4200); },
    ask(dt) { if (st.askCool > 0) st.askCool -= dt; if (GAPS.every((g) => ch.closeIn(g) <= 0)) ch.finish('closed'); },
    pickGap(g) { st.gap = g; st.ph = 'lead'; st.wpI = 0; st.trail = [[CAMP[0], CAMP[1]], [S.px, S.pz]]; st.leadT = 0; if (g.id === 'water') band('hunger', 8, '물길 — 춥고 배고프다'); SFX.page(); say('줄이 따라온다 — 뛰면 줄이 끊긴다. 걷고, 멈추고, 엎드리기', null, 3.6); ppl.talk(P.hong, '앞장서게. 우리가 따라가겠네.', 3);
      if (g.patrol) { const m = ppl.mk({ shirt: 0x7a7350, pants: 0x6a6448, hat: 'jcap', torch: true }); const ring = new c.THREE.Mesh(new c.THREE.CircleGeometry(9, 28), new c.THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.22, depthWrite: false })); ring.rotation.x = -Math.PI / 2; c.scene.add(ring); st.gp = { m, ring, t: 0 }; }
      P.hong.tx = CAMP[0]; P.hong.tz = CAMP[1]; },
    /* ───── 줄 이끌기 ───── */
    lead(dt) { st.leadT += dt; const tr = st.trail, last = tr[tr.length - 1]; if (dist(S.px, S.pz, last[0], last[1]) > 0.6) tr.push([S.px, S.pz]);
      /* 줄의 머리는 걸음 4.6 m/s 까지만 — 뛰면 늘어진다. 엎드리면 줄도 멈춘다 */
      const hi = Math.floor(st.headI || 0), h0p = tr[hi] || tr[0], h1p = tr[Math.min(tr.length - 1, hi + 1)] || h0p, gr = Math.max(0, (H(h1p[0], h1p[1]) - H(h0p[0], h0p[1])) / 0.6), sp = S.crouch ? 0 : 3.4 / (1 + gr * 1.3); st.headI = Math.min(tr.length - 1, (st.headI || 0) + (sp * dt) / 0.6);   /* 줄도 오르막에서 느려진다 */
      const atEnd = st.headI >= tr.length - 1.5; st.spc = lerp(st.spc || 3.6, atEnd && !S.moving ? 1.0 : 3.6, Math.min(1, dt * 0.8)); const live = st.line.filter((m) => !m.lost); live.forEach((m, k) => { const idx = Math.max(0, Math.round(st.headI - k * st.spc)); const p = tr[idx] || tr[0]; const d = dist(m.x, m.z, p[0], p[1]); if (d > 0.1) { m.u.ry = Math.atan2(p[0] - m.x, p[1] - m.z); } m.x = p[0]; m.z = p[1]; m.u.x = m.x; m.u.z = m.z; m.u.bob = sp && d > 0.1 ? Math.abs(Math.sin(S.t * 10 + k)) * 0.08 : 0; m.u.pitch = S.crouch ? 1.2 : 0; });
      for (const k of ['hong', 'baek']) { const q = P[k], idx = Math.max(0, Math.round(st.headI - (k === 'hong' ? 1 : live.length * st.spc))); const p = tr[idx] || tr[0]; q.tx = p[0]; q.tz = p[1]; q.speed = 6; q.pose = S.crouch ? 'prone' : 'stand'; }
      const head = tr[Math.round(st.headI)] || tr[0], gapD = dist(S.px, S.pz, head[0], head[1]); S.tension = clamp(gapD / 26, 0, 1);
      if (gapD > 12) say('줄이 늘어진다 — 천천히! 멈춰서 기다리면 줄이 따라온다', 'stretch', 2.4); if (gapD > 20) st.brokeT += dt; else st.brokeT = 0;
      if (st.brokeT > 1.5 && !st.broke) { st.broke = true; const n = 8; live.slice(-n).forEach((m) => { m.lost = true; m.u.on = false; }); st.lost += n; band('troop', 0, ''); say('줄이 끊겼다! 꼬리 여덟이 어둠 속에 처졌다', null, 3.6); SFX.bad(); }
      /* 틈이 닫힌다: 닫힐 때 틈을 못 지난 사람은 처진다 */
      const g = st.gap, left = ch.closeIn(g); if (left <= 0 && !st.closedHit) { st.closedHit = true; let n = 0; for (const m of live) { if (!m.lost && dist(m.x, m.z, g.at[0], g.at[1]) < 60 && ch.behindGap(m)) { m.lost = true; m.u.on = false; n++; } } if (n) { st.lost += n; say(`틈이 닫혔다 — ${n}명이 못 빠져나왔다`, null, 3.4); SFX.bad(); } }
      /* 좁은 틈: 횃불이 가로지른다 — 빛 안에서 움직이면 들킨다 */
      if (st.gp) { const q = st.gp; q.t += dt; const pa = g.patrol, k = (Math.sin(q.t * 0.18 * Math.PI) + 1) / 2, x = lerp(pa.a[0], pa.b[0], k), z = lerp(pa.a[1], pa.b[1], k), y = H(x, z); q.m.position.set(x, y, z); q.m.rotation.y = Math.cos(q.t * 0.18 * Math.PI) > 0 ? -Math.PI / 2 : Math.PI / 2; ppl.walkAnim(q.m, S.t * 9, true); q.ring.position.set(x, y + 0.35, z);
        const near = [[S.px, S.pz], ...live.slice(0, 4).map((m) => [m.x, m.z])].some((p) => dist(p[0], p[1], x, z) < 9); S.detOn = true; if (near && !S.crouch) st.det2 += 45 * dt; else st.det2 = Math.max(0, st.det2 - 8 * dt); S.det = clamp(st.det2, 0, 100); if (near && !S.crouch) say('횃불이 지나간다 — 멈추고 엎드려!', 'gp', 2);
        if (st.det2 >= 100 && !st.gpHit) { st.gpHit = true; S.det = 0; st.det2 = 0; const n = 6; live.slice(-n).forEach((m) => { m.lost = true; m.u.on = false; }); st.lost += n; band('net', 4, '좁은 틈에서 들켰다'); say('들켰다 — 총소리! 뒤쪽 여섯이 흩어졌다', null, 3.4); SFX.volley(0.6); } }
      /* 능선에 다 닿으면 */
      const alive = st.line.filter((m) => !m.lost); if (dist(S.px, S.pz, RIDGE[0], RIDGE[1]) < 4 && alive.every((m) => dist(m.x, m.z, RIDGE[0], RIDGE[1]) < 30)) ch.toOver(); },
    behindGap(m) { const g = st.gap, w = g.way, a = CAMP, b = g.at; const ax = b[0] - a[0], az = b[1] - a[1]; return ((m.x - b[0]) * ax + (m.z - b[1]) * az) < 0; },
    toOver() { st.ph = 'over'; st.overT = 0; S.detOn = false; S.tension = 0.4; c.SFX.drum(0.4); say('능선 위 — 발아래에서 두 횃불 줄이 빈 야영지를 향해 서로 다가간다…', null, 4.4); if (st.gp) { st.gp.m.visible = false; st.gp.ring.visible = false; } S.yawT = Math.PI * 0.75; },
    over(dt) { st.overT += dt; if (st.overT > 3 && !st.said1) { st.said1 = true; SFX.volley(0.8); ppl.talk(P.baek, '총알 아꼈구먼.', 3.6); } if (st.overT > 9) ch.finish('out'); },
    cine() { if (st.ph !== 'over') return null; return { pos: [RIDGE[0] - 6, H(RIDGE[0], RIDGE[1]) + 34, RIDGE[1] - 4], look: [CAMP[0] + 6, H(CAMP[0], CAMP[1]) + 2, CAMP[1] + 4], fov: 46 }; },
    signal() { return false; },
    job() { const at = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      if (at('camp') && st.ph === 'go') return { key: 'camp', need: 1.0, label: '전갈 전하기', fn: () => ch.arrive() };
      if (at('camp') && st.ph === 'ask' && !c.choosing() && !(st.askCool > 0)) return { key: 'ask', need: 0.8, label: '틈을 알리기', fn: () => { st.askCool = 3; const gs = GAPS.filter((g) => st.gapSeen[g.id] && ch.closeIn(g) > 0); choose('어느 틈으로 이끌까?', [...gs.map((g) => ({ t: g.name, s: `${g.note} · ${Math.round(ch.closeIn(g))}초 뒤 닫힘`, fn: () => ch.pickGap(g) })), { t: '더 살펴보겠습니다', s: '틈을 더 본다', fn: () => {} }]); } };
      if (at('fire')) return { key: 'fire', need: 6, label: '모닥불에 장작 넣기(그대로 두고 간다)', fn: () => { st.fireLeft = true; SFX.good(); say('모닥불을 살려 두었다 — 적이 더 오래 속는다', null, 3); } };
      for (const g of GAPS) if (at('gap_' + g.id)) return { key: 'gap' + g.id, need: 1.0, label: `${g.name}으로 이끌기`, fn: () => ch.pickGap(g) };
      return null; },
    tasks() { const L = [], ph = st.ph, ns = Object.keys(st.gapSeen).length;
      L.push({ id: 'carry', req: true, t: '밤 숲을 건너 홍범도 부대에 전갈', how: '횃불 빛 고리 안에서는 <kbd>C</kbd> 엎드리기 · 눈 내린 빈터는 질러가면 발자국이 남는다', done: () => ph !== 'go', at: () => [pads.camp.x, pads.camp.z], tag: '🔥 홍범도 부대' });
      L.push({ id: 'gaps', req: true, t: '「틈이 어디냐?」 — 틈 셋 살피기', n: () => [ns, 3], how: '야영지 둘레에서 <kbd>Space</kbd> 꾹 — 두 횃불 줄 사이를 망원경 가운데에', done: () => ns >= 3 || ph === 'lead' || ph === 'over', can: () => ph === 'ask', at: () => [CAMP[0] - 4, CAMP[1] - 8], tag: '🔭 틈 살피기', wait: ph === 'go' });
      L.push({ id: 'pick', req: true, t: '틈 하나를 골라 앞장서기', how: () => GAPS.filter((g) => st.gapSeen[g.id]).map((g) => `${g.name} ${Math.max(0, Math.round(ch.closeIn(g)))}초`).join(' · ') || '먼저 틈을 살피자', done: () => ph === 'lead' || ph === 'over', can: () => ph === 'ask' && ns > 0, at: () => [pads.camp.x, pads.camp.z], tag: '홍범도 — 틈 알리기', wait: ph === 'go' });
      L.push({ id: 'lead', req: true, t: '줄을 이끌고 북서쪽 능선까지', how: '<b>걷기</b>(뛰면 줄이 끊긴다) · 횃불이 지나가면 멈추고 <kbd>C</kbd> · 줄이 다 따라와야 한다', done: () => ph === 'over', can: () => ph === 'lead', at: () => { if (!st.gap) return RIDGE; const w = st.gap.way; while (st.wpI < w.length - 1 && dist(S.px, S.pz, w[st.wpI][0], w[st.wpI][1]) < 5) st.wpI++; return w[st.wpI]; }, tag: () => (st.gap && st.wpI < st.gap.way.length - 1 ? '↔ 틈' : '⛰ 능선'), wait: ph !== 'lead' });
      if ((ph === 'ask' || ph === 'lead') && !st.fireLeft && dist(S.px, S.pz, CAMP[0], CAMP[1]) < 30) L.push({ id: 'fire', t: '모닥불을 살려 두고 가기(6초)', how: '불 곁 주황 고리 — 적이 더 오래 속는다', done: () => st.fireLeft, at: () => [pads.fire.x, pads.fire.z], tag: '🔥' });
      return L; },
    tags(put) { if (st.ph === 'go') for (const q of st.pat) if (dist(S.px, S.pz, q.x, q.z) < 50) put(q.x, H(q.x, q.z) + 3, q.z, '횃불', 'hot');
      if (st.ph === 'lead') { const live = st.line.filter((m) => !m.lost), tail = live[live.length - 1]; if (tail) put(tail.x, H(tail.x, tail.z) + 2.6, tail.z, `줄 꼬리 (${live.length}명)`, ''); if (st.gap) put(st.gap.at[0], H(st.gap.at[0], st.gap.at[1]) + 3, st.gap.at[1], `틈 — ${Math.max(0, Math.round(ch.closeIn(st.gap)))}초`, ch.closeIn(st.gap) < 20 ? 'hot' : 'good'); }
      if (st.ph === 'ask') for (const g of GAPS) if (st.gapSeen[g.id]) put(g.at[0], H(g.at[0], g.at[1]) + 3, g.at[1], `${g.name}<small>${Math.max(0, Math.round(ch.closeIn(g)))}초 뒤 닫힘</small>`, ch.closeIn(g) < 25 ? 'hot' : 'good'); },
    mini(g, k) { g.fillStyle = '#ffcf4d'; g.beginPath(); g.arc(CAMP[0] * k, CAMP[1] * k, 4, 0, 6.28); g.fill(); for (const L of st.lines) { g.fillStyle = '#ff8a3a'; g.fillRect(L.gl.position.x * k - 1, L.gl.position.z * k - 1, 2, 2); } },
    finish(why) { if (st.done) return; st.done = true; S.tension = 0; S.detOn = false; closeChoice();
      const out = why === 'out', alive = st.line.filter((m) => !m.lost).length, pow = !out ? 40 : alive >= 22 ? 100 : alive >= 14 ? 70 : 40;
      if (why === 'late') S.tags.msgOk = 0; S.tags.hongPow = pow; if (st.fireLeft && out) band('net', -4, '살려 둔 모닥불에 적이 오래 속았다');
      const head = why === 'late' ? '전갈이 닿지 않았다' : why === 'closed' ? '틈이 다 닫혔다' : alive >= 22 ? '모두 빠져나왔다' : '꼬리를 잃었다';
      c.endChapter({ b0: ch.b0, head,
        marks: [{ t: '전갈', ok: S.tags.msgOk === 1 }, { t: '발자국 안 남김', ok: !st.foot }, { t: `빠져나온 사람 ${alive}/24`, ok: alive >= 22 }, { t: '모닥불', ok: st.fireLeft }, { t: '줄 안 끊김', ok: !st.broke }],
        lines: [why === 'late' ? '날이 새도록 홍범도 부대에 닿지 못했다' : st.lateMsg ? '순찰에 들켜 돌아가느라 전갈이 늦었다 — 어랑촌에서 홍범도 부대가 늦을 수 있다' : '전갈을 제때 전했다 — 「어랑촌 쪽에서 만납시다」',
          ...(st.foot ? ['눈 내린 빈터에 발자국을 남겨 틈이 20초 빨리 닫혔다'] : []), ...(st.gap ? [`${st.gap.name}으로 이끌었다`] : []), ...(st.broke ? ['뛰다가 줄이 끊겼다'] : []), ...(st.lost ? [`${st.lost}명이 처졌다 — 홍범도 부대의 힘이 ${pow}으로 줄었다`] : out ? ['홍범도 부대가 다 빠져나왔다'] : []),
          ...(out ? ['능선에서 내려다보니 두 횃불 줄이 서로를 향해 총을 쏘았다'] : [])],
        hist: '실제: 10월 21일 밤 무렵, 홍범도의 부대는 완루구에서 일본군에게 에워싸였으나 포위를 빠져나오며 일본군 부대끼리 서로 공격하게 만들었다. 이튿날 어랑촌 싸움에서 북로 군정서와 함께 싸웠다.<br><small>빛 고리·발자국·틈 고르기·백 포수는 놀이로 꾸민 것이다.</small>' }); },
    b0: { ...S.band } };
  return ch;
}
