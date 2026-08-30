/* ============================================================
   케이무비 효과 (KMV_FX) — 음원·폰트·효과 설계 v1 §4·§5
   ------------------------------------------------------------
   · 글씨 효과 20 (자막·부품 카드의 등장/퇴장 동작): text(id, u, n) → 한 번에 쓰는 수치
     {alpha, dx, dy, scale, blur, ls, skew, reveal, per(i,n)→{alpha,dy,dx}, pre/post 그리기 훅}
   · 클립 페이드 20 (V 클립의 등장/퇴장): clip(ctx, W, H, id, u, mode, draw, theme) —
     draw() 를 감싸 앞(변환·블러)과 뒤(색 덮기·조리개·블라인드·금선…)를 붙인다.
   · 글꼴 목록: 전부 무료·상업 허용(OFL — Google Fonts 배포본 + 프리텐다드). 고르면 그때 내려받는다.
   같은 (id, u) 면 같은 값 — 미리보기 = 내보내기. 이징은 outCubic / inOutSine 둘뿐(설계 §5 공통 원칙).
   ============================================================ */
(function (g) {
  'use strict';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const outCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const inOutSine = t => -(Math.cos(Math.PI * clamp(t, 0, 1)) - 1) / 2;
  const COL = { black: '#000', white: '#fff', navy: '#0B2545', gold: '#D9B65C' };
  const DURS = [{ id: 'short', ko: '짧게', f: 9 }, { id: 'normal', ko: '보통', f: 18 }, { id: 'long', ko: '길게', f: 30 }];
  const durF = d => (DURS.find(x => x.id === d) || DURS[1]).f;

  /* ---------- 글꼴 (무료·상업 — OFL) ---------- */
  const FONTS = [
    { id: 'pretendard', ko: '프리텐다드', fam: 'Pretendard', cat: '고딕' },
    { id: 'notosans', ko: '본고딕', fam: 'Noto Sans KR', cat: '고딕', gf: 'Noto+Sans+KR:wght@400;700;900' },
    { id: 'gothica1', ko: '고딕 A1', fam: 'Gothic A1', cat: '고딕', gf: 'Gothic+A1:wght@400;700;900' },
    { id: 'nanumgothic', ko: '나눔고딕', fam: 'Nanum Gothic', cat: '고딕', gf: 'Nanum+Gothic:wght@400;700;800' },
    { id: 'ibmplex', ko: 'IBM 플렉스', fam: 'IBM Plex Sans KR', cat: '고딕', gf: 'IBM+Plex+Sans+KR:wght@400;700' },
    { id: 'gowundodum', ko: '고운돋움', fam: 'Gowun Dodum', cat: '고딕', gf: 'Gowun+Dodum' },
    { id: 'sunflower', ko: '해바라기', fam: 'Sunflower', cat: '고딕', gf: 'Sunflower:wght@300;500;700' },
    { id: 'notoserif', ko: '본명조', fam: 'Noto Serif KR', cat: '명조', gf: 'Noto+Serif+KR:wght@400;700;900' },
    { id: 'nanummyeongjo', ko: '나눔명조', fam: 'Nanum Myeongjo', cat: '명조', gf: 'Nanum+Myeongjo:wght@400;700;800' },
    { id: 'gowunbatang', ko: '고운바탕', fam: 'Gowun Batang', cat: '명조', gf: 'Gowun+Batang:wght@400;700' },
    { id: 'songmyung', ko: '송명', fam: 'Song Myung', cat: '명조', gf: 'Song+Myung' },
    { id: 'hahmlet', ko: '함렛', fam: 'Hahmlet', cat: '명조', gf: 'Hahmlet:wght@400;700' },
    { id: 'diphylleia', ko: '디필레이아', fam: 'Diphylleia', cat: '명조', gf: 'Diphylleia' },
    { id: 'dohyeon', ko: '도현', fam: 'Do Hyeon', cat: '제목', gf: 'Do+Hyeon' },
    { id: 'jua', ko: '주아', fam: 'Jua', cat: '제목', gf: 'Jua' },
    { id: 'blackhan', ko: '검은고딕', fam: 'Black Han Sans', cat: '제목', gf: 'Black+Han+Sans' },
    { id: 'stylish', ko: '스타일리시', fam: 'Stylish', cat: '제목', gf: 'Stylish' },
    { id: 'gugi', ko: '구기', fam: 'Gugi', cat: '제목', gf: 'Gugi' },
    { id: 'orbit', ko: '오빗', fam: 'Orbit', cat: '제목', gf: 'Orbit' },
    { id: 'nanumpen', ko: '나눔 펜', fam: 'Nanum Pen Script', cat: '손글씨', gf: 'Nanum+Pen+Script' },
    { id: 'nanumbrush', ko: '나눔 붓', fam: 'Nanum Brush Script', cat: '손글씨', gf: 'Nanum+Brush+Script' },
    { id: 'gaegu', ko: '개구', fam: 'Gaegu', cat: '손글씨', gf: 'Gaegu:wght@400;700' },
    { id: 'himelody', ko: '하이멜로디', fam: 'Hi Melody', cat: '손글씨', gf: 'Hi+Melody' },
    { id: 'poorstory', ko: '푸어스토리', fam: 'Poor Story', cat: '손글씨', gf: 'Poor+Story' },
    { id: 'dongle', ko: '동글', fam: 'Dongle', cat: '손글씨', gf: 'Dongle:wght@400;700' },
    { id: 'singleday', ko: '싱글데이', fam: 'Single Day', cat: '손글씨', gf: 'Single+Day' },
    { id: 'yeonsung', ko: '연성', fam: 'Yeon Sung', cat: '손글씨', gf: 'Yeon+Sung' },
    { id: 'kirang', ko: '기랑해랑', fam: 'Kirang Haerang', cat: '손글씨', gf: 'Kirang+Haerang' },
    { id: 'eastsea', ko: '동해독도', fam: 'East Sea Dokdo', cat: '손글씨', gf: 'East+Sea+Dokdo' },
    { id: 'cutefont', ko: '큐트', fam: 'Cute Font', cat: '손글씨', gf: 'Cute+Font' },
    { id: 'playfair', ko: 'Playfair', fam: 'Playfair Display', cat: '영문', gf: 'Playfair+Display:wght@400;700;900' },
    { id: 'cormorant', ko: 'Cormorant', fam: 'Cormorant Garamond', cat: '영문', gf: 'Cormorant+Garamond:wght@400;600;700' },
    { id: 'cinzel', ko: 'Cinzel', fam: 'Cinzel', cat: '영문', gf: 'Cinzel:wght@400;700' },
    { id: 'montserrat', ko: 'Montserrat', fam: 'Montserrat', cat: '영문', gf: 'Montserrat:wght@400;700;900' },
    { id: 'bebas', ko: 'Bebas', fam: 'Bebas Neue', cat: '영문', gf: 'Bebas+Neue' },
    { id: 'inter', ko: 'Inter', fam: 'Inter', cat: '영문', gf: 'Inter:wght@400;700;900' },
  ];
  const FONT_CATS = ['고딕', '명조', '제목', '손글씨', '영문'];
  const fontOf = id => FONTS.find(f => f.id === id) || null;
  const loaded = new Set();
  /* 고른 글꼴을 내려받는다(Google Fonts css2). 이미 있으면 즉시. 오프라인이면 조용히 폴백. */
  function loadFont(id) {
    const f = fontOf(id); if (!f || !f.gf || loaded.has(id) || typeof document === 'undefined') return Promise.resolve();
    loaded.add(id);
    const link = document.createElement('link'); link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap';
    document.head.appendChild(link);
    return new Promise(res => { link.onload = () => { (document.fonts ? document.fonts.load('700 40px "' + f.fam + '"') : Promise.resolve()).then(res, res); }; link.onerror = () => res(); setTimeout(res, 4000); });
  }
  function family(id) { const f = fontOf(id); return f ? f.fam : null; }

  /* ---------- 글씨 효과 20 ---------- */
  const TEXT = [
    { id: 'fade', ko: '페이드', cat: '기본' },
    { id: 'type', ko: '타자기', cat: '기본' },
    { id: 'chars', ko: '글자 순차', cat: '순차' },
    { id: 'words', ko: '단어 순차', cat: '순차' },
    { id: 'lines', ko: '줄 순차', cat: '순차' },
    { id: 'blur', ko: '블러에서', cat: '기본' },
    { id: 'trackOpen', ko: '자간 벌어짐', cat: '격조' },
    { id: 'trackClose', ko: '자간 모임', cat: '격조' },
    { id: 'underline', ko: '밑선 드로우', cat: '격조' },
    { id: 'maskUp', ko: '선 아래서', cat: '움직임' },
    { id: 'split', ko: '위아래 스플릿', cat: '움직임' },
    { id: 'sweep', ko: '하이라이트 스윕', cat: '격조' },
    { id: 'barFirst', ko: '띠 먼저', cat: '움직임' },
    { id: 'softScale', ko: '소프트 스케일', cat: '기본' },
    { id: 'shadowSplit', ko: '그림자 분리', cat: '움직임' },
    { id: 'ink', ko: '잉크 번짐', cat: '손글씨' },
    { id: 'brush', ko: '브러시 드로우', cat: '손글씨' },
    { id: 'skew', ko: '살짝 기울임', cat: '움직임' },
    { id: 'breathe', ko: '숨쉬기', cat: '기본' },
    { id: 'countUp', ko: '카운트 업', cat: '기본' },
  ];
  const TEXT_OUT = [{ id: 'reverse', ko: '등장 거꾸로' }, { id: 'fade', ko: '페이드' }, { id: 'blur', ko: '블러로' }, { id: 'up', ko: '위로 사라짐' }];
  const textOf = id => TEXT.find(t => t.id === id) || TEXT[0];

  /* text(id, u, n, o) — u: 0..1 등장 진행(1 이후는 홀드), n: 글자 수, o: {s(화면 배율), lines}
     반환: {alpha, dx, dy, scale, blur, ls, skew, reveal(0..1 = 보이는 글자 비율), per(i,n)→{alpha,dy,dx}, under(0..1 밑선 진행), sweep(0..1 광택 위치), bar(0..1 띠 진행), ink(0..1)} */
  function text(id, u, n, o) {
    const s = (o && o.s) || 1, e = outCubic(u), r = { alpha: 1, dx: 0, dy: 0, scale: 1, blur: 0, ls: 0, skew: 0, reveal: 1, per: null, under: 1, sweep: -1, bar: 1, ink: 1 };
    const stag = (k, total, span) => clamp((u * (1 + span) - k / Math.max(1, total) * span) / 1, 0, 1);   // k번째가 늦게 시작(겹치며)
    switch (id) {
      case 'fade': r.alpha = e; break;
      case 'type': r.reveal = clamp(u, 0, 1); r.alpha = u > 0 ? 1 : 0; break;
      case 'chars': r.per = (i, tot) => { const k = outCubic(stag(i, tot, 1.6)); return { alpha: k, dy: (1 - k) * 12 * s, dx: 0 }; }; break;
      case 'words': r.per = (i, tot, w) => { const k = outCubic(stag(w == null ? i : w.idx, w == null ? tot : w.count, 1.2)); return { alpha: k, dy: 0, dx: 0 }; }; break;
      case 'lines': r.per = (i, tot, w) => { const k = outCubic(stag(w && w.line != null ? w.line : 0, w && w.lines ? w.lines : 1, 0.9)); return { alpha: k, dy: (1 - k) * 8 * s, dx: 0 }; }; break;
      case 'blur': r.alpha = e; r.blur = (1 - e) * 12 * s; break;
      case 'trackOpen': r.alpha = e; r.ls = (-6 + 6 * e) * s; break;
      case 'trackClose': r.alpha = e; r.ls = (1 - e) * 10 * s; break;
      case 'underline': r.under = clamp(u * 1.6, 0, 1); r.alpha = clamp((u - 0.35) / 0.4, 0, 1); break;
      case 'maskUp': r.per = (i, tot) => { const k = outCubic(stag(i, tot, 0.5)); return { alpha: 1, dy: (1 - k) * 1.05, dx: 0, clipUp: true }; }; r.alpha = u > 0 ? 1 : 0; break;
      case 'split': r.split = 1 - e; r.alpha = e; break;
      case 'sweep': r.alpha = clamp(u * 2, 0, 1); r.sweep = u > 0.45 ? clamp((u - 0.45) / 0.5, 0, 1) : -1; break;
      case 'barFirst': r.bar = clamp(u * 1.8, 0, 1); r.alpha = clamp((u - 0.45) / 0.4, 0, 1); break;
      case 'softScale': r.alpha = e; r.scale = 0.96 + 0.04 * e; break;
      case 'shadowSplit': r.alpha = e; r.shadowOff = (1 - e) * 14 * s; break;
      case 'ink': r.ink = e; r.alpha = 1; break;
      case 'brush': r.reveal = inOutSine(u); r.alpha = 1; r.rough = true; break;
      case 'skew': r.alpha = e; r.skew = (1 - e) * 0.06; break;
      case 'breathe': r.alpha = e; r.breathe = true; break;
      case 'countUp': r.alpha = clamp(u * 3, 0, 1); r.count = e; break;
      default: r.alpha = e;
    }
    return r;
  }
  /* 퇴장: v = 0..1 (1 = 완전히 사라짐) → 같은 꼴의 수치 */
  function textOut(id, inId, v, n, o) {
    if (id === 'reverse') return text(inId, 1 - v, n, o);
    const s = (o && o.s) || 1, e = inOutSine(v), r = { alpha: 1 - e, dx: 0, dy: 0, scale: 1, blur: 0, ls: 0, skew: 0, reveal: 1, per: null, under: 1, sweep: -1, bar: 1, ink: 1 };
    if (id === 'blur') r.blur = e * 12 * s;
    if (id === 'up') r.dy = -e * 28 * s;
    return r;
  }

  /* ---------- 클립 페이드 20 ---------- */
  const CLIP = [
    { id: 'black', ko: '페이드 검정', cat: '페이드' }, { id: 'white', ko: '페이드 흰', cat: '페이드' }, { id: 'navy', ko: '페이드 네이비', cat: '페이드' },
    { id: 'zoom', ko: '페이드 + 소프트 줌', cat: '페이드' }, { id: 'blur', ko: '페이드 + 블러', cat: '페이드' },
    { id: 'bright', ko: '페이드 + 밝음', cat: '노출' }, { id: 'dark', ko: '페이드 + 어둠', cat: '노출' },
    { id: 'slideUp', ko: '슬라이드 위', cat: '움직임' }, { id: 'slideDown', ko: '슬라이드 아래', cat: '움직임' }, { id: 'slideLeft', ko: '슬라이드 왼쪽', cat: '움직임' }, { id: 'slideRight', ko: '슬라이드 오른쪽', cat: '움직임' },
    { id: 'iris', ko: '아이리스', cat: '닦기' }, { id: 'blinds', ko: '블라인드', cat: '닦기' }, { id: 'filmRoll', ko: '필름 롤 인', cat: '움직임' },
    { id: 'flash', ko: '노출 플래시', cat: '노출' }, { id: 'vignette', ko: '비네트 스루', cat: '노출' }, { id: 'goldLine', ko: '금선 드로우', cat: '장식' },
    { id: 'kenburns', ko: '켄 번즈 시작', cat: '움직임' }, { id: 'audioOnly', ko: '소리만 페이드', cat: '소리' }, { id: 'hold', ko: '홀드 컷', cat: '기본' },
  ];
  const clipOf = id => CLIP.find(t => t.id === id) || null;
  /* u: 0..1 (등장이면 0=시작, 퇴장이면 1=끝 — 호출자가 mode 별로 넘김: 등장 u 는 커지고 퇴장 u 는 작아지게 이미 뒤집어서 준다) */
  let tmpCv = null;
  function tmpCanvas(W, H) {
    if (!tmpCv) tmpCv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    if (tmpCv.width !== W || tmpCv.height !== H) { tmpCv.width = W; tmpCv.height = H; }
    return tmpCv;
  }
  const PRE = { zoom: 1, blur: 1, slideUp: 1, slideDown: 1, slideLeft: 1, slideRight: 1, filmRoll: 1 };
  function clip(ctx, W, H, id, u, draw, theme) {
    const e = outCubic(u), inv = 1 - e, gold = (theme && theme.accent) || COL.gold, navy = (theme && theme.primary) || COL.navy;
    // ---- 앞: 변환·블러 — 클립을 임시 캔버스에 그린 뒤 옮겨 그린다(drawClip 이 변환을 초기화하므로) ----
    if (PRE[id]) {
      const tc = tmpCanvas(W, H), t2 = tc.getContext('2d');
      draw(t2);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = COL.black; ctx.fillRect(0, 0, W, H);
      ctx.save();
      switch (id) {
        case 'zoom': ctx.translate(W / 2, H / 2); ctx.scale(1 + 0.04 * inv, 1 + 0.04 * inv); ctx.translate(-W / 2, -H / 2); break;
        case 'blur': if ('filter' in ctx) ctx.filter = 'blur(' + (inv * 8 * W / 1920).toFixed(1) + 'px)'; break;
        case 'slideUp': ctx.translate(0, inv * 24 * H / 1080); break;
        case 'slideDown': ctx.translate(0, -inv * 24 * H / 1080); break;
        case 'slideLeft': ctx.translate(inv * 24 * W / 1920, 0); break;
        case 'slideRight': ctx.translate(-inv * 24 * W / 1920, 0); break;
        case 'filmRoll': ctx.translate(0, -inv * H * 0.9); break;
      }
      ctx.drawImage(tc, 0, 0);
      ctx.restore();
    } else draw(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // ---- 뒤: 덮기·조리개 ----
    const cover = (col, a) => { if (a <= 0.002) return; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };
    switch (id) {
      case 'black': case 'zoom': case 'blur': case 'slideUp': case 'slideDown': case 'slideLeft': case 'slideRight': cover(COL.black, inv); break;
      case 'white': cover(COL.white, inv); break;
      case 'navy': cover(navy, inv); break;
      case 'bright': ctx.globalCompositeOperation = 'lighter'; cover(COL.white, inv * 0.6); ctx.globalCompositeOperation = 'source-over'; cover(COL.white, inv * 0.5); break;
      case 'dark': cover(COL.black, inv * 0.75); break;
      case 'filmRoll': cover(COL.black, inv * 0.5); if (inv > 0.02) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; const y = (1 - inv) * H; ctx.fillRect(0, y - 3, W, 6); } break;
      case 'flash': { const f = u < 0.35 ? 1 - u / 0.35 : 0; cover(COL.white, f * 0.95); break; }
      case 'iris': { const R = Math.hypot(W, H) / 2, r = R * e; ctx.fillStyle = COL.black; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H / 2, Math.max(0.01, r), 0, Math.PI * 2, true); ctx.fill('evenodd');
        if (r > 2 && r < R) { const grd = ctx.createRadialGradient(W / 2, H / 2, Math.max(0, r - W * 0.06), W / 2, H / 2, r); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.fill(); } break; }
      case 'blinds': { const n = 6, bh = H / n; ctx.fillStyle = COL.black; for (let i = 0; i < n; i++) { const open = outCubic(clamp(u * 1.6 - i * 0.12, 0, 1)); if (open < 1) ctx.fillRect(0, i * bh + bh * open, W, bh * (1 - open) + 1); } break; }
      case 'vignette': { if (inv > 0.01) { const grd = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * (0.1 + 0.5 * e), W / 2, H / 2, Math.hypot(W, H) / 2); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,' + (0.95 * inv).toFixed(3) + ')'); ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H); } break; }
      case 'goldLine': { cover(COL.black, clamp(1 - u * 2.2, 0, 1)); const y = H - 96 * H / 1080, w = W * clamp(u * 1.6, 0, 1); ctx.globalAlpha = clamp(1 - (u - 0.75) * 4, 0, 1); ctx.fillStyle = gold; ctx.fillRect((W - w) / 2, y, w, 3 * H / 1080); ctx.globalAlpha = 1; break; }
    }
    ctx.globalAlpha = 1;
  }
  const VISUAL = id => !!clipOf(id) && id !== 'audioOnly' && id !== 'hold' && id !== 'kenburns';
  /* 페이드 스펙 {type, dur} 에서 t(클립 안 프레임) 의 진행값 — 등장 u(0→1), 퇴장 v(1→0). 범위 밖은 null */
  function clipU(fade, k, dur, mode) {
    if (!fade || !fade.type) return null;
    const d = Math.min(durF(fade.dur), Math.max(1, dur));
    if (mode === 'in') { if (k >= d) return null; return (k + 0.5) / d; }
    const r = dur - k; if (r > d) return null; return (r - 0.5) / d;
  }

  g.KMV_FX = { VISUAL, FONTS, FONT_CATS, fontOf, family, loadFont, TEXT, TEXT_OUT, textOf, text, textOut, CLIP, clipOf, clip, clipU, DURS, durF, COL, outCubic, inOutSine };
})(typeof window !== 'undefined' ? window : globalThis);
