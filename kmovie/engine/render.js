/* ============================================================
   케이무비 렌더 (KMV_RENDER) — 설계서 v1 §4  "프레임 하나 = 순수 함수"
   ------------------------------------------------------------
   frame(t):
     1. V 에서 t 가 속한 클립 → 원본 프레임 (속도 매핑·프리즈)
     2. 켄 번즈 (KMV_LOOK.kenburns → 변환)
     3. 룩: 노출 정규화 → LUT → 밝기·대비·채도 → 비네트 → 시네마 바   (KMV_LOOK)
     4. 전환: transIn 구간이면 이전 클립(핸들 프레임)도 2·3 을 거친 뒤 합성   (KMV_TRANSITION)
     5. 부품 P 중 "인물 뒤" 카드 → 그 위에 인물 컷아웃(KMV_SEG 마스크)을 다시 얹음
     6. 자막 S                                                        (KMV_SUBTITLE)
     7. 부품 P 나머지: KM_PARTS.frame(id, ctx, W, H, t-at, p, theme)     (kmake/parts 그대로, KMV_PARTS.remap 로 시간 재매핑)
   미리보기와 내보내기가 같은 함수를 쓴다. 미리보기는 캐시에 없으면
   가장 가까운 프레임을 그리고(exact=false), 내보내기는 정확 프레임·정확 마스크를 기다린다.
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

  /* 홀드 컷 등장: 첫 6프레임은 첫 프레임에 머문다 (사진 같은 등장) */
  function holdIdx(c, t) { const P = g.KMV_PROJECT; if (c.fadeIn && c.fadeIn.type === 'hold' && t - c.at < 6) return P.srcFrame(c, c.at); return P.srcFrame(c, t); }

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
    const P = g.KMV_PROJECT, i = P.clipIndex(c.id), pv0 = i > 0 ? P.data.V[i - 1] : null, prev = pv0 && pv0.gap ? null : pv0;
    return { u, prev, pm: prev ? P.media(prev.media) : null, pidx: prev ? prevSrcFrame(prev, P.media(prev.media), t) : -1 };
  }

  let cutCv = null;
  function cutCanvas(W, H) {
    if (!cutCv) cutCv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    if (cutCv.width !== W || cutCv.height !== H) { cutCv.width = W; cutCv.height = H; }
    return cutCv;
  }
  function resetCtx(ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }

  /* t 에 살아 있는 부품 카드를 뒤/앞으로 가른다 */
  function partsAt(t) {
    const P = g.KMV_PROJECT, PT = g.KMV_PARTS, back = [], front = [];
    if (!g.KM_PARTS || !PT) return { back, front };
    for (const pt of P.data.P) if (t >= pt.at && t < pt.at + pt.dur) (PT.behind(pt) ? back : front).push(pt);
    return { back, front };
  }
  function needsMask(t) { return partsAt(t).back.length > 0; }

  /* 덧영상(V2) 한 장 — 모서리/중앙 작은 화면(테두리·그림자) 또는 full(꽉) */
  function rrPath(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawOverlay(ctx, W, H, e) {
    const P = g.KMV_PROJECT, m = P.media(e.o.media); if (!m || !e.img) return;
    const rot = e.src ? e.src.rot : 0;
    if (e.o.pos === 'full') { g.KMV_MEDIA.drawFit(ctx, e.img, W, H, rot); return; }
    const SF = (P.V2_SIZE && P.V2_SIZE[e.o.size]) || 0.38, mg = Math.round(W * 0.035), rad = Math.max(3, W * 0.008);
    let rw = Math.round(W * SF), rh = Math.round(rw * m.h / Math.max(1, m.w));
    if (rh > H * 0.86) { rh = Math.round(H * 0.86); rw = Math.round(rh * m.w / Math.max(1, m.h)); }
    const x = e.o.pos === 'tl' || e.o.pos === 'bl' ? mg : e.o.pos === 'c' ? (W - rw) >> 1 : W - mg - rw;
    const y = e.o.pos === 'tl' || e.o.pos === 'tr' ? mg : e.o.pos === 'c' ? (H - rh) >> 1 : H - mg - rh;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = W * 0.014; ctx.shadowOffsetY = W * 0.003;
    rrPath(ctx, x, y, rw, rh, rad); ctx.fillStyle = '#000'; ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.clip();
    ctx.translate(x, y); g.KMV_MEDIA.drawFit(ctx, e.img, rw, rh, rot);
    ctx.restore();
    rrPath(ctx, x, y, rw, rh, rad); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1.5, W * 0.0016); ctx.stroke();
  }

  function compose(ctx, W, H, t, c, img, tr, prevImg, mask, ov) {
    const P = g.KMV_PROJECT, PT = g.KMV_PARTS, theme = P.data.theme, FX = g.KMV_FX, TH = g.KM_PARTS ? g.KM_PARTS.THEMES[theme] : null;
    // ---- 클립 등장/퇴장 페이드 (KMV_FX.clip) ----
    let drawFn = dctx => drawClip(dctx, W, H, t, c, img);
    if (FX && (c.fadeIn || c.fadeOut)) {
      const k = t - c.at, uIn = c.fadeIn && FX.VISUAL(c.fadeIn.type) ? FX.clipU(c.fadeIn, k, c.dur, 'in') : null, uOut = c.fadeOut && FX.VISUAL(c.fadeOut.type) ? FX.clipU(c.fadeOut, k, c.dur, 'out') : null;
      if (uOut != null) { const inner = drawFn; drawFn = dctx => FX.clip(dctx, W, H, c.fadeOut.type, uOut, inner, TH); }
      if (uIn != null) { const inner = drawFn; drawFn = dctx => FX.clip(dctx, W, H, c.fadeIn.type, uIn, inner, TH); }
    }
    drawFn(ctx);
    // ---- 전환 ----
    if (tr) {
      let pc = null;
      if (tr.prev) { pc = prevCanvas(W, H); drawClip(pc.getContext('2d'), W, H, t, tr.prev, prevImg); }
      g.KMV_TRANSITION.apply(ctx, pc, W, H, tr.u, c.transIn, g.KM_PARTS ? g.KM_PARTS.THEMES[theme] : null);
    }
    // ---- 부품(인물 뒤) → 인물 컷아웃 ----
    const parts = partsAt(t);
    if (parts.back.length) {
      resetCtx(ctx);
      for (const pt of parts.back) { PT.drawCard(ctx, W, H, pt, t, theme); resetCtx(ctx); }
      if (mask && img) {
        const cv = cutCanvas(W, H), cx = cv.getContext('2d');
        drawClip(cx, W, H, t, c, img);                        // 같은 프레임·같은 룩
        resetCtx(cx); cx.globalCompositeOperation = 'destination-in';
        const kb = g.KMV_LOOK ? g.KMV_LOOK.kenburns(c, t) : null;
        if (kb) { cx.translate(W / 2 + kb.dx * W, H / 2 + kb.dy * H); cx.scale(kb.s, kb.s); cx.translate(-W / 2, -H / 2); }
        cx.drawImage(mask, 0, 0, W, H);                       // 마스크는 fit 좌표계 — 켄 번즈 변환을 같이 탄다
        resetCtx(cx);
        resetCtx(ctx); ctx.drawImage(cv, 0, 0);
      }
    }
    // ---- 덧영상(V2) ----
    if (ov && ov.length) { resetCtx(ctx); for (const e of ov) { drawOverlay(ctx, W, H, e); resetCtx(ctx); } }
    // ---- 자막 ----
    if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, theme, safeBottom(W, H));
    // ---- 부품(앞) ----
    if (parts.front.length) { resetCtx(ctx); for (const pt of parts.front) { PT.drawCard(ctx, W, H, pt, t, theme); resetCtx(ctx); } }
    resetCtx(ctx);
  }

  /* 빈 타임라인이라도 자막·부품은 그린다 (미디어 없이 부품만 미리 보는 경우) */
  function emptyFrame(ctx, W, H, t) {
    const P = g.KMV_PROJECT, PT = g.KMV_PARTS;
    black(ctx, W, H);
    if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme);
    if (PT) { const parts = partsAt(t); resetCtx(ctx); for (const pt of parts.back.concat(parts.front)) { PT.drawCard(ctx, W, H, pt, t, P.data.theme); resetCtx(ctx); } }
  }

  function overlaysAt(t, exactHolder) {
    const P = g.KMV_PROJECT, ov = [];
    for (const o of (P.v2At ? P.v2At(t) : [])) {
      const s2 = g.KMV_MEDIA.get(o.media); if (!s2) continue;
      const oi = P.srcFrame(o, t);
      let im = s2.cached(oi);
      if (!im) { im = s2.nearest(oi); if (exactHolder) { exactHolder.exact = false; exactHolder.pend.push({ src: s2, idx: oi }); } s2.prefetch && s2.prefetch(oi); }
      ov.push({ o, img: im, src: s2, idx: oi });
    }
    return ov;
  }

  /* 미리보기: 즉시 그림. {exact, idx, src, clip, pidx, psrc, segPending, ovPend} */
  function draw(ctx, W, H, t) {
    const P = g.KMV_PROJECT, c0 = P.clipAt(t), c = c0 && c0.gap ? null : c0;   // 빈 자리(리프트) = 검은 화면, 자막·부품·덧영상은 그대로
    if (!c) { emptyFrame(ctx, W, H, t); const eh = { exact: true, pend: [] }; const ov = overlaysAt(t, eh); if (ov.length) { resetCtx(ctx); for (const e of ov) { drawOverlay(ctx, W, H, e); resetCtx(ctx); } if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme); } return { exact: eh.exact, empty: true, ovPend: eh.pend }; }
    const src = g.KMV_MEDIA.get(c.media);
    if (!src) { black(ctx, W, H); return { exact: true, empty: true }; }
    const idx = holdIdx(c, t);
    let img = src.cached(idx), exact = !!img;
    if (!img) img = src.nearest(idx);
    const tr = transitionAt(c, t); let prevImg = null, psrc = null;
    if (tr && tr.prev) {
      psrc = g.KMV_MEDIA.get(tr.prev.media);
      if (psrc) { prevImg = psrc.cached(tr.pidx); if (!prevImg) { prevImg = psrc.nearest(tr.pidx); exact = false; } }
    }
    let mask = null, segPending = false;
    if (g.KMV_SEG && needsMask(t)) {
      mask = g.KMV_SEG.cached(c.media, idx);
      if (!mask) { mask = g.KMV_SEG.nearest(c.media, idx); segPending = true; }
    }
    const eh = { exact: true, pend: [] };
    const ov = overlaysAt(t, eh);
    compose(ctx, W, H, t, c, img, tr, prevImg, mask, ov);
    return { exact: exact && !segPending && eh.exact, idx, src, clip: c, pidx: tr ? tr.pidx : -1, psrc, segPending, media: c.media, ovPend: eh.pend };
  }

  /* 내보내기: 정확 프레임·정확 마스크를 기다려 그림 */
  async function drawExact(ctx, W, H, t) {
    const P = g.KMV_PROJECT, c0 = P.clipAt(t), c = c0 && c0.gap ? null : c0;   // 빈 자리(리프트) = 검은 화면
    if (!c) {
      emptyFrame(ctx, W, H, t);
      const SH0 = g.KMV_SHELL && g.KMV_SHELL.active ? g.KMV_SHELL : null, ov0 = [];
      for (const o of (P.v2At ? P.v2At(t) : [])) {
        const s2 = g.KMV_MEDIA.get(o.media); if (!s2) continue;
        const oi = P.srcFrame(o, t);
        let im = null; try { im = (SH0 && await SH0.exact(o.media, oi)) || await s2.getFrame(oi, false); } catch (e) { im = s2.nearest(oi); }
        ov0.push({ o, img: im, src: s2, idx: oi });
      }
      if (ov0.length) {
        resetCtx(ctx); for (const e of ov0) { drawOverlay(ctx, W, H, e); resetCtx(ctx); }
        if (g.KMV_SUBTITLE) g.KMV_SUBTITLE.draw(ctx, W, H, t, P.data.S, P.data.theme, safeBottom(W, H));
        for (const e of ov0) if (e.img && e.img.kmvTemp) { try { e.img.close(); } catch (er) {} }
      }
      return;
    }
    const src = g.KMV_MEDIA.get(c.media);
    const idx = holdIdx(c, t);
    // 데스크톱 껍데기가 붙어 있으면 같은 번호의 프레임을 원본(원화질)에서 받는다. 실패하면 프록시 프레임.
    const SH = g.KMV_SHELL && g.KMV_SHELL.active ? g.KMV_SHELL : null;
    const img = (SH && await SH.exact(c.media, idx)) || await src.getFrame(idx, false);
    const tr = transitionAt(c, t); let prevImg = null;
    if (tr && tr.prev) { const psrc = g.KMV_MEDIA.get(tr.prev.media); if (psrc) { try { prevImg = (SH && await SH.exact(tr.prev.media, tr.pidx)) || await psrc.getFrame(tr.pidx, false); } catch (e) { prevImg = psrc.nearest(tr.pidx); } } }
    let mask = null;
    if (g.KMV_SEG && needsMask(t)) { try { mask = await g.KMV_SEG.mask(c.media, idx, img); } catch (e) { mask = null; } }
    const ov = [];
    for (const o of (P.v2At ? P.v2At(t) : [])) {
      const s2 = g.KMV_MEDIA.get(o.media); if (!s2) continue;
      const oi = P.srcFrame(o, t);
      let im = null; try { im = (SH && await SH.exact(o.media, oi)) || await s2.getFrame(oi, false); } catch (e) { im = s2.nearest(oi); }
      ov.push({ o, img: im, src: s2, idx: oi });
    }
    try { compose(ctx, W, H, t, c, img, tr, prevImg, mask, ov); }
    finally { for (const f of [img, prevImg].concat(ov.map(e => e.img))) if (f && f.kmvTemp) { try { f.close(); } catch (e) {} } }
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

  g.KMV_RENDER = { draw, drawExact, drawSource, drawClip, transitionAt, needsMask, partsAt };
})(typeof window !== 'undefined' ? window : globalThis);
