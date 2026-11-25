// K-MOTION 거꾸로 나라 · 다섯 지역 미션
// 각 미션은 같은 모양: start() → update(dt, f) → finish(). 탈락·감점 없음, 실패는 재미있는 반응만.
// 학생 몸 → transform(f, 규칙) → 캐릭터. 미션마다 켜는 거꾸로 규칙이 다르다.
import * as THREE from 'three';
import { Hero, starGeo } from './hero.js';
import { transform, ALL_OFF } from './reverse.js';
import { TEX, makeTree, makeHouse } from './world.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function std(color, o){ return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .5 }, o || {})); }
export function makeStar(color = 0xffd35a, s = 1){ const g = new THREE.Group(); const m = new THREE.Mesh(starGeo(.42 * s, .19 * s, .14 * s), std(color, { emissive: color, emissiveIntensity: .45, metalness: .5, roughness: .25 })); m.castShadow = true; g.add(m);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.dot, color, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(2 * s, 2 * s, 1); g.add(glow); g.userData.spin = m; return g; }
function makeGem(color = 0xff5fd2){ const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.OctahedronGeometry(.45, 0), std(color, { emissive: color, emissiveIntensity: 1.1, metalness: .3, roughness: .1 })); m.scale.y = 1.4; g.add(m);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.dot, color, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(2.4, 2.4, 1); g.add(glow); g.userData.spin = m; return g; }
const DOWN = { x: 0, y: 1 }, UPL = { x: -.38, y: -.92 }, UPR = { x: .38, y: -.92 }, OUTL = { x: -1, y: 0 }, OUTR = { x: 1, y: 0 };

class Base {
  constructor(app, opt = {}){ this.app = app; this.W = app.world; this.M = app.motion; this.A = app.audio; this.ui = app.ui; this.S = app.S; this.short = !!opt.short; this.t = 0; this.done = false; this.sub = 0; this.total = 1; this.hintShown = false; }
  get D(){ return this.M.diff; }
  makeHero(){ const h = new Hero(); this.W.dyn.add(h.root); return h; }
  say(t){ return this.app.say(t); }
  // 좌우 위치를 -1~1 로(난이도 = 얼마나 움직여야 끝까지 가는지)
  px(cmdx){ return clamp(cmdx / (this.D.lateral * 1.6 * this.M.sens), -1, 1); }
  win(){ this.sub++; this.ui.progress(this.sub, this.total); this.A.success(); }
  finish(){ if (this.done) return; this.done = true; this.app.onMissionDone(this, { sub: this.sub, total: this.total }); }
  hint(kind, text){ if (this.hintShown === kind) return; this.hintShown = kind; this.ui.hint(kind, text); if (text) this.say(text); }
  clearHint(){ if (this.hintShown) { this.hintShown = false; this.ui.hint(null); } }
  timeUp(){ this.finish(); }
  dispose(){}
}

