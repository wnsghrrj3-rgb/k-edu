/* ============================================================
   MK_DECOR — R98 장면이 꾸며진다: 테마×역할별 데코 레이어
   ------------------------------------------------------------
   준호: 「사진·길이 구성 말고, 안(장면)도 좀 꾸며지면 좋겠다」.
   지금 장면은 단색 배경 + 글자 + 사진 사각형 — 조립이 그렇게만
   하기 때문이다. 이 모듈은 buildScene이 완성한 요소 배열 「앞」에
   장식 fill 요소를 깔아 준다(배열 순서 = z순서 → 콘텐츠 뒤 장식).

   기술 기반 (전부 기존 렌더 능력 — 신규 렌더 코드 0):
   · fill 박스 = MK_CAPTION 자막 바와 같은 형식, 4개 렌더 경로
     (워크스페이스·재생·SVG 내보내기·MP4 스프라이트) 기왕 지원
   · 원 = shape:'ellipse'(render.js SVG) + radius:999(play/workspace
     CSS가 50%로 클램프) 이중 표기 → 어느 경로에서도 원
   · rgba 투명도 = 자막 scrim이 이미 쓰는 관례

   원칙:
   · 결정적 — 난수 0, seq 홀짝으로 좌우 교대
   · 정직 — 풀블리드 사진 장면엔 장식을 「안」 깐다 (어차피 안
     보이는 걸 깔아 두는 건 문서 비대일 뿐)
   · 대비 — 배경 종류(paper/dark/accent)별로 토큰에서 색을 고른다
   · 모든 장식 요소는 decor:true 표식 — 편집 화면에서 선택·삭제
     가능한 보통 요소이기도 하다 (학생이 지우면 그대로 존중)
   ============================================================ */
