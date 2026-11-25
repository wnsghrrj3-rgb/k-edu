// K-MOTION 거꾸로 나라 · 공통 거꾸로 동작 변환 엔진
// 학생 몸 특징값(motion.js, 학생 기준) → 캐릭터 명령(화면 기준).
// 규칙마다 켜고 끌 수 있다: 모든 미션·자유 체험이 이 한 함수만 쓴다(반전이 두 번 적용되는 일을 막는 유일한 자리).
//
//   lr      좌우 이동 반전       학생 오른쪽 → 캐릭터 왼쪽
//   arms    팔 동작 반전         학생 왼팔 → 캐릭터 오른팔(화면 반대편 팔)
//   size    크기 반전            웅크리기 → 커짐 · 크게 펼치기 → 작아짐
//   move    움직임/정지 반전      움직이면 멈춤 · 가만히 있으면 앞으로
//   gravity 상하(중력) 반전       몸을 낮추면 위로 · 일어서면 아래로
//   head    고개 반전            고개 왼쪽 → 캐릭터 고개 오른쪽
// 규칙이 꺼져 있으면 「평소대로」(거울처럼 같은 쪽) 움직인다.

export const RULE_NAMES = { lr: '좌우 반전', arms: '팔 반전', size: '크기 반전', move: '움직임·정지 반전', gravity: '중력 반전', head: '고개 반전' };
export const ALL_ON = { lr: true, arms: true, size: true, move: true, gravity: true, head: true };
export const ALL_OFF = { lr: false, arms: false, size: false, move: false, gravity: false, head: false };

const mirrorV = v => ({ x: -v.x, y: v.y });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function transform(f, R){
  R = R || ALL_ON;
  const c = {};
  // 좌우 위치(화면 기준 +오른쪽)
  c.x = R.lr ? -f.x : f.x;
  // 팔: sl = 화면 왼쪽 팔, sr = 화면 오른쪽 팔
  if (R.arms) { c.sl = { u: mirrorV(f.vec.R.u), f: mirrorV(f.vec.R.f) }; c.sr = { u: mirrorV(f.vec.L.u), f: mirrorV(f.vec.L.f) }; c.slUp = f.armRUp; c.srUp = f.armLUp; c.slRaise = f.armR; c.srRaise = f.armL; }
  else { c.sl = { u: f.vec.L.u, f: f.vec.L.f }; c.sr = { u: f.vec.R.u, f: f.vec.R.f }; c.slUp = f.armLUp; c.srUp = f.armRUp; c.slRaise = f.armL; c.srRaise = f.armR; }
  // 크기: grow +1(커짐) ~ -1(작아짐)
  const g = clamp(f.crouch, 0, 1) - clamp(f.spread, 0, 1);
  c.grow = R.size ? g : -g;
  c.size = R.size ? (f.crouchOn ? 'big' : f.spreadOn ? 'small' : 'mid') : (f.crouchOn ? 'small' : f.spreadOn ? 'big' : 'mid');
  // 앞으로 가기
  c.go = R.move ? !f.moving : f.moving;
  // 높이 0(바닥)~1(천장)
  const low = clamp(f.crouch, 0, 1);
  c.lift = R.gravity ? low : 1 - low;
  c.up = R.gravity ? f.crouchOn : !f.crouchOn;
  // 고개(화면 기준 +오른쪽)
  c.tilt = R.head ? -f.tilt : f.tilt;
  c.tiltDir = R.head ? -f.tiltDir : f.tiltDir;
  return c;
}

// 무작위 거꾸로 마법: 몇 초마다 규칙 하나를 바꾼다
export function randomRules(prev){
  const keys = Object.keys(RULE_NAMES); const r = { ...ALL_OFF };
  let k; do { k = keys[Math.random() * keys.length | 0]; } while (prev && prev._pick === k && keys.length > 1);
  r[k] = true; if (Math.random() < .5) { const k2 = keys[Math.random() * keys.length | 0]; r[k2] = true; }
  r._pick = k; return r;
}
