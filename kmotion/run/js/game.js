// K-MOTION RUN · GameEngine / PlayerController / ObstacleManager / CollisionSystem / ScoreManager
import * as THREE from 'three';
import { LANES } from './scene.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
function jitter(geo, amt){ const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (1 + rnd(-amt, amt)), p.getY(i) * (1 + rnd(-amt, amt)), p.getZ(i) * (1 + rnd(-amt, amt))); geo.computeVertexNormals(); return geo; }

export const DIFF = {
  easy:   { speed: 10.5, ramp: .22, react: 1.75, label: '쉬움' },
  normal: { speed: 12.5, ramp: .30, react: 1.45, label: '보통' },
  hard:   { speed: 15.0, ramp: .36, react: 1.15, label: '어려움' },
};
export const GAME_TIME = 60;

// ───────── 장애물 모델 (풀)
function makeRock(){ const g = new THREE.Group(); const m = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.95, 1), .22), new THREE.MeshStandardMaterial({ color: 0x8f8c84, roughness: .95, flatShading: true })); m.scale.set(1.15, .9, 1); m.position.y = .55; m.castShadow = true; m.receiveShadow = true; g.add(m);
  const moss = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.5, 1), .3), new THREE.MeshStandardMaterial({ color: 0x4f9a46, roughness: 1, flatShading: true })); moss.position.set(-.25, 1.05, -.15); moss.scale.set(1.3, .5, 1.2); g.add(moss);
  const small = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(.35, 0), .3), m.material); small.position.set(.7, .25, .4); small.castShadow = true; g.add(small); return g; }
function makeLog(){ const g = new THREE.Group(); const bark = new THREE.MeshStandardMaterial({ color: 0x6e4a2a, roughness: 1, flatShading: true });
  const body = new THREE.Mesh(jitter(new THREE.CylinderGeometry(.46, .5, 8.4, 12, 6), .05), bark); body.rotation.z = Math.PI / 2; body.position.y = .48; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const ringM = new THREE.MeshStandardMaterial({ color: 0xc9a06c, roughness: .9 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.44, .44, .06, 14), ringM); r.rotation.z = Math.PI / 2; r.position.set(s * 4.22, .48, 0); g.add(r); }
  for (let i = 0; i < 3; i++) { const st = new THREE.Mesh(new THREE.CylinderGeometry(.08, .14, .6, 6), bark); st.position.set(rnd(-3, 3), .8, rnd(-.2, .2)); st.rotation.z = rnd(-.6, .6); st.rotation.x = rnd(-.6, .6); g.add(st); }
  const shroom = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe55b3c, roughness: .6 })); shroom.position.set(2.1, .95, .1); g.add(shroom); return g; }
function makeBranch(){ const g = new THREE.Group(); const bark = new THREE.MeshStandardMaterial({ color: 0x5c3e24, roughness: 1, flatShading: true });
  const bough = new THREE.Mesh(jitter(new THREE.CylinderGeometry(.24, .3, 11, 10, 5), .06), bark); bough.rotation.z = Math.PI / 2; bough.position.y = 1.45; bough.castShadow = true; g.add(bough);
  for (const s of [-1, 1]) { const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.28, .42, 4, 8), bark); trunk.position.set(s * 5.1, 2, 0); trunk.castShadow = true; g.add(trunk); }
  const leafM = new THREE.MeshStandardMaterial({ color: 0x3f9d57, roughness: .9, flatShading: true });
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(rnd(.45, .75), 1), .15), leafM); l.position.set(rnd(-4.6, 4.6), 1.45 + rnd(-.25, .55), rnd(-.3, .3)); l.castShadow = true; g.add(l); }
  for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.CylinderGeometry(.03, .05, rnd(.4, .7), 5), bark); v.position.set(rnd(-3.5, 3.5), 1.15, 0); g.add(v); }
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(6.4, .05), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: .0 })); warn.rotation.x = -Math.PI / 2; warn.position.y = .03; g.add(warn); g.userData.warn = warn; return g; }
function makeCoin(){ const m = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .09, 20), new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: .6, roughness: .25, emissive: 0x6b4a00, emissiveIntensity: .6 })); m.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(m);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .1, 20), new THREE.MeshStandardMaterial({ color: 0xfff1a8, metalness: .5, roughness: .3, emissive: 0x8a6400, emissiveIntensity: .5 })); inner.rotation.x = Math.PI / 2; g.add(inner); return g; }