// ───────────────── 미션 1: 거꾸로 거울의 방
export class Mirror extends Base {
  static info = { id: 'mirror', no: 1, name: '거꾸로 거울의 방', theme: 'mirror', color: '#9fe9ff', rules: ['lr', 'arms', 'size', 'head'] };
  start(){
    this.W.setTheme('mirror'); this.A.play('mirror');
    this.hero = this.makeHero().faceNow('back'); this.hero.root.position.set(0, 0, 0);
    this.ghost = new Hero({ ghost: true }).faceNow('back'); this.ghost.root.position.set(2.4, 0, -1.2); this.ghost.root.scale.setScalar(.72); this.ghost.root.visible = false; this.W.dyn.add(this.ghost.root);
    const sh = new THREE.Shape(); sh.moveTo(.9, -.25); sh.lineTo(0, -.25); sh.lineTo(0, -.6); sh.lineTo(-.9, 0); sh.lineTo(0, .6); sh.lineTo(0, .25); sh.lineTo(.9, .25); sh.closePath();
    this.arrow = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xffd35a, transparent: true, opacity: .9, side: THREE.DoubleSide })); this.arrow.rotation.x = -Math.PI / 2; this.arrow.visible = false; this.W.dyn.add(this.arrow);
    const R = { ...ALL_OFF, lr: true, arms: true, size: true, head: true }; this.rules = R;
    this.tasks = [
      { text: '캐릭터의 오른팔을 들어 올려라!', ok: c => c.srUp && !c.slUp, hint: 'armL', tip: '거꾸로 생각해 봐요. 내 반대쪽 팔을 들어 볼까요?', g: { sl: DOWN, sr: UPR } },
      { text: '캐릭터를 작게 만들어라!', ok: c => c.size === 'small', hint: 'spread', tip: '작게 만들려면 내 몸을 반대로! 크게 펼쳐 볼까요?', g: { scale: .55 } },
      { text: '캐릭터를 왼쪽으로 움직여라!', ok: () => this.hx < -1.3, hint: 'moveR', tip: '왼쪽으로 보내려면 나는 어느 쪽으로 가야 할까요?', g: { x: -1.2 } },
      { text: '캐릭터의 왼팔을 들어 올려라!', ok: c => c.slUp && !c.srUp, hint: 'armR', tip: '캐릭터 왼팔은 내 오른팔과 이어져 있어요.', g: { sl: UPL, sr: DOWN } },
      { text: '캐릭터를 크게 만들어라!', ok: c => c.size === 'big', hint: 'crouch', tip: '크게 만들려면 내 몸은 반대로 작게! 웅크려 볼까요?', g: { scale: 1.45 } },
      { text: '캐릭터의 고개를 오른쪽으로 기울여라!', ok: c => c.tiltDir > 0, hint: 'tiltL', tip: '내 고개를 반대쪽으로 기울여 봐요.', g: { tilt: 1 } },
    ];
    if (this.short) this.tasks = [this.tasks[0], this.tasks[1], this.tasks[2]];
    this.total = this.tasks.length; this.ui.progress(0, this.total);
    this.phase = 'free'; this.freeLeft = this.short ? Math.min(10, this.S.freeSec) : this.S.freeSec; this.k = -1; this.hold = 0; this.hx = 0;
    this.ui.task('자유롭게 움직여 봐요!', '🪞'); this.ui.setRules(R);
    this.say('거꾸로 거울의 방이에요. 자유롭게 움직여 보세요. 캐릭터가 어떻게 움직이나요?');
  }
  next(){ this.k++; this.hold = 0; this.taskT = 0; this.clearHint(); if (this.k >= this.tasks.length) { this.phase = 'end'; this.endT = 0; this.ui.task('거울의 방 마법을 모두 풀었어요!', '🎉'); this.say('거울의 방 마법을 모두 풀었어요!'); this.hero.set('cheer').face('front').setMood('cheer', 3); return; }
    const T = this.tasks[this.k]; this.ui.task(T.text, '🎯'); this.say(T.text); this.ghost.root.visible = !T.g.x; this.ghostCfg = T.g; this.A.magic(); this.W.ring(V3(2.4, 1.2, -1.2), 0x9fe9ff, 1.5); }
  update(dt, f){
    this.t += dt; const c = transform(f, this.rules), H = this.hero;
    this.hx = damp(this.hx, this.px(c.x) * 2.6, 8, dt); H.root.position.x = this.hx;
    const sc = c.size === 'big' ? 1.5 : c.size === 'small' ? .55 : 1 + c.grow * .15; if (Math.abs(sc - H.scaleT) > .2) (sc > H.scaleT ? this.A.grow() : this.A.shrink()); H.setScale(sc);
    if (this.phase !== 'end') { H.setDrive({ sl: c.sl, sr: c.sr, tilt: c.tilt }); H.set('idle'); }
    H.update(dt);
    if (this.phase === 'free') { this.freeLeft -= dt; this.ui.timer(Math.ceil(this.freeLeft)); if (this.freeLeft <= 0) { this.phase = 'task'; this.ui.timer(null); this.say('이제 마법 거울이 문제를 내요!').then(() => {}); this.next(); } }
    else if (this.phase === 'task') {
      const T = this.tasks[this.k]; this.taskT += dt;
      // 목표 자세 유령
      const g = this.ghostCfg || {}; const G = this.ghost; const AV = v => ({ u: v, f: v }); G.setDrive({ sl: AV(g.sl || DOWN), sr: AV(g.sr || DOWN), tilt: g.tilt || 0 }); G.setScale(g.scale || 1); G.root.position.x = 2.6; G.root.visible = !g.x; G.update(dt);
      if (this.arrow) { this.arrow.visible = !!g.x; this.arrow.position.set(this.hx - 1.1, .08, .6); this.arrow.scale.setScalar(1 + Math.sin(this.t * 6) * .08); }
      const ok = T.ok(c); this.hold = clamp(this.hold + (ok ? dt : -dt * 1.5), 0, this.D.hold); this.ui.hold(this.hold / this.D.hold);
      if (ok && !this._okSaid) { this._okSaid = true; H.setMood('wow', .6); }
      if (!ok) this._okSaid = false;
      if (this.hold >= this.D.hold) { this.win(); this.W.burst(V3(this.hx, 1.4 * H.scaleCur, 0), 0x9fe9ff, 70, 5); this.W.burst(V3(this.hx, 1.4, 0), 0xffd35a, 40, 4); H.setMood('cheer', 1.2); this.ui.hold(0); this.ui.toast(['좋아요!', '멋져요!', '거꾸로 성공!', '대단해요!'][this.sub % 4]); this.next(); }
      else if (this.taskT > this.D.hint) this.hint(T.hint, T.tip);
    } else if (this.phase === 'end') { this.endT += dt; this.ghost.root.visible = false; if (this.arrow) this.arrow.visible = false; H.setDrive(null); if (this.endT > 2.4) this.finish(); }
  }
}

