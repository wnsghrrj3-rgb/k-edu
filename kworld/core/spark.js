// 케이히스토리 엔진 · spark.js — 「설렘·반응 층」. world.spark 가 있으면 켜진다. 코어는 시대 이름을 모른다. (?spark=0 끔)
//  · 117: 소문(gaze.rules rm_*) — 다음 큰 사건의 전조를 사람 입으로 먼저 듣는다(생성기 gen_rumor.py). 들은 규칙의 flag 가 서고, 그 상황의 급한 일(pulse.deadlines rumor:)은 시간이 heardBonus(기본 15초)만큼 는다 — 소식을 먼저 아는 집이 살아남았다.
//  · 마을의 눈(gaze): 사람 곁을 지나면 그 사람이 나를 보고 한마디 — 인심이 좋으면 반기고(가끔 뭘 쥐여 준다), 나쁘면 등을 돌리고, 절뚝이면 그걸 본다.
//      내가 한 선택이 마을 사람 입으로 돌아온다. 같은 사람은 하늘이 한 번 바뀔 때까지 다시 말하지 않는다.
//  · 칭호(titles): 어떤 깃발이 서면 이름이 하나 붙는다 — 「발소리를 떨군 사람」. 이 기기 kworld_titles 에 남아 족보 상자에 보인다. 쓴 것도 명예다.
//  · 돌발(surprises): 길을 걷다가 느닷없이 — 낯선 사람·버려진 것·밤의 소리. 상황 카드와 달리 자리가 없다. 한 판에 한 번씩, 간격을 두고, 조용할 때만.
//      고르면 값·흔적·깃발이 바로 온다. 굴림이 있으면 능력으로 판다. 📜 실제 한 줄.
//  · 밤의 설렘(wonder): 밤이면 반딧불이가 발치에 떠다니고, 가끔 별똥별이 진다 — 보고만 있어도 좋은 것. 세 번 보면 칭호.
import * as THREE from 'three';
import { Pulse } from './pulse.js';
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const V = { craft: '✋ 솜씨', heart: '🤝 인심', grain: '🌾 곡식' };

