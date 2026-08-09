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
   SVG 정렬은 Min/Mid/Max 9칸뿐이므로 UI(워크스페이스 3×3 피커)도
   9칸만 쓴다 — 0/0.5/1에서 세 세계가 정확히 같은 그림을 만든다.
   (CSS 0% = 왼쪽 변 정렬 = SVG xMin slice. 수학이 아니라 사양이 같다.)
   모델 자체는 연속값을 받는다 — 세밀 초점은 후속에서 UI만 열면 된다.
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
    return { ok: !v.length, violations: v };
  };

  return { norm, isCenter, pos, svgPre, set, audit };
})();
