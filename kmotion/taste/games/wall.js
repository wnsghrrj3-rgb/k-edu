/* 칸 채우기(테트리스에서 가져온 틀) — 줄마다 빈칸이 있다. 아래 막대를 끌어다 빈칸을 딱 채우면 줄이 사라진다.
 * 짧은 막대는 일부만 채워지고(나머지를 또 채워야 함), 긴 막대는 튕겨 나온다. 가르기·모으기 = 칸 채우기.
 * 받는 문제 모양: part {n, a} → 줄 길이 n, 채워진 칸 a, 빈칸 n−a */
import { W, H, txt, panel, rr, clamp, lerp, dist, danger } from '../ui.js';
import { scene } from '../scenes.js';
export default function(api){
  const ROWS = 3, RY = [250, 360, 470], TRAY = [330, 640, 950], TY = 628;
  const S = { rows: [], bars: [], held: new Map(), msg: null, mt: 0, cleared: 0 };
  const cs = r => Math.min(58, 940 / r.n), rx = r => W / 2 - r.n * cs(r) / 2, gap = r => r.n - r.fill;
  function newRow(){ const q = api.pack.part(); return { n: q.n, fill: q.a, first: q.a, pop: 0, shake: 0 }; }
  function deal(){ const gaps = S.rows.map(gap), mx = Math.max(2, ...gaps); const out = [gaps[Math.floor(api.rnd() * gaps.length)]];
    let g = 0; while (out.length < 3 && g++ < 60) { const pool = [...gaps, 1 + Math.floor(api.rnd() * mx), out[0] + 1, Math.max(1, out[0] - 1)]; const v = pool[Math.floor(api.rnd() * pool.length)]; if (!out.includes(v) && v >= 1) out.push(v); }
    while (out.length < 3) out.push(out[out.length - 1] + 1);
    for (let i = 2; i > 0; i--) { const j = Math.floor(api.rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    S.bars = out.map((len, k) => ({ len, k, x: TRAY[k], y: TY, used: false })); }
  const say = m => { S.msg = m; S.mt = 1; };
  return {
    id: 'wall', icon: '🧱', title: '칸 채우기', tag: '터치', how: '아래 막대를 쥐어서 빈칸이 있는 줄 위에서 펴요. 빈칸에 딱 맞으면 줄이 사라져요.', touch: '아래 막대를 끌어다 줄에 놓아요. 빈칸에 딱 맞으면 줄이 사라져요',
    threatSec: 15, pushBack: .5,
    dbg: () => S,
    start(){ S.rows = [newRow(), newRow(), newRow()]; S.held.clear(); S.cleared = 0; deal(); api.say('빈칸을 딱 맞게 채워 줘'); },
    update(dt, cur){
      S.mt = Math.max(0, S.mt - dt); for (const r of S.rows) { r.pop = Math.max(0, r.pop - dt); r.shake = Math.max(0, r.shake - dt); }
      for (const c of cur) {
        if (c.jg && !S.held.has(c.id)) { const b = S.bars.find(b => !b.used && ![...S.held.values()].includes(b) && Math.abs(c.x - b.x) < 150 && Math.abs(c.y - TY) < 70); if (b) { S.held.set(c.id, b); api.sfx('grab'); } }
        const b = S.held.get(c.id); if (!b) continue;
        if (c.grab) { b.x = c.x; b.y = c.y; continue; }
        S.held.delete(c.id); const ri = RY.findIndex((y, i) => S.rows[i] && Math.abs(c.y - y) < 56); const r = ri >= 0 ? S.rows[ri] : null;
        if (!r) { b.x = TRAY[b.k]; b.y = TY; continue; }
        const g = gap(r);
        if (b.len > g) { r.shake = .5; b.x = TRAY[b.k]; b.y = TY; api.wrong(); api.fx.shake(8); say(`${b.len}칸은 너무 길어!`); continue; }
        r.fill += b.len; b.used = true; api.sfx('drop'); api.fx.burst(c.x, RY[ri], '#7fe0ff', 8, 260);
        if (r.fill === r.n) { api.correct(); S.cleared++; api.fx.burst(W / 2, RY[ri], '#ffe27a', 34, 560); api.fx.ring(W / 2, RY[ri], '#fff'); api.fx.text(W / 2, RY[ri] - 60, `${r.first} + ${r.n - r.first} = ${r.n}`, '#6dffb0', 50); S.rows[ri] = newRow(); S.rows[ri].pop = .5; deal(); }
        else { say(`${gap(r)}칸 남았어`); if (S.bars.every(x => x.used) || !S.bars.some(x => !x.used && S.rows.some(q => x.len <= gap(q)))) deal(); } }
      for (const [id, b] of [...S.held]) if (!cur.some(c => c.id === id)) { S.held.delete(id); b.x = TRAY[b.k]; b.y = TY; }
      for (const b of S.bars) if (![...S.held.values()].includes(b) && !b.used) { b.x = lerp(b.x, TRAY[b.k], Math.min(1, dt * 10)); b.y = lerp(b.y, TY, Math.min(1, dt * 10)); }
    },
    draw(c, t){
      const v = api.threat.v; scene.vault(c, t, v);
      // 내려오는 가시 천장(위협)
      const cy = lerp(40, 170, v); c.fillStyle = '#3b3550'; c.fillRect(120, 0, W - 420, cy); c.fillStyle = v > .7 ? '#ff6b4d' : '#8f86b0'; for (let x = 130; x < W - 310; x += 44) { c.beginPath(); c.moveTo(x, cy); c.lineTo(x + 22, cy + 34); c.lineTo(x + 44, cy); c.closePath(); c.fill(); }
      S.rows.forEach((r, i) => { const s = cs(r), x0 = rx(r) + (r.shake > 0 ? Math.sin(t / 22) * 8 : 0), y = RY[i], hh = Math.min(64, s + 8), sc = 1 - r.pop * .4;
        c.save(); c.translate(W / 2, y); c.scale(sc, sc); c.translate(-W / 2, -y);
        panel(c, x0 - 10, y - hh / 2 - 8, r.n * s + 20, hh + 16, 'rgba(10,12,34,.7)', 'rgba(255,255,255,.25)', 12);
        for (let k = 0; k < r.n; k++) { const filled = k < r.fill, added = k >= r.first && filled; rr(c, x0 + k * s + 3, y - hh / 2, s - 6, hh, 8); c.fillStyle = filled ? (added ? '#5dd0ff' : '#ffb02e') : 'rgba(255,255,255,.08)'; c.fill(); if (!filled) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.setLineDash([6, 6]); c.stroke(); c.setLineDash([]); } }
        txt(c, r.n, x0 + r.n * s + 62, y + 2, 50, '#ffe27a'); c.restore(); });
      panel(c, 150, TY - 66, 980, 132, 'rgba(10,12,34,.6)', 'rgba(255,255,255,.18)');
      const bs = 46; for (const b of S.bars) { if (b.used) continue; const held = [...S.held.values()].includes(b), w = b.len * bs; const fit = Math.min(1, 280 / w), ww = held ? w : w * fit, cw = ww / b.len;
        c.save(); c.translate(b.x, b.y); if (held) { c.shadowColor = '#7fe0ff'; c.shadowBlur = 26; } for (let k = 0; k < b.len; k++) { rr(c, -ww / 2 + k * cw + 2, -24, cw - 4, 48, 8); c.fillStyle = '#5dd0ff'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); } c.shadowBlur = 0; txt(c, b.len, 0, -52, 40, '#fff'); c.restore(); }
      if (S.mt > 0) txt(c, S.msg, W / 2, 548, 38, S.msg.includes('길어') ? '#ffd0d0' : '#bfe8ff');
      danger(c, v, t);
    } };
}
