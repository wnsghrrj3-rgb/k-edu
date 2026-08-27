/* ============================================================
   케이무비 자막 (KMV_SUBTITLE) — 설계서 v1 §2-4
   ------------------------------------------------------------
   S 레인 카드 { text, at, dur, style }. 스타일 5종, 편집은 문구·시간만.
   basic  방송 기본 — 하단 중앙, 흰 글자 + 진한 테두리 + 얕은 그림자, 55px
   box    박스     — 하단, 반투명 검정 바 위 흰 글자, 좌측 정렬
   kicker 키커     — 방송 기본 + {강조} 단어 테마색, 살짝 커짐
   docu   다큐     — 하단 좌측, 가는 굵기(400), 42px, 자간 넓게, 테두리 없이 그림자만
   pop    팝       — 중앙 아래, 800, 등장 outBack, 테마색 밑줄
   공통: 프리텐다드(KM_PARTS.font), 테마색은 KM_PARTS.THEMES, 두 줄 자동 줄바꿈(글자 수), 등장·퇴장 페이드 150ms(≈5f).
   결정적 — DOM·타이머 접촉 0.
   ============================================================ */
(function (g) {
  'use strict';
  const STYLES = [
    { id: 'basic',  name: '방송 기본', hint: '인터뷰·내레이션' },
    { id: 'box',    name: '박스',      hint: '어두운 배경·정보 자막' },
    { id: 'kicker', name: '키커',      hint: '핵심 메시지 · {강조} 표기' },
    { id: 'docu',   name: '다큐',      hint: '차분한 학교 소개' },
    { id: 'pop',    name: '팝',        hint: '학생 활동·예능 톤' },
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

  /* 줄 하나 그리기 — 토큰별 색, 자간, 테두리/그림자. 반환 폭 */
  function measure(ctx, toks, ls) { let w = 0; for (const tk of toks) for (let i = 0; i < tk.text.length; i++) w += ctx.measureText(tk.text[i]).width + ls; return w - ls; }
  function drawLine(ctx, toks, x, y, o) {
    const ls = o.ls || 0;
    let cx = x;
    for (const tk of toks) {
      for (let i = 0; i < tk.text.length; i++) {
        const ch = tk.text[i], w = ctx.measureText(ch).width;
        if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = 'rgba(8,12,24,0.92)'; ctx.strokeText(ch, cx, y); }
        ctx.fillStyle = tk.hi ? o.accent : o.color;
        ctx.fillText(ch, cx, y);
        cx += w + ls;
      }
    }
  }

  function drawCard(ctx, W, H, t, card, T, safe) {
    const a = alphaOf(card, t); if (a <= 0.002) return;
    const s = H / 1080, st = card.style || 'basic', hiOK = st === 'kicker' || st === 'pop';   // {강조} 색은 키커·팝에서만
    const size = (st === 'docu' ? 42 : st === 'kicker' ? 60 : st === 'pop' ? 64 : 55) * s;
    const weight = st === 'docu' ? 400 : st === 'pop' ? 800 : 700;
    const ls = st === 'docu' ? 3 * s : 0;
    const lines = wrap(card.text || '', st === 'docu' ? 26 : 22).map(tokens);
    ctx.save();
    ctx.font = font(weight, size); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const lh = size * 1.32, widths = lines.map(l => measure(ctx, l, ls));
    const pad = 22 * s;
    let y0;
    if (st === 'box') y0 = H - 84 * s - (lines.length - 1) * lh;
    else if (st === 'docu') y0 = H - 92 * s - (lines.length - 1) * lh;
    else if (st === 'pop') y0 = H * 0.72 - (lines.length - 1) * lh;
    else y0 = H - 96 * s - (lines.length - 1) * lh;
    y0 -= safe || 0;                                     // 시네마 바 위로
    let scale = 1, dy = 0;
    if (st === 'pop') { const u = clamp((t - card.at + 0.5) / 12, 0, 1); scale = 0.85 + 0.15 * outBack(u); dy = (1 - outBack(u)) * 24 * s; }
    ctx.globalAlpha = a;
    // 박스 배경
    if (st === 'box') {
      const bw = Math.max(...widths) + pad * 2, bh = lines.length * lh + pad * 1.1, bx = 120 * s, by = y0 - size - pad * 0.45;
      ctx.fillStyle = 'rgba(6,10,20,0.62)'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = T.accent; ctx.fillRect(bx, by, 6 * s, bh);
    }
    lines.forEach((toks, i) => {
      const w = widths[i], y = y0 + i * lh + dy;
      let x = st === 'box' ? 120 * s + pad + 6 * s : st === 'docu' ? 120 * s : (W - w * scale) / 2;
      ctx.save();
      if (scale !== 1) { ctx.translate(x, y); ctx.scale(scale, scale); ctx.translate(-x, -y); }
      if (st === 'docu') { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 14 * s; ctx.shadowOffsetY = 2 * s; }
      else if (st !== 'box') { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8 * s; ctx.shadowOffsetY = 3 * s; }
      drawLine(ctx, toks, x, y, { ls, color: T.text, accent: hiOK ? T.accent : T.text, stroke: (st === 'basic' || st === 'kicker' || st === 'pop') ? 7 * s : 0 });
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      if (st === 'pop' && i === lines.length - 1) { ctx.fillStyle = T.accent; ctx.globalAlpha = a * 0.95; ctx.fillRect(x, y + 14 * s, w, 6 * s); }
      ctx.restore();
    });
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

  g.KMV_SUBTITLE = { STYLES, FADE, draw, drawCard, wrap, tokens, plain, distribute };
})(typeof window !== 'undefined' ? window : globalThis);
