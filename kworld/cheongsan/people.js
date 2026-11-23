/* 청산리 — 엿새 · 사람들(설계 v2 ⑤ · ⑨ people.js)
   가까이 있는 사람만 블렌더 사람(kit people) + 털모자·총·등짐. 말풍선은 다섯 해 방식.
   부대원 이름은 지어낸 것(막둥이·솥단지·덕보·순길·나팔 형…). 지휘관(김좌진·나중소·이범석)은 짧은 명령만. */
import * as THREE from 'three';
import { $, clamp, dist, ART, art, people as kitPeople, tone } from '../scene/kit.js';
import { Hq } from './map.js';

export const CAST = {
  kim: { name: '김좌진', role: '사령관', shirt: 0x3a4250, pants: 0x3a3a40, hat: 'fur', mood: 'stern', coat2: true, belt: true },
  na: { name: '나중소', role: '참모장', shirt: 0x4a4a52, pants: 0x3e3e44, hat: 'fur', mood: 'stern', coat2: true, bincase: true },
  lee: { name: '이범석', role: '연성대장', shirt: 0x3e4a5a, pants: 0x4a4a4e, hat: 'fur', mood: 'stern', bincase: true },
  mak: { name: '막둥이', role: '신병', shirt: 0x6a5a44, pants: 0x5a5448, hat: 'fur' },
  sot: { name: '솥단지', role: '취사병', shirt: 0x7a6a50, pants: 0x4a4a4e, hat: 'scarf' },
  dok: { name: '덕보', role: '연성소 동기', shirt: 0x4a4f58, pants: 0x5a5448, hat: 'fur' },
  sun: { name: '순길', role: '연성소 동기', shirt: 0x5a5040, pants: 0x4a4a4e, hat: 'fur' },
  bug: { name: '나팔 형', role: '나팔수', shirt: 0x3e4a5a, pants: 0x4a4a4e, hat: 'fur' },
  med: { name: '위생병', role: '위생병', shirt: 0xd8d2c0, pants: 0x4a4a4e, hat: 'fur', satchel: true },
  hong: { name: '홍범도', role: '대한 독립군', shirt: 0x5a4a38, pants: 0x4a4440, hat: 'fur', mood: 'stern', coat2: true, beard: true },
  baek: { name: '백 포수', role: '포수 출신 노병', shirt: 0x6a5840, pants: 0x4a4440, hat: 'fur', mood: 'stern', beard: true, satchel: true },
  vil1: { name: '아주머니', role: '어랑촌 주민', shirt: 0xf2ead8, pants: 0xe8e2d2, hat: 'scarf', chima: true },
  vil2: { name: '할머니', role: '주민', shirt: 0xf0ece0, pants: 0xe0dccc, hat: 'bun', chima: true },
  wood: { name: '나무꾼', role: '주민', shirt: 0xd8c8a8, pants: 0xc8b898, hat: 'paeraengi' },
  boy: { name: '소년', role: '주민', shirt: 0xe8e0cc, pants: 0xd8d0bc, hat: 'braid' },
  kid: { name: '아이', role: '주민', shirt: 0xe8e0cc, pants: 0xd8d0bc, hat: 'braid' } };

