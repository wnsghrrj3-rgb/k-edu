/* ============================================================================
   stage2-fig.js — 케이티처 2세대 「개념 그림 층」 (2026-09-25 21차)
   · 개념 장 1,042장 가운데 693장이 글만 있었다(3학년 579). 사진을 기다리지 않고, 개념 자체를 그린다.
   · 데이터 slide.data.fig = { k:'…', … } 한 칸만 읽는다. 없으면 아무것도 그리지 않는다(기존 장 diff-0).
   · 그림 문법 하나: **주황 화살표 = 힘, 굵고 길수록 큰 힘.** 모든 부품이 같은 화살표를 쓴다.
   · 부품: panels(나란히 견주기) · force(밀기·당기기·누르기·멈추기·들기) · balance(수평대) · lever(지레) · slope(빗면)
           · scale(전자저울·용수철저울) · hand(손 어림) · tools(도구 카드) · chain(카드 사이 화살표) · places(쓰이는 곳)
   · 24차(2026-09-28) 국어 부품 추가: sent/sents(문장 짜임)·pause(띄어 읽기 ∨)·text(글 읽기 판)·para(문단 중심·뒷받침)·sort2(두 갈래 통)·mood(인물 마음)·sound(소리·표기)·letter(편지지)·note(메모지)
   · 23차(2026-09-28) 길이·시간 부품 추가: ruler(자)·joins(이어 붙여 어림)·road(거리 띠·km 표지판)·clock(시·분·초바늘)·tvert(시간 세로셈) · 카드 on(주황 강조)
   · 28차(2026-09-29) 3학년 2학기 곱셈 부품: vmul(곱셈 세로셈 — 올림 수·부분 곱 두 줄) · grid(모눈 가르기 — 덩이마다 부분 곱) · range(어림 사이 띠)
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


  // ── 24차(2026-09-28) 국어 부품 — 그림 문법: **파랑 = 누가/무엇이 · 사실 · 중심 문장** / **주황 = 어찌하다·어떠하다·무엇이다 · 의견 · 쉬어 읽기 ∨ · 강조** / 초록 = 뒷받침 · 어울림 / 빨강 = 어울리지 않음 · 잘못된 표기 ──
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="hi">$1</b>');
  const TYPE = { act: '어찌하다', state: '어떠하다', what: '무엇이다' }, TSUB = { act: '움직임', state: '성질·상태', what: '무엇인지' };
  const chip = (t, cls) => t ? '<i class="ko-tag ' + (cls || '') + '">' + esc(t) + '</i>' : '';
  // sent / sents: 문장의 짜임 — a = 누가/무엇이(파랑) · b = 뒷부분(주황, t = act·state·what) · tree = 세 갈래 한눈에
  function sents(o) {
    if (o.tree) {
      const ex = {}; (o.items || []).forEach(i => { if (i.t) ex[i.t] = i.b; });
      return '<div class="ko-tree"><div class="ko-a big"><i>누가/무엇이</i>' + md(o.a || '콩이가') + '</div><em>+</em><div class="ko-branches">'
        + ['act', 'state', 'what'].map(t => '<div class="ko-b t-' + t + '"><i>' + TYPE[t] + '</i><u>' + TSUB[t] + '</u>' + (ex[t] ? md(ex[t]) : '') + '</div>').join('') + '</div></div>';
    }
    const items = o.items || [{ a: o.a, b: o.b, t: o.t, bad: o.bad }];
    return '<div class="ko-sents">' + items.map(it => { const t = TYPE[it.t] ? it.t : ''; return '<div class="ko-sent' + (it.bad ? ' bad' : '') + '"><span class="ko-a"><i>' + esc(it.la || '누가/무엇이') + '</i>' + md(it.a) + '</span>' + (it.mark ? '<i class="ko-p1">∨</i>' : '<em>/</em>') + '<span class="ko-b' + (t ? ' t-' + t : '') + '"><i>' + esc(it.lb || (t ? TYPE[t] : '뒷부분')) + (t && it.sub !== false ? '<u>' + TSUB[t] + '</u>' : '') + '</i>' + md(it.b) + '</span>' + (it.bad ? '<b class="ko-x">✗ 어색해요</b>' : it.ok ? '<b class="ko-o">○ 어울려요</b>' : '') + '</div>'; }).join('') + '</div>';
  }
  // pause: 띄어 읽기 — 글줄 안의 ∨(조금 쉬어)·∨∨(조금 더 쉬어)를 주황 쐐기로 · rows = 부호 표(쉼표·마침표·물음표)
  const wedge = (s) => md(s).replace(/∨∨|∨/g, m => m.length > 1 ? '<i class="ko-p2">∨∨</i>' : '<i class="ko-p1">∨</i>');
  function pause(o) {
    let s = '';
    if (o.rows) s += '<div class="ko-rows">' + o.rows.map(r => '<div class="ko-row"><b class="ko-sym">' + esc(r.sym) + '</b><span>' + esc(r.name) + '</span>' + (r.mark ? wedge(r.mark) : '<i class="ko-up">↗</i>') + '<u>' + md(r.say) + '</u></div>').join('') + '</div>';
    if (o.lines) s += '<div class="ko-lines">' + o.lines.map(l => '<div class="ko-line">' + wedge(l) + '</div>').join('') + '</div>';
    if (!s) return '';
    return '<div class="ko-pause">' + s + (o.key === false ? '' : '<div class="ko-key"><i class="ko-p1">∨</i> 조금 쉬어요 &nbsp;·&nbsp; <i class="ko-p2">∨∨</i> 조금 더 쉬어요</div>') + '</div>';
  }
  // text: 글 읽기 판 — 책 종이 위 글줄(번호) · 줄마다 tag(사실·의견·중심·뒷받침·어색) · poem = 시(번호 작게)
  const TAGC = { '사실': 'fact', '의견': 'opin', '중심': 'main', '중심 문장': 'main', '뒷받침': 'sub', '뒷받침 문장': 'sub', '어색': 'odd', '어울리지 않아요': 'odd' };
  function text(o) {
    const lines = (o.lines || []).map(l => typeof l === 'string' ? { t: l } : l);
    return '<div class="ko-text' + (o.poem ? ' poem' : '') + '">' + (o.title ? '<div class="ko-title">' + md(o.title) + '</div>' : '')
      + '<ol class="ko-ol' + (o.num === false ? ' nonum' : '') + '">' + lines.map(l => '<li' + (l.tag && TAGC[l.tag] ? ' class="' + TAGC[l.tag] + '"' : '') + '>' + (o.num === false ? '' : '<em></em>') + '<span>' + md(String(l.t).replace(/^\d+\s+/, '')) + '</span>' + (l.tag ? chip(l.tag, TAGC[l.tag] || '') : '') + '</li>').join('') + '</ol></div>';
  }
  // para: 문단 짜임 — main 중심 문장(파랑) 아래 subs 뒷받침(초록), odd 는 빨강 ✗ · pairs = 중심 → 뒷받침 짝 · indent = 첫 칸 들여 쓰기 표시
  function para(o) {
    if (o.pairs) return '<div class="ko-pairs">' + o.pairs.map(p => '<div class="ko-pair"><span class="ko-main">' + chip(o.mainTag || '중심 문장', 'main') + md(p[0]) + '</span><i class="fig-chain-ar">→</i><span class="ko-sub">' + chip(o.subTag || '뒷받침 문장', 'sub') + md(p[1]) + '</span></div>').join('') + '</div>';
    const subs = (o.subs || []).map(x => typeof x === 'string' ? { t: x } : x);
    return '<div class="ko-para">' + (o.indent ? '<div class="ko-indent"><i></i>한 칸 들여 써요</div>' : '') + '<div class="ko-main">' + chip(o.mainTag || '중심 문장', 'main') + md(o.main) + '</div>'
      + (subs.length ? '<div class="ko-conn"><i></i></div><div class="ko-subs n' + subs.length + '">' + subs.map(x => '<div class="ko-sub' + (x.odd ? ' odd' : '') + '">' + chip(x.odd ? (o.oddTag || '어울리지 않아요') : (o.subTag || '뒷받침 문장'), x.odd ? 'odd' : 'sub') + md(x.t) + (x.odd ? '<b class="ko-x">✗</b>' : '') + '</div>').join('') + '</div>' : '') + '</div>';
  }
  // sort2: 두 갈래 통 — a(파랑)·b(주황) 이름·글줄·hint
  function sort2(o) {
    const bin = (b, cls) => !b || (!b.name && !(b.items || []).length) ? '' : '<div class="ko-bin ' + cls + '"><div class="ko-binh">' + esc(b.name || '') + '</div>' + (b.items || []).map(t => '<div class="ko-item">' + md(t) + '</div>').join('') + (b.hint ? '<div class="ko-hint">' + md(b.hint) + '</div>' : '') + '</div>';
    const bins = [bin(o.a, 'a'), bin(o.b, 'b')].filter(Boolean); if (!bins.length) return ''; // 이름도 글줄도 없는 통은 안 그린다(한 통만도 됨)
    return '<div class="ko-sort2 n' + bins.length + '">' + bins.join('') + '</div>';
  }
  // mood: 인물의 마음 — who(얼굴 이모지 → 그림 인물, 기분 얼굴 🙂😟😮🤔 도 됨) · say 말풍선 · feel 마음(주황) · how 목소리·표정(회색) · flow = 마음 변화 화살표 줄
  function figWho(face, cls) {
    const A = global.KT2_ART; const s = A && A.character ? A.character(face || '🙂') : '';
    return s ? '<div class="ko-chr ' + (cls || '') + '">' + s + '</div>' : '<div class="ko-chr emo ' + (cls || '') + '">' + esc(face || '🙂') + '</div>';
  }
  function mood(o) {
    if (o.flow) return '<div class="ko-flow">' + o.flow.map((f, i) => (i ? '<i class="fig-chain-ar">→</i>' : '') + '<div class="ko-step">' + figWho(f.who) + '<b>' + md(f.name || '') + '</b>' + (f.note ? '<u>' + md(f.note) + '</u>' : '') + '</div>').join('') + '</div>';
    const items = o.items || [];
    return '<div class="ko-moods n' + items.length + '">' + items.map((it, i) => '<div class="ko-mood' + (i % 2 ? ' mirror' : '') + '">' + (it.say ? '<div class="ko-bub">' + md(it.say) + '</div>' : '') + figWho(it.who) + (it.name ? '<b class="ko-name">' + esc(it.name) + '</b>' : '') + (it.feel ? '<span class="ko-feel">' + md(it.feel) + '</span>' : '') + (it.how ? '<span class="ko-how">' + md(it.how) + '</span>' : '') + '</div>').join('') + '</div>';
  }
  // sound: 소리·표기 카드 — items{w,s} 낱말 → [소리](주황) · pairs [[a,b]] 견줌(ox = 왼쪽 바름 ○ · 오른쪽 틀림 ✗ / 아니면 띄어쓰기 두 뜻 ↔, 낱말마다 칸) · rule 한 줄
  const words = (t) => String(t).split(' ').map(w => '<i>' + md(w) + '</i>').join('<s></s>');
  function sound(o) {
    let s = '';
    if (o.rule) s += '<div class="ko-rule">' + md(o.rule) + '</div>';
    if (o.items) s += '<div class="ko-snds">' + o.items.map(it => '<div class="ko-snd"><b>' + md(it.w) + '</b><em>→</em><b class="s">' + esc(it.s) + '</b></div>').join('') + '</div>';
    if (o.pairs) s += '<div class="ko-prs' + (o.ox ? ' ox' : '') + '">' + o.pairs.map(p => '<div class="ko-pr"><span class="l">' + (o.ox ? '<b class="ko-o">○</b>' : '') + words(p[0]) + '</span><em>↔</em><span class="r">' + (o.ox ? '<b class="ko-x">✗</b>' : '') + words(p[1]) + '</span></div>').join('') + '</div>';
    return s ? '<div class="ko-sound">' + s + '</div>' : '';
  }
  // letter: 편지지 — to 받는 사람(파랑) · lines 본문(md) · from 쓴 사람 · parts = 짜임만(빈칸 이름표)
  function letter(o) {
    if (o.parts) return '<div class="ko-letter parts">' + o.parts.map(p => '<div class="ko-blank">' + chip(p, /받는|쓴/.test(p) ? 'main' : /마음/.test(p) ? 'opin' : 'sub') + '<i></i></div>').join('') + '</div>';
    return '<div class="ko-letter">' + (o.to ? '<div class="ko-to">' + chip(o.toTag || '받는 사람', 'main') + md(o.to) + '</div>' : '')
      + (o.lines || []).map(l => { const x = typeof l === 'string' ? { t: l } : l; return '<div class="ko-ln' + (x.tag ? ' tagged' : '') + '">' + (x.tag ? chip(x.tag, TAGC[x.tag] || (/마음/.test(x.tag) ? 'opin' : 'sub')) : '') + md(x.t) + '</div>'; }).join('')
      + (o.from ? '<div class="ko-from">' + md(o.from) + chip(o.fromTag || '쓴 사람', 'main') + '</div>' : '') + '</div>';
  }
  // note: 메모지 — title 제목 · items{t,star} 번호·⭐
  function note(o) {
    const items = (o.items || []).map(x => typeof x === 'string' ? { t: x } : x);
    return '<div class="ko-note">' + (o.title ? '<div class="ko-ntitle">' + chip(o.titleTag || '제목', 'main') + md(o.title) + '</div>' : '') + '<ol>' + items.map(x => '<li>' + md(x.t) + (x.star ? '<b class="ko-star">⭐</b>' : '') + '</li>').join('') + '</ol></div>';
  }
  const KO_PARTS = { sent: sents, sents, pause, text, para, sort2, mood, sound, letter, note };

  // ── 26차(2026-09-28) 사회 부품 — 그림 문법: **때 = 옛날·과거(갈색) · 오늘·현재(파랑) · 미래(초록)** / **주황 = 시간의 흐름 화살표 · 길찾기 길 · 찾은 곳 · 강조** / 장소 = 자연이 만든 곳(초록) · 사람이 만든 곳(파랑) ──
  const ERA = { past: '과거', now: '현재', future: '미래', old: '옛날', today: '오늘' };
  const eraCls = (e) => e === 'past' || e === 'old' ? 'past' : e === 'future' ? 'future' : e === 'now' || e === 'today' ? 'now' : '';
  const so = (it) => typeof it === 'string' ? { name: it } : (it || {});
  const soChip = (it) => { const x = so(it); return '<span class="so-chip' + (x.on ? ' on' : '') + (x.x ? ' x' : '') + '">' + (x.emoji ? '<i>' + esc(x.emoji) + '</i>' : '') + md(x.name || '') + '</span>'; };
  // tline: 시간 띠·연표 — zones(과거·현재·미래 세 구역에 낱말) 또는 items{when, what, emoji, era, on}(왼쪽 → 오른쪽 = 나중) · arrow 이름
  function tline(o) {
    const ar = '<div class="so-arrow"><i></i><b>' + esc(o.arrow || '시간의 흐름') + '</b></div>';
    if (o.zones) return '<div class="so-tline zones">' + '<div class="so-zones">' + o.zones.map(z => '<div class="so-zone ' + eraCls(z.era) + (z.on ? ' on' : '') + '"><div class="so-zh">' + esc(z.name || ERA[z.era] || '') + '</div>' + (z.note ? '<u>' + md(z.note) + '</u>' : '') + '<div class="so-zw">' + (z.words || []).map(soChip).join('') + '</div></div>').join('') + '</div>' + ar + '</div>';
    const items = (o.items || []).map(so);
    if (!items.length) return '';
    return '<div class="so-tline n' + items.length + '"><div class="so-evs">' + items.map((e, i) => '<div class="so-ev ' + eraCls(e.era) + (e.on ? ' on' : '') + (e.blank ? ' blank' : '') + '">' + (e.emoji ? '<div class="so-evemo">' + esc(e.emoji) + '</div>' : '') + '<b>' + md(e.what || e.name || '') + '</b>' + (e.when ? '<span class="so-when">' + esc(e.when) + '</span>' : '<span class="so-when n">' + (i + 1) + '</span>') + '</div>').join('') + '</div>' + ar + (o.note ? '<div class="so-tnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // map: 마을 지도(SVG) — pins 장소 이름 · hi 찾은 곳(주황 핀) · route [출발, 도착] 주황 길 · search 검색창 글자 · zoom 'in'(확대)·'out'(축소) · sat 디지털 영상 지도(사진 같은 바탕) · legend 기호 풀이
  const MAPW = 640, MAPH = 450, ROADY = 250, ROADX = 320;
  const SLOT = [[92, 150], [218, 150], [422, 150], [548, 150], [92, 346], [218, 346], [422, 346], [548, 346]];
  const HOME = { '학교': 0, '도서관': 1, '병원': 2, '보건소': 3, '시장': 4, '소방서': 5, '우체국': 6, '경찰서': 7, '공원': 4, '놀이터': 1, '집': 5, '우리 집': 5, '가게': 3, '문화원': 1, '박물관': 3, '마을 회관': 7 };
  const PLACE = { '학교': ['🏫', '#E8A33D'], '도서관': ['📚', '#7B6CD9'], '병원': ['🏥', '#E0413C'], '보건소': ['🩺', '#E86A6A'], '시장': ['🧺', '#D9822B'], '소방서': ['🚒', '#D23B2E'], '우체국': ['📮', '#E55B3C'], '경찰서': ['👮', '#3E6FCF'], '공원': ['🌳', '#2E9E63'], '놀이터': ['🛝', '#F5A623'], '집': ['🏠', '#A86F3C'], '우리 집': ['🏠', '#A86F3C'], '가게': ['🏪', '#5CC08A'], '문화원': ['🏛️', '#8A6FB8'], '박물관': ['🏛️', '#8A6FB8'], '마을 회관': ['🏘️', '#8A6FB8'] };
  function mapSlots(names) { const used = {}, at = {}; names.forEach(n => { const h = HOME[n]; if (h != null && !used[h]) { used[h] = 1; at[n] = h; } }); names.forEach(n => { if (at[n] != null) return; for (let i = 0; i < SLOT.length; i++) if (!used[i]) { used[i] = 1; at[n] = i; break; } }); return at; }
  function mapPlace(n, i, hi, sat) {
    const p = SLOT[i], pc = PLACE[n] || ['📍', '#6B7C93'], on = hi === n, x = p[0], y = p[1];
    let s = '<g class="o-place' + (on ? ' on' : '') + '" data-p="' + esc(n) + '">';
    s += sat ? '<rect x="' + (x - 50) + '" y="' + (y - 38) + '" width="100" height="76" rx="6" fill="#8C969E" stroke="#6C757C" stroke-width="3"/><rect x="' + (x - 40) + '" y="' + (y - 28) + '" width="80" height="56" rx="4" fill="#A9B2B9"/>'
      : '<rect x="' + (x - 50) + '" y="' + (y - 38) + '" width="100" height="76" rx="14" fill="#fff" stroke="' + pc[1] + '" stroke-width="5"/><rect x="' + (x - 50) + '" y="' + (y - 38) + '" width="100" height="16" rx="8" fill="' + pc[1] + '"/>';
    s += '<text x="' + x + '" y="' + (y + 22) + '" text-anchor="middle" font-size="40">' + esc(pc[0]) + '</text>';
    s += '<rect x="' + (x - 56) + '" y="' + (y + 42) + '" width="112" height="32" rx="16" fill="' + (on ? ORANGE : 'rgba(255,255,255,.92)') + '"/>' + txt(x, y + 66, n, 22, on ? '#fff' : INK, 900);
    if (on) s += '<rect x="' + (x - 58) + '" y="' + (y - 46) + '" width="116" height="92" rx="18" fill="none" stroke="' + ORANGE + '" stroke-width="6"/><g class="o-pin"><path d="M' + x + ' ' + (y - 48) + ' l-16 -26 a20 20 0 1 1 32 0 Z" fill="' + ORANGE + '" stroke="#fff" stroke-width="3"/><circle cx="' + x + '" cy="' + (y - 88) + '" r="7" fill="#fff"/></g>';
    return s + '</g>';
  }
  function map(o) {
    const names = (o.pins && o.pins.length ? o.pins : ['학교', '도서관', '병원', '시장', '소방서', '우체국']).slice(0, 8);
    const at = mapSlots(names), sat = !!o.sat;
    const PAD = o.zoom === 'out' ? 300 : o.zoom === 'in' ? 60 : 0; // 확대/축소 때만 바탕을 넓힌다(보이는 곳만큼 · 나머지는 clipPath 로 잘림)
    let base = '<rect x="' + (-PAD) + '" y="' + (-PAD) + '" width="' + (MAPW + 2 * PAD) + '" height="' + (MAPH + 2 * PAD) + '" fill="' + (sat ? '#5E7A4E' : '#EEF4E6') + '"/>';
    if (sat) for (let i = 0; i < 26; i++) base += '<circle cx="' + ((i * 97) % 700 - 20) + '" cy="' + ((i * 53) % 400) + '" r="' + (18 + (i % 4) * 7) + '" fill="#4C6A3E" opacity=".55"/>';
    else base += '<path d="M' + (-PAD) + ' 432 Q160 410 300 440 T' + (MAPW + PAD) + ' 428 L' + (MAPW + PAD) + ' ' + (MAPH + PAD) + ' L' + (-PAD) + ' ' + (MAPH + PAD) + ' Z" fill="#BFE1F5"/>';
    const rc = sat ? '#9C9A92' : '#FFFFFF', re = sat ? '#7E7C75' : '#D5DCE4';
    base += '<rect x="' + (-PAD) + '" y="' + (ROADY - 20) + '" width="' + (MAPW + 2 * PAD) + '" height="40" fill="' + rc + '" stroke="' + re + '" stroke-width="3"/><rect x="' + (ROADX - 20) + '" y="' + (-PAD) + '" width="40" height="' + (MAPH + 2 * PAD) + '" fill="' + rc + '" stroke="' + re + '" stroke-width="3"/>';
    base += '<line x1="' + (-PAD) + '" y1="' + ROADY + '" x2="' + (MAPW + PAD) + '" y2="' + ROADY + '" stroke="' + (sat ? '#E8E4D0' : '#E3E8EE') + '" stroke-width="3" stroke-dasharray="16 12"/>';
    if (o.zoom === 'out') { [[-150, 150], [-150, 346], [790, 150], [790, 346], [-40, -60], [440, -60], [560, 540], [120, 540], [-150, -60], [790, -60]].forEach(p => { base += '<rect x="' + (p[0] - 40) + '" y="' + (p[1] - 30) + '" width="80" height="60" rx="10" fill="' + (sat ? '#8C969E' : '#fff') + '" stroke="#C9D2DC" stroke-width="4"/><text x="' + p[0] + '" y="' + (p[1] + 14) + '" text-anchor="middle" font-size="34">🏠</text>'; }); }
    let route = '';
    if (o.route && at[o.route[0]] != null && at[o.route[1]] != null) {
      const a = SLOT[at[o.route[0]]], b = SLOT[at[o.route[1]]], ya = a[1] < ROADY ? a[1] + 40 : a[1] - 40, yb = b[1] < ROADY ? b[1] + 40 : b[1] - 40;
      const pts = [[a[0], ya], [a[0], ROADY], [b[0], ROADY], [b[0], yb]];
      route = '<polyline class="o-route" points="' + pts.map(p => p.join(',')).join(' ') + '" fill="none" stroke="' + ORANGE + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 16"/>'
        + '<circle cx="' + a[0] + '" cy="' + ROADY + '" r="15" fill="' + BLUE2 + '" stroke="#fff" stroke-width="4"/>' + '<circle cx="' + b[0] + '" cy="' + ROADY + '" r="15" fill="' + ORANGE + '" stroke="#fff" stroke-width="4"/>';
    }
    let pl = ''; names.forEach(n => { pl += mapPlace(n, at[n], o.hi || (o.route ? null : null), sat); });
    if (route) { const fa = SLOT[at[o.route[0]]][0], fb = SLOT[at[o.route[1]]][0]; const flag = (x, t, c) => '<rect x="' + (x - 34) + '" y="' + (ROADY + 22) + '" width="68" height="30" rx="15" fill="' + c + '"/>' + txt(x, ROADY + 44, t, 20, '#fff', 900); pl += '<g class="o-flag">' + flag(fa, '출발', BLUE2) + flag(fb, '도착', ORANGE) + '</g>'; }
    let world = base + route + pl;
    const hiAt = o.hi && at[o.hi] != null ? SLOT[at[o.hi]] : [ROADX, ROADY];
    if (o.zoom === 'in') world = '<g transform="translate(' + (MAPW / 2) + ' ' + (MAPH / 2 + 20) + ') scale(2) translate(' + (-hiAt[0]) + ' ' + (-hiAt[1]) + ')">' + world + '</g>';
    else if (o.zoom === 'out') world = '<g transform="translate(' + (MAPW / 2) + ' ' + (MAPH / 2) + ') scale(0.56) translate(' + (-ROADX) + ' ' + (-ROADY) + ')">' + world + '</g>';
    let ui = '';
    if (o.search) ui += '<g class="o-search"><rect x="16" y="14" width="300" height="50" rx="25" fill="#fff" stroke="' + BLUE2 + '" stroke-width="4"/><text x="40" y="49" font-size="26">🔍</text>' + txt(80, 49, o.search, 26, INK, 800, 'start') + '</g>';
    ui += '<g class="o-zoombtn"><rect x="' + (MAPW - 62) + '" y="' + (MAPH - 128) + '" width="46" height="46" rx="10" fill="' + (o.zoom === 'in' ? ORANGE : '#fff') + '" stroke="#C9D2DC" stroke-width="3"/>' + txt(MAPW - 39, MAPH - 94, '+', 34, o.zoom === 'in' ? '#fff' : INK, 900) + '<rect x="' + (MAPW - 62) + '" y="' + (MAPH - 74) + '" width="46" height="46" rx="10" fill="' + (o.zoom === 'out' ? ORANGE : '#fff') + '" stroke="#C9D2DC" stroke-width="3"/>' + txt(MAPW - 39, MAPH - 40, '−', 34, o.zoom === 'out' ? '#fff' : INK, 900) + '</g>';
    return '<div class="so-map' + (sat ? ' sat' : '') + '"><svg class="fig-svg fig-map" viewBox="0 0 ' + MAPW + ' ' + MAPH + '" xmlns="http://www.w3.org/2000/svg" role="img"><clipPath id="mapclip"><rect width="' + MAPW + '" height="' + MAPH + '" rx="18"/></clipPath><g clip-path="url(#mapclip)">' + world + ui + '</g></svg>' + (o.tag || sat ? '<div class="so-maptag' + (sat ? ' sat' : '') + '">' + esc(o.tag || '디지털 영상 지도') + '</div>' : '') + (o.legend ? '<div class="so-legend">' + o.legend.map(soChip).join('') + '</div>' : '') + '</div>';
  }
  // link: 짝 잇기 — rows [[a, b]] (a·b = 글자 또는 {emoji,name}) · ha/hb 머리 · g 같은 오른쪽 칸 이름끼리 같은 색 · note 한 줄
  const GC = ['g0', 'g1', 'g2', 'g3', 'g4'];
  function link(o) {
    const rows = o.rows || []; if (!rows.length) return ''; const gi = {}; let n = 0;
    rows.forEach(r => { const k = so(r[1]).name; if (gi[k] == null) gi[k] = n++; });
    const cell = (x, cls) => { const v = so(x); return '<span class="so-lc ' + cls + '">' + (v.emoji ? '<i>' + esc(v.emoji) + '</i>' : '') + md(v.name || '') + '</span>'; };
    return '<div class="so-link n' + rows.length + '">' + (o.ha || o.hb ? '<div class="so-lrow head"><span>' + esc(o.ha || '') + '</span><em></em><span>' + esc(o.hb || '') + '</span></div>' : '')
      + rows.map(r => '<div class="so-lrow ' + (o.same ? 'g0' : GC[gi[so(r[1]).name] % GC.length]) + '">' + cell(r[0], 'a') + '<em>→</em>' + cell(r[1], 'b') + '</div>').join('') + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // then: 옛날 ↔ 오늘 — rows [{old, now}] (글자 또는 {emoji,name,note}) · scene:true 는 두 거리 그림 · heads 머리 이름
  function street(old) {
    let s = '<rect width="460" height="280" fill="' + (old ? '#F6EBD6' : '#E6F1FC') + '"/>';
    if (old) {
      s += '<path d="M0 220 Q230 200 460 220 L460 280 L0 280 Z" fill="#D9BF93"/><path d="M180 280 Q220 232 236 214 L256 214 Q262 236 300 280 Z" fill="#C9A874"/>';
      [[70, 168], [190, 176], [350, 170]].forEach(p => { s += '<rect x="' + (p[0] - 46) + '" y="' + p[1] + '" width="92" height="46" fill="#F3E3C3" stroke="#8C6A3E" stroke-width="3"/><rect x="' + (p[0] - 12) + '" y="' + (p[1] + 14) + '" width="24" height="32" fill="#8C6A3E"/><path d="M' + (p[0] - 70) + ' ' + (p[1] + 4) + ' Q' + (p[0] - 44) + ' ' + (p[1] - 2) + ' ' + (p[0] - 40) + ' ' + (p[1] - 26) + ' L' + (p[0] + 40) + ' ' + (p[1] - 26) + ' Q' + (p[0] + 44) + ' ' + (p[1] - 2) + ' ' + (p[0] + 70) + ' ' + (p[1] + 4) + ' Z" fill="#5A4A3C"/>'; });
      s += '<circle cx="420" cy="60" r="26" fill="#F5C45A" opacity=".8"/>';
    } else {
      [[40, 70, 150], [120, 40, 180], [300, 50, 170], [380, 30, 190]].forEach(b => { s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="70" height="' + b[2] + '" fill="#9FB7D4" stroke="#6C88AD" stroke-width="3"/>'; for (let r = b[1] + 14; r < b[1] + b[2] - 20; r += 26) for (let c = b[0] + 10; c < b[0] + 60; c += 22) s += '<rect x="' + c + '" y="' + r + '" width="14" height="14" fill="#E6F1FC"/>'; });
      s += '<rect x="0" y="220" width="460" height="60" fill="#6B7480"/><line x1="0" y1="250" x2="460" y2="250" stroke="#fff" stroke-width="4" stroke-dasharray="26 18"/><rect x="200" y="228" width="60" height="22" rx="8" fill="#F2545B"/><circle cx="212" cy="252" r="6" fill="#2B3440"/><circle cx="248" cy="252" r="6" fill="#2B3440"/>';
    }
    return '<svg class="fig-svg so-street" viewBox="0 0 460 280" xmlns="http://www.w3.org/2000/svg" role="img">' + s + '</svg>';
  }
  function then(o) {
    const h = o.heads || ['옛날', '오늘'];
    if (o.scene) return '<div class="so-then scene"><div class="so-tcol past"><div class="so-th">' + esc(h[0]) + '</div>' + street(true) + (o.old ? '<div class="so-tcap">' + md(o.old) + '</div>' : '') + '</div><em class="so-tar">→</em><div class="so-tcol now"><div class="so-th">' + esc(h[1]) + '</div>' + street(false) + (o.now ? '<div class="so-tcap">' + md(o.now) + '</div>' : '') + '</div></div>';
    const rows = o.rows || []; if (!rows.length) return '';
    const cell = (x) => { const v = so(x); return '<div class="so-tc">' + (v.emoji ? '<i>' + esc(v.emoji) + '</i>' : '') + '<b>' + md(v.name || '') + '</b>' + (v.note ? '<u>' + md(v.note) + '</u>' : '') + '</div>'; };
    return '<div class="so-then"><div class="so-trow head"><div class="so-th past">' + esc(h[0]) + '</div><em></em><div class="so-th now">' + esc(h[1]) + '</div></div>' + rows.map(r => '<div class="so-trow"><div class="past">' + cell(r.old) + '</div><em class="so-tar">→</em><div class="now">' + cell(r.now) + '</div></div>').join('') + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // groups: 두~네 갈래 통 — bins [{name, emoji, tone, items[글자 또는 {emoji,name}], hint}] · tone nat(자연)·man(사람)·past·now·future·x(아닌 것) · 없으면 차례 색
  function groups(o) {
    const bins = (o.bins || []).filter(b => b && (b.name || (b.items || []).length)); if (!bins.length) return '';
    return '<div class="so-groups n' + bins.length + '">' + bins.map((b, i) => '<div class="so-bin ' + (b.tone || 't' + i) + '"><div class="so-binh">' + (b.emoji ? '<i>' + esc(b.emoji) + '</i>' : '') + md(b.name || '') + '</div><div class="so-bitems">' + (b.items || []).map(soChip).join('') + '</div>' + (b.hint ? '<div class="so-hint">' + md(b.hint) + '</div>' : '') + '</div>').join('') + '</div>';
  }
  // pcard: 장소 카드 · 그림일기 — place·emoji ① 곳 · did ② 겪은 일 · feel ③ 마음(face 얼굴) · diary 그림일기 틀 · blank 빈칸
  function pcard(o) {
    const row = (n, lab, v, cls) => '<div class="so-prow ' + cls + '"><i>' + n + '</i><span class="so-plab">' + lab + '</span><b>' + (o.blank ? '' : md(v || '')) + '</b></div>';
    const pic = o.diary ? '<div class="so-ppic">' + (o.blank ? '' : '<span>' + esc(o.emoji || '🏞️') + '</span>' + (o.face ? figWho(o.face, 'so-pface') : '')) + '</div>' : '';
    return '<div class="so-pcard' + (o.diary ? ' diary' : '') + (!o.diary && o.face && !o.blank ? ' hasface' : '') + '"><div class="so-ptitle">' + esc(o.title || (o.diary ? '그림일기' : '장소 카드')) + '</div>' + pic + '<div class="so-prows">' + row('①', '곳', (o.emoji && !o.diary ? o.emoji + ' ' : '') + (o.place || ''), 'p') + row('②', '겪은 일', o.did, 'd') + row('③', '마음', o.feel, 'f') + '</div>' + (!o.diary && o.face && !o.blank ? figWho(o.face, 'so-pface side') : '') + '</div>';
  }
  // news: 마을 신문 — name 신문 이름 · photo 사진 칸 이모지 · title 기사 제목 · body 소개 글 · items 소식 · tags 칸 이름표(① 사진 ② 소개 글 ③ 소식)
  function news(o) {
    const tg = (t) => o.tags ? '<i class="so-ntag">' + t + '</i>' : '';
    return '<div class="so-news"><div class="so-nhead">' + esc(o.name || '우리 마을 신문') + '</div><div class="so-nbody"><div class="so-nphoto">' + tg('① 사진') + '<span>' + esc(o.photo || '📷') + '</span></div><div class="so-ntext">' + tg('② 소개 글') + (o.title ? '<b>' + md(o.title) + '</b>' : '') + (o.body ? '<p>' + md(o.body) + '</p>' : '') + '</div></div>' + ((o.items || []).length ? '<div class="so-nitems">' + tg('③ 소식') + (o.items || []).map(t => '<span>📢 ' + md(t) + '</span>').join('') + '</div>' : '') + '</div>';
  }
  // post: 공유 앱 화면 — art 작품 이모지 · title · who 올린 사람 · comments [{t, who, ok, bad}] · rules 지킬 점
  function post(o) {
    const cm = (o.comments || []).map(so);
    return '<div class="so-post"><div class="so-phone"><div class="so-pbar">' + esc(o.app || '우리 반 공유 앱') + '</div><div class="so-part">' + esc(o.art || '🖼️') + '</div><div class="so-pmeta"><b>' + md(o.title || '') + '</b>' + (o.who ? '<span>' + esc(o.who) + '</span>' : '') + '<span class="so-heart">♥ ' + (o.likes | 0 || 3) + '</span></div>'
      + cm.map(c => '<div class="so-cm' + (c.bad ? ' bad' : c.ok ? ' ok' : '') + '">' + (c.who ? '<i>' + esc(c.who) + '</i>' : '') + '<span>' + md(c.t || c.name || '') + '</span>' + (c.bad ? '<b class="ko-x">✗</b>' : c.ok ? '<b class="ko-o">○</b>' : '') + '</div>').join('') + '</div>'
      + ((o.rules || []).length ? '<div class="so-rules">' + o.rules.map(r => { const x = so(r); return '<div class="so-rule' + (x.x ? ' x' : '') + '">' + (x.emoji ? '<i>' + esc(x.emoji) + '</i>' : '') + md(x.name) + '</div>'; }).join('') + '</div>' : '') + '</div>';
  }
  // exhibit: 전시관 진열대 — title 전시 주제 · items [{emoji, name, use}] 물건마다 명패(이름·쓰임) · label 명패 이름표
  function exhibit(o) {
    const items = (o.items || []).map(so); if (!items.length && !o.title) return '';
    return '<div class="so-exh">' + (o.title ? '<div class="so-exht">' + chip('전시 주제', 'main') + md(o.title) + '</div>' : '') + '<div class="so-shelf">' + items.map(it => '<div class="so-exi"><div class="so-exemo">' + esc(it.emoji || '🏺') + '</div><div class="so-plate">' + (o.label ? '<i>명패</i>' : '') + '<b>' + md(it.name || '') + '</b>' + (it.use ? '<u>' + md(it.use) + '</u>' : '') + '</div></div>').join('') + '</div></div>';
  }
  const SO_PARTS = { tline, map, link, then, groups, pcard, news, post, exhibit };

  // ── 27차(2026-09-29) 과학 생물 부품 — 그림 문법: **그렇다·있음·같게 할 조건 = 파랑 ○ / 아니다·없음 = 회색 ✗ / 주황 = 기준 질문·다르게 할 조건·지금 단계·강조 / 초록 = 자람·싹·결과**
  //    사는 곳 = 땅 위(풀빛)·땅속(흙빛)·하늘(하늘빛)·강과 연못(파랑)·바다(짙은 파랑)·사막(모래빛)·극지(얼음빛)·들과 산(초록) ──
  // 이모지가 없거나 틀리는 생물은 작은 그림(48×48)으로 — 이름만 주면 알아서 고른다
  const SCI = {
    '두더지': '<ellipse cx="26" cy="28" rx="18" ry="13" fill="#5A4A42"/><ellipse cx="9" cy="30" rx="7" ry="5" fill="#E8A3A8"/><circle cx="6" cy="29" r="1.8" fill="#8A3A44"/><path d="M14 38 l-6 5 M18 40 l-3 6 M34 39 l3 6 M38 37 l6 5" stroke="#E8A3A8" stroke-width="4" stroke-linecap="round"/><circle cx="17" cy="23" r="1.6" fill="#1E1E1E"/>',
    '은행나무': '<path d="M24 44 L24 28" stroke="#8C7A3A" stroke-width="3"/><path d="M24 28 C8 26 4 12 8 6 C14 10 20 6 24 12 C28 6 34 10 40 6 C44 12 40 26 24 28 Z" fill="#E8C53A" stroke="#B89A22" stroke-width="2"/><path d="M24 12 L24 27" stroke="#B89A22" stroke-width="2"/>',
    '부레옥잠': '<path d="M2 34 H46" stroke="#5B8DEF" stroke-width="3"/><ellipse cx="16" cy="30" rx="7" ry="6" fill="#8CCB6A" stroke="#4E8A3A" stroke-width="2"/><ellipse cx="32" cy="30" rx="7" ry="6" fill="#8CCB6A" stroke="#4E8A3A" stroke-width="2"/><path d="M16 24 C10 14 14 6 20 4 M32 24 C38 14 34 6 28 4" stroke="#4E8A3A" stroke-width="3" fill="none"/><ellipse cx="20" cy="8" rx="7" ry="5" fill="#5CC08A"/><ellipse cx="28" cy="8" rx="7" ry="5" fill="#5CC08A"/><path d="M20 36 v10 M24 36 v12 M28 36 v10" stroke="#8A6B4A" stroke-width="2"/>',
    '검정말': '<path d="M2 8 H46" stroke="#5B8DEF" stroke-width="3"/><path d="M24 46 V12" stroke="#2E7A4A" stroke-width="3"/><path d="M24 40 l-9 -4 M24 40 l9 -4 M24 32 l-9 -4 M24 32 l9 -4 M24 24 l-8 -4 M24 24 l8 -4 M24 17 l-6 -4 M24 17 l6 -4" stroke="#2E9E63" stroke-width="3" stroke-linecap="round"/>',
    '용설란': '<path d="M24 44 C14 30 6 22 4 10 C12 18 18 26 24 44 Z M24 44 C34 30 42 22 44 10 C36 18 30 26 24 44 Z M24 44 C20 28 20 14 24 2 C28 14 28 28 24 44 Z" fill="#7FB59A" stroke="#4E8A6A" stroke-width="2"/>',
    '알로에': '<path d="M24 44 C16 34 10 26 8 14 C14 22 20 30 24 44 Z M24 44 C32 34 38 26 40 14 C34 22 28 30 24 44 Z M24 44 C22 32 22 20 24 8 C26 20 26 32 24 44 Z" fill="#8CCB6A" stroke="#4E8A3A" stroke-width="2"/><path d="M12 22 l-3 1 M36 22 l3 1 M11 28 l-3 1 M37 28 l3 1" stroke="#fff" stroke-width="2"/>',
    '도꼬마리': '<ellipse cx="24" cy="26" rx="11" ry="15" fill="#9C8A4A"/><g stroke="#6E5E2A" stroke-width="2.4" stroke-linecap="round"><path d="M13 16 l-5 -3 M12 24 l-6 0 M13 32 l-5 3 M35 16 l5 -3 M36 24 l6 0 M35 32 l5 3 M18 12 l-2 -5 M30 12 l2 -5 M18 40 l-2 5 M30 40 l2 5 M24 11 v-6 M24 41 v6"/></g>',
    '파리지옥': '<path d="M24 46 V30" stroke="#4E8A3A" stroke-width="3"/><path d="M24 30 C10 30 6 20 10 10 C16 18 20 22 24 30 Z" fill="#6DBB5A" stroke="#3E7A2E" stroke-width="2"/><path d="M24 30 C38 30 42 20 38 10 C32 18 28 22 24 30 Z" fill="#E0605A" stroke="#A8322E" stroke-width="2"/><path d="M11 10 l-2 -4 M15 13 l-1 -4 M35 13 l1 -4 M39 10 l2 -4" stroke="#3E7A2E" stroke-width="2"/>',
    '끈끈이주걱': '<path d="M24 46 V20" stroke="#4E8A3A" stroke-width="3"/><ellipse cx="24" cy="14" rx="9" ry="11" fill="#E27A5A"/><g fill="#F7E07A"><circle cx="17" cy="8" r="2.4"/><circle cx="24" cy="4" r="2.4"/><circle cx="31" cy="8" r="2.4"/><circle cx="15" cy="16" r="2.4"/><circle cx="33" cy="16" r="2.4"/><circle cx="24" cy="12" r="2.4"/></g>',
    '벌레잡이통풀': '<path d="M14 6 C20 2 32 2 36 8 L32 12 C28 8 20 8 16 10 Z" fill="#A8322E"/><path d="M16 10 C14 24 14 38 24 44 C34 38 34 24 32 12 C28 8 20 8 16 10 Z" fill="#8CCB6A" stroke="#4E8A3A" stroke-width="2"/><path d="M18 26 C20 34 24 38 28 34" stroke="#C7E6B0" stroke-width="3" fill="none"/>',
    '통발': '<path d="M2 8 H46" stroke="#5B8DEF" stroke-width="3"/><path d="M8 24 C18 20 30 28 40 22" stroke="#2E9E63" stroke-width="3" fill="none"/><circle cx="14" cy="32" r="5" fill="#C7E6B0" stroke="#4E8A3A" stroke-width="2"/><circle cx="26" cy="34" r="5" fill="#C7E6B0" stroke="#4E8A3A" stroke-width="2"/><circle cx="37" cy="30" r="5" fill="#C7E6B0" stroke="#4E8A3A" stroke-width="2"/><path d="M14 27 v-4 M26 29 v-5 M37 25 v-3" stroke="#2E9E63" stroke-width="2"/>',
    '알': '<ellipse cx="16" cy="30" rx="6" ry="9" fill="#F5D24A" stroke="#C9A21E" stroke-width="2"/><ellipse cx="32" cy="30" rx="6" ry="9" fill="#F5D24A" stroke="#C9A21E" stroke-width="2"/><ellipse cx="24" cy="18" rx="6" ry="9" fill="#F5D24A" stroke="#C9A21E" stroke-width="2"/><path d="M16 22 v16 M32 22 v16 M24 10 v16" stroke="#C9A21E" stroke-width="1.2"/>',
    '번데기': '<path d="M6 40 L42 8" stroke="#8A6B4A" stroke-width="3"/><path d="M22 34 C12 34 10 22 16 14 C22 6 34 8 36 14 C38 22 32 32 22 34 Z" fill="#B9C98A" stroke="#7A8A4A" stroke-width="2"/><path d="M18 18 C24 20 28 24 30 30 M16 24 C22 26 26 28 26 32" stroke="#7A8A4A" stroke-width="1.6" fill="none"/>',
    '올챙이': '<ellipse cx="18" cy="24" rx="11" ry="9" fill="#4A4A52"/><path d="M28 24 C34 18 40 30 46 22" stroke="#4A4A52" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="13" cy="21" r="2" fill="#fff"/>',
    '잠자리': '<path d="M24 10 V44" stroke="#3E6FCF" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="8" r="5" fill="#3E6FCF"/><g fill="#CFE3F7" stroke="#7FA6D6" stroke-width="1.5" opacity=".95"><ellipse cx="12" cy="16" rx="11" ry="4" transform="rotate(-8 12 16)"/><ellipse cx="36" cy="16" rx="11" ry="4" transform="rotate(8 36 16)"/><ellipse cx="13" cy="24" rx="10" ry="3.6" transform="rotate(8 13 24)"/><ellipse cx="35" cy="24" rx="10" ry="3.6" transform="rotate(-8 35 24)"/></g>',
    '매미': '<ellipse cx="24" cy="28" rx="8" ry="14" fill="#5A4A3A"/><circle cx="24" cy="12" r="6" fill="#6A5A42"/><circle cx="19" cy="11" r="2.2" fill="#E0605A"/><circle cx="29" cy="11" r="2.2" fill="#E0605A"/><g fill="#E6F0F5" stroke="#9AB0BC" stroke-width="1.5" opacity=".9"><path d="M20 18 C8 22 6 38 14 42 C18 36 20 28 20 18 Z"/><path d="M28 18 C40 22 42 38 34 42 C30 36 28 28 28 18 Z"/></g>',
    '사마귀': '<path d="M16 44 L26 26 L30 10" stroke="#5CAA4A" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M30 10 l6 -4 l2 6 Z" fill="#5CAA4A"/><path d="M27 20 l-8 -4 l2 -6 M28 22 l-6 2" stroke="#4E8A3A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 34 l-8 4 M20 38 l6 6 M24 30 l8 6" stroke="#4E8A3A" stroke-width="2.4" stroke-linecap="round"/>',
    '나팔꽃': '<path d="M24 46 V28" stroke="#4E8A3A" stroke-width="3"/><path d="M24 30 L10 8 C16 4 32 4 38 8 Z" fill="#7B6CD9" stroke="#5A4AB8" stroke-width="2"/><ellipse cx="24" cy="8" rx="14" ry="4" fill="#A99BF0"/><circle cx="24" cy="10" r="3" fill="#fff"/>',
    '감나무': '<path d="M24 44 V30" stroke="#8C6A3E" stroke-width="4"/><circle cx="24" cy="18" r="15" fill="#5CAA4A"/><circle cx="17" cy="20" r="5" fill="#F28A2E"/><circle cx="30" cy="14" r="5" fill="#F28A2E"/><circle cx="29" cy="26" r="5" fill="#F28A2E"/>',
    '봉숭아': '<path d="M24 46 V18" stroke="#6DBB5A" stroke-width="3"/><path d="M24 34 l-10 -6 M24 26 l10 -6" stroke="#5CAA4A" stroke-width="4" stroke-linecap="round"/><g fill="#F0679A"><circle cx="24" cy="12" r="5"/><circle cx="18" cy="16" r="4.5"/><circle cx="30" cy="16" r="4.5"/></g><circle cx="24" cy="14" r="2.6" fill="#FFD3E2"/>',
    '강아지풀': '<path d="M24 46 C24 34 26 24 30 16" stroke="#6DBB5A" stroke-width="3" fill="none"/><ellipse cx="32" cy="10" rx="5" ry="10" fill="#C9D98A" transform="rotate(20 32 10)"/><path d="M18 46 C16 36 12 30 8 26" stroke="#6DBB5A" stroke-width="3" fill="none"/>',
    '고라니': '<ellipse cx="22" cy="28" rx="13" ry="8" fill="#B08A5A"/><path d="M13 34 v10 M18 35 v9 M27 35 v9 M32 34 v10" stroke="#8C6A3E" stroke-width="3"/><path d="M32 24 L38 12" stroke="#B08A5A" stroke-width="6" stroke-linecap="round"/><ellipse cx="40" cy="10" rx="6" ry="4.5" fill="#B08A5A"/><path d="M42 13 l1 4" stroke="#fff" stroke-width="2"/><circle cx="41" cy="9" r="1.4" fill="#1E1E1E"/>',
    '물까치': '<ellipse cx="22" cy="24" rx="10" ry="8" fill="#9FB4C8"/><circle cx="32" cy="18" r="6" fill="#2B3440"/><path d="M38 18 l6 1 l-6 2" fill="#2B3440"/><path d="M14 24 L2 32" stroke="#6C8FB8" stroke-width="5" stroke-linecap="round"/><path d="M18 20 C22 16 28 18 26 24" fill="#6C8FB8"/><path d="M20 32 v8 M24 32 v8" stroke="#2B3440" stroke-width="2"/>'
  };
  const SCE = { '다람쥐': '🐿️', '개미': '🐜', '지렁이': '🪱', '뱀': '🐍', '참새': '🐦', '독수리': '🦅', '나비': '🦋', '벌': '🐝', '비둘기': '🕊️', '붕어': '🐟', '상어': '🦈', '문어': '🐙', '게': '🦀', '조개': '🐚', '낙타': '🐫', '사막여우': '🦊', '북극곰': '🐻‍❄️', '펭귄': '🐧', '도마뱀': '🦎', '토끼': '🐰', '기린': '🦒', '코끼리': '🐘', '거북': '🐢', '물고기': '🐟', '새': '🐦', '오리': '🦆', '강아지': '🐕', '개': '🐕', '고양이': '🐈', '햄스터': '🐹', '민들레': '🌼', '소나무': '🌲', '단풍나무': '🍁', '토끼풀': '☘️', '수련': '🪷', '부들': '🌾', '선인장': '🌵', '바오바브나무': '🌳', '연잎': '🪷', '돌멩이': '🪨', '돌': '🪨', '벽돌': '🧱', '자동차': '🚗', '닭': '🐓', '병아리': '🐤', '어린 닭': '🐥', '다 자란 닭': '🐓', '개구리': '🐸', '소': '🐄', '돌고래': '🐬', '박쥐': '🦇', '벼': '🌾', '강낭콩': '🫘', '사과나무': '🍎', '애벌레': '🐛', '배추흰나비': '🦋', '어른벌레': '🦋', '무당벌레': '🐞', '사슴벌레': '🪲', '메뚜기': '🦗', '씨': '🫘', '싹': '🌱', '꽃': '🌸', '열매': '🫛', '자람': '🌿', '풀': '🌿', '나무': '🌳' };
  const sci = (it) => { const x = so(it), no = x.ic === 'none'; const ic = no ? '' : SCI[x.ic || x.name], em = x.emoji || (no ? '' : SCE[x.name]); return ic ? '<svg class="sc-ic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' + ic + '</svg>' : em ? '<i>' + esc(em) + '</i>' : ''; }; // ic:'none' = 그림 없이(같은 이름이 다른 생물일 때)
  const scChip = (it) => { const x = so(it); return '<span class="so-chip sc-chip' + (x.on ? ' on' : '') + (x.x ? ' x' : '') + '">' + sci(x) + md(x.name || '') + (x.tag ? '<u>' + md(x.tag) + '</u>' : '') + '</span>'; };
  // ask: 기준 질문으로 두 갈래 — q 질문(주황) · yes/no 칩 · ya/na 갈래 이름(기본 그렇다/아니다) · yt/nt 갈래 아래 한 줄 · note
  function ask(o) {
    const br = (items, lab, t, cls) => '<div class="sc-br ' + cls + '"><div class="sc-brh"><b>' + (cls === 'y' ? '○' : '✗') + '</b>' + md(lab) + '</div><div class="sc-brs">' + (items || []).map(scChip).join('') + '</div>' + (t ? '<div class="sc-brt">' + md(t) + '</div>' : '') + '</div>';
    if (!o.q && !(o.yes || []).length) return '';
    return '<div class="sc-ask"><div class="sc-q"><i>?</i>' + md(o.q || '') + '</div><div class="sc-fork"><i></i></div><div class="sc-brr">' + br(o.yes, o.ya || '그렇다', o.yt, 'y') + br(o.no, o.na || '아니다', o.nt, 'n') + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // habitat: 사는 곳 판 — zones [{at, name, items, note, on}] · at = land·under·sky·fresh·sea·water·desert·polar·field · stack:true 는 위아래(땅 위 / 땅속)
  const HAB = { land: ['땅 위', '🌿'], under: ['땅속', '🟫'], sky: ['하늘', '☁️'], fresh: ['강과 연못', '🏞️'], sea: ['바다', '🌊'], water: ['물', '💧'], desert: ['사막', '🏜️'], polar: ['극지', '🧊'], field: ['들과 산', '⛰️'], lake: ['강과 호수', '🏞️'] };
  function habitat(o) {
    const zs = (o.zones || []).filter(z => z && HAB[z.at]); if (!zs.length) return '';
    return '<div class="sc-hab n' + zs.length + (o.stack ? ' stack' : '') + '">' + zs.map(z => '<div class="sc-zone ' + z.at + (z.on ? ' on' : '') + '"><div class="sc-zh"><i>' + HAB[z.at][1] + '</i>' + md(z.name || HAB[z.at][0]) + '</div><div class="sc-zi">' + (z.items || []).map(scChip).join('') + '</div>' + (z.note ? '<div class="sc-zn">' + md(z.note) + '</div>' : '') + '</div>').join('') + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '');
  }
  // trait: 생김새 → 쓸모 — emoji·name(또는 subs 여럿) · rows [{part, use}] (part 주황 → use) · env 사는 곳 꼬리표
  function trait(o) {
    const one1 = (s) => '<div class="sc-trait"><div class="sc-who">' + (sci(s) || '<i>❔</i>') + '<b>' + md(s.name || '') + '</b>' + (s.env ? '<span class="sc-env ' + (s.envAt || '') + '">' + md(s.env) + '</span>' : '') + '</div><div class="sc-rows">' + (s.rows || []).map(r => '<div class="sc-row"><span class="sc-part">' + md(r.part) + '</span><em>→</em><span class="sc-use">' + md(r.use) + '</span></div>').join('') + '</div></div>';
    const subs = o.subs || [o]; if (!subs.some(s => (s.rows || []).length)) return '';
    return '<div class="sc-traits n' + subs.length + '">' + subs.map(one1).join('') + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '');
  }
  // anat: 이름표 그림 — of = leaf(잎몸·잎맥·잎자루) · fish(지느러미·아가미·비늘) · insect(머리·가슴·배·다리 세 쌍·날개 두 쌍) · cactus(줄기·가시·뿌리) · hyacinth(부레옥잠 볼록한 잎자루 속 공기) · hi 강조할 이름표(주황) · labels 이름표 글자 바꾸기
  const ANAT = {
    leaf: { d: '<path d="M230 40 C330 60 380 150 330 220 C300 250 260 250 230 244 C200 250 160 250 130 220 C80 150 130 60 230 40 Z" fill="#7CC46A" stroke="#3E8A2E" stroke-width="5"/><path d="M230 46 L230 246" stroke="#DDF2C9" stroke-width="6"/><g stroke="#DDF2C9" stroke-width="4" fill="none"><path d="M230 90 L178 70 M230 90 L282 70 M230 130 L160 110 M230 130 L300 110 M230 170 L158 160 M230 170 L302 160 M230 208 L176 206 M230 208 L284 206"/></g><path d="M230 246 L230 300" stroke="#4E8A3A" stroke-width="10" stroke-linecap="round"/>', L: { blade: ['잎몸', 300, 190, 402, 214], vein: ['잎맥', 272, 72, 402, 60], stalk: ['잎자루', 232, 282, 402, 290] }, vb: '0 0 520 320' },
    fish: { d: '<path d="M80 160 C120 80 300 70 360 160 C300 250 120 240 80 160 Z" fill="#7FB3E8" stroke="#3E6FCF" stroke-width="5"/><path d="M360 160 L440 110 L430 160 L440 210 Z" fill="#5B8DEF" stroke="#3E6FCF" stroke-width="5" stroke-linejoin="round"/><path d="M190 88 C210 50 250 50 270 86 Z" fill="#5B8DEF" stroke="#3E6FCF" stroke-width="4"/><path d="M200 200 C214 236 236 236 250 206 Z" fill="#5B8DEF" stroke="#3E6FCF" stroke-width="4"/><path d="M150 112 C170 140 170 180 150 208" stroke="#2E5AAF" stroke-width="6" fill="none"/><g fill="none" stroke="#B9D4F2" stroke-width="3">' + [0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => '<path d="M' + (190 + c * 30) + ' ' + (122 + r * 26) + ' q14 12 0 24"/>').join('')).join('') + '</g><circle cx="116" cy="146" r="10" fill="#fff"/><circle cx="114" cy="146" r="5" fill="#1E1E1E"/>', L: { fin: ['지느러미', 232, 64, 400, 34], gill: ['아가미', 158, 180, 90, 286], scale: ['비늘', 262, 172, 420, 290] }, vb: '0 0 520 320' },
    insect: { d: '', L: { head: ['머리', 124, 170, 46, 250], thorax: ['가슴', 214, 160, 214, 290], belly: ['배', 350, 150, 470, 40], leg: ['다리 세 쌍', 250, 236, 470, 290], wing: ['날개 두 쌍', 150, 70, 150, 24] }, vb: '0 0 520 320' },
    cactus: { d: '<path d="M60 250 H460" stroke="#D9BF93" stroke-width="10"/><path d="M200 250 C196 180 196 110 206 70 C214 40 250 40 258 70 C268 110 268 180 264 250 Z" fill="#6DBB5A" stroke="#3E7A2E" stroke-width="5"/><path d="M206 150 C170 150 160 130 164 104 C168 90 184 92 184 108 C184 124 196 128 206 128" fill="#6DBB5A" stroke="#3E7A2E" stroke-width="5"/><path d="M216 130 C220 160 220 200 216 236 M248 130 C244 160 244 200 248 236" stroke="#A7DDF2" stroke-width="8" stroke-linecap="round" opacity=".9"/><g stroke="#F2E6B0" stroke-width="3" stroke-linecap="round">' + [[206, 90, -1], [258, 96, 1], [204, 170, -1], [262, 180, 1], [204, 210, -1], [262, 220, 1], [168, 112, -1]].map(p => '<path d="M' + p[0] + ' ' + p[1] + ' l' + (p[2] * 16) + ' -8 M' + p[0] + ' ' + p[1] + ' l' + (p[2] * 16) + ' 4"/>').join('') + '</g><g stroke="#A0703C" stroke-width="5" fill="none" stroke-linecap="round"><path d="M230 250 C200 262 150 266 90 262 M230 250 C260 262 310 266 380 262 M216 252 C190 272 150 286 110 290 M246 252 C272 272 312 286 360 290"/></g>', L: { stem: ['줄기 · 물 저장', 248, 150, 320, 70], spine: ['가시 · 잎이 변함', 272, 181, 320, 170], root: ['넓게 뻗은 뿌리', 360, 262, 320, 290] }, vb: '0 0 560 320' },
    hyacinth: { d: '<rect x="20" y="170" width="480" height="140" fill="#D6EBFA"/><path d="M20 170 H500" stroke="#5B8DEF" stroke-width="5"/><g fill="#8CCB6A" stroke="#3E7A2E" stroke-width="4"><ellipse cx="200" cy="164" rx="34" ry="26"/><ellipse cx="300" cy="164" rx="34" ry="26"/></g><g fill="#fff" opacity=".85"><circle cx="192" cy="160" r="6"/><circle cx="206" cy="170" r="4"/><circle cx="296" cy="158" r="5"/><circle cx="310" cy="168" r="6"/></g><path d="M200 140 C190 100 200 70 222 56 M300 140 C312 100 300 70 280 56" stroke="#3E7A2E" stroke-width="7" fill="none"/><ellipse cx="220" cy="54" rx="36" ry="26" fill="#5CC08A" stroke="#2E7A4A" stroke-width="4"/><ellipse cx="284" cy="54" rx="36" ry="26" fill="#5CC08A" stroke="#2E7A4A" stroke-width="4"/><g stroke="#8A6B4A" stroke-width="4" fill="none"><path d="M240 184 C236 220 244 250 238 290 M252 186 C256 230 248 260 256 296 M264 184 C270 220 262 250 270 286"/></g>', L: { stalk: ['볼록한 잎자루', 176, 178, 60, 250], air: ['공기주머니', 304, 164, 420, 110], root: ['뿌리', 262, 260, 420, 280] }, vb: '0 0 520 320' }
  };
  function insectBody(wing) {
    let s = '';
    if (wing) s += '<g fill="#F4F6FA" stroke="#9AA6B2" stroke-width="3" opacity=".96"><path d="M200 146 C170 40 120 30 110 70 C104 100 150 130 200 150 Z"/><path d="M230 146 C260 40 320 30 330 70 C336 100 290 130 230 150 Z"/><path d="M204 160 C170 200 150 230 170 244 C190 252 206 210 210 164 Z" opacity=".9"/><path d="M226 160 C260 200 280 230 260 244 C240 252 224 210 220 164 Z" opacity=".9"/></g>';
    s += '<g stroke="#2B3440" stroke-width="5" fill="none" stroke-linecap="round">' + [180, 214, 248].map((x, i) => '<path d="M' + x + ' 176 L' + (x - 30 + i * 20) + ' 214 L' + (x - 44 + i * 26) + ' 250"/><path d="M' + x + ' 144 L' + (x - 30 + i * 20) + ' 106 L' + (x - 44 + i * 26) + ' 76"/>').join('') + '</g>';
    s += '<path d="M112 136 C96 100 84 90 70 88 M112 150 C90 122 76 118 62 122" stroke="#2B3440" stroke-width="4" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="130" cy="160" r="30" fill="#6B7C93"/><ellipse cx="214" cy="160" rx="54" ry="32" fill="#8A9AB0"/><ellipse cx="344" cy="160" rx="84" ry="40" fill="#A6B4C6"/><g stroke="#8A9AB0" stroke-width="3">' + [310, 340, 370].map(x => '<path d="M' + x + ' 124 v72"/>').join('') + '</g><circle cx="118" cy="152" r="6" fill="#fff"/>';
    return s;
  }
  function anat(o) {
    const A = ANAT[o.of]; if (!A) return '';
    let s = o.of === 'insect' ? insectBody(o.wing !== false) : A.d;
    const hi = [].concat(o.hi || []), lab = o.labels || {};
    Object.keys(A.L).forEach(k => {
      if (o.of === 'insect' && k === 'wing' && o.wing === false) return;
      if (o.only && o.only.indexOf(k) < 0) return;
      const L = A.L[k], on = hi.indexOf(k) >= 0, t = lab[k] || L[0], w = Math.max(90, t.length * 25 + 28), left = L[3] < L[1];
      const vw = +A.vb.split(' ')[2]; const bx = Math.max(6, Math.min(vw - w - 6, left ? L[3] - w + 20 : L[3] - 20)); // 이름표는 그림 틀 안에서만
      s += '<g class="o-lab' + (on ? ' on' : '') + '"><line x1="' + L[1] + '" y1="' + L[2] + '" x2="' + L[3] + '" y2="' + L[4] + '" stroke="' + (on ? ORANGE : '#6B7C93') + '" stroke-width="' + (on ? 5 : 3) + '"/><circle cx="' + L[1] + '" cy="' + L[2] + '" r="7" fill="' + (on ? ORANGE : '#6B7C93') + '"/><rect x="' + bx + '" y="' + (L[4] - 22) + '" width="' + w + '" height="42" rx="21" fill="' + (on ? ORANGE : '#fff') + '" stroke="' + (on ? ORANGE : '#6B7C93') + '" stroke-width="3"/>' + txt(bx + w / 2, L[4] + 9, t, 24, on ? '#fff' : INK, 900) + '</g>';
    });
    return '<div class="sc-anat">' + svgWrap(s, 'fig-anat ' + o.of, A.vb) + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // cycle: 한살이 — who 생물 이름 · stages [{name, emoji}] (이름만 주면 그림은 알아서) · hi 지금 단계(주황) · next:true 는 hi 다음 칸에 「다음은」 · fade 는 hi 뒤를 흐리게 · loop 다시 이어짐 한 줄 · skip 빠진 단계(빨강 아님, 점선)
  function cycle(o) {
    const st = (o.stages || []).map(so); if (!st.length) return '';
    const hi = o.hi == null ? -1 : o.hi;
    const cell = (x, i) => '<div class="sc-st' + (i === hi ? ' on' : '') + (o.next && i === hi + 1 ? ' nx' : '') + (o.fade && hi >= 0 && i > hi + (o.next ? 1 : 0) ? ' fade' : '') + (x.skip ? ' skip' : '') + '"><div class="sc-stic">' + (sci(x) || '<i>' + (i + 1) + '</i>') + '</div><b>' + md(x.name || '') + '</b>' + (x.note ? '<u>' + md(x.note) + '</u>' : '') + (o.next && i === hi + 1 ? '<span class="sc-nxt">다음은</span>' : '') + '</div>';
    return '<div class="sc-cycle n' + st.length + '">' + (o.who ? '<div class="sc-cwho">' + sci({ name: o.who, emoji: o.whoEmoji }) + '<b>' + md(o.who) + '</b>' + (o.tag ? '<span>' + md(o.tag) + '</span>' : '') + '</div>' : '') + '<div class="sc-sts">' + st.map((x, i) => (i ? '<em class="sc-ar">→</em>' : '') + cell(x, i)).join('') + '</div>' + (o.loop ? '<div class="sc-loop"><i></i><b>↺ ' + md(o.loop === true ? '다시 이어져요' : o.loop) + '</b></div>' : '') + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // cond: 조건 실험 — cols [{name, emoji}] 두 컵·화분 · rows [{name, emoji, v:[가, 나], diff}] diff = 다르게 할 조건(주황) · 나머지 = 같게 할 조건(파랑) · result {name, v:[가, 나], win} 결과(초록)
  function cond(o) {
    const cols = (o.cols || []).map(so); const rows = o.rows || []; if (!cols.length || !rows.length) return '';
    const head = '<div class="sc-crow head"><span></span>' + cols.map(c => '<span class="sc-ccol">' + sci(c) + '<b>' + md(c.name || '') + '</b></span>').join('') + '<span></span></div>';
    const row = (r) => '<div class="sc-crow ' + (r.diff ? 'diff' : 'same') + '"><span class="sc-cname">' + (r.emoji ? '<i>' + esc(r.emoji) + '</i>' : '') + md(r.name) + '</span>' + (r.v || []).map(v => '<span class="sc-cv">' + md(v) + '</span>').join('') + '<span class="sc-ctag">' + (r.diff ? '다르게' : '같게') + '</span></div>';
    const res = o.result ? '<div class="sc-crow res"><span class="sc-cname">' + md(o.result.name || '결과') + '</span>' + (o.result.v || []).map((v, i) => '<span class="sc-cv' + (o.result.win === i ? ' win' : '') + '">' + md(v) + '</span>').join('') + '<span class="sc-ctag">결과</span></div>' : '';
    return '<div class="sc-cond' + (cols.length > 2 ? ' n3' : '') + '">' + (o.title ? '<div class="sc-ctitle">' + md(o.title) + '</div>' : '') + head + rows.map(row).join('') + res + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '');
  }
  // need: 무엇이 필요할까 — title · items [{name, emoji, ok}] ok = 필요해요(파랑 ○) · false = 없어도 돼요(회색 ✗) · 여러 줄은 cols [{title, items}]
  function need(o) {
    const col = (c) => '<div class="sc-need"><div class="sc-nh">' + md(c.title || '') + '</div>' + (c.items || []).map(x => '<div class="sc-ni ' + (x.ok === false ? 'no' : 'ok') + '">' + (x.emoji ? '<i>' + esc(x.emoji) + '</i>' : '') + '<b>' + md(x.name) + '</b><em>' + (x.ok === false ? '✗ 없어도 돼요' : '○ 필요해요') + '</em></div>').join('') + '</div>';
    const cs = o.cols || [o]; if (!cs.some(c => (c.items || []).length)) return '';
    return '<div class="sc-needs n' + cs.length + '">' + cs.map(col).join('') + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '');
  }
  // bins: 과학 갈래 통 — groups 와 같되 생물 이름이면 그림이 알아서 붙는다
  function bins(o) {
    const bs = (o.bins || []).filter(b => b && (b.name || (b.items || []).length)); if (!bs.length) return '';
    return '<div class="so-groups sc-bins n' + bs.length + '">' + bs.map((b, i) => '<div class="so-bin ' + (b.tone || 't' + i) + '"><div class="so-binh">' + (b.emoji ? '<i>' + esc(b.emoji) + '</i>' : '') + md(b.name || '') + '</div><div class="so-bitems">' + (b.items || []).map(scChip).join('') + '</div>' + (b.hint ? '<div class="so-hint">' + md(b.hint) + '</div>' : '') + '</div>').join('') + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '');
  }
  // mimic: 본뜨기 — verb 화살표 위 낱말(기본 본떠요 · 한살이 「자라서」·잡는 방법 「이렇게」 등) · rows [[자연, 물건, 좋은 점]] 자연(초록) → 본떠요(주황) → 물건(파랑) · 좋은 점 꼬리표
  function mimic(o) {
    const rows = o.rows || []; if (!rows.length) return '';
    const c = (x, cls) => { const v = so(x); return '<span class="sc-mc ' + cls + '">' + sci(v) + md(v.name || '') + '</span>'; };
    const tag = rows.some(r => r[2]); return '<div class="sc-mimic n' + rows.length + (tag ? ' tag' : '') + '"><div class="sc-mrow head"><span>' + esc(o.ha || '자연에서') + '</span><em></em><span>' + esc(o.hb || '만든 물건') + '</span>' + (tag ? '<span></span>' : '') + '</div>' + rows.map(r => '<div class="sc-mrow">' + c(r[0], 'a') + '<em><i>' + esc(o.verb || '본떠요') + '</i>→</em>' + c(r[1], 'b') + (tag ? (r[2] ? '<u>' + md(r[2]) + '</u>' : '<span></span>') : '') + '</div>').join('') + '</div>' + (o.note ? '<div class="so-lnote">' + md(o.note) + '</div>' : '');
  }

  // ── 28차(2026-09-29) 3학년 2학기 곱셈 부품: vmul(곱셈 세로셈) · grid(모눈 가르기) · range(어림 사이) ──
  // vmul: a × b 세로셈(HTML). b 가 한 자리면 올림 수를 윗자리 위에 작게, 두 자리면 부분 곱 두 줄(십의 자리 줄은 한 자리 밀어) + 합.
  //       hi: 0 = 일의 자리 줄 · 1 = 십의 자리 줄 · 'r' = 답 · zero:true 면 밀어 적은 자리에 0 · answer:false 면 답 칸 비움
  function vmul(o) {
    const a = Math.max(0, +o.a | 0), b = Math.max(0, +o.b | 0), r = a * b; const two = b >= 10 && b % 10 !== 0;
    const bu = b % 10, bt10 = Math.floor(b / 10) % 10, p1 = a * bu, p2 = a * bt10;
    const N = Math.max(String(r).length, String(a).length, String(b).length, two ? String(p2).length + 1 : 0);
    const row = (str, cls, sign, extra) => { const t = String(str).padStart(N, ' ').split(''); return '<div class="vt-row ' + cls + '" style="grid-template-columns:repeat(' + N + ',54px)"' + (extra || '') + '>' + (sign ? '<em>' + sign + '</em>' : '') + t.map(x => '<span>' + (x === ' ' ? '' : esc(x)) + '</span>').join('') + '</div>'; };
    let carryRow = '';
    if (!two && b < 10 && o.carry !== false) { const A = String(a).split('').map(Number); const C = new Array(N).fill(''); let c = 0; const off = N - A.length; for (let i = A.length - 1; i >= 0; i--) { const v = A[i] * b + c; c = Math.floor(v / 10); if (c && i > 0) C[off + i - 1] = String(c); } if (C.some(Boolean)) carryRow = '<div class="vt-row vt-carry vm-carry" style="grid-template-columns:repeat(' + N + ',54px)">' + C.map(x => '<span>' + x + '</span>').join('') + '</div>'; }
    const hi = (k) => o.hi === k ? ' vm-hi' : '';
    let h = '<div class="vt vm" data-r="' + r + '"' + (two ? ' data-p="' + p1 + ',' + (p2 * 10) + '"' : '') + '>' + carryRow + row(a, 'vt-a') + row(b, 'vt-b', '×') + '<div class="vt-line"></div>';
    if (two) { h += row(p1, 'vm-p vm-p1' + hi(0)) + row(o.zero ? String(p2 * 10) : String(p2) + ' ', 'vm-p vm-p2' + hi(1)) + '<div class="vt-line"></div>'; }
    h += (o.answer === false ? row(''.padStart(N, ' '), 'vt-r vm-blank') : row(r, 'vt-r' + hi('r'))) + '</div>';
    const side = two && o.side !== false ? '<div class="vm-side"><div class="vm-sl' + hi(0) + '">' + a + ' × ' + bu + ' = ' + p1 + '</div><div class="vm-sl' + hi(1) + '">' + a + ' × ' + (bt10 * 10) + ' = ' + (p2 * 10) + '</div></div>' : '';
    return '<div class="fig-vert fig-vmul">' + '<div class="vm-wrap">' + h + side + '</div>' + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  // grid: 가로 w칸 × 세로 h칸 모눈을 sw·sh 로 갈라 덩이마다 부분 곱. 덩이 수 = sw 칸 × sh 칸.
  function grid(o) {
    const w = Math.max(1, o.w | 0), h = Math.max(1, o.h | 0);
    const sw = (o.sw && o.sw.length ? o.sw : [w]).map(x => x | 0), sh = (o.sh && o.sh.length ? o.sh : [h]).map(x => x | 0);
    const sc = Math.min(340 / w, 170 / h, 26), x0 = 86 + (340 - w * sc) / 2, y0 = 70; const FILL = ['#DCE8FB', '#FFE8CC', '#D9F2E3', '#EDE3FA'];
    let s = '', yy = y0, k = 0;
    sh.forEach((hh, j) => { let xx = x0; sw.forEach((ww, i) => { const bw = ww * sc, bh = hh * sc, col = FILL[(j * sw.length + i) % 4]; s += '<rect class="o-blk" x="' + xx.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" fill="' + col + '" data-v="' + (ww * hh) + '"/>';
      if (o.cells !== false && w <= 45 && h <= 45) { for (let c = 1; c < ww; c++) s += '<line x1="' + (xx + c * sc).toFixed(1) + '" y1="' + yy.toFixed(1) + '" x2="' + (xx + c * sc).toFixed(1) + '" y2="' + (yy + bh).toFixed(1) + '" stroke="rgba(43,52,64,.16)" stroke-width="1"/>'; for (let c = 1; c < hh; c++) s += '<line x1="' + xx.toFixed(1) + '" y1="' + (yy + c * sc).toFixed(1) + '" x2="' + (xx + bw).toFixed(1) + '" y2="' + (yy + c * sc).toFixed(1) + '" stroke="rgba(43,52,64,.16)" stroke-width="1"/>'; }
      const lab = o.labels === false ? '' : (bw > 96 && bh > 30 ? ww + ' × ' + hh + ' = ' + (ww * hh) : (bw > 34 && bh > 22 ? String(ww * hh) : '')); if (lab) s += txt(xx + bw / 2, yy + bh / 2 + 9, lab, bw > 96 && bh > 30 ? 22 : 18, INK);
      xx += bw; k++; }); yy += hh * sc; });
    let xx = x0; sw.forEach((ww, i) => { if (i) s += '<line class="o-cut" x1="' + xx.toFixed(1) + '" y1="' + (y0 - 8) + '" x2="' + xx.toFixed(1) + '" y2="' + (y0 + h * sc + 8).toFixed(1) + '" stroke="' + ORANGE + '" stroke-width="4"/>'; s += txt(xx + ww * sc / 2, y0 - 14, String(ww), 22, BLUE2); xx += ww * sc; });
    yy = y0; sh.forEach((hh, j) => { if (j) s += '<line class="o-cut" x1="' + (x0 - 8) + '" y1="' + yy.toFixed(1) + '" x2="' + (x0 + w * sc + 8).toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + ORANGE + '" stroke-width="4"/>'; s += txt(x0 - 16, yy + hh * sc / 2 + 8, String(hh), 22, BLUE2, 800, 'end'); yy += hh * sc; });
    s += '<rect x="' + x0.toFixed(1) + '" y="' + y0 + '" width="' + (w * sc).toFixed(1) + '" height="' + (h * sc).toFixed(1) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    s += txt(230, 32, o.title || ('가로 ' + w + '칸 × 세로 ' + h + '칸'), 24, '#6B7C93', 700);
    const parts = []; sh.forEach(hh => sw.forEach(ww => parts.push(ww * hh)));
    const by = y0 + h * sc + 44; if (o.sum !== false) s += txt(230, by, (parts.length > 1 ? parts.join(' + ') + ' = ' : '') + (w * h), 28, BLUE2);
    return svgWrap(s, 'fig-grid', '0 0 460 ' + Math.round(by + 20));
  }
  // range: 어림 사이 — lo~hi 띠(주황) 위에 계산한 값 at(파랑, 사이 밖이면 빨강)
  function range(o) {
    const lo = +o.lo, hi = +o.hi, at = o.at == null ? null : +o.at; const span = hi - lo, pad = span * 0.35, a0 = lo - pad, a1 = hi + pad; const X = (v) => 40 + 380 * (v - a0) / (a1 - a0), y = 160;
    let s = '<line x1="30" y1="' + y + '" x2="430" y2="' + y + '" stroke="' + INK + '" stroke-width="4"/><path d="M430 ' + y + ' l-14 -9 v18 z" fill="' + INK + '"/>';
    s += '<rect class="o-band" x="' + X(lo) + '" y="' + (y - 16) + '" width="' + (X(hi) - X(lo)) + '" height="32" rx="8" fill="#FFE1CC" stroke="' + ORANGE + '" stroke-width="3"/>';
    [lo, hi].forEach(v => { s += '<line x1="' + X(v) + '" y1="' + (y - 24) + '" x2="' + X(v) + '" y2="' + (y + 24) + '" stroke="' + ORANGE + '" stroke-width="4"/>' + txt(X(v), y + 56, String(v), 26, ORANGE); });
    const inn = at != null && at >= lo && at <= hi;
    if (at != null) s += '<circle class="o-at' + (inn ? '' : ' out') + '" cx="' + X(Math.max(a0, Math.min(a1, at))) + '" cy="' + y + '" r="13" fill="' + (inn ? BLUE2 : RED) + '" stroke="#fff" stroke-width="3"/>' + txt(X(Math.max(a0, Math.min(a1, at))), y - 34, (o.atLabel || String(at)), 28, inn ? BLUE2 : RED);
    s += txt(230, 44, o.label || (lo + '보다 크고 ' + hi + '보다 작아요'), 24, INK);
    if (o.tag) s += txt(230, 262, o.tag, 20, '#6B7C93');
    return svgWrap(s, 'fig-range', null).replace('<svg ', '<svg data-in="' + (at == null ? '' : inn ? 1 : 0) + '" ');
  }
  const SC_PARTS = { ask, habitat, trait, anat, cycle, cond, need, bins, mimic };

  const PARTS = { force, balance, lever, slope, scale, hand, robot, frac, fracs, numline, tenbox, geo, bt, regroup, share, bundle, arr, mulrows, eq, ruler, joins, road, clock, grid, range };
  const HTML_PARTS = { vert, tvert, vmul };
  function one(f) { if (!f || typeof f !== 'object') return ''; const fn = PARTS[f.k] || HTML_PARTS[f.k] || KO_PARTS[f.k] || SO_PARTS[f.k] || SC_PARTS[f.k]; return fn ? fn(f) : ''; }
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
    else if (SC_PARTS[f.k]) { body = SC_PARTS[f.k](f); if (!body) return ''; body = '<div class="fig-ko fig-so fig-sc">' + body + '</div>'; } // 27차 과학 생물 부품
    else if (SO_PARTS[f.k]) { body = SO_PARTS[f.k](f); if (!body) return ''; body = '<div class="fig-ko fig-so">' + body + '</div>'; } // 26차 사회 부품도 자기 종이·통을 갖는다
    else if (KO_PARTS[f.k]) { body = KO_PARTS[f.k](f); if (!body) return ''; body = '<div class="fig-ko">' + body + '</div>'; } // 24차 국어 부품은 흰 칸 없이 그대로(자기 종이·통을 갖는다)
    else { const p = panel(f); if (!p) return ''; body = '<div class="fig-panels n1">' + p + '</div>'; }
    return '<div class="fig" data-fig="' + esc(f.k) + '">' + body + (f.key !== false && hasArrow(f) ? KEY : '') + '</div>';
  }
  global.KT2_FIG = { render, parts: Object.keys(PARTS).concat(Object.keys(HTML_PARTS), Object.keys(KO_PARTS), Object.keys(SO_PARTS), Object.keys(SC_PARTS), ['panels', 'tools', 'chain', 'places']), icons: Object.keys(ICON), sizes: AL };
})(typeof window !== 'undefined' ? window : globalThis);
