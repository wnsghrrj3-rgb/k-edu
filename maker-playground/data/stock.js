/* ============================================================
   MK_STOCK (R44) — 내장 생성 그래픽 재료 라이브러리
   ------------------------------------------------------------
   실사 스톡 API 없이 성립하는 진짜 재료: SVG 절차 생성.
   (선례: MK_AUDIO 합성 3종 — 음원 0으로 실재생. 같은 철학)
   · 전 재료 결정론(같은 id = 같은 그림) — 기계검증 가능
   · search(한국어 키워드) · srcOf(id)=dataURL · 저작권 걱정 0
   ============================================================ */
window.MK_STOCK = (() => {
  'use strict';
  const W = 640, H = 360;

  /* 결정론 난수 — id 해시 시드 */
  const hash = (s) => { let h2 = 2166136261; for (let i = 0; i < s.length; i++) { h2 ^= s.charCodeAt(i); h2 = Math.imul(h2, 16777619); } return h2 >>> 0; };
  const rng = (seed) => { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  const svg = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}${body}</svg>`;
  const grad = (id, a, b, ang) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${ang === 90 ? 0 : 1}" y2="${ang === 90 ? 1 : 0.35}"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;

  /* ---------- 생성기 ---------- */
  const G = {
    grad: (o) => () => svg(grad('g', o.a, o.b, o.ang || 0)),
    dots: (o) => (r) => { let s = ''; for (let y = 20; y < H; y += 44) for (let x = 20 + (y / 44 % 2) * 22; x < W; x += 44) s += `<circle cx="${x}" cy="${y}" r="${o.r || 4}" fill="${o.c}" opacity="${o.op || 0.5}"/>`; return svg(s, o.bg); },
    grid: (o) => () => { let s = ''; for (let x = 0; x <= W; x += 40) s += `<path d="M${x} 0V${H}" stroke="${o.c}" stroke-width="1"/>`; for (let y = 0; y <= H; y += 40) s += `<path d="M0 ${y}H${W}" stroke="${o.c}" stroke-width="1"/>`; return svg(s, o.bg); },
    stripe: (o) => () => { let s = ''; for (let i = -H; i < W + H; i += 34) s += `<path d="M${i} ${H}L${i + H} 0" stroke="${o.c}" stroke-width="${o.w || 10}" opacity="${o.op || 0.35}"/>`; return svg(s, o.bg); },
    wave: (o) => () => { let s = ''; for (let k = 0; k < 4; k++) { const y0 = 90 + k * 70; let d = `M0 ${y0}`; for (let x = 0; x <= W; x += 40) d += ` Q${x + 10} ${y0 + (x / 40 % 2 ? 18 : -18)} ${x + 40} ${y0}`; s += `<path d="${d}" fill="none" stroke="${o.c}" stroke-width="3" opacity="${0.55 - k * 0.1}"/>`; } return svg(s, o.bg); },
    scatter: (o) => (r) => { let s = ''; const n = o.n || 46; for (let i = 0; i < n; i++) { const x = r() * W, y = r() * H, k = o.min + r() * (o.max - o.min), c = o.cs[Math.floor(r() * o.cs.length)]; if (o.shape === 'petal') s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(k * 1.5).toFixed(1)}" ry="${k.toFixed(1)}" fill="${c}" opacity="${(0.5 + r() * 0.4).toFixed(2)}" transform="rotate(${Math.floor(r() * 360)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; else if (o.shape === 'star') { s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${k.toFixed(1)}" fill="${c}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`; } else if (o.shape === 'rect') s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(k * 2).toFixed(1)}" height="${k.toFixed(1)}" fill="${c}" opacity="0.85" transform="rotate(${Math.floor(r() * 360)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; else s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${k.toFixed(1)}" fill="${c}" opacity="${(0.45 + r() * 0.4).toFixed(2)}"/>`; } return svg(s, o.bg); },
    burst: (o) => (r) => { let s = ''; for (let b = 0; b < 3; b++) { const cx = 120 + b * 200, cy = 100 + (b % 2) * 140; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, L = 30 + r() * 34; s += `<path d="M${cx} ${cy}l${(Math.cos(a) * L).toFixed(1)} ${(Math.sin(a) * L).toFixed(1)}" stroke="${o.cs[(b + i) % o.cs.length]}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`; } } return svg(s, o.bg); },
    frame: (o) => () => svg(`<rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="${o.rx || 18}" fill="none" stroke="${o.c}" stroke-width="${o.w || 5}"/>${o.inner ? `<rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="${(o.rx || 18) - 6}" fill="none" stroke="${o.c}" stroke-width="1.5" opacity="0.55"/>` : ''}`, o.bg),
    corner: (o) => () => { const L = 78, w2 = 7; const p = (x, y, sx, sy) => `<path d="M${x + sx * L} ${y}H${x}V${y + sy * L}" fill="none" stroke="${o.c}" stroke-width="${w2}" stroke-linecap="round"/>`; return svg(p(30, 30, 1, 1) + p(W - 30, 30, -1, 1) + p(30, H - 30, 1, -1) + p(W - 30, H - 30, -1, -1), o.bg); },
    ribbon: (o) => () => svg(`<path d="M90 130h460l-26 50 26 50H90l26-50z" fill="${o.c}"/><text x="${W / 2}" y="192" font-family="sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" text-anchor="middle">여기에 문구</text>`, o.bg),
    badge: (o) => () => svg(`<circle cx="${W / 2}" cy="${H / 2}" r="120" fill="${o.c}"/><circle cx="${W / 2}" cy="${H / 2}" r="104" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.75"/><text x="${W / 2}" y="${H / 2 + 12}" font-family="sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" text-anchor="middle">칭찬</text>`),
    bubble: (o) => () => svg(`<rect x="80" y="70" width="480" height="170" rx="34" fill="${o.c}"/><path d="M200 240l-26 56 74-56z" fill="${o.c}"/>`),
  };

  /* ---------- 라이브러리 (36종) ---------- */
  const P = { pink: '#F5B7C5', pink2: '#FADDE4', mint: '#7FB4A6', navy: '#182230', gold: '#E9C46A', coral: '#E8735A', green: '#2F6B54', sky: '#BFD9EA' };
  const LIB = [
    /* 배경 그라디언트 12 */
    { id: 'bg-sky',    name: '맑은 하늘',   cat: '배경', tags: ['하늘', '파랑', '맑음', '배경'], make: G.grad({ a: '#CDE7F5', b: '#EAF5FB' }) },
    { id: 'bg-sunset', name: '노을',        cat: '배경', tags: ['노을', '주황', '저녁', '배경'], make: G.grad({ a: '#F7B267', b: '#F4845F', ang: 90 }) },
    { id: 'bg-mint',   name: '민트 안개',   cat: '배경', tags: ['민트', '초록', '차분', '배경'], make: G.grad({ a: '#DDEFE9', b: '#F4FAF8' }) },
    { id: 'bg-forest', name: '깊은 숲',     cat: '배경', tags: ['숲', '초록', '진한', '배경'], make: G.grad({ a: '#1E3A2E', b: '#2F6B54', ang: 90 }) },
    { id: 'bg-lav',    name: '라벤더',      cat: '배경', tags: ['보라', '라벤더', '배경'], make: G.grad({ a: '#E4DDF4', b: '#F6F2FC' }) },
    { id: 'bg-night',  name: '깊은 밤',     cat: '배경', tags: ['밤', '어두움', '남색', '배경'], make: G.grad({ a: '#10161F', b: '#233247', ang: 90 }) },
    { id: 'bg-peach',  name: '복숭아',      cat: '배경', tags: ['복숭아', '분홍', '따뜻', '배경'], make: G.grad({ a: '#FBE3DA', b: '#FDF3EE' }) },
    { id: 'bg-sand',   name: '모래빛',      cat: '배경', tags: ['모래', '베이지', '크라프트', '배경'], make: G.grad({ a: '#EFE5D0', b: '#F8F3E9' }) },
    { id: 'bg-sea',    name: '바다',        cat: '배경', tags: ['바다', '파랑', '시원', '배경'], make: G.grad({ a: '#2F6690', b: '#8AB8D6', ang: 90 }) },
    { id: 'bg-berry',  name: '딸기우유',    cat: '배경', tags: ['분홍', '딸기', '달콤', '배경'], make: G.grad({ a: '#F7CBD6', b: '#FCEDF1' }) },
    { id: 'bg-ink',    name: '잉크',        cat: '배경', tags: ['잉크', '검정', '진지', '배경'], make: G.grad({ a: '#1F2733', b: '#39465A', ang: 90 }) },
    { id: 'bg-cream',  name: '크림',        cat: '배경', tags: ['크림', '아이보리', '종이', '배경'], make: G.grad({ a: '#FBF7F0', b: '#F3EDE2' }) },
    /* 패턴 8 */
    { id: 'pt-dots',   name: '도트',        cat: '패턴', tags: ['도트', '점', '패턴'], make: G.dots({ c: '#8FB6C9', bg: '#F2F8FB' }) },
    { id: 'pt-dots-w', name: '밤의 도트',   cat: '패턴', tags: ['도트', '점', '어두움', '패턴'], make: G.dots({ c: '#5C7391', bg: '#182230', op: 0.7 }) },
    { id: 'pt-grid',   name: '모눈 격자',   cat: '패턴', tags: ['격자', '모눈', '노트', '패턴'], make: G.grid({ c: '#DCE6EE', bg: '#FFFFFF' }) },
    { id: 'pt-grid-g', name: '칠판 격자',   cat: '패턴', tags: ['격자', '칠판', '초록', '패턴'], make: G.grid({ c: '#3C6B58', bg: '#2F5748' }) },
    { id: 'pt-stripe', name: '사선',        cat: '패턴', tags: ['사선', '스트라이프', '패턴'], make: G.stripe({ c: '#F0C9A8', bg: '#FDF6EE' }) },
    { id: 'pt-wave',   name: '물결',        cat: '패턴', tags: ['물결', '파도', '패턴'], make: G.wave({ c: '#7FB4C9', bg: '#F1F8FB' }) },
    { id: 'pt-tri',    name: '색종이 조각', cat: '패턴', tags: ['삼각', '색종이', '조각', '패턴'], make: G.scatter({ shape: 'rect', n: 30, min: 6, max: 12, cs: ['#E8735A', '#E9C46A', '#7FB4A6', '#8AB8D6'], bg: '#FFFDF8' }) },
    { id: 'pt-mint',   name: '민트 방울',   cat: '패턴', tags: ['방울', '민트', '패턴'], make: G.scatter({ n: 34, min: 4, max: 14, cs: ['#7FB4A6', '#A8CDC2', '#D3E7E0'], bg: '#F4FAF8' }) },
    /* 계절·파티클 8 */
    { id: 'ss-sakura', name: '벚꽃',        cat: '계절', tags: ['벚꽃', '봄', '꽃잎', '분홍'], make: G.scatter({ shape: 'petal', n: 40, min: 5, max: 11, cs: [P.pink, P.pink2, '#F8CBD5'], bg: '#FEF6F8' }) },
    { id: 'ss-snow',   name: '함박눈',      cat: '계절', tags: ['눈', '겨울', '함박눈'], make: G.scatter({ n: 52, min: 2.5, max: 7, cs: ['#FFFFFF', '#E8F1F8'], bg: '#22314A' }) },
    { id: 'ss-leaf',   name: '가을 낙엽',   cat: '계절', tags: ['낙엽', '가을', '단풍'], make: G.scatter({ shape: 'petal', n: 34, min: 6, max: 12, cs: ['#D98E4A', '#C4573F', '#E9C46A'], bg: '#FBF4E8' }) },
    { id: 'ss-star',   name: '별밤',        cat: '계절', tags: ['별', '밤', '별밤', '우주'], make: G.scatter({ shape: 'star', n: 60, min: 1.2, max: 4, cs: ['#FFFFFF', '#FFE9A8', '#BFD3F0'], bg: '#10161F' }) },
    { id: 'ss-rain',   name: '봄비',        cat: '계절', tags: ['비', '봄비', '물방울'], make: G.scatter({ n: 44, min: 2, max: 5, cs: ['#8AB8D6', '#B9D5E8'], bg: '#EBF3F8' }) },
    { id: 'ss-sprout', name: '새싹',        cat: '계절', tags: ['새싹', '봄', '초록'], make: G.scatter({ n: 30, min: 4, max: 9, cs: ['#79A98B', '#A9C8B4', '#2F6B54'], bg: '#F3F9F5' }) },
    { id: 'ss-fire',   name: '불꽃놀이',    cat: '계절', tags: ['불꽃', '축제', '폭죽'], make: G.burst({ cs: ['#E9C46A', '#E8735A', '#7FB4A6', '#8AB8D6'], bg: '#141B26' }) },
    { id: 'ss-confetti', name: '컨페티',    cat: '계절', tags: ['컨페티', '파티', '축하'], make: G.scatter({ shape: 'rect', n: 44, min: 4, max: 9, cs: ['#E8735A', '#E9C46A', '#7FB4A6', '#8E4A97', '#8AB8D6'], bg: '#FFFFFF' }) },
    /* 장식 8 */
    { id: 'dc-frame',  name: '라운드 액자', cat: '장식', tags: ['액자', '프레임', '테두리'], make: G.frame({ c: '#8A7A55', bg: '#FDFBF6', inner: true }) },
    { id: 'dc-frame-n',name: '네이비 액자', cat: '장식', tags: ['액자', '프레임', '남색'], make: G.frame({ c: '#7FB4A6', bg: '#182230' }) },
    { id: 'dc-corner', name: '모서리 프레임', cat: '장식', tags: ['모서리', '프레임', '포인트'], make: G.corner({ c: '#2F6B54', bg: '#FFFFFF' }) },
    { id: 'dc-ribbon', name: '리본 배너',   cat: '장식', tags: ['리본', '배너', '제목'], make: G.ribbon({ c: '#C4573F', bg: '#FDF8F0' }) },
    { id: 'dc-badge',  name: '칭찬 뱃지',   cat: '장식', tags: ['뱃지', '칭찬', '스티커'], make: G.badge({ c: '#2F6B54' }) },
    { id: 'dc-badge-g',name: '금빛 뱃지',   cat: '장식', tags: ['뱃지', '금색', '상장'], make: G.badge({ c: '#B9912F' }) },
    { id: 'dc-bubble', name: '말풍선',      cat: '장식', tags: ['말풍선', '대화'], make: G.bubble({ c: '#EAF2EE' }) },
    { id: 'dc-under',  name: '형광 밑줄',   cat: '장식', tags: ['밑줄', '형광', '강조'], make: () => svg(`<rect x="60" y="150" width="520" height="56" rx="12" fill="#FFE9A8"/><rect x="60" y="196" width="520" height="10" rx="5" fill="#E9C46A"/>`) },
  ];

  const CACHE = {};
  const get = (id) => LIB.find((x) => x.id === id) || null;
  function svgOf(id) { const it = get(id); if (!it) return null; if (!CACHE[id]) CACHE[id] = it.make(rng(hash(id))); return CACHE[id]; }
  function srcOf(id) { const s = svgOf(id); return s ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) : null; }
  function search(q) {
    const s = String(q || '').trim().toLowerCase();
    if (!s) return LIB.slice();
    return LIB.filter((x) => x.name.toLowerCase().includes(s) || x.cat.includes(s) || x.tags.some((t2) => t2.toLowerCase().includes(s)));
  }
  function audit() {
    const bad = [];
    LIB.forEach((x) => {
      const a = x.make(rng(hash(x.id))), b = x.make(rng(hash(x.id)));
      if (a !== b) bad.push(x.id + ':nondeterministic');
      if (!/^<svg /.test(a) || !a.endsWith('</svg>')) bad.push(x.id + ':svg');
      if (!x.tags.length || !x.name) bad.push(x.id + ':meta');
    });
    return { ok: !bad.length, violations: bad, count: LIB.length };
  }
  return { LIB, get, svgOf, srcOf, search, audit, size: { w: W, h: H } };
})();
