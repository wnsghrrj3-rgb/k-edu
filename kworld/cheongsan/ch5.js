/* 장 5 · 셋째~넷째 날 「쫓기는 길」 (1920년 10월 23~24일) — 설계 v2 ④ 장 5 (차례 4)
   꼴: 지도 판(strat.js) — 고동하를 따라 마디 열 개, 마디마다 큰길·능선·물길 가운데 하나. 적 다섯 갈래가 포위망 띠만큼 다가온다.
   사이 장면(마디 3·5·7·9 가운데 판마다 셋): 뒤를 맡을 조(맹개골) · 거짓 불(만기구) · 마을(쉬구) · 맞닥뜨림(천보산 아래). 가운데에 밤(23일) 한 번.
   지는 길: 포위망 100 · 부대 0. 넘기는 값: 마을흔적 쉬구. 큰길만 = 포위망이 닫힌다 · 능선만 = 배고픔에 부대가 샌다 · 섞기+거짓 불+마을 = 포위망 70 안쪽.
   거짓 불·지름길·길 고르기는 놀이 장치(기록에 없다) — 역사 줄에 쓰지 않는다. */
import { clamp, dist, lerp, rng } from '../scene/kit.js';
import { makeStrat, NODES, NODE_NAME, ROUTES } from './strat.js';
import { mapImage } from './map.js';
let HI = null;

const EV_ALL = [{ node: 3, k: 'rear', icon: '🛡', name: '뒤를 맡을 조' }, { node: 5, k: 'fire', icon: '🔥', name: '거짓 불' }, { node: 7, k: 'village', icon: '🏠', name: '마을' }, { node: 9, k: 'meet', icon: '⚠', name: '맞닥뜨림' }];
const BR = [{ k: 'chase', name: '뒤쫓는 갈래', from: [640, 230] }, { k: 'big', name: '큰 갈래', from: [600, 210] }, { k: 'north', name: '북쪽 갈래', from: [300, 210] }, { k: 'cav', name: '기병', from: [520, 380] }, { k: 'south', name: '남쪽 갈래', from: [160, 390] }];
export const K5 = { NODES, EV_ALL };