export class Spark {
  constructor(g, cfg) { this.g = g; this.cfg = cfg || {}; this.t = 0; this.gazeT = 0; this.surT = 0; this.sinceSur = (cfg?.firstGap ?? 70); this.skyKey = null; this.spoken = new Set(); this.stars = 0; this.ff = null; this.shot = null; this.dom(); }
  dom() {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function' || document.getElementById('sparkbadge')) return;
    const st = document.createElement('style'); st.textContent = `#sparkbadge{position:fixed;left:0;right:0;margin:0 auto;width:max-content;bottom:94px;z-index:30;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:6px 10px;font-size:12px;backdrop-filter:blur(10px);display:none;cursor:pointer}#sparkbadge b{color:#ffd37a}#sparkbadge.pop{animation:spop .7s}@keyframes spop{0%{transform:scale(.8)}50%{transform:scale(1.15)}100%{transform:scale(1)}}@media(max-height:540px){#sparkbadge{left:auto;right:14px;top:152px;bottom:auto;margin:0}}.chk.title .tag{color:#ffd37a}.chk.sur .tag{color:#9fd0ff}.tlist{list-style:none;padding:0;margin:8px 0 0}.tlist li{padding:6px 0;border-top:1px solid rgba(255,255,255,.08);font-size:13.5px}.tlist li:first-child{border-top:0}.tlist .te{font-size:11px;opacity:.6;margin-left:8px}.tlist .tl{font-size:12px;opacity:.8;margin-top:2px}`;
    document.head.appendChild(st); this.badge = document.createElement('div'); this.badge.id = 'sparkbadge'; this.badge.onclick = () => this.openTitles(); document.body.appendChild(this.badge); this.renderBadge();
  }
  dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
  quiet() { const g = this.g; return !g.ui.isOpen?.() && !g.pulse?.chase && !g.pulse?.deadline && !g.story?.cutsceneOn && !g.danger?.enc && g.p?.enabled !== false; }
  // ---------- 칭호 ----------
  static titles() { try { return JSON.parse(localStorage.getItem('kworld_titles') || '[]'); } catch { return []; } }
  hasTitle(id) { return this.g.flags.has('title:' + id); }
  earn(t) {
    const g = this.g; g.flags.add('title:' + t.id);
    try { const list = Spark.titles(); if (!list.some((x) => x.id === t.id && x.era === g.era)) { list.push({ id: t.id, era: g.era, name: t.name, line: t.line || null, bitter: !!t.bitter, t: Date.now() }); localStorage.setItem('kworld_titles', JSON.stringify(list.slice(-60))); } } catch { }
    g.sound?.play?.(t.bitter ? 'bad' : 'good', 0.5); g.ui.say(`🏅 ${t.bitter ? '남은 이름' : '얻은 이름'} — **${t.name}**${t.line ? `\n${t.line}` : ''}`, 5600); this.renderBadge(true); g.save?.touch();
  }
  checkTitles() { const g = this.g; for (const t of this.cfg.titles || []) if (!this.hasTitle(t.id) && g.cond(t.on)) this.earn(t); }
  renderBadge(pop) { if (!this.badge) return; const mine = Spark.titles().filter((t) => t.era === this.g.era); this.badge.style.display = mine.length ? 'block' : 'none'; this.badge.innerHTML = `🏅 <b>${esc(mine[mine.length - 1]?.name || '')}</b>${mine.length > 1 ? ` <span style="opacity:.6">+${mine.length - 1}</span>` : ''}`; if (pop) { this.badge.classList.remove('pop'); void this.badge.offsetWidth; this.badge.classList.add('pop'); } }
  openTitles() { const g = this.g; if (g.ui.isOpen?.()) return; const all = Spark.titles(); const mine = all.filter((t) => t.era === g.era), past = all.filter((t) => t.era !== g.era); g.p.enabled = false;
    const li = (t) => `<li><b>${t.bitter ? '🩹' : '🏅'} ${esc(t.name)}</b>${t.era !== g.era ? `<span class="te">${esc(t.era)}</span>` : ''}${t.line ? `<div class="tl">${esc(t.line)}</div>` : ''}</li>`;
    g.ui.open(`<div class="chk life title"><div class="tag">🏅 붙은 이름</div><h3>이 시대에서 ${mine.length}개</h3><ul class="tlist">${mine.map(li).join('')}</ul>${past.length ? `<p class="sub" style="margin-top:12px">지난 시대 ${past.length}개</p><ul class="tlist">${past.slice(-6).map(li).join('')}</ul>` : ''}<p class="sub">이름은 한 일로 붙는다. 쓴 것도 남는다 — 족보에 같이 내려간다.</p></div>`, [{ label: '닫는다', primary: true, onClick: () => { g.ui.close(); g.p.enabled = true; } }]); }
  // ---------- 마을의 눈 ----------
  tickGaze(dt) {
    const g = this.g; const G = this.cfg.gaze; if (!G) return; const key = g.story?.skyName || 'day'; if (key !== this.skyKey) { this.skyKey = key; this.spoken.clear(); }
    this.gazeT += dt; if (this.gazeT < 0.6) return; this.gazeT = 0; if (this.lastGaze && performance.now() - this.lastGaze < (G.gapMs || 14000)) return; if (!this.quiet()) return;
    const p = g.p.pos; for (const [name, it] of g.e.interactables) { if (!name.startsWith('npc_') || name.startsWith('npc_chaser') || !it?.obj || it.disabled) continue; const id = name.slice(4); if (this.spoken.has(id)) continue; const d = this.dist({ x: it.obj.position.x, z: it.obj.position.z }, p); if (d > (G.r || 3.4)) continue;
      const line = this.pickGaze(G, id); this.spoken.add(id); if (!line) continue; this.lastGaze = performance.now(); const who = g.npcs?.[id]?.name || it.label || it.name || '누군가'; g.ui.say(`💬 ${who.replace(/\(.*?\)/g, '').trim()} — ${line.text}`, 4600);
      if (line.give && !g.flags.has('gaze:gift:' + id)) { g.flags.add('gaze:gift:' + id); setTimeout(() => this.apply(line.give, '건네받은 것'), 900); } if (line.sound) g.sound?.play?.(line.sound, 0.3); return; }
  }
  pickGaze(G, id) {
    const g = this.g; const v = g.life?.values || {}; const h = g.life?.hurt || new Set(); const list = [];
    for (const r of G.rules || []) { if (r.who && r.who !== id) continue; if (r.once && g.flags.has('gaze:said:' + r.id)) continue; if (r.if && !g.cond(r.if)) continue; list.push(r); }   // 시대 데이터 규칙(깃발·신분 조건) 우선 — 내 선택이 사람 입으로 돌아온다
    if (list.length) { const r = list[Math.floor(Math.random() * list.length)]; if (r.once) g.flags.add('gaze:said:' + r.id); if (r.flag) for (const f of [].concat(r.flag)) g.flags.add(f); return r; }   // 117: 소문 — 들으면 깃발이 선다(rumor:<다음 상황>:heard → 그 급한 일에 여유가 붙는다)
    const band = h.has('leg') && Math.random() < 0.5 ? 'mark' : (v.heart || 0) >= (G.warmAt ?? 5) ? 'warm' : (v.heart || 0) <= (G.coldAt ?? 0) && (g.life?.log?.length || 0) >= 2 ? 'cold' : null; if (!band) return null;
    const pool = G[band] || []; if (!pool.length) return null; const text = pool[Math.floor(Math.random() * pool.length)]; const line = { text, band };
    if (band === 'warm' && G.gift && Math.random() < (G.giftP ?? 0.35)) line.give = G.gift; if (band === 'cold') line.sound = null; return line;
  }
  // ---------- 돌발 ----------
  tickSurprise(dt) {
    const g = this.g; const S = this.cfg.surprises; if (!S?.length) return; this.sinceSur += dt; this.surT += dt; if (this.surT < 2) return; this.surT = 0;
    if (this.sinceSur < (this.cfg.gapSec || 110) || !this.quiet() || !g.p.moving) return; if (!this.lastSurAt) this.lastSurAt = { x: g.p.pos.x, z: g.p.pos.z }; else if (this.dist(this.lastSurAt, g.p.pos) < 18) return;   // 같은 자리에서 또 안 온다
    const night = !!g.story?.isNight; const cands = S.filter((s) => !g.flags.has('sur:' + s.id) && (s.night == null || !!s.night === night) && g.cond(s.if)); if (!cands.length) return;
    if (Math.random() > (this.cfg.chance ?? 0.5)) { this.sinceSur = (this.cfg.gapSec || 110) - 20; return; }
    const chained = cands.filter((s) => s.if); const pool = chained.length && Math.random() < 0.7 ? chained : cands;   // 이어지는 이야기(운명의 사람)는 먼저 온다
    this.openSurprise(pool[Math.floor(Math.random() * pool.length)]);
  }
  openSurprise(s) {
    const g = this.g; g.flags.add('sur:' + s.id); this.sinceSur = 0; this.lastSurAt = { x: g.p.pos.x, z: g.p.pos.z }; g.p.enabled = false; g.sound?.play?.(s.sound || (s.night ? 'growl' : 'drum'), 0.35); if (s.tension) g.pulse?.tension?.(s.tension);
    const ways = (s.ways || []).map((w) => { const off = w.if && !g.cond(w.if); return { label: (off ? '▫ ' : '') + w.label + (w.roll ? ' 🎲' : ''), disabled: off, reason: off ? (w.why || '지금은 못 한다') : '', onClick: () => { if (off) return; this.chooseSurprise(s, w); } }; });
    g.ui.open(`<div class="chk life sur"><div class="tag">⚡ ${esc(s.tag || '느닷없이')}</div><h3>${esc(s.title || '')}</h3>${(s.body || []).map((b) => `<p>${esc(b)}</p>`).join('')}${s.ask ? `<p class="sub">${esc(s.ask)}</p>` : ''}</div>`, ways, 'surpanel');
  }
  chooseSurprise(s, w) {
    const g = this.g; let out = w.then || {}; let ok = true; if (w.roll) { ok = g.life ? g.life.roll({ roll: w.roll, rollFail: w.fail?.say || '…안 됐다.', rollFailFlag: w.fail?.flag }) : Math.random() < 0.6; if (!ok) out = w.fail || {}; }
    g.ui.close(); g.pulse?.tension?.(0); const lines = this.apply(out, null, true); g.flag('sur:' + s.id + ':' + (ok ? 'ok' : 'fail'));
    const re = out.result || (ok ? w.result : null); const html = `<div class="chk life sur"><div class="tag">⚡ ${esc(s.tag || '느닷없이')}</div><h3>${esc(re?.title || w.label)}</h3>${(re?.body || [out.say || (ok ? '…그렇게 했다.' : '…그렇게는 안 됐다.')]).map((b) => `<p>${esc(b)}</p>`).join('')}${lines.length ? `<p class="delta">${lines.join(' · ')}</p>` : ''}${s.fact ? `<div class="facts"><div>📜 <b>실제</b> ${esc(s.fact)}</div></div>` : ''}</div>`;
    g.ui.open(html, [{ label: '…', primary: true, onClick: () => { g.ui.close(); g.p.enabled = true; this.checkTitles(); g.save?.touch(); } }]);
  }
  /** 효과 한 묶음 — {heart,craft,grain,hurt,flag,give,say} → 바뀐 것 줄 목록. grain 은 곡식 칸이 열린 시대에만 */
  apply(out, label, silent) {
    const g = this.g; const lines = []; if (!out) return lines; const L = g.life;
    for (const k of ['craft', 'heart', 'grain']) { const n = out[k]; if (!n) continue; if (k === 'grain' && !L?.d?.grain?.open) continue; L?.add(k, n); lines.push(`${V[k]} ${n > 0 ? '+' : ''}${n}`); }
    if (out.hurt) { L?.injure(out.hurt); lines.push(`🩹 ${L?.d?.hurts?.[out.hurt]?.name || out.hurt}`); } if (out.give) { for (const k of [].concat(out.give)) g.inventory.push(k); g.renderInv?.(); lines.push(`🎒 ${[].concat(out.give).map((k) => g.world.items?.[k]?.name || k).join('·')}`); }
    if (out.heirloom?.name) { Pulse.keep(g, { ...out.heirloom, from: 'bond' }); lines.push(`🎁 집에 내려오는 것 — ${out.heirloom.name}`); }   // 80: 벗의 선물·화해 선물이 족보 상자로
    if (out.flag) setTimeout(() => { for (const f of [].concat(out.flag)) g.flag(f); }, 300);   // 깃발 하나 또는 여럿(79: bond3e 「미안했다」 길은 bond:end + bond:sorry) if (!silent && (label || out.say)) g.ui.say(`${label ? label + ' — ' : ''}${lines.join(' · ') || out.say || ''}`, 4200);
    return lines;
  }
  // ---------- 밤의 설렘 ----------
  tickWonder(dt) {
    const g = this.g; const e = g.e; if (!e.scene?.add || this.cfg.wonder === false) return; const night = !!g.story?.isNight; const p = g.p.pos;
    if (night && !this.ff) { const n = 36; const pos = new Float32Array(n * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const mat = new THREE.PointsMaterial({ color: 0xcaff8a, size: 0.16, map: this.glow(), transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }); this.ff = new THREE.Points(geo, mat); this.ff.frustumCulled = false; this.ffd = Array.from({ length: n }, () => ({ a: Math.random() * 6.28, r: 3 + Math.random() * 11, y: 0.3 + Math.random() * 1.4, s: 0.2 + Math.random() * 0.5, ph: Math.random() * 6.28 })); this.ff.userData.c = { x: p.x, z: p.z }; e.scene.add(this.ff); }
    if (!night && this.ff) { e.scene.remove(this.ff); this.ff.geometry.dispose?.(); this.ff = null; }
    if (this.ff) { const c = this.ff.userData.c; if (this.dist(c, p) > 14) { c.x += (p.x - c.x) * 0.02; c.z += (p.z - c.z) * 0.02; } const arr = this.ff.geometry.attributes.position.array; this.ffT = (this.ffT || 0) + dt; this.ffd.forEach((d, i) => { d.a += dt * d.s * 0.4; const x = c.x + Math.cos(d.a) * d.r + Math.sin(this.ffT * 1.3 + d.ph) * 0.6, z = c.z + Math.sin(d.a) * d.r; const gy = e.groundY ? e.groundY(x, z) : 0; arr[i * 3] = x; arr[i * 3 + 1] = gy + d.y + Math.sin(this.ffT * 2 + d.ph) * 0.25; arr[i * 3 + 2] = z; }); this.ff.geometry.attributes.position.needsUpdate = true; this.ff.material.opacity = 0.55 + Math.sin(this.ffT * 3) * 0.3; }
    if (night && !this.shot) { this.starT = (this.starT || 0) + dt; if (this.starT > (this.cfg.starGap || 45) && Math.random() < dt * 0.08) this.shootStar(); } else if (!night) this.starT = 0;
    if (this.shot) { const s = this.shot; s.t += dt; s.m.position.addScaledVector(s.v, dt); s.m.material.opacity = Math.max(0, 1 - s.t / s.life); if (s.t > s.life) { e.scene.remove(s.m); this.shot = null; } }
  }
  /** 둥근 빛 점(반딧불이용) — canvas 가 없으면 null */
  glow() { if (this._glow !== undefined) return this._glow; this._glow = null; try { const c = document.createElement('canvas'); if (!c.getContext) return null; c.width = c.height = 32; const x = c.getContext('2d'); const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(220,255,160,.8)'); gr.addColorStop(1, 'rgba(200,255,140,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); this._glow = new THREE.CanvasTexture(c); } catch { } return this._glow; }
  shootStar() {
    const g = this.g; const e = g.e; const p = g.p.pos; this.starT = 0; const ang = Math.random() * 6.28; const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-9, 3.5, 0)]); const m = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })); m.position.set(p.x + Math.cos(ang) * 120, 95 + Math.random() * 30, p.z + Math.sin(ang) * 120); m.rotation.y = -ang + Math.PI / 2; m.frustumCulled = false; e.scene.add(m);
    this.shot = { m, t: 0, life: 1.1, v: new THREE.Vector3(Math.cos(ang + 1.3) * 60, -22, Math.sin(ang + 1.3) * 60) }; this.stars++; g.flags.add('star:' + this.stars);
    if (this.stars === 1) g.ui.say(this.cfg.starSay || '✨ 별똥별. — 봤다.', 3200); if (this.stars === 3 && this.cfg.starTitle && !this.hasTitle(this.cfg.starTitle.id)) this.earn(this.cfg.starTitle); g.sound?.play?.('star', 0.3);
  }
  // ---------- 매 프레임 ----------
  tick(dt) { const g = this.g; if (!g.p?.pos || g.restoring) return; this.t += dt; this.tickGaze(dt); this.tickSurprise(dt); this.tickWonder(dt); this.tt = (this.tt || 0) + dt; if (this.tt > 1.5) { this.tt = 0; this.checkTitles(); } }
  onFlag() { if (this.g.restoring) return; this.checkTitles(); }
}