/* 다가가면 처지에 맞는 한마디(다섯 해 방식) — 띠(B: 부대·배고픔·포위망)와 꼬리표(T)를 보고 고른다. 지휘관은 짧게. */
const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const LINES = {
  kim: (B) => [B.net > 70 ? '서두르게. 길이 좁아지고 있네.' : '자네 눈이 우리 부대의 눈이네.'],
  na: (B) => [B.ammo < 30 ? '탄약을 아껴야 하오.' : '본 것만 말하게. 본 만큼 정하겠네.'],
  lee: (B, T) => [T.grade === 'A' ? '자리를 잘 골랐더군.' : '자리는 늘 셋을 보게 — 보임, 가려짐, 빠질 길.'],
  mak: (B, T) => [T.calm ? '형 곁이면 안 무서워요.' : '…총소리가 꿈에도 들려요.', B.hunger > 70 ? '배가 너무 고파요…' : '오늘은 콜록 안 했어요!'],
  sot: (B) => [B.hunger > 80 ? '쌀이 바닥났소… 미안하오.' : B.hunger > 50 ? '오늘 밥은 반 덩이씩이오.' : '주먹밥은 싸움보다 먼저요!'],
  dok: (B) => [B.troop < 60 ? '…빈자리가 늘었어.' : '이번엔 내가 제일 먼저 쏠 테다!'],
  sun: (B, T) => [T.savedSun ? '그때 부축해 줘서 고마웠어.' : '나, 사실 무서워. 너도 그렇지?'],
  bug: () => ['깃발만 올리면 바로 분다네.', '나팔 소리가 한 박자 늦으면 다 늦는 거야.'],
  med: (B) => [`오늘까지 뒤로 보낸 사람이 ${Math.max(0, Math.round((100 - B.troop) / 5))}명쯤 되오.`],
  hong: () => ['포수는 숲을 읽는다네.', '총알은 아끼고, 발은 가볍게.'],
  baek: () => ['발소리가 아직 크구먼.', '거긴 나라도 찾겠다 — 바위 뒤로 붙게.'],
  vil1: () => ['몸조심하시오.', '애들은 산으로 보냈소.'], vil2: () => ['식은 밥이라도 드시오.', '밤새 말 우는 소리가 났다오.'], wood: () => ['나무하다 보면 다 보인다오.'], boy: () => ['저 골을 질러가면 빨라요!'], kid: () => ['형, 총 쏴 봤어요?'] };
