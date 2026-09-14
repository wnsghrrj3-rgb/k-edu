/* ============================================================
   MK_SVGASSET — K-Maker Editable Asset Engine v1 (R150)
   ------------------------------------------------------------
   준호 지시서(2026-09-14): SVG 를 「이미지 한 장」으로 붙이지 않는다.
   SVG 내부의 <g>·<path>·<rect>… 구조를 읽어 케이메이커의 **독립 편집
   객체**로 풀어 낸다. 크리스마스 프레임 하나가 아니라, 앞으로 AI 가
   만드는 수천 개의 편집형 에셋이 같은 문으로 들어오는 기반이다.

   설계 원칙
   · 새 렌더 엔진 0 — 나오는 것은 기존 요소 스키마(kind·x·y·w·h·rot·
     opacity, % 좌표)에 kind:'vector' 하나가 더해진 것뿐이다.
     vector 요소 = { vec:{ vb:[x,y,w,h], body, defs, pfx }, paint:{orig:new},
                    grp, label, role, aid }
     vb = 이 조각이 차지하는 원본 좌표계 영역(bbox). body 는 그 조각의
     SVG 마크업 그대로(transform·fill-rule·gradient·clipPath 보존).
     화면·재생·내보내기는 <svg viewBox=vb preserveAspectRatio="none">
     로 감싸 그린다 — 비균일 크기 조절이 그대로 통한다.
   · 하드코딩 0 — 특정 에셋 이름을 알지 않는다. 규약만 안다:
       루트(또는 지정 그룹)의 직계 자식 = 편집 단위
       id / data-name → 레이어 이름 · data-role → 역할
       data-role="photo-slot" → 사진 자리(기존 image 요소로 연결)
   · Compound Asset — 한 번에 들어온 조각들은 grp 하나로 묶인다.
     scene.groups[grp] = { name, aid }. 처음엔 한 덩이로 움직이고,
     안으로 들어가면(더블클릭) 조각을 따로 만진다. 묶고 풀기 자유.
   · 정직한 분리 — 못 담는 기능(image·foreignObject·filter·use·text·
     외부 참조)은 조용히 굽지 않고 unsupported 로 이름 붙여 돌려준다.
   · 순수 로직 = DOM 파서만 있으면 된다(jsdom 검증 가능). getBBox 에
     기대지 않고 기하로 bbox 를 잰다 — 브라우저·검증기가 같은 답.
   ============================================================ */
