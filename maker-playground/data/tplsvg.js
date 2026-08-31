/* ============================================================
   MK_TPLSVG — SVG 템플릿을 「편집 가능한 요소」로 푸는 파서
   ------------------------------------------------------------
   목표(준호 지시서): SVG 를 이미지 한 장으로 붙이지 않는다. 텍스트·
   도형을 케이메이커 기존 요소 스키마로 풀어, 적용 뒤엔 평소 요소처럼
   선택·이동·크기·회전·복제·삭제·층변경이 된다. 새 렌더 엔진은 만들지
   않는다 — 나오는 것은 전부 kind:'text' / kind:'image' 뿐이다.

   푸는 규칙 (범용 — 특정 템플릿에 종속되지 않는다)
     text                        → kind:'text'
     rect(단색 fill, stroke 없음) → kind:'image' + fill (+radius)
     circle·ellipse(단색)        → 같은 요소 + radius 999 (border-radius 50%)
     그 밖(path·line·stroke 전용·그라디언트·filter·미지 노드)
                                 → 그 노드만 담은 조각 SVG 를 dataURL 로
                                    구워 kind:'image' + src. 색은 못 바꾸지만
                                    이동·크기·회전·투명도·복제·삭제는 된다.

   왜 조각을 굽나: 요소 스키마에 선·곡선·그라디언트·테두리를 담을 자리가
   없다. 통째로 한 장 굽는 것(=지시서가 금한 것)과 전부 포기하는 것 사이의
   실제 해다 — 편집 단위가 노드별로 남는다.

   bbox 는 브라우저 getBBox 에 기대지 않고 기하로 직접 잰다. 그래야
   jsdom 만으로도 같은 결과가 나와 기계검증이 선다.
   ============================================================ */
