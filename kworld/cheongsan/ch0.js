/* 장 0 · 앞날 「피할 것인가」 (1920년 10월 20일, 낮~저녁) — 설계 v2 ④ 장 0
   차례: 사령관 명령 듣기 → 망바위에 올라 연기 넷 세기(하나는 옆 바위에서만 보인다) → 돌아와 알리기(회의) → 비탈 여섯 자리 살피기 → 이범석에게 두 자리 알리기 → 천막에서 밤.
   골라서: 짐·환자 먼저 보내기(살필 시간 30초 줄어듦) · 막둥이에게 말 걸기(내일 기침을 덜 한다) · 솥단지 물 긷기(배고픔 −5).
   지는 길은 없다(길잡이 장). 넘기는 값 = 자리등급(A/B/C) · 짐먼저 · 연기다셈 · 신병안심. */
import { clamp, dist, lerp } from '../scene/kit.js';

export const CAMP = { fire: [64, 171], tent: [50, 157], kim: [51.5, 161.5], na: [55.5, 162], lee: [84, 166], sot: [73, 177], pot: [74.5, 179], mak: [57, 179.5], bag: [54, 185], spring: [70, 190], sleep: [66, 160] };
/* 비탈 여섯 자리: 셋 다 ○ 둘(가·마) · 둘만 ○ 둘(나·바) · 하나만 ○ 둘(다·라). 왼(북쪽) 비탈 가·나·다 / 오른(남쪽) 비탈 라·마·바 */
export const SPOTS = [
  { id: 'ga', name: '가', side: 'N', x: 110, z: 148, v: [1, 1, 1], why: ['길이 훤히 내려다보인다', '바위와 나무 뒤에 숨는다', '뒤로 골이 나 있어 능선 너머로 빠진다'] },
  { id: 'na', name: '나', side: 'N', x: 136, z: 148.5, v: [1, 1, 0], why: ['길이 내려다보인다', '바위 뒤에 숨는다', '뒤가 가파른 바위벽 — 빠질 길이 없다'] },
  { id: 'da', name: '다', side: 'N', x: 222, z: 147, v: [1, 0, 0], why: ['길이 보인다', '풀밭뿐 — 숨을 데가 없다', '뒤로 가면 능선 위로 훤히 드러난다'] },
  { id: 'ra', name: '라', side: 'S', x: 120, z: 193, v: [0, 1, 0], why: ['앞 둔덕에 가려 길이 안 보인다', '나무에 가려진다', '뒤가 우묵하게 막혔다'] },
  { id: 'ma', name: '마', side: 'S', x: 176, z: 193.5, v: [1, 1, 1], why: ['길이 훤히 내려다보인다', '큰 바위 뒤에 숨는다', '뒤로 오솔길이 나 있다'] },
  { id: 'ba', name: '바', side: 'S', x: 226, z: 192, v: [1, 0, 1], why: ['길이 보인다', '맨 비탈 — 가릴 것이 없다', '뒤로 골이 있어 빠질 수 있다'] }];
export const SIGNAL = [178.5, 191], BOULDER = [180.2, 189.3], LOOK_A = [236, 133], LOOK_B = [256, 137], CRAG = [248.2, 124.8];
export const SMOKES = [
  { k: 'chase', x: 420, z: 150, name: '동쪽 골짜기 길', who: '뒤쫓는 갈래', from: 'AB' },
  { k: 'cav', x: 472, z: 206, name: '가운데 들', who: '기병', from: 'AB' },
  { k: 'big', x: 578, z: 230, name: '어랑촌 쪽', who: '큰 갈래', from: 'AB' },
  { k: 'north', x: 332, z: 70, name: '북쪽 이도구 길', who: '북쪽 갈래', from: 'B' }];
export const gradeOf = (n, s) => { const a = (n ? +(n.v.join('') === '111') : 0) + (s ? +(s.v.join('') === '111') : 0); return a === 2 ? 'A' : a === 1 ? 'B' : 'C'; };