window.MK_SVGASSET = (() => {
  'use strict';
  const r2 = (v) => Math.round(v * 100) / 100;
  const r1 = (v) => Math.round(v * 10) / 10;
  const num = (v, d) => { const n = parseFloat(v); return isFinite(n) ? n : (d || 0); };
  const attr = (n, k) => (n && n.getAttribute ? n.getAttribute(k) : null);
  const tagOf = (n) => (n && n.tagName ? String(n.tagName).toLowerCase() : '');
  const each = (n, fn) => { const ch = (n && n.childNodes) || []; for (let i = 0; i < ch.length; i++) if (ch[i].nodeType === 1) fn(ch[i]); };

  /* 담을 수 있는 노드 / 못 담는 노드 */
  const SHAPES = ['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'];
  const OK_TAGS = SHAPES.concat(['g', 'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'title', 'desc', 'metadata']);
  const BAD_TAGS = { image: '비트맵 이미지', foreignobject: 'foreignObject', filter: '필터', use: 'use/symbol 재사용', symbol: 'use/symbol 재사용', text: '텍스트', pattern: '패턴', marker: '마커', style: '스타일시트', script: '스크립트', switch: 'switch', a: '링크' };

  /* ================= 1. 변환 행렬 ================= */
  const I = () => [1, 0, 0, 1, 0, 0];
  const mul = (a, b) => [ /* a·b (b 먼저 적용) */
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const apply = (m, x, y) => ({ x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] });
  function parseTransform(str) {
    let m = I(); if (!str) return m;
    const re = /(translate|rotate|scale|matrix|skewX|skewY)\s*\(([^)]*)\)/g; let t;
    while ((t = re.exec(str))) {
      const a = t[2].trim().split(/[\s,]+/).map(Number);
      let k = I();
      if (t[1] === 'translate') k = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
      else if (t[1] === 'scale') k = [a[0] || 1, 0, 0, (a.length > 1 ? a[1] : a[0]) || 1, 0, 0];
      else if (t[1] === 'rotate') {
        const r = (a[0] || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        k = [c, s, -s, c, 0, 0];
        if (a.length > 2) k = mul(mul([1, 0, 0, 1, a[1], a[2]], k), [1, 0, 0, 1, -a[1], -a[2]]);
      } else if (t[1] === 'matrix' && a.length === 6) k = a;
      else if (t[1] === 'skewX') k = [1, 0, Math.tan((a[0] || 0) * Math.PI / 180), 1, 0, 0];
      else if (t[1] === 'skewY') k = [1, Math.tan((a[0] || 0) * Math.PI / 180), 0, 1, 0, 0];
      m = mul(m, k);
    }
    return m;
  }

  /* ================= 2. 기하 bbox (getBBox 비의존) ================= */
  const B = () => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
  const add = (b, m, x, y) => { const p = apply(m, x, y); if (p.x < b.x0) b.x0 = p.x; if (p.x > b.x1) b.x1 = p.x; if (p.y < b.y0) b.y0 = p.y; if (p.y > b.y1) b.y1 = p.y; };
  const merge = (b, c) => { if (!c || !isFinite(c.x0)) return; b.x0 = Math.min(b.x0, c.x0); b.y0 = Math.min(b.y0, c.y0); b.x1 = Math.max(b.x1, c.x1); b.y1 = Math.max(b.y1, c.y1); };
  const ellipsePts = (cx, cy, rx, ry) => { const p = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; };
  /* 베지어·호는 몇 점만 찍어도 bbox 용도로는 충분하다 */
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
  const quad = (p0, p1, p2, t) => { const u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; };
  function arcPts(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
    rx = Math.abs(rx); ry = Math.abs(ry); if (!rx || !ry) return [[x2, y2]];
    const P = phi * Math.PI / 180, c = Math.cos(P), s = Math.sin(P);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const x1p = c * dx + s * dy, y1p = -s * dx + c * dy;
    let L = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry); if (L > 1) { rx *= Math.sqrt(L); ry *= Math.sqrt(L); }
    const sq = Math.max(0, (rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p) / (rx * rx * y1p * y1p + ry * ry * x1p * x1p));
    let co = Math.sqrt(sq); if (fa === fs) co = -co;
    const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
    const cx = c * cxp - s * cyp + (x1 + x2) / 2, cy = s * cxp + c * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => { const d = ux * vx + uy * vy, l = Math.hypot(ux, uy) * Math.hypot(vx, vy); let a = Math.acos(Math.max(-1, Math.min(1, d / (l || 1)))); if (ux * vy - uy * vx < 0) a = -a; return a; };
    const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= Math.PI * 2; if (fs && dt < 0) dt += Math.PI * 2;
    const out = []; for (let i = 1; i <= 8; i++) { const a = t1 + dt * i / 8; out.push([cx + rx * Math.cos(a) * c - ry * Math.sin(a) * s, cy + rx * Math.cos(a) * s + ry * Math.sin(a) * c]); }
    return out;
  }
  function pathPts(d) {
    const pts = []; const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
    let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0, px = null, py = null, pq = null;
    const nx = () => Number(tok[i++]);
    const isNum = () => i < tok.length && !/^[a-zA-Z]$/.test(tok[i]);
    while (i < tok.length) {
      if (/^[a-zA-Z]$/.test(tok[i])) cmd = tok[i++];
      else if (!cmd) { i++; continue; }
      const rel = cmd === cmd.toLowerCase(); const C = cmd.toUpperCase();
      if (C === 'Z') { cx = sx; cy = sy; cmd = rel ? 'l' : 'L'; if (!isNum()) { cmd = ''; } continue; }
      if (!isNum()) break;
      if (C === 'M') { let x = nx(), y = nx(); if (rel) { x += cx; y += cy; } cx = sx = x; cy = sy = y; pts.push([cx, cy]); cmd = rel ? 'l' : 'L'; px = py = pq = null; }
      else if (C === 'L') { let x = nx(), y = nx(); if (rel) { x += cx; y += cy; } cx = x; cy = y; pts.push([cx, cy]); px = py = pq = null; }
      else if (C === 'H') { let x = nx(); if (rel) x += cx; cx = x; pts.push([cx, cy]); px = py = pq = null; }
      else if (C === 'V') { let y = nx(); if (rel) y += cy; cy = y; pts.push([cx, cy]); px = py = pq = null; }
      else if (C === 'C' || C === 'S') {
        let x1, y1;
        if (C === 'C') { x1 = nx(); y1 = nx(); if (rel) { x1 += cx; y1 += cy; } }
        else { x1 = px != null ? 2 * cx - px : cx; y1 = py != null ? 2 * cy - py : cy; }
        let x2 = nx(), y2 = nx(), x = nx(), y = nx(); if (rel) { x2 += cx; y2 += cy; x += cx; y += cy; }
        for (let t = 1; t <= 4; t++) pts.push(bez([cx, cy], [x1, y1], [x2, y2], [x, y], t / 4));
        px = x2; py = y2; pq = null; cx = x; cy = y;
      } else if (C === 'Q' || C === 'T') {
        let x1, y1;
        if (C === 'Q') { x1 = nx(); y1 = nx(); if (rel) { x1 += cx; y1 += cy; } }
        else { x1 = pq ? 2 * cx - pq[0] : cx; y1 = pq ? 2 * cy - pq[1] : cy; }
        let x = nx(), y = nx(); if (rel) { x += cx; y += cy; }
        for (let t = 1; t <= 4; t++) pts.push(quad([cx, cy], [x1, y1], [x, y], t / 4));
        pq = [x1, y1]; px = py = null; cx = x; cy = y;
      } else if (C === 'A') {
        const rx = nx(), ry = nx(), rot = nx(), fa = nx(), fs = nx(); let x = nx(), y = nx(); if (rel) { x += cx; y += cy; }
        arcPts(cx, cy, rx, ry, rot, fa, fs, x, y).forEach((p) => pts.push(p));
        cx = x; cy = y; px = py = pq = null;
      } else break;
    }
    return pts;
  }
  const inheritSW = (n) => { let k = n; while (k && k.nodeType === 1) { const v = attr(k, 'stroke-width'); if (v != null) return num(v, 0); k = k.parentNode; } return 0; };
  const hasStroke = (n) => { let k = n; while (k && k.nodeType === 1) { const v = attr(k, 'stroke'); if (v != null) return v !== 'none'; k = k.parentNode; } return false; };
  function bboxNode(n, m) {
    const tag = tagOf(n);
    if (tag === 'defs' || tag === 'clippath' || tag === 'mask' || tag === 'title' || tag === 'desc' || tag === 'metadata' || tag === 'lineargradient' || tag === 'radialgradient') return null;
    const mm = mul(m, parseTransform(attr(n, 'transform')));
    const b = B();
    const sw = hasStroke(n) ? inheritSW(n) / 2 : 0;
    const pad = (pts) => pts.forEach(([x, y]) => { add(b, mm, x - sw, y - sw); add(b, mm, x + sw, y + sw); add(b, mm, x - sw, y + sw); add(b, mm, x + sw, y - sw); });
    if (tag === 'g' || tag === 'svg') { each(n, (c) => merge(b, bboxNode(c, mm))); return b; }
    if (tag === 'rect') { const x = num(attr(n, 'x')), y = num(attr(n, 'y')), w = num(attr(n, 'width')), h = num(attr(n, 'height')); pad([[x, y], [x + w, y], [x, y + h], [x + w, y + h]]); return b; }
    if (tag === 'circle') { const r = num(attr(n, 'r')); pad(ellipsePts(num(attr(n, 'cx')), num(attr(n, 'cy')), r, r)); return b; }
    if (tag === 'ellipse') { pad(ellipsePts(num(attr(n, 'cx')), num(attr(n, 'cy')), num(attr(n, 'rx')), num(attr(n, 'ry')))); return b; }
    if (tag === 'line') { pad([[num(attr(n, 'x1')), num(attr(n, 'y1'))], [num(attr(n, 'x2')), num(attr(n, 'y2'))]]); return b; }
    if (tag === 'polyline' || tag === 'polygon') { const ns = (attr(n, 'points') || '').match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []; const p = []; for (let i = 0; i + 1 < ns.length; i += 2) p.push([+ns[i], +ns[i + 1]]); pad(p); return b; }
    if (tag === 'path') { pad(pathPts(attr(n, 'd') || '')); return b; }
    return null;
  }
  const bboxOf = (n) => { const b = bboxNode(n, I()); return (b && isFinite(b.x0) && b.x1 > b.x0) ? { x: r2(b.x0), y: r2(b.y0), w: r2(Math.max(0.01, b.x1 - b.x0)), h: r2(Math.max(0.01, b.y1 - b.y0)) } : null; };

  /* ================= 3. 색 수집 · id 참조 ================= */
  const PAINT_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color'];
  const isColor = (v) => !!v && v !== 'none' && v !== 'inherit' && v !== 'currentColor' && !/^url\(/.test(v);
  function collectPaints(n, out) {
    PAINT_ATTRS.forEach((k) => { const v = attr(n, k); if (isColor(v)) out.add(normColor(v)); });
    const st = attr(n, 'style');
    if (st) st.split(';').forEach((kv) => { const [k, v] = kv.split(':').map((s) => (s || '').trim()); if (PAINT_ATTRS.includes(k) && isColor(v)) out.add(normColor(v)); });
    each(n, (c) => collectPaints(c, out));
  }
  const normColor = (v) => { const s = String(v).trim(); if (/^#[0-9a-f]{3}$/i.test(s)) return ('#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toUpperCase(); return /^#/.test(s) ? s.toUpperCase() : s; };
  const refsOf = (markup) => { const set = new Set(); (markup.match(/url\(#([^)"']+)\)/g) || []).forEach((u) => set.add(u.slice(5, -1))); (markup.match(/href="#([^"]+)"/g) || []).forEach((u) => set.add(u.slice(7, -1))); return set; };

  /* ================= 4. 직렬화 · id 접두 ================= */
  function serialize(n) {
    if (typeof XMLSerializer !== 'undefined') { try { return new XMLSerializer().serializeToString(n); } catch (_) {} }
    return n.outerHTML || '';
  }
  /* xmlns 중복 제거 — 인라인 svg 안에 다시 들어가므로 필요 없다 */
  const stripNs = (s) => s.replace(/\s+xmlns(:\w+)?="[^"]*"/g, '');
  /* 모든 id 와 참조에 접두를 붙인다 — 같은 에셋을 두 번 넣어도 그라디언트가 섞이지 않는다 */
  function prefixIds(markup, pfx) {
    return markup
      .replace(/\sid="([^"]+)"/g, (m, id) => ` id="${pfx}${id}"`)
      .replace(/url\(#([^)"']+)\)/g, (m, id) => `url(#${pfx}${id})`)
      .replace(/href="#([^"]+)"/g, (m, id) => `href="#${pfx}${id}"`);
  }
  function unprefix(markup, pfx) {
    const esc = pfx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return markup.replace(new RegExp(`(id="|url\\(#|href="#)${esc}`, 'g'), '$1');
  }
  let seq = 0;
  const newPfx = () => 'k' + (Date.now().toString(36).slice(-4)) + (++seq).toString(36) + '-';

  /* ================= 5. 파서 ================= */
  const nameOf = (n, i) => attr(n, 'data-name') || attr(n, 'inkscape:label') || attr(n, 'id') || (tagOf(n) + ' ' + (i + 1));
  const humanize = (s) => String(s || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const roleOf = (n) => { const r = attr(n, 'data-role'); if (r) return r; const id = (attr(n, 'id') || '').toLowerCase(); if (/photo|placeholder|slot/.test(id)) return 'photo-slot'; return 'decoration'; };

  function scanUnsupported(n, out, path) {
    const tag = tagOf(n);
    if (BAD_TAGS[tag]) { out.push({ tag, why: BAD_TAGS[tag], at: path || attr(n, 'id') || tag }); return; }
    if (tag === 'image' || (attr(n, 'href') || attr(n, 'xlink:href') || '').startsWith('http')) out.push({ tag, why: '외부 참조', at: path });
    each(n, (c) => scanUnsupported(c, out, path));
  }

  /* svgText → { ok, name, width, height, vb, children, defs, unsupported, warnings } */
  function parse(svgText, opts) {
    opts = opts || {};
    if (typeof DOMParser === 'undefined') return { ok: false, msg: 'DOMParser 없음' };
    const dom = new DOMParser().parseFromString(String(svgText || ''), 'image/svg+xml');
    const svg = dom.documentElement;
    if (!svg || tagOf(svg) !== 'svg' || dom.querySelector('parsererror')) return { ok: false, msg: 'SVG 파싱 실패' };
    const vbA = (attr(svg, 'viewBox') || '').trim().split(/[\s,]+/).map(Number);
    const W = num(attr(svg, 'width'), 0) || (vbA.length === 4 ? vbA[2] : 0) || 1000;
    const H = num(attr(svg, 'height'), 0) || (vbA.length === 4 ? vbA[3] : 0) || 1000;
    const vb = vbA.length === 4 && vbA.every(isFinite) ? { x: vbA[0], y: vbA[1], w: vbA[2], h: vbA[3] } : { x: 0, y: 0, w: W, h: H };
    /* 루트 defs (클립·그라디언트) — 조각이 참조하면 그 노드만 딸려 간다 */
    const rootDefs = {};
    each(svg, (c) => { if (tagOf(c) === 'defs') each(c, (d) => { const id = attr(d, 'id'); if (id) rootDefs[id] = stripNs(serialize(d)); }); });
    /* 편집 단위의 부모: 지정 그룹 id > 유일한 최상위 g > svg 자체 */
    let host = null;
    if (opts.rootId) host = dom.getElementById(opts.rootId);
    if (!host) {
      const top = []; each(svg, (c) => { const t = tagOf(c); if (t !== 'defs' && t !== 'title' && t !== 'desc' && t !== 'metadata') top.push(c); });
      host = (top.length === 1 && tagOf(top[0]) === 'g') ? top[0] : svg;
    }
    const name = opts.name || attr(host, 'data-name') || (svg.querySelector('title') && svg.querySelector('title').textContent) || humanize(attr(host, 'id')) || 'SVG 에셋';
    const children = [], unsupported = [], warnings = [];
    let idx = 0;
    each(host, (n) => {
      const tag = tagOf(n);
      if (tag === 'defs' || tag === 'title' || tag === 'desc' || tag === 'metadata') return;
      const bad = []; scanUnsupported(n, bad, attr(n, 'id') || nameOf(n, idx));
      if (bad.length) { bad.forEach((b) => unsupported.push(b)); if (!SHAPES.includes(tag) && tag !== 'g') return; }
      if (!SHAPES.includes(tag) && tag !== 'g') { unsupported.push({ tag, why: '알 수 없는 노드', at: attr(n, 'id') || tag }); return; }
      const bb = bboxOf(n);
      if (!bb) { warnings.push('빈 조각 건너뜀: ' + nameOf(n, idx)); return; }
      let body = stripNs(serialize(n));
      const refs = refsOf(body); let defs = '';
      refs.forEach((id) => { if (rootDefs[id] && !new RegExp(`id="${id}"`).test(body)) defs += rootDefs[id]; });
      const paints = new Set(); collectPaints(n, paints);
      const role = roleOf(n);
      const child = { id: attr(n, 'id') || ('node-' + idx), name: nameOf(n, idx), role, bbox: bb, body, defs, paints: [...paints], z: idx, tag };
      if (role === 'photo-slot') {
        /* 사진 자리 — 안쪽 첫 rect/ellipse 의 기하를 그대로 읽는다 */
        const shp = SHAPES.includes(tag) ? n : (n.querySelector ? n.querySelector('rect,ellipse,circle,path') : null);
        child.photo = { rx: shp ? num(attr(shp, 'rx'), 0) : 0, fill: shp ? (attr(shp, 'fill') || '#EEEEEE') : '#EEEEEE', ellipse: shp ? /circle|ellipse/.test(tagOf(shp)) : false };
      }
      children.push(child); idx++;
    });
    if (!children.length) return { ok: false, msg: '편집 가능한 조각이 없어요', unsupported };
    return { ok: true, name, width: W, height: H, vb, children, unsupported, warnings, sourceId: attr(host, 'id') || attr(svg, 'id') || null };
  }

  /* ================= 6. 요소 변환 · 삽입 ================= */
  /* 목표 상자(% 좌표)에 맞춰 조각들을 요소로. box 없으면 씬 가운데 최대 90% 로 맞춘다 */
  function fitBox(parsed, scene, box) {
    if (box) return box;
    const sw = +scene.width || 1280, sh = +scene.height || 720;
    const aw = parsed.vb.w, ah = parsed.vb.h;
    /* 씬 px 기준으로 담는다 */
    let s = Math.min(sw * 0.9 / aw, sh * 0.9 / ah);
    const w = aw * s / sw * 100, h = ah * s / sh * 100;
    return { x: r1((100 - w) / 2), y: r1((100 - h) / 2), w: r1(w), h: r1(h) };
  }
  function toElements(parsed, scene, opts) {
    opts = opts || {};
    const box = fitBox(parsed, scene, opts.box);
    const vb = parsed.vb, grp = opts.grp || ('g' + Date.now().toString(36) + (++seq).toString(36));
    const pfx = opts.pfx || newPfx();
    const els = parsed.children.map((c) => {
      const x = box.x + (c.bbox.x - vb.x) / vb.w * box.w, y = box.y + (c.bbox.y - vb.y) / vb.h * box.h;
      const w = c.bbox.w / vb.w * box.w, h = c.bbox.h / vb.h * box.h;
      const base = { x: r2(x), y: r2(y), w: r2(Math.max(0.2, w)), h: r2(Math.max(0.2, h)), label: c.name, grp, aid: c.id, role: c.role };
      if (c.role === 'photo-slot') {
        /* 기존 image 요소 그대로 — 「사진 올리기」 한 번이면 그 자리에 들어간다 */
        const ph = c.photo || {};
        const el = { kind: 'image', ...base, fill: ph.fill || '#EEEEEE', label: c.name || '사진' };
        if (ph.ellipse) el.radius = 999; else if (ph.rx) el.radius = r2(ph.rx / vb.w * (+scene.width || 1280) * box.w / 100);
        return el;
      }
      return { kind: 'vector', ...base, vec: { vb: [c.bbox.x, c.bbox.y, c.bbox.w, c.bbox.h], body: prefixIds(c.body, pfx), defs: prefixIds(c.defs, pfx), pfx } };
    });
    return { els, grp, box };
  }
  function insert(doc, si, parsed, opts) {
    const sc = doc && doc.scenes && doc.scenes[si]; if (!sc || !parsed || !parsed.ok) return { ok: false, msg: '장면 또는 에셋이 없어요' };
    const r = toElements(parsed, sc, opts);
    sc.groups = sc.groups || {};
    sc.groups[r.grp] = { name: parsed.name, aid: parsed.sourceId || null, kind: 'asset' };
    const from = sc.elements.length;
    r.els.forEach((e) => sc.elements.push(e));
    return { ok: true, grp: r.grp, idxs: r.els.map((_, i) => from + i), count: r.els.length, box: r.box, unsupported: parsed.unsupported || [] };
  }

  /* ================= 7. 렌더 — 요소 → 인라인 svg ================= */
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  function markupOf(el) {
    if (!el || !el.vec) return '';
    let s = (el.vec.defs || '') + (el.vec.body || '');
    const P = el.paint || {};
    Object.keys(P).forEach((from) => {
      const to = P[from]; if (!to || to === from) return;
      const fe = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      /* 속성값 · style 안의 값 · 3자리 축약 모두 — 대소문자 무관 */
      s = s.replace(new RegExp(`((?:fill|stroke|stop-color|flood-color)\\s*[=:]\\s*"?)${fe}`, 'gi'), `$1${to}`);
      if (/^#[0-9A-F]{6}$/i.test(from) && from[1] === from[2] && from[3] === from[4] && from[5] === from[6]) {
        const short = '#' + from[1] + from[3] + from[5];
        s = s.replace(new RegExp(`((?:fill|stroke|stop-color|flood-color)\\s*[=:]\\s*"?)${short}(?![0-9a-f])`, 'gi'), `$1${to}`);
      }
    });
    return s;
  }
  /* 화면·재생용 <svg> 태그. attrs: 추가 속성 문자열 */
  function svgTag(el, attrs) {
    const vb = (el.vec && el.vec.vb) || [0, 0, 100, 100];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r2).join(' ')}" preserveAspectRatio="none" overflow="visible" style="width:100%;height:100%;display:block;pointer-events:none"${attrs ? ' ' + attrs : ''}>${markupOf(el)}</svg>`;
  }
  /* 미리보기 썸네일(dataURL) — 카탈로그·레이어 패널용 */
  function thumbSrc(el) {
    const vb = (el.vec && el.vec.vb) || [0, 0, 100, 100];
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r2).join(' ')}">${markupOf(el)}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  /* ================= 8. 편집 연산 ================= */
  const paintsOf = (el) => {
    if (!el || !el.vec) return [];
    const set = new Set();
    const s = (el.vec.defs || '') + (el.vec.body || '');
    (s.match(/(?:fill|stroke|stop-color|flood-color)\s*[=:]\s*"?(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)/g) || []).forEach((m) => {
      const v = m.replace(/^[^=:]+[=:]\s*"?/, '');
      if (isColor(v) && v !== 'evenodd' && v !== 'nonzero') set.add(normColor(v));
    });
    return [...set].map((c) => ({ from: c, to: (el.paint && el.paint[c]) || c }));
  };
  function setPaint(el, from, to) {
    if (!el || !el.vec) return el;
    el.paint = el.paint || {};
    if (!to || normColor(to) === normColor(from)) delete el.paint[from]; else el.paint[from] = normColor(to);
    if (!Object.keys(el.paint).length) delete el.paint;
    return el;
  }
  /* 복제 — id 접두를 새로 찍어 그라디언트 충돌을 막는다 */
  function cloneEl(el) {
    const c = JSON.parse(JSON.stringify(el));
    if (c.vec && c.vec.pfx) {
      const np = newPfx();
      c.vec.body = prefixIds(unprefix(c.vec.body, c.vec.pfx), np);
      c.vec.defs = prefixIds(unprefix(c.vec.defs || '', c.vec.pfx), np);
      c.vec.pfx = np;
    }
    return c;
  }
  /* 그룹 — 씬 안 인덱스 목록을 grp 로 묶는다 / 푼다 */
  const membersOf = (scene, grp) => (scene && scene.elements || []).map((e, i) => (e && e.grp === grp ? i : -1)).filter((i) => i >= 0);
  function groupBox(scene, grp) {
    const L = window.MK_LIVE; const ar = (+scene.width > 0 && +scene.height > 0) ? scene.width / scene.height : 0;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    membersOf(scene, grp).forEach((i) => {
      const e = scene.elements[i];
      const b = (L && L.aabb) ? L.aabb(e, ar) : { x: e.x, y: e.y, w: e.w || 10, h: e.h || 8 };
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
    });
    if (!isFinite(x0)) return null;
    return { x: r2(x0), y: r2(y0), w: r2(x1 - x0), h: r2(y1 - y0) };
  }
  function group(scene, idxs, name) {
    const grp = 'g' + Date.now().toString(36) + (++seq).toString(36);
    scene.groups = scene.groups || {};
    scene.groups[grp] = { name: name || '그룹', kind: 'user' };
    idxs.forEach((i) => { const e = scene.elements[i]; if (e) e.grp = grp; });
    return grp;
  }
  function ungroup(scene, grp) {
    (scene.elements || []).forEach((e) => { if (e && e.grp === grp) delete e.grp; });
    if (scene.groups) delete scene.groups[grp];
    return scene;
  }
  /* 그룹 통째 이동·크기: 시작 상자(start) → 새 상자(box) 로 각 조각을 비례 이동 */
  function transformGroup(scene, grp, startEls, start, box) {
    const sx = box.w / (start.w || 1), sy = box.h / (start.h || 1);
    membersOf(scene, grp).forEach((i) => {
      const e = scene.elements[i], s = startEls[i]; if (!s) return;
      e.x = r2(box.x + (s.x - start.x) * sx); e.y = r2(box.y + (s.y - start.y) * sy);
      e.w = r2(Math.max(0.2, s.w * sx));
      if (s.h != null) e.h = r2(Math.max(0.2, s.h * sy));
      if (e.kind === 'text' && s.size != null) e.size = r2(Math.max(1, s.size * sy));
    });
  }
  /* 그룹 복제 — 새 grp·새 접두. 원본 뒤에 같은 순서로 */
  function dupGroup(scene, grp, dx, dy) {
    const idxs = membersOf(scene, grp); if (!idxs.length) return null;
    const ng = 'g' + Date.now().toString(36) + (++seq).toString(36);
    scene.groups = scene.groups || {};
    scene.groups[ng] = { ...(scene.groups[grp] || { name: '그룹' }), name: ((scene.groups[grp] || {}).name || '그룹') + ' 사본' };
    const copies = idxs.map((i) => { const c = cloneEl(scene.elements[i]); c.grp = ng; c.x = r2(c.x + (dx == null ? 3 : dx)); c.y = r2(c.y + (dy == null ? 3 : dy)); return c; });
    const at = Math.max(...idxs) + 1;
    scene.elements.splice(at, 0, ...copies);
    return { grp: ng, idxs: copies.map((_, k) => at + k) };
  }
  /* 삭제 후 남은 그룹 정리(멤버 0 이면 groups 항목 제거) */
  function pruneGroups(scene) {
    if (!scene || !scene.groups) return;
    Object.keys(scene.groups).forEach((g) => { if (!membersOf(scene, g).length) delete scene.groups[g]; });
    if (!Object.keys(scene.groups).length) delete scene.groups;
  }

  /* ================= 9. 래스터 (PPTX 등 벡터를 못 싣는 출력용) ================= */
  function rasterize(el, pxW, pxH) {
    return new Promise((res) => {
      if (typeof document === 'undefined' || typeof Image === 'undefined') return res(null);
      const vb = el.vec.vb;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r2).join(' ')}" width="${Math.max(1, Math.round(pxW))}" height="${Math.max(1, Math.round(pxH))}" preserveAspectRatio="none">${markupOf(el)}</svg>`;
      const img = new Image();
      img.onload = () => { try { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(pxW)); c.height = Math.max(1, Math.round(pxH)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); } catch (_) { res(null); } };
      img.onerror = () => res(null);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  /* 디스플레이 리스트의 svg op → image op (PPTX 어댑터가 그대로 싣는다) */
  async function rasterizeOps(dl, scale) {
    const S = scale || 2;
    for (const op of dl.ops) {
      if (op.op !== 'svg' || !op.el) continue;
      const src = await rasterize(op.el, op.frame.w * S, op.frame.h * S);
      if (src) { op.op = 'image'; op.src = src; op.fit = 'contain'; op.label = ''; delete op.markup; }
    }
    return dl;
  }

  /* ================= 10. 카탈로그 · 로드 ================= */
  const BASE = '/maker-playground/assets/svgassets/';
  const CATALOG = [
    { id: 'christmas-frame', name: '크리스마스 프레임', file: 'christmas-frame/christmas-frame.svg', thumb: 'christmas-frame/preview.png', cat: '프레임', tags: ['크리스마스', '사진 프레임', '겨울'], photo: true },
  ];
  const cache = {};
  function load(id, cb) {
    const m = CATALOG.find((c) => c.id === id); if (!m) return cb({ ok: false, msg: '없는 에셋' });
    if (cache[id]) return cb(cache[id]);
    if (typeof fetch !== 'function') return cb({ ok: false, msg: 'fetch 없음' });
    fetch(BASE + m.file).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { const p = parse(t, { name: m.name }); if (p.ok) cache[id] = p; cb(p); })
      .catch((e) => cb({ ok: false, msg: '에셋을 불러오지 못했어요 (' + e.message + ')' }));
  }

  /* 점검 — 삽입 없이 구조만 보고 답한다 */
  function audit(svgText, opts) {
    const p = parse(svgText, opts);
    if (!p.ok) return p;
    return { ok: true, name: p.name, width: p.width, height: p.height, count: p.children.length,
      children: p.children.map((c) => ({ id: c.id, name: c.name, role: c.role, bbox: c.bbox, paints: c.paints.length, bytes: c.body.length })),
      unsupported: p.unsupported, warnings: p.warnings };
  }

  return { parse, audit, toElements, insert, markupOf, svgTag, thumbSrc, paintsOf, setPaint, cloneEl,
    membersOf, groupBox, group, ungroup, transformGroup, dupGroup, pruneGroups, rasterize, rasterizeOps,
    load, CATALOG, BASE, _geo: { parseTransform, bboxOf, pathPts, prefixIds, unprefix, normColor } };
})();
