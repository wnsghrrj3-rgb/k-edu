/* 장 6 · 닷새째 밤 「고동하 — 밤 기습을 되치기」 (1920년 10월 25~26일) — 설계 v2 ④ 장 6 (차례 5)
   차례: 보초 세우기(저녁 — 여덟 자리 가운데 넷, 보임·가려짐 + 「어느 쪽에서 올까」) → 야영(말하기) → 한밤 총소리(맞는 쪽 보초면 30초 일찍)
        → 깨우기(천막 여섯)·불 끄기(모닥불 여섯) — 둘 다 할 시간은 없다 → 올라가 살피기(「적은 수다」) → 사령관에게 → 숲을 크게 돌아 적 뒤 언덕에 → 신호 → 날이 샌다(남쪽 숲길).
   지는 길: 깨우기·불 끄기를 반도 못 함(부대 −20) · 돌아가다 들킴(되치기 실패 — 그냥 빠져나감, 부대 −12).
   실제: 밤에 기습을 받았으나 곧 되쳐서 물리치고 안도 쪽으로 옮겨 갔다. 보초 자리·깨우기·불 끄기·돌아 치기 길은 놀이 장치. */
import { dressCamp, dressVillage } from './dress.js';
import { clamp, dist, lerp, rng, glowSprite } from '../scene/kit.js';

const CAMP = [92, 290], KNOLL = [72, 276], KIM = [96, 284], SOUTH = [86, 338];
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], DV = { N: [0, -1], NE: [0.71, -0.71], E: [1, 0], SE: [0.71, 0.71], S: [0, 1], SW: [-0.71, 0.71], W: [-1, 0], NW: [-0.71, -0.71] };
const SPOTS = DIRS.map((d, i) => { const v = DV[d], r = 25; return { id: d, name: { N: '북쪽 언덕', NE: '북동 바위', E: '동쪽 쓰러진 나무', SE: '남동 물가', S: '남쪽 물가', SW: '남서 덤불', W: '서쪽 바위', NW: '북서 언덕' }[d], x: CAMP[0] + v[0] * r, z: CAMP[1] + v[1] * r, view: ![3, 5].includes(i), cover: [1, 2, 6, 7].includes(i) }; });
export const K6 = { CAMP, KNOLL, KIM, SOUTH, SPOTS, DV };

