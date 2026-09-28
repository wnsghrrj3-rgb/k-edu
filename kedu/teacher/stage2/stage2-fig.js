/* ============================================================================
   stage2-fig.js — 케이티처 2세대 「개념 그림 층」 (2026-09-25 21차)
   · 개념 장 1,042장 가운데 693장이 글만 있었다(3학년 579). 사진을 기다리지 않고, 개념 자체를 그린다.
   · 데이터 slide.data.fig = { k:'…', … } 한 칸만 읽는다. 없으면 아무것도 그리지 않는다(기존 장 diff-0).
   · 그림 문법 하나: **주황 화살표 = 힘, 굵고 길수록 큰 힘.** 모든 부품이 같은 화살표를 쓴다.
   · 부품: panels(나란히 견주기) · force(밀기·당기기·누르기·멈추기·들기) · balance(수평대) · lever(지레) · slope(빗면)
           · scale(전자저울·용수철저울) · hand(손 어림) · tools(도구 카드) · chain(카드 사이 화살표) · places(쓰이는 곳)
   · 23차(2026-09-28) 길이·시간 부품 추가: ruler(자)·joins(이어 붙여 어림)·road(거리 띠·km 표지판)·clock(시·분·초바늘)·tvert(시간 세로셈) · 카드 on(주황 강조)
   · 22차(2026-09-28) 수학 부품 추가: frac·fracs·numline·tenbox(분수·소수) · geo(평면도형) · bt·regroup·vert(수 모형·세로셈) · share·bundle·arr(나눔·배열) · eq(식 카드)
   ============================================================================ */