class Pool { constructor(scene, make, n){ this.items = []; for (let i = 0; i < n; i++) { const o = make(); o.visible = false; scene.add(o); this.items.push(o); } }
  get(){ const o = this.items.find(o => !o.visible); if (o) o.visible = true; return o; } }

// ───────── 입력 이벤트 (키보드·동작인식 공통)
export class InputManager {
  constructor(){ this.subs = {}; }
  on(type, fn){ (this.subs[type] = this.subs[type] || []).push(fn); return this; }
  emit(type, data){ (this.subs[type] || []).forEach(f => f(data || {})); (this.subs['*'] || []).forEach(f => f(Object.assign({ type }, data))); }
}

// ───────── 점수
export class ScoreManager {
  constructor(){ this.reset(); }
  reset(){ this.score = 0; this.combo = 0; this.maxCombo = 0; this.dodges = 0; this.coins = 0; }
  dodge(){ this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.dodges++; const bonus = Math.min(5, Math.floor(this.combo / 3)) * 20; this.score += 100 + bonus; return { combo: this.combo, bonus }; }
  coin(){ this.coins++; this.score += 20; }
  hit(){ this.combo = 0; }
}

// ───────── 플레이어
export class PlayerController {
  constructor(){ this.reset(); }
  reset(){ const z = this.z || 0; this.lane = 1; this.x = 0; this.z = z; this.y = 0; this.vy = 0; this.air = false; this.slide = 0; this.state = 'run'; this.inv = 0; this.lanePush = 0; this.stepT = 0; this.hitT = 0; this.slideBuf = 0; }
  move(dir){ const n = Math.max(0, Math.min(2, this.lane + dir)); if (n !== this.lane) { this.lane = n; this.lanePush = dir; return true; } return false; }
  jump(){ if (this.air) return false; this.slide = 0; this.air = true; this.vy = 8.4; this.state = 'jump'; return true; }
  doSlide(){ if (this.air) { this.slideBuf = .4; return false; } if (this.slide > 0) { this.slide = Math.max(this.slide, .7); return false; } this.slide = .85; this.state = 'slide'; return true; }
  get height(){ return this.slide > 0 ? .7 : 1.75; }
  update(dt, speed, ev){
    this.z -= speed * dt; const tx = LANES[this.lane]; const dx = tx - this.x; this.x += dx * (1 - Math.exp(-dt * 11)); this.lanePush = Math.max(-1, Math.min(1, dx * .9));
    if (this.air) { this.y += this.vy * dt; this.vy -= 22 * dt; if (this.y <= 0) { this.y = 0; this.air = false; this.vy = 0; this.state = 'land'; ev('land'); if (this.slideBuf > 0) { this.slideBuf = 0; this.doSlide(); ev('slide'); } }
    if (this.slideBuf > 0) this.slideBuf -= dt; }
    if (this.slide > 0) { this.slide -= dt; if (this.slide <= 0) { this.slide = 0; this.state = 'run'; } }
    if (this.inv > 0) this.inv -= dt;
    if (this.hitT > 0) { this.hitT -= dt; if (this.hitT <= 0 && this.state === 'hit') this.state = 'run'; }
    this.stepT += dt * speed; if (this.stepT > 2.4 && !this.air && this.slide <= 0) { this.stepT = 0; ev('step'); }
  }
}

