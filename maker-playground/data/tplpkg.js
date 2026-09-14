/* ============================================================
   MK_TPLPKG — 「편집형 템플릿 패키지」(kedu.editable-template/1.0) 반입 (R154)
   ------------------------------------------------------------
   Work 에서 만든 패키지 폴더(template.json + metadata.json + preview.png +
   assets/vectors/…)를 케이메이커 템플릿으로 푼다. PNG 한 장이 아니라
   객체 하나하나가 기존 요소 스키마로 살아난다 — 새 렌더 엔진 0.

     type=text                → kind:'text'   (문구·글꼴·크기·색·정렬·자간·행간)
     type=shape (단색 rect)   → kind:'image' + fill      (svgpack 관례)
     type=shape (단색 ellipse)→ kind:'image' + fill + radius 999
     type=shape (선·투명 등)  → kind:'shape' (shape·fill·stroke·strokeWidth)
     role=photo-slot          → kind:'image' + role:'photo-slot' — 「사진 올리기」 그대로 통함.
                                 src 가 있으면 그 사진, 없으면 자리색(placeholder)
     type=vector (paths[])    → kind:'vector' + vec{vb, body, pfx} — R152 편집형
                                 벡터 조각(이동·크기·회전·색 스와치·순서·삭제)
     fallbackFor=<slot>       → 그 조각들은 하나의 그룹(scene.groups, R152 규약)으로 묶여
                                 통째 이동 ↔ 두 번 탭 내부 편집. 사진이 슬롯에 들어오면
                                 hideFallbacks() 가 visible:false 로 숨긴다(레이어 👁 로 복구).

   좌표: 패키지는 px(캔버스 좌상단 원점) → 요소는 %(x,y,w,h). 텍스트 size 는
   H 기준 %, letterSpacing 은 em(px/fontSize). rotation → rot(도).
   objects 배열 순서 = z(뒤→앞) 그대로 elements 순서.

   특정 패키지 종속 코드 0. 패키지를 늘릴 때는 assets/tplpkg/<dir>/ 에 폴더를
   얹고 `node tplpkg-build.mjs` — data/tplpkg-baked.js 가 재생성돼 Template Engine
   (MK_TPL.register)에 선다. 라이브러리 표시 메타는 metadata.json + (있으면)
   kmaker.json 사이드카에서 읽는다.
   ============================================================ */