// ───────────────── 미션 2: 거꾸로 중력의 숲
export class Forest extends Base {
  static info = { id: 'forest', no: 2, name: '거꾸로 중력의 숲', theme: 'forest', color: '#8fe88f', rules: ['lr', 'gravity'] };
  start(){
    this.W.setTheme('forest'); this.A.play('forest');
    this.hero = this.makeHero().faceNow('back'); this.hero.root.position.set(0, 0, 0); this.hero.root.scale.setScalar(1.3); this.hy = 0; this.hx = 0;
    this.rules = { ...ALL_OFF, lr: true, gravity: true }; this.ui.setRules(this.rules);
    this.total = this.short ? 4 : 7; this.ui.progress(0, this.total); this.inv = 0; this.lastGet = 0;
    // 별 자리: 위·아래·왼쪽·오른쪽을 고루(안전한 동작 범위 안)
    const plan = [[-3.4, .8], [3.4, 3.8], [0, 4.1], [-3.6, 3.5], [3.6, .9], [-1.8, 2.4], [2, 4.2], [0, .8], [-3.8, 4.0], [3.8, 2.2]];
    this.plan = plan.sort(() => Math.random() - .5); this.pi = 0;
    this.stars = []; this.spawnStar(); if (!this.short) this.spawnStar();
    this.obs = []; const nObs = this.short ? 2 : 3 + (this.S.diff === 'hard' ? 1 : 0);
    for (let i = 0; i < nObs; i++) this.addObstacle(i);
    this.ui.task('몸을 낮추면 위로! 별 ' + this.total + '개를 모아요', '⭐');
    this.say('거꾸로 중력의 숲이에요. 몸을 낮추면 위로 올라가요. 별을 모아 보세요!');
  }
  spawnStar(){ const p = this.plan[this.pi++ % this.plan.length]; const s = makeStar(0xffd35a); s.position.set(p[0], p[1], 0); s.scale.setScalar(.01); this.W.dyn.add(s); this.stars.push({ m: s, born: this.t }); this.W.ring(s.position, 0xfff1a8, 1); }
  addObstacle(i){ const cloud = i % 2 === 0; const g = new THREE.Group();
    if (cloud) { for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(rnd(.32, .48), 14, 10), std(0xffffff, { roughness: 1, emissive: 0x9fb8ff, emissiveIntensity: .15 })); b.position.set(k * .38 - .55, rnd(-.08, .12), rnd(-.1, .1)); g.add(b); }
      const eyes = [-1, 1].map(sx => { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), std(0x222233)); e.position.set(sx * .14, .05, .42); g.add(e); return e; }); }
    else { const br = new THREE.Mesh(new THREE.CylinderGeometry(.09, .14, 2.2, 8), std(0x7b5233, { roughness: .9 })); br.rotation.z = Math.PI / 2; g.add(br); for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 1), std(0x6ccf72, { flatShading: true })); l.position.set(-.8 + k * .8, .15, 0); g.add(l); } }
    const y = [1.3, 3.2, 2.2, 4.0][i % 4], dir = i % 2 ? -1 : 1; g.position.set(rnd(-5, 5), y, .1); this.W.dyn.add(g);
    const sp = { easy: .8, normal: 1.2, hard: 1.7 }[this.S.diff] || 1.2;
    this.obs.push({ m: g, y, dir, sp: sp * rnd(.8, 1.2), ph: rnd(0, 6), cloud }); }
  update(dt, f){
    this.t += dt; const c = transform(f, this.rules), H = this.hero;
    this.hx = damp(this.hx, this.px(c.x) * 4.6, 6, dt); this.hy = damp(this.hy, clamp(c.lift, 0, 1) * 3.8, 5, dt);
    H.root.position.set(this.hx, this.hy, 0); H.set(this.hy > .25 ? 'float' : 'idle'); H.update(dt);
    if (this.hy > .25 && Math.random() < dt * 12) this.W.burst(V3(this.hx, this.hy + .1, -.1), 0xa8f0ff, 1, .6, -.5);
    const body = V3(this.hx, this.hy + 1.2, 0);
    // 별
    for (const s of this.stars) { s.m.scale.setScalar(damp(s.m.scale.x, 1, 6, dt)); s.m.userData.spin.rotation.y = Math.sin(this.t * 2 + s.born) * .6; s.m.position.y += Math.sin(this.t * 2 + s.born) * dt * .15;
      if (!s.got && s.m.position.distanceTo(body) < (this.S.diff === 'easy' ? 1.25 : 1.0)) { s.got = true; this.win(); this.A.starGet(this.sub); this.W.burst(s.m.position, 0xffd35a, 60, 5); this.W.ring(s.m.position, 0xffd35a, 1.4); H.setMood('cheer', .8); this.lastGet = this.t; this.clearHint();
        this.W.dyn.remove(s.m); if (this.sub + this.stars.filter(x => !x.got).length < this.total) this.spawnStar(); if (this.sub >= this.total) { this.ui.task('별을 모두 모았어요!', '🎉'); this.say('별을 모두 모았어요! 숲의 마법 조각을 찾았어요!'); this.endT = 0; H.set('cheer'); } } }
    this.stars = this.stars.filter(s => !s.got);
    // 장애물: 닿으면 빙글빙글(탈락 없음)
    this.inv -= dt;
    for (const o of this.obs) { o.m.position.x += o.dir * o.sp * dt; if (o.m.position.x > 7) o.dir = -1; if (o.m.position.x < -7) o.dir = 1; o.m.position.y = o.y + Math.sin(this.t * .8 + o.ph) * .5; if (!o.cloud) o.m.rotation.z = Math.sin(this.t * 1.4 + o.ph) * .25;
      if (this.inv <= 0 && o.m.position.distanceTo(body) < .95) { this.inv = 1.6; H.spinOnce(); this.A.boing(); this.W.burst(body, 0xffffff, 25, 3); this.ui.toast('빙글빙글~ 괜찮아요!'); } }
    // 힌트: 한동안 못 잡으면 가장 가까운 별 쪽으로 어떻게 움직일지
    if (this.sub < this.total && this.t - this.lastGet > this.D.hint * 1.6 && this.stars[0]) { const s = this.stars[0].m.position;
      const needUp = s.y - this.hy > 1.4, needDown = this.hy - s.y > 1.2, needRight = s.x - this.hx > 1.2, needLeft = this.hx - s.x > 1.2;
      if (needUp) this.hint('crouch', '위로 가려면 몸을 낮춰 봐요!'); else if (needDown) this.hint('up', '아래로 가려면 몸을 일으켜 봐요!'); else if (needRight) this.hint('moveL', '오른쪽 별을 잡으려면 나는 반대쪽으로!'); else if (needLeft) this.hint('moveR', '왼쪽 별을 잡으려면 나는 반대쪽으로!'); }
    if (this.sub >= this.total) { this.endT += dt; if (this.endT > 2.2) this.finish(); }
  }
}

