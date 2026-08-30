/* ============================================================
   케이무비 자막 (KMV_SUBTITLE) — 설계서 v1 §2-4
   ------------------------------------------------------------
   S 레인 카드 { text, at, dur, style }. 스타일 9종(분류 3), 편집은 문구·시간만.
   [기본]
   basic   방송 기본 — 하단 중앙, 흰 글자 + 진한 테두리 + 얕은 그림자, 55px
   box     박스     — 하단, 반투명 검정 바 위 흰 글자, 좌측 정렬
   docu    다큐     — 하단 좌측, 가는 굵기(400), 42px, 자간 넓게, 테두리 없이 그림자만
   caption 설명     — 상단 좌측 작은 캡션(금점) — 장면·자료 화면 라벨
   [강조]
   kicker  키커     — 방송 기본 + {강조} 단어 테마색, 살짝 커짐
   pop     팝       — 중앙 아래, 800, 등장 outBack, 테마색 밑줄
   type    타자기   — 글자가 순서대로 찍힘 + 커서(결정적)
   [장식]
   gold    금선     — 가운데 정렬, 위아래 얇은 금선 사이 — 전환 문구·인용
   bar     띠       — 하단 전체 폭 네이비 그라데이션 띠 + 중앙 글자 — 안내·행사
   공통: 프리텐다드(KM_PARTS.font), 테마색은 KM_PARTS.THEMES, 두 줄 자동 줄바꿈(글자 수), 등장·퇴장 페이드 150ms(≈5f).
   결정적 — DOM·타이머 접촉 0.
   ============================================================ */
