// 역사의 인물 층(133) — 큰 사건이 열리면 그 시대의 **실존 인물**이 마을로 걸어 들어온다. 「역사 선생님+게임 개발자」(준호 10-28: 역사의 느낌이 나게·흥미진진하게).
//  · world.figures = [{ id, name, title, look{cloth,hair,skin}, on(life.cond — 보통 sit:<X>:open|done), if(신분·나라 조건), from(구역|[x,z]), to(구역), say[2~3](도착하며 한 줄씩), fact(📜), sound, stay(초, 기본 240),
//                       talk:{ text, choices:[{ id, label, showIf, say, val:{heart,craft,grain,rank}, fact }] }, again(두 번째 말 걸면), gone(떠나며) }]  (생성기 핸드오프 kworld/game/gen_figures133.py)
//  · 조건이 맞으면 story.place 로 사람 몸(관절 인형·look)을 from 자리에 세워 to 구역으로 걸어오고(Actor), 닿으면 📯 한 줄씩(4.6초 간격) + 처음 한 번 📜; g.npcs[id] 에 대사(선택형)를 끼워 넣어 E 로 말을 건다(npcs.json 변경 0).
//  · 고른 선택지 = 깃발 figure:<id>:<choice> + 값(life.add) + 한마디 + 📜; 두 번째부터는 again 한 줄. stay 초가 지나면(또는 그 사건이 done) 온 길로 걸어 나가 사라진다(gone 한 줄). 깃발 figure:<id>:here / :met / :gone.
//  · 135: 인물 둘이 같이 와도 한 사람씩 말한다(speaking) · 곁의 반 친구가 먼저 「저 사람 누구야?」(classmateSaw) · 벗은 spark.bond.react fg_* 로 먼저 한마디 · 구석기~청동기는 이름 없는 얼굴(낯선 우두머리·바다 건너 온 사람·거울을 든 사람).
//  · 136: 셋째 사람 7(준왕·선덕여왕·문익점·장영실·김만덕·안창호·전태일) · 벗이 고른 선택을 두고 한마디(spark.bond.react fgc_*) · 떠난 자리에 남긴 것(relic → pulse 숨은 것, 🎁 from:'figure', leaveRelic).
//  · 「그 뒤」 카드 📯 줄(figureLine): 만난 인물·고른 것. 값은 작게(±1~2), 신분·갈림은 안 바꾼다 — 인물은 그 사건을 「사람의 얼굴」로 보여 줄 뿐. 📜 연도 0·판단 0(개항~현대는 사실만). ?figures=0 끔.
import { Actor } from './actor.js';
const GAP = 4600, STAY = 240, LEAVE_R = 60;
const iga = (n) => { const o = n.charCodeAt(n.length - 1); return o >= 0xac00 && o <= 0xd7a3 && (o - 0xac00) % 28 ? '이' : '가'; };   // 이/가
export class Figures {
  constructor(g, list) { this.g = g; this.list = list || []; this.live = new Map(); this.t = 0; this.met = []; this.picked = new Map(); this.speaking = null; }
  area(a) { if (Array.isArray(a)) return { x: a[0], z: a[1] }; const v = this.g.e?.areas?.get(a); return v ? { x: v.x, z: v.z } : null; }
  tick(dt) {
    const g = this.g; if (!g.p?.pos || g.restoring || g.story?.cutsceneOn) return; this.t += dt; if ((this.tk = (this.tk || 0) + dt) < 0.5) return; this.tk = 0;
    for (const f of this.list) { if (this.live.has(f.id) || g.flags.has('figure:' + f.id + ':gone')) continue; if (!g.cond(f.on) || (f.if && !g.cond(f.if))) continue; this.arrive(f); }
    for (const L of this.live.values()) this.tickOne(L, 0.5);
  }
  arrive(f) {
    const g = this.g, st = g.story; const from = this.area(f.from), to = this.area(f.to); if (!st?.place || !from || !to) return;
    const name = 'npc_' + f.id; const it = st.place({ id: f.id, name, prop: 'person', look: f.look || { body: 0x4a3c2e, skin: 0xd7a981 }, x: from.x, z: from.z, noAuto: true });
    const ac = st.actors?.[f.id] || (it && new Actor(g, f.id, it.obj)); if (!it || !ac) return;
    const dx = from.x - to.x, dz = from.z - to.z, d = Math.hypot(dx, dz) || 1; const stop = { x: to.x + dx / d * 2.2, z: to.z + dz / d * 2.2 };   // 구역 중심 2.2m 앞에 선다
    const L = { f, it, ac, t: 0, said: 0, there: false, leaving: false, stop }; this.live.set(f.id, L); g.flags.add('figure:' + f.id + ':here');
    g.npcs[f.id] = { name: `${f.name}${f.title ? ' · ' + f.title : ''}`, lines: this.lines(f) };
    g.sound?.play?.(f.sound || 'horn', 0.4); g.ui?.say?.(`📯 멀리서 누가 온다 — ${f.title || ''} ${f.name}.`, 4200);
    ac.goTo([stop.x, stop.z], { anim: 'walk', then: 'idle', speed: f.speed || 2.0 }).then(() => { L.there = true; ac.face([g.p.pos.x, g.p.pos.z]); ac.syncBox?.(); this.speak(L); });
  }
  /** 135: 인물 둘이 같이 와도 한 사람씩 말한다 — this.speaking 이 비어야 📯 줄을 시작하고, 세 줄·📜가 끝나면 비운다(기다리는 쪽은 1.5초마다 다시 본다) */
  speak(L) {
    const g = this.g, f = L.f; const done = () => { if (this.speaking === L) this.speaking = null; };
    const next = () => { if (L.leaving || !this.live.has(f.id)) { done(); return; } if (this.speaking && this.speaking !== L) { setTimeout(next, g.story?.fast ? 5 : 1500); return; } const s = f.say?.[L.said]; if (!s) { if (!g.flags.has('figure:' + f.id + ':fact') && f.fact) { g.flags.add('figure:' + f.id + ':fact'); g.ui?.say?.('📜 ' + f.fact, 6200); } done(); return; } if (g.ui?.isOpen?.()) { setTimeout(next, 1500); return; } this.speaking = L; L.said++; g.ui?.say?.(`📯 ${f.name} — 「${s}」`, GAP - 300); setTimeout(next, g.story?.fast ? 5 : GAP); };
    this.classmateSaw(L); next();
  }
  /** 135: 곁(8m)에 반 친구가 있으면 그 친구가 먼저 「저 사람 누구야?」 한 줄(인물마다 한 번, 값 없음). 벗(bond)은 spark.bond.react fg_* 규칙으로 따로 말한다 */
  classmateSaw(L) {
    const g = this.g, f = L.f, fr = g.friends?.friends; if (!fr?.size || !g.p?.pos || g.flags.has('figure:' + f.id + ':saw')) return;
    for (const o of fr.values()) { if (Math.hypot(o.x - g.p.pos.x, o.z - g.p.pos.z) > 8) continue; g.flags.add('figure:' + f.id + ':saw'); setTimeout(() => g.ui?.say?.(`👥 ${o.body?.userData?.nick || '친구'} — 「저 사람 누구야? ${f.title || ''}…」`, 3600), g.story?.fast ? 5 : 1600); return; }
  }
  lines(f) {
    const g = this.g, t = f.talk; if (!t) return [{ text: f.say?.[0] || '…' }];
    const choices = (t.choices || []).map((c) => ({ label: c.label, showIf: c.showIf, flag: 'figure:' + f.id + ':' + c.id, say: c.say,
      _apply: () => { for (const [k, n] of Object.entries(c.val || {})) g.life?.add?.(k, n); this.picked.set(f.id, c); if (!this.met.includes(f.id)) this.met.push(f.id); g.flags.add('figure:' + f.id + ':met'); if (c.fact) setTimeout(() => g.ui?.say?.('📜 ' + c.fact, 6200), g.story?.fast ? 5 : 5800); g.sound?.play?.('meet', 0.3); } }));
    return [{ if: 'figure:' + f.id + ':met', text: f.again || '「…가자. 할 일이 있다.」' }, { text: t.text, choices, flag: 'figure:' + f.id + ':talked' }];
  }
  /** game.talk 의 선택지 onClick 뒤에 값·깃발을 얹는다 — game.js 가 c.flag 를 세운 뒤 figures.onFlag 로 돌아온다 */
  onFlag(flag) { const m = /^figure:(\w+):(\w+)$/.exec(flag); if (!m) return; const L = this.live.get(m[1]); const c = L && (this.g.npcs[m[1]]?.lines || []).flatMap((l) => l.choices || []).find((x) => x.flag === flag); if (c?._apply && !c._done) { c._done = true; c._apply(); } }
  tickOne(L, dt) {
    const g = this.g, f = L.f; if (L.leaving) { if (!L.ac.path) this.remove(L); else if (!(g.story?.actors?.[f.id])) L.ac.tick(dt); return; }
    if (!(g.story?.actors?.[f.id])) L.ac.tick(dt);
    if (L.there && g.p?.pos && !g.ui?.isOpen?.()) { const d = Math.hypot(g.p.pos.x - L.it.obj.position.x, g.p.pos.z - L.it.obj.position.z); if (d < 7) L.ac.face([g.p.pos.x, g.p.pos.z]); }
    L.t += dt; const over = L.t >= (f.stay || STAY) || (f.until && g.cond(f.until)); if (L.there && over && !g.ui?.isOpen?.()) this.leave(L);
  }
  leave(L) {
    const g = this.g, f = L.f; L.leaving = true; const from = this.area(f.from) || { x: L.it.obj.position.x, z: L.it.obj.position.z + LEAVE_R };
    g.ui?.say?.(`📯 ${f.name} — 「${f.gone || '…갈 길이 멀다.'}」`, 4200); L.ac.goTo([from.x, from.z], { anim: 'walk', then: 'idle', speed: 2.0 });
  }
  /** 136: 인물이 지나간 자리에 남는 것 — 떠난 뒤 to 구역 곁에 ✨ 하나(pulse 숨은 것 틀, id fig_<id>, from 'figure' → 챙기면 🎁 집에 내려오는 것 상자에, n/3 셈엔 안 들어감). f.relic {name,title,body,fact} 데이터가 있을 때만 */
  leaveRelic(L) {
    const g = this.g, f = L.f, r = f.relic; if (!r?.name || !g.pulse?.placeSecret || g.flags.has('secret:fig_' + f.id)) return false;
    const s = { id: 'fig_' + f.id, at: f.to, dx: r.dx ?? 1.4, dz: r.dz ?? 1.1, tag: `📯 ${f.name}${iga(f.name)} 남긴 것`, title: r.title, body: r.body, fact: r.fact, heirloom: r.name, from: 'figure', seeR: r.seeR || 22, button: '챙긴다' };
    const ok = g.pulse.placeSecret(s); if (ok) g.flags.add('figure:' + f.id + ':relic'); return ok;
  }
  remove(L) { const g = this.g, f = L.f; this.live.delete(f.id); this.leaveRelic(L); if (this.speaking === L) this.speaking = null; g.e?.removeInteractable?.(L.it.name); if (g.story?.actors) delete g.story.actors[f.id]; delete g.npcs[f.id]; g.flags.delete('figure:' + f.id + ':here'); g.flag('figure:' + f.id + ':gone'); }
  /** 「그 뒤」 카드 📯 한 줄 — 이 시대에 만난 인물과 고른 것. 못 만났으면 빈 글(인물이 온 적 있으면 「지나쳤다」) */
  figureLine() {
    const g = this.g; const came = this.list.filter((f) => g.flags.has('figure:' + f.id + ':gone') || g.flags.has('figure:' + f.id + ':here'));
    if (!came.length) return ''; const met = came.filter((f) => g.flags.has('figure:' + f.id + ':met'));
    if (!met.length) { const kept = came.filter((f) => g.flags.has('secret:fig_' + f.id)).map((f) => f.relic?.name).filter(Boolean); return `역사의 인물 — ${came.map((f) => f.name).join('·')}이(가) 마을에 왔지만 말을 걸지 않았다.${kept.length ? ` 지나간 자리에서 ${kept.join('·')}을(를) 챙겼다.` : ''} 역사는 지나가는 사람의 얼굴로도 온다.`; }
    const kept = came.filter((f) => g.flags.has('secret:fig_' + f.id)).map((f) => f.relic?.name).filter(Boolean);
    return `역사의 인물 — ${met.map((f) => { const c = this.picked.get(f.id); return `${f.name}${c ? '(' + c.label + ')' : ''}`; }).join(' · ')}을(를) 만났다.${kept.length ? ` 지나간 자리에서 ${kept.join('·')}을(를) 챙겼다.` : ''}`;
  }
}