// ───────────────── 미션 3: 거꾸로 달리기 마을
export class Town extends Base {
  static info = { id: 'town', no: 3, name: '거꾸로 달리기 마을', theme: 'town', color: '#ffd166', rules: ['move', 'gravity', 'size'] };
  start(){
    const len = this.short ? 44 : 84; this.len = len;
    this.W.setTheme('town', len); this.A.play('town');
    this.hero = this.makeHero().faceNow('right'); this.hx = 0; this.hy = 0; this.hero.root.position.set(0, .14, 0);
    this.rules = { ...ALL_OFF, move: true, gravity: true, size: true }; this.ui.setRules({ move: true, gravity: true });
    this.speed = { easy: 2.1, normal: 2.6, hard: 3.1 }[this.S.diff] || 2.6;
    // 장애물 놓기
    const kinds = this.short ? ['door', 'box', 'fall'] : ['door', 'box', 'fall', 'spin', 'door', 'box', 'fall'];
    this.obs = kinds.map((k, i) => this.makeObs(k, 10 + i * ((len - 14) / kinds.length))); this.total = this.obs.length; this.ui.progress(0, this.total);
    this.squash = false; this.climb = null; this.bonkT = 0;
    this.ui.task('가만히 있으면 앞으로!', '🏃');
    this.say('거꾸로 달리기 마을이에요. 가만히 있으면 앞으로 가고, 움직이면 멈춰요. 시계탑까지 가 보세요!');
    this.goalX = len + 1.5;
  }
  makeObs(kind, x){ const g = new THREE.Group(); g.position.set(x, .14, 0); this.W.dyn.add(g); const o = { kind, x, m: g, passed: false, ph: rnd(0, 3) };
    if (kind === 'door') { for (const z of [-.9, .9]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.3, 3.2, .3), std(0x8a5a3a)); p.position.set(0, 1.6, z); g.add(p); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, 2.3), std(0xe8505b)); top.position.y = 3.3; g.add(top);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(.18, 2.4, 1.6), std(0xffc76b, { roughness: .6 })); panel.position.y = 1.2; g.add(panel); o.panel = panel;
      const knob = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), std(0xffd35a, { metalness: .7 })); knob.position.set(-.12, 1.2, .5); panel.add(knob); o.period = { easy: 5, normal: 4.2, hard: 3.4 }[this.S.diff] || 4.2; }
    if (kind === 'box') { const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, .9, 1.6), std(0xc98a3c, { roughness: .8 })); b.position.y = .45; b.castShadow = true; g.add(b);
      for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(1.42, .1, .1), std(0x8a5a2a)); st.position.set(0, .45 + s * .3, .8); g.add(st); } o.h = .9; }
    if (kind === 'fall') { const shadow = new THREE.Mesh(new THREE.CircleGeometry(.6, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = .02; g.add(shadow); o.shadow = shadow;
      const item = new THREE.Group(); const pot = new THREE.Mesh(new THREE.CylinderGeometry(.35, .25, .45, 14), std(0xd9774a)); item.add(pot); const fl = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 10), std(0xff7aa8)); fl.position.y = .4; item.add(fl);
      item.position.y = 9; g.add(item); o.item = item; o.cycle = { easy: 4.2, normal: 3.4, hard: 2.8 }[this.S.diff] || 3.4; o.ft = rnd(0, 1); }
    if (kind === 'spin') { // 빙글빙글 회전문: 옆에 선 기둥을 축으로 막대가 길을 가로질러 돈다
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, 1.5, 10), std(0x5b7be8)); post.position.set(0, .75, -1.7); g.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(.24, 14, 10), std(0xffd166, { metalness: .4 })); cap.position.set(0, 1.55, -1.7); g.add(cap);
      const arm = new THREE.Group(); arm.position.set(0, 1.25, -1.7); g.add(arm); const bar = new THREE.Mesh(new THREE.BoxGeometry(4.2, .22, .22), std(0xffd166)); arm.add(bar);
      for (const sx of [-1, 1]) { const ball = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 10), std(0xe8505b)); ball.position.x = sx * 2.1; arm.add(ball); } o.arm = arm; o.rate = { easy: 1.0, normal: 1.35, hard: 1.7 }[this.S.diff] || 1.35; }
    return o; }
  blocked(o, nx){ // 지금 nx 로 가면 부딪히는지
    const d = o.x - nx;
    if (o.kind === 'door') return d < .55 && d > -.2 && o.closed;
    if (o.kind === 'spin') return Math.abs(d) < .6 && o.danger;
    if (o.kind === 'box') return d < 1.0 && d > -.7 && this.hy < o.h - .05 && !this.climb;
    return false; }
  update(dt, f){
    this.t += dt; const c = transform(f, this.rules), H = this.hero; this.bonkT -= dt;
    // 장애물 움직임
    for (const o of this.obs) {
      if (o.kind === 'door') { const u = ((this.t + o.ph) % o.period) / o.period; const open = u < .5 ? 1 : 0; o.panel.position.y = damp(o.panel.position.y, open ? 3.6 : 1.2, 6, dt); o.closed = o.panel.position.y < 2.8; }
      if (o.kind === 'spin') { o.arm.rotation.y += dt * o.rate; o.danger = Math.abs(Math.sin(o.arm.rotation.y)) > .72; }
      if (o.kind === 'fall') { o.ft += dt; const u = o.ft % o.cycle, warn = o.cycle - 1.3; if (u < warn) { o.item.position.y = 9; o.shadow.material.opacity = 0; o.landed = false; }
        else { const k = Math.min(1, (u - warn) / 1.0); o.shadow.material.opacity = .15 + k * .35; o.shadow.scale.setScalar(.6 + k * .6); o.item.position.y = Math.max(.3, 9 - Math.pow(k, 2.2) * 9);
          if (k >= 1 && !o.landed) { o.landed = true; this.A.bonk(); this.W.burst(V3(o.x, .4, 0), 0xff9aa8, 18, 3); this.W.kick(.15); if (Math.abs(this.hx - o.x) < .75 && !this.squash) { this.squash = true; this.A.boing(); H.setMood('dizzy', 2); this.ui.toast('납작! 팔을 크게 펼치면 원래대로!'); this.hint('spread', '팔을 크게 펼치면 원래 크기로 돌아와요!'); } } } }
    }
    // 납작해지면: 펼치기로 원래 크기
    if (this.squash) { H.body.scale.y = damp(H.body.scale.y, .45, 10, dt); if (f.spreadOn) { this.squash = false; this.A.grow(); this.W.burst(V3(this.hx, .8, 0), 0x9fe9ff, 40, 4); this.clearHint(); H.setMood('smile'); } }
    // 상자 오르기: 몸을 낮추면 위로(중력 반전)
    const box = this.obs.find(o => o.kind === 'box' && !o.passed && o.x - this.hx < 1.1 && o.x - this.hx > -.8);
    if (box && !this.climb && c.up && this.hy < .1) { this.climb = { o: box, t: 0, x0: this.hx }; this.A.jump(); H.set('float'); }
    if (this.climb) { const k = this.climb; k.t += dt; const u = Math.min(1, k.t / .7); this.hx = k.x0 + (k.o.x + 1.0 - k.x0) * u; this.hy = Math.sin(u * Math.PI) * 1.6 + (u > .5 ? 0 : 0); if (u >= 1) { this.climb = null; this.hy = 0; this.A.land(); } }
    // 앞으로 가기
    let go = c.go && !this.squash && !this.climb && this.hx < this.goalX;
    if (go) { const nx = this.hx + this.speed * dt; const hit = this.obs.find(o => this.blocked(o, nx));
      if (hit) { go = false; if (hit.kind !== 'box' && this.bonkT <= 0) { this.bonkT = 1; this.hx -= .5; this.A.bonk(); H.set('bonk'); H.setMood('dizzy', 1); this.W.burst(V3(this.hx + .4, 1.4, 0), 0xffffff, 20, 3); this.ui.toast('쿵! 멈춰서 기다려 봐요'); this.hint('walk', '멈추고 싶으면 제자리에서 걸어요!'); }
        else if (hit.kind === 'box') this.hint('crouch', '상자에 오르려면 몸을 낮춰 봐요!'); }
      else this.hx = nx; }
    if (!this.climb && this.bonkT < .4) H.set(go ? 'walk' : 'idle');
    H.root.position.set(this.hx, .14 + this.hy, 0); H.update(dt); if (this.squash) H.body.scale.y = Math.min(H.body.scale.y, .5);
    // 통과 판정
    for (const o of this.obs) if (!o.passed && this.hx > o.x + .9) { o.passed = true; this.win(); this.W.burst(V3(o.x, 2.4, 0), 0xffd35a, 40, 4); this.ui.toast('통과!'); this.clearHint(); }
    this.ui.trip(this.hx / this.goalX);
    // 오래 멈춰 있으면 힌트(움직이고 있어서 멈춘 경우)
    if (!go && !this.squash && f.moving && !this.hintShown && this.t > 6) { this.stillT = (this.stillT || 0) + dt; if (this.stillT > this.D.hint) this.hint('still', '앞으로 가려면 가만히 멈춰 봐요!'); } else this.stillT = 0;
    // 카메라 따라가기
    this.W.setCam(V3(this.hx + 1.5, 2.6, 9), V3(this.hx + 1.5, 1.5, 0), { sway: .4, follow: 4 });
    if (this.hx >= this.goalX && !this.endT) { this.endT = .001; H.set('cheer').face('front').setMood('cheer', 3); this.A.fanfare(); this.ui.task('시계탑에 도착했어요!', '🎉'); this.say('시계탑에 도착했어요! 마을의 마법 조각을 찾았어요!'); this.W.burst(V3(this.goalX + 1.5, 6, -4), 0xffd35a, 120, 6); }
    if (this.endT) { this.endT += dt; if (this.endT > 2.6) this.finish(); }
  }
}

