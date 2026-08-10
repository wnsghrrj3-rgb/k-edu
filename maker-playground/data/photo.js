/* ============================================================
   MK_PHOTO — R101 사진 보정·필터: 화면과 내보내기가 같은 그림
   ------------------------------------------------------------
   el.filters 는 R45 부터 스키마·내보내기(render.js SVG)에 있었지만
   UI 도, 워크스페이스 화면 반영도 없었다 — 값을 넣으면 편집 화면엔
   안 보이고 내보내기에만 나오는 반쪽 세계. 이 모듈이 그 정의를
   한 곳으로 모아 워크스페이스·재생·내보내기 세 경로가 같은
   문자열을 쓰게 한다.

   규약 (focal.js 계승):
     · 문서는 기본값을 들고 다니지 않는다 — 기본값이면 키 삭제,
       전부 기본이면 el.filters 자체 삭제. 무보정 문서 바이트 동일.
     · blur 는 **씬 좌표 px 가 정본** — SVG(씬 좌표)는 그대로,
       화면은 표시폭/씬폭 배율을 곱한다. 560px 편집 캔버스와
       1280px 내보내기에서 같은 강도로 보이게 하는 장치.
     · 값 이름은 CSS filter 함수와 1:1 (hueRotate 만 camel) —
       render.js 폴백과 어긋날 수 없는 구조.

   프리셋 = 규칙 기반 조합(지시서 §6·§9) — AI 행세를 하지 않는다.
   ============================================================ */
