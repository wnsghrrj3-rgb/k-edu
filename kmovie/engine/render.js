/* ============================================================
   케이무비 렌더 (KMV_RENDER) — 설계서 v1 §4  "프레임 하나 = 순수 함수"
   ------------------------------------------------------------
   frame(t):
     1. V 에서 t 가 속한 클립 → 원본 프레임 (속도 매핑·프리즈)
     2. [3단계] 켄 번즈
     3. [3단계] 룩: 노출 정규화 → LUT → 밝기·대비·채도 → 비네트 → 시네마 바   (KMV_LOOK)
     4. [3단계] 전환: transIn 구간이면 이전 클립 프레임과 합성                 (KMV_TRANSITION)
     5. [3단계] 자막 S                                                        (KMV_SUBTITLE)
     6. [4단계] 부품 P: KM_PARTS.frame(id, ctx, W, H, t-at, p, theme)          (kmake/parts 그대로)
   미리보기와 내보내기가 같은 함수를 쓴다. 미리보기는 캐시에 없으면
   가장 가까운 프레임을 그리고(exact=false), 내보내기는 정확 프레임을 기다린다.
   ============================================================ */
(function (g) {
  'use strict';

  function black(ctx, W, H) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }

  function compose(ctx, W, H, t, c, img) {
    const P = g.KMV_PROJECT, m = P.media(c.media), src = g.KMV_MEDIA.get(m.id);
    black(ctx, W, H);
    if (img) g.KMV_MEDIA.drawFit(ctx, img, W, H, src.rot);
    // ---- [3단계 슬롯] 룩 ----
    if (g.KMV_LOOK) g.KMV_LOOK.apply(ctx, W, H, t, c, P.data.look);
    // ---- [3단계 슬롯] 전환 ----
    if (g.KMV_TRANSITION) g.KMV_TRANSITION.apply(ctx, W, H, t, c);
    // ---- [3단계 슬롯] 자막 ----
    if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme);
    // ---- [4단계 슬롯] 부품 (kmake/parts) ----
    if (g.KM_PARTS && P.data.P.length) {
      for (const pt of P.data.P) if (t >= pt.at && t < pt.at + pt.dur) g.KM_PARTS.frame(pt.part, ctx, W, H, (t - pt.at) / P.FPS, pt.p, P.data.theme);
    }
  }

  /* 미리보기: 즉시 그림. {exact, idx, src, clip} */
  function draw(ctx, W, H, t) {
    const P = g.KMV_PROJECT, c = P.clipAt(t);
    if (!c) { black(ctx, W, H); return { exact: true, empty: true }; }
    const src = g.KMV_MEDIA.get(c.media);
    if (!src) { black(ctx, W, H); return { exact: true, empty: true }; }
    const idx = P.srcFrame(c, t);
    let img = src.cached(idx), exact = !!img;
    if (!img) img = src.nearest(idx);
    compose(ctx, W, H, t, c, img);
    return { exact, idx, src, clip: c };
  }

  /* 내보내기: 정확 프레임을 기다려 그림 */
  async function drawExact(ctx, W, H, t) {
    const P = g.KMV_PROJECT, c = P.clipAt(t);
    if (!c) { black(ctx, W, H); return; }
    const src = g.KMV_MEDIA.get(c.media);
    const idx = P.srcFrame(c, t);
    const img = await src.getFrame(idx, false);
    compose(ctx, W, H, t, c, img);
  }

  /* 원본 프레임 하나를 그대로 (트림 드래그 중 경계 프레임 보기) */
  async function drawSource(ctx, W, H, mediaId, idx) {
    const src = g.KMV_MEDIA.get(mediaId); if (!src) return;
    black(ctx, W, H);
    let img = src.cached(idx);
    if (!img) {
      img = src.nearest(idx); if (img) g.KMV_MEDIA.drawFit(ctx, img, W, H, src.rot);
      try { img = await src.getFrame(idx, true); } catch (e) { img = null; }
      if (!img) return; black(ctx, W, H);
    }
    g.KMV_MEDIA.drawFit(ctx, img, W, H, src.rot);
  }

  g.KMV_RENDER = { draw, drawExact, drawSource };
})(typeof window !== 'undefined' ? window : globalThis);
