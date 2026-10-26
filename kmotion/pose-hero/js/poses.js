// K-MOTION POSE HERO · 포즈 데이터(데이터 기반, 조건문 하드코딩 없음)
// feats: 정규화된 신체 특징의 목표값(t)·허용 오차(tol, 그 안은 오차 0)·가중치(w)·실패 폭(range, 이만큼 벗어나면 그 특징 오차 100%)
//   armL/armR : 위팔(어깨→팔꿈치) 각도. 0=아래로 내림, 90=옆으로 수평, 180=위로. +=몸 바깥쪽, −=몸 안쪽(가슴 앞 교차)
//   elbL/elbR : 팔꿈치 각도(180=쭉 폄)
//   wxL/wxR   : 손목의 가로 위치(어깨 중심 기준, 어깨폭 단위, +=그 팔의 바깥쪽)   wyL/wyR : 손목 높이(어깨선 기준, 위가 +)
//   wd        : 두 손목 거리(어깨폭 단위)      lean : 몸 기울기°(+=학생의 오른쪽)      drop : 어깨가 보정 때보다 내려간 양(어깨폭 단위)
//   knee      : 무릎 각도(보일 때만 평가, 안 보이면 건너뜀)
// 모든 특징은 학생 기준(왼팔=학생의 왼팔). 거울 화면이므로 학생의 오른팔이 화면 오른쪽에 보인다.
// rig: 3D 캐릭터 관절값(도). 캐릭터는 거울이므로 학생 왼팔 → 화면 왼쪽 팔. raise=들기(0 아래…180 위) fwd=앞으로 swing, elbow=굽힘(0=폄), lean, squat(0~1), tilt
// 정면 단일 웹캠에서 깊이(앞으로 뻗기)는 신뢰할 수 없어 원안 6번 「양팔 앞으로 뻗기」는 2D로 판별되는 「팔 X자 교차」로 바꿨다.
const A = (t, tol = 22, w = 2) => ({ t, tol, w, range: 60 });   // 각도
const P = (t, tol = .2, w = 1.5) => ({ t, tol, w, range: .7 }); // 위치
const REST = { armL: A(10, 30, .4), armR: A(10, 30, .4) };     // 팔 내리기(보조)

