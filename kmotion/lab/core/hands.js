// 케이모션 과학실 — 동사 판정 (순수 계산: document·THREE 를 부르지 않는다 → node 로 시험)
// 좌표는 화면 비율(x 0~1 왼→오, y 0~1 위→아래). 거리는 「화면 높이」 단위로 잰다(aspect = 너비/높이).

export const GRAB_RADIUS = 0.09;     // 집기: 가장 가까운 물체, 반경 = 화면 높이의 9%
export const SNAP_RADIUS = 0.12;     // 놓기: 그림자 자리표가 뜨는 거리
export const LOST_HOVER_MS = 400;    // 손을 놓치면 쥔 물체가 공중에 머무는 시간
export const LOST_ASK_MS = 3000;     // 이만큼 손이 안 보이면 「손을 보여 주세요」

export const dist = (a, b, aspect = 16 / 9) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export function wrapDeg(d){ d = ((d + 180) % 360 + 360) % 360 - 180; return d === -180 ? 180 : d; }

/** 집기: 손에서 반경 안에 든 후보 중 가장 가까운 것. cands = [{id, x, y}] */
export function pickNearest(hand, cands, aspect = 16 / 9, radius = GRAB_RADIUS){
  let best = null, bd = radius;
  for (const c of cands) { const d = dist(hand, c, aspect); if (d <= bd) { bd = d; best = c; } }
  return best;
}

/** 놓기: 비어 있는 자리 중 가장 가까운 것(반경 안). slots = [{id, x, y, free}] */
export function snapSlot(pt, slots, aspect = 16 / 9, radius = SNAP_RADIUS){
  return pickNearest(pt, slots.filter(s => s.free !== false), aspect, radius);
}

export const inZone = (p, z) => p.x >= z.x0 && p.x <= z.x1 && p.y >= z.y0 && p.y <= z.y1;
/** 「내 몸」 자리 — 화면 아래 가운데. 자리가 크다(설계 3-2 쓰기) */
export const BODY_ZONE = { x0: 0.20, x1: 0.80, y0: 0.66, y1: 1.01 };   // 넓게: 카메라 손은 화면 맨 아래까지 내리면 손목부터 카메라 밖으로 빠져 끊긴다
/** 장비(보안면·장갑)를 쥔 손이 이 높이(화면 비율)보다 아래에서 사라지면 「내 쪽으로 당겼다」 = 쓰기 (카메라 손) */
export const WEAR_LOST_Y = 0.55;

/** 기울여 붓기: 떨림 무시 ±8°, 25° 넘으면 흐르기 시작, 18° 아래로 내려가면 멈춤(오르내림 방지). 양 = 기울기에 비례 */
export function makeTilt({ dead = 8, start = 25, stop = 18, full = 95 } = {}){
  let flowing = false;
  return {
    update(raw){
      const angle = Math.abs(raw) < dead ? 0 : clamp(raw, -150, 150), a = Math.abs(angle);
      if (!flowing && a >= start) flowing = true; else if (flowing && a < stop) flowing = false;
      const flow = flowing ? clamp((a - stop) / (full - stop), 0.06, 1) : 0;
      return { angle, flowing, flow, dir: angle >= 0 ? 1 : -1 };
    },
    reset(){ flowing = false; },
  };
}

/** 내리치기: 최근 150ms 손 속도(아래 방향, 화면 높이/초). 아래로 휙 내렸다가 멈추는(또는 되돌리는) 순간에 한 번 낸다.
 *  세기 = 그 휙 동안의 가장 빠른 속도 → 1 톡 · 2 탁 · 3 쾅 */
export function makeStrike({ win = 150, levels = [0.8, 1.6, 2.6], cooldown = 260 } = {}){
  const hist = []; let peak = 0, lastFire = -1e9;
  function speedAt(t){ while (hist.length > 2 && t - hist[1].t >= win) hist.shift(); const a = hist[0], b = hist[hist.length - 1]; const dt = (b.t - a.t) / 1000; return dt > 0.02 ? (b.y - a.y) / dt : 0; }
  return {
    update(t, y){
      hist.push({ t, y }); const v = speedAt(t);
      if (v >= levels[0] && t - lastFire > cooldown) peak = Math.max(peak, v);
      if (peak > 0 && v < peak * 0.4) { const p = peak; peak = 0; lastFire = t; return { level: p >= levels[2] ? 3 : p >= levels[1] ? 2 : 1, speed: +p.toFixed(2) }; }
      return null;
    },
    get speed(){ return hist.length > 1 ? speedAt(hist[hist.length - 1].t) : 0; },
    reset(){ hist.length = 0; peak = 0; },
  };
}

/** 펌프질: 세로 왕복. 폭이 작아도 인정, 박자 안 따짐. 아래로 내렸다가 다시 올라오기 시작하면 한 번. */
export function makePump({ minAmp = 0.035, hyst = 0.012 } = {}){
  let dir = 0, ext = null, top = null, count = 0;
  return {
    update(y){
      if (ext == null) { ext = y; top = y; return false; }
      if (dir >= 0) { // 내려가는 중(또는 처음)
        if (y > ext) { ext = y; if (dir === 0 && y - top > hyst) dir = 1; }
        else if (dir === 1 && ext - y > hyst) { const amp = ext - top; dir = -1; ext = y; if (amp >= minAmp) { count++; return true; } }
        else if (dir === 0 && y < top) { top = y; ext = y; }
      } else { // 올라가는 중
        if (y < ext) ext = y; else if (y - ext > hyst) { top = ext; dir = 1; ext = y; }
      }
      return false;
    },
    get count(){ return count; },
    reset(){ dir = 0; ext = null; top = null; },
  };
}

/** 옮기기 무게감: 물체가 손보다 살짝 늦게 따라온다(무거울수록 더 늦게). 한 프레임 보간 비율 */
export const followK = (dt, weight = 1) => 1 - Math.exp(-dt * 22 / Math.max(.3, weight));

/** 손 놓침: 쥔 채 손이 사라진 뒤 지난 시간 → 'hold'(공중에 머묾) | 'return'(제자리로 사뿐히) */
export const lostAction = ms => ms < LOST_HOVER_MS ? 'hold' : 'return';
