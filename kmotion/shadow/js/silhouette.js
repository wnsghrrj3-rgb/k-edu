/* 그림자 괴물 · 실루엣 생성(목표 괴물·마우스 모드 가짜 사람)
 * 사람 모양을 두꺼운 둥근 선으로 그린다. 좌표는 "키 1.0" 단위 — 머리 꼭대기 0, 발바닥 1.
 * pose = { armL, armR: 팔 각도(0=내림, 90=옆, 170=만세), legs: 다리 벌림(0~1), lean: 기울기(°), crouch: 0~1, kneeUp: 'L'|'R'|null, headTilt }
 */
export const POSES = {
  stand:   { armL: 10,  armR: 10,  legs: .25 },
  star:    { armL: 70,  armR: 70,  legs: .75 },             // 팔 벌린 거인
  banzai:  { armL: 165, armR: 165, legs: .3 },              // 만세 괴물
  oneHand: { armL: 160, armR: 15,  legs: .3 },              // 한 손 괴물
  tee:     { armL: 90,  armR: 90,  legs: .45 },             // 티(T) 괴물
  lean:    { armL: 20,  armR: 95,  legs: .5, lean: 18 },    // 기울어진 괴물
  crouch:  { armL: 60,  armR: 60,  legs: .6, crouch: .5 },  // 쪼그린 괴물
  flamingo:{ armL: 100, armR: 100, legs: .2, kneeUp: 'R' }, // 외다리 괴물
  wave:    { armL: 130, armR: 40,  legs: .35, lean: -8 },   // 손 흔드는 괴물
  tiny:    { armL: 30,  armR: 30,  legs: .2 },
};

/** ctx 에 실루엣 그리기. cx = 발 중심 x, footY = 발바닥 y, H = 키(px). mirror 안 함(목표는 좌우 무관) */
export function drawFigure(ctx, pose, cx, footY, H, color = '#000'){
  const p = Object.assign({ armL: 10, armR: 10, legs: .3, lean: 0, crouch: 0, kneeUp: null }, pose);
  const u = H;                                   // 키 1.0 = H px
  const crouchDrop = p.crouch * .22 * u;         // 쪼그리면 몸통이 내려오고 다리가 접힘
  const headR = .085 * u, neckY = .19 * u, hipY = .55 * u + crouchDrop, shoulderY = .24 * u + crouchDrop;
  const shW = .19 * u, hipW = .14 * u, limb = .085 * u, armLen = .42 * u, legLen = (1 - .55) * u - crouchDrop;
  ctx.save(); ctx.translate(cx, footY); ctx.rotate(p.lean * Math.PI / 180);
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const top = -u + crouchDrop;                   // 머리 꼭대기 y(발 기준)
  // 다리
  ctx.lineWidth = limb * 1.15;
  const hy = top + hipY, spread = p.legs * .22 * u;
  for (const side of [-1, 1]) {
    const hx = side * hipW * .5, up = (p.kneeUp === 'L' && side < 0) || (p.kneeUp === 'R' && side > 0);
    ctx.beginPath(); ctx.moveTo(hx, hy);
    if (up) { ctx.lineTo(hx + side * .12 * u, hy + legLen * .45); ctx.lineTo(hx + side * .02 * u, hy + legLen * .75); }
    else if (p.crouch > .2) { ctx.lineTo(hx + side * (spread + .1 * u), hy + legLen * .5); ctx.lineTo(hx + side * spread, 0); }
    else ctx.lineTo(hx + side * spread, 0);
    ctx.stroke();
  }
  // 몸통
  ctx.beginPath(); ctx.moveTo(-shW / 2, top + shoulderY); ctx.lineTo(shW / 2, top + shoulderY); ctx.lineTo(hipW / 2, hy); ctx.lineTo(-hipW / 2, hy); ctx.closePath(); ctx.fill();
  ctx.lineWidth = limb * 1.6; ctx.beginPath(); ctx.moveTo(-shW / 2 + limb * .3, top + shoulderY); ctx.lineTo(shW / 2 - limb * .3, top + shoulderY); ctx.stroke();
  // 팔 (각도 0 = 아래, 180 = 위, 몸 바깥쪽으로)
  ctx.lineWidth = limb;
  for (const [side, ang] of [[-1, p.armL], [1, p.armR]]) {
    const sx = side * shW / 2, sy = top + shoulderY + limb * .2, a = ang * Math.PI / 180;
    const ex = sx + side * Math.sin(a) * armLen * .5, ey = sy + Math.cos(a) * armLen * .5;   // 팔꿈치
    const hx = sx + side * Math.sin(a) * armLen, hyy = sy + Math.cos(a) * armLen;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hyy); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hyy, limb * .62, 0, Math.PI * 2); ctx.fill();            // 손
  }
  // 목·머리
  ctx.lineWidth = limb * .9; ctx.beginPath(); ctx.moveTo(0, top + shoulderY); ctx.lineTo(0, top + neckY - headR * .3); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, top + headR + .01 * u, headR, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** 목표 괴물 카드 — 괴물 만들기 순서. size = 벽 화면 높이 대비 그림자 키 비율(보정 자리에서 s=1.35 이면 ≈ .6) */
