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

  /* 그룹 바운딩 */
  function bounds(els) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    els.forEach((el) => { const b = box(el);
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); });
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  const MODES = ['left', 'centerH', 'right', 'top', 'centerV', 'bottom'];

  /* 정렬 — 2개 이상, 그룹 바운딩 기준 제자리 이동 */
  function align(els, mode) {
    if (!els || els.length < 2 || MODES.indexOf(mode) < 0) return { ok: false };
    const g = bounds(els);
    let moved = 0;
    els.forEach((el) => {
      const b = box(el);
      let nx = b.x, ny = b.y;
      if (mode === 'left') nx = g.x0;
      else if (mode === 'centerH') nx = g.cx - b.w / 2;
      else if (mode === 'right') nx = g.x1 - b.w;
      else if (mode === 'top') ny = g.y0;
      else if (mode === 'centerV') ny = g.cy - b.h / 2;
      else if (mode === 'bottom') ny = g.y1 - b.h;
      nx = R1(nx); ny = R1(ny);
      if (nx !== b.x) { el.x = nx; moved++; }
      if (ny !== b.y) { el.y = ny; moved++; }
    });
    return { ok: true, moved };
  }

  /* 동일 간격 — 3개 이상, 첫·끝 고정, 사이 여백 균등 */
  function distribute(els, axis) {
    if (!els || els.length < 3 || (axis !== 'h' && axis !== 'v')) return { ok: false };
    const X = axis === 'h';
    const sorted = els.slice().sort((a, b) => (X ? (a.x || 0) - (b.x || 0) : (a.y || 0) - (b.y || 0)));
    const sizes = sorted.map((el) => X ? wOf(el) : hOf(el));
    const first = X ? (sorted[0].x || 0) : (sorted[0].y || 0);
    const lastEl = sorted[sorted.length - 1];
    const end = (X ? (lastEl.x || 0) : (lastEl.y || 0)) + sizes[sizes.length - 1];
    const total = sizes.reduce((s, v) => s + v, 0);
    const gap = (end - first - total) / (sorted.length - 1);
    let cur = first, moved = 0;
    sorted.forEach((el, i) => {
      const v = R1(cur);
      if (X) { if (v !== (el.x || 0)) { el.x = v; moved++; } }
      else { if (v !== (el.y || 0)) { el.y = v; moved++; } }
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
    return { ok: !v.length, violations: v };
  }

  return { MODES, hOf, wOf, bounds, align, distribute, verify };
})();
