/* 갈림길 달리기(1장 맛보기) — 몸을 기울여 맞는 길로. 뒤에서 바위가 굴러온다.
 * 받는 문제 모양: pick {q, ans, opts[3]} */
import { W, H, txt, panel, circle, clamp, lerp, danger, rr } from '../ui.js';
export default function(api){
  const N = 8, T_APPROACH = 5.2, T_RESULT = 1.0;
  const S = { i: 0, q: null, z: 1, phase: 'go', rt: 0, ok: false, chosen: 1, carX: 0, streak: 0, dash: 0, road: 0 };
  const HOR = 250, BOT = 640;
  const laneX = (k, s) => W / 2 + (k - 1) * lerp(120, 300, s);       // s: 0 먼 곳 ~ 1 코앞
  function next(){ S.q = api.pack.pick(); S.z = 1; S.phase = 'go'; api.say(S.q.q.replace('−', '빼기').replace('×', '곱하기').replace('+', '더하기').replace('□', '몇').replace('=', '은')); }
  return {
    id: 'run', icon: '🛒', title: '갈림길 달리기', how: '몸을 왼쪽·가운데·오른쪽으로 기울여 맞는 답 길로 달려요. 틀리면 바위가 바짝 따라와요.', touch: '가고 싶은 길을 눌러요 (← → 키도 돼요)',
    needs: 'lane', threatSec: 20, pushBack: .3, total: N,
    dbg: () => S,
    prog: () => [S.i, N],
    start(){ S.i = 0; S.streak = 0; S.dash = 0; S.carX = W / 2; next(); },
    update(dt){
      S.road += dt * (S.dash > 0 ? 2.2 : 1); S.dash = Math.max(0, S.dash - dt);
      const lane = api.lane() + 1; S.carX = lerp(S.carX, laneX(lane, 1), Math.min(1, dt * 9));
      if (S.phase === 'go') { S.z -= dt / T_APPROACH; if (S.z <= 0) { S.chosen = lane; S.ok = S.q.opts[lane] === S.q.ans; S.phase = 'res'; S.rt = T_RESULT;
          if (S.ok) { S.streak++; api.correct(); if (S.streak % 3 === 0) { S.dash = 2.4; api.threat.v = Math.max(0, api.threat.v - .2); api.sfx('dash'); api.flash('질주!'); } }
          else { S.streak = 0; api.wrong(); api.threat.v = Math.min(.999, api.threat.v + .22); } } }
      else { S.rt -= dt; if (S.rt <= 0) { S.i++; if (S.i >= N) api.finish(); else next(); } }
    },
    draw(c, t){
      const g = c.createLinearGradient(0, 0, 0, HOR); g.addColorStop(0, '#16324f'); g.addColorStop(1, '#3f7f8f'); c.fillStyle = g; c.fillRect(0, 0, W, HOR);
      c.fillStyle = '#2f5d34'; c.fillRect(0, HOR, W, H - HOR);
      // 길(사다리꼴) + 차선
      c.fillStyle = '#7a6248'; c.beginPath(); c.moveTo(W / 2 - 120, HOR); c.lineTo(W / 2 + 120, HOR); c.lineTo(W / 2 + 480, H); c.lineTo(W / 2 - 480, H); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; for (const k of [-.5, .5]) { c.beginPath(); c.moveTo(W / 2 + k * 80, HOR); c.lineTo(W / 2 + k * 320, H); c.stroke(); }
      for (let i = 0; i < 7; i++) { const s = ((i / 7 + S.road * .35) % 1); const y = lerp(HOR, H, s * s); c.strokeStyle = `rgba(0,0,0,${.18 * s})`; c.lineWidth = 2 + s * 6; c.beginPath(); c.moveTo(W / 2 - lerp(120, 480, s * s), y); c.lineTo(W / 2 + lerp(120, 480, s * s), y); c.stroke(); }
      // 팻말 셋
      const s = clamp(1 - S.z, 0, 1), e = Math.pow(s, 1.6), y = lerp(HOR + 40, BOT - 150, e), sc = lerp(.62, 1.18, e);       // 멀리 있을 때도 수가 읽히게
      S.q.opts.forEach((v, k) => { const x = laneX(k, e); const res = S.phase === 'res'; const good = v === S.q.ans;
        c.save(); c.translate(x, y); c.scale(sc, sc); c.fillStyle = '#5b3d1e'; c.fillRect(-8, 0, 16, 90);
        rr(c, -78, -80, 156, 96, 16); c.fillStyle = res ? (good ? '#35d07f' : (k === S.chosen ? '#e5484d' : '#cdb88e')) : '#ffe9b8'; c.fill(); c.strokeStyle = '#5b3d1e'; c.lineWidth = 6; c.stroke();
        txt(c, v, 0, -30, String(v).length > 2 ? 46 : 62, '#3b2408'); c.restore(); });
      // 수레
      c.save(); c.translate(S.carX, BOT + 10); if (S.dash > 0) { c.fillStyle = 'rgba(255,220,90,.5)'; c.fillRect(-60, 20, 120, 80); }
      rr(c, -62, -46, 124, 70, 14); c.fillStyle = '#c0392b'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); circle(c, -38, 30, 18, '#222', '#ddd'); circle(c, 38, 30, 18, '#222', '#ddd'); txt(c, '🧙', 0, -52, 54); c.restore();
      // 문제
      panel(c, W / 2 - 300, 28, 600, 120); txt(c, S.q.q, W / 2, 90, 76, '#fff');
      if (S.phase === 'res') txt(c, S.ok ? '맞았어!' : `정답은 ${S.q.ans}`, W / 2, 190, 46, S.ok ? '#6dffb0' : '#ffb3b3');
      // 바위 거리 띠
      const v = api.threat.v; panel(c, 40, H - 74, 420, 50, 'rgba(8,12,24,.7)'); txt(c, '🛒', 430, H - 49, 34); txt(c, '🪨', lerp(70, 392, v), H - 49, 34 + v * 14);
      if (v > .55) { const r = (v - .55) / .45; circle(c, W / 2, H + 260 - r * 170, 300, `rgba(60,50,45,${.55 + r * .4})`); }
      danger(c, v, t);
    } };
}