// ───────── 장애물 생성 (패턴 기반, 회피 가능 보장)
export class ObstacleManager {
  constructor(scene){ this.scene = scene; this.pools = { rock: new Pool(scene, makeRock, 12), log: new Pool(scene, makeLog, 5), branch: new Pool(scene, makeBranch, 5), coin: new Pool(scene, makeCoin, 48) }; this.active = []; this.coins = []; this.reset(); }
  reset(pz = 0){ for (const o of this.active) o.mesh.visible = false; for (const c of this.coins) c.mesh.visible = false; this.active = []; this.coins = []; this.nextZ = pz - 34; this.lastKind = null; this.freeLanes = [0, 1, 2]; this.coinT = 0; }
  // 다음 패턴을 플레이어 앞에 깐다. gap = 속도 × 반응 시간(동작인식 지연 포함)
  plan(elapsed, speed, diff, pz){
    while (this.nextZ > pz - 150) {
      const prog = elapsed / GAME_TIME; const react = diff.react * (prog < .17 ? 1.45 : prog < .5 ? 1.15 : 1);
      const gap = speed * react;
      let kinds = prog < .17 ? ['rock', 'rock', 'log', 'branch'] : ['rock', 'rock', 'rock2', 'log', 'branch', 'log', 'branch'];
      let kind = pick(kinds); if (kind === this.lastKind && Math.random() < .6) kind = pick(kinds);
      const z = this.nextZ; let next = gap;
      if (kind === 'rock') { const lane = pick(this.freeLanes.length ? this.freeLanes : [0, 1, 2]); this.spawn('rock', z, lane); this.freeLanes = [0, 1, 2].filter(l => l !== lane); }
      else if (kind === 'rock2') { // 두 차선 막기 — 열린 차선은 직전 열린 차선과 이웃해야 함
        const cand = [0, 1, 2].filter(l => this.freeLanes.some(f => Math.abs(f - l) <= 1)); const free = pick(cand.length ? cand : [1]);
        for (const l of [0, 1, 2]) if (l !== free) this.spawn('rock', z, l); this.freeLanes = [free]; next = gap * 1.1; }
      else if (kind === 'log') { this.spawn('log', z, 1); this.freeLanes = [0, 1, 2]; if (Math.random() < .55) this.coinArc(z); }
      else if (kind === 'branch') { this.spawn('branch', z, 1); this.freeLanes = [0, 1, 2]; }
      // 후반: 두 동작 연속(점프→슬라이드, 바위→통나무)
      if (prog > .55 && Math.random() < .45 && (kind === 'log' || kind === 'branch')) { const k2 = kind === 'log' ? 'branch' : 'log'; const z2 = z - gap * .88; this.spawn(k2, z2, 1); next += gap * .88; }
      else if (prog > .5 && kind === 'rock' && Math.random() < .35) { const z2 = z - gap * .7; this.spawn('log', z2, 1); this.freeLanes = [0, 1, 2]; next += gap * .7; }
      if (kind === 'rock' && Math.random() < .6) this.coinLine(z, pick(this.freeLanes), 4);
      this.lastKind = kind; this.nextZ = z - next;
    }
  }
  spawn(kind, z, lane){ const m = this.pools[kind].get(); if (!m) return; m.position.set(kind === 'rock' ? LANES[lane] : 0, 0, z); m.rotation.y = kind === 'rock' ? rnd(0, 6) : 0; this.active.push({ kind, z, lane, mesh: m, passed: false }); }
  coinLine(z, lane, n){ for (let i = 0; i < n; i++) this.coin(LANES[lane], .9, z - 1.3 - i * 1.3); }
  coinArc(z){ const lane = 1; for (let i = -2; i <= 2; i++) this.coin(LANES[lane], 1.1 + (2 - Math.abs(i)) * .55, z + i * 1.3); }
  coin(x, y, z){ const m = this.pools.coin.get(); if (!m) return; m.position.set(x, y, z); this.coins.push({ mesh: m, x, y, z, got: false }); }
  update(dt, pz, t){ for (const c of this.coins) { c.mesh.rotation.y = t * 4; c.mesh.position.y = c.y + Math.sin(t * 3 + c.z) * .08; }
    for (const o of this.active) { if (o.kind === 'branch') { const d = o.z - pz; o.mesh.userData.warn.material.opacity = d < 0 && d > -45 ? Math.min(1, (45 + d) / 25) * .5 : 0; } }
    this.active = this.active.filter(o => { if (o.z > pz + 10) { o.mesh.visible = false; return false; } return true; });
    this.coins = this.coins.filter(c => { if (c.z > pz + 6 || c.got) { c.mesh.visible = false; return false; } return true; }); }
}