window.MK_DECOR = (() => {
  'use strict';
  const R1 = (v) => Math.round(v * 10) / 10;

  /* hex → rgba (3·6자리, 이미 rgba면 그대로) */
  function alpha(color, a) {
    const c = String(color || '');
    if (c.startsWith('rgba') || c.startsWith('rgb')) return c;
    let h = c.replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h, 16);
    if (!isFinite(n)) return c;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  /* 배경 종류별 장식 색 — strength 'soft'(은은)·'solid'(진하게) */
  function tone(bgKey, T, strength) {
    if (bgKey === 'accent') return strength === 'solid' ? alpha(T.dark, 0.35) : alpha(T.onDark, 0.35);
    if (bgKey === 'dark') return strength === 'solid' ? T.accent : alpha(T.accent, 0.3);
    return strength === 'solid' ? T.accent : alpha(T.accent, 0.28); /* paper */
  }

  const AN = (d) => ({ preset: 'fade', delay: d || 0, duration: 0.4, ease: 'ease-out', repeat: 1 });
  const box = (x, y, w, h, fill, extra) => ({ kind: 'image', decor: true, label: '', x: R1(x), y: R1(y), w: R1(w), h: R1(h), fill, anim: AN(0), ...(extra || {}) });
  /* 원 — d = 가로 % 지름, 세로는 비율 보정으로 시각 정원 */
  const circle = (R, cx, cy, d, fill, extra) => {
    const hy = R1(d * (R.w / R.h));
    return box(cx - d / 2, cy - hy / 2, d, hy, fill, { shape: 'ellipse', radius: 999, ...(extra || {}) });
  };

  /* ---------- 본체 ----------
     ctx = { role, bgKey, tokens, themeId, ratio:{w,h}, seq, variantIdx,
             mediaFrames:[{x,y,w,h,radius}], numFrame|null } */
  function decorate(ctx) {
    const T = ctx.tokens, R = ctx.ratio || { w: 1280, h: 720 };
    const bold = ctx.themeId === 'th-bold';
    const left = ctx.seq % 2 === 0; /* 홀짝 좌우 교대 — 결정적 */
    const out = [];
    const soft = tone(ctx.bgKey, T, 'soft'), solid = tone(ctx.bgKey, T, 'solid');
    const fullBleed = (ctx.mediaFrames || []).some((f) => f.w >= 99 && f.h >= 99);
    const hasMedia = (ctx.mediaFrames || []).length > 0;
    const role = ctx.role || '';

    /* 풀블리드 사진 — 뒤에 깔아 봐야 안 보인다. 정직하게 무장식. */
    if (fullBleed) return out;

    /* ① 표지류 (intro·title·call-to-action·outro·section — 미디어 없음) */
    const coverish = !hasMedia && /intro|title|outro|call-to-action|section|highlight/.test(role);
    if (coverish) {
      if (bold) {
        out.push(circle(R, left ? 86 : 14, 10, 34, soft));                  /* 큰 오프셋 원 */
        out.push(circle(R, left ? 8 : 92, 86, 7, solid));                   /* 작은 단색 원 */
        out.push(box(left ? 0 : 97.5, 0, 2.5, 100, solid));                 /* 두꺼운 사이드 바 */
      } else {
        out.push(box(8, 88, 84, 0.5, soft));                                /* 하단 헤어라인 */
        out.push(circle(R, left ? 7 : 90, 9, 1.6, solid));                  /* 코너 점 2개 */
        out.push(circle(R, left ? 10 : 93, 9, 1.6, soft));
        if (/highlight/.test(role)) out.push(circle(R, 50, 46, 44, alpha(T.accent, 0.1)));
      }
      return out;
    }

    /* ② 항목·카드류 (list-item·media-text — 번호·좌우 바) */
    if (/list-item|media-text/.test(role)) {
      if (bold) {
        out.push(box(0, 96.5, 100, 3.5, solid));                            /* 하단 두꺼운 바 */
        if (ctx.numFrame) out.push(circle(R, ctx.numFrame.x + 5, ctx.numFrame.y + 5, 10, solid)); /* 번호 배지 원 */
        else out.push(circle(R, left ? 90 : 10, 8, 12, soft));
      } else {
        out.push(box(left ? 0 : 98.8, 0, 1.2, 100, solid));                 /* 사이드 액센트 바 */
        if (ctx.numFrame) out.push(circle(R, ctx.numFrame.x + 4.5, ctx.numFrame.y + 4.5, 8, soft));
      }
      /* 프레임 사진 매트 — 폴라로이드식 */
      (ctx.mediaFrames || []).forEach((f) => {
        if (f.w >= 99 && f.h >= 99) return;
        if (bold) out.push(box(f.x + 1.6, f.y + 2.2, f.w, f.h, solid, f.radius ? { radius: f.radius } : {}));   /* 오프셋 블록 */
        else out.push(box(f.x - 1.2, f.y - 1.6, f.w + 2.4, f.h + 3.2, ctx.bgKey === 'paper' ? '#FFFFFF' : alpha(T.paper, 0.92), { radius: (f.radius || 0) + 2 })); /* 종이 매트 */
      });
      return out;
    }

    /* ③ 그 밖의 프레임 사진 장면 (media·comparison·highlight with media …) */
    (ctx.mediaFrames || []).forEach((f) => {
      if (f.w >= 99 && f.h >= 99) return;
      if (bold) out.push(box(f.x + 1.6, f.y + 2.2, f.w, f.h, solid, f.radius ? { radius: f.radius } : {}));
      else out.push(box(f.x - 1.2, f.y - 1.6, f.w + 2.4, f.h + 3.2, ctx.bgKey === 'paper' ? '#FFFFFF' : alpha(T.paper, 0.92), { radius: (f.radius || 0) + 2 }));
    });
    if (out.length) {
      if (bold) out.unshift(circle(R, left ? 90 : 10, 12, 16, soft));
      else out.unshift(box(8, 94, 84, 0.5, soft));
    }
    return out;
  }

  /* 자가 검증 */
  const audit = () => {
    const v = [];
    const T = { paper: '#F7F6F2', dark: '#1B2430', accent: '#2F6B54', ink: '#22302B', onDark: '#F5F7FA' };
    const R = { w: 1280, h: 720 };
    if (alpha('#2F6B54', 0.3) !== 'rgba(47,107,84,0.3)') v.push('alpha 위반');
    const fb = decorate({ role: 'media', bgKey: 'paper', tokens: T, themeId: 'th-minimal', ratio: R, seq: 0, mediaFrames: [{ x: 0, y: 0, w: 100, h: 100 }] });
    if (fb.length !== 0) v.push('풀블리드 무장식 위반');
    const cv = decorate({ role: 'intro', bgKey: 'dark', tokens: T, themeId: 'th-bold', ratio: R, seq: 0, mediaFrames: [] });
    if (!cv.length || !cv.every((e) => e.decor === true && e.fill)) v.push('표지 장식 위반');
    const ci = cv.find((e) => e.shape === 'ellipse');
    if (!ci || ci.radius !== 999) v.push('원 이중표기 위반');
    if (Math.abs(ci.h - ci.w * (R.w / R.h)) > 0.11) v.push('원 비율 보정 위반');
    const a = decorate({ role: 'intro', bgKey: 'paper', tokens: T, themeId: 'th-minimal', ratio: R, seq: 0, mediaFrames: [] });
    const b = decorate({ role: 'intro', bgKey: 'paper', tokens: T, themeId: 'th-minimal', ratio: R, seq: 0, mediaFrames: [] });
    if (JSON.stringify(a) !== JSON.stringify(b)) v.push('결정성 위반');
    const l = decorate({ role: 'list-item', bgKey: 'paper', tokens: T, themeId: 'th-minimal', ratio: R, seq: 1, numFrame: { x: 6, y: 6, w: 20 }, mediaFrames: [] });
    if (!l.some((e) => e.shape === 'ellipse')) v.push('번호 배지 위반');
    return { ok: !v.length, violations: v };
  };

  return { decorate, alpha, tone, audit };
})();
