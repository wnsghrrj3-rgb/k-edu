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
   · 30차(2026-09-29) 3학년 2학기 나눗셈 부품: vdiv(나눗셈 세로셈 — 몫 자리 맞춤·가운데 0·내림·나머지·확인 식) · brem(묶고 남은 것 따로)
   · 31차(2026-09-29) 3학년 2학기 원 부품: circ(중심·반지름·지름·중심을 지나지 않는 선분·점·접은 선·띠종이·점 찍기) · compass(벌린 길이 = 반지름) · cgrid(모눈 위 원 무늬) · crow(지름으로 바꾸어 크기 견주기)
   · 32차(2026-09-29) 3학년 2학기 분수와 소수 부품: fgroup(묶어서 분수·분수만큼) · fmix(1보다 큰 분수·소수 — 가분수·대분수 띠/원) · nline(1보다 큰 수직선 — 분수·대분수·소수 점)
   · 60차(2026-10-01) vmul parts:false(answer:false 와 함께 — 부분 곱 줄까지 비움, 문제 장용)
   · 59차(2026-10-01) 4학년 1학기 각도 부품: ang(각 하나 — 호·도·직각 ㄱ자·단위 각 칸·어림 기준선·예각/직각/둔각) · prot(각도기 — 안쪽·바깥쪽 눈금, 밑금 방향에 따라 읽는 눈금) · asum(각도의 합·차·한 점에 모으기) · polyang(삼각형·사각형 안쪽 각 — 크기대로 그림·대각선)
   · 64차(2026-10-02) 4학년 1학기 관계와 규칙 부품: bal(저울 — 식을 셈해 기울기) · shapes(모양의 배열 — 변하는/변하지 않는 부분) · ngrid(수 배열표·수열) · eqs(계산식의 배열) · eqc(등호 카드 — 옳음은 부품이 셈)
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
    return '<div class="fig-card' + (it.kind ? ' k-' + (it.kind === '지레' ? 'lever' : it.kind === '빗면' ? 'slope' : 'other') : '') + (!svg && !it.emoji ? ' text' : '') + (it.on ? ' on' : '') + (it.keep ? ' keep' : '') + '">' + (svg ? '<svg class="fig-ico" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>' : it.emoji ? '<div class="fig-emo">' + esc(it.emoji) + '</div>' : '') + '<b>' + esc(name) + '</b>' + (it.kind ? '<span>' + esc(it.kind) + '</span>' : '') + '</div>';
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
    const units = o.units || ['시', '분', '초'], runits = o.runits || units, N = units.length, op = o.op || '+', BASE = +o.base || 60; // 33차: base 1000 = L·mL / kg·g
    const nz = (x) => x == null ? null : (+x || 0), A = (o.a || []).map(nz), B = (o.b || []).map(nz); while (A.length < N) A.unshift(0); while (B.length < N) B.unshift(0); const NA = A.map(x => x || 0), NB = B.map(x => x || 0); // null 칸 = 그 단위가 없음(빈칸)
    const R = [], carry = [], borrow = [];
    if (op === '+') { let c = 0; for (let i = N - 1; i >= 0; i--) { let v = NA[i] + NB[i] + c; c = 0; if (i > 0 && v >= BASE) { v -= BASE; c = 1; carry[i - 1] = true; } R[i] = v; } }
    else { let br = 0; for (let i = N - 1; i >= 0; i--) { let v = NA[i] - br - NB[i]; br = 0; if (v < 0 && i > 0) { v += BASE; br = 1; borrow[i] = true; } R[i] = v; } }
    const lead = (arr) => { let i = 0; while (i < N - 1 && !arr[i]) i++; return i; }; // 앞쪽 0 은 빈칸
    const row = (arr, us, cls, from) => '<div class="tv-row ' + cls + '">' + arr.map((v, i) => '<span' + (i < from || v == null ? ' class="mute"' : '') + '>' + (i < from || v == null ? '' : v + '<u>' + esc(us[i] || '') + '</u>') + '</span>').join('') + '</div>';
    const top = '<div class="tv-row tv-carry">' + A.map((v, i) => '<span>' + (op === '+' && carry[i] ? '1' : op !== '+' && borrow[i + 1] ? '<i>' + (NA[i] - 1) + '</i>' : op !== '+' && borrow[i] ? '<b>+' + BASE + '</b>' : '') + '</span>').join('') + '</div>';
    const h = '<div class="tv n' + N + (BASE >= 1000 ? ' wide' : '') + '">' + top + row(A, units, 'tv-a', lead(A)) + row(B, units, 'tv-b', lead(B)).replace('<div class="tv-row tv-b">', '<div class="tv-row tv-b"><em>' + (op === '+' ? '+' : '−') + '</em>') + '<div class="tv-line"></div>' + (o.answer === false ? '' : row(R, runits, 'tv-r', lead(R))) + '</div>';
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
  // 36차: sym2 = 「조금 더 쉬어」 표시를 교과서 기호(예: ≡)로 — 없으면 종전 ∨∨ 그대로
  const wedge = (s, s2) => { let h = md(s).replace(/∨∨|∨/g, m => m.length > 1 ? '<i class="ko-p2">∨∨</i>' : '<i class="ko-p1">∨</i>'); if (s2) h = h.split(esc(s2)).join('<i class="ko-p2">' + esc(s2) + '</i>'); return h; };
  function pause(o) {
    let s = '';
    if (o.rows) s += '<div class="ko-rows">' + o.rows.map(r => '<div class="ko-row"><b class="ko-sym">' + esc(r.sym) + '</b><span>' + esc(r.name) + '</span>' + (r.mark ? wedge(r.mark) : '<i class="ko-up">↗</i>') + '<u>' + md(r.say) + '</u></div>').join('') + '</div>';
    if (o.lines) s += '<div class="ko-lines">' + o.lines.map(l => '<div class="ko-line">' + wedge(l, o.sym2) + '</div>').join('') + '</div>';
    if (!s) return '';
    return '<div class="ko-pause">' + s + (o.key === false ? '' : '<div class="ko-key"><i class="ko-p1">∨</i> 조금 쉬어요 &nbsp;·&nbsp; <i class="ko-p2">' + esc(o.sym2 || '∨∨') + '</i> 조금 더 쉬어요</div>') + '</div>';
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
    return '<div class="ko-sort2 n' + bins.length + (o.wide ? ' wide' : '') + '">' + bins.join('') + '</div>';
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
  // ── 45차(2026-09-30) 사회 3-2 부품 — 그림 문법 그대로(주황 = 견준 두 해·칠한 사람 · 파랑 = 나머지) ──
  // sbars: 세로 막대그래프 — title · x[] 가로 이름 · v[] 값 · unit 단위 · xl/yl 가로·세로 이름 · hi[] 주황으로 견줄 막대 번호 · cmp:true 면 hi 두 막대 차이 캡션 · data-v
  function sbars(o) {
    const x = o.x || [], v = (o.v || []).map(Number); if (!v.length) return '';
    const n = v.length, W0 = 760, H0 = 400, L = 70, R = 24, T = 30, B = 70, mx = Math.max.apply(null, v) || 1;
    const step = Math.pow(10, Math.floor(Math.log10(mx))), top = Math.ceil(mx / step) * step, gw = (W0 - L - R) / n, bw = Math.min(70, gw * 0.56), hi = o.hi || [];
    let s = '';
    for (let i = 0; i <= 4; i++) { const yv = top * i / 4, y = H0 - B - (H0 - T - B) * i / 4; s += '<line x1="' + L + '" y1="' + y + '" x2="' + (W0 - R) + '" y2="' + y + '" stroke="#DCE3EC" stroke-width="2"/><text x="' + (L - 10) + '" y="' + (y + 7) + '" font-size="20" text-anchor="end" fill="#6B7C93">' + (Math.round(yv * 10) / 10) + '</text>'; }
    v.forEach((val, i) => { const h = (H0 - T - B) * val / top, cx = L + gw * i + gw / 2, on = hi.indexOf(i) >= 0;
      s += '<rect x="' + (cx - bw / 2) + '" y="' + (H0 - B - h) + '" width="' + bw + '" height="' + h + '" rx="6" fill="' + (on ? '#FF7A2F' : '#7FA4E8') + '"/>'
        + '<text x="' + cx + '" y="' + (H0 - B - h - 10) + '" font-size="24" font-weight="800" text-anchor="middle" fill="' + (on ? '#D9591A' : '#2B4C8C') + '">' + val + '</text>'
        + '<text x="' + cx + '" y="' + (H0 - B + 30) + '" font-size="21" text-anchor="middle" fill="#334">' + esc(String(x[i] == null ? '' : x[i])) + '</text>'; });
    s += '<line x1="' + L + '" y1="' + (H0 - B) + '" x2="' + (W0 - R) + '" y2="' + (H0 - B) + '" stroke="#334" stroke-width="3"/>';
    s += '<text x="' + (W0 - R) + '" y="' + (H0 - 8) + '" font-size="19" text-anchor="end" fill="#6B7C93">' + esc(o.xl || '') + '</text><text x="' + 8 + '" y="' + 20 + '" font-size="19" fill="#6B7C93">' + esc(o.yl || '') + '</text>';
    let cap = o.caption || '';
    if (o.cmp && hi.length === 2) { const a = v[hi[0]], b = v[hi[1]], d = Math.abs(a - b); cap = x[hi[0]] + ' ' + a + (o.unit || '') + ' → ' + x[hi[1]] + ' ' + b + (o.unit || '') + ' · ' + (d === 0 ? '같아요' : d + (o.unit || '') + ' ' + (b < a ? '줄었어요' : '늘었어요')); }
    return '<div class="so-bars" data-v="' + v.join(',') + '" data-hi="' + hi.join(',') + '">' + (o.title ? '<div class="so-bt">' + md(o.title) + '</div>' : '') + '<svg class="fig-svg" viewBox="0 0 ' + W0 + ' ' + H0 + '" xmlns="http://www.w3.org/2000/svg" role="img">' + s + '</svg>' + (cap ? '<div class="so-bcap">' + md(cap) + '</div>' : '') + '</div>';
  }
  // dots: 백 명 마을 — groups [{name, on 칠한 수, of 전체(기본 100)}] · lab 칠한 사람 이름 · rest 나머지 이름 · 동그라미 하나 = 한 사람(10 × 10) · data-on
  function dots(o) {
    const gs = (o.groups || []).filter(Boolean); if (!gs.length) return '';
    const one = (g) => { const of = g.of || 100, on = Math.max(0, Math.min(of, +g.on || 0)); let s = '';
      for (let i = 0; i < of; i++) { const r = Math.floor(i / 10), c = i % 10, k = of - 1 - i < on; s += '<circle cx="' + (14 + c * 26) + '" cy="' + (14 + r * 26) + '" r="10" fill="' + (k ? '#FF7A2F' : '#C9D8F2') + '"/>'; }
      return '<div class="so-dot1"><div class="so-dh">' + esc(g.name || '') + '</div><svg class="fig-svg" viewBox="0 0 264 ' + (Math.ceil(of / 10) * 26 + 2) + '" xmlns="http://www.w3.org/2000/svg" role="img">' + s + '</svg><div class="so-dc"><b>' + esc(o.lab || '노인') + ' ' + on + '명</b> · ' + esc(o.rest || '나머지') + ' ' + (of - on) + '명</div></div>'; };
    return '<div class="so-dots n' + gs.length + '" data-on="' + gs.map(g => +g.on || 0).join(',') + '">' + gs.map(one).join('') + (o.note ? '<div class="so-dnote">' + md(o.note) + '</div>' : '') + '</div>';
  }
  // led: 전광판(54차) — cols 칸 수 · kinds [갈래 이름] · cells [{name, k}] (k < kinds.length = 불 켠 칸 · 그 밖 = 꺼진 칸) · caption
  //      켠 칸은 갈래마다 색(노랑·주황·하늘) · data-lit = 켠 칸 수 · data-shape = 줄마다 #(켬)/.(끔) 을 | 로 이음 — 켠 칸이 모여 글자·수가 나타나는 판
  function led(o) {
    const cells = (o.cells || []).filter(Boolean), W = Math.max(1, o.cols | 0 || 8), K = (o.kinds || []).length; if (!cells.length) return '';
    const on = (c) => c.k != null && c.k >= 0 && c.k < K; const rows = []; for (let i = 0; i < cells.length; i += W) rows.push(cells.slice(i, i + W).map(c => on(c) ? '#' : '.').join(''));
    const CO = o.colors || [], bg = (k) => CO[k] ? ' style="background:' + esc(CO[k]) + ';color:#fff;box-shadow:0 0 14px ' + esc(CO[k]) + '"' : ''; // 76차: colors[] = 갈래마다 원문 색(픽셀 지도 범례) — 없으면 k0~k2 기본 색
    return '<div class="so-led' + (CO.length ? ' px' : '') + '" data-lit="' + cells.filter(on).length + '" data-shape="' + rows.join('|') + '"><div class="so-ledg" style="grid-template-columns:repeat(' + W + ',1fr)">' + cells.map(c => '<span class="so-lc ' + (on(c) ? 'on k' + c.k : 'off') + '"' + (on(c) ? bg(c.k) : '') + '>' + esc(c.name || '') + '</span>').join('') + '</div>'
      + (K ? '<div class="so-ledk">' + o.kinds.map((n, i) => '<span><i class="k' + i + '"' + (CO[i] ? ' style="background:' + esc(CO[i]) + '"' : '') + '></i>' + esc(n) + '</span>').join('') + '<span><i class="off"></i>' + esc(o.offName || '꺼진 칸') + '</span></div>' : '') + (o.caption ? '<div class="so-lnote">' + md(o.caption) + '</div>' : '') + '</div>';
  }
  const SO_PARTS = { tline, map, link, then, groups, pcard, news, post, exhibit, sbars, dots, led };

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
    const pb = o.answer === false && o.parts === false; // 60차 — 문제 장: 부분 곱 줄도 비움(답을 가림)
    if (two) { h += row(pb ? '' : p1, 'vm-p vm-p1' + hi(0) + (pb ? ' vm-blank' : '')) + row(pb ? '' : (o.zero ? String(p2 * 10) : String(p2) + ' '), 'vm-p vm-p2' + hi(1) + (pb ? ' vm-blank' : '')) + '<div class="vt-line"></div>'; }
    h += (o.answer === false ? row(''.padStart(N, ' '), 'vt-r vm-blank') : row(r, 'vt-r' + hi('r'))) + '</div>';
    const side = two && o.side !== false && !pb ? '<div class="vm-side"><div class="vm-sl' + hi(0) + '">' + a + ' × ' + bu + ' = ' + p1 + '</div><div class="vm-sl' + hi(1) + '">' + a + ' × ' + (bt10 * 10) + ' = ' + (p2 * 10) + '</div></div>' : '';
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
  // ── 30차(2026-09-29) 3학년 2학기 나눗셈 부품: vdiv(나눗셈 세로셈 — 몫 자리 맞춤·내림·나머지) · brem(묶고 남은 것 따로) ──
  // vdiv: a ÷ d 세로셈(HTML). 몫은 나누어지는 수의 자리에 맞추어 위에, 나눌 수 없는 가운데 자리는 몫에 0.
  //       단계마다 (몫 숫자 × d) 를 그 자리 아래에 적고 줄을 그은 뒤, 남은 수에 다음 자리를 내려 적는다(몫 숫자 0 인 자리는 곱 줄 없이 내림만).
  //       hi: 'q' 몫 · 'r' 나머지 줄 · 숫자 k = k번째 단계(곱·남은 수) 주황 · steps:false 면 몫과 나누어지는 수만 · answer:false 면 몫·단계 비움
  //       side:false 면 옆 칸 없음 · check:true 면 옆 칸에 확인 식(나누는 수 × 몫 + 나머지 = 나누어지는 수)
  function vdivCalc(a, d) {
    const D = String(a).split('').map(Number), N = D.length; let cur = 0, started = false; const qd = [], steps = [];
    for (let i = 0; i < N; i++) { cur = cur * 10 + D[i]; if (!started && cur < d && i < N - 1) { qd.push(''); continue; } const q = Math.floor(cur / d); started = true; qd.push(String(q)); if (q > 0) steps.push({ col: i, cur, prod: q * d }); cur -= q * d; }
    return { N, qd, steps, rem: cur, q: Math.floor(a / d) };
  }
  function vdiv(o) {
    const a = Math.max(0, +o.a | 0), d = Math.max(1, +o.d | 0), C = vdivCalc(a, d), N = C.N;
    const cols = 'grid-template-columns:62px repeat(' + N + ',54px)';
    const at = (num, end) => { const t = String(num).split(''); const arr = new Array(N).fill(''); for (let i = 0; i < t.length; i++) { const c = end - (t.length - 1) + i; if (c >= 0 && c < N) arr[c] = t[i]; } return arr; };
    const row = (arr, cls, lead) => '<div class="vd-row ' + cls + '" style="' + cols + '"><span class="vd-l">' + (lead || '') + '</span>' + arr.map(x => '<span>' + esc(x) + '</span>').join('') + '</div>';
    const line = (from, to) => '<div class="vd-row vd-ln" style="' + cols + '"><span class="vd-l"></span>' + new Array(N).fill(0).map((_, i) => '<span' + (i >= from && i <= to ? ' class="on"' : '') + '></span>').join('') + '</div>';
    const hi = (k) => (o.hi === k ? ' vd-hi' : '');
    const blank = o.answer === false;
    let h = '<div class="vd" data-a="' + a + '" data-d="' + d + '" data-q="' + C.q + '" data-rem="' + C.rem + '">';
    h += row(blank ? new Array(N).fill('') : C.qd, 'vd-q' + hi('q') + (blank ? ' vd-blank' : ''));
    h += row(String(a).split(''), 'vd-a', '<b>' + d + '</b>');
    if (o.steps !== false && !blank) {
      C.steps.forEach((st, k) => {
        const pl = String(st.prod).length; h += row(at(st.prod, st.col), 'vd-p' + hi(k)) + line(st.col - pl + 1, st.col);
        const nx = C.steps[k + 1]; const last = !nx; const end = last ? N - 1 : nx.col; const val = last ? C.rem : nx.cur;
        h += row(at(val, end), (last ? 'vd-r' + hi('r') : 'vd-w') + hi(k).replace('vd-hi', last ? '' : 'vd-hi'));
      });
    }
    h += '</div>';
    const sideLines = [];
    if (o.side !== false && !blank) { sideLines.push('<div class="vd-sl' + hi('q') + '">몫 <b>' + C.q + '</b></div>'); sideLines.push('<div class="vd-sl' + hi('r') + '">나머지 <b>' + C.rem + '</b></div>'); if (o.check) sideLines.push('<div class="vd-sl vd-ck">' + d + ' × ' + C.q + (C.rem ? ' + ' + C.rem : '') + ' = ' + a + '</div>'); }
    const side = sideLines.length ? '<div class="vd-side">' + sideLines.join('') + '</div>' : '';
    return '<div class="fig-vert fig-vdiv"><div class="vd-wrap">' + h + side + '</div>' + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  // brem: total 개를 per 개씩 묶기 — 묶음(점선 상자) + 남은 것(빨강 테 「나머지」). 묶음 수가 몫, 남은 수가 나머지.
  function brem(o) {
    const total = Math.max(0, o.total | 0), k = Math.max(1, o.per | 0), g = Math.floor(total / k), r = total % k; let s = '';
    const AW2 = r ? 340 : 440, bw = AW2 / Math.max(1, g), cs = Math.min(22, (bw - 14) / Math.min(k, 3));
    const perRow = Math.min(k, 3), rows = Math.ceil(k / perRow), bh = rows * cs + 22;
    for (let i = 0; i < g; i++) { const cx = 10 + bw * i + bw / 2, half = Math.min(60, bw / 2 - 5); s += '<rect class="o-grp" x="' + (cx - half).toFixed(1) + '" y="' + (140 - bh / 2).toFixed(1) + '" width="' + (2 * half).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="12" fill="#FFF7E0" stroke="' + YEL + '" stroke-width="3" stroke-dasharray="8 5"/>'; for (let j = 0; j < k; j++) { const col = j % perRow, rw = Math.floor(j / perRow); s += '<circle cx="' + (cx - (perRow - 1) * cs / 2 + col * cs).toFixed(1) + '" cy="' + (140 - (rows - 1) * cs / 2 + rw * cs).toFixed(1) + '" r="' + Math.max(4, cs * 0.38).toFixed(1) + '" fill="' + (o.color || BLUE) + '" stroke="#fff" stroke-width="2"/>'; } }
    if (r) { const x0 = 360, half = 44; s += '<rect class="o-rest" x="' + (x0 - 2) + '" y="' + (140 - bh / 2 - 4).toFixed(1) + '" width="' + (half * 2 + 4) + '" height="' + (bh + 8).toFixed(1) + '" rx="12" fill="#FFF0F0" stroke="' + RED + '" stroke-width="3"/>'; for (let j = 0; j < r; j++) { const col = j % 3, rw = Math.floor(j / 3); s += '<circle cx="' + (x0 + half - (Math.min(r, 3) - 1) * 12 + col * 24) + '" cy="' + (140 - (Math.ceil(r / 3) - 1) * 12 + rw * 24) + '" r="8" fill="' + RED + '" stroke="#fff" stroke-width="2"/>'; } s += txt(x0 + half, 140 + bh / 2 + 32, '나머지 ' + r, 22, RED); }
    s += txt(230, 44, o.label || (total + '개를 ' + k + '개씩 묶으면'), 24) + txt(r ? 180 : 230, 140 + bh / 2 + 32, g + '묶음', 26, BLUE2);
    return svgWrap(s, 'fig-brem').replace('<svg ', '<svg data-g="' + g + '" data-r="' + r + '" ');
  }
  // ── 31차(2026-09-29) 3학년 2학기 원 부품: circ(원 하나) · compass(컴퍼스) · cgrid(모눈 위 원 무늬) · crow(크기 견주기) ──
  // 원 그림 문법: 파랑 = 반지름 · 주황 = 지름 · 회색 = 원의 중심을 지나지 않는 선분 · 검정 점 = 원의 중심(ㅇ)
  const RAD = (d) => d * Math.PI / 180;
  function offLab(p, q, t, col, d) { // 선분 p→q 가운데에서 위쪽으로 비켜 글자
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if (ny > 0) { nx = -nx; ny = -ny; } d = d == null ? 22 : d;
    return txt((mx + nx * d).toFixed(1), (my + ny * d + 8).toFixed(1), t, 22, col);
  }
  function circ(o) {
    const cx = o.cx || 230, cy = o.cy || 150, R = o.R || 100, u = o.unit || 'cm';
    const at = (deg, k) => [cx + R * (k == null ? 1 : k) * Math.cos(RAD(deg)), cy - R * (k == null ? 1 : k) * Math.sin(RAD(deg))];
    const ln = (p, q, col, w, cls, dash) => '<line class="' + cls + '" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
    const dot = (p, lab, fill, below, st) => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="7" fill="' + (fill || INK) + '" stroke="' + (st || '#fff') + '" stroke-width="' + (st ? 3 : 2) + '"/>' + (lab ? txt(p[0].toFixed(1), (p[1] + (below ? 34 : -14)).toFixed(1), lab, 22) : '');
    const C = [cx, cy]; let s = '';
    if (o.oval) { s += '<ellipse class="o-oval" cx="' + cx + '" cy="' + cy + '" rx="' + (R * 1.5).toFixed(0) + '" ry="' + (R * 0.72).toFixed(0) + '" fill="#F4F8FF" stroke="' + INK + '" stroke-width="4"/>'; }
    else if (o.line !== false) s += '<circle class="o-circ" cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#F4F8FF" stroke="' + INK + '" stroke-width="4"/>';
    if (o.dots) for (let i = 0; i < o.dots; i++) { const p = at(360 * i / o.dots + 90); s += '<circle class="o-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="6" fill="' + BLUE2 + '"/>' + (i % 3 === 0 ? ln(C, p, REST2, 3, 'o-spoke', '6 6') : ''); }
    if (o.strip) { const H2 = o.strip.holes || [1, 2, 3, 4], a = o.strip.at || H2[H2.length - 1], k = R / a, ex = cx + k * H2[H2.length - 1] + 18; // 누름 못과 띠종이
      s += '<rect class="o-strip" x="' + (cx - 18) + '" y="' + (cy - 14) + '" width="' + (ex - cx + 18).toFixed(1) + '" height="28" rx="8" fill="#FFE8C2" stroke="' + WOOD + '" stroke-width="3"/>';
      H2.forEach(h => { const x = cx + k * h; s += '<circle cx="' + x.toFixed(1) + '" cy="' + cy + '" r="7" fill="#fff" stroke="' + WOOD2 + '" stroke-width="2"/>' + txt(x.toFixed(1), cy + 36, h, 18, h === a ? '#C2551A' : '#6B7C93', 800); });
      s += txt((ex + 8).toFixed(1), cy + 36, u, 16, '#6B7C93', 700, 'start');
      const px = cx + k * a; s += '<path class="o-pencil" d="M' + px.toFixed(1) + ' ' + (cy - 6) + ' l-10 -40 h20 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>';
      s += '<circle class="o-pin" cx="' + cx + '" cy="' + cy + '" r="11" fill="' + RED + '" stroke="#fff" stroke-width="3"/>'; }
    if (o.fold) { const p = at(o.fold === true ? 90 : o.fold), q = at((o.fold === true ? 90 : o.fold) + 180); s += ln([p[0], p[1] - 14], [q[0], q[1] + 14], ORANGE, 5, 'o-fold', '12 8') + txt(p[0] + 58, p[1] + 4, '접은 선', 20, ORANGE); }
    (o.chords || []).forEach((c) => { const p = at(c.a), q = at(c.b); s += ln(p, q, '#8A93A0', 5, 'o-chord' + (c.on ? ' on' : '')) + (c.lab ? offLab(p, q, c.lab, '#5A6472', 22).replace('font-size="22"', 'font-size="24"') : '') + dot(p, c.la, '#8A93A0', Math.sin(RAD(c.a)) < 0) + dot(q, c.lb, '#8A93A0', Math.sin(RAD(c.b)) < 0); });
    (o.diam || []).forEach((a, i) => { const p = at(a), q = at(a + 180); s += ln(p, q, ORANGE, 6, 'o-diam' + (o.hi === 'd' ? ' on' : ''));
      if (o.split && i === 0 && o.rcm != null) { s += offLab(p, C, o.rcm + ' ' + u, BLUE2) + offLab(C, q, o.rcm + ' ' + u, BLUE2) + txt(cx, (cy + 52).toFixed(1), '지름 ' + o.dcm + ' ' + u, 24, ORANGE); }
      else if (o.dlab || (o.dcm != null && (i === 0 || o.all))) s += offLab(p, q, o.dlab || (o.dcm + ' ' + u), ORANGE, 18);
      if (o.dlabs && o.dlabs[i]) { const m = at(a, 0.62); s += txt((m[0] + 4).toFixed(1), (m[1] - 14).toFixed(1), o.dlabs[i], 24, '#C2551A'); } });
    (o.radii || []).forEach((a, i) => { const p = at(a); s += ln(C, p, BLUE, 6, 'o-rad' + (o.hi === 'r' ? ' on' : '')) + '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="6" fill="' + BLUE + '"/>';
      if (o.rcm != null && (i === 0 || o.all)) s += offLab(C, p, o.rcm + ' ' + u, BLUE2, 18); });
    (o.pts || []).forEach(pt => { const p = at(pt.a, pt.d); s += '<g class="o-pt' + (pt.d === 1 ? ' on' : '') + '">' + dot(p, pt.lab, pt.d === 1 ? ORANGE : '#fff', false, pt.d === 1 ? '' : INK) + '</g>'; });
    if (o.center !== false && !o.oval) s += '<circle class="o-center" cx="' + cx + '" cy="' + cy + '" r="7" fill="' + INK + '"/>' + (o.cl !== '' ? txt(cx - 18, cy + 30, o.cl || 'ㅇ', 22) : '');
    if (o.names) { s += txt(cx - 30, cy + 58, '원의 중심', 18, INK, 800, 'end').replace('text-anchor="end"', 'text-anchor="middle"'); if ((o.radii || []).length) s += offLab(C, at(o.radii[0]), '반지름', BLUE2, -24); if ((o.diam || []).length && !o.split) s += offLab(at(o.diam[0]), at(o.diam[0] + 180), '지름', ORANGE, -26); }
    if (o.oval) s += txt(cx + R * 1.5 - 6, cy - R * 0.72, '✗', 34, RED);
    if (o.label) s += txt(230, 30, o.label, 22, '#3B4252');
    const attrs = 'data-rcm="' + (o.rcm != null ? o.rcm : '') + '" data-dcm="' + (o.dcm != null ? o.dcm : '') + '" data-nr="' + (o.radii || []).length + '" data-nd="' + (o.diam || []).length + '" ';
    return svgWrap(s, 'fig-circ').replace('<svg ', '<svg ' + attrs);
  }
  // compass: 컴퍼스를 cm 만큼 벌려 그린 원. 벌린 길이 = 반지름 → 지름 = 2배(data-open·data-d).
  function compass(o) {
    const cm = Math.max(1, +o.cm || 1), max = Math.max(cm, +o.max || cm), k = Math.min(34, 118 / max), R = cm * k, cx = o.steps ? 170 : 200, cy = 168;
    let s = '<circle class="o-circ" cx="' + cx + '" cy="' + cy + '" r="' + R.toFixed(1) + '" fill="#F4F8FF" stroke="' + INK + '" stroke-width="4"' + (o.draft ? ' stroke-dasharray="10 8"' : '') + '/>';
    const px = cx + R, apx = cx + R / 2, apy = cy - Math.max(96, R * 0.9 + 40);
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + px.toFixed(1) + '" y2="' + cy + '" stroke="' + BLUE + '" stroke-width="6" stroke-linecap="round"/>' + txt(((cx + px) / 2).toFixed(1), cy + 32, cm + ' cm', 22, BLUE2);
    s += '<line x1="' + apx.toFixed(1) + '" y1="' + apy.toFixed(1) + '" x2="' + cx + '" y2="' + (cy - 3) + '" stroke="#6B7C93" stroke-width="7" stroke-linecap="round"/><line x1="' + apx.toFixed(1) + '" y1="' + apy.toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + (cy - 10) + '" stroke="#6B7C93" stroke-width="7" stroke-linecap="round"/>'
      + '<rect x="' + (apx - 7).toFixed(1) + '" y="' + (apy - 26).toFixed(1) + '" width="14" height="24" rx="5" fill="#3B4252"/><circle cx="' + apx.toFixed(1) + '" cy="' + apy.toFixed(1) + '" r="8" fill="#3B4252"/>'
      + '<path d="M' + (px - 6).toFixed(1) + ' ' + (cy - 26) + ' h12 l-6 20 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + RED + '"/>' + txt(cx - 18, cy + 30, 'ㅇ', 20);
    if (o.steps) { s += txt(cx - 34, cy + 62, '① 중심 ㅇ', 20, ORANGE) + txt(((cx + px) / 2 + 60).toFixed(1), cy + 62, '② ' + cm + ' cm 벌리기', 20, BLUE2)
      + '<path d="M' + (cx - R * 0.94).toFixed(1) + ' ' + (cy - R * 0.34).toFixed(1) + ' A' + (R + 16).toFixed(1) + ' ' + (R + 16).toFixed(1) + ' 0 0 1 ' + (cx - R * 0.2).toFixed(1) + ' ' + (cy - R - 14).toFixed(1) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4"/><path d="M' + (cx - R * 0.2).toFixed(1) + ' ' + (cy - R - 14).toFixed(1) + ' l-14 -8 l2 16 Z" fill="' + ORANGE + '"/>'
      + txt(398, 120, '③ 침 꽂고', 20, '#3B4252') + txt(398, 148, '한 바퀴', 20, '#3B4252'); }
    else s += txt(380, 108, '벌린 길이', 18, '#6B7C93', 700) + txt(380, 140, cm + ' cm', 30, BLUE2) + txt(380, 182, '지름 ' + 2 * cm + ' cm', 22, ORANGE);
    if (o.label) s += txt(230, 30, o.label, 22, o.bad ? RED : '#3B4252');
    return svgWrap(s, 'fig-compass').replace('<svg ', '<svg data-open="' + cm + '" data-d="' + 2 * cm + '" ');
  }
  // cgrid: 모눈 위 원 무늬 — items [{x,y,r}] (모눈 칸). show:'r' 이면 원마다 반지름 칸 수, q 번째 원은 점선 「?」, path:true 면 중심을 잇는 주황 점선.
  function cgrid(o) {
    const lab = o.show === 'r' || o.q != null, top = o.label ? 40 : 14, avH = 280 - top - (lab ? 38 : 14), cols = o.cols || 12, rows = o.rows || 4, c = Math.min(440 / cols, avH / rows), x0 = (460 - c * cols) / 2, y0 = top + (avH - c * rows) / 2;
    let s = ''; for (let i = 0; i <= cols; i++) s += '<line x1="' + (x0 + i * c).toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + (x0 + i * c).toFixed(1) + '" y2="' + (y0 + rows * c).toFixed(1) + '" stroke="#D5DEE9" stroke-width="1.5"/>';
    for (let j = 0; j <= rows; j++) s += '<line x1="' + x0.toFixed(1) + '" y1="' + (y0 + j * c).toFixed(1) + '" x2="' + (x0 + cols * c).toFixed(1) + '" y2="' + (y0 + j * c).toFixed(1) + '" stroke="#D5DEE9" stroke-width="1.5"/>';
    const P = (it) => [x0 + it.x * c, y0 + it.y * c], items = o.items || [];
    if (o.path && items.length > 1) s += '<polyline points="' + items.map(it => P(it).map(v => v.toFixed(1)).join(',')).join(' ') + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="8 6"/>';
    items.forEach((it, i) => { const p = P(it), isQ = o.q === i;
      s += '<circle class="o-circ' + (isQ ? ' q' : '') + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (it.r * c).toFixed(1) + '" fill="' + (isQ ? 'none' : 'rgba(91,141,239,.10)') + '" stroke="' + (isQ ? REST2 : BLUE2) + '" stroke-width="' + (isQ ? 3 : 4) + '"' + (isQ ? ' stroke-dasharray="8 6"' : '') + '/><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5" fill="' + (o.path ? ORANGE : INK) + '"/>';
      if (!isQ && o.show === 'r') s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + (p[0] + it.r * c).toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="' + BLUE + '" stroke-width="4"/>';
      if (o.show === 'r' || isQ) s += txt(p[0].toFixed(1), (y0 + rows * c + 26).toFixed(1), isQ ? '?' : it.r + '칸', 20, isQ ? ORANGE : BLUE2); });
    if (o.label) s += txt(230, 26, o.label, 22, '#3B4252');
    return svgWrap(s, 'fig-cgrid').replace('<svg ', '<svg data-rs="' + items.map(it => it.r).join(',') + '" ');
  }
  // crow: 크기 견주기 — items [{r}|{d}, lab] 을 지름으로 바꾸어 같은 비율로 나란히. 가장 큰 원은 주황 테(data-ds = 지름들).
  function crow(o) {
    const items = o.items || [], ds = items.map(it => it.d != null ? +it.d : 2 * it.r), mx = Math.max.apply(null, ds.concat(1)), n = items.length || 1, cw = 460 / n, k = Math.min(cw - 16, 170) / mx; let s = '';
    items.forEach((it, i) => { const x = cw * i + cw / 2, r = ds[i] * k / 2, big = ds[i] === mx;
      s += '<circle cx="' + x.toFixed(1) + '" cy="130" r="' + r.toFixed(1) + '" fill="' + (big ? '#FFF1E6' : '#F4F8FF') + '" stroke="' + (big ? ORANGE : INK) + '" stroke-width="4"/><circle cx="' + x.toFixed(1) + '" cy="130" r="4" fill="' + INK + '"/>'
        + txt(x.toFixed(1), 238, it.lab || (it.d != null ? '지름 ' + it.d : '반지름 ' + it.r), 18, '#3B4252', 800) + txt(x.toFixed(1), 264, '→ 지름 ' + ds[i], 18, big ? '#C2551A' : BLUE2, 800); });
    if (o.label) s += txt(230, 30, o.label, 22, '#3B4252');
    return svgWrap(s, 'fig-crow').replace('<svg ', '<svg data-ds="' + ds.join(',') + '" ');
  }
  // ══ 32차(2026-09-29) 3학년 2학기 분수와 소수 부품 — fgroup(묶어서 분수·분수만큼) · fmix(1보다 큰 분수·소수 — 가분수·대분수·1.4) · nline(1보다 큰 수직선) ══
  // 그림 문법 그대로: 파랑 = 색칠한(센) 부분 · 연회색 = 남은 칸 · 주황 = 수직선 점·강조 · 굵은 검정 선 = 1(전체 하나)의 경계
  const fval = (v) => { if (typeof v === 'number') return v; const t = String(v).trim(); let m; if ((m = t.match(/^(\d+)\s*·\s*(\d+)\s*\/\s*(\d+)$/))) return +m[1] + m[2] / m[3]; if ((m = t.match(/^(\d+)\s*\/\s*(\d+)$/))) return m[1] / m[2]; return +t; };
  // 글자·분수·대분수를 한 줄로 — tokens: ['8의', '1/2', '=', '4'] · '2·3/4' 는 자연수 + 쌓은 분수
  function tokW(t, sz) { let m; if ((m = String(t).match(/^(\d+)·(\d+)\/(\d+)$/))) return String(m[1]).length * sz * 0.62 + 6 + Math.max(sz * 0.9, Math.max(m[2].length, m[3].length) * sz * 0.62); if ((m = String(t).match(/^(\d+)\/(\d+)$/))) return Math.max(sz * 0.9, Math.max(m[1].length, m[2].length) * sz * 0.62); return Array.from(String(t)).reduce((a, c) => a + (/[가-힣]/.test(c) ? sz * 0.98 : /\s/.test(c) ? sz * 0.3 : sz * 0.6), 0); }
  function seqText(cx, y, toks, sz, col) {
    sz = sz || 28; const gap = sz * 0.28, ws = toks.map(t => tokW(t, sz)), tot = ws.reduce((a, b) => a + b, 0) + gap * (toks.length - 1); let x = cx - tot / 2, s = '';
    toks.forEach((t, i) => { const w = ws[i], mid = x + w / 2; let m;
      if ((m = String(t).match(/^(\d+)·(\d+)\/(\d+)$/))) { const ww = String(m[1]).length * sz * 0.62; s += txt((x + ww / 2).toFixed(1), (y + sz * 0.35).toFixed(1), m[1], sz * 1.15, col) + fracText(+(x + ww + 6 + (w - ww - 6) / 2).toFixed(1), y, m[2] + '/' + m[3], sz).replace(/fill="#2B3440"/g, 'fill="' + (col || INK) + '"').replace('stroke="#2B3440"', 'stroke="' + (col || INK) + '"'); }
      else if (/^\d+\/\d+$/.test(String(t))) s += fracText(+mid.toFixed(1), y, String(t), sz).replace(/fill="#2B3440"/g, 'fill="' + (col || INK) + '"').replace('stroke="#2B3440"', 'stroke="' + (col || INK) + '"');
      else s += txt(mid.toFixed(1), (y + sz * 0.35).toFixed(1), t, sz, col);
      x += w + gap; });
    return s;
  }
  // fgroup: total 개를 per 개씩 묶은 g 묶음 중 m 묶음 색칠 — 「m 묶음은 g 묶음 중의 m → m/g」 · of:true 면 「total 의 m/g = m×per」
  function fgroup(o) {
    const total = Math.max(1, o.total | 0), per = Math.max(1, o.per | 0), g = Math.floor(total / per), m = Math.max(0, Math.min(g, o.m | 0));
    const rows = g > 8 ? 2 : 1, cnt = Math.ceil(g / rows), top = o.label ? 50 : 22, bot = o.show === false ? 262 : 196, bw = Math.min(118, 440 / cnt - 8), bh = (bot - top) / rows - 10;
    const dc = per <= 3 ? per : per === 4 ? 2 : 3, dr = Math.ceil(per / dc), dr2 = Math.max(5, Math.min(13, (bw - 14) / dc / 2 - 2, (bh - 14) / dr / 2 - 2)); let s = '';
    for (let i = 0; i < g; i++) { const r = Math.floor(i / cnt), c = i % cnt, inRow = Math.min(cnt, g - r * cnt), x = 230 - inRow * (bw + 8) / 2 + c * (bw + 8) + 4, y = top + r * (bh + 10), on = i < m;
      s += '<rect class="o-grp' + (on ? ' on' : '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="14" fill="' + (on ? '#E6EEFD' : '#fff') + '" stroke="' + (on ? BLUE2 : REST2) + '" stroke-width="3" stroke-dasharray="' + (per > 1 ? '9 6' : '0') + '"/>';
      for (let j = 0; j < per; j++) { const cc = j % dc, rr = Math.floor(j / dc); const px = x + bw / 2 + (cc - (dc - 1) / 2) * (dr2 * 2 + 4), py = y + bh / 2 + (rr - (dr - 1) / 2) * (dr2 * 2 + 4); s += '<circle class="o-it" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + dr2.toFixed(1) + '" fill="' + (on ? (o.color || BLUE) : (o.rest || REST2)) + '" stroke="#fff" stroke-width="2"/>'; } }
    if (o.label) s += txt(230, 32, o.label, 22, '#3B4252');
    if (o.show !== false) { const toks = o.show != null ? [].concat(o.show) : o.of ? [total + '의', m + '/' + g, '=', String(m * per)] : [g + '묶음 중 ' + m + '묶음', '→', m + '/' + g]; s += seqText(230, 238, toks, 26, o.of ? BLUE2 : INK); }
    return svgWrap(s, 'fig-fgroup').replace('<svg ', '<svg data-g="' + g + '" data-m="' + m + '" data-v="' + m * per + '" ');
  }
  // fmix: 1(전체 하나)을 n 칸으로 나눈 띠·원 units 개에 m 칸 색칠 — 가분수 m/n · 대분수 · dec:true 면 n=10 소수(1.4)
  function fmix(o) {
    const n = Math.max(1, o.n | 0), m = Math.max(0, o.m | 0), units = Math.max(1, o.units || Math.ceil(m / n) || 1), whole = Math.floor(m / n), part = m % n, shape = o.shape || 'bar';
    const imp = m + '/' + n, mix = whole ? (part ? whole + '·' + part + '/' + n : String(whole)) : imp, dec = (m / 10).toFixed(1).replace(/\.0$/, o.dec ? '.0' : '');
    let s = ''; const top = o.label ? 50 : 30;
    if (shape === 'circle') { const cw = 440 / units, r = Math.min(66, cw / 2 - 10), cy = top + 78;
      for (let u = 0; u < units; u++) { const cx = 10 + cw * u + cw / 2;
        for (let i = 0; i < n; i++) { const k = u * n + i, on = k < m, a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n; if (n === 1) { s += '<circle class="o-slice' + (on ? ' on' : '') + '" cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="' + r.toFixed(1) + '" fill="' + (on ? BLUE : REST) + '"/>'; continue; }
          s += '<path class="o-slice' + (on ? ' on' : '') + '" d="M' + cx.toFixed(1) + ' ' + cy + ' L' + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) + ' A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + (n === 2 ? 1 : 0) + ' 1 ' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + ' Z" fill="' + (on ? BLUE : REST) + '" stroke="#fff" stroke-width="3"/>'; }
        s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="' + r.toFixed(1) + '" fill="none" stroke="' + INK + '" stroke-width="4"/>'; } }
    else { const x0 = 30, bw = 400, bh = 64, y0 = top + 36, uw = bw / units, cw = uw / n;
      for (let u = 0; u < units; u++) for (let i = 0; i < n; i++) { const k = u * n + i, on = k < m; s += '<rect class="o-slice' + (on ? ' on' : '') + '" x="' + (x0 + k * cw).toFixed(1) + '" y="' + y0 + '" width="' + cw.toFixed(1) + '" height="' + bh + '" fill="' + (on ? BLUE : REST) + '" stroke="#fff" stroke-width="' + (cw < 12 ? 1.5 : 3) + '"/>'; }
      for (let u = 0; u <= units; u++) { const x = x0 + u * uw; s += '<line x1="' + x.toFixed(1) + '" y1="' + (y0 - 6) + '" x2="' + x.toFixed(1) + '" y2="' + (y0 + bh + 6) + '" stroke="' + INK + '" stroke-width="4"/>' + (o.ticks !== false ? txt(x.toFixed(1), y0 - 16, String(u), 20, '#6B7C93', 800) : ''); }
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + bw + '" height="' + bh + '" fill="none" stroke="' + INK + '" stroke-width="4" rx="4"/>'; }
    const show = o.show != null ? o.show : o.dec ? 'dec' : 'both';
    if (show !== false) { const toks = Array.isArray(show) ? show : show === 'dec' ? ['0.1이 ' + m + '개', '=', dec] : show === 'mixed' ? [mix] : show === 'improper' ? [imp] : (whole && part ? [imp, '=', mix] : whole ? [imp, '=', mix] : [imp]); s += seqText(230, shape === 'circle' ? top + 190 : top + 162, toks, 28, BLUE2); }
    if (o.label) s += txt(230, 30, o.label, 22, '#3B4252');
    const Hh = shape === 'circle' ? top + 236 : top + 206;
    return svgWrap(s, 'fig-fmix ' + shape, '0 0 460 ' + Math.max(220, Hh)).replace('<svg ', '<svg data-n="' + n + '" data-m="' + m + '" data-w="' + whole + '" data-p="' + part + '" ');
  }
  // nline: lo~hi 수직선, 1을 n 칸으로 — marks [{at:'2·1/5'|'13/9'|1.8, label, q}] · dec:true 면 칸마다 소수 글자 · frac:true 면 칸마다 분수 글자
  function nline(o) {
    const lo = o.lo | 0, hi = Math.max(lo + 1, o.hi | 0), n = Math.max(1, o.n | 0), steps = (hi - lo) * n, x0 = 36, x1 = 424, y = o.marks && o.marks.length ? 168 : 130, w = x1 - x0, X = (v) => x0 + w * (v - lo) / (hi - lo); let s = '';
    s += '<line x1="' + (x0 - 18) + '" y1="' + y + '" x2="' + (x1 + 22) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="4"/><path d="M' + (x1 + 22) + ' ' + y + ' l-12 -8 v16 Z" fill="' + INK + '"/>';
    for (let i = 0; i <= steps; i++) { const x = x0 + w * i / steps, big = i % n === 0; s += '<line x1="' + x.toFixed(1) + '" y1="' + (y - (big ? 18 : 10)) + '" x2="' + x.toFixed(1) + '" y2="' + (y + (big ? 18 : 10)) + '" stroke="' + INK + '" stroke-width="' + (big ? 4 : 2.5) + '"/>';
      if (big) s += txt(x.toFixed(1), y + 50, String(lo + i / n), 26); else if (o.dec && n === 10 && steps <= 20) s += txt(x.toFixed(1), y + 40, (lo + i / n).toFixed(1), 13, '#6B7C93', 700); else if (o.frac && steps <= 12) s += fracText(+x.toFixed(1), y + 36, (lo * n + i) + '/' + n, 16).replace(/fill="#2B3440"/g, 'fill="#6B7C93"').replace('stroke="#2B3440"', 'stroke="#6B7C93"'); }
    const vals = [];
    (o.marks || []).forEach((mk, j) => { const v = fval(mk.at); vals.push(+v.toFixed(4)); const x = X(v), col = j === 0 ? ORANGE : j === 1 ? GRN : PURP;
      s += '<circle class="o-mark" cx="' + x.toFixed(1) + '" cy="' + y + '" r="11" fill="' + col + '" stroke="#fff" stroke-width="3"/>';
      const lab = mk.q ? '?' : mk.label != null ? mk.label : String(mk.at); const ly = y - 58 - (j % 2 ? 52 : 0);
      s += mk.q ? txt(x.toFixed(1), ly + 10, '?', 34, ORANGE, 900) : seqText(x, ly, [lab], 24, col === ORANGE ? '#C2551A' : col === GRN ? '#2E7D4F' : '#7A52B3'); });
    if (o.label) s += txt(230, 30, o.label, 22, '#3B4252');
    return svgWrap(s, 'fig-nline').replace('<svg ', '<svg data-at="' + vals.join(',') + '" data-lo="' + lo + '" data-hi="' + hi + '" data-n="' + n + '" ');
  }

  // ══ 33차(2026-09-29) 3학년 2학기 들이와 무게 부품 — beaker(눈금 비커) · dial(바늘 저울) · tilt(양팔저울) · cups(컵·수조 물 높이) · tubs(통에 나누어 담기) ══
  // 그림 문법: 하늘색 = 담긴 물 · 주황 = 읽은 눈금(바늘·물 높이 표시) · 연회색 = 작은 눈금 · 굵은 눈금 = 글자가 붙는 눈금.
  const WATER = '#8EC5F5', WATER2 = '#5DA8EA';
  const nfmt = (v) => String(+(+v).toFixed(3));
  // beaker: max·step(한 칸 크기)·v(물 높이) · unit(mL) · every(글자 붙는 칸 간격) · q(읽은 값 대신 ?) · read:false(읽은 값 없음) · show(읽은 값 글자)
  function beaker(o) {
    const max = +o.max || 1000, step = +o.step || 100, v = Math.max(0, Math.min(max, +o.v || 0)), unit = o.unit || 'mL', n = Math.round(max / step), every = o.every || (n <= 10 ? 1 : n % 5 === 0 ? 5 : 2);
    const top = o.label ? 60 : 30, bot = 236, x0 = 176, x1 = 296, rim = top + 14, Y = (val) => bot - (bot - rim - 8) * val / max; let s = '';
    if (v > 0) s += '<rect class="o-water" x="' + (x0 + 3) + '" y="' + Y(v).toFixed(1) + '" width="' + (x1 - x0 - 6) + '" height="' + (bot - Y(v) - 3).toFixed(1) + '" fill="' + WATER + '" opacity=".85"/><line x1="' + (x0 + 3) + '" y1="' + Y(v).toFixed(1) + '" x2="' + (x1 - 3) + '" y2="' + Y(v).toFixed(1) + '" stroke="' + WATER2 + '" stroke-width="3"/>';
    for (let i = 1; i <= n; i++) { const y = Y(i * step).toFixed(1), big = i % every === 0 || i === n; s += '<line x1="' + x0 + '" y1="' + y + '" x2="' + (x0 + (big ? 30 : 16)) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="' + (big ? 3 : 2) + '"/>'; if (big) s += txt(x0 - 12, (+y + 7).toFixed(1), nfmt(i * step), 20, '#5A6472', 800, 'end'); }
    s += '<path d="M' + (x0 - 12) + ' ' + top + ' L' + x0 + ' ' + rim + ' V' + (bot - 8) + ' Q' + x0 + ' ' + bot + ' ' + (x0 + 8) + ' ' + bot + ' H' + (x1 - 8) + ' Q' + x1 + ' ' + bot + ' ' + x1 + ' ' + (bot - 8) + ' V' + rim + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>';
    s += txt(x0 - 12, top - 4, '(' + unit + ')', 18, '#6B7C93', 700, 'end'); // 33차+ 단위는 눈금 숫자 위(읽은 값과 안 겹치게)
    if (o.read !== false && (v > 0 || o.show)) { const y = Y(v); s += '<path d="M' + (x1 + 8) + ' ' + y.toFixed(1) + ' l18 -9 v18 Z" fill="' + ORANGE + '"/>' + txt(x1 + 32, (y + 9).toFixed(1), o.q ? '?' : (o.show || nfmt(v) + ' ' + unit), o.q ? 32 : 24, '#C2551A', 900, 'start'); }
    const rl = o.read !== false && (v > 0 || o.show) ? (o.q ? 1 : String(o.show || nfmt(v) + ' ' + unit).length) : 0, W = Math.max(460, Math.ceil(x1 + 32 + rl * 15 + 16));
    if (o.label) s += txt(230, 34, o.label, 22, '#3B4252');
    return svgWrap(s, 'fig-beaker', '0 0 ' + W + ' 250').replace('<svg ', '<svg data-max="' + max + '" data-step="' + step + '" data-v="' + nfmt(v) + '" ');
  }
  // dial: 바늘 저울 — max·step·v · unit(g|kg) · major(글자 붙는 간격, 같은 단위) · kg:true 면 g 저울 글자를 kg 로(1000 → 1 kg) · q · read:false · show
  function dial(o) {
    const max = +o.max || 1000, step = +o.step || 100, v = Math.max(0, Math.min(max, +o.v || 0)), unit = o.unit || 'g', n = Math.round(max / step), major = +o.major || (n <= 10 ? step : n % 5 === 0 ? step * 5 : step * 2);
    const cx = 230, cy = 146, r = 96, A = (val) => RAD(-90 + 300 * val / max), P = (val, rr) => [(cx + rr * Math.cos(A(val))).toFixed(1), (cy + rr * Math.sin(A(val))).toFixed(1)];
    let s = '<rect x="182" y="16" width="96" height="10" rx="5" fill="#9AA6B4"/><rect x="222" y="24" width="16" height="14" fill="#9AA6B4"/>'
      + '<rect x="' + (cx - 126) + '" y="34" width="252" height="226" rx="34" fill="#EEF1F5" stroke="#8FA3B8" stroke-width="3"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 8) + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
    let L = '';
    for (let i = 0; i <= n; i++) { const val = i * step, big = Math.abs(val / major - Math.round(val / major)) < 1e-9, a = P(val, r), b = P(val, r - (big ? 16 : 9)); s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (big ? INK : '#8A93A0') + '" stroke-width="' + (big ? 3 : 2) + '"/>';
      if (big) { const t = P(val, r - 32), lab = o.kg ? (val ? nfmt(val / 1000) : '0') : nfmt(val); L += txt(t[0], (+t[1] + 7).toFixed(1), lab, n > 20 ? 17 : 19, '#3B4252', 800); } }
    s += txt(cx, cy - 22, o.kg ? 'kg' : unit, 16, '#8A93A0', 700);
    const nd = P(v, r - 12); s += '<line class="o-needle" x1="' + cx + '" y1="' + cy + '" x2="' + nd[0] + '" y2="' + nd[1] + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="9" fill="' + ORANGE + '" stroke="#fff" stroke-width="3"/>';
    s += '<g paint-order="stroke" stroke="#fff" stroke-width="5" stroke-linejoin="round">' + L + '</g>'; // 33차+ 눈금 숫자는 바늘 위에(가려지지 않게)
    if (o.read !== false) s += '<rect x="' + (cx - 86) + '" y="268" width="172" height="40" rx="12" fill="#FFF1E6"/>' + txt(cx, 297, o.q ? '?' : (o.show || nfmt(v) + ' ' + unit), 26, '#C2551A', 900);
    if (o.label) s += txt(230, o.read !== false ? 336 : 290, o.label, 20, '#3B4252');
    return svgWrap(s, 'fig-dial', '0 0 460 ' + (o.label ? (o.read !== false ? 348 : 300) : o.read !== false ? 316 : 272)).replace('<svg ', '<svg data-max="' + max + '" data-step="' + step + '" data-v="' + nfmt(v) + '" ');
  }
  // tilt: 양팔저울 — l·r {name, emoji, sub} · down 'l'|'r'|'eq' · cap(아래 글자, false 면 없음)
  function tilt(o) {
    const Lr = so(o.l), Rr = so(o.r), d = o.down === 'l' || o.down === 'r' ? o.down : 'eq', ang = d === 'l' ? -9 : d === 'r' ? 9 : 0, cx = 230, by = 74, arm = 150, a = RAD(ang);
    const eL = [cx - arm * Math.cos(a), by - arm * Math.sin(a)], eR = [cx + arm * Math.cos(a), by + arm * Math.sin(a)];
    let s = '<path d="M' + (cx - 60) + ' 238 H' + (cx + 60) + ' L' + (cx + 20) + ' 222 H' + (cx - 20) + ' Z" fill="#8A93A0"/><rect x="' + (cx - 6) + '" y="' + by + '" width="12" height="150" fill="#9AA6B4"/>';
    s += '<line class="o-beam" data-ang="' + ang + '" x1="' + eL[0].toFixed(1) + '" y1="' + eL[1].toFixed(1) + '" x2="' + eR[0].toFixed(1) + '" y2="' + eR[1].toFixed(1) + '" stroke="' + WOOD2 + '" stroke-width="10" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + by + '" r="9" fill="#fff" stroke="#5A6472" stroke-width="3"/>';
    const pan = (e, it, heavy) => { const x = e[0], py = e[1] + 70; let t = '<path d="M' + x.toFixed(1) + ' ' + e[1].toFixed(1) + ' L' + (x - 56).toFixed(1) + ' ' + py.toFixed(1) + ' M' + x.toFixed(1) + ' ' + e[1].toFixed(1) + ' L' + (x + 56).toFixed(1) + ' ' + py.toFixed(1) + '" stroke="#8A93A0" stroke-width="2"/>';
      t += '<path d="M' + (x - 64).toFixed(1) + ' ' + py.toFixed(1) + ' Q' + x.toFixed(1) + ' ' + (py + 30).toFixed(1) + ' ' + (x + 64).toFixed(1) + ' ' + py.toFixed(1) + ' Z" fill="#DDE3EA" stroke="#8A93A0" stroke-width="3"/>';
      if (it.emoji) t += '<text x="' + x.toFixed(1) + '" y="' + (py - 4).toFixed(1) + '" text-anchor="middle" font-size="44">' + esc(it.emoji) + '</text>';
      t += txt(x.toFixed(1), (py + 50).toFixed(1), it.name || '', 22, heavy ? '#C2551A' : INK, 900); if (it.sub) t += txt(x.toFixed(1), (py + 76).toFixed(1), it.sub, 18, BLUE2, 800); return t; };
    s += pan(eL, Lr, d === 'l') + pan(eR, Rr, d === 'r');
    const heavy = d === 'l' ? Lr.name : d === 'r' ? Rr.name : '', cap = o.cap === false ? '' : o.cap || (d === 'eq' ? '수평 — 두 무게가 같아요' : heavy + ' 쪽으로 기울었어요 → 더 무거워요');
    if (cap) s += txt(230, 272, cap, 20, '#3B4252', 800);
    return svgWrap(s, 'fig-tilt', '0 0 460 ' + (cap ? 286 : 262)).replace('<svg ', '<svg data-down="' + d + '" ');
  }
  // cups: 컵·수조 여럿 — items [{name, lv(0~1), w, h, color, hi, full}] · pour:[i,j] 옮겨 담기 화살표 · label
  function cups(o) {
    const it = (o.items || []).map(so), k = Math.max(1, it.length), cw = 440 / k, bot = 206, top = o.label ? 56 : 28; let s = '';
    it.forEach((c, i) => { const w = Math.min(cw - 30, 84 * (c.w || 1)), h = Math.min(bot - top - 10, 128 * (c.h || 1)), x = 10 + cw * i + cw / 2 - w / 2, y = bot - h, lv = Math.max(0, Math.min(1, +c.lv || 0)), wy = bot - h * lv, col = c.color || '#8A93A0';
      if (lv > 0) s += '<rect class="o-water" x="' + (x + 3).toFixed(1) + '" y="' + wy.toFixed(1) + '" width="' + (w - 6).toFixed(1) + '" height="' + (bot - wy - 3).toFixed(1) + '" fill="' + WATER + '" opacity=".85"/><line x1="' + (x + 3).toFixed(1) + '" y1="' + wy.toFixed(1) + '" x2="' + (x + w - 3).toFixed(1) + '" y2="' + wy.toFixed(1) + '" stroke="' + WATER2 + '" stroke-width="3"/>';
      s += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' V' + (bot - 6) + ' Q' + x.toFixed(1) + ' ' + bot + ' ' + (x + 6).toFixed(1) + ' ' + bot + ' H' + (x + w - 6).toFixed(1) + ' Q' + (x + w).toFixed(1) + ' ' + bot + ' ' + (x + w).toFixed(1) + ' ' + (bot - 6) + ' V' + y.toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="5" stroke-linejoin="round"/>';
      if (o.level) s += '<line x1="' + (x - 6).toFixed(1) + '" y1="' + wy.toFixed(1) + '" x2="' + (x + w + 6).toFixed(1) + '" y2="' + wy.toFixed(1) + '" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="6 5"/>';
      s += txt((x + w / 2).toFixed(1), bot + 30, c.name || '', cw < 110 ? 18 : 22, c.hi ? '#C2551A' : INK, 900); if (c.sub) s += txt((x + w / 2).toFixed(1), bot + 54, c.sub, 16, '#6B7C93', 800); });
    if (Array.isArray(o.pour) && k > 1) { const [i, j] = o.pour, xa = 10 + cw * i + cw / 2, xb = 10 + cw * j + cw / 2, yy = top + 6; s += '<path d="M' + (xa + 10).toFixed(1) + ' ' + (yy + 22) + ' Q' + ((xa + xb) / 2).toFixed(1) + ' ' + (yy - 18) + ' ' + (xb - 16).toFixed(1) + ' ' + (yy + 22) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="9 6"/><path d="M' + (xb - 16).toFixed(1) + ' ' + (yy + 22) + ' l-4 -14 l14 6 Z" fill="' + ORANGE + '"/>'; }
    if (o.label) s += txt(230, 30, o.label, 22, '#3B4252');
    return svgWrap(s, 'fig-cups', '0 0 460 ' + (it.some(c => c.sub) ? 268 : 248)).replace('<svg ', '<svg data-lv="' + it.map(c => +(+c.lv || 0).toFixed(3)).join(',') + '" ');
  }
  // tubs: 통에 나누어 담기 — rows [{size, n}] · unit · total(목표) · 줄마다 size × n 을 통 그림으로, 아래에 합 = total
  function tubs(o) {
    const rows = o.rows || [], unit = o.unit || 'L', top = o.label ? 50 : 18, rh = Math.min(62, (212 - top) / Math.max(1, rows.length)); let s = '', sum = 0; const parts = [];
    rows.forEach((r, i) => { const y = top + i * rh, n = Math.max(0, r.n | 0), sz = +r.size, v = sz * n; sum += v; if (n) parts.push(nfmt(v) + ' ' + unit);
      s += '<rect x="14" y="' + (y + 6).toFixed(1) + '" width="84" height="' + (rh - 14).toFixed(1) + '" rx="10" fill="#EEF4FD" stroke="' + BLUE + '" stroke-width="2"/>' + txt(56, (y + rh / 2 + 7).toFixed(1), nfmt(sz) + ' ' + unit, 20, BLUE2, 900);
      const tw = Math.min(28, 206 / Math.max(1, n) - 4); for (let j = 0; j < n; j++) { const x = 110 + j * (tw + 4); s += '<rect class="o-tub" x="' + x.toFixed(1) + '" y="' + (y + 10).toFixed(1) + '" width="' + tw.toFixed(1) + '" height="' + (rh - 22).toFixed(1) + '" rx="6" fill="' + WATER + '" stroke="' + WATER2 + '" stroke-width="2"/>'; }
      s += n ? txt(446, (y + rh / 2 + 8).toFixed(1), n + '개 → ' + nfmt(v) + ' ' + unit, 20, INK, 800, 'end') : txt(446, (y + rh / 2 + 8).toFixed(1), '안 써요', 20, '#8A93A0', 800, 'end'); });
    const ok = o.total == null || Math.abs(sum - o.total) < 1e-9, yb = top + rows.length * rh + 34;
    s += txt(230, yb, (parts.length ? parts.join(' + ') : '0 ' + unit) + ' = ' + nfmt(sum) + ' ' + unit, 26, ok ? BLUE2 : RED, 900);
    if (o.label) s += txt(230, 30, o.label, 22, '#3B4252');
    return svgWrap(s, 'fig-tubs', '0 0 460 ' + (yb + 16)).replace('<svg ', '<svg data-sum="' + nfmt(sum) + '" data-total="' + (o.total == null ? '' : nfmt(o.total)) + '" ');
  }

  // ══ 34차(2026-09-29) 3학년 2학기 그림그래프 부품 — ptable(자료 표 + 합계) · ograph(◯ 그래프) · pgraph(그림그래프: 큰·작은 그림 단위 1~3종) · area2(가로·세로 2배 = 넓이 4배) ══
  // 그림 문법: 파랑 = 합계·그림이 나타내는 수 · 주황 = 찾는 항목(hi)·물음(?) · 빨강 = 잘못 그린 줄(bad) · 회색 점선 = 빈 줄(채울 곳)
  const rowsOf = (o) => (o.items || o.rows || []).map(r => (typeof r === 'string' ? { name: r } : r));
  // ptable: head(항목 이름) · items[{name,v,q}] · unit · total(true = 합계 칸, 숫자 = 주어진 합계) · q:'total' · hi(이름 또는 번호) · rowName(두 번째 줄 이름)
  function ptable(o) {
    const it = rowsOf(o), unit = o.unit || '명', sum = it.reduce((a, r) => a + (+r.v || 0), 0), hiOf = (r, i) => o.hi != null && (o.hi === i || o.hi === r.name || (Array.isArray(o.hi) && o.hi.indexOf(r.name) >= 0));
    const tot = o.total === false ? null : (typeof o.total === 'number' ? o.total : sum);
    let h = '<table class="pt"><tr><th>' + esc(o.head || '항목') + '</th>' + it.map((r, i) => '<td class="' + (hiOf(r, i) ? 'hi' : '') + '">' + esc(r.name) + '</td>').join('') + (tot != null ? '<td class="sum">합계</td>' : '') + '</tr>';
    h += '<tr><th>' + esc(o.rowName || ('수(' + unit + ')')) + '</th>' + it.map((r, i) => '<td class="n' + (hiOf(r, i) ? ' hi' : '') + (r.q ? ' q' : '') + '">' + (r.q ? '?' : esc(r.v)) + '</td>').join('') + (tot != null ? '<td class="n sum' + (o.q === 'total' ? ' q' : '') + '">' + (o.q === 'total' ? '?' : esc(tot)) + '</td>' : '') + '</tr></table>';
    return '<div class="fig-vert fig-ptable" data-sum="' + sum + '" data-total="' + (tot == null ? '' : tot) + '" data-vals="' + it.map(r => +r.v || 0).join(',') + '">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + h + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  // ograph: ◯ 그래프(아래에서 위로) — items[{name,v}] · max(줄 수) · hi
  function ograph(o) {
    const it = rowsOf(o), mx = +o.max || Math.max.apply(null, it.map(r => +r.v || 0).concat(1));
    let h = '<div class="og" style="grid-template-columns:44px repeat(' + it.length + ',minmax(64px,1fr))">';
    for (let y = mx; y >= 1; y--) { h += '<span class="og-y">' + y + '</span>' + it.map((r, i) => '<span class="og-c' + ((+r.v || 0) >= y ? ' on' : '') + (o.hi === i || o.hi === r.name ? ' hi' : '') + '">' + ((+r.v || 0) >= y ? '◯' : '') + '</span>').join(''); }
    h += '<span class="og-y u">' + esc(o.unit ? '(' + o.unit + ')' : '') + '</span>' + it.map((r, i) => '<span class="og-x' + (o.hi === i || o.hi === r.name ? ' hi' : '') + '">' + esc(r.name) + '</span>').join('') + '</div>';
    return '<div class="fig-vert fig-ograph" data-vals="' + it.map(r => +r.v || 0).join(',') + '">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + h + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  // pgraph: 그림그래프 — title · head · unit · icon · units[10,1] 또는 [100,10,1] · rows[{name,v,c:[개수…](잘못 그린 줄은 c 로 직접),blank,q,bad}] · show(수 칸) · hi · legend:false
  const pgSplit = (v, units) => { let r = +v || 0; return units.map(u => { const n = Math.floor(r / u + 1e-9); r -= n * u; return n; }); };
  function pgraph(o) {
    const it = rowsOf(o), units = (o.units || [10, 1]).map(Number), unit = o.unit || '명', icon = o.icon || '🙂', SZ = units.length === 3 ? ['l', 'm', 's'] : units.length === 2 ? ['l', 's'] : ['s'];
    const vals = [];
    let h = '<table class="pg"><tr class="pg-head"><th>' + esc(o.head || '항목') + '</th><th>' + esc(o.col || (unit === '명' ? '학생 수' : '수')) + '</th>' + (o.show ? '<th class="pg-n">' + esc(unit) + '</th>' : '') + '</tr>';
    it.forEach((r, i) => {
      const c = r.c || pgSplit(r.v, units), val = c.reduce((a, n, k) => a + n * units[k], 0), hi = o.hi === i || o.hi === r.name || (Array.isArray(o.hi) && o.hi.indexOf(r.name) >= 0); vals.push(r.blank ? '' : val);
      const pics = r.blank ? '<span class="pg-blank">&nbsp;</span>' : c.map((n, k) => Array.from({ length: n }, () => '<i class="pg-ic ' + SZ[k] + '">' + esc(r.icon || icon) + '</i>').join('')).join('');
      h += '<tr class="' + (hi ? 'hi ' : '') + (r.bad ? 'bad ' : '') + (r.blank ? 'blank' : '') + '"><th>' + esc(r.name) + '</th><td class="pg-pics">' + pics + '</td>' + (o.show ? '<td class="pg-n' + (r.q ? ' q' : '') + '">' + (r.blank || r.q ? (r.q ? '?' : '') : val) + '</td>' : '') + '</tr>';
    });
    h += '</table>';
    const leg = o.legend === false ? '' : '<div class="pg-leg">' + units.map((u, k) => '<span><i class="pg-ic ' + SZ[k] + '">' + esc(icon) + '</i> ' + u + unit + '</span>').join('') + '</div>';
    return '<div class="fig-vert fig-pgraph" data-vals="' + vals.join(',') + '" data-units="' + units.join(',') + '">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + h + leg + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  // area2: 같은 그림을 가로·세로 2배로 — 넓이는 4배 (icon · k 배율 2)
  function area2(o) {
    const k = +o.k2 || 2, a = 60, ic = o.icon || '⚽'; let s = '<rect x="60" y="' + (200 - a) + '" width="' + a + '" height="' + a + '" rx="8" fill="#EEF4FD" stroke="' + BLUE + '" stroke-width="3"/>' + '<text x="90" y="' + (200 - a / 2 + 14) + '" font-size="38" text-anchor="middle">' + esc(ic) + '</text>' + txt(90, 234, '처음 그림', 20, '#3B4252', 800);
    const X = 250, B = a * k; s += '<rect x="' + X + '" y="' + (200 - B) + '" width="' + B + '" height="' + B + '" rx="10" fill="#FFF1E6" stroke="' + ORANGE + '" stroke-width="3"/>';
    for (let i = 1; i < k; i++) s += '<line x1="' + (X + a * i) + '" y1="' + (200 - B) + '" x2="' + (X + a * i) + '" y2="200" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="6 5"/><line x1="' + X + '" y1="' + (200 - a * i) + '" x2="' + (X + B) + '" y2="' + (200 - a * i) + '" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="6 5"/>';
    s += '<text x="' + (X + B / 2) + '" y="' + (200 - B / 2 + 26) + '" font-size="' + (38 * k) + '" text-anchor="middle">' + esc(ic) + '</text>' + txt(X + B / 2, 234, '가로·세로 ' + k + '배 → 넓이 ' + (k * k) + '배', 20, '#C2551A', 900) + '<path d="M140 150 H' + (X - 16) + '" stroke="#8A93A0" stroke-width="3" marker-end="url(#a2ar)"/><defs><marker id="a2ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#8A93A0"/></marker></defs>';
    return svgWrap(s, 'fig-area2', '0 0 460 250').replace('<svg ', '<svg data-k="' + k + '" data-area="' + (k * k) + '" ');
  }
  const SC_PARTS = { ask, habitat, trait, anat, cycle, cond, need, bins, mimic };

  const PARTS = { force, balance, lever, slope, scale, hand, robot, frac, fracs, numline, tenbox, geo, bt, regroup, share, bundle, arr, mulrows, eq, ruler, joins, road, clock, grid, range, brem, circ, compass, cgrid, crow, fgroup, fmix, nline, beaker, dial, tilt, cups, tubs, area2 };

  // ══ 57차(2026-09-30) 4학년 1학기 큰 수 부품 — pvt(자릿값판) · jump(뛰어 세기 띠) · notes(지폐·동전 묶음) ══
  // 그림 문법: 여덟 자리까지는 자리 이름 한 줄(천만~일) · 아홉 자리부터 네 자리마다 띠(일·만·억·조) + 천·백·십·일 · 주황 = 짚는 자리 · 초록 = 견줄 때 처음 달라지는 자리 · 파랑 = 풀어 쓴 식·읽는 말.
  const BN_PLACE = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조', '십조', '백조', '천조'];
  const BN_BAND = ['일', '만', '억', '조'], BN_SUB = ['일', '십', '백', '천'];
  const BN_DG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  function readKo(v) { // 네 자리씩 끊어 읽기 — 한 묶음 안의 1 은 천·백·십 앞에서 안 읽고, 묶음 값이 1 이면 「일만·일억·일조」
    const d = String(v).replace(/\D/g, '').replace(/^0+/, ''); if (!d) return '영';
    const out = []; for (let g = 0; g * 4 < d.length; g++) { const part = d.slice(Math.max(0, d.length - 4 * (g + 1)), d.length - 4 * g).padStart(4, '0'); if (+part === 0) continue;
      let t = ''; for (let i = 0; i < 4; i++) { const n = +part[i], pl = 3 - i; if (!n) continue; t += (pl && n === 1 ? '' : BN_DG[n]) + (pl ? BN_SUB[pl] : ''); }
      if (+part === 1 && g) t = '일'; out.unshift(t + (g ? BN_BAND[g] : '')); }
    return out.join(' ');
  }
  const placeIdx = (name) => BN_PLACE.indexOf(name);
  function expandOf(v) { const d = String(v).replace(/\D/g, ''); const parts = []; for (let i = 0; i < d.length; i++) if (+d[i]) parts.push(d[i] + '0'.repeat(d.length - 1 - i)); return parts; }
  function pvt(o) {
    const rows = (o.rows || [{ v: o.v }]).map(r => (typeof r === 'object' ? r : { v: r })).map(r => Object.assign({}, r, { v: String(r.v).replace(/\D/g, '') }));
    const cols = Math.max(o.cols || 0, ...rows.map(r => r.v.length), 1); const his = [].concat(o.hi == null ? [] : o.hi).map(placeIdx);
    let diff = -1; if (o.cmp && rows.length === 2 && rows[0].v.length === rows[1].v.length) { for (let i = rows[0].v.length - 1; i >= 0; i--) { if (rows[0].v[rows[0].v.length - 1 - i] !== rows[1].v[rows[1].v.length - 1 - i]) { diff = i; break; } } }
    const lab = rows.some(r => r.label); let h = '<table class="pv">';
    const banded = cols > 8; if (banded) { h += '<tr class="pv-band">' + (lab ? '<th></th>' : ''); for (let b = Math.ceil(cols / 4) - 1; b >= 0; b--) { const span = Math.min(4, cols - 4 * b); h += '<th colspan="' + span + '" class="b' + b + '">' + BN_BAND[b] + '</th>'; } h += '</tr>'; }
    h += '<tr class="pv-head">' + (lab ? '<th></th>' : ''); for (let i = cols - 1; i >= 0; i--) h += '<th class="b' + Math.floor(i / 4) + (his.indexOf(i) >= 0 ? ' hi' : '') + (i === diff ? ' df' : '') + '">' + (banded ? BN_SUB[i % 4] : BN_PLACE[i]) + '</th>'; h += '</tr>';
    rows.forEach(r => { h += '<tr class="pv-row">' + (lab ? '<th class="pv-lab">' + esc(r.label || '') + '</th>' : ''); for (let i = cols - 1; i >= 0; i--) { const ch = i < r.v.length ? r.v[r.v.length - 1 - i] : ''; const q = o.q != null && placeIdx(o.q) === i;
      h += '<td class="b' + Math.floor(i / 4) + (his.indexOf(i) >= 0 ? ' hi' : '') + (i === diff ? ' df' : '') + (q ? ' q' : '') + '">' + (q ? '?' : ch) + '</td>'; } h += '</tr>'; });
    h += '</table>';
    let foot = '';
    if (o.expand && rows.length === 1) foot += '<div class="pv-eq">' + esc(rows[0].v) + ' = ' + expandOf(rows[0].v).join(' + ') + '</div>';
    if (o.read) foot += rows.map(r => '<div class="pv-read">' + (rows.length > 1 || o.expand ? esc(r.v) + ' → ' : '') + '<b>' + esc(readKo(r.v)) + '</b></div>').join('');
    if (o.cmp && rows.length === 2) { const a = rows[0].v, b = rows[1].v, sg = a.length !== b.length ? (a.length > b.length ? '>' : '<') : (a === b ? '=' : (a > b ? '>' : '<')); foot += '<div class="pv-eq">' + esc(a) + ' ' + sg + ' ' + esc(b) + '</div>'; }
    return '<div class="fig-vert fig-pvt" data-vals="' + rows.map(r => r.v).join(',') + '" data-cols="' + cols + '"' + (diff >= 0 ? ' data-diff="' + BN_PLACE[diff] + '"' : '') + '>' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + '<div class="pv-wrap">' + h + '</div>' + foot + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  function stepLabel(n) { const a = Math.abs(n); const t = a % 1e12 === 0 ? a / 1e12 + '조' : a % 1e8 === 0 ? a / 1e8 + '억' : a % 1e4 === 0 ? a / 1e4 + '만' : String(a); return (n < 0 ? '−' : '+') + t; }
  function jump(o) {
    const st = Number(String(o.start).replace(/\D/g, '')), step = Number(o.step), n = Math.max(2, o.n | 0); const seq = Array.from({ length: n }, (_, i) => st + step * i);
    const lead = Math.floor(Math.log10(Math.abs(step)) + 1e-9); const pow = Math.pow(10, lead); const clean = Math.abs(step) % pow === 0 && Math.abs(step) / pow < 10;
    const dAt = (v) => { const d = String(v); return +(d[d.length - 1 - lead] || 0); }; const carry = seq.some((v, i) => i && dAt(v) - dAt(seq[i - 1]) !== step / pow); // 받아올림·내림이 끼면 「씩 커져요」 알림·칸 표시를 안 한다
    const qs = [].concat(o.q == null ? [] : o.q);
    const box = (v, i) => { if (qs.indexOf(i) >= 0) return '<span class="jp-b q">?</span>'; const d = String(v); if (!clean || carry || o.hiDigit === false) return '<span class="jp-b">' + d + '</span>';
      const at = d.length - 1 - lead; return '<span class="jp-b">' + esc(d.slice(0, at)) + '<i>' + esc(d[at]) + '</i>' + esc(d.slice(at + 1)) + '</span>'; };
    let h = '<div class="jp">'; seq.forEach((v, i) => { if (i) h += '<span class="jp-a"><em>' + stepLabel(step) + '</em>→</span>'; h += box(v, i); }); h += '</div>';
    return '<div class="fig-vert fig-jump" data-seq="' + seq.join(',') + '" data-step="' + step + '">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + h + (clean && !carry && o.hiDigit !== false ? '<div class="jp-key"><i></i>' + BN_PLACE[lead] + '의 자리가 ' + (step > 0 ? '1씩 커져요' : '1씩 작아져요').replace('1씩', (Math.abs(step) / pow) + '씩') + '</div>' : '') + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }
  function notes(o) { // items [{v:1000, n:10}] — 지폐(1000 이상)·동전 · 합계
    const it = o.items || []; const tot = it.reduce((a, r) => a + r.v * r.n, 0);
    const one = (r) => { const bill = r.v >= 1000; return Array.from({ length: r.n }, () => '<span class="nt-' + (bill ? 'bill' : 'coin') + ' v' + r.v + '">' + r.v + (bill ? '원' : '') + '</span>').join(''); };
    return '<div class="fig-vert fig-notes" data-total="' + tot + '">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + it.map(r => '<div class="nt-row">' + one(r) + '<b class="nt-n">' + r.v + '원 × ' + r.n + '</b></div>').join('') + (o.total === false ? '' : '<div class="pv-eq">모두 ' + (o.q ? '?' : tot + '원') + '</div>') + (o.label ? '<div class="fig-cap">' + esc(o.label) + '</div>' : '') + '</div>';
  }

  { // 59차 각도 부품 — 이름이 겹치지 않게 블록 안에 둔다
  // ══ 59차(2026-10-01) 4학년 1학기 각도 부품 — ang(각 하나) · prot(각도기) · asum(각도의 합·차·모으기) · polyang(삼각형·사각형의 각) ══
  // 그림 문법: 주황 호 = 잰(보는) 각 · 파랑·초록 부채꼴 = 더하는 두 각 · 연회색 빗금 = 덜어 낸 각 · 회색 점선 = 어림 기준선(45°·90°·135°) · 주황 ㄱ자 = 직각.
  const DR = Math.PI / 180;
  const dirPt = (cx, cy, r, a) => [cx + r * Math.cos(a * DR), cy - r * Math.sin(a * DR)];
  const fx = (n) => (+n).toFixed(1);
  function fitMap(pts, box) { // 단위 좌표 점들을 box [x0,y0,x1,y1] 안에 가운데 맞춤
    box = box || [34, 30, 426, 250]; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const sc = Math.min((box[2] - box[0]) / Math.max(1e-6, mxx - mnx), (box[3] - box[1]) / Math.max(1e-6, mxy - mny), 260); const ox = (box[0] + box[2]) / 2 - sc * (mnx + mxx) / 2, oy = (box[1] + box[3]) / 2 - sc * (mny + mxy) / 2;
    const f = (p) => [ox + sc * p[0], oy + sc * p[1]]; f.sc = sc; return f;
  }
  function wedge(cx, cy, r, a1, a2, fill, extra) { const p1 = dirPt(cx, cy, r, a1), p2 = dirPt(cx, cy, r, a2); const big = (a2 - a1) > 180 ? 1 : 0; if (a2 - a1 >= 359.9) return '<circle cx="' + fx(cx) + '" cy="' + fx(cy) + '" r="' + fx(r) + '" fill="' + fill + '"' + (extra || '') + '/>'; return '<path d="M' + fx(cx) + ' ' + fx(cy) + ' L' + fx(p1[0]) + ' ' + fx(p1[1]) + ' A' + fx(r) + ' ' + fx(r) + ' 0 ' + big + ' 0 ' + fx(p2[0]) + ' ' + fx(p2[1]) + ' Z" fill="' + fill + '"' + (extra || '') + '/>'; }
  function arcP(cx, cy, r, a1, a2, col, w) { if (a2 - a1 >= 359.9) return '<circle cx="' + fx(cx) + '" cy="' + fx(cy) + '" r="' + fx(r) + '" fill="none" stroke="' + (col || ORANGE) + '" stroke-width="' + (w || 5) + '"/>'; const p1 = dirPt(cx, cy, r, a1), p2 = dirPt(cx, cy, r, a2); return '<path d="M' + fx(p1[0]) + ' ' + fx(p1[1]) + ' A' + fx(r) + ' ' + fx(r) + ' 0 ' + ((a2 - a1) > 180 ? 1 : 0) + ' 0 ' + fx(p2[0]) + ' ' + fx(p2[1]) + '" fill="none" stroke="' + (col || ORANGE) + '" stroke-width="' + (w || 5) + '" stroke-linecap="round"/>'; }
  const rayL = (x1, y1, x2, y2, col, w) => '<line x1="' + fx(x1) + '" y1="' + fx(y1) + '" x2="' + fx(x2) + '" y2="' + fx(y2) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 6) + '" stroke-linecap="round"/>';
  const kindOf = (d) => (d > 0 && d < 90 ? '예각' : d === 90 ? '직각' : d > 90 && d < 180 ? '둔각' : d === 180 ? '일직선' : '');
  const degT = (d, q) => (q ? '?' : d + '°');
  function ang(o) {
    const d = +o.deg, r0 = +(o.rot || 0), l1 = o.sides ? o.sides[0] : 1, l2 = o.sides ? o.sides[1] : 1;
    const raw = [[0, 0], [l1 * Math.cos(r0 * DR), -l1 * Math.sin(r0 * DR)], [l2 * Math.cos((r0 + d) * DR), -l2 * Math.sin((r0 + d) * DR)]];
    for (let a = r0; a <= r0 + d; a += 15) raw.push([0.42 * Math.cos(a * DR), -0.42 * Math.sin(a * DR)]);
    [].concat(o.ref || []).forEach(rf => { const rr = Math.min(l1, l2) * 1.18; raw.push([rr * Math.cos((r0 + rf) * DR), -rr * Math.sin((r0 + rf) * DR)]); });
    const F = fitMap(raw, [40, o.label || o.kind ? 30 : 34, 420, o.label || o.kind ? 218 : 250]); const V = F(raw[0]), A = F(raw[1]), B = F(raw[2]); const R = Math.min(0.3 * F.sc, 64);
    let s = '';
    [].concat(o.ref || []).forEach(rf => { const e = dirPt(V[0], V[1], Math.min(l1, l2) * F.sc * 0.95, r0 + rf); s += '<line x1="' + fx(V[0]) + '" y1="' + fx(V[1]) + '" x2="' + fx(e[0]) + '" y2="' + fx(e[1]) + '" stroke="#9AA6B2" stroke-width="3" stroke-dasharray="8 7"/>' + txt(fx(dirPt(V[0], V[1], Math.min(l1, l2) * F.sc + 16, r0 + rf)[0]), fx(dirPt(V[0], V[1], Math.min(l1, l2) * F.sc + 16, r0 + rf)[1] + 6), rf + '°', 17, '#7A8796', 700); });
    if (o.unit) { const u = +o.unit; for (let a = r0, i = 0; a < r0 + d - 1e-6; a += u, i++) s += wedge(V[0], V[1], R * 1.9, a, Math.min(a + u, r0 + d), i % 2 ? '#FFE3CC' : '#FFF3E6', ' stroke="#F6B98A" stroke-width="2"'); }
    s += rayL(V[0], V[1], A[0], A[1]) + rayL(V[0], V[1], B[0], B[1]);
    if (d === 90 && o.show !== 'num') s += rightMark(V[0], V[1], A[0], A[1], B[0], B[1], 30);
    else if (o.arc !== false && !o.unit) s += arcP(V[0], V[1], R, r0, r0 + d);
    s += '<circle cx="' + fx(V[0]) + '" cy="' + fx(V[1]) + '" r="7" fill="' + INK + '"/>';
    if (o.show !== false) { const lp = dirPt(V[0], V[1], (o.unit ? R * 1.9 : R) + 34, r0 + d / 2); s += txt(fx(lp[0]), fx(lp[1] + 10), o.unit ? (o.q ? '? 칸' : Math.round(d / o.unit) + '칸') : degT(d, o.q), 30, o.q ? RED : ORANGE); }
    if (o.label || o.kind) s += txt(230, 262, o.label || kindOf(d), 26, BLUE2);
    return svgWrap(s, 'fig-ang').replace('<svg class="fig-svg fig-ang"', '<svg class="fig-svg fig-ang" data-deg="' + d + '"' + (o.unit ? ' data-units="' + (d / o.unit) + '"' : '') + (o.kind ? ' data-kind="' + kindOf(d) + '"' : ''));
  }
  function prot(o) { // 각도기 — 안쪽 눈금은 오른쪽 0, 바깥쪽 눈금은 왼쪽 0. from:'right' 이면 밑금이 오른쪽 변 → 안쪽 눈금을 읽는다
    const d = +o.deg, left = o.from === 'left'; const C = [230, 232], R = 186; let s = '';
    s += '<path d="M' + (C[0] - R - 8) + ' ' + C[1] + ' A' + (R + 8) + ' ' + (R + 8) + ' 0 0 1 ' + (C[0] + R + 8) + ' ' + C[1] + ' Z" fill="#EAF3FF" fill-opacity=".85" stroke="#8FB4E8" stroke-width="3"/>';
    for (let a = 0; a <= 180; a += 5) { const big = a % 10 === 0; const p1 = dirPt(C[0], C[1], R + 8, a), p2 = dirPt(C[0], C[1], R + 8 - (big ? 16 : 9), a); s += '<line x1="' + fx(p1[0]) + '" y1="' + fx(p1[1]) + '" x2="' + fx(p2[0]) + '" y2="' + fx(p2[1]) + '" stroke="#5E7FAF" stroke-width="' + (big ? 2.4 : 1.4) + '"/>'; }
    const phi2 = left ? 180 - d : d; // 둘째 변 방향
    for (let a = 0; a <= 180; a += 30) { const aa = a === 0 ? 5 : a === 180 ? 175 : a; const pin = dirPt(C[0], C[1], R - 30, aa), pout = dirPt(C[0], C[1], R - 56, aa); s += txt(fx(pin[0]), fx(pin[1] + 6), String(180 - a), 15, '#8A97A8', 700) + txt(fx(pout[0]), fx(pout[1] + 6), String(a), 15, '#8A97A8', 700); }
    s += '<line x1="' + (C[0] - R - 8) + '" y1="' + C[1] + '" x2="' + (C[0] + R + 8) + '" y2="' + C[1] + '" stroke="#5E7FAF" stroke-width="3"/>';
    const base = dirPt(C[0], C[1], R + 26, left ? 180 : 0), tip = dirPt(C[0], C[1], R + 26, phi2);
    s += rayL(C[0], C[1], base[0], base[1], INK, 6) + rayL(C[0], C[1], tip[0], tip[1], INK, 6) + arcP(C[0], C[1], 46, Math.min(phi2, left ? 180 : 0), Math.max(phi2, left ? 180 : 0));
    const rd = left ? 180 - phi2 : phi2, other = 180 - rd; const rp = dirPt(C[0], C[1], left ? R - 30 : R - 56, phi2);
    s += '<circle cx="' + fx(rp[0]) + '" cy="' + fx(rp[1]) + '" r="21" fill="#fff" stroke="' + ORANGE + '" stroke-width="3"/>' + txt(fx(rp[0]), fx(rp[1] + 7), o.read === false ? '?' : String(rd), 19, ORANGE);
    s += '<circle cx="' + C[0] + '" cy="' + C[1] + '" r="7" fill="' + ORANGE + '"/>';
    if (o.parts) s += txt(C[0], C[1] + 30, '중심', 18, ORANGE) + txt(left ? C[0] + 150 : C[0] - 150, C[1] + 30, '밑금', 18, '#5E7FAF');
    return svgWrap(s, 'fig-prot', '0 0 460 272').replace('<svg class="fig-svg fig-prot"', '<svg class="fig-svg fig-prot" data-deg="' + d + '" data-read="' + rd + '" data-other="' + other + '"');
  }
  function asum(o) { // parts 여러 각을 한 점에 이어 붙임(op '+') · op '-' 이면 parts[0] 에서 parts[1] 을 덜어 냄
    const P = (o.parts || [o.a, o.b]).map(Number), op = o.op || '+'; const qi = o.q == null ? -1 : +o.q; const tot = op === '-' ? P[0] - P[1] : P.reduce((a, b) => a + b, 0); const span = op === '-' ? P[0] : tot;
    const raw = [[0, 0], [1, 0], [Math.cos(span * DR), -Math.sin(span * DR)]]; for (let a = 0; a <= span; a += 10) raw.push([Math.cos(a * DR), -Math.sin(a * DR)]);
    const F = fitMap(raw, [48, 36, 412, o.label === false ? 250 : 222]); const V = F([0, 0]); const L = F.sc; const COLS = ['#CFE0FB', '#D6F2E1', '#FFE3CC', '#EFE2FA', '#FDE8EC'], EDGE = [BLUE, GRN, ORANGE, PURP, RED]; let s = '', a0 = 0;
    const lab = (a1, a2, t, col, rr) => { if (o.nums === false) return ''; const p = dirPt(V[0], V[1], L * (rr || 0.62), (a1 + a2) / 2); return txt(fx(p[0]), fx(p[1] + 9), t, (a2 - a1) < 32 ? 22 : 26, col); };
    if (op === '-') { s += wedge(V[0], V[1], L * 0.92, 0, P[0], '#E4ECF7'); s += wedge(V[0], V[1], L * 0.92, 0, P[1], '#D5DCE5', ' stroke="#9AA6B2" stroke-width="2" stroke-dasharray="6 5"'); s += wedge(V[0], V[1], L * 0.92, P[1], P[0], COLS[1]);
      [0, P[1], P[0]].forEach(a => { const e = dirPt(V[0], V[1], L, a); s += rayL(V[0], V[1], e[0], e[1], a === P[1] ? '#8A97A8' : INK, a === P[1] ? 4 : 6); });
      s += lab(0, P[1], (qi === 1 ? '?' : P[1] + '°'), '#6B7C93', 0.6) + lab(P[1], P[0], qi === 2 ? '?' : tot + '°', '#2E8B57', 0.7) + arcP(V[0], V[1], L * 0.98, 0, P[0], ORANGE, 4) + (o.nums === false ? '' : (() => { const p = dirPt(V[0], V[1], L * 1.08, P[0] / 2); return txt(fx(p[0]), fx(p[1]), qi === 0 ? '?' : P[0] + '°', 22, ORANGE); })()); }
    else { P.forEach((a, i) => { s += wedge(V[0], V[1], L * 0.92, a0, a0 + a, COLS[i % 5], ' stroke="' + EDGE[i % 5] + '" stroke-width="2"'); a0 += a; });
      a0 = 0; P.forEach((a, i) => { s += lab(a0, a0 + a, qi === i ? '?' : a + '°', qi === i ? RED : INK, P.length > 2 ? 0.66 : 0.6); a0 += a; });
      const edges = [0]; P.reduce((acc, a) => { edges.push(acc + a); return acc + a; }, 0); edges.forEach((a, i) => { if (a >= 360 && i) return; const e = dirPt(V[0], V[1], L, a); s += rayL(V[0], V[1], e[0], e[1], INK, i === 0 || i === edges.length - 1 ? 6 : 4); });
      if (P.length > 1 && tot < 359.9) s += arcP(V[0], V[1], L * 0.98, 0, tot, ORANGE, 4); }
    s += '<circle cx="' + fx(V[0]) + '" cy="' + fx(V[1]) + '" r="7" fill="' + INK + '"/>';
    const terms = op === '-' ? [P[0], P[1], tot] : P.concat(tot); const tt = terms.map((a, i) => (qi === i ? '?' : a + '°')); const eqT = o.label != null && o.label !== false ? o.label : (op === '-' ? tt[0] + ' − ' + tt[1] + ' = ' + tt[2] : tt.slice(0, -1).join(' + ') + ' = ' + tt[tt.length - 1] + (qi !== P.length && tot === 180 ? ' (일직선)' : qi !== P.length && tot === 360 ? ' (한 바퀴)' : ''));
    if (o.label !== false) s += txt(230, 262, eqT, P.length > 3 ? 22 : 26, BLUE2);
    return svgWrap(s, 'fig-asum').replace('<svg class="fig-svg fig-asum"', '<svg class="fig-svg fig-asum" data-parts="' + P.join(',') + '" data-op="' + op + '" data-r="' + tot + '"' + (qi >= 0 ? ' data-q="' + qi + '"' : ''));
  }
  function polyVerts(A) { // 안쪽 각 A(도) — 삼각형은 사인 법칙, 사각형은 두 변을 정해 닫히게
    const n = A.length; if (n === 3) { const [a, b, c] = A; const la = Math.sin(a * DR), lc = Math.sin(c * DR); const P0 = [0, 0], P1 = [lc, 0], P2 = [la * Math.cos(b * DR) * -1 + lc, 0]; const bx = Math.sin(b * DR); // 꼭짓점 0 에서 각 a, 1 에서 각 b
      const x2 = lc - la * Math.cos(b * DR), y2 = -la * Math.sin(b * DR); void P2; void bx; return [P0, P1, [x2, y2]]; }
    const ext = A.map(a => 180 - a); let best = null;
    for (const l0 of [0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5]) for (const l1 of [0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5]) { const th = [0]; for (let i = 1; i < 4; i++) th.push(th[i - 1] + ext[i]); const u = th.map(t => [Math.cos(t * DR), -Math.sin(t * DR)]);
      const rx = -(l0 * u[0][0] + l1 * u[1][0]), ry = -(l0 * u[0][1] + l1 * u[1][1]); const det = u[2][0] * u[3][1] - u[3][0] * u[2][1]; if (Math.abs(det) < 1e-9) continue; const l2 = (rx * u[3][1] - u[3][0] * ry) / det, l3 = (u[2][0] * ry - rx * u[2][1]) / det; if (l2 <= 0 || l3 <= 0) continue;
      const L = [l0, l1, l2, l3]; const V = [[0, 0]]; for (let i = 0; i < 3; i++) V.push([V[i][0] + L[i] * u[i][0], V[i][1] + L[i] * u[i][1]]); let ar = 0; for (let i = 0; i < 4; i++) { const a = V[i], b = V[(i + 1) % 4]; ar += a[0] * b[1] - b[0] * a[1]; } const pe = L.reduce((x, y) => x + y, 0); const sc = Math.abs(ar) / 2 / (pe * pe) * Math.min(1, Math.min(...L) / Math.max(...L) * 2.5); if (!best || sc > best.sc) best = { sc, V }; }
    if (best) { const V = best.V; return [V[0], V[1], V[2], V[3]].map((p, i, a) => p); }
    return [[0, 0], [1, 0], [1, -1], [0, -1]];
  }
  function polyang(o) {
    const A = (o.angs || []).map(Number); const qi = o.q == null ? -1 : +o.q; const n = A.length; const V0 = polyVerts(A); const F = fitMap(V0, [70, 40, 390, o.label === false ? 236 : 214]); const V = V0.map(F); let s = '';
    s += poly(V.map(p => [fx(p[0]), fx(p[1])]), o.color || (n === 3 ? '#DFF5E6' : '#FFF1D6'));
    if (o.diag && n === 4) s += '<line x1="' + fx(V[0][0]) + '" y1="' + fx(V[0][1]) + '" x2="' + fx(V[2][0]) + '" y2="' + fx(V[2][1]) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 7"/>';
    const cx = V.reduce((a, p) => a + p[0], 0) / n, cy = V.reduce((a, p) => a + p[1], 0) / n;
    V.forEach((p, i) => { const pa = V[(i + n - 1) % n], pb = V[(i + 1) % n]; const a1 = Math.atan2(-(pa[1] - p[1]), pa[0] - p[0]) / DR, a2 = Math.atan2(-(pb[1] - p[1]), pb[0] - p[0]) / DR; let lo = Math.min(a1, a2), hi = Math.max(a1, a2); if (hi - lo > 180) { const t = lo; lo = hi; hi = t + 360; }
      if (A[i] === 90 && qi !== i) s += rightMark(p[0], p[1], pa[0], pa[1], pb[0], pb[1], 20); else s += arcP(p[0], p[1], 26, lo, hi, qi === i ? RED : ORANGE, 4);
      const ua = [pa[0] - p[0], pa[1] - p[1]], ub = [pb[0] - p[0], pb[1] - p[1]]; const na = Math.hypot(ua[0], ua[1]) || 1, nb = Math.hypot(ub[0], ub[1]) || 1; let bx = ua[0] / na + ub[0] / nb, by = ua[1] / na + ub[1] / nb; let bl = Math.hypot(bx, by); if (bl < 1e-6) { bx = cx - p[0]; by = cy - p[1]; bl = Math.hypot(bx, by) || 1; } const kk = A[i] > 110 ? 44 : A[i] < 50 ? 70 : 56; const lx = p[0] + bx / bl * kk, ly = p[1] + by / bl * kk; s += txt(fx(lx), fx(ly + 9), qi === i ? '?' : A[i] + '°', 24, qi === i ? RED : INK); });
    const tot = A.reduce((a, b) => a + b, 0);
    if (o.label !== false) s += txt(230, 262, o.label || (A.map((a, i) => (qi === i ? '?' : a + '°')).join(' + ') + ' = ' + tot + '°'), n > 3 ? 22 : 24, BLUE2);
    return svgWrap(s, 'fig-polyang').replace('<svg class="fig-svg fig-polyang"', '<svg class="fig-svg fig-polyang" data-angs="' + A.join(',') + '" data-sum="' + tot + '"' + (qi >= 0 ? ' data-q="' + qi + '"' : ''));
  }
  Object.assign(PARTS, { ang, prot, asum, polyang });
  }
  { // 61차 삼각형 부품 — 이름이 겹치지 않게 블록 안에 둔다
  // ══ 61차(2026-10-01) 4학년 1학기 삼각형 부품 — tri(삼각형 하나: 각으로 또는 세 변으로) · paper(색종이 자르기) ══
  // 그림 문법(자기주도 원문과 같음): 빨간 호 = 예각 · 검은 ㄱ자 = 직각 · 파란 호 = 둔각(mark:'kind') · 같은 변 = 같은 눈금(／) · 같은 각 = 같은 겹 호(mark:'eq') · 회색 점선 = 접는 선.
  const DR = Math.PI / 180; const fx = (n) => (+n).toFixed(1);
  function fitMap(pts, box) { // 단위 좌표 점들을 box [x0,y0,x1,y1] 안에 가운데 맞춤
    box = box || [34, 30, 426, 250]; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const sc = Math.min((box[2] - box[0]) / Math.max(1e-6, mxx - mnx), (box[3] - box[1]) / Math.max(1e-6, mxy - mny), 260); const ox = (box[0] + box[2]) / 2 - sc * (mnx + mxx) / 2, oy = (box[1] + box[3]) / 2 - sc * (mny + mxy) / 2;
    const f = (p) => [ox + sc * p[0], oy + sc * p[1]]; f.sc = sc; return f;
  }
  const KC = { 예각: RED, 직각: INK, 둔각: BLUE2 };
  const kindT = (d) => (d < 89.5 ? '예각' : d <= 90.5 ? '직각' : '둔각');
  const triKind = (A) => { const m = Math.max(...A); return m > 90.5 ? '둔각삼각형' : m >= 89.5 ? '직각삼각형' : '예각삼각형'; };
  const sideKind = (L) => { const e = (x, y) => Math.abs(x - y) < 1e-6 * Math.max(x, y) + 1e-9; const n = [e(L[0], L[1]), e(L[1], L[2]), e(L[2], L[0])].filter(Boolean).length; return n === 3 ? '정삼각형' : n ? '이등변삼각형' : ''; };
  const angAt = (P, i) => { const p = P[i], a = P[(i + 2) % 3], b = P[(i + 1) % 3]; const v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) / DR; };
  function arcAt(p, a, b, r, col, w) { const a1 = Math.atan2(-(a[1] - p[1]), a[0] - p[0]) / DR, a2 = Math.atan2(-(b[1] - p[1]), b[0] - p[0]) / DR; let lo = Math.min(a1, a2), hi = Math.max(a1, a2); if (hi - lo > 180) { const t = lo; lo = hi; hi = t + 360; }
    const q1 = [p[0] + r * Math.cos(lo * DR), p[1] - r * Math.sin(lo * DR)], q2 = [p[0] + r * Math.cos(hi * DR), p[1] - r * Math.sin(hi * DR)]; return '<path d="M' + fx(q1[0]) + ' ' + fx(q1[1]) + ' A' + r + ' ' + r + ' 0 0 0 ' + fx(q2[0]) + ' ' + fx(q2[1]) + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>'; }
  function tick(a, b, n) { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L; let s = ''; for (let k = 0; k < n; k++) { const off = (k - (n - 1) / 2) * 9; const cx = mx + ux * off, cy = my + uy * off; s += '<line class="t-tick" x1="' + fx(cx - uy * 11 - ux * 4) + '" y1="' + fx(cy + ux * 11 - uy * 4) + '" x2="' + fx(cx + uy * 11 + ux * 4) + '" y2="' + fx(cy - ux * 11 + uy * 4) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; } return s; }
  function triRaw(o) { // 단위 좌표(위가 −y) 세 꼭짓점 · 변 0-1, 1-2, 2-0
    if (o.len) { const [c, a, b] = o.len.map(Number); const x = (c * c + b * b - a * a) / (2 * c); return [[0, 0], [c, 0], [x, -Math.sqrt(Math.max(0, b * b - x * x))]]; }
    const [A, B, C] = o.angs.map(Number); const lc = Math.sin(C * DR), la = Math.sin(A * DR); void lc; return [[0, 0], [Math.sin(C * DR), 0], [Math.sin(C * DR) - la * Math.cos(B * DR), -la * Math.sin(B * DR)]]; }
  function tri(o) {
    let P = triRaw(o); const r0 = +(o.rot || 0); if (r0) P = P.map(p => [p[0] * Math.cos(r0 * DR) + p[1] * Math.sin(r0 * DR), -p[0] * Math.sin(r0 * DR) + p[1] * Math.cos(r0 * DR)]);
    const cap = o.label ? 1 : 0; const zb = [70, 40, 390, cap ? 210 : 240], zs = o.size ? +o.size : 1, zc = [(zb[0] + zb[2]) / 2, (zb[1] + zb[3]) / 2]; const F = fitMap(P, [zc[0] - (zc[0] - zb[0]) * zs, zc[1] - (zc[1] - zb[1]) * zs, zc[0] + (zb[2] - zc[0]) * zs, zc[1] + (zb[3] - zc[1]) * zs]); const V = P.map(F);
    const A = [0, 1, 2].map(i => angAt(V, i)); const Ar = A.map(a => Math.round(a)); const Lr = [0, 1, 2].map(i => Math.hypot(P[(i + 1) % 3][0] - P[i][0], P[(i + 1) % 3][1] - P[i][1]));
    const qi = o.q == null ? -1 : +o.q; let s = '';
    s += poly(V.map(p => [fx(p[0]), fx(p[1])]), o.color || '#E9F1FD');
    if (o.fold != null && o.fold !== false) { const ap = o.fold === true ? (Ar[0] === Ar[1] ? 2 : Ar[1] === Ar[2] ? 0 : 1) : +o.fold; const a = V[(ap + 1) % 3], b = V[(ap + 2) % 3]; s += '<line class="t-fold" x1="' + fx(V[ap][0]) + '" y1="' + fx(V[ap][1]) + '" x2="' + fx((a[0] + b[0]) / 2) + '" y2="' + fx((a[1] + b[1]) / 2) + '" stroke="#8A97A8" stroke-width="3" stroke-dasharray="9 7"/>'; }
    // 같은 변 눈금 — 변의 길이(len 이면 주어진 수, 아니면 사인 법칙)로 판정
    const SL = o.len ? o.len.map(Number) : [Math.sin(Ar[2] * DR), Math.sin(Ar[0] * DR), Math.sin(Ar[1] * DR)].map(x => Math.round(x * 1e6) / 1e6);
    if (o.ticks !== false) { const eq = (x, y) => Math.abs(x - y) < 1e-6; [0, 1, 2].forEach(i => { const n = [0, 1, 2].filter(j => j !== i && eq(SL[i], SL[j])).length; if (n) s += tick(V[i], V[(i + 1) % 3], 1); }); }
    const cx = (V[0][0] + V[1][0] + V[2][0]) / 3, cy = (V[0][1] + V[1][1] + V[2][1]) / 3; const mk = o.mark || 'kind';
    const shown = o.show === false ? [] : o.show === true || o.show == null ? (mk === 'deg' ? [0, 1, 2] : []) : [].concat(o.show);
    const groups = {}; Ar.forEach((a, i) => { (groups[a] = groups[a] || []).push(i); }); let gi = 0; const gOf = {}; Object.keys(groups).forEach(k => { if (groups[k].length > 1) { gi++; groups[k].forEach(i => { gOf[i] = gi; }); } });
    V.forEach((p, i) => { const a = V[(i + 2) % 3], b = V[(i + 1) % 3]; const kd = kindT(A[i]);
      if (mk === 'kind') { if (kd === '직각') s += rightMark(p[0], p[1], a[0], a[1], b[0], b[1], 22).replace('stroke="' + ORANGE + '"', 'stroke="' + INK + '"'); else s += arcAt(p, a, b, 26, KC[kd], 5); }
      else if (mk === 'eq') { if (gOf[i]) for (let k = 0; k < gOf[i]; k++) s += arcAt(p, a, b, 24 + k * 8, ORANGE, 4); else if (kd === '직각') s += rightMark(p[0], p[1], a[0], a[1], b[0], b[1], 20).replace('stroke="' + ORANGE + '"', 'stroke="' + INK + '"'); }
      else if (mk === 'deg') { if (kd === '직각' && qi !== i) s += rightMark(p[0], p[1], a[0], a[1], b[0], b[1], 20).replace('stroke="' + ORANGE + '"', 'stroke="' + INK + '"'); else if (shown.indexOf(i) >= 0 || qi === i) s += arcAt(p, a, b, 24, qi === i ? RED : ORANGE, 4); }
      if (shown.indexOf(i) >= 0 || qi === i) { const ua = [a[0] - p[0], a[1] - p[1]], ub = [b[0] - p[0], b[1] - p[1]]; const na = Math.hypot(...ua) || 1, nb = Math.hypot(...ub) || 1; let bx = ua[0] / na + ub[0] / nb, by = ua[1] / na + ub[1] / nb; let bl = Math.hypot(bx, by); if (bl < 1e-6) { bx = cx - p[0]; by = cy - p[1]; bl = Math.hypot(bx, by) || 1; } const kk = A[i] > 110 ? 46 : A[i] < 45 ? 74 : 58; s += txt(fx(p[0] + bx / bl * kk), fx(p[1] + by / bl * kk + 9), qi === i ? '?' : Ar[i] + '°', 24, qi === i ? RED : INK); } });
    if (o.len && o.cm !== false) [0, 1, 2].forEach(i => { const a = V[i], b = V[(i + 1) % 3]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; let nx = mx - cx, ny = my - cy; const nl = Math.hypot(nx, ny) || 1; s += txt(fx(mx + nx / nl * 30), fx(my + ny / nl * 30 + 8), o.lq === i ? '? cm' : String(o.len[i]) + ' cm', 21, o.lq === i ? RED : '#3E6FCF', 800); });
    if (o.st) [0, 1, 2].forEach(i => { if (!o.st[i]) return; const a = V[i], b = V[(i + 1) % 3]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; let nx = mx - cx, ny = my - cy; const nl = Math.hypot(nx, ny) || 1; s += txt(fx(mx + nx / nl * 30), fx(my + ny / nl * 30 + 8), o.st[i], 21, '#3E6FCF', 800); });
    if (o.label) s += txt(230, 262, o.label, 24, BLUE2);
    return svgWrap(s, 'fig-tri').replace('<svg class="fig-svg fig-tri"', '<svg class="fig-svg fig-tri" data-angs="' + Ar.join(',') + '" data-kind="' + triKind(Ar) + '" data-side="' + sideKind(SL) + '"' + (o.len ? ' data-len="' + o.len.join(',') + '"' : '') + (qi >= 0 ? ' data-q="' + qi + '"' : ''));
  }
  function paper(o) { // 색종이(정사각형 0~4 좌표, 아래가 +y) · pieces [[ [x,y]… ]] · rest = 잘리지 않고 남은 칸 · num 조각 번호 · kind 직각 표시
    const S = 196, X0 = 132, Y0 = 34, k = S / 4; const M = (p) => [X0 + p[0] * k, Y0 + p[1] * k]; let s = '';
    s += '<rect x="' + X0 + '" y="' + Y0 + '" width="' + S + '" height="' + S + '" fill="#FFF6D9" stroke="#C9A64A" stroke-width="3"/>';
    const FILL = ['#FDE2E2', '#DCE8FB', '#DDF4E6', '#FFF1D6', '#EFE2FA', '#E3F2F9']; const kinds = [];
    (o.pieces || []).forEach((pc, i) => { const V = pc.map(M); s += poly(V.map(p => [fx(p[0]), fx(p[1])]), FILL[i % FILL.length], ' class="pp-piece"');
      if (pc.length === 3) { const A = [0, 1, 2].map(j => angAt(V, j)); kinds.push(triKind(A.map(Math.round))); if (o.mark !== false) V.forEach((p, j) => { if (Math.abs(A[j] - 90) < 0.5) s += rightMark(p[0], p[1], V[(j + 2) % 3][0], V[(j + 2) % 3][1], V[(j + 1) % 3][0], V[(j + 1) % 3][1], 14).replace('stroke="' + ORANGE + '"', 'stroke="' + INK + '"').replace('stroke-width="5"', 'stroke-width="3"'); else if (A[j] > 90.5) s += arcAt(p, V[(j + 2) % 3], V[(j + 1) % 3], 18, BLUE2, 4); }); } else kinds.push('');
      if (o.num !== false) { const c = V.reduce((a, p) => [a[0] + p[0] / V.length, a[1] + p[1] / V.length], [0, 0]); s += txt(fx(c[0]), fx(c[1] + 9), '①②③④⑤⑥⑦⑧'[i], 26, INK); } });
    (o.rest || []).forEach(pc => { const V = pc.map(M); s += poly(V.map(p => [fx(p[0]), fx(p[1])]), '#FFF6D9', ' stroke-dasharray="6 5" class="pp-rest"'); });
    if (o.label) s += txt(230, 262, o.label, 24, BLUE2);
    return svgWrap(s, 'fig-paper').replace('<svg class="fig-svg fig-paper"', '<svg class="fig-svg fig-paper" data-kinds="' + kinds.join(',') + '" data-n="' + (o.pieces || []).length + '"' + ((o.rest || []).length ? ' data-rest="' + o.rest.length + '"' : ''));
  }
  Object.assign(PARTS, { tri, paper });
  // ══ 62차(2026-10-02) 4학년 1학기 막대그래프 부품 — bar(막대그래프: 세로·가로 · 눈금 한 칸 · 두 자료 한 그래프 · 빈 막대) ══
  // 그림 문법(자기주도 원문과 같음): 파랑 막대 = 자료 · 주황 막대 = 짚는 막대(hi) · 두 자료는 파랑·주황 + 범례 · 회색 눈금선 = 눈금 한 칸 · 주황 점선 「?」 = 아직 못 그린 막대.
  // x 항목 이름[] · v 값[] (또는 sets [{name, v[]}] 두 자료 · by 'item'(항목별로 묶기, 기본)|'set'(자료별로 묶기))
  // step 눈금 한 칸 · max 눈금 끝(기본 = step 배수로 올림) · every 수 글자를 붙이는 칸 간격(기본 자동) · unit 단위 · xl 가로 이름 · yl 세로 이름 · title
  // horiz 가로 막대 · vals 막대 끝에 수(기본 없음 — 눈금을 세어 읽는 것이 과제) · hi 주황 막대 번호 · hide true(막대 없음 — 틀만)|[i](그 막대만 빈 자리 「?」) · bw 막대 굵기(0.2~0.8, 기본 0.5)
  // data-v 그린 값 · data-step · data-max · data-cells 칸 수 · data-horiz · data-hide · 막대 rect.bb[data-i][data-s] · 눈금선 line.bg(0 포함 칸마다)
  function wrap2(t, n) { t = String(t == null ? '' : t); if (t.length <= n) return [t]; const sp = [...t.matchAll(/ /g)].map(m => m.index); if (!sp.length) { const h = Math.ceil(t.length / 2); return [t.slice(0, h), t.slice(h)]; } const mid = t.length / 2; const i = sp.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a)); return [t.slice(0, i), t.slice(i + 1)]; }
  function bar(o) {
    const sets = o.sets ? o.sets.map(s => ({ name: s.name, v: (s.v || []).map(Number) })) : [{ name: '', v: (o.v || []).map(Number) }];
    const x = o.x || [], n = x.length, ns = sets.length; if (!n || sets.some(s => s.v.length !== n)) return '';
    const step = +o.step || 1, all = [].concat(...sets.map(s => s.v)), top = +o.max || Math.max(step, Math.ceil(Math.max.apply(null, all) / step) * step), nt = Math.round(top / step);
    const every = +o.every || (nt <= 12 ? 1 : ([2, 5, 10, 4, 3, 6, 20, 25, 50].find(d => nt % d === 0 && nt / d <= 10) || Math.ceil(nt / 10))), hz = !!o.horiz, hide = o.hide === true ? 'all' : [].concat(o.hide || []), hi = [].concat(o.hi == null ? [] : o.hi), bwr = Math.max(0.2, Math.min(0.8, +o.bw || 0.5));
    const TP = o.title ? 42 : 0, W0 = 760, H0 = TP + (hz ? 60 + n * (ns > 1 ? 74 : 56) + 90 : 440), L = hz ? 190 : 92, R = 30, T = TP + (ns > 1 ? 64 : 44), B = hz ? 74 : 92;
    const PW = W0 - L - R, PH = H0 - T - B, len = (v) => (Math.min(v, top) / top) * (hz ? PW : PH);
    const COL = ['#6F9BEA', '#FF9F5A'], HI = '#FF7A2F';
    let s = '';
    // 눈금선 + 수 글자
    for (let i = 0; i <= nt; i++) { const val = Math.round(step * i * 1000) / 1000; const lab = i % every === 0;
      if (hz) { const gx = L + PW * i / nt; s += '<line class="bg" x1="' + fx(gx) + '" y1="' + T + '" x2="' + fx(gx) + '" y2="' + (T + PH) + '" stroke="' + (i ? '#DCE3EC' : INK) + '" stroke-width="' + (i ? 2 : 3) + '"/>' + (lab ? txt(fx(gx), T + PH + 28, String(val), 20, '#5B6B80', 700) : ''); }
      else { const gy = T + PH - PH * i / nt; s += '<line class="bg" x1="' + L + '" y1="' + fx(gy) + '" x2="' + (L + PW) + '" y2="' + fx(gy) + '" stroke="' + (i ? '#DCE3EC' : INK) + '" stroke-width="' + (i ? 2 : 3) + '"/>' + (lab ? txt(L - 12, fx(gy + 7), String(val), 20, '#5B6B80', 700, 'end') : ''); } }
    // 축
    s += hz ? '<line x1="' + L + '" y1="' + (T + PH) + '" x2="' + (L + PW) + '" y2="' + (T + PH) + '" stroke="' + INK + '" stroke-width="3"/>' : '<line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + PH) + '" stroke="' + INK + '" stroke-width="3"/>';
    // 막대 자리
    const slots = []; const by = o.by === 'set' && ns > 1 ? 'set' : 'item';
    if (by === 'item') x.forEach((nm, i) => sets.forEach((st, j) => slots.push({ i, j, grp: i, sub: j, gn: ns })));
    else sets.forEach((st, j) => x.forEach((nm, i) => slots.push({ i, j, grp: j, sub: i, gn: n })));
    const G = by === 'item' ? n : ns, gw = (hz ? PH : PW) / G;
    const thick = Math.min(by === 'item' && ns > 1 ? 44 : 64, gw * bwr / (by === 'item' ? ns : n) * (by === 'item' && ns === 1 ? 1 : 1.6));
    const cells = [];
    slots.forEach(sl => { const val = sets[sl.j].v[sl.i], c0 = (hz ? T : L) + gw * sl.grp + gw / 2, off = (sl.sub - (sl.gn - 1) / 2) * thick * 1.08, mid = c0 + off, h = len(val), on = hi.indexOf(sl.i) >= 0 && ns === 1, hid = hide === 'all' || hide.indexOf(sl.i) >= 0;
      cells.push(Math.round(val / step * 1000) / 1000);
      const col = on ? HI : COL[sl.j % 2];
      if (hid) { s += hz ? '<rect class="bq" data-i="' + sl.i + '" x="' + (L + 4) + '" y="' + fx(mid - thick / 2) + '" width="40" height="' + fx(thick) + '" rx="5" fill="none" stroke="' + HI + '" stroke-width="2.5" stroke-dasharray="6 5"/>' + txt(L + 24, fx(mid + 8), '?', 22, HI, 900) : '<rect class="bq" data-i="' + sl.i + '" x="' + fx(mid - thick / 2) + '" y="' + (T + PH - 40) + '" width="' + fx(thick) + '" height="40" rx="5" fill="none" stroke="' + HI + '" stroke-width="2.5" stroke-dasharray="6 5"/>' + txt(fx(mid), T + PH - 12, '?', 22, HI, 900); }
      else if (h > 0) { s += hz ? '<rect class="bb" data-i="' + sl.i + '" data-s="' + sl.j + '" x="' + L + '" y="' + fx(mid - thick / 2) + '" width="' + fx(h) + '" height="' + fx(thick) + '" fill="' + col + '"/>' : '<rect class="bb" data-i="' + sl.i + '" data-s="' + sl.j + '" x="' + fx(mid - thick / 2) + '" y="' + fx(T + PH - h) + '" width="' + fx(thick) + '" height="' + fx(h) + '" fill="' + col + '"/>';
        if (o.vals) s += hz ? txt(fx(L + h + 8), fx(mid + 8), String(val), 21, on ? '#C2551A' : '#2B4C8C', 900, 'start') : txt(fx(mid), fx(T + PH - h - 8), String(val), 21, on ? '#C2551A' : '#2B4C8C', 900); }
      // 항목 이름(자료별로 묶을 땐 막대마다 작게)
      if (by === 'set') s += hz ? txt(L - 10, fx(mid + 6), x[sl.i], 15, '#334', 700, 'end') : txt(fx(mid), T + PH + 22, String(x[sl.i]), 15, '#334', 700); });
    // 묶음 이름
    for (let g = 0; g < G; g++) { const c0 = (hz ? T : L) + gw * g + gw / 2, name = by === 'item' ? x[g] : sets[g].name, on = by === 'item' && ns === 1 && hi.indexOf(g) >= 0;
      const ln = wrap2(name, hz ? 7 : Math.max(4, Math.floor(gw / 22)));
      if (hz) ln.forEach((t, k) => { s += txt(by === 'set' ? 74 : L - 12, fx(c0 + 7 + (k - (ln.length - 1) / 2) * 24), t, by === 'set' ? 19 : 20, on ? '#C2551A' : '#334', 800, 'end'); });
      else ln.forEach((t, k) => { s += txt(fx(c0), T + PH + (by === 'set' ? 46 : 28) + k * 23, t, 20, on ? '#C2551A' : '#334', 800); }); }
    // 축 이름·단위
    const un = o.unit ? '(' + o.unit + ')' : '';
    if (hz) { s += txt(L + PW, H0 - 10, (o.xl || '') + un, 19, '#6B7C93', 800, 'end') + txt(8, T - 14, o.yl || '', 19, '#6B7C93', 800, 'start'); }
    else { s += txt(8, T - 16, (o.yl || '') + un, 19, '#6B7C93', 800, 'start') + txt(L + PW, H0 - 8, o.xl || '', 19, '#6B7C93', 800, 'end'); }
    if (ns > 1) sets.forEach((st, j) => { const lx = W0 - R - 300 + j * 150; s += '<rect x="' + lx + '" y="' + (TP + 12) + '" width="22" height="18" fill="' + COL[j] + '"/>' + txt(lx + 28, TP + 28, st.name, 18, '#334', 800, 'start'); });
    const head = o.title ? txt(W0 / 2, 30, o.title, 24, INK, 900) : '';
    return svgWrap(head + s, 'fig-bar', '0 0 ' + W0 + ' ' + H0).replace('<svg class="fig-svg fig-bar"', '<svg class="fig-svg fig-bar" data-v="' + sets.map(st => st.v.join(',')).join('|') + '" data-step="' + step + '" data-max="' + top + '" data-cells="' + cells.join(',') + '" data-horiz="' + (hz ? 1 : 0) + '" data-by="' + by + '" data-hide="' + (hide === 'all' ? 'all' : hide.join(',')) + '"' + (o.title ? ' data-title="' + esc(o.title) + '"' : ''));
  }
  Object.assign(PARTS, { bar });
  }
  const HTML_PARTS = { vert, tvert, vmul, vdiv, ptable, ograph, pgraph, pvt, jump, notes };
  { // 64차 관계와 규칙 부품 — 이름이 겹치지 않게 블록 안에 둔다
  // ══ 64차(2026-10-02) 4학년 1학기 관계와 규칙 부품 — bal(저울: 두 양) · eqc(등호 카드: 옳음 판정은 부품이 셈) · ngrid(수 배열표·수열) · eqs(계산식의 배열) · shapes(모양의 배열) ══
  // 그림 문법(자기주도 원문과 같음): 청록 = 변하는 부분 · 노랑 = 변하지 않는 부분 · 주황 「?」·「□」 = 구할 자리 · 노란 칸 = 짚는 줄.
  const fx6 = (n) => (+n).toFixed(1);
  const OPS = (e) => String(e == null ? '' : e).replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–-]/g, '-');
  function calc6(e) { const x = OPS(e).replace(/\s+/g, ''); if (!x || !/^[\d*+\-/().]+$/.test(x)) return NaN; try { const v = Function('return (' + x + ')')(); return Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : NaN; } catch (er) { return NaN; } }
  const show6 = (e) => String(e == null ? '' : e).replace(/\*/g, '×').replace(/\//g, '÷').replace(/(\d)-(?=\d|□|\()/g, '$1−');
  function tx6(x, y, t, sz, col, w, anc) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anc || 'middle') + '" font-size="' + sz + '" font-weight="' + (w || 800) + '" fill="' + (col || INK) + '">' + esc(t) + '</text>'; }
  const TEAL = '#2FB5AA', TEALD = '#168A80', GOLD = '#F6C445', GOLDD = '#C99A12', EMPH = '#FF7A2F';
  // bal: 저울 — l·r = 식 글자 또는 {expr, blocks[]} · level 수평으로 그림(값을 모를 때) · hideR 오른쪽 접시 「?」 · note 아래 글자
  //   기울기는 부품이 식을 셈해서 정한다(무거운 쪽이 내려감) · 셈이 안 되는 식(□·?)은 level 이어야 수평 · data-l/r/tilt
  function bal(o) {
    const side = (v) => (typeof v === 'object' && v ? v : { expr: v == null ? '' : String(v) });
    const Ls = side(o.l), Rs = side(o.r), lv = calc6(Ls.expr), rv = o.hideR ? NaN : calc6(Rs.expr);
    const tilt = o.level || isNaN(lv) || isNaN(rv) ? 0 : lv === rv ? 0 : lv > rv ? -7 : 7, cx = 230, by = 70, arm = 138, a = tilt * Math.PI / 180;
    const eL = [cx - arm * Math.cos(a), by - arm * Math.sin(a)], eR = [cx + arm * Math.cos(a), by + arm * Math.sin(a)];
    let s = '<path d="M' + (cx - 64) + ' 252 H' + (cx + 64) + ' L' + (cx + 22) + ' 234 H' + (cx - 22) + ' Z" fill="#8A93A0"/><rect x="' + (cx - 7) + '" y="' + by + '" width="14" height="168" fill="#9AA6B4"/>';
    s += '<line class="o-beam" data-ang="' + tilt + '" x1="' + fx6(eL[0]) + '" y1="' + fx6(eL[1]) + '" x2="' + fx6(eR[0]) + '" y2="' + fx6(eR[1]) + '" stroke="' + WOOD2 + '" stroke-width="10" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + by + '" r="9" fill="#fff" stroke="#5A6472" stroke-width="3"/>';
    const pan = (e, sd, hide, cls) => { const x = e[0], py = e[1] + 82; let t = '<g class="' + cls + '"><path d="M' + fx6(x) + ' ' + fx6(e[1]) + ' L' + fx6(x - 62) + ' ' + fx6(py) + ' M' + fx6(x) + ' ' + fx6(e[1]) + ' L' + fx6(x + 62) + ' ' + fx6(py) + '" stroke="#8A93A0" stroke-width="2"/>';
      t += '<path d="M' + fx6(x - 72) + ' ' + fx6(py) + ' Q' + fx6(x) + ' ' + fx6(py + 30) + ' ' + fx6(x + 72) + ' ' + fx6(py) + ' Z" fill="#DDE3EA" stroke="#8A93A0" stroke-width="3"/>';
      if (hide) t += tx6(fx6(x), fx6(py - 8), '?', 40, EMPH, 900);
      else if (sd.blocks && sd.blocks.length) { const b = sd.blocks, n = b.length, bw = Math.min(56, 136 / n - 4), tw = n * (bw + 4) - 4; b.forEach((lab, i) => { const bx = x - tw / 2 + i * (bw + 4), q = /\?|□/.test(lab); t += '<rect class="blk" x="' + fx6(bx) + '" y="' + fx6(py - 40) + '" width="' + fx6(bw) + '" height="36" rx="7" fill="' + (q ? '#fff' : TEAL) + '" stroke="' + (q ? EMPH : TEALD) + '" stroke-width="2.5"' + (q ? ' stroke-dasharray="5 4"' : '') + '/>' + tx6(fx6(bx + bw / 2), fx6(py - 15), lab, String(lab).length > 3 ? 15 : 19, q ? EMPH : '#fff', 900); }); }
      if (!hide && !(sd.blocks || []).some(b => /\?|□/.test(b))) t += tx6(fx6(x), fx6(py + 46), show6(sd.expr), 26, INK, 900); // 모르는 블록(?)이 있으면 식을 쓰지 않는다 — 답이 보임
      return t + '</g>'; };
    s += pan(eL, Ls, false, 'pan-l') + pan(eR, Rs, !!o.hideR, 'pan-r');
    const cap = o.note || (o.hideR ? '' : tilt === 0 ? '수평 — 두 양의 크기가 같아요' : '');
    if (cap) s += tx6(230, 292, cap, 20, '#3B4252', 800);
    return svgWrap(s, 'fig-bal', '0 0 460 ' + (cap ? 306 : 278)).replace('<svg ', '<svg data-l="' + (isNaN(lv) ? '' : lv) + '" data-r="' + (isNaN(rv) ? '' : rv) + '" data-tilt="' + tilt + '" ');
  }
  // shapes: 모양의 배열 — pat(cross 십자 자석 4n · stair 쌓기나무 1+3+5… · square n×n · tstair 계단 1+2+3… · row3 사각형 3+2… · vert3 세로 3+2…
  //   · wing 날개 2n · mid3 양끝 3개씩+가운데 2n · straw 종이 빨대 3·9·18…) · ns 순서 번호[] · eq 식[](ns 와 같은 길이) · q 다음 칸 「?」(true 또는 순서 이름)
  //   · circle 동그라미 · cnt false(개수 글자 숨김 — 셀 문제) · data-counts · g.sh-it[data-n][data-c]
  const ORD6 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
  const PAT = {
    cross: (k) => { const c = []; for (let i = 1; i <= k; i++) c.push([k, k - i, 'v'], [k, k + i, 'v'], [k - i, k, 'v'], [k + i, k, 'v']); return c; },
    stair: (k) => { const c = []; for (let r = 1; r <= k; r++) for (let i = 0; i < 2 * r - 1; i++) c.push([k - r + i, r - 1, r === 1 ? 'f' : 'v']); return c; },
    square: (k) => { const c = []; for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) c.push([x, y, 'v']); return c; },
    tstair: (k) => { const c = []; for (let r = 1; r <= k; r++) for (let i = 0; i < r; i++) c.push([i, r - 1, 'v']); return c; }, // 계단 — 아래로 갈수록 한 칸씩 길어짐
    row3: (k) => { const c = [[0, 0, 'f'], [0, 1, 'f'], [0, 2, 'f']]; for (let col = 1; col < k; col++) c.push([col, 1, 'v'], [col, 2, 'v']); return c; },
    vert3: (k) => { const c = [[0, k, 'f'], [0, k - 1, 'f'], [0, k + 1, 'f']]; for (let i = 1; i < k; i++) c.push([0, k - 1 - i, 'v'], [0, k + 1 + i, 'v']); return c; },
    wing: (k) => { const c = []; for (let i = 0; i < k; i++) c.push([i, 0, i ? 'v' : 'f'], [i, 1, i ? 'v' : 'f']); return c; },
    mid3: (k) => { const c = []; for (let i = 0; i < 3; i++) c.push([i, 0, 'f']); for (let i = 0; i < 2 * k; i++) c.push([3 + i, 0, 'v']); for (let i = 0; i < 3; i++) c.push([3 + 2 * k + i, 0, 'f']); return c; },
    straw: (k) => { const c = []; for (let r = 0; r < k; r++) for (let j = 0; j < 3 * (r + 1); j++) c.push([j % 6, r * 2 + Math.floor(j / 6), r ? 'v' : 'f', 's']); return c; }
  };
  function shapes(o) {
    const P = PAT[o.pat]; if (!P) return ''; const ns = [].concat(o.ns || [1, 2, 3, 4]), eqs = [].concat(o.eq || []);
    const its = ns.map((n, i) => ({ n, ord: ORD6[n - 1] || n + '째', c: P(n), eq: eqs[i] }));
    const maxR = Math.max.apply(null, its.map(it => Math.max.apply(null, it.c.map(c => c[1])) + 1)), gap = 3;
    const sumC = its.reduce((a, it) => a + Math.max.apply(null, it.c.map(c => c[0])) + 1, 0);
    let u = Math.min(30, 190 / maxR - gap); u = Math.max(10, Math.min(u, (880 - its.length * 70) / Math.max(1, sumC) - gap));
    const top = 40, colH = maxR * (u + gap), lab = top + colH + 34; let x = 20, s = '';
    its.forEach((it, i) => { const w = (Math.max.apply(null, it.c.map(c => c[0])) + 1) * (u + gap) - gap, cw = Math.max(w, 76), x0 = x + (cw - w) / 2, y0 = top + colH - (Math.max.apply(null, it.c.map(c => c[1])) + 1) * (u + gap);
      s += '<g class="sh-it" data-n="' + it.n + '" data-c="' + it.c.length + '">' + tx6(fx6(x + cw / 2), 26, it.ord, 22, '#5B6B80', 800);
      it.c.forEach(c => { const cx0 = x0 + c[0] * (u + gap), cy0 = y0 + c[1] * (u + gap), fl = c[2] === 'f' ? GOLD : TEAL, st = c[2] === 'f' ? GOLDD : TEALD;
        if (c[3] === 's') s += '<rect class="sc ' + c[2] + '" x="' + fx6(cx0 + u * 0.38) + '" y="' + fx6(cy0) + '" width="' + fx6(u * 0.24) + '" height="' + fx6(u * 1.6) + '" rx="2" fill="' + fl + '" stroke="' + st + '" stroke-width="1.5"/>';
        else if (o.circle) s += '<circle class="sc ' + c[2] + '" cx="' + fx6(cx0 + u / 2) + '" cy="' + fx6(cy0 + u / 2) + '" r="' + fx6(u / 2 - 1) + '" fill="' + fl + '" stroke="' + st + '" stroke-width="2"/>';
        else s += '<rect class="sc ' + c[2] + '" x="' + fx6(cx0) + '" y="' + fx6(cy0) + '" width="' + fx6(u) + '" height="' + fx6(u) + '" rx="' + fx6(u * 0.18) + '" fill="' + fl + '" stroke="' + st + '" stroke-width="2"/>'; });
      if (o.cnt !== false) s += tx6(fx6(x + cw / 2), lab, it.c.length + '개', 24, INK, 900);
      if (it.eq) s += tx6(fx6(x + cw / 2), lab + (o.cnt !== false ? 30 : 0), show6(it.eq), it.eq.length > 9 ? 18 : 21, TEALD, 900);
      s += '</g>'; x += cw; if (i < its.length - 1 || o.q) { s += tx6(fx6(x + 18), fx6(top + colH / 2 + 8), '→', 26, '#9AA6B4', 900); x += 36; } });
    if (o.q) { const qn = typeof o.q === 'string' ? o.q : ORD6[ns[ns.length - 1]] || '다음'; s += '<g class="sh-q">' + tx6(fx6(x + 40), 26, qn, 22, EMPH, 900) + '<rect x="' + fx6(x + 6) + '" y="' + fx6(top + colH / 2 - 34) + '" width="68" height="68" rx="12" fill="#fff" stroke="' + EMPH + '" stroke-width="3" stroke-dasharray="7 5"/>' + tx6(fx6(x + 40), fx6(top + colH / 2 + 14), '?', 40, EMPH, 900) + '</g>'; x += 84; }
    const H6 = lab + (eqs.length ? (o.cnt !== false ? 44 : 14) : 10) + (o.cnt === false && !eqs.length ? -24 : 0);
    return svgWrap(s, 'fig-shapes', '0 0 ' + Math.round(x + 20) + ' ' + Math.round(H6)).replace('<svg ', '<svg data-pat="' + esc(o.pat) + '" data-counts="' + its.map(it => it.c.length).join(',') + '" ');
  }
  Object.assign(PARTS, { bal, shapes });
  // ngrid: 수 배열표·수열 — rows [[칸]] (칸 = 수·글자 또는 {v, q:true(「?」), hl:'teal'|'gold'|'emph'}) · hl 'row'(첫 줄)|'diag'(↘)|'col'(첫 칸 줄) · head 첫 줄·첫 칸이 머리(덧셈표) · arrow 아래 글자
  function ngrid(o) {
    const rows = o.rows || []; const cell = (c) => (c !== null && typeof c === 'object' ? c : { v: c });
    const hlOf = (c, r, i) => c.hl || (o.hl === 'row' && r === 0 && !(o.head && i === 0) ? 'teal' : o.hl === 'diag' && r === i ? 'gold' : o.hl === 'col' && i === 0 ? 'teal' : '');
    let h = '<table class="ng' + (o.head ? ' head' : '') + '">' + rows.map((row, r) => '<tr>' + row.map((c0, i) => { const c = cell(c0), hl = hlOf(c, r, i), hd = o.head && (r === 0 || i === 0);
      return '<td class="' + [hd ? 'hd' : '', hl ? 'hl-' + hl : '', c.q ? 'q' : ''].filter(Boolean).join(' ') + '"' + (c.q ? ' data-q="1"' : '') + '>' + (c.q ? '?' : esc(c.v == null ? '' : c.v)) + '</td>'; }).join('') + '</tr>').join('') + '</table>';
    const data = rows.map(row => row.map(c0 => { const c = cell(c0); return c.q ? '?' : String(c.v == null ? '' : c.v); }).join(',')).join('|');
    return '<div class="fig-vert fig-ngrid" data-rows="' + esc(data) + '">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + '<div class="ng-wrap">' + h + '</div>' + (o.arrow ? '<div class="ng-ar">' + esc(o.arrow) + '</div>' : '') + '</div>';
  }
  // eqs: 계산식의 배열 — items [{ord, eq, blank(구할 식 — 「?」·「□」 그대로), hl}] · title
  function eqs(o) {
    const it = o.items || [];
    return '<div class="fig-vert fig-eqs">' + (o.title ? '<div class="pg-title">' + esc(o.title) + '</div>' : '') + it.map(r => '<div class="eqs-row' + (r.hl || r.blank ? ' hl' : '') + (r.blank ? ' blank' : '') + '" data-eq="' + esc(OPS(r.eq)) + '"' + (r.blank ? ' data-blank="1"' : '') + '><span class="eo">' + esc(r.ord || '') + '</span><span class="ee">' + esc(show6(r.eq)) + '</span></div>').join('') + (o.arrow ? '<div class="ng-ar">' + esc(o.arrow) + '</div>' : '') + '</div>';
  }
  // eqc: 등호 카드 — items [{l, r, judge(옳음 표시), hl:'l'|'r'}] · 옳음 ○/× 는 부품이 양쪽을 셈해서 정한다(데이터에 쓰지 않음) · note 아래 글자
  function eqc(o) {
    const it = o.items || (o.l != null ? [o] : []);
    return '<div class="fig-vert fig-eqc">' + it.map(r => { const lv = calc6(r.l), rv = calc6(r.r), okv = !isNaN(lv) && !isNaN(rv) ? lv === rv : null;
      const bx = (t, on) => '<span class="ec-b' + (on ? ' on' : '') + '">' + esc(show6(t)) + '</span>';
      return '<div class="ec-row" data-l="' + (isNaN(lv) ? '' : lv) + '" data-r="' + (isNaN(rv) ? '' : rv) + '" data-ok="' + (okv == null ? '' : okv) + '">' + bx(r.l, r.hl === 'l') + '<span class="ec-eq">=</span>' + bx(r.r, r.hl === 'r') + (r.judge && okv != null ? '<span class="ec-j ' + (okv ? 'ok' : 'no') + '">' + (okv ? '옳아요 ○' : '옳지 않아요 ×') + '</span>' : '') + '</div>'; }).join('') + (o.note ? '<div class="ng-ar">' + esc(o.note) + '</div>' : '') + '</div>';
  }
  Object.assign(HTML_PARTS, { ngrid, eqs, eqc });
  global.KT2_CALC6 = calc6;
  }
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
  global.KT2_FIG = { render, readKo, parts: Object.keys(PARTS).concat(Object.keys(HTML_PARTS), Object.keys(KO_PARTS), Object.keys(SO_PARTS), Object.keys(SC_PARTS), ['panels', 'tools', 'chain', 'places']), icons: Object.keys(ICON), sizes: AL };
})(typeof window !== 'undefined' ? window : globalThis);
