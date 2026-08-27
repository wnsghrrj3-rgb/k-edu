/* ============================================================
   케이무비 렌더 (KMV_RENDER) — 설계서 v1 §4  "프레임 하나 = 순수 함수"
   ------------------------------------------------------------
   frame(t):
     1. V 에서 t 가 속한 클립 → 원본 프레임 (속도 매핑·프리즈)
     2. 켄 번즈 (KMV_LOOK.kenburns → 변환)
     3. 룩: 노출 정규화 → LUT → 밝기·대비·채도 → 비네트 → 시네마 바   (KMV_LOOK)
     4. 전환: transIn 구간이면 이전 클립(핸들 프레임)도 2·3 을 거친 뒤 합성   (KMV_TRANSITION)
     5. 자막 S                                                        (KMV_SUBTITLE)
     6. 부품 P: KM_PARTS.frame(id, ctx, W, H, t-at, p, theme)          (kmake/parts 그대로)
   미리보기와 내보내기가 같은 함수를 쓴다. 미리보기는 캐시에 없으면
   가장 가까운 프레임을 그리고(exact=false), 내보내기는 정확 프레임을 기다린다.
   ============================================================ */
(function (g) {
  'use strict';

  function safeBottom(W, H) { const L = g.KMV_PROJECT.data.look; return L && L.cinemaBar ? Math.round((H - W / 2.39) / 2) : 0; }
  function black(ctx, W, H) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }

  /* 이전 클립의 "핸들" 원본 프레임 — out 너머로 이어 가고, 원본 끝이면 마지막 프레임 */
  function prevSrcFrame(prev, m, t) {
    if (prev.freeze) return prev.in;
    const P = g.KMV_PROJECT, over = t - (prev.at + prev.dur);                // 타임라인 프레임 초과분(>=0)
    const rate = P.SPEED[prev.speed].f;
    return Math.min(m.dur - 1, prev.out + Math.round(over * m.fps / P.FPS * rate));
  }

  /* 클립 하나: 원본 프레임 → 켄 번즈 → 룩. (전환·자막·부품 없음) */
  function drawClip(ctx, W, H, t, c, img) {
    const P = g.KMV_PROJECT, m = P.media(c.media), src = g.KMV_MEDIA.get(m.id);
    black(ctx, W, H);
    if (img) {
      const kb = g.KMV_LOOK ? g.KMV_LOOK.kenburns(c, t) : null;
      if (kb) { ctx.save(); ctx.translate(W / 2 + kb.dx * W, H / 2 + kb.dy * H); ctx.scale(kb.s, kb.s); ctx.translate(-W / 2, -H / 2); }
      g.KMV_MEDIA.drawFit(ctx, img, W, H, src.rot);
      if (kb) ctx.restore();
    }
    if (g.KMV_LOOK) g.KMV_LOOK.apply(ctx, W, H, t, c, P.data.look);
  }

  let prevCv = null;
  function prevCanvas(W, H) {
    if (!prevCv) prevCv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    if (prevCv.width !== W || prevCv.height !== H) { prevCv.width = W; prevCv.height = H; }
    return prevCv;
  }

  /* 전환 정보: t 에서 클립 c 가 전환 중이면 {u, prev, pm, pidx} */
  function transitionAt(c, t) {
    const T = g.KMV_TRANSITION; if (!T) return null;
    const u = T.progress(c, t); if (u == null) return null;
    const P = g.KMV_PROJECT, i = P.clipIndex(c.id), prev = i > 0 ? P.data.V[i - 1] : null;
    return { u, prev, pm: prev ? P.media(prev.media) : null, pidx: prev ? prevSrcFrame(prev, P.media(prev.media), t) : -1 };
  }

  function compose(ctx, W, H, t, c, img, tr, prevImg) {
    const P = g.KMV_PROJECT;
    drawClip(ctx, W, H, t, c, img);
    // ---- 전환 ----
    if (tr) {
      let pc = null;
      if (tr.prev) { pc = prevCanvas(W, H); drawClip(pc.getContext('2d'), W, H, t, tr.prev, prevImg); }
      g.KMV_TRANSITION.apply(ctx, pc, W, H, tr.u, c.transIn, g.KM_PARTS ? g.KM_PARTS.THEMES[P.data.theme] : null);
    }
    // ---- 자막 ----
    if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme, safeBottom(W, H));
    // ---- 부품 (kmake/parts) ----
    if (g.KM_PARTS && P.data.P.length) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      for (const pt of P.data.P) if (t >= pt.at && t < pt.at + pt.dur) { try { g.KM_PARTS.frame(pt.part, ctx, W, H, (t - pt.at) / P.FPS, pt.p, P.data.theme); } catch (e) { console.warn('부품', pt.part, e); } }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  }

  /* 미리보기: 즉시 그림. {exact, idx, src, clip, pidx, psrc} */
  function draw(ctx, W, H, t) {
    const P = g.KMV_PROJECT, c = P.clipAt(t);
    if (!c) { black(ctx, W, H); if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme); return { exact: true, empty: true }; }
    const src = g.KMV_MEDIA.get(c.media);
    if (!src) { black(ctx, W, H); return { exact: true, empty: true }; }
    const idx = P.srcFrame(c, t);
    let img = src.cached(idx), exact = !!img;
    if (!img) img = src.nearest(idx);
    const tr = transitionAt(c, t); let prevImg = null, psrc = null;
    if (tr && tr.prev) {
      psrc = g.KMV_MEDIA.get(tr.prev.media);
      if (psrc) { prevImg = psrc.cached(tr.pidx); if (!prevImg) { prevImg = psrc.nearest(tr.pidx); exact = false; } }
    }
    compose(ctx, W, H, t, c, img, tr, prevImg);
    return { exact, idx, src, clip: c, pidx: tr ? tr.pidx : -1, psrc };
  }

  /* 내보내기: 정확 프레임을 기다려 그림 */
  async function drawExact(ctx, W, H, t) {
    const P = g.KMV_PROJECT, c = P.clipAt(t);
    if (!c) { black(ctx, W, H); if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme); return; }
    const src = g.KMV_MEDIA.get(c.media);
    const idx = P.srcFrame(c, t);
    const img = await src.getFrame(idx, false);
    const tr = transitionAt(c, t); let prevImg = null;
    if (tr && tr.prev) { const psrc = g.KMV_MEDIA.get(tr.prev.media); if (psrc) { try { prevImg = await psrc.getFrame(tr.pidx, false); } catch (e) { prevImg = psrc.nearest(tr.pidx); } } }
    compose(ctx, W, H, t, c, img, tr, prevImg);
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

  g.KMV_RENDER = { draw, drawExact, drawSource, drawClip, transitionAt };
})(typeof window !== 'undefined' ? window : globalThis);