export const POSES = [
  { id: 'arms_up', name: '양팔 위로 들기', short: '양팔 위로', emoji: '🙌', hint: '두 팔을 쭉 하늘로!', difficulty: 1, hold: 500, need: ['wrL', 'wrR'],
    feats: { armL: A(170), armR: A(170), elbL: A(165, 20, 1.5), elbR: A(165, 20, 1.5), wyL: P(1.5, .4, 1), wyR: P(1.5, .4, 1), wd: { t: 1.0, tol: .25, w: 2.5, range: .25 }, lean: A(0, 14, .5) },
    rig: { raiseL: 172, raiseR: 172 } },
  { id: 'arms_side', name: '양팔 옆으로 벌리기', short: '양팔 옆으로', emoji: '🧍', hint: '비행기처럼 양팔을 옆으로!', difficulty: 1, hold: 500, need: ['wrL', 'wrR'],
    feats: { armL: A(90, 22), armR: A(90, 22), elbL: A(165, 30, .8), elbR: A(165, 30, .8), wxL: P(2.0, .45, 1), wxR: P(2.0, .45, 1), wyL: P(0, .35, .6), wyR: P(0, .35, .6), lean: A(0, 14, .5) },
    rig: { raiseL: 90, raiseR: 90 } },
  { id: 'raise_right', name: '오른팔 들기', short: '오른팔 위로', emoji: '🙋', hint: '오른팔만 번쩍!', difficulty: 1, hold: 500, need: ['wrL', 'wrR'],
    feats: { armR: A(165, 25, 2.5), elbR: A(160, 35, .7), wyR: P(1.4, .45, 1), armL: A(10, 35, 2.5), wyL: P(-1.4, .5, 1.2), lean: A(0, 14, .4) },
    rig: { raiseR: 170, raiseL: 8 } },
  { id: 'raise_left', name: '왼팔 들기', short: '왼팔 위로', emoji: '🙋', hint: '왼팔만 번쩍!', difficulty: 1, hold: 500, need: ['wrL', 'wrR'],
    feats: { armL: A(165, 25, 2.5), elbL: A(160, 35, .7), wyL: P(1.4, .45, 1), armR: A(10, 35, 2.5), wyR: P(-1.4, .5, 1.2), lean: A(0, 14, .4) },
    rig: { raiseL: 170, raiseR: 8 } },
  { id: 'hands_top', name: '양손 머리 위로 모으기', short: '머리 위 모으기', emoji: '🙏', hint: '두 손을 머리 위에서 쏙 모아요', difficulty: 2, hold: 500, need: ['wrL', 'wrR'],
    feats: { wd: { t: .35, tol: .3, w: 4, range: .5 }, wyL: P(1.3, .4, 1.2), wyR: P(1.3, .4, 1.2), armL: A(160, 25, 1), armR: A(160, 25, 1), elbL: A(115, 30, 1.5), elbR: A(115, 30, 1.5) },
    rig: { raiseL: 165, raiseR: 165, elbowL: 110, elbowR: 110, fwdL: 12, fwdR: 12 } },
  { id: 'cross', name: '팔 X자로 교차하기', short: '팔 X자', emoji: '❌', hint: '가슴 앞에서 두 팔을 X자로!', difficulty: 2, hold: 550, need: ['wrL', 'wrR'],
    feats: { wxL: P(-.45, .25, 2.5), wxR: P(-.45, .25, 2.5), wyL: P(-.15, .35, 1), wyR: P(-.15, .35, 1), armL: A(-20, 30, 1), armR: A(-20, 30, 1), elbL: A(80, 35, .6), elbR: A(80, 35, .6) },
    rig: { raiseL: 60, raiseR: 60, fwdL: 55, fwdR: 55, elbowL: 100, elbowR: 100, crossL: 1, crossR: 1 } },
  { id: 'lean_left', name: '몸 왼쪽으로 기울이기', short: '왼쪽으로 기울기', emoji: '↙️', hint: '몸을 왼쪽으로 쓰윽', difficulty: 2, hold: 550, need: [],
    feats: { lean: { t: -18, tol: 7, w: 3, range: 12 }, ...REST },
    rig: { lean: -18 } },
  { id: 'lean_right', name: '몸 오른쪽으로 기울이기', short: '오른쪽으로 기울기', emoji: '↘️', hint: '몸을 오른쪽으로 쓰윽', difficulty: 2, hold: 550, need: [],
    feats: { lean: { t: 18, tol: 7, w: 3, range: 12 }, ...REST },
    rig: { lean: 18 } },
  { id: 'squat', name: '가볍게 앉기', short: '가볍게 앉기', emoji: '🧎', hint: '무릎을 살짝 굽혀 앉아요', difficulty: 2, hold: 550, need: [],
    feats: { drop: { t: .45, tol: .15, w: 3, range: .35 }, knee: { t: 115, tol: 25, w: 1.5, range: 50, optional: true }, lean: A(0, 16, .4) },
    rig: { squat: 1, raiseL: 35, raiseR: 35, fwdL: 40, fwdR: 40, elbowL: 30, elbowR: 30 } },
  { id: 'hero', name: '슈퍼히어로 자세', short: '슈퍼히어로', emoji: '🦸', hint: '오른 주먹은 하늘로, 왼손은 허리에!', difficulty: 3, hold: 600, need: ['wrL', 'wrR'],
    feats: { armR: A(170, 22, 2.5), elbR: A(165, 30, .8), wyR: P(1.4, .4, 1), armL: A(40, 15, 2), elbL: { t: 70, tol: 25, w: 3, range: 60 }, wxL: P(.4, .35, 1), wyL: { t: -1.1, tol: .3, w: 1.5, range: .5 } },
    rig: { raiseR: 172, raiseL: 40, elbowL: 70, hipL: 1, chestUp: 1 } },
];
export const POSE_BY_ID = Object.fromEntries(POSES.map(p => [p.id, p]));
// 판정 등급(학생 테스트로 조정 가능)
export const GRADES = [
  { id: 'PERFECT', min: .90, label: 'PERFECT!', pts: 100 },
  { id: 'GREAT',   min: .80, label: 'GREAT!',   pts: 80 },
  { id: 'GOOD',    min: .70, label: 'GOOD!',    pts: 60 },
  { id: 'MISS',    min: 0,   label: 'TRY AGAIN!', pts: 0 },
];
export const PASS = .70;
export function gradeOf(sim){ return GRADES.find(g => sim >= g.min); }
