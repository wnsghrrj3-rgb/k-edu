/* ============================================================
   케이메이커 템플릿 생성기 코어 (generator.js · 7번째 엔진)
   ------------------------------------------------------------
   SPEC: handoff/kmake/SPEC_생성기_구현.md (M1-0)
   순수 결정론 — seeds가 같으면 결과가 완전히 같다(재현·검증 전제).
   브라우저: window.KM_GEN.generate(...) / node: module.exports (스모크)
   ⚠ 공식·상수(색 L 계단, 0.72/0.94/14)는 여기 고정 — 데이터는 skeletons.js
   ============================================================ */
(function () {
  'use strict';

  // ── 결정론 RNG (물감 SPEC §6과 동일 mulberry32) ──
  function mulberry32(seed) {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rngStream(seed) {          // 시드 하나 → 반복 호출 스트림
    let s = seed >>> 0;
    return function () { s = (s + 0x9e3779b9) >>> 0; return mulberry32(s); };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  function newSeeds() {
    var out = {}, keys = ['sk', 'co', 'fo', 'ma', 'mo'];
    var buf;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      buf = new Uint32Array(5); crypto.getRandomValues(buf);
    } else { buf = keys.map(function () { return (Math.random() * 0xffffffff) >>> 0; }); }
    keys.forEach(function (k, i) { out[k] = buf[i] >>> 0; });
    return out;
  }
  function rerollSeeds(seeds, which) { // 부분 재추첨 = 해당 시드만 재발급(§0)
    var s = Object.assign({}, seeds), fresh = newSeeds();
    if (which === 'all') return fresh;
    if (which === 'color') s.co = fresh.co;
    else if (which === 'font') s.fo = fresh.fo;
    else if (which === 'material') s.ma = fresh.ma;
    return s;
  }

  // ── 색: HSL→hex, WCAG 대비 ──
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360; var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r, g, b;
    if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; } else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }
  function hex(rgb) { return '#' + rgb.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''); }
  function hslHex(h, s, l) { return hex(hsl2rgb(h, s, l)); }
  function hex2rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.slice(0, 2), 16), parseInt(hx.slice(2, 4), 16), parseInt(hx.slice(4, 6), 16)]; }
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(rgb) { return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]); }
  function contrast(a, b) { var L1 = lum(hex2rgb(a)) + 0.05, L2 = lum(hex2rgb(b)) + 0.05; return L1 > L2 ? L1 / L2 : L2 / L1; }

  // ② 색 하모니 — L 계단 .92/.74/.58/.40/.24 고정, 방식은 H(·S)만 결정
  function colorHarmony(seedCo, kitColor) {
    var r = rngStream(seedCo);
    var baseH = kitColor && typeof kitColor.h === 'number' ? kitColor.h : Math.floor(r() * 360);
    var S = 0.52, mode = Math.floor(r() * 4);   // 0 단색 1 유사 2 보색완화 3 3색조
    var accentH = baseH, accentS = S;
    if (mode === 1) accentH = (baseH + 30) % 360;
    else if (mode === 2) { accentH = (baseH + 180) % 360; accentS = Math.max(0, S - 0.25); }
    else if (mode === 3) accentH = (baseH + 120) % 360;
    var roles = {
      bg:      hslHex(baseH,  S * 0.55, 0.92),
      sub:     hslHex(baseH,  S,        0.74),
      primary: hslHex(baseH,  S,        0.58),
      accent:  hslHex(accentH, accentS, 0.40),
      ink:     hslHex(baseH,  S,        0.24),
    };
    // 잉크 게이트: ink↔bg 대비 <4.5 → 대비 큰 쪽으로 강제
    if (contrast(roles.ink, roles.bg) < 4.5) {
      roles.ink = contrast('#1d2733', roles.bg) >= contrast('#FFFFFF', roles.bg) ? '#1d2733' : '#FFFFFF';
    }
    roles._mode = mode; roles._h = baseH;
    return roles;
  }

  // ③ 폰트 페어링 — kind·mood 교집합, body는 본문·명조만(하드 규칙)
  function fontPairing(kind, seedFo, PAIRS, KIND_MOOD, BODY_FONTS) {
    var mood = (KIND_MOOD[kind] || []).concat([kind]);
    var cands = PAIRS.filter(function (p) { return p.mood.some(function (m) { return mood.indexOf(m) >= 0; }); });
    if (!cands.length) cands = [{ title: 'Hakgyoansim Moheomga', body: 'Gowun Dodum' }];
    // 하드 규칙 방어: body가 본문·명조 아니면 기본 body로 치환
    cands = cands.map(function (p) {
      return BODY_FONTS.indexOf(p.body) >= 0 ? p : { title: p.title, body: 'Gowun Dodum', mood: p.mood };
    });
    var r = rngStream(seedFo);
    return pick(r, cands);
  }

  // ④ 재료 매칭 (레지스트리 카테고리·이름 → 후보 추첨. 미입고면 null → 폴백)
  function findMaterial(keyword, seedMa, MATERIALS) {
    if (!MATERIALS || !MATERIALS.length || !keyword) return null;
    var kw = keyword.replace(/[·\s]/g, '');
    var cands = MATERIALS.filter(function (m) {
      var hay = (m.n || '') + (m.k || '');
      return kw.split('').some(function () { return true; }) && hay.replace(/[·\s]/g, '').indexOf(kw.slice(0, 2)) >= 0;
    });
    if (!cands.length) return null;
    return pick(rngStream(seedMa), cands);
  }

  var SAFE_EMOJI = ['🏆', '🎖️', '🌟', '📚', '🎨'];
  var COLOR_ROLE = { title: 'accent', name: 'primary', body: 'ink', date: 'sub' };

  // ⑦ 조립 — zones 순서대로 fabric 오브젝트(결정론 순서)
  function assemble(kind, seeds, preset, deps) {
    var SK = deps.SKELETONS, PAIRS = deps.FONT_PAIRS, KIND_MOOD = deps.KIND_MOOD,
        BODY_FONTS = deps.BODY_FONTS, MOTION = deps.GEN_MOTION, MATERIALS = deps.MATERIALS,
        measure = deps.measure;
    var W = preset.w, H = preset.h;

    // ① 골격
    var list = SK[kind]; if (!list || !list.length) throw new Error('골격 없음: ' + kind);
    var skel = pick(rngStream(seeds.sk), list);
    // ② 색
    var col = colorHarmony(seeds.co, deps.kitColor);
    // ③ 폰트
    var pair = fontPairing(kind, seeds.fo, PAIRS, KIND_MOOD, BODY_FONTS);
    // ⑤ 모션표
    var motion = MOTION[kind] || {};
    var globalFx = motion._global || null, globalUsed = false;
    var useMotionBg = motion.motionBg || null;

    var objects = [], canvasBg = col.bg;
    var emojiRng = rngStream(seeds.ma ^ 0x5bd1e995);

    function fontFor(role) { return (role === 'title' || role === 'name') ? pair.title : pair.body; }
    function fillFor(role) { return col[COLOR_ROLE[role] || 'ink'] || col.ink; }
    function px(rect) { return { l: rect[0] * W, t: rect[1] * H, w: rect[2] * W, h: rect[3] * H }; }
    function animOf(zn, isTextName) {
      var m = motion[zn.z] || {};
      var fx = m.fx || 'none';
      if (!m.fx && globalFx && !globalUsed && (zn.z === 'name' || zn.z === 'title')) { fx = globalFx; globalUsed = true; }
      return { in: { type: m.in || 'fadeIn', delay: 0 }, loop: { type: m.loop || 'none' }, fx: { type: fx } };
    }

    skel.zones.forEach(function (zn) {
      var r = px(zn.rect);
      // ── 배경 존
      if (zn.z === 'bg' || zn.material === '배경') {
        if (useMotionBg) { canvasBg = 'rgba(255,255,255,0)'; }   // 모션 배경 → 투명
        else { canvasBg = col.bg; }                              // 단색 폴백(이미지 배경은 M1-1 확장)
        return;
      }
      // ── 재료 존(테두리·엠블럼·도장)
      if (zn.material) {
        var isFrame = /테두리|프레임/.test(zn.material);
        if (isFrame) {
          objects.push({ type: 'rect', left: r.l, top: r.t, width: r.w, height: r.h,
            fill: 'rgba(0,0,0,0)', stroke: col.accent, strokeWidth: Math.max(2, W * 0.008),
            rx: Math.min(r.w, r.h) * 0.05, ry: Math.min(r.w, r.h) * 0.05,
            originX: 'left', originY: 'top', kmType: 'deco', selectable: true, evented: true });
        } else { // 엠블럼·도장 = 원판 + 안전 이모지
          var cx = r.l + r.w / 2, cy = r.t + r.h / 2, rad = Math.min(r.w, r.h) / 2;
          objects.push({ type: 'circle', left: cx, top: cy, radius: rad,
            originX: 'center', originY: 'center', fill: col.sub, kmType: 'deco',
            selectable: true, evented: true });
          objects.push({ type: 'textbox', text: pick(emojiRng, SAFE_EMOJI),
            left: cx, top: cy, width: rad * 2, originX: 'center', originY: 'center',
            fontSize: rad * 1.1, fontFamily: 'Gowun Dodum', fill: col.ink, textAlign: 'center',
            lineHeight: 1.0, anim: animOf(zn) });
        }
        return;
      }
      // ── 텍스트 존
      if (zn.text != null) {
        var role = zn.font || 'body';
        var ff = fontFor(role), fill = fillFor(role);
        var size = Math.max(14, r.h * 0.72);
        var maxW = r.w * 0.96;
        if (typeof measure === 'function') {
          var guard = 0;
          while (measure(zn.text, size, ff, maxW) > maxW && size > 14 && guard++ < 40) size *= 0.94;
          size = Math.max(14, size);
        }
        var o = { type: 'textbox', text: zn.text,
          left: r.l + r.w / 2, top: r.t, width: maxW,
          originX: 'center', originY: 'top', fontSize: Math.round(size),
          fontFamily: ff, fill: fill, textAlign: 'center', lineHeight: 1.4,
          anim: animOf(zn) };
        if (zn.slot) o.kmSlot = { on: true };
        objects.push(o);
      }
    });

    var dur = kind === 'card' || kind === 'poster' ? 5 : 4;
    return {
      v: 4, baseW: W, baseH: H, audience: preset._aud || 'teacher', cur: 0,
      scenes: [{ canvas: { version: '5.3.0', background: canvasBg, objects: objects },
                 motionBg: useMotionBg, dur: dur, transition: 'fade' }],
      kmGen: { kind: kind, seeds: { sk: seeds.sk, co: seeds.co, fo: seeds.fo, ma: seeds.ma, mo: seeds.mo } },
    };
  }

  // 진입점: 부분 재추첨은 seeds 교체 후 전체 재실행(§0 — 패치 금지)
  function generate(kind, seeds, preset, opts) {
    opts = opts || {};
    var deps = {
      SKELETONS: opts.SKELETONS || (typeof window !== 'undefined' ? window.KM_SKELETONS : null),
      FONT_PAIRS: opts.FONT_PAIRS || (typeof window !== 'undefined' ? window.KM_FONT_PAIRS : null),
      KIND_MOOD: opts.KIND_MOOD || (typeof window !== 'undefined' ? window.KM_KIND_MOOD : null),
      BODY_FONTS: opts.BODY_FONTS || (typeof window !== 'undefined' ? window.KM_BODY_FONTS : null),
      GEN_MOTION: opts.GEN_MOTION || (typeof window !== 'undefined' ? window.KM_GEN_MOTION : null),
      MATERIALS: opts.MATERIALS != null ? opts.MATERIALS : (typeof window !== 'undefined' ? window.MATERIALS : []),
      measure: opts.measure || null,
      kitColor: opts.kitColor || null,
    };
    return assemble(kind, seeds, preset, deps);
  }

  var API = { generate: generate, newSeeds: newSeeds, rerollSeeds: rerollSeeds,
              colorHarmony: colorHarmony, contrast: contrast, hslHex: hslHex,
              mulberry32: mulberry32, KINDS: ['award', 'card', 'worksheet', 'nametag', 'notice', 'poster'] };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.KM_GEN = API;
})();