window.MK_TPLPKG = (() => {
  'use strict';

  const SCHEMA = 'kedu.editable-template/1.0';
  const BASE = '/maker-playground/assets/tplpkg/';
  const r2 = (v) => Math.round(v * 100) / 100;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const solid = (v) => !!v && v !== 'none' && String(v).charAt(0) !== 'u';
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* 패키지 글꼴 → 케이메이커가 아는 글꼴. 사이드카 fontMap 이 우선, 없으면 기본표 */
  const FONT_MAP = { 'Noto Sans CJK KR': 'Noto Sans KR', 'Noto Sans CJK': 'Noto Sans KR', 'Noto Serif CJK KR': 'Gowun Batang', 'Pretendard Variable': 'Pretendard' };
  const mapFont = (fam, map) => (map && map[fam]) || FONT_MAP[fam] || fam;

  /* ---------------- 검증 ---------------- */
  function validate(pkg) {
    const v = [];
    if (!pkg || typeof pkg !== 'object') return { ok: false, violations: ['패키지가 없어요'] };
    if (pkg.schema !== SCHEMA) v.push('schema 불일치: ' + pkg.schema);
    if (!pkg.canvas || !(+pkg.canvas.width > 0) || !(+pkg.canvas.height > 0)) v.push('canvas 크기 없음');
    if (!Array.isArray(pkg.objects) || !pkg.objects.length) v.push('objects 없음');
    const ids = new Set();
    (pkg.objects || []).forEach((o, i) => {
      if (!o.id) v.push(`objects[${i}] id 없음`); else if (ids.has(o.id)) v.push('id 중복: ' + o.id); else ids.add(o.id);
      if (!['text', 'shape', 'vector', 'image'].includes(o.type)) v.push(`${o.id}: 모르는 type ${o.type}`);
      if (o.type === 'vector' && (!Array.isArray(o.paths) || !o.paths.length)) v.push(`${o.id}: paths 없음`);
      if (o.type === 'text' && typeof o.text !== 'string') v.push(`${o.id}: text 없음`);
      if (o.fallbackFor && !ids.has(o.fallbackFor) && !(pkg.objects || []).some((p) => p.id === o.fallbackFor)) v.push(`${o.id}: fallbackFor 대상 없음`);
    });
    return { ok: !v.length, violations: v };
  }

  /* ---------------- 객체 → 요소 ---------------- */
  function vecBody(o) {
    const parts = (o.paths || []).map((p) => {
      const a = [`d="${esc(p.d)}"`];
      a.push(`fill="${esc(solid(p.fill) ? p.fill : 'none')}"`);
      if (solid(p.stroke)) { a.push(`stroke="${esc(p.stroke)}"`); a.push(`stroke-width="${+p.strokeWidth || 1}"`); }
      if (p.strokeLinecap) a.push(`stroke-linecap="${esc(p.strokeLinecap)}"`);
      if (p.strokeLinejoin) a.push(`stroke-linejoin="${esc(p.strokeLinejoin)}"`);
      if (p.opacity != null && +p.opacity !== 1) a.push(`opacity="${+p.opacity}"`);
      return `<path ${a.join(' ')}/>`;
    });
    return `<g>${parts.join('')}</g>`;
  }

  function toElement(o, W, H, ctx) {
    const base = { x: r2(o.x / W * 100), y: r2(o.y / H * 100), w: r2(Math.max(0.05, (o.width || 0) / W * 100)), h: r2(Math.max(0.05, (o.height || 0) / H * 100)), label: o.name || o.id, aid: o.id };
    if (o.rotation) base.rot = +o.rotation;
    if (o.opacity != null && +o.opacity !== 1) base.opacity = +o.opacity;
    if (o.visible === false) base.visible = false;
    if (o.fallbackFor) { base.fallbackFor = o.fallbackFor; base.grp = ctx.grpOf(o.fallbackFor); }

    if (o.type === 'text') {
      const fs = +o.fontSize || 32;
      const el = { kind: 'text', ...base, text: String(o.text), size: r2(fs / H * 100), weight: +o.fontWeight || 400, color: o.fill || '#111111',
        align: o.textAlign || 'left', font: mapFont(o.fontFamily, ctx.fontMap) };
      if (o.letterSpacing) el.letterSpacing = r2(+o.letterSpacing / fs);
      if (o.lineHeight) el.lineHeight = +o.lineHeight;
      return el;
    }
    if (o.role === 'photo-slot' || o.type === 'image') {
      const el = { kind: 'image', ...base, role: 'photo-slot', fill: o.fill || '#EEEEEE', fit: o.fit || 'cover' };
      if (o.shape === 'ellipse') el.radius = 999;
      /* 기본 사진: 패키지 상대경로 → 패키지 폴더 절대 주소(/maker/ 와 /maker-playground/ 양쪽에서 같은 주소), data:·http 는 그대로 */
      if (o.src) el.src = /^(data:|https?:|\/)/.test(o.src) ? o.src : (ctx.dir ? BASE + ctx.dir + '/' + o.src : o.src);
      return el;
    }
    if (o.type === 'vector') {
      const vb = Array.isArray(o.viewBox) && o.viewBox.length === 4 ? o.viewBox.map(Number) : [0, 0, o.width || 100, o.height || 100];
      return { kind: 'vector', ...base, role: 'decor', vec: { vb, body: vecBody(o), defs: '', pfx: '' } };
    }
    /* shape */
    const hasStroke = solid(o.stroke) && (+o.strokeWidth || 0) > 0;
    if (!hasStroke && solid(o.fill)) {
      const el = { kind: 'image', ...base, fill: o.fill };
      if (o.shape === 'ellipse') el.radius = 999; else if (o.radius) el.radius = +o.radius;
      return el;
    }
    const el = { kind: 'shape', ...base, shape: o.shape === 'ellipse' ? 'ellipse' : 'rect', fill: solid(o.fill) ? o.fill : 'none' };
    if (hasStroke) { el.stroke = o.stroke; el.strokeWidth = +o.strokeWidth; }
    if (o.radius && el.shape === 'rect') el.radius = +o.radius;
    return el;
  }

  /* ---------------- 패키지 → 장면 ---------------- */
  function toScene(pkg, opts) {
    opts = opts || {};
    const W = +pkg.canvas.width, H = +pkg.canvas.height;
    const objs = (pkg.objects || []).slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    /* fallbackFor 가 같은 조각 = 그룹 하나 (슬롯 id 기준, 패키지 안에서 고정 이름) */
    const groups = {}, grpIds = {};
    const grpOf = (slot) => { if (!grpIds[slot]) { const g = 'g-' + slug(pkg.templateId || 'pkg') + '-' + slug(slot); grpIds[slot] = g; const so = objs.find((o) => o.id === slot); groups[g] = { name: '풍경 · ' + ((so && so.name) || slot).replace(/ ·.*$/, ''), aid: slot, kind: 'asset', fallbackFor: slot }; } return grpIds[slot]; };
    const ctx = { grpOf, fontMap: opts.fontMap, dir: opts.dir };
    const elements = objs.map((o) => toElement(o, W, H, ctx));
    /* 계약: 슬롯에 사진(src)이 있으면 그 슬롯을 대신하던 풍경 조각은 보존한 채 숨긴다(레이어 👁 로 복구) */
    elements.forEach((e) => { if (e.role === 'photo-slot' && e.src) hideFallbacks({ elements }, e); });
    /* 배경 = 캔버스 전체를 덮는 첫 단색 rect 가 있으면 그 색 (요소는 그대로 남긴다 — 편집 가능) */
    const bgObj = objs.find((o) => o.type === 'shape' && o.x <= 0 && o.y <= 0 && o.width >= W && o.height >= H && solid(o.fill));
    const scene = { id: opts.sceneId || 's1', name: opts.sceneName || pkg.name || '장면 1', width: W, height: H, duration: 5,
      background: bgObj ? bgObj.fill : (opts.background || '#FFFFFF'), transition: 'fade', order: 0, elements };
    if (Object.keys(groups).length) scene.groups = groups;
    return scene;
  }

  /* 메타(metadata.json + kmaker.json) → Template Engine 등록용 {src, ov} */
  function toTemplate(pkg, meta, side, opts) {
    meta = meta || {}; side = side || {}; opts = opts || {};
    const ratio = side.ratio || (pkg.canvas ? (function (w, h) { const g = (a, b) => (b ? g(b, a % b) : a); const d = g(w, h); const a = w / d, b = h / d; return (a <= 32 && b <= 32) ? `${a}:${b}` : r2(w / h) + ':1'; })(+pkg.canvas.width, +pkg.canvas.height) : '1:1');
    const id = 'pkg-' + slug(pkg.templateId || meta.templateId || opts.dir);
    const title = side.title || meta.name || pkg.name || opts.dir;
    const tags = side.tags || meta.tags || [];
    const src = {
      templateId: id, title, description: side.description || side.uses || meta.category || '',
      contentType: side.contentType || 'poster', category: side.category || '포스터', style: side.style || '모던', styleEn: side.styleEn || 'Premium',
      ratio, difficulty: side.difficulty || '보통', targetUser: side.targetUser || 'teacher', gradeRange: side.gradeRange || '전학년',
      uses: side.uses || '', tags, recent: false, pkg: { dir: opts.dir, schema: pkg.schema, version: pkg.version || meta.version || '', preview: opts.dir ? BASE + opts.dir + '/' + (meta.preview || 'preview.png') : null },
      scenes: [toScene(pkg, { fontMap: side.fontMap, dir: opts.dir })],
    };
    const ov = { styleId: side.styleId || 'st-modern', animationId: 'an-none', assetIds: [],
      ai: { recommended: side.recommended !== false, tags, hints: side.hints || [] } };
    return { src, ov };
  }

  /* ---------------- 사진 슬롯 ↔ 풍경(fallback) ---------------- */
  /* 슬롯 요소에 사진이 들어왔을 때: 그 슬롯을 대신하던 조각을 숨긴다. 돌아온 값 = 숨긴 수 */
  function hideFallbacks(scene, slotEl) {
    if (!scene || !slotEl || slotEl.role !== 'photo-slot' || !slotEl.aid) return 0;
    let n = 0;
    (scene.elements || []).forEach((e) => { if (e && e.fallbackFor === slotEl.aid && e.visible !== false) { e.visible = false; n++; } });
    return n;
  }
  function showFallbacks(scene, slotEl) {
    if (!scene || !slotEl || !slotEl.aid) return 0;
    let n = 0;
    (scene.elements || []).forEach((e) => { if (e && e.fallbackFor === slotEl.aid && e.visible === false) { delete e.visible; n++; } });
    return n;
  }

  /* 런타임 반입(파일 고르기 등) — 패키지 JSON 문자열을 문서에 앉힌다 */
  function applyTo(doc, si, pkgJson, meta, side) {
    let pkg; try { pkg = typeof pkgJson === 'string' ? JSON.parse(pkgJson) : pkgJson; } catch (e) { return { ok: false, msg: 'JSON 을 읽을 수 없어요' }; }
    const v = validate(pkg); if (!v.ok) return { ok: false, msg: v.violations[0], violations: v.violations };
    const s = doc && doc.scenes && doc.scenes[si]; if (!s) return { ok: false, msg: '장면이 없어요' };
    const sc = toScene(pkg, { sceneId: s.id, fontMap: side && side.fontMap });
    Object.assign(s, { width: sc.width, height: sc.height, background: sc.background, elements: sc.elements, groups: sc.groups || undefined });
    if (!sc.groups) delete s.groups;
    return { ok: true, count: sc.elements.length };
  }

  /* 등록 목록(굳힌 파일이 채운다) */
  const REGISTERED = [];
  function register(src, ov) {
    if (window.MK_TPL && window.MK_TPL.register) { try { window.MK_TPL.register(src, ov); } catch (_) { return false; } }
    REGISTERED.push(src.templateId);
    return true;
  }

  return { SCHEMA, BASE, FONT_MAP, validate, toScene, toTemplate, toElement, vecBody, hideFallbacks, showFallbacks, applyTo, register, REGISTERED };
})();
