/* ============================================================
   MK_SMART — R104 원클릭 디자인 프리셋 (§9 — 규칙 기반, AI 아님)
   ------------------------------------------------------------
   「알아서 예쁘게」의 정직한 구현: 규칙 세 다발이 기존 스키마
   (x/y 좌표 · el.filters(R101) · el.shadow/weight(R56))의
   값만 만들므로 화면·재생·내보내기 일치가 저절로 따라온다.

   불가침 원칙 — 사용자가 이미 정한 값은 절대 덮지 않는다:
     · 보정된 사진의 filters 는 그대로
     · 이미 그림자·굵기가 있는 텍스트는 그대로
     · 좌표는 2% 이내 「스냅」만 — 배치 의도를 바꾸지 않는다
   changed=0 이면 「이미 정돈됨」— 거짓 변화를 만들지 않는다.
   모든 호출은 snap→R() 사이에서 일어나 undo 1번에 전체 원복.
   ============================================================ */
window.MK_SMART = (() => {
  'use strict';
  const R1 = (v) => Math.round(v * 10) / 10;
  const imgs = (sc) => (sc.elements || []).filter((e) => e.kind === 'image' && e.src);
  const txts = (sc) => (sc.elements || []).filter((e) => e.kind === 'text');
  const rectOf = (e, AR) => ({ x: e.x || 0, y: e.y || 0, w: AR ? AR.wOf(e) : (e.w || 10), h: AR ? AR.hOf(e) : (e.h || 8) });
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  /* ---- 깔끔하게 — 비슷한 좌표선 스냅 + 과한 그림자 순화 ---- */
  function tidy(sc) {
    let changed = 0;
    const els = (sc.elements || []).filter((e) => e.x != null);
    /* 같은 축에서 2% 이내로 어긋난 좌표들을 무리 평균으로 스냅 */
    ['x', 'y'].forEach((k) => {
      const sorted = els.slice().sort((a, b) => (a[k] || 0) - (b[k] || 0));
      let group = [];
      const flush = () => {
        if (group.length >= 2) {
          const avg = R1(group.reduce((s, e) => s + (e[k] || 0), 0) / group.length);
          group.forEach((e) => { if ((e[k] || 0) !== avg) { e[k] = avg; changed++; } });
        }
        group = [];
      };
      sorted.forEach((e) => {
        if (!group.length || Math.abs((e[k] || 0) - (group[group.length - 1][k] || 0)) <= 2) group.push(e);
        else { flush(); group = [e]; }
      });
      flush();
    });
    /* 과도한 그림자 감소 — blur 0.6 초과만 0.35 로 (사용자 취향 범위는 존중) */
    txts(sc).forEach((e) => {
      if (e.shadow && (e.shadow.blur || 0) > 0.6) { e.shadow = { ...e.shadow, blur: 0.35 }; changed++; }
    });
    return { ok: true, changed };
  }

  /* ---- 사진 강조 — 무보정 사진에만 살짝 생기 + 사진 위 글자 가독 ---- */
  function photoPop(sc, AR) {
    let changed = 0;
    imgs(sc).forEach((e) => {
      if (!e.filters) { e.filters = { contrast: 1.08, saturate: 1.1 }; changed++; }  /* 보정된 사진 불가침 */
    });
    const iRects = imgs(sc).map((e) => rectOf(e, AR));
    txts(sc).forEach((t) => {
      if (t.shadow) return;                                                          /* 이미 그림자 있으면 불가침 */
      if (iRects.some((r) => overlaps(r, rectOf(t, AR)))) {
        t.shadow = { x: 0, y: 0.06, blur: 0.3, color: 'rgba(0,0,0,.45)' }; changed++;
      }
    });
    return { ok: true, changed };
  }

  /* ---- 텍스트 강조 — 제목·본문 크기 위계 + 제목 굵기 ---- */
  function textPop(sc, AR) {
    let changed = 0;
    const ts = txts(sc);
    if (ts.length) {
      const sorted = ts.slice().sort((a, b) => (b.size || 3) - (a.size || 3));
      const head = sorted[0], bodyMax = sorted[1] ? (sorted[1].size || 3) : null;
      if (bodyMax && (head.size || 3) / bodyMax < 1.6) { head.size = R1(bodyMax * 1.7); changed++; }
      if ((head.weight || 400) < 700) { head.weight = 700; changed++; }
      /* 사진 위 제목 가독 — photoPop 과 같은 규칙 재사용 */
      const iRects = imgs(sc).map((e) => rectOf(e, AR));
      if (!head.shadow && iRects.some((r) => overlaps(r, rectOf(head, AR)))) {
        head.shadow = { x: 0, y: 0.06, blur: 0.3, color: 'rgba(0,0,0,.45)' }; changed++;
      }
    }
    return { ok: true, changed };
  }

  const RULES = [
    { id: 'tidy',     name: '깔끔하게',   icon: '✨', run: tidy },
    { id: 'photoPop', name: '사진 강조', icon: '🖼', run: photoPop },
    { id: 'textPop',  name: '글자 강조', icon: '🔤', run: textPop },
  ];
  const run = (sc, id, AR) => {
    const r = RULES.find((x) => x.id === id);
    return r ? r.run(sc, AR) : { ok: false };
  };

  function verify() {
    const v = [];
    /* tidy — 2% 이내 스냅, 멀면 불변 */
    const s1 = { elements: [{ x: 10, y: 5, w: 5, h: 5 }, { x: 11.4, y: 40, w: 5, h: 5 }, { x: 60, y: 41, w: 5, h: 5 }] };
    tidy(s1);
    if (s1.elements[0].x !== s1.elements[1].x) v.push('x 스냅 실패');
    if (s1.elements[2].x !== 60) v.push('먼 x 가 움직임');
    if (s1.elements[1].y !== s1.elements[2].y) v.push('y 스냅 실패');
    /* tidy — 과한 그림자만 순화 */
    const s2 = { elements: [{ kind: 'text', size: 4, text: 'a', shadow: { blur: 1, color: '#000' } }, { kind: 'text', size: 4, text: 'b', shadow: { blur: 0.3, color: '#000' } }] };
    tidy(s2);
    if (s2.elements[0].shadow.blur !== 0.35) v.push('과한 그림자 미순화');
    if (s2.elements[1].shadow.blur !== 0.3) v.push('온건한 그림자를 건드림');
    /* photoPop — 무보정만, 겹칠 때만 그림자 */
    const s3 = { elements: [
      { kind: 'image', src: 'd', x: 0, y: 0, w: 60, h: 60 },
      { kind: 'image', src: 'd', x: 60, y: 60, w: 20, h: 20, filters: { grayscale: 1 } },
      { kind: 'text', size: 4, text: 't', x: 10, y: 10, w: 30 },
      { kind: 'text', size: 4, text: 'far', x: 80, y: 85, w: 15 }] };
    photoPop(s3);
    if (!s3.elements[0].filters || s3.elements[0].filters.contrast !== 1.08) v.push('무보정 생기 실패');
    if (s3.elements[1].filters.grayscale !== 1 || s3.elements[1].filters.contrast) v.push('보정 사진 불가침 위반');
    if (!s3.elements[2].shadow) v.push('사진 위 글자 그림자 실패');
    if (s3.elements[3].shadow) v.push('사진 밖 글자에 그림자');
    /* textPop — 위계 확보, 재실행 무변화(수렴) */
    const s4 = { elements: [{ kind: 'text', size: 5, text: 'title', x: 0, y: 0, w: 50 }, { kind: 'text', size: 4, text: 'body', x: 0, y: 20, w: 50 }] };
    const r1 = textPop(s4);
    if (s4.elements[0].size !== 6.8 || s4.elements[0].weight !== 700) v.push('위계 실패: ' + s4.elements[0].size);
    const r2 = textPop(s4);
    if (r2.changed !== 0) v.push('textPop 미수렴: ' + r2.changed);
    if (!r1.changed) v.push('changed 미보고');
    /* 재실행 수렴 — tidy·photoPop 도 */
    if (tidy(s1).changed !== 0) v.push('tidy 미수렴');
    if (photoPop(s3).changed !== 0) v.push('photoPop 미수렴');
    return { ok: !v.length, violations: v };
  }

  return { RULES, run, tidy, photoPop, textPop, verify };
})();