export default function ch5(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, fx, choose, closeChoice, SFX, H } = c;
  const r0 = rng((c.SEED || 1920) * 3 + 7), drop = Math.floor(r0() * 4);
  const events = {}; EV_ALL.forEach((e, i) => { if (i !== drop || S.tags.allEvents) events[e.node] = { ...e, done: false }; });
  const st = { mode: 'map', at: 0, taken: [], events, branches: BR.map((b) => ({ ...b })), seen: {}, lure: 0, slow: 0, shortcut: false, nightDone: false, trace: null, walk: null, log: [], fireDet: false, rearN: 0, ate: false, done: false };
  for (const b of st.branches) if (S.tags['seen_' + b.k]) st.seen[b.k] = 1;
  if (!HI) HI = mapImage(1.2); const strat = makeStrat(HI, { onPick: (o) => o.fn() });
  const P = {}, padOn = (...a) => { const q = pad(...a); q.m.visible = true; return q; };
  const ch = {
    id: 5, title: '쫓기는 길', when: '1920년 10월 23일', place: '고동하', len: 1, region: [0, 230, 600, 380], zones: ['godong', 'ando'], yaw: -Math.PI / 2,
    goal: '포위망이 닫히기 전에 고동하를 따라 안도 쪽으로', idle: '길을 고른다', K: K5, sameDay: false,
    get st() { return st; }, strat,
    start() { S.px = NODES[0][0]; S.pz = NODES[0][1]; S.frozen = true; ch.mapTurn('어랑촌을 빠져나왔다 — 고동하를 따라 남서쪽으로'); setTimeout(() => cmd('김좌진 사령관', '흩어지지 말고 고동하를 따라 간다.', 4), 600); },
    dispose() { strat.hide(); document.getElementById('strat')?.remove(); document.getElementById('stratUi')?.remove(); S.frozen = false; },
    timeK() { return clamp(1 - st.at / 10, 0, 1); },
    view() { return st.mode === 'map'; },
    /* ───── 지도 판 ───── */
    state() { return { at: st.at, taken: st.taken, events: Object.fromEntries(Object.entries(st.events).filter(([, e]) => !e.done)), branches: st.branches, seen: st.seen, net: S.band.net }; },
    mapTurn(msg) { st.mode = 'map'; S.frozen = true; S.detOn = false; const i = st.at;
      if (i >= NODES.length - 1) return ch.finish('out');
      const ev = st.events[i]; if (ev && !ev.done) return ch.startWalk(ev);
      if (i >= 5 && !st.nightDone) return ch.night();
      const opts = Object.entries(ROUTES).map(([k, r]) => ({ t: `${r.icon} ${r.name}`, s: r.note + (k === 'ridge' ? '' : ''), fn: () => ch.go(k) }));
      if (st.shortcut && i < NODES.length - 2) opts.push({ t: '🧒 소년이 알려 준 지름길', s: '마디 하나를 건너뛴다', fn: () => ch.go('river', true) });
      strat.show(ch.state(), opts, msg || `${NODE_NAME[i]} — 다음 길을 고르자 (마디 ${i}/10 · 포위망 ${Math.round(S.band.net)})`); },
    go(kind, skip) { const R = ROUTES[kind], from = NODES[st.at], to2 = skip ? st.at + 2 : st.at + 1; if (skip) st.shortcut = false;
      let dn = R.net + (st.lure > 0 ? -4 : 0) + (st.slow > 0 ? -2 : 0); if (st.lure > 0) st.lure--; if (st.slow > 0) st.slow--; if (st.lure === 0) st.branches.forEach((b) => (b.lured = false));
      band('net', dn, R.name); band('hunger', R.hunger, R.name); if (R.troop) band('troop', R.troop, '물길 — 추위');
      if (S.band.hunger > 80) band('troop', -2, '배고픔 — 지친 사람을 뒤로 보냈다');
      if (kind === 'ridge') { const un = st.branches.filter((b) => !st.seen[b.k]).slice(0, 2); for (const b of un) { st.seen[b.k] = 1; S.tags['seen_' + b.k] = 1; } }
      st.taken[st.at] = kind; if (skip) st.taken[st.at + 1] = kind; st.log.push(kind + (skip ? '+' : ''));
      SFX.page(); strat.show(ch.state(), [], `${R.icon} ${R.name}으로 간다…`);
      strat.march(from, NODES[Math.min(to2, NODES.length - 1)], kind, 2.0, () => { st.at = Math.min(to2, NODES.length - 1); if (S.band.net >= 100) return ch.finish('net'); if (S.band.troop <= 0) return ch.finish('wiped'); ch.mapTurn(); }); },
    night() { st.nightDone = true; band('hunger', 22, '하루가 갔다'); band('net', 12, '하루가 갔다'); const seenN = Object.keys(st.seen).length;
      strat.show(ch.state(), [
        { t: '💧 내일은 물길로', s: '발자국을 지운다 — 포위망 −6 · 부대 −2', fn: () => { band('net', -6, '물길로 발자국을 지움'); band('troop', -2, '추위'); ch.mapTurn('🌙 23일 밤이 지났다'); } },
        { t: '⛰ 내일은 능선으로', s: seenN >= 3 ? '살핀 갈래가 많다 — 남은 적 갈래를 다 본다 · 배고픔 +5' : '멀리 살핀다 · 배고픔 +5', fn: () => { for (const b of st.branches) { st.seen[b.k] = 1; S.tags['seen_' + b.k] = 1; } band('hunger', 5, '능선'); ch.mapTurn('🌙 23일 밤이 지났다'); } },
        { t: '🛤 서두르자', s: '마디 하나를 앞당긴다 — 포위망 +8', fn: () => { band('net', 8, '서둘러 큰길로'); st.at = Math.min(st.at + 1, NODES.length - 1); st.taken[st.at - 1] = 'road'; ch.mapTurn('🌙 23일 밤이 지났다 — 서둘러 한 마디 더 왔다'); } }],
        `🌙 23일 밤 — 위생병 「오늘은 ${Math.max(1, Math.round((100 - S.band.troop) / 6))}명 뒤로 보냈소」 · 솥단지 「${S.band.hunger > 60 ? '쌀이 바닥이오…' : '아직 버틸 만하오'}」 — 내일은?`); },
    /* ───── 사이 장면(걷는 장면) ───── */
    startWalk(ev) { strat.hide(); st.mode = 'walk'; S.frozen = false; const nx = NODES[ev.node][0], nz = NODES[ev.node][1] - 14; st.walk = { ev, t: 0, rings: {}, done: false, units: [], props: [] };
      S.px = nx; S.pz = nz + 4; S.view = 0; S.yaw = S.yawT = -Math.PI / 2; card(ev); ch['w_' + ev.k + '_start'](nx, nz); padOn('leave', nx - 14, nz + 2, 0xffffff, 2.2); },
    endWalk(msg) { const w = st.walk; if (!w || w.done) return; w.done = true; w.ev.done = true; S.detOn = false; closeChoice(); for (const p of w.props) c.scene.remove(p); for (const u of w.units) u.on = false; for (const k in pads) pads[k].m.visible = false; if (P.boy) P.boy.m.visible = false; ch.mapTurn(msg); },
    /* 맹개골: 뒤를 맡을 조 */
    w_rear_start(nx, nz) { const w = st.walk; for (let i = 0; i < 10; i++) w.units.push(army.iaS[i % 3].add({ x: nx - 4 + (i % 5) * 1.8, z: nz + 6 + Math.floor(i / 5) * 2, ry: Math.PI / 2 }));
      w.rocks = [[nx + 10, nz - 6], [nx + 13, nz + 4], [nx + 9, nz + 12]]; w.rocks.forEach((p, i) => { const m = c.putArt('cs_boulder', p[0] + 1.6, p[1], i, 0.8); if (m) w.props.push(m); });
      choose('좁은 목 — 뒤를 맡을 조를 남길까?', [{ t: '열 명 남긴다', s: '포위망 −18 · 부대 −6', fn: () => ch.rearPick(10) }, { t: '다섯 남긴다', s: '포위망 −10 · 부대 −3', fn: () => ch.rearPick(5) }, { t: '안 남긴다', s: '그대로 간다', fn: () => ch.rearPick(0) }]); },
    rearPick(n) { const w = st.walk; st.rearN = n; if (!n) return ch.endWalk('뒤를 맡을 조를 남기지 않았다'); w.placing = 0; w.limit = 45; w.rocks.forEach((p, i) => padOn('rock' + i, p[0], p[1], 0xffcf4d, 1.8)); say('바위 뒤 세 자리에 조를 놓아 주면 잃는 것이 반이다 — 적이 오기 전에!', null, 3.6); },
    rearDone() { const w = st.walk, all = w.placing >= 3, n = st.rearN; band('net', n === 10 ? -18 : -10, '뒤를 맡을 조'); band('troop', -(n === 10 ? 6 : 3) * (all ? 0.5 : 1), '뒤를 맡은 조가 다쳤다'); st.rearAll = all; ch.endWalk(all ? '조가 바위 뒤에 자리 잡고 뒤쫓는 적을 늦춘다' : '조를 남겼다 — 자리를 다 못 잡아 많이 다쳤다'); },
    /* 만기구: 거짓 불 */
    w_fire_start(nx, nz) { const w = st.walk; w.fires = [[nx - 8, nz + 34], [nx + 4, nz + 40], [nx + 14, nz + 32]]; w.lit = 0; w.fires.forEach((p, i) => padOn('fire' + i, p[0], p[1], 0xffa040, 1.8)); w.back = [nx, nz - 6]; padOn('back', w.back[0], w.back[1], 0xffcf4d, 2.4);
      say('반대쪽 골짜기에 모닥불 셋을 피우고 돌아오자 — 한 갈래가 엉뚱한 데로 간다', null, 4); },
    fireLit(i) { const w = st.walk, p = w.fires[i]; w.lit++; const m = c.putArt('cs_fire', p[0], p[1]); if (m) w.props.push(m); const sm = c.smokeColumn(c.scene, p[0], p[1], { h: 40, w: 4, n: 8 }); w.smokes = (w.smokes || []).concat(sm); SFX.page();
      if (w.lit === 2 && !w.patrol) { const nx = NODES[w.ev.node][0], nz = NODES[w.ev.node][1] - 14; w.patrol = army.column({ n: 6, p: c.path([[nx + 70, nz + 4], [nx - 70, nz + 4]]), files: 2, gap: 2.6, speed: 1.9, s0: 0, name: '수색조', seed: 3 }); S.detOn = true; S.det = 0; say('수색조가 물가 길을 지난다 — 엎드려 넘기자(C)', null, 3.6); } },
    /* 쉬구: 마을 */
    w_village_start(nx, nz) { const w = st.walk; for (const [dx, dz, ry] of [[-10, -12, 0.2], [4, -14, -0.1], [14, -8, 0.3], [-4, 8, 3.1]]) { const m = c.putArt('cs_loghouse', nx + dx, nz + dz, ry); if (m) w.props.push(m); }
      for (const nm of [['cs_woodpile', -13, -9], ['cs_haystack', 9, -17], ['cs_well', 0, -6], ['cs_haystack', -8, 11], ['cs_cart', 10, 7]]) { const m = c.putArt(nm[0], nx + nm[1], nz + nm[2], Math.random() * 3); if (m) w.props.push(m); }
      padOn('eat', nx - 9, nz - 8, 0x8ad08a, 1.7); padOn('news', nx + 5, nz - 10, 0xffcf4d, 1.7); P.boy = ppl.cast('boy', nx + 14, nz - 4, -1); P.boy.look = 'me'; padOn('boy', nx + 13, nz - 2.4, 0x7ab8f0, 1.6); padOn('sw0', nx - 2, nz + 2, 0xd8c8a0, 1.6); padOn('sw1', nx + 7, nz + 3, 0xd8c8a0, 1.6);
      w.sw = {}; say('쉬구 마을 — 밥과 소식을 얻을 수 있다. 떠날 때 흔적을 지우자', null, 3.6); },
    /* 천보산 아래: 맞닥뜨림 */
    w_meet_start(nx, nz) { const w = st.walk; c.scene.fog.near = 12; c.scene.fog.far = 70; w.fog = true; for (const p of [[nx + 3, nz + 6], [nx - 5, nz + 8], [nx + 9, nz - 4]]) { const m = c.putArt('cs_rocks', p[0], p[1], Math.random() * 3); if (m) w.props.push(m); }
      w.patrol = army.column({ n: 8, p: c.path([[nx - 60, nz - 2], [nx + 70, nz - 2]]), files: 2, gap: 2.6, speed: 0, s0: 30, name: '수색대', seed: 9 });
      choose('안개 속 — 수색대가 서른 걸음 앞!', [{ t: '엎드려 넘긴다', s: '들키면 맞붙는다', fn: () => { w.hide = true; w.patrol.speed = 1.3; S.detOn = true; S.det = 0; ch.setCrouchSay(); } }, { t: '싸운다', s: '탄약 −8 · 포위망 +6 · 적 한 갈래가 느려진다', fn: () => ch.meetFight(false) }]); },
    setCrouchSay() { say('C 로 엎드려 바위 곁에 가만히 — 수색대가 지나갈 때까지', null, 3.6); },
    meetFight(caught) { const w = st.walk; w.fight = 0; S.detOn = false; band('ammo', -8, '맞닥뜨림'); band('net', 6, '총소리가 퍼졌다'); st.slow = 2; if (caught) band('troop', -4, '들켜서 맞붙었다'); SFX.volley(1); w.patrol.halt = 999; w.patrol.men.forEach((m, i) => { m.fallAt = 1 + i * 0.7; }); say(caught ? '들켰다 — 맞붙는다!' : '먼저 친다!', null, 2.6); },
    update(dt) {
      const tm = document.getElementById('time').firstChild, lab = `10월 ${st.nightDone ? 24 : 23}일 · ${NODE_NAME[st.at]} `; if (tm.textContent !== lab) tm.textContent = lab;
      strat.update(dt); strat.draw(S.t); S.tension = clamp((S.band.net - 50) / 50, 0, 1);
      if (st.mode !== 'walk' || !st.walk || st.walk.done) return; const w = st.walk, ev = w.ev; w.t += dt;
      const atP = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      pads.leave.m.visible = !c.choosing();
      if (ev.k === 'rear' && w.placing != null) { w.limit -= dt; if (w.limit <= 0) ch.rearDone(); }
      if (ev.k === 'fire') { for (const s of w.smokes || []) s.update(dt); const v = w.patrol;
        if (v && !v.gone) { const py = H(S.px, S.pz); let best = 1e9; for (const m of v.men) { if (m.st !== 'walk') continue; const [x, z, , arc] = army.manPos(v, m); if (arc <= 0) continue; const d = dist(x, z, S.px, S.pz); if (d < 24 && d < best && c.losClear(x, H(x, z) + 1.6, z, S.px, py + (S.crouch ? 0.35 : 1.5), S.pz, 3)) best = d; } if (best < 24) S.det += c.exposure() * 32 * (1 - best / 24) * dt; else S.det = Math.max(0, S.det - 5 * dt); S.det = clamp(S.det, 0, 100);
          if (S.det >= 100 && !st.fireDet) { st.fireDet = true; band('net', 8, '수색조에 들켰다'); S.detOn = false; say('수색조에 들켰다 — 서둘러 돌아가자', null, 3); } }
        if (v && v.gone) S.detOn = false; }
      if (ev.k === 'meet' && w.patrol) { const v = w.patrol;
        if (w.hide && w.fight == null) { const py = H(S.px, S.pz); let best = 1e9; for (const m of v.men) { const [x, z, , arc] = army.manPos(v, m); if (arc <= 0) continue; const d = dist(x, z, S.px, S.pz); if (d < 22 && d < best) best = d; } if (best < 22) S.det += c.exposure() * 30 * (1 - best / 22) * dt; else S.det = Math.max(0, S.det - 4 * dt); S.det = clamp(S.det, 0, 100);
          if (S.det >= 100) ch.meetFight(true); else if (army.tailX(v) > NODES[ev.node][0] + 26) { S.detOn = false; w.hide = false; w.passed = true; say('수색대가 지나갔다 — 안개 속으로 빠져나가자', null, 3); } }
        if (w.fight != null) { w.fight += dt; for (const m of v.men) if (m.fallAt && w.fight > m.fallAt && m.st === 'walk') army.fall(m); if (Math.random() < dt * 5 && w.fight < 8) { fx.flash(S.px + (Math.random() - 0.5) * 6, H(S.px, S.pz) + 1, S.pz + (Math.random() - 0.5) * 6, 1.1); SFX.shot(0.5); } if (w.fight > 9) { w.fight = null; w.passed = true; say('수색대를 물리쳤다 — 빠져나가자', null, 2.6); } } }
      if (atP('leave') && !S.moving) { w.leaveT = (w.leaveT || 0) + dt; if (w.leaveT > 1) { if (ev.k === 'rear' && w.placing != null) ch.rearDone(); else if (ev.k === 'village') ch.villageLeave(); else ch.endWalk(ev.k === 'fire' ? (w.lit >= 3 ? '' : '불을 다 피우지 않고 떠났다') : ev.k === 'meet' ? (w.passed ? '안개 속을 빠져나왔다' : '수색대를 피해 돌아갔다') : ''); } } else w.leaveT = 0;
    },
    villageLeave() { const w = st.walk; st.trace = Object.keys(w.sw).length >= 2 ? 0 : 1; S.tags.trace_shigu = st.trace; if (w.fog) {} ch.endWalk(st.trace ? '쉬구에 흔적이 남았다' : '흔적을 지우고 쉬구를 떠났다'); },
    signal() { return false; },
    job() { if (st.mode !== 'walk' || !st.walk || st.walk.done) return null; const w = st.walk, ev = w.ev, at = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      if (ev.k === 'rear' && w.placing != null) for (let i = 0; i < 3; i++) if (at('rock' + i)) return { key: 'rock' + i, need: 1.2, label: '조를 바위 뒤에', fn: () => { pads['rock' + i].m.visible = false; w.placing++; SFX.page(); if (w.placing >= 3) ch.rearDone(); } };
      if (ev.k === 'fire') { for (let i = 0; i < 3; i++) if (at('fire' + i)) return { key: 'fire' + i, need: 2.0, label: '모닥불 피우기', fn: () => { pads['fire' + i].m.visible = false; ch.fireLit(i); } };
        if (at('back') && w.lit >= 3) return { key: 'back', need: 0.8, label: '돌아왔다', fn: () => { st.lure = 2; const b = st.branches.find((q) => q.k === 'south') || st.branches[0]; b.lured = true; st.seen[b.k] = 1; ch.endWalk(st.fireDet ? '거짓 불을 피웠다 — 하지만 수색조에 들켰다' : '거짓 불에 남쪽 갈래가 엉뚱한 골짜기로 간다(두 마디)'); } }; }
      if (ev.k === 'village') { if (at('eat')) return { key: 'eat', need: 1.6, label: '밥 얻기', fn: () => { pads.eat.m.visible = false; st.ate = true; band('hunger', -40, '쉬구에서 얻은 밥'); SFX.good(); } };
        if (at('news')) return { key: 'news', need: 1.4, label: '소식 듣기', fn: () => { pads.news.m.visible = false; const b = st.branches.find((q) => !st.seen[q.k]) || st.branches[4]; st.seen[b.k] = 1; S.tags['seen_' + b.k] = 1; band('net', -3, '소식을 듣고 피할 길을 알았다'); say(`${b.name}이 어디로 가는지 들었다`, null, 3); SFX.good(); } };
        if (at('boy')) return { key: 'boy', need: 1.4, label: '소년에게 길 묻기', fn: () => { pads.boy.m.visible = false; st.shortcut = true; ppl.talk(P.boy, '저 골을 질러가면 하루 길이 줄어요!', 3.6); SFX.good(); } };
        for (let i = 0; i < 2; i++) if (at('sw' + i)) return { key: 'sw' + i, need: 1.4, label: '발자국·불 자리 쓸기', fn: () => { pads['sw' + i].m.visible = false; w.sw[i] = 1; SFX.page(); } }; }
      return null; },
    tasks() { const L = []; if (st.mode === 'map') { L.push({ id: 'map', req: true, t: '지도에서 길 고르기', how: '아래 단추(1·2·3) — 큰길·능선·물길', done: () => false, at: () => null, wait: true }); return L; }
      const w = st.walk; if (!w) return L; const ev = w.ev, leave = { id: 'leave', req: true, t: '다음 길로 떠나기', how: '흰 고리에 가만히', done: () => w.done, at: () => [pads.leave.x, pads.leave.z], tag: '➜ 떠나기' };
      if (ev.k === 'rear') { if (w.placing != null) L.push({ id: 'rocks', req: true, t: '조를 바위 뒤 세 자리에', n: () => [w.placing, 3], how: `노란 고리 · ${Math.ceil(w.limit)}초 안에`, done: () => w.placing >= 3, at: () => { for (let i = 0; i < 3; i++) if (pads['rock' + i].m.visible) return w.rocks[i]; return null; }, tag: '🛡 바위 뒤' }); }
      if (ev.k === 'fire') { L.push({ id: 'fires', req: true, t: '반대쪽 골짜기에 모닥불 셋', n: () => [w.lit, 3], how: '주황 고리에 가만히 — 수색조가 지나가면 C 로 엎드리기', done: () => w.lit >= 3, at: () => { for (let i = 0; i < 3; i++) if (pads['fire' + i].m.visible) return w.fires[i]; return null; }, tag: '🔥 불 피우기' }); L.push({ id: 'back', req: true, t: '돌아오기', how: '물 건너 노란 고리', done: () => w.done, can: () => w.lit >= 3, at: () => w.back, tag: '돌아오기' }); }
      if (ev.k === 'village') { const sw = Object.keys(w.sw).length; L.push({ id: 'sw', req: true, t: '떠나기 전에 흔적 지우기', n: () => [sw, 2], how: '모래빛 고리 둘 — 안 지우면 마을이 뒤에 화를 입을 수 있다', done: () => sw >= 2, at: () => { for (let i = 0; i < 2; i++) if (!w.sw[i]) return [pads['sw' + i].x, pads['sw' + i].z]; return null; }, tag: '🧹 흔적' });
        if (!st.ate) L.push({ id: 'eat', t: '밥 얻기 (배고픔 −40)', how: '초록 고리', done: () => st.ate, at: () => [pads.eat.x, pads.eat.z], tag: '🍚' }); if (pads.news.m.visible) L.push({ id: 'news', t: '소식 듣기(적 한 갈래)', how: '노란 고리', done: () => !pads.news.m.visible, at: () => [pads.news.x, pads.news.z], tag: '📰' }); if (pads.boy.m.visible) L.push({ id: 'boy', t: '소년에게 지름길 묻기', how: '파란 고리', done: () => !pads.boy.m.visible, at: () => [pads.boy.x, pads.boy.z], tag: '🧒' }); }
      if (ev.k === 'meet' && w.hide) L.push({ id: 'hide', req: true, t: '엎드려 수색대 넘기기', how: '<kbd>C</kbd> 엎드려 가만히 — 바위 곁이면 더 좋다', done: () => !!w.passed, at: () => null, wait: true });
      L.splice(L.findIndex((t) => !t.req) < 0 ? L.length : L.findIndex((t) => !t.req), 0, leave); return L; },
    tags(put) { if (st.mode !== 'walk' || !st.walk) return; const w = st.walk; if (w.ev.k === 'fire' && w.patrol && !w.patrol.gone) { const p = army.center(w.patrol); if (p) put(p[0], H(p[0], p[1]) + 3, p[1], '수색조', 'hot'); } if (w.ev.k === 'meet' && w.patrol) { const p = army.center(w.patrol); if (p) put(p[0], H(p[0], p[1]) + 3, p[1], '수색대', 'hot'); } },
    mini(g, k) { NODES.forEach((n, i) => { g.fillStyle = i < st.at ? '#5a4a30' : i === st.at ? '#ffcf4d' : '#fff'; g.beginPath(); g.arc(n[0] * k, n[1] * k, 3, 0, 6.28); g.fill(); }); },
    finish(why) { if (st.done) return; st.done = true; strat.hide(); S.frozen = false; S.tension = 0; const out = why === 'out', cnt = { road: 0, ridge: 0, river: 0 }; for (const t of st.taken) if (t) cnt[t]++;
      if (st.trace == null && st.events[7]) S.tags.trace_shigu = 1; S.tags.escaped5 = out ? 1 : 0;
      const head = why === 'net' ? '골짜기가 닫혔다' : why === 'wiped' ? '더는 싸울 사람이 없다' : S.band.net < 70 ? '포위망을 따돌렸다' : '아슬아슬하게 빠져나왔다';
      c.endChapter({ b0: ch.b0, head, lose: !out,
        marks: [{ t: `포위망 ${Math.round(S.band.net)}`, ok: S.band.net < 70 }, { t: `부대 ${Math.round(S.band.troop)}`, ok: S.band.troop >= 60 }, { t: '거짓 불', ok: st.lure > 0 || (st.events[5] && st.events[5].done && !st.fireDet) }, { t: '쉬구 흔적', ok: st.trace === 0 }, { t: '뒤를 맡은 조', ok: st.rearN > 0 }],
        lines: [`큰길 ${cnt.road} · 능선 ${cnt.ridge} · 물길 ${cnt.river}${st.log.some((x) => x.endsWith('+')) ? ' · 지름길' : ''}`,
          why === 'net' ? '적 갈래들이 사방에서 닿았다 — 골짜기가 닫혔다' : why === 'wiped' ? '배고픔과 추위, 싸움에 부대가 다 흩어졌다' : '고동하를 따라 안도 쪽 숲에 닿았다',
          ...(st.rearN ? [`맹개골에 조 ${st.rearN}명을 남겼다${st.rearAll ? ' — 바위 뒤에 자리 잡아 덜 다쳤다' : ''}`] : []), ...(st.events[5] && st.events[5].done ? [st.lure || st.fireDet ? '만기구에서 거짓 불을 피웠다' : '만기구를 그냥 지났다'] : []),
          ...(st.events[7] ? [st.trace === 0 ? '쉬구에서 흔적을 지우고 떠났다' : '쉬구에 흔적이 남았다'] : []), ...(S.band.hunger > 80 ? ['배고픔이 심해 지친 사람이 늘었다'] : [])],
        hist: '실제: 10월 23~24일, 독립군은 뒤쫓는 일본군 수색대와 작은 싸움을 거듭하며 고동하를 따라 상류로 옮겨 갔다(맹개골·만기구·쉬구 등). 굶주림과 추위 속의 행군이었다.<br><small>길 고르기·거짓 불·지름길은 놀이로 꾸민 것이다.</small>' }); },
    b0: { ...S.band } };
  function card(ev) { c.card(`10월 ${st.nightDone ? 24 : 23}일 · ${NODE_NAME[ev.node]}`, ev.name, 2.6); }
  return ch;
}