(function (global) {
  'use strict';
  const ORANGE = '#FF7A2F', INK = '#2B3440', WOOD = '#C98B52', WOOD2 = '#A86F3C', GROUND = '#CFE8B8';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const W = 460, H = 280, GY = 236; // 한 칸 = 460×280, 땅 = y 236

  // ── 힘 화살표(크기 s·m·l) ──
  const AW = { s: 9, m: 15, l: 23 }, AL = { s: 62, m: 96, l: 132 };
  function arrow(x, y, dir, size) {
    const w = AW[size] || AW.m, len = AL[size] || AL.m, hw = w * 1.35, hl = w * 1.5;
    const g = (d) => '<g class="f-arrow a-' + (size || 'm') + '" data-len="' + len + '" data-w="' + w + '"><path d="' + d + '" fill="' + ORANGE + '" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></g>';
    if (dir === 'r') return g('M' + x + ' ' + (y - w / 2) + 'H' + (x + len - hl) + 'V' + (y - hw) + 'L' + (x + len) + ' ' + y + 'L' + (x + len - hl) + ' ' + (y + hw) + 'V' + (y + w / 2) + 'H' + x + 'Z');
    if (dir === 'l') return g('M' + x + ' ' + (y - w / 2) + 'H' + (x - len + hl) + 'V' + (y - hw) + 'L' + (x - len) + ' ' + y + 'L' + (x - len + hl) + ' ' + (y + hw) + 'V' + (y + w / 2) + 'H' + x + 'Z');
    if (dir === 'd') return g('M' + (x - w / 2) + ' ' + y + 'V' + (y + len - hl) + 'H' + (x - hw) + 'L' + x + ' ' + (y + len) + 'L' + (x + hw) + ' ' + (y + len - hl) + 'H' + (x + w / 2) + 'V' + y + 'Z');
    return g('M' + (x - w / 2) + ' ' + y + 'V' + (y - len + hl) + 'H' + (x - hw) + 'L' + x + ' ' + (y - len) + 'L' + (x + hw) + ' ' + (y - len + hl) + 'H' + (x + w / 2) + 'V' + y + 'Z'); // 'u'
  }
  const lenOf = (size) => AL[size] || AL.m;
  // 인물 — 그림 층의 주인공을 그대로 빌린다(작게)
  function who(face, x, y, sc) {
    const A = global.KT2_ART; sc = sc || 0.8;
    const s = A && A.character ? A.character(face || '👦') : '';
    if (!s) return '<circle cx="' + (x + 56) + '" cy="' + (y + 60) + '" r="40" fill="#F7D2B0"/>';
    return s.replace('<svg class="chr', '<svg x="' + x + '" y="' + y + '" class="fig-chr chr').replace(/width="150" height="171"/, 'width="' + Math.round(140 * sc) + '" height="' + Math.round(160 * sc) + '"');
  }
  function ground() { return '<rect x="0" y="' + GY + '" width="' + W + '" height="' + (H - GY) + '" fill="' + GROUND + '"/><line x1="0" y1="' + GY + '" x2="' + W + '" y2="' + GY + '" stroke="#A9D18E" stroke-width="3"/>'; }
  function svgWrap(inner, cls, vb) { return '<svg class="fig-svg ' + (cls || '') + '" viewBox="' + (vb || ('0 0 ' + W + ' ' + H)) + '" xmlns="http://www.w3.org/2000/svg" role="img">' + inner + '</svg>'; }

  // ── 물체 ──
  function ball(cx, cy, r) { r = r || 26; return '<g class="o-ball"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#F2545B"/><path d="M' + (cx - r) + ' ' + cy + ' Q' + cx + ' ' + (cy - r * 0.55) + ' ' + (cx + r) + ' ' + cy + '" stroke="#fff" stroke-width="5" fill="none"/><circle cx="' + (cx - r * 0.35) + '" cy="' + (cy - r * 0.4) + '" r="' + (r * 0.18) + '" fill="#fff" opacity=".55"/></g>'; }
  function box(x, w, h, load) {
    let s = '<g class="o-box"><rect x="' + x + '" y="' + (GY - h) + '" width="' + w + '" height="' + h + '" rx="6" fill="#E3B27A" stroke="#B9844B" stroke-width="3"/><path d="M' + x + ' ' + (GY - h + 16) + 'H' + (x + w) + '" stroke="#B9844B" stroke-width="3"/>';
    const n = Math.max(0, Math.min(3, load | 0)); const cols = ['#5B8DEF', '#5CC08A', '#F5A623'];
    for (let i = 0; i < n; i++) s += '<rect x="' + (x + 8 + i * ((w - 16) / 3)) + '" y="' + (GY - h - 18) + '" width="' + ((w - 16) / 3 - 6) + '" height="22" rx="4" fill="' + cols[i] + '"/>';
    return s + '</g>';
  }
  function weights(x, y, n) { let s = ''; for (let i = 0; i < n; i++) s += '<rect class="o-weight" x="' + (x + i * 28) + '" y="' + (y - 24) + '" width="24" height="24" rx="4" fill="#6B7C93" stroke="#4E5C70" stroke-width="2"/>'; return s; }
  function cart(x, load) {
    return '<g class="o-cart"><rect x="' + x + '" y="' + (GY - 62) + '" width="110" height="38" rx="6" fill="#5B8DEF" stroke="#3E6FCF" stroke-width="3"/>' + weights(x + 14, GY - 62, Math.max(0, Math.min(3, load | 0)))
      + '<circle cx="' + (x + 24) + '" cy="' + (GY - 14) + '" r="13" fill="#3B4252"/><circle cx="' + (x + 86) + '" cy="' + (GY - 14) + '" r="13" fill="#3B4252"/><circle cx="' + (x + 24) + '" cy="' + (GY - 14) + '" r="4" fill="#fff"/><circle cx="' + (x + 86) + '" cy="' + (GY - 14) + '" r="4" fill="#fff"/></g>';
  }
  function bottle(x, fall) {
    const b = '<rect x="-14" y="-78" width="28" height="68" rx="10" fill="#9ED8F5" stroke="#5AAED8" stroke-width="3"/><rect x="-7" y="-92" width="14" height="16" rx="3" fill="#5AAED8"/><rect x="-14" y="-52" width="28" height="14" fill="#fff" opacity=".7"/>';
    return '<g class="o-bottle' + (fall ? ' fallen' : '') + '" transform="translate(' + x + ' ' + (fall ? GY - 14 : GY) + ')' + (fall ? ' rotate(78)' : '') + '">' + b + '</g>';
  }
  function trail(x1, x2, y) { let s = ''; for (let i = 0; i < 3; i++) s += '<line x1="' + (x1 + i * 6) + '" y1="' + (y - 14 + i * 14) + '" x2="' + (x2 - 10 + i * 6) + '" y2="' + (y - 14 + i * 14) + '" stroke="#9AA6B2" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 9"/>'; return '<g class="o-trail">' + s + '</g>'; }
  function swing(cx, off) {
    const top = 48, len = 142, a = (off || 0) * Math.PI / 180; const sx = cx + Math.sin(a) * len, sy = top + Math.cos(a) * len;
    return '<g class="o-swing"><path d="M' + (cx - 90) + ' ' + GY + ' L' + (cx - 70) + ' ' + top + ' H' + (cx + 70) + ' L' + (cx + 90) + ' ' + GY + '" stroke="#8A6A4A" stroke-width="10" fill="none" stroke-linejoin="round"/>'
      + '<line x1="' + (cx - 20) + '" y1="' + top + '" x2="' + (sx - 20) + '" y2="' + sy + '" stroke="#555" stroke-width="3"/><line x1="' + (cx + 20) + '" y1="' + top + '" x2="' + (sx + 20) + '" y2="' + sy + '" stroke="#555" stroke-width="3"/>'
      + '<rect x="' + (sx - 30) + '" y="' + (sy - 4) + '" width="60" height="12" rx="4" fill="#E05A4F"/></g>';
  }
  function clay(cx, flat) { return flat ? '<ellipse class="o-clay flat" cx="' + cx + '" cy="' + (GY - 12) + '" rx="62" ry="14" fill="#B98AE0" stroke="#9368C2" stroke-width="3"/>' : '<ellipse class="o-clay" cx="' + cx + '" cy="' + (GY - 34) + '" rx="36" ry="34" fill="#B98AE0" stroke="#9368C2" stroke-width="3"/>'; }
  function rock(cx, r, by) { r = r || 34; by = by || GY; return '<path class="o-rock" d="M' + (cx - r) + ' ' + by + ' Q' + (cx - r - 6) + ' ' + (by - r * 1.2) + ' ' + (cx - 4) + ' ' + (by - r * 1.5) + ' Q' + (cx + r + 8) + ' ' + (by - r * 1.3) + ' ' + (cx + r) + ' ' + by + ' Z" fill="#9AA0A8" stroke="#727A84" stroke-width="3"/>'; }
  function q(x, y) { return '<g class="o-q"><circle cx="' + x + '" cy="' + y + '" r="24" fill="#fff" stroke="#C9D2DC" stroke-width="3"/><text x="' + x + '" y="' + (y + 12) + '" text-anchor="middle" font-size="34" font-weight="800" fill="#7A8796">?</text></g>'; }

  // ── force: 인물이 물체에 힘을 준다 ──
  function force(o) {
    const act = o.act || 'push', size = o.size || 'm', obj = o.obj || 'box'; let s = ground();
    if (act === 'press') { // 위에서 누른다 — 인물 없이 손 화살표만
      s += clay(W / 2, !!o.flat) + arrow(W / 2, 30, 'd', size); return svgWrap(s, 'fig-force press');
    }
    if (act === 'lift') {
      s += who(o.who, 40, 92, 0.85);
      const cx = 300; s += obj === 'rock' ? rock(cx) : box(cx - 45, 90, 70, o.load);
      s += arrow(cx, GY - (obj === 'rock' ? 58 : 76), 'u', size); return svgWrap(s, 'fig-force lift');
    }
    if (act === 'none') { s += ball(W / 2, GY - 26) + q(W / 2 + 60, GY - 96); return svgWrap(s, 'fig-force none'); }
    if (obj === 'swing') {
      const off = act === 'stop' ? 0 : 22; s += swing(250, off);
      if (act === 'stop') s += '<path d="M150 170 q30 -26 60 0" stroke="#9AA6B2" stroke-width="4" fill="none" stroke-dasharray="8 8"/>' + who(o.who, 330, 104, 0.8) + arrow(330, 198, 'l', size);
      else s += who(o.who, 20, 104, 0.8) + arrow(130, 196, 'r', size);
      return svgWrap(s, 'fig-force swing ' + act);
    }
    if (act === 'pull') { // 인물이 왼쪽, 물체가 오른쪽, 줄을 당긴다 — 화살표는 인물 쪽
      s += who(o.who, 10, 92, 0.85);
      const ox = 250; s += obj === 'cart' ? cart(ox, o.load) : box(ox, 100, 76, o.load);
      const hy = GY - 44; s += '<line x1="112" y1="' + (hy - 10) + '" x2="' + ox + '" y2="' + hy + '" stroke="#7A5A3A" stroke-width="5"/>';
      s += arrow(ox - 12, hy - 34, 'l', size); return svgWrap(s, 'fig-force pull');
    }
    // push
    s += who(o.who, 10, 92, 0.85);
    const ax = 112, ay = GY - 44; s += arrow(ax, ay, 'r', size); const ox = ax + lenOf(size) + 10;
    if (obj === 'ball') {
      const far = o.trail === 'long' ? 110 : o.trail === 'short' ? 40 : 0; const bx = Math.min(ox + 26 + far, W - (o.bottle ? 80 : 30));
      if (far) s += trail(ox, bx - 30, GY - 26);
      s += ball(bx, GY - 26);
      if (o.bottle) s += bottle(W - 36, o.bottle === 'fall');
    } else if (obj === 'cart') s += cart(Math.min(ox, W - 116), o.load);
    else s += box(Math.min(ox, W - 106), 100, 76, o.load);
    return svgWrap(s, 'fig-force push');
  }

  // ── balance: 수평대 ──
  function balance(o) {
    const l = Math.max(0, o.l | 0), r = Math.max(0, o.r | 0), cx = W / 2, by = 168; const d = l - r;
    const ang = d === 0 ? 0 : (d > 0 ? -1 : 1) * Math.min(14, 5 + Math.abs(d) * 2);
    const stackAt = (x, n, col) => { let t = ''; for (let i = 0; i < n; i++) { const c = i % 2, row = Math.floor(i / 2); t += '<rect class="o-block" x="' + (x - 26 + c * 26) + '" y="' + (by - 22 - row * 22) + '" width="24" height="20" rx="3" fill="' + col + '" stroke="rgba(0,0,0,.18)" stroke-width="2"/>'; } return t; };
    let beam = '<rect x="' + (cx - 190) + '" y="' + by + '" width="380" height="14" rx="7" fill="' + WOOD + '" stroke="' + WOOD2 + '" stroke-width="3"/>' + stackAt(cx - 130, l, '#5B8DEF') + stackAt(cx + 130, r, '#F5A623');
    if (o.dist) beam += '<g class="o-dist"><path d="M' + cx + ' ' + (by + 26) + 'H' + (cx - 130) + 'M' + cx + ' ' + (by + 26) + 'H' + (cx + 130) + '" stroke="#3A7BD5" stroke-width="3" stroke-dasharray="8 6"/><path d="M' + (cx - 130) + ' ' + (by + 18) + 'v16M' + (cx + 130) + ' ' + (by + 18) + 'v16" stroke="#3A7BD5" stroke-width="3"/></g>';
    let s = ground() + '<path d="M' + (cx - 34) + ' ' + GY + ' L' + cx + ' ' + (by + 10) + ' L' + (cx + 34) + ' ' + GY + ' Z" fill="#8A93A0"/><circle class="o-fulcrum" cx="' + cx + '" cy="' + (by + 8) + '" r="7" fill="#fff" stroke="#5A6472" stroke-width="3"/>';
    s += '<g class="o-beam" data-ang="' + ang + '" transform="rotate(' + ang + ' ' + cx + ' ' + (by + 7) + ')">' + beam + '</g>';
    return svgWrap(s, 'fig-balance');
  }
  function balanceCap(o) { const l = o.l | 0, r = o.r | 0; return '왼쪽 ' + l + ' · 오른쪽 ' + r + ' → ' + (l === r ? '수평' : l > r ? '왼쪽으로 기욺' : '오른쪽으로 기욺'); }

  // ── lever·slope ──
  function lever(o) {
    const s = ground() + '<g class="o-lever" transform="rotate(-9 190 196)"><rect x="40" y="190" width="360" height="12" rx="5" fill="' + WOOD + '" stroke="' + WOOD2 + '" stroke-width="3"/></g>'
      + '<path d="M156 ' + GY + ' L178 204 L200 ' + GY + ' Z" fill="#8A93A0"/>' + rock(84, 28, 214)
      + arrow(372, 90, 'd', o.size || 's');
    return svgWrap(s, 'fig-lever');
  }
  function slope(o) {
    const s = ground() + '<path class="o-slope" d="M40 ' + GY + ' L380 ' + GY + ' L380 96 Z" fill="#D9C3A0" stroke="#B79B72" stroke-width="3"/><rect x="380" y="96" width="70" height="140" fill="#CDB38C"/>'
      + '<g transform="rotate(-22.4 200 170)">' + '<rect x="170" y="126" width="64" height="48" rx="5" fill="#E3B27A" stroke="#B9844B" stroke-width="3"/>' + arrow(96, 150, 'r', o.size || 's') + '</g>';
    return svgWrap(s, 'fig-slope');
  }

  // ── scale·hand ──
  function scale(o) {
    let s = ground();
    if (o.type === 'spring') {
      s += '<rect x="214" y="18" width="32" height="10" rx="3" fill="#6B7C93"/><rect x="206" y="28" width="48" height="118" rx="10" fill="#EAF2FB" stroke="#8FA3B8" stroke-width="3"/>';
      let coil = 'M230 36'; for (let i = 0; i < 7; i++) coil += ' l14 7 l-28 7 l14 0'; s += '<path class="o-spring" d="' + coil + '" stroke="#5A6472" stroke-width="3" fill="none"/>';
      for (let i = 0; i < 6; i++) s += '<line x1="208" y1="' + (44 + i * 16) + '" x2="' + (i % 2 ? 216 : 222) + '" y2="' + (44 + i * 16) + '" stroke="#8FA3B8" stroke-width="2"/>';
      s += '<line x1="230" y1="146" x2="230" y2="166" stroke="#5A6472" stroke-width="3"/><path d="M230 166 q-10 10 0 16" stroke="#5A6472" stroke-width="3" fill="none"/>' + weights(218, 206, 1);
      return svgWrap(s, 'fig-scale spring');
    }
    const item = o.item === 'coin' ? '<ellipse cx="230" cy="' + (GY - 58) + '" rx="22" ry="7" fill="#D4A63A" stroke="#A8801F" stroke-width="2"/>' : o.item === 'apple' ? '<circle cx="230" cy="' + (GY - 84) + '" r="28" fill="#E0413C"/><path d="M230 ' + (GY - 112) + ' q4 -12 12 -14" stroke="#6B4423" stroke-width="4" fill="none"/><ellipse cx="244" cy="' + (GY - 118) + '" rx="9" ry="5" fill="#5CC08A"/>' : '';
    s += '<rect x="140" y="' + (GY - 52) + '" width="180" height="52" rx="10" fill="#EEF1F5" stroke="#8FA3B8" stroke-width="3"/><rect x="160" y="' + (GY - 58) + '" width="140" height="8" rx="3" fill="#C8D1DB"/>'
      + '<rect x="178" y="' + (GY - 40) + '" width="104" height="30" rx="5" fill="#1F2A36"/><text class="o-read" x="230" y="' + (GY - 17) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#7CF29A" font-family="monospace">' + esc(o.show || '0 g') + '</text>' + item;
    return svgWrap(s, 'fig-scale digital');
  }
  function hand(o) { const s = ground() + who(o.who || '👧', 120, 92, 0.85) + '<circle cx="258" cy="148" r="22" fill="#E0413C"/><path d="M258 126 q3 -9 9 -11" stroke="#6B4423" stroke-width="4" fill="none"/>' + q(300, 76) + q(170, 60).replace('o-q', 'o-q q2'); return svgWrap(s, 'fig-hand'); }

  // ── 도구 카드 아이콘(120×100) ──
  const ICON = {
    '병따개': '<rect x="14" y="44" width="72" height="16" rx="8" fill="#8FA3B8" transform="rotate(-18 50 52)"/><circle cx="88" cy="36" r="16" fill="none" stroke="#8FA3B8" stroke-width="7"/><rect x="92" y="54" width="18" height="36" rx="4" fill="#5CC08A"/><rect x="95" y="48" width="12" height="8" fill="#D4A63A"/>',
    '집게': '<path d="M20 30 L96 50 M20 30 L96 72" stroke="#8FA3B8" stroke-width="8" stroke-linecap="round"/><circle cx="20" cy="30" r="7" fill="#5A6472"/><circle cx="100" cy="61" r="10" fill="#F5A623"/>',
    '시소': '<rect x="10" y="44" width="100" height="10" rx="5" fill="' + WOOD + '" transform="rotate(-12 60 50)"/><path d="M48 90 L60 54 L72 90 Z" fill="#E05A4F"/><circle cx="18" cy="42" r="9" fill="#5B8DEF"/>',
    '계단': '<path d="M12 90 V74 H36 V58 H60 V42 H84 V26 H108 V90 Z" fill="#D9C3A0" stroke="#B79B72" stroke-width="3"/>',
    '미끄럼틀': '<path d="M16 90 Q58 84 84 32" stroke="#F5A623" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="84" y="26" width="16" height="64" fill="#5B8DEF"/><path d="M92 30 v60" stroke="#3E6FCF" stroke-width="3" stroke-dasharray="6 6"/>',
    '비탈길': '<path d="M8 90 L112 90 L112 40 Z" fill="#B6D98F" stroke="#86B25E" stroke-width="3"/><path d="M20 86 L108 46" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>',
    '경사판': '<path d="M8 90 L96 90 L96 40 Z" fill="#D9C3A0" stroke="#B79B72" stroke-width="3"/><rect x="96" y="40" width="18" height="50" fill="#CDB38C"/><rect x="42" y="56" width="26" height="20" rx="3" fill="#E3B27A" transform="rotate(-29 55 66)"/>',
    '가위': '<circle cx="28" cy="70" r="12" fill="none" stroke="#E05A4F" stroke-width="6"/><circle cx="28" cy="36" r="12" fill="none" stroke="#E05A4F" stroke-width="6"/><path d="M38 64 L108 32 M38 42 L108 66" stroke="#8FA3B8" stroke-width="6" stroke-linecap="round"/><circle cx="66" cy="52" r="4" fill="#5A6472"/>',
    '지레': '<rect x="10" y="50" width="100" height="10" rx="5" fill="' + WOOD + '" transform="rotate(-10 60 55)"/><path d="M40 90 L50 60 L60 90 Z" fill="#8A93A0"/><path d="M8 62 q4 -22 24 -20 q14 6 6 22 Z" fill="#9AA0A8"/>',
    '빗면': '<path d="M8 90 L112 90 L112 34 Z" fill="#D9C3A0" stroke="#B79B72" stroke-width="3"/><rect x="50" y="52" width="24" height="18" rx="3" fill="#E3B27A" transform="rotate(-28 62 61)"/>',
    '입는 로봇': '<circle cx="60" cy="22" r="14" fill="#F7D2B0"/><rect x="42" y="38" width="36" height="34" rx="8" fill="#5CC08A"/><rect x="30" y="40" width="10" height="40" rx="4" fill="#8FA3B8"/><rect x="80" y="40" width="10" height="40" rx="4" fill="#8FA3B8"/><rect x="46" y="72" width="10" height="22" rx="3" fill="#8FA3B8"/><rect x="64" y="72" width="10" height="22" rx="3" fill="#8FA3B8"/><rect x="34" y="36" width="52" height="8" rx="4" fill="#6B7C93"/>'
  };
  function card(it) {
    const name = it.name || '', svg = ICON[name] || ICON[it.kind] || '';
    return '<div class="fig-card' + (it.kind ? ' k-' + (it.kind === '지레' ? 'lever' : it.kind === '빗면' ? 'slope' : 'other') : '') + (!svg && !it.emoji ? ' text' : '') + (it.on ? ' on' : '') + '">' + (svg ? '<svg class="fig-ico" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>' : it.emoji ? '<div class="fig-emo">' + esc(it.emoji) + '</div>' : '') + '<b>' + esc(name) + '</b>' + (it.kind ? '<span>' + esc(it.kind) + '</span>' : '') + '</div>';
  }
  function tools(o, joiner) { return '<div class="fig-cards">' + (o.items || []).map(card).join(joiner || '') + '</div>'; }

  // ── robot: 입는 로봇이 힘을 더한다 ──
  function robot(o) {
    let s = ground() + who(o.who || '👦', 150, 92, 0.85);
    s += '<g class="o-robot"><rect x="150" y="150" width="16" height="70" rx="6" fill="#8FA3B8"/><rect x="252" y="150" width="16" height="70" rx="6" fill="#8FA3B8"/><rect x="156" y="146" width="106" height="10" rx="5" fill="#6B7C93"/></g>';
    s += box(300, 86, 64, 3) + arrow(343, GY - 90, 'u', o.size || 's');
    return svgWrap(s, 'fig-robot');
  }


  // ════════════════════════════════════════════════════════════════════
  // 22차 「수학 부품」 — 분수·소수·수직선·평면도형·수 모형·세로셈·나눔·배열 (2026-09-28)
  // 그림 문법: 파랑 = 색칠한(쓴) 부분 · 연회색 = 남은 칸 · 주황 = 강조(직각 ㄱ자·수직선 점)
  // ════════════════════════════════════════════════════════════════════
  const BLUE = '#5B8DEF', BLUE2 = '#3E6FCF', REST = '#EEF2F7', REST2 = '#B9C4D2', YEL = '#F5A623', GRN = '#5CC08A', RED = '#F2545B', PURP = '#B98AE0';
  const FONT = 'font-family="Pretendard, sans-serif"';
  const txt = (x, y, t, sz, col, wt, anc) => '<text x="' + x + '" y="' + y + '" text-anchor="' + (anc || 'middle') + '" font-size="' + (sz || 26) + '" font-weight="' + (wt || 800) + '" fill="' + (col || INK) + '" ' + FONT + '>' + esc(t) + '</text>';
  // 분수 표기(세로 쌓기) — "3/4" · "1/3" ; 소수·정수는 그대로
  function fracText(x, y, show, sz) {
    sz = sz || 30; const m = String(show).match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!m) return txt(x, y + sz * 0.35, String(show), sz);
    const w = Math.max(sz * 0.9, String(Math.max(+m[1], +m[2])).length * sz * 0.62);
    return '<g class="o-fr"><text x="' + x + '" y="' + (y - sz * 0.18) + '" text-anchor="middle" font-size="' + sz + '" font-weight="800" fill="' + INK + '" ' + FONT + '>' + esc(m[1]) + '</text><line x1="' + (x - w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="3"/><text x="' + x + '" y="' + (y + sz * 0.98) + '" text-anchor="middle" font-size="' + sz + '" font-weight="800" fill="' + INK + '" ' + FONT + '>' + esc(m[2]) + '</text></g>';
  }
  const fracShow = (o) => o.show != null ? o.show : (o.dec ? '0.' + (o.m | 0) : (o.m | 0) + '/' + (o.n | 0));

  // ── frac: 분수 한 개 — 띠·원·네모(격자) 에 n 칸 중 m 칸 색칠 ──
  function frac(o) {
    const n = Math.max(1, o.n | 0), m = Math.max(0, Math.min(n, o.m | 0)), shape = o.shape || 'bar', col = o.color || BLUE, col2 = o.rest ? YEL : REST;
    let s = ''; const cx = 200, cy = shape === 'bar' ? 116 : 140;
    if (shape === 'circle') {
      const r = o.r || 96; if (n === 1) s += '<circle class="o-slice' + (m ? ' on' : '') + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (m ? col : col2) + '" stroke="#fff" stroke-width="4"/>';
      for (let i = 0; i < n && n > 1; i++) { const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n; const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1); s += '<path class="o-slice' + (i < m ? ' on' : '') + '" d="M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + (n === 2 ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z" fill="' + (i < m ? col : col2) + '" stroke="#fff" stroke-width="4"/>'; }
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    } else if (shape === 'square') {
      const cols = o.cols || (n === 4 ? 2 : n === 9 ? 3 : n === 6 ? 3 : n === 8 ? 4 : Math.min(n, 5)), rows = Math.ceil(n / cols), size = 200, cw = size / cols, ch = size / rows, x0 = cx - size / 2, y0 = cy - size / 2;
      for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); s += '<rect class="o-slice' + (i < m ? ' on' : '') + '" x="' + (x0 + c * cw) + '" y="' + (y0 + r * ch) + '" width="' + cw + '" height="' + ch + '" fill="' + (i < m ? col : col2) + '" stroke="#fff" stroke-width="4"/>'; }
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + size + '" height="' + size + '" fill="none" stroke="' + INK + '" stroke-width="4" rx="6"/>';
    } else { // bar
      const bw = 340, bh = 72, x0 = 30, y0 = cy - bh / 2, cw = bw / n;
      for (let i = 0; i < n; i++) s += '<rect class="o-slice' + (i < m ? ' on' : '') + '" x="' + (x0 + i * cw) + '" y="' + y0 + '" width="' + cw + '" height="' + bh + '" fill="' + (i < m ? col : col2) + '" stroke="#fff" stroke-width="4"/>';
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + bw + '" height="' + bh + '" fill="none" stroke="' + INK + '" stroke-width="4" rx="8"/>';
      if (o.whole !== false && n > 1) s += '<path d="M' + x0 + ' ' + (y0 - 18) + 'v-10h' + bw + 'v10" fill="none" stroke="' + REST2 + '" stroke-width="3"/>' + txt(cx, y0 - 34, o.wholeLabel || '전체 1', 20, '#6B7C93');
      if (o.rest) s += txt(x0 + cw * m / 2, y0 + bh + 34, o.onLabel || '쓴 부분', 22, BLUE2) + txt(x0 + cw * (m + (n - m) / 2), y0 + bh + 34, o.restLabel || '남은 부분', 22, '#B07A10');
    }
    if (o.show !== false) s += fracText(shape === 'bar' ? 400 : 356, shape === 'bar' ? cy : 140, fracShow(o), 34);
    return svgWrap(s, 'fig-frac ' + shape, shape === 'bar' ? '0 0 460 200' : '0 0 460 280');
  }
  // ── fracs: 같은 길이 띠 여러 줄(위아래) — 크기 견주기 ──
  function fracs(o) {
    const items = o.items || []; const rowH = 92, top = 36; const H2 = top + items.length * rowH + 4;
    let s = '';
    items.forEach((it, i) => {
      const n = Math.max(1, it.n | 0), m = Math.max(0, Math.min(n, it.m | 0)), y0 = top + i * rowH, bw = 300, bh = 56, x0 = 24, cw = bw / n, col = it.color || (i === 0 ? BLUE : i === 1 ? GRN : PURP);
      for (let k = 0; k < n; k++) s += '<rect class="o-slice' + (k < m ? ' on' : '') + '" x="' + (x0 + k * cw) + '" y="' + y0 + '" width="' + cw + '" height="' + bh + '" fill="' + (k < m ? col : REST) + '" stroke="#fff" stroke-width="3"/>';
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + bw + '" height="' + bh + '" fill="none" stroke="' + INK + '" stroke-width="3" rx="6"/>';
      s += fracText(392, y0 + bh / 2, it.show != null ? it.show : (it.dec ? '0.' + m : m + '/' + n), 28);
    });
    if (o.cmp) s += txt(392, top + rowH - 12, o.cmp, 30, ORANGE, 900);
    return svgWrap(s, 'fig-fracs', '0 0 460 ' + H2);
  }
  // ── numline: 0~1 수직선(n 등분) · 점 찍기 ──
  function numline(o) {
    const n = Math.max(1, o.n | 0), x0 = 40, x1 = 420, y = 150, w = x1 - x0; let s = '';
    s += '<line x1="' + (x0 - 20) + '" y1="' + y + '" x2="' + (x1 + 20) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="4"/><path d="M' + (x1 + 20) + ' ' + y + ' l-12 -8 v16 Z" fill="' + INK + '"/>';
    for (let i = 0; i <= n; i++) { const x = x0 + w * i / n, big = i === 0 || i === n; s += '<line x1="' + x + '" y1="' + (y - (big ? 18 : 10)) + '" x2="' + x + '" y2="' + (y + (big ? 18 : 10)) + '" stroke="' + INK + '" stroke-width="' + (big ? 4 : 3) + '"/>'; }
    s += txt(x0, y + 50, '0', 26) + txt(x1, y + 50, '1', 26);
    if (o.dec && n === 10) for (let i = 1; i < n; i++) s += txt(x0 + w * i / n, y + 44, '0.' + i, 17, '#6B7C93', 700);
    (o.marks || []).forEach((mk, j) => { const at = typeof mk.at === 'string' && /\//.test(mk.at) ? (+mk.at.split('/')[0]) / (+mk.at.split('/')[1]) : +mk.at; const x = x0 + w * at; const col = j === 0 ? ORANGE : j === 1 ? GRN : PURP; s += '<circle class="o-mark" cx="' + x + '" cy="' + y + '" r="11" fill="' + col + '" stroke="#fff" stroke-width="3"/>' + (mk.label ? fracText(x, y - 62 - (j % 2 ? 0 : 0), mk.label, 26) : ''); if (o.hop && j === 0) { for (let i = 0; i < Math.round(at * n); i++) { const a = x0 + w * i / n, b = x0 + w * (i + 1) / n; s += '<path d="M' + a + ' ' + (y - 2) + ' Q' + ((a + b) / 2) + ' ' + (y - 34) + ' ' + b + ' ' + (y - 2) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>'; } } });
    return svgWrap(s, 'fig-numline');
  }
  // ── tenbox: 10칸 판(소수 0.n) ──
  function tenbox(o) { const m = Math.max(0, Math.min(10, o.m | 0)); let s = ''; const x0 = 40, y0 = 96, cw = 38, ch = 88; for (let i = 0; i < 10; i++) s += '<rect class="o-slice' + (i < m ? ' on' : '') + '" x="' + (x0 + i * cw) + '" y="' + y0 + '" width="' + cw + '" height="' + ch + '" fill="' + (i < m ? BLUE : REST) + '" stroke="#fff" stroke-width="3"/>'; s += '<rect x="' + x0 + '" y="' + y0 + '" width="380" height="' + ch + '" fill="none" stroke="' + INK + '" stroke-width="4" rx="8"/>' + txt(230, 60, o.top != null ? o.top : ('0.1이 ' + m + '개 = 0.' + m), 26); if (o.show !== false) s += txt(230, 236, (o.show != null ? o.show : '10분의 ' + m + ' = 0.' + m), 24, BLUE2); return svgWrap(s, 'fig-tenbox'); }

  // ── geo: 평면도형 ── type segment·ray·line·angle·tri·rect·square·list
  const KO = (i) => ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'][i] || '';
  function pt(x, y, lab, below) { return '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + INK + '"/>' + (lab ? txt(x, y + (below ? 38 : -18), lab, 26) : ''); }
  function rightMark(vx, vy, ax, ay, bx, by, sz) { sz = sz || 22; const ua = Math.atan2(ay - vy, ax - vx), ub = Math.atan2(by - vy, bx - vx); const p1 = [vx + sz * Math.cos(ua), vy + sz * Math.sin(ua)], p2 = [vx + sz * Math.cos(ub), vy + sz * Math.sin(ub)], p3 = [p1[0] + p2[0] - vx, p1[1] + p2[1] - vy]; return '<path class="o-right" d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' L' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + ' L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + '" fill="none" stroke="' + ORANGE + '" stroke-width="5" stroke-linejoin="round"/>'; }
  function poly(pts, col, extra) { return '<polygon points="' + pts.map(p => p[0] + ',' + p[1]).join(' ') + '" fill="' + (col || '#DCE8FB') + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"' + (extra || '') + '/>'; }
  function shapeSvg(sh, cx, cy, sc) { // 작은 도형 하나(목록용)
    sc = sc || 1; const t = sh.t || 'tri'; let pts; const rot = sh.rot || 0;
    if (t === 'tri') pts = sh.right !== false ? [[-50, 40], [-50, -40], [50, 40]] : [[-50, 40], [0, -44], [50, 40]];
    else if (t === 'rect') pts = [[-60, -34], [60, -34], [60, 34], [-60, 34]];
    else if (t === 'square') pts = [[-42, -42], [42, -42], [42, 42], [-42, 42]];
    else if (t === 'quad') pts = [[-56, 30], [-30, -36], [50, -30], [40, 36]];
    else if (t === 'seg') return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')"><line x1="-50" y1="0" x2="50" y2="0" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/></g>';
    else pts = [[-50, 40], [0, -44], [50, 40]];
    const R = (p) => { const a = rot * Math.PI / 180; return [cx + sc * (p[0] * Math.cos(a) - p[1] * Math.sin(a)), cy + sc * (p[0] * Math.sin(a) + p[1] * Math.cos(a))]; };
    const P = pts.map(R); let s = poly(P.map(p => [p[0].toFixed(1), p[1].toFixed(1)]), sh.color || (t === 'square' ? '#FFE8C2' : t === 'rect' ? '#DCE8FB' : t === 'tri' ? '#DFF5E6' : '#F0E4FA'));
    if (t === 'tri' && sh.right !== false) s += rightMark(P[1][0], P[1][1], P[0][0], P[0][1], P[2][0], P[2][1], 18 * sc);
    if (t === 'rect' || t === 'square') for (let i = 0; i < 4; i++) { const v = P[i], a = P[(i + 3) % 4], b = P[(i + 1) % 4]; if (sh.marks !== false) s += rightMark(v[0], v[1], a[0], a[1], b[0], b[1], 16 * sc); }
    if (t === 'square' && sh.eq !== false) for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = (b[0] - a[0]), dy = (b[1] - a[1]), L = Math.hypot(dx, dy); s += '<line x1="' + (mx - dy / L * 7) + '" y1="' + (my + dx / L * 7) + '" x2="' + (mx + dy / L * 7) + '" y2="' + (my - dx / L * 7) + '" stroke="' + RED + '" stroke-width="4"/>'; }
    if (sh.q) s += q(cx + 60 * sc, cy - 50 * sc);
    return s;
  }
  function geo(o) {
    const t = o.type || 'segment'; let s = ''; const a = [90, 150], b = [370, 150];
    const dash = (x1, y1, x2, y2) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + INK + '" stroke-width="4" stroke-dasharray="14 10"/>';
    const solid = (x1, y1, x2, y2) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
    const head = (x, y, dir) => '<path d="M' + x + ' ' + y + ' l' + (dir * -16) + ' -10 v20 Z" fill="' + INK + '"/>';
    if (t === 'segment') { s += solid(a[0], a[1], b[0], b[1]) + pt(a[0], a[1], KO(0)) + pt(b[0], b[1], KO(1)) + txt(230, 224, o.name || '선분 ㄱㄴ', 30, BLUE2); }
    else if (t === 'ray') { s += solid(a[0], a[1], b[0], b[1]) + dash(b[0], b[1], 438, 150) + head(452, 150, 1) + pt(a[0], a[1], KO(0)) + pt(b[0], b[1], KO(1)) + txt(230, 224, o.name || '반직선 ㄱㄴ', 30, BLUE2) + txt(90, 92, '시작', 18, ORANGE); }
    else if (t === 'line') { s += solid(a[0], a[1], b[0], b[1]) + dash(b[0], b[1], 438, 150) + head(452, 150, 1) + dash(a[0], a[1], 22, 150) + head(8, 150, -1) + pt(a[0], a[1], KO(0)) + pt(b[0], b[1], KO(1)) + txt(230, 224, o.name || '직선 ㄱㄴ', 30, BLUE2); }
    else if (t === 'three') { // 선분·반직선·직선 한눈에
      const rows = [['선분 ㄱㄴ', 0, 0], ['반직선 ㄱㄴ', 0, 1], ['직선 ㄱㄴ', 1, 1]];
      rows.forEach((r, i) => { const y = 60 + i * 86, x1 = 150, x2 = 330; s += solid(x1, y, x2, y) + (r[1] ? dash(x1, y, 92, y) + head(80, y, -1) : '') + (r[2] ? dash(x2, y, 388, y) + head(400, y, 1) : '') + pt(x1, y, 'ㄱ') + pt(x2, y, 'ㄴ') + txt(60, y + 10, r[0], 22, BLUE2, 800, 'end'); });
      s = s.replace(/text-anchor="end"/g, 'text-anchor="middle"');
    }
    else if (t === 'angle') { const v = [150, 210], p1 = [400, 210], p2 = [300, 40]; const right = !!o.right; if (right) { p2[0] = 150; p2[1] = 40; }
      s += solid(v[0], v[1], p1[0], p1[1]) + solid(v[0], v[1], p2[0], p2[1]) + dash(p1[0], p1[1], 440, 210) + head(452, 210, 1) + dash(p2[0], p2[1], right ? 150 : 274, right ? 8 : 4);
      if (right) s += rightMark(v[0], v[1], p1[0], p1[1], p2[0], p2[1], 30); else if (o.arc !== false) s += '<path d="M' + (v[0] + 46) + ' ' + v[1] + ' A46 46 0 0 0 ' + (v[0] + 46 * Math.cos(Math.atan2(p2[1] - v[1], p2[0] - v[0]))).toFixed(1) + ' ' + (v[1] + 46 * Math.sin(Math.atan2(p2[1] - v[1], p2[0] - v[0]))).toFixed(1) + '" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>';
      const LB = o.labels || 'ㄱㄴㄷ'; s += pt(v[0], v[1], '', true) + txt(v[0], v[1] + 40, LB[1], 26) + pt(p1[0], p1[1], LB[2], true) + pt(p2[0], p2[1], '') + txt(p2[0] + 30, p2[1] + 10, LB[0], 26);
      if (o.parts) s += txt(72, 226, '꼭짓점', 20, ORANGE) + txt(290, 244, '변 ㄴㄷ', 20, BLUE2) + txt(right ? 110 : 190, right ? 120 : 110, '변 ㄴㄱ', 20, BLUE2);
      s += txt(356, right ? 70 : 112, o.name || (right ? '직각 ㄱㄴㄷ' : '각 ㄱㄴㄷ'), 28, BLUE2);
    }
    else if (t === 'fold') { // 종이 두 번 접기 → 직각
      s += '<rect x="30" y="60" width="150" height="150" fill="#FFF7E0" stroke="' + INK + '" stroke-width="3" transform="rotate(-14 105 135)"/>' + txt(105, 246, '① 반듯하게 접고', 18, '#6B7C93') + '<path d="M196 130 l34 0 m-10 -8 l10 8 l-10 8" fill="none" stroke="' + ORANGE + '" stroke-width="4"/>'
        + '<rect x="250" y="70" width="140" height="140" fill="#FFF7E0" stroke="' + INK + '" stroke-width="3"/><path d="M250 140 H390 M320 70 V210" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="8 6"/>' + rightMark(320, 140, 390, 140, 320, 70, 26) + txt(320, 246, '② 또 접으면 직각', 18, '#6B7C93');
    }
    else if (t === 'setsquare') { s += '<polygon points="60,220 300,220 60,40" fill="#FDE9C8" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><polygon points="100,196 220,196 100,100" fill="#F4FAFF" stroke="' + INK + '" stroke-width="3"/>' + rightMark(60, 220, 300, 220, 60, 40, 30) + txt(210, 120, '삼각자', 24, INK) + '<path d="M330 90 L420 90 L330 210 Z" fill="#DFF5E6" stroke="' + INK + '" stroke-width="4"/>' + rightMark(330, 90, 420, 90, 330, 210, 20) + txt(390, 240, '맞대어 보기', 20, '#6B7C93'); }
    else if (t === 'list') { const L = o.items || []; const n = L.length, cw = 460 / Math.max(1, n); L.forEach((sh, i) => { s += shapeSvg(sh, cw * i + cw / 2, 122, Math.min(1, 2.2 / n + 0.35)); if (sh.label) s += txt(cw * i + cw / 2, 244, sh.label, 22, '#3B4252'); }); }
    else if (t === 'cat') { // 고양이 — 얼굴 정사각형 · 귀 직각삼각형 2 · 눈 직사각형 2 · 수염 선분 4
      s += '<polygon points="140,110 140,40 200,110" fill="#DFF5E6" stroke="' + INK + '" stroke-width="4"/><polygon points="320,110 320,40 260,110" fill="#DFF5E6" stroke="' + INK + '" stroke-width="4"/>'
        + '<rect x="140" y="110" width="180" height="150" fill="#FFE8C2" stroke="' + INK + '" stroke-width="4"/>'
        + '<rect x="170" y="150" width="46" height="26" fill="#DCE8FB" stroke="' + INK + '" stroke-width="3"/><rect x="244" y="150" width="46" height="26" fill="#DCE8FB" stroke="' + INK + '" stroke-width="3"/>'
        + '<path d="M60 190 H136 M60 220 H136 M324 190 H400 M324 220 H400" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="230" cy="205" r="8" fill="' + RED + '"/>';
      if (o.count) s += txt(230, 26, '정사각형 1 · 직각삼각형 2 · 직사각형 2 · 선분 4', 20, BLUE2);
    }
    return svgWrap(s, 'fig-geo ' + t);
  }

  // ── bt: 수 모형(백 판·십 막대·낱개) ──
  function btBlocks(x, y, h, t, u, sc) {
    sc = sc || 1; let s = ''; const cell = 9 * sc; let cx = x;
    for (let i = 0; i < h; i++) { s += '<g class="o-hund"><rect x="' + cx + '" y="' + y + '" width="' + (cell * 10) + '" height="' + (cell * 10) + '" fill="#FFB8A6" stroke="' + INK + '" stroke-width="2"/>'; for (let k = 1; k < 10; k++) s += '<path d="M' + (cx + k * cell) + ' ' + y + 'v' + (cell * 10) + 'M' + cx + ' ' + (y + k * cell) + 'h' + (cell * 10) + '" stroke="rgba(0,0,0,.25)" stroke-width="1"/>'; s += '</g>'; cx += cell * 10 + 8; }
    cx += h ? 10 : 0;
    for (let i = 0; i < t; i++) { s += '<g class="o-ten"><rect x="' + cx + '" y="' + y + '" width="' + cell + '" height="' + (cell * 10) + '" fill="#8ED08A" stroke="' + INK + '" stroke-width="2"/>'; for (let k = 1; k < 10; k++) s += '<path d="M' + cx + ' ' + (y + k * cell) + 'h' + cell + '" stroke="rgba(0,0,0,.25)" stroke-width="1"/>'; s += '</g>'; cx += cell + 6; }
    cx += t ? 12 : 0;
    for (let i = 0; i < u; i++) { const col = i % 5, row = Math.floor(i / 5); s += '<rect class="o-one" x="' + (cx + col * (cell + 3)) + '" y="' + (y + row * (cell + 3)) + '" width="' + cell + '" height="' + cell + '" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>'; }
    return s;
  }
  function bt(o) {
    const n = Math.max(0, o.n | 0), h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, u = n % 10; let s = '';
    const need = (k) => h * (90 * k + 8) + (h ? 10 : 0) + t * (9 * k + 6) + (t ? 12 : 0) + (u ? 5 * (9 * k + 3) : 0); let sc = 1.4; while (sc > 0.3 && need(sc) > 424) sc -= 0.05;
    s += btBlocks(24, 78, h, t, u, sc) + txt(230, 46, String(n), 34);
    if (o.split !== false) s += txt(230, 236, '백 ' + h + ' · 십 ' + t + ' · 일 ' + u, 24, BLUE2);
    if (o.tag) s += txt(230, 264, o.tag, 20, '#6B7C93');
    return svgWrap(s, 'fig-bt');
  }
  // ── regroup: 낱개 10개 → 십 막대 1개 / 십 막대 1개 → 낱개 10개 ──
  function regroup(o) {
    let s = ''; const down = o.dir === 'down';
    if (!down) { s += btBlocks(30, 90, 0, 0, 10, 1.5) + '<path d="M180 140 l70 0 m-16 -12 l16 12 l-16 12" fill="none" stroke="' + ORANGE + '" stroke-width="6"/>' + btBlocks(300, 90, 0, 1, 0, 1.5) + txt(100, 64, '낱개 10개', 22) + txt(320, 64, '십 모형 1개', 22) + txt(230, 262, o.label || '10개가 되면 한 묶음으로 — 받아올림', 22, BLUE2); }
    else { s += btBlocks(80, 90, 0, 1, 0, 1.5) + '<path d="M140 140 l70 0 m-16 -12 l16 12 l-16 12" fill="none" stroke="' + ORANGE + '" stroke-width="6"/>' + btBlocks(240, 90, 0, 0, 10, 1.5) + txt(90, 64, '십 모형 1개', 22) + txt(310, 64, '낱개 10개', 22) + txt(230, 262, o.label || '한 묶음을 풀어 낱개로 — 받아내림', 22, BLUE2); }
    return svgWrap(s, 'fig-regroup');
  }
  // ── vert: 세로셈(HTML) — a op b, 받아올림·받아내림 표시 자동 ──
  function vert(o) {
    const a = +o.a, b = +o.b, op = o.op || '+', W3 = 3, A = String(a).padStart(W3, ' ').split(''), B = String(b).padStart(W3, ' ').split('');
    let res = '', carry = [], borrow = [];
    if (op === '+') { let c = 0; const R = []; for (let i = W3 - 1; i >= 0; i--) { const s = (+A[i] || 0) + (+B[i] || 0) + c; R.unshift(s % 10); c = s >= 10 ? 1 : 0; carry[i] = c; } if (c) R.unshift(1); res = String(+R.join('')); }
    else { let br = 0; const R = []; const AA = A.map(x => +x || 0); for (let i = W3 - 1; i >= 0; i--) { let d = AA[i] - br - (+B[i] || 0); br = 0; if (d < 0) { d += 10; br = 1; borrow[i] = true; } R.unshift(d); } res = String(+R.join('')); }
    const cells = (arr, cls) => '<div class="vt-row ' + cls + '">' + arr.map(x => '<span>' + esc(x.trim()) + '</span>').join('') + '</div>';
    const top = '<div class="vt-row vt-carry">' + [0, 1, 2].map(i => '<span>' + (op === '+' && carry[i + 1] ? '1' : op === '−' && borrow[i + 1] ? '<i>' + ((+A[i] || 0) - 1) + '</i>' : '') + '</span>').join('') + '</div>';
    const sign = op === '+' ? '+' : '−';
    const R = String(res).padStart(W3, ' ').split('');
    let h = '<div class="vt' + (o.steps === 'ones' ? ' only-ones' : '') + '">' + top + cells(A, 'vt-a') + cells(B, 'vt-b').replace('<div class="vt-row vt-b">', '<div class="vt-row vt-b"><em>' + sign + '</em>') + '<div class="vt-line"></div>' + (o.answer === false ? '' : cells(R, 'vt-r')) + '</div>';
    return '<div class="fig-vert">' + h + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  // ── share: 접시에 똑같이 나누기 · bundle: 몇 개씩 묶기 · arr: 배열 ──
  function candy(x, y, col) { return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="' + (col || RED) + '" stroke="#fff" stroke-width="2"/>'; }
  function share(o) { const total = o.total | 0, g = Math.max(1, o.groups | 0), each = Math.floor(total / g); let s = ''; const pw = 440 / g; for (let i = 0; i < g; i++) { const cx = 10 + pw * i + pw / 2; s += '<ellipse cx="' + cx + '" cy="150" rx="' + Math.min(70, pw / 2 - 8) + '" ry="34" fill="#fff" stroke="' + REST2 + '" stroke-width="4"/>'; for (let k = 0; k < each; k++) s += candy(cx - (each - 1) * 11 + k * 22, 148); s += txt(cx, 214, o.each !== false ? each + '개' : '?', 22, BLUE2); } s += txt(230, 44, (o.label || (total + '개를 ' + g + (o.unit || '접시') + '에 똑같이')), 24); return svgWrap(s, 'fig-share'); }
  function bundle(o) { const total = o.total | 0, k = Math.max(1, o.per | 0), g = Math.floor(total / k); let s = ''; const bw = 440 / g; for (let i = 0; i < g; i++) { const cx = 10 + bw * i + bw / 2; s += '<rect x="' + (cx - Math.min(60, bw / 2 - 6)) + '" y="96" width="' + (2 * Math.min(60, bw / 2 - 6)) + '" height="96" rx="16" fill="#FFF7E0" stroke="' + YEL + '" stroke-width="4" stroke-dasharray="10 6"/>'; for (let j = 0; j < k; j++) { const col = j % 3, row = Math.floor(j / 3); s += candy(cx - 22 + col * 22, 122 + row * 24); } } s += txt(230, 44, o.label || (total + '개를 ' + k + '개씩 묶으면 ' + g + '묶음'), 24) + txt(230, 240, g + '묶음', 26, BLUE2); return svgWrap(s, 'fig-bundle'); }
  function arr(o) { const r = Math.max(1, o.r | 0), c = Math.max(1, o.c | 0); let s = ''; const cw = Math.min(46, 380 / c), ch = Math.min(46, 170 / r), x0 = 230 - c * cw / 2, y0 = 130 - r * ch / 2; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) s += candy(x0 + j * cw + cw / 2, y0 + i * ch + ch / 2, o.color || BLUE); if (o.rows) s += '<path d="M' + (x0 - 14) + ' ' + y0 + 'h-10v' + (r * ch) + 'h10" fill="none" stroke="' + ORANGE + '" stroke-width="4"/>' + txt(x0 - 40, y0 + r * ch / 2 + 8, r + '줄', 22, ORANGE); if (o.cols) s += '<path d="M' + x0 + ' ' + (y0 + r * ch + 14) + 'v10h' + (c * cw) + 'v-10" fill="none" stroke="' + GRN + '" stroke-width="4"/>' + txt(230, y0 + r * ch + 50, c + '씩', 22, GRN); s += txt(230, 44, o.label || (r + ' × ' + c + ' = ' + r * c), 26); return svgWrap(s, 'fig-arr'); }

  // ── mulrows: (몇십몇)×(몇) — 십 막대(가로)·낱개를 b 줄로 늘어놓아 부분 곱을 보인다 ──
  function mulrows(o) {
    const a = Math.max(1, o.a | 0), b = Math.max(1, o.b | 0), t = Math.floor(a / 10), u = a % 10; const cell = Math.min(16, 360 / (t * 10 + u + (t ? 1 : 0)));
    const rowH = cell + 12, y0 = 78, x0 = 230 - (t * 10 * cell + (t ? cell : 0) + u * cell + (t && u ? 12 : 0)) / 2; let s = '';
    for (let r = 0; r < b; r++) { const y = y0 + r * rowH; let x = x0; for (let i = 0; i < t; i++) { s += '<g class="o-ten"><rect x="' + x + '" y="' + y + '" width="' + (cell * 10) + '" height="' + cell + '" fill="#8ED08A" stroke="' + INK + '" stroke-width="1.5"/>'; for (let k = 1; k < 10; k++) s += '<line x1="' + (x + k * cell) + '" y1="' + y + '" x2="' + (x + k * cell) + '" y2="' + (y + cell) + '" stroke="rgba(0,0,0,.25)" stroke-width="1"/>'; s += '</g>'; x += cell * 10 + (i === t - 1 ? 12 : 2); }
      for (let i = 0; i < u; i++) { s += '<rect class="o-one" x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.5"/>'; x += cell + 2; } }
    const tw = t * 10 * cell + (t - 1) * 2; if (t) s += txt(x0 + tw / 2, y0 - 12, (t * 10) + ' × ' + b + ' = ' + (t * 10 * b), 22, GRN); if (u) s += txt(x0 + tw + 12 + u * (cell + 2) / 2, y0 - 12, u + ' × ' + b + ' = ' + (u * b), 22, '#B07A10');
    s += txt(230, 40, a + ' × ' + b, 30) + txt(230, y0 + b * rowH + 34, (t ? (t * 10 * b) + ' + ' + (u * b) + ' = ' : '') + '**' + (a * b) + '**'.replace(/\*\*/g, ''), 26, BLUE2).replace(/\*\*/g, '');
    return svgWrap(s, 'fig-mulrows', '0 0 460 ' + (y0 + b * rowH + 56));
  }
  // ── eq: 큰 식 카드(SVG 글자만) ──
  function eq(o) { const lines = [].concat(o.lines || o.text || []); let s = ''; const n = lines.length, gap = Math.min(64, 220 / Math.max(1, n)); lines.forEach((t, i) => { const hi = /\*\*/.test(t); s += txt(230, 140 - (n - 1) * gap / 2 + i * gap + 10, String(t).replace(/\*\*/g, ''), n > 3 ? 26 : 34, hi ? BLUE2 : INK); }); if (o.tag) s += txt(230, 250, o.tag, 20, '#6B7C93'); return svgWrap(s, 'fig-eq'); }

  // ══ 23차(2026-09-28) 길이·시간 부품 — ruler(자)·joins(이어 붙여 어림)·road(거리 띠·km 표지판)·clock(시계)·tvert(시간 세로셈) ══
  // 그림 문법 그대로: 파랑 = 잰 것 · 연회색 = 눈금 · 주황 = 강조(1 mm 한 칸·초바늘·1초 한 칸·받아올림).
  // ── ruler: cm·mm 눈금 자. obj {cm,mm,name} 가 있으면 그 길이만큼 파란 막대를 자 위에 올린다. zoom 은 1 cm 를 10칸으로 크게 ──
  function ruler(o) {
    let s = '';
    if (o.zoom) { // 1 cm 를 크게 — 작은 눈금 10칸, 한 칸(주황) = 1 mm
      const x0 = 60, x1 = 400, y = 96, cw = (x1 - x0) / 10, at = o.at == null ? 3 : o.at;
      s += '<rect x="20" y="' + (y - 4) + '" width="420" height="70" rx="8" fill="#FFF7DE" stroke="#E2C98F" stroke-width="3"/>';
      s += '<rect class="o-mm on" x="' + (x0 + cw * at) + '" y="' + (y - 4) + '" width="' + cw + '" height="70" fill="#FFD9C2"/>';
      for (let i = 0; i <= 10; i++) { const x = x0 + cw * i, big = i === 0 || i === 10, mid = i === 5; s += '<line class="o-tick' + (big ? ' big' : '') + '" x1="' + x + '" y1="' + (y - 4) + '" x2="' + x + '" y2="' + (y + (big ? 50 : mid ? 36 : 24)) + '" stroke="' + INK + '" stroke-width="' + (big ? 4 : 2.5) + '"/>'; }
      s += txt(x0, y - 16, o.left == null ? '0' : String(o.left), 24) + txt(x1, y - 16, o.right == null ? '1' : String(o.right), 24) + txt(436, y + 60, 'cm', 18, '#6B7C93', 800, 'end');
      s += '<path d="M' + x0 + ' ' + (y - 40) + 'v-10h' + (x1 - x0) + 'v10" fill="none" stroke="' + BLUE2 + '" stroke-width="3"/>' + txt((x0 + x1) / 2, y - 58, o.topLabel || '1 cm', 28, BLUE2);
      const ax = x0 + cw * (at + 0.5); s += arrow(ax, y + 108, 'u', 's').replace('data-len', 'data-mm="1" data-len') + txt(230, y + 136, o.cellLabel || '작은 눈금 한 칸 = 1 mm', 24, ORANGE, 900);
      if (o.show !== false) s += txt(230, 262, o.show || '1 cm = 10 mm', 30, INK);
      return svgWrap(s, 'fig-ruler zoom', '0 0 460 280');
    }
    const obj = o.obj || null; const cm = obj ? (obj.cm | 0) : 0, mm = obj ? (obj.mm | 0) : 0; const len = cm + mm / 10;
    const from = o.from != null ? o.from | 0 : (obj && len > 3 && len <= 12 ? Math.max(0, Math.floor(len) - 1) : 0); // 12 cm 넘으면 0 부터(5 mm 눈금·5 cm 마다 숫자)
    const to = o.to != null ? o.to | 0 : Math.max(from + 3, Math.ceil(len + 0.001));
    const span = Math.max(1, to - from), x0 = 40, x1 = 420, y = 160, pw = (x1 - x0) / span, fine = span <= 6, every = span > 10 ? 5 : 1; // 6 cm 넘으면 mm 눈금은 5 mm 만 · 10 cm 넘으면 숫자는 5 cm 마다
    const X = (v) => x0 + (v - from) * pw;
    s += '<rect x="' + (x0 - 24) + '" y="' + (y - 4) + '" width="' + (x1 - x0 + 48) + '" height="64" rx="8" fill="#FFF7DE" stroke="#E2C98F" stroke-width="3"/>';
    for (let i = 0; i <= span; i++) { const x = X(from + i); s += '<line class="o-tick big" x1="' + x + '" y1="' + (y - 4) + '" x2="' + x + '" y2="' + (y + 40) + '" stroke="' + INK + '" stroke-width="' + (every > 1 && (from + i) % every ? 2 : 3.5) + '"/>' + ((from + i) % every === 0 ? txt(x, y + 58 - 4, String(from + i), 20, INK, 800) : '');
      if (i < span) for (let k = 1; k < 10; k++) { if (!fine && k !== 5) continue; const xx = X(from + i + k / 10); s += '<line class="o-tick" x1="' + xx + '" y1="' + (y - 4) + '" x2="' + xx + '" y2="' + (y + (k === 5 ? 26 : 16)) + '" stroke="' + INK + '" stroke-width="' + (k === 5 ? 2.5 : 1.8) + '"/>'; } }
    s += txt(x1 + 30, y + 30, 'cm', 20, '#6B7C93', 800, 'end');
    if (obj) { // 잰 것 — 파란 막대(자 위) · 자 밖에서 시작하면 잘린 표시
      const xs = len > 0 && from > 0 ? x0 - 24 : X(0), xe = X(len), yb = y - 62, hb = 40;
      s += '<rect class="o-obj" x="' + xs + '" y="' + yb + '" width="' + Math.max(6, xe - xs) + '" height="' + hb + '" rx="12" fill="' + BLUE + '" stroke="' + BLUE2 + '" stroke-width="3"/>';
      if (from > 0) s += '<path d="M' + (xs + 4) + ' ' + (yb - 6) + ' l6 12 l-6 12 l6 12 l-6 12 l6 12" stroke="#fff" stroke-width="4" fill="none"/>';
      if (obj.name) s += txt((xs + xe) / 2, yb + 27, obj.name, 22, '#fff', 900);
      if (mm) { const xc = X(cm); s += '<path class="o-mmspan" d="M' + xc + ' ' + (yb - 10) + 'v-12h' + (xe - xc) + 'v12" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>' + txt((xc + xe) / 2, yb - 30, mm + ' mm', 22, ORANGE, 900);
        s += txt((xs + xc) / 2, yb - 30, (from > 0 ? '' : '') + cm + ' cm', 22, BLUE2, 900); }
      else s += txt((xs + xe) / 2, yb - 12, cm + ' cm', 22, BLUE2, 900);
      s += '<line x1="' + xe + '" y1="' + (yb + hb) + '" x2="' + xe + '" y2="' + (y + 40) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="6 5"/>';
    }
    if (o.show) s += txt(230, 250, o.show, 30, INK);
    return svgWrap(s, 'fig-ruler', '0 0 460 ' + (o.show ? 270 : 230));
  }
  // ── joins: 아는 길이를 이어 붙여 어림 — items [{name, cm, emoji}] 또는 rep {name, cm, n}(같은 것 n 번) · total 글자(약 ○ cm) ──
  function joins(o) {
    const items = o.rep ? Array.from({ length: Math.max(1, o.rep.n | 0) }, () => ({ name: o.rep.name, cm: o.rep.cm })) : (o.items || []);
    const sum = items.reduce((a, b) => a + (+b.cm || 0), 0) || 1; const x0 = 30, x1 = 430, y = 130, h = 54; let s = '', x = x0;
    const cols = [BLUE, GRN, PURP, YEL];
    items.forEach((it, i) => { const w = (x1 - x0) * (+it.cm || 0) / sum; const many = items.length > 6;
      s += '<rect class="o-join" x="' + x + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (many ? 6 : 12) + '" fill="' + (o.rep ? (i % 2 ? '#F7D2B0' : '#EDB98C') : cols[i % 4]) + '" stroke="#fff" stroke-width="3"/>';
      if (!many) s += txt(x + w / 2, y - h / 2 - 12, it.name + (it.cm != null ? ' 약 ' + it.cm + ' cm' : ''), 22, INK, 800);
      x += w; });
    if (o.rep) s += txt(230, y - h / 2 - 14, o.rep.name + ' 약 ' + o.rep.cm + ' cm × ' + items.length + '번', 24, INK, 800);
    s += '<path d="M' + x0 + ' ' + (y + h / 2 + 12) + 'v10h' + (x1 - x0) + 'v-10" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>' + txt(230, y + h / 2 + 52, o.total || ('약 ' + sum + ' cm'), 32, ORANGE, 900);
    if (o.note) s += txt(230, y + h / 2 + 84, o.note, 20, '#6B7C93', 700);
    return svgWrap(s, 'fig-joins', '0 0 460 ' + (o.note ? 230 : 210));
  }
  // ── road: 거리 띠 — unit(m)씩 n 칸, 1000 m 마다 km 표지 · sign(표지판 글자) · est(어림) ──
  function road(o) {
    const unit = Math.max(1, o.unit | 0 || 100), n = Math.max(1, o.n | 0 || Math.ceil(((o.km | 0) * 1000 + (o.m | 0)) / unit)), total = o.total != null ? o.total | 0 : ((o.km != null || o.m != null) ? (o.km | 0) * 1000 + (o.m | 0) : 0);
    const x0 = 36, x1 = 384, y = 132, w = x1 - x0, X = (mt) => x0 + w * mt / (unit * n); let s = '';
    s += '<rect x="' + (x0 - 10) + '" y="' + (y - 26) + '" width="' + (w + 20) + '" height="52" rx="10" fill="#8C9BAA"/><line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#fff" stroke-width="4" stroke-dasharray="14 12"/>';
    if (total) s += '<rect class="o-dist" x="' + x0 + '" y="' + (y - 12) + '" width="' + (X(Math.min(total, unit * n)) - x0) + '" height="24" rx="6" fill="' + BLUE + '" opacity=".85"/>';
    const hasKm = unit * n >= 1000, every = n <= 5 ? 1 : n <= 10 ? 2 : hasKm ? 0 : 5; // 칸이 많고 km 표지가 있으면 사이 숫자는 생략
    for (let i = 0; i <= n; i++) { const mt = i * unit, x = X(mt), km = mt % 1000 === 0 && mt > 0, end = i === n; const lab = i === 0 || km || end || (every && i % every === 0);
      s += '<line class="o-rtick' + (km ? ' km' : '') + '" x1="' + x + '" y1="' + (y - 34) + '" x2="' + x + '" y2="' + (y + 34) + '" stroke="' + (km ? ORANGE : INK) + '" stroke-width="' + (km ? 5 : lab ? 3 : 1.5) + '"' + (km || lab ? '' : ' opacity=".55"') + '/>';
      if (!lab) continue; const t = km ? (o.est ? '약 ' : '') + (mt / 1000) + ' km' : (i === 0 ? '0' : (o.est ? '약 ' : '') + mt + ' m'); s += txt(x, y + 60, t, km ? 24 : 18, km ? ORANGE : INK, 800); }
    if (o.est && n <= 6) for (let i = 0; i < n; i++) s += txt(X(i * unit + unit / 2), y - 44, '약 ' + unit + ' m', 20, BLUE2, 800);
    if (o.sign) { const sw = Math.max(96, String(o.sign).length * 12 + 24), sx = Math.min(460 - sw - 4, x1 - sw / 2); s += '<rect x="' + (x1 - 4) + '" y="' + (y - 22) + '" width="8" height="60" fill="#8A6A4A"/><rect x="' + sx + '" y="' + (y - 78) + '" width="' + sw + '" height="48" rx="8" fill="#2E7D4F" stroke="#fff" stroke-width="3"/>' + txt(sx + sw / 2, y - 46, o.sign, 22, '#fff', 900); }
    if (o.label) s += txt(230, 34, o.label, 28, INK, 900);
    if (o.show) s += txt(230, 232, o.show, 28, INK, 800);
    return svgWrap(s, 'fig-road', '0 0 460 ' + (o.show ? 254 : 206));
  }
  // ── clock: 시계(시·분·초바늘) — hi 'tick'(작은 눈금 한 칸 = 1초) · 'big'(큰 눈금 한 칸 = 5초) · 'round'(한 바퀴 = 60초) · names(바늘 이름) ──
  function clock(o) {
    const cx = 230, cy = 140, r = o.r || 112, h = +o.h || 0, m = +o.m || 0, sec = +o.s || 0, hasSec = o.sec !== false; let s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 12) + '" fill="#fff" stroke="' + INK + '" stroke-width="5"/>';
    const P = (deg, rr) => [cx + rr * Math.sin(deg * Math.PI / 180), cy - rr * Math.cos(deg * Math.PI / 180)];
    const arc = (d0, d1, rr, col, wd) => { const a = P(d0, rr), b = P(d1, rr); return '<path class="o-arc" d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A' + rr + ' ' + rr + ' 0 ' + (d1 - d0 > 180 ? 1 : 0) + ' 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="' + wd + '" stroke-linecap="round"/>'; };
    if (o.hi === 'round') s += '<circle class="o-arc" cx="' + cx + '" cy="' + cy + '" r="' + (r - 6) + '" fill="none" stroke="' + ORANGE + '" stroke-width="12" opacity=".75"/>';
    if (o.hi === 'tick') { const d0 = sec * 6; s += arc(d0, d0 + 6, r - 6, ORANGE, 14); }
    if (o.hi === 'big') { const d0 = Math.floor(sec / 5) * 30; s += arc(d0, d0 + 30, r - 6, ORANGE, 14); }
    for (let i = 0; i < 60; i++) { const big = i % 5 === 0, a = P(i * 6, r), b = P(i * 6, r - (big ? 16 : 8)); s += '<line class="o-ctick' + (big ? ' big' : '') + '" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + INK + '" stroke-width="' + (big ? 4 : 2) + '"/>'; }
    for (let i = 1; i <= 12; i++) { const p = P(i * 30, r - 34); s += txt(p[0].toFixed(1), (+p[1] + 9).toFixed(1), String(i), 24, INK, 800); }
    const hd = (h % 12) * 30 + m * 0.5 + sec / 120, md = m * 6 + sec * 0.1, sd = sec * 6;
    const hand = (deg, len, wd, col, cls) => { const p = P(deg, len); return '<line class="o-hand ' + cls + '" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="' + col + '" stroke-width="' + wd + '" stroke-linecap="round"/>'; };
    if (o.hi === 'sec' && hasSec) s += hand(sd, r * 0.9, 16, '#FFD9C2', 'o-hi'); // 초바늘 강조(연주황 띠)
    s += hand(hd, r * 0.55, 10, INK, 'h') + hand(md, r * 0.82, 7, BLUE2, 'm') + (hasSec ? hand(sd, r * 0.9, 3.5, ORANGE, 's') : '') + '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="' + INK + '"/>';
    let legY = 0; if (o.names) { legY = 1; s += '<g class="o-legend">' + '<line x1="70" y1="294" x2="100" y2="294" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/>' + txt(108, 302, '짧은바늘 = 시', 20, INK, 800, 'start')
      + '<line x1="238" y1="294" x2="278" y2="294" stroke="' + BLUE2 + '" stroke-width="6" stroke-linecap="round"/>' + txt(286, 302, '긴바늘 = 분', 20, BLUE2, 800, 'start')
      + (hasSec ? '<line x1="154" y1="332" x2="200" y2="332" stroke="' + ORANGE + '" stroke-width="3.5" stroke-linecap="round"/>' + txt(208, 340, '가는 바늘 = 초', 20, ORANGE, 800, 'start') : '') + '</g>'; }
    let show = o.show; if (show === true) show = h + '시 ' + m + '분' + (hasSec ? ' ' + sec + '초' : '');
    let yy = legY ? (hasSec ? 354 : 316) : 266;
    if (show) { s += '<rect x="80" y="' + yy + '" width="300" height="46" rx="12" fill="#F1F4F8"/>' + txt(230, yy + 32, show, 28, INK, 900); yy += 56; }
    if (o.note) { s += txt(230, yy + 22, o.note, 22, o.hi ? ORANGE : '#6B7C93', 800); yy += 36; }
    return svgWrap(s, 'fig-clock', '0 0 460 ' + (yy + 4));
  }
  // ── tvert: 시간 세로셈(HTML) — a·b = [시,분,초] 또는 [분,초] · units 칸 이름 · runits 답 칸 이름 · 60 넘으면 받아올림(주황) · 모자라면 받아내림(빨강 +60) ──
  function tvert(o) {
    const units = o.units || ['시', '분', '초'], runits = o.runits || units, N = units.length, op = o.op || '+';
    const nz = (x) => x == null ? null : (+x || 0), A = (o.a || []).map(nz), B = (o.b || []).map(nz); while (A.length < N) A.unshift(0); while (B.length < N) B.unshift(0); const NA = A.map(x => x || 0), NB = B.map(x => x || 0); // null 칸 = 그 단위가 없음(빈칸)
    const R = [], carry = [], borrow = [];
    if (op === '+') { let c = 0; for (let i = N - 1; i >= 0; i--) { let v = NA[i] + NB[i] + c; c = 0; if (i > 0 && v >= 60) { v -= 60; c = 1; carry[i - 1] = true; } R[i] = v; } }
    else { let br = 0; for (let i = N - 1; i >= 0; i--) { let v = NA[i] - br - NB[i]; br = 0; if (v < 0 && i > 0) { v += 60; br = 1; borrow[i] = true; } R[i] = v; } }
    const lead = (arr) => { let i = 0; while (i < N - 1 && !arr[i]) i++; return i; }; // 앞쪽 0 은 빈칸
    const row = (arr, us, cls, from) => '<div class="tv-row ' + cls + '">' + arr.map((v, i) => '<span' + (i < from || v == null ? ' class="mute"' : '') + '>' + (i < from || v == null ? '' : v + '<u>' + esc(us[i] || '') + '</u>') + '</span>').join('') + '</div>';
    const top = '<div class="tv-row tv-carry">' + A.map((v, i) => '<span>' + (op === '+' && carry[i] ? '1' : op !== '+' && borrow[i + 1] ? '<i>' + (NA[i] - 1) + '</i>' : op !== '+' && borrow[i] ? '<b>+60</b>' : '') + '</span>').join('') + '</div>';
    const h = '<div class="tv n' + N + '">' + top + row(A, units, 'tv-a', lead(A)) + row(B, units, 'tv-b', lead(B)).replace('<div class="tv-row tv-b">', '<div class="tv-row tv-b"><em>' + (op === '+' ? '+' : '−') + '</em>') + '<div class="tv-line"></div>' + (o.answer === false ? '' : row(R, runits, 'tv-r', lead(R))) + '</div>';
    return '<div class="fig-vert fig-tvert" data-r="' + R.join(',') + '">' + h + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }

  const PARTS = { force, balance, lever, slope, scale, hand, robot, frac, fracs, numline, tenbox, geo, bt, regroup, share, bundle, arr, mulrows, eq, ruler, joins, road, clock };
  const HTML_PARTS = { vert, tvert };
  function one(f) { if (!f || typeof f !== 'object') return ''; const fn = PARTS[f.k] || HTML_PARTS[f.k]; return fn ? fn(f) : ''; }
  function panel(p) {
    const f = p.fig || p; const inner = one(f); if (!inner) return '';
    const cap = (p.fig ? p.label : '') || (f.k === 'balance' && f.cap !== false ? balanceCap(f) : ''); // 22차: 부품 자신의 label 은 그림 안에 그리므로 나란히 칸(items)의 label 만 캡션
    return '<div class="fig-panel">' + inner + (cap ? '<div class="fig-cap">' + esc(cap) + '</div>' : '') + '</div>';
  }
  const KEY = '<div class="fig-key"><i></i>주황 화살표 = 힘 · 굵고 길수록 큰 힘</div>';
  function hasArrow(f) { if (!f) return false; if (f.k === 'panels') return (f.items || []).some(p => hasArrow(p.fig || p)); return ['force', 'lever', 'slope', 'robot'].indexOf(f.k) >= 0 && f.act !== 'none'; }
  function render(f) {
    if (!f || typeof f !== 'object') return '';
    let body = '';
    if (f.k === 'panels') { const ps = (f.items || []).map(panel).filter(Boolean); if (!ps.length) return ''; body = '<div class="fig-panels n' + ps.length + (f.vs ? ' vs' : '') + '">' + ps.join(f.vs ? '<div class="fig-vs">' + esc(f.vs) + '</div>' : '') + '</div>'; }
    else if (f.k === 'tools') body = tools(f);
    else if (f.k === 'chain') body = tools(f, '<div class="fig-chain-ar">→</div>').replace('fig-cards', 'fig-cards chain');
    else if (f.k === 'places') body = '<div class="fig-cards places">' + (f.items || []).map(card).join('') + '</div>';
    else { const p = panel(f); if (!p) return ''; body = '<div class="fig-panels n1">' + p + '</div>'; }
    return '<div class="fig" data-fig="' + esc(f.k) + '">' + body + (f.key !== false && hasArrow(f) ? KEY : '') + '</div>';
  }
  global.KT2_FIG = { render, parts: Object.keys(PARTS).concat(Object.keys(HTML_PARTS), ['panels', 'tools', 'chain', 'places']), icons: Object.keys(ICON), sizes: AL };
})(typeof window !== 'undefined' ? window : globalThis);
