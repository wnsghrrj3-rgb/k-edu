/* ============================================================
   MK_FOCAL — R94 사진 초점: 꽉 채우기(cover)에서 잘릴 때 남길 곳
   ------------------------------------------------------------
   지금까지 cover 크롭은 무조건 가운데였다 — 세로 사진을 가로 틀에
   넣으면 얼굴이 잘리는 그 문제. el.focal = {x, y} (0~1)이 크롭의
   기준점이 된다. 없으면 0.5/0.5(가운데) = 종전과 바이트 동일.

   화면·내보내기 일치가 이 모듈의 존재 이유:
     · CSS  object-position X% Y%      (workspace·play·animation·editor)
     · SVG  preserveAspectRatio 정렬    (render.js → PNG·PDF·PPTX·MP4 스프라이트)
     · 캔버스 소스 크롭 sx=(vw-sw)·fx   (video.js 실영상 프레임)
   SVG 정렬은 Min/Mid/Max 9칸뿐이므로 R94 UI(3×3 피커)는 9칸을 쓴다 —
   0/0.5/1에서 세 세계가 정확히 같은 그림을 만든다.
   (CSS 0% = 왼쪽 변 정렬 = SVG xMin slice. 수학이 아니라 사양이 같다.)

   R106 — 세밀 초점: 모델은 처음부터 연속값이었다. CSS 세 경로는
   object-position 이 그대로 연속을 그리지만, SVG preserveAspectRatio 는
   9칸뿐이라 export 가 연속을 따라오지 못했다. coverRect 가 그 수학이다:
   원본 종횡비(el.nar = w/h)를 알면 cover 에서 이미지가 프레임 밖으로
   넘치는 양을 계산해 <image> 를 실좌표로 놓는다 — CSS object-position
   fx% 의 정의(이미지의 fx% 지점 = 프레임의 fx% 지점)와 같은 식:
     넘침 = 그린크기 − 프레임, 오프셋 = −넘침 × f
   nar 를 모르면(측정 전 문서) 종전 9칸 정렬로 그대로 폴백 — 바이트 동일.
   nar 는 세밀 초점을 실제로 만진 순간(setFine)에만 기록한다 — 문서는
   기본값을 들고 다니지 않는다(§23).
   ============================================================ */