export default function ch6(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, fx, choose, closeChoice, SFX, H } = c;
  const r0 = rng((c.SEED || 1920) * 5 + 3), atk = ['NE', 'E', 'N'][Math.floor(r0() * 3)], av = DV[atk];
  const tents = [], fires = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; tents.push({ x: CAMP[0] + Math.cos(a) * 11, z: CAMP[1] + Math.sin(a) * 8, woke: false }); fires.push({ x: CAMP[0] + Math.cos(a + 0.5) * 6.5, z: CAMP[1] + Math.sin(a + 0.5) * 5, lit: true, m: null, gl: null }); }
  const HILL = [CAMP[0] + av[0] * 58 + av[1] * 14, CAMP[1] + av[1] * 58 - av[0] * 14];
  const st = { ph: 'evening', t: 0, sentries: {}, hint: false, talk: {}, warned: false, foes: [], arrT: 0, arrived: false, counted: false, reported: false, flankDet: false, signaled: false, dawnT: 0, lossDone: false, squad: [], done: false };
  const P = {};
  const ch = {
    id: 6, title: '밤 기습을 되치기', when: '1920년 10월 25일 저녁', place: '고동하', len: 120, region: [40, 240, 160, 350], zones: ['godong', 'ando'], yaw: Math.PI,
    goal: '밤을 넘긴다 — 보초를 세우고, 기습을 되치고, 날이 새면 안도 쪽으로', idle: '고동하 야영지', K: { ...K6, atk, HILL, tents, fires },
    get st() { return st; },
    start() { S.px = CAMP[0] + 2; S.pz = CAMP[1] + 4; S.pdir2 = 0;
      c.scene.fog.color.set(0x3a3448); c.scene.fog.near = 60; c.scene.fog.far = 260; c.hemi.intensity = 0.8; c.sun.color.set(0xffb080); c.sun.intensity = 1.1; c.sky.paint(0x4a5a88, 0xe0907a, 0xff9060, [-0.8, 0.08, 0.3], 0.9); ch.sunOff = [-70, 30, 20];
      tents.forEach((t) => c.putArt('cs_tent', t.x, t.z, Math.atan2(CAMP[0] - t.x, CAMP[1] - t.z)));
      fires.forEach((f) => { f.m = c.putArt('cs_fire', f.x, f.z); f.cold = c.putArt('cs_fire_cold', f.x, f.z); if (f.cold) f.cold.visible = false; f.gl = glowSprite(c.scene, 'rgba(255,200,120,.85)', 'rgba(255,140,40,0)', 7); f.gl.position.set(f.x, H(f.x, f.z) + 1.2, f.z); });
      dressCamp(c.putArt, CAMP[0], CAMP[1], { r: 13, seed: 9, n: 5, keep: (x, z) => tents.every((t) => dist(x, z, t.x, t.z) > 3.4) && fires.every((f) => dist(x, z, f.x, f.z) > 2.6) && dist(x, z, KIM[0], KIM[1]) > 3.5 && dist(x, z, CAMP[0], CAMP[1]) > 4 });
      for (const s of SPOTS) { if (s.cover) c.putArt(s.id.length === 1 && s.id !== 'E' ? 'cs_rocks' : 'cs_boulder', s.x + 1.4, s.z + 0.8, 1, 0.8); if (!s.view) c.putArt('cs_bush_dry', s.x + DV[s.id][0] * 2.2, s.z + DV[s.id][1] * 2.2, 0, 2.4); pad('sp_' + s.id, s.x, s.z, 0xffffff, 1.9); }
      P.kim = ppl.cast('kim', KIM[0], KIM[1], Math.PI); P.sot = ppl.cast('sot', CAMP[0] - 3, CAMP[1] + 2, 1); P.mak = ppl.cast('mak', CAMP[0] + 4, CAMP[1] - 2, -1); P.med = ppl.cast('med', CAMP[0] - 5, CAMP[1] - 3, 0.5); for (const k of ['kim', 'sot', 'mak', 'med']) P[k].look = 'me';
      if (S.tags.savedSun) { P.sun = ppl.cast('sun', CAMP[0] + 6, CAMP[1] + 3, -2); P.sun.look = 'me'; }
      pad('knoll', KNOLL[0], KNOLL[1], 0xffcf4d, 2.2); pad('kimR', KIM[0], KIM[1] + 3, 0xffcf4d, 1.9); pad('hill', HILL[0], HILL[1], 0xe0402a, 2.6); pad('south', SOUTH[0], SOUTH[1], 0xffcf4d, 3);
      tents.forEach((t, i) => pad('tent' + i, t.x - (t.x - CAMP[0]) * 0.25, t.z - (t.z - CAMP[1]) * 0.25, 0x8ad08a, 1.5)); fires.forEach((f, i) => pad('fire' + i, f.x, f.z, 0xffa040, 1.5));
      pad('talk_sot', CAMP[0] - 3, CAMP[1] + 4, 0x8ad08a, 1.4); pad('talk_mak', CAMP[0] + 4, CAMP[1], 0x8ad08a, 1.4);
      /* 먼 데 적의 횃불(저녁에 살피면 오는 쪽을 안다) */
      st.far = []; for (let i = 0; i < 5; i++) { const g = glowSprite(c.scene, 'rgba(255,180,90,.9)', 'rgba(255,120,40,0)', 4); const x = CAMP[0] + av[0] * (150 + i * 4) + av[1] * (i - 2) * 6, z = CAMP[1] + av[1] * (150 + i * 4) - av[0] * (i - 2) * 6; g.position.set(x, H(x, z) + 3, z); st.far.push(g); }
      c.addTarget({ id: 'farTorch', x: CAMP[0] + av[0] * 150, y: H(CAMP[0] + av[0] * 150, CAMP[1] + av[1] * 150) + 3, z: CAMP[1] + av[1] * 150, range: 220, need: 0.7, labelY: 4, off: () => st.ph !== 'evening', label: () => (st.hint ? '적의 횃불 — 저쪽에서 온다' : '불빛?'), line: () => `🔥 ${SPOTS.find((s) => s.id === atk).name} 쪽에서 횃불`, onSeen: () => { st.hint = true; say(`멀리 ${SPOTS.find((s) => s.id === atk).name} 쪽에 횃불이 보인다 — 그쪽에 보초를!`, null, 3.8); } });
      const seenN = Object.keys(S.tags).filter((k) => k.startsWith('seen_')).length; if (seenN >= 4) setTimeout(() => say(`그동안 살핀 적의 갈래로 보면 ${SPOTS.find((s) => s.id === atk).name} 쪽이 수상하다`, null, 4), 3000);
      setTimeout(() => cmd('이범석 연성대장', '보초 넷을 세워라. 어느 쪽에서 올지 생각해서.', 4.2), 1200);
    },
    timeK() { return st.ph === 'evening' ? clamp(1 - st.t / 120, 0, 1) : st.ph === 'wake' ? clamp(1 - st.t / st.arrT, 0, 1) : st.ph === 'dawn' ? 1 : 0.3; },
    update(dt) {
      st.t += dt; const tm = document.getElementById('time').firstChild, lab = st.ph === 'evening' ? '10월 25일 저녁 · 해 지기까지 ' : st.ph === 'dawn' ? '10월 26일 새벽 ' : st.ph === 'wake' ? '적이 닿기까지 ' : '10월 25일 한밤 '; if (tm.textContent !== lab) tm.textContent = lab;
      if (st.ph === 'evening') { if (Object.keys(st.sentries).length >= 4 && !st.ready) { st.ready = true; say('보초 넷을 세웠다 — 천막 곁에서 사람들과 말해도 되고, 사령관 곁에서 밤을 맞아도 된다', null, 4); } if (st.t >= 120 || (st.ready && st.sleep)) ch.toNight(); }
      else if (st.ph === 'night') { st.t2 = (st.t2 || 0) + dt; const k = clamp(st.t2 / 3, 0, 1); c.hemi.intensity = lerp(0.8, 0.42, k); c.sun.intensity = lerp(1.1, 0.35, k); if (st.t2 > 3.4) ch.alarm(); }
      else if (st.ph === 'wake') ch.wake(dt); else if (st.ph === 'scout' || st.ph === 'flank' || st.ph === 'back') ch.counter(dt); else if (st.ph === 'dawn') ch.dawn(dt);
      ch.foeMove(dt);
      /* 고리 */
      const ev = st.ph === 'evening'; for (const s of SPOTS) pads['sp_' + s.id].m.visible = ev && !st.sentries[s.id] && Object.keys(st.sentries).length < 4; pads.knoll.m.visible = ev ? !st.hint : st.ph === 'scout' && !st.counted;
      pads.kimR.m.visible = (ev && st.ready && !st.sleep) || (st.ph === 'scout' && st.counted && !st.reported); pads.hill.m.visible = st.ph === 'flank'; pads.south.m.visible = st.ph === 'dawn';
      tents.forEach((t, i) => (pads['tent' + i].m.visible = st.ph === 'wake' && !t.woke)); fires.forEach((f, i) => (pads['fire' + i].m.visible = st.ph === 'wake' && f.lit));
      pads.talk_sot.m.visible = ev && !st.talk.sot; pads.talk_mak.m.visible = ev && !st.talk.mak;
    },
    toNight() { st.ph = 'night'; st.t2 = 0; closeChoice(); c.card('10월 25일 한밤', '고동하 야영지', 2.4); c.sky.paint(0x0c1428, 0x24304a, 0x6070a0, [0.3, 0.4, -0.5], 0.3); c.scene.fog.color.set(0x141c2e); c.scene.fog.near = 30; c.scene.fog.far = 180; },
    alarm() { const good = Object.keys(st.sentries).filter((d) => { const s = SPOTS.find((q) => q.id === d); const i = DIRS.indexOf(d), j = DIRS.indexOf(atk), dd = Math.min(Math.abs(i - j), 8 - Math.abs(i - j)); return s.view && dd <= 1; }); st.warned = good.length > 0; st.goodSentry = good.length;
      st.ph = 'wake'; st.t = 0; st.arrT = st.warned ? 40 : 12; SFX.volley(0.7); SFX.bad(); S.tension = 0.8;
      cmd(st.warned ? '보초' : '— 총소리!', st.warned ? `${SPOTS.find((s) => s.id === good[0]).name} 보초가 알렸다 — 적이 온다!` : '한가운데서 총소리가 났다!', 4);
      say(st.warned ? '보초가 일찍 알렸다 — 깨우고 불을 끄자(불빛 곁 천막이 과녁이 된다)' : '보초가 못 봤다 — 곧 닿는다! 깨우고 불 끄기', null, 4);
      for (let i = 0; i < 28; i++) { const lat = (i - 13.5) * 2.4, d = st.warned ? 70 + (i % 4) * 2 : 34 + (i % 4) * 2; const x = CAMP[0] + av[0] * d + av[1] * lat, z = CAMP[1] + av[1] * d - av[0] * lat; st.foes.push({ u: army.jp.add({ x, z, ry: Math.atan2(-av[0], -av[1]) }), lat, d, st: 'go', ph: Math.random() * 6 }); } },
    wake(dt) { const k = clamp(st.t / st.arrT, 0, 1); S.tension = 0.6 + k * 0.4; if (st.t >= st.arrT && !st.lossDone) ch.hit(); },
    hit() { st.lossDone = true; const lit = fires.filter((f) => f.lit).length, asleep = tents.filter((t) => !t.woke).length, done = 12 - lit - asleep;
      let loss; if (done < 6) loss = 20; else loss = Math.round(2 * lit + 1.5 * asleep * (1 + lit / 6)); st.loss = loss; st.litLeft = lit; st.asleep = asleep;
      if (loss) band('troop', -loss, done < 6 ? '깨우기·불 끄기를 반도 못 했다' : '불빛 곁 천막이 과녁이 되었다');
      st.ph = 'scout'; S.tension = 0.5; cmd('김좌진 사령관', '적이 몇이냐? 올라가 살펴라.', 3.6); say('서쪽 언덕(노란 고리)에 올라 적을 살피자 — 불 끈 어둠 속에 총구 불빛만 보인다', null, 4); },
    foeMove(dt) { if (!st.foes.length) return; const stop = st.ph === 'wake' ? lerp(st.warned ? 70 : 34, 18, clamp(st.t / st.arrT, 0, 1)) : 18;
      for (const f of st.foes) { const u = f.u; if (f.st === 'go') { f.d = Math.max(stop + (Math.abs(f.lat) % 3), f.d - dt * 2); u.x = CAMP[0] + av[0] * f.d + av[1] * f.lat; u.z = CAMP[1] + av[1] * f.d - av[0] * f.lat; u.bob = st.ph === 'wake' ? Math.abs(Math.sin(S.t * 7 + f.ph)) * 0.08 : 0; if (st.ph !== 'wake' && st.ph !== 'dawn' && Math.random() < dt * 0.25) fx.flash(u.x - av[0] * 1.2, H(u.x, u.z) + 1.4, u.z - av[1] * 1.2, 1.1); }
        else if (f.st === 'fall') { f.t += dt; const a = clamp(f.t / 0.45, 0, 1), b = clamp((f.t - 0.45) / 0.5, 0, 1); u.pitch = -a * 1.3; u.s = 1 - b; if (f.t > 1) u.on = false; }
        else if (f.st === 'flee') { f.d += dt * 4.5; u.x = CAMP[0] + av[0] * f.d + av[1] * f.lat; u.z = CAMP[1] + av[1] * f.d - av[0] * f.lat; u.ry = Math.atan2(av[0], av[1]); if (f.d > 140) u.on = false; } } },
    counter(dt) { const py = H(S.px, S.pz); st.ct = (st.ct || 0) + dt; if ((st.ph === 'scout' && st.ct > 100) || (st.ph === 'flank' && st.ct > 260)) { say('되치지 못한 채 밤이 간다 — 적이 물러나며 날이 샌다', null, 4); for (const f of st.foes) if (f.st === 'go') f.st = 'flee'; band('troop', -6, '밤새 총을 주고받았다'); return ch.toDawn(); }
      if (st.ph === 'flank') { /* 적은 야영지를 본다 — 앞쪽(야영지 쪽)으로는 멀리, 뒤로는 가까이만 */ S.detOn = true; let best = 0; for (const f of st.foes) { if (f.st !== 'go') continue; const u = f.u, dx = S.px - u.x, dz = S.pz - u.z, d = Math.hypot(dx, dz), front = (dx * -av[0] + dz * -av[1]) / (d || 1), R = front > 0.2 ? 22 : 8; if (d < R) best = Math.max(best, 1 - d / R); }
        if (best > 0) S.det += c.exposure() * 34 * best * dt; else S.det = Math.max(0, S.det - 4 * dt); S.det = clamp(S.det, 0, 100);
        if (S.det >= 100 && !st.flankDet) { st.flankDet = true; band('troop', -12, '돌아가다 들켰다 — 되치기 실패'); say('들켰다! 되치기는 틀렸다 — 그냥 빠져나간다', null, 4); SFX.bad(); for (const f of st.foes) if (f.st === 'go') f.st = 'flee'; ch.toDawn(); }
        /* 따라오는 조 */
        st.squad.forEach((q, i) => { const tx = S.px - Math.sin(S.pdir2 || 0) * (3 + i * 1.6), tz = S.pz - Math.cos(S.pdir2 || 0) * (3 + i * 1.6), d = dist(q.u.x, q.u.z, tx, tz); if (d > 1) { const v = Math.min(d, 5.5 * dt); q.u.x += (tx - q.u.x) / d * v; q.u.z += (tz - q.u.z) / d * v; q.u.ry = Math.atan2(tx - q.u.x, tz - q.u.z); } q.u.pitch = S.crouch ? 1.2 : 0; }); }
      if (st.ph === 'back') { st.bt = (st.bt || 0) + dt; if (Math.random() < dt * 10 && st.bt < 10) { const q = st.squad[Math.floor(Math.random() * st.squad.length)]; if (q) fx.flash(q.u.x - av[0] * 1.2, H(q.u.x, q.u.z) + 0.8, q.u.z - av[1] * 1.2, 1.2); fx.flash(CAMP[0] + av[0] * 10 + (Math.random() - 0.5) * 20, H(CAMP[0], CAMP[1]) + 0.8, CAMP[1] + av[1] * 10 + (Math.random() - 0.5) * 20, 1.1); if (Math.random() < 0.4) SFX.shot(0.6); }
        for (const f of st.foes) if (f.st === 'go' && Math.random() < dt * 0.35) { if (Math.random() < 0.5) { f.st = 'fall'; f.t = 0; } else f.st = 'flee'; }
        if (st.bt > 12) { for (const f of st.foes) if (f.st === 'go') f.st = 'flee'; ch.toDawn(); } } },
    toDawn() { st.ph = 'dawn'; st.dawnT = 0; S.detOn = false; S.tension = 0; cmd('김좌진 사령관', '날이 샌다. 안도 쪽으로 간다.', 4); say('적이 물러났다 — 날이 샌다. 남쪽 숲길로', null, 4); },
    dawn(dt) { st.dawnT += dt; if (st.dawnT > 70) ch.finish('out'); const k = clamp(st.dawnT / 8, 0, 1); c.hemi.intensity = lerp(0.42, 1.0, k); c.sun.intensity = lerp(0.35, 1.5, k); c.sun.color.set(0xffd0a0); if (Math.floor(st.dawnT) !== Math.floor(st.dawnT - dt) && Math.floor(st.dawnT) % 2 === 0) { c.sky.paint(k > 0.5 ? 0x7a90c0 : 0x2a3858, 0xf0b890, 0xffa070, [0.9, 0.05 + k * 0.12, 0.2], 0.4 + k * 0.8); c.scene.fog.color.setRGB(lerp(0.1, 0.85, k), lerp(0.12, 0.8, k), lerp(0.2, 0.75, k)); } },
    signal() { if (st.ph !== 'flank' || dist(S.px, S.pz, HILL[0], HILL[1]) > 4) return false; st.ph = 'back'; st.signaled = true; S.detOn = false; SFX.bugle(); setTimeout(() => SFX.volley(1.1), 300); cmd('이범석 연성대장', '앞뒤에서 쳐라!', 3); say('신호! 앞뒤에서 친다 — 적이 물러난다', null, 3); return true; },
    job() { const at = (k) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < pads[k].r;
      for (const s of SPOTS) if (at('sp_' + s.id)) return { key: 'sp' + s.id, need: 1.2, label: `${s.name}에 보초 세우기`, fn: () => { st.sentries[s.id] = 1; const u = army.iaK[Object.keys(st.sentries).length % 3].add({ x: s.x, z: s.z, ry: Math.atan2(DV[s.id][0], DV[s.id][1]) }); SFX.page(); say(`${s.name} — ${s.view ? '멀리 보인다' : '덤불에 가려 앞이 안 보인다'}${s.cover ? ' · 바위·나무 뒤라 숨는다' : ''} (${Object.keys(st.sentries).length}/4)`, null, 3); } };
      if (at('talk_sot')) return { key: 'sot', need: 1.2, label: '솥단지와 말하기', fn: () => { st.talk.sot = 1; ppl.talk(P.sot, '마지막 쌀이오. 다 같이 나눕시다.', 3.6); band('hunger', -10, '마지막 쌀'); } };
      if (at('talk_mak')) return { key: 'mak', need: 1.2, label: '막둥이와 말하기', fn: () => { st.talk.mak = 1; ppl.talk(P.mak, S.tags.calm ? '헤헤, 형 덕에 이제 기침도 안 해요.' : '…집에 가고 싶어요. 그래도 안 울 거예요.', 4); } };
      if (at('kimR') && st.ph === 'evening') return { key: 'sleep', need: 1.0, label: '밤 맞기', fn: () => { st.sleep = true; } };
      if (at('knoll') && st.ph === 'scout') return { key: 'knoll', need: 0.6, label: '살피기 — Space', fn: () => { say('Space 꾹 — 총구 불빛 쪽을 살피자', null, 2.4); } };
      if (at('kimR') && st.ph === 'scout') return { key: 'report', need: 1.0, label: '「적은 수다」 알리기', fn: () => { st.reported = true; st.ph = 'flank'; st.ct = 0; cmd('김좌진 사령관', '돌아서 뒤를 친다. 길을 잡아라.', 4); say(`숲을 크게 돌아 적 뒤 언덕(붉은 고리)까지 — 적은 야영지 쪽을 보고 있다`, null, 4.2); for (let i = 0; i < 8; i++) st.squad.push({ u: army.iaS[i % 3].add({ x: S.px - 2 - i, z: S.pz + 2 }) }); } };
      for (let i = 0; i < 6; i++) { if (at('tent' + i)) return { key: 'tent' + i, need: 0.9, label: '깨우기', fn: () => { tents[i].woke = true; SFX.page(); } }; if (at('fire' + i)) return { key: 'fire' + i, need: 0.9, label: '불 끄기', fn: () => { const f = fires[i]; f.lit = false; if (f.m) f.m.visible = false; if (f.cold) f.cold.visible = true; f.gl.visible = false; fx.puff(f.x, H(f.x, f.z) + 0.5, f.z, { size: 1.6, life: 2, vy: 1, col: 0x808080, op: 0.6 }); SFX.page(); } }; }
      if (at('south')) return { key: 'south', need: 1.2, label: '안도 쪽 숲길로', fn: () => ch.finish('out') };
      return null; },
    tasks() { const L = [], ph = st.ph, ns = Object.keys(st.sentries).length, lit = fires.filter((f) => f.lit).length, asleep = tents.filter((t) => !t.woke).length;
      const nearest = (arr, pre) => { let b = null, bd = 1e9; arr.forEach((o, i) => { if (!pads[pre + i].m.visible) return; const d = dist(S.px, S.pz, o.x, o.z); if (d < bd) { bd = d; b = [pads[pre + i].x, pads[pre + i].z]; } }); return b; };
      L.push({ id: 'sent', req: true, t: '보초 넷 세우기', n: () => [ns, 4], how: '흰 고리 여덟 가운데 넷 — <b>멀리 보이는가 · 가려지는가 · 어느 쪽에서 올까</b>(서쪽 언덕에서 <kbd>Space</kbd> 로 먼 불빛을 살피면 안다)', done: () => ns >= 4 || ph !== 'evening', at: () => { let b = null, bd = 1e9; for (const s of SPOTS) if (pads['sp_' + s.id].m.visible) { const d = dist(S.px, S.pz, s.x, s.z); if (d < bd) { bd = d; b = [s.x, s.z]; } } return b; }, tag: '👁 보초 자리' });
      if (ph === 'evening' && !st.hint) L.push({ id: 'look', t: '서쪽 언덕에서 먼 불빛 살피기', how: '노란 고리에서 <kbd>Space</kbd> 꾹 — 적이 오는 쪽을 안다', done: () => st.hint, at: () => KNOLL, tag: '🔭' });
      if (ph === 'evening') { L.push({ id: 'sot', t: '솥단지와 말하기', how: '마지막 쌀', done: () => !!st.talk.sot, at: () => [pads.talk_sot.x, pads.talk_sot.z], tag: '솥단지' }); L.push({ id: 'mak', t: '막둥이와 말하기', how: '', done: () => !!st.talk.mak, at: () => [pads.talk_mak.x, pads.talk_mak.z], tag: '막둥이' }); }
      L.push({ id: 'sleep', req: true, t: '사령관 곁에서 밤 맞기', how: '보초를 다 세웠으면 — 해가 지면 저절로', done: () => ph !== 'evening', can: () => st.ready, at: () => [pads.kimR.x, pads.kimR.z], tag: '밤', wait: ph !== 'evening' || !st.ready });
      L.push({ id: 'wake', req: true, t: '깨우기·불 끄기 — 가까운 것부터', n: () => [12 - lit - asleep, 12], how: `초록 = 천막 깨우기 · 주황 = 불 끄기(불빛 곁 천막이 과녁) · ${Math.max(0, Math.ceil(st.arrT - st.t))}초`, done: () => ph !== 'wake' && ph !== 'evening' && ph !== 'night', can: () => ph === 'wake', at: () => nearest(fires, 'fire') || nearest(tents, 'tent'), tag: () => (lit ? '🔥 불 끄기' : '⛺ 깨우기'), wait: ph === 'evening' || ph === 'night' });
      L.push({ id: 'scout', req: true, t: '올라가 적 살피기 → 사령관에게', how: '서쪽 언덕에서 <kbd>Space</kbd> 꾹(총구 불빛 쪽) → 사령관 곁 고리', done: () => st.reported || ph === 'dawn', can: () => ph === 'scout', at: () => (st.counted ? [pads.kimR.x, pads.kimR.z] : KNOLL), tag: () => (st.counted ? '「적은 수다」' : '🔭 살피기'), wait: ph !== 'scout' });
      L.push({ id: 'flank', req: true, t: '숲을 크게 돌아 적 뒤 언덕에서 신호', how: '적은 야영지 쪽을 본다 — 크게 돌고, 가까우면 <kbd>C</kbd> · 붉은 고리에서 <kbd>F</kbd>', done: () => st.signaled || ph === 'dawn', can: () => ph === 'flank', at: () => HILL, tag: '🚩 F — 신호', wait: ph !== 'flank' });
      L.push({ id: 'south', req: true, t: '날이 샌다 — 남쪽 숲길로', how: '노란 고리 — 안도 쪽', done: () => st.done, can: () => ph === 'dawn', at: () => SOUTH, tag: '🌅 안도 쪽', wait: ph !== 'dawn' });
      return L; },
    tags(put) { if (st.ph === 'evening') for (const s of SPOTS) if (!st.sentries[s.id] && dist(S.px, S.pz, s.x, s.z) < 45) put(s.x, H(s.x, s.z) + 2.4, s.z, `${s.name}<small>${s.view ? '보임 ○' : '보임 ✕'} · ${s.cover ? '가려짐 ○' : '가려짐 ✕'}</small>`, s.view && s.cover ? 'good' : '');
      if ((st.ph === 'scout' || st.ph === 'flank') && st.counted) { const p = [CAMP[0] + av[0] * 20, CAMP[1] + av[1] * 20]; put(p[0], H(p[0], p[1]) + 3, p[1], '적 — 서른 남짓', 'hot'); } },
    mini(g, k) { for (const s of SPOTS) { g.fillStyle = st.sentries[s.id] ? '#3fb46a' : 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(s.x * k, s.z * k, 3, 0, 6.28); g.fill(); } if (st.ph === 'flank') { g.fillStyle = '#e0402a'; g.beginPath(); g.arc(HILL[0] * k, HILL[1] * k, 4, 0, 6.28); g.fill(); } },
    finish(why) { if (st.done) return; st.done = true; S.tension = 0; S.detOn = false; closeChoice(); S.tags.sentry = st.goodSentry || 0; S.tags.counter = st.signaled ? 1 : 0;
      c.endChapter({ b0: ch.b0, head: st.signaled ? '밤 기습을 되쳤다' : st.flankDet ? '되치지 못하고 빠져나왔다' : '밤을 넘겼다',
        marks: [{ t: st.warned ? '보초가 일찍 알림' : '보초가 못 봄', ok: st.warned }, { t: `불 ${6 - (st.litLeft || 0)}/6 끔`, ok: !st.litLeft }, { t: `깨움 ${6 - (st.asleep || 0)}/6`, ok: !st.asleep }, { t: '적은 수다', ok: st.reported }, { t: '되치기', ok: st.signaled }],
        lines: [st.warned ? `${st.goodSentry}곳의 보초가 ${SPOTS.find((s) => s.id === atk).name} 쪽에서 오는 적을 일찍 보았다` : `적은 ${SPOTS.find((s) => s.id === atk).name} 쪽에서 왔다 — 보초가 그쪽을 못 보았다`,
          st.loss ? `한밤에 부대 ${st.loss}을 잃었다${st.litLeft ? ` — 켜 둔 불 ${st.litLeft}곳 곁 천막이 과녁이 되었다` : ''}` : '깨우기·불 끄기를 다 해 거의 잃지 않았다',
          st.signaled ? '숲을 크게 돌아 적 뒤에서 신호 — 앞뒤에서 쳐 적이 물러났다' : st.flankDet ? '돌아가다 들켜 되치지 못했다' : '되치지 않았다', '날이 새자 남쪽 숲길로 안도 쪽에 들어갔다'],
        hist: '실제: 10월 25~26일 무렵 고동하 상류에서 독립군은 밤에 일본군의 기습을 받았으나 곧 되쳐서 물리치고, 안도 쪽으로 옮겨 갔다.<br><small>보초 자리·깨우기·불 끄기·돌아 치기 길은 놀이로 꾸민 것이다.</small>' }); },
    b0: { ...S.band } };
  /* 살피기: 한밤 적 무리 */
  c.addTarget({ id: 'raid', get x() { return CAMP[0] + av[0] * 22; }, get y() { return H(CAMP[0] + av[0] * 22, CAMP[1] + av[1] * 22) + 1.4; }, get z() { return CAMP[1] + av[1] * 22; }, range: 120, need: 0.7, labelY: 3, off: () => st.ph !== 'scout', label: () => (st.counted ? '적 — 서른 남짓(적은 수다)' : '총구 불빛…'), line: () => '⚔ 적은 수다 — 서른 남짓', onSeen: () => { st.counted = true; say('적은 서른 남짓 — 적은 수다! 사령관에게 알리자', null, 3.4); } });
  return ch;
}