window.MK_PHOTO = (() => {
  'use strict';

  const R2 = (v) => Math.round(v * 100) / 100;

  /* ---- 보정 축 정의 — UI 슬라이더·정규화·CSS 방출의 단일 원천 ---- */
  const KEYS = [
    { key: 'brightness', label: '밝기',   min: 0.5, max: 1.6, step: 0.01, def: 1, unit: '',   css: (v) => `brightness(${v})` },
    { key: 'contrast',   label: '대비',   min: 0.5, max: 1.6, step: 0.01, def: 1, unit: '',   css: (v) => `contrast(${v})` },
    { key: 'saturate',   label: '채도',   min: 0,   max: 2,   step: 0.01, def: 1, unit: '',   css: (v) => `saturate(${v})` },
    { key: 'grayscale',  label: '흑백',   min: 0,   max: 1,   step: 0.01, def: 0, unit: '',   css: (v) => `grayscale(${v})` },
    { key: 'sepia',      label: '세피아', min: 0,   max: 1,   step: 0.01, def: 0, unit: '',   css: (v) => `sepia(${v})` },
    { key: 'hueRotate',  label: '색조',   min: 0,   max: 360, step: 1,    def: 0, unit: 'deg', css: (v) => `hue-rotate(${v}deg)` },
    { key: 'blur',       label: '흐리게', min: 0,   max: 24,  step: 0.5,  def: 0, unit: 'px', css: (v, s) => `blur(${R2(v * (s || 1))}px)` },
  ];
  const BY = {}; KEYS.forEach((k) => { BY[k.key] = k; });
  /* 슬라이더로 노출하는 축(§5) — 나머지는 프리셋 전용. 30개 설정판 금지(§25). */
  const SLIDERS = ['brightness', 'contrast', 'saturate', 'blur'];

  const num = (v) => { v = +v; return isFinite(v) ? v : null; };

  /* ---- 정규화 — 기본값·무효값·범위 밖을 정리한 사본. 남는 게 없으면 null ---- */
  function norm(filters) {
    if (!filters || typeof filters !== 'object') return null;
    const out = {};
    KEYS.forEach((d) => {
      let v = num(filters[d.key]);
      if (v == null) return;
      v = Math.max(d.min, Math.min(d.max, v));
      if (R2(v) === d.def) return;                     /* 기본값은 들고 다니지 않는다 */
      out[d.key] = R2(v);
    });
    return Object.keys(out).length ? out : null;
  }

  /* ---- CSS filter 문자열 — 세 렌더 경로 공용. scale = 표시폭/씬폭 (blur 만 소비) ---- */
  function css(el, scale) {
    const f = norm(el && el.filters);
    if (!f) return '';
    return KEYS.filter((d) => f[d.key] != null).map((d) => d.css(f[d.key], scale)).join(' ');
  }
  /* 인라인 style 조각 — 값이 있을 때만 ';filter:…' (무보정 바이트 보존) */
  const styleOf = (el, scale) => { const c = css(el, scale); return c ? `;filter:${c}` : ''; };

  /* ---- 프리셋 — 실제로 차이가 명확한 8종만(§6). cool 은 sepia→hue-rotate 반전 트릭 ---- */
  const PRESETS = [
    { id: 'original', name: '원본',     f: {} },
    { id: 'bright',   name: '밝게',     f: { brightness: 1.12, saturate: 1.06 } },
    { id: 'crisp',    name: '선명하게', f: { contrast: 1.18, saturate: 1.16 } },
    { id: 'warm',     name: '따뜻하게', f: { sepia: 0.28, saturate: 1.18, brightness: 1.04 } },
    { id: 'cool',     name: '차갑게',   f: { sepia: 0.16, hueRotate: 180, saturate: 1.25, brightness: 1.02 } },
    { id: 'mono',     name: '흑백',     f: { grayscale: 1, contrast: 1.05 } },
    { id: 'vintage',  name: '빈티지',   f: { sepia: 0.42, contrast: 0.88, brightness: 1.06, saturate: 0.85 } },
    { id: 'soft',     name: '부드럽게', f: { contrast: 0.9, brightness: 1.07, saturate: 0.92 } },
  ];
  const preset = (id) => PRESETS.find((p) => p.id === id) || null;

  /* ---- 쓰기 3종 — 전부 el.filters 만 만지는 제자리 연산 (snap→변경→R 규약에 순종) ---- */
  function setVal(el, key, v) {
    if (!el || !BY[key]) return;
    const f = { ...(el.filters || {}) }; f[key] = v;
    const n = norm(f);
    if (n) el.filters = n; else delete el.filters;
  }
  function apply(el, presetId) {
    if (!el) return;
    const p = preset(presetId); if (!p) return;
    const n = norm(p.f);
    if (n) el.filters = { ...n }; else delete el.filters;
  }
  function reset(el) { if (el) delete el.filters; }

  const isEdited = (el) => !!norm(el && el.filters);
  const valOf = (el, key) => {
    const f = norm(el && el.filters);
    return f && f[key] != null ? f[key] : (BY[key] ? BY[key].def : 0);
  };
  /* 현재 값과 정확히 같은 프리셋 — 칩 선택 표시용 (없으면 null, 무보정 = original) */
  function matchPreset(el) {
    const f = norm(el && el.filters);
    if (!f) return 'original';
    const key = JSON.stringify(f);
    const hit = PRESETS.find((p) => JSON.stringify(norm(p.f)) === key);
    return hit ? hit.id : null;
  }

  /* ---- 자가검증 ---- */
  function verify() {
    const v = [];
    if (norm({ brightness: 1, blur: 0 }) !== null) v.push('기본값이 살아남음');
    const n = norm({ brightness: '1.2', blur: 99, junk: 5 });
    if (!n || n.brightness !== 1.2 || n.blur !== 24 || 'junk' in n) v.push('정규화 오류');
    const el = { filters: { blur: 10 } };
    if (css(el, 0.5) !== 'blur(5px)') v.push('blur 배율 오류: ' + css(el, 0.5));
    if (css(el) !== 'blur(10px)') v.push('blur 무배율 오류');
    if (styleOf({}) !== '') v.push('무보정 비었어야');
    const e2 = {}; apply(e2, 'mono');
    if (!e2.filters || e2.filters.grayscale !== 1) v.push('프리셋 적용 오류');
    if (matchPreset(e2) !== 'mono') v.push('프리셋 역추적 오류');
    apply(e2, 'original');
    if ('filters' in e2) v.push('원본 프리셋이 키를 남김');
    setVal(e2, 'contrast', 1.3);
    if (!isEdited(e2) || valOf(e2, 'contrast') !== 1.3) v.push('setVal 오류');
    setVal(e2, 'contrast', 1);
    if ('filters' in e2) v.push('기본 복귀 시 키 잔존');
    if (matchPreset({ filters: null }) !== 'original') v.push('무보정 ≠ original');
    PRESETS.forEach((p) => { const x = {}; apply(x, p.id); if (p.id !== 'original' && !isEdited(x)) v.push('프리셋 무효: ' + p.id); });
    return { ok: !v.length, violations: v };
  }

  return { KEYS, BY, SLIDERS, PRESETS, norm, css, styleOf, preset, setVal, apply, reset, isEdited, valOf, matchPreset, verify };
})();