window.MK_FOCAL = (() => {
  'use strict';
  const clamp01 = (v) => { v = +v; return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.5; };
  const R1 = (v) => Math.round(v * 10) / 10;

  /* 어떤 입력이 와도 {x, y} 0~1 — 없으면 가운데 */
  const norm = (f) => ({
    x: f && f.x != null ? clamp01(f.x) : 0.5,
    y: f && f.y != null ? clamp01(f.y) : 0.5,
  });
  const isCenter = (f) => { const n = norm(f); return n.x === 0.5 && n.y === 0.5; };

  /* CSS 렌더 4곳 공용 — cover + 비기본 초점일 때만 말을 얹는다(종전 바이트 보존) */
  const pos = (el) => {
    if (!el || !el.focal || el.fit === 'contain') return '';
    const n = norm(el.focal);
    if (n.x === 0.5 && n.y === 0.5) return '';
    return `;object-position:${R1(n.x * 100)}% ${R1(n.y * 100)}%`;
  };

  /* SVG preserveAspectRatio — 내보내기 전 경로(래스터·PDF·PPTX·MP4 스프라이트)의 정본 */
  const bucket = (v) => (v < 1 / 3 ? 'Min' : v > 2 / 3 ? 'Max' : 'Mid');
  const svgPre = (fit, focal) => (fit === 'contain'
    ? 'xMidYMid meet'
    : `x${bucket(norm(focal).x)}Y${bucket(norm(focal).y)} slice`);

  /* 쓰기 — 가운데를 고르면 지운다(문서는 기본값을 들고 다니지 않는다) */
  const set = (el, x, y) => {
    if (!el) return;
    const n = norm({ x, y });
    if (n.x === 0.5 && n.y === 0.5) delete el.focal;
    else el.focal = n;
  };

  /* R106 — 원본 종횡비 정규화 (w/h, 유효할 때만) */
  const narOf = (v) => { v = +v; return isFinite(v) && v > 0 ? v : null; };

  /* R106 — 세밀 초점 쓰기: 연속 좌표(소수 3자리) + 측정된 nar 동반 기록.
     가운데 복귀 = focal 삭제·nar 도 함께 삭제(초점 없으면 쓸 데가 없다). */
  const R3 = (v) => Math.round(v * 1000) / 1000;
  const setFine = (el, x, y, nar) => {
    if (!el) return;
    const n = { x: R3(clamp01(x)), y: R3(clamp01(y)) };
    if (n.x === 0.5 && n.y === 0.5) { delete el.focal; delete el.nar; return; }
    el.focal = n;
    const a = narOf(nar);
    if (a) el.nar = R3(a); /* 측정 실패면 기존 el.nar 보존 — export 는 있는 만큼만 연속 */
  };

  /* R106 — export 연속 크롭 수학: cover 에서 <image> 실좌표.
     frame {x,y,w,h}·nar(원본 w/h)·focal → 그릴 rect. 그린 rect 의
     종횡비가 원본과 같으므로 preserveAspectRatio 는 필요 없다("none"과
     기본이 같은 그림). 클립은 호출부(프레임 rect)가 담당한다. */
  const coverRect = (frame, nar, focal) => {
    const a = narOf(nar);
    if (!a || !frame || !(frame.w > 0) || !(frame.h > 0)) return null;
    const n = norm(focal);
    const fa = frame.w / frame.h;
    if (a >= fa) {                       /* 원본이 프레임보다 가로로 넓다 → 좌우가 넘친다 */
      const dw = frame.h * a;
      return { x: frame.x - (dw - frame.w) * n.x, y: frame.y, w: dw, h: frame.h };
    }
    const dh = frame.w / a;              /* 원본이 세로로 길다 → 상하가 넘친다 */
    return { x: frame.x, y: frame.y - (dh - frame.h) * n.y, w: frame.w, h: dh };
  };

  /* R117 — 변형(켄번즈·등장 scale·enter rotate)의 축: 초점이 있으면 초점이 축이다.
     cover의 object-position 계약(원본 fx%·fy% 지점이 틀의 fx%·fy%에 앉는다) 덕에
     틀 좌표 (fx%, fy%)를 축으로 잡으면 커지는 화면이 초점 콘텐츠를 향한다.
     재생(CSS transform-origin)과 MP4(캔버스 피벗)가 이 함수 하나를 함께 읽어
     패리티가 구조로 성립한다. 0.1% 격자 양자화도 여기서 한 번만.
     정직한 제외 — el.rot(정적 회전)은 중앙 축이 정립(R107): CSS origin은 요소당
     하나뿐이라 초점 축을 주면 정적 회전 축까지 움직여 재생≠파일이 된다. 회전
     요소는 종전 중앙 축 유지(한계로 기록). contain도 틀 좌표 기준 — 양세계가
     같은 틀 좌표를 축으로 쓰므로 패리티는 구조상 정확하다. */
  const originOf = (el) => {
    if (!el || !el.focal || el.rot) return null;
    const n = norm(el.focal);
    if (n.x === 0.5 && n.y === 0.5) return null;
    const q = (v) => Math.round(v * 1000) / 1000; /* 0.1% 격자 — CSS 표기와 캔버스가 같은 수 */
    return { x: q(n.x), y: q(n.y) };
  };

  /* R119 — 회전 요소 초점 축 분리.
     정적 회전 θ(el.rot)는 스프라이트에 중앙축으로 구워진다(R107·render.js 557).
     R117 originOf 는 회전 요소를 정직하게 제외했다 — CSS transform-origin 이
     요소당 하나뿐이라 초점 축을 주면 정적 회전 축까지 초점으로 끌려가 재생≠파일.
     해소 = 축 분리. 재생은 정적 회전(바깥 rotate·origin 중앙)과 초점 줌(안쪽 scale·
     origin 초점)을 다른 transform 으로 나눠 얹고(DOM 중첩), MP4 는 스프라이트에 구워진
     회전 위에 애니 scale 을 「초점을 θ만큼 중앙 회전시킨 점」에서 얹는다.
     수학: 균등 scale·rotate 는 회전과 A_P·R(θ,C)=R(θ,C)·A_{R⁻¹P} 로 켤레되므로,
     P=R(θ,C)·Fs 이면 캔버스 net=R(θ,C)·A_Fs = 재생 net(정적회전 중앙·초점 애니).
     등장 rotate 델타까지 함께 성립. (translate 계열 pan 은 켤레가 축을 돌려
     어긋나므로 호출부가 pan idle 을 제외한다 — 그 경우 종전 중앙 폴백.) */
  const focalRot = (el) => {
    if (!el || !el.rot || !el.focal) return null;
    const rot = +el.rot;
    if (!isFinite(rot) || rot % 360 === 0) return null;   /* 회전 없음 = 무회전 경로(originOf) */
    const n = norm(el.focal);
    if (n.x === 0.5 && n.y === 0.5) return null;            /* 가운데 = 축 이동 없음 */
    const q = (v) => Math.round(v * 1000) / 1000;           /* originOf 와 같은 0.1% 격자 */
    return { x: q(n.x), y: q(n.y), rot };
  };

  /* MP4 캔버스 피벗 — 초점(px)을 요소 중앙 기준 rot 만큼 회전한 점. 순수.
     캔버스 ctx.rotate 와 SVG rotate(render.js) 는 같은 부호(시계·y下) 규약. */
  const rotPivot = (el, ex, ey, ew, eh) => {
    const fr = focalRot(el);
    if (!fr) return null;
    const cx = ex + ew / 2, cy = ey + eh / 2;
    const dx = (ex + ew * fr.x) - cx, dy = (ey + eh * fr.y) - cy;
    const a = fr.rot * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
    return { px: cx + (dx * cos - dy * sin), py: cy + (dx * sin + dy * cos) };
  };

  /* 자가 검증 */
  const audit = () => {
    const v = [];
    if (norm(null).x !== 0.5 || norm({ x: 9 }).x !== 1 || norm({ x: -1 }).x !== 0) v.push('norm 클램프 위반');
    if (pos({ focal: { x: 0.5, y: 0.5 } }) !== '') v.push('가운데가 말을 얹음');
    if (pos({ focal: { x: 0, y: 0 } }) !== ';object-position:0% 0%') v.push('pos 산출 위반');
    if (pos({ focal: { x: 0, y: 0 }, fit: 'contain' }) !== '') v.push('contain 침범');
    if (svgPre('cover', null) !== 'xMidYMid slice') v.push('SVG 기본 위반');
    if (svgPre('cover', { x: 0, y: 1 }) !== 'xMinYMax slice') v.push('SVG 정렬 위반');
    if (svgPre('contain', { x: 0, y: 0 }) !== 'xMidYMid meet') v.push('contain meet 위반');
    const e = { fit: 'cover' }; set(e, 0.5, 0.5);
    if ('focal' in e) v.push('가운데 지우기 위반');
    /* R106 — 연속 수학 자가 검증 */
    const cr = coverRect({ x: 0, y: 0, w: 100, h: 100 }, 2, { x: 0.3, y: 0.5 });
    if (!cr || Math.abs(cr.w - 200) > 1e-9 || Math.abs(cr.x - (-30)) > 1e-9 || cr.y !== 0) v.push('coverRect 가로 넘침 위반');
    const cv = coverRect({ x: 10, y: 20, w: 100, h: 100 }, 0.5, { x: 0.5, y: 1 });
    if (!cv || Math.abs(cv.h - 200) > 1e-9 || Math.abs(cv.y - (-80)) > 1e-9 || cv.x !== 10) v.push('coverRect 세로 넘침 위반');
    if (coverRect({ x: 0, y: 0, w: 100, h: 50 }, 2, { x: 0, y: 0 }).x !== 0) v.push('coverRect 동일비 위반');
    if (coverRect({ x: 0, y: 0, w: 100, h: 100 }, 0, null) !== null || coverRect(null, 1, null) !== null) v.push('coverRect null 게이트 위반');
    const fe = {}; setFine(fe, 0.31234, 0.7, 1.5);
    if (!fe.focal || fe.focal.x !== 0.312 || fe.nar !== 1.5) v.push('setFine 기록 위반');
    setFine(fe, 0.5, 0.5, 1.5);
    if ('focal' in fe || 'nar' in fe) v.push('setFine 가운데 청소 위반');
    const fk = { nar: 1.2 }; setFine(fk, 0.2, 0.2, NaN);
    if (fk.nar !== 1.2) v.push('setFine nar 보존 위반');
    /* R117 — originOf 계약 */
    if (originOf(null) !== null || originOf({ focal: { x: 0.5, y: 0.5 } }) !== null) v.push('originOf 가운데 위반');
    if (originOf({ focal: { x: 0.3, y: 0.8 }, rot: 15 }) !== null) v.push('originOf 회전 제외 위반');
    const oo = originOf({ focal: { x: 0.3335, y: 1 } });
    if (!oo || oo.x !== 0.334 || oo.y !== 1) v.push('originOf 격자 위반');
    /* R119 — 회전 초점 축 분리 계약 */
    if (focalRot(null) !== null || focalRot({ rot: 10 }) !== null || focalRot({ focal: { x: 0.2, y: 0.3 } }) !== null) v.push('focalRot 게이트 위반');
    if (focalRot({ rot: 0, focal: { x: 0.2, y: 0.3 } }) !== null || focalRot({ rot: 360, focal: { x: 0.2, y: 0.3 } }) !== null) v.push('focalRot 0/360 위반');
    if (focalRot({ rot: 10, focal: { x: 0.5, y: 0.5 } }) !== null) v.push('focalRot 가운데 위반');
    const frv = focalRot({ rot: 90, focal: { x: 0.3335, y: 1 } });
    if (!frv || frv.x !== 0.334 || frv.rot !== 90) v.push('focalRot 격자/rot 위반');
    /* originOf 는 여전히 회전 제외 (무회전 경로 불변) */
    if (originOf({ focal: { x: 0.3, y: 0.8 }, rot: 15 }) !== null) v.push('originOf 회전 제외 회귀');
    /* 90° 회전: 중앙(50,50) 기준 초점 오프셋 (−20,+50)→회전(−50,−20)→피벗(0,30) [틀 0,0,100,100] */
    const rp = rotPivot({ rot: 90, focal: { x: 0.3, y: 1 } }, 0, 0, 100, 100);
    if (!rp || Math.abs(rp.px - 0) > 1e-6 || Math.abs(rp.py - 30) > 1e-6) v.push('rotPivot 90° 수학 위반');
    if (rotPivot({ focal: { x: 0.3, y: 0.3 } }, 0, 0, 10, 10) !== null) v.push('rotPivot 무회전 null 위반');
    return { ok: !v.length, violations: v };
  };

  return { norm, isCenter, pos, svgPre, set, setFine, coverRect, narOf, originOf, focalRot, rotPivot, audit };
})();