(function (g) {
  'use strict';
  const CATS = [
    { id: 'base',  name: '기본' },
    { id: 'em',    name: '강조' },
    { id: 'deco',  name: '장식' },
  ];
  const STYLES = [
    { id: 'basic',   name: '방송 기본', cat: 'base', hint: '인터뷰·내레이션' },
    { id: 'box',     name: '박스',      cat: 'base', hint: '어두운 배경·정보 자막' },
    { id: 'docu',    name: '다큐',      cat: 'base', hint: '차분한 학교 소개' },
    { id: 'caption', name: '설명',      cat: 'base', hint: '장면·자료 화면 라벨 (위 왼쪽 작게)' },
    { id: 'kicker',  name: '키커',      cat: 'em',   hint: '핵심 메시지 · {강조} 표기' },
    { id: 'pop',     name: '팝',        cat: 'em',   hint: '학생 활동·예능 톤' },
    { id: 'type',    name: '타자기',    cat: 'em',   hint: '한 글자씩 — 도입·질문' },
    { id: 'gold',    name: '금선',      cat: 'deco', hint: '전환 문구·인용 (가운데)' },
    { id: 'bar',     name: '띠',        cat: 'deco', hint: '안내·행사 (하단 전체 띠)' },
  ];
  const FADE = 5;                                       // 프레임 (150ms @30fps)
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const outBack = t => { const c = 1.70158, d = c + 1; return 1 + d * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const FONT_STACK = '"Pretendard", "Noto Sans CJK KR", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const font = (w, s) => (g.KM_PARTS ? g.KM_PARTS.font(w, s) : w + ' ' + s + 'px ' + FONT_STACK);
  function theme(id) { const T = g.KM_PARTS && g.KM_PARTS.THEMES; return (T && (T[id] || T.geumseong)) || { primary: '#0B2545', accent: '#D9B65C', text: '#fff', sub: '#C9D3E3' }; }

  /* {강조} 토큰 → [{text, hi}] */
  function tokens(text) {
    const out = []; const re = /\{([^{}]*)\}/g; let last = 0, m;
    while ((m = re.exec(text))) { if (m.index > last) out.push({ text: text.slice(last, m.index), hi: false }); out.push({ text: m[1], hi: true }); last = re.lastIndex; }
    if (last < text.length) out.push({ text: text.slice(last), hi: false });
    return out;
  }
  function plain(text) { return text.replace(/\{([^{}]*)\}/g, '$1'); }
  /* 두 줄 자동 줄바꿈 — 글자 수 기준(공백 우선). 반환: 줄 문자열 배열(토큰 표기 유지) */
  function wrap(text, maxChars) {
    const p = plain(text); if (p.length <= maxChars) return [text];
    // 표기가 있으면 원문 기준으로 자를 위치 찾기 (공백 우선, 없으면 글자 수 절반)
    let cut = -1, count = 0;
    for (let i = 0; i < text.length; i++) { if (text[i] === '{' || text[i] === '}') continue; count++; if (text[i] === ' ' && count <= maxChars) cut = i; }
    if (cut < 0) { count = 0; for (let i = 0; i < text.length; i++) { if (text[i] === '{' || text[i] === '}') continue; count++; if (count >= Math.ceil(p.length / 2)) { cut = i + 1; break; } } return [text.slice(0, cut), text.slice(cut)]; }
    return [text.slice(0, cut), text.slice(cut + 1)];
  }
  function alphaOf(card, t) {
    const k = t - card.at, d = card.dur;
    const a = clamp((k + 0.5) / FADE, 0, 1), b = clamp((d - k - 0.5) / FADE, 0, 1);
    return Math.min(a, b);
  }

  /* 줄 하나 그리기 — 토큰별 색, 자간, 테두리/그림자, 글자별 효과(per) */
  function measure(ctx, toks, ls) { let w = 0; for (const tk of toks) for (let i = 0; i < tk.text.length; i++) w += ctx.measureText(tk.text[i]).width + ls; return w - ls; }
  function drawLine(ctx, toks, x, y, o) {
    const ls = o.ls || 0, fx = o.fx, size = o.size || 40, lineH = size * 1.2;
    const total = o.total || 1, base = o.base || 0, words = o.words;
    let cx = x, gi = 0;
    for (const tk of toks) {
      for (let i = 0; i < tk.text.length; i++) {
        const ch = tk.text[i], w = ctx.measureText(ch).width, idx = base + gi; gi++;
        let a = 1, dy = 0, dx = 0, clipUp = false;
        if (fx && fx.reveal < 1 && idx >= Math.floor(fx.reveal * total + 1e-6)) { cx += w + ls; continue; }
        if (fx && fx.per) { const wi = words ? words[idx] : null; const q = fx.per(idx, total, wi ? Object.assign({ line: o.line, lines: o.lines }, wi) : { line: o.line, lines: o.lines }); a = q.alpha; dy = q.dy * (q.clipUp ? lineH : 1); dx = q.dx || 0; clipUp = !!q.clipUp; }
        if (a <= 0.003) { cx += w + ls; continue; }
        ctx.save();
        ctx.globalAlpha *= a;
        if (clipUp) { ctx.beginPath(); ctx.rect(cx - 2, y - size * 1.05, w + 4 + ls, size * 1.35); ctx.clip(); }
        if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = 'rgba(8,12,24,0.92)'; ctx.strokeText(ch, cx + dx, y + dy); }
        ctx.fillStyle = tk.hi ? o.accent : o.color;
        ctx.fillText(ch, cx + dx, y + dy);
        ctx.restore();
        cx += w + ls;
      }
    }
  }
  /* 글자 인덱스 → {idx(단어 번호), count(단어 수)} */
  function wordMap(lines) {
    const map = [], all = lines.map(toks => toks.map(t => t.text).join(''));
    let wi = -1, prevSpace = true;
    for (const str of all) { prevSpace = true; for (const ch of str) { if (ch === ' ') { prevSpace = true; map.push({ idx: Math.max(0, wi), count: 0 }); continue; } if (prevSpace) wi++; prevSpace = false; map.push({ idx: wi, count: 0 }); } }
    const count = wi + 1; map.forEach(m => { m.count = count; }); return map;
  }
  const FONT_STACK_TAIL = '"Noto Sans CJK KR", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  function fontOf(card, weight, size) {
    const fam = g.KMV_FX && card.font ? g.KMV_FX.family(card.font) : null;
    return fam ? weight + ' ' + size + 'px "' + fam + '", "Pretendard", ' + FONT_STACK_TAIL : font(weight, size);
  }

  function drawCard(ctx, W, H, t, card, T, safe) {
    const a0 = alphaOf(card, t); if (a0 <= 0.002) return;
    const FX = g.KMV_FX, s = H / 1080, st = card.style || 'basic', hiOK = st === 'kicker' || st === 'pop';   // {강조} 색은 키커·팝에서만
    const sizeK = clamp((card.size == null ? 100 : card.size) / 100, 0.4, 2.5);
    const size = (st === 'docu' ? 42 : st === 'kicker' ? 60 : st === 'pop' ? 64 : st === 'caption' ? 30 : st === 'gold' ? 52 : st === 'bar' ? 46 : 55) * s * sizeK;
    const weight = st === 'docu' ? 400 : st === 'pop' ? 800 : st === 'caption' ? 600 : st === 'gold' ? 500 : 700;
    let ls = (st === 'docu' ? 3 : st === 'gold' ? 4 : st === 'caption' ? 1 : 0) * s;
    let text = card.text || '';
    // ---- 등장·퇴장 효과 (KMV_FX) — 타자기 스타일은 등장 'type' 이 기본 ----
    const k = t - card.at, dur = card.dur;
    const fin = card.fxIn || (st === 'type' ? { type: 'type' } : null), fout = card.fxOut || null;
    const nCh = plain(text).length;
    const dIn = fin ? Math.min(FX ? FX.durF(fin.dur) : 18, Math.max(1, dur)) : 0, dOut = fout ? Math.min(FX ? FX.durF(fout.dur) : 18, Math.max(1, dur)) : 0;
    let fx = null;
    if (FX && fin && k < dIn) fx = FX.text(fin.type, (k + 0.5) / (fin.type === 'type' ? Math.max(dIn, nCh * 2) : dIn), nCh, { s });
    else if (FX && fin && fin.type === 'type' && k < nCh * 2) fx = FX.text('type', (k + 0.5) / (nCh * 2), nCh, { s });
    else if (FX && fout && dur - k <= dOut) fx = FX.textOut(fout.type, fin ? fin.type : 'fade', 1 - (dur - k - 0.5) / dOut, nCh, { s });
    else if (FX && fin && (fin.type === 'breathe' || fin.type === 'sweep')) fx = FX.text(fin.type, 1, nCh, { s });
    let cursor = false;
    if (st === 'type' && fx && fx.reveal < 1) cursor = true;
    else if (st === 'type' && k < card.dur - FADE) cursor = Math.floor(k / 8) % 2 === 0;
    const lines = wrap(text, st === 'docu' ? 26 : st === 'caption' ? 30 : st === 'gold' ? 24 : 22).map(tokens);
    ctx.save();
    ctx.font = fontOf(card, weight, size); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    if (fx && fx.ls) ls += fx.ls;
    const lh = size * 1.32, widths = lines.map(l => measure(ctx, l, ls));
    const pad = 22 * s;
    let y0;
    if (st === 'box') y0 = H - 84 * s - (lines.length - 1) * lh;
    else if (st === 'docu') y0 = H - 92 * s - (lines.length - 1) * lh;
    else if (st === 'pop') y0 = H * 0.72 - (lines.length - 1) * lh;
    else if (st === 'caption') y0 = 128 * s;
    else if (st === 'gold') y0 = H * 0.47 - (lines.length - 1) * lh / 2;
    else if (st === 'bar') y0 = H - 74 * s - (lines.length - 1) * lh;
    else y0 = H - 96 * s - (lines.length - 1) * lh;
    if (card.pos === 'top') y0 = 128 * s + size * 0.9; else if (card.pos === 'mid') y0 = H * 0.5 + size * 0.35 - (lines.length - 1) * lh / 2;
    else if (card.pos === 'bottom') y0 = H - 96 * s - (lines.length - 1) * lh;
    if (card.y) y0 += card.y / 100 * H;                   // 미세 위치(화면 높이 %)
    if (st === 'caption' && card.pos !== 'bottom' && card.pos !== 'mid') y0 += safe || 0;   // 시네마 바 안쪽으로 (위)
    else if (st !== 'gold' && card.pos !== 'top' && card.pos !== 'mid') y0 -= safe || 0;      // (아래)
    let scale = 1, dy = 0;
    if (st === 'pop' && !fin) { const u = clamp((t - card.at + 0.5) / 12, 0, 1); scale = 0.85 + 0.15 * outBack(u); dy = (1 - outBack(u)) * 24 * s; }
    if (fx) { scale *= fx.scale || 1; dy += fx.dy || 0; if (fx.breathe) scale *= 1 + 0.015 * Math.sin(2 * Math.PI * (k / 30) / 6); }
    const alpha = a0 * (fx ? fx.alpha : 1);
    ctx.globalAlpha = alpha;
    if (fx && fx.blur > 0.2 && 'filter' in ctx) ctx.filter = 'blur(' + fx.blur.toFixed(1) + 'px)';
    const textCol = card.color === 'white' ? '#FFFFFF' : card.color === 'gold' ? T.accent : card.color === 'navy' ? T.primary : card.color === 'black' ? '#111' : (st === 'caption' ? '#EAF0F8' : T.text);
    // 배경 — 박스·띠
    const barK = fx && fx.bar != null ? fx.bar : 1;
    if (st === 'box') {
      const bw = (Math.max(...widths) + pad * 2) * barK, bh = lines.length * lh + pad * 1.1, bx = 120 * s, by = y0 - size - pad * 0.45;
      ctx.fillStyle = 'rgba(6,10,20,0.62)'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = T.accent; ctx.fillRect(bx, by, 6 * s, bh);
    } else if (st === 'bar') {
      const bh = lines.length * lh + pad * 2.4, by = y0 - size - pad;
      const grd = ctx.createLinearGradient(0, by, 0, by + bh);
      grd.addColorStop(0, 'rgba(11,37,69,0.0)'); grd.addColorStop(0.35, 'rgba(11,37,69,0.78)'); grd.addColorStop(1, 'rgba(11,37,69,0.88)');
      ctx.fillStyle = grd; ctx.fillRect((W - W * barK) / 2, by, W * barK, bh);
      ctx.fillStyle = T.accent; ctx.globalAlpha = alpha * 0.9; ctx.fillRect((W - W * barK) / 2, by + bh * 0.22, W * barK, 1.5 * s); ctx.globalAlpha = alpha;
    } else if (st === 'gold') {                          // 위아래 얇은 금선
      const bw = Math.max(...widths) * barK, gy0 = y0 - size - 20 * s, gy1 = y0 + (lines.length - 1) * lh + 26 * s;
      ctx.fillStyle = T.accent;
      ctx.fillRect((W - bw) / 2 - 26 * s, gy0, bw + 52 * s, 2 * s);
      ctx.fillRect((W - bw) / 2 - 26 * s, gy1, bw + 52 * s, 2 * s);
    } else if (st === 'caption') {                       // 금점
      ctx.fillStyle = T.accent;
      ctx.beginPath(); ctx.arc(96 * s, y0 - size * 0.34, 5 * s, 0, Math.PI * 2); ctx.fill();
    }
    const words = fx && fx.per ? wordMap(lines) : null;
    let base = 0;
    lines.forEach((toks, i) => {
      const w = widths[i], y = y0 + i * lh + dy, n = toks.reduce((acc, tk) => acc + tk.text.length, 0);
      let x = st === 'box' ? 120 * s + pad + 6 * s : st === 'docu' ? 120 * s : st === 'caption' ? 116 * s : (W - w * scale) / 2;
      ctx.save();
      if (scale !== 1) { ctx.translate(x, y); ctx.scale(scale, scale); ctx.translate(-x, -y); }
      if (fx && fx.skew) { ctx.translate(x, y); ctx.transform(1, 0, fx.skew, 1, 0, 0); ctx.translate(-x, -y); }
      if (fx && fx.split > 0.002) {                      // 위아래 반쪽이 각각 반대 방향에서
        const off = fx.split * size * 0.9;
        ctx.save(); ctx.beginPath(); ctx.rect(x - 10, y - size * 1.1, w + 20, size * 0.62); ctx.clip(); ctx.translate(-off, 0);
        drawLine(ctx, toks, x, y, { ls, size, color: textCol, accent: hiOK ? T.accent : textCol, stroke: 0, fx: null }); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(x - 10, y - size * 0.48, w + 20, size * 0.9); ctx.clip(); ctx.translate(off, 0);
        drawLine(ctx, toks, x, y, { ls, size, color: textCol, accent: hiOK ? T.accent : textCol, stroke: 0, fx: null }); ctx.restore();
        ctx.restore(); base += n; return;
      }
      if (fx && fx.ink < 1) {                            // 잉크 번짐 — 가운데서 번지는 원 마스크
        const r = Math.max(w, size) * 0.75 * fx.ink + size * 0.2 * fx.ink;
        ctx.beginPath(); ctx.arc(x + w / 2, y - size * 0.35, r, 0, Math.PI * 2); ctx.clip();
        if ('filter' in ctx) ctx.filter = 'blur(' + ((1 - fx.ink) * 6 * s).toFixed(1) + 'px)';
      }
      if (fx && fx.shadowOff) { ctx.save(); ctx.globalAlpha = alpha * 0.55; drawLine(ctx, toks, x + fx.shadowOff, y + fx.shadowOff, { ls, size, color: 'rgba(0,0,0,0.9)', accent: 'rgba(0,0,0,0.9)', stroke: 0 }); ctx.restore(); }
      if (st === 'docu' || st === 'gold' || st === 'caption') { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 14 * s; ctx.shadowOffsetY = 2 * s; }
      else if (st !== 'box' && st !== 'bar') { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8 * s; ctx.shadowOffsetY = 3 * s; }
      drawLine(ctx, toks, x, y, { ls, size, color: textCol, accent: hiOK ? T.accent : textCol, stroke: (st === 'basic' || st === 'kicker' || st === 'pop' || st === 'type') ? 7 * s : 0, fx, total: nCh, base, words, line: i, lines: lines.length });
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      if (st === 'pop' && i === lines.length - 1) { ctx.fillStyle = T.accent; ctx.globalAlpha = alpha * 0.95; ctx.fillRect(x, y + 14 * s, w, 6 * s); }
      if (fx && fx.under < 1 && i === lines.length - 1) { ctx.fillStyle = T.accent; ctx.globalAlpha = alpha; ctx.fillRect(x, y + 12 * s, w * fx.under, 3 * s); }
      else if (fx && fx.under < 1) { /* 윗줄엔 안 그림 */ }
      else if (fin && fin.type === 'underline' && i === lines.length - 1 && k < dur - dOut) { ctx.fillStyle = T.accent; ctx.globalAlpha = alpha; ctx.fillRect(x, y + 12 * s, w, 3 * s); }
      if (fx && fx.sweep >= 0) {                         // 금빛 광택이 한 번 지나감
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = x - w * 0.3 + (w * 1.6) * fx.sweep;
        const grd = ctx.createLinearGradient(sx - size * 1.2, 0, sx + size * 1.2, 0); grd.addColorStop(0, 'rgba(217,182,92,0)'); grd.addColorStop(0.5, 'rgba(255,240,190,0.55)'); grd.addColorStop(1, 'rgba(217,182,92,0)');
        ctx.fillStyle = grd; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.rect(x, y - size, w, size * 1.3); ctx.clip(); ctx.fillRect(x, y - size, w, size * 1.3); ctx.restore();
      }
      if (st === 'type' && cursor && i === lines.length - 1) { ctx.fillStyle = T.accent; ctx.globalAlpha = alpha; const shown = fx && fx.reveal < 1 ? measure(ctx, [{ text: toks.map(t2 => t2.text).join('').slice(0, Math.max(0, Math.floor(fx.reveal * nCh) - base)) }], ls) : w; ctx.fillRect(x + shown + 6 * s, y - size * 0.82, 5 * s, size * 0.94); }
      ctx.restore();
      base += n;
    });
    ctx.filter = 'none';
    ctx.restore();
  }

  function draw(ctx, W, H, t, S, themeId, safe) {
    if (!S || !S.length) return;
    const T = theme(themeId);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over';
    for (const card of S) if (t >= card.at && t < card.at + card.dur) drawCard(ctx, W, H, t, card, T, safe);
    ctx.globalAlpha = 1;
  }

  /* 문장 목록 → A1 음성 구간에 자동 분배. voice: [{at,dur}] (프레임). 구간이 부족하면 남는 문장은 전체 길이에 고르게. */
  function distribute(lines, voice, total, FPS) {
    const out = distributeRaw(lines, voice, total, FPS);
    out.sort((a, b) => a.at - b.at);                       // 겹침 금지 — 뒤 카드를 앞 카드 끝으로 민다
    for (let i = 1; i < out.length; i++) { const e = out[i - 1].at + out[i - 1].dur; if (out[i].at < e) out[i].at = e; }
    return out;
  }
  function distributeRaw(lines, voice, total, FPS) {
    lines = lines.map(s => s.trim()).filter(Boolean); if (!lines.length) return [];
    const minDur = Math.round(1.2 * FPS);
    if (voice && voice.length >= lines.length) {
      // 구간이 더 많으면 앞에서부터 긴 구간 우선으로 lines.length 개 고르고 시간순 정렬
      const picked = voice.slice().sort((a, b) => b.dur - a.dur).slice(0, lines.length).sort((a, b) => a.at - b.at);
      return lines.map((text, i) => ({ text, at: picked[i].at, dur: Math.max(minDur, picked[i].dur), style: 'basic' }));
    }
    if (voice && voice.length) {
      // 구간보다 문장이 많으면 각 구간을 문장 수 비례로 쪼갬
      const per = Math.max(1, Math.round(lines.length / voice.length)), out = []; let k = 0;
      voice.forEach((v, vi) => {
        const n = vi === voice.length - 1 ? lines.length - k : Math.min(per, lines.length - k); if (n <= 0) return;
        const d = v.dur / n;
        for (let i = 0; i < n; i++) out.push({ text: lines[k++], at: Math.round(v.at + i * d), dur: Math.max(minDur, Math.round(d)), style: 'basic' });
      });
      return out;
    }
    const d = Math.max(minDur, Math.floor(total / lines.length));
    return lines.map((text, i) => ({ text, at: i * d, dur: d, style: 'basic' }));
  }

  g.KMV_SUBTITLE = { CATS, STYLES, FADE, draw, drawCard, wrap, tokens, plain, distribute, fontOf };
})(typeof window !== 'undefined' ? window : globalThis);