window.MK_TPLSVG = (() => {
  'use strict';

  const BASE = '/maker-playground/assets/templates/';

  /* templates.json 을 옮긴 카탈로그 + Template Engine 등록에 필요한 메타.
     팩을 늘릴 때는 여기 한 줄 + SVG 파일 + `node tplpack-build.mjs`. */
  const CATALOG = [
    { id: 'editorial-poster-01', name: 'Editorial Ideas Matter', ko: '에디토리얼 포스터', category: 'poster', width: 1080, height: 1350, pack: 'pack01', file: '01_editorial_poster.svg',
      contentType: 'poster', style: '페이퍼', styleId: 'st-paper', styleEn: 'Editorial', ratio: '4:5', difficulty: '보통', rec: true,
      desc: '여백과 타이포로 미는 잡지식 포스터', uses: '전시 안내·행사 포스터·학급 게시물', tags: ['포스터', '타이포', '잡지'], hints: ['제목 두 줄을 넘기지 말 것', '아래 문장은 한 문장으로'] },
    { id: 'neon-event-01', name: 'Neon Creative Night', ko: '네온 행사 포스터', category: 'event', width: 1080, height: 1350, pack: 'pack01', file: '02_neon_event.svg',
      contentType: 'poster', style: '볼드', styleId: 'st-bold', styleEn: 'Neon', ratio: '4:5', difficulty: '보통', rec: true,
      desc: '어두운 바탕에 네온으로 시선을 끄는 행사 포스터', uses: '학예회·동아리 발표·저녁 행사', tags: ['행사', '네온', '포스터'], hints: ['글자 수 적을수록 산다', '버튼 문구는 두 단어'] },
    { id: 'kids-science-01', name: 'Kids Science Day', ko: '어린이 과학의 날', category: 'education', width: 1080, height: 1350, pack: 'pack01', file: '03_kids_science.svg',
      contentType: 'poster', style: '에듀', styleId: 'st-edu', styleEn: 'Kids', ratio: '4:5', difficulty: '쉬움', rec: true,
      desc: '질문 한 줄을 크게 세우는 수업·과학 안내', uses: '과학의 날·수업 안내·복도 게시', tags: ['교육', '과학', '어린이'], hints: ['질문형 제목이 잘 맞는다', '설명은 두 줄까지'] },
    { id: 'luxury-product-01', name: 'Signature Collection', ko: '시그니처 컬렉션', category: 'promotion', width: 1080, height: 1350, pack: 'pack01', file: '04_luxury_product.svg',
      contentType: 'poster', style: '모던', styleId: 'st-modern', styleEn: 'Luxury', ratio: '4:5', difficulty: '보통', rec: false,
      desc: '검정·금색으로 하나만 보여 주는 소개면', uses: '작품 소개·전시 대표작·홍보물', tags: ['홍보', '미니멀', '소개'], hints: ['가운데 하나만 남길 것', '설명은 짧게'] },
    { id: 'collage-social-01', name: 'Weekend City Mood', ko: '콜라주 소셜', category: 'social', width: 1080, height: 1080, pack: 'pack01', file: '05_collage_social.svg',
      contentType: 'sns', style: '소프트', styleId: 'st-soft', styleEn: 'Collage', ratio: '1:1', difficulty: '쉬움', rec: true,
      desc: '색 카드를 기울여 겹친 정사각 게시물', uses: '학급 SNS·소식 카드·모집 공지', tags: ['SNS', '콜라주', '카드'], hints: ['카드 색만 바꿔도 분위기가 산다'] },
  ];

  const CATS = [['', '전체'], ['poster', '포스터'], ['event', '행사'], ['education', '교육'], ['promotion', '홍보'], ['social', '소셜']];

  const get = (id) => CATALOG.find((t) => t.id === id) || null;
  const urlOf = (id) => { const t = get(id); return t ? BASE + t.pack + '/' + t.file : null; };
  const list = (cat) => (cat ? CATALOG.filter((t) => t.category === cat) : CATALOG.slice());

  /* ---------------- 작은 도구 ---------------- */
  const num = (v, d) => { const n = parseFloat(v); return isFinite(n) ? n : (d || 0); };
  const attr = (n, k) => (n.getAttribute ? n.getAttribute(k) : null);
  const solid = (v) => !!v && v !== 'none' && v.charAt(0) !== 'u';   /* url(#..) 배제 */
  const r2 = (v) => Math.round(v * 100) / 100;

  /* transform="translate(a b)" 만 좌표로 흡수한다. rotate 는 요소 rot 으로
     넘기고(중심 회전), 그 밖(scale·matrix·skew)은 조각으로 굽는다. */
  function readTransform(str) {
    if (!str) return { tx: 0, ty: 0, rot: 0, plain: true };
    let tx = 0, ty = 0, rot = 0, plain = true;
    const re = /(translate|rotate|scale|matrix|skewX|skewY)\s*\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(str))) {
      const a = m[2].trim().split(/[\s,]+/).map(Number);
      if (m[1] === 'translate') { tx += a[0] || 0; ty += (a.length > 1 ? a[1] : 0) || 0; }
      else if (m[1] === 'rotate') { rot += a[0] || 0; }
      else plain = false;
    }
    return { tx, ty, rot, plain };
  }

  /* ---------------- 기하 bbox (getBBox 비의존) ---------------- */
  function bboxOf(n, vb) {
    const tag = (n.tagName || '').toLowerCase();
    const sw = num(attr(n, 'stroke-width'), 0) / 2;
    if (tag === 'rect') return { x: num(attr(n, 'x')) - sw, y: num(attr(n, 'y')) - sw, w: num(attr(n, 'width')) + sw * 2, h: num(attr(n, 'height')) + sw * 2 };
    if (tag === 'circle') { const r = num(attr(n, 'r')) + sw; return { x: num(attr(n, 'cx')) - r, y: num(attr(n, 'cy')) - r, w: r * 2, h: r * 2 }; }
    if (tag === 'ellipse') { const rx = num(attr(n, 'rx')) + sw, ry = num(attr(n, 'ry')) + sw; return { x: num(attr(n, 'cx')) - rx, y: num(attr(n, 'cy')) - ry, w: rx * 2, h: ry * 2 }; }
    if (tag === 'line') {
      const x1 = num(attr(n, 'x1')), y1 = num(attr(n, 'y1')), x2 = num(attr(n, 'x2')), y2 = num(attr(n, 'y2'));
      return { x: Math.min(x1, x2) - sw - 1, y: Math.min(y1, y2) - sw - 1, w: Math.abs(x2 - x1) + sw * 2 + 2, h: Math.abs(y2 - y1) + sw * 2 + 2 };
    }
    if (tag === 'path') {
      const d = attr(n, 'd') || '';
      /* 상대 커맨드가 섞이면 좌표 누적이 필요해 근사가 깨진다 — 안전하게 전체 */
      if (/[mlhvcsqtaz]/.test(d.replace(/[MLHVCSQTAZ]/g, ''))) return { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
      const ns = (d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
      if (ns.length < 2) return { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i + 1 < ns.length; i += 2) {
        x0 = Math.min(x0, ns[i]); x1 = Math.max(x1, ns[i]);
        y0 = Math.min(y0, ns[i + 1]); y1 = Math.max(y1, ns[i + 1]);
      }
      return { x: x0 - sw, y: y0 - sw, w: (x1 - x0) + sw * 2, h: (y1 - y0) + sw * 2 };
    }
    if (tag === 'g') {
      const t = readTransform(attr(n, 'transform'));
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, any = false;
      each(n, (c) => {
        const b = bboxOf(c, vb); if (!b || !isFinite(b.w)) return;
        any = true;
        x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
        x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
      });
      if (!any) return { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
      return { x: x0 + t.tx, y: y0 + t.ty, w: x1 - x0, h: y1 - y0 };
    }
    return { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
  }

  const each = (n, fn) => {
    const ch = n.childNodes || [];
    for (let i = 0; i < ch.length; i++) if (ch[i].nodeType === 1) fn(ch[i]);
  };

  /* ---------------- 글자폭 어림 (중앙·우측 정렬 상자 잡기) ---------------- */
  function textWidthPx(s, fs, tracking) {
    let u = 0;
    for (const c of String(s)) {
      if (/[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3\u4E00-\u9FFF]/.test(c)) u += 1.0;
      else if (/[A-Z0-9@#%&]/.test(c)) u += 0.68;
      else if (/[ilj.,'"!|]/.test(c)) u += 0.28;
      else u += 0.53;
    }
    return u * fs + (tracking || 0) * Math.max(0, String(s).length - 1);
  }

  /* ---------------- 노드 → 요소 ---------------- */
  function textEl(n, W, H, off) {
    const raw = (n.textContent || '').replace(/\s+/g, ' ').trim();
    if (!raw) return null;
    const fs = num(attr(n, 'font-size'), 32);
    const ls = num(attr(n, 'letter-spacing'), 0);
    const anchor = attr(n, 'text-anchor') || 'start';
    const x = num(attr(n, 'x')) + off.tx, y = num(attr(n, 'y')) + off.ty;
    /* SVG 의 y 는 베이스라인 — 요소의 y 는 상자 위끝이다. ascent 를 걷어낸다. */
    const top = (y - fs * 0.82) / H * 100;
    const wpx = textWidthPx(raw, fs, ls) * 1.12 + 6;
    const wpc = Math.min(98, wpx / W * 100);
    let bx, align;
    if (anchor === 'middle') { bx = x / W * 100 - wpc / 2; align = 'center'; }
    else if (anchor === 'end') { bx = x / W * 100 - wpc; align = 'right'; }
    else { bx = x / W * 100; align = null; }
    const el = {
      kind: 'text', x: r2(Math.max(-2, bx)), y: r2(top), w: r2(wpc),
      size: r2(fs / H * 100), text: raw, weight: num(attr(n, 'font-weight'), 400) || 400,
    };
    const fill = attr(n, 'fill'); if (solid(fill)) el.color = fill;
    if (align) el.align = align;
    if (ls) el.tracking = r2(ls / fs);
    const t = readTransform(attr(n, 'transform')); if (t.rot) el.rot = r2(t.rot);
    return el;
  }

  function boxEl(n, W, H, off, label) {
    const tag = (n.tagName || '').toLowerCase();
    let x, y, w, h, round = 0;
    if (tag === 'rect') {
      x = num(attr(n, 'x')); y = num(attr(n, 'y'));
      w = num(attr(n, 'width')); h = num(attr(n, 'height'));
      round = num(attr(n, 'rx'), num(attr(n, 'ry'), 0));
    } else if (tag === 'circle') {
      const r = num(attr(n, 'r')); x = num(attr(n, 'cx')) - r; y = num(attr(n, 'cy')) - r; w = r * 2; h = r * 2; round = 999;
    } else {
      const rx = num(attr(n, 'rx')), ry = num(attr(n, 'ry'));
      x = num(attr(n, 'cx')) - rx; y = num(attr(n, 'cy')) - ry; w = rx * 2; h = ry * 2; round = 999;
    }
    if (!(w > 0 && h > 0)) return null;
    const el = {
      kind: 'image', label: label || '', fill: attr(n, 'fill'),
      x: r2((x + off.tx) / W * 100), y: r2((y + off.ty) / H * 100),
      w: r2(w / W * 100), h: r2(h / H * 100),
    };
    /* 모서리: 반지름이 짧은 변의 절반에 닿으면 알약·원이다 */
    if (round >= Math.min(w, h) / 2 - 0.5) el.radius = 999;
    else if (round > 0) el.radius = Math.round(round);
    const op = attr(n, 'opacity'); if (op != null && num(op, 1) < 1) el.opacity = num(op, 1);
    const t = readTransform(attr(n, 'transform')); if (t.rot) el.rot = r2(t.rot);
    return el;
  }

  function fragEl(n, W, H, off, vb, defs, ser) {
    const b = bboxOf(n, vb);
    if (!isFinite(b.w) || b.w <= 0 || b.h <= 0) return null;
    const pad = 2;
    const bx = b.x - pad, by = b.y - pad, bw = b.w + pad * 2, bh = b.h + pad * 2;
    const body = ser(n);
    if (!body) return null;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(bx)} ${r2(by)} ${r2(bw)} ${r2(bh)}" width="${r2(bw)}" height="${r2(bh)}">${defs}${body}</svg>`;
    return {
      kind: 'image', label: (n.tagName || 'shape'), fit: 'contain',
      src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
      x: r2((bx + off.tx) / W * 100), y: r2((by + off.ty) / H * 100),
      w: r2(bw / W * 100), h: r2(bh / H * 100),
    };
  }

  /* ---------------- 본체 ---------------- */
  function parse(svgText, opts) {
    opts = opts || {};
    const DP = opts.DOMParser || (typeof DOMParser !== 'undefined' ? DOMParser : null);
    const XS = opts.XMLSerializer || (typeof XMLSerializer !== 'undefined' ? XMLSerializer : null);
    if (!DP || !XS) return { ok: false, msg: 'SVG 파서를 쓸 수 없는 환경' };
    const doc = new DP().parseFromString(String(svgText), 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || /parsererror/i.test(root.tagName || '')) return { ok: false, msg: 'SVG 를 읽을 수 없어요' };
    const serOne = (n) => { try { return new XS().serializeToString(n); } catch (_) { return ''; } };

    const vbAttr = (attr(root, 'viewBox') || '').trim().split(/[\s,]+/).map(Number);
    const W = vbAttr.length === 4 && vbAttr[2] > 0 ? vbAttr[2] : num(attr(root, 'width'), 1080);
    const H = vbAttr.length === 4 && vbAttr[3] > 0 ? vbAttr[3] : num(attr(root, 'height'), 1080);
    const vb = { x: vbAttr[0] || 0, y: vbAttr[1] || 0, w: W, h: H };

    /* defs 는 조각마다 통째로 딸려 보낸다 — 그라디언트·필터 참조가 살아야 한다 */
    let defs = '';
    each(root, (n) => { if ((n.tagName || '').toLowerCase() === 'defs') defs += serOne(n); });

    /* 그라디언트 대표색 — 요소 스키마엔 그라디언트 자리가 없다. 조각으로 굽는
       도형은 원본 그대로 살지만, 글자색과 씬 배경색은 단색 하나로 정해야 한다.
       (씬 배경색이 틀리면 렌더러의 명암 판정이 뒤집혀 글자가 배경에 묻힌다.) */
    const GRAD = {};
    const collectGrad = (n) => each(n, (c) => {
      const tg = (c.tagName || '').toLowerCase();
      if (tg === 'lineargradient' || tg === 'radialgradient') {
        const id = attr(c, 'id'); const stops = [];
        each(c, (st) => { const col = attr(st, 'stop-color'); if (col) stops.push(col); });
        if (id && stops.length) GRAD[id] = { first: stops[0], mid: stops[Math.floor(stops.length / 2)] };
      } else collectGrad(c);
    });
    collectGrad(root);
    const gradOf = (v) => { const m = /^url\(#([^)]+)\)/.exec(String(v || '')); return m ? GRAD[m[1]] : null; };

    const elements = [];
    const notes = [];
    let background = null;

    const walk = (parent, off) => {
      each(parent, (n) => {
        const tag = (n.tagName || '').toLowerCase();
        if (tag === 'defs' || tag === 'title' || tag === 'desc' || tag === 'style' || tag === 'metadata') return;
        const t = readTransform(attr(n, 'transform'));
        const fill = attr(n, 'fill');
        const stroke = attr(n, 'stroke');
        const filt = attr(n, 'filter');

        if (tag === 'g') {
          /* translate·rotate 없는 순수 묶음이면 파고들어 자식을 개별 요소로 남긴다 */
          if (t.plain && !t.rot) return walk(n, { tx: off.tx + t.tx, ty: off.ty + t.ty });
          const f = fragEl(n, W, H, off, vb, defs, serOne);
          if (f) { elements.push(f); notes.push('묶음(g) 은 조각으로 — 회전·변형이 걸려 있어요'); }
          return;
        }

        if (tag === 'text') {
          const el = textEl(n, W, H, off);
          if (el) elements.push(el);
          if (attr(n, 'font-style') === 'italic') notes.push('기울임(italic)은 요소에 자리가 없어 곧게 들어가요');
          const gt = gradOf(fill);
          if (el && gt) { el.color = gt.mid; notes.push('그라디언트 글자는 대표 단색으로 들어가요'); }
          return;
        }

        const shapeish = tag === 'rect' || tag === 'circle' || tag === 'ellipse';
        const simple = shapeish && solid(fill) && !stroke && !filt && t.plain;

        const covers = tag === 'rect'
          && num(attr(n, 'x')) + off.tx <= vb.x + 0.5 && num(attr(n, 'y')) + off.ty <= vb.y + 0.5
          && num(attr(n, 'width')) >= W - 0.5 && num(attr(n, 'height')) >= H - 0.5;
        /* 화면을 덮는 그라디언트 판 — 조각으로는 남기되(진짜 그라디언트가 보인다)
           씬 배경색도 대표색으로 잡는다. 안 그러면 흰색으로 남아 명암 판정이 뒤집힌다. */
        if (covers && background == null) {
          const gb = gradOf(fill);
          if (gb) background = gb.first;
        }

        if (simple) {
          /* 화면 전체를 덮는 첫 단색 사각형 = 배경 (요소로 둘 필요가 없다) */
          if (background == null && covers) { background = fill; return; }
          const el = boxEl(n, W, H, off, '');
          if (el) elements.push(el);
          return;
        }

        const f = fragEl(n, W, H, off, vb, defs, serOne);
        if (f) {
          elements.push(f);
          if (shapeish) notes.push('테두리·그라디언트 도형은 조각으로 — 색은 못 바꿔요');
          else notes.push(tag + ' 는 조각으로 — 이동·크기·회전은 됩니다');
        }
      });
    };
    walk(root, { tx: 0, ty: 0 });

    return {
      ok: true, width: W, height: H, background: background || '#FFFFFF',
      elements, notes: notes.filter((v, i, a) => a.indexOf(v) === i),
      native: elements.filter((e) => !e.src).length, frags: elements.filter((e) => !!e.src).length,
    };
  }

  /* ---------------- 불러오기 (캐시) ---------------- */
  const CACHE = {};
  function load(id, cb) {
    if (CACHE[id]) return cb(CACHE[id]);
    /* 굳힌 팩(tplpack01.js)이 있으면 즉시 — 파싱은 빌드 때 이미 끝났다 */
    const baked = window.MK_TPLPACK && window.MK_TPLPACK[id];
    if (baked) { CACHE[id] = { ok: true, ...baked }; return cb(CACHE[id]); }
    const url = urlOf(id);
    if (!url || typeof fetch !== 'function') return cb({ ok: false, msg: '템플릿을 찾을 수 없어요' });
    fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error('http ' + r.status))))
      .then((txt) => { const p = parse(txt); CACHE[id] = p; cb(p); })
      .catch(() => cb({ ok: false, msg: '템플릿을 불러오지 못했어요' }));
  }

  /* ---------------- 씬에 앉히기 ---------------- */
  function applyTo(doc, si, parsed, meta) {
    const s = doc && doc.scenes && doc.scenes[si];
    if (!s) return { ok: false, msg: '장면이 없어요' };
    if (!parsed || !parsed.ok) return { ok: false, msg: (parsed && parsed.msg) || '템플릿을 읽지 못했어요' };
    s.width = parsed.width; s.height = parsed.height;
    s.background = parsed.background;
    s.elements = JSON.parse(JSON.stringify(parsed.elements));
    if (meta && meta.ko) s.name = meta.ko;
    return { ok: true, count: s.elements.length, msg: `템플릿 적용 — 요소 ${s.elements.length}개` };
  }

  /* ---------------- 기계검증 ---------------- */
  function audit(svgText, opts) {
    const p = parse(svgText, opts);
    const v = [];
    if (!p.ok) return { ok: false, violations: ['파싱 실패: ' + p.msg] };
    if (!p.elements.length) v.push('요소 0개');
    p.elements.forEach((e, i) => {
      if (e.kind !== 'text' && e.kind !== 'image') v.push(i + ':알 수 없는 kind');
      ['x', 'y', 'w'].forEach((k) => { if (typeof e[k] !== 'number' || !isFinite(e[k])) v.push(i + ':' + k); });
      if (e.kind === 'text' && (!e.text || !(e.size > 0))) v.push(i + ':빈 텍스트');
      if (e.kind === 'image' && !e.src && !solid(e.fill)) v.push(i + ':칠도 그림도 없음');
      if (e.kind === 'image' && !(e.h > 0)) v.push(i + ':높이');
      if (e.x < -10 || e.y < -10 || e.x > 105 || e.y > 105) v.push(i + ':화면 밖');
    });
    /* 같은 입력 = 같은 결과 */
    const again = parse(svgText, opts);
    if (JSON.stringify(again.elements) !== JSON.stringify(p.elements)) v.push('비결정적');
    return { ok: !v.length, violations: v, native: p.native, frags: p.frags, count: p.elements.length };
  }

  return { CATALOG, CATS, BASE, get, urlOf, list, parse, load, applyTo, audit };
})();