// ───────── 충돌
export class CollisionSystem {
  check(player, obs, ev){
    for (const o of obs.active) {
      const dz = o.z - player.z; // 플레이어가 -z 로 가므로 장애물은 뒤로 흐름
      if (!o.passed && dz > 0.9) { o.passed = true; if (!o.hitThis) ev('dodge', o); continue; }
      if (o.passed) continue;
      const depth = o.kind === 'rock' ? 1.1 : o.kind === 'log' ? .7 : .55;
      if (Math.abs(dz) > depth) continue;
      let hit = false;
      if (o.kind === 'rock') hit = Math.abs(player.x - LANES[o.lane]) < 1.25 && player.y < 1.0;
      else if (o.kind === 'log') hit = player.y < .78;
      else if (o.kind === 'branch') hit = player.slide <= 0 || player.y > .15;
      if (hit && player.inv <= 0) { o.hitThis = true; o.passed = true; ev('hit', o); }
    }
    for (const c of obs.coins) { if (!c.got && Math.abs(c.z - player.z) < .8 && Math.abs(c.x - player.x) < 1 && Math.abs(c.y - (player.y + .9)) < 1.1) { c.got = true; ev('coin', c); } }
  }
}

// ───────── 게임 엔진
export class GameEngine {
  constructor(scene, input, hooks){
    this.player = new PlayerController(); this.score = new ScoreManager(); this.obs = new ObstacleManager(scene); this.col = new CollisionSystem(); this.hooks = hooks; this.input = input;
    this.state = 'idle'; this.elapsed = 0; this.life = 3; this.diff = DIFF.normal; this.speed = 0; this.speedNorm = 0; this.t = 0;
    input.on('MOVE_LEFT', () => this.state === 'play' && this.player.move(-1) && hooks.fx('lane', -1));
    input.on('MOVE_RIGHT', () => this.state === 'play' && this.player.move(1) && hooks.fx('lane', 1));
    input.on('JUMP', () => this.state === 'play' && this.player.jump() && hooks.fx('jump'));
    input.on('SLIDE', () => this.state === 'play' && this.player.doSlide() && hooks.fx('slide'));
    input.on('PAUSE', () => { if (this.state === 'play') this.pause('manual'); else if (this.state === 'pause') this.resume(); });
  }
  start(diffKey){ this.diff = DIFF[diffKey] || DIFF.normal; this.player.reset(); this.score.reset(); this.obs.reset(this.player.z); this.elapsed = 0; this.life = 3; this.state = 'play'; this.pauseReason = null; this.obs.plan(0, this.diff.speed, this.diff, this.player.z); }
  pause(reason){ if (this.state !== 'play') return; this.state = 'pause'; this.pauseReason = reason; this.hooks.pause(reason); }
  resume(){ if (this.state !== 'pause') return; this.state = 'play'; this.player.inv = Math.max(this.player.inv, .6); this.hooks.resume(); }
  end(win){ this.state = 'end'; this.hooks.end({ win, score: this.score.score, time: Math.min(GAME_TIME, this.elapsed), dodges: this.score.dodges, maxCombo: this.score.maxCombo, coins: this.score.coins }); }
  get timeLeft(){ return Math.max(0, GAME_TIME - this.elapsed); }
  update(dt){
    this.t += dt; if (this.state !== 'play') { this.speedNorm *= .95; return; }
    this.elapsed += dt; const prog = Math.min(1, this.elapsed / GAME_TIME); this.speed = this.diff.speed * (1 + this.diff.ramp * prog); this.speedNorm = Math.min(1, (this.speed - 10) / 10);
    const p = this.player, H = this.hooks;
    p.update(dt, this.speed, kind => H.fx(kind));
    this.obs.plan(this.elapsed, this.speed, this.diff, p.z); this.obs.update(dt, p.z, this.t);
    this.col.check(p, this.obs, (kind, o) => {
      if (kind === 'dodge') { const r = this.score.dodge(); H.fx('dodge', r); }
      else if (kind === 'coin') { this.score.coin(); H.fx('coin', o); }
      else if (kind === 'hit') { this.score.hit(); this.life--; p.inv = 1.6; p.state = 'hit'; p.hitT = .45; p.slide = 0; if (p.air) { p.vy = Math.min(p.vy, 2); } H.fx('hit', o); if (this.life <= 0) { this.end(false); } }
    });
    if (this.elapsed >= GAME_TIME && this.state === 'play') { p.state = 'win'; this.end(true); }
  }
}
