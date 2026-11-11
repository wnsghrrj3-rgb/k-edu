/* 갈림길 달리기(1장 맛보기) — 몸을 기울여 맞는 길로. 뒤에서 바위가 굴러온다.
 * 받는 문제 모양: pick {q, ans, opts[3]} */
import { W, H, txt, panel, circle, clamp, lerp, danger, rr } from '../ui.js';
import { scene, wizardCart } from '../scenes.js';
export default function(api){
  const T_APPROACH = 5.2, T_RESULT = 1.0, SP_MAX = 2.3, SP_UP = .13, SP_DOWN = .35;      // 속도: 맞히면 +, 틀리면 −
  const S = { i: 0, q: null, z: 1, phase: 'go', rt: 0, ok: false, chosen: 1, carX: 0, streak: 0, dash: 0, road: 0, speed: 1, shown: 1 };
  const HOR = 250, BOT = 640;
  const laneX = (k, s) => W / 2 + (k - 1) * lerp(120, 300, s);       // s: 0 먼 곳 ~ 1 코앞
  function next(){ S.q = api.pack.pick(); S.z = 1; S.phase = 'go'; api.say(S.q.q.replace('−', '빼기').replace('×', '곱하기').replace('+', '더하기').replace('□', '몇').replace('=', '은')); }
  return {
    id: 'run', icon: '🛒', title: '갈림길 달리기', how: '몸을 왼쪽·가운데·오른쪽으로 기울여 맞는 답 길로 달려요. 틀리면 바위가 바짝 따라와요.', touch: '가고 싶은 길을 눌러요 (← → 키도 돼요)',
    needs: 'lane', threatSec: 20, pushBack: .3,
    dbg: () => S,
    start(){ S.i = 0; S.streak = 0; S.dash = 0; S.speed = 1; S.shown = 1; S.carX = W / 2; next(); },
    update(dt){
      S.shown = lerp(S.shown, S.speed, Math.min(1, dt * 3)); S.road += dt * S.shown * (S.dash > 0 ? 1.8 : 1); S.dash = Math.max(0, S.dash - dt);
      const lane = api.lane() + 1; S.carX = lerp(S.carX, laneX(lane, 1), Math.min(1, dt * 9));
      if (S.phase === 'go') { S.z -= dt / T_APPROACH * S.speed; if (S.z <= 0) { S.chosen = lane; S.ok = S.q.opts[lane] === S.q.ans; S.phase = 'res'; S.rt = T_RESULT / Math.sqrt(S.speed);
          if (S.ok) { S.streak++; S.speed = Math.min(SP_MAX, S.speed + SP_UP); api.correct(Math.round((S.speed - 1) * 10)); api.fx.burst(S.carX, BOT - 60, '#ffe27a', 22); api.fx.text(S.carX, BOT - 150, '쌩!', '#6dffb0'); if (S.streak % 3 === 0) { S.dash = 2.4; api.threat.v = Math.max(0, api.threat.v - .2); api.sfx('dash'); api.flash('질주!'); } }
          else { S.streak = 0; S.speed = Math.max(1, S.speed - SP_DOWN); api.wrong(); api.fx.shake(16); api.fx.dust(S.carX, BOT + 30, 'rgba(120,160,90,1)', 10); api.threat.v = Math.min(.999, api.threat.v + .22); } } }
      else { S.rt -= dt; if (S.rt <= 0) { S.i++; next(); } }
    },
    draw(c, t){
      const v = api.threat.v;
      scene.run(c, t, { road: S.road, dash: Math.max(S.dash, S.shown > 1.5 ? 1 : 0), v, HOR });
      // 팻말 셋
      const s = clamp(1 - S.z, 0, 1), e = Math.pow(s, 1.6), y = lerp(HOR + 40, BOT - 150, e), sc = lerp(.62, 1.18, e);       // 멀리 있을 때도 수가 읽히게
      S.q.opts.forEach((val, k) => { const x = laneX(k, e); const res = S.phase === 'res'; const good = val === S.q.ans;
        c.save(); c.translate(x, y); c.scale(sc, sc); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 92, 60, 12, 0, 0, 7); c.fill(); c.fillStyle = '#5b3d1e'; c.fillRect(-8, 0, 16, 90);
        if (res && good) { c.shadowColor = '#6dffb0'; c.shadowBlur = 40; }
        rr(c, -82, -84, 164, 102, 18); c.fillStyle = res ? (good ? '#35d07f' : (k === S.chosen ? '#e5484d' : '#cdb88e')) : '#ffe9b8'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#5b3d1e'; c.lineWidth = 7; c.stroke();
        txt(c, val, 0, -32, String(val).length > 2 ? 48 : 64, '#3b2408'); c.restore(); });
      scene.boulder(c, t, v);
      wizardCart(c, S.carX, BOT + 10, t, S.dash);          // 수레는 늘 보이게(바위 앞)
      // 문제
      panel(c, W / 2 - 300, 28, 600, 120, 'rgba(10,12,34,.82)', '#ffd35c'); txt(c, S.q.q, W / 2, 90, 76, '#fff');
      if (S.phase === 'res') txt(c, S.ok ? '맞았어!' : `정답은 ${S.q.ans}`, W / 2, 196, 48, S.ok ? '#6dffb0' : '#ffd0d0');
      // 속도계
      panel(c, 40, 150, 210, 64, 'rgba(8,12,24,.75)'); txt(c, '속도', 78, 182, 22, '#bcd', 'center', 700); const sp = (S.shown - 1) / (SP_MAX - 1); c.fillStyle = sp > .7 ? '#ff6b4d' : sp > .35 ? '#ffd35c' : '#6dffb0'; if (sp > .03) { rr(c, 112, 166, 126 * Math.min(1, sp), 32, 10); c.fill(); } c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; rr(c, 112, 166, 126, 32, 10); c.stroke();
      // 바위까지 거리
      panel(c, 40, H - 74, 420, 50, 'rgba(8,12,24,.75)'); c.fillStyle = '#c0392b'; rr(c, 410, H - 62, 34, 24, 6); c.fill(); const bx = lerp(72, 386, v); circle(c, bx, H - 49, 15 + v * 6, '#8d8378', '#2b2622', 3);
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 3; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(bx + 24, H - 49); c.lineTo(404, H - 49); c.stroke(); c.setLineDash([]);
      if (v > .5) { api.fx.shake((v - .5) * 9); if (Math.random() < v * .5) api.fx.dust(W / 2 + (Math.random() - .5) * 900, H - 20); }
      danger(c, v, t);
    } };
}