export function makePeople(scene, { mute = false, getS = null } = {}) {
  const { person, walkAnim } = kitPeople(scene);
  const list = [];
  /* 사람 하나: o = { shirt, pants, hat:'fur'|'jcap'|그 밖 kit 머리, rifle, pack, scope } */
  function mk(o) {
    const kh = o.hat === 'fur' || o.hat === 'jcap' ? 'crop' : o.hat;
    const m = person({ shirt: o.shirt, pants: o.pants, hat: kh, mood: o.mood || 'soft', skin: o.skin || 0xf0c48e, style: o.coat ? 'coat' : null, chima: !!o.chima, torch: !!o.torch }); if (o.small) m.scale.setScalar(o.small);
    m.rotation.order = 'YXZ';
    const tn = { shirt: o.shirt, pants: o.pants, cloth: o.scarf || 0xb8a888 };
    const add = (n, to = m) => { if (!ART[n]) return null; const a = art(n, tn); to.add(a); return a; };
    if (o.hat === 'fur') add('cs_hat_fur'); if (o.hat === 'jcap') add('cs_hat_jcap');
    if (o.rifle) add('cs_rifle'); if (o.pack) add('cs_pack');
    /* 블렌더 2차(11-23): 누비 줄·목수건·탄띠·각반·긴 겉옷·옆 가방 — 다리 것은 다리에 붙어 같이 움직인다 */
    if (o.hat === 'fur') { add('cs_quilt'); if (o.rifle || o.belt) add('cs_belt'); add('cs_puttee_L', m.userData.legL); add('cs_puttee_R', m.userData.legR); }
    if (o.hat === 'jcap') { add('cs_jp_gear'); add('cs_puttee_L', m.userData.legL); add('cs_puttee_R', m.userData.legR); }
    if (o.coat2) add('cs_coat_long'); if (o.satchel) add('cs_satchel'); if (o.bincase) add('cs_bincase'); if (o.beard) add('cs_mustache');
    m.userData.scope = add('cs_scope'); if (m.userData.scope) m.userData.scope.visible = false;
    return m;
  }
  /* 이름 있는 사람: 땅 위에 세우고, 말풍선을 달 수 있게 */
  function cast(key, x, z, ry = 0, extra = {}) { const c = { ...CAST[key], ...extra }; const civ = ['vil1', 'vil2', 'wood', 'boy', 'kid'].includes(key); const m = mk({ rifle: !civ && !['kim', 'na', 'sot', 'med'].includes(key), pack: false, small: key === 'kid' || key === 'boy' ? 0.78 : 0, ...c }); const p = { key, name: c.name, role: c.role, m, x, z, ry, tx: x, tz: z, pose: 'stand', talkT: 0, speed: 3.2, look: null };
    m.position.set(x, Hq(x, z), z); m.rotation.y = ry; walkAnim(m, 0, false); list.push(p); return p; }
  function update(dt, t, px, pz) {
    for (const p of list) { if (!p.m.visible) continue;
      const S = getS && getS(); p.cool = (p.cool || 0) - dt; if (S && S.mode === 'play' && p.cool <= 0 && LINES[p.key] && dist(p.x, p.z, px, pz) < 3.6 && !(p.m._talk && p.m._talk.t > 0)) { p.cool = 14; talk(p, pick(LINES[p.key](S.band, S.tags)), 3.2); } const d = dist(p.x, p.z, p.tx, p.tz); let mv = false;
      if (d > 0.4) { const v = Math.min(d, p.speed * dt); p.x += (p.tx - p.x) / d * v; p.z += (p.tz - p.z) / d * v; p.ry = Math.atan2(p.tx - p.x, p.tz - p.z); mv = true; }
      else if (p.look === 'me' && dist(p.x, p.z, px, pz) < 9) { const to = Math.atan2(px - p.x, pz - p.z); p.ry += Math.atan2(Math.sin(to - p.ry), Math.cos(to - p.ry)) * Math.min(1, dt * 5); }
      const prone = p.pose === 'prone', y = Hq(p.x, p.z);
      p.m.position.set(p.x, y + (prone ? 0.28 : 0), p.z); p.m.rotation.y = p.ry; p.m.rotation.x = prone ? 1.42 : p.pose === 'kneel' ? 0.15 : 0;
      walkAnim(p.m, t * (mv ? 10 : 0) + p.x, mv);
      if (p.pose === 'cough') { p.m.rotation.x = 1.25 + Math.max(0, Math.sin(t * 9)) * 0.15; p.m.position.y = y + 0.32; } }
  }
  /* ───── 말풍선(다섯 해 방식) ───── */
  const box = $('tags'), talks = Array.from({ length: 6 }, () => { const d = document.createElement('div'); d.className = 'talk'; box.appendChild(d); return d; }), TALKERS = [];
  function talk(target, text, sec = 3.4, h = 2.6) { const m = target.m || target; if (!m || !text) return; if (!TALKERS.includes(m)) TALKERS.push(m); m._talk = { text, t: sec, h }; if (!mute) tone(520 + Math.random() * 200, 700, 0.06, 'triangle', 0.05); }
  const v3 = new THREE.Vector3();
  function drawTalk(cam, dt, play, px, pz) { let bi = 0; for (const m of TALKERS) { const tk = m._talk; if (!tk || tk.t <= 0 || !m.visible) continue; tk.t -= dt; const d = talks[bi]; if (!d) break; const q = v3.set(m.position.x, m.position.y + tk.h, m.position.z).project(cam); if (!play || q.z > 1 || Math.abs(q.x) > 1 || Math.abs(q.y) > 1 || dist(px, pz, m.position.x, m.position.z) > 70) continue; bi++; d.style.display = 'block'; d.style.left = ((q.x + 1) / 2) * innerWidth + 'px'; d.style.top = ((1 - q.y) / 2) * innerHeight + 'px'; d.style.opacity = Math.min(1, tk.t * 3); if (d._h !== tk.text) { d.textContent = tk.text; d._h = tk.text; } } for (; bi < talks.length; bi++) talks[bi].style.display = 'none'; }
  function clear() { for (const p of list) scene.remove(p.m); list.length = 0; TALKERS.length = 0; }
  return { mk, cast, list, update, talk, drawTalk, walkAnim, clear, get: (k) => list.find((p) => p.key === k) };
}
