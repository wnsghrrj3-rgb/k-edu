/* ============================================================
   MK_ARRANGE — R103 정렬·동일 간격 (다중 선택의 순수 계산)
   ------------------------------------------------------------
   지시서 §10: 단순하지만 실제 제작 속도를 크게 높이는 기능이므로
   확실하게 구현한다. 전부 % 좌표 제자리 수정 — export 는 좌표를
   그대로 읽으므로 화면·내보내기 일치 문제가 원천적으로 없다.

   기준 = 선택 그룹의 공동 바운딩 박스 (디자인 도구 공통 규약).
   텍스트는 h 가 없을 수 있어 frameOf(render.js)와 같은 근사:
   size × 1.5 × 줄수.
   ============================================================ */
window.MK_ARRANGE = (() => {
  'use strict';
  const R1 = (v) => Math.round(v * 10) / 10;

  const hOf = (el) => el.h != null ? el.h
    : el.kind === 'text' ? Math.max((el.size || 3) * 1.5, (el.size || 3) * 1.4 * String(el.text || '').split('\n').length)
    : 8;
  const wOf = (el) => el.w != null ? el.w : 10;
  const box = (el) => ({ x: el.x || 0, y: el.y || 0, w: wOf(el), h: hOf(el) });

  /* R109 — ar>0 이면 회전을 아는 자(MK_LIVE.aabb — 외접 박스·텍스트 실높이)로 잰다.
     45° 돌린 사진의 「왼변」은 기울어진 선이라 정렬할 수 없지만, 그것이 차지하는
     자리는 정렬할 수 있고 사람이 겨냥하는 건 그쪽이다. 정렬·간격의 결과는 전부
     평행이동(el.x/el.y 가감)이라 중심 기준 회전과 어긋나지 않는다.
     ar 없으면 종전 경로와 수치 동일 (무회귀 근거 — aabb 는 rot=0 에서 항등). */
  const vbox = (el, ar) => {
    const L = (typeof window !== 'undefined') && window.MK_LIVE;
    return (+ar > 0 && L && L.aabb) ? L.aabb(el, +ar) : box(el);
  };

  /* 그룹 바운딩 */
  function bounds(els, ar) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    els.forEach((el) => { const b = vbox(el, ar);
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); });
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  const MODES = ['left', 'centerH', 'right', 'top', 'centerV', 'bottom'];

  /* 정렬 — 2개 이상, 그룹 바운딩 기준 제자리 이동 */
  function align(els, mode, ar) {
    if (!els || els.length < 2 || MODES.indexOf(mode) < 0) return { ok: false };
    const g = bounds(els, ar);
    let moved = 0;
    els.forEach((el) => {
      const b = vbox(el, ar);
      let nx = b.x, ny = b.y;
      if (mode === 'left') nx = g.x0;
      else if (mode === 'centerH') nx = g.cx - b.w / 2;
      else if (mode === 'right') nx = g.x1 - b.w;
      else if (mode === 'top') ny = g.y0;
      else if (mode === 'centerV') ny = g.cy - b.h / 2;
      else if (mode === 'bottom') ny = g.y1 - b.h;
      /* 목표는 보이는 박스의 자리 — 모델 좌표는 그 차이만큼 평행이동한다.
         무회전·무ar 이면 b.x = el.x||0 이라 종전 「el.x = R1(nx)」 와 수치 동일. */
      const fx = R1((el.x || 0) + nx - b.x), fy = R1((el.y || 0) + ny - b.y);
      if (fx !== (el.x || 0)) { el.x = fx; moved++; }
      if (fy !== (el.y || 0)) { el.y = fy; moved++; }
    });
    return { ok: true, moved };
  }

  /* 동일 간격 — 3개 이상, 첫·끝 고정, 사이 여백 균등 */
  function distribute(els, axis, ar) {
    if (!els || els.length < 3 || (axis !== 'h' && axis !== 'v')) return { ok: false };
    const X = axis === 'h';
    const vb = (el) => vbox(el, ar);
    const sorted = els.slice().sort((a, b) => (X ? vb(a).x - vb(b).x : vb(a).y - vb(b).y));
    const sizes = sorted.map((el) => { const b = vb(el); return X ? b.w : b.h; });
    const b0 = vb(sorted[0]);
    const first = X ? b0.x : b0.y;
    const bl = vb(sorted[sorted.length - 1]);
    const end = (X ? bl.x : bl.y) + sizes[sizes.length - 1];
    const total = sizes.reduce((s, v) => s + v, 0);
    const gap = (end - first - total) / (sorted.length - 1);
    let cur = first, moved = 0;
    sorted.forEach((el, i) => {
      const b = vb(el);
      /* 보이는 박스가 cur 에 앉도록 모델을 평행이동 — 무ar 이면 b.x = el.x||0 라 종전과 동일 */
      if (X) { const v = R1((el.x || 0) + cur - b.x); if (v !== (el.x || 0)) { el.x = v; moved++; } }
      else { const v = R1((el.y || 0) + cur - b.y); if (v !== (el.y || 0)) { el.y = v; moved++; } }
      cur += sizes[i] + gap;
    });
    return { ok: true, moved, gap: R1(gap) };
  }

  function verify() {
    const v = [];
    const mk = () => [{ x: 10, y: 10, w: 10, h: 10 }, { x: 40, y: 30, w: 20, h: 10 }, { x: 80, y: 60, w: 10, h: 20 }];
    let e = mk(); align(e, 'left');
    if (e.some((el) => el.x !== 10)) v.push('left 오류');
    e = mk(); align(e, 'right');
    if (e.some((el) => R1(el.x + el.w) !== 90)) v.push('right 오류: ' + JSON.stringify(e.map((x) => x.x)));
    e = mk(); align(e, 'centerV');
    if (e.map((el) => R1(el.y + el.h / 2)).some((c) => c !== 45)) v.push('centerV 오류: ' + JSON.stringify(e.map((x) => x.y)));
    e = mk(); const d = distribute(e, 'h');
    if (!d.ok || e[0].x !== 10 || R1(e[2].x + e[2].w) !== 90) v.push('distribute 첫끝 고정 오류');
    const gaps = [e[1].x - (e[0].x + e[0].w), e[2].x - (e[1].x + e[1].w)];
    if (Math.abs(gaps[0] - gaps[1]) > 0.2) v.push('간격 불균등: ' + gaps.join(','));
    if (align([{ x: 0, y: 0 }], 'left').ok) v.push('1개 정렬이 통과됨');
    if (distribute(mk().slice(0, 2), 'h').ok) v.push('2개 간격이 통과됨');
    const t = [{ kind: 'text', x: 0, y: 0, w: 30, size: 4, text: '가\n나' }, { x: 0, y: 50, w: 10, h: 10 }];
    align(t, 'bottom');                                 /* 텍스트 h 근사가 죽지 않는지 */
    if (!isFinite(t[0].y)) v.push('텍스트 h 근사 오류');
    /* R109 — ar 옵트인: 무ar = 종전 수치 그대로 · ar = 외접 박스로 정렬 */
    const rset = () => [{ x: 10, y: 10, w: 20, h: 10, rot: 90 }, { x: 60, y: 40, w: 10, h: 10 }];
    let r0 = rset(); align(r0, 'left');
    if (r0[0].x !== 10 || r0[1].x !== 10) v.push('무ar 경로가 회전에 반응함(무회귀 깨짐)');
    const L2 = (typeof window !== 'undefined') && window.MK_LIVE;
    if (L2 && L2.aabb) {
      const AR2 = 16 / 9;
      let r1 = rset(); align(r1, 'left', AR2);
      const va = L2.aabb(r1[0], AR2), vb2 = L2.aabb(r1[1], AR2);
      if (Math.abs(va.x - vb2.x) > 0.11) v.push('ar 정렬이 외접 왼변 불일치: ' + va.x.toFixed(2) + '≠' + vb2.x.toFixed(2));
      if (r1[0].x === 10 && r1[1].x === 60) v.push('ar 정렬이 아무것도 안 움직임');
      let r2 = [{ x: 0, y: 0, w: 20, h: 10, rot: 90 }, { x: 40, y: 0, w: 10, h: 10 }, { x: 80, y: 0, w: 10, h: 10 }];
      const d2 = distribute(r2, 'h', AR2);
      if (!d2.ok) v.push('ar 간격 실패');
      else {
        const bs = r2.map((e) => L2.aabb(e, AR2));
        const g1 = bs[1].x - (bs[0].x + bs[0].w), g2 = bs[2].x - (bs[1].x + bs[1].w);
        if (Math.abs(g1 - g2) > 0.25) v.push('ar 간격 불균등(외접 기준): ' + g1.toFixed(2) + ',' + g2.toFixed(2));
      }
    }
    return { ok: !v.length, violations: v };
  }

  return { MODES, hOf, wOf, bounds, vbox, align, distribute, verify };
})();