// ───────────────── 미션 4: 거꾸로 크기 마법 연구소
export class Lab extends Base {
  static info = { id: 'lab', no: 4, name: '거꾸로 크기 마법 연구소', theme: 'lab', color: '#c89bff', rules: ['size'] };
  start(){
    this.W.setTheme('lab'); this.A.play('lab');
    this.hero = this.makeHero().faceNow('right'); this.hx = -2; this.hero.root.position.set(this.hx, 0, 0);
    this.rules = { ...ALL_OFF, size: true }; this.ui.setRules(this.rules);
    const all = [['tunnel', 'small', '작은 터널 지나가기'], ['apple', 'big', '높은 곳 사과 따기'], ['rock', 'big', '커다란 바위 밀기'], ['house', 'small', '작은 집 문 지나기'], ['key', 'big', '높은 곳 마법 열쇠'], ['pads', 'seq', '크기 발판 건너기']];
    this.list = this.short ? [all[0], all[1]] : all;
    this.st = this.list.map((s, i) => this.makeStation(s[0], s[1], s[2], 6 + i * 13)); this.total = this.st.length; this.ui.progress(0, this.total);
    this.si = 0; this.phase = 'walk'; this.hold = 0; this.stT = 0;
    this.ui.task('거꾸로 크기 마법을 써 봐요!', '🧪');
    this.say('거꾸로 크기 마법 연구소예요. 어떻게 하면 캐릭터가 커지고 작아질까요? 직접 생각해 보세요!');
  }
  makeStation(kind, need, title, x){ const g = new THREE.Group(); g.position.set(x, 0, 0); this.W.dyn.add(g); const s = { kind, need, title, x, m: g, done: false };
    if (kind === 'tunnel') { for (let i = 0; i < 4; i++) { const arch = new THREE.Mesh(new THREE.TorusGeometry(.95, .26, 12, 28, Math.PI), std(i % 2 ? 0x8fb8ff : 0x6f98e8, { roughness: .4 })); arch.rotation.y = Math.PI / 2; arch.position.set(i * .9, 0, 0); arch.castShadow = true; g.add(arch); }
      const back = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.7, 24, 1, true, Math.PI / 2, Math.PI / 2), std(0x4d6fc8, { side: THREE.DoubleSide, roughness: .6 })); back.rotation.z = Math.PI / 2; back.position.set(1.35, 0, 0); back.receiveShadow = true; g.add(back);
      const sign = makeLabelSprite('작은 터널'); sign.position.set(1.35, 1.75, 0); g.add(sign);
      s.stopX = x - 1.0; s.passX = x + 3.6; }
    if (kind === 'apple' || kind === 'key') { if (kind === 'apple') { const tr = makeTree(2.3); tr.position.set(.6, 0, -1); g.add(tr); } else { const sh = new THREE.Mesh(new THREE.BoxGeometry(1.6, .2, 1), std(0x8a5a3a)); sh.position.set(.4, 3.4, -.3); g.add(sh); }
      const it = kind === 'apple' ? new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), std(0xff4d5a, { roughness: .35 })) : makeKey(); it.position.set(.4, kind === 'apple' ? 3.3 : 3.75, 0); g.add(it); s.item = it; s.stopX = x - .4; s.passX = x + 1.5; }
    if (kind === 'rock') { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), std(0x8c8c9e, { flatShading: true, roughness: .9 })); r.position.set(1, 1.05, 0); r.castShadow = true; g.add(r); s.rock = r; s.stopX = x - .55; s.passX = x + 5; s.push = 0; }
    if (kind === 'house') { const h = makeHouse(.6); h.rotation.y = -Math.PI / 2; h.position.set(1, 0, 0); g.add(h); s.stopX = x - .3; s.passX = x + 2.4; }
    if (kind === 'pads') { s.seq = ['small', 'big', 'mid']; s.pads = s.seq.map((need, i) => { const sz = need === 'small' ? .7 : need === 'big' ? 1.8 : 1.15; const p = new THREE.Mesh(new THREE.CylinderGeometry(sz, sz, .25, 24), std([0x8fe8ff, 0xff9fc8, 0xffd166][i], { emissive: [0x2a8fbf, 0xbf2a6a, 0xbf8a2a][i], emissiveIntensity: .25 })); p.position.set(i * 3.2 + .5, .12, 0); g.add(p);
        const lab = makeLabelSprite(need === 'small' ? '작게' : need === 'big' ? '크게' : '보통'); lab.position.set(i * 3.2 + .5, .3, 2.3); g.add(lab); return p; }); s.pi = 0; s.stopX = x + .5; s.passX = x + 9.5; }
    return s; }
  sizeOf(c){ return c.size; }
  update(dt, f){
    this.t += dt; const c = transform(f, this.rules), H = this.hero; const D = this.D;
    const want = c.size === 'big' ? 1.75 : c.size === 'small' ? .5 : 1; if (Math.abs(want - H.scaleT) > .2) { want > H.scaleT ? this.A.grow() : this.A.shrink(); this.W.burst(V3(this.hx, .9 * want, .3), 0xc89bff, 20, 2.5); } H.setScale(want);
    const S = this.st[this.si];
    if (!S) { H.set('cheer'); H.update(dt); this.endT = (this.endT || 0) + dt; if (this.endT > 2.4) this.finish(); return; }
    const walkTo = (x, sp = 2.4) => { if (this.hx < x - .05) { this.hx = Math.min(x, this.hx + sp * dt); H.set('walk'); return false; } H.set('idle'); return true; };
    if (this.phase === 'walk') { if (walkTo(S.stopX)) { this.phase = 'wait'; this.stT = 0; this.hold = 0; const need = S.kind === 'pads' ? S.seq[0] : S.need; this.ui.task(need === 'small' ? '캐릭터를 작게 만들어요!' : need === 'big' ? '캐릭터를 크게 만들어요!' : '보통 크기로 만들어요!', '🧪'); this.ui.toast(S.title); this.say(S.title + '! ' + (need === 'small' ? '캐릭터를 작게 만들어요.' : need === 'big' ? '캐릭터를 크게 만들어요.' : '보통 크기로!')); } }
    else if (this.phase === 'wait') { this.stT += dt; const need = S.kind === 'pads' ? S.seq[S.pi] : S.need; const ok = c.size === need;
      this.hold = clamp(this.hold + (ok ? dt : -dt), 0, D.hold); this.ui.hold(this.hold / D.hold);
      if (this.hold >= D.hold) { this.ui.hold(0); this.clearHint(); this.phase = 'act'; this.actT = 0; this.A.magic(); }
      else if (this.stT > D.hint) this.hint(need === 'small' ? 'spread' : need === 'big' ? 'crouch' : 'stand', need === 'small' ? '작게 만들려면 거꾸로! 내 몸을 크게 펼쳐 봐요.' : need === 'big' ? '크게 만들려면 거꾸로! 내 몸을 작게 웅크려 봐요.' : '평범하게 서면 보통 크기가 돼요.'); }
    else if (this.phase === 'act') { this.actT += dt; const need = S.kind === 'pads' ? S.seq[S.pi] : S.need; const ok = c.size === need;
      if (S.kind === 'tunnel' || S.kind === 'house') { if (!ok) { H.set('idle'); this.ui.toast('앗, 작아져야 지나갈 수 있어요!'); this.phase = 'wait'; this.hold = 0; } else if (walkTo(S.passX, 2)) this.done1(S); }
      if (S.kind === 'apple' || S.kind === 'key') { H.set('reach'); if (this.actT > .6) { S.item.position.lerp(V3(-.4, 1.4, 0), Math.min(1, dt * 6)); } if (this.actT > 1.3) { S.item.visible = false; this.A.starGet(this.sub); this.W.burst(V3(S.x, 2.2, 0), S.kind === 'apple' ? 0xff4d5a : 0xffd35a, 50, 4); this.phase = 'leave'; } }
      if (S.kind === 'rock') { if (!ok) { H.set('idle'); this.phase = 'wait'; this.hold = 0; this.ui.toast('바위가 너무 무거워요. 다시 크게!'); } else { H.set('push'); S.push = Math.min(4, S.push + dt * 1.6); S.rock.position.x = 1 + S.push; S.rock.rotation.z -= dt * 1.4; this.hx = S.x - .55 + S.push; if (Math.random() < dt * 8) this.W.burst(V3(S.x + S.push + .2, .1, .4), 0xd8c8a8, 3, 1.5, -3); if (S.push >= 4) this.phase = 'leave'; } }
      if (S.kind === 'pads') { const p = S.pads[S.pi]; const px = S.x + S.pi * 3.2 + .5; if (this.actT < .8) { const u = this.actT / .8; this.hx = damp(this.hx, px, 8, dt); H.root.position.y = Math.sin(u * Math.PI) * 1.2 + .25; H.set('float'); }
        else { H.root.position.y = .25; p.material.emissiveIntensity = 1; this.A.starGet(S.pi); this.W.burst(V3(px, .5, 0), 0xffd35a, 30, 3); S.pi++; if (S.pi >= S.seq.length) { this.phase = 'leave'; } else { this.phase = 'wait'; this.hold = 0; this.stT = 0; const n = S.seq[S.pi]; this.ui.task('다음 발판: ' + (n === 'small' ? '작게!' : n === 'big' ? '크게!' : '보통 크기로!'), '🧪'); this.say(n === 'small' ? '이번엔 작게!' : n === 'big' ? '이번엔 크게!' : '이번엔 보통 크기로!'); } } } }
    else if (this.phase === 'leave') { if (walkTo(S.passX, 2.6)) this.done1(S); }
    if (S.kind !== 'pads' || this.phase === 'walk' || this.phase === 'leave') H.root.position.y = damp(H.root.position.y, 0, 10, dt);
    H.root.position.x = this.hx; H.update(dt);
    this.W.setCam(V3(this.hx + 2, 2.8, 9.5), V3(this.hx + 2, 1.8, 0), { sway: .4, follow: 4 });
  }
  done1(S){ if (S.done) return; S.done = true; this.win(); this.ui.toast(['성공!', '멋져요!', '크기 마법 박사!', '대단해요!'][this.sub % 4]); this.W.burst(V3(this.hx, 2, 0), 0xc89bff, 60, 5); this.hero.setMood('cheer', 1);
    this.si++; this.phase = 'walk'; if (this.si >= this.st.length) { this.ui.task('연구소 마법을 모두 풀었어요!', '🎉'); this.say('연구소의 마법 조각을 찾았어요!'); this.hero.face('front'); } }
}
function makeKey(){ const g = new THREE.Group(); const m = std(0xffd35a, { metalness: .8, roughness: .25, emissive: 0x6b4a00, emissiveIntensity: .5 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .06, 10, 20), m); g.add(ring);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(.5, .08, .08), m); bar.position.x = .42; g.add(bar); const t1 = new THREE.Mesh(new THREE.BoxGeometry(.08, .16, .08), m); t1.position.set(.6, -.1, 0); g.add(t1); return g; }
function makeLabelSprite(text){ const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d'); g.fillStyle = 'rgba(20,16,60,.8)'; g.beginPath(); g.roundRect(4, 4, 248, 88, 30); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 56px Pretendard, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 50);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(1.4, .52, 1); return s; }

// ───────────────── 미션 5: 거꾸로 마법사의 성
export class Castle extends Base {
  static info = { id: 'castle', no: 5, name: '거꾸로 마법사의 성', theme: 'castle', color: '#ff9fc8', rules: ['lr', 'arms', 'size', 'move', 'gravity'] };
  start(){
    this.W.setTheme('castle'); this.A.play('castle');
    this.hero = this.makeHero().faceNow('back'); this.hero.root.scale.setScalar(1.25); this.hx = 0; this.hy = 0; this.hz = 2.2; this.hero.root.position.set(0, 0, this.hz);
    const all = [
      { text: '오른쪽 별을 잡아라!', kind: 'star', side: 1, rule: 'lr', picto: 'moveL', tip: '오른쪽 별은 내가 반대쪽으로 가야 잡을 수 있어요!' },
      { text: '작은 모습으로 변신해라!', kind: 'size', need: 'small', rule: 'size', picto: 'spread', tip: '작아지려면 거꾸로, 크게 펼쳐요!' },
      { text: '왼팔을 들어 마법을 사용해라!', kind: 'arm', side: 'sl', rule: 'arms', picto: 'armR', tip: '캐릭터 왼팔은 내 오른팔이 움직여요!' },
      { text: '움직이지 않는 캐릭터를 앞으로 보내라!', kind: 'go', rule: 'move', picto: 'still', tip: '가만히 멈추면 캐릭터가 앞으로 가요!' },
      { text: '천장에 있는 보석을 획득해라!', kind: 'gem', rule: 'gravity', picto: 'crouch', tip: '위로 올라가려면 몸을 낮춰요!' },
      { text: '왼쪽 별을 잡아라!', kind: 'star', side: -1, rule: 'lr', picto: 'moveR', tip: '왼쪽 별은 내가 반대쪽으로!' },
      { text: '큰 모습으로 변신해라!', kind: 'size', need: 'big', rule: 'size', picto: 'crouch', tip: '커지려면 거꾸로, 웅크려요!' },
      { text: '오른팔을 들어 마법을 사용해라!', kind: 'arm', side: 'sr', rule: 'arms', picto: 'armL', tip: '캐릭터 오른팔은 내 왼팔이 움직여요!' },
    ];
    this.cmds = this.short ? [all[0], all[1], all[3], all[4]] : all; this.total = this.cmds.length; this.ui.progress(0, this.total);
    this.ki = -1; this.phase = 'intro'; this.introT = 0; this.ui.setRules({ lr: true, arms: true, size: true, move: true, gravity: true });
    this.ui.task('마법사의 명령을 잘 들어요!', '🏰');
    this.say('거꾸로 마법사의 성이에요. 마법사의 명령을 잘 듣고, 지금까지 배운 거꾸로 규칙을 모두 써 보세요!');
  }
  nextCmd(){ this.ki++; this.clearHint(); this.hold = 0; this.cT = 0; this.cleanTarget(); this.hero.setDrive(null);
    if (this.ki >= this.cmds.length) { this.phase = 'ending'; this.endT = 0; this.startEnding(); return; }
    const C = this.cmds[this.ki]; this.phase = 'cmd'; this.ui.task('🧙 ' + C.text, ''); this.ui.command(C.picto, C.text); this.say('마법사의 명령! ' + C.text);
    const wz = this.W.wizard; if (wz) { this.W.burst(V3(.7, wz.position.y + 2.3, -7.3), 0xbff4ff, 50, 4); this.A.magic(); }
    if (C.kind === 'star') { const s = makeStar(0xffd35a, 1.2); s.position.set(C.side * 4.6, 1.2, this.hz); this.W.dyn.add(s); this.target = s; }
    if (C.kind === 'gem') { const g = makeGem(); g.position.set(this.hx, 4.6, this.hz); this.W.dyn.add(g); this.target = g; }
    if (C.kind === 'go') { const m = new THREE.Mesh(new THREE.RingGeometry(.6, .8, 32), new THREE.MeshBasicMaterial({ color: 0xffd35a, side: THREE.DoubleSide, transparent: true, opacity: .9 })); m.rotation.x = -Math.PI / 2; m.position.set(this.hx, .04, -2.6); this.W.dyn.add(m); this.target = m; }
    this.rules = { ...ALL_OFF, [C.rule]: true }; this.ui.setRules(this.rules); }
  cleanTarget(){ if (this.target) { this.W.dyn.remove(this.target); this.target = null; } }
  update(dt, f){
    this.t += dt; const H = this.hero;
    if (this.phase === 'intro') { this.introT += dt; H.set('idle'); H.update(dt); if (this.introT > 3.2) this.nextCmd(); return; }
    if (this.phase === 'ending') { this.updateEnding(dt); return; }
    const C = this.cmds[this.ki];
    if (this.phase === 'between') { this.betT += dt; if (C.kind === 'go') { this.hz = damp(this.hz, 2.2, 2.5, dt); H.set('idle'); } this.hy = damp(this.hy, 0, 5, dt); H.root.position.set(this.hx, this.hy, this.hz); H.update(dt); if (this.betT > 1.6) { if (C.kind === 'go') this.hz = 2.2; this.nextCmd(); } return; }
    const c = transform(f, this.rules); this.cT += dt;
    let ok = false;
    if (C.kind === 'star') { this.hx = damp(this.hx, this.px(c.x) * 4.8, 6, dt); const s = this.target; s.userData.spin.rotation.y = Math.sin(this.t * 2) * .6; ok = Math.abs(s.position.x - this.hx) < (this.S.diff === 'easy' ? 1.1 : .85); if (ok) this.hold = this.D.hold; }
    if (C.kind === 'size') { const want = c.size === 'big' ? 1.6 : c.size === 'small' ? .5 : 1; if (Math.abs(want - H.scaleT) > .2) (want > H.scaleT ? this.A.grow() : this.A.shrink()); H.setScale(want); ok = c.size === C.need; }
    else if (this.phase === 'cmd' && C.kind !== 'size') H.setScale(1);
    if (C.kind === 'arm') { H.setDrive({ sl: c.sl, sr: c.sr, tilt: 0 }); ok = C.side === 'sl' ? (c.slUp && !c.srUp) : (c.srUp && !c.slUp); }
    if (C.kind === 'go') { if (c.go && this.hz > -2.4) { this.hz -= dt * 1.3; H.set('walk'); } else H.set('idle'); ok = this.hz <= -2.4; if (ok) this.hold = this.D.hold; }
    if (C.kind === 'gem') { this.hy = damp(this.hy, clamp(c.lift, 0, 1) * 3.8, 5, dt); H.set(this.hy > .25 ? 'float' : 'idle'); this.target.userData.spin.rotation.y += dt * 2; ok = this.hy > 3.2; if (ok) this.hold = this.D.hold; }
    else this.hy = damp(this.hy, 0, 6, dt);
    if (C.kind !== 'go' && C.kind !== 'gem') H.set('idle');
    this.hold = clamp(this.hold + (ok ? dt : -dt), 0, this.D.hold); this.ui.hold(this.hold / this.D.hold);
    H.root.position.set(this.hx, this.hy, this.hz); H.update(dt);
    if (this.hold >= this.D.hold) { this.ui.hold(0); this.win(); this.ui.command(null); const p = this.target ? this.target.position.clone() : V3(this.hx, 1.5, this.hz);
      if (C.kind === 'arm') { const hand = H.handWorld(C.side === 'sl' ? 'R' : 'L'); this.beam(hand, V3(.7, this.W.wizard.position.y + 2.3, -7.3)); }
      this.W.burst(p, 0xffd35a, 70, 5); this.W.ring(p, 0xff9fc8, 1.6); H.setMood('cheer', 1.2); this.ui.toast(['잘했어요!', '거꾸로 마법 성공!', '멋진 탐험대원!', '마법사도 깜짝!'][this.sub % 4]);
      this.phase = 'between'; this.betT = 0; H.setScale(1); }
    if (this.phase === 'cmd' && this.cT > this.D.hint + 2) this.hint(C.picto, C.tip);
  }
  beam(a, b){ const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push(a.clone().lerp(b, u).add(V3(0, Math.sin(u * Math.PI) * 1.2, 0))); } const g = new THREE.BufferGeometry().setFromPoints(pts);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 1 })); this.W.scene.add(l); let t = 0; this.W.oneshots = (this.W.oneshots || []).concat(dt => { t += dt; l.material.opacity = 1 - t; if (t > 1) { this.W.scene.remove(l); g.dispose(); return false; } return true; });
    for (let i = 0; i < 6; i++) setTimeout(() => this.W.burst(pts[i * 3], 0xbff4ff, 12, 2), i * 60); }
  // 엔딩: 다섯 조각이 모여 성이 바로 선다
  startEnding(){ this.ui.task('다섯 개의 마법 조각이 모여요!', '✨'); this.say('다섯 개의 마법 조각이 하나로 모여요!'); this.A.play('ending');
    this.hero.face('front'); this.hero.set('idle'); this.hy = 0; this.hz = 2.2; this.ui.setRules({}); this.ui.command(null); this.hero.setScale(1);
    const cols = [0x9fe9ff, 0x8fe88f, 0xffd166, 0xc89bff, 0xff9fc8]; this.pieces = cols.map((c, i) => { const g = makeGem(c); g.scale.setScalar(.6); const a = i / 5 * Math.PI * 2; g.position.set(Math.cos(a) * 7, 3 + Math.sin(a) * 3, 0); this.W.dyn.add(g); return { g, a }; });
    this.ui.ending(true); }
  updateEnding(dt){ this.endT += dt; const t = this.endT, H = this.hero; const ctr = V3(0, 3.6, 0);
    this.pieces.forEach((p, i) => { p.g.userData.spin.rotation.y += dt * 3; const r = t < 3 ? 7 - t * 2.2 : Math.max(0, .4 - (t - 3) * .4); const a = p.a + t * 1.6; p.g.position.set(Math.cos(a) * r, ctr.y + Math.sin(a) * r * .5, ctr.z); p.g.visible = t < 4.2; });
    if (t > 4.2 && !this.flashed) { this.flashed = true; this.A.piece(); this.W.burst(ctr, 0xffffff, 200, 9, -1); this.W.ring(ctr, 0xffd35a, 4); this.W.kick(.4); this.ui.flash(); this.say('거꾸로 나라의 마법이 풀렸어요!'); }
    if (t > 4.2) { const k = Math.min(1, (t - 4.2) / 3); const oc = this.W.outsideCastle; if (oc) { oc.rotation.z = Math.PI * (1 - easeIO(k)); oc.position.y = 17 - easeIO(k) * 16; }
      if (this.W.castleWall) this.W.castleWall.position.y = -easeIO(Math.min(1, (t - 4.2) / 1.6)) * 10;
      if (this.W.castleRune) this.W.castleRune.material.color.setHSL((t * .1) % 1, .7, .7);
      const u = this.W.sky.material.uniforms; u.top.value.lerpColors(new THREE.Color(0x1a0f45), new THREE.Color(0x4aa8ff), k); u.mid.value.lerpColors(new THREE.Color(0x7a3fb8), new THREE.Color(0xffd8f0), k); this.W.hemi.intensity = .8 + k * .6;
      H.set('cheer'); H.setMood('cheer', 1); if (Math.random() < dt * 3) this.W.burst(V3(rnd(-6, 6), rnd(4, 8), rnd(-8, -3)), [0xff9fc8, 0xffd166, 0x9fe9ff, 0x8fe88f][Math.random() * 4 | 0], 60, 5, -1.5);
      this.W.setCam(V3(0, 3.6, 11.5), V3(0, 4.2, -4), { sway: .3, follow: 1.5 }); }
    H.root.position.set(0, 0, this.hz); H.update(dt);
    if (t > 9.5) { this.ui.ending(false); this.finish(); } }
}
const easeIO = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

export const MISSIONS = [Mirror, Forest, Town, Lab, Castle];