/* 블렌더 모델로 비탈 자리를 꾸민다(장 0·1 같이 씀) */
export function dressSlopes(c) {
  const { putArt, H } = c, R = (a) => a[Math.floor(Math.random() * a.length)];
  for (const s of SPOTS) { const toRoad = s.side === 'N' ? 1 : -1;
    if (s.v[1]) { putArt('cs_rocks', s.x + 1.6, s.z + toRoad * 2.2, Math.random() * 3); putArt(R(['cs_spruce', 'cs_birch', 'cs_larch']), s.x - 3.2, s.z - toRoad * 0.5, Math.random() * 3, 0.8); putArt('cs_bush_dry', s.x + 3.4, s.z + toRoad * 0.6, 0, 1); }
    if (s.v[2]) for (let i = 1; i <= 8; i++) { const x = s.x + Math.sin(i * 0.7) * 1.4, z = s.z - toRoad * (2 + i * 3.2); c.groundRing(c.scene, x, z, 0.01, 0.55, 0xc8b48a, 0.75, 8); }
    else if (s.id === 'da') putArt('cs_grass_dry', s.x + 1, s.z + 1, 0, 1.2); }
  putArt('cs_boulder', BOULDER[0], BOULDER[1], 0.4, 1.15); putArt('cs_crag', CRAG[0], CRAG[1], 0.6, 0.8); putArt('cs_rocks', LOOK_A[0] + 1.6, LOOK_A[1] + 1.4, 1, 0.9); putArt('cs_rocks', LOOK_B[0] - 1.2, LOOK_B[1] + 1.6, 2, 0.8);
  putArt('cs_marker_rock', 248, 176.5, 0.3, 1); putArt('cs_crag', 137, 139.5, 2.2, 0.75);   /* 나 자리 뒤 바위벽 */
}