export const MONSTERS = [
  { id: 'stand',   name: '서 있는 괴물',   pose: POSES.stand,   size: .60, tip: '그냥 서면 돼요. 그림자 크기를 맞춰 봐요' },
  { id: 'star',    name: '팔 벌린 거인',   pose: POSES.star,    size: .72, tip: '팔다리를 활짝! 빛에 조금 더 가까이' },
  { id: 'banzai',  name: '만세 괴물',      pose: POSES.banzai,  size: .62, tip: '두 손을 높이 올려요' },
  { id: 'tiny',    name: '꼬마 괴물',      pose: POSES.tiny,    size: .40, tip: '작게! 빛에서 멀어지면 그림자가 줄어요' },
  { id: 'oneHand', name: '한 손 괴물',     pose: POSES.oneHand, size: .62, tip: '한 손만 번쩍' },
  { id: 'tee',     name: '티(T) 괴물',     pose: POSES.tee,     size: .55, tip: '양팔을 옆으로 쭉' },
  { id: 'lean',    name: '기울어진 괴물',  pose: POSES.lean,    size: .64, tip: '몸을 한쪽으로 기울여요' },
  { id: 'crouch',  name: '쪼그린 괴물',    pose: POSES.crouch,  size: .50, tip: '무릎을 굽히고 팔을 벌려요' },
  { id: 'flamingo',name: '외다리 괴물',    pose: POSES.flamingo,size: .62, tip: '한 다리로! 양팔은 옆으로' },
  { id: 'giant',   name: '거대 괴물',      pose: POSES.banzai,  size: .95, tip: '만세하고 빛에 바짝 다가가요' },
];

/** 괴물 쫓기 용 몬스터 종류 */
export const CHASERS = {
  ogre:  { name: '오거',   kind: 'scare', pose: POSES.star,   color: '#5b3d8f' },    // 내 그림자가 더 커야 도망
  troll: { name: '트롤',   kind: 'scare', pose: POSES.crouch, color: '#3d7a5b' },
  bat:   { name: '박쥐',   kind: 'duck',  color: '#2b2b3d' },                          // 그림자 머리가 박쥐 밑으로 들어가야 통과
};

/** 박쥐(날개 두 장 + 몸) */
export function drawBat(ctx, cx, cy, w, color = '#000', flap = 0){
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = color; const f = Math.sin(flap) * .25;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * w * .25, -w * (.22 + f), s * w * .5, -w * (.05 + f)); ctx.quadraticCurveTo(s * w * .42, w * .06, s * w * .33, w * .02); ctx.quadraticCurveTo(s * w * .25, w * .1, s * w * .16, w * .06); ctx.quadraticCurveTo(s * w * .08, w * .12, 0, w * .1); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 0, w * .07, w * .12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w * .05, -w * .1); ctx.lineTo(-w * .08, -w * .2); ctx.lineTo(-w * .01, -w * .12); ctx.moveTo(w * .05, -w * .1); ctx.lineTo(w * .08, -w * .2); ctx.lineTo(w * .01, -w * .12); ctx.fill();
  ctx.restore();
}
