/* 공통 엔진 · 부탁 — 캐릭터가 아이에게 조른다("Big apple!"). 아이가 낱말을 「듣는」 데서 「알아듣고 해 주는」 데로 넘어가는 순간이다.
 * 시험이 아니라 친구가 조르는 것: 틀렸다는 표시 · 소리 · 화면이 없고, 안 해 주면 웃으며 잊는다. 시간은 화면에 보이지 않는다.
 * 흐름: 말한다 + 생각 방울(물건만 — 상태는 보여 주지 않는다. 어떻게는 귀로 알아들어야 한다) → 도움이 차례로 짙어진다(눈길 → 까딱 → 천천히 다시 → 몸짓) → 잊는다.
 *       들어주면 크게 기뻐하고 그 낱말을 한 번 더 말하고 "Thank you!". 반대로 하면 킥킥 웃고 부탁은 살아 있다.
 * 자리(구역)는 「부탁 목록 + 지금 상태를 읽는 함수 + 몸으로 흉내 내는 법」만 넘긴다(아래 st). 수치는 자료(data/lab.js 의 ask)에서 온다.
 * 때는 놀이의 시계(dt)로 잰다 — 자동 확인에서도 같게 돈다. */
import * as THREE from 'three';
import { AUTO, clamp } from './stage.js';
import { chirp, sfx } from './sound.js';

const PAIR = { big: 'small', small: 'big', up: 'down', down: 'up', hot: 'cold', cold: 'hot' };
const parse = e => { const m = /^([\w.]+)\s*(>=|<=|=)\s*(.+)$/.exec(String(e).trim()); if (!m) return null; const n = +m[3]; let key = m[1], who = null; if (key.includes('.')) [who, key] = key.split('.'); return { who, key, op: m[2], val: Number.isNaN(n) ? m[3] : n }; };
const holds = (c, v) => c.op === '>=' ? v >= c.val : c.op === '<=' ? v <= c.val : v === c.val || String(v) === String(c.val);

// ───────────────────────── 생각 방울 ─────────────────────────
/** 머리 위에 뜨는 생각 방울(몽글한 흰 구름 + 작은 방울 둘) 안에 물건의 작은 모형이 뜬다. 글자 없음. */
export function createBubble(scene, camera) {
  const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#b8a8d8', emissiveIntensity: 0.22 }), geo = new THREE.SphereGeometry(1, 20, 14);
  for (const [x, y, r] of [[0, 0, 0.36], [-0.27, -0.04, 0.24], [0.27, -0.03, 0.25], [-0.12, 0.2, 0.25], [0.15, 0.19, 0.26], [0.02, -0.2, 0.25]]) { const m = new THREE.Mesh(geo, white); m.position.set(x, y, 0); m.scale.set(r, r, r * 0.5); g.add(m); }
  const dots = [[-0.36, -0.42, 0.085], [-0.5, -0.6, 0.05]].map(([x, y, r]) => { const m = new THREE.Mesh(geo, white); m.position.set(x, y, 0); m.scale.setScalar(r); g.add(m); return m; });
  const hold = new THREE.Group(); hold.position.set(0, 0.02, 0.22); g.add(hold); g.visible = false; g.renderOrder = 5; scene.add(g);
  const B = { on: false, k: 0, v: 0, t: 0, wig: 0 };
  /** 모형(Object3D — 크기와 가운데는 여기서 맞춘다)을 넣어 보인다. */
  function show(obj) {
    hold.clear(); if (obj) { const box = new THREE.Box3().setFromObject(obj), sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3()), k = 0.5 / Math.max(sz.x, sz.y, sz.z, 0.001); const w = new THREE.Group(); obj.position.sub(c); w.add(obj); w.scale.setScalar(k); hold.add(w); }
    B.on = true; B.t = 0; sfx.pop();
  }
  const hide = () => { B.on = false; };
  /** 매 장면: at = 머리 위 자리(세계), size = 캐릭터 크기. 카메라를 마주 본다. 용수철로 톡 튀어나오고 들어간다. */
  function tick(dt, at, size = 1) {
    B.v += (130 * ((B.on ? 1 : 0) - B.k) - 13 * B.v) * dt; B.k = Math.max(0, B.k + B.v * dt); B.t += dt; B.wig = Math.max(0, B.wig - dt);
    g.visible = B.k > 0.02; if (!g.visible) return;
    const s = clamp(0.95 + 0.4 * size, 0.9, 1.6) * B.k; g.scale.setScalar(s); g.position.copy(at); g.position.x += 0.55 * size + 0.42; g.position.y += 0.3 * size + 0.62 + Math.sin(B.t * 2.1) * 0.025;
    g.quaternion.copy(camera.quaternion); if (hold.children[0]) { hold.children[0].rotation.y = Math.sin(B.t * 1.3) * 0.5 + Math.sin(B.t * 22) * 0.35 * B.wig; hold.children[0].position.y = Math.sin(B.t * 2.6) * 0.02; }
    dots[0].position.y = -0.42 + Math.sin(B.t * 3) * 0.015; dots[1].position.y = -0.6 + Math.sin(B.t * 3 + 1) * 0.015;
  }
  return { group: g, show, hide, tick, wiggle: () => { B.wig = 0.7; }, get shown() { return B.on; } };
}