export default function ch0(c) {
  const { S, say, cmd, band, pad, pads, put, ppl, army, choose, SFX, H, card } = c;
  const st = { ph: 'order', smokes: 0, seen: {}, insp: {}, pickN: null, pickS: null, reported: false, bag: false, mak: false, water: 0, waterDone: false, slept: false, t0: 0, talkQ: [], fans: [], councilT: 0, decide: false };
  const P = {};
  const ch = {
    id: 0, title0: '앞날 · 10월 20일', title: '피할 것인가', when: '1920년 10월 20일 낮', place: '백운평', len: 420, region: [24, 104, 276, 224], zones: [],
    goal: '해 지기 전에 — 적을 살피고, 내일 숨을 자리를 고른다', idle: '해가 진다',
    start() {
      S.px = CAMP.fire[0] + 4; S.pz = CAMP.fire[1] + 6; S.pdir2 = Math.PI;
      /* 야영지: 천막 열둘 · 모닥불 · 솥 · 짐 */
      c.putArt('cs_tent_cmd', CAMP.tent[0], CAMP.tent[1], 0.35);
      for (let i = 0; i < 11; i++) { const a = -0.4 + i * 0.5, x = CAMP.fire[0] + Math.cos(a) * 15, z = CAMP.fire[1] + Math.sin(a) * 11; if (dist(x, z, CAMP.tent[0], CAMP.tent[1]) < 7) continue; c.putArt('cs_tent', x, z, Math.atan2(CAMP.fire[0] - x, CAMP.fire[1] - z)); }
      c.putArt('cs_fire', CAMP.fire[0], CAMP.fire[1]); st.glow = c.fx && c.fx.puff; c.putArt('cs_pot', CAMP.pot[0], CAMP.pot[1]); c.putArt('cs_crate_pile', CAMP.bag[0] - 3, CAMP.bag[1]); c.putArt('cs_stretcher', CAMP.bag[0] + 1.5, CAMP.bag[1] + 0.5, 0.3); c.putArt('cs_flag', CAMP.tent[0] + 3.4, CAMP.tent[1] + 2.4, 0, 1, { cloth: 0xc0392b });
      dressSlopes(c);
      /* 연기 넷(적이 피운 불) */
      st.smk = SMOKES.map((s) => ({ ...s, col: c.smokeColumn(c.scene, s.x, s.z, { h: 80, w: 7 }) }));
      for (const s of st.smk) c.addTarget({ id: 'smk_' + s.k, x: s.x, y: H(s.x, s.z) + 40, z: s.z, range: 520, need: 0.7, labelY: 8,
        ok: (eye) => { const atA = dist(eye.x, eye.z, LOOK_A[0], LOOK_A[1]) < 4.5, atB = dist(eye.x, eye.z, LOOK_B[0], LOOK_B[1]) < 4.5; return (atA && s.from.includes('A')) || (atB && s.from.includes('B')); },
        label: () => (st.seen[s.k] ? `연기 — ${s.name}<small>${s.who}</small>` : '연기?'), line: () => `🔥 ${s.name} — 적 한 갈래(${s.who})`,
        onSeen: () => { st.seen[s.k] = 1; st.smokes++; S.tags['seen_' + s.k] = 1; if (st.smokes === 1) say('「저게 다 우리를 찾는 불이다.」', null, 3.4); else say(`연기 ${st.smokes} — ${s.name}`, null, 2.2); if (st.smokes === 3 && !st.seen.north) setTimeout(() => say('능선 뒤에 하나가 더 있는 것 같다 — 옆 바위로 옮겨 보자', 'hint4', 3.6), 1200); } });
      /* 사람들 */
      P.kim = ppl.cast('kim', CAMP.kim[0], CAMP.kim[1], 0.4); P.na = ppl.cast('na', CAMP.na[0], CAMP.na[1], -0.2); P.lee = ppl.cast('lee', CAMP.lee[0], CAMP.lee[1], -1.2);
      P.mak = ppl.cast('mak', CAMP.mak[0], CAMP.mak[1], 2.4); P.sot = ppl.cast('sot', CAMP.sot[0], CAMP.sot[1], -2.6); P.dok = ppl.cast('dok', 70, 162, -0.8); P.sun = ppl.cast('sun', 72, 164, -1.6); P.bug = ppl.cast('bug', 58, 166, 1.2); P.med = ppl.cast('med', CAMP.bag[0] + 2.5, CAMP.bag[1] - 1, 0);
      for (const p of Object.values(P)) p.look = 'me'; P.mak.pose = 'kneel';
      /* 야영지 둘레 병사들(인스턴스) */
      let k = 0; for (let i = 0; i < 26; i++) { const a = i * 0.41 + 0.2, rr = 7 + (i % 3) * 2.2, x = CAMP.fire[0] + Math.cos(a) * rr, z = CAMP.fire[1] + Math.sin(a) * rr * 0.8; if (dist(x, z, CAMP.tent[0], CAMP.tent[1]) < 6 || dist(x, z, S.px, S.pz) < 3) continue; const g = (i % 2 ? army.iaK : army.iaS)[k++ % 3]; g.add({ x, z, ry: Math.atan2(CAMP.fire[0] - x, CAMP.fire[1] - z) }); }
      /* 고리 */
      pad('kim', CAMP.kim[0] + 1.5, CAMP.kim[1] + 3.2); pad('lookA', LOOK_A[0], LOOK_A[1], 0xffcf4d, 2.2); pad('lookB', LOOK_B[0], LOOK_B[1], 0xffcf4d, 2.2); pad('lee', CAMP.lee[0] - 2.2, CAMP.lee[1] + 1.6);
      for (const s of SPOTS) pad('spot_' + s.id, s.x, s.z, 0xffffff, 2.0);
      pad('bag', CAMP.bag[0], CAMP.bag[1] + 2.6, 0x8ad08a); pad('mak', CAMP.mak[0] + 1.8, CAMP.mak[1] + 1.2, 0x8ad08a); pad('spring', CAMP.spring[0], CAMP.spring[1], 0x7ab8f0); pad('sot', CAMP.sot[0] + 1.6, CAMP.sot[1] - 1.6, 0x7ab8f0); pad('sleep', CAMP.sleep[0], CAMP.sleep[1]);
      c.sky.paint(0x8fb4dc, 0xeee2c8, 0xffd8a0, [-0.6, 0.3, 0.4], 0.5);
      setTimeout(() => ppl.talk(P.kim, '척후, 이리 오너라.', 3.4), 2500);
    },
    update(dt) {
      const k = clamp(S.cht / ch.len, 0, 1);
      /* 해가 기운다: 노란 낮 → 붉은 저녁 */
      if (Math.floor(S.cht) !== Math.floor(S.cht - dt)) { c.sun.color.setHSL(0.1, 0.55, lerp(0.86, 0.62, k)); c.sun.intensity = lerp(2.3, 1.5, k); c.hemi.intensity = lerp(1.25, 0.85, k); if (Math.floor(S.cht) % 10 === 0) c.sky.paint(k < 0.7 ? 0x8fb4dc : 0x7a8ab8, k < 0.7 ? 0xeee2c8 : 0xf0b888, 0xffb070, [-0.7, 0.3 - k * 0.25, 0.4], 0.5 + k * 0.6); }
      for (const s of st.smk) s.col.update(dt);
      if (st.pickCool > 0 && (!pads.lee || dist(S.px, S.pz, pads.lee.x, pads.lee.z) > pads.lee.r)) st.pickCool -= dt * 3; else if (st.pickCool > 0 && !c.choosing()) st.pickCool -= dt * 0.5;
      if (st.talkQ.length) { const q = st.talkQ[0]; q.t -= dt; if (q.t <= 0) { st.talkQ.shift(); q.fn(); } }
      /* 망바위에 처음 오르면: 멀리 열린다 */
      if (!S.said.lookA && dist(S.px, S.pz, LOOK_A[0], LOOK_A[1]) < 6) { S.said.lookA = 1; say('망바위다 — Space 를 꾹 눌러 동쪽 하늘을 살피자', null, 3.4); }
      if (S.cht >= ch.len) ch.finish('time');
      S.tension = clamp((k - 0.78) * 4, 0, 0.6) * (st.pickS ? 0.3 : 1);
      if (k > 0.8) say('해가 넘어간다 — 서두르자', 'late', 3);
      /* 고리 보이기 */
      const ph = st.ph; pads.kim.m.visible = ph === 'order' || (ph === 'smoke' && st.smokes > 0 && !st.reported);
      pads.lookA.m.visible = ph === 'smoke' && st.smokes < 4; pads.lookB.m.visible = ph === 'smoke' && st.smokes >= 1 && !st.seen.north;
      for (const s of SPOTS) pads['spot_' + s.id].m.visible = ph === 'spots' && !st.insp[s.id];
      pads.lee.m.visible = ph === 'spots' && Object.keys(st.insp).length > 0; pads.sleep.m.visible = ph === 'night';
      pads.bag.m.visible = !st.bag && ph !== 'night'; pads.mak.m.visible = !st.mak; pads.spring.m.visible = !st.waterDone && !st.water; pads.sot.m.visible = st.water === 1;
    },
    tasks() { const L = [], ph = st.ph, ni = Object.keys(st.insp).length, nearSpot = () => { let b = null, bd = 1e9; for (const s of SPOTS) if (!st.insp[s.id]) { const d = dist(S.px, S.pz, s.x, s.z); if (d < bd) { bd = d; b = s; } } return b; };
      L.push({ id: 'order', req: true, t: '사령관 천막에서 명령 듣기', how: '천막 앞 노란 고리에 가만히 서기', done: () => ph !== 'order', at: () => [pads.kim.x, pads.kim.z], tag: '김좌진 사령관' });
      L.push({ id: 'smoke', req: true, t: '망바위에 올라 적의 연기 세기', n: () => [st.smokes, 4], how: () => (st.smokes >= 3 && !st.seen.north ? '능선 뒤에 하나 더 — <b>옆 바위</b> 고리로 옮겨 <kbd>Space</kbd> 꾹' : '동쪽 망바위 고리에 서서 <kbd>Space</kbd> 꾹 — 동쪽 하늘의 연기를 망원경 가운데에'), done: () => st.smokes >= 4 || st.reported, can: () => ph === 'smoke', at: () => (st.smokes >= 3 && !st.seen.north ? LOOK_B : LOOK_A), tag: () => (st.smokes >= 3 && !st.seen.north ? '옆 바위' : '🔭 망바위') });
      L.push({ id: 'report', req: true, t: '돌아와 사령관에게 알리기', how: '본 만큼만 알릴 수 있다 — 천막 앞 고리', done: () => st.reported, can: () => ph === 'smoke' && st.smokes > 0, at: () => [pads.kim.x, pads.kim.z], tag: '알리기', wait: st.smokes === 0 });
      L.push({ id: 'spots', req: true, t: '비탈의 매복 자리 살피기', n: () => [ni, 6], how: '흰 고리에 가만히 서면 그 자리에서 보이는 것이 나온다 — <b>길이 보이나 · 가릴 것 · 빠질 길</b>', done: () => ni >= 6 || !!st.pickS, can: () => ph === 'spots', at: () => { const s = nearSpot(); return s ? [s.x, s.z] : null; }, tag: () => { const s = nearSpot(); return s ? `${s.name} 자리 살피기` : ''; }, wait: ph !== 'spots' });
      L.push({ id: 'pick', req: true, t: '이범석에게 두 자리 알리기 (왼 비탈 하나 · 오른 비탈 하나)', how: '살핀 자리 가운데 ○ 가 많은 곳 — 이범석 앞 고리', done: () => !!st.pickS, can: () => ph === 'spots' && ni > 0, at: () => [pads.lee.x, pads.lee.z], tag: '이범석 연성대장', wait: ph !== 'spots' || ni === 0 });
      L.push({ id: 'sleep', req: true, t: '천막에서 밤 보내기', how: '할 일을 다 했으면 천막 곁 고리 — 해가 지면 저절로 밤이 된다', done: () => st.slept, can: () => ph === 'night', at: () => [pads.sleep.x, pads.sleep.z], tag: '밤 보내기', wait: ph !== 'night' });
      L.push({ id: 'bag', t: '짐과 환자를 먼저 고개 너머로', how: '짐 곁 초록 고리 — 내일 길이 가볍다. 대신 일손이 줄어 해가 빨리 진다(30초)', done: () => st.bag, at: () => [pads.bag.x, pads.bag.z], tag: '짐·들것' });
      L.push({ id: 'mak', t: '신병 막둥이에게 말 걸기', how: '막둥이 곁 초록 고리 — 내일 숨죽일 때 덜 떤다', done: () => st.mak, at: () => [pads.mak.x, pads.mak.z], tag: '막둥이' });
      L.push({ id: 'water', t: '솥단지 도와 물 긷기', how: st.water ? '물을 솥 곁 파란 고리로' : '샘 파란 고리에서 물을 길어 솥으로 — 배고픔이 조금 준다', done: () => st.waterDone, at: () => (st.water ? [pads.sot.x, pads.sot.z] : [pads.spring.x, pads.spring.z]), tag: () => (st.water ? '솥에 붓기' : '샘') });
      return L; },
    job() { const ph = st.ph, at = (k, r) => pads[k] && pads[k].m.visible && dist(S.px, S.pz, pads[k].x, pads[k].z) < (r || pads[k].r);
      if (at('kim') && ph === 'order') return { key: 'order', need: 1.0, label: '명령 듣기', fn: () => { st.ph = 'smoke'; cmd('김좌진 사령관', '동쪽 망바위에 올라 연기를 세고 오너라.', 4); ppl.talk(P.kim, '동쪽 망바위에 올라 연기를 세고 오너라.', 4); } };
      if (at('kim') && ph === 'smoke' && st.smokes > 0 && !st.reported) return { key: 'report', need: 1.0, label: '본 것을 알리기', fn: () => ch.council() };
      for (const s of SPOTS) if (at('spot_' + s.id)) return { key: 'spot' + s.id, need: 1.8, label: `${s.name} 자리 살피기`, fn: () => ch.inspect(s) };
      if (at('lee') && ph === 'spots' && !c.choosing() && !(st.pickCool > 0)) return { key: 'pick', need: 0.8, label: '자리 알리기', fn: () => ch.pickUI() };
      if (at('sleep') && ph === 'night') return { key: 'sleep', need: 1.2, label: '밤 보내기', fn: () => { st.slept = true; ch.finish('sleep'); } };
      if (at('bag') && !st.bag) return { key: 'bag', need: 2.6, label: '짐 싣기 돕기', fn: () => { st.bag = true; S.tags.baggage = 1; S.cht += 30; SFX.good(); say('짐과 환자가 먼저 고개를 넘는다 — 내일 걸음이 가볍다(해가 30초 빨리 진다)', null, 3.6); ppl.talk(P.med, '다친 사람들은 내가 데리고 가겠소.', 3.4); P.med.tx = 30; P.med.tz = 172; } };
      if (at('mak') && !st.mak) return { key: 'mak', need: 1.4, label: '막둥이에게 말 걸기', fn: () => { st.mak = true; S.tags.calm = 1; ppl.talk(P.mak, '…저, 내일 기침 날까 봐 무서워요. 형이 곁에 있으면 참을게요.', 4.6); SFX.good(); } };
      if (at('spring') && !st.water && !st.waterDone) return { key: 'spring', need: 1.4, label: '물 긷기', fn: () => { st.water = 1; SFX.page(); } };
      if (at('sot') && st.water === 1) return { key: 'sot', need: 1.0, label: '솥에 물 붓기', fn: () => { st.water = 0; st.waterDone = true; band('hunger', -5, '물 긷기'); ppl.talk(P.sot, '고맙네! 주먹밥은 싸움보다 먼저요.', 3.6); SFX.good(); } };
      return null; },
    council() { st.reported = true; S.tags.smokeAll = st.smokes >= 4 ? 1 : 0; st.ph = 'council'; S.tags.smokes = st.smokes;
      const q = (t, fn) => st.talkQ.push({ t, fn });
      q(0.1, () => ppl.talk(P.na, '연기가 몇이더냐?', 2.6)); q(2.4, () => ppl.talk(c.me, st.smokes >= 4 ? '넷입니다. 동쪽 길·가운데 들·어랑촌·북쪽 이도구 길.' : `${st.smokes}입니다 — 다 세지는 못했습니다.`, 3.6, 2.4));
      q(3.6, () => ppl.talk(P.na, '피하는 것이 옳소.', 3)); q(3.0, () => { cmd('김좌진 사령관', '이미 따돌릴 수 없소. 여기서 맞는다.', 4.2); ppl.talk(P.kim, '이미 따돌릴 수 없소. 여기서 맞는다.', 4); });
      q(4.4, () => { ppl.talk(P.lee, '척후, 비탈을 돌며 숨을 자리를 골라 오너라. 왼 비탈 하나, 오른 비탈 하나.', 5); st.ph = 'spots'; say('비탈의 흰 고리 여섯 — 가만히 서면 그 자리에서 보이는 것이 나온다', null, 4); }); },
    inspect(s) { st.insp[s.id] = 1; SFX.page();
      const toRoad = s.side === 'N' ? Math.PI / 2 : -Math.PI / 2, a = Math.atan2(s.side === 'N' ? 1 : -1, 0); /* 길 쪽 */
      const ang = s.side === 'N' ? Math.PI / 2 : -Math.PI / 2; st.fans.push(c.groundFan(c.scene, s.x, s.z, s.v[0] ? 26 : 9, ang - 0.8, ang + 0.8, s.v[0] ? 0x4ac06a : 0xe0503a, 0.28));
      const e = document.getElementById('spot'); e.innerHTML = `<h3>${s.name} 자리 (${s.side === 'N' ? '왼 비탈' : '오른 비탈'})</h3>` + ['길이 보이나', '가릴 것', '빠질 길'].map((t, i) => `<div class="${s.v[i] ? 'o' : 'x'}">${s.v[i] ? '○' : '✕'} ${t} — ${s.why[i]}</div>`).join('');
      e.style.display = 'block'; clearTimeout(st.spT); st.spT = setTimeout(() => (e.style.display = 'none'), 6500);
      const n = s.v.filter(Boolean).length; say(n === 3 ? `${s.name} 자리 — 셋 다 ○, 좋은 자리다!` : `${s.name} 자리 — ○ ${n}개`, null, 2.6); },
    pickUI() { const seenN = SPOTS.filter((s) => s.side === 'N' && st.insp[s.id]), seenS = SPOTS.filter((s) => s.side === 'S' && st.insp[s.id]); st.pickCool = 4;
      if (!seenN.length || !seenS.length) { ppl.talk(P.lee, `${!seenN.length ? '왼' : '오른'} 비탈 자리도 하나는 보고 오너라.`, 3.4); return; }
      const lab = (s) => `${s.name} 자리 ${s.v.map((v) => (v ? '○' : '✕')).join('')}`, more = { t: '더 살펴보고 오겠습니다', s: '자리를 더 본다', fn: () => say('자리를 더 살피고 오자', null, 2.2) };
      choose('왼 비탈(북쪽)은 어디에?', [...seenN.map((s) => ({ t: lab(s), fn: () => choose('오른 비탈(남쪽)은 어디에?', [...seenS.map((s2) => ({ t: lab(s2), fn: () => ch.setPick(s, s2) })), more]) })), more]); },
    setPick(n, s) { st.pickN = n; st.pickS = s; S.tags.pickN = n.id; S.tags.pickS = s.id; S.tags.grade = gradeOf(n, s); st.ph = 'night';
      const g = S.tags.grade; ppl.talk(P.lee, g === 'A' ? '좋다. 거기면 내려다보며 칠 수 있겠다. 조를 놓겠다.' : g === 'B' ? '하나는 좋구나. 거기에 조를 놓겠다.' : '…거기라. 할 수 없지, 조를 놓겠다.', 4.4); SFX.good();
      say('자리를 정했다 — 천막 곁 고리에서 밤을 보내자', null, 3.4); },
    signal() { return false; },
    tags(put) { const R = 90;
      for (const s of SPOTS) if (dist(S.px, S.pz, s.x, s.z) < R && (st.ph === 'spots' || st.insp[s.id])) put(s.x, H(s.x, s.z) + 2.6, s.z, st.insp[s.id] ? `${s.name} ${s.v.map((v) => (v ? '○' : '✕')).join('')}` : `${s.name} 자리`, st.insp[s.id] ? (s.v.join('') === '111' ? 'good' : '') : '');
      if (st.ph === 'smoke' && dist(S.px, S.pz, LOOK_A[0], LOOK_A[1]) < 160) put(LOOK_A[0], H(LOOK_A[0], LOOK_A[1]) + 3, LOOK_A[1], '🔭 망바위');
      if (st.ph === 'smoke' && st.smokes >= 1 && !st.seen.north && dist(S.px, S.pz, LOOK_B[0], LOOK_B[1]) < 120) put(LOOK_B[0], H(LOOK_B[0], LOOK_B[1]) + 3, LOOK_B[1], '옆 바위');
      if (dist(S.px, S.pz, CAMP.fire[0], CAMP.fire[1]) < 40) { for (const k of ['kim', 'lee']) put(P[k].x, H(P[k].x, P[k].z) + 2.9, P[k].z, `${P[k].name}<small>${P[k].role}</small>`); }
      if (st.pickN) put(st.pickN.x, H(st.pickN.x, st.pickN.z) + 4, st.pickN.z, '🚩 왼 비탈 조', 'good'); if (st.pickS) put(st.pickS.x, H(st.pickS.x, st.pickS.z) + 4, st.pickS.z, '🚩 오른 비탈 조', 'good'); },
    mini(g, k) { for (const s of SPOTS) { g.fillStyle = st.insp[s.id] ? (s.v.join('') === '111' ? '#3fb46a' : '#fff') : 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(s.x * k, s.z * k, 3.5, 0, 6.28); g.fill(); } g.fillStyle = '#ffcf4d'; g.beginPath(); g.arc(LOOK_A[0] * k, LOOK_A[1] * k, 3, 0, 6.28); g.fill(); },
    finish(why) { if (st.done) return; st.done = true;
      if (!st.reported) { S.tags.smokeAll = 0; S.tags.smokes = st.smokes; }
      if (!st.pickS) { st.autoPick = true; const n = SPOTS[2], s = SPOTS[3]; S.tags.pickN = n.id; S.tags.pickS = s.id; S.tags.grade = gradeOf(n, s); st.pickN = n; st.pickS = s; }
      const g = S.tags.grade, n = st.pickN, s = st.pickS;
      c.endChapter({ b0: ch.b0, head: g === 'A' ? '좋은 자리를 골랐다' : g === 'B' ? '자리 하나는 좋다' : '자리가 나쁘다',
        marks: [{ t: `연기 ${st.smokes}/4`, ok: st.smokes >= 4 }, { t: '사령관에게 알림', ok: st.reported }, { t: `자리 ${g}등급`, ok: g === 'A' }, { t: '짐 먼저', ok: st.bag }, { t: '막둥이', ok: st.mak }],
        lines: [st.reported ? `연기 ${st.smokes}개를 세어 알렸다 — ${st.smokes >= 4 ? '적 네 갈래가 다 드러났다(작은 지도에 붉은 화살)' : '다 세지 못했다: 내일 본대가 생각보다 빨리 온다'}` : '본 것을 알리지 못했다 — 사령관은 그래도 「여기서 맞는다」고 정했다',
          st.autoPick ? '해가 졌다 — 자리를 정하지 못해 이범석이 아무 데나 조를 놓았다' : why === 'time' ? '해가 졌다 — 자리는 정해 두었다.' : '자리를 정하고 밤을 맞았다.',
          `왼 비탈 ${n.name} 자리 ${n.v.map((v) => (v ? '○' : '✕')).join('')} · 오른 비탈 ${s.name} 자리 ${s.v.map((v) => (v ? '○' : '✕')).join('')} → ${g}등급 (내일 싸움에서 ${g === 'A' ? '거의 안 다친다' : g === 'B' ? '조금 다친다' : '많이 다친다'})`,
          ...(st.bag ? ['짐과 환자를 먼저 보냈다 — 뒤 장에서 걸음이 빠르다'] : []), ...(st.mak ? ['막둥이가 「형이 곁에 있으면 참을게요」 했다'] : [])],
        hist: '실제: 북로 군정서는 그 전 회의에서 싸움을 피하자는 쪽으로 정했지만, 일본군이 가까이 와 따돌릴 수 없게 되자 백운평 골짜기에서 맞서기로 했다.<br><small>연기를 세고 자리를 고르는 일은 놀이로 꾸민 것이다.</small>',
        night: st.mak ? '막둥이가 곁에서 잠들었다' : '' }); },
    b0: { ...S.band } };
  return ch;
}
