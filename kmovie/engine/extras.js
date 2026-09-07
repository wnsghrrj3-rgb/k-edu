/* ============================================================
   케이무비 부가 도구 (KMV_EXTRAS) — 51단계 (2026-09-07)
   ------------------------------------------------------------
   1. 뼈대 템플릿 — 「학교 소개」「행사 스케치」「학급 영상」: 지금 타임라인 길이에 맞춰 오프닝·챕터·하단 자막·엔딩 카드를 깐다.
      다시 고르면 앞서 깐 템플릿 카드(tpl 표시)만 걷어내고 다시 — 손으로 넣은 카드는 그대로.
   2. 사진 묶어 넣기 — 타임라인의 사진 클립들을 켄 번즈 4종 순환 + 길이 맞춤(박자 있으면 박자 배수) + 디졸브.
   3. 로고 워터마크 — 프로젝트 logo {media(사진), pos, size, opacity}; render.compose 가 자막 앞에 그린다.
   4. 내보내기 옆 — 자막 SRT · 유튜브 챕터 텍스트(마커) · 썸네일 PNG(플레이헤드 프레임, 원본 해상도).
   전부 순수 함수 + 프로젝트 API — DOM 은 kmovie.js.
   ============================================================ */
(function (g) {
  'use strict';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  function P() { return g.KMV_PROJECT; }

  /* ---------- 1. 뼈대 템플릿 ---------- */
  const TEMPLATES = [
    { id: 'school', name: '학교 소개', desc: '오프닝 → 하단 이름 자막 → 챕터 둘 → 엔딩 크레딧. 차분한 네이비.',
      lut: 'cinema-navy', mood: 'calm',
      cards: T => [
        { part: 'opening', at: 0 },
        { part: 'lower3rd', at: 7, dur: 5 },
        { part: 'chapter', at: T * 0.34 },
        { part: 'chapter', at: T * 0.67 },
        { part: 'vfxVignette', at: 0, dur: T, p: { amt: 'soft', shape: 'wide' } },
        { part: 'credits', at: T - 8 },
      ] },
    { id: 'event', name: '행사 스케치', desc: '섹션 타이틀 → 태그 → 광누출 둘 → 엔딩. 밝고 빠르게.',
      lut: 'warm-memory', mood: 'bright',
      cards: T => [
        { part: 'section', at: 0 },
        { part: 'tag', at: 3, dur: 5 },
        { part: 'lightleak', at: T * 0.4 },
        { part: 'vfxFlare', at: T * 0.4, dur: 6, p: { amt: 'soft', tone: 'warm' } },
        { part: 'lightleak', at: T * 0.72 },
        { part: 'credits', at: T - 7 },
      ] },
    { id: 'class', name: '학급 영상', desc: '말풍선 → 리본 자막 → 벚꽃 → 엔딩. 아이들 영상에.',
      lut: 'warm-memory', mood: 'warm',
      cards: T => [
        { part: 'bubble', at: 0.5 },
        { part: 'vfxParticles', at: 0, dur: 8, p: { amt: 'soft', kind: 'petal' } },
        { part: 'ribbon', at: T * 0.3, dur: 5 },
        { part: 'headline', at: T * 0.62, dur: 5 },
        { part: 'credits', at: T - 7 },
      ] },
  ];
  function template(id) { return TEMPLATES.find(t => t.id === id) || null; }
  /* 적용 — {added, removed} 또는 null(타임라인 비어 있음) */
  function applyTemplate(id) {
    const p = P(), tp = template(id), FPS = p.FPS, T = p.total() / FPS; if (!tp || T <= 0) return null;
    const D = p.data, old = (D.P || []).filter(x => x.tpl);
    old.forEach(x => p.removeP(x.id));
    const K = g.KM_PARTS, added = [];
    for (const c of tp.cards(T)) {
      if (!K || !K.get(c.part)) continue;
      const at = clamp(Math.round(c.at * FPS), 0, Math.max(0, p.total() - 1));
      const dur = c.dur ? Math.round(c.dur * FPS) : undefined;
      const card = { part: c.part, at, tpl: id, p: c.p || {} }; if (dur) card.dur = Math.min(dur, p.total() - at);
      const x = p.addP(card); if (x) added.push(x);
    }
    if (tp.lut && D.look) p.setProjectLook({ lut: tp.lut });
    if (D.audio && D.audio.sfx && !D.audio.sfx.on) p.setSfx({ on: true });
    return { added, removed: old.length, template: tp };
  }

  /* ---------- 2. 사진 묶어 넣기 ---------- */
  const KB_CYCLE = ['push', 'panL', 'pull', 'panR'];
  /* clipIds 가 없으면 타임라인의 사진 클립 전부. beats(절대 프레임 배열) 가 있으면 사진 길이를 박자 간격의 배수(≥2.4초)로. */
  function photoSlideshow(opt) {
    opt = opt || {};
    const p = P(), FPS = p.FPS, D = p.data;
    const ids = opt.clipIds || D.V.filter(c => !c.gap && p.media(c.media) && p.media(c.media).kind === 'image').map(c => c.id);
    if (!ids.length) return null;
    let per = Math.round((opt.seconds || 3.5) * FPS);
    const beats = opt.beats;
    if (beats && beats.length > 2) { const iv = beats[1] - beats[0]; if (iv > 0) { per = iv * Math.max(1, Math.ceil(2.4 * FPS / iv)); } }
    let i = 0;
    for (const id of ids) {
      const c = p.clip(id); if (!c) continue;
      p.trim(id, 'out', per);
      p.setKenburns(id, KB_CYCLE[i % KB_CYCLE.length]);
      const idx = p.clipIndex(id);
      if (idx > 0 && !(opt.noTransition)) p.setTransition(id, { type: 'dissolve', dur: 'normal' });
      i++;
    }
    return { count: i, per };
  }

  /* ---------- 3. 로고 워터마크 ---------- */
  const LOGO_SIZE = { sm: 0.09, md: 0.13, lg: 0.18 };
  function drawLogo(ctx, W, H) {
    const p = P(), L = p.data.logo; if (!L || !L.media) return;
    const src = g.KMV_MEDIA && g.KMV_MEDIA.get(L.media); const bmp = src && (src.bmp || (src.cached && src.cached(0)) || (src.nearest && src.nearest(0))); if (!bmp) return;
    const bw = bmp.width, bh = bmp.height; if (!bw || !bh) return;
    const short = Math.min(W, H), w = short * (LOGO_SIZE[L.size] || LOGO_SIZE.sm) * (bw >= bh ? Math.min(2.2, bw / bh) : 1), h = w * bh / bw;
    const mg = short * 0.04, x = /l$/.test(L.pos) ? mg : W - mg - w, y = /^t/.test(L.pos) ? mg : H - mg - h;
    ctx.save(); ctx.globalAlpha = clamp(L.opacity == null ? 0.85 : L.opacity, 0.05, 1);
    ctx.drawImage(bmp, x, y, w, h);
    ctx.restore();
  }

  /* ---------- 4. 내보내기 옆 ---------- */
  function tcSrt(f, FPS) { const ms = Math.round(f / FPS * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, r = ms % 1000; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ',' + String(r).padStart(3, '0'); }
  function srt() {
    const p = P(), FPS = p.FPS, S = (p.data.S || []).filter(s => s.text && String(s.text).trim()).slice().sort((a, b) => a.at - b.at);
    return S.map((s, i) => (i + 1) + '\n' + tcSrt(s.at, FPS) + ' --> ' + tcSrt(s.at + s.dur, FPS) + '\n' + String(s.text).trim() + '\n').join('\n');
  }
  function tcMin(f, FPS) { const sec = Math.floor(f / FPS), h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0'); }
  /* 유튜브 챕터: 첫 줄은 반드시 0:00 — 마커가 0 에 없으면 「시작」을 넣는다 */
  function chapters() {
    const p = P(), FPS = p.FPS, M = (p.data.markers || []).slice().sort((a, b) => a.at - b.at);
    const lines = M.map((m, i) => tcMin(m.at, FPS) + ' ' + (m.text && m.text.trim() ? m.text.trim() : '챕터 ' + (i + 1)));
    if (!M.length || M[0].at > 0) lines.unshift('0:00 시작');
    return lines.join('\n');
  }
  async function thumbnail(t) {
    const p = P(), W = p.w(), H = p.h();
    const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    const ctx = cv.getContext('2d');
    await g.KMV_RENDER.drawExact(ctx, W, H, t);
    const blob = cv.convertToBlob ? await cv.convertToBlob({ type: 'image/png' }) : await new Promise(r => cv.toBlob(r, 'image/png'));
    return blob;
  }
  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  g.KMV_EXTRAS = { TEMPLATES, template, applyTemplate, photoSlideshow, KB_CYCLE, LOGO_SIZE, drawLogo, srt, chapters, thumbnail, download, tcSrt, tcMin };
})(typeof window !== 'undefined' ? window : globalThis);