// ───────────────────────── 부탁 ─────────────────────────
/** o = { scene, stage, actor(조르는 캐릭터), brain, voice, learn, cfg(자료의 ask), words(자료의 words), states(자료의 thingState), muted(), holding(), voiceK() }
 *  st(자리가 tick 에 넘기는 것) = { id, asks, read(물건 이름, 상태 이름) → 값, busy() → 조르면 안 되는 때인가, moving() → 자리를 옮기는 중인가,
 *    top(물건 이름, out) → 그 물건 위 자리, wiggle(물건 이름), mime(낱말, 켬?) → 몸으로 흉내, mini(물건 이름) → 생각 방울에 넣을 작은 모형 } */
export function createAsk(o) {
  const { stage, actor, brain, voice, learn, cfg, words } = o, s = actor.state, bubble = createBubble(o.scene, stage.camera), v3 = new THREE.Vector3(), vTop = new THREE.Vector3();
  const A = { cur: null, st: null, stId: null, stationT: 0, acts: 0, idle: 0, since: cfg.every, n: 0, last: null, level: {}, log: [], done: [], flap: 0, mime: null, thanksIn: 0 };
  const head = () => vTop.set(s.pos.x, s.y + 1.05 * s.size, s.pos.z);
  const text = w => words[w] ? words[w].text : w;
  const want = a => a._w || (a._w = parse(a.want)), need = a => a.need ? (a._n || (a._n = parse(a.need))) : null;
  const read = (st, c, a) => st.read(c.who || a.thing, c.key);
  /** 지금 고를 수 있는 부탁인가: 그 낱말을 두 번 넘게 겪었고 · 아직 그 상태가 아니고 · 앞 조건이 맞고 · 방금 한 것이 아니다. */
  function eligible(st, a) {
    if (a === A.last || !want(a)) return false; const w = a.words[0];
    if (learn.count(text(w)) < cfg.heardAtLeast) return false;
    if (holds(want(a), read(st, want(a), a))) return false;
    const n = need(a); return !n || holds(n, read(st, n, a));
  }
  /** 차례: 아직 부탁 안 한 낱말 → 도움받아 한 낱말 → 혼자 한 낱말. */
  function pick(st) {
    const rank = a => ({ undefined: 0, assisted: 1, independent: 2 })[A.level[a.words[0]]] ?? 0; let best = null;
    for (const a of st.asks) if (eligible(st, a) && (!best || rank(a) < rank(best))) best = a;
    return best;
  }
  const note = e => { A.log.push(e); };
  function say(a, slow) { voice.phrase(a.say, () => head().setX(s.pos.x - 0.55 * s.size - 0.35), { by: 'gogo', rate: slow ? 0.75 : undefined, pitch: clamp(1.25 - (s.size - 1) * 0.9, 0.3, 2) }); A.flap = 0.45 + 0.085 * a.say.length * (slow ? 1.3 : 1); chirp('please', o.voiceK ? o.voiceK() : 1); }
  const plead = () => { if (!brain.busy && !o.holding() && !(s.act && s.act.lock)) { s.target = null; s.faceTo = 0; actor.act('ask'); actor.lookAt(stage.camera.position); } };
  function start(st, a) {
    A.cur = { a, t: 0, hint: 0, opp: false, st }; A.st = st; A.n++; A.since = 0; A.last = a; note('say:' + a.say);
    plead(); say(a, false); bubble.show(st.mini ? st.mini(a.thing) : null);
  }
  function end(why) {
    const c = A.cur; if (!c) return; A.cur = null; bubble.hide(); if (why) note(why); if (A.mime) { c.st.mime(A.mime, false); A.mime = null; } if (s.act && s.act.name === 'ask') s.act = null; actor.setMood('idle', 0);
  }
  /** 들어줬다: 크게 기뻐하고 그 낱말을 한 번 더 말한 뒤 "Thank you!". 몸짓 도움 전이면 상태 낱말은 「혼자」, 이름은 그림을 봤으니 언제나 「도움받아」. */
  function done() {
    const c = A.cur, a = c.a, lv = c.t < cfg.independentBefore ? 'independent' : 'assisted', w = a.words[0], top = (c.st.top ? c.st.top(a.thing, new THREE.Vector3()) : head().clone());
    end('done:' + lv); A.done.push(a.say + ':' + lv); if (A.level[w] !== 'independent') A.level[w] = lv;
    learn.note(text(w), { skill: 'listen', outcome: lv, input: 'drag', game: a.cross ? 'ask-cross' : 'ask' }); if (a.words[1]) learn.note(text(a.words[1]), { skill: 'listen', outcome: 'assisted', input: 'drag', game: 'ask' });
    brain.run(async tok => {
      s.target = null; s.faceTo = 0; actor.act(cfg.onDone.clip, { mood: cfg.onDone.mood }); chirp('joy', o.voiceK ? o.voiceK() : 1); sfx.spark(false);
      await brain.wait(tok, 1.25); actor.act('jump', { mood: cfg.onDone.mood }); await brain.wait(tok, 0.85);      // 한 번 더 폴짝 — 그 낱말은 아이가 한 일로 방금 나왔으니(2.5초 안에 되풀이하지 않게) 조금 있다가 따라 말한다
      if (cfg.onDone.echo) voice.word(text(w) + '!', top, { gap: 0, by: 'gogo', cls: words[w] && words[w].cls, quiet: true });
      await brain.wait(tok, 1.05); voice.word(text(cfg.onDone.say) + '!', head, { gap: 0, by: 'gogo', quiet: true, cls: 'name' }); actor.setMood('smile', 1.6); actor.lookAt(stage.camera.position); await brain.wait(tok, 1.2);
    });
  }
  /** 반대로 했는가(Big 을 졸랐는데 작게 만들었다): 그 낱말의 짝이 가리키는 상태가 됐을 때. */
  function opposite(st, a) {
    if (a.need) return false;                                                            // 앞 조건이 있는 부탁(떨고 있을 때 "Hot, please!")은 시작이 곧 반대 상태다 — 반대로 했다고 보지 않는다
    const pw = PAIR[a.words[0]], c = want(a), def = o.states && o.states[c.key] && o.states[c.key].words && o.states[c.key].words[pw]; if (!def) return false;
    const m = /^(>=|<=)\s*(-?[\d.]+)$/.exec(def); return m ? holds({ op: m[1], val: +m[2] }, read(st, c, a)) : false;
  }
  /** 매 장면(캐릭터 update 앞에). st = 지금 자리(없으면 부탁하지 않는다). */
  function tick(dt, st) {
    if (!st || st.id !== A.stId) { if (A.cur) end('left'); A.stId = st ? st.id : null; A.stationT = 0; A.acts = 0; }
    A.stationT += dt; A.since += dt; A.idle += dt; if (A.flap > 0) A.flap -= dt;
    bubble.tick(dt, head(), s.size);
    if (!st) return;
    const c = A.cur;
    if (!c) {
      if (A.stationT < cfg.firstAfter || A.acts < cfg.minActs || A.idle < cfg.idle || A.since < cfg.every) return;
      if ((o.muted() && !AUTO) || o.holding() || brain.busy || st.busy() || st.moving()) return;       // 소리를 꺼 두었으면 낱말이 들리지 않으니 조르지 않는다
      const a = pick(st); if (a) start(st, a); else A.since = cfg.every - 8;                              // 고를 것이 없으면 조금 있다 다시 본다
      return;
    }
    const a = c.a, hold = o.holding(); c.t += dt;
    if (s.act && s.act.name === 'ask' && (brain.busy || hold)) s.act = null;                             // 아이가 무언가 하기 시작하면 조르는 몸짓은 거둔다(부탁은 살아 있다)
    if (!brain.busy && !hold && !(s.act && s.act.lock)) actor.setMood(A.flap > 0 && Math.sin(A.flap * 26) > 0 ? 'talk' : 'ask', 0.3);   // 말하는 동안 입이 움직인다
    if (!hold && holds(want(a), read(st, want(a), a))) { done(); return; }
    const op = !hold && opposite(st, a); if (op && !c.opp) { actor.setMood(cfg.onOpposite.mood, 1.2); chirp(cfg.onOpposite.sound, o.voiceK ? o.voiceK() : 1); note('opposite'); } c.opp = op;
    const H = cfg.hints;
    while (c.hint + 1 < H.length && c.t >= H[c.hint + 1].at) {
      const h = H[++c.hint]; note(h.give);
      if (h.give === 'gaze') { if (!brain.busy) { if (s.act && s.act.name === 'ask') s.act = null; if (a.thing !== 'gogo' && st.top) { st.top(a.thing, v3); actor.lookAt(v3); } } }
      else if (h.give === 'wiggle') { if (st.wiggle) st.wiggle(a.thing); bubble.wiggle(); sfx.tick(); }
      else if (h.give === 'slow') { plead(); say(a, true); }
      else if (h.give === 'show') { if (!brain.busy && !hold) { if (s.act && s.act.name === 'ask') s.act = null; s.faceTo = 0; A.mime = a.words[0]; st.mime(A.mime, true); } }
      else if (h.give === 'drop') { end(null); if (!brain.busy && !hold) brain.run(async tok => { actor.act('shrug', { mood: 'smile' }); chirp('hm', o.voiceK ? o.voiceK() : 1); await brain.wait(tok, 1.1); actor.lookAt(stage.camera.position); }); return; }
    }
  }
  return {
    tick, bubble, log: A.log, done: A.done, A,
    /** 아이가 화면을 건드렸다(쉬는 시간을 다시 잰다). */
    touch() { A.idle = 0; },
    /** 아이가 그 자리에서 일 하나를 했다(넷을 넘어야 처음 조른다). */
    act() { A.acts++; A.idle = 0; },
    /** 확인용: 때를 기다리지 않고 그 자리의 n 번째 부탁을 바로 한다(고르는 조건은 보지 않는다). */
    force(st, i) { if (A.cur) end('left'); A.stId = st.id; start(st, st.asks[i]); },
    get active() { return !!A.cur; },
    summary: () => ({ n: A.n, now: A.cur ? A.cur.a.say + ' t' + A.cur.t.toFixed(1) : '', log: A.log, level: A.level, bubble: bubble.shown }),
  };
}
